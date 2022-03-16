exports = async function(arg) {
 
const myPeers = await context.functions.execute('atlas_getNetworkPeers');
const myVPCs = await context.functions.execute('atlas_getNetworkVPCs');

function mergeArrs(a,b){
  return a.map((obj,i) => {
    if(obj.containerId === b[i].containerId){
      return Object.assign({},obj,b[i])
    }
  })
}
const merged = mergeArrs(myVPCs,myPeers);
console.log(JSON.stringify(merged,null,2));
};