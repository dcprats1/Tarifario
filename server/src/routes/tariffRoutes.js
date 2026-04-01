import { Router } from 'express';
import multer from 'multer';
import { extractRawRows } from '../utils/fileReaders.js';
import { parseTariff } from '../services/tariffParser.js';
import { store } from '../data/store.js';
import { quoteProvider } from '../services/pricingEngine.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Debes subir un documento' });

    const rows = await extractRawRows(req.file);
    const provider = parseTariff({
      rows,
      providerHint: req.body.providerHint,
      sourceFile: req.file.originalname
    });

    const providerWithId = {
      ...provider,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    };

    store.providers.push(providerWithId);

    res.status(201).json({ provider: providerWithId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/tariffs', (req, res) => {
  res.json({ providers: store.providers.map(({ id, name, sourceFile }) => ({ id, name, sourceFile })) });
});

router.post('/quote', (req, res) => {
  if (store.providers.length === 0) {
    return res.status(400).json({ message: 'No hay transportistas cargados' });
  }

  const shipment = req.body;
  const required = ['destinationZone', 'weightKg', 'lengthCm', 'widthCm', 'heightCm'];
  const missing = required.filter(field => shipment[field] === undefined || shipment[field] === null);

  if (missing.length > 0) {
    return res.status(400).json({ message: `Campos obligatorios: ${missing.join(', ')}` });
  }

  const quotes = store.providers
    .map(provider => quoteProvider(provider, shipment))
    .sort((a, b) => a.total - b.total);

  res.json({ quotes });
});

router.get('/comparison', (req, res) => {
  const items = store.providers.map(provider => ({
    providerId: provider.id,
    providerName: provider.name,
    maxWeightKg: provider.rules.maxWeightKg,
    volumetricDivisor: provider.rules.volumetricDivisor,
    fuelSurchargePct: provider.rules.fuelSurchargePct,
    insurancePct: provider.rules.insurancePct,
    overweightPenalty: provider.rules.overweightPenalty
  }));

  res.json({ items });
});

export default router;
