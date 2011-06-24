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
  contentScriptFile: data.url("message-pipe.js"),
  contentScriptWhen: 'start',
  onAttach: function onAttach(worker) {
    worker.on('message', function onMessage({ '->': address, method, params }) {
      fs[method].apply(null, params.concat([function(error, content) {
          worker.postMessage({ '<-': address, params: Array.slice(arguments) });
      }]))
    });
  }
})

// Registers protocol handler for `edit:*` protocol.
var editProtocolHandler = protocol.Handler({
  // When browser is navigated to `edit:*` URI this function is called with an
  // absolute URI and returned content or content under returned URI will be
  // displayed to a user.
  onRequest: function(request, response) {
    let { uri, referer } = request
    if (0 === uri.indexOf('edit:')) {
      response.content = data.load('index.html')
      response.contentType = 'text/html'
      response.originalURI = editorURI
    } else {
      response.uri = rootURI + uri
    }
  }
})
editProtocolHandler.listen({ scheme: PROTOCOL })
