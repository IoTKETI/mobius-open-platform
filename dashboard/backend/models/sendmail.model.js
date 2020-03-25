const mongoose    = require('mongoose')
const timestamps  = require('mongoose-timestamp');

const Schema = mongoose.Schema;

const SendmailModel = new Schema({
  to: String,
  email: String,
  status: {
    type: String,
    enum: ['READY', 'SUCCESS', 'ERROR'],
    default: 'READY'
  },
  title: String,
  content: String,
  error: String,
});

// create new User document
SendmailModel.statics.create = function(to, email, title, content) {
  var user = new this({
    to: to,
    email: email,
    title, title,
    content: content
  });

  // return the Promise
  return user.save()
};

// fetch mails to be sent
SendmailModel.statics.fetchMailTasks = function(limit) {
  var numberOfMails = limit || 10;
  return this.find({status: 'READY'}).sort({'createdAt': 1}).limit(numberOfMails).exec();
};

SendmailModel.plugin(timestamps);

module.exports = mongoose.model('sendmail', SendmailModel);
