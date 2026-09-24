const prisma = require("../prisma");

class QuestionService {

    async create(data, userId) {

        const {
            quizId,
            text,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            timeLimit,
            order
        } = data;

        if (
            !quizId ||
            !text ||
            !optionA ||
            !optionB ||
            !optionC ||
            !optionD ||
            !correctAnswer
        ) {
            throw {
                status: 400,
                message: "Не заполнены обязательные поля."
            };
        }

        const validAnswers = ["A", "B", "C", "D"];

        if (!validAnswers.includes(correctAnswer)) {
            throw {
                status: 400,
                message: "Правильный ответ должен быть A, B, C или D."
            };
        }

        const time = Number(timeLimit) || 20;

        if (isNaN(time) || time < 5 || time > 120) {
            throw {
                status: 400,
                message: "Время ответа должно быть от 5 до 120 секунд."
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
        
    const lastQuestion = await prisma.question.findFirst({
        where: {
            quizId: Number(quizId)
        },
        orderBy: {
            order: "desc"
        }
    });

    const questionOrder = lastQuestion ? lastQuestion.order + 1 : 1;
    
        const question = await prisma.question.create({
            data: {
                quizId: Number(quizId),
                text,
                optionA,
                optionB,
                optionC,
                optionD,
                correctAnswer,
                timeLimit: time,
                order: questionOrder
            }
        });

        return question;
    }

    async getAll(quizId, userId) {

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

        return prisma.question.findMany({
            where: {
                quizId: Number(quizId)
            },
            orderBy: {
                order: "asc"
            }
        });

    }

    async getOne(id, userId) {

        const question = await prisma.question.findFirst({
            where: {
                id: Number(id),
                quiz: {
                    ownerId: userId
                }
            }
        });

        if (!question) {
            throw {
                status: 404,
                message: "Вопрос не найден."
            };
        }

        return question;

    }

    async update(id, data, userId) {

        const question = await prisma.question.findFirst({
            where: {
                id: Number(id),
                quiz: {
                    ownerId: userId
                }
            }
        });

        if (!question) {
            throw {
                status: 404,
                message: "Вопрос не найден."
            };
        }

        const updateData = {};

        if (data.text !== undefined)
            updateData.text = data.text;

        if (data.optionA !== undefined)
            updateData.optionA = data.optionA;

        if (data.optionB !== undefined)
            updateData.optionB = data.optionB;

        if (data.optionC !== undefined)
            updateData.optionC = data.optionC;

        if (data.optionD !== undefined)
            updateData.optionD = data.optionD;

        if (data.correctAnswer !== undefined) {

            const validAnswers = ["A", "B", "C", "D"];

            if (!validAnswers.includes(data.correctAnswer)) {
                throw {
                    status: 400,
                    message: "Правильный ответ должен быть A, B, C или D."
                };
            }

            updateData.correctAnswer = data.correctAnswer;
        }

        if (data.timeLimit !== undefined) {

            const time = Number(data.timeLimit);

            if (isNaN(time) || time < 5 || time > 120) {
                throw {
                    status: 400,
                    message: "Время ответа должно быть от 5 до 120 секунд."
                };
            }

            updateData.timeLimit = time;
        }

        if (data.order !== undefined) {

            const questionOrder = Number(data.order);

            if (isNaN(questionOrder) || questionOrder < 1) {
                throw {
                    status: 400,
                    message: "Порядковый номер должен быть больше 0."
                };
            }

            updateData.order = questionOrder;
        }

        const updatedQuestion = await prisma.question.update({
            where: {
                id: Number(id)
            },
            data: updateData
        });

        return updatedQuestion;

    }

    async delete(id, userId) {

        const question = await prisma.question.findFirst({
            where: {
                id: Number(id),
                quiz: {
                    ownerId: userId
                }
            }
        });

        if (!question) {
            throw {
                status: 404,
                message: "Вопрос не найден."
            };
        }

        await prisma.question.delete({
            where: {
                id: Number(id)
            }
        });

        const remainingQuestions = await prisma.question.findMany({
            where: {
                quizId: question.quizId
            },
            orderBy: {
                order: "asc"
            }
        });

        for (let i = 0; i < remainingQuestions.length; i++) {
            await prisma.question.update({
                where: {
                    id: remainingQuestions[i].id
                },
                data: {
                    order: i + 1
                }
            });
        }

        return {
            message: "Вопрос успешно удалён."
        };

    }

}

module.exports = new QuestionService();