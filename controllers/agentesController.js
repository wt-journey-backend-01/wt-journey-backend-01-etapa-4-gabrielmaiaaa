const agentesRepository = require("../repositories/agentesRepository");
const { ApiError } = require("../utils/errorHandler");
const { dadosAgentes, dadosParcialAgentes, agenteIdValido, agenteCargoESorteValido } = require('../utils/agenteValidacao');
const { z } = require('zod');

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    const [ano, mes, dia] = dateString.split('-').map(Number);
    const data = new Date(ano, mes-1, dia);

    if (data.getFullYear() !== ano || data.getMonth() + 1 !== mes || data.getDate() !== dia) {
        return false;
    }

    if (!regex.test(dateString)) {
        return false;
    }

    if (isNaN(data.getTime())) {
        return false;
    }

    const hoje = new Date();
    if (data > hoje){
        return false;
    }

    const limiteTempo = new Date();
    limiteTempo.setFullYear(limiteTempo.getFullYear() - 120);

    if (data < limiteTempo) {
        return false;
    }

    return true;
}

async function getAllAgentes(req, res, next) {
    try{
        const { cargo, sort } = agenteCargoESorteValido.parse(req.query);       

        if (cargo) {
        
            if (!req.user) {
                return next(new ApiError(401, "Token de autenticação não fornecido."));
            }
            
            const dados = await agentesRepository.listarAgentesPorCargo(cargo);
            
            if(!dados){
                return next(new ApiError(404, "Nenhum agente foi encontrado com esse cargo"));
            }

            return res.status(200).json(dados);
        }

        if (sort) {
        
            if (!req.user) {
                return next(new ApiError(401, "Token de autenticação não fornecido."));
            }

            const dados = await agentesRepository.listarDataDeIncorporacao(sort)

            if (!dados || dados.length === 0) {
                return next(new ApiError(404, "Nenhum agente foi encontrado com esse filtro."));
            }

            return res.status(200).json(dados)
        }

        const dados = await agentesRepository.encontrarAgentes();

        if(!dados){
            return next(new ApiError(404, "Nenhum agente foi encontrado com esse id"));
        }

        res.status(200).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))
        }
        next(error);
    }
}

async function getAgente(req, res, next) {
    try {        
        const { id } = agenteIdValido.parse(req.params);

        if (!req.user) {
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }
        
        const dados = await agentesRepository.encontrarAgenteById(id);

        if (!dados) {
            return next(new ApiError(404, "Agente não foi encontrado com esse id."));
        }

        res.status(200).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        }
        return next(error);
    }
}

async function postAgente(req, res, next) {
    try {
        const { nome, dataDeIncorporacao, cargo } = dadosAgentes.parse(req.body);    
        
        if (!req.user) {
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }    

        if (!isValidDate(dataDeIncorporacao)) {
            return next(new ApiError(400, "Data de Incorporação inválida ou no futuro ou com mais de 120 anos."));
        }

        const novoAgente = { nome, dataDeIncorporacao, cargo };
        const dados = await agentesRepository.adicionarAgente(novoAgente);

        if(!dados){
            return next(new ApiError(404, "Não foi possivel criar esse agente"));
        }
        
        res.status(201).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))
        }
        next(error);
    }
}

async function putAgente(req, res, next) {
    try {
        let id;
        try {
            id = agenteIdValido.parse(req.params).id;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new ApiError(404, "ID inválido"))
            } 
            return next(error);  
        }

        const { nome, dataDeIncorporacao, cargo } = dadosAgentes.parse(req.body);
        
        if (!req.user) {
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }

        if (!isValidDate(dataDeIncorporacao)) {
            return next(new ApiError(400, "Data de Incorporação inválida ou no futuro ou com mais de 120 anos."));
        }

        const agenteAtualizado = { nome, dataDeIncorporacao, cargo };
        const dados = await agentesRepository.atualizarAgente(id, agenteAtualizado);

        if (!dados) {
            return next(new ApiError(404, "Agente não foi encontrado com esse id."));
        } 

        res.status(200).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))            
        }
        next(error);   
    }
}

async function patchAgente(req, res, next) {
    try {
        let id;
        try {
            id = agenteIdValido.parse(req.params).id;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new ApiError(404, "ID inválido"))
            } 
            return next(error);  
        }

        const { nome, dataDeIncorporacao, cargo } = dadosParcialAgentes.parse(req.body);
        
        if (!req.user) {
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }
        
        if (dataDeIncorporacao && !isValidDate(dataDeIncorporacao)) {
            return next(new ApiError(400, "Data de Incorporação inválida ou no futuro ou com mais de 120 anos."));
        }

        const agenteAtualizado = { nome, dataDeIncorporacao, cargo };
        const dados = await agentesRepository.atualizarAgente(id, agenteAtualizado);

        if (!dados) {
            return next(new ApiError(404, "Agente não foi encontrado com esse id."));
        } 
        
        res.status(200).json(dados);        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))            
        }
        next(error);        
    }
}

async function deleteAgente(req, res, next) {
    try {
        const { id } = agenteIdValido.parse(req.params);
        
        if (!req.user) {
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }

        const status = await agentesRepository.apagarAgente(id);

        if (!status) {
            return next(new ApiError(404, "Agente não foi encontrado com esse id."));
        } 
        
        res.status(204).send();        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        }
        next(error);
    }
}

async function getCasosDoAgente(req, res, next) {
    try {
        const { id } = agenteIdValido.parse(req.params);
        
        if (!req.user) {
            return next(new ApiError(401, "Token de autenticação não fornecido."));
        }

        if (!await agentesRepository.encontrarAgenteById(id)) {
            return next(new ApiError(404, "Agente não foi encontrado com esse id."));
        }

        const casos = await agentesRepository.listarCasosDeAgentes(id);

        if (!casos) {
            return next(new ApiError(404, "Casos não foram encontrados para esse agente."));
        }

        res.status(200).json(casos);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        }
        next(error);        
    }
}

module.exports = {
    getAllAgentes,
    getAgente,
    postAgente,
    putAgente,
    patchAgente,
    deleteAgente,
    getCasosDoAgente
}