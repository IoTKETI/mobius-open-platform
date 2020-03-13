var gulp = require('gulp');
var git = require('gulp-git');
var install = require('gulp-install');

function updateSubmodules() {
  return new Promise(function(resolve, reject) {
    try {
      git.updateSubmodule();
      resolve();
    }catch(err) {
      reject(err);
    }
  })
}
function initNpm() {
  return new Promise(function(resolve, reject) {
    gulp.src([
        './webportal/package.json', 
        './telegrambotmanagementassistserver/package.json', 
        './otadevelopmentassistserver/package.json', 
        './dashboard/package.json'
      ])
      .pipe(install())
      .on('error', reject)
      .pipe(gulp.dest("./"))
      .on('end', resolve);
  })
}
exports.default = gulp.series(updateSubmodules, initNpm);