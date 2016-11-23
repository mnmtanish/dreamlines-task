const csv = require('csv-parser');
const envalid = require('envalid');
const fs = require('fs');
const mongodb = require('mongodb');
const streamToMongoDB = require('stream-to-mongo-db').streamToMongoDB;
const through2 = require('through2');
const uuid = require('uuid');

const env = envalid.cleanEnv(process.env, {
  MONGO_URL: envalid.url(),
  COLL_REVIEWS: envalid.str(),
  COLL_BATCHES: envalid.str(),
  INPUT_FILE: envalid.str(),
  BATCH_ID: envalid.str({ default: uuid.v4() }),
  BATCH_SIZE: envalid.num({ default: 1000 }),
});

mongodb.MongoClient.connect(env.MONGO_URL, function (err, db) {
  if (err) {
    console.error(err && err.stack || err)
    db.close();
    return;
  }

  return Promise.resolve(null)
    .then(() => startBatch(db))
    .then(() => writeReviews(db))
    .then(() => finishBatch(db))
    .catch(err => console.error(err && err.stack || err))
    .then(() => db.close());
});

function startBatch(db) {
  const coll = db.collection(env.COLL_BATCHES);
  const doc = { _id: env.BATCH_ID, started: new Date(), ready: false };
  return coll.insert(doc);
}

function finishBatch(db) {
  const coll = db.collection(env.COLL_BATCHES);
  const filter = { _id: env.BATCH_ID };
  const changes = { $set: { finished: new Date(), ready: true } };
  return coll.update(filter, changes);
}

function writeReviews(db) {
  return new Promise((resolve, reject) => {
    const csvDataStream = fs.createReadStream(env.INPUT_FILE);
    csvDataStream.on('error', err => reject(err));

    const parseCsvData = csv();
    parseCsvData.on('error', err => reject(err));

    const addBatchField = through2.obj(function (record, enc, callback) {
      record._id = uuid.v4();
      record.batch_id = env.BATCH_ID;
      this.push(record);
      callback();
    });
    addBatchField.on('error', err => reject(err));

    const saveToMongoDb = streamToMongoDB({
      dbURL: env.MONGO_URL,
      collection: env.COLL_REVIEWS,
      batchSize: env.BATCH_SIZE,
    });
    saveToMongoDb.on('error', err => reject(err));
    saveToMongoDb.on('close', () => resolve(null));

    csvDataStream
      .pipe(parseCsvData)
      .pipe(addBatchField)
      .pipe(saveToMongoDb);
  });
}
