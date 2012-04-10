/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: true latedef: false supernew: true browser: true */
/*global define: true port: true */
define(function(require, exports) {

  "use strict";

  var hub = require('plugin-hub/core'), meta = hub.meta, values = meta.values
  var defer = require('support/micro-promise/core').defer
  var mode = require('support/mode-manager').mode

  exports.name = 'fs'
  exports.version = '0.0.2'
  exports.author = 'Irakli Gozalishvili <rfobic@gmail.com>'
  exports.description = 'Filesystem bindings for an editor'
  exports.stability = 'unstable'
  exports.dependencies = [ 'mode-manager@0.0.1' ]

  var env, GUID = 0
  var callbacks = {}


  function call(method) {
    var address = ++GUID
    callbacks[address] = arguments[arguments.length - 1]
    if (typeof(port) !== 'undefined') port.emit('<=', {
        '@': address,
        method: method,
        params: Array.prototype.slice.call(arguments, 1, arguments.length - 1)
    })
  }

  if (typeof(port) !== 'undefined') port.on('=>', function(message) {
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
    session.setMode(mode.of(env, uri))
    editURI(env, uri)

    try {
      if (skip) return
      if (replace) history.replaceState({ uri: uri }, uri, 'edit:' + uri)
      else history.pushState({ uri: uri }, uri, 'edit:' + uri)
    } catch (e) {
      console.error(e.message)
    }
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

  exports.types = {
    uri: meta({
      description: 'File URI type',
      type: 'string'
    }, function(uri) {
      return isAbsolute(uri) ? uri : pwd(window.env) + uri
    })
  }

  var commands = {
    open: meta({
      description: 'opens a file / uri in a new tab',
      takes: [ 'uri', 'env' ]
    }, function open(uri, env) {
      var deferred = defer()
      uri = isAbsolute(uri) ? uri : pwd(env) + uri
      try {
        window.open('edit:' + uri)
        deferred.resolve('opened: ' + uri)
        env.editor.focus()
      } catch (error) {
        deferred.reject(error.message)
      }
      return deferred.promise
    }),
    edit: meta({
      description: 'edit a file / uri',
      takes: [ 'uri', 'env' ]
    }, function edit(uri, env, skip, replace) {
      var deferred = defer()
      uri = isAbsolute(uri) ? uri : pwd(env) + uri
      var path = isFileURI(uri) ? getFilePath(uri) : uri
      if (isPath(path)) {
        exports.readFile(path, function(error, content) {
          if (error) deferred.reject(error.message)
          else setBuffer(env, path, content, skip, replace)
          deferred.resolve('Edit: ' + path)
          env.editor.focus()
        })
      } else {
        deferred.resolve('Unsupported file location: ' + uri)
      }
      return deferred.promise
    }),
    write: meta({
      description: 'save changes to the file',
      takes: [ 'uri', 'env' ],
    }, function write(uri, env) {
      uri = uri || editURI(env)
      uri = isAbsolute(uri) ? uri : pwd(env) + uri
      var deferred = defer()
      var content = env.editor.getSession().getValue()
      var path = isFileURI(uri) ? getFilePath(uri) : uri
      if (isPath(path)) {
        exports.writeFile(path, content, function(error) {
          if (error) deferred.reject(error.message)
          deferred.resolve('Wrote to: ' + path)
          env.editor.focus()
        })
      } else {
        deferred.reject('Unsupported file location: ' + uri)
      }
      return deferred.promise
    }),
    pwd: meta({
      description: 'Prints current working directory',
      takes: [ 'env' ]
    }, function (env) {
      return pwd(env)
    }),
    ls: meta({
      description: 'list files in the working dir',
      takes: [ 'uri', 'env' ]
    }, function ls(uri, env) {
      uri = isAbsolute(uri) ? uri : pwd(env) + uri
      var path = isFileURI(uri) ? getFilePath(uri) : uri
      var deferred = defer()
      if (isPath(path)) {
        exports.readdir(path, function(error, entries) {
          if (error) deferred.reject(error.message)
          deferred.resolve(entries.join('\n<br/>'))
        })
      }  else {
        deferred.reject('Unsupported location: ' + uri)
      }
      return deferred.promise
    }),
    cd: meta({
      description: 'change working directory',
      takes: [ 'uri', 'env' ]
    }, function exec(uri, env) {
      uri = isAbsolute(uri) ? uri : pwd(env) + uri
      uri = normalizeDirectoryURI(uri)
      var deferred = defer()
      exports.readdir(uri, function(error, entries) {
        if (error) deferred.reject(error.message)
        cwd(env, uri)
        deferred.resolve(uri)
      })
      return deferred.promise
    })
  }
  exports.commands = commands

  exports.onstartup = function startup(env) {
    env.fs = exports

    function load(skip, replace) {
      var uri = String(location).substr('edit:'.length)
      if (uri) commands.edit(uri, env, skip, replace)
    }

    window.addEventListener('popstate', load, false)
    load(false, true)
  }

});
