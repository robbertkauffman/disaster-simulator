<script>
  import { onDestroy, onMount } from 'svelte';
  import { isRunning } from './store.js';

  export let operationName;
  export let url;
  export let timeout = 10000;

  const INTERVAL = 500;

  let log, success, response;
  let requestInterval;

  onMount(() => {
	});

  onDestroy(() => {
    clearInterval(requestInterval);
  });
  
  isRunning.subscribe(value => {
		if (value) {
      requestInterval = setInterval(doRequest, INTERVAL);
      doRequest();
    } else {
      clearInterval(requestInterval);
    }
	});

  async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 10000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  }

  function getTimestamp() {
    return new Date().toLocaleString('en-US', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit'});
  }

  async function doRequest() {
    try {
      const resp = await fetchWithTimeout(url, { timeout: timeout });
      const data = await resp.json();
      if (data && data.success) {
        log = `[${getTimestamp()}]: Success! Last response took ${data.latency} ms...`
        success = data.success;
        response = typeof data.response === "string" ? data.response : JSON.stringify(data.response);
      }
    } catch(e) {
      log = `[${getTimestamp()}]: Error!`
      success = false;
      response = e;
    };
  }
</script>

{#if response || log}
  <p class="h6">{operationName}:</p>
  <p class="log {success ? 'text-success' : 'text-danger'}">{log}</p>
  <code>{response}</code>
{/if}

<style>
  p {
    margin-top: 10px;
  }

  .log {
    margin-bottom: 0;
  }

  code {
    height: 100px;
    text-overflow: hidden;
    font-size: .6em
  }
</style>