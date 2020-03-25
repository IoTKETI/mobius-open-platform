var jwt = require('jsonwebtoken');
var jwtConfig = CONFIG.jwt_option;

exports.createAccessToken = (data) => {
    return new Promise((resolve, reject) => {
        jwt.sign({
            u_e : data.email,
            u_n : data.username
        },
        jwtConfig.JWT_SECRET,{
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
exports.createRefreshToken = (email) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            {
                issuedDate : Date.now().toString,
                u_e : email
            },
            jwtConfig.JWT_SECRET,
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