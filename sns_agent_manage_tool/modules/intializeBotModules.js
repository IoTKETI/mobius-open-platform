const BotModel = require('../models/bot.model');
const CommandModel = require('../models/command.model');
const BotService = require('../services/bot.service');
exports.InitializeBotModeuls = () => {
    return new Promise((resolve, reject) => {
        BotModel.find({activity : true}).exec()
        .then(bots => {
            CommandModel.find({activity : true}).exec()
            .then(commands => {
                try{
                    bots.forEach(bot => {
                        BotService.addTelegramBot(bot);
                        let commandList = commands.filter(el => {
                            return el._owner._id.toString() === bot._id.toString();
                        });
                        commandList.forEach(el => {
                            BotService.setNewCommand(el);
                        })
                    });
                    resolve(true);
                }catch(err){
                    reject(err);
                }
            })
            .catch(err => {
                reject(err);
            })
        })
        .catch(err => {
            reject(err);
        })
    })
}