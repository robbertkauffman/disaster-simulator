<script>
  import { onMount } from 'svelte';

  export let socket;
  let stats = {};

  onMount(() => {
    listenForUpdateStats();
  });

  function listenForUpdateStats() {
    if (socket) {
      socket.on('updateStats', function(data) {
        if (data && data.length > 0) {
          stats = data[0];
        }
      });
    }
  }
</script>

{#if stats}
  <div class="col col-lg-2">
    <p>Average latency:</p>
    <p class="h5">
      {#if stats.avg}
        {parseFloat(stats.avg).toFixed(2)} ms
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
{/if}

<style>
  .col { margin: 50px 0 25px; }
  .col p { text-align: center; }
</style>