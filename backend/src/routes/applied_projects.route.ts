import { Router } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import AppliedProjectsController from '../controllers/applied_projects.controllers'
import { AppliedProjectsDto } from '../dtos/applied_projects.dto';
import Route from '../interfaces/routes.interface';

class AppliedProjectsRoute implements Route {

  public path = '/applications';
  public router = Router();
  public appliedProjectsController = new AppliedProjectsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // EDITOR APIS

    // Post Editor Apply to a project - DONE
    this.router.post(
      `${this.path}/projects/apply`, 
      validationMiddleware(AppliedProjectsDto, 'body', false, ['create']),
      this.appliedProjectsController.applyToProject
    );

    // Get Editors all applications - DONE
    this.router.post(
      `${this.path}/my-applications`,
      this.appliedProjectsController.getMyApplications
    );

    // Get Editors applications by Project ID - DONE
    this.router.post(
      `${this.path}/my-applications/project`,
      this.appliedProjectsController.getMyApplicationbyId
    );

    // Editor Withdraw his application - DONE
    this.router.delete(
      `${this.path}/my-applications/withdraw`,
      this.appliedProjectsController.withdrawApplication
    );

    // CLIENT APIS

    // Get all applications for a specific project  - DONE
    this.router.post(
      `${this.path}/projects/get-applications`,
      this.appliedProjectsController.getProjectApplications
    );

    // Update application status - DONE
    this.router.patch(
      `${this.path}/update-status`,
      this.appliedProjectsController.updateApplicationStatus
    );

  }
}

export default AppliedProjectsRoute;
