/*!
 * Server App Router for Requester and Responser
 * git
 *
 * Copyright (c) 2018 Petrolias Christopher
 * Licensed under the XXX license.
 */
// app.js
var express = require('express');
var fs = require('fs');
var mp = require('./cpmobipass/index');

var app = express();
var options = {
    key: fs.readFileSync('./cer/server.key'),
    cert: fs.readFileSync('./cer/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
};
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/bower_components'));
app.get('/requester', function (req, res, next) {
    res.sendFile(__dirname + '/requester.html');
});
app.get('/responser', function (req, res, next) {
    res.sendFile(__dirname + '/responser.html');
});
app.get('/test', function (req, res, next) {
    res.sendFile(__dirname + '/test.html');
});

io.sockets.on('connection', function (socket) {
    //TODO : ADD Statistics
    console.info('Client connected...');


    socket.on('disconnect', function () {
        //TODO : ADD Statistics
        console.info('Client disconnected...');
    });

    socket.on('responserJoin', function (data) {
        //socket.join(data.room_name);
        console.info('Client join...');
        //TODO : ADD VALIDATIONS
        //TODO : ADD ENCRYPTION
        try {
            var key = data.key || '';
            mp.responserJoin(key, socket);
        } catch (er) {
            console.error(er);
        }
    }); 

    /**
     * Requester socket handler
     */
    socket.on('request', function (data) {
        console.info('Extension request...');
        //TODO : ADD VALIDATIONS
        //TODO : ADD ENCRYPTION
        try {
            var key = data.key || '';
            mp.request(key, { domain: data.domain || '' }, socket);
        } catch (er) {
            console.error(er);
        }
    });

    /**
     * Responser socket handler
     */
    socket.on('response', function (data) {
        console.info('Client response...');
        //TODO : ADD VALIDATIONS
        //TODO : ADD ENCRYPTION
        try {
            var key = data.key || '';
            mp.response(key, {
                domain: data.domain || '',
                username: data.username || '',
                password: data.password || ''
            }, socket);
        } catch (er) {
            console.error(er);
        }
    });
});
var port = process.env.PORT || 8080;
server.listen(port);  