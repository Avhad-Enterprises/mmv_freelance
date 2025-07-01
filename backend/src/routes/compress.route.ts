import { Router } from 'express';
import Route from '../interfaces/routes.interface';
import compressController from '../controllers/compress.controller';
import {CompressVideoDto} from "../dtos/compress_video.dto"
import validationMiddleware from '../middlewares/validation.middleware';

class compressRoute implements Route {

    public path= '/compress'
    public router = Router();
    public compressController = new compressController();

    constructor() {
        this.initializeRoutes();
    }
    
    private initializeRoutes(){

        // POST /compress
        this.router.post(this.path, validationMiddleware(CompressVideoDto, 'body', false, []), this.compressController.compressVideo);

    }
    
}

export default compressRoute;
