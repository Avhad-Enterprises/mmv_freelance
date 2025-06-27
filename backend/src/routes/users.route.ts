import { Router } from 'express';
import Route from '../interfaces/route.interface';

import validationMiddleware from '../middlewares/validation.middleware';
import userController from '../controllers/users.controllers';
import { UserDto } from '../dtos/users.dto';

class usersRoute implements Route {

  public path = '/users';
  public router = Router();
  public usersController = new userController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //users section  , validationMiddleware(usersDto, 'body', false, [])
    this.router.post(`${this.path}/insertusers`, validationMiddleware(UserDto, 'body', false, []), this.usersController.insertusers);
    this.router.post(`${this.path}/login`, this.usersController.loginusers);
    this.router.put(`${this.path}/updateuserbyid`, this.usersController.updateuserById);
    this.router.put(`${this.path}/forget_password`, this.usersController.forgetpasswordusers);
    this.router.put(`${this.path}/reset_password`, this.usersController.reset_password);

  }
}


export default usersRoute;
