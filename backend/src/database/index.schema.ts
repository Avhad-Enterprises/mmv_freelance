import knex from 'knex';
import dotenv from 'dotenv';


dotenv.config();

const awsConf = {

  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 5432,

  },
  searchPath: 'public'
};

const DB = knex(awsConf);

export default DB;

// Table Names
import { EMPLOYEE_TABLE } from './users.schema';



export const T = {
  EMPLOYEE_TABLE
};

// Creates the procedure that is then added as a trigger to every table
// Only needs to be run once on each postgres schema
export const createProcedure = async () => {
  await DB.raw(`
      CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
      LANGUAGE plpgsql
      AS
      $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;
    `);
};

// const run = async () => {
//   createProcedure();
// };
// run();
