exports = async function(arg) {
 
const myPeers = await context.functions.execute('atlas_getNetworkPeers');   // "connectionID" same as ...
const myVPCs = await context.functions.execute('atlas_getNetworkVPCs');     // "id"

function mergeArrayObjects(arr1,arr2){
  return arr1.map((item,i)=>{
     if(item.containerId === arr2[i].containerId){
        return Object.assign({},item,arr2[i])
     } 
  })
}

const merged = mergeArrayObjects(myVPCs,myPeers);
console.log(JSON.stringify(merged,null,2));
};

/* 
  NOT CURRENTLY USED FOR DEMO
  WIP:  Intent was/is to accomplish:
  - drop any vpc from myVPCs for which there is no peering connection
  - merge the arrays, and return the result, so that there's one data structure available to other functions
*/