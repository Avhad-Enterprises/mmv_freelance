import { NextFunction, Request, Response } from 'express';
import { favoritesDto } from '../dtos/favorites.dto';
import favoritesservices from '../services/favorites.services';
import DB, { T } from '../database/index.schema';
import HttpException from '../exceptions/HttpException';


class favoritescontroller {

    public favoritesservices = new favoritesservices();

    public addFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        try {

            const userData: favoritesDto = req.body;
            const insertedData = await this.favoritesservices.Insert(userData);
            res.status(201).json({ data: insertedData, message: "Added to favorites" });
        } catch (error) {
            next(error);
        }
    };

    public removeFavorite = async (req: Request, res: Response) => {
        try {
            const result = await this.favoritesservices.removeFavorite(req.body);
            res.status(200).json({ message: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    public getAllprojects = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const favorites = await this.favoritesservices.getAllprojects();
            res.status(200).json({ data: favorites, success: true });
        } catch (err) {
            next(err);
        }
    };

    public listFavoriteFreelancers = async (_req: Request, res: Response): Promise<void> => {
        try {
            const favorites = await this.favoritesservices.getFavoriteFreelancers();

            res.status(200).json({ total: favorites.length, data: favorites, message: 'All projecct fetched successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    //favoritesprojects details
    public getFavoriteprojectsdetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { user_id } = req.body;

            if (!user_id) {
                res.status(400).json({ message: "user_id is required in request body" });
            }

            const data = await this.favoritesservices.getFavoriteProjectDetails(user_id);
            res.status(200).json({ data, success: true });
        } catch (error) {
            next(error);
        }
    };

}

export default favoritescontroller; 
