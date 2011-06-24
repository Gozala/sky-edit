// Forward all the messages posted to the window to the worker.
var pipe = document.getElementById('io-pipe');
pipe.addEventListener('DOMAttrModified', function(event) {
  console.log('!!!!')
  if (event.attrName === 'data-server') self.postMessage(JSON.parse(event.newValue));
}, false);

// Forward all the messages posted by the worker to the window.
self.on('message', function post2Content(data) {
  pipe.setAttribute('data-client', JSON.stringify(data));
});
