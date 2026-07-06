/**
 * SISTEMA DE PUNTOS STAR - MODULO DE SUPERVISIÓN
 * Gestión y asignación de puntos para nannies fijas y eventuales.
 */

// Criterios de evaluación para Nannies Fijas
const CRITERIOS_FIJAS = [
    { id: 'semana_sin_faltas', name: 'Semana sin faltas', points: 2, hasCheckbox: true },
    { id: 'reportes_comunicacion', name: 'Reportes/comunicación puntuales y completos', points: 3, hasCheckbox: true },
    { id: 'llegada_puntual', name: 'Llegada puntual a su servicio', points: 2, hasCheckbox: true },
    { id: 'cumplimiento_neuronanny', name: 'Cumplimiento a programa neuronanny', points: 2, hasCheckbox: true },
    
    { id: 'ultimo_minuto', name: 'Servicio de último minuto', points: 2, hasCheckbox: true },
    { id: 'capacitacion_no_obligatoria', name: 'Participar en capacitación no obligatorias', points: 7, hasCheckbox: true },
    { id: 'entrenamiento_star', name: 'Asistir a entrenamiento Nanny Star', points: 25, hasCheckbox: true },
    { id: 'recomendar_nanny', name: 'Recomendar a otra nanny y que tome un servicio', points: 20, hasCheckbox: true },
    { id: 'eventos_convivencias', name: 'Asistir a eventos y convivencias', points: 10, hasCheckbox: true },
    
    { id: 'no_conexion_reuniones', name: 'No conectarse a reuniones programadas', points: -10, hasCheckbox: true },
    { id: 'faltar_servicio', name: 'Faltar a servicio', points: -10, hasCheckbox: true },
    { id: 'reporte_negativo_familia', name: 'Reporte negativo de la familia', points: -10, hasCheckbox: true },
    { id: 'dejar_servicio_sin_14_dias', name: 'Dejar un servicio fijo sin 14 días de anticipación', points: -20, hasCheckbox: true },
    { id: 'mala_actitud_agencia', name: 'Mala actitud con la agencia', points: -10, hasCheckbox: true },
    
    { id: 'cancelar_servicio_confirmado', name: 'Cancelar servicio ya confirmado', points: -10, hasCheckbox: true },
    { id: 'saltarse_protocolos', name: 'Saltarse protocolos', points: -10, hasCheckbox: true },
    { id: 'baja_calificacion_supervision', name: 'Baja calificación en supervisión', points: -10, hasCheckbox: true },
    
    { id: 'servicios_eventuales_extras', name: 'Tomar 2 servicios eventuales extras a la semana', points: 3, hasCheckbox: true },
    { id: 'horas_semana_40', name: '40 horas de servicio a la semana', points: 3, hasCheckbox: true },
    { id: 'avances_desarrollo', name: 'Avances en el desarrollo de su peque', points: 7, hasCheckbox: false },
    { id: 'evaluacion_cliente_4_5', name: 'Evaluación 4-5 ⭐ del cliente', points: 7, hasCheckbox: false },
    
    { id: 'ganar_insignia', name: 'Ganar una insignia', points: 10, hasCheckbox: false },
    
    { id: 'meses_familia_3', name: '3 meses con la misma familia', points: 10, hasCheckbox: true },
    { id: 'meses_familia_6', name: '6 meses con la misma familia', points: 15, hasCheckbox: true },
    { id: 'meses_familia_9', name: '9 meses con la misma familia', points: 20, hasCheckbox: true },
    { id: 'meses_familia_12', name: '12 meses con la misma familia', points: 25, hasCheckbox: true },
    { id: 'servicios_eventuales_25', name: 'Cubrir 25 servicios eventuales', points: 5, hasCheckbox: true },
    { id: 'servicios_eventuales_50', name: 'Cubrir 50 servicios eventuales', points: 10, hasCheckbox: true },
    { id: 'servicios_eventuales_75', name: 'Cubrir 75 servicios eventuales', points: 15, hasCheckbox: true },
    { id: 'servicios_eventuales_100', name: 'Cubrir 100 servicios eventuales', points: 20, hasCheckbox: true },
    { id: 'servicios_eventuales_125', name: 'Cubrir 125 servicios eventuales', points: 25, hasCheckbox: true }
];

