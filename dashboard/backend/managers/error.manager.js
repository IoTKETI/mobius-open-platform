'use strict';


function PlatformError(source, code, message) {
  this.source = source;
  this.code = code;
  this.message = message;
}
PlatformError.prototype = new Error();
PlatformError.prototype.constructor = PlatformError;


PlatformError.SOURCE = {
  "AUTH": {
    "LOGIN": "auth.login"
  },
  "USER": {
    "SIGNIN": "user.signin"
  },
  "WIDGET": {
    "LIST": "widget.list"
  },
  "DATASOURCE": {
    "LIST": "datasource.list"
  },
  "M2M": {
    "USERAE": "m2m.userae"
  }
};


module.exports = PlatformError;