const mongoose    = require('mongoose');
const timestamps  = require('mongoose-timestamp');
const shortid     = require('shortid');
const _           = require('lodash');
const DatasourceModel  = require('./datasource.model.js');
const debugLog    = require('debug')('keti');
global.debug = {
  log: debugLog
};

const Schema = mongoose.Schema;


const WidgetsModel = new Schema({
  widgetId: {
    type: String,
    default: shortid.generate
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  widgetType: String,
  title: String,
  order: Number,
  width: Number,
  height: Number,
  workspace: String,
  widgetData: Schema.Types.Mixed,
  triggerInfo: Schema.Types.Mixed,
});

// create new widget document
WidgetsModel.statics.createWidget = function(owner, widgetInfo) {

  var widgetTemplate = {
    owner: owner,
    widgetType: widgetInfo.widgetType,
    title: widgetInfo.title,
    width: widgetInfo.width,
    height: widgetInfo.height,
    order: 100000,
    triggerInfo: widgetInfo.triggerInfo,
    workspace: widgetInfo.workspace
  };


  var widget = new this(widgetTemplate);

  return new Promise((resolve, reject)=>{
    try {
      DatasourceModel.findDatasource(owner, widgetInfo.datasourceId)
      .then((datasource)=>{
        widget.datasource = datasource;

        return widget.save();
      })

      .then((widget)=>{
        resolve(widget);
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


// delete widget document
WidgetsModel.statics.deleteWidget = function(owner, widgetId) {

  return this.deleteOne({"owner": owner, "widgetId": widgetId});

};



// create new Things document
WidgetsModel.statics.listWidgets = function(owner) {

  return new Promise((resolve, reject)=>{

    var _widget = null;

    try {
      this.find({owner:owner}).sort({ "order": 1 }).exec()
        .then((widgetListDoc)=>{

          resolve(widgetListDoc);
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
WidgetsModel.statics.getWidget = function(owner, widgetId) {

  return new Promise((resolve, reject)=>{

    var _widget = null;

    try {
      this.findOne({owner:owner, widgetId:widgetId}).exec()
        .then((widgetDoc)=>{

          resolve(widgetDoc);
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
WidgetsModel.statics.upsertWidget = function(owner, widgetId, updateData) {

  return new Promise((resolve, reject)=>{
    try {

      var key = {
        owner: owner,
        widgetId: widgetId
      };

      var upsertData = _.clone(key);
      _.extend(upsertData, updateData);

      this.findOneAndUpdate(key, {$set: upsertData}, {upsert: true, new: true})

        .then((widgetDoc)=>{

          resolve(widgetDoc);
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
WidgetsModel.statics.updateWidgetData = function(owner, widgetId, widgetData) {

  return new Promise((resolve, reject)=>{
    try {

      var key = {
        owner: owner,
        widgetId: widgetId
      };

      this.findOne(key).exec()
        .then((widgetDoc)=>{

          if(widgetDoc) {
            widgetDoc['widgetData'] = widgetData;
            widgetDoc.save();
          }
          else {
            return widgetDoc;
          }
        })

        .then((widgetDoc)=>{
          resolve(widgetDoc);
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
WidgetsModel.statics.updateWidgetOrder = function(owner, widgetIdList) {

  return new Promise((resolve, reject)=>{
    try {

      Promise.all(widgetIdList.map((widgetId, index)=>{
        var key = {
          owner: owner,
          widgetId: widgetId
        };
        var updateData = {
          order: index
        };

        return this.findOneAndUpdate(key, {$set: updateData}, {upsert: false, new: false})
      }))
      .then((result)=>{
        resolve(widgetIdList);
      })
    }
    catch(ex) {
      reject(ex);
    }
  });

};


// update or create Things document
WidgetsModel.statics.updateWidgetData = function(owner, widgetId, widgetData) {

  return new Promise((resolve, reject)=>{
    try {

      var key = {
        owner: owner,
        widgetId: widgetId
      };

      this.findOne(key).exec()
        .then((widgetDoc)=>{

          if(widgetDoc) {
            widgetDoc['widgetData'] = widgetData;
            widgetDoc.save();
          }
          else {
            return widgetDoc;
          }
        })

        .then((widgetDoc)=>{
          resolve(widgetDoc);
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


WidgetsModel.plugin(timestamps);
module.exports = mongoose.model('Widgets', WidgetsModel);
