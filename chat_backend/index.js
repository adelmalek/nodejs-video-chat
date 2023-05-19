/* variables */

const express = require('express');
const cors = require('cors');
const http = require('http');
const favicon = require('serve-favicon');
const path = require('path');


/* express server */

const app = express();
app.use(cors()); /* middleware */
app.use(favicon(path.join(__dirname, 'icon', 'favicon-16x16.png')));

const httpAppServer = http.createServer(app);
const port = process.env.PORT ?? 8000;
httpAppServer.listen(
    port,
    () => {
        console.log(`Server is running on ${port}`)
    }
);

app.get('/', (req, res) => {
    res.send({
        status: 200
    })
});


/* socket.io server */

const { Server } = require('socket.io');
const io = new Server(
    httpAppServer,
    {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    }
);


/* 
pass id to client
get receiverPeer id from client
 */

io.on('connection', socket => {
    console.log(`User ${socket.id} has connected.`)

    socket.emit('connected', socket.id);

    socket.on('send-call', (payload) => {
        console.log("callerPeer sends a call to: ", payload.targetUserId);
        if (payload.targetUserId === payload.sourceUserId) {
            return;
        }
        io.to(payload.targetUserId).emit('call', payload);
    });

    socket.on('answer-call', (payload) => {
        console.log("receiverPeer answers callerPeer: ", payload.targetUserId);
        io.to(payload.targetUserId).emit('answered', payload);
    })
});