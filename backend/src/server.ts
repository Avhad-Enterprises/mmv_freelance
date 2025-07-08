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
import robots_txtRoutes from './routes/robots.txt.routes';
import report_templatesRoute from './routes/report_templates.routes';


validateEnv();

const app = new App([new usersRoutes(), new projects_taskRoute(), new AppliedProjectsRoute(), new report_systemRoute(), new favoritesRoute(), new visitor_logsRoute(), new robots_txtRoutes(), new report_templatesRoute()  ]);

app.listen();
