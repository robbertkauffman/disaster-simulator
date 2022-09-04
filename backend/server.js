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
const Docker = require('dockerode');
const dockerSocketPath = process.env.DOCKER_HOST || '/Users/robbert.kauffman/.local/share/containers/podman/machine/podman-machine-default/podman.sock';

// Change these:
const CONNECTION_STRING = 'mongodb://mongo1:27017,mongo2:27018,mongo3:27019/myFirstDatabase?replicaSet=myReplicaSet';
const CONNECTION_STRING_STATS = '' || CONNECTION_STRING;
// Do not change these:
const APP_PORT = process.env.PORT || 8080;
const QUERY_DB = 'sample_training';
const QUERY_COLLECTION = 'grades';
const REQUESTLOG_DB = 'disasterSimulator';
const REQUESTLOG_COLLECTION = 'requestLogs';
const CONTAINER_NETWORK_NAME = 'containers_mongoCluster';

let mongoClient, mongoClientStats, dockerClient;
let isRunning = false;
let minDate;
let requestLog = [];
const nodeTypes = {};

app.get('/start', (req, res) => {
  if (!isRunning) {
    const resume = req.query.resume === 'true' ? true : false;
    const retryReads = !req.query.hasOwnProperty('retryReads') || req.query.retryReads === 'true' ? true : false;
    const retryWrites = !req.query.hasOwnProperty('retryWrites') || req.query.retryWrites === 'true' ? true : false;
    const readPreference = req.query.hasOwnProperty('readPreference') ? req.query.readPreference : 'primary';
    const readConcern = req.query.hasOwnProperty('readConcern') ? req.query.readConcern : 'local';
    const writeConcern = req.query.hasOwnProperty('writeConcern') ? req.query.writeConcern : 'majority';
    start(resume, retryReads, retryWrites, readPreference, readConcern, writeConcern);
    res.send(`Started with retryReads=${retryReads}, retryWrites=${retryWrites}, readPreference=${readPreference}, ` +
             `readConcern=${readConcern} & writeConcern=${writeConcern}`);
  } else {
    res.send('Already running!');
  }
});

app.get('/stop', (req, res) => {
  if (isRunning) {
    isRunning = false;
    printWithTimestamp("Stopped querying...");
    res.send("Stopped");
  } else {
    res.send("Already stopped");
  }
});

app.get('/rsConfig', async (req, res) => {
  try {
    const rsConf = await mongoClient.db('local').collection('system.replset').findOne();
    res.json(rsConf);
  } catch (e) {
    res.status(500).send(`Error running rs.config command: ${e}`);
  }
});

app.post('/stepDown', async (req, res) => {
  try {
    addEvent(`Stepping down primary...`);
    const mongoRes = await mongoClient.db('admin').command({ replSetStepDown: 100 });
    if (mongoRes && mongoRes.ok === 1) {
      const successMsg = `Primary stepped down`;
      printWithTimestamp(successMsg);
      addEvent(successMsg);
      res.send(successMsg);
    } else {
      printWithTimestamp(`Error! Step down command returned : ${JSON.stringify(mongoRes)}`);
      res.status(500).send(`Error! Step down command returned:`, mongoRes);  
    }
  } catch (e) {
    printWithTimestamp(`Error while stepping down cluster: ${e}`);
    res.status(500).send(`Error while stepping down cluster: ${e}`);
  }
});

app.post('/killNode', (req, res) => {
  const containerName = parseBody('containerName', req, res);
  if (containerName) {
    try {
      addEvent(`Killing node ${containerName}...`);
      const container = dockerClient.getContainer(containerName)
      container.kill();
      const successMsg = `Node ${containerName} killed`;
      // addEvent(successMsg);
      res.send(successMsg);
    } catch (e) {
      const errMsg = `Error while killing container with name or ID '${containerName}': ${e}`;
      printWithTimestamp(errMsg);
      res.status(400).send(errMsg);
    }
  }
});

app.post('/startNode', (req, res) => {
  const containerName = parseBody('containerName', req, res);
  if (containerName) {
    try {
      addEvent(`Starting node ${containerName}...`);
      const container = dockerClient.getContainer(containerName)
      container.start();
      const successMsg = `Node ${containerName} started`;
      // addEvent(successMsg);
      res.send(successMsg);
    } catch (e) {
      const errMsg = `Error while starting container with name or ID '${containerName}': ${e}`;
      printWithTimestamp(errMsg);
      res.status(400).send(errMsg);
    }
  }
});

app.post('/disconnectNode', (req, res) => {
  const containerName = parseBody('containerName', req, res);
  if (containerName) {
    try {
      addEvent(`Disconnecting node ${containerName}...`);
      const network = dockerClient.getNetwork(CONTAINER_NETWORK_NAME);
      network.disconnect({ container: containerName });
      const successMsg = `Node ${containerName} disconnected`;
      // addEvent(successMsg);
      res.send(successMsg);
    } catch (e) {
      const errMsg = `Error while disconnecting network with name ${CONTAINER_NETWORK_NAME} and container with name or ID '${containerName}': ${e}`;
      printWithTimestamp(errMsg);
      res.status(400).send(errMsg);
    }
  }
});

app.post('/reconnectNode', (req, res) => {
  const containerName = parseBody('containerName', req, res);
  if (containerName) {
    try {
      addEvent(`Reconnecting node ${containerName}...`);
      const network = dockerClient.getNetwork(CONTAINER_NETWORK_NAME)
      network.connect({ container: containerName });
      const container = dockerClient.getContainer(containerName);
      container.restart();
      const successMsg = `Node ${containerName} reconnected`;
      // addEvent(successMsg);
      res.send(successMsg);
    } catch (e) {
      const errMsg = `Error while disconnecting network with name ${CONTAINER_NETWORK_NAME} and container with name or ID '${containerName}': ${e}`;
      printWithTimestamp(errMsg);
      res.status(400).send(errMsg);
    }
  }
});

