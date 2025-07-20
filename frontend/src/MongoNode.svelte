<script>
  import { fade } from 'svelte/transition';
  import { isRunning } from './store';

  export let clusterType;
  export let type;
  export let name;
  export let isChangingState = false;
  export let isNewPrimary = false;
  export let goalState = '';
  export let iconElm = undefined;
  export let appServerEndpoint;
  let state;
  let lastAction;

  function getImagePath(type) {
    switch (type) {
      case 'Primary':
        return 'primary-active.png';
      case 'Secondary':
        return 'secondary-active.png';
    }
    return 'unknown.png';
  }

  $: if (!isChangingState && goalState) {
    state = goalState;
    // need to reset state with a small delay, otherwise it doesn't render the goal state
    // setTimeout only has global context, so need to reset the values via a seperate function
    setTimeout(resetState, 100);
  }

  $: if (isNewPrimary) {
    isNewPrimary = false;
    goalState = "Node elected as new primary!";
    state = goalState;
    setTimeout(resetState, 100);
  }

  function resetState() {
    state = undefined;
    goalState = undefined;
  }

  async function doPostRequest(apiPath, changingState, _goalState) {
    try {
      const resp = await fetch(appServerEndpoint + '/' + apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerName: name })
      });
      if (resp.ok) {
        // const body = await resp.json();
        isChangingState = true;
        state = changingState;
        goalState = _goalState;
        lastAction = apiPath;
        return true;
      }
    } catch (e) {
      console.log(`${apiPath} failed: ${e}`)
    }
    return false;
  }

  function stepDown() {
    doPostRequest('stepDown', 'Node is stepping down', 'Node has stepped down');
  }

  function restartNode() {
    doPostRequest('restartNode', 'Restarting node', 'Node has restarted');
  }

  function stopNode() {
    doPostRequest('stopNode', 'Stopping node', 'Node has stopped');
  }

  function killNode() {
    doPostRequest('killNode', 'Killing node', 'Node has been killed');
  }

  function startNode() {
    doPostRequest('startNode', 'Starting node', 'Node has started');
  }

  function reconnectNode() {
    doPostRequest('reconnectNode', 'Reconnecting node', 'Node has reconnected');
  }

  function disconnectNode() {
    doPostRequest('disconnectNode', 'Disconnecting node', 'Node has disconnected');
  }

  function testFailover() {
    doPostRequest('testFailover', 'Restarting node', 'Node has restarted');
  }
</script>

<div class="node">
  <figure class="figure" class:blink={isChangingState} data-tooltip={type + ': ' +name}>
    <img src="img/{getImagePath(type)}" class="figure-img" alt="{type} node" bind:this={iconElm} />
    <!-- <figcaption class="figure-caption">{type}</figcaption> -->
  </figure>
  {#if $isRunning && !isChangingState}
    {#if clusterType === 'local' || (clusterType === 'atlas' && type === 'Primary')}
      <div class="context-menu" class:blink={isChangingState}>
        <i class="bi bi-caret-down-square menu-button"></i>
        <ul class="menu">
          {#if clusterType === 'local'}
            {#if type === 'Primary'}
              <li><button on:click="{stepDown}"><i class="bi bi-chevron-bar-down"></i> Step down</button></li>  
            {/if}
            {#if type !== 'Unknown'}
              <li><button on:click="{restartNode}"><i class="bi bi-arrow-clockwise"></i> Restart</button></li>
              <li><button on:click="{stopNode}"><i class="bi bi-stop-fill"></i> Stop</button></li>
              <li><button on:click="{killNode}"><i class="bi bi-lightning-fill"></i> Kill</button></li>
              <li><button on:click="{disconnectNode}"><i class="bi bi-slash-circle"></i> Disconnect</button></li>
            {:else}
              {#if lastAction === 'stopNode' || lastAction === 'killNode' || typeof lastAction === 'undefined'}
                <li><button on:click="{startNode}"><i class="bi bi-power"></i> Start</button></li>
              {/if}
              {#if lastAction === 'disconnectNode' || typeof lastAction === 'undefined'}
                <li><button on:click="{reconnectNode}"><i class="bi bi-check-circle"></i> Reconnect</button></li>
              {/if}
            {/if}
          {:else if clusterType === 'atlas'}
            {#if type === 'Primary'}
              <li><button on:click="{testFailover}"><i class="bi bi-lightning-fill"></i> Test failover</button></li>  
            {/if}
          {/if}
        </ul>
      </div>
    {/if}
  {/if}
  {#if $isRunning && state}
    {#if state !== goalState}
      <p class="node-state">{state}...</p>
    {:else}
      <p class="node-state" out:fade="{{delay: 5000, duration: 5000}}">{state}</p>
    {/if}
  {/if}
</div>

<style>
  img {
    height: 40px;
    width: 40px;
  }

  .node {
    position: relative;
    margin: 1rem 0;
    height: 40px;
    width: 40px;
  }

  /* .figure-caption {
    margin-top: 15px;
  } */

  .blink {
    -webkit-animation: blink 3s infinite both;
            animation: blink 3s infinite both;
  }
  @-webkit-keyframes blink {
    0%, 50%, 100% {
      opacity: 1;
    }
    25%, 75% {
      opacity: 0.25;
    }
  }
  @keyframes blink {
    0%, 50%, 100% {
      opacity: 1;
    }
    25%, 75% {
      opacity: 0.25;
    }
  }

  [data-tooltip]:before {
    z-index: 998;
    position: absolute;
    display: none;
    content: attr(data-tooltip);
    margin-top: -50px;
    padding: 10px;
    background-color: slategray;
    color: white;
    border-radius: 10px;
    box-shadow: 2px 2px 1px rgb(50 50 50 / 25%);
  }

  [data-tooltip]:hover:before {
    display: block;
  }

  .node-state {
    position: absolute;
    z-index: 9999;
    text-shadow:   
        0 0 5px #ffffff,  
        0 0 10px #ffffff,  
        0 0 20px #ffffff,  
        0 0 40px #ffffff,  
        0 0 80px #ffffff;  
  }
</style>