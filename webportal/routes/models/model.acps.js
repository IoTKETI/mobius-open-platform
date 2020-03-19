/**
 */
"use strict";

var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose');
var shortid = require('shortid');
var debug = require('debug')('keti');

var Schema = mongoose.Schema;

var AcpsSchema = new Schema({

  acpid: {
    type: String,
    unique: true,
    default: shortid.generate
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },

  acpName: {
    type: String
  },

  acpResource: {
    type: Schema.Types.Mixed
  }

});


AcpsSchema.plugin(timestamps);


AcpsSchema.statics.findAllGrantedAcpIds = function(email) {

  var thisModel = this;
  return new Promise(function(resolve, reject){
    try {
      thisModel.aggregate(
        [
          { $unwind: "$acpResource.pv.acr" },
          { $unwind: "$acpResource.pv.acr.acor" },
          {
            $match: {
              "acpResource.pv.acr.acor": email
            }
          },
          {
            $group: {
              _id: {
                acpid: "$acpResource.ri"
              },
              count: {$sum: 1}
            }
          }
        ]
      )
        .then(function(result){

          var acpi = [];
          result.map(function(item){
            acpi.push(item._id.acpid);
          });
          resolve(acpi);
        })
        .catch(function(err){
          reject(err);
        });
    }
    catch(ex) {
      reject(ex);
    }
  });

};

AcpsSchema.statics.bulkUpdateAcps = function (user, acpList) {

  var thisModel = this;

  return new Promise(function(resolve, reject) {
    try {
      var bulk = thisModel.collection.initializeUnorderedBulkOp();

      acpList.map(function (acp) {

        var acpObj = acp;
        var updateParam = {
          $set: {
            acpResource: acpObj
          },
          $setOnInsert: {
            acpid: shortid.generate(),
            acpName: (acpObj.lbl && acpObj.lbl.length > 0) ? acpObj.lbl[0] : acpObj.rn
          }
        };
        if (user._id) {
          updateParam.$set.owner = user._id;
        }

        bulk.find({
          'acpResource.ri': acpObj.ri
        })
          .upsert()
          .update(updateParam);
      });

      resolve(bulk.execute());
    }
    catch (ex) {
      debug(ex);
      reject(ex);
    }
  });
};

AcpsSchema.statics.upsertAcp = function (user, acpResource) {

  var thisModel = this;

  return new Promise(function(resolve, reject) {
    try {

      var updateParam = {
        $set: {
          acpResource: acpResource
        },
        $setOnInsert: {
          acpid: shortid.generate(),
          acpName: (acpResource.lbl && acpResource.lbl.length > 0) ? acpResource.lbl[0] : acpResource.rn
        }
      };
      if (user._id) {
        updateParam.$set.owner = user._id;
      }
      var updateFields = {
        acpResource: acpResource
      };
      var updateOptions = {
        upsert: true,
        setDefaultsOnInsert: {
          acpid: shortid.generate(),
          acpName: (acpResource.lbl && acpResource.lbl.length > 0) ? acpResource.lbl[0] : acpResource.rn
        }
      };


      thisModel.findOneAndUpdate({ 'acpResource.ri': acpResource.ri }, updateFields, updateOptions).exec()

      .then(function(acpObj){
        resolve(acpObj);
      })

      .catch(function(err){
        debug(err);
        reject(err);
      });
    }
    catch (ex) {
      debug(ex);
      reject(ex);
    }
  });
};

module.exports = mongoose.model('acps', AcpsSchema);
