const usuariosRepository = require('../repositories/usuariosRepository');
const { usuarioRegistroSchema, usuarioLoginSchema, validarID } = require('../utils/usuarioValidacao');
const { ApiError } = require("../utils/errorHandler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

async function register(req, res, next) {
    try{
        const dados = usuarioRegistroSchema.parse(req.body);

        if(await usuariosRepository.encontrarUsuarioPorEmail(dados.email)){            
            return next(new ApiError(400, "Esse email já está em uso."));
        }             

        const senhaHash = await bcrypt.hash(dados.senha, 10);
        const dadosUsuario = { nome: dados.nome, email: dados.email, senha: senhaHash };
        const user = await usuariosRepository.cadastrarUsuario(dadosUsuario);

        if(!user){
            return next(new ApiError(404, "Usuário não foi encontrado."));
        }

        res.status(201).json({id: user.id, nome: user.nome, email: user.email});
    } catch(error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))
        }
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const dados = usuarioLoginSchema.parse(req.body);

        const user = await usuariosRepository.encontrarUsuarioPorEmail(dados.email);

        if(!user){
            return next(new ApiError(404, "Usuário não foi encontrado."));
        }

        const isSenhaValida = await bcrypt.compare(dados.senha, user.senha);

        if(!isSenhaValida){
            return next(new ApiError(401, "Senha errada."));
        }

        const access_token = jwt.sign({id: user.id, nome: user.nome, email: user.email}, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1h'
        })

        res.cookie('access_token', access_token, {
            maxAge: 60*60*1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        })

        res.status(200).json({access_token});        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))
        }
        next(error);
    }
}

async function logout(req, res) {
    res.clearCookie('access_token', { path: '/' });
    
    res.status(200).send();
}

async function deletar(req, res, next) {
    try {
        const { id } = validarID.parse((req.params));    
        
        const status = await usuariosRepository.deletarUsuario(id);

        if(!status){
            return next(new ApiError(404, "Usuário não foi encontrado."));
        }

        res.status(204).send();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        }
        next(error);
    }
}

async function getDados(req, res, next) {
    const user = req.user;

    if(!user) {
        return next(new ApiError(404, "Usuário não foi encontrado."));
    }

    const dados = { nome: user.nome, email: user.email };

    res.status(200).json(dados);    
}

module.exports = {
    register,
    login,
    logout,
    deletar,
    getDados
}