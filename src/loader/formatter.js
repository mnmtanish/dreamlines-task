const chrono = require('chrono-node');
const throuhg2 = require('through2');
const uuid = require('uuid');

const FIELD_INFO = {
  airport_name: {format: formatString},
  airport_shopping_rating: {format: formatRating},
  airport_staff_rating: {format: formatRating},
  author_country: {format: formatString},
  author: {format: formatString},
  content: {format: formatString},
  date_visit: {format: formatDate},
  date: {format: formatDate},
  experience_airport: {format: formatString},
  food_beverages_rating: {format: formatRating},
  link: {format: formatString},
  overall_rating: {format: formatRating},
  queuing_rating: {format: formatRating},
  recommended: {format: formatBoolean},
  terminal_cleanliness_rating: {format: formatRating},
  terminal_seating_rating: {format: formatRating},
  terminal_signs_rating: {format: formatRating},
  title: {format: formatString},
  type_traveller: {format: formatString},
  wifi_connectivity_rating: {format: formatRating},
};

exports.formatBoolean = formatBoolean;
function formatBoolean(str) {
  return str === '1';
}

exports.formatString = formatString;
function formatString(str) {
  return String(str);
}

exports.formatDate = formatDate;
function formatDate(str) {
  const date = chrono.parseDate(str);
  if (!date) {
    throw new Error(`invalid value for date ${str}`);
  }
  return date;
}

exports.formatRating = formatRating;
function formatRating(str) {
  const num = parseFloat(str);
  if (isNaN(num)) {
    throw new Error(`invalid value for rating ${str}`);
  }
  return num;
}

exports.createReview = createReview;
function createReview(batchId, rec, row) {
  const review = {
    _id: uuid.v4(),
    _csv_row: row,
    _batch_id: batchId,
  };
  Object.keys(FIELD_INFO).forEach(name => {
    const info = FIELD_INFO[name];
    const rawVal = rec[name];
    const hasVal = rawVal !== undefined && rawVal !== "";
    review[name] = hasVal ? info.format(rawVal) : null;
  });
  return review;
}

exports.createFormatter = createFormatter;
function createFormatter(options) {
  let nextRow = 1;
  return throuhg2.obj(function (rec, enc, callback) {
    let row = nextRow++;
    const review = createReview(options.batchId, rec, row);
    this.push(review);
    callback();
  });
};
