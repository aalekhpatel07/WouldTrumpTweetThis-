import os
from typing import (
    Optional,
)
import pymongo
import datetime
import json
import random
import markovify
import html
from dotenv import load_dotenv



def get_db_client():

    USERNAME=os.getenv("USERNAME")
    PASSWORD=os.getenv("PASSWORD")
    DATABASE=os.getenv("DATABASE")
    CLUSTER=os.getenv("CLUSTER")

    HOST = f"mongodb+srv://{USERNAME}:{PASSWORD}@{CLUSTER}/{DATABASE}?retryWrites=true&w=majority"
    return pymongo.MongoClient(HOST)


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


class Tweet:
    def __init__(self,
        text: str,
        date: str = str(random_date()),
        real: bool = False,
        retweets: int = random.randrange(100, 40000),
        favorites: int = random.randrange(100, 40000),
        twitter_id: Optional[str] = None
    ):
        self.text = text
        self.favorites = favorites
        self.retweets = retweets
        self.date = date
        self.real = real
        self.twitter_id = twitter_id

    def __str__(self):
        return f"Tweet(text={self.text}, date={self.date}, favorites={self.favorites}, retweets={self.retweets}, real={self.real}, twitter_id={self.twitter_id})"

    def to_dict(self):
        return {
            "text": self.text,
            "date": self.date,
            "favorites": self.favorites,
            "retweets": self.retweets,
            "real": self.real,
            "twitter_id": self.twitter_id
        }


def stream(real: bool = True):
    """Create a stream of Tweets.
    
    Args:
        real: If True, then generate real Tweets. If False, then generate
            fake Tweets.
    """
    with open("trump_tweets.json", "r") as f:
        data = json.loads(f.read())

    if not real:
        print("Generating Markov-Chain based Text model...")
        model = markovify.Text("\n".join(map(lambda x: x['text'], data)))
        print("Model generation complete...")
        for i in range(50000):
            yield Tweet(
                text=html.unescape(model.make_short_sentence(500)),
                real=False
            ).to_dict()
            print(f"Inserted {i:02d} records.")
    else:
        for idx, tweet in enumerate(data):
            yield Tweet(
                text=html.unescape(tweet['text']),
                date=tweet['date'],
                real=True,
                retweets=int(tweet['retweets']),
                favorites=int(tweet['favorites']),
                twitter_id=tweet['id'],
            ).to_dict()
            print(f"Inserted {idx:02d} records.")


def populate(tweet_collection):
    """Populate a collection with tweets.
    
    Args:
        tweet_collection: The collection to populate.
    """
    print("Populating database...")
    
    print("Inserting real tweets...")
    tweet_collection.insert_many(stream(real=True))

    print("Inserting fake tweets...")
    tweet_collection.insert_many(stream(real=False))

    print("Database populated.")

if __name__ == '__main__':
    print("Loading environment variables...")
    load_dotenv()
    print("Getting the database client...")
    client = get_db_client()
    print("Fetching the database collection: TWEET")
    tweet_collection = client.get_database(os.getenv('DATABASE')).get_collection('Tweet')
    print("Inserting many records of tweets.")
    populate(tweet_collection)