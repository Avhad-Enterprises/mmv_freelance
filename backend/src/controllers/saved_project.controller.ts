import { NextFunction, Request, Response } from 'express';
import { SavedProjectsDto } from '../dtos/saved_project.dto';
import Savedprojectservices from '../services/saved_project.services';
import DB, { T } from '../database/index.schema';
import HttpException from '../exceptions/HttpException';


class SavedprojectController {

    public Savedprojectservices = new Savedprojectservices();

    public addsave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const saveData: SavedProjectsDto = req.body;
            const inserteddata = await this.Savedprojectservices.addsaved(saveData);
            res.status(201).json({ data: inserteddata, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    }

    public getAllsaved = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const saved = await this.Savedprojectservices.getAllsaveds();
            res.status(200).json({ data: saved, success: true });
        } catch (err) {
            next(err);
        }
    };
public removeSavedProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body: SavedProjectsDto = req.body;
    const message = await this.Savedprojectservices.removeSavedProjects(body);
    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

}

export default SavedprojectController; 