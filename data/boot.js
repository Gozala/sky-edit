/*jshint asi:true */
!define(function(require, exports, module) {

require("pilot/fixoldbrowsers")
require("pilot/plugin_manager")
require("pilot/environment")
require("./launcher")
require("gcli/index")

require("pilot/index")
require("gcli/index")
require("./fs")
require("./mode-manager")

var plugins = [
  "pilot/index",
  "gcli/index",
  "vice/vice",
  "mode-manager",
  "fs",
  "launcher"
]

var catalog = exports.catalog = require("pilot/plugin_manager").catalog
catalog.registerPlugins(plugins).then(function() {
  catalog.startupPlugins({
    env: require("pilot/environment").create(),
    document: document,
    window: window
  })
})

});
