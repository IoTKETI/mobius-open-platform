(function() {
  'use strict';

  angular
    .module('dashboard')
    .directive('dragToMove', DragToMoveDirective)
    .directive('oneKeyEnter', OnKeyEnterDirective)

    .directive('vspaceDraggableVo', VSpaceDraggableVoDirective)
    .directive('vspaceDroppablePanel', VSpaceDroppablePanelDirective)

    .directive('composerDraggableNode', ComposerDraggableNodeDirective)
    .directive('composerDroppablePanel', ComposerDroppablePanelDirective)

    .directive('onoffSwitch', OnoffSwitchDirective)

    // .directive('blockly', BlocklyDirective)

  ;


  DragToMoveDirective.$inject = ['$document'];

  function DragToMoveDirective($document) {
    var directive = {
      restrict: 'A',
      scope: {
        position: '=',
        onDragEnd: '=',
        objectId: '@'
      },
      link: link
    }
    return directive;

    function link(scope, element, attr) {
      var startX = 0, startY = 0, x = scope.position.x || 0, y = scope.position.y || 0;
      var offsetParent = element[0].offsetParent;
      var offsetParentWidth = offsetParent ? offsetParent.clientWidth : 1000, offsetParentHeight = offsetParent ? offsetParent.clientHeight : 1000;

      element.css({
        cursor: 'pointer',
        position: 'absolute'
      });

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);

        offsetParent = element[0].offsetParent;
        offsetParentWidth = offsetParent ? offsetParent.clientWidth : 1000;
        offsetParentHeight = offsetParent ? offsetParent.clientHeight : 1000;
      });

      function mousemove(event) {
        y = Math.min(offsetParentHeight-element[0].clientHeight-10, Math.max( 10, event.pageY - startY ));
        x = Math.min(offsetParentWidth-element[0].clientWidth-10, Math.max( 10, event.pageX - startX ));

        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }

      function mouseup() {

        if(scope.onDragEnd) {
          scope.onDragEnd(x, y, scope.objectId);
        }

        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }
    }
  }


  function OnKeyEnterDirective() {
    var directive = {
      restrict: 'A',
      link: link
    }
    return directive;

    function link(scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$apply(function (){
            scope.$eval(attrs.onKeyEnter);
          });

          event.preventDefault();
        }
      });
    }
  }


  var BLK_COLOR_RULETRIGGER = "#556270";
  var BLK_COLOR_SETATTRIBUTE = "#5BD1C4";
  var BLK_COLOR_GETATTRIBUTE = "#FB5D6C";


  BlocklyDirective.$inject = ['localStorageService'];
  function BlocklyDirective(localStorageService) {
    var directive = {
      restrict: 'A',
      link: link
    }
    return directive;


    function link(scope, element, attrs) {

      function generateGetSensingValue(thingId, attrName) {
        var code = 'enging.getDeviceAttribute(';
        code += '"' + scope.gateway.serial + '", ';
        code += '"' + thingId + '", ';
        code += '"' + attrName + '")';

        return code;
      }

      function generateSetSensingValue(thingId, attrName, value) {
        var code = 'enging.setDeviceAttribute(';
        code += '"' + scope.gateway.serial + '", ';
        code += '"' + thingId + '", ';
        code += '"' + attrName + '", ';
        code += value + ');\n';

        return code;
      }


      // Blockly.HSV_SATURATION = 0.80;// 0 (inclusive) to 1 (exclusive), defaulting to 0.45
      // Blockly.HSV_VALUE = 0.80;// 0 (inclusive) to 1 (exclusive), defaulting to 0.65

      // var workspace = Blockly.inject(element[0],
      //   {toolbox: document.getElementById('toolbox')});

      Blockly.JavaScript.INDENT = "  ";

      Blockly.Blocks['number_value'] = {
        init: function() {
          this.appendDummyInput()
            .appendField("Number")
            .appendField(new Blockly.FieldNumber(2.3, 1, 2, 3), "VALUE");
          this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("default"), "NAME");
          this.setOutput(true, "Number");
          this.setColour(230);
          this.setTooltip("");
          this.setHelpUrl("");
        }
      };

      Blockly.Blocks['get_attribute_from_cin_object'] = {
        init: function() {
          this.appendDummyInput()
            .appendField("Get value of ")
            .appendField(new Blockly.FieldTextInput("default"), "NAME");
          this.appendValueInput("NAME")
            .setCheck(null)
            .appendField("from 'cin' object value");
          this.setOutput(true, null);
          this.setColour(230);
          this.setTooltip("");
          this.setHelpUrl("");
        }
      };

      Blockly.Blocks['read_cin'] = {
        init: function() {
          this.appendDummyInput()
            .appendField("Read latest 'cin' ");
          this.appendValueInput("NAME")
            .setCheck("String")
            .appendField("from 'cnt' with path");
          this.setOutput(true, null);
          this.setColour(230);
          this.setTooltip("");
          this.setHelpUrl("");
        }
      };

      Blockly.Blocks['scheduler_trigger'] = {
        init: function() {
          this.appendDummyInput()
            .appendField("On every")
            .appendField(new Blockly.FieldVariable("item"), "NAME")
            .appendField(new Blockly.FieldDropdown([["Seconds","EVERY_SECONDS"], ["Minutes","OPTIONNAME"], ["Hours","OPTIONNAME"], ["Day","OPTIONNAME"], ["Week","OPTIONNAME"]]), "NAME");
          this.appendStatementInput("NAME")
            .setCheck(null);
          this.setColour(230);
          this.setTooltip("");
          this.setHelpUrl("");
        }
      };

      Blockly.Blocks['onem2m_trigger'] = {
        init: function() {
          this.appendDummyInput()
              .appendField("oneM2M 리소스 감시");
          this.appendDummyInput();
          this.appendValueInput("RESOURCE_PATH")
              .setCheck("String")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("감시할 리소스 (con) 경로");
          this.appendDummyInput()
              .appendField(new Blockly.FieldVariable("con"), "CON_VALUE")
              .appendField("에 'cin' 값이 저장 됨");
          this.appendDummyInput();
          this.appendStatementInput("logic")
              .setCheck(null)
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("로직 추가");
          this.appendValueInput("output")
              .setCheck("output")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("위젯 데이터 선택");
          this.setInputsInline(false);
          this.setColour(330);
       this.setTooltip("");
       this.setHelpUrl("");
        }
      };
      
      Blockly.JavaScript['number_value'] = function(block) {
        var number_value = block.getFieldValue('VALUE');
        var text_name = block.getFieldValue('NAME');
        // TODO: Assemble JavaScript into code variable.
        var code = '...';
        // TODO: Change ORDER_NONE to the correct strength.
        return [code, Blockly.JavaScript.ORDER_NONE];
      };

      Blockly.JavaScript['get_attribute_from_cin_object'] = function(block) {
        var text_name = block.getFieldValue('NAME');
        var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
        // TODO: Assemble JavaScript into code variable.
        var code = '...';
        // TODO: Change ORDER_NONE to the correct strength.
        return [code, Blockly.JavaScript.ORDER_NONE];
      };

      Blockly.JavaScript['read_cin'] = function(block) {
        var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
        // TODO: Assemble JavaScript into code variable.
        var code = '...';
        // TODO: Change ORDER_NONE to the correct strength.
        return [code, Blockly.JavaScript.ORDER_NONE];
      };

      Blockly.JavaScript['scheduler_trigger'] = function(block) {
        var variable_name = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('NAME'), Blockly.Variables.NAME_TYPE);
        var dropdown_name = block.getFieldValue('NAME');
        var statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
        // TODO: Assemble JavaScript into code variable.
        var code = '...;\n';
        return code;
      };

      Blockly.JavaScript['onem2m_trigger'] = function(block) {
        var value_resource_path = Blockly.JavaScript.valueToCode(block, 'RESOURCE_PATH', Blockly.JavaScript.ORDER_ATOMIC);
        var variable_con_value = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('CON_VALUE'), Blockly.Variables.NAME_TYPE);
        var statements_logic = Blockly.JavaScript.statementToCode(block, 'logic');
        var value_output = Blockly.JavaScript.valueToCode(block, 'output', Blockly.JavaScript.ORDER_ATOMIC);
        // TODO: Assemble JavaScript into code variable.
        var code = '...;\n';
        return code;
      };


      Blockly.BlockSvg.START_HAT = true;
      var blocklyArea = document.getElementById('blocklyArea');
      var initialWorkspace = document.getElementById('initialWorkspace');
      var blocklyDiv = element.find('.blockly-workspace')[0];
      var toolbox = document.getElementById('toolbox');

      var options = {
        toolbox : toolbox,
        collapse : false,
        comments : false,
        disable : false,
        maxBlocks : Infinity,
        trashcan : true,
        horizontalLayout : false,
        css : true,
        media : '/blockly/media/',
        rtl : false,
        scrollbars : true,
        sounds : false,
        oneBasedIndex : true,
        grid : {
          spacing : 20,
          length : 1,
          colour : '#888',
          snap : false
        },
        zoom : {
          controls : true,
          wheel : false,
          startScale : 1,
          maxScale : 3,
          minScale : 0.5,
          scaleSpeed : 1.2
        }
      };

      scope.workspace = Blockly.inject(blocklyDiv, options);

      var workspaceText = localStorageService.get('latest-datasource');
      if(workspaceText) {
        scope.workspaceDom = Blockly.Xml.textToDom(workspaceText);
      }

      function myUpdateFunction(event) {
        var xml = Blockly.Xml.workspaceToDom(scope.workspace);

        var blocks = xml.childNodes;
        for(var i=0; i < blocks.length; i++ ) {
          var block = scope.workspace.getBlockById(blocks[i].attributes['id'].value);
          block.svgGroup_.removeClass('blocklyError');
        }



        localStorageService.set('latest-datasource', Blockly.Xml.domToText(xml));



      }
      scope.workspace.addChangeListener(myUpdateFunction);


      var onresize = function(e) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        // var elParent = blocklyArea;
        // var x = 0;
        // var y = 0;
        // do {
        //   x += elParent.offsetLeft;
        //   y += elParent.offsetTop;
        //   elParent = elParent.offsetParent;
        // } while (elParent);
        // // Position blocklyDiv over blocklyArea.
        // blocklyDiv.style.left = x + 'px';
        // blocklyDiv.style.top = y + 'px';
        // blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
        // blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
        Blockly.svgResize(scope.workspace);

        // setTimeout(function(){
        //   Blockly.svgResize(workspace);
        //   }, 5000);

        if (scope.workspaceDom) {
          Blockly.Xml.domToWorkspace(scope.workspaceDom, scope.workspace);
          scope.workspaceDom = null;
        }
      };

      blocklyDiv.addEventListener('resize', onresize, false);

      setTimeout(onresize, 1000);
      // onresize();
      //
      // Blockly.svgResize(workspace);

      function copyTextToClipboard(text) {
        if (!navigator.clipboard) {
          fallbackCopyTextToClipboard(text);
          return;
        }
        navigator.clipboard.writeText(text).then(function() {
          console.log('Async: Copying to clipboard was successful!');
          alert( 'Code generated successfully and copied to clipboard');
        }, function(err) {
          console.error('Async: Could not copy text: ', err);
          alert( 'Code generated successfully BUT failed to copy code to clipboard. try again.');

        });
      }


      scope.resetCode = function() {
        scope.workspace.clear();

        var initialWorkspace = document.getElementById("initialWorkspace");

        /* Load blocks to workspace. */
        Blockly.Xml.domToWorkspace(initialWorkspace, scope.workspace);
      };


      scope.saveCode = function() {
        var xml = Blockly.Xml.workspaceToDom(scope.workspace);
        localStorageService.set('latest-datasource', Blockly.Xml.domToText(xml));
      };

      scope.uploadCode = function() {


        function getInvalidBlocks(xml) {
          var found = false;
          var remove = [];
          var count = xml.childNodes.length;
          for(var i=0; i < count; i++ ) {
            if(!found && xml.childNodes[i].attributes['type'].value === 'datasource_trigger')
              found = true;
            else {
              remove.push(xml.childNodes[i]);
            }
          }

          return remove;
        }



        function removeExcept(xml, remove) {
          if(xml && remove && Array.isArray(remove)) {
            remove.map(function(item){
              xml.removeChild(item);
            });
          }

          return xml;
        }

        function addClass(g, className) {
          var classList = g.classList;
          var index = classList.indexOf(className);
          if(index == -1)
            classList.push(className);
        }

        function removeClass(g, className) {
          var classList = g.classList;
          var index = classList.indexOf(className);
          if(index != -1)
            classList.splice(index, 1);
        }


        var xml = Blockly.Xml.workspaceToDom(scope.workspace);
        var remove = getInvalidBlocks(xml);

        if(remove.length > 0 ) {

          for(var i=0; i < remove.length; i++ ) {
            var block = scope.workspace.getBlockById(remove[i].attributes['id'].value);
            block.svgGroup_.addClass('blocklyError');
            console.log( block );
          }

          var isBoss = confirm("Check red blocks!");

          return;
        }


        xml = removeExcept(xml, remove);

        var workspace = new Blockly.Workspace();
        Blockly.Xml.domToWorkspace(xml, workspace);
        var code = Blockly.JavaScript.workspaceToCode(workspace);



        // Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
        // var code = Blockly.JavaScript.workspaceToCode(scope.workspace);
        //

        var result = 'function executeDatasource(engine) {\n';
        result += code;
        result += '\n';
        result += '}\n';
        result += 'module.exports = executeDatasource';

        console.log( "CODE:", result );
        copyTextToClipboard(result);

      }
    }
  }



  function VSpaceDraggableVoDirective() {

    return {
      restrict: 'A',
      scope: {
        vo: "="
      },
      link: function (scope, element) {
        // this gives us the native JS object
        var el = element[0];

        el.draggable = true;

        el.addEventListener(
          'dragstart',
          function (e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json+keti-comptool-space-item', scope.vo.resourcePath);
            this.classList.add('drag');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragend',
          function (e) {
            this.classList.remove('drag');
            return false;
          },
          false
        );
      }
    }
  }

  function VSpaceDroppablePanelDirective() {
    return {
      scope: {
        drop: '&',
        bin: '='
      },
      link: function(scope, element) {
        // again we need the native object
        var el = element[0];

        el.addEventListener(
          'dragover',
          function(e) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) e.preventDefault();
            this.classList.add('over');

            return false;
          },
          false
        );

        el.addEventListener(
          'dragenter',
          function(e) {
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragleave',
          function(e) {
            this.classList.remove('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'drop',
          function(e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) e.stopPropagation();

            this.classList.remove('over');

            var resourcePath = e.dataTransfer.getData('application/json+keti-comptool-space-item')
            // call the passed drop function
            scope.$apply(function(scope) {
              var fn = scope.drop();
              if ('undefined' !== typeof fn) {
                fn(resourcePath, e.offsetX, e.offsetY);
              }
            });

            return false;
          },
          false
        );
      }
    }
  }



  function ComposerDraggableNodeDirective() {

    return {
      restrict: 'A',
      scope: {
        nodeType: "=",
        nodeData: "="
      },
      link: function (scope, element) {
        // this gives us the native JS object
        var el = element[0];

        el.draggable = true;

        el.addEventListener(
          'dragstart',
          function (e) {
            var node =  {
              nodeType: scope.nodeType,
              nodeData: scope.nodeData
            };

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/json+keti-comptool-composer-item', JSON.stringify(node));
            this.classList.add('drag');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragend',
          function (e) {
            this.classList.remove('drag');
            return false;
          },
          false
        );
      }
    }
  }

  function ComposerDroppablePanelDirective() {
    return {
      scope: {
        drop: '&',
        bin: '='
      },
      link: function(scope, element) {
        // again we need the native object
        var el = element[0];

        el.addEventListener(
          'dragover',
          function(e) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) e.preventDefault();
            this.classList.add('over');

            return false;
          },
          false
        );

        el.addEventListener(
          'dragenter',
          function(e) {
            this.classList.add('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'dragleave',
          function(e) {
            this.classList.remove('over');
            return false;
          },
          false
        );

        el.addEventListener(
          'drop',
          function(e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) e.stopPropagation();

            this.classList.remove('over');

            var node = e.dataTransfer.getData('application/json+keti-comptool-composer-item')
            node = JSON.parse(node);

            // call the passed drop function
            scope.$apply(function(scope) {
              var fn = scope.drop();
              if ('undefined' !== typeof fn) {
                fn(node.nodeType, node.nodeData, e.offsetX, e.offsetY);
              }
            });

            return false;
          },
          false
        );
      }
    }
  }


  function OnoffSwitchDirective() {
    return {
      restrict: 'AE',
      replace: true,
      transclude: true,
      template: function(element, attrs) {
        var html = '';
        html += '<div';
        html +=   ' class="onoff-switch' + (attrs.class ? ' ' + attrs.class : '') + '"';
        html +=   attrs.ngModel ? ' ng-click="' + attrs.disabled + ' ? ' + attrs.ngModel + ' : ' + attrs.ngModel + '=!' + attrs.ngModel + (attrs.ngChange ? '; ' + attrs.ngChange + '()"' : '"') : '';
        html +=   ' ng-class="{ checked:' + attrs.ngModel + ', disabled:' + attrs.disabled + ' }"';
        html +=   '>';
        html +=   '<small></small>';
        html +=   '<input type="checkbox"';
        html +=     attrs.id ? ' id="' + attrs.id + '"' : '';
        html +=     attrs.name ? ' name="' + attrs.name + '"' : '';
        html +=     attrs.ngModel ? ' ng-model="' + attrs.ngModel + '"' : '';
        html +=     ' style="display:none" />';
        html +=     '<span class="onoff-switch-text">'; /*adding new container for switch text*/
        html +=     attrs.on ? '<span class="on">'+attrs.on+'</span>' : ''; /*switch text on value set by user in directive html markup*/
        html +=     attrs.off ? '<span class="off">'+attrs.off + '</span>' : ' ';  /*switch text off value set by user in directive html markup*/
        html += '</div>';
        return html;
      }
    }
  }


})();
