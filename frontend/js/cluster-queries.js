REGION_A_ENDPOINT = "http://127.0.0.1:5001";
REGION_B_ENDPOINT = "http://127.0.0.1:5002";
REGION_C_ENDPOINT = "http://127.0.0.1:5003";
FIND_PATH = "find";
INSERT_PATH = "insert";
SEARCH_PATH = "search";
REGION_A_CONTAINER = "region-a-container";
REGION_B_CONTAINER = "region-b-container";
REGION_C_CONTAINER = "region-c-container";

ATLAS_API_URL = "https://cloud.mongodb.com/api/atlas/v1.0/groups/622fbb4d792ac378e5188f23/clusters/BBBE";
ATLAS_API_PUBLIC_KEY = "jvmzxzbc";
ATLAS_API_PRIVATE_KEY = "d4f44862-766f-4b81-8322-2213150159f4";

// do queries each second
setInterval(queryAllRegions, 1000);

drawTopologyLines()

// init fetch
const DigestFetch = window.DigestFetch;
const client = new DigestFetch(ATLAS_API_PUBLIC_KEY, ATLAS_API_PRIVATE_KEY);

function queryAllRegions() {
  find(REGION_A_ENDPOINT, REGION_A_CONTAINER);
  insertDocument(REGION_A_ENDPOINT, REGION_A_CONTAINER);
  search(REGION_A_ENDPOINT, REGION_A_CONTAINER);
  find(REGION_B_ENDPOINT, REGION_B_CONTAINER);
  insertDocument(REGION_B_ENDPOINT, REGION_B_CONTAINER);
  search(REGION_B_ENDPOINT, REGION_B_CONTAINER);
  find(REGION_C_ENDPOINT, REGION_C_CONTAINER);
  insertDocument(REGION_C_ENDPOINT, REGION_C_CONTAINER);
  search(REGION_C_ENDPOINT, REGION_C_CONTAINER);
}

function find(endpoint, htmlId) {
  fetch(endpoint + '/' + FIND_PATH)
    .then(response => response.json())
    .then(data => {
      document.getElementById(htmlId + '-' + FIND_PATH).innerHTML = JSON.stringify(data);
    });
}

function insertDocument(endpoint, htmlId) {
  fetch(endpoint + '/' + INSERT_PATH)
    .then(response => response.json())
    .then(data => {
      document.getElementById(htmlId + '-' + INSERT_PATH).innerHTML = JSON.stringify(data);
    });
}


function search(endpoint, htmlId) {
  fetch(endpoint + '/' + SEARCH_PATH)
    .then(response => response.json())
    .then(data => {
      document.getElementById(htmlId + '-' + SEARCH_PATH).innerHTML = JSON.stringify(data);
  });
}

function drawTopologyLines() {
  new LeaderLine(
    document.getElementById('mongo-a'),
    document.getElementById('mongo-b'),
    {
      color: 'grey',
      startPlug: 'behind',
      endPlug: 'behind'
    }
  );
  new LeaderLine(
    document.getElementById('mongo-b'),
    document.getElementById('mongo-c'),
    {
      color: 'grey',
      startPlug: 'behind',
      endPlug: 'behind'
    }
  );
  new LeaderLine(
    document.getElementById('app-a'),
    document.getElementById('mongo-a'),
    {
      color: '#8a795d',
      startSocket: 'bottom',
      endSocket: 'top',
    }
  );
  new LeaderLine(
    document.getElementById('app-b'),
    document.getElementById('mongo-b'),
    {
      color: '#8a795d',
      startSocket: 'bottom',
      endSocket: 'top',
    }
  );

}

async function fetchClusterDetails() {  
  const DigestFetch = window.DigestFetch;
  const client = new DigestFetch(ATLAS_API_PUBLIC_KEY, ATLAS_API_PRIVATE_KEY);

  const response = await client.fetch(ATLAS_API_URL, {
    mode: 'no-cors'
  });
  console.log(response.json());
}