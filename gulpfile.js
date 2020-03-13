var serires = require('gulp');
var git = require('gulp-git');

function defaultTask() {
  cb();
}

function updateSubmodules() {
  git.updateSubmodule();
}
exports.deafult = serires(defaultTask, updateSubmodules);