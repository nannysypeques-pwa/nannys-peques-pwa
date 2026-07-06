/**
 * NANNY STAR - VISTA PREMIUM DE PERFIL
 * Controlador independiente para renderizar e inicializar la interfaz premium de Nanny Star.
 */

// Criterios mapeados para niñeras fijas y eventuales
const CRITERIOS_FIJAS_MAP = {
  semana_sin_faltas: { name: 'Semana sin faltas', points: 2, icon: '✨' },
  reportes_comunicacion: { name: 'Reportes y comunicación', points: 3, icon: '📞' },
  llegada_puntual: { name: 'Llegada puntual', points: 2, icon: '⏰' },
  cumplimiento_neuronanny: { name: 'Programa Neuronanny', points: 2, icon: '🧠' },
  ultimo_minuto: { name: 'Servicio último minuto', points: 2, icon: '⚡' },
  capacitacion_no_obligatoria: { name: 'Capacitación opcional', points: 7, icon: '🎓' },
  entrenamiento_star: { name: 'Entrenamiento Star', points: 25, icon: '🎓' },
  recomendar_nanny: { name: 'Recomendar Nanny', points: 20, icon: '👥' },
  eventos_convivencias: { name: 'Eventos/Convivencia', points: 10, icon: '🎉' },
  no_conexion_reuniones: { name: 'No conectarse a reuniones', points: -10, icon: '⚠️' },
  faltar_servicio: { name: 'Faltar a servicio', points: -10, icon: '⚠️' },
  reporte_negativo_familia: { name: 'Reporte negativo de familia', points: -10, icon: '⚠️' },
  dejar_servicio_sin_14_dias: { name: 'Dejar servicio sin 14 días', points: -20, icon: '⚠️' },
  mala_actitud_agencia: { name: 'Mala actitud con agencia', points: -10, icon: '⚠️' },
  cancelar_servicio_confirmado: { name: 'Cancelar servicio confirmado', points: -10, icon: '⚠️' },
  saltarse_protocolos: { name: 'Saltarse protocolos', points: -10, icon: '⚠️' },
  baja_calificacion_supervision: { name: 'Baja calif. supervisión', points: -10, icon: '⚠️' },
  servicios_eventuales_extras: { name: 'Servicios eventuales extra', points: 3, icon: '📅' },
  horas_semana_40: { name: '40 horas de servicio', points: 3, icon: '⏰' },
  meses_familia_3: { name: '3 meses misma familia', points: 10, icon: '❤️' },
  meses_familia_6: { name: '6 meses misma familia', points: 15, icon: '💖' },
  meses_familia_9: { name: '9 meses misma familia', points: 20, icon: '💝' },
  meses_familia_12: { name: '12 meses misma familia', points: 25, icon: '👑' },
  servicios_eventuales_25: { name: 'Cubrir 25 servicios eventuales', points: 5, icon: '📅' },
  servicios_eventuales_50: { name: 'Cubrir 50 servicios eventuales', points: 10, icon: '📅' },
  servicios_eventuales_75: { name: 'Cubrir 75 servicios eventuales', points: 15, icon: '📅' },
  servicios_eventuales_100: { name: 'Cubrir 100 servicios eventuales', points: 20, icon: '📅' },
  servicios_eventuales_125: { name: 'Cubrir 125 servicios eventuales', points: 25, icon: '👑' }
};

