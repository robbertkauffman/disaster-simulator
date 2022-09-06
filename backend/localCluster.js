const Docker = require('dockerode');
const { addEvent, printWithTimestamp } = require('./common');

const dockerSocketPath = process.env.DOCKER_HOST || '/Users/robbert.kauffman/.local/share/containers/podman/machine/podman-machine-default/podman.sock';
const dockerClient = new Docker({socketPath: dockerSocketPath});
const CONTAINER_NETWORK_NAME = 'containers_mongoCluster';

module.exports = function(app, io, mongoClient) {
  app.post('/stepDown', async (req, res) => {
    try {
      addEvent(`Stepping down primary...`, io);
      const mongoRes = await mongoClient.db('admin').command({ replSetStepDown: 100 });
      if (mongoRes && mongoRes.ok === 1) {
        const successMsg = `Primary stepped down`;
        printWithTimestamp(successMsg);
        addEvent(successMsg, io);
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
        addEvent(`Killing node ${containerName}...`, io);
        const container = dockerClient.getContainer(containerName)
        container.kill();
        const successMsg = `Node ${containerName} killed`;
        // addEvent(successMsg, io);
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
        addEvent(`Starting node ${containerName}...`, io);
        const container = dockerClient.getContainer(containerName)
        container.start();
        const successMsg = `Node ${containerName} started`;
        // addEvent(successMsg, io);
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
        addEvent(`Disconnecting node ${containerName}...`, io);
        const network = dockerClient.getNetwork(CONTAINER_NETWORK_NAME);
        network.disconnect({ container: containerName });
        const successMsg = `Node ${containerName} disconnected`;
        // addEvent(successMsg, io);
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
        addEvent(`Reconnecting node ${containerName}...`, io);
        const network = dockerClient.getNetwork(CONTAINER_NETWORK_NAME)
        network.connect({ container: containerName });
        const container = dockerClient.getContainer(containerName);
        container.restart();
        const successMsg = `Node ${containerName} reconnected`;
        // addEvent(successMsg, io);
        res.send(successMsg);
      } catch (e) {
        const errMsg = `Error while disconnecting network with name ${CONTAINER_NETWORK_NAME} and container with name or ID '${containerName}': ${e}`;
        printWithTimestamp(errMsg);
        res.status(400).send(errMsg);
      }
    }
  });
};

function parseBody(param, req, res) {
  if (!req.body || !req.body[param]) {
    res.status(400).send(`${param} not specified in request body`);
    return false;
  }
  return req.body[param];
}