import { AppliedProjectsDto } from "../dtos/applied_projects.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { APPLIED_PROJECTS } from "../database/applied_projects.schema";

class AppliedProjectsService {

    public async apply(data: AppliedProjectsDto): Promise<any> {
        // Validate required fields
        if (!data.projects_task_id || !data.users_id) {
            throw new HttpException(400, "Project Task ID and User ID are required");
        }

        // Check if already applied
        const existing = await DB(APPLIED_PROJECTS)
            .where({
                projects_task_id: data.projects_task_id, 
                users_id: data.users_id, 
                is_deleted: false
            })
            .first();

        if (existing) {
            throw new HttpException(409, "Already applied to this project");
        }

        // Set default values
        const applicationData = {
            ...data,
            status: data.status ?? 0, // 0 = pending
            is_active: true,
            is_deleted: false,
            created_at: new Date(),
            updated_at: new Date()
        };

        const appliedProject = await DB(T.APPLIED_PROJECTS)
            .insert(applicationData)
            .returning("*");

        return appliedProject[0];
    }

    public async getProjectApplications(projects_task_id: number): Promise<any[]> {
        if (!projects_task_id){
            throw new HttpException(400, "Project Task ID Required")
        }
        const projects = await DB(T.APPLIED_PROJECTS)
            .join('users', 'applied_projects.users_id', '=', 'users.users_id')
            .where({
                'applied_projects.projects_task_id': projects_task_id,
                'applied_projects.is_deleted': false
            })
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'users.first_name',
                'users.last_name',
                'users.profile_picture',
                'users.skill'
            );
        return projects;
    }

    public async getUserApplications(users_id: number): Promise<any[]> {
        if (!users_id) {
            throw new HttpException(400, "User ID Required");
        }
        const applications = await DB(T.APPLIED_PROJECTS)
            .join('projects_task', 'applied_projects.projects_task_id', '=', 'projects_task.projects_task_id')
            .where({
                'applied_projects.users_id': users_id,
                'applied_projects.is_deleted': false
            })
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'projects_task.*'
            );
        return applications;
    }

    public async getUserApplicationByProject(users_id: number, projects_task_id: number): Promise<any> {
        if (!users_id || !projects_task_id) {
            throw new HttpException(400, "User ID and Project Task ID required");
        }
        const applications = await DB(T.APPLIED_PROJECTS)
            .join('projects_task', 'applied_projects.projects_task_id', '=', 'projects_task.projects_task_id')
            .where({
                'applied_projects.users_id': users_id,
                'applied_projects.projects_task_id': projects_task_id,
                'applied_projects.is_deleted': false
            })
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'projects_task.*'
            );
        return applications;
    }

    public async updateApplicationStatus(applied_projects_id: number, status: number): Promise<any> {
        if (!applied_projects_id) {
            throw new HttpException(400, "applied_projects_id is required");
        }
        const updated = await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .update({
                status,
                updated_at: new Date()
            })
            .returning('*');
        if (!updated[0]) {
            throw new HttpException(404, "Application not found");
        }
        return updated[0];
    }

    public async withdrawApplication(applied_projects_id: number): Promise<void> {
        if (!applied_projects_id) {
            throw new HttpException(400, "applied_projects_id is required");
        }

        const application = await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .first();

        if (!application) {
            throw new HttpException(404, "Application not found");
        }

        if (application.is_deleted) {
            throw new HttpException(400, "Application has already been withdrawn.");
        }

        await DB(T.APPLIED_PROJECTS)
            .where({ applied_projects_id })
            .update({
                is_deleted: true,
                updated_at: new Date()
            });
    }

}

export default AppliedProjectsService;