// Criterios de evaluación para Nannies Eventuales
const CRITERIOS_EVENTUALES = [
    { id: 'puntualidad_servicios', name: 'Puntualidad en los servicios', points: 2, hasCheckbox: true },
    { id: 'ultimo_minuto', name: 'Servicio de último minuto', points: 2, hasCheckbox: true },
    { id: 'reportes_comunicacion', name: 'Reportes/comunicación puntuales y completos', points: 3, hasCheckbox: true },
    
    { id: 'evaluacion_positiva_cliente', name: 'Evaluación positiva del cliente', points: 2, hasCheckbox: true },
    { id: 'recontratacion_nanny', name: 'La familia pide que asista de nuevo la misma nanny', points: 2, hasCheckbox: true },
    { id: 'capacitacion_no_obligatoria', name: 'Participar en capacitación no obligatorias', points: 7, hasCheckbox: true },
    { id: 'iniciar_servicio_fijo', name: 'Iniciar un servicio fijo', points: 20, hasCheckbox: true },
    { id: 'entrenamiento_star', name: 'Asistir a entrenamiento Nanny Star', points: 25, hasCheckbox: true },
    { id: 'recomendar_nanny', name: 'Recomendar a otra nanny y que tome un servicio', points: 20, hasCheckbox: true },
    { id: 'eventos_convivencias', name: 'Asistir a eventos y convivencias', points: 10, hasCheckbox: true },
    
    { id: 'no_conexion_reuniones', name: 'No conectarse a reuniones programadas', points: -10, hasCheckbox: true },
    { id: 'faltar_servicio', name: 'Faltar a servicio', points: -10, hasCheckbox: true },
    { id: 'reporte_negativo_familia', name: 'Reporte negativo de la familia', points: -10, hasCheckbox: true },
    { id: 'mala_actitud_agencia', name: 'Mala actitud con la agencia', points: -10, hasCheckbox: true },
    
    { id: 'cancelar_servicio_confirmado', name: 'Cancelar servicio ya confirmado', points: -10, hasCheckbox: true },
    { id: 'saltarse_protocolos', name: 'Saltarse protocolos', points: -10, hasCheckbox: true },
    { id: 'baja_calificacion_supervision', name: 'Baja calificación en supervisión', points: -10, hasCheckbox: true },
    
    { id: 'tres_servicios_seguidos', name: 'Tres servicios seguidos', points: 2, hasCheckbox: false },
    { id: 'servicios_eventuales_25', name: 'Cubrir 25 servicios eventuales', points: 5, hasCheckbox: true },
    { id: 'servicios_eventuales_50', name: 'Cubrir 50 servicios eventuales', points: 10, hasCheckbox: true },
    { id: 'servicios_eventuales_75', name: 'Cubrir 75 servicios eventuales', points: 15, hasCheckbox: true },
    { id: 'servicios_eventuales_100', name: 'Cubrir 100 servicios eventuales', points: 20, hasCheckbox: true },
    { id: 'servicios_eventuales_125', name: 'Cubrir 125 servicios eventuales', points: 25, hasCheckbox: true },
    { id: 'ganar_insignia', name: 'Ganar una insignia', points: 10, hasCheckbox: false }
];

// Estado local de la sección
let puntosStarNannies = { fijas: [], eventuales: [] };
let seccionActualPuntos = 'fijas';
let periodoActualPuntos = 'actual'; // 'actual' o 'anterior'
let puntosSeleccionados = {}; // { nannyName: { criterioId: true/false } }
let puntosAutosaveTimeout = null;
let puntosListenerUnsubscribe = null;
let nanniesConCambiosPendientes = new Set();
let esOficialPeriodoActual = false;

/**
 * Obtiene la fecha del lunes de la semana solicitada ('actual' o 'anterior') en formato YYYY-MM-DD.
 */
