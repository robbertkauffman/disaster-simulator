<script>
  import { fade } from 'svelte/transition';
  import { isRunning, isTestingFailover } from './store';

  export let type;
	export let region = 'REGION';
  export let isNewPrimary = false;
  export let iconElm = undefined;

  function getImagePath(type) {
    if (type) {
      switch (type.toLowerCase()) {
        case 'primary':
          return 'primary-active.png';
        case 'secondary':
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
</script>

<div class="col-3 text-center">
  <figure class="figure" class:blink={type === 'Primary' && $isTestingFailover}>
    <img src="img/{getImagePath(type)}" class="figure-img" alt="{type} node" bind:this={iconElm} />
    <figcaption class="figure-caption">{type} — {region}</figcaption>
  </figure>
  {#if $isRunning && isNewPrimary}
    <p out:fade="{{delay: 10000, duration: 5000}}">Elected as new primary!</p>
  {/if}
</div>

<style>
  img {
    height: 40px;
    width: 40px;
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
</style>