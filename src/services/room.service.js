const prisma = require("../prisma");

function generateCode(length = 6) {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for (let i = 0; i < length; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return code;
}

class RoomService {

    async create(quizId, userId) {

        if (!quizId) {
            throw {
                status: 400,
                message: "Не указана викторина."
            };
        }

        const quiz = await prisma.quiz.findFirst({
            where: {
                id: Number(quizId),
                ownerId: userId
            }
        });

        if (!quiz) {
            throw {
                status: 404,
                message: "Викторина не найдена."
            };
        }

        let code;

        while (true) {
            code = generateCode();
            const exists = await prisma.room.findUnique({
                where: {
                    code
                }
            });
            if (!exists) break;
        }

        const room = await prisma.room.create({
            data: {
                code,
                quizId: Number(quizId)
            }
        });
        return room;
    }

    async join(code, nickname) {

        if (!code || !nickname) {
            throw {
                status: 400,
                message: "Введите код комнаты и ник."
            };
        }

        const room = await prisma.room.findUnique({
            where: {
                code
            }
        });

        if (!room) {
            throw {
                status: 404,
                message: "Комната не найдена."
            };
        }

        if (room.finished) {
            throw {
                status: 400,
                message: "Игра уже завершена."
            };
        }

        if (room.isStarted) {
            throw {
                status: 400,
                message: "Игра уже началась. Вход новых игроков закрыт."
            };
        }

        const exists = await prisma.player.findFirst({
            where: {
                roomId: room.id,
                nickname
            }
        });

        if (exists) {
            throw {
                status: 400,
                message: "Такой ник уже используется."
            };
        }

        const player = await prisma.player.create({
            data: {
                nickname,
                roomId: room.id
            }
        });

        return player;
    }

    async getRoom(code) {
        const room = await prisma.room.findUnique({
            where: {
                code
            },

            include: {
                quiz: true,
                players: {
                    orderBy: {
                        score: "desc"
                    }
                }
            }
        });

        if (!room) {
            throw {
                status: 404,
                message: "Комната не найдена."
            };
        }

        return room;
    }

    async getPlayers(code) {
        const room = await prisma.room.findUnique({
            where: {
                code
            }
        });

        if (!room) {
            throw {
                status: 404,
                message: "Комната не найдена."
            };
        }

        return prisma.player.findMany({
            where: {
                roomId: room.id
            },
            orderBy: {
                score: "desc"
            }
        });
    }

    async delete(id, userId) {
        const room = await prisma.room.findFirst({
            where: {
                id: Number(id),
                quiz: {
                    ownerId: userId
                }
            }
        });

        if (!room) {
            throw {
                status: 404,
                message: "Комната не найдена."
            };
        }

        await prisma.room.delete({
            where: {
                id: Number(id)
            }
        });

        return {

            message: "Комната удалена."
        };
    }

async joinSocket(code, nickname, socketId) {

    if (!code || !nickname) {
        throw {
            status: 400,
            message: "Введите код комнаты и ник."
        };
    }

    const room = await prisma.room.findUnique({
        where: {
            code
        }
    });

    if (!room) {
        throw {
            status: 404,
            message: "Комната не найдена."
        };
    }

    if (room.finished) {
        throw {
            status: 400,
            message: "Игра уже завершена."
        };
    }

    let player = await prisma.player.findFirst({
        where: {
            roomId: room.id,
            nickname
        }
    });

    if (room.isStarted && !player) {
        throw {
            status: 400,
            message: "Игра уже началась. Вход новых игроков закрыт."
        };
    }

    console.log(
    "🔄 Подключение игрока:",
        player
            ? {
                id: player.id,
                nickname: player.nickname,
                score: player.score
            }
            : "НОВЫЙ ИГРОК"
    );

    // Если игрок уже существует — обновляем socketId
    if (player) {

        player = await prisma.player.update({
            where: {
                id: player.id
            },
            data: {
                socketId
            }
        });

    } else {

        // Если игрока нет — создаем нового
        player = await prisma.player.create({
            data: {
                nickname,
                roomId: room.id,
                socketId
            }
        });

    }

    return {
        room,
        player
    };

    }
    async getPlayersByRoomId(roomId) {

        return prisma.player.findMany({
            where: {
                roomId
            },
            orderBy: {
                score: "desc"
            }
        });
    }
}

module.exports = new RoomService();