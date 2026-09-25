const { io } = require("socket.io-client");

const TOKEN = process.env.SOCKET_TOKEN;
const ROOM_CODE = process.env.ROOM_CODE;
const NICKNAME = process.env.NICKNAME || "TestPlayer";
const ACTION = process.env.ACTION || "start";

if (!TOKEN) {
    console.error("❌ Не указан SOCKET_TOKEN");
    process.exit(1);
}

if (!ROOM_CODE) {
    console.error("❌ Не указан ROOM_CODE");
    process.exit(1);
}

const socket = io("http://localhost:3000", {
    auth: {
        token: TOKEN
    }
});

socket.on("connect", () => {
    console.log("🟢 Подключено");
    console.log(`🏠 Комната: ${ROOM_CODE}`);
    console.log(`👤 Ник: ${NICKNAME}`);

    socket.emit("join-room", {
        code: ROOM_CODE,
        nickname: NICKNAME
    });
});

socket.on("joined-room", (data) => {
    console.log("✅ Игрок вошёл");
    console.log(data);

    if (ACTION === "start") {
        console.log("🧪 Проверяем попытку игрока запустить игру...");

        socket.emit("start-game", {
            code: ROOM_CODE
        });
    }

    if (ACTION === "finish") {
        console.log("🧪 Проверяем попытку игрока завершить игру...");

        socket.emit("finish-game", {
            code: ROOM_CODE
        });
    }
});

socket.on("error-message", (data) => {
    console.log("❌ Ошибка");
    console.log(data);

    setTimeout(() => {
        socket.disconnect();
        process.exit(0);
    }, 500);
});

socket.on("question-start", (data) => {
    console.log("📢 Новый вопрос");
    console.log(data.question);
});

socket.on("leaderboard-update", (players) => {
    console.log("🏆 Таблица лидеров");
    console.table(players);
});

socket.on("game-finished", (data) => {
    console.log("🏁 Игра завершена");
    console.table(data.leaderboard);

    socket.disconnect();
    process.exit(0);
});

socket.on("connect_error", (error) => {
    console.log("❌ Ошибка подключения Socket.IO:");
    console.log(error.message);

    process.exit(1);
});