import { Router } from "express";
import Route from "../interfaces/route.interface";
import JobController from "../controllers/job.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import { SubmissionDto } from "../dtos/submission.dto";

export default class JobRoute implements Route {
    public path = "/jobs";
    public router = Router();
    private controller = new JobController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Get active jobs based on user role (client or freelancer)
        this.router.get(
            `${this.path}/active`,
            this.controller.getActiveJobs.bind(this.controller)
        );

        // View job details (with milestones, files)
        this.router.get(`${this.path}/:id`, this.controller.getJobDetails);

        // Submit completed work (freelancer only)
        this.router.post(
            `${this.path}/:id/submit`,
            validationMiddleware(SubmissionDto, "body", false, ["create"]),
            this.controller.submitWork
        );
    }
}
