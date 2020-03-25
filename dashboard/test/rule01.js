
//	dashboard generator에서 생성하는 코드를 실행시키는 함수입니다.
//	engine으로 부터 넘겨받은 함수 목록을 받아서 호출하게 됩니다.
function executeDatasource(engine) {

	//	여기서부터는 blockly UI에서 생성하는 코드입니다.

	var redcolor;

	//	dashboard 실행 조건을 테스트하는 블럭
	if(!(engine.getDeviceAttribute("gateway_serial_number", "device_id", "TEMPERATURE") > 30))
		return false;

	//	변수값을 지정하는 블럭
	redcolor = "#ff0000";

	//	attribute 값을 설정하는 블럭 .
	//	gateway_serial_number와 device_id는 나중에 실제 값으로 변경 되겠죠.. 지금은 임시로 하드코딩
	//	"rgb"는 UI에서 dropdown UI로 선택하는 값이 들어옵니다.
  engine.setDevcieAttribute("gateway_serial_number", "device_id", "rgb", redcolor);

	return true;


	//	여기까지 blockly UI에서 생성하는 코드입니다.
}

module.exports = executeDatasource;
