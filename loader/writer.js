const mongodb = require('mongodb');
const s2mongo = require('stream-to-mongo-db').streamToMongoDB;

exports.Writer = class {
  constructor(options) {
    this._source = options.source;
    this._mongoUrl = options.mongoUrl;
    this._collReviews = options.collReviews;
    this._collBatches = options.collBatches;
    this._collStats = options.collStats;
    this._batchId = options.batchId;
    this._dbPromise = null;
  }

  startBatch() {
    return this._getDatabase().then(db => {
      const coll = db.collection(this._collBatches);
      const doc = {
        _id: this._batchId,
        started: new Date(),
        ready: false,
      };
      return coll.insert(doc);
    });
  }

  writeReviews() {
    return new Promise((resolve, reject) => {
      const writer = s2mongo({
        dbURL: this._mongoUrl,
        collection: this._collReviews,
        batchSize: 100,
      });
      writer.on('error', err => reject(err));
      writer.on('close', () => resolve(null));
      this._source.pipe(writer);
    });
  }

  writeStats() {
    return this._getDatabase().then(db => {
      const coll = db.collection(this._collReviews);
      const pipeline = [
        {$match: {_batch_id: this._batchId}},
        {$group: {
          _id: { airport_name: '$airport_name', _batch_id: '$_batch_id' },
          reviews_count: {$sum: 1},
          avg_overall_rating: {$avg: '$overall_rating'},
          recommended_count: {$sum:
            {$cond: [{$eq: ['$recommended', true]}, 1, 0]}
          },
        }}
      ];
      const options = {out: this._collStats};
      const cursor = coll.aggregate(pipeline, options);
      // NOTE call cursor.next to run the aggregation
      return cursor.next();
    });
  }

  finishBatch() {
    return this._getDatabase().then(db => {
      const coll = db.collection(this._collBatches);
      const filter = { _id: this._batchId };
      const changes = { $set: { finished: new Date(), ready: true } };
      return coll.update(filter, changes);
    });
  }

  _getDatabase() {
    if (!this._dbPromise) {
      this._dbPromise = mongodb.MongoClient.connect(this._mongoUrl);
    }
    return this._dbPromise;
  }
}

exports.createWriter = createWriter;
function createWriter(options) {
  return new exports.Writer(options);
};
