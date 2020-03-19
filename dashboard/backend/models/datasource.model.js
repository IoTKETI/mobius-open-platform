const mongoose    = require('mongoose');
const timestamps  = require('mongoose-timestamp');
const shortid     = require('shortid');
const _           = require('lodash');
const debugLog    = require('debug')('keti');
global.debug = {
  log: debugLog
};

const Schema = mongoose.Schema;


const DatasourceModel = new Schema({
  datasourceId: {
    type: String,
    default: shortid.generate
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  datasourceType: String,
  description: String,
  workspace: String,
  widgetData: Schema.Types.Mixed,
  triggerInfo: Schema.Types.Mixed,
  status: {
    type: String,
    default: 'inactive'
  }
});

// create new Things document
DatasourceModel.statics.createDatasource = function(owner, datasourceType, description, status, widgetData, triggerInfo) {

  var datasourceTemplate = {
    owner: owner,
    datasourceType: datasourceType,
    description: description,
    status: status,
    widgetData: widgetData,
    triggerInfo: triggerInfo
  };


  var datasource = new this(datasourceTemplate);

  return new Promise((resolve, reject)=>{
    try {
      datasource.save()

        .then((datasource)=>{
          resolve(datasource);
        })

        .catch((err)=>{
          reject(err);
        });
    }
    catch(ex) {
      reject(ex);
    }
  });

};



// create new Things document
DatasourceModel.statics.listDatasources = function(owner) {

  return new Promise((resolve, reject)=>{

    try {
      this.find({owner:owner})

        .then((datasourceListDoc)=>{

          resolve(datasourceListDoc);
        })

        .catch((err)=>{
          reject(err);
        });
    }
    catch(ex) {
      reject(ex);
    }
  });

};

// create new Things document
DatasourceModel.statics.findDatasource = function(owner, datasourceId) {

  return new Promise((resolve, reject)=>{

    try {
      this.findOne({owner:owner, datasourceId: datasourceId})

        .then((datasourceDoc)=>{

          resolve(datasourceDoc);
        })

        .catch((err)=>{
          reject(err);
        });
    }
    catch(ex) {
      reject(ex);
    }
  });

};

// update or create Things document
DatasourceModel.statics.upsertDatasource = function(owner, datasourceId, updateData) {

  return new Promise((resolve, reject)=>{
    try {

      var key = {
        owner: owner,
        datasourceId: datasourceId
      };

      var upsertData = _.clone(key);
      _.extend(upsertData, updateData);

      this.findOneAndUpdate(key, {$set: upsertData}, {upsert: true, new: true})

        .then((datasourceDoc)=>{

          resolve(datasourceDoc);
        })
        .catch((err)=>{
          reject(err);
        })
        ;
    }
    catch(ex) {
      reject(ex);
    }
  });

};

// update or create Things document
DatasourceModel.statics.deleteDatasourceDocument = function(owner, datasourceId) {

  return new Promise((resolve, reject)=>{
    try {

      var query = {
        owner: owner,
        datasourceId: datasourceId
      };

      this.deleteOne(query)

        .then((datasourceDoc)=>{

          resolve(datasourceDoc);
        })
        .catch((err)=>{
          reject(err);
        })
        ;
    }
    catch(ex) {
      reject(ex);
    }
  });

};


// update or create Things document
DatasourceModel.statics.upsertDatasource = function(owner, datasourceId, updateData) {

  return new Promise((resolve, reject)=>{
    try {

      var key = {
        owner: owner,
        datasourceId: datasourceId
      };

      var upsertData = _.clone(key);
      _.extend(upsertData, updateData);

      this.findOneAndUpdate(key, {$set: upsertData}, {upsert: true, new: true})

        .then((datasourceDoc)=>{

          resolve(datasourceDoc);
        })
        .catch((err)=>{
          reject(err);
        })
        ;
    }
    catch(ex) {
      reject(ex);
    }
  });

};


DatasourceModel.plugin(timestamps);
module.exports = mongoose.model('Datasources', DatasourceModel);
