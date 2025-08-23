const usuarioRepository = require('../repositories/usuariosRepository');
const { usuarioRegistroSchema, usuarioLoginSchema, validarID } = require('../utils/usuarioValidacao');
const { ApiError } = require("../utils/errorHandler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { number } = require('zod');

async function register(req, res, next) {
    try{
        const dados = usuarioRegistroSchema.parse(req.body);

        if(await usuarioRepository.encontrarUsuarioPorEmail(dados.email)){            
            next(new ApiError(400, "Esse email já está em uso."));
        }             

        const senhaHash = await bcrypt.hash(dados.senha, 10);
        const dadosUsuario = { nome: dados.nome, email: dados.email, senha: senhaHash };
        const user = await usuarioRepository.cadastrarUsuario(dadosUsuario);

        if(!user){
            next(new ApiError(404, "Usuário não foi encontrado."));
        }
        
        res.status(201).json(user);
    } catch(error) {
        next(error);
        
    }
}

async function login(req, res, next) {
    try {
        const dados = usuarioLoginSchema.parse(req.body);

        const user = await usuarioRepository.encontrarUsuarioPorEmail(dados.email);

        if(!user){
            next(new ApiError(404, "Usuário não foi encontrado."));
        }

        const isSenhaValida = await bcrypt.compare(dados.senha, user.senha);

        if(!isSenhaValida){
            next(new ApiError(401, "Senha errada."));
        }

        const acess_token = jwt.sign({id: user.id, nome: user.nome, email: user.email}, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })

        res.cookie('token', acess_token, {
            maxAge: 60*60*1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/'
        })

        res.status(200).json({acess_token});        
    } catch (error) {
        next(error);
    }
}

async function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    
    res.status(200).send();
}

async function deletar(req, res, next) {
    try {
        const { id } = validarID.parse((req.params));    
        
        const status = await usuarioRepository.deletarUsuario(id);

        if(!status){
            next(new ApiError(404, "Usuário não foi encontrado."));
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function getDados(req, res, next) {
    const user = req.user;

    if(!user) {
        next(new ApiError(404, "Usuário não foi encontrado."));
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