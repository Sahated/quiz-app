const prisma = require("../prisma");

class QuizService {

    async createQuiz(data, ownerId) {

        const { title } = data;

        if (!title || title.trim() === "") {
            throw {
                status: 400,
                message: "Введите название викторины."
            };
        }

        const quiz = await prisma.quiz.create({
            data: {
                title: title.trim(),
                ownerId
            }
        });

        return {
            success: true,
            message: "Викторина успешно создана.",
            data: quiz
        };
    }

    async getMyQuizzes(ownerId) {

        const quizzes = await prisma.quiz.findMany({
            where: {
                ownerId
            },
            include: {
                questions: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return {
            success: true,
            data: quizzes
        };
    }

    async getQuizById(id, ownerId) {

        const quiz = await prisma.quiz.findFirst({
            where: {
                id: Number(id),
                ownerId
            },
            include: {
                questions: {
                    orderBy: {
                        order: "asc"
                    }
                }
            }
        });

        if (!quiz) {
            throw {
                status: 404,
                message: "Викторина не найдена."
            };
        }

        return {
            success: true,
            data: quiz
        };
    }

    async updateQuiz(id, ownerId, data) {

        const quiz = await prisma.quiz.findFirst({
            where: {
                id: Number(id),
                ownerId
            }
        });

        if (!quiz) {
            throw {
                status: 404,
                message: "Викторина не найдена."
            };
        }

        if (!data.title || data.title.trim() === "") {
            throw {
                status: 400,
                message: "Название викторины не может быть пустым."
            };
        }

        const updatedQuiz = await prisma.quiz.update({
            where: {
                id: Number(id)
            },
            data: {
                title: data.title.trim()
            }
        });

        return {
            success: true,
            message: "Викторина успешно обновлена.",
            data: updatedQuiz
        };
    }

    async deleteQuiz(id, ownerId) {

        const quiz = await prisma.quiz.findFirst({
            where: {
                id: Number(id),
                ownerId
            }
        });

        if (!quiz) {
            throw {
                status: 404,
                message: "Викторина не найдена."
            };
        }

        await prisma.quiz.delete({
            where: {
                id: Number(id)
            }
        });

        return {
            success: true,
            message: "Викторина успешно удалена."
        };
    }

}

module.exports = new QuizService();