const fs = require('fs');
const request = require('request');

const URL_REGEX = /^https?:\/\//;

exports.createReader = createReader;
function createReader(options) {
  if (URL_REGEX.test(options.source)) {
    return request(options.source);
  }
  return fs.createReadStream(options.source);
};
