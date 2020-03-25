angular
.module('mobiusPortal')
.directive('acopSwitch', AcopSwitchDirective)
.directive('acop', AcopDirective)
;

//Prevent click if href="#"
function AcopSwitchDirective() {
  var directive = {
    restrict: "E",
    templateUrl: "_acp/acp.directives.acop-switch.html",
    link: _link,
    scope: {
      acp: "=",
      acr: "=",
      onValueChanged: "="
    }
  }
  return directive;


  function _link(scope, element, attrs) {
    scope.acOperation = [false, false, false, false, false, false];
    var acpValue = parseInt(scope.acr.acop);

    scope.acOperation.map(function(item, index){
      var mask = 0x01 << index;
      if((acpValue & mask) == mask)
        scope.acOperation[index] = true;
      else
        scope.acOperation[index] = false;
    });

    scope.toggleAcop = _toggleAcop;

    function _toggleAcop(index) {
      scope.acOperation[index] = !scope.acOperation[index];

      if(scope.onValueChanged)
        scope.onValueChanged(scope.acp, scope.acr, __getAcop(scope.acOperation));
    }

    function __getAcop(acOperation) {
      var acop = 0;
      acOperation.map(function(item, index){
        if(item) {
          acop += (0x01 << index);
        }
      });

      return acop;
    }
  }
}



//Prevent click if href="#"
function AcopDirective() {
  var directive = {
    restrict: "E",
    templateUrl: "_acp/acp.directives.acop.html",
    link: _link,
    scope: {
      acr: "="
    }
  }
  return directive;

  function _link(scope, element, attrs) {
    scope.acOperation = [false, false, false, false, false, false];
    var acpValue = parseInt(scope.acr.acop);

    scope.acOperation.map(function(item, index){
      var mask = 0x01 << index;
      if((acpValue & mask) == mask)
        scope.acOperation[index] = true;
      else
        scope.acOperation[index] = false;
    });

    scope.labelColorClass = function(index) {
      var result = [];

      if(scope.acOperation[index]) {
        result.push('on');
      }
      else {
        result.push('off');
      }

      if(index < 4) {
        result.push('acop-crud');
      }
      else {
        result.push('acop-nd');
      }

      return result;
    }
  }
}
