<script>
  import { onDestroy } from 'svelte';
  import { isRunning } from './store.js';

  export let appServerEndpoint;
  export let retryReads;
  export let retryWrites;
  export let readPreference;

  const INTERVAL = 5; // in seconds
  const START_PATH = '/start';
  const CONTINUE_PATH = '/continue';
  const STOP_PATH = '/stop';

  let buttonText = 'Start';
  let iconClass = 'bi-play-fill';
  let continueInterval;

  onDestroy(() => {
    clearInterval(continueInterval);
  });

  function handleClick() {
    isRunning.update(isRunning => {
      if (!isRunning) {
        start();
        continueInterval = setInterval(keep_running, INTERVAL * 1000);
      } else {
        clearInterval(continueInterval);
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
      const data = await resp.json();
      if (resp.ok && data && data.success) {
        console.log(`Started: ${data.msg}`);
      } else {
        console.log(`Error! Got invalid response: ${data.msg}`);
      }
    } catch(e) {
      console.log(`Error while starting appserver: ${e}`);
    };
  }

  async function keep_running() {
    try {
      const resp = await fetch(appServerEndpoint + CONTINUE_PATH);
      const data = await resp.json();
      if (resp.ok && data && data.success) {
        console.log('Send keep running signal');
      } else {
        console.log(`Error! Got invalid response: ${data.msg}`);
      }
    } catch(e) {
      console.log(`Error while sending continue signal to appserver: ${e}`);
    };
  }

  async function stop() {
    try {
      const resp = await fetch(appServerEndpoint + STOP_PATH);
      const data = await resp.json();
      if (resp.ok && data && data.success) {
        console.log('Stopping');
      } else {
        console.log(`Error! Got invalid response: ${data.msg}`);
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