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
    { modulo: 'Recargos', estado: 'NO FUNCIONA', clase: 'rojo' },
    { modulo: 'Mora', estado: 'NO FUNCIONA', clase: 'rojo' },
    { modulo: 'Statements / Estados', estado: 'CUELLO DE BOTELLA', clase: 'rojo' },
    { modulo: 'Detalle', estado: 'INCOMPLETO', clase: 'amarillo' },
    { modulo: 'Portal', estado: 'HEREDA DATOS INCOMPLETOS', clase: 'amarillo' },
    { modulo: 'Conciliación', estado: 'NO GENERADA / VACÍA', clase: 'gris' },
    { modulo: 'Exportación Contable', estado: 'NO GENERADA / VACÍA', clase: 'gris' }
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
      modulo: 'Statements',
      esperado: 'Estados con movimientos completos y saldo final consistente',
      observado: 'Colapso a saldo anterior/saldo inicial',
      impacto: 'Rompe resumen, detalle y portal',
      prioridad: 'Alta',
      sospecha: 'Unificación incorrecta de movimientos'
    },
    {
      modulo: 'Conciliación',
      esperado: 'Hoja con pagos aplicados reconciliados',
      observado: 'Salida vacía',
      impacto: 'No hay control financiero final',
      prioridad: 'Alta',
      sospecha: 'Fuente errónea o filtro excesivo'
    },
    {
      modulo: 'Exportación Contable',
      esperado: 'Archivo contable generado por período',
      observado: 'No se generan filas exportables',
      impacto: 'Cierre contable bloqueado',
      prioridad: 'Media-Alta',
      sospecha: 'Detalle no entrega movimientos válidos'
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
      siLlena: 'Saldo inicial/anterior', noLlena: 'Movimientos completos', depende: 'Detalle, Portal, Exportación', riesgo: 'Alto'
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
      siLlena: 'Nada estable', noLlena: 'Filas de conciliación', depende: 'Control de cierre', riesgo: 'Alto'
    },
    {
      hoja: 'EXPORT_CONTABILIDAD', entradas: 'Detalle corregido', salidas: 'Asientos/archivo contable', estado: 'NO GENERADA',
      siLlena: 'Nada estable', noLlena: 'Archivo exportable', depende: 'Cierre contable', riesgo: 'Alto'
    }
  ];

  const dependencies = [
    { modulo: 'Statements', depende: 'Cargos, Aplicación de pagos, reglas temporales', rompeA: 'Resumen, Detalle, Portal, Export contable', hereda: 'Errores de recargos/reversals', impacto: 'Alto' },
    { modulo: 'Conciliación', depende: 'Aplicación de pagos + States consistente', rompeA: 'Control de cierre', hereda: 'Vacíos de detalle', impacto: 'Alto' },
    { modulo: 'Exportación contable', depende: 'Detalle con movimientos válidos', rompeA: 'Contabilidad', hereda: 'Fallas de states/detalle', impacto: 'Alto' },
    { modulo: 'Portal', depende: 'Resumen + Detalle', rompeA: 'Lectura operativa', hereda: 'Inconsistencias aguas arriba', impacto: 'Medio-Alto' }
  ];

  const alerts = [
    'Detalle solo contiene SALDO_INICIAL',
    'Resumen tiene Total_Cargos = 0 con Saldo_Anterior > 0',
    'Portal no heredó mora',
    'Conciliación vacía con pagos aplicados existentes',
    'Exportación contable vacía porque Detalle no tiene movimientos exportables',
    'Recargo en 0.00 para cargos vencidos',
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
    <h4>Cuello de Botella Principal</h4>
    <div class="bottleneck-box">
      <ul class="tight">
        <li>El flujo no se rompe primero en Cargos.</li>
        <li>El flujo no se rompe primero en Aplicaciones.</li>
        <li>El cuello principal empieza en States / Statements.</li>
        <li>En esa etapa, los movimientos se colapsan a saldo anterior o saldo inicial.</li>
        <li>Por eso Resumen, Detalle, Portal y Exportación Contable salen degradados.</li>
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

    <h4>Clasificación de Saldos Negativos</h4>
    <div class="line-grid">
      <div class="mini-card"><h5>Crédito a favor</h5><p class="small">Pago válido mayor al cargo del período.</p></div>
      <div class="mini-card"><h5>Excedente</h5><p class="small">Saldo positivo trasladable a siguiente período.</p></div>
      <div class="mini-card"><h5>Pago pendiente de aplicar</h5><p class="small">Pago existente sin match final.</p></div>
      <div class="mini-card"><h5>Saldo negativo técnico</h5><p class="small">Error de cálculo o secuencia, no crédito real.</p></div>
      <div class="mini-card"><h5>Saldo reclasificado</h5><p class="small">Saldo revisado y movido a categoría correcta.</p></div>
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
        <li>Reparar Statements / Estados</li>
        <li>Alinear lógica temporal entre Reversals y Statements</li>
        <li>Reparar Conciliación usando Aplicación_Pagos como fuente real</li>
        <li>Reparar Exportación Contable a partir de Detalle ya corregido</li>
        <li>Revisar motor de recargos contra reglas vivas</li>
        <li>Mejorar clasificación semántica de saldos negativos</li>
      </ol>
    </div>

    <h4>No Cambiar Lo Que Ya Funciona</h4>
    <div class="warning-banner">
      Conservar: cargos base, descuentos, pagos aplicados, saldos base y publicación del portal. Reparar solo propagación en estados, recargos, mora, detalle, conciliación, exportación, semántica de saldos y trazabilidad.
    </div>

    <h4>Preguntas Abiertas</h4>
    <div class="note-box">
      <ul class="tight">
        <li>¿Cuál es la fuente de verdad final para conciliación?</li>
        <li>¿Cuál es el criterio exacto vigente de mora?</li>
        <li>¿Recargo debe depender 100% de reglas vivas?</li>
        <li>¿Pago multiuso debe conciliarse por aplicación y no por período reportado?</li>
        <li>¿Saldos negativos deben mostrarse como crédito a favor?</li>
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
  if (riskNode) mermaid.run({ nodes: [riskNode] });
}

