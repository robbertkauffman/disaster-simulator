REGION_A_ENDPOINT = "http://127.0.0.1:5001";
REGION_B_ENDPOINT = "http://127.0.0.1:5002";
REGION_C_ENDPOINT = "http://127.0.0.1:5003";
FIND_PATH = "find";
INSERT_PATH = "insert";
SEARCH_PATH = "search";
REGION_A_CONTAINER = "region-a-container";
REGION_B_CONTAINER = "region-b-container";
REGION_C_CONTAINER = "region-c-container";

setInterval(queryAllRegions, 1000);

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