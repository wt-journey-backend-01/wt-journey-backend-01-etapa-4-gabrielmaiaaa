/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('agentes').del()
  await knex('agentes').insert([
    {nome: 'Rommel Carneiro', dataDeIncorporacao: '1992-10-04', cargo: 'delegado'},
    {nome: 'Cacio Almeida', dataDeIncorporacao: '1999-09-09', cargo: 'delegado'},
    {nome: 'Pedro Cardoso', dataDeIncorporacao: '2000-06-20', cargo: 'inspetor'}
  ]);
};