function renderSolutions() {
  // Clasificar módulos por criticidad
  const rojos = state.scripts.filter(s => ((s.indicadores || {}).semaforo || '').toLowerCase().includes('roj'));
  const amarillos = state.scripts.filter(s => ((s.indicadores || {}).semaforo || '').toLowerCase().includes('amar'));
  
  // Ordenar por dependencia (módulos base primero)
  const orden = ['00_', '01_', '02_', '03_', '04_', '05_', '06_', '07_', '08_', '09_', '10_'];
  const sortByDependency = (a, b) => {
    const fileA = a.file || '';
    const fileB = b.file || '';
    const idxA = orden.findIndex(prefix => fileA.startsWith(prefix));
    const idxB = orden.findIndex(prefix => fileB.startsWith(prefix));
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  };
  
  const rojosSorted = rojos.sort(sortByDependency);
  const amarillosSorted = amarillos.sort(sortByDependency);
  const toFix = [...rojosSorted, ...amarillosSorted];
  
  let html = `
    <h3>Plan de Corrección Integral (Disminuir Conflictos a 0%)</h3>
    <p class="small"><strong>Orden recomendado:</strong> Corregir módulos base primero (00-04), luego captura (05-06), luego procesamiento (07-09), luego integración (10-21).</p>
  `;
  
  if (toFix.length === 0) {
    html += '<div class="note-box"><p><strong>Excelente:</strong> Todos los módulos están en estado verde. Sistema operativo.</p></div>';
  } else {
    html += `
      <h4>Módulos a Corregir (${toFix.length})</h4>
      <div class="solution-timeline">
    `;
    
    toFix.forEach((script, idx) => {
      const sem = ((script.indicadores || {}).semaforo || 'Amarillo').toLowerCase();
      const semClass = sem.includes('roj') ? 'rojo' : 'amarillo';
      const priority = sem.includes('roj') ? 'CRÍTICA' : 'MEDIA';
      const step = idx + 1;
      
      const problemas = [
        script.totalLines > 1200 ? `Módulo muy grande (${script.totalLines} líneas) - difícil de mantener` : null,
        (script.indicadores?.acoplamientoExternoProxy || 0) >= 80 ? `Alto acoplamiento externo (${script.indicadores.acoplamientoExternoProxy})` : null,
        (script.functions || []).length > 50 ? `Muchas funciones (${(script.functions || []).length}) - consolidar` : null,
        (script.riesgos || []).length > 0 ? `${(script.riesgos || []).length} riesgos identificados` : null
      ].filter(x => x);
      
      const soluciones = (script.controlesSugeridos || []).slice(0, 4);
      
      html += `
        <div class="solution-item">
          <div class="solution-header">
            <span class="step">${step}</span>
            <strong>${escapeHtml(script.file)}</strong>
            <span class="chip ${semClass}">${priority}</span>
          </div>
          
          <div class="solution-problems">
            <h5>Qué está mal:</h5>
            <ul class="tight">
              ${problemas.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
            </ul>
          </div>
          
          <div class="solution-steps">
            <h5>Soluciones (pasos de corrección):</h5>
            <ol class="tight">
              ${soluciones.map((sol, i) => `<li>${escapeHtml(cleanText(sol))}</li>`).join('')}
            </ol>
          </div>
          
          <div class="solution-impact">
            <h5>Impacto al resolver:</h5>
            <ul class="tight">
              <li>Reduce ${escapeHtml(sem.includes('roj') ? 'riesgo de falla operativa' : 'probabilidad de errores')}</li>
              <li>Mejora mantenibilidad futura</li>
              <li>Facilita pruebas y auditoría</li>
              ${script.totalLines > 1200 ? '<li>Permite refactoring seguro</li>' : ''}
            </ul>
          </div>
          
          <div class="solution-depends">
            <h5>Dependencias:</h5>
            <p class="small">${escapeHtml(buildDependencyText(script))}</p>
          </div>
        </div>
      `;
    });
    
    html += `
      </div>
      
      <h4>Verificación Post-Corrección (Checklist)</h4>
      <div class="note-box">
        <ol class="tight">
          <li><strong>Pruebas unitarias:</strong> Cada módulo corregido debe pasar pruebas de sus funciones críticas</li>
          <li><strong>Pruebas de integración:</strong> Validar que los cambios no rompan los flujos E2E (pagos → cargos → conciliación)</li>
          <li><strong>Pruebas de datos:</strong> Reconciliar: Saldos = Sum(cargos) + Sum(pagos) + Sum(ajustes)</li>
          <li><strong>Auditoría:</strong> Log detallado de quién cambió qué, cuándo, y con qué resultado</li>
          <li><strong>Sign-off:</strong> Director + Líder técnico + QA aprueban cambios</li>
        </ol>
      </div>
    `;
  }
  
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
    B -->|PARCIAL| C["RECARGOS / REVERSALS"]
    C -->|DEGRADA| D["STATES / STATEMENTS"]
    D -->|PARCIAL| E["RESUMEN"]
    E -->|PARCIAL| F["DETALLE"]
    F -->|PARCIAL| G["PORTAL"]
    G -->|VACIO| H["CONCILIACION"]
    H -->|VACIO| I["EXPORT_CONTABILIDAD"]

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
  mermaid.run({ nodes: [ui.mermaidFlow] });

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
        <h4>Conclusión Operativa del Flujo</h4>
        <div class="flow-detail">
          <p>El proyecto no necesita reescritura completa.</p>
          <p>Necesita visibilidad de flujo, trazabilidad de propagación y alertas de ruptura entre módulos.</p>
          <p>Origen de ruptura principal: States / Statements.</p>
          <p>Módulos finales degradados por herencia: Resumen, Detalle, Portal, Conciliación y Exportación.</p>
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
  if (scriptNode) mermaid.run({ nodes: [scriptNode] });
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
