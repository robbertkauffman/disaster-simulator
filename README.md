# Disaster Simulator
While rare, cloud provider's outages do happen and sometimes it can have detrimental impact on their users from a whole region. Just in late 2021 AWS had [US-WEST-1, US-WEST-2, and US-EAST-1 had netowrk problems that lasted hours](https://awsmaniac.com/aws-outages/). In these situations, the usual replica set deployment that is resilient to an availability zone fail will not be sufficient. MongoDB Atlas has the ability to not only go regional (partial or full) outage, but also a full cloud provider outage if it ever occurs. This project will demonstrate if any kinf of diaster were to struck these nodes in a region, how Atlas will be able to withstand such an event.

## Requirements
- Python 3.x
- (if building the front-end): Node

## Instructions
### Atlas
1. Create a dedicated Atlas cluster (e.g. M10 across 3 regions with 1 node in each to simulate multi-region failovers)
2. Load Sample Data
3. Create an API Key for your Atlas Project with *Project Owner* access and whitelist the IP(s) of the machine(s) running the back-end
4. Add the public IP address(es) of the machine(s) that will be running the back-end to the IP Access List of your Atlas Project, or allow access from anywhere
5. Configure Charts:
  - Add a Data Source for the namespace *disasterSimulator.requestLogs*. If you don't see the namespace listed, manually create the database and collection via the *Atlas Data Explorer*
  - Import the included dashboard *disaster-simulator.charts*

### Back-end & front-end
1. Install the required Python 3 modules: 
  ```shell
  pip3 install backend/requirements.txt
  ```
2. Open `backend/backend.py` in an editor and change the values of the following variables (lines 18-24):
  - *CONNECTION_STRING*: connection string of your MongoDB cluster containing username & password
  - *ATLAS_GROUP_ID*: Atlas Project/Group ID. Can be obtained from the URL
  - *ATLAS_CLUSTER_NAME*: Name of the Atlas cluster
  - *ATLAS_API_KEY_PUBLIC*: Atlas Public API key
  - *ATLAS_API_KEY_PRIVATE*: Atlas Private API key
  - (Optional) *DB*: if using something other than sample data
  - (Optional) *COLLECTION*: if using something other than sample data
3. Run the back-end:
  ```shell
  cd backend
  python3 backend.py
  ```
4. Open `frontend/public/index.html` in an editor and change the values of the following variables (lines 16-21):
  - *DR_APP_HOSTS*: list of hosts (hostname + port) that are running the back-end. No need to change if running back-end from your local machine
  - *DR_CHART_BASE_URL*: base URL of your Atlas Charts instance
  - *DR_CHART_IDS*: chart IDs of the two configured charts
4. Run the front-end:
  ```shell
  cd frontend/public
  python3 -m http.server
  ```
5. Access the front-end in your browser via the URL: *http://localhost:8000*

### (Optional): Building the front-end
The front-end is built in [Svelte](https://svelte.dev/). In case you want to make changes, you can build the front-end as follows:
1. [Download & install Node](https://nodejs.org/en/download/) if you haven't already
2. Navigate to the `frontend` folder and run `npm install` to install all dependencies
3. Update *APP_HOSTNAMES* in `frontend/src/App.svelte`
4. Run `npm run dev`

## Credits
Many thanks to the original contributors of the SA Hackathon that helped built the first version of the project:
Patho Bardhan, Shawn Chai, Jake Cosme, Joseph Hansen, Robbert Kauffman, Timothy Marland, Marianne Myers