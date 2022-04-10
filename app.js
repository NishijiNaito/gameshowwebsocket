const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);

const io = socketio(server);

app.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //หรือใส่แค่เฉพาะ domain ที่ต้องการได้
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.send('<h1>จ๊ะเอ๋ ตัวเองง</h1>');
});


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.nsj_data = "Nope";
    socket.on('change_data', data => {
        socket.nsj_data = data.nsj_data;
    })
});

server.listen(10252, () => {
    console.log('listening on *:10252');
});