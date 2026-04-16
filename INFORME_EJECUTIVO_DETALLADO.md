# INFORME EJECUTIVO DETALLADO - CARGOS_MORA

Generado: 2026-04-16 17:29:53

## 1) Contexto
El ecosistema analizado corresponde a un conjunto de scripts de Google Apps Script orientados al ciclo completo de cargos por mora, recaudaci?n, conciliaci?n, exportaci?n y controles operativos. La evaluaci?n se centr? en estructura t?cnica, acoplamientos y se?ales de riesgo para asegurar continuidad operacional y gobernanza de cambios.

## 2) Flujo end-to-end (visi?n directiva)
1. **Activaci?n y configuraci?n**: inicializaci?n de par?metros, cat?logos y reglas base.
2. **Captura y procesamiento**: recepci?n de pagos, validaci?n y aplicaci?n de reglas de negocio.
3. **Cargos y ajustes**: c?lculo de mora, reversas y saneamiento de inconsistencias.
4. **Conciliaci?n y cierre**: cruce de operaciones, verificaci?n de saldos y consolidaci?n.
5. **Salida operativa**: generaci?n de reportes, exportaciones y consumo por portal/API.
6. **Orquestaci?n y QA**: ejecuci?n programada, pruebas de humo y soporte de recuperaci?n.

## 3) Roles de m?dulos (resumen)
- **00_V3_ActivacionMinima.gs.js**: Componente funcional de soporte al proceso CARGOS_MORA.
- **01_V3_Core.gs.js**: N?cleo de reglas y utilidades transversales.
- **02_V3_Schema.gs.js**: Definici?n de estructura de datos y validaciones.
- **03_V3_ConfigSetup.gs.js**: Configuraci?n, par?metros iniciales y entorno.
- **04_V3_Sync.gs.js**: Sincronizaci?n de datos y consistencia entre fuentes.
- **05_V3_Payments.gs.js**: Captura y procesamiento de pagos.
- **05A_V3_PaymentsForm.gs.js**: Captura y procesamiento de pagos.
- **06_V3_Applications.gs.js**: Gesti?n de solicitudes y estados operativos.
- **07_V3_Charges.gs.js**: C?lculo y registro de cargos.
- **08_V3_Reversals.gs.js**: Reversiones, anulaciones y correcciones financieras.
- **09_V3_Statements.gs.js**: Estados de cuenta y consolidaci?n de saldos.
- **10_V3_PortalExport.gs.js**: Integraci?n externa, exportaci?n y consumo por portal.
- **11_V3_RulesSeed.gs.js**: Administraci?n de reglas de negocio.
- **11A_V3_Task1_ReglasCobroReset.gs.js**: Administraci?n de reglas de negocio.
- **12_V3_ResetMensual.gs.js**: Mantenimiento, saneamiento y recuperaci?n.
- **12_V3_RulesFix.gs.js**: Administraci?n de reglas de negocio.
- **13_V3_ComprobantesCargados.gs.js**: Componente funcional de soporte al proceso CARGOS_MORA.
- **14_V3_FormularioPagosInterno.gs.js**: Captura y procesamiento de pagos.
- **15_V3_FormularioPagosV2.gs.js**: Captura y procesamiento de pagos.
- **16_V3_Automation.gs.js**: Orquestaci?n de flujos y automatizaci?n.
- **17_V3_PortalAPI.gs.js**: Integraci?n externa, exportaci?n y consumo por portal.
- **18_V3_Conciliacion.gs.js**: Conciliaci?n operativa y financiera.
- **19_V3_Fixes.gs.js**: Mantenimiento, saneamiento y recuperaci?n.
- **20_V3_QA_Smoke.gs.js**: Pruebas de humo y verificaci?n de operaci?n.
- **21_V3_StageFlow.gs.js**: Control de etapas y transici?n de procesos.
- **90_V3_Runners.gs.js**: Orquestaci?n de flujos y automatizaci?n.
- **91_V3_Orchestrators.gs.js**: Orquestaci?n de flujos y automatizaci?n.
- **98_Admin_Mantenimiento.gs.js**: Soporte administrativo y mantenimiento.
- **98_V3_GuardianRepair.gs.js**: Mantenimiento, saneamiento y recuperaci?n.
- **99_V3_OrquestadorContable.gs.js**: Componente funcional de soporte al proceso CARGOS_MORA.

