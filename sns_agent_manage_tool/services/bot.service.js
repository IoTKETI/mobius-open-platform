const MobiusTelegramBot = require('./mobiusTelegramBot');
const BotModel = require('../models/bot.model');
var http = require('https');
var bots = {};

/* 
* Server 기동시, DB에서 목록을 불러와서 Bot들을 활성화
* 회원이 새로 가입하면 가입 처리후 즉시 봇이 활성화 된다.
*/
exports.addTelegramBot = (botInfo) => {
    bots[botInfo.id] = new MobiusTelegramBot(botInfo.token, botInfo.id);
}

/*
 * 명령어 등록은 commandModel을 넣어주면서 시작 
 */
exports.setNewCommand = (cmdModel) => {
    /* 
    명령어 등록은 DB에 명령어 추가 후 메모리 상의 Bot에도 등록 
    되어야 한다. 
    */
   const botID = cmdModel._owner._id.toString();
    bots[botID].addCustomCommand(cmdModel);
}

exports.delCommand = (botID, command) => {
    bots[botID].delCustomCommand(command);
}

exports.stopBotRunning = (botID) => {
    try{
        bots[botID].stopBot();
        delete bots[botID];
    }catch(err){
        throw err;
    }
}
stopCommandRunning = (botID, command) => {
    bots[botID].delCustomCommand(command);
}
exports.stopCommandRunning = stopCommandRunning;


startCommandRunning = (botID, command) => {
    bots[botID].addCustomCommand(command);
}
exports.startCommandRunning = startCommandRunning;

exports.modifyCommand = (botID, origin, after) => {
    bots[botID].modifyCommand(origin, after);
}

exports.toggleCommandActivities = (botID, commands, target) => {
    commands.forEach(command => {
        if(target){
            startCommandRunning(botID, command);
        }else{
            stopCommandRunning(botID, command);
        }
    });
}

exports.addValid = (botID, valid) => {
    try{
        bots[botID].addValid(valid);
    }catch(err){
        throw err;
    }
}
exports.removeValid = (botID, target) => {
    try{
        bots[botID].removeValid(target);
    }catch(err){
        throw err;
    }
}

exports.sendmessage = (botID, target, message) => {
    try{
        bots[botID].sendMessage(target, message);
    }catch(err){
        throw err;
    }
}

/**
 * @param token String
 */
exports.getBotInformation = (token) => {
    return new Promise((resolve, reject) => {
        try{
            http.get(`https://api.telegram.org/bot${token}/getMe`, 
            (rs) => {
                rs.on('data', (data) => {
                    let x = JSON.parse(data.toString());
                    resolve(x);
                })
            });
        }catch(err){
            reject(err);
        }
    })
   
}