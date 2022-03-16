exports = function(arg) {
 
const peerData = context.functions.execute(atlas_getNetworkPeers);
const vpcData = context.functions.execute(atlas_getNetworkVPCs);

console.log(JSON.stringify(peerData, null, 2));
console.log(JSON.stringify(vpcData, null, 2));
 
};