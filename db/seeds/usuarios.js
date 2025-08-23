/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('usuarios').del()
  await knex('usuarios').insert([
    {id: 1, nome: 'admin', email:'admin@gmail.com', senha: 'admin'},
    {id: 2, nome: 'base', email:'base@gmail.com', senha: 'base'}
  ]);
};
