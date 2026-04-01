import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { store } from '../data/store.js';

const envSecret = process.env.JWT_SECRET;
const runtimeSecret = randomBytes(64).toString('hex');
const JWT_SECRET = envSecret && envSecret.length >= 32 ? envSecret : runtimeSecret;

if (!envSecret || envSecret.length < 32) {
  console.warn('[auth] JWT_SECRET no definido (o demasiado corto). Se usa un secreto efímero seguro para esta sesión.');
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
