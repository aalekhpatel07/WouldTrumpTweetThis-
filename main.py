import os
from random import sample
from flask import Flask, jsonify, send_from_directory
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

    result = tweets.aggregate([{ '$sample': {'size': 1 }}])
    print(result)
    random_tweet = result[u'result']
    print(random_tweet)
    del random_tweet["_id"]
    
    print(random_tweet)
    return jsonify(random_tweet)

@app.route("/", methods=["GET"])
def root():
    return send_from_directory('static', 'index.html')

@app.route("/<path:path>", methods=["GET"])
def static_files(path):
    return send_from_directory('static', path)


if __name__ == '__main__':
    app.run(debug=True)

