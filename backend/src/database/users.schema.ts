import DB from './index.schema';

export const EMPLOYEE_TABLE = 'users';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(EMPLOYEE_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(EMPLOYEE_TABLE, table => {
            table.increments('employee_id').primary(); // ID
            table.string('firstname');
            table.string('lastname');
            table.string('email');
            table.string('profile_pic');
            table.timestamps(false, true);
            table.boolean('is_deleted');
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${EMPLOYEE_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// exports.seed = seed;
// const run = async () => {
//     //createProcedure();
//     seed();
// };
// run();
