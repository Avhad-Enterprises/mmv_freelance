export interface Favorite {
    id: number;
    user_id: number;
    favorite_type: 'project' | 'freelancer';
    favorite_project_id?: number | null;
    favorite_freelancer_id?: number | null;
    is_active: number;
    created_by: number;
    created_at: Date;
    updated_at: Date;
    updated_by?: number | null;
    is_deleted: boolean;
    deleted_by?: number | null;
    deleted_at?: Date | null;
  }
  