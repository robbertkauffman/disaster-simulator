exports = async function(request, response) {
  try {
    console.log(request.body.text());
    const ejson_body = EJSON.parse(request.body.text());
    if (!ejson_body.ts || !ejson_body.operation || !ejson_body.latency || ejson_body.success === undefined) {
      response.setBody("Request failed. Missing at least one parameter. Body should include the fields 'operation', 'latency' and 'success'.");
      return response.setStatusCode(400);
    }
    
    const doc = {
      ts: new Date(ejson_body.ts),
      operation: ejson_body.operation,
      latency: ejson_body.latency,
      success: ejson_body.success
    }
    if (ejson_body.appServerRegion) {
      doc.appServerRegion = ejson_body.appServerRegion;
    }
    if (ejson_body.appServerUrl) {
      doc.appServerUrl = ejson_body.appServerUrl;
    }
    if (ejson_body.retryReads !== undefined) {
      doc.retryReads = ejson_body.retryReads;
    }
    if (ejson_body.retryWrites !== undefined) {
      doc.retryWrites = ejson_body.retryWrites;
    }
    if (ejson_body.errMsg !== undefined) {
      doc.errMsg = ejson_body.errMsg;
    }
    
    await context.services
      .get("mongodb-atlas")
      .db("disasterSimulator")
      .collection("requestLogs")
      .insertOne(doc);
    response.setBody("Log request successful");
    return response.setStatusCode(201);
  } catch (e) {
    response.setBody(`Error: ${e}`);
    response.setStatusCode(500);
    return false;
  }
};