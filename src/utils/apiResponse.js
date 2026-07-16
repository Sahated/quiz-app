class ApiResponse {

    static success(message, data = null) {

        return {
            success: true,
            message,
            data
        };

    }

    static error(message) {

        return {
            success: false,
            message
        };

    }

}

module.exports = ApiResponse;