<script>
	import { afterUpdate, onDestroy, onMount } from 'svelte';
  import { isRunning } from './store.js';
  import MongoNode from './MongoNode.svelte';

  export let appServerEndpoint;
  export let nodes = [];

  const INTERVAL = 1000;
  const CLUSTER_DETAILS_PATH = "/getClusterDetails";
  const DB_HELLO_PATH = "/hello";

  let getNodeTypesInterval;
  let hasTopologyLinesDrawn = false;

  onMount(async () => {
		getClusterConfig();
	});

  onDestroy(() => {
    clearInterval(getNodeTypesInterval);
  });

  isRunning.subscribe(value => {
		if (value) {
      // do dbHello each second so that the node types get updated after a failover
      getNodeTypesInterval = setInterval(getNodeTypes, INTERVAL);
    } else {
      clearInterval(getNodeTypesInterval);
    }
	});

  afterUpdate(async () => {
  });

	async function getClusterConfig() {
    try {
      const res = await fetch(appServerEndpoint + CLUSTER_DETAILS_PATH);
      const clusterConfig = await res.json();
      if (clusterConfig && clusterConfig.replicationSpec) {
        for (const region in clusterConfig.replicationSpec) {
          nodes = [...nodes, { region: region, type: 'Secondary'}];
        }
      }
      getNodeTypes();
    } catch(e) {
      console.log(`Fetching cluster config failed: ${e}`);
    }
	};

  async function getNodeTypes() {
    try {
      const res = await fetch(appServerEndpoint + DB_HELLO_PATH)
      const dbHello = await res.json();
      if (dbHello && dbHello.tags && dbHello.tags.region && dbHello.me === dbHello.primary) {
        const idx = nodes.findIndex(node => node.region === dbHello.tags.region);
        if (idx !== -1 && nodes[idx].type !== 'Primary' && nodes[idx].host !== dbHello.me) {
          nodes.forEach(node => node.type = 'Secondary');
          nodes[idx].type = 'Primary';
          nodes[idx].host = dbHello.me;
        }
      } else {
        console.log(`Could not determine primary. Connected to: ${dbHello.me}`)
      }
      drawClusterTopologyLines();
    } catch(e) {
      console.log(`Fetching output of db hello command failed: ${e}`);
    }
  }

  function drawClusterTopologyLines() {
    // TODO: do not use boolean to check if lines need to be drawn
    if (!hasTopologyLinesDrawn) {
      for (let i = 1; i < nodes.length; i++) {
        if (nodes[i - 1].iconElm && nodes[i].iconElm) {
          new LeaderLine(
            nodes[i - 1].iconElm,
            nodes[i].iconElm,
            {
              color: 'grey',
              startPlug: 'behind',
              endPlug: 'behind'
            }
          );
          hasTopologyLinesDrawn = true;
        }
      }
    }
  }
</script>

{#each nodes as node}
  <MongoNode type={node.type} region={node.region} bind:iconElm={node.iconElm}/>
{/each}