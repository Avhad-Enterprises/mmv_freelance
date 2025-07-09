import { Router } from 'express';
import Route from '../interfaces/route.interface';
import { RequestHandler } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import robots_txtcontroller from '../controllers/robots.txt.controllers';
import { RobotsDto } from '../dtos/robots.txt.dto';
import robotscontroller from '../controllers/robots.txt.controllers';


class robots_txtRoutes implements Route {

  public path = '/robots';
  public router = Router();
  public robotscontroller = new robots_txtcontroller();

  constructor() {
    console.log("Routes");
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //robots_txt section  , validationMiddleware(robotsDto, 'body', false, [])
    this.router.get(`${this.path}.txt`, this.robotscontroller.getPublicRobots);
    this.router.get(`${this.path}/view`, this.robotscontroller.viewRobots );
    this.router.post(`${this.path}/update`, validationMiddleware(RobotsDto, 'body', false, []),this.robotscontroller.updateRobots);

  }
}

export default robots_txtRoutes;
