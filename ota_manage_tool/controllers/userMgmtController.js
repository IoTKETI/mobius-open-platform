const userMgmtService = require('../services/userMgmtService');
const UserDTO = require('../dto/userVO');
const AEDTO = require('../dto/aeVO');
const encrypter = require('../services/encrypter');
const onem2mServcie = require('../services/onem2mMgmtService');
const aeMgmtService = require('../services/aeMgmtService');

var logger = require('../services/logger');
exports.createUser = (req, res) => {

    if (!hasOwnProperties(req.body, 'email', 'password', 'name')) {
        failResponseMessage(res, null, 'Server could not get some data');
    } else {
        var user = new UserDTO();
        let password = req.body.password;
        user.email = req.body.email;
        user.name = req.body.name;
    
        try {
            /* Mobius에다가 사용자의 AE생성을 요청 혹은 있다면 가져오기 */
            onem2mServcie.createOrGetAEResource(user.email)
            .then(aeResource => {
                if (aeResource) {
                    user.aeid = aeResource['m2m:ae'].aei;
                }
                encrypter.encryptSHA512(password)
                .then(encrypted => {
                    user.password = encrypted.encryptPassword;
                    user.salt = encrypted.salt;
        
                    userMgmtService.createUser(user)
                    .then(result => {
                        if (result) {
                            /* 회원 가입 완료 시, 생성했던 AE도 등록하자. */
                            let ae = new AEDTO();
                            ae.aeID = user.aeid;
            
                            aeMgmtService.addAE(result, ae)
                            .then(() => {
                                res.status(201).json({
                                    message: 'Successfully registred an account!',
                                    success: true
                                })
                            })
                            .catch(err => {
                                failResponseMessage(res, err, '회원가입에 실패했습니다.');
                            })
                        } else {
                            failResponseMessage(res, null, '회원가입에 실패했습니다.');
                        }
                    }).catch(err => {
                        failResponseMessage(res, err, "사용자 가입 과정 도중 장애가 발생했습니다.");
                    })
                }).catch(err => {
                    failResponseMessage(res, err, "사용자 가입 과정 도중 장애가 발생했습니다.");
                })
            }).catch(err => {
                failResponseMessage(res, err, "사용자 가입 과정 도중 장애가 발생했습니다.");
            })
            
        } catch (err) {
            failResponseMessage(res, err, "사용자 가입 과정 도중 장애가 발생했습니다.");
        }
    }
}

exports.modifyUserInfo = (req, res) => {

    if (!req.body.hasOwnProperties(req.body, 'email', 'password', 'name')) {
        failResponseMessage(res, null, 'Server could not get some data');
    } else {
        // 사용자의 이름, 비밀번호만이 바뀔 수 있다. 검색은 email 혹은 id
        var user = new UserDTO();
        user.email = req.body.email;
        user.password = req.body.password;
        user.name = req.body.name;

        try {
            userMgmtService.modifyUserInfo(user)
            .then(result => {
                if (result) {
                    res.status(200).json({
                        message: 'Successfully updated your infomation',
                        data: result
                    });
                } else {
                    failResponseMessage(res, null, '정보와 일치하는 사용자가 없습니다.')
                }
            })
            .catch(err => {
                failResponseMessage(res, err, '사용자 정보 수정 도중 장애가 발생했습니다.')
            })
        } catch (err) {
            failResponseMessage(res, err, '사용자 정보 수정 도중 장애가 발생했습니다.')
            logger.error(err);
            res.status(401).json({
                message: 'There is trouble on Sever'
            })
        }
    }
}

exports.resetPassword = (req, res) => {

    if (!hasOwnProperties(req.body, 'email', 'password')) {
        failResponseMessage(res, null, 'Server could not get some data');
    }else{
        var user = new UserDTO();
        user.email = req.body.email;
        user.password = req.body.password;
    
        try {
            var result = userMgmtService.resetPassword(user);
            if (result) {
                res.status(200).json({
                    message: 'Successfully changed to requested password!'
                });
            }
        } catch (err) {
            logger.error(err);
            failResponseMessage(res, "Appear the error while change password!");
        }
    }
}

