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
const SUBDOMAINS = [{name : "WEBPORTAL", service : "Webportal", subdomain : "portal"},
{name : "DASHBOARD", service : "Dashboard", subdomain : "dashboard"},
{name : "OTA", service : "OTA manage tool", subdomain : "ota"},
{name : "SNS", service : "SNS agent manage tool", subdomain : "sns"},
{name : "RES", service : "Resource Browser", subdomain : "res"}]

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
  return dbSetting();
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
function setMobiusURL(){
  mobiusURL = input.question("변경할 Mobius 주소(IP)와 포트를 입력해주세요(예 : www.mobius.com:7579) : ");

  regextResult = mobiusURL.match(/(http(s)?\:\/\/)?(www\.)?([\w+\.]+)\:([0-9]{1,9})/);
  if((regextResult && regextResult.length >= 6) && (regextResult[4] && regextResult[5])) {
    var host = `http://${regextResult[4]}`;
    var mqtt = `mqtt://${regextResult[4]}`;
    var port = Number(regextResult[5]);

    var configs = readJSON();
    
    var promises = configs.map(el => {
      el.config = modifyMobiusSetting(el.config, el.service, host, mqtt, port);
      return saveConfig(el.config, el.service)
    });
    return Promise.all(promises);
  } else {
    return Promise.reject(new Error("변경할 Mobius의 주소 혹은 포트를 찾을 수 없습니다."));
  }
}
function modifyMobiusSetting(source, service, host, mqtt, port) {
  var config = source.default;
  if(!config.mobius) if(!config) return reject(new Error("Invalid CONFIG source")); else return;
  config.mobius.host = host;
  
  config.mobius.mqtt = mqtt;

  config.mobius.port = Number(port);

  return source;
}
function saveConfig(source, service) {
  return new Promise(function(resolve, reject) {

    configStr = JSON.stringify(source, null, 2);
    fs.writeFileSync(`${CONFIGS[service].packageLocation}`, configStr, 'utf8', function(err){
      if(err){
        console.error(err);
        reject(err);
      } else {
        resolve();
      }
    })
  })
}
function getPort(service, origin) {
  while(true) {
    var port = input.questionInt(`서비스 ${service}의 포트를 ${origin}에서 포트를 입력해주세요 : `);
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
    serviceNames.push('done');
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
        console.log(changedConfig);
        temp.push({
          service : serviceNames[choise],
          config : changedConfig
        })
      }
    }
    var promises = temp.map(el => {
      console.log(el.config);
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
  return readJSON().map(el => {
    var url = {};
    url[el.service] = `${mainAddress}:${el.config.default.node.port}`;
    return url;
  })
}
function setAddress() {
  return new Promise(function(resolve, reject) {
    try {
      var mainAddress = null;
      var domainList = [];
      var isDomain = input.keyInSelect(["DNS" , "IP Address"], "서비스 주소로 사용할 양식을 선택해주세요");
      var check = null;
      console.log(`isDomain ${isDomain}`);
      switch(isDomain) {
        case 0 :
          isDomain = true;
          check = dnsCheck;
          break;
        case 1 : 
          isDomain = false;
          check = ipCheck;
          break;
        default :
          reject(new Error("사용자가 설치를 중단했습니다."));
          return;
      }
      while(true) {
        mainAddress = input.question("서비스 주소를 설정합니다. 도메인의 경우 Nginx 설정과 동일하게 입력해주세요.\n사용할 주 도메인 혹은 IP주소를 입력해주세요.(ex iotocean.org 또는 203.1.2.3) : ");
        if(check(mainAddress)){
          break;
        } else {
          console.log("올바른 양식의 도메인 또는 IP 주소를 입력해주세요.");
        }
      }
    
      if(isDomain) {
        var subDomains = SUBDOMAINS;
        var names = subDomains.map(el => { return `${el.service} => ${el.subdomain}`});
        names.push('done');
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
          else if(choise === 5) {//done
            printDomains(mainAddress, subDomains);
            if(input.keyInYN("서비스 도메인을 위와 같이 사용하시겠습니까?")) break;
          } else {
            names[choise] = `${subDomains[choise].service} => ${subDomains[choise].subdomain}`;
          }
        }
        domainList = subDomains.map(el => {
          var domain = {};
          domain[el.name] = `${el.subdomain}.${mainAddress}`;
          return domain;
        })
      } else {
        domainList = getServiceAndPort(mainAddress);
      }

      var configs = readJSON();
      configs.map(el => {
        el.config.default.domains = domainList;
        saveConfig(el.config, el.service);
      })

      resolve();
        
    } catch (error) {
      reject(error);
    }
  })
}
gulp.task('init', function(){
  return new Promise(function(resolve, reject){
    if(input.keyInYN("Mobius URL을 변경하시겠습니까? ")) {
      setMobiusURL()
        .then(() => {
          resolve();
        })
    }else {
      resolve();
    }
  })
    .then(() => {
      return setServicePort();
    })
    .then(() => {
      return setAddress();
    })
    .then(() => {
      return gulp.series([setDatabase, npmInstall])();
    })
    .catch(err => {
      console.error(err);
    })
})