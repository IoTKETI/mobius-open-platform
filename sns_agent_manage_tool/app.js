var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
var cors = require("cors")
var routerMgmt = require('./routes/router.mgmt');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const originWhitelist = [
  'http://localhost:4200'
]
var crosOptions = {
  origin : function(origin, callback){
    var isWhiteListed = originWhitelist.indexOf(origin) !== -1;
    callback(null, isWhiteListed);
  },
  credentials : true
}
app.use(cors(crosOptions));
app.all('/*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Expose-Headers", "ocean-ac-token, ocean-re-token");
  (req.method == 'OPTIONS') ? res.send(200) : next();
})

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist/app')));

app.use('/api', routerMgmt);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app/index.html'));
  });


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

/* SET MOBIUS SEVER URL */
process.env.TARGET_RESOURCE = 'http://203.253.128.161:7579/Mobius';

/* SET JSON TOKEN SECRET KEY */
process.env.JWT_SECRET = 'gRhs4PHjLukT+ZWAGaEbY/Tjm9iybu+YD3pSiVQRvGadUocFfgZSgpG9qf/HZr3XCUPCSdjPowk166DZu7fP6g==';

/* Web Site Port */
process.env.PORT = require('./bin/config').port;
module.exports = app;
