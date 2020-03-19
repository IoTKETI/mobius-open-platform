var express = require('express');
var router = express.Router();
var dashboardManager = require('./logics/dashboard.manager.js');
var dbsyncManager = require('./logics/dbsync.manager.js');

/* GET users listing. */
router.get('/', function(req, res){

  dashboardManager.getDashboardData(req.user)

  .then(function(dashboardData){
    res.status(200).json(dashboardData);
  })
  .catch(function(err){
    if(err.statusCode)
      res.status(err.statusCode).send(err.message);
    else
      res.status(500).send(err);
  });
});



/* GET register new device. */
router.get('/test/:device', function(req, res){

  dbsyncManager.synchronizeDeviceAcps(req.params.device)

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
router.get('/test2/:email', function(req, res){

  dbsyncManager.synchronizeUserAcps(req.params.email)

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
