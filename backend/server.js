const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
app.use(express.json());
app.use(express.static('frontend/public'));
const { Server } = require('socket.io');
const io = new Server(httpServer);
const { MongoClient } = require('mongodb');
const childProc = require("child_process");
const { addEvent, printWithTimestamp } = require('./common');
const config = require('./config');

// when changing the port, make sure to update the port in DSIM_APP_HOST in frontend/public/index.html
const APP_PORT = process.env.PORT || 8080;
const QUERY_DB = 'sample_training';
const QUERY_COLLECTION = 'grades';
const REQUESTLOG_DB = 'dsim';
const REQUESTLOG_COLLECTION = 'logs';
const NR_THREADS = 1;
const QUERY_TYPES = ['findOne', 'insertOne'];
const SLOW_QUERY_TRESHOLD = 100;

let mongoClient;
let isRunning = false;
let clusterType; // 'local' || 'atlas' - set if you don't want to auto-detect
let minDate;
let threads = [];
let requestLog = {};
const nodeTypes = {};

// need to init mongo client here as it's being passed to atlasCluster and localCluster modules
mongoClient = new MongoClient(config.connectionString);
// auto detect if Atlas cluster or local cluster is configured
if (!clusterType && config.atlasCluster && config.atlasCluster.groupId && 
    config.atlasCluster.clusterName && config.atlasCluster.apiKeyPublic && 
    config.atlasCluster.apiKeyPrivate && config.connectionString.indexOf('mongodb.net') !== -1) {
  clusterType = 'atlas';
  require('./atlasCluster')(app, io, config.atlasCluster);
} else {
  clusterType = 'local';
  require('./localCluster')(app, io, mongoClient);
}
console.log(`Cluster type is ${clusterType}`);

app.get('/start', (req, res) => {
  if (!isRunning) {
    const resume = req.query.resume === 'true' ? true : false;
    const options = {
      retryReads: !req.query.hasOwnProperty('retryReads') || req.query.retryReads === 'true' ? true : false,
      retryWrites: !req.query.hasOwnProperty('retryWrites') || req.query.retryWrites === 'true' ? true : false,
      readPreference: req.query.hasOwnProperty('readPreference') ? req.query.readPreference : 'primary',
      readConcernLevel: req.query.hasOwnProperty('readConcern') ? req.query.readConcern : 'local',
      w: req.query.hasOwnProperty('writeConcern') ? req.query.writeConcern : 'majority'
    };
    start(resume, options);
    res.send(`Started with retryReads=${options.retryReads}, retryWrites=${options.retryWrites}, ` +
             `readPreference=${options.readPreference}, readConcern=${options.readConcernLevel} & ` +
             `writeConcern=${options.w}`);
  } else {
    res.send('Already running!');
  }
});

app.get('/stop', (req, res) => {
  if (isRunning) {
    stop();
    res.send("Stopped");
  } else {
    res.send("Already stopped");
  }
});

app.get('/getClusterType', (req, res) => res.send(clusterType));

app.get('/rsConfig', async (req, res) => {
  try {
    const rsConf = await mongoClient.db('local').collection('system.replset').findOne();
    res.json(rsConf);
  } catch (e) {
    res.status(500).send(`Error running rs.config command: ${e}`);
  }
});

async function start(resume, options) {
  if (!resume) {
    // set minDate which is used to query for latency stats on recent data only
    minDate = new Date();
    minDate = new Date(minDate.setSeconds(minDate.getSeconds() + 3));
  }

  threads = [];
  threadCount = 0;
  for (let i = 0; i < NR_THREADS; i++) {
    // run inserts and finds in seperate threads, 
    // otherwise only one query type will show as being slow/failing
    for (const [j, queryType] of QUERY_TYPES.entries()) {
      console.log(JSON.stringify(options));
      const thread = childProc.fork('./backend/queryMongo.js', [JSON.stringify(options), queryType]);
      threads[threadCount] = thread;
      thread.on('error', (e) => {
        printWithTimestamp(`Error while running child query process: ${e}`);
      });
      // listen for slow or failed requests
      thread.on('message', async (msg) => {
        if (msg && msg.request) {
          await processRequest(msg.request);
        }
      });
      threadCount++;
    }
  }

  printWithTimestamp(`Started querying with retryReads=${options.retryReads}, retryWrites=${options.retryWrites}, ` +
                     `readPreference=${options.readPreference} readConcern=${options.readConcernLevel} & ` +
                     `writeConcern=${options.w}`);
  isRunning = true;
}

function stop() {
  for (let thread of threads) {
    if (thread && typeof thread.kill === 'function') {
      thread.kill();
    }
  }

  printWithTimestamp("Stopped querying...");
  isRunning = false;
}

