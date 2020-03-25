var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var routerManager = require('./routes/routesMgmt');
var fwRouter = require('./routes/fs');
var app = express();
var fs = require('fs');

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Expose-Headers", "ocean-ac-token, ocean-re-token");
  res.header('Access-Control-Allow-Credentials', true);
  (req.method == 'OPTIONS') ? res.send(200) : next();
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist/app')));
app.use('uploads', express.static('uploads'));

app.use('/api', routerManager);
app.use('/fw', fwRouter)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/app/index.html'));
  });


/* for Firmware's save path */
process.env.uploadPath = path.join(__dirname, 'uploads/');
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
  res.status(err.status || 500).end();
});


if(!fs.existsSync(process.env.uploadPath)){
  fs.mkdirSync(process.env.uploadPath);
}
module.exports = app;
