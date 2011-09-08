/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint undef: true es5: true node: true devel: true
         forin: true latedef: false supernew: true browser: true */
/*global define: true port: true */
!define(function(require, exports) {

"use strict";

var types = require("pilot/types")

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

var JavaScriptMode = require("ace/mode/javascript").Mode
var CssMode = require("ace/mode/css").Mode
var HtmlMode = require("ace/mode/html").Mode
var XmlMode = require("ace/mode/xml").Mode
var PythonMode = require("ace/mode/python").Mode
var PhpMode = require("ace/mode/php").Mode
var JavaMode = require("ace/mode/java").Mode
var CSharpMode = require("ace/mode/csharp").Mode
var RubyMode = require("ace/mode/ruby").Mode
var CCPPMode = require("ace/mode/c_cpp").Mode
var CoffeeMode = require("ace/mode/coffee").Mode
var JsonMode = require("ace/mode/json").Mode
var PerlMode = require("ace/mode/perl").Mode
var ClojureMode = require("ace/mode/clojure").Mode
var OcamlMode = require("ace/mode/ocaml").Mode
var SvgMode = require("ace/mode/svg").Mode
var TextileMode = require("ace/mode/textile").Mode
var TextMode = require("ace/mode/text").Mode
var GroovyMode = require("ace/mode/groovy").Mode
var ScalaMode = require("ace/mode/scala").Mode

var modes = {
  'javascript': new JavaScriptMode(),
  'css': new CssMode(),
  'html': new HtmlMode(),
  'xml': new XmlMode(),
  'python': new PythonMode(),
  'php': new PhpMode(),
  'java': new JavaMode(),
  'csharp': new CSharpMode(),
  'ruby': new RubyMode(),
  'c_cpp': new CCPPMode(),
  'coffee': new CoffeeMode(),
  'json': new JsonMode(),
  'perl': new PerlMode(),
  'clojure': new ClojureMode(),
  'ocaml': new OcamlMode(),
  'svg': new SvgMode(),
  'textile': new TextileMode(),
  'text': new TextMode(),
  'groovy': new GroovyMode(),
  'scala': new ScalaMode()
}



function isFileURI(uri) {
  return uri.indexOf('file://') === 0
}
function getFilePath(uri) {
  return uri.substr('file://'.length)
}
function isPath(uri) {
  return !~uri.indexOf('://')
}
function getDirectory(uri) {
  return uri.substr(0, uri.lastIndexOf('/'))
}

function getModeForFileURI(env, uri) {
  var file = { name: String(uri).split('?')[0].split('#')[0] }
  var mode = "text"
  if (/^.*\.js|\.jsm$/i.test(file.name)) {
      mode = "javascript"
  } else if (/^.*\.xml$/i.test(file.name)) {
      mode = "xml"
  } else if (/^.*\.html$/i.test(file.name)) {
      mode = "html"
  } else if (/^.*\.css$/i.test(file.name)) {
      mode = "css"
  } else if (/^.*\.scss$/i.test(file.name)) {
      mode = "scss"
  } else if (/^.*\.py$/i.test(file.name)) {
      mode = "python"
  } else if (/^.*\.php$/i.test(file.name)) {
      mode = "php"
  } else if (/^.*\.cs$/i.test(file.name)) {
      mode = "csharp"
  } else if (/^.*\.java$/i.test(file.name)) {
      mode = "java"
  } else if (/^.*\.rb$/i.test(file.name)) {
      mode = "ruby"
  } else if (/^.*\.(c|cpp|h|hpp|cxx)$/i.test(file.name)) {
      mode = "c_cpp"
  } else if (/^.*\.coffee$/i.test(file.name)) {
      mode = "coffee"
  } else if (/^.*\.json$/i.test(file.name)) {
      mode = "json"
  } else if (/^.*\.(pl|pm)$/i.test(file.name)) {
      mode = "perl"
  } else if (/^.*\.(ml|mli)$/i.test(file.name)) {
      mode = "ocaml"
  } else if (/^.*\.(groovy)$/i.test(file.name)) {
      mode = "groovy"
  } else if (/^.*\.(scala)$/i.test(file.name)) {
      mode = "scala"
  }

  return modes[mode]
}

function setBuffer(env, uri, content, skip, replace) {
    var session = env.editor.getSession()
    session.setValue(content)
    session.setMode(getModeForFileURI(env, uri))
    activeURI = session.uri = uri
    try {
      console.log(skip, replace)
      if (skip) return
      if (replace) history.replaceState({ uri: uri }, uri, 'edit:' + uri)
      else history.pushState({ uri: uri }, uri, 'edit:' + uri)
    } catch (e) {
      console.error(e.message)
    }
}

var activeURI = null

exports.types = {
  uri: (function(URI) {
    URI.name = 'uri'
    URI.parse = function parse(input) {
    }
    URI.stringify = function stringify(input) {
    }
  })(new types.Type())
}

exports.commands = {
    edit: {
        description: 'edit a file / uri',
        params: [
            { name: 'uri', type: 'text', defaultValue: null }
        ],
        exec: function exec(env, params, request) {
            request.async()
            var uri = params.uri
            var path = isFileURI(uri) ? getFilePath(uri) : uri
            if (isPath(path)) {
              exports.readFile(path, function(error, content) {
                if (error) return request.doneWithError(error.message)
                else setBuffer(env, path, content, params.skip, params.replace)
                return request.done('Edit: ' + path)
              })
            } else {
              request.doneWithError('Unsupported file location: ' + uri)
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
                return activeURI
              }
            }
        ],
        exec: function exec(env, params, request) {
            request.async()
            var uri = params.uri || env.editor.session.uri
            var content = env.editor.getSession().getValue()
            var path = isFileURI(uri) ? getFilePath(uri) : uri
            if (isPath(path)) {
              exports.writeFile(path, content, function(error) {
                if (error) request.doneWithError(error.message)
                else request.done('Wrote to: ' + path)
              })
            } else {
              request.doneWithError('Unsupported file location: ' + uri)
            }
        }
    },
    pwd: {
      description: 'Prints current working directory',
      exec: function exec(env, params, request) {
        request.done(getDirectory(activeURI))
      }
    },
    ls: {
        description: 'list files in the working dir',
        params: [
            { name: 'uri', type: 'text', defaultValue: null }
        ],
        exec: function exec(env, params, request) {
          request.async()
          var uri = params.uri
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
    }
    /*
    cd: {
        description: 'change working directory',
        params: [
            { name: 'path', type: 'text' }
        ],
        exec: function exec(env, params) {
        }
    }*/
}

exports.startup = function startup(event) {
    var canon = require("pilot/canon")
    var commands = exports.commands
    var env = event.env

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
