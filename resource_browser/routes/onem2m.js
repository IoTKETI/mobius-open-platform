var express = require('express');
var router = express.Router();
var debug = require('debug')('keti');
var httpProxy = require('http-proxy');
var _ = require('underscore');

var http = require('http');
var url = require('url');
var xml = require('xml');

var onem2mClient = require('../lib/onem2m-client');


var apiProxy = httpProxy.createProxyServer();

apiProxy.on('proxyRes', function (proxyRes, req, res) {
  debug('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
  proxyRes.on('data' , function(dataBuffer){
    var data = dataBuffer.toString('utf8');
    debug("This is the data from target server : "+ data);
  }); 
});

apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
//  proxyReq.headers = req.headers;
  debug('Proxty Request headers', JSON.stringify(proxyReq.headers, true, 2));
  debug('Org Request headers', JSON.stringify(req.headers, true, 2));
});

apiProxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});











/* GET users listing. */
router.get('/', function(req, res, next) {

  var resourceUrl = req.query.resourceUrl;
  var origin = req.query.origin;

  var parentType = req.query.parentType;
  var fu = req.query.filterUsage;
  var limit = req.query.limit;
  var offset = req.query.offset;

  //  discovery
  if( fu && fu === '1' ) {
    
    if( req.query.type ) {
      debug( 'discovery : ' + req.query.type );
      onem2mClient.Http.DiscoverResource(resourceUrl, origin, req.query.type, limit, offset)
        .then(function(result) {
          res.json( result );
        })
        .catch(function(error) {
          res.status(error.statusCode||"404");
          res.json( error );
        });
    }
    else {
      debug( 'discovery : all Types' );
      var discoveryResult = [];

      var contentModel = onem2mClient.Model.Resource.getContentModel(parentType);
      var resourceTypes = [];
      var limType = null;
      contentModel.map(function(item){
        if(item=='4') { //  cin
          limType = '4';
        }
        else {
          resourceTypes.push(item);
        }
      });

      onem2mClient.Http.DiscoverDirectChildResource(resourceUrl, origin, resourceTypes)
        .then(function(result) {

          if (limType) {
            var rsp = result['m2m:rsp'];
            if (rsp) {
              var typeNames = Object.keys(rsp);

              typeNames.map(function (typeName) {
                if (rsp[typeName] ) {
                  rsp[typeName].map(function (item) {
                    var obj = {};
                    obj[typeName] = item;
                    discoveryResult.push(obj);
                  });
                }
              });
            }

            return onem2mClient.Http.DiscoverChildInstance(resourceUrl, origin, limType, limit);
          }
          else {
            return result;
          }
        }, function(err) {
          if (limType) {
            return onem2mClient.Http.DiscoverChildInstance(resourceUrl, origin, limType, limit);
          }
          else{
            return Promise.reject(err);
          }
        })

        .then(function(result){
          if(result) {
            var rsp = result['m2m:rsp'];
            if (rsp) {
              var typeNames = Object.keys(rsp);

              typeNames.map(function (typeName) {
                if (rsp[typeName] ) {
                  rsp[typeName].map(function (item) {
                    var obj = {};
                    obj[typeName] = item;
                    discoveryResult.push(obj);
                  });
                }
              });
            }
          }

          res.json( discoveryResult );

        }, function(err){
          res.json( discoveryResult );
        })


        .catch(function(err){
          debug(err.message);
          res.status(err.statusCode||"404");
          res.json( err );
        });
    }
  }
  else 
  {
    onem2mClient.Http.GetResource(resourceUrl, origin)
      .then(function(result) {
        res.json( result );
      })
      .catch(function(error) {
        debug(error.message);
        res.status(error.statusCode||"404");
        res.json( error );
      });

  }


});


/* GET users listing. */
router.post('/', function(req, res, next) {

  var parentResourceUrl = req.query.parentResourceUrl;
  var origin = req.query.origin;

  var resource = req.body;
  
  var nodeType = Object.keys(resource)[0];
  var rn = resource[nodeType]["rn"];

  debug( parentResourceUrl );

  onem2mClient.Http.CreateResource(parentResourceUrl, resource, origin)
    .then((result)=>{
      res.json( result );
    })
    .catch((err)=>{
      if(err.statusCode == 409){
        if(nodeType == 'm2m:sub'){ //중복된 대상이 SUB일 때만 삭제 및 재생성을 진행

          console.log(`try delete existed subscription : ${parentResourceUrl}/${rn}`);
          onem2mClient.Http.DeleteResource(`${parentResourceUrl}/${rn}`, origin)
            .then(() =>{
              return onem2mClient.Http.CreateResource(parentResourceUrl, resource, origin);
            })
            .then((res2)=>{
              res.json( res2 );
            })
            .catch((err)=>{
              debug( err.message );
              res.status(err.statusCode||"404");
              res.json( err );
            })
        }else{          
          res.status(err.statusCode);
          res.json(err);
        }
      }else{
        debug( err.message );
        res.status(err.statusCode||"404");
        res.json( err );
      }
    })
});



/* GET users listing. */
router.delete('/', function(req, res, next) {

  var resourceUrl = req.query.resourceUrl;
  var origin = req.query.origin;

  debug( resourceUrl );

  onem2mClient.Http.DeleteResource(resourceUrl, origin)
    .then(function(result) {
      res.json( result );
    })
    .catch(function(error) {
      debug( error.message );
      res.status(error.statusCode||"404");
      res.json( error );
    });

});
















/* GET users listing. */
router.all('/:targetUrl', function(req, res, next) {
  var targetUrl = decodeURIComponent(req.params.targetUrl);
  debug( 'onem2m.js called : ' + targetUrl );
  debug( targetUrl );

  var options = {
    target: targetUrl

//  , headers: req.headers
  };


  apiProxy.web(req, res, options);
});

module.exports = router;
