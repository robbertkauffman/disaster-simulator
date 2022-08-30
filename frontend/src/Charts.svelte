<script>
  import ChartsEmbedSDK from '@mongodb-js/charts-embed-dom';
  import { onMount } from 'svelte';  

  export let startDate = new Date();

  onMount(() => {
		createDashboard();
	});

  async function createDashboard() {
    const sdk = new ChartsEmbedSDK({
      baseUrl: DR_CHART_BASE_URL
    });

    for (const chartId of DR_CHART_IDS) {
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

{#each DR_CHART_IDS as chart}
  <div class="col" bind:this={chart.elm}/>
{/each}