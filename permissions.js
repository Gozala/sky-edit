/*global define: true port: true */
/*jshint asi:true globalstrict: true */

'use strict';

const { Cc, Ci } = require('chrome')
const nsIPermissionManager = Ci.nsIPermissionManager
const manager = Cc['@mozilla.org/permissionmanager;1'].
                getService(nsIPermissionManager)
const ioService = Cc["@mozilla.org/network/io-service;1"].
                  getService(Ci.nsIIOService)
const { UNKNOWN_ACTION, ALLOW_ACTION, DENY_ACTION } = nsIPermissionManager

exports.add = function add(permission) {
  let { host, type, capability, expireType, expireTime } = permission
  let uri = ioService.newURI('http://' + host, null, null)
  uri.host = host

  capability = capability === true ? ALLOW_ACTION :
               capability === false ? DENY_ACTION :
               capability === null ? UNKNOWN_ACTION : capability

  manager.add(uri, String(type), capability, expireType, expireTime)
}

exports.remove = function remove({ host, type }) {
  manager.remove(host, type)
}

exports.permissions = function() {
  function tail(enumerator) {
    return !enumerator.hasMoreElements() ? null : Object.defineProperties({}, {
      head: {
        enumerable: true,
        value: enumerator.getNext().QueryInterface(Ci.nsIPermission)
      },
      tail: {
        enumerable: true,
        get: new function(value) {
          return function() {
            return value || (value = tail(enumerator))
          }
        }
      }
    })
  }
  return tail(manager.enumerator)
}
