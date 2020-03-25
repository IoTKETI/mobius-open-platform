var express = require('express');
var router = express.Router();

var widgetManager = require('../managers/widget.manager.js')





/* POST widget listing. */
router.post('/:widgetId/trigger', (req, res, next)=>{
  var widgetId = req.params.widgetId;
  var auth = req.auth;
  var triggerData = req.body;

  widgetManager.triggerResource(auth.parsed, triggerData)
    .then((widgetList)=>{

      res.status(200).json(widgetList)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

/* PUT widget listing. */
router.delete('/:widgetId', (req, res, next)=>{
  var widgetId = req.params.widgetId;
  var auth = req.auth;

  widgetManager.deleteWidget(auth.parsed, widgetId)
    .then((widget)=>{

      res.status(200).json(widget)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

/* POST widget listing. */
router.put('/widget-order', (req, res, next)=>{
  var auth = req.auth;
  var widgetIds = req.body;

  widgetManager.updateWidgetOrder(auth.parsed, widgetIds)
    .then((widgetIds)=>{

      res.status(200).json(widgetIds)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

/* DELETE widget */
router.put('/:widgetId', (req, res, next)=>{
  var widgetId = req.params.widgetId;
  var auth = req.auth;
  var updateData = req.body;
  console.log( 'Router:updateWidget', updateData.triggerInfo.resourcePath);
  widgetManager.updateWidget(auth.parsed.userId, widgetId, updateData)
    .then((widget)=>{

      res.status(200).json(widget)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});


/* POST create new widget */
router.post('/', (req, res, next)=>{

  var auth = req.auth;
  var widgetInfo = req.body;

  widgetManager.createWidget(auth.parsed, widgetInfo)
    .then((widget)=>{

      res.status(200).json(widget)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});


/* GET widget listing. */
router.get('/:widgetId', (req, res, next)=>{

  var auth = req.auth;
  var widgetId = req.params.widgetId;

  widgetManager.getWidget(auth.parsed, widgetId)
    .then((widgetList)=>{

      res.status(200).json(widgetList)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

/* GET widget listing. */
router.get('/', (req, res, next)=>{

  var auth = req.auth;

  widgetManager.listWidgets(auth.parsed)
    .then((widgetList)=>{

      res.status(200).json(widgetList)
    })
    .catch((ex)=>{
      res.status(400).json(ex)
    });

});

module.exports = router;
