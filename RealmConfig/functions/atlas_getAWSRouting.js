exports = async function(arg) {
 
const foo = await context.functions.execute('atlas_getNetworkPeers');

console.log(JSON.stringify(foo, null, 2));

};