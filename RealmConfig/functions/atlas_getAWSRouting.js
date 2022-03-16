exports = async function(arg) {
 
const myPeers = await context.functions.execute('atlas_getNetworkPeers');
const myVPCs = await context.functions.execute('atlas_getNetworkVPCs');

function mergeArrayObjects(arr1,arr2){
  return arr1.map((item,i)=>{
     if(item.id === arr2[i].id){
        return Object.assign({},item,arr2[i])
     }
  })
}

const merged = mergeArrayObjects(myVPCs,myPeers);
console.log(JSON.stringify(merged,null,2));
};