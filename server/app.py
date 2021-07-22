import markovify
from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/", methods=['GET'])
def home():
    return {
        "tweets": [
            {
                "text": "Hello",
                "stamp": "Jan 29 2020",
            }
        ]
    }
