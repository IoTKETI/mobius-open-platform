/**
 */
"use strict";

var timestamps = require('mongoose-timestamp');
var mongoose = require('mongoose');
var shortid = require('shortid');

var Schema = mongoose.Schema;

var DevicesSchema = new Schema({


  deviceId: {
    type: String,
    unique: true,
    default: shortid.generate
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },

  deviceInfo: {
    nickname: {
      type: String
    },
    icon: {
      type: String
    },
    description: {
      type: String
    },
    otaFeature: {
      type: Boolean,
      default: false
    }
  },

  resourceInfo: {
    resourceName: {
      type: String
    },

    resourceId: {
      type: String
    },

    acpi: [
      {
        type: String
      }
    ]
  }

});

DevicesSchema.plugin(timestamps);



DevicesSchema.methods.updateLastLogin = function(userId) {
  this['lastLoginTime'] = new Date();
  return this.save();
};




module.exports = mongoose.model('devices', DevicesSchema);
