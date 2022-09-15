<script>
  import { onMount } from 'svelte';
  import { getTimestamp } from './common.js'

  export let socket;

  let requestLog = [];

  onMount(() => {
    listenForSlowFailedRequest();
  });

  function listenForSlowFailedRequest() {
    socket.on('logSlowFailedRequest', function(data) {
      if (data) {
        addRequest(data);
      }
    });
  }

  function addRequest(request) {
    if (request.ts) {
      request.ts = new Date(request.ts);
    } else {
      request.ts = new Date();
    }
    if (requestLog.length > 9) {
      requestLog.pop();
    }
    requestLog = [request, ...requestLog];
  }
</script>

<h2>Slow/failed query log</h2>
{#if requestLog.length === 0}
  -
{/if}
{#each requestLog as request}
  <p class="log" class:text-danger={!request.success}>
    <span>{getTimestamp(request.ts)}:</span> 
    '{request.operation}' {request.success ? 'in' : 'failed after'} {request.latency}ms...
  </p>
{/each}

<style>
  .log {
    margin-bottom: 0;
  }
</style>