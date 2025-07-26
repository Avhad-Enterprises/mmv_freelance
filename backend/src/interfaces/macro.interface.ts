export interface Macro {
  macro_id?: number;            
  title: string;                
  description?: string;         
  reply_template: string;       
  tags?: string[];             
  category?: 'refund' | 'delay' | 'feedback' | 'general' | 'technical';  
  placeholders?: string[];  
  is_active?: number;          
  created_by: number;          
  updated_by?: number;          
  is_deleted?: boolean;        
  deleted_by?: number;       
}
