import 'dotenv/config';
import App from './app';
import EmployeeRoute from './routes/employee.route';
import validateEnv from './utils/validateEnv';

validateEnv();

const app = new App([new EmployeeRoute()]);

app.listen();
