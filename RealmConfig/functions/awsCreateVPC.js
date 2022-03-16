exports = function(arg){
    var AWS = require("aws-sdk");

    const ak = context.values.get("awsKey");
    const as = context.values.get("awsSecret"); 

    AWS.config.update({
        region: "us-west-2",
        accessKeyId: `${ak}`, 
        secretAccessKey: `${as}`
        });
    
    const cloudformation = new AWS.CloudFormation();
    
    const cfYAML = context.values.get("awsVpcCF.yml");

    var params = {
        StackName: 't9-sa-hackathon-automated',
        DisableRollback: false,
        EnableTerminationProtection: false,
        OnFailure: "ROLLBACK",
        TemplateBody: cfYAML
      };
      cloudformation.createStack(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
}









