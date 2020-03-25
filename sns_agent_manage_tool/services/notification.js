
const Model = require('../lib/onem2m/onem2m-model');
const _  = require('underscore');

var targetList = {};

/**
 * @method subscribeTo
 * @param target subscribe target
 * @param bot subscribe from
 * @param callback sendMessage(msg), has to have chatIDs
 */
module.exports.subscribeTo = (target, bot, botID) => {
  if(targetList[target]){
    var idx = targetList[target].findIndex(e => {
      return e.bot.id === bot.id
    })
    if(idx > -1){
      targetList[target].push({
        bot : bot,
        botID : botID,
        channelList : []
      });
    }
  }else{
    targetList[target] = [{
      bot : bot,
      botID : botID,
      channelList : []
    }]
  }
}

module.exports.unSubscribeFrom = (target, botID) => {
  if(targetList[target]){
    var idx = targetList[target].findIndex(e => {
      return e.botID === botID
    });
    if(idx > -1){
      targetList[target].splice(idx, 1);
    }
  }
}

module.exports.clearChannel = (botID) => {
  for(var el in targetList){
    var idx = targetList[el].findIndex(e => {
      return e.botID === botID
    });
    if(idx > -1){
      targetList[el].splice(idx, 1);
    }
  }
}

module.exports.removeChannel = (target, botID, chatID) => {
  if(targetList[target]){
    var idx = targetList[target].findIndex(e => {
      return e.botID === botID;
    });
    if(idx <= -1){
      return;
    }
    channelIdx = targetList[target][idx].channelList.findIndex(e => {
      return e === chatID
    });
    if(channelIdx > -1){
      targetList[target][idx].channelList.splice(channelIdx, 1);
    }
  }
}

module.exports.addNewChannel = (target, botID, chatID) => {
  if(targetList[target]){
    var idx = targetList[target].findIndex(el => {return el.botID === botID});
    if(idx > -1){
      targetList[target][idx].channelList.push(chatID);
    }
  }else{
    throw new Error("구독 중이지 않은 대상입니다.");
  }
}

module.exports.notification = (mqttServerAddress, primitiveContent) => {
  var sgn = primitiveContent['sgn'] || primitiveContent['m2m:sgn'];
  if(sgn.vrq) {
  return;
  }

  var representation = sgn.nev.rep;
  var notiEventType = sgn.net||sgn.nev.net;
  var resourceType = _.keys(representation)[0];
  var resource = sgn.nev.rep[resourceType];
  var resourceTypeCode = Model.Resource.getTypeCode(resourceType);
  var divideResourceUrl = sgn.sur.split('/');
  var resourceUrl = divideResourceUrl.slice(1, divideResourceUrl.length-1).join('/');
  switch(notiEventType){
      case 3 :
      case '3' :
          if(resourceTypeCode == 4 || resourceTypeCode == '4'){

              var con = resource['con'];
              var message = msgBase64Convert(con);
              if(targetList[resourceUrl]){
                targetList[resourceUrl].forEach(el => {
                  el.channelList.forEach(chatID => {
                    el.bot.sendMessage(chatID, `${resourceUrl} => ${message}`);
                  })
                })
              }
          }
          break;
  }
}


function msgBase64Convert(con){
  var message = "";
   try {
       var base64 = atob(con);
       //check content is correct base64 foramt
       var jsVal = JSON.parse(base64);
       for(var a in jsVal){
           message += `${a} : ${jsVal[a]}\n`;
       }
   }catch (err){
       // content is not base64 format
       message = con;
   }
   return message;
}