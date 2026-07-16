const roomService = require("../services/room.service");

exports.create = async (req, res) => {

    try {

        const room = await roomService.create(
            req.body.quizId,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Комната успешно создана.",
            data: room
        });

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.join = async (req, res) => {

    try {

        const player = await roomService.join(
            req.body.code,
            req.body.nickname
        );

        res.status(201).json({
            success: true,
            message: "Вы успешно подключились.",
            data: player
        });

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.getRoom = async (req, res) => {

    try {

        const room = await roomService.getRoom(req.params.code);

        res.json({
            success: true,
            data: room
        });

    } catch (err) {

        res.status(err.status || 500).json({
            success: false,
            message: err.message
        });

    }

};

exports.getPlayers = async (req, res) => {

    try {

        const players = await roomService.getPlayers(req.params.code);

        res.json({
            success: true,
            data: players
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

        const result = await roomService.delete(
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