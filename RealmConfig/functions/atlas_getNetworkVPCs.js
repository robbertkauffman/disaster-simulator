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