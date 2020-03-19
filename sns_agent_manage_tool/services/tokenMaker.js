var jwt = require('jsonwebtoken');
var jwtConfig = require('../bin/jwtInfo');

exports.createAccessToken = (data) => {
    return new Promise((resolve, reject) => {
        jwt.sign({
            u_i : data._id,
            u_e : data.email,
            u_n : data.name,
            u_a : data.admin
        },
        process.env.JWT_SECRET,{
            issuer : jwtConfig.JWT_ISSUER,
            subject : jwtConfig.ACCESS_SUBJECT,
            expiresIn : jwtConfig.ACCESS_EXP
        },(err, encoded) => {
            if(err){
                reject(err);
            }else{
                resolve(encoded);
            }
        })
    })
}
exports.createRefreshToken = (data) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            {
                issuedDate : Date.now().toString,
                u_e : data.email
            },
            process.env.JWT_SECRET,
            {
                issuer : jwtConfig.JWT_ISSUER,
                subject : jwtConfig.REFRESH_SUBJECT,
                expiresIn : jwtConfig.REFRESH_EXP
            }
            ,(err, encoded) => {
                if(err){
                    reject(err);
                }else{
                    resolve(encoded);
                }
            }
        )
    })
}