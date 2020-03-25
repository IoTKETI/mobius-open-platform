


var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('keti');
var flash = require('connect-flash') // session 관련해서 사용됨. 로그인 실패시 session등 클리어하는 기능으로 보임.
var routes = require('./routes/index.js');
var users = require('./routes/user.js');
var devices = require('./routes/device.js');
var onem2m = require('./routes/onem2m.js');
var auth = require('./routes/auth.js');
var acp = require('./routes/acp.js');
var dashboard = require('./routes/dashboard.js');


var passport = require('./routes/logics/passport.config.js');
var authManager = require('./routes/logics/auth.manager');
function isLoggedIn(req, res, next) {
  var result = authManager.isAuthenticated(req);
  if(!result){
    return res.status(401).send('Unauthorized');
  } {
    next();
  }
}



var database = require('./routes/models/mongodb.js');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
  secret: global.CONFIG.security.authSecret,
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use(flash());


app.use(passport.initialize());
// app.use(passport.session());



app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  //intercepts OPTIONS method
  if ('OPTIONS' === req.method) {
    //respond with 200
    res.send(200);
  }
  else {
    //move on
    next();
  }
});


app.use('/', routes);
app.use('/auth', auth);
app.use('/dashboard', dashboard);
app.use('/device', isLoggedIn, devices);
app.use('/onem2m', isLoggedIn, onem2m);
app.use('/acp', isLoggedIn, acp);

app.use('/users', users);


//  Database
database.connect(global.CONFIG);

/// catch 404 and forward to error handler
app.use(function(req, res, next){
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: 'error'
  });
});

module.exports = app;
