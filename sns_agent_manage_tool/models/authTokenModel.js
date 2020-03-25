var mongoose = require('mongoose');
var AuthTokenSchema = mongoose.Schema({
    user : { type : String, required : true, unique : true },
    refreshToken : { type : String, required : true, unique : true}
})

AuthTokenSchema.pre('save', function(next){
    if(!this.user || !(typeof(this.user) === 'string' || this.user instanceof Object)){
        throw new Error('Invalid User Infomation for Authentication!');
    }else if(!this.refreshToken){
        throw new Error('Invalid RefreshToken!');
    }
    next();
});

AuthTokenSchema.static('tokenRegisteration', function(user, refreshToken){
    if(!user){
        throw new Error('User is empty for getting Salt!');
    }else if(!(typeof(user) === 'string' || user instanceof Object)){
        throw new Error('Invalid user infomation for getting Salt');
    }else if(!refreshToken || typeof(refreshToken) !== 'string'){
        throw new Error('Invalid refreshToken\'s type!');
    }

    return new Promise((resolve, reject) => {
        this.findOneAndDelete({user : user}, (err, res) =>{
            if(err){
                reject(err);
                return;
            }
            let newToken = new this({user : user, refreshToken : refreshToken});
            newToken.save()
            .then(() => {
                resolve(true);
            })
            .catch((err) => {
                reject(err);
            })
        })
    })
});

AuthTokenSchema.static('checkRefreshToken', function(user){
    if(!user){
        throw new Error('User is empty for getting Salt!');
    }else if(!(typeof(user) === 'string' || user instanceof Object)){
        throw new Error('Invalid user infomation for getting Salt');
    }
    return this.findOne({user : user}).exec();
})

AuthTokenSchema.static('removeToken', function(user){
    if(!user){
        throw new Error('User is empty for getting Salt!');
    }else if(!(typeof(user) === 'string' || user instanceof Object)){
        throw new Error('Invalid user infomation for getting Salt');
    }
    return this.findOneAndDelete({user : user}).exec();
})
const authTokenModel = mongoose.model('AuthToken', AuthTokenSchema);
module.exports = authTokenModel;
