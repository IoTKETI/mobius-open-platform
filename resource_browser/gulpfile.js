//
//
//  빌드 하고자 하는 platform만 남기고 나머지는 주석처리하세요
//
var PLATFORMS = [
    //'win32',
    //'win64',
    'osx64'
];



var NwBuilder = require('nw-builder');
var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');

var src = 'public';
var icons = 'public/icons';
var dist = '.nw-build';
var nwfiles = dist + "/nwfiles";
var apps = dist + "/apps";

var packageJson = require('./package.json');

gulp.task('clean-nwfiles', function () {
    return gulp.src(nwfiles, {read: false}).pipe(clean());
});
gulp.task('copy-source', function () {

  var srcFiles = [];

  srcFiles.push( 'bin/**/*' );
  srcFiles.push( 'lib/**/*' );
  srcFiles.push( 'models/**/*' );
  srcFiles.push( 'public/**/*' );
  srcFiles.push( '!public/package.json');
  srcFiles.push( 'routes/**/*' );
  srcFiles.push( 'views/**/*' );
  srcFiles.push( 'util/**/*' );
  srcFiles.push( 'app.js' );
  srcFiles.push( 'public/package.json');

  return gulp.src( srcFiles, { "base" : "." } )
             .pipe(gulp.dest(nwfiles));
});
gulp.task('copy-package', function () {

  var srcFiles = [];
  srcFiles.push( 'public/package.json');

  return gulp.src( srcFiles )
             .pipe(gulp.dest(nwfiles));
});

gulp.task('copy-modules', function () {

  var modules = Object.keys(packageJson.dependencies);
  var moduleFiles = modules.map(function(module){
    return 'node_modules/' + module + '/**/*';  
  }); 

  return gulp.src(moduleFiles, { base: 'node_modules' })
    .pipe(gulp.dest(nwfiles + '/node_modules'));
});


gulp.task('nw', function () {


    /*
options.files Required
options.version
options.platforms
options.appName
options.appVersion
options.buildDir
options.cacheDir
options.buildType
    default [appName]
    versioned [appName] -v[appVersion]
    timestamped [appName] - [timestamp];
    A function with options as scope (e.g function () {return this.appVersion;} )
options.forceDownload
options.zip

options.macCredits
options.macIcns
options.macPlist

options.winIco
    */
    var nw = new NwBuilder({
        version: '0.18.7',
        files: nwfiles + '/**/**',
        buildDir: apps,
        cacheDir: dist + "/cache",
        platforms: PLATFORMS, // 'win32', 'win64', 'osx32', 'osx64'
        //platforms: ['osx64'], // 'win32', 'win64', 'osx32', 'osx64'
        appName: 'oneM2MResourceMonitor',
        appVersion: '1',
        buildType: 'versioned',
        winIco: icons + '/keti.onem2m.resmon.ico',
        macIcns: icons + '/keti.onem2m.resmon.icns',
        macPlist: {
          mac_bundle_id: 'oneM2MResourceMonitor'
        },
        platformOverrides: {
          "win": {
            "zip": false
          }
        }
     });

    // Log stuff you want
    nw.on('log', function (msg) {

        if( !msg.startsWith("Zipping" ) )
          gutil.log('nw-builder', msg);

    });

    // Build returns a promise, return it so the task isn't called in parallel
    return nw.build()
             .then(function(){
                gutil.log("all done");
             })
             .catch(function (err) {
               gutil.log('nw-builder', err);
             });
});


gulp.task('default', function() {
   var DIST = [];
   var AFTER = [];
   for(var i=0; i < PLATFORMS.length; i++) {
      DIST.push( 'dist-zip-' + PLATFORMS[i]);

      switch( PLATFORMS[i] ) {
        case    'win32':
        case    'osx64':

          AFTER.push( 'build-after-' + PLATFORMS[i] );
      }
   }

   runSequence(
     'clean-nwfiles'
     ,[
      'copy-source',
      'copy-package',
      'copy-modules'
     ]
     ,'nw'
   );
});

