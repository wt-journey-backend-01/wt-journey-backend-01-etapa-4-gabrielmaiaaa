const agentesRepository = require("../repositories/agentesRepository")
const errorHandler = require("../utils/errorHandler");
const casosRepository = require("../repositories/casosRepository");

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

async function getAllAgentes(req, res) {
    const { cargo, sort } = req.query;
    
    if(sort !== undefined && sort.trim() === ""){
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro Sort vazio", "parametroVazio", "Parâmetro vazio. Selecionar 'dataDeIncorporacao' ou '-dataDeIncorporacao'."));
    }
    
    if(cargo !== undefined && cargo.trim() === ""){
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro Cargo vazio", "parametroVazio", "Parâmetro vazio. Selecionar 'inspetor' ou 'delegado'."));
    }

    if (cargo) {
        if (cargo !== "inspetor" && cargo !== "delegado") {
            return res.status(400).json(errorHandler.handleError(400, "Cargo inválido", "cargoInvalido", "Tipo de cargo inválido. Selecionar 'inspetor' ou 'delegado'."));
        }

        const dados = await agentesRepository.listarAgentesPorCargo(cargo);
        
        if(!dados){
            return res.status(404).json(errorHandler.handleError(404, "Error ao encontrar agentes", "agenteNaoEncontrado", "Nenhum agente foi encontrado com esse id"));
        }

        return res.status(200).json(dados);
    }

    if (sort) {
        if (sort !== "dataDeIncorporacao" && sort !== "-dataDeIncorporacao") {
            return res.status(400).json(errorHandler.handleError(400, "Tipo de Sort inválido", "tipoSortInvalido", "Tipo de sort inválido. Selecionar 'dataDeIncorporacao' ou '-dataDeIncorporacao'."));
        }

        const dados = await agentesRepository.listarDataDeIncorporacao(sort)

        if (!dados || dados.length === 0) {
            return res.status(404).json(errorHandler.handleError(404, "Nenhum agente encontrado", "agenteNaoEncontrado", "Nenhum agente foi encontrado com esse filtro."));
        }

        return res.status(200).json(dados)
    }

    const dados = await agentesRepository.encontrarAgentes();

    if(!dados){
        return res.status(404).json(errorHandler.handleError(404, "Error ao encontrar agentes", "agenteNaoEncontrado", "Nenhum agente foi encontrado com esse id"));
    }

    res.status(200).json(dados);
}

async function getAgente(req, res) {
    const { id } = req.params;
    
    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente não fornecido", "agenteInvalido", "ID do agente deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
    }
    
    const dados = await agentesRepository.encontrarAgenteById(id);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    }

    res.status(200).json(dados);
}

async function postAgente(req, res) {
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if(typeof nome !== 'string' || typeof dataDeIncorporacao !== 'string' || typeof cargo !== 'string') {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInvalidos", "Os parâmetros 'nome', 'dataDeIncorporacao' e 'cargo' devem ser preenchidos com string."));
    }

    if(!nome || nome.trim() === "" || !dataDeIncorporacao || dataDeIncorporacao.trim() === "" || !cargo || cargo.trim() === "") {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros Obrigatórios", "parametrosObrigatorios", "Parâmetros inválidos."));
    }

    if (!isValidDate(dataDeIncorporacao)) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInválidos", "Data de Incorporação inválida ou no futuro ou com mais de 120 anos."));
    }

    const novoAgente = { nome, dataDeIncorporacao, cargo };
    const dados = await agentesRepository.adicionarAgente(novoAgente);

    if(!dados){
        return res.status(404).json(errorHandler.handleError(404, "Error ao criar agente", "agenteNaoCriado", "Não foi possivel criar esse agente"));
    }
    
    res.status(201).json(dados);
}

