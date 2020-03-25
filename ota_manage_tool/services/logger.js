var winston = require('winston');
var winstonDaily = require('winston-daily-rotate-file');
var moment = require('moment');
var fs = require('fs');
const logDir = require('path').join(__dirname, '../log');

const timeStampFormat = winston.format(info => {
    info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss').trim();
    return info;
})

const myFormat = winston.format.printf((info) => {
    if(info instanceof Error){
        return `${info.timestamp} ${info.level} ${info.message} : ${info.stack}`;
    }
    return `${info.timestamp} ${info.level}: ${info.message}`;
});

if(!fs.existsSync(logDir)){ fs.mkdirSync(logDir); }

if(!fs.existsSync(`${logDir}/info`)){ fs.mkdirSync(`${logDir}/info`); }
if(!fs.existsSync(`${logDir}/error`)){ fs.mkdirSync(`${logDir}/error`); }

module.exports =  winston.createLogger({
    transports: [
        new (winstonDaily)({
            //이름이 info-file인 설정 정보는 매일 새로운 파일에 로그를 기록하도록 설정
            name: 'info-file',
            filename: `${logDir}/%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            colorize: false,
            // 50MB를 넘어 가면 자동으로 새로운 파일을 생성되며, 이때 자동으로 분리되어 생성 되는 파일의 개수는 최대 1000개 까지 가능하다.
            maxsize: 5000000,           
            maxFiles: 1000,
            //info 수준의 로그만 기록하도록 설정함.
            level: 'info',
            showLevel: true,
            json: false,
            eol : "\r\n",
        }),
        new (winston.transports.Console)({
            name: 'debug-console',
            colorize: true,
            level: 'debug',
            showLevel: true,
            json: false,
        })
    ],
    format : winston.format.combine(
        // errorStackFormat(),
        timeStampFormat(),
        myFormat
    )
})