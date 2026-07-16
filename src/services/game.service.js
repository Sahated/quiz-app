const prisma = require("../prisma");

class GameService {

    async startGame(code) {

        const room = await prisma.room.findUnique({
            where: {
                code
            },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: {
                                order: "asc"
                            }
                        }
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

        if (room.quiz.questions.length === 0) {
            throw {
                status: 400,
                message: "В викторине нет вопросов."
            };
        }

        await prisma.answer.deleteMany({
            where: {
                player: {
                    roomId: room.id
                }
            }
        });

        await prisma.player.updateMany({
            where: {
                roomId: room.id
            },
            data: {
                score: 0
            }
        });

        await prisma.room.update({
            where: {
                id: room.id
            },
            data: {
                isStarted: true,
                currentQuestion: 0,
                finished: false
            }
        });
        
        return {
            room,
            question: room.quiz.questions[0]
        };
    }

    async getCurrentQuestion(code) {

        const room = await prisma.room.findUnique({
            where: {
                code
            },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: {
                                order: "asc"
                            }
                        }
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

        const question =
            room.quiz.questions[room.currentQuestion];

        if (!question) {
            return null;
        }

        return question;
    }

    async nextQuestion(code) {

        const room = await prisma.room.findUnique({
            where: {
                code
            },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: {
                                order: "asc"
                            }
                        }
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

        const nextIndex = room.currentQuestion + 1;

        if (nextIndex >= room.quiz.questions.length) {

            await prisma.room.update({
                where: {
                    id: room.id
                },
                data: {
                    finished: true
                }
            });

            return null;
        }

        await prisma.room.update({
            where: {
                id: room.id
            },
            data: {
                currentQuestion: nextIndex
            }
        });

        return room.quiz.questions[nextIndex];
    }

    async finishGame(code) {

        const room = await prisma.room.update({
            where: {
                code
            },
            data: {
                finished: true
            }
        });

        return room;
    }

    async getLeaderboard(code) {

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

        const players = await prisma.player.findMany({
            where: {
                roomId: room.id
            },
            orderBy: {
                score: "desc"
            }
        });

        return players;
    }

    async submitAnswer(code, playerId, answer) {

        const room = await prisma.room.findUnique({
            where: {
                code
            },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: {
                                order: "asc"
                            }
                        }
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

        if (!room.isStarted) {
            throw {
                status: 400,
                message: "Игра ещё не началась."
            };
        }
        
        if (room.finished) {
            throw {
                status: 400,
                message: "Игра уже завершена."
            };
        }

        const question =
            room.quiz.questions[room.currentQuestion];

        if (!question) {
            throw {
                status: 400,
                message: "Нет активного вопроса."
            };
        }

        const player = await prisma.player.findFirst({
            where: {
                id: Number(playerId),
                roomId: room.id
            }
        });

        if (!player) {
            throw {
                status: 404,
                message: "Игрок не найден."
            };
        }

        const alreadyAnswered =
            await prisma.answer.findFirst({
                where: {
                    playerId: player.id,
                    questionId: question.id
                }
            });

        if (alreadyAnswered) {
            throw {
                status: 400,
                message: "Ответ уже отправлен."
            };
        }

        const isCorrect =
            answer === question.correctAnswer;

        await prisma.answer.create({

            data: {

                playerId: player.id,

                questionId: question.id,

                answer,

                isCorrect

            }

        });

        if (isCorrect) {

            await prisma.player.update({

                where: {
                    id: player.id
                },

                data: {
                    score: {
                        increment: 100
                    }
                }

            });

        }

        const updatedPlayer =
            await prisma.player.findUnique({

                where: {
                    id: player.id
                }

            });

        return {

            correct: isCorrect,

            score: updatedPlayer.score

        };

    }
}

module.exports = new GameService();