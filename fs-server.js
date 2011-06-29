var fs = require("https!raw.github.com/Gozala/jetpack-io/v0.1.0/fs.js");

exports.readFile = function readFile(path, callback) {
  fs.readFile(path, function(error, data) {
    callback(error, String(data));
  });
};

exports.writeFile = function(path, content, callback) {
  fs.writeFile(path, content, function(error) {
    callback(error);
  });
};
exports.readURI = function readURI(uri, callback) {
};
