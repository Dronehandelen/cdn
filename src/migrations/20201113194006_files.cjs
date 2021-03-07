exports.up = function (knex) {
    return knex.schema.createTable('files', function (table) {
        table.increments('id').primary();
        table.string('fileName', 255).notNullable();
        table.string('filePath', 255).notNullable();
        table.string('bucket', 255).nullable();
        table.string('fileType', 30).notNullable();
        table.string('extension', 30).notNullable();
        table.string('secretKey', 255).nullable();
        table
            .timestamp('createdAt', { useTz: true })
            .notNullable()
            .defaultTo(knex.fn.now());
        table.unique(['bucket', 'filePath']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('files');
};
