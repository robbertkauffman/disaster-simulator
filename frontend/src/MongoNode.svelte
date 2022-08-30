<script>
  import { fade } from 'svelte/transition';
  import { isRunning } from './store';

  export let type;
  export let name;
	export let region;
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
</script>

<div class="col-3 text-center container">
  <figure class="figure" class:blink={isChangingState}>
    <img src="img/{getImagePath(type)}" class="figure-img" alt="{type} node" bind:this={iconElm} />
    <figcaption class="figure-caption">{type} {#if region} — {region}{/if}</figcaption>
  </figure>
  {#if $isRunning}
  <div class="context-menu" class:blink={isChangingState}>
    <i class="bi bi-caret-down-square menu-button"></i>
    <ul class="menu">
        {#if type && type === "Primary"}
          <li><button on:click="{stepDown}"><i class="bi bi-chevron-bar-down"></i> Step down</button></li>  
        {/if}
        {#if type && type !== "Unknown"}
          <li><button on:click="{killNode}"><i class="bi bi-lightning-fill"></i> Kill</button></li>
        {:else if lastAction !== 'disconnectNode'}
          <li><button on:click="{startNode}"><i class="bi bi-arrow-clockwise"></i> Start</button></li>
        {/if}
        {#if type && type !== "Unknown"}
          <li><button on:click="{disconnectNode}"><i class="bi bi-slash-circle"></i> Disconnect</button></li>
        {:else if lastAction !== 'killNode'}
          <li><button on:click="{reconnectNode}"><i class="bi bi-check-circle"></i> Reconnect</button></li>
        {/if}
    </ul>
  </div>
  {/if}
  {#if $isRunning && state}
    {#if state !== goalState}
      <p>{state}...</p>
    {:else}
      <p out:fade="{{delay: 5000, duration: 5000}}">{state}</p>
    {/if}
  {/if}
</div>

<style>
  img {
    height: 40px;
    width: 40px;
  }

  .figure-caption {
    margin-top: 15px;
  }

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

  .container {
    position: relative;
  }

  .context-menu {
    position: relative;
    top: -65px;
    text-align: center;
    z-index: 999;
  }

  .menu {
    display: none;
    position: absolute;
    right: 0;
    margin-top: -3px;
    list-style: none;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0 10px 10px 10px;
    box-shadow: 0 10px 20px rgb(50 50 50 / 25%);
    padding: 10px 0;
  }

  .context-menu:hover .menu {
    display: block;
  }

  .menu-button {
    background-color: white;
  }

  .context-menu:hover .menu-button {
    color: darkgreen;
  }

  .menu > li {
    min-width: 150px;
  }

  .menu > li > button {
    padding: 10px 30px 10px 15px;
    width: 100%;
    display: flex;
    text-decoration: none;
    color: #000;
    font-weight: 500;
    transition: 0.5s linear;
    border: none;
    background-color: transparent;
  }

  .menu > li > button:hover {
    background-color: #ced4da;
    color: darkgreen;
  }

  .menu > li > button > i {
    padding-right: 10px;
  }
</style>