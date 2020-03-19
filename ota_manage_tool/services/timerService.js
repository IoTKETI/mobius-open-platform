
var timeoutList = {};
const MAX_TIMEOUT = 30000;
var timerService = {};
/**
 * @param {String} aename Target AE
 * @param {Function} callback the Function that work after timeout
 */
timerService.fnSetTimeout = (aename, callback) => {
    if (timeoutList[aename]) {
        clearTimeout(timeoutList[aename]);
    }
    timeoutList[aename] = setTimeout(function(){
        if (timeoutList[aename]) {
            callback();
        }
    }, MAX_TIMEOUT);
}

timerService.fnClearTimeout = function (aename) {
    if (timeoutList[aename]) {
        clearTimeout(timeoutList[aename]);
    }
}

module.exports = timerService;