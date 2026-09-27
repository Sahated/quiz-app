const prisma = require("../prisma");

const VALID_ANSWERS = ["A", "B", "C", "D"];

function normalizeAnswers(value) {

    if (Array.isArray(value)) {
        return [...new Set(
            value
                .map((answer) => String(answer).trim().toUpperCase())
                .filter(Boolean)
        )].sort();
    }

    if (typeof value === "string") {
        return [...new Set(
            value
                .split(",")
                .map((answer) => answer.trim().toUpperCase())
                .filter(Boolean)
        )].sort();
    }

    return [];
}

function isAnswerCorrect(userAnswer, correctAnswer, questionType) {

    const userAnswers = normalizeAnswers(userAnswer);
    const correctAnswers = normalizeAnswers(correctAnswer);

    if (userAnswers.length === 0) {
        return false;
    }

    const hasInvalidAnswer = userAnswers.some(
        (answer) => !VALID_ANSWERS.includes(answer)
    );

    if (hasInvalidAnswer) {
        return false;
    }

    if (questionType === "SINGLE") {
        return (
            userAnswers.length === 1 &&
            correctAnswers.length === 1 &&
            userAnswers[0] === correctAnswers[0]
        );
    }

    if (questionType === "MULTIPLE") {

        if (userAnswers.length !== correctAnswers.length) {
            return false;
        }

        return userAnswers.every(
            (answer, index) => answer === correctAnswers[index]
        );
    }

    return false;
}

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

        if (room.isStarted && !room.finished) {
            throw {
                status: 400,
                message: "Игра уже запущена."
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
                finished: false,
                questionStartedAt: new Date()
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
                    finished: true,
                    questionStartedAt: null
                }
            });

            return null;
        }

        await prisma.room.update({
            where: {
                id: room.id
            },
            data: {
                currentQuestion: nextIndex,
                questionStartedAt: new Date()
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
                finished: true,
                questionStartedAt: null
            }
        });

        return room;
    }

    async getGameState(code, playerId) {

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
            return {
                finished: room.finished,
                isStarted: room.isStarted,
                timeLeft: 0,
                answered: false,
                question: null
            };
        }

        let timeLeft = 0;

        if (
            room.isStarted &&
            !room.finished &&
            room.questionStartedAt
        ) {

            const elapsedSeconds = Math.floor(
                (Date.now() - room.questionStartedAt.getTime()) / 1000
            );

            timeLeft = Math.max(
                0,
                question.timeLimit - elapsedSeconds
            );
        }

        let answered = false;

        if (playerId) {

            const answer = await prisma.answer.findFirst({
                where: {
                    playerId: Number(playerId),
                    questionId: question.id
                }
            });

            answered = !!answer;
        }

        return {
            finished: room.finished,
            isStarted: room.isStarted,
            timeLeft,
            answered,

            // ВАЖНО:
            // correctAnswer здесь специально отсутствует.
            question: {
                id: question.id,
                text: question.text,
                imageUrl: question.imageUrl,
                type: question.type,
                optionA: question.optionA,
                optionB: question.optionB,
                optionC: question.optionC,
                optionD: question.optionD,
                timeLimit: question.timeLimit,
                order: question.order
            }
        };
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

        if (room.questionStartedAt) {

            const elapsedSeconds = Math.floor(
                (Date.now() - room.questionStartedAt.getTime()) / 1000
            );

            if (elapsedSeconds >= question.timeLimit) {
                throw {
                    status: 400,
                    message: "Время на ответ истекло."
                };
            }
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

        const normalizedAnswer =
            normalizeAnswers(answer);

        if (normalizedAnswer.length === 0) {
            throw {
                status: 400,
                message: "Необходимо выбрать ответ."
            };
        }

        const hasInvalidAnswer =
            normalizedAnswer.some(
                (item) => !VALID_ANSWERS.includes(item)
            );

        if (hasInvalidAnswer) {
            throw {
                status: 400,
                message: "Недопустимый вариант ответа."
            };
        }

        if (
            question.type === "SINGLE" &&
            normalizedAnswer.length !== 1
        ) {
            throw {
                status: 400,
                message: "Необходимо выбрать только один вариант."
            };
        }

        const isCorrect = isAnswerCorrect(
            normalizedAnswer,
            question.correctAnswer,
            question.type
        );

        const storedAnswer =
            normalizedAnswer.join(",");

        await prisma.answer.create({
            data: {
                playerId: player.id,
                questionId: question.id,
                answer: storedAnswer,
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