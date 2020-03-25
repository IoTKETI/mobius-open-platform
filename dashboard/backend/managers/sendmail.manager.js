const PlatformError = require('./error.manager.js');
const Sendmail  = require('../models/sendmail.model.js');
const nodemailer = require('nodemailer');


/***
 * OFFICE 365 SMTP
 *
 *  server : smtp.office365.com
 *  port: 58 (recommended) or 25
 *  TLS/StartTLS : use
 *  user name, email address and password
 *
 *  limitation for every minute : 30
 *  limitation for every day : 10,000
 *
 */






const SENDMAIL_CONFIG = global.CONFIG.sendmail;

const MAIL_TRANSPORTER = nodemailer.createTransport(SENDMAIL_CONFIG);

function _generateEmailOptions(sendmailDoc) {

  var mailOption = {
    from: 'No-reply-DASHBOARD <' + SENDMAIL_CONFIG.auth.user + '>',
    to: sendmailDoc.to + '<' + sendmailDoc.email + '>',
    subject: sendmailDoc.title ,
    html: sendmailDoc.content
  };

  var mailContents = '<h1>모비우스 웹포털 비밀번호 재설정</h1>';
  mailContents += '비밀번호 재설정 링크: http://203.253.128.161/#!/password-change/' + user.resetPassordInfo.token;
  mailOption.html = mailContents;

  return mailOption;
}



exports.sendmailTask = ()=> {

  return new Promise((resolve, reject) => {

    try {

      //  get {{number of mails to be sent}} mail
      Sendmail.fetchMailTasks()
        .then((mailDocList) => {


          var transporter = nodemailer.createTransport(SENDMAIL_CONFIG);

          var mailOption = __generatePasswordResetEmail(user);

          transporter.sendMail(mailOption, function (err, info) {
            if (err) {
              resObj.statusCode = 500;
              resObj.message = 'email 전송 오류';
              resObj.data = err.message;

              debug.log('Send Mail error', err.message);
              return reject(resObj);
            }
            else {
              resObj.statusCode = 200;
              resObj.message = 'OK';
              resObj.data = user.email;

              resolve(resObj);
            }
          });
        })


      //  find user
      User.checkUserExists(signinInfo.userId, signinInfo.email)
        .then((userDoc) => {
          if (user) {
            if (user.userId == signinInfo.userId)
              throw new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'id-exists', 'User ID is already exists');
            else
              throw new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'email-exists', 'Email is already used');
          } else {

            //  create user on database
            return User.create(signinInfo)
          }
        })

        .then((userDoc) => {
          //  send email for activation user account


        })

        .catch((err) => {
          debug.log("ERROR:", PlatformError.SOURCE.USER.SIGNIN, err);
          return reject(new PlatformError(PlatformError.SOURCE.USER.SIGNIN, 'unknown', 'Fail to signin'));
        })
    }
    catch (ex) {
      debug.log("EXCEPTION", PlatformError.SOURCE.USER.SIGNIN, ex);
      reject(ex);
    }
  });

}
