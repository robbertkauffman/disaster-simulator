exports = function(myRegion, myPeerId, myRoute){
  
/*
  Inputs: AWS Region, AWS Peer ID, Atlas CIDR Block
  Outputs: 
  Reference: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#deleteRoute-property
*/

const myRouteTableId = context.functions.execute("awsV2_getAtlasPeerRouteTable", myRegion, myPeerId);
 
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
    DestinationCidrBlock: myRoute
};

ec2.createRoute(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log("Success!", data);
    });
};