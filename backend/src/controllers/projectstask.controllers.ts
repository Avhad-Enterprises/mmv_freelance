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
import { validateUrlFormatWithReason } from '../utils/validateUrlFormatWithReason';


class projectstaskcontroller {

  public ProjectstaskService = new ProjectstaskService();

  public insert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {
      const userData: ProjectsTaskDto = req.body;
      const createdproject = await this.ProjectstaskService.Insert(userData);
      res.status(201).json({ data: createdproject, message: "Inserted" });
    } catch (error) {
      console.error('Insert Project Task Error:', error);
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

  public update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { project_task_id, ...updateData } = req.body;
  
      // 1. Validate project ID
      if (!project_task_id) {
        res.status(400).json({ message: 'project_task_id is required' });
        return;
      }
  
      // 2. If URL is being updated, validate format
      if (updateData.url) {
        const { valid, reason } = validateUrlFormatWithReason(updateData.url);
        if (!valid) {
          res.status(400).json({ message: `Invalid URL format: ${reason}` });
          return;
        }
      }
  
      // 3. Call service method to update
      const updatedProject = await this.ProjectstaskService.updateProject(project_task_id, updateData);
  
      res.status(200).json({
        message: 'Project updated successfully',
        data: updatedProject
      });
  
    } catch (error: any) {
      console.error("Controller error:", error);
      res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
  }    
  
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
  //getbyid task with client info
  public getTaskWithClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.ProjectstaskService.getTaskWithClientById(Number(id));
  
      if (!task) {
         res.status(404).json({ success: false, message: "Task not found" });
      }
  
      res.status(200).json({ data: task, success: true });
    } catch (error) {
      next(error);
    }
  };

  public getprojectstaskbyurl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const url = req.params.url;
  
      if (!url) {
        res.status(400).json({ message: "URL is required" });
        return;
      }
  
      const projecttask = await this.ProjectstaskService.getByUrl(url);
  
      if (!projecttask) {
        res.status(404).json({ message: "projects task not found" });
        return;
      }
  
      res.status(200).json({ data: projecttask });
    } catch (error) {
      next(error);
    }
  };

  public checkUrlExists = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;
  
      if (!url) {
        res.status(400).json({ message: 'URL is required' });
        return;
      }
  
      // 🔍 Validate format with specific error
      const { valid, reason } = validateUrlFormatWithReason(url);
  
      if (!valid) {
        res.status(400).json({ message: `Invalid URL format: ${reason}` });
        return;
      }
  
      const exists = await this.ProjectstaskService.checkUrlInprojects(url);
  
      if (exists) {
        res.status(200).json({ message: 'URL exists in projects task table', url });
      } else {
        res.status(404).json({ message: 'URL not found in projects task table', url });
      }
  
    } catch (error: any) {
      console.error("checkUrlExists error:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

}

export default projectstaskcontroller; 
