(function() {
  'use strict';


  angular
    .module('dashboard')
    .controller('datasourceController', DatasourceController)
  ;

  DatasourceController.$inject = ['$scope', '$window', '$state', '$stateParams', '$mdDialog', 'apiService', 'notificationService', 'localStorageService' ];

  function DatasourceController($scope, $window, $state, $stateParams, $mdDialog, apiService, notificationService, localStorageService ) {

    var TRIGGER_BLOCK_TYPES = ['onem2m_trigger', 'scheduler_trigger'];


    $scope.init = function () {
      $scope.mode = $stateParams.mode;
      $scope.widgetType = $stateParams.widgetType;
      $scope.widgetId = $stateParams.widgetId;
      $scope.showCodeViewer = true;

      initCustomBlocks();

      if($scope.widgetId) {
        apiService.widget.get($scope.widgetId)
          .then(function(widget){
            $scope.$apply(function(){
              $scope.widget = widget;

              if(widget.workspace == null) {
                var xmlString = getInitialWorkspaceXml($scope.widgetType);
                if(xmlString)
                  xmlString = xmlString.outerHTML;
                else 
                  xmlString = '';

                  $scope.widget.workspace = xmlString;
              }

              initCanvas();
            });
          })
      }
      else {
        var xmlString = getInitialWorkspaceXml($scope.widgetType);
        if(xmlString)
          xmlString = xmlString.outerHTML;
        else 
          xmlString = '';

        $scope.widget = {
          'widgetType': $scope.widgetType,
          'title': "New widget",
          'width': 1, 
          'height': 1,
          'workspace': xmlString
        };

        initCanvas();
      }
    };

    function getInitialWorkspaceXml(type) {
      return document.getElementById('initialWorkspace_' + type);
    }

    function initCustomBlocks() {
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
          this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField(new Blockly.FieldDropdown([["Seconds","EVERY_SECONDS"], ["Minutes","EVERY_MINITES"], ["Hours","ELERY_HOURS"], ["Days","EVERY_DAYS"], ["Weeks","EVERY_WEEKS"]]), "SCHECULE_TYPE")
          this.appendStatementInput("SUB_CODE")
            .setCheck(null);
          this.setColour(230);
          this.setTooltip("");
          this.setHelpUrl("");
        }
      };


      Blockly.Blocks['datasource_map_output'] = {
        init: function() {
          this.appendDummyInput()
            .appendField("Build MAP data");
          this.appendValueInput("FIELD_1")
            .setCheck("Number")
            .appendField(new Blockly.FieldTextInput("FIELD_1_NAME"), "FIELD_1_NAME");
          this.appendValueInput("FIELD_2")
            .setCheck("Number")
            .appendField(new Blockly.FieldTextInput("FIELD_2_NAME"), "FIELD_2_NAME");
          this.appendValueInput("FIELD_3")
            .setCheck("Number")
            .appendField(new Blockly.FieldTextInput("FIELD_3_NAME"), "FIELD_3_NAME");
          this.setPreviousStatement(true, null);
          this.setColour(230);
          this.setTooltip("");
          this.setHelpUrl("");
        }
      };
      Blockly.Blocks['onem2m_trigger'] = {
        init: function() {
          this.appendDummyInput()
              .appendField("oneM2M ContentInstance listener");
          this.appendDummyInput();
          this.appendValueInput("RESOURCE_PATH")
              .setCheck("String")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("Target contaier path");
          this.appendDummyInput()
              .appendField("Set 'con' value of 'cin' resource to ")
              .appendField(new Blockly.FieldVariable("con"), "CON_VALUE")
              .appendField(" variable");
          this.appendDummyInput();
          this.appendStatementInput("logic")
              .setCheck(null)
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("Progam logic");
          this.appendValueInput("output")
              .setCheck(["output", "Array"])
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("Widget data output");
          this.setInputsInline(false);
          this.setColour(330);
       this.setTooltip("");
       this.setHelpUrl("");
        }
      };
      
      Blockly.Blocks['output_controlpanel'] = {
        init: function() {
          this.appendDummyInput()
              .setAlign(Blockly.ALIGN_CENTRE)
              .appendField("파이 차트 데이터");
          this.appendDummyInput()
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("");
          this.appendValueInput("LABEL_1")
              .setCheck("String")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("영역 1 레이블");
          this.appendValueInput("VALUE_1")
              .setCheck("Number")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("값");
          this.appendDummyInput()
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("");
          this.appendValueInput("LABEL_2")
              .setCheck("String")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("영역 2 레이블");
          this.appendValueInput("VALUE_2")
              .setCheck("Number")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("값");
          this.appendDummyInput()
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("");
          this.appendValueInput("LABEL_3")
              .setCheck("String")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("영역 3 레이블");
          this.appendValueInput("VALUE_3")
              .setCheck("Number")
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField("값");
          this.setInputsInline(false);
          this.setOutput(true, "output");
          this.setColour(230);
       this.setTooltip("파이차트 데이터");
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

      Blockly.JavaScript['datasource_map_output'] = function(block) {
        var text_field_1_name = block.getFieldValue('FIELD_1_NAME');
        var value_field_1 = Blockly.JavaScript.valueToCode(block, 'FIELD_1', Blockly.JavaScript.ORDER_ATOMIC);
        var text_field_2_name = block.getFieldValue('FIELD_2_NAME');
        var value_field_2 = Blockly.JavaScript.valueToCode(block, 'FIELD_2', Blockly.JavaScript.ORDER_ATOMIC);
        var text_field_3_name = block.getFieldValue('FIELD_3_NAME');
        var value_field_3 = Blockly.JavaScript.valueToCode(block, 'FIELD_3', Blockly.JavaScript.ORDER_ATOMIC);
        // TODO: Assemble JavaScript into code variable.
        var code = 'var __map_data__ = [\n';
        code += '  {"title": "' + text_field_1_name + '", "value" : ' + value_field_1 + '},\n';
        code += '  {"title": "' + text_field_2_name + '", "value" : ' + value_field_2 + '},\n';
        code += '  {"title": "' + text_field_3_name + '", "value" : ' + value_field_3 + '}\n';
        code += ']\n';
        code += '__engine__.updateDatasourceMapOutput(datasourceId, __map_data__);\n';

        return code;
      };
    }
    Blockly.JavaScript['onem2m_trigger'] = function(block) {
      var value_resource_path = Blockly.JavaScript.valueToCode(block, 'RESOURCE_PATH', Blockly.JavaScript.ORDER_ATOMIC);
      var variable_con_value = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('CON_VALUE'), Blockly.Variables.NAME_TYPE);
      var statements_logic = Blockly.JavaScript.statementToCode(block, 'logic');
      var value_output = Blockly.JavaScript.valueToCode(block, 'output', Blockly.JavaScript.ORDER_ATOMIC);
      // TODO: Assemble JavaScript into code variable.
      var code = '// MQTT EVENT Trigger for ' + value_resource_path + '\n';
      code += 'function __executeOneM2MTriggerHandler(_widgetId_, _params_) {\n';
      code += '  ' + variable_con_value + ' = _params_;\n';
      code += statements_logic + '\n';
      code += '  return ' + value_output + '\n';

      code += '}\n'
      code += 'module.exports = __executeOneM2MTriggerHandler;';

      return code;
    };
    
    Blockly.JavaScript['output_controlpanel'] = function(block) {
      var value_label_1 = Blockly.JavaScript.valueToCode(block, 'LABEL_1', Blockly.JavaScript.ORDER_ATOMIC);
      var value_value_1 = Blockly.JavaScript.valueToCode(block, 'VALUE_1', Blockly.JavaScript.ORDER_ATOMIC);
      var value_label_2 = Blockly.JavaScript.valueToCode(block, 'LABEL_2', Blockly.JavaScript.ORDER_ATOMIC);
      var value_value_2 = Blockly.JavaScript.valueToCode(block, 'VALUE_2', Blockly.JavaScript.ORDER_ATOMIC);
      var value_label_3 = Blockly.JavaScript.valueToCode(block, 'LABEL_3', Blockly.JavaScript.ORDER_ATOMIC);
      var value_value_3 = Blockly.JavaScript.valueToCode(block, 'VALUE_3', Blockly.JavaScript.ORDER_ATOMIC);
      // TODO: Assemble JavaScript into code variable.
      var code = 'var __dataset__ = [\n';
      code += '  {"title": ' + value_label_1 + ', "value" : ' + value_value_1 + '},\n';
      code += '  {"title": ' + value_label_2 + ', "value" : ' + value_value_2 + '},\n';
      code += '  {"title": ' + value_label_3 + ', "value" : ' + value_value_3 + '},\n';
      code += ']\n';
      code += 'return __dataset__;\n';

      return [code, Blockly.JavaScript.ORDER_ATOMIC];
    };



    Blockly.Blocks['get_property'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("in JSON Object");
        this.appendValueInput("OBJECT")
            .setCheck(null)
            .setAlign(Blockly.ALIGN_RIGHT);
        this.appendDummyInput()
            .appendField("get property ")
            .appendField(new Blockly.FieldTextInput("property_name"), "PROPERTY_NAME");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(330);
     this.setTooltip("get property value from object");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['get_property'] = function(block) {
      var text_property_name = block.getFieldValue('PROPERTY_NAME');
      var value_object = Blockly.JavaScript.valueToCode(block, 'OBJECT', Blockly.JavaScript.ORDER_ATOMIC);
      // TODO: Assemble JavaScript into code variable.

      var code = value_object + '["' + text_property_name + '"]';
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_ATOMIC];
    };


    /**
     * gauge data block
     */

    Blockly.Blocks['gauge_data'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("images/svgs/tachometer-alt.svg", 15, 15, { alt: "*", flipRtl: "FALSE" }))
            .appendField("Gauge data");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("◻︎ MIN")
            .appendField(new Blockly.FieldTextInput("0"), "MIN_VALUE")
            .appendField("~")
            .appendField(new Blockly.FieldTextInput("100"), "MAX_VALUE")
            .appendField("MAX");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("◻︎ UNIT")
            .appendField(new Blockly.FieldTextInput("%"), "UNITS");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("");
        this.appendValueInput("NAME")
            .setCheck("String")
            .appendField("◻︎ NAME");
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("◻︎ VALUE");
        this.setOutput(true, "output");
        this.setColour(65);
     this.setTooltip("Gauge chart data");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['gauge_data'] = function(block) {
      var text_min_value = block.getFieldValue('MIN_VALUE') || 0;
      var text_max_value = block.getFieldValue('MAX_VALUE') || 10;
      var text_units = block.getFieldValue('UNITS') || '';
      var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC) || '""';
      var value_value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC) || 'null';
      // {
      //    data_type: 'gauge_data', /* mandatory */
      //    name: NAME, /* mandatory */
      //    value: VALUE, /* mandatory */
      //    units: UNITS, /* optional, default % */
      //    min: MIN_VALUE, /* optional, default 0 */
      //    min: MAX_VALUE, /* optional, default 100 */
      // }
      var code = '{\n';
      code += '  "dataType": "gauge_data",\n';
      code += '  "name": ' + value_name + ',\n';
      code += '  "value": parseFloat(' + value_value + '),\n';
      code += '  "units": "' + text_units + '",\n';
      code += '  "min": ' + text_min_value + ',\n';
      code += '  "max": ' + text_max_value + '\n';
      code += '}\n';

      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_ATOMIC];
    };



    /**
     * progress data block
     */
    Blockly.Blocks['progress_data'] = {
      init: function() {
        this.appendDummyInput()
        .appendField(new Blockly.FieldImage("images/svgs/list-alt.svg", 15, 15, { alt: "*", flipRtl: "FALSE" }))
        .appendField("Progress data");
        this.appendDummyInput()
            .appendField("");
        this.appendValueInput("NAME")
            .setCheck("String")
            .appendField("◻︎ NAME");
        this.appendValueInput("VALUE")
            .setCheck("Number")
            .appendField("◻︎ VALUE");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("◻︎ UNIT")
            .appendField(new Blockly.FieldTextInput("%"), "UNITS");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("◻︎ COLOR")
            .appendField(new Blockly.FieldDropdown([["BLUE","primary"], ["ORANGE","warn"], ["PINK","accent"]]), "COLOR");
        this.setOutput(true, "progress_data");
        this.setColour(65);
     this.setTooltip("Progress data");
     this.setHelpUrl("");
      }
    };
    
    Blockly.JavaScript['progress_data'] = function(block) {
      var value_name = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC);
      var value_value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
      var text_units = block.getFieldValue('UNITS');
      var dropdown_color = block.getFieldValue('COLOR');
      // {
      //    data_type: 'gauge_data', /* mandatory */
      //    name: NAME, /* mandatory */
      //    value: VALUE, /* mandatory */
      //    units: UNITS, /* optional, default % */
      //    min: MIN_VALUE, /* optional, default 0 */
      //    min: MAX_VALUE, /* optional, default 100 */
      // }
      var code = '{\n';
      code += '  "dataType": "progress_data",\n';
      code += '  "name": ' + value_name + ',\n';
      code += '  "value": parseFloat(' + value_value + '),\n';
      code += '  "units": "' + text_units + '",\n';
      code += '  "color": "' + dropdown_color + '"\n';
      code += '}\n';
      // TODO: Change ORDER_NONE to the correct strength.
      return [code, Blockly.JavaScript.ORDER_ATOMIC];
    };



    Blockly.Blocks['simple_data_group'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("https://www.gstatic.com/codesite/ph/images/star_on.gif", 15, 15, { alt: "*", flipRtl: "FALSE" }))
            .appendField("Simple data group");
        this.appendValueInput("NAME")
            .setCheck("gauge_data");
        this.setOutput(true, null);
        this.setColour(230);
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };



    var SIMPLE_DATA_GROUP_EXTENSION = function() {
      // Add the quote mixin for the itemCount_ = 0 case.
      this.mixin(Blockly.Constants.Text.QUOTE_IMAGE_MIXIN);
      // Initialize the mutator values.
      this.itemCount_ = 1;
      this.updateShape_();
      // Configure the mutator UI.
      this.setMutator(new Blockly.Mutator(['simple_data_group_item']));
    };

    /**
     * Mixin for mutator functions in the 'simple_data_group' extension.
     */
    var SIMPLE_DATA_GROUP_MUTATOR_MIXIN = {
      /**
       * Create XML to represent number of text inputs.
       * @return {!Element} XML storage element.
       * @this {Blockly.Block}
       */
      mutationToDom: function() {
        var container = Blockly.utils.xml.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
      },
      /**
       * Parse XML to restore the text inputs.
       * @param {!Element} xmlElement XML storage element.
       * @this {Blockly.Block}
       */
      domToMutation: function(xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
      },
      /**
       * Populate the mutator's dialog with this block's components.
       * @param {!Blockly.Workspace} workspace Mutator's workspace.
       * @return {!Blockly.Block} Root block in mutator.
       * @this {Blockly.Block}
       */
      decompose: function(workspace) {
        var containerBlock = workspace.newBlock('simple_data_group_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
          var itemBlock = workspace.newBlock('simple_data_group_item');
          itemBlock.initSvg();
          connection.connect(itemBlock.previousConnection);
          connection = itemBlock.nextConnection;
        }
        return containerBlock;
      },
      /**
       * Reconfigure this block based on the mutator dialog's components.
       * @param {!Blockly.Block} containerBlock Root block in mutator.
       * @this {Blockly.Block}
       */
      compose: function(containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        while (itemBlock) {
          connections.push(itemBlock.valueConnection_);
          itemBlock = itemBlock.nextConnection &&
              itemBlock.nextConnection.targetBlock();
        }
        // Disconnect any children that don't belong.
        for (var i = 0; i < this.itemCount_; i++) {
          var connection = this.getInput('ADD' + i).connection.targetConnection;
          if (connection && connections.indexOf(connection) == -1) {
            connection.disconnect();
          }
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
          Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
        }
      },
      /**
       * Store pointers to any connected child blocks.
       * @param {!Blockly.Block} containerBlock Root block in mutator.
       * @this {Blockly.Block}
       */
      saveConnections: function(containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock) {
          var input = this.getInput('ADD' + i);
          itemBlock.valueConnection_ = input && input.connection.targetConnection;
          i++;
          itemBlock = itemBlock.nextConnection &&
              itemBlock.nextConnection.targetBlock();
        }
      },
      /**
       * Modify this block to have the correct number of inputs.
       * @private
       * @this {Blockly.Block}
       */
      updateShape_: function() {
        if (this.itemCount_ && this.getInput('EMPTY')) {
          this.removeInput('EMPTY');
        } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
          this.appendDummyInput('EMPTY')
              .appendField(this.newQuote_(true))
              .appendField(this.newQuote_(false));
        }
        // Add new inputs.
        for (var i = 0; i < this.itemCount_; i++) {
          if (!this.getInput('ADD' + i)) {
            var input = this.appendValueInput('ADD' + i);
            if (i == 0) {
              input.appendField(Blockly.Msg['TEXT_JOIN_TITLE_CREATEWITH']);
            }
          }
        }
        // Remove deleted inputs.
        while (this.getInput('ADD' + i)) {
          this.removeInput('ADD' + i);
          i++;
        }
      }
    };


    


    function copyTextToClipboard(text) {
      if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
      }
      navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
        // alert( 'Code generated successfully and copied to clipboard');
      }, function(err) {
        console.error('Async: Could not copy text: ', err);
        alert( 'Code generated successfully BUT failed to copy code to clipboard. try again.');

      });
    }



    function initCanvas() {
      Blockly.BlockSvg.START_HAT = true;
      var blocklyArea = document.getElementById('blocklyArea');
      var blocklyDiv = blocklyArea.querySelector('.blockly-workspace');
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

      $scope.workspace = Blockly.inject(blocklyDiv, options);

      var workspaceText = $scope.widget.workspace;
      if(workspaceText) {
        $scope.workspaceDom = Blockly.Xml.textToDom(workspaceText);
      }



      function updateSourceCode(event) {
        //  workspace XML 생성 
        var xml = Blockly.Xml.workspaceToDom($scope.workspace);

        var workspace = new Blockly.Workspace();
        Blockly.Xml.domToWorkspace(xml, workspace);
        var code = Blockly.JavaScript.workspaceToCode(workspace);
  
        $scope.$apply(function(){
          $scope.widgetCode = code;
        });
      }
      
      $scope.workspace.addChangeListener(updateSourceCode);


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
        Blockly.svgResize($scope.workspace);

        // setTimeout(function(){
        //   Blockly.svgResize(workspace);
        //   }, 5000);

        if ($scope.workspaceDom) {
          Blockly.Xml.domToWorkspace($scope.workspaceDom, $scope.workspace);
          $scope.workspaceDom = null;
        }
      };

      blocklyDiv.addEventListener('resize', onresize, false);

      setTimeout(onresize, 100);
    }

    $scope.resetCode = function() {
      $scope.workspace.clear();

      var initialWorkspace = Blockly.Xml.textToDom($scope.widget.workspace);

      /* Load blocks to workspace. */
      Blockly.Xml.domToWorkspace(initialWorkspace, $scope.workspace);
      
    };


    $scope.closeEditor = function() {
      $window.history.back()
    };

    var originatorEv = null;
    $scope.openSizeSelectionMenu = function($mdMenu, ev) {
      $scope.sizeButtonPosition = {
        row: $scope.widget.width,
        col: $scope.widget.height
      };

      originatorEv = ev;
      $mdMenu.open(ev);
    };

    $scope.sizeButtonPosition = {
      row: 0,
      col: 0
    };

    $scope.getSizeButtonHoverClass = function(row, col) {
      var result = [];

      if($scope.widget && $scope.widget.height && $scope.widget.width) {
        if(row == $scope.widget.height && col == $scope.widget.width)
          result.push('current');
      }

      if(row <= $scope.sizeButtonPosition.row && col <= $scope.sizeButtonPosition.col)
        result.push('mouseover');
      
      return result;
    };
    
    $scope.onMouseoverSizeButton = function(row, col) {
      $scope.sizeButtonPosition = {
        row: row,
        col: col
      };
    };
    $scope.onMouseoverSizeButton = function(row, col) {
      $scope.sizeButtonPosition = {
        row: row,
        col: col
      };
    };
    $scope.onClickSizeButton = function(row, col) {
      $scope.widget.width = col;
      $scope.widget.height = row;
    };


    $scope.togglerCodeViewer = function() {
      $scope.showCodeViewer = !$scope.showCodeViewer;
      setTimeout(function(){
        Blockly.svgResize($scope.workspace);
      }, 100);
      
    };


    $scope.saveCode = function() {

      function getInvalidBlocks(xml) {
        var found = false;
        var remove = [];
        var count = xml.childNodes.length;
        for(var i=0; i < count; i++ ) {
          if(!found && TRIGGER_BLOCK_TYPES.indexOf(xml.childNodes[i].attributes['type'].value) != -1)
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

      function getTriggerBlockInfo(triggerNode) {
        var result = {};
        result["type"] = triggerNode.attributes['type'].value;
        result["output"] = xml.querySelector('block > value[name="output"] > block').attributes['type'].value;

        switch(result["type"]) {
          case 'onem2m_trigger':
            result["resourcePath"] = xml.querySelector('block[type="onem2m_trigger"] > value[name="RESOURCE_PATH"]').textContent;
            break;
        }

        return result;
      }


      //  workspace XML 생성 
      var xml = Blockly.Xml.workspaceToDom($scope.workspace);

      //  에러 표시를 모두 삭제 
      var blocks = xml.childNodes;
      for(var i=0; i < blocks.length; i++ ) {
        var block = $scope.workspace.getBlockById(blocks[i].attributes['id'].value);
        block.svgGroup_.removeClass('blocklyError');
      }

      //  수정할 workspace 정보 저장해두고 
      var updateData = {
        workspace: Blockly.Xml.domToText(xml),
        widgetType: $scope.widget.widgetType,
        title: $scope.widget.title,
        width: $scope.widget.width,
        height: $scope.widget.height
      };


      //  invalid한 block 목록 만들고 
      var remove = getInvalidBlocks(xml);

      //  invalid한 block이 있으면
      if(remove.length > 0 ) {

        for(var i=0; i < remove.length; i++ ) {
          var block = $scope.workspace.getBlockById(remove[i].attributes['id'].value);
          block.svgGroup_.addClass('blocklyError');
        }

        if( confirm("적절하지 않은 블럭이 포함되어 있습니다. 붉은 색으로 표시된 블럭들을 삭제할까요?")) {
          xml = removeExcept(xml, remove);
        }
      }


      var workspace = new Blockly.Workspace();
      Blockly.Xml.domToWorkspace(xml, workspace);
      var code = Blockly.JavaScript.workspaceToCode(workspace);

      var triggerBlockInfo = getTriggerBlockInfo(xml.firstChild);
      triggerBlockInfo["code"] = code;
      
      updateData['triggerInfo'] = triggerBlockInfo;

      if($scope.widget.widgetId != null) {
        apiService.widget.update($scope.widget.widgetId, updateData)
          .then(function(widgetData){
            $scope.$apply(function(){
              $scope.widget = widgetData;
            });
          });        
      }
      else {
        apiService.widget.create(updateData)
        .then(function(widgetData){
          $scope.$apply(function(){
            $scope.widget = widgetData;
          });
        });   
      }

    }
  }


})();
