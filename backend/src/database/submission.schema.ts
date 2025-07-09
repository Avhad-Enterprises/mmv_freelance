import DB, { T } from "./index.schema";

export const Submission_Table = "submissions";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table...");
            await DB.schema.dropTable(Submission_Table);
            console.log("Dropped Table!");
        }
        console.log("Seeding Tables");
        
        await DB.schema.createTable(Submission_Table, (table) => {
            table.increments("id").primary();
            table
                .integer("job_id")
                .notNullable()
                .references("projects_task_id")
                .inTable(T.Project_Table)
                .onDelete("CASCADE");
            table
                .integer("submitted_by")
                .notNullable()
                .references("user_id")
                .inTable(T.User_Table)
                .onDelete("CASCADE");
            table.text("file_url");
            table.text("message");
            table.timestamp("submitted_at").defaultTo(DB.fn.now());
        });

        console.log("Finished Seeding Tables");
        console.log("Creating Triggers");
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${Submission_Table}
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
