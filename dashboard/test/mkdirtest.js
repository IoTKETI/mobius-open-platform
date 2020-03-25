var mkdirp = require('mkdirp-promise');
var path = require('path');


var fullPath = path.join( '/tmp/ttt/t2/tttt' );
mkdirp(fullPath)
.then((aa)=>{
  console.log( aa );
});