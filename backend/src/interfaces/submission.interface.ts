export interface ISubmission {
    id: number;
    job_id: number;
    submitted_by: number;
    file_url?: string;
    message?: string;
    submitted_at?: string;
}
