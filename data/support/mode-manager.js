/*jshint asi:true */

define(function(require, exports, module) {
  'use strict';

  exports.name = 'mode-manager'
  exports.version = '0.0.1'
  exports.description = 'Installs modes exposed by plugins.'
  exports.author = 'Irakli Gozalishvili <rfobic@gmail.com>'
  exports.stability = 'unstable'

  var unbind = Function.call.bind(Function.bind, Function.call)
  var owns = unbind(Object.prototype.hasOwnProperty)
  var meta = require('plugin-hub/core').meta

  var modes = Object.create(null)
  ;[
    ["C/C++", require("ace/mode/c_cpp").Mode, ["c", "cpp", "cxx", "h", "hpp"]],
    ["Clojure", require("ace/mode/clojure").Mode, ["clj"]],
    ["CoffeeScript", require("ace/mode/coffee").Mode, ["coffee"]],
    ["ColdFusion", require("ace/mode/coldfusion").Mode, ["cfm"]],
    ["C#", require("ace/mode/csharp").Mode, ["cs"]],
    ["CSS", require("ace/mode/css").Mode, ["css"]],
    ["Groovy", require("ace/mode/groovy").Mode, ["groovy"]],
    ["haXe", require("ace/mode/haxe").Mode, ["hx"]],
    ["HTML", require("ace/mode/html").Mode, ["html", "htm"]],
    ["Java", require("ace/mode/java").Mode, ["java"]],
    ["JavaScript", require("ace/mode/javascript").Mode, ["js"]],
    ["JSON", require("ace/mode/json").Mode, ["json"]],
    ["LaTeX", require("ace/mode/latex").Mode, ["tex"]],
    ["Lua", require("ace/mode/lua").Mode, ["lua"]],
    ["Markdown", require("ace/mode/markdown").Mode, ["md", "markdown"]],
    ["OCaml", require("ace/mode/ocaml").Mode, ["ml", "mli"]],
    ["Perl", require("ace/mode/perl").Mode, ["pl", "pm"]],
    ["pgSQL",require("ace/mode/pgsql").Mode, ["pgsql", "sql"]],
    ["PHP",require("ace/mode/php").Mode, ["php"]],
    ["Powershell", require("ace/mode/powershell").Mode, ["ps1"]],
    ["Python", require("ace/mode/python").Mode, ["py"]],
    ["Scala", require("ace/mode/scala").Mode, ["scala"]],
    ["SCSS", require("ace/mode/scss").Mode, ["scss"]],
    ["Ruby", require("ace/mode/ruby").Mode, ["rb"]],
    ["SQL", require("ace/mode/sql").Mode, ["sql"]],
    ["SVG", require("ace/mode/svg").Mode, ["svg"]],
    ["Text", require("ace/mode/text").Mode, ["txt"]],
    ["Textile", require("ace/mode/textile").Mode, ["textile"]],
    ["XML", require("ace/mode/xml").Mode, ["xml"]]
  ].forEach(function($) {
    modes[$[0]] = { name: $[0], mode: new $[1], types: $[2] }
  })

  // hack to workaround the fact that types are not passed an environment.
  var ENV, mode

  // pre-installed modes.
  exports.modes = modes

  exports.types = {
    mode: meta({ type: 'selection' }, function data() {
      return Object.keys(modes)
    })
  }

  exports.settings = {
    mode: meta({
      description: 'Sets buffer file mode',
      type: 'mode'
    }, function mode(value) {
      ENV.editor.getSession().setMode(modes[value].mode)
    })
  }

  exports.commands = {
    'set-mode': meta({
      takes: [ 'mode' ],
      description: 'Sets editor mode on the active buffer'
    }, function setMode(name) {
      mode.set(ENV, mode.get(ENV, name).mode)
    }),
    echo: meta({
      takes: [ 'string' ],
      description: 'Echos back a message'
    }, function(input) {
      return input
    })
  }

  exports.mode = mode = {}
  mode.install = function plug(env, mode) {
    return env.modes[mode.name] = mode
  }
  mode.install.all = function installall(env, modes) {
    return Object.keys(modes).map(function(name) {
      var item = modes[name]
      if (!owns(item, 'name')) item.name = name
      mode.install(env, item)
    })
  }
  mode.uninstall = function uninstall(env, mode) {
    return delete env.modes[mode.name]
  }
  mode.uninstall.all = function uninstallall(env, modes) {
    return Object.keys(modes).map(function(name) {
      mode.uninstall(env, modes[name])
    })
  }
  mode.set = function set(env, mode) {
    env.editor.getSession().setMode(mode)
  }
  mode.get = function get(env, name) {
    return env.modes[name]
  }
  mode.of = function of(env, uri) {
    var type = uri.split('.').pop()
    var names = Object.keys(env.modes)
    while (names.length) {
      var mode = modes[names.shift()]
      if (~mode.types.indexOf(type)) return mode.mode
    }
  }

  exports.onstartup = function onstartup(env, plugins) {
    ENV = env
    env.modes = Object.create(null)
  }

  exports.onplug = function onplug(env, plugin) {
    return plugin.modes && mode.install.all(env, plugin.modes)
  }

  exports.onunplug = function onunplug(env, plugin) {
    return plugin.modes && mode.uninstall.all(env, plugin.modes)
  }

});
