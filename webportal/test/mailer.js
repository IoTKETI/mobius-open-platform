var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user : 'tech.iotocean@gmail.com',
    pass : 'iotocean7580!'
  }
});

var mailOption = {
  from : '모비우스웹포털<tech.iotocean@gmail.com>',
  to : '김태현<xogusking@daum.net>',
  subject : '[발신전용] 노드 메일 테스트',
  text : '안녕하세요',
  html: '<b>Hello world?</b>'
};

transporter.sendMail(mailOption, function(err, info) {
  if ( err ) {
    console.error('Send Mail error : ', err);
  }
  else {
    console.log('Message sent : ', info);
  }
});
