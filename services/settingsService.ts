const API_URL = '/api/settings';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getSettings = async (): Promise<Record<string, string>> => {
  const response = await fetch(API_URL, { headers: getHeaders() });
  if (!response.ok) throw new Error('Error fetching settings');
  return response.json();
};

export const updateSettings = async (data: Record<string, string>): Promise<void> => {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error updating settings');
};
