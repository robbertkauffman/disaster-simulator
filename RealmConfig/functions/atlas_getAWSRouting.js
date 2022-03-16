exports = function(arg) {
 
function getPeerData() {
  return context.functions.execute('atlas_getNetworkPeers');
}

const peerData = getPeerData();

// const vpcData = context.functions.execute('atlas_getNetworkVPCs');

// EJSON.parse(response.body.text());
console.log(EJSON.parse(peerData.body.text())); 


};