var mongoose = require('mongoose')
var AuthTokenSchema = new mongoose.Schema({
    user : { type : String, required : true, unique : true },
    refreshToken : { type : String, required : true}
})

const authTokenModel = mongoose.model('AuthToken', AuthTokenSchema);

module.exports = authTokenModel;
