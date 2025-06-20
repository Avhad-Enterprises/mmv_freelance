"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = exports.EMPLOYEE_TABLE = void 0;
const index_schema_1 = __importDefault(require("./index.schema"));
exports.EMPLOYEE_TABLE = 'employee';
const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await index_schema_1.default.schema.dropTable(exports.EMPLOYEE_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await index_schema_1.default.schema.createTable(exports.EMPLOYEE_TABLE, table => {
            table.increments('employee_id');
            table.string('firstname');
            table.string('lastname');
            table.string('profile_pic');
            table.string('email');
            table.string('loginemployeeid');
            table.string('user_type');
            table.text('forms_assigned');
            table.boolean('is_deleted').defaultTo(false);
            table.text('fcmtoken');
            table.text('deviceid');
            table.timestamps(false, true);
        });
        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await index_schema_1.default.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${exports.EMPLOYEE_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    }
    catch (error) {
        console.log(error);
    }
};
exports.seed = seed;
exports.seed = exports.seed;
const run = async () => {
    //createProcedure();
    (0, exports.seed)();
};
run();
//# sourceMappingURL=employee.schema.js.map