# Analizador de Tarifas de Transporte y Paquetería AI

Aplicación full-stack para cargar, interpretar, comparar y exportar tarifarios de transporte.

## Estado actual (fase 2)

### Backend/API
- Upload y parsing de documentos: PDF, Excel, CSV, TXT, DOCX.
- Parser determinista/heurístico como primera capa.
- Capa híbrida LLM preparada con proveedores intercambiables:
  - Groq (por defecto)
  - DeepSeek (alternativa)
- Autenticación básica JWT + roles (`admin`, `operador`, `viewer`) preparada para migrar a Supabase Auth.
- Exportaciones implementadas vía `POST /api/export`:
  - `csv`
  - `xlsx`
  - `json`

### Frontend
- Login en UI.
- Upload de tarifarios.
- Calculadora de envío y comparación entre proveedores.
- Descarga de exportaciones (CSV/XLSX/JSON).

## Endpoints principales

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Tarifarios
- `POST /api/upload`
- `GET /api/tariffs`
- `POST /api/quote`
- `GET /api/comparison`
- `POST /api/export`

## Supabase-ready (sin conexión aún)

Se añadió esquema SQL completo en:
- `db/migrations/001_supabase_schema.sql`

Incluye:
- tablas principales,
- relaciones,
- índices,
- base de políticas RLS,
- función helper `is_admin()`.

## npm install (403 Forbidden)

Se añadió `.npmrc` para usar mirror alternativo y evitar restricciones del registry principal en entornos bloqueados.

## Ejecución local

```bash
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

Configuración útil:
- `MAX_UPLOAD_MB` (por defecto `10`) para limitar tamaño de archivos en upload con Multer memoryStorage.
- `JWT_SECRET` obligatorio (mínimo 32 caracteres) para firmar/validar tokens.

## Roadmap inmediato

1. Conectar Supabase real (DB + Auth + Storage) con tus credenciales.
2. Reemplazar auth JWT local por Supabase Auth end-to-end.
3. Persistir proveedores, reglas, export jobs y uploads en PostgreSQL.
4. Afinar parser híbrido con score de confianza trazable por campo.
5. Añadir test suite (API + parser + exportaciones).
