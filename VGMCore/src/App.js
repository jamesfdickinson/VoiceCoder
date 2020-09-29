//import Game from './Game.js';
const result = require('dotenv').config();
const FlappyBirdGame = require('./FlappyBirdGame.js');
const DataManagerWS = require('./DataManagerWS.js');
const DataManagerDB = require('./DataManagerDB.js');
class App {
    constructor() {
        this.appName = "GameMakerVoice";
        this.version = "1.0.0";
        const config = {
            aws_table_name: 'VGM',
            aws_remote_config: {
                accessKeyId: process.env.AWS_accessKeyId,
                secretAccessKey: process.env.AWS_secretAccessKey,
                region: process.env.AWS_region
            }
        };
        this.dataManagerDB = new DataManagerDB(config);
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
