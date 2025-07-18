<script lang="ts">
  import { onMount } from 'svelte';

  export let socket: Socket;
  let stats: Stats = {};
  let failed: number = 0;

  onMount(() => {
    listenForUpdateStats();
    listenForSlowFailedRequest();
  });

  function listenForUpdateStats(): void {
    if (socket) {
      socket.on('updateStats', function(data: Stats[]) {
        if (data && data.length === 1) {
          stats = data[0];
        }
      });
    }
  }

  function listenForSlowFailedRequest(): void {
    socket.on('logSlowFailedRequest', function(data: Request) {
      if (data && data.success === false) {
        failed++;
      }
    });
  }
</script>

{#if stats}
  <div class="col col-lg-2">
    <p>Average latency:</p>
    <p class="h5">
      {#if stats.avg}
        {stats.avg.toFixed(2)} ms
      {:else}
        -
      {/if}
    </p>
  </div>
  <div class="col col-lg-2">
    <p>Max latency:</p>
    <p class="h5">
      {#if stats.max}
        {stats.max} ms
      {:else}
        -
      {/if}
    </p>
  </div>
  <div class="col col-lg-2">
    <p>Failed operations:</p>
    <p class="h5">
      {#if failed}
        {failed}
      {:else}
        -
      {/if}
    </p>
  </div>
{/if}

<style>
  .col { margin: 50px 0 25px; }
  .col p { text-align: center; }
</style>