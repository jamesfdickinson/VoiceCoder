const AWS = require('aws-sdk');
const randomstring = require("randomstring");
//https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/359
//https://medium.com/@Keithweaver_/using-aws-dynamodb-using-node-js-fd17cf1724e0
class DataManagerDB {
    constructor(config) {
        this.tableName = config.aws_table_name;
        AWS.config.update(config.aws_remote_config);
        this.dynamoDb = new AWS.DynamoDB.DocumentClient();
    }

    async save(userId, dataP) {
        let accessCode = null;
        let data = dataP || {};


        //find user file
        let user = await this.loadByUserId(userId);
        if (user) {
            accessCode = user.accessCode;
        }
        //create one if not found
        if (!accessCode) {
            accessCode = await this.getNewAccessCode();
        }
        //save data
        data.accessCode = accessCode;
        const params = {
            TableName: this.tableName,
            Item: {
                "userId": userId,
                "accessCode": accessCode,
                "data": data
            }
        };
        let results = await this.dynamoDb.put(params).promise();
        return accessCode;
    }
    async getNewAccessCode() {
        let code = null;
        //try 5 times to get a short code
        for (let i = 0; i < 5; i++) {
            let randCode = randomstring.generate({ length: 4, capitalization: 'uppercase' });
            //check if exist
            let item = await this.accessCodeExist(randCode);
            if (!item) {
                code = randCode;
                break;
            }
        }
        //if still no code try a larger code
        if (code == null) {
            let randCode = randomstring.generate({ length: 5, capitalization: 'lowercase' });
            let items = await this.accessCodeExist(randCode);
            if (!item) code = randCode;
        }
        //if still no code try a larger code
        if (code == null) {
            let randCode = randomstring.generate({ length: 6, capitalization: 'lowercase' });
            let items = await this.accessCodeExist(randCode);
            if (!item) code = randCode;
        }
        //if still no code try a larger code
        if (code == null) {
            let randCode = randomstring.generate({ length: 7, capitalization: 'lowercase' });
            let items = await this.accessCodeExist(randCode);
            if (!item) code = randCode;
        }
        if (code == null) {
            let randCode = randomstring.generate({ length: 10, capitalization: 'lowercase' });
            code = randCode;
        }

        return code;
    }    
    async loadOrCreate(id) {
        try {
            let item = await this.loadByUserId(id);
            return item.data;
        } catch (ex) {
            let accessCode = await this.save(id, {});
            let item = await this.loadByUserId(id);
            return item.data;
        }
    }
    async loadByUserId(id) {
        const params = {
            TableName: this.tableName,
            Key: {
                'userId': id
            }
        };
        let results = await this.dynamoDb.get(params).promise();
        let item = results.Item;
        // //insert accessCode in the json data.
        // let data = null;
        // if(item){
        //   data  = JSON.parse(item.data);
        //   data.accessCode = item.accessCode;
        // } 
        return item;
    }
    async loadByAccessCode(id) {
        const params = {
            TableName: this.tableName,
            IndexName: 'accessCode-index',
            KeyConditionExpression: 'accessCode = :id',
            ExpressionAttributeValues: { ':id': id }
        };
        let results = await this.dynamoDb.query(params).promise();

        //todo: there should not be duplicates but the code does not gerentee race conditions
        if (results.Items.length > 0) {
            let item = results.Items[0];
            //  //insert accessCode in the json data.
            // let data = null;
            // if(item){
            //   data  = JSON.parse(item.data);
            //   data.accessCode = item.accessCode;
            // } 
            return item;
        }

        return null;
    }
    async accessCodeExist(id) {
        let item = await this.loadByAccessCode(id);
        let exist = (item != null);
        return exist;
    }
}

if (typeof module !== 'undefined' && typeof exports === 'object') { module.exports = DataManagerDB; }
