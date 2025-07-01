import knex from 'knex';
import dotenv from 'dotenv';
import 'reflect-metadata';


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
import { USERS_TABLE } from './users.schema';
import { PROJECTS_TASK } from './projectstask.schema';
import { APPLIED_PROJECTS } from './applied_projects.schema';
import { SUBMITTED_PROJECTS } from './submitted_projects.schema';
import { REPORT_TABLE } from './report_system.schema';
import { FAVORITES_TABLE } from './favorites.schema';
import { VISITOR_LOGS } from './visitor_logsschema';


export const T = {
  USERS_TABLE,
  PROJECTS_TASK,
  APPLIED_PROJECTS,
  SUBMITTED_PROJECTS,
  REPORT_TABLE,
  FAVORITES_TABLE,
  VISITOR_LOGS
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
