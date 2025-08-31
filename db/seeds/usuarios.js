/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('usuarios').del()
  await knex('usuarios').insert([
    {nome: 'admin', email:'admin@gmail.com', senha: 'admin'},
    {nome: 'base', email:'base@gmail.com', senha: 'base'}
  ]);
};
