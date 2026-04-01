import { useState } from 'react';
import { api } from '../services/api';

export default function UploadPanel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [providerHint, setProviderHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      const result = await api.uploadTariff(file, providerHint);
      setMessage(`Tarifario cargado: ${result.provider.name}`);
      onUploaded();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h2>1) Subir tarifario</h2>
      <form onSubmit={onSubmit} className="stack">
        <input
          type="text"
          placeholder="Transportista (opcional)"
          value={providerHint}
          onChange={e => setProviderHint(e.target.value)}
        />
        <input
          type="file"
          accept=".pdf,.csv,.xlsx,.xls,.txt,.doc,.docx"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Procesando...' : 'Subir y procesar'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
