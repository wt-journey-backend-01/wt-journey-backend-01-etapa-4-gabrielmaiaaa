const jwt = require('jsonwebtoken');
const { ApiError } = require("../utils/errorHandler");

function authMiddleware(req, res, next) {
    const tokenHeader = req.headers.authorization;    

    const token = tokenHeader && tokenHeader.split(" ")[1];

    if(!token){
        next(new ApiError(404, "Token errado."));
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if(error){
            next(new ApiError(404, "Chave Secreta diferente."));
        }
        
        req.user = user;
        next();
    })
}

module.exports = authMiddleware