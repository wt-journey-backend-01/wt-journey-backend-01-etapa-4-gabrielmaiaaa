/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('casos').del()
  await knex('casos').insert([
    {id: 1, titulo: 'homicídio', descricao: 'Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.', status: 'aberto', agente_id: 1},
    {id: 2, titulo: 'sequestro', descricao: 'Sequestro de empresário local ocorrido às 07:45 do dia 15/04/2014, com resgate pago e vítima liberada no mesmo dia, na zona rural.', status: 'aberto', agente_id: 2},
    {id: 3, titulo: 'roubo', descricao: 'Um assalto à mão armada ocorreu às 19:20 do dia 03/02/2012 em uma joalheria no centro da cidade, resultando na perda de diversas peças avaliadas em mais de R$ 200 mil.', status: 'solucionado', agente_id: 1},
  ]);
};