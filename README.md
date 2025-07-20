# Disaster Simulator
MongoDB has an excellent and fast failover process compared to other databases, thanks to its distributed and modern architecture. And with retryable reads & writes the impact of a failover to the application is kept to a minimum. Demonstrating the failover speed is easy using the [Test Failover](https://www.mongodb.com/docs/atlas/tutorial/test-failover/) functionality of Atlas. However, it is a bit more tricky to show the impact of a failover to the application, and more precisely how the operation latency increases or operations fail depending on whether retryable reads & writes are used.

The Disaster Simulator is a demo to show the impact of database failovers to the application, specifically the operation latency and success/failure of operations (in case retryable reads & writes are disabled).

![Screenshot of Disaster Simulator](/screenshot.png)

## Requirements
- Atlas cluster
- Python 3.x
- Node.js & npm

## Instructions
### Atlas
1. Create an Atlas cluster that will be used for testing failovers. Note that only dedicated clusters (M10+) support the Test Failover and Simulate Regional Outage functionality.
2. Create a database user with the role *Read and write to any database*
3. Add the public IP address(es) of the machine(s) that will be running the back-end to the [IP Access List](https://www.mongodb.com/docs/atlas/security/ip-access-list/) of your Atlas Project, or *Allow access from anywhere*.
4. [Create a Project API key](https://www.mongodb.com/docs/atlas/configure-api-access/#grant-programmatic-access-to-an-organization) with the *Project Cluster Manager* role. And add the public IP address(es) of the machine(s) that will be running the back-end to the IP Access List of the API key.

### Application
1. Copy or rename `backend/.env.example` to `backend/.env` and adjust the connection string, Atlas group ID, cluster name and API keys.
2. Install dependencies:
  ```shell
  npm install
  ```
3. Run:
  ```shell
  npm run dev
  ```
4. You can now access the app in your browser via the URL: *http://localhost:8080*. If your cluster and its topology is not being displayed, check the browser console and application logs for any errors.

## Credits
Many thanks to the original contributors of the SA Hackathon that built the initial version of the project:
Patho Bardhan, Shawn Chai, Jake Cosme, Joseph Hansen, Robbert Kauffman, Timothy Marland, Marianne Myers