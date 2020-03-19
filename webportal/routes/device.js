var express = require('express');
var router = express.Router();
var deviceManager = require('./logics/device.manager.js');
var dbsyncManager = require('./logics/dbsync.manager.js');



/* DELETE device resource. */
router.delete('/:deviceId/resource', function(req, res){

  var deviceId = req.params.deviceId;

  deviceManager.deleteDeviceResource(req.user, deviceId)

    .then(function(device){
      res.status(200).send(device);
    }, function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});


/* POST update device acpi */
router.put('/:deviceId/acpi', function(req, res){

  var acpi = req.body;

  deviceManager.updateDeviceAcpi(req.user, req.params.deviceId, acpi)

    .then(function(device){
      return deviceManager.getDeviceInfo(req.user, req.params.deviceId)
    })

    .then(function(device){
      res.status(200).send(device);
    })

    .catch(function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });

});


/* DELETE delete device acpi */
router.delete('/:deviceId/acpi', function(req, res){

  var acpi = req.body;

  deviceManager.updateDeviceAcpi(req.user, req.params.deviceId, acpi, true)

    .then(function(device){
      return deviceManager.getDeviceInfo(req.user, req.params.deviceId)
    })

    .then(function(device){
      res.status(200).send(device);
    })

    .catch(function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });

});


/* GET device info. */
router.get('/:deviceId', function(req, res){

  deviceManager.getDeviceInfo(req.user, req.params.deviceId)

    .then(function(device){
      res.status(200).send(device);
    })
    .catch(function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});


/* DELETE device info. */
router.delete('/:deviceId', function(req, res){

  var deviceId = req.params.deviceId;

  deviceManager.unregisterDevice(req.user, deviceId)

    .then(function(device){
      res.status(200).send(device);
    })
    .catch(function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});


/* PUT device info. */
router.put('/:deviceId', function(req, res){

  var deviceInfo = req.body;

  deviceManager.updateDeviceInfo(req.user, req.params.deviceId, deviceInfo)

    .then(function(device){
      res.status(200).send(device);
    })
    .catch(function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});


/* GET devices listing. */
router.get('/', function(req, res){

  deviceManager.listDevices(req.user)

    .then(function(newDevice){
      res.status(200).send(newDevice);
    })
    .catch(function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});

/* GET register new device. */
router.post('/', function(req, res){

  deviceManager.registerDevice(req.user, req.body)

  .then(function(newDevice){
    res.status(200).send(newDevice);
  })
  .catch(function(err){
    if(err.statusCode)
      res.status(err.statusCode).send(err.message);
    else
      res.status(500).send(err);
  });

});

module.exports = router;
