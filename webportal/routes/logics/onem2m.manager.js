/**
 * Created by kimtaehyun on 2017. 12. 01.
 */


'use strict';

var debug = require('debug')('keti');
var _ = require('underscore');
var Http = require('request-promise');

var onem2mClient = require('../lib/onem2m-client');

var TARGET_IOT_PLATFORM_URL = global.CONFIG.target.host;
if(global.CONFIG.target.port)
  TARGET_IOT_PLATFORM_URL += ':' + global.CONFIG.target.port;

var TARGET_IOT_PLATFORM_CB_NAME = global.CONFIG.target.csebase;
var MQTT_URL = global.CONFIG.target.mqtt;

var BROWSERABLE_TYPES = global.CONFIG.target.supportingTypes;
var WEBPORTA_SUB_NAME = global.CONFIG.target.subscriptionName;

function __getResourceUrl(idOrPath) {

  var targetUrl = TARGET_IOT_PLATFORM_URL;
  if(idOrPath.startsWith('/')) {
    targetUrl += idOrPath;
  }
  else {
    targetUrl += '/' + idOrPath;
  }

  return targetUrl;
} //  end of __getResourceUrl function


/**
 * 로그인 사용자 계정에 대한 AE Resource를 조회/생성 하여 반환한다
 *
 * @param user 사용자 로그인 정보
 * @returns Promise(AEResourceObject)
 * @private
 */
function __getUserAeResource(user) {

  var aeName = 'WEBPORTAL.USER-' + user.email;
  var targetCbUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME);

  return new Promise(function(resolve, reject){
    try {

      if (user.aeObject) {
        return resolve(user.aeObject);
      }
      else {
        var aeObject = {
          "m2m:ae": {
            "rn": aeName,
            "api": 'MOBIUS.WEBPORTAL.USER',
            "lbl": ['Mobius web portal user', user.email],
            "rr": true
          }
        };

        var origin = user.email;

        //  새로운 User AE resource를 생성한다.
        onem2mClient.Http.CreateResource(targetCbUrl, aeObject, origin)

        .then(function (aeResource) {

          //  생성 성공한 경우
          return aeResource;
        }, function (error) {

          //  생성이 실패한 경우 중 이미 해당 리소스가 존재하는 경우(409)
          if (error.statusCode === 409) {
            var aeUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + aeName);

            //  기존의 resource를 조회하여 반환한다.
            return onem2mClient.Http.GetResource(aeUrl, origin);
          }
          else {
            //  이외의 경우에는 error로 처리
            debug('Failed to get user AE', error);

            reject(error);
          }
        })

        .then(function (aeResource) {
          var aeResource
          //  생성 또는 조회를 성공한 경우 해당 AE Resource에 SUB을 설정한다.
          //  Sub은 성공/실패 상관 없이 생성/조회도니 AE Resource를 반환한다.
          onem2mClient.Http.SubscribeTo(targetCbUrl + '/' + aeName, WEBPORTA_SUB_NAME, origin, MQTT_URL)
            .then(function(subResult){

              resolve(aeResource);
            })
            .catch(function(err){
              debug('Failed to create SUB resource on user AE', err.message);

              resolve(aeResource);
            });
        })

        .catch(function (err) {
          debug('Failed to get user AE', err);

          reject(err);
        })
        ;
      }
    }
    catch(ex) {
      debug('Failed to get user AE', ex);
      reject(ex);
    }
  });
} //  enf of __getUserAeResource function

