import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { store } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET es obligatorio y debe tener al menos 32 caracteres.');
}

export function login(email, password) {
  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
  return {
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  };
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
