const aeMgmtService = require('../services/aeMgmtService');
const userMgmtService = require('../services/userMgmtService');
const onem2mService = require('../services/onem2mMgmtService');
const notifyService = require('../services/notifyService');
const dateFormat = require('dateformat');
const AE_DTO = require('../dto/aeVO');
const multer = require('multer');
var fs = require('fs');
var logger = require('../services/logger');
exports.fileUpload = (req, res, next) => {
    var uploading = multer({
        fileFilter: (req, file, cb) => {
            let aeid = req.body.aeid;
            onem2mService.isExistAE(aeid)
                .then(result => {
                    if (!result) {
                        cb(new Error("존재하지 않는 AE입니다."), false);
                    } else {
                        cb(null, true);
                    }
                }).
                catch(err => {
                    if (err.statusCode == 404) {
                        failResponseMessage(res, err,  "존재하지 않는 AE입니다.");
                    } else {
                        logger.error(err);
                        failResponseMessage(res, err, 'AE정보 조회에 실패했습니다.');
                    }
                })
        },
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                let aeID = req.body.aeid;
                let version = req.body.version;
                let aeDir = `${process.env.uploadPath}/${aeID}`;
                let versionDir = `${process.env.uploadPath}/${aeID}/${version}`;

                var type = getFileType(file.originalname);
                if ((type != 'bin') && (type != 'hex')) {
                    cb(null, null);
                } else {

                    if (type == 'hex') {
                        // 확장자를 미리 bin으로 변환

                    }

                    // 해당 ae에 해당하는 위치에 자료를 둘 것이다.
                    if (!fs.existsSync(aeDir)) {
                        fs.mkdirSync(aeDir);
                    }
                    // 버전/firmware.bin이기에 버전 디렉토리도 만들어야한다.
                    if (!fs.existsSync(versionDir)) {
                        fs.mkdirSync(versionDir);
                    }
                    cb(null, versionDir);
                }
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        })
    }).single('file');

    new Promise((resolve, reject) => {
        uploading(req, res, (err) => {
            if (err) {
                reject(err);
                
                return next();
            }
            //TODO hex 2 bin function promise
            if (getFileType(req.file.originalname) == 'hex') {
                hex2bin(req.file)
                    .then(function (size) {
                        req.file.size = size;
                        req.file.filename = req.file.filename.replace('.hex', '.bin');
                        req.file.path = req.file.path.replace('.hex', '.bin');
                        
                        resolve(req.file);
                        return next();
                    })
                    .catch(function (err) {
                        reject(err);
                        return next();
                    });
            } else {
                resolve(req.file);
                return next();
            }

        })
    });

}

exports.addAE = (req, res) => {

    if (!hasOwnProperties(req.body, 'aeid', 'version') || !hasOwnProperties(req, 'file')) {
        failResponseMessage(res, null, 'server could get some data');
        return;
    }
    try {
        var ae = new AE_DTO();
        ae.aeID = req.body.aeid ? req.body.aeid : null;
        ae.tag = req.body.tag ? req.body.tag : null;
        ae.version = req.body.version ? req.body.version : null;
        ae.fileName = req.file.filename;
        ae.filePath = req.file.path;
        ae.fileSize = req.file.size;
        ae.uploaded = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');

        let email = req.decoded.u_e; // 해당 유저의 Object_id
        /* Check Exist AE */


        aeMgmtService.checkDuplicated(ae.aeID)
            .then(exist => {
                if (exist.length <= 0) {
                    return userMgmtService.getUserInfomation(email); 
                } else {
                    throw new Error("다른 사용자가 관리 중인 AE입니다.")
                }
            })
            .then(user => {
                return aeMgmtService.addAE(user, ae)
            })
            .then(ae => {
                res.status(200).json({
                    message: '성공적으로 AE등록을 마쳤습니다.',
                    data: ae
                });
            })
            .catch(err => {
                failResponseMessage(res, err, err.message || 'AE 등록에 실패했습니다. 반복시 관리자에게 문의 바랍니다.');
            })

    } catch (err) {
        failResponseMessage(res, err, 'AE 등록에 실패했습니다. 반복시 관리자에게 문의 바랍니다.');
    }
}

