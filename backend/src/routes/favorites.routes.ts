import { Router } from 'express';
import Route from '../interfaces/route.interface';
import { RequestHandler } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import favoritescontroller from '../controllers/favorites.controllers';
import { favoritesDto } from '../dtos/favorites.dto';

class favoritesRoute implements Route {

  public path = '/favorites';
  public router = Router();
  public favoritescontroller = new favoritescontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //favorites_system section  , validationMiddleware(reportDto, 'body', false, [])
    this.router.post(`${this.path}/add`, validationMiddleware(favoritesDto, 'body', false, []), this.favoritescontroller.addFavorite);
    this.router.post(`${this.path}/remove`, this.favoritescontroller.removeFavorite);
    
    this.router.get(`${this.path}/listprojects`, this.favoritescontroller.getAllprojects);
    this.router.get(`${this.path}/listfreelancers`, this.favoritescontroller.listFavoriteFreelancers);
   
    this.router.post(`${this.path}/getFavorites`, this.favoritescontroller.getProjectfavorites.bind(this.favoritescontroller));
    this.router.post(`${this.path}/getfreelancebyid`, this.favoritescontroller.getfreelance);

     this.router.post(`${this.path}/freelanceinfo`, this.favoritescontroller.getfavfreelanceinfo);
    this.router.post(`${this.path}/freelance-info`, this.favoritescontroller.getfreelanceinfo);
  }
}

export default favoritesRoute;
