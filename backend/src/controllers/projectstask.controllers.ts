import { NextFunction, Request, Response } from 'express';
import { ProjectsTaskDto } from '../dtos/projectstask.dto';
import { IProjectTask } from '../interfaces/projectstask.interfaces';
import ProjectstaskService from '../services/projectstask.services';
import { RequestHandler } from 'express-serve-static-core';
import DB, { T } from '../database/index.schema';
import HttpException from '../exceptions/HttpException';
import { isEmpty } from 'class-validator';
import { PROJECTS_TASK } from '../database/projectstask.schema';
import { SubmitProjectDto } from '../dtos/submit_project.dto';
import { ISubmittedProjects } from '../interfaces/submit_project.interface';


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
      const projectid = req.body.projects_task_id;

      if (!projectid) {
        res.status(400).json({ error: 'Id is Required' });
        return;
      }
      const projects = await this.ProjectstaskService.getById(projectid);
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
      const fieldsToUpdate  = req.body;
  
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
  
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = (req.body as any).projects_task_id;
      const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  
      if (isNaN(idNum)) {
        res.status(400).json({ error: '  "projects_task_id" must be a number' });
        return;
      }
  
      // Clone body and exclude code_id
      const fieldsToUpdate = req.body;
  
      if (Object.keys(fieldsToUpdate).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }
  
      const updated = await this.ProjectstaskService.softDelete(fieldsToUpdate);
      res.status(200).json({ data: updated, message: 'projects_task updated' });
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
      const projects = await this.ProjectstaskService.getAllProjectsTask();
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

  public submitProject = async(
    req : Request,
    res : Response,
    next : NextFunction
  ): Promise<void> =>{
    try {
      const {user_id, projects_task_id} = req.body;
  
      if (!projects_task_id || !user_id){
        throw new HttpException(400, "Missing values");
      }
      const submitData: SubmitProjectDto ={
        ...req.body,
        user_id : user_id,
        projects_task_id : projects_task_id, 
      };
      const submitted : ISubmittedProjects = await this.ProjectstaskService.submit(
        submitData
      )
  
      res.status(201).json({
        data: submitted,
        message : "Successfully Submitted "
      });
    } catch (error: any) {
      if (error instanceof HttpException && error.status === 409) {
        res.status(409).json({ message: "You have already submitted this project." });
      } else {
        next(error);
      }
    }
  } 

  public approveProject = async(
    req: Request,
    res : Response,
    next : NextFunction
  ): Promise<void> => {
    try {
      const {submission_id, status} = req.body;
      if (!submission_id || !status) {
        throw new HttpException(400, "Submission id and status is required");
      }
      const approvedData: SubmitProjectDto ={
        ...req.body,
        submission_id : submission_id,
        status : status, 
      };
      const approved = await this.ProjectstaskService.approve(submission_id,status,approvedData);

      res.status(200).json({
        data: approved,
        message : "Submission status approved successfully" 
      });
    } catch (error: any) {
      if (error instanceof HttpException && error.status === 409) {
        res.status(409).json({ message: "You have already updated status of this project." });
      } else {
        next(error);
      }
    }
  }
}

export default projectstaskcontroller; 
