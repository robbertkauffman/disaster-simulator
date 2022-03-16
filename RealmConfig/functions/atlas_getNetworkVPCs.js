exports = function() {
  SCHEME = "https";
  ATLAS_API_HOSTNAME_PATH = `cloud.mongodb.com/api/atlas/v1.0/groups/${context.values.get("AtlasGroupId")}/containers/`;
  
  return context.http
    .get({
      "url": `${SCHEME}://${context.values.get("AtlasAPIKeyPublic")}:${context.values.get("AtlasAPIKeyPrivate")}@${ATLAS_API_HOSTNAME_PATH}`,
      "digestAuth": true
    })
    .then(response => {
      const data = EJSON.parse(response.body.text());
      const myVPCs = [];
        data.results.forEach((obj, i) => {
          const my = {};
          my.containerId = obj.id;
          my.region = obj.regionName;
          my.route = obj.atlasCidrBlock;
          myVPCs.push(my);
        })
      // console.log(JSON.stringify(myVPCs, null, 2));
      return myVPCs;
    });
};

/* 
  NOT CURRENTLY USED FOR DEMO
  WIP:
  'containerId' here is the same value as the 'id' property in the object returned by atlas_getNetworkPeers call
  use id from other call to look up the data needed from this call (atlasCidrBlock and regionName)
*/