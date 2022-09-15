const { MongoClient } = require('mongodb');
const { printWithTimestamp } = require('./common');
const config = require('./config');

const QUERY_INTERVAL = 0;
const QUERY_DB = 'sample_training';
const QUERY_COLLECTION = 'grades';

if (process.argv[2]) {
  const options = JSON.parse(process.argv[2]);
  const queryType = process.argv[3];
  if (typeof options === 'object' && options.hasOwnProperty('retryReads') && options.hasOwnProperty('retryWrites')) {
    start(options, queryType);
  } else {
    printWithTimestamp(`Error! Cannot parse options argument. Child process stopping...`);
  }
} else {
  printWithTimestamp(`Error! No options argument supplied. Child process stopping...`);
}

async function start(options, queryType) {
  const mongoClient = new MongoClient(config.connectionString, options);
  const collection = mongoClient.db(QUERY_DB).collection(QUERY_COLLECTION);
  printWithTimestamp(`Started child process for querying ${queryType} MongoDB...`);
  
  while (true) {
    if (queryType === 'findOne' || !queryType) {
      await doOperation('findOne', findOne, collection, mongoClient);
    }
    if (queryType === 'insertOne' || !queryType) {
      await doOperation('insertOne', insertOne, collection, mongoClient);
    }
    if (QUERY_INTERVAL > 0) {
      await sleep(QUERY_INTERVAL);
    }
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
    await logRequest(startTime, operationName, latency, true, mongoClient);
  } catch (e) {
    const endTime = new Date().getTime();
    printWithTimestamp(`Error while doing ${operationName} operation!: ${e}`);
    await logRequest(startTime, operationName, endTime - startTime, false, mongoClient, e.toString());
  }
}

async function logRequest(ts, operationName, latency, success, mongoClient, errMsg = undefined) {
  const request = {
    ts: ts,
    operation: operationName,
    latency: latency,
    success: success,
    retryReads: mongoClient.options.retryReads,
    retryWrites: mongoClient.options.retryWrites,
    readPreference: mongoClient.readPreference.mode,
    readConcern: mongoClient.options.readConcern.level,
    writeConcern: mongoClient.options.writeConcern.w,
  };
  if (errMsg) {
    request['errMsg'] = errMsg;
  }

  process.send({ request: request });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}