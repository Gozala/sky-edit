/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true
         forin: true latedef: false browser: true */
/*global define: true port: true */
!define(function(require, exports, module) {

exports.startup = function(data) {
    var env = window.env = data.env;

    var Range = require("ace/range").Range;
    var Editor = require("ace/editor").Editor;
    var Renderer = require("ace/virtual_renderer").VirtualRenderer;
    var UndoManager = require("ace/undomanager").UndoManager;
    var EditSession = require("ace/edit_session").EditSession;

    var theme = require("./theme");
    var session = new EditSession('');
    session.setUndoManager(new UndoManager());

    var container = document.getElementById("editor");
    env.editor = new Editor(new Renderer(container, theme));
    // Each editor should contain reference to an `env` which will be used be
    // passed to the commands executed by keybindings.
    env.editor.env = Object.create(env);

    function onResize() {
      container.style.width = (document.documentElement.clientWidth) + "px";
      container.style.height = (document.documentElement.clientHeight - 22) + "px";
      env.editor.resize();
      env.editor.focus();
    }

    window.onresize = onResize;
    onResize();

    env.editor.renderer.setHScrollBarAlwaysVisible(false);
    env.editor.setShowInvisibles(true);
  };
});
