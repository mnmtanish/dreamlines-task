# Dreamlines Task - Server

The Server serves data from the latest **batch** over an HTTP API. This app is capable of handling large output data because it uses NodeJS streams to serve data from the database. The server will check the database for available data batches and it will use the latest ready-state batch.

## Getting started

Install node dependencies with `yarn install` or `npm install`. Run the `index.js` file with required environment variables.

```
export PORT="3000"
export MONGO_URL="mongodb://localhost:27017/airport"
export COLL_REVIEWS="reviews"
export COLL_BATCHES="batches"
export COLL_STATS="review_stats"
export BATCH_REFRESH="10000"
node index.js
```

The `BATCH_REFRESH` environment variable can be used to control the time duration between checking for new batches.

## HTTP API

#### Serve stats for all airports

> /api/all/stats

Example response:

```js
[
  { "airport_name": "london-heathrow-airport","reviews_count": 520 },
  { "airport_name": "london-stansted-airport","reviews_count": 402 },
  { "airport_name": "manchester-airport","reviews_count": 303 },
  { "airport_name": "paris-cdg-airport","reviews_count": 301 },
  { "airport_name": "dubai-airport","reviews_count": 279 },
  ...
]
```

#### Serve stats for a specific airport

> /api/:airport/stats

Example response:

```js
{
  "airport_name": "london-heathrow-airport",
  "reviews_count": 520,
  "avg_overall_rating": 4.853146853146853,
  "recommended_count": 160
}
```

#### Serve reviews of a specific airport

> /api/:airport/reviews[?min_overall]

The `min_overall` query parameter can be used to get reviews with have at least the given value for `overall_rating`. Example response:

```js
[
  {
    "review_id": "1e3dac4f-2533-480e-965c-fcb57c5fa10d",
    "airport_name": "london-heathrow-airport",
    "overall_rating": 7,
    "recommended": true,
    "date": "Sat Aug 01 2015",
    "author_country": "United Arab Emirates",
    "content": "Arrived on BA from ..."
  },
  ...
]
```
