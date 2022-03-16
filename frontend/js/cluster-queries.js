// REGION_A_ENDPOINT = "http://ec2-3-135-221-191.us-east-2.compute.amazonaws.com:5000";
REGION_A_ENDPOINT = "http://127.0.0.1:5001";
// REGION_B_ENDPOINT = "http://ec2-54-71-127-55.us-west-2.compute.amazonaws.com:5000";
REGION_B_ENDPOINT = "http://127.0.0.1:5002";
// REGION_C_ENDPOINT = "http://127.0.0.1:5003";
FIND_PATH = "find";
INSERT_PATH = "insert";
SEARCH_PATH = "search";
REGION_A_CONTAINER = "region-a-container";
REGION_B_CONTAINER = "region-b-container";
// REGION_C_CONTAINER = "region-c-container";

CLUSTER_DETAILS_API = "https://data.mongodb-api.com/app/t9-realm-svcs-qxpsp/endpoint/getClusterDetails";

// do queries each second
setInterval(queryAllRegions, 1000);

drawTopologyLines()
fetchClusterDetails();

function queryAllRegions() {
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

function find(endpoint, htmlId) {
  startTime = Date.now();
  fetch(endpoint + '/' + FIND_PATH)
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
  fetch(endpoint + '/' + INSERT_PATH)
    .then(response => response.json())
    .then(data => {
      endTime = Date.now()
      logElmId = htmlId + '-' + INSERT_PATH + '-log';
      logRequest(true, endTime - startTime, logElmId);
      document.getElementById(htmlId + '-' + INSERT_PATH).innerHTML = JSON.stringify(data);
    }).catch(e => {
      endTime = Date.now();
      logElmId = htmlId + '-' + INSERT_PATH + '-log';
      logRequest(false, endTime - startTime, logElmId);
      document.getElementById(htmlId + '-' + INSERT_PATH).innerHTML = e;
    });
}


function search(endpoint, htmlId) {
  startTime = Date.now();
  fetch(endpoint + '/' + SEARCH_PATH)
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
  new LeaderLine(
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

async function fetchClusterDetails() {  
  clusterDetails = await fetch(CLUSTER_DETAILS_API)
    .then(response => response.json())
    .then(data => {
      return data;
  }).catch(
    e => console.log(e)
  );
  
  if (clusterDetails && clusterDetails.replicationSpec) {
    Object.keys(clusterDetails.replicationSpec).forEach((key, i) => {
      elm = document.getElementById("mongo-" + (i + 1) + "-caption");
      if (elm) {
        currCaption = elm.innerHTML;
        elm.innerHTML = currCaption.replace("{REGION}", key);
      }
    });
  }
}