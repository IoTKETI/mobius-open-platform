const CommandModel = require('../models/command.model');
var botService = require('../services/bot.service');
const onem2mService = require('../services/onem2mMgmtService');
exports.addCmd = (req, res) => {

    /* accessToken으로 user_id를 가져와야 한다. */

    if (!hasOwnProperties(req.body, 'command', 'method', 'target')) {
        sendFailMessage(res, null, '명령어 추가에 필요 데이터가 누락되었습니다.');
        return;
    }
    var body = req.body;
    var botID = body.botID;
    CommandModel.checkOverlap(botID, body.command)
        .then(checkOverlap => {
            if (checkOverlap) {
                sendFailMessage(res, null, '이미 등록된 명령어 입니다.');
                return;
            }
            onem2mService.checkExistTarget(body.target, botID)
            .then(rs => {
                var newCmd = new CommandModel({
                    _owner: botID,
                    command: body.command,
                    des: body.des ? req.body.des : null,
                    target: body.target,
                    method: body.method,
                    timer: body.timer ? body.timer : null,
                    rotate: body.rotate ? body.rotate : null
                });
    
                newCmd.save()
                    .then((rs) => {
                        botService.setNewCommand(newCmd);
    
                        res.status(200).json({
                            message: '명령어 추가에 성공했습니다.',
                            data: newCmd
                        })
                    })
                    .catch(err => {
                        sendFailMessage(res, err, "명령어 추가에 실패했습니다.");
                    })
            })
            .catch(err => {
                sendFailMessage(res, err,`${body.target}이 Mobius에 존재하지 않습니다.`)
            })
        }).catch(err => {
            sendFailMessage(res, err, '명령어 추가에 실패했습니다.');
        })
}

exports.deleteCommand = (req, res) => {

    if (!hasOwnProperties(req.query, 'botID', 'cmdID')) {
        sendFailMessage(res, null, '정확한 Command정보가 아닙니다.');
        return;
    }

    let cmdID = req.query.cmdID;
    let botID = req.query.botID;

    CommandModel.deleteCommand(botID, cmdID)
        .then(result => {
            result = result._doc;
            if (result) {
                botService.delCommand(botID, result);
                res.status(200).json({
                    message: '명령어 삭제가 성공적으로 처리되었습니다.'
                })
            } else {
                sendFailMessage(res, null, "일치하는 명령어를 찾을 수 없습니다.");
            }
        })
        .catch(err => {
            sendFailMessage(res, err, err.message);
        })
}

exports.deleteCommands = (req, res) => {
    if (!hasOwnProperties(req.query, 'botID', 'cmdIDs')) {
        sendFailMessage(res, null, '정확한 Command정보가 아닙니다.');
        return;
    }

    let cmdIDs = req.query.cmdIDs;
    let botID = req.query.botID;

    CommandModel.deleteCommands(botID, cmdIDs)
        .then(result => {
            if (result) {
                result.forEach(el => {
                    botService.delCommand(botID, el);
                })
                res.status(200).json({
                    message: '명령어 삭제가 성공적으로 처리되었습니다.'
                })
            } else {
                sendFailMessage(res, err, "일치하는 명령어를 찾을 수 없습니다.");
            }
        })

}

exports.getBotCommands = (req, res) => {
    if (!hasOwnProperties(req.query, 'bot_id', 'user_id')) {
        sendFailMessage(res, null, '정확하지 않은 경로로 접근하였습니다.');
        return;
    }

    // botID는 토큰에서 가져오거나, ownerID로 DB조회 해야 할듯
    let botID = req.query.botID;
    let userID = req.query.userID;

    CommandModel.getCommandsByBot(botID)
        .then(commands => {
            if (commands) {
                res.status(200).json({
                    message: '명령어 조회가 성공적으로 실행되었습니다.',
                    commands: commands
                })
            } else {
                sendFailMessage(res, null, '등록된 명령어가 없습니다.')
            }
        })
        .catch(err => {
            sendFailMessage(res, err, '명령어 조회 중 장애가 발생했습니다.');
        })
}

