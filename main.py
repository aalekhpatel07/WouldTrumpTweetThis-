import os
from flask import Flask, jsonify, request
from flask_cors import cross_origin
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


@app.route("/api/v1/tweet", methods=['GET'])
@cross_origin()
def tweet():
    tweets = (
        get_db_client()
        .get_database(os.getenv("DATABASE"))
        .get_collection("Tweet")
    )

    random_tweets = list(tweets.aggregate([{ '$sample': {'size': 1 }}]))
    random_tweet = random_tweets[0]
    random_tweet['_id'] = str(random_tweet['_id'])
    return jsonify(random_tweet)


@app.route("/api/v1/vote", methods=['POST'])
@cross_origin()
def vote():
    if 'tweet_id' not in request.json:
        return jsonify({'error': 'Missing tweet_id'}), 400

    if 'value' not in request.json:
        return jsonify({'error': 'Missing value'}), 400

    value = request.json['value']
    tweet_id = request.json['id']

    votes = (
        get_db_client()
        .get_database(os.getenv("DATABASE"))
        .get_collection("Vote")
    )
    vote_id = votes.insert_one({
        "tweet_id": tweet_id,
        "value": value
    }).inserted_id

    return jsonify({'vote_id': vote_id})

@app.route("<path:path>", methods=['GET', 'POST', 'PUT', 'DELETE'])
def catch_all(path):
    return jsonify({'error': 'Not Found'}), 404
    
# @app.route("/", methods=["GET"])
# def root():
#     return send_from_directory('static', 'index.html')

# @app.route("/<path:path>", methods=["GET"])
# def static_files(path):
#     return send_from_directory('static', path)


if __name__ == '__main__':
    app.run(debug=True)

