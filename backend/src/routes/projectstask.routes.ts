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
    console.log("Routes");
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //projectstask section  , validationMiddleware(ProjectsTaskDto, 'body', false, [])
    this.router.post(`${this.path}/insertprojects_task`, validationMiddleware(ProjectsTaskDto, 'body', false, []), this.projectstaskcontroller.insertprojectstask);
    this.router.post(`${this.path}/getprojects_taskbyid`, this.projectstaskcontroller.getbytaskid);
    this.router.put(`${this.path}/updateprojects_taskbyid`, this.projectstaskcontroller.updateById);
    this.router.post(`${this.path}/deleteprojects_taskbyid`, validationMiddleware(ProjectsTaskDto, 'body', true, []), (req, res, next) => this.projectstaskcontroller.deleteprojectstask(req, res, next));
    this.router.get(`${this.path}/countactiveprojects_task`, this.projectstaskcontroller.countActiveprojectstask);
    this.router.get(`${this.path}/countbyprojects_task`, this.projectstaskcontroller.countprojectstask);
    this.router.get(`${this.path}/getallprojects_task`, this.projectstaskcontroller.getallprojectstask);
    this.router.get(`${this.path}/getactivedeletedprojectstask`, this.projectstaskcontroller.getactivedeletedprojectstask);
    this.router.get(`${this.path}/getDeletedprojects_task`, this.projectstaskcontroller.getDeletedprojectstask);

  }
}

export default projectstaskRoute;
