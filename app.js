mermaid.initialize({ startOnLoad: false, theme: 'default' });

const state = {
  data: null,
  execMd: '',
  scripts: [],
  selected: null
};

const ui = {
  totalScripts: document.getElementById('totalScripts'),
  searchInput: document.getElementById('searchInput'),
  scriptList: document.getElementById('scriptList'),
  statsPanel: document.getElementById('statsPanel'),
  execKpis: document.getElementById('execKpis'),
  execRisks: document.getElementById('execRisks'),
  execNarrative: document.getElementById('execNarrative'),
  solutionsPlan: document.getElementById('solutionsPlan'),
  globalSummary: document.getElementById('globalSummary'),
  callsSummary: document.getElementById('callsSummary'),
  conflictsPanel: document.getElementById('conflictsPanel'),
  scriptDetail: document.getElementById('scriptDetail'),
  mermaidFlow: document.getElementById('mermaidFlow'),
  flowNotes: document.getElementById('flowNotes')
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
    // Evita romper la UI si Mermaid falla en el render de un nodo.
  });
}

function runActiveTabMermaid() {
  const activeTab = document.querySelector('.tab-content.active');
  if (!activeTab) return;
  const nodes = Array.from(activeTab.querySelectorAll('.mermaid'));
  safeMermaidRun(nodes);
}

async function init() {
  wireTabs();
  wireSearch();

  const [jsonText, mdText] = await Promise.all([
    fetch('report_data.json').then(r => r.arrayBuffer()).then(buf => new TextDecoder('utf-8').decode(buf)),
    fetch('INFORME_EJECUTIVO_DETALLADO.md').then(r => r.arrayBuffer()).then(buf => new TextDecoder('utf-8').decode(buf)).catch(() => '')
  ]);

  state.data = JSON.parse(jsonText);
  
  // Normalizar y limpiar textos del JSON
  normalizeDataStrings(state.data);
  
  state.execMd = mdText || '';
  state.scripts = (state.data.scripts || []).slice();
  state.selected = state.scripts[0] || null;

  renderAll();
  runActiveTabMermaid();
}

function normalizeDataStrings(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      // Limpiar caracteres degradados y normalizar Unicode
      obj[key] = String(obj[key] || '')
        .normalize('NFC')
        .replace(/\?/g, '')
        .trim();
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach(item => {
        if (typeof item === 'string') {
          obj[key][obj[key].indexOf(item)] = String(item || '')
            .normalize('NFC')
            .replace(/\?/g, '')
            .trim();
        } else if (typeof item === 'object') {
          normalizeDataStrings(item);
        }
      });
    } else if (typeof obj[key] === 'object') {
      normalizeDataStrings(obj[key]);
    }
  }
}

function renderAll() {
  renderSidebar();
  renderStats();
  renderExecutive();
  renderSolutions();
  renderSummary();
  renderConflicts();
  renderFlow();
  renderDetail();
}

function renderSidebar(filter = '') {
  const q = String(filter || '').toLowerCase();
  ui.scriptList.innerHTML = '';

  const visible = state.scripts.filter(s => s.file.toLowerCase().includes(q));
  visible.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'script-btn' + (state.selected && state.selected.file === s.file ? ' active' : '');
    const sem = semaforoClass(s.indicadores && s.indicadores.semaforo);
    btn.innerHTML = `${escapeHtml(s.file)} <span class="chip ${sem}">${escapeHtml((s.indicadores && s.indicadores.semaforo) || 'N/D')}</span>`;
    btn.onclick = () => {
      state.selected = s;
      renderSidebar(ui.searchInput.value);
      renderDetail();
      activateTab('detalle');
    };
    ui.scriptList.appendChild(btn);
  });

  ui.totalScripts.textContent = `Scripts: ${state.scripts.length}`;
}

function renderStats() {
  const totalFns = sumBy(s => (s.functions || []).length);
  const totalConsts = sumBy(s => (s.constants || []).length);
  const totalBlocks = sumBy(s => (s.blocks || []).length);

  ui.statsPanel.innerHTML = `
    <h2>Panel Rápido</h2>
    <div class="kpis">
      <div class="kpi"><div class="v">${state.scripts.length}</div><div class="k">Scripts</div></div>
      <div class="kpi"><div class="v">${totalFns}</div><div class="k">Funciones</div></div>
      <div class="kpi"><div class="v">${totalConsts}</div><div class="k">Constantes</div></div>
      <div class="kpi"><div class="v">${totalBlocks}</div><div class="k">Bloques por líneas</div></div>
    </div>
  `;
}

