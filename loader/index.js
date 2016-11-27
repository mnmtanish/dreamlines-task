const envalid = require('envalid');
const uuid = require('uuid');
const createReader = require('./reader').createReader;
const createParser = require('./parser').createParser;
const createFormatter = require('./formatter').createFormatter;
const createWriter = require('./writer').createWriter;

// unique id for this batch
const BATCH_ID = uuid.v4();

const env = envalid.cleanEnv(process.env, {
  MONGO_URL: envalid.url(),
  COLL_REVIEWS: envalid.str(),
  COLL_BATCHES: envalid.str(),
  COLL_STATS: envalid.str(),
  DATA_SOURCE: envalid.str(),
});

// reader reads data from file/url
const reader = createReader({
  source: env.DATA_SOURCE,
});
reader.on('error', function (err) {
  console.error('error reading data:', err);
  process.exit(1);
});

// parser parses a csv stream
const parser = createParser();
parser.on('error', function (err) {
  console.error('error parsing data:', err);
  process.exit(1);
});

// formatter formats parsed csv row into documents
// throws errors when the input data is not valid
const formatter = createFormatter({
  batchId: BATCH_ID,
});
formatter.on('error', function (err) {
  console.error('error formating data:', err);
  process.exit(1);
});

// reviews is a stream of reviews
const reviews = reader
  .pipe(parser)
  .pipe(formatter)

// writer streams data to mongodb
const writer = createWriter({
  source: reviews,
  mongoUrl: env.MONGO_URL,
  collReviews: env.COLL_REVIEWS,
  collBatches: env.COLL_BATCHES,
  collStats: env.COLL_STATS,
  batchId: BATCH_ID,
});

// start loding process
Promise.resolve(null)
  .then(() => writer.startBatch())
  .then(() => writer.writeReviews())
  .then(() => writer.writeStats())
  .then(() => writer.finishBatch())
  .then(() => process.exit(0))
  .catch(err => {
    console.error('error writing data:', err);
    process.exit(1);
  });
