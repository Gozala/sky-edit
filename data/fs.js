/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: true latedef: false supernew: true browser: true */
/*global define: true port: true */
!define(function(require, exports) {

"use strict";

var types = require("pilot/types")
var canon = require('pilot/canon')
var modes = require('./mode-manager')

var env, GUID = 0
var callbacks = {}


function call(method) {
  var address = ++GUID
  callbacks[address] = arguments[arguments.length - 1]
  if (typeof port !== 'undefined') port.emit('<=', {
      '@': address,
      method: method,
      params: Array.prototype.slice.call(arguments, 1, arguments.length - 1)
  })
}

if (typeof port !== 'undefined') port.on('=>', function(message) {
  var address = message['@'], params = message.params
  var callback = callbacks[address]
  delete callbacks[address]
  if (callback) callback.apply(null, params)
}, false)

exports.readdir = call.bind(null, 'readdir')
exports.mkdir = call.bind(null, 'mkdir')
exports.rmdir = call.bind(null, 'unlink')
exports.readFile = call.bind(null, 'readFile')
exports.writeFile = call.bind(null, 'writeFile')
exports.readURI = call.bind(null, 'readURI')
exports.rename = call.bind(null, 'rename')
exports.readdir = call.bind(null, 'readdir')

function isFileURI(uri) {
  doc: "Returns true if given string is 'file:///' uri."

  return uri.indexOf('file://') === 0
}
function getFilePath(uri) {
  doc: "Takes 'file:///' uri & returs given file path."

  return uri.substr('file://'.length)
}
function isPath(uri) {
  doc: "Returns true if uri is path or relative file uri."

  return !~uri.indexOf('://')
}
function getDirectory(uri) {
  doc: "Returns uri to the parent directory."

  return uri.substr(0, uri.lastIndexOf('/') + 1)
}
function normalizeDirectoryURI(uri) {
  doc: "Normalized diroctory URI so that last character is '/'"

  return uri.substr(-1) === '/' ? uri : uri + '/'
}
function isAbsolute(uri) {
  doc: "Returns true if uri is 'file:///' uri or absolute path."

  return isFileURI(uri) || uri.charAt(0) === '/' || uri.indexOf('~/') === 0
}

function setBuffer(env, uri, content, skip, replace) {
  var session = env.editor.getSession()
  session.setValue(content)
  session.setMode(modes.getModeByURI(uri))
  editURI(env, uri)

  try {
    if (skip) return
    if (replace) history.replaceState({ uri: uri }, uri, 'edit:' + uri)
    else history.pushState({ uri: uri }, uri, 'edit:' + uri)
  } catch (e) {
    console.error(e.message)
  }
}

exports.types = {
  uri: (function(URI) {
    URI.name = 'uri'
    URI.parse = function parse(input) {
    }
    URI.stringify = function stringify(input) {
    }
  })(new types.Type())
}

function editURI(env, value) {
  doc: "Gets / sets (if value is passed) edit uri for the active buffer."

  return value ? env.editor.getSession().uri = value
               : env.editor.getSession().uri
}
function pwd(env) {
  doc: "Returns current working directory"

  return env.pwd || getDirectory(editURI(env) || '') || '~/'
}

function cwd(env, path) {
  doc: "Sets current working directiory"

  return env.pwd = path
}

exports.commands = {
    open: {
      description: 'opens a file / uri in a new tab',
      params: [{ name: 'uri', type: 'text' }],
      exec: function exec(env, params, request) {
        var uri = isAbsolute(params.uri) ? params.uri : pwd(env) + params.uri
        try {
          window.open('edit:' + uri)
          //window.open(window.location.href)
          request.done('opened: ' + uri)
          env.editor.focus()
        } catch (error) {
          request.doneWithError(error.message)
        }
      }
    },
    edit: {
      description: 'edit a file / uri',
      params: [{ name: 'uri', type: 'text' }],
      exec: function exec(env, params, request) {
        request.async()
        var uri = isAbsolute(params.uri) ? params.uri : pwd(env) + params.uri
        var path = isFileURI(uri) ? getFilePath(uri) : uri
        if (isPath(path)) {
          exports.readFile(path, function(error, content) {
            if (error) return request.doneWithError(error.message)
            else setBuffer(env, path, content, params.skip, params.replace)
            request.done('Edit: ' + path)
            env.editor.focus()
          })
        } else {
          request.doneWithError('Unsupported file location: ' + uri)
        }
      }
    },
    write: {
      description: 'save changes to the file',
      params: [{
        name: 'uri',
        type: 'text',
        defaultValue: null
      }],
      exec: function exec(env, params, request) {
        request.async()
        var uri = params.uri || editURI(env)
        uri = isAbsolute(uri) ? uri : pwd(env) + uri
        var content = env.editor.getSession().getValue()
        var path = isFileURI(uri) ? getFilePath(uri) : uri
        if (isPath(path)) {
          exports.writeFile(path, content, function(error) {
            if (error) return request.doneWithError(error.message)
            request.done('Wrote to: ' + path)
            env.editor.focus()
          })
        } else {
          request.doneWithError('Unsupported file location: ' + uri)
        }
      }
    },
    pwd: {
      description: 'Prints current working directory',
      exec: function exec(env, params, request) {
        request.done(pwd(env))
      }
    },
    ls: {
        description: 'list files in the working dir',
        params: [{
          name: 'uri',
          type: 'text',
          defaultValue: './'
        }],
        exec: function exec(env, params, request) {
          request.async()
          var uri = isAbsolute(params.uri) ? params.uri : pwd(env) + params.uri
          var path = isFileURI(uri) ? getFilePath(uri) : uri
          if (isPath(path)) {
            exports.readdir(path, function(error, entries) {
              if (error) return request.doneWithError(error.message)
              entries.forEach(request.output.bind(request))
              request.done(' ')
            })
          }  else {
            request.doneWithError('Unsupported location: ' + uri)
          }
        }
    },
    cd: {
        description: 'change working directory',
        params: [{ name: 'uri', type: 'text' }],
        exec: function exec(env, params, request) {
          request.async()
          var uri = isAbsolute(params.uri) ? params.uri : pwd(env) + params.uri
          uri = normalizeDirectoryURI(uri)
          exports.readdir(uri, function(error, entries) {
            if (error) return request.doneWithError(error.message)
            cwd(env, uri)
            request.done(uri)
          })
        }
    }
}

exports.startup = function startup(event) {
  env = event.env
  var commands = exports.commands

  Object.keys(commands).forEach(function(name) {
    var command = commands[name]
    command.name = name
    canon.addCommand(command)
  })


  function load(skip, replace) {
    var uri = String(location).substr('edit:'.length)
    if (uri) canon.exec('edit', env, 'cli', {
      uri: uri, skip: !!skip, replace: !!replace
    }, 'edit')
  }

  window.addEventListener('popstate', load, false)
  load(false, true)
}

});
