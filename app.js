var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var jsonrpc = require('json-rpc-client')

// JQuery in node start

var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);
// JQuery in node end


/**
 * JSON-RPC Client Exception class
 * 
 * @param String code
 * @param String message
 */
var JSONRpcClientException = function (code, message) {
  this.code = code;
  this.message = message;
}
JSONRpcClientException.prototype = jQuery.extend(JSONRpcClientException.prototype, {

/**
 * Magic method. COnvert object to string.
 * 
 * @return String
 */
  toString: function () {
      return '[' + this.code + '] ' + this.message;
  }
  
});

/**
* JSON-RPC Client
* 
* @param Object options
*/
var JSONRpcClient = function (options) {
  this.setOptions(options);
  this.init();
}
JSONRpcClient.prototype = jQuery.extend(JSONRpcClient.prototype, {

/**
 * Default options
 */
  options: {
      'onerror': function () {},
      'onsuccess': function () {},
      'url': '',
      'headers': {}
  },
  current: 1,
  onerror: null,
  onsuccess: null,
  onstart: null,

  /**
   * Init client
   */
  init: function () {
      this.onerror = this.getParam('onerror');
      this.onsuccess = this.getParam('onsuccess');
      
      this.initMethods();
  },

  /**
   * Init API methiods by url
   */
  initMethods: function () {
      var instance = this;
      // get all methods
    jQuery.ajax(this.getParam('url'), {
          'async': false,
          'success': function (data) {
              if (data.methods) {
                // create method
                jQuery.each(data.methods, function(methodName, methodParams) {
                    var method = function () {
                      var params = new Array();
                          for(var i = 0; i < arguments.length; i++){
                              params.push(arguments[i]);
                          }
                          var id = (instance.current++);
                          var callback = params[params.length - 1];
                          var request = {jsonrpc: '2.0', method: methodName, params: params, id: id};
                          
                          var async = false;
                          if (jQuery.type(callback) == 'function') {
                            async = true;
                            params.pop();
                          }
                          
                          var res = null;
                          // API request
                          jQuery.ajax(instance.getParam('url'), {
                              'contentType': 'application/json',
                              'type': methodParams.transport,
                              'processData': false,
                              'dataType': 'json',
                              'cache': false,
                              'data': JSON.stringify(request),
                              'headers': instance.getParam('headers'),
                              'async': async,
                              'success': function (result) {
                                  if (jQuery.type(result.error) == 'object') {
                                      res = new JSONRpcClientException(result.error.code, result.error.message);
                                      instance.onerror(res);
                                  } else {
                                      res = result.result;
                                      if (jQuery.type(callback) == 'function') {
                                        callback(res);
                                      }
                                  }
                                  instance.onsuccess(res, id, methodName);
                              }
                        });
                          if (!async) {
                            return res;
                          }
                    }

                    instance[methodName] = method;
                });
              } else {
                  throw Exception("Methods could not be found");
              }
          }
      });
  },

  /**
   * Set client options
   * 
   * @param Object options
   */
  setOptions: function (options) {
      this.options = jQuery.extend({}, this.options, options);
  },

  /**
   * Get client param, if param is not available in this.options return defaultValue
   * 
   * @param String key
   * @param mixed defaultValue
   * @return mixed
   */
  getParam: function (key, defaultValue) {
      if (jQuery.type(this.options[key]) != 'undefined') {
          return this.options[key];
      }
      return defaultValue;
  }
  
});

var loginClient = new JSONRpcClient({
  'url': 'https://user-api.simplybook.me' + '/login',
  'onerror': function (error) {},
});
var token = loginClient.getToken("sankul", "2bc5e30fd258cc4a89be5fe09396ca7caa481cf33e682abf200a55e8cdb3f80f");
var client = new JSONRpcClient({
  'url': 'https://user-api.simplybook.me',
  'headers': {
    'X-Company-Login': "sankul",
    'X-Token': token
  },
  'onerror': function (error) {}
});

var myClient = client
// $services = myClient.getEventList();
// console.log($services)

// JSON RPC end


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var getFacilitiesRouter = require('./routes/getFacilities')
var createBookingRouter = require('./routes/createBooking')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/getFacilities', getFacilitiesRouter);
app.use('/createBooking', createBookingRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;

// exporting client 
exports.client = client
