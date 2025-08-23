const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const errorHandler = require("../utils/errorHandler");

async function listarPorAgente(res, agente_id) {
    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente informado não encontrado no sistema.", "agenteNaoEncontrado", "ID do agente informado não encontrado no sistema."));
    }

    const dados = await casosRepository.listarCasosPorAgente(agente_id);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado com esse id de agente", "casoNaoEncontrado", "Caso não encontrado com esse id de agente"));
    }

    return res.status(200).json(dados);
}

async function listarPorStatus(res, status) {    
    if (status !== "aberto" && status !== "solucionado" ) {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    const dados = await casosRepository.listarCasosPorStatus(status);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado com esse status"));
    }

    return res.status(200).json(dados);
}

async function listarPorAgenteEStatus(res, agente_id, status) {
    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente informado não encontrado no sistema.", "agenteNaoEncontrado", "ID do agente informado não encontrado no sistema."));
    }

    const dados = await casosRepository.listarCasosPorAgenteEStatus(agente_id, status);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado com esse agente e status"));
    }

    return res.status(200).json(dados);
}

async function getAllCasos(req, res) {
    const { agente_id, status } = req.query;

    if((agente_id && agente_id.trim() === "") && (status && status.trim() === "")) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro Vazio", "parametroVazio", "Não pode existir parâmetros vazios."));
    }    

    if(agente_id && (isNaN(Number(agente_id)) || !Number.isInteger(Number(agente_id)))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
    }   

    if (agente_id && status) {
        return listarPorAgenteEStatus(res, agente_id, status);
    }

    else if (agente_id || agente_id === '') {
        return listarPorAgente(res, agente_id);
    }

    else if (status || status === '') {
        return listarPorStatus(res, status);
    }

    const dados = await casosRepository.findAll();

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Casos não encontrados", "casoNaoEncontrado", "Nenhum caso registrado em nosso sistema."));
    }

    res.status(200).json(dados);
}

async function getCaso(req, res) {
    const { id } = req.params;

    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso não fornecido", "casoInvalido", "ID do caso deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso inválido", "casoInvalido", "ID do caso deve ser um número inteiro."));
    }

    const caso = await casosRepository.findById(id);

    if (!caso) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(200).json(caso);
}

async function postCaso(req, res) {
    const { titulo, descricao, status, agente_id } = req.body;

    if(!titulo || titulo.trim() === "" || !descricao || descricao.trim() === "" || !status || status.trim() === "" || !agente_id || String(agente_id).trim() === "") {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInvalidos", "Parâmetros inválidos."));
    }
    
    if(typeof titulo !== 'string' || typeof descricao !== 'string' || typeof status !== 'string') {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInvalidos", "Os parâmetros 'titulo', 'descricao', 'status' devem ser preenchidos corretamente."));
    }

    if (agente_id && (isNaN(Number(agente_id)) || !Number.isInteger(Number(agente_id)))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
    }   

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente informado não encontrado", "agenteNaoEncontrado", "Agente informado não encontrado."));
    }

    const novoCaso = { titulo, descricao, status, agente_id };
    const dados = await casosRepository.adicionarCaso(novoCaso);

    if(!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    }

    res.status(201).json(dados);
}

async function putCaso(req, res) {
    const { id } = req.params;

    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso não fornecido", "casoInvalido", "ID do caso deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso inválido", "casoInvalido", "ID do caso deve ser um número inteiro."));
    }

    const { id: idBody, titulo, descricao, status, agente_id } = req.body;

    if(idBody && idBody !== id) {
        return res.status(400).json(errorHandler.handleError(400, "Alteração de ID não permitida", "idAlterado", "O parâmetro 'id' não pode ser alterado."));
    }

    if(!titulo ||titulo.trim() === "" || !descricao || descricao.trim() === "" || !status || status.trim() === "" || agente_id === undefined || String(agente_id).trim() === "") {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInvalidos", "Parâmetros inválidos."));
    }
    
    if(typeof titulo !== 'string' || typeof descricao !== 'string' || typeof status !== 'string') {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInvalidos", "Os parâmetros 'titulo', 'descricao', 'status' devem ser preenchidos corretamente."));
    }

    if (agente_id && (isNaN(Number(agente_id)) || !Number.isInteger(Number(agente_id)))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
    }   

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    if (!await agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = await casosRepository.atualizarCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(200).json(dados);
}

async function patchCaso(req, res) {
    const { id } = req.params;

    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso não fornecido", "casoInvalido", "ID do caso deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso inválido", "casoInvalido", "ID do caso deve ser um número inteiro."));
    }

    const { id: idBody, titulo, descricao, status, agente_id } = req.body;

    if(idBody && idBody !== id) {
        return res.status(400).json(errorHandler.handleError(400, "Alteração de ID não permitida", "idAlterado", "O parâmetro 'id' não pode ser alterado."));
    }

    if (!titulo && !descricao && !status && !agente_id) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros Obrigatórios", "parametrosObrigatorios", "Pelo menos um parâmetro deve ser fornecido."));
    }
    
    if((titulo && typeof titulo !== 'string') || (descricao && typeof descricao !== 'string') || (status && typeof status !== 'string')) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInvalidos", "Os parâmetros 'titulo', 'descricao' ou 'status' devem ser preenchidos corretamente."));
    }

    if (agente_id !== undefined) {
        if (typeof agente_id === "string") {
            return res.status(404).json(errorHandler.handleError(404, "ID do agente não fornecido", "agenteInvalido", "ID do agente deve ser fornecido no formato de número."));
        }

        if(isNaN(Number(agente_id)) || !Number.isInteger(Number(agente_id))) {
            return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
        }   

        if (!await agentesRepository.encontrarAgenteById(agente_id)) {
            return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
        }
    }

    if((titulo && titulo.trim() === "") || titulo === "" || (descricao && descricao.trim() === "") || descricao === "" || (status && status.trim() === "") || status === "") {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro Vazio", "parametroVazio", "Não pode existir parâmetros vazios."));
    }

    if (status && status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = await casosRepository.atualizarCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    } 

    res.status(200).json(dados);
}

async function deleteCaso(req, res) {
    const { id } = req.params;

    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso não fornecido", "casoInvalido", "ID do caso deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso inválido", "casoInvalido", "ID do caso deve ser um número inteiro."));
    }

    const status = await casosRepository.apagarCaso(id);

    if (!status) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(204).send();
}

async function getAgenteDoCaso(req, res) {
    const { caso_id } = req.params;    

    if (!caso_id || caso_id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso não fornecido", "casoInvalido", "ID do caso deve ser fornecido."));
    }

    if (Number.isNaN(Number(caso_id)) || !Number.isInteger(Number(caso_id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso inválido", "casoInvalido", "ID do caso deve ser um número inteiro."));
    }

    if (!await casosRepository.findById(caso_id)) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso informado não encontrado", "casoNaoEncontrado", "ID do caso informado não encontrado."));
    }

    const dados = await casosRepository.encontrarAgenteDoCaso(caso_id);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    res.status(200).json(dados)
}

async function getCasosPorString(req, res) {
    const { q } = req.query;

    if(!q || q.trim() === "") {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro não encontrado", "parametroNaoEncontrado", "Verifique se está utilizando o parametro 'q' e se colocou alguma palavra para buscar."));
    }

    const dados = await casosRepository.encontrarCasoPorString(q);

    if (!dados || dados.length === 0) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Nenhum caso encontrado com a palavra fornecida."));
    }

    res.status(200).json(dados);
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