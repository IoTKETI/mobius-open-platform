var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp');
var shortid = require('shortid');

var Schema = mongoose.Schema;



var ExecutionModel = new Schema({
  executionId: {
    type: String,
    default: shortid.generate
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cvoId: String,
  description: String,
  isExecuting: {
    type: Boolean,
    default: true
  },
  icon: String,
  color: String,
  nodes: [
    Schema.Types.Mixed
  ]
},{ minimize: false });


// create new User document
ExecutionModel.statics.create = function(owner, executionId, cvo) {

  var execution = new this({
    executionId: executionId,
    owner: owner,
    cvoId: cvo.cvoId,
    name: cvo.name,
    description: cvo.description,
    icon: cvo.icon,
    color: cvo.color,
    nodes: cvo.nodes
  });

  // return the Promise
  return execution.save();
};


// create new User document
ExecutionModel.statics.findOneByExecutionId = function(executionId) {
  return this.findOne({
    executionId
  }).populate('owner').exec()
};

// create new User document
ExecutionModel.statics.findOneExecutingInstance = function(owner, cvoId) {
  return this.findOne({
    owner: owner,
    cvoId: cvoId,
    isExecuting: true
  }).populate('owner').exec()
};

// create new User document
ExecutionModel.statics.list = function(owner, cvoId) {
  return this.find({
    owner,
    cvoId
  }).exec()
};

ExecutionModel.plugin(timestamps);

module.exports = mongoose.model('execution', ExecutionModel);
