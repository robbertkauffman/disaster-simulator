exports = function() {
  SCHEME = "https";
  // https://docs.atlas.mongodb.com/reference/api/vpc-get-connections-list/
  ATLAS_API_HOSTNAME_PATH = `cloud.mongodb.com/api/atlas/v1.0/groups/${context.values.get("AtlasGroupId")}/peers/`;
  
  return context.http
    .get({
      "url": `${SCHEME}://${context.values.get("AtlasAPIKeyPublic")}:${context.values.get("AtlasAPIKeyPrivate")}@${ATLAS_API_HOSTNAME_PATH}`,
      "digestAuth": true
    })
    .then(response => {
      const data = EJSON.parse(response.body.text());
      
      const myPeers = [];
      data.results.forEach((obj, i) => {
        const my = {};
        my.containerId = obj.containerId;
        my.connectionId = obj.connectionId;
        myPeers.push(my);
      });
      // console.log(JSON.stringify(myPeers, null, 2));
      return myPeers;
    });
};

/* 
  NOT CURRENTLY USED FOR DEMO
  WIP:
  need containerId and connectionId from this call
  'containerId' here is the same value as the 'id' property in the object returned by atlas_getNetworkVPCs
  for each connectionId, use the containerId to find the relevant data from atlas_getNetworkVPCs
*/