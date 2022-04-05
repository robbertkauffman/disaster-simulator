<script>
  export let type = 'TYPE';
	export let region = 'REGION';
  export let iconElm = undefined;
</script>

<div class="col-3 text-center">
  <figure class="figure">
    <img src="img/{type}-active.png" class="figure-img" alt="{type} node" bind:this={iconElm} />
    <figcaption class="figure-caption">{type} — {region}</figcaption>
  </figure>
</div>

<style>
  img {
    height: 40px;
    width: 40px;
  }
</style>