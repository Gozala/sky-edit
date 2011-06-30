/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint undef: true es5: true node: true devel: true
         forin: true latedef: false supernew: true browser: true */
/*global define: true port: true */

(typeof define !== "function" ? function($){ $(null, typeof exports !== 'undefined' ? exports : window); } : define)(function(require, exports) {

"use strict";

var env, GUID = 0;
var callbacks = {};


function call(method) {
  var address = ++GUID;
  callbacks[address] = arguments[arguments.length - 1];
  port.emit('<=', {
      '@': address,
      method: method,
      params: Array.prototype.slice.call(arguments, 1, arguments.length - 1)
  });
}

port.on('=>', function({ '@': address, params }) {
  var callback = callbacks[address];
  delete callbacks[address];
  if (callback) callback.apply(null, params);
}, false);

exports.readdir = call.bind(null, 'readdir');
exports.mkdir = call.bind(null, 'mkdir');
exports.rmdir = call.bind(null, 'rmdir');
exports.readFile = call.bind(null, 'readFile');
exports.writeFile = call.bind(null, 'writeFile');
exports.readURI = call.bind(null, 'readURI');
exports.rename = call.bind(null, 'rename');


function isFileURI(uri) {
    return uri.indexOf('file://') === 0;
}
function getFilePath(uri) {
  return uri.substr('file://'.length);
}
function isPath(uri) {
  return !~uri.indexOf('://');
}

function getModeForFileURI(env, uri) {
  var file = { name: String(uri).split('?')[0].split('#')[0] };
  var mode = "text";
  if (/^.*\.js|\.jsm$/i.test(file.name)) {
      mode = "javascript";
  } else if (/^.*\.xml$/i.test(file.name)) {
      mode = "xml";
  } else if (/^.*\.html$/i.test(file.name)) {
      mode = "html";
  } else if (/^.*\.css$/i.test(file.name)) {
      mode = "css";
  } else if (/^.*\.scss$/i.test(file.name)) {
      mode = "scss";
  } else if (/^.*\.py$/i.test(file.name)) {
      mode = "python";
  } else if (/^.*\.php$/i.test(file.name)) {
      mode = "php";
  } else if (/^.*\.cs$/i.test(file.name)) {
      mode = "csharp";
  } else if (/^.*\.java$/i.test(file.name)) {
      mode = "java";
  } else if (/^.*\.rb$/i.test(file.name)) {
      mode = "ruby";
  } else if (/^.*\.(c|cpp|h|hpp|cxx)$/i.test(file.name)) {
      mode = "c_cpp";
  } else if (/^.*\.coffee$/i.test(file.name)) {
      mode = "coffee";
  } else if (/^.*\.json$/i.test(file.name)) {
      mode = "json";
  } else if (/^.*\.(pl|pm)$/i.test(file.name)) {
      mode = "perl";
  } else if (/^.*\.(ml|mli)$/i.test(file.name)) {
      mode = "ocaml";
  } else if (/^.*\.(groovy)$/i.test(file.name)) {
      mode = "groovy";
  } else if (/^.*\.(scala)$/i.test(file.name)) {
      mode = "scala";
  }

  return env.modes[mode];
}

function setBuffer(env, uri, content) {
    var session = env.editor.getSession();
    session.setValue(content);
    session.setMode(getModeForFileURI(env, uri));
    activeURI = session.uri = uri;
}

var activeURI = null;

exports.commands = {
    edit: {
        description: 'edit a file / uri',
        params: [
            { name: 'uri', type: 'text', defaultValue: null }
        ],
        exec: function exec(env, params, request) {
            request.async();
            var uri = params.uri;
            var path = isFileURI(uri) ? getFilePath(uri) : uri;
            if (isPath(path)) {
              uri = 'file://' + path
              exports.readFile(path, function(error, content) {
                if (error) return request.doneWithError(error.message);
                else setBuffer(env, uri, content);
                return request.done('Edit: ' + path)
              });
            }
        }
    },
    write: {
        description: 'save changes to the file',
        params: [
            {
              name: 'uri',
              type: 'text',
              get defaultValue () {
                return activeURI;
              }
            }
        ],
        exec: function exec(env, params, request) {
            request.async();
            var uri = params.uri || env.editor.session.uri;
            var content = env.editor.getSession().getValue();
            if (isFileURI(uri)) uri = getFilePath(uri);
            if (isPath(uri)) {
              exports.writeFile(uri, content, function(error) {
                if (error) request.doneWithError(error.message)
                else request.done('Wrote to: ' + getFilePath(uri))
              });
            }
        }
    }/*,
    ls: {
        description: 'list files in the working dir',
        params: [
            { name: 'uri', type: 'text', defaultValue: null }
        ],
        exec: function exec(env, params) {
            var uri = params.uri || pwd(env);
        }
    },
    cd: {
        description: 'change working directory',
        params: [
            { name: 'path', type: 'text' }
        ],
        exec: function exec(env, params) {
        }
    }*/
};

exports.startup = function startup(event) {
    var canon = require("pilot/canon");
    var commands = exports.commands;
    Object.keys(commands).forEach(function(name) {
        var command = commands[name];
        command.name = name;
        canon.addCommand(command);
    });
    var uri = String(location).substr('edit:'.length);
    if (uri) canon.exec('edit', event.env, 'cli', { uri: uri }, 'edit');
};

});
