exports = function(request){
var AWS = require("aws-sdk");

const region = JSON.stringify(request.query);
console.log('region is', region);

  if (region === "us-east-2") {
    tbl = "rtb-0c6e055c94067cf0e";
    rte = "192.168.240.0/21"
  }
  
  if (region === "us-west-2") {
    tbl = "rtb-0ad558083560c839e";
    rte = "192.168.248.0/21"
  }
  

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#deleteRoute-property

const ak = context.values.get("awsKey");
const as = context.values.get("awsSecret");

AWS.config.update({
  region: region,
  accessKeyId: `${ak}`, 
  secretAccessKey: `${as}`
  });

// Create anAmazon EC2 service client object.
const ec2 = new AWS.EC2({});

const params = {
  // DryRun: true,
  RouteTableId: tbl,
  DestinationCidrBlock: rte
};

ec2.deleteRoute(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log("Success!", data);
  });
};