const fs = require('fs');
const util = require('util');
const path = require("path");

class DataManagerFS {
    constructor() {
        this.readFile = util.promisify(fs.readFile);
        this.writeFile = util.promisify(fs.writeFile);

    }
    async saveJSON(data) {
        let fileName = data.accessCode;
        let content = JSON.stringify(data, null, 2);
        let filePath = path.resolve(__dirname, 'data/' + fileName + ".json");
        let results = await this.writeFile(filePath, content, 'utf8');
        return data.accessCode;
    }

    async save(id, data) {
        let accessCode = id;
        let content = JSON.stringify(data, null, 2);
        let filePath = path.resolve(__dirname, 'data/' + id + ".json");
        let results = await this.writeFile(filePath, content, 'utf8');

        return results;
    }
    async loadJSON(id) {
        let filePath = path.resolve(__dirname, "data/" + id + ".json");
        let data = await this.readFile(filePath, 'utf8');
        let dataobject = JSON.parse(data);
        return dataobject;
    }
    async load(id) {
        let filePath = path.resolve(__dirname, "data/" + id + ".json");
        let data = await this.readFile(filePath, 'utf8');
        return data;
    }
}
if (typeof module !== 'undefined' && typeof exports === 'object') { module.exports = DataManagerFS; }
