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
}