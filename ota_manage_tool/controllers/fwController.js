var imgSrevice = require('../services/aeMgmtService');
var notifyService = require('../services/notifyService');
var fs = require('fs');
var logger = require('../services/logger');

const MAX_SEND_SIZE = 4096;
const SEND_BUFFER_UPPER_BOUND = 65536;
const SEND_BUFFER_LOWER_BOUND = 128;

global.send_buffer_size = MAX_SEND_SIZE;
var bufferSizeByClient = {};
exports.setBlockSize = (req, resp) => {
  var oldSize = global.send_buffer_size;
 
  if(!req.body.size) {
    // resp.set({'Content-Type': 'text/plain', 'Encoding': 'utf8'});
    resp.status(400).send( "'size' parameter is required");
    resp.end();  
    return
  }

  var newSize = parseInt(req.body.size);
  if(isNaN(newSize) || newSize < SEND_BUFFER_LOWER_BOUND || newSize > SEND_BUFFER_UPPER_BOUND) {
    // resp.set({'Content-Type': 'text/plain', 'Encoding': 'utf8'});
    resp.status(400).send( "Fail to change buffer size: '" + newSize + "' is illegal value! (" +SEND_BUFFER_LOWER_BOUND +"-" +SEND_BUFFER_UPPER_BOUND+")");
    resp.end();
  }
  else {
    global.send_buffer_size = newSize;
    logger.info(`Buffer size changed from ${oldSize} to ${newSize}`);

    resp.status(200).send( {newSize : global.send_buffer_size});
    resp.end();
  }


}
exports.getBlockSize = (req, resp) => {

  resp.status(200).send({bufferSize : global.send_buffer_size});
  resp.end();
}


exports.getVersion = (req, resp) => {
    if(req.params.hasOwnProperty('aeid')){

        var aename = req.params.aeid;
        try {
            imgSrevice.getImageByAEID(aename)
            .then(aeDoc => {
                if(aeDoc){
                    if(aeDoc.aeid){
                        logger.info(`${aename} get firmware version`);
                        if(aeDoc.version) {

                            notifyService.update(aename, null);

                            resp.set({'Content-Type': 'text/plain', 'Encoding': 'utf8'});
                            resp.status(200).send(aeDoc.version);
                            resp.end();
        
                            return;
                        } else {
                            failResponse(resp, null, "could not find file", aename);
                            return;
                        }
        
                    } else {
                        failResponse(resp, null, "could not find file", aename);
                        return;
                    }
                } else {
                    failResponse(resp, null, "could not find target AE", aename);
                    return;
                }
            })
            .catch(err => {
                failResponse(resp, err, err.message, aename);
                return;
            })
        } catch (err){
            failResponse(resp, err, "server maybe has some problem!", aename);
            return;
        }
    } else {
        failResponse(resp, null, "request error!", aename);
        return;
    }
}

exports.getSize = (req, resp) => {
    if(req.params.hasOwnProperty('aeid')&&req.params.hasOwnProperty('version')){

        var aename = req.params.aeid;
        var size;

        imgSrevice.getImageByAEID(aename)
        .then(aeDoc => {
            if(aeDoc){
                try {
                    size = aeDoc.fileSize;
                    logger.info(`${aename} get firmware size`);
                    if(size){
                        // set size of buffer
                        bufferSizeByClient[aename] = global.send_buffer_size;

                        notifyService.update(aename, null);
                        resp.set({'Content-Type': 'text/plain', 'Encoding': 'utf8'});
                        resp.status(200).send(String(size));
                        resp.end();
                    }else {
                        failResponse(resp, null, "could not read file size!", aename);
                        return;
                    }
                } catch (err){
                    failResponse(resp, err, "could not find file!", aename);
                    return;
                }

            } else {
                failResponse(resp, null, "could not find file!", aename);
                return;
            }
        })        
    } else {
        failResponse(resp, null, "request Error", aename);
        return;
    }
}

