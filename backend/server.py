#!/usr/bin/env python3

from bson import json_util
import docker
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
import os
import pymongo
import re
from threading import Timer
import time
from werkzeug.exceptions import BadRequest


# Change these:
CONNECTION_STRING = 'mongodb://mongo1:27017,mongo2:27018,mongo3:27019/myFirstDatabase?replicaSet=myReplicaSet'
QUERY_DB = 'sample_restaurants'
QUERY_COLLECTION = 'restaurants'
# Do not change these:
APP_PORT = 5001
REQUESTLOG_DB = 'disasterSimulator'
REQUESTLOG_COLLECTION = 'requestLog'
CONTAINER_NETWORK_NAME = 'containers_mongoCluster'


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
is_running = False
request_log = []
event_log = []
current_primary = (None, None)

@app.route('/')
def home():
    return "Disaster Simulator backend is running..."

@app.route('/start')
def start():
    if not is_running:
        retry_reads = True if request.args.get('retryReads') is None else request.args.get('retryReads') == 'true'
        retry_writes = True if request.args.get('retryWrites') is None else request.args.get('retryWrites') == 'true'
        read_preference = 'primary' if request.args.get('readPreference') is None else request.args.get('readPreference')
        start(retry_reads, retry_writes, read_preference)
        return jsonify(
            success=True,
            msg="Started with retryReads=%s, retryWrites=%s & readPreference=%s" % (retry_reads, retry_writes, read_preference)
        )
    else:
        keep_running()
        return jsonify(
            success=False,
            msg="Already started"
        )

# need to send a heartbeat signal each 10 seconds,
# otherwise it will automatically stop
@app.route('/continue')
def keep_running():
    if is_running:
        keep_running()
        return jsonify(
            success=True,
            msg="Keep running for another 10 seconds"
        )
    else:
        return jsonify(
            success=False,
            msg="Not running"
        )

@app.route('/stop')
def stop():
    if is_running:
        stop()
        return jsonify(
            success=True,
            msg="Stopped"
        )
    else:
        return jsonify(
            success=False,
            msg="Already stopped"
        )

# returns latest 10 operations
@app.route('/requestlog')
def get_request_log():
    return get_request_log()

@app.route('/eventLog')
def get_event_log():
    return get_events()

@app.route('/getStats', methods = ['GET'])
def get_stats():
    min_date = request.args.get("minDate", default="", type=int)
    if not min_date:
        return jsonify(
            success=False,
            msg="Query parameter minDate not specified"
        )
    return get_stats(min_date)

@app.route('/rsConfig', methods = ['GET'])
def rs_config():
    return rs_config(client)

@app.route('/rsStatus', methods = ['GET'])
def rs_status():
    return rs_status(client)

@app.route('/region', methods = ['GET'])
def get_region():
    return get_region()

@app.route('/stepDown', methods = ['POST'])
def step_down():
    step_down_primary()
    return jsonify(success=True)

@app.route('/killNode', methods = ['POST'])
def kill_node():
    success = parse_body('containerName', request, kill_node)
    return jsonify(success=success)

@app.route('/startNode', methods = ['POST'])
def start_node():
    success = parse_body('containerName', request, start_node)
    return jsonify(success=success)

@app.route('/disconnectNode', methods = ['POST'])
def disconnect_node():
    success = parse_body('containerName', request, disconnect_node)
    return jsonify(success=success)

@app.route('/reconnectNode', methods = ['POST'])
def reconnect_node():
    success = parse_body('containerName', request, reconnect_node)
    return jsonify(success=success)

def parse_body(param, request, callback_fn):
    try:
        params = request.get_json()
        if not params or not params[param]:
            return jsonify(
                success=False,
                msg="%s not specified in request body" % param
            )
        return callback_fn(params[param])
    except BadRequest:
        print_with_timestamp("Error! Could not parse request body as JSON: %" % request.data)