exports.modifyAE = (req, res) => {

    try {
        var ae = new AE_DTO();
        ae.aeID = req.body.aeID ? req.body.aeID : null;
        ae.tag = req.body.tag ? req.body.tag : null;

        aeMgmtService.modifyAE(ae)
            .then(result => {
                if (result) {
                    res.status(200).json({
                        message: 'Successfully update infomation!',
                        data: result
                    });
                } else {
                    failResponseMessage(res, null, '정보와 일치하는 AE가 존재하지 않습니다.');
                }
            }).catch(err => {
                failResponseMessage(res, err, 'AE 수정에 실패했습니다. 반복시 관리자에게 문의 바랍니다.');
            })

    } catch (err) {
        failResponseMessage(res, err, 'AE 수정에 실패했습니다. 반복시 관리자에게 문의 바랍니다.');
    }
}


const afterRemoveAE = (result, res) => {
    if (result) {
        res.status(200).json({
            message: 'AE삭제를 성공적으로 마쳤습니다.'
        })
    } else {
        failResponseMessage(res, null, 'AE 정보와 일치하는 AE가 존재하지 않습니다.');
    }
}
exports.removeAE = (req, res) => {

    if (!hasOwnProperties(req.query, 'aeid')) {
        failResponseMessage(res, null, '잘못된 경로로 접근하였습니다.');
        return;
    }

    try {
        let email = req.decoded.u_e;
        let aeID = req.query.aeid;
        var work = null;
        if (aeID instanceof Array) {
            work = aeMgmtService.removeAEMany;
        } else {
            work = aeMgmtService.removeAE;
        }
        work(email, aeID)
        .then(result => {
            if(result){
                res.status(200).json({
                    message: 'AE삭제를 성공적으로 마쳤습니다.'
                })
            }
        })
        .catch(err => {
            failResponseMessage(res, null, 'AE 정보와 일치하는 AE가 존재하지 않습니다.');
        })

    } catch (err) {
        failResponseMessage(res, err, 'AE 삭제에 실패했습니다. 반복시 관리자에게 문의 바랍니다.');
    }
}

exports.getAE = (req, res) => {

    let aeID = req.body.aeID ? req.body.aeID : failResponseMessage(res, null, 'Could not get AE ID');

    try {
        aeMgmtService.getAE(aeID)
            .then(result => {
                if (result) {
                    res.status(200).json({
                        message: `Successfully get infomation of ${aeID}`,
                        data: result
                    })
                } else {
                    failResponseMessage(res, null, 'AE정보와 일치하는 AE가 없습니다.');
                }
            })
    } catch (err) {
        failResponseMessage(res, err, 'AE를 불러오지 못했습니다. 반복시 관리자에게 문의 바랍니다.');
    }
}

exports.getAEList = (req, res) => {

    try {
        var email = req.query.email;
        if (!email) {
            failResponseMessage(res, null, '잘못된 경로로 접근하셨습니다.');
            return;
        }

        aeMgmtService.getAEList(email)
            .then(aes => {
                res.status(200).send(aes);
            })
            .catch(err => {
                failResponseMessage(res, err, 'AE를 가져오지 못했습니다. 반복시 관리자에게 문의 바랍니다.');
            })
    } catch (err) {
        failResponseMessage(res, err, 'AE를 가져오지 못했습니다. 반복시 관리자에게 문의 바랍니다.');
    }
}

exports.uploadPatchFile = (req, res) => {
    if (!hasOwnProperties(req.body, 'aeid', 'version') || !hasOwnProperties(req, 'file')) {
        failResponseMessage(res, null, '잘못된 경로로 접근하였습니다.');
        return;
    }
    let ae = new AE_DTO();
    ae.aeID = req.body.aeid;
    ae.version = req.body.version;
    ae.fileName = req.file.filename;
    ae.filePath = req.file.path;
    ae.fileSize = req.file.size;

    let email = req.decoded.u_e;
    aeMgmtService.uploadPatchFile(email, ae)
        .then(result => {
            if(typeof(result) == 'string'){
                res.status(400).json({message : result});
            }
            else if (result) {
                res.status(200).json({
                    message: '이미지 등록에 성공하였습니다.',
                    data: result
                })
            }
        })
        .catch(err => {
            failResponseMessage(res, err, '이미지 등록 중 문제가 발생했습니다.');
        })
}


