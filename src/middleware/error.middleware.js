const ApiResponse = require("../utils/apiResponse");

module.exports = (err, req, res, next) => {

    console.error(err);

    return res
        .status(err.status || 500)
        .json(
            ApiResponse.error(
                err.message || "Внутренняя ошибка сервера"
            )
        );

};