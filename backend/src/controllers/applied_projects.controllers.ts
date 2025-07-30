import { NextFunction, Request, Response } from "express";
import { AppliedProjectsDto } from "../dtos/applied_projects.dto";
import { IAppliedProjects } from "../interfaces/applied_projects.interface";
import AppliedProjectsService from "../services/applied_projects.services";
import HttpException from "../exceptions/HttpException";

class AppliedProjectsController {
  public AppliedProjectsService = new AppliedProjectsService();

  public applyToProject = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { projects_task_id, user_id } = req.body;
    if (!projects_task_id || isNaN(parseInt(projects_task_id)) || !user_id || isNaN(parseInt(user_id))) {
      throw new HttpException(400, "Invalid or missing Project Task ID or User ID");
    }
    const projectData: AppliedProjectsDto = {
      ...req.body,
      projects_task_id: parseInt(projects_task_id),
      user_id: parseInt(user_id),
    };
    const appliedProject: IAppliedProjects = await this.AppliedProjectsService.apply(
      projectData
    );

    res.status(201).json({
      data: appliedProject,
      message: "Successfully applied to project"
    });

  };

  public getProjectApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const projects_task_id = parseInt(req.body.projects_task_id);
    if (isNaN(projects_task_id)) {
      throw new HttpException(400, "Invalid Project Task ID");
    }
    const applications = await this.AppliedProjectsService.getProjectApplications(projects_task_id);
    res.status(200).json({
      data: applications,
      message: `got all applications for project task ID ${projects_task_id}`
    });
  };

  public getMyApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user_id = parseInt(req.body.user_id);
    if (isNaN(user_id)) {
      throw new HttpException(400, "Invalid or missing user_id in body");
    }
    const applications = await this.AppliedProjectsService.getUserApplications(user_id);
    res.status(200).json({
      data: applications,
      message: `got all applications for user ${user_id}`
    });

  };

  public getMyApplicationbyId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {

    const user_id = parseInt(req.body.user_id);
    const projects_task_id = parseInt(req.body.projects_task_id);
    if (isNaN(user_id) || isNaN(projects_task_id)) {
      throw new HttpException(400, "Invalid user or project task id");
    }
    const application = await this.AppliedProjectsService.getUserApplicationByProject(user_id, projects_task_id);
    if (!application) {
      throw new HttpException(404, "Application not found");
    }
    res.status(200).json({
      data: application,
      message: `got application for user ${user_id} and project task ${projects_task_id}`
    });

  };

  public updateApplicationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { applied_projects_id, status } = req.body;
    if (!applied_projects_id || typeof status === 'undefined') {
      throw new HttpException(400, "applied_projects_id and status are required");
    }
    const updated = await this.AppliedProjectsService.updateApplicationStatus(applied_projects_id, status);
    res.status(200).json({
      data: updated,
      message: "Application status updated successfully"
    });

  };

  public withdrawApplication = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { applied_projects_id } = req.body;
    if (!applied_projects_id) {
      throw new HttpException(400, "applied_projects_id is required");
    }
    await this.AppliedProjectsService.withdrawApplication(applied_projects_id);
    res.status(200).json({
      message: "Application withdrawn successfully"
    });
  };

  public getApplicationCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projects_task_id } = req.body;

      if (!projects_task_id) {
        throw new HttpException(400, "Project Task ID is required");
      }

      const count = await this.AppliedProjectsService.getApplicationCountByProject(Number(projects_task_id));
      res.status(200).json({ success: true, projects_task_id, count });
    } catch (error) {
      next(error);
    }
  };
  public getAppliedStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;

      if (typeof status !== 'number' || (status !== 0 && status !== 1)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be 0 or 1'
        });
      }

      const appliedProjects = await this.AppliedProjectsService.getAppliedprojectByStatus(status);
      res.status(200).json({
        success: true,
        data: appliedProjects
      });
    } catch (error) {
      next(error);
    }
  };
}

export default AppliedProjectsController;
