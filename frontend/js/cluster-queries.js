REGION_A_ENDPOINT = "http://ec2-3-135-221-191.us-east-2.compute.amazonaws.com:5000";
// REGION_A_ENDPOINT = "http://127.0.0.1:5001";
REGION_B_ENDPOINT = "http://ec2-54-71-127-55.us-west-2.compute.amazonaws.com:5000";
// REGION_B_ENDPOINT = "http://127.0.0.1:5002";
// REGION_C_ENDPOINT = "http://127.0.0.1:5003";
REGION_A_NAME = "US_EAST_2";
REGION_B_NAME = "US_WEST_1";
FIND_PATH = "find";
INSERT_PATH = "insert";
SEARCH_PATH = "search";
REGION_A_CONTAINER = "region-a-container";
REGION_B_CONTAINER = "region-b-container";
// REGION_C_CONTAINER = "region-c-container";

REALM_BASE_URL = "https://data.mongodb-api.com/app/t9-realm-svcs-qxpsp/endpoint";
CLUSTER_DETAILS_PATH = "/getClusterDetails";
TEST_FAILOVER_PATH = "/testFailover";
ATLAS_PROCESSES_PATH = "/atlasProcesses";
CREATE_NETWORK_PARTITION_PATH = "/createNetworkPartition";
RESTORE_NETWORK = "/restoreNetwork";

let appAToMongoLine;
let animationInterval;

// do queries each second
setInterval(queryAllRegions, 1000);

drawTopologyLines()
fetchClusterDetails();
setAppRegions();

function queryAllRegions() {
  getAtlasRegionsAndTypes();
  find(REGION_A_ENDPOINT, REGION_A_CONTAINER);
  insertDocument(REGION_A_ENDPOINT, REGION_A_CONTAINER);
  search(REGION_A_ENDPOINT, REGION_A_CONTAINER);
  find(REGION_B_ENDPOINT, REGION_B_CONTAINER);
  insertDocument(REGION_B_ENDPOINT, REGION_B_CONTAINER);
  search(REGION_B_ENDPOINT, REGION_B_CONTAINER);
  // find(REGION_C_ENDPOINT, REGION_C_CONTAINER);
  // insertDocument(REGION_C_ENDPOINT, REGION_C_CONTAINER);
  // search(REGION_C_ENDPOINT, REGION_C_CONTAINER);
}

function logRequest(success, latency, logElmId) {
  timestamp = new Date().toLocaleString('en-US', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit'});
  if (success) {
    logText = `[${timestamp}]: Success! Last response took ${latency} ms...`
    document.getElementById(logElmId).className = "log success";
  } else {
    logText = `[${timestamp}]: Error! Last response took ${latency} ms...`
    document.getElementById(logElmId).className = "log error";
  }
  document.getElementById(logElmId).innerHTML = logText;
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}

function find(endpoint, htmlId) {
  startTime = Date.now();
  fetchWithTimeout(endpoint + '/' + FIND_PATH, { timeout: 1000 })
    .then(response => response.json())
    .then(data => {
      endTime = Date.now();
      logElmId = htmlId + '-' + FIND_PATH + '-log';
      logRequest(true, endTime - startTime, logElmId);
      document.getElementById(htmlId + '-' + FIND_PATH).innerHTML = JSON.stringify(data);
    }).catch(e => {
      endTime = Date.now();
      logElmId = htmlId + '-' + FIND_PATH + '-log';
      logRequest(false, endTime - startTime, logElmId);
      document.getElementById(htmlId + '-' + FIND_PATH).innerHTML = e;
    });
}

function insertDocument(endpoint, htmlId) {
  startTime = Date.now();
  fetchWithTimeout(endpoint + '/' + INSERT_PATH, { timeout: 1000 })
    .then(response => response.text())
    .then(data => {
      endTime = Date.now()
      logElmId = htmlId + '-' + INSERT_PATH + '-log';
      logRequest(true, endTime - startTime, logElmId);
      document.getElementById(htmlId + '-' + INSERT_PATH).innerHTML = `Inserted document with ID: ${data}`;
    }).catch(e => {
      endTime = Date.now();
      logElmId = htmlId + '-' + INSERT_PATH + '-log';
      logRequest(false, endTime - startTime, logElmId);
      document.getElementById(htmlId + '-' + INSERT_PATH).innerHTML = e;
    });
}

function search(endpoint, htmlId) {
  startTime = Date.now();
  fetchWithTimeout(endpoint + '/' + SEARCH_PATH, { timeout: 1000 })
    .then(response => response.json())
    .then(data => {
      endTime = Date.now()
      logElmId = htmlId + '-' + SEARCH_PATH + '-log';
      logRequest(true, endTime - startTime, logElmId);
      document.getElementById(htmlId + '-' + SEARCH_PATH).innerHTML = JSON.stringify(data);
    }).catch(e => {
      endTime = Date.now();
      logElmId = htmlId + '-' + SEARCH_PATH + '-log';
      logRequest(false, endTime - startTime, logElmId);
      document.getElementById(htmlId + '-' + SEARCH_PATH).innerHTML = e;
    });
}

function drawTopologyLines() {
  new LeaderLine(
    document.getElementById('mongo-1'),
    document.getElementById('mongo-2'),
    {
      color: 'grey',
      startPlug: 'behind',
      endPlug: 'behind'
    }
  );
  new LeaderLine(
    document.getElementById('mongo-2'),
    document.getElementById('mongo-3'),
    {
      color: 'grey',
      startPlug: 'behind',
      endPlug: 'behind'
    }
  );
  appAToMongoLine = new LeaderLine(
    document.getElementById('app-a'),
    document.getElementById('mongo-1'),
    {
      color: '#8a795d',
      startSocket: 'bottom',
      endSocket: 'top',
    }
  );
  new LeaderLine(
    document.getElementById('app-b'),
    document.getElementById('mongo-1'),
    {
      color: '#8a795d',
      startSocket: 'bottom',
      endSocket: 'top',
    }
  );
}

function showNetworkPartition(line) {
  animationInterval = setInterval(() => {
    if (line.color === 'white') {
      line.color = '#8a795d';
      line.middleLabel = LeaderLine.captionLabel('X', {color: 'indianred', outlineColor: 'white', fontSize: '2em', offset: [50, 50]});;
    } else {
      line.color = 'white';
      line.middleLabel = '';
    }
  }, 1000);
}

function resetTopologyLine(line) {
  clearInterval(animationInterval);
  line.color = '#8a795d';
  line.middleLabel = '';
}

async function fetchClusterDetails() {  
  clusterDetails = await fetch(REALM_BASE_URL + CLUSTER_DETAILS_PATH)
    .then(response => response.json())
    .then(data => {
      return data;
  }).catch(
    e => console.log(`Fetching cluster details failed: ${e}`)
  );
  
  if (clusterDetails && clusterDetails.replicationSpec) {
    Object.keys(clusterDetails.replicationSpec).forEach((key, i) => {
      replaceRegionCaption("mongo-" + (i + 1) + "-caption", key);
    });
  }
}

function setAppRegions() {
  replaceRegionCaption("app-a-caption", REGION_A_NAME);
  replaceRegionCaption("app-b-caption", REGION_B_NAME);
  replaceRegionCaption("region-a-log-header", REGION_A_NAME);
  replaceRegionCaption("region-b-log-header", REGION_B_NAME);
}

function replaceRegionCaption(htmlId, region) {
  replaceCaption(htmlId, region, "{REGION}");
}

function replaceTypeCaption(htmlId, region) {
  replaceCaption(htmlId, region, "{TYPE}");
}

function replaceCaption(htmlId, region, replaceStr) {
  elm = document.getElementById(htmlId);
  if (elm) {
    currCaption = elm.innerHTML;
    elm.innerHTML = currCaption.replace(replaceStr, region);
  }
}

async function testFailover() {  
  clusterDetails = await fetch(REALM_BASE_URL + TEST_FAILOVER_PATH, { method: 'POST' })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      buttonElm = document.getElementById("test-failover-button");
      if (buttonElm) {
        buttonElm.disabled = true;
        buttonElm.innerHTML = "Initiated regional failover...";
      }
      setTimeout(() => enableTestFailover(buttonElm), 600000);
  }).catch(
    e => console.log(`Test failover failed: ${e}`)
  );
}

