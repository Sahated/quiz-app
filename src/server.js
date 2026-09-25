const jwt = require("jsonwebtoken");

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

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Токен не предоставлен."));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.user = decoded;

        next();
    } catch (error) {
        next(new Error("Недействительный токен."));
    }
});

registerGameSocket(io);

server.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});