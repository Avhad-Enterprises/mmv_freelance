export interface IApplication {
    id: number;
    applied_to_job_id: number;
    applicant_id: number;
    resume_url?: string;
    cover_letter?: string;
    expected_amount?: number;
    is_hired: boolean;
    applied_at?: string;
}
