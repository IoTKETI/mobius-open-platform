var express = require('express');
var router = express.Router();

var onem2mManager = require('./logics/onem2m.manager.js');
var deviceManager = require('./logics/device.manager.js');

/* GET listing child resources. */
router.get('/browse', function(req, res){

  var parentResourceId = req.query.resourceId;

  onem2mManager.listChildResources(req.user, parentResourceId)
    .then(function(resourceList){
      res.status(200).send(resourceList);
    })
    .catch(function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});



/* GET get device AE by resource name and aei. */
router.get('/findae', function(req, res){

  var aeName = req.query.aeName;
  var aeId = req.query.aeId;

  deviceManager.findDeviceResource(req.user, aeName)
    .then(function(aeObj){
      if(aeObj['m2m:ae']['aei'] == aeId) {
        res.status(200).send(aeObj);
      }
      else {
        res.status(404).send('AE ID가 일치하지 않습니다.');
      }
    })
    .catch(function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});










module.exports = router;
