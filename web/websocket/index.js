#!/usr/bin/env node
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var WebSocketServer = require('websocket').server;
//var http = require('http');
var https = require('https');
var fs = require('fs');
var mysql = require('mysql');

var server = https.createServer(
{
      key: fs.readFileSync( '/etc/letsencrypt/live/pitracker.helpfulseb.com/privkey.pem' ),
      cert: fs.readFileSync( '/etc/letsencrypt/live/pitracker.helpfulseb.com/cert.pem' )
},
function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(9101, function() {
    console.log((new Date()) + ' Server is listening on port 9101');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

var con = mysql.createConnection({
  host: "localhost",
  user: "super-secret",
  password: "<password>",
  database: "super-secret"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to db!");
});

function originIsAllowed(origin) {
  return true;
}

var maxId = 0;

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept("logs", request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message ['+request.protocol+']: ' + message.utf8Data);
            connection.sendUTF(JSON.stringify("MESSAGE: " + message.utf8Data));
                console.log('Reponse sent: ' + "MESSAGE: " + message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });

    setInterval(() => {
    con.query("SELECT * FROM logs WHERE id > " + maxId + " ORDER BY id DESC LIMIT 50", function (err, result) {
        if (err) throw err;
	if (result.length > 0) {
        	console.log("Top Result: " + result[0].id, " -- ", result.length);
		maxId = result[0].id;
		connection.sendUTF(JSON.stringify(result));
	}
    });
    }, 1000);

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
