var gulp = require('gulp');
var git = require('gulp-git');
var install = require('gulp-install');
var run = require('gulp-run')
var dbSetting = require('./set_mongo');

const SERVICES = {
  WEBPORTAL : {
    packageLocation : './webportal/package.json',
  },
  DASHBOARD : {
    packageLocation : './dashboard/package.json',
  },
  OTA : {
    packageLocation : './ota_manage_tool/package.json',
  },
  SNS : {
    packageLocation : './sns_agent_manage_tool/package.json',
  },
  RES : {
    packageLocation : './resource_browser/package.json'
  }
}

function filterArgvOptions(argv) {

  var options = [];
  argv.forEach((element, idx) => {
    if(/--option\d?/.test(element) && typeof(argv[idx+1]) === 'string') {
      options.push(argv[idx+1].toUpperCase());
    }
  });
  return options;
}
function setAllService() {
  return Object.keys(SERVICES).map(name => {
    return SERVICES[name].packageLocation;
  });
}
function setSelecService(selected) {
  var services = selected.map(el => {
    if(SERVICES[el]) return SERVICES[el].packageLocation;
    else throw new Error(`존재하지않는 서비스 입니다. : ${el}`);
  });
  // remove invalid url
  return services.filter(el => {
    return el;
  })
}
gulp.task('npmInstall', async function (){
    await gulp.src([
      './webportal/package.json',
      './dashboard/package.json',
      './ota_manage_tool/package.json',
      './sns_agent_manage_tool/package.json',
      './resource_browser/package.json'
    ])
    .pipe(install())
});
/*
gulp.task('npmInstall', function (){
  
  if(process.argv.length <= 4) {
    throw new Error("필요 옵션이 필요합니다.");
  }
  var selected = filterArgvOptions(process.argv);

  var packages = selected.find(el => { return el === 'ALL'}) ? setAllService() : setSelecService(selected);

  return new Promise(function(resolve, reject) {
    gulp.src(packages)
    .pipe(install())
    .on('error', reject)
    .pipe(gulp.src("./package.json"))
    .on('end', resolve);
  })
})*/
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
  return run(`pm2 start ./ota_manage_tool/bin/www --name ota`).exec()
}
function startSns() {
  return run(`pm2 start ./sns_agent_manage_tool/bin/www --name sns`).exec()
}
function startRes() {
  return run(`pm2 start ./resource_browser/bin/www --name res`).exec()
}
function save() {
  return run('pm2 save').exec();
}
gulp.task('serviceStart', gulp.series([startWebportal, startDashboard, startOta, startSns, startRes, save]));

gulp.task('serviceRestart', function(){
  return run("pm2 restart webportal dashboard ota sns res").exec();
})