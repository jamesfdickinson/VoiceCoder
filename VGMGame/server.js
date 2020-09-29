const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws').Server;
const DataManager = require('./DataManagerDB.js');

//settings
var port = process.env.port || process.env.PORT || 80;
var version = "1.0.0";


var aws_remote_config = {
    accessKeyId: process.env.AWS_accessKeyId,
    secretAccessKey:  process.env.AWS_secretAccessKey,
    region:  process.env.AWS_region,
  };
//data manager
var dataManager = new DataManager(aws_remote_config);


//express server routing
var app = express();
app.use(express.static(__dirname + '/www'));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(bodyParser.json());
app.get('/user/:id', async function (req, res,next) {
    var id = req.params.id;
    //get new data to be sent
    //todo: if data is saved as files, then just let user get as static
    //todo: or just forward to static file location if on remote server
    try { 
        let item = await dataManager.loadByUserId(id);
        //should be 1
        if(item){
            let payload = item.data;
            res.send(payload);
        }else{
            throw "noUserIdFound";
        }
     }
    catch (e) {
        next(e);
    }
});
app.post('/user/:id', async function (req, res,next) {
    var id = req.params.id;
    var data = req.body;
    try { 
        let accessCode = await dataManager.save(id,data);
        res.send(accessCode);
        var sentCount = sendMessage(accessCode, "Update", data);
     }
    catch (e) {
        next(e);
    }
   
   // res.send(sentCount + " Update messages sent to: " + id + " : " + JSON.stringify(data1));
});
app.get('/data/:id', async function (req, res,next) {
    var id = req.params.id;
    //get new data to be sent
    //todo: if data is saved as files, then just let user get as static
    //todo: or just forward to static file location if on remote server
    try { 
        let item = await dataManager.loadByAccessCode(id);
        //should be 1
        if(item){
            let data = item.data;
            res.send(data);
        }else{
            throw "accessCodeNotFound";
        }
     }
    catch (e) {
        next(e);
    }
});

app.get('/restart/:id', function (req, res) {
    var id = req.params.id;
    var sentCount = sendMessage(id, "Restart");
    res.send(sentCount + " restart messages sent to: " + id);
});
app.get('/exec/:id', function (req, res) {
    var id = req.params.id;
    var actionData = { action: "Play Sound", value: "meow" };
    var sentCount = sendMessage(id, "Exec", actionData);
    res.send(sentCount + " exec messages sent to: " + id);
});

app.post('/update/:id', function (req, res) {
    var id = req.params.id;
    var data = req.body;
    //todo: get new data to be sent
    //todo: could be on post to save, also ping or forward to client
    var sentCount = sendMessage(id, "Update", data);
   // res.send(sentCount + " Update messages sent to: " + id + " : " + JSON.stringify(data));
    res.send(sentCount + " Update messages sent to: " + id );
});
//http server 
var httpServer = http.createServer(app);
httpServer.listen(port, function () { console.log('***Server(http) listening at port %d *** version %s', httpServer.address().port, version); });

//socket server
const ws = new WebSocket({ server: httpServer, path: '/' });
ws.on('connection', onConnection);

function onConnection(socket, req) {

    socket.on('message', onMessage);
    socket.on('close', onClose);
    socket.on('error', onError);

    socket.send("Welcome");
}
function onMessage(data) {
    var socket = this;
    if (!data) return;

    var command = null;
    var value = null;
    if (data.indexOf(":") > -1) {
        command = data.split(":")[0];
        value = data.substring(data.indexOf(":") + 1);
        //try to phase json
        try {
            value = JSON.parse(value);
        } catch (e) { }
    } else {
        command = data;
    }
    //execute
    if (command === "setId") {
        socket.id = value;
    }
}
function onClose(a, b) {
    var socketId = this.id;
    console.log('onClose', socketId);
}
function onError(error) {
    console.log('Cannot start server');
}
function sendMessage(id, message, value) {
    var sentCount = 0;
    ws.clients.forEach(function each(client) {
        if (client && client.id === id) {
            //client.send(message);
            client.send(`${message}:${JSON.stringify(value)}`);
            sentCount += 1;
        }
    });
    return sentCount;
}