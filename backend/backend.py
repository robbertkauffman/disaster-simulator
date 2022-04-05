from bson import json_util
import json
import os
import pymongo
import re
import requests
import time


CONNECTION_STRING = 'mongodb+srv://USER:PASS@CLUSTERNAME.HASH.mongodb.net/myFirstDatabase'
DB = 'sample_restaurants'
COLLECTION = 'restaurants'
REALM_APP_ID = 'disaster-simulator-jzqql'
REALM_APP_ENDPOINT = 'https://data.mongodb-api.com/app/' + REALM_APP_ID + '/endpoint'
LOG_REQUEST_PATH = '/logRequest'


def get_mongo_connection(retry_reads, retry_writes):
    client = pymongo.MongoClient(CONNECTION_STRING, retryReads=retry_reads, retryWrites=retry_writes)
    db = client[DB]
    collection = db[COLLECTION]
    return client, db, collection


def find(collection, client, region):
    def do_find(collection):
        restaurant_record = collection.aggregate([
            { "$sample": { "size": 1 }},
            { "$project": { "_id": 0 }}
        ])

        for doc in restaurant_record:
            json_restaurant_doc = json.dumps(doc, default=json_util.default)
        return json_restaurant_doc
    
    return do_operation('find', do_find, collection, client, region)


def insert(collection, client, region):
    def do_insert(collection):
        insert_record = collection.insert_one(
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
        return json.loads(json_util.dumps({ "acknowledged": True, "insertedId": insert_record.inserted_id }))
    
    return do_operation('insert', do_insert, collection, client, region)


def search(collection, client, region):
    def do_search(collection):
        pipeline = [
        {
        "$search": {
            'text': {
                    'query': "American",
                    'path': "cuisine"
                }
            },
        },
        { "$sample": { "size": 1 } },
        {
            "$project": {
            "_id": 0
            }
        },
        ]

        search_record = collection.aggregate(pipeline)
        
        for doc in search_record:
            json_search_doc = json.dumps(doc, default=json_util.default)
        return json_search_doc
    
    return do_operation('search', do_search, collection, client, region)


def do_operation(operation_name, callback, collection, client, region):
    start_time = time.time()
    try:
        response = callback(collection)
        end_time = time.time()
        latency = int((end_time - start_time) * 1000)
        log_request(int(time.time()) * 1000, operation_name, latency, True, client, region)
        return { "latency": latency, "success": True, "response": response }
    except Exception as e:
        log_request(int(time.time()) * 1000, operation_name, time.time() - start_time, False, client, region, e)
        return { "success": False, "response": e }


def log_request(ts, operation_name, latency, success, client, region, err_msg=None):
    try:
        url = REALM_APP_ENDPOINT + LOG_REQUEST_PATH
        data = {
            'ts': ts,
            'operation': operation_name,
            'latency': latency,
            'success': success,
            'appServerRegion': region,
            # 'appServerUrl': '',
            'retryReads': client.options.retry_reads,
            'retryWrites': client.options.retry_writes
        }
        if err_msg:
            data['errMsg'] = err_msg
        
        resp = requests.post(url, data = json.dumps(data), headers = {'Content-Type': 'application/json'})
        if not resp.ok:
            print ('Log request did not return OK response')
    except:
        print('Unexpected error while making request')


def db_hello(db):
    db_hello = db.command("hello")
    return json.loads(json_util.dumps(db_hello))


def get_region():
    stream = os.popen('ec2-metadata -z')
    output = stream.read()
    matches = re.match("placement: (.*?)\\n", output)
    if matches:
        return matches.groups(0)[0]
    else:
        return None