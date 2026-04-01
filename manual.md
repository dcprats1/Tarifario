# 📖 Manual de uso - Analizador de Tarifas AI

## 1) Inicio de sesión

Usa una cuenta demo:
- **admin**: `admin@tarifario.local` / `Admin123!`
- **operador**: `operador@tarifario.local` / `Operador123!`
- **viewer**: `viewer@tarifario.local` / `Viewer123!`

## 2) Cargar tarifario

1. Inicia sesión.
2. En “Subir tarifario”, selecciona archivo (PDF, Excel, CSV, TXT, DOC/DOCX).
3. Opcional: escribe nombre de transportista.
4. Pulsa “Subir y procesar”.

## 3) Comparar precios

1. Completa bulto, zona, peso y medidas.
2. Pulsa “Comparar precios”.
3. Revisa resultados ordenados por total.

## 4) Exportar

1. Ve a “Exportaciones”.
2. Selecciona tarifario.
3. Selecciona formato (`csv`, `xlsx`, `json`).
4. Pulsa exportar y descarga.

## 5) Notas técnicas importantes

- El parser usa enfoque híbrido:
  - Capa 1: heurística local.
  - Capa 2: LLM (Groq/DeepSeek) si la confianza es baja.
- La persistencia completa está preparada para Supabase (schema SQL incluido), pero aún no está conectada.

---
Manual actualizado: **1 de abril de 2026**
