'use strict'

const { data } = require("self")
  ,   { PageMod } = require("page-mod")
  ,   { Request } = require("request")
  ,   protocol = require("protocol")


const editorTemplate = data.load('index.html')
const editorURI = data.url('editor.html')

// Registers protocol handler for `edit:*` protocol.
protocol.register({
  scheme: 'edit',
  // When browser is navigated to `edit:*` URI this function is called with an
  // absolute URI and returned content or content under returned URI will be
  // displayed to a user.
  onRequest: function(uri) {
    // If editor's resource URI (`editor::*`) is requested forwarding it to
    // `resource://*` URI containing that resource, otherwise returning
    // `resource://*` URI of the editor.
    var url = uri.split('edit:')[1]

    return editorTemplate.replace('{{editor}}', editorURI + '#' + url)
                         .replace('{{source}}', url)
  }
})

// Registers protocol handler for `about:editor`. Navigating that URI should
// displaying an ace editor.
protocol.register({
  about: 'editor',
  // When browser is navigated to `about:editor` this function is called
  // and returned content or content under returned URI will be displayed
  // to a user.
  onRequest: function onRequest() {
    return editor.replace('{{editor}}', editorURI)
  }
})

var mod  = PageMod({
  include: editorURI + '*',
  contentScript: 'new ' + function Worker() {
    window.addEventListener("message", function onMessage(event) {
      try {
        postMessage(JSON.parse(event.data))
      } catch (e) {}
    }, false)

    self.on('message', function(data) {
      window.postMessage(JSON.stringify(data), "*")
    })

  },
  onAttach: function onAttach(worker) {
    worker.on('message', function onMessage(event) {
      if ('content-load' == event.type) {
        Request({
          url: event.uri,
          onComplete: function onComplete(data) {
            worker.postMessage({
              type: 'content-change',
              uri: event.uri,
              content: data.text
            })
          }
        }).get()
      }
    })
  }
})