exports.leaveUser = (req, res) => {

    if (!hasOwnProperties(req, 'decoded')) {
        failResponseMessage(res, null, 'Server could not get some data');
    }else{
        try {
            var email = req.decoded.u_e;
            userMgmtService.leaveUser(email)
            .then(result => {
                return aeMgmtService.removeAllByUser(result)
            })
            .then(_ => {                
                res.status(200).json({
                    message: '회원 탈퇴가 완료되었습니다.'
                })
            })
            .catch(err =>{
                failResponseMessage(res, '탈퇴 처리도중 장애가 발생했습니다. 잠시후 다시 시도해주세요');
            })
        } catch (err) {
            failResponseMessage(res, err, '탈퇴 처리도중 장애가 발생했습니다. 잠시후 다시 시도해주세요');
        }
    }
}

exports.deleteUser = (req, res) => {
    if(!hasOwnProperties(req.query, 'email')){
        failResponseMessage(res, null, '올바르지 않은 데이터가 접근되었습니다.');
        return;
    }

    let email = req.query.email;


    userMgmtService.getUserListByEmail(email)
        .then(result => {
            var promiseAll = result.map(user => {
                return new Promise((resolve, reject) => {
                    aeMgmtService.removeAllByUser(user)
                        .then(res => {
                            if(res.n && res.ok) resolve(user);
                            else reject(new Error("Didn't delete all aes"));
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
            })
            return Promise.all(promiseAll);
        })
        .then(_ => {
            return userMgmtService.deleteUser(email);
        })
        .then(_ => {
            res.status(200).json({
                message : `${email instanceof Array ? email.length : '1'}명의 사용자가 삭제되었습니다.`
            });
        })
        .catch(err => {
            failResponseMessage(res, err, '사용자를 삭제하는데 실패했습니다. 지속시 관리자에게 문의 바랍니다.');
        })
}

exports.getUserInfomation = (req, res) => {

    if (!hasOwnProperties(req.body, 'email')) {
        failResponseMessage(res, null, 'Server could not get some data');
    }else{
        try {
            userMgmtService.getUserInfomation(email)
            .then(info => {
                if (info) {
                    res.status(200).json({
                        message: `Successfully load infomation of  ${email}`
                    })
                } else {
                    failResponseMessage(res, null, 'No matching account found')
                }
            }).catch(err => {
                failResponseMessage(res, err, '사용자를 삭제하는데 실패했습니다. 지속시 관리자에게 문의 바랍니다.');
            })
        } catch (err) {
            failResponseMessage(res, err, '사용자 정보를 가져오는 도중 장애가 발생했습니다.');
        }
    }
}

exports.getUserList = (req, res) => {
    try {
        userMgmtService.getUserList()
        .then(users => {
            if (users) {
                res.status(200).send(users)
            } else {
                // no matching email user
                failResponseMessage(res, null, '가입된 사용자가 없습니다.')
            }
        }).catch(err => {
            failResponseMessage(res, err, '사용자 목록을 불러오는 도중 장애가 발생했습니다.');
        })
    } catch (err) {
        failResponseMessage(res, err, '사용자 목록을 불러오는 도중 장애가 발생했습니다.');
    }
}

exports.checkEmailDuplicate = (req, res) => {
    if(!hasOwnProperties(req.query, 'email')){
        failResponseMessage(res, null, '데이터 전송에 실패했습니다. 다시 시도해주세요');
        return;
    }
    const email = req.query.email;

    try{
        userMgmtService.getUserInfomation(email)
        .then( rs => {
            if(rs){
                // 존재하는 이메일, false를 날림
                res.status(200).json(false);
            }else{
                // 사용 가능한 이메일, true를 날림
                res.status(200).json(true);
            }
        })
        .catch(err => {
            failResponseMessage(res, err, '이메일 중복 확인에 실패했습니다.');
        })
    }catch(err){
        failResponseMessage(res, err, '이메일 중복 확인 중 장애가 발생했습니다.');
    }
}
function failResponseMessage(res, err, message) {
    if(err) logger.error(err);
    res.status(400).json({
        message: message
    })
}

hasOwnProperties = (target, ...names) => {
    names.forEach(el => {
        if (!target.hasOwnProperty(el)) {
            return false
        }
    });
    return true;
}