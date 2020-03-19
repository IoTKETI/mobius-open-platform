
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const path = require('path');


//  global.CONFIG has been loaded on ./backend/www
const systemConfig           = require('./backend/config.js')();
global.CONFIG = systemConfig;

global.debug = {
  log : require('debug')('keti.log')
};


const routes              = require('./backend/routes/index');
const routeForAuth        = require('./backend/routes/auth.route.js');
const routeForUser        = require('./backend/routes/user.route.js');
const routeWidgets        = require('./backend/routes/widgets.route.js');
const routeDatasources    = require('./backend/routes/datasource.route.js');

const tokenParser          = require('./backend/managers/auth.manager.js').tokenParser;
const authChecker          = require('./backend/managers/auth.manager.js').authCheck;


const database             = require('./backend/models/mongodb.js');


const app = express();



var port = systemConfig.node.port = normalizePort(systemConfig.node.port || '3000');
app.set('port', port);



//  connect to database
database.connect(systemConfig);



var dataSyncManager = require('./backend/managers/mobius.datasync.manager.js');
dataSyncManager.startSync();



const env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

app.use(bodyParser.urlencoded({
  extended: true
}));


// set the secret key variable for jwt
app.set('jwt-secret', systemConfig.security.authSecret);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(tokenParser());

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'node_modules')));


app.use('/', routes);

app.use('/widget',        authChecker);
app.use('/datasource',        authChecker);

app.use('/auth',          routeForAuth);
app.use('/user',          routeForUser);
app.use('/widget',        routeWidgets);
app.use('/datasource',        routeDatasources);

/// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers


if (app.get('env') === 'development') {
  // development error handler
  // will print stacktrace
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.sendFile(path.join(__dirname+'/frontend/dev.error.500.html'));
  });
}
else {
  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.sendFile(path.join(__dirname+'/frontend/error.500.html'));
  });
}





/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}




module.exports = app;