function __getResource(origin, idOrPath){

  return new Promise(function(resolve, reject){
    try {

      var targetUrl = __getResourceUrl(idOrPath);

      onem2mClient.Http.GetResource(targetUrl, origin)

        .then(function (resourceObj) {

          resolve(resourceObj);
        })

        .catch(function (error) {
          debug('Failed to get resource', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug('Failed to get resource', ex);
      reject(ex);
    }
  });
} //  end of __getResource function

function __deleteResource(origin, idOrPath){

  return new Promise(function(resolve, reject){
    try {

      var targetUrl = __getResourceUrl(idOrPath);

      onem2mClient.Http.DeleteResource(targetUrl, origin)

        .then(function (resourceObj) {

          resolve(resourceObj);
        })

        .catch(function (error) {
          debug('Failed to delete resource', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug('Failed to get resource', ex);
      reject(ex);
    }
  });
} //  end of __getResource function


////////////////////////////////////////////////////////////////////////////////////////
//  Login user ACP
////////////////////////////////////////////////////////////////////////////////////////

function __createUserACP(origin, userAe){

  var acpName = 'WEBPORTAL.ACP-' + origin;
  var _acpObj = null;

  return new Promise(function(resolve, reject){
    try {

      var acpObject = {
        "m2m:acp": {
          "rn": acpName,
          "pv": {
            "acr": [
              {
                "acor": [userAe['m2m:ae'].aei],
                "acop": "63"
              }
            ]
          },
          "pvs": {
            "acr": [
              {
                "acor": [userAe['m2m:ae'].aei],
                "acop": "63"
              }
            ]
          }
        }
      };

      var targetAeUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + userAe['m2m:ae'].rn);

      //  create AE resource
      onem2mClient.Http.CreateResource(targetAeUrl, acpObject, origin)

      .then(function (acpObj) {

        _acpObj = acpObj;
        var aeUpdate = {
          "m2m:ae": {
            "acpi": [acpObj['m2m:acp'].ri]
          }
        };

        return onem2mClient.Http.UpdateResource(targetAeUrl, aeUpdate, origin);
      }, function (error) {

        if (error.statusCode === 409) {
          //  ACP Resource already exists
          var acpUrl = targetAeUrl + '/' + acpName;

          return onem2mClient.Http.GetResource(acpUrl, origin);
        }
        else {
          debug('Failed to create User ACP(error while create ACP resource)', error);

          reject(error);
        }
      })


      .then(function(aeObj){

        resolve(_acpObj);
      })

      .catch(function (error) {
        debug('Failed to create user ACP(error while update AE)', error);
        reject(error);
      })
      ;
    }
    catch(ex) {

      debug('Failed to create User ACP', ex);
      reject(ex);
    }
  });
} //  end of __createUserACP function

function __getUserACP(origin, userAe){

  var acpName = 'WEBPORTAL.ACP-' + origin;
  return new Promise(function(resolve, reject){
    try {

      var targetAcpUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + userAe['m2m:ae'].rn + '/' + acpName);

      //  get ACP resource
      onem2mClient.Http.GetResource(targetAcpUrl, origin)

        .then(function (acpObj) {

          resolve(acpObj);
        })

        .catch(function (error) {

          debug('Failed to get user ACP', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug('Failed to get user ACP', ex);
      reject(ex);
    }
  });
} //  end of __getUserACP function


////////////////////////////////////////////////////////////////////////////////////////
//  ACP Resource manipulations
////////////////////////////////////////////////////////////////////////////////////////

function __createACPResource(origin, parentAe, acpInfo){

  return new Promise(function(resolve, reject){
    try {

      var acpObject = {
        "m2m:acp": {
          "rn": acpInfo.rn,
          "lbl": acpInfo.lbl,
          "pv": {
            "acr": [
              {
                "acor": [parentAe['m2m:ae'].aei],
                "acop": "63"
              }
            ]
          },
          "pvs": {
            "acr": [
              {
                "acor": [parentAe['m2m:ae'].aei],
                "acop": "63"
              }
            ]
          }
        }
      };

      var targetAeUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + parentAe['m2m:ae'].rn);

      //  create AE resource
      onem2mClient.Http.CreateResource(targetAeUrl, acpObject, origin)

        .then(function (acpObject) {

          resolve(acpObject);
        })

        .catch(function (error) {
          debug('Failed to create ACP resource', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug('Failed to create ACP resource', ex);
      reject(ex);
    }
  });
} //  end of __createACPResource function

function __getACPResource(origin, parentAe, acpName){

  return new Promise(function(resolve, reject){
    try {

      var targetAcpUrl = __getResourceUrl( '/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + parentAe['m2m:ae'].rn + '/' + acpName );

      //  create AE resource
      onem2mClient.Http.GetResource(targetAcpUrl, origin)

        .then(function (acpObject) {

          resolve(acpObject);
        })

        .catch(function (error) {
          debug('Failed to get ACP rsource', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug('Failed to get ACP resource', ex);
      reject(ex);
    }
  });
}

function __updateACPResource(origin, parentAe, acpName, acpObj){

  return new Promise(function(resolve, reject){
    try {
      var targetAcpUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + parentAe['m2m:ae'].rn + '/' + acpName);

      //  Update acp resource
      onem2mClient.Http.UpdateResource(targetAcpUrl, acpObj, origin)

        .then(function (acpObject) {

          resolve(acpObject);
        })

        .catch(function (error) {
          debug('Failed to update ACP resource', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug('Failed to update ACP resource', ex);
      reject(ex);
    }
  });
} //  end of __updateACPResource function

////////////////////////////////////////////////////////////////////////////////////////
//  ACP Resource Object manipulations (acr)
////////////////////////////////////////////////////////////////////////////////////////

function __insertAccessControlRule(acpObj, acRule) {

  var resType = Object.keys(acpObj)[0];
  if(resType != 'm2m:acp')
    throw new Error('Illegal argument exception', 'Argument must a "ACP" resource object');

  if(!acpObj[resType]['pv'])
    acpObj[resType]['pv'] = {"acr": []};

  if(!acpObj[resType]['pv']['acr'])
    acpObj[resType]['pv']['acr'] = [];

  acpObj[resType]['pv']['acr'].push(acRule);

  return acpObj;
} //  end of __insertAccessControlRule function

function __findAccessControlRule(acpObj, acrIndexOrAcorId) {
  var resType = Object.keys(acpObj)[0];
  if(resType != 'm2m:acp')
    throw new Error('Illegal argument exception', 'Argument must a "ACP" resource object');

  if(!acpObj[resType]['pv'])
    return null;

  if(!acpObj[resType]['pv']['acr'])
    return null;

  var result = null;

  if(typeof acrIndexOrAcorId === 'string') {
    acpObj[resType]['pv']['acr'].map(function(acr){
      acr.acor.map(function(acor){
        if(acor == acrIndexOrAcorId)
          result = acr;
      });
    });

    return result;
  }
  else if(typeof acrIndexOrAcorId === 'number') {
    if(acrIndexOrAcorId < 0 || acrIndexOrAcorId >= acpObj[resType]['pv']['acr'].length)
      throw new Error('Illegal argument exception', 'Array index out of bound error');

    return acpObj[resType]['pv']['acr'][acrIndexOrAcorId];
  }
  else if(Array.isArray(acrIndexOrAcorId)) {
    //  parameter가 array인 경우 acor이 모두 일치하는 첫번째 item을 return 한다.

    acpObj[resType]['pv']['acr'].map(function(acr) {

      //  array 비교를 위해 sort한 후 join해서 string 비교
      var acors = acr.acor.sort().join('|');
      var acorParam = acrIndexOrAcorId.sort().join('|');

      if (acors == acorParam) {
        result = acr;
      }
    });

    return result;
  }

  return null;
} //  end of __findAccessControlRule function

function __deleteAccessControlRule(acpObj, acrIndex) {
  var resType = Object.keys(acpObj)[0];
  if(resType != 'm2m:acp')
    throw new Error('Illegal argument exception', 'Argument must a "ACP" resource object');

  if(!acpObj[resType]['pv'])
    throw new Error('Illegal argument exception', 'Target ACP has no pv');

  if(!acpObj[resType]['pv']['acr'])
    throw new Error('Illegal argument exception', 'Target ACP has no acr');

  if(!Array.isArray(acpObj[resType]['pv']['acr']))
    throw new Error('Illegal argument exception', 'acr of Target ACP is not array');

  if(typeof acrIndex === 'number') {
    if(acrIndex < 0 || acrIndex >= acpObj[resType]['pv']['acr'].length)
      throw new Error('Illegal argument exception', 'Array index out of bound');

    acpObj[resType]['pv']['acr'].splice(acrIndex, 1);
  }
  else if(typeof acrIndex === 'string') {
    acpObj[resType]['pv']['acr'].map(function(acr){
      acr.acor = acr.acor.filter(function(acor){
        if(acor != acrIndex)
          return true;
        else
          return false;
      });
    });

    acpObj[resType]['pv']['acr'] = acpObj[resType]['pv']['acr'].filter(function(acr){
      if(acr.acor.length > 0)
        return true;
      else
        return false;
    });
  }


} //  end of __deleteAccessControlRule function





function __setAcpiToResource(origin, targetResourceIdOrPath, acpId, byTargetOrigin){

  var acpiList = [];
  if(Array.isArray(acpId))
    acpiList = acpId;
  else
    acpiList = [acpId];

  return new Promise(function(resolve, reject){
    try {
      var targetResourceUrl = __getResourceUrl(targetResourceIdOrPath);

      //  create AE resource
      onem2mClient.Http.GetResource(targetResourceUrl, origin)

        .then(function (resObj) {

          var typeName = _.keys(resObj)[0];
          var res = resObj[typeName];
          var currentAcpi = res['acpi'];
          if(currentAcpi === undefined || currentAcpi === null) {
            currentAcpi = [];
          }

            var dirty = false;
          acpiList.map(function(acpi){
            if( currentAcpi.indexOf(acpi) == -1) {
              currentAcpi.push(acpi);
              dirty = true;
            }
          });

          if( dirty == false ) {
            return resolve(resObj);
          }
          else {
            var resUpdate = {};
            resUpdate[typeName] = {
              "acpi": currentAcpi
            };

            if(byTargetOrigin) {
              origin = res['aei'] ? res['aei'] : res['ri'];
            }

            return onem2mClient.Http.UpdateResource(targetResourceUrl, resUpdate, origin);
          }
        }, function (error) {

          debug('Failed to set acpi to target resource.(error while get target resource data)', error);
          reject(error);
        })

        .then(function(resObj){

          resolve(resObj);
        }, function (error) {

          debug('Failed to set acpi to target resource(error while update target resource data)', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug('Failed to set acpi to target resource', ex);
      reject(ex);
    }
  });
} //  end of __setAcpiToResource function

function __deleteAcpiFromResource(origin, targetResourceIdOrPath, acpId){

  var acpiList = [];
  if(Array.isArray(acpId))
    acpiList = acpId;
  else
    acpiList = [acpId];

  return new Promise(function(resolve, reject){
    try {
      var targetResourceUrl = __getResourceUrl(targetResourceIdOrPath);

      //  create AE resource
      onem2mClient.Http.GetResource(targetResourceUrl, origin)

        .then(function (resObj) {

          var typeName = _.keys(resObj)[0];
          var res = resObj[typeName];
          var currentAcpi = res['acpi'];
          if(currentAcpi === undefined || currentAcpi == null) {
            currentAcpi = [];
          }

          var dirty = false;

          var updateAcpi = [];
          currentAcpi.map(function(acpi){
            if(_.contains(acpiList, acpi)) {
              dirty = true;
            }
            else {
              updateAcpi.push(acpi);
            }
          });

          if( dirty ) {
            var resUpdate = {};
            resUpdate[typeName] = {
              "acpi": updateAcpi
            };

            return onem2mClient.Http.UpdateResource(targetResourceUrl, resUpdate, origin);
          }
          else {
            resolve(resObj);
          }
        }, function (error) {

          debug('Failed to delete acpi to a resource(error while get target resource data)', error);
          reject(error);
        })

        .then(function(resObj){

          resolve(resObj);
        })

        .catch(function (error) {

          debug('Failed to delete acpi to a resource(error while update target resource)', error);
          reject(error);
        })
      ;
    }
    catch(ex) {

      debug('Failed to delete acpi from target resource', ex);
      reject(ex);
    }
  });
} //  end of __deleteAcpiFromResource function




function _listChildResources(user, parentResourceId) {

  var parentUrl = __getResourceUrl(parentResourceId);
  var origin = user.email;

  return new Promise( function(resolve, reject) {
    try {

      //  get AE
      __getUserAeResource(user)

      .then(function(aeObj) {

        //  save AE object to user profile on session
        user.aeObj = aeObj;

        //  get parent resource
        return onem2mClient.Http.GetResource(parentUrl, origin);
      }, function(err){
        debug('Failed to list child resources(error while get parent resource data)', parentUrl, origin, err);
        reject(err);
      })

      .then(function(parentResource){

        if(!parentResource) {
          return [];
        }

        var resourceType = _.keys(parentResource)[0];
        var contentModel = onem2mClient.Model.Resource.getContentModel(resourceType);

        contentModel = contentModel.filter(function(item){
          if(BROWSERABLE_TYPES.indexOf(item) == -1)
            return false;
          else
            return true;
        });

        return Promise.all(contentModel.map(function (type) {
          return new Promise(function(resolve, reject) {
            try{

              var limit = undefined;
              if( type === '4' || type === '26' ) {
                limit = 20;
              }

              onem2mClient.Http.DiscoverResource(parentUrl, origin, type, limit)
                .then(function(result) {
                  debug( 'discovery result ty=' + type, result['m2m:uril'] );
                  resolve({"success": true, "data": result});
                })
                .catch(function(error) {
                  resolve({"success": false, "data": error});
                });
            }
            catch(ex) {

              reject(ex);
            }
          }); //  return new Promise()
        }));  //  return Promise.all()
      }, function(err){
        debug('Failed to list child resources(error while discover child resources)', err);

        reject(err);
      })


      .then(function(discoverResults){

        var resourceUriList = [];
        if(discoverResults) {
          discoverResults.map(function(item){
            if(item.success) {
              var rootName = _.keys(item.data)[0];
              var uriArray = item.data[rootName];

              resourceUriList = resourceUriList.concat(uriArray);
            }
          });
        }

        return resourceUriList;
      }, function(err) {
        debug('Failed to list child resources(while collect child resource urls)', err);
        reject(err);
      })

      .then(function(uriList){
        //  get resources

        debug( 'URL List', uriList );

        return Promise.all(uriList.map(function (uri) {

          var resourceUrl = __getResourceUrl('/' + uri);

          if(resourceUrl === parentUrl)
            return Promise.resolve(null);

          return new Promise(function(resolve, reject){
            try {
              onem2mClient.Http.GetResource(resourceUrl, origin)

                .then(function(result) {

                  var resourceType = _.keys(result)[0];

                  //  discovery 결과가 parent resource 자신인 경우
                  if( result[resourceType].ri == parentResourceId )
                    resolve({"success": false, "data": result});
                  else
                    resolve({"success": true, "data": result});
                })
                .catch(function(error) {
                  resolve({"success": false, "data": error});
                });
            }
            catch(ex) {
              reject(ex);
            }
          });
        }));
      })

      .then(function(resourceList){

        debug('ResourceList: ', resourceList );

        var resultList = [];
        resourceList.map(function(item){
          if(item && item.success) {
            var qualifiedName = _.keys(item.data)[0];
            var resourceType = onem2mClient.Model.Resource.getShortName(item.data);
            var resourceName = item.data[qualifiedName]['rn'];
            var resourceId = item.data[qualifiedName]['ri'];

            resultList.push({
              "resourceType" : resourceType,
              "resourceId" : resourceId,
              "resourceName" : resourceName,
              "content": resourceType == 'cin' ? item.data[qualifiedName]['con'] : '',
              "createdAt": item.data[qualifiedName]['ct'],
              "updatedAt": item.data[qualifiedName]['lt']
            });
          }
        });

        resolve(resultList);
      })

      .catch(function(err) {
        debug('Failed to list child resources(while collect child resource data)', err);

        reject(err);
      })

    }
    catch( err ) {
      debug('Failed to list child resources', err);

      reject( err );
    }
  });
} //  end of function _listChildResources()

function _getAeResource(user, aeName) {

  var aePath = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + aeName);
  var origin = user.email;

  return new Promise( function(resolve, reject) {
    try {

      //  get AE
      __getUserAeResource(user)

      .then(function(aeObj) {

        //  save AE object to user profile on session
        user.aeObj = aeObj;

        //  get parent resource
        return onem2mClient.Http.GetResource(aePath, origin);
      }, function(err){
        debug('Failed to get AE resource(error while get user AE resource data)', aePath, origin, err);
        reject(err);
      })

      .then(function(aeResource) {
        resolve(aeResource);
      })

      .catch(function(err){
        debug('Failed to get AE resource(error while get AE resource data)', aePath, origin, err);
        reject(err);
      })

    }
    catch( err ) {
      debug('Failed to get AE resource', aePath, origin, err);

      reject( err );
    }
  });
} //  end of function _getAeResource()

function _initializeNewUser(user) {

  var newUser = user;
  return new Promise(function(resolve, reject){

    try {
      //  get AE
      __getUserAeResource(newUser)

      .then(function(aeObj) {

        return __createUserACP(newUser.email, aeObj);
      }, function(err){
        debug('Fail to initialize new user(error while get user ae resource)', err);
        reject(err);
      })

      .then(function(acpObj){
        //  acpObj는 생성만 하고 따로 사용하지는 않는다.

        resolve(newUser);
      })

      .catch(function(err){
        debug('Fail to initialize new user(error while create user ACP resource)', err);
        reject(err);
      });

    } catch(ex) {
      debug('Fail to initialize new user', ex);
      reject(ex);
    }
  });
} //  end of function _initializeNewUser()

/**
 * grant resource access rights
 *
 * @param user  login user info
 * @param targetResourceId  target resource id ( ri )
 * @param acpId ACP ID ( ri )
 * @returns Promise(onem2m resource object)
 * @private
 */
function _grantAccessRights(user, targetResourceId, acpId, byTargetOrigin) {

  var _user = user;
  return new Promise(function(resolve, reject){

    try {
      //  get user AE
      __getUserAeResource(_user)

      .then(function(aeObj) {

        //  add aei to acpi property of target device resource
        return __setAcpiToResource(user.email, targetResourceId, acpId, byTargetOrigin);
      }, function(err){
        debug('Fail to grand access rights(error while get user AE resource data)', err);
        reject(err);
      })

      .then(function(resourceObj){

        //  add target resource aei to acor of login user ACP pv





        resolve(resourceObj);
      })

      .catch(function(err){
        debug('Fail to grand access rights(error while set acpi to target resource)', err);
        reject(err);
      });

    } catch(ex) {
      debug('Fail to grand access rights', ex);
      reject(ex);
    }
  });

} //  end of function _grantAccessRights()

function _revokeAccessRights(user, targetResourceId, acpId) {

  var _user = user;
  return new Promise(function(resolve, reject){

    try {
      //  get AE
      __getUserAeResource(_user)

      .then(function(aeObj) {

        return __deleteAcpiFromResource(user.email, targetResourceId, acpId);
      }, function(err){
        debug('Fail to revoke access rights(error while set acpi to target resource)', err);

        reject(err);
      })

      .then(function(resourceObj){

        resolve(resourceObj);
      })

      .catch(function(err){
        debug('Fail to revoke access rights(error while delete acpi from target resource)', err);
        reject(err);
      });

    } catch(ex) {
      debug('Fail to revoke access rights', ex);
      reject(ex);
    }
  });

} //  end of function _revokeAccessRights()

function _getUserACPResource(user) {

  return new Promise(function(resolve, reject){

    try {
      //  get AE
      __getUserAeResource(user)

      .then(function(aeObj) {

        return __getUserACP(user.email, aeObj);
      }, function(err){
        debug('Fail to get user ACP resource(error while get user ae resource)', err);
        reject(err);
      })

      .then(function(acpObj){

        resolve(acpObj);
      })

      .catch(function(err){
        debug('Fail to get user ACP resource(error while get user acp resource data)', err);
        reject(err);
      });

    } catch(ex) {
      debug('Fail to get user ACP resource', ex);
      reject(ex);
    }
  });
} //  end of function _getUserACPResource()

function _getResourceByResourceId(user, resourceId) {

  return new Promise(function(resolve, reject){

    try {
      //  get AE
      __getUserAeResource(user)

      .then(function(aeObj) {

        return __getResource(user.email, resourceId);
      }, function(err){
        debug('Fail to get resource(error while get user ae resource)', err);
        reject(err);
      })

      .then(function(acpObj){

        resolve(acpObj);
      })

      .catch(function(err){
        debug('Fail to get resource(error while get resource data)', err);
        reject(err);
      });

    } catch(ex) {
      debug('Fail to get resource', ex);
      reject(ex);
    }
  });
} //  end of function _getResourceByResourceId()

function _deleteDeviceResource(user, resourceId) {

  return new Promise(function(resolve, reject){

    try {
      //  delete resource
      __deleteResource(user.email, resourceId)

      .then(function(resourceObj) {

        resolve(resourceObj);
      })

      .catch(function(err){
        debug('Fail to delete device resource(error while delete device resource)', err);
        reject(err);
      })

    } catch(ex) {
      debug('Fail to delete device resource', ex);
      reject(ex);
    }
  });
} //  end of function _getResourceByResourceId()

/**
 */
function _addAcrToACP(user, acpName, rule) {

  var _user = user;
  var _aeObj = null;
  return new Promise(function(resolve, reject){

    try {
      //  get AE
      __getUserAeResource(_user)

        .then(function(aeObj) {
          _aeObj = aeObj;
          return __getACPResource(user.email, aeObj, acpName);
        }, function(err){
          debug('Fail to add acr to ACP resource(error while get user ae resource)', err);
          reject(err);
        })

        .then(function(acpObj) {
          var acr = __findAccessControlRule(acpObj, rule.acor);
          if (acr) {
            acr.acop = rule.acop;
          }
          else {
            var acor = [];
            if(typeof rule.acor === 'string')
              acor = [rule.acor];
            else if(Array.isArray(rule.acor))
              acor = rule.acor;

            var acr = {
              "acor": acor,
              "acop": rule.acop
            };

            __insertAccessControlRule(acpObj, acr);
          }

          var updateObj = {
            "m2m:acp": {
              "pv": acpObj['m2m:acp'].pv
            }
          };

          return __updateACPResource(user.email, _aeObj, acpName, updateObj);
        }, function(err){
          debug('Fail to add acr to ACP resource(error while get ACP resource data)', err);
          reject(err);
        })

        .then(function(acpObj){

          resolve(acpObj);
        })

        .catch(function(err){
          debug('Fail to add acr to ACP resource(error while update ACP resource)', err);
          reject(err);
        });

    } catch(ex) {
      debug('Fail to add acr to ACP resource', ex);
      reject(ex);
    }
  });

} //  end of function _addAcrToACP()

/**
 */
function _deleteAcrFromACP(user, acpName, index) {

  var _user = user;
  var _aeObj = null;
  var _acrIndex = parseInt(index);
  if(isNaN(_acrIndex))
    _acrIndex = index;

  return new Promise(function(resolve, reject){

    try {
      //  get AE
      __getUserAeResource(_user)

        .then(function(aeObj) {
          _aeObj = aeObj;
          return __getACPResource(user.email, aeObj, acpName);
        }, function(err){
          debug('Fail to delete acr from ACP resource(error while get user AE resource)', err);
          reject(err);
        })

        .then(function(acpObj) {

          __deleteAccessControlRule(acpObj, _acrIndex);

          var updateObj = {
            "m2m:acp": {
              "pv": acpObj['m2m:acp'].pv
            }
          };

          return __updateACPResource(user.email, _aeObj, acpName, updateObj);
        }, function(err){
          debug('Fail to delete acr from ACP resource(error while get ACP resource data)', err);
          reject(err);
        })

        .then(function(acpObj){

          resolve(acpObj);
        })

        .catch(function(err){
          debug('Fail to delete acr from ACP resource(error while update ACP resource)', err);
          reject(err);
        });

    } catch(ex) {
      debug('Fail to delete acr from ACP resource', ex);
      reject(ex);
    }
  });

} //  end of function _deleteAcrFromACP()


/**
 */
function _updateAcrToACP(user, acpName, index, acop) {

  var _user = user;
  var _aeObj = null;
  var _acrIndex = parseInt(index);
  return new Promise(function(resolve, reject){

    try {
      //  get AE
      __getUserAeResource(_user)

        .then(function(aeObj) {
          _aeObj = aeObj;
          return __getACPResource(user.email, aeObj, acpName);
        }, function(err){
          debug('Fail to update acr to ACP resource(error while get user ae resource)', err);
          reject(err);
        })

        .then(function(acpObj) {

          var acr = __findAccessControlRule(acpObj, _acrIndex);
          acr.acop = acop.acop;

          var updateObj = {
            "m2m:acp": {
              "pv": acpObj['m2m:acp'].pv
            }
          };

          return __updateACPResource(user.email, _aeObj, acpName, updateObj);
        }, function(err){
          debug('Fail to update acr to ACP resource(error while get ACP resource data)', err);
          reject(err);
        })

        .then(function(acpObj){

          resolve(acpObj);
        })

        .catch(function(err){
          debug('Fail to update acr to ACP resource(error while update ACP resource)', err);
          reject(err);
        });

    } catch(ex) {
      debug('Fail to update acr to ACP resource', err);
      reject(ex);
    }
  });

} //  end of function _updateAcrToACP()

function _createNewACPResource(user, acpInfo) {
  return new Promise(function(resolve, reject){
    try {

      //  get AE
      __getUserAeResource(user)

        .then(function(aeObj) {

          return __createACPResource(user.email, aeObj, acpInfo);
        }, function (error) {
          debug('Failed to create new ACP resource(error while get user AE resource)', error);
          reject(error);
        })

        .then(function(acpObj){

          resolve(acpObj);
        })

        .catch(function (error) {
          debug('Failed to create new ACP resource(error while create new ACP resource)', error);
          reject(error);
        });
    }
    catch(ex){
      debug('Failed to create new ACP resource', error);
      reject(ex);
    }
  });
} //  end of _createNewACPResource()

function _listUserACPResources(user) {
  var origin = user.email;
  var parentUrl = '';

  return new Promise(function(resolve, reject){
    try {
      //  get AE
      __getUserAeResource(user)

        .then(function(aeObj) {

          //  save AE object to user profile on session
          user.aeObj = aeObj;
          var resourceType = _.keys(aeObj)[0];


          parentUrl = __getResourceUrl('/' + TARGET_IOT_PLATFORM_CB_NAME + '/' + aeObj[resourceType].rn);

          //  get parent resource
          return onem2mClient.Http.GetResource(parentUrl, origin);
        }, function(err){
          debug('Failed to list user ACP resources(error while get user AE resource)', err.message);
          reject(err);
        })

        .then(function(parentResource){

          if(!parentResource) {
            return resolve([]);
          }

          return onem2mClient.Http.DiscoverResource(parentUrl, origin, '1');
        }, function(err){
          debug('Failed to list user ACP resources(error while get parent resource data)', err);
          reject(err);
        })


        .then(function(discoverResult){

          var resourceUriList = [];
          if(discoverResult) {
            var rootName = _.keys(discoverResult)[0];
            resourceUriList = discoverResult[rootName];
          }

          return resourceUriList;
        }, function(err) {
          debug('Failed to list user ACP resources(error while discover child ACP resources)', err);
          reject(err);
        })

        .then(function(uriList){
          //  get resources

          return Promise.all(uriList.map(function (uri) {

            var resourceUrl = TARGET_IOT_PLATFORM_URL + '/' + uri;

            if(resourceUrl === parentUrl)
              return Promise.resolve({"success": false, "data": ''});


            return new Promise(function(resolve, reject){
              try {
                onem2mClient.Http.GetResource(resourceUrl, origin)

                  .then(function(result) {
                    resolve({"success": true, "data": result});
                  })

                  .catch(function(error) {
                    resolve({"success": false, "data": error});
                  });
              }
              catch(ex) {
                debug('Failed to get resource', resourceUrl, origin, ex);
                reject(ex);
              }
            });
          }));
        }, function(err) {
          debug('Failed to list user ACP resources(error while collect child ACP resource urls)', err);
          reject(err);
        })

        .then(function(resourceList){

          var resultList = [];
          resourceList.map(function(item){
            if(item && item.success) {
              var qualifiedName = _.keys(item.data)[0];

              resultList.push(item.data[qualifiedName]);
            }
          });

          resolve(resultList);
        })

        .catch(function(err) {
          debug('Failed to list user ACP resources(error while collect child ACP resource data)', err);
          reject(err);
        })

    }
    catch(ex) {
      debug('Failed to list user ACP resources', ex);
      reject(ex);
    }
  });
} //  end of _listUserACPResources()

function _getTrafficData() {
  return new Promise(function(resolved, rejected) {

    var options = {
      method: 'GET',
      uri: TARGET_IOT_PLATFORM_URL + '/hit'
    };

    Http(options)
      .then(function(result) {
        resolved(JSON.parse(result));
      })
      .catch(function(error) {
        debug( 'fail to get Mobius traffic data', error );
        rejected(error);
      });
  });
}

function _countAEs() {
  return new Promise(function(resolved, rejected) {

    var options = {
      method: 'GET',
      uri: TARGET_IOT_PLATFORM_URL + '/total_ae'
    };

    Http(options)
      .then(function(result) {
        var obj = JSON.parse(result)[0];
        resolved(obj['count(*)']);
      })
      .catch(function(error) {
        debug( 'fail to get Mobius traffic data', error );
        rejected(error);
      });
  });
}

function _getTotalCINSize() {
  return new Promise(function(resolved, rejected) {

    var options = {
      method: 'GET',
      uri: TARGET_IOT_PLATFORM_URL + '/total_cbs'
    };

    Http(options)
      .then(function(result) {
        var obj = JSON.parse(result)[0];
        resolved(obj['sum(cbs)']);
      })
      .catch(function(error) {
        debug( 'fail to get Mobius traffic data', error );
        rejected(error);
      });
  });
}


/**
 * Mobius에 user에 대한 AE Resource를 생성한다.
 *
 * @param user
 * @private
 */
function _createUserAeResource(user) {

  var newUser = user;
  return new Promise(function(resolve, reject) {

    try {
      //  get AE
      __getUserAeResource(newUser)

      .then(function (aeResource) {
        resolve(aeResource);
      })

      .catch(function (err) {
        debug('Fail to create user AE resource', err);
        reject(err);
      })
      ;

    } catch (ex) {
      debug('Fail to create user AE resource', ex);
      reject(ex);
    }
  });
}


/**
 * Mobius에 User AE Resource 하부에 기본 ACP Resource를 생성한다.
 * TODO: 이미 존재해서 create를 못하는 경우에 대해서 조회하여 결과 return 하는 코드 추가해야
 *
 * @param user
 * @private
 */
function _createUserAcpResource(user, aeResource) {

  return new Promise(function(resolve, reject) {

    try {
      __createUserACP(user.email, aeResource)

      .then(function(acpObj){
        resolve(acpObj);
      })

      .catch(function(err){
        debug('Fail to create user default ACP resource', err);
        reject(err);
      });


    } catch (ex) {
      debug('Fail to create user default ACP resource', ex);
      reject(ex);
    }
  });
}



/**
 * Expose 'oneM2MManager'
 */
module.exports.listChildResources = _listChildResources;
module.exports.getAeResource = _getAeResource;
module.exports.initializeNewUser = _initializeNewUser;
module.exports.getUserACPResource = _getUserACPResource;
module.exports.getResourceByResourceId = _getResourceByResourceId;
module.exports.deleteDeviceResource = _deleteDeviceResource;

//  deshboard info
module.exports.getTrafficData = _getTrafficData;
module.exports.countAEs = _countAEs;
module.exports.getTotalCINSize = _getTotalCINSize;

//  acpi attribute
module.exports.grantAccessRights = _grantAccessRights;
module.exports.revokeAccessRights = _revokeAccessRights;

//  ACP resource management
module.exports.createNewACPResource = _createNewACPResource;
module.exports.listUserACPResources = _listUserACPResources;
module.exports.addAcrToACP = _addAcrToACP;
module.exports.deleteAcrFromACP = _deleteAcrFromACP;
module.exports.updateAcrToACP = _updateAcrToACP;




module.exports.createUserAeResource = _createUserAeResource;
module.exports.createUserAcpResource = _createUserAcpResource;

