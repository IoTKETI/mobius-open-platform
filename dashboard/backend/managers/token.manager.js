const jwt = require('jsonwebtoken');
const http = require('request-promise');

exports.checkValidToken = (token) => {
    return new Promise((resolve, reject) => {
        checkExpiredToken(token)
        .then(decode => {
            return http({
                uri : `${CONFIG.portal_url}/auth/re/check`,
                method : "POST",
                headers : {
                    "Accept": "application/json", 
                    'ocean-re-token' : token
                },
                body : {
                    "email" : decode.u_e
                },
                json : true
            })
        })
        .then(res => {
            if(res.result){
                resolve();
            } else {
                throw new Error("Invalid Token");
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

exports.requestNewAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        checkExpiredToken(token)
        .then(decode => {
            return http({
                uri : `${CONFIG.portal_url}/auth/re/issue`,
                method : "POST",
                headers : {
                    "Accept": "application/json", 
                    'ocean-re-token' : token
                },
                body : {
                    "email" : decode.u_e
                },
                json : true,
                resolveWithFullResponse : true
            })
        })
        .then(res => {
            var cookie = res.body;
            if(cookie){
                resolve(cookie);
            } else {
                throw new Error("Invalid Token");
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

exports.checkExpiredToken = checkExpiredToken;

function checkExpiredToken(token) {
    return new Promise((resolve, reject) => {
        
        jwt.verify(token, CONFIG.jwt.SECRET, (err, decode) => {
            if(err){
                reject(err);
            } else {
                resolve(decode);
            }
        });
    })
}