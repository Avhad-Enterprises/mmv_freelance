export interface IMilestone {
  id: number;              
  job_id: number;          
  title: string;
  description?: string;
  due_date?: string;       
  completed: boolean;
}
