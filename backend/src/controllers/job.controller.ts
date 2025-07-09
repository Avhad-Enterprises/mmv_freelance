import { Request, Response, NextFunction } from "express";
import JobService from "../services/job.services";
import { SubmissionDto } from "../dtos/submission.dto";

export default class JobController {
    private jobService = new JobService();

    public getActiveJobs = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = parseInt(req.query.user_id as string);
            const role = req.query.role as string;

            if (!userId || !role) {
                return res.status(400).json({
                    message:
                        "Missing required query parameters: user_id and role",
                });
            }

            const jobs = await this.jobService.getActiveJobs(userId, role);
            res.status(200).json({
                data: jobs,
                message: "Active jobs fetched",
            });
        } catch (err) {
            next(err);
        }
    };

    public getJobDetails = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const job_id = parseInt(req.params.id);
            const job = await this.jobService.getJobDetails(job_id);
            res.status(200).json({ data: job, message: "Job details fetched" });
        } catch (err) {
            next(err);
        }
    };

    public submitWork = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const job_id = parseInt(req.params.id);
            const data: SubmissionDto = req.body;
            const submission = await this.jobService.submitJob(job_id, data);
            res.status(201).json({
                data: submission,
                message: "Work submitted successfully",
            });
        } catch (err) {
            next(err);
        }
    };
}
