<script>
  import { onDestroy, onMount } from 'svelte';
  import { isRunning } from './store.js';

  export let appServerEndpoint;
  export let startDate;

  const INTERVAL = 1000;
  const GET_STATS_PATH = '/getStats';

  let stats = {};
  let requestInterval;

  onMount(() => {
	});

  onDestroy(() => {
    clearInterval(requestInterval);
  });
  
  isRunning.subscribe(value => {
		if (value) {
      requestInterval = setInterval(getStats, INTERVAL);
    } else {
      clearInterval(requestInterval);
    }
	});

  async function getStats() {
    try {
      const resp = await fetch(appServerEndpoint + GET_STATS_PATH + '?minDate=' + startDate.getTime());
      stats = await resp.json();
    } catch(e) {
      console.log(`Error while fetching stats: ${e}`);
    };
  }
</script>

{#if stats}
  {#if stats.avg}
  <div class="col col-lg-2">
    <p>Average latency:</p>
    <p class="h5">{parseFloat(stats.avg).toFixed(2)} ms</p>
  </div>
  {/if}
  {#if stats.max}
  <div class="col col-lg-2">
    <p>Max latency:</p>
    <p class="h5">{stats.max} ms</p>
  </div>
  {/if}
{/if}

<style>
  .col { margin: 50px 0 25px; }
  .col p { text-align: center; }
</style>