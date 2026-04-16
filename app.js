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
  const topAmarillo = state.scripts.filter(s => ((s.indicadores || {}).semaforo || '').toLowerCase().includes('amar'));
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

  ui.execKpis.innerHTML = `
    <h3>Resumen Ejecutivo para Dirección</h3>
    <p class="small"><strong>Propósito:</strong> Estado operativo del ciclo completo de cargos, pagos y conciliación. Permite identificar prioridades de estabilización y control sin necesidad de detalles técnicos.</p>
    <div class="exec-grid">
      <div class="kpi"><div class="v">${state.scripts.length}</div><div class="k">Módulos del sistema</div></div>
      <div class="kpi"><div class="v">${sem.rojo}</div><div class="k">Riesgo alto (Rojo)</div></div>
      <div class="kpi"><div class="v">${sem.amarillo}</div><div class="k">Riesgo medio (Amarillo)</div></div>
      <div class="kpi"><div class="v">${sem.verde}</div><div class="k">Riesgo bajo (Verde)</div></div>
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

  // Construcción de narrativa ejecutiva desde JSON
  let execHtml = `
    <h3>Narración Ejecutiva: Estado del Sistema</h3>
    
    <h4>1. Propósito General</h4>
    <div class="note-box">
      <p>El sistema CARGOS_MORA automatiza el ciclo completo de:</p>
      <ul class="tight">
        <li><strong>Captura:</strong> Inscripciones de estudiantes y registro de cargos</li>
        <li><strong>Procesamiento:</strong> Aplicación de pagos y cálculo de mora/recargos</li>
        <li><strong>Control:</strong> Conciliación, trazabilidad y auditoría</li>
        <li><strong>Exportación:</strong> Reportes para portales, sistemas contables y operativos</li>
      </ul>
    </div>

    <h4>1.5. Visión Gráfica del Ciclo E2E (para Directores)</h4>
    <div id="execFlowChart" class="mermaid">flowchart LR
      A["📥 Entrada<br/>Cargos/Pagos/Ajustes"] -->|Validar| B["⚙️ Config<br/>Base 00-04"]
      B -->|Normalizar| C["📊 Ingesta<br/>05-06"]
      C -->|Procesar| D["🧮 Cálculos<br/>07-09"]
      D -->|Generar| E["📈 Reportes<br/>10,17"]
      E -->|Conciliar| F["✅ Cierre<br/>18-21"]
      F -->|Auditoría| G["📋 Salida Final<br/>Datos en Prod"]
      H["🎯 Runners<br/>90-99"] -.->|Coordinan| B
      H -.->|Coordinan| C
      H -.->|Coordinan| D
      
      style A fill:#e6f7f7,stroke:#005f73,stroke-width:2px
      style B fill:#e6f7ec,stroke:#136f3a,stroke-width:2px
      style C fill:#e6f7f7,stroke:#005f73,stroke-width:2px
      style D fill:#ffe5e5,stroke:#9b1c1c,stroke-width:2px
      style E fill:#ffe5e5,stroke:#9b1c1c,stroke-width:2px
      style F fill:#e6f7ec,stroke:#136f3a,stroke-width:2px
      style G fill:#e6f7ec,stroke:#136f3a,stroke-width:2px
      style H fill:#ffe5e5,stroke:#9b1c1c,stroke-width:3px

    <h4>2. Flujo de Procesos (E2E)</h4>
    <div class="note-box">
      <ol class="tight">
        <li><strong>Base y configuración (módulos 00-04):</strong> Inicializa parámetros, esquema, configuración. Si falla aquí, toda operación posterior será inconsistente.</li>
        <li><strong>Ingestión (módulos 05-06):</strong> Captura pagos y solicitudes de estudiantes. Datos incorrectos aquí generan errores en cascada.</li>
        <li><strong>Cargos y ajustes (módulos 07-09):</strong> Calcula cargos, aplica mora, recargos y genera estados de cuenta. Es donde la precisión operativa es crítica.</li>
        <li><strong>Exportación (módulos 10, 17):</strong> Prepara datos para sistemas externos (portal, contabilidad). Si aquí hay cortes o transformaciones mal hechas, los reportes finales serán incorrectos.</li>
        <li><strong>Cierre y auditoría (módulos 18-21):</strong> Conciliación, pruebas de humo y validaciones. Protege la confiabilidad del ciclo.</li>
        <li><strong>Orquestación (módulos 90-99):</strong> Ejecuta el flujo completo. Es el "director de orquesta"; cualquier error aquí interrumpe todo.</li>
      </ol>
    </div>

    <h4>3. Puntos de Choque Críticos</h4>
    <div class="line-grid">
      <div class="mini-card">
        <h5>Acoplamiento Alto</h5>
        <p class="small">Muchos módulos dependen unos de otros. Cambios en un solo lugar pueden romper múltiples procesos. Requiere pruebas de punta a punta antes de cada despliegue.</p>
      </div>
      <div class="mini-card">
        <h5>Módulos Grandes</h5>
        <p class="small">Scripts con más de 1000 líneas concentran mucha lógica. Mayor probabilidad de bugs ocultos. Prioridad: pruebas exhaustivas y refactoring a futuro.</p>
      </div>
      <div class="mini-card">
        <h5>Dependencias no Formales</h5>
        <p class="small">No hay contratos escritos entre módulos. Si uno cambia el formato de datos, otros pueden fallar sin notificación. Requiere coordinación explícita.</p>
      </div>
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

  execHtml += `
    <h4>5. Plan de Verificación Recomendado</h4>
    <div class="note-box">
      <ol class="tight">
        <li><strong>Pruebas unitarias:</strong> Validar funciones críticas en rojo y amarillo por separado.</li>
        <li><strong>Pruebas de integración:</strong> Ejecutar flujos E2E simulando datos reales (cargos, pagos, ajustes).</li>
        <li><strong>Pruebas de datos:</strong> Reconciliar totales y saldos antes/después de cada operación.</li>
        <li><strong>Control de cambios:</strong> Matriz impacto-módulo: antes de desplegar, mapear qué módulos se tocan y qué pueden romper.</li>
        <li><strong>Auditoría post-ejecución:</strong> Hoja de logs detallada; trazabilidad de cada pago, cargo, ajuste aplicado.</li>
      </ol>
    </div>

    <h4>6. Indicadores de Salud (KPIs a Monitorear)</h4>
    <div class="line-grid">
      <div class="mini-card">
        <h5>Consistencia</h5>
        <p class="small">Saldos iniciales = Sum(cargos) + Sum(pagos) + Sum(ajustes). Si no cuadra, hay error en cálculo.</p>
      </div>
      <div class="mini-card">
        <h5>Latencia</h5>
        <p class="small">Tiempo de ejecución por runner. Si sube anormalmente, posible cuello de botella.</p>
      </div>
      <div class="mini-card">
        <h5>Errores Silenciosos</h5>
        <p class="small">Funciones que no lanzan excepción pero retornan resultados vacíos/malformados. Revisar logs detallados.</p>
      </div>
      <div class="mini-card">
        <h5>Trazabilidad</h5>
        <p class="small">Cada operación debe tener identificador único, timestamp, usuario, resultado. Sin esto, auditoría es imposible.</p>
      </div>
    </div>
  `;

  ui.execNarrative.innerHTML = execHtml;
  mermaid.run({ nodes: [document.getElementById('riskPie'), document.getElementById('execFlowChart')] });
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
  // Diagrama principal E2E del flujo de negocio
  const mainFlow = `flowchart TD
    A1["📋 ENTRADA DE DATOS<br/>Formularios/Archivos/API"] --> A2{Validar<br/>Estructura}
    A2 -->|OK| B["🔵 MÓDULOS BASE 00-04<br/>Config, Schemas, Utilitarios<br/>Inicializar sistema"]
    A2 -->|Error| A3["❌ Rechazar<br/>Log error"]
    
    B --> C["🟢 INGESTA 05-06<br/>Leer Cargos, Pagos<br/>Normalizar datos"]
    C --> D{Datos<br/>Válidos?}
    D -->|Sí| E["⚠️ PROCESAMIENTO 07-09<br/>Calcular intereses<br/>Aplicar ajustes<br/>Reversals"]
    D -->|No| A3
    
    E --> F["🟡 ESTADOS 09<br/>Actualizar estatus<br/>Generar snapshots"]
    F --> G["🔴 PORTAL 10,17<br/>Reportes visuales<br/>Exportar datos"]
    G --> H["✅ CIERRE 18-21<br/>Conciliar totales<br/>QA<br/>Sign-off"]
    
    I["🎯 ORQUESTADORES 90-99<br/>Runners principales<br/>Coordinan toda la cadena"] -.->|Dispara| B
    I -.->|Dispara| C
    I -.->|Dispara| E
    I -.->|Dispara| F
    I -.->|Dispara| G
    I -.->|Dispara| H
    I -.->|Escucha| A3
    
    H --> J["📊 SALIDA FINAL<br/>Reportes, Auditoría<br/>Datos en producción"]
    
    style A1 fill:#e6f7f7,stroke:#005f73,stroke-width:3px,color:#003844
    style A2 fill:#e6f7f7,stroke:#005f73,stroke-width:2px
    style A3 fill:#ffe5e5,stroke:#9b1c1c,stroke-width:3px,color:#600909
    style B fill:#e6f7ec,stroke:#136f3a,stroke-width:3px,color:#0a3d1a
    style C fill:#e6f7f7,stroke:#005f73,stroke-width:3px,color:#003844
    style D fill:#fff7dd,stroke:#8a6a00,stroke-width:2px
    style E fill:#ffe5e5,stroke:#9b1c1c,stroke-width:3px,color:#600909
    style F fill:#fff7dd,stroke:#8a6a00,stroke-width:3px,color:#5a4200
    style G fill:#ffe5e5,stroke:#9b1c1c,stroke-width:3px,color:#600909
    style H fill:#e6f7ec,stroke:#136f3a,stroke-width:3px,color:#0a3d1a
    style I fill:#ffe5e5,stroke:#9b1c1c,stroke-width:4px,color:#600909
    style J fill:#e6f7ec,stroke:#136f3a,stroke-width:3px,color:#0a3d1a`;

  ui.mermaidFlow.textContent = mainFlow;
  mermaid.run({ nodes: [ui.mermaidFlow] });

  // Notas detalladas sobre cada etapa
  ui.flowNotes.innerHTML = `
    <div class="flow-container">
      <h3>📊 Flujo Detallado: E2E CARGOS_MORA</h3>
      
      <div class="flow-stage">
        <h4>Etapa 1️⃣ - ENTRADA (Datos brutos)</h4>
        <div class="flow-detail">
          <p><strong>¿Qué entra?</strong> Cargos académicos, pagos de estudiantes, ajustes manuales via formularios/CSV/API</p>
          <p><strong>Crítico:</strong> Si entra basura, todo sale basura. Validación estructural aquí es obligatoria.</p>
          <p><strong>Módulos:</strong> 00-04 (Config, Schemas, Validadores)</p>
          <p><strong>Riesgo:</strong> 🟢 BASE - debe estar funcional 100%</p>
        </div>
      </div>

      <div class="flow-stage">
        <h4>Etapa 2️⃣ - INGESTA (Lectura y normalización)</h4>
        <div class="flow-detail">
          <p><strong>¿Qué pasa?</strong> Leer cargos/pagos desde hojas, normalizar fechas, valores, referencias</p>
          <p><strong>Crítico:</strong> Aquí se interpolan los datos. Si hay duplicados o cortes de línea, generan cascadas de conflictos.</p>
          <p><strong>Módulos:</strong> 05-06 (Lectura, Normalización)</p>
          <p><strong>Riesgo:</strong> 🔵 ALTO - acoplado fuerte a estructura de hojas</p>
        </div>
      </div>

      <div class="flow-stage">
        <h4>Etapa 3️⃣ - PROCESAMIENTO (Lógica de negocio)</h4>
        <div class="flow-detail">
          <p><strong>¿Qué pasa?</strong> Calcular intereses, aplicar ajustes, detectar/revertir pagos dobles, generar estados de cuenta</p>
          <p><strong>Crítico:</strong> La lógica acá es compleja. Cambios sin pruebas pueden desalinear saldos de toda la base de datos.</p>
          <p><strong>Módulos:</strong> 07-09 (Cálculos, Reversals, Estados)</p>
          <p><strong>Riesgo:</strong> 🔴 CRÍTICO - aquí está el 80% de los bugs</p>
        </div>
      </div>

      <div class="flow-stage">
        <h4>Etapa 4️⃣ - PORTAL Y REPORTES (Visualización)</h4>
        <div class="flow-detail">
          <p><strong>¿Qué pasa?</strong> Generar reportes visuales, exportar datos, actualizar dashboards</p>
          <p><strong>Crítico:</strong> Si los datos que llegan aquí son correctos, todo funciona. Si no, los reportes engañan a directores.</p>
          <p><strong>Módulos:</strong> 10, 17 (Portal, Reportes)</p>
          <p><strong>Riesgo:</strong> 🟠 MEDIA - si procesa datos malos, reportes son inútiles</p>
        </div>
      </div>

      <div class="flow-stage">
        <h4>Etapa 5️⃣ - CIERRE Y QA (Control y verificación)</h4>
        <div class="flow-detail">
          <p><strong>¿Qué pasa?</strong> Conciliar totales, generar auditoría, firmar cambios</p>
          <p><strong>Crítico:</strong> Última línea de defensa. Si pasa aquí sin error, es oficial en prod.</p>
          <p><strong>Módulos:</strong> 18-21 (Cierre, Auditoría, QA)</p>
          <p><strong>Riesgo:</strong> 🟢 CONTROL - debe ser robusto 100%</p>
        </div>
      </div>

      <div class="flow-stage">
        <h4>⚡ ORQUESTADORES (Runners 90-99)</h4>
        <div class="flow-detail">
          <p><strong>¿Por qué aquí?</strong> NO son módulos de lógica, son COORDINADORES. Disparan toda la cadena en orden correcto.</p>
          <p><strong>Crítico:</strong> Si un runner falla, toda la cadena se detiene. Si coordina mal, etapas se ejecutan en desorden.</p>
          <p><strong>Riesgo:</strong> 🔴 CRÍTICO - cualquier error aquí paraliza TODO</p>
        </div>
      </div>

      <div class="flow-stage" style="background:#fff7dd; border-left: 6px solid #8a6a00;">
        <h4>🔑 Claves para Entender el Flujo</h4>
        <ul class="tight">
          <li><strong>Dependencia:</strong> Cada etapa depende de que la anterior sea correcta.</li>
          <li><strong>Cascada de fallos:</strong> Un error en etapa 1 (entrada) propaga hasta etapa 5 (salida corrupta).</li>
          <li><strong>Paralelización limitada:</strong> Runners pueden disparar en paralelo, pero cada runner debe respetar el orden lógico.</li>
          <li><strong>Reversibilidad:</strong> Reversals (etapa 3) permiten corregir errores SIN reprocessar todo.</li>
          <li><strong>Auditoría obligatoria:</strong> Cada paso debe loguear entrada/salida para trazabilidad.</li>
        </ul>
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