## 4) Riesgos cr?ticos priorizados
- Acoplamiento entre m?dulos por llamadas cruzadas sin contratos formales.
- Concentraci?n de l?gica en scripts extensos, con mayor probabilidad de regresi?n.
- Dependencia operativa de componentes de orquestaci?n y mantenimiento para estabilizar el flujo.
- Exposici?n alta en 18 m?dulo(s) clasificados en sem?foro rojo.

## 5) Sem?foros por m?dulo
- **Rojo** (18): 01_V3_Core.gs.js, 02_V3_Schema.gs.js, 03_V3_ConfigSetup.gs.js, 04_V3_Sync.gs.js, 05_V3_Payments.gs.js, 05A_V3_PaymentsForm.gs.js, 06_V3_Applications.gs.js, 07_V3_Charges.gs.js, 08_V3_Reversals.gs.js, 09_V3_Statements.gs.js, 10_V3_PortalExport.gs.js, 12_V3_ResetMensual.gs.js, 15_V3_FormularioPagosV2.gs.js, 16_V3_Automation.gs.js, 17_V3_PortalAPI.gs.js, 19_V3_Fixes.gs.js, 21_V3_StageFlow.gs.js, 90_V3_Runners.gs.js
- **Amarillo** (8): 00_V3_ActivacionMinima.gs.js, 11_V3_RulesSeed.gs.js, 11A_V3_Task1_ReglasCobroReset.gs.js, 13_V3_ComprobantesCargados.gs.js, 14_V3_FormularioPagosInterno.gs.js, 18_V3_Conciliacion.gs.js, 20_V3_QA_Smoke.gs.js, 98_V3_GuardianRepair.gs.js
- **Verde** (4): 12_V3_RulesFix.gs.js, 91_V3_Orchestrators.gs.js, 98_Admin_Mantenimiento.gs.js, 99_V3_OrquestadorContable.gs.js

### M?dulos con mayor tama?o (top 8)
- 90_V3_Runners.gs.js: 1653 l?neas, 103 funciones, sem?foro Rojo.
- 06_V3_Applications.gs.js: 1429 l?neas, 47 funciones, sem?foro Rojo.
- 08_V3_Reversals.gs.js: 1318 l?neas, 54 funciones, sem?foro Rojo.
- 07_V3_Charges.gs.js: 1147 l?neas, 53 funciones, sem?foro Rojo.
- 12_V3_ResetMensual.gs.js: 1122 l?neas, 55 funciones, sem?foro Rojo.
- 09_V3_Statements.gs.js: 1121 l?neas, 36 funciones, sem?foro Rojo.
- 17_V3_PortalAPI.gs.js: 1039 l?neas, 34 funciones, sem?foro Rojo.
- 05_V3_Payments.gs.js: 1034 l?neas, 46 funciones, sem?foro Rojo.

### M?dulos con mayor densidad de llamadas (top 8)
- 90_V3_Runners.gs.js: 166 llamadas ?nicas, promedio 5.21 por funci?n.
- 15_V3_FormularioPagosV2.gs.js: 128 llamadas ?nicas, promedio 7.03 por funci?n.
- 12_V3_ResetMensual.gs.js: 111 llamadas ?nicas, promedio 4.33 por funci?n.
- 08_V3_Reversals.gs.js: 110 llamadas ?nicas, promedio 5.59 por funci?n.
- 05_V3_Payments.gs.js: 107 llamadas ?nicas, promedio 4.8 por funci?n.
- 21_V3_StageFlow.gs.js: 106 llamadas ?nicas, promedio 5.55 por funci?n.
- 07_V3_Charges.gs.js: 105 llamadas ?nicas, promedio 5.21 por funci?n.
- 06_V3_Applications.gs.js: 95 llamadas ?nicas, promedio 5.87 por funci?n.

## 6) Plan de verificaci?n recomendado
1. **Control de cambios**: establecer matriz impacto-m?dulo antes de cada despliegue.
2. **Pruebas funcionales**: cubrir casos nominales, excepciones y reprocesos contables.
3. **Pruebas de integraci?n**: validar flujos cr?ticos entre pagos, cargos, reversas y conciliaci?n.
4. **Pruebas de datos**: reconciliar totales por lote y trazabilidad de ajustes.
5. **Observabilidad**: habilitar m?tricas de ejecuci?n, errores y tiempos por m?dulo.
6. **Cierre operativo**: checklist de aprobaci?n con evidencia t?cnica y negocio.

## 7) Recomendaci?n para direcci?n
Priorizar estabilizaci?n en m?dulos rojos y amarillos, formalizar contratos de integraci?n y exigir evidencia de pruebas por etapa. Esto reduce riesgo operacional, protege la trazabilidad financiera y mejora la capacidad de auditor?a.
