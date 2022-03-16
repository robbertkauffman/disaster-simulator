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
      const ejson_body = EJSON.parse(response.body.text().results);
      return ejson_body;
    });
};

