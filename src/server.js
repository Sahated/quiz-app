const http = require("http");

const { Server } = require("socket.io");

const app = require("./app");

const registerGameSocket = require("./sockets/game.socket");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {

    cors: {

        origin: "*"

    }

});

registerGameSocket(io);

server.listen(PORT, () => {

    console.log(`Server started on ${PORT}`);

});