var express = require('express');
var router = express.Router();

var datasourcesManager = require('../managers/datasource.manager.js')




/* PUT datasources . */
router.put('/:datasourceId/run', (req, res, next)=>{

  var auth = req.auth;
  var datasourceId = req.params.datasourceId;
  var triggerInfo = req.body;

  datasourcesManager.runDatasource(auth.parsed, datasourceId, triggerInfo)
    .then((datasource)=>{

      res.status(200).json(datasource)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

/* PUT datasources . */
router.put('/:datasourceId/stop', (req, res, next)=>{

  var auth = req.auth;
  var datasourceId = req.params.datasourceId;

  datasourcesManager.stopDatasource(auth.parsed, datasourceId)
    .then((datasource)=>{

      res.status(200).json(datasource)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

/* PUT datasources . */
router.put('/:datasourceId', (req, res, next)=>{

  var auth = req.auth;
  var datasourceId = req.params.datasourceId;
  var updateData = req.body;

  datasourcesManager.updateDatasource(auth.parsed.userId, datasourceId, updateData)
    .then((datasource)=>{

      res.status(200).json(datasource)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});


/* DELETE delete datasource. */
router.delete('/:datasourceId', (req, res, next)=>{

  var auth = req.auth;
  var datasourceId = req.params.datasourceId;

  datasourcesManager.deleteDatasource(auth.parsed.userId, datasourceId)
    .then((datasource)=>{

      res.status(200).json(datasource)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});



/* POST create new datasource. */
router.post('/', (req, res, next)=>{

  var auth = req.auth;
  var datasourceInfo = req.body;

  datasourcesManager.createDatasource(auth.parsed.userId, datasourceInfo)
    .then((datasource)=>{

      res.status(200).json(datasource)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

/* GET datasources . */
router.get('/:datasourceId', (req, res, next)=>{

  var auth = req.auth;
  var datasourceId = req.params.datasourceId;

  datasourcesManager.getDatasource(auth.parsed, datasourceId)
    .then((datasource)=>{

      res.status(200).json(datasource)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

/* GET datasources listing. */
router.get('/', (req, res, next)=>{

  var auth = req.auth;

  datasourcesManager.listDatasources(auth.parsed)
    .then((datasourceList)=>{

      res.status(200).json(datasourceList)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

module.exports = router;
