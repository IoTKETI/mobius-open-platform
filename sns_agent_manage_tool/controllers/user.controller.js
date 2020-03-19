const UserModel = require('../models/user.model');
const botModule = require('../models/bot.model');
const validModel = require('../models/valid.model');
const requestModel = require('../models/request.model');
const commandModel = require('../models/command.model');
const encrypt = require('../services/encrypter');
const http = require('https');  // for check useable token
const botService = require('../services/bot.service');
exports.getAllUsers = (req, res) => {
    UserModel.findAllUser()
        .then(userList => {
            if(userList){
                res.status(200).json({
                    userList
                })
            }
        })
        .catch(err => {
            sendError(res, err, err.message);
        })
}

exports.getUser = (req, res) => {
    
    if(!hasOwnProperties(req.query, 'email')){
        sendError(res, null, '대상 정보가 불명확 합니다. 다시 입력해주세요');
        return;
    }

    let email = req.query.email;

    UserModel.getUserInfomation(email)
        .then(user => {
            if(user){
                res.status(200).json({
                    data : user
                })
            }else{
                sendError(res, null, "일치하는 정보를 찾을 수 없습니다.");
            }
        })
        .catch(err => {
            sendError(res, err, "일치하는 정보를 찾을 수 없습니다.");
        })
}

exports.createUser = (req, res) => {
    if(!hasOwnProperties(req.body, 'email','password','name')){
        sendError(res, null, "회원 정보가 누락되었습니다. 다시 입력해주세요");
        return;
    }

    encrypt.encryptSHA512(req.body.password)
    .then(encrypted => {
        let password = encrypted.encryptPassword;
        let salt = encrypted.salt;
    
        let user = new UserModel({
            email : req.body.email,
            password : password,
            salt : salt,
            name : req.body.name
        });
        user.save()
        .then(result => {
            res.status(200).json({
                message : '성공적으로 회원가입을 마쳤습니다.'
            })
        })
        .catch(err => {
            sendError(res, err, "회원가입 진행 중 문제가 발생했습니다. \n장애가 지속시 관리자에게 문의 바랍니다.")
        })
        
    })
    .catch(err => {
        sendError(res, err, "회원가입 진행 중 문제가 발생했습니다. \n장애가 지속시 관리자에게 문의 바랍니다.");
    })
}

exports.modifyUser = (req, res) => {
    if(!hasOwnProperties(req.params, 'email','password','name','token')){
        sendError(res, null, "정확하지 않은 정보들이 전달되었습니다. 다시 입력해주세요");
        return;
    }

    try{
    }catch(err){
        LOGGER.error(err);
    }

}

exports.deleteUser = (req, res) => {
    if(!hasOwnProperties(req.query, 'email')){
        sendError(res, null, '올바르지 않은 경로로 접근하였습니다.');
        return;
    }
    let email = req.query.email;
    UserModel.deleteUser(email)
    .then(result => {
        if(result){
            res.status(200).json({
                message : "사용자 정보 삭제에 성공했습니다."
            })
        }else{
            sendError(res, "일치하는 사용자가 존재하지 않습니다.");
        }
    }).catch(err =>{
        sendError(res, err, err.error.message);
    })
}

exports.checkUser = (req, res) => {
    if(!hasOwnProperties(req.query, 'email')){
        sendError(res, null, '정확하지 않은 데이터입니다.');
        return;
    }

    const email = req.query.email;

    UserModel.getUserInfomation(email)
    .then((rs) => {
        if(!rs){    // 사용하고 있지 않은 Email
            res.status(200).json(true);
        }else{      // 사용하고 있는 Email
            res.status(200).json(false);
        }
    })
    .catch(err => {
        sendError(res, err, err.message);
    })
}

exports.deleteUsers = (req, res) => {
    if(!hasOwnProperties(req.query, 'target')){
        sendError(res, null, '잘못된 요청입니다.');
        return;
    }

    const target = req.query.target;

    // user들을 반환받고, Bot도 지워야 한다.
    UserModel.deleteUsers(target)
    .then(result => {
        botModule.deleteBots(result)
        .then(botIDs => {
            validModel.deleteValidsByOwner(botIDs)
            .then(() => {
                requestModel.deleteRequestsByOwner(botIDs)
                .then(() => {
                    commandModel.deleteCommandsByOnwer(botIDs)
                    .then(() => {
                        botIDs.forEach(bot => {
                            botService.stopBotRunning(bot);
                        });
                
                        if(result.length > 0){
                            res.status(200).json({
                                message : '사용자 삭제에 성공했습니다.'
                            });
                        }else{
                            sendError(res, null, '삭제 대상이 존재하지 않습니다.');
                        }
                    })
                    .catch(err => {
                        sendError(res, err, '사용자 삭제에 실패했습니다.');
                    })
                })
                .catch(err => {
                    sendError(res, err, '사용자 삭제에 실패했습니다.');
                })
            })
            .catch(err => {
                sendError(res, err, '사용자 삭제에 실패했습니다.');
            })
        }).catch(err => {
            sendError(res, err, '사용자 삭제에 실패했습니다.');
        })
    }).catch(err => {
        sendError(res, err, '사용자 삭제에 실패했습니다.');
    })
}

exports.checkValidToken = (req, res) => {
    const token = req.query.token;
    try{
        botModule.checkExist(token)
            .then(_ => {
                if(!_){
                    throw new Error("사용할 수 없는 토큰입니다.");
                }
                return botService.getBotInformation(token)
            })
            .then(botInfo => {
                let valid = (botInfo.ok && botInfo.result.is_bot);
                if(!valid){
                    throw new Error("사용할 수 없는 토큰입니다.");
                }else{
                    res.status(200).json({valid : valid, bot : { name : botInfo.result.first_name, tag : botInfo.result.username}})
                }                
            })
            .catch(err => {
                LOGGER.error(err);
                res.status(400).json({message : err.message ? err.message : "토큰 유효성 검사 중 장애가 발생했습니다."});
            })
    }catch(err){
        LOGGER.error(err);
        sendError(res, '토큰 유효성 검사 중 장애가 발생했습니다.');
    }
}
const sendError = (res, err, content) => {
    if(err) LOGGER.error(err);
    res.status(401).json(
        { message : content}
        );
}

const hasOwnProperties = (target, ...properties) => {
    let rs = properties.some(el => {
        return !Object.prototype.hasOwnProperty.call(target, el)
    })
    return rs ? false : true;
}