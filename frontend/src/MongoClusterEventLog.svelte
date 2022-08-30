<script>
  import { onMount } from 'svelte';
  import { getTimestamp } from './main.js'

  export let socket;

  let events = [];

  onMount(() => {
    listenForEvents();
  });

  function listenForEvents() {
    if (socket) {
      socket.on('logEvent', function(data) {
        if (data) {
          addEvent(data);
        }
      });
    }
  }

  function addEvent(event) {
    if (events.length > 9) {
      events.pop();
    }
    events = [event, ...events];
  }
</script>

<div id="cluster-events" class="text-end">
  <h2>Cluster event log</h2>
  <table class="text-start float-end">
    {#each events as event}
      <tr>
        <td class="text-end">{event.message}</td>
        <td><span class="text-muted">{getTimestamp(event.date)}</span></td>
      </tr>
    {/each}
  </table>
</div>

<style>
  .text-muted {
    margin-left: 10px;
  }
</style>