async function createIndexes(mongoClient) {
  const queryCollection = mongoClient.db(QUERY_DB).collection(QUERY_COLLECTION);
  queryCollection.createIndex({ student_id: 1 });
  const statsCollection = mongoClient.db(REQUESTLOG_DB).collection(REQUESTLOG_COLLECTION);
  await statsCollection.createIndex({ ts: 1, latency: 1 });
  await statsCollection.createIndex({ ts: 1, success: 1 });
}

async function generateSampleData(mongoClient) {
  const collection = mongoClient.db(QUERY_DB).collection(QUERY_COLLECTION);
  const stats = await collection.stats();
  if (stats && stats.count === 0) {
    const docs = [];
    for (let i = 1; i < 10000; i++) {
      docs.push(generateInsertDoc(i));
    }
    await collection.insertMany(docs);
  }
}

async function processRequest(request) {
  if (request.ts) {
    // request object is received as JSON, so date is a string and needs to be converted
    request.ts = new Date(request.ts);
  }

  if (!request.success || request.latency >= SLOW_QUERY_TRESHOLD) {
    io.emit('logSlowFailedRequest', request);
  }
  
  const operation = request.operation;

  if (request.success) {
    // initialize request log
    if (!requestLog.hasOwnProperty(operation)) {
      requestLog[operation] = { ...request };
      requestLog[operation].latency = [];
    }

    // create logs and send updates every second
    if (request.ts.toLocaleTimeString() !== requestLog[operation].ts.toLocaleTimeString()) {
      // create copy of requestLog object so it can be reset for any concurrent requests coming in
      const requestLogCopy = { ...requestLog[operation] };
      requestLog[operation] = { ...request };
      requestLog[operation].latency = [];
      io.emit('logRequest', requestLogCopy);
      await storeRequest(requestLogCopy)
    }

    requestLog[operation].latency.push(request.latency);
  } else {
    await storeRequest(request);
  }
}

async function storeRequest(request) {
  const collection = mongoClient.db(REQUESTLOG_DB).collection(REQUESTLOG_COLLECTION);
  try {
    await collection.insertOne(request);
    printWithTimestamp("Logged request");
    updateStats();
  } catch (e) {
    printWithTimestamp(`Error while logging request: ${e}`);
  }
}

async function updateStats() {
  try {
    const collection = mongoClient.db(REQUESTLOG_DB).collection(REQUESTLOG_COLLECTION);
    const stats = await collection.aggregate([
      { $match: { success: true, ts: { $gt: minDate } } },
      { $unwind: { path: "$latency" } },
      { $group: { _id: null, avg: { $avg: "$latency" }, max: { $max: "$latency" } } }
    ]).toArray();
    io.emit('updateStats', stats);
  } catch (e) {
    printWithTimestamp(`Error while updating stats: ${e}`);
  }
}

function onNodeChange(event) {
  try {
    const address = event.address;
    const oldType = modifyTypeName(event.previousDescription.type);
    const newType = modifyTypeName(event.newDescription.type);
    if (oldType !== newType && newType !== 'RSOther') {
      // store types so they can be retrieved when front-end initializes
      nodeTypes[address] = { oldType: oldType, newType: newType };
      addEvent(`Node '${address.split(':')[0]}' changed from ${oldType} to ${newType}`, io);
      io.emit('updateNodeType', {
        address: address,
        newType: newType,
        oldType: oldType
      });
    }
  } catch (e) {
    console.log(`Could not emit node changes: ${e}`);
  }
}

function modifyTypeName(type) {
  switch (type) {
    case 'RSPrimary':
      return 'Primary';
    case 'RSSecondary':
      return 'Secondary';
    case 'RSOther':
      return 'Other';
    default:
      return type;
  }
}

function addWsListeners() {
  io.on('connection', (socket) => {
    // front-end retrieves latest node types/status during initialization
    socket.on('getNodeTypes', () => {
      for (node in nodeTypes) {
        io.emit('updateNodeType', {
          address: node,
          oldType: nodeTypes[node].oldType,
          newType: nodeTypes[node].newType,
          init: true
        });
      }
    });
    // stop querying when WS connection is closed
    socket.on('disconnect', () => {
      if (isRunning) {
        stop();
      }
    });
  });
}

httpServer.listen(APP_PORT, () => {
  mongoClient.on('serverDescriptionChanged', event => {
    onNodeChange(event);
  });
  generateSampleData(mongoClient);
  createIndexes(mongoClient);
  
  addWsListeners();

  console.log(`listening on ${APP_PORT}`);
});
