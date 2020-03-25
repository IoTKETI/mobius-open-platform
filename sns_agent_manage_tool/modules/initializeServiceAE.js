var onem2mClient = require('onem2m_client')();
var onem2mModel = onem2mClient.Model;
var SERVICE_AE = {
  "m2m:ae": {
    "rn": CONFIG.system_name,
    "api": CONFIG.system_name,
    "lbl": ['KETI FANET Monitor Web'],
    "rr": true
  }
}

module.exports = function(){
  return new Promise((resolve, reject) => {
    try{
      var aeURL = `${CONFIG.mobius.host}:${CONFIG.mobius.port}/${CONFIG.mobius.csebase}`+'/'+CONFIG.system_name;
      var target = onem2mModel.getAccessPointInfo(aeURL);
      var parentResourcePath = target.baseUrl + '/' + target.cseName
    
      var origin = 'S'; // AE 생성 시 origin을 "S"로 하여 Service domain에서 할당받기 위함
    
      //  try to create resource monitor AE resource
      onem2mClient.Http.createResource(parentResourcePath, SERVICE_AE, origin)
        .then(function(res) {
          //  success to create resource monitor AE
          //  check aeid
          var aeID = res['m2m:ae']['aei'];
          if (aeID && aeID.trim().length > 0) {
            resolve(aeID);
          }
          else {
            //  if aeid is invalid, then query resource info
            var resourceUrl = parentResourcePath + '/' + ae['m2m:ae']['rn'];
            var cseOrigin = "/" + target.cseName;  //  AE가 생성되었지만 아직 aei를 알지 못하는 상태기 때문에 origin을 CSE로 하여 조회
    
            return onem2mClient.Http.getResource(resourceUrl, cseOrigin);
          }
        })
        .then(function(res){
          resolve( res['m2m:ae']['aei'] );
        })
        .catch(function(err) {
    
          LOGGER.debug( err.message );
    
          var resourceUrl = parentResourcePath + '/' + SERVICE_AE['m2m:ae']['rn'];
          var cseOrigin = "/" + target.cseName;  //  AE가 생성되었지만 아직 aei를 알지 못하는 상태기 때문에 origin을 CSE로 하여 조회
          onem2mClient.Http.getResource(resourceUrl, cseOrigin)
            .then(function(res){
              resolve( res['m2m:ae']['aei'] );
            }, function(err){
              LOGGER.debug(err);
              reject(err);
            });
    
        })
    }catch(err){
      LOGGER.debug( 'fail to create or get FANET service app' );
    }
  })
}
