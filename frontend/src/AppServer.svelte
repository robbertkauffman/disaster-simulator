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
<div class="col-3"></div>
<div class="col-6 text-center">
  <figure class="figure">
    <figcaption class="figure-caption text-center">App server</figcaption>
    <img src="img/appserver.png" class="figure-img" alt="appserver" bind:this={appServerIconElm}/>
  </figure>
</div>
<div class="col-3 legend">
  <div class="row">
    <figure class="figure">
      <img src="img/primary-active.png" class="figure-img" alt="Primary node" />
      <figcaption class="figure-caption">Primary node</figcaption>
    </figure>
  </div>
  <div class="row">
    <figure class="figure">
      <img src="img/secondary-active.png" class="figure-img" alt="Secondary node" />
      <figcaption class="figure-caption">Secondary node</figcaption>
    </figure>
  </div>
</div>

<style>
  img {
    height: 40px;
    width: 40px;
  }

  .legend figure {
    margin: 0.1rem 0;
  }

  .legend .figure-caption, .legend .figure-img {
    float: right;
    line-height: 36px;
  }

  .legend .figure-caption {
    margin-right: 10px;
  }
</style>