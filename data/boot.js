define(function(require, exports, module) {
  
require("pilot/fixoldbrowsers");
require("pilot/plugin_manager");
require("pilot/environment");
require("./launcher");
require("cockpit/index");

require("pilot/index");
require("ace/defaults");
//require("./fs");

var plugins = [
  "pilot/index",
  "cockpit/index",
  "ace/defaults",
  "vice/vice",
  "fs",
  "launcher"
];

var catalog = require("pilot/plugin_manager").catalog;
catalog.registerPlugins(plugins).then(function() {
  var env = require("pilot/environment").create();
  catalog.startupPlugins({ env: env });
});

});
