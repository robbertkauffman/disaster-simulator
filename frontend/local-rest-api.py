from flask import Flask,jsonify,request
from flask_cors import CORS
from faker import Faker
import random
import sys
import uuid

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

fake = Faker()

@app.route('/find', methods = ['GET'])
def find():
	if(request.method == 'GET'):
		data = {
			"foo" : random.randrange(0,100),
			"bar" : fake.sentence(nb_words=5),
		}

		return jsonify(data)

@app.route('/insert', methods = ['GET'])
def insert():
	if(request.method == 'GET'):
		data = {
			"acknowledged": True,
			"insertedId": uuid.uuid1()
		}

		return jsonify(data)

@app.route('/search', methods = ['GET'])
def search():
	if(request.method == 'GET'):
		data = {
			"foo" : random.randrange(0,100),
			"bar" : fake.sentence(nb_words=5),
		}

		return jsonify(data)

if __name__=='__main__':
  port = 5000
  if len(sys.argv) > 1:
    port = sys.argv[1]
  app.run(port=port, debug=True)
