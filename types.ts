export enum UserRole {
  ADMIN_GLOBAL = 'admin_global',
  ADMIN_STUDIO = 'admin_studio',
  COLLABORATOR = 'collaborator',
  CLIENT = 'client',
}

export interface User {
  id: number;
  studio_id: number; // Critical for Multi-Tenant
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  id: number;
  studio_id: number;
  name: string;
  description?: string;
  client_name: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  progress: number;
  start_date: string;
  end_date: string;
  created_at?: string;
}

export interface Studio {
  id: number;
  name: string;
  email: string;
  plan_id: number;
  subscription_status: 'active' | 'suspended' | 'cancelled';
}

export interface Task {
  id: number;
  project_id: number;
  studio_id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
}
