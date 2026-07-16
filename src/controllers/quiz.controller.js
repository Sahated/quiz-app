const quizService = require("../services/quiz.service");

exports.createQuiz = async (req, res) => {

    try {

        const result = await quizService.createQuiz(
            req.body,
            req.user.id
        );

        res.status(201).json(result);

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.getMyQuizzes = async (req, res) => {

    try {

        const result = await quizService.getMyQuizzes(
            req.user.id
        );

        res.json(result);

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.getQuizById = async (req, res) => {

    try {

        const result = await quizService.getQuizById(
            Number(req.params.id),
            req.user.id
        );

        res.json(result);

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.updateQuiz = async (req, res) => {

    try {

        const result = await quizService.updateQuiz(
            Number(req.params.id),
            req.user.id,
            req.body
        );

        res.json(result);

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.deleteQuiz = async (req, res) => {

    try {

        const result = await quizService.deleteQuiz(
            Number(req.params.id),
            req.user.id
        );

        res.json(result);

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};