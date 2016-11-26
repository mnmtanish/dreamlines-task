#!/bin/bash

export MONGO_URL="mongodb://localhost:27017/airport"
export COLL_REVIEWS="reviews"
export COLL_BATCHES="batches"
export COLL_STATS="review_stats"
export DATA_SOURCE="../../example-data/airport.csv"

node index.js
