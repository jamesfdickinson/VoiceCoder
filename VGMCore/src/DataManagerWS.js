
var request = require('request-promise-native');

class DataManagerWS {
    constructor() {
       this.baseUrl = "https://voicecoder.net";
        //this.baseUrl = "http://192.168.1.2:80";

    }
    async save(id, data) {
        let url = this.baseUrl + '/user/' + id;
        var options = {
            uri: url,
            method: 'POST',
            body:data,
            json: true
        };
        try {
            let body = await request(options);
            let accessCode = body;
            return accessCode;
        }
        catch (e) {
            console.log(e);
        }
    }
    async load(id) {
        let url = this.baseUrl + '/user/' + id;

        let body = await request(url);
        let payload = JSON.parse(body);

        return payload;
    }
    async loadOrCreate(id) {
        try {
            let payload = await this.load(id);
            return payload;
        } catch (ex) {
            let accessCode = await this.save(id, {});
            let payload1 = await this.load(id);
            return payload1;
        }
    }
    async sendUpdateNotification(id, data) {
        //send update for socket trigger
        let url = this.baseUrl + '/update/' + id;
        var options = {
            uri: url,
            method: 'POST',
            body: data,
            json: true,
            timeout: 1500
        };
        try {
            await request(options);

        }
        catch (e) {
            console.log(e);
        }
    }
}
//export{App as default }
// Node.js
if (typeof module !== 'undefined' && typeof exports === 'object') { module.exports = DataManagerWS; }
