define(function(require, exports, module) {

exports.startup = function(data) {
    var env = data.env;

    var event = require("pilot/event");
    var Editor = require("ace/editor").Editor;
    var Renderer = require("ace/virtual_renderer").VirtualRenderer;
    var theme = require("ace/theme/twilight");
    var EditSession = require("ace/edit_session").EditSession;

    var JavaScriptMode = require("ace/mode/javascript").Mode;
    var CssMode = require("ace/mode/css").Mode;
    var HtmlMode = require("ace/mode/html").Mode;
    var XmlMode = require("ace/mode/xml").Mode;
    var PythonMode = require("ace/mode/python").Mode;
    var PhpMode = require("ace/mode/php").Mode;
    var JavaMode = require("ace/mode/java").Mode;
    var CSharpMode = require("ace/mode/csharp").Mode;
    var RubyMode = require("ace/mode/ruby").Mode;
    var CCPPMode = require("ace/mode/c_cpp").Mode;
    var CoffeeMode = require("ace/mode/coffee").Mode;
    var PerlMode = require("ace/mode/perl").Mode;
    var SvgMode = require("ace/mode/svg").Mode;
    var TextileMode = require("ace/mode/textile").Mode;
    var TextMode = require("ace/mode/text").Mode;

    var UndoManager = require("ace/undomanager").UndoManager;

    var fs = require('fs');

    var modes = env.modes = {
      text: new TextMode(),
      xml: new XmlMode(),
      html: new HtmlMode(),
      css: new CssMode(),
      javascript: new JavaScriptMode(),
      python: new PythonMode(),
      php: new PhpMode()
    };

    var session = new EditSession('');
    session.setUndoManager(new UndoManager)

    var container = document.getElementById("editor");
    env.editor = new Editor(new Renderer(container, theme));
    // Each editor should contain reference to an `env` which will be used be
    // passed to the commands executed by keybindings.
    env.editor.env = Object.create(env);

    //env.editor.setSelectionStyle("text"); // "line"
    //env.editor.setSession(session)

    function onResize() {
      container.style.width = (document.documentElement.clientWidth) + "px";
      container.style.height = (document.documentElement.clientHeight - 22) + "px";
      env.editor.resize();
      env.editor.focus();
    };

    window.onresize = onResize;
    onResize();

  };
});
