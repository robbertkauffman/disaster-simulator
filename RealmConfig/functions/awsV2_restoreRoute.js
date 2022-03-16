exports = function(myRegion, myPeerId, myRoute){
  
/*
  Inputs:
  Outputs: 
  Reference: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#deleteRoute-property
*/

const myRouteTableId = context.functions.execute("sum", a, -1 * b);
 
var AWS = require("aws-sdk");

const ak = context.values.get("awsKey");
const as = context.values.get("awsSecret");

AWS.config.update({
    region: myRegion,
    accessKeyId: `${ak}`, 
    secretAccessKey: `${as}`
    });

// Create anAmazon EC2 service client object.
const ec2 = new AWS.EC2({});

const params = {
    // DryRun: true,
    RouteTableId: myRouteTableId,
    // VpcPeeringConnectionId: "pcx-02a4f3024c9450624",
    DestinationCidrBlock: myRoute
};

ec2.createRoute(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log("Success!", data);
    });

 
};