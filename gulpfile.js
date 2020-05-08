var gulp = require('gulp');
var install = require('gulp-install');
var run = require('gulp-run')
var input = require('readline-sync');
var fs = require('fs');


var dbSetting = require('./set_mongo');

const PACKAGES = {
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
const CONFIGS = {
  WEBPORTAL : {
    packageLocation : './webportal/bin/config.json',
  },
  DASHBOARD : {
    packageLocation : './dashboard/backend/config.json',
  },
  OTA : {
    packageLocation : './ota_manage_tool/config.json',
  },
  SNS : {
    packageLocation : './sns_agent_manage_tool/config.json',
  },
  RES : {
    packageLocation : './resource_browser/bin/config.json'
  }
}
const SUBDOMAINS = [
  {name : "WEBPORTAL",  service : "Webportal",              subdomain : "portal"},
  {name : "DASHBOARD",  service : "Dashboard",              subdomain : "dashboard"},
  {name : "OTA",        service : "OTA manage tool",        subdomain : "ota"},
  {name : "SNS",        service : "SNS agent manage tool",  subdomain : "sns"},
  {name : "RES",        service : "Resource Browser",       subdomain : "res"}
];

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
  return Object.keys(PACKAGES).map(name => {
    return PACKAGES[name].packageLocation;
  });
}
function setSelecService(selected) {
  var services = selected.map(el => {
    if(PACKAGES[el]) return PACKAGES[el].packageLocation;
    else throw new Error(`존재하지않는 서비스 입니다. : ${el}`);
  });
  // remove invalid url
  return services.filter(el => {
    return el;
  })
}
function npmInstall() {
  return new Promise(function(resolve, reject) {
    var packages = Object.keys(PACKAGES).map(key => {
      return PACKAGES[key].packageLocation;
    })
    gulp.src(packages)
    .pipe(install())
    .on('error', reject)
    .pipe(gulp.src("./package.json"))
    .on('end', resolve);
  })
}
gulp.task('npmInstall', npmInstall);

