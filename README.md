# mdb-sa-hackathon-202203-t9


# Details

**Project** :  Disaster Recovery Simulator
**Team Number** : Team #9  
**Team Name** : Big Bad Bad End  
**Demonstration Video** : _Insert link to demonstration video_  

# Overview

While rare, cloud provider's outages do happen and sometimes it can have detrimental impact on their users from a whole region. Just in late 2021 AWS had [US-WEST-1, US-WEST-2, and US-EAST-1 had netowrk problems that lasted hours](https://awsmaniac.com/aws-outages/). In these situations, the usual replica set deployment that is resilient to an availability zone fail will not be sufficient. MongoDB Atlas has the ability to not only go regional (partial or full) outage, but also a full cloud provider outage if it ever occurs. This project will demonstrate if any kinf of diaster were to struck these nodes in a region, how Atlas will be able to withstand such an event.
!(/assets/images/atlas_outage.png)

# Justification

While we have a failover button that triggers an election for a node failure, this only shows a partial region (Availability Zone) outage. A full regional outage is something we weren't able to showcase and furthermore, even greater challenge was to actually tell the curious customer what is happening in the background to trigger this simulation. This project will give multiple options to which unfortunate event to trigger and how our failover process will still continue serving client's application with no downtime.

# Detailed Application Overview

![Workflow](/assets/images/Workflow_diagram.jpg)
As shown from the above diagram, there will be 2 separate backend entities configured with their own EC2 instances. The App backend will be using python and leverage an existing PoV 18 (Multi-Region HA) with direct connection to Atlas. The Control Plane backend will be utilizing realm and its routing table to terminate the VPC peering connection from the app backend <-> Atlas. 


# Roles and Responsibilities

- Patho Bardhan
    - App backend
- Shawn Chai
    - Control Plane backend
    - VPC configuration
- Jake Cosme
    - Documentation, diagram, and video
- Joseph Hansen
    - Control Plane backend
    - VPC configuration
    - Realm functions
- Robbert Kauffman
    - App/CP Frontend
    - Realm functions
- Timothy Marland
    - Mobile Application (Swift, application API, MongoDB Data API)
- Marianne Myers
    - App/CP Frontend
    - Realm functions

# Demonstration Script

## Set Up
1. Create your Atlas M20 replica set Cluster with each node living in different regions. The demo contains us-east-2, us-west-2, and us-west-1 from AWS
2. Load Sample Data
3. Create an API Key for your Atlas Project with Project Owner access
3. Create a New App from the Realm UI
    - Enable Hosting via Realm -> Manage -> Deployment
    - Generate an API Key for use by Realm via Project -> Access Manager -> Create API Key
    - Create 3 Secrets for your Atlas API Key via Realm -> Secrets -> Create New Value, with names `AtlasAPIKeyPublic`, `AtlasAPIKeyPrivate` and `awsSecretValue`, and of type `Secret`
    - Update the `clusterName` in `/RealmConfig/data_sources/mongodb-atlas/config.json` to the name of your Atlas Cluster. Do the same for the Value `AtlasClusterName` in `RealmConfig/values/AtlasClusterName.json`
    - Update the `Value` in `RealmConfig/values/AtlasGroupId.json` to your Atlas Group/Project ID (UUID in the Atlas Project URL)
    - Install the Realm-CLI to your localhost
    - Run Realm-CLI [import](https://docs.mongodb.com/realm/manage-apps/deploy/manual/deploy-cli/) on the `RealmConfig` directory: `realm-cli push --local ./RealmConfig --remote <Realm-App-ID>`
    
### Front End

Using Chrome, open `/fontend/index.html`

### Backend
1. Go to your AWS Console
2. Click Create VPC and fill out like below
![VPC in AWS](/assets/images/vpc_aws.png)
3. Go to the *Network Access* from Atlas, click Add *Peering Connection*, then fill out the information accordingly to the VPC you created from AWS
4. Follow the instructions from "How do I accept my peering connection in AWS?" that will show up after you create the peering connection in Atlas. Accept from AWS
5. Follow the instructions from "How di I add Atlas' CIDR block to my route tables?". This will lead you to edit routes from AWS
6. Do this twice for your primary region & one of your secondary region. The completed Atlas Peering will look like below
![VPC in Atlas](/assets/images/vpc_atlas.png)

#### Backend Application
SSH into each AWS VM and do the following:
1. `git clone` the repo
2. Install the Python 3 modules: 
```
pip3 install pymongo[srv] flask flask_cors pyyaml
```
3. Navigate to the `backend` folder:
```
cd mdb-sa-hackathon-202203-t9/backend
```
4. Update `config.yml` with the Atlas CONNECTION_STRING. Change DB=Database and COLLECTION if using something other than sample data
5. In AWS Console, add an inbound rule to the Security Group to allow traffic to the ports (5000-5004) on which the app is running
![Screen Shot 2022-03-16 at 1 31 15 PM](https://user-images.githubusercontent.com/5925280/158663612-052208fc-27e3-4eea-8edc-500ade83d3ea.jpeg)
6. Run the backend APIs:
```
chmod +x start.sh
./start.sh
```

### Mobile Application
Update the variables in SwiftDataApp.

1. Data API URL
2. Data API Key
3. Data API Search parameters
4. Application API URL
