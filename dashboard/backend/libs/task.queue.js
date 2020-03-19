/**
 * Created by kimtaehyun on 2017. 7. 13..
 */

var Dequeue = require ('dequeue');

exports = module.exports = TaskQueue;


function TaskQueue() {

  //  TaskQueue에 의해 처리될 데이터 QUEUE data structure
  this.FIFO = new Dequeue();

  //  TaskQueue에 queue된 데이터가 pop 되었을 때 호출될 data handler list
  this.dataHandlerList = [];

  //  TaskQueue가 현재 동작 상태인지를 저장한 variable.  TaskQueue.start, TaskQueue.stop 함수에 의해 상태가 바뀐다.
  this.isStarted = false;



  //  TaskQueue에 처리될 데이터를 추가
  this.enqueue = _enqueue;

  //  TaskQueue를 통해 처리될 데이터를 실제로 handling할 handler callback함수를 추가한다
  this.addDataHandler = _addDataHandler;


  //  TaskQueue 동작 시작/정지.  resume & restart 개념은 없음.
  this.start = _start;
  this.stop = _stop;




  //
  // internal functions
  /////////////////////////////////////////////////////////////

  //  TaskQueue에서 처리할 data queue를 lookup하면서 처리할 데이터가 있는 경우 handler를 호출한다
  function fetcher(q) {

    //  TaskQueue가 start된 상태인지 확인
    if( !q.isStarted )
      return;

    //  TaskQueue가 start된 상태이고 data queue(q.FIFO)에 데이터가 있으면
    while (q.isStarted && q.FIFO.length > 0) {
      var item = q.FIFO.shift();

      // 모든 data handler를 호출
      q.dataHandlerList.forEach(function(element, index, array){
        element(item.userId, item.data);
      });
    }

    //  여전히 TaskQueue가 started 상태이면 fetcher 실행
    if( q.isStarted )
      setTimeout(fetcher, 10, q);
  }




  //
  //  method implementations
  ////////////////////////////////////////////////////////////

  function _start() {

    //  TaskQ의 상태를 started로 만들고
    this.isStarted = true;

    //  기존에 저장된 data queue를 모두 삭제
    this.FIFO.empty();

    //  fetcher 실행 (trigger)
    fetcher(this);
  }


  function _stop() {
    //  TaskQ의 상태를 stopped 상태로 만든다
    this.isStarted = false;
  }



  function _addDataHandler(handler) {
    //  기존에 존재하는 handler인지 확인한 후 없으면 추가
    if(this.dataHandlerList.indexOf(handler) == -1) {
      this.dataHandlerList.push(handler);
    }
  }


  function _enqueue(userId, data) {
    //  data queue에 데이터를 추가하고
    this.FIFO.push({userId: userId, data: data});
  }

}

