const router = require('express').Router();
const CmdController = require('../controllers/command.controller');

router.get('/', CmdController.getBotCommands);
router.post('/', CmdController.addCmd);
router.put('/', CmdController.modifyCommand);
router.delete('/', CmdController.deleteCommand);
router.delete('/list', CmdController.deleteCommands);
router.put('/toggle', CmdController.toggleCommandActivity);
router.put('/activities', CmdController.toggleCommandActivities);
module.exports = router;