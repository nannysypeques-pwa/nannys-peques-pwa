/**
 * Módulo de Estimulación Temprana - Powered by Firebase
 * Rediseño "Modern Bento" 🌟
 */

// Referencias a Firebase que se cargarán dinámicamente
let fb_doc, fb_getDoc, fb_setDoc, fb_updateDoc, fb_serverTimestamp, _db, fb_collection, fb_getDocs, fb_onSnapshot;

// Listeners en tiempo real
let _unsubEstPeques = null;
let _unsubProgresoPeque = null;
let _dataProgresoPeque = { hitos: {}, seguimiento_diario: {} };

let estChart = null;
let currentPequeId = null;
let progresoActual = {};
let respuestasHitos = {};
let respuestasHitosInicial = {}; // Guardar los primeros resultados para comparación
let nivelesTeoricos = {};
let nivelesFinales = {};
let activeEtapaId = null;
let esSegundaEvaluacion = false;
let isEstimulacionInitialized = false;
let CATALOGO_ACTIVIDADES = [];

// Helper para obtener fecha ISO en huso horario local (YYYY-MM-DD)
function _obtenerFechaLocalISO(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

let _fechaSeleccionadaEst = _obtenerFechaLocalISO();

function obtenerNombreEtapaHumano(etapaId) {
    const mapa = {
        "0-3m": "0 a 3 meses",
        "4-6m": "3 a 6 meses",
        "7-9m": "6 a 9 meses",
        "10-12m": "9 a 12 meses",
        "13-18m": "12 a 18 meses",
        "19-24m": "18 a 24 meses",
        "25-36m": "2 a 3 años",
        "3-4a": "3 a 4 años",
        "4-5a": "4 a 5 años",
        "5-6a": "5 a 6 años"
    };
    return mapa[etapaId] || etapaId || "Sin evaluar";
}

/**
 * Carga dinámica de los módulos de Firebase
 */
async function cargarFirebaseEstimulacion() {
    if (_db) {
        // Si la base de datos ya cargó, pero no está autenticado aún, re-intentar autenticación rápida
        try {
            const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
            const auth = firebaseAuthModule.getAuth(_db.app);
            if (!auth.currentUser && window.SESION && window.SESION.firebaseToken) {
                await firebaseAuthModule.signInWithCustomToken(auth, window.SESION.firebaseToken);
            }
        } catch (e) {
            console.warn("Error validando autenticación en db en caché:", e);
        }
        return _db;
    }
    try {
        const { db } = await import('./firebase-config.js');
        _db = db;
        const firestore = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        fb_doc = firestore.doc;
        fb_getDoc = firestore.getDoc;
        fb_setDoc = firestore.setDoc;
        fb_updateDoc = firestore.updateDoc;
        fb_serverTimestamp = firestore.serverTimestamp;
        fb_collection = firestore.collection;
        fb_getDocs = firestore.getDocs;
        fb_onSnapshot = firestore.onSnapshot;

        // 🔐 Asegurar que Firebase Auth esté autenticado antes de consultar Firestore
        const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
        const auth = firebaseAuthModule.getAuth(_db.app);
        
        if (!auth.currentUser && window.SESION && window.SESION.firebaseToken) {
            console.log("⏳ Autenticando Firebase en Estimulación...");
            await firebaseAuthModule.signInWithCustomToken(auth, window.SESION.firebaseToken);
            console.log("✅ Firebase autenticado en Estimulación.");
        }

        return _db;
    } catch (e) {
        console.error("Error cargando Firebase:", e);
        throw e;
    }
}

async function initEstimulacion() {
    if (isEstimulacionInitialized) return;
    isEstimulacionInitialized = true;

    if (!SESION || !SESION.email) return;

    const clientesMap = new Map();

    if (SESION.cliente) {
        const perf = (typeof CACHE_CLIENTE !== 'undefined' && CACHE_CLIENTE.profile) ? CACHE_CLIENTE.profile : {};
        const peques = [];
        if (perf.nombre_del_peque) peques.push({ nombre: perf.nombre_del_peque, nacimiento: perf.fecha_de_nacimiento || perf.fecha_de_nacimiento_del_peque });
        if (perf.nombre_del_peque_2) peques.push({ nombre: perf.nombre_del_peque_2, nacimiento: perf.fecha_de_nacimiento_2 || perf.fecha_de_nacimiento_del_peque_2 });
        if (perf.nombre_del_peque_3) peques.push({ nombre: perf.nombre_del_peque_3, nacimiento: perf.fecha_de_nacimiento_3 || perf.fecha_de_nacimiento_del_peque_3 });

        clientesMap.set(SESION.email, {
            nombre: SESION.nombre || 'Mi Familia',
            peques: peques
        });
    } else {
        (CAL_SERVICIOS || []).forEach(s => {
            const clientEmail = s.email || s.correo_cliente;
            const clientName = s.cliente || s.nombre_cliente;
            if (clientEmail && !clientesMap.has(clientEmail)) {
                clientesMap.set(clientEmail, {
                    nombre: clientName,
                    peques: s.peques_lista || []
                });
            }
        });
    }

    const optionsCliente = document.getElementById("options-cliente-est");
    if (optionsCliente) {
        optionsCliente.innerHTML = '';
        clientesMap.forEach((data, email) => {
            const div = document.createElement("div");
            div.className = "custom-option";
            div.textContent = data.nombre;
            div.onclick = () => cambioClienteEstimulacion(email, data.nombre);
            optionsCliente.appendChild(div);
        });

        const containerCliente = document.getElementById("container-select-cliente");
        if (containerCliente) containerCliente.style.display = (SESION.cliente || clientesMap.size <= 1) ? 'none' : 'flex';

        const firstEmail = clientesMap.keys().next().value;
        const firstData = clientesMap.get(firstEmail);
        if (firstEmail) {
            document.getElementById("label-cliente-est").textContent = firstData.nombre;
            document.getElementById("dropdown-cliente").dataset.value = firstEmail;
            llenarSelectorPeques(firstData.peques);
        }
    }

    window._EST_CLIENTES_MAP = clientesMap;

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-dropdown')) {
            document.querySelectorAll('.custom-dropdown-options').forEach(el => el.classList.remove('active'));
        }
    });

    renderDaySelector();
    setTimeout(() => cargarFirebaseEstimulacion().catch(e => { }), 1000);
}

function toggleEstDropdown(type) {
    const list = document.getElementById(`options-${type}-est`);
    const other = type === 'cliente' ? 'peque' : 'cliente';
    document.getElementById(`options-${other}-est`)?.classList.remove('active');
    if (list) list.classList.toggle('active');
}

function llenarSelectorPeques(peques) {
    const optionsPeque = document.getElementById("options-peque-est");
    const labelPeque = document.getElementById("label-peque-est");
    if (!optionsPeque) return;

    optionsPeque.innerHTML = '';
    if (!peques || peques.length === 0) {
        optionsPeque.innerHTML = '<div class="custom-option">Sin pequeños</div>';
        labelPeque.textContent = "Sin pequeños";
        document.getElementById("dropdown-peque").dataset.value = "";
    } else {
        peques.forEach(p => {
            const nombre = (typeof p === 'object') ? p.nombre : p;
            const nacimiento = (typeof p === 'object') ? p.nacimiento : null;
            const div = document.createElement("div");
            div.className = "custom-option";
            div.textContent = nombre;
            div.onclick = () => selectPequeEstimulacion(nombre, nacimiento);
            optionsPeque.appendChild(div);
        });

        const p0 = peques[0];
        const n0 = (typeof p0 === 'object') ? p0.nombre : p0;
        const nac0 = (typeof p0 === 'object') ? p0.nacimiento : null;
        labelPeque.textContent = n0;
        document.getElementById("dropdown-peque").dataset.value = n0;
        selectPequeEstimulacion(n0, nac0);
    }
}

function cambioClienteEstimulacion(email, nombre) {
    document.getElementById("label-cliente-est").textContent = nombre;
    document.getElementById("dropdown-cliente").dataset.value = email;
    document.getElementById("options-cliente-est").classList.remove('active');
    const data = window._EST_CLIENTES_MAP.get(email);
    if (data) llenarSelectorPeques(data.peques);
}

