var content2, res;


// MQTT EVENT Trigger for
function __executeMqttEventHandler(__engine__, __triggering_params__) {
  content2 = __triggering_params__;

  console.log( '111', content2 );
  if (true) {
    console.log( '222', res );

    while (true == res) {
      console.log('abc');
    }
  }
}
module.exports = __executeMqttEventHandler;