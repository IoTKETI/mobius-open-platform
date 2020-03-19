const AEModel = require('../models/aeModel');
const userModel = require('../models/userModel');
const dateFormat = require('dateformat');

exports.addAE = (user, ae) => {

    var ae = new AEModel({
        _owner : user,
        aeid : ae.aeID,
        tag : ae.tag,
        version : ae.version ? ae.version : null,
        fileName : ae.fileName ? ae.fileName : null,
        filePath : ae.filePath ? ae.filePath : null,
        fileSize : ae.fileSize ? ae.fileSize : null,
        uploaded : ae.uploaded ? ae.uploaded : null,
    });
    return ae.save();
}

exports.modifyAE = (ae) => {
    return AEModel.findOneAndUpdate({ aeid : ae.aeid}, {
        version_now : ae.version_now,
        version_before : ae.version_before,
        tag : ae.tag
    }).exec();
}

exports.removeAE = (_email, aeID) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({email : _email})
        .then(user => {
            return AEModel.findOneAndDelete({_owner : user, aeid : aeID}).exec()        
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
          reject(err);
        })

    })
    
}

exports.removeAEMany = (_email, aeIDs) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({email : _email})
        .then(user => {
            return AEModel.deleteMany({_owner : user, aeid : {$in : aeIDs}}).exec()        
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
          reject(err);
        })

    })
    
}

exports.removeAllByUser = (_email) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({email : _email})
        .then(user => {
            return AEModel.deleteMany({_owner : user}).exec()        
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
          reject(err);
        })

    })
    
}

exports.checkDuplicated = (aeID) => {
    return AEModel.find({aeid : aeID}).exec();
}

exports.getAE = (aeID, _email) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({email : _email})
        .then(user => {
            return AEModel.findOne({aeid : aeID, _owner : user}).exec();        
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
          reject(err);
        })

    })
    
}

exports.getAEList = (_email) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({email : _email})
        .then(user => {
            return AEModel.find({_owner : user}).exec();        
        })
        .then(result => {
            resolve(result);
        })
        .catch(err => {
          reject(err);
        })

    })
    
}

exports.upgradeToLastestImage = (userEmail, aeid) => {
    return AEModel.findOneAndUpdate()
}

exports.addNewImage = (_aeID, image) => {
    return AEModel.findOneAndUpdate({_id : _aeID}, {$push : {images : image}}, {new : true}).exec();
}


exports.removeImage = (_aeID, version) => {
    return AEModel.findByIdAndUpdate(_aeID, {
        $pull : {'images' : { version : version }}
    }, {new  : true}).exec();
}

exports.getImage = (_aeID, version) => {
    return AEModel.aggregate([
        {$match : {
            aeid : _aeID
        }},
        {$project : {
            image : {
                $filter : {
                    "input" : "$images",
                    "as" : "img",
                    "cond" : { $eq : ["$$img.version", version]}
                }
            }
        }}
    ]).then();
}

exports.getImageByAEWithVersion = (_aeID, version) => {
    // var res = await AEModel.findOne({_id : _aeID});
    // let img;
    // let images = new Array(res.images);
    // images.forEach(el => {
    //     if(el.version == version){
    //         img = el;
    //         break;
    //     }
    // })
    // return img;
}

exports.getImageByAEID = (_aeID) => {
    return AEModel.findOne({aeid : _aeID}).exec();
}

exports.getFileSize = (_aeID) => {
    return AEModel.findOne({aeid : _aeID}, {fileSize}).exec();
}

exports.uploadPatchFile = (user, ae) =>{
    return new Promise((resolve, reject) => {
        AEModel.findOne({_owner :user, aeid : ae.aeID}).exec()
        .then(rs => {
            if(rs.patchState != 'PATCHING'){
                rs.version = ae.version;
                rs.fileName = ae.fileName;
                rs.filePath = ae.filePath;
                rs.fileSize = ae.fileSize;
                rs.uploaded = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
                rs.save().then(res => {
                    resolve(res);
                })
            }else{
                resolve(`현재 패치 중인 AE 입니다. : ${ae.aeID}`);
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

exports.updatePatchState = (aeid, state) => {
    // return AEModel.updateMany(
    //     {_owner : user, aeid : {$in : aeid}},
    //     {$set : {
    //         'patched' : dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
    //     }},
    //     {new : true})
    return new Promise((resolve, reject) => {
        try{
            let now = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');

            var modifyOption;
            if(state == 'SUCCESS'){
                modifyOption=  {$set : {
                    'patched' : dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
                }, patchState : state};
            }else{
                modifyOption = {
                    patchState : state
                }
            } 
            
            AEModel.findOneAndUpdate(
                {aeid : aeid},
                modifyOption,
                {multi : true, new : true}).exec()
                .then((aeDoc) => {
                    resolve(aeDoc);
                })
                .catch(err => {
                    reject(err);
                })
        }catch(err){
            reject(err);
        }
    })
}

exports.updatePatchStart = (aename) =>{
    return AEModel.findOneAndUpdate({aeid : aename}, {patchState : 'PATCHING'}, {new : true}).exec();
}