<script>
	import { onMount } from 'svelte';
  import { isRunning } from './store';
  import MongoNode from './MongoNode.svelte';

  export let appServerEndpoint;
  export let clusterType = 'local';
  export let nodes = [];
  export let socket;

  let regions = new Set();

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
  }
</script>

<!-- can't iterate over a set so need to convert to array -->
{#each [...regions] as region}
  <div class="row region align-items-center">
      <div class="col-3 region-label">
        {region}
      </div>
    {#each nodes.filter(node => node.region === region) as node (node.host)}
      <div class="col-{Math.floor(9 / nodes.filter(node => node.region == region).length)}">
        <MongoNode name={node.host.split(':')[0]} type={node.type}
                  isChangingState={node.isChangingState} isNewPrimary={node.isNewPrimary}
                  appServerEndpoint={appServerEndpoint} clusterType={clusterType}
                  bind:iconElm={node.iconElm}/>
      </div>
    {/each}
  </div>
{/each}

<style>
  .region-label {
    position: relative;
  }

  .region {
    background-color: #eee;
    border-radius: 10px;
    margin-bottom: 25px;
    padding-top: 10px;
  }
</style>