<script>
  import { onMount } from 'svelte';
  import { getTimestamp } from './main.js'

  export let socket;

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

{#if requestLog.length > 0}
  <h2>App log</h2>
  {#each requestLog as request}
    <p class="log {request.success ? 'text-success' : 'text-danger'}"><span>{getTimestamp(request.ts)}:</span> '{request.operation}' in {request.latency}ms...</p>
  {/each}
{/if}

<style>
  .log {
    margin-bottom: 0;
  }
</style>