const userModel = require('../models/user.model');
const botModel = require('../models/bot.model');
const validModel = require('../models/valid.model');
const requestModel = require('../models/request.model');
const commandModel = require('../models/command.model');
const botService = require('../services/bot.service');

exports.addBot = (req, res) => {
    if(!hasOwnProperties(req.params, "token", "name")){
        sendFailMessage(res, null, "올바르지 않은 경로로 접근하였습니다.");
        return;
    }

    try{
        var owner = req.params.owner;
        var token = req.body.token;
        var name = req.body.name;
        var tag = req.body.tag;

        userModel.findOne({email : owner}).exec()
            .then(user => {
                return new botModel({
                    _owner : user,
                    token : token,
                    name : name,
                    tag : tag
                }).save()
            })
            .then(rs => {
                botService.addTelegramBot(rs);
                res.status(200).json({
                    message : 'Bot 저장에 성공했습니다.',
                    data : rs
                })
            })
            .catch(err => {
                sendFailMessage(res, err, "Bot 저장에 실패했습니다.");
            })
    }catch(err){
        sendFailMessage(res, err, "Bot 추가 도중 장애가 발생했습니다.");
    }
}
exports.getBotInfo = (req, res) => {
    if (!hasOwnProperties(req.query, 'botID')) {
        sendFailMessage(res, null, '올바르지 않은 경로로 접근하였습니다.');
        return;
    }

    const botID = req.query.botID;

    validModel.getValidByOwner(botID)
        .then(validUser => {
            requestModel.getRequestByOwner(botID)
                .then(request => {
                    res.status(200).json({
                        validUser: validUser,
                        request: request
                    })
                })
                .catch(err => {
                    sendFailMessage(res, err, "Bot정보를 불러오는 도중 장애가 발생했습니다.");
                })
        })
        .catch(err => {
            sendFailMessage(res, err, "Bot정보를 불러오는 도중 장애가 발생했습니다.");
        })
}

exports.getBots = (req, res) => {
    if(!hasOwnProperties(req.params, "owner")){
        sendFailMessage(req, null, "비정상적인 경로로 접근하였습니다.");
        return;
    }

    try{
        var owner = req.params.owner;

        userModel.findOne({email : owner}).exec()
            .then(user => {
                if(!user){
                    throw new Error("가입된 회원이 아닙니다.");
                }
                return botModel.getBots(user)
            })
            .then( rs => {
                res.status(200).json({
                    data : rs
                });
            })
            .catch(err => {
                sendFailMessage(res, err, "봇 조회 도중 장애가 발생했습니다. 지속시 관리자에게 문의 바랍니다.");
            })
    }catch(err){
        sendFailMessage(res, err, "봇 조회 도중 장애가 발생했습니다. 지속시 관리자에게 문의 바랍니다.");
    }
}

exports.findBotByOwner = (req, res) => {
    if (!hasOwnProperties(req.query, 'owner')) {
        sendFailMessage(res, null, '사용자 정보가 존재하지 않습니다.');
        return;
    }

    const owner = req.query.owner;
    userModel.findOne({email : owner})
        .then(user => {
            return botModel.findByUser(user)
        })
        .then(bot => {
            if (bot) {
                res.status(200).json(bot);
            }
        })
        .catch(err => {
            sendFailMessage(res, err, err.message);
        })
}

