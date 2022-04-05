#!/usr/bin/env python3

from flask import Flask
from flask_cors import CORS
import backend


APP_PORT = 5003
RETRY_READS = False
RETRY_WRITES = True


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/')
def home():
    return 'Disaster Simulator backend is running..aa.'

@app.route('/find', methods = ['GET'])
def find():
    return backend.find(collection, client, region)

@app.route('/insert', methods = ['GET'])
def insert():
    return backend.insert(collection, client, region)

@app.route('/search', methods = ['GET'])
def search():
    return backend.search(collection, client, region)

@app.route('/hello', methods = ['GET'])
def db_hello():
    return backend.db_hello(db)

@app.route('/region', methods = ['GET'])
def get_region():
    return backend.get_region()


if __name__ == '__main__':
    global client, db, collection
    client, db, collection = backend.get_mongo_connection(RETRY_READS, RETRY_WRITES)

    global region
    region = backend.get_region()

    app.run(debug=True, host='0.0.0.0', port=APP_PORT)