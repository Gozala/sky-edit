// Forward all the messages posted to the window to the worker.
var notification = document.documentElement;
var pipe = document.createElement("textarea");
pipe.style.display = 'none';
document.documentElement.appendChild(pipe);
notification.addEventListener('DOMAttrModified', function(event) {
  if (event.attrName === 'data-server') self.postMessage(JSON.parse(pipe.value));
}, false);

// Forward all the messages posted by the worker to the window.
self.on('message', function post2Content(data) {
  pipe.value = JSON.stringify(data);
  notification.setAttribute('data-client',
               notification.getAttribute('data-client') ? '' : 'true');
});