const CRITERIOS_EVENTUALES_MAP = {
  puntualidad_servicios: { name: 'Puntualidad servicios', points: 2, icon: '⏰' },
  ultimo_minuto: { name: 'Servicio de último minuto', points: 2, icon: '⚡' },
  reportes_comunicacion: { name: 'Reportes y comunicación', points: 3, icon: '📞' },
  evaluacion_positiva_cliente: { name: 'Evaluación positiva cliente', points: 2, icon: '⭐' },
  recontratacion_nanny: { name: 'Familia pide repetir nanny', points: 2, icon: '🔄' },
  capacitacion_no_obligatoria: { name: 'Capacitación opcional', points: 7, icon: '🎓' },
  iniciar_servicio_fijo: { name: 'Iniciar servicio fijo', points: 20, icon: '🏠' },
  entrenamiento_star: { name: 'Entrenamiento Star', points: 25, icon: '🎓' },
  recomendar_nanny: { name: 'Recomendar Nanny', points: 20, icon: '👥' },
  eventos_convivencias: { name: 'Eventos/Convivencia', points: 10, icon: '🎉' },
  no_conexion_reuniones: { name: 'No conectarse a reuniones', points: -10, icon: '⚠️' },
  faltar_servicio: { name: 'Faltar a servicio', points: -10, icon: '⚠️' },
  reporte_negativo_familia: { name: 'Reporte negativo de familia', points: -10, icon: '⚠️' },
  mala_actitud_agencia: { name: 'Mala actitud con agencia', points: -10, icon: '⚠️' },
  cancelar_servicio_confirmado: { name: 'Cancelar servicio confirmado', points: -10, icon: '⚠️' },
  saltarse_protocolos: { name: 'Saltarse protocolos', points: -10, icon: '⚠️' },
  baja_calificacion_supervision: { name: 'Baja calif. supervisión', points: -10, icon: '⚠️' },
  servicios_eventuales_25: { name: 'Cubrir 25 servicios eventuales', points: 5, icon: '📅' },
  servicios_eventuales_50: { name: 'Cubrir 50 servicios eventuales', points: 10, icon: '📅' },
  servicios_eventuales_75: { name: 'Cubrir 75 servicios eventuales', points: 15, icon: '📅' },
  servicios_eventuales_100: { name: 'Cubrir 100 servicios eventuales', points: 20, icon: '📅' },
  servicios_eventuales_125: { name: 'Cubrir 125 servicios eventuales', points: 25, icon: '👑' }
};

const NANNY_STAR_MOCK_DATA = {
  puntosSemanales: 85,
  puntosHitoMax: 100,
  nivelActual: "Nanny Plata",
  tendencia: "Puntos obtenidos la semana pasada: 12 pts",
  proximoHito: "Nanny Oro (150 pts acumulados)",
  puntosFaltantes: 65,
  totalAcumulado: 340,
  rachaDias: 12,
  liveStats: {
    totalEventuales: 18,
    antiguedadDiasMax: 45,
    horasSemanaActual: 32,
    eventualesSemanaActual: 1
  },
  logros: [
    { title: "Semana Perfecta", points: "+2 pts", icon: "✨", desc: "Cumplió con todos los servicios asignados sin retrasos ni faltas." },
    { title: "Programa Neuronanny", points: "+2 pts", icon: "🧠", desc: "Implementó exitosamente las actividades de estimulación pedagógica." },
    { title: "Servicio de Último Minuto", points: "+2 pts", icon: "⚡", desc: "Cubrió una guardia de emergencia solicitada con menos de 24h." },
    { title: "Antigüedad 3 Meses", points: "+10 pts", icon: "❤️", desc: "Cumplió 3 meses de servicio continuo con la familia Pérez." },
    { title: "Entrenamiento Star", points: "+25 pts", icon: "🎓", desc: "Asistió y aprobó el curso de capacitación Nanny Star." }
  ],
  reglas: {
    positivas: [
      { name: "Semana sin faltas", points: "+2 pts" },
      { name: "Llegada puntual a su servicio", points: "+2 pts" },
      { name: "Reportes/comunicación puntuales y completos", points: "+3 pts" },
      { name: "Cumplimiento a programa neuronanny", points: "+2 pts" },
      { name: "Servicio de último minuto", points: "+2 pts" },
      { name: "Tomar 2 servicios eventuales extras a la semana", points: "+3 pts" },
      { name: "40 horas de servicio a la semana", points: "+3 pts" },
      { name: "Participar en capacitación no obligatoria", points: "+7 pts" },
      { name: "Avances en el desarrollo de su peque", points: "+7 pts" },
      { name: "Evaluación 4-5 ⭐ del cliente", points: "+7 pts" },
      { name: "Asistir a eventos y convivencias", points: "+10 pts" },
      { name: "Ganar una insignia", points: "+10 pts" },
      { name: "3 meses con la misma familia", points: "+10 pts" },
      { name: "6 meses con la misma familia", points: "+15" },
      { name: "9 meses con la misma familia", points: "+20" },
      { name: "12 meses con la misma familia", points: "+25" },
      { name: "Recomendar a otra nanny y que tome servicio", points: "+20" },
      { name: "Asistir a entrenamiento Nanny Star", points: "+25" }
    ],
    negativas: [
      { name: "No conectarse a reuniones programadas", points: "-10 pts" },
      { name: "Faltar a servicio", points: "-10" },
      { name: "Reporte negativo de la familia", points: "-10" },
      { name: "Mala actitud con la agencia", points: "-10" },
      { name: "Cancelar servicio ya confirmado", points: "-10" },
      { name: "Saltarse protocolos de la agencia", points: "-10" },
      { name: "Baja calificación en supervisión", points: "-10" },
      { name: "Dejar un servicio fijo sin 14 días de anticipación", points: "-20" }
    ]
  }
};