function getSemanaLunesStr(periodo) {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diff = (diaSemana === 0 ? -6 : 1 - diaSemana);
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diff);
    if (periodo === 'anterior') {
        lunes.setDate(lunes.getDate() - 7);
    }
    return lunes.toISOString().split('T')[0];
}

function getNormalizedName(name) {
    if (!name) return '';
    return name.trim().normalize('NFC');
}

// Fallback de Datos Mockeados en caso de que falle la carga del Sheets
const NANNIES_MOCK = {
    fijas: [
        { nombre: 'PruebaGera', tipo: 'Fija' },
        { nombre: 'Ana Karen', tipo: 'Fija' },
        { nombre: 'Victoria Ruiz', tipo: 'Fija' }
    ],
    eventuales: [
        { nombre: 'Aiko', tipo: 'Eventual' },
        { nombre: 'Andrea', tipo: 'Eventual' },
        { nombre: 'Daniela Gomez', tipo: 'Eventual' }
    ]
};

/**
 * Se suscribe en tiempo real a las evaluaciones guardadas en Firestore para la semana actual
 */
async function suscribirRealtimeFirestore() {
    // Cancelar suscripción anterior si existe
    if (puntosListenerUnsubscribe) {
        puntosListenerUnsubscribe();
        puntosListenerUnsubscribe = null;
    }

    try {
        await cargarFirebasePuntos();
        if (!pts_dbPuntos) return;
        
        // Obtener fecha del lunes de la semana seleccionada
        const fechaLunesStr = getSemanaLunesStr(periodoActualPuntos);
        
        const firestore = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        const q = firestore.query(
            firestore.collection(pts_dbPuntos, "puntos_nannies"),
            firestore.where("semanaLunes", "==", fechaLunesStr),
            firestore.where("tipoNanny", "==", seccionActualPuntos)
        );
        
        let esPrimerSnapshot = true;
        puntosListenerUnsubscribe = firestore.onSnapshot(q, (querySnapshot) => {
            let huboCambios = esPrimerSnapshot;
            esPrimerSnapshot = false;
            
            let deVerdadOficial = false;
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data && data.nannyName && data.criteriosSeleccionados) {
                    const normName = getNormalizedName(data.nannyName);
                    
                    if (data.esBorrador === false) {
                        deVerdadOficial = true;
                    }
                    
                    // Si esta nanny tiene cambios locales pendientes de guardar, ignoramos la actualización remota temporalmente
                    if (nanniesConCambiosPendientes.has(normName)) {
                        return;
                    }

                    const stringifiedLocal = JSON.stringify(puntosSeleccionados[normName] || {});
                    const stringifiedRemote = JSON.stringify(data.criteriosSeleccionados);
                    
                    if (stringifiedLocal !== stringifiedRemote) {
                        puntosSeleccionados[normName] = data.criteriosSeleccionados;
                        huboCambios = true;
                    }
                }
            });
            
            if (esOficialPeriodoActual !== deVerdadOficial) {
                esOficialPeriodoActual = deVerdadOficial;
                huboCambios = true;
            }
            
            if (huboCambios) {
                renderPuntosTable();
            }
        }, (err) => {
            console.error("Error en la suscripción en tiempo real de Puntos:", err);
        });
    } catch (err) {
        console.warn("No se pudo iniciar la suscripción en tiempo real:", err);
    }
}

/**
 * Inicializa y carga la pestaña de Puntos Star
 */
