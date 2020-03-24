/**
 * [description]
 *
 *
 *
 *  Resource Monitoring service client
 * 
 */
(function(){
  'use strict';

  angular
    .module('onem2mResourceMonitor')
    .service('resmonService', ResmonService);


  ResmonService.$inject = ['$http', '$rootScope', 'eventService', 'onem2mService'];
  function ResmonService($http, $rootScope, eventService, onem2mService) {


    function ResourceNode(nodeName) {

      this.name = nodeName;
      this.data = null;
      this.discovered = false;
      this.collapsed = true;
      this.parent = null;
      this.children = null;
      this._children = null; 
      this.mapChildren = {};
      this.aryChildren = [];

      this.updated = false;
      this.selected = false;
      this.justupdated = false;

    }

      ResourceNode.INSTANCE_COUNT_LIMIT = 5;

      ResourceNode.prototype.setParent = function(parentNode) {
        this.parent = parentNode; 
      }

      ResourceNode.prototype.appendChild = function(nodeName) {
        if( this.mapChildren[nodeName] )
          return this.mapChildren[nodeName];

        var newNode = new ResourceNode(nodeName);
        newNode.setParent( this );
        if( !this.aryChildren ) {
          this.aryChildren = [];
          this.collapsed = true;
        }

        this.aryChildren.push(newNode);
        this.mapChildren[nodeName] = newNode;

        this.aryChildren.sort(function(a, b){
          //  data가 있을때는 lt로 비교 
          return a.compare(b);
        });

        this.limitInstanceCount();

        return newNode;
      }

      ResourceNode.prototype.compare = function(other) {

        function getLtOrCt(data) {
          var resourceType = _.keys(data)[0];

          if(resourceType == 'm2m:cin') {
            if(data[resourceType].lt)
              return data[resourceType].lt; //  lastModifiedTime
            else
              return data[resourceType].ct;
          }
          else {
            return data[resourceType].ct;
          }
        }

        function localeCompare(a, b) {
          if(a == null && b == null)
            return 0;
          if(a == null)
            return -1;
          if(b == null)
            return 1;

          return a.localeCompare(b);
        }

        //  모두 data가 존재하면 lt로 비교 
        if( this.data && other.data ) {
          var ltLeft = getLtOrCt(this.data);
          var ltRight = getLtOrCt(other.data);

          if(ltLeft && ltRight) {
            var result = ltLeft.localeCompare(ltRight) * -1;
            if( result == 0 )
              return localeCompare(this.name, other.name);
            else
              return result;
          }
          else {
            return localeCompare(this.name, other.name);
          }


        }

        //  모두 data가 존재하지 않으면 
        else if (!this.data && !other.data) {
          return localeCompare(this.name, other.name);
        }

        // 둘 중 하나만 data가 존재하지 않으면 data가 존재하지 않는쪽을 뒤로  
        else if (!this.data) {
          return -1;
        }
        else {
          return 1;
        }

        return 0;
      }

      ResourceNode.prototype.removeChild = function(nodeName, onlyChildList) {
        var node = this.mapChildren[nodeName];
        if( node ) {
          delete this.mapChildren[nodeName];

          var index = this.aryChildren.indexOf(node);
          this.aryChildren.splice(index, 1);

          if(!onlyChildList){
            var nodeData = node.data;
            var resourceType = _.keys(nodeData)[0];
            var resourceId = nodeData[resourceType]['ri'];
            if(resourceId && nodeMap[resourceId])
              delete nodeMap[resourceId];
          }

          return node;
        }
        else {
          return null;
        }
      }

      ResourceNode.prototype.setData = function( nodeData, updated ) {

        this.data = nodeData;
        var resourceType = _.keys(nodeData)[0];
        var resourceId = nodeData[resourceType]['ri'];
        var resourceName = nodeData[resourceType]['rn'];

        var parentId = null;
        if(this.parent)
          parentId = this.parent.getResourceId();

        if(parentId && parentId == resourceId) {
          this.parent.removeChild(resourceName, true);
          return;
        }

        nodeMap[resourceId] = this;

        if(resourceType == 'm2m:cin' || resourceType == 'cin' || resourceType == 'm2m:sub' || resourceType == 'sub')
          this.discovered = true;

        if( updated ) {
          this.updated = true;
          this.justupdated = true;

          setTimeout(function(node){
            node.justupdated = false;
            eventService.emit($rootScope, 'monitoring.update.resource', node);
          }, 5000, this);
        }

        if(this.parent)
          this.parent.limitInstanceCount();
        this.limitInstanceCount();
      }

      ResourceNode.prototype.clearUpdated = function() {
        this.updated = false; 
      };

      ResourceNode.prototype.setSelected = function(selected) {
        this.selected = selected; 
      };
      ResourceNode.prototype.isSelected = function() {
        return this.selected;
      };

      ResourceNode.prototype.find = function(nodeName) {
        return this.mapChildren[nodeName];
      }

      ResourceNode.prototype.collapse = function() {
        if( this.collapsed || !this.discovered)
          return;

        if(this.aryChildren)
          this.aryChildren.forEach( function(d){ d.collapse(); } );

        this.collapsed = true;
        this._children = this.aryChildren;
        this.children = null;
      }

      ResourceNode.prototype.expand = function() {

        if( !this.discovered ) {
          var aryPath = [];
          var node = this;
          while( node != null ) {
            aryPath.push(node.getName());

            node = node.getParent();
          };

          var resourcePath = '/' + aryPath.reverse().join('/');

          var args = {
            resourcePath: resourcePath,
            node: this,
            expand: true
          };

          eventService.emit($rootScope, 'monitoring.discover.resource', args);

          return;
        }

        if( !this.collapsed ) {
          return;
        }
        else {
          this.collapsed = false;
          this.children = this.aryChildren;
          this._children = null;
        }
      }


      ResourceNode.prototype.getName = function() {
        return this.name;
      }

      ResourceNode.prototype.getData = function() {
        return this.data;
      }

      ResourceNode.prototype.getResourceId = function() {

        if(!this.data)
          return null;

        var resourceType = _.keys(this.data)[0];
        return this.data[resourceType].ri;
      }

      ResourceNode.prototype.getTypeName = function() {
        if( this.data ) {
          var resourceType = _.keys(this.data)[0];
          var resourceTypeCode = OneM2M.Resource.getTypeCode(resourceType);
          if( resourceTypeCode ) {
            if( resourceType.startsWith('m2m:'))
              resourceType = resourceType.substring(4);

            return resourceType;
          }
          else
            return "";
        }

        return "";
      }

      ResourceNode.prototype.getTypeCode = function() {
        if( this.data ) {
          var resourceType = _.keys(this.data)[0];
          var resourceTypeCode = OneM2M.Resource.getTypeCode(resourceType);

          return resourceTypeCode;
        }

        return "";
      }

      ResourceNode.prototype.getParent = function() {
        return this.parent;
      }

      ResourceNode.prototype.isCollapsed = function() {
        return this.collapsed;
      }

      ResourceNode.prototype.isDiscovered = function() {
        return this.discovered;
      }

      ResourceNode.prototype.setDiscovered = function(discovered) {
        this.discovered = discovered;
      }

      ResourceNode.prototype.hasChildren = function() {
        if( this.aryChildren && this.aryChildren.length > 0 )
          return true;

        return false;
      }


      ResourceNode.prototype.limitInstanceCount = function(recursive) {

        var typeCode = this.getTypeCode();
        var instanceTypeCode = '';

        switch( typeCode ) {
          case '3' :
            instanceTypeCode = "4";
            break;

          case '25' :
            instanceTypeCode = "26";
            break;
        }

        if( instanceTypeCode != '' ) {
          //  current node가 CNT와 TS인 경우 child 중에서 CI와 TSI를 5개까지만 유지
          var nInstanceCount = 0;
          var toBeDeleted = [];
          for(var i=0; i < this.aryChildren.length; i++) {
            if( this.aryChildren[i].getTypeCode() == instanceTypeCode ) {

              nInstanceCount ++;
              if( nInstanceCount > 5 ) { //ResourceNode.INSTANCE_COUNT_LIMIT ) {
                toBeDeleted.push( this.aryChildren[i].getName() );
              }
            }
          }

          for(var j=0; j < toBeDeleted.length; j++) {
            var removed = this.removeChild( toBeDeleted[j] );
          }
        }

        if( recursive)
          this.aryChildren.forEach(function(d){
            d.limitInstanceCount(true);
          });
      }




    var rootNode = null;
    var baseResourcePath = "";
    var nodeMap = {};

    var services = {
      "initResourceTree": initResourceTree,
      "getRoot": getRoot,
      "buildNode": buildNode,
      "setNodeData": setNodeData,
      "findNode": findNode,
      "setInstanceDisplayCount": setInstanceDisplayCount,
      "getInstanceDisplayCount": getInstanceDisplayCount,
      "setAnimation": setAnimation,
      "getAnimation": getAnimation,
      "getSysInfo" : _getSysInfo
    };
    return services;


    function initResourceTree( path ) {
      baseResourcePath = path;
      nodeMap = {};
      var aryPath = path.split( '/' );

      if( aryPath.length > 0 ) {
        aryPath.splice(0, 1);
      }

      rootNode = new ResourceNode(aryPath[0]);
      var parentNode = rootNode;
      for( var i=1; i<aryPath.length; i++) {
        parentNode = parentNode.appendChild( aryPath[i] );
      }
    }

    function getRoot() {
      return rootNode;
    }

    function buildNode(path) {

      //  check SP relative or absolute
      //  SP relative : {csebase}/{ae}/...
      //  Absolute : /{csebase}/{ae}/..

      var spRel = false;
      if (!(path + "/").startsWith(baseResourcePath + "/")) {
        if (('/' + path + '/').startsWith(baseResourcePath + '/')) {
          //  make absolute path
          path = '/' + path;
        }
        else
          return;
      }

      var aryPath = path.split( '/' );
      if( aryPath.length > 0 ) {
        aryPath.splice(0, 1);
      }      

      var parentNode = rootNode;
      for( var i=1; i<aryPath.length; i++) {
        var node = parentNode.find( aryPath[i] );
        if( !node ) {
          node = parentNode.appendChild( aryPath[i] );
        }
        parentNode = node;
      }

    }

    function setNodeData(nodeData, path, updated) {
      //  TODO check parameter
      //    nodeData is a oneM2M Resource object

      var resourcePathOrId = null;
      if( nodeData == null && path ) {
        resourcePathOrId = path;
      }
      else {
        var resourceType = _.keys(nodeData)[0];

        if( resourceType == 'm2m:cb' ) {
          rootNode.setData(nodeData);
          return rootNode;
        }
        else {
          resourcePathOrId = nodeData[resourceType]['ri'];
        }
      }

      var resourceNode = findNode(resourcePathOrId);
      if( resourceNode ) {
        //  resource path or id로 찾을 수 있는 경우 
         
        resourceNode.setData(nodeData, updated);

        return resourceNode; 
      }
      else {
        //  parent를 찾아서 rn으로 node 추가하고 data setting해서 return 
        var resourceType = _.keys(nodeData)[0];
        var parentId = nodeData[resourceType]['pi'];
        var nodeName = nodeData[resourceType]['rn'];

        var parentNode = findNode(parentId);
        if( ! parentNode ) {
          return null;
        }
        else {
          var resourceNode = parentNode.find(nodeName);
          if( resourceNode ) {
            resourceNode.setData( nodeData, updated );
          }
          else {
            var newNode = parentNode.appendChild(nodeName);
            newNode.setData( nodeData, updated );

            resourceNode = newNode;
          }
          return resourceNode;
        }
        return null;
      }
    }


    function findNode(pathOrId) {
      if( pathOrId.indexOf( '/' ) == -1 ) {
        //  unstructured id -> ri map 으로 검색 
        if( nodeMap[pathOrId] )
          return nodeMap[pathOrId];
        else 
          return null;
      }
      else {
        var aryPath = pathOrId.split( '/' );

        if( aryPath.length > 0 ) {
          aryPath.splice(0, 1);
        }      

        var tempNode = rootNode;
        for( var i=1; i<aryPath.length; i++) {
          var node = tempNode.find( aryPath[i] );
          if( !node ) {
            return null;
          }
          tempNode = node;
        }
        return tempNode;        
      }
    }


    function setInstanceDisplayCount(count) {
      ResourceNode.INSTANCE_COUNT_LIMIT = count;

      if( rootNode ) {
        rootNode.limitInstanceCount(true);

        eventService.emit($rootScope, 'monitoring.update.resource', rootNode);
      }
    }

    function getInstanceDisplayCount() {
      return ResourceNode.INSTANCE_COUNT_LIMIT;
    }

    function setAnimation(animation){
      eventService.emit($rootScope, 'monitoring.update.animation', animation);
    }
    function getAnimation(){

    }
    function _getSysInfo() {
      return new Promise(function(resolve, reject) {
        $http({
          url : "/info",
          method : "get"
        })
          .then(function(res){
            resolve(res.data);
          })
          .catch(function(err){
            reject(err);
          })
      })
    }
  }

})();