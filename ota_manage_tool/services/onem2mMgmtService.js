var onem2m = require('../lib/onem2m-client');

var OTA_USER_AE_PREFIX = 'OTA_';
const mobiusURL = `${CONFIG.mobius.host}:${CONFIG.mobius.port}/${CONFIG.mobius.csebase}`;

emailParser = (email) => {
    return email.split('@')[0]; // @아래의 id만 가져오기
    // let div = email.split(/[@\.]+/);
}

exports.isExistAE = (aeid) => {
    var targetUrl = mobiusURL;
    return new Promise((resolve, reject) => {
        try{
            onem2m.Http.GetResource(`${targetUrl}/${aeid}`, "OneM2M_OTA_Service").
            then( rs => {
                key = Object.keys(rs);
                resolve(key[0].split(":")[1] != 'ae' ? false : true);
            })
            .catch(err => {
                reject(err);
            })
        }catch(err){
            reject(err);
        }
    })
}

exports.createOrGetAEResource = (email) => {
    // OTA_ + email's ID
    let aeName = OTA_USER_AE_PREFIX + emailParser(email);

    return new Promise( (resolve, reject) => {
        try{
            var aeObject = {
                "m2m:ae": {
                  "rn": aeName,
                  "api": 'KETI.OTA.PORTAL.USER',
                  "lbl": ['KETI', 'OTA', 'Portal', 'user', email],
                  "rr": true
                }
            };

            origin = aeName;
            var targetUrl = mobiusURL;
            onem2m.Http.CreateResource(targetUrl, aeObject, origin)
            .then( aeResource => {
                return aeResource;
            }, (err) => {
                if(err.statusCode === 409){ // 같은 이름의 AE가 있는경우
                    var aeUrl = `${targetUrl}/${aeName}`;
                    // 기존의 ae resource를 조회해서 반환
                    return onem2m.Http.GetResource(aeUrl, origin);
                }else{
                    throw new Error('id-exist');
                }
            })
            .then( aeResource => {
                resolve(aeResource);
            })
            .catch( err => {
                // create 실패던가, get 과정 중의 실패이다.
                // TODO return error type
                reject(err);
            })
        }catch(error){
            return reject(error);
        }
    });
} 

exports.userFiredDeleteAE = (user) => {
    let aeID = user.aeid;
    let targetUrl = mobiusURL;;

    return onem2m.Http.DeleteResource(`${targetUrl}/${aeID}`, aeID);
}

exports.createUpdateCIN = (userOrigin, aeid) => {
    let targetUrl = `${mobiusURL}/${aeid}/update`;

    let cinObj = {
        'm2m:cin' : {
            con : 'active'
        }
    }
    return onem2m.Http.CreateResource(targetUrl, cinObj, userOrigin);
}