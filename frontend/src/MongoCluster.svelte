<script>
	import { onMount } from 'svelte';
  import MongoNode from './MongoNode.svelte';

  export let appServerEndpoint;
  export let nodes = [];
  export let socket;

  const RS_CONFIG_PATH = "/rsConfig";

  onMount(async () => {
		await getClusterConfig();
    listenForNodeChanges();
    getNodeTypes();
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
              nodes = [...nodes, { host: node.host, type: 'Unknown', region: node.tags.region, connectedToApp: false }];
            } else {
              nodes = [...nodes, { host: node.host, type: 'Unknown', connectedToApp: false }];
            }
          }
        }
      }
    } catch(e) {
      console.log(`Fetching cluster config failed: ${e}`);
    }
	}

  function getNodeTypes() {
    socket.emit('getNodeTypes');
  }

  function listenForNodeChanges() {
    socket.on('updateNodeType', function(updatedNode) {
      if (updatedNode && updatedNode.address && updatedNode.oldType && updatedNode.newType) {
        const type = updatedNode.newType;
        const idx = nodes.findIndex(node => node.host === updatedNode.address);
        if (idx !== -1) {
          if (type === 'Primary') {
            nodes[idx].connectedToApp = true;
            drawClusterTopologyLines();
            // don't trigger primary elected notification at initialization
            if (!updatedNode.init) {
              nodes[idx].isNewPrimary = true;
            }
          } else if (nodes[idx].type === 'Primary') {
            // reset new primary flag so that notification doesn't keep reappearing
            nodes[idx].isNewPrimary = false;
            nodes[idx].connectedToApp = false;
            drawClusterTopologyLines();
          }
          nodes[idx].type = type;
          nodes[idx].isChangingState = false;
        } else {
          console.log(`Couldn't find node ${updatedNode.address} in rs.config for update`);
        }
      }
    });
  }

  function drawClusterTopologyLines() {
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
      }
    }
  }
</script>

{#each nodes as node (node.host)}
  <MongoNode name={node.host.split(':')[0]} type={node.type} region={node.region} isChangingState={node.isChangingState} 
             isNewPrimary={node.isNewPrimary} appServerEndpoint={appServerEndpoint} bind:iconElm={node.iconElm}/>
{/each}