exports = function(request) {
  SCHEME = "https";
  ATLAS_API_HOSTNAME_PATH = `cloud.mongodb.com/api/atlas/v1.0/groups/${context.values.get("AtlasGroupId")}/events`;
  EVENTS = [
    // "CLUSTER_UPDATE_STARTED",
    // "CLUSTER_UPDATE_SUBMITTED",
    // "CLUSTER_UPDATE_COMPLETED",
    "HOST_RESTARTED",
    "HOST_ROLLBACK",
    "SUCCESSFUL_DEPLOY",
    "PRIMARY_ELECTED",
    "HOST_NOW_PRIMARY",
    "HOST_NOW_SECONDARY"
  ];
  
  const eventsParam = 'eventType=' + EVENTS.join('&eventType=');
  let query_params = `?${eventsParam}`; // &clusterNames=${context.values.get("AtlasClusterName")}`;
  
  const { minDate } = request.query;
  if (minDate) {
    query_params += '&minDate=' + minDate;
  }
  
  return context.http
    .get({
      "url": `${SCHEME}://${context.values.get("AtlasAPIKeyPublic")}:${context.values.get("AtlasAPIKeyPrivate")}@${ATLAS_API_HOSTNAME_PATH}${query_params}`,
      "digestAuth": true
    })
    .then(response => {
      const ejson_body = EJSON.parse(response.body.text());
      return ejson_body;
    });
};