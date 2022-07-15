<script>
  import { onDestroy, onMount } from 'svelte';
  import { isRunning } from './store.js';

  export let appServerEndpoint;

  const CLUSTER_EVENTS_PATH = "/getClusterEvents";
  const INTERVAL = 10; // in seconds

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

  function getMinDate() {
    const minDate = new Date();
    minDate.setSeconds(minDate.getSeconds() - INTERVAL);
    return minDate.toISOString();
  }

  async function getAtlasClusterEvents() {  
    try {
      const url = appServerEndpoint + CLUSTER_EVENTS_PATH + '?minDate=' + getMinDate();
      const resp = await fetch(url, { method: 'GET' });
      const data = await resp.json();
      if (resp.ok && data && data.results) {
        events = events.concat(data.results);
      }
    } catch (e) {
      console.log(`Get Atlas Cluster events failed: ${e}`)
    }
  }

  function getTimestamp() {
    return new Date().toLocaleString('en-US', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit'});
  }
</script>

<div class="col">
  <div id="cluster-events" class="text-end">
    <p class="h5">Cluster event log</p>
    <table class="text-start float-end">
      {#each events.reverse() as event}
        <tr>
          <td><span class="text-muted">{getTimestamp(event.created)}:</span></td>
          <td class="text-end">{event.eventTypeName}</td>
        </tr>
      {/each}
    </table>
  </div>
</div>

<style>
  #cluster-events {
    font-size: .75em
  }
</style>