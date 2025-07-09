export interface IJob {
    id: number;
    title: string;
    description?: string;
    is_active: boolean;
    is_pending: boolean;
    is_completed: boolean;
    created_by?: number;
    assigned_to?: number;
    created_at?: string;
    updated_at?: string;
}
