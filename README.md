# 📊 CARGOS_MORA - Informe Ejecutivo Interactivo

## ¿Qué es esto?

Sistema de análisis y reportería interactiva para el ciclo completo de **cargos académicos, pagos y mora** en Google Sheets + Apps Script.

- **Para:** Directores, Líderes técnicos, Auditores
- **Propósito:** Visualizar estado de todos los módulos, riesgos, soluciones, flujos E2E
- **Formato:** Web interactiva, sin logins, sin instalación, sin costo

---

## 🎯 ¿Qué puedes ver aquí?

### 1️⃣ **Vista Dirección** (Para no-técnicos)
- KPIs ejecutivos: módulos, riesgos, estado
- Gráfico de distribución de riesgos (Rojo/Amarillo/Verde)
- Diagrama visual del flujo E2E
- Recomendaciones en lenguaje claro

### 2️⃣ **Flujo Graficado** (El viaje de los datos)
- 5 etapas: Entrada → Ingesta → Procesamiento → Reportes → Cierre
- Qué pasa en cada etapa
- Qué módulos participan
- Qué riesgos hay en cada punto

### 3️⃣ **Soluciones y Plan** (Hoja de ruta de corrección)
- Módulos a reparar ordenados por prioridad
- Pasos concretos de corrección para cada uno
- Impacto de los cambios
- Dependencias (qué arreglar primero)
- Checklist post-corrección

### 4️⃣ **Resumen Técnico** (Para ingenieros)
- Análisis de cada script: líneas, funciones, dependencias
- Bloques de código por rango
- Llamadas internas y externas
- Trazabilidad completa

### 5️⃣ **Conflictos Detectados** (Red flags)
- Módulos en riesgo alto (Rojo)
- Módulos con complejidad excesiva
- Acoplamiento externo muy alto
- Duplicados y ambigüedades

### 6️⃣ **Detalle por Script** (Drill-down)
- Selecciona un script en la barra lateral
- Ve todas sus funciones, constantes, bloques
- ⚠️ **IMPACTO DE CAMBIOS:** qué otros scripts se rompen si editas esto
- Soluciones recomendadas
- Infografía del flujo interno

---

## 🚀 Cómo usar

### En línea (GitHub Pages - Recomendado)
```
https://tu-usuario.github.io/cargos-mora-informe
```
Solo abre en el navegador. Listo.

### Local (Para desarrollar)
```bash
cd proyecto\ practica/CARGOS_MORA/INFORME_WEB
python -m http.server 8000
# Abre http://localhost:8000/index.html
```

---

## 📁 Estructura de archivos

```
INFORME_WEB/
  ├── index.html           # Estructura HTML (tabs, sidebars, containers)
  ├── app.js               # Toda la lógica JavaScript (450+ líneas)
  ├── styles.css           # Estilos (colores, responsivos)
  ├── report_data.json     # Datos de todos los 30 scripts (486 KB)
  └── README.md            # Este archivo
```

---

## 🔄 ¿Cómo se genera report_data.json?

Este archivo contiene **análisis automático de TODOS los scripts** de Google Apps Script:
- Función, líneas, constantes
- Llamadas internas y externas
- Risegos identificados
- Controles sugeridos
- Semáforo (Rojo/Amarillo/Verde)

**Fuente:** Apps Script analizador (Google Sheet + clasp + análisis local)

Para regenerarlo:
```bash
# (Instrucciones técnicas - solo para administradores)
# Ver: INSTRUCCIONES_EJECUCION.txt
```

---

## 🎨 Características técnicas

✅ **Responsivo:** Funciona en desktop, tablet, mobile  
✅ **Sin dependencias:** Solo HTML/CSS/JS vanilla (sin frameworks)  
✅ **Mermaid.js:** Diagramas interactivos  
✅ **UTF-8:** Caracteres acentuados correctos (ñ, á, é, etc.)  
✅ **Velocidad:** Carga local, sin API calls  
✅ **Offline:** Funciona sin internet (excepto la primera carga)  

---

## 🔐 Seguridad

- ✅ No almacena datos sensibles en cliente
- ✅ No conecta a Google Sheets durante uso
- ✅ No hay logins, autenticación, tokens
- ✅ Datos de análisis son genéricos (no contienen información de estudiantes)
- ✅ Apto para compartir públicamente

---

## 📞 Preguntas frecuentes

**¿Necesito acceso a Google Sheets?**  
No. La web app ya tiene todos los datos pre-cargados en `report_data.json`.

**¿Puedo compartir esto con la Dirección?**  
Sí. Comparte la URL. No necesitan saber código.

**¿Se actualiza automáticamente?**  
No. Cada vez que cambies scripts en Apps Script, debes regenerar `report_data.json` (ver guía técnica).

**¿Qué navegadores soporta?**  
Chrome, Firefox, Safari, Edge (todos modernos desde 2020+).

**¿Puedo descargar los reportes?**  
Puedes copiar/pegar textos. Para PDF, usa Ctrl+P → Imprimir como PDF.

---

## 🛠 Desarrollo

### Stack
- Frontend: Vanilla JavaScript (ES6+)
- Visualización: Mermaid.js
- Datos: JSON local
- Estilos: CSS3 (Grid, Flexbox, variables)

### Modificar colores
En `styles.css`, busca `:root` para cambiar variables de color.

### Agregar nuevas vistas
En `app.js`, duplica una función `render*()` y crea una nueva pestaña en `index.html`.

---

## 📋 Metadata

- **Versión:** 1.0
- **Generado:** Abril 2026
- **Módulos analizados:** 30 scripts de Google Apps Script
- **Total de líneas:** ~15,000 líneas de código
- **Riesgo global:** 18 Rojo, 8 Amarillo, 4 Verde
- **Cobertura:** 100% de módulos documentados

---

## 📝 Licencia

Creado para **Institución Educativa Buen Pastor**. Uso interno y distribución permitida.

---

**¿Dudas?** Abre un issue en GitHub o contacta al equipo técnico.
