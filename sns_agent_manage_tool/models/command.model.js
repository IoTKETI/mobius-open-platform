const mongoose = require('mongoose');
const CommandSchema = mongoose.Schema({
    _owner : {type : mongoose.Schema.Types.ObjectId, ref : 'bots', required : true},
    command : {type : String, required : true},
    des : {type : String },
    target : {type : String, required : true},
    method : {type : String, required : true}, // GET or POST
    timer : {type : Number },
    rotate : {type : Number },
    activity : {type : Boolean, default : true}
});

CommandSchema.pre('save', function(next){
    let err;
    if(!this._owner){
        err = `_owner`;
    }else if(!this.command){
        err = `${err ? err+", " : ""} command`;
    }else if(!this.target){
        err = `${err ? err+", " : ""} target`;
    }else if(!this.method){
        err = `${err ? err+", " : ""} method`;
    }
    if(err){
        throw new Error(err);
    }

    let lowMethod = this.method.toLowerCase();
    if(lowMethod === 'get' || lowMethod === 'post'){
        next();
    }else{
        next();
    }
})

CommandSchema.static('getCommandsByBot' ,function(owner){
    if(!((typeof owner === 'string') || owner instanceof Object)){
        throw new Error('owner type is not match');
    }
    return this.find({_owner : owner}).exec();
})

CommandSchema.static('getOneCommand', function(owner, command){
    if(!(typeof owner === 'string' || owner instanceof Object)){
        throw new Error('owner type is not match');
    }else if(!command || !(typeof command === 'string')){
        throw new Error('invalid command for get one command');
    }
    return this.findOne({_owner : owner, command : command}).exec();
})

CommandSchema.static('toggleCommandActivity', function(owner, cmdID){
    if(!(typeof owner === 'string' || owner instanceof Object)){
        throw new Error('invalid owner for toggle activity');
    }else if(!cmdID || !(typeof cmdID === 'string')){
        throw new Error('invalid command for toggle activity');
    }
    return new Promise((resolve, reject) => {
        this.findOne({_owner : owner, _id : cmdID}, (err, cmd) => {
            if(err){
                reject(err);
            }
            if(cmd){
                cmd.activity = !cmd.activity;
                try{
                    cmd.save()
                    .then(rs => {
                        resolve(cmd);
                    })
                    .catch(err => {
                        reject(err);
                    });
                }catch(err){
                    reject(err);
                }
            }else{
                return resolve(null);
            }
        })
    })
})

CommandSchema.static('deleteCommand',function(owner, cmdID){
    if(!(typeof owner === 'string' || owner instanceof Object)){
        throw new Error('invalid owner for delete command');
    }else if(!cmdID || !(typeof cmdID === 'string')){
        throw new Error('invalid command for delete command');
    }

    return this.findOneAndDelete({_owner : owner , _id : cmdID}).exec();
});

CommandSchema.static('deleteCommands', function(owner, cmdIDs){
    if(!(typeof owner === 'string' || owner instanceof Object)){
        throw new Error('invalid owner for delete command');
    }else if(!cmdIDs){
        throw new Error('invalid command for delete command');
    }

    return new Promise((resolve, reject) => {
        this.find({_owner : owner, _id : {$in : cmdIDs}}, (err, res) => {
            if(err){
                reject(err);
            }
            if(!res){ reject(new Error('could not find matched Commands')); }
            else{
                this.deleteMany({_owner : owner, _id : {$in : cmdIDs}}, (err, rs) => {
                    if(err){
                        reject(err);
                    }
                    else if (rs.n > 0){
                        resolve(res);
                    }else{
                        reject(new Error('could not find matched Commands'));
                    }
                })
            }
        });
    })
})

CommandSchema.static('deleteCommandsByOnwer', function(owners){
    if(!owners){
        throw new Error('Invalid owner for delete commands');
    }
    return this.deleteMany({_owner : {$in : owners}}).exec();
})

CommandSchema.static('modifyCommand', function(owner, command){
    if(!(command instanceof Object)){
        throw new Error('invalid command for modify Command');
    }
    let err;
    if(!owner){
        err = `_owner`;
    }else if(!command.cmdID){
        err = `${err ? err+", " : ""} commandID`        
    }else if(!command.command){
        err = `${err ? err+", " : ""} command`;
    }else if(!command.target){
        err = `${err ? err+", " : ""} target`;
    }else if(!command.method){
        err = `${err ? err+", " : ""} method`;
    }
    if(err){
        throw new Error(err);
    }

    return this.findOneAndUpdate({_owner : owner, _id : command.cmdID},{
        $set : {
            command : command.command,
            des : command.des,
            target : command.target,
            method : command.method,
        }
    }).exec();
})

CommandSchema.static('getCommandByID', function(cmdIDs){
    if(!cmdIDs){
        throw new Error('Invalid data for check command');
    }
    return this.find({_id : {$in : cmdIDs}}).exec();
})

CommandSchema.static('toggleCommandActivities', function(owner, cmdIDs, target){
    if(!owner || !cmdIDs || target == null){
        throw new Error('Invalid data for checkOverlap command');
    }
    return this.updateMany({_owner : owner, _id : {$in : cmdIDs}}, { activity : target}).exec();
})

CommandSchema.static('checkOverlap', function(owner, command){
    if(!owner || !command){
        throw new Error('Invalid data for checkOverlap command');
    }
    return this.findOne({_owner : owner, command : command}).exec();
})
module.exports = mongoose.model('commands', CommandSchema);