def get_mongo_connection(retry_reads=True, retry_writes=True, read_preference='primary'):
    client = pymongo.MongoClient(CONNECTION_STRING, retryReads=retry_reads, retryWrites=retry_writes, readPreference=read_preference)
    db = {
        'query': client[QUERY_DB],
        'requestLog': client[REQUESTLOG_DB]
    }
    collection = {
        'query': db['query'][QUERY_COLLECTION],
        'requestLog': db['requestLog'][REQUESTLOG_COLLECTION]
    }
    return client, db, collection


def create_indexes(collection):
    collection.create_index([("ts", pymongo.ASCENDING), ("latency", pymongo.ASCENDING)])
    collection.create_index([("ts", pymongo.ASCENDING), ("success", pymongo.ASCENDING)])


def print_with_timestamp(str):
    now = datetime.now()
    print('%s: %s' % (now.strftime("%Y-%m-%d %H:%M:%S"), str))


def start(retry_reads, retry_writes, read_preference):
    global client, db, collection
    client, db, collection = get_mongo_connection(retry_reads, retry_writes, read_preference)

    print_with_timestamp("Started querying with retryReads=%s, retryWrites=%s & readPreference=%s" % (retry_reads, retry_writes, read_preference))
    global timer
    timer = Timer(10.0, stop)
    timer.start()

    global is_running
    is_running = True
    global request_log
    request_log = []
    while is_running:
        do_operation('findOne', find, collection['query'], client)
        do_operation('insertOne', insert, collection['query'], client)
        check_primary()
    store_request_log()


def keep_running():
    global timer
    timer.cancel()
    timer = Timer(10.0, stop)
    timer.start()


def stop():
    print_with_timestamp("Stopped querying...")
    global timer
    if timer:
        timer.cancel()
    
    global is_running
    is_running = False


def find(collection):
    collection.aggregate([
        { "$sample": { "size": 1 }},
        { "$project": { "_id": 0 }}
    ])


def insert(collection):
    collection.insert_one(
        {
            "address": {
            "building": "998814",
            "coord": [-73.74438599999999, 40.72918],
            "street": "Springfield Blvd",
            "zipcode": "11427"
        },
        "borough": "Queens",
        "cuisine": "Hamburgers",
        "grade": "Not Yet Graded",
        "score": 20
    })
  

def do_operation(operation_name, operation_fn, collection, client):
    start_time = time.time()
    try:
        # response = operation_fn(collection)
        operation_fn(collection)
        end_time = time.time()
        latency = int((end_time - start_time) * 1000)
        log_request(start_time, operation_name, latency, True, client)
    except Exception as e:
        end_time = time.time()
        print_with_timestamp("Error while doing %s operation!: %s" % (operation_name, e))
        log_request(start_time, operation_name, end_time - start_time, False, client, str(e))


def log_request(ts, operation_name, latency, success, client, err_msg=None):
    new_request_log = {
        "ts": datetime.fromtimestamp(ts, timezone(timedelta(hours=-4))),
        "operation": operation_name,
        "latency": latency,
        "success": success,
        "appServerRegion": region,
        "retryReads": client.retry_reads,
        "retryWrites": client.retry_writes,
        "readPreference": client.read_preference.name
    }
    if err_msg:
        new_request_log['errMsg'] = err_msg
    
    global request_log
    request_log.append(new_request_log)
    if len(request_log) > 99:
        store_request_log()


def store_request_log():
    try:
        global request_log, collection
        collection['requestLog'].insert_many(request_log)
        print_with_timestamp("Saved request logs")
        request_log = []
    except Exception as e:
        print_with_timestamp("Error while inserting request logs!: %s" % e)


def get_request_log():
    global request_log
    return json_util.dumps(request_log[-10:])


def check_primary():
    global client, current_primary
    if client.primary and len(client.primary) > 0 and (
            current_primary[0] != client.primary[0] or current_primary[1] != client.primary[1]):
        if current_primary[0]:
            rs_status = client.admin.command('replSetGetStatus')
            if rs_status and rs_status['electionCandidateMetrics']:
                add_event("New primary was elected", datetime_from_utc_to_local(rs_status['electionCandidateMetrics']['newTermStartDate']))
        current_primary = client.primary


