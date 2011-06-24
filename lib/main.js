'use strict'

const { data } = require("self")
  ,   { PageMod } = require("page-mod")
  ,   { Request } = require("request")
  ,   protocol = require("protocol")

const PROTOCOL = 'edit'
const editorURI = data.url('index.html')
const rootURI = editorURI.substr(0, editorURI.lastIndexOf('/') + 1)
const fs = require("./fs-server");

var mod  = PageMod({
  include: PROTOCOL + ':*',
  contentScript: 'new ' + function MessageProxy() {
    window.addEventListener("message", function onMessage(event) {
      try { postMessage(JSON.parse(event.data)) } catch (e) {}
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

// Registers protocol handler for `edit:*` protocol.
var editProtocolHandler = protocol.Handler({
  // When browser is navigated to `edit:*` URI this function is called with an
  // absolute URI and returned content or content under returned URI will be
  // displayed to a user.
  onRequest: function(request, response) {
    let { uri, referer } = request
    if (referer) response.uri = rootURI + uri
    else {
      response.content = data.load('index.html')
      response.contentType = 'text/html'
      response.originalURI = editorURI
    }
  }
})
editProtocolHandler.listen({ scheme: PROTOCOL })
