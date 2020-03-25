const mongoose = require('mongoose');
const dateFormat = require('dateformat');
const botSchema = mongoose.Schema({
    _owner : { type : mongoose.Schema.Types.ObjectId, ref : "user", required : true },
    name : { type : String, required : true },
    tag : { type : String, required : true },
    token : { type : String, unique : true, required : true },
    activity : { type : Boolean, default : true }
});

botSchema.pre('save', function(next){
    if(!(this.owner || this.token)){
        throw new Error('invalid data inputed!');
    }
    next();
});

botSchema.static('findByID', function(botID){
    if(!botID){
        throw new Error('Nothing inputed!')
    }
    return this.findById(botID).exec();
});

botSchema.static('getBots', function(owner){
    if(!owner){
        throw new Error('Invalid owner!');
    }
    return this.find({_owner : owner}).exec();
})

botSchema.static('removeBot', function(owner){
    if(!owner){
        throw new Error('Invalid onwer for remove a bot');
    }

    return this.findOneAndDelete({_owner : owner}).exec();
})

botSchema.static('deleteBots', function(owners){
    if(!owners){
        throw new Error('Invalid Onwers!');
    }
    return new Promise((resolve, reject) => {
        this.find({_owner : {$in : owners}}, (err, res) => {
            if(err){ reject(err) }
            if(!res){ reject(new Error('Nothing matched bot')) }
            this.deleteMany({_id : {$in : res}}, (err, rs) => {
                if(err){ reject(err) }
                if(!rs){ reject(new Error('Nothing matched bot')) }
                
                let cp = new Array();
                res.forEach(bot => {
                    cp.push(bot._id);
                });
                resolve(cp);
            })
        })
    })
})

botSchema.static('checkExist', function(token){
    return new Promise((resolve, reject) => {
        this.findOne({token : token}, (err, res) => {
            if(err) { reject(err); }
            if(!res) { resolve(true);}
            else { resolve(false);}
        })
    })
})
const botModel = mongoose.model('Bots', botSchema);

module.exports = botModel;