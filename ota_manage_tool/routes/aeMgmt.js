var router = require('express').Router();
var aeController = require('../controllers/aeMgmtController');

router.post('/', aeController.fileUpload, aeController.addAE);

router.get('/', aeController.getAE);

router.get('/list', aeController.getAEList);

router.put('/', aeController.modifyAE);

router.delete('/', aeController.removeAE);

router.post('/patch', aeController.startPatch);

router.put('/patch', aeController.updatePatchDate);

router.post('/upload',  aeController.fileUpload, aeController.uploadPatchFile);
module.exports = router;