
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('measurements', function(table) {
      table.bigInteger('ram_total_in_bytes');
      table.bigInteger('ram_free_in_bytes');
      table.bigInteger('ram_used_in_bytes');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('measurements', function(table) {
      table.dropColumn('ram_total_in_bytes');
      table.dropColumn('ram_free_in_bytes');
      table.dropColumn('ram_used_in_bytes');
    })
  ]);
};
