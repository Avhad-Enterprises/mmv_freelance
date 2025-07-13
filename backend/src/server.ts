import 'dotenv/config';
import App from './app';
import 'reflect-metadata';
import usersRoutes from './routes/users.route'; 
import validateEnv from './utils/validateEnv';
import projects_taskRoute from './routes/projectstask.routes';
import AppliedProjectsRoute from './routes/applied_projects.route';
import report_systemRoute from './routes/report_system.routes';
import favoritesRoute from './routes/favorites.routes';
import visitor_logsRoute from './routes/visitor_logs.routes';
import EMCRoute from './routes/emc.routes'
import categoryRoute from './routes/categories.routes';
import blogRoute from './routes/blog.routes';
import notificationRoute from './routes/notification.routes';
import permissionRoute from './routes/permission.routes';
import roleRoute from './routes/role.routes';

validateEnv();

const app = new App([new usersRoutes(), new projects_taskRoute(), new AppliedProjectsRoute(), new report_systemRoute(), new favoritesRoute(), new visitor_logsRoute(), new categoryRoute(), new blogRoute(), new notificationRoute(), new permissionRoute(), new roleRoute()]);

app.listen();