function setDatabase (){
  var admin = input.question("MongoDB에 설정된 Admin 계정을 입력해주세요 : ");
  var adminPwd = input.question(`${admin}의 패스워드 : `);

  return dbSetting(admin, adminPwd);
}
gulp.task('setDatabase', setDatabase)

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
  return run("pm2 restart webportal dashboard ota sns").exec()
})
function readJSON(){
  return Object.keys(CONFIGS).map(key => {
    var config = require(CONFIGS[key].packageLocation);
    return {
      service : key,
      config : config
    }
  })
}
const ValidIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const ValidHostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
function setMobiusURL(){
  var mobiusURL;
  var in_port;
  while(true){
    mobiusURL = input.question("변경할 Mobius의 주소를 입력해주세요(예 : www.mobius.com or 192.168.0.1) : ");
    in_port= input.question("Mobius의 포트 번호를 입력해주세요 : ")

    if((ValidIpAddressRegex.test(mobiusURL) || ValidHostnameRegex.test(mobiusURL)) && !isNaN(in_port)) break;
    else console.log("대상 Mobius의 주소 또는 포트번호가 잘못 입력되었습니다.");
  } 
  
  var host = `http://${mobiusURL}`;
  var mqtt = `mqtt://${mobiusURL}`;
  var port = Number(in_port);

  var configs = readJSON();
  
  configs.forEach(el => {
    el.config = modifyMobiusSetting(el.config, el.service, host, mqtt, port);
    saveConfig(el.config, el.service)
  });
}
function modifyMobiusSetting(source, service, host, mqtt, port) {
  var config = source.default;
  if(!config.mobius) if(!config) return reject(new Error("Invalid CONFIG source")); else return source;
  config.mobius.host = host;
  
  config.mobius.mqtt = mqtt;

  config.mobius.port = Number(port);

  return source;
}
function saveConfig(source, service) {
  configStr = JSON.stringify(source, null, 2);
  fs.writeFileSync(`${CONFIGS[service].packageLocation}`, configStr, 'utf8', function(err){
    if(err){
      console.error(err);
      throw new Error(err);
    }
  })
}
function getPort(service, origin) {
  while(true) {
    var port = input.questionInt(`서비스 ${service}에 할당할 포트 번호를 입력해주세요(기본값 : ${origin}) : `);
    if(!port && port <= 0 ) {
      console.log("0보다 큰 수를 입력해주세요.");
      continue;
    } else {
      return port;
    }
  }
}
function setServicePort() {
  return new Promise(function(resolve, reject) {
    var json = readJSON();
    var configs = json.map(el => {
      return el.config;
    });
    var serviceNames = json.map(el => {
      return el.service;
    });
    serviceNames.push('next');
    var temp = [];
    while(true) {
      var choise = input.keyInSelect(serviceNames, "포트번호를 변경할 서비스를 선택해주세요.");
      var changedConfig = null;
      switch(choise) {
        case 0 :
        case 1 :
        case 2 :
        case 3 :
        case 4 :
          var cpConfig = JSON.parse(JSON.stringify(configs[choise]));
          var origin = cpConfig.default.node.port;
          cpConfig.default.node.port = getPort(serviceNames[choise], origin);
          changedConfig = cpConfig;
          break;
      }
      if(choise == 5) break;
      else if(choise === -1) {
        reject(new Error("사용자가 설치를 중단했습니다."));
        return;
      } else {
        temp.push({
          service : serviceNames[choise],
          config : changedConfig
        })
      }
    }
    var promises = temp.map(el => {
      saveConfig(el.config, el.service);
    })
    Promise.all(promises).then(() => {
      resolve();
    })
  })
}
function dnsCheck(string) {
  return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(string)
}
function ipCheck(string) {
  return /(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}/.test(string)
}
function printDomains(mainDomain, subDomains) {
  var domains =  subDomains.map(sub => {
    return `${sub.service} : ${sub.subdomain}.${mainDomain}`;
  })
  console.log(`============================================\n${domains.join("\n")}\n============================================`);
}
function getServiceAndPort(mainAddress) {
  var domains = {};
  readJSON().forEach(el => {
    domains[el.service] = `${mainAddress}:${el.config.default.node.port}`;
  })
  return  domains;
}
function setAddress() {
  return new Promise(function(resolve, reject) {
    try {
      var mainAddress = null;
      var domainList = [];
      while(true) {
        mainAddress = input.question("서비스 주소를 설정합니다. \n서브 도메인을 사용하는 경우 Nginx 설정과 동일하게 입력해주세요.(ex iotocean.org : ");
        if(dnsCheck(mainAddress)){
          break;
        } else {
          console.log("올바른 양식의 도메인을 입력해주세요.");
        }
      }
    
      var useSub = input.keyInYN("서브도메인을 설정하시겠습니까?");
      if(useSub) {
        var subDomains = SUBDOMAINS;
        var names = subDomains.map(el => { return `${el.service} => ${el.subdomain}`});
        names.push('next');
        while(true){
          var choise = input.keyInSelect(names, "서브도메인을 변경할 서비스를 선택해주세요 : ");
          var replaceDomain = null;
          switch(choise) {
            case 0 :
            case 1 :
            case 2 : 
            case 3 : 
            case 4 :
            replaceDomain = input.question("사용할 서브도메인을 입력해주세요 : ");
            subDomains[choise].subdomain = replaceDomain;
          }
          if(choise == -1) {// cancel
            subDomains = SUBDOMAINS;
            break;
          }
          else if(choise === 5) {//next
            printDomains(mainAddress, subDomains);
            if(input.keyInYN("서비스 도메인을 위와 같이 사용하시겠습니까?")) break;
          } else {
            names[choise] = `${subDomains[choise].service} => ${subDomains[choise].subdomain}`;
          }
        }
        domainList = {};
        subDomains.forEach(el => {
          domainList[el.name] = `${el.subdomain}.${mainAddress}`;
        })
      } else {
        domainList = getServiceAndPort(mainAddress);
      }

      var configs = readJSON();
      configs.map(el => {
        el.config.default.domains = domainList;
        
        if(!el.config.default.cookie) el.config.default.cookie = {};
        el.config.default.cookie.domain = `.${mainAddress}`;

        saveConfig(el.config, el.service);
      })

      resolve();
        
    } catch (error) {
      reject(error);
    }
  })
}
function changeMobius() {
  return new Promise(function(_resolve, _reject) {
    try {
      if(input.keyInYN("Mobius URL을 변경하시겠습니까? ")) {
        setMobiusURL();
        _resolve();
      } else {
        _resolve();
      }
    } catch (error) {
      _reject(error);  
    }
  })
}
gulp.task('domainList', function(){
  return new Promise(function(resolve, reject){
    try {
      var json = readJSON();
  
      var domain = json[0].config.default.domains;
      if(!domain){ 
        console.error("플랫폼 설정이 완료되지 않았습니다. 'gulp init'으로 설정을 마쳐주세요");
        resolve();
      } else {
        var mainDomain = json[0].config.default.cookie ? json[0].config.default.cookie.domain : null;
        if(mainDomain) console.log(`Main Domain : ${mainDomain}`);
        Object.keys(domain).forEach(el => {
          console.log(`${el} : ${domain[el]}`)
        });
      }
      resolve();
    } catch (error) {
      reject(error)
    }
  })
})
gulp.task('init', function(){
  return new Promise(function(resolve, reject){
      changeMobius()
      .then(() => {
        return setServicePort();
      })
      .then(() => {
        return setAddress();
      })
      .then(() => {
        resolve();
        return gulp.series([setDatabase, npmInstall])();
      })
      .catch(err => {
        console.error(err);
        reject(err);
      })
  })
})