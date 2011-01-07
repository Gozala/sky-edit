'use strict'

const { data } = require("self")
  ,   protocol = require("protocol")

function isAbsoulteURI(uri) {
  return 0 === uri.indexOf('edit:')
}
function isEditorContentURI(uri) {
  return 0 === uri.indexOf('edit::')
}
function getEditorContentURI(uri) {
  uri = uri || 'editor.html'
  return data.url('skywriter/plugins/ace/' + uri)
}
function parseEditorContentURI(uri) {
  return uri.substr('edit::'.length)
}

require('protocol').register({
  scheme: 'edit',
  onRelative: function(relativeURI, baseURI) {
    let absoluteURI = relativeURI
    if (!isAbsoulteURI(relativeURI))
      absoluteURI = this.scheme + '::' + getEditorContentURI(relativeURI)
    return absoluteURI
  },
  onRequest: function(uri) {
    uri = isEditorContentURI(uri) ? parseEditorContentURI(uri)
                                   : getEditorContentURI()
    return uri
  }
})

function join(source, target) {
  source = source.split('/')
  target = target.split('/')
  source.pop()
  return source.concat(target).join('/')
}
function normalizeURI(uri) {
  return uri.split('/').reduce(function(uri, element) {
    if ('..' == element) uri.pop()
    else if ('.' !== element) uri.push(element)
    return uri
  }, []).join('/')
}

require('protocol').register({
  scheme: 'editor',
  onRelative: function(relativeURI, baseURI) {
    let absoluteURI
    if (relativeURI.indexOf('editor:') === 0) absoluteURI = relativeURI
    else absoluteURI = join(baseURI, relativeURI)
    absoluteURI = normalizeURI(absoluteURI)
    return absoluteURI
  },
  onRequest: function(uri) {
    uri = data.url('skywriter/' + uri.substr(this.scheme.length + 1))
    console.log(uri)
    return uri
  }
})

require('protocol').register({
  about: 'editor',
  onRequest: function onRequest() {
    let base = data.url('skywriter/plugins/ace/')
    let content = data.load('skywriter/plugins/ace/editor.html')
    return content.replace(/src(\s*)=(\s*)"/g, 'src="' + base)
  }
})

/*
require('page-mod').PageMod({
  include: 'edit:*',
  contentScriptWhen: 'ready',
  contentScript: 'new ' + function Worker() {
    self.onMessage = function onMessage(message) {
      var frame = document.getElementById('frame')
      console.log(frame.contentWindow.location = message)
    }
  },
  onAttach: function onAttach(worker) {
    worker.postMessage(editorURI)
  }
})
*/
