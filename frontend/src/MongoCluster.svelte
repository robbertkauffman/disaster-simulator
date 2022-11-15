<script>
	import { onMount } from 'svelte';
  import MongoNode from './MongoNode.svelte';

  export let appServerEndpoint;
  export let clusterType = 'local';
  export let nodes = [];
  export let socket;

  let regions = new Set();
  let colWidth = 3;

  onMount(async () => {
    await getClusterType();
		await getClusterConfig();
    listenForNodeChanges();
    getNodeTypes();
	});

  async function getClusterType() {
    try {
      const resp = await fetch(appServerEndpoint + '/getClusterType');
      const respText = await resp.text();
      if (resp.ok && respText) {
        clusterType = respText;
        console.log(`Cluster type is ${clusterType}`);
      }
    } catch (e) {
      console.log(`Failed getting cluster type: ${e}`);
    }
  }

	async function getClusterConfig() {
    try {
      const res = await fetch(appServerEndpoint + '/rsConfig');
      const rsConfig = await res.json();
      if (rsConfig && rsConfig.members && rsConfig.members.length > 0) {
        for (const node of rsConfig.members) {
          // only display electable nodes
          if (node.priority !== 0) {
            // Atlas clusters internal hosts are different than addresses used in topology events, 
            // so use public host which is the same
            let host;
            if (clusterType === 'atlas' && node.horizons && node.horizons.PUBLIC) {
              host = node.horizons.PUBLIC;
            } else {
              host = node.host;
            }
            
            const newNode = {
              host: host,
              type: 'Unknown',
              connectedToApp: false,
              syncSourceHost: node.syncSourceHost,
              altHost: node.host
            };

            // Atlas clusters have auto-populated tags, but non-Atlas clusters usually don't
            if (node.tags && node.tags.region) {
              newNode.region = node.tags.region,
              regions.add(node.tags.region);
            }

            nodes = [...nodes, newNode];
          }
        }

        if (regions.size > 1) {
          colWidth = Math.max(1, Math.floor(12 / regions.size));
        } else {
          colWidth = Math.max(1, Math.floor(12 / nodes.length));
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
    for (const targetNode of nodes) {
      if (targetNode.iconElm && targetNode.syncSourceHost) {
        const sourceNode = nodes.find(node => node.altHost === targetNode.syncSourceHost);
        if (sourceNode && sourceNode.iconElm) {
          new LeaderLine(
            sourceNode.iconElm,
            targetNode.iconElm,
            {
              color: 'grey',
              startPlug: 'behind',
              endPlug: 'behind'
            }
          );
        }
      }
    }
    // for (let i = 1; i < nodes.length; i++) {
    //   if (nodes[i - 1].iconElm && nodes[i].iconElm) {
    //     new LeaderLine(
    //       nodes[i - 1].iconElm,
    //       nodes[i].iconElm,
    //       {
    //         color: 'grey',
    //         startPlug: 'behind',
    //         endPlug: 'behind'
    //       }
    //     );
    //   }
    // }
  }
</script>

{#if regions.size > 1}
  <!-- can't iterate over a set so need to convert to array -->
  {#each [...regions] as region}
    <div class="col-{colWidth}">
      {#each nodes.filter(node => node.region === region) as node (node.host)}
        <MongoNode name={node.host.split(':')[0]} type={node.type} region={node.region}
                  isChangingState={node.isChangingState} isNewPrimary={node.isNewPrimary}
                  appServerEndpoint={appServerEndpoint} clusterType={clusterType}
                  bind:iconElm={node.iconElm}/>
      {/each}
    </div>
  {/each}
{:else}
  {#each nodes as node (node.host)}
    <div class="col-{colWidth}">
      <MongoNode name={node.host.split(':')[0]} type={node.type} region={node.region}
                isChangingState={node.isChangingState} isNewPrimary={node.isNewPrimary}
                appServerEndpoint={appServerEndpoint} clusterType={clusterType}
                bind:iconElm={node.iconElm}/>
    </div>
  {/each}
{/if}