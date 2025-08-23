const db = require("../db/db")

function formatarData(agente) {
    agente.dataDeIncorporacao = agente.dataDeIncorporacao.toISOString().split('T')[0];
    return agente;
}

async function encontrarAgentes(){
    try {
        const agentes = await db("agentes").select("*").orderBy("id", "asc");

        return agentes.map(agente => formatarData(agente));
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function encontrarAgenteById(id){
    try {
        const agente = await db("agentes").where({id: id});

        if (!agente || agente.length === 0){
            return false;
        }

        return formatarData(agente[0]);
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function adicionarAgente(novoAgente) {
    try {
        const agente = await db("agentes").insert(novoAgente).returning("*");

        return formatarData(agente[0]);
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function atualizarAgente(id, agenteAtualizado) {
    try {
        const agente = await db("agentes").where({id: id}).update(agenteAtualizado).returning("*");

        if (!agente || agente.length === 0) {
            return false;
        }

        return formatarData(agente[0]);
        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function apagarAgente(id) {
    try {
        const agente = await db("agentes").where({id:id}).del();

        if (!agente || agente === 0){
            return false;
        }

        return true;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarAgentesPorCargo(cargo) {
    try {
        const agentes = await db("agentes").select("*").where({cargo:cargo}).orderBy("id", "asc");

        if (!agentes || agentes.length === 0){
            return false;
        }

        return agentes.map(agente => formatarData(agente));        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarDataDeIncorporacao(sort) {
    try {
        if (sort === "dataDeIncorporacao") {
            const agentes = await db("agentes").orderBy("dataDeIncorporacao", "asc");
            return agentes.map(agente => formatarData(agente));
        } else if (sort === "-dataDeIncorporacao") {
            const agentes = await db("agentes").orderBy("dataDeIncorporacao", "desc");
            return agentes.map(agente => formatarData(agente));
        }

        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function listarCasosDeAgentes(id) {
    try {        
        const casos = await db("casos").select("*").where({agente_id:id}).orderBy("id", "asc");

        if (!casos || casos.length === 0) {
            return false;
        }

        return casos;

    } catch (error) {
        console.log(error);
        
        return false;
    }
}

module.exports = {
    encontrarAgentes,
    encontrarAgenteById,
    adicionarAgente,
    atualizarAgente,
    apagarAgente,
    listarAgentesPorCargo,
    listarDataDeIncorporacao,
    listarCasosDeAgentes,
    formatarData
}