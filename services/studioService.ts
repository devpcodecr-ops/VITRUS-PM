import { Studio } from '../types';

const API_URL = '/api/studios';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getStudios = async (): Promise<Studio[]> => {
  const response = await fetch(API_URL, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Error fetching studios');
  return response.json();
};

export const createStudio = async (data: Partial<Studio>): Promise<Studio> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error creating studio');
  return response.json();
};

export const updateStudio = async (id: number, data: Partial<Studio>): Promise<Studio> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error updating studio');
  return response.json();
};

export const deleteStudio = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Error deleting studio');
};