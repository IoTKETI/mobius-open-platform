
/*
	dashboard 코드가 어떻게 작성되어야 할까 테스트해보기 위해서
	간단하게 engine쪽(gateway에서 실행되어야 할) 코드를 테스트용으로 작성해본겁니다.
 */


//	지난번에 회의떄 얘기한것 처럼 dashboard generator에서 생성된 code를 require로 읽어들이고
var dashboard01 = require('./dashboard01.js');



//	Things 들로 부터 값을 읽어오고, 값을 설정하는 코드를 작성해서
function getDeviceAttribute(g,d,a) {
	return 20;
}

function setDeviceAttribute(g,d,a,v) {
	console.log( v );
}

//	하나의 객체에 넣어서 dashboard에 전달을 해줘야 할 것 같습니다.
var deviceManager = {
  getDeviceAttribute: getDeviceAttribute,
  setDevcieAttribute: setDeviceAttribute
}


//	dashboard을 실행시키면서 thing들을 컨트롤할 수 있는 함수들을 담은 객체를 넘겨줍니다.
dashboard01(deviceManager);




