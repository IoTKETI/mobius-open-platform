const onem2m = require('../lib/onem2m/onem2m-client');
const mqtt = require('../lib/onem2m/onem2m-mqtt');
const onem2mClient = require('onem2m_client')();
const mqttBrokerUrl = "mqtt://203.253.128.161";
module.exports = class {
    constructor(target){
        this.target = target;
        this.URL = process.env.TARGET_RESOURCE;
        this.operateFunction; 
    }

    setPost(conVariable, origin, callback){
        return this.operateFunction = onem2m.Http.CreateResource(
            `${this.URL}/${this.target}`,
            {
                "m2m:cin" : {
                    "con" : conVariable
                }
            },
            origin
        )
        .then( rs => {
            callback(null, rs);
        })
        .catch( err => {
            callback(err, null);
        })
    }

    setGet(origin, callback){
        return this.operateFunction = onem2m.Http.GetResource(
            `${this.URL}/${this.target}/latest`,
            origin
        )
        .then( rs => {
            callback(null, rs);
        })
        .catch( err => {
            callback(err, null);
        })
    }

    setSub(subscriptionName, origin){
        return new Promise((resolve, reject) => {
            onem2mClient.Http.subscribeTo(`${this.URL}/${this.target}`, subscriptionName, origin , mqttBrokerUrl)
            .then((result) => {
                resolve(mqtt.getClient(`${mqttBrokerUrl}`, origin));
            })
            .catch(err => {
                if(err.statusCode === 409){
                    resolve();
                }else{
                    reject(err);
                }
            })
        });
    }
}