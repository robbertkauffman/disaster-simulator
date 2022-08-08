<script>
  import { fade } from 'svelte/transition';
  import { isRunning, isTestingFailover } from './store';

  export let type;
  export let name;
	export let region;
  export let isNewPrimary = false;
  export let iconElm = undefined;
  export let appServerEndpoint;

  function getImagePath(type) {
    if (type) {
      switch (type) {
        case 'PRIMARY':
          return 'primary-active.png';
        case 'SECONDARY':
          return 'secondary-active.png';
      }
    }
    return 'unknown.png';
  }

  $: if (isNewPrimary) {
    // need to toggle isNewPrimary with a small delay, otherwise it doesn't render the election notification element
    // setTimeout only has global context, so need to toggle the value via a seperate function
		setTimeout(() => { fadeElectionNotification() }, 100);
	}

  function fadeElectionNotification() {
    isNewPrimary = false;
  }

  async function doPostRequest(path) {
    try {
      const resp = await fetch(appServerEndpoint + '/' + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerName: name })
      });
      if (resp.ok) {
        return true;
      }
    } catch (e) {
      console.log(`${path} failed: ${e}`)
    }
  }

  function stepDown() {
    doPostRequest('stepDown');
  }

  function killNode() {
    doPostRequest('killNode');
  }

  function startNode() {
    doPostRequest('startNode');
  }

  function reconnectNode() {
    doPostRequest('reconnectNode');
  }

  function disconnectNode() {
    doPostRequest('disconnectNode');
  }
</script>

<div class="col-3 text-center container">
  <figure class="figure" class:blink={type === 'Primary' && $isTestingFailover}>
    <img src="img/{getImagePath(type)}" class="figure-img" alt="{type} node" bind:this={iconElm} />
    <figcaption class="figure-caption">{type} {#if region} — {region}{/if}</figcaption>
  </figure>
  {#if $isRunning}
  <div class="context-menu"> 
    <i class="bi bi-caret-down-square menu-button"></i>
    <ul class="menu">
        {#if type && type === "PRIMARY"}
          <li><a href="#" on:click="{stepDown}"><i class="bi bi-chevron-bar-down"></i> Step down</a></li>  
        {/if}
        {#if type && type !== "(not reachable/healthy)"}
          <li><a href="#" on:click="{killNode}"><i class="bi bi-lightning-fill"></i> Kill</a></li>
        {:else}
          <li><a href="#" on:click="{startNode}"><i class="bi bi-arrow-clockwise"></i> Start</a></li>
        {/if}
        {#if type && type !== "(not reachable/healthy)"}
          <li><a href="#" on:click="{disconnectNode}"><i class="bi bi-slash-circle"></i> Disconnect</a></li>
        {:else}
          <li><a href="#" on:click="{reconnectNode}"><i class="bi bi-check-circle"></i> Reconnect</a></li>
        {/if}
    </ul>
  </div>
  {/if}
  {#if $isRunning && isNewPrimary}
    <p out:fade="{{delay: 10000, duration: 5000}}">Elected as new primary!</p>
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
    position: absolute;
    top: 34px;
    left: 101px;
    text-align: left;
    z-index: 999;
  }

  .menu {
    display: none;
    list-style: none;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0 10px 10px 10px;
    box-shadow: 0 10px 20px rgb(50 50 50 / 25%);
    padding: 10px 0;
    margin-top: -3px;
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

  .menu > li > a {
    padding: 10px 30px 10px 15px;
    width: 100%;
    display: flex;
    text-decoration: none;
    color: #000;
    font-weight: 500;
    transition: 0.5s linear;
  }

  .menu > li > a:hover {
    background: #ced4da;
    color: darkgreen;
  }

  .menu > li > a > i {
    padding-right: 10px;
  }
</style>