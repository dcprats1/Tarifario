const TOKEN_KEY = 'tarifario_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error inesperado' }));
    throw new Error(error.message || 'Error en la petición');
  }
  return response;
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
}

export const api = {
  login: async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await (await handleResponse(response)).json();
    setToken(json.token);
    return json;
  },

  getMe: async () => {
    const response = await authFetch('/api/auth/me');
    return (await handleResponse(response)).json();
  },

  uploadTariff: async (file, providerHint = '') => {
    const formData = new FormData();
    formData.append('document', file);
    if (providerHint) formData.append('providerHint', providerHint);

    const response = await authFetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    return (await handleResponse(response)).json();
  },

  getTariffs: async () => {
    const response = await authFetch('/api/tariffs');
    return (await handleResponse(response)).json();
  },

  getComparison: async () => {
    const response = await authFetch('/api/comparison');
    return (await handleResponse(response)).json();
  },

  calculateQuote: async payload => {
    const response = await authFetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return (await handleResponse(response)).json();
  },

  exportTariff: async ({ tariffId, format }) => {
    const response = await authFetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tariffId, format })
    });
    await handleResponse(response);
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition') || '';
    const filename = disposition.split('filename=')[1]?.replaceAll('"', '') || `tarifario.${format}`;
    return { blob, filename };
  }
};
