var fs = require("https!raw.github.com/Gozala/jetpack-io/v0.1.0/fs.js");

function serializeError(error) {
  return error ? { message: error.message } : error;
}

exports.readFile = function readFile(path, callback) {
  fs.readFile(path, function(error, data) {
    callback(serializeError(error), String(data));
  });
};

exports.writeFile = function(path, content, callback) {
  fs.writeFile(path, content, function(error) {
    callback(serializeError(error));
  });
};
exports.readURI = function readURI(uri, callback) {
};
