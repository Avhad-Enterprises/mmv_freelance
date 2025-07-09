import 'dotenv/config';
import App from './app';
import 'reflect-metadata';
import usersRoutes from './routes/users.route';
import TagsRoute from './routes/tags.routes';
import uploadtoaws from './routes/uploadtoaws.route';
import validateEnv from './utils/validateEnv';
import projects_taskRoute from './routes/projectstask.routes';
import AppliedProjectsRoute from './routes/applied_projects.route';
import blogRoute from './routes/blog.routes';
import categoryRoute from './routes/categories.routes';
import EMCRoute from './routes/emc.routes';
import favoritesRoute from './routes/favorites.routes';
import notificationRoute from './routes/notification.routes';
import permissionRoute from './routes/permission.routes';
import ReportsRoute from './routes/report_system.routes';
import roleRoute from './routes/role.routes';
import visitor_logsRoute from './routes/visitor_logs.routes';
import EMCRoute from './routes/emc.routes'
import robots_txtRoutes from './routes/robots.txt.routes';
import report_templatesRoute from './routes/report_templates.routes';


validateEnv();

const app = new App([new usersRoutes(), new projects_taskRoute(), new AppliedProjectsRoute(), new report_systemRoute(), new favoritesRoute(), new visitor_logsRoute(), new robots_txtRoutes(), new report_templatesRoute()  ]);

app.listen();
