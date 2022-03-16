exports = function(myRegion, myPeerId){

/* 
  Inputs:  AWS Region, VPC Peering ID
  Output:  routeTableId
  Reference:  https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeRouteTables-property
*/

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
    // Filters: [{ Name: "route.vpc-peering-connection-id", Values: [ myPeerId ]} ],
};

ec2.describeRouteTables(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else // console.log(JSON.stringify(data, null, 2));
      console.log(JSON.stringify(data.RouteTables[0].RouteTableId, null, 2));
      return data.RouteTables[0].RouteTableId;
    });
};