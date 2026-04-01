import bcrypt from 'bcryptjs';

const seedUsers = [
  { id: 'u-admin', email: 'admin@tarifario.local', password: 'Admin123!', role: 'admin', name: 'Admin' },
  { id: 'u-operador', email: 'operador@tarifario.local', password: 'Operador123!', role: 'operador', name: 'Operador' },
  { id: 'u-viewer', email: 'viewer@tarifario.local', password: 'Viewer123!', role: 'viewer', name: 'Viewer' }
];

export const store = {
  providers: [],
  users: seedUsers.map(u => ({ ...u, passwordHash: bcrypt.hashSync(u.password, 10), password: undefined })),
  exportJobs: []
};
