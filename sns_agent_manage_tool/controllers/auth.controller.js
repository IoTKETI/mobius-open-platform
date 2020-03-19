const userService = require('../services/user.service');
const tokenManager = require('../services/tokenMgmtService');
const authService = require('../services/auth.service');
exports.userAuthenticate = (req, res) => {

    var acToken = req.header('ocean-ac-token');
    if(!acToken){
        res.status(401).send(new Error("로그인 페이지로 이동합니다."));
        return;
    }
    tokenManager.checkExpiredToken(acToken)
        .then(decoded => {
            req.decoded = decoded;
            return userService.getUserInfomation(decoded.u_e)
        })
        .then(user => {
            if(!user){
                // newbie
                var newbie = {
                    email : req.decoded.u_e,
                    name : req.decoded.u_n
                }
                return userService.createUser(newbie);
            } else {
                res.status(200).json({
                    email : user.email,
                    admin : user.admin,
                    name : user.name
                })
            }
        })
        .then(newbie => {
            if(newbie){
                res.status(200).json({
                    email : newbie.email,
                    admin : newbie.admin,
                    name : newbie.name
                })
            }
        })
        .catch(err => {
            res.status(500).send(err);
        })
    
}

exports.userSignOut = (req, res) => {
    if(!Object.prototype.hasOwnProperty.call(req.query, 'email')){
        sendError (res, null, '로그아웃 처리에 실패했습니다. 다시 해주세요');
        return;
    }
    try{
        let email = req.query.email;
        // 로그아웃이라면 저장되어 있는 Refresh토큰을 제거한다.
        authService.signOut(email)
        .then(result => {
            res.cookie('ocean-ac-token', null, {
                domain : result.domain,
                maxAge : 0
            });
            res.cookie('ocean-re-token', null, {
                domain : result.domain,
                maxAge : 0
            });
            res.status(200).json({
                message : '성공적으로 로그아웃 되었습니다. 감사합니다.'
            })
            LOGGER.info(`[AUTH] : ${email}님이 로그아웃 했습니다.`);
        }).catch(err => {
            sendError (res, err, '로그아웃 도중 문제가 발생했습니다. 지속시 관리자에게 문의 바랍니다.');
        })
    }catch(err){
        sendError (res, err, '로그아웃 도중 문제가 발생했습니다. 지속시 관리자에게 문의 바랍니다.');
    }
}

exports.reIssueToken = (req, res) => {
    var reToken = req.header('ocean-re-token');
    if(!reToken){
        res.status(401).send("로그인이 필요합니다.");
        return;
    }
    tokenManager.checkValidToken(reToken)
        .then((rs) => {
            return tokenManager.requestNewAccessToken(reToken)
        })
        .then((cookie) => {
            
            res.cookie('ocean-ac-token', cookie.token, {
                domain : cookie.domain,
                expires : null,
                maxAge : cookie.maxAge
              });
            res.status(200).send();
        })
        .catch(err => {
            res.status(err.status || 500).send(err);
        })
}

const sendError = (res, err, content) => {
    LOGGER.error(err);
    res.status(401).json({
        message : content
        });
}
