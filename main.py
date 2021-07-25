import markovify

from flask import Flask, jsonify, send_from_directory
from flask_cors import cross_origin
import json
import random
import datetime
import html


app = Flask(__name__, static_url_path='/static')




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


if __name__ == '__main__':
    app.run(debug=True)

