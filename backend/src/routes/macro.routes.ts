import { Router } from 'express';
import Route from '../interfaces/route.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import macroController from '../controllers/macro.controller';
import { MacroDto } from '../dtos/macro.dto';

class MacroRoute implements Route {

    public path = '/macro';
    public router = Router();
    public macroController = new macroController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        this.router.post(`${this.path}/insertmacro`, validationMiddleware(MacroDto, 'body', false, []), (req, res, next) => this.macroController.addmacro(req, res, next));
        this.router.put(`${this.path}/updatemacro`, validationMiddleware(MacroDto, 'body', false, []), (req, res, next) => this.macroController.updatemacroby(req, res, next));
        this.router.post(`${this.path}/deletemacro`, validationMiddleware(MacroDto, 'body', true, []), (req, res, next) => this.macroController.deletemacro(req, res, next));
        this.router.get(`${this.path}/getallmacro`, (req, res, next) => this.macroController.getallmacroby(req, res, next));
        this.router.get(`${this.path}/editmacro/:id`, (req, res, next) => this.macroController.geteditmacro(req, res, next));
       
    }
}

export default MacroRoute;
