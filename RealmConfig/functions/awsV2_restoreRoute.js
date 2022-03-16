// exports = async function(myRegion, myPeerId, myRoute){
exports = async function(myRegion){
  
  if (myRegion === "us-east-2") {
    tbl = "rtb-0c6e055c94067cf0e";
    rte = "192.168.240.0/21";
    peerId = "pcx-02a4f3024c9450624";
  }
  
  if (myRegion === "us-west-2") {
    tbl = "rtb-0ad558083560c839e";
    rte = "192.168.248.0/21";
    peerId = "pcx-096103b8cc0d56835"
  }

// const myRouteTableId = await context.functions.execute("awsV2_getAtlasPeerRouteTable", myRegion, myPeerId);
 
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
    RouteTableId: tbl,
    DestinationCidrBlock: rte,
    VpcPeeringConnectionId: peerId
};

ec2.createRoute(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log("Success!", data);
    });
};

/* 
ACTIVELY NEEDED FOR DEMO.  
Needs improvement (too much hard coding) but leaving as-is for demo.  
Supply region in "us-west-2" format as parameter
*/