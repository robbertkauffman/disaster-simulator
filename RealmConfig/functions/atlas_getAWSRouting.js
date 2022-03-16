exports = async function(arg) {
 
const myPeers = await context.functions.execute('atlas_getNetworkPeers');
const myVPCs = await context.functions.execute('atlas_getNetworkVPCs');

console.log(JSON.stringify(myPeers, null, 2));
console.log(JSON.stringify(myVPCs, null, 2));

};