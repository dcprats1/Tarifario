import { useEffect, useState } from 'react';
import UploadPanel from './components/UploadPanel';
import CalculatorPanel from './components/CalculatorPanel';
import ComparisonPanel from './components/ComparisonPanel';
import { api } from './services/api';

export default function App() {
  const [tariffs, setTariffs] = useState([]);
  const [comparison, setComparison] = useState([]);

  const refresh = async () => {
    const [tariffData, comparisonData] = await Promise.all([api.getTariffs(), api.getComparison()]);
    setTariffs(tariffData.providers);
    setComparison(comparisonData.items);
  };

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  return (
    <main className="container">
      <h1>Analizador de Tarifas de Transporte y Paquetería AI</h1>
      <p>Sube tarifarios, calcula precios y compara transportistas desde una sola interfaz.</p>

      <UploadPanel onUploaded={refresh} />
      <CalculatorPanel />
      <ComparisonPanel data={comparison} />

      <section className="panel">
        <h2>Transportistas cargados</h2>
        <ul>
          {tariffs.map(item => (
            <li key={item.id}>{item.name} · {item.sourceFile}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
