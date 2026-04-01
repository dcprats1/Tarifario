import { useState } from 'react';
import { api } from '../services/api';

export default function ExportPanel({ tariffs }) {
  const [tariffId, setTariffId] = useState('');
  const [format, setFormat] = useState('csv');
  const [message, setMessage] = useState('');

  const download = async () => {
    if (!tariffId) return;
    try {
      const { blob, filename } = await api.exportTariff({ tariffId, format });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setMessage(`Exportado: ${filename}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <section className="panel">
      <h2>4) Exportaciones</h2>
      <div className="grid">
        <select value={tariffId} onChange={e => setTariffId(e.target.value)}>
          <option value="">Selecciona tarifario</option>
          {tariffs.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select value={format} onChange={e => setFormat(e.target.value)}>
          <option value="csv">CSV</option>
          <option value="xlsx">Excel (.xlsx)</option>
          <option value="json">JSON</option>
        </select>
        <button type="button" onClick={download} disabled={!tariffId}>Exportar</button>
      </div>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
