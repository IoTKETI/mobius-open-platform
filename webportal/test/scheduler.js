var schedule = require('node-schedule');
var onem2mClient = require('../routes/lib/onem2m-client');




var rule = new schedule.RecurrenceRule();
rule.second = 5;

var everyMinute = 120;
var hour = everyMinute / 60;
var everyMinute = everyMinute % 60;
var min = everyMinute / 60;

function getSchedulerRuleString(everyMin) {
  var everyMinute = everyMin;
  var hour = parseInt(everyMinute / 60);
  var min = everyMinute % 60;

  var result = '';
  if(min == 0)
    result += '* ';
  else
    result += '*/' + min + ' ';

  if(hour == 0)
    result += '* ';
  else
    result += '*/' + hour + ' ';

  result += '* * *';

  return result;
}




var timetable = [5, 58, 59, 60, 61, 123, 1000];

timetable.map(function(item){
  var everyMinute = item;
  var hour = parseInt(everyMinute / 60 );
  var min = everyMinute % 60;

  console.log(item, hour, min, getSchedulerRuleString(item));
});



var rule = getSchedulerRuleString(1);
var j = schedule.scheduleJob(rule, function(fireDate){
  console.log('The answer to life, the universe, and everything!', fireDate);

  var url = 'http://localhost:7579/Mobius'

  onem2mClient.Http.GetResource(url, 'Superman')
    .then(function(cse){
      console.log('OK', cse);

      //  TODO: clear last error info

    }, function(error){
      console.log('SEND MAIL', error);
      //  TODO: save error info
    })

    .catch(function(ex){
      console.log('SEND MAIL', ex);
      //  TODO: save error info
    });


});



