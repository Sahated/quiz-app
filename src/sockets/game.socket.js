const roomService = require("../services/room.service");
const gameService = require("../services/game.service");

const {
    setRoomTimer,
    clearRoomTimer
} = require("../utils/gameTimers");

function registerGameSocket(io) {

    // Автоматический запуск вопросов
    const startQuestion = async (code) => {

        try {

            const question =
                await gameService.getCurrentQuestion(code);

            // Вопросов больше нет
            if (!question) {

                clearRoomTimer(code);

                const leaderboard =
                    await gameService.getLeaderboard(code);

                io.to(code).emit("game-finished", {

                    leaderboard

                });

                console.log(`🏁 Игра завершена: ${code}`);
                return;
            }

            console.log(
                `📢 Новый вопрос (${question.order}) для комнаты ${code}`
            );

            io.to(code).emit("question-start", {
                question
            });

            clearRoomTimer(code);

            const timer = setTimeout(async () => {

                try {

                    const next =
                        await gameService.nextQuestion(code);

                    if (!next) {

                        clearRoomTimer(code);

                        const leaderboard =
                            await gameService.getLeaderboard(code);

                        io.to(code).emit("game-finished", {
                            leaderboard
                        });

                        console.log(
                            `🏁 Игра завершена: ${code}`
                        );
                        return;
                    }
                    startQuestion(code);
                }

                catch (err) {
                    console.log(err);
                }

            }, question.timeLimit * 1000);

            setRoomTimer(code, timer);
        }

        catch (err) {
            console.log(err);
        }
    };

    io.on("connection", (socket) => {

        console.log(`🟢 Подключился ${socket.id}`);
        
        // Подключение организатора
        socket.on("join-host", ({ code }) => {
            try {
                if (!code) {
                    throw {
                        message: "Не указан код комнаты."
                    };
                }

                socket.join(code);

                socket.emit("joined-host", {
                    success: true
                });

                console.log(
                    `👑 Организатор подключился к комнате ${code}`
                );
            }

            catch (err) {
                socket.emit("error-message", {
                    success: false,
                    message: err.message
                });
            }
        });

        // Подключение игрока
        socket.on("join-room", async (data) => {

            try {

                const { code, nickname } = data;
                const result =
                    await roomService.joinSocket(
                        code,
                        nickname,
                        socket.id
                    );

                socket.join(code);

                socket.emit("joined-room", {
                    success: true,
                    player: result.player
                });

                const players =
                    await roomService.getPlayersByRoomId(
                        result.room.id
                    );

                io.to(code).emit(
                    "room-update",
                    players
                );

                console.log(
                    `👤 ${nickname} вошёл в комнату ${code}`
                );
            }

            catch (err) {
                socket.emit("error-message", {
                    success: false,
                    message: err.message
                });
            }
        });

        // Запуск игры
        socket.on("start-game", async ({ code }) => {

            try {
                await gameService.startGame(code);
                console.log(
                    `🚀 Игра началась: ${code}`
                );
                startQuestion(code);
            }

            catch (err) {
                socket.emit("error-message", {
                    message: err.message
                });
            }
        });

        // Ответ игрока
        socket.on("submit-answer", async (data) => {

            try {

                const result =
                    await gameService.submitAnswer(
                        data.code,
                        data.playerId,
                        data.answer
                    );

                socket.emit("answer-result", result);

                const leaderboard =
                    await gameService.getLeaderboard(
                        data.code
                    );

                io.to(data.code).emit(
                    "leaderboard-update",
                    leaderboard
                );
                console.log(
                    `✅ Игрок ${data.playerId} ответил`
                );
            }

            catch (err) {
                socket.emit("error-message", {
                    success: false,
                    message: err.message
                });
            }
        });

        // Принудительное завершение игры
        socket.on("finish-game", async ({ code }) => {

            try {
                clearRoomTimer(code);
                await gameService.finishGame(code);
                const leaderboard =
                    await gameService.getLeaderboard(code);
                io.to(code).emit("game-finished", {
                    leaderboard
                });
                console.log(
                    `🏁 Игра принудительно завершена: ${code}`
                );
            }

            catch (err) {
                socket.emit("error-message", {
                    success: false,
                    message: err.message
                });
            }
        });

        // Отключение игрока
        socket.on("disconnect", async () => {

            try {
                console.log(`🔴 Отключился ${socket.id}`);
                const prisma = require("../prisma");
                const player =
                    await prisma.player.findFirst({
                        where: {
                            socketId: socket.id
                        }
                    });

                if (player) {
                    await prisma.player.update({
                        where: {
                            id: player.id
                        },
                        data: {
                            socketId: null
                        }
                    });
                }
            }

            catch (err) {
                console.log(err);
            }
        });
    });
}

module.exports = registerGameSocket;
