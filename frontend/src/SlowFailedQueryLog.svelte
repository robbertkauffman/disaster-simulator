<script lang="ts">
  import { onMount } from 'svelte';
  import { getTimestamp } from './common'

  export let socket: Socket;

  let requestLog: Request[] = [];

  onMount(() => {
    listenForSlowFailedRequest();
  });

  function listenForSlowFailedRequest(): void {
    socket.on('logSlowFailedRequest', function(data: Request) {
      if (data) {
        addRequest(data);
      }
    });
  }

  function addRequest(request: Request): void {
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
    <span>{request.ts ? getTimestamp(request.ts) : ''}:</span>
    '{request.operation}' {request.success ? 'in' : 'failed after'} {request.latency}ms...
  </p>
{/each}

<style>
  .log {
    margin-bottom: 0;
  }
</style>