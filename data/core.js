/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true es5: true node: true browser: true devel: true */
define(function(require, exports, module) {
  'use strict';

  var hub = require('plugin-hub/core')
  var gcli = require('gcli-plug/core')
  var ace = require('ace-plug/core')
  var vice = require('vice/core')
  var modes = require('support/mode-manager')
  var commands = require('support/command-manager')
  var fs = require('support/fs')

  var env = window.env = {}

  hub.plug(env, hub)
  hub.plug(env, gcli)
  hub.plug(env, ace)
  hub.plug(env, commands)
  hub.plug(env, vice)
  hub.plug(env, modes)
  hub.plug(env, fs)
});
