#!/bin/bash

export MONGO_URL="mongodb://localhost:27017/airport"
export COLL_REVIEWS="reviews"
export COLL_BATCHES="batches"
export INPUT_FILE="./example-data/airport.csv"

node loader/index.js
