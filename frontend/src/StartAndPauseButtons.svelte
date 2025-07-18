<script lang="ts">
  import { isRunning } from './store';

  export let appServerEndpoint: string;
  export let retryReads: boolean;
  export let retryWrites: boolean;
  export let readPreference: string;
  export let readConcern: string;
  export let writeConcern: string;

  const START_PATH: string = '/start';
  const STOP_PATH: string = '/stop';

  let isPaused: boolean = false;

  function handleClickStartStop(): void {
    isRunning.update((isRunning: boolean) => {
      if (!isRunning) {
        start();
      } else {
        stop();
      }

      return !isRunning;
    });
  }

  function handleClickPauseResume(): boolean {
    if (isPaused) {
      start(true);
    } else {
      stop();
    }
    isPaused = !isPaused;
    return !$isRunning;
  }

  async function start(resume: boolean = false): Promise<void> {
    try {
      let url = `${appServerEndpoint}${START_PATH}?retryReads=${retryReads}&retryWrites=${retryWrites}&` +
                `readPreference=${readPreference}&readConcern=${readConcern}&writeConcern=${writeConcern}`;
      if (resume) {
        url += '&resume=true';
      }
      const resp = await fetch(url);
      const data = await resp.text();
      if (resp.ok && data) {
        console.log(`${data}`);
      } else {
        console.log(`Error! Got invalid response: ${data}`);
      }
    } catch(e) {
      console.log(`Error while starting appserver: ${e}`);
    };
  }

  async function stop(): Promise<void> {
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

{#if $isRunning}
  <button type="button" class="btn btn-primary {!isPaused ? 'pause' : 'resume'}" on:click={handleClickPauseResume}>
    {!isPaused ? 'Pause' : 'Resume'}
    <i class="bi {!isPaused ? 'bi-play-fill' : 'bi-pause-fill'}"></i>
  </button>
{/if}
<button type="button" class="btn btn-primary {!$isRunning ? 'play' : 'stop'}" on:click={handleClickStartStop}>
  {!$isRunning ? 'Start' : 'Stop'}
  <i class="bi {!$isRunning ? 'bi-play-fill' : 'bi-stop-fill'}"></i>
</button>

<style>
  button {
    margin-top: 10px;
    background-color: forestgreen;
    border-color: forestgreen;
    width: 100%;
  }

  button:hover, button:focus {
    background-color: darkgreen;
    border-color: darkgreen;
  }

  button.pause {
    background-color: peachpuff;
    border-color: peachpuff;
    color: #333;
  }

  button.pause:hover, button.pause:focus {
    background-color: darkgoldenrod;
    border-color: darkgoldenrod;
    color: white;
  }

  button.stop {
    background-color: indianred;
    border-color: indianred;
  }

  button.stop:hover, button.stop:focus {
    background-color: darkred;
    border-color: darkred;
  }

  i {
    margin-left: 5px;
  }
</style>