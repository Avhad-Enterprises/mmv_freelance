import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import compressController from '../controllers/compress.controller';

class compressRoute implements Route {

    public path= '/compress'
    public router = Router();
    public compressController = new compressController();

    constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(){

        // POST /compress
        this.router.post(this.path, this.compressController.compressVideo);

    }
    
}

export default compressRoute;
