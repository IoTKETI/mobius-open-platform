const router = require('express').Router();
const botController = require('../controllers/bot.controller');


router.delete('/:botID/list', botController.removeRequestValidList);

router.get('/:owner/list', botController.getBots);

router.delete('/list', botController.deleteBot);

router.get('/get', botController.getBotInfo);

router.get('/info', botController.findBotByOwner);

router.post('/user', botController.moveRequestToValidUser);

router.post('/request', botController.moveValidUserToRequest);


router.get('/', botController.getBots);

router.post('/:owner/add', botController.addBot);
module.exports = router;