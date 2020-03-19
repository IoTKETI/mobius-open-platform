angular
.module('mobiusPortal')
.directive('mobiusDeviceList', mobiusDeviceList)
.directive('mobiusBrowser', mobiusBrowser)
.directive('mobiusBrowserItems', mobiusBrowserItems)
.directive('deviceListItem', deviceListItem)
;

//Prevent click if href="#"
function mobiusDeviceList() {
  var directive = {
    restrict: "A",
    templateUrl: "_devices/directive.mobius.device.list.html",
    scope: {
      deviceList: "=",
      onItemSelected: "="
    }
  }
  return directive;
}

//Bootstrap Collapse
function mobiusBrowser() {
  var directive = {
    restrict: "A",
    templateUrl: "_devices/directive.mobius.browser.html",
    scope: {
      browserData: "=",
      selectionDepth: "=",
      onItemSelected: "="
    }
  }
  return directive;
}


function mobiusBrowserItems() {
  var directive = {
    restrict: "A",
    templateUrl: "_devices/directive.mobius.browser.items.html",
    scope: {
      browseDepth: "=",
      resourceList: "=",
      onItemSelected: "="
    },
    link: _browserItemLink
  }
  return directive;



  function __parseOnem2mDate(datetime) {
    var dateTimeArray = datetime.split('T');
    if( dateTimeArray.length != 2 )
      throw new Error('invalid date time')

    if(!/^(\d){8}$/.test(dateTimeArray[0])) return "invalid date";
    if(!/^(\d){6}$/.test(dateTimeArray[1])) return "invalid time";

    var y = parseInt(dateTimeArray[0].substr(0,4)),
      m = parseInt(dateTimeArray[0].substr(4,2)),
      d = parseInt(dateTimeArray[0].substr(6,2));
    var h = parseInt(dateTimeArray[1].substr(0,2)),
      mn = parseInt(dateTimeArray[1].substr(2,2)),
      s = parseInt(dateTimeArray[1].substr(4,2));
    return new Date(Date.UTC(y,m-1,d,h,mn,s));
  }


  function _browserItemLink(scope, element, attrs) {

    scope.$watch('resourceList', function(newValue){
      if(newValue && newValue.resources) {
        newValue.resources.map(function(resource){
          try {
            resource.updatedAt = __parseOnem2mDate(resource.updatedAt)
          }
          catch( ex ) {
            resource.updatedAt = null;
          }
        });
      }

    });

    scope.resourceItemClass = function(item) {
      var classList = [];
      if(item.selected)
        classList.push(item.selected);

      if(item.updatedAt) {
        if( (Date.now() - item.updatedAt) <= (1000 * 60 * 60 * 24) )
          classList.push( 'updated' );
      }

      return classList;
    }

  }



}






function deviceListItem() {
  var directive = {
    restrict: "AE",
    templateUrl: "_devices/directive.device.list.item.html",
    scope: {
      device: "=",
      commandHandler: "=",
    },
    link: _link
  }
  return directive;



  function _link(scope,  element, attrs) {
    var CARD_HEADER_COLOR_CLASSES = [
      'bg-primary',
      'bg-info',
      'bg-warning',
      'bg-danger',
      'bg-success'
    ];

    scope.headerColorClass = function() {
      var code = scope.device.deviceInfo.nickname.charCodeAt(0);

      return CARD_HEADER_COLOR_CLASSES[code % CARD_HEADER_COLOR_CLASSES.length];
    };
  }
}
