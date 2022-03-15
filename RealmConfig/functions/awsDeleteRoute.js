exports = function(arg){
const { EC2Client, DeleteRouteCommand } = require( "@aws-sdk/client-ec2");

/*
https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ec2/classes/deleteroutecommand.html
const command = new DeleteRouteCommand(input);
const response = await client.send(command);
*/

const ak = context.values.get("awsKey");
const as = context.values.get("awsSecret");

// Create anAmazon EC2 service client object.
const ec2Client = new EC2Client({ 
    region: "us-east-2",
    credentials: {
        accessKeyId: `${ak}`, 
        secretAccessKey: `${as}`
    }
});

const params = {
  DryRun: true,
  // RouteTableId: "rtb-0c6e055c94067cf0e",
  // DestinationCidrBlock: "192.168.240.0/21"
};

const run = async () => {
  try {
    const data = await ec2Client.send(new DeleteRouteCommand(params));
    console.log("Success", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

run();
};

/* NOTES

  -- might be able to reference env vars directly in json structures using %%values
  -- IAM key not yet valid. ("We only have permission to *manually* make a mess of the SA-AWS account")
  -- This code will run successfully in node.js (using hard coded key/secret against test count, since see above)
  -- does NOT yet succeed in realm.  looks like subdeps not getting pulled in?
  -- need to figure out how to pull code directly from GH into realm

*/ 