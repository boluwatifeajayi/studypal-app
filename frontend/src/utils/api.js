const BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const healthBase = BASE.replace(/\/api\/?$/, '');

export const api = {
  post: (path, body) => fetch(`${BASE}${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  get: (path) => fetch(`${BASE}${path}`, { headers: headers() }).then(handle),
  patch: (path, body) => fetch(`${BASE}${path}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }).then(handle),
  delete: (path) => fetch(`${BASE}${path}`, { method: 'DELETE', headers: headers() }).then(handle),
  health: () => fetch(`${healthBase}/api/health`).then((r) => r.ok ? r.json() : Promise.reject(new Error('Unhealthy'))),
};