var router = require('express').Router();
var fwController = require('../controllers/fwController');

router.get('/:aeid/version', fwController.getVersion);

router.get('/:aeid/:version/size', fwController.getSize);

router.get('/:aeid/:version/data/block', fwController.getFile);

router.get('/block-size', fwController.getBlockSize);
router.put('/block-size', fwController.setBlockSize);


module.exports = router;