const JSONStream = require('JSONStream');
const mongodb = require('mongodb');
const once = require('lodash.once');
const throttle = require('lodash.throttle');
const throuhg2 = require('through2');

exports.Datastore = class {
  constructor(options) {
    this._mongoUrl = options.mongoUrl;
    this._collReviews = options.collReviews;
    this._collBatches = options.collBatches;
    this._collStats = options.collStats;
    this._getDatabase = this._getDatabase.bind(this);
    this._getDatabase = once(this._getDatabase);
    this._getBatchId = this._getBatchId.bind(this);
    this._getBatchId = throttle(this._getBatchId, options.batchRefresh);
  }

  getAllStats() {
    const ds = this;
    const promises = [ this._getDatabase(), this._getBatchId() ];
    return Promise.all(promises).then(([ db, batchId ]) => {
      if (!batchId) {
        return null;
      }
      const coll = db.collection(this._collStats);
      const filter = {'_id._batch_id': batchId};
      return coll.find(filter)
        .sort({ reviews_count: -1 })
        .stream()
        .pipe(throuhg2.obj(function (doc, enc, callback) {
          this.push(ds._formatShortStats(doc));
          callback();
        }))
        .pipe(JSONStream.stringify());
    });
  }

  getAirportStats(airport) {
    const promises = [ this._getDatabase(), this._getBatchId() ];
    return Promise.all(promises).then(([ db, batchId ]) => {
      if (!batchId) {
        return null;
      }
      const coll = db.collection(this._collStats);
      const filter = {'_id._batch_id': batchId, '_id.airport_name': airport};
      return coll.findOne(filter)
        .then(doc => this._formatLongStats(doc));
    });
  }

  getAirportReviews(airport, options) {
    const ds = this;
    const promises = [ this._getDatabase(), this._getBatchId() ];
    return Promise.all(promises).then(([ db, batchId ]) => {
      if (!batchId) {
        return null;
      }
      const coll = db.collection(this._collReviews);
      const filter = {'_batch_id': batchId, 'airport_name': airport};
      if (options.minOverall) {
        filter.overall_rating = {$gte: options.minOverall};
      }
      return coll.find(filter)
        .sort({ date: -1 })
        .stream()
        .pipe(throuhg2.obj(function (doc, enc, callback) {
          this.push(ds._formatReview(doc));
          callback();
        }))
        .pipe(JSONStream.stringify());
    });
  }

  _getDatabase() {
    return mongodb.MongoClient.connect(this._mongoUrl);
  }

  _getBatchId() {
    return this._getDatabase().then(db => {
      const coll = db.collection(this._collBatches);
      const filter = {ready: true};
      const options = {sort: { created: -1 }};
      return coll.findOne(filter, options)
        .then(doc => doc && doc._id);
    })
  }

  _formatShortStats(doc) {
    if (!doc) {
      return null;
    }
    return {
      airport_name: doc._id.airport_name,
      reviews_count: doc.reviews_count,
    };
  }

  _formatLongStats(doc) {
    if (!doc) {
      return null;
    }
    return {
      airport_name: doc._id.airport_name,
      reviews_count: doc.reviews_count,
      avg_overall_rating: doc.avg_overall_rating,
      recommended_count: doc.recommended_count,
    };
  }

  _formatReview(doc) {
    if (!doc) {
      return null;
    }
    return {
      review_id: doc._id,
      airport_name: doc.airport_name,
      overall_rating: doc.overall_rating,
      recommended: doc.recommended,
      date: doc.date.toDateString(),
      author_country: doc.author_country,
      content: doc.content,
    };
  }
}

exports.createDatastore = createDatastore;
function createDatastore(options) {
  return new exports.Datastore(options);
};
