<script>
  import { onDestroy, onMount } from 'svelte';
  import { isRunning } from './store.js';
  import { getTimestamp } from './main.js'

  export let appServerEndpoint;

  const CLUSTER_EVENTS_PATH = "/eventLog";
  const INTERVAL = 1; // in seconds

  let events = [];
  let requestInterval;

  onMount(() => {
  });

  onDestroy(() => {
    clearInterval(requestInterval);
  });

  isRunning.subscribe(value => {
		if (value) {
      requestInterval = setInterval(getAtlasClusterEvents, INTERVAL * 1000);
    } else {
      clearInterval(requestInterval);
    }
	});

  async function getAtlasClusterEvents() {  
    try {
      const resp = await fetch(appServerEndpoint + CLUSTER_EVENTS_PATH, { method: 'GET' });
      const data = await resp.json();
      if (resp.ok && data) {
        // prepend events
        events = data.reverse().concat(events);
      }
    } catch (e) {
      console.log(`Get Atlas Cluster events failed: ${e}`)
    }
  }
</script>

<div class="col">
  <div id="cluster-events" class="text-end">
    <p class="h5">Cluster event log</p>
    <table class="text-start float-end">
      {#each events.slice(0, 10) as event}
        <tr>
          <td class="text-end">{event.message}</td>
          <td><span class="text-muted">{getTimestamp(event.ts)}</span></td>
        </tr>
      {/each}
    </table>
  </div>
</div>

<style>
  #cluster-events {
    font-size: .75em
  }

  .text-muted {
    margin-left: 10px;
  }
</style>