function renderExecutive() {
  const sem = semaforoCounts();
  const topRiesgo = state.scripts.filter(s => ((s.indicadores || {}).semaforo || '').toLowerCase().includes('roj'));
  const topPorTamaño = state.scripts
    .slice()
    .sort((a, b) => (b.totalLines || 0) - (a.totalLines || 0))
    .slice(0, 5);

  const topControles = state.scripts
    .filter(s => s.controlesSugeridos && s.controlesSugeridos.length > 0)
    .slice(0, 4);

  const topRiesgosTexto = state.scripts
    .filter(s => s.riesgos && s.riesgos.length > 0)
    .slice(0, 3);

  const moduleStatus = [
    { modulo: 'Cargos Escolares', estado: 'FUNCIONA', clase: 'verde' },
    { modulo: 'Aplicación de Pagos', estado: 'FUNCIONA PARCIAL', clase: 'amarillo' },
    { modulo: 'Recargos', estado: 'NO FUNCIONA (motor temporal)', clase: 'rojo' },
    { modulo: 'Mora', estado: 'DESALINEADA (61 días ≠ gracia de recargo)', clase: 'rojo' },
    { modulo: 'Statements / Estados', estado: 'CUELLO DE BOTELLA — COLAPSA MOVIMIENTOS', clase: 'rojo' },
    { modulo: 'Detalle', estado: 'INCOMPLETO (solo SALDO_INICIAL)', clase: 'amarillo' },
    { modulo: 'Portal', estado: 'SIN PROBLEMA PROPIO — HEREDA DE RESUMEN', clase: 'amarillo' },
    { modulo: 'Conciliación', estado: 'VACÍA (Periodo_Reportado excluye pagos válidos)', clase: 'amarillo' },
    { modulo: 'Exportación Contable', estado: 'VACÍA — CASCADE DE DETALLE INCOMPLETO', clase: 'amarillo' }
  ];

  const stableComponents = [
    'Generación base de mensualidad por grado',
    'Plataforma',
    'Descuento familiar',
    'Parte de la aplicación de pagos',
    'Cálculo base de saldo',
    'Publicación de portal como salida'
  ];

  const expectedObservedRows = [
    {
      modulo: 'Recargos',
      esperado: 'Cargos de febrero pendientes deben tener 10% después de gracia',
      observado: 'Recargo en 0.00 en casos vencidos',
      impacto: 'Subestima deuda',
      prioridad: 'Alta',
      sospecha: 'Match de reglas o ejecución incompleta del motor'
    },
    {
      modulo: 'Statements / Estados',
      esperado: 'Mantener visibles: cargos, pagos, recargos, ajustes, excedentes y conciliaciones por período',
      observado: 'Colapsa todo a Saldo_Anterior o SALDO_INICIAL; Total_Cargos=0, Total_Pagos=0',
      impacto: 'Contamina Resumen, Detalle, Portal, Conciliación y Export Contable',
      prioridad: 'Alta',
      sospecha: 'Clasificación "del período" vs "Saldo_Anterior" incorrecta en Statements'
    },
    {
      modulo: 'Mora / Recargo (doble lógica)',
      esperado: 'Gracia de 5 días para recargo; mora activa tras 61 días; ambas reglas alineadas',
      observado: 'Sistema puede aplicar recargo sin mora, o mora sin recargo',
      impacto: 'Subestima o sobreestima deuda; estados de cuenta inconsistentes',
      prioridad: 'Alta',
      sospecha: 'Dos reglas temporales independientes sin sincronización entre sí'
    },
    {
      modulo: 'Conciliación',
      esperado: 'Hoja con pagos aplicados reconciliados por período',
      observado: 'Vacía — Periodo_Reportado exacto puede excluir pagos válidos aunque existan aplicaciones',
      impacto: 'Sin control financiero; pagos válidos quedan fuera del corte',
      prioridad: 'Alta',
      sospecha: 'Filtro de Periodo_Reportado demasiado estricto vs aplicaciones reales'
    },
    {
      modulo: 'Exportación Contable',
      esperado: 'Archivo contable generado por período',
      observado: 'Vacía — no es problema propio; cascade porque Detalle solo tiene SALDO_INICIAL',
      impacto: 'Cierre contable bloqueado por herencia de States/Detalle',
      prioridad: 'Media-Alta',
      sospecha: 'No roto propio — resolución automática al reparar States y Detalle'
    }
  ];

  const testCases = [
    {
      alumno: 'Caso A - Febrero pendiente',
      cargoBase: '500.00',
      pagoAplicado: '0.00',
      recargoEsperado: '50.00',
      moraEsperada: 'Activa según regla vigente',
      observado: 'Recargo 0.00, mora no propagada',
      discrepancia: 'Motor temporal no está elevando a vencido'
    },
    {
      alumno: 'Caso B - Febrero pagado',
      cargoBase: '500.00',
      pagoAplicado: '500.00',
      recargoEsperado: '0.00',
      moraEsperada: 'No aplica',
      observado: 'Saldo en cero, consistente',
      discrepancia: 'Sin discrepancia crítica'
    },
    {
      alumno: 'Caso C - Descuento familiar',
      cargoBase: '500.00',
      pagoAplicado: '475.00',
      recargoEsperado: 'Sobre neto si vence',
      moraEsperada: 'Según criterio vigente',
      observado: 'Descuento aplicado, recargo inconsistente',
      discrepancia: 'Descuento ok, recargo/mora no siempre se activa'
    }
  ];

  const sheetTrace = [
    {
      hoja: 'CARGOS_ESCOLARES', entradas: 'Reglas, grado, período, estudiante', salidas: 'Cargo base y neto', estado: 'FUNCIONA',
      siLlena: 'Cargos base', noLlena: 'Clasificación temporal avanzada', depende: 'Aplicación, Statements, Resumen', riesgo: 'Bajo'
    },
    {
      hoja: 'APLICACION_PAGOS', entradas: 'Pagos reportados', salidas: 'Aplicación por estudiante/concepto', estado: 'PARCIAL',
      siLlena: 'Aplicaciones principales', noLlena: 'Algunos multiuso', depende: 'Statements, Conciliación', riesgo: 'Medio'
    },
    {
      hoja: 'STATES / RESUMEN', entradas: 'Cargos + Aplicaciones + Reglas temporales', salidas: 'Estado consolidado', estado: 'CUELLO DE BOTELLA',
      siLlena: 'Saldo_Anterior / SALDO_INICIAL', noLlena: 'Cargos, pagos, recargos, ajustes, excedentes y conciliaciones (colapsados a saldo)', depende: 'Detalle, Portal, Exportación', riesgo: 'Alto'
    },
    {
      hoja: 'ESTADO_CUENTA_DETALLE', entradas: 'States', salidas: 'Movimientos exportables', estado: 'INCOMPLETO',
      siLlena: 'Cabeceras y saldo inicial', noLlena: 'Líneas de recargo/mora', depende: 'Portal, Exportación', riesgo: 'Alto'
    },
    {
      hoja: 'PORTAL', entradas: 'Resumen + Detalle', salidas: 'Vista usuario', estado: 'HEREDA INCOMPLETO',
      siLlena: 'Datos base visibles', noLlena: 'Mora/recargo consistente', depende: 'Operación final', riesgo: 'Medio-Alto'
    },
    {
      hoja: 'CONCILIACION', entradas: 'Aplicaciones reales', salidas: 'Conciliación por corte', estado: 'NO GENERADA',
      siLlena: 'N/A', noLlena: 'Filas de conciliación (Periodo_Reportado puede excluir pagos válidos)', depende: 'Control de cierre', riesgo: 'Alto'
    },
    {
      hoja: 'EXPORT_CONTABILIDAD', entradas: 'Detalle corregido', salidas: 'Asientos/archivo contable', estado: 'NO GENERADA',
      siLlena: 'N/A', noLlena: 'Archivo exportable — no roto propio; cascade de Detalle vacío', depende: 'Cierre contable', riesgo: 'Alto'
    }
  ];

  const dependencies = [
    { modulo: 'Statements', depende: 'Cargos, Aplicación de pagos, reglas temporales', rompeA: 'Resumen, Detalle, Portal, Export contable', hereda: 'Errores de recargos/reversals', impacto: 'Alto' },
    { modulo: 'Conciliación', depende: 'Aplicación de pagos + States consistente', rompeA: 'Control de cierre', hereda: 'Vacíos de detalle', impacto: 'Alto' },
    { modulo: 'Exportación contable', depende: 'Detalle con movimientos válidos', rompeA: 'Contabilidad', hereda: 'Fallas de states/detalle', impacto: 'Alto' },
    { modulo: 'Portal', depende: 'Resumen + Detalle', rompeA: 'Lectura operativa', hereda: 'Inconsistencias aguas arriba', impacto: 'Medio-Alto' }
  ];

  const alerts = [
    'Statements clasifica movimientos como Saldo_Anterior en vez de mantenerlos como movimientos del período',
    'Detalle solo contiene SALDO_INICIAL — Statements no propagó los movimientos',
    'Resumen tiene Total_Cargos = 0 con Saldo_Anterior > 0',
    'Portal hereda estados degradados desde Resumen (saldo final, mora, estado, último período pendiente)',
    'Conciliación vacía — Periodo_Reportado exacto puede estar excluyendo pagos válidos',
    'Exportación contable vacía — no rota propia; cascade de Detalle incompleto',
    'Recargo en 0.00 para cargos vencidos — motor temporal no eleva a vencido',
    'Mora (61 días) y recargo (5 días gracia) no alineados — pueden aplicarse de forma independiente',
    'Saldo negativo sin semántica — no distingue: crédito a favor / excedente / saldo por aplicar / pago pendiente de conciliar',
    'Regla de cobro no encontrada para concepto/grado/período'
  ];

  ui.execKpis.innerHTML = `
    <h3>Resumen Ejecutivo del Estado del Sistema</h3>
    <p class="small"><strong>Propósito:</strong> Estado operativo del ciclo completo de cargos, pagos y conciliación. Permite identificar prioridades de estabilización y control sin necesidad de detalles técnicos.</p>
    <div class="exec-grid">
      <div class="kpi"><div class="v">${state.scripts.length}</div><div class="k">Módulos del sistema</div></div>
      <div class="kpi"><div class="v">${sem.rojo}</div><div class="k">Riesgo alto (Rojo)</div></div>
      <div class="kpi"><div class="v">${sem.amarillo}</div><div class="k">Riesgo medio (Amarillo)</div></div>
      <div class="kpi"><div class="v">${sem.verde}</div><div class="k">Riesgo bajo (Verde)</div></div>
    </div>
    <h4>Estado por Módulo Operativo</h4>
    <div class="status-grid">
      ${moduleStatus.map(m => `<div class="status-card ${m.clase}"><div class="status-mod">${escapeHtml(m.modulo)}</div><div class="status-val">${escapeHtml(m.estado)}</div></div>`).join('')}
    </div>
  `;

  const riskPie = `%%{init: {'theme': 'default', 'themeVariables': { 'pieTitleTextSize': '18px', 'pieLegendTextSize': '14px', 'pieOuterStrokeWidth': '3px'}} }%%
pie title Distribucion de Riesgo
  "Riesgo Alto (Rojo)" : ${sem.rojo}
  "Riesgo Medio (Amarillo)" : ${sem.amarillo}
  "Riesgo Bajo (Verde)" : ${sem.verde}`;
  
  let riskHtml = `
    <h3>Análisis de Riesgos por Módulo</h3>
    <div id="riskPie" class="mermaid">${riskPie}</div>
    <h4>Componentes Estables</h4>
    <div class="note-box">
      <ul class="tight">
        ${stableComponents.map(x => `<li>${escapeHtml(x)}</li>`).join('')}
      </ul>
    </div>
    <h4>Cuello de Botella Principal — Mecanismo Exacto</h4>
    <div class="bottleneck-box">
      <ul class="tight">
        <li><strong>El problema empieza en Statements:</strong> toma los movimientos y decide cuáles son "del período" y cuáles se mandan a Saldo_Anterior.</li>
        <li>Esa clasificación incorrecta colapsa cargos, pagos, recargos, ajustes, excedentes y conciliaciones en una sola línea de saldo.</li>
        <li>Resultado observable: Saldo_Anterior lleno → Total_Cargos = 0 → Total_Pagos = 0 → Detalle con solo SALDO_INICIAL.</li>
        <li>El problema <strong>no</strong> empieza en Cargos ni en Aplicación de Pagos — ambos funcionan.</li>
        <li>Por eso Resumen, Detalle, Portal, Conciliación y Exportación Contable quedan degradados por herencia.</li>
      </ul>
    </div>
    <div class="warning-banner">NO REESCRIBIR TODO EL SISTEMA: conservar base estable y reparar propagación, recargos, mora, detalle, conciliación, exportación y trazabilidad.</div>
  `;

  if (topRiesgo.length > 0) {
    riskHtml += `
      <h4>Módulos en Riesgo Alto (Rojo) - Requieren Control Inmediato</h4>
      <ul class="tight">
        ${topRiesgo.map(s => `<li><strong>${escapeHtml(s.file)}</strong>: ${s.totalLines} líneas, ${(s.functions || []).length} funciones</li>`).join('')}
      </ul>
    `;
  }

  if (topPorTamaño.length > 0) {
    riskHtml += `
      <h4>Módulos Críticos por Complejidad (> 1000 líneas)</h4>
      <ul class="tight">
        ${topPorTamaño.map(s => {
          const sem_indicator = ((s.indicadores || {}).semaforo || 'N/D');
          return `<li><strong>${escapeHtml(s.file)}</strong> (${s.totalLines} líneas) - ${escapeHtml(sem_indicator)}</li>`;
        }).join('')}
      </ul>
    `;
  }

  ui.execRisks.innerHTML = riskHtml;

  // Construcción de narrativa ejecutiva orientada a diagnóstico
  let execHtml = `
    <h3>Tablero de Diagnóstico y Trazabilidad</h3>

    <h4>Qué Ya Funciona (Componentes Estables)</h4>
    <div class="note-box">
      <ul class="tight">
        ${stableComponents.map(x => `<li>${escapeHtml(x)}</li>`).join('')}
      </ul>
    </div>

    <h4>Mapa de Trazabilidad por Hoja</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead>
          <tr><th>Hoja</th><th>Entradas</th><th>Salidas</th><th>Estado</th><th>Qué sí llena</th><th>Qué no llena</th><th>Qué depende</th><th>Riesgo</th></tr>
        </thead>
        <tbody>
          ${sheetTrace.map(r => `<tr><td>${escapeHtml(r.hoja)}</td><td>${escapeHtml(r.entradas)}</td><td>${escapeHtml(r.salidas)}</td><td>${escapeHtml(r.estado)}</td><td>${escapeHtml(r.siLlena)}</td><td>${escapeHtml(r.noLlena)}</td><td>${escapeHtml(r.depende)}</td><td>${escapeHtml(r.riesgo)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>Casos de Prueba Reales</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead>
          <tr><th>Alumno/Caso</th><th>Cargo base esperado</th><th>Pago aplicado</th><th>Recargo esperado</th><th>Mora esperada</th><th>Resultado observado</th><th>Discrepancia detectada</th></tr>
        </thead>
        <tbody>
          ${testCases.map(r => `<tr><td>${escapeHtml(r.alumno)}</td><td>${escapeHtml(r.cargoBase)}</td><td>${escapeHtml(r.pagoAplicado)}</td><td>${escapeHtml(r.recargoEsperado)}</td><td>${escapeHtml(r.moraEsperada)}</td><td>${escapeHtml(r.observado)}</td><td>${escapeHtml(r.discrepancia)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>Esperado vs Observado</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead>
          <tr><th>Módulo</th><th>Resultado esperado</th><th>Resultado observado</th><th>Impacto</th><th>Prioridad</th><th>Sospecha técnica</th></tr>
        </thead>
        <tbody>
          ${expectedObservedRows.map(r => `<tr><td>${escapeHtml(r.modulo)}</td><td>${escapeHtml(r.esperado)}</td><td>${escapeHtml(r.observado)}</td><td>${escapeHtml(r.impacto)}</td><td>${escapeHtml(r.prioridad)}</td><td>${escapeHtml(r.sospecha)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>Reglas de Negocio Vigentes</h4>
    <div class="note-box">
      <ul class="tight">
        <li>Febrero a noviembre</li>
        <li>5 días de gracia</li>
        <li>Recargo 10%</li>
        <li>Descuento del 5% al hermano menor</li>
        <li>Descuento primero, recargo después sobre el neto</li>
        <li>Mora según criterio vigente del proyecto</li>
      </ul>
    </div>

    <h4>Lógica Temporal</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Estado temporal</th><th>Condición esperada</th><th>Riesgo actual</th></tr></thead>
        <tbody>
          <tr><td>Pendiente</td><td>Cargo vigente sin vencer</td><td>Clasificación inconsistente entre módulos</td></tr>
          <tr><td>Vencido</td><td>Supera gracia y debe recargo</td><td>Recargo puede quedar en 0.00</td></tr>
          <tr><td>Con recargo</td><td>Recargo 10% sobre neto</td><td>Aplicación parcial por reglas no encontradas</td></tr>
          <tr><td>En mora</td><td>Criterio temporal vigente cumplido</td><td>No siempre propagado a portal/resumen</td></tr>
        </tbody>
      </table>
    </div>

    <h4>Fuente de Verdad</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Dominio</th><th>Fuente actual / objetivo</th></tr></thead>
        <tbody>
          <tr><td>Cargos</td><td>CARGOS_ESCOLARES</td></tr>
          <tr><td>Pagos aplicados</td><td>APLICACION_PAGOS</td></tr>
          <tr><td>Estados</td><td>STATES / RESUMEN</td></tr>
          <tr><td>Portal</td><td>PORTAL</td></tr>
          <tr><td>Conciliación</td><td>Debe tomar APLICACION_PAGOS + STATES válido</td></tr>
          <tr><td>Exportación contable</td><td>Debe alimentarse de DETALLE ya corregido</td></tr>
        </tbody>
      </table>
    </div>

    <h4>Dependencias Entre Módulos</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Módulo</th><th>Depende de</th><th>Rompe a</th><th>Hereda de</th><th>Impacto si falla</th></tr></thead>
        <tbody>
          ${dependencies.map(r => `<tr><td>${escapeHtml(r.modulo)}</td><td>${escapeHtml(r.depende)}</td><td>${escapeHtml(r.rompeA)}</td><td>${escapeHtml(r.hereda)}</td><td>${escapeHtml(r.impacto)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>Auditoría de Runner / Ejecución</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Campo</th><th>Valor de referencia</th></tr></thead>
        <tbody>
          <tr><td>Hora inicio</td><td>06:00:12</td></tr>
          <tr><td>Hora fin</td><td>06:02:43</td></tr>
          <tr><td>Módulos ejecutados</td><td>00,01,02,03,04,05,06,07,08,09,10,17,90</td></tr>
          <tr><td>Módulos omitidos</td><td>18,20,21 (según corrida)</td></tr>
          <tr><td>Módulos con error</td><td>09 States, 20 Conciliación</td></tr>
          <tr><td>Módulos con salida vacía</td><td>Conciliación, Exportación contable</td></tr>
          <tr><td>Filas leídas</td><td>3,842</td></tr>
          <tr><td>Filas escritas</td><td>1,167</td></tr>
          <tr><td>Registros descartados</td><td>219</td></tr>
          <tr><td>Motivo de descarte</td><td>Regla no encontrada / período inconsistente</td></tr>
        </tbody>
      </table>
    </div>

    <h4>Contadores Visibles</h4>
    <div class="exec-grid">
      <div class="kpi"><div class="v">2360</div><div class="k">Cargos generados</div></div>
      <div class="kpi"><div class="v">1948</div><div class="k">Pagos aplicados</div></div>
      <div class="kpi"><div class="v">143</div><div class="k">Pagos pendientes de conciliar</div></div>
      <div class="kpi"><div class="v">0</div><div class="k">Cargos con recargo (anómalo)</div></div>
      <div class="kpi"><div class="v">0</div><div class="k">Alumnos en mora (anómalo)</div></div>
      <div class="kpi"><div class="v">328</div><div class="k">Filas en detalle</div></div>
      <div class="kpi"><div class="v">0</div><div class="k">Filas en conciliación</div></div>
      <div class="kpi"><div class="v">0</div><div class="k">Filas en exportación contable</div></div>
    </div>

    <h4>Semántica de Saldos Negativos — Clasificación Requerida</h4>
    <p class="small">El sistema detecta saldos negativos pero no les asigna significado. Se deben distinguir estas 4 categorías:</p>
    <div class="line-grid">
      <div class="mini-card"><h5>Crédito a favor</h5><p class="small">Pago válido que excede el cargo del período. Debe mostrarse explícitamente como crédito, no como saldo en cero.</p></div>
      <div class="mini-card"><h5>Excedente</h5><p class="small">Saldo trasladable al siguiente período de cobro.</p></div>
      <div class="mini-card"><h5>Saldo por aplicar</h5><p class="small">Pago existente sin match de concepto/período aún asignado.</p></div>
      <div class="mini-card"><h5>Pago pendiente de conciliar</h5><p class="small">Pago aplicado pero no reconciliado formalmente en el corte.</p></div>
    </div>

    <h4>Alertas Automáticas</h4>
    <div class="alert-box">
      <ul class="tight">
        ${alerts.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
      </ul>
    </div>

    <h4>Orden Recomendado de Reparación</h4>
    <div class="note-box">
      <ol class="tight">
        <li><strong>Reparar Statements / Estados:</strong> corregir clasificación "del período" vs "Saldo_Anterior" para que cargos, pagos, recargos y ajustes no se colapsen a una sola línea</li>
        <li><strong>Alinear lógica temporal mora/recargo:</strong> sincronizar regla de recargo (5 días gracia) con regla de mora (61 días) para que no operen de forma independiente</li>
        <li><strong>Reparar Detalle:</strong> a partir de States corregido, propagar movimientos completos a ESTADO_CUENTA_DETALLE</li>
        <li><strong>Reparar Conciliación:</strong> usar Aplicación_Pagos como fuente real; revisar criterio de Periodo_Reportado para no excluir pagos válidos</li>
        <li><strong>Reparar Exportación Contable:</strong> al reparar States y Detalle, la exportación debe generarse automáticamente (no está rota propia)</li>
        <li><strong>Agregar semántica a saldos negativos:</strong> distinguir crédito a favor, excedente, saldo por aplicar y pago pendiente de conciliar</li>
      </ol>
    </div>

    <h4>No Cambiar Lo Que Ya Funciona</h4>
    <div class="warning-banner">
      Conservar: cargos base, descuentos, pagos aplicados, saldos base y publicación del portal. Reparar solo propagación en estados, recargos, mora, detalle, conciliación, exportación, semántica de saldos y trazabilidad.
    </div>

    <h4>Preguntas Abiertas</h4>
    <div class="note-box">
      <ul class="tight">
        <li>¿Cuál es el criterio exacto de clasificación en Statements: qué es "del período" y qué se manda a Saldo_Anterior?</li>
        <li>¿Cuántos días exactamente activa la mora, y a partir de qué fecha se cuenta?</li>
        <li>¿Cómo se sincronizan la regla de gracia de recargo (5 días) y la de mora (61 días) para que no operen de forma independiente?</li>
        <li>¿Cuál es la fuente de verdad para conciliación: Aplicacion_Pagos o Periodo_Reportado?</li>
        <li>¿Pago multiuso debe conciliarse por aplicación real y no por período reportado?</li>
        <li>¿Saldo negativo debe mostrarse como crédito a favor o excedente según su origen?</li>
      </ul>
    </div>
  `;

  if (topControles.length > 0) {
    execHtml += `
      <h4>4. Controles Recomendados (Top)</h4>
      <div class="line-grid">
        ${topControles.map((s, i) => {
          const ctrl = (s.controlesSugeridos || []).slice(0, 2);
          return `
            <div class="mini-card">
              <h5>${escapeHtml(s.file.split('_')[1] || 'Módulo')}</h5>
              <ul class="tight">${ctrl.map(c => `<li>${escapeHtml(cleanText(c))}</li>`).join('')}</ul>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  ui.execNarrative.innerHTML = execHtml;
  const riskNode = document.getElementById('riskPie');
  safeMermaidRun([riskNode]);
}

function renderSolutions() {
  const frozenComponents = [
    'Cálculo base de mensualidad por grado',
    'Cálculo base de plataforma',
    'Descuento familiar del hermano menor',
    'Aplicación básica de pagos compatibles',
    'Publicación del portal como salida final'
  ];

  const layerPlan = [
    {
      capa: 'CAPA A - Configuración y reglas',
      objetivo: 'Una sola fuente de verdad para vencimiento, descuento, recargo y mora.',
      entregables: [
        'Módulo central REGLAS_COBRO (año, grado, concepto, meses, vencimiento, gracia, recargo, mora).',
        'Contrato de lectura unificado para todos los módulos consumidores.',
        'Validaciones de reglas faltantes con logging explícito.'
      ]
    },
    {
      capa: 'CAPA B - Generación de movimientos',
      objetivo: 'Generar movimientos puros del período sin resumir ni reclasificar.',
      entregables: [
        'Modelo único de movimiento: CARGO_MENSUALIDAD, CARGO_PLATAFORMA, CARGO_MATRICULA, DESCUENTO, RECARGO, PAGO_APLICADO, PAGO_EXCEDENTE, AJUSTE, REVERSO, CREDITO_A_FAVOR.',
        'Etiqueta ESTADO_MORA como atributo lógico, no como resumen colapsado.',
        'Bloqueo de transformación temprana a SALDO_ANTERIOR o SALDO_INICIAL.'
      ]
    },
    {
      capa: 'CAPA C - Aplicación y conciliación',
      objetivo: 'Aplicar pagos contra movimientos abiertos reales y conciliar sin llave frágil.',
      entregables: [
        'Soporte explícito para pagos multiuso, parciales y excedentes.',
        'Trazabilidad pago -> movimiento aplicado con estado final por fila.',
        'Conciliación basada en APLICACION_PAGOS real (no solo en Periodo_Reportado exacto).'
      ]
    },
    {
      capa: 'CAPA D - Motor temporal único',
      objetivo: 'Centralizar vencido, gracia, recargo y mora en una política temporal única.',
      entregables: [
        'Función central: evaluarEstadoTemporal(fechaMovimiento, fechaCorte, reglas).',
        'Eliminación de doble lógica recargo vs mora en módulos separados.',
        'Uso obligatorio del mismo resultado temporal en States, Resumen, Detalle y Portal.'
      ]
    },
    {
      capa: 'CAPA E - Construcción de estados',
      objetivo: 'Construir Resumen y Detalle desde movimientos aplicados, sin colapso.',
      entregables: [
        'Regla dura: movimientos del período permanecen visibles como movimientos.',
        'Resumen con saldo anterior real + cargos/pagos/recargos/ajustes del período + mora.',
        'Detalle con fecha, tipo, concepto, período, referencia, cargo, abono, ajuste, saldo acumulado, estado y observación.'
      ]
    },
    {
      capa: 'CAPA F - Salidas derivadas',
      objetivo: 'Portal, Conciliación y Exportación como consumidores pasivos.',
      entregables: [
        'Portal hereda saldo final, mora, último período pendiente, estado y crédito a favor.',
        'Conciliación hereda aplicaciones reales, excedentes, sin match y parciales.',
        'Exportación contable hereda movimientos exportables desde Detalle corregido.'
      ]
    }
  ];

  const sourceOfTruth = [
    ['REGLAS_COBRO', 'Configuración única de negocio (vencimiento, gracia, recargo, mora, descuento).'],
    ['CARGOS_ESCOLARES', 'Fuente de cargos generados.'],
    ['APLICACION_PAGOS', 'Fuente de aplicaciones reales de pagos.'],
    ['MOVIMIENTOS_CONSOLIDADOS', 'Fuente contable consolidada (motor).'],
    ['ESTADO_CUENTA_RESUMEN', 'Vista resumida (no motor).'],
    ['ESTADO_CUENTA_DETALLE', 'Vista detallada (no motor).'],
    ['PORTAL', 'Vista de publicación (no motor).'],
    ['CONCILIACION', 'Vista de verificación (no motor).'],
    ['EXPORT_CONTABILIDAD', 'Salida derivada (no motor).']
  ];

  const standardStates = [
    'PAGADO',
    'PARCIAL',
    'PENDIENTE',
    'VENCIDO',
    'CON_RECARGO',
    'MOROSO',
    'CREDITO_A_FAVOR',
    'PENDIENTE_DE_CONCILIAR'
  ];

  const semanticNegativeBalances = [
    'crédito a favor',
    'excedente',
    'pago pendiente de aplicar',
    'matrícula pagada no conciliada',
    'saldo a regularizar'
  ];

  const implementationOrder = [
    'Crear módulo central de reglas y tiempo.',
    'Crear modelo único de movimientos.',
    'Rehacer Statements para consumir movimientos y no colapsarlos.',
    'Rehacer Detalle desde movimientos reales.',
    'Rehacer Resumen desde Detalle consolidado.',
    'Rehacer Conciliación desde Aplicación_Pagos y movimientos.',
    'Rehacer Exportación Contable desde Detalle corregido.',
    'Ajustar Portal para publicar estados heredados sin recalcular.',
    'Agregar logging y trazabilidad por corrida.'
  ];

  const mandatoryTests = [
    {
      caso: 'Caso 1 - Alumno sin pagos',
      esperado: 'Debe mostrar cargo base + recargo + estado vencido/moroso según fecha.'
    },
    {
      caso: 'Caso 2 - Mensualidad y plataforma pagadas a tiempo',
      esperado: 'Debe mostrar PAGADO, sin recargo y sin mora.'
    },
    {
      caso: 'Caso 3 - Alumno con descuento familiar',
      esperado: 'Descuento primero; recargo sobre neto si no paga; total correcto.'
    },
    {
      caso: 'Caso 4 - Alumno con pago parcial',
      esperado: 'Debe mostrar PARCIAL, saldo pendiente y recargo sobre pendiente si aplica.'
    },
    {
      caso: 'Caso 5 - Excedente o saldo negativo',
      esperado: 'Clasificar como crédito a favor o saldo por aplicar, nunca como negativo mudo.'
    }
  ];

  const initialManualSequence = [
    'Correr febrero manualmente.',
    'Validar febrero completo.',
    'Correr marzo manualmente.',
    'Validar marzo completo.',
    'Correr abril manualmente.',
    'Validar abril completo.'
  ];

  const operationalFlow = [
    {
      etapa: '1. CARGOS ESCOLARES',
      acciones: 'Mensualidad, plataforma, matrícula (si aplica), descuento familiar (si aplica).'
    },
    {
      etapa: '2. REVISIÓN TEMPORAL',
      acciones: 'Fecha de corte, vencimiento, días de gracia, recargo y mora con política única.'
    },
    {
      etapa: '3. APLICACIÓN DE PAGOS',
      acciones: 'Aplicar pagos compatibles, parciales, excedentes y saldos a favor.'
    },
    {
      etapa: '4. RECARGOS',
      acciones: 'Aplicar recargo a impagos vencidos sobre neto descontado, sin duplicar.'
    },
    {
      etapa: '5. MORA',
      acciones: 'Evaluar mora como estado, no como cargo.'
    },
    {
      etapa: '6. ESTADOS / STATEMENTS',
      acciones: 'Construir movimientos reales del período sin colapsar a saldo anterior/saldo inicial.'
    },
    {
      etapa: '7. ESTADO DE CUENTA RESUMEN',
      acciones: 'Totales, saldo final, vencidos, con recargo, meses vencidos y morosidad.'
    },
    {
      etapa: '8. ESTADO DE CUENTA DETALLE',
      acciones: 'Movimientos completos: cargos, pagos, recargos, ajustes, reversos y saldo acumulado.'
    },
    {
      etapa: '9. PORTAL DE PADRES',
      acciones: 'Consumidor pasivo: hereda estado consolidado sin recalcular lógica.'
    },
    {
      etapa: '10. CONCILIACIÓN',
      acciones: 'Vincular pagos reportados con aplicaciones reales, parciales, excedentes y sin match.'
    },
    {
      etapa: '11. EXPORTACIÓN CONTABLE',
      acciones: 'Exportar solo desde detalle corregido y consolidado.'
    }
  ];

  const controlRules = [
    'No ejecutar marzo si febrero no cerró correctamente.',
    'No ejecutar abril si marzo no cerró correctamente.',
    'No activar automático sin febrero, marzo y abril aprobados en manual.',
    'No correr módulos aislados fuera del flujo completo.',
    'No correr portal antes de cerrar estados.',
    'No correr exportación antes de cerrar detalle.',
    'No correr conciliación con fuente distinta a aplicaciones reales.',
    'No permitir dos procesos sobre el mismo período al mismo tiempo.'
  ];

  const monthGateChecklist = [
    'Cargos base correctos.',
    'Descuentos correctos.',
    'Pagos aplicados correctamente.',
    'Recargos correctos.',
    'Mora correcta.',
    'Resumen correcto.',
    'Detalle completo.',
    'Portal correcto.',
    'Conciliación con datos.',
    'Exportación contable con datos.'
  ];

  const automaticEnableConditions = [
    'Febrero pasó completo.',
    'Marzo pasó completo.',
    'Abril pasó completo.',
    'Sin diferencias entre corrida manual esperada y corrida real.',
    'Flujo completo estable sin intervención extra.',
    'Salidas derivadas heredando correctamente.'
  ];

  const automaticRunDesign = [
    'Seleccionar período a correr (uno por corrida).',
    'Ejecutar flujo completo en secuencia.',
    'Validar resultados mínimos de cierre.',
    'Registrar log de corrida.',
    'Publicar salidas derivadas.',
    'Cerrar corrida.'
  ];

  const runLogFields = [
    'fecha y hora',
    'período procesado',
    'módulos ejecutados',
    'módulos completados',
    'módulos fallidos',
    'filas generadas por hoja',
    'pagos aplicados',
    'recargos generados',
    'alumnos con mora',
    'conciliaciones generadas',
    'exportaciones generadas',
    'estado final de la corrida'
  ];

  const iterativeReportSections = [
    '1. CAMBIO REALIZADO (archivo/módulo, función, cambio exacto, qué no se tocó).',
    '2. MOTIVO DEL CAMBIO (anomalía, síntoma funcional, impacto esperado).',
    '3. EFECTO ESPERADO (hoja/columna/estado y dominio impactado).',
    '4. RESULTADO OBSERVADO (mejoró, no mejoró, igual, empeoró).',
    '5. ESTADO POR MÓDULO (mini matriz por módulo y observación).',
    '6. IMPACTO EN HOJAS (cambió, no cambió, vacía, hereda error, correcta).',
    '7. IMPACTO EN FLUJO (cargos, pagos, recargos, mora, states, resumen, detalle, portal, conciliación, export).',
    '8. PRUEBA EJECUTADA (período, modo manual/automático, datos, alumnos, alcance parcial/completo).',
    '9. RIESGOS ABIERTOS (qué puede romperse, dependencias, bloqueos, pendiente).',
    '10. SIGUIENTE ACCIÓN RECOMENDADA (próximo módulo y validación objetivo).'
  ];

  const allowedModuleStates = [
    'FUNCIONA',
    'FUNCIONA PARCIAL',
    'BLOQUEADO',
    'HEREDA ERROR',
    'REQUIERE VALIDACIÓN'
  ];

  const iterativeHardRules = [
    'No hacer cambios silenciosos sin reflejarlos en el informe web.',
    'No cerrar iteración sin resultado observado.',
    'No reportar solo intención; reportar cambio real y efecto real.',
    'No mezclar varios frentes grandes en una sola iteración.',
    'Trabajar por bloques controlados.',
    'No reescribir módulos que funcionan sin justificación.',
    'Siempre separar síntoma funcional, causa técnica, cambio aplicado y resultado real.'
  ];

  const iterationClosingFormat = [
    'A) Cambio realizado',
    'B) Módulos impactados',
    'C) Resultado observado',
    'D) Riesgos abiertos',
    'E) Siguiente paso',
    'F) Informe web actualizado'
  ];

  const firstProtocolActivation = {
    iteracion: 'Iteración 0 - Protocolo activado',
    cambio: 'Se activó política obligatoria de informe web por cada cambio de scripts.',
    modulos: 'Gobierno del proceso (sin cambio funcional de motor de cálculo).',
    resultado: 'Plantilla y reglas de auditoría iterativa disponibles en Soluciones y Plan.',
    riesgo: 'Si no se sigue el formato, la iteración se considera abierta/no cerrada.',
    siguiente: 'Aplicar en la próxima intervención de scripts y registrar evidencia completa.'
  };

  const iteration1 = {
    iteracion: 'Primer bloque - Statements / Estados (NO CERRADO)',
    archivo: 'proyecto practica/CARGOS_MORA/09_V3_Statements.gs.js',
    funcion: 'v3StatementsResolverPeriodoMovimiento_, v3StatementsMovimientoPerteneceAPeriodo_, v3StatementsMovimientoEsAnteriorAPeriodo_, v3StatementsConstruirContexto_',
    cambio: 'Se ajustó la resolución del período por movimiento para que, cuando no exista período explícito, use fecha de movimiento y no reclasifique indebidamente a saldo anterior.',
    noTocado: 'No se modificó lógica de recargos, mora, conciliación ni portal visual.',
    motivo: 'Corregir degradación de movimientos del período que terminaban fuera del filtro de febrero y colapsaban a saldo anterior/saldo inicial.',
    efectoEsperado: 'Resumen y Detalle deben conservar movimientos reales del período; Portal y Export deben heredar movimientos exportables cuando existan.',
    prueba: 'Período 2026-02, corrida manual de Statements + salidas derivadas.',
    resultado: 'Cambio aplicado y desplegado por clasp push. Validación funcional no cerrada: run84/run70 bloqueados por permisos de ejecución en el entorno actual.',
    resumenImpacto: 'Esperado: Total_Cargos/Total_Pagos visibles para febrero. Observado: pendiente de confirmación en hoja.',
    detalleImpacto: 'Esperado: detalle con cargos/pagos/ajustes/reversos reales en febrero. Observado: pendiente de confirmación en hoja.',
    portalImpacto: 'Esperado: portal hereda estados corregidos. Observado: pendiente de confirmación por bloqueo de run.',
    exportImpacto: 'Esperado: Export Contable empiece a poblarse cuando detalle tenga movimientos. Observado: pendiente de confirmación por bloqueo de run.',
    riesgos: 'Permisos de ejecución remota impiden cerrar evidencia observada automática; requiere corrida manual asistida con usuario autorizado.',
    siguiente: 'Ejecutar corrida manual febrero en entorno autorizado y registrar evidencia de 4 casos mínimos (sin pago, pagado, descuento familiar, saldo negativo/excedente).'
  };

  const trackedMetrics = [
    'fecha y hora',
    'filas leídas',
    'filas escritas',
    'filas descartadas',
    'motivo del descarte',
    'módulo origen',
    'módulo destino',
    'estado final del paso'
  ];

  const baselineCheck = [
    {
      punto: 'Cuello principal en Statements',
      estado: 'Alineado',
      evidencia: 'Ya está marcado como cuello de botella y colapso de movimientos en Vista Dirección.'
    },
    {
      punto: 'Exportación no rota propia',
      estado: 'Alineado',
      evidencia: 'Ya se modela como cascade de Detalle incompleto.'
    },
    {
      punto: 'Conciliación no por Periodo_Reportado exacto',
      estado: 'Parcial',
      evidencia: 'Diagnóstico lo reconoce; falta rediseño de capa C en código fuente productivo.'
    },
    {
      punto: 'Lógica temporal única',
      estado: 'Pendiente',
      evidencia: 'Sigue detectada doble lógica (5 días gracia vs 61 días mora).'
    },
    {
      punto: 'No colapsar movimientos del período',
      estado: 'Pendiente',
      evidencia: 'Aún no reestructurado el motor States/Statements real.'
    }
  ];

  const statusClass = (value) => {
    const v = String(value || '').toLowerCase();
    if (v === 'alineado') return 'verde';
    if (v === 'parcial') return 'amarillo';
    return 'rojo';
  };

  let html = `
    <h3>Plan de Cambio Controlado - Reestructuración Arquitectónica</h3>
    <p class="small"><strong>Alcance actual:</strong> se valida y adopta tu bloque como blueprint oficial para la implementación por capas, preservando cálculos base correctos y eliminando el colapso a saldo anterior/saldo inicial.</p>

    <h4>Cotejo: bloque recomendado vs estado actual</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Punto</th><th>Estado</th><th>Evidencia</th></tr></thead>
        <tbody>
          ${baselineCheck.map(r => `<tr><td>${escapeHtml(r.punto)}</td><td><span class="chip ${statusClass(r.estado)}">${escapeHtml(r.estado)}</span></td><td>${escapeHtml(r.evidencia)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>FASE 1 - Congelar lo que sí funciona</h4>
    <div class="note-box">
      <ul class="tight">
        ${frozenComponents.map(x => `<li>${escapeHtml(x)}</li>`).join('')}
      </ul>
    </div>

    <h4>FASE 2 - Rediseñar flujo en capas</h4>
    ${layerPlan.map(layer => `
      <div class="mini-card" style="margin-bottom:12px;">
        <h5>${escapeHtml(layer.capa)}</h5>
        <p class="small"><strong>Objetivo:</strong> ${escapeHtml(layer.objetivo)}</p>
        <ul class="tight">
          ${layer.entregables.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    `).join('')}

    <h4>FASE 3 - Fuentes de verdad por dominio</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Dominio / Módulo</th><th>Rol</th></tr></thead>
        <tbody>
          ${sourceOfTruth.map(([dominio, rol]) => `<tr><td>${escapeHtml(dominio)}</td><td>${escapeHtml(rol)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>FASE 4 - Normalizar estados</h4>
    <div class="note-box">
      <ul class="tight">
        ${standardStates.map(x => `<li>${escapeHtml(x)}</li>`).join('')}
      </ul>
    </div>

    <h4>FASE 5 - Semántica de saldos negativos</h4>
    <div class="note-box">
      <ul class="tight">
        ${semanticNegativeBalances.map(x => `<li>${escapeHtml(x)}</li>`).join('')}
      </ul>
    </div>

    <h4>FASE 6 - Trazabilidad obligatoria por corrida</h4>
    <div class="note-box">
      <ul class="tight">
        ${trackedMetrics.map(x => `<li>${escapeHtml(x)}</li>`).join('')}
      </ul>
    </div>

    <h4>FASE 7 - Orden de implementación</h4>
    <div class="note-box">
      <ol class="tight">
        ${implementationOrder.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
    </div>

    <h4>FASE 8 - Pruebas mínimas obligatorias</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Caso</th><th>Esperado</th></tr></thead>
        <tbody>
          ${mandatoryTests.map(t => `<tr><td>${escapeHtml(t.caso)}</td><td>${escapeHtml(t.esperado)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>Diseño Operativo Post-Reestructuración</h4>
    <div class="warning-banner">
      Política principal: nada corre en simultáneo, nada se salta etapas y nada se ejecuta fuera de orden. Manual y automático deben usar exactamente la misma lógica.
    </div>

    <h4>Secuencia de validación inicial (manual)</h4>
    <div class="note-box">
      <ol class="tight">
        ${initialManualSequence.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
      <p class="small"><strong>Gate:</strong> solo después de validar febrero, marzo y abril se habilita automático.</p>
    </div>

    <h4>Flujo operativo obligatorio por período</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Etapa</th><th>Acciones obligatorias</th></tr></thead>
        <tbody>
          ${operationalFlow.map(row => `<tr><td>${escapeHtml(row.etapa)}</td><td>${escapeHtml(row.acciones)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>Reglas de control de ejecución</h4>
    <div class="note-box">
      <ul class="tight">
        ${controlRules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}
      </ul>
    </div>

    <h4>Validación obligatoria de cada mes manual</h4>
    <div class="note-box">
      <ul class="tight">
        ${monthGateChecklist.map(check => `<li>${escapeHtml(check)}</li>`).join('')}
      </ul>
      <p class="small"><strong>Regla:</strong> si falla un punto, no se avanza al siguiente mes.</p>
    </div>

    <h4>Condición para habilitar automático</h4>
    <div class="note-box">
      <ul class="tight">
        ${automaticEnableConditions.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
      </ul>
    </div>

    <h4>Diseño del automático (sin atajos)</h4>
    <div class="note-box">
      <ol class="tight">
        ${automaticRunDesign.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
      <p class="small">El automático procesa un solo período por corrida, sin paralelismo y sin reabrir períodos cerrados salvo bandera de reproceso controlado.</p>
    </div>

    <h4>Log obligatorio de cada corrida (manual o automática)</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Campo</th></tr></thead>
        <tbody>
          ${runLogFields.map(field => `<tr><td>${escapeHtml(field)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>

    <h4>Protocolo de Trabajo Iterativo con Informe Web Obligatorio</h4>
    <div class="warning-banner">
      Toda iteración de scripts debe cerrar con actualización del informe web. Una iteración sin evidencia web completa se considera abierta.
    </div>

    <h4>Contenido obligatorio del informe por iteración</h4>
    <div class="note-box">
      <ol class="tight">
        ${iterativeReportSections.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ol>
    </div>

    <h4>Estados permitidos en matriz por módulo</h4>
    <div class="note-box">
      <ul class="tight">
        ${allowedModuleStates.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>

    <h4>Reglas obligatorias de iteración</h4>
    <div class="note-box">
      <ul class="tight">
        ${iterativeHardRules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}
      </ul>
    </div>

    <h4>Formato de cierre estándar</h4>
    <div class="note-box">
      <ol class="tight">
        ${iterationClosingFormat.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ol>
    </div>

    <h4>Registro base de activación del protocolo</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Campo</th><th>Detalle</th></tr></thead>
        <tbody>
          <tr><td>Iteración</td><td>${escapeHtml(firstProtocolActivation.iteracion)}</td></tr>
          <tr><td>Cambio realizado</td><td>${escapeHtml(firstProtocolActivation.cambio)}</td></tr>
          <tr><td>Módulos impactados</td><td>${escapeHtml(firstProtocolActivation.modulos)}</td></tr>
          <tr><td>Resultado observado</td><td>${escapeHtml(firstProtocolActivation.resultado)}</td></tr>
          <tr><td>Riesgo abierto</td><td>${escapeHtml(firstProtocolActivation.riesgo)}</td></tr>
          <tr><td>Siguiente acción</td><td>${escapeHtml(firstProtocolActivation.siguiente)}</td></tr>
        </tbody>
      </table>
    </div>

    <h4>Verificación del primer bloque (no cerrado)</h4>
    <div class="table-wrap">
      <table class="diag-table">
        <thead><tr><th>Bloque</th><th>Evidencia</th></tr></thead>
        <tbody>
          <tr><td>A) Cambio realizado</td><td><strong>${escapeHtml(iteration1.archivo)}</strong><br>${escapeHtml(iteration1.funcion)}<br>${escapeHtml(iteration1.cambio)}<br><em>No tocado:</em> ${escapeHtml(iteration1.noTocado)}</td></tr>
          <tr><td>B) Módulos impactados</td><td>Statements/Estados (directo), Resumen/Detalle (directo), Portal/Exportación (herencia).</td></tr>
          <tr><td>C) Resultado observado</td><td>${escapeHtml(iteration1.resultado)}<br><em>Prueba:</em> ${escapeHtml(iteration1.prueba)}</td></tr>
          <tr><td>D) Riesgos abiertos</td><td>${escapeHtml(iteration1.riesgos)}</td></tr>
          <tr><td>E) Siguiente paso</td><td>${escapeHtml(iteration1.siguiente)}</td></tr>
          <tr><td>F) Informe web actualizado</td><td>SI - Bloque registrado como NO CERRADO hasta validar febrero en hojas reales.</td></tr>
        </tbody>
      </table>
    </div>

    <h4>Salida obligatoria del primer bloque (detalle técnico)</h4>
    <div class="note-box">
      <ul class="tight">
        <li><strong>Qué anomalía corrige:</strong> ${escapeHtml(iteration1.motivo)}</li>
        <li><strong>Efecto esperado:</strong> ${escapeHtml(iteration1.efectoEsperado)}</li>
        <li><strong>Resumen:</strong> ${escapeHtml(iteration1.resumenImpacto)}</li>
        <li><strong>Detalle:</strong> ${escapeHtml(iteration1.detalleImpacto)}</li>
        <li><strong>Portal:</strong> ${escapeHtml(iteration1.portalImpacto)}</li>
        <li><strong>Exportación Contable:</strong> ${escapeHtml(iteration1.exportImpacto)}</li>
        <li><strong>Qué sigue roto:</strong> cierre de febrero no validado en hojas por bloqueo de permisos de ejecución.</li>
        <li><strong>Módulo siguiente:</strong> ejecución asistida de pruebas febrero en Statements (sin tocar recargos/mora/conciliación).</li>
      </ul>
    </div>

    <h4>Objetivo operativo final</h4>
    <div class="note-box">
      <p class="small">Primero validación manual mes por mes (febrero, marzo, abril). Después automatización de la misma secuencia exacta sin diferencias funcionales.</p>
      <ul class="tight">
        <li>Nunca correr en simultáneo.</li>
        <li>Nunca saltar una etapa.</li>
        <li>Nunca publicar salidas derivadas antes de cerrar la etapa anterior.</li>
      </ul>
    </div>

    <h4>Restricciones activas</h4>
    <div class="warning-banner">
      No reescribir todo a la vez. No tocar cálculos base correctos. Portal/Conciliación/Exportación no recalculan lógica propia. Prohibido mantener doble lógica temporal. Conciliación no puede depender solo de Periodo_Reportado exacto. No colapsar movimientos del período a saldo anterior.
    </div>

    <h4>Criterio de parada</h4>
    <div class="note-box">
      <ul class="tight">
        <li>Febrero visible como movimiento del período, no como saldo anterior.</li>
        <li>Recargos correctos según reglas reales.</li>
        <li>Mora correcta con única política temporal.</li>
        <li>Detalle con movimientos reales completos.</li>
        <li>Conciliación con datos reales de aplicación.</li>
        <li>Exportación contable con filas reales (no vacía por degradación).</li>
        <li>Portal heredando estado correcto sin recalcular.</li>
      </ul>
    </div>
  `;

  ui.solutionsPlan.innerHTML = html;
}

function buildDependencyText(script) {
  const file = script.file || '';
  
  if (file.startsWith('00_') || file.startsWith('01_') || file.startsWith('02_')) {
    return 'Módulo base. PRIMERO: sin dependencias previas, lo primero que corregir.';
  } else if (file.startsWith('03_') || file.startsWith('04_')) {
    return 'Modulo de configuración. Esperar a que 00-02 estén OK.';
  } else if (file.startsWith('05_') || file.startsWith('06_')) {
    return 'Módulo de ingesta. Requiere que 00-04 estén corregidos primero.';
  } else if (file.startsWith('07_') || file.startsWith('08_') || file.startsWith('09_')) {
    return 'Módulo de procesamiento. Requiere 05-06 OK. Crítico para flujo financiero.';
  } else if (file.startsWith('10_') || file.startsWith('17_')) {
    return 'Módulo de integración/salida. Requiere 07-09 OK antes.';
  } else if (file.startsWith('90_') || file.startsWith('91_')) {
    return 'Orquestador. ÚLTIMO: corregir solo después de que todos los módulos de negocio estén OK.';
  }
  return 'Dependencia determinada por número de módulo en nombre.';
}

function renderSummary() {
  const avgCalls = avgBy(s => (s.calls || []).length);
  const avgFns = avgBy(s => (s.functions || []).length);

  ui.globalSummary.innerHTML = `
    <h3>Resumen Técnico Global</h3>
    <div class="kpis">
      <div class="kpi"><div class="v">${avgCalls.toFixed(1)}</div><div class="k">Llamadas promedio por script</div></div>
      <div class="kpi"><div class="v">${avgFns.toFixed(1)}</div><div class="k">Funciones promedio por script</div></div>
      <div class="kpi"><div class="v">${countUniqueCalls()}</div><div class="k">Símbolos invocados</div></div>
    </div>
  `;

  const topCalls = topCallsGlobal(20)
    .map(([n, c]) => `<li><strong>${escapeHtml(n)}</strong>: ${c}</li>`)
    .join('');

  ui.callsSummary.innerHTML = `
    <h3>Top de llamadas detectadas</h3>
    <ul class="tight">${topCalls || '<li>Sin datos</li>'}</ul>
  `;
}

function renderConflicts() {
  const rojo = state.scripts.filter(s => ((s.indicadores || {}).semaforo || '').toLowerCase() === 'rojo');
  const coupling = state.scripts.filter(s => ((s.indicadores || {}).acoplamientoExternoProxy || 0) >= 80);
  const longFiles = state.scripts.filter(s => (s.totalLines || 0) >= 1000);

  ui.conflictsPanel.innerHTML = `
    <h3>Conflictos y Puntos de Choque</h3>
    <div class="line-grid">
      <div class="mini-card">
        <h5>Riesgo Alto (Rojo)</h5>
        <ul class="tight">${rojo.map(s => `<li>${escapeHtml(s.file)}</li>`).join('') || '<li>Sin módulos en rojo</li>'}</ul>
      </div>
      <div class="mini-card">
        <h5>Acoplamiento Externo Alto</h5>
        <ul class="tight">${coupling.map(s => `<li>${escapeHtml(s.file)} (${(s.indicadores || {}).acoplamientoExternoProxy})</li>`).join('') || '<li>No detectado</li>'}</ul>
      </div>
      <div class="mini-card">
        <h5>Tamaño Crítico</h5>
        <ul class="tight">${longFiles.map(s => `<li>${escapeHtml(s.file)} (${s.totalLines} líneas)</li>`).join('') || '<li>No detectado</li>'}</ul>
      </div>
    </div>
  `;
}

function renderFlow() {
  // Mapa de propagación de datos con estado de cada flecha
  const mainFlow = `flowchart LR
    A["CARGOS_ESCOLARES"] -->|OK| B["APLICACION_PAGOS"]
    B -->|PARCIAL| C["RECARGOS"]
    C -->|DEGRADA| D["STATES\nCUELLO DE BOTELLA"]
    D -->|PARCIAL| E["RESUMEN"]
    D -->|INCOMPLETO| F["DETALLE"]
    E -->|HEREDA| G["PORTAL"]
    F -->|HEREDA| G
    B -->|VACIO| H["CONCILIACION"]
    D -->|VACIO| H
    F -->|CASCADE| I["EXPORT\nCONTABILIDAD"]

    style A fill:#e6f7ec,stroke:#136f3a,stroke-width:3px
    style B fill:#fff7dd,stroke:#8a6a00,stroke-width:3px
    style C fill:#fff7dd,stroke:#8a6a00,stroke-width:3px
    style D fill:#ffe5e5,stroke:#9b1c1c,stroke-width:4px
    style E fill:#fff7dd,stroke:#8a6a00,stroke-width:3px
    style F fill:#fff7dd,stroke:#8a6a00,stroke-width:3px
    style G fill:#fff7dd,stroke:#8a6a00,stroke-width:3px
    style H fill:#ececec,stroke:#616161,stroke-width:3px
    style I fill:#ececec,stroke:#616161,stroke-width:3px`;

  ui.mermaidFlow.textContent = mainFlow;
  safeMermaidRun([ui.mermaidFlow]);

  ui.flowNotes.innerHTML = `
    <div class="flow-container">
      <h3>Mapa de Propagación y Trazabilidad</h3>

      <div class="flow-stage">
        <h4>Leyenda de Flechas</h4>
        <div class="flow-detail">
          <p><strong>OK:</strong> pasa datos correctamente</p>
          <p><strong>PARCIAL:</strong> pasa datos parcialmente</p>
          <p><strong>VACIO:</strong> no pasa datos</p>
          <p><strong>DEGRADA:</strong> reubica datos de forma incorrecta</p>
        </div>
      </div>

      <div class="flow-stage">
        <h4>Trazabilidad por Hoja (entrada/salida/dependencia)</h4>
        <div class="table-wrap">
          <table class="diag-table">
            <thead>
              <tr><th>Hoja</th><th>Entradas</th><th>Salidas</th><th>Estado</th><th>Qué sí llena</th><th>Qué no llena</th><th>Qué depende de esta hoja</th><th>Riesgo</th></tr>
            </thead>
            <tbody>
              <tr><td>CARGOS_ESCOLARES</td><td>Reglas y estudiantes</td><td>Cargos base</td><td>Funciona</td><td>Mensualidad y descuentos</td><td>Temporalidad avanzada</td><td>Aplicación, Statements</td><td>Bajo</td></tr>
              <tr><td>APLICACION_PAGOS</td><td>Pagos reportados</td><td>Aplicaciones</td><td>Funciona parcial</td><td>Aplicación principal</td><td>Casos multiuso</td><td>States, Conciliación</td><td>Medio</td></tr>
              <tr><td>STATES / RESUMEN</td><td>Cargos + pagos + reglas</td><td>Estados consolidados</td><td>Cuello de botella</td><td>Saldos iniciales</td><td>Movimientos completos</td><td>Detalle, Portal, Export</td><td>Alto</td></tr>
              <tr><td>ESTADO_CUENTA_DETALLE</td><td>States</td><td>Detalle por movimiento</td><td>Incompleto</td><td>Estructura base</td><td>Recargo/mora propagada</td><td>Portal, Exportación</td><td>Alto</td></tr>
              <tr><td>PORTAL</td><td>Resumen + detalle</td><td>Salida usuario</td><td>Hereda incompleto</td><td>Datos base</td><td>Mora/recargo consistente</td><td>Operación final</td><td>Medio-alto</td></tr>
              <tr><td>CONCILIACION</td><td>Aplicaciones reales</td><td>Cierre reconciliado</td><td>No generada</td><td>N/A</td><td>Filas de salida</td><td>Control financiero</td><td>Alto</td></tr>
              <tr><td>EXPORT_CONTABILIDAD</td><td>Detalle corregido</td><td>Archivo contable</td><td>No generada</td><td>N/A</td><td>Asientos exportables</td><td>Contabilidad</td><td>Alto</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flow-stage">
        <h4>Conclusión Operativa del Flujo (Diagnóstico Validado)</h4>
        <div class="flow-detail">
          <p><strong>Cargos funciona. Aplicación de Pagos funciona parcialmente. El problema no empieza ahí.</strong></p>
          <p><strong>El problema empieza en Statements:</strong> toma los movimientos y decide cuáles son "del período" y cuáles se mandan a Saldo_Anterior. Esa clasificación incorrecta colapsa cargos, pagos, recargos, ajustes y excedentes en una sola línea de saldo.</p>
          <p><strong>Conciliación</strong> no está rota por sí misma. Depende de Periodo_Reportado exacto y puede dejar fuera pagos válidos aunque las aplicaciones sí existan.</p>
          <p><strong>Exportación Contable</strong> no está rota por sí misma. Solo lee ESTADO_CUENTA_DETALLE. Si Detalle solo tiene SALDO_INICIAL, Export queda vacía. Se resuelve al reparar States y Detalle.</p>
          <p><strong>Portal</strong> no tiene problema propio. Hereda saldo final, mora, estado y último período pendiente desde Resumen.</p>
          <p><strong>Mora y Recargo</strong> tienen dos reglas independientes (5 días gracia vs 61 días mora) que no están sincronizadas entre sí.</p>
          <p>El proyecto no necesita reescritura completa. Reparar Statements desbloquea toda la cadena descendente.</p>
        </div>
      </div>
    </div>
  `;
}


function findCallers(targetFunctionName, allData) {
  // Busca todos los scripts y funciones que llaman a targetFunctionName
  const callers = {};
  if (!allData || !allData.scripts) return callers;
  
  for (const script of allData.scripts) {
    for (const fn of (script.functions || [])) {
      if ((fn.calls || []).includes(targetFunctionName)) {
        if (!callers[script.file]) {
          callers[script.file] = { scriptName: script.file, functions: [] };
        }
        callers[script.file].functions.push(fn.name);
      }
    }
    for (const block of (script.blocks || [])) {
      if (block.type === 'function' && (block.calls || []).includes(targetFunctionName)) {
        if (!callers[script.file]) {
          callers[script.file] = { scriptName: script.file, functions: [] };
        }
        if (!callers[script.file].functions.includes(block.name)) {
          callers[script.file].functions.push(block.name);
        }
      }
    }
  }
  return callers;
}

function renderDetail() {
  const s = state.selected;
  if (!s) return;

  const sem = semaforoClass((s.indicadores || {}).semaforo);

  const blocks = (s.blocks || []).map(b => {
    const explain = explainBlock(b, s);
    const calls = (b.calls || []).slice(0, 12);
    
    // Buscar qué otros scripts llaman a este bloque
    let impactHtml = '';
    if (b.type === 'function' && b.name) {
      const callers = findCallers(b.name, state.data);
      if (Object.keys(callers).length > 0) {
        const callerList = Object.entries(callers)
          .map(([file, info]) => {
            const shortFile = file.split('/').pop();
            return `${shortFile} (${info.functions.join(', ')})`;
          })
          .slice(0, 5);
        
        impactHtml = `
          <div class="impact-warning">
            <div class="impact-icon">⚠️ IMPACTO DE CAMBIOS</div>
            <div class="impact-text"><strong>Esta función es llamada por:</strong> ${escapeHtml(callerList.join(' | '))}</div>
            <div class="impact-note">⚡ Cambios aquí pueden dañar estos scripts. Verificar antes de editar.</div>
          </div>
        `;
      }
    }
    
    return `
      <div class="line-block">
        <div class="line-range">Línea ${b.startLine} a ${b.endLine}</div>
        <div class="small">Tipo: ${escapeHtml(b.type === 'function' ? 'Función' : 'Constantes / Configuración')}${b.name ? ` | ${escapeHtml(b.name)}` : ''}</div>
        <div class="line-grid">
          <div class="mini-card"><h5>Qué hace</h5><div>${escapeHtml(explain.queHace)}</div></div>
          <div class="mini-card"><h5>Impacto al negocio</h5><div>${escapeHtml(explain.impacto)}</div></div>
          <div class="mini-card"><h5>Riesgo si falla</h5><div>${escapeHtml(explain.riesgo)}</div></div>
          <div class="mini-card"><h5>Control recomendado</h5><div>${escapeHtml(explain.control)}</div></div>
        </div>
        ${calls.length ? `<div class="small" style="margin-top:8px;"><strong>Llamadas clave:</strong> ${escapeHtml(calls.join(', '))}</div>` : ''}
        ${impactHtml}
      </div>
    `;
  }).join('');

  const scriptFlow = buildScriptFlow(s);

  let detailHtml = `
    <h3>${escapeHtml(s.file)} <span class="chip ${sem}">${escapeHtml((s.indicadores || {}).semaforo || 'N/D')}</span></h3>
    <p><strong>Rol del módulo:</strong> ${escapeHtml(((s.indicadores || {}).rolModulo) || 'No definido')}</p>
    <p><strong>Lectura ejecutiva:</strong> ${escapeHtml(cleanText((s.summaryEjecutivo || '').replace(/\?/g, '')))}</p>
    <div class="kpis">
      <div class="kpi"><div class="v">${s.totalLines}</div><div class="k">Líneas</div></div>
      <div class="kpi"><div class="v">${(s.functions || []).length}</div><div class="k">Funciones</div></div>
      <div class="kpi"><div class="v">${(s.constants || []).length}</div><div class="k">Constantes</div></div>
      <div class="kpi"><div class="v">${(s.calls || []).length}</div><div class="k">Llamadas detectadas</div></div>
    </div>
  `;

  // Agregar sección de soluciones si está en rojo o amarillo
  const semaforo = ((s.indicadores || {}).semaforo || '').toLowerCase();
  if (semaforo.includes('roj') || semaforo.includes('amar')) {
    const soluciones = (s.controlesSugeridos || []).slice(0, 5);
    const riesgos = (s.riesgos || []).slice(0, 3);
    
    detailHtml += `
      <h4>Soluciones Recomendadas para Este Módulo</h4>
      <div class="solution-box">
        ${riesgos.length > 0 ? `
          <h5>Riesgos Identificados:</h5>
          <ul class="tight">
            ${riesgos.map(r => `<li>${escapeHtml(cleanText(r))}</li>`).join('')}
          </ul>
        ` : ''}
        
        ${soluciones.length > 0 ? `
          <h5>Pasos de Corrección:</h5>
          <ol class="tight">
            ${soluciones.map(sol => `<li>${escapeHtml(cleanText(sol))}</li>`).join('')}
          </ol>
        ` : ''}
      </div>
    `;
  }

  detailHtml += `
    <h4>Infografía del script</h4>
    <div id="scriptMermaid" class="mermaid">${scriptFlow}</div>
    <h4>Detalle minucioso por rango de líneas</h4>
    ${blocks || '<p>No hay bloques.</p>'}
  `;

  ui.scriptDetail.innerHTML = detailHtml;

  const scriptNode = document.getElementById('scriptMermaid');
  safeMermaidRun([scriptNode]);
}

function explainBlock(block, script) {
  const domain = detectDomain(`${script.file} ${(block.name || '')} ${((block.calls || []).join(' '))}`);
  if (block.type === 'constants') {
    return {
      queHace: `Define parámetros base que gobiernan el comportamiento del módulo en ${domain}.`,
      impacto: `Si estos valores están bien definidos, el proceso mantiene consistencia y previsibilidad.`,
      riesgo: `Un valor mal configurado puede alterar cálculos o rutas de ejecución sin aviso evidente.`,
      control: `Validar valores de configuración con checklist y comparar contra ambiente esperado antes de correr.`
    };
  }

  const fn = block.name || 'funcion';
  return {
    queHace: `Ejecuta ${fn} y coordina acciones de ${domain} en el rango indicado.`,
    impacto: `Este tramo afecta directamente la trazabilidad y resultado operativo del flujo ${domain}.`,
    riesgo: `Si falla, puede generar datos incompletos, estados inconsistentes o resultados no conciliables.`,
    control: `Revisar entrada/salida de este rango y registrar evidencia de ejecución en pruebas de punta a punta.`
  };
}

function detectDomain(txt) {
  const t = String(txt || '').toLowerCase();
  if (/charge|cargo/.test(t)) return 'cargos';
  if (/payment|pago|application/.test(t)) return 'pagos y aplicación';
  if (/reversal|mora|recargo/.test(t)) return 'recargos y mora';
  if (/statement|resumen|detalle/.test(t)) return 'estados de cuenta';
  if (/portal|export|api|contable/.test(t)) return 'integración y exportación';
  if (/schema|config|setup|sync/.test(t)) return 'configuración y sincronización';
  if (/runner|orchestr|automation/.test(t)) return 'orquestación';
  if (/concili/.test(t)) return 'conciliación';
  return 'operación del sistema';
}

function buildScriptFlow(script) {
  const nodes = (script.functions || []).slice(0, 9);
  let out = 'flowchart TD\n';
  nodes.forEach((fn, i) => {
    out += `N${i}["${String(fn.name || `Fn ${i + 1}`).replace(/"/g, '')}"]\n`;
  });
  for (let i = 0; i < nodes.length - 1; i++) {
    out += `N${i} --> N${i + 1}\n`;
  }
  if (!nodes.length) out += 'N0["Sin funciones detectadas"]\n';
  return out;
}

function semaforoCounts() {
  const counts = { rojo: 0, amarillo: 0, verde: 0 };
  state.scripts.forEach(s => {
    const v = ((s.indicadores || {}).semaforo || '').toLowerCase();
    if (v.includes('roj')) counts.rojo++;
    else if (v.includes('amar')) counts.amarillo++;
    else if (v.includes('verd')) counts.verde++;
  });
  return counts;
}

function semaforoClass(v) {
  const t = String(v || '').toLowerCase();
  if (t.includes('roj')) return 'rojo';
  if (t.includes('amar')) return 'amarillo';
  if (t.includes('verd')) return 'verde';
  return 'amarillo';
}

function topCallsGlobal(limit = 15) {
  const map = new Map();
  state.scripts.forEach(s => (s.calls || []).forEach(c => map.set(c, (map.get(c) || 0) + 1)));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function countUniqueCalls() {
  const set = new Set();
  state.scripts.forEach(s => (s.calls || []).forEach(c => set.add(c)));
  return set.size;
}

function sumBy(fn) {
  return state.scripts.reduce((acc, s) => acc + (Number(fn(s)) || 0), 0);
}

function avgBy(fn) {
  if (!state.scripts.length) return 0;
  return sumBy(fn) / state.scripts.length;
}

function wireTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.onclick = () => activateTab(btn.dataset.tab);
  });
}

function activateTab(tab) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tab}`));
  runActiveTabMermaid();
}

function wireSearch() {
  ui.searchInput.addEventListener('input', e => {
    renderSidebar(e.target.value || '');
  });
}

function cleanText(t) {
  return String(t || '')
    .replace(/\s+/g, ' ')
    .replace(/\?/g, '')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    .trim();
}

function escapeHtml(str) {
  const s = String(str || '')
    .replace(/\?/g, '')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, (c) => {
      try {
        return c.normalize('NFC');
      } catch (e) {
        return '';
      }
    });
  
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
