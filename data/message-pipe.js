// Forward all the messages posted to the window to the worker.
window.addEventListener('addon-message', function(event) {
  self.postMessage(JSON.parse(event.data));
}, false);

// Forward all the messages posted by the worker to the window.
self.on('message', function post2Content(data) {
  var event = document.createEvent("MessageEvent");
  event.initMessageEvent('content-message', false, false, JSON.stringify(data),
                         '*', null, null, null);
  window.dispatchEvent(event);
});
