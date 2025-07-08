import { Router } from 'express';
import Route from '../interfaces/route.interface';

import validationMiddleware from '../middlewares/validation.middleware';
import VisitorController from '../controllers/visitor_logs.controllers';
import { VisitorLogDto } from '../dtos/visitor_logs.dto';

class visitor_logsRoute implements Route {

  public path = '/visitor';
  public router = Router();
  public VisitorController = new VisitorController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //visitor_logs section  , validationMiddleware(visitor_logsDto, 'body', false, [])
    this.router.post(`${this.path}/logs`, validationMiddleware(VisitorLogDto, 'body', false, []), this.VisitorController.logvisitor);
    this.router.get(`${this.path}/statistic`, this.VisitorController.getStats);

  }
}


export default visitor_logsRoute;
