# mdb-sa-hackathon-202203-t9


# Details

**Project** :  Disaster Recovery Simulator
**Team Number** : Team #9  
**Team Name** : Big Bad Bad End  
**Demonstration Video** : _Insert link to demonstration video_  

# Overview

While rare, cloud provider's outages do happen and sometimes it can have detrimental impact on their users from a whole region. Just in late 2021 AWS had [US-WEST-1, US-WEST-2, and US-EAST-1 had netowrk problems that lasted hours](https://awsmaniac.com/aws-outages/). In these situations, the usual replica set deployment that is resilient to an availability zone fail will not be sufficient. MongoDB Atlas has the ability to not only go regional (partial or full) outage, but also a full cloud provider outage if it ever occurs. This project will demonstrate if any kinf of diaster were to struck these nodes in a region, how Atlas will be able to withstand such an event.
![/assets/images/atlas_outage.png]

# Justification

While we have a failover button that triggers an election for a node failure, this only shows a partial region (Availability Zone) outage. A full regional outage is something we weren't able to showcase and furthermore, even greater challenge was to actually tell the curious customer what is happening in the background to trigger this simulation. This project will give multiple options to which unfortunate event to trigger and how our failover process will still continue serving client's application with no downtime.

# Detailed Application Overview

![/assets/images/Workflow_diagram.jpg]
As shown from the above diagram, there will be 2 separate backend entities configured with their own EC2 instances. The App backend will be using python and leverage an existing PoV 18 (Multi-Region HA) with direct connection to Atlas. The Control Plane backend will be utilizing realm and its routing table to terminate the VPC peering connection from the app backend <-> Atlas. 


# Roles and Responsibilities

- Patho Bardhan
    - App backend
- Shawn Chai
    - Documentation and diagram
- Jake Cosme
    - Documentation and diagram
- Joseph Hansen
    - CP backend
- Robbert Kauffman
    - App/CP Frontend
- Timothy Marland
    - Realm: Serves as the overall backend platform
- Marianne Myers
    - App/CP Frontend
    - Realm

# Demonstration Script

_Demonstration script (or link to script) goes here_

_The demonstration script should provide all the information required for another MongoDB SA to deliver your demonstration to a prospect. This should include:_

* _setup/installation steps_
* _step by step instructions on how to give the demonstration_
* _key points to emphasize at each point in the demonstration_
* _any tear down steps required to reset the demonstration so it is ready for the next time_
hackathonReadme.md
Displaying hackathonReadme.md.