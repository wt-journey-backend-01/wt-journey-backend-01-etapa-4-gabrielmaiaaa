const jwt = require('jsonwebtoken');
const { ApiError } = require("../utils/errorHandler");

function authMiddleware(req, res, next) {
    const cookieToken = req.cookies?.access_token;
    const authHeader = req.headers["authorization"];
    const headerToken = authHeader && authHeader.split(" ")[1];

    token = cookieToken || headerToken;    

    if(!token){
        return next(new ApiError(401, "Token de autenticação não fornecido."));
    }

    jwt.verify(token, process.env.JWT_SECRET || "secret", (error, user) => {
        if(error){
            return next(new ApiError(401, "Token de autenticação inválido ou expirado."));
        }
        
        req.user = user;
        next();
    })
}

module.exports = { authMiddleware }