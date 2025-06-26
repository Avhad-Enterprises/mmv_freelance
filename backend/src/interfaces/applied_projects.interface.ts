export interface IAppliedProjects {
    applied_projects_id: number;
    projects_task_id: number;
    users_id: number;
    status: string;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}
  