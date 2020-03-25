const jwt = require('jsonwebtoken');

exports.authTokenMiddleware = (req, res, next) => {
    const token = req.headers['ocean-ac-token'] || req.query.token;
    
    if(!token){
        onError(res, "Nothing exist token");
    }else{
        try{
            new Promise((resolve, reject) => {
                jwt.verify(token, CONFIG.jwt.SECRET, (err, decoded) => {
                    if(err){
                        reject(err);
                    }
                    resolve(decoded);
                });
            })
            .then(result => {
                req.decoded = result;
                next();
            })
            .catch(err => {
                onError(res, err);
            })
        }catch(error){
            onError(res, error);
        }
    }
}


const onError = (res, err) => {
    res.status('401').json({
        message : 'expired token',
        success  : false,
        error : err
    });
}