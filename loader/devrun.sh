#!/bin/bash

export MONGO_URL="mongodb://localhost:27017/airport"
export COLL_REVIEWS="reviews"
export COLL_BATCHES="batches"
export COLL_STATS="review_stats"
export DATA_SOURCE="../example/airport.csv"
# export DATA_SOURCE="http://localhost:8000/airport.csv"

node index.js
