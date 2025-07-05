import 'dotenv/config';
import App from './app';
import 'reflect-metadata';
import usersRoutes from './routes/users.route';
import TagsRoute from './routes/tags.routes';
import uploadtoaws from './routes/uploadtoaws.route';
import validateEnv from './utils/validateEnv';
import projects_taskRoute from './routes/projectstask.routes';


validateEnv();

const app = new App([new usersRoutes(), new projects_taskRoute(), new TagsRoute(), new uploadtoaws()]);

app.listen();
