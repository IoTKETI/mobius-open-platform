const mongoose = require('mongoose');
const dateForamt = require('dateformat');
let validSchema = new mongoose.Schema({
    _owner : { type : mongoose.Schema.Types.ObjectId, ref : 'Bots', required : true},
    chatID : { type : String, required : true},
    userName : { type : String, required : true},
    date : { type : String, default : dateForamt(new Date(), 'yyyy-mm-dd HH:MM:ss')},
});

validSchema.pre('save', function(next){
    if(!this._owner || !this.chatID || !this.userName){
        throw new Error('invalid data form save valid');
    }
    this.date = dateForamt(new Date(), 'yyyy-mm-dd HH:MM:ss');
    next();
});

validSchema.static('getValidByOwner', function(owner){
    return this.find({_owner : owner}).exec();
});

validSchema.static('removeValid', function(ids){
    return new Promise((resolve, reject) => {
        this.find({_id : { $in : ids}}, (err, res) => {
            if(err){
                reject(err);
            }
            this.deleteMany({_id : {$in : res}},(err, rs) => {
                if(err){
                    reject(err);
                }
                resolve(res);
            });
        })
    });
});

validSchema.static('deleteValidsByOwner', function(owners) {
    return new Promise((resolve, reject) => {
        this.find({_owner : { $in : owners}}, (err, res) => {
            if(err){
                reject(err);
            }
            this.deleteMany({_id : {$in : res}},(err, rs) => {
                if(err){
                    reject(err);
                }
                resolve(res);
            });
        })
    });
})
module.exports = mongoose.model('valid', validSchema);