exports = function(arg) {
 
const peerData = context.functions.execute('atlas_getNetworkPeers');
const vpcData = context.functions.execute('atlas_getNetworkVPCs');

// EJSON.parse(response.body.text());
console.log(EJSON.parse(peerData.text())); 
console.log(EJSON.parse(peerData.text()));

};