var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var Schema = mongoose.Schema;

var tokenSchema = new Schema({
  owner : { type : mongoose.SchemaTypes.ObjectId, ref : 'User', required : true},
  refreshToken : { type : String, required : true}
})

tokenSchema.plugin(timestamps);
module.exports = mongoose.model('token', tokenSchema);