async function putAgente(req, res) {
    const { id } = req.params;
    
    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente não fornecido", "agenteInvalido", "ID do agente deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
    }

    const { id: idBody, nome, dataDeIncorporacao, cargo } = req.body;

    if((idBody && idBody !== id) || idBody === "") {
        return res.status(400).json(errorHandler.handleError(400, "Alteração de ID não permitida", "idAlterado", "O Parâmetro 'id' não pode ser alterado."));
    }

    if(typeof nome !== 'string' || typeof dataDeIncorporacao !== 'string' || typeof cargo !== 'string') {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInvalidos", "Os parâmetros 'nome', 'dataDeIncorporacao' e 'cargo' devem ser preenchidos com string."));
    }

    if(!nome || nome.trim() === "" || !dataDeIncorporacao || dataDeIncorporacao.trim() === "" || !cargo || cargo.trim() === "") {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros Obrigatórios", "parametrosObrigatorios", "Parâmetros inválidos."));
    }

    if (!isValidDate(dataDeIncorporacao)) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInválidos", "Data de Incorporação inválida ou no futuro ou com mais de 120 anos."));
    }

    const agenteAtualizado = { nome, dataDeIncorporacao, cargo };
    const dados = await agentesRepository.atualizarAgente(id, agenteAtualizado);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    } 

    res.status(200).json(dados);
}

async function patchAgente(req, res) {
    const { id } = req.params;
    
    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente não fornecido", "agenteInvalido", "ID do agente deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
    }

    const { id: idBody, nome, dataDeIncorporacao, cargo } = req.body;

    if((idBody && idBody !== id) || idBody === "") {
        return res.status(400).json(errorHandler.handleError(400, "Alteração de ID não permitida", "idAlterado", "O parâmetro 'id' não pode ser alterado."));
    }
    
    if(!nome && !dataDeIncorporacao && !cargo) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro Obrigatório", "parametrosObrigatorios", "Pelo menos um parâmetro deve ser fornecido."));
    }

    if((nome && typeof nome !== 'string') || (dataDeIncorporacao && typeof dataDeIncorporacao !== 'string') || (cargo && typeof cargo !== 'string')) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInvalidos", "Os parâmetros 'nome', 'dataDeIncorporacao' ou 'cargo' devem ser preenchidos com string."));
    }

    if((nome && nome.trim() === "") || nome === "" || (dataDeIncorporacao && dataDeIncorporacao.trim() === "") || dataDeIncorporacao === "" || (cargo && cargo.trim() === "") || cargo === "") {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro Vazio", "parametroVazio", "Não pode existir parâmetros vazios."));
    }

    if (dataDeIncorporacao && !isValidDate(dataDeIncorporacao)) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetros inválidos", "parametrosInválidos", "Data de Incorporação inválida ou no futuro ou com mais de 120 anos."));
    }

    const agenteAtualizado = { nome, dataDeIncorporacao, cargo };
    const dados = await agentesRepository.atualizarAgente(id, agenteAtualizado);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    } 
    
    res.status(200).json(dados);
}

async function deleteAgente(req, res) {
    const { id } = req.params;
    
    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente não fornecido", "agenteInvalido", "ID do agente deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do agente inválido", "agenteInvalido", "ID do agente deve ser um número inteiro."));
    }

    const status = await agentesRepository.apagarAgente(id);

    if (!status) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    } 
    
    res.status(204).send();
}

async function getCasosDoAgente(req, res) {
    const { id } = req.params;
    
    if (!id || id.trim() === "") {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso não fornecido", "casoInvalido", "ID do caso deve ser fornecido."));
    }

    if (Number.isNaN(Number(id)) || !Number.isInteger(Number(id))) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso inválido", "casoInvalido", "ID do caso deve ser um número inteiro."));
    }

    if (!await agentesRepository.encontrarAgenteById(id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não foi encontrado com esse id."));
    }

    const casos = await agentesRepository.listarCasosDeAgentes(id);

    if (!casos) {
        return res.status(404).json(errorHandler.handleError(404, "Casos não encontrados", "casosNaoEncontrados", "Casos não foram encontrados para esse agente."));
    }

    res.status(200).json(casos);
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