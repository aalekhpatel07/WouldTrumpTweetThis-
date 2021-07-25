import os
import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import pymongo
from dotenv import load_dotenv


def get_db_client():
    
    USERNAME=os.getenv("USERNAME")
    PASSWORD=os.getenv("PASSWORD")
    DATABASE=os.getenv("DATABASE")
    CLUSTER=os.getenv("CLUSTER")

    HOST = f"mongodb+srv://{USERNAME}:{PASSWORD}@{CLUSTER}/{DATABASE}?retryWrites=true&w=majority"
    return pymongo.MongoClient(HOST)


load_dotenv()
app = Flask(__name__, static_url_path='/static')

CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/api/v1/tweet", methods=['GET'])
def tweet():
    tweets = (
        get_db_client()
        .get_database(os.getenv("DATABASE"))
        .get_collection("Tweet")
    )

    random_tweets = list(tweets.aggregate([{ '$sample': {'size': 1 }}]))
    random_tweet = random_tweets[0]
    random_tweet['tweet_id'] = str(random_tweet['_id'])
    del random_tweet['_id']
    return jsonify(random_tweet)


@app.route("/api/v1/vote", methods=['POST'])
def vote():
    if 'tweet_id' not in request.json:
        return jsonify({'error': 'Missing tweet_id'}), 400

    if 'value' not in request.json:
        return jsonify({'error': 'Missing value'}), 400

    value = request.json['value']
    tweet_id = request.json['tweet_id']

    votes = (
        get_db_client()
        .get_database(os.getenv("DATABASE"))
        .get_collection("Vote")
    )
    vote_id = votes.insert_one({
        "tweet_id": tweet_id,
        "value": value,
        "stamp": datetime.datetime.now()
    }).inserted_id

    return jsonify({'vote_id': str(vote_id)})


@app.route("/<path:path>", methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    return jsonify({
        'error': 'Not Found',
        'message': 'This is strictly a RESTful API.',
        'available_endpoints': [
            {
                'path': '/api/v1/tweet',
                'methods': ['GET']
            },
            {
                'path': '/api/v1/vote',
                'methods': ['POST']
            }
        ]
    }), 501


@app.route("/", methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_index():
    return jsonify({
        'error': 'Not Found',
        'message': 'This is strictly a RESTful API.',
        'available_endpoints': [
            {
                'path': '/api/v1/tweet',
                'methods': ['GET']
            },
            {
                'path': '/api/v1/vote',
                'methods': ['POST']
            }
        ]
    }), 501


if __name__ == '__main__':
    app.run(debug=True)
