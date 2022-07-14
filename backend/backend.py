#!/usr/bin/env python3

from bson import json_util
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
import json
import os
import pymongo
import re
from threading import Timer
import time


# Change these:
CONNECTION_STRING = 'mongodb+srv://USERNAME:PASSWORD@CLUSTERNAME.PROJECTHASH.mongodb.net/myFirstDatabase'
# CONNECTION_STRING = 'mongodb://localhost:27017'
DB = 'sample_restaurants'
COLLECTION = 'restaurants'
# Do not change these:
APP_PORT = 5001


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
is_running = False
request_log = []

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

@app.route('/hello', methods = ['GET'])
def db_hello():
    return db_hello(db)

@app.route('/region', methods = ['GET'])
def get_region():
    return get_region()


def get_mongo_connection(retry_reads=True, retry_writes=True, read_preference='primary'):
    client = pymongo.MongoClient(CONNECTION_STRING, retryReads=retry_reads, retryWrites=retry_writes, readPreference=read_preference)
    db = client[DB]
    collection = db[COLLECTION]
    return client, db, collection


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
        do_operation('findOne', find, collection, client)
        do_operation('insertOne', insert, collection, client)
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
        "retryReads": client.options.retry_reads,
        "retryWrites": client.options.retry_writes,
        "readPreference": client.options.read_preference.name
    }
    if err_msg:
        new_request_log['errMsg'] = err_msg
    
    global request_log
    request_log.append(new_request_log)
    if len(request_log) > 99:
        store_request_log()


def store_request_log():
    try:
        global request_log
        db = client['disasterSimulator']
        collection = db['requestLogs']
        collection.insert_many(request_log)
        print_with_timestamp("Saved request logs")
        request_log = []
    except Exception as e:
        print_with_timestamp("Error while inserting request logs!: %s" % e)


def get_request_log():
    global request_log
    return json.dumps(request_log[-10:], default=str)


def db_hello(db):
    db_hello = db.command('hello')
    return json.loads(json_util.dumps(db_hello))


def get_region():
    stream = os.popen("ec2-metadata -z")
    output = stream.read()
    matches = re.match("placement: (.*?)\\n", output)
    if matches:
        return matches.groups(0)[0]
    else:
        return "Unknown region"


if __name__ == '__main__':
    client, db, collection = get_mongo_connection()
    region = get_region()
    
    app.run(debug=True, host='0.0.0.0', port=APP_PORT)