# sky-edit #

**This is work in progress experiment that doesn't really works yet**

Skyedit is an editor embedded in browser. Some browsers support `view-source:*`
type URIs for viewing page source (Try clicking
[view-source:http://google.com](view-source:http://google.com) in Firefox or
Chrome). In a same way you could view source for a files in the local hard drive
[view-source:file:///etc/hosts](view-source:file:///etc/hosts). Would not be it
nice to have similar way to edit those files ? Would not be it awesome to have
an edit link
[edit:https://gist.github.com/raw/648918/2520e8264bd20d9b1d58848e369ab15c9f665bd6/read-lines.js](edit:https://gist.github.com/raw/648918/2520e8264bd20d9b1d58848e369ab15c9f665bd6/read-lines.js)
[on a gist page](https://gist.github.com/648918) along with embed to start
editing it an editor, or just being able to navigate to
[edit:file:///etc/hosts](edit:file:///etc/hosts) to edit it ? This is an
experiment using [jetpack] and [ace] with an attempt to do exactly that and
probably more in a future.

## Changelog ##

- v0.0.1
  "edit:{{url}}" URIs now can load editor with a content in it, but changes can
  not be saved.  
  Examlpe of URIs that can be loaded: 
  - [edit:file:///etc/hosts](edit:file:///etc/hosts)
  - [edit:https://gist.github.com/raw/648918/2520e8264bd20d9b1d58848e369ab15c9f665bd6/read-lines.js](edit:https://gist.github.com/raw/648918/2520e8264bd20d9b1d58848e369ab15c9f665bd6/read-lines.js)
  - [edit:http://google.com/index.html](edit:http://google.com/index.html)
  - [edit:resource://gre/modules/Microformats.js](edit:resource://gre/modules/Microformats.js)
  - [edit:chrome://browser/content/aboutHome.css](edit:chrome://browser/content/aboutHome.css)

[ace]:http://ajaxorg.github.com/ace/
[jetpack]:https://jetpack.mozillalabs.com/
