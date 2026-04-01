import { useEffect, useState } from 'react';
import UploadPanel from './components/UploadPanel';
import CalculatorPanel from './components/CalculatorPanel';
import ComparisonPanel from './components/ComparisonPanel';
import LoginPanel from './components/LoginPanel';
import ExportPanel from './components/ExportPanel';
import { api } from './services/api';

export default function App() {
  const [tariffs, setTariffs] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [user, setUser] = useState(null);

  const refresh = async () => {
    const [tariffData, comparisonData] = await Promise.all([api.getTariffs(), api.getComparison()]);
    setTariffs(tariffData.providers);
    setComparison(comparisonData.items);
  };

  useEffect(() => {
    api.getMe().then(({ user: current }) => {
      setUser(current);
      return refresh();
    }).catch(() => undefined);
  }, []);

  if (!user) {
    return (
      <main className="container">
        <h1>Analizador de Tarifas de Transporte y Paquetería AI</h1>
        <LoginPanel onLogin={async logged => {
          setUser(logged);
          await refresh();
        }} />
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Analizador de Tarifas de Transporte y Paquetería AI</h1>
      <p>Usuario: {user.email} · Rol: {user.role}</p>

      <UploadPanel onUploaded={refresh} />
      <CalculatorPanel />
      <ComparisonPanel data={comparison} />
      <ExportPanel tariffs={tariffs} />

      <section className="panel">
        <h2>Transportistas cargados</h2>
        <ul>
          {tariffs.map(item => (
            <li key={item.id}>{item.name} · {item.sourceFile} · conf. {Math.round((item.confidence || 0) * 100)}%</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
