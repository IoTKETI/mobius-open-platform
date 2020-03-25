var debug = require('debug')('keti');
var Promise = require('bluebird');


function Task(text, successed) {
  return new Promise(function(resolved, rejected) {

    var timeout = Math.random() * 5000;
    console.log( 'run task ' + text + ' after ' + timeout + 'ms');

    setTimeout(function() {
      console.log( text + ' has done' );
      if( successed )
        resolved( text + ' has succeed' );
      else
        rejected( [text + ' has failed', 'error', 'error2'] );
    }, timeout)
  });
}


function discoverResource(text, successed) {
  return new Promise(function(resolve, reject) {
    Task(text, successed)
      .then(function(result) {
        resolve({result:true, data:result});
      })
      .catch(function(result, err1, err2) {
        console.log( '--- check' + arguments.length);
        resolve({result:false, data: {"result":result, "err1": err1, "err2": err2}});
      });
  });
}

var tasks = [];
tasks.push(discoverResource('task1', true));
tasks.push(discoverResource('task2', true));
tasks.push(discoverResource('task3', false));
tasks.push(discoverResource('task4', true));
tasks.push(discoverResource('task5', true));


Promise.all(tasks)
  .then(function(values){
    console.log( "success" );
    console.log( JSON.stringify( values, null, ' ' ) );

  })
  .catch(function(reason){
    console.log( "failed" );
    console.log( JSON.stringify( reason, null, ' ' ) );

  });
