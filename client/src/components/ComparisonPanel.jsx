export default function ComparisonPanel({ data }) {
  return (
    <section className="panel">
      <h2>3) Comparativa global</h2>
      {data.length === 0 ? (
        <p>No hay tarifarios cargados aún.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Transportista</th>
              <th>Peso máximo</th>
              <th>Volumétrico</th>
              <th>Combustible</th>
              <th>Seguro</th>
              <th>Penalización exceso</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.providerId}>
                <td>{item.providerName}</td>
                <td>{item.maxWeightKg} kg</td>
                <td>/{item.volumetricDivisor}</td>
                <td>{item.fuelSurchargePct}%</td>
                <td>{item.insurancePct}%</td>
                <td>{item.overweightPenalty.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