function enableTestFailover(buttonElm) {
  buttonElm.disabled = false;
  buttonElm.innerHTML = "Atlas regional failover";
}

async function createNetworkPartition() {
  let url;
  if (document.getElementById("network-partition-button").className.indexOf("create-partition") !== -1) {
    url = REALM_BASE_URL + CREATE_NETWORK_PARTITION_PATH;
  } else {
    url = REALM_BASE_URL + RESTORE_NETWORK;
  }
  clusterDetails = await fetch(url)
  .then(response => response.text())
  .then(data => {
    console.log(data);
    buttonElm = document.getElementById("network-partition-button");
    if (buttonElm) {
      buttonElm.disabled = true;
      if (buttonElm.className.indexOf("create-partition") !== -1) {
        buttonElm.innerHTML = "Creating network partition...";
        showNetworkPartition(appAToMongoLine);
      } else {
        buttonElm.innerHTML = "Restoring network connectivity...";
        resetTopologyLine(appAToMongoLine);
      }
    }
    setTimeout(() => enableCreateNetworkPartition(buttonElm), 2000);
  }).catch(
    e => console.log(`Create/restore network partition failed: ${e}`)
  );
}

function enableCreateNetworkPartition(buttonElm) {
  buttonElm.disabled = false;
  if (buttonElm.className.indexOf("create-partition") !== -1) {
    buttonElm.innerHTML = "Restore network partition";
    buttonElm.className = buttonElm.className.replace("create-partition", "restore-partition")
  } else {
    buttonElm.innerHTML = "Create network connectivity";
    buttonElm.className = buttonElm.className.replace("restore-partition", "create-partition")
  }
}

async function getAtlasRegionsAndTypes() {
  DB_HELLO_URL = "/hello";
  dbHello = await fetch(REGION_A_ENDPOINT + DB_HELLO_URL)
    .then(response => response.json())
    .then(data => {
      return data;
  }).catch(
    e => console.log(`Fetching output of db hello command: ${e}`)
  );
  
  if (dbHello && dbHello.hosts) {
    primaryIdx = dbHello.hosts.indexOf(dbHello.primary);
    // reset all nodes to secondary
    for (let i = 1; i < 4; i++) {
      replaceTypeCaption("mongo-" + i + "-caption", "Secondary");
      document.getElementById("mongo-" + i).src = "img/secondary-active.png";
    }
    replaceTypeCaption("mongo-" + (primaryIdx + 1) + "-caption", "Primary");
    document.getElementById("mongo-" + (primaryIdx + 1)).src = "img/primary-active.png";
  }
}

