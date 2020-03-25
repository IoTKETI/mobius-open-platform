const nodemailer = require('nodemailer');



function _generateEmailOptions(sendmailDoc) {

  var mailOption = {
    from: 'No-reply <noreply@dashboard.com>',
    to: "thyun.kim@synctechno.com",
    subject: "Test Main",
    html: "<div>test mail</div>"
  };

  var mailContents = '<h1>test</h1>';
  mailOption.html = mailContents;

  return mailOption;
}


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
var SENDMAIL_CONFIG = {
  "host": "smtp.office365.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "noreply@dashboard.com",
    "pass": "Wok08770"
  },
  "tls": {
    "ciphers": 'SSLv3'
  }
};

var transporter = nodemailer.createTransport(SENDMAIL_CONFIG);
var mailOption = _generateEmailOptions();


try {
  transporter.sendMail(mailOption, function (err, info) {
    if (err) {

      console.log('Send Mail error', err.message);
    }
    else {
      console.log( "SUCCESS");
    }
  });
}
catch(ex) {
  console.log(ex);
}
