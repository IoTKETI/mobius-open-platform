process.env['NTBA_FIX_319'] = 1;

const TelegramBot = require('node-telegram-bot-api');
const botModel = require('../models/bot.model');
const commandModel = require('../models/command.model');
const validModel = require('../models/valid.model');
const requestModel = require('../models/request.model');
const cmdFunctionMaker = require('../modules/cmdFunctionMaker');
const atob = require('atob');
const notification = require('./notification');
const wsService = require('../services/webSocketService');

class MobiusTelegramBot {
    constructor(token, botID){
        this.token = token;
        this.botID = botID;
        this.bot = new TelegramBot(this.token, { polling : true});
        this.setDefaultCommands();
        this.subList = {};
        this.validUser = {};
        /* 허가 받은 chatID들을 등록 */
        validModel.getValidByOwner(botID)
        .then(rs => {
            if(rs){
                rs.forEach(el => {
                    this.validUser[el.chatID] = true;
                });
            }
        })
        .catch(err => {
            LOGGER.error(err);
            throw new Error('error while construct MobiusTelegramBot');
        })
    }

    setDefaultCommands(){
        this.setStartMessage();
        this.setCheckRoomID();
        this.setRequest();
        this.setCommandList();
        this.setStopSub();
    }

    /*
     *  Default Command!
     */
    setStartMessage(){
        this.bot.onText(/\/start/, (msg) => {
            const chatID = msg.chat.id;
            const userName = msg.from.username;
            this.bot.sendMessage(chatID,`${userName}님 환영합니다.`)
        })
    }
    /*
     *  Default Command!
     */
    setCheckRoomID(){
        this.bot.onText(/\/chatid/, (msg) => {
            const chatID = msg.chat.id;
            this.bot.sendMessage(chatID, `your chatID is : ${chatID} !!`);
        });
    }
    setCommandList(){
        this.bot.onText(/\/list/, (msg) => {
            botModel.findOne({token : this.token}).lean().exec()
                .then(bot => {
                    if(!bot) throw new Error("존재하지 않는 챗 봇입니다.");
                    return commandModel.find({_owner : bot}).lean().exec();
                })
                .then(cmds => {
                    var message = "명령어 목록\n명령어\t:\t유형\t:\tURL\t:\t설명\n";
                    cmds.forEach(cmd => {
                        message += `/${cmd.command}\t:\t${cmd.method === 'get' ? '조회' : (cmd.method === 'post' ? '생성' : '구독')}\t:\t${cmd.target}\t:\t${cmd.des ? cmd.des : '-'}\n`
                    });
                    this.bot.sendMessage(msg.chat.id, message);
                })
                .catch(err => {
                    this.bot.sendMessage(msg.chat.id, `명령어 실행에 실패했습니다. 지속시 관리자에게 문의 바랍니다.\n ${err.message}`);
                })
        })
    }
    /*
     *  Default Command!
     */
    setRequest(){
        this.bot.onText(/\/request/, (msg) => {
            const chatID = msg.chat.id;
            const requester = msg.chat.type == 'private' ? ((msg.chat.last_name ? msg.chat.last_name : "") + (msg.chat.first_name ? msg.chat.first_name : "")) : msg.chat.title;
            
            requestModel.findOne({_owner : this.botID, chatID : chatID}).exec()
            .then(rs => {
                if(!rs){
                    validModel.findOne({_owner : this.botID, chatID : chatID}).exec()
                    .then(rs => {
                        if(!rs){
                            let req = new requestModel({
                                _owner : this.botID,
                                chatID : chatID,
                                userName : requester
                            });
                            req.save().then((saved) => {
                                this.bot.sendMessage(chatID, '사용 요청이 전달되었습니다. \n봇 담당자의 허가를 기달려주세요');
                                wsService.sendMessage(null, 'requester', {
                                    botID : this.botID,
                                    requester : saved
                                })
                            })
                            .catch(err => {
                                this.bot.sendMessage(chatID, '사용 요청이 전달되지 못했습니다.\n지속시 관리자에게 문의 바랍니다.');
                                LOGGER.error(err);
                            })
                        }else{
                            this.bot.sendMessage(chatID, "이미 허가 승인을 받은 채팅방입니다.");
                        }
                    }).catch(err => {
                        LOGGER.error(err);
                        this.bot.sendMessage(chatID, "사용 요청 도중 장애가 발생했습니다. 지속시 관리자에게 문의 바랍니다.");
                    })
                }else{
                    this.bot.sendMessage(chatID, '승인 대기 중입니다.\n승인을 기달려주시기 바랍니다.');
                }
            }).catch(err => {
                LOGGER.error(err);
                this.bot.sendMessage(chatID, "사용 요청 도중 장애가 발생했습니다.\n지속시 관리자에게 문의 바랍니다.");
            })
        });
    }

    /*
     *  Stop Subscribe
     */
    setStopSub(){
        this.bot.onText(/^\/stop_([a-zA-Z0-9_]\w+)$/, (msg, match) => {
            var command = match[1];
            commandModel.findOne({ _owner : this.botID,command : command}).lean().exec()
                .then(cmd => {
                    if(cmd){
                        var target = cmd.target;
                        notification.removeChannel(target, this.botID, msg.chat.id);
                        this.bot.sendMessage(msg.chat.id, `${target} 구독이 취소되었습니다.`);


                    }else{
                        this.bot.sendMessage(msg.chat.id, "사용중인 명령어가 아닙니다.");
                    }
                })
                .catch(err => {
                    this.bot.sendMessage(msg.chat.id, "구독 취소 도중 장애가 발생했습니다.")
                    LOGGER.error(err)
                })
        })
    }
    stopBot(){
        this.bot.stopPolling();
        notification.clearChannel(this.botID);
    }