def datetime_from_utc_to_local(utc_datetime):
    now_timestamp = time.time()
    offset = datetime.fromtimestamp(now_timestamp) - datetime.utcfromtimestamp(now_timestamp)
    return utc_datetime + offset


def add_event(message, ts=None):
    if ts is None:
        ts = datetime.now()
    global event_log
    event_log.append({
        "message": message,
        "ts": ts.isoformat()
    })


def get_events():
    global event_log
    json_event_log = json_util.dumps(event_log)
    event_log = []
    return json_event_log


def get_stats(min_date):
    stats = list(collection['requestLog'].aggregate([
        { "$match": { "ts": { "$gt": datetime.fromtimestamp(min_date / 1000, timezone(timedelta(hours=-4))) } } },
        { "$group": { "_id": None, "avg": { "$avg": "$latency" }, "max": { "$max": "$latency" } } }
    ]))
    
    if len(stats) > 0:
        return json_util.dumps(stats[0])
    else:
        return '{}'


def rs_config(client):
    db = client['local']
    coll = db['system.replset']
    rs_conf = coll.find_one()
    return json_util.dumps(rs_conf)


def rs_status(client):
    rs_status = client.admin.command('replSetGetStatus')
    return json_util.dumps(rs_status)


# only works for AWS EC2
def get_region():
    stream = os.popen("ec2-metadata -z")
    output = stream.read()
    matches = re.match("placement: (.*?)\\n", output)
    if matches:
        return matches.groups(0)[0]
    else:
        return ""


def step_down_primary():
    try:
        global client
        primary = client.primary[0] if client.primary and len(client.primary) > 0 else ""
        add_event("Stepping down primary %s..." % client.primary[0])
        res = client.admin.command('replSetStepDown', 100)
        ts = res['$clusterTime']['clusterTime'].as_datetime()
        print_with_timestamp("Stepped down primary %s at %s" % (client.primary, ts.isoformat()))
        add_event("Primary stepped down", ts)
    except pymongo.errors.AutoReconnect:
        pass
    except KeyError:
        print_with_timestamp("Could not determine when cluster was stepped down")


def kill_node(container_name):
    try:
        add_event("Killing node %s..." % container_name)
        container = docker_client.containers.get(container_name)
        container.kill()
        add_event("Node %s killed" % container_name)
        return True
    except docker.errors.NotFound:
        print_with_timestamp("Could not find container with name or ID '%s'" % container_name)


def start_node(container_name):
    try:
        add_event("Starting node %s..." % container_name)
        container = docker_client.containers.get(container_name)
        container.start()
        add_event("Node %s started" % container_name)
        return True
    except docker.errors.NotFound:
        print_with_timestamp("Could not find container with name or ID '%s'" % container_name)
        return False


def disconnect_node(container_name):
    try:
        add_event("Disconnecting node %s..." % container_name)
        network = docker_client.networks.get(CONTAINER_NETWORK_NAME)
    except docker.errors.NotFound:
        print_with_timestamp("Could not find network with name or ID '%s'" % CONTAINER_NETWORK_NAME)
        return False
    try:
        network.disconnect(container_name)
        add_event("Node %s disconnected" % container_name)
        return True
    except docker.errors.NotFound:
        print_with_timestamp("Could not find container with name or ID '%s'" % container_name)
        return False


def reconnect_node(container_name):
    try:
        add_event("Reconnecting node %s..." % container_name)
        network = docker_client.networks.get(CONTAINER_NETWORK_NAME)
    except docker.errors.NotFound:
        print_with_timestamp("Could not find network with name or ID '%s'" % CONTAINER_NETWORK_NAME)
        return False
    try:
        network.connect(container_name)
        container = docker_client.containers.get(container_name)
        container.restart()
        add_event("Node %s reconnected" % container_name)
        return True
    except docker.errors.NotFound:
        print_with_timestamp("Could not find container with name or ID '%s'" % container_name)
        return False


if __name__ == '__main__':
    client, db, collection = get_mongo_connection()
    create_indexes(collection['requestLog'])
    region = get_region()

    docker_client = docker.from_env()
    
    app.run(debug=True, host='0.0.0.0', port=APP_PORT)