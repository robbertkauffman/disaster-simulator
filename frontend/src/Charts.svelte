<script>
  import ChartsEmbedSDK from '@mongodb-js/charts-embed-dom';
  import { onMount } from 'svelte';  

  export let startDate = new Date();

  // global variables DSIM_CHART_IDS and DSIM_CHART_BASE_URL 
  // are configured in frontend/public/index.html
  const charts = DSIM_CHART_IDS;
  const chartsBaseUrl = DSIM_CHARTS_BASE_URL;

  onMount(() => {
		createDashboard();
	});

  async function createDashboard() {
    const sdk = new ChartsEmbedSDK({
      baseUrl: chartsBaseUrl
    });

    for (const chartId of charts) {
      const chart = sdk.createChart({
        chartId: chartId.id,
        height: "300px",
        filter: { ts: { $gt: startDate }},
        maxDataAge: 10,
        showAttribution: false
      });
      await chart
        .render(chartId.elm)
        .catch(() => console.log('Error while rendering chart'));
    }
  }
</script>

{#each charts as chart}
  <div class="col" bind:this={chart.elm}/>
{/each}