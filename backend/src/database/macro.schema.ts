import DB from './index.schema';

export const MACRO = 'macro';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(MACRO);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(MACRO, table => {
            table.increments('macro_id').primary();
            table.string('title').notNullable();
            table.text('description').nullable();
            table.text('reply_template').notNullable();
            table.text("tags", "jsonb").nullable();
            table.enum('category', ['refund', 'delay', 'feedback', 'general', 'technical']).defaultTo('general');
            table.jsonb('placeholders').nullable();
            table.boolean('is_active').defaultTo(true);
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${MACRO}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

    //   exports.seed = seed;
    //   const run = async () => {
    //       //createProcedure();
    //       seed();
    //   };
    //   run();