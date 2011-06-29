# sky-edit #

**This is still very alpha experiment**

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

![Screenshot](http://f.cl.ly/items/190d3n1h3v3E1K1z2r0C/Screen%20shot%202011-06-29%20at%2013.46.37%20.png "Screenshot")

## Hack ##

To hack on this package you will need [npm](http://npmjs.org/) and [graphquire].

    git clone git://github.com/Gozala/sky-edit.git --recursive
    cd sky-edit
    # install npm if you don't have yet
    # skip next line if you already have graphquire
    npm install graphquire -g
    npm link

## Install ##

Download latest .xpi file from [downloads] and drag it to firefox.

[downloads]:https://github.com/Gozala/sky-edit/downloads
[ace]:http://ajaxorg.github.com/ace/
[jetpack]:https://jetpack.mozillalabs.com/
[graphquire]:https://github.com/Gozala/graphquire/
