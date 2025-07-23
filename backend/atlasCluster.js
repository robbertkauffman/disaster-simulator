const fetch = require('node-fetch');
const DigestClient = require('digest-fetch');
const { addEvent, printWithTimestamp } = require('./common');
require('dotenv').config({ path: __dirname + '/.env' });

module.exports = function(app, io) {
  app.post('/testFailover', async (req, res) => {
    try {
      const client = new DigestClient(process.env.ATLAS_API_KEY_PUBLIC, process.env.ATLAS_API_KEY_PRIVATE); 
      const resp = await client.fetch(`https://cloud.mongodb.com/api/atlas/v2/groups/${process.env.ATLAS_GROUP_ID}/clusters/${process.env.ATLAS_CLUSTER_NAME}/restartPrimaries`, {
        method: 'POST',
        headers: { 'Accept': 'application/vnd.atlas.2025-03-12+json', 'Content-Type': 'application/json' }
      });
      if (resp.ok) {
        const json = await resp.json();
        const successMsg = `Initiated failover`;
        printWithTimestamp(successMsg);
        addEvent(successMsg, io);
        res.send(json);
      }
    } catch (e) {
      res.send(`Failed calling Atlas Test Failover API: ${e}`);
    }
  });

  app.post('/startRegionalOutage', async (req, res) => {
    if (req.body && req.body.regionName) {
      try {
        const client = new DigestClient(process.env.ATLAS_API_KEY_PUBLIC, process.env.ATLAS_API_KEY_PRIVATE); 
        const resp = await client.fetch(`https://cloud.mongodb.com/api/atlas/v2/groups/${process.env.ATLAS_GROUP_ID}/clusters/${process.env.ATLAS_CLUSTER_NAME}/outageSimulation`, {
          method: 'POST',
          headers: { 'Accept': 'application/vnd.atlas.2025-03-12+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "outageFilters": [
              {
                "cloudProvider": "AWS",
                "regionName": req.body.regionName,
                "type": "REGION"
              }
            ]
          })
        });
        if (resp.ok) {
          const json = await resp.json();
          const successMsg = `Initiated regional outage to ${req.body.regionName}`;
          printWithTimestamp(successMsg);
          addEvent(successMsg, io);
          res.send(json);
        } else {
          res.status(400).send(`Failed calling Simulate Regional Outage API: ${JSON.stringify(await resp.json())}`);
        }
      } catch (e) {
        res.status(resp.status).send(`Failed calling Simulate Regional Outage API: ${e}`);
      }
    } else {
      res.status(400).send(`Failed calling Simulate Regional Outage API: regionName must be specified`);
    }
  });

  app.post('/endRegionalOutage', async (req, res) => {
    try {
      const client = new DigestClient(process.env.ATLAS_API_KEY_PUBLIC, process.env.ATLAS_API_KEY_PRIVATE);
      const resp = await client.fetch(`https://cloud.mongodb.com/api/atlas/v2/groups/${process.env.ATLAS_GROUP_ID}/clusters/${process.env.ATLAS_CLUSTER_NAME}/outageSimulation`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/vnd.atlas.2025-03-12+json', 'Content-Type': 'application/json' },
      });
      if (resp.ok) {
        const json = await resp.json();
        const successMsg = `Stopped regional outage`;
        printWithTimestamp(successMsg);
        addEvent(successMsg, io);
        res.send(json);
      } else {
        res.status(resp.status).send(`Failed calling Simulate Regional Outage API: ${JSON.stringify(await resp.json())}`);
      }
    } catch (e) {
      res.status(400).send(`Failed calling Simulate Regional Outage API: ${e}`);
    }
  });

  app.get('/getRegionalOutageStatus', async (req, res) => {
    try {
      const client = new DigestClient(process.env.ATLAS_API_KEY_PUBLIC, process.env.ATLAS_API_KEY_PRIVATE);
      const resp = await client.fetch(`https://cloud.mongodb.com/api/atlas/v2/groups/${process.env.ATLAS_GROUP_ID}/clusters/${process.env.ATLAS_CLUSTER_NAME}/outageSimulation`, {
        method: 'GET',
        headers: { 'Accept': 'application/vnd.atlas.2025-03-12+json', 'Content-Type': 'application/json' },
      });
      if (resp.ok) {
        const json = await resp.json();
        res.send(json);
      } else {
        res.status(resp.status).send(`Failed calling Get Outage Simulation API: ${JSON.stringify(await resp.json())}`);
      }
    } catch (e) {
      res.status(400).send(`Failed calling Get Outage Simulation API: ${e}`);
    }
  });
}