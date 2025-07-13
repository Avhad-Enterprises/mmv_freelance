import { Router } from 'express';
import Route from '../interfaces/route.interface';
import { RequestHandler } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import projectstaskcontroller from '../controllers/projectstask.controllers';
import { ProjectsTaskDto } from '../dtos/projectstask.dto';
import { SubmitProjectDto } from '../dtos/submit_project.dto'; 
import { ApproveProjectDto } from '../dtos/approve_project.dto';
import { validate } from 'class-validator';
import { request } from 'http';

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
    this.router.post(`${this.path}/insertprojects_task`, validationMiddleware(ProjectsTaskDto, 'body', false, []), this.projectstaskcontroller.insert);
    this.router.post(`${this.path}/getprojects_taskbyid`, this.projectstaskcontroller.getbytaskid);
    this.router.put(`${this.path}/updateprojects_taskbyid/:id`, this.projectstaskcontroller.update);
    this.router.post(`${this.path}/deleteprojects_taskbyid`, validationMiddleware(ProjectsTaskDto, 'body', true, []), (req, res, next) => this.projectstaskcontroller.deleteprojectstask(req, res, next));
    this.router.get(`${this.path}/countactiveprojects_task`, this.projectstaskcontroller.countActiveprojectstask);
    this.router.get(`${this.path}/countbyprojects_task`, this.projectstaskcontroller.countprojectstask);
    this.router.get(`${this.path}/getallprojects_task`, this.projectstaskcontroller.getallprojectstask);
    this.router.get(`${this.path}/getactivedeletedprojectstask`, this.projectstaskcontroller.getactivedeletedprojectstask);
    this.router.get(`${this.path}/getDeletedprojects_task`, this.projectstaskcontroller.getDeletedprojectstask);

    // EDITOR : Submit his project work and click submit
    this.router.post(`${this.path}/submitproject`,validationMiddleware(SubmitProjectDto, 'body', false,[]), (req,res,next) => this.projectstaskcontroller.submitProject(req,res,next));

    // CLIENT : Update status of project after submission of editor (0: Submitted 1: Under Review 2: Approved 3: Rejected)
    this.router.patch(`${this.path}/updatestatus`,validationMiddleware(ApproveProjectDto, 'body', false, []),(req, res, next) => this.projectstaskcontroller.approveProject(req,res,next));
    //getbyid task with client info
    this.router.get(`${this.path}/tasks-with-client/:id`, this.projectstaskcontroller.getTaskWithClientById);
    //url by get all data
    this.router.get(`${this.path}/getprojectstaskbyurl/:url`, this.projectstaskcontroller.getprojectstaskbyurl);
    //check url in database
    this.router.get(`${this.path}/check-url`, this.projectstaskcontroller.checkUrlExists);

  }
}

export default projectstaskRoute;
