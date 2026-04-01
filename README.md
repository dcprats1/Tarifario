# Analizador de Tarifas de Transporte y Paquetería AI

Aplicación full-stack (React + Node.js) para cargar tarifarios, interpretar reglas y calcular precios comparados entre transportistas.

## ✅ Estado actual

Esta versión ya incluye:

- Upload de documentos: **PDF, Excel, CSV, TXT, DOC/DOCX**.
- Parser inteligente inicial que detecta:
  - Tramos de peso/precio
  - Factor volumétrico
  - Recargo combustible
  - Seguro
  - Penalización por sobrepeso
- Calculadora de envío por tipo de bulto, peso, medidas y zona.
- Comparativa global entre transportistas cargados.
- API REST para integración con TMS/comparadores.

## Arquitectura

- **Frontend**: React + Vite (`client/`)
- **Backend**: Node.js + Express (`server/`)
- **Procesamiento**:
  - `xlsx` para Excel
  - `csv-parse` para CSV
  - `pdf-parse` para PDF
  - `mammoth` para Word

## Puesta en marcha

```bash
npm install
npm run dev
```

Servicios:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Endpoints principales

- `POST /api/upload` → sube y procesa un tarifario
- `GET /api/tariffs` → lista transportistas cargados
- `POST /api/quote` → calcula comparativa de precios
- `GET /api/comparison` → resumen de reglas y recargos

## Próximos pasos recomendados

- Persistencia en base de datos (actualmente memoria).
- Normalización avanzada por plantillas de proveedor.
- Exportación directa a CSV/XLSX/JSON desde interfaz.
- Autenticación y multiusuario.

## Licencia

MIT