async function inicializarPuntosStar() {
    const loader = document.getElementById('puntosstar-loader');
    const tableContainer = document.getElementById('puntosstar-table-container');
    const actionContainer = document.getElementById('puntosstar-actions');

    if (loader) loader.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';
    if (actionContainer) actionContainer.style.display = 'none';

    // Limpiar selecciones previas al recargar para evitar mezclar semanas
    puntosSeleccionados = {};

    try {
        // Cargar nannies asignadas a servicios desde el Backend
        const res = await api('getPuntosStarNannies', { periodo: periodoActualPuntos });
        
        if (res && (res.fijas.length > 0 || res.eventuales.length > 0)) {
            puntosStarNannies = res;
            if (res.debug) {
                console.log("%c 🔍 DEBÚG PUNTOS STAR BACKEND ", "background: #10B981; color: white; font-weight: bold; padding: 3px; border-radius: 3px;", res.debug);
            }
        } else {
            console.warn('Backend devolvió listas vacías. Usando datos mock.');
            puntosStarNannies = NANNIES_MOCK;
        }
        
        // Cargar borradores o datos guardados desde Firestore para la sección inicial en tiempo real
        await suscribirRealtimeFirestore();
    } catch (err) {
        console.error('Error cargando nannies para puntos, usando datos mock.', err);
        puntosStarNannies = NANNIES_MOCK;
    } finally {
        if (loader) loader.style.display = 'none';
        if (tableContainer) tableContainer.style.display = 'block';
        if (actionContainer) actionContainer.style.display = 'flex';
        
        renderPuntosTable();
    }
}
window.inicializarPuntosStar = inicializarPuntosStar;

/**
 * Cambia entre la sección de fijas y eventuales
 */
