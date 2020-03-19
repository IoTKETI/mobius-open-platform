const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    email : { type : String, required : true, unique : true },
    name : { type : String, required : true },
    admin : { type : Boolean, default : false}
});

userSchema.pre('save', function(next) {
    if(!(this.email || this.password || this.salt || this.name ||this.token)){
        throw new Error('Invalid data for save');
    }
    next();
})

userSchema.static('userAuthenticate', function(email, password){
    if(!email || !password){
        throw new Error('Invalid email or password!');
    }else if(typeof(email) !== 'string'){
        throw new Error('Invalid type of Email!');
    }else if(typeof(password) !== 'string'){
        throw new Error('Invalid type of Password!');
    }
    return this.findOne({email : email, password : password}).exec();
})

userSchema.static('getUserSalt', function(user){
    if(!user){
        throw new Error('User is empty for getting Salt!');
    }else if(!(typeof(user) === 'string' || user instanceof Object)){
        throw new Error('Invalid user infomation for getting Salt');
    }
    return this.findOne({email : user}, {salt : true}).exec();
});

userSchema.static('getUserInfomation', function(email){
    if(!email){
        throw new Error('Tried Invalid Email!');
    }
    return this.findOne({email : email}, {
        _id : true,
        email : true,
        name : true,
        token : true,
        admin : true
    }).exec();
});

userSchema.static('changePassword', function(email, password, salt){
    if(!(email || password || salt)){
        throw new Error('Tried Invalid data');
    }
    return this.findOneAndUpdate({email : email}, {password : password, salt : salt}, {new : true}).exec();
});

userSchema.static('findAllUser', function() {
    return this.find({},{email : true, name : true, admin : true}).exec();
});

userSchema.static('deleteUser', function(email){
    if(!email){
        throw new Error('Invalid Email');
    }
    return this.findOneAndDelete({email : email}).exec();
});

userSchema.static('deleteUsers', function(target){
    if(!target){
        throw new Error('Invalid target for delete');
    }
    return new Promise((resolve, reject) => {
        this.find({_id : {$in : target}}, (err, res) => {
            if(err){
                reject(err);
            }
            if(!res){
                reject(new Error('일치하는 삭제 대상이 존재하지 않습니다.'));
            }
            this.deleteMany({_id : {$in : res}}, (err, rs) => {
                if(err){
                    reject(err);
                }
                if(rs.n > 0){
                    resolve(res);
                }
            })
        })
    })
})
let userModel = mongoose.model('users', userSchema);
module.exports = userModel;