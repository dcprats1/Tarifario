import express from 'express';
import cors from 'cors';
import tariffRoutes from './routes/tariffRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', tariffRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Tarifario API escuchando en http://localhost:${port}`);
});
