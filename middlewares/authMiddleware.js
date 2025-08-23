const jwt = require('jsonwebtoken');
const { ApiError } = require("../utils/errorHandler");

function authMiddleware(req, res, next) {
    const tokenHeader = req.headers.authorization;    

    const token = tokenHeader && tokenHeader.split(" ")[1];

    if(!token){
        return next(new ApiError(401, "Token errado."));
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if(error){
            return next(new ApiError(401, "Chave Secreta diferente."));
        }
        
        req.user = user;
        next();
    })
}

module.exports = authMiddleware