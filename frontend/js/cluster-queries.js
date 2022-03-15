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
// const DigestFetch = window.DigestFetch;
// const client = new DigestFetch(ATLAS_API_PUBLIC_KEY, ATLAS_API_PRIVATE_KEY, { algorithm: 'MD5' });

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
  // const DigestFetch = window.DigestFetch;
  // const client = new DigestFetch(ATLAS_API_PUBLIC_KEY, ATLAS_API_PRIVATE_KEY);
  // const response = await client.fetch(ATLAS_API_URL, {
  //   mode: 'no-cors'
  // });
  // console.log(response.json());
  // const AxiosDigestAuth = window.AxiosDigestAuth;

  // const digestAuth = new AxiosDigestAuth({
  //   username: ATLAS_API_PUBLIC_KEY,
  //   password: ATLAS_API_PRIVATE_KEY,
  // });
  
  // const MakeARequest = async () => {
  //   const response = await digestAuth.request({
  //     headers: { Accept: "application/json" },
  //     method: "GET",
  //     url: ATLAS_API_URL,
  //   });
  // }

  /*
  const data = await axios.get(ATLAS_API_URL, { mode: 'no-cors'}).
    catch(err => {
      if (err.response.status === 401) {
        const authDetails = err.response.headers['www-authenticate'].split(', ').map(v => v.split('='));

        ++count;
        const nonceCount = ('00000000' + count).slice(-8);
        const cnonce = crypto.randomBytes(24).toString('hex');

        const realm = authDetails[0][1].replace(/"/g, '');
        const nonce = authDetails[2][1].replace(/"/g, '');

        const md5 = str => crypto.createHash('md5').update(str).digest('hex');

        const HA1 = md5(`${ATLAS_API_PUBLIC_KEY}:${realm}:${ATLAS_API_PRIVATE_KEY}`);
        const HA2 = md5(`GET:${ATLAS_API_URL}`);
        const response = md5(`${HA1}:${nonce}:${nonceCount}:${cnonce}:auth:${HA2}`);

        const authorization = `Digest username="${publicKey}",realm="${realm}",` +
          `nonce="${nonce}",uri="${ATLAS_API_URL}",qop="auth",algorithm="MD5",` +
          `response="${response}",nc="${nonceCount}",cnonce="${cnonce}"`;

        return axios.get(ATLAS_API_URL, { mode: 'no-cors', headers: { authorization } });
      }
      throw err;
    }).
    catch(err => {
      throw err;
    });

  return data;*/
  config = {
    auth: {
      username: ATLAS_API_PUBLIC_KEY,
      password: ATLAS_API_PRIVATE_KEY
    }
  }
  const response = await axios.get(ATLAS_API_URL, config);
}