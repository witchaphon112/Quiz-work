const API_BASE_URL = 'https://cis.kku.ac.th/api/classroom';
const API_KEY = '740c059a2ce3c0aa0af32497ac1446121ee6e42f44d06bdb1dd937650b5d1bfd';

export interface LoginResponse {
  data: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    type: string;
    confirmed: boolean;
    createdAt: string;
    updatedAt: string;
    token: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  return await response.json();
};

export const getProfile = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-api-key': API_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return await response.json();
};

export const getClassMembers = async (year: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/class/${year}`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'x-api-key': API_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });

  const json = await response.json().catch(() => undefined);

  if (!response.ok) {
    const msg = (json && (json.error || json.message)) || `Failed to fetch class members (${response.status})`;
    throw new Error(msg);
  }
  const maybeData = json?.data ?? json;
  if (Array.isArray(maybeData)) return maybeData;
  if (maybeData && Array.isArray(maybeData.students)) return maybeData.students;
  return [];
};