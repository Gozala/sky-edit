/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint undef: true es5: true node: true devel: true
         forin: true latedef: false supernew: true browser: true */
/*global define: true */

(typeof define !== "function" ? function($){ $(null, typeof exports !== 'undefined' ? exports : window); } : define)(function(require, exports) {

"use strict";

var env, GUID = 0;
var callbacks = {};

var pipe = document.documentElement;
function call(method, data, callback) {
  var address = ++GUID;
  callbacks[address] = callback;
  var message = JSON.stringify({
      '->': address,
      method: method,
      params: Array.prototype.slice.call(arguments, 1, arguments.length - 1)
  });
  pipe.setAttribute('data-server', message);
}

// Listen to incoming messages.
pipe.addEventListener('DOMAttrModified', function(event) {
  if (event.attrName !== 'data-client') return;
  var data = JSON.parse(event.newValue);
  var address = data['<-'];
  var callback = callbacks[address];
  delete callbacks[address];
  if (callback) callback.apply(null, data.params);
}, false);

exports.readdir = call.bind(null, 'readdir');
exports.mkdir = call.bind(null, 'mkdir');
exports.rmdir = call.bind(null, 'rmdir');
exports.readFile = call.bind(null, 'readFile');
exports.writeFile = call.bind(null, 'writeFile');
exports.readURI = call.bind(null, 'readURI');
exports.rename = call.bind(null, 'rename');

exports.startup = function startup(event) {
    boot();
}

function isFileURI(uri) {
    return uri.indexOf('file:') == 0
}

function setBuffer(env, uri, error, content) {
    if (!error) {
        var session = env.editor.getSession();
        session.setValue(content);
        //session.setMode(getModeForFileURI(uri));
    } else {
        alert(error);
    }
}

exports.commands = {
    edit: {
        description: 'edit a file / uri',
        params: [
            { name: 'uri', type: 'text', defaultValue: null }
        ],
        exec: function exec(env, params) {
            var uri = params.uri;
            exports.readURI(uri, setBuffer.bind(null, env, uri));
        }
    },
    write: {
        description: 'save changes to the file',
        params: [
            { name: 'uri', type: 'text', defaultValue: null }
        ],
        exec: function exec(env, params) {
            var uri = params.uri;
            var content = env.editor.getSession().getValue();
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

function boot() {
    var canon = require("pilot/canon");
    var commands = exports.commands;
    Object.keys(commands).forEach(function(name) {
        var command = commands[name];
        command.name = name;
        canon.addCommand(command);
    });
}

});
