const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

let playerId = null;

socket.on("connect", () => {

    console.log("🟢 Подключено");

    socket.emit("join-room", {
        code: "MUHBCP",
        nickname: "Shated"
    });

});

socket.on("joined-room", (data) => {

    console.log("✅ Игрок вошёл");

    console.log(data);

    playerId = data.player.id;

    socket.emit("start-game", {
        code: "MUHBCP"
    });

});

socket.on("room-update", (players) => {

    console.log("\n📋 Игроки:");

    console.table(players);

});

socket.on("question-start", (data) => {

    console.log("\n📢 Новый вопрос");

    console.log(data.question);

    // Через 2 секунды автоматически отвечаем
    setTimeout(() => {

        socket.emit("submit-answer", {

            code: "MUHBCP",

            playerId,

            answer: "C"

        });

    }, 2000);

});

socket.on("answer-result", (result) => {

    console.log("\n🎯 Результат ответа");

    console.log(result);

});

socket.on("leaderboard-update", (players) => {

    console.log("\n🏆 Таблица лидеров");

    console.table(players);

});

socket.on("game-finished", (data) => {

    console.log("\n🏁 Игра завершена");

    console.table(data.leaderboard);

    process.exit(0);

});

socket.on("error-message", (err) => {

    console.log("\n❌ Ошибка");

    console.log(err);

});