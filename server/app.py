#import markovify

from flask import Flask, jsonify, send_from_directory
from flask_cors import cross_origin
import json
import random

app = Flask(__name__, static_url_path='/static')

def stream():
    with open("trump_tweets.json", "r") as f:
        data = json.loads(f.read())
    while True:
        yield random.choice(data)


tweet_stream = stream()


@app.route("/api/v1/tweet", methods=['GET'])
@cross_origin()
def tweet():
    return jsonify(next(tweet_stream))

@app.route("/", methods=["GET"])
def root():
    return send_from_directory('static', 'index.html')

@app.route("/<path:path>", methods=["GET"])
def static_files(path):
    return send_from_directory('static', path)
