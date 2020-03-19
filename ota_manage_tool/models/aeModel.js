var mongoose = require('mongoose')

var AE_Schema = new mongoose.Schema({
    _owner : { type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
    aeid : { type : String, required : true },
    tag : {type : String},
    version : { type : String },
    fileName : { type : String },
    filePath : { type : String },
    fileSize : { type : Number },
    uploaded : { type : String },
    patched :  { type : String },
    patchState: { type: String, default: "NONE"}   //  NONE, PATCHING, FAILED, SUCCESS
})

const aeModel = mongoose.model('AE', AE_Schema);


module.exports = aeModel;