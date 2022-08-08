# Disaster Simulator
MongoDB has an excellent and fast failover process compared to other databases, thanks to its distributed and modern architecture. And with retryable reads & writes the impact of a failover to the application is kept to a minimum. Demonstrating the failover speed is easy using the [Test Failover](https://www.mongodb.com/docs/atlas/tutorial/test-failover/) functionality of Atlas. However, it is a bit more tricky to show the impact of a failover to the application, and more precisely how the operation latency increases or operations fail depending on whether retryable reads & writes are used.

The Disaster Simulator is a demo to show the impact of database failovers to the application, specifically the operation latency and success/failure of operations (in case retryable reads & writes are disabled).

![Screenshot of Disaster Simulator](/screenshot.png)

## Requirements
- Atlas cluster
- Python 3.x
- Optional: Atlas Charts
- Optional: Node (when building the front-end instead of using the supplied prebuilt front-end)

## Instructions
### MongoDB Cluster
```shell
podman-compose up
export DOCKER_HOST='unix:///Users/robbert.kauffman/.local/share/containers/podman/machine/podman-machine-default/podman.sock'
```
Check if you can access the cluster and it has been initialized successfully:
```shell
mongosh localhost:27017 --eval 'rs.status()'
```

### Atlas
1. Create a Atlas cluster that will store the request log data which will be visualized using Charts
2. Add the public IP address(es) of the machine(s) that will be running the back-end to the [IP Access List](https://www.mongodb.com/docs/atlas/security/ip-access-list/) of your Atlas Project, or *Allow access from anywhere*
3. Configure Charts:
  - [Add a Data Source](https://www.mongodb.com/docs/charts/data-sources/#add-a-data-source) for the namespace *disasterSimulator.requestLogs*. If you don't see the namespace listed, manually create the database and collection via the [Atlas Data Explorer](https://www.mongodb.com/docs/cloud-manager/data-explorer/databases-collections/#create-a-database)
  - [Import the included dashboard](https://www.mongodb.com/docs/charts/dashboards/#import-a-dashboard-from-a-file): *disaster-simulator.charts*
  - [Enable Unauthenticated Embedding for a Chart](https://www.mongodb.com/docs/charts/embed-chart-anon-auth/#enable-unauthenticated-embedding-for-a-chart) by clicking *Embed Chart* in the context menu of one of the imported charts, and enable external sharing of the data source with *Unauthenticated access*. Then, select *Javascript SDK* as *Method* to obtain the *Base URL* and *Chart ID*. Copy & paste these values for reference later. Finally, copy the *Chart ID* of the second chart as well.

### Back-end & front-end
1. Install the required Python 3 modules: 
  ```shell
  pip3 install -r backend/requirements.txt
  ```
2. Open `backend/server.py` in an editor and change the values of the following variables (lines 17-23):
  - *CONNECTION_STRING*: connection string of your MongoDB cluster containing username & password
  - (Optional) *QUERY_DB*: if querying something other than sample data
  - (Optional) *QUERY_COLLECTION*: if querying something other than sample data
3. Run the back-end:
  ```shell
  python3 backend/server.py
  ```
4. Open `frontend/public/index.html` in an editor and change the values of the following variables (lines 16-21):
  - *DR_APP_HOSTS*: list of hosts (hostname + port) that are running the back-end. No need to change if running back-end from your local machine
  - (Optional) *DR_CHART_BASE_URL*: base URL of your Atlas Charts instance
  - (Optional) *DR_CHART_IDS*: chart IDs of the two imported charts
4. Run the front-end:
  ```shell
  cd frontend/public
  python3 -m http.server 8080
  ```
5. Access the front-end in your browser via the URL: *http://localhost:8080*

### (Optional): Building the front-end
The front-end is built in [Svelte](https://svelte.dev/). In case you want to make changes to the front-end, you can build it as follows:
1. [Download & install Node](https://nodejs.org/en/download/) if you haven't already
2. Navigate to the `frontend` folder and run `npm install` to install all dependencies
3. Run `npm run dev`

## Credits
Many thanks to the original contributors of the SA Hackathon that built the initial version of the project:
Patho Bardhan, Shawn Chai, Jake Cosme, Joseph Hansen, Robbert Kauffman, Timothy Marland, Marianne Myers