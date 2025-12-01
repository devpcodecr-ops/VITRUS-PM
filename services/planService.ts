export interface Plan {
  id: number;
  name: string;
  price: number;
  max_users: number;
  max_projects: number;
  max_storage_gb: number;
  features?: string;
  is_active: boolean;
}

const API_URL = '/api/plans';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getPlans = async (): Promise<Plan[]> => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  if (!response.ok) throw new Error('Error fetching plans');
  return response.json();
};

export const createPlan = async (data: Partial<Plan>): Promise<Plan> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error creating plan');
  return response.json();
};

export const updatePlan = async (id: number, data: Partial<Plan>): Promise<Plan> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error updating plan');
  return response.json();
};

export const deletePlan = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error deleting plan');
  }
};
