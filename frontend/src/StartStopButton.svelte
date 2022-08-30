<script>
  import { isRunning } from './store.js';

  export let appServerEndpoint;
  export let retryReads;
  export let retryWrites;
  export let readPreference;

  const START_PATH = '/start';
  const STOP_PATH = '/stop';

  let buttonText = 'Start';
  let iconClass = 'bi-play-fill';

  function handleClick() {
    isRunning.update(isRunning => {
      if (!isRunning) {
        start();
      } else {
        stop();
      }

      isRunning = !isRunning;
      buttonText = !isRunning ? 'Start' : 'Stop';
      iconClass = !isRunning ? 'bi-play-fill' : 'bi-stop-fill';

      return isRunning;
    });
  }

  async function start() {
    try {
      const url = `${appServerEndpoint}${START_PATH}?retryReads=${retryReads}&retryWrites=${retryWrites}&readPreference=${readPreference}`;
      const resp = await fetch(url);
      const data = await resp.text();
      if (resp.ok && data) {
        console.log(`Started: ${data}`);
      } else {
        console.log(`Error! Got invalid response: ${data}`);
      }
    } catch(e) {
      console.log(`Error while starting appserver: ${e}`);
    };
  }

  async function stop() {
    try {
      const resp = await fetch(appServerEndpoint + STOP_PATH);
      const data = await resp.text();
      if (resp.ok && data) {
        console.log('Stopping');
      } else {
        console.log(`Error! Got invalid response: ${data}`);
      }
    } catch(e) {
      console.log(`Error while stopping appserver: ${e}`);
    };
  }
</script>

<button type="button" class="btn btn-primary" on:click={handleClick}>{buttonText}<i class="bi {iconClass}"></i></button>

<style>
  button {
    margin-top: 10px;
    background-color: forestgreen;
    border-color: forestgreen;
    width: 100%;
  }

  button:hover {
    background-color: darkgreen;
    border-color: darkgreen;
  }

  button:focus {
    background-color: seagreen;
    border-color: seagreen;
  }

  i {
    margin-left: 5px;
  }
</style>