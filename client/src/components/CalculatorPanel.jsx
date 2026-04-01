import { useState } from 'react';
import { api } from '../services/api';

const defaults = {
  packageType: 'paquete',
  destinationZone: 'nacional',
  weightKg: 1,
  lengthCm: 20,
  widthCm: 20,
  heightCm: 20,
  insuredValue: 0
};

export default function CalculatorPanel() {
  const [form, setForm] = useState(defaults);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const update = (field, value) => setForm(current => ({ ...current, [field]: value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.calculateQuote({
        ...form,
        weightKg: Number(form.weightKg),
        lengthCm: Number(form.lengthCm),
        widthCm: Number(form.widthCm),
        heightCm: Number(form.heightCm),
        insuredValue: Number(form.insuredValue)
      });
      setResults(data.quotes);
    } catch (err) {
      setError(err.message);
      setResults([]);
    }
  };

  return (
    <section className="panel">
      <h2>2) Calcular envío</h2>
      <form onSubmit={onSubmit} className="grid">
        <select value={form.packageType} onChange={e => update('packageType', e.target.value)}>
          <option value="sobre">Sobre</option>
          <option value="paquete">Paquete</option>
          <option value="palet">Palet</option>
        </select>
        <input value={form.destinationZone} onChange={e => update('destinationZone', e.target.value)} placeholder="Zona destino" />
        <input type="number" min="0" step="0.01" value={form.weightKg} onChange={e => update('weightKg', e.target.value)} placeholder="Peso (kg)" />
        <input type="number" min="0" value={form.lengthCm} onChange={e => update('lengthCm', e.target.value)} placeholder="Largo (cm)" />
        <input type="number" min="0" value={form.widthCm} onChange={e => update('widthCm', e.target.value)} placeholder="Ancho (cm)" />
        <input type="number" min="0" value={form.heightCm} onChange={e => update('heightCm', e.target.value)} placeholder="Alto (cm)" />
        <input type="number" min="0" value={form.insuredValue} onChange={e => update('insuredValue', e.target.value)} placeholder="Valor asegurado (€)" />
        <button type="submit">Comparar precios</button>
      </form>

      {error && <p className="error">{error}</p>}
      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Transportista</th>
              <th>Peso tarificable</th>
              <th>Base</th>
              <th>Recargos</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {results.map(row => (
              <tr key={row.providerId}>
                <td>{row.providerName}</td>
                <td>{row.billableWeightKg.toFixed(2)} kg</td>
                <td>{row.basePrice.toFixed(2)} €</td>
                <td>{row.surchargesTotal.toFixed(2)} €</td>
                <td><strong>{row.total.toFixed(2)} €</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
