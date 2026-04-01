import xlsx from 'xlsx';

function toExportPayload(provider) {
  return {
    id: provider.id,
    name: provider.name,
    sourceFile: provider.sourceFile,
    confidence: provider.confidence,
    rules: provider.rules,
    metadata: {
      exportedAt: new Date().toISOString(),
      app: 'Tarifario AI'
    }
  };
}

export function exportAsJson(provider) {
  return {
    filename: `${provider.name.replace(/\s+/g, '_').toLowerCase()}.json`,
    contentType: 'application/json',
    buffer: Buffer.from(JSON.stringify(toExportPayload(provider), null, 2))
  };
}

export function exportAsCsv(provider) {
  const header = 'max_weight_kg,base_price\n';
  const rows = provider.rules.weightTiers.map(t => `${t.max},${t.price}`).join('\n');
  return {
    filename: `${provider.name.replace(/\s+/g, '_').toLowerCase()}.csv`,
    contentType: 'text/csv',
    buffer: Buffer.from(header + rows)
  };
}

export function exportAsXlsx(provider) {
  const wb = xlsx.utils.book_new();
  const tiersSheet = xlsx.utils.json_to_sheet(provider.rules.weightTiers.map(t => ({ max_weight_kg: t.max, base_price: t.price })));
  const rulesSheet = xlsx.utils.json_to_sheet([
    {
      max_weight_kg: provider.rules.maxWeightKg,
      volumetric_divisor: provider.rules.volumetricDivisor,
      fuel_surcharge_pct: provider.rules.fuelSurchargePct,
      insurance_pct: provider.rules.insurancePct,
      overweight_penalty: provider.rules.overweightPenalty
    }
  ]);

  xlsx.utils.book_append_sheet(wb, tiersSheet, 'weight_tiers');
  xlsx.utils.book_append_sheet(wb, rulesSheet, 'rules');

  const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
  return {
    filename: `${provider.name.replace(/\s+/g, '_').toLowerCase()}.xlsx`,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer
  };
}
