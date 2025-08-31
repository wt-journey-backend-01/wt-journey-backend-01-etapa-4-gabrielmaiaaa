const jwt = require('jsonwebtoken');
const { ApiError } = require("../utils/errorHandler");

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];
        const headerToken = authHeader && authHeader.split(" ")[1];
        const cookieToken = req.cookies?.access_token;

        const token = headerToken || cookieToken;

        if(!token){
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }

        const user = jwt.verify(token, process.env.JWT_SECRET || "secret");

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(401, "Token expirado."));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError(401, "Token inválido."));
        }
        next(error);        
    }
}

module.exports = authMiddleware 