import { User } from '../types';

const API_URL = '/api/users';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch(API_URL, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Error fetching users');
  return response.json();
};

export const createUser = async (data: Partial<User> & { password?: string }): Promise<User> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error creating user');
  }
  return response.json();
};

export const updateUser = async (id: number, data: Partial<User> & { password?: string }): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
     const error = await response.json();
     throw new Error(error.message || 'Error updating user');
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error deleting user');
  }
};