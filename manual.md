# 📖 Manual de uso - Analizador de Tarifas AI

## 1) ¿Qué hace la aplicación?

Te permite subir tarifarios de transportistas y convertirlos en reglas comparables para calcular precios finales de envío.

## 2) Uso rápido

1. Abre la aplicación web.
2. En **Subir tarifario**, selecciona un archivo (PDF, Excel, CSV, TXT, Word).
3. (Opcional) indica nombre del transportista.
4. Pulsa **Subir y procesar**.
5. En **Calcular envío** completa:
   - tipo de bulto,
   - zona destino,
   - peso y medidas,
   - valor asegurado.
6. Pulsa **Comparar precios**.
7. Revisa:
   - tabla de costes ordenada por mejor precio,
   - comparativa global de condiciones por proveedor.

## 3) Qué interpreta automáticamente

- Peso tarificable (real vs volumétrico)
- Tramo base por peso
- Recargo combustible (%)
- Seguro (%)
- Penalización por exceso de peso

## 4) Limitaciones actuales

- La información se guarda en memoria (si reinicias servidor, se pierde).
- El parser es heurístico: funciona bien para formatos comunes, pero no para todos los diseños complejos.

## 5) URLs de trabajo

- Frontend: `http://localhost:5173`
- API backend: `http://localhost:3001`

---
Manual actualizado: **1 de abril de 2026**
