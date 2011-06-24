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

    var modes = {
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
    };

    window.onresize = onResize;
    onResize();

    event.addListener(container, "dragover", function(e) {
      return event.preventDefault(e);
    });

    event.addListener(container, "drop", function(e) {
      try {
        var file = e.dataTransfer.files[0];
      } catch(e) {
        console.error(e);
        return event.stopEvent();
      }

      if (window.FileReader) {
        var reader = new FileReader();
        reader.onload = function(e) {
          loadContent(file.name, reader.result)
        };
        reader.readAsText(file);
      }
      return event.preventDefault(e);
    });

    function getModeForFileURI(uri) {
      uri = String(uri).split('?')[0].split('#')[0]
      var mode = "text";
      if (/^.*\.js$/i.test(uri)) {
          mode = "javascript";
      } else if (/^.*\.xml$/i.test(uri)) {
          mode = "xml";
      } else if (/^.*\.html$/i.test(uri)) {
          mode = "html";
      } else if (/^.*\.css$/i.test(uri)) {
          mode = "css";
      } else if (/^.*\.py$/i.test(uri)) {
          mode = "python";
      } else if (/^.*\.php$/i.test(uri)) {
          mode = "php";
      }
      return modes[mode];
    }

    function loadContent(uri, content) {
      var session = env.editor.getSession()
      session.setValue(content)
      session.setMode(getModeForFileURI(uri))
    }

    var uri = String(location).substr('edit:'.length);
    if (uri) fs.readURI(uri, loadContent.bind(null, uri));
  };
});
