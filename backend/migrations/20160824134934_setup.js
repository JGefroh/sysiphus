
exports.up = function(knex, Promise) {
  return Promise.all([
     knex.schema.createTableIfNotExists("measurements", function(table) {
       table.increments('id').primary();
       table.decimal('cpu_idle_percentage');
       table.bigInteger('disk_free_in_bytes');
       table.bigInteger('disk_used_in_bytes');
       table.bigInteger('disk_total_in_bytes');
       table.integer('server_id');
       table.dateTime('created_at').defaultTo(knex.raw('now()'));
     })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
     knex.schema.dropTable('measurements')
  ]);
};
