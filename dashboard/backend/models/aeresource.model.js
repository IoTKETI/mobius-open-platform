var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp');
var shortid = require('shortid');

var User = require('./user.model.js');
var Schema = mongoose.Schema;


var AeResource = new Schema({

  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  aeName: String,
  aeId: String,
  containers: [Schema.Types.Mixed],
  annotations: {
    type: Schema.Types.Mixed,
    default: {}
  }
},{ minimize: false });

// create new AeResource document
AeResource.statics.create = function(owner, aeName, aeId, containers, annotations) {

  var aeResource = new this({
    owner: owner,
    aeName: aeName,
    aeId: aeId,
    containers: containers,
    annotations: annotations
  });

  // return the Promise
  return aeResource.save();
}

// fine a AeResource document
AeResource.statics.findOneByAeid = function(owner, aeId) {
  return this.findOne({
    aeId,
    owner,
  }).exec()
}

// fine a AeResource document
AeResource.statics.updateAnnotations = function(owner, aeName, annotations) {

  return new Promise((resolve, reject)=>{
    try {
      this.findOne({owner, aeName}).exec()
        .then((aeDoc)=>{
          if(aeDoc) {
            aeDoc.annotations = annotations;

            return aeDoc.save();
          }
          else {
            throw new Error('No AE');
          }
        })

        .then((aeDoc)=>{
          resolve(aeDoc);
        })

        .catch((err)=>{
          reject(err);
        });
    }
    catch(ex) {
      reject(ex);
    }
  });
}

// list all AeResource document
AeResource.statics.list = function(owner) {
  return this.find({
    owner
  }).exec()
}

AeResource.plugin(timestamps);

module.exports = mongoose.model('aeResource', AeResource)