function printWithTimestamp(msg) {
  console.log(`${new Date().toISOString()}: ${msg}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseBody(param, req, res) {
  if (!req.body || !req.body[param]) {
    res.status(400).send(`${param} not specified in request body`);
    return false;
  }
  return req.body[param];
}

async function start(resume, retryReads, retryWrites, readPreference, readConcern, writeConcern) {
  mongoClient = new MongoClient(CONNECTION_STRING, {
    retryReads: retryReads,
    retryWrites: retryWrites,
    readPreference: readPreference,
    readConcernLevel: readConcern,
    w: writeConcern
  });
  const collection = mongoClient.db(QUERY_DB).collection(QUERY_COLLECTION);
  if (!resume) {
    // set minDate which is used to query for latency stats on recent data only
    minDate = new Date();
    minDate = new Date(minDate.setSeconds(minDate.getSeconds() + 3));
  }
  printWithTimestamp(`Started querying with retryReads=${retryReads}, retryWrites=${retryWrites}, readPreference=${readPreference}` +
                     `readConcern=${readConcern} & writeConcern=${writeConcern}`);

  isRunning = true;
  requestLog = [];
  while (isRunning) {
    await doOperation('findOne', findOne, collection, mongoClient);
    await doOperation('insertOne', insertOne, collection, mongoClient);
    await storeRequestLog();
    await sleep(100);
  }
}

async function createIndexes(mongoClientStats) {
  const queryCollection = mongoClientStats.db(QUERY_DB).collection(QUERY_COLLECTION);
  queryCollection.createIndex({ student_id: 1 });
  const statsCollection = mongoClientStats.db(REQUESTLOG_DB).collection(REQUESTLOG_COLLECTION);
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

async function findOne(collection, doc) {
  await collection.findOne(doc);
}


async function insertOne(collection, doc) {
  await collection.insertOne(doc);
}

function generateFindAndInsertDocs() {
  return {
    findOne: generateFindDoc(),
    insertOne: generateInsertDoc()
  };
}

function generateFindDoc() {
  return { student_id: Math.floor(Math.random() * 9999) + 1 };
}

function generateInsertDoc(student_id) {
  return {
    student_id: student_id || Math.floor(Math.random() * 9999) + 1,
    scores: [
      {
        type: "exam",
        score: Math.random() * 100
      },
      {
        type: "quiz",
        score: Math.random() * 100
      },
      {
        type: "homework",
        score: Math.random() * 100
      },
      {
        type: "home",
        score: Math.random() * 100
      }
    ],
    class_id: Math.floor(Math.random() * 500) + 1
  };
}

async function doOperation(operationName, operationFn, collection, mongoClient) {
  // generate docs ahead of time so it's not counted towards latency
  const docs = generateFindAndInsertDocs();
  const startTime = new Date().getTime();
  try {
    await operationFn(collection, docs[operationName]);
    const endTime = new Date().getTime();
    const latency = endTime - startTime;
    logRequest(startTime, operationName, latency, true, mongoClient);
  } catch (e) {
    const endTime = new Date().getTime();
    printWithTimestamp(`Error while doing ${operationName} operation!: ${e}`);
    logRequest(startTime, operationName, endTime - startTime, false, mongoClient, e.toString());
  }
}

function logRequest(ts, operationName, latency, success, mongoClient, errMsg = undefined) {
  const newRequestLog = {
    ts: new Date(ts),
    operation: operationName,
    latency: latency,
    success: success,
    retryReads: mongoClient.retryReads,
    retryWrites: mongoClient.retryWrites,
    readPreference: mongoClient.readPreference.mode
  };
  if (errMsg) {
    newRequestLog['errMsg'] = errMsg;
  }
  
  io.emit('logRequest', newRequestLog);
  requestLog.push(newRequestLog);
}

async function storeRequestLog() {
  if (requestLog.length > 99) {
    try {
      const collection = mongoClientStats.db(REQUESTLOG_DB).collection(REQUESTLOG_COLLECTION);
      await collection.insertMany(requestLog);
      printWithTimestamp("Saved request logs");
      requestLog = [];
      updateStats();
    } catch (e) {
      printWithTimestamp(`Error while inserting request logs!: ${e}`);
    }
  }
}

function addEvent(msg, date = new Date()) {
  try {
    io.emit('logEvent', {
      message: msg,
      date: date
    });
  } catch (e) {
    printWithTimestamp(`Error while emitting event '${msg}': ${e}`);
  }
}

async function updateStats() {
  try {
    const collection = mongoClientStats.db(REQUESTLOG_DB).collection(REQUESTLOG_COLLECTION);
    const stats = await collection.aggregate([
      { $match: { ts: { $gt: minDate } } },
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
      addEvent(`Node '${address.split(':')[0]}' changed from ${oldType} to ${newType}`);
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

// front-end retrieves latest node types/status during initialization
io.on('connection', (socket) => {
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
});

httpServer.listen(APP_PORT, () => {
  mongoClient = new MongoClient(CONNECTION_STRING);
  mongoClient.on('serverDescriptionChanged', event => {
    onNodeChange(event);
  });
  mongoClientStats = new MongoClient(CONNECTION_STRING_STATS);
  generateSampleData(mongoClient);
  createIndexes(mongoClient, mongoClientStats);
  
  dockerClient = new Docker({socketPath: dockerSocketPath});
  console.log(`listening on ${APP_PORT}`);
});
