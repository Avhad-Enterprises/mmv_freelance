import DB, { T } from "./index.schema";

export const Project_Table = "projects";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table...");
            await DB.schema.dropTable(Project_Table);
            console.log("Dropped Table!");
        }
        console.log("Seeding Tables");
        
        await DB.schema.createTable(Project_Table, (table) => {
            table.increments("projects_task_id").primary();     //changed to projects_task_id
            table.string("project_title").notNullable();
            table.text("project_description");
            table.boolean("is_active").defaultTo(true);
            table.enu("status", ["completed", "pending"]);
            table
                .integer("client_id")
                .notNullable()
                .references("user_id")
                .inTable(T.User_Table)
                .onDelete("CASCADE");
            table
                .integer("editor_id")
                .nullable()
                .references("user_id")
                .inTable(T.User_Table)
                .onDelete("SET NULL");
            table.timestamp("created_at").defaultTo(DB.fn.now());
            table.timestamp("updated_at").defaultTo(DB.fn.now());
        });

        console.log("Finished Seeding Tables");
        console.log("Creating Triggers");
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${Project_Table}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log("Finished Creating Triggers");
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
