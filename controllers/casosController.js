const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const { ApiError } = require("../utils/errorHandler");
const { validarDadosCasos, validarDadosParcialCasos, validarIDs, validarAgente_idEStatus, validarString } = require('../utils/casosValidacao');
const { z } = require('zod');

async function listarPorAgente(res, agente_id, next) {
    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return next(new ApiError(404, "ID do agente informado não encontrado no sistema."));
    }

    const dados = await casosRepository.listarCasosPorAgente(agente_id);

    if (!dados) {
        return next(new ApiError(404, "Caso não encontrado com esse id de agente"));
    }

    return res.status(200).json(dados);
}

async function listarPorStatus(res, status, next) {
    const dados = await casosRepository.listarCasosPorStatus(status);

    if (!dados) {
        return next(new ApiError(404, "Caso não encontrado com esse status"));
    }

    return res.status(200).json(dados);
}

async function listarPorAgenteEStatus(res, agente_id, next, status) {
    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return next(new ApiError(404, "ID do agente informado não encontrado no sistema."));
    }

    const dados = await casosRepository.listarCasosPorAgenteEStatus(agente_id, status);

    if (!dados) {
        return next(new ApiError(404, "Caso não encontrado com esse agente e status"));
    }

    return res.status(200).json(dados);
}

async function getAllCasos(req, res, next) {
    try {
        const { agente_id, status } = validarAgente_idEStatus.parse(req.query);

        if (agente_id && status) {
            return listarPorAgenteEStatus(res, agente_id, status);
        }

        else if (agente_id) {
            return listarPorAgente(res, agente_id);
        }

        else if (status) {
            return listarPorStatus(res, status);
        }

        const dados = await casosRepository.findAll();

        if (!dados) {
            return next(new ApiError(404, "Nenhum caso registrado em nosso sistema."));
        }

        res.status(200).json(dados);        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))
        }
        next(error);         
    }
}

async function getCaso(req, res, next) {
    try {
        const { id } = validarIDs.parse(req.params);

        const caso = await casosRepository.findById(id);

        if (!caso) {
            return next(new ApiError(404, "Caso não encontrado."));
        }

        res.status(200).json(caso);
    } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new ApiError(404, "ID inválido"))
            } 
            next(error);         
    }
}

async function postCaso(req, res, next) {
    try {
        const { titulo, descricao, status, agente_id } = validarDadosCasos.parse(req.body);

        if (!await agentesRepository.encontrarAgenteById(agente_id)) {
            return next(new ApiError(404, "Agente informado não encontrado."));
        }

        const novoCaso = { titulo, descricao, status, agente_id };
        const dados = await casosRepository.adicionarCaso(novoCaso);

        if(!dados) {
            return next(new ApiError(404, "Agente não foi encontrado com esse id."));
        }

        res.status(201).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))
        }
        next(error); 
    }
}

async function putCaso(req, res, next) {
    try {
        let id;
        try {
            id = validarIDs.parse(req.params);            
        } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new ApiError(404, "ID inválido"))
            } 
            return next(error); 
        }

        const { titulo, descricao, status, agente_id } = validarDadosCasos.parse(req.body);

        if (!await agentesRepository.encontrarAgenteById(agente_id)) {
            return next(new ApiError(404, "Agente não encontrado. Verifique se o agente está registrado no sistema."));
        }

        const casoAtualizado = { titulo, descricao, status, agente_id };
        const dados = await casosRepository.atualizarCaso(id, casoAtualizado);

        if (!dados) {
            return next(new ApiError(404, "Caso não encontrado."));
        }

        res.status(200).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))            
        }
        next(error);   
    }
}

async function patchCaso(req, res, next) {
    try {
        let id;
        try {
            id = validarIDs.parse(req.params);            
        } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new ApiError(404, "ID inválido"))
            } 
            return next(error);              
        }

        const { titulo, descricao, status, agente_id } = validarDadosParcialCasos.parse(req.body);

        const casoAtualizado = { titulo, descricao, status, agente_id };
        const dados = await casosRepository.atualizarCaso(id, casoAtualizado);

        if (!dados) {
            return next(new ApiError(404, "Caso não encontrado."));
        } 

        res.status(200).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))            
        }
        next(error);          
    }
}

async function deleteCaso(req, res, next) {
    try {
        const { id } = validarIDs.parse(req.params);

        const status = await casosRepository.apagarCaso(id);

        if (!status) {
            return next(new ApiError(404, "Caso não encontrado."));
        }

        res.status(204).send();        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        }
        next(error);    
    }
}

async function getAgenteDoCaso(req, res, next) {
    try {
    const { caso_id } = validarIDs.parse(req.params);    

    if (!await casosRepository.findById(caso_id)) {
        return next(new ApiError(404, "ID do caso informado não encontrado."));
    }

    const dados = await casosRepository.encontrarAgenteDoCaso(caso_id);

    if (!dados) {
        return next(new ApiError(404, "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    res.status(200).json(dados);        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        }
        next(error);
    }
}

async function getCasosPorString(req, res, next) {
    try {
    const { q } = validarString.parse(req.query);

    const dados = await casosRepository.encontrarCasoPorString(q);

    if (!dados || dados.length === 0) {
        return next(new ApiError(404, "Nenhum caso encontrado com a palavra fornecida."));
    }

    res.status(200).json(dados);        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))            
        }
        next(error);
    }
}

module.exports = {
   getAllCasos,
   getCaso,
   postCaso,
   putCaso,
   patchCaso,
   deleteCaso,
   getAgenteDoCaso,
   getCasosPorString
}