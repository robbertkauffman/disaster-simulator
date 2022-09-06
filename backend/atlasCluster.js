const fetch = require('node-fetch');
const DigestFetch = require('digest-fetch');

module.exports = function(app, io, clusterConfig) {
  app.post('/testFailover', async (req, res) => {
    try {
      const client = new DigestFetch(clusterConfig.apiKeyPublic, clusterConfig.apiKeyPrivate); 
      const resp = await client.fetch(`https://cloud.mongodb.com/api/atlas/v1.0/groups/${clusterConfig.groupId}/clusters/${clusterConfig.clusterName}/restartPrimaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
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