var express = require('express');
var router = express.Router();

var onem2mManager = require('./logics/onem2m.manager.js');
var userManager = require('./logics/user.manager.js');



/* GET get user names from emails  */
router.get('/usersname', function(req, res){

  var emails = req.query.emails;

  userManager.findUsersByEmail(emails)

    .then(function(acpObj){
      res.status(200).send(acpObj);
    }, function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});



/* POST create grant information */
router.post('/:acpName/rule', function(req, res){

  //  check exists
  onem2mManager.addAcrToACP(req.user, req.params.acpName,  req.body)

    .then(function(acpObj){
      res.status(200).send(acpObj);
    }, function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});



/* DELETE create grant information */
router.delete('/:acpName/rule/:index', function(req, res){

  //  check exists
  onem2mManager.deleteAcrFromACP(req.user, req.params.acpName,  req.params.index)

    .then(function(acpObj){
      res.status(200).send(acpObj);
    }, function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});


/* PUT update grant information */
router.put('/:acpName/rule/:index', function(req, res){

  //  check exists
  onem2mManager.updateAcrToACP(req.user, req.params.acpName,  req.params.index, req.body)
    .then(function(acpObj){
      res.status(200).send(acpObj);
    }, function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});





/* GET list all acp. */
router.get('/', function(req, res){

  onem2mManager.listUserACPResources(req.user)

  .then(function(acpList){
    res.status(200).send(acpList);
  }, function(err){
    if(err.statusCode)
      res.status(err.statusCode).send(err.message);
    else
      res.status(500).send(err);
  });
});

/* POST create new ACP. */
router.post('/', function(req, res){

  //  check exists
  onem2mManager.createNewACPResource(req.user, req.body)
    .then(function(acpObj){
      res.status(200).send(acpObj);
    }, function(err){
      if(err.statusCode)
        res.status(err.statusCode).send(err.message);
      else
        res.status(500).send(err);
    });
});




module.exports = router;
