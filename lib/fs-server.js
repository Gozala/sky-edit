var fs = require("io/fs");

exports.readFile = function readFile(path, callback) {
  fs.readFile(path, function(error, data) {
    callback(error, String(data));
  });
};
exports.readURI = function readURI(uri, callback) {
  if (~uri.indexOf('file://'))
    exports.readFile(uri.replace('file://', ''), callback);
  else
    callback(Error("Unsupported URI"));
};
