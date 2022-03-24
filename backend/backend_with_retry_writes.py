#!/usr/bin/env python3
##

import os
import re
import sys
import random
import time
import datetime
import pymongo
from flask import Flask
from flask import jsonify
from flask_cors import CORS
from bson import json_util
import json
import yaml

app = Flask(__name__)

cors = CORS(app, resources={r"/*": {"origins": "*"}})

app_port= 5001
retry_writes= True
retry_reads= False

with open("config.yml", "r") as ymlfile:
    cfg = yaml.safe_load(ymlfile)
    conn_string= cfg["DATABASE"]["CONNECTION_STRING"]
    db= cfg["DATABASE"]["DB"]
    collection=cfg["DATABASE"]["COLLECTION"]
   
    connection = pymongo.MongoClient(conn_string, retryWrites=retry_writes, retryReads=retry_reads)
    db = connection[db]
    collection = db[collection]
    
    #app_port=cfg["APP"]["PORT"]

@app.route('/')
def home():
    return 'Hello World'

@app.route('/find', methods = ['GET'])
def perform_reads():
    restaurant_record=collection.aggregate([
        {"$sample": { "size": 1 }},
        {"$project": {"_id":0}}
    ])

    for doc in restaurant_record:
        json_restaurant_doc = json.dumps(doc, default=json_util.default)
    return json_restaurant_doc

@app.route('/insert', methods = ['GET'])
def perform_inserts():
    insert_record=collection.insert_one(
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
    return str(insert_record.inserted_id)

@app.route('/search', methods = ['GET'])
def search():

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
def search():

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

    search_record=collection.aggregate(pipeline)
    
    for doc in search_record:
        json_search_doc = json.dumps(doc, default=json_util.default)
    return json_search_doc

@app.route('/hello', methods = ['GET'])
def dbhello():
    rsconf=db.command("hello")
    return json.loads(json_util.dumps(rsconf))

@app.route('/region', methods = ['GET'])
def get_region():
    stream = os.popen('ec2-metadata -z')
    output = stream.read()
    matches = re.match("placement: (.*?)\\n", output)
    if matches:
      return matches.groups(0)[0]
    else:
      return "Could not determine region"

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=app_port)