async function selectPequeEstimulacion(nombre, nacimiento) {
    currentPequeId = nombre;
    const email = document.getElementById("dropdown-cliente").dataset.value || SESION.email;
    document.getElementById("dropdown-peque").dataset.nacimiento = nacimiento;
    document.getElementById("label-peque-est").textContent = nombre;
    document.getElementById("options-peque-est")?.classList.remove('active');

    mostrarCargandoEstimulacion(true);

    // Resetear datos para evitar fugas entre peques
    activeEtapaId = null;
    progresoActual = {};
    respuestasHitos = {};
    _dataProgresoPeque = { hitos: {}, seguimiento_diario: {} };

    try {
        await cargarFirebaseEstimulacion();
        if (CATALOGO_ACTIVIDADES.length === 0) await cargarCatalogoActividades();

        const docId = btoa(`${email}_${nombre}`).replace(/=/g, "");

        if (_unsubEstPeques) _unsubEstPeques();
        if (_unsubProgresoPeque) _unsubProgresoPeque();

        _unsubEstPeques = fb_onSnapshot(fb_doc(_db, "estimulacion_peques", docId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                window._activePequeData = data;

                const meses = calcularMeses(nacimiento);
                const currentEtapaId = obtenerEtapaId(meses);
                const isTrans = esMesDeTransicion(meses, currentEtapaId);
                const nextEtapaId = isTrans ? obtenerSiguienteEtapa(currentEtapaId) : null;

                const historial = data.historial_evaluaciones || {};

                // Priorizar la última evaluación realizada al cargar por primera vez
                if (!activeEtapaId) {
                    activeEtapaId = obtenerUltimaEvaluacionRealizada(data, currentEtapaId);
                } else {
                    // Si ya hay un activeEtapaId, nos aseguramos de que siga siendo válido
                    const etapasPermitidas = obtenerEtapasPermitidas();
                    if (!etapasPermitidas.includes(activeEtapaId)) {
                        activeEtapaId = obtenerUltimaEvaluacionRealizada(data, currentEtapaId);
                    }
                }

                if (historial[activeEtapaId]) {
                    progresoActual = historial[activeEtapaId].niveles || {};
                    respuestasHitos = historial[activeEtapaId].hitos_detalle || {};
                    respuestasHitosInicial = historial[activeEtapaId].hitos_inicial_detalle || historial[activeEtapaId].hitos_detalle || {};
                    nivelesFinales = historial[activeEtapaId].niveles_finales || null;
                } else if (data.etapa_actual === activeEtapaId) {
                    progresoActual = data.niveles || {};
                    respuestasHitos = data.hitos_detalle || {};
                    respuestasHitosInicial = data.hitos_inicial_detalle || data.hitos_detalle || {};
                    nivelesFinales = data.niveles_finales || null;
                } else {
                    progresoActual = {};
                    respuestasHitos = {};
                    respuestasHitosInicial = {};
                    nivelesFinales = null;
                }

                calcularAvanceTeorico();
                renderRadarChart();
                renderDashboard();
                renderActividadesDelDia();
                verificarAlertaCambioEtapa();
                renderEvaluationButtons();
                actualizarControlesNavegacionEtapa();
            } else {
                window._activePequeData = null;
                activeEtapaId = obtenerEtapaId(calcularMeses(nacimiento));
                progresoActual = {};
                respuestasHitos = {};
                respuestasHitosInicial = {};
                nivelesTeoricos = {};
                nivelesFinales = null;
                renderRadarChart();
                renderDashboard();
                renderPromptEvaluacion(nombre);
                renderEvaluationButtons();
                actualizarControlesNavegacionEtapa();
            }
        });

        _unsubProgresoPeque = fb_onSnapshot(fb_doc(_db, "progreso_peque", docId), (snap) => {
            _dataProgresoPeque = snap.exists() ? snap.data() : { hitos: {}, seguimiento_diario: {} };

            // Re-renderizar la lista y radar si ya hay evaluación
            if (Object.keys(respuestasHitos).length > 0) {
                calcularAvanceTeorico();
                renderRadarChart();
                renderActividadesDelDia();
            }

            // Actualizar botones del modal si está abierto
            if (typeof _actividadAbierta !== 'undefined' && _actividadAbierta && document.getElementById("modalDetalleActividad").style.display === "flex") {
                const hoy = _fechaSeleccionadaEst;
                const resultadosHoy = (_dataProgresoPeque.seguimiento_diario && _dataProgresoPeque.seguimiento_diario[hoy]) ? _dataProgresoPeque.seguimiento_diario[hoy] : {};
                const status = resultadosHoy[_actividadAbierta.firebaseId] || "pendiente";

                const btnDone = document.getElementById("btn-status-done");
                const btnFail = document.getElementById("btn-status-fail");
                const btnPending = document.getElementById("btn-status-pending");
                if (btnDone && btnFail && btnPending) {
                    btnDone.classList.remove("active");
                    btnFail.classList.remove("active");
                    btnPending.classList.remove("active");
                    if (status && status.startsWith("realizada")) btnDone.classList.add("active");
                    else if (status === "no_realizada") btnFail.classList.add("active");
                    else if (status === "pendiente") btnPending.classList.add("active");
                }
            }
        });
    } catch (e) {
        console.error(e);
    } finally {
        mostrarCargandoEstimulacion(false);
    }
}

function renderPromptEvaluacion(nombre) {
    const container = document.getElementById("actividades-lista-container");
    if (!container) return;

    if (SESION.cliente) {
        container.innerHTML = `
            <div class="eval-prompt-card" style="text-align:center; padding:40px 20px; background:white; border-radius:24px; border:2px dashed #ffcad4; margin-top:20px; grid-column: 1 / -1;">
                <div style="font-size:50px; margin-bottom:15px;">✨🧸</div>
                <h3 style="color:var(--est-text); margin-bottom:10px;">¡Casi listo para brillar!</h3>
                <p style="color:var(--est-text-muted); margin-bottom:20px; max-width:400px; margin-inline:auto;">La evaluación del desarrollo de <b>${nombre}</b> aún no está completa, pero ya estamos trabajando en ello para crear la ruta perfecta.</p>
                <div style="font-size:12px; color:var(--est-primary); font-weight:700;">Pronto verás los resultados aquí 🎨</div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="eval-prompt-card" style="text-align:center; padding:40px 20px; background:white; border-radius:24px; border:2px dashed var(--est-primary); margin-top:20px; grid-column: 1 / -1;">
                <div style="font-size:50px; margin-bottom:15px;">👶✨</div>
                <h3 style="color:var(--est-text); margin-bottom:10px;">¡Comencemos con ${nombre}!</h3>
                <p style="color:var(--est-text-muted); margin-bottom:20px; max-width:400px; margin-inline:auto;">Para personalizar la ruta de actividades, primero necesitamos realizar la evaluación del desarrollo.</p>
                <button class="btn-save-modern" onclick="abrirEvaluacionInicial()" style="width:auto; padding:14px 30px;">
                    Iniciar Evaluación del Desarrollo 🚀
                </button>
            </div>
        `;
    }

    renderMaterialesSemanales(); // Limpiar lista de materiales ya que no hay evaluación
}

function selectHitoScore(areaId, hitoId, score, btn) {
    if (!respuestasHitos) respuestasHitos = {};
    respuestasHitos[hitoId] = score;

    // Actualizar visualmente el grupo segmentado
    const container = btn.closest(".hito-options-segmented");
    if (container) {
        container.querySelectorAll(".segmented-opt").forEach(b => b.classList.remove("active"));
    }
    btn.classList.add("active");

    actualizarProgresoEvaluacion();
}

function actualizarProgresoEvaluacion() {
    const modal = document.getElementById("modalEvaluacionEst");
    const etapaId = modal.dataset.etapaId;
    const etapa = CATALOGO_HITOS[etapaId];
    if (!etapa) return;

    let totalHitos = 0;
    Object.keys(etapa.areas).forEach(a => {
        totalHitos += etapa.areas[a].hitos.length;
    });

    const respondidos = Object.keys(respuestasHitos).length;
    const porcentaje = Math.min(100, Math.round((respondidos / totalHitos) * 100));

    const bar = document.getElementById("eval-progress-bar");
    if (bar) bar.style.width = porcentaje + "%";
}

