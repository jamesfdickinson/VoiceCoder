const fs = require('fs');
const util = require('util');

class DataManagerFile {
    constructor() {
        this.readFile = util.promisify(fs.readFile);
        this.writeFile = util.promisify(fs.writeFile);
    }
    async save(data) {
        let fileName = data.accessCode;
        let content = JSON.stringify(data,null,2);
        let results = await this.writeFile('data/'+fileName,content,'utf8');
        return data.accessCode;
    }
    async load(id) {
       let data = await this.readFile('data/'+id,'utf8');
       let dataobject = JSON.parse(data);
       return dataobject;
    }
}
//export{App as default }
// Node.js
if (typeof module !== 'undefined' && typeof exports === 'object') {  module.exports = DataManagerFile;}
