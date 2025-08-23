const db = require("../db/db")
const agentesRepository = require("../repositories/agentesRepository");

async function findAll() {
    try {
        const casos = await db("casos").select("*").orderBy("id", "asc");

        return casos;
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function findById(id) {
    try {
        const caso = await db("casos").where({id: id})

        if (!caso || caso.length === 0){
            return false;
        }

        return caso[0];
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function adicionarCaso(dados) {
    try {
        const caso = await db("casos").insert(dados).returning("*");

        return caso[0];
    } catch (error) {
        console.log(error);

        return false;
    }
}

async function atualizarCaso(id, casoAtualizado) {
    try {
        const caso = await db("casos").where({id: id}).update(casoAtualizado).returning('*');

        if (!caso || caso.length === 0) {
            return false;
        }

        return caso[0];
        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function apagarCaso(id) {
    try {
        const caso = await db("casos").where({id:id}).del();

        if (!caso || caso === 0){
            return false;
        }

        return true;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarCasosPorAgente(agente_id) {
    try {
        const casos = await db("casos").where({agente_id:agente_id}).orderBy("id", "asc");

        if (!casos || casos.length === 0){
            return false;
        }

        return casos;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarCasosPorStatus(status) {
    try {
        const casos = await db("casos").where({status:status}).orderBy("id", "asc");

        if (!casos || casos.length === 0){
            return false;
        }

        return casos;
        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function listarCasosPorAgenteEStatus(agente_id, status) {
    try {
        const casos = await db("casos").where({agente_id:agente_id, status:status}).orderBy("id", "asc");

        if (!casos || casos.length === 0){
            return false;
        }

        return casos;        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function encontrarAgenteDoCaso(caso_id) {
    try {
        const caso = await db("casos").where({id:caso_id})

        if (!caso || caso.length === 0){
            return false;
        }

        const agente = await db("agentes").where({id:caso[0].agente_id})

        if (!agente || agente.length === 0){
            return false;
        }

        return agentesRepository.formatarData(agente[0]);
        
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

async function encontrarCasoPorString(search) {
    try {
        // where('campo', 'operador', 'valor a ser comparado')
        const casos = await db("casos")
                                                            .whereILike("titulo", `%${search}%`)
                                                            .orWhereILike("descricao", `%${search}%`)
                                                            .orderBy("id", "asc")

        return casos;
    } catch (error) {
        console.log(error);
        
        return false;
    }
}

module.exports = {
    findAll,
    findById,
    adicionarCaso,
    atualizarCaso,
    apagarCaso,
    listarCasosPorAgente,
    listarCasosPorStatus,
    encontrarAgenteDoCaso,
    encontrarCasoPorString,
    listarCasosPorAgenteEStatus
};
