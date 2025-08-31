const jwt = require('jsonwebtoken');
const { ApiError } = require("../utils/errorHandler");

async function authMiddleware(req, res, next) {
    try {
        console.log('🔍 MIDDLEWARE ACIONADO para rota:', req.path);
        
        const authHeader = req.headers["authorization"];
        const headerToken = authHeader && authHeader.split(" ")[1];
        const cookieToken = req.cookies?.access_token;

        console.log('📨 Header Authorization:', authHeader);
        console.log('🔑 Token do Header:', headerToken);
        console.log('🍪 Token do Cookie:', cookieToken);

        const token = headerToken || cookieToken;

        if(!token){
            console.log('❌ NENHUM TOKEN ENCONTRADO');
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }

        console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
        
        // Verifica se JWT_SECRET está definido
        const secret = process.env.JWT_SECRET || "secret";
        console.log('🔐 Secret sendo usado:', secret ? 'DEFINIDO' : 'NÃO DEFINIDO');

        const user = jwt.verify(token, secret);
        console.log('👤 Usuário decodificado:', user);

        req.user = user;
        next();
    } catch (error) {
        console.log('💥 ERRO NO MIDDLEWARE:', error.message);
        console.log('💥 Tipo do erro:', error.name);
        
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(401, "Token expirado."));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError(401, "Token inválido."));
        }
        next(error);        
    }
}

module.exports = authMiddleware;