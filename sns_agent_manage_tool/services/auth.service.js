const userModel = require('../models/user.model');
const authModel = require('../models/authTokenModel');
const HTTP = require('request-promise');

exports.userAuthenticate = (email, password) => {

    return userModel.findOneAndUpdate({
        email : email,
        password : password
    }, {
        $set : {lastAccess : Date.now()}
    }, { new : true}).exec();
}

exports.getUserSalt = (email) => {
    return userModel.findOne({email : email}, {salt : true}).exec();
}

exports.checkRefreshToken = (email, refreshToken) => {
    return authModel.findOne({user : email, refreshToken : refreshToken}).exec();
}

exports.signOut = (email) => {
    return new Promise((resolve, reject) => {
        HTTP({
            uri : CONFIG.domains.WEBPORTAL+"/auth/logout",
            method : 'post',
            headers : {
                "Accept": "application/json", 
            },
            body : {
                "email" : email
            },
            json : true
        })
        .then(res => {
            resolve(res);
        })
        .catch(err => {
            reject(err);
        })
    })
}