exports.modifyCommand = (req, res) => {
    if (!hasOwnProperties(req.body, 'botID', 'command')) {
        sendFailMessage(res, null, '부정확한 경로로 접근하였습니다.');
        return;
    }
    try{
        let botID = req.body.botID;
        let command = {
            cmdID: req.body.cmdID,
            command: req.body.command,
            target: req.body.target,
            method: req.body.method,
            des: req.body.des
        };

        CommandModel.modifyCommand(botID, command)
            .then(result => {
                result = result._doc;
                if (result) {
                    botService.modifyCommand(botID, result, command);
                    res.status(200).json({
                        message: " 명령어 변경이 성공적으로 이루어졌습니다."
                    })
                } else {
                    sendFailMessage(res, null, '일치하는 명령어를 찾을 수 없습니다.');
                }
            })
            .catch(err => {
                sendFailMessage(res, err, '명령어 수정 도중 장애가 발생했습니다.');
            })
    }catch(err){
        sendFailMessage(res, err, '명령어 수정 도중 장애가 발생했습니다.');
    }
}

// 명령어 단수
exports.toggleCommandActivity = (req, res) => {
    if (!hasOwnProperties(req.body, 'botID', 'cmdID')) {
        sendFailMessage(res, null, '정확하지 않은 경로로 접근하였습니다.');
        return;
    }

    try {
        var botID = req.body.botID;
        let cmdID = req.body.cmdID;

        // command 모델을 return받음
        CommandModel.toggleCommandActivity(botID, cmdID)
            .then(result => {
                result = result._doc;
                if (result) {    // command 모델이 없으면 불일치한 정보
                    if (result.activity) {    // 명령어 상태를 확인, botID와 command정보를 통째로 넘긴다
                        botService.startCommandRunning(botID, result)
                    } else {
                        botService.stopCommandRunning(botID, result);
                    }
                    res.status(200).json({
                        message: '명령어 상태 변경이 성공적으로 수행되었습니다.'
                    })
                } else {
                    sendFailMessage(res, null, '명령어 상태 변경이 실패했습니다.');
                }
            })
            .catch(err => {
                sendFailMessage(res, err, '명령어 상태 변경 중 장애가 발생했습니다.');
            })
    } catch (err) {
        sendFailMessage(res, err, '명령어 상태 변경 중 장애가 발생했습니다.');
    }
}

//명령어 복수
exports.toggleCommandActivities = (req, res) => {

    try {
        let botID = req.body.botID;
        let target = req.body.target;
        let cmdIDs = req.body.cmdIDs;

        CommandModel.getCommandByID(cmdIDs)
            .then(commands => {
                // botID, 명령어 배열, 목표(활성화/비활성화)
                CommandModel.toggleCommandActivities(botID, commands, target)
                    .then(result => {
                        if (result.n > 0) {
                            botService.toggleCommandActivities(botID, commands, target);
                            res.status(200).json({ message: `명령어 ${target ? '동작' : '정지'}설정이 성공적으로 수행됐습니다.` });
                        } else {
                            sendFailMessage(res, null, '명령어 정보들이 일치하지 않습니다.');
                        }
                    })
                    .catch(err => {
                        sendFailMessage(res, err, '명령어 상태 변경에 실패했습니다.');
                    })
            })
            .catch(err => {
                sendFailMessage(res, err, '명령어 상태 변경에 실패했습니다.');
            })
    } catch (err) {
        sendFailMessage(res, err, '명령어 상태 변경에 실패했습니다.');
    }

}

hasOwnProperties = (target, ...properties) => {
    properties.forEach(el => {
        if (!Object.prototype.hasOwnProperty.call(target, el)) {
            return false;
        }
    })
    return true;
}

sendFailMessage = (res, err, message) => {
    if (err) LOGGER.error(err);
    res.status(400).json({
        message: message
    });
}