/**
 * Inyecta el HTML base de Nanny Star Premium en el contenedor del perfil
 */
function renderNannyStarPremium() {
  const container = document.getElementById('perfil-nanny-star-container');
  if (!container) return;

  container.innerHTML = `
    <div class="nanny-star-premium">
      <div class="section-title">
        <span>⭐</span> Nanny Star
      </div>
      
      <!-- Círculo de Progreso Semanal -->
      <div class="nanny-star-progress-wrapper">
        <div class="nanny-star-circle-container">
          <svg class="nanny-star-circle-svg" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="nannyStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--pink-main)" />
                <stop offset="100%" stop-color="var(--blue-main)" />
              </linearGradient>
            </defs>
            <circle class="nanny-star-circle-bg" cx="80" cy="80" r="70"></circle>
            <circle class="nanny-star-circle-progress" cx="80" cy="80" r="70"></circle>
          </svg>
          <div class="nanny-star-circle-content">
            <span class="nanny-star-points-val" id="ns-puntos-semanales">0</span>
            <span class="nanny-star-points-label">Puntos Nanny Star</span>
            <span class="nanny-star-level-badge" id="ns-nivel-actual">...</span>
          </div>
        </div>
        
        <div class="nanny-star-trend-badge" id="ns-tendencia-badge">
          <span>📊</span> <span id="ns-tendencia-texto">...</span>
        </div>
      </div>
      
      <!-- Tarjeta de Progreso al Siguiente Hito -->
      <div class="nanny-star-milestone-card">
        <div class="nanny-star-milestone-header">
          <span class="nanny-star-milestone-title">Próximo Hito</span>
          <span id="ns-hito-nombre">...</span>
        </div>
        <div class="nanny-star-bar-bg">
          <div class="nanny-star-bar-fill" id="ns-hito-barra"></div>
        </div>
        <div class="nanny-star-milestone-footer" id="ns-hito-restante">
          Faltan ...
        </div>
      </div>
      
      <!-- Bento Grid (Estadísticas y Metas) -->
      <div class="nanny-star-bento-grid">
        <!-- Fila 1: Metas Semanales (40 Horas y 2 Eventuales Extra) -->
        <div class="nanny-star-bento-card metric-card">
          <div class="nanny-star-bento-info">
            <span class="nanny-star-bento-icon">⏰</span>
            <span class="nanny-star-bento-label">Meta 40 Horas/Semana</span>
            <div class="nanny-star-bento-val" id="ns-horas-faltantes">...</div>
          </div>
          <div class="nanny-star-bento-progress" id="ns-horas-progress-wrapper"></div>
        </div>
        <div class="nanny-star-bento-card metric-card">
          <div class="nanny-star-bento-info">
            <span class="nanny-star-bento-icon">➕</span>
            <span class="nanny-star-bento-label">Meta 2 Eventuales Extra</span>
            <div class="nanny-star-bento-val" id="ns-extras-faltantes">...</div>
          </div>
          <div class="nanny-star-bento-progress" id="ns-extras-progress-wrapper"></div>
        </div>

        <!-- Fila 2: Hitos Acumulados (Siguiente Hito Eventuales y Semanas para misma familia) -->
        <div class="nanny-star-bento-card metric-card">
          <div class="nanny-star-bento-info">
            <span class="nanny-star-bento-icon">📅</span>
            <span class="nanny-star-bento-label">Siguiente Hito Eventuales</span>
            <div class="nanny-star-bento-val" id="ns-eventuales-faltantes">...</div>
          </div>
          <div class="nanny-star-bento-progress" id="ns-eventuales-progress-wrapper"></div>
        </div>
        <div class="nanny-star-bento-card metric-card">
          <div class="nanny-star-bento-info">
            <span class="nanny-star-bento-icon">👑</span>
            <span class="nanny-star-bento-label">Semanas para misma familia</span>
            <div class="nanny-star-bento-val" id="ns-semanas-familia">...</div>
          </div>
          <div class="nanny-star-bento-progress" id="ns-semanas-progress-wrapper"></div>
        </div>

        <!-- Fila 3: Racha Activa -->
        <div class="nanny-star-bento-card" style="grid-column: span 2;">
          <span class="nanny-star-bento-icon">🔥</span>
          <span class="nanny-star-bento-label">Racha Activa</span>
          <span class="nanny-star-bento-val" id="ns-racha-dias">0 días</span>
        </div>
      </div>
      
      <!-- Carrusel de Logros Recientes -->
      <div class="nanny-star-carousel-section">
        <div class="nanny-star-carousel-title">
          <span>🎖️</span> Logros Recientes
        </div>
        <div class="nanny-star-carousel-wrapper" id="ns-logros-carousel">
          <div style="text-align: center; padding: 20px; font-size: 13px; color: var(--text-muted); width: 100%;">
            Cargando logros...
          </div>
        </div>
      </div>
      
      <!-- Botón de Acción Principal -->
      <button class="nanny-star-btn-help" onclick="openNannyStarRulesModal()">
        <span>❓</span> ¿Cómo ganar más puntos?
      </button>
    </div>
  `;

  // Inyectar también el modal en el body si no existe aún
  if (!document.getElementById('nanny-star-rules-modal')) {
    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'nanny-star-rules-modal';
    modalBackdrop.className = 'nanny-star-modal-backdrop';
    modalBackdrop.onclick = function(e) {
      if (e.target === modalBackdrop) closeNannyStarRulesModal();
    };
    
    modalBackdrop.innerHTML = `
      <div class="nanny-star-modal-card">
        <div class="nanny-star-modal-header">
          <h3 class="nanny-star-modal-title">⭐ Sistema Nanny Star</h3>
          <button class="nanny-star-modal-close" onclick="closeNannyStarRulesModal()">✕</button>
        </div>
        <div class="nanny-star-modal-body">
          <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
            El programa Nanny Star recompensa tu dedicación, puntualidad y antigüedad con las familias. Suma puntos para subir de nivel y obtener insignias especiales.
          </p>
          
          <div class="nanny-star-modal-subtitle">➕ Cómo Sumar Puntos</div>
          <div class="nanny-star-rules-list" id="ns-rules-positives">
            <!-- Reglas positivas -->
          </div>
          
          <div class="nanny-star-modal-subtitle" style="border-left-color: #ef4444;">⚠️ Penalizaciones</div>
          <div class="nanny-star-rules-list" id="ns-rules-negatives">
            <!-- Reglas negativas -->
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);
  }
}

/**
 * Dibuja un mini círculo de progreso o un badge de completado
 */
function updateMiniProgressCircle(wrapperId, porcentaje, labelText, isCompleted) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  if (isCompleted) {
    wrapper.innerHTML = `
      <div class="metric-completed-badge" title="¡Completado!">
        ✓
      </div>
    `;
  } else {
    const r = 18;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(porcentaje, 1) * circ);
    
    wrapper.innerHTML = `
      <svg class="mini-progress-svg" viewBox="0 0 44 44">
        <circle class="mini-circle-bg" cx="22" cy="22" r="${r}"></circle>
        <circle class="mini-circle-progress" cx="22" cy="22" r="${r}"
                stroke-dasharray="${circ}" stroke-dashoffset="${offset}"></circle>
      </svg>
      <span class="mini-progress-text">${labelText}</span>
    `;
  }
}

/**
 * Actualiza la interfaz del perfil con la estructura de datos dada.
 */
function actualizarUIConDatos(data) {
  // Cargar Datos Básicos
  const ptsSemEl = document.getElementById('ns-puntos-semanales');
  const levelEl = document.getElementById('ns-nivel-actual');
  const trendEl = document.getElementById('ns-tendencia-texto');
  const hitoEl = document.getElementById('ns-hito-nombre');
  const restEl = document.getElementById('ns-hito-restante');
  const rachaEl = document.getElementById('ns-racha-dias');

  if (ptsSemEl) ptsSemEl.textContent = data.totalAcumulado;
  if (levelEl) levelEl.textContent = data.nivelActual;
  if (trendEl) trendEl.textContent = data.tendencia;
  
  if (hitoEl) hitoEl.textContent = data.proximoHito;
  if (restEl) restEl.textContent = `Faltan ${data.puntosFaltantes} pts para el próximo nivel`;
  
  if (rachaEl) rachaEl.textContent = `${data.rachaDias} días`;

  // Poblar Bento Grid de Estadísticas y Metas
  const eventualesFaltantesEl = document.getElementById('ns-eventuales-faltantes');
  const semanasFamiliaEl = document.getElementById('ns-semanas-familia');
  const horasFaltantesEl = document.getElementById('ns-horas-faltantes');
  const extrasFaltantesEl = document.getElementById('ns-extras-faltantes');

  if (data.liveStats) {
    // 1. Siguiente hito eventuales
    const totalEventuales = data.liveStats.totalEventuales || 0;
    let eventualesFaltantes = 0;
    let baseTier = 0;
    let targetTier = 25;

    if (totalEventuales < 25) {
      eventualesFaltantes = 25 - totalEventuales;
      baseTier = 0;
      targetTier = 25;
    } else if (totalEventuales < 50) {
      eventualesFaltantes = 50 - totalEventuales;
      baseTier = 25;
      targetTier = 50;
    } else if (totalEventuales < 75) {
      eventualesFaltantes = 75 - totalEventuales;
      baseTier = 50;
      targetTier = 75;
    } else if (totalEventuales < 100) {
      eventualesFaltantes = 100 - totalEventuales;
      baseTier = 75;
      targetTier = 100;
    } else if (totalEventuales < 125) {
      eventualesFaltantes = 125 - totalEventuales;
      baseTier = 100;
      targetTier = 125;
    } else {
      eventualesFaltantes = 0;
      baseTier = 125;
      targetTier = 125;
    }

    const isEvCompleted = (totalEventuales >= 125);
    const evPercentage = isEvCompleted ? 1 : (totalEventuales - baseTier) / (targetTier - baseTier);
    const evPercentLabel = `${Math.round(evPercentage * 100)}%`;

    if (eventualesFaltantesEl) {
      eventualesFaltantesEl.innerHTML = !isEvCompleted
        ? `${totalEventuales}<span style="font-size: 0.6em; color: var(--text-muted); font-weight: 500;">/${targetTier}</span>
           <div style="font-size: 11px; color: var(--text-muted); font-weight: 500; font-family: sans-serif; margin-top: 2px;">Faltan ${eventualesFaltantes} serv.</div>`
        : `${totalEventuales}<span style="font-size: 0.6em; color: var(--text-muted); font-weight: 500;">/125</span>
           <div class="metric-completed-text" style="font-size: 11px !important; margin-top: 2px;">¡Completado! ✨</div>`;
    }
    updateMiniProgressCircle('ns-eventuales-progress-wrapper', evPercentage, evPercentLabel, isEvCompleted);

    // 2. Semanas para misma familia
    const antiguedadDiasMax = data.liveStats.antiguedadDiasMax || 0;
    const DIAS_MES = 30.44;
    let semanasFaltantesFamilia = 0;
    let baseDays = 0;
    let targetDays = 3 * DIAS_MES;
    let isFamCompleted = false;

    if (antiguedadDiasMax < 3 * DIAS_MES) {
      semanasFaltantesFamilia = Math.ceil(((3 * DIAS_MES) - antiguedadDiasMax) / 7);
      baseDays = 0;
      targetDays = 3 * DIAS_MES;
    } else if (antiguedadDiasMax < 6 * DIAS_MES) {
      semanasFaltantesFamilia = Math.ceil(((6 * DIAS_MES) - antiguedadDiasMax) / 7);
      baseDays = 3 * DIAS_MES;
      targetDays = 6 * DIAS_MES;
    } else if (antiguedadDiasMax < 9 * DIAS_MES) {
      semanasFaltantesFamilia = Math.ceil(((9 * DIAS_MES) - antiguedadDiasMax) / 7);
      baseDays = 6 * DIAS_MES;
      targetDays = 9 * DIAS_MES;
    } else if (antiguedadDiasMax < 12 * DIAS_MES) {
      semanasFaltantesFamilia = Math.ceil(((12 * DIAS_MES) - antiguedadDiasMax) / 7);
      baseDays = 9 * DIAS_MES;
      targetDays = 12 * DIAS_MES;
    } else {
      semanasFaltantesFamilia = 0;
      baseDays = 12 * DIAS_MES;
      targetDays = 12 * DIAS_MES;
      isFamCompleted = true;
    }

    const famPercentage = isFamCompleted ? 1 : (antiguedadDiasMax - baseDays) / (targetDays - baseDays);
    const famPercentLabel = `${Math.round(famPercentage * 100)}%`;

    const mesesActuales = (antiguedadDiasMax / DIAS_MES).toFixed(1);
    const targetMeses = targetDays / DIAS_MES;
    if (semanasFamiliaEl) {
      semanasFamiliaEl.innerHTML = !isFamCompleted
        ? `${mesesActuales}<span style="font-size: 0.6em; color: var(--text-muted); font-weight: 500;">/${targetMeses}m</span>
           <div style="font-size: 11px; color: var(--text-muted); font-weight: 500; font-family: sans-serif; margin-top: 2px;">Faltan ${semanasFaltantesFamilia} sem.</div>`
        : `${mesesActuales}<span style="font-size: 0.6em; color: var(--text-muted); font-weight: 500;">/12m</span>
           <div class="metric-completed-text" style="font-size: 11px !important; margin-top: 2px;">¡Completado! ✨</div>`;
    }
    updateMiniProgressCircle('ns-semanas-progress-wrapper', famPercentage, famPercentLabel, isFamCompleted);

    // 3. Meta 40 Horas/Semana
    const horasSemanaActual = data.liveStats.horasSemanaActual || 0;
    const horasFaltantes40 = Math.max(40 - horasSemanaActual, 0);
    const isHorasCompleted = (horasSemanaActual >= 40);
    const horasPercentage = horasSemanaActual / 40;
    const horasPercentLabel = `${Math.round(horasPercentage * 100)}%`;

    if (horasFaltantesEl) {
      horasFaltantesEl.innerHTML = !isHorasCompleted
        ? `${horasSemanaActual}<span style="font-size: 0.6em; color: var(--text-muted); font-weight: 500;">/40h</span>
           <div style="font-size: 11px; color: var(--text-muted); font-weight: 500; font-family: sans-serif; margin-top: 2px;">Faltan ${horasFaltantes40} h</div>`
        : `${horasSemanaActual}<span style="font-size: 0.6em; color: var(--text-muted); font-weight: 500;">/40h</span>
           <div class="metric-completed-text" style="font-size: 11px !important; margin-top: 2px;">¡Completado! ✨</div>`;
    }
    updateMiniProgressCircle('ns-horas-progress-wrapper', horasPercentage, horasPercentLabel, isHorasCompleted);

    // 4. Meta 2 Eventuales Extra
    const eventualesSemanaActual = data.liveStats.eventualesSemanaActual || 0;
    const eventualesFaltantesExtras = Math.max(2 - eventualesSemanaActual, 0);
    const isExtrasCompleted = (eventualesSemanaActual >= 2);
    const extrasPercentage = eventualesSemanaActual / 2;
    const extrasPercentLabel = `${Math.round(extrasPercentage * 100)}%`;

    if (extrasFaltantesEl) {
      extrasFaltantesEl.innerHTML = !isExtrasCompleted
        ? `${eventualesSemanaActual}<span style="font-size: 0.6em; color: var(--text-muted); font-weight: 500;">/2</span>
           <div style="font-size: 11px; color: var(--text-muted); font-weight: 500; font-family: sans-serif; margin-top: 2px;">Falta ${eventualesFaltantesExtras} serv.</div>`
        : `${eventualesSemanaActual}<span style="font-size: 0.6em; color: var(--text-muted); font-weight: 500;">/2</span>
           <div class="metric-completed-text" style="font-size: 11px !important; margin-top: 2px;">¡Completado! ✨</div>`;
    }
    updateMiniProgressCircle('ns-extras-progress-wrapper', extrasPercentage, extrasPercentLabel, isExtrasCompleted);
  }

  // Animar Círculo de Progreso SVG
  const progressCircle = document.querySelector('.nanny-star-circle-progress');
  if (progressCircle) {
    const radio = progressCircle.r.baseVal.value;
    const circunferencia = 2 * Math.PI * radio;
    const porcentaje = Math.min(data.totalAcumulado / data.puntosHitoMax, 1);
    const offset = circunferencia - (porcentaje * circunferencia);
    
    setTimeout(() => {
      progressCircle.style.strokeDasharray = circunferencia;
      progressCircle.style.strokeDashoffset = offset;
    }, 150);
  }

  // Animar Barra de Progreso del Hito
  const progressBar = document.getElementById('ns-hito-barra');
  if (progressBar) {
    const totalProgreso = data.puntosHitoMax;
    const porcentajeBarra = Math.min((data.totalAcumulado / totalProgreso) * 100, 100);
    setTimeout(() => {
      progressBar.style.width = `${porcentajeBarra}%`;
    }, 300);
  }

  // Cargar Carrusel de Logros
  const carousel = document.getElementById('ns-logros-carousel');
  if (carousel && data.logros) {
    carousel.innerHTML = data.logros.map(logro => `
      <div class="nanny-star-carousel-card">
        <span class="nanny-star-card-icon">${logro.icon}</span>
        <div class="nanny-star-card-title">${logro.title}</div>
        <div class="nanny-star-card-points">${logro.points}</div>
        <div class="nanny-star-card-desc">${logro.desc}</div>
      </div>
    `).join('');
  }

  // Cargar Reglas en el Modal
  const posContainer = document.getElementById('ns-rules-positives');
  if (posContainer && data.reglas && data.reglas.positivas) {
    posContainer.innerHTML = data.reglas.positivas.map(rule => `
      <div class="nanny-star-rule-item">
        <span class="nanny-star-rule-name">${rule.name}</span>
        <span class="nanny-star-rule-points positive">${rule.points}</span>
      </div>
    `).join('');
  }

  const negContainer = document.getElementById('ns-rules-negatives');
  if (negContainer && data.reglas && data.reglas.negativas) {
    negContainer.innerHTML = data.reglas.negativas.map(rule => `
      <div class="nanny-star-rule-item">
        <span class="nanny-star-rule-name">${rule.name}</span>
        <span class="nanny-star-rule-points negative">${rule.points}</span>
      </div>
    `).join('');
  }
}

/**
 * Inicializa y llena de información la sección Nanny Star
 */
async function initNannyStarPerfil() {
  // 1. Mostrar estructura base
  renderNannyStarPremium();

  let nombreNanny = null;
  
  // 1. Intentar desde CACHE_CLIENTE (variable global de index.js)
  try {
    if (typeof CACHE_CLIENTE !== 'undefined' && CACHE_CLIENTE && CACHE_CLIENTE.profile) {
      nombreNanny = CACHE_CLIENTE.profile.nombre;
    }
  } catch (e) {}

  // 2. Intentar desde window.CACHE_CLIENTE
  if (!nombreNanny) {
    try {
      if (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) {
        nombreNanny = window.CACHE_CLIENTE.profile.nombre;
      }
    } catch (e) {}
  }

  // 3. Intentar desde el elemento del DOM que muestra el nombre en el perfil
  if (!nombreNanny) {
    const el = document.getElementById('perfil_nombre_header');
    if (el && el.textContent && el.textContent !== 'Mi perfil' && el.textContent.trim() !== '') {
      nombreNanny = el.textContent.trim();
    }
  }

  // 4. Intentar desde la SESION global
  if (!nombreNanny) {
    try {
      if (typeof SESION !== 'undefined' && SESION && SESION.nombre) {
        nombreNanny = SESION.nombre;
      }
    } catch (e) {}
  }

  if (!nombreNanny) {
    console.warn("No se encontró el nombre de la niñera en el perfil. Cargando datos demo.");
    actualizarUIConDatos(NANNY_STAR_MOCK_DATA);
    return;
  }

  try {
    // 2. Importar Firebase de forma asíncrona
    const { dbPuntos } = await import('./firebase-config.js');
    const firestore = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    
    // Autenticación silenciosa anónima
    const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
    const auth = firebaseAuthModule.getAuth(dbPuntos.app);
    if (!auth.currentUser) {
        await firebaseAuthModule.signInAnonymously(auth).catch(err => {
            console.warn("No se pudo iniciar sesión anónima en el perfil:", err);
        });
    }

    const normName = nombreNanny.trim().normalize('NFC');

    // 3. Consultar todos los registros de puntos oficiales (esBorrador == false)
    const q = firestore.query(
        firestore.collection(dbPuntos, "puntos_nannies"),
        firestore.where("nannyName", "==", normName),
        firestore.where("esBorrador", "==", false)
    );

    const querySnapshot = await firestore.getDocs(q);

    // Llamar al backend para obtener estadísticas en vivo
    let liveStats = {
      totalEventuales: 0,
      antiguedadDiasMax: 0,
      horasSemanaActual: 0,
      eventualesSemanaActual: 0
    };
    try {
      const emailQuery = (typeof SESION !== 'undefined' && SESION && SESION.email) ? SESION.email : '';
      if (emailQuery) {
        const resLive = await api('getNannyStarStats', { email: emailQuery });
        if (resLive && typeof resLive === 'object') {
          liveStats = resLive;
          console.log('Nanny Star Live Stats & Debug:', resLive);
        }
      }
    } catch (e) {
      console.warn("No se pudieron cargar estadísticas en vivo del backend:", e);
    }

    let totalAcumulado = 0;
    let puntosSemanales = 0;
    let puntosSemanaPasada = 0;

    // Calcular lunes de esta semana en formato YYYY-MM-DD
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diff = (diaSemana === 0 ? -6 : 1 - diaSemana);
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diff);
    const lunesActualStr = lunes.toISOString().split('T')[0];

    // Calcular lunes de la semana pasada en formato YYYY-MM-DD
    const lunesAnterior = new Date(lunes);
    lunesAnterior.setDate(lunes.getDate() - 7);
    const lunesAnteriorStr = lunesAnterior.toISOString().split('T')[0];

    const logrosReales = [];
    const semanasOrdenadas = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
            totalAcumulado += (data.puntosTotales || 0);

            if (data.semanaLunes === lunesActualStr) {
                puntosSemanales += (data.puntosTotales || 0);
            }
            if (data.semanaLunes === lunesAnteriorStr) {
                puntosSemanaPasada += (data.puntosTotales || 0);
            }

            if (data.semanaLunes) {
                semanasOrdenadas.push(data.semanaLunes);
            }

            // Mapear criterios acreditados como logros
            if (data.criteriosSeleccionados) {
                const mapCriterios = data.tipoNanny === 'fijas' ? CRITERIOS_FIJAS_MAP : CRITERIOS_EVENTUALES_MAP;
                Object.keys(data.criteriosSeleccionados).forEach(critId => {
                    if (data.criteriosSeleccionados[critId]) {
                        const critConfig = mapCriterios[critId];
                        if (critConfig && critConfig.points > 0) {
                            logrosReales.push({
                                title: critConfig.name,
                                points: `+${critConfig.points} pts`,
                                icon: critConfig.icon || "🌟",
                                desc: `Acreditado en la semana del ${data.semanaLunes}.`,
                                fecha: new Date(data.semanaLunes)
                            });
                        }
                    }
                });
            }
        }
    });

    // Ordenar logros de más reciente a más antiguo
    logrosReales.sort((a, b) => b.fecha - a.fecha);

    const logrosMostrar = logrosReales.slice(0, 5);
    if (logrosMostrar.length === 0) {
        logrosMostrar.push({
            title: "Primeros Pasos",
            points: "0 pts",
            icon: "👶",
            desc: "Suma tus primeros puntos esta semana para desbloquear logros."
        });
    }

    // Calcular racha de semanas consecutivas
    let rachaSemanas = 0;
    if (semanasOrdenadas.length > 0) {
        const semanasUnicas = [...new Set(semanasOrdenadas)].sort();
        let semanaBuscar = lunesActualStr;
        let continuar = true;
        while (continuar) {
            if (semanasUnicas.includes(semanaBuscar)) {
                rachaSemanas++;
                const d = new Date(semanaBuscar);
                d.setDate(d.getDate() - 7);
                semanaBuscar = d.toISOString().split('T')[0];
            } else {
                if (semanaBuscar === lunesActualStr) {
                    const d = new Date(semanaBuscar);
                    d.setDate(d.getDate() - 7);
                    semanaBuscar = d.toISOString().split('T')[0];
                } else {
                    continuar = false;
                }
            }
        }
    }
    const rachaDias = rachaSemanas * 7;

    // Calcular niveles
    let nivelActual = "Nanny Bronce";
    let puntosHitoMax = 100;
    let proximoHito = "Nanny Plata (100 pts)";
    let puntosFaltantes = 100 - totalAcumulado;

    if (totalAcumulado >= 100 && totalAcumulado < 250) {
        nivelActual = "Nanny Plata";
        puntosHitoMax = 250;
        proximoHito = "Nanny Oro (250 pts)";
        puntosFaltantes = 250 - totalAcumulado;
    } else if (totalAcumulado >= 250) {
        nivelActual = "Nanny Oro";
        puntosHitoMax = 500;
        proximoHito = "Nanny Master (500 pts)";
        puntosFaltantes = Math.max(500 - totalAcumulado, 0);
    }

    // Calcular tendencia
    let tendencia = `Puntos obtenidos la semana pasada: ${puntosSemanaPasada} pts`;

    const realData = {
        puntosSemanales: puntosSemanales,
        puntosHitoMax: puntosHitoMax,
        nivelActual: nivelActual,
        tendencia: tendencia,
        proximoHito: proximoHito,
        puntosFaltantes: puntosFaltantes,
        totalAcumulado: totalAcumulado,
        rachaDias: rachaDias,
        logros: logrosMostrar,
        reglas: NANNY_STAR_MOCK_DATA.reglas,
        liveStats: liveStats
    };

    actualizarUIConDatos(realData);

  } catch(err) {
    console.error("Error al inicializar Nanny Star con datos reales:", err);
    actualizarUIConDatos(NANNY_STAR_MOCK_DATA);
  }
}

/**
 * Funciones del Modal de Reglas
 */
function openNannyStarRulesModal() {
  const modal = document.getElementById('nanny-star-rules-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeNannyStarRulesModal() {
  const modal = document.getElementById('nanny-star-rules-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Exportar globalmente
window.initNannyStarPerfil = initNannyStarPerfil;
window.openNannyStarRulesModal = openNannyStarRulesModal;
window.closeNannyStarRulesModal = closeNannyStarRulesModal;
