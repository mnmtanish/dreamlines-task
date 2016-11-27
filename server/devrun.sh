#!/bin/bash

export PORT="3000"
export MONGO_URL="mongodb://localhost:27017/airport"
export COLL_REVIEWS="reviews"
export COLL_BATCHES="batches"
export COLL_STATS="review_stats"
export BATCH_REFRESH="10000"

node index.js
