<script lang="ts">
  import { onMount } from 'svelte';
  import { getTimestamp } from './common'

  export let socket: Socket;

  let events: ClusterEvent[] = [];

  onMount(() => {
    listenForEvents();
  });

  function listenForEvents(): void {
    if (socket) {
      socket.on('logEvent', function(data: ClusterEvent) {
        if (data) {
          addEvent(data);
        }
      });
    }
  }

  function addEvent(event: ClusterEvent): void {
    if (event.date) {
      event.date = new Date(event.date);
    } else {
      event.date = new Date();
    }
    // sometimes mongo driver sends events multiple times
    // only add event if not a duplicate
    // (same message and send within half a second of other event)
    if (events.length === 0 || event.message !== events[0].message ||
        (events[0].date && event.date && events[0].date.getTime() + 500 < event.date.getTime())) {
      if (events.length > 9) {
        events.pop();
      }
      events = [event, ...events];
    }
  }
</script>

<div id="cluster-events" class="text-end">
  <h2>Cluster event log</h2>
  {#if events.length === 0}
    -
  {/if}
  <table class="text-start float-end">
    <tbody>
      {#each events as event}
        <tr>
          <td class="text-end">{event.message}</td>
          <td><span class="text-muted">{event.date ? getTimestamp(event.date) : ''}</span></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .text-muted {
    margin-left: 10px;
  }
</style>