import { Router } from 'express';
import multer from 'multer';
import { extractRawRows } from '../utils/fileReaders.js';
import { parseTariff } from '../services/tariffParser.js';
import { store } from '../data/store.js';
import { quoteProvider } from '../services/pricingEngine.js';
import { enrichTariffWithLlm } from '../services/llmExtractionService.js';
import { exportAsCsv, exportAsJson, exportAsXlsx } from '../services/exportService.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxUploadMb * 1024 * 1024
  }
});

router.post('/upload', requireAuth, requireRole('admin', 'operador'), (req, res) => {
  upload.single('document')(req, res, async error => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: `Archivo demasiado grande. Límite: ${maxUploadMb}MB.` });
    }

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      if (!req.file) return res.status(400).json({ message: 'Debes subir un documento' });

      const rows = await extractRawRows(req.file);
      const parsed = parseTariff({
        rows,
        providerHint: req.body.providerHint,
        sourceFile: req.file.originalname
      });

      const llmProcessed = await enrichTariffWithLlm({ provider: parsed, rows, confidence: parsed.confidence });

      const providerWithId = {
        ...llmProcessed.provider,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdBy: req.user.sub,
        llmStrategy: llmProcessed.strategy,
        llmProvider: llmProcessed.llmProvider
      };

      store.providers.push(providerWithId);

      return res.status(201).json({ provider: providerWithId });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  });
});

router.get('/tariffs', requireAuth, (req, res) => {
  res.json({
    providers: store.providers.map(({ id, name, sourceFile, confidence, llmStrategy }) => ({
      id,
      name,
      sourceFile,
      confidence,
      llmStrategy
    }))
  });
});

router.post('/quote', requireAuth, (req, res) => {
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

  return res.json({ quotes });
});

router.get('/comparison', requireAuth, (req, res) => {
  const items = store.providers.map(provider => ({
    providerId: provider.id,
    providerName: provider.name,
    maxWeightKg: provider.rules.maxWeightKg,
    volumetricDivisor: provider.rules.volumetricDivisor,
    fuelSurchargePct: provider.rules.fuelSurchargePct,
    insurancePct: provider.rules.insurancePct,
    overweightPenalty: provider.rules.overweightPenalty
  }));

  return res.json({ items });
});

router.post('/export', requireAuth, (req, res) => {
  const { tariffId, format } = req.body;
  const provider = store.providers.find(p => p.id === tariffId);
  if (!provider) return res.status(404).json({ message: 'Tarifario no encontrado' });

  let exported;
  if (format === 'json') exported = exportAsJson(provider);
  else if (format === 'csv') exported = exportAsCsv(provider);
  else if (format === 'xlsx') exported = exportAsXlsx(provider);
  else return res.status(400).json({ message: 'Formato no soportado. Usa csv, xlsx o json.' });

  store.exportJobs.push({
    id: `${Date.now()}-export`,
    providerId: provider.id,
    format,
    requestedBy: req.user.sub,
    createdAt: new Date().toISOString()
  });

  res.setHeader('Content-Type', exported.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
  return res.send(exported.buffer);
});

export default router;
