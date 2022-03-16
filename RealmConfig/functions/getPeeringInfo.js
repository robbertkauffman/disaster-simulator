exports = function() {
  SCHEME = "https";
  // https://docs.atlas.mongodb.com/reference/api/vpc-get-connections-list/
  ATLAS_API_PEERS = `cloud.mongodb.com/api/atlas/v1.0/groups/${context.values.get("AtlasGroupId")}/peers/`;
  ATLAS_API_VPCS = `cloud.mongodb.com/api/atlas/v1.0/groups/${context.values.get("AtlasGroupId")}/containers/all/`;
  
  const myPeers = context.http
    .get({
      "url": `${SCHEME}://${context.values.get("AtlasAPIKeyPublic")}:${context.values.get("AtlasAPIKeyPrivate")}@${ATLAS_API_PEERS}`,
      "digestAuth": true
    })
    .then(response => {
      const peerData = EJSON.parse(response.body.text());
      return peerData.results;
    });
    
  const myVPCs = context.http
    .get({
      "url": `${SCHEME}://${context.values.get("AtlasAPIKeyPublic")}:${context.values.get("AtlasAPIKeyPrivate")}@${ATLAS_API_VPCS}`,
      "digestAuth": true
    })
    .then(response => {
      const vpcData = EJSON.parse(response.body.text());
      return vpcData.results;
    });
};