import { useState } from 'react';
import { api } from '../services/api';

export default function LoginPanel({ onLogin }) {
  const [email, setEmail] = useState('admin@tarifario.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      const session = await api.login(email, password);
      onLogin(session.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel">
      <h2>Acceso</h2>
      <p>Demo: admin@tarifario.local / Admin123!</p>
      <form onSubmit={submit} className="stack">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
        <button type="submit">Entrar</button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
