const jwt = require('jsonwebtoken');
const { ApiError } = require("../utils/errorHandler");

function authMiddleware(req, res, next) {
    try {
        const cookieToken = req.cookies?.access_token;
        const authHeader = req.headers["authorization"];
        const headerToken = authHeader && authHeader.split(" ")[1];

        const token = headerToken || cookieToken;

        if(!token){
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }

        jwt.verify(token, process.env.JWT_SECRET || "secret", (error, user) => {
            if(error){
                return next(new ApiError(401, "Token de autenticação inválido ou expirado."));
            }
            
            req.user = user;
            next();
        });
    } catch (error) {
        next(error);        
    }
}

module.exports = { authMiddleware }