exports.startPatch = (req, res) => {

    if (!hasOwnProperties(req.body, 'aeid')) {
        failResponseMessage(res, null, '잘못된 경로로 접근하였습니다.');
        return;
    }
    var target = req.body.aeid;

    let userOrigin = req.decoded.u_o;
    try {
        if (!userOrigin) {
            failResponseMessage(res, null, '존재하지 않는 계정으로 접속하셨습니다.');
            return;
        }
        Promise.all(target.map((aeid) => {
            return new Promise((resolve, reject) => {
                aeMgmtService.updatePatchStart(aeid)
                .then(() => {
                    return onem2mService.createUpdateCIN(userOrigin, aeid);
                })
                .then((rs) => {
                    resolve(aeid);
                })
                .catch(err => {
                    logger.error(err);
                    reject(err);
                })
            })
        }))
        .then(results => {
            logger.info(`[AE PATCH] : ${results.join(',')} Patch Start`);
            res.status(200).end();
            results.forEach(aename => {
                notifyService.start(aename);
            })
        })
        .catch(err => {
            res.status(400).json({
                message : '패치 시작 과정 중 장애가 발생했습니다.'
            });
            logger.error(err);
        })
    } catch (err) {
        failResponseMessage(res, err, '디바이스 패치에 실패했습니다. ');
    }
}

exports.updatePatchDate = (req, res) => {
    if (!hasOwnProperties(req.params, 'aeid', 'time')) {
        failResponseMessage(res, null, 'Could not get Parameters');
        return;
    }
    var targetAE = req.params.aeid;
    // get user's object id from docoded token
    let email = req.decoded.u_e;

    aeMgmtService.updatePatchDate(email, targetAE)
        .then(result => {
            if (result) {
                res.status(200).json({
                    message: 'well done',
                    data: result
                })
            }
        })
        .catch(err => {
            failResponseMessage(res, err, "최근 패치 일 수정에 실패했습니다.");
        })

}

function getFileType(str) {
    var strs = str.split('.');
    return strs[strs.length - 1];
}

function hex2bin(fileInfo) {

    return new Promise(function (resolve, reject) {

        if (getFileType(fileInfo.originalname) != 'hex') {
            reject(new Error("File is not .hex"));
            return;
        }

        lines = fs.readFileSync(fileInfo.path);
        lines = lines.toString('utf8').split(/\r\n|\r|\n/g);

        var hex_line = [];

        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].replace(':', '');
            lines[i] = lines[i].replace('\n', '');
            lines[i] = lines[i].replace('\r', '');

            if (lines[i].length > 0) {
                var line = new Buffer(lines[i], 'hex');
                var tmp_data = {};
                tmp_data.length = parseInt(line[0]);
                tmp_data.address = line[1] * 16 + line[2];
                tmp_data.type = line[3];
                tmp_data.data = [];

                for (var j = 0; j < tmp_data.length; j++) {
                    tmp_data.data[j] = line[4 + j];
                }

                tmp_data.crc = line[4 + tmp_data.length];
                if (tmp_data.type == 0) {
                    hex_line.push(tmp_data);
                }
            }
        }
        var temp_data = []
        for (var i = 0; i < hex_line.length; i++) {
            for (var j = 0; j < hex_line[i].data.length; j++) {
                //console.log(fw[i].data[j]);
                temp_data.push(hex_line[i].data[j]);
            }
        }

        var buff = new Buffer(temp_data.length);

        for (var i = 0; i < buff.length; i++) {
            buff[i] = temp_data[i];
        }

        var cpPath = fileInfo.path.replace('.hex', '.bin');
        var originPath = fileInfo.path;
        fs.writeFile(cpPath, buff, 'binary', function (err) {
            if (!err) {   // 정상처리 일 경우
                fs.unlinkSync(originPath);
                resolve(temp_data.length);
            }
        });
    })
}

function failResponseMessage(res, err, message) {
    if (err) logger.error(err);
    res.status(400).json({
        message: message
    })
}


function hasOwnProperties(target, ...names) {

    names.forEach(el => {
        if (!Object.prototype.hasOwnProperty.call(target, el)) {
            return false
        }
    });
    return true;
}