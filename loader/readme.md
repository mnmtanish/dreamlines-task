# Dreamlines Task - Loader

The Loader loads a new **batch** of review data from a CSV file into the database. This app is capable of handling large input files because it uses a stream pipeline to process data. The CSV file can be given using a local path or an http/https url.

## Getting started

Install node dependencies with `yarn install` or `npm install`. Run the `index.js` file with required environment variables.

```
export MONGO_URL="mongodb://localhost:27017/airport"
export COLL_REVIEWS="reviews"
export COLL_BATCHES="batches"
export COLL_STATS="review_stats"
export DATA_SOURCE="../example/airport.csv"
# export DATA_SOURCE="http://localhost:8000/airport.csv"
node index.js
```

If and only if the new batch loads without any errors it will be used by servers. Servers will start using data from the new batch automatically when it's ready.

## Data loading process

The data loading process is as given below:

 1. Create a new Batch document in the database
 2. Stream data from the CSV file to the Database
 3. Process review data and calculate review stats
 4. Mark the new batch as ready so it can be used

### 1. Starting a new batch

When starting a new batch, a batch document will be created with the `ready` field set to `false`.

```
{
  _id: 'random-batch-id',
  started: new Date(),
  ready: false,
}
```

### 2. Streaming data csv->db

The stream pipeline consists of 4 components:

```
Reader -> Parser -> Formatter -> Writer
```

The Reader reads raw csv data from a file or url. The Parser parses csv stream and returns raw objects. The Formatter validates and formats input objects (example: the Date field has date values in multiple formats so use the `chrono` module). The Writer stores a stream of review objects to the database 100 reviews at a time.

### 3. Pre-calculate review stats

Process review data in the database to calculate review stats. Review stats are also calculated separately for each batch and they do not change after loading them so it is okay to pre-calculate stats.

```
Review -> Stats
```

### 4. Mark the batch as ready

The `ready` field will be set to `true` only if the batch loads successfully. The batch document also has a `started` field. The `started` field and the `ready` field can be used to select the latest ready batch in the database. Only data from the selected batch will be used by Servers.
