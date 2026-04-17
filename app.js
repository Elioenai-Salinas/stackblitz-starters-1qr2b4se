mermaid.initialize({ startOnLoad: false, theme: 'default' });

  const state = {
    data: null,
    execMd: '',
    executionReports: [],
    scripts: [],
    selected: null,
    activeTab: 'direccion',
    filters: {
      search: '',
      status: 'all',
      severity: 'all',
      priority: 'all',
      type: 'all'
    },
    indexes: {
      functionToScripts: new Map(),
      upstream: new Map(),
      downstream: new Map()
    }
  };

  const ui = {
    totalScripts: document.getElementById('totalScripts'),
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    severityFilter: document.getElementById('severityFilter'),
    priorityFilter: document.getElementById('priorityFilter'),
    typeFilter: document.getElementById('typeFilter'),
    clearFilters: document.getElementById('clearFilters'),
    scriptList: document.getElementById('scriptList'),
    statsPanel: document.getElementById('statsPanel'),
    externalScriptsReview: document.getElementById('externalScriptsReview'),
    externalResultsReview: document.getElementById('externalResultsReview'),
    selectedBreadcrumb: document.getElementById('selectedBreadcrumb'),
    selectedTitle: document.getElementById('selectedTitle'),
    selectedMeta: document.getElementById('selectedMeta'),
    selectedHero: document.getElementById('selectedHero'),
    selectedRelations: document.getElementById('selectedRelations'),
    prevScriptBtn: document.getElementById('prevScriptBtn'),
    nextScriptBtn: document.getElementById('nextScriptBtn'),
    contextInforme: document.getElementById('contextInforme'),
    contextDireccion: document.getElementById('contextDireccion'),
    contextSoluciones: document.getElementById('contextSoluciones'),
    contextResumen: document.getElementById('contextResumen'),
    contextResultados: document.getElementById('contextResultados'),
    contextFlujo: document.getElementById('contextFlujo'),
    contextConflictos: document.getElementById('contextConflictos'),
    contextDetalle: document.getElementById('contextDetalle')
  };

  const FILE_OVERRIDES = {
    '08_V3_Reversals.gs.js': {
      status: 'requiere validacion',
      diagnosis: 'Motor temporal todavía requiere validación completa de recargos y alineación con mora.',
      recommendation: 'observar primero'
    },
    '09_V3_Statements.gs.js': {
      status: 'requiere validacion',
      diagnosis: 'Cuello principal del sistema: clasifica mal parte de los movimientos del período y degrada la cadena descendente.',
      recommendation: 'tocar ahora',
      maturity: 'en reparacion'
    },
    '10_V3_PortalExport.gs.js': {
      status: 'hereda error',
      diagnosis: 'No concentra la causa raíz; hereda degradación desde Statements y Detalle.',
      recommendation: 'no tocar todavia'
    },
    '18_V3_Conciliacion.gs.js': {
      status: 'requiere validacion',
      diagnosis: 'Puede quedar vacío por filtros estrictos y por herencia de datos inconsistentes aguas arriba.',
      recommendation: 'observar primero'
    },
    '90_V3_Runners.gs.js': {
      status: 'funciona',
      diagnosis: 'Coordina secuencias; se toca al final salvo que un runner rompa el flujo por sí mismo.',
      recommendation: 'no tocar todavia'
    },
    '99_V3_OrquestadorContable.gs.js': {
      status: 'funciona',
      diagnosis: 'Orquesta el cierre contable; la prioridad está en estabilizar las salidas que consume.',
      recommendation: 'no tocar todavia'
    }
  };

  const DEFAULT_EXECUTION_REPORTS = [
    {
      id: 'iter2-auth-clasp',
      fecha: '2026-04-17',
      titulo: 'Reautenticación de clasp en cuenta escolar',
      estado: 'completado',
      alcance: 'global',
      resumen: 'Se restableció el acceso OAuth de clasp y desapareció invalid_rapt en deployments.',
      evidencia: [
        'clasp deployments lista 21 deployments sin error invalid_rapt.',
        'Cuenta activa validada: cebuenpastorgoldenheaven@ministeriotsebaot.com.'
      ],
      siguientePaso: 'Usar esta sesión estable para validar ejecución real de funciones de febrero.'
    },
    {
      id: 'iter2-run-permission',
      fecha: '2026-04-17',
      titulo: 'Bloqueo en ejecución remota de funciones',
      estado: 'bloqueado',
      alcance: '09_V3_Statements.gs.js',
      resumen: 'clasp run sigue rechazando funciones por permisos de ejecución del script.',
      evidencia: [
        'run10_VerificarSchema retorna: Unable to run script function.',
        'run47_ChargesPreviewFebrero retorna el mismo bloqueo de permisos.'
      ],
      siguientePaso: 'Habilitar permiso de ejecución en Apps Script / GCP y repetir pruebas de febrero.'
    },
    {
      id: 'iter2-febrero-validation',
      fecha: '2026-04-17',
      titulo: 'Validación funcional de febrero (4 casos)',
      estado: 'pendiente',
      alcance: '09_V3_Statements.gs.js',
      resumen: 'Las validaciones en hojas reales siguen pendientes por bloqueo de ejecución.',
      evidencia: [
        'No evaluado: alumno sin pagos.',
        'No evaluado: con pagos aplicados, descuento familiar y excedente.'
      ],
      siguientePaso: 'Ejecutar runner de febrero y validar Resumen, Detalle, Portal y Export contable.'
    }
  ];

  const RESULT_REPORT_TEMPLATE = {
    id: 'iterX-bloque-name',
    fecha: 'YYYY-MM-DD',
    titulo: 'Titulo breve del bloque',
    estado: 'pendiente',
    alcance: '09_V3_Statements.gs.js',
    resumen: 'Resumen ejecutable del estado actual.',
    evidencia: [
      'Prueba 1: salida observada.',
      'Prueba 2: validacion en hoja o consola.'
    ],
    siguientePaso: 'Siguiente accion concreta para cerrar el bloque.'
  };

  const COTEJO_RECORDS = {
    '00_V3_ActivacionMinima.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 88,
      selloFinal: 'descripción parcialmente fiel',
      veredicto: 'Módulo de activación y wrappers operativos manuales; no es motor de cálculo financiero.',
      queHace: [
        'Valida dependencias mínimas para operar en modo manual.',
        'Inicializa configuración base sin forzar schema en la ruta mínima.',
        'Expone wrappers run* para sync, cargos, mora y pagos de forma controlada.',
        'Permite bootstrap de CARGOS_ESCOLARES con encabezados requeridos.'
      ],
      queNoHace: [
        'No recalcula estados de cuenta, conciliación ni exportación contable.',
        'No aplica recargos o mora por sí mismo: delega a Reversals.',
        'No ejecuta aplicación de pagos internamente: delega a Applications/Payments.',
        'No es orquestador global del flujo completo.'
      ],
      entradas: [
        'Constantes de hojas: ALUMNOS, PAGOS_REPORTADOS, CARGOS_ESCOLARES.',
        'Dependencias funcionales: v3ConfigSetupInicializarBase, v3SyncInicializarConfigBase, v3PaymentsInicializarConfigBase.',
        'Funciones de soporte: asegurarHoja, v3SyncAsegurarHeadersAlumnos_, v3ChargesAsegurarHeaders_.',
        'Parámetros explícitos en wrappers (ej. fecha fija para mora y límite para aplicar pendientes).'
      ],
      salidas: [
        'Retorna objetos de diagnóstico/activación y escribe logs con Logger.log.',
        'Puede crear/asegurar hojas ALUMNOS, PAGOS_REPORTADOS y CARGOS_ESCOLARES.',
        'Dispara ejecución de módulos dependientes mediante wrappers run*.',
        'No genera por sí mismo filas de conciliación ni exportación.'
      ],
      hojas: ['ALUMNOS', 'PAGOS_REPORTADOS', 'CARGOS_ESCOLARES'],
      reglasNegocio: ['cargos', 'pagos', 'recargos', 'mora'],
      funcionesCriticas: [
        'v3ActivacionMinima',
        'v3ActivacionMinimaConSchema',
        'v3BootstrapCrearCargosEscolares',
        'runPaymentsApplyPendientes',
        'runMoraAplicarHoy'
      ],
      dependeDe: [
        '01_V3_Core.gs.js',
        '03_V3_ConfigSetup.gs.js',
        '04_V3_Sync.gs.js',
        '05_V3_Payments.gs.js',
        '06_V3_Applications.gs.js',
        '07_V3_Charges.gs.js',
        '08_V3_Reversals.gs.js',
        '02_V3_Schema.gs.js'
      ],
      dependientes: ['90_V3_Runners.gs.js'],
      flujoCompartido: ['Activación base', 'Sync de alumnos', 'Preparación de cargos', 'Disparo de pagos/mora por wrappers'],
      conflictos: {
        confirmados: [
          'Tiene fechas y escenarios hardcoded en varios wrappers run* (acotado a operación manual).',
          'Concentra wrappers heterogéneos (sync/cargos/pagos/mora), mezclando responsabilidades de arranque y diagnóstico.'
        ],
        hipotesis: [
          'Si se usa como runner principal continuo, puede duplicar rutas ya cubiertas por 90/91.'
        ],
        pendientes: [
          'Validar en operación real que no existan corridas paralelas desde wrappers manuales y orquestadores.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Se trataba como módulo funcional de negocio general con impacto amplio.',
          scriptMuestra: 'Es módulo de activación mínima y wrappers de ejecución manual.',
          ajuste: 'Reclasificado como activación/soporte y no como motor de cálculo.'
        },
        {
          webDecia: 'Su función principal se describía como cálculo operativo.',
          scriptMuestra: 'Delega cálculo real a otros scripts y solo valida/dispara.',
          ajuste: 'Se agregó separación explícita entre delegación y responsabilidad propia.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en estructura; medio en uso operativo si se ejecuta fuera del flujo recomendado.'
    },
    '01_V3_Core.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 93,
      selloFinal: 'descripción fiel con observaciones de diseño',
      veredicto: 'Núcleo utilitario transversal del sistema V3; no hace negocio directo, pero condiciona seguridad y consistencia de todos los módulos.',
      queHace: [
        'Define catálogo de hojas y claves de configuración del sistema V3.',
        'Provee acceso seguro a Spreadsheet y operaciones no destructivas de CONFIG/AUDITORIA.',
        'Implementa guardrails de producción con override explícito por Script Properties.',
        'Entrega utilidades base (fecha, número, texto, IDs, auditoría) usadas por casi todo el ecosistema.'
      ],
      queNoHace: [
        'No calcula cargos, recargos, mora ni conciliación directamente.',
        'No ejecuta pipeline operativo mensual por sí mismo.',
        'No expone endpoints web ni lógica UI.',
        'No hace borrados masivos ni limpieza destructiva de hojas.'
      ],
      entradas: [
        'Spreadsheet activo del archivo actual.',
        'Valores de CONFIG y defaults en V3_CORE.DEFAULTS.',
        'Script Properties para override de producción (V3_OVERRIDE_PRODUCCION).',
        'Parámetros de funciones utilitarias (fechas, textos, números, payload de auditoría).'
      ],
      salidas: [
        'Escritura/upsert de claves en hoja CONFIG.',
        'Append de eventos en AUDITORIA_FINANCIERA.',
        'Creación de hojas faltantes vía asegurarHoja (incluye encabezados mínimos en CONFIG/AUDITORIA).',
        'Respuestas normalizadas para consumo de módulos dependientes.'
      ],
      hojas: ['CONFIG', 'AUDITORIA_FINANCIERA'],
      reglasNegocio: ['publicación', 'configuración base', 'guardrails de producción'],
      funcionesCriticas: [
        'asegurarHoja',
        'leerConfig',
        'escribirConfig',
        'exigirNoProduccionOOverride',
        'registrarAuditoria',
        'normalizarFecha',
        'convertirANumeroSeguro',
        'valorSeguroTexto'
      ],
      dependeDe: ['Apps Script services: SpreadsheetApp, PropertiesService, Utilities, Session'],
      dependientes: [
        '00_V3_ActivacionMinima.gs.js',
        '02_V3_Schema.gs.js',
        '03_V3_ConfigSetup.gs.js',
        '04_V3_Sync.gs.js',
        '05_V3_Payments.gs.js',
        '05A_V3_PaymentsForm.gs.js',
        '06_V3_Applications.gs.js',
        '07_V3_Charges.gs.js',
        '08_V3_Reversals.gs.js',
        '09_V3_Statements.gs.js',
        '10_V3_PortalExport.gs.js',
        '11A_V3_Task1_ReglasCobroReset.gs.js',
        '12_V3_ResetMensual.gs.js',
        '14_V3_FormularioPagosInterno.gs.js',
        '15_V3_FormularioPagosV2.gs.js',
        '16_V3_Automation.gs.js',
        '17_V3_PortalAPI.gs.js',
        '18_V3_Conciliacion.gs.js',
        '19_V3_Fixes.gs.js',
        '21_V3_StageFlow.gs.js',
        '90_V3_Runners.gs.js',
        '99_V3_OrquestadorContable.gs.js'
      ],
      flujoCompartido: ['Inicialización de hojas', 'lectura/escritura CONFIG', 'auditoría transversal', 'normalización de datos'],
      conflictos: {
        confirmados: [
          'Acoplamiento transversal alto: cualquier cambio rompe múltiples scripts dependientes.',
          'Helper interno _serializarDatosExtraSeguro_ se usa externamente, rompiendo encapsulamiento interno esperado.'
        ],
        hipotesis: [
          'Posibles condiciones de carrera en escribirConfig si hay ejecuciones concurrentes sin lock.'
        ],
        pendientes: [
          'Evaluar endurecimiento de locking y versionado de cambios en CONFIG para escenarios simultáneos.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Se describía como módulo núcleo con impacto funcional general (sin precisión de alcance).',
          scriptMuestra: 'Su alcance real es infraestructura utilitaria y seguridad operativa, no reglas de negocio de cobro.',
          ajuste: 'Se separó explícitamente “núcleo utilitario” de “motor de negocio”.'
        },
        {
          webDecia: 'Mostraba entradas/salidas amplias por inferencia de flujo.',
          scriptMuestra: 'Escribe directo sobre CONFIG y AUDITORIA_FINANCIERA; lo demás se declara como catálogo de hojas.',
          ajuste: 'Se ajustó la ficha para evitar atribuir escrituras no confirmadas por lectura de código.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo para responsabilidades directas; medio para concurrencia y acoplamiento transversal.'
    },
    '02_V3_Schema.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 92,
      selloFinal: 'descripción fiel con observaciones de alcance',
      veredicto: 'Módulo de definición/aseguramiento de estructura y validaciones no destructivas; no ejecuta lógica financiera de negocio.',
      queHace: [
        'Asegura estructura de hojas objetivo: crea faltantes, completa encabezados y congela cabecera.',
        'Aplica formatos y validaciones de datos por definición de esquema.',
        'Permite verificación de estructura sin mutar datos (modo check).',
        'Registra auditoría de éxito/error en cada ejecución de schema.'
      ],
      queNoHace: [
        'No calcula cargos, pagos, recargos o mora.',
        'No consolida estados de cuenta ni exporta portal/contabilidad.',
        'No limpia datos ni reescribe filas existentes de forma destructiva.',
        'No reemplaza la lógica de negocio de otros módulos.'
      ],
      entradas: [
        'Definiciones internas de headers/formats/validations por hoja.',
        'Dependencias de V3_Core: asegurarHoja, obtenerHojaPorNombre, valorSeguroTexto, generarId, registrarAuditoria.',
        'Rangos fuente para validaciones desde ALUMNOS y PARAMETROS.',
        'Lock de documento para serializar cambios de estructura.'
      ],
      salidas: [
        'Creación de pestañas faltantes en el libro V3.',
        'Inserción de columnas faltantes al final sin borrar las existentes.',
        'Aplicación de formato numérico/fecha y reglas de validación sobre columnas mapeadas.',
        'Eventos de auditoría con resumen de hojas procesadas y warnings.'
      ],
      hojas: [
        'REGLAS_COBRO',
        'APLICACION_PAGOS',
        'AUDITORIA_FINANCIERA',
        'ESTADO_CUENTA_DETALLE',
        'ESTADO_CUENTA_RESUMEN',
        'PORTAL_PADRES_EXPORT',
        'EXPORT_CONTABILIDAD',
        'FACTURAS_EMITIDAS',
        'COLA_ENVIO_FACTURAS',
        'ALUMNOS (fuente validaciones)',
        'PARAMETROS (fuente validaciones)'
      ],
      reglasNegocio: ['publicación', 'exportación', 'conciliación', 'reglas de catálogo y validación'],
      funcionesCriticas: [
        'v3SchemaAsegurarEstructura',
        'v3SchemaAsegurarValidaciones',
        'v3SchemaVerificarEstructura',
        'v3SchemaObtenerDefiniciones_',
        'v3SchemaAsegurarHojaConDefinicion_',
        'v3SchemaAplicarValidaciones_',
        'v3SchemaResolverRangoFuente_'
      ],
      dependeDe: [
        '01_V3_Core.gs.js',
        'LockService',
        'SpreadsheetApp'
      ],
      dependientes: [
        '00_V3_ActivacionMinima.gs.js',
        '12_V3_ResetMensual.gs.js',
        '20_V3_QA_Smoke.gs.js',
        '90_V3_Runners.gs.js'
      ],
      flujoCompartido: [
        'Inicialización estructural del workbook',
        'Control de cabeceras y reglas de validación',
        'Precondición de calidad para módulos de captura/procesamiento/salida'
      ],
      conflictos: {
        confirmados: [
          'Riesgo de aplicar validaciones sobre rangos extensos (performance) por default de 1500 filas o maxRows.',
          'Acoplamiento a nombres exactos de encabezados y hojas: cambios de naming rompen validaciones sin fallback semántico.',
          'Definición de esquema incluye dominios amplios (financiero y facturación), lo que aumenta sensibilidad a regresiones de estructura.'
        ],
        hipotesis: [
          'Si se ejecuta en mal momento operativo, podría introducir restricciones de captura no esperadas por usuarios de hoja.'
        ],
        pendientes: [
          'Confirmar en pruebas de operación si la aplicación repetida de validaciones impacta tiempos de ejecución en hojas grandes.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Módulo con impacto operativo amplio en continuidad.',
          scriptMuestra: 'Impacto real de infraestructura de esquema, no de cálculo financiero.',
          ajuste: 'Se aclaró que su responsabilidad es estructural y de calidad de datos.'
        },
        {
          webDecia: 'Conflictos tratados como lógica de negocio.',
          scriptMuestra: 'Los conflictos reales son de estructura, mapeo y acoplamiento a encabezados.',
          ajuste: 'Se reubicaron conflictos a su tipo técnico correcto (estructura/validación).'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en lectura del código; medio al estimar impacto de performance en hojas masivas.'
    },
    '03_V3_ConfigSetup.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 91,
      selloFinal: 'descripción fiel con observaciones de operación',
      veredicto: 'Módulo de carga base no destructiva de CONFIG, PARAMETROS y REGLAS_COBRO; define datos de arranque y placeholders controlados.',
      queHace: [
        'Inicializa base de CONFIG, PARAMETROS y REGLAS_COBRO con lock de documento.',
        'Realiza upsert no destructivo respetando valores existentes.',
        'Carga catálogos base y períodos iniciales en PARAMETROS.',
        'Detecta claves pendientes de configuración por placeholders y registra auditoría.'
      ],
      queNoHace: [
        'No ejecuta cálculo de cargos, pagos, recargos o estados.',
        'No aplica conciliación ni exportación final.',
        'No sustituye el proceso de schema; se apoya en estructuras ya definidas.',
        'No debería usarse como reemplazo de reglas de negocio runtime.'
      ],
      entradas: [
        'Constantes y defaults internos: V3_PARAMETROS_BASE, placeholders y versión.',
        'Hojas objetivo: CONFIG, PARAMETROS, REGLAS_COBRO.',
        'Dependencias de Core: asegurarHoja, leerConfig, registrarAuditoria, generarId, valorSeguroTexto.',
        'LockService para serializar inicialización.'
      ],
      salidas: [
        'Inserta/actualiza claves de CONFIG de forma no destructiva.',
        'Completa catálogos de PARAMETROS sin duplicar valores existentes.',
        'Asegura estructura y registros base en REGLAS_COBRO (esquema nuevo).',
        'Retorna resumen de cambios y pendientes de configuración.'
      ],
      hojas: ['CONFIG', 'PARAMETROS', 'REGLAS_COBRO'],
      reglasNegocio: ['configuración base', 'reglas de cobro', 'catálogos de pago/estado', 'modo de operación'],
      funcionesCriticas: [
        'v3ConfigSetupInicializarBase',
        'v3ConfigSetupCargarConfigBase_',
        'v3ConfigSetupCargarParametrosBase_',
        'v3ConfigSetupAsegurarReglasCobroNueva_',
        'v3ConfigSetupUpsertConfigNoDestructivo_',
        'v3ConfigSetupAppendUniqueValuesEnColumna_',
        'v3ConfigSetupListarPendientesConfig'
      ],
      dependeDe: ['01_V3_Core.gs.js', 'LockService'],
      dependientes: [
        '00_V3_ActivacionMinima.gs.js',
        '12_V3_ResetMensual.gs.js',
        '90_V3_Runners.gs.js'
      ],
      flujoCompartido: [
        'Preparación inicial de entorno',
        'Disponibilidad de catálogos para validaciones y lógica de negocio',
        'Control de pendientes antes de pasar a ejecución productiva'
      ],
      conflictos: {
        confirmados: [
          'Uso de placeholders controlados exige cierre manual previo a producción para evitar salidas incompletas.',
          'Alta sensibilidad a normalización de headers y claves en upsert no destructivo.',
          'Acoplamiento al catálogo base: cambios de términos pueden impactar módulos que consumen PARAMETROS/REGLAS_COBRO.'
        ],
        hipotesis: [
          'Ejecuciones repetidas concurrentes podrían producir presión operacional en hojas grandes, aunque existe lock.'
        ],
        pendientes: [
          'Validar en operación real qué placeholders permanecen abiertos antes de habilitar modo producción.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Se percibía como módulo de soporte general sin precisión del alcance.',
          scriptMuestra: 'Es inicializador de configuración y catálogos con reglas no destructivas específicas.',
          ajuste: 'Se detalló alcance exacto por hoja y por función crítica.'
        },
        {
          webDecia: 'Podía interpretarse como parte del flujo financiero principal.',
          scriptMuestra: 'Su papel es de preparación/semilla; no realiza cálculo financiero transaccional.',
          ajuste: 'Se separó explícitamente configuración base vs ejecución de negocio.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en estructura; medio en operación si placeholders no se cierran a tiempo.'
    },
    '04_V3_Sync.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 94,
      selloFinal: 'descripción fiel con observaciones de datos fuente',
      veredicto: 'Sincronizador no destructivo de ALUMNOS desde fuente externa: valida configuración, previsualiza cambios y aplica upsert por claves de matching.',
      queHace: [
        'Inicializa y valida claves CONFIG para conexión a base fuente (URL/ID/hoja).',
        'Previsualiza y ejecuta sincronización con modo dryRun y modo escritura.',
        'Asegura headers de ALUMNOS y normaliza mapeos desde encabezados de la fuente.',
        'Actualiza registros existentes o inserta nuevos sin borrar filas del destino.'
      ],
      queNoHace: [
        'No elimina alumnos existentes del destino.',
        'No calcula cargos, recargos ni conciliaciones financieras.',
        'No corrige calidad de la fuente más allá de validaciones mínimas de headers/datos requeridos.',
        'No sustituye la etapa de esquema global del libro (03/02).'
      ],
      entradas: [
        'CONFIG: SOURCE_SPREADSHEET_URL, SOURCE_SPREADSHEET_ID, SOURCE_SHEET_NAME y parámetros de ID.',
        'Hoja fuente externa con encabezados mínimos requeridos del estudiante.',
        'Hoja destino ALUMNOS en workbook actual.',
        'Dependencias Core: asegurarHoja, leerConfig, escribirConfig, registrarAuditoria, normalizarFecha, valorSeguroTexto.'
      ],
      salidas: [
        'Resumen detallado por ejecución: insertados, actualizados, sinCambios, omitidos, warnings.',
        'Escritura UPSERT en ALUMNOS con trazabilidad de acción por fila.',
        'Asignación de ID_Alumno secuencial o por código fuente según configuración.',
        'Registros de auditoría para check, dryrun y ejecución real.'
      ],
      hojas: ['CONFIG', 'ALUMNOS', 'fuente externa configurable'],
      reglasNegocio: ['sincronización de alumnos', 'matching por identidad', 'no destructivo', 'normalización de datos de inscripción'],
      funcionesCriticas: [
        'v3SyncVerificarConfiguracionFuente',
        'v3SyncPrevisualizarAlumnosDesdeFuente',
        'v3SyncAlumnosDesdeFuente',
        'v3SyncEjecutar_',
        'v3SyncConstruirRegistroAlumnoDesdeFuente_',
        'v3SyncBuscarFilaExistente_',
        'v3SyncFusionarFilaAlumno_'
      ],
      dependeDe: ['01_V3_Core.gs.js', 'LockService', 'SpreadsheetApp'],
      dependientes: [
        '00_V3_ActivacionMinima.gs.js',
        '12_V3_ResetMensual.gs.js',
        '20_V3_QA_Smoke.gs.js',
        '90_V3_Runners.gs.js'
      ],
      flujoCompartido: [
        'Preparación de configuración base',
        'Validación previa de conectividad y headers',
        'Sincronización incremental hacia ALUMNOS como precondición de módulos de cobro'
      ],
      conflictos: {
        confirmados: [
          'Dependencia fuerte de naming exacto de encabezados en fuente; cambios de formulario rompen mapeo.',
          'Si faltan URL/ID/hoja válidos, la ejecución falla por diseño para proteger integridad.',
          'Matching por documento/clave/código puede producir colisiones funcionales si la fuente trae duplicados semánticos.'
        ],
        hipotesis: [
          'En volúmenes altos, el patrón de updates por fila podría aumentar tiempo de ejecución de Apps Script.'
        ],
        pendientes: [
          'Verificar en operación real el comportamiento cuando fuente cambia encabezados o estructura sin aviso.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Sincronización simple de alumnos.',
          scriptMuestra: 'Incluye verificación de fuente, dryRun, matching jerárquico y fusión de campos con reglas por columna.',
          ajuste: 'Se elevó la precisión técnica del flujo end-to-end.'
        },
        {
          webDecia: 'Actualiza datos sin detallar criterio.',
          scriptMuestra: 'Aplica criterio explícito por codigoFuente, claveOrigen y documento; no borra destino.',
          ajuste: 'Se documentó algoritmo de matching y límites no destructivos.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en responsabilidad principal; medio ante cambios no controlados en la hoja fuente.'
    },
    '05_V3_Payments.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 95,
      selloFinal: 'descripción fiel con observaciones de integridad operativa',
      veredicto: 'Módulo de importación de pagos reportados desde hoja fuente/formulario hacia PAGOS_REPORTADOS, con deduplicación robusta y soporte multi-línea por comprobante.',
      queHace: [
        'Importa pagos en modo previsualización (dryRun) o escritura real.',
        'Descompone cada fila fuente en múltiples líneas de pago (concepto/período/monto 1..4).',
        'Enriquece alumno y responsable desde ALUMNOS por ID, documento o nombre normalizado.',
        'Aplica deduplicación por hash, sourceKey, hashLinea, lineaPagoId y logicalKey antes de insertar.'
      ],
      queNoHace: [
        'No recalcula estado de cuenta ni aplica cargos contra saldos en este módulo.',
        'No reordena ni corrige automáticamente encabezados de PAGOS_REPORTADOS (solo valida).',
        'No borra registros existentes durante importación estándar.',
        'No sustituye el flujo de conciliación/aplicación posterior.'
      ],
      entradas: [
        'CONFIG PAYMENTS_*: origen, hoja fuente, estado por defecto y mapeos de encabezados opcionales.',
        'Fuente de respuestas de formulario o spreadsheet configurado.',
        'Hojas internas ALUMNOS y PAGOS_REPORTADOS.',
        'Dependencias Core: asegurarHoja, obtenerHojaPorNombre, leerConfig, escribirConfig, normalizarFecha, generarId, valorSeguroTexto.'
      ],
      salidas: [
        'Nuevas filas en PAGOS_REPORTADOS con trazabilidad de fuente y usuario de importación.',
        'Resumen técnico de ejecución: leídos, líneas detectadas, importados, duplicados y omitidos.',
        'Hashes y claves de control para evitar reimportaciones duplicadas.',
        'Utilitarios para reconstrucción controlada de la hoja base de PAGOS_REPORTADOS.'
      ],
      hojas: ['PAGOS_REPORTADOS', 'ALUMNOS', 'RESPUESTAS_FORM_PAGOS_V2 (o fuente configurada)'],
      reglasNegocio: ['importación de pagos', 'deduplicación', 'normalización de conceptos/períodos', 'trazabilidad de comprobantes'],
      funcionesCriticas: [
        'v3PaymentsImportarDesdeFormulario_',
        'v3PaymentsConstruirLineasPagoDesdeFila_',
        'v3PaymentsConstruirIndicesPagosExistentes_',
        'v3PaymentsEvaluarDuplicidad_',
        'v3PaymentsConstruirIndicesAlumnos_',
        'v3PaymentsValidarEstructuraDestino_',
        'v3PaymentsReconstruirPagosReportadosDesdeCero'
      ],
      dependeDe: ['01_V3_Core.gs.js', 'SpreadsheetApp', 'Utilities', 'Session', 'PropertiesService'],
      dependientes: [
        '00_V3_ActivacionMinima.gs.js',
        '05A_V3_PaymentsForm.gs.js',
        '12_V3_ResetMensual.gs.js',
        '14_V3_FormularioPagosInterno.gs.js',
        '21_V3_StageFlow.gs.js',
        '90_V3_Runners.gs.js'
      ],
      flujoCompartido: [
        'Captura de formulario a staging operativo',
        'Control de duplicados antes de aplicación de pagos',
        'Precondición para conciliación y procesos financieros posteriores'
      ],
      conflictos: {
        confirmados: [
          'Validación estricta de estructura de PAGOS_REPORTADOS: cualquier desalineación de encabezados detiene la importación.',
          'Riesgo de calidad de datos cuando faltan campos mínimos (ID/referencia/concepto), causando omisiones por diseño.',
          'Dependencia de normalización y aliases de encabezados en fuente; cambios de formulario pueden reducir líneas detectadas.'
        ],
        hipotesis: [
          'En importaciones masivas, la construcción de índices y hashing podría elevar tiempos de ejecución en Apps Script.'
        ],
        pendientes: [
          'Confirmar en operación real la frecuencia de casos DUP_LOGICAL vs DUP_HASH para ajuste fino de deduplicación.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Importación directa de pagos desde formulario.',
          scriptMuestra: 'Implementa pipeline más complejo: multi-línea, enriquecimiento ALUMNOS y dedupe en varias capas.',
          ajuste: 'Se documentó el pipeline técnico completo para evitar simplificaciones.'
        },
        {
          webDecia: 'Asumía operación flexible ante cualquier estructura de hoja.',
          scriptMuestra: 'Exige estructura exacta de PAGOS_REPORTADOS y falla si no coincide.',
          ajuste: 'Se marcó explícitamente la restricción estructural como riesgo operativo.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en lógica principal; medio en comportamiento bajo variaciones de estructura y volumen de fuente.'
    },
    '05A_V3_PaymentsForm.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 93,
      selloFinal: 'descripción fiel con observaciones de integración',
      veredicto: 'Constructor de Google Form interno para pagos: crea formulario, vincula hoja de respuestas, guarda configuración PAYMENTS_* y asegura trigger de onFormSubmit.',
      queHace: [
        'Crea formulario interno con preguntas principales y detalle 1..4 por comprobante.',
        'Conecta el formulario al spreadsheet activo y detecta/renombra hoja de respuestas.',
        'Escribe claves CONFIG para que 05_V3_Payments consuma la fuente.',
        'Verifica o instala trigger v3PaymentsOnFormSubmit cuando existe handler.'
      ],
      queNoHace: [
        'No importa pagos a PAGOS_REPORTADOS por sí mismo.',
        'No ejecuta deduplicación ni conciliación financiera.',
        'No procesa respuestas del formulario en tiempo real si falta v3PaymentsOnFormSubmit.',
        'No reemplaza el módulo de importación 05_V3_Payments.'
      ],
      entradas: [
        'Spreadsheet activo del proyecto V3.',
        'Servicios FormApp, ScriptApp y SpreadsheetApp.',
        'Funciones de config compartidas: leerConfig/escribirConfig o fallback interno sobre hoja CONFIG.',
        'Opcional: exigirNoProduccionOOverride y v3PaymentsInicializarConfigBase(_).' 
      ],
      salidas: [
        'Google Form creado o validado (si ya existía).',
        'Hoja de respuestas vinculada y congelada en fila 1.',
        'CONFIG PAYMENTS_SOURCE_* y PAYMENTS_FORM_ID actualizadas.',
        'Estado de trigger para v3PaymentsOnFormSubmit.'
      ],
      hojas: ['CONFIG', 'RESPUESTAS_FORM_PAGOS*', 'Spreadsheet activo del proyecto'],
      reglasNegocio: ['provisionamiento de captura', 'gobernanza de formulario interno', 'trazabilidad de fuente de pagos'],
      funcionesCriticas: [
        'v3PaymentsFormCrearInterno',
        'v3PaymentsFormVerificarInterno',
        'v3PaymentsFormGuardarConfig_',
        'v3PaymentsFormAsegurarTrigger_',
        'v3PaymentsFormConstruirPreguntas_',
        'v3PaymentsFormDetectarHojaRespuestas_'
      ],
      dependeDe: ['05_V3_Payments.gs.js', 'FormApp', 'SpreadsheetApp', 'ScriptApp'],
      dependientes: [
        'Operación manual de administración (creación/verificación de formulario)',
        '05_V3_Payments.gs.js (consumo de fuente configurada)'
      ],
      flujoCompartido: [
        'Provisionar canal de captura de pagos',
        'Persistir configuración para importador de pagos',
        'Asegurar automatización posterior por trigger cuando aplique'
      ],
      conflictos: {
        confirmados: [
          'Acoplamiento con claves de config legacy/mixtas: mapea algunos headers que el 05 no consume igual (riesgo de desalineación parcial).',
          'Si no existe v3PaymentsOnFormSubmit, el trigger queda en estado informativo y no automatiza procesamiento.',
          'Crear formulario en entorno incorrecto puede dejar fuente apuntando al spreadsheet equivocado.'
        ],
        hipotesis: [
          'Cambios futuros en estructura del formulario podrían requerir ajuste sincronizado en aliases del módulo 05 para evitar pérdida de campos.'
        ],
        pendientes: [
          'Confirmar en pruebas integradas que todos los campos de detalle 1..4 quedan alineados con el parser vigente del 05.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Módulo de apoyo para formulario.',
          scriptMuestra: 'Además de crear formulario, persiste config operativa y gestiona trigger de procesamiento.',
          ajuste: 'Se amplió el alcance documentado a provisioning + integración.'
        },
        {
          webDecia: 'Parecía equivalente al importador de pagos.',
          scriptMuestra: 'No importa ni deduplica pagos; solo prepara canal de captura y configuración.',
          ajuste: 'Se separó explícitamente su rol respecto al Script 05.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en propósito; medio en integración por diferencias de mapeo entre constructor y parser de importación.'
    },
    '06_V3_Applications.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 95,
      selloFinal: 'descripción fiel con observaciones de alcance funcional',
      veredicto: 'Motor de aplicación de pagos sobre cargos: procesa líneas reportadas, distribuye monto en CARGOS_ESCOLARES, registra APLICACION_PAGOS y actualiza estado en PAGOS_REPORTADOS.',
      queHace: [
        'Aplica un pago individual por Pago_Reportado_ID en modo dryRun o escritura.',
        'Procesa lotes de pagos pendientes y corrige aplicaciones erradas sin borrar historial (reversa filas y reprocesa).',
        'Distribuye monto entre base y recargo, incluyendo reversión de recargo cuando pago cae dentro de ventana permitida.',
        'Actualiza estado de cargos y observaciones del pago tras la aplicación.'
      ],
      queNoHace: [
        'No procesa conceptos no recurrentes fuera de MATRICULA, MENSUALIDAD y PLATAFORMA.',
        'No genera cargos nuevos; solo aplica sobre cargos existentes compatibles.',
        'No elimina filas de aplicación: usa estados REVERSADO/ANULADO/ERROR para control de ciclo de vida.',
        'No reemplaza fases de importación ni consolidación posterior.'
      ],
      entradas: [
        'PAGOS_REPORTADOS con Pago_Reportado_ID y metadatos de línea reportada.',
        'CARGOS_ESCOLARES con estado, saldos y referencias de cargo.',
        'APLICACION_PAGOS para historial y créditos acumulados por cargo.',
        'ALUMNOS y REGLAS_COBRO para resolución de alumno y días de gracia/reversión de recargo.'
      ],
      salidas: [
        'Filas nuevas en APLICACION_PAGOS con estado APLICADO/PARCIAL/PENDIENTE.',
        'Actualización de Estado_Cargo, Saldo_Pendiente y observaciones en CARGOS_ESCOLARES.',
        'Actualización de Estado_Revision y observaciones en PAGOS_REPORTADOS.',
        'Resumen de procesamiento con montos aplicados, excedentes y recargos revertidos.'
      ],
      hojas: ['APLICACION_PAGOS', 'PAGOS_REPORTADOS', 'CARGOS_ESCOLARES', 'ALUMNOS', 'REGLAS_COBRO'],
      reglasNegocio: ['aplicación de pagos', 'priorización por concepto/período', 'reversión de recargo con gracia', 'corrección de pendientes erradas'],
      funcionesCriticas: [
        'v3ApplicationsProcesarPagoReportado_',
        'v3ApplicationsConstruirPlanAplicacion_',
        'v3ApplicationsDistribuirMontoEnCargo_',
        'v3ApplicationsConstruirCargosAlumno_',
        'v3ApplicationsProcesarPagosPendientes_',
        'v3ApplicationsProcesarCorreccionAplicacionesErradas_',
        'v3ApplicationsConstruirActualizacionesEstadoCargo_'
      ],
      dependeDe: ['01_V3_Core.gs.js', 'LockService', 'SpreadsheetApp', 'Session', 'Utilities'],
      dependientes: [
        '00_V3_ActivacionMinima.gs.js',
        '12_V3_ResetMensual.gs.js',
        '21_V3_StageFlow.gs.js',
        '90_V3_Runners.gs.js',
        '99_V3_OrquestadorContable.gs.js'
      ],
      flujoCompartido: [
        'Aplicación operativa de pagos importados',
        'Corrección de registros pendientes mal clasificados',
        'Base para consolidación de detalle/resumen financiero'
      ],
      conflictos: {
        confirmados: [
          'El filtro de conceptos recurrentes puede dejar pagos válidos fuera del flujo automático si el concepto no coincide con catálogo esperado.',
          'Dependencia de estructura y headers en hojas críticas; faltantes o desviaciones detienen procesamiento.',
          'La lógica de reversión de recargo depende de fechas y días de gracia; inconsistencias de datos afectan resultado aplicado.'
        ],
        hipotesis: [
          'En lotes grandes, la lectura/reproceso frecuente de hojas puede impactar tiempos de ejecución de Apps Script.'
        ],
        pendientes: [
          'Validar con casos reales la frontera de aplicación cuando concepto/período reportado no coincide exactamente con cargos abiertos.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Aplicaba pagos de forma lineal simple.',
          scriptMuestra: 'Incluye planificación por prioridad, créditos acumulados, reversión de recargo y manejo de excedentes en filas pendientes.',
          ajuste: 'Se documentó el motor de aplicación completo y sus estados operativos.'
        },
        {
          webDecia: 'Corrección de erradas era una reescritura directa.',
          scriptMuestra: 'No borra historial; marca filas previas como REVERSADO y reprocesa el pago.',
          ajuste: 'Se aclaró enfoque no destructivo de corrección.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en lógica base; medio por sensibilidad a calidad de datos y normalización de conceptos/períodos.'
    },
    '07_V3_Charges.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 95,
      selloFinal: 'descripción fiel con observaciones de operación por modo',
      veredicto: 'Generador de cargos escolares por período o año lectivo con guardrails de modo operativo/reconstrucción histórica y descuento familiar no destructivo.',
      queHace: [
        'Genera o previsualiza cargos por período y por año lectivo completo.',
        'Evita duplicados por clave base y por Cargo_ID antes de escritura.',
        'Aplica descuentos familiares únicamente en mensualidad bajo criterio MENOR_GRADO_UNICO.',
        'Valida guardrails de período objetivo y bloquea reapertura de mes consolidado en modo operativo.'
      ],
      queNoHace: [
        'No aplica pagos ni conciliación financiera.',
        'No calcula recargos de mora en esta etapa (recargo inicial en 0).',
        'No modifica encabezados críticos fuera de asegurar presencia mínima no destructiva.',
        'No procesa alumnos inactivos/retirados para generación regular.'
      ],
      entradas: [
        'ALUMNOS para universo activo y metadata familiar.',
        'REGLAS_COBRO para reglas de generación, vencimiento y descuento.',
        'CARGOS_ESCOLARES como destino y fuente de deduplicación existente.',
        'CONTROL_EJECUCION para guardrail de no reapertura en modo operativo.'
      ],
      salidas: [
        'Nuevas filas en CARGOS_ESCOLARES con Total_Cargo, Saldo_Pendiente y Estado_Cargo inicial.',
        'Resumen por corrida con reglas aplicables, duplicados omitidos y descuentos aplicados.',
        'Auditoría de ejecución dryRun/escritura por período o año lectivo.',
        'Ordenamiento y formato operativo de hoja de cargos tras escritura.'
      ],
      hojas: ['ALUMNOS', 'REGLAS_COBRO', 'CARGOS_ESCOLARES', 'CONTROL_EJECUCION'],
      reglasNegocio: ['generación de cargos', 'descuento familiar', 'guardrail de período', 'modo operativo vs reconstrucción histórica'],
      funcionesCriticas: [
        'v3ChargesProcesarPeriodo_',
        'v3ChargesProcesarAnoLectivo_',
        'v3ChargesCargarAlumnos_',
        'v3ChargesCargarReglas_',
        'v3ChargesCalcularDescuentoRegla_',
        'v3ChargesValidarNoReabrirMesConsolidado_',
        'v3ChargesLeerIndexCargosExistentes_'
      ],
      dependeDe: ['01_V3_Core.gs.js', 'SpreadsheetApp', 'Utilities', 'Session'],
      dependientes: [
        '12_V3_ResetMensual.gs.js',
        '16_V3_Automation.gs.js',
        '21_V3_StageFlow.gs.js',
        '90_V3_Runners.gs.js',
        '99_V3_OrquestadorContable.gs.js'
      ],
      flujoCompartido: [
        'Etapa de generación de cargos previa a aplicación de pagos',
        'Reconstrucción histórica por año lectivo cuando se requiere reparación',
        'Precondición para consolidación financiera y exportaciones'
      ],
      conflictos: {
        confirmados: [
          'Modo operativo bloquea mes ya consolidado: evita reapertura accidental, pero requiere bypass explícito para reproceso legítimo.',
          'Dependencia alta de calidad de REGLAS_COBRO (monto, meses, vencimiento) para generar cargos válidos.',
          'Mapeo de familia y descuento depende de datos de madre/apellidos; datos incompletos reducen aplicación de descuento esperado.'
        ],
        hipotesis: [
          'En datasets grandes, ordenamiento post-escritura por múltiples columnas puede impactar tiempo de ejecución.'
        ],
        pendientes: [
          'Validar en datos vivos la cobertura de familias detectadas vs casos reales para confirmar regla MENOR_GRADO_UNICO sin falsos negativos.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Generador de cargos básico por período.',
          scriptMuestra: 'Incluye modo anual histórico, guardrails de reapertura y validaciones pre/post escritura por período objetivo.',
          ajuste: 'Se amplió el alcance al comportamiento multi-modo y sus bloqueos operativos.'
        },
        {
          webDecia: 'Descuento familiar implícito general.',
          scriptMuestra: 'Descuento restringido a mensualidad, con criterio explícito y fallback no destructivo si faltan columnas.',
          ajuste: 'Se delimitó con precisión cuándo y cómo aplica descuento.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en algoritmo principal; medio en operación por sensibilidad a calidad de reglas y datos familiares.'
    },
    '08_V3_Reversals.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 95,
      selloFinal: 'descripción fiel con observaciones de política operativa',
      veredicto: 'Módulo de mora y regularización: aplica recargo financiero por vencimiento/gracia y revierte recargo cuando el pago real cae dentro de plazo permitido.',
      queHace: [
        'Previsualiza y aplica mora sobre cargos financieros (mensualidad/plataforma).',
        'Calcula fechas operativas: vencimiento real, límite sin recargo e inicio de mora por regla.',
        'Regulariza pagos individuales o masivos para revertir recargos aplicados indebidamente por fecha real del comprobante.',
        'Actualiza recargo IN-PLACE en CARGOS_ESCOLARES y sincroniza observaciones/estado en APLICACION_PAGOS y PAGOS_REPORTADOS.'
      ],
      queNoHace: [
        'No crea nuevas filas RECARGO_MORA separadas (ruta deprecada).',
        'No aplica pagos base a cargos; eso corresponde al Script 06.',
        'No consolida estados de cuenta ni exportaciones de portal/contabilidad.',
        'No aplica recargo a conceptos no financieros fuera de mensualidad/plataforma.'
      ],
      entradas: [
        'CARGOS_ESCOLARES con montos, vencimientos, estado y saldo pendiente.',
        'REGLAS_COBRO para política de recargo, gracia y vencimiento.',
        'APLICACION_PAGOS para trazabilidad de recargo generado/revertido.',
        'PAGOS_REPORTADOS para fecha real de pago y estado de revisión.'
      ],
      salidas: [
        'Ajustes de Recargo/Total_Cargo/Saldo_Pendiente en la fila base del cargo.',
        'Actualización de Monto_Recargo_Revertido, Motivo_Reversion y observaciones en aplicaciones.',
        'Marcadores de regularización en observaciones de pagos reportados.',
        'Auditoría detallada por corrida (mora y regularización, individual o masiva).'
      ],
      hojas: ['CARGOS_ESCOLARES', 'APLICACION_PAGOS', 'REGLAS_COBRO', 'PAGOS_REPORTADOS'],
      reglasNegocio: ['mora con gracia mínima', 'recargo financiero', 'reversión por pago a tiempo', 'regularización post-aplicación'],
      funcionesCriticas: [
        'v3ReversalsProcesarMora_',
        'v3ReversalsProcesarRegularizacionPagoCore_',
        'v3ReversalsProcesarRegularizacionMasiva_',
        'v3ReversalsResolverPoliticaRecargoOperativa_',
        'v3ReversalsCalcularRecargo_',
        'v3ReversalsActualizarRecargoEnFila_',
        'v3ReversalsObtenerFechaInicioMora_'
      ],
      dependeDe: ['01_V3_Core.gs.js', 'LockService', 'SpreadsheetApp', 'Utilities', 'Session'],
      dependientes: [
        '00_V3_ActivacionMinima.gs.js',
        '90_V3_Runners.gs.js',
        '99_V3_OrquestadorContable.gs.js'
      ],
      flujoCompartido: [
        'Etapa de recargos/vencimientos dentro del flujo financiero',
        'Regularización de recargos luego de aplicar pagos',
        'Base para estados de mora y consistencia contable aguas abajo'
      ],
      conflictos: {
        confirmados: [
          'Política operativa fuerza gracia mínima de 5 días y recargo por defecto (10%) cuando aplica fallback; puede diferir de configuración esperada si reglas están incompletas.',
          'Alta dependencia de fechas reales en PAGOS_REPORTADOS y consistencia de referencias de cargo en APLICACION_PAGOS.',
          'La migración a recargo IN-PLACE exige vigilancia de observaciones históricas para evitar lecturas ambiguas de legado RECARGO_MORA.'
        ],
        hipotesis: [
          'En regularización masiva, reconstruir contexto por cada cambio puede elevar tiempo en libros con alto volumen.'
        ],
        pendientes: [
          'Verificar en operación real la convergencia de saldo y estado tras múltiples ciclos de aplicar mora y regularizar en el mismo período.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Mora y reversos como ajuste simple de recargo.',
          scriptMuestra: 'Implementa calendario operativo completo (vencimiento, gracia, inicio mora) y regularización por fecha real de pago.',
          ajuste: 'Se documentó el motor temporal y de política, no solo ajuste numérico.'
        },
        {
          webDecia: 'Recargo en filas separadas tipo RECARGO_MORA.',
          scriptMuestra: 'Ruta vigente actualiza recargo en la fila base del cargo; fila separada quedó deprecada.',
          ajuste: 'Se corrigió representación del modelo de datos actual.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en diseño principal; medio por sensibilidad a fechas y fallback operativo de recargo/gracia.'
    },
    '09_V3_Statements.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 96,
      selloFinal: 'descripción fiel con observaciones de clasificación temporal',
      veredicto: 'Constructor no destructivo de estado de cuenta (detalle y resumen) por alumno/período, con normalización robusta de período, sincronización por scope y reglas de morosidad.',
      queHace: [
        'Construye ESTADO_CUENTA_DETALLE y ESTADO_CUENTA_RESUMEN en una corrida unificada o por módulos separados.',
        'Integra movimientos desde CARGOS_ESCOLARES y APLICACION_PAGOS (cargo base, recargo, pago aplicado, reverso de recargo y excedente).',
        'Normaliza múltiples formatos de período y preserva trazabilidad mediante scopeKey para upsert no destructivo.',
        'Calcula estado de morosidad y estado de cuenta final por alumno (AL_DIA, MOROSO, VENCIDA, PARCIAL, PENDIENTE).'
      ],
      queNoHace: [
        'No genera cargos ni aplica pagos sobre cargos (consume resultados de scripts previos).',
        'No calcula ni aplica recargo de mora directamente (consume recargos ya presentes).',
        'No publica al portal por sí mismo.',
        'No limpia hojas de forma destructiva; desactiva filas fuera de scope con estado INACTIVO.'
      ],
      entradas: [
        'ALUMNOS para identidad, grado y datos de responsable.',
        'CARGOS_ESCOLARES para cargos/recargos/saldos y vencimientos.',
        'APLICACION_PAGOS para abonos, excedentes y reversos de recargo.',
        'Parámetros opcionales de filtro: periodo e ID_Alumno.'
      ],
      salidas: [
        'Upsert no destructivo en ESTADO_CUENTA_DETALLE (movimientos con saldo acumulado).',
        'Upsert no destructivo en ESTADO_CUENTA_RESUMEN (saldos, mora, estado de cuenta, última fecha de pago).',
        'Desactivación de filas huérfanas del scope con estado INACTIVO y touch date.',
        'Auditoría de ejecución OK/ERROR por detalle, resumen o corrida combinada.'
      ],
      hojas: ['ALUMNOS', 'CARGOS_ESCOLARES', 'APLICACION_PAGOS', 'ESTADO_CUENTA_DETALLE', 'ESTADO_CUENTA_RESUMEN'],
      reglasNegocio: ['consolidación de estado de cuenta', 'morosidad por antigüedad y vencimientos', 'clasificación de movimientos', 'upsert no destructivo por scope'],
      funcionesCriticas: [
        'v3StatementsConstruirEstadosCuenta',
        'v3StatementsConstruirEstadoCuentaDetalle_',
        'v3StatementsConstruirEstadoCuentaResumen_',
        'v3StatementsConstruirContexto_',
        'v3StatementsEvaluarMora_',
        'v3StatementsUpsertScopeRows_',
        'v3StatementsResolverEstadoCuenta_'
      ],
      dependeDe: ['01_V3_Core.gs.js', 'LockService', 'SpreadsheetApp', 'Utilities', 'Session'],
      dependientes: [
        '10_V3_PortalExport.gs.js',
        '12_V3_ResetMensual.gs.js',
        '19_V3_Fixes.gs.js',
        '21_V3_StageFlow.gs.js',
        '90_V3_Runners.gs.js',
        '99_V3_OrquestadorContable.gs.js'
      ],
      flujoCompartido: [
        'Consolidación financiera posterior a cargos/aplicaciones',
        'Base de consumo para portal export y conciliación',
        'Rebuild por período en rutas de repair y runners operativos'
      ],
      conflictos: {
        confirmados: [
          'La clasificación de período depende de metadata heterogénea; cuando falta Periodo_Aplicado/Periodo_Cargo recurre a fallback por fecha o período de corrida.',
          'La regla de morosidad combina umbral 60+1 días, recargo impago y meses vencidos; cualquier inconsistencia en vencimientos impacta estado final.',
          'Orden de movimientos por período y rank evita saldos negativos artificiales, pero requiere consistencia de periodo en origen.'
        ],
        hipotesis: [
          'En libros grandes, el upsert por comparación fila-a-fila y refresco de rangos puede elevar tiempos de reconstrucción masiva.'
        ],
        pendientes: [
          'Validar en datos vivos casos frontera de movimientos sin período explícito para confirmar que no caigan indebidamente en SALDO_INICIAL.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Era solo un resumen consolidado simple.',
          scriptMuestra: 'Implementa doble capa (detalle y resumen), con reconstrucción de ledger por movimiento y balance acumulado por scope.',
          ajuste: 'Se corrigió el alcance a motor de consolidación no destructivo, no solo “resumen final”.'
        },
        {
          webDecia: 'Morosidad provenía únicamente de recargo.',
          scriptMuestra: 'Morosidad se determina por múltiples señales: 60+1 días, recargo impago y meses vencidos impagos.',
          ajuste: 'Se documentó la lógica real de clasificación de mora.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en estructura y fórmulas; medio por sensibilidad a calidad de período/fechas en insumos.'
    },
    '10_V3_PortalExport.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 95,
      selloFinal: 'descripción fiel con observaciones de dependencia aguas arriba',
      veredicto: 'Exportador de capas derivadas: genera PORTAL_PADRES_EXPORT y EXPORT_CONTABILIDAD desde ESTADO_CUENTA_RESUMEN/DETALLE con sincronización no destructiva por scope.',
      queHace: [
        'Inicializa configuración base de exportación sin sobrescribir claves existentes.',
        'Genera export para portal de padres usando resumen financiero y hash de control por alumno.',
        'Genera export contable a nivel movimiento mapeando tipo a monto y cuenta contable configurable.',
        'Sincroniza filas por scope (periodo|alumno) con upsert y desactivación de registros huérfanos.'
      ],
      queNoHace: [
        'No calcula estados de cuenta por lógica propia: depende de 09 para construir detalle/resumen.',
        'No aplica pagos, mora ni recargos directamente.',
        'No limpia hojas de forma destructiva ni reescribe encabezados existentes.',
        'No resuelve inconsistencias de origen; solo refleja la calidad de datos consolidada aguas arriba.'
      ],
      entradas: [
        'ESTADO_CUENTA_RESUMEN para export portal.',
        'ESTADO_CUENTA_DETALLE para export contabilidad.',
        'CARGOS_ESCOLARES para detectar último período pendiente por alumno.',
        'CONFIG para defaults de estado, centro de costo y cuentas contables.'
      ],
      salidas: [
        'PORTAL_PADRES_EXPORT con saldo, mora, período pendiente, hash y estado de exportación.',
        'EXPORT_CONTABILIDAD con movimientos monetarios normalizados y cuenta contable resuelta.',
        'Actualización/desactivación de filas por prefijo de scope en ambas hojas de salida.',
        'Auditoría de ejecución para config, portal, contabilidad y corrida combinada.'
      ],
      hojas: ['ESTADO_CUENTA_RESUMEN', 'ESTADO_CUENTA_DETALLE', 'CARGOS_ESCOLARES', 'CONFIG', 'PORTAL_PADRES_EXPORT', 'EXPORT_CONTABILIDAD'],
      reglasNegocio: ['publicación de saldos al portal', 'export contable por movimiento', 'mapeo configurable de cuentas', 'upsert no destructivo por scope'],
      funcionesCriticas: [
        'v3PortalExportGenerar',
        'v3PortalExportGenerarPortalPadresExport_',
        'v3PortalExportGenerarExportContabilidad_',
        'v3PortalExportAsegurarOrigenEstados_',
        'v3PortalExportResolverMontoContable_',
        'v3PortalExportResolverCuentaContable_',
        'v3PortalExportUpsertScopeRows_'
      ],
      dependeDe: ['01_V3_Core.gs.js', '09_V3_Statements.gs.js', 'LockService', 'SpreadsheetApp', 'Utilities', 'Session'],
      dependientes: [
        '17_V3_PortalAPI.gs.js',
        '21_V3_StageFlow.gs.js',
        '90_V3_Runners.gs.js',
        '99_V3_OrquestadorContable.gs.js'
      ],
      flujoCompartido: [
        'Etapa final de consolidación para consumo web/contable',
        'Publicación de snapshot financiero por período/alumno',
        'Base de integración para API de portal y procesos administrativos'
      ],
      conflictos: {
        confirmados: [
          'Dependencia fuerte de consistencia en ESTADO_CUENTA_DETALLE/RESUMEN: si origen está contaminado, export replica el problema.',
          'Cuenta contable puede quedar en placeholder de CONFIG si no se parametriza (riesgo operativo de clasificación).',
          'Filtro de scope por prefijo exige coherencia estricta en IDs de origen; desalineaciones pueden dejar filas activas no deseadas.'
        ],
        hipotesis: [
          'Lectura completa de detalle/resumen por corrida puede impactar rendimiento en libros con gran volumen histórico.'
        ],
        pendientes: [
          'Validar en operación real que la política de “último período pendiente” coincida con criterio financiero esperado en casos multi-concepto.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Era una publicación directa sin precondiciones fuertes.',
          scriptMuestra: 'Incluye guardia de origen y reconstrucción condicional de estados cuando faltan datos base.',
          ajuste: 'Se documentó su rol dependiente y no autónomo en la cadena.'
        },
        {
          webDecia: 'Export contable tomaba monto genérico.',
          scriptMuestra: 'Resuelve monto por tipo de movimiento y selecciona cuenta por concepto/configuración con fallback.',
          ajuste: 'Se precisó la lógica de mapeo contable real.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en implementación; medio por dependencia crítica de la calidad de consolidación previa.'
    },
    '11A_V3_Task1_ReglasCobroReset.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 97,
      selloFinal: 'descripción fiel y acotada a tarea de saneamiento estructural',
      veredicto: 'Script de Task 1 para rescatar columnas de descuento, respaldar REGLAS_COBRO y restaurar encabezado oficial de 14 columnas sin activar lógica de descuento.',
      queHace: [
        'Ofrece preview y ejecución real del reset estructural de REGLAS_COBRO.',
        'Detecta Valor_Descuento y Tipo_Descuento por mapeo normalizado de encabezados.',
        'Rescata filas con descuento a hoja staging dedicada y crea backup oculto completo antes de modificar.',
        'Elimina únicamente columnas de descuento agregadas y reescribe encabezado oficial exacto A1:N1.'
      ],
      queNoHace: [
        'No activa ni aplica descuentos en generación de cargos (eso corresponde a tarea posterior).',
        'No recalcula cargos, pagos, mora, detalle ni resumen.',
        'No borra contenido de datos masivamente: elimina solo columnas detectadas de descuento.',
        'No continúa si falta esquema base oficial mínimo en REGLAS_COBRO.'
      ],
      entradas: [
        'REGLAS_COBRO como fuente principal y objetivo del reset.',
        'Encabezados oficiales esperados y columnas de descuento objetivo.',
        'Valores de filas con descuentos para rescate en staging.',
        'Servicios Apps Script para copia de hoja, timestamps y auditoría opcional.'
      ],
      salidas: [
        'Hoja backup con prefijo BACKUP_REGLAS_COBRO_<timestamp> (oculta cuando es posible).',
        'Registros de rescate en REGLAS_COBRO_DESCUENTOS_STAGING con metadatos de origen y backup.',
        'REGLAS_COBRO restaurada al esquema oficial de 14 columnas en cabecera.',
        'Resultado estructurado (preview/ejecución) y auditoría V3_TASK1_RULESRESET_OK cuando aplica.'
      ],
      hojas: ['REGLAS_COBRO', 'REGLAS_COBRO_DESCUENTOS_STAGING', 'BACKUP_REGLAS_COBRO_*'],
      reglasNegocio: ['rescate no destructivo de descuento', 'restauración de esquema oficial', 'backup previo obligatorio', 'separación Task 1 vs Task 2'],
      funcionesCriticas: [
        'v3Task1ReglasCobroReset_',
        'v3Task1PreviewReglasCobroReset',
        'v3Task1EjecutarReglasCobroReset',
        'v3Task1EnsureStagingSheet_',
        'v3Task1HeaderMap_',
        'v3Task1Norm_',
        'v3Task1HasValue_'
      ],
      dependeDe: ['01_V3_Core.gs.js (opcional para registrarAuditoria)', 'SpreadsheetApp', 'Utilities', 'Session'],
      dependientes: [
        'Flujo manual de migración de descuentos (Task 2 en 07_V3_Charges.gs.js)'
      ],
      flujoCompartido: [
        'Preparación estructural previa a habilitar descuentos en generación de cargos',
        'Saneamiento puntual de REGLAS_COBRO en escenarios de migración',
        'Resguardo de evidencia para reversibilidad operativa'
      ],
      conflictos: {
        confirmados: [
          'Si REGLAS_COBRO no contiene cabecera oficial mínima, el proceso se bloquea con error explícito.',
          'La detección de columnas por normalización puede rescatar solo encabezados reconocibles; variaciones extremas quedarían fuera.',
          'La operación real elimina columnas detectadas de descuento; requiere confirmar que no se reutilicen para otro propósito.'
        ],
        hipotesis: [
          'Si existen automaciones concurrentes leyendo REGLAS_COBRO durante el reset, podrían observar estado intermedio transitorio.'
        ],
        pendientes: [
          'Verificar en entorno vivo que staging capture el 100% de filas con descuento no vacío antes de habilitar Task 2.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Parecía una activación de descuentos.',
          scriptMuestra: 'Es solo tarea de rescate y restauración estructural, explícitamente sin activar descuentos.',
          ajuste: 'Se delimitó el alcance real a Task 1 de preparación.'
        },
        {
          webDecia: 'Reset potencialmente destructivo amplio.',
          scriptMuestra: 'Incluye preview, backup previo y eliminación acotada a columnas de descuento detectadas.',
          ajuste: 'Se documentó el diseño de reversibilidad y control.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en intención y ejecución; medio operativo si hay encabezados anómalos o concurrencia durante el reset.'
    },
    '12_V3_ResetMensual.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 96,
      selloFinal: 'descripción fiel con observaciones de operación y guardrails',
      veredicto: 'Orquestador de reset/reconstrucción histórica y ciclo mensual operativo: limpia hojas derivadas autorizadas, regenera períodos, aplica mora/pagos/regularización y reconstruye salidas consolidadas.',
      queHace: [
        'Define flujo de reconstrucción limpia para 2026-02/03/04 con validaciones duras y bloqueo de reparación cuando falla.',
        'Limpia únicamente hojas derivadas autorizadas y preserva fuentes protegidas.',
        'Coordina generación de cargos, mora, aplicación de pagos, regularización de recargos y rebuild de detalle/resumen/conciliación/export/portal.',
        'Expone wrappers de compatibilidad (preview/reset Feb-Mar, histórico completo, ciclo mensual nuevo con blindaje anti-duplicación por período).'
      ],
      queNoHace: [
        'No modifica ALUMNOS, REGLAS_COBRO, PARAMETROS, CONFIG ni PAGOS_REPORTADOS.',
        'No ejecuta por sí solo lógicas de negocio primarias: orquesta funciones de otros scripts.',
        'No garantiza backup en runModoReconstruccionLimpiaCasoActual (queda omitido por límite de tiempo GAS).',
        'No continúa flujo normal cuando validaciones críticas fallan; marca REQUIERE_RECONSTRUCCION_LIMPIA.'
      ],
      entradas: [
        'Constantes de períodos/corte histórico y listas de hojas protegidas/reconstruibles.',
        'Funciones de módulos 03/04/05/06/07/08/09/10/18/21/90/automation cuando están disponibles.',
        'Estado actual de CARGOS_ESCOLARES para blindaje de período ya procesado.',
        'Script Properties para marca de reparación requerida cuando aplica fallback.'
      ],
      salidas: [
        'Limpieza de cuerpos de hojas derivadas y reconstrucción secuencial de resultados financieros.',
        'Resultados estructurados por paso (preview/ejecución) para múltiples wrappers operativos.',
        'Eventos de auditoría de reset, procesamiento histórico, ciclo mensual y reconstrucción limpia.',
        'Marca/limpieza de estado de reparación requerida según validaciones finales.'
      ],
      hojas: ['CARGOS_ESCOLARES', 'APLICACION_PAGOS', 'ESTADO_CUENTA_DETALLE', 'ESTADO_CUENTA_RESUMEN', 'CONCILIACION', 'PORTAL_PADRES_EXPORT', 'EXPORT_CONTABILIDAD'],
      reglasNegocio: ['reconstrucción limpia por períodos', 'separación fuentes protegidas vs derivadas', 'validación dura post-rebuild', 'blindaje anti-duplicación mensual'],
      funcionesCriticas: [
        'runModoReconstruccionLimpiaCasoActual',
        'runCicloMensualNuevo',
        'v3ResetMensualLimpiarDerivadas_',
        'v3ResetMensualPreviewYGenerarPeriodo_',
        'v3ResetMensualAplicarPagosPendientes_',
        'v3ResetMensualRegularizarRecargos_',
        'v3ResetMensualVerificarPeriodoYaProcesado_'
      ],
      dependeDe: [
        '01_V3_Core.gs.js',
        '03_V3_ConfigSetup.gs.js',
        '04_V3_Sync.gs.js',
        '05_V3_Payments.gs.js',
        '06_V3_Applications.gs.js',
        '07_V3_Charges.gs.js',
        '08_V3_Reversals.gs.js',
        '09_V3_Statements.gs.js',
        '10_V3_PortalExport.gs.js',
        '18_V3_Conciliacion.gs.js',
        '21_V3_StageFlow.gs.js',
        '16_V3_Automation.gs.js'
      ],
      dependientes: [
        '90_V3_Runners.gs.js'
      ],
      flujoCompartido: [
        'Mantenimiento correctivo de derivadas y recuperación de consistencia',
        'Bootstrap histórico controlado para feb-mar-abr 2026',
        'Operación mensual normal con guardrail de no reprocesar período'
      ],
      conflictos: {
        confirmados: [
          'El backup en reconstrucción limpia está intencionalmente omitido en un flujo para evitar timeout GAS; requiere uso manual de run98 cuando se necesita respaldo.',
          'Alto acoplamiento a disponibilidad de funciones externas; varios pasos se omiten o fallan según módulo cargado.',
          'El ciclo mensual evita duplicar por período usando conteo de conceptos base; depende de consistencia de Concepto/Estado en CARGOS_ESCOLARES.'
        ],
        hipotesis: [
          'Secuencias completas con gran volumen pueden acercarse al límite de ejecución por cantidad de etapas encadenadas.'
        ],
        pendientes: [
          'Validar periódicamente que criterios de validación dura (periodos/coherencia) sigan alineados a reglas operativas vigentes.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Era solo un reset mensual simple.',
          scriptMuestra: 'Incluye flujos múltiples: compatibilidad legacy, reconstrucción limpia, histórico completo y ciclo mensual nuevo blindado.',
          ajuste: 'Se amplió la descripción al rol de orquestador operativo integral.'
        },
        {
          webDecia: 'Hacía limpieza general sin distinción fuerte.',
          scriptMuestra: 'Define explícitamente hojas protegidas y hojas derivadas autorizadas para limpiar.',
          ajuste: 'Se documentó guardrail estructural de no tocar fuentes de verdad.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en alcance declarado; medio en operación por acoplamiento alto y costos de ejecución por orquestación extensa.'
    },
    '14_V3_FormularioPagosInterno.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 96,
      selloFinal: 'descripción fiel con observaciones de convivencia con versión V2',
      veredicto: 'Constructor de formulario interno de pagos por concepto, con enlace a hoja de respuestas, persistencia de CONFIG PAYMENTS y trigger onFormSubmit para ingesta automática.',
      queHace: [
        'Crea formulario interno de pagos con esquema de una respuesta por concepto reportado.',
        'Detecta si ya existe formulario configurado y evita recreación duplicada.',
        'Configura hoja destino de respuestas y guarda claves PAYMENTS_SOURCE_* y PAYMENTS_FORM_ID en CONFIG.',
        'Asegura trigger onFormSubmit para v3PaymentsOnFormSubmit cuando la función está disponible.'
      ],
      queNoHace: [
        'No importa ni aplica pagos por sí mismo; solo prepara captura y enlace de configuración.',
        'No valida negocio financiero de cargos/mora/conciliación.',
        'No elimina formularios ni triggers existentes distintos al handler objetivo.',
        'No reemplaza explícitamente flujos V2; convive y puede requerir decisión operativa de versión activa.'
      ],
      entradas: [
        'Spreadsheet activo para destino de respuestas de formulario.',
        'CONFIG para lectura/escritura de claves PAYMENTS_SOURCE_* y PAYMENTS_FORM_ID.',
        'Catálogo de campos, métodos de pago y conceptos principales definidos en constantes.',
        'Disponibilidad opcional de v3PaymentsInicializarConfigBase y v3PaymentsOnFormSubmit.'
      ],
      salidas: [
        'Formulario creado o reutilizado con URLs de edición y respuesta.',
        'Hoja RESPUESTAS_FORM_PAGOS (renombrada/congelada) como destino de respuestas.',
        'Actualización de claves de configuración de origen de pagos en CONFIG.',
        'Trigger instalado o detectado para handler v3PaymentsOnFormSubmit.'
      ],
      hojas: ['RESPUESTAS_FORM_PAGOS', 'CONFIG'],
      reglasNegocio: ['captura interna por concepto', 'idempotencia de creación', 'alineación con esquema PAYMENTS', 'gatillo de ingestión automática'],
      funcionesCriticas: [
        'runCrearFormularioPagosInterno',
        'v3FormPagosCrear_',
        'v3FormPagosBuscarExistente_',
        'v3FormPagosConstruirPreguntas_',
        'v3FormPagosGuardarConfig_',
        'v3FormPagosAsegurarTrigger_',
        'v3FormPagosDetectarHojaRespuestas_'
      ],
      dependeDe: ['01_V3_Core.gs.js', '05_V3_Payments.gs.js', 'SpreadsheetApp', 'FormApp', 'ScriptApp', 'Utilities'],
      dependientes: [
        '05_V3_Payments.gs.js',
        '05A_V3_PaymentsForm.gs.js'
      ],
      flujoCompartido: [
        'Canal interno de captura de pagos previo a importación/normalización',
        'Configuración de origen de datos para pipeline de pagos',
        'Activación de trigger de ingestión de respuestas'
      ],
      conflictos: {
        confirmados: [
          'Comparte ámbito funcional con 05A/15 (PaymentsForm/V2), lo que puede generar ambigüedad sobre cuál flujo/formulario debe quedar activo.',
          'Si v3PaymentsOnFormSubmit no existe, el script crea formulario pero deja nota de trigger no operativo.',
          'La detección de hoja de respuestas depende de heurística por “hoja nueva” o nombre tipo Form Responses/Respuestas de formulario.'
        ],
        hipotesis: [
          'En escenarios con múltiples formularios vinculados al mismo spreadsheet, la detección de hoja destino podría requerir verificación manual adicional.'
        ],
        pendientes: [
          'Definir política única entre flujo clásico (14/05A) y flujo V2 (15) para evitar doble trigger o duplicidad de captura.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Solo creaba un formulario simple.',
          scriptMuestra: 'Incluye idempotencia por configuración existente, persistencia de mapping PAYMENTS_* y aseguramiento de trigger.',
          ajuste: 'Se amplió a rol de provisioning completo del canal de captura.'
        },
        {
          webDecia: 'Funcionaba aislado de pipeline.',
          scriptMuestra: 'Está explícitamente alineado con 05_V3_Payments (headers/config/trigger) y convive con alternativas 05A/15.',
          ajuste: 'Se documentó su dependencia e interacción real en ecosistema de pagos.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en lógica interna; medio operativo por convivencia de variantes de formulario y triggers.'
    },
    '15_V3_FormularioPagosV2.gs.js': {
      cotejoEstado: 'COTEJADO CON OBSERVACIONES',
      confianza: 'Confirmado por código',
      fidelidad: 96,
      selloFinal: 'descripción fiel con observaciones de modo manual y reemplazo de triggers',
      veredicto: 'Formulario interno V2 orientado a un comprobante con hasta 3 conceptos; normaliza/expande líneas y escribe directo en PAGOS_REPORTADOS con deduplicación por response-id y hash.',
      queHace: [
        'Crea/reutiliza formulario V2 con captura de comprobante único y hasta tres líneas de concepto/periodo/monto.',
        'Reemplaza triggers previos de pagos (v1/v2) y activa handler v3PaymentsOnFormSubmitV2.',
        'Importa respuesta a PAGOS_REPORTADOS expandiendo hasta 3 filas por comprobante, con enriquecimiento desde ALUMNOS.',
        'Aplica controles de duplicidad por Fuente_Form_Response_Id y Hash_Duplicado, y marca estado de revisión según consistencia de montos.'
      ],
      queNoHace: [
        'No aplica pagos sobre cargos ni conciliación contable directamente.',
        'No procesa automáticamente cuando V3_FORM_V2_MANUAL_MODE está activo (queda en modo manual por diseño actual).',
        'No corrige datos de ALUMNOS; solo consume información disponible para completar campos.',
        'No evita por sí mismo conflictos de coexistencia estratégica con flujos 14/05A fuera del reemplazo técnico de trigger.'
      ],
      entradas: [
        'Respuestas de formulario V2 en hoja configurada PAYMENTS_FORM_V2_SOURCE_SHEET.',
        'ALUMNOS para documento/nombre/responsable por ID_Alumno.',
        'PARAMETROS para catálogo dinámico de conceptos del formulario.',
        'CONFIG para PAYMENTS_FORM_V2_ID y PAYMENTS_FORM_V2_SOURCE_SHEET.'
      ],
      salidas: [
        'Formulario V2 y hoja RESPUESTAS_FORM_PAGOS_V2 enlazada al spreadsheet.',
        'Filas en PAGOS_REPORTADOS con metadata de origen, hash de duplicado y auditoría de importación.',
        'Trigger activo v3PaymentsOnFormSubmitV2 tras eliminar handlers legacy de pagos.',
        'Resultado de importación con insertadas/duplicadas/warnings y bandera de cuadratura de montos.'
      ],
      hojas: ['RESPUESTAS_FORM_PAGOS_V2', 'PAGOS_REPORTADOS', 'ALUMNOS', 'PARAMETROS', 'CONFIG'],
      reglasNegocio: ['1 comprobante -> hasta 3 conceptos', 'deduplicación fuerte por hash y source id', 'enriquecimiento de alumno por ID', 'modo manual de procesamiento'],
      funcionesCriticas: [
        'runCrearFormularioPagosV2',
        'runProcesarUltimaRespuestaFormV2',
        'v3PaymentsOnFormSubmitV2',
        'v3FormV2Crear_',
        'v3FormV2ReemplazarTriggers_',
        'v3FormV2ImportarFila_',
        'v3FormV2LeerExistingPagos_'
      ],
      dependeDe: ['01_V3_Core.gs.js', '05_V3_Payments.gs.js', 'SpreadsheetApp', 'FormApp', 'ScriptApp', 'LockService', 'Utilities', 'Session'],
      dependientes: [
        '05_V3_Payments.gs.js',
        '06_V3_Applications.gs.js',
        '12_V3_ResetMensual.gs.js',
        '21_V3_StageFlow.gs.js'
      ],
      flujoCompartido: [
        'Canal de captura V2 para alimentar PAGOS_REPORTADOS',
        'Pre-etapa de aplicación de pagos y regularización',
        'Convergencia de formularios internos en un trigger V2 activo'
      ],
      conflictos: {
        confirmados: [
          'El modo manual está activado por constante; onSubmit automático retorna PAUSADO_MODO_MANUAL si no se cambia configuración.',
          'v3FormV2ReemplazarTriggers_ elimina tanto v3PaymentsOnFormSubmit como v3PaymentsOnFormSubmitV2 antes de recrear V2, impactando coexistencia con flujo clásico.',
          'Si suma de líneas no cuadra con monto total, se inserta con Estado_Revision=Incompleto y observación de alerta.'
        ],
        hipotesis: [
          'Con alto volumen de respuestas, búsqueda de duplicados leyendo toda la hoja puede degradar tiempo de importación incremental.'
        ],
        pendientes: [
          'Definir decisión operativa final sobre mantener V2 en manual o automático para evitar pasos manuales omitidos en operación diaria.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Solo era un formulario alterno.',
          scriptMuestra: 'Incluye importador completo a PAGOS_REPORTADOS con deduplicación, enriquecimiento y auditoría.',
          ajuste: 'Se reclasificó como módulo de captura + ingesta V2, no solo UI de formulario.'
        },
        {
          webDecia: 'Convivía pasivamente con V1.',
          scriptMuestra: 'Reemplaza triggers legacy y deja V2 como handler activo (aunque en manual mode por constante).',
          ajuste: 'Se explicitó impacto operativo sobre flujos de trigger existentes.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en implementación; medio en operación por estrategia de trigger y modo manual vigente.'
    },
    '16_V3_Automation.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 96,
      selloFinal: 'Configurador de triggers duales con delegación limpia a 21_V3_StageFlow',
      veredicto: 'Módulo de automatización que gestiona triggers diarios (5 etapas horarias) y modo manual, coordinando inicio de pipeline financiero.',
      queHace: [
        'Configura triggers timeBased diarios para 5 etapas: Importación (h1), Cargos (h2), Recargos (h3), Aplicación (h4), Consolidación (h5).',
        'Elimina triggers previos (legacy v1/v2 y duales) antes de crear nuevos, evitando duplicación.',
        'Detecta estado de período actual verificando cargos activos en CARGOS_ESCOLARES.',
        'Proporciona modo manual (v3AutomationRunMasterManual) para ejecutar flujo completo bajo demanda.',
        'Delega lógica real de cada etapa a 21_V3_StageFlow (v3StageRunStage_).',
        'Registra auditoría transversal de configuración y ejecución de triggers.'
      ],
      queNoHace: [
        'No ejecuta lógica de importación, cargos, recargos, aplicación ni consolidación (eso es 21).',
        'No modifica datos directamente de hojas; solo configura triggers.',
        'No valida existencia de handlers antes de crear triggers.',
        'No maneja formularios ni captura de pagos.',
        'No reconcilia ni genera reportes.'
      ],
      entradas: [
        'Período actual (calculado automáticamente o parametrizado).',
        'Fecha de corte para preview de cargos.',
        'Nombres de handlers desde V3_AUTOMATION_CONFIG (constantes).',
        'Estado de CARGOS_ESCOLARES para detectar períodos con cargos activos.'
      ],
      salidas: [
        'Triggers timeBased configurados (5 handlers, 1 por etapa, horas 1-5).',
        'Reporte de triggers removidos (legacy y previos).',
        'Resultado de v3StageRunStage_ delegado (estados de ejecución de etapa).',
        'Auditoría transversal de configuración.'
      ],
      hojas: ['CARGOS_ESCOLARES'],
      reglasNegocio: [
        '5 etapas diarias en horas fijas: 01:00 (IMPORTACION), 02:00 (CARGOS), 03:00 (RECARGOS), 04:00 (APLICACION), 05:00 (CONSOLIDACION)',
        'Idempotencia: elimina triggers previos antes de crear nuevos',
        'Período vigente detectado por presencia de cargos activos (Estado_Cargo != ANULADO)'
      ],
      funcionesCriticas: [
        'v3AutomationConfigurarTriggersDual',
        'v3AutomationEliminarTriggersDual',
        'v3AutomationDeleteTriggersByHandler_',
        'v3AutomationTriggerEtapaImportacion',
        'v3AutomationTriggerEtapaCargos',
        'v3AutomationTriggerEtapaRecargos',
        'v3AutomationTriggerEtapaAplicacion',
        'v3AutomationTriggerEtapaConsolidacion',
        'v3AutomationRunMasterManual',
        'v3AutomationDetectarEstadoPeriodo_',
        'v3AutomationEjecutarFlujoFinanciero_'
      ],
      dependeDe: [
        '01_V3_Core.gs.js',
        '21_V3_StageFlow.gs.js',
        '07_V3_Charges.gs.js',
        'ScriptApp',
        'SpreadsheetApp',
        'Utilities',
        'Session'
      ],
      dependientes: [
        '12_V3_ResetMensual.gs.js',
        '90_V3_Runners.gs.js'
      ],
      flujoCompartido: [
        'Activación diaria de pipeline financiero V3 mediante triggers timeBased',
        'Coordinación de 5 etapas en cascada (cada una corre en hora diferente)',
        'Modo manual para ejecución bajo demanda'
      ],
      conflictos: {
        confirmados: [
          'v3AutomationDeleteTriggersByHandler_ busca por nombre de handler, pero no valida que el handler exista antes de crear trigger (puede crear triggers huérfanos).',
          'Dependencia fuerte de 21_V3_StageFlow: si stage 21 cambia firma de v3StageRunStage_ o v3StageRunPipelineManual_, los handlers fallarán.',
          'v3AutomationDetectarEstadoPeriodo_ asume que CARGOS_ESCOLARES tiene columnas Periodo y Estado_Cargo; si faltan, idxPeriodo/idxEstado serán undefined.'
        ],
        hipotesis: [
          'Los handlers de etapas (v3AutomationTriggerEtapa*) actualmente solo delegan a 21; si 21 no existe o tiene errores, etapas fallarán silenciosamente.',
          'No hay reintentos automáticos si una etapa falla; falla en hora1 no impide que hora2 intente ejecutar.'
        ],
        pendientes: [
          'Validar que v3StageRunStage_ exista antes de crear triggers.',
          'Implementar backoff/reintentos si etapa falla.',
          'Auditoría explícita de fallos de etapa para alertas operativas.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Solo gestionaba triggers legacy (v1/v2 pagos).',
          scriptMuestra: 'Gestiona 5 triggers duales horarios (IMPORTACION, CARGOS, RECARGOS, APLICACION, CONSOLIDACION) más modo manual.',
          ajuste: 'Se reclasificó como orquestador central de triggers, no solo limpiador de legacy.'
        },
        {
          webDecia: 'Los handlers ejecutaban lógica gigante inline.',
          scriptMuestra: 'Los handlers ahora son delegadores ligeros que llaman v3StageRunStage_(nombreEtapa).',
          ajuste: 'Separación clara entre configuración (16) y ejecución (21).'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en trigger setup; medio a alto en runtime por dependencia crítica de 21_V3_StageFlow y falta de validación de handlers.'
    },
    '17_V3_PortalAPI.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 95,
      selloFinal: 'API web pública con autenticación dual (alumno + admin) y catálogo dinámico de funciones permitidas',
      veredicto: 'Web app doGet/doPost para portal de padres en Netlify; maneja login, datos de alumno, estado de cuenta, y operaciones admin con HMAC+nonce.',
      queHace: [
        'Expone endpoints REST públicos: doGet() y doPost() para acceso desde Netlify.',
        'Autentica alumnos con ID+contraseña hardcoded (V3_PORTAL_CONTRASENAS); genera token de sesión.',
        'Retorna datos de alumno desde PORTAL_PADRES_EXPORT: saldo, mora, resumen financiero, movimientos.',
        'Implementa canal admin con autenticación de 2 factores: token fijo + firma HMAC-SHA256 + nonce de replay.',
        'Permite ejecución controlada de funciones via runBackoffice(fn, args) contra allowlist dinámico (desde catalog).',
        'Cataloga funciones permitidas en ScriptProperties (BACKOFFICE_CATALOG_JSON) con fallback a defaults.',
        'Operaciones admin: setRepairModeSI, clearRepairMode, probeGuardrail, run98, rotateSecurity.',
        'Genera contraseñas aleatorias XXX-XXX-XXX-XXX para alumnos en columna Contrasena_Portal.'
      ],
      queNoHace: [
        'No ejecuta funciones fuera del allowlist catalográfico.',
        'No modifica ALUMNOS ni PORTAL_PADRES_EXPORT directamente (solo lee).',
        'No valida contraseñas contra hoja ALUMNOS; usa hardcode V3_PORTAL_CONTRASENAS.',
        'No implementa caducidad de sesión (token válido indefinidamente tras login).',
        'No hay rate limiting ni throttling de requests.',
        'No valida que funciones en allowlist realmente existan en globalThis antes de ejecutar.',
        'No mantiene audit trail transversal de logins (logs solo en Logger, no persisten).'
      ],
      entradas: [
        'Query params GET: action, idAlumno, token, fn, op, args, password.',
        'POST body JSON: action, op, adminToken, sig, ts, nonce, newAdminToken, newAdminHmacSecret.',
        'Hojas: PORTAL_PADRES_EXPORT (lectura), ALUMNOS (lectura), ESTADO_CUENTA_RESUMEN, ESTADO_CUENTA_DETALLE (para datos financieros).',
        'ScriptProperties: PORTAL_API_TOKEN, PORTAL_ADMIN_TOKEN, PORTAL_ADMIN_HMAC_SECRET, V3_BACKOFFICE_CATALOG_JSON.'
      ],
      salidas: [
        'JSON responses: {version, timestamp, action, success, data, error}.',
        'Login exitoso: alumnoData + resumenFinanciero + detalleMovimientos.',
        'Admin info: scriptId, deploymentId, serviceUrl, allowlist (GET/POST), repairMode, lastRun98, security status.',
        'runBackoffice output: {functionName, operationName, argsUsed, catalogVersion, executedAt, output}.',
        'Logger.log con auditoría de admin operations y contraseñas generadas.'
      ],
      hojas: ['PORTAL_PADRES_EXPORT', 'ALUMNOS', 'ESTADO_CUENTA_RESUMEN', 'ESTADO_CUENTA_DETALLE'],
      reglasNegocio: [
        'Contraseñas hardcoded por alumno (sin derivación dinámica)',
        'Autenticación admin: HMAC-SHA256 + nonce con TTL 5min y límite 300 nonces activos',
        'Allowlist dinámico de funciones desde catalog con fallback hardcoded',
        'Modo reparación gestionable vía ScriptProperties (setRepairModeSI/clearRepairMode)',
        'Datos financieros enriquecidos con ESTADO_CUENTA_* si existen (fail-safe)'
      ],
      funcionesCriticas: [
        'doGet',
        'doPost',
        'v3PortalApiLoginAlumno_',
        'v3PortalApiGetAlumnoData_',
        'v3PortalApiRunBackoffice_',
        'v3PortalApiHandleAdminPost_',
        'v3PortalApiAdminValidateRequest_',
        'v3PortalApiHmacSha256Hex_',
        'v3PortalApiValidateToken_',
        'v3PortalApiGenerarContrasenas',
        'v3PortalApiSetupAdminSecurity'
      ],
      dependeDe: [
        '01_V3_Core.gs.js (leerConfig/escribirConfig)',
        'SpreadsheetApp',
        'PropertiesService',
        'ScriptApp',
        'Utilities',
        'ContentService',
        'Logger',
        'v3LegacyRunnerGuardrail_ (opcional para probeGuardrail)'
      ],
      dependientes: [
        '90_V3_Runners.gs.js (v3PortalApiGenerarContrasenas)',
        'Portal en Netlify (frontend client)'
      ],
      flujoCompartido: [
        'Canal de lectura de estado de cuenta para portal público',
        'Orquestador de operaciones administrativas desde Netlify',
        'Exportación de catálogo dinámico de backoffice'
      ],
      conflictos: {
        confirmados: [
          'V3_PORTAL_CONTRASENAS está hardcoded en el script; rotación requiere redeploy.',
          'v3PortalApiRunBackoffice_ no valida que callable exista en globalThis; puede ejecutar undefined (error runtime).',
          'No hay TTL en token de login; sesión válida indefinidamente.',
          'Contraseñas generadas en v3PortalApiGenerarContrasenas no se sincronizan con V3_PORTAL_CONTRASENAS hardcoded (dos fuentes de verdad).',
          'leerConfig() y escribirConfig() son dependencias implícitas de 01_V3_Core; si cambian firma, API falla.'
        ],
        hipotesis: [
          'Alto riesgo de DoS si allowlist catalográfico contiene funciones de larga ejecución sin timeout GAS enforcement.',
          'Nonce deduplicación usa ScriptProperties con límite 300; bajo volumen de requests diarias, pero podría saturarse en ataque coordinado.',
          'HMAC-SHA256 construye payload con hardcode de method=POST/action=adminOp; cambio de header names rompe firma válida.'
        ],
        pendientes: [
          'Implementar TTL en login token.',
          'Validar existencia de callable antes de ejecutar en runBackoffice.',
          'Sincronizar contraseñas: pasar generadas a V3_PORTAL_CONTRASENAS u otro registro único.',
          'Rate limiting / throttling para requests consecutivas.',
          'Audit trail persiste de logins (no solo Logger).'
        ]
      },
      diferencias: [
        {
          webDecia: 'Solo era un API basic para lectura de estado de cuenta.',
          scriptMuestra: 'Incluye autenticación dual (alumno + admin), catálogo dinámico de backoffice, generación de contraseñas, rotación de seguridad.',
          ajuste: 'Se reclasificó como API multicanal con control administrativo integral.'
        },
        {
          webDecia: 'Las contraseñas se generaban bajo demanda.',
          scriptMuestra: 'V3_PORTAL_CONTRASENAS está hardcoded; generación de contraseñas solo escribe en columna de ALUMNOS.',
          ajuste: 'Doble fuente de verdad confirmada; genera pero no sincroniza.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Medio a alto: autenticación hardcoded, sin TTL de sesión, allowlist sin validación de callable, sin rate limiting, doble fuente de contraseñas.'
    },
    '18_V3_Conciliacion.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 97,
      selloFinal: 'Generador idempotente de ledger de conciliación por movimiento de pago',
      veredicto: 'Módulo de reconciliación que cruza PAGOS_REPORTADOS + APLICACION_PAGOS + EXPORT_CONTABILIDAD y resuelve estado de conciliación por pago.',
      queHace: [
        'Lee PAGOS_REPORTADOS (filtro por período, excluye RECHAZADO).',
        'Lee APLICACION_PAGOS y agrupa por Pago_Referencia, sumando montos aplicados/excedentes.',
        'Lee EXPORT_CONTABILIDAD para verificar estado de exportación por referencia.',
        'Genera filas de CONCILIACION comparando monto pagado vs. cargo aplicado, calculando diferencia.',
        'Resuelve estado de conciliación: Conciliado | Excedente | Sin coincidencia | Parcial | Revisión manual.',
        'Asegura encabezados de CONCILIACION con formato azul oscuro, congelado, tamaño 10.',
        'Reemplaza body de CONCILIACION con nuevas filas (destruye previas).',
        'Aplica formato monetario a columnas de monto y fecha.'
      ],
      queNoHace: [
        'No modifica PAGOS_REPORTADOS ni APLICACION_PAGOS.',
        'No ejecuta aplicación de pagos; solo lee resultados de aplicación previa.',
        'No genera auditoría de reconciliación (no llama registrarAuditoria).',
        'No valida integridad de referencias cruzadas (si Pago_Referencia no existe en APLICACION_PAGOS, asume $0).',
        'No deduplicar pagos; lee todas las filas activas sin estado de procesamiento.'
      ],
      entradas: [
        'Período (opcional, string YYYY-MM o vacio para todos).',
        'PAGOS_REPORTADOS: Pago_Reportado_ID, ID_Alumno, Nombre_Alumno, Numero_Referencia, Comprobante_Adjunto, Periodo_Reportado, Monto_Comprobante_Total_Normalizado, Estado_Revision, Observaciones.',
        'APLICACION_PAGOS: Pago_Referencia, Monto_Aplicado, Monto_Excedente, Estado_Aplicacion.',
        'EXPORT_CONTABILIDAD: Referencia_ID, Estado_Exportacion.'
      ],
      salidas: [
        'Hoja CONCILIACION con 16 columnas: Conciliacion_ID, Fecha_Conciliacion, ID_Alumno, Nombre_Alumno, Pago_Referencia, Numero_Referencia, Comprobante_Adjunto, Periodo, Monto_Cargo, Monto_Pagado, Monto_Excedente, Diferencia, Estado_Conciliacion, Estado_Aplicacion, Estado_Exportacion, Observaciones.',
        'Formato: encabezados frozen, monetarios con $#,##0.00, fechas dd/mm/yyyy.',
        'Retorna: {version, periodo, filas, hoja}.'
      ],
      hojas: ['CONCILIACION', 'PAGOS_REPORTADOS', 'APLICACION_PAGOS', 'EXPORT_CONTABILIDAD'],
      reglasNegocio: [
        'Reconciliación por pago: 1 fila por Pago_Reportado_ID',
        'Estado RECHAZADO en PAGOS_REPORTADOS excluido de conciliación',
        'Estados ANULADO|REVERSADO|ERROR en APLICACION_PAGOS no se agregan',
        'Epsilon precisión: 0.00001 para comparaciones monetarias',
        'Diferencia = monto cargo aplicado - monto pagado reportado'
      ],
      funcionesCriticas: [
        'v3ConciliacionGenerar',
        'v3ConciliacionAsegurarHeadersYFormato_',
        'v3ConciliacionReemplazarBody_',
        'v3ConciliacionLeerPagos_',
        'v3ConciliacionLeerAplicacionesPorPago_',
        'v3ConciliacionLeerExportPorPago_',
        'v3ConciliacionResolverEstado_',
        'v3ConciliacionJoinEstados_',
        'v3ConciliacionRound2_'
      ],
      dependeDe: [
        '01_V3_Core.gs.js (asegurarHoja)',
        'SpreadsheetApp',
        'LockService',
        'Utilities'
      ],
      dependientes: [
        '90_V3_Runners.gs.js (4 usos diretos)',
        '21_V3_StageFlow.gs.js (etapa CONSOLIDACION_FINAL)',
        '19_V3_Fixes.gs.js (rebuild ad-hoc)',
        '12_V3_ResetMensual.gs.js (reset mode)'
      ],
      flujoCompartido: [
        'Post-aplicación de pagos: reconciliación como etapa de consolidación',
        'Validación de integridad entre PAGOS_REPORTADOS y APLICACION_PAGOS',
        'Ledger auditable de diferencias de pago'
      ],
      conflictos: {
        confirmados: [
          'v3ConciliacionReemplazarBody_ destruye todo el body previo (no idempotente por scope como otras funciones).',
          'No hay lock específico para APLICACION_PAGOS ni EXPORT_CONTABILIDAD; si estas hojas se escriben en paralelo, lecturas pueden ser inconsistentes.',
          'Si PAGOS_REPORTADOS o APLICACION_PAGOS no existen, asegurarHoja las crea vacías, retornando reconciliación sin filas.',
          'No valida que Monto_Comprobante_Total_Normalizado exista; parseFloat("")→0, ocultando datos faltantes.',
          'No sincroniza con fecha actual; fecha_conciliacion siempre = hoy (hoySinHora), sin timestamp de versión.'
        ],
        hipotesis: [
          'Alto volumen de PAGOS_REPORTADOS podría causar timeout GAS si v3ConciliacionLeerPagos_ itera >10k filas.',
          'Estados compuestos en APLICACION_PAGOS podrían causar explosión combinatoria si múltiples estados por pago (join con | puede generar tuplas largas).'
        ],
        pendientes: [
          'Implementar idempotencia por scope (no reemplazar todo; upsert por Conciliacion_ID).',
          'Añadir auditoría de reconciliación (diferencias significativas, errores).',
          'Validar existencia de referencias antes de agregar filas.',
          'Rate limiting si > 5k filas de conciliación.'
        ]
      },
      diferencias: [
        {
          webDecia: 'La conciliación era un proceso manual revisado al final.',
          scriptMuestra: 'Automatizada y regenrada cada ciclo, alimentando auditoría de diferencias.',
          ajuste: 'Se reclasificó como módulo generativo del pipeline, no solo validador.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en lógica; medio en runtime por lack de locking en hojas de origen y destrucción no-idempotente del body.'
    },
    '19_V3_Fixes.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 94,
      selloFinal: 'Conjunto de reparaciones ad-hoc para validaciones, duplicados y reconstrucción contingente',
      veredicto: 'Módulo de utilidades de fixes: limpia validaciones contaminadas, deduplica hojas por clave, respalda derivadas y reconstruye estados de manera idempotente.',
      queHace: [
        'Limpia validaciones de datos en hojas de estado (ESTADO_CUENTA_RESUMEN/DETALLE) y financieras.',
        'Reaplica validaciones V3 si v3SchemaAsegurarValidaciones está disponible.',
        'Deduplica hojas por clave (Cargo_ID, Aplicacion_ID, etc.) con fallback a llave compuesta custom.',
        'Congela triggers (elimina todos) y respalda hojas derivadas con timestamp.',
        'Reconstruye derivadas en cascada: estadosCuenta → portalExport → conciliación.',
        'Cuenta duplicados de cargo por período (auditoría post-dedupe).',
        'Limpia body de hojas (vacía contenido sin tocar encabezados).'
      ],
      queNoHace: [
        'No modifica hojas protegidas (ALUMNOS, REGLAS_COBRO, PARAMETROS, CONFIG).',
        'No ejecuta aplicación de pagos ni cargos (solo reconstruye derivadas).',
        'No valida que datos sean consistentes después de dedupe.',
        'No restaura triggers (eso es responsabilidad de operador post-fix).',
        'No audita cambios (logs solo en Logger, no persisten).',
        'No maneja errores de locks/timeouts (raises exception si ocurren).'
      ],
      entradas: [
        'Período objetivo (string YYYY-MM, fallback a CONFIG.PERIODO_PRUEBA).',
        'Dependencias opcionales: v3SchemaAsegurarValidaciones, v3StatementsConstruirEstadosCuenta, v3PortalExportGenerar, v3ConciliacionGenerar.',
        'Hojas: CARGOS_ESCOLARES, APLICACION_PAGOS, ESTADO_CUENTA_DETALLE/RESUMEN, PORTAL_PADRES_EXPORT, EXPORT_CONTABILIDAD, CONCILIACION.'
      ],
      salidas: [
        'v3FixesLimpiarValidacionesEstados: {version, accion, hojas[], reaplicoValidacionesV3}.',
        'v3FixesReconstruirDerivadasIdempotente: {version, periodo, freezeBackup, dedupe, limpieza, rebuild, validacion}.',
        'v3FixesCongelarTriggersYRespaldarDerivadas_: {triggersEliminados, handlersEliminados[], backups[], timestamp}.',
        'Hojas de respaldo nombradas BKP_yyyyMMdd_HHmmss_NOMBRE.'
      ],
      hojas: ['CARGOS_ESCOLARES', 'APLICACION_PAGOS', 'ESTADO_CUENTA_DETALLE', 'ESTADO_CUENTA_RESUMEN', 'PORTAL_PADRES_EXPORT', 'EXPORT_CONTABILIDAD', 'CONCILIACION'],
      reglasNegocio: [
        'Deduplicación por clave: si clave existe, descartar fila posterior',
        'Fallback de clave compuesta si clave primaria vacía',
        'Backup con timestamp antes de modificaciones destructivas',
        'Reconstrucción en cascada de derivadas (estados → portal → conciliación)',
        'Auditoría de duplicados post-dedupe por período'
      ],
      funcionesCriticas: [
        'v3FixesReconstruirDerivadasIdempotente',
        'v3FixesLimpiarValidacionesEstados',
        'v3FixesLimpiarValidacionesFinancieras',
        'v3FixesCongelarTriggersYRespaldarDerivadas_',
        'v3FixesDeduplicarHojaPorLlave_',
        'v3FixesLimpiarBodyHoja_',
        'v3FixesContarDuplicadosCargoPeriodo_',
        'v3FixesEstadosYRebuild'
      ],
      dependeDe: [
        '01_V3_Core.gs.js (asegurarHoja, leerConfig, valorSeguroTexto)',
        '09_V3_Statements.gs.js (v3StatementsConstruirEstadosCuenta)',
        '10_V3_PortalExport.gs.js (v3PortalExportGenerar)',
        '18_V3_Conciliacion.gs.js (v3ConciliacionGenerar)',
        'SpreadsheetApp',
        'ScriptApp',
        'LockService',
        'Utilities',
        'Logger'
      ],
      dependientes: [
        '90_V3_Runners.gs.js (v3FixesReconstruirDerivadasIdempotente invocable vía runBackoffice?)'
      ],
      flujoCompartido: [
        'Recuperación de contaminación de validaciones',
        'Deduplicación preventiva antes de reconstrucción',
        'Backup contingente pre-modificación',
        'Reconstrucción en cascada post-fix'
      ],
      conflictos: {
        confirmados: [
          'v3FixesDeduplicarHojaPorLlave_ destruye datos (no idempotente); si se ejecuta 2x, la 2ª no encuentra duplicados.',
          'v3FixesCongelarTriggersYRespaldarDerivadas_ elimina TODOS los triggers sin discriminación (podría afectar otros scripts si existen).',
          'Backup es asincrónico (copyTo no garantiza completitud antes de siguiente operación).',
          'Si v3StatementsConstruirEstadosCuenta falla, resultado queda parcialmente limpio (headers borrados, datos vacíos).',
          'No hay validación de que períodoObjetivo exista en datos reales; reconstruye incluso si período vacío.'
        ],
        hipotesis: [
          'Alto volumen de filas (>50k) en dedupe podría causar timeout GAS.',
          'Backups multiplicados sin límite podrían llenar cuota de hojas del spreadsheet.',
          'Estados inconsistentes en origen (ej. CARGOS_ESCOLARES) no son detectados pre-dedupe.'
        ],
        pendientes: [
          'Implementar validación de período antes de reconstrucción.',
          'Añadir límite de backups (borrar backups >30 días).',
          'Audit trail de qué filas fueron deduplicadas y por qué.',
          'Rollback si reconstrucción falla post-dedupe.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Fixes eran funciones sueltas sin orquestación.',
          scriptMuestra: 'Orquestadas en v3FixesReconstruirDerivadasIdempotente con freeze/backup/dedupe/limpieza/rebuild en secuencia.',
          ajuste: 'Se reclasificó como orquestador de recuperación, no solo utilidades.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Medio a alto: operaciones destructivas sin idempotencia clara, eliminación global de triggers, potencial loss de datos en dedupe fallido.'
    },
    '20_V3_QA_Smoke.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 96,
      selloFinal: 'Suite de smoke tests para validación de arquitectura, headers y lógica crítica',
      veredicto: 'Módulo de QA/testing que verifica integridad de hojas, presencia de funciones críticas y comportamiento de lógica de recargos en casos críticos.',
      queHace: [
        'Smoke básico: verifica existencia de 10 hojas críticas y 7 funciones requeridas.',
        'Validación de headers: comprueba presencia de columnas requeridas en cada hoja.',
        'Smoke financiero 2026: ejecuta previsualizaciones de cargos febrero, test de mora y preview de mora.',
        'Smoke dinámico: simula caso crítico (cargo base 1000 → pago 500 → recargo 100 → esperado saldo 600).',
        'Fake sheet mock para testing sin tocar datos reales.',
        'Reporta warnings de hojas/funciones faltantes.'
      ],
      queNoHace: [
        'No modifica datos de hojas reales (todos los tests son read-only o mock).',
        'No genera fixtures de datos reales; usa datos hardcoded para casos críticos.',
        'No valida la integridad de cálculos financieros complejos (solo casos específicos).',
        'No ejecuta full end-to-end; solo smoke tests puntuales.',
        'No mantiene historial de resultados de tests.'
      ],
      entradas: [
        'Spreadsheet activo con 10 hojas: ALUMNOS, REGLAS_COBRO, CARGOS_ESCOLARES, PAGOS_REPORTADOS, APLICACION_PAGOS, ESTADO_CUENTA_DETALLE/RESUMEN, CONCILIACION, PARAMETROS, CONFIG.',
        '7 funciones críticas: v3SchemaAsegurarEstructura, v3SyncPrevisualizarAlumnosDesdeFuente, v3ChargesPreviewFeb2026, v3ReversalsPrevisualizarMora, v3StatementsConstruirEstadosCuenta, v3PortalExportGenerar.',
        'Para smoke dinámico: v3ReversalsActualizarRecargoEnFila_ con fakeSheet mock.'
      ],
      salidas: [
        'v3QaSmokeBasico: {version, hojas{}, funciones{}, conteos{}, headers{}, warnings[], validacionesMinimas}.',
        'v3QaSmokeFinanciero2026: {version, chargesPreview, moraSelfTest, moraPreview, warnings}.',
        'v3QaSmokeDinamicoSaldoParcialRecargo: {ok, entrada{}, salida{}, esperado{}, assertions{}, pass}.',
        'Todos los resultados se loguean en Logger.log (JSON formatted).'
      ],
      hojas: ['ALUMNOS', 'REGLAS_COBRO', 'CARGOS_ESCOLARES', 'PAGOS_REPORTADOS', 'APLICACION_PAGOS', 'ESTADO_CUENTA_DETALLE', 'ESTADO_CUENTA_RESUMEN', 'CONCILIACION', 'PARAMETROS', 'CONFIG'],
      reglasNegocio: [
        'Validación de headers requeridos por hoja',
        'Detección de funciones ausentes',
        'Smoke básico: conteo de filas y existencia de hojas',
        'Smoke financiero: ejecución de previsualizaciones sin destructing',
        'Smoke dinámico: validación de recargo con caso crítico conocido'
      ],
      funcionesCriticas: [
        'v3QaSmokeBasico',
        'v3QaSmokeFinanciero2026',
        'v3QaSmokeCompleto2026',
        'v3QaSmokeDinamicoSaldoParcialRecargo',
        'v3QaReadHeaders_',
        'v3QaCheckHeaders_'
      ],
      dependeDe: [
        '01_V3_Core.gs.js (implícito vía asegurarHoja, leerConfig)',
        '03_V3_Sync.gs.js (v3SyncPrevisualizarAlumnosDesdeFuente)',
        '07_V3_Charges.gs.js (v3ChargesPreviewFeb2026)',
        '08_V3_Reversals.gs.js (v3ReversalsPrevisualizarMora, v3ReversalsActualizarRecargoEnFila_)',
        '09_V3_Statements.gs.js (v3StatementsConstruirEstadosCuenta)',
        '10_V3_PortalExport.gs.js (v3PortalExportGenerar)',
        'SpreadsheetApp',
        'Logger'
      ],
      dependientes: [
        'Ninguno directo (módulo de testing)'
      ],
      flujoCompartido: [
        'Validación pre-operativa de arquitectura',
        'Testing de casos críticos sin data real',
        'Verificación de presencia de dependencias'
      ],
      conflictos: {
        confirmados: [
          'v3QaCheckHeaders_ busca alternativas solo si requiredHeaders vacío; lógica de alternativas ambigua.',
          'v3QaSmokeDinamicoSaldoParcialRecargo mockea fakeSheet con métodos limitados; v3ReversalsActualizarRecargoEnFila_ podría fallar si usa métodos no implementados.',
          'Si funciones críticas existen pero tienen bugs silenciosos, smoke tests no los detectan (solo verifica presencia, no correctitud).',
          'No hay timeout para v3QaSmokeFinanciero2026; si v3ChargesPreviewFeb2026 cuelga >30s, bloquea QA completo.'
        ],
        hipotesis: [
          'Headers alternativos en ALUMNOS (Nombre_Alumno vs Nombre_Completo_Alumno) podrían producir falsos positivos de QA.',
          'Si hojas derivadas están vacías (0 filas), conteos mostrarán OK aunque pipeline esté roto.'
        ],
        pendientes: [
          'Implementar validación de cálculos (no solo estructura) en casos críticos.',
          'Añadir timeout GAS para smoke tests.',
          'Verificar no solo presencia sino correctitud de resultados de funciones.',
          'Histórico de resultados de QA para trending.'
        ]
      },
      diferencias: [
        {
          webDecia: 'QA era manual, sin testing automatizado.',
          scriptMuestra: 'Suite de smoke tests ejecutables desde Apps Script.',
          ajuste: 'Se reclasificó como módulo de validación automatizada, no solo auditoría manual.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo en estructura; medio en cobertura: no detecta bugs en funciones críticas, solo presencia/headers. Falsos positivos si datos incompletos.'
    },
    '21_V3_StageFlow.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 96,
      selloFinal: 'Orquestador escalonado con auditoría bloqueante y gestión de estado de reparación',
      veredicto: 'Pipeline modular de 5 etapas en cascada (importación → cargos → recargos → aplicación → consolidación) con auditoría transversal y bloqueo por estado REPAIR_REQUIRED.',
      queHace: [
        'Configura 5 etapas secuenciales: IMPORTACION_PAGOS, GENERACION_CARGOS, RECARGOS_VENCIMIENTOS, APLICACION_PAGOS, CONSOLIDACION_FINAL.',
        'Ejecuta each etapa con snapshot pre/post, ledger de ejecución, y auditoría bloqueante.',
        'Valida dependencias: etapa N solo corre si etapa N-1 audit = OK.',
        'Auditoría por etapa: detecta duplicados, referencias inconsistentes, cálculos incongruentes.',
        'Marca REQUIERE_RECONSTRUCCION_LIMPIA si auditoría bloqueante falla.',
        'Gestiona "active run" lock (30min timeout) para evitar paralelización.',
        'Ledger de trabajos (CONTROL_EJECUCION): run_id, etapa, período, estado, filas, duplicados, errores, duración.',
        'Ledger de incidentes (AUDITORIA_INCIDENTES): etapa, hoja, llave, regla, severidad, observación, acción recomendada.',
        'Modo manual bajo demanda con cascada completa o etapa individual.'
      ],
      queNoHace: [
        'No ejecuta lógica de dominio (eso delegado a funciones especializadas de cada etapa).',
        'No repara automáticamente; solo marca como requerido rebuild.',
        'No reintentos automáticos; bloquea en primera falla.',
        'No genera backups de datos (eso es responsabilidad de 19_V3_Fixes).',
        'No audita integridad de ALUMNOS ni REGLAS_COBRO (solo hojas derivadas).'
      ],
      entradas: [
        'Período (YYYY-MM, fallback desde CONFIG.PERIODO_OPERATIVO o hoy).',
        'Fecha de corte (fallback a hoy).',
        'Opciones: source, periodo, fechaCorte, allowWhenRepairRequired.',
        'Estado en ScriptProperties: V3_STAGEFLOW_REPAIR_REQUIRED (si presente, bloquea).'
      ],
      salidas: [
        'v3StageRunPipelineManual_: {version, source, periodo, fechaCorte, etapas{}, bloqueadoEn, status}.',
        'v3StageRunStage_: {ok, stage, execution, audit: {status, duplicates, incidents[], observacion}}.',
        'Ledger en CONTROL_EJECUCION: 11 columnas (run_id, fecha_hora, etapa, periodo, estado, etc).',
        'Incidentes en AUDITORIA_INCIDENTES: 9 columnas (fecha_hora, etapa, hoja, llave, regla, severidad, etc).',
        'ScriptProperties: V3_STAGEFLOW_ACTIVE_RUN (lock) y V3_STAGEFLOW_REPAIR_REQUIRED (si audit bloqueante).'
      ],
      hojas: [
        'CONTROL_EJECUCION (ledger de trabajos)',
        'AUDITORIA_INCIDENTES (ledger de incidentes)',
        'CARGOS_ESCOLARES, PAGOS_REPORTADOS, APLICACION_PAGOS, ESTADO_CUENTA_DETALLE/RESUMEN, PORTAL_PADRES_EXPORT, EXPORT_CONTABILIDAD, CONCILIACION'
      ],
      reglasNegocio: [
        '5 etapas en cascada: cada una valida dependencias previas',
        'Auditoría bloqueante por etapa: detiene si BLOCKING_ERROR encontrado',
        'REPAIR_REQUIRED marca: no permite ejecución hasta limpieza manual',
        'Snapshot pre/post: captura rowcounts de hojas target antes/después',
        'Ledger de trabajos: cada etapa = 2 filas (::EJECUTOR y ::AUDITOR)',
        'Incidents son ABIERTO si BLOCKING, OBSERVACION si WARNING',
        'Gate validation: dependencias previas deben estar OK para continuar'
      ],
      funcionesCriticas: [
        'v3StageRunPipelineManual_',
        'v3StageRunStage_',
        'v3StageExecute_ (dispatcher)',
        'v3StageAudit_ (dispatcher)',
        'v3StageAuditImportacionPagos_, v3StageAuditGeneracionCargos_, v3StageAuditRecargosVencimientos_, v3StageAuditAplicacionPagos_, v3StageAuditConsolidacionFinal_',
        'v3StagePruebaFuncional_',
        'v3StageValidateDependencies_',
        'v3StageOpenActiveRun_, v3StageCloseActiveRun_',
        'v3StageMarkRequiresCleanRebuild_, v3StageClearRepairRequired_'
      ],
      dependeDe: [
        '01_V3_Core.gs.js (asegurarHoja, leerConfig, valorSeguroTexto, generarId, etc)',
        '03_V3_Sync.gs.js (v3SyncPrevisualizarAlumnosDesdeFuente)',
        '05_V3_Payments.gs.js (v3PaymentsImportarPagosReportadosDesdeFormulario)',
        '07_V3_Charges.gs.js (v3ChargesPreviewFeb2026, v3ChargesGenerarCargosPeriodo)',
        '08_V3_Reversals.gs.js (v3ReversalsAplicarMora, v3ReversalsConstruirContexto_, v3ReversalsResolverReglaParaCargo_)',
        '09_V3_Statements.gs.js (v3StatementsConstruirEstadosCuenta)',
        '10_V3_PortalExport.gs.js (v3PortalExportGenerar)',
        '18_V3_Conciliacion.gs.js (v3ConciliacionGenerar)',
        'SpreadsheetApp, LockService, PropertiesService, Utilities, Session'
      ],
      dependientes: [
        '16_V3_Automation.gs.js (v3AutomationEjecutarFlujoFinanciero_ → v3StageRunPipelineManual_)',
        '12_V3_ResetMensual.gs.js (v3StagePruebaFuncional_)',
        '90_V3_Runners.gs.js (all 5 etapas invocables vía v3StageRunStage_)'
      ],
      flujoCompartido: [
        'Pipeline central de ejecución financiera mensual',
        'Auditoría transversal post-cada-etapa con bloqueo por severidad',
        'Gestión de estado REPAIR_REQUIRED para coordinación entre ciclos',
        'Ledger auditable de todas las ejecuciones'
      ],
      conflictos: {
        confirmados: [
          'v3StageGetLastAuditStatus_ busca "::AUDITOR" pero si etapa nunca se ejecutó, retorna null (ambiguo si = OK o nunca corrió).',
          'Snapshot pre/post no valida consistencia durante ejecución; si stage falla midway, snapshot reflejará estado inconsistente.',
          'Si v3StageExecute_ delega a función que no existe (ej. v3PaymentsImportarPagosReportadosDesdeFormulario ausente), retorna {omitido: true} sin error.',
          'Audit compara resumen vs detalle por alumno con epsilon 0.01; puede no detectar errores < 1 centavo.',
          'REPAIR_REQUIRED lock usa ScriptProperties sin versionado; si 2 usuarios marcan simultáneamente, última sobrescribe.',
          'Active run lock TTL = 180 min; si GAS timeout < 180min y no limpia lock, siguiente etapa se bloquea.'
        ],
        hipotesis: [
          'Alto volumen de incidentes (>5k) puede causar timeout en append a AUDITORIA_INCIDENTES.',
          'Snapshot rowcounts no detectan dato corrupto (solo cambio de cantidad).',
          'Auditoría de consolidación asume v3PortalExportResolverMontoContable_ disponible; si no existe, export audit silenciosa.'
        ],
        pendientes: [
          'Implementar retry automático con backoff exponencial.',
          'Versionado de REPAIR_REQUIRED con timestamp y usuario.',
          'Limpieza automática de ledger (mantener últimos 30 días).',
          'Alertas de TTL en active run (e-mail si >150min).',
          'Validación de integridad de origen antes de auditoría (no solo derivadas).'
        ]
      },
      diferencias: [
        {
          webDecia: 'Pipeline era un flujo manual disparado por runX independientes.',
          scriptMuestra: 'Pipeline orquestado con cascada automática, validación de dependencias, auditoría bloqueante.',
          ajuste: 'Se reclasificó como orquestador central que integra todas las etapas, no solo disparador de funciones.'
        },
        {
          webDecia: 'Auditoría era posterior y no bloqueante.',
          scriptMuestra: 'Auditoría es inmediata post-etapa y bloqueante si BLOCKING_ERROR.',
          ajuste: 'Se cambió modelo a auditoría integral y preventiva.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Medio: orquestación central compleja, lock management susceptible a fallo si timeout GAS < 180min, auditoría defensiva pero sin retry automático.'
    },
    '90_V3_Runners.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 94,
      selloFinal: 'Librería de wrappers ejecutables (runX) para orquestación manual y automática de flujos financieros',
      veredicto: 'Suite de 124+ wrappers (runX_*) organizados por temática (Schema, Config, Sync, Payments, Charges, Mora, Aplicaciones, Estados, Portal, Rebuilds, Flujos, Auditorías). Delegadores a funciones especializadas con manejo de configuración y estado de reparación.',
      queHace: [
        'Expone 124+ funciones runX_* (índices 00-124) como puntos de entrada manual/automática para ejecución.',
        'Clasificación por temática: bootstrap (0-8), validación (10-12), carga (13-25), charges (40-49), mora (50-51), aplicaciones (60-62), estados/portal (70-73), flujos (80-92), reparación/auditoría (93-124).',
        'Wraps llamadas a funciones especializadas con validación existencia (typeof check) y fallback a {omitido: true}.',
        'Delegadores a 21_V3_StageFlow (run100-105 etapas, run106 prueba funcional) y a 21 v3StageRunStage_.',
        'Helpers internos: periodosSeguro_, hojasFlujoCompleto_, limpiarHojasFlujoCompleto_, textoNormalizado_, normalizarPeriodo_, headerMap_, forzarRecargosVencidosPeriodo_.',
        'Flujos complejos: flujoMesControlado_, flujoMesCompleto_, secuenciaMesPagosEstadosExport_, rebuilds controlados.',
        'Auditoría especial run114 (descuento vs recargo), run119 (control cálculos), run108/106 (evidencia/prueba funcional).',
        'Constantes V3_RUNNERS_DEFAULTS (períodos de prueba, fechas corte) y V3_RUNNERS_DERIVADAS_CONTROLADAS (5 hojas regen).',
        'Modo reparación legacy: propiedades REPAIR_FLAG_KEY, RUN98 backup stamps, ventana 30min.',
        'run98 freezeYRespaldar: elimina todos triggers, backupea 7 hojas derivadas, marca timestamp evidencia.'
      ],
      queNoHace: [
        'No ejecuta lógica de dominio; solo delegation a especializadas.',
        'No maneja datos directamente; depende de SpreadsheetApp + helpers core.',
        'No validación de integridad de origen (ALUMNOS, REGLAS_COBRO); solo verifica presencia hoja.',
        'No implementa auditoría propria; delega a v3QaSmokeCompleto2026 y v3StagePruebaFuncional_.',
        'No retry automático en fallos; bloquea en TypeError o resultado {omitido: true}.',
        'No limpia propiedades stale de ScriptProperties (legacy backup stamps pueden acumular).'
      ],
      entradas: [
        'Período: formato YYYY-MM, fallback a V3_RUNNERS_DEFAULTS.PERIODO_PRUEBA (2026-04).',
        'Fecha corte: valor string o Date, fallback a FECHA_CORTE_DEFAULT (2026-04-06).',
        'Opciones por flujo: {limpiarDerivadas, aplicarPagos, source, periodo, fechaCorte, dryRun}.',
        'Modo parámetro: modo (SI, NO, CLEAR, LIMPIAR) para control legacy repair flag.',
        'Configuración implícita: V3_RUNNERS_DEFAULTS, V3_RUNNERS_DERIVADAS_CONTROLADAS, V3_LEGACY_GUARDRAIL.'
      ],
      salidas: [
        'Cada runX retorna {version, source?, period?, pasos{}, executedAt} o {ok, ...}.',
        'run0-19: {ok, creadaAsegurada?, headers?} o {omitido: true}.',
        'run20-124: {pasos{previewX, generateX, ...}, executedAt}.',
        'Helpers retornan estructuras tipadas: {hojas[], fila[], periodos{}, summary{}}, o {error}.',
        'Legacy guardrail: {ok, key, value, accion}.'
      ],
      hojas: [
        'Source sheets: ALUMNOS (config), REGLAS_COBRO (configuración), PAGOS_REPORTADOS_FUENTE (external)',
        'Primary: CARGOS_ESCOLARES, PAGOS_REPORTADOS, APLICACION_PAGOS',
        'Derived: ESTADO_CUENTA_DETALLE, ESTADO_CUENTA_RESUMEN, CONCILIACION, PORTAL_PADRES_EXPORT, EXPORT_CONTABILIDAD',
        'Control: CONTROL_EJECUCION (si ledger), AUDITORIA_INCIDENTES (si incidents)'
      ],
      reglasNegocio: [
        'Período válido: formato YYYY-MM obligatorio; se rechaza si no cumple.',
        'Normalización período: entradas con 1-2 dígitos en mes se normalizan a 2 dígitos (2026-3 → 2026-03).',
        'Conceptos financieros: MENSUALIDAD o PLATAFORMA; otros ignorados en auditoría de recargos.',
        'Recargo esperado: 10% de base (o base-descuento si aplica) redondeado a 2 decimales.',
        'Saldo pendiente: si ≤ 0.00001 se considera pagado (epsilon comparison).',
        'Flujo limpieza derivadas: clearContent + deleteRows (idempotente si vacía).',
        'Flujo rebuild: limpia + regenera (no selectivo por período si no se especifica).',
        'Estado cargo permitidos: sin estado, ANULADO, CANCELADO, REVERSADO, Con_Recargo, etc. (case-insensitive).',
        'V3 Mode Legacy repair flag: SI, NO, CLEAR, LIMPIAR; persistence en ScriptProperties sin versionado.'
      ],
      funcionesCriticas: [
        'v3RunnersPeriodoSeguro_ (validación período)',
        'v3RunnersHojasFlujoCompleto_ (enumeración derivadas)',
        'v3RunnersLimpiarHojasFlujoCompleto_ (limpieza batch)',
        'v3RunnersTextoNormalizado_, v3RunnersNormalizarPeriodo_ (normalización)',
        'v3RunnersHeaderMap_, v3RunnersFindCol_ (introspección)',
        'v3RunnersForzarRecargosVencidosPeriodo_ (auditoría recargos vencidos)',
        'v3RunnersResetFlujoCompletoSoloFebrero_ (reset orquestado)',
        'v3RunnersLimpiarDerivadasControladas_, v3RunnersReconstruirDerivadas_, v3RunnersRebuildControladoDerivadas_ (rebuild paths)',
        'v3RunnersSecuenciaMesPagosEstadosExport_, v3RunnersSecuenciaOperativaMesUnico_, v3RunnersFlujoMesControladoUnico_ (flujos complejos)',
        'run0-124 (124 entry points)'
      ],
      dependeDe: [
        '01_V3_Core.gs.js (asegurarHoja, obtenerHojaPorNombre, normalizarFecha, hoySinHora, valorSeguroTexto, generarId)',
        '05_V3_Payments.gs.js (v3PaymentsPrevisualizarImportacion, v3PaymentsImportarPagosReportadosDesdeFormulario)',
        '07_V3_Charges.gs.js (v3ChargesPrevisualizarCargosPeriodo, v3ChargesGenerarCargosPeriodo, v3ChargesAsegurarHeaders_, v3ChargesPrevisualizarReconstruccionHistorica, v3ChargesGenerarReconstruccionHistorica)',
        '08_V3_Reversals.gs.js (v3ReversalsPrevisualizarMora, v3ReversalsAplicarMora)',
        '09_V3_Statements.gs.js (v3StatementsConstruirEstadosCuenta, v3StatementsConstruirEstadoCuentaDetalle/Resumen, v3StatementsConstruirPortalPadresExport)',
        '10_V3_PortalExport.gs.js (v3PortalExportGenerar, v3PortalExportGenerarExportContabilidad, v3PortalExportGenerarPortalPadresExport)',
        '12_V3_ResetMensual.gs.js (v3ResetMensualPrepararBase_, v3ResetMensualCompletarCargosEscolares_, v3ResetMensualAplicarPagosPendientes_, v3ResetMensualAplicarMora_, v3ResetMensualRegularizarRecargos_)',
        '16_V3_Automation.gs.js (v3AutomationConfigurarTriggersDual, v3AutomationEliminarTriggersDual, v3AutomationRunMasterManual)',
        '17_V3_PortalAPI.gs.js (v3PortalApiGetSystemStatus_, v3PortalApiGetPublicUrl, v3PortalApiGenerarContrasenas)',
        '18_V3_Conciliacion.gs.js (v3ConciliacionGenerar)',
        '20_V3_QA_Smoke.gs.js (v3QaSmokeCompleto2026)',
        '21_V3_StageFlow.gs.js (v3StageRunStage_, v3StageRunPipelineManual_, v3StagePruebaFuncional_, v3StageEnsureControlSheets_)',
        'SpreadsheetApp, ScriptApp, Session, Utilities, PropertiesService, Logger'
      ],
      dependientes: [
        '16_V3_Automation.gs.js (run94, run90, run93 como handlers de triggers)',
        'Manual execution via Apps Script editor (all runX endpoints)',
        'Google Sheets Custom Menus (if configured)'
      ],
      flujoCompartido: [
        'Suite de entry points organizados por función (bootstrap, validation, operations, audits)',
        'Centraliza acceso a todas las operaciones financieras mensuales',
        'Delegación a etapas especializadas: importación → cargos → recargos → aplicación → consolidación',
        'Soporte a flujos totales (reset completo febrero) vs parciales (solo recargos, solo pagos)',
        'Auditoría integral con helpers de validación'
      ],
      conflictos: {
        confirmados: [
          'Funciones internas v3Runners* (v3RunnersResumenControlEjecucion_, v3RunnersEstadoRepairRequired_, v3RunnersSaldoDesdeDetalle_, etc.) NO están implementadas en 90. Se invocan como si existieran pero no hay definición. Causaría ReferenceError si se ejecutan run106-108.',
          'Helper v3RunnersFindCol_ se invoca en run114 (line 1012) pero no está definido en 90 ni en core (solo v3RunnersHeaderMap_ definido).',
          'Constante CARGOS_ESCOLARES se usa sin verificar si está definida globalmente; fallback a string literal puede causar desalineación con hoja real.',
          'run60B_AplicacionesPreviewCorreccionErradas, run60C_AplicacionesAplicarCorreccionErradas, run60A_AplicacionesPreviewPendientes, run49A_ChargesGenerateMarzo, run31B_PaymentsManualImport, runModoReconstruccionLimpiaCasoActual, runCicloMensualNuevo se invocan en run84-107 pero no existen (sin implementación).',
          'run22-25 delegan a v3RunnersFlujoMesControladoUnico_, v3RunnersRebuildControladoDerivadas_, v3RunnersSecuenciaOperativaMesUnico_ sin validar si están definidas.',
          'Legacy repair flag stored en ScriptProperties sin versionado; si 2 usuarios set simultáneamente, último gana (data loss).',
          'v3RunnersLimpiarHojasFlujoCompleto_ usa deleteRows() que es irreversible; si falla mid-delete, datos parcialmente perdidos.'
        ],
        hipotesis: [
          'Funciones v3Runners* stub (internals) pueden estar previstos para implementarse en scripts posteriores (ej. 91-89) no cotejados aún.',
          'Compatibilidad dual con V3_RESET_MENSUAL.SHEETS_TO_CLEAR sugiere legacy code migration; puede haber conflicto si ambas rutas activas.',
          'run114 línea 1012 usa v3RunnersFindCol_ que no está definida; probablemente olvidada en refactor de headerMap.',
          'run98 (run98_CongelarYRespaldarDerivadas) es único en deleteRows(ALL triggers) sin selectividad; puede romper otros triggers si se ejecuta durante operación.'
        ],
        pendientes: [
          'Implementar todas las funciones v3Runners* stub o marcarlas como omitidas explícitamente.',
          'Implementar v3RunnersFindCol_, v3RunnersFlujoMesCompleto_, v3RunnersRepararRecargoSinDescuento_.',
          'Versionar repair flag con timestamp y usuario para auditar cambios.',
          'Agregar backup pre-delete en v3RunnersLimpiarHojasFlujoCompleto_.',
          'Documentar lista de stubs vs implementados para evitar invocaciones erróneas.',
          'Crear test suite para validar que todas las invocaciones dentro de runX existen (linter dinámico).'
        ]
      },
      diferencias: [
        {
          webDecia: 'Runners eran 50 funciones de orquestación simple.',
          scriptMuestra: 'Runners es suite de 124+ entry points con flujos complejos (reset, rebuild, audit, repair).',
          ajuste: 'Se clasificó como librería de delegación + helpers, no solo wrappers simples.'
        },
        {
          webDecia: 'Limpieza de hojas era manual o en triggers simples.',
          scriptMuestra: 'Limpieza batch centralizada con clearContent + deleteRows en v3RunnersLimpiarHojasFlujoCompleto_.',
          ajuste: 'Se reclasificó como operación destructiva controlada, requiere aprobación manual.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true,
        notaStubs: 'Funciones v3Runners* stub no implementadas en 90; requieren revisión antes de ejecución de run106-109.'
      },
      riesgoInterpretacion: 'Medio-alto: 124 entry points con stubs sin implementación en 90 (v3RunnersResumenControlEjecucion_ et al.), helpers faltantes (v3RunnersFindCol_), operaciones destructivas (deleteRows) sin backup, legacy repair flag sin versionado.'
    },
    '98_V3_GuardianRepair.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 95,
      selloFinal: 'Reparador de datos guardian: sincroniza maestro ALUMNOS con derivadas CARGOS_ESCOLARES y CONCILIACION',
      veredicto: 'Módulo defensivo de reparación que copia nombre y grado desde ALUMNOS (maestro) a CARGOS_ESCOLARES y calcula diferencia (cargo-pagado) en CONCILIACION. Inspección de headers, reparación batch, manejo de hojas legacy.',
      queHace: [
        'v3GuardianInspectHeaders: lista encabezados reales en ALUMNOS, CARGOS_ESCOLARES, CONCILIACION.',
        'v3GuardianRepairAll: orquesta repair de cargos + repair de conciliación con lock exclusivo 30s.',
        'v3GuardianRepairCargos: copia nombre_alumno y grado desde ALUMNOS a cada fila de CARGOS_ESCOLARES.',
        'v3GuardianRepairConciliacion: copia nombre_alumno desde ALUMNOS y calcula diferencia = cargo - pagado.',
        'v3GuardianListLegacySheets: reporta presencia de hojas obsoletas (ESTADO_DE_CUENTA, LINKS_PAGO_FAMILIAS) sin modificarlas.',
        'v3GuardianBuildAlumnosMap_: lee ALUMNOS y crea índice {id_alumno -> {nombre, grado}}.',
        'Manejo flexible de encabezados: soporta variantes Nombre_Alumno vs Nombre_Completo_Alumno.',
        'Conversión tipada: normaliza strings, números, redondeo a 2 decimales.'
      ],
      queNoHace: [
        'No valida integridad de ALUMNOS (ej. IDs duplicados, inconsistencias).',
        'No audita cambios (sin logging de qué se reparó, usuario, timestamp).',
        'No maneja hojas legacy (ESTADO_DE_CUENTA, LINKS_PAGO_FAMILIAS); solo reporta existencia.',
        'No repara PAGOS_REPORTADOS, APLICACION_PAGOS, ESTADO_CUENTA_DETALLE/RESUMEN, PORTAL_PADRES_EXPORT, EXPORT_CONTABILIDAD.',
        'No valida que los valores en ALUMNOS sean correctos (se asume maestro como verdad absoluta).',
        'No sobreescribe si campo destino ya tiene valor; solo mapea sin merge intelligente.',
        'No maneja conflictos si ID_Alumno no existe en ALUMNOS (deja célula vacía).'
      ],
      entradas: [
        'ALUMNOS hoja: debe tener encabezados ID_Alumno, (Nombre_Alumno|Nombre_Completo_Alumno), Grado.',
        'CARGOS_ESCOLARES hoja: debe tener encabezados ID_Alumno, Nombre_Alumno, Grado.',
        'CONCILIACION hoja: debe tener encabezados ID_Alumno, Nombre_Alumno, Monto_Cargo, Monto_Pagado, Diferencia.',
        'Lock timeout: 30 segundos para exclusión mutua en v3GuardianRepairAll.',
        'Sin parámetros funcionales (solo variables globales V3_GUARDIAN, sheet names).'
      ],
      salidas: [
        'v3GuardianInspectHeaders: {version, hojas{ALUMNOS, CARGOS, CONCILIACION: {existe, headers[]}}}.',
        'v3GuardianRepairAll: {version, cargos{hoja, filas, reparadas}, conciliacion{...}}.',
        'v3GuardianRepairCargos: {hoja, filas, reparadas}.',
        'v3GuardianRepairConciliacion: {hoja, filas, reparadas}.',
        'v3GuardianListLegacySheets: {version, legacy[{hoja, existe}]}.',
        'Hojas destino modificadas: Nombre_Alumno y Grado en CARGOS; Nombre_Alumno y Diferencia en CONCILIACION.',
        'Formato aplicado: @ (texto) para nombres/grados, #,##0.00 (decimal 2) para diferencias.'
      ],
      hojas: [
        'ALUMNOS (maestro de entrada)',
        'CARGOS_ESCOLARES (destino reparación)',
        'CONCILIACION (destino reparación)',
        'ESTADO_DE_CUENTA, LINKS_PAGO_FAMILIAS (legacy, reportadas pero no tocadas)'
      ],
      reglasNegocio: [
        'Maestro único: ALUMNOS es verdad absoluta; cualquier inconsistencia se resuelve copiando de ahí.',
        'Reparación batch: todas las filas se procesan; no hay filtro selectivo.',
        'Lock exclusivo: solo una instancia de v3GuardianRepairAll puede ejecutar simultáneamente (30s TTL).',
        'Diferencia: cargo - pagado redondeado a 2 decimales con epsilon correction.',
        'Nombre flexible: búsqueda por Nombre_Alumno primero, fallback a Nombre_Completo_Alumno.',
        'ID obligatorio: si ID_Alumno vacío en alumno destino, no mapea (genera fila vacía).',
        'Headers obligatorios: error si falta encabezado clave; no es silent.',
        'Formato tipado: nombre/grado = texto (@), diferencia = moneda (#,##0.00).'
      ],
      funcionesCriticas: [
        'v3GuardianRepairAll (orquestador)',
        'v3GuardianRepairCargos (batch update CARGOS)',
        'v3GuardianRepairConciliacion (batch update CONCILIACION + cálculo)',
        'v3GuardianBuildAlumnosMap_ (lectura maestro)',
        'v3GuardianGetHeaders_ (introspección)',
        'v3GuardianNeedHeader_, v3GuardianFindHeaderAny_ (búsqueda headers flexible)'
      ],
      dependeDe: [
        'SpreadsheetApp (getActive, getSheetByName, getRange, setValues, setNumberFormat)',
        'LockService (getDocumentLock, waitLock, releaseLock)',
        'Logger (log)',
        'Math (round, EPSILON)',
        'Globals: V3_GUARDIAN constant'
      ],
      dependientes: [
        'run98_CongelarYRespaldarDerivadas (en 90_V3_Runners, aunque no referencia directa).',
        'Manual execution via Apps Script editor (v3GuardianRepairAll, etc.)',
        'Potencialmente triggers configurados externamente'
      ],
      flujoCompartido: [
        'Reparación defensiva de datos después de operaciones batch (charges, aplicaciones, etc).',
        'Sincronización unidireccional maestro → derivadas.',
        'Auditoría de integridad por copiado de valores clave.',
        'Soporte a hojas legacy (detección pero no erradicación).'
      ],
      conflictos: {
        confirmados: [
          'No hay auditoría de cambios: no se registra quién/cuándo reparó ni qué valores se sobrescribieron.',
          'Lock de 30s es corto si hay >10k filas (risk de timeout mid-repair).',
          'Si ALUMNOS tiene duplicados de ID_Alumno, map último gana (silenciosamente).',
          'Formato hardcoded (@, #,##0.00) sin flexibilidad según locale/configuración.',
          'Si headers falta, error bloqueante sin sugerencias de recuperación.',
          'Diferencia en CONCILIACION recalculada cada repair; sobrescribe valores históricos o auditados.'
        ],
        hipotesis: [
          'Guardian es preventivo de data drift pos-operacionales; se ejecuta regularmente (manual o trigger).',
          'Lock strategy indica contención esperada (múltiples triggers/usuarios simultáneos).',
          'Hojas legacy ESTADO_DE_CUENTA, LINKS_PAGO_FAMILIAS son obsoletas; listarse pero no usarse en flujos activos.'
        ],
        pendientes: [
          'Implementar auditoría: log de reparaciones con timestamp, usuario, antes/después.',
          'Aumentar timeout lock a 60-120s o hacer reparación por chunks (reduce risk timeout).',
          'Validar ALUMNOS pre-repair (duplicados, IDs nulos).',
          'Permitir configuración de headers y formato (no hardcoded).',
          'Mejor mensajes de error: sugerir headers faltantes alternativos.',
          'Marcar reconciliaciones reparadas vs auditadas (para auditoría).'
        ]
      },
      diferencias: [
        {
          webDecia: 'Guardián era inspeccionador inerte (solo read headers).',
          scriptMuestra: 'Guardián es reparador activo: copia datos, calcula, formatea.',
          ajuste: 'Se reclasificó como módulo de repair+maintenance, no solo auditoría pasiva.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true
      },
      riesgoInterpretacion: 'Bajo-medio: reparación batch sin auditoría, lock timeout corto (30s), headers obligatorios pero sin validación de contenido maestro.'
    },
    '99_V3_OrquestadorContable.gs.js': {
      cotejoEstado: 'COTEJADO',
      confianza: 'Confirmado por código',
      fidelidad: 93,
      selloFinal: 'Orquestador contable maestro: flujo completo 5-etapas con auditoría embebida',
      veredicto: 'Ejecutor secuencial de pipeline contable: cargos → pagos → reversos → estados detalle+resumen → portal. Auditoría integrada, manejo de alertas, diagnóstico pre-ejecución. Diseño defensivo con validación de función disponible antes de invocar.',
      queHace: [
        'v3OrquestadorContable: orquesta 6 pasos: (1) cargos si nuevos, (2) pagos si pendientes, (3) reversos/mora, (4) estado detalle, (5) estado resumen, (6) portal export.',
        'Validación inteligente: preview cargos antes de generar (evita duplicados); detecta pagos pendientes antes de aplicar.',
        'Auditoría integrada: registra cada hito y alertas detectadas.',
        'Manejo de errores: try/catch con logging y registrarAuditoria en error.',
        'v3OrquestadorDiagnostico: previsualiza sin ejecutar (cargos, pagos pendientes, reversos).',
        'v3OrquestadorDetectarPagosPendientes_: helper stub (retorna 0 por ahora, placeholder para lógica real).',
        'Período actual automático: YYYY-MM derivado de Date actual.',
        'Alertas contextuales: extrae warnings de cada etapa y consolida en resumen.'
      ],
      queNoHace: [
        'No valida integridad de datos pre-ejecución (ej. ALUMNOS duplicados, REGLAS_COBRO inconsistentes).',
        'No implementa reintentos automáticos si etapa falla.',
        'No genera reportes visuales; solo logging y resumen estructurado.',
        'No paralleliza etapas (ejecución estrictamente secuencial).',
        'No implementa rollback si etapa N falla (etapas previas ya ejecutadas).',
        'No audita datos históricos (solo eventos, no snapshots pre/post).',
        'v3OrquestadorDetectarPagosPendientes_ está stubado (retorna 0); lógica real no implementada.',
        'No soporta período específico (siempre usa período actual).',
        'No maneja transacciones o bloqueos entre etapas.'
      ],
      entradas: [
        'Período: automático desde Date.now() (YYYY-MM).',
        'Sin parámetros de usuario; solo variables globales implícitas (v3Charges*, v3Applications*, v3Reversals*, v3Statements*, v3PortalExport*).',
        'Disponibilidad de funciones: verifica con typeof check antes de invocar.',
        'Datos de entrada: PAGOS_REPORTADOS (para aplicaciones), CARGOS_ESCOLARES (cargos), ALUMNOS (maestro).'
      ],
      salidas: [
        'v3OrquestadorContable: {cargos, pagos, reversos, detalle, resumen, portal, alertas[]}.',
        'Cada sub-campo contiene estructura específica de etapa (ej. cargos.cargosNuevos, pagos.errores, etc.).',
        'Alertas: array de strings consolidados de warnings.',
        'Auditoría: registro en hoja AUDITORIA_INCIDENTES (o similar) vía registrarAuditoria().',
        'v3OrquestadorDiagnostico: {cargos, pagos (número), reversos, diagnostico}.'
      ],
      hojas: [
        'CARGOS_ESCOLARES (lectura/escritura)',
        'PAGOS_REPORTADOS (lectura)',
        'APLICACION_PAGOS (escritura)',
        'ALUMNOS (lectura)',
        'REGLAS_COBRO (lectura implícita)',
        'ESTADO_CUENTA_DETALLE (escritura)',
        'ESTADO_CUENTA_RESUMEN (escritura)',
        'PORTAL_PADRES_EXPORT (escritura)',
        'EXPORT_CONTABILIDAD (potencial)',
        'AUDITORIA_INCIDENTES (auditoría)'
      ],
      reglasNegocio: [
        'Período vigente: derivado automáticamente de Date.now().',
        'Cargos: solo generan si existen cargosNuevos > 0 (evita re-generación).',
        'Pagos: solo aplican si v3OrquestadorDetectarPagosPendientes_() > 0.',
        'Reversos: siempre se ejecutan (no hay guard condicional).',
        'Estados: siempre reconstruyen (operación idempotente esperada).',
        'Auditoría: ambos OK y ERROR registrados; permite trazabilidad completa.',
        'Alertas: consolidadas de warnings en cada etapa.',
        'Orden secuencial inmutable: cargos → pagos → reversos → estados → portal.'
      ],
      funcionesCriticas: [
        'v3OrquestadorContable (main orchestrator)',
        'v3OrquestadorDiagnostico (diagnostic runner)',
        'v3OrquestadorDetectarPagosPendientes_ (helper, stubado)',
        'v3ChargesPrevisualizarCargosPeriodo, v3ChargesGenerarCargosPeriodo',
        'v3ApplicationsAplicarPagosPendientes',
        'v3ReversalsAplicarMora, v3ReversalsPrevisualizarMora',
        'v3StatementsConstruirEstadoCuentaDetalle, v3StatementsConstruirEstadoCuentaResumen',
        'v3PortalExportGenerarPortalPadresExport',
        'registrarAuditoria (01_V3_Core)'
      ],
      dependeDe: [
        '01_V3_Core.gs.js (registrarAuditoria)',
        '07_V3_Charges.gs.js (v3ChargesPrevisualizarCargosPeriodo, v3ChargesGenerarCargosPeriodo)',
        '06_V3_Applications.gs.js (v3ApplicationsAplicarPagosPendientes)',
        '08_V3_Reversals.gs.js (v3ReversalsAplicarMora, v3ReversalsPrevisualizarMora)',
        '09_V3_Statements.gs.js (v3StatementsConstruirEstadoCuentaDetalle, v3StatementsConstruirEstadoCuentaResumen)',
        '10_V3_PortalExport.gs.js (v3PortalExportGenerarPortalPadresExport)',
        'Logger, Date, Math'
      ],
      dependientes: [
        'Manual execution via Apps Script editor (v3OrquestadorContable, v3OrquestadorDiagnostico)',
        'Potencial trigger horario (hourly, daily, etc.)',
        '16_V3_Automation (si se integra en automation handler)',
        '90_V3_Runners (como wrappers run* futuros)'
      ],
      flujoCompartido: [
        'Punto de entrada unificado para ciclo financiero completo (no scripts individuales).',
        'Nexo entre importación de pagos y estados finales (export padres).',
        'Auditoría centralizada para toda la orquestación.',
        'Soporte a modo diagnóstico (dry-run preview sin cambios).'
      ],
      conflictos: {
        confirmados: [
          'v3OrquestadorDetectarPagosPendientes_ está stubada y siempre retorna 0; pagos nunca se aplican automáticamente.',
          'Sin período parametrizable; fecha actual hardcoded. Si se ejecuta manualmente con fecha antigua, generará cargos/pagos retroactivos sin intención.',
          'Reversals (mora) se aplican sin guard condicional; siempre se ejecutan aunque no haya cargos nuevos.',
          'Sin rollback si etapa N falla; etapas previas ya modificaron datos (inconsistencia posible).',
          'Auditoría via registrarAuditoria() supone que AUDITORIA_INCIDENTES existe; si no existe o registrarAuditoria no definida, error bloqueante.',
          'Warnings se extraen de manera inconsistente: cargos.warnings, pagos.errores, reversos.warnings (tipos mixtos).',
          'Sin lock entre orquestador e intentos concurrentes (2 usuarios podrían ejecutar en paralelo, causing duplicate charges/applications).',
          'Diagnóstico invoca v3OrquestadorDetectarPagosPendientes_ pero espera entero; retorna 0 siempre, diagnóstico sesgado.'
        ],
        hipotesis: [
          'Stub v3OrquestadorDetectarPagosPendientes_ es placeholder para lógica compleja futura (ej. consultar PAGOS_REPORTADOS sin aplicar).',
          'Período hardcoded es por diseño para ciclos mensuales automáticos; ejecución manual debería ser vigilada.',
          'Reversals sin guard es porque mora debe aplicarse siempre que hay cargos vencidos (no condicional).',
          'Rollback no implementado porque cada etapa es idempotente (si se ejecuta 2x, resultado igual).'
        ],
        pendientes: [
          'Implementar v3OrquestadorDetectarPagosPendientes_ con lógica real (consultar PAGOS_REPORTADOS).',
          'Agregar parámetro periodo: v3OrquestadorContable(period) para soportar ciclos históricos.',
          'Implementar lock exclusivo (LockService) para prevenir paralelización accidental.',
          'Agregar guard condicional para Reversals (ej. solo si cargos.ok).',
          'Implementar rollback automático o al menos marcar en auditoría si etapa falla.',
          'Normalizar extracción de warnings (interface consistent para todas las etapas).',
          'Agregar snapshots pre/post para auditoría de cambios.',
          'Validar disponibilidad de registrarAuditoria y AUDITORIA_INCIDENTES pre-ejecución.'
        ]
      },
      diferencias: [
        {
          webDecia: 'Orquestador era lista de pasos manuales a seguir secuencialmente.',
          scriptMuestra: 'Orquestador es función único que ejecuta cascada completa con auditoría.',
          ajuste: 'Se reclasificó como orquestador automatizado, no manual workflow.'
        }
      ],
      matrizVerdad: {
        descripcionValidada: true,
        dependenciasValidadas: true,
        funcionesCriticasValidadas: true,
        conflictosValidados: true,
        flujoValidado: true,
        notaStub: 'v3OrquestadorDetectarPagosPendientes_ está stubada; requiere implementación real para activar aplicación automática de pagos.'
      },
      riesgoInterpretacion: 'Medio: stub en v3OrquestadorDetectarPagosPendientes_, sin rollback si falla etapa, sin lock concurrencia, período hardcoded, warnings inconsistentes, auditoría asumida sin validación.'
    }
  };

  init();

  function isElementVisible(node) {
    if (!node) return false;
    return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length);
  }

  function safeMermaidRun(nodes) {
    if (!window.mermaid || !Array.isArray(nodes)) return;
    const visibleNodes = nodes.filter(node => node && node.isConnected && isElementVisible(node));
    if (!visibleNodes.length) return;

    Promise.resolve(mermaid.run({ nodes: visibleNodes })).catch(() => {
      // Evita romper la UI si Mermaid falla.
    });
  }

  function runActiveTabMermaid() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;
    safeMermaidRun(Array.from(activeTab.querySelectorAll('.mermaid')));
  }

  async function init() {
    wireTabs();
    wireFilters();
    wireNavigation();

    const [jsonText, mdText, reportsText] = await Promise.all([
      fetch('report_data.json').then(r => r.arrayBuffer()).then(buf => new TextDecoder('utf-8').decode(buf)),
      fetch('INFORME_EJECUTIVO_DETALLADO.md').then(r => r.arrayBuffer()).then(buf => new TextDecoder('utf-8').decode(buf)).catch(() => ''),
      fetch('result_reports.json').then(r => r.arrayBuffer()).then(buf => new TextDecoder('utf-8').decode(buf)).catch(() => '[]')
    ]);

    state.data = JSON.parse(jsonText);
    normalizeDataStrings(state.data);
    state.execMd = mdText || '';
    state.executionReports = parseExecutionReports(reportsText);
    state.scripts = enrichScripts((state.data.scripts || []).slice(), state.data.generatedAt || '');
    state.selected = state.scripts[0] || null;

    populateFilterOptions();
    applyHashSelection();
    renderAll();
    syncHashWithSelected();
  }

  function normalizeDataStrings(obj) {
    if (typeof obj !== 'object' || obj === null) return;

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = fixText(obj[key]);
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item => {
          if (typeof item === 'string') return fixText(item);
          if (typeof item === 'object' && item) normalizeDataStrings(item);
          return item;
        });
      } else if (typeof obj[key] === 'object') {
        normalizeDataStrings(obj[key]);
      }
    });
  }

  function enrichScripts(rawScripts, generatedAt) {
    const functionToScripts = new Map();

    rawScripts.forEach(script => {
      (script.functions || []).forEach(fn => {
        const current = functionToScripts.get(fn.name) || [];
        current.push(script.file);
        functionToScripts.set(fn.name, current);
      });
    });

    state.indexes.functionToScripts = functionToScripts;

    const downstream = new Map();
    const upstream = new Map();

    rawScripts.forEach(script => {
      const ownFunctions = new Set((script.functions || []).map(fn => fn.name));
      const downstreamSet = new Set();
      const upstreamSet = new Set();

      (script.calls || []).forEach(callName => {
        const targets = functionToScripts.get(callName) || [];
        targets.forEach(targetFile => {
          if (targetFile !== script.file) {
            downstreamSet.add(targetFile);
          }
        });
      });

      rawScripts.forEach(other => {
        if (other.file === script.file) return;
        const otherCalls = new Set(other.calls || []);
        const touchesScript = [...ownFunctions].some(fnName => otherCalls.has(fnName));
        if (touchesScript) {
          upstreamSet.add(other.file);
        }
      });

      downstream.set(script.file, [...downstreamSet]);
      upstream.set(script.file, [...upstreamSet]);
    });

    state.indexes.downstream = downstream;
    state.indexes.upstream = upstream;

    return rawScripts.map(script => {
      const file = script.file || 'sin_nombre';
      const scriptType = deriveScriptType(file, script);
      const severity = deriveSeverity(script);
      const status = deriveStatus(file, severity);
      const priority = derivePriority(file, severity, script);
      const maturity = deriveMaturity(file, severity);
      const score = deriveRiskScore(file, severity, script);
      const impactAreas = deriveImpactAreas(file, script);
      const affectedSheets = deriveAffectedSheets(file, impactAreas);
      const diagnosis = deriveDiagnosis(file, script, severity);
      const role = cleanText((script.indicadores || {}).rolModulo || buildRoleFromType(scriptType, impactAreas));
      const purpose = derivePurpose(file, script, impactAreas);
      const conclusion = deriveConclusion(file, severity, priority);
      const upstreamFiles = upstream.get(file) || [];
      const downstreamFiles = downstream.get(file) || [];
      const recommendedOrder = deriveInterventionOrder(file);
      const recommendation = (FILE_OVERRIDES[file] && FILE_OVERRIDES[file].recommendation) || deriveRecommendation(severity, file);
      const symptoms = deriveSymptoms(file, impactAreas, severity, downstreamFiles);
      const causes = deriveCauses(file, script, severity);
      const whatNotDo = deriveWhatNotDo(file, scriptType);
      const badPatterns = deriveBadPatterns(script);
      const rules = deriveBusinessRules(file, impactAreas);
      const history = deriveHistory(file, generatedAt);
      const glossary = deriveGlossary(file, impactAreas, scriptType);
      const criticalConstants = (script.constants || []).slice(0, 8).map(c => c.name);
      const totalFunctions = (script.functions || []).length;
      const orphanFunctions = deriveOrphanFunctions(script, upstreamFiles);
      const hardcodedFunctions = deriveHardcodedFunctions(script);
      const coupledFunctions = deriveCoupledFunctions(script);
      const fragileFunctions = deriveFragileFunctions(script, severity);
      const splitCandidates = deriveSplitCandidates(script);
      const protectedFunctions = deriveProtectedFunctions(file, script);
      const relatedFiles = uniqueList([...upstreamFiles, ...downstreamFiles]).slice(0, 8);

      return {
        ...script,
        scriptType,
        severity,
        status,
        priority,
        maturity,
        score,
        role,
        purpose,
        diagnosis,
        conclusion,
        impactAreas,
        affectedSheets,
        upstreamFiles,
        downstreamFiles,
        recommendedOrder,
        recommendation,
        symptoms,
        causes,
        whatNotDo,
        badPatterns,
        rules,
        history,
        glossary,
        criticalConstants,
        orphanFunctions,
        hardcodedFunctions,
        coupledFunctions,
        fragileFunctions,
        splitCandidates,
        protectedFunctions,
        relatedFiles,
        functionHealthSummary: {
          totalFunctions,
          orphan: orphanFunctions.length,
          hardcoded: hardcodedFunctions.length,
          coupled: coupledFunctions.length,
          fragile: fragileFunctions.length
        }
      };
    });
  }

  function renderAll() {
    renderSidebar();
    renderStats();
    renderContextHeader();
    renderTabsForSelected();
    renderExternalScriptReports();
    renderExternalResultsReports();
    activateTab(state.activeTab);
  }

  function renderSidebar() {
    const visible = getFilteredScripts();
    ui.scriptList.innerHTML = '';

    visible.forEach(script => {
      const link = document.createElement('a');
      link.className = 'script-btn' + (state.selected && state.selected.file === script.file ? ' active' : '');
      link.href = `#${buildScriptAnchor(script.file)}`;
      link.innerHTML = `${escapeHtml(script.file)} <span class="chip ${semaforoClass(script.severity)}">${escapeHtml(script.status.toUpperCase())}</span>`;
      link.onclick = event => {
        event.preventDefault();
        setSelectedScript(script, { updateHash: true, scrollToStatic: true });
      };
      ui.scriptList.appendChild(link);
    });

    if (!visible.length) {
      ui.scriptList.innerHTML = '<div class="muted-box small">No hay scripts que coincidan con los filtros actuales.</div>';
    }

    ui.totalScripts.textContent = `Scripts: ${visible.length}/${state.scripts.length}`;
  }

  function renderExternalScriptReports() {
    if (!ui.externalScriptsReview) return;
    const visible = getFilteredScripts();
    ui.externalScriptsReview.innerHTML = visible.map((script, index) => `
      <article id="${buildScriptAnchor(script.file)}" class="detail-block script-static-report">
        <div class="report-anchor-row">
          <h4>Reporte Estático – ${escapeHtml(script.file)}</h4>
          <a class="relation-pill" href="#top">Ir arriba</a>
        </div>
        <p class="small">Ancla estable: #${escapeHtml(buildScriptAnchor(script.file))}</p>
        <div class="detail-stack">
          <section class="section-card">${renderInformeTab(script)}</section>
          <section class="section-card">${renderDireccionTab(script)}</section>
          <section class="section-card">${renderSolucionesTab(script)}</section>
          <section class="section-card">${renderResumenTab(script)}</section>
          <section class="section-card">${renderFlujoTab(script, `static-${index}`)}</section>
          <section class="section-card">${renderConflictosTab(script)}</section>
          <section class="section-card">${renderDetalleTab(script, `static-${index}`)}</section>
        </div>
      </article>
    `).join('');
    safeMermaidRun(Array.from(ui.externalScriptsReview.querySelectorAll('.mermaid')));
  }

  function parseExecutionReports(rawText) {
    try {
      const parsed = JSON.parse(rawText || '[]');
      if (!Array.isArray(parsed)) return DEFAULT_EXECUTION_REPORTS.slice();
      if (!parsed.length) return DEFAULT_EXECUTION_REPORTS.slice();
      return parsed.map((entry, index) => ({
        id: entry.id || `result-${index + 1}`,
        fecha: cleanText(entry.fecha || 'Sin fecha'),
        titulo: cleanText(entry.titulo || 'Resultado sin título'),
        estado: cleanText(entry.estado || 'pendiente').toLowerCase(),
        alcance: cleanText(entry.alcance || 'global'),
        resumen: cleanText(entry.resumen || 'Sin resumen disponible.'),
        evidencia: Array.isArray(entry.evidencia) ? entry.evidencia.map(item => cleanText(item)) : [],
        siguientePaso: cleanText(entry.siguientePaso || 'Pendiente definir siguiente paso.')
      }));
    } catch (error) {
      return DEFAULT_EXECUTION_REPORTS.slice();
    }
  }

  function reportStateClass(status) {
    if (status === 'completado') return 'verde';
    if (status === 'bloqueado') return 'rojo';
    return 'amarillo';
  }

  function renderReportTemplateBlock() {
    const templateText = JSON.stringify(RESULT_REPORT_TEMPLATE, null, 2);
    return `
      <details class="result-template">
        <summary>Plantilla JSON para siguiente bloque</summary>
        <p class="small">Duplica este objeto dentro de result_reports.json, ajusta los campos y vuelve a publicar.</p>
        <pre class="wrap">${escapeHtml(templateText)}</pre>
      </details>
    `;
  }

  function getReportsForScript(script) {
    if (!script) return state.executionReports;
    return state.executionReports.filter(report => {
      const scope = (report.alcance || '').toLowerCase();
      return scope === 'global' || scope === script.file.toLowerCase();
    });
  }

  function renderResultadosTab(script) {
    const reports = getReportsForScript(script);
    if (!reports.length) {
      return '<h3>Informes de Resultados</h3><div class="muted-box">No hay informes registrados todavía para este script.</div>';
    }

    return `
      <h3>Informes de Resultados por Ejecución</h3>
      <p class="small">Bitácora para revisión externa y seguimiento de bloqueos/avances del script seleccionado.</p>
      ${renderReportTemplateBlock()}
      <div class="result-report-list">
        ${reports.map(report => `
          <article class="result-report-card status-card ${reportStateClass(report.estado)}">
            <header class="result-report-head">
              <h4>${escapeHtml(report.titulo)}</h4>
              <span class="chip ${reportStateClass(report.estado)}">${escapeHtml(report.estado.toUpperCase())}</span>
            </header>
            <p><strong>Fecha:</strong> ${escapeHtml(report.fecha)} · <strong>Alcance:</strong> ${escapeHtml(report.alcance)}</p>
            <p>${escapeHtml(report.resumen)}</p>
            <h5>Evidencia</h5>
            <ul class="tight">
              ${(report.evidencia || []).map(item => `<li>${escapeHtml(item)}</li>`).join('') || '<li>Sin evidencia cargada.</li>'}
            </ul>
            <p class="result-next-step"><strong>Siguiente paso:</strong> ${escapeHtml(report.siguientePaso)}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderExternalResultsReports() {
    if (!ui.externalResultsReview) return;
    if (!state.executionReports.length) {
      ui.externalResultsReview.innerHTML = `${renderReportTemplateBlock()}<div class="muted-box">No hay informes de resultados cargados.</div>`;
      return;
    }

    ui.externalResultsReview.innerHTML = `
      ${renderReportTemplateBlock()}
      ${state.executionReports.map(report => `
      <article class="result-report-card status-card ${reportStateClass(report.estado)}">
        <header class="result-report-head">
          <h4>${escapeHtml(report.titulo)}</h4>
          <span class="chip ${reportStateClass(report.estado)}">${escapeHtml(report.estado.toUpperCase())}</span>
        </header>
        <p><strong>Fecha:</strong> ${escapeHtml(report.fecha)} · <strong>Alcance:</strong> ${escapeHtml(report.alcance)}</p>
        <p>${escapeHtml(report.resumen)}</p>
        <ul class="tight">
          ${(report.evidencia || []).map(item => `<li>${escapeHtml(item)}</li>`).join('') || '<li>Sin evidencia cargada.</li>'}
        </ul>
        <p class="result-next-step"><strong>Siguiente paso:</strong> ${escapeHtml(report.siguientePaso)}</p>
      </article>
    `).join('')}
    `;
  }

  function renderStats() {
    const visible = getFilteredScripts();
    const counts = countBySeverity(visible);
    const critical = visible.filter(script => script.score >= 85).length;

    ui.statsPanel.innerHTML = `
      <h2>Panel de Control</h2>
      <div class="mini-kpi-grid">
        <div class="mini-kpi"><div class="hero-card__label">Visibles</div><div class="hero-card__value">${visible.length}</div></div>
        <div class="mini-kpi"><div class="hero-card__label">Crítico</div><div class="hero-card__value">${critical}</div></div>
        <div class="mini-kpi"><div class="hero-card__label">Rojo</div><div class="hero-card__value">${counts.rojo}</div></div>
        <div class="mini-kpi"><div class="hero-card__label">Amarillo</div><div class="hero-card__value">${counts.amarillo}</div></div>
        <div class="mini-kpi"><div class="hero-card__label">Verde</div><div class="hero-card__value">${counts.verde}</div></div>
        <div class="mini-kpi"><div class="hero-card__label">Validación real</div><div class="hero-card__value">Pendiente</div></div>
      </div>
      <div class="recommendation-banner small">
        La sidebar ahora manda toda la consola. Cambiar de archivo actualiza Informe, Dirección, Plan, Resumen, Flujo, Conflictos y Detalle.
      </div>
    `;
  }

  function renderContextHeader() {
    const script = state.selected;
    if (!script) return;
    const cotejo = getCotejoRecord(script.file);

    ui.selectedBreadcrumb.textContent = `CARGOS_MORA / ${script.scriptType} / ${script.file}`;
    ui.selectedTitle.textContent = script.file;
    ui.selectedMeta.textContent = `${capitalize(script.status)} · ${capitalize(script.priority)} · ${capitalize(script.maturity)} · Riesgo ${script.score}/100 · ${cotejo.cotejoEstado}`;
    ui.selectedHero.innerHTML = `
      <div class="hero-card"><div class="hero-card__label">Tipo</div><div class="hero-card__value">${escapeHtml(script.scriptType)}</div></div>
      <div class="hero-card"><div class="hero-card__label">Estado</div><div class="hero-card__value">${escapeHtml(capitalize(script.status))}</div></div>
      <div class="hero-card"><div class="hero-card__label">Prioridad</div><div class="hero-card__value">${escapeHtml(capitalize(script.priority))}</div></div>
      <div class="hero-card"><div class="hero-card__label">Impacto</div><div class="hero-card__value">${escapeHtml(script.impactAreas.filter(area => area.active).length)} dominios</div></div>
      <div class="hero-card"><div class="hero-card__label">Dependencias</div><div class="hero-card__value">↑ ${script.upstreamFiles.length} · ↓ ${script.downstreamFiles.length}</div></div>
      <div class="hero-card"><div class="hero-card__label">Madurez</div><div class="hero-card__value">${escapeHtml(capitalize(script.maturity))}</div></div>
    `;

    ui.selectedRelations.innerHTML = script.relatedFiles.length
      ? script.relatedFiles.map(file => `<span class="relation-pill">Relacionado: ${escapeHtml(file)}</span>`).join('')
      : '<span class="relation-pill">Sin relaciones cruzadas confirmadas en el dataset</span>';

    const visible = getFilteredScripts();
    const currentIndex = visible.findIndex(item => item.file === script.file);
    ui.prevScriptBtn.disabled = currentIndex <= 0;
    ui.nextScriptBtn.disabled = currentIndex === -1 || currentIndex >= visible.length - 1;
  }

  function renderTabsForSelected() {
    const script = state.selected;
    if (!script) return;

    ui.contextInforme.innerHTML = renderInformeTab(script);
    ui.contextDireccion.innerHTML = renderDireccionTab(script);
    ui.contextSoluciones.innerHTML = renderSolucionesTab(script);
    ui.contextResumen.innerHTML = renderResumenTab(script);
    ui.contextResultados.innerHTML = renderResultadosTab(script);
    ui.contextFlujo.innerHTML = renderFlujoTab(script);
    ui.contextConflictos.innerHTML = renderConflictosTab(script);
    ui.contextDetalle.innerHTML = renderDetalleTab(script);
  }

  function renderInformeTab(script) {
    const cotejo = getCotejoRecord(script.file);
    const statusClass = semaforoClass(script.severity);
    const historyRows = script.history.map(item => `
      <tr>
        <td>${escapeHtml(item.date)}</td>
        <td>${escapeHtml(item.change)}</td>
        <td>${escapeHtml(item.reason)}</td>
        <td>${escapeHtml(item.result)}</td>
        <td>${escapeHtml(item.state)}</td>
      </tr>
    `).join('');

    const symptomRows = script.symptoms.map((symptom, index) => `
      <tr>
        <td>${escapeHtml(symptom)}</td>
        <td>${escapeHtml(script.causes[index] || script.causes[0] || 'Hipótesis pendiente')}</td>
        <td>${escapeHtml(buildEvidence(script, index))}</td>
      </tr>
    `).join('');

    return `
      <h3>Informe Técnico del Archivo <span class="chip ${statusClass}">${escapeHtml(capitalize(script.status))}</span></h3>
      <div class="section-grid">
        <div class="section-card">
          <h4>Estado de cotejo</h4>
          <p><strong>Estado:</strong> ${escapeHtml(cotejo.cotejoEstado)}</p>
          <p><strong>Etiqueta de confianza:</strong> ${escapeHtml(cotejo.confianza)}</p>
          <p><strong>Fidelidad:</strong> ${escapeHtml(String(cotejo.fidelidad))}% cotejado</p>
          <div class="score-bar ${cotejo.fidelidad < 70 ? 'danger' : cotejo.fidelidad < 90 ? 'warn' : ''}"><span style="width:${Math.min(cotejo.fidelidad, 100)}%"></span></div>
          <p class="small"><strong>Sello:</strong> ${escapeHtml(cotejo.selloFinal)}</p>
        </div>
        <div class="section-card">
          <h4>Resumen fiel del archivo</h4>
          <p><strong>Veredicto técnico:</strong> ${escapeHtml(cotejo.veredicto)}</p>
          <p><strong>Qué módulo alimenta:</strong> ${escapeHtml(cotejo.dependientes.join(', ') || 'Pendiente')}</p>
          <p><strong>Qué módulo consume:</strong> ${escapeHtml(cotejo.dependeDe.join(', ') || 'Pendiente')}</p>
        </div>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Ficha Ejecutiva</h4>
          <p><strong>Archivo:</strong> ${escapeHtml(script.file)}</p>
          <p><strong>Propósito general:</strong> ${escapeHtml(script.purpose)}</p>
          <p><strong>Rol dentro del sistema:</strong> ${escapeHtml(script.role)}</p>
          <p><strong>Tipo:</strong> ${escapeHtml(capitalize(script.scriptType))}</p>
          <p><strong>Prioridad técnica:</strong> ${escapeHtml(capitalize(script.priority))}</p>
          <p><strong>Impacto funcional:</strong> ${escapeHtml(summarizeImpact(script.impactAreas))}</p>
        </div>
        <div class="section-card">
          <h4>Diagnóstico Principal</h4>
          <p>${escapeHtml(script.diagnosis)}</p>
          <div class="hero-card__label">Riesgo técnico</div>
          <div class="hero-card__value">${script.score}/100</div>
          <div class="score-bar ${statusClass === 'rojo' ? 'danger' : statusClass === 'amarillo' ? 'warn' : ''}"><span style="width:${Math.min(script.score, 100)}%"></span></div>
          <p class="small"><strong>Conclusión ejecutiva:</strong> ${escapeHtml(script.conclusion)}</p>
        </div>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Lo que hace bien</h4>
          <ul class="tight">
            ${deriveWhatWorks(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Lo que no está haciendo bien</h4>
          <ul class="tight">
            ${script.symptoms.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Por qué importa</h4>
          <ul class="tight">
            ${deriveWhyMatters(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Madurez del script</h4>
          <p>${escapeHtml(capitalize(script.maturity))}</p>
          <div class="visual-semaphore">
            <span class="${script.severity === 'rojo' ? 'active red' : ''}"></span>
            <span class="${script.severity === 'amarillo' ? 'active yellow' : ''}"></span>
            <span class="${script.severity === 'verde' ? 'active green' : ''}"></span>
          </div>
        </div>
        <div class="section-card">
          <h4>Glosario funcional</h4>
          <p><strong>En lenguaje sencillo:</strong> ${escapeHtml(script.glossary.simple)}</p>
          <p><strong>Qué hace:</strong> ${escapeHtml(script.glossary.job)}</p>
          <p><strong>Por qué debe importar:</strong> ${escapeHtml(script.glossary.why)}</p>
        </div>
        <div class="section-card">
          <h4>Lo que no hace este script</h4>
          <ul class="tight">
            ${script.whatNotDo.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <h4>Historial de intervenciones</h4>
      <div class="table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Fecha</th><th>Cambio realizado</th><th>Motivo</th><th>Resultado observado</th><th>Estado</th></tr></thead>
          <tbody>${historyRows}</tbody>
        </table>
      </div>

      <h4>Relación entre síntoma y causa</h4>
      <div class="table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Síntoma visible</th><th>Causa técnica probable</th><th>Evidencia</th></tr></thead>
          <tbody>${symptomRows}</tbody>
        </table>
      </div>

      <h4>Hallazgos de fidelidad</h4>
      <div class="table-wrap">
        <table class="matrix-table">
          <thead><tr><th>La web decía</th><th>El script muestra</th><th>Ajuste aplicado</th></tr></thead>
          <tbody>
            ${cotejo.diferencias.map(item => `<tr><td>${escapeHtml(item.webDecia)}</td><td>${escapeHtml(item.scriptMuestra)}</td><td>${escapeHtml(item.ajuste)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="recommendation-banner">
        <strong>Recomendación final por archivo:</strong> ${escapeHtml(capitalize(script.recommendation))}
      </div>
    `;
  }

  function renderDireccionTab(script) {
    const executiveRows = `
      <tr><td>${escapeHtml(script.file)}</td><td>${escapeHtml(summarizeImpact(script.impactAreas))}</td><td>${escapeHtml(capitalize(script.status))}</td><td>${escapeHtml(capitalize(script.severity))}</td><td>${escapeHtml(capitalize(script.priority))}</td><td>${escapeHtml(script.upstreamFiles[0] || 'Ninguna confirmada')}</td></tr>
    `;

    return `
      <h3>Vista Dirección del Archivo</h3>
      <div class="section-grid">
        <div class="section-card">
          <h4>Por qué importa</h4>
          <ul class="tight">
            ${deriveDirectionImportance(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Qué parte del negocio escolar afecta</h4>
          <ul class="tight">
            ${script.impactAreas.filter(area => area.active).map(area => `<li>${escapeHtml(area.label)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Riesgo de no corregir</h4>
          <ul class="tight">
            ${deriveDirectionRisk(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <h4>Mini tabla ejecutiva</h4>
      <div class="table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Archivo</th><th>Impacto en negocio</th><th>Estado</th><th>Riesgo</th><th>Prioridad</th><th>Dependencia crítica</th></tr></thead>
          <tbody>${executiveRows}</tbody>
        </table>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Semáforo ejecutivo</h4>
          <div class="visual-semaphore">
            <span class="${script.severity === 'rojo' ? 'active red' : ''}"></span>
            <span class="${script.severity === 'amarillo' ? 'active yellow' : ''}"></span>
            <span class="${script.severity === 'verde' ? 'active green' : ''}"></span>
          </div>
          <p class="small">Severidad del problema</p>
        </div>
        <div class="section-card">
          <h4>Impacto funcional</h4>
          <div class="score-bar ${script.severity === 'rojo' ? 'danger' : 'warn'}"><span style="width:${impactScore(script)}%"></span></div>
          <p class="small">Cobertura del módulo sobre flujos escolares clave.</p>
        </div>
        <div class="section-card">
          <h4>Dependencia con otros módulos</h4>
          <div class="score-bar ${script.upstreamFiles.length + script.downstreamFiles.length > 5 ? 'danger' : 'warn'}"><span style="width:${Math.min((script.upstreamFiles.length + script.downstreamFiles.length) * 12, 100)}%"></span></div>
          <p class="small">Dependencias confirmadas por llamadas detectadas.</p>
        </div>
      </div>

      <div class="recommendation-banner">
        <strong>Decisión sugerida:</strong> ${escapeHtml(directionDecision(script))}
      </div>
    `;
  }

  function renderSolucionesTab(script) {
    return `
      <h3>Soluciones y Plan para ${escapeHtml(script.file)}</h3>
      <div class="two-col">
        <div class="section-card">
          <h4>Diagnóstico de intervención</h4>
          <p><strong>Problema actual:</strong> ${escapeHtml(script.symptoms[0] || script.diagnosis)}</p>
          <p><strong>Hipótesis técnica:</strong> ${escapeHtml(script.causes[0] || 'Pendiente de aislar en pruebas.')}</p>
          <p><strong>Solución recomendada:</strong> ${escapeHtml(script.controlesSugeridos && script.controlesSugeridos[0] ? script.controlesSugeridos[0] : 'Reparar el flujo específico del módulo sin reescribir el ecosistema.')}</p>
          <p><strong>Tipo de intervención:</strong> ${escapeHtml(script.score >= 80 ? 'reestructuracion fuerte' : 'refactor ligero')}</p>
          <p><strong>Qué no se debe tocar:</strong> ${escapeHtml(script.whatNotDo[0] || 'Responsabilidades ajenas del módulo.')}</p>
        </div>
        <div class="section-card">
          <h4>Orden recomendado</h4>
          <ol class="tight">
            ${script.recommendedOrder.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ol>
          <h5>Archivos dependientes afectados</h5>
          <ul class="tight">
            ${(script.downstreamFiles.length ? script.downstreamFiles : ['No confirmados en dataset']).map(file => `<li>${escapeHtml(file)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Solución inmediata</h4>
          <ul class="tight">
            ${deriveImmediateActions(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Solución estructural</h4>
          <ul class="tight">
            ${deriveStructuralActions(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Prueba mínima obligatoria</h4>
          <ul class="tight">
            ${deriveMinimumTests(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Validación esperada</h4>
          <ul class="tight">
            ${deriveExpectedValidation(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Criterio de cierre del bloque</h4>
          <ul class="tight">
            ${deriveClosureCriteria(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  function renderResumenTab(script) {
    const cotejo = getCotejoRecord(script.file);
    const dependencyRows = buildDependencyRows(script).map(row => `
      <tr>
        <td>${escapeHtml(row.alimentadoPor)}</td>
        <td>${escapeHtml(row.dependeDe)}</td>
        <td>${escapeHtml(row.impactaA)}</td>
        <td>${escapeHtml(row.hojaOrigen)}</td>
        <td>${escapeHtml(row.hojaDestino)}</td>
        <td>${escapeHtml(row.acoplamiento)}</td>
      </tr>
    `).join('');

    return `
      <h3>Resumen Técnico del Archivo</h3>
      <div class="section-grid">
        <div class="section-card">
          <h4>Funciones principales</h4>
          <ul class="tight">
            ${(script.functions || []).slice(0, 10).map(fn => `<li>${escapeHtml(fn.name)} (${fn.startLine}-${fn.endLine})</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Entradas y salidas</h4>
          <p><strong>Entradas:</strong> ${escapeHtml(deriveInputs(script).join(', '))}</p>
          <p><strong>Salidas:</strong> ${escapeHtml(deriveOutputs(script).join(', '))}</p>
          <p><strong>Dependencias upstream:</strong> ${escapeHtml(script.upstreamFiles.join(', ') || 'Sin evidencia en dataset')}</p>
          <p><strong>Dependencias downstream:</strong> ${escapeHtml(script.downstreamFiles.join(', ') || 'Sin evidencia en dataset')}</p>
        </div>
        <div class="section-card">
          <h4>Variables críticas y reglas</h4>
          <p><strong>Constantes/variables críticas:</strong> ${escapeHtml(script.criticalConstants.join(', ') || 'No visibles en dataset')}</p>
          <ul class="tight">
            ${script.rules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Puntos frágiles</h4>
          <ul class="tight">
            ${script.badPatterns.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Puntos fuertes</h4>
          <ul class="tight">
            ${deriveStrengths(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="section-card">
          <h4>Síntomas y propagación</h4>
          <ul class="tight">
            ${deriveVisibleSymptoms(script).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <h4>Matriz de dependencias por archivo</h4>
      <div class="table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Alimentado por</th><th>Depende de</th><th>Impacta a</th><th>Hoja origen</th><th>Hoja destino</th><th>Nivel de acoplamiento</th></tr></thead>
          <tbody>${dependencyRows}</tbody>
        </table>
      </div>

      <h4>Matriz de impacto funcional</h4>
      <div class="heat-grid">
        ${script.impactAreas.map(area => `<div class="heat-cell ${area.active ? 'on' : ''}"><strong>${escapeHtml(area.label)}</strong><div class="small">${area.active ? 'Afecta' : 'Sin evidencia fuerte'}</div></div>`).join('')}
      </div>

      <h4>Matriz de verdad del cotejo</h4>
      <div class="table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Control</th><th>Estado</th></tr></thead>
          <tbody>
            <tr><td>Descripción web validada</td><td>${boolMark(cotejo.matrizVerdad.descripcionValidada)}</td></tr>
            <tr><td>Dependencias validadas</td><td>${boolMark(cotejo.matrizVerdad.dependenciasValidadas)}</td></tr>
            <tr><td>Funciones críticas validadas</td><td>${boolMark(cotejo.matrizVerdad.funcionesCriticasValidadas)}</td></tr>
            <tr><td>Conflictos validados</td><td>${boolMark(cotejo.matrizVerdad.conflictosValidados)}</td></tr>
            <tr><td>Flujo validado</td><td>${boolMark(cotejo.matrizVerdad.flujoValidado)}</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function renderFlujoTab(script, scope = 'main') {
    const flowId = `flow-${scope}-${slugify(script.file)}`;
    const flowText = buildScriptFlow(script);
    return `
      <h3>Flujo Individual de ${escapeHtml(script.file)}</h3>
      <div class="section-grid">
        <div class="section-card">
          <h4>Qué recibe, procesa y entrega</h4>
          <ul class="tight">
            <li><strong>Recibe:</strong> ${escapeHtml(deriveInputs(script).join(', '))}</li>
            <li><strong>Procesa:</strong> ${escapeHtml(script.purpose)}</li>
            <li><strong>Transforma:</strong> ${escapeHtml(script.rules[0] || 'Reglas del módulo y datos intermedios')}</li>
            <li><strong>Entrega:</strong> ${escapeHtml(deriveOutputs(script).join(', '))}</li>
          </ul>
        </div>
        <div class="section-card">
          <h4>Hojas y salidas impactadas</h4>
          <ul class="tight">
            ${script.affectedSheets.map(sheet => `<li>${escapeHtml(sheet)}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="section-card">
        <div id="${flowId}" class="mermaid">${flowText}</div>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Scripts que alimentan</h4>
          <ul class="tight">${(script.upstreamFiles.length ? script.upstreamFiles : ['Sin evidencia en dataset']).map(file => `<li>${escapeHtml(file)}</li>`).join('')}</ul>
        </div>
        <div class="section-card">
          <h4>Scripts alimentados</h4>
          <ul class="tight">${(script.downstreamFiles.length ? script.downstreamFiles : ['Sin evidencia en dataset']).map(file => `<li>${escapeHtml(file)}</li>`).join('')}</ul>
        </div>
      </div>
    `;
  }

  function renderConflictosTab(script) {
    const cotejo = getCotejoRecord(script.file);
    const conflicts = buildConflicts(script);
    return `
      <h3>Conflictos del Archivo</h3>
      <div class="table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Conflicto</th><th>Tipo</th><th>Severidad</th><th>Impacto</th><th>Evidencia</th><th>Archivo relacionado</th><th>Estado de investigación</th></tr></thead>
          <tbody>
            ${conflicts.map(conflict => `
              <tr>
                <td>${escapeHtml(conflict.title)}</td>
                <td>${escapeHtml(conflict.type)}</td>
                <td><span class="severity-dot ${semaforoClass(conflict.severity)}"></span>${escapeHtml(capitalize(conflict.severity))}</td>
                <td>${escapeHtml(conflict.impact)}</td>
                <td>${escapeHtml(conflict.evidence)}</td>
                <td>${escapeHtml(conflict.related)}</td>
                <td>${escapeHtml(conflict.state)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div class="section-grid">
        <div class="section-card">
          <h4>Conflictos internos</h4>
          <ul class="tight">${conflicts.filter(item => item.type === 'interno').map(item => `<li>${escapeHtml(item.title)}</li>`).join('') || '<li>No detectados</li>'}</ul>
        </div>
        <div class="section-card">
          <h4>Conflictos por dependencia</h4>
          <ul class="tight">${conflicts.filter(item => item.type === 'dependencia').map(item => `<li>${escapeHtml(item.title)}</li>`).join('') || '<li>No detectados</li>'}</ul>
        </div>
        <div class="section-card">
          <h4>Conflictos heredados o provocados</h4>
          <ul class="tight">${conflicts.filter(item => item.type === 'heredado' || item.type === 'provoca').map(item => `<li>${escapeHtml(item.title)}</li>`).join('') || '<li>No detectados</li>'}</ul>
        </div>
      </div>

      <div class="section-grid">
        <div class="section-card">
          <h4>Confirmados por lectura de código</h4>
          <ul class="tight">${renderList(cotejo.conflictos.confirmados, 'Sin conflictos confirmados')}</ul>
        </div>
        <div class="section-card">
          <h4>Hipótesis razonables</h4>
          <ul class="tight">${renderList(cotejo.conflictos.hipotesis, 'Sin hipótesis abiertas')}</ul>
        </div>
        <div class="section-card">
          <h4>Pendientes de validación</h4>
          <ul class="tight">${renderList(cotejo.conflictos.pendientes, 'Sin pendientes')}</ul>
        </div>
      </div>
    `;
  }

  function renderDetalleTab(script, scope = 'main') {
    const cotejo = getCotejoRecord(script.file);
    const flowId = `detail-${scope}-${slugify(script.file)}`;
    return `
      <h3>Detalle Profundo por Script</h3>
      <div class="recommendation-banner">
        Aquí se mezclan datos confirmados del dataset con inferencias funcionales marcadas en lenguaje conservador para no tocar el módulo equivocado.
      </div>

      <div class="detail-stack">
        <details class="detail-block" open>
          <summary>Ficha técnica de cotejo (Nivel 1 + Nivel 2)</summary>
          <div class="section-grid">
            <div class="section-card"><h4>Qué hace realmente</h4><ul class="tight">${renderList(cotejo.queHace, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Qué no hace</h4><ul class="tight">${renderList(cotejo.queNoHace, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Entradas reales</h4><ul class="tight">${renderList(cotejo.entradas, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Salidas reales</h4><ul class="tight">${renderList(cotejo.salidas, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Hojas tocadas</h4><ul class="tight">${renderList(cotejo.hojas, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Reglas aplicadas</h4><ul class="tight">${renderList(cotejo.reglasNegocio, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Depende de</h4><ul class="tight">${renderList(cotejo.dependeDe, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Scripts dependientes</h4><ul class="tight">${renderList(cotejo.dependientes, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Flujo compartido</h4><ul class="tight">${renderList(cotejo.flujoCompartido, 'Pendiente de cotejo')}</ul></div>
            <div class="section-card"><h4>Funciones críticas</h4><ul class="tight">${renderList(cotejo.funcionesCriticas, 'Pendiente de cotejo')}</ul></div>
          </div>
          <div class="recommendation-banner"><strong>Riesgo de interpretación:</strong> ${escapeHtml(cotejo.riesgoInterpretacion)}</div>
        </details>

        <details class="detail-block" open>
          <summary>Listado de funciones y salud técnica</summary>
          <div class="table-wrap">
            <table class="function-table">
              <thead>
                <tr>
                  <th>Función</th>
                  <th>Propósito</th>
                  <th>Entrada</th>
                  <th>Salida esperada</th>
                  <th>Hoja / datos</th>
                  <th>Dependencia</th>
                  <th>Crítica</th>
                  <th>Riesgo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${(script.functions || []).map(fn => renderFunctionRow(script, fn)).join('')}
              </tbody>
            </table>
          </div>
        </details>

        <details class="detail-block" open>
          <summary>Funciones especiales y observaciones</summary>
          <div class="section-grid">
            <div class="section-card"><h4>Huérfanas</h4><ul class="tight">${renderList(script.orphanFunctions, 'Sin huérfanas detectadas')}</ul></div>
            <div class="section-card"><h4>Duplicadas / redundantes</h4><ul class="tight">${renderList(deriveRedundantFunctions(script), 'Sin redundancias evidentes')}</ul></div>
            <div class="section-card"><h4>Hardcoded</h4><ul class="tight">${renderList(script.hardcodedFunctions, 'Sin hardcoding visible por nombre')}</ul></div>
            <div class="section-card"><h4>Alto acoplamiento</h4><ul class="tight">${renderList(script.coupledFunctions, 'Sin funciones fuertemente acopladas por evidencia')}</ul></div>
            <div class="section-card"><h4>Propensas a romper flujo</h4><ul class="tight">${renderList(script.fragileFunctions, 'Sin puntos frágiles dominantes')}</ul></div>
            <div class="section-card"><h4>Deberían separarse</h4><ul class="tight">${renderList(script.splitCandidates, 'Sin necesidad fuerte de separar')}</ul></div>
            <div class="section-card"><h4>Deben quedarse intactas</h4><ul class="tight">${renderList(script.protectedFunctions, 'No hay blindadas por criterio especial')}</ul></div>
          </div>
        </details>

        <details class="detail-block" open>
          <summary>Bloques y flujo interno</summary>
          <div id="${flowId}" class="mermaid">${buildInternalFlow(script)}</div>
          <div class="section-grid">
            ${(script.blocks || []).slice(0, 14).map(block => renderBlockCard(script, block)).join('')}
          </div>
        </details>

        <details class="detail-block" open>
          <summary>Patrones y malas prácticas</summary>
          <ul class="tight">
            ${script.badPatterns.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </details>
      </div>
    `;
  }

  function renderFunctionRow(script, fn) {
    const entry = inferFunctionEntry(script, fn);
    return `
      <tr>
        <td>${escapeHtml(fn.name)}</td>
        <td>${escapeHtml(entry.purpose)}</td>
        <td>${escapeHtml(entry.input)}</td>
        <td>${escapeHtml(entry.output)}</td>
        <td>${escapeHtml(entry.sheet)}</td>
        <td>${escapeHtml(entry.dependency)}</td>
        <td>${escapeHtml(entry.critical)}</td>
        <td>${escapeHtml(entry.risk)}</td>
        <td>${escapeHtml(entry.health)}</td>
      </tr>
    `;
  }

  function renderBlockCard(script, block) {
    const explain = explainBlock(block, script);
    return `
      <div class="section-card">
        <h4>${escapeHtml(block.name || block.type)} · ${block.startLine}-${block.endLine}</h4>
        <p><strong>Qué hace:</strong> ${escapeHtml(explain.queHace)}</p>
        <p><strong>Impacto:</strong> ${escapeHtml(explain.impacto)}</p>
        <p><strong>Riesgo:</strong> ${escapeHtml(explain.riesgo)}</p>
        <p><strong>Control:</strong> ${escapeHtml(explain.control)}</p>
        <p class="small"><strong>Llamadas:</strong> ${escapeHtml((block.calls || []).join(', ') || 'Sin llamadas detectadas')}</p>
      </div>
    `;
  }

  function buildConflicts(script) {
    const conflicts = [];

    script.badPatterns.forEach(pattern => {
      conflicts.push({
        title: pattern,
        type: 'interno',
        severity: script.severity,
        impact: summarizeImpact(script.impactAreas),
        evidence: script.summaryTecnico || 'Evidencia derivada de análisis estructural',
        related: script.file,
        state: script.score >= 80 ? 'confirmado' : 'hipotesis'
      });
    });

    script.upstreamFiles.slice(0, 3).forEach(file => {
      conflicts.push({
        title: `Dependencia aguas arriba desde ${file}`,
        type: 'dependencia',
        severity: script.severity,
        impact: 'Puede romper entrada o contratos implícitos',
        evidence: 'Relación deducida por llamadas detectadas',
        related: file,
        state: 'hipotesis'
      });
    });

    if (FILE_OVERRIDES[script.file] && FILE_OVERRIDES[script.file].status === 'hereda error') {
      conflicts.push({
        title: 'El módulo hereda un error aguas arriba',
        type: 'heredado',
        severity: 'amarillo',
        impact: 'La salida se degrada aunque la causa raíz esté fuera del archivo',
        evidence: FILE_OVERRIDES[script.file].diagnosis,
        related: script.upstreamFiles[0] || 'Statements / Detalle',
        state: 'confirmado'
      });
    }

    script.downstreamFiles.slice(0, 3).forEach(file => {
      conflicts.push({
        title: `Puede propagar error hacia ${file}`,
        type: 'provoca',
        severity: script.severity,
        impact: 'Propagación descendente del estado o de datos incompletos',
        evidence: script.symptoms[0] || 'Dependencia descendente confirmada',
        related: file,
        state: 'hipotesis'
      });
    });

    return conflicts.slice(0, 12);
  }

  function buildScriptFlow(script) {
    const selectedId = `S${slugify(script.file)}`;
    const lines = ['flowchart LR'];

    (script.upstreamFiles.slice(0, 4)).forEach((file, index) => {
      lines.push(`U${index}["${escapeMermaid(file)}"] --> ${selectedId}`);
    });

    lines.push(`${selectedId}["${escapeMermaid(script.file)}\n${escapeMermaid(capitalize(script.status))}"]`);

    script.affectedSheets.slice(0, 3).forEach((sheet, index) => {
      lines.push(`${selectedId} --> H${index}["${escapeMermaid(sheet)}"]`);
    });

    script.downstreamFiles.slice(0, 4).forEach((file, index) => {
      lines.push(`${selectedId} --> D${index}["${escapeMermaid(file)}"]`);
    });

    lines.push(`style ${selectedId} fill:${script.severity === 'rojo' ? '#ffe5e5' : script.severity === 'amarillo' ? '#fff7dd' : '#e6f7ec'},stroke:${script.severity === 'rojo' ? '#9b1c1c' : script.severity === 'amarillo' ? '#8a6a00' : '#136f3a'},stroke-width:3px`);
    return lines.join('\n');
  }

  function buildInternalFlow(script) {
    const lines = ['flowchart TD'];
    const functions = (script.functions || []).slice(0, 8);
    if (!functions.length) {
      lines.push('N0["Sin funciones detectadas"]');
      return lines.join('\n');
    }

    functions.forEach((fn, index) => {
      lines.push(`N${index}["${escapeMermaid(fn.name)}"]`);
      if (index > 0) {
        lines.push(`N${index - 1} --> N${index}`);
      }
    });

    return lines.join('\n');
  }

  function explainBlock(block, script) {
    const domain = detectDomain(`${script.file} ${(block.name || '')} ${((block.calls || []).join(' '))}`);
    if (block.type === 'constants') {
      return {
        queHace: `Define parámetros base que gobiernan el comportamiento del módulo en ${domain}.`,
        impacto: `Ayuda a mantener consistencia de cálculo, validación o configuración.`,
        riesgo: `Un valor incorrecto puede alterar resultados sin fallo visible inmediato.`,
        control: `Validar encabezados, nombres y rango funcional antes de cambiar estas constantes.`
      };
    }

    return {
      queHace: `Ejecuta ${(block.name || 'la función')} dentro del dominio ${domain}.`,
      impacto: `Puede alterar la trazabilidad del flujo ${domain}.`,
      riesgo: `Si falla, puede dejar salidas parciales o incoherentes.`,
      control: `Probar entradas normales, vacías e inválidas para este bloque.`
    };
  }

  function inferFunctionEntry(script, fn) {
    const fnName = fn.name || 'Funcion';
    const callBlock = (script.blocks || []).find(block => block.name === fnName) || {};
    const callCount = (callBlock.calls || []).length;
    const domain = detectDomain(`${script.file} ${fnName}`);
    return {
      purpose: `Gestiona una porción de ${domain} en ${script.file}.`,
      input: 'No visible en dataset; inferir desde nombre y llamadas.',
      output: callCount ? `Entrega resultado intermedio para ${callBlock.calls[0] || 'flujo siguiente'}.` : 'Salida interna no documentada en dataset.',
      sheet: deriveFunctionSheet(script, fnName),
      dependency: callCount ? `${callCount} llamadas asociadas` : 'Sin dependencias visibles',
      critical: isCriticalFunction(script, fnName) ? 'Sí' : 'No',
      risk: callCount >= 4 || script.severity === 'rojo' ? 'Alto' : callCount >= 2 ? 'Medio' : 'Bajo',
      health: deriveFunctionHealth(script, fnName)
    };
  }

  function deriveFunctionSheet(script, fnName) {
    const text = `${script.file} ${fnName}`.toLowerCase();
    if (text.includes('statement') || text.includes('detalle')) return 'ESTADO_CUENTA_DETALLE / RESUMEN';
    if (text.includes('portal') || text.includes('export')) return 'PORTAL / EXPORT_CONTABILIDAD';
    if (text.includes('payment') || text.includes('application')) return 'PAGOS_REPORTADOS / APLICACION_PAGOS';
    if (text.includes('charge') || text.includes('cargo')) return 'CARGOS_ESCOLARES';
    if (text.includes('concili')) return 'CONCILIACION';
    if (text.includes('config') || text.includes('schema')) return 'CONFIG / PARAMETROS / REGLAS_COBRO';
    return 'No visible en dataset';
  }

  function deriveFunctionHealth(script, fnName) {
    if (script.hardcodedFunctions.includes(fnName)) return 'Sospechosa por hardcoding';
    if (script.coupledFunctions.includes(fnName)) return 'Sospechosa por acoplamiento';
    if (script.protectedFunctions.includes(fnName)) return 'Sana / conservar';
    return script.severity === 'rojo' ? 'Revisar con prioridad' : 'Estable con validación pendiente';
  }

  function isCriticalFunction(script, fnName) {
    return script.protectedFunctions.includes(fnName) || /run|build|resolver|aplicar|generar|concili|statement/i.test(fnName);
  }

  function populateFilterOptions() {
    populateSelect(ui.statusFilter, ['funciona', 'funciona parcial', 'bloqueado', 'requiere validacion', 'hereda error']);
    populateSelect(ui.severityFilter, ['rojo', 'amarillo', 'verde']);
    populateSelect(ui.priorityFilter, ['alta', 'media', 'baja']);
    populateSelect(ui.typeFilter, uniqueList(state.scripts.map(script => script.scriptType)));
  }

  function populateSelect(select, values) {
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = capitalize(value);
      select.appendChild(option);
    });
  }

  function wireTabs() {
    document.querySelectorAll('.tab').forEach(btn => {
      btn.onclick = () => activateTab(btn.dataset.tab);
    });
  }

  function wireFilters() {
    ui.searchInput.addEventListener('input', event => {
      state.filters.search = String(event.target.value || '').toLowerCase();
      syncSelectedWithFilters();
      renderAll();
    });

    ui.statusFilter.addEventListener('change', event => updateFilter('status', event.target.value));
    ui.severityFilter.addEventListener('change', event => updateFilter('severity', event.target.value));
    ui.priorityFilter.addEventListener('change', event => updateFilter('priority', event.target.value));
    ui.typeFilter.addEventListener('change', event => updateFilter('type', event.target.value));
    ui.clearFilters.addEventListener('click', clearFilters);
  }

  function wireNavigation() {
    ui.prevScriptBtn.addEventListener('click', () => moveSelection(-1));
    ui.nextScriptBtn.addEventListener('click', () => moveSelection(1));
    window.addEventListener('hashchange', () => applyHashSelection({ scrollToStatic: true }));
  }

  function moveSelection(delta) {
    const visible = getFilteredScripts();
    const currentIndex = visible.findIndex(script => state.selected && script.file === state.selected.file);
    if (currentIndex === -1) return;
    const next = visible[currentIndex + delta];
    if (!next) return;
    setSelectedScript(next, { updateHash: true, scrollToStatic: false });
  }

  function updateFilter(key, value) {
    state.filters[key] = value;
    syncSelectedWithFilters();
    syncHashWithSelected();
    renderAll();
  }

  function clearFilters() {
    state.filters = { search: '', status: 'all', severity: 'all', priority: 'all', type: 'all' };
    ui.searchInput.value = '';
    ui.statusFilter.value = 'all';
    ui.severityFilter.value = 'all';
    ui.priorityFilter.value = 'all';
    ui.typeFilter.value = 'all';
    syncSelectedWithFilters();
    syncHashWithSelected();
    renderAll();
  }

  function syncSelectedWithFilters() {
    const visible = getFilteredScripts();
    if (!visible.length) return;
    const exists = visible.some(script => state.selected && script.file === state.selected.file);
    if (!exists) {
      state.selected = visible[0];
    }
  }

  function buildScriptAnchor(file) {
    return `script-${slugify(String(file || '').replace(/\.gs\.js$/i, ''))}`;
  }

  function findScriptByHash(hash) {
    const normalized = String(hash || '').replace(/^#/, '');
    if (!normalized) return null;
    return state.scripts.find(script => buildScriptAnchor(script.file) === normalized) || null;
  }

  function syncHashWithSelected() {
    if (!state.selected) return;
    const nextHash = `#${buildScriptAnchor(state.selected.file)}`;
    if (window.location.hash !== nextHash) {
      history.replaceState(null, '', nextHash);
    }
  }

  function setSelectedScript(script, { updateHash = false, scrollToStatic = false } = {}) {
    if (!script) return;
    state.selected = script;
    renderAll();
    if (updateHash) {
      const nextHash = `#${buildScriptAnchor(script.file)}`;
      if (window.location.hash !== nextHash) {
        history.pushState(null, '', nextHash);
      }
    }
    if (scrollToStatic) {
      const target = document.getElementById(buildScriptAnchor(script.file));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function applyHashSelection({ scrollToStatic = false } = {}) {
    const targetScript = findScriptByHash(window.location.hash);
    if (!targetScript) return;
    state.selected = targetScript;
    renderAll();
    if (scrollToStatic) {
      const target = document.getElementById(buildScriptAnchor(targetScript.file));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function activateTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.toggle('active', content.id === `tab-${tab}`));
    runActiveTabMermaid();
  }

  function getFilteredScripts() {
    return state.scripts.filter(script => {
      const searchMatch = !state.filters.search || script.file.toLowerCase().includes(state.filters.search);
      const statusMatch = state.filters.status === 'all' || script.status === state.filters.status;
      const severityMatch = state.filters.severity === 'all' || script.severity === state.filters.severity;
      const priorityMatch = state.filters.priority === 'all' || script.priority === state.filters.priority;
      const typeMatch = state.filters.type === 'all' || script.scriptType === state.filters.type;
      return searchMatch && statusMatch && severityMatch && priorityMatch && typeMatch;
    });
  }

  function deriveScriptType(file, script) {
    const value = `${file} ${(script.indicadores || {}).rolModulo || ''}`.toLowerCase();
    if (/runner|orquest/.test(value)) return 'runner';
    if (/repair|mantenimiento|fix/.test(value)) return 'reparacion';
    if (/portal|api|formulario|interfaz/.test(value)) return 'interfaz';
    if (/export|concili|integration|integraci/.test(value)) return 'integracion';
    if (/core|schema|config|sync/.test(value)) return 'nucleo';
    if (/charges|payments|applications|reversals|statements|automation/.test(value)) return 'soporte';
    return 'salida';
  }

  function deriveSeverity(script) {
    const raw = String(((script.indicadores || {}).semaforo || '')).toLowerCase();
    if (raw.includes('roj')) return 'rojo';
    if (raw.includes('verd')) return 'verde';
    return 'amarillo';
  }

  function deriveStatus(file, severity) {
    if (FILE_OVERRIDES[file] && FILE_OVERRIDES[file].status) return FILE_OVERRIDES[file].status;
    if (severity === 'rojo') return 'bloqueado';
    if (severity === 'amarillo') return 'funciona parcial';
    return 'funciona';
  }

  function derivePriority(file, severity, script) {
    if (/^9\d_|^99_/.test(file) && severity !== 'rojo') return 'media';
    if (severity === 'rojo') return 'alta';
    if ((script.indicadores || {}).acoplamientoExternoProxy >= 80) return 'alta';
    if (severity === 'amarillo') return 'media';
    return 'baja';
  }

  function deriveMaturity(file, severity) {
    if (FILE_OVERRIDES[file] && FILE_OVERRIDES[file].maturity) return FILE_OVERRIDES[file].maturity;
    if (severity === 'rojo') return 'requiere rediseño';
    if (severity === 'amarillo') return 'pendiente de validacion real';
    return 'estable';
  }

  function deriveRiskScore(file, severity, script) {
    let score = severity === 'rojo' ? 85 : severity === 'amarillo' ? 62 : 28;
    score += Math.min(((script.indicadores || {}).acoplamientoExternoProxy || 0) / 4, 12);
    score += Math.min((script.totalLines || 0) / 180, 10);
    score += Math.min((script.riesgos || []).length * 2, 8);
    if (file === '09_V3_Statements.gs.js') score = 96;
    if (file === '10_V3_PortalExport.gs.js') score = Math.max(score, 74);
    return Math.round(Math.min(score, 100));
  }

  function derivePurpose(file, script, impactAreas) {
    const business = summarizeImpact(impactAreas);
    const source = cleanText(script.summaryEjecutivo || script.summaryTecnico || '');
    if (source) return `${source} Impacta especialmente ${business}.`;
    return `Gestiona el bloque ${script.scriptType} del proyecto y toca ${business}.`;
  }

  function deriveDiagnosis(file, script, severity) {
    if (FILE_OVERRIDES[file] && FILE_OVERRIDES[file].diagnosis) return FILE_OVERRIDES[file].diagnosis;
    const risk = cleanText((script.riesgos || [])[0] || '');
    if (risk) return risk;
    if (severity === 'rojo') return 'Presenta señales de alta fragilidad por tamaño, acoplamiento o dependencia externa.';
    if (severity === 'amarillo') return 'Opera, pero necesita validación real y pruebas dirigidas antes de tratarse como estable.';
    return 'No muestra conflicto crítico en el análisis estructural actual.';
  }

  function deriveConclusion(file, severity, priority) {
    if (file === '09_V3_Statements.gs.js') {
      return 'Es el archivo más sensible del sistema actual: cualquier cierre debe apoyarse en validación real de febrero y no solo en revisión de código.';
    }
    if (severity === 'rojo') return `Conviene intervenirlo pronto porque combina riesgo ${priority} y posibilidad de propagación a otros módulos.`;
    if (severity === 'amarillo') return 'Debe observarse con pruebas y no declararse estable sin evidencia operativa.';
    return 'Puede conservarse mientras se estabilizan primero los módulos más críticos.';
  }

  function deriveImpactAreas(file, script) {
    const source = `${file} ${(script.summaryTecnico || '')} ${(script.summaryEjecutivo || '')} ${(script.calls || []).join(' ')}`.toLowerCase();
    const checks = [
      ['cargos escolares', /charge|cargo/],
      ['pagos', /payment|pago/],
      ['recargos', /reversal|recargo/],
      ['mora', /mora/],
      ['resumen', /resumen|statement/],
      ['detalle', /detalle|statement/],
      ['portal', /portal/],
      ['conciliacion', /concili/],
      ['exportacion contable', /export|contable/],
      ['automatizacion', /automation|runner|orquest/],
      ['runners', /runner|orquest/],
      ['configuracion', /config|schema|core|sync/],
      ['formularios', /formulario|form/]
    ];

    return checks.map(([label, regex]) => ({ label, active: regex.test(source) }));
  }

  function deriveAffectedSheets(file, impactAreas) {
    const list = [];
    if (hasImpact(impactAreas, 'cargos escolares')) list.push('CARGOS_ESCOLARES');
    if (hasImpact(impactAreas, 'pagos')) list.push('PAGOS_REPORTADOS', 'APLICACION_PAGOS');
    if (hasImpact(impactAreas, 'resumen')) list.push('ESTADO_CUENTA_RESUMEN');
    if (hasImpact(impactAreas, 'detalle')) list.push('ESTADO_CUENTA_DETALLE');
    if (hasImpact(impactAreas, 'portal')) list.push('PORTAL_PADRES_EXPORT');
    if (hasImpact(impactAreas, 'conciliacion')) list.push('CONCILIACION');
    if (hasImpact(impactAreas, 'exportacion contable')) list.push('EXPORT_CONTABILIDAD');
    if (hasImpact(impactAreas, 'configuracion')) list.push('CONFIG', 'PARAMETROS', 'REGLAS_COBRO');
    return uniqueList(list);
  }

  function deriveRecommendation(severity, file) {
    if (severity === 'rojo') return file.startsWith('09_') ? 'tocar ahora' : 'observar primero';
    if (severity === 'amarillo') return 'tocar despues';
    return 'conservar porque funciona';
  }

  function deriveSymptoms(file, impactAreas, severity, downstreamFiles) {
    const symptoms = [];
    if (file === '09_V3_Statements.gs.js') {
      return [
        'Puede colapsar movimientos del período en saldo anterior o SALDO_INICIAL.',
        'Puede dejar Total_Cargos o Total_Pagos en cero aun con actividad real.',
        'Puede degradar Resumen, Detalle, Portal y Exportación contable por propagación.'
      ];
    }
    if (file === '10_V3_PortalExport.gs.js') {
      return [
        'Puede mostrar salidas vacías o degradadas si Resumen y Detalle llegan incompletos.',
        'Puede trasladar el síntoma al portal o al archivo contable aunque la causa raíz esté fuera del módulo.'
      ];
    }
    if (hasImpact(impactAreas, 'pagos')) symptoms.push('Puede dejar pagos sin aplicar o sin reflejo completo en hojas derivadas.');
    if (hasImpact(impactAreas, 'cargos escolares')) symptoms.push('Puede afectar la generación correcta de cargos base o descuentos.');
    if (hasImpact(impactAreas, 'conciliacion')) symptoms.push('Puede dejar conciliaciones vacías o fuera de corte.');
    if (hasImpact(impactAreas, 'portal')) symptoms.push('Puede alterar la lectura final que ve operación o familias.');
    if (!symptoms.length) symptoms.push(severity === 'rojo' ? 'Puede romper el flujo general por acoplamiento alto.' : 'No hay síntoma operativo crítico confirmado en este momento.');
    if (downstreamFiles.length) symptoms.push(`Si falla, se propaga hacia ${downstreamFiles.slice(0, 3).join(', ')}.`);
    return symptoms;
  }

  function deriveCauses(file, script, severity) {
    if (file === '09_V3_Statements.gs.js') {
      return [
        'Clasificación de movimientos del período versus saldo anterior todavía es frágil en escenarios reales.',
        'La propagación descendente depende de reconstruir correctamente Resumen y Detalle.',
        'La validación funcional quedó bloqueada por permisos de ejecución remota.'
      ];
    }
    const causes = [];
    if ((script.indicadores || {}).acoplamientoExternoProxy >= 80) causes.push('Acoplamiento externo alto: cambios aguas arriba pueden romperlo sin aviso.');
    if ((script.totalLines || 0) >= 900) causes.push('Concentración alta de lógica en un solo archivo.');
    if ((script.riesgos || []).length) causes.push(cleanText(script.riesgos[0]));
    if (!causes.length) causes.push(severity === 'verde' ? 'No se observa causa crítica fuerte en el dataset.' : 'Requiere análisis de contrato de entradas y salidas.');
    return causes;
  }

  function deriveWhatNotDo(file, type) {
    const generic = [
      'No corregir aquí síntomas cuya causa raíz esté aguas arriba.',
      'No mezclar cambios funcionales y refactor estructural en el mismo ciclo.',
      'No tocar reglas contables o de producción sin validación real del flujo.'
    ];
    if (type === 'runner') generic.unshift('No usar este archivo para arreglar lógica de negocio que debe vivir en módulos funcionales.');
    if (type === 'integracion' || type === 'interfaz') generic.unshift('No intentar recalcular negocio aquí si la fuente viene mal desde módulos anteriores.');
    return generic;
  }

  function deriveBadPatterns(script) {
    const patterns = [];
    if ((script.totalLines || 0) >= 1000) patterns.push('Sobrecarga de responsabilidades en un solo archivo.');
    if ((script.indicadores || {}).acoplamientoExternoProxy >= 80) patterns.push('Dependencias frágiles con otros módulos.');
    if ((script.functions || []).length >= 18) patterns.push('Densidad funcional alta; el módulo puede estar haciendo demasiadas cosas.');
    if (deriveHardcodedFunctions(script).length) patterns.push('Existen funciones con hardcoding temporal o por fecha.');
    if ((script.riesgos || []).length) patterns.push(cleanText((script.riesgos || [])[0]));
    if (!patterns.length) patterns.push('No se detecta mala práctica dominante en la evidencia disponible.');
    return uniqueList(patterns);
  }

  function deriveBusinessRules(file, impactAreas) {
    const rules = [];
    if (hasImpact(impactAreas, 'cargos escolares')) rules.push('Debe respetar reglas de cobro, grado, período y descuentos configurados.');
    if (hasImpact(impactAreas, 'pagos')) rules.push('Debe conservar trazabilidad entre pago reportado, aplicación y saldo final.');
    if (hasImpact(impactAreas, 'recargos') || hasImpact(impactAreas, 'mora')) rules.push('Debe aplicar temporalidad y vencimiento sin romper consistencia del estado de cuenta.');
    if (hasImpact(impactAreas, 'resumen') || hasImpact(impactAreas, 'detalle')) rules.push('Debe distinguir saldo anterior, movimientos del período y salidas derivadas.');
    if (hasImpact(impactAreas, 'portal') || hasImpact(impactAreas, 'exportacion contable')) rules.push('No debe publicar o exportar información degradada sin advertencia.');
    if (!rules.length) rules.push('Reglas de negocio específicas no visibles en el dataset actual.');
    return rules;
  }

  function deriveHistory(file, generatedAt) {
    const history = [{
      date: generatedAt || '2026-04-16',
      change: 'Generación de análisis estructural del archivo.',
      reason: 'Documentar riesgo, funciones y llamadas.',
      result: 'Archivo incorporado al tablero técnico.',
      state: 'documentado'
    }];

    if (file === '09_V3_Statements.gs.js') {
      history.unshift({
        date: '2026-04-16 10:45',
        change: 'Ajuste de clasificación por período con fallback por fecha.',
        reason: 'Evitar degradación de movimientos a saldo anterior.',
        result: 'Cambio de código aplicado; falta validación real en hojas.',
        state: 'abierto'
      });
      history.unshift({
        date: '2026-04-16 20:35',
        change: 'Intento de validación real de febrero.',
        reason: 'Cerrar iteración 2 con evidencia observada.',
        result: 'Bloqueado por permisos de ejecución remota.',
        state: 'bloqueado'
      });
    }

    return history;
  }

  function deriveGlossary(file, impactAreas, type) {
    return {
      simple: `${file} es una pieza ${type} del sistema escolar.` ,
      job: `Se encarga principalmente de ${summarizeImpact(impactAreas)} dentro del flujo de CARGOS_MORA.`,
      why: `Si falla, puede afectar visibilidad, cálculo o salida de ${summarizeImpact(impactAreas)}.`
    };
  }

  function deriveOrphanFunctions(script, upstreamFiles) {
    const calledWithinScript = new Set((script.calls || []).filter(name => (script.functions || []).some(fn => fn.name === name)));
    return (script.functions || [])
      .map(fn => fn.name)
      .filter(name => !calledWithinScript.has(name) && !/^run/i.test(name) && !upstreamFiles.length);
  }

  function deriveHardcodedFunctions(script) {
    return (script.functions || []).map(fn => fn.name).filter(name => /2026|feb|hoy|preview|real/i.test(name));
  }

  function deriveCoupledFunctions(script) {
    return (script.blocks || [])
      .filter(block => block.type === 'function' && (block.calls || []).length >= 5)
      .map(block => block.name)
      .filter(Boolean);
  }

  function deriveFragileFunctions(script, severity) {
    return (script.functions || [])
      .filter(fn => severity === 'rojo' || /aplicar|resolver|construir|concili|statement/i.test(fn.name))
      .slice(0, 6)
      .map(fn => fn.name);
  }

  function deriveSplitCandidates(script) {
    if ((script.totalLines || 0) < 800 && (script.functions || []).length < 16) return [];
    return (script.functions || []).slice(0, 4).map(fn => `${fn.name} podría separarse en helper especializado.`);
  }

  function deriveProtectedFunctions(file, script) {
    if (/^00_|^01_|^02_/.test(file)) {
      return (script.functions || []).slice(0, 3).map(fn => fn.name);
    }
    if (file === '09_V3_Statements.gs.js') {
      return ['v3StatementsResolverPeriodoMovimiento_', 'v3StatementsMovimientoPerteneceAPeriodo_', 'v3StatementsMovimientoEsAnteriorAPeriodo_'];
    }
    return [];
  }

  function deriveDirectionImportance(script) {
    return [
      `Importa porque gobierna ${summarizeImpact(script.impactAreas)}.`,
      `Toca ${script.affectedSheets.join(', ') || 'salidas del proyecto'}.`,
      `Si falla, afecta ${script.downstreamFiles.length ? script.downstreamFiles.slice(0, 3).join(', ') : 'la operación del bloque actual'}.`
    ];
  }

  function deriveDirectionRisk(script) {
    return [
      `Riesgo técnico ${script.score}/100 con severidad ${script.severity}.`,
      `No corregirlo puede amplificar síntomas en ${script.affectedSheets.slice(0, 3).join(', ') || 'salidas dependientes'}.`,
      `Conviene ${directionDecision(script)}.`
    ];
  }

  function directionDecision(script) {
    if (script.recommendation === 'tocar ahora') return 'intervenirlo ahora';
    if (script.recommendation === 'no tocar todavia') return 'esperar a estabilizar sus entradas';
    if (script.recommendation === 'observar primero') return 'observarlo primero con pruebas controladas';
    return 'programarlo después de los módulos críticos';
  }

  function deriveImmediateActions(script) {
    return [
      `Aislar el síntoma principal: ${script.symptoms[0] || script.diagnosis}`,
      `Ejecutar prueba mínima sobre ${script.affectedSheets[0] || 'la salida principal'}.`,
      `No modificar ${script.whatNotDo[0]}`
    ];
  }

  function deriveStructuralActions(script) {
    return [
      script.badPatterns[0] || 'Reducir acoplamiento y separar responsabilidades.',
      'Formalizar contratos de entrada/salida entre módulos dependientes.',
      'Agregar validación explícita y evidencia poscambio.'
    ];
  }

  function deriveMinimumTests(script) {
    return [
      'Caso normal con datos esperados.',
      'Caso vacío o sin filas relevantes.',
      'Caso inválido o inconsistente que no debe romper el flujo.',
      `Verificación manual en ${script.affectedSheets.slice(0, 2).join(' y ') || 'la hoja de salida'}.`
    ];
  }

  function deriveExpectedValidation(script) {
    return [
      `La salida de ${script.affectedSheets[0] || 'la hoja principal'} debe reflejar el cambio sin degradar módulos descendentes.`,
      'No deben aparecer nuevos vacíos, saldos colapsados o bloqueos en el flujo.',
      'Las dependencias relacionadas deben seguir operando con el mismo contrato.'
    ];
  }

  function deriveClosureCriteria(script) {
    return [
      'Síntoma principal reproducido, corregido y revalidado.',
      'Salida observada en hoja o portal consistente con el objetivo del bloque.',
      'No hay regresión visible en scripts dependientes inmediatos.',
      `Decisión final alineada con: ${capitalize(script.recommendation)}.`
    ];
  }

  function deriveInputs(script) {
    const values = [];
    if (script.upstreamFiles.length) values.push(...script.upstreamFiles.map(file => `Salida de ${file}`));
    if (script.criticalConstants.length) values.push(`Configuración: ${script.criticalConstants.slice(0, 3).join(', ')}`);
    if (script.calls && script.calls.length) values.push(`Dependencias invocadas: ${script.calls.slice(0, 4).join(', ')}`);
    return uniqueList(values.length ? values : ['Entradas no explícitas en dataset']);
  }

  function deriveOutputs(script) {
    const values = [];
    if (script.downstreamFiles.length) values.push(...script.downstreamFiles.map(file => `Alimenta a ${file}`));
    if (script.affectedSheets.length) values.push(...script.affectedSheets.map(sheet => `Impacta ${sheet}`));
    return uniqueList(values.length ? values : ['Salidas no explícitas en dataset']);
  }

  function deriveStrengths(script) {
    const strengths = [];
    if (script.severity === 'verde') strengths.push('No aparece en el grupo de mayor riesgo del tablero.');
    if ((script.functions || []).length <= 10) strengths.push('Tamaño funcional relativamente controlable.');
    if ((script.constants || []).length) strengths.push('Tiene constantes visibles que ayudan a estructurar configuración o reglas.');
    if (script.downstreamFiles.length <= 2) strengths.push('Cadena descendente acotada frente a otros módulos más acoplados.');
    if (!strengths.length) strengths.push('Tiene una responsabilidad identificable dentro del ecosistema y puede analizarse por archivo.');
    return strengths;
  }

  function deriveVisibleSymptoms(script) {
    return [
      ...script.symptoms,
      `Errores propagables hacia: ${script.downstreamFiles.join(', ') || 'sin dependencia descendente visible'}`
    ];
  }

  function deriveWhatWorks(script) {
    const items = [];
    if (script.severity === 'verde') items.push('No muestra señales de riesgo crítico en el dataset actual.');
    if (script.functions && script.functions.length) items.push(`El módulo expone ${script.functions.length} funciones identificables para trazabilidad.`);
    if (script.affectedSheets.length) items.push(`Su ámbito funcional se puede seguir hasta ${script.affectedSheets.slice(0, 3).join(', ')}.`);
    if (!items.length) items.push('Tiene una responsabilidad reconocible dentro del flujo general.');
    return items;
  }

  function deriveWhyMatters(script) {
    return [
      `Participa en ${summarizeImpact(script.impactAreas)}.`,
      `Su salida toca ${script.affectedSheets.join(', ') || 'módulos dependientes'}.`,
      `Puede alterar ${script.downstreamFiles.length ? script.downstreamFiles.slice(0, 3).join(', ') : 'el flujo interno del sistema'} si se rompe.`
    ];
  }

  function buildDependencyRows(script) {
    return [{
      alimentadoPor: script.upstreamFiles.join(', ') || 'Sin evidencia',
      dependeDe: deriveInputs(script)[0] || 'Sin evidencia',
      impactaA: script.downstreamFiles.join(', ') || 'Sin evidencia',
      hojaOrigen: script.affectedSheets[0] || 'No visible',
      hojaDestino: script.affectedSheets.slice(1).join(', ') || script.affectedSheets[0] || 'No visible',
      acoplamiento: couplingLabel(script)
    }];
  }

  function buildEvidence(script, index) {
    if (script.file === '09_V3_Statements.gs.js') {
      return index === 0
        ? 'Incidencia documentada en iteración 2 y comparación antes/después del tablero.'
        : 'Bloque de validación real todavía pendiente por permisos.';
    }
    return cleanText(script.summaryTecnico || 'Evidencia indirecta desde estructura, llamadas y riesgos.');
  }

  function getCotejoRecord(file) {
    const base = COTEJO_RECORDS[file];
    if (base) return base;
    return {
      cotejoEstado: 'PENDIENTE DE COTEJO',
      confianza: 'Pendiente de validación',
      fidelidad: 0,
      selloFinal: 'requiere análisis más profundo',
      veredicto: 'Pendiente de lectura técnica completa del script real.',
      queHace: [],
      queNoHace: [],
      entradas: [],
      salidas: [],
      hojas: [],
      reglasNegocio: [],
      funcionesCriticas: [],
      dependeDe: [],
      dependientes: [],
      flujoCompartido: [],
      conflictos: {
        confirmados: [],
        hipotesis: [],
        pendientes: ['Pendiente de cotejo técnico script por script.']
      },
      diferencias: [{
        webDecia: 'Sin revisión detallada.',
        scriptMuestra: 'Pendiente de lectura real del archivo.',
        ajuste: 'No aplicar conclusiones hasta cotejar.'
      }],
      matrizVerdad: {
        descripcionValidada: false,
        dependenciasValidadas: false,
        funcionesCriticasValidadas: false,
        conflictosValidados: false,
        flujoValidado: false
      },
      riesgoInterpretacion: 'Alto: no hay lectura completa todavía.'
    };
  }

  function boolMark(value) {
    return value ? 'Sí' : 'No';
  }

  function countBySeverity(scripts) {
    return scripts.reduce((acc, script) => {
      acc[script.severity] = (acc[script.severity] || 0) + 1;
      return acc;
    }, { rojo: 0, amarillo: 0, verde: 0 });
  }

  function impactScore(script) {
    return Math.min(script.impactAreas.filter(area => area.active).length * 12 + script.downstreamFiles.length * 8, 100);
  }

  function hasImpact(impactAreas, label) {
    return impactAreas.some(area => area.label === label && area.active);
  }

  function buildRoleFromType(type, impactAreas) {
    return `Módulo ${type} que participa en ${summarizeImpact(impactAreas)}.`;
  }

  function couplingLabel(script) {
    const value = (script.indicadores || {}).acoplamientoExternoProxy || 0;
    if (value >= 80) return 'alto';
    if (value >= 45) return 'medio';
    return 'bajo';
  }

  function detectDomain(text) {
    const value = String(text || '').toLowerCase();
    if (/charge|cargo/.test(value)) return 'cargos';
    if (/payment|pago|application/.test(value)) return 'pagos y aplicación';
    if (/reversal|mora|recargo/.test(value)) return 'recargos y mora';
    if (/statement|resumen|detalle/.test(value)) return 'estados de cuenta';
    if (/portal|export|api|contable/.test(value)) return 'integración y exportación';
    if (/schema|config|setup|sync/.test(value)) return 'configuración y sincronización';
    if (/runner|orquest|automation/.test(value)) return 'orquestación';
    if (/concili/.test(value)) return 'conciliación';
    return 'operación del sistema';
  }

  function deriveInterventionOrder(file) {
    if (/^00_|^01_|^02_/.test(file)) {
      return ['Validar base y encabezados.', 'Verificar contratos de configuración.', 'Usar como piso antes de tocar módulos dependientes.'];
    }
    if (/^03_|^04_/.test(file)) {
      return ['Confirmar configuración base.', 'Validar sincronización.', 'Luego intervenir captura o procesamiento.'];
    }
    if (/^05_|^06_/.test(file)) {
      return ['Asegurar entradas válidas.', 'Validar aplicación de datos.', 'Recién después tocar estados o exportación.'];
    }
    if (/^07_|^08_|^09_/.test(file)) {
      return ['Aislar el cálculo núcleo.', 'Probar con febrero y escenarios de negocio.', 'Reconstruir salidas derivadas.'];
    }
    if (/^10_|^17_|^18_/.test(file)) {
      return ['Confirmar primero las entradas aguas arriba.', 'Validar salidas visibles.', 'No reabrir cálculo base aquí.'];
    }
    return ['Revisar dependencias reales.', 'Tocar al final si no es causa raíz.', 'Cerrar con evidencia visible.'];
  }

  function deriveRedundantFunctions(script) {
    const names = new Map();
    (script.functions || []).forEach(fn => {
      const key = fn.name.toLowerCase().replace(/preview|real|hoy|ahora|feb2026|ano2026/g, '');
      names.set(key, (names.get(key) || []).concat(fn.name));
    });
    return [...names.values()].filter(group => group.length > 1).map(group => group.join(' / '));
  }

  function summarizeImpact(impactAreas) {
    const active = impactAreas.filter(area => area.active).map(area => area.label);
    if (!active.length) return 'operación técnica interna';
    return active.slice(0, 4).join(', ');
  }

  function semaforoClass(value) {
    const text = String(value || '').toLowerCase();
    if (text.includes('roj')) return 'rojo';
    if (text.includes('verd')) return 'verde';
    if (text.includes('crit')) return 'critico';
    return 'amarillo';
  }

  function renderList(items, fallback) {
    return items.length ? items.map(item => `<li>${escapeHtml(item)}</li>`).join('') : `<li>${escapeHtml(fallback)}</li>`;
  }

  function uniqueList(values) {
    return [...new Set((values || []).filter(Boolean))];
  }

  function slugify(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function fixText(value) {
    return String(value || '')
      .replace(/\?/g, '')
      .replace(/lneas/g, 'líneas')
      .replace(/funcin/g, 'función')
      .replace(/funciones top-level/g, 'funciones top-level')
      .replace(/crtico/g, 'crítico')
      .replace(/tecnico/g, 'técnico')
      .replace(/modulo/g, 'módulo')
      .replace(/dependencia implcita/g, 'dependencia implícita')
      .replace(/regresin/g, 'regresión')
      .replace(/bitcora/g, 'bitácora')
      .replace(/validacin/g, 'validación')
      .replace(/ejecucin/g, 'ejecución')
      .replace(/relacin/g, 'relación')
      .replace(/configuracin/g, 'configuración')
      .replace(/informacin/g, 'información')
      .replace(/auditoria/g, 'auditoría')
      .replace(/operacin/g, 'operación')
      .replace(/lógica hardcoded/g, 'lógica hardcoded')
      .trim();
  }

  function cleanText(value) {
    return fixText(value)
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
      .trim();
  }

  function capitalize(value) {
    const text = cleanText(value);
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  function escapeMermaid(value) {
    return String(value || '').replace(/"/g, '').replace(/</g, '').replace(/>/g, '');
  }

  function escapeHtml(value) {
    const text = cleanText(value);
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
