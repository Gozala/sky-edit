/*jshint asi:true */

define(function(require, exports, module) {
  'use strict';

  exports.name = 'command-manager'
  exports.version = '0.0.1'
  exports.description = 'Installs modes exposed by plugins.'
  exports.author = 'Irakli Gozalishvili <rfobic@gmail.com>'
  exports.stability = 'unstable'
  exports.dependencies = [ 'hub@0.0.2' ]

  var unbind = Function.call.bind(Function.bind, Function.call)
  var owns = unbind(Object.prototype.hasOwnProperty)
  var meta = require('plugin-hub/core').meta

  var commands = Object.create(null);

  var command = meta('Group of utilities for working with commands', {})
  command.params = meta({
    description: 'Generates paramater signature'
  }, function params(signature) {
    var result = []

    if (Array.isArray(signature)) {
      result = signature.map(function(_, index) {
        var param = typeof(_) === 'string' ? { type: _ } : _
        param.name = String(index)
        return param
      })
    }

    if (typeof(signature) === 'number') {
      while (signature) result.unshift({ name: signature -- })
    }

    return result
  })
  command.make = meta({
    description: 'Makes a commonad from function'
  }, function make(f) {
    return {
      name: f.meta.name || f.name,
      description: f.meta.description || '',
      params: command.params(f.meta.takes || f.length),
      exec: function execute(editor, params, context) {
        var args = []
        for (var index in params) args[index] = params[index]
        // TODO: Find a proper solution instead.
        if (~f.meta.takes.indexOf('editor'))
            args[f.meta.takes.indexOf('editor')] = editor
        if (~f.meta.takes.indexOf('env'))
            args[f.meta.takes.indexOf('editor')] = editor

        return f.apply(f, args)
      }
    }
  })

  command.plug = meta({
    description: 'Plugs in the command'
  }, function plug(env, name, descriptor) {
    if (typeof(descriptor) === 'function') {
      env.commands[name] = descriptor
      env.broadcast('command:plug', name, descriptor)
    }

    if (typeof(descriptor) === 'object') {
      env.commands[name] = descriptor
      Object.keys(descriptor).forEach(function(key) {
        command.plug(env, name + ' ' + key, descriptor[key])
      })
      env.broadcast('command:group:plug', name, descriptor)
    }
  })
  command.plug.all = meta({
    description: 'Plugs in all commands'
  }, function plug(env, commands) {
    return Object.keys(commands).map(function(name) {
      return commands[name] && command.plug(env, name, commands[name])
    })
  })

  command.unplug = meta({
    description: 'Unplugs given command'
  }, function unplug(env, name, descriptor) {
    descriptor = env.commands[name]
    if (typeof(descriptor) === 'function') {
      delete env.commands[name]
      env.broadcast('command:unplug', name, descriptor)
    }

    if (typeof(descriptor) === 'object') {
      delete env.commands[name]
      Object.keys(descriptor).forEach(function(key) {
        command.unplug(env, name + ' ' + key, descriptor[key])
      })
      env.broadcast('command:group:unplug', name, descriptor)
    }
    return env.editor.commands.removeCommand(command.plug)
  })
  command.unplug.all = meta({
    description: 'Unplugs all commands'
  }, function unplug(env, commands) {
    return Object.keys(commands).map(function(name) {
      return command.unplug(env, name, commands[name])
    })
  })

  exports.onstartup = function onstartup(env, plugins) {
    env.commands = commands
    plugins.forEach(exports.onplug.bind(exports.onplug, env))
  }
  exports.onshutdown = function onshutdown(env) {
    delete env.commands
  }
  exports.onplug = function onplug(env, plugin) {
    if (plugin.commands) command.plug.all(env, plugin.commands)
  }
  exports.onunplug = function onunplug(env, plugin) {
    if (plugin.command) command.unplug.all(env, plugin.commands)
  }

});
