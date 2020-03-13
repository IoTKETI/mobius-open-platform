var gulp = require('gulp');
var git = require('gulp-git');
var install = require('gulp-install');

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
    .pipe(gulp.dest("./dashboard/"))
    .on('end', resolve);
  })
})
gulp.task('setDatabase', function(){
  return dbSetting();
})