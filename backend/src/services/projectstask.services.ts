import { ProjectsTaskDto } from "../dtos/projectstask.dto";
import DB, { T } from "../database/index.schema";
import { IProjectTask } from '../interfaces/projectstask.interfaces';
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { PROJECTS_TASK } from "../database/projectstask.schema";
import { SubmitProjectDto } from "../dtos/submit_project.dto";
import { SUBMITTED_PROJECTS } from "../database/submitted_projects.schema";

class ProjectstaskService {
  public async Insertmyprojectstask(data: ProjectsTaskDto): Promise<any> {
    if (!data || Object.keys(data).length === 0) {
      throw new HttpException(400, 'Data invalid or empty');
    }

    const payload: Record<string, any> = {
      ...data,
      skills_required: JSON.stringify(data.skills_required),
      reference_links: JSON.stringify(data.reference_links),
      // status: JSON.stringify(data.status),
      sample_project_file: JSON.stringify(data.sample_project_file),
      project_files: data.project_files
        ? JSON.stringify(data.project_files)
        : null,
    };
    try {
      const [created] = await DB(PROJECTS_TASK)
        .insert(payload)
        .returning('*');
      return created;
    } catch (err: any) {
      console.error('DB insert error:', err);
      throw new HttpException(500, `Project insertion failed — ${err.message}`);
    };
  }

  public async getById(projects_task_id: number): Promise<any | null> {
    if (!projects_task_id) {
      throw new HttpException(400, "projects Task ID is required");
    }
    const projects = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id, is_deleted: false })
      .first();
    return projects || null;
  }

  public async update(projects_task_id: number, data: Partial<ProjectsTaskDto>): Promise<any> {
    if (!projects_task_id) throw new HttpException(400, 'projects Task ID is required');
    if (isEmpty(data)) throw new HttpException(400, 'Update data is empty');

    // 👇 Stringify JSON/array fields to avoid PostgreSQL JSON error
    const fieldsToStringify = [
      'skills_required',
      'reference_links',
      'status',
      'sample_project_file',
      'project_files',
      'show_all_files'
    ];

    for (const key of fieldsToStringify) {
      if ((data as any)[key] !== undefined) {
        (data as any)[key] = JSON.stringify((data as any)[key]);
      }
    }

    const updated = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id })
      .update(data)
      .returning('*');

    if (!updated || updated.length === 0) {
      throw new HttpException(404, 'projects Task not found or not updated');
    }
    return updated[0];
  }

  public async SoftDeleteEvent(projects_task_id: number): Promise<any> {
    if (!projects_task_id) throw new HttpException(400, " is required");

    console.log(projects_task_id)

    const update = {
      is_deleted: true,
      deleted_by: 1,
      deleted_at: new Date()
    };

    console.log(DB(T.PROJECTS_TASK)
      .where({ projects_task_id })
      .update(update)
      .returning("*").toQuery());
    const deleted = await DB(T.PROJECTS_TASK)
      .where({ projects_task_id })
      .update(update)
      .returning("*");

    if (!deleted.length) throw new HttpException(404, "projects Task not found or already deleted");

    return deleted[0];
  }

  public async projectstaskActive(): Promise<number> {
    const count = await DB(T.PROJECTS_TASK)
      .where({ is_active: 1, is_deleted: false })
      .count("projects_task_id as count");

    return Number(count[0].count);
  }

  public async countprojectstask(): Promise<number> {
    const result = await DB(T.PROJECTS_TASK)
      .whereNotNull('Deadline')
      .count('projects_task_id as count');
    return Number(result[0].count);
  }

  public getallprojectstask = async (): Promise<IProjectTask[]> => {
    try {
      const result = await DB(T.PROJECTS_TASK)
        .where({ is_active: 1, is_deleted: false })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching projects');
    }
  }

  public getactivedeletedprojectstask = async (): Promise<IProjectTask[]> => {
    try {
      const result = await DB(T.PROJECTS_TASK)
        .where({ is_deleted: false })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching projects');
    }
  }

  public getDeletedprojectstask = async (): Promise<IProjectTask[]> => {
    try {
      const result = await DB(T.PROJECTS_TASK)
        .where({ is_deleted: true })
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching projects Task');
    }
  }

  public async submit(data: SubmitProjectDto): Promise<any> {
    
    if (!data.projects_task_id || !data.user_id) {
      throw new HttpException(400, "Project Task ID and User ID are required");
    }

    const existing = await DB(SUBMITTED_PROJECTS)
    .where({
        projects_task_id: data.projects_task_id, 
        user_id: data.user_id, 
        is_deleted: false
    })
    .first();

    if (existing) {
    throw new HttpException(409, "Already Submitted");
    }
    const submitData = {
      ...data,
      status: data.status ?? 0, // 0 = pending
      is_active: true,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    const submitted_project = await DB (T.SUBMITTED_PROJECTS)
      .insert(submitData)
      .returning("*");

    return submitted_project[0];  
  }

  public async approve (submission_id:number ,status: number, data: SubmitProjectDto): Promise<any>{
    if(!submission_id || !status){
      throw new HttpException(400, "Submission id and Status is required");
    }

    const existing = await DB(SUBMITTED_PROJECTS)
    .where({
        submission_id: data.submission_id, 
        status : data.status, 
        is_deleted: false
    })
    .first();

    if (existing) {
      throw new HttpException(409, "Already Updated");
      }
      const submitData = {
        ...data,
        submission_id: submission_id,
        status: status,
        is_active: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      };

    const approved = await DB(T.SUBMITTED_PROJECTS)
      .where({submission_id})
      .update({
        status,
        updated_at : new Date()
      })
      .returning('*');
    if(!approved || approved.length === 0){
      throw new HttpException(404, "Submission not found");
    }  
    return approved[0];
  }

}

export default ProjectstaskService;
