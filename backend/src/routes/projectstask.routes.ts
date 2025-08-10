import { Router } from 'express';
import Route from '../interfaces/route.interface';
import { RequestHandler } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import projectstaskcontroller from '../controllers/projectstask.controllers';
import { ProjectsTaskDto } from '../dtos/projectstask.dto';

class projectstaskRoute implements Route {

   public path = '/projectsTask';
   public router = Router();
   public projectstaskcontroller = new projectstaskcontroller();

   constructor() {
      this.initializeRoutes();
   }

   private initializeRoutes() {

      //projectstask section  , validationMiddleware(ProjectsTaskDto, 'body', false, [])
      this.router.post(`${this.path}/insertprojects_task`, validationMiddleware(ProjectsTaskDto, 'body', false, []), this.projectstaskcontroller.insert);
      this.router.post(`${this.path}/getprojects_taskbyid`, this.projectstaskcontroller.getbytaskid);
      this.router.put(`${this.path}/updateprojects_taskbyid`, this.projectstaskcontroller.update);
      this.router.post(`${this.path}/delete`, validationMiddleware(ProjectsTaskDto, 'body', true, []), (req, res, next) => this.projectstaskcontroller.delete(req, res, next));
      this.router.get(`${this.path}/countactiveprojects_task`, this.projectstaskcontroller.countActiveprojectstask);
      this.router.get(`${this.path}/countbyprojects_task`, this.projectstaskcontroller.countprojectstask);
      this.router.get(`${this.path}/getallprojects_task`, this.projectstaskcontroller.getallprojectstask);
      this.router.get(`${this.path}/getactivedeletedprojects_task`, this.projectstaskcontroller.getactivedeleted);
      this.router.get(`${this.path}/getDeletedprojects_task`, this.projectstaskcontroller.getDeletedprojectstask);

      //getall task with client info
      this.router.get(`${this.path}/tasks-with-client`, this.projectstaskcontroller.getAllTasksWithClientInfo);
      //getbyid task with client info
      this.router.get(`${this.path}/tasks-with-client/:id`, this.projectstaskcontroller.getTaskWithClientById);
      //url by get all data
      this.router.get(`${this.path}/getprojectstaskbyurl/:url`, this.projectstaskcontroller.getprojectstaskbyurl);
      //check url in database
      this.router.get(`${this.path}/check-url`, this.projectstaskcontroller.checkUrlExists);
      this.router.post(`${this.path}/gettaskby`, this.projectstaskcontroller.getbytasksid);
      this.router.get(`${this.path}/count/editor/:editor_id`,(req, res, next) => this.projectstaskcontroller.getCountBy(req, res, next));

   }
}

export default projectstaskRoute;
