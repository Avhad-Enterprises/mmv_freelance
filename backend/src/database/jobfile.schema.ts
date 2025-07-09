import DB, { T } from "./index.schema";

export const JobFile_Table = "job_file";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table...");
            await DB.schema.dropTable(JobFile_Table);
            console.log("Dropped Table!");
        }
        console.log("Seeding Tables");
    
        await DB.schema.createTable(JobFile_Table, (table) => {
            table.increments("id").primary();
            table
                .integer("job_id")
                .notNullable()
                .references("projects_task_id")
                .inTable(T.Project_Table)
                .onDelete("CASCADE");
            table.string("file_name").notNullable();
            table.text("file_url").notNullable();
            table.timestamp("uploaded_at").defaultTo(DB.fn.now());
        });

        console.log("Finished Seeding Tables");
        console.log("Creating Triggers");
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${JobFile_Table}
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
