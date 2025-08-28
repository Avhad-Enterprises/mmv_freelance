import { Router } from 'express';
import Route from '../interfaces/route.interface';
import { RequestHandler } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import Savedprojectcontroller from '../controllers/saved_project.controller';
import { SavedProjectsDto } from '../dtos/saved_project.dto';
import { SavedFreelancerDto } from '../dtos/saved_freelancer.dto';


class SavedprojectRoute implements Route {

    public path = '/saved';
    public router = Router();
    public Savedprojectcontroller = new Savedprojectcontroller();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        //saved project routes
        this.router.post(`${this.path}/create`, validationMiddleware(SavedProjectsDto, 'body', false, []), (req, res, next) => this.Savedprojectcontroller.addsave(req, res, next));
        this.router.get(`${this.path}/listsave`, this.Savedprojectcontroller.getAllsaved);
        this.router.delete(`${this.path}/remove-saved`, validationMiddleware(SavedProjectsDto, 'body', false, []), (req, res, next) => this.Savedprojectcontroller.removeSavedProject(req, res, next));
        this.router.post(`${this.path}/savedbyuser_id`, this.Savedprojectcontroller.getUserId);

        //saved freelancer routes
         this.router.post(`${this.path}/insert`, validationMiddleware(SavedFreelancerDto, 'body', false, []), (req, res, next) => this.Savedprojectcontroller.add(req, res, next));
    }
}
export default SavedprojectRoute;
