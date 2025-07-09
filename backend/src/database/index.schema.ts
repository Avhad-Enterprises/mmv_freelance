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
import { TAGS_TABLE } from './tags.schema';
import { USERINVITATIONS } from "./userinvitations.schema";
import { APPLIED_PROJECTS } from './applied_projects.schema';
import { BLOG } from './blog.schema';
import { CATEGORY } from './category.schema';
import { FAVORITES_TABLE } from './favorites.schema';
import { NOTIFICATION } from './notification.schema';
import { PERMISSION } from './permission.schema';
import { REPORT_TABLE } from './report_system.schema';
import { ROLE } from './role.schema';
import { VISITOR_LOGS } from './visitor_logs.schema';
import { NICHES_TABLE } from './niches.schema';
import { ROBOTS_TXT } from './robots.txt.schema';
import { INVITATION_TABLE } from './admin_invites.schema';
import { REPORT_TEMPLATES } from './report_templates.schema';
import { REPORT_SCHEDULES } from './reports_schedules.schema';
import { ROLE_PERMISSION } from './role_permission.schema';
import { SUBMITTED_PROJECTS } from './submitted_projects.schema';
import { USER_ROLES } from './user_role.schema';


export const T = {
  USERS_TABLE,
  PROJECTS_TASK,
  TAGS_TABLE,
  USERINVITATIONS,
  APPLIED_PROJECTS,
  BLOG,
  CATEGORY,
  FAVORITES_TABLE,
  NOTIFICATION,
  PERMISSION,
  REPORT_TABLE,
  ROLE,
  VISITOR_LOGS,
  NICHES_TABLE,
  ROBOTS_TXT,
  INVITATION_TABLE,
  REPORT_TEMPLATES,
  REPORT_SCHEDULES,
  ROLE_PERMISSION,
  SUBMITTED_PROJECTS,
  USER_ROLES
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
