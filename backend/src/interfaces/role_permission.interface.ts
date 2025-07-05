export interface IRolePermission {
  id?: number;
  role_id: number;
  permission_id: number;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: number;
}