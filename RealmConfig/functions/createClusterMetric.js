exports = async function(request, response) {
  SCHEME = "https";
  DATA_API_HOSTNAME_PATH = 'data.mongodb-api.com/app/data-qyves/endpoint/data/beta/action/insertOne';
  //ATLAS_API_HOSTNAME_PATH = `cloud.mongodb.com/api/atlas/v1.0/groups/${context.values.get("AtlasGroupId")}/processes`;
  
  data = await context.http
    .post({
      //"url": `${SCHEME}://${context.values.get("AtlasAPIKeyPublic")}:${context.values.get("AtlasAPIKeyPrivate")}@${ATLAS_API_HOSTNAME_PATH}`,
      "url": `${SCHEME}://${DATA_API_HOSTNAME_PATH}`,
      "body": JSON.parse(request.body.text()),
      encodeBodyAsJSON: true,
      "headers": {
        'Content-Type': ['application/json'],
        'Access-Control-Request-Headers': ['*'],
        'api-key': ['YEUUfqrDqmzTBgEWsfHWbOxm0KH8TgUsyFC1Rvy8T9mnQArhfWefAR3DRSvhYyE']
      }
    })
    .then(response => {
      const ejson_body = EJSON.parse(response.body.text());
      return ejson_body;
    });
    response.setBody(JSON.stringify(data));
};