const db = require('../db/db');

async function encontrarUsuarioPorEmail(email) {
    try {
        const user = await db('usuarios').whereRaw('LOWER(email) = ?', email.toLowerCase());

        if(!user || user.length === 0) {
            return false;
        }

        return user[0];
    } catch (error) {
        console.log(error);
        return false;        
    }
}

async function cadastrarUsuario(dadosUsuario) {
    try {        
        const user = await db('usuarios').insert(dadosUsuario).returning('*');        

        return user[0];
    } catch (error) {
        console.log(error);

        return false;                
    }
}

async function deletarUsuario(id) {
    try {
        const user = await db('usuarios').where({id: id}).del();

        if(!user || user === 0){
            return false;
        }

        return true;
    } catch (error) {
        console.log(error);

        return false;                
    }
}

module.exports = {
    encontrarUsuarioPorEmail,
    cadastrarUsuario,
    deletarUsuario
}