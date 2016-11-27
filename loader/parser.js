const csv = require('csv-parser');

exports.createParser = createParser;
function createParser(options) {
  return csv();
};
