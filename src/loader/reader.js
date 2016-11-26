const fs = require('fs');

exports.createReader = createReader;
function createReader(options) {
  // TODO also support urls as data sources
  return fs.createReadStream(options.source);
};
