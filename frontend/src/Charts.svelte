<script>
  import ChartsEmbedSDK from '@mongodb-js/charts-embed-dom';
  import { onMount } from 'svelte';

  const CHART_BASE_URL = "https://charts.mongodb.com/charts-rkauffman-apwwg";
  const CHART_IDS = [
    { id: "623ef81d-eba3-4c9f-8c1e-993e95ccb292" },
    { id: "623fa7ae-eba3-44a1-889c-993e9525f3eb" }
  ];

  onMount(async () => {
		createDashboard();
	});

  async function createDashboard() {
    const sdk = new ChartsEmbedSDK({
      baseUrl: CHART_BASE_URL
    });

    for (const chartId of CHART_IDS) {
      const chart = sdk.createChart({
        chartId: chartId.id,
        height: "300px",
        maxDataAge: 10,
        showAttribution: false
      });
      await chart.render(chartId.elm);
      chart.setFilter({ ts: { $gt: new Date() }});
    }
  }
</script>

{#each CHART_IDS as chart}
  <div class="col" bind:this={chart.elm}/>
{/each}