exports.getFile = (req, resp) => {
    if(req.params.hasOwnProperty('aeid')&&req.params.hasOwnProperty('version')){

        var aename = req.params.aeid;
        
        // 파일 이름 가져오기
        imgSrevice.getImageByAEID(aename)
        .then(aeDoc => {
            if(aeDoc){
                var filePath = aeDoc.filePath;
    
                try {
                    var bufferSize = bufferSizeByClient[aename];
                    // 파일의 유무를 확인
                    var stat = fs.statSync(filePath);
        
                    // 파일이 존재하는지 확인
                    if(stat){
                        // 서버측에서 계산한, 송신 횟수(파일길이 / 송신길이)
                        var loop_time = parseInt(stat.size / bufferSize);
            
                        // request에 seq가 있으면
                        if(req.query.hasOwnProperty("seq")) {
            
                            try{
                                // Arduino에서보낸 seq를 가져온다
                                var seq = parseInt(req.query.seq);
                                // 송신 파일명 'fragment'+횟수
                                var file_name = 'fragment' + seq;
                                
                                logger.info(`${aename} request the seq : ${seq}`);
                                
                                
                                if(seq == 1){
                                    logger.info(`[Patch] : ${aename} Patch Start!`);
                                }
                                // 비정상적인 seq를 막기 위해, 0 < seq <= loop_time
                                if(seq > 0 && seq <= loop_time){
            

                                    // 파일을 읽기모드로 실행
                                    fs.open(filePath, 'r', function(status, fd) {
                                        if (status) {
                                            console.log(`[Patch] : ${status.message}`);
                                            return;
                                        }
                                        //버퍼는 최대 전송량 만큼만
                                        var buffer = new Buffer(bufferSize);
                                        // 파일을 읽되, (seq-1) * 전송최대량 ~ 전송최대량
                                        fs.read(fd, buffer, 0, bufferSize, (seq - 1) * bufferSize, function(err, num, buff) {
                                            resp.writeHead(200, {
                                                'Content-Type': 'application/octet-stream', //filename="OOON" 처럼 보낸다.
                                                'Content-Disposition' : 'attachment; filename="' + file_name + '"',
                                                'Is-Next' : 'yes',
                                                'Seq' : seq,    // 횟수 명시
                                                'Content-Length': buff.length,   // 길이도 명시
                                                'Access-Control-Expose-Headers' : 'Is-Next, Seq'
                                            });
            
                                            // buffer에입력된 데이터 들을 binary형태로 버퍼에 다시담아서 보낸다.
                                            resp.end(new Buffer(buff, 'binary'));
                                            
                                            // 현재 ae를 요청한 arduino의 socket id를 가져온다.
                                            // var client_id = client_list[aeid];
                                            notifyService.update(aename, seq, loop_time);

                                            logger.info(`[Patch] : ${aename} send file (${seq}/${loop_time}) size : ${buffer.length} | global : ${global.send_buffer_size}`);
            
                                            return;
                                        });
                                    });
                                } else if(seq == loop_time + 1){    // seq가 loop_time + 1이라는 것은, 마지막 파트인 것
                                    // 파일의 잔여 내용의 길이를 구한다.
                                    var last_data_length = stat.size - ((seq - 1) * bufferSize);
                                    // 파일의 잔여 내용 읽기
                                    fs.open(filePath, 'r', function(status, fd) {
                                        if (status) {
                                            logger.info(`[Patch] : ${status.message}`);
                                            return;
                                        }
                                        // 잔여 길이 만큼 버퍼 확보
                                        var buffer = new Buffer(last_data_length);
                                        // 잔여 길이 만큼 읽어준다.
                                        fs.read(fd, buffer, 0, last_data_length, (seq - 1) * bufferSize, function(err, num, buff) {
            
                                            resp.writeHead(200, {
                                                'Content-Type': 'application/octet-stream',
                                                'Content-Disposition' : 'attachment; filename="' + file_name + '"',
                                                'Is-Next' : 'no',
                                                'Seq' : seq,
                                                'Content-Length': buff.length,
                                                'Access-Control-Expose-Headers' : 'Is-Next, Seq'
                                            });
            
                                            resp.end(new Buffer(buff, 'binary'));
                                            // clear timeout and send success data to web client
                                            notifyService.finish(aename);
                                            logger.info(`[Last Patch] : ${aename} send file (${seq}/${loop_time}) size : ${buffer.length} | global : ${global.send_buffer_size}`);
                                            return;
                                        });
                                    });
                                } else {
                                    failResponse(resp, null, "sequence is out of bound", aename);
                                    return;
                                }
                            }catch(err) {
                                failResponse(resp, err, "sequence is not a number", aename);
                                return;
                            }
                        } else {
                            failResponse(resp, null, "missing sequence number!", aename);
                            return;
                        }
                    }else {                        
                        failResponse(resp, new Error("Could not find firmware file!"), "could not find file!", aename);
                        return;
                    }
                } catch (err){
                    failResponse(resp, err, "could not find file!", aename);
                    return;
                }
            }else {                
                failResponse(resp, err, "could not find file!", aename);
                return;
            }
        })
        .catch(err=>{
            failResponse(resp, err, "AE has not AE name!", aename);
        });
    } else {
        failResponse(resp, null, 'fw controller request Error', aename);
        return;
    }
}


/**
 * 
 * @param {Error} err 
 * @param {String} message 
 * @param {String} aename 
 */
function failResponse(resp, err, message, aename){

    resp.set({'Content-Type': 'text/plain', 'Encoding': 'utf8'});
    resp.status(400).send(message);
    resp.end();

    notifyService.fail(aename, message);
    logger.error( err ? err : new Error(message));
}