import DB, { T } from "../database/index.schema";
import { SubmissionDto } from "../dtos/submission.dto";
import HttpException from "../exceptions/HttpException";
import { IJob } from "../interfaces/job.interface";

export default class JobService {
    public async getActiveJobs(user_id: number, role: string): Promise<IJob[]> {
        const user = await DB(T.User_Table).where({ user_id: user_id }).first();
        if (!user) {
            throw new HttpException(404, "User not found");
        }
        if (user.role !== role) {
            throw new HttpException(
                400,
                `User role mismatch: User is not a ${role}`
            );
        }

        const query = DB(T.Project_Table)
            .where({ is_active: true })
            .orderBy("projects_task_id", "asc");

        if (role === "client") {
            query.andWhere("client_id", user_id);
        } else if (role === "freelancer") {
            query.andWhere("editor_id", user_id);
        } else {
            throw new HttpException(400, "Invalid role");
        }

        return await query;
    }

    public async getJobDetails(job_id: number) {
        const job = await DB(T.Project_Table).where({ projects_task_id: job_id }).first();
        if (!job) throw new HttpException(404, "Job not found");

        const milestones = await DB(T.Milestone_Table).where({ job_id });
        const files = await DB(T.JobFile_Table).where({ job_id });

        return { ...job, milestones, files };
    }

    public async submitJob(job_id: number, data: SubmissionDto) {
        const job = await DB(T.Project_Table).where({ projects_task_id: job_id }).first();
        if (!job) {
            throw new HttpException(404, "Job not found");
        }

        // Ensure job is assigned to a freelancer
        if (job.editor_id == null) {
            throw new HttpException(
                403,
                "Job is not assigned to any freelancer"
            );
        }

        // Validate freelancer
        const user = await DB(T.User_Table)
            .where({ user_id: data.submitted_by, role: "freelancer" })
            .first();
        if (!user) {
            throw new HttpException(
                404,
                "Submitting freelancer does not exist"
            );
        }

        // Check if freelancer is assigned
        if (job.editor_id !== data.submitted_by) {
            throw new HttpException(403, "You are not assigned to this job");
        }

        // Check if submission already exists with same job_id, submitted_by, file_url, and message
        const existing = await DB(T.Submission_Table)
            .where({
                job_id,
                submitted_by: data.submitted_by,
                file_url: data.file_url,
                message: data.message,
            })
            .first();

        if (existing) {
            const updated = await DB(T.Submission_Table)
                .where({ id: existing.id })
                .update({ submitted_at: DB.fn.now() })
                .returning("*");
            return updated[0];
        }

        // Else insert a new submission
        const inserted = await DB(T.Submission_Table)
            .insert({ ...data, job_id })
            .returning("*");

        await DB(T.Project_Table)
            .where({ projects_task_id: job_id })
            .update({
                is_active: false,
                status: "completed"
            });

        return inserted[0];
    }
}
