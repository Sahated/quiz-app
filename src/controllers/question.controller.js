const questionService = require("../services/question.service");

exports.create = async (req, res) => {

    try {

        const question = await questionService.create(
            req.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Вопрос успешно создан.",
            data: question
        });

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.getAll = async (req, res) => {

    try {

        const questions = await questionService.getAll(
            req.params.quizId,
            req.user.id
        );

        res.json({
            success: true,
            data: questions
        });

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.getOne = async (req, res) => {

    try {

        const question = await questionService.getOne(
            req.params.id,
            req.user.id
        );

        res.json({
            success: true,
            data: question
        });

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.update = async (req, res) => {

    try {

        const question = await questionService.update(
            req.params.id,
            req.body,
            req.user.id
        );

        res.json({
            success: true,
            message: "Вопрос обновлен.",
            data: question
        });

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.delete = async (req, res) => {

    try {

        const result = await questionService.delete(
            req.params.id,
            req.user.id
        );

        res.json({
            success: true,
            message: result.message
        });

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};