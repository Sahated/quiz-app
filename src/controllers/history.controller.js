const historyService = require("../services/history.service");

exports.getPlayerHistory = async (req, res) => {
    try {
        const history = await historyService.getPlayerHistory(
            req.user.id
        );

        res.json({
            success: true,
            data: history
        });

    } catch (err) {
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Не удалось получить историю."
        });
    }
};
