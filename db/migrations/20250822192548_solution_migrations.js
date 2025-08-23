/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
            .createTable('usuarios', (table) => {
                table.increments('id').primary();
                table.string('nome').notNullable();
                table.string('email').unique().notNullable();
                table.string('senha').notNullable();
            })
            .createTable('agentes', (table) => {
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.date('dataDeIncorporacao').notNullable();
            table.string('cargo').notNullable();
            })
            .createTable('casos', (table) => {
            table.increments('id').primary();
            table.string('titulo').notNullable();
            table.string('descricao').notNullable();
            table.enu('status', ['aberto', 'solucionado']).notNullable();
            table.integer('agente_id').notNullable();
            table.foreign('agente_id').references('id').inTable('agentes').onDelete('CASCADE');
            });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTable('casos')
    .dropTable('agentes')
    .dropTable('usuarios');  
};
