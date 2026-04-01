import express from 'express';
import cors from 'cors';
import tariffRoutes from './routes/tariffRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api', tariffRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tarifario-api' });
});

app.listen(port, () => {
  console.log(`Tarifario API escuchando en http://localhost:${port}`);
});
