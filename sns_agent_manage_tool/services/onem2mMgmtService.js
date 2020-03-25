var onem2m = require('../lib/onem2m/onem2m-client');

exports.checkExistTarget = (target, origin) => {
    const URL = process.env.TARGET_RESOURCE;
    return onem2m.Http.GetResource(`${URL}/${target}`, origin);
}