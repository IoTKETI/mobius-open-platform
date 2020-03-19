const jwt = require('jsonwebtoken');
exports.authTokenMiddleware = (req, res, next) => {
    const token = req.headers['ocean-ac-token'] || req.query.token;
    
    if(!token){
        onError(res, "Nothing exist token");
    }else{
        new Promise((resolve, reject) => {
            jwt.verify(token, CONFIG.jwt.SECRET, (err, decoded) => {
                if(err){
                    reject(err);
                }else{
                    resolve(decoded);
                }
            });
        })
        .then(result => {
            if(result){
                req.decoded = result;
                next();
            }
        })
        .catch(err => {
            onError(res, err);
        })
    }
}


const onError = (res, err) => {
    if(err) LOGGER.error(err);
    res.status('400').json({
        message : 'expired token',
        success  : false,
        error : err
    });
}