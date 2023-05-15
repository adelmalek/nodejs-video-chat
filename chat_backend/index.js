/* variables */

const express = require('express');
const cors = require('cors');
const http = require('http');


/* express server */

const app = express();
app.use(cors()); /* middleware */

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


/* pass id to client */

io.on('connection', socket => {
    console.log(`User ${socket.id} has connected.`)

    socket.emit('connected', socket.id);
});
