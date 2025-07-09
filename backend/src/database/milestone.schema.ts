import DB, { T } from "./index.schema";

export const Milestone_Table = "milestones";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table...");
            await DB.schema.dropTable(Milestone_Table);
            console.log("Dropped Table!");
        }
        console.log("Seeding Tables");
        
        await DB.schema.createTable(Milestone_Table, (table) => {
            table.increments("id").primary();
            table
                .integer("job_id")
                .notNullable()
                .references("projects_task_id")
                .inTable(T.Project_Table)
                .onDelete("CASCADE");
            table.string("title").notNullable();
            table.text("description");
            table.date("due_date");
            table.boolean("completed").defaultTo(false);
        });

        console.log("Finished Seeding Tables");

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