async function cambiarSeccionPuntos(seccion) {
    seccionActualPuntos = seccion;

    const btnFijas = document.getElementById('btn-pts-fijas');
    const btnEventuales = document.getElementById('btn-pts-eventuales');

    if (seccion === 'fijas') {
        if (btnFijas) {
            btnFijas.className = 'btn-pink';
        }
        if (btnEventuales) {
            btnEventuales.className = 'btn-pink-outline';
        }
    } else {
        if (btnFijas) {
            btnFijas.className = 'btn-pink-outline';
        }
        if (btnEventuales) {
            btnEventuales.className = 'btn-pink';
        }
    }

    // Mostrar un estado de carga sutil en el contenedor de la tabla
    const container = document.getElementById('puntosstar-table-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--pink-main); font-weight: 600;">
                <i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Cargando borradores...
            </div>
        `;
    }

    await suscribirRealtimeFirestore();
}
window.cambiarSeccionPuntos = cambiarSeccionPuntos;

/**
 * Renderiza la matriz/tabla de puntos
 */
function renderPuntosTable() {
    const container = document.getElementById('puntosstar-table-container');
    if (!container) return;

    const nannies = seccionActualPuntos === 'fijas' ? puntosStarNannies.fijas : puntosStarNannies.eventuales;
    const criterios = seccionActualPuntos === 'fijas' ? CRITERIOS_FIJAS : CRITERIOS_EVENTUALES;

    if (nannies.length === 0) {
        container.innerHTML = `<div class="no-data">No hay nannies de tipo "${seccionActualPuntos}" con servicios activos asignados actualmente.</div>`;
        return;
    }

    // Inicializar estado de selección de puntos para cada nanny si no existe
    nannies.forEach(n => {
        const normName = getNormalizedName(n.nombre);
        if (!puntosSeleccionados[normName]) {
            puntosSeleccionados[normName] = {};
            if (seccionActualPuntos === 'fijas') {
                puntosSeleccionados[normName]['semana_sin_faltas'] = true;
                puntosSeleccionados[normName]['reportes_comunicacion'] = true;
                puntosSeleccionados[normName]['llegada_puntual'] = true;
                puntosSeleccionados[normName]['cumplimiento_neuronanny'] = true;
            } else {
                puntosSeleccionados[normName]['puntualidad_servicios'] = true;
                puntosSeleccionados[normName]['reportes_comunicacion'] = true;
            }
        }

        // Forzar valor de campos automáticos basados en la respuesta del backend
        if (seccionActualPuntos === 'fijas') {
            puntosSeleccionados[normName]['servicios_eventuales_extras'] = !!n.cumpleServiciosExtras;
            puntosSeleccionados[normName]['horas_semana_40'] = !!n.cumple40Horas;
            puntosSeleccionados[normName]['meses_familia_3'] = !!n.cumple3Meses;
            puntosSeleccionados[normName]['meses_familia_6'] = !!n.cumple6Meses;
            puntosSeleccionados[normName]['meses_familia_9'] = !!n.cumple9Meses;
            puntosSeleccionados[normName]['meses_familia_12'] = !!n.cumple12Meses;
            puntosSeleccionados[normName]['servicios_eventuales_25'] = !!n.cumpleServiciosEventuales25;
            puntosSeleccionados[normName]['servicios_eventuales_50'] = !!n.cumpleServiciosEventuales50;
            puntosSeleccionados[normName]['servicios_eventuales_75'] = !!n.cumpleServiciosEventuales75;
            puntosSeleccionados[normName]['servicios_eventuales_100'] = !!n.cumpleServiciosEventuales100;
            puntosSeleccionados[normName]['servicios_eventuales_125'] = !!n.cumpleServiciosEventuales125;
        } else {
            puntosSeleccionados[normName]['servicios_eventuales_25'] = !!n.cumpleServiciosEventuales25;
            puntosSeleccionados[normName]['servicios_eventuales_50'] = !!n.cumpleServiciosEventuales50;
            puntosSeleccionados[normName]['servicios_eventuales_75'] = !!n.cumpleServiciosEventuales75;
            puntosSeleccionados[normName]['servicios_eventuales_100'] = !!n.cumpleServiciosEventuales100;
            puntosSeleccionados[normName]['servicios_eventuales_125'] = !!n.cumpleServiciosEventuales125;
        }
    });

    let bannerHtml = '';
    if (esOficialPeriodoActual) {
        bannerHtml = `
            <style>
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
            <div class="puntos-visibles-banner" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 12px 20px; border-radius: 14px; margin-bottom: 20px; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15); animation: slideDown 0.3s ease; font-family: inherit;">
                <span style="font-size: 16px;">📢</span> Puntos visibles para las niñeras
            </div>
        `;
    }

    let tableHtml = bannerHtml + `
        <table style="width: 100%; border-collapse: collapse; min-width: 600px;">
            <thead>
                <tr style="border-bottom: 2px solid rgba(232, 76, 154, 0.15);">
                    <th style="text-align: left; padding: 12px 10px; font-family: 'DM Serif Display', serif; font-size: 16px; color: var(--pink-main); position: sticky; left: 0; background: white; z-index: 5;">Aspectos a Calificar</th>
                    <th style="text-align: center; padding: 12px 10px; font-weight: 700; color: var(--text-muted); font-size: 13px; width: 80px;">Puntos</th>
    `;

    // Cabeceras de Nannies con su nombre y totalizador
    nannies.forEach(n => {
        const normName = getNormalizedName(n.nombre);
        const totalNanny = calcularTotalNanny(normName, criterios);
        const totalColor = totalNanny >= 0 ? 'var(--blue-main)' : 'var(--pink-main)';
        const idClean = normName.replace(/\s+/g, '');
        tableHtml += `
            <th style="text-align: center; padding: 12px 10px; width: 130px;">
                <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${n.nombre}</div>
                <div id="total-badge-${idClean}" style="display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 12px; font-weight: 800; background: rgba(0,0,0,0.03); color: ${totalColor}; margin-top: 4px;">
                    ${totalNanny} pts
                </div>
            </th>
        `;
    });

    tableHtml += `
                </tr>
            </thead>
            <tbody>
    `;

    // Filas de Criterios
    criterios.forEach(crit => {
        const pointsBadgeColor = crit.points >= 0 ? '#10b981' : '#ef4444';
        const pointsLabel = crit.points >= 0 ? `+${crit.points}` : `${crit.points}`;

        tableHtml += `
            <tr style="border-bottom: 1px solid #f1f5f9; hover: background-color: #fafaf9;">
                <td style="padding: 10px; font-size: 13px; color: var(--text-main); font-weight: 600; position: sticky; left: 0; background: white; z-index: 4; max-width: 320px; border-right: 1px solid #f1f5f9;">
                    ${crit.name}
                </td>
                <td style="text-align: center; padding: 10px; font-weight: 800; font-size: 13px; color: ${pointsBadgeColor};">
                    ${pointsLabel}
                </td>
        `;

        // Columnas para cada Nanny
        nannies.forEach(n => {
            const normName = getNormalizedName(n.nombre);
            const idClean = normName.replace(/\s+/g, '');
            if (crit.hasCheckbox) {
                const isChecked = puntosSeleccionados[normName][crit.id] ? 'checked' : '';
                const esAutomatico = (
                    crit.id === 'servicios_eventuales_extras' || 
                    crit.id === 'horas_semana_40' || 
                    crit.id === 'meses_familia_3' || 
                    crit.id === 'meses_familia_6' || 
                    crit.id === 'meses_familia_9' || 
                    crit.id === 'meses_familia_12' ||
                    crit.id === 'servicios_eventuales_25' ||
                    crit.id === 'servicios_eventuales_50' ||
                    crit.id === 'servicios_eventuales_75' ||
                    crit.id === 'servicios_eventuales_100' ||
                    crit.id === 'servicios_eventuales_125'
                );
                const extraAttrs = esAutomatico ? 'disabled' : '';
                const styleInput = esAutomatico
                    ? 'width: 18px; height: 18px; cursor: not-allowed; accent-color: var(--pink-main); opacity: 0.55; filter: grayscale(1);'
                    : 'width: 18px; height: 18px; cursor: pointer; accent-color: var(--pink-main);';

                tableHtml += `
                    <td style="text-align: center; padding: 10px;">
                        <input type="checkbox" 
                               class="pts-checkbox-${idClean}" 
                               data-nanny="${normName}" 
                               data-crit-id="${crit.id}" 
                               data-points="${crit.points}" 
                               ${isChecked} 
                               ${extraAttrs} 
                               onchange="toggleNannyCheckbox(this)" 
                               style="${styleInput}" />
                    </td>
                `;
            } else {
                tableHtml += `
                    <td style="text-align: center; padding: 10px; color: #cbd5e1; font-size: 11px;">
                        --
                    </td>
                `;
            }
        });

        tableHtml += `</tr>`;
    });

    // Fila inferior de Total
    tableHtml += `
            <tr style="border-top: 2px solid rgba(232, 76, 154, 0.15); background: #fffcfd; font-weight: 800;">
                <td style="padding: 15px 10px; color: var(--pink-main); font-size: 14px; position: sticky; left: 0; background: #fffcfd; z-index: 4;">
                    PUNTOS TOTALES
                </td>
                <td style="text-align: center; padding: 15px 10px;"></td>
    `;

    nannies.forEach(n => {
        const normName = getNormalizedName(n.nombre);
        const totalNanny = calcularTotalNanny(normName, criterios);
        const totalColor = totalNanny >= 0 ? 'var(--blue-main)' : 'var(--pink-main)';
        const idClean = normName.replace(/\s+/g, '');
        tableHtml += `
            <td id="total-footer-${idClean}" style="text-align: center; padding: 15px 10px; font-size: 18px; color: ${totalColor};">
                ${totalNanny}
            </td>
        `;
    });

    tableHtml += `
            </tr>
        </tbody>
    </table>
    `;

    container.innerHTML = tableHtml;
}

/**
 * Calcula la suma de puntos seleccionados para una nanny
 */
function calcularTotalNanny(nannyName, criterios) {
    let total = 0;
    const normName = getNormalizedName(nannyName);
    const selections = puntosSeleccionados[normName] || {};
    
    criterios.forEach(crit => {
        if (crit.hasCheckbox && selections[crit.id]) {
            total += crit.points;
        }
    });

    return total;
}

/**
 * Maneja el cambio de estado de un checkbox
 */
function toggleNannyCheckbox(element) {
    const nanny = getNormalizedName(element.getAttribute('data-nanny'));
    const critId = element.getAttribute('data-crit-id');
    const isChecked = element.checked;

    if (!puntosSeleccionados[nanny]) {
        puntosSeleccionados[nanny] = {};
    }

    puntosSeleccionados[nanny][critId] = isChecked;

    // Actualizar totalizadores de la Nanny en tiempo real
    const criterios = seccionActualPuntos === 'fijas' ? CRITERIOS_FIJAS : CRITERIOS_EVENTUALES;
    const total = calcularTotalNanny(nanny, criterios);
    const nannyIdClean = nanny.replace(/\s+/g, '');

    const badge = document.getElementById(`total-badge-${nannyIdClean}`);
    const footer = document.getElementById(`total-footer-${nannyIdClean}`);
    const totalColor = total >= 0 ? 'var(--blue-main)' : 'var(--pink-main)';

    if (badge) {
        badge.innerText = `${total} pts`;
        badge.style.color = totalColor;
    }
    if (footer) {
        footer.innerText = total;
        footer.style.color = totalColor;
    }

    // Registrar que esta nanny tiene cambios locales pendientes de guardar
    nanniesConCambiosPendientes.add(nanny);

    // Debounce de guardado automático (espera 1 segundo de inactividad antes de guardar)
    if (puntosAutosaveTimeout) {
        clearTimeout(puntosAutosaveTimeout);
    }
    
    setSyncStatus('saving');
    
    puntosAutosaveTimeout = setTimeout(async () => {
        try {
            const guardarComoBorrador = !esOficialPeriodoActual;
            await guardarEnFirestore(guardarComoBorrador);
            setSyncStatus('saved');
        } catch (err) {
            console.error("Error en auto-guardado automático:", err);
            setSyncStatus('error');
        } finally {
            nanniesConCambiosPendientes.clear();
            puntosAutosaveTimeout = null;
        }
    }, 1000);
}
window.toggleNannyCheckbox = toggleNannyCheckbox;

/**
 * Actualiza el indicador visual del estado de sincronización con Firestore
 */
function setSyncStatus(status) {
    const indicator = document.getElementById('pts-sync-indicator');
    if (!indicator) return;
    
    if (status === 'saving') {
        indicator.style.opacity = '1';
        indicator.style.background = '#fef3c7'; // Amarillo claro
        indicator.style.color = '#d97706'; // Ambar
        indicator.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #d97706;"></i> Guardando...';
    } else if (status === 'saved') {
        indicator.style.opacity = '1';
        indicator.style.background = '#dcfce7'; // Verde claro
        indicator.style.color = '#15803d'; // Verde
        indicator.innerHTML = '<i class="fas fa-check-circle" style="color: #16a34a;"></i> Sincronizado';
        
        setTimeout(() => {
            if (indicator.style.color === 'rgb(21, 128, 61)' || indicator.style.color === '#15803d') {
                indicator.style.opacity = '0';
            }
        }, 3000);
    } else if (status === 'error') {
        indicator.style.opacity = '1';
        indicator.style.background = '#fee2e2'; // Rojo claro
        indicator.style.color = '#b91c1c'; // Rojo
        indicator.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #dc2626;"></i> Error al guardar';
    }
}

// Referencias a Firebase que se cargarán dinámicamente
let pts_dbPuntos = null;
let pts_fb_doc = null;
let pts_fb_setDoc = null;
let pts_fb_serverTimestamp = null;

/**
 * Carga e inicializa la instancia de Firestore del segundo proyecto
 */
async function cargarFirebasePuntos() {
    if (pts_dbPuntos) return pts_dbPuntos;
    try {
        const { dbPuntos, puntosAuthConfig } = await import('./firebase-config.js');
        pts_dbPuntos = dbPuntos;
        
        const firestore = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        pts_fb_doc = firestore.doc;
        pts_fb_setDoc = firestore.setDoc;
        pts_fb_serverTimestamp = firestore.serverTimestamp;
        
        // Autenticación silenciosa Anónima en el segundo proyecto
        // (Nota: Requiere habilitar el proveedor "Anónimo" en Firebase Auth de tu proyecto NyP-Puntos Star)
        const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
        const auth = firebaseAuthModule.getAuth(pts_dbPuntos.app);
        
        if (!auth.currentUser) {
            await firebaseAuthModule.signInAnonymously(auth).catch(err => {
                console.warn("No se pudo iniciar sesión anónima en el segundo proyecto:", err);
            });
        }
        
        return pts_dbPuntos;
    } catch (e) {
        console.error("Error cargando Firebase Puntos:", e);
        throw e;
    }
}

/**
 * Lógica para guardar la matriz en el segundo Firestore
 */
async function guardarEnFirestore(esBorrador) {
    await cargarFirebasePuntos();
    
    // Obtener fecha del lunes de la semana seleccionada
    const fechaLunesStr = getSemanaLunesStr(periodoActualPuntos);

    const nannies = seccionActualPuntos === 'fijas' ? puntosStarNannies.fijas : puntosStarNannies.eventuales;
    const criterios = seccionActualPuntos === 'fijas' ? CRITERIOS_FIJAS : CRITERIOS_EVENTUALES;

    for (const n of nannies) {
        const normName = getNormalizedName(n.nombre);
        const totalNanny = calcularTotalNanny(normName, criterios);
        const selections = puntosSeleccionados[normName] || {};
        
        // Nombre del documento único: NannyName_YYYY-MM-DD_Tipo
        const docId = `${normName.replace(/\s+/g, '')}_${fechaLunesStr}_${seccionActualPuntos}`;
        
        const docData = {
            nannyName: normName,
            tipoNanny: seccionActualPuntos,
            semanaLunes: fechaLunesStr,
            criteriosSeleccionados: selections,
            puntosTotales: totalNanny,
            esBorrador: esBorrador,
            actualizado: pts_fb_serverTimestamp ? pts_fb_serverTimestamp() : new Date(),
            supervisor: (window.SESION && window.SESION.email) ? window.SESION.email : 'anonimo'
        };
        
        await pts_fb_setDoc(pts_fb_doc(pts_dbPuntos, "puntos_nannies", docId), docData);
    }
}



/**
 * Guarda los puntos oficiales y los aplica de manera definitiva.
 */
async function guardarPuntosOficiales() {
    Swal.fire({
        title: 'Aplicando Puntos...',
        text: 'Acreditando puntos de manera oficial en la colección segura.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        await guardarEnFirestore(false);
        esOficialPeriodoActual = true;
        renderPuntosTable();
        
        Swal.fire({
            title: '¡Puntos Aplicados Oficialmente!',
            text: 'Los puntos han sido acreditados de forma definitiva a las nannies correspondientes.',
            icon: 'success',
            confirmButtonColor: 'var(--pink-main)',
            background: '#ffffff',
            backdrop: `rgba(232, 76, 154, 0.1)`
        });
    } catch (err) {
        console.error("Error al guardar puntos oficiales:", err);
        Swal.fire({
            title: 'Error al guardar',
            text: 'Hubo un problema al guardar los puntos oficiales en Firebase. Verifica la consola y las reglas de seguridad.',
            icon: 'error',
            confirmButtonColor: 'var(--pink-main)'
        });
    }
}
window.guardarPuntosOficiales = guardarPuntosOficiales;

/**
 * Cambia entre la semana actual y la semana anterior para la evaluación de puntos star.
 */
async function cambiarPeriodoPuntos(periodo) {
    if (periodoActualPuntos === periodo) return;
    periodoActualPuntos = periodo;

    const btnActual = document.getElementById('btn-periodo-actual');
    const btnAnterior = document.getElementById('btn-periodo-anterior');

    if (periodo === 'actual') {
        if (btnActual) {
            btnActual.style.background = 'white';
            btnActual.style.color = 'var(--text-main)';
            btnActual.style.fontWeight = '700';
            btnActual.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
        }
        if (btnAnterior) {
            btnAnterior.style.background = 'transparent';
            btnAnterior.style.color = 'var(--text-muted)';
            btnAnterior.style.fontWeight = '600';
            btnAnterior.style.boxShadow = 'none';
        }
    } else {
        if (btnActual) {
            btnActual.style.background = 'transparent';
            btnActual.style.color = 'var(--text-muted)';
            btnActual.style.fontWeight = '600';
            btnActual.style.boxShadow = 'none';
        }
        if (btnAnterior) {
            btnAnterior.style.background = 'white';
            btnAnterior.style.color = 'var(--text-main)';
            btnAnterior.style.fontWeight = '700';
            btnAnterior.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
        }
    }

    // Recargar la información de puntos star con la semana seleccionada
    await inicializarPuntosStar();
}
window.cambiarPeriodoPuntos = cambiarPeriodoPuntos;
