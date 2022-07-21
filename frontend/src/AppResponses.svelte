<script>
  import { onDestroy, onMount } from 'svelte';
  import { isRunning } from './store.js';
  import { getTimestamp } from './main.js'

  export let region;
  export let appServerEndpoint;

  const INTERVAL = 1000;
  const REQUEST_LOG_PATH = '/requestlog';

  let requestLog = [];
  let requestInterval;

  onMount(() => {
	});

  onDestroy(() => {
    clearInterval(requestInterval);
  });
  
  isRunning.subscribe(value => {
		if (value) {
      requestInterval = setInterval(getRequestLog, INTERVAL);
    } else {
      clearInterval(requestInterval);
    }
	});

  async function getRequestLog() {
    try {
      const resp = await fetch(appServerEndpoint + REQUEST_LOG_PATH);
      requestLog = await resp.json();
    } catch(e) {
      console.log(`Error while fetching request log: ${e}`);
    };
  }
</script>

{#if requestLog.length > 0}
  <div class="col">
    <h1 class="display-6">App log {#if region} — {region.toUpperCase()}{/if}</h1>
    {#each requestLog as request}
      <p class="log {request.success ? 'text-success' : 'text-danger'}"><span>{getTimestamp(request.ts['$date'])}:</span> '{request.operation}' in {request.latency}ms...</p>
    {/each}
  </div>
{/if}

<style>
  .log {
    margin-bottom: 0;
  }
</style>