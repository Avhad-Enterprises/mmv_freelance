export interface Report {
    report_id: number;
    report_type: 'user' | 'project';
    reporter_id: number;
    reported_project_id?: number | null;
    tags: any; // You can use a more specific type like `string[]` or `Record<string, any>` if known
    notes: string;
    reason: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
    admin_remarks?: string | null;
    reviewed_by?: number | null;
    email: string;
    is_active: number;
    created_by: number;
    created_at: Date;
    updated_at: Date;
    updated_by?: number | null;
    is_deleted: boolean;
    deleted_by?: number | null;
    deleted_at?: Date | null;
  }
  