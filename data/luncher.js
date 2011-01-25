define(function(require, exports, module) {

exports.launch = function(env) {

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
    var TextMode = require("ace/mode/text").Mode;
    var UndoManager = require("ace/undomanager").UndoManager;

    var modes = {
      text: new TextMode(),
      xml: new XmlMode(),
      html: new HtmlMode(),
      css: new CssMode(),
      javascript: new JavaScriptMode(),
      python: new PythonMode(),
      php: new PhpMode()
    };

    var docs = {};

    docs.js = new EditSession('');
    docs.js.setMode(new JavaScriptMode());
    docs.js.setUndoManager(new UndoManager());

    var container = document.getElementById("editor");
    env.editor = new Editor(new Renderer(container, theme));
    env.editor.setSelectionStyle("text"); // "line"

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
        var mode = getModeForFileURI(file.name);
      } catch(e) {
        return event.stopEvent();
      }

      if (window.FileReader) {
        var reader = new FileReader();
        reader.onload = function(e) {
          loadContent(reader.result, mode)
        };
        reader.readAsText(file);
      }
      return event.preventDefault(e);
    });

    function getModeForFileURI(uri) {
      uri = uri.split('?')[0].split('#')[0]
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
    
    function loadContent(content, uri) {
      env.editor.getSelection().selectAll();
      env.editor.onTextInput(content);
      env.editor.getSession().setMode(getModeForFileURI(uri));
    }

    window.addEventListener("message", function (event) {
      try {
        event = JSON.parse(event.data);
        if ("content-change" == event.type) {
          loadContent(event.content, event.uri)
        }
      } catch (e) {}
    }, false)

    // load file 
    window.postMessage(JSON.stringify({
      type: "content-load",
      uri: String(location.hash).substr(1)
    }), "*")
  };
});
