<script>
  import { afterUpdate } from 'svelte';

  export let mongoNodes;

  let appServerIconElm;
  let topologyLine;

  afterUpdate(() => {
    drawAppTopologyLines();
  });

  function drawAppTopologyLines() {
    if (mongoNodes.length > 1 ) {
      const idx = mongoNodes.findIndex(node => node.connectedToApp);
      if (idx !== -1 && mongoNodes[idx].iconElm) {
        const newTopologyLine = new LeaderLine(
          appServerIconElm,
          mongoNodes[idx].iconElm,
          {
            color: '#8a795d',
            startSocket: 'bottom',
            endSocket: 'top',
          }
        );
        if (topologyLine) {
          topologyLine.remove();
        }
        topologyLine = newTopologyLine;
      }
    }
  }
</script>

<div class="col-3 text-center">
  <figure class="figure">
    <figcaption class="figure-caption text-center">App server</figcaption>
    <img src="img/appserver.png" class="figure-img" alt="appserver" bind:this={appServerIconElm}/>
  </figure>
</div>

<style>
  img {
    height: 40px;
    width: 40px;
  }
</style>