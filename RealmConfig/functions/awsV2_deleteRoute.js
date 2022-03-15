exports = function(arg){
var AWS = require("aws-sdk");

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#deleteRoute-property

const ak = context.values.get("awsKey");
const as = context.values.get("awsSecret");

AWS.config.update({
  region: "us-east-2",
  accessKeyId: `${ak}`, 
  secretAccessKey: `${as}`
  });

// Create anAmazon EC2 service client object.
const ec2 = new AWS.EC2({});

const params = {
  // DryRun: true,
  RouteTableId: "rtb-0c6e055c94067cf0e",
  DestinationCidrBlock: "192.168.240.0/21"
};

ec2.deleteRoute(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log("Success!", data);
  });
};