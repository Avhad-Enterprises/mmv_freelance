import DB, { T } from "./index.schema";

export const Transaction_Table = "transactions";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table...");
            await DB.schema.dropTable(Transaction_Table);
            console.log("Dropped Table!");
        }
        console.log("Seeding Tables...");

        await DB.schema.createTable(Transaction_Table, (table) => {
            table.increments("id").primary();
            table
                .enu("transaction_type", ["escrow", "payout", "refund"])
                .notNullable();
            table
                .enu("transaction_status", ["pending", "completed", "failed"])
                .notNullable();
            table
                .integer("project_id")
                .references("projects_task_id")
                .inTable(T.Project_Table)
                .onDelete("CASCADE");
            table
                .integer("application_id")
                .references("id")
                .inTable(T.Application_Table)
                .onDelete("CASCADE"); //doubtful, what is this, and from where I can get this application id.
            table
                .integer("payer_id")
                .references("user_id")
                .inTable(T.User_Table);
            table
                .integer("payee_id")
                .references("user_id")
                .inTable(T.User_Table);
            table.decimal("amount", 12, 2);
            table.string("currency").defaultTo("INR"); // INR, US $ etc.
            table.string("payment_gateway"); // Razorpay or Stripe
            table.string("gateway_transaction_id");
            table.text("description");
            table.timestamp("created_at").defaultTo(DB.fn.now());
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
