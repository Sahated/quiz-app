const prisma = require("../prisma");

const VALID_ANSWERS = ["A", "B", "C", "D"];
const VALID_TYPES = ["SINGLE", "MULTIPLE"];

function normalizeAnswers(value) {
    if (Array.isArray(value)) {
        return value
            .map((answer) => String(answer).trim().toUpperCase())
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((answer) => answer.trim().toUpperCase())
            .filter(Boolean);
    }

    return [];
}

function validateCorrectAnswers(value, type) {
    if (!VALID_TYPES.includes(type)) {
        throw {
            status: 400,
            message: "Тип вопроса должен быть SINGLE или MULTIPLE."
        };
    }

    const answers = normalizeAnswers(value);

    if (answers.length === 0) {
        throw {
            status: 400,
            message: "Не указан правильный ответ."
        };
    }

    const uniqueAnswers = [...new Set(answers)];

    const hasInvalidAnswer = uniqueAnswers.some(
        (answer) => !VALID_ANSWERS.includes(answer)
    );

    if (hasInvalidAnswer) {
        throw {
            status: 400,
            message: "Ответ должен содержать только A, B, C или D."
        };
    }

    if (type === "SINGLE" && uniqueAnswers.length !== 1) {
        throw {
            status: 400,
            message: "Для вопроса с одним ответом необходимо выбрать один вариант."
        };
    }

    if (type === "MULTIPLE" && uniqueAnswers.length < 2) {
        throw {
            status: 400,
            message: "Для вопроса с несколькими ответами необходимо выбрать минимум два варианта."
        };
    }

    return uniqueAnswers.sort().join(",");
}

class QuestionService {

    async create(data, userId) {

        const {
            quizId,
            text,
            imageUrl,
            type = "SINGLE",
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            timeLimit
        } = data;

        if (
            !quizId ||
            !text ||
            !optionA ||
            !optionB ||
            !optionC ||
            !optionD
        ) {
            throw {
                status: 400,
                message: "Не заполнены обязательные поля."
            };
        }

        const questionType = String(type).toUpperCase();

        const normalizedCorrectAnswer =
            validateCorrectAnswers(correctAnswer, questionType);

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

        const questionOrder = lastQuestion
            ? lastQuestion.order + 1
            : 1;

        const question = await prisma.question.create({
            data: {
                quizId: Number(quizId),
                text,
                imageUrl: imageUrl || null,
                type: questionType,
                optionA,
                optionB,
                optionC,
                optionD,
                correctAnswer: normalizedCorrectAnswer,
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

        if (data.text !== undefined) {
            updateData.text = data.text;
        }

        if (data.imageUrl !== undefined) {
            updateData.imageUrl = data.imageUrl || null;
        }

        if (data.optionA !== undefined) {
            updateData.optionA = data.optionA;
        }

        if (data.optionB !== undefined) {
            updateData.optionB = data.optionB;
        }

        if (data.optionC !== undefined) {
            updateData.optionC = data.optionC;
        }

        if (data.optionD !== undefined) {
            updateData.optionD = data.optionD;
        }

        const questionType =
            data.type !== undefined
                ? String(data.type).toUpperCase()
                : question.type;

        if (!VALID_TYPES.includes(questionType)) {
            throw {
                status: 400,
                message: "Тип вопроса должен быть SINGLE или MULTIPLE."
            };
        }

        if (data.type !== undefined) {
            updateData.type = questionType;
        }

        if (data.correctAnswer !== undefined || data.type !== undefined) {

            const correctAnswer =
                data.correctAnswer !== undefined
                    ? data.correctAnswer
                    : question.correctAnswer;

            updateData.correctAnswer =
                validateCorrectAnswers(correctAnswer, questionType);
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