#!/usr/bin/env python3
##
# Script to continuously read the latest document from the MongoDB database/
# collection 'AUTO_HA.records'
# This should be run together with continuous-insert.py
#
# Prerequisite: Install latest PyMongo driver and other libraries, e.g:
#   $ sudo pip3 install pymongo dnspython
#
# For usage details, run with no params (first ensure script is executable):
#   $ ./continuous-read.py
##
import sys
import random
import time
import datetime
import pymongo
from flask import Flask
from flask import jsonify
from bson import json_util
import json
app = Flask(__name__)

connection = pymongo.MongoClient("mongodb+srv://appuser:passwordMongo@bbbe.cw81b.mongodb.net/sample_restaurants?retryWrites=true&w=majority")
db = connection["sample_restaurants"]
collection = db["restaurants"]


@app.route('/')
def home():
    return 'Hello World'

@app.route('/read', methods = ['GET'])
def perform_reads():
#    connection = pymongo.MongoClient("mongodb+srv://appuser:passwordMongo@bbbe.cw81b.mongodb.net/sample_restaurants?retryWrites=true&w=majority")
#    db = connection["sample_restaurants"]
#    collection = db["restaurants"]
    restaurant_record=collection.find_one({},{"_id":0})
    print(restaurant_record)
    return restaurant_record

@app.route('/insert', methods = ['GET'])
def perform_inserts():

#    connection = pymongo.MongoClient("mongodb+srv://appuser:passwordMongo@bbbe.cw81b.mongodb.net/sample_restaurants?retryWrites=true&w=majority")
#    db = connection["sample_restaurants"]
#    collection = db["restaurants"]
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
#    print(insert_record)
    return 'true'

@app.route('/search', methods = ['GET'])
def search():

    pipeline = [
    {
      "$search": {
        'text': {
                'query': "Hamburgers",
                'path': "cuisine"
            }
        },
    },
    {
        "$project": {
        "_id": 0
        }
    },
    ]


    json_docs = []

    search_record=collection.aggregate(pipeline)
    print(search_record)
    for doc in search_record:
        json_doc = json.dumps(doc, default=json_util.default)
        json_docs.append(json_doc)
    return json_doc

if __name__ == '__main__':
     app.run(host='0.0.0.0')
