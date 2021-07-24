import markovify

from flask import Flask, jsonify, send_from_directory
from flask_cors import cross_origin
import json
import random
import datetime
import html


app = Flask(__name__, static_url_path='/static')


def random_date(
        start=datetime.datetime.strptime('1/1/2008 1:30 PM', '%m/%d/%Y %I:%M %p'),
        end=datetime.datetime.strptime('8/1/2021 4:50 AM', '%m/%d/%Y %I:%M %p')
    ):
    """
    This function will return a random datetime between two datetime 
    objects.
    """
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start + datetime.timedelta(seconds=random_second)


def stream():
    with open("trump_tweets.json", "r") as f:
        data = json.loads(f.read())

    model = markovify.Text("\n".join(map(lambda x: x['text'], data)))
    print(model)

    while True:
        if random.random() <= .6:
            yield {
                    'text': '[GENERATED] ' + html.unescape(model.make_short_sentence(400)),
                    'favorites': random.randrange(100, 40000),
                    'retweets': random.randrange(100, 40000),
                    'date': str(random_date()),
                    'real': False
                }
        else:
            selected = random.choice(data)
            selected["text"] = html.unescape(selected["text"])
            selected["real"] = True
            yield selected


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


if __name__ == '__main__':
    app.run(debug=True)

