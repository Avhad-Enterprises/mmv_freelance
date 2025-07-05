
import { NextFunction, Request, Response } from 'express';
import { ProjectsTaskDto } from '../dtos/projectstask.dto';
import { IProjectTask } from '../interfaces/projectstask.interfaces';
import ProjectstaskService from '../services/projectstask.services';
import { RequestHandler } from 'express-serve-static-core';
import DB, { T } from '../database/index.schema';
import HttpException from '../exceptions/HttpException';
import { isEmpty } from 'class-validator';
import { PROJECTS_TASK } from '../database/projectstask.schema';


class projectstaskcontroller {

  public ProjectstaskService = new ProjectstaskService();

  public insertprojectstask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

      const userData: ProjectsTaskDto = req.body;
      const insertedData = await this.ProjectstaskService.Insertmyprojectstask(userData);
      res.status(201).json({ data: insertedData, message: "Inserted" });
    } catch (error) {
      next(error);
    }
  };

  public getbytaskid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = (req.body as any).projects_task_id;
      const idNum: number = typeof raw === 'string'
        ? parseInt(raw, 10)
        : raw;

      if (isNaN(idNum)) {
        res.status(400).json({ error: 'project_task_id must be a number' });
        return;
      }
      const projects = await this.ProjectstaskService.getById(idNum);
      if (!projects) {
        res.status(404).json({ error: 'projects_task not found' });
        return;
      }

      res.status(200).json({ projects, success: true });
    } catch (error) {
      next(error);
    }
  };

  public updateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = (req.body as any).projects_task_id;
      const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  
      if (isNaN(idNum)) {
        res.status(400).json({ error: '  "projects_task_id" must be a number' });
        return;
      }
  
      // Clone body and exclude code_id
      const { projects_task_id, ...fieldsToUpdate } = req.body;
  
      if (Object.keys(fieldsToUpdate).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }
  
      const updated = await this.ProjectstaskService.update(idNum, fieldsToUpdate);
      res.status(200).json({ data: updated, message: 'projects_task updated' });
    } catch (error) {
      next(error);
    }
  };
  
  public async deleteprojectstask(req: Request, res: Response, next: NextFunction) {
    try {
      const projects_task_id = Number(req.body.projects_task_id);
      const Deleted = await this.ProjectstaskService.SoftDeleteEvent(projects_task_id);
      res.status(200).json({ data: Deleted, message: 'Deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  public countActiveprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.ProjectstaskService.projectstaskActive();
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  };

  public countprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.ProjectstaskService.countprojectstask();
      res.status(200).json({ count });
    } catch (err) {
      next(err);
    }
  };

  public getallprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getallprojectstask();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };

  public getactivedeletedprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getactivedeletedprojectstask();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };

  public getDeletedprojectstask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getDeletedprojectstask();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };
  
  public getprojecttypesby = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.ProjectstaskService.getprojecttypesbytable();
      res.status(200).json({ data: projects, success: true });
    } catch (err) {
      next(err);
    }
  };
}

export default projectstaskcontroller; 
