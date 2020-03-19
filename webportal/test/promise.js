

//  true : resolve
//  false : reject
//  null : throw error
var promiseResult = [
  true,
  false,
  true
];



function execPromise(index, input) {
  return new Promise(function(resolve, reject){

    if(input === true)
      resolve(index);

    else if(input === false)
      reject(index);

    else
      throw new Error('error : ' + index);
  });
}




function run() {
  return new Promise(function(resolve, reject){


    try {
      execPromise(0, promiseResult[0])

        .then(function(index){
          console.log( 'then 1:', index);
          return execPromise(1, promiseResult[1]);
        })


        .then(function(index){
          console.log( 'then 3:', index);
          resolve(index);
        })


        .catch(function(err){
          err = err.message ? err.message : err;
          console.log( 'catch 1:', err);
          reject(err);
        })
    }

    catch(ex) {
      console.log('try-catch', ex);
      reject(ex);
    }

  });
}


run()
  .then(function(result){
    console.log( 'success', result);
  })
  .catch(function(err){
    console.log( 'error', err);

  });