exports.deleteBot = (req, res) => {
    if(!hasOwnProperties(req.query, 'bot')){
        sendFailMessage(res, null, '올바르지 않은 접근입니다.');
        return;
    }

    const botIDs = req.query.bot;
    
    botModel.deleteMany({
        _id : {$in : botIDs}
    }).exec()
        .then(rs => {
            var prcList = [];
            if(!(botIDs instanceof Array)){
                prcList.push(botIDs);
            }else{
                prcList = botIDs;
            }
            var botPromises = prcList.map((botID) => {
                return new Promise((resolve, reject) => {
                    requestModel.deleteMany({_owner : botID}).exec()
                    .then(() => {
                        return validModel.deleteMany({_owner : botID}).exec();
                    })
                    .then(() => {
                        return commandModel.deleteMany({_owner : botID}).exec();
                    })
                    .then(() => {
                        botService.stopBotRunning(botID);
                        resolve(null);
                    })
                    .catch(err => {
                        reject(err);
                    })
                });
            })
            return Promise.all(botPromises);
        })
        .then(() => {
            res.status(200).json({
                message : '성공적으로 Bot 삭제가 수행되었습니다.'
            })
        })
        .catch(err => {
            sendFailMessage(res, err, err.message);
        })
}

exports.moveRequestToValidUser = (req, res) => {
    if (!hasOwnProperties(req.body, 'botID', 'target')) {
        sendFailMessage(res, null, '올바르지 않은 접근입니다.');
        return;
    }

    const botID = req.body.botID;
    const target = req.body.target;

    requestModel.removeRequest(target)
        .then(request => {
            if (!request) {
                sendFailMessage(res, null, '일치하는 신청자가 없습니다.');
                return;
            }
            validModel.collection.insert(request, (err, rs) => {
                if (err) {
                    sendFailMessage(res, err, '사용 허가권한 부여 중 문제가 발생했습니다.');
                    return;
                }
                if (rs) {
                    botService.addValid(botID, request);
                    res.status(200).json(true);
                    request.forEach(el => {
                        botService.sendmessage(botID, el._doc.chatID, '관리자가 사용을 승인하였습니다.');
                    })
                    return;
                } else {
                    sendFailMessage(res, null, '사용자 전환 도중 장애가 발생했습니다.');
                }
            })
        })
        .catch(err => {
            sendFailMessage(res, err, "사용 권한 부여 도중 문제가 발생했습니다.");
        });
}

exports.moveValidUserToRequest = (req, res) => {

    const botID = req.body.botID;//req.param.user //token에서 가져옴
    const target = req.body.target;

    validModel.removeValid(target)
        .then(valid => {
            requestModel.collection.insert(valid, (err, rs) => {
                if (err) {
                    sendFailMessage(res, err, '사용자 해제 도중 문제가 발생했습니다.');
                }
                if (rs) {
                    botService.removeValid(botID, valid);
                    res.status(200).json(true);
                } else {
                    sendFailMessage(res, err, '사용자 전환 도중 장애가 발생했습니다.');
                }
            })
        })
        .catch(err => {
            sendFailMessage(res, err, "사용 권한 해제 도중 문제가 발생했습니다.");
        })
}

exports.removeRequestValidList = (req, res) => {
    if (!hasOwnProperties(req.query, 'valid, request')) {
        sendFailMessage(res, null, '올바르지 않은 경로로 접근하였습니다.');
        return;
    }
    let botID = req.query.botID;
    let valid = req.query.valid ? req.query.valid : null;
    let request = req.query.request ? req.query.request : null;

    try {
        if (valid) {
            validModel.removeValid(valid)
            .then(rs => {
                // memory에서 사용자 목록을 제거 해야함
                botService.removeValid(botID, rs);
            })
            .catch(err => {
                sendFailMessage(res, err, "사용자 권한 변환 도중 문제가 발생했습니다.");
            })
        }
        if (request) {
            requestModel.removeRequest(request)
            .catch(err => {
                sendFailMessage(res, err, "사용자 권한 변환 도중 문제가 발생했습니다.");
            })
        }
        res.status(200).end();

    } catch (err) {
        sendFailMessage(res, err, err.message);
    }
}

hasOwnProperties = (target, ...properties) => {
    let result = true;
    properties.forEach(el => {
        if (!Object.prototype.hasOwnProperty.call(target, el)) {
            result = false;
        }
    })
    return result;
}

sendFailMessage = (res, err, message) => {
    if(err) LOGGER.error(err);
    res.status(400).json({
        message: message
    })
}