<script>
	import { afterUpdate, onDestroy, onMount } from 'svelte';
  import { isRunning, isTestingFailover } from './store.js';
  import MongoNode from './MongoNode.svelte';

  export let appServerEndpoint;
  export let nodes = [];

  const INTERVAL = 1000;
  const RS_CONFIG_PATH = "/rsConfig";
  const RS_STATUS_PATH = "/rsStatus";

  let getNodeTypesInterval;
  let hasTopologyLinesDrawn = false;

  onMount(async () => {
		getClusterConfig();
	});

  onDestroy(() => {
    clearInterval(getNodeTypesInterval);
    unsubscribe;
  });

  const unsubscribe = isRunning.subscribe(value => {
		if (value) {
      // run rs.status() each second so that the node types get updated after a failover
      getNodeTypesInterval = setInterval(getNodeTypes, INTERVAL);
    } else {
      clearInterval(getNodeTypesInterval);
    }
	});

  afterUpdate(async () => {
  });

	async function getClusterConfig() {
    try {
      const res = await fetch(appServerEndpoint + RS_CONFIG_PATH);
      const rsConfig = await res.json();
      if (rsConfig && rsConfig.members && rsConfig.members.length > 0) {
        for (const node of rsConfig.members) {
          // only display electable nodes
          if (node.priority !== 0) {
            // Atlas clusters have auto-populated tags, but non-Atlas clusters usually don't
            if (node.tags && node.tags.region) {
              nodes = [...nodes, { host: node.host, region: node.tags.region, connectedToApp: false }];
            } else {
              nodes = [...nodes, { host: node.host, connectedToApp: false }];
            }
          }
        }
      }
      getNodeTypes();
    } catch(e) {
      console.log(`Fetching cluster config failed: ${e}`);
    }
	};

  async function getNodeTypes() {
    try {
      const res = await fetch(appServerEndpoint + RS_STATUS_PATH)
      const rsStatus = await res.json();
      if (rsStatus && rsStatus.members) {
        rsStatus.members.forEach((member) => {
          const idx = nodes.findIndex(node => node.host === member.name);
          if (idx !== -1) {
            if (nodes[idx].type !== "PRIMARY" && member.stateStr === 'PRIMARY') {
              isTestingFailover.set(false);
              nodes[idx].isNewPrimary = true;
              nodes[idx].connectedToApp = true;
            } else {
              nodes[idx].isNewPrimary = false;
              nodes[idx].connectedToApp = false;
            }
            nodes[idx].type = member.stateStr;
          }
        });
      } else {
        console.log(`Error! Could not determine primary`);
      }
      drawClusterTopologyLines();
    } catch(e) {
      console.log(`Fetching output of rs.status() command failed: ${e}`);
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
  <MongoNode name={node.host.split(':')[0]} type={node.type} region={node.region} isNewPrimary={node.isNewPrimary}
             appServerEndpoint={appServerEndpoint} bind:iconElm={node.iconElm}/>
{/each}