function abrirEvaluacionInicial(isReadOnly = false, prefillData = null, esCierre = false, forcedEtapaId = null) {
    const modal = document.getElementById("modalEvaluacionEst");
    const container = document.getElementById("eval-questions-container");
    const labelEtapa = document.getElementById("eval-title-etapa");

    esSegundaEvaluacion = esCierre;
    const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
    const etapaId = forcedEtapaId || prefillData?.etapa_actual || obtenerEtapaId(calcularMeses(nacimiento));
    const etapa = CATALOGO_HITOS[etapaId] || CATALOGO_HITOS["0-3m"];

    modal.dataset.etapaId = etapaId;
    labelEtapa.textContent = (esSegundaEvaluacion ? "Evaluación de Cierre - " : "Evaluación Inicial - ") + etapa.nombre;
    container.innerHTML = "";
    
    // Si es cierre, empezamos con las respuestas actuales (teóricas) como base o vacías?
    // El usuario quiere confirmar avances, así que mejor vacío para que evalúen de nuevo,
    // pero mostrando el indicador del anterior.
    respuestasHitos = prefillData?.hitos_detalle || {}; 
    if (esSegundaEvaluacion) respuestasHitos = {}; // Reiniciar para la nueva evaluación

    // Reset progreso
    const bar = document.getElementById("eval-progress-bar");
    if (bar) bar.style.width = "0%";

    Object.keys(etapa.areas).forEach(areaId => {
        const area = etapa.areas[areaId];
        const section = document.createElement("div");
        section.className = "eval-area-section";
        section.innerHTML = `<h4 class="eval-area-title">${area.nombre}</h4>`;

        area.hitos.forEach(h => {
            const score = respuestasHitos[h.id] || null;
            const prevScore = respuestasHitosInicial[h.id];
            let prevLabel = "";
            let prevColor = "";
            if (prevScore === 10) { prevLabel = "Lo logra"; prevColor = "#10b981"; }
            else if (prevScore === 7) { prevLabel = "En proceso"; prevColor = "#f59e0b"; }
            else if (prevScore === 1) { prevLabel = "No lo hace"; prevColor = "#ef4444"; }

            const hitoCard = document.createElement("div");
            hitoCard.className = "hito-card";
            hitoCard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:10px;">
                    <p class="hito-text" style="margin:0; flex:1;">${h.texto}</p>
                    ${esSegundaEvaluacion && prevLabel ? `
                        <div style="background:rgba(0,0,0,0.03); padding:4px 8px; border-radius:8px; font-size:10px; font-weight:700; border:1px solid rgba(0,0,0,0.05);">
                            Previo: <span style="color:${prevColor}">${prevLabel}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="hito-options-segmented">
                    <button class="segmented-opt l1 ${score === 10 ? 'active' : ''}" onclick="selectHitoScore('${areaId}', '${h.id}', 10, this)">
                        <span class="opt-emoji">🌟</span>
                        <span class="opt-label">Lo logra</span>
                    </button>
                    <button class="segmented-opt l2 ${score === 7 ? 'active' : ''}" onclick="selectHitoScore('${areaId}', '${h.id}', 7, this)">
                        <span class="opt-emoji">🌱</span>
                        <span class="opt-label">En proceso</span>
                    </button>
                    <button class="segmented-opt l3 ${score === 4 ? 'active' : ''}" onclick="selectHitoScore('${areaId}', '${h.id}', 4, this)">
                        <span class="opt-emoji">⚠️</span>
                        <span class="opt-label">Dificultad</span>
                    </button>
                    <button class="segmented-opt l4 ${score === 1 ? 'active' : ''}" onclick="selectHitoScore('${areaId}', '${h.id}', 1, this)">
                        <span class="opt-emoji">❌</span>
                        <span class="opt-label">No logra</span>
                    </button>
                </div>
            `;
            section.appendChild(hitoCard);
        });
        container.appendChild(section);
    });

    const btnGuardar = document.getElementById("btnGuardarEval");
    if (isReadOnly) {
        if (btnGuardar) btnGuardar.style.display = "none";
        container.querySelectorAll("button").forEach(b => b.disabled = true);
    } else {
        if (btnGuardar) btnGuardar.style.display = "block";
    }

    modal.classList.add("active");
    if (Object.keys(respuestasHitos).length > 0) actualizarProgresoEvaluacion();
}

function parsearFecha(f) {
    if (!f) return null;
    if (f instanceof Date) return f;
    
    // Si f es un string de formato YYYY-MM-DD o similar, evitemos el desfase de zona horaria
    if (typeof f === 'string') {
        const matchYMD = f.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (matchYMD) {
            return new Date(parseInt(matchYMD[1], 10), parseInt(matchYMD[2], 10) - 1, parseInt(matchYMD[3], 10));
        }
        
        const matchDMY = f.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (matchDMY) {
            return new Date(parseInt(matchDMY[3], 10), parseInt(matchDMY[2], 10) - 1, parseInt(matchDMY[1], 10));
        }
    }

    let d = new Date(f);
    if (!isNaN(d.getTime())) return d;
    return null;
}

function calcularMeses(nacimiento) {
    const fNac = parsearFecha(nacimiento);
    if (!fNac) return 0;
    const hoy = new Date();
    let meses = (hoy.getFullYear() - fNac.getFullYear()) * 12;
    meses += hoy.getMonth() - fNac.getMonth();
    if (hoy.getDate() < fNac.getDate()) meses--;
    return Math.max(0, meses);
}

function obtenerEtapaId(m) {
    if (m === undefined || m === null || isNaN(m)) return "25-36m";
    if (m < 3) return "0-3m";
    if (m < 6) return "4-6m";
    if (m < 9) return "7-9m";
    if (m < 12) return "10-12m";
    if (m < 18) return "13-18m";
    if (m < 24) return "19-24m";
    if (m < 36) return "25-36m";
    if (m < 48) return "3-4a";
    if (m < 60) return "4-5a";
    return "5-6a";
}

function esMesDeTransicion(m, currentEtapaId) {
    if (currentEtapaId === "0-3m" && m === 2) return true;
    if (currentEtapaId === "4-6m" && m === 5) return true;
    if (currentEtapaId === "7-9m" && m === 8) return true;
    if (currentEtapaId === "10-12m" && m === 11) return true;
    if (currentEtapaId === "13-18m" && m === 17) return true;
    if (currentEtapaId === "19-24m" && m === 23) return true;
    if (currentEtapaId === "25-36m" && m === 35) return true;
    if (currentEtapaId === "3-4a" && m === 47) return true;
    if (currentEtapaId === "4-5a" && m === 59) return true;
    if (currentEtapaId === "5-6a" && m === 71) return true;
    return false;
}

function obtenerSiguienteEtapa(etapaId) {
    const etapas = ["0-3m", "4-6m", "7-9m", "10-12m", "13-18m", "19-24m", "25-36m", "3-4a", "4-5a", "5-6a"];
    const idx = etapas.indexOf(etapaId);
    if (idx !== -1 && idx < etapas.length - 1) {
        return etapas[idx + 1];
    }
    return null;
}

function obtenerUltimaEvaluacionRealizada(data, currentEtapaId) {
    if (!data) return currentEtapaId;
    const etapas = ["0-3m", "4-6m", "7-9m", "10-12m", "13-18m", "19-24m", "25-36m", "3-4a", "4-5a", "5-6a"];
    const historial = data.historial_evaluaciones || {};
    
    const startIdx = etapas.indexOf(currentEtapaId);
    if (startIdx === -1) return currentEtapaId;
    
    const nextEtapaId = obtenerSiguienteEtapa(currentEtapaId);
    if (nextEtapaId) {
        const hasNext = historial[nextEtapaId] || (data.etapa_actual === nextEtapaId && data.niveles);
        if (hasNext) return nextEtapaId;
    }
    
    for (let i = startIdx; i >= 0; i--) {
        const eId = etapas[i];
        const hasEval = historial[eId] || (data.etapa_actual === eId && data.niveles);
        if (hasEval) {
            return eId;
        }
    }
    return currentEtapaId;
}

function obtenerEtapasPermitidas() {
    const etapas = ["0-3m", "4-6m", "7-9m", "10-12m", "13-18m", "19-24m", "25-36m", "3-4a", "4-5a", "5-6a"];
    const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
    if (!nacimiento) return etapas;

    const meses = calcularMeses(nacimiento);
    const currentEtapaId = obtenerEtapaId(meses);
    const isTrans = esMesDeTransicion(meses, currentEtapaId);
    const nextEtapaId = isTrans ? obtenerSiguienteEtapa(currentEtapaId) : null;

    const maxEtapaId = nextEtapaId || currentEtapaId;
    const maxIdx = etapas.indexOf(maxEtapaId);

    if (maxIdx === -1) return etapas;
    return etapas.slice(0, maxIdx + 1);
}

function actualizarControlesNavegacionEtapa() {
    const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
    const navControls = document.getElementById("stage-navigation-controls");
    if (navControls) {
        navControls.style.display = nacimiento ? "flex" : "none";
    }

    if (!nacimiento) return;

    const etapasPermitidas = obtenerEtapasPermitidas();
    const idx = etapasPermitidas.indexOf(activeEtapaId);

    const btnPrev = document.getElementById("btn-stage-prev");
    const btnNext = document.getElementById("btn-stage-next");
    const labelName = document.getElementById("label-stage-name");

    if (labelName && activeEtapaId) {
        const name = CATALOGO_HITOS[activeEtapaId]?.nombre || activeEtapaId;
        labelName.textContent = name.replace("Peques de ", "");
    }

    if (btnPrev) btnPrev.disabled = (idx <= 0);
    if (btnNext) btnNext.disabled = (idx === -1 || idx >= etapasPermitidas.length - 1);
}

function cambiarEtapaVista(dir) {
    const etapasPermitidas = obtenerEtapasPermitidas();
    const idx = etapasPermitidas.indexOf(activeEtapaId);
    if (idx === -1) return;

    const newIdx = idx + dir;
    if (newIdx >= 0 && newIdx < etapasPermitidas.length) {
        const targetEtapaId = etapasPermitidas[newIdx];

        // Trigger transition animations on card components
        const wrapper = document.querySelector(".radar-wrapper");
        if (wrapper) {
            wrapper.classList.remove("transitioning");
            void wrapper.offsetWidth; // Force reflow
            wrapper.classList.add("transitioning");
        }
        const btnContainer = document.getElementById("eval-buttons-container");
        if (btnContainer) {
            btnContainer.classList.remove("transitioning");
            void btnContainer.offsetWidth; // Force reflow
            btnContainer.classList.add("transitioning");
        }

        actualizarEtapaVista(targetEtapaId);
    }
}

function actualizarEtapaVista(etapaId) {
    activeEtapaId = etapaId;
    const data = window._activePequeData;

    if (data) {
        const historial = data.historial_evaluaciones || {};

        if (historial[activeEtapaId]) {
            progresoActual = historial[activeEtapaId].niveles || {};
            respuestasHitos = historial[activeEtapaId].hitos_detalle || {};
            respuestasHitosInicial = historial[activeEtapaId].hitos_inicial_detalle || historial[activeEtapaId].hitos_detalle || {};
            nivelesFinales = historial[activeEtapaId].niveles_finales || null;
        } else if (data.etapa_actual === activeEtapaId) {
            progresoActual = data.niveles || {};
            respuestasHitos = data.hitos_detalle || {};
            respuestasHitosInicial = data.hitos_inicial_detalle || data.hitos_detalle || {};
            nivelesFinales = data.niveles_finales || null;
        } else {
            progresoActual = {};
            respuestasHitos = {};
            respuestasHitosInicial = {};
            nivelesFinales = null;
        }
    } else {
        progresoActual = {};
        respuestasHitos = {};
        respuestasHitosInicial = {};
        nivelesFinales = null;
    }

    calcularAvanceTeorico();
    renderRadarChart();
    renderDashboard();

    // Llamamos siempre a renderActividadesDelDia() que internamente decide el fallback y el prompt
    renderActividadesDelDia();

    renderEvaluationButtons();
    actualizarControlesNavegacionEtapa();
}

async function verOEditarEvaluacion(etapaId, isReadOnly = false) {
    const email = document.getElementById("dropdown-cliente").dataset.value || SESION.email;
    const docId = btoa(`${email}_${currentPequeId}`).replace(/=/g, "");
    mostrarCargandoEstimulacion(true);
    try {
        const docSnap = await fb_getDoc(fb_doc(_db, "estimulacion_peques", docId));
        let evalData = null;
        if (docSnap.exists()) {
            const data = docSnap.data();
            const historial = data.historial_evaluaciones || {};
            if (historial[etapaId]) {
                evalData = {
                    etapa_actual: etapaId,
                    hitos_detalle: historial[etapaId].hitos_detalle || {},
                    niveles: historial[etapaId].niveles || {}
                };
            } else if (data.etapa_actual === etapaId) {
                evalData = {
                    etapa_actual: etapaId,
                    hitos_detalle: data.hitos_detalle || {},
                    niveles: data.niveles || {}
                };
            }
        }
        
        if (!evalData && isReadOnly) {
            mostrarToast("No hay evaluación registrada para esta etapa.");
        } else {
            abrirEvaluacionInicial(isReadOnly, evalData, false, etapaId);
        }
    } catch (e) {
        console.error("Error al cargar evaluación:", e);
        mostrarToast("Error al cargar.");
    } finally {
        mostrarCargandoEstimulacion(false);
    }
}

function renderEvaluationButtons() {
    const container = document.getElementById("eval-buttons-container");
    if (!container) return;

    container.innerHTML = "";

    const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
    if (!nacimiento) return;

    const currentName = CATALOGO_HITOS[activeEtapaId]?.nombre || "Etapa Seleccionada";
    const historial = window._activePequeData?.historial_evaluaciones || {};
    const hasEval = historial[activeEtapaId] || (window._activePequeData?.etapa_actual === activeEtapaId && window._activePequeData?.niveles);

    const btn = document.createElement("button");
    btn.className = "btn-eval-modern-outline";
    btn.style.width = "100%";
    
    const label = currentName.replace("Peques de ", "");
    if (hasEval) {
        btn.innerHTML = `<span>👁️ Ver Resultados (${label})</span>`;
        const isReadOnly = SESION.cliente ? true : false;
        btn.onclick = () => verOEditarEvaluacion(activeEtapaId, isReadOnly);
    } else {
        if (SESION.cliente) {
            btn.innerHTML = `<span>🔒 Evaluación Pendiente (${label})</span>`;
            btn.disabled = true;
            btn.style.opacity = "0.6";
            btn.style.cursor = "not-allowed";
        } else {
            btn.innerHTML = `<span>🚀 Realizar Evaluación (${label})</span>`;
            btn.onclick = () => verOEditarEvaluacion(activeEtapaId, false);
        }
    }
    container.appendChild(btn);
}

async function guardarEvaluacionInicial() {
    const modal = document.getElementById("modalEvaluacionEst");
    const etapaId = modal.dataset.etapaId;
    const etapa = CATALOGO_HITOS[etapaId] || CATALOGO_HITOS["0-3m"];

    // Calcular promedios por área
    const nivelesCalculados = {};
    let faltan = [];

    Object.keys(etapa.areas).forEach(areaId => {
        const area = etapa.areas[areaId];
        let suma = 0;
        let cont = 0;
        area.hitos.forEach(h => {
            if (respuestasHitos[h.id] !== undefined && respuestasHitos[h.id] !== null) {
                suma += respuestasHitos[h.id];
                cont++;
            } else {
                faltan.push(h.texto);
            }
        });
        nivelesCalculados[areaId] = cont > 0 ? parseFloat((suma / cont).toFixed(2)) : 1;
    });

    if (faltan.length > 0) {
        return Swal.fire({
            title: '¡Espera!',
            text: `Aún faltan ${faltan.length} hitos por evaluar. Por favor completa todo el formulario.`,
            icon: 'warning',
            confirmButtonColor: '#E84C9A'
        });
    }

    const btn = document.getElementById("btnGuardarEval");
    btn.disabled = true;
    btn.textContent = "Guardando...";

    try {
        const email = document.getElementById("dropdown-cliente").dataset.value || SESION.email;
        const docId = btoa(`${email}_${currentPequeId}`).replace(/=/g, "");

        const updateData = {
            email, peque: currentPequeId,
            actualizado: fb_serverTimestamp()
        };

        if (esSegundaEvaluacion) {
            updateData.niveles_finales = nivelesCalculados;
            updateData.hitos_final_detalle = respuestasHitos;
            updateData.fecha_evaluacion_final = fb_serverTimestamp();
            nivelesFinales = nivelesCalculados;

            // También guardar en el historial para esta etapa
            const docSnap = await fb_getDoc(fb_doc(_db, "estimulacion_peques", docId));
            let historial = {};
            if (docSnap.exists()) {
                historial = docSnap.data().historial_evaluaciones || {};
            }
            if (!historial[etapaId]) {
                historial[etapaId] = {
                    niveles: docSnap.data().niveles || {},
                    hitos_detalle: docSnap.data().hitos_detalle || {},
                    fecha_evaluacion: docSnap.data().fecha_evaluacion || fb_serverTimestamp()
                };
            }
            historial[etapaId].niveles_finales = nivelesCalculados;
            historial[etapaId].hitos_final_detalle = respuestasHitos;
            historial[etapaId].fecha_evaluacion_final = fb_serverTimestamp();
            updateData.historial_evaluaciones = historial;
        } else {
            const docSnap = await fb_getDoc(fb_doc(_db, "estimulacion_peques", docId));
            let historial = {};
            if (docSnap.exists()) {
                historial = docSnap.data().historial_evaluaciones || {};
                const oldEtapa = docSnap.data().etapa_actual;
                if (oldEtapa && !historial[oldEtapa]) {
                    historial[oldEtapa] = {
                        niveles: docSnap.data().niveles || {},
                        hitos_detalle: docSnap.data().hitos_detalle || {},
                        fecha_evaluacion: docSnap.data().fecha_evaluacion || fb_serverTimestamp(),
                        niveles_finales: docSnap.data().niveles_finales || null,
                        hitos_final_detalle: docSnap.data().hitos_final_detalle || null,
                        fecha_evaluacion_final: docSnap.data().fecha_evaluacion_final || null
                    };
                }
            }

            historial[etapaId] = {
                niveles: nivelesCalculados,
                hitos_detalle: respuestasHitos,
                fecha_evaluacion: fb_serverTimestamp()
            };

            updateData.historial_evaluaciones = historial;

            const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
            const meses = calcularMeses(nacimiento);
            const currentEtapaId = obtenerEtapaId(meses);
            const isTrans = esMesDeTransicion(meses, currentEtapaId);
            const nextEtapaId = isTrans ? obtenerSiguienteEtapa(currentEtapaId) : null;

            let esActiva = false;
            if (isTrans && nextEtapaId === etapaId) {
                esActiva = true;
            } else if (etapaId === currentEtapaId) {
                if (!nextEtapaId || !historial[nextEtapaId]) {
                    esActiva = true;
                }
            } else if (!historial[currentEtapaId]) {
                esActiva = true;
            }

            if (esActiva) {
                updateData.niveles = nivelesCalculados;
                updateData.hitos_detalle = respuestasHitos;
                updateData.hitos_inicial_detalle = respuestasHitos;
                updateData.etapa_actual = etapaId;
                updateData.evaluacion_inicial = true;
                updateData.fecha_evaluacion = fb_serverTimestamp();
                progresoActual = nivelesCalculados;
                respuestasHitosInicial = respuestasHitos;
                activeEtapaId = etapaId;
            }
        }

        await fb_updateDoc(fb_doc(_db, "estimulacion_peques", docId), updateData).catch(async e => {
            // Si falla el update es porque el doc no existe
            await fb_setDoc(fb_doc(_db, "estimulacion_peques", docId), updateData);
        });

        const proximaEtapaId = esSegundaEvaluacion ? obtenerSiguienteEtapa(etapaId) : null;

        modal.classList.remove("active");
        mostrarToast("¡Evaluación guardada! ✨");
        renderRadarChart();
        renderDashboard(); 
        renderActividadesDelDia();

        if (proximaEtapaId) {
            setTimeout(() => {
                abrirEvaluacionInicial(false, null, false, proximaEtapaId);
                mostrarToast(`Comenzando Evaluación Inicial para ${obtenerNombreEtapaHumano(proximaEtapaId)} 🚀`);
            }, 600);
        }
    } catch (e) {
        mostrarToast("Error al guardar.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Comenzar Ruta 🚀";
    }
}

async function verResultadosEvaluacion() {
    if (activeEtapaId) {
        const isReadOnly = SESION.cliente ? true : false;
        await verOEditarEvaluacion(activeEtapaId, isReadOnly);
    } else {
        const email = document.getElementById("dropdown-cliente").dataset.value || SESION.email;
        const docId = btoa(`${email}_${currentPequeId}`).replace(/=/g, "");
        mostrarCargandoEstimulacion(true);
        try {
            const docSnap = await fb_getDoc(fb_doc(_db, "estimulacion_peques", docId));
            if (docSnap.exists()) abrirEvaluacionInicial(true, docSnap.data());
            else mostrarToast("No hay evaluación registrada.");
        } catch (e) { mostrarToast("Error al cargar."); }
        finally { mostrarCargandoEstimulacion(false); }
    }
}

async function cargarCatalogoActividades() {
    try {
        console.log("Cargando catálogo desde plantilla_actividades...");
        const snap = await fb_getDocs(fb_collection(_db, "plantilla_actividades"));
        CATALOGO_ACTIVIDADES = snap.docs.map(d => ({ ...d.data(), firebaseId: d.id }));
        console.log("Catálogo cargado:", CATALOGO_ACTIVIDADES.length, "actividades.");
    } catch (e) {
        console.error("Error al cargar catálogo plantilla_actividades:", e);
    }
}

function renderRadarChart() {
    const ctx = document.getElementById('estRadarChart');
    if (!ctx) return;

    // Consolidar las 8 subáreas en los 5 grupos principales
    const configGrupos = [
        { label: "Motricidad", areas: ["motricidad_fina", "motricidad_gruesa"] },
        { label: "Cognitivo", areas: ["cognitiva"] },
        { label: "Lenguaje", areas: ["lenguaje"] },
        { label: "Socioemocional", areas: ["socioemocional"] },
        { label: "Sensorial", areas: ["visual", "auditiva", "gusto"] }
    ];

    const labels = configGrupos.map(g => g.label);
    
    // Dataset 1: Evaluación Inicial
    const dataInicial = configGrupos.map(g => {
        const niveles = g.areas.map(id => progresoActual[id] || 0);
        const promedio = niveles.reduce((a, b) => a + b, 0) / niveles.length;
        return Math.round(promedio * 10) / 10;
    });

    // Dataset 2: Avance Teórico (Basado en actividades)
    const dataTeorica = configGrupos.map(g => {
        const niveles = g.areas.map(id => nivelesTeoricos[id] || 0);
        const promedio = niveles.reduce((a, b) => a + b, 0) / niveles.length;
        return Math.round(promedio * 10) / 10;
    });

    // Dataset 3: Segunda Evaluación (Final)
    const dataFinal = nivelesFinales ? configGrupos.map(g => {
        const niveles = g.areas.map(id => nivelesFinales[id] || 0);
        const promedio = niveles.reduce((a, b) => a + b, 0) / niveles.length;
        return Math.round(promedio * 10) / 10;
    }) : null;

    let tieneActividadesRealizadas = false;
    if (_dataProgresoPeque && _dataProgresoPeque.seguimiento_diario) {
        Object.values(_dataProgresoPeque.seguimiento_diario).forEach(dia => {
            Object.values(dia).forEach(estado => {
                if (estado && estado.startsWith("realizada")) {
                    tieneActividadesRealizadas = true;
                }
            });
        });
    }

    const datasets = [
        {
            label: "Evaluación Inicial",
            data: dataInicial,
            backgroundColor: 'rgba(232, 76, 154, 0.1)',
            borderColor: '#E84C9A',
            pointBackgroundColor: '#E84C9A',
            pointBorderColor: '#fff',
            borderWidth: 2,
            tension: 0.1
        }
    ];

    const tieneEvaluacion = respuestasHitos && Object.keys(respuestasHitos).length > 0;
    if (tieneEvaluacion && tieneActividadesRealizadas) {
        datasets.push({
            label: "Avance Teórico",
            data: dataTeorica,
            backgroundColor: 'rgba(59, 182, 196, 0.1)',
            borderColor: '#3BB6C4',
            pointBackgroundColor: '#3BB6C4',
            pointBorderColor: '#fff',
            borderDash: [5, 5],
            borderWidth: 2,
            tension: 0.1
        });
    }

    if (dataFinal) {
        datasets.push({
            label: "Evaluación Final",
            data: dataFinal,
            backgroundColor: 'rgba(255, 184, 0, 0.1)',
            borderColor: '#FFB800',
            pointBackgroundColor: '#FFB800',
            pointBorderColor: '#fff',
            borderWidth: 3,
            tension: 0.1
        });
    }

    if (estChart) {
        estChart.data.labels = labels;
        estChart.data.datasets = datasets;
        estChart.update();
        return;
    }

    estChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(0,0,0,0.05)' },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: { display: false, stepSize: 2 },
                    pointLabels: {
                        font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' },
                        color: '#191C1E'
                    }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderDashboard() {
    const milestonesList = document.getElementById("est-milestones-list");
    if (!milestonesList) return;

    milestonesList.innerHTML = "";

    // Identificar hitos prioritarios (Rojos y Amarillos de la evaluación)
    const hitosPrioritarios = Object.keys(respuestasHitos)
        .filter(id => respuestasHitos[id] <= 7)
        .sort(); // Ordenar para consistencia al cambiar entre peques

    // Tomar los primeros 4 para no saturar el cuadro
    const listado = hitosPrioritarios.slice(0, 4);

    if (listado.length === 0) {
        milestonesList.innerHTML = `
            <div class="milestone-placeholder" style="color:rgba(255,255,255,0.7); font-size:12px; padding:10px; border:1px dashed rgba(255,255,255,0.3); border-radius:12px;">
                ${Object.keys(respuestasHitos).length > 0 ? '¡Increíble! Este peque está al día en todos sus hitos. Sigue con la ruta para mantener su progreso.' : 'Realiza la evaluación para identificar los objetivos del mes.'}
            </div>
        `;
        return;
    }

    listado.forEach(hId => {
        let hitoTexto = "Objetivo de desarrollo";
        let areaNombre = "General";

        // Buscar en el catálogo maestro
        Object.keys(CATALOGO_HITOS).forEach(etapa => {
            if (CATALOGO_HITOS[etapa].areas) {
                Object.keys(CATALOGO_HITOS[etapa].areas).forEach(area => {
                    const found = CATALOGO_HITOS[etapa].areas[area].hitos.find(h => h.id === hId);
                    if (found) {
                        hitoTexto = found.texto;
                        areaNombre = area.charAt(0).toUpperCase() + area.slice(1);
                    }
                });
            }
        });

        milestonesList.innerHTML += `
            <div class="milestone-item" style="cursor:pointer;" onclick="abrirDetalleHito('${hId}')">
                <span class="material-symbols-outlined m-icon" style="font-size:18px;">track_changes</span>
                <div style="min-width:0;">
                    <span class="m-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${hitoTexto}</span>
                    <span class="m-date">${areaNombre} • Prioridad Mensual</span>
                </div>
            </div>
        `;
    });
}

function abrirDetalleHito(hId) {
    let hitoTexto = "";
    let areaKey = "";
    let areaNombre = "";

    const OBJETIVOS_AREAS = {
        "motricidad_fina": "Desarrollar la coordinación de los pequeños músculos en manos y dedos para facilitar la manipulación precisa de objetos y futuras habilidades de escritura.",
        "motricidad_gruesa": "Fortalecer los grandes grupos musculares para mejorar el equilibrio, la postura y la capacidad de desplazamiento del pequeño.",
        "visual": "Estimular la agudeza visual y la capacidad de seguimiento para procesar mejor el entorno y reconocer patrones complejos.",
        "gusto": "Fomentar la exploración sensorial a través del gusto y asegurar una transición segura y saludable hacia diferentes texturas y sabores.",
        "auditiva": "Desarrollar la sensibilidad sonora y la localización auditiva, base fundamental para el desarrollo del lenguaje y la atención.",
        "cognitiva": "Potenciar los procesos de pensamiento, memoria y resolución de problemas básicos mediante la exploración causa-efecto.",
        "lenguaje": "Sentar las bases de la comunicación verbal y no verbal, estimulando la comprensión y la expresión de necesidades y emociones.",
        "socioemocional": "Fortalecer el vínculo afectivo y la seguridad emocional, permitiendo al pequeño interactuar con confianza con su entorno social."
    };

    // Buscar en el catálogo maestro
    Object.keys(CATALOGO_HITOS).forEach(etapa => {
        if (CATALOGO_HITOS[etapa].areas) {
            Object.keys(CATALOGO_HITOS[etapa].areas).forEach(area => {
                const found = CATALOGO_HITOS[etapa].areas[area].hitos.find(h => h.id === hId);
                if (found) {
                    hitoTexto = found.texto;
                    areaKey = area;
                    areaNombre = CATALOGO_HITOS[etapa].areas[area].nombre || area;
                }
            });
        }
    });

    if (!hitoTexto) return;

    document.getElementById("hito-detalle-texto").innerText = hitoTexto;
    document.getElementById("hito-detalle-area").innerText = areaNombre + " • Objetivo Mensual";
    document.getElementById("hito-detalle-objetivo").innerText = OBJETIVOS_AREAS[areaKey] || "Este hito es fundamental para el desarrollo integral del pequeño en su etapa actual.";

    document.getElementById("modalHitoDetalle").style.display = "flex";
}

// Helper to get local midnight of a Date object
function _obtenerInicioDia(d) {
    const res = new Date(d);
    res.setHours(0, 0, 0, 0);
    return res;
}

// Function to calculate suggestions for a hito on a specific date
function obtenerActividadesSugeridasParaHito(hId, targetDateStr) {
    const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
    const etapaId = activeEtapaId || obtenerEtapaId(calcularMeses(nacimiento));

    const mapEtapaFirebase = {
        "0-3m": "0 a 3 meses",
        "4-6m": "3 a 6 meses",
        "7-9m": "6 a 9 meses",
        "10-12m": "9 a 12 meses",
        "13-18m": "12 a 18 meses",
        "19-24m": "18 a 24 meses",
        "25-36m": "2 a 3 años",
        "3-4a": "3 a 4 años",
        "4-5a": "4 a 5 años",
        "5-6a": "5 a 6 años"
    };
    const etapaFirebase = mapEtapaFirebase[etapaId] || "0 a 3 meses";

    // 1. Get hito text from catalog
    let hitoTexto = "";
    Object.keys(CATALOGO_HITOS).forEach(e => {
        if (CATALOGO_HITOS[e].areas) {
            Object.keys(CATALOGO_HITOS[e].areas).forEach(a => {
                const found = CATALOGO_HITOS[e].areas[a].hitos.find(h => h.id === hId);
                if (found) hitoTexto = found.texto;
            });
        }
    });

    // 2. Filter matching activities from catalog
    let actsHito = CATALOGO_ACTIVIDADES.filter(a =>
        (a.etapa || "").trim().toLowerCase() === etapaFirebase.toLowerCase() &&
        (a.hitoTitulo || "").trim().toLowerCase() === hitoTexto.toLowerCase()
    );
    if (actsHito.length === 0) return [];
    actsHito.sort((a, b) => (a.ordenSecuencia || 0) - (b.ordenSecuencia || 0));

    // 3. Define the stable base date (fecha_evaluacion or fallback)
    let dBase = null;
    if (window._activePequeData) {
        const historial = window._activePequeData.historial_evaluaciones || {};
        const fechaEval = historial[activeEtapaId]?.fecha_evaluacion || window._activePequeData.fecha_evaluacion;
        if (fechaEval) {
            dBase = (typeof fechaEval.toDate === 'function') ? fechaEval.toDate() : new Date(fechaEval);
        }
    }
    if (!dBase || isNaN(dBase.getTime())) {
        dBase = parsearFecha(nacimiento);
    }
    if (!dBase || isNaN(dBase.getTime())) {
        dBase = new Date();
        dBase.setDate(dBase.getDate() - 7);
    }
    dBase = _obtenerInicioDia(dBase);

    // 4. Define sliding window around dHoy (actual current local date)
    const dHoy = _obtenerInicioDia(new Date());
    const dWindowStart = new Date(dHoy.getTime() - 2 * 24 * 60 * 60 * 1000);
    const dWindowEnd = new Date(dHoy.getTime() + 4 * 24 * 60 * 60 * 1000);

    const dSel = _obtenerInicioDia(new Date(targetDateStr + "T00:00:00"));

    // 5. Gather all completed activity IDs in history
    const completadas = new Set();
    if (_dataProgresoPeque && _dataProgresoPeque.seguimiento_diario) {
        Object.keys(_dataProgresoPeque.seguimiento_diario).forEach(dateStr => {
            const dia = _dataProgresoPeque.seguimiento_diario[dateStr];
            if (dia) {
                Object.keys(dia).forEach(actId => {
                    const status = dia[actId];
                    if (status && status.startsWith("realizada")) {
                        completadas.add(actId);
                    }
                });
            }
        });
    }

    // 6. Calculate the base scheduled activity index for a date d
    function getBaseScheduledIndexForDate(d) {
        const diffMs = d.getTime() - dBase.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // 7. Calculate window scheduled activities
    const actividadesEnVentana = new Set();
    const actsEnVentanaList = [];
    for (let i = -2; i <= 4; i++) {
        const dWin = _obtenerInicioDia(new Date(dHoy.getTime() + i * 24 * 60 * 60 * 1000));
        const idx = getBaseScheduledIndexForDate(dWin);
        const act = actsHito[idx % actsHito.length];
        if (act) {
            actividadesEnVentana.add(act.firebaseId);
            actsEnVentanaList.push(act);
        }
    }

    // CASE A: Within the current visible window (or past dates)
    if (dSel.getTime() <= dWindowEnd.getTime()) {
        const idx = getBaseScheduledIndexForDate(dSel);
        const act = actsHito[idx % actsHito.length];
        if (!act) return [];
        return [{
            ...act,
            cicloActual: Math.floor(idx / actsHito.length) + 1,
            indiceEnHito: idx % actsHito.length,
            hitoRelacionado: hId
        }];
    }

    // CASE B: Future dates (outside current window)
    // Find uncompleted past activities in the window (dWindowStart <= d_past <= dHoy)
    const pasadasPendientes = [];
    const pasadasPendientesIds = new Set();
    for (let d = new Date(dWindowStart.getTime()); d.getTime() <= dHoy.getTime(); d.setDate(d.getDate() + 1)) {
        const dNormalized = _obtenerInicioDia(d);
        const idx = getBaseScheduledIndexForDate(dNormalized);
        const act = actsHito[idx % actsHito.length];
        if (act && !completadas.has(act.firebaseId)) {
            if (!pasadasPendientesIds.has(act.firebaseId)) {
                pasadasPendientes.push(act);
                pasadasPendientesIds.add(act.firebaseId);
            }
        }
    }

    // Build the list of future available activities:
    // 1. Uncompleted past activities (Catch-Up)
    // 2. Uncompleted activities in the catalog that are not scheduled in the current window
    const catalogIncompletasNoVentana = actsHito.filter(act => 
        !completadas.has(act.firebaseId) && 
        !actividadesEnVentana.has(act.firebaseId) &&
        !pasadasPendientesIds.has(act.firebaseId)
    );

    const disponiblesParaFuturo = [...pasadasPendientes, ...catalogIncompletasNoVentana];
    if (disponiblesParaFuturo.length === 0) {
        // Fallback: if all are completed, repeat the catalog
        disponiblesParaFuturo.push(...actsHito);
    }

    // Calculate offset from dWindowEnd
    const diffMsFuture = dSel.getTime() - (dWindowEnd.getTime() + 24 * 60 * 60 * 1000);
    const offsetDays = Math.max(0, Math.round(diffMsFuture / (1000 * 60 * 60 * 24)));

    const actSel = disponiblesParaFuturo[offsetDays % disponiblesParaFuturo.length];
    const idxOriginal = actsHito.indexOf(actSel);

    return [{
        ...actSel,
        cicloActual: Math.floor(idxOriginal / actsHito.length) + 1,
        indiceEnHito: idxOriginal !== -1 ? idxOriginal : 0,
        hitoRelacionado: hId
    }];
}

function obtenerDiasRestantesCambioEtapa(nacimientoStr, etapaId) {
    const limites = {
        "0-3m": 3, "4-6m": 6, "7-9m": 9, "10-12m": 12,
        "13-18m": 18, "19-24m": 24, "25-36m": 36, "3-4a": 48, "4-5a": 60
    };
    const maxMeses = limites[etapaId];
    if (!maxMeses) return null;

    const fNac = parsearFecha(nacimientoStr);
    if (!fNac) return null;

    const nacimiento = new Date(fNac.getFullYear(), fNac.getMonth(), fNac.getDate(), 12, 0, 0, 0);
    const fechaCambio = new Date(nacimiento);
    fechaCambio.setMonth(nacimiento.getMonth() + maxMeses);

    const hoy = new Date();
    hoy.setHours(12, 0, 0, 0);

    const diffTime = fechaCambio.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

async function renderActividadesDelDia() {
    const container = document.getElementById("actividades-lista-container");
    if (!container) return;

    mostrarCargandoEstimulacion(true);

    try {
        if (CATALOGO_ACTIVIDADES.length === 0) {
            await cargarCatalogoActividades();
        }

        if (CATALOGO_ACTIVIDADES.length === 0) {
            container.innerHTML = '<div class="no-data">No hay actividades disponibles en el catálogo.</div>';
            return;
        }

        const email = document.getElementById("dropdown-cliente").dataset.value || SESION.email;
        const docId = btoa(`${email}_${currentPequeId}`).replace(/=/g, "");

        const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
        const etapaId = activeEtapaId || obtenerEtapaId(calcularMeses(nacimiento));

        // Mapeo de Etapa ID a Etapa Firebase
        const mapEtapaFirebase = {
            "0-3m": "0 a 3 meses",
            "4-6m": "3 a 6 meses",
            "7-9m": "6 a 9 meses",
            "10-12m": "9 a 12 meses",
            "13-18m": "12 a 18 meses",
            "19-24m": "18 a 24 meses",
            "25-36m": "2 a 3 años",
            "3-4a": "3 a 4 años",
            "4-5a": "4 a 5 años",
            "5-6a": "5 a 6 años"
        };

        // Regla: la sugerencia de actividades de la etapa anterior expirará 1 mes después del cambio de etapa (Desactivado para continuar sugiriendo actividades)
        let sugerenciasExpiradas = false;

        const data = window._activePequeData;
        const meses = calcularMeses(nacimiento);
        const currentEtapaId = obtenerEtapaId(meses);
        
        let respuestasHitosParaActividades = { ...respuestasHitos };
        let etapaIdParaActividades = etapaId;

        if (Object.keys(respuestasHitosParaActividades).length === 0 && data) {
            // No hay evaluación para la etapa activa, buscar la última evaluada para no dejar de sugerir
            const ultimaEtapaEvaluada = obtenerUltimaEvaluacionRealizada(data, currentEtapaId);
            if (ultimaEtapaEvaluada && ultimaEtapaEvaluada !== activeEtapaId) {
                const historial = data.historial_evaluaciones || {};
                if (historial[ultimaEtapaEvaluada]) {
                    respuestasHitosParaActividades = historial[ultimaEtapaEvaluada].hitos_detalle || {};
                    etapaIdParaActividades = ultimaEtapaEvaluada;
                } else if (data.etapa_actual === ultimaEtapaEvaluada) {
                    respuestasHitosParaActividades = data.hitos_detalle || {};
                    etapaIdParaActividades = ultimaEtapaEvaluada;
                }
            }
        }

        // 1. Clasificar hitos de la evaluación a trabajar
        const hitosRojos = [];    // No lo hace (1)
        const hitosAmarillos = []; // Con dificultad (4 o 7)
        const hitosVerdes = [];   // Lo hace bien (10)

        Object.keys(respuestasHitosParaActividades).forEach(id => {
            const score = respuestasHitosParaActividades[id];
            if (score === 1) hitosRojos.push(id);
            else if (score <= 7) hitosAmarillos.push(id);
            else hitosVerdes.push(id);
        });

        hitosRojos.sort();
        hitosAmarillos.sort();
        hitosVerdes.sort();

        // 2. Selección de Hitos (Mínimo 2, Máximo 5)
        let slots = [];
        hitosRojos.forEach(h => { if (slots.length < 5) slots.push(h); });
        hitosAmarillos.forEach(h => { if (slots.length < 5) slots.push(h); });
        if (slots.length < 2) {
            hitosVerdes.forEach(h => { if (slots.length < 5) slots.push(h); });
        }

        const sugeridas = [];
        const etapaFirebase = mapEtapaFirebase[etapaIdParaActividades] || "0 a 3 meses";

        for (const hId of slots) {
            const hitoSugs = obtenerActividadesSugeridasParaHito(hId, _fechaSeleccionadaEst);
            if (hitoSugs.length > 0) {
                sugeridas.push(hitoSugs[0]);
            }
        }

        // 3. Cargar resultados del día seleccionado para mostrar indicadores (síncrono)
        const progData = _dataProgresoPeque || {};
        const hoy = _fechaSeleccionadaEst;
        const resultadosHoy = (progData.seguimiento_diario && progData.seguimiento_diario[hoy]) ? progData.seguimiento_diario[hoy] : {};

        // Generar ficha "Próxima Evaluación" si aplica (15 días antes del cambio de etapa o si está pendiente de cierre o inicial)
        let cardProximaEvalHtml = "";
        if (nacimiento && !SESION.cliente && data) { // Solo Nannies
            const historial = data.historial_evaluaciones || {};
            
            // 1. Encontrar la última etapa evaluada
            const ultimaEtapaEvaluada = obtenerUltimaEvaluacionRealizada(data, currentEtapaId);
            
            // Obtener datos de esa última evaluación
            const evalDataUltima = historial[ultimaEtapaEvaluada] || (data.etapa_actual === ultimaEtapaEvaluada ? data : null);
            const tieneCierre = evalDataUltima && (evalDataUltima.niveles_finales || evalDataUltima.hitos_final_detalle || evalDataUltima.fecha_evaluacion_final);
            
            // Calcular días restantes para el cambio de etapa de la última etapa evaluada
            const diasRestantesUltima = obtenerDiasRestantesCambioEtapa(nacimiento, ultimaEtapaEvaluada);
            
            const nextEtapaId = obtenerSiguienteEtapa(ultimaEtapaEvaluada);
            const hasNextEval = nextEtapaId && (historial[nextEtapaId] || data.etapa_actual === nextEtapaId);

            if (diasRestantesUltima !== null && diasRestantesUltima <= 15 && !tieneCierre) {
                // Caso 1: Toca evaluación de cierre de la etapa actual (se muestra de manera persistente)
                const clickAction = `abrirEvaluacionInicial(false, null, true, '${ultimaEtapaEvaluada}')`;
                const textoDias = diasRestantesUltima > 0 
                    ? `Faltan ${diasRestantesUltima} días para el cambio de etapa`
                    : `¡Cambio de etapa vencido hace ${Math.abs(diasRestantesUltima)} días!`;
                
                if (!document.getElementById("style-proxima-eval")) {
                    const style = document.createElement("style");
                    style.id = "style-proxima-eval";
                    style.textContent = `
                        @keyframes pulseArrow {
                            0%, 100% { transform: translateX(0); }
                            50% { transform: translateX(4px); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                cardProximaEvalHtml = `
                    <div class="act-item-modern" onclick="${clickAction}" style="background: linear-gradient(135deg, #e84c9a 0%, #f472b6 100%); color: white; border: none; margin-bottom: 8px; width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 15px rgba(232, 76, 154, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;">
                        <div class="act-status-indicator" style="background: white; border: 3px solid #e84c9a; box-shadow: 0 0 6px rgba(255,255,255,0.8); width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;"></div>
                        <div class="act-item-content" style="flex-grow: 1;">
                            <div class="act-item-title" style="font-weight: 800; color: white;">Evaluación de Cierre Requerida 🚀</div>
                            <div class="act-item-tags" style="margin-top: 4px; display: flex; gap: 6px; flex-wrap: wrap;">
                                <span class="act-tag-mini" style="background: rgba(255, 255, 255, 0.2); color: white; font-weight: 600;">
                                    Cierre de etapa (${obtenerNombreEtapaHumano(ultimaEtapaEvaluada)})
                                </span>
                                <span class="act-tag-mini" style="background: rgba(255, 255, 255, 0.15); color: white; font-weight: 700;">
                                    ${textoDias}
                                </span>
                            </div>
                        </div>
                        <span class="material-symbols-outlined" style="color: white; font-size: 20px; animation: pulseArrow 1.5s infinite;">chevron_right</span>
                    </div>
                `;
            } else if (tieneCierre && nextEtapaId && !hasNextEval) {
                // Caso 2: Ya se hizo el cierre, toca la inicial de la siguiente etapa
                const clickAction = `abrirEvaluacionInicial(false, null, false, '${nextEtapaId}')`;
                
                if (!document.getElementById("style-proxima-eval")) {
                    const style = document.createElement("style");
                    style.id = "style-proxima-eval";
                    style.textContent = `
                        @keyframes pulseArrow {
                            0%, 100% { transform: translateX(0); }
                            50% { transform: translateX(4px); }
                        }
                    `;
                    document.head.appendChild(style);
                }

                cardProximaEvalHtml = `
                    <div class="act-item-modern" onclick="${clickAction}" style="background: linear-gradient(135deg, #3bb6c4 0%, #50d9fe 100%); color: white; border: none; margin-bottom: 8px; width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: 16px; box-shadow: 0 4px 15px rgba(59, 182, 196, 0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;">
                        <div class="act-status-indicator" style="background: white; border: 3px solid #3bb6c4; box-shadow: 0 0 6px rgba(255,255,255,0.8); width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;"></div>
                        <div class="act-item-content" style="flex-grow: 1;">
                            <div class="act-item-title" style="font-weight: 800; color: white;">Nueva Evaluación Disponible ✨</div>
                            <div class="act-item-tags" style="margin-top: 4px; display: flex; gap: 6px; flex-wrap: wrap;">
                                <span class="act-tag-mini" style="background: rgba(255, 255, 255, 0.2); color: white; font-weight: 600;">
                                    Evaluación inicial (${obtenerNombreEtapaHumano(nextEtapaId)})
                                </span>
                                <span class="act-tag-mini" style="background: rgba(255, 255, 255, 0.15); color: white; font-weight: 700;">
                                    Pendiente de evaluación inicial
                                </span>
                            </div>
                        </div>
                        <span class="material-symbols-outlined" style="color: white; font-size: 20px; animation: pulseArrow 1.5s infinite;">chevron_right</span>
                    </div>
                `;
            }
        }

        // 4. Renderizar Listado Compacto
        container.innerHTML = "";

        if (sugeridas.length === 0) {
            const numHitos = Object.keys(respuestasHitosParaActividades).length;
            const noDataEl = document.createElement("div");
            noDataEl.style.width = "100%";
            if (numHitos === 0) {
                if (SESION.cliente) {
                    noDataEl.innerHTML = `
                        <div class="eval-prompt-card" style="text-align:center; padding:40px 20px; background:white; border-radius:24px; border:2px dashed #ffcad4; margin-top:20px; grid-column: 1 / -1; width: 100%;">
                            <div style="font-size:50px; margin-bottom:15px;">✨🧸</div>
                            <h3 style="color:var(--est-text); margin-bottom:10px;">¡Casi listo para brillar!</h3>
                            <p style="color:var(--est-text-muted); margin-bottom:20px; max-width:400px; margin-inline:auto;">La evaluación del desarrollo de <b>${currentPequeId}</b> aún no está completa, pero ya estamos trabajando en ello para crear la ruta perfecta.</p>
                            <div style="font-size:12px; color:var(--est-primary); font-weight:700;">Pronto verás los resultados aquí 🎨</div>
                        </div>
                    `;
                } else {
                    noDataEl.innerHTML = `
                        <div class="eval-prompt-card" style="text-align:center; padding:40px 20px; background:white; border-radius:24px; border:2px dashed var(--est-primary); margin-top:20px; grid-column: 1 / -1; width: 100%;">
                            <div style="font-size:50px; margin-bottom:15px;">👶✨</div>
                            <h3 style="color:var(--est-text); margin-bottom:10px;">¡Comencemos con ${currentPequeId}!</h3>
                            <p style="color:var(--est-text-muted); margin-bottom:20px; max-width:400px; margin-inline:auto;">Para personalizar la ruta de actividades, primero necesitamos realizar la evaluación del desarrollo.</p>
                            <button class="btn-save-modern" onclick="abrirEvaluacionInicial()" style="width:auto; padding:14px 30px; background: var(--est-primary); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s;">
                                Iniciar Evaluación del Desarrollo 🚀
                            </button>
                        </div>
                    `;
                }
            } else {
                noDataEl.innerHTML = `<div class="no-data" style="padding:20px; text-align:center; color:var(--est-text-muted);">No encontramos actividades en el catálogo que coincidan con la etapa <b>${etapaFirebase}</b> y los hitos evaluados.</div>`;
            }
            if (cardProximaEvalHtml) {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = cardProximaEvalHtml.trim();
                const evalCardEl = tempDiv.firstElementChild;
                if (evalCardEl) {
                    container.appendChild(evalCardEl);
                }
            }
            container.appendChild(noDataEl);
            renderMaterialesSemanales();
            return;
        }

        const listWrap = document.createElement("div");
        listWrap.className = "act-list-compact";

        if (cardProximaEvalHtml) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = cardProximaEvalHtml.trim();
            const evalCardEl = tempDiv.firstElementChild;
            if (evalCardEl) {
                listWrap.appendChild(evalCardEl);
            }
        }

        sugeridas.forEach(act => {
            const areaTag = act.subareaDesarrollo || act.areaDesarrollo || "General";
            const status = resultadosHoy[act.firebaseId] || "pendiente";

            const item = document.createElement("div");
            item.className = "act-item-modern";
            item.onclick = () => abrirDetalleActividad(act.firebaseId);

            let statusClass = "";
            if (status && status.startsWith("realizada")) statusClass = "realizada";
            else if (status === "no_realizada") statusClass = "no-realizada";

            item.innerHTML = `
                <div class="act-status-indicator ${statusClass}"></div>
                <div class="act-item-content">
                    <div class="act-item-title">${act.titulo}</div>
                    <div class="act-item-tags">
                        <span class="act-tag-mini">${areaTag}</span>
                        <span class="act-tag-mini" style="background:rgba(232, 76, 154, 0.05); color:var(--est-primary);">
                            ${act.tiempo || '5 min'}
                        </span>
                    </div>
                </div>
                <span class="material-symbols-outlined" style="color:#cbd5e1; font-size:20px;">chevron_right</span>
            `;
            listWrap.appendChild(item);
        });

        container.appendChild(listWrap);

        // 5. Renderizar Materiales de la Semana
        renderMaterialesSemanales();

    } catch (e) {
        console.error("Error en renderActividades:", e);
        container.innerHTML = '<div class="no-data">Error al cargar la ruta diaria.</div>';
    } finally {
        mostrarCargandoEstimulacion(false);
    }
}

function renderMaterialesSemanales() {
    const materialsList = document.getElementById("est-materials-list");
    if (!materialsList || !currentPequeId) return;

    materialsList.innerHTML = "";

    // Si no hay evaluación, no calculamos nada
    if (Object.keys(respuestasHitos).length === 0) {
        materialsList.innerHTML = '<div class="milestone-placeholder">Realiza la evaluación para ver los materiales necesarios.</div>';
        return;
    }

    const uniqueMaterials = new Set();

    try {
        const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
        if (!nacimiento) return;
        const etapaId = activeEtapaId || obtenerEtapaId(calcularMeses(nacimiento));

        // 1. Identificar hitos a trabajar
        const hitosRojos = [];
        const hitosAmarillos = [];
        const hitosVerdes = [];

        Object.keys(respuestasHitos).forEach(id => {
            const score = respuestasHitos[id];
            if (score === 1) hitosRojos.push(id);
            else if (score <= 7) hitosAmarillos.push(id);
            else hitosVerdes.push(id);
        });

        hitosRojos.sort();
        hitosAmarillos.sort();
        hitosVerdes.sort();

        let slots = [];
        hitosRojos.forEach(h => { if (slots.length < 5) slots.push(h); });
        hitosAmarillos.forEach(h => { if (slots.length < 5) slots.push(h); });
        if (slots.length < 2) {
            hitosVerdes.forEach(h => { if (slots.length < 5) slots.push(h); });
        }

        // 2. Proyectar materiales para los próximos 7 días
        const dHoy = _obtenerInicioDia(new Date());
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const targetDate = new Date(dHoy.getTime() + dayOffset * 24 * 60 * 60 * 1000);
            const targetDateStr = _obtenerFechaLocalISO(targetDate);
            for (const hId of slots) {
                const hitoSugs = obtenerActividadesSugeridasParaHito(hId, targetDateStr);
                if (hitoSugs.length > 0) {
                    const act = hitoSugs[0];
                    const matStr = (act.material || "").trim().toLowerCase();
                    const ignorados = ["n/a", "na", "ninguno", "ninguno.", "n/a.", "-"];
                    
                    if (matStr && !ignorados.includes(matStr)) {
                        act.material.split(/[,;]/).forEach(p => {
                            let m = p.trim();
                            if (!m) return;
                            if (ignorados.includes(m.toLowerCase())) return;
                            m = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
                            uniqueMaterials.add(m);
                        });
                    }
                }
            }
        }

        const materialesReady = _dataProgresoPeque.materiales || {};

        if (uniqueMaterials.size === 0) {
            materialsList.innerHTML = '<div class="milestone-placeholder">No se requieren materiales especiales esta semana.</div>';
        } else {
            uniqueMaterials.forEach(m => {
                const pill = document.createElement("div");
                pill.className = "material-pill";

                const readyStatus = materialesReady[m]; // 'familia' o 'nanny'
                if (readyStatus === 'familia') pill.classList.add("ready-familia");
                else if (readyStatus === 'nanny') pill.classList.add("ready-nanny");

                const icon = (readyStatus) ? "check_circle" : "inventory_2";

                pill.innerHTML = `<span class="material-symbols-outlined" style="font-size:14px; margin-right:4px;">${icon}</span> ${m}`;
                pill.onclick = () => toggleMaterialListo(m);
                materialsList.appendChild(pill);
            });
        }
    } catch (e) {
        console.error("Error calculando materiales semanales:", e);
    }
}

async function toggleMaterialListo(m) {
    if (!currentPequeId) return;
    try {
        const email = document.getElementById("dropdown-cliente").dataset.value || SESION.email;
        const docId = btoa(`${email}_${currentPequeId}`).replace(/=/g, "");
        const ref = fb_doc(_db, "progreso_peque", docId);

        const data = _dataProgresoPeque || {};
        const materiales = { ...(data.materiales || {}) };

        const rolActual = SESION.cliente ? "familia" : "nanny";

        // Si ya está marcado por el mismo rol, lo quitamos
        if (materiales[m] === rolActual) {
            delete materiales[m];
        } else {
            // Si no está marcado, o lo marcó el otro, lo marcamos nosotros
            materiales[m] = rolActual;
        }

        await fb_updateDoc(ref, { materiales: materiales });
        // onSnapshot se encargará de re-renderizar
    } catch (e) {
        console.error("Error al marcar material:", e);
    }
}

// Variables temporales para el modal abierto
let _actividadAbierta = null;

async function abrirDetalleActividad(id) {
    const act = CATALOGO_ACTIVIDADES.find(a => a.firebaseId === id);
    if (!act) return;

    _actividadAbierta = act;

    // Poblar modal (Soportando propiedades antiguas y nuevas)
    document.getElementById("detail-title").innerText = act.titulo || "Actividad sin título";
    document.getElementById("detail-etapa-badge").innerText = act.etapa || "Desarrollo";
    document.getElementById("detail-descripcion").innerText = act.descripcion || act.instrucciones || "Sin descripción disponible.";
    document.getElementById("detail-tiempo").innerText = act.tiempo || act.duracion || "5 min aprox.";
    document.getElementById("detail-repeticion").innerText = act.repeticion || act.repeticiones || "Según indicación.";
    document.getElementById("detail-material").innerText = act.material || "N/A";
    document.getElementById("detail-area").innerText = act.areaDesarrollo || act.area || "General";
    document.getElementById("detail-objetivo").innerText = act.hitoObjetivo || act.objetivo || "Mejorar las capacidades del pequeño en esta área.";
    document.getElementById("detail-hito").innerText = act.hitoTitulo || act.hito || "Hito no especificado.";

    // Media
    const mediaWrap = document.getElementById("detail-media-wrap");
    mediaWrap.innerHTML = "";

    // Buscar media en el objeto (priorizar array 'media' o 'mediaUrl')
    const allMedia = act.media || [];
    const mainMedia = allMedia.length > 0 ? allMedia[0] : (act.mediaUrl ? { url: act.mediaUrl, type: act.mediaType || 'image' } : null);

    if (mainMedia) {
        if (mainMedia.type === 'video' || mainMedia.url.includes('video')) {
            const videoUrl = mainMedia.id ? `https://drive.google.com/file/d/${mainMedia.id}/preview` : mainMedia.url;
            mediaWrap.innerHTML = `
                <div style="position:relative; width:100%; height:100%;">
                    <!-- Sandbox para bloquear descargas y capa invisible para bloquear la barra superior -->
                    <iframe src="${videoUrl}" style="width:100%; height:100%; border:none;" allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
                    <div style="position:absolute; top:0; left:0; right:0; height:60px; background:transparent; z-index:10;"></div>
                </div>
            `;
        } else {
            const imgUrl = mainMedia.id ? `https://drive.google.com/uc?export=view&id=${mainMedia.id}` : mainMedia.url;
            mediaWrap.innerHTML = `<img src="${imgUrl}" alt="Actividad" style="cursor:zoom-in;" onclick="window.open('${imgUrl}', '_blank')">`;
        }
    } else {
        mediaWrap.innerHTML = `<img src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800" alt="Placeholder">`;
    }

    // Actualizar botones de estado (usando datos síncronos del listener)
    const progData = _dataProgresoPeque || {};
    const hoy = _fechaSeleccionadaEst;
    const resultadosHoy = (progData.seguimiento_diario && progData.seguimiento_diario[hoy]) ? progData.seguimiento_diario[hoy] : {};
    const status = resultadosHoy[id] || "pendiente";

    document.getElementById("btn-status-done").classList.remove("active");
    document.getElementById("btn-status-fail").classList.remove("active");
    document.getElementById("btn-status-pending").classList.remove("active");

    if (status && status.startsWith("realizada")) document.getElementById("btn-status-done").classList.add("active");
    else if (status === "no_realizada") document.getElementById("btn-status-fail").classList.add("active");
    else if (status === "pendiente") document.getElementById("btn-status-pending").classList.add("active");

    // Mostrar modal
    document.getElementById("modalDetalleActividad").style.display = "flex";
}

function cerrarDetalleActividad() {
    document.getElementById("modalDetalleActividad").style.display = "none";
}

async function marcarEstadoActividad(status) {
    if (!_actividadAbierta) return;

    const act = _actividadAbierta;
    const email = document.getElementById("dropdown-cliente").dataset.value || SESION.email;
    const docId = btoa(`${email}_${currentPequeId}`).replace(/=/g, "");
    const hoy = _fechaSeleccionadaEst;

    try {
        const snap = await fb_getDoc(fb_doc(_db, "progreso_peque", docId));
        let data = snap.exists() ? snap.data() : { hitos: {}, seguimiento_diario: {} };

        if (!data.seguimiento_diario) data.seguimiento_diario = {};
        if (!data.seguimiento_diario[hoy]) data.seguimiento_diario[hoy] = {};

        // Guardar el estado
        let valorAGuardar = status;
        if (status === "realizada") {
            if (typeof SESION !== 'undefined' && SESION.cliente) {
                valorAGuardar = "realizada_familia";
            } else {
                valorAGuardar = "realizada_ninera";
            }
        }

        if (status === "pendiente") {
            delete data.seguimiento_diario[hoy][act.firebaseId];
        } else {
            data.seguimiento_diario[hoy][act.firebaseId] = valorAGuardar;
        }

        // Si es realizada, avanzar el progreso técnico (ciclos/índices)
        if (status === "realizada") {
            if (!data.hitos) data.hitos = {};
            if (act.hitoRelacionado) {
                data.hitos[act.hitoRelacionado] = {
                    ultimoIndice: act.indiceEnHito || 0,
                    cicloActual: act.cicloActual || 1,
                    ultimaFecha: hoy
                };
            }
        }

        await fb_setDoc(fb_doc(_db, "progreso_peque", docId), data);

        let msg = "Entendido, la guardamos para después.";
        if (status === "realizada") msg = "¡Genial! Actividad lograda 🌟";
        if (status === "pendiente") msg = "Actividad devuelta a estado pendiente.";
        mostrarToast(msg);

        cerrarDetalleActividad();
        // renderActividadesDelDia() se llamará automáticamente vía onSnapshot
    } catch (e) {
        console.error("Error al marcar actividad:", e);
        mostrarToast("Error al guardar el estado.");
    }
}


function renderDaySelector() {
    const container = document.getElementById("est-day-selector");
    if (!container) return;
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hoy = new Date();
    const hoyISO = _obtenerFechaLocalISO(hoy);
    container.innerHTML = "";
    for (let i = -2; i <= 4; i++) {
        const d = new Date(); d.setDate(hoy.getDate() + i);
        const iso = _obtenerFechaLocalISO(d);
        const active = iso === _fechaSeleccionadaEst ? 'active' : '';
        const isToday = iso === hoyISO ? 'is-today' : '';

        const item = document.createElement("div");
        item.className = `day-btn ${active} ${isToday}`;
        item.innerHTML = `<span class="d-name">${dias[d.getDay()]}</span><span class="d-num">${d.getDate()}</span>`;
        item.onclick = () => {
            _fechaSeleccionadaEst = iso;
            renderDaySelector();
            renderActividadesDelDia();
        };
        container.appendChild(item);
    }
}

function mostrarCargandoEstimulacion(s) {
    const l = document.getElementById("est-loader");
    if (l) l.style.display = s ? 'flex' : 'none';
}

function cerrarEvaluacion() { document.getElementById("modalEvaluacionEst").classList.remove("active"); }


function calcularAvanceTeorico() {
    if (!respuestasHitos || Object.keys(respuestasHitos).length === 0) {
        nivelesTeoricos = {};
        return null;
    }

    // 1. Contar realizaciones por actividad (firebaseId)
    const conteoActividades = {};
    if (_dataProgresoPeque.seguimiento_diario) {
        Object.values(_dataProgresoPeque.seguimiento_diario).forEach(dia => {
            Object.keys(dia).forEach(id => {
                if (dia[id] && dia[id].startsWith("realizada")) {
                    conteoActividades[id] = (conteoActividades[id] || 0) + 1;
                }
            });
        });
    }

    // 2. Mapear actividades a hitos para ver el avance real por cada objetivo
    const puntosHito = {}; // hitoTexto -> { unicas: Set, total: 0 }
    CATALOGO_ACTIVIDADES.forEach(act => {
        const count = conteoActividades[act.firebaseId] || 0;
        if (count > 0) {
            if (!puntosHito[act.hitoTitulo]) puntosHito[act.hitoTitulo] = { unicas: new Set(), total: 0 };
            puntosHito[act.hitoTitulo].unicas.add(act.firebaseId);
            puntosHito[act.hitoTitulo].total += count;
        }
    });

    // 3. Calcular nuevos puntajes teóricos por hito
    const respuestasTeoricas = { ...respuestasHitos };
    const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
    const etapaId = activeEtapaId || obtenerEtapaId(calcularMeses(nacimiento));
    const etapa = CATALOGO_HITOS[etapaId] || CATALOGO_HITOS["0-3m"];

    Object.keys(etapa.areas).forEach(areaId => {
        etapa.areas[areaId].hitos.forEach(h => {
            const stats = puntosHito[h.texto];
            if (stats) {
                const nUnicas = stats.unicas.size;
                const nTotal = stats.total;
                // Lógica de avance realista: 
                // - Cada actividad distinta realizada suma 0.8 puntos (máximo impacto por variedad)
                // - Cada repetición suma 0.2 puntos (mínimo impacto por repetición)
                const ganancia = (nUnicas * 0.8) + ((nTotal - nUnicas) * 0.2);
                const inicial = respuestasHitos[h.id] || 1; // 1 es el mínimo (rojo)
                respuestasTeoricas[h.id] = Math.min(10, inicial + ganancia);
            }
        });
    });

    // 4. Promediar por subáreas (nivelesTeoricos)
    const niveles = {};
    Object.keys(etapa.areas).forEach(areaId => {
        const area = etapa.areas[areaId];
        let suma = 0;
        let cont = 0;
        area.hitos.forEach(h => {
            suma += respuestasTeoricas[h.id] || 1;
            cont++;
        });
        niveles[areaId] = cont > 0 ? parseFloat((suma / cont).toFixed(2)) : 1;
    });

    nivelesTeoricos = niveles;
    return niveles;
}

function verificarAlertaCambioEtapa() {
    const nacimiento = document.getElementById("dropdown-peque").dataset.nacimiento;
    if (!nacimiento || SESION.cliente) return; // Solo Nannies pueden ver la alerta

    const meses = calcularMeses(nacimiento);
    const etapaId = obtenerEtapaId(meses);
    
    const limites = {
        "0-3m": 3, "4-6m": 6, "7-9m": 9, "10-12m": 12,
        "13-18m": 18, "19-24m": 24, "25-36m": 36, "3-4a": 48, "4-5a": 60
    };
    
    const maxMeses = limites[etapaId] || 3;
    const alertaContainer = document.getElementById("alerta-cambio-etapa");
    
    const isTrans = esMesDeTransicion(meses, etapaId);
    const nextEtapaId = isTrans ? obtenerSiguienteEtapa(etapaId) : null;
    const historial = window._activePequeData?.historial_evaluaciones || {};
    const hasNextEval = nextEtapaId && historial[nextEtapaId];

    if (meses >= maxMeses && !nivelesFinales && !hasNextEval) {
        if (alertaContainer) {
            alertaContainer.style.display = "block";
            alertaContainer.innerHTML = `
                <div class="est-alert-modern" style="background:linear-gradient(135deg, #FF9966, #FF5E62); color:white; padding:15px 20px; border-radius:18px; margin-bottom:20px; display:flex; align-items:center; gap:15px; box-shadow: 0 8px 20px rgba(255, 94, 98, 0.2);">
                    <span class="material-symbols-outlined" style="font-size:32px;">priority_high</span>
                    <div style="flex:1;">
                        <h4 style="margin:0; font-size:14px; font-weight:800;">¡Cambio de etapa detectado!</h4>
                        <p style="margin:2px 0 0 0; font-size:12px; opacity:0.9;">${currentPequeId} está por cumplir ${maxMeses} meses. Es necesario realizar la evaluación de cierre.</p>
                    </div>
                    <button onclick="abrirEvaluacionInicial(false, null, true)" style="background:white; color:#FF5E62; border:none; padding:8px 15px; border-radius:10px; font-weight:800; font-size:12px; cursor:pointer;">Evaluar 🚀</button>
                </div>
            `;
        }
    } else {
        if (alertaContainer) alertaContainer.style.display = "none";
    }
}

window.initEstimulacion = initEstimulacion;
window.selectPequeEstimulacion = selectPequeEstimulacion;
window.guardarEvaluacionInicial = guardarEvaluacionInicial;
window.cerrarEvaluacion = cerrarEvaluacion;
window.verResultadosEvaluacion = verResultadosEvaluacion;
window.toggleEstDropdown = toggleEstDropdown;
window.cambioClienteEstimulacion = cambioClienteEstimulacion;
window.abrirDetalleActividad = abrirDetalleActividad;
window.cerrarDetalleActividad = cerrarDetalleActividad;
window.marcarEstadoActividad = marcarEstadoActividad;
window.abrirEvaluacionInicial = abrirEvaluacionInicial;
window.selectHitoScore = selectHitoScore;
window.verOEditarEvaluacion = verOEditarEvaluacion;
window.renderEvaluationButtons = renderEvaluationButtons;
window.cambiarEtapaVista = cambiarEtapaVista;
window.actualizarEtapaVista = actualizarEtapaVista;
