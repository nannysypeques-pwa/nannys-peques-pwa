/**
 * CONTROL DE SERVICIOS - INTERFAZ DE USUARIO (FRONTEND UI)
 * Centro de control administrativo: matriz editable de servicios, sincronización con clientes
 * y niñeras, vinculación automática de correos y filtros en tiempo real.
 */

// Helper global de escape y sanitización XSS (OWASP ASVS V5.3)
function _csEscapeHTML(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  if (s.trim().toLowerCase() === 'undefined' || s.trim().toLowerCase() === 'null') return '';
  if (typeof window.escapeHTML === 'function') return window.escapeHTML(s);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Caches locales para búsquedas instantáneas en memoria
let _cacheClientesCS = [];
let _cacheClientesEventualesCS = [];
let _cacheNannysCS = [];
let _subTabClientesActual = 'fijos';

// Caches locales para búsquedas instantáneas en memoria
const _clientesFallbackDefault = [];
const _nannysFallbackDefault = [];

// Estado de navegación de semanas y sincronización en tiempo real
let _currentSemanaMatrizIso = null;
let _matrizRealtimeChannel = null;
let _matrizSaveTimeout = null;

// =========================================================================
// GESTIÓN DE CIUDADES EN LA MATRIZ (Puebla, Xalapa, Querétaro, CDMX)
// =========================================================================
let _currentCiudadMatriz = (typeof localStorage !== 'undefined' && localStorage.getItem('nyp_admin_current_ciudad')) || 'Puebla';
let _cacheServiciosSemanaCompleta = [];

/**
 * Cambia la ciudad activa en la matriz de servicios
 * @param {string} ciudad - 'Puebla', 'Xalapa', 'Querétaro' o 'CDMX'
 */
function cambiarCiudadMatriz(ciudad) {
  if (!ciudad) return;
  const ciudadLimpia = String(ciudad).trim();
  _currentCiudadMatriz = ciudadLimpia;
  try {
    sessionStorage.setItem('nyp_admin_manual_ciudad_selected', 'true');
    localStorage.setItem('nyp_admin_current_ciudad', ciudadLimpia);
  } catch (e) { }

  actualizarSelectorCiudadUI();

  // Si hay un guardado en debounce pendiente, cancelarlo y vaciarlo
  if (_matrizSaveTimeout) {
    clearTimeout(_matrizSaveTimeout);
    _matrizSaveTimeout = null;
  }

  // Recargar la matriz para la semana actual con la nueva ciudad seleccionada
  const semIso = _currentSemanaMatrizIso || (typeof getMondayISO === 'function' ? getMondayISO(new Date()) : null);
  cargarMatrizServiciosSupabase(semIso);
}
window.cambiarCiudadMatriz = cambiarCiudadMatriz;

/**
 * Actualiza el estado visual (.active) y los contadores en vivo de los botones del selector de ciudad
 */
function actualizarSelectorCiudadUI() {
  const ciudadActual = (_currentCiudadMatriz || 'Puebla').trim().toLowerCase();
  const pills = document.querySelectorAll('.cs-city-pill');

  // Conteo de servicios con datos en cada ciudad para la semana activa
  const conteoPorCiudad = {};
  if (Array.isArray(_cacheServiciosSemanaCompleta)) {
    _cacheServiciosSemanaCompleta.forEach(s => {
      if (s && (typeof servicioTieneDatos !== 'function' || servicioTieneDatos(s))) {
        const cNorm = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(s.ciudad || 'Puebla') : (s.ciudad || 'Puebla').toLowerCase();
        conteoPorCiudad[cNorm] = (conteoPorCiudad[cNorm] || 0) + 1;
      }
    });
  }

  pills.forEach(p => {
    const rawCiudad = p.getAttribute('data-ciudad') || '';
    const pCiudad = rawCiudad.trim().toLowerCase();
    const pCiudadNorm = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(rawCiudad) : pCiudad;
    const count = conteoPorCiudad[pCiudadNorm] || 0;

    if (pCiudad === ciudadActual) {
      p.classList.add('active');
      p.setAttribute('aria-selected', 'true');
    } else {
      p.classList.remove('active');
      p.setAttribute('aria-selected', 'false');
    }

    // Badge numérico con los servicios activos en esa ciudad
    let badge = p.querySelector('.cs-city-count-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cs-city-count-badge';
      badge.style.marginLeft = '4px';
      badge.style.fontSize = '11px';
      badge.style.fontWeight = '700';
      badge.style.opacity = '0.9';
      p.appendChild(badge);
    }
    if (count > 0) {
      badge.textContent = ` (${count})`;
      badge.style.display = 'inline';
    } else {
      badge.textContent = '';
      badge.style.display = 'none';
    }
  });
}
window.actualizarSelectorCiudadUI = actualizarSelectorCiudadUI;

// =========================================================================
// MOTOR DE HISTORIAL DE CAMBIOS (UNDO / REDO - CTRL+Z / CTRL+Y)
// =========================================================================
let _adminUndoStack = [];
let _adminRedoStack = [];
let _isExecutingUndoRedo = false;
let _lastSavedSnapshotJson = null;
let _snapshotEnFoco = null;
const MAX_UNDO_STACK_SIZE = 50;

/**
 * Muestra notificación toast sutil y elegante
 */
function mostrarToastHistorial(mensaje, icon = 'success') {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: mensaje,
      icon: icon === 'error' ? 'error' : (icon === 'info' ? 'info' : 'success'),
      toast: true,
      timer: 1300,
      showConfirmButton: false,
      position: 'top-end'
    });
  }
}

/**
 * Actualiza el estado visual habilitado/deshabilitado de los botones de Deshacer y Rehacer
 */
function actualizarBotonesDeshacerRehacer() {
  const btnUndo = document.getElementById('csBtnUndo');
  const btnRedo = document.getElementById('csBtnRedo');
  const canUndo = _adminUndoStack.length > 0 || !!_snapshotEnFoco;
  const canRedo = _adminRedoStack.length > 0;

  if (btnUndo) {
    btnUndo.disabled = !canUndo;
    btnUndo.classList.toggle('is-disabled', !canUndo);
  }
  if (btnRedo) {
    btnRedo.disabled = !canRedo;
    btnRedo.classList.toggle('is-disabled', !canRedo);
  }
}

/**
 * Captura el estado previo completo de la matriz antes de aplicar una acción destructiva/mutación
 */
function capturarEstadoPrevioAntesDeAccion(desc = '') {
  if (_isExecutingUndoRedo) return;
  const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
  const datos = obtenerDatosMatrizServicios();
  if (!datos || datos.length === 0) return;

  const snapshot = {
    semanaIso: sem,
    datos: JSON.parse(JSON.stringify(datos)),
    desc: desc,
    timestamp: Date.now()
  };

  const snapJson = JSON.stringify({ semana: sem, datos: snapshot.datos });
  if (snapJson === _lastSavedSnapshotJson && _adminUndoStack.length > 0) return;

  _adminUndoStack.push(snapshot);
  if (_adminUndoStack.length > MAX_UNDO_STACK_SIZE) _adminUndoStack.shift();
  _adminRedoStack = []; // Toda nueva acción invalida la pila de rehacer
  _lastSavedSnapshotJson = snapJson;
  actualizarBotonesDeshacerRehacer();
}

/**
 * Sincroniza atómicamente el estado restaurado (deshacer/rehacer) con Supabase y LocalStorage
 */
async function sincronizarMatrizRestauradaSupabase(datosRestaurados, semanaIso) {
  guardarMatrizLocal();
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client || !semanaIso) return;

  try {
    // 1. Consultar registros actuales en Supabase para identificar eliminados
    const { data: rowsDb, error: errDb } = await client
      .from('control_servicios')
      .select('id')
      .eq('semana_iso', semanaIso);

    if (!errDb && Array.isArray(rowsDb)) {
      const idsRestaurados = new Set((datosRestaurados || []).map(d => d.id).filter(Boolean));
      const idsAEliminar = rowsDb.map(r => r.id).filter(id => !idsRestaurados.has(id));

      if (idsAEliminar.length > 0) {
        await client
          .from('control_servicios')
          .delete()
          .in('id', idsAEliminar);
      }
    }

    // 2. Guardar masivamente los registros restaurados
    if (Array.isArray(datosRestaurados) && datosRestaurados.length > 0) {
      await ejecutarUpsertControlServicios(client, datosRestaurados);
    }

    // 3. Propagar orden y datos de bloques persistentes
    await propagarMatrizBloquesPosteriores(datosRestaurados, semanaIso, client);

    // 4. Notificar a otras pestañas y dispositivos en tiempo real
    emitirCambioMatrizRealtime(client, {
      type: 'control_servicios_update',
      semana_iso: semanaIso,
      accion: 'restaurar'
    });
  } catch (err) {
    console.warn("⚠️ Error al sincronizar restauración en Supabase:", err);
  }
}

/**
 * Deshace la última edición en la matriz de servicios (Ctrl + Z)
 */
async function deshacerUltimoCambio() {
  if (_isExecutingUndoRedo) return;

  // Si el usuario estaba editando un input con foco activo y cambió su valor
  if (_snapshotEnFoco) {
    const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
    const datosActuales = obtenerDatosMatrizServicios();
    const prevJson = JSON.stringify({ semana: _snapshotEnFoco.semanaIso, datos: _snapshotEnFoco.datos });
    const currJson = JSON.stringify({ semana: sem, datos: datosActuales });

    if (prevJson !== currJson) {
      _adminUndoStack.push(_snapshotEnFoco);
    }
    _snapshotEnFoco = null;
  }

  if (_adminUndoStack.length === 0) {
    mostrarToastHistorial("ℹ️ No hay más cambios para deshacer", "info");
    return;
  }

  // Desenfocar elemento activo para evitar eventos blur posteriores conflictivos
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }

  _isExecutingUndoRedo = true;

  try {
    const semActual = _currentSemanaMatrizIso || getMondayISO(new Date());
    const datosActuales = obtenerDatosMatrizServicios();
    const estadoActual = {
      semanaIso: semActual,
      datos: JSON.parse(JSON.stringify(datosActuales)),
      timestamp: Date.now()
    };

    // Sacar el estado previo de la pila de deshacer
    const snapshotAnterior = _adminUndoStack.pop();

    // Guardar el estado actual en la pila de rehacer
    _adminRedoStack.push(estadoActual);
    if (_adminRedoStack.length > MAX_UNDO_STACK_SIZE) _adminRedoStack.shift();

    // Si el cambio pertenecía a otra semana, cambiar de semana primero
    if (snapshotAnterior.semanaIso && snapshotAnterior.semanaIso !== _currentSemanaMatrizIso) {
      _currentSemanaMatrizIso = snapshotAnterior.semanaIso;
      actualizarCabecerasSemanaMatriz(_currentSemanaMatrizIso);
    }

    // Renderizar datos previos y guardar
    renderizarMatrizServicios(snapshotAnterior.datos);
    await sincronizarMatrizRestauradaSupabase(snapshotAnterior.datos, _currentSemanaMatrizIso);

    _lastSavedSnapshotJson = JSON.stringify({ semana: _currentSemanaMatrizIso, datos: snapshotAnterior.datos });
    actualizarBotonesDeshacerRehacer();
    mostrarToastHistorial("↩️ Cambio deshecho (Ctrl+Z)", "success");
  } catch (err) {
    console.error("Error al deshacer:", err);
    mostrarToastHistorial("⚠️ Error al deshacer cambio", "error");
  } finally {
    _isExecutingUndoRedo = false;
  }
}

/**
 * Rehace la última edición deshecha en la matriz de servicios (Ctrl + Y / Ctrl + Shift + Z)
 */
async function rehacerUltimoCambio() {
  if (_isExecutingUndoRedo) return;

  if (_adminRedoStack.length === 0) {
    mostrarToastHistorial("ℹ️ No hay cambios para rehacer", "info");
    return;
  }

  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }

  _isExecutingUndoRedo = true;

  try {
    const semActual = _currentSemanaMatrizIso || getMondayISO(new Date());
    const datosActuales = obtenerDatosMatrizServicios();
    const estadoActual = {
      semanaIso: semActual,
      datos: JSON.parse(JSON.stringify(datosActuales)),
      timestamp: Date.now()
    };

    // Sacar el snapshot de rehacer
    const snapshotSiguiente = _adminRedoStack.pop();

    // Guardar el estado actual en la pila de deshacer
    _adminUndoStack.push(estadoActual);
    if (_adminUndoStack.length > MAX_UNDO_STACK_SIZE) _adminUndoStack.shift();

    if (snapshotSiguiente.semanaIso && snapshotSiguiente.semanaIso !== _currentSemanaMatrizIso) {
      _currentSemanaMatrizIso = snapshotSiguiente.semanaIso;
      actualizarCabecerasSemanaMatriz(_currentSemanaMatrizIso);
    }

    renderizarMatrizServicios(snapshotSiguiente.datos);
    await sincronizarMatrizRestauradaSupabase(snapshotSiguiente.datos, _currentSemanaMatrizIso);

    _lastSavedSnapshotJson = JSON.stringify({ semana: _currentSemanaMatrizIso, datos: snapshotSiguiente.datos });
    actualizarBotonesDeshacerRehacer();
    mostrarToastHistorial("↪️ Cambio rehecho (Ctrl+Y)", "success");
  } catch (err) {
    console.error("Error al rehacer:", err);
    mostrarToastHistorial("⚠️ Error al rehacer cambio", "error");
  } finally {
    _isExecutingUndoRedo = false;
  }
}

// Escuchar focusin en la tabla de servicios para capturar el estado antes de editar
document.addEventListener('focusin', function (e) {
  if (_isExecutingUndoRedo) return;
  if (e.target && e.target.closest && e.target.closest('#csTableBody')) {
    if (!_snapshotEnFoco) {
      const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
      const datosActuales = obtenerDatosMatrizServicios();
      if (datosActuales && datosActuales.length > 0) {
        _snapshotEnFoco = {
          semanaIso: sem,
          datos: JSON.parse(JSON.stringify(datosActuales)),
          timestamp: Date.now()
        };
      }
    }
  }
});

// Registrar cambio al salir del foco si hubo modificaciones en la tabla
document.addEventListener('focusout', function (e) {
  if (_isExecutingUndoRedo) return;
  if (e.target && e.target.closest && e.target.closest('#csTableBody')) {
    setTimeout(() => {
      if (_snapshotEnFoco) {
        const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
        const datosActuales = obtenerDatosMatrizServicios();
        const prevJson = JSON.stringify({ semana: _snapshotEnFoco.semanaIso, datos: _snapshotEnFoco.datos });
        const currJson = JSON.stringify({ semana: sem, datos: datosActuales });

        if (prevJson !== currJson) {
          _adminUndoStack.push(_snapshotEnFoco);
          if (_adminUndoStack.length > MAX_UNDO_STACK_SIZE) _adminUndoStack.shift();
          _adminRedoStack = [];
          _lastSavedSnapshotJson = currJson;
          actualizarBotonesDeshacerRehacer();
        }
        _snapshotEnFoco = null;
      }
    }, 150);
  }
});

// Atajos de teclado globales para Administrador: Ctrl + Z y Ctrl + Y / Ctrl + Shift + Z
document.addEventListener('keydown', function (e) {
  const isCtrl = e.ctrlKey || e.metaKey;
  if (!isCtrl) return;

  const key = e.key ? e.key.toLowerCase() : '';

  // Verificar si estamos en la vista de administración o matriz de servicios
  const panelAdmin = document.getElementById('vista-admin') || document.getElementById('panelServicios') || document.getElementById('adminControlServiciosView');
  const isControlServiciosPage = window.location.pathname.includes('control_servicios') || !!document.getElementById('csTableBody');
  const isPanelVisible = (panelAdmin && window.getComputedStyle(panelAdmin).display !== 'none') || isControlServiciosPage;

  if (!isPanelVisible) return;

  // Si hay un modal abierto activo (por ejemplo, SweetAlert de confirmación o modal de nuevo cliente), permitir escape
  const modalAbierto = document.querySelector('.custom-modal[style*="display: flex"], .custom-modal[style*="display: block"], .swal2-shown');
  if (modalAbierto) return;

  // Ctrl + Z (sin Shift): Deshacer
  if (key === 'z' && !e.shiftKey) {
    e.preventDefault();
    deshacerUltimoCambio();
  }
  // Ctrl + Y o Ctrl + Shift + Z: Rehacer
  else if ((key === 'y' && !e.shiftKey) || (key === 'z' && e.shiftKey)) {
    e.preventDefault();
    rehacerUltimoCambio();
  }
});

/**
 * Retorna el lunes (formato YYYY-MM-DD) de la fecha dada o actual
 */
function getMondayISO(d) {
  const date = d ? new Date(d) : new Date();
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const offset = monday.getTimezoneOffset() * 60000;
  return new Date(monday.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Suma o resta semanas completas a una fecha ISO
 */
function addWeeksToISO(isoStr, numWeeks) {
  const parts = isoStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2] + (numWeeks * 7));
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

/**
 * Actualiza los textos de los encabezados de la tabla con las fechas de la semana
 */
function actualizarCabecerasSemanaMatriz(lunesIso) {
  if (!lunesIso) return;
  const parts = lunesIso.split('-').map(Number);
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const diasNombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  for (let i = 0; i < 7; i++) {
    const curDate = new Date(parts[0], parts[1] - 1, parts[2] + i);
    const diaNum = String(curDate.getDate()).padStart(2, '0');
    const th = document.getElementById(`csThDay${i}`);
    if (th) {
      th.textContent = `${diasNombres[i]} ${diaNum}`;
    }
  }

  const fechaLunes = new Date(parts[0], parts[1] - 1, parts[2]);
  const fechaDomingo = new Date(parts[0], parts[1] - 1, parts[2] + 6);
  const labelText = `Semana: ${String(fechaLunes.getDate()).padStart(2, '0')} ${meses[fechaLunes.getMonth()]} - ${String(fechaDomingo.getDate()).padStart(2, '0')} ${meses[fechaDomingo.getMonth()]}`;

  const weekLabels = document.querySelectorAll('.cs-week-label');
  weekLabels.forEach(el => el.textContent = labelText);
  actualizarEstadoBotonHoy();
}

/**
 * Navega a la semana anterior (-1) o siguiente (+1) y recarga los servicios
 */
async function cambiarSemanaMatriz(dir) {
  if (_matrizSaveTimeout) {
    clearTimeout(_matrizSaveTimeout);
    _matrizSaveTimeout = null;
  }
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  if (!_currentSemanaMatrizIso) {
    _currentSemanaMatrizIso = getMondayISO(new Date());
  }
  _currentSemanaMatrizIso = addWeeksToISO(_currentSemanaMatrizIso, dir);
  actualizarCabecerasSemanaMatriz(_currentSemanaMatrizIso);
  await cargarMatrizServiciosSupabase(_currentSemanaMatrizIso);
}
window.cambiarSemanaMatriz = cambiarSemanaMatriz;
window.getMondayISO = getMondayISO;
window.actualizarCabecerasSemanaMatriz = actualizarCabecerasSemanaMatriz;

function calcularSemanasDelMes(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dayOfWeek = firstDay.getDay();
  const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
  const startMonday = new Date(year, month, 1 + diffToMon);
  startMonday.setHours(0, 0, 0, 0);
  const mesesCortos = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const weeks = [];
  let cur = new Date(startMonday);
  while (cur <= lastDay || cur.getDay() !== 1) {
    const weekDays = [];
    let mondayIso = "";
    let fechaInicioSem = null;
    let fechaFinSem = null;
    for (let i = 0; i < 7; i++) {
      const d = new Date(cur);
      const iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      if (i === 0) {
        mondayIso = iso;
        fechaInicioSem = d;
      }
      if (i === 6) {
        fechaFinSem = d;
      }
      weekDays.push({
        dayNum: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        iso: iso
      });
      cur.setDate(cur.getDate() + 1);
    }
    const labelRango = fechaInicioSem.getDate() + " " + mesesCortos[fechaInicioSem.getMonth()] + " - " + fechaFinSem.getDate() + " " + mesesCortos[fechaFinSem.getMonth()];
    weeks.push({
      mondayIso: mondayIso,
      labelRango: labelRango,
      days: weekDays
    });
    if (cur > lastDay && cur.getDay() === 1) break;
  }
  return weeks;
}

async function seleccionarSemanaDesdeCalendario(mondayIso) {
  cerrarCalendarioSemanas();
  if (_matrizSaveTimeout) {
    clearTimeout(_matrizSaveTimeout);
    _matrizSaveTimeout = null;
  }
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  if (_currentSemanaMatrizIso === mondayIso) return;
  _currentSemanaMatrizIso = mondayIso;
  actualizarCabecerasSemanaMatriz(mondayIso);
  await cargarMatrizServiciosSupabase(mondayIso);
  actualizarEstadoBotonHoy();
}

async function irSemanaActual() {
  const hoyLunes = getMondayISO(new Date());
  cerrarCalendarioSemanas();
  if (_matrizSaveTimeout) {
    clearTimeout(_matrizSaveTimeout);
    _matrizSaveTimeout = null;
  }
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  if (_currentSemanaMatrizIso === hoyLunes) {
    const btnHoy = document.getElementById("csBtnHoy");
    if (btnHoy) {
      btnHoy.classList.add("cs-pulse-feedback");
      setTimeout(() => btnHoy.classList.remove("cs-pulse-feedback"), 450);
    }
    return;
  }
  _currentSemanaMatrizIso = hoyLunes;
  actualizarCabecerasSemanaMatriz(_currentSemanaMatrizIso);
  await cargarMatrizServiciosSupabase(_currentSemanaMatrizIso);
  actualizarEstadoBotonHoy();
}

window.calcularSemanasDelMes = calcularSemanasDelMes;
window.seleccionarSemanaDesdeCalendario = seleccionarSemanaDesdeCalendario;
window.irSemanaActual = irSemanaActual;

/**
 * Retorna la clase CSS de color según el tipo de servicio seleccionado
 */
function getServiceClass(tipo) {
  if (!tipo) return '';
  const t = String(tipo).toLowerCase();
  if (t.includes('neuro')) return 'svc-neuronanny';
  if (t.includes('educativa')) return 'svc-educativa';
  if (t.includes('miss')) return 'svc-miss-nanny';
  if (t.includes('bitacora') || t.includes('bitácora')) return 'svc-bitacora';
  return '';
}

/**
 * Servicios iniciales: lista 100% en blanco vinculada a Supabase
 */
function obtenerServiciosIniciales() {
  return [];
}

/**
 * Convierte formatos de entrada al formato visible "xx:xx P" o "xx:xx A"
 */
function formatearHora12(str) {
  if (!str) return '';
  str = String(str).trim();
  if (str === '-' || str === '--:--' || str === '') return '';

  // Limpiar cualquier letra o símbolo no permitido (solo dígitos, dos puntos y opcional A o P)
  str = str.replace(/[^0-9:aApP]/g, '');
  if (!str) return '';

  // Caso 1: Ya tiene sufijo A o P (ej. "8:00 A", "08:00 P", "8 A", "20P")
  const m12 = str.match(/^(\d{1,2}):?(\d{1,2})?\s*([aApP])\.?[mM]?$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    let m = m12[2] !== undefined ? m12[2].padEnd(2, '0') : '00';
    let p = m12[3].toUpperCase();
    if (h === 0) h = 12;
    if (h > 12 && h <= 24) {
      p = 'P';
      h = h - 12;
    }
    return `${String(h).padStart(2, '0')}:${m.padStart(2, '0')} ${p}`;
  }

  // Caso 2: 3 o 4 dígitos continuos sin dos puntos (ej. "800" -> 08:00 A, "2000" -> 08:00 P, "1430" -> 02:30 P)
  const mDigits = str.match(/^(\d{1,2})(\d{2})$/);
  if (mDigits && !str.includes(':')) {
    let h = parseInt(mDigits[1], 10);
    let m = mDigits[2];
    if (h >= 0 && h <= 24 && parseInt(m, 10) < 60) {
      let p = (h >= 12 && h < 24) ? 'P' : 'A';
      if (h > 12) h = h - 12;
      if (h === 0 || h === 24) h = 12;
      return `${String(h).padStart(2, '0')}:${m} ${p}`;
    }
  }

  // Caso 3: Formato 24 horas con o sin dos puntos (ej. "20:00", "20", "8:00", "8", "14:30")
  const m24 = str.match(/^(\d{1,2})[:.]?(\d{1,2})?$/);
  if (m24) {
    let h = parseInt(m24[1], 10);
    let m = m24[2] !== undefined ? m24[2].padEnd(2, '0') : '00';
    if (h >= 0 && h <= 24 && parseInt(m, 10) < 60) {
      let p = (h >= 12 && h < 24) ? 'P' : 'A';
      if (h > 12) h = h - 12;
      if (h === 0 || h === 24) h = 12;
      return `${String(h).padStart(2, '0')}:${m.padStart(2, '0')} ${p}`;
    }
  }

  return '';
}

/**
 * Convierte de formato visible ("08:00 P") a números 24h ("20:00") para edición cómoda sin letras
 */
function horaA24(str) {
  if (!str) return '';
  str = String(str).trim();
  const regex = /^(\d{1,2}):(\d{2})\s*([AP])$/i;
  const m = str.match(regex);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = m[2];
    const p = m[3].toUpperCase();
    if (p === 'P' && h < 12) h += 12;
    if (p === 'A' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${min}`;
  }
  return str.replace(/[^0-9:]/g, '');
}

/**
 * Convierte un string de hora (formato 12h o 24h) a minutos desde las 00:00 (0 - 1439)
 */
function horaStringAMinutos(str) {
  if (!str) return null;
  const s24 = horaA24(str);
  if (!s24) return null;
  const m = s24.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (hh >= 0 && hh <= 24 && mm >= 0 && mm < 60) {
      return (hh % 24) * 60 + mm;
    }
  }
  return null;
}

/**
 * Calcula la sumatoria de horas totales de la semana de un servicio
 * @param {HTMLElement|Object} servicioOElemento - Fila <tr> o data object del servicio
 * @returns {number} Horas totales acumuladas en la semana
 */
function calcularHorasTotalesServicio(servicioOElemento) {
  const dias = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  let totalMinutos = 0;

  if (servicioOElemento instanceof HTMLElement) {
    dias.forEach(d => {
      const iniEl = servicioOElemento.querySelector(`[data-field="${d}_inicio"]`);
      const finEl = servicioOElemento.querySelector(`[data-field="${d}_fin"]`);
      const iniStr = iniEl ? iniEl.value : '';
      const finStr = finEl ? finEl.value : '';
      const mIni = horaStringAMinutos(iniStr);
      const mFin = horaStringAMinutos(finStr);
      if (mIni !== null && mFin !== null && mFin !== mIni) {
        let diff = mFin - mIni;
        if (diff < 0) diff += 24 * 60; // Cruce de medianoche (ej. 22:00 a 02:00)
        totalMinutos += diff;
      }
    });
  } else if (servicioOElemento && typeof servicioOElemento === 'object') {
    const s = servicioOElemento;
    const h = s.horarios || s || {};
    dias.forEach(d => {
      const iniStr = h[`${d}_inicio`] !== undefined ? h[`${d}_inicio`] : (s[`${d}_inicio`] || '');
      const finStr = h[`${d}_fin`] !== undefined ? h[`${d}_fin`] : (s[`${d}_fin`] || '');
      const mIni = horaStringAMinutos(iniStr);
      const mFin = horaStringAMinutos(finStr);
      if (mIni !== null && mFin !== null && mFin !== mIni) {
        let diff = mFin - mIni;
        if (diff < 0) diff += 24 * 60;
        totalMinutos += diff;
      }
    });
  }

  return totalMinutos / 60;
}

/**
 * Formatea el número de horas para visualización compacta y elegante (ej. "20 hrs", "22.5 hrs")
 */
function formatearHorasTotalesDisplay(horas) {
  if (!horas || horas <= 0) return '-';
  const formatted = (horas % 1 === 0) ? horas.toString() : parseFloat(horas.toFixed(2)).toString();
  return `${formatted} hrs`;
}

/**
 * Actualiza en tiempo real el badge de horas de una fila tras editar cualquier entrada/salida
 */
function actualizarHorasFilaEnVivo(row) {
  if (!row) return;
  const badgeEl = row.querySelector('.col-total-hours .cs-hours-badge');
  if (badgeEl) {
    const horas = calcularHorasTotalesServicio(row);
    const display = formatearHorasTotalesDisplay(horas);
    badgeEl.textContent = display;

    const cell = row.querySelector('td.col-total-hours');
    if (cell) {
      cell.setAttribute('title', horas > 0 ? `Horas totales semanales: ${display}` : 'Sin horas registradas');
    }

    if (horas > 0) {
      badgeEl.classList.add('has-hours');
    } else {
      badgeEl.classList.remove('has-hours');
    }
  }

  // Revalidar confirmación de asistencia ante cambios en horas
  if (typeof actualizarEstadoConfirmacionFila === 'function') {
    actualizarEstadoConfirmacionFila(row);
  }
}

/**
 * Filtro estricto: Solo permite escribir números (0-9).
 */
function handleTimeKeypress(e) {
  if (e.key && e.key.length === 1 && !/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
}

/**
 * Aplica máscara interactiva en tiempo real mientras se escribe:
 * Va llenando automáticamente el formato "XX:XX" y limita estrictamente a 4 dígitos, no más.
 */
function handleTimeInputEvent(input, e) {
  const isDeleting = e && e.inputType && e.inputType.startsWith('delete');
  let digits = input.value.replace(/\D/g, '').slice(0, 4);

  if (!digits) {
    input.value = '';
    handleTimeInput(input);
    return;
  }

  if (isDeleting) {
    if (digits.length <= 2) {
      input.value = digits;
    } else {
      input.value = digits.slice(0, 2) + ':' + digits.slice(2);
    }
    handleTimeInput(input);
    return;
  }

  // Si el primer dígito es >= 3 (ej. 8 o 9), se convierte automáticamente en "08:" o "09:"
  if (digits.length === 1 && parseInt(digits, 10) >= 3) {
    input.value = '0' + digits + ':';
    handleTimeInput(input);
    return;
  }

  // Si tiene 2 dígitos, validar máximo 23 y colocar dos puntos ":"
  if (digits.length === 2) {
    let h = parseInt(digits, 10);
    if (h > 23) digits = '23';
    input.value = digits + ':';
    handleTimeInput(input);
    return;
  }

  // Si tiene 3 o 4 dígitos, estructurar como "HH:MM"
  if (digits.length > 2) {
    let h = digits.slice(0, 2);
    let m = digits.slice(2, 4);
    if (parseInt(h, 10) > 23) h = '23';
    if (m.length === 2 && parseInt(m, 10) > 59) m = '59';
    input.value = h + ':' + m;
    handleTimeInput(input);
    return;
  }

  input.value = digits;
  handleTimeInput(input);
}

function handleTimeFocus(input) {
  const val24 = horaA24(input.value);
  input.value = val24;
  input.select();
}

function handleTimeBlur(input) {
  const formatted = formatearHora12(input.value);
  input.value = formatted;
  handleTimeInput(input);
  notificarCambioFila(input, true);
}

function handleTimeKeydown(e, input) {
  if (e.key === 'Enter') {
    input.blur();
  }
}

/**
 * Paleta de colores para fondo de celda en la matriz de servicios
 * Cuidadosamente seleccionada con tonos pasteles suaves y acentos vivos acordes a la identidad de Nannys & Peques
 */
const CS_PALETA_FONDOS = [
  { id: 'clear', nombre: 'Sin fondo', hex: 'transparent', border: 'transparent' },
  { id: 'pink_soft', nombre: 'Rosa Pastel', hex: '#FCE7F3', border: '#FCE7F3' },
  { id: 'pink_pop', nombre: 'Rosa Vibrante', hex: '#F472B6', border: '#F472B6' },
  { id: 'teal_soft', nombre: 'Menta Pastel', hex: '#CCFBF1', border: '#CCFBF1' },
  { id: 'cyan_pop', nombre: 'Turquesa / Cian', hex: '#38BDF8', border: '#38BDF8' },
  { id: 'yellow_soft', nombre: 'Amarillo Pastel', hex: '#FEF08A', border: '#FEF08A' },
  { id: 'amber_pop', nombre: 'Ámbar Cálido', hex: '#FBBF24', border: '#FBBF24' },
  { id: 'orange_soft', nombre: 'Melocotón Pastel', hex: '#FFEDD5', border: '#FFEDD5' },
  { id: 'coral_pop', nombre: 'Coral Vibrante', hex: '#FB923C', border: '#FB923C' },
  { id: 'purple_soft', nombre: 'Lavanda Pastel', hex: '#EDE9FE', border: '#EDE9FE' },
  { id: 'purple_pop', nombre: 'Púrpura Orquídea', hex: '#C084FC', border: '#C084FC' },
  { id: 'green_soft', nombre: 'Verde Pastel', hex: '#DCFCE7', border: '#DCFCE7' },
  { id: 'green_pop', nombre: 'Verde Esmeralda', hex: '#4ADE80', border: '#4ADE80' },
  { id: 'blue_soft', nombre: 'Azul Cielo Pastel', hex: '#DBEAFE', border: '#DBEAFE' },
  { id: 'pearl', nombre: 'Gris Perla', hex: '#F1F5F9', border: '#F1F5F9' },
  { id: 'white', nombre: 'Blanco Puro', hex: '#FFFFFF', border: '#FFFFFF' }
];

/**
 * Obtiene el color de contorno / borde correspondiente a un fondo para la píldora de texto.
 * Para que no se note la línea, el contorno es exactamente del mismo color que el fondo.
 */
function obtenerBordeColor(hex) {
  if (!hex || hex === 'transparent' || hex === 'clear') return 'transparent';
  return hex;
}

/**
 * Paleta de colores para texto/letra en celdas de la matriz
 */
const CS_PALETA_TEXTOS = [
  { id: 'default', nombre: 'Por defecto', hex: 'inherit', display: '#0F172A' },
  { id: 'dark', nombre: 'Pizarra Oscuro', hex: '#1E293B', display: '#1E293B' },
  { id: 'white', nombre: 'Blanco Puro', hex: '#FFFFFF', display: '#FFFFFF' },
  { id: 'pink_deep', nombre: 'Rosa Fucsia', hex: '#BE185D', display: '#BE185D' },
  { id: 'purple_deep', nombre: 'Púrpura Real', hex: '#6D28D9', display: '#6D28D9' },
  { id: 'teal_deep', nombre: 'Turquesa Marino', hex: '#0E7490', display: '#0E7490' },
  { id: 'green_deep', nombre: 'Verde Bosque', hex: '#15803D', display: '#15803D' },
  { id: 'blue_deep', nombre: 'Azul Cobalto', hex: '#1D4ED8', display: '#1D4ED8' },
  { id: 'orange_deep', nombre: 'Naranja Cálido', hex: '#C2410C', display: '#C2410C' },
  { id: 'red_deep', nombre: 'Rojo Carmín', hex: '#B91C1C', display: '#B91C1C' }
];

/**
 * Nombres legibles en español para cada celda de la matriz
 */
const CS_CAMPOS_LABELS = {
  total_horas: 'Horas Totales Semanales',
  lun_inicio: 'Lunes Entrada',
  lun_fin: 'Lunes Salida',
  mar_inicio: 'Martes Entrada',
  mar_fin: 'Martes Salida',
  mie_inicio: 'Miércoles Entrada',
  mie_fin: 'Miércoles Salida',
  jue_inicio: 'Jueves Entrada',
  jue_fin: 'Jueves Salida',
  vie_inicio: 'Viernes Entrada',
  vie_fin: 'Viernes Salida',
  sab_inicio: 'Sábado Entrada',
  sab_fin: 'Sábado Salida',
  dom_inicio: 'Domingo Entrada',
  dom_fin: 'Domingo Salida',
  tipo_servicio: 'Tipo de Servicio',
  cliente_email: 'Email de Cliente',
  cliente_nombre: 'Nombre de Cliente',
  ok_cliente: 'Confirmación Cliente',
  zona: 'Zona',
  nanny_nombre: 'Nombre de Niñera',
  ok_nanny: 'Confirmación Niñera',
  tarifa_cliente: 'Tarifa Cliente',
  tarifa_nanny: 'Tarifa Niñera',
  saldo_cliente: 'Saldo Cliente',
  pago_nanny: 'Pago Niñera',
  alerta: 'Alerta',
  observaciones: 'Observaciones'
};

/**
 * Extrae los colores de celdas almacenados como comentario en observaciones
 */
function extraerColoresDeObservaciones(observaciones) {
  if (!observaciones || typeof observaciones !== 'string') {
    return { colores: {}, obsLimpia: '' };
  }
  let obs = observaciones;
  const match = obs.match(/<!--colores:(.*?)-->/);
  let colores = {};
  if (match) {
    try {
      const raw = decodeURIComponent(match[1]);
      const parsed = JSON.parse(raw);
      colores = (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (err) {
      colores = {};
    }
    obs = obs.replace(/<!--colores:.*?-->/g, '').trim();
  }
  obs = obs.replace(/<!--[\s\S]*?-->/g, '').replace(/\b(undefined|null)\b/gi, '').trim();
  return { colores, obsLimpia: obs };
}

/**
 * Inyecta los colores de celdas dentro de observaciones como comentario seguro
 */
function inyectarColoresEnObservaciones(obsBase, colores) {
  let obs = String(obsBase || '').replace(/<!--colores:.*?-->/g, '').replace(/\b(undefined|null)\b/gi, '').trim();
  if (colores && typeof colores === 'object' && Object.keys(colores).length > 0) {
    const encoded = encodeURIComponent(JSON.stringify(colores));
    return `<!--colores:${encoded}--> ${obs}`.trim();
  }
  return obs;
}

/**
 * Extrae el PID (Persistent Identifier) embebido en observaciones si existe
 */
function extraerPidDeObservaciones(observaciones) {
  if (!observaciones || typeof observaciones !== 'string') return null;
  const match = observaciones.match(/<!--pid:(.*?)-->/);
  return match ? match[1] : null;
}

/**
 * Inyecta o actualiza el PID dentro de observaciones como comentario seguro
 */
function inyectarPidEnObservaciones(obsBase, pid) {
  let obs = String(obsBase || '').replace(/<!--pid:.*?-->/g, '').trim();
  if (pid) {
    return `<!--pid:${pid}--> ${obs}`.trim();
  }
  return obs;
}

/**
 * Detecta si un servicio tiene la etiqueta de cliente nuevo fijo pendiente de primera inserción
 */
function esServicioNuevoCliente(obs) {
  if (!obs || typeof obs !== 'string') return false;
  return /<!--nuevo_cliente:1-->/.test(obs);
}

/**
 * Inyecta o remueve la etiqueta de nuevo cliente fijo en observaciones
 */
function inyectarNuevoClienteEnObservaciones(obsBase, esNuevo = true) {
  let obs = String(obsBase || '').replace(/<!--nuevo_cliente:.*?-->/g, '').trim();
  if (esNuevo) {
    return `<!--nuevo_cliente:1--> ${obs}`.trim();
  }
  return obs;
}

/**
 * Extrae los detalles específicos del servicio (contacto, dirección, ubicación, edad del peque, notas) embebidos en observaciones
 */
function extraerDetallesServicioDeObservaciones(observaciones) {
  if (!observaciones || typeof observaciones !== 'string') return null;
  const match = observaciones.match(/<!--detalles_servicio:(.*?)-->/);
  if (!match || !match[1]) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch (e) {
    try {
      return JSON.parse(match[1]);
    } catch (e2) {
      return null;
    }
  }
}

/**
 * Inyecta o actualiza los detalles específicos del servicio dentro de observaciones como comentario seguro
 */
function inyectarDetallesServicioEnObservaciones(obsBase, detalles) {
  let obs = String(obsBase || '').replace(/<!--detalles_servicio:.*?-->/g, '').trim();
  if (detalles && typeof detalles === 'object') {
    const tieneDatos = Object.values(detalles).some(v => v && String(v).trim().length > 0);
    if (tieneDatos) {
      const encoded = encodeURIComponent(JSON.stringify(detalles));
      return `<!--detalles_servicio:${encoded}--> ${obs}`.trim();
    }
  }
  return obs;
}

/**
 * Limpia todos los metadatos de observaciones para mostrar al usuario o validar contenido
 */
function limpiarMetadatosObservaciones(obs) {
  if (!obs || typeof obs !== 'string') return '';
  return obs
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\b(undefined|null)\b/gi, '')
    .trim();
}


/**
 * Extrae los colores configurados en las celdas directamente desde el DOM de una fila <tr>
 */
function extraerColoresDeFilaDom(row) {
  if (!row) return {};
  const colores = {};
  const cells = row.querySelectorAll('td');
  cells.forEach(td => {
    const input = td.querySelector('[data-field]');
    const field = input ? input.getAttribute('data-field') : td.getAttribute('data-field');
    if (!field) return;

    const bg = td.getAttribute('data-custom-bg') || '';
    const color = td.getAttribute('data-custom-color') || '';
    if (bg || color) {
      colores[field] = {};
      if (bg && bg !== 'transparent') colores[field].bg = bg;
      if (color && color !== 'inherit') colores[field].color = color;
      if (Object.keys(colores[field]).length === 0) {
        delete colores[field];
      }
    }
  });
  return colores;
}

/**
 * Extrae las notas de celdas almacenadas como metadato en observaciones
 */
function extraerNotasDeObservaciones(observaciones) {
  if (!observaciones || typeof observaciones !== 'string') {
    return { notas: {}, obsLimpia: '' };
  }
  let obs = observaciones;
  const match = obs.match(/<!--notas_celdas:(.*?)-->/);
  let notas = {};
  if (match) {
    try {
      const raw = decodeURIComponent(match[1]);
      const parsed = JSON.parse(raw);
      notas = (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (err) {
      notas = {};
    }
    obs = obs.replace(/<!--notas_celdas:.*?-->/g, '').trim();
  }
  obs = obs.replace(/<!--[\s\S]*?-->/g, '').replace(/\b(undefined|null)\b/gi, '').trim();
  return { notas, obsLimpia: obs };
}

/**
 * Inyecta las notas de celdas dentro de observaciones como comentario seguro
 */
function inyectarNotasEnObservaciones(obsBase, notas) {
  let obs = String(obsBase || '').replace(/<!--notas_celdas:.*?-->/g, '').trim();
  if (notas && typeof notas === 'object' && Object.keys(notas).length > 0) {
    const encoded = encodeURIComponent(JSON.stringify(notas));
    return `<!--notas_celdas:${encoded}--> ${obs}`.trim();
  }
  return obs;
}

/**
 * Extrae las notas y montos de horas extras configurados en las celdas directamente desde el DOM de una fila <tr>
 */
function extraerNotasDeFilaDom(row) {
  if (!row) return {};
  const notas = {};
  const cells = row.querySelectorAll('td.has-cell-note');
  cells.forEach(td => {
    const input = td.querySelector('[data-field]');
    const field = input ? input.getAttribute('data-field') : td.getAttribute('data-field');
    if (!field) return;

    const rawNote = td.getAttribute('data-note-text') || '';
    const nota = rawNote ? decodeURIComponent(rawNote) : '';
    const extraCli = parseFloat(td.getAttribute('data-extra-cli') || '0') || 0;
    const extraNan = parseFloat(td.getAttribute('data-extra-nan') || '0') || 0;

    if (nota || extraCli > 0 || extraNan > 0) {
      notas[field] = {
        nota: nota,
        hora_extra_cliente: extraCli,
        hora_extra_nanny: extraNan
      };
    }
  });
  return notas;
}

/**
 * Calcula la sumatoria de montos de horas extras de un servicio (cliente y niñera)
 * @param {HTMLElement|Object} servicioOElemento - Fila <tr> o data object del servicio
 * @returns {{ extraCli: number, extraNan: number }}
 */
function calcularHorasExtrasServicio(servicioOElemento) {
  let extraCli = 0;
  let extraNan = 0;

  if (servicioOElemento instanceof HTMLElement) {
    const notas = extraerNotasDeFilaDom(servicioOElemento);
    Object.values(notas).forEach(n => {
      if (n) {
        if (n.hora_extra_cliente && !isNaN(Number(n.hora_extra_cliente))) {
          extraCli += Number(n.hora_extra_cliente);
        }
        if (n.hora_extra_nanny && !isNaN(Number(n.hora_extra_nanny))) {
          extraNan += Number(n.hora_extra_nanny);
        }
      }
    });
  } else if (servicioOElemento && typeof servicioOElemento === 'object') {
    const s = servicioOElemento;
    let notas = s.notas_celdas;
    if (!notas && s.observaciones) {
      notas = extraerNotasDeObservaciones(s.observaciones).notas;
    }
    if (notas && typeof notas === 'object') {
      Object.values(notas).forEach(n => {
        if (n) {
          if (n.hora_extra_cliente && !isNaN(Number(n.hora_extra_cliente))) {
            extraCli += Number(n.hora_extra_cliente);
          }
          if (n.hora_extra_nanny && !isNaN(Number(n.hora_extra_nanny))) {
            extraNan += Number(n.hora_extra_nanny);
          }
        }
      });
    }
  }

  return { extraCli, extraNan };
}


/**
 * Aplica los colores de celdas recibidos a los elementos DOM de una fila <tr>
 */
function aplicarColoresCeldasAFila(row, coloresCeldas) {
  if (!row) return;
  const cells = row.querySelectorAll('td');
  cells.forEach(td => {
    const input = td.querySelector('[data-field]');
    const field = input ? input.getAttribute('data-field') : td.getAttribute('data-field');
    if (!field) return;

    const conf = (coloresCeldas && coloresCeldas[field]) || null;
    const rawBg = conf && conf.bg ? conf.bg : '';
    const isWhiteBg = rawBg.toLowerCase() === '#ffffff' || rawBg.toLowerCase() === 'white';
    const bg = rawBg && rawBg !== 'transparent' && rawBg !== 'clear' && !isWhiteBg ? rawBg : '';
    const color = conf && conf.color && conf.color !== 'inherit' && conf.color !== 'clear' ? conf.color : '';

    if (bg) {
      const borderCol = obtenerBordeColor(bg);
      td.setAttribute('data-custom-bg', bg);
      td.setAttribute('data-custom-border', borderCol);
      td.style.setProperty('--custom-bg', bg);
      td.style.setProperty('--custom-border', borderCol);
      td.style.backgroundColor = bg;
      if (input && !input.classList.contains('cs-time-input')) {
        input.style.setProperty('--custom-bg', bg);
        input.style.setProperty('--custom-border', borderCol);
        input.style.borderColor = borderCol;
        input.style.backgroundColor = bg;
      }
    } else {
      td.removeAttribute('data-custom-bg');
      td.removeAttribute('data-custom-border');
      td.style.removeProperty('--custom-bg');
      td.style.removeProperty('--custom-border');
      td.style.backgroundColor = '';
      if (input) {
        input.style.removeProperty('--custom-bg');
        input.style.removeProperty('--custom-border');
        input.style.borderColor = '';
        input.style.backgroundColor = '';
      }
    }

    if (color) {
      td.setAttribute('data-custom-color', color);
      td.style.setProperty('--custom-color', color);
      td.style.color = color;
      if (input) {
        input.setAttribute('data-custom-color', color);
        input.style.setProperty('--custom-color', color);
        input.style.color = color;
      }
    } else {
      td.removeAttribute('data-custom-color');
      td.style.removeProperty('--custom-color');
      td.style.color = '';
      if (input) {
        input.removeAttribute('data-custom-color');
        input.style.removeProperty('--custom-color');
        input.style.color = '';
      }
    }
  });
}

/**
 * Verifica si la niñera ha confirmado asistencia para todos los días programados en este servicio,
 * validando que coincidan la niñera, el cliente y los horarios exactos confirmados.
 */
function verificarAsistenciaNannyCompleta(servicio) {
  if (!servicio) return false;
  const nomActual = (servicio.nanny_nombre || (servicio.horarios && servicio.horarios.nanny_nombre) || '').trim();
  if (!nomActual) return false;

  const cliActual = (servicio.cliente_nombre || (servicio.horarios && servicio.horarios.cliente_nombre) || '').trim();

  const dias = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  const diasProgramados = dias.filter(d => {
    const ini = (servicio[d + '_inicio'] || (servicio.horarios && servicio.horarios[d + '_inicio']) || '').trim();
    const fin = (servicio[d + '_fin'] || (servicio.horarios && servicio.horarios[d + '_fin']) || '').trim();
    return (ini && ini !== '-' && ini !== '--:--') || (fin && fin !== '-' && fin !== '--:--');
  });
  if (diasProgramados.length === 0) return false;

  let evidencia = null;
  if (servicio.asistencia_nanny) {
    let a = servicio.asistencia_nanny;
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { } }
    if (a && typeof a === 'object' && (a.confirmada || (Array.isArray(a.dias) && a.dias.length > 0) || (a.dias_confirmados && Object.keys(a.dias_confirmados).length > 0))) {
      evidencia = a;
    }
  }
  if (!evidencia && servicio.observaciones && typeof servicio.observaciones === 'string') {
    const m = servicio.observaciones.match(/<!--asistencia_nanny:(.*?)-->/);
    if (m && m[1]) {
      try { evidencia = JSON.parse(m[1]); } catch (e) { }
    }
  }
  if (!evidencia && servicio.id && typeof document !== 'undefined') {
    const trEl = document.querySelector(`tr[data-id="${servicio.id}"]`);
    if (trEl) {
      const tagEnc = trEl.getAttribute('data-asistencia-tag') ||
        trEl.getAttribute('data-asistencia-backup') ||
        trEl.querySelector('[data-field="observaciones"]')?.getAttribute('data-asistencia-tag') ||
        trEl.querySelector('[data-field="observaciones"]')?.getAttribute('data-asistencia-backup') ||
        trEl.querySelector('td.col-nanny')?.getAttribute('data-asistencia-backup');
      if (tagEnc) {
        try {
          const decoded = decodeURIComponent(tagEnc);
          const m = decoded.match(/<!--asistencia_nanny:(.*?)-->/);
          if (m && m[1]) evidencia = JSON.parse(m[1]);
        } catch (e) { }
      }
    }
  }
  if (!evidencia && servicio.id && window._cacheAsistenciaServicios && window._cacheAsistenciaServicios[servicio.id]) {
    evidencia = window._cacheAsistenciaServicios[servicio.id];
  }
  if (evidencia && servicio.id) {
    window._cacheAsistenciaServicios = window._cacheAsistenciaServicios || {};
    window._cacheAsistenciaServicios[servicio.id] = evidencia;
  }
  if (!evidencia) return false;

  // 1. Validar que el nombre de la niñera sea EXACTAMENTE el mismo que confirmó (nombre completo idéntico)
  let evNannyNombre = (evidencia.nanny_nombre || '').trim();
  if (!evNannyNombre && evidencia.dias_confirmados) {
    const primerDia = Object.values(evidencia.dias_confirmados)[0];
    if (primerDia && primerDia.nanny_nombre) {
      evNannyNombre = primerDia.nanny_nombre.trim();
    }
  }

  const normActualNanny = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(nomActual) : nomActual.toLowerCase().trim();
  const normEvidenciaNanny = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(evNannyNombre) : evNannyNombre.toLowerCase().trim();
  if (!normEvidenciaNanny || !normActualNanny) return false;

  // Validación exacta de nombre completo: no se aceptan nombres distintos ni parciales
  if (normActualNanny !== normEvidenciaNanny) {
    return false;
  }

  // 2. Validar que el cliente sea EXACTAMENTE el mismo
  let evClienteNombre = (evidencia.cliente_nombre || evidencia.cliente || '').trim();
  if (!evClienteNombre && evidencia.dias_confirmados) {
    const primerDiaConf = Object.values(evidencia.dias_confirmados)[0];
    if (primerDiaConf && (primerDiaConf.cliente || primerDiaConf.cliente_nombre)) {
      evClienteNombre = (primerDiaConf.cliente || primerDiaConf.cliente_nombre).trim();
    }
  }
  if (evClienteNombre && cliActual) {
    const normCliActual = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(cliActual) : cliActual.toLowerCase().trim();
    const normEvCliente = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(evClienteNombre) : evClienteNombre.toLowerCase().trim();
    if (normCliActual !== normEvCliente) {
      return false;
    }
  }

  // 3. Validar días y horarios
  const diasConfObj = evidencia.dias_confirmados || {};
  const diasConfArr = Array.isArray(evidencia.dias) ? evidencia.dias : Object.keys(diasConfObj);

  // 3.1 Todos los días actualmente programados deben haber sido confirmados
  const todosDiasConfirmados = diasProgramados.every(d => !!(diasConfObj[d] || diasConfArr.includes(d)));
  if (!todosDiasConfirmados) return false;

  // 3.2 No debe haber días confirmados previamente que ahora se hayan quitado
  const diasConfirmadosValidos = diasConfArr.filter(d => dias.includes(d));
  if (diasConfirmadosValidos.length > 0 && diasConfirmadosValidos.length !== diasProgramados.length) {
    return false;
  }

  // 3.3 Verificar que el horario de cada día programado concuerde con el horario confirmado
  for (const d of diasProgramados) {
    const iniCur = (servicio[d + '_inicio'] || (servicio.horarios && servicio.horarios[d + '_inicio']) || '').trim();
    const finCur = (servicio[d + '_fin'] || (servicio.horarios && servicio.horarios[d + '_fin']) || '').trim();
    const confDia = diasConfObj[d];
    if (confDia) {
      const horConf = (confDia.horario || '').trim();
      const iniConf = (confDia.hora_inicio || confDia.inicio || '').trim();
      const finConf = (confDia.hora_fin || confDia.fin || '').trim();

      if (typeof horaStringAMinutos === 'function') {
        const minIniCur = horaStringAMinutos(iniCur);
        const minFinCur = horaStringAMinutos(finCur);

        let minIniConf = iniConf ? horaStringAMinutos(iniConf) : null;
        let minFinConf = finConf ? horaStringAMinutos(finConf) : null;

        if (horConf && (minIniConf === null || minFinConf === null)) {
          const partes = horConf.split(/[-–—a]/i).map(x => x.trim()).filter(Boolean);
          if (partes.length >= 1 && minIniConf === null) minIniConf = horaStringAMinutos(partes[0]);
          if (partes.length >= 2 && minFinConf === null) minFinConf = horaStringAMinutos(partes[1]);
        }

        if (minIniCur !== null && minIniConf !== null && minIniCur !== minIniConf) {
          return false;
        }
        if (minFinCur !== null && minFinConf !== null && minFinCur !== minFinConf) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Actualiza el estado visual de confirmación de asistencia en una fila de la matriz
 * aplicando verde y check si coincide, o restaurando a blanco/respaldo si no coincide
 */
function actualizarEstadoConfirmacionFila(row) {
  if (!row) return;
  const tdNanny = row.querySelector('td.col-nanny');
  const nannyInput = row.querySelector('[data-field="nanny_nombre"]');
  const inputObs = row.querySelector('[data-field="observaciones"]');
  const cliInput = row.querySelector('[data-field="cliente_nombre"]');
  if (!tdNanny || !nannyInput) return;

  const nomActual = (nannyInput.value || '').trim();
  const cliActual = cliInput ? (cliInput.value || '').trim() : '';

  const servicio = {
    id: row.getAttribute('data-id'),
    nanny_nombre: nomActual,
    cliente_nombre: cliActual
  };

  const dias = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  dias.forEach(d => {
    const elIni = row.querySelector(`[data-field="${d}_inicio"]`);
    const elFin = row.querySelector(`[data-field="${d}_fin"]`);
    servicio[d + '_inicio'] = elIni ? elIni.value.trim() : '';
    servicio[d + '_fin'] = elFin ? elFin.value.trim() : '';
  });

  const confirmada = verificarAsistenciaNannyCompleta(servicio);

  if (confirmada) {
    tdNanny.classList.add('cs-nanny-confirmed');
    tdNanny.setAttribute('title', '✓ Asistencia confirmada por la niñera para todos los servicios de la semana');
    tdNanny.setAttribute('data-nanny-confirmada', nomActual);
    tdNanny.style.setProperty('--custom-bg', '#DCFCE7');
    tdNanny.style.setProperty('--custom-border', '#DCFCE7');
    tdNanny.style.setProperty('background-color', '#DCFCE7', 'important');
    tdNanny.style.setProperty('border-color', '#86EFAC', 'important');

    nannyInput.style.setProperty('--custom-bg', '#DCFCE7');
    nannyInput.style.setProperty('--custom-border', '#DCFCE7');
    nannyInput.style.setProperty('background-color', '#DCFCE7', 'important');
    nannyInput.style.setProperty('border-color', '#DCFCE7', 'important');
    nannyInput.style.setProperty('color', '#15803D', 'important');
    nannyInput.setAttribute('data-nanny-asignada', nomActual);

    // Restaurar tag de asistencia en observaciones si estaba respaldado (preserva confirmación, inicio y fin)
    let tagBackup = row.getAttribute('data-asistencia-backup') ||
      tdNanny.getAttribute('data-asistencia-backup') ||
      (inputObs && inputObs.getAttribute('data-asistencia-backup')) ||
      (inputObs && inputObs.getAttribute('data-asistencia-tag'));

    if (servicio.id && window._cacheAsistenciaServicios && window._cacheAsistenciaServicios[servicio.id]) {
      const cached = window._cacheAsistenciaServicios[servicio.id];
      const hasFin = cached.dias_confirmados && Object.values(cached.dias_confirmados).some(d => !!d.fin_real);
      if (hasFin || !tagBackup) {
        tagBackup = `<!--asistencia_nanny:${JSON.stringify(cached)}-->`;
      }
    }

    if (tagBackup) {
      const encTag = tagBackup.startsWith('%') ? tagBackup : encodeURIComponent(tagBackup);
      if (inputObs) {
        inputObs.setAttribute('data-asistencia-tag', encTag);
        inputObs.setAttribute('data-asistencia-backup', encTag);
      }
      row.setAttribute('data-asistencia-tag', encTag);
      row.setAttribute('data-asistencia-backup', encTag);
      tdNanny.setAttribute('data-asistencia-backup', encTag);
    }
  } else {
    tdNanny.classList.remove('cs-nanny-confirmed');
    tdNanny.removeAttribute('title');
    tdNanny.removeAttribute('data-nanny-confirmada');

    // Respaldar el tag de asistencia antes de limpiarlo de la fila activa (incluyendo inicio y fin de servicio)
    const tagActual = (inputObs && inputObs.getAttribute('data-asistencia-tag')) || row.getAttribute('data-asistencia-tag');
    if (tagActual) {
      row.setAttribute('data-asistencia-backup', tagActual);
      tdNanny.setAttribute('data-asistencia-backup', tagActual);
      if (inputObs) {
        inputObs.setAttribute('data-asistencia-backup', tagActual);
        inputObs.removeAttribute('data-asistencia-tag');
      }
      row.removeAttribute('data-asistencia-tag');

      // Resguardar en caché en memoria
      try {
        const decoded = decodeURIComponent(tagActual);
        const m = decoded.match(/<!--asistencia_nanny:(.*?)-->/);
        if (m && m[1] && servicio.id) {
          window._cacheAsistenciaServicios = window._cacheAsistenciaServicios || {};
          window._cacheAsistenciaServicios[servicio.id] = JSON.parse(m[1]);
        }
      } catch (e) { }
    }

    const customBg = tdNanny.getAttribute('data-custom-bg');
    if (customBg && customBg !== '#DBEAFE' && customBg !== '#DCFCE7') {
      tdNanny.style.setProperty('--custom-bg', customBg);
      tdNanny.style.setProperty('--custom-border', customBg);
      tdNanny.style.setProperty('background-color', customBg, 'important');
      tdNanny.style.setProperty('border-color', customBg, 'important');
      nannyInput.style.setProperty('--custom-bg', customBg);
      nannyInput.style.setProperty('--custom-border', customBg);
      nannyInput.style.setProperty('background-color', customBg, 'important');
      nannyInput.style.setProperty('border-color', customBg, 'important');
      nannyInput.style.removeProperty('color');
    } else {
      tdNanny.removeAttribute('data-custom-bg');
      tdNanny.removeAttribute('data-custom-border');
      tdNanny.style.removeProperty('--custom-bg');
      tdNanny.style.removeProperty('--custom-border');
      tdNanny.style.backgroundColor = '';
      tdNanny.style.borderColor = '';
      nannyInput.style.removeProperty('--custom-bg');
      nannyInput.style.removeProperty('--custom-border');
      nannyInput.style.backgroundColor = '';
      nannyInput.style.borderColor = '';
      nannyInput.style.removeProperty('color');
    }
  }
}

/**
 * Renderiza el HTML de las celdas de una fila de servicio con estilos de color personalizados
 */
function renderCeldasFilaServicioHtml(servicio) {
  const h = servicio.horarios || servicio || {};
  const days = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

  const { colores: parsedColores, obsLimpia: obsSinColores } = extraerColoresDeObservaciones(servicio.observaciones || '');
  const { notas: parsedNotas, obsLimpia } = extraerNotasDeObservaciones(obsSinColores || '');
  const coloresCeldas = (servicio.colores_celdas && Object.keys(servicio.colores_celdas).length > 0)
    ? servicio.colores_celdas
    : parsedColores;
  const notasCeldas = (servicio.notas_celdas && Object.keys(servicio.notas_celdas).length > 0)
    ? servicio.notas_celdas
    : parsedNotas;

  let tagAsist = '';
  const mAsist = (servicio.observaciones || '').match(/<!--asistencia_nanny:.*?-->/);
  if (mAsist) {
    tagAsist = mAsist[0];
  } else if (servicio.asistencia_nanny) {
    let a = servicio.asistencia_nanny;
    if (typeof a === 'string') { try { a = JSON.parse(a); } catch (e) { } }
    if (a && typeof a === 'object' && Object.keys(a).length > 0) {
      tagAsist = `<!--asistencia_nanny:${JSON.stringify(a)}-->`;
    }
  }
  if (!tagAsist && servicio.id && window._cacheAsistenciaServicios && window._cacheAsistenciaServicios[servicio.id]) {
    tagAsist = `<!--asistencia_nanny:${JSON.stringify(window._cacheAsistenciaServicios[servicio.id])}-->`;
  }
  let obsParaMostrar = (typeof limpiarMetadatosObservaciones === 'function')
    ? limpiarMetadatosObservaciones(obsLimpia)
    : String(obsLimpia || '').replace(/<!--[\s\S]*?-->/g, '').replace(/\b(undefined|null)\b/gi, '').trim();
  if (obsParaMostrar.trim().toLowerCase() === 'undefined' || obsParaMostrar.trim().toLowerCase() === 'null') {
    obsParaMostrar = '';
  }

  const getCol = (f) => {
    const c = (coloresCeldas && coloresCeldas[f]) || {};
    const rawBg = c.bg || '';
    const isWhiteBg = rawBg.toLowerCase() === '#ffffff' || rawBg.toLowerCase() === 'white';
    const bg = rawBg && rawBg !== 'transparent' && rawBg !== 'clear' && !isWhiteBg ? rawBg : '';
    const color = c.color && c.color !== 'inherit' && c.color !== 'clear' ? c.color : '';
    let attrs = '';
    let styleVars = [];
    if (bg) {
      const borderCol = obtenerBordeColor(bg);
      attrs += ` data-custom-bg="${bg}" data-custom-border="${borderCol}"`;
      styleVars.push(`--custom-bg: ${bg}`, `--custom-border: ${borderCol}`, `background-color: ${bg} !important`);
    }
    if (color) {
      attrs += ` data-custom-color="${color}"`;
      styleVars.push(`--custom-color: ${color}`, `color: ${color} !important`);
    }
    const styleAttr = styleVars.length > 0 ? ` style="${styleVars.join('; ')};"` : '';
    return { attrs, styleAttr };
  };

  const timePillCells = days.map(d => {
    const rawIni = h[`${d}_inicio`] !== undefined ? h[`${d}_inicio`] : (servicio[`${d}_inicio`] || '');
    const rawFin = h[`${d}_fin`] !== undefined ? h[`${d}_fin`] : (servicio[`${d}_fin`] || '');
    const valIni = formatearHora12(rawIni);
    const valFin = formatearHora12(rawFin);
    const displayIni = (valIni === '-' || !valIni) ? '' : valIni;
    const displayFin = (valFin === '-' || !valFin) ? '' : valFin;
    const clsIni = displayIni ? '' : 'empty-val';
    const clsFin = displayFin ? '' : 'empty-val';
    const colIni = getCol(`${d}_inicio`);
    const colFin = getCol(`${d}_fin`);

    // Comprobar si hay nota u horas extras asociadas a inicio o fin
    const noteIni = notasCeldas && notasCeldas[`${d}_inicio`];
    const hasNoteIni = noteIni && (noteIni.nota || (noteIni.hora_extra_cliente && noteIni.hora_extra_cliente > 0) || (noteIni.hora_extra_nanny && noteIni.hora_extra_nanny > 0));
    const noteIniCls = hasNoteIni ? ' has-cell-note' : '';
    const noteIniAttrs = hasNoteIni
      ? ` data-note-text="${encodeURIComponent(noteIni.nota || '')}" data-extra-cli="${noteIni.hora_extra_cliente || 0}" data-extra-nan="${noteIni.hora_extra_nanny || 0}"`
      : '';

    const noteFin = notasCeldas && notasCeldas[`${d}_fin`];
    const hasNoteFin = noteFin && (noteFin.nota || (noteFin.hora_extra_cliente && noteFin.hora_extra_cliente > 0) || (noteFin.hora_extra_nanny && noteFin.hora_extra_nanny > 0));
    const noteFinCls = hasNoteFin ? ' has-cell-note' : '';
    const noteFinAttrs = hasNoteFin
      ? ` data-note-text="${encodeURIComponent(noteFin.nota || '')}" data-extra-cli="${noteFin.hora_extra_cliente || 0}" data-extra-nan="${noteFin.hora_extra_nanny || 0}"`
      : '';

    return `
      <td${colIni.attrs}${colIni.styleAttr}${noteIniAttrs} class="${noteIniCls}" data-col="${d}_ini" data-day-col="${d}"><input type="text" class="cs-time-input ${clsIni}" value="${displayIni}" placeholder="" maxlength="7" data-field="${d}_inicio" onfocus="handleTimeFocus(this)" onblur="handleTimeBlur(this)" onkeydown="handleTimeKeydown(event, this)" onkeypress="handleTimeKeypress(event)" oninput="handleTimeInputEvent(this, event)"></td>
      <td${colFin.attrs}${colFin.styleAttr}${noteFinAttrs} class="${noteFinCls}" data-col="${d}_fin" data-day-col="${d}"><input type="text" class="cs-time-input ${clsFin}" value="${displayFin}" placeholder="" maxlength="7" data-field="${d}_fin" onfocus="handleTimeFocus(this)" onblur="handleTimeBlur(this)" onkeydown="handleTimeKeydown(event, this)" onkeypress="handleTimeKeypress(event)" oninput="handleTimeInputEvent(this, event)"></td>
    `;
  }).join('');

  const svcTipo = servicio.tipo_servicio || '';
  const svcCls = getServiceClass(svcTipo);

  const colSvc = getCol('tipo_servicio');
  const colEmail = getCol('cliente_email');
  const colCli = getCol('cliente_nombre');
  const colOkCli = getCol('ok_cliente');
  const colZona = getCol('zona');
  const colNan = getCol('nanny_nombre');
  const nanConfirmed = verificarAsistenciaNannyCompleta(servicio);
  const nannyConfirmadaVal = nanConfirmed ? (servicio.nanny_nombre || '').replace(/"/g, '&quot;') : '';
  const colNanStyleFinal = nanConfirmed ? ' style="--custom-bg: #DCFCE7; --custom-border: #DCFCE7; background-color: #DCFCE7 !important; border-color: #DCFCE7 !important;"' : colNan.styleAttr;
  const colOkNan = getCol('ok_nanny');
  const colTarCli = getCol('tarifa_cliente');
  const colTarNan = getCol('tarifa_nanny');
  const colSaldoCli = getCol('saldo_cliente');
  const colPagoNan = getCol('pago_nanny');
  const colAlerta = getCol('alerta');
  const colObs = getCol('observaciones');

  const horasTotales = calcularHorasTotalesServicio(servicio);
  const horasDisplay = formatearHorasTotalesDisplay(horasTotales);
  const colHoras = getCol('total_horas');
  const horasCell = `
    <td class="col-total-hours" data-col="total_horas"${colHoras.attrs}${colHoras.styleAttr} title="${horasTotales > 0 ? `Horas totales semanales: ${horasDisplay}` : 'Sin horas registradas'}">
      <span class="cs-hours-badge ${horasTotales > 0 ? 'has-hours' : ''}" data-field="total_horas">${horasDisplay}</span>
    </td>
  `;

  return `
    ${horasCell}
    ${timePillCells}
    <td class="col-service-type" data-col="service_type"${colSvc.attrs}${colSvc.styleAttr}>
      <select class="cs-service-select ${svcCls}" data-field="tipo_servicio"${colSvc.styleAttr} onchange="handleServiceSelectChange(this)">
        <option value="" ${!svcTipo ? 'selected' : ''}></option>
        <option value="Neuronanny" ${svcTipo === 'Neuronanny' ? 'selected' : ''}>Neuronanny</option>
        <option value="Nanny Educativa" ${svcTipo === 'Nanny Educativa' ? 'selected' : ''}>Nanny Educativa</option>
        <option value="Miss Nanny" ${svcTipo === 'Miss Nanny' ? 'selected' : ''}>Miss Nanny</option>
        <option value="Bitácora" ${svcTipo === 'Bitácora' ? 'selected' : ''}>Bitácora</option>
      </select>
    </td>
    <td class="col-email" data-col="email"${colEmail.attrs}${colEmail.styleAttr}>
      <input type="email" class="cs-cell-input cs-email-input" value="${_csEscapeHTML(servicio.cliente_email)}" placeholder="" data-field="cliente_email"${colEmail.styleAttr} oninput="notificarCambioFila(this, false)" onchange="notificarCambioFila(this, true)" title="Email del cliente">
    </td>
    <td class="col-client" data-col="client"${colCli.attrs}${colCli.styleAttr}>
      <input type="text" class="cs-cell-input cs-client-input" autocomplete="off" value="${_csEscapeHTML(servicio.cliente_nombre)}" placeholder="" data-field="cliente_nombre"${colCli.styleAttr} oninput="handleClienteInputChange(this)" onchange="handleClienteSelectChange(this)">
    </td>
    <td class="col-compact-check" data-col="ok_cli"${colOkCli.attrs}${colOkCli.styleAttr}>
      <input type="checkbox" class="custom-checkbox" ${servicio.ok_cliente ? 'checked' : ''} data-field="ok_cliente" onchange="notificarCambioFila(this, true)" title="Cliente Confirmado">
    </td>
    <td class="col-zone" data-col="zone"${colZona.attrs}${colZona.styleAttr} onclick="handleZonaCellClick(this, event)">
      <input type="text" class="cs-cell-input cs-zone-input" value="${_csEscapeHTML(servicio.zona)}" placeholder="" data-field="zona"${colZona.styleAttr} oninput="notificarCambioFila(this, false)" onchange="notificarCambioFila(this, true)" onclick="handleZonaCellClick(this, event)" title="Clic para ver o editar datos de contacto y ubicación de este servicio">
    </td>
    <td class="col-nanny${nanConfirmed ? ' cs-nanny-confirmed' : ''}" data-col="nanny"${nanConfirmed ? ' title="✓ Asistencia confirmada por la niñera para todos los servicios de la semana"' : ''}${nanConfirmed ? ` data-nanny-confirmada="${_csEscapeHTML(nannyConfirmadaVal)}"` : ''}${tagAsist ? ` data-asistencia-backup="${encodeURIComponent(tagAsist)}"` : ''}${colNan.attrs}${colNanStyleFinal}>
      <input type="text" class="cs-cell-input cs-nanny-input" autocomplete="off" value="${_csEscapeHTML(servicio.nanny_nombre)}" placeholder="" data-field="nanny_nombre" data-nanny-asignada="${_csEscapeHTML(servicio.nanny_nombre)}"${colNanStyleFinal} oninput="handleNannyInputChange(this)" onchange="handleNannyInputChange(this)">
    </td>
    <td class="col-compact-check" data-col="ok_nan"${colOkNan.attrs}${colOkNan.styleAttr}>
      <input type="checkbox" class="custom-checkbox" ${servicio.ok_nanny ? 'checked' : ''} data-field="ok_nanny" onchange="notificarCambioFila(this, true)" title="Niñera Confirmada">
    </td>
    <td class="col-compact-rate" data-col="rate_cli"${colTarCli.attrs}${colTarCli.styleAttr}>
      ${servicio.semana_iso === '__PLANTILLA_BASE__'
      ? `<input type="text" class="cs-cell-input cs-rate-input rate-client" value="${_csEscapeHTML(servicio.tarifa_cliente)}" placeholder="" data-field="tarifa_cliente"${colTarCli.styleAttr} oninput="notificarCambioFila(this, false)" onchange="notificarCambioFila(this, true)" title="Tarifa Cliente">`
      : `<span class="rate-cell rate-client" data-field="tarifa_cliente"${colTarCli.styleAttr}>${_csEscapeHTML(servicio.tarifa_cliente)}</span>`
    }
    </td>
    <td class="col-compact-rate" data-col="rate_nan"${colTarNan.attrs}${colTarNan.styleAttr}>
      ${servicio.semana_iso === '__PLANTILLA_BASE__'
      ? `<input type="text" class="cs-cell-input cs-rate-input rate-nanny" value="${_csEscapeHTML(servicio.tarifa_nanny)}" placeholder="" data-field="tarifa_nanny"${colTarNan.styleAttr} oninput="notificarCambioFila(this, false)" onchange="notificarCambioFila(this, true)" title="Tarifa Niñera">`
      : `<span class="rate-cell rate-nanny" data-field="tarifa_nanny"${colTarNan.styleAttr}>${_csEscapeHTML(servicio.tarifa_nanny)}</span>`
    }
    </td>
    <td class="col-compact-rate col-saldo-cli" data-col="saldo_cli"${colSaldoCli.attrs}${colSaldoCli.styleAttr}>
      <input type="text" class="cs-cell-input cs-rate-input" value="${_csEscapeHTML(servicio.saldo_cliente)}" placeholder="" data-field="saldo_cliente"${colSaldoCli.styleAttr} oninput="this.value=this.value.replace(/[^0-9.]/g,''); notificarCambioFila(this, false)" onchange="notificarCambioFila(this, true)" title="Saldo Total Cliente">
    </td>
    <td class="col-compact-rate col-pago-nan" data-col="pago_nan"${colPagoNan.attrs}${colPagoNan.styleAttr}>
      <input type="text" class="cs-cell-input cs-rate-input" value="${_csEscapeHTML(servicio.pago_nanny)}" placeholder="" data-field="pago_nanny"${colPagoNan.styleAttr} oninput="this.value=this.value.replace(/[^0-9.]/g,''); notificarCambioFila(this, false)" onchange="notificarCambioFila(this, true)" title="Pago Total Niñera">
    </td>
    <td class="col-alerts col-alerts-cell" data-col="alertas"${colAlerta.attrs}${colAlerta.styleAttr}>
      <input type="text" class="cs-cell-input cs-alert-input ${servicio.alerta && servicio.alerta.trim() ? 'has-alert-active' : ''}" value="${_csEscapeHTML(servicio.alerta)}" placeholder="" data-field="alerta"${colAlerta.styleAttr} oninput="handleAlertaInput(this)" onchange="notificarCambioFila(this, true)">
    </td>
    <td class="col-obs" data-col="obs"${colObs.attrs}${colObs.styleAttr}>
      <div class="cs-obs-cell-wrap">
        <input type="text" class="cs-cell-input cs-obs-input" value="${_csEscapeHTML(obsParaMostrar)}" placeholder="" data-field="observaciones" data-asistencia-tag="${encodeURIComponent(tagAsist)}"${colObs.styleAttr} oninput="notificarCambioFila(this, false)" onchange="notificarCambioFila(this, true)">
        <button type="button" class="cs-row-drag-handle" title="Mantén presionado y arrastra para mover de posición" onpointerdown="iniciarArrastreFila(this, event)">⋮</button>
      </div>
    </td>
  `;
}

/**
 * 7 Bloques temáticos de la matriz de servicios en orden estricto
 * Próximos servicios en la sección 5, seguido por Clientes en lista de espera y Clientes potenciales
 */
const BLOQUES_SERVICIOS = [
  { id: 'servicios_fijos', nombre: 'Servicios fijos', icon: '📌' },
  { id: 'servicios_temporales', nombre: 'Servicios temporales', icon: '⏱️' },
  { id: 'servicios_cancelados', nombre: 'Servicios Cancelados', icon: '🚫' },
  { id: 'servicios_eventuales', nombre: 'Servicios eventuales', icon: '🎈' },
  { id: 'proximos_servicios', nombre: 'Próximos servicios', icon: '📅' },
  { id: 'clientes_espera', nombre: 'Clientes en lista de espera', icon: '⏳' },
  { id: 'clientes_potenciales', nombre: 'Clientes Potenciales', icon: '⭐' }
];

/**
 * Bloques persistentes que propagan cambios automáticamente a semanas posteriores
 */
const BLOQUES_PERSISTENTES_FUTURO = ['proximos_servicios', 'clientes_espera', 'clientes_potenciales'];

/**
 * Renderiza la matriz completa dividida en sus 7 bloques temáticos con títulos centrados
 */
function renderizarMatrizServicios(servicios) {
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  const serviciosList = Array.isArray(servicios) ? servicios : [];
  _cacheServiciosSemanaCompleta = serviciosList;
  actualizarSelectorCiudadUI();

  // Filtrar exclusivamente por la ciudad activa seleccionada en la matriz
  const ciudadFiltroNorm = normalizarTextoCS(_currentCiudadMatriz || 'Puebla');
  const serviciosCiudad = serviciosList.filter(s => {
    const cNorm = normalizarTextoCS((s && s.ciudad) || 'Puebla');
    return cNorm === ciudadFiltroNorm;
  });

  // Deduplicación preventiva por id y por pid para evitar duplicados en pantalla
  const seenIds = new Set();
  const seenPids = new Set();
  const dedupedServicios = [];

  for (const s of serviciosCiudad) {
    if (!s) continue;
    if (s.id && seenIds.has(s.id)) continue;
    if (s.id) seenIds.add(s.id);

    const pid = s.pid || (typeof extraerPidDeObservaciones === 'function' ? extraerPidDeObservaciones(s.observaciones || '') : null);
    if (pid && BLOQUES_PERSISTENTES_FUTURO.includes(s.bloque)) {
      const pidKey = `${s.bloque}_${pid}`;
      if (seenPids.has(pidKey)) continue;
      seenPids.add(pidKey);
    }
    dedupedServicios.push(s);
  }

  // Mapear servicios a cada bloque asignado
  const serviciosPorBloque = {};
  BLOQUES_SERVICIOS.forEach(b => {
    serviciosPorBloque[b.id] = [];
  });

  dedupedServicios.forEach(s => {
    const bId = (s.bloque && serviciosPorBloque[s.bloque]) ? s.bloque : 'servicios_fijos';
    serviciosPorBloque[bId].push(s);
  });

  // Ordenamiento estable dentro de cada bloque por la columna 'orden'
  BLOQUES_SERVICIOS.forEach(b => {
    serviciosPorBloque[b.id].sort((a, bRow) => {
      const ordA = (a.orden !== undefined && a.orden !== null) ? Number(a.orden) : 0;
      const ordB = (bRow.orden !== undefined && bRow.orden !== null) ? Number(bRow.orden) : 0;
      if (ordA !== ordB) return ordA - ordB;
      return String(a.id || '').localeCompare(String(bRow.id || ''));
    });
  });

  let fullHtml = '';
  let globalRowIdx = 0;

  BLOQUES_SERVICIOS.forEach((b, bIdx) => {
    const list = serviciosPorBloque[b.id] || [];
    const countConDatos = list.filter(s => servicioTieneDatos(s)).length;

    // Pequeño espacio completamente en blanco entre cada sección (a partir de la segunda)
    if (bIdx > 0) {
      fullHtml += `
        <tr class="cs-section-gap-tr" data-gap-for="${b.id}">
          <td colspan="28"></td>
        </tr>
      `;
    }

    // Fila encabezado de sección con etiqueta centrada y badge decorativo
    fullHtml += `
      <tr class="cs-section-header-tr cs-sec-${b.id}" data-block-id="${b.id}">
        <td colspan="28">
          <div class="cs-section-banner-wrap">
            <div class="cs-section-line"></div>
            <div class="cs-section-badge" ${BLOQUES_PERSISTENTES_FUTURO.includes(b.id) ? 'title="Sección de control interno exclusivo para el administrador (no visible para clientes ni niñeras hasta moverlo a un bloque operativo)"' : ''}>
              <span class="cs-section-icon">${b.icon}</span>
              <span>${b.nombre}</span>
              ${BLOQUES_PERSISTENTES_FUTURO.includes(b.id) ? '<span style="font-size:10px; font-weight:700; letter-spacing:0.3px; opacity:0.85; margin-left:6px; padding:2px 7px; border-radius:12px; background:rgba(0,0,0,0.06); text-transform:uppercase;">🔒 Interno</span>' : ''}
              <span class="cs-section-count" id="csCountSec_${b.id}">${countConDatos}</span>
            </div>
            <div class="cs-section-line"></div>
          </div>
        </td>
      </tr>
    `;

    // Filas del bloque
    list.forEach((servicio, sIdx) => {
      const alertCls = servicio.alert_class ? ` ${servicio.alert_class}` : (servicio.alerta ? ' has-alert-active' : '');
      const semIsoFila = servicio.semana_iso || _currentSemanaMatrizIso || getMondayISO(new Date());
      const pidVal = servicio.pid || extraerPidDeObservaciones(servicio.observaciones) || (BLOQUES_PERSISTENTES_FUTURO.includes(b.id) ? `pid_${servicio.id ? String(servicio.id).replace(/^srv_/, '') : Math.random().toString(36).substr(2, 6)}` : '');
      const ordVal = (servicio.orden !== undefined && servicio.orden !== null) ? servicio.orden : globalRowIdx;
      const detallesSvc = servicio.detalles_servicio || extraerDetallesServicioDeObservaciones(servicio.observaciones_raw) || extraerDetallesServicioDeObservaciones(servicio.observaciones);
      const detallesAttr = detallesSvc ? ` data-detalles-servicio="${encodeURIComponent(JSON.stringify(detallesSvc))}"` : '';
      const obsRawAttr = servicio.observaciones_raw ? ` data-observaciones-raw="${_csEscapeHTML(servicio.observaciones_raw)}"` : '';
      const cdFila = servicio.ciudad || _currentCiudadMatriz || 'Puebla';
      fullHtml += `
        <tr class="cs-row-item${alertCls}" data-id="${servicio.id || ''}" data-bloque="${b.id}" data-semana-iso="${semIsoFila}" data-ciudad="${cdFila}" data-pid="${pidVal}" data-orden="${ordVal}"${detallesAttr}${obsRawAttr}>
          ${renderCeldasFilaServicioHtml(servicio)}
        </tr>
      `;
      globalRowIdx++;
    });

    // Fila con botón discreto para agregar al bloque (sin textos vacíos redundantes)
    fullHtml += `
      <tr class="cs-section-add-tr" data-add-for="${b.id}">
        <td colspan="28">
          <button type="button" class="cs-section-add-btn" onclick="agregarFilaEnBloque('${b.id}')">
            <span>＋</span> Agregar fila en ${b.nombre}
          </button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = fullHtml;

  // Asignar orden secuencial en los atributos de fila del DOM
  const renderedRows = tableBody.querySelectorAll('tr.cs-row-item');
  renderedRows.forEach((r, idx) => {
    r.setAttribute('data-orden', String(idx));
  });

  actualizarSelectorCiudadUI();
  initCheckboxInteractions();
  initRowContextMenu();
  restaurarAnchosColumnas();
  actualizarContadoresFiltros();
  aplicarZoomMatriz(_zoomMatriz, false);
}

/**
 * Actualiza los <datalist> globales de clientes activos (fijos y eventuales) y niñeras
 */
function actualizarDatalistsAutocompletado() {
  let dlClientes = document.getElementById('csListaClientesActivos');
  if (!dlClientes) {
    dlClientes = document.createElement('datalist');
    dlClientes.id = 'csListaClientesActivos';
    document.body.appendChild(dlClientes);
  }

  const clientesFijos = (_cacheClientesCS && _cacheClientesCS.length > 0) ? _cacheClientesCS : _clientesFallbackDefault;
  const clientesActivosFijos = clientesFijos.filter(c => c.activo !== false);
  const clientesEventuales = (_cacheClientesEventualesCS || []).filter(c => c && c.nombre);

  // Combinar sin duplicados por nombre
  const mapaClientes = new Map();
  clientesActivosFijos.forEach(c => {
    if (c.nombre) mapaClientes.set(normalizarTextoCS(c.nombre), { ...c, tipoTag: 'Fijo' });
  });
  clientesEventuales.forEach(c => {
    const key = normalizarTextoCS(c.nombre);
    if (!mapaClientes.has(key)) {
      mapaClientes.set(key, { ...c, tipoTag: 'Eventual' });
    }
  });

  const todosClientes = Array.from(mapaClientes.values());

  dlClientes.innerHTML = todosClientes.map(c => {
    const tel = c.telefono ? ` • 📞 ${c.telefono}` : '';
    const sub = c.email ? ` • ${c.email}` : '';
    const dir = c.ciudad || c.direccion ? ` (${c.ciudad || c.direccion})` : '';
    const tag = c.tipoTag ? ` [${c.tipoTag}]` : '';
    return `<option value="${_csEscapeHTML(c.nombre)}">${_csEscapeHTML(c.nombre)}${tag}${tel}${sub}${dir}</option>`;
  }).join('');

  let dlNannys = document.getElementById('csListaNannys');
  if (!dlNannys) {
    dlNannys = document.createElement('datalist');
    dlNannys.id = 'csListaNannys';
    document.body.appendChild(dlNannys);
  }

  const nannysFuente = (_cacheNannysCS && _cacheNannysCS.length > 0) ? _cacheNannysCS : _nannysFallbackDefault;
  const nannysActivas = nannysFuente.filter(n => n.activo !== false);

  dlNannys.innerHTML = nannysActivas.map(n => {
    const tel = n.telefono ? ` • 📞 ${n.telefono}` : '';
    const cd = n.ciudad ? ` (${n.ciudad})` : '';
    return `<option value="${n.nombre}">${n.nombre}${tel}${cd}</option>`;
  }).join('');
}

/**
 * Inicializa el autocompletado flotante personalizado para clientes y niñeras
 * con resaltado visual claro e interactivo al pasar el puntero (hover)
 */
function initCustomAutocompleteDropdown() {
  let ddEl = document.getElementById('csCustomAutocompleteDropdown');
  if (!ddEl) {
    ddEl = document.createElement('div');
    ddEl.id = 'csCustomAutocompleteDropdown';
    ddEl.className = 'cs-autocomplete-dropdown';
    ddEl.style.display = 'none';
    ddEl.innerHTML = `
      <div class="cs-autocomplete-arrow"></div>
      <ul class="cs-autocomplete-list"></ul>
    `;
    document.body.appendChild(ddEl);
  }

  const listUl = ddEl.querySelector('.cs-autocomplete-list');
  let currentActiveInput = null;
  let activeFilteredItems = [];
  let selectedIndex = -1;
  let _lastRightClickTime = 0;

  function closeDropdown() {
    if (ddEl) ddEl.style.display = 'none';
    currentActiveInput = null;
    activeFilteredItems = [];
    selectedIndex = -1;
  }

  window.cerrarAutocompleteDropdown = closeDropdown;

  function updateHighlight(index) {
    selectedIndex = index;
    const items = listUl.querySelectorAll('.cs-autocomplete-item');
    items.forEach((it, idx) => {
      if (idx === index) {
        it.classList.add('is-selected');
        it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        it.classList.remove('is-selected');
      }
    });
  }

  function selectItem(nombre) {
    if (!currentActiveInput) return;
    const isNanny = currentActiveInput.classList.contains('cs-nanny-input') || currentActiveInput.getAttribute('data-field') === 'nanny_nombre';
    capturarEstadoPrevioAntesDeAccion(isNanny ? 'Seleccionar niñera' : 'Seleccionar cliente');
    currentActiveInput.value = nombre;
    if (isNanny) {
      handleNannyInputChange(currentActiveInput);
      notificarCambioFila(currentActiveInput, true);
    } else {
      handleClienteInputChange(currentActiveInput);
      handleClienteSelectChange(currentActiveInput);
      notificarCambioFila(currentActiveInput, true);
    }
    closeDropdown();
  }

  function renderList(input) {
    if (!input) return;
    currentActiveInput = input;
    const isNanny = input.classList.contains('cs-nanny-input') || input.getAttribute('data-field') === 'nanny_nombre';

    let itemsFuente = [];
    if (isNanny) {
      const fuente = (_cacheNannysCS && _cacheNannysCS.length > 0) ? _cacheNannysCS : _nannysFallbackDefault;
      itemsFuente = (fuente || []).filter(n => n && n.activo !== false && n.nombre);
    } else {
      const fijos = (_cacheClientesCS && _cacheClientesCS.length > 0) ? _cacheClientesCS : _clientesFallbackDefault;
      const fijosActivos = (fijos || []).filter(c => c && c.activo !== false && c.nombre);
      const eventuales = (_cacheClientesEventualesCS || []).filter(c => c && c.nombre);

      // Combinar fijos y eventuales para sugerencias
      const mapa = new Map();
      fijosActivos.forEach(c => {
        if (c.nombre) mapa.set(normalizarTextoCS(c.nombre), { ...c, _tipoBadge: 'Fijo' });
      });
      eventuales.forEach(c => {
        const k = normalizarTextoCS(c.nombre);
        if (!mapa.has(k)) {
          mapa.set(k, { ...c, _tipoBadge: 'Eventual' });
        }
      });
      itemsFuente = Array.from(mapa.values());
    }

    const rawVal = (input.value || '').trim();
    const query = normalizarTextoCS(rawVal);
    const queryDigits = rawVal.replace(/\D/g, '');
    if (query || queryDigits.length >= 3) {
      activeFilteredItems = itemsFuente.filter(it => {
        const nombreCompleto = String(it.nombre || '').trim();
        if (!nombreCompleto) return false;
        const primerNombre = nombreCompleto.split(/\s+/)[0] || '';
        const primerNombreNorm = normalizarTextoCS(primerNombre);
        const nombreCompletoNorm = normalizarTextoCS(nombreCompleto);
        const emailNorm = normalizarTextoCS(it.email || '');
        const telDigits = String(it.telefono || '').replace(/\D/g, '');

        if (query && (primerNombreNorm.startsWith(query) || nombreCompletoNorm.startsWith(query) || nombreCompletoNorm.includes(query) || emailNorm.includes(query))) {
          return true;
        }
        if (queryDigits.length >= 3 && telDigits.includes(queryDigits)) {
          return true;
        }
        return false;
      });
      activeFilteredItems.sort((a, b) => {
        const nomA = normalizarTextoCS(a.nombre || '');
        const nomB = normalizarTextoCS(b.nombre || '');
        return nomA.localeCompare(nomB);
      });
    } else {
      activeFilteredItems = itemsFuente.slice(0, 50);
    }

    if (activeFilteredItems.length === 0) {
      closeDropdown();
      return;
    }

    listUl.innerHTML = activeFilteredItems.map((item, idx) => {
      let sub = '';
      if (isNanny) {
        const tel = item.telefono ? ` • 📞 ${item.telefono}` : '';
        const cd = item.ciudad ? ` (${item.ciudad})` : '';
        sub = `${item.nombre}${tel}${cd}`;
      } else {
        const tel = item.telefono ? ` • 📞 ${item.telefono}` : (item.email ? ` • ✉️ ${item.email}` : '');
        const cd = item.ciudad || item.direccion ? ` (${item.ciudad || item.direccion})` : '';
        sub = `${item.nombre}${tel}${cd}`;
      }
      return `
        <li class="cs-autocomplete-item" data-index="${idx}" data-nombre="${(item.nombre || '').replace(/"/g, '&quot;')}">
          <div class="cs-autocomplete-title">${item.nombre}</div>
          <div class="cs-autocomplete-subtitle">${sub}</div>
        </li>
      `;
    }).join('');

    selectedIndex = -1;

    // Calcular posición flotante exacta
    const rect = input.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < 220 && rect.top > 220;

    ddEl.style.display = 'block';

    if (showAbove) {
      ddEl.classList.add('pos-arriba');
      ddEl.style.top = 'auto';
      ddEl.style.bottom = `${window.innerHeight - rect.top + 8}px`;
    } else {
      ddEl.classList.remove('pos-arriba');
      ddEl.style.bottom = 'auto';
      ddEl.style.top = `${rect.bottom + 8}px`;
    }

    const ddWidth = Math.max(rect.width, 280);
    let left = rect.left;
    if (left + ddWidth > window.innerWidth - 12) {
      left = window.innerWidth - ddWidth - 12;
    }
    if (left < 10) left = 10;
    ddEl.style.left = `${left}px`;
    ddEl.style.width = `${ddWidth}px`;

    const arrow = ddEl.querySelector('.cs-autocomplete-arrow');
    if (arrow) {
      const arrowLeft = Math.max(16, Math.min(rect.left + 24 - left, ddWidth - 24));
      arrow.style.left = `${arrowLeft}px`;
    }
  }

  // Delegación de eventos para clicks en la lista
  if (listUl && !listUl._hasAutocompleteEvents) {
    listUl._hasAutocompleteEvents = true;

    listUl.addEventListener('pointerdown', (e) => {
      const itemEl = e.target.closest('.cs-autocomplete-item');
      if (itemEl) {
        e.preventDefault();
        e.stopPropagation();
        const nombre = itemEl.getAttribute('data-nombre');
        selectItem(nombre);
      }
    });

    listUl.addEventListener('mousemove', (e) => {
      const itemEl = e.target.closest('.cs-autocomplete-item');
      if (itemEl) {
        const idx = parseInt(itemEl.getAttribute('data-index'), 10);
        if (!isNaN(idx) && idx !== selectedIndex) {
          selectedIndex = idx;
          const items = listUl.querySelectorAll('.cs-autocomplete-item');
          items.forEach((it, i) => {
            if (i === idx) it.classList.add('is-selected');
            else it.classList.remove('is-selected');
          });
        }
      }
    });
  }

  // Delegación de eventos en inputs
  if (!document._hasCustomAutocompleteDelegation) {
    document._hasCustomAutocompleteDelegation = true;

    // Detectar clic derecho antes de que focusin o click abran el dropdown
    document.addEventListener('pointerdown', (e) => {
      if (e.button === 2) {
        _lastRightClickTime = Date.now();
        closeDropdown();
        return;
      }
      if (ddEl && ddEl.style.display !== 'none') {
        if (!ddEl.contains(e.target) && e.target !== currentActiveInput) {
          closeDropdown();
        }
      }
    }, true);

    document.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        _lastRightClickTime = Date.now();
        closeDropdown();
      }
    }, true);

    document.addEventListener('contextmenu', (e) => {
      _lastRightClickTime = Date.now();
      closeDropdown();
    }, true);

    document.addEventListener('focusin', (e) => {
      if (Date.now() - _lastRightClickTime < 450) return;
      const input = e.target.closest('.cs-client-input, .cs-nanny-input');
      if (input) {
        renderList(input);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.button === 2 || Date.now() - _lastRightClickTime < 450) return;
      const input = e.target.closest('.cs-client-input, .cs-nanny-input');
      if (input) {
        renderList(input);
      }
    });

    document.addEventListener('input', (e) => {
      const input = e.target.closest('.cs-client-input, .cs-nanny-input');
      if (input) {
        renderList(input);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!currentActiveInput || ddEl.style.display === 'none') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeFilteredItems.length > 0) {
          const nextIdx = (selectedIndex + 1) % activeFilteredItems.length;
          updateHighlight(nextIdx);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeFilteredItems.length > 0) {
          const prevIdx = selectedIndex <= 0 ? activeFilteredItems.length - 1 : selectedIndex - 1;
          updateHighlight(prevIdx);
        }
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < activeFilteredItems.length) {
          e.preventDefault();
          selectItem(activeFilteredItems[selectedIndex].nombre);
        } else if (activeFilteredItems.length === 1) {
          e.preventDefault();
          selectItem(activeFilteredItems[0].nombre);
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    window.addEventListener('scroll', () => {
      if (ddEl && ddEl.style.display !== 'none') closeDropdown();
    }, true);

    window.addEventListener('resize', () => {
      if (ddEl && ddEl.style.display !== 'none') closeDropdown();
    });
  }
}


/**
 * Extrae los datos limpios de una fila HTML para persistir en Supabase
 */
function extraeDatosFila(row, idx = null) {
  if (!row) return null;
  const getVal = (selector) => {
    const el = row.querySelector(selector);
    if (!el) return '';
    if (el.type === 'checkbox') return !!el.checked;
    let v = el.value !== undefined ? el.value : (el.textContent?.trim() || '');
    if (typeof v === 'string' && (v.trim().toLowerCase() === 'undefined' || v.trim().toLowerCase() === 'null')) return '';
    return v;
  };

  const inputObs = row.querySelector('[data-field="observaciones"]');
  let tagAsistEnc = inputObs?.getAttribute('data-asistencia-tag') || row.getAttribute('data-asistencia-tag') || '';
  const nomActual = (getVal('[data-field="nanny_nombre"]') || '').trim();
  if (!tagAsistEnc && nomActual) {
    const backup = row.getAttribute('data-asistencia-backup') ||
      row.querySelector('td.col-nanny')?.getAttribute('data-asistencia-backup') ||
      inputObs?.getAttribute('data-asistencia-backup');
    if (backup) {
      tagAsistEnc = backup;
    }
  }
  const rawTagAsist = tagAsistEnc ? decodeURIComponent(tagAsistEnc) : '';
  const obsRaw = inputObs ? inputObs.value : getVal('[data-field="observaciones"]');
  let obsBase = (typeof limpiarMetadatosObservaciones === 'function')
    ? limpiarMetadatosObservaciones(obsRaw || '')
    : String(obsRaw || '').replace(/<!--[\s\S]*?-->/g, '').replace(/\b(undefined|null)\b/gi, '').trim();
  if (obsBase.trim().toLowerCase() === 'undefined' || obsBase.trim().toLowerCase() === 'null') {
    obsBase = '';
  }
  const obsConAsist = rawTagAsist ? `${rawTagAsist} ${obsBase.trim()}`.trim() : obsBase;
  const coloresFila = extraerColoresDeFilaDom(row);
  const notasFila = extraerNotasDeFilaDom(row);
  let obsConColores = inyectarColoresEnObservaciones(obsConAsist, coloresFila);
  obsConColores = inyectarNotasEnObservaciones(obsConColores, notasFila);

  let rowId = row.getAttribute('data-id');
  if (!rowId) {
    rowId = `srv_${Date.now()}_${idx !== null ? idx : 0}_${Math.random().toString(36).substr(2, 5)}`;
    row.setAttribute('data-id', rowId);
  }

  const semIsoFila = row.getAttribute('data-semana-iso') || _currentSemanaMatrizIso || getMondayISO(new Date());
  const bloqueFila = row.getAttribute('data-bloque') || 'servicios_fijos';

  let rowPid = row.getAttribute('data-pid') || extraerPidDeObservaciones(obsBase);
  if (!rowPid && BLOQUES_PERSISTENTES_FUTURO.includes(bloqueFila)) {
    rowPid = `pid_${Date.now()}_${idx !== null ? idx : 0}_${Math.random().toString(36).substr(2, 6)}`;
    row.setAttribute('data-pid', rowPid);
  }
  if (rowPid) {
    obsConColores = inyectarPidEnObservaciones(obsConColores, rowPid);
  }

  const esNuevoCliente = row.getAttribute('data-nuevo-cliente') === 'true' || esServicioNuevoCliente(obsRaw) || esServicioNuevoCliente(row.getAttribute('data-observaciones-raw'));
  if (esNuevoCliente) {
    obsConColores = inyectarNuevoClienteEnObservaciones(obsConColores, true);
  }

  const attrDetalles = row.getAttribute('data-detalles-servicio') || row.querySelector('.col-zone')?.getAttribute('data-detalles-servicio');
  if (attrDetalles) {
    try {
      const parsedDet = JSON.parse(decodeURIComponent(attrDetalles));
      obsConColores = inyectarDetallesServicioEnObservaciones(obsConColores, parsedDet);
    } catch (e) { }
  } else {
    const existingDet = extraerDetallesServicioDeObservaciones(obsBase);
    if (existingDet) {
      obsConColores = inyectarDetallesServicioEnObservaciones(obsConColores, existingDet);
    }
  }

  // Preservar metadatos de visibilidad y total de saldo autorizados por el admin
  let saldoVisibleTag = '';
  let saldoTotalTag = '';

  const rawObsFuentes = `${obsRaw} ${row.getAttribute('data-observaciones-raw') || ''} ${inputObs?.getAttribute('data-observaciones-raw') || ''}`;
  const matchVis = rawObsFuentes.match(/<!--saldo_visible:(true|false)-->/i);
  const matchTot = rawObsFuentes.match(/<!--saldo_total:(.*?)-->/i);

  if (matchVis && matchVis[0]) saldoVisibleTag = matchVis[0];
  if (matchTot && matchTot[0]) saldoTotalTag = matchTot[0];

  if (saldoVisibleTag) {
    obsConColores = `${saldoVisibleTag} ${obsConColores}`.trim();
  }
  if (saldoTotalTag) {
    obsConColores = `${saldoTotalTag} ${obsConColores}`.trim();
  }

  // Calcular orden determinista exacto preservando su posición fija en la matriz
  let filaOrden = (typeof idx === 'number' && !isNaN(idx)) ? idx : null;
  if (filaOrden === null && row) {
    const tableBody = row.closest('tbody') || document.getElementById('csTableBody');
    if (tableBody) {
      const allRows = Array.from(tableBody.querySelectorAll('tr.cs-row-item'));
      const domIdx = allRows.indexOf(row);
      if (domIdx >= 0) filaOrden = domIdx;
    }
  }
  if (filaOrden === null && row) {
    const attrOrden = row.getAttribute('data-orden');
    if (attrOrden !== null && attrOrden !== '') {
      filaOrden = parseInt(attrOrden, 10);
    }
  }
  if (filaOrden === null || isNaN(filaOrden)) {
    filaOrden = 0;
  }
  if (row && row.setAttribute) {
    row.setAttribute('data-orden', String(filaOrden));
  }

  let evidenciaPayload = null;
  if (rawTagAsist) {
    const m = rawTagAsist.match(/<!--asistencia_nanny:(.*?)-->/);
    if (m && m[1]) {
      try { evidenciaPayload = JSON.parse(m[1]); } catch (e) { }
    }
  }
  if (!evidenciaPayload && rowId && window._cacheAsistenciaServicios && window._cacheAsistenciaServicios[rowId]) {
    const cached = window._cacheAsistenciaServicios[rowId];
    const cachedNom = (cached.nanny_nombre || (cached.dias_confirmados && Object.values(cached.dias_confirmados)[0]?.nanny_nombre) || '').trim().toLowerCase();
    if (nomActual && cachedNom && nomActual.toLowerCase() === cachedNom) {
      evidenciaPayload = cached;
    }
  }

  return {
    id: rowId,
    pid: rowPid || null,
    semana_iso: semIsoFila,
    orden: filaOrden,
    bloque: bloqueFila,
    ciudad: (row && row.getAttribute('data-ciudad')) || _currentCiudadMatriz || 'Puebla',
    lun_inicio: getVal('[data-field="lun_inicio"]'),
    lun_fin: getVal('[data-field="lun_fin"]'),
    mar_inicio: getVal('[data-field="mar_inicio"]'),
    mar_fin: getVal('[data-field="mar_fin"]'),
    mie_inicio: getVal('[data-field="mie_inicio"]'),
    mie_fin: getVal('[data-field="mie_fin"]'),
    jue_inicio: getVal('[data-field="jue_inicio"]'),
    jue_fin: getVal('[data-field="jue_fin"]'),
    vie_inicio: getVal('[data-field="vie_inicio"]'),
    vie_fin: getVal('[data-field="vie_fin"]'),
    sab_inicio: getVal('[data-field="sab_inicio"]'),
    sab_fin: getVal('[data-field="sab_fin"]'),
    dom_inicio: getVal('[data-field="dom_inicio"]'),
    dom_fin: getVal('[data-field="dom_fin"]'),
    tipo_servicio: getVal('[data-field="tipo_servicio"]'),
    cliente_email: getVal('[data-field="cliente_email"]'),
    cliente_nombre: getVal('[data-field="cliente_nombre"]'),
    ok_cliente: getVal('[data-field="ok_cliente"]'),
    zona: getVal('[data-field="zona"]'),
    nanny_nombre: getVal('[data-field="nanny_nombre"]'),
    ok_nanny: getVal('[data-field="ok_nanny"]'),
    tarifa_cliente: getVal('[data-field="tarifa_cliente"]'),
    tarifa_nanny: getVal('[data-field="tarifa_nanny"]'),
    saldo_cliente: getVal('[data-field="saldo_cliente"]'),
    pago_nanny: getVal('[data-field="pago_nanny"]'),
    alerta: getVal('[data-field="alerta"]'),
    observaciones: obsConColores,
    asistencia_nanny: evidenciaPayload || {},
    colores_celdas: coloresFila,
    notas_celdas: notasFila,
    actualizado_en: new Date().toISOString()
  };
}

// Variables globales que detectan dinámicamente qué columnas existen físicamente en Supabase
let _supaHasBloqueColumn = null;
let _supaHasSaldoColumn = null;
let _supaHasPagoColumn = null;
let _supaHasAsistenciaColumn = null;
let _supaHasCiudadColumn = null;

/**
 * Prepara el objeto de servicio para guardarlo en Supabase,
 * garantizando compatibilidad 100% inmediata aunque columnas como 'bloque', 'saldo_cliente' o 'ciudad' aún no existan físicamente en el SQL.
 */
function prepararServicioParaSupabase(s) {
  if (!s) return s;
  const copia = { ...s };

  // 'colores_celdas', 'notas_celdas' y 'pid' no son columnas físicas en la tabla control_servicios de Supabase.
  // Van codificados dentro del campo 'observaciones' para compatibilidad total.
  delete copia.colores_celdas;
  delete copia.notas_celdas;
  delete copia.pid;

  let obs = copia.observaciones || '';

  // 1. Compatibilidad para columna 'bloque'
  if (_supaHasBloqueColumn === false) {
    const bloqueVal = copia.bloque || 'servicios_fijos';
    delete copia.bloque;
    obs = obs.replace(/<!--bloque:.*?-->/g, '').trim();
    if (bloqueVal !== 'servicios_fijos') {
      obs = '<!--bloque:' + bloqueVal + '-->' + obs;
    }
  }

  // 2. Compatibilidad para columna 'saldo_cliente'
  if (_supaHasSaldoColumn === false) {
    const saldoVal = (copia.saldo_cliente !== undefined && copia.saldo_cliente !== null) ? String(copia.saldo_cliente).trim() : '';
    delete copia.saldo_cliente;
    obs = obs.replace(/<!--saldo_cliente:.*?-->/g, '').trim();
    if (saldoVal !== '') {
      obs = '<!--saldo_cliente:' + saldoVal + '-->' + obs;
    }
  }

  // 3. Compatibilidad para columna 'pago_nanny'
  if (_supaHasPagoColumn === false) {
    const pagoVal = (copia.pago_nanny !== undefined && copia.pago_nanny !== null) ? String(copia.pago_nanny).trim() : '';
    delete copia.pago_nanny;
    obs = obs.replace(/<!--pago_nanny:.*?-->/g, '').trim();
    if (pagoVal !== '') {
      obs = '<!--pago_nanny:' + pagoVal + '-->' + obs;
    }
  }

  // 4. Compatibilidad para columna 'asistencia_nanny'
  if (_supaHasAsistenciaColumn === false) {
    delete copia.asistencia_nanny;
  }

  // 5. Compatibilidad para columna 'ciudad'
  const ciudadVal = copia.ciudad || _currentCiudadMatriz || 'Puebla';
  if (_supaHasCiudadColumn === false) {
    delete copia.ciudad;
    obs = obs.replace(/<!--ciudad:.*?-->/g, '').trim();
    if (ciudadVal && ciudadVal !== 'Puebla') {
      obs = '<!--ciudad:' + ciudadVal + '-->' + obs;
    }
  } else {
    copia.ciudad = ciudadVal;
  }

  copia.observaciones = obs;
  return copia;
}

/**
 * Decodifica metadatos embebidos en 'observaciones' cuando una fila viene de Supabase
 */
function decodificarServicioSupabase(s) {
  if (!s) return s;
  const decoded = { ...s };
  decoded.observaciones_raw = s.observaciones || '';

  if (s.observaciones && s.observaciones.includes('<!--detalles_servicio:')) {
    decoded.detalles_servicio = extraerDetallesServicioDeObservaciones(s.observaciones);
  }

  if (!decoded.bloque && decoded.observaciones && decoded.observaciones.includes('<!--bloque:')) {
    const m = decoded.observaciones.match(/<!--bloque:(.*?)-->/);
    if (m) {
      decoded.bloque = m[1];
      decoded.observaciones = decoded.observaciones.replace(/<!--bloque:.*?-->/g, '').trim();
    }
  }
  if ((decoded.saldo_cliente === undefined || decoded.saldo_cliente === null || decoded.saldo_cliente === '') && decoded.observaciones && decoded.observaciones.includes('<!--saldo_cliente:')) {
    const m = decoded.observaciones.match(/<!--saldo_cliente:(.*?)-->/);
    if (m) {
      decoded.saldo_cliente = m[1];
      decoded.observaciones = decoded.observaciones.replace(/<!--saldo_cliente:.*?-->/g, '').trim();
    }
  }
  if ((decoded.pago_nanny === undefined || decoded.pago_nanny === null || decoded.pago_nanny === '') && decoded.observaciones && decoded.observaciones.includes('<!--pago_nanny:')) {
    const m = decoded.observaciones.match(/<!--pago_nanny:(.*?)-->/);
    if (m) {
      decoded.pago_nanny = m[1];
      decoded.observaciones = decoded.observaciones.replace(/<!--pago_nanny:.*?-->/g, '').trim();
    }
  }
  if (!decoded.ciudad && decoded.observaciones && decoded.observaciones.includes('<!--ciudad:')) {
    const m = decoded.observaciones.match(/<!--ciudad:(.*?)-->/);
    if (m) {
      decoded.ciudad = m[1];
      decoded.observaciones = decoded.observaciones.replace(/<!--ciudad:.*?-->/g, '').trim();
    }
  }
  if (!decoded.ciudad) {
    decoded.ciudad = 'Puebla';
  }
  if (decoded.observaciones && decoded.observaciones.includes('<!--colores:')) {
    const { colores, obsLimpia } = extraerColoresDeObservaciones(decoded.observaciones);
    decoded.colores_celdas = colores;
    decoded.observaciones = obsLimpia;
  }
  if (decoded.observaciones && decoded.observaciones.includes('<!--notas_celdas:')) {
    const { notas, obsLimpia } = extraerNotasDeObservaciones(decoded.observaciones);
    decoded.notas_celdas = notas;
    decoded.observaciones = obsLimpia;
  }
  if (decoded.observaciones && decoded.observaciones.includes('<!--pid:')) {
    decoded.pid = extraerPidDeObservaciones(decoded.observaciones);
  } else if (BLOQUES_PERSISTENTES_FUTURO.includes(decoded.bloque)) {
    decoded.pid = `pid_${decoded.id ? String(decoded.id).replace(/^srv_/, '') : Math.random().toString(36).substr(2, 6)}`;
  }
  if (decoded.observaciones && /<!--saldo_visible:(true|false)-->/i.test(decoded.observaciones)) {
    const mVis = decoded.observaciones.match(/<!--saldo_visible:(true|false)-->/i);
    if (mVis) {
      decoded.saldo_visible = mVis[1].toLowerCase() === 'true';
    }
  }
  decoded.observaciones = (typeof limpiarMetadatosObservaciones === 'function')
    ? limpiarMetadatosObservaciones(decoded.observaciones || '')
    : (decoded.observaciones || '').replace(/<!--[\s\S]*?-->/g, '').replace(/\b(undefined|null)\b/gi, '').trim();
  if (decoded.observaciones.trim().toLowerCase() === 'undefined' || decoded.observaciones.trim().toLowerCase() === 'null') {
    decoded.observaciones = '';
  }

  return decoded;
}

/**
 * Ejecuta upsert masivo o individual en la tabla control_servicios con detección automática
 * y adaptación inmediata ante esquemas de base de datos que aún no tengan ciertas columnas físicas.
 */
async function ejecutarUpsertControlServicios(client, items) {
  if (!client) return { error: new Error('Cliente Supabase no disponible') };
  const arr = Array.isArray(items) ? items : [items];
  if (arr.length === 0) return { data: [], error: null };

  let payloads = arr.map(s => prepararServicioParaSupabase(s));
  let res = await client.from('control_servicios').upsert(payloads, { onConflict: 'id' });

  let retries = 0;
  while (res.error && retries < 5) {
    const msg = (res.error.message || '').toLowerCase();
    let schemaAdjusted = false;

    if (msg.includes('saldo_cliente') && _supaHasSaldoColumn !== false) {
      _supaHasSaldoColumn = false;
      schemaAdjusted = true;
    }
    if (msg.includes('pago_nanny') && _supaHasPagoColumn !== false) {
      _supaHasPagoColumn = false;
      schemaAdjusted = true;
    }
    if (msg.includes('bloque') && _supaHasBloqueColumn !== false) {
      _supaHasBloqueColumn = false;
      schemaAdjusted = true;
    }
    if (msg.includes('asistencia_nanny') && _supaHasAsistenciaColumn !== false) {
      _supaHasAsistenciaColumn = false;
      schemaAdjusted = true;
    }
    if (msg.includes('ciudad') && _supaHasCiudadColumn !== false) {
      _supaHasCiudadColumn = false;
      schemaAdjusted = true;
    }

    if (!schemaAdjusted) break;

    payloads = arr.map(s => prepararServicioParaSupabase(s));
    res = await client.from('control_servicios').upsert(payloads, { onConflict: 'id' });
    retries++;
  }

  if (!res.error) {
    if (_supaHasBloqueColumn === null) _supaHasBloqueColumn = true;
    if (_supaHasSaldoColumn === null) _supaHasSaldoColumn = true;
    if (_supaHasPagoColumn === null) _supaHasPagoColumn = true;
    if (_supaHasCiudadColumn === null) _supaHasCiudadColumn = true;
  }
  return res;
}

/**
 * Propaga los cambios de una fila de bloque persistente hacia todas las semanas posteriores existentes
 */
async function propagarFilaASemanasPosteriores(servicio, client) {
  if (!client || !servicio || !servicio.pid || !servicio.semana_iso) return;
  if (servicio.semana_iso === '__PLANTILLA_BASE__') return;
  if (!BLOQUES_PERSISTENTES_FUTURO.includes(servicio.bloque)) return;
  if (!servicioTieneDatos(servicio)) return;

  try {
    const { data: posteriorRecords, error: errQuery } = await client
      .from('control_servicios')
      .select('id, semana_iso, orden, observaciones, bloque, cliente_nombre, ciudad')
      .gt('semana_iso', servicio.semana_iso);

    if (errQuery || !Array.isArray(posteriorRecords) || posteriorRecords.length === 0) return;

    const sCiudadNorm = normalizarTextoCS(servicio.ciudad || _currentCiudadMatriz || 'Puebla');
    const distinctPosteriorWeeks = [...new Set(posteriorRecords.map(r => r.semana_iso))].sort();

    for (const postSemana of distinctPosteriorWeeks) {
      const recordsSemana = posteriorRecords.filter(r => r.semana_iso === postSemana);
      const matchRow = recordsSemana.find(r => {
        const rCiudadNorm = normalizarTextoCS(r.ciudad || 'Puebla');
        if (rCiudadNorm !== sCiudadNorm) return false;
        const rPid = extraerPidDeObservaciones(r.observaciones);
        if (rPid && servicio.pid && rPid === servicio.pid) return true;
        if (servicio.cliente_nombre && r.bloque === servicio.bloque && r.cliente_nombre && r.cliente_nombre.trim().toLowerCase() === servicio.cliente_nombre.trim().toLowerCase()) return true;
        return false;
      });

      const clone = { ...servicio };
      delete clone.colores_celdas;
      clone.ciudad = servicio.ciudad || _currentCiudadMatriz || 'Puebla';

      if (matchRow) {
        clone.id = matchRow.id;
        clone.semana_iso = postSemana;
        clone.orden = matchRow.orden !== undefined ? matchRow.orden : servicio.orden;
      } else {
        // ID determinista para esa semana y PID: previene duplicados ante múltiples llamadas
        clone.id = `srv_${servicio.pid}_${postSemana.replace(/-/g, '')}`;
        clone.semana_iso = postSemana;
      }

      await ejecutarUpsertControlServicios(client, clone);

      // Sincronizar respaldo en localStorage si existe para esa semana
      try {
        const localKey = 'nyp_admin_servicios_matriz_' + postSemana;
        const localStr = localStorage.getItem(localKey);
        if (localStr) {
          let list = JSON.parse(localStr);
          if (Array.isArray(list)) {
            const idx = list.findIndex(r => r.id === clone.id || (r.pid && r.pid === servicio.pid) || extraerPidDeObservaciones(r.observaciones) === servicio.pid);
            if (idx >= 0) {
              list[idx] = clone;
            } else {
              list.push(clone);
            }
            localStorage.setItem(localKey, JSON.stringify(list));
          }
        }
      } catch (e) { }
    }
  } catch (err) {
    console.warn("⚠️ Error propagando fila a semanas posteriores:", err);
  }
}

/**
 * Elimina las réplicas de una fila persistente en todas las semanas posteriores existentes
 */
async function eliminarFilaDeSemanasPosteriores(pid, bloque, clienteNombre, semanaIso, client, ciudad = null) {
  if (!client || !semanaIso) return;
  try {
    const { data: rowsPost, error } = await client
      .from('control_servicios')
      .select('id, semana_iso, observaciones, bloque, cliente_nombre, ciudad')
      .gt('semana_iso', semanaIso);

    if (error) {
      console.warn("⚠️ Error consultando semanas posteriores:", error.message);
      return;
    }
    if (!Array.isArray(rowsPost) || rowsPost.length === 0) return;

    const targetCiudadNorm = normalizarTextoCS(ciudad || _currentCiudadMatriz || 'Puebla');
    const cliNorm = (clienteNombre || '').trim().toLowerCase();
    const idsToDelete = rowsPost
      .filter(r => {
        const rCiudadNorm = normalizarTextoCS(r.ciudad || 'Puebla');
        if (rCiudadNorm !== targetCiudadNorm) return false;
        const rPid = r.pid || extraerPidDeObservaciones(r.observaciones);
        if (pid && rPid && rPid === pid) return true;
        const rBloque = r.bloque || (r.observaciones && r.observaciones.match(/<!--bloque:(.*?)-->/) ? r.observaciones.match(/<!--bloque:(.*?)-->/)[1] : '');
        const rNom = (r.cliente_nombre || '').trim().toLowerCase();
        if (cliNorm && rNom && cliNorm === rNom && (BLOQUES_PERSISTENTES_FUTURO.includes(rBloque) || (bloque && rBloque === bloque))) return true;
        return false;
      })
      .map(r => r.id);

    if (idsToDelete.length > 0) {
      await client
        .from('control_servicios')
        .delete()
        .in('id', idsToDelete);
      console.log(`🗑️ [Persistencia] Eliminadas ${idsToDelete.length} réplicas en semanas posteriores`);

      rowsPost.forEach(r => {
        if (idsToDelete.includes(r.id)) {
          try {
            const key = 'nyp_admin_servicios_matriz_' + r.semana_iso;
            const str = localStorage.getItem(key);
            if (str) {
              const list = JSON.parse(str);
              if (Array.isArray(list)) {
                const filtered = list.filter(item => item.id !== r.id);
                localStorage.setItem(key, JSON.stringify(filtered));
              }
            }
          } catch (e) { }
        }
      });
    }
  } catch (err) {
    console.warn("⚠️ Error eliminando de semanas posteriores:", err);
  }
}

/**
 * Persiste una fila individual en la base de datos Supabase con reintento automático
 */
async function guardarFilaServicioSupabase(row) {
  if (!row) return;
  const servicio = extraeDatosFila(row);
  if (!servicio) return;

  const isPlantillaBase = (servicio.semana_iso === '__PLANTILLA_BASE__') ||
    (row.closest('#csSbTableBody') !== null) ||
    (row.getAttribute('data-semana-iso') === '__PLANTILLA_BASE__');

  if (isPlantillaBase) {
    servicio.semana_iso = '__PLANTILLA_BASE__';
    servicio.bloque = 'servicios_fijos';
    if (!servicio.ciudad) servicio.ciudad = _currentCiudadMatriz || 'Puebla';
  } else {
    guardarMatrizLocal();
  }

  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client) return;

  try {
    const { error } = await ejecutarUpsertControlServicios(client, servicio);
    if (error) {
      console.warn("⚠️ [Supabase control_servicios] Error al guardar fila:", error.message);
    } else {
      console.log("⚡ [Supabase control_servicios] Fila guardada en tiempo real:", servicio.id);
    }

    if (isPlantillaBase) {
      // Actualizar caché local de plantilla base
      try {
        let base = JSON.parse(localStorage.getItem('nyp_servicios_base_plantilla') || '[]');
        if (!Array.isArray(base)) base = [];
        const idx = base.findIndex(b => b.id === servicio.id);
        if (idx >= 0) {
          base[idx] = servicio;
        } else {
          base.push(servicio);
        }
        localStorage.setItem('nyp_servicios_base_plantilla', JSON.stringify(base));
      } catch (e) { }

      // ⚡ Notificación y Sincronización en tiempo real multi-dispositivo para Servicios Base
      emitirCambioMatrizRealtime(client, {
        servicio_id: servicio.id,
        servicio: servicio,
        semana_iso: '__PLANTILLA_BASE__'
      });
      return;
    }

    // ⚡ Notificación y Sincronización en tiempo real multi-dispositivo (BroadcastChannel, Supabase Realtime Broadcast y LocalStorage)
    emitirCambioMatrizRealtime(client, {
      servicio_id: servicio.id,
      servicio: servicio,
      semana_iso: servicio.semana_iso
    });

    // Si pertenece a un bloque persistente y tiene datos, propagar a semanas posteriores; si no, eliminar réplicas
    if (BLOQUES_PERSISTENTES_FUTURO.includes(servicio.bloque) && servicio.pid && servicioTieneDatos(servicio)) {
      await propagarFilaASemanasPosteriores(servicio, client);
    } else if (servicio.pid && (!BLOQUES_PERSISTENTES_FUTURO.includes(servicio.bloque) || !servicioTieneDatos(servicio))) {
      await eliminarFilaDeSemanasPosteriores(servicio.pid, servicio.bloque, servicio.cliente_nombre, servicio.semana_iso, client);
    }

    // Auto-registrar o actualizar cliente eventual si aplica (bloques temporales y eventuales)
    if (servicio.bloque === 'servicios_temporales' || servicio.bloque === 'servicios_eventuales') {
      let det = null;
      const attrDet = row.getAttribute('data-detalles-servicio');
      if (attrDet) {
        try { det = JSON.parse(decodeURIComponent(attrDet)); } catch (e) { }
      }
      if (!det) {
        det = typeof extraerDetallesServicioDeObservaciones === 'function' ? extraerDetallesServicioDeObservaciones(servicio.observaciones) : null;
      }
      if (!det) {
        det = {};
      }
      if (!det.direccion && servicio.zona) {
        det.direccion = servicio.zona;
      }
      if (typeof registrarOActualizarClienteEventual === 'function') {
        registrarOActualizarClienteEventual(servicio, det);
      }
    }
  } catch (err) {
    console.warn("⚠️ Error de red al guardar en Supabase:", err);
  }
}

/**
 * Despacha el guardado hacia Supabase con debounce inteligente
 */
function notificarCambioFila(elementOrRow, immediate = false) {
  const row = (elementOrRow && elementOrRow.closest) ? elementOrRow.closest('tr') : elementOrRow;
  if (!row) return;

  guardarMatrizLocal();
  actualizarContadoresSecciones();

  if (immediate) {
    if (_matrizSaveTimeout) clearTimeout(_matrizSaveTimeout);
    guardarFilaServicioSupabase(row);
  } else {
    if (_matrizSaveTimeout) clearTimeout(_matrizSaveTimeout);
    _matrizSaveTimeout = setTimeout(() => {
      guardarFilaServicioSupabase(row);
    }, 350);
  }
}

/**
 * Inserta una fila de servicio en una posición específica y bloque correspondiente,
 * y sincroniza el nuevo orden completo de la matriz con Supabase.
 * @param {HTMLElement|null} targetRow - Elemento <tr> de referencia
 * @param {'above'|'below'|'bottom'} posicion - Posición de inserción ('above' = arriba, 'below' = abajo, 'bottom' = final)
 * @param {Object|null} [datosClonados] - Opcional, datos para duplicar la fila
 * @param {string|null} [bloqueDefault] - Bloque objetivo si se agrega directamente a una sección
 */
async function insertarFilaServicioEn(targetRow = null, posicion = 'below', datosClonados = null, bloqueDefault = null) {
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return null;

  capturarEstadoPrevioAntesDeAccion(datosClonados ? 'Duplicar fila' : 'Insertar fila');

  const newId = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const semanaIso = _currentSemanaMatrizIso || getMondayISO(new Date());

  // Determinar a qué bloque pertenece
  let blockId = bloqueDefault || 'servicios_fijos';
  if (targetRow) {
    if (targetRow.getAttribute('data-bloque')) {
      blockId = targetRow.getAttribute('data-bloque');
    } else if (targetRow.getAttribute('data-add-for')) {
      blockId = targetRow.getAttribute('data-add-for');
    } else if (targetRow.getAttribute('data-block-id')) {
      blockId = targetRow.getAttribute('data-block-id');
    } else {
      let prev = targetRow.previousElementSibling;
      while (prev) {
        if (prev.classList.contains('cs-section-header-tr')) {
          blockId = prev.getAttribute('data-block-id') || 'servicios_fijos';
          break;
        }
        prev = prev.previousElementSibling;
      }
    }
  }

  let nuevoServicio;

  if (datosClonados) {
    const clonPid = BLOQUES_PERSISTENTES_FUTURO.includes(blockId)
      ? `pid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      : (datosClonados.pid || null);
    let obsConPid = datosClonados.observaciones || '';
    if (clonPid) {
      obsConPid = inyectarPidEnObservaciones(obsConPid, clonPid);
    }
    nuevoServicio = {
      id: newId,
      pid: clonPid,
      semana_iso: semanaIso,
      orden: 0,
      bloque: blockId,
      ciudad: (datosClonados && datosClonados.ciudad) || _currentCiudadMatriz || 'Puebla',
      lun_inicio: datosClonados.lun_inicio || '',
      lun_fin: datosClonados.lun_fin || '',
      mar_inicio: datosClonados.mar_inicio || '',
      mar_fin: datosClonados.mar_fin || '',
      mie_inicio: datosClonados.mie_inicio || '',
      mie_fin: datosClonados.mie_fin || '',
      jue_inicio: datosClonados.jue_inicio || '',
      jue_fin: datosClonados.jue_fin || '',
      vie_inicio: datosClonados.vie_inicio || '',
      vie_fin: datosClonados.vie_fin || '',
      sab_inicio: datosClonados.sab_inicio || '',
      sab_fin: datosClonados.sab_fin || '',
      dom_inicio: datosClonados.dom_inicio || '',
      dom_fin: datosClonados.dom_fin || '',
      tipo_servicio: datosClonados.tipo_servicio || '',
      cliente_email: datosClonados.cliente_email || '',
      cliente_nombre: datosClonados.cliente_nombre || '',
      ok_cliente: false,
      zona: datosClonados.zona || '',
      nanny_nombre: datosClonados.nanny_nombre || '',
      ok_nanny: false,
      tarifa_cliente: datosClonados.tarifa_cliente || '',
      tarifa_nanny: datosClonados.tarifa_nanny || '',
      saldo_cliente: datosClonados.saldo_cliente || '',
      pago_nanny: datosClonados.pago_nanny || '',
      alerta: datosClonados.alerta || '',
      observaciones: obsConPid,
      alert_class: datosClonados.alert_class || ''
    };
  } else {
    const nuevoPid = BLOQUES_PERSISTENTES_FUTURO.includes(blockId)
      ? `pid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      : null;
    let obsBase = '';
    if (nuevoPid) {
      obsBase = inyectarPidEnObservaciones(obsBase, nuevoPid);
    }
    nuevoServicio = {
      id: newId,
      pid: nuevoPid,
      semana_iso: semanaIso,
      orden: 0,
      bloque: blockId,
      ciudad: _currentCiudadMatriz || 'Puebla',
      horarios: {
        lun_inicio: '', lun_fin: '',
        mar_inicio: '', mar_fin: '',
        mie_inicio: '', mie_fin: '',
        jue_inicio: '', jue_fin: '',
        vie_inicio: '', vie_fin: '',
        sab_inicio: '', sab_fin: '',
        dom_inicio: '', dom_fin: ''
      },
      tipo_servicio: '',
      cliente_email: '',
      cliente_nombre: '',
      ok_cliente: false,
      zona: '',
      nanny_nombre: '',
      ok_nanny: false,
      tarifa_cliente: '',
      tarifa_nanny: '',
      saldo_cliente: '',
      pago_nanny: '',
      alerta: '',
      observaciones: obsBase,
      alert_class: ''
    };
  }

  const tr = document.createElement('tr');
  const alertCls = nuevoServicio.alert_class ? ` ${nuevoServicio.alert_class}` : (nuevoServicio.alerta ? ' has-alert-active' : '');
  tr.className = `cs-row-item${alertCls}`;
  tr.setAttribute('data-id', nuevoServicio.id);
  tr.setAttribute('data-bloque', blockId);
  tr.setAttribute('data-semana-iso', semanaIso);
  tr.setAttribute('data-ciudad', nuevoServicio.ciudad);
  if (nuevoServicio.pid) {
    tr.setAttribute('data-pid', nuevoServicio.pid);
  }
  tr.innerHTML = renderCeldasFilaServicioHtml(nuevoServicio);

  if (targetRow && targetRow.isConnected) {
    if (posicion === 'above') {
      targetRow.parentNode.insertBefore(tr, targetRow);
    } else {
      if (targetRow.nextElementSibling) {
        targetRow.parentNode.insertBefore(tr, targetRow.nextElementSibling);
      } else {
        tableBody.appendChild(tr);
      }
    }
  } else {
    const targetAddTr = tableBody.querySelector(`.cs-section-add-tr[data-add-for="${blockId}"]`);
    if (targetAddTr) {
      tableBody.insertBefore(tr, targetAddTr);
    } else {
      tableBody.appendChild(tr);
    }
  }

  // Ocultar mensaje de bloque vacío
  const emptyRow = tableBody.querySelector(`tr.cs-section-empty-row[data-empty-for="${blockId}"]`);
  if (emptyRow) emptyRow.style.display = 'none';

  // Animación de resaltado suave al insertar
  tr.style.transition = 'background-color 0.8s ease, transform 0.25s ease';
  tr.style.backgroundColor = 'rgba(232, 76, 154, 0.22)';
  setTimeout(() => {
    tr.style.backgroundColor = '';
  }, 1000);

  const clientInput = tr.querySelector('[data-field="cliente_nombre"]');
  if (clientInput) {
    clientInput.focus();
  }

  actualizarContadoresSecciones();
  initCheckboxInteractions();
  restaurarAnchosColumnas();
  actualizarContadoresFiltros();

  await guardarMatrizSupabase();
  return tr;
}

/**
 * Agrega una nueva fila dentro de un bloque específico
 */
async function agregarFilaEnBloque(bloqueId = 'servicios_fijos') {
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return null;

  const targetAddTr = tableBody.querySelector(`.cs-section-add-tr[data-add-for="${bloqueId}"]`);
  return await insertarFilaServicioEn(targetAddTr, 'above', null, bloqueId);
}

/**
 * Agrega una nueva fila de servicio (por defecto en Servicios Fijos)
 */
async function agregarFilaServicio() {
  return await agregarFilaEnBloque('servicios_fijos');
}

/**
 * Duplica los datos de una fila existente y la inserta inmediatamente abajo
 */
async function duplicarFilaServicio(row) {
  if (!row) return;
  const datos = extraeDatosFila(row);
  if (!datos) return;

  await insertarFilaServicioEn(row, 'below', datos);

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Fila duplicada',
      icon: 'success',
      timer: 800,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }
}

/**
 * Actualiza el estado de las filas informativas vacías en cada bloque
 */
function actualizarFilasVaciasSecciones() {
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  BLOQUES_SERVICIOS.forEach(b => {
    const rows = tableBody.querySelectorAll(`tr.cs-row-item[data-bloque="${b.id}"]`);
    const emptyRow = tableBody.querySelector(`tr.cs-section-empty-row[data-empty-for="${b.id}"]`);
    if (emptyRow) {
      emptyRow.style.display = rows.length === 0 ? '' : 'none';
    }
  });
}

/**
 * Determina si un objeto de datos de servicio contiene información real (no está vacío)
 */
function servicioTieneDatos(s) {
  if (!s) return false;
  const textoValido = (v) => typeof v === "string" && v.trim().length > 0 && v.trim() !== "-" && v.trim() !== "--:--";
  if (textoValido(s.cliente_nombre)) return true;
  if (textoValido(s.nanny_nombre)) return true;
  if (textoValido(s.tipo_servicio)) return true;
  if (textoValido(s.zona)) return true;
  if (textoValido(s.cliente_email)) return true;
  if (textoValido(s.tarifa_cliente)) return true;
  if (textoValido(s.tarifa_nanny)) return true;
  if (textoValido(s.saldo_cliente)) return true;
  if (textoValido(s.pago_nanny)) return true;
  if (textoValido(s.alerta)) return true;
  if (s.colores_celdas && Object.keys(s.colores_celdas).length > 0) return true;
  if (s.observaciones) {
    const obsLimpia = (typeof limpiarMetadatosObservaciones === 'function')
      ? limpiarMetadatosObservaciones(s.observaciones)
      : String(s.observaciones).replace(/<!--.*?-->/g, '').trim();
    if (textoValido(obsLimpia)) return true;
  }
  if (s.ok_cliente || s.ok_nanny) return true;
  const dias = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
  for (const d of dias) {
    const ini = s[d + "_inicio"] || (s.horarios && s.horarios[d + "_inicio"]);
    const fin = s[d + "_fin"] || (s.horarios && s.horarios[d + "_fin"]);
    if (textoValido(ini) || textoValido(fin)) return true;
  }
  return false;
}

/**
 * Determina si una fila <tr> de la tabla contiene información ingresada por el usuario
 */
function filaTieneDatos(row) {
  if (!row) return false;
  const textoValido = (v) => typeof v === "string" && v.trim().length > 0 && v.trim() !== "-" && v.trim() !== "--:--";
  const getFieldVal = (field) => {
    const el = row.querySelector(`[data-field="${field}"]`);
    return el ? (el.value !== undefined ? el.value : el.textContent) : "";
  };
  if (textoValido(getFieldVal("cliente_nombre"))) return true;
  if (textoValido(getFieldVal("nanny_nombre"))) return true;
  if (textoValido(getFieldVal("tipo_servicio"))) return true;
  if (textoValido(getFieldVal("zona"))) return true;
  if (textoValido(getFieldVal("cliente_email"))) return true;
  if (textoValido(getFieldVal("tarifa_cliente"))) return true;
  if (textoValido(getFieldVal("tarifa_nanny"))) return true;
  if (textoValido(getFieldVal("saldo_cliente"))) return true;
  if (textoValido(getFieldVal("pago_nanny"))) return true;
  if (textoValido(getFieldVal("alerta"))) return true;
  if (row.querySelector('td[data-custom-bg], td[data-custom-color]')) return true;
  const obs = getFieldVal("observaciones");
  if (obs) {
    const obsLimpia = (typeof limpiarMetadatosObservaciones === 'function')
      ? limpiarMetadatosObservaciones(obs)
      : String(obs).replace(/<!--.*?-->/g, '').trim();
    if (textoValido(obsLimpia)) return true;
  }
  const okCli = row.querySelector('[data-field="ok_cliente"]');
  if (okCli && okCli.checked) return true;
  const okNan = row.querySelector('[data-field="ok_nanny"]');
  if (okNan && okNan.checked) return true;
  const dias = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
  for (const d of dias) {
    if (textoValido(getFieldVal(d + "_inicio")) || textoValido(getFieldVal(d + "_fin")))
      return true;
  }
  return false;
}

/**
 * Actualiza el contador numérico en la insignia de cada sección (únicamente filas con datos)
 */
function actualizarContadoresSecciones() {
  const tableBody = document.getElementById("csTableBody");
  if (!tableBody) return;
  BLOQUES_SERVICIOS.forEach(b => {
    const rows = tableBody.querySelectorAll(`tr.cs-row-item[data-bloque="${b.id}"]`);
    let countConDatos = 0;
    rows.forEach(r => {
      if (filaTieneDatos(r)) countConDatos++;
    });
    const badge = document.getElementById(`csCountSec_${b.id}`);
    if (badge) {
      badge.textContent = countConDatos;
    }
  });
}

/**
 * ==========================================================================
 * MOTOR DE DRAG & DROP PARA FILAS DE LA MATRIZ (CON GRAN ANIMACIÓN)
 * Permite reordenar filas o moverlas entre los 7 bloques con retroalimentación visual
 * ==========================================================================
 */
function iniciarArrastreFila(btn, event) {
  if (event.button !== undefined && event.button !== 0) return;

  const row = btn.closest('tr.cs-row-item');
  if (!row) return;

  event.preventDefault();

  const startX = event.clientX;
  const startY = event.clientY;
  let isDragging = false;
  let ghost = null;
  let dropTarget = null;
  let dropPos = 'after';

  function limpiarIndicadores() {
    document.querySelectorAll('.cs-drop-indicator-top, .cs-drop-indicator-bottom, .cs-section-drag-over').forEach(el => {
      el.classList.remove('cs-drop-indicator-top', 'cs-drop-indicator-bottom', 'cs-section-drag-over');
    });
  }

  function onPointerMove(e) {
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);

    if (!isDragging && dist > 4) {
      isDragging = true;
      row.classList.add('cs-row-dragging');

      const rect = row.getBoundingClientRect();
      ghost = document.createElement('div');
      ghost.className = 'cs-drag-ghost';
      ghost.style.width = `${Math.min(rect.width, 580)}px`;
      ghost.style.height = `${Math.max(rect.height, 32)}px`;
      ghost.style.left = `${e.clientX - 90}px`;
      ghost.style.top = `${e.clientY - 16}px`;

      const cli = row.querySelector('[data-field="cliente_nombre"]')?.value || 'Servicio';
      const svc = row.querySelector('[data-field="tipo_servicio"]')?.value || '';
      const nanny = row.querySelector('[data-field="nanny_nombre"]')?.value || '';

      ghost.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%; padding:0 14px; font-family:'Inter',sans-serif; font-size:12px; font-weight:600; color:#1e293b;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px; color:#db2777;">⋮</span>
            <strong style="color:#be185d;">${cli}</strong>
            ${svc ? `<span style="font-size:10px; color:#475569; background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${svc}</span>` : ''}
          </div>
          <span style="font-size:11px; color:#64748b;">${nanny ? '👩‍👧 ' + nanny : ''}</span>
        </div>
      `;
      document.body.appendChild(ghost);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    if (!isDragging || !ghost) return;

    ghost.style.left = `${e.clientX - 90}px`;
    ghost.style.top = `${e.clientY - 16}px`;

    limpiarIndicadores();
    dropTarget = null;

    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    let targetRow = null;
    let targetSectionHeader = null;
    let targetAddTr = null;

    for (const el of elements) {
      if (el === row || el === ghost) continue;
      if (el.closest('tr.cs-section-gap-tr')) continue;
      const r = el.closest('tr.cs-row-item');
      if (r && r !== row) {
        targetRow = r;
        break;
      }
      const secH = el.closest('tr.cs-section-header-tr');
      if (secH) {
        targetSectionHeader = secH;
        break;
      }
      const addTr = el.closest('tr.cs-section-add-tr');
      if (addTr) {
        targetAddTr = addTr;
        break;
      }
    }

    if (targetRow) {
      const rRect = targetRow.getBoundingClientRect();
      const midY = rRect.top + rRect.height / 2;
      if (e.clientY < midY) {
        dropPos = 'before';
        targetRow.classList.add('cs-drop-indicator-top');
      } else {
        dropPos = 'after';
        targetRow.classList.add('cs-drop-indicator-bottom');
      }
      dropTarget = targetRow;
    } else if (targetSectionHeader) {
      dropPos = 'after';
      targetSectionHeader.classList.add('cs-section-drag-over');
      dropTarget = targetSectionHeader;
    } else if (targetAddTr) {
      dropPos = 'before';
      targetAddTr.classList.add('cs-drop-indicator-top');
      dropTarget = targetAddTr;
    }
  }

  async function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    if (ghost) {
      ghost.remove();
      ghost = null;
    }

    row.classList.remove('cs-row-dragging');
    limpiarIndicadores();

    if (!isDragging || !dropTarget) return;

    capturarEstadoPrevioAntesDeAccion('Reordenar fila');

    // Insertar en la posición correspondiente
    if (dropTarget.classList.contains('cs-section-header-tr')) {
      dropTarget.after(row);
    } else if (dropTarget.classList.contains('cs-section-add-tr')) {
      dropTarget.before(row);
    } else if (dropPos === 'before') {
      dropTarget.before(row);
    } else {
      dropTarget.after(row);
    }

    // Detectar el nuevo bloque de la fila según su posición en el DOM
    let prev = row.previousElementSibling;
    let nuevoBloqueId = 'servicios_fijos';
    while (prev) {
      if (prev.classList.contains('cs-section-header-tr')) {
        nuevoBloqueId = prev.getAttribute('data-block-id') || 'servicios_fijos';
        break;
      }
      prev = prev.previousElementSibling;
    }

    const bloqueAnterior = row.getAttribute('data-bloque');
    row.setAttribute('data-bloque', nuevoBloqueId);

    // Si se sacó de un bloque persistente, eliminar sus réplicas futuras y desvincular PID
    if (BLOQUES_PERSISTENTES_FUTURO.includes(bloqueAnterior) && !BLOQUES_PERSISTENTES_FUTURO.includes(nuevoBloqueId)) {
      const pid = row.getAttribute('data-pid') || extraerPidDeObservaciones(row.querySelector('[data-field="observaciones"]')?.value);
      const cliNom = row.querySelector('[data-field="cliente_nombre"]')?.value || '';
      const sem = row.getAttribute('data-semana-iso') || _currentSemanaMatrizIso;
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      row.removeAttribute('data-pid');
      const obsInput = row.querySelector('[data-field="observaciones"]');
      if (obsInput && obsInput.value.includes('<!--pid:')) {
        obsInput.value = obsInput.value.replace(/<!--pid:.*?-->/g, '').trim();
      }
      if (client) {
        await eliminarFilaDeSemanasPosteriores(pid, bloqueAnterior, cliNom, sem, client);
      }
    } else if (!BLOQUES_PERSISTENTES_FUTURO.includes(bloqueAnterior) && BLOQUES_PERSISTENTES_FUTURO.includes(nuevoBloqueId)) {
      if (!row.getAttribute('data-pid')) {
        const rowId = row.getAttribute('data-id') || `srv_${Date.now()}`;
        row.setAttribute('data-pid', `pid_${String(rowId).replace(/^srv_/, '')}_${Math.random().toString(36).substr(2, 5)}`);
      }
    }

    // Animación de bienvenida en la nueva posición
    row.style.transition = 'background-color 0.8s ease, transform 0.25s ease';
    row.style.backgroundColor = 'rgba(232, 76, 154, 0.25)';
    setTimeout(() => {
      row.style.backgroundColor = '';
    }, 900);

    actualizarFilasVaciasSecciones();
    actualizarContadoresSecciones();
    actualizarContadoresFiltros();

    await guardarMatrizSupabase();

    if (bloqueAnterior !== nuevoBloqueId) {
      const bObj = BLOQUES_SERVICIOS.find(b => b.id === nuevoBloqueId);
      const bNombre = bObj ? bObj.nombre : nuevoBloqueId;
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Servicio reubicado',
          text: `Movido a "${bNombre}"`,
          icon: 'success',
          toast: true,
          timer: 1300,
          showConfirmButton: false,
          position: 'top-end'
        });
      }
    }
  }

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}

// Control del menú contextual de clic derecho y personalización de color
let _currentMenuTargetRow = null;
let _currentMenuTargetCell = null;

function cerrarMenuFila() {
  const menu = document.getElementById('csRowContextMenu');
  if (menu) {
    menu.style.display = 'none';
  }
  _currentMenuTargetRow = null;
  _currentMenuTargetCell = null;
}

/**
 * Aplica color de fondo o de letra a una celda (o a toda la fila) y persiste el cambio inmediatamente
 */
function aplicarColorCelda(row, cell, tipo, valorColor, aplicarFila = false) {
  if (!row) return;
  const targetCells = (aplicarFila || !cell) ? Array.from(row.querySelectorAll('td')) : [cell];
  if (targetCells.length === 0) return;

  capturarEstadoPrevioAntesDeAccion('Cambio de color');

  targetCells.forEach(td => {
    const input = td.querySelector('[data-field]');
    const field = input ? input.getAttribute('data-field') : td.getAttribute('data-field');
    if (!field) return;

    if (tipo === 'bg') {
      const isWhite = valorColor && (valorColor.toLowerCase() === '#ffffff' || valorColor.toLowerCase() === 'white');
      if (!valorColor || valorColor === 'transparent' || valorColor === 'clear' || isWhite) {
        td.removeAttribute('data-custom-bg');
        td.removeAttribute('data-custom-border');
        td.style.removeProperty('--custom-bg');
        td.style.removeProperty('--custom-border');
        td.style.backgroundColor = '';
        if (input) {
          input.style.removeProperty('--custom-bg');
          input.style.removeProperty('--custom-border');
          input.style.borderColor = '';
          input.style.backgroundColor = '';
        }
      } else {
        const borderCol = obtenerBordeColor(valorColor);
        td.setAttribute('data-custom-bg', valorColor);
        td.setAttribute('data-custom-border', borderCol);
        td.style.setProperty('--custom-bg', valorColor);
        td.style.setProperty('--custom-border', borderCol);
        td.style.backgroundColor = valorColor;
        if (input && !input.classList.contains('cs-time-input')) {
          input.style.setProperty('--custom-bg', valorColor);
          input.style.setProperty('--custom-border', borderCol);
          input.style.borderColor = borderCol;
          input.style.backgroundColor = valorColor;
        }
      }
    } else if (tipo === 'color') {
      if (!valorColor || valorColor === 'inherit' || valorColor === 'clear') {
        td.removeAttribute('data-custom-color');
        td.style.removeProperty('--custom-color');
        td.style.color = '';
        if (input) {
          input.removeAttribute('data-custom-color');
          input.style.removeProperty('--custom-color');
          input.style.color = '';
        }
      } else {
        td.setAttribute('data-custom-color', valorColor);
        td.style.setProperty('--custom-color', valorColor);
        td.style.color = valorColor;
        if (input) {
          input.setAttribute('data-custom-color', valorColor);
          input.style.setProperty('--custom-color', valorColor);
          input.style.color = valorColor;
        }
      }
    } else if (tipo === 'clear_all') {
      td.removeAttribute('data-custom-bg');
      td.removeAttribute('data-custom-border');
      td.removeAttribute('data-custom-color');
      td.style.removeProperty('--custom-bg');
      td.style.removeProperty('--custom-border');
      td.style.removeProperty('--custom-color');
      td.style.backgroundColor = '';
      td.style.color = '';
      if (input) {
        input.removeAttribute('data-custom-color');
        input.style.removeProperty('--custom-bg');
        input.style.removeProperty('--custom-border');
        input.style.removeProperty('--custom-color');
        input.style.borderColor = '';
        input.style.backgroundColor = '';
        input.style.color = '';
      }
    }
  });

  const triggerEl = cell ? (cell.querySelector('[data-field]') || cell) : row;
  notificarCambioFila(triggerEl, true);
}

// =========================================================================
// MOTOR DE OCULTAR Y DESOCULTAR COLUMNAS EN LA MATRIZ DE SERVICIOS
// =========================================================================
const CS_COLUMNAS_MATRIZ = [
  { id: 'total_horas', label: 'Horas', icon: '⏱️', desc: 'Sumatoria de horas semanales', selector: '[data-col="total_horas"]' },
  { id: 'lun', label: 'Lunes', icon: '📅', desc: 'Horario Lunes (Inicio / Fin)', selector: '[data-col="lun"], [data-col="lun_ini"], [data-col="lun_fin"], [data-day-col="lun"]' },
  { id: 'mar', label: 'Martes', icon: '📅', desc: 'Horario Martes (Inicio / Fin)', selector: '[data-col="mar"], [data-col="mar_ini"], [data-col="mar_fin"], [data-day-col="mar"]' },
  { id: 'mie', label: 'Miércoles', icon: '📅', desc: 'Horario Miércoles (Inicio / Fin)', selector: '[data-col="mie"], [data-col="mie_ini"], [data-col="mie_fin"], [data-day-col="mie"]' },
  { id: 'jue', label: 'Jueves', icon: '📅', desc: 'Horario Jueves (Inicio / Fin)', selector: '[data-col="jue"], [data-col="jue_ini"], [data-col="jue_fin"], [data-day-col="jue"]' },
  { id: 'vie', label: 'Viernes', icon: '📅', desc: 'Horario Viernes (Inicio / Fin)', selector: '[data-col="vie"], [data-col="vie_ini"], [data-col="vie_fin"], [data-day-col="vie"]' },
  { id: 'sab', label: 'Sábado', icon: '📅', desc: 'Horario Sábado (Inicio / Fin)', selector: '[data-col="sab"], [data-col="sab_ini"], [data-col="sab_fin"], [data-day-col="sab"]' },
  { id: 'dom', label: 'Domingo', icon: '📅', desc: 'Horario Domingo (Inicio / Fin)', selector: '[data-col="dom"], [data-col="dom_ini"], [data-col="dom_fin"], [data-day-col="dom"]' },
  { id: 'service_type', label: 'Tipo de Servicio', icon: '🏷️', desc: 'Neuronanny, Educativa, etc.', selector: '[data-col="service_type"]' },
  { id: 'email', label: 'Email', icon: '✉️', desc: 'Correo del cliente', selector: '[data-col="email"]' },
  { id: 'client', label: 'Cliente', icon: '👤', desc: 'Nombre del cliente', selector: '[data-col="client"]' },
  { id: 'ok_cli', label: 'OK Cli', icon: '✅', desc: 'Confirmación del cliente', selector: '[data-col="ok_cli"]' },
  { id: 'zone', label: 'Zona', icon: '📍', desc: 'Zona o colonia de atención', selector: '[data-col="zone"]' },
  { id: 'nanny', label: 'Nombre de Niñera', icon: '👩‍👧', desc: 'Niñera asignada', selector: '[data-col="nanny"]' },
  { id: 'ok_nan', label: 'OK Nan', icon: '✅', desc: 'Confirmación de la niñera', selector: '[data-col="ok_nan"]' },
  { id: 'rate_cli', label: '$ Cli', icon: '💵', desc: 'Tarifa cobrada al cliente por hora', selector: '[data-col="rate_cli"]' },
  { id: 'rate_nan', label: '$ Nan', icon: '💵', desc: 'Tarifa pagada a la niñera por hora', selector: '[data-col="rate_nan"]' },
  { id: 'saldo_cli', label: 'Saldo', icon: '💰', desc: 'Saldo total cobrado al cliente', selector: '[data-col="saldo_cli"]' },
  { id: 'pago_nan', label: 'Pago', icon: '💸', desc: 'Pago total a la niñera', selector: '[data-col="pago_nan"]' },
  { id: 'alertas', label: 'Alertas', icon: '⚠️', desc: 'Avisos y alertas del servicio', selector: '[data-col="alertas"]' },
  { id: 'obs', label: 'Observaciones', icon: '📝', desc: 'Notas y detalles adicionales', selector: '[data-col="obs"]' }
];

let _csColumnasOcultas = [];

/**
 * Obtiene el ID lógico de columna a partir de cualquier elemento del DOM
 */
function obtenerColumnaIdDesdeElemento(el) {
  if (!el) return null;
  const colEl = el.closest ? el.closest('[data-col], [data-day-col], [data-field], th, td') : null;
  if (!colEl) return null;

  const dayCol = colEl.getAttribute('data-day-col');
  if (dayCol) return dayCol;

  const dataCol = colEl.getAttribute('data-col');
  if (dataCol) {
    if (['lun_ini', 'lun_fin', 'lun'].includes(dataCol)) return 'lun';
    if (['mar_ini', 'mar_fin', 'mar'].includes(dataCol)) return 'mar';
    if (['mie_ini', 'mie_fin', 'mie'].includes(dataCol)) return 'mie';
    if (['jue_ini', 'jue_fin', 'jue'].includes(dataCol)) return 'jue';
    if (['vie_ini', 'vie_fin', 'vie'].includes(dataCol)) return 'vie';
    if (['sab_ini', 'sab_fin', 'sab'].includes(dataCol)) return 'sab';
    if (['dom_ini', 'dom_fin', 'dom'].includes(dataCol)) return 'dom';
    return dataCol;
  }

  const field = colEl.getAttribute('data-field') || colEl.querySelector?.('[data-field]')?.getAttribute('data-field');
  if (field) {
    const fieldMap = {
      'total_horas': 'total_horas',
      'lun_inicio': 'lun', 'lun_fin': 'lun',
      'mar_inicio': 'mar', 'mar_fin': 'mar',
      'mie_inicio': 'mie', 'mie_fin': 'mie',
      'jue_inicio': 'jue', 'jue_fin': 'jue',
      'vie_inicio': 'vie', 'vie_fin': 'vie',
      'sab_inicio': 'sab', 'sab_fin': 'sab',
      'dom_inicio': 'dom', 'dom_fin': 'dom',
      'tipo_servicio': 'service_type',
      'cliente_email': 'email',
      'cliente_nombre': 'client',
      'ok_cliente': 'ok_cli',
      'zona': 'zone',
      'nanny_nombre': 'nanny',
      'ok_nanny': 'ok_nan',
      'tarifa_cliente': 'rate_cli',
      'tarifa_nanny': 'rate_nan',
      'saldo_cliente': 'saldo_cli',
      'pago_nanny': 'pago_nan',
      'alerta': 'alertas',
      'observaciones': 'obs'
    };
    if (fieldMap[field]) return fieldMap[field];
  }

  if (colEl.classList.contains('col-total-hours')) return 'total_horas';
  if (colEl.classList.contains('col-service-type')) return 'service_type';
  if (colEl.classList.contains('col-email')) return 'email';
  if (colEl.classList.contains('col-client')) return 'client';
  if (colEl.classList.contains('col-zone')) return 'zone';
  if (colEl.classList.contains('col-nanny')) return 'nanny';
  if (colEl.classList.contains('col-saldo-cli')) return 'saldo_cli';
  if (colEl.classList.contains('col-pago-nan')) return 'pago_nan';
  if (colEl.classList.contains('col-alerts')) return 'alertas';
  if (colEl.classList.contains('col-obs')) return 'obs';

  return null;
}

/**
 * Carga las columnas ocultas guardadas en LocalStorage
 */
function cargarColumnasOcultas() {
  try {
    const guardadas = localStorage.getItem('nyp_cs_hidden_columns');
    if (guardadas) {
      const parsed = JSON.parse(guardadas);
      if (Array.isArray(parsed)) {
        _csColumnasOcultas = parsed;
      }
    }
  } catch (e) {
    _csColumnasOcultas = [];
  }
  aplicarColumnasOcultas();
}

/**
 * Guarda las columnas ocultas en LocalStorage
 */
function guardarColumnasOcultas() {
  try {
    localStorage.setItem('nyp_cs_hidden_columns', JSON.stringify(_csColumnasOcultas));
  } catch (e) { }
  aplicarColumnasOcultas();
}

/**
 * Aplica reglas CSS instantáneas para ocultar columnas sin alterar ni borrar datos
 */
function aplicarColumnasOcultas() {
  let styleEl = document.getElementById('csHiddenColsDynamicStyle');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'csHiddenColsDynamicStyle';
    document.head.appendChild(styleEl);
  }

  if (!_csColumnasOcultas || _csColumnasOcultas.length === 0) {
    styleEl.textContent = '';
  } else {
    const rules = [];
    _csColumnasOcultas.forEach(colId => {
      const def = CS_COLUMNAS_MATRIZ.find(c => c.id === colId);
      if (def && def.selector) {
        const parts = def.selector.split(',').map(s => {
          const trimmed = s.trim();
          return `#panelServicios ${trimmed}, #panelServicios th${trimmed}, #panelServicios td${trimmed}`;
        });
        rules.push(`${parts.join(', ')} { display: none !important; }`);
      }
    });
    styleEl.textContent = rules.join('\n');
  }

  actualizarBotonGestionColumnas();
}

/**
 * Actualiza el indicador visual del botón de gestión de columnas en el header
 */
function actualizarBotonGestionColumnas() {
  const badge = document.getElementById('csBadgeColsHidden');
  const numOcultas = (_csColumnasOcultas || []).length;
  if (badge) {
    if (numOcultas > 0) {
      badge.textContent = `${numOcultas} oculta${numOcultas > 1 ? 's' : ''}`;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

/**
 * Oculta una columna específica de la matriz
 */
function ocultarColumnaMatriz(colId) {
  if (!colId) return;
  if (!_csColumnasOcultas.includes(colId)) {
    _csColumnasOcultas.push(colId);
    guardarColumnasOcultas();
    const colDef = CS_COLUMNAS_MATRIZ.find(c => c.id === colId);
    mostrarToastHistorial(`Columna "${colDef ? colDef.label : colId}" ocultada`, 'info');
  }
  cerrarMenuColumna();
  cerrarMenuFila();
}

/**
 * Desoculta una columna específica de la matriz
 */
function desocultarColumnaMatriz(colId) {
  if (!colId) return;
  _csColumnasOcultas = _csColumnasOcultas.filter(c => c !== colId);
  guardarColumnasOcultas();
  const colDef = CS_COLUMNAS_MATRIZ.find(c => c.id === colId);
  mostrarToastHistorial(`Columna "${colDef ? colDef.label : colId}" visible`, 'success');
  cerrarMenuColumna();
  cerrarMenuFila();
}

/**
 * Restablece todas las columnas haciéndolas visibles
 */
function restablecerTodasLasColumnas() {
  _csColumnasOcultas = [];
  guardarColumnasOcultas();
  mostrarToastHistorial('Todas las columnas visibles', 'success');
  cerrarMenuColumna();
  cerrarMenuFila();
}

/**
 * Cierra el menú contextual de columna
 */
function cerrarMenuColumna() {
  const menu = document.getElementById('csColumnContextMenu');
  if (menu) menu.style.display = 'none';
}

/**
 * Abre el menú contextual exclusivo de clic derecho sobre un encabezado de columna
 */
function abrirMenuColumna(colId, x, y) {
  cerrarMenuFila();
  cerrarMenuColumna();
  if (typeof window.cerrarAutocompleteDropdown === 'function') {
    window.cerrarAutocompleteDropdown();
  }

  const colDef = CS_COLUMNAS_MATRIZ.find(c => c.id === colId);
  const colLabel = colDef ? colDef.label : (colId || 'Columna');
  const colIcon = colDef ? colDef.icon : '🏛️';

  let menu = document.getElementById('csColumnContextMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'csColumnContextMenu';
    menu.className = 'cs-row-context-menu cs-col-context-menu';
    document.body.appendChild(menu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarMenuColumna();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#csColumnContextMenu')) {
        cerrarMenuColumna();
      }
    });
    window.addEventListener('scroll', cerrarMenuColumna, true);
  }

  const numOcultas = _csColumnasOcultas.length;
  const colsOcultasItems = _csColumnasOcultas.map(cId => {
    const d = CS_COLUMNAS_MATRIZ.find(item => item.id === cId);
    return `
      <button type="button" class="cs-rc-item cs-rc-item-subtle" data-col-unhide="${cId}">
        <span class="cs-rc-icon">${d ? d.icon : '👁️'}</span>
        <div class="cs-rc-text">
          <span class="cs-rc-title">Mostrar ${d ? d.label : cId}</span>
          <span class="cs-rc-desc">Restaurar esta columna</span>
        </div>
      </button>
    `;
  }).join('');

  menu.innerHTML = `
    <div class="cs-cph-box">
      <div class="cs-cph-top">
        <span class="cs-cph-title">${colIcon} Columna</span>
        <span class="cs-cph-badge" title="${colLabel}">${colLabel}</span>
      </div>
    </div>

    ${colId ? `
      <button type="button" class="cs-rc-item" data-action="hide-this-col">
        <span class="cs-rc-icon">👁️‍🗨️</span>
        <div class="cs-rc-text">
          <span class="cs-rc-title">Ocultar columna "${colLabel}"</span>
          <span class="cs-rc-desc">Ocultar visualmente sin eliminar datos</span>
        </div>
      </button>
    ` : ''}

    <button type="button" class="cs-rc-item" data-action="manage-cols">
      <span class="cs-rc-icon">⚙️</span>
      <div class="cs-rc-text">
        <span class="cs-rc-title">Desocultar / Administrar columnas</span>
        <span class="cs-rc-desc">${numOcultas > 0 ? `${numOcultas} columna(s) oculta(s)` : 'Configurar columnas visibles'}</span>
      </div>
    </button>

    ${numOcultas > 0 ? `
      <div class="cs-rc-divider"></div>
      <div class="cs-rc-header">
        <span>Columnas ocultas (${numOcultas})</span>
      </div>
      <div class="cs-hidden-cols-quick-list">
        ${colsOcultasItems}
      </div>
      <div class="cs-rc-divider"></div>
      <button type="button" class="cs-rc-item cs-rc-action-btn" data-action="show-all-cols">
        <span class="cs-rc-icon">🔄</span>
        <div class="cs-rc-text">
          <span class="cs-rc-title">Mostrar todas las columnas</span>
          <span class="cs-rc-desc">Restablecer la vista completa</span>
        </div>
      </button>
    ` : ''}
  `;

  // Listeners del menú de columna
  const btnHideThis = menu.querySelector('[data-action="hide-this-col"]');
  if (btnHideThis) {
    btnHideThis.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarMenuColumna();
      ocultarColumnaMatriz(colId);
    });
  }

  const btnManage = menu.querySelector('[data-action="manage-cols"]');
  if (btnManage) {
    btnManage.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarMenuColumna();
      abrirModalGestionColumnas();
    });
  }

  const btnShowAll = menu.querySelector('[data-action="show-all-cols"]');
  if (btnShowAll) {
    btnShowAll.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarMenuColumna();
      restablecerTodasLasColumnas();
    });
  }

  menu.querySelectorAll('[data-col-unhide]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cId = btn.getAttribute('data-col-unhide');
      cerrarMenuColumna();
      desocultarColumnaMatriz(cId);
    });
  });

  menu.style.display = 'block';

  // Posicionamiento inteligente
  const menuWidth = 285;
  const menuHeight = menu.offsetHeight || 280;
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  let posX = x;
  let posY = y;

  if (posX + menuWidth > winW - 10) posX = winW - menuWidth - 10;
  if (posX < 10) posX = 10;

  if (posY + menuHeight > winH - 10) posY = Math.max(10, winH - menuHeight - 10);
  if (posY < 10) posY = 10;

  menu.style.left = `${posX}px`;
  menu.style.top = `${posY}px`;
}

/**
 * Abre la ventana modal interactiva para administrar columnas visibles
 */
function abrirModalGestionColumnas() {
  cerrarMenuFila();
  cerrarMenuColumna();

  let modal = document.getElementById('csModalGestionColumnas');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'csModalGestionColumnas';
    modal.className = 'cs-modal-overlay';
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModalGestionColumnas();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display !== 'none') cerrarModalGestionColumnas();
    });
  }

  const renderModalContent = () => {
    const totalCols = CS_COLUMNAS_MATRIZ.length;
    const ocultasCount = _csColumnasOcultas.length;
    const visiblesCount = totalCols - ocultasCount;

    const itemsHtml = CS_COLUMNAS_MATRIZ.map(col => {
      const isVisible = !_csColumnasOcultas.includes(col.id);
      return `
        <label class="cs-col-toggle-item ${isVisible ? 'is-visible' : 'is-hidden'}">
          <div class="cs-col-toggle-left">
            <span class="cs-col-toggle-icon">${col.icon}</span>
            <div class="cs-col-toggle-info">
              <span class="cs-col-toggle-title">${col.label}</span>
              <span class="cs-col-toggle-desc">${col.desc}</span>
            </div>
          </div>
          <div class="cs-col-switch-wrap">
            <input type="checkbox" class="cs-col-switch-input" data-col-id="${col.id}" ${isVisible ? 'checked' : ''}>
            <span class="cs-col-switch-slider"></span>
          </div>
        </label>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="cs-modal-card cs-modal-cols-card" onclick="event.stopPropagation()">
        <div class="cs-modal-header">
          <div class="cs-modal-title-wrap">
            <span class="cs-modal-title-icon">👁️</span>
            <div>
              <h3 class="cs-modal-title">Administrar Columnas Visibles</h3>
              <p class="cs-modal-subtitle">Oculta o muestra columnas según tu flujo de trabajo sin perder datos</p>
            </div>
          </div>
          <button type="button" class="cs-modal-close-btn" onclick="cerrarModalGestionColumnas()" title="Cerrar">✕</button>
        </div>

        <div class="cs-modal-cols-toolbar">
          <div class="cs-modal-cols-count">
            <span class="cs-cols-count-badge"><strong>${visiblesCount}</strong> de ${totalCols} visibles</span>
            ${ocultasCount > 0 ? `<span class="cs-cols-hidden-pill">(${ocultasCount} oculta${ocultasCount > 1 ? 's' : ''})</span>` : ''}
          </div>
          <div class="cs-modal-cols-actions">
            <button type="button" class="cs-modal-col-btn" id="csBtnColsShowAll">
              👁️ Mostrar todas
            </button>
            <button type="button" class="cs-modal-col-btn cs-modal-col-btn-sec" id="csBtnColsReset">
              🔄 Restablecer
            </button>
          </div>
        </div>

        <div class="cs-modal-cols-list">
          ${itemsHtml}
        </div>

        <div class="cs-modal-footer">
          <span class="cs-modal-footer-hint">💡 Tip: También puedes hacer <strong>clic derecho</strong> en cualquier columna o celda para ocultarla rápidamente.</span>
          <button type="button" class="cs-btn-modal-done" onclick="cerrarModalGestionColumnas()">
            Listo
          </button>
        </div>
      </div>
    `;

    // Listeners de checkboxes
    modal.querySelectorAll('.cs-col-switch-input').forEach(chk => {
      chk.addEventListener('change', () => {
        const cId = chk.getAttribute('data-col-id');
        if (chk.checked) {
          _csColumnasOcultas = _csColumnasOcultas.filter(c => c !== cId);
        } else {
          if (!_csColumnasOcultas.includes(cId)) {
            _csColumnasOcultas.push(cId);
          }
        }
        guardarColumnasOcultas();
        renderModalContent();
      });
    });

    // Botón Mostrar todas
    const btnShowAll = modal.querySelector('#csBtnColsShowAll');
    if (btnShowAll) {
      btnShowAll.addEventListener('click', () => {
        restablecerTodasLasColumnas();
        renderModalContent();
      });
    }

    // Botón Restablecer
    const btnReset = modal.querySelector('#csBtnColsReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        restablecerTodasLasColumnas();
        renderModalContent();
      });
    }
  };

  renderModalContent();
  modal.style.display = 'flex';
}

/**
 * Cierra la modal de gestión de columnas
 */
function cerrarModalGestionColumnas() {
  const modal = document.getElementById('csModalGestionColumnas');
  if (modal) modal.style.display = 'none';
}

/**
 * Abre el menú contextual exclusivo de clic derecho con selector de colores de celda y opciones de fila
 */
function abrirMenuFila(row, x, y, triggerEl) {
  if (!row) return;
  cerrarMenuColumna();
  if (typeof window.cerrarAutocompleteDropdown === 'function') {
    window.cerrarAutocompleteDropdown();
  }
  _currentMenuTargetRow = row;

  let targetCell = (triggerEl && triggerEl.closest) ? triggerEl.closest('td') : null;
  if (!targetCell && x && y) {
    const elUnderCursor = document.elementFromPoint(x, y);
    if (elUnderCursor) {
      targetCell = elUnderCursor.closest('td');
    }
  }
  _currentMenuTargetCell = targetCell;

  const inputEl = targetCell ? targetCell.querySelector('[data-field]') : null;
  const fieldName = inputEl ? inputEl.getAttribute('data-field') : (targetCell ? targetCell.getAttribute('data-field') : null);
  const fieldLabel = (fieldName && CS_CAMPOS_LABELS[fieldName]) ? CS_CAMPOS_LABELS[fieldName] : (fieldName ? fieldName.replace('_', ' ') : 'Toda la fila');

  const currentBg = targetCell ? (targetCell.getAttribute('data-custom-bg') || '') : '';
  const currentColor = targetCell ? (targetCell.getAttribute('data-custom-color') || '') : '';

  // Identificar la columna a la que pertenece esta celda
  const colId = obtenerColumnaIdDesdeElemento(targetCell || triggerEl);
  const colDef = colId ? CS_COLUMNAS_MATRIZ.find(c => c.id === colId) : null;
  const colLabel = colDef ? colDef.label : (colId || 'esta columna');
  const numOcultas = _csColumnasOcultas.length;

  let menu = document.getElementById('csRowContextMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'csRowContextMenu';
    menu.className = 'cs-row-context-menu';
    document.body.appendChild(menu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarMenuFila();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#csRowContextMenu')) {
        cerrarMenuFila();
      }
    });
    window.addEventListener('scroll', cerrarMenuFila, true);
  }

  // Generar HTML de swatches para fondo
  const swatchesBgHtml = CS_PALETA_FONDOS.map(c => {
    const isAct = (c.hex === 'transparent' ? (!currentBg || currentBg === 'transparent') : (currentBg.toLowerCase() === c.hex.toLowerCase()));
    const isClear = c.hex === 'transparent';
    return `
      <button type="button" 
              class="cs-color-swatch-btn ${isClear ? 'cs-color-swatch-clear' : ''} ${isAct ? 'is-active' : ''}" 
              data-color-target="bg" 
              data-color="${c.hex}" 
              title="${c.nombre}" 
              style="${!isClear ? `background-color: ${c.hex};` : ''}">
      </button>
    `;
  }).join('');

  // Generar HTML de swatches para color de letra
  const swatchesTextHtml = CS_PALETA_TEXTOS.map(c => {
    const isAct = (c.hex === 'inherit' ? (!currentColor || currentColor === 'inherit') : (currentColor.toLowerCase() === c.hex.toLowerCase()));
    const isDef = c.hex === 'inherit';
    return `
      <button type="button" 
              class="cs-text-swatch-btn ${isAct ? 'is-active' : ''}" 
              data-color-target="color" 
              data-color="${c.hex}" 
              title="${c.nombre}" 
              style="color: ${c.display};">
        ${isDef ? 'Aa' : 'A'}
      </button>
    `;
  }).join('');

  // Comprobar si la celda objetivo es un horario de inicio o fin
  const isTimeCell = fieldName && (fieldName.endsWith('_inicio') || fieldName.endsWith('_fin'));
  const cellHasNote = targetCell && targetCell.classList.contains('has-cell-note');

  let noteOptionHtml = '';
  if (isTimeCell) {
    noteOptionHtml = `
      <button type="button" class="cs-rc-item cs-rc-item-note-action" data-action="open-cell-note">
        <span class="cs-rc-icon">📝</span>
        <div class="cs-rc-text">
          <span class="cs-rc-title">${cellHasNote ? 'Editar Nota y Horas Extras' : 'Agregar Nota / Horas Extras'}</span>
          <span class="cs-rc-desc">${cellHasNote ? 'Ver o modificar nota y montos de horas extras' : 'Nota estilo Excel y montos de horas extras'}</span>
        </div>
      </button>
      <div class="cs-rc-divider"></div>
    `;
  }

  menu.innerHTML = `
    ${noteOptionHtml}
    <div class="cs-cph-box">
      <div class="cs-cph-top">
        <span class="cs-cph-title">🎨 Color de celda</span>
        <span class="cs-cph-badge" title="${fieldLabel}">${fieldLabel}</span>
      </div>
    </div>

    <!-- Fondo de Celda -->
    <div class="cs-color-section">
      <div class="cs-color-sec-head">
        <span class="cs-color-sec-title">Fondo</span>
        <button type="button" class="cs-color-quick-clear" data-color-action="clear-bg">Sin fondo</button>
      </div>
      <div class="cs-color-swatches-grid" id="csMenuBgSwatches">
        ${swatchesBgHtml}
        <label class="cs-color-custom-btn" title="Elegir color personalizado">
          <input type="color" class="cs-color-input-native" data-color-target="bg" value="${(currentBg && currentBg.startsWith('#')) ? currentBg : '#FCE7F3'}">
          <span class="cs-color-custom-icon">🌈</span>
        </label>
      </div>
    </div>

    <!-- Color de Letra -->
    <div class="cs-color-section">
      <div class="cs-color-sec-head">
        <span class="cs-color-sec-title">Color de letra</span>
        <button type="button" class="cs-color-quick-clear" data-color-action="clear-color">Defecto</button>
      </div>
      <div class="cs-color-text-swatches-row" id="csMenuTextSwatches">
        ${swatchesTextHtml}
        <label class="cs-color-custom-btn" title="Elegir color de letra personalizado">
          <input type="color" class="cs-color-input-native" data-color-target="color" value="${(currentColor && currentColor.startsWith('#')) ? currentColor : '#1E293B'}">
          <span class="cs-color-custom-icon">🌈</span>
        </label>
      </div>
    </div>

    <!-- Acciones Rápidas de Color -->
    <div class="cs-color-actions-bar">
      <button type="button" class="cs-color-action-pill" data-color-action="apply-row" title="Aplica este fondo y color de letra a todas las celdas de la fila">
        ↔️ Toda la fila
      </button>
      <button type="button" class="cs-color-action-pill" data-color-action="reset-cell" title="Quita fondo y color personalizado de esta celda">
        🔄 Restablecer
      </button>
    </div>

    <div class="cs-rc-divider"></div>

    <!-- Opciones de Columna -->
    <div class="cs-rc-header">
      <span>Gestión de columnas</span>
    </div>
    ${colId ? `
      <button type="button" class="cs-rc-item" data-action="hide-col" data-col-id="${colId}">
        <span class="cs-rc-icon">👁️‍🗨️</span>
        <div class="cs-rc-text">
          <span class="cs-rc-title">Ocultar columna "${colLabel}"</span>
          <span class="cs-rc-desc">Ocultar visualmente sin eliminar datos</span>
        </div>
      </button>
    ` : ''}
    <button type="button" class="cs-rc-item" data-action="manage-cols">
      <span class="cs-rc-icon">⚙️</span>
      <div class="cs-rc-text">
        <span class="cs-rc-title">Desocultar / Administrar columnas</span>
        <span class="cs-rc-desc">${numOcultas > 0 ? `${numOcultas} columna(s) oculta(s)` : 'Configurar visibilidad'}</span>
      </div>
    </button>
    ${numOcultas > 0 ? `
      <button type="button" class="cs-rc-item cs-rc-item-subtle" data-action="show-all-cols">
        <span class="cs-rc-icon">🔄</span>
        <div class="cs-rc-text">
          <span class="cs-rc-title">Mostrar todas las columnas</span>
          <span class="cs-rc-desc">Restablecer la vista completa</span>
        </div>
      </button>
    ` : ''}

    <div class="cs-rc-divider"></div>

    <!-- Opciones de Fila -->
    <div class="cs-rc-header">
      <span>Opciones de fila</span>
    </div>
    <button type="button" class="cs-rc-item" data-action="insert-above">
      <span class="cs-rc-icon">⬆️</span>
      <div class="cs-rc-text">
        <span class="cs-rc-title">Insertar fila arriba</span>
        <span class="cs-rc-desc">Nueva fila vacía antes de esta</span>
      </div>
    </button>
    <button type="button" class="cs-rc-item" data-action="insert-below">
      <span class="cs-rc-icon">⬇️</span>
      <div class="cs-rc-text">
        <span class="cs-rc-title">Insertar fila abajo</span>
        <span class="cs-rc-desc">Nueva fila vacía después de esta</span>
      </div>
    </button>
    <div class="cs-rc-divider"></div>
    <button type="button" class="cs-rc-item" data-action="duplicate">
      <span class="cs-rc-icon">📋</span>
      <div class="cs-rc-text">
        <span class="cs-rc-title">Duplicar fila</span>
        <span class="cs-rc-desc">Copiar horarios y datos de este servicio</span>
      </div>
    </button>
    <div class="cs-rc-divider"></div>
    <button type="button" class="cs-rc-item cs-rc-danger" data-action="delete">
      <span class="cs-rc-icon">🗑️</span>
      <div class="cs-rc-text">
        <span class="cs-rc-title">Eliminar fila</span>
        <span class="cs-rc-desc">Eliminar este servicio</span>
      </div>
    </button>
  `;

  // Asignar manejadores de eventos en el menú
  // 1. Swatches de fondo
  menu.querySelectorAll('.cs-color-swatch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = btn.getAttribute('data-color');
      menu.querySelectorAll('.cs-color-swatch-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      aplicarColorCelda(_currentMenuTargetRow, _currentMenuTargetCell, 'bg', val, !_currentMenuTargetCell);
    });
  });

  // 2. Swatches de letra
  menu.querySelectorAll('.cs-text-swatch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = btn.getAttribute('data-color');
      menu.querySelectorAll('.cs-text-swatch-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      aplicarColorCelda(_currentMenuTargetRow, _currentMenuTargetCell, 'color', val, !_currentMenuTargetCell);
    });
  });

  // 3. Inputs nativos de color
  menu.querySelectorAll('.cs-color-input-native').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const targetType = inp.getAttribute('data-color-target');
      const val = e.target.value;
      if (targetType === 'bg') {
        menu.querySelectorAll('.cs-color-swatch-btn').forEach(b => b.classList.remove('is-active'));
      } else {
        menu.querySelectorAll('.cs-text-swatch-btn').forEach(b => b.classList.remove('is-active'));
      }
      aplicarColorCelda(_currentMenuTargetRow, _currentMenuTargetCell, targetType, val, !_currentMenuTargetCell);
    });
  });

  // 4. Botones rápidos de color
  menu.querySelectorAll('[data-color-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const act = btn.getAttribute('data-color-action');
      if (act === 'clear-bg') {
        menu.querySelectorAll('.cs-color-swatch-btn').forEach(b => b.classList.remove('is-active'));
        const clearBtn = menu.querySelector('.cs-color-swatch-btn[data-color="transparent"]');
        if (clearBtn) clearBtn.classList.add('is-active');
        aplicarColorCelda(_currentMenuTargetRow, _currentMenuTargetCell, 'bg', 'transparent', !_currentMenuTargetCell);
      } else if (act === 'clear-color') {
        menu.querySelectorAll('.cs-text-swatch-btn').forEach(b => b.classList.remove('is-active'));
        const defBtn = menu.querySelector('.cs-text-swatch-btn[data-color="inherit"]');
        if (defBtn) defBtn.classList.add('is-active');
        aplicarColorCelda(_currentMenuTargetRow, _currentMenuTargetCell, 'color', 'inherit', !_currentMenuTargetCell);
      } else if (act === 'apply-row') {
        const bgToApply = _currentMenuTargetCell ? (_currentMenuTargetCell.getAttribute('data-custom-bg') || '') : '';
        const colorToApply = _currentMenuTargetCell ? (_currentMenuTargetCell.getAttribute('data-custom-color') || '') : '';
        aplicarColorCelda(_currentMenuTargetRow, _currentMenuTargetCell, 'bg', bgToApply, true);
        aplicarColorCelda(_currentMenuTargetRow, _currentMenuTargetCell, 'color', colorToApply, true);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Colores aplicados a toda la fila',
            icon: 'success',
            timer: 850,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      } else if (act === 'reset-cell') {
        menu.querySelectorAll('.cs-color-swatch-btn').forEach(b => b.classList.remove('is-active'));
        menu.querySelectorAll('.cs-text-swatch-btn').forEach(b => b.classList.remove('is-active'));
        aplicarColorCelda(_currentMenuTargetRow, _currentMenuTargetCell, 'clear_all', '', false);
      }
    });
  });

  // 5. Botones de columna
  const btnHideColFila = menu.querySelector('[data-action="hide-col"]');
  if (btnHideColFila) {
    btnHideColFila.addEventListener('click', (e) => {
      e.stopPropagation();
      const cId = btnHideColFila.getAttribute('data-col-id');
      cerrarMenuFila();
      ocultarColumnaMatriz(cId);
    });
  }

  const btnManageColsFila = menu.querySelector('[data-action="manage-cols"]');
  if (btnManageColsFila) {
    btnManageColsFila.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarMenuFila();
      abrirModalGestionColumnas();
    });
  }

  const btnShowAllColsFila = menu.querySelector('[data-action="show-all-cols"]');
  if (btnShowAllColsFila) {
    btnShowAllColsFila.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarMenuFila();
      restablecerTodasLasColumnas();
    });
  }

  // Listener para abrir modal de nota / horas extras
  const btnOpenNote = menu.querySelector('[data-action="open-cell-note"]');
  if (btnOpenNote) {
    btnOpenNote.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetRow = _currentMenuTargetRow;
      const targetC = _currentMenuTargetCell;
      const fName = fieldName;
      cerrarMenuFila();
      abrirModalNotaCelda(targetRow, fName, targetC);
    });
  }

  // 6. Opciones de fila
  menu.querySelectorAll('.cs-rc-item[data-action="insert-above"], .cs-rc-item[data-action="insert-below"], .cs-rc-item[data-action="duplicate"], .cs-rc-item[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const action = btn.getAttribute('data-action');
      const target = _currentMenuTargetRow;
      cerrarMenuFila();
      if (!target) return;

      if (action === 'insert-above') {
        await insertarFilaServicioEn(target, 'above');
      } else if (action === 'insert-below') {
        await insertarFilaServicioEn(target, 'below');
      } else if (action === 'duplicate') {
        await duplicarFilaServicio(target);
      } else if (action === 'delete') {
        eliminarFilaServicio(target);
      }
    });
  });

  menu.style.display = 'block';

  // Posicionamiento inteligente del menú dentro de la pantalla
  const menuWidth = 285;
  const menuHeight = menu.offsetHeight || 420;
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  let posX = x;
  let posY = y;

  if (x === 0 && y === 0 && triggerEl) {
    const rect = triggerEl.getBoundingClientRect();
    posX = rect.right + 4;
    posY = rect.top;
  }

  if (posX + menuWidth > winW - 10) {
    posX = winW - menuWidth - 10;
  }
  if (posX < 10) posX = 10;

  if (posY + menuHeight > winH - 10) {
    posY = Math.max(10, winH - menuHeight - 10);
  }
  if (posY < 10) posY = 10;

  menu.style.left = `${posX}px`;
  menu.style.top = `${posY}px`;
}

// Variables globales para la modal de notas
let _currentNotaRow = null;
let _currentNotaField = null;
let _currentNotaCell = null;
let _csNoteTooltipEl = null;

/**
 * Abre el modal interactivo para agregar o editar una nota y horas extras de la celda
 */
function abrirModalNotaCelda(row, fieldName, targetCell) {
  if (!row || !fieldName) return;

  _currentNotaRow = row;
  _currentNotaField = fieldName;
  _currentNotaCell = targetCell || row.querySelector(`[data-field="${fieldName}"]`)?.closest('td');

  let modal = document.getElementById('csModalNotaCelda');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'csModalNotaCelda';
    modal.className = 'cs-note-modal-overlay';
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModalNotaCelda();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display !== 'none') {
        cerrarModalNotaCelda();
      }
    });
  }

  const fieldLabel = CS_CAMPOS_LABELS[fieldName] || fieldName.replace('_', ' ');
  const cliNombre = row.querySelector('[data-field="cliente_nombre"]')?.value || 'Servicio';

  // Leer datos actuales de la celda
  let currentNote = '';
  let currentExtraCli = '';
  let currentExtraNan = '';

  if (_currentNotaCell) {
    const rawNote = _currentNotaCell.getAttribute('data-note-text') || '';
    currentNote = rawNote ? decodeURIComponent(rawNote) : '';
    const cliVal = _currentNotaCell.getAttribute('data-extra-cli');
    if (cliVal && cliVal !== '0') currentExtraCli = cliVal;
    const nanVal = _currentNotaCell.getAttribute('data-extra-nan');
    if (nanVal && nanVal !== '0') currentExtraNan = nanVal;
  }

  const hasExistingData = !!(currentNote || currentExtraCli || currentExtraNan);

  modal.innerHTML = `
    <div class="cs-note-modal-card" onclick="event.stopPropagation()">
      <div class="cs-note-modal-header">
        <div class="cs-note-modal-title-wrap">
          <span class="cs-note-modal-icon">📝</span>
          <div>
            <h4 class="cs-note-modal-title">Nota y Horas Extras</h4>
            <span class="cs-note-modal-subtitle">${fieldLabel} • ${cliNombre}</span>
          </div>
        </div>
        <button type="button" class="cs-note-modal-close" onclick="cerrarModalNotaCelda()" title="Cerrar">&times;</button>
      </div>

      <div class="cs-note-modal-body">
        <!-- Cuadro de Nota -->
        <div class="cs-note-form-group">
          <label class="cs-note-label" for="csNotaTextoInput">
            <span>Nota / Comentario</span>
            <span class="cs-note-label-hint">Visible en la celda con esquina negra</span>
          </label>
          <textarea id="csNotaTextoInput" class="cs-note-textarea" rows="3" placeholder="Escribe una nota para este horario...">${currentNote}</textarea>
        </div>

        <!-- Cuadros de Horas Extras -->
        <div class="cs-note-horas-extras-grid">
          <div class="cs-note-form-group">
            <label class="cs-note-label" for="csHoraExtraClienteInput">
              <span>➕ Hora extra cliente</span>
              <span class="cs-note-label-hint">($ Saldo)</span>
            </label>
            <div class="cs-note-input-wrap">
              <span class="cs-note-input-prefix">$</span>
              <input type="number" id="csHoraExtraClienteInput" class="cs-note-number-input" step="1" min="0" value="${currentExtraCli}" placeholder="0">
            </div>
          </div>

          <div class="cs-note-form-group">
            <label class="cs-note-label" for="csHoraExtraNannyInput">
              <span>➕ Hora extra nanny</span>
              <span class="cs-note-label-hint">($ Pago)</span>
            </label>
            <div class="cs-note-input-wrap">
              <span class="cs-note-input-prefix">$</span>
              <input type="number" id="csHoraExtraNannyInput" class="cs-note-number-input" step="1" min="0" value="${currentExtraNan}" placeholder="0">
            </div>
          </div>
        </div>
      </div>

      <div class="cs-note-modal-footer">
        ${hasExistingData ? `
          <button type="button" class="cs-note-btn cs-note-btn-danger" onclick="eliminarNotaCeldaActual()">
            🗑️ Eliminar Nota
          </button>
        ` : ''}
        <div style="flex: 1;"></div>
        <button type="button" class="cs-note-btn cs-note-btn-secondary" onclick="cerrarModalNotaCelda()">
          Cancelar
        </button>
        <button type="button" class="cs-note-btn cs-note-btn-primary" onclick="guardarNotaCeldaActual()">
          💾 Guardar
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  setTimeout(() => {
    const txtArea = document.getElementById('csNotaTextoInput');
    if (txtArea) txtArea.focus();
  }, 50);
}

/**
 * Cierra la modal de notas
 */
function cerrarModalNotaCelda() {
  const modal = document.getElementById('csModalNotaCelda');
  if (modal) modal.style.display = 'none';
  _currentNotaRow = null;
  _currentNotaField = null;
  _currentNotaCell = null;
}

/**
 * Guarda la nota y montos de horas extras en la celda y actualiza en vivo
 */
function guardarNotaCeldaActual() {
  if (!_currentNotaRow || !_currentNotaField) {
    cerrarModalNotaCelda();
    return;
  }

  const txtInput = document.getElementById('csNotaTextoInput');
  const cliInput = document.getElementById('csHoraExtraClienteInput');
  const nanInput = document.getElementById('csHoraExtraNannyInput');

  const notaTexto = txtInput ? txtInput.value.trim() : '';
  const extraCli = cliInput ? (parseFloat(cliInput.value) || 0) : 0;
  const extraNan = nanInput ? (parseFloat(nanInput.value) || 0) : 0;

  if (!_currentNotaCell) {
    _currentNotaCell = _currentNotaRow.querySelector(`[data-field="${_currentNotaField}"]`)?.closest('td');
  }

  if (_currentNotaCell) {
    if (notaTexto || extraCli > 0 || extraNan > 0) {
      _currentNotaCell.classList.add('has-cell-note');
      _currentNotaCell.setAttribute('data-note-text', encodeURIComponent(notaTexto));
      _currentNotaCell.setAttribute('data-extra-cli', String(extraCli));
      _currentNotaCell.setAttribute('data-extra-nan', String(extraNan));
    } else {
      _currentNotaCell.classList.remove('has-cell-note');
      _currentNotaCell.removeAttribute('data-note-text');
      _currentNotaCell.removeAttribute('data-extra-cli');
      _currentNotaCell.removeAttribute('data-extra-nan');
    }
  }

  const targetRow = _currentNotaRow;
  cerrarModalNotaCelda();

  notificarCambioFila(targetRow, true);
  actualizarHorasFilaEnVivo(targetRow);

  // Si el modal de saldos está abierto, refrescarlo
  const modalSaldos = document.getElementById('csModalSaldos');
  if (modalSaldos && modalSaldos.style.display !== 'none' && typeof renderizarContenidoModalSaldos === 'function') {
    renderizarContenidoModalSaldos();
  }
}

/**
 * Elimina la nota y montos de horas extras de la celda actual
 */
function eliminarNotaCeldaActual() {
  if (!_currentNotaRow || !_currentNotaField) {
    cerrarModalNotaCelda();
    return;
  }

  if (!_currentNotaCell) {
    _currentNotaCell = _currentNotaRow.querySelector(`[data-field="${_currentNotaField}"]`)?.closest('td');
  }

  if (_currentNotaCell) {
    _currentNotaCell.classList.remove('has-cell-note');
    _currentNotaCell.removeAttribute('data-note-text');
    _currentNotaCell.removeAttribute('data-extra-cli');
    _currentNotaCell.removeAttribute('data-extra-nan');
  }

  const targetRow = _currentNotaRow;
  cerrarModalNotaCelda();

  notificarCambioFila(targetRow, true);
  actualizarHorasFilaEnVivo(targetRow);

  // Si el modal de saldos está abierto, refrescarlo
  const modalSaldos = document.getElementById('csModalSaldos');
  if (modalSaldos && modalSaldos.style.display !== 'none' && typeof renderizarContenidoModalSaldos === 'function') {
    renderizarContenidoModalSaldos();
  }
}

/**
 * Muestra el tooltip flotante al pasar el puntero sobre una celda con nota
 */
function mostrarTooltipNotaCelda(td, event) {
  if (!td || !td.classList.contains('has-cell-note')) return;

  const rawNote = td.getAttribute('data-note-text') || '';
  const nota = rawNote ? decodeURIComponent(rawNote) : '';
  const extraCli = parseFloat(td.getAttribute('data-extra-cli') || '0') || 0;
  const extraNan = parseFloat(td.getAttribute('data-extra-nan') || '0') || 0;

  if (!nota && extraCli === 0 && extraNan === 0) return;

  const inputEl = td.querySelector('[data-field]');
  const fieldName = inputEl ? inputEl.getAttribute('data-field') : '';
  const fieldLabel = CS_CAMPOS_LABELS[fieldName] || (fieldName ? fieldName.replace('_', ' ') : 'Horario');

  if (!_csNoteTooltipEl) {
    _csNoteTooltipEl = document.createElement('div');
    _csNoteTooltipEl.className = 'cs-cell-note-tooltip';
    document.body.appendChild(_csNoteTooltipEl);
  }

  let extrasHtml = '';
  if (extraCli > 0 || extraNan > 0) {
    extrasHtml = `
      <div class="cs-cnt-extras">
        ${extraCli > 0 ? `<span>Hora extra cliente: <strong>+$${extraCli.toLocaleString('es-MX')}</strong></span>` : ''}
        ${extraNan > 0 ? `<span>Hora extra nanny: <strong>+$${extraNan.toLocaleString('es-MX')}</strong></span>` : ''}
      </div>
    `;
  }

  _csNoteTooltipEl.innerHTML = `
    <div class="cs-cnt-header">📌 ${fieldLabel}</div>
    ${nota ? `<div class="cs-cnt-text">${nota}</div>` : ''}
    ${extrasHtml}
  `;

  _csNoteTooltipEl.style.display = 'block';

  const rect = td.getBoundingClientRect();
  const tooltipWidth = 220;
  let top = rect.bottom + 6;
  let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

  if (left < 10) left = 10;
  if (left + tooltipWidth > window.innerWidth - 10) {
    left = window.innerWidth - tooltipWidth - 10;
  }
  if (top + 100 > window.innerHeight) {
    top = rect.top - 70;
  }

  _csNoteTooltipEl.style.left = `${left}px`;
  _csNoteTooltipEl.style.top = `${top}px`;
}

/**
 * Oculta el tooltip flotante de notas
 */
function ocultarTooltipNotaCelda() {
  if (_csNoteTooltipEl) {
    _csNoteTooltipEl.style.display = 'none';
  }
}

// Inicialización de delegación de eventos para el tooltip flotante de notas
document.addEventListener('mouseover', (e) => {
  const td = e.target.closest('td.has-cell-note');
  if (td) {
    mostrarTooltipNotaCelda(td, e);
  } else if (!e.target.closest('.cs-cell-note-tooltip')) {
    ocultarTooltipNotaCelda();
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.closest('td.has-cell-note')) {
    ocultarTooltipNotaCelda();
  }
});

/**
 * Disparador al hacer clic en el botón '+' de una fila
 */
function abrirMenuInsertarFila(btn, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const row = btn.closest('tr.cs-row-item');
  if (!row) return;
  abrirMenuFila(row, 0, 0, btn);
}

/**
 * Inicializa el menú contextual con clic derecho sobre cualquier celda o encabezado de columna de la matriz
 */
function initRowContextMenu() {
  const table = document.querySelector('#panelServicios .cs-table') || document.querySelector('.cs-table');
  const tableBody = document.getElementById('csTableBody');

  if (tableBody && !tableBody._hasContextMenuInit) {
    tableBody._hasContextMenuInit = true;
    tableBody.addEventListener('contextmenu', (e) => {
      const row = e.target.closest('tr.cs-row-item');
      if (!row) return;
      e.preventDefault();
      const cell = e.target.closest('td');
      abrirMenuFila(row, e.clientX, e.clientY, cell || e.target);
    });
  }

  // Listener en el encabezado thead para clic derecho en columnas
  if (table && !table._hasHeaderContextMenuInit) {
    table._hasHeaderContextMenuInit = true;
    const thead = table.querySelector('thead');
    if (thead) {
      thead.addEventListener('contextmenu', (e) => {
        const th = e.target.closest('th');
        if (!th) return;
        e.preventDefault();
        const colId = obtenerColumnaIdDesdeElemento(th);
        abrirMenuColumna(colId, e.clientX, e.clientY);
      });
    }
  }
}

/**
 * Elimina una fila de servicio solicitando confirmación mediante modal y sincroniza con Supabase
 */
function eliminarFilaServicio(btnOrRow) {
  const row = (btnOrRow && btnOrRow.closest) ? (btnOrRow.tagName === 'TR' ? btnOrRow : btnOrRow.closest('tr')) : btnOrRow;
  if (!row) return;

  const id = row.getAttribute('data-id');
  const pid = row.getAttribute('data-pid');
  const bloque = row.getAttribute('data-bloque') || 'servicios_fijos';
  const semanaIso = row.getAttribute('data-semana-iso') || _currentSemanaMatrizIso || getMondayISO(new Date());
  const clienteNombre = row.querySelector('[data-field="cliente_nombre"]')?.value?.trim() || 'esta fila';

  const ejecutarEliminacion = async () => {
    capturarEstadoPrevioAntesDeAccion('Eliminar fila');
    row.style.transition = 'all 0.2s ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    setTimeout(async () => {
      row.remove();
      actualizarFilasVaciasSecciones();
      actualizarContadoresSecciones();
      actualizarContadoresFiltros();
      guardarMatrizLocal();

      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (client && id) {
        try {
          const { error } = await client
            .from('control_servicios')
            .delete()
            .eq('id', id);

          if (error) {
            console.warn("⚠️ Error al eliminar en Supabase:", error.message);
          } else {
            console.log("🗑️ [Supabase control_servicios] Fila eliminada:", id);
          }

          // Si es un bloque persistente o tiene PID, eliminar réplicas en semanas posteriores
          if (BLOQUES_PERSISTENTES_FUTURO.includes(bloque) || pid) {
            await eliminarFilaDeSemanasPosteriores(pid, bloque, clienteNombre, semanaIso, client);
          }

          // Sincronizar el nuevo orden secuencial de las filas restantes y purgar réplicas
          await guardarMatrizSupabase();

          // ⚡ Notificar eliminación en tiempo real a portales de niñeras y clientes
          emitirCambioMatrizRealtime(client, {
            eliminado_id: id,
            semana_iso: semanaIso,
            accion: 'eliminar_fila'
          });
        } catch (err) {
          console.warn("⚠️ Error al eliminar fila en Supabase:", err);
        }
      } else {
        await guardarMatrizSupabase();
      }


    }, 200);
  };

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: '¿Eliminar fila de servicio?',
      text: `¿Estás seguro de que deseas eliminar el servicio de "${clienteNombre}"? Esta acción se sincronizará con la base de datos en tiempo real.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'cs-swal-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        ejecutarEliminacion();
      }
    });
  } else {
    if (confirm(`¿Estás seguro de que deseas eliminar el servicio de "${clienteNombre}"?`)) {
      ejecutarEliminacion();
    }
  }
}

/**
 * Normaliza cadenas de texto para comparaciones insensibles a mayúsculas y acentos
 */
function normalizarTextoCS(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Busca un cliente en la caché o fallbacks por nombre, email o inicio de coincidencia
 * Busca primero en clientes fijos y luego en clientes eventuales.
 */
function buscarClienteEnCache(rawVal) {
  if (!rawVal) return null;
  const qNorm = normalizarTextoCS(rawVal);
  const qDigits = String(rawVal).replace(/\D/g, '');
  if (!qNorm && !qDigits) return null;

  const listaFijos = (_cacheClientesCS && _cacheClientesCS.length > 0) ? _cacheClientesCS : _clientesFallbackDefault;
  const listaEventuales = (_cacheClientesEventualesCS && _cacheClientesEventualesCS.length > 0) ? _cacheClientesEventualesCS : [];

  // --- A. Búsqueda en Clientes Fijos ---
  // 1. Coincidencia exacta de nombre normalizado
  let encontrado = listaFijos.find(c => c.activo !== false && c.nombre && normalizarTextoCS(c.nombre) === qNorm);
  if (encontrado) return { ...encontrado, _tipoCliente: 'fijo' };

  // 2. Coincidencia por teléfono (si se ingresaron al menos 4 dígitos)
  if (qDigits.length >= 4) {
    encontrado = listaFijos.find(c => {
      if (c.activo === false || !c.telefono) return false;
      const telDigits = String(c.telefono).replace(/\D/g, '');
      return telDigits.includes(qDigits) || qDigits.includes(telDigits);
    });
    if (encontrado) return { ...encontrado, _tipoCliente: 'fijo' };
  }

  // 3. Coincidencia exacta de email normalizado
  encontrado = listaFijos.find(c => c.activo !== false && c.email && normalizarTextoCS(c.email) === qNorm);
  if (encontrado) return { ...encontrado, _tipoCliente: 'fijo' };

  // 4. Coincidencia si inicia con el nombre del cliente
  if (qNorm.length >= 3) {
    encontrado = listaFijos.find(c => {
      if (c.activo === false || !c.nombre) return false;
      const nNorm = normalizarTextoCS(c.nombre);
      return nNorm === qNorm || qNorm.startsWith(nNorm);
    });
    if (encontrado) return { ...encontrado, _tipoCliente: 'fijo' };
  }

  // --- B. Búsqueda en Clientes Eventuales ---
  // 1. Coincidencia exacta de nombre normalizado
  encontrado = listaEventuales.find(c => c.nombre && normalizarTextoCS(c.nombre) === qNorm);
  if (encontrado) return { ...encontrado, _tipoCliente: 'eventual' };

  // 2. Coincidencia por teléfono (si se ingresaron al menos 4 dígitos)
  if (qDigits.length >= 4) {
    encontrado = listaEventuales.find(c => {
      if (!c.telefono) return false;
      const telDigits = String(c.telefono).replace(/\D/g, '');
      return telDigits.includes(qDigits) || qDigits.includes(telDigits);
    });
    if (encontrado) return { ...encontrado, _tipoCliente: 'eventual' };
  }

  // 3. Coincidencia exacta de email normalizado
  encontrado = listaEventuales.find(c => c.email && normalizarTextoCS(c.email) === qNorm);
  if (encontrado) return { ...encontrado, _tipoCliente: 'eventual' };

  // 4. Coincidencia de prefijo
  if (qNorm.length >= 3) {
    encontrado = listaEventuales.find(c => {
      if (!c.nombre) return false;
      const nNorm = normalizarTextoCS(c.nombre);
      return nNorm === qNorm || qNorm.startsWith(nNorm);
    });
    if (encontrado) return { ...encontrado, _tipoCliente: 'eventual' };
  }

  return null;
}

/**
 * Sincroniza la fila cuando cambia el valor en la columna "Cliente":
 * - Si coincide con un cliente registrado en la base de datos: actualiza email y zona con sus datos.
 * - Si se borra o no pertenece a ningún cliente registrado: mantiene el texto pero limpia email y zona para capturarlos manualmente.
 */
function sincronizarClienteFila(input, immediate = false) {
  const rawVal = (input.value || '').trim();
  const row = input.closest('tr');
  if (!row) return;

  const emailInput = row.querySelector('[data-field="cliente_email"]');
  const zoneInput = row.querySelector('[data-field="zona"]');
  const cliRate = row.querySelector('[data-field="tarifa_cliente"]');

  const cliente = buscarClienteEnCache(rawVal);

  if (cliente) {
    // Cliente registrado: vincular email y zona automáticamente
    const nuevoEmail = cliente.email || '';
    const nuevaZona = cliente.zona || cliente.direccion || cliente.ciudad || '';

    if (emailInput) {
      emailInput.value = nuevoEmail;
      emailInput.style.backgroundColor = '#ecfdf5';
      setTimeout(() => { emailInput.style.backgroundColor = 'transparent'; }, 700);
    }

    if (zoneInput) {
      zoneInput.value = nuevaZona;
      zoneInput.style.backgroundColor = '#ecfdf5';
      setTimeout(() => { zoneInput.style.backgroundColor = 'transparent'; }, 700);
    }

    // Pre-cargar datos del cliente en data-detalles-servicio ÚNICAMENTE si es bloque temporal o eventual
    const bloqueActualFila = (row.getAttribute('data-bloque') || '').trim().toLowerCase();
    if (bloqueActualFila === 'servicios_temporales' || bloqueActualFila === 'servicios_eventuales') {
      const attrDetPrevio = row.getAttribute('data-detalles-servicio');
      if (!attrDetPrevio) {
        const edadPequeCalc = (typeof calcularEdadPeque === 'function' && cliente.peque_nacimiento ? calcularEdadPeque(cliente.peque_nacimiento) : '') || cliente.peque_edad || '';
        const notasCli = cliente.notas || (typeof construirNotasPeques === 'function' ? construirNotasPeques(cliente) : '') || '';
        const defDetalles = {
          numero_contacto: cliente.telefono || '',
          direccion: cliente.direccion || cliente.zona || cliente.ciudad || nuevaZona || '',
          ubicacion: cliente.ubicacion || cliente.link_ubicacion || '',
          edad_peque: edadPequeCalc,
          notas: notasCli
        };
        row.setAttribute('data-detalles-servicio', encodeURIComponent(JSON.stringify(defDetalles)));
      }
    }
  } else {
    // Si se borró el texto del cliente por completo:
    if (!rawVal) {
      if (emailInput) {
        emailInput.value = '';
      }
      if (zoneInput) {
        zoneInput.value = '';
      }
      row.removeAttribute('data-detalles-servicio');
    }
  }

  if (typeof actualizarEstadoConfirmacionFila === 'function') {
    actualizarEstadoConfirmacionFila(row);
  }

  notificarCambioFila(input, immediate);
}

function handleClienteInputChange(input) {
  sincronizarClienteFila(input, false);
}

function handleClienteSelectChange(input) {
  sincronizarClienteFila(input, true);
}

/**
 * Manejador de selección de niñera
 */
function handleNannyInputChange(input) {
  const rawVal = (input.value || '').trim();
  const row = input.closest('tr');
  if (!row) return;

  // Actualizar niñera asignada en el input
  input.setAttribute('data-nanny-asignada', rawVal);

  // Actualizar estado de confirmación automática (misma niñera + mismo cliente + mismos horarios)
  if (typeof actualizarEstadoConfirmacionFila === 'function') {
    actualizarEstadoConfirmacionFila(row);
  }

  notificarCambioFila(input, false);
}

/**
 * Actualiza el color y estilo dinámico del selector de Tipo de Servicio
 */
function handleServiceSelectChange(select) {
  capturarEstadoPrevioAntesDeAccion('Cambio de tipo de servicio');
  select.className = 'cs-service-select ' + getServiceClass(select.value);
  notificarCambioFila(select, true);
}

/**
 * Manejador para el campo de Alertas: activa el estilo rojo elegante y actualiza el filtro
 */
function handleAlertaInput(input) {
  const val = (input.value || '').trim();
  if (val.length > 0) {
    input.classList.add('has-alert-active');
  } else {
    input.classList.remove('has-alert-active');
  }
  actualizarContadoresFiltros();
  notificarCambioFila(input, false);
}

/**
 * Controla el estilo visual de los inputs de horario (pill vs empty)
 */
function handleTimeInput(input) {
  const val = input.value.trim();
  if (!val || val === '-') {
    input.classList.add('empty-val');
  } else {
    input.classList.remove('empty-val');
  }
  const row = input.closest('tr');
  if (row) {
    actualizarHorasFilaEnVivo(row);
  }
}

/**
 * Obtiene la matriz completa estructurada en JSON
 */
function obtenerDatosMatrizServicios() {
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return [];

  const rows = tableBody.querySelectorAll('tr.cs-row-item');
  const servicios = [];

  rows.forEach((row, idx) => {
    const servicio = extraeDatosFila(row, idx);
    if (servicio) servicios.push(servicio);
  });

  return servicios;
}

/**
 * Persistencia en LocalStorage por semana como respaldo (combinando todas las ciudades)
 */
function guardarMatrizLocal() {
  try {
    const datosCiudadActual = obtenerDatosMatrizServicios();
    const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
    const key = 'nyp_admin_servicios_matriz_' + sem;
    let cachedRows = [];
    try {
      const localStr = localStorage.getItem(key);
      if (localStr) cachedRows = JSON.parse(localStr);
    } catch (e) { }
    if (!Array.isArray(cachedRows)) cachedRows = [];

    const cNormActual = normalizarTextoCS(_currentCiudadMatriz || 'Puebla');
    const otrasCiudades = cachedRows.filter(r => normalizarTextoCS(r.ciudad || 'Puebla') !== cNormActual);
    const merged = [...otrasCiudades, ...datosCiudadActual];
    localStorage.setItem(key, JSON.stringify(merged));
  } catch (e) {
    console.warn("No se pudo guardar la matriz localmente:", e);
  }
}

/**
 * Guarda masivamente la matriz en Supabase con compatibilidad transparente
 */
async function guardarMatrizSupabase() {
  const datos = obtenerDatosMatrizServicios();
  guardarMatrizLocal();

  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client || datos.length === 0) return;

  try {
    const { error } = await ejecutarUpsertControlServicios(client, datos);

    if (error) {
      console.warn("⚠️ Error en upsert masivo de control_servicios:", error.message);
    } else {
      console.log("✅ [Supabase] " + datos.length + " servicios sincronizados en sus bloques y orden.");
    }

    // Propagar orden y datos de los bloques persistentes a semanas posteriores existentes
    await propagarMatrizBloquesPosteriores(datos, _currentSemanaMatrizIso, client);

    // ⚡ Emitir evento broadcast global en tiempo real para todos los clientes conectados
    emitirCambioMatrizRealtime(client, {
      semana_iso: _currentSemanaMatrizIso,
      total: datos.length,
      accion: 'guardar_matriz'
    });
  } catch (err) {
    console.error("❌ Error al persistir matriz en Supabase:", err);
  }
}

/**
 * Propaga masivamente el orden y datos de bloques persistentes hacia semanas posteriores existentes
 */
async function propagarMatrizBloquesPosteriores(datosMatriz, semanaIsoActual, client) {
  if (!client || !Array.isArray(datosMatriz) || !semanaIsoActual) return;

  // Identificar filas persistentes activas en la semana actual con datos válidos
  const persistentRows = datosMatriz.filter(s =>
    BLOQUES_PERSISTENTES_FUTURO.includes(s.bloque) &&
    servicioTieneDatos(s)
  );

  persistentRows.forEach((s, idx) => {
    if (!s.pid) {
      s.pid = extraerPidDeObservaciones(s.observaciones) || `pid_${s.id ? String(s.id).replace(/^srv_/, '') : Date.now() + '_' + idx}`;
      s.observaciones = inyectarPidEnObservaciones(s.observaciones, s.pid);
    }
  });

  const activePids = new Set(persistentRows.map(s => s.pid).filter(Boolean));
  const activeClientNames = new Set(persistentRows.map(s => (s.cliente_nombre || '').trim().toLowerCase()).filter(Boolean));

  try {
    const { data: posteriorRecords, error } = await client
      .from('control_servicios')
      .select('id, semana_iso, orden, observaciones, bloque, cliente_nombre, ciudad')
      .gt('semana_iso', semanaIsoActual);

    if (error) {
      console.warn("⚠️ Error consultando semanas posteriores en propagación:", error.message);
      return;
    }
    if (!Array.isArray(posteriorRecords)) return;

    const currentCiudadNorm = normalizarTextoCS(_currentCiudadMatriz || 'Puebla');
    const distinctPosteriorWeeks = [...new Set(posteriorRecords.map(r => r.semana_iso))].sort();
    const idsToDelete = [];
    const updates = [];

    for (const postSemana of distinctPosteriorWeeks) {
      const recordsSemana = posteriorRecords.filter(r => r.semana_iso === postSemana);
      const persistentRecordsSemana = recordsSemana.filter(r => {
        const b = r.bloque || (r.observaciones && r.observaciones.match(/<!--bloque:(.*?)-->/) ? r.observaciones.match(/<!--bloque:(.*?)-->/)[1] : '');
        const rCiudadNorm = normalizarTextoCS(r.ciudad || 'Puebla');
        return BLOQUES_PERSISTENTES_FUTURO.includes(b) && rCiudadNorm === currentCiudadNorm;
      });

      // 1. Identificar registros persistentes en el futuro que ya NO existen en la semana activa (borrados o movidos a otro bloque)
      for (const r of persistentRecordsSemana) {
        const rPid = r.pid || extraerPidDeObservaciones(r.observaciones);
        const rNom = (r.cliente_nombre || '').trim().toLowerCase();
        const sigueActivo = (rPid && activePids.has(rPid)) || (rNom && activeClientNames.has(rNom));

        if (!sigueActivo) {
          idsToDelete.push(r.id);
        }
      }

      // 2. Propagar/actualizar las filas activas en esa semana posterior
      for (const s of persistentRows) {
        const sCiudadNorm = normalizarTextoCS(s.ciudad || _currentCiudadMatriz || 'Puebla');
        const match = persistentRecordsSemana.find(r => {
          const rCiudadNorm = normalizarTextoCS(r.ciudad || 'Puebla');
          if (rCiudadNorm !== sCiudadNorm) return false;
          const rPid = r.pid || extraerPidDeObservaciones(r.observaciones);
          if (rPid && s.pid && rPid === s.pid) return true;
          const rNom = (r.cliente_nombre || '').trim().toLowerCase();
          const sNom = (s.cliente_nombre || '').trim().toLowerCase();
          const rBloque = r.bloque || (r.observaciones && r.observaciones.match(/<!--bloque:(.*?)-->/) ? r.observaciones.match(/<!--bloque:(.*?)-->/)[1] : '');
          if (sNom && rBloque === s.bloque && rNom && rNom === sNom) return true;
          return false;
        });

        const clone = { ...s };
        delete clone.colores_celdas;
        clone.ciudad = s.ciudad || _currentCiudadMatriz || 'Puebla';

        if (match) {
          clone.id = match.id;
          clone.semana_iso = postSemana;
          clone.orden = s.orden;
          clone.bloque = s.bloque;
        } else {
          clone.id = `srv_${s.pid}_${postSemana.replace(/-/g, '')}`;
          clone.semana_iso = postSemana;
        }
        updates.push(prepararServicioParaSupabase(clone));
      }
    }

    // Ejecutar eliminación en Supabase y limpiar localStorage de semanas futuras
    if (idsToDelete.length > 0) {
      await client.from('control_servicios').delete().in('id', idsToDelete);
      console.log(`🗑️ [Persistencia] Eliminadas ${idsToDelete.length} réplicas obsoletas en semanas posteriores`);

      posteriorRecords.forEach(r => {
        if (idsToDelete.includes(r.id)) {
          try {
            const key = 'nyp_admin_servicios_matriz_' + r.semana_iso;
            const str = localStorage.getItem(key);
            if (str) {
              const list = JSON.parse(str);
              if (Array.isArray(list)) {
                const filtered = list.filter(item => item.id !== r.id);
                localStorage.setItem(key, JSON.stringify(filtered));
              }
            }
          } catch (e) { }
        }
      });
    }

    // Ejecutar actualización de filas activas en Supabase y sincronizar localStorage
    if (updates.length > 0) {
      await ejecutarUpsertControlServicios(client, updates);
      updates.forEach(u => {
        try {
          const key = 'nyp_admin_servicios_matriz_' + u.semana_iso;
          const str = localStorage.getItem(key);
          if (str) {
            let list = JSON.parse(str);
            if (Array.isArray(list)) {
              const idx = list.findIndex(item => item.id === u.id || (u.pid && item.pid === u.pid) || extraerPidDeObservaciones(item.observaciones) === u.pid);
              if (idx >= 0) list[idx] = u;
              else list.push(u);
              localStorage.setItem(key, JSON.stringify(list));
            }
          }
        } catch (e) { }
      });
    }
  } catch (err) {
    console.warn("⚠️ Error propagando orden masivo de bloques persistentes:", err);
  }
}

let _matrizLiveSyncTimer = null;
let _isMatrizSyncing = false;

/**
 * Consulta Supabase en segundo plano y sincroniza en vivo filas, textos, orden y asistencia
 * para que múltiples administradores vean exactamente la misma información en tiempo real.
 */
async function sincronizarAsistenciaMatrizEnVivo(forceFullRender = false) {
  if (_isMatrizSyncing || window._isCargandoSemana) return;
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client) return;

  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  const semanaIso = _currentSemanaMatrizIso || getMondayISO(new Date());
  _isMatrizSyncing = true;

  try {
    const { data: rows, error } = await client
      .from('control_servicios')
      .select('*')
      .eq('semana_iso', semanaIso)
      .order('orden', { ascending: true })
      .order('id', { ascending: true });

    if (error || !Array.isArray(rows)) {
      _isMatrizSyncing = false;
      return;
    }

    // Si la semana en pantalla cambió mientras consultábamos, abortar
    if (_currentSemanaMatrizIso && semanaIso !== _currentSemanaMatrizIso) {
      _isMatrizSyncing = false;
      return;
    }

    const rowsDecoded = rows.map(r => decodificarServicioSupabase(r));
    const ciudadActualNorm = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(_currentCiudadMatriz || 'Puebla') : (_currentCiudadMatriz || 'Puebla').toLowerCase();
    const rowsCiudad = rowsDecoded.filter(r => (typeof normalizarTextoCS === 'function' ? normalizarTextoCS(r.ciudad || 'Puebla') : (r.ciudad || 'Puebla').toLowerCase()) === ciudadActualNorm);
    const existingRows = tableBody.querySelectorAll('tr.cs-row-item');

    // PROTECCIÓN CRÍTICA: Si Supabase devuelve 0 filas para la ciudad activa pero en pantalla hay filas (ej. recién renderizadas o en proceso de guardado), NO destruir el DOM
    if (rowsCiudad.length === 0 && existingRows.length > 0) {
      _isMatrizSyncing = false;
      return;
    }

    _cacheServiciosSemanaCompleta = rowsDecoded;
    actualizarSelectorCiudadUI();

    const activeEl = document.activeElement;
    const isUserEditing = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT' || activeEl.tagName === 'TEXTAREA') && activeEl.closest('#csTableBody');

    // Detectar si el conteo de filas o el orden de IDs cambió en la ciudad activa
    let needsFullRender = forceFullRender || (existingRows.length !== rowsCiudad.length);
    if (!needsFullRender) {
      for (let i = 0; i < existingRows.length; i++) {
        const trId = existingRows[i].getAttribute('data-id');
        if (trId !== rowsCiudad[i]?.id) {
          needsFullRender = true;
          break;
        }
      }
    }

    // Si hubo filas agregadas, eliminadas o reordenadas y el usuario no está tecleando activamente
    if (needsFullRender && !isUserEditing) {
      renderizarMatrizServicios(rowsDecoded);
      _isMatrizSyncing = false;
      return;
    }

    // Actualización granular de celdas existentes en vivo
    rowsDecoded.forEach(rowRecord => {
      const tr = tableBody.querySelector(`tr[data-id="${rowRecord.id}"]`);
      if (!tr) return;

      // Actualizar campos de texto si no están bajo edición activa local
      const textFields = [
        'cliente_nombre', 'cliente_email', 'zona', 'nanny_nombre',
        'tarifa_cliente', 'tarifa_nanny', 'saldo_cliente', 'pago_nanny',
        'alerta',
        'lun_inicio', 'lun_fin', 'mar_inicio', 'mar_fin', 'mie_inicio', 'mie_fin',
        'jue_inicio', 'jue_fin', 'vie_inicio', 'vie_fin', 'sab_inicio', 'sab_fin',
        'dom_inicio', 'dom_fin'
      ];

      textFields.forEach(f => {
        const inp = tr.querySelector(`[data-field="${f}"]`);
        if (inp && inp !== activeEl) {
          let newVal = rowRecord[f] || '';
          if (f.endsWith('_inicio') || f.endsWith('_fin')) {
            newVal = typeof formatearHora12 === 'function' ? formatearHora12(newVal) : newVal;
            if (inp.value !== newVal) {
              inp.value = newVal;
              if (typeof handleTimeInput === 'function') handleTimeInput(inp);
            }
          } else {
            if (inp.value !== newVal) {
              inp.value = newVal;
            }
          }
        }
      });

      // Actualizar selector de tipo de servicio
      const svcSelect = tr.querySelector('[data-field="tipo_servicio"]');
      if (svcSelect && svcSelect !== activeEl) {
        const newSvc = rowRecord.tipo_servicio || '';
        if (svcSelect.value !== newSvc) {
          svcSelect.value = newSvc;
          if (typeof getServiceClass === 'function') {
            svcSelect.className = 'cs-service-select ' + getServiceClass(newSvc);
          }
        }
      }

      // Actualizar checkboxes de OK cliente y OK niñera
      const okCli = tr.querySelector('[data-field="ok_cliente"]');
      if (okCli && okCli !== activeEl) {
        okCli.checked = !!rowRecord.ok_cliente;
      }
      const okNan = tr.querySelector('[data-field="ok_nanny"]');
      if (okNan && okNan !== activeEl) {
        okNan.checked = !!rowRecord.ok_nanny;
      }

      // Actualizar observaciones y tags
      const inpObs = tr.querySelector('[data-field="observaciones"]');
      if (inpObs && inpObs !== activeEl) {
        const { textoLimpio } = typeof extraerColoresDeObservaciones === 'function' ? extraerColoresDeObservaciones(rowRecord.observaciones || '') : { textoLimpio: rowRecord.observaciones || '' };
        if (inpObs.value !== textoLimpio) {
          inpObs.value = textoLimpio;
        }
      }

      // Sincronizar estado visual de confirmación de niñera
      const tdNanny = tr.querySelector('td.col-nanny');
      const nannyInput = tr.querySelector('[data-field="nanny_nombre"]');
      if (tdNanny) {
        const datosFila = typeof extraeDatosFila === 'function' ? (extraeDatosFila(tr) || {}) : {};
        const servicioCompleto = {
          ...datosFila,
          ...rowRecord,
          nanny_nombre: rowRecord.nanny_nombre || datosFila.nanny_nombre || (nannyInput ? nannyInput.value : '') || '',
          observaciones: rowRecord.observaciones !== undefined ? rowRecord.observaciones : (datosFila.observaciones || ''),
          asistencia_nanny: rowRecord.asistencia_nanny !== undefined ? rowRecord.asistencia_nanny : (datosFila.asistencia_nanny || {})
        };

        const asistCompleta = typeof verificarAsistenciaNannyCompleta === 'function' ? verificarAsistenciaNannyCompleta(servicioCompleto) : false;
        const yaMarcada = tdNanny.classList.contains('cs-nanny-confirmed');

        if (asistCompleta && !yaMarcada) {
          tdNanny.classList.add('cs-nanny-confirmed');
          tdNanny.setAttribute('title', '✓ Asistencia confirmada por la niñera para todos los servicios de la semana');
          tdNanny.setAttribute('data-nanny-confirmada', servicioCompleto.nanny_nombre || '');
          tdNanny.style.setProperty('--custom-bg', '#DCFCE7');
          tdNanny.style.setProperty('--custom-border', '#DCFCE7');
          tdNanny.style.setProperty('background-color', '#DCFCE7', 'important');
          tdNanny.style.setProperty('border-color', '#86EFAC', 'important');
          if (nannyInput && nannyInput !== activeEl) {
            nannyInput.style.setProperty('--custom-bg', '#DCFCE7');
            nannyInput.style.setProperty('--custom-border', '#DCFCE7');
            nannyInput.style.setProperty('background-color', '#DCFCE7', 'important');
            nannyInput.style.setProperty('border-color', '#DCFCE7', 'important');
            nannyInput.style.setProperty('color', '#15803D', 'important');
          }
        } else if (!asistCompleta && yaMarcada) {
          tdNanny.classList.remove('cs-nanny-confirmed');
          tdNanny.removeAttribute('title');
          tdNanny.removeAttribute('data-nanny-confirmada');
          tdNanny.style.removeProperty('--custom-bg');
          tdNanny.style.removeProperty('--custom-border');
          tdNanny.style.backgroundColor = '';
          tdNanny.style.borderColor = '';
          if (nannyInput && nannyInput !== activeEl) {
            nannyInput.style.removeProperty('--custom-bg');
            nannyInput.style.removeProperty('--custom-border');
            nannyInput.style.backgroundColor = '';
            nannyInput.style.borderColor = '';
            nannyInput.style.color = '';
          }
        }
      }
    });
  } catch (e) {
    // Silencioso para operaciones en segundo plano
  } finally {
    _isMatrizSyncing = false;
  }
}

/**
 * Inicia el temporizador de sondeo en segundo plano (polling cada 3.5 segundos)
 * e instala listeners de visibilidad y foco para refresco instantáneo al volver a la ventana
 */
function iniciarSincronizacionAsistenciaEnVivo() {
  if (_matrizLiveSyncTimer) {
    clearInterval(_matrizLiveSyncTimer);
    _matrizLiveSyncTimer = null;
  }
  _matrizLiveSyncTimer = setInterval(() => {
    sincronizarAsistenciaMatrizEnVivo();
  }, 2000);

  if (typeof window !== 'undefined' && !window._matrizFocusAttached) {
    window._matrizFocusAttached = true;
    window.addEventListener('focus', () => {
      sincronizarAsistenciaMatrizEnVivo();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        sincronizarAsistenciaMatrizEnVivo();
      }
    });
  }
}

/**
 * Suscribe a eventos en tiempo real (Supabase Realtime) para la matriz de servicios
 */
function suscribirRealtimeMatrizServicios(semanaIso) {
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

  // Activar polling en vivo como garantía infalible
  iniciarSincronizacionAsistenciaEnVivo();

  if (!client || typeof client.channel !== 'function') return;

  // Si ya tenemos el canal conectado a rt_control_servicios_matriz, no recrearlo para no cortar la conexión
  if (_matrizRealtimeChannel) {
    return;
  }

  // Canal global de realtime para la matriz: escucha cambios en postgres y eventos broadcast instantáneos
  _matrizRealtimeChannel = client
    .channel('rt_control_servicios_matriz')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'control_servicios'
    }, (payload) => {
      manejarCambioRealtimeServicio(payload);
      sincronizarAsistenciaMatrizEnVivo();
    })
    .on('broadcast', { event: 'asistencia_nanny_confirmada' }, (payload) => {
      console.log("⚡ [Realtime Control Servicios] Broadcast de asistencia en vivo recibido:", payload);
      const data = (payload && payload.payload) ? payload.payload : payload;
      manejarBroadcastAsistencia(data);
    })
    .on('broadcast', { event: 'cambio_servicio_matriz' }, (payload) => {
      const data = (payload && payload.payload) ? payload.payload : payload;
      if (data && data.semana_iso === '__PLANTILLA_BASE__') {
        if (data.type === 'servicios_base_batch_update') {
          const modal = document.getElementById('modalServiciosBase');
          if (modal && modal.style.display !== 'none') {
            obtenerPlantillaServiciosBase().then(rows => renderizarTablaServiciosBase(rows));
          }
        }
      } else {
        // Notificación de cambio o guardado masivo en la matriz de servicios
        sincronizarAsistenciaMatrizEnVivo();
      }
    })
    .on('broadcast', { event: 'control_servicios_update' }, () => {
      sincronizarAsistenciaMatrizEnVivo();
    })
    .subscribe((status) => {
      console.log(`⚡ [Realtime Control Servicios] Canal matriz suscrito: ${status}`);
      if (status === 'SUBSCRIBED') {
        sincronizarAsistenciaMatrizEnVivo();
      }
    });
}

/**
 * Emite notificaciones de cambio en tiempo real (BroadcastChannel, LocalStorage y Supabase Broadcast)
 * para que los portales de niñeras, clientes y supervisión sincronicen instantáneamente sin recargar.
 */
function emitirCambioMatrizRealtime(client, extraData = {}) {
  const payloadData = {
    type: 'control_servicios_update',
    timestamp: Date.now(),
    ...extraData
  };

  // 1. BroadcastChannel inter-pestañas (mismo navegador)
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bcSync = new BroadcastChannel('nyp_admin_sync_channel');
      bcSync.postMessage(payloadData);
      setTimeout(() => { try { bcSync.close(); } catch (e) { } }, 200);
    } catch (_) { }
  }

  // 2. LocalStorage trigger
  try {
    localStorage.setItem('nyp_servicios_sync_trigger', JSON.stringify(payloadData));
  } catch (_) { }

  // 3. Supabase Realtime Broadcast multi-dispositivo
  if (client && typeof client.channel === 'function') {
    try {
      const chPortal = client.channel('realtime_portal_servicios');
      chPortal.send({
        type: 'broadcast',
        event: 'cambio_servicio_matriz',
        payload: payloadData
      }).catch(() => { });

      const chNanny = client.channel('realtime_nanny_inicio_auto_sync');
      chNanny.send({
        type: 'broadcast',
        event: 'cambio_servicio_matriz',
        payload: payloadData
      }).catch(() => { });

      if (_matrizRealtimeChannel && typeof _matrizRealtimeChannel.send === 'function') {
        _matrizRealtimeChannel.send({
          type: 'broadcast',
          event: 'cambio_servicio_matriz',
          payload: payloadData
        }).catch(() => { });
      }
    } catch (eBc) {
      console.warn("Aviso emitiendo broadcast Supabase:", eBc);
    }
  }
}
window.emitirCambioMatrizRealtime = emitirCambioMatrizRealtime;

/**
 * Aplica en vivo e inmediatamente la confirmación de asistencia recibida por broadcast o storage
 */
function manejarBroadcastAsistencia(data) {
  if (!data) return;
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  const rowIds = Array.isArray(data.row_ids) ? data.row_ids : (data.row_id ? [data.row_id] : []);
  if (rowIds.length === 0) {
    sincronizarAsistenciaMatrizEnVivo();
    return;
  }

  rowIds.forEach(rId => {
    const row = tableBody.querySelector(`tr[data-id="${rId}"]`);
    if (!row) return;

    const nannyInput = row.querySelector('[data-field="nanny_nombre"]');
    if (nannyInput && !nannyInput.value && data.nanny_nombre) {
      nannyInput.value = data.nanny_nombre;
      nannyInput.setAttribute('data-nanny-asignada', data.nanny_nombre);
    }

    if (data.evidence) {
      const tag = `<!--asistencia_nanny:${JSON.stringify(data.evidence)}-->`;
      const obsInput = row.querySelector('[data-field="observaciones"]');
      if (obsInput) {
        obsInput.setAttribute('data-asistencia-tag', encodeURIComponent(tag));
        obsInput.setAttribute('data-asistencia-backup', encodeURIComponent(tag));
      }
      row.setAttribute('data-asistencia-tag', encodeURIComponent(tag));
      row.setAttribute('data-asistencia-backup', encodeURIComponent(tag));
      row.setAttribute('data-asistencia-nanny', JSON.stringify(data.evidence));
      const tdNan = row.querySelector('td.col-nanny');
      if (tdNan) tdNan.setAttribute('data-asistencia-backup', encodeURIComponent(tag));
    }

    // Aplicar verificación estricta de nombre completo, cliente, días y horarios
    actualizarEstadoConfirmacionFila(row);
  });

  // Sincronizar en segundo plano de manera inmediata
  setTimeout(() => {
    sincronizarAsistenciaMatrizEnVivo();
  }, 200);
}

// Sincronización instantánea multi-pestaña por BroadcastChannel (cero latencia en el mismo navegador)
if (typeof window !== 'undefined' && !window._bcAsistenciaAttached && typeof BroadcastChannel !== 'undefined') {
  window._bcAsistenciaAttached = true;
  try {
    const bc = new BroadcastChannel('nyp_asistencia_channel');
    bc.onmessage = (e) => {
      if (e && e.data) {
        manejarBroadcastAsistencia(e.data);
      }
    };
  } catch (errBc) { }
}

// Sincronización multi-pestaña de respaldo via localStorage
if (typeof window !== 'undefined' && !window._storageAsistenciaAttached) {
  window._storageAsistenciaAttached = true;
  window.addEventListener('storage', (e) => {
    if (e.key === 'nyp_evento_asistencia_confirmada' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        manejarBroadcastAsistencia(data);
      } catch (err) { }
    }
  });
}

/**
 * Maneja eventos de Supabase Realtime (INSERT, UPDATE, DELETE) en vivo
 */
function manejarCambioRealtimeServicio(payload) {
  let { eventType, new: rawNewRecord, old: rawOldRecord } = payload;
  const newRecord = rawNewRecord ? decodificarServicioSupabase(rawNewRecord) : null;
  const oldRecord = rawOldRecord ? decodificarServicioSupabase(rawOldRecord) : null;

  // Interceptar inmediatamente eventos de la plantilla de Servicios Base para actualización multiusuario en vivo
  const recSemana = (newRecord && newRecord.semana_iso) || (oldRecord && oldRecord.semana_iso);
  if (recSemana === '__PLANTILLA_BASE__') {
    manejarCambioRealtimePlantillaBase(payload);
    return;
  }

  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  // Filtrar estrictamente por semana: ignorar eventos de semanas distintas a la actual en pantalla
  const semActual = _currentSemanaMatrizIso || (typeof getMondayISO === 'function' ? getMondayISO(new Date()) : null);
  if (recSemana && semActual && recSemana !== semActual) {
    return;
  }

  // Filtrar por ciudad: verificar coincidencia con la ciudad activa en pantalla
  const ciudadActualNorm = normalizarTextoCS(_currentCiudadMatriz || 'Puebla');
  const recCiudadNorm = normalizarTextoCS((newRecord && newRecord.ciudad) || (oldRecord && oldRecord.ciudad) || 'Puebla');

  if (eventType === 'INSERT' && newRecord) {
    if (recCiudadNorm !== ciudadActualNorm) return;

    const existing = tableBody.querySelector(`tr[data-id="${newRecord.id}"]`);
    if (existing) return;

    const bId = newRecord.bloque || 'servicios_fijos';
    const recPid = (typeof extraerPidDeObservaciones === 'function' ? extraerPidDeObservaciones(newRecord.observaciones || '') : null) || newRecord.pid;

    // Si es un bloque persistente y ya existe una fila con este PID en el bloque, actualizar en vez de duplicar
    if (recPid && BLOQUES_PERSISTENTES_FUTURO.includes(bId)) {
      const existingPidRow = tableBody.querySelector(`tr[data-pid="${recPid}"]`);
      if (existingPidRow) {
        existingPidRow.setAttribute('data-id', newRecord.id);
        return;
      }
    }

    const tr = document.createElement('tr');
    tr.className = 'cs-row-item' + (newRecord.alerta ? ' has-alert-active' : '');
    tr.setAttribute('data-id', newRecord.id);
    tr.setAttribute('data-bloque', bId);
    tr.setAttribute('data-ciudad', newRecord.ciudad || _currentCiudadMatriz || 'Puebla');
    if (newRecord.semana_iso) tr.setAttribute('data-semana-iso', newRecord.semana_iso);
    if (recPid) tr.setAttribute('data-pid', recPid);
    tr.innerHTML = renderCeldasFilaServicioHtml(newRecord);

    const targetAddTr = tableBody.querySelector(`.cs-section-add-tr[data-add-for="${bId}"]`);
    if (targetAddTr) {
      tableBody.insertBefore(tr, targetAddTr);
    } else {
      tableBody.appendChild(tr);
    }

    const emptyRow = tableBody.querySelector(`tr.cs-section-empty-row[data-empty-for="${bId}"]`);
    if (emptyRow) emptyRow.style.display = 'none';

    tr.style.transition = 'background-color 0.8s ease';
    tr.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
    setTimeout(() => { tr.style.backgroundColor = ''; }, 1200);

    actualizarContadoresSecciones();
    initCheckboxInteractions();
    initRowContextMenu();
    restaurarAnchosColumnas();
    actualizarContadoresFiltros();
  } else if (eventType === 'UPDATE' && newRecord) {
    let row = tableBody.querySelector(`tr[data-id="${newRecord.id}"]`);
    if (!row) {
      const recPid = (typeof extraerPidDeObservaciones === 'function' ? extraerPidDeObservaciones(newRecord.observaciones || '') : null) || newRecord.pid;
      if (recPid) {
        row = tableBody.querySelector(`tr[data-pid="${recPid}"]`);
        if (row) row.setAttribute('data-id', newRecord.id);
      }
    }

    if (recCiudadNorm !== ciudadActualNorm) {
      if (row) {
        row.remove();
        actualizarContadoresSecciones();
        actualizarContadoresFiltros();
      }
      return;
    }
    if (!row) return;

    const activeEl = document.activeElement;

    // Actualizar horarios
    const days = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    days.forEach(d => {
      const iniInput = row.querySelector(`[data-field="${d}_inicio"]`);
      const finInput = row.querySelector(`[data-field="${d}_fin"]`);
      if (iniInput && iniInput !== activeEl) {
        iniInput.value = formatearHora12(newRecord[`${d}_inicio`] || '');
        handleTimeInput(iniInput);
      }
      if (finInput && finInput !== activeEl) {
        finInput.value = formatearHora12(newRecord[`${d}_fin`] || '');
        handleTimeInput(finInput);
      }
    });

    const svcSelect = row.querySelector('[data-field="tipo_servicio"]');
    if (svcSelect && svcSelect !== activeEl) {
      svcSelect.value = newRecord.tipo_servicio || '';
      svcSelect.className = 'cs-service-select ' + getServiceClass(newRecord.tipo_servicio);
    }

    const emailInput = row.querySelector('[data-field="cliente_email"]');
    if (emailInput && emailInput !== activeEl) {
      emailInput.value = newRecord.cliente_email || '';
    }

    const cliInput = row.querySelector('[data-field="cliente_nombre"]');
    if (cliInput && cliInput !== activeEl) {
      cliInput.value = newRecord.cliente_nombre || '';
    }

    const okCli = row.querySelector('[data-field="ok_cliente"]');
    if (okCli && okCli !== activeEl) {
      okCli.checked = !!newRecord.ok_cliente;
    }

    const zonaInput = row.querySelector('[data-field="zona"]');
    if (zonaInput && zonaInput !== activeEl) {
      zonaInput.value = newRecord.zona || '';
    }

    const nannyInput = row.querySelector('[data-field="nanny_nombre"]');
    if (nannyInput && nannyInput !== activeEl) {
      nannyInput.value = newRecord.nanny_nombre || '';
    }

    const tdNanny = row.querySelector('td.col-nanny');
    if (tdNanny) {
      const datosFila = typeof extraeDatosFila === 'function' ? (extraeDatosFila(row) || {}) : {};
      const servicioCompleto = {
        ...datosFila,
        ...newRecord,
        nanny_nombre: newRecord.nanny_nombre || datosFila.nanny_nombre || (nannyInput ? nannyInput.value : '') || '',
        observaciones: newRecord.observaciones !== undefined ? newRecord.observaciones : (datosFila.observaciones || ''),
        asistencia_nanny: newRecord.asistencia_nanny !== undefined ? newRecord.asistencia_nanny : (datosFila.asistencia_nanny || {})
      };

      const asistCompleta = verificarAsistenciaNannyCompleta(servicioCompleto);
      if (asistCompleta) {
        tdNanny.classList.add('cs-nanny-confirmed');
        tdNanny.setAttribute('title', '✓ Asistencia confirmada por la niñera para todos los servicios de la semana');
        tdNanny.setAttribute('data-nanny-confirmada', servicioCompleto.nanny_nombre || '');
        tdNanny.style.setProperty('--custom-bg', '#DCFCE7');
        tdNanny.style.setProperty('--custom-border', '#DCFCE7');
        tdNanny.style.setProperty('background-color', '#DCFCE7', 'important');
        tdNanny.style.setProperty('border-color', '#86EFAC', 'important');
        if (nannyInput) {
          nannyInput.style.setProperty('--custom-bg', '#DCFCE7');
          nannyInput.style.setProperty('--custom-border', '#DCFCE7');
          nannyInput.style.setProperty('background-color', '#DCFCE7', 'important');
          nannyInput.style.setProperty('border-color', '#DCFCE7', 'important');
          nannyInput.style.setProperty('color', '#15803D', 'important');
          nannyInput.setAttribute('data-nanny-asignada', servicioCompleto.nanny_nombre || '');
        }
      } else {
        tdNanny.classList.remove('cs-nanny-confirmed');
        tdNanny.removeAttribute('title');
        tdNanny.removeAttribute('data-nanny-confirmada');
        const customBg = tdNanny.getAttribute('data-custom-bg');
        if (customBg && customBg !== '#DBEAFE' && customBg !== '#DCFCE7') {
          tdNanny.style.setProperty('--custom-bg', customBg);
          tdNanny.style.setProperty('--custom-border', customBg);
          tdNanny.style.setProperty('background-color', customBg, 'important');
          tdNanny.style.setProperty('border-color', customBg, 'important');
          if (nannyInput) {
            nannyInput.style.setProperty('--custom-bg', customBg);
            nannyInput.style.setProperty('--custom-border', customBg);
            nannyInput.style.setProperty('background-color', customBg, 'important');
            nannyInput.style.setProperty('border-color', customBg, 'important');
          }
        } else {
          tdNanny.style.removeProperty('--custom-bg');
          tdNanny.style.removeProperty('--custom-border');
          tdNanny.style.backgroundColor = '';
          tdNanny.style.borderColor = '';
          if (nannyInput) {
            nannyInput.style.removeProperty('--custom-bg');
            nannyInput.style.removeProperty('--custom-border');
            nannyInput.style.backgroundColor = '';
            nannyInput.style.borderColor = '';
            nannyInput.style.color = '';
          }
        }
      }
    }

    const okNan = row.querySelector('[data-field="ok_nanny"]');
    if (okNan && okNan !== activeEl) {
      okNan.checked = !!newRecord.ok_nanny;
    }

    const rateCli = row.querySelector('[data-field="tarifa_cliente"]');
    if (rateCli && rateCli !== activeEl) {
      if (rateCli.tagName === 'INPUT') rateCli.value = newRecord.tarifa_cliente || '';
      else rateCli.textContent = newRecord.tarifa_cliente || '';
    }

    const rateNan = row.querySelector('[data-field="tarifa_nanny"]');
    if (rateNan && rateNan !== activeEl) {
      if (rateNan.tagName === 'INPUT') rateNan.value = newRecord.tarifa_nanny || '';
      else rateNan.textContent = newRecord.tarifa_nanny || '';
    }

    const saldoCli = row.querySelector('[data-field="saldo_cliente"]');
    if (saldoCli && saldoCli !== activeEl) {
      if (saldoCli.tagName === 'INPUT') saldoCli.value = newRecord.saldo_cliente || '';
      else saldoCli.textContent = newRecord.saldo_cliente || '';
    }

    const pagoNan = row.querySelector('[data-field="pago_nanny"]');
    if (pagoNan && pagoNan !== activeEl) {
      if (pagoNan.tagName === 'INPUT') pagoNan.value = newRecord.pago_nanny || '';
      else pagoNan.textContent = newRecord.pago_nanny || '';
    }

    const alertaInput = row.querySelector('[data-field="alerta"]');
    if (alertaInput && alertaInput !== activeEl) {
      alertaInput.value = newRecord.alerta || '';
      if (alertaInput.value.trim().length > 0) {
        alertaInput.classList.add('has-alert-active');
      } else {
        alertaInput.classList.remove('has-alert-active');
      }
    }

    const obsInput = row.querySelector('[data-field="observaciones"]');
    const { colores } = extraerColoresDeObservaciones(newRecord.observaciones || '');

    if (obsInput && obsInput !== activeEl) {
      obsInput.value = (typeof limpiarMetadatosObservaciones === 'function')
        ? limpiarMetadatosObservaciones(newRecord.observaciones || '')
        : (newRecord.observaciones || '').replace(/<!--.*?-->/g, '').trim();
    }

    const mAsist = (newRecord.observaciones || '').match(/<!--asistencia_nanny:.*?-->/);
    let tagAsistStr = mAsist ? mAsist[0] : '';
    if (!tagAsistStr && newRecord.asistencia_nanny && typeof newRecord.asistencia_nanny === 'object' && Object.keys(newRecord.asistencia_nanny).length > 0) {
      tagAsistStr = `<!--asistencia_nanny:${JSON.stringify(newRecord.asistencia_nanny)}-->`;
    }
    if (tagAsistStr) {
      const encTag = encodeURIComponent(tagAsistStr);
      if (obsInput) {
        obsInput.setAttribute('data-asistencia-tag', encTag);
        obsInput.setAttribute('data-asistencia-backup', encTag);
      }
      row.setAttribute('data-asistencia-tag', encTag);
      row.setAttribute('data-asistencia-backup', encTag);
      if (tdNanny) {
        tdNanny.setAttribute('data-asistencia-backup', encTag);
      }
      if (newRecord.id) {
        window._cacheAsistenciaServicios = window._cacheAsistenciaServicios || {};
        try {
          const parsed = tagAsistStr.includes('<!--asistencia_nanny:') ? JSON.parse(tagAsistStr.match(/<!--asistencia_nanny:(.*?)-->/)[1]) : newRecord.asistencia_nanny;
          window._cacheAsistenciaServicios[newRecord.id] = parsed;
        } catch (_) { }
      }
    }

    // SIEMPRE aplicar en tiempo real los colores recibidos (o restablecerlos si fueron removidos)
    const coloresParaAplicar = (newRecord.colores_celdas && Object.keys(newRecord.colores_celdas).length > 0)
      ? newRecord.colores_celdas
      : colores;
    aplicarColoresCeldasAFila(row, coloresParaAplicar);

    actualizarContadoresFiltros();
  } else if (eventType === 'DELETE' && oldRecord) {
    let row = tableBody.querySelector(`tr[data-id="${oldRecord.id}"]`);
    if (!row && oldRecord.observaciones) {
      const oldPid = typeof extraerPidDeObservaciones === 'function' ? extraerPidDeObservaciones(oldRecord.observaciones) : null;
      if (oldPid) row = tableBody.querySelector(`tr[data-pid="${oldPid}"]`);
    }
    if (row) {
      row.style.transition = 'all 0.3s ease';
      row.style.opacity = '0';
      row.style.transform = 'scale(0.96)';
      setTimeout(() => {
        row.remove();
        actualizarFilasVaciasSecciones();
        actualizarContadoresSecciones();
        actualizarContadoresFiltros();
      }, 300);
    }
  }
}

/**
 * Resalta suavemente una celda o elemento que ha sido actualizado en tiempo real por otro usuario administrador
 */
function destacarCeldaActualizada(el) {
  if (!el) return;
  const target = el.closest('td') || el;
  const originalBg = target.style.backgroundColor;
  target.style.transition = 'background-color 0.35s ease';
  target.style.backgroundColor = 'rgba(56, 189, 248, 0.28)';
  setTimeout(() => {
    target.style.backgroundColor = originalBg || '';
  }, 850);
}

/**
 * Procesa cambios en tiempo real en la plantilla de Servicios Base (__PLANTILLA_BASE__)
 * para permitir colaboración multiusuario simultánea sin conflictos ni sobreescrituras.
 */
function manejarCambioRealtimePlantillaBase(payload) {
  if (!payload) return;
  let { eventType, new: rawNewRecord, old: rawOldRecord } = payload;
  const newRecord = rawNewRecord ? decodificarServicioSupabase(rawNewRecord) : null;
  const oldRecord = rawOldRecord ? decodificarServicioSupabase(rawOldRecord) : null;

  const record = newRecord || oldRecord;
  if (!record) return;

  const recId = record.id;
  const recCiudadNorm = normalizarTextoCS(record.ciudad || 'Puebla');
  const ciudadActualNorm = normalizarTextoCS(_currentCiudadMatriz || 'Puebla');

  // 1. Actualizar el caché en LocalStorage para mantenerlo siempre al día
  try {
    let base = JSON.parse(localStorage.getItem('nyp_servicios_base_plantilla') || '[]');
    if (Array.isArray(base)) {
      if (eventType === 'DELETE') {
        base = base.filter(s => s.id !== recId);
      } else if (newRecord) {
        const idx = base.findIndex(s => s.id === recId);
        if (idx >= 0) {
          base[idx] = newRecord;
        } else {
          base.push(newRecord);
        }
      }
      localStorage.setItem('nyp_servicios_base_plantilla', JSON.stringify(base));
    }
  } catch (e) { }

  // 2. Si el modal de Servicios Base está abierto y visible en la pantalla actual
  const modal = document.getElementById('modalServiciosBase');
  const tbody = document.getElementById('csSbTableBody');
  if (!modal || modal.style.display === 'none' || !tbody) return;

  // Si el cambio pertenece a otra ciudad, no tocar el DOM de la ciudad activa
  if (recCiudadNorm !== ciudadActualNorm) return;

  if (eventType === 'DELETE') {
    const row = tbody.querySelector(`tr[data-id="${recId}"]`);
    if (row) {
      row.style.transition = 'all 0.3s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => {
        row.remove();
        actualizarContadorPlantillaServiciosBase();
        if (tbody.querySelectorAll('tr.cs-row-item').length === 0) {
          renderizarTablaServiciosBase([]);
        }
      }, 250);
    }
    return;
  }

  if (eventType === 'INSERT' && newRecord) {
    const existing = tbody.querySelector(`tr[data-id="${recId}"]`);
    if (existing) return;

    // Remover empty state si existe
    const emptyTr = tbody.querySelector('.cs-sb-empty-tr');
    if (emptyTr) emptyTr.remove();

    const esNuevo = esServicioNuevoCliente(newRecord.observaciones);
    const cliNombre = (newRecord.cliente_nombre || '').replace(/"/g, '&quot;');
    const actionCell = (typeof _sbModoClientePerdido !== 'undefined' && _sbModoClientePerdido)
      ? `<td style="text-align: center; vertical-align: middle;">
           <input type="checkbox" class="cs-sb-loss-checkbox" onchange="handleSbLossCheckboxChange(this)" data-id="${recId}" data-client-name="${cliNombre}">
         </td>`
      : `<td style="text-align: center; vertical-align: middle;">
           <button type="button" class="cs-sb-btn-delete-row" onclick="eliminarFilaServiciosBase(this)" title="Eliminar fila de la plantilla">🗑️</button>
         </td>`;

    const tr = document.createElement('tr');
    tr.className = 'cs-row-item';
    tr.setAttribute('data-id', recId);
    tr.setAttribute('data-bloque', 'servicios_fijos');
    tr.setAttribute('data-semana-iso', '__PLANTILLA_BASE__');
    tr.setAttribute('data-ciudad', newRecord.ciudad || _currentCiudadMatriz || 'Puebla');
    tr.setAttribute('data-nuevo-cliente', esNuevo ? 'true' : 'false');
    tr.innerHTML = `
      ${renderCeldasFilaServicioHtml(newRecord)}
      ${actionCell}
    `;

    tbody.appendChild(tr);

    // Animación suave de inserción en tiempo real
    tr.style.transition = 'background-color 0.8s ease';
    tr.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
    setTimeout(() => { tr.style.backgroundColor = ''; }, 1200);

    actualizarContadorPlantillaServiciosBase();
    const sbTable = tbody.closest('table') || document.querySelector('.cs-sb-table');
    if (sbTable) restaurarAnchosColumnas(sbTable);
    return;
  }

  if (eventType === 'UPDATE' && newRecord) {
    const row = tbody.querySelector(`tr[data-id="${recId}"]`);
    if (!row) {
      // Si la fila no existía en el DOM, insertarla
      const emptyTr = tbody.querySelector('.cs-sb-empty-tr');
      if (emptyTr) emptyTr.remove();

      const esNuevo = esServicioNuevoCliente(newRecord.observaciones);
      const cliNombre = (newRecord.cliente_nombre || '').replace(/"/g, '&quot;');
      const actionCell = (typeof _sbModoClientePerdido !== 'undefined' && _sbModoClientePerdido)
        ? `<td style="text-align: center; vertical-align: middle;">
             <input type="checkbox" class="cs-sb-loss-checkbox" onchange="handleSbLossCheckboxChange(this)" data-id="${recId}" data-client-name="${cliNombre}">
           </td>`
        : `<td style="text-align: center; vertical-align: middle;">
             <button type="button" class="cs-sb-btn-delete-row" onclick="eliminarFilaServiciosBase(this)" title="Eliminar fila de la plantilla">🗑️</button>
           </td>`;

      const tr = document.createElement('tr');
      tr.className = 'cs-row-item';
      tr.setAttribute('data-id', recId);
      tr.setAttribute('data-bloque', 'servicios_fijos');
      tr.setAttribute('data-semana-iso', '__PLANTILLA_BASE__');
      tr.setAttribute('data-ciudad', newRecord.ciudad || _currentCiudadMatriz || 'Puebla');
      tr.setAttribute('data-nuevo-cliente', esNuevo ? 'true' : 'false');
      tr.innerHTML = `
        ${renderCeldasFilaServicioHtml(newRecord)}
        ${actionCell}
      `;
      tbody.appendChild(tr);
      actualizarContadorPlantillaServiciosBase();
      return;
    }

    // Actualizar celdas de forma no destructiva respetando el foco del usuario actual
    const activeEl = document.activeElement;

    // 1. Horarios
    const days = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    days.forEach(d => {
      const iniInput = row.querySelector(`[data-field="${d}_inicio"]`);
      const finInput = row.querySelector(`[data-field="${d}_fin"]`);
      if (iniInput && iniInput !== activeEl) {
        const val = formatearHora12(newRecord[`${d}_inicio`] || '');
        const disp = (val === '-' || !val) ? '' : val;
        if (iniInput.value !== disp) {
          iniInput.value = disp;
          iniInput.classList.toggle('empty-val', !disp);
          destacarCeldaActualizada(iniInput);
        }
      }
      if (finInput && finInput !== activeEl) {
        const val = formatearHora12(newRecord[`${d}_fin`] || '');
        const disp = (val === '-' || !val) ? '' : val;
        if (finInput.value !== disp) {
          finInput.value = disp;
          finInput.classList.toggle('empty-val', !disp);
          destacarCeldaActualizada(finInput);
        }
      }
    });

    // 2. Horas totales badge
    const badgeHoras = row.querySelector('[data-field="total_horas"]');
    if (badgeHoras) {
      const totalH = calcularHorasTotalesServicio(newRecord);
      const dispH = formatearHorasTotalesDisplay(totalH);
      badgeHoras.textContent = dispH;
      badgeHoras.classList.toggle('has-hours', totalH > 0);
    }

    // 3. Tipo de servicio
    const selTipo = row.querySelector('[data-field="tipo_servicio"]');
    if (selTipo && selTipo !== activeEl) {
      const nuevoTipo = newRecord.tipo_servicio || '';
      if (selTipo.value !== nuevoTipo) {
        selTipo.value = nuevoTipo;
        selTipo.className = `cs-service-select ${getServiceClass(nuevoTipo)}`;
        destacarCeldaActualizada(selTipo);
      }
    }

    // 4. Email
    const inpEmail = row.querySelector('[data-field="cliente_email"]');
    if (inpEmail && inpEmail !== activeEl) {
      const val = newRecord.cliente_email || '';
      if (inpEmail.value !== val) {
        inpEmail.value = val;
        destacarCeldaActualizada(inpEmail);
      }
    }

    // 5. Cliente
    const inpCli = row.querySelector('[data-field="cliente_nombre"]');
    if (inpCli && inpCli !== activeEl) {
      const val = newRecord.cliente_nombre || '';
      if (inpCli.value !== val) {
        inpCli.value = val;
        destacarCeldaActualizada(inpCli);
      }
    }

    // 6. OK Cliente
    const chkOkCli = row.querySelector('[data-field="ok_cliente"]');
    if (chkOkCli && chkOkCli !== activeEl) {
      chkOkCli.checked = !!newRecord.ok_cliente;
    }

    // 7. Zona
    const inpZona = row.querySelector('[data-field="zona"]');
    if (inpZona && inpZona !== activeEl) {
      const val = newRecord.zona || '';
      if (inpZona.value !== val) {
        inpZona.value = val;
        destacarCeldaActualizada(inpZona);
      }
    }

    // 8. Niñera
    const inpNan = row.querySelector('[data-field="nanny_nombre"]');
    if (inpNan && inpNan !== activeEl) {
      const val = newRecord.nanny_nombre || '';
      if (inpNan.value !== val) {
        inpNan.value = val;
        inpNan.setAttribute('data-nanny-asignada', val);
        destacarCeldaActualizada(inpNan);
      }
    }

    // 9. OK Niñera
    const chkOkNan = row.querySelector('[data-field="ok_nanny"]');
    if (chkOkNan && chkOkNan !== activeEl) {
      chkOkNan.checked = !!newRecord.ok_nanny;
    }

    // 10. Tarifas
    const inpTarCli = row.querySelector('[data-field="tarifa_cliente"]');
    if (inpTarCli && inpTarCli !== activeEl) {
      const val = newRecord.tarifa_cliente || '';
      if (inpTarCli.value !== val) {
        inpTarCli.value = val;
        destacarCeldaActualizada(inpTarCli);
      }
    }

    const inpTarNan = row.querySelector('[data-field="tarifa_nanny"]');
    if (inpTarNan && inpTarNan !== activeEl) {
      const val = newRecord.tarifa_nanny || '';
      if (inpTarNan.value !== val) {
        inpTarNan.value = val;
        destacarCeldaActualizada(inpTarNan);
      }
    }

    // 11. Saldo cliente y Pago niñera
    const inpSaldo = row.querySelector('[data-field="saldo_cliente"]');
    if (inpSaldo && inpSaldo !== activeEl) {
      const val = newRecord.saldo_cliente || '';
      if (inpSaldo.value !== val) {
        inpSaldo.value = val;
        destacarCeldaActualizada(inpSaldo);
      }
    }

    const inpPago = row.querySelector('[data-field="pago_nanny"]');
    if (inpPago && inpPago !== activeEl) {
      const val = newRecord.pago_nanny || '';
      if (inpPago.value !== val) {
        inpPago.value = val;
        destacarCeldaActualizada(inpPago);
      }
    }

    // 12. Alerta
    const inpAlerta = row.querySelector('[data-field="alerta"]');
    if (inpAlerta && inpAlerta !== activeEl) {
      const val = newRecord.alerta || '';
      if (inpAlerta.value !== val) {
        inpAlerta.value = val;
        inpAlerta.classList.toggle('has-alert-active', !!val.trim());
        destacarCeldaActualizada(inpAlerta);
      }
    }

    // 13. Observaciones
    const inpObs = row.querySelector('[data-field="observaciones"]');
    if (inpObs && inpObs !== activeEl) {
      const { obsLimpia } = extraerNotasDeObservaciones(extraerColoresDeObservaciones(newRecord.observaciones || '').obsLimpia || '');
      const obsDisplay = (typeof limpiarMetadatosObservaciones === 'function')
        ? limpiarMetadatosObservaciones(obsLimpia)
        : obsLimpia.replace(/<!--.*?-->/g, '').trim();
      if (inpObs.value !== obsDisplay) {
        inpObs.value = obsDisplay;
        destacarCeldaActualizada(inpObs);
      }
    }

    actualizarContadorPlantillaServiciosBase();
  }
}
window.manejarCambioRealtimePlantillaBase = manejarCambioRealtimePlantillaBase;
window.destacarCeldaActualizada = destacarCeldaActualizada;

/**
 * Muestra banner visual informativo si la tabla aún no se ha creado en Supabase
 */
function mostrarAvisoTablaNoCreada(errorMsg) {
  let aviso = document.getElementById('csAvisoTablaSupa');
  if (!aviso) {
    const mainPanel = document.getElementById('panelServicios');
    if (!mainPanel) return;
    aviso = document.createElement('div');
    aviso.id = 'csAvisoTablaSupa';
    aviso.style.cssText = 'background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin: 10px 16px; font-size: 13px; color: #1e40af; display: flex; align-items: center; justify-content: space-between; gap: 10px;';
    aviso.innerHTML = `
      <div>
        <strong>📌 Vinculación con Supabase:</strong> Recuerda ejecutar el script de <code>supabase_schema.sql</code> en tu Supabase SQL Editor para crear la tabla <code>control_servicios</code> y activar la sincronización en vivo.
      </div>
      <button type="button" onclick="cargarMatrizServiciosSupabase(_currentSemanaMatrizIso)" style="background:#2563eb; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">
        Reintentar conexión 🔄
      </button>
    `;
    mainPanel.insertBefore(aviso, mainPanel.firstChild);
  }
}

/**
 * Carga los servicios desde Supabase para la semana indicada con decodificación de bloques,
 * auto-poblado por ciudad desde Plantilla Base o semana anterior, y protección total multi-admin.
 */
async function cargarMatrizServiciosSupabase(semanaIso) {
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  if (_matrizSaveTimeout) {
    clearTimeout(_matrizSaveTimeout);
    _matrizSaveTimeout = null;
  }

  if (!semanaIso) {
    semanaIso = getMondayISO(new Date());
  }
  _currentSemanaMatrizIso = semanaIso;
  actualizarCabecerasSemanaMatriz(semanaIso);

  window._isCargandoSemana = true;
  _isMatrizSyncing = true;

  // Purgar clave global residual para evitar mezclas o arrastres entre semanas
  try {
    localStorage.removeItem('nyp_admin_servicios_matriz');
  } catch (e) { }

  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client) {
    console.warn("⚠️ Cliente Supabase no disponible para Control de Servicios");
    let localRows = [];
    try {
      const localStr = localStorage.getItem('nyp_admin_servicios_matriz_' + semanaIso);
      if (localStr) localRows = JSON.parse(localStr);
    } catch (e) { }
    renderizarMatrizServicios(Array.isArray(localRows) ? localRows : []);
    window._isCargandoSemana = false;
    _isMatrizSyncing = false;
    return;
  }

  // 1. Renderizado instantáneo (0ms) desde respaldo local si existe para eliminar pantallas en blanco
  let localCacheFound = false;
  try {
    const localStr = localStorage.getItem('nyp_admin_servicios_matriz_' + semanaIso);
    if (localStr) {
      let cachedRows = JSON.parse(localStr);
      if (Array.isArray(cachedRows) && cachedRows.length > 0) {
        cachedRows = cachedRows.map(s => decodificarServicioSupabase(s));
        renderizarMatrizServicios(cachedRows);
        localCacheFound = true;
      }
    }
  } catch (e) { }

  if (!localCacheFound) {
    tableBody.innerHTML = `
      <tr class="cs-loading-row">
        <td colspan="28" style="text-align:center; padding:30px 10px; color:#64748b; font-size:13px;">
          <span style="font-size:18px; display:inline-block; animation:spin 1s infinite linear;">⏳</span> Sincronizando matriz con Supabase en tiempo real...
        </td>
      </tr>
    `;
  }

  try {
    const { data: servicios, error } = await client
      .from('control_servicios')
      .select('*')
      .eq('semana_iso', semanaIso)
      .order('orden', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.warn("ℹ️ Tabla control_servicios no disponible o error al consultar:", error.message);
      mostrarAvisoTablaNoCreada(error.message);
      let fallbackRows = [];
      try {
        const str = localStorage.getItem('nyp_admin_servicios_matriz_' + semanaIso);
        if (str) fallbackRows = JSON.parse(str);
      } catch (e) { }
      fallbackRows = fallbackRows.map(s => decodificarServicioSupabase(s));
      renderizarMatrizServicios(Array.isArray(fallbackRows) ? fallbackRows : []);
      window._isCargandoSemana = false;
      _isMatrizSyncing = false;
      return;
    }

    // Remover aviso si la tabla existe y respondió con éxito
    const aviso = document.getElementById('csAvisoTablaSupa');
    if (aviso) aviso.remove();

    let rows = Array.isArray(servicios) ? servicios : [];

    // Decodificar metadatos, bloques, colores, saldos y pagos
    rows = rows.map(s => decodificarServicioSupabase(s));

    // Sincronización bidireccional inteligente:
    // Si LocalStorage tiene filas locales que no existen en Supabase, subirlas automáticamente
    try {
      const localKey = 'nyp_admin_servicios_matriz_' + semanaIso;
      const localStr = localStorage.getItem(localKey);
      if (localStr) {
        const cachedRows = JSON.parse(localStr);
        if (Array.isArray(cachedRows) && cachedRows.length > 0) {
          if (rows.length === 0) {
            console.log(`🔄 [Respaldo Local] Sincronizando ${cachedRows.length} servicios de LocalStorage hacia Supabase para ${semanaIso}...`);
            rows = cachedRows.map(s => decodificarServicioSupabase(s));
            await ejecutarUpsertControlServicios(client, rows);
          } else {
            const idsEnSupabase = new Set(rows.map(r => r.id));
            const filasFaltantes = cachedRows
              .filter(cr => cr && cr.id && !idsEnSupabase.has(cr.id))
              .map(cr => decodificarServicioSupabase(cr));

            if (filasFaltantes.length > 0) {
              console.log(`🔄 [Sincronización Local -> Supabase] Subiendo ${filasFaltantes.length} filas locales faltantes a Supabase para ${semanaIso}...`);
              filasFaltantes.forEach(f => rows.push(f));
              await ejecutarUpsertControlServicios(client, filasFaltantes);
            }
          }
        }
      }
    } catch (eCache) { }

    // Auto-poblado granular por ciudad: para cada ciudad ('Puebla', 'Xalapa', 'Querétaro', 'CDMX')
    // si no tiene servicios fijos en esta semana, se cargan de Plantilla Base o se heredan de la semana anterior.
    const ciudadesList = ['Puebla', 'Xalapa', 'Querétaro', 'CDMX'];
    const nuevasFilasMasivas = [];
    let prevWeekRowsCache = null;

    for (const ciudadNombre of ciudadesList) {
      const cNorm = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(ciudadNombre) : ciudadNombre.toLowerCase();
      const filasDeEstaCiudad = rows.filter(r => (typeof normalizarTextoCS === 'function' ? normalizarTextoCS(r.ciudad || 'Puebla') : (r.ciudad || 'Puebla').toLowerCase()) === cNorm);
      const fijosDeEstaCiudad = filasDeEstaCiudad.filter(r => (r.bloque || 'servicios_fijos') === 'servicios_fijos' && (typeof servicioTieneDatos !== 'function' || servicioTieneDatos(r)));
      const persDeEstaCiudad = filasDeEstaCiudad.filter(r => BLOQUES_PERSISTENTES_FUTURO.includes(r.bloque) && (typeof servicioTieneDatos !== 'function' || servicioTieneDatos(r)));

      // 1. Si la ciudad no tiene servicios fijos en esta semana:
      if (fijosDeEstaCiudad.length === 0) {
        let baseRows = [];
        try {
          if (typeof obtenerPlantillaServiciosBase === 'function') {
            baseRows = await obtenerPlantillaServiciosBase();
          }
        } catch (eBase) { }

        const baseCiudad = (Array.isArray(baseRows) ? baseRows : []).filter(b => (typeof normalizarTextoCS === 'function' ? normalizarTextoCS(b.ciudad || 'Puebla') : (b.ciudad || 'Puebla').toLowerCase()) === cNorm && (typeof servicioTieneDatos !== 'function' || servicioTieneDatos(b)));

        if (baseCiudad.length > 0) {
          // Poblar desde plantilla base
          baseCiudad.forEach((orig, hIdx) => {
            const rowId = `srv_${Date.now()}_${hIdx}_${Math.random().toString(36).substr(2, 5)}`;
            let obsBase = orig.observaciones || '';
            let celdasCol = orig.colores_celdas;
            if (!celdasCol && obsBase.includes('<!--colores:')) {
              const { colores } = typeof extraerColoresDeObservaciones === 'function' ? extraerColoresDeObservaciones(obsBase) : { colores: {} };
              celdasCol = colores;
            }
            const clon = {
              ...orig,
              id: rowId,
              semana_iso: semanaIso,
              ciudad: ciudadNombre,
              bloque: 'servicios_fijos',
              observaciones: obsBase,
              colores_celdas: celdasCol || {},
              ok_cliente: false,
              ok_nanny: false,
              asistencia_nanny: {}
            };
            rows.push(clon);
            nuevasFilasMasivas.push(clon);
          });
          console.log(`✨ [Plantilla Base] ${baseCiudad.length} servicios fijos cargados desde Plantilla Base para ${ciudadNombre} en semana ${semanaIso}`);
        } else {
          // Si no hay plantilla base para esta ciudad, heredar servicios fijos de la semana inmediatamente anterior
          if (prevWeekRowsCache === null) {
            const lunesAnterior = addWeeksToISO(semanaIso, -1);
            try {
              const { data: prevData, error: errPrev } = await client
                .from('control_servicios')
                .select('*')
                .eq('semana_iso', lunesAnterior)
                .order('orden', { ascending: true })
                .order('id', { ascending: true });
              if (!errPrev && Array.isArray(prevData)) {
                prevWeekRowsCache = prevData.map(r => decodificarServicioSupabase(r));
              } else {
                prevWeekRowsCache = [];
              }
            } catch (ePrev) {
              prevWeekRowsCache = [];
            }
          }

          const fijosPrevCiudad = prevWeekRowsCache.filter(r => (typeof normalizarTextoCS === 'function' ? normalizarTextoCS(r.ciudad || 'Puebla') : (r.ciudad || 'Puebla').toLowerCase()) === cNorm && (r.bloque || 'servicios_fijos') === 'servicios_fijos' && (typeof servicioTieneDatos !== 'function' || servicioTieneDatos(r)));

          if (fijosPrevCiudad.length > 0) {
            fijosPrevCiudad.forEach((orig, hIdx) => {
              const rowId = `srv_${Date.now()}_${hIdx}_${Math.random().toString(36).substr(2, 5)}`;
              let obsHeredada = orig.observaciones || '';
              obsHeredada = obsHeredada.replace(/<!--asistencia_nanny:.*?-->/g, '').trim();
              let celdasCol = orig.colores_celdas;
              if (!celdasCol && obsHeredada.includes('<!--colores:')) {
                const { colores } = typeof extraerColoresDeObservaciones === 'function' ? extraerColoresDeObservaciones(obsHeredada) : { colores: {} };
                celdasCol = colores;
              }
              const clon = {
                ...orig,
                id: rowId,
                semana_iso: semanaIso,
                ciudad: ciudadNombre,
                bloque: 'servicios_fijos',
                observaciones: obsHeredada,
                colores_celdas: celdasCol || {},
                ok_cliente: false,
                ok_nanny: false,
                asistencia_nanny: {}
              };
              rows.push(clon);
              nuevasFilasMasivas.push(clon);
            });
            console.log(`✨ [Herencia Semanal] ${fijosPrevCiudad.length} servicios fijos heredados de la semana previa para ${ciudadNombre} en semana ${semanaIso}`);
          }
        }
      }

      // 2. Heredar bloques internos persistentes si la ciudad no los tiene en esta semana
      if (persDeEstaCiudad.length === 0) {
        if (prevWeekRowsCache === null) {
          const lunesAnterior = addWeeksToISO(semanaIso, -1);
          try {
            const { data: prevData, error: errPrev } = await client
              .from('control_servicios')
              .select('*')
              .eq('semana_iso', lunesAnterior)
              .order('orden', { ascending: true })
              .order('id', { ascending: true });
            if (!errPrev && Array.isArray(prevData)) {
              prevWeekRowsCache = prevData.map(r => decodificarServicioSupabase(r));
            } else {
              prevWeekRowsCache = [];
            }
          } catch (ePrev) {
            prevWeekRowsCache = [];
          }
        }

        const persPrevCiudad = prevWeekRowsCache.filter(r => (typeof normalizarTextoCS === 'function' ? normalizarTextoCS(r.ciudad || 'Puebla') : (r.ciudad || 'Puebla').toLowerCase()) === cNorm && BLOQUES_PERSISTENTES_FUTURO.includes(r.bloque) && (typeof servicioTieneDatos !== 'function' || servicioTieneDatos(r)));

        if (persPrevCiudad.length > 0) {
          persPrevCiudad.forEach((orig, hIdx) => {
            const hPid = orig.pid || (typeof extraerPidDeObservaciones === 'function' ? extraerPidDeObservaciones(orig.observaciones) : null) || `pid_${orig.id ? String(orig.id).replace(/^srv_/, '') : Math.random().toString(36).substr(2, 6)}`;
            let obsHeredada = orig.observaciones || '';
            obsHeredada = obsHeredada.replace(/<!--asistencia_nanny:.*?-->/g, '').trim();
            if (!obsHeredada.includes('<!--pid:') && typeof inyectarPidEnObservaciones === 'function') {
              obsHeredada = inyectarPidEnObservaciones(obsHeredada, hPid);
            }
            let celdasCol = orig.colores_celdas;
            if (!celdasCol && obsHeredada.includes('<!--colores:')) {
              const { colores } = typeof extraerColoresDeObservaciones === 'function' ? extraerColoresDeObservaciones(obsHeredada) : { colores: {} };
              celdasCol = colores;
            }
            const clon = {
              ...orig,
              id: `srv_${Date.now()}_pers_${hIdx}_${Math.random().toString(36).substr(2, 5)}`,
              semana_iso: semanaIso,
              ciudad: ciudadNombre,
              pid: hPid,
              observaciones: obsHeredada,
              colores_celdas: celdasCol || {},
              ok_cliente: false,
              ok_nanny: false,
              asistencia_nanny: {}
            };
            rows.push(clon);
            nuevasFilasMasivas.push(clon);
          });
          console.log(`✨ [Persistencia Interna] ${persPrevCiudad.length} filas persistentes heredadas para ${ciudadNombre} hacia ${semanaIso}`);
        }
      }
    }

    // Si se generaron o heredaron filas nuevas, guardarlas en Supabase
    if (nuevasFilasMasivas.length > 0) {
      await ejecutarUpsertControlServicios(client, nuevasFilasMasivas);
    }

    // Guardar en localStorage para respaldo offline estrictamente para esta semana
    try {
      localStorage.setItem('nyp_admin_servicios_matriz_' + semanaIso, JSON.stringify(rows));
    } catch (e) { }

    // Auto-selección inteligente: Si la ciudad activa por defecto (Puebla) tiene 0 servicios,
    // pero otra ciudad (ej. Xalapa) sí tiene servicios registrados en esta semana cargada desde Supabase,
    // y el admin NO ha hecho una selección manual forzada en esta sesión, auto-enfocar la ciudad con datos.
    if (rows.length > 0 && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('nyp_admin_manual_ciudad_selected')) {
      const cNormActual = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(_currentCiudadMatriz || 'Puebla') : (_currentCiudadMatriz || 'Puebla').toLowerCase();
      const serviciosEnCiudadActual = rows.filter(r => (typeof normalizarTextoCS === 'function' ? normalizarTextoCS(r.ciudad || 'Puebla') : (r.ciudad || 'Puebla').toLowerCase()) === cNormActual && (typeof servicioTieneDatos !== 'function' || servicioTieneDatos(r))).length;
      if (serviciosEnCiudadActual === 0) {
        const ciudades = ['Xalapa', 'Puebla', 'Querétaro', 'CDMX'];
        const ciudadConServicios = ciudades.find(c => {
          const cn = typeof normalizarTextoCS === 'function' ? normalizarTextoCS(c) : c.toLowerCase();
          return rows.some(r => (typeof normalizarTextoCS === 'function' ? normalizarTextoCS(r.ciudad || 'Puebla') : (r.ciudad || 'Puebla').toLowerCase()) === cn && (typeof servicioTieneDatos !== 'function' || servicioTieneDatos(r)));
        });
        if (ciudadConServicios) {
          console.log(`🏙️ [Control de Servicios] Auto-enfocando ciudad con datos activos (${ciudadConServicios})`);
          _currentCiudadMatriz = ciudadConServicios;
          try { localStorage.setItem('nyp_admin_current_ciudad', ciudadConServicios); } catch (_) { }
        }
      }
    }

    renderizarMatrizServicios(rows);
    suscribirRealtimeMatrizServicios(semanaIso);
    actualizarBotonesDeshacerRehacer();
  } catch (err) {
    console.error("❌ Error cargando matriz de Supabase:", err);
    let errFallback = [];
    try {
      const errStr = localStorage.getItem('nyp_admin_servicios_matriz_' + semanaIso);
      if (errStr) errFallback = JSON.parse(errStr);
    } catch (e) { }
    errFallback = errFallback.map(s => decodificarServicioSupabase(s));
    renderizarMatrizServicios(Array.isArray(errFallback) ? errFallback : []);
    actualizarBotonesDeshacerRehacer();
  } finally {
    window._isCargandoSemana = false;
    _isMatrizSyncing = false;
  }
}
window.cargarMatrizServiciosSupabase = cargarMatrizServiciosSupabase;

/**
 * Inicializa la matriz de servicios 100% vinculada a Supabase
 */
function initMatrizServicios() {
  actualizarDatalistsAutocompletado();

  if (!_currentSemanaMatrizIso) {
    _currentSemanaMatrizIso = getMondayISO(new Date());
  }

  actualizarCabecerasSemanaMatriz(_currentSemanaMatrizIso);
  cargarMatrizServiciosSupabase(_currentSemanaMatrizIso);
}

/**
 * ==========================================================================
 * REDIMENSIONAMIENTO INDIVIDUAL DE COLUMNAS (ESTILO EXCEL / GOOGLE SHEETS)
 * ==========================================================================
 */
function getThColumnIndex(th) {
  const row = th.parentElement;
  if (!row) return -1;
  const thead = row.closest('thead');
  const totalHeaderRows = thead ? thead.rows.length : 1;

  if (totalHeaderRows > 1 && row.rowIndex === 1) {
    return Array.from(row.children).indexOf(th) + 1;
  } else {
    let colIdx = 0;
    const cells = Array.from(row.children);
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell === th) return colIdx;
      colIdx += (cell.colSpan || 1);
    }
    return colIdx;
  }
}

function aplicarAnchoColumna(table, colIndex, widthPx) {
  if (!table || colIndex < 0) return;
  const rows = table.querySelectorAll('tbody tr:not(.cs-add-row-tr):not(.cs-loading-row):not(.cs-sb-empty-tr)');
  rows.forEach(tr => {
    const td = tr.children[colIndex];
    if (td) {
      td.style.setProperty('width', `${widthPx}px`, 'important');
      td.style.setProperty('min-width', `${widthPx}px`, 'important');
      td.style.setProperty('max-width', `${widthPx}px`, 'important');
    }
  });
}

function attachResizerEvents(th, resizer) {
  let startX = 0;
  let startWidth = 0;
  let startWidth1 = 0;
  let startWidth2 = 0;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    startX = e.pageX;
    startWidth = th.getBoundingClientRect().width;

    document.body.classList.add('cs-is-resizing');
    resizer.classList.add('resizing');

    const minAllowed = 20;
    const table = th.closest('table');
    const isDayGroup = th.classList.contains('header-day-group') || (th.colSpan && th.colSpan > 1);
    const colIndex = getThColumnIndex(th);

    let subTh1 = null;
    let subTh2 = null;
    let col1 = colIndex;
    let col2 = colIndex + 1;

    if (isDayGroup) {
      const dayKey = th.getAttribute('data-day-col') || th.getAttribute('data-col');
      if (dayKey) {
        subTh1 = table.querySelector(`thead th.header-sub[data-col="${dayKey}_ini"]`);
        subTh2 = table.querySelector(`thead th.header-sub[data-col="${dayKey}_fin"]`);
      }
      if (!subTh1 && table.rows[1]) {
        subTh1 = table.rows[1].children[col1 - 1];
        subTh2 = table.rows[1].children[col2 - 1];
      }
      startWidth1 = subTh1 ? subTh1.getBoundingClientRect().width : (startWidth / 2);
      startWidth2 = subTh2 ? subTh2.getBoundingClientRect().width : (startWidth / 2);
    }

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.pageX - startX;

      if (isDayGroup) {
        // Redimensionar el grupo de día y distribuir proporcionalmente a Inicio y Fin
        const newTotalWidth = Math.max(minAllowed * 2, Math.round(startWidth + delta));
        const ratio = (startWidth > 0 && startWidth1 > 0) ? (startWidth1 / startWidth) : 0.5;
        const newW1 = Math.max(minAllowed, Math.round(newTotalWidth * ratio));
        const newW2 = Math.max(minAllowed, newTotalWidth - newW1);
        const actualTotal = newW1 + newW2;

        th.style.setProperty('width', `${actualTotal}px`, 'important');
        th.style.setProperty('min-width', `${actualTotal}px`, 'important');
        th.style.setProperty('max-width', `${actualTotal}px`, 'important');

        if (subTh1) {
          subTh1.style.setProperty('width', `${newW1}px`, 'important');
          subTh1.style.setProperty('min-width', `${newW1}px`, 'important');
          subTh1.style.setProperty('max-width', `${newW1}px`, 'important');
        }
        if (subTh2) {
          subTh2.style.setProperty('width', `${newW2}px`, 'important');
          subTh2.style.setProperty('min-width', `${newW2}px`, 'important');
          subTh2.style.setProperty('max-width', `${newW2}px`, 'important');
        }

        aplicarAnchoColumna(table, col1, newW1);
        aplicarAnchoColumna(table, col2, newW2);
      } else {
        // Redimensionar columna individual (o subcolumna Inicio/Fin)
        const newWidth = Math.max(minAllowed, Math.round(startWidth + delta));
        th.style.setProperty('width', `${newWidth}px`, 'important');
        th.style.setProperty('min-width', `${newWidth}px`, 'important');
        th.style.setProperty('max-width', `${newWidth}px`, 'important');
        aplicarAnchoColumna(table, colIndex, newWidth);

        // Si es subcolumna de día, actualizar el encabezado del día padre
        const dayKey = th.getAttribute('data-day-col');
        if (dayKey) {
          const parentDayTh = table.querySelector(`thead th.header-day-group[data-day-col="${dayKey}"]`) ||
            table.querySelector(`thead th.header-day-group[data-col="${dayKey}"]`);
          const isIni = th.getAttribute('data-col')?.endsWith('_ini');
          const siblingCol = isIni ? `${dayKey}_fin` : `${dayKey}_ini`;
          const siblingTh = table.querySelector(`thead th.header-sub[data-col="${siblingCol}"]`);
          const siblingWidth = siblingTh ? siblingTh.getBoundingClientRect().width : newWidth;
          const totalDayWidth = Math.round(newWidth + siblingWidth);

          if (parentDayTh) {
            parentDayTh.style.setProperty('width', `${totalDayWidth}px`, 'important');
            parentDayTh.style.setProperty('min-width', `${totalDayWidth}px`, 'important');
            parentDayTh.style.setProperty('max-width', `${totalDayWidth}px`, 'important');
          }
        }
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('cs-is-resizing');
      resizer.classList.remove('resizing');
      guardarAnchosColumnas();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function guardarAnchosColumnas() {
  let widths = {};
  try {
    const raw = localStorage.getItem('nyp_admin_col_widths');
    if (raw) widths = JSON.parse(raw) || {};
  } catch (e) {
    widths = {};
  }

  const tables = document.querySelectorAll('.cs-table');
  tables.forEach(table => {
    const headers = table.querySelectorAll('thead th');
    headers.forEach((th, idx) => {
      const colKey = th.getAttribute('data-col') || `col_${idx}`;
      if (th.style.width) {
        widths[colKey] = parseInt(th.style.width, 10);
      }
    });
  });
  try {
    localStorage.setItem('nyp_admin_col_widths', JSON.stringify(widths));
  } catch (e) {
    console.warn("No se pudieron guardar anchos de columnas:", e);
  }
}

function restaurarAnchosColumnas(targetTable) {
  let widths = null;
  try {
    const raw = localStorage.getItem('nyp_admin_col_widths');
    if (raw) widths = JSON.parse(raw);
  } catch (e) { }

  if (!widths) return;

  const tables = targetTable ? [targetTable] : document.querySelectorAll('.cs-table');
  tables.forEach(table => {
    // 1. Restaurar subencabezados (Inicio/Fin) y columnas directas
    const headers = table.querySelectorAll('thead th:not(.header-day-group)');
    headers.forEach((th, idx) => {
      const colKey = th.getAttribute('data-col') || `col_${idx}`;
      if (widths[colKey]) {
        const w = widths[colKey];
        th.style.setProperty('width', `${w}px`, 'important');
        th.style.setProperty('min-width', `${w}px`, 'important');
        th.style.setProperty('max-width', `${w}px`, 'important');

        const colIndex = getThColumnIndex(th);
        aplicarAnchoColumna(table, colIndex, w);
      }
    });

    // 2. Ajustar encabezados agrupados de día (Lunes-Domingo) para que coincidan con la suma de Inicio + Fin
    const dayHeaders = table.querySelectorAll('thead th.header-day-group');
    dayHeaders.forEach(dayTh => {
      const dayKey = dayTh.getAttribute('data-day-col') || dayTh.getAttribute('data-col');
      if (dayKey) {
        const subIni = table.querySelector(`thead th.header-sub[data-col="${dayKey}_ini"]`);
        const subFin = table.querySelector(`thead th.header-sub[data-col="${dayKey}_fin"]`);
        const wIni = subIni ? (parseInt(subIni.style.width, 10) || subIni.getBoundingClientRect().width) : 0;
        const wFin = subFin ? (parseInt(subFin.style.width, 10) || subFin.getBoundingClientRect().width) : 0;
        if (wIni > 0 && wFin > 0) {
          const totalDayW = Math.round(wIni + wFin);
          dayTh.style.setProperty('width', `${totalDayW}px`, 'important');
          dayTh.style.setProperty('min-width', `${totalDayW}px`, 'important');
          dayTh.style.setProperty('max-width', `${totalDayW}px`, 'important');
        }
      }
    });
  });
}

function initColumnResize(targetTable) {
  const tables = targetTable ? [targetTable] : document.querySelectorAll('.cs-table');
  tables.forEach(table => {
    const headers = table.querySelectorAll('thead th');
    headers.forEach((th) => {
      if (!th.querySelector('.cs-resizer')) {
        const resizer = document.createElement('div');
        resizer.className = 'cs-resizer';
        resizer.title = 'Arrastra para ajustar ancho';
        th.appendChild(resizer);
        attachResizerEvents(th, resizer);
      }
    });
  });

  restaurarAnchosColumnas(targetTable);
}

/**
 * Inicializador principal de la interfaz de Control de Servicios
 */
function initControlServiciosUI() {
  const csView = document.getElementById('adminControlServiciosView');
  const esStandalone = document.body.classList.contains('cs-wrapper');
  if (esStandalone || (csView && csView.style.display !== 'none')) {
    document.body.classList.add('en-control-servicios');
    document.documentElement.classList.add('en-control-servicios');
  }

  initMatrizServicios();
  actualizarSelectorCiudadUI();
  initSearchFilter();
  initChipFilters();
  initCheckboxInteractions();
  initRowContextMenu();
  initOverscrollPrevention();
  initColumnResize();
  initMatrixZoom();
  initCustomAutocompleteDropdown();
  cargarColumnasOcultas();

  // Precarga asíncrona de clientes (fijos y eventuales) y niñeras de Supabase
  cargarClientesSupabase();
  cargarClientesEventualesSupabase(false, true);
  cargarNannysSupabase();

  // Activar suscripción Realtime para detectar cambios automáticos en clientes y niñeras
  initAdminRealtimeSubscriptions();
}

let _realtimeClientesNannysChannel = null;

/**
  * Suscribe el panel admin a cambios en vivo (Realtime) en las tablas de 'clientes' y 'nannys'
  */
function aplicarUpdateClienteEnAdmin(detail) {
  if (!detail) return;
  const targetEmail = ((typeof detail === 'string' ? detail : detail.email) || '').toLowerCase().trim();
  if (!targetEmail) return;

  if (typeof detail === 'object') {
    const valMascotas = detail.mascotas || detail['no._de_mascotas'] || detail['no. de mascotas'];
    if (valMascotas !== undefined) {
      detail.mascotas = valMascotas;
      detail['no._de_mascotas'] = valMascotas;
      detail['no. de mascotas'] = valMascotas;
    }

    const idx = _cacheClientesCS.findIndex(c => (c.email || '').toLowerCase().trim() === targetEmail);
    if (idx >= 0) {
      _cacheClientesCS[idx] = Object.assign({}, _cacheClientesCS[idx], detail);
    } else {
      _cacheClientesCS.push(detail);
      _cacheClientesCS.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }
    actualizarDatalistsAutocompletado();
    const hasActiveFilters = (document.getElementById('csSearchClientes')?.value ||
      document.getElementById('csFiltroCiudadClientes')?.value ||
      document.getElementById('csFiltroStatusClientes')?.value);
    if (hasActiveFilters) {
      filtrarClientesSupabase();
    } else {
      renderizarClientes(_cacheClientesCS);
    }

    const countEl = document.getElementById('csClientesCount');
    if (countEl) {
      countEl.textContent = `${_cacheClientesCS.length} clientes`;
    }

    // Refrescar modal de ficha del Peque si está visible para este cliente
    const modalPeque = document.getElementById('modalDetallePeque');
    if (modalPeque && modalPeque.style.display === 'flex') {
      const modFamiliaText = (document.getElementById('modPequeFamilia')?.textContent || '').toLowerCase();
      if (modFamiliaText.includes(targetEmail)) {
        const cliIdx = _cacheClientesCS.findIndex(c => (c.email || '').toLowerCase().trim() === targetEmail);
        if (cliIdx >= 0) {
          const modNombre = document.getElementById('modPequeNombre')?.textContent || '';
          const cli = _cacheClientesCS[cliIdx];
          let numPeque = 1;
          if (cli.peque_nombre_2 === modNombre) numPeque = 2;
          else if (cli.peque_nombre_3 === modNombre) numPeque = 3;
          abrirModalPeque(cliIdx, numPeque);
        }
      }
    }
  }

  // Refrescar también la matriz de Servicios y vista de cliente si están activas
  if (typeof cargarMatrizServiciosSupabase === 'function' && _currentSemanaMatrizIso) {
    try { cargarMatrizServiciosSupabase(_currentSemanaMatrizIso); } catch (e) { }
  }
  if (typeof window.cargarServiciosCliente === 'function') {
    try { window.cargarServiciosCliente(true); } catch (e) { }
  }
}

function aplicarUpdateNannyEnAdmin(detail) {
  if (!detail) return;
  const targetEmail = ((typeof detail === 'string' ? detail : detail.email) || '').toLowerCase().trim();
  if (!targetEmail) return;

  if (typeof detail === 'object') {
    const idx = _cacheNannysCS.findIndex(n => (n.email || '').toLowerCase().trim() === targetEmail);
    if (idx >= 0) {
      _cacheNannysCS[idx] = Object.assign({}, _cacheNannysCS[idx], detail);
    } else {
      _cacheNannysCS.push(detail);
      _cacheNannysCS.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
    }
    actualizarDatalistsAutocompletado();
    const hasActiveFilters = (document.getElementById('csSearchNannys')?.value ||
      document.getElementById('csFiltroCiudadNannys')?.value ||
      document.getElementById('csFiltroStatusNannys')?.value);
    if (hasActiveFilters) {
      filtrarNannysSupabase();
    } else {
      renderizarNannys(_cacheNannysCS);
    }
  }

  // Refrescar también la matriz de Servicios si está activa
  if (typeof cargarMatrizServiciosSupabase === 'function' && _currentSemanaMatrizIso) {
    try { cargarMatrizServiciosSupabase(_currentSemanaMatrizIso); } catch (e) { }
  }
}

/**
  * Suscribe el panel admin a cambios en vivo (Realtime) en las tablas de 'clientes' y 'nannys'
  */
function initAdminRealtimeSubscriptions() {
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

  // 1. Suscripción Supabase Realtime (Recepción Push puntual por WebSockets, 0 peticiones polling)
  if (client && typeof client.channel === 'function' && !_realtimeClientesNannysChannel) {
    try {
      _realtimeClientesNannysChannel = client
        .channel('rt_admin_clientes_nannys')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, (payload) => {
          console.log('⚡ [Realtime Admin] Cambio puntual Push en clientes:', payload);
          if (payload.new && payload.new.email) {
            aplicarUpdateClienteEnAdmin(payload.new);
          } else {
            cargarClientesSupabase(true, true);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'nannys' }, (payload) => {
          console.log('⚡ [Realtime Admin] Cambio puntual Push en nannys:', payload);
          if (payload.new && payload.new.email) {
            aplicarUpdateNannyEnAdmin(payload.new);
          } else {
            cargarNannysSupabase(true, true);
          }
        })
        .subscribe((status) => {
          console.log(`⚡ [Realtime Admin] Canal suscrito (clientes y niñeras): ${status}`);
        });
    } catch (eRealtime) {
      console.warn('Nota iniciando canal realtime clientes/nannys:', eRealtime);
    }
  }

  // 2. BroadcastChannel inter-pestañas (Mensajes directos en memoria del navegador sin red)
  if (typeof BroadcastChannel !== 'undefined' && !window._bcAdminClientesNannys) {
    try {
      window._bcAdminClientesNannys = new BroadcastChannel('nyp_admin_sync_channel');
      window._bcAdminClientesNannys.onmessage = (event) => {
        console.log('⚡ [BroadcastChannel Admin] Mensaje local recibido:', event.data);
        if (event.data?.semana_iso === '__PLANTILLA_BASE__') {
          if (typeof manejarCambioRealtimePlantillaBase === 'function') {
            manejarCambioRealtimePlantillaBase({
              eventType: event.data.action === 'delete' ? 'DELETE' : (event.data.servicio ? 'UPDATE' : 'INSERT'),
              new: event.data.servicio || (event.data.action !== 'delete' ? { id: event.data.servicio_id } : null),
              old: event.data.action === 'delete' ? { id: event.data.servicio_id } : null
            });
          }
        }
        if (event.data?.type === 'cliente_actualizado') {
          if (event.data.detail) aplicarUpdateClienteEnAdmin(event.data.detail);
          setTimeout(() => cargarClientesSupabase(true, true), 300);
        } else if (event.data?.type === 'nanny_actualizada') {
          if (event.data.detail) aplicarUpdateNannyEnAdmin(event.data.detail);
          setTimeout(() => cargarNannysSupabase(true, true), 300);
        }
      };
    } catch (eBc) {
      console.warn('Nota BroadcastChannel admin:', eBc);
    }
  }

  // 3. Listener del evento 'storage' para sincronización en segundo plano entre pestañas del navegador
  if (!window._storageSyncListenerSet) {
    window._storageSyncListenerSet = true;
    window.addEventListener('storage', (e) => {
      if (e.key === 'nyp_admin_sync_trigger' || e.key === 'nyp_servicios_sync_trigger') {
        try {
          const data = JSON.parse(e.newValue);
          console.log('⚡ [Storage Event Admin] Sync detectado:', data);
          if (data?.semana_iso === '__PLANTILLA_BASE__') {
            if (typeof manejarCambioRealtimePlantillaBase === 'function') {
              manejarCambioRealtimePlantillaBase({
                eventType: data.action === 'delete' ? 'DELETE' : (data.servicio ? 'UPDATE' : 'INSERT'),
                new: data.servicio || (data.action !== 'delete' ? { id: data.servicio_id } : null),
                old: data.action === 'delete' ? { id: data.servicio_id } : null
              });
            }
          }
          if (data?.type === 'cliente_actualizado') {
            if (data.detail) aplicarUpdateClienteEnAdmin(data.detail);
            setTimeout(() => cargarClientesSupabase(true, true), 300);
          } else if (data?.type === 'nanny_actualizada') {
            if (data.detail) aplicarUpdateNannyEnAdmin(data.detail);
            setTimeout(() => cargarNannysSupabase(true, true), 300);
          }
        } catch (err) { }
      }
    });
  }

  // 4. Escuchar eventos globales dentro de la misma ventana
  if (!window._listenersAdminClientesNannysSet) {
    window._listenersAdminClientesNannysSet = true;
    window.addEventListener('nyp_cliente_actualizado', (ev) => {
      console.log('⚡ [Evento local] Cliente actualizado, refrescando tabla admin...');
      if (ev.detail) aplicarUpdateClienteEnAdmin(ev.detail);
      setTimeout(() => cargarClientesSupabase(true, true), 300);
    });

    window.addEventListener('nyp_nanny_actualizada', (ev) => {
      console.log('⚡ [Evento local] Niñera actualizada, refrescando tabla admin...');
      if (ev.detail) aplicarUpdateNannyEnAdmin(ev.detail);
      setTimeout(() => cargarNannysSupabase(true, true), 300);
    });
  }

  // 5. Refresco puntual SOLO cuando el usuario regresa activamente a la pestaña del navegador
  if (!window._visibilityAdminListenerSet) {
    window._visibilityAdminListenerSet = true;
    const triggerAdminRefresh = () => {
      initAdminRealtimeSubscriptions();
      const panelClientes = document.getElementById('panelClientes');
      const panelNanny = document.getElementById('panelNanny');

      if (panelClientes && !panelClientes.classList.contains('hidden')) {
        cargarClientesSupabase(true, true);
      } else if (panelNanny && !panelNanny.classList.contains('hidden')) {
        cargarNannysSupabase(true, true);
      }
    };
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') triggerAdminRefresh();
    });
    window.addEventListener('focus', triggerAdminRefresh);
  }
}

window.initAdminRealtimeSubscriptions = initAdminRealtimeSubscriptions;
window.initControlServiciosUI = initControlServiciosUI;
window.initMatrizServicios = initMatrizServicios;
window.initColumnResize = initColumnResize;
window.guardarAnchosColumnas = guardarAnchosColumnas;
window.restaurarAnchosColumnas = restaurarAnchosColumnas;
window.insertarFilaServicioEn = insertarFilaServicioEn;
window.agregarFilaServicio = agregarFilaServicio;
window.agregarFilaEnBloque = agregarFilaEnBloque;
window.duplicarFilaServicio = duplicarFilaServicio;
window.iniciarArrastreFila = iniciarArrastreFila;
window.abrirMenuFila = abrirMenuFila;
window.cerrarMenuFila = cerrarMenuFila;
window.aplicarColorCelda = aplicarColorCelda;
window.CS_PALETA_FONDOS = CS_PALETA_FONDOS;
window.CS_PALETA_TEXTOS = CS_PALETA_TEXTOS;
window.initRowContextMenu = initRowContextMenu;
window.eliminarFilaServicio = eliminarFilaServicio;
window.BLOQUES_SERVICIOS = BLOQUES_SERVICIOS;
window.BLOQUES_PERSISTENTES_FUTURO = BLOQUES_PERSISTENTES_FUTURO;
window.handleClienteInputChange = handleClienteInputChange;
window.handleClienteSelectChange = handleClienteSelectChange;
window.handleNannyInputChange = handleNannyInputChange;
window.handleServiceSelectChange = handleServiceSelectChange;
window.handleTimeInput = handleTimeInput;
window.handleTimeKeypress = handleTimeKeypress;
window.handleTimeInputEvent = handleTimeInputEvent;
window.handleTimeFocus = handleTimeFocus;
window.handleTimeBlur = handleTimeBlur;
window.handleTimeKeydown = handleTimeKeydown;
window.obtenerDatosMatrizServicios = obtenerDatosMatrizServicios;
window.guardarMatrizLocal = guardarMatrizLocal;
window.guardarMatrizSupabase = guardarMatrizSupabase;
window.cargarMatrizServiciosSupabase = cargarMatrizServiciosSupabase;
window.notificarCambioFila = notificarCambioFila;
window.handleAlertaInput = handleAlertaInput;
window.actualizarContadoresFiltros = actualizarContadoresFiltros;
window.actualizarDatalistsAutocompletado = actualizarDatalistsAutocompletado;
window.sincronizarAsistenciaMatrizEnVivo = sincronizarAsistenciaMatrizEnVivo;
window.iniciarSincronizacionAsistenciaEnVivo = iniciarSincronizacionAsistenciaEnVivo;
window.deshacerUltimoCambio = deshacerUltimoCambio;
window.rehacerUltimoCambio = rehacerUltimoCambio;
window.capturarEstadoPrevioAntesDeAccion = capturarEstadoPrevioAntesDeAccion;
window.actualizarBotonesDeshacerRehacer = actualizarBotonesDeshacerRehacer;
window.CS_COLUMNAS_MATRIZ = CS_COLUMNAS_MATRIZ;
window.ocultarColumnaMatriz = ocultarColumnaMatriz;
window.desocultarColumnaMatriz = desocultarColumnaMatriz;
window.restablecerTodasLasColumnas = restablecerTodasLasColumnas;
window.abrirModalGestionColumnas = abrirModalGestionColumnas;
window.cerrarModalGestionColumnas = cerrarModalGestionColumnas;
window.abrirMenuColumna = abrirMenuColumna;
window.cerrarMenuColumna = cerrarMenuColumna;
window.cargarColumnasOcultas = cargarColumnasOcultas;
window.aplicarColumnasOcultas = aplicarColumnasOcultas;
window.switchClientesSubTab = switchClientesSubTab;
window.cargarClientesEventualesSupabase = cargarClientesEventualesSupabase;
window.renderizarClientesEventuales = renderizarClientesEventuales;

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar suscripciones en vivo siempre para sincronizar automáticamente el panel de admin
  if (typeof initAdminRealtimeSubscriptions === 'function') {
    initAdminRealtimeSubscriptions();
  }
  // Solo inicializar automáticamente si estamos en la página dedicada standalone control_servicios.html
  if (document.body.classList.contains('cs-wrapper')) {
    initControlServiciosUI();
  }
});


/**
 * Alterna entre las vistas principales desde el menú flotante inferior (Servicios, Clientes, Niñeras)
 */
function switchMainTab(tabName) {
  const panels = document.querySelectorAll('.cs-view-panel');
  panels.forEach(p => p.classList.add('hidden'));

  const navBtns = document.querySelectorAll('.cs-nav-tab-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  // 🎯 El header con filtros de servicios solo se muestra en la pestaña 'servicios'
  const csHeaders = document.querySelectorAll('#adminControlServiciosView > .cs-header, body.cs-wrapper > .cs-header');
  csHeaders.forEach(h => {
    h.style.display = (tabName === 'servicios') ? 'flex' : 'none';
  });

  if (tabName === 'servicios') {
    const el = document.getElementById('panelServicios');
    if (el) el.classList.remove('hidden');
    document.getElementById('tabBtnServicios')?.classList.add('active');
    initColumnResize();
  } else if (tabName === 'clientes') {
    const el = document.getElementById('panelClientes');
    if (el) el.classList.remove('hidden');
    document.getElementById('tabBtnClientes')?.classList.add('active');
    initColumnResize();
    // Forzar actualización inmediata silenciosa al cambiar a la pestaña clientes
    if (_subTabClientesActual === 'eventuales') {
      cargarClientesEventualesSupabase(true, true);
    } else {
      cargarClientesSupabase(true, true);
    }
  } else if (tabName === 'nanny') {
    const el = document.getElementById('panelNanny');
    if (el) el.classList.remove('hidden');
    document.getElementById('tabBtnNanny')?.classList.add('active');
    initColumnResize();
    // Forzar actualización inmediata silenciosa al cambiar a la pestaña niñeras
    cargarNannysSupabase(true, true);
  }
}

window.switchMainTab = switchMainTab;

/**
 * Carga clientes directamente desde Supabase sin parpadeos visuales
 */
async function cargarClientesSupabase(force = false, silent = false) {
  const tbody = document.getElementById('csClientesTableBody');
  const countEl = document.getElementById('csClientesCount');
  if (!tbody) return;

  if (!silent && _cacheClientesCS.length === 0) {
    tbody.innerHTML = '<tr class="cs-loading-row"><td colspan="7">Cargando clientes de Supabase... ⏳</td></tr>';
  }

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) {
      if (_cacheClientesCS.length === 0) {
        tbody.innerHTML = '<tr class="cs-loading-row"><td colspan="7">⚠️ Cliente Supabase no inicializado</td></tr>';
      }
      return;
    }

    // Asegurar que el canal en vivo esté conectado una vez que Supabase está disponible
    initAdminRealtimeSubscriptions();

    const { data: clientes, error } = await client
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    const nuevosClientes = clientes || [];

    // Si los datos son idénticos a los almacenados y no es forzado directo, omitir re-renderizado para evitar parpadeos
    if (!force && JSON.stringify(nuevosClientes) === JSON.stringify(_cacheClientesCS)) {
      return;
    }

    _cacheClientesCS = nuevosClientes;
    window._cacheClientesCS = _cacheClientesCS;
    actualizarDatalistsAutocompletado();

    const hasActiveFilters = (document.getElementById('csSearchClientes')?.value ||
      document.getElementById('csFiltroCiudadClientes')?.value ||
      document.getElementById('csFiltroStatusClientes')?.value);

    if (hasActiveFilters) {
      filtrarClientesSupabase();
    } else {
      renderizarClientes(_cacheClientesCS);
      if (countEl) {
        countEl.textContent = `${_cacheClientesCS.length} clientes`;
      }
    }
  } catch (err) {
    console.error("❌ Error cargando clientes:", err);
    if (_cacheClientesCS.length === 0) {
      tbody.innerHTML = `<tr class="cs-loading-row"><td colspan="7" style="color:#b91c1c;">Error al cargar clientes: ${_csEscapeHTML(err.message)}</td></tr>`;
    }
  }
}
window.cargarClientesSupabase = cargarClientesSupabase;

/**
 * Formatea fechas ISO a formato legible
 */
function formatearFechaCS(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return isoStr;
  }
}

/**
 * Pinta los clientes en la tabla con todas las columnas y fichas interactivas
 */
function renderizarClientes(lista) {
  const tbody = document.getElementById('csClientesTableBody');
  if (!tbody) return;

  if (!lista || lista.length === 0) {
    tbody.innerHTML = '<tr class="cs-loading-row"><td colspan="10">No se encontraron clientes</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map((cli) => {
    // Buscar índice real en _cacheClientesCS para los modales
    const realIndex = _cacheClientesCS.indexOf(cli);

    const inicial = (cli.nombre || cli.email || '?').charAt(0).toUpperCase();
    const avatarHtml = cli.foto
      ? `<img src="${cli.foto}" class="cs-avatar-img" alt="Foto" onerror="this.outerHTML='<div class=\\'cs-avatar-placeholder\\'>${inicial}</div>'">`
      : `<div class="cs-avatar-placeholder">${inicial}</div>`;

    const telLimpio = cli.telefono ? cli.telefono.replace(/\D/g, '') : '';
    const telHtml = cli.telefono
      ? `<a href="https://wa.me/52${telLimpio}" target="_blank" class="cs-tel-chip" title="Enviar WhatsApp">💬 ${cli.telefono}</a>`
      : '<span class="text-muted">—</span>';

    const emergHtml = cli.emergencia || '<span class="text-muted">—</span>';
    const fechaCreacionHtml = formatearFechaCS(cli.creado_en);
    const fechaEdicionPequeHtml = formatearFechaCS(cli.fecha_edicion_peque);

    // Políticas de contratación: solo mostrar la fecha/texto en que se aceptaron, sin ser clickeable
    const politicasHtml = cli.politicas_contratacion
      ? `<span style="color:#475569; font-weight:600; font-size:0.78rem;">${cli.politicas_contratacion}</span>`
      : '<span class="text-muted">—</span>';

    let ubiHtml = cli.direccion || '—';
    if (cli.ubicacion && cli.ubicacion.startsWith('http')) {
      ubiHtml += ` <a href="${cli.ubicacion}" target="_blank" class="cs-maps-link" title="Ver en Google Maps">📍 Ver mapa</a>`;
    }

    // Peques con el diseño original de etiquetas rosaditas pero clickeables para abrir ficha con edad calculada automáticamente
    const peques = [];
    if (cli.peque_nombre) {
      const edad1 = typeof calcularEdadPeque === 'function' ? (calcularEdadPeque(cli.peque_nacimiento) || cli.peque_edad) : cli.peque_edad;
      peques.push(`<span class="cs-peque-tag" style="cursor:pointer;" onclick="abrirModalPeque(${realIndex}, 1)" title="Clic para ver ficha médica">👶 ${cli.peque_nombre}${edad1 ? ` (${edad1})` : ''}</span>`);
    }
    if (cli.peque_nombre_2) {
      const edad2 = typeof calcularEdadPeque === 'function' ? (calcularEdadPeque(cli.peque_nacimiento_2) || cli.peque_edad_2) : cli.peque_edad_2;
      peques.push(`<span class="cs-peque-tag" style="cursor:pointer;" onclick="abrirModalPeque(${realIndex}, 2)" title="Clic para ver ficha médica">👶 ${cli.peque_nombre_2}${edad2 ? ` (${edad2})` : ''}</span>`);
    }
    if (cli.peque_nombre_3) {
      const edad3 = typeof calcularEdadPeque === 'function' ? (calcularEdadPeque(cli.peque_nacimiento_3) || cli.peque_edad_3) : cli.peque_edad_3;
      peques.push(`<span class="cs-peque-tag" style="cursor:pointer;" onclick="abrirModalPeque(${realIndex}, 3)" title="Clic para ver ficha médica">👶 ${cli.peque_nombre_3}${edad3 ? ` (${edad3})` : ''}</span>`);
    }

    const pequesHtml = peques.length > 0
      ? peques.join(' ')
      : '<span class="text-muted">Sin peques</span>';

    const esActivo = cli.activo !== false;
    const estaMigrado = !!(cli.auth_user_id && String(cli.auth_user_id).trim() !== '');
    const authBadgeHtml = estaMigrado
      ? `<span class="cs-auth-badge cs-auth-migrado" title="✅ Perfil 100% migrado a Supabase Auth (Ha iniciado sesión con el nuevo sistema)"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Supabase</span>`
      : `<span class="cs-auth-badge cs-auth-pendiente" title="⏳ Sin credenciales de Supabase Auth aún (Pendiente de primer login o generar contraseña)"><span class="cs-auth-dot"></span> Pendiente</span>`;

    const statusHtml = `
      <div class="cs-cell-status-wrapper">
        <select class="cs-cell-status-select ${esActivo ? 'status-active' : 'status-inactive'}" 
          onchange="actualizarStatusCliente(this, '${cli.email}')" title="Cambiar estado del cliente">
          <option value="true" ${esActivo ? 'selected' : ''}>🟢 Activo</option>
          <option value="false" ${!esActivo ? 'selected' : ''}>🔴 Inactivo</option>
        </select>
        <span class="cs-save-indicator" style="display:none;">✅</span>
      </div>
    `;

    // Ciudad editable: Selector desplegable para asignar Puebla, Xalapa, Querétaro, CDMX
    const ciudadActual = cli.ciudad || '';
    const ciudadHtml = `
      <div class="cs-cell-city-wrapper">
        <select class="cs-cell-city-select" onchange="actualizarCiudadCliente(this, '${cli.email}')" title="Asignar ciudad">
          <option value="" ${!ciudadActual ? 'selected' : ''}>— Asignar —</option>
          <option value="Puebla" ${ciudadActual === 'Puebla' ? 'selected' : ''}>Puebla</option>
          <option value="Xalapa" ${ciudadActual === 'Xalapa' ? 'selected' : ''}>Xalapa</option>
          <option value="Querétaro" ${ciudadActual === 'Querétaro' ? 'selected' : ''}>Querétaro</option>
          <option value="CDMX" ${ciudadActual === 'CDMX' ? 'selected' : ''}>CDMX</option>
        </select>
        <span class="cs-save-indicator" style="display:none;">✅</span>
      </div>
    `;

    return `
      <tr>
        <td>
          <div class="cs-user-cell">
            ${avatarHtml}
            <div class="cs-user-info">
              <div class="cs-user-name-row">
                <span class="cs-user-name">${cli.nombre || 'Sin nombre'}</span>
                ${authBadgeHtml}
              </div>
              <span class="cs-user-email">${cli.email}</span>
            </div>
          </div>
        </td>
        <td>${statusHtml}</td>
        <td>${ciudadHtml}</td>
        <td><span style="color:#64748b; font-weight:600;">${fechaCreacionHtml}</span></td>
        <td>${telHtml}</td>
        <td>${emergHtml}</td>
        <td>${politicasHtml}</td>
        <td><span style="color:#64748b; font-size:0.75rem;">${fechaEdicionPequeHtml}</span></td>
        <td>${pequesHtml}</td>
        <td>${ubiHtml}</td>
        <td>${cli.mascotas || cli['no._de_mascotas'] || cli['no. de mascotas'] || '—'}</td>
      </tr>
    `;
  }).join('');

  const table = tbody.closest('table');
  if (table) initColumnResize(table);
}

/**
 * Guarda la ciudad seleccionada directamente en Supabase y actualiza el caché local
 */
async function actualizarCiudadCliente(selectEl, email) {
  const nuevaCiudad = selectEl.value;
  const wrapper = selectEl.closest('.cs-cell-city-wrapper');
  const indicator = wrapper?.querySelector('.cs-save-indicator');

  selectEl.style.opacity = '0.6';
  selectEl.disabled = true;

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error("Cliente de Supabase no disponible");

    const { error } = await client
      .from('clientes')
      .update({ ciudad: nuevaCiudad || null })
      .eq('email', email);

    if (error) throw error;

    // Actualizar en el caché en memoria
    const cli = _cacheClientesCS.find(c => c.email === email);
    if (cli) {
      cli.ciudad = nuevaCiudad || null;
    }

    // Micro-feedback visual de éxito
    selectEl.classList.add('saved');
    if (indicator) {
      indicator.style.display = 'inline-block';
      setTimeout(() => {
        indicator.style.display = 'none';
        selectEl.classList.remove('saved');
      }, 1600);
    }
  } catch (err) {
    console.error("❌ Error actualizando ciudad del cliente:", err);
    alert("No se pudo guardar la ciudad en Supabase: " + err.message);
  } finally {
    selectEl.style.opacity = '1';
    selectEl.disabled = false;
  }
}
window.actualizarCiudadCliente = actualizarCiudadCliente;

/**
 * Guarda la ciudad seleccionada en clientes_eventuales y actualiza el caché local
 */
async function actualizarCiudadClienteEventual(selectEl, id) {
  const nuevaCiudad = selectEl.value;
  const wrapper = selectEl.closest('.cs-cell-city-wrapper');
  const indicator = wrapper?.querySelector('.cs-save-indicator');

  selectEl.style.opacity = '0.6';
  selectEl.disabled = true;

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error("Cliente de Supabase no disponible");

    const { error } = await client
      .from('clientes_eventuales')
      .update({ ciudad: nuevaCiudad || null, actualizado_en: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    const cli = _cacheClientesEventualesCS.find(c => c.id === id);
    if (cli) {
      cli.ciudad = nuevaCiudad || null;
    }

    selectEl.classList.add('saved');
    if (indicator) {
      indicator.style.display = 'inline-block';
      setTimeout(() => {
        indicator.style.display = 'none';
        selectEl.classList.remove('saved');
      }, 1600);
    }
  } catch (err) {
    console.error("❌ Error actualizando ciudad del cliente eventual:", err);
    alert("No se pudo guardar la ciudad en Supabase: " + err.message);
  } finally {
    selectEl.style.opacity = '1';
    selectEl.disabled = false;
  }
}
window.actualizarCiudadClienteEventual = actualizarCiudadClienteEventual;

/**
 * Alterna entre la sub-pestaña "Fijos" y "Eventuales" dentro de la sección Clientes
 */
function switchClientesSubTab(subTab) {
  _subTabClientesActual = subTab;

  const btnFijos = document.getElementById('btnSubTabClientesFijos');
  const btnEventuales = document.getElementById('btnSubTabClientesEventuales');
  const gridFijos = document.getElementById('csGridClientesFijos');
  const gridEventuales = document.getElementById('csGridClientesEventuales');
  const ddStatus = document.getElementById('ddFiltroStatusClientes');
  const countEl = document.getElementById('csClientesCount');

  if (subTab === 'fijos') {
    if (btnFijos) btnFijos.classList.add('active');
    if (btnEventuales) btnEventuales.classList.remove('active');
    if (gridFijos) gridFijos.style.display = '';
    if (gridEventuales) gridEventuales.style.display = 'none';
    if (ddStatus) ddStatus.style.display = '';
    filtrarClientesSupabase();
    initColumnResize();
  } else if (subTab === 'eventuales') {
    if (btnEventuales) btnEventuales.classList.add('active');
    if (btnFijos) btnFijos.classList.remove('active');
    if (gridFijos) gridFijos.style.display = 'none';
    if (gridEventuales) gridEventuales.style.display = '';
    if (ddStatus) ddStatus.style.display = 'none';
    if (_cacheClientesEventualesCS.length === 0) {
      cargarClientesEventualesSupabase(true, false);
    } else {
      filtrarClientesSupabase();
    }
    initColumnResize();
  }
}
window.switchClientesSubTab = switchClientesSubTab;

/**
 * Depura y fusiona automáticamente duplicados y registros incompletos de clientes eventuales en la base de datos
 */
async function depurarDuplicadosClientesEventuales(lista) {
  if (!lista || lista.length === 0) return lista;
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client) return lista;

  const idsAEliminar = [];
  const listaValida = [];

  // 1. Identificar registros huérfanos/fantasmas (sin teléfono y sin email) que hayan quedado de escrituras incompletas previas
  for (const cli of lista) {
    const hasTel = cli.telefono && cli.telefono.replace(/\D/g, '').length >= 7;
    const hasEmail = cli.email && cli.email.trim().length > 0;
    const nomNorm = normalizarTextoCS(cli.nombre || '');

    // Si no tiene teléfono ni email:
    if (!hasTel && !hasEmail) {
      // Si existe otro cliente con nombre que coincida o empiece con este nombre pero que sí tenga teléfono o email, eliminar el incompleto
      const existeCompleto = lista.some(otro =>
        otro.id !== cli.id &&
        (otro.telefono || otro.email) &&
        otro.nombre &&
        (normalizarTextoCS(otro.nombre) === nomNorm || normalizarTextoCS(otro.nombre).startsWith(nomNorm))
      );
      if (existeCompleto || nomNorm.length < 4) {
        idsAEliminar.push(cli.id);
        continue;
      }
    }
    listaValida.push(cli);
  }

  // 2. Agrupar y consolidar duplicados entre los registros válidos
  const grupos = new Map();
  const promesasUpdate = [];
  const resultadoFinal = [];

  for (const cli of listaValida) {
    const keyEmail = (cli.email || '').trim().toLowerCase();
    const keyTel = (cli.telefono || '').trim().replace(/\D/g, '');
    const keyNom = normalizarTextoCS(cli.nombre || '');

    let key = '';
    if (keyEmail) key = 'e:' + keyEmail;
    else if (keyTel && keyTel.length >= 7) key = 't:' + keyTel;
    else if (keyNom) key = 'n:' + keyNom;
    else key = 'id:' + cli.id;

    if (!grupos.has(key)) {
      grupos.set(key, [cli]);
    } else {
      grupos.get(key).push(cli);
    }
  }

  let huboCambios = idsAEliminar.length > 0;
  for (const [key, items] of grupos.entries()) {
    if (items.length === 1) {
      resultadoFinal.push(items[0]);
    } else {
      huboCambios = true;
      const principal = { ...items[0] };
      const otros = items.slice(1);

      for (const o of otros) {
        if (!principal.telefono && o.telefono) principal.telefono = o.telefono;
        if (!principal.email && o.email) principal.email = o.email;
        if (!principal.direccion && o.direccion) principal.direccion = o.direccion;
        if (!principal.ubicacion && o.ubicacion) principal.ubicacion = o.ubicacion;
        if (!principal.edad_peque && (o.edad_peque || o.peque_edad)) principal.edad_peque = o.edad_peque || o.peque_edad;
        if (!principal.notas && o.notas) principal.notas = o.notas;
        if ((!principal.ciudad || principal.ciudad === '') && o.ciudad) principal.ciudad = o.ciudad;
        idsAEliminar.push(o.id);
      }

      promesasUpdate.push(
        client.from('clientes_eventuales').update({
          nombre: principal.nombre,
          email: principal.email || '',
          telefono: principal.telefono || null,
          direccion: principal.direccion || null,
          ubicacion: principal.ubicacion || null,
          edad_peque: principal.edad_peque || null,
          peque_edad: principal.edad_peque || null,
          notas: principal.notas || null,
          ciudad: principal.ciudad || 'Puebla',
          actualizado_en: new Date().toISOString()
        }).eq('id', principal.id)
      );

      resultadoFinal.push(principal);
    }
  }

  if (huboCambios && client) {
    // Ejecutar limpieza remota en Supabase en segundo plano sin congelar la interfaz ni retrasar la carga
    (async () => {
      try {
        if (idsAEliminar.length > 0) {
          await client.from('clientes_eventuales').delete().in('id', idsAEliminar);
          console.log("🧹 [clientes_eventuales] Registros incompletos o duplicados depurados en segundo plano:", idsAEliminar.length);
        }
        if (promesasUpdate.length > 0) {
          await Promise.allSettled(promesasUpdate);
        }
      } catch (e) {
        console.warn("Aviso en depuración asíncrona de duplicados:", e);
      }
    })();
  }

  return resultadoFinal;
}

/**
 * Carga clientes eventuales directamente desde Supabase sin parpadeos visuales
 */
async function cargarClientesEventualesSupabase(force = false, silent = false) {
  const tbody = document.getElementById('csClientesEventualesTableBody');
  const countEl = document.getElementById('csClientesCount');
  if (!tbody) return;

  if (!silent && _cacheClientesEventualesCS.length === 0) {
    tbody.innerHTML = '<tr class="cs-loading-row"><td colspan="8">Cargando clientes eventuales de Supabase... ⏳</td></tr>';
  }

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) return;

    const { data: clientes, error } = await client
      .from('clientes_eventuales')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    let listaLimpia = clientes || [];
    // Depurar y consolidar duplicados automáticamente en la BD si existen
    if (listaLimpia.length > 1) {
      listaLimpia = await depurarDuplicadosClientesEventuales(listaLimpia);
    }

    if (!force && JSON.stringify(listaLimpia) === JSON.stringify(_cacheClientesEventualesCS)) {
      return;
    }

    _cacheClientesEventualesCS = listaLimpia;
    window._cacheClientesEventualesCS = _cacheClientesEventualesCS;
    actualizarDatalistsAutocompletado();

    if (_subTabClientesActual === 'eventuales') {
      const hasActiveFilters = (document.getElementById('csSearchClientes')?.value ||
        document.getElementById('csFiltroCiudadClientes')?.value);
      if (hasActiveFilters) {
        filtrarClientesSupabase();
      } else {
        renderizarClientesEventuales(_cacheClientesEventualesCS);
        if (countEl) {
          countEl.textContent = `${_cacheClientesEventualesCS.length} clientes eventuales`;
        }
      }
    }
  } catch (err) {
    console.error("❌ Error cargando clientes eventuales:", err);
    if (_cacheClientesEventualesCS.length === 0) {
      const isMissingTable = err.code === 'PGRST205' || (err.message && err.message.includes('clientes_eventuales'));
      if (isMissingTable) {
        tbody.innerHTML = `
          <tr class="cs-loading-row">
            <td colspan="8" style="padding: 24px; text-align: center;">
              <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 20px; max-width: 650px; margin: 0 auto; color: #92400E; font-size: 0.95rem; text-align: left;">
                <div style="display:flex; align-items:center; gap:10px; font-weight:700; font-size:1.05rem; margin-bottom: 8px;">
                  <span>⚠️</span>
                  <span>Tabla "clientes_eventuales" pendiente de crear en Supabase</span>
                </div>
                <p style="margin: 0 0 12px 0; line-height: 1.5; color: #78350F;">
                  Para habilitar la base de datos de clientes eventuales, por favor ejecuta el script SQL de creación en tu consola de <strong>Supabase &gt; SQL Editor</strong>.
                </p>
                <button type="button" onclick="window.copiarSqlClientesEventuales()" style="background: #E11D48; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                  📋 Copiar Script SQL de Clientes Eventuales
                </button>
              </div>
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = `<tr class="cs-loading-row"><td colspan="8" style="color:#b91c1c;">Error al cargar clientes eventuales: ${_csEscapeHTML(err.message)}</td></tr>`;
      }
    }
  }
}
window.cargarClientesEventualesSupabase = cargarClientesEventualesSupabase;

window.copiarSqlClientesEventuales = function () {
  const sql = `-- TABLA: clientes_eventuales (BASE DE DATOS DE CLIENTES EVENTUALES/TEMPORALES)
CREATE TABLE IF NOT EXISTS public.clientes_eventuales (
    id TEXT PRIMARY KEY DEFAULT ('ce_' || substr(md5(random()::text), 1, 16)),
    nombre TEXT NOT NULL,
    email TEXT DEFAULT '',
    telefono TEXT,
    ciudad TEXT DEFAULT '',
    direccion TEXT,
    ubicacion TEXT,
    peque_edad TEXT DEFAULT '',
    edad_peque TEXT DEFAULT '',
    notas TEXT,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar que email no sea NOT NULL si la tabla ya existía
ALTER TABLE public.clientes_eventuales ALTER COLUMN email DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_eventuales_email ON public.clientes_eventuales (email);
CREATE INDEX IF NOT EXISTS idx_clientes_eventuales_nombre ON public.clientes_eventuales (nombre);

ALTER TABLE public.clientes_eventuales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "RLS_SELECT_clientes_eventuales" ON public.clientes_eventuales;
CREATE POLICY "RLS_SELECT_clientes_eventuales" ON public.clientes_eventuales 
    FOR SELECT TO authenticated USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Permitir insercion clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "RLS_INSERT_clientes_eventuales" ON public.clientes_eventuales;
CREATE POLICY "RLS_INSERT_clientes_eventuales" ON public.clientes_eventuales 
    FOR INSERT TO authenticated WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Permitir update clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "RLS_UPDATE_clientes_eventuales" ON public.clientes_eventuales;
CREATE POLICY "RLS_UPDATE_clientes_eventuales" ON public.clientes_eventuales 
    FOR UPDATE TO authenticated USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Permitir delete clientes_eventuales" ON public.clientes_eventuales;
DROP POLICY IF EXISTS "RLS_DELETE_clientes_eventuales" ON public.clientes_eventuales;
CREATE POLICY "RLS_DELETE_clientes_eventuales" ON public.clientes_eventuales 
    FOR DELETE TO authenticated USING (public.is_staff_or_admin());

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND tablename = 'clientes_eventuales'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes_eventuales;
    END IF;
END $$;`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(sql).then(() => {
      alert("✅ ¡Script SQL copiado al portapapeles! Pégalo y ejecútalo en Supabase > SQL Editor.");
    }).catch(() => {
      prompt("Copia el siguiente código SQL y ejecútalo en Supabase SQL Editor:", sql);
    });
  } else {
    prompt("Copia el siguiente código SQL y ejecútalo en Supabase SQL Editor:", sql);
  }
};

/**
 * Pinta los clientes eventuales en la tabla con las 8 columnas requeridas
 */
function renderizarClientesEventuales(lista) {
  const tbody = document.getElementById('csClientesEventualesTableBody');
  if (!tbody) return;

  if (!lista || lista.length === 0) {
    tbody.innerHTML = '<tr class="cs-loading-row"><td colspan="8">No se encontraron clientes eventuales</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map((cli) => {
    const inicial = (cli.nombre || cli.email || cli.telefono || '?').charAt(0).toUpperCase();
    const avatarHtml = `<div class="cs-avatar-placeholder" style="background:#FCE7F3; color:#BE185D;">${inicial}</div>`;

    const fechaCreacionHtml = formatearFechaCS(cli.creado_en);
    const telFormatted = cli.telefono ? (typeof formatearTelefono10Digitos === 'function' ? formatearTelefono10Digitos(cli.telefono) : cli.telefono) : '';
    // 📞 Teléfono en texto plano (sin enlace de WhatsApp por instrucción directa del usuario)
    const telHtml = telFormatted
      ? `<span class="cs-tel-plain">📞 ${telFormatted}</span>`
      : '<span class="text-muted">—</span>';

    const dirHtml = cli.direccion ? _csEscapeHTML(cli.direccion) : '<span class="text-muted">—</span>';

    let ubiHtml = '<span class="text-muted">—</span>';
    if (cli.ubicacion) {
      if (cli.ubicacion.startsWith('http')) {
        ubiHtml = `<a href="${_csEscapeHTML(cli.ubicacion)}" target="_blank" class="cs-maps-link" title="Ver en Google Maps">📍 Ver mapa</a>`;
      } else {
        ubiHtml = `<span>${_csEscapeHTML(cli.ubicacion)}</span>`;
      }
    }

    const edadVal = (cli.edad_peque || cli.peque_edad || '').trim();
    const edadHtml = edadVal ? `<span class="cs-peque-tag" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;">👶 ${_csEscapeHTML(edadVal)}</span>` : '<span class="text-muted">—</span>';
    const notasHtml = cli.notas ? `<span style="font-size:0.82rem; color:#475569; white-space:pre-wrap;">${_csEscapeHTML(cli.notas)}</span>` : '<span class="text-muted">—</span>';

    const ciudadActual = (cli.ciudad || '').trim();
    const esQro = ciudadActual === 'Querétaro' || ciudadActual === 'Qro';
    const ciudadHtml = `
      <div class="cs-cell-city-wrapper">
        <select class="cs-cell-city-select" onchange="actualizarCiudadClienteEventual(this, '${cli.id}')" title="Asignar ciudad">
          <option value="" ${!ciudadActual ? 'selected' : ''}>— Asignar —</option>
          <option value="Puebla" ${ciudadActual === 'Puebla' ? 'selected' : ''}>Puebla</option>
          <option value="Xalapa" ${ciudadActual === 'Xalapa' ? 'selected' : ''}>Xalapa</option>
          <option value="Querétaro" ${esQro ? 'selected' : ''}>Querétaro</option>
          <option value="CDMX" ${ciudadActual === 'CDMX' ? 'selected' : ''}>CDMX</option>
        </select>
        <span class="cs-save-indicator" style="display:none;">✅</span>
      </div>
    `;

    const estaMigrado = !!(cli.auth_user_id && String(cli.auth_user_id).trim() !== '');
    const authBadgeHtml = estaMigrado
      ? `<span class="cs-auth-badge cs-auth-migrado" title="✅ Perfil 100% migrado a Supabase Auth"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Supabase</span>`
      : `<span class="cs-auth-badge cs-auth-pendiente" title="⏳ Sin credenciales de Supabase Auth aún"><span class="cs-auth-dot"></span> Pendiente</span>`;

    const emailHtml = (cli.email && cli.email.trim())
      ? `<span class="cs-user-email">${_csEscapeHTML(cli.email)}</span>`
      : `<span class="cs-user-email" style="color:#94a3b8; font-style:italic;">Sin email</span>`;

    return `
      <tr>
        <td>
          <div class="cs-user-cell">
            ${avatarHtml}
            <div class="cs-user-info">
              <div class="cs-user-name-row">
                <span class="cs-user-name">${_csEscapeHTML(cli.nombre || 'Sin nombre')}</span>
                ${authBadgeHtml}
              </div>
              ${emailHtml}
            </div>
          </div>
        </td>
        <td>${ciudadHtml}</td>
        <td><span style="color:#64748b; font-weight:600;">${fechaCreacionHtml}</span></td>
        <td>${telHtml}</td>
        <td>${dirHtml}</td>
        <td>${ubiHtml}</td>
        <td>${edadHtml}</td>
        <td>${notasHtml}</td>
      </tr>
    `;
  }).join('');

  const table = tbody.closest('table');
  if (table) initColumnResize(table);
}
window.renderizarClientesEventuales = renderizarClientesEventuales;

/**
 * Registra o actualiza un cliente en la tabla clientes_eventuales automáticamente
 * Toma como base los servicios de los bloques 'servicios_temporales' y 'servicios_eventuales'
 * Almacena toda la información disponible (Email, Nombre, Teléfono, Dirección, Ubicación, etc.)
 * Si no cuenta con email, igualmente se registra y se identifica por Teléfono o Nombre.
 * La ciudad asignada toma como referencia la matriz donde se apuntó (Puebla, Xalapa, Qro/Querétaro, CDMX).
 */
async function registrarOActualizarClienteEventual(servicio, detalles) {
  if (!servicio) return;
  const bloque = (servicio.bloque || '').trim().toLowerCase();
  if (bloque !== 'servicios_temporales' && bloque !== 'servicios_eventuales') {
    return;
  }

  const nombre = (servicio.cliente_nombre || '').trim();
  const email = (servicio.cliente_email || '').trim().toLowerCase();
  const telRaw = (detalles?.numero_contacto || detalles?.telefono || servicio.telefono || '').trim();
  const telFormatted = telRaw ? (typeof formatearTelefono10Digitos === 'function' ? formatearTelefono10Digitos(telRaw) : telRaw) : null;

  // ⛔ REGLA OBLIGATORIA: Para registrar o actualizar un cliente en la tabla Clientes Eventuales,
  // como MÍNIMO debemos tener su NOMBRE y su NÚMERO DE TELÉFONO (o EMAIL).
  // Esto evita guardar registros incompletos o duplicados (ej: 'clau') mientras el usuario escribe en la matriz.
  if (!nombre || nombre.length < 2 || (!telFormatted && !email)) {
    return;
  }

  // Si ya es un cliente fijo registrado en la tabla `clientes`, no duplicarlo en eventuales
  const esFijo = (_cacheClientesCS || []).some(c => {
    const cEmail = (c.email || '').toLowerCase().trim();
    const cNom = (c.nombre || '').trim();
    const cTel = (c.telefono || '').trim();
    if (email && cEmail && cEmail === email) return true;
    if (telFormatted && cTel && (cTel === telFormatted || cTel === telRaw)) return true;
    if (nombre && cNom && normalizarTextoCS(cNom) === normalizarTextoCS(nombre)) return true;
    return false;
  });
  if (esFijo) {
    return;
  }

  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (!client) return;

  const dirRaw = (detalles?.direccion || servicio.zona || '').trim();
  const ubiRaw = (detalles?.ubicacion || detalles?.ubicacion_link || '').trim();
  const edadRaw = (detalles?.edad_peque || detalles?.peque_edad || '').trim();
  const notasRaw = (detalles?.notas || '').trim();

  // Determinar ciudad según la matriz activa o la del servicio
  let cdOrigen = (servicio.ciudad || _currentCiudadMatriz || 'Puebla').trim();
  const cdLower = cdOrigen.toLowerCase();
  let ciudadNormalizada = 'Puebla';
  if (cdLower.includes('xal')) ciudadNormalizada = 'Xalapa';
  else if (cdLower.includes('qro') || cdLower.includes('quer')) ciudadNormalizada = 'Querétaro';
  else if (cdLower.includes('cdmx') || cdLower.includes('mex') || cdLower.includes('ciu')) ciudadNormalizada = 'CDMX';
  else if (cdLower.includes('pue')) ciudadNormalizada = 'Puebla';
  else if (cdOrigen) ciudadNormalizada = cdOrigen;

  try {
    // Buscar todas las coincidencias existentes en la BD
    const matches = [];

    if (email) {
      const { data } = await client
        .from('clientes_eventuales')
        .select('*')
        .ilike('email', email)
        .order('actualizado_en', { ascending: false });
      if (data && data.length > 0) matches.push(...data);
    }

    if (telFormatted) {
      const { data } = await client
        .from('clientes_eventuales')
        .select('*')
        .eq('telefono', telFormatted)
        .order('actualizado_en', { ascending: false });
      if (data && data.length > 0) {
        for (const d of data) {
          if (!matches.some(m => m.id === d.id)) matches.push(d);
        }
      }
    }

    if (nombre) {
      const { data } = await client
        .from('clientes_eventuales')
        .select('*')
        .ilike('nombre', nombre)
        .order('actualizado_en', { ascending: false });
      if (data && data.length > 0) {
        for (const d of data) {
          if (!matches.some(m => m.id === d.id)) matches.push(d);
        }
      }
    }

    // Fallback con el caché local si Supabase todavía no indexó la fila
    if (matches.length === 0 && _cacheClientesEventualesCS && _cacheClientesEventualesCS.length > 0) {
      const cached = _cacheClientesEventualesCS.find(c =>
        (email && c.email && c.email.toLowerCase().trim() === email) ||
        (telFormatted && c.telefono && c.telefono.replace(/\D/g, '') === telFormatted.replace(/\D/g, '')) ||
        (nombre && c.nombre && normalizarTextoCS(c.nombre) === normalizarTextoCS(nombre))
      );
      if (cached) matches.push(cached);
    }

    if (matches.length > 0) {
      // Registro principal (el más reciente)
      const primary = matches[0];

      // Consolidar campos no vacíos de todas las coincidencias y del input entrante
      const finalNombre = nombre || primary.nombre || 'Cliente Eventual';
      const finalEmail = email || matches.find(m => m.email)?.email || primary.email || '';
      const finalTel = telFormatted || matches.find(m => m.telefono)?.telefono || primary.telefono || null;
      const finalDir = dirRaw || matches.find(m => m.direccion)?.direccion || primary.direccion || null;
      const finalUbi = ubiRaw || matches.find(m => m.ubicacion)?.ubicacion || primary.ubicacion || null;
      const finalEdad = edadRaw || matches.find(m => m.edad_peque || m.peque_edad)?.edad_peque || primary.edad_peque || primary.peque_edad || null;
      const finalNotas = notasRaw || matches.find(m => m.notas)?.notas || primary.notas || null;
      const finalCiudad = ciudadNormalizada || primary.ciudad || 'Puebla';

      const payloadUpdate = {
        nombre: finalNombre,
        email: finalEmail,
        telefono: finalTel,
        direccion: finalDir,
        ubicacion: finalUbi,
        edad_peque: finalEdad,
        notas: finalNotas,
        ciudad: finalCiudad,
        actualizado_en: new Date().toISOString()
      };

      let resUp = await client
        .from('clientes_eventuales')
        .update(payloadUpdate)
        .eq('id', primary.id);

      if (resUp.error) {
        console.warn("⚠️ Reintentando update con adaptación de columna edad_peque -> peque_edad:", resUp.error.message);
        delete payloadUpdate.edad_peque;
        payloadUpdate.peque_edad = finalEdad;
        resUp = await client.from('clientes_eventuales').update(payloadUpdate).eq('id', primary.id);
      }

      if (!resUp.error) {
        console.log("⚡ [clientes_eventuales] Cliente consolidado y actualizado exitosamente:", finalNombre, { tel: finalTel, dir: finalDir, ubi: finalUbi });
      }

      // Actualizar inmediatamente en memoria para feedback instantáneo
      const idxCache = _cacheClientesEventualesCS.findIndex(c => c.id === primary.id);
      if (idxCache >= 0) {
        _cacheClientesEventualesCS[idxCache] = {
          ..._cacheClientesEventualesCS[idxCache],
          ...payloadUpdate,
          edad_peque: finalEdad,
          peque_edad: finalEdad
        };
        if (_subTabClientesActual === 'eventuales') {
          renderizarClientesEventuales(_cacheClientesEventualesCS);
        }
      }

      // Si existían registros duplicados acumulados para este cliente, eliminarlos de la BD
      if (matches.length > 1) {
        const extraIds = matches.slice(1).map(m => m.id);
        await client.from('clientes_eventuales').delete().in('id', extraIds);
        console.log("🧹 [clientes_eventuales] Filas duplicadas eliminadas:", extraIds.length);
      }
    } else {
      // Insertar nuevo registro con toda la información disponible
      const payloadInsert = {
        nombre: nombre || 'Cliente Eventual',
        email: email || '',
        telefono: telFormatted || null,
        ciudad: ciudadNormalizada,
        direccion: dirRaw || null,
        ubicacion: ubiRaw || null,
        edad_peque: edadRaw || null,
        notas: notasRaw || null,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      };

      let resIns = await client
        .from('clientes_eventuales')
        .insert([payloadInsert]);

      if (resIns.error) {
        console.warn("⚠️ Reintentando insert con peque_edad:", resIns.error.message);
        delete payloadInsert.edad_peque;
        payloadInsert.peque_edad = edadRaw || null;
        resIns = await client.from('clientes_eventuales').insert([payloadInsert]);
      }

      if (!resIns.error) {
        console.log("✨ [clientes_eventuales] Cliente eventual registrado:", nombre || email || telFormatted, "en", ciudadNormalizada);
      }
    }

    // Refrescar caché de clientes eventuales en memoria y UI
    if (typeof cargarClientesEventualesSupabase === 'function') {
      await cargarClientesEventualesSupabase(true, true);
    }
  } catch (err) {
    console.warn("Aviso al auto-registrar cliente eventual:", err);
  }
}
window.registrarOActualizarClienteEventual = registrarOActualizarClienteEventual;

/**
 * Guarda el status (activo/inactivo) del cliente en Supabase y actualiza la UI
 */
async function actualizarStatusCliente(selectEl, email) {
  const nuevoActivo = selectEl.value === 'true';
  const wrapper = selectEl.closest('.cs-cell-status-wrapper');
  const indicator = wrapper?.querySelector('.cs-save-indicator');

  selectEl.style.opacity = '0.6';
  selectEl.disabled = true;

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error("Cliente de Supabase no disponible");

    const { error } = await client
      .from('clientes')
      .update({ activo: nuevoActivo, actualizado_en: new Date().toISOString() })
      .eq('email', email);

    if (error) throw error;

    // Actualizar en caché en memoria
    const cli = _cacheClientesCS.find(c => c.email === email);
    if (cli) {
      cli.activo = nuevoActivo;
    }

    // Actualizar clases visuales del select
    if (nuevoActivo) {
      selectEl.classList.remove('status-inactive');
      selectEl.classList.add('status-active');
    } else {
      selectEl.classList.remove('status-active');
      selectEl.classList.add('status-inactive');
    }

    // Feedback visual
    selectEl.classList.add('saved');
    if (indicator) {
      indicator.style.display = 'inline-block';
      setTimeout(() => {
        indicator.style.display = 'none';
        selectEl.classList.remove('saved');
      }, 1600);
    }

    if (typeof mostrarToast === 'function') {
      mostrarToast(nuevoActivo ? 'Cliente activado exitosamente' : 'Cliente desactivado. Se bloqueará su acceso');
    }
  } catch (err) {
    console.error("❌ Error actualizando status del cliente:", err);
    alert("No se pudo guardar el estado en Supabase: " + err.message);
    const cli = _cacheClientesCS.find(c => c.email === email);
    if (cli) {
      selectEl.value = (cli.activo !== false).toString();
    }
  } finally {
    selectEl.style.opacity = '1';
    selectEl.disabled = false;
  }
}
window.actualizarStatusCliente = actualizarStatusCliente;

/**
 * Abre el modal con la ficha completa del Peque
 */
function abrirModalPeque(cliIndex, numPeque) {
  const cli = _cacheClientesCS[cliIndex];
  if (!cli) return;

  const sufijo = numPeque === 1 ? '' : `_${numPeque}`;
  const nombre = cli[`peque_nombre${sufijo}`] || `Peque ${numPeque}`;
  const nacimiento = cli[`peque_nacimiento${sufijo}`] || 'No especificada';
  const edad = (nacimiento && nacimiento !== 'No especificada' && typeof calcularEdadPeque === 'function')
    ? (calcularEdadPeque(nacimiento) || cli[`peque_edad${sufijo}`] || 'No especificada')
    : (cli[`peque_edad${sufijo}`] || 'No especificada');
  const alergias = cli[`alergias${sufijo}`] || 'Ninguna reportada';
  const condicion = cli[`condicion_medica${sufijo}`] || cli[`condicion${sufijo}`] || cli[`condición_médica_o_especificaciones_adicionales${sufijo}`] || 'Ninguna especificación';
  const salud = cli[`salud_actual${sufijo}`] || cli[`salud${sufijo}`] || cli[`estado_de_salud_actual${sufijo}`] || 'Sano';
  const preferencias = cli[`preferencias${sufijo}`] || cli[`preferencias_o_actividades_favoritas${sufijo}`] || 'Sin preferencias registradas';
  const fechaEdicion = formatearFechaCS(cli.fecha_edicion_peque);

  document.getElementById('modPequeNombre').textContent = nombre;
  document.getElementById('modPequeFamilia').textContent = `Familia: ${cli.nombre || cli.email}`;
  document.getElementById('modPequeNacimiento').textContent = (typeof formatearFechaElegante === 'function' && nacimiento && nacimiento !== 'No especificada')
    ? formatearFechaElegante(nacimiento)
    : nacimiento;
  document.getElementById('modPequeEdad').textContent = edad;
  document.getElementById('modPequeAlergias').textContent = alergias;
  document.getElementById('modPequeCondicion').textContent = condicion;
  document.getElementById('modPequeSalud').textContent = salud;
  document.getElementById('modPequePreferencias').textContent = preferencias;
  document.getElementById('modPequeFechaEdicion').textContent = fechaEdicion;

  const modal = document.getElementById('modalDetallePeque');
  if (modal) modal.style.display = 'flex';
}
window.abrirModalPeque = abrirModalPeque;

function cerrarModalPeque() {
  const modal = document.getElementById('modalDetallePeque');
  if (modal) modal.style.display = 'none';
}
window.cerrarModalPeque = cerrarModalPeque;

/**
 * Abre el modal de Políticas de Contratación
 */
function abrirModalPoliticas(cliIndex) {
  const cli = _cacheClientesCS[cliIndex];
  if (!cli) return;

  document.getElementById('modPolClienteNombre').textContent = `Cliente: ${cli.nombre || cli.email}`;
  document.getElementById('modPolContenido').textContent = cli.politicas_contratacion || 'Sin políticas de contratación registradas.';

  const modal = document.getElementById('modalPoliticasCliente');
  if (modal) modal.style.display = 'flex';
}
window.abrirModalPoliticas = abrirModalPoliticas;

function cerrarModalPoliticas() {
  const modal = document.getElementById('modalPoliticasCliente');
  if (modal) modal.style.display = 'none';
}
window.cerrarModalPoliticas = cerrarModalPoliticas;

/* =========================================================
   CONTROLADOR DEL MODAL DE DETALLES DEL SERVICIO (ZONA)
   ========================================================= */
let _filaActivaDetallesServicio = null;

/**
 * Formatea un número de teléfono a 10 dígitos con formato estricto: xxx xxx xxxx
 */
function formatearTelefono10Digitos(valor) {
  if (!valor) return '';
  let digits = String(valor).replace(/\D/g, '');
  if (digits.length > 10) digits = digits.slice(0, 10);
  let formatted = '';
  if (digits.length > 0) formatted += digits.substring(0, 3);
  if (digits.length > 3) formatted += ' ' + digits.substring(3, 6);
  if (digits.length > 6) formatted += ' ' + digits.substring(6, 10);
  return formatted;
}
window.formatearTelefono10Digitos = formatearTelefono10Digitos;

/**
 * Garantiza que la estructura HTML del modal exista en el DOM
 */
function asegurarModalDetallesServicio() {
  if (document.getElementById('modalDetallesServicioAdmin')) return;

  const modalHtml = `
  <div id="modalDetallesServicioAdmin" class="cs-details-modal-overlay" style="display:none;" onclick="handleModalDetallesOverlayClick(event)">
    <div class="cs-details-modal-card" role="dialog" aria-modal="true" aria-labelledby="csModalDetallesTitulo">
      <!-- Header -->
      <div class="cs-details-modal-header">
        <div class="cs-details-modal-header-left">
          <div class="cs-details-modal-icon">📍</div>
          <div>
            <h3 id="csModalDetallesTitulo" class="cs-details-modal-title">Datos del Servicio</h3>
            <span id="csModalDetallesSubtitulo" class="cs-details-modal-subtitle">Contacto y Ubicación</span>
          </div>
        </div>
        <button type="button" class="cs-details-modal-close" onclick="cerrarModalDetallesServicio()" title="Cerrar">✕</button>
      </div>

      <!-- Info Banner -->
      <div class="cs-details-modal-banner">
        <span class="cs-details-modal-banner-icon">💡</span>
        <div class="cs-details-modal-banner-text">
          Esta información se sincroniza automáticamente con la ficha del cliente en <strong>Clientes &gt; Eventuales</strong> y la verá la niñera en su agenda.
        </div>
      </div>

      <!-- Form Body -->
      <div class="cs-details-modal-body">
        <div class="cs-details-field-group">
          <label for="csDetalleNumeroContacto" class="cs-details-label">
            <span>📞</span> Número de Contacto
          </label>
          <input type="tel" id="csDetalleNumeroContacto" class="cs-details-input" placeholder="Ej: 222 123 4567" maxlength="12" autocomplete="off" oninput="this.value = formatearTelefono10Digitos(this.value)">
        </div>

        <div class="cs-details-field-group">
          <label for="csDetalleDireccion" class="cs-details-label">
            <span>📍</span> Dirección
          </label>
          <input type="text" id="csDetalleDireccion" class="cs-details-input" placeholder="Ej: Lomas de Angelópolis, Cluster 444, Calle 2 #15" autocomplete="off">
        </div>

        <div class="cs-details-field-group">
          <label for="csDetalleUbicacion" class="cs-details-label">
            <span>🗺️</span> Ubicación (Link de Google Maps o referencia)
          </label>
          <input type="text" id="csDetalleUbicacion" class="cs-details-input" placeholder="Ej: https://maps.app.goo.gl/... o referencia" autocomplete="off">
        </div>

        <div class="cs-details-field-group">
          <label for="csDetalleEdadPeque" class="cs-details-label">
            <span>👶</span> Edad del Peque
          </label>
          <input type="text" id="csDetalleEdadPeque" class="cs-details-input" placeholder="Ej: 2 años 3 meses" autocomplete="off">
        </div>

        <div class="cs-details-field-group">
          <label for="csDetalleNotas" class="cs-details-label">
            <span>📝</span> Notas
          </label>
          <textarea id="csDetalleNotas" class="cs-details-textarea" rows="3" placeholder="Instrucciones especiales para la niñera, rutinas, especificaciones, etc."></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="cs-details-modal-footer">
        <button type="button" class="cs-details-btn cs-details-btn-cancel" onclick="cerrarModalDetallesServicio()">Cancelar</button>
        <button type="button" class="cs-details-btn cs-details-btn-save" onclick="guardarModalDetallesServicio()">💾 Guardar datos</button>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Maneja el clic en la celda o input de Zona de la matriz
 * REGLA ESTRICTA: Solo aplica y abre modal para "servicios_temporales" y "servicios_eventuales".
 * En cualquier otro bloque (servicios fijos, cancelados, próximos, lista de espera, etc.) no hace nada.
 */
function handleZonaCellClick(element, event) {
  const row = (element && element.closest) ? element.closest('tr') : element;
  if (!row) return;

  const bloque = (row.getAttribute('data-bloque') || '').trim().toLowerCase();
  // ⛔ Si NO es temporal ni eventual, salir de inmediato sin intervenir
  if (bloque !== 'servicios_temporales' && bloque !== 'servicios_eventuales') {
    return;
  }

  if (event) {
    event.stopPropagation();
  }

  abrirModalDetallesServicio(row);
}
window.handleZonaCellClick = handleZonaCellClick;

/**
 * Abre el modal con los detalles de contacto, ubicación, edad del peque y notas
 * REGLA ESTRICTA: Solo para servicios temporales y eventuales.
 */
function abrirModalDetallesServicio(elementOrRow) {
  const row = (elementOrRow && elementOrRow.closest) ? elementOrRow.closest('tr') : elementOrRow;
  if (!row) return;

  const bloque = (row.getAttribute('data-bloque') || '').trim().toLowerCase();
  // ⛔ Validación de seguridad: no abrir si no es temporal ni eventual
  if (bloque !== 'servicios_temporales' && bloque !== 'servicios_eventuales') {
    return;
  }

  asegurarModalDetallesServicio();

  _filaActivaDetallesServicio = row;

  const cliNombre = row.querySelector('[data-field="cliente_nombre"]')?.value?.trim() || '';
  const zonaActual = row.querySelector('[data-field="zona"]')?.value?.trim() || '';

  // 1. Verificar si la fila ya tiene detalles guardados
  let detalles = null;
  const attrDetalles = row.getAttribute('data-detalles-servicio');
  if (attrDetalles) {
    try { detalles = JSON.parse(decodeURIComponent(attrDetalles)); } catch (e) { }
  }
  if (!detalles) {
    const obsVal = row.querySelector('[data-field="observaciones"]')?.value || '';
    detalles = extraerDetallesServicioDeObservaciones(obsVal);
  }
  if (!detalles) {
    const rawObs = row.getAttribute('data-observaciones-raw') || '';
    detalles = extraerDetallesServicioDeObservaciones(rawObs);
  }

  // 2. Si no tiene detalles o faltan campos clave, pre-cargar sus datos desde la base de datos de clientes
  if (!detalles || (!detalles.numero_contacto && !detalles.direccion && !detalles.ubicacion)) {
    const emailFila = row.querySelector('[data-field="cliente_email"]')?.value?.trim() || '';
    const cliente = buscarClienteEnCache(cliNombre) || (emailFila ? buscarClienteEnCache(emailFila) : null);
    if (cliente) {
      const edadCalc = (typeof calcularEdadPeque === 'function' && cliente.peque_nacimiento ? calcularEdadPeque(cliente.peque_nacimiento) : '') || cliente.edad_peque || cliente.peque_edad || '';
      const notasCli = cliente.notas || (typeof construirNotasPeques === 'function' ? construirNotasPeques(cliente) : '') || '';
      detalles = {
        numero_contacto: detalles?.numero_contacto || cliente.telefono || '',
        direccion: detalles?.direccion || cliente.direccion || cliente.zona || cliente.ciudad || zonaActual || '',
        ubicacion: detalles?.ubicacion || cliente.ubicacion || cliente.link_ubicacion || '',
        edad_peque: detalles?.edad_peque || edadCalc,
        notas: detalles?.notas || notasCli
      };
    } else if (!detalles) {
      detalles = {
        numero_contacto: '',
        direccion: zonaActual || '',
        ubicacion: '',
        edad_peque: '',
        notas: ''
      };
    }
  }

  // Asignar a los campos del modal
  const inContacto = document.getElementById('csDetalleNumeroContacto');
  const inDireccion = document.getElementById('csDetalleDireccion');
  const inUbicacion = document.getElementById('csDetalleUbicacion');
  const inEdad = document.getElementById('csDetalleEdadPeque');
  const inNotas = document.getElementById('csDetalleNotas');

  if (inContacto) inContacto.value = formatearTelefono10Digitos(detalles.numero_contacto || detalles.telefono || '');
  if (inDireccion) inDireccion.value = detalles.direccion || detalles.zona || zonaActual || '';
  if (inUbicacion) inUbicacion.value = detalles.ubicacion || detalles.ubicacion_link || '';
  if (inEdad) inEdad.value = detalles.edad_peque || detalles.peque_edad || '';
  if (inNotas) inNotas.value = detalles.notas || '';

  // Actualizar subtítulo
  const subEl = document.getElementById('csModalDetallesSubtitulo');
  if (subEl) {
    const bObj = BLOQUES_SERVICIOS.find(b => b.id === bloque);
    const nombreBloque = bObj ? bObj.nombre : 'Servicio';
    subEl.textContent = cliNombre ? `Cliente: ${cliNombre} · ${nombreBloque}` : `Contacto y Ubicación · ${nombreBloque}`;
  }

  const modal = document.getElementById('modalDetallesServicioAdmin');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => { inContacto?.focus(); }, 50);
  }
}
window.abrirModalDetallesServicio = abrirModalDetallesServicio;

/**
 * Guarda los datos ingresados en el modal dentro de la fila activa y sincroniza
 */
async function guardarModalDetallesServicio() {
  if (!_filaActivaDetallesServicio) {
    cerrarModalDetallesServicio();
    return;
  }

  const inContacto = document.getElementById('csDetalleNumeroContacto');
  const inDireccion = document.getElementById('csDetalleDireccion');
  const inUbicacion = document.getElementById('csDetalleUbicacion');
  const inEdad = document.getElementById('csDetalleEdadPeque');
  const inNotas = document.getElementById('csDetalleNotas');

  const detalles = {
    numero_contacto: inContacto ? inContacto.value.trim() : '',
    direccion: inDireccion ? inDireccion.value.trim() : '',
    ubicacion: inUbicacion ? inUbicacion.value.trim() : '',
    edad_peque: inEdad ? inEdad.value.trim() : '',
    notas: inNotas ? inNotas.value.trim() : ''
  };

  // Guardar en la fila activa
  _filaActivaDetallesServicio.setAttribute('data-detalles-servicio', encodeURIComponent(JSON.stringify(detalles)));

  // Actualizar celda de zona con la dirección ingresada
  const zoneInput = _filaActivaDetallesServicio.querySelector('[data-field="zona"]');
  if (zoneInput) {
    zoneInput.value = detalles.direccion || detalles.ubicacion || '';
    zoneInput.style.backgroundColor = '#ecfdf5';
    setTimeout(() => { zoneInput.style.backgroundColor = 'transparent'; }, 700);
  }

  // Notificar cambio inmediato para guardar en Supabase (control_servicios)
  notificarCambioFila(_filaActivaDetallesServicio, true);

  // Auto-registrar o actualizar cliente eventual en Supabase (clientes_eventuales)
  const servicioActivo = typeof extraeDatosFila === 'function' ? extraeDatosFila(_filaActivaDetallesServicio) : null;
  if (servicioActivo && typeof registrarOActualizarClienteEventual === 'function') {
    await registrarOActualizarClienteEventual(servicioActivo, detalles);
  }

  cerrarModalDetallesServicio();

  if (typeof Swal !== 'undefined' && Swal.fire) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Datos del servicio guardados',
      showConfirmButton: false,
      timer: 1800
    });
  }
}
window.guardarModalDetallesServicio = guardarModalDetallesServicio;

/**
 * Cierra el modal de detalles
 */
function cerrarModalDetallesServicio() {
  const modal = document.getElementById('modalDetallesServicioAdmin');
  if (modal) {
    modal.style.display = 'none';
  }
  _filaActivaDetallesServicio = null;
}
window.cerrarModalDetallesServicio = cerrarModalDetallesServicio;

function handleModalDetallesOverlayClick(event) {
  if (event.target && event.target.id === 'modalDetallesServicioAdmin') {
    cerrarModalDetallesServicio();
  }
}
window.handleModalDetallesOverlayClick = handleModalDetallesOverlayClick;

/**
 * Filtrado en tiempo real de Clientes (Texto + Ciudad + Status) para Fijos y Eventuales
 */
function filtrarClientesSupabase() {
  const input = document.getElementById('csSearchClientes');
  const cityFilter = document.getElementById('csFiltroCiudadClientes');
  const statusFilter = document.getElementById('csFiltroStatusClientes');
  const q = input ? input.value.toLowerCase().trim() : '';
  const selCity = cityFilter ? cityFilter.value : '';
  const selStatus = statusFilter ? statusFilter.value : '';
  const countEl = document.getElementById('csClientesCount');

  // --- Caso 1: Sub-pestaña "Eventuales" ---
  if (_subTabClientesActual === 'eventuales') {
    let filtrados = _cacheClientesEventualesCS || [];

    // Filtro por Ciudad
    if (selCity) {
      if (selCity === 'sin_ciudad') {
        filtrados = filtrados.filter(cli => !cli.ciudad || cli.ciudad.trim() === '');
      } else {
        filtrados = filtrados.filter(cli => cli.ciudad === selCity);
      }
    }

    // Filtro por Texto libre
    if (q) {
      const qDigits = q.replace(/\D/g, '');
      filtrados = filtrados.filter(cli => {
        const telDigits = (cli.telefono || '').replace(/\D/g, '');
        const telMatch = (qDigits.length >= 3 && telDigits.includes(qDigits)) || (cli.telefono && cli.telefono.toLowerCase().includes(q));
        return (cli.nombre && cli.nombre.toLowerCase().includes(q)) ||
          (cli.email && cli.email.toLowerCase().includes(q)) ||
          telMatch ||
          (cli.direccion && cli.direccion.toLowerCase().includes(q)) ||
          (cli.ubicacion && cli.ubicacion.toLowerCase().includes(q)) ||
          (cli.ciudad && cli.ciudad.toLowerCase().includes(q)) ||
          (cli.edad_peque && cli.edad_peque.toLowerCase().includes(q)) ||
          (cli.peque_edad && cli.peque_edad.toLowerCase().includes(q)) ||
          (cli.notas && cli.notas.toLowerCase().includes(q));
      });
    }

    renderizarClientesEventuales(filtrados);
    if (countEl) {
      countEl.textContent = `${filtrados.length} clientes eventuales`;
    }
    return;
  }

  // --- Caso 2: Sub-pestaña "Fijos" ---
  let filtrados = _cacheClientesCS;

  // Filtro por Status / Migración
  if (selStatus) {
    if (selStatus === 'activo') {
      filtrados = filtrados.filter(cli => cli.activo !== false);
    } else if (selStatus === 'inactivo') {
      filtrados = filtrados.filter(cli => cli.activo === false);
    } else if (selStatus === 'migrado' || selStatus === 'migrada') {
      filtrados = filtrados.filter(cli => !!(cli.auth_user_id && String(cli.auth_user_id).trim() !== ''));
    } else if (selStatus === 'pendiente') {
      filtrados = filtrados.filter(cli => !(cli.auth_user_id && String(cli.auth_user_id).trim() !== ''));
    }
  }

  // Filtro por Ciudad
  if (selCity) {
    if (selCity === 'sin_ciudad') {
      filtrados = filtrados.filter(cli => !cli.ciudad || cli.ciudad.trim() === '');
    } else {
      filtrados = filtrados.filter(cli => cli.ciudad === selCity);
    }
  }

  // Filtro por Texto libre
  if (q) {
    const qDigits = q.replace(/\D/g, '');
    filtrados = filtrados.filter(cli => {
      const estaMig = !!(cli.auth_user_id && String(cli.auth_user_id).trim() !== '');
      const migTexto = estaMig ? 'supabase migrado' : 'pendiente';
      const telDigits = (cli.telefono || '').replace(/\D/g, '');
      const emerDigits = (cli.emergencia || '').replace(/\D/g, '');
      const telMatch = (qDigits.length >= 3 && (telDigits.includes(qDigits) || emerDigits.includes(qDigits))) ||
        (cli.telefono && cli.telefono.toLowerCase().includes(q)) ||
        (cli.emergencia && cli.emergencia.toLowerCase().includes(q));

      return (cli.nombre && cli.nombre.toLowerCase().includes(q)) ||
        (cli.email && cli.email.toLowerCase().includes(q)) ||
        telMatch ||
        (cli.direccion && cli.direccion.toLowerCase().includes(q)) ||
        (cli.ciudad && cli.ciudad.toLowerCase().includes(q)) ||
        (cli.politicas_contratacion && cli.politicas_contratacion.toLowerCase().includes(q)) ||
        (cli.peque_nombre && cli.peque_nombre.toLowerCase().includes(q)) ||
        (cli.peque_nombre_2 && cli.peque_nombre_2.toLowerCase().includes(q)) ||
        (cli.peque_nombre_3 && cli.peque_nombre_3.toLowerCase().includes(q)) ||
        (cli.alergias && cli.alergias.toLowerCase().includes(q)) ||
        migTexto.includes(q);
    });
  }

  renderizarClientes(filtrados);

  // Actualizar contador visual
  if (countEl) {
    countEl.textContent = `${filtrados.length} clientes`;
  }
}
window.filtrarClientesSupabase = filtrarClientesSupabase;

/**
 * Carga niñeras directamente desde Supabase sin parpadeos visuales
 */
async function cargarNannysSupabase(force = false, silent = false) {
  const tbody = document.getElementById('csNannysTableBody');
  const countEl = document.getElementById('csNannysCount');
  if (!tbody) return;

  if (!silent && _cacheNannysCS.length === 0) {
    tbody.innerHTML = '<tr class="cs-loading-row"><td colspan="8">Cargando niñeras de Supabase... ⏳</td></tr>';
  }

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) {
      if (_cacheNannysCS.length === 0) {
        tbody.innerHTML = '<tr class="cs-loading-row"><td colspan="8">⚠️ Cliente Supabase no inicializado</td></tr>';
      }
      return;
    }

    const { data: nannys, error } = await client
      .from('nannys')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    const nuevasNannys = nannys || [];

    // Si los datos son idénticos a los almacenados y no es forzado directo, omitir re-renderizado para evitar parpadeos
    if (!force && JSON.stringify(nuevasNannys) === JSON.stringify(_cacheNannysCS)) {
      return;
    }

    _cacheNannysCS = nuevasNannys;
    window._cacheNannysCS = _cacheNannysCS;
    actualizarDatalistsAutocompletado();

    const hasActiveFilters = (document.getElementById('csSearchNannys')?.value ||
      document.getElementById('csFiltroCiudadNannys')?.value ||
      document.getElementById('csFiltroStatusNannys')?.value);

    if (hasActiveFilters) {
      filtrarNannysSupabase();
    } else {
      renderizarNannys(_cacheNannysCS);
      if (countEl) {
        countEl.textContent = `${_cacheNannysCS.length} niñeras`;
      }
    }
  } catch (err) {
    console.error("❌ Error cargando niñeras:", err);
    if (_cacheNannysCS.length === 0) {
      tbody.innerHTML = `<tr class="cs-loading-row"><td colspan="8" style="color:#b91c1c;">Error al cargar niñeras: ${_csEscapeHTML(err.message)}</td></tr>`;
    }
  }
}
window.cargarNannysSupabase = cargarNannysSupabase;

/**
 * Guarda la ciudad seleccionada para una niñera directamente en Supabase
 */
async function actualizarCiudadNanny(selectEl, email) {
  const nuevaCiudad = selectEl.value;
  const wrapper = selectEl.closest('.cs-cell-city-wrapper');
  const indicator = wrapper?.querySelector('.cs-save-indicator');

  selectEl.style.opacity = '0.6';
  selectEl.disabled = true;

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error("Cliente de Supabase no disponible");

    const { error } = await client
      .from('nannys')
      .update({ ciudad: nuevaCiudad || null })
      .eq('email', email);

    if (error) throw error;

    // Actualizar en el caché en memoria
    const nan = _cacheNannysCS.find(n => n.email === email);
    if (nan) {
      nan.ciudad = nuevaCiudad || null;
    }

    // Micro-feedback visual de éxito
    selectEl.classList.add('saved');
    if (indicator) {
      indicator.style.display = 'inline-block';
      setTimeout(() => {
        indicator.style.display = 'none';
        selectEl.classList.remove('saved');
      }, 1600);
    }
  } catch (err) {
    console.error("❌ Error actualizando ciudad de la niñera:", err);
    alert("No se pudo guardar la ciudad en Supabase: " + err.message);
  } finally {
    selectEl.style.opacity = '1';
    selectEl.disabled = false;
  }
}
window.actualizarCiudadNanny = actualizarCiudadNanny;

/**
 * Guarda el status (activo/inactivo) de la niñera en Supabase y actualiza la UI
 */
async function actualizarStatusNanny(selectEl, email) {
  const nuevoActivo = selectEl.value === 'true';
  const wrapper = selectEl.closest('.cs-cell-status-wrapper');
  const indicator = wrapper?.querySelector('.cs-save-indicator');

  selectEl.style.opacity = '0.6';
  selectEl.disabled = true;

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error("Cliente de Supabase no disponible");

    const { error } = await client
      .from('nannys')
      .update({ activo: nuevoActivo, actualizado_en: new Date().toISOString() })
      .eq('email', email);

    if (error) throw error;

    // Actualizar en caché en memoria
    const nan = _cacheNannysCS.find(n => n.email === email);
    if (nan) {
      nan.activo = nuevoActivo;
    }

    // Actualizar clases visuales del select
    if (nuevoActivo) {
      selectEl.classList.remove('status-inactive');
      selectEl.classList.add('status-active');
    } else {
      selectEl.classList.remove('status-active');
      selectEl.classList.add('status-inactive');
    }

    // Feedback visual
    selectEl.classList.add('saved');
    if (indicator) {
      indicator.style.display = 'inline-block';
      setTimeout(() => {
        indicator.style.display = 'none';
        selectEl.classList.remove('saved');
      }, 1600);
    }

    if (typeof mostrarToast === 'function') {
      mostrarToast(nuevoActivo ? 'Niñera activada exitosamente' : 'Niñera desactivada. Se bloqueará su acceso');
    }
  } catch (err) {
    console.error("❌ Error actualizando status de la niñera:", err);
    alert("No se pudo guardar el estado en Supabase: " + err.message);
    const nan = _cacheNannysCS.find(n => n.email === email);
    if (nan) {
      selectEl.value = (nan.activo !== false).toString();
    }
  } finally {
    selectEl.style.opacity = '1';
    selectEl.disabled = false;
  }
}
window.actualizarStatusNanny = actualizarStatusNanny;

/**
 * Pinta las niñeras en la tabla con las columnas separadas e interactivas
 */
function renderizarNannys(lista) {
  const tbody = document.getElementById('csNannysTableBody');
  if (!tbody) return;

  if (!lista || lista.length === 0) {
    tbody.innerHTML = '<tr class="cs-loading-row"><td colspan="8">No se encontraron niñeras</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(nan => {
    const inicial = (nan.nombre || nan.email || '?').charAt(0).toUpperCase();
    const avatarHtml = nan.foto
      ? `<img src="${nan.foto}" class="cs-avatar-img" alt="Foto" onerror="this.outerHTML='<div class=\\'cs-avatar-placeholder\\'>${inicial}</div>'">`
      : `<div class="cs-avatar-placeholder">${inicial}</div>`;

    const esActiva = nan.activo !== false;
    const estaMigrada = !!(nan.auth_user_id && String(nan.auth_user_id).trim() !== '');
    const authBadgeHtml = estaMigrada
      ? `<span class="cs-auth-badge cs-auth-migrado" title="✅ Perfil 100% migrado a Supabase Auth (Ha iniciado sesión con el nuevo sistema)"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Supabase</span>`
      : `<span class="cs-auth-badge cs-auth-pendiente" title="⏳ Sin credenciales de Supabase Auth aún (Pendiente de primer login o generar contraseña)"><span class="cs-auth-dot"></span> Pendiente</span>`;

    const statusHtml = `
      <div class="cs-cell-status-wrapper">
        <select class="cs-cell-status-select ${esActiva ? 'status-active' : 'status-inactive'}" 
          onchange="actualizarStatusNanny(this, '${nan.email}')" title="Cambiar estado de la niñera">
          <option value="true" ${esActiva ? 'selected' : ''}>🟢 Activa</option>
          <option value="false" ${!esActiva ? 'selected' : ''}>🔴 Inactiva</option>
        </select>
        <span class="cs-save-indicator" style="display:none;">✅</span>
      </div>
    `;

    // Ciudad editable: Selector desplegable para Puebla, Xalapa, Querétaro, CDMX
    const ciudadActual = nan.ciudad || '';
    const ciudadHtml = `
      <div class="cs-cell-city-wrapper">
        <select class="cs-cell-city-select" onchange="actualizarCiudadNanny(this, '${nan.email}')" title="Asignar ciudad">
          <option value="" ${!ciudadActual ? 'selected' : ''}>— Asignar —</option>
          <option value="Puebla" ${ciudadActual === 'Puebla' ? 'selected' : ''}>Puebla</option>
          <option value="Xalapa" ${ciudadActual === 'Xalapa' ? 'selected' : ''}>Xalapa</option>
          <option value="Querétaro" ${ciudadActual === 'Querétaro' ? 'selected' : ''}>Querétaro</option>
          <option value="CDMX" ${ciudadActual === 'CDMX' ? 'selected' : ''}>CDMX</option>
        </select>
        <span class="cs-save-indicator" style="display:none;">✅</span>
      </div>
    `;

    const fechaCreacionHtml = formatearFechaCS(nan.creado_en);

    const telLimpio = nan.telefono ? nan.telefono.replace(/\D/g, '') : '';
    const telHtml = nan.telefono
      ? `<a href="https://wa.me/52${telLimpio}" target="_blank" class="cs-tel-chip" title="Enviar WhatsApp">💬 ${nan.telefono}</a>`
      : '<span class="text-muted">—</span>';

    const emergHtml = nan.emergencia || '<span class="text-muted">—</span>';

    // Dirección separada de ciudad
    let dirHtml = nan.direccion || '—';
    if (nan.ubicacion && nan.ubicacion.startsWith('http')) {
      dirHtml += ` <a href="${nan.ubicacion}" target="_blank" class="cs-maps-link" title="Ver ubicación en Google Maps">📍 Mapa</a>`;
    }

    const rangoEdades = (nan.min_edad != null && nan.max_edad != null)
      ? `${nan.min_edad} a ${nan.max_edad} años`
      : 'Todos los peques';

    return `
      <tr>
        <td>
          <div class="cs-user-cell">
            ${avatarHtml}
            <div class="cs-user-info">
              <div class="cs-user-name-row">
                <span class="cs-user-name">${nan.nombre || 'Sin nombre'}</span>
                ${authBadgeHtml}
              </div>
              <span class="cs-user-email">${nan.email}</span>
            </div>
          </div>
        </td>
        <td>${statusHtml}</td>
        <td>${ciudadHtml}</td>
        <td><span style="color:#64748b; font-weight:600;">${fechaCreacionHtml}</span></td>
        <td>${telHtml}</td>
        <td>${emergHtml}</td>
        <td>${dirHtml}</td>
        <td><span class="cs-peque-tag">${rangoEdades}</span></td>
      </tr>
    `;
  }).join('');

  const table = tbody.closest('table');
  if (table) initColumnResize(table);
}

/**
 * Filtrado en tiempo real de Niñeras (Texto + Ciudad + Status)
 */
function filtrarNannysSupabase() {
  const input = document.getElementById('csSearchNannys');
  const cityFilter = document.getElementById('csFiltroCiudadNannys');
  const statusFilter = document.getElementById('csFiltroStatusNannys');
  const q = input ? input.value.toLowerCase().trim() : '';
  const selCity = cityFilter ? cityFilter.value : '';
  const selStatus = statusFilter ? statusFilter.value : '';

  let filtrados = _cacheNannysCS;

  // Filtro por Status / Migración
  if (selStatus) {
    if (selStatus === 'activo') {
      filtrados = filtrados.filter(nan => nan.activo !== false);
    } else if (selStatus === 'inactivo') {
      filtrados = filtrados.filter(nan => nan.activo === false);
    } else if (selStatus === 'migrado' || selStatus === 'migrada') {
      filtrados = filtrados.filter(nan => !!(nan.auth_user_id && String(nan.auth_user_id).trim() !== ''));
    } else if (selStatus === 'pendiente') {
      filtrados = filtrados.filter(nan => !(nan.auth_user_id && String(nan.auth_user_id).trim() !== ''));
    }
  }

  // Filtro por Ciudad
  if (selCity) {
    if (selCity === 'sin_ciudad') {
      filtrados = filtrados.filter(nan => !nan.ciudad || nan.ciudad.trim() === '');
    } else {
      filtrados = filtrados.filter(nan => nan.ciudad === selCity);
    }
  }

  // Filtro por Texto
  if (q) {
    filtrados = filtrados.filter(nan => {
      const estaMig = !!(nan.auth_user_id && String(nan.auth_user_id).trim() !== '');
      const migTexto = estaMig ? 'supabase migrada migrado' : 'pendiente';
      return (nan.nombre && nan.nombre.toLowerCase().includes(q)) ||
        (nan.email && nan.email.toLowerCase().includes(q)) ||
        (nan.telefono && nan.telefono.includes(q)) ||
        (nan.emergencia && nan.emergencia.includes(q)) ||
        (nan.ciudad && nan.ciudad.toLowerCase().includes(q)) ||
        (nan.direccion && nan.direccion.toLowerCase().includes(q)) ||
        migTexto.includes(q);
    });
  }

  renderizarNannys(filtrados);

  // Actualizar contador
  const countEl = document.getElementById('csNannysCount');
  if (countEl) {
    countEl.textContent = `${filtrados.length} niñeras`;
  }
}
window.filtrarNannysSupabase = filtrarNannysSupabase;

/**
 * Previene que el gesto de scroll horizontal extremo (swipe) active la navegación 'ir hacia atrás' del navegador.
 */
function initOverscrollPrevention() {
  const container = document.querySelector('.cs-grid-container');
  if (!container) return;

  container.addEventListener('wheel', (e) => {
    // Si la persona está desplazando horizontalmente
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      const isAtLeftEdge = container.scrollLeft === 0 && e.deltaX < 0;
      const isAtRightEdge = (container.scrollLeft + container.clientWidth >= container.scrollWidth) && e.deltaX > 0;

      if (isAtLeftEdge || isAtRightEdge) {
        e.preventDefault();
      }
    }
  }, { passive: false });
}

/**
 * Ajusta la visibilidad de los encabezados de bloque según los resultados del filtro
 */
function actualizarVisibilidadSeccionesFiltro() {
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  const searchInput = document.getElementById('csSearchInput');
  const isFiltering = searchInput && searchInput.value.trim().length > 0;

  BLOQUES_SERVICIOS.forEach(b => {
    const gapTr = tableBody.querySelector(`.cs-section-gap-tr[data-gap-for="${b.id}"]`);
    const headerTr = tableBody.querySelector(`.cs-section-header-tr.cs-sec-${b.id}`);
    const addTr = tableBody.querySelector(`.cs-section-add-tr[data-add-for="${b.id}"]`);
    const rows = Array.from(tableBody.querySelectorAll(`tr.cs-row-item[data-bloque="${b.id}"]`));

    const visibleCount = rows.filter(r => r.style.display !== 'none').length;

    if (rows.length === 0) {
      if (gapTr) gapTr.style.display = isFiltering ? 'none' : '';
      if (headerTr) headerTr.style.display = isFiltering ? 'none' : '';
      if (addTr) addTr.style.display = isFiltering ? 'none' : '';
    } else {
      if (gapTr) gapTr.style.display = visibleCount > 0 ? '' : 'none';
      if (headerTr) headerTr.style.display = visibleCount > 0 ? '' : 'none';
      if (addTr) addTr.style.display = visibleCount > 0 ? '' : 'none';
    }
  });
}

/**
 * Filtro de búsqueda en tiempo real (Cliente, Niñera, Zona, Email, Tipo de Servicio)
 */
function initSearchFilter() {
  const searchInput = document.getElementById('csSearchInput');
  const tableBody = document.getElementById('csTableBody');
  if (!searchInput || !tableBody) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const rows = tableBody.querySelectorAll('tr.cs-row-item');

    rows.forEach(row => {
      const inputs = Array.from(row.querySelectorAll('input, select'));
      const inputValues = inputs.map(i => (i.type === 'checkbox' ? '' : i.value)).join(' ').toLowerCase();
      const textContent = (row.textContent + ' ' + inputValues).toLowerCase();
      if (textContent.includes(query)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    actualizarVisibilidadSeccionesFiltro();
  });
}

/**
 * Filtros rápidos por chips (Todos, Sin Confirmar, Alertas)
 */
function initChipFilters() {
  const chips = document.querySelectorAll('.cs-chip');
  const tableBody = document.getElementById('csTableBody');
  if (!chips.length || !tableBody) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filterText = chip.textContent.toLowerCase();
      const rows = tableBody.querySelectorAll('tr.cs-row-item');

      rows.forEach(row => {
        const tieneDatos = (typeof filaTieneDatos === 'function') ? filaTieneDatos(row) : true;
        if (filterText.includes('todos')) {
          row.style.display = '';
        } else if (filterText.includes('sin confirmar')) {
          if (!tieneDatos) {
            row.style.display = 'none';
          } else {
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            const isUnconfirmed = Array.from(checkboxes).some(cb => !cb.checked);
            row.style.display = isUnconfirmed ? '' : 'none';
          }
        } else if (filterText.includes('alertas')) {
          if (!tieneDatos) {
            row.style.display = 'none';
          } else {
            const alertInput = row.querySelector('[data-field="alerta"]');
            const hasAlert = alertInput && alertInput.value.trim().length > 0;
            row.style.display = hasAlert ? '' : 'none';
          }
        }
      });

      actualizarVisibilidadSeccionesFiltro();
    });
  });

  actualizarContadoresFiltros();
}

/**
 * Actualiza los contadores de los chips de filtrado (Todos, Sin Confirmar, Alertas)
 * Excluye filas en blanco que no contengan datos reales.
 */
function actualizarContadoresFiltros() {
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  const rows = Array.from(tableBody.querySelectorAll('tr.cs-row-item'));
  const rowsConDatos = rows.filter(r => (typeof filaTieneDatos === 'function') ? filaTieneDatos(r) : true);
  const total = rowsConDatos.length;
  let unconfirmed = 0;
  let alertas = 0;

  rowsConDatos.forEach(r => {
    const cbs = r.querySelectorAll('input[type="checkbox"]');
    if (Array.from(cbs).some(cb => !cb.checked)) {
      unconfirmed++;
    }

    const alertInput = r.querySelector('[data-field="alerta"]');
    if (alertInput && alertInput.value.trim().length > 0) {
      alertas++;
    }
  });

  const chips = document.querySelectorAll('.cs-filter-chips .cs-chip');
  chips.forEach(chip => {
    const text = chip.textContent.toLowerCase();
    if (text.includes('todos')) {
      chip.textContent = `Todos (${total})`;
    } else if (text.includes('sin confirmar')) {
      chip.textContent = `Sin Confirmar (${unconfirmed})`;
    } else if (text.includes('alertas')) {
      chip.textContent = `Alertas (${alertas})`;
    }
  });
}

/**
 * Animación y feedback inmediato al marcar/desmarcar casillas
 */
function initCheckboxInteractions() {
  const checkboxes = document.querySelectorAll('.custom-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const parentTd = e.target.closest('td');
      if (!parentTd) return;

      // Breve animación de escala
      e.target.style.transform = 'scale(1.2)';
      setTimeout(() => {
        e.target.style.transform = 'scale(1)';
      }, 150);

      // Efecto visual en consola para desarrollo
      console.log(`[UI Demo] Checkbox cambiado: ${isChecked ? 'Confirmado' : 'Pendiente'}`);
    });
  });
}

/**
 * =========================================================
 * CONTROL DE DROPDOWNS PERSONALIZADOS (Clientes y Niñeras)
 * =========================================================
 */
function toggleCsDropdown(dropdownId, event) {
  if (event) {
    event.stopPropagation();
  }
  const dd = document.getElementById(dropdownId);
  if (!dd) return;

  const wasOpen = dd.classList.contains('open');

  // Cerrar cualquier otro dropdown abierto
  document.querySelectorAll('.cs-custom-dropdown.open').forEach(openDd => {
    openDd.classList.remove('open');
  });

  if (!wasOpen) {
    dd.classList.add('open');
  }
}

function selectCsDropdownItem(dropdownId, selectId, value, labelText, iconEmoji, targetPanel) {
  const dd = document.getElementById(dropdownId);
  if (dd) {
    // Actualizar texto del botón e icono
    const label = dd.querySelector('.cs-dd-label');
    const icon = dd.querySelector('.cs-dd-icon');
    if (label) label.textContent = labelText;
    if (icon && iconEmoji) icon.textContent = iconEmoji;

    // Actualizar clase activa en los items
    dd.querySelectorAll('.cs-dropdown-item').forEach(item => {
      if (item.getAttribute('data-value') === value) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Indicar si hay un filtro aplicado en el trigger
    const trigger = dd.querySelector('.cs-dropdown-trigger');
    if (trigger) {
      if (value !== '') {
        trigger.classList.add('has-filter');
      } else {
        trigger.classList.remove('has-filter');
      }
    }

    // Cerrar el menú
    dd.classList.remove('open');
  }

  // Actualizar el select subyacente y despachar evento change
  const sel = document.getElementById(selectId);
  if (sel) {
    sel.value = value;
    sel.dispatchEvent(new Event('change'));
  }

  // Ejecutar filtro correspondiente
  if (targetPanel === 'clientes' && typeof window.filtrarClientesSupabase === 'function') {
    window.filtrarClientesSupabase();
  } else if (targetPanel === 'nannys' && typeof window.filtrarNannysSupabase === 'function') {
    window.filtrarNannysSupabase();
  }
}

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', function (e) {
  if (!e.target.closest('.cs-custom-dropdown')) {
    document.querySelectorAll('.cs-custom-dropdown.open').forEach(dd => {
      dd.classList.remove('open');
    });
  }
});

// Cerrar dropdowns con tecla Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.cs-custom-dropdown.open').forEach(dd => {
      dd.classList.remove('open');
    });
  }
});

window.toggleCsDropdown = toggleCsDropdown;
window.selectCsDropdownItem = selectCsDropdownItem;

// =========================================================================
// GESTIÓN DE NUEVO CLIENTE (ADMIN)
// =========================================================================

/**
 * Abre el modal para registrar un nuevo cliente desde el panel de administración
 */
function abrirModalNuevoClienteAdmin() {
  const modal = document.getElementById('modalNuevoClienteAdmin');
  const form = document.getElementById('formNuevoClienteAdmin');
  const msg = document.getElementById('adminCliMsg');

  if (form) form.reset();
  if (msg) {
    msg.textContent = '';
    msg.style.color = '';
  }

  // Resetear secciones colapsables de peques
  const sec2 = document.getElementById('admin-section-peque-2');
  const sec3 = document.getElementById('admin-section-peque-3');
  const btnAgregar = document.getElementById('admin-btn-agregar-peque');
  if (sec2) sec2.style.display = 'none';
  if (sec3) sec3.style.display = 'none';
  if (btnAgregar) btnAgregar.style.display = 'block';

  // Resetear badges de edad
  if (document.getElementById('admin_cli_peque_edad_badge')) document.getElementById('admin_cli_peque_edad_badge').textContent = '';
  if (document.getElementById('admin_cli_peque_edad_badge_2')) document.getElementById('admin_cli_peque_edad_badge_2').textContent = '';
  if (document.getElementById('admin_cli_peque_edad_badge_3')) document.getElementById('admin_cli_peque_edad_badge_3').textContent = '';

  // Rol por defecto: deseleccionado
  seleccionarRolAdmin('');

  if (modal) modal.style.display = 'flex';
  setTimeout(() => {
    document.getElementById('admin_cli_nombre')?.focus();
  }, 100);
}
window.abrirModalNuevoClienteAdmin = abrirModalNuevoClienteAdmin;

/**
 * Cierra el modal de registro de nuevo cliente
 */
function cerrarModalNuevoClienteAdmin() {
  const modal = document.getElementById('modalNuevoClienteAdmin');
  if (modal) modal.style.display = 'none';
}
window.cerrarModalNuevoClienteAdmin = cerrarModalNuevoClienteAdmin;

/**
 * Maneja la selección visual y de valor del rol en el modal de admin
 */
function seleccionarRolAdmin(rol) {
  const input = document.getElementById('admin_cli_rol');
  const btnMama = document.getElementById('admin_role_mama');
  const btnPapa = document.getElementById('admin_role_papa');
  const btnFam = document.getElementById('admin_role_familiar');

  // Si hace clic en el rol que ya estaba seleccionado, permite deseleccionarlo
  if (input && input.value === rol && rol !== '') {
    rol = '';
  }

  if (input) input.value = rol || '';

  const buttons = [
    { el: btnMama, val: 'mama', activeBg: '#e84c9a', activeBorder: '#e84c9a' },
    { el: btnPapa, val: 'papa', activeBg: '#3bb6c4', activeBorder: '#3bb6c4' },
    { el: btnFam, val: 'Familiar', activeBg: '#8b5cf6', activeBorder: '#8b5cf6' }
  ];

  buttons.forEach(({ el, val, activeBg, activeBorder }) => {
    if (!el) return;
    if (rol && val === rol) {
      el.classList.add('active');
      el.style.background = activeBg;
      el.style.color = '#ffffff';
      el.style.borderColor = activeBorder;
      el.style.fontWeight = '700';
      el.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.15)';
    } else {
      el.classList.remove('active');
      el.style.background = '#ffffff';
      el.style.color = '#475569';
      el.style.borderColor = '#e2e8f0';
      el.style.fontWeight = '600';
      el.style.boxShadow = 'none';
    }
  });
}
window.seleccionarRolAdmin = seleccionarRolAdmin;

/**
 * Muestra las secciones de Peque 2 y Peque 3 secuencialmente
 */
function toggleMultiPequeAdmin() {
  const sec2 = document.getElementById('admin-section-peque-2');
  const sec3 = document.getElementById('admin-section-peque-3');
  const btn = document.getElementById('admin-btn-agregar-peque');

  if (sec2 && sec2.style.display === 'none') {
    sec2.style.display = 'block';
  } else if (sec3 && sec3.style.display === 'none') {
    sec3.style.display = 'block';
    if (btn) btn.style.display = 'none';
  }
}
window.toggleMultiPequeAdmin = toggleMultiPequeAdmin;

/**
 * Guarda los datos del cliente en Supabase directamente
 */
async function guardarNuevoClienteAdmin() {
  const btn = document.getElementById('btnGuardarNuevoClienteAdmin');
  const msg = document.getElementById('adminCliMsg');
  const originalText = btn ? btn.innerHTML : 'Guardar Cliente ✨';

  const nombre = document.getElementById('admin_cli_nombre')?.value.trim();
  const email = document.getElementById('admin_cli_email')?.value.trim().toLowerCase();
  const ciudad = document.getElementById('admin_cli_ciudad')?.value;

  if (!nombre || !email || !ciudad) {
    if (msg) {
      msg.style.color = '#ef4444';
      msg.textContent = '⚠️ Nombre completo, correo electrónico y ciudad son obligatorios.';
    }
    if (!nombre) document.getElementById('admin_cli_nombre')?.focus();
    else if (!email) document.getElementById('admin_cli_email')?.focus();
    else if (!ciudad) document.getElementById('admin_cli_ciudad')?.focus();
    return;
  }

  // Validación básica de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    if (msg) {
      msg.style.color = '#ef4444';
      msg.textContent = '⚠️ Por favor, ingresa un correo electrónico válido.';
    }
    document.getElementById('admin_cli_email')?.focus();
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Guardando cliente... ⏳';
  }
  if (msg) {
    msg.style.color = '#0284c7';
    msg.textContent = 'Guardando datos en Supabase...';
  }

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) {
      throw new Error("Cliente de conexión a Supabase no disponible.");
    }

    // 1. Verificar si el correo ya está registrado en clientes
    const { data: existente, error: errCheck } = await client
      .from('clientes')
      .select('id, email, nombre')
      .ilike('email', email)
      .maybeSingle();

    if (errCheck && errCheck.code !== 'PGRST116') {
      console.warn("Aviso al verificar cliente existente:", errCheck.message);
    }

    if (existente) {
      throw new Error(`Ya existe un cliente registrado con el correo "${email}" (${existente.nombre || 'Sin nombre'}).`);
    }

    // 2. Preparar payload con toda la información disponible
    const insertPayload = {
      nombre: nombre,
      email: email,
      ciudad: document.getElementById('admin_cli_ciudad')?.value || null,
      rol: document.getElementById('admin_cli_rol')?.value || null,
      telefono: document.getElementById('admin_cli_tel')?.value.trim() || null,
      emergencia: document.getElementById('admin_cli_emergencia')?.value.trim() || null,
      direccion: document.getElementById('admin_cli_direccion')?.value.trim() || null,
      ubicacion: document.getElementById('admin_cli_ubicacion')?.value.trim() || null,
      mascotas: document.getElementById('admin_cli_mascotas')?.value.trim() || null,

      // Peque 1
      peque_nombre: document.getElementById('admin_cli_peque_nombre')?.value.trim() || null,
      peque_nacimiento: document.getElementById('admin_cli_peque_nac')?.value || null,
      peque_edad: typeof calcularEdadPeque === 'function' ? (calcularEdadPeque(document.getElementById('admin_cli_peque_nac')?.value) || null) : null,
      alergias: document.getElementById('admin_cli_alergias')?.value.trim() || null,
      condicion_medica: document.getElementById('admin_cli_condicion')?.value.trim() || null,
      salud_actual: document.getElementById('admin_cli_salud')?.value.trim() || null,
      preferencias: document.getElementById('admin_cli_preferencias')?.value.trim() || null,

      // Peque 2
      peque_nombre_2: document.getElementById('admin_cli_peque_nombre_2')?.value.trim() || null,
      peque_nacimiento_2: document.getElementById('admin_cli_peque_nac_2')?.value || null,
      peque_edad_2: typeof calcularEdadPeque === 'function' ? (calcularEdadPeque(document.getElementById('admin_cli_peque_nac_2')?.value) || null) : null,
      alergias_2: document.getElementById('admin_cli_alergias_2')?.value.trim() || null,
      condicion_medica_2: document.getElementById('admin_cli_condicion_2')?.value.trim() || null,
      salud_actual_2: document.getElementById('admin_cli_salud_2')?.value.trim() || null,
      preferencias_2: document.getElementById('admin_cli_preferencias_2')?.value.trim() || null,

      // Peque 3
      peque_nombre_3: document.getElementById('admin_cli_peque_nombre_3')?.value.trim() || null,
      peque_nacimiento_3: document.getElementById('admin_cli_peque_nac_3')?.value || null,
      peque_edad_3: typeof calcularEdadPeque === 'function' ? (calcularEdadPeque(document.getElementById('admin_cli_peque_nac_3')?.value) || null) : null,
      alergias_3: document.getElementById('admin_cli_alergias_3')?.value.trim() || null,
      condicion_medica_3: document.getElementById('admin_cli_condicion_3')?.value.trim() || null,
      salud_actual_3: document.getElementById('admin_cli_salud_3')?.value.trim() || null,
      preferencias_3: document.getElementById('admin_cli_preferencias_3')?.value.trim() || null,

      activo: true,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    };

    // 3. Insertar en tabla clientes
    const { error: insertErr } = await client
      .from('clientes')
      .insert([insertPayload]);

    if (insertErr) throw insertErr;

    console.log("✅ [Admin Nuevo Cliente] Cliente registrado exitosamente:", email);

    if (msg) {
      msg.style.color = '#10b981';
      msg.textContent = '✅ ¡Cliente registrado con éxito!';
    }

    // Refrescar lista de clientes en panel
    if (typeof cargarClientesSupabase === 'function') {
      await cargarClientesSupabase(true);
    }

    if (typeof mostrarToast === 'function') {
      mostrarToast(`Cliente ${nombre} registrado con éxito`);
    }

    setTimeout(() => {
      cerrarModalNuevoClienteAdmin();
    }, 900);

  } catch (err) {
    console.error("❌ [Admin Nuevo Cliente Error]:", err);
    if (msg) {
      msg.style.color = '#ef4444';
      msg.textContent = '❌ Error: ' + err.message;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}
window.guardarNuevoClienteAdmin = guardarNuevoClienteAdmin;

// =========================================================================
// GESTIÓN DE NUEVA NANNY (ADMIN)
// =========================================================================

/**
 * Abre el modal para registrar una nueva niñera desde el panel de administración
 */
function abrirModalNuevaNannyAdmin() {
  const modal = document.getElementById('modalNuevaNannyAdmin');
  const form = document.getElementById('formNuevaNannyAdmin');
  const msg = document.getElementById('adminNanMsg');

  if (form) form.reset();
  if (msg) {
    msg.textContent = '';
    msg.style.color = '';
  }

  const inMin = document.getElementById('admin_nan_min_edad');
  const inMax = document.getElementById('admin_nan_max_edad');
  if (inMin) inMin.value = '0';
  if (inMax) inMax.value = '12';
  actualizarPreviewEdadesNanny();

  if (modal) modal.style.display = 'flex';
  setTimeout(() => {
    document.getElementById('admin_nan_nombre')?.focus();
  }, 100);
}
window.abrirModalNuevaNannyAdmin = abrirModalNuevaNannyAdmin;

/**
 * Cierra el modal de registro de nueva niñera
 */
function cerrarModalNuevaNannyAdmin() {
  const modal = document.getElementById('modalNuevaNannyAdmin');
  if (modal) modal.style.display = 'none';
}
window.cerrarModalNuevaNannyAdmin = cerrarModalNuevaNannyAdmin;

/**
 * Permite seleccionar rangos de edad rápidos mediante botones chip
 */
function seleccionarRangoEdadesNanny(min, max, btnEl) {
  const inMin = document.getElementById('admin_nan_min_edad');
  const inMax = document.getElementById('admin_nan_max_edad');
  if (inMin) inMin.value = min;
  if (inMax) inMax.value = max;
  actualizarPreviewEdadesNanny();

  const container = btnEl?.parentElement;
  if (container) {
    container.querySelectorAll('.admin-age-chip').forEach(b => {
      b.style.background = '#ffffff';
      b.style.color = '#475569';
      b.style.borderColor = '#e2e8f0';
      b.style.fontWeight = '600';
    });
    if (btnEl) {
      btnEl.style.background = '#e0f7fa';
      btnEl.style.color = '#00838f';
      btnEl.style.borderColor = '#3bb6c4';
      btnEl.style.fontWeight = '700';
    }
  }
}
window.seleccionarRangoEdadesNanny = seleccionarRangoEdadesNanny;

/**
 * Actualiza el texto de vista previa del rango de edades
 */
function actualizarPreviewEdadesNanny() {
  const inMin = document.getElementById('admin_nan_min_edad');
  const inMax = document.getElementById('admin_nan_max_edad');
  const preview = document.getElementById('admin_nan_rango_preview');
  if (!preview) return;
  const min = inMin ? parseInt(inMin.value, 10) : 0;
  const max = inMax ? parseInt(inMax.value, 10) : 12;
  if (isNaN(min) || isNaN(max)) {
    preview.textContent = 'Todas las edades';
  } else if (min === 0 && max >= 12) {
    preview.textContent = 'Todas las edades (0 a 12+ años)';
  } else {
    preview.textContent = `${min} a ${max} años`;
  }
}
window.actualizarPreviewEdadesNanny = actualizarPreviewEdadesNanny;

/**
 * Guarda y autoriza a una nueva niñera directamente en la tabla 'nannys' de Supabase
 */
async function guardarNuevaNannyAdmin() {
  const msg = document.getElementById('adminNanMsg');
  const btn = document.getElementById('btnGuardarNuevaNannyAdmin');

  const nombre = document.getElementById('admin_nan_nombre')?.value.trim();
  const email = document.getElementById('admin_nan_email')?.value.trim().toLowerCase();
  const ciudad = document.getElementById('admin_nan_ciudad')?.value.trim();
  const minEdadRaw = document.getElementById('admin_nan_min_edad')?.value;
  const maxEdadRaw = document.getElementById('admin_nan_max_edad')?.value;

  if (!nombre || !email || !ciudad) {
    if (msg) {
      msg.style.color = '#ef4444';
      msg.textContent = '❌ Por favor completa todos los campos obligatorios (Nombre, Email y Ciudad).';
    }
    return;
  }

  // Validación básica de formato de correo
  if (!email.includes('@') || !email.includes('.')) {
    if (msg) {
      msg.style.color = '#ef4444';
      msg.textContent = '❌ Por favor ingresa un correo electrónico válido.';
    }
    return;
  }

  const min_edad = (minEdadRaw !== '' && minEdadRaw != null) ? parseInt(minEdadRaw, 10) : 0;
  const max_edad = (maxEdadRaw !== '' && maxEdadRaw != null) ? parseInt(maxEdadRaw, 10) : 12;

  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Guardando y autorizando...';
  }
  if (msg) {
    msg.style.color = '#0284c7';
    msg.textContent = 'Conectando con base de datos en Supabase...';
  }

  try {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error("Cliente de Supabase no disponible");

    // Verificar si ya existe una niñera con ese email
    const { data: existeNan, error: checkErr } = await client
      .from('nannys')
      .select('id, email, nombre')
      .eq('email', email)
      .maybeSingle();

    if (checkErr && checkErr.code !== 'PGRST116') {
      console.warn("Aviso al verificar niñera existente:", checkErr);
    }

    if (existeNan) {
      throw new Error(`Ya existe una niñera registrada con el correo "${email}" (${existeNan.nombre || 'Sin nombre'}).`);
    }

    const payload = {
      nombre: nombre,
      email: email,
      ciudad: ciudad,
      min_edad: isNaN(min_edad) ? 0 : min_edad,
      max_edad: isNaN(max_edad) ? 12 : max_edad,
      activo: true,
      rol: 'nanny',
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    };

    const { data: insertedData, error: insertErr } = await client
      .from('nannys')
      .insert([payload])
      .select();

    if (insertErr) throw insertErr;

    console.log("✅ [Admin Nueva Nanny] Niñera autorizada y registrada exitosamente:", email, insertedData);

    if (msg) {
      msg.style.color = '#10b981';
      msg.textContent = '✅ ¡Niñera autorizada y registrada con éxito!';
    }

    // Refrescar lista de niñeras en el panel
    if (typeof cargarNannysSupabase === 'function') {
      await cargarNannysSupabase(true);
    }

    if (typeof mostrarToast === 'function') {
      mostrarToast(`Niñera ${nombre} autorizada y registrada con éxito`);
    }

    setTimeout(() => {
      cerrarModalNuevaNannyAdmin();
    }, 900);

  } catch (err) {
    console.error("❌ [Admin Nueva Nanny Error]:", err);
    if (msg) {
      msg.style.color = '#ef4444';
      msg.textContent = '❌ Error: ' + err.message;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}
window.guardarNuevaNannyAdmin = guardarNuevaNannyAdmin;



/**
 * ==========================================================================
 * CONTROL DE ZOOM EXCLUSIVO PARA LA MATRIZ DE SERVICIOS
 * Permite ajustar la escala visual de la tabla (60% a 160%) mediante botones
 * en la cabecera o con atajo Ctrl + Rueda del ratón sobre la matriz.
 * ==========================================================================
 */
let _zoomMatriz = 1.0;
let _hudTimeout = null;

function mostrarHudZoom(texto) {
  let hud = document.getElementById("csZoomHud");
  if (!hud) {
    hud = document.createElement("div");
    hud.id = "csZoomHud";
    hud.className = "cs-zoom-hud";
    document.body.appendChild(hud);
  }
  hud.textContent = "🔍 Zoom: " + texto;
  hud.classList.add("visible");
  if (_hudTimeout) clearTimeout(_hudTimeout);
  _hudTimeout = setTimeout(() => {
    hud.classList.remove("visible");
  }, 1200);
}

function aplicarZoomMatriz(nuevoZoom, mostrarHud = false) {
  _zoomMatriz = Math.max(0.6, Math.min(1.6, Math.round(nuevoZoom * 100) / 100));
  const table = document.querySelector("#panelServicios .cs-table");
  if (table) {
    table.style.zoom = _zoomMatriz;
  }
  const label = document.getElementById("csZoomLevel");
  if (label) {
    label.textContent = Math.round(_zoomMatriz * 100) + "%";
  }
  try {
    localStorage.setItem("nyp_cs_zoom", _zoomMatriz.toString());
  } catch (e) { }
  if (mostrarHud) {
    mostrarHudZoom(Math.round(_zoomMatriz * 100) + "%");
  }
}

function cambiarZoomMatriz(delta) {
  aplicarZoomMatriz(_zoomMatriz + delta, true);
}

function resetZoomMatriz() {
  aplicarZoomMatriz(1.0, true);
}

function initMatrixZoom() {
  try {
    const saved = localStorage.getItem("nyp_cs_zoom");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.6 && parsed <= 1.6) {
        _zoomMatriz = parsed;
      }
    }
  } catch (e) { }
  aplicarZoomMatriz(_zoomMatriz, false);
  const panel = document.getElementById("panelServicios");
  if (panel && !panel._zoomWheelAttached) {
    panel._zoomWheelAttached = true;
    panel.addEventListener("wheel", (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        cambiarZoomMatriz(delta);
      }
    }, { passive: false });
  }
}

window.aplicarZoomMatriz = aplicarZoomMatriz;

window.cambiarZoomMatriz = cambiarZoomMatriz;
window.resetZoomMatriz = resetZoomMatriz;
window.initMatrixZoom = initMatrixZoom;

/**
 * ==========================================================================
 * SELECTOR DE SEMANAS CON CALENDARIO DE MESES Y NAVEGACIÓN "HOY"
 * Permite navegar meses, seleccionar semanas completas visualmente y
 * regresar con 1 clic a la semana actual.
 * ==========================================================================
 */
let _calAnioVisualizado = null;
let _calMesVisualizado = null;

function toggleCalendarioSemanas(e) {
  if (e) e.stopPropagation();
  const drop = document.getElementById("csCalendarDropdown");
  if (!drop) return;
  if (drop.style.display === "block") {
    cerrarCalendarioSemanas();
  } else {
    abrirCalendarioSemanas();
  }
}

function abrirCalendarioSemanas() {
  const drop = document.getElementById("csCalendarDropdown");
  if (!drop) return;
  const baseIso = _currentSemanaMatrizIso || getMondayISO(new Date());
  const parts = baseIso.split("-").map(Number);
  _calAnioVisualizado = parts[0];
  _calMesVisualizado = parts[1] - 1;
  renderizarCalendarioSemanas();
  drop.style.display = "block";
  setTimeout(() => {
    document.addEventListener("click", _handleClickOutsideCal);
    document.addEventListener("keydown", _handleKeydownCal);
  }, 10);
}

function cerrarCalendarioSemanas() {
  const drop = document.getElementById("csCalendarDropdown");
  if (drop) drop.style.display = "none";
  document.removeEventListener("click", _handleClickOutsideCal);
  document.removeEventListener("keydown", _handleKeydownCal);
}

function _handleClickOutsideCal(e) {
  const drop = document.getElementById("csCalendarDropdown");
  const toggleBtn = document.getElementById("csBtnCalendarToggle");
  const label = document.getElementById("csWeekLabel");
  if (drop && !drop.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target)) && (!label || !label.contains(e.target))) {
    cerrarCalendarioSemanas();
  }
}

function _handleKeydownCal(e) {
  if (e.key === "Escape") {
    cerrarCalendarioSemanas();
  }
}

function cambiarMesCalendario(dir) {
  _calMesVisualizado += dir;
  if (_calMesVisualizado < 0) {
    _calMesVisualizado = 11;
    _calAnioVisualizado--;
  } else if (_calMesVisualizado > 11) {
    _calMesVisualizado = 0;
    _calAnioVisualizado++;
  }
  renderizarCalendarioSemanas();
}

function renderizarCalendarioSemanas() {
  const titleEl = document.getElementById("csCalMonthTitle");
  const bodyEl = document.getElementById("csCalWeeksBody");
  if (!titleEl || !bodyEl) return;
  const mesesNombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  titleEl.textContent = mesesNombres[_calMesVisualizado] + " " + _calAnioVisualizado;
  const weeks = calcularSemanasDelMes(_calAnioVisualizado, _calMesVisualizado);
  const hoyDate = new Date();
  const hoyIso = hoyDate.getFullYear() + "-" + String(hoyDate.getMonth() + 1).padStart(2, "0") + "-" + String(hoyDate.getDate()).padStart(2, "0");
  const semanaActiva = _currentSemanaMatrizIso || getMondayISO(new Date());
  let html = "";
  weeks.forEach(week => {
    const isActive = week.mondayIso === semanaActiva;
    const activeClass = isActive ? " cs-cal-week-active" : "";
    html += `<div class="cs-cal-week-row${activeClass}" onclick="seleccionarSemanaDesdeCalendario('${week.mondayIso}')" title="Ver semana del ${week.labelRango}">`;
    week.days.forEach(d => {
      const isOtherMonth = !d.isCurrentMonth ? " cs-other-month" : "";
      const isToday = d.iso === hoyIso ? " cs-is-today" : "";
      html += `<div class="cs-cal-day${isOtherMonth}${isToday}"><span>${d.dayNum}</span></div>`;
    });
    html += "</div>";
  });
  bodyEl.innerHTML = html;
}

function actualizarEstadoBotonHoy() {
  const hoyLunes = getMondayISO(new Date());
  const btnHoy = document.getElementById("csBtnHoy");
  if (!btnHoy) return;
  if (_currentSemanaMatrizIso === hoyLunes) {
    btnHoy.classList.add("is-current-week");
    btnHoy.title = "Semana actual activa";
  } else {
    btnHoy.classList.remove("is-current-week");
    btnHoy.title = "Volver a la semana actual";
  }
}

window.toggleCalendarioSemanas = toggleCalendarioSemanas;
window.abrirCalendarioSemanas = abrirCalendarioSemanas;
window.cerrarCalendarioSemanas = cerrarCalendarioSemanas;
window.cambiarMesCalendario = cambiarMesCalendario;
window.seleccionarSemanaDesdeCalendario = seleccionarSemanaDesdeCalendario;
window.irSemanaActual = irSemanaActual;
window.actualizarEstadoBotonHoy = actualizarEstadoBotonHoy;

if (typeof window.confirmarLogout !== 'function') {
  window.confirmarLogout = async function () {
    if (typeof Swal !== 'undefined') {
      const res = await Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que deseas salir de la sesión actual?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: { popup: 'cs-swal-popup' }
      });
      if (res.isConfirmed) {
        if (typeof logout === 'function') logout();
        else window.location.href = 'index.html';
      }
    } else {
      if (confirm('¿Estás seguro de que deseas salir de la sesión?')) {
        if (typeof logout === 'function') logout();
        else window.location.href = 'index.html';
      }
    }
  };
}

window.initCustomAutocompleteDropdown = initCustomAutocompleteDropdown;
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCustomAutocompleteDropdown());
  } else {
    initCustomAutocompleteDropdown();
  }
}

/**
 * ==========================================================================
 * MÓDULO: SERVICIOS BASE (PLANTILLA MAESTRA DE SERVICIOS FIJOS)
 * Permite editar una plantilla de servicios fijos e insertarlos rápidamente
 * semana a semana en el bloque de "Servicios fijos" de la semana activa.
 * ==========================================================================
 */

/**
 * Abre o cierra el menú desplegable de "Servicios base" en el header
 */
function toggleMenuServiciosBase(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const menus = document.querySelectorAll('.cs-servicios-base-menu');
  const dropdowns = document.querySelectorAll('.cs-dropdown-servicios-base');

  let wasOpen = false;
  menus.forEach(m => {
    if (m.style.display === 'flex' || m.style.display === 'block') wasOpen = true;
  });

  if (wasOpen) {
    cerrarMenuServiciosBase();
  } else {
    menus.forEach(m => { m.style.display = 'flex'; });
    dropdowns.forEach(d => { d.classList.add('is-open'); });
    setTimeout(() => {
      document.addEventListener('click', _handleClickOutsideServiciosBaseMenu);
      document.addEventListener('keydown', _handleKeydownServiciosBaseMenu);
    }, 10);
  }
}

function cerrarMenuServiciosBase() {
  const menus = document.querySelectorAll('.cs-servicios-base-menu');
  const dropdowns = document.querySelectorAll('.cs-dropdown-servicios-base');
  menus.forEach(m => { m.style.display = 'none'; });
  dropdowns.forEach(d => { d.classList.remove('is-open'); });
  document.removeEventListener('click', _handleClickOutsideServiciosBaseMenu);
  document.removeEventListener('keydown', _handleKeydownServiciosBaseMenu);
}

function _handleClickOutsideServiciosBaseMenu(e) {
  const dropdowns = document.querySelectorAll('.cs-dropdown-servicios-base');
  let clickedInside = false;
  dropdowns.forEach(d => {
    if (d && d.contains(e.target)) clickedInside = true;
  });
  if (!clickedInside) {
    cerrarMenuServiciosBase();
  }
}

function _handleKeydownServiciosBaseMenu(e) {
  if (e.key === 'Escape') {
    cerrarMenuServiciosBase();
  }
}

let _sbModoClientePerdido = false;

/**
 * Registra un evento analítico de cliente fijo (cliente_nuevo +1 o cliente_perdido -1)
 * en Supabase (tabla metricas_servicios) y LocalStorage con respaldo completo para futuros reportes.
 */
async function registrarEventoMetricaCliente({ tipo, cliente_nombre, semana_iso, valor = 1, servicio_id = null, detalles = null }) {
  if (!cliente_nombre || !semana_iso) return;
  const evt = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    tipo, // 'cliente_nuevo' | 'cliente_perdido'
    cliente_nombre: String(cliente_nombre).trim(),
    semana_iso: String(semana_iso).trim(),
    valor: Number(valor) || (tipo === 'cliente_nuevo' ? 1 : -1),
    servicio_id: servicio_id || null,
    detalles: detalles || {},
    creado_en: new Date().toISOString()
  };

  // 1. Guardar en LocalStorage como respaldo continuo
  try {
    const key = 'nyp_metricas_servicios';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push(evt);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn('⚠️ Error guardando métrica en LocalStorage:', e);
  }

  // 2. Guardar en Supabase si está disponible
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (client) {
    try {
      const { error } = await client
        .from('metricas_servicios')
        .insert([evt]);
      if (error) {
        console.warn('ℹ️ Nota Supabase (metricas_servicios):', error.message);
      } else {
        console.log(`📊 [Métricas] Evento registrado en Supabase: ${tipo} -> ${cliente_nombre} (${semana_iso})`);
      }
    } catch (err) {
      console.warn('ℹ️ Error al enviar métrica a Supabase (usando respaldo local):', err);
    }
  }
}

/**
 * Abre el modal de edición de la Plantilla de Servicios Base (Fullscreen)
 */
async function abrirModalServiciosBase() {
  cerrarMenuServiciosBase();
  cancelarModoClientePerdido();
  const modal = document.getElementById('modalServiciosBase');
  if (!modal) return;

  modal.style.display = 'flex';

  // 1. Carga instantánea (0ms) desde LocalStorage si existe para evitar pantallas de carga de 20s
  let cachedRows = null;
  try {
    const localStr = localStorage.getItem('nyp_servicios_base_plantilla');
    if (localStr) {
      const parsed = JSON.parse(localStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedRows = parsed.map(s => decodificarServicioSupabase(s));
      }
    }
  } catch (e) { }

  const tbody = document.getElementById('csSbTableBody');
  if (cachedRows && cachedRows.length > 0) {
    // Renderizado inmediato sin esperar a la red
    renderizarTablaServiciosBase(cachedRows);
  } else if (tbody) {
    tbody.innerHTML = `
      <tr class="cs-loading-row">
        <td colspan="26" style="text-align:center; padding:30px 10px; color:#64748b; font-size:13px;">
          <span style="font-size:18px; display:inline-block; animation:spin 1s infinite linear;">⏳</span> Cargando plantilla de servicios base...
        </td>
      </tr>
    `;
  }

  // 2. Revalidar en segundo plano con Supabase y actualizar si hay cambios
  try {
    const serviciosBase = await obtenerPlantillaServiciosBase();
    if (Array.isArray(serviciosBase) && serviciosBase.length > 0) {
      renderizarTablaServiciosBase(serviciosBase);
    }
  } catch (err) {
    console.warn("⚠️ Aviso al revalidar plantilla base:", err);
  }
}

/**
 * Cierra el modal de la Plantilla de Servicios Base
 */
function cerrarModalServiciosBase() {
  cancelarModoClientePerdido();
  const modal = document.getElementById('modalServiciosBase');
  if (modal) modal.style.display = 'none';
}

/**
 * Consulta la plantilla de servicios base desde Supabase con fallback a LocalStorage
 */
async function obtenerPlantillaServiciosBase() {
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  let rows = [];

  if (client) {
    try {
      const { data, error } = await client
        .from('control_servicios')
        .select('*')
        .eq('semana_iso', '__PLANTILLA_BASE__')
        .order('orden', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        rows = data.map(s => decodificarServicioSupabase(s));
        try {
          localStorage.setItem('nyp_servicios_base_plantilla', JSON.stringify(rows));
        } catch (e) { }
        return rows;
      }
    } catch (err) {
      console.warn("⚠️ Error consultando plantilla base en Supabase:", err);
    }
  }

  // Fallback LocalStorage
  try {
    const localStr = localStorage.getItem('nyp_servicios_base_plantilla');
    if (localStr) {
      rows = JSON.parse(localStr);
      if (Array.isArray(rows)) return rows;
    }
  } catch (e) { }

  return [];
}

/**
 * Renderiza la tabla dentro del modal de Servicios Base con layout idéntico a la matriz
 */
function renderizarTablaServiciosBase(servicios) {
  const tbody = document.getElementById('csSbTableBody');
  const countEl = document.getElementById('csSbTotalFilas');
  if (!tbody) return;

  const cNorm = normalizarTextoCS(_currentCiudadMatriz || 'Puebla');
  const listaCompleta = Array.isArray(servicios) ? servicios : [];
  const lista = listaCompleta.filter(s => normalizarTextoCS((s && s.ciudad) || 'Puebla') === cNorm);

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr class="cs-sb-empty-tr">
        <td colspan="28" class="cs-sb-empty-state">
          <span class="cs-sb-empty-icon">📋</span>
          <p style="margin:0; font-weight:600; font-size:14px; color:#334155;">No hay servicios fijos base configurados en la plantilla para ${_csEscapeHTML(_currentCiudadMatriz || 'Puebla')}.</p>
          <p style="margin:4px 0 0 0; font-size:12px; color:#64748b;">Haz clic en <strong>"➕ Nuevo cliente"</strong> para agregar un servicio fijo a la plantilla de esta ciudad.</p>
        </td>
      </tr>
    `;
    if (countEl) countEl.textContent = `0 servicios base en ${_currentCiudadMatriz || 'Puebla'}`;
    return;
  }

  let html = '';
  lista.forEach((s, idx) => {
    const srv = {
      ...s,
      semana_iso: '__PLANTILLA_BASE__',
      bloque: 'servicios_fijos',
      ciudad: _currentCiudadMatriz || s.ciudad || 'Puebla'
    };
    const rowId = srv.id || `sb_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
    const esNuevo = esServicioNuevoCliente(srv.observaciones);
    const cliNombre = (srv.cliente_nombre || '').replace(/"/g, '&quot;');

    const actionCell = _sbModoClientePerdido
      ? `<td style="text-align: center; vertical-align: middle;">
           <input type="checkbox" class="cs-sb-loss-checkbox" onchange="handleSbLossCheckboxChange(this)" data-id="${rowId}" data-client-name="${cliNombre}">
         </td>`
      : `<td style="text-align: center; vertical-align: middle;">
           <button type="button" class="cs-sb-btn-delete-row" onclick="eliminarFilaServiciosBase(this)" title="Eliminar fila de la plantilla">🗑️</button>
         </td>`;

    html += `
      <tr class="cs-row-item" data-id="${rowId}" data-bloque="servicios_fijos" data-semana-iso="__PLANTILLA_BASE__" data-ciudad="${srv.ciudad}" data-nuevo-cliente="${esNuevo ? 'true' : 'false'}">
        ${renderCeldasFilaServicioHtml(srv)}
        ${actionCell}
      </tr>
    `;
  });

  tbody.innerHTML = html;
  actualizarContadorPlantillaServiciosBase();

  const sbTable = tbody.closest('table') || document.querySelector('.cs-sb-table');
  if (sbTable) {
    initColumnResize(sbTable);
  }
}

/**
 * Actualiza el contador de servicios base configurados en el modal
 */
function actualizarContadorPlantillaServiciosBase() {
  const tbody = document.getElementById('csSbTableBody');
  const countEl = document.getElementById('csSbTotalFilas');
  if (!tbody || !countEl) return;

  const rows = tbody.querySelectorAll('tr.cs-row-item');
  let conDatos = 0;
  rows.forEach(r => {
    if (filaTieneDatos(r)) conDatos++;
  });
  countEl.textContent = `${conDatos} de ${rows.length} servicios base con datos`;
}

/**
 * Agrega una nueva fila de servicio en blanco marcada como NUEVO CLIENTE FIJO (+1) a la plantilla
 */
function agregarFilaServiciosBase() {
  // Asegurarse de estar en modo normal
  if (_sbModoClientePerdido) {
    cancelarModoClientePerdido();
  }

  const tbody = document.getElementById('csSbTableBody');
  if (!tbody) return;

  // Remover fila vacía si existe
  const emptyTr = tbody.querySelector('.cs-sb-empty-tr');
  if (emptyTr) emptyTr.remove();

  const newId = `sb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const nuevoServicio = {
    id: newId,
    semana_iso: '__PLANTILLA_BASE__',
    bloque: 'servicios_fijos',
    orden: tbody.querySelectorAll('tr.cs-row-item').length,
    lun_inicio: '', lun_fin: '',
    mar_inicio: '', mar_fin: '',
    mie_inicio: '', mie_fin: '',
    jue_inicio: '', jue_fin: '',
    vie_inicio: '', vie_fin: '',
    sab_inicio: '', sab_fin: '',
    dom_inicio: '', dom_fin: '',
    tipo_servicio: '',
    cliente_email: '',
    cliente_nombre: '',
    ok_cliente: false,
    zona: '',
    nanny_nombre: '',
    ok_nanny: false,
    tarifa_cliente: '',
    tarifa_nanny: '',
    saldo_cliente: '',
    pago_nanny: '',
    alerta: '',
    observaciones: '<!--nuevo_cliente:1-->'
  };

  const tr = document.createElement('tr');
  tr.className = 'cs-row-item';
  tr.setAttribute('data-id', newId);
  tr.setAttribute('data-bloque', 'servicios_fijos');
  tr.setAttribute('data-semana-iso', '__PLANTILLA_BASE__');
  tr.setAttribute('data-nuevo-cliente', 'true');
  tr.innerHTML = `
    ${renderCeldasFilaServicioHtml(nuevoServicio)}
    <td style="text-align: center; vertical-align: middle;">
      <button type="button" class="cs-sb-btn-delete-row" onclick="eliminarFilaServiciosBase(this)" title="Eliminar fila de la plantilla">🗑️</button>
    </td>
  `;

  tbody.appendChild(tr);

  // Animación suave de bienvenida
  tr.style.transition = 'background-color 0.8s ease';
  tr.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
  setTimeout(() => { tr.style.backgroundColor = ''; }, 1000);

  const clientInput = tr.querySelector('[data-field="cliente_nombre"]');
  if (clientInput) clientInput.focus();

  actualizarContadorPlantillaServiciosBase();

  const sbTable = tr.closest('table') || document.querySelector('.cs-sb-table');
  if (sbTable) {
    restaurarAnchosColumnas(sbTable);
  }
}

/**
 * Habilita el modo de multi-selección para seleccionar y registrar Clientes Perdidos (-1)
 */
function abrirClientePerdidoServiciosBase() {
  const tbody = document.getElementById('csSbTableBody');
  const rows = tbody ? tbody.querySelectorAll('tr.cs-row-item') : [];

  if (rows.length === 0) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Sin servicios base',
        text: 'No hay servicios base cargados para seleccionar clientes perdidos.',
        icon: 'info',
        confirmButtonColor: '#4f46e5'
      });
    } else {
      alert('No hay servicios base cargados para seleccionar clientes perdidos.');
    }
    return;
  }

  _sbModoClientePerdido = true;

  // Cambiar visibilidad de barras de herramientas
  const normalToolbar = document.getElementById('csSbNormalToolbar');
  const selectionToolbar = document.getElementById('csSbSelectionToolbar');
  if (normalToolbar) normalToolbar.style.display = 'none';
  if (selectionToolbar) selectionToolbar.style.display = 'flex';

  // Modificar la última columna de cada fila para mostrar checkboxes
  rows.forEach(r => {
    const lastTd = r.querySelector('td:last-child');
    const cliInput = r.querySelector('[data-field="cliente_nombre"]');
    const cliNombre = (cliInput?.value || '').trim();
    const rowId = r.getAttribute('data-id');
    if (lastTd) {
      lastTd.innerHTML = `
        <input type="checkbox" class="cs-sb-loss-checkbox" onchange="handleSbLossCheckboxChange(this)" data-id="${rowId}" data-client-name="${cliNombre.replace(/"/g, '&quot;')}">
      `;
    }
  });

  actualizarContadorSeleccionClientePerdido();
}

/**
 * Cancela el modo de multi-selección de Cliente Perdido y regresa al estado normal
 */
function cancelarModoClientePerdido() {
  _sbModoClientePerdido = false;

  const normalToolbar = document.getElementById('csSbNormalToolbar');
  const selectionToolbar = document.getElementById('csSbSelectionToolbar');
  if (normalToolbar) normalToolbar.style.display = 'flex';
  if (selectionToolbar) selectionToolbar.style.display = 'none';

  const tbody = document.getElementById('csSbTableBody');
  if (tbody) {
    const rows = tbody.querySelectorAll('tr.cs-row-item');
    rows.forEach(r => {
      r.classList.remove('cs-sb-row-selected-for-loss');
      const lastTd = r.querySelector('td:last-child');
      if (lastTd) {
        lastTd.innerHTML = `
          <button type="button" class="cs-sb-btn-delete-row" onclick="eliminarFilaServiciosBase(this)" title="Eliminar fila de la plantilla">🗑️</button>
        `;
      }
    });
  }
}

/**
 * Maneja el cambio de checkbox en modo Cliente Perdido
 */
function handleSbLossCheckboxChange(cb) {
  const row = cb.closest('tr');
  if (row) {
    if (cb.checked) {
      row.classList.add('cs-sb-row-selected-for-loss');
    } else {
      row.classList.remove('cs-sb-row-selected-for-loss');
    }
  }
  actualizarContadorSeleccionClientePerdido();
}

/**
 * Actualiza el contador de clientes seleccionados en la barra de selección
 */
function actualizarContadorSeleccionClientePerdido() {
  const countEl = document.getElementById('csSbSelectionCount');
  const tbody = document.getElementById('csSbTableBody');
  if (!countEl || !tbody) return;

  const checked = tbody.querySelectorAll('.cs-sb-loss-checkbox:checked').length;
  countEl.textContent = `${checked} seleccionado${checked === 1 ? '' : 's'}`;
}

/**
 * Ejecuta el modal de confirmación y procesamiento de bajas para los clientes seleccionados
 */
function confirmarBajaClientesPerdidos() {
  const tbody = document.getElementById('csSbTableBody');
  const checkedBoxes = tbody ? tbody.querySelectorAll('.cs-sb-loss-checkbox:checked') : [];

  if (!checkedBoxes || checkedBoxes.length === 0) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Ningún cliente seleccionado',
        text: 'Por favor selecciona al menos un cliente fijo marcando la casilla a la derecha.',
        icon: 'info',
        confirmButtonColor: '#4f46e5'
      });
    } else {
      alert('Por favor selecciona al menos un cliente fijo para dar de baja.');
    }
    return;
  }

  const clientesSeleccionados = [];
  checkedBoxes.forEach(cb => {
    const row = cb.closest('tr');
    const cliInput = row ? row.querySelector('[data-field="cliente_nombre"]') : null;
    const cliNombre = (cliInput?.value || cb.getAttribute('data-client-name') || 'Cliente sin nombre').trim();
    const rowId = row ? row.getAttribute('data-id') : cb.getAttribute('data-id');
    clientesSeleccionados.push({ id: rowId, nombre: cliNombre, row });
  });

  const nombresHtml = clientesSeleccionados.map(c => `<li>• <strong>${c.nombre}</strong></li>`).join('');

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: `¿Confirmar baja de ${clientesSeleccionados.length} cliente(s)?`,
      html: `
        <div style="text-align: left; font-size: 13.5px; color: #334155; line-height: 1.5;">
          <p style="margin: 0 0 10px 0;">¿Estás seguro de registrar como perdidos a los siguientes clientes fijos?</p>
          <ul style="list-style: none; padding: 8px 12px; margin: 0 0 12px 0; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; max-height: 140px; overflow-y: auto; color: #9f1239;">
            ${nombresHtml}
          </ul>
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            ⚠️ Esta acción marcará en <strong>color rojo</strong> la celda <em>Zona</em> en la última semana donde tuvieron servicio activo, se registrará como <strong>-1 cliente fijo</strong> en las métricas y se eliminarán definitivamente de Servicios Base.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: '📉 Sí, confirmar baja',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: { popup: 'cs-swal-popup' }
    }).then(async (res) => {
      if (res.isConfirmed) {
        await procesarBajaDefinitivaClientesPerdidos(clientesSeleccionados);
      }
    });
  } else {
    if (confirm(`¿Estás seguro de confirmar la baja de ${clientesSeleccionados.length} cliente(s)?`)) {
      procesarBajaDefinitivaClientesPerdidos(clientesSeleccionados);
    }
  }
}

/**
 * Procesa la baja de los clientes perdidos:
 * 1. Localiza su última semana activa en Supabase / LocalStorage.
 * 2. Pinta la celda "Zona" en rojo (#EF4444) en esa última semana.
 * 3. Registra el evento -1 en metricas_servicios.
 * 4. Remueve al cliente de __PLANTILLA_BASE__.
 */
async function procesarBajaDefinitivaClientesPerdidos(clientes) {
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  const semanaActualMatriz = _currentSemanaMatrizIso || getMondayISO(new Date());

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Procesando bajas...',
      text: 'Actualizando semanas activas y plantilla base...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  for (const item of clientes) {
    const cliNombre = item.nombre;
    let ultimaSemanaIso = null;
    let ultimoRegistro = null;

    // 1. Buscar en Supabase la última semana donde apareció este cliente
    if (client && cliNombre && cliNombre !== 'Cliente sin nombre') {
      try {
        const { data, error } = await client
          .from('control_servicios')
          .select('*')
          .neq('semana_iso', '__PLANTILLA_BASE__')
          .ilike('cliente_nombre', cliNombre)
          .order('semana_iso', { ascending: false })
          .limit(1);

        if (!error && Array.isArray(data) && data.length > 0) {
          ultimoRegistro = data[0];
          ultimaSemanaIso = ultimoRegistro.semana_iso;
        }
      } catch (err) {
        console.warn("⚠️ Error buscando última semana del cliente en Supabase:", err);
      }
    }

    // 2. Si encontramos el registro de la última semana, pintar su celda Zona de color Rojo
    if (ultimoRegistro && client) {
      try {
        const { colores, obsLimpia } = extraerColoresDeObservaciones(ultimoRegistro.observaciones || '');
        colores.zona = { bg: '#EF4444', color: '#FFFFFF' };
        const obsConRojo = inyectarColoresEnObservaciones(obsLimpia, colores);

        await client
          .from('control_servicios')
          .update({
            observaciones: obsConRojo,
            actualizado_en: new Date().toISOString()
          })
          .eq('id', ultimoRegistro.id);

        console.log(`🔴 [Cliente Perdido] Celda Zona marcada en rojo para ${cliNombre} en semana ${ultimaSemanaIso}`);
      } catch (err) {
        console.warn("⚠️ Error actualizando color rojo en última semana:", err);
      }
    }

    // 3. Si la última semana es la semana actualmente visualizada en pantalla, actualizar el DOM en vivo
    const semanaAfectada = ultimaSemanaIso || semanaActualMatriz;
    if (semanaAfectada === _currentSemanaMatrizIso) {
      const domRow = document.querySelector(`#csTableBody tr[data-id="${ultimoRegistro?.id}"]`) ||
        Array.from(document.querySelectorAll('#csTableBody tr.cs-row-item')).find(r => {
          const inp = r.querySelector('[data-field="cliente_nombre"]');
          return inp && inp.value.trim().toLowerCase() === cliNombre.toLowerCase();
        });

      if (domRow) {
        const tdZona = domRow.querySelector('td.col-zone');
        if (tdZona) {
          tdZona.setAttribute('data-custom-bg', '#EF4444');
          tdZona.setAttribute('data-custom-color', '#FFFFFF');
          tdZona.style.setProperty('--custom-bg', '#EF4444');
          tdZona.style.setProperty('--custom-color', '#FFFFFF');
          tdZona.style.backgroundColor = '#EF4444';
          tdZona.style.color = '#FFFFFF';
          const inpZona = tdZona.querySelector('input');
          if (inpZona) {
            inpZona.style.color = '#FFFFFF';
          }
        }
      }
    }

    // 4. Registrar evento analítico de -1 cliente perdido
    try {
      await registrarEventoMetricaCliente({
        tipo: 'cliente_perdido',
        cliente_nombre: cliNombre,
        semana_iso: semanaAfectada,
        valor: -1,
        servicio_id: item.id,
        detalles: { ultima_semana_activa: ultimaSemanaIso }
      });
    } catch (e) {
      console.warn("⚠️ Error registrando evento analítico de métrica:", e);
    }

    // 5. Remover la fila de la vista del modal de servicios base
    if (item.row) {
      item.row.remove();
    }
  }

  // 6. Guardar la plantilla de servicios base actualizada (sin los clientes perdidos)
  await guardarPlantillaServiciosBase(false);

  // 7. Salir del modo de selección y actualizar contador
  cancelarModoClientePerdido();
  actualizarContadorPlantillaServiciosBase();

  // 8. Mensaje de confirmación final
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Bajas registradas con éxito',
      text: `Se procesaron ${clientes.length} baja(s) de clientes fijos (-${clientes.length}). Su última semana quedó marcada en rojo y se eliminaron de Servicios Base.`,
      icon: 'success',
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Entendido'
    });
  }
}

/**
 * Elimina una fila individual dentro del modal de servicios base
 */
function eliminarFilaServiciosBase(btn) {
  const row = btn.closest('tr.cs-row-item');
  if (!row) return;

  const rowId = row.getAttribute('data-id');

  row.style.transition = 'all 0.2s ease';
  row.style.opacity = '0';
  row.style.transform = 'translateX(15px)';
  setTimeout(async () => {
    row.remove();
    actualizarContadorPlantillaServiciosBase();
    const tbody = document.getElementById('csSbTableBody');
    if (tbody && tbody.querySelectorAll('tr.cs-row-item').length === 0) {
      renderizarTablaServiciosBase([]);
    }

    // Persistir eliminación individual en Supabase de forma atómica
    if (rowId) {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (client) {
        try {
          await client.from('control_servicios').delete().eq('id', rowId);
          emitirCambioMatrizRealtime(client, {
            action: 'delete',
            servicio_id: rowId,
            semana_iso: '__PLANTILLA_BASE__'
          });
        } catch (e) {
          console.warn('⚠️ Error al eliminar fila base de Supabase:', e);
        }
      }
      // Actualizar localStorage
      try {
        let base = JSON.parse(localStorage.getItem('nyp_servicios_base_plantilla') || '[]');
        if (Array.isArray(base)) {
          base = base.filter(s => s.id !== rowId);
          localStorage.setItem('nyp_servicios_base_plantilla', JSON.stringify(base));
        }
      } catch (e) { }
    }
  }, 180);
}

/**
 * Extrae los datos limpios de todas las filas en el modal de servicios base
 */
function extraerDatosPlantillaServiciosBase() {
  const tbody = document.getElementById('csSbTableBody');
  if (!tbody) return [];

  const rows = tbody.querySelectorAll('tr.cs-row-item');
  const servicios = [];

  rows.forEach((row, idx) => {
    if (filaTieneDatos(row)) {
      const servicio = extraeDatosFila(row, idx);
      if (servicio) {
        servicio.semana_iso = '__PLANTILLA_BASE__';
        servicio.bloque = 'servicios_fijos';
        servicio.ciudad = _currentCiudadMatriz || row.getAttribute('data-ciudad') || 'Puebla';
        servicios.push(servicio);
      }
    }
  });

  return servicios;
}

/**
 * Guarda los servicios base en Supabase y LocalStorage sin sobreescrituras destructivas
 */
async function guardarPlantillaServiciosBase(cerrarAlFinal = false) {
  const datosCiudadActual = extraerDatosPlantillaServiciosBase();
  const cNormActual = normalizarTextoCS(_currentCiudadMatriz || 'Puebla');

  let baseCompleta = [];
  try {
    const localStr = localStorage.getItem('nyp_servicios_base_plantilla');
    if (localStr) baseCompleta = JSON.parse(localStr);
  } catch (e) { }
  if (!Array.isArray(baseCompleta)) baseCompleta = [];

  const otrasCiudades = baseCompleta.filter(item => normalizarTextoCS((item && item.ciudad) || 'Puebla') !== cNormActual);
  const baseActualizada = [...otrasCiudades, ...datosCiudadActual];

  // 1. Guardar en LocalStorage siempre como respaldo offline instantáneo
  try {
    localStorage.setItem('nyp_servicios_base_plantilla', JSON.stringify(baseActualizada));
  } catch (e) { }

  // 2. Guardar en Supabase - Upsert seguro SIN borrar los datos de otras ciudades ni pisar ediciones de otros administradores
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
  if (client) {
    try {
      if (datosCiudadActual.length > 0) {
        const { error } = await ejecutarUpsertControlServicios(client, datosCiudadActual);

        if (error) {
          console.warn("⚠️ Error guardando plantilla base en Supabase:", error.message);
        } else {
          console.log(`✅ [Plantilla Base] ${datosCiudadActual.length} servicios base sincronizados en Supabase.`);
        }
      }

      // Notificar a todos los administradores conectados en vivo
      emitirCambioMatrizRealtime(client, {
        type: 'servicios_base_batch_update',
        semana_iso: '__PLANTILLA_BASE__',
        ciudad: _currentCiudadMatriz || 'Puebla'
      });
    } catch (err) {
      console.warn("⚠️ Error al persistir plantilla base en Supabase:", err);
    }
  }

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: 'Plantilla sincronizada',
      text: `Se han guardado y sincronizado ${datosCiudadActual.length} servicios fijos base para ${_csEscapeHTML(_currentCiudadMatriz || 'Puebla')}. Todos los administradores los verán al instante.`,
      icon: 'success',
      timer: 1800,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  actualizarContadorPlantillaServiciosBase();

  if (cerrarAlFinal) {
    cerrarModalServiciosBase();
  }
}

/**
 * Genera un resumen legible de los días y horarios programados de un servicio base
 */
function resumirDiasYHorasServicio(s) {
  if (!s) return 'Sin horarios';
  const diasKeys = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
  const diasLabels = { lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb', dom: 'Dom' };
  const diasActivos = [];
  let rangoHorario = '';

  diasKeys.forEach(d => {
    const ini = (s[d + '_inicio'] || '').trim();
    const fin = (s[d + '_fin'] || '').trim();
    if (ini && fin) {
      diasActivos.push(diasLabels[d]);
      if (!rangoHorario) rangoHorario = `${ini} - ${fin}`;
    }
  });

  const horas = typeof calcularHorasTotalesServicio === 'function' ? calcularHorasTotalesServicio(s) : 0;
  const horasFmt = typeof formatearHorasTotalesDisplay === 'function' ? formatearHorasTotalesDisplay(horas) : `${horas}h`;

  if (diasActivos.length === 0) return 'Sin horarios asignados';
  const diasStr = diasActivos.join(', ');
  return `${diasStr} ${rangoHorario ? `(${rangoHorario})` : ''} · ${horasFmt}`;
}

// Variable en memoria con los servicios base activos para el modal de selección
let _serviciosBaseParaSeleccionar = [];

/**
 * Abre el diálogo de decisión para insertar todos o solo algunos servicios base
 */
async function insertarServiciosBaseEnSemanaActual() {
  cerrarMenuServiciosBase();

  const todosBase = await obtenerPlantillaServiciosBase();
  const cNormActual = normalizarTextoCS(_currentCiudadMatriz || 'Puebla');
  const serviciosBase = (todosBase || []).filter(s => normalizarTextoCS((s && s.ciudad) || 'Puebla') === cNormActual);

  if (!serviciosBase || serviciosBase.length === 0) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'No hay servicios base para ' + _csEscapeHTML(_currentCiudadMatriz || 'Puebla'),
        text: `Primero debes cargar o editar los servicios fijos en la plantilla de Servicios base para ${_currentCiudadMatriz || 'Puebla'}.`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#64748b',
        confirmButtonText: '✏️ Abrir Editor de Servicios Base',
        cancelButtonText: 'Cancelar'
      }).then((res) => {
        if (res.isConfirmed) {
          abrirModalServiciosBase();
        }
      });
    } else {
      if (confirm(`No hay servicios base cargados para ${_currentCiudadMatriz || 'Puebla'}. ¿Deseas abrir el editor para agregarlos?`)) {
        abrirModalServiciosBase();
      }
    }
    return;
  }

  // Paso 1: Preguntar si desea insertar todos o solo algunos
  if (typeof Swal !== 'undefined') {
    const semanaIso = _currentSemanaMatrizIso || getMondayISO(new Date());
    const semanaLabel = document.getElementById('csWeekLabel')?.textContent || `Semana ${semanaIso}`;

    Swal.fire({
      html: `
        <div style="text-align:center; padding: 4px 0;">
          <div style="width: 54px; height: 54px; margin: 0 auto 12px auto; border-radius: 16px; background: linear-gradient(135deg, #fdf2f8, #fce7f3); display: flex; align-items: center; justify-content: center; font-size: 26px; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15);">📋</div>
          <h3 style="margin: 0 0 6px 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">¿Cómo deseas insertar los Servicios Base?</h3>
          <p style="margin: 0 0 18px 0; font-size: 0.85rem; color: #64748b; line-height: 1.45;">Elige si deseas copiar todos los servicios de la plantilla o seleccionar clientes específicos en <strong>${semanaLabel}</strong>.</p>
          
          <div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">
            <button type="button" id="btnInsertarTodosSB" class="cs-sb-choice-btn">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">📥</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 700; font-size: 0.94rem; color: #0f172a;">Todos los servicios base</div>
                <div style="font-size: 0.78rem; color: #64748b;">Insertar los ${serviciosBase.length} servicios fijos configurados</div>
              </div>
              <span style="font-size: 1.1rem; color: #cbd5e1; font-weight:700;">➔</span>
            </button>

            <button type="button" id="btnInsertarSeleccionSB" class="cs-sb-choice-btn">
              <div style="width: 40px; height: 40px; border-radius: 10px; background: #fdf2f8; color: #db2777; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">✨</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 700; font-size: 0.94rem; color: #0f172a;">Solo algunos servicios base</div>
                <div style="font-size: 0.78rem; color: #64748b;">Elegir de la lista con casillas de verificación</div>
              </div>
              <span style="font-size: 1.1rem; color: #db2777; font-weight:700;">➔</span>
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#94a3b8',
      customClass: { popup: 'cs-swal-popup' },
      didOpen: () => {
        const btnTodos = document.getElementById('btnInsertarTodosSB');
        const btnSel = document.getElementById('btnInsertarSeleccionSB');

        if (btnTodos) {
          btnTodos.addEventListener('click', () => {
            Swal.close();
            ejecutarInsercionServiciosBase(serviciosBase);
          });
        }

        if (btnSel) {
          btnSel.addEventListener('click', () => {
            Swal.close();
            abrirModalSeleccionServiciosBase(serviciosBase);
          });
        }
      }
    });
  } else {
    if (confirm(`¿Deseas insertar TODOS los ${serviciosBase.length} servicios base? (Cancelar para elegir cuáles)`)) {
      ejecutarInsercionServiciosBase(serviciosBase);
    } else {
      abrirModalSeleccionServiciosBase(serviciosBase);
    }
  }
}

/**
 * Abre el modal interactivo de selección de servicios base
 */
function abrirModalSeleccionServiciosBase(serviciosBase = null) {
  if (serviciosBase) {
    _serviciosBaseParaSeleccionar = serviciosBase;
  }

  const modal = document.getElementById('modalSeleccionServiciosBase');
  const listBody = document.getElementById('csSelSbListBody');
  const searchInput = document.getElementById('csSelSbSearchInput');

  if (!modal || !listBody) return;

  if (searchInput) searchInput.value = '';

  renderListaTarjetasSeleccionServiciosBase(_serviciosBaseParaSeleccionar);

  modal.style.display = 'flex';
  actualizarContadorSeleccionServiciosBase();
}

/**
 * Cierra el modal interactivo de selección de servicios base
 */
function cerrarModalSeleccionServiciosBase() {
  const modal = document.getElementById('modalSeleccionServiciosBase');
  if (modal) modal.style.display = 'none';
}

/**
 * Renderiza la lista de tarjetas interactivas de servicios base
 */
function renderListaTarjetasSeleccionServiciosBase(lista) {
  const listBody = document.getElementById('csSelSbListBody');
  if (!listBody) return;

  if (!Array.isArray(lista) || lista.length === 0) {
    listBody.innerHTML = `
      <div style="text-align: center; padding: 32px 16px; color: #94a3b8;">
        <div style="font-size: 32px; margin-bottom: 8px;">📭</div>
        <div style="font-weight: 600; font-size: 0.9rem;">No se encontraron servicios base</div>
      </div>
    `;
    return;
  }

  let html = '';
  lista.forEach((s, idx) => {
    const esNuevo = typeof esServicioNuevoCliente === 'function' && esServicioNuevoCliente(s.observaciones);
    const cliNombre = (s.cliente_nombre || 'Cliente sin nombre').trim();
    const nanNombre = (s.nanny_nombre || '').trim();
    const zonaVal = (s.zona || '').trim();
    const horarioResumen = resumirDiasYHorasServicio(s);
    const tarifaCli = (s.tarifa_cliente || '').trim();
    const tarifaNan = (s.tarifa_nanny || '').trim();

    html += `
      <div class="cs-sel-sb-item-card is-selected" data-idx="${idx}" onclick="handleSbItemCardClick(this, event)">
        <input type="checkbox" class="cs-sel-sb-checkbox" data-sb-idx="${idx}" checked onchange="handleSbItemCheckboxChange(event)">
        <div class="cs-sel-sb-card-info">
          <div class="cs-sel-sb-card-header">
            <span class="cs-sel-sb-card-name">${cliNombre}</span>
            ${esNuevo ? '<span class="cs-sel-sb-tag-nuevo">✨ Cliente Nuevo +1</span>' : ''}
          </div>
          <div class="cs-sel-sb-meta-row">
            <span class="cs-sel-sb-meta-pill ${nanNombre ? 'pill-nanny' : 'pill-nanny no-nanny'}">
              <span>${nanNombre ? '👩‍👧' : '👤'}</span>
              <span>${nanNombre || 'Sin niñera asignada'}</span>
            </span>
            <span class="cs-sel-sb-meta-pill pill-hours">
              <span>${horarioResumen}</span>
            </span>
            ${zonaVal ? `<span class="cs-sel-sb-meta-pill"><span>📍</span><span>${zonaVal}</span></span>` : ''}
            ${(tarifaCli || tarifaNan) ? `<span class="cs-sel-sb-meta-pill"><span>💲</span><span>${tarifaCli ? `$CLI ${tarifaCli}` : ''}${tarifaCli && tarifaNan ? ' · ' : ''}${tarifaNan ? `$NAN ${tarifaNan}` : ''}</span></span>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  listBody.innerHTML = html;
}

/**
 * Filtra la lista de servicios base en el modal en tiempo real
 */
function filtrarListaSeleccionServiciosBase(query) {
  const qNorm = (query || '').trim().toLowerCase();
  const listBody = document.getElementById('csSelSbListBody');
  if (!listBody) return;

  const cards = listBody.querySelectorAll('.cs-sel-sb-item-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = (!qNorm || text.includes(qNorm)) ? 'flex' : 'none';
  });

  actualizarContadorSeleccionServiciosBase();
}

/**
 * Selecciona o deselecciona todas las casillas visibles en el modal
 */
function toggleSeleccionarTodosServiciosBase(seleccionar) {
  const listBody = document.getElementById('csSelSbListBody');
  if (!listBody) return;

  const cards = listBody.querySelectorAll('.cs-sel-sb-item-card');
  cards.forEach(card => {
    if (card.style.display !== 'none') {
      const chk = card.querySelector('.cs-sel-sb-checkbox');
      if (chk) {
        chk.checked = !!seleccionar;
      }
      if (seleccionar) {
        card.classList.add('is-selected');
      } else {
        card.classList.remove('is-selected');
      }
    }
  });

  actualizarContadorSeleccionServiciosBase();
}

/**
 * Manejador del clic en la tarjeta del servicio para alternar la casilla
 */
function handleSbItemCardClick(cardEl, event) {
  if (event.target && event.target.classList.contains('cs-sel-sb-checkbox')) {
    return;
  }
  const chk = cardEl.querySelector('.cs-sel-sb-checkbox');
  if (chk) {
    chk.checked = !chk.checked;
    if (chk.checked) {
      cardEl.classList.add('is-selected');
    } else {
      cardEl.classList.remove('is-selected');
    }
    actualizarContadorSeleccionServiciosBase();
  }
}

/**
 * Manejador del cambio directo en la casilla de verificación
 */
function handleSbItemCheckboxChange(event) {
  event.stopPropagation();
  const chk = event.target;
  const card = chk.closest('.cs-sel-sb-item-card');
  if (card) {
    if (chk.checked) card.classList.add('is-selected');
    else card.classList.remove('is-selected');
  }
  actualizarContadorSeleccionServiciosBase();
}

/**
 * Actualiza el contador dinámico y el estado del botón Insertar en el modal
 */
function actualizarContadorSeleccionServiciosBase() {
  const listBody = document.getElementById('csSelSbListBody');
  const badge = document.getElementById('csSelSbCounterBadge');
  const btnInsertar = document.getElementById('csSelSbBtnInsertar');
  if (!listBody) return;

  const allVisibleCards = Array.from(listBody.querySelectorAll('.cs-sel-sb-item-card')).filter(c => c.style.display !== 'none');
  const checkedBoxes = Array.from(listBody.querySelectorAll('.cs-sel-sb-checkbox:checked')).filter(chk => chk.closest('.cs-sel-sb-item-card')?.style.display !== 'none');

  const count = checkedBoxes.length;
  const total = allVisibleCards.length;

  if (badge) {
    badge.textContent = `${count} de ${total} seleccionados`;
  }

  if (btnInsertar) {
    btnInsertar.innerHTML = `<span>📥</span> <span>Insertar seleccionados (${count})</span>`;
    btnInsertar.disabled = (count === 0);
  }
}

/**
 * Recopila los servicios base seleccionados y ejecuta su inserción
 */
function confirmarInsercionServiciosBaseSeleccionados() {
  const listBody = document.getElementById('csSelSbListBody');
  if (!listBody) return;

  const checkedBoxes = listBody.querySelectorAll('.cs-sel-sb-checkbox:checked');
  const seleccionados = [];

  checkedBoxes.forEach(chk => {
    const idx = parseInt(chk.getAttribute('data-sb-idx'), 10);
    if (!isNaN(idx) && _serviciosBaseParaSeleccionar[idx]) {
      seleccionados.push(_serviciosBaseParaSeleccionar[idx]);
    }
  });

  if (seleccionados.length === 0) {
    if (typeof mostrarToastHistorial === 'function') {
      mostrarToastHistorial('Por favor selecciona al menos un servicio base.', 'info');
    } else {
      alert('Por favor selecciona al menos un servicio base.');
    }
    return;
  }

  cerrarModalSeleccionServiciosBase();
  ejecutarInsercionServiciosBase(seleccionados);
}

/**
 * Inserta los servicios base seleccionados en el bloque de Servicios Fijos
 * a partir de la primera fila de dicho bloque.
 */
async function ejecutarInsercionServiciosBase(serviciosParaInsertar) {
  if (!Array.isArray(serviciosParaInsertar) || serviciosParaInsertar.length === 0) return;

  capturarEstadoPrevioAntesDeAccion(`Insertar ${serviciosParaInsertar.length} servicios base`);

  const semanaIso = _currentSemanaMatrizIso || getMondayISO(new Date());
  const tableBody = document.getElementById('csTableBody');
  if (!tableBody) return;

  // Punto de inserción: a partir de la primera fila del bloque de servicios fijos
  const headerTr = tableBody.querySelector('.cs-section-header-tr.cs-sec-servicios_fijos') ||
    tableBody.querySelector('.cs-section-header-tr[data-block-id="servicios_fijos"]');
  const targetAddTr = tableBody.querySelector('.cs-section-add-tr[data-add-for="servicios_fijos"]');
  const firstExistingItem = tableBody.querySelector('tr.cs-row-item[data-bloque="servicios_fijos"]');

  // Si ya hay filas en servicios fijos, insertamos antes de la primera fila existente; si no, antes del botón agregar
  let insertionReference = firstExistingItem || targetAddTr;

  const nuevosServiciosParaGuardar = [];
  let clientesNuevosDetectados = 0;
  const serviciosBaseActualizados = [];

  for (let idx = 0; idx < serviciosParaInsertar.length; idx++) {
    const sb = serviciosParaInsertar[idx];
    const esNuevo = typeof esServicioNuevoCliente === 'function' && esServicioNuevoCliente(sb.observaciones);
    let obsParaSemana = sb.observaciones || '';
    let coloresParaSemana = { ...(sb.colores_celdas || {}) };

    // Si es cliente nuevo fijo por primera vez:
    if (esNuevo) {
      clientesNuevosDetectados++;
      // 1. Colorear la celda de Zona en Ámbar Cálido
      coloresParaSemana.zona = { bg: '#FBBF24', color: '#FFFFFF' };
      const { obsLimpia } = extraerColoresDeObservaciones(obsParaSemana);
      obsParaSemana = inyectarColoresEnObservaciones(obsLimpia, coloresParaSemana);
      obsParaSemana = inyectarNuevoClienteEnObservaciones(obsParaSemana, false);
    }

    const nuevoId = `srv_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
    const nuevoServicio = {
      ...sb,
      id: nuevoId,
      semana_iso: semanaIso,
      ciudad: _currentCiudadMatriz || sb.ciudad || 'Puebla',
      bloque: 'servicios_fijos',
      observaciones: obsParaSemana,
      colores_celdas: coloresParaSemana,
      ok_cliente: false,
      ok_nanny: false,
      actualizado_en: new Date().toISOString()
    };

    const tr = document.createElement('tr');
    const alertCls = nuevoServicio.alert_class ? ` ${nuevoServicio.alert_class}` : (nuevoServicio.alerta ? ' has-alert-active' : '');
    tr.className = `cs-row-item${alertCls}`;
    tr.setAttribute('data-id', nuevoId);
    tr.setAttribute('data-bloque', 'servicios_fijos');
    tr.setAttribute('data-semana-iso', semanaIso);
    tr.setAttribute('data-ciudad', nuevoServicio.ciudad);
    tr.innerHTML = renderCeldasFilaServicioHtml(nuevoServicio);

    if (insertionReference && insertionReference.parentNode) {
      tableBody.insertBefore(tr, insertionReference);
    } else if (targetAddTr && targetAddTr.parentNode) {
      tableBody.insertBefore(tr, targetAddTr);
    } else {
      tableBody.appendChild(tr);
    }

    // Animación suave de inserción
    tr.style.transition = 'background-color 0.8s ease';
    tr.style.backgroundColor = esNuevo ? 'rgba(251, 191, 36, 0.25)' : 'rgba(236, 72, 153, 0.18)';
    setTimeout(() => { tr.style.backgroundColor = ''; }, 1200);

    nuevosServiciosParaGuardar.push(nuevoServicio);

    // Si era nuevo, registrar el evento métrico +1
    if (esNuevo && sb.cliente_nombre && sb.cliente_nombre.trim()) {
      await registrarEventoMetricaCliente({
        tipo: 'cliente_nuevo',
        cliente_nombre: sb.cliente_nombre.trim(),
        semana_iso: semanaIso,
        valor: 1,
        servicio_id: nuevoId
      });
    }

    // En la plantilla base, quitar la etiqueta de 'nuevo_cliente' para que en semanas futuras no se vuelva a contar
    const sbLimpio = { ...sb };
    if (esNuevo) {
      sbLimpio.observaciones = inyectarNuevoClienteEnObservaciones(sbLimpio.observaciones, false);
    }
    serviciosBaseActualizados.push(sbLimpio);
  }

  // Ocultar mensaje de bloque vacío si existía
  const emptyRow = tableBody.querySelector('tr.cs-section-empty-row[data-empty-for="servicios_fijos"]');
  if (emptyRow) emptyRow.style.display = 'none';

  // Recalcular orden secuencial exacto de todas las filas en el DOM
  const allDomRows = Array.from(tableBody.querySelectorAll('tr.cs-row-item'));
  allDomRows.forEach((r, rIdx) => {
    r.setAttribute('data-orden', String(rIdx));
  });

  actualizarContadoresSecciones();
  initCheckboxInteractions();
  initRowContextMenu();
  restaurarAnchosColumnas();
  actualizarContadoresFiltros();

  // Guardar inmediatamente la matriz de la semana actual en Supabase y LocalStorage
  await guardarMatrizSupabase();

  // Si hubo clientes nuevos, actualizar la plantilla base para retirar el flag de nuevo
  if (clientesNuevosDetectados > 0) {
    try {
      const baseCompleta = await obtenerPlantillaServiciosBase();
      const baseActualizadaFinal = baseCompleta.map(item => {
        if (esServicioNuevoCliente(item.observaciones)) {
          const matchAct = serviciosBaseActualizados.find(act => act.cliente_nombre === item.cliente_nombre);
          return matchAct || { ...item, observaciones: inyectarNuevoClienteEnObservaciones(item.observaciones, false) };
        }
        return item;
      });

      localStorage.setItem('nyp_servicios_base_plantilla', JSON.stringify(baseActualizadaFinal));
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (client) {
        await ejecutarUpsertControlServicios(client, baseActualizadaFinal);
      }
    } catch (e) {
      console.warn('⚠️ Error actualizando plantilla base tras inserción:', e);
    }
  }

  if (typeof Swal !== 'undefined') {
    const extraMsg = clientesNuevosDetectados > 0
      ? `<br><span style="color:#d97706; font-size:12.5px; font-weight:600;">✨ ${clientesNuevosDetectados} cliente(s) nuevo(s) contabilizado(s) con celda Zona en Ámbar cálido.</span>`
      : '';
    Swal.fire({
      title: 'Servicios insertados con éxito',
      html: `Se han insertado <strong>${nuevosServiciosParaGuardar.length} servicio(s) base</strong> en el bloque de Servicios Fijos.${extraMsg}`,
      icon: 'success',
      timer: 2400,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }
}

// Exportar funciones globalmente para uso en botones HTML y eventos
window.toggleMenuServiciosBase = toggleMenuServiciosBase;
window.cerrarMenuServiciosBase = cerrarMenuServiciosBase;
window.abrirModalServiciosBase = abrirModalServiciosBase;
window.cerrarModalServiciosBase = cerrarModalServiciosBase;
window.agregarFilaServiciosBase = agregarFilaServiciosBase;
window.abrirClientePerdidoServiciosBase = abrirClientePerdidoServiciosBase;
window.cancelarModoClientePerdido = cancelarModoClientePerdido;
window.handleSbLossCheckboxChange = handleSbLossCheckboxChange;
window.actualizarContadorSeleccionClientePerdido = actualizarContadorSeleccionClientePerdido;
window.confirmarBajaClientesPerdidos = confirmarBajaClientesPerdidos;
window.procesarBajaDefinitivaClientesPerdidos = procesarBajaDefinitivaClientesPerdidos;
window.eliminarFilaServiciosBase = eliminarFilaServiciosBase;
window.guardarPlantillaServiciosBase = guardarPlantillaServiciosBase;
window.insertarServiciosBaseEnSemanaActual = insertarServiciosBaseEnSemanaActual;
window.obtenerPlantillaServiciosBase = obtenerPlantillaServiciosBase;
window.renderizarTablaServiciosBase = renderizarTablaServiciosBase;
window.registrarEventoMetricaCliente = registrarEventoMetricaCliente;
window.esServicioNuevoCliente = esServicioNuevoCliente;
window.inyectarNuevoClienteEnObservaciones = inyectarNuevoClienteEnObservaciones;
window.calcularHorasTotalesServicio = calcularHorasTotalesServicio;
window.formatearHorasTotalesDisplay = formatearHorasTotalesDisplay;
window.actualizarHorasFilaEnVivo = actualizarHorasFilaEnVivo;
window.horaStringAMinutos = horaStringAMinutos;

// =========================================================================
// MÓDULO DE LIQUIDACIÓN Y SALDOS SEMANALES (CLIENTES Y NIÑERAS)
// =========================================================================
let _tabSaldosActiva = 'clientes'; // 'clientes' | 'nannys'
let _filtroBusquedaSaldos = '';

/**
 * Parsea un monto de tarifa numérico seguro eliminando caracteres de moneda
 */
function parsearMontoTarifaSaldos(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formatea valores numéricos como moneda mexicana redondeados al entero más cercano ($0.00)
 */
function formatearMonedaSaldos(monto) {
  if (monto === null || monto === undefined || isNaN(monto)) return '$0.00';
  const redondeado = Math.round(Number(monto));
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(redondeado);
}

/**
 * Obtiene el mapa de visibilidad de clientes para una semana desde LocalStorage
 */
function obtenerMapaVisibilidadClientes(semanaIso) {
  let mapa = {};
  try {
    const raw = localStorage.getItem(`nyp_saldos_visibles_${semanaIso}`);
    if (raw) mapa = JSON.parse(raw);
  } catch (e) {
    mapa = {};
  }

  // Enriquecer rápidamente desde el caché en memoria si existe
  try {
    if (typeof _cacheFilasCS !== 'undefined' && Array.isArray(_cacheFilasCS)) {
      _cacheFilasCS.forEach(s => {
        if (!s) return;
        const kEmail = (s.cliente_email || '').toLowerCase().trim();
        const kNom = (s.cliente_nombre || '').toLowerCase().trim();
        const isVis = s.saldo_visible === true || /<!--saldo_visible:true-->/i.test(s.observaciones || '');
        const isHidden = s.saldo_visible === false || /<!--saldo_visible:false-->/i.test(s.observaciones || '');
        if (isVis) {
          if (kEmail && mapa[kEmail] === undefined) mapa[kEmail] = true;
          if (kNom && mapa[kNom] === undefined) mapa[kNom] = true;
        } else if (isHidden) {
          if (kEmail && mapa[kEmail] === undefined) mapa[kEmail] = false;
          if (kNom && mapa[kNom] === undefined) mapa[kNom] = false;
        }
      });
    }
  } catch (_) { }

  return mapa;
}

/**
 * Guarda el mapa de visibilidad de clientes para una semana en LocalStorage
 */
function guardarMapaVisibilidadClientes(semanaIso, mapa) {
  try {
    localStorage.setItem(`nyp_saldos_visibles_${semanaIso}`, JSON.stringify(mapa || {}));
  } catch (e) {
    console.warn("Error guardando visibilidad de saldos:", e);
  }
}

/**
 * Calcula los saldos de los clientes en la semana activa con redondeo al entero más cercano.
 * REGLA ESTRICTA: Solo se calcula para servicios fijos (no para servicios temporales ni eventuales).
 * - Servicios fijos: cálculo horas * tarifa, pero si se anota valor en 'Saldo', sobreescribe el cálculo matemático.
 */
function calcularSaldosClientesSemana(serviciosList) {
  const servicios = Array.isArray(serviciosList) ? serviciosList : obtenerDatosMatrizServicios();
  const clientesMap = {};

  servicios.forEach(s => {
    if (!s) return;
    const bloque = s.bloque || 'servicios_fijos';

    // ÚNICAMENTE servicios fijos para clientes
    if (bloque !== 'servicios_fijos') {
      return;
    }

    const nombreCli = (s.cliente_nombre || '').trim();
    const emailCli = (s.cliente_email || '').trim().toLowerCase();
    if (!nombreCli && !emailCli) return;

    // Llave única para agrupar por cliente
    const key = nombreCli.toLowerCase() || emailCli;
    const horas = calcularHorasTotalesServicio(s);
    const extras = calcularHorasExtrasServicio(s);
    let tarifaCli = parsearMontoTarifaSaldos(s.tarifa_cliente);

    // Fallback a caché de clientes si la celda de tarifa en la fila de matriz está vacía
    if (tarifaCli === 0 && Array.isArray(_cacheClientesCS) && _cacheClientesCS.length > 0) {
      const cliObj = _cacheClientesCS.find(c =>
        (emailCli && c.email && c.email.toLowerCase() === emailCli) ||
        (nombreCli && c.nombre && c.nombre.toLowerCase() === nombreCli.toLowerCase())
      );
      if (cliObj && (cliObj.tarifa_cliente || cliObj.tarifa || cliObj.cuota_cliente)) {
        tarifaCli = parsearMontoTarifaSaldos(cliObj.tarifa_cliente || cliObj.tarifa || cliObj.cuota_cliente);
      }
    }

    let subtotal = 0;
    const saldoManualStr = (s.saldo_cliente !== undefined && s.saldo_cliente !== null) ? String(s.saldo_cliente).trim() : '';
    const tieneSaldoManual = saldoManualStr.length > 0 && !isNaN(parseFloat(saldoManualStr));

    // Bloque fijos: cálculo (horas * tarifa) + horas extras en dinero, sobreescrito si se especificó Saldo directo mandatario
    if (tieneSaldoManual) {
      subtotal = parsearMontoTarifaSaldos(saldoManualStr);
    } else {
      subtotal = (horas * tarifaCli) + (extras.extraCli || 0);
    }

    if (!clientesMap[key]) {
      clientesMap[key] = {
        key: key,
        nombre: nombreCli || emailCli,
        email: emailCli,
        totalHoras: 0,
        tarifaPromedio: tarifaCli,
        totalSaldo: 0,
        totalExtras: 0,
        serviciosCount: 0,
        servicios: []
      };
    }

    clientesMap[key].totalHoras += horas;
    clientesMap[key].totalSaldo += subtotal;
    clientesMap[key].totalExtras += (extras.extraCli || 0);
    if (!clientesMap[key].tarifaPromedio && tarifaCli > 0) {
      clientesMap[key].tarifaPromedio = tarifaCli;
    }
    clientesMap[key].serviciosCount += 1;
    clientesMap[key].servicios.push({
      tipo: s.tipo_servicio || 'Servicio',
      bloque: bloque,
      horas: horas,
      tarifa: tarifaCli,
      montoExtras: extras.extraCli || 0,
      saldoManual: tieneSaldoManual ? parsearMontoTarifaSaldos(saldoManualStr) : null,
      subtotal: subtotal
    });
  });

  const lista = Object.values(clientesMap).map(c => {
    c.totalSaldo = Math.round(c.totalSaldo);
    return c;
  });

  return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Calcula los pagos de las niñeras en la semana activa con redondeo al entero más cercano.
 * REGLA: Sumatoria de todos los servicios operativos: fijos, temporales y eventuales.
 * - Servicios temporales y eventuales: si se anota valor en 'Pago', ese monto es el pago total mandatario.
 * - Servicios fijos: cálculo horas * tarifa, pero si se anota valor en 'Pago', sobreescribe el cálculo matemático.
 */
function calcularPagosNannysSemana(serviciosList) {
  const servicios = Array.isArray(serviciosList) ? serviciosList : obtenerDatosMatrizServicios();
  const nannysMap = {};

  servicios.forEach(s => {
    if (!s) return;
    const bloque = s.bloque || 'servicios_fijos';

    // Fijos, temporales y eventuales para niñeras
    if (bloque !== 'servicios_fijos' && bloque !== 'servicios_temporales' && bloque !== 'servicios_eventuales') {
      return;
    }

    const nombreNan = (s.nanny_nombre || '').trim();
    if (!nombreNan) return;

    const key = nombreNan.toLowerCase();
    const horas = calcularHorasTotalesServicio(s);
    const extras = calcularHorasExtrasServicio(s);
    let tarifaNan = parsearMontoTarifaSaldos(s.tarifa_nanny);

    // Fallback a caché de nannys si la celda de tarifa en la fila de matriz está vacía
    if (tarifaNan === 0 && Array.isArray(_cacheNannysCS) && _cacheNannysCS.length > 0) {
      const nanObj = _cacheNannysCS.find(n =>
        (nombreNan && n.nombre && n.nombre.toLowerCase() === nombreNan.toLowerCase())
      );
      if (nanObj && (nanObj.tarifa_nanny || nanObj.tarifa || nanObj.cuota_nanny)) {
        tarifaNan = parsearMontoTarifaSaldos(nanObj.tarifa_nanny || nanObj.tarifa || nanObj.cuota_nanny);
      }
    }

    let subtotal = 0;
    const pagoManualStr = (s.pago_nanny !== undefined && s.pago_nanny !== null) ? String(s.pago_nanny).trim() : '';
    const tienePagoManual = pagoManualStr.length > 0 && !isNaN(parseFloat(pagoManualStr));

    if (bloque === 'servicios_temporales' || bloque === 'servicios_eventuales') {
      // Bloques temporales y eventuales: el valor anotado en Pago es el pago total directo
      if (tienePagoManual) {
        subtotal = parsearMontoTarifaSaldos(pagoManualStr);
      } else {
        // Fallback si no tiene pago directo anotado: (horas * tarifa) + extras
        subtotal = (horas * tarifaNan) + (extras.extraNan || 0);
      }
    } else {
      // Bloque fijos: cálculo (horas * tarifa) + horas extras en dinero, sobreescrito si se especificó Pago directo mandatario
      if (tienePagoManual) {
        subtotal = parsearMontoTarifaSaldos(pagoManualStr);
      } else {
        subtotal = (horas * tarifaNan) + (extras.extraNan || 0);
      }
    }

    if (!nannysMap[key]) {
      nannysMap[key] = {
        key: key,
        nombre: nombreNan,
        totalHoras: 0,
        tarifaPromedio: tarifaNan,
        totalPago: 0,
        serviciosCount: 0,
        servicios: []
      };
    }

    nannysMap[key].totalHoras += horas;
    nannysMap[key].totalPago += subtotal;
    if (!nannysMap[key].tarifaPromedio && tarifaNan > 0) {
      nannysMap[key].tarifaPromedio = tarifaNan;
    }
    nannysMap[key].serviciosCount += 1;
    nannysMap[key].servicios.push({
      tipo: s.tipo_servicio || 'Servicio',
      bloque: bloque,
      horas: horas,
      tarifa: tarifaNan,
      pagoManual: tienePagoManual ? parsearMontoTarifaSaldos(pagoManualStr) : null,
      subtotal: subtotal
    });
  });

  const lista = Object.values(nannysMap).map(n => {
    n.totalPago = Math.round(n.totalPago);
    return n;
  });

  return lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/**
 * Abre el modal de saldos semanales
 */
function abrirModalSaldosSemana() {
  try {
    if (typeof cerrarMenuFila === 'function') cerrarMenuFila();
  } catch (_) { }
  try {
    if (typeof cerrarMenuColumna === 'function') cerrarMenuColumna();
  } catch (_) { }

  _filtroBusquedaSaldos = '';

  let modal = document.getElementById('csModalSaldos');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'csModalSaldos';
    modal.className = 'cs-modal-overlay';
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModalSaldosSemana();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('is-hidden') && modal.style.display !== 'none') {
        cerrarModalSaldosSemana();
      }
    });
  }

  modal.classList.remove('is-hidden');
  modal.style.setProperty('display', 'flex', 'important');

  try {
    renderizarContenidoModalSaldos();
  } catch (err) {
    console.error("Error al renderizar contenido del modal de saldos:", err);
  }
}

/**
 * Cierra el modal de saldos semanales
 */
function cerrarModalSaldosSemana() {
  const modal = document.getElementById('csModalSaldos');
  if (modal) {
    modal.classList.add('is-hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}

/**
 * Cambia la pestaña activa del modal de saldos
 */
function cambiarPestanaSaldos(tab) {
  _tabSaldosActiva = tab;
  renderizarContenidoModalSaldos();
}

/**
 * Filtra los clientes o niñeras por texto en el modal
 */
function handleBusquedaSaldos(input) {
  _filtroBusquedaSaldos = (input.value || '').trim().toLowerCase();
  renderizarCuerpoTablaSaldos();
}

/**
 * Alterna la visibilidad del saldo para un cliente específico
 */
function toggleVisibilidadSaldoCliente(clienteKey, isVisible) {
  const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
  const mapa = obtenerMapaVisibilidadClientes(sem);

  // Guardar en el mapa de visibilidad
  mapa[clienteKey] = isVisible;

  // Calcular y persistir mapa de montos para sincronización inmediata con el portal cliente
  const clientes = calcularSaldosClientesSemana();
  const mapaSaldos = {};

  // Encontrar el cliente objetivo para sincronizar sus alias/llaves
  const targetCli = clientes.find(c =>
    c.key === clienteKey ||
    (c.email && c.email.toLowerCase() === clienteKey.toLowerCase()) ||
    (c.nombre && c.nombre.toLowerCase() === clienteKey.toLowerCase()) ||
    (typeof normalizarTexto === 'function' && c.nombre && normalizarTexto(c.nombre) === normalizarTexto(clienteKey))
  );

  if (targetCli) {
    mapa[targetCli.key] = isVisible;
    if (targetCli.email) mapa[targetCli.email.toLowerCase()] = isVisible;
    if (targetCli.nombre) {
      mapa[targetCli.nombre.toLowerCase()] = isVisible;
      if (typeof normalizarTexto === 'function') {
        mapa[normalizarTexto(targetCli.nombre)] = isVisible;
      }
    }
    // Guardar estado activo rápido por cliente
    try {
      localStorage.setItem(`nyp_saldo_activo_${targetCli.key}`, JSON.stringify({ visible: isVisible, saldo: targetCli.totalSaldo, semana: sem }));
      if (targetCli.email) localStorage.setItem(`nyp_saldo_activo_${targetCli.email.toLowerCase()}`, JSON.stringify({ visible: isVisible, saldo: targetCli.totalSaldo, semana: sem }));
      if (targetCli.nombre) localStorage.setItem(`nyp_saldo_activo_${targetCli.nombre.toLowerCase()}`, JSON.stringify({ visible: isVisible, saldo: targetCli.totalSaldo, semana: sem }));
      if (typeof normalizarTexto === 'function' && targetCli.nombre) {
        localStorage.setItem(`nyp_saldo_activo_${normalizarTexto(targetCli.nombre)}`, JSON.stringify({ visible: isVisible, saldo: targetCli.totalSaldo, semana: sem }));
      }
    } catch (_) { }
  } else {
    try {
      localStorage.setItem(`nyp_saldo_activo_${clienteKey.toLowerCase()}`, JSON.stringify({ visible: isVisible, semana: sem }));
    } catch (_) { }
  }

  // Llenar mapa de saldos general sin sobreescribir visibilidades de otros clientes
  clientes.forEach(c => {
    mapaSaldos[c.key] = c.totalSaldo;
    if (c.email) mapaSaldos[c.email.toLowerCase()] = c.totalSaldo;
    if (c.nombre) {
      mapaSaldos[c.nombre.toLowerCase()] = c.totalSaldo;
      if (typeof normalizarTexto === 'function') {
        mapaSaldos[normalizarTexto(c.nombre)] = c.totalSaldo;
      }
    }
  });

  guardarMapaVisibilidadClientes(sem, mapa);
  try {
    localStorage.setItem(`nyp_saldos_montos_${sem}`, JSON.stringify(mapaSaldos));
  } catch (_) { }

  // Actualizar estado del texto en el modal
  const textEl = document.getElementById(`csSaldosVisText_${clienteKey}`);
  if (textEl) {
    textEl.textContent = isVisible ? 'Visible' : 'Oculto';
    textEl.className = `cs-saldos-vis-text ${isVisible ? 'active' : ''}`;
  }

  // Sincronización transparente en Supabase para que el cliente lo vea en cualquier dispositivo
  (async () => {
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;

      const { data: filas } = await client
        .from('control_servicios')
        .select('id, cliente_email, cliente_nombre, observaciones, saldo_cliente')
        .eq('semana_iso', sem);

      if (Array.isArray(filas) && filas.length > 0) {
        const cliEmail = (targetCli?.email || '').toLowerCase().trim();
        const cliNom = (targetCli?.nombre || '').toLowerCase().trim();
        const cliNomNorm = typeof normalizarTexto === 'function' ? normalizarTexto(cliNom) : cliNom;
        const cliKey = clienteKey.toLowerCase().trim();
        const cliKeyNorm = typeof normalizarTexto === 'function' ? normalizarTexto(cliKey) : cliKey;

        for (const f of filas) {
          const fEmail = (f.cliente_email || '').toLowerCase().trim();
          const fNom = (f.cliente_nombre || '').toLowerCase().trim();
          const fNomNorm = typeof normalizarTexto === 'function' ? normalizarTexto(fNom) : fNom;

          const match = (cliEmail && fEmail === cliEmail) ||
            (cliNom && (fNom === cliNom || fNomNorm === cliNomNorm || fNom.includes(cliNom) || cliNom.includes(fNom))) ||
            (cliKey && (fEmail === cliKey || fNom === cliKey || fNomNorm === cliKeyNorm));

          if (match) {
            let obs = (f.observaciones || '').replace(/<!--saldo_visible:.*?-->/gi, '').replace(/<!--saldo_total:.*?-->/gi, '').trim();
            const totalSald = targetCli ? targetCli.totalSaldo : 0;
            obs = `<!--saldo_visible:${isVisible ? 'true' : 'false'}--> <!--saldo_total:${totalSald}--> ${obs}`.trim();

            // Guardar visibilidad y total en observaciones SIN tocar la columna manual saldo_cliente
            await client.from('control_servicios').update({
              observaciones: obs
            }).eq('id', f.id);

            // Actualizar en caché en memoria de la matriz
            if (typeof _cacheFilasCS !== 'undefined' && Array.isArray(_cacheFilasCS)) {
              const filaCache = _cacheFilasCS.find(r => r.id === f.id);
              if (filaCache) {
                filaCache.observaciones = obs;
                filaCache.saldo_visible = isVisible;
              }
            }
          }
        }
      }
    } catch (errSupa) {
      console.warn("Nota sincronizando visibilidad en Supabase:", errSupa);
    }
  })();

  // Notificar al portal de cliente y actualizar directamente en tiempo real
  try {
    const elSaldo = document.getElementById('ciMetricSaldoVal') || document.querySelector('#ciMetricsGrid .ci-metric-card:nth-child(2) .ci-metric-value');
    const cardSaldo = document.getElementById('ciCardSaldo') || elSaldo?.closest('.ci-metric-card') || document.querySelector('#ciMetricsGrid .ci-metric-card:nth-child(2)');
    const iconBoxSaldo = document.getElementById('ciIconBoxSaldo') || cardSaldo?.querySelector('.ci-metric-icon-box');

    if (elSaldo) {
      if (isVisible && targetCli && targetCli.totalSaldo > 0) {
        elSaldo.textContent = formatearMonedaSaldos(targetCli.totalSaldo);
        if (cardSaldo) cardSaldo.classList.add('ci-metric-saldo-active');
        if (iconBoxSaldo) {
          iconBoxSaldo.classList.remove('cyan');
          iconBoxSaldo.classList.add('green');
        }
      } else if (!isVisible) {
        elSaldo.textContent = '$0.00';
        if (cardSaldo) cardSaldo.classList.remove('ci-metric-saldo-active');
        if (iconBoxSaldo) {
          iconBoxSaldo.classList.remove('green');
          iconBoxSaldo.classList.add('cyan');
        }
      }
    }

    window.dispatchEvent(new CustomEvent('nyp_saldo_cliente_actualizado', {
      detail: { semanaIso: sem, clienteKey, isVisible, mapaVis: mapa, mapaSaldos: mapaSaldos }
    }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('nyp_admin_sync_channel');
        bc.postMessage({ type: 'control_servicios_update', action: 'saldo_actualizado', semana: sem });
      } catch (_) { }
    }
    if (window.ClienteInicio) {
      if (typeof window.ClienteInicio.actualizarSaldoDirecto === 'function') {
        window.ClienteInicio.actualizarSaldoDirecto();
      }
    }
  } catch (_) { }

  mostrarToastHistorial(isVisible ? 'Saldo visible para el cliente' : 'Saldo oculto para el cliente', 'info');
}

/**
 * Habilita u oculta todos los saldos de clientes de la semana en bloque
 */
function toggleTodosVisibilidadClientes(hacerVisible) {
  const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
  const clientes = calcularSaldosClientesSemana();
  const mapa = obtenerMapaVisibilidadClientes(sem);
  const mapaSaldos = {};

  clientes.forEach(c => {
    mapa[c.key] = hacerVisible;
    mapaSaldos[c.key] = c.totalSaldo;
    if (c.email) {
      mapa[c.email.toLowerCase()] = hacerVisible;
      mapaSaldos[c.email.toLowerCase()] = c.totalSaldo;
    }
    if (c.nombre) {
      mapa[c.nombre.toLowerCase()] = hacerVisible;
      mapaSaldos[c.nombre.toLowerCase()] = c.totalSaldo;
      if (typeof normalizarTexto === 'function') {
        mapa[normalizarTexto(c.nombre)] = hacerVisible;
        mapaSaldos[normalizarTexto(c.nombre)] = c.totalSaldo;
      }
    }
    try {
      localStorage.setItem(`nyp_saldo_activo_${c.key}`, JSON.stringify({ visible: hacerVisible, saldo: c.totalSaldo, semana: sem }));
      if (c.email) localStorage.setItem(`nyp_saldo_activo_${c.email.toLowerCase()}`, JSON.stringify({ visible: hacerVisible, saldo: c.totalSaldo, semana: sem }));
      if (c.nombre) localStorage.setItem(`nyp_saldo_activo_${c.nombre.toLowerCase()}`, JSON.stringify({ visible: hacerVisible, saldo: c.totalSaldo, semana: sem }));
      if (typeof normalizarTexto === 'function' && c.nombre) {
        localStorage.setItem(`nyp_saldo_activo_${normalizarTexto(c.nombre)}`, JSON.stringify({ visible: hacerVisible, saldo: c.totalSaldo, semana: sem }));
      }
    } catch (_) { }
  });

  guardarMapaVisibilidadClientes(sem, mapa);
  try {
    localStorage.setItem(`nyp_saldos_montos_${sem}`, JSON.stringify(mapaSaldos));
  } catch (_) { }

  renderizarContenidoModalSaldos();

  // Sincronización masiva en Supabase para todos los servicios de la semana
  (async () => {
    try {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;

      const { data: filas } = await client
        .from('control_servicios')
        .select('id, bloque, cliente_email, cliente_nombre, observaciones')
        .eq('semana_iso', sem);

      if (Array.isArray(filas) && filas.length > 0) {
        for (const f of filas) {
          const bloqueFila = f.bloque || 'servicios_fijos';
          if (bloqueFila === 'servicios_fijos' || (!f.bloque && f.observaciones && f.observaciones.includes('servicios_fijos'))) {
            const fEmail = (f.cliente_email || '').toLowerCase().trim();
            const fNom = (f.cliente_nombre || '').toLowerCase().trim();
            const fNomNorm = typeof normalizarTexto === 'function' ? normalizarTexto(fNom) : fNom;

            const matchCli = clientes.find(c => {
              const cEmail = (c.email || '').toLowerCase().trim();
              const cNom = (c.nombre || '').toLowerCase().trim();
              const cNomNorm = typeof normalizarTexto === 'function' ? normalizarTexto(cNom) : cNom;
              return (fEmail && cEmail === fEmail) ||
                (fNom && (cNom === fNom || cNomNorm === fNomNorm || fNom.includes(cNom) || cNom.includes(fNom))) ||
                (c.key === fEmail || c.key === fNom || c.key === fNomNorm);
            });
            const totalCli = matchCli ? matchCli.totalSaldo : 0;

            let obs = (f.observaciones || '').replace(/<!--saldo_visible:.*?-->/gi, '').replace(/<!--saldo_total:.*?-->/gi, '').trim();
            obs = `<!--saldo_visible:${hacerVisible ? 'true' : 'false'}--> <!--saldo_total:${totalCli}--> ${obs}`.trim();

            await client.from('control_servicios').update({
              observaciones: obs
            }).eq('id', f.id);

            if (typeof _cacheFilasCS !== 'undefined' && Array.isArray(_cacheFilasCS)) {
              const filaCache = _cacheFilasCS.find(r => r.id === f.id);
              if (filaCache) {
                filaCache.observaciones = obs;
                filaCache.saldo_visible = hacerVisible;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Nota sincronizando visibilidad masiva en Supabase:", e);
    }
  })();

  // Notificar al portal de cliente en tiempo real
  try {
    window.dispatchEvent(new CustomEvent('nyp_saldo_cliente_actualizado', {
      detail: { semanaIso: sem, isVisible: hacerVisible, mapaVis: mapa, mapaSaldos: mapaSaldos }
    }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('nyp_admin_sync_channel');
        bc.postMessage({ type: 'control_servicios_update', action: 'saldo_actualizado', semana: sem });
      } catch (_) { }
    }
    if (window.ClienteInicio) {
      if (typeof window.ClienteInicio.actualizarSaldoDirecto === 'function') {
        window.ClienteInicio.actualizarSaldoDirecto();
      }
    }
  } catch (_) { }

  mostrarToastHistorial(hacerVisible ? 'Todos los saldos marcados como visibles' : 'Todos los saldos ocultos', 'success');
}

/**
 * Renderiza todo el contenedor del modal de saldos (sin fichas KPI)
 */
function renderizarContenidoModalSaldos() {
  const modal = document.getElementById('csModalSaldos');
  if (!modal) return;

  const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
  const semanaLabel = document.getElementById('csWeekLabel')?.textContent || `Semana ${sem}`;

  const clientes = calcularSaldosClientesSemana();
  const nannys = calcularPagosNannysSemana();

  modal.innerHTML = `
    <div class="cs-saldos-modal" onclick="event.stopPropagation()">
      <!-- Header Institucional Nannys y Peques -->
      <div class="cs-saldos-header">
        <div class="cs-saldos-header-left">
          <div class="cs-saldos-header-icon">💰</div>
          <div>
            <h3 class="cs-saldos-header-title">Liquidaciones y Saldos Semanales</h3>
            <p class="cs-saldos-header-subtitle">
              <span>Control financiero de turnos</span>
              <span>•</span>
              <span class="cs-saldos-semana-pill">${semanaLabel}</span>
            </p>
          </div>
        </div>
        <button type="button" class="cs-btn-close-modal" onclick="cerrarModalSaldosSemana()" title="Cerrar modal">✕</button>
      </div>

      <!-- Barra de Navegación (Pestañas y Búsqueda) -->
      <div class="cs-saldos-nav">
        <div class="cs-saldos-tabs-bar">
          <button type="button" class="cs-saldos-tab-btn ${_tabSaldosActiva === 'clientes' ? 'active' : ''}" onclick="cambiarPestanaSaldos('clientes')">
            <span>👨‍👩‍👧‍👦 Clientes</span>
            <span class="cs-saldos-tab-badge" id="csSaldosBadgeCli">${clientes.length}</span>
          </button>
          <button type="button" class="cs-saldos-tab-btn ${_tabSaldosActiva === 'nannys' ? 'active' : ''}" onclick="cambiarPestanaSaldos('nannys')">
            <span>👩‍🍼 Niñeras</span>
            <span class="cs-saldos-tab-badge" id="csSaldosBadgeNan">${nannys.length}</span>
          </button>
        </div>

        <div class="cs-saldos-actions-right">
          <div class="cs-search-box" style="margin: 0;">
            <span class="cs-search-icon">🔍</span>
            <input type="text" id="csInputBusquedaSaldos" value="${_filtroBusquedaSaldos}" placeholder="Buscar ${_tabSaldosActiva === 'clientes' ? 'cliente' : 'niñera'}..." oninput="handleBusquedaSaldos(this)" style="min-width: 180px;">
          </div>
          ${_tabSaldosActiva === 'clientes' ? `
            <button type="button" class="cs-saldos-quick-btn" onclick="toggleTodosVisibilidadClientes(true)" title="Hacer visibles todos los saldos de clientes">
              👁️ <span>Autorizar Todos</span>
            </button>
            <button type="button" class="cs-saldos-quick-btn" onclick="toggleTodosVisibilidadClientes(false)" title="Ocultar todos los saldos de clientes">
              🔒 <span>Ocultar Todos</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Cuerpo / Tabla -->
      <div class="cs-saldos-body" id="csSaldosBodyContent">
        <!-- Inyectado dinámicamente -->
      </div>

      <!-- Footer -->
      <div class="cs-saldos-footer">
        <div class="cs-saldos-footer-info">
          ${_tabSaldosActiva === 'clientes'
      ? '💡 <em>Cálculo basado exclusivamente en servicios fijos y temporales.</em>'
      : '💡 <em>Cálculo basado en la sumatoria de servicios fijos, temporales y eventuales.</em>'}
        </div>
        <button type="button" class="cs-btn-saldos-close" onclick="cerrarModalSaldosSemana()">Listo</button>
      </div>
    </div>
  `;

  renderizarCuerpoTablaSaldos();
}

/**
 * Renderiza la tabla interna según la pestaña y los filtros
 */
function renderizarCuerpoTablaSaldos() {
  const container = document.getElementById('csSaldosBodyContent');
  if (!container) return;

  const sem = _currentSemanaMatrizIso || getMondayISO(new Date());
  const mapaVis = obtenerMapaVisibilidadClientes(sem);

  if (_tabSaldosActiva === 'clientes') {
    let todosClientes = calcularSaldosClientesSemana();
    const mapaSaldos = {};

    todosClientes.forEach(c => {
      mapaSaldos[c.key] = c.totalSaldo;
      if (c.email) mapaSaldos[c.email.toLowerCase()] = c.totalSaldo;
      if (c.nombre) {
        mapaSaldos[c.nombre.toLowerCase()] = c.totalSaldo;
        if (typeof normalizarTexto === 'function') {
          mapaSaldos[normalizarTexto(c.nombre)] = c.totalSaldo;
        }
      }
      const isVisibleCurrently = !!(mapaVis[c.key] || (c.email && mapaVis[c.email.toLowerCase()]) || (c.nombre && mapaVis[c.nombre.toLowerCase()]));
      try {
        localStorage.setItem(`nyp_saldo_activo_${c.key}`, JSON.stringify({ visible: isVisibleCurrently, saldo: c.totalSaldo, semana: sem }));
        if (c.email) localStorage.setItem(`nyp_saldo_activo_${c.email.toLowerCase()}`, JSON.stringify({ visible: isVisibleCurrently, saldo: c.totalSaldo, semana: sem }));
        if (c.nombre) localStorage.setItem(`nyp_saldo_activo_${c.nombre.toLowerCase()}`, JSON.stringify({ visible: isVisibleCurrently, saldo: c.totalSaldo, semana: sem }));
        if (typeof normalizarTexto === 'function' && c.nombre) {
          localStorage.setItem(`nyp_saldo_activo_${normalizarTexto(c.nombre)}`, JSON.stringify({ visible: isVisibleCurrently, saldo: c.totalSaldo, semana: sem }));
        }
      } catch (_) { }
    });

    try {
      localStorage.setItem(`nyp_saldos_montos_${sem}`, JSON.stringify(mapaSaldos));
    } catch (_) { }

    let clientes = todosClientes;
    if (_filtroBusquedaSaldos) {
      clientes = clientes.filter(c => c.nombre.toLowerCase().includes(_filtroBusquedaSaldos) || c.email.includes(_filtroBusquedaSaldos));
    }

    if (clientes.length === 0) {
      container.innerHTML = `
        <div class="cs-saldos-empty">
          <span class="cs-saldos-empty-icon">📂</span>
          <div class="cs-saldos-empty-title">No hay servicios fijos o temporales registrados</div>
          <div class="cs-saldos-empty-desc">Los clientes con turnos en bloques fijos o temporales aparecerán aquí con su cálculo automático.</div>
        </div>
      `;
      return;
    }

    const rowsHtml = clientes.map(c => {
      const isVis = !!(mapaVis[c.key] || (c.email && mapaVis[c.email.toLowerCase()]) || (c.nombre && mapaVis[c.nombre.toLowerCase()]) || (typeof normalizarTexto === 'function' && c.nombre && mapaVis[normalizarTexto(c.nombre)]));
      const inicial = (c.nombre.charAt(0) || 'C').toUpperCase();
      const horasFormatted = formatearHorasTotalesDisplay(c.totalHoras);
      const saldoFormatted = formatearMonedaSaldos(c.totalSaldo);

      return `
        <tr>
          <!-- Columna 1: Total de Horas -->
          <td class="cs-saldos-col-hours">
            <span class="cs-saldos-hours-pill">⏱️ ${horasFormatted}</span>
          </td>

          <!-- Columna 2: Nombre del Cliente -->
          <td class="cs-saldos-col-name">
            <div class="cs-saldos-name-flex">
              <div class="cs-saldos-avatar-circle">${inicial}</div>
              <div class="cs-saldos-name-details">
                <span class="cs-saldos-name-main">${c.nombre}</span>
                <span class="cs-saldos-name-sub">${c.serviciosCount} servicio(s) • ${c.email || 'Sin email'}</span>
              </div>
            </div>
          </td>

          <!-- Columna 3: Saldo Total de la Semana -->
          <td class="cs-saldos-col-amount ${c.totalSaldo === 0 ? 'empty' : ''}">
            ${saldoFormatted}
          </td>

          <!-- Columna 4: Checkbox de Visibilidad -->
          <td class="cs-saldos-col-vis">
            <label class="cs-saldos-vis-label" title="${isVis ? 'El cliente puede ver este saldo en su app' : 'Oculto para el cliente'}">
              <span class="cs-saldos-switch">
                <input type="checkbox" ${isVis ? 'checked' : ''} onchange="toggleVisibilidadSaldoCliente('${c.key}', this.checked)">
                <span class="cs-saldos-slider"></span>
              </span>
              <span class="cs-saldos-vis-text ${isVis ? 'active' : ''}" id="csSaldosVisText_${c.key}">${isVis ? 'Visible' : 'Oculto'}</span>
            </label>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="cs-saldos-table-wrap">
        <table class="cs-saldos-table">
          <thead>
            <tr>
              <th style="width: 140px;">Horas</th>
              <th>Cliente</th>
              <th style="width: 170px;">Saldo Total</th>
              <th style="width: 140px; text-align:center;">Visible al Cliente</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Pestaña Niñeras
    let nannys = calcularPagosNannysSemana();
    if (_filtroBusquedaSaldos) {
      nannys = nannys.filter(n => n.nombre.toLowerCase().includes(_filtroBusquedaSaldos));
    }

    if (nannys.length === 0) {
      container.innerHTML = `
        <div class="cs-saldos-empty">
          <span class="cs-saldos-empty-icon">👩‍🍼</span>
          <div class="cs-saldos-empty-title">No hay niñeras asignadas en esta semana</div>
          <div class="cs-saldos-empty-desc">Las colaboradoras con servicios fijos, temporales o eventuales se mostrarán aquí con el cálculo de su pago semanal.</div>
        </div>
      `;
      return;
    }

    const rowsHtml = nannys.map(n => {
      const inicial = (n.nombre.charAt(0) || 'N').toUpperCase();
      const horasFormatted = formatearHorasTotalesDisplay(n.totalHoras);
      const pagoFormatted = formatearMonedaSaldos(n.totalPago);

      return `
        <tr>
          <!-- Columna 1: Total de Horas -->
          <td class="cs-saldos-col-hours">
            <span class="cs-saldos-hours-pill">⏱️ ${horasFormatted}</span>
          </td>

          <!-- Columna 2: Nombre de la Niñera -->
          <td class="cs-saldos-col-name">
            <div class="cs-saldos-name-flex">
              <div class="cs-saldos-avatar-circle nanny">${inicial}</div>
              <div class="cs-saldos-name-details">
                <span class="cs-saldos-name-main">${n.nombre}</span>
                <span class="cs-saldos-name-sub">${n.serviciosCount} servicio(s) asignado(s)</span>
              </div>
            </div>
          </td>

          <!-- Columna 3: Total a Pagar de la Semana -->
          <td class="cs-saldos-col-amount ${n.totalPago === 0 ? 'empty' : ''}">
            ${pagoFormatted}
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="cs-saldos-table-wrap">
        <table class="cs-saldos-table">
          <thead>
            <tr>
              <th style="width: 140px;">Horas</th>
              <th>Nombre de Niñera</th>
              <th style="width: 170px;">Total a Pagar</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Exportar globalmente las funciones del módulo de saldos y confirmación de asistencia
window.abrirModalSaldosSemana = abrirModalSaldosSemana;
window.cerrarModalSaldosSemana = cerrarModalSaldosSemana;
window.cambiarPestanaSaldos = cambiarPestanaSaldos;
window.handleBusquedaSaldos = handleBusquedaSaldos;
window.toggleVisibilidadSaldoCliente = toggleVisibilidadSaldoCliente;
window.toggleTodosVisibilidadClientes = toggleTodosVisibilidadClientes;
window.calcularSaldosClientesSemana = calcularSaldosClientesSemana;
window.calcularPagosNannysSemana = calcularPagosNannysSemana;
window.verificarAsistenciaNannyCompleta = verificarAsistenciaNannyCompleta;
window.actualizarEstadoConfirmacionFila = actualizarEstadoConfirmacionFila;

// Exportar globalmente las funciones de selección de servicios base
window.abrirModalSeleccionServiciosBase = abrirModalSeleccionServiciosBase;
window.cerrarModalSeleccionServiciosBase = cerrarModalSeleccionServiciosBase;
window.filtrarListaSeleccionServiciosBase = filtrarListaSeleccionServiciosBase;
window.toggleSeleccionarTodosServiciosBase = toggleSeleccionarTodosServiciosBase;
window.confirmarInsercionServiciosBaseSeleccionados = confirmarInsercionServiciosBaseSeleccionados;
window.handleSbItemCardClick = handleSbItemCardClick;
window.handleSbItemCheckboxChange = handleSbItemCheckboxChange;



