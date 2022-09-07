module.exports = {
  connectionString: 'mongodb://mongo1:27017,mongo2:27018,mongo3:27019/myFirstDatabase?replicaSet=myReplicaSet',
  connectionStringStats: 'mongodb://mongo1:27017,mongo2:27018,mongo3:27019/myFirstDatabase?replicaSet=myReplicaSet',
  // only need to set configuration below when using Atlas cluster
  atlasCluster: {
    // groupId: '************************',
    // clusterName: 'ClusterName',
    // apiKeyPublic: '********',
    // apiKeyPrivate: '********-****-****-****-************'
  }
};