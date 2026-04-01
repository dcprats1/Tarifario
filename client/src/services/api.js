async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error inesperado' }));
    throw new Error(error.message || 'Error en la petición');
  }
  return response.json();
}

export const api = {
  uploadTariff: async (file, providerHint = '') => {
    const formData = new FormData();
    formData.append('document', file);
    if (providerHint) formData.append('providerHint', providerHint);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    return handleResponse(response);
  },

  getTariffs: async () => handleResponse(await fetch('/api/tariffs')),

  getComparison: async () => handleResponse(await fetch('/api/comparison')),

  calculateQuote: async payload =>
    handleResponse(
      await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    )
};
