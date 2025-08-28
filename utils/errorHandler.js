class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.name = ApiError;
        this.status = status;
    }
}

function errorHandler(err, req, res, next) {
    res.status(err.status || 500).json({
        status: err.status || 500,
        message: err.message || 'Erro interno no servidor.',
    });
}

function handleError(status, message, tipo, errorMessage) {
    const error = {
        "status": status,
        "message": message,
        "errors": {
            [tipo]: errorMessage
        }
    };

    return error;
}

module.exports = {
    ApiError,
    errorHandler,
    handleError
};