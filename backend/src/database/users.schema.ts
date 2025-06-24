import DB from './index.schema';

export const USERS_TABLE = 'users';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(USERS_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(USERS_TABLE, table => {
            table.increments('users_id').primary(); // ID
            table.string("first_name").notNullable;
            table.string("last_name").nullable;
            table.string("profile_picture").defaultTo(null);
            table.string("phone_number").notNullable();
            table.string("Username").notNullable();
            table.string("email").unique();
            table.string("password").notNullable();
            table.string ("confirm_password").nullable();
            table.string("address_line_first").notNullable();
            table.string("address_line_second").defaultTo(null);
            table.string("city").notNullable();
            table.string("state").notNullable();
            table.string("country").notNullable();
            table.string("pincode").notNullable();
            table.string("role").notNullable();
            table.jsonb("skill").nullable();
            table.boolean("email_notifications").defaultTo(true);
            table.text("tags", "jsonb").nullable();
            table.text("notes", "jsonb").nullable();
            table.boolean("aadhaar_verification").defaultTo(true);
            table.boolean("is_active").defaultTo(true);
            table.integer("created_by").nullable();
            table.timestamp("created_at").defaultTo(DB.fn.now());
            table.timestamp("updated_at").defaultTo(DB.fn.now());
            table.integer("updated_by").nullable();
            table.boolean("is_deleted").defaultTo(false);
            table.integer("deleted_by").nullable();
            table.timestamp("deleted_at").nullable();
        });


    console.log('Finished Seeding Tables');
    console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${USERS_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
     console.log('Finished Creating Triggers');
    } catch (error) {
    console.log(error);
    }
};

//  exports.seed = seed;
//  const run = async () => {
//     //createProcedure();
//      seed();
//  };
//  run();
