<script>
  import { onMount } from 'svelte';
  import { getTimestamp } from './common.js'

  export let socket;

  const SLOW_QUERY_TRESHOLD = 100;

  let requestLog = [];

  onMount(() => {
    listenForLogRequest();
  });

  function listenForLogRequest() {
    socket.on('logRequest', function(data) {
      if (data) {
        addRequest(data);
      }
    });
  }

  function addRequest(request) {
    if (!request.success || request.latency >= SLOW_QUERY_TRESHOLD) {
      if (request.ts) {
        request.ts = new Date(request.ts);
      } else {
        request.ts = new Date();
      }
      console.log(request);
      if (requestLog.length > 9) {
        requestLog.pop();
      }
      requestLog = [request, ...requestLog];
    }
  }
</script>

<h2>Slow/failed query log</h2>
{#if requestLog.length === 0}
  ...
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