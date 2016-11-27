const envalid = require('envalid');
const express = require('express');
const uuid = require('uuid');
const createDatastore = require('./datastore').createDatastore;

const env = envalid.cleanEnv(process.env, {
  PORT: envalid.num(),
  MONGO_URL: envalid.url(),
  COLL_REVIEWS: envalid.str(),
  COLL_BATCHES: envalid.str(),
  COLL_STATS: envalid.str(),
  BATCH_REFRESH: envalid.num(),
});

const server = express();
const datastore = createDatastore({
  mongoUrl: env.MONGO_URL,
  collReviews: env.COLL_REVIEWS,
  collBatches: env.COLL_BATCHES,
  collStats: env.COLL_STATS,
  batchRefresh: env.BATCH_REFRESH,
});

function serveError(res, err, msg) {
  const errorId = uuid.v4();
  res.status(500).send(`Internal Server Error: (${errorId})`);
  console.error(`${msg} (${errorId}):`, err && err.stack);
}

function serveStream(res, stream) {
  if (!stream) {
    res.json([]);
    return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json'});
  stream.pipe(res);
}

server.get('/api/all/stats', function (req, res) {
  datastore.getAllStats()
    .then(stream => serveStream(res, stream))
    .catch(err => serveError(res, err, 'Error serving all stats'))
});

server.get('/api/:airport/stats', function (req, res) {
  datastore.getAirportStats(req.params.airport)
    .then(stats => res.json(stats))
    .catch(err => serveError(res, err, 'Error serving airport stats'))
});

server.get('/api/:airport/reviews', function (req, res) {
  datastore.getAirportReviews(req.params.airport)
    .then(stream => serveStream(res, stream))
    .catch(err => serveError(res, err, 'Error serving airport reviews'))
});

server.listen(env.PORT, function () {
  console.log(`listening on port ${env.PORT}!`);
});
