'use strict'

const { data } = require("self")
  ,   protocol = require("protocol")

// Whether or not given (edit:*) URI is absolute.
function isAbsoulteURI(uri) {
  return 0 === uri.indexOf('edit:')
}
// Whether or not given (edit:*) URI is editor's resource URI.
function isEditorContentURI(uri) {
  return 0 === uri.indexOf('edit::')
}
// Generate absolute (resource://) URI for the given relative (edit::*) URI.
function getEditorContentURI(uri) {
  uri = uri || 'editor.html'
  return data.url('skywriter/plugins/ace/' + uri)
}
// Takes absolute (edit::*) editor's resource URI and returns relative (to an
// editor's root) URI.
function parseEditorContentURI(uri) {
  return uri.substr('edit::'.length)
}
// Joins two URIs. `target` URI must be relative.
function join(source, target) {
  source = source.split('/')
  target = target.split('/')
  source.pop()
  return source.concat(target).join('/')
}
// Normalizes URI by removing all the relative sub paths.
// foo/../bar/./baz/ -> bar/baz/
function normalizeURI(uri) {
  return uri.split('/').reduce(function(uri, element) {
    if ('..' == element) uri.pop()
    else if ('.' !== element) uri.push(element)
    return uri
  }, []).join('/')
}

// Registers protocol handler for `edit:*` protocol.
require('protocol').register({
  scheme: 'edit',
  // If browser is navigated to an `edit:*` URI that refers to a resource with
  // a relative URI or an `edit:*` URI this function is called with
  // a `relativeURI` and `baseURI` (Absolute `edit:*` URI from which
  // `relativeURI` is being referred). Function should return an absolute URI
  // that may be anything from normal `http://` URI to an absolute `edit:*` URI,
  // in later case `onRequest` function will be called with a returned value.
  onRelative: function(relativeURI, baseURI) {
    let absoluteURI = relativeURI
    // If URI is not already an absolute `edit:*` URI we know that it's a URI to
    // an editors resource, in which case we transform URI to an `edit::*` URI
    // to make it clear in `onRequest` that it's a request to an editor
    // resource.
    if (!isAbsoulteURI(relativeURI))
      absoluteURI = this.scheme + '::' + getEditorContentURI(relativeURI)
    // If URI is already an absolute `edit:` URI we just return that.
    return absoluteURI
  },
  // When browser is navigated to `edit:*` URI this function is called with an
  // absolute URI and returned content or content under returned URI will be
  // displayed to a user.
  onRequest: function(uri) {
    // If editor's resource URI (`editor::*`) is requested forwarding it to
    // `resource://*` URI containing that resource, otherwise returning
    // `resource://*` URI of the editor.
    return isEditorContentURI(uri) ? parseEditorContentURI(uri)
                                   : getEditorContentURI()
  }
})

// Registers protocol handler for `about:editor`. Navigating that URI should
// displaying an ace editor.
require('protocol').register({
  about: 'editor',
  // When browser is navigated to `about:editor` this function is called
  // and returned content or content under returned URI will be displayed
  // to a user.
  onRequest: function onRequest() {
    // URI to an editor's root folder.
    let base = data.url('skywriter/plugins/ace/')
    // Reading content of the editor html page.
    let content = data.load('skywriter/plugins/ace/editor.html')
    // Swapping all the relative URLs to an absolute URL's since
    // there are no relative URL's in the 'about:*' protocol.
    return content.replace(/src(\s*)=(\s*)"/g, 'src="' + base)
  }
})
