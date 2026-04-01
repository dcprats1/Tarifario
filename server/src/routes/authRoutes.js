import { Router } from 'express';
import { login } from '../services/authService.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  try {
    const session = login(email, password);
    return res.json(session);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

export default router;
