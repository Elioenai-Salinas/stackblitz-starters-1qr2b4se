# Flujo operativo de informes de resultados

Objetivo: cada iteracion deja evidencia visible en la web del informe para que otro modelo consuma el estado y proponga el siguiente bloque.

## Paso a paso

1. Agregar un nuevo objeto al arreglo de [result_reports.json](result_reports.json).
2. Basarse en la plantilla de [result_report_template.json](result_report_template.json).
3. Ejecutar build:
   - npm run build
4. Publicar:
   - git add index.html app.js styles.css result_reports.json result_report_template.json RESULTADOS_WORKFLOW.md dist
   - git commit -m "chore(informe): actualiza bloque de resultados iteracion X"
   - git push
5. Pedir al otro modelo que lea la pestaña y bloque "Informes de Resultados" para generar el siguiente bloque.

## Regla de calidad de cada bloque

- estado: completado | bloqueado | pendiente
- alcance: global o archivo exacto (ejemplo: 09_V3_Statements.gs.js)
- evidencia: minimo 2 items concretos
- siguientePaso: accion unica y verificable
