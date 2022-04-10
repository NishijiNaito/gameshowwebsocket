const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");


let question_set = [];



const app = new App();
const io = new Server({
    origins: ["*"],
    cors: {
        // methods: ["GET", "POST"],
        allowedHeaders: ["Access-Control-Allow-Origin:*"],
        // credentials: true
    }
});


io.attachApp(app);

io.on("connection", (socket) => {
    // console.log(socket);
    socket.username = socket.id;
    // const userId = ;
    console.log(socket.username + ' a user connected');



    socket.emit('yeet', { "username": socket.username });
    // socket.emit('send_info', { "data": socket })

    socket.on('yeet', () => {
        console.log("user yeet you")
        socket.emit('yeet', { "username": socket.username });

    });

    socket.on('yeet_everyone', () => {
        console.log(socket.username + " yeet everyone")
        socket.broadcast.emit('yeet_everyone', { "username": socket.username });
    });
    socket.on('disconnect', () => {
        console.log(socket.username + " user disconnect")
    })
});
app.listen(10252, (token) => {
    if (!token) {
        console.warn("port already in use");
    }
    console.log("port start in 10252")
});