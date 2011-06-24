var fs = require("io/fs");

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
