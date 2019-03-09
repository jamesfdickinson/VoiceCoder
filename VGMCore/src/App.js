//import Game from './Game.js';
const FlappyBirdGame = require('./FlappyBirdGame.js');
const DataManagerWS = require('./DataManagerWS.js');
const DataManagerDB = require('./DataManagerDB.js');
class App {
    constructor() {
        this.appName = "GameMakerVoice";
        this.version = "1.0.0";
        this.dataManagerDB = new DataManagerDB();
        this.dataManagerWS = new DataManagerWS();
        this.game = new FlappyBirdGame();
    }
    async loadDB(userId) {
        let data = await this.dataManagerDB.loadOrCreate(userId);
        return data;
    }
    async  saveDB(userId, data) {
        let accessCode = await this.dataManagerDB.save(userId, data);
        await  this.dataManagerWS.sendUpdateNotification(accessCode,data);
        return accessCode;
    }
}
//export{App as default }
// Node.js
if (typeof module !== 'undefined' && typeof exports === 'object') { module.exports = App; }
