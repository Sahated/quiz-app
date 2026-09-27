const prisma = require("../src/prisma");

async function migrateHistory() {
    console.log("Начинаем перенос истории...\n");

    const rooms = await prisma.room.findMany({
        where: {
            finished: true
        },
        include: {
            quiz: {
                select: {
                    id: true,
                    title: true
                }
            },
            host: {
                select: {
                    id: true,
                    username: true
                }
            },
            players: {
                where: {
                    userId: {
                        not: null
                    }
                },
                orderBy: {
                    score: "desc"
                },
                select: {
                    id: true,
                    userId: true,
                    score: true
                }
            }
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    console.log(`Найдено завершённых комнат: ${rooms.length}\n`);

    let created = 0;
    let skipped = 0;

    for (const room of rooms) {
        console.log(
            `Комната ${room.code} | Квиз: ${room.quiz.title}`
        );

        // ==========================================
        // 1. История организатора
        // ==========================================

        const existingHostHistory =
            await prisma.gameHistory.findFirst({
                where: {
                    userId: room.hostId,
                    roomCode: room.code,
                    role: "HOST"
                }
            });

        if (!existingHostHistory) {
            await prisma.gameHistory.create({
                data: {
                    userId: room.hostId,
                    quizId: room.quiz.id,
                    quizTitle: room.quiz.title,
                    role: "HOST",
                    roomCode: room.code,
                    score: 0,
                    place: 0,
                    playedAt: room.createdAt
                }
            });

            created++;

            console.log(
                `  + HOST: ${room.host.username}`
            );
        } else {
            skipped++;
        }

        // ==========================================
        // 2. История авторизованных игроков
        // ==========================================

        for (let index = 0; index < room.players.length; index++) {
            const player = room.players[index];

            // Место в таблице результатов.
            // Сохраняем ту же логику, которая уже использовалась
            // в старом history.service.js.
            const place = index + 1;

            const existingPlayerHistory =
                await prisma.gameHistory.findFirst({
                    where: {
                        userId: player.userId,
                        roomCode: room.code,
                        role: "PLAYER"
                    }
                });

            if (existingPlayerHistory) {
                skipped++;
                continue;
            }

            await prisma.gameHistory.create({
                data: {
                    userId: player.userId,
                    quizId: room.quiz.id,
                    quizTitle: room.quiz.title,
                    role: "PLAYER",
                    roomCode: room.code,
                    score: player.score,
                    place,
                    playedAt: room.createdAt
                }
            });

            created++;

            console.log(
                `  + PLAYER: userId=${player.userId}, ` +
                `score=${player.score}, place=${place}`
            );
        }

        console.log("");
    }

    console.log("=================================");
    console.log("Перенос истории завершён.");
    console.log(`Создано записей: ${created}`);
    console.log(`Пропущено записей: ${skipped}`);
    console.log("=================================");
}

migrateHistory()
    .catch((error) => {
        console.error("Ошибка переноса истории:");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
