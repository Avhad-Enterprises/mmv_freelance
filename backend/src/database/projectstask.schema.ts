import DB from './index.schema';

export const PROJECTS_TASK = 'projects_task';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(PROJECTS_TASK);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(PROJECTS_TASK, table => {
            table.increments('projects_task_id').primary();  //ID
            table.integer('user_id').notNullable();
            table.string('project_title').notNullable();
            table.text('project_category').defaultTo(0);
            table.date('Deadline').notNullable();
            table.text('project_description').notNullable();
            table.integer('Budget').notNullable();
            table.jsonb('skills_required').notNullable();
            table.jsonb('reference_links').notNullable();
            table.string('additional_notes').notNullable();
            table.jsonb('status').notNullable();
            table.text('projects_type').notNullable();
            table.string('project_format').notNullable();
            table.string('audio_voiceover').notNullable();
            table.integer('video_length').notNullable();
            table.text('preferred_video_style').notNullable();
            table.jsonb('sample_project_file').notNullable();
            table.jsonb('project_files').notNullable();
            table.jsonb('show_all_files').notNullable();
            table.integer('is_active').defaultTo(0);
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
          ON ${PROJECTS_TASK}
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
//      //createProcedure();
//       seed();
//   };
//   run();
