var gulp = require('gulp');
var git = require('gulp-git');
var install = require('gulp-install');
var run = require('gulp-run')
var dbSetting = require('./set_mongo');

gulp.task('updateSubmodule', function () {
  return new Promise(function(resolve, reject) {
    git.updateSubmodule({args : '--init'}, function(err){
      if(err){
        reject(err);
      } else {
        resolve()
      }
    });
  })
});
gulp.task('installNPM', function (){
  return new Promise(function(resolve, reject) {
    gulp.src([
      './webportal/package.json', 
      './telegrambotmanagementassistserver/package.json', 
      './otadevelopmentassistserver/package.json', 
      './dashboard/package.json'
    ])
    .pipe(install())
    .on('error', reject)
    .pipe(gulp.src("./package.json"))
    .on('end', resolve);
  })
})
gulp.task('setDatabase', function(){
  return dbSetting();
})

function startWebportal() {
  return run(`pm2 start ./webportal/bin/www --name webportal `).exec()
}
function startDashboard() {
  return run(`pm2 start ./dashboard/backend/www --name dashboard`).exec();
}
function startOta() {
  return run(`pm2 start ./otadevelopmentassistserver/bin/www --name ota`).exec()
}
function startSns() {
  return run(`pm2 start ./telegrambotmanagementassistserver/bin/www --name sns`).exec()
}
gulp.task('serviceStart', gulp.series([startWebportal, startDashboard, startOta, startSns]));

gulp.task('serviceRestart', function(){
  return run("pm2 restart webportal dashboard ota sns").exec()
})