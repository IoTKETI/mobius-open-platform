# jquery-on-off-switch
JQuery based on-off switch for websites


##Usage

###1. Include code in <head>

```HTML
  <script type="text/javascript" src="js/jquery-1.11.2.min.js"></script>
    <script type="text/javascript" src="js/on-off-switch.js"></script>
    <script type="text/javascript" src="js/on-off-switch-onload.js"></script>
    <link rel="stylesheet" type="text/css" href="css/on-off-switch.css"/>
```

###2a Create Switch manually

```HTML
<div class="checkbox-container">
    <input type="checkbox" id="on-off-switch" name="switch1" checked>
</div>
<div id="listener-text">

</div>
<script type="text/javascript">
    new DG.OnOffSwitch({
        el: '#on-off-switch',
        textOn: 'Sync On',
        textOff: 'Off',
        listener:function(name, checked){
            $("#listener-text").html("Listener called for " + name + ", checked: " + checked);
        }
    });
</script>

```


### 2a Auto create switchces
This done by including the on-off-switch-onload.js file in the <head>.

Then assign the checkboxes to the css class custom-switch.

```HTML
    <input type="checkbox" class="custom-switch" name="checkbox1" id="checkbox1">
```
###Methods

The following public methods are available:
toggle: Toggles the checked state of the switch.
check: Set the switch to checked.
uncheck: Set the switch to unchecked.
getValue: Returns true when checked, false otherwise.


###Access automatically created checkboxes.
The automatically created switches can be accessed using the

DG.switches

object.

Example

```Javascript
DG.switches("#checkbox1").check();
```

or by name

```Javascript
DG.switches("checkbox1").uncheck();
```

Ie. using the hash(#) prefix for ids.


