import DB, { T } from "./index.schema";

export const Application_Table = "applications";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping applications table...");
            await DB.schema.dropTableIfExists(Application_Table);
            console.log("Dropped applications table!");
        }

        console.log("Creating applications table...");
        await DB.schema.createTable(Application_Table, (table) => {
            table.increments("id").primary();

            table
                .integer("applied_to_job_id")
                .notNullable()
                .references("projects_task_id")
                .inTable(T.Project_Table)
                .onDelete("CASCADE");

            table
                .integer("applicant_id")
                .notNullable()
                .references("user_id")
                .inTable(T.User_Table)
                .onDelete("CASCADE");

            table.string("resume_url").nullable();
            table.text("cover_letter").nullable();
            table.decimal("expected_amount", 12, 2).nullable();
            table.boolean("is_hired").defaultTo(false);
            table.timestamp("applied_at").defaultTo(DB.fn.now());
        });

        console.log("Applications table created successfully.");
    } catch (error) {
        console.error("Error creating applications table:", error);
    }
};

// exports.seed = seed();
// export const run = async () => {
//     //createProcedure();
//     seed();
// };
// run();
