pip3 install Flask Flask-RESTful flask-cors Faker
python3 local-rest-api.py 5001 & python3 local-rest-api.py 5002 & python3 local-rest-api.py 5003 & python3 -m http.server && fg