    isValid(chatID){
        if(this.validUser[chatID]){
            return true;
        }else{
            return false;
        }
    }

    /*
        @command 사용하고자 하는 명령어
        @des     명령어의 설명
        @target  대상 AE
        @method  명령어의 형식 GET/POST/SUB
        @timier  타이머 설정
        @rotate  타이머 반복 횟수
        @active  사용/비사용
    */
    addCustomCommand(cmdInfo){
        var regexCmd
        var operate;
        // var bot = bots[cmdModel._owner._id.toString()];
        
        var cmdFn = new cmdFunctionMaker(cmdInfo.target);
        if(cmdInfo.method.toLowerCase() === 'get'){
            operate = (msg) => {
                cmdFn.setGet(system_origin, (err, res) =>{
                    if(err){
                        LOGGER.error(err);
                        this.bot.sendMessage(msg.chat.id, `명령어 실행에 실패했습니다. 지속시 관리자에게 문의 바랍니다.\n ${err.message}`);
                    }else if(res){
                        var message = msgBase64Convert(res["m2m:cin"].con);
                        this.bot.sendMessage(msg.chat.id, `${cmdInfo.target} => ${message}`);
                    }
                })
                
            }

            regexCmd = new RegExp(`^\/${cmdInfo.command}$`);
            
        }else if(cmdInfo.method.toLowerCase() === 'post'){
            operate = (msg, match) => {
                if(this.isValid(msg.chat.id)){
                    if(match.length < 2){
                        this.bot.sendMessage(msg.chat.id, 
                            `생성할 cin의 값을 입력해주세요.
                            ex) \"/명령어 값\"`);
                    }else{
                        // cin값, origin(요청자), callback
                        cmdFn.setPost(match[1], system_origin, (err, res) => {
                            if(err){
                                LOGGER.error(err);
                                this.bot.sendMessage(msg.chat.id, '명령어 등록에 실패했습니다. 지속시 관리자에게 문의 바랍니다.');
                            }else if(res){
                                this.bot.sendMessage(msg.chat.id, `${cmdInfo.target} <= ${res["m2m:cin"].con} 전달`);
                            }
                        })
                    }
                } else {
                    this.bot.sendMessage(msg.chat.id, '/request 명령어로 봇 관리자에게 승인 뒤 이용이 가능합니다.')
                }
            }
            regexCmd = new RegExp(`\/${cmdInfo.command} (((.|\\n|\\r)*))`);
        } else if(cmdInfo.method.toLowerCase() === 'sub') {
            cmdFn.setSub(`${global.CONFIG.mobius_sub_prefix}_SUB`, system_origin)
                .then(mqttClient => {
                    if(!mqttClient){
                        notification.subscribeTo(cmdInfo.target, this.bot, this.botID);
                    }else{
                        mqttClient.on('notification', notification.notification);
                        notification.subscribeTo(cmdInfo.target, this.bot, this.botID);
                    }
                })
                .catch(err => {
                    console.error(err);
                    LOGGER.error(err);
                })
            operate = (msg) => {
                try{
                    notification.addNewChannel(cmdInfo.target, this.botID, msg.chat.id);
                    this.bot.sendMessage(msg.chat.id, `${cmdInfo.target} 데이터를 구독합니다.`);
                }catch(err){
                    this.bot.sendMessage(msg.chat.id, `명령어 실행이 준비되지 않았습니다. 잠시후에 시도해주세요.`);
                }
            }            
            regexCmd = new RegExp(`^\/${cmdInfo.command}$`);
        }

        this.bot.onText(regexCmd, operate);
    }

    modifyCommand(origin, after){
        if(this.delCustomCommand(origin)){
            this.addCustomCommand(after);
        }
    }

    /*
    *   명령어 삭제, onText에서 할당한 Listener를 삭제
    */
   delCustomCommand(command) {
        var regexCmd;
        if(command.method.toLowerCase() === 'get'){
            regexCmd = new RegExp(`^\/${command.command}$`);
        }else if(command.method.toLowerCase() === 'post'){
            regexCmd = new RegExp(`\/${command.command} (((.|\\n|\\r)*))`);
        }else if(command.method.toLowerCase() === 'sub'){
            regexCmd = new RegExp(`^\/${command.command}$`);
            notification.unSubscribeFrom(command.target, this.botID);
        }
        return this.bot.removeTextListener(regexCmd);
   }

   addValid(valid){
       if(!valid instanceof Array){
            this.validUser[valid.chatID] = true;
            return;
       }
       valid.forEach(el => {
           this.validUser[el.chatID] = true
       });
   }

   removeValid(target){
       if(!target instanceof Array){
            delete this.validUser[target.chatID];
            return;
       }
       target.forEach(el => {
           delete this.validUser[el.chatID];
       });
   }

   sendMessage(target, message){
       this.bot.sendMessage(target, message);
   }

   sendNotificationMessage(target, con){
        var message = msgBase64Convert(con);
        this.subList[target].forEach(chatID => {
            this.bot.sendMessage(chatID, message);
        })
   }
   
}
function msgBase64Convert(con){
    var message = "";
     try {
         var base64 = atob(con);
         //check content is correct base64 foramt
         var jsVal = JSON.parse(base64);
         for(var a in jsVal){
             message += `${a} : ${jsVal[a]}\n`;
         }
     }catch (err){
         // content is not base64 format
         message = con;
     }
     return message;
}
module.exports = MobiusTelegramBot;