/*jshint asi:true */

define(function(require, exports, module) {

var env = env;
var typeManager = require("pilot/types")
var SelectionType = require('pilot/types/basic').SelectionType
var canon = require('pilot/canon')

var preloaded = [
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
  ["SVG", require("ace/mode/SVG").Mode, ["svg"]],
  ["Text", require("ace/mode/text").Mode, ["txt"]],
  ["Textile", require("ace/mode/textile").Mode, ["textile"]],
  ["XML", require("ace/mode/xml").Mode, ["xml"]]
]

var types = {
  mode: new SelectionType({
    data: function data() {
      return Object.keys(modes)
    }
  })
}
exports.types = types

var settings = {
  mode: {
    description: 'Sets buffer file mode',
    type: 'mode',
    onChange: function onChange(event) {
      env.editor.getSession().setMode(modes[event.value].mode)
    }
  }
}
exports.settings = settings

var commands = Object.create(null)
exports.commands = commands

var modes = Object.create(null)
exports.modes = modes

function getModeByURI(uri) {
  var type = uri.split('.').pop()
  console.log('>>>>', uri, type)


  for (var name in modes) {
    var mode = modes[name]
    if (~mode.types.indexOf(type))
      return mode.mode
  }
}
exports.getModeByURI = getModeByURI

function registerMode(mode) {
  modes[mode.name] = mode
}
exports.registerMode = registerMode

function unregisterMode(name) {
  delete modes[name]
}
exports.unregisterMode = unregisterMode

exports.startup = function startup(event) {
  env = event.env
  // register types
  Object.keys(types).forEach(function(name) {
    var type = types[name]
    type.name = name
    typeManager.registerType(type)
  })
  // register settings
  Object.keys(settings).forEach(function(name) {
    var setting = settings[name]
    setting.name = name
    env.settings.addSetting(setting)
  })
  // register commands
  Object.keys(commands).forEach(function(name) {
    var command = commands[name]
    command.name = name
    canon.addCommand(command)
    env.editor.commands.addCommand(command)
  })
  // register preloaded modes
  preloaded.forEach(function(tuple) {
    registerMode({
      name: tuple[0],
      mode: new tuple[1](),
      types: tuple[2]
    })
  })
}

});
