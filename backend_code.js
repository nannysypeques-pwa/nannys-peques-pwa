
/**
 * PUNTO DE ENTRADA PRINCIPAL (API)
 * Recibe todas las peticiones POST desde el frontend.
 * Maneja:
 * 1. Parseo del body
 * 2. Sanitización de datos
 * 3. Verificación de integridad (API Key)
 * 4. Validación de sesión (Token)
 * 5. Router de acciones (switch)
 */
function doPost(e) {
    try {
        let action = '';
        let payload = {};

        // 1ï¸ƒ£ LEER BODY
        if (e && e.postData && e.postData.contents) {
            const type = String(e.postData.type || '').toLowerCase();
            if (type.includes('application/json')) {
                const body = JSON.parse(e.postData.contents || '{}');
                action = String(body.action || '').trim();
                payload = body.payload || {};
            } else {
                action = String(e.parameter?.action || '').trim();
                // Soportar payload como string JSON o como objeto directo si viniera flat
                payload = e.parameter?.payload ? JSON.parse(e.parameter.payload) : {};
            }
        }

        if (!action) throw new Error('Falta action');

        // --- MÁXIMA SEGURIDAD: FILTRO SANITIZADOR GLOBAL ---
        payload = _sanitizePayload(payload);

        // --- INTEGRIDAD DE API (SHIELD) ---
        if (String(payload.integrity_key || '').trim() !== API_INTEGRITY_KEY) {
            _auditLog('SYSTEM', 'INTEGRITY_VIOLATION', { action, detail: 'Shared secret mismatch' });
            _enviarAlertaSeguridad('🚨 VIOLACIÓN DE INTEGRIDAD API', `Se detectó un intento de acceso externo.\nAcción: ${action}\nPayload: ${JSON.stringify(payload)}`);
            throw new Error('Petición no permitida (Integridad)');
        }

        // --- SEGURIDAD: TOKEN DE SESIÓN ---
        // Email del ejecutor. YA NO SE CONFÍA EN payload.email para acciones protegidas.
        let email = '';

        const accionesPublicas = ['login', 'solicitarOTP', 'establecerContrasena', 'validarRegistroCliente', 'solicitarOTPRegistro', 'confirmarRegistroCliente'];

        if (accionesPublicas.includes(action)) {
            email = String(payload.email || '').trim().toLowerCase();
        } else {
            // Validar Token OBLIGATORIAMENTE
            const token = String(payload.token || '').trim();
            const currentFingerprint = String(payload.fingerprint || '').trim();

            if (token) {
                email = _validarToken(token, currentFingerprint); // Retorna email o null
                if (!email) throw new Error('Tu sesión ha expirado o el dispositivo no coincide. Inicia sesión nuevamente.');
            } else {
                // Si no hay token, rechazamos la petición por seguridad
                throw new Error('No autorizado. Falta token de sesión.');
            }
        }

        let result;

        switch (action) {
            // --- AUTH ---
            case 'login':
                result = login(email, payload.contrasena || payload.pass, payload.rol, payload.fingerprint);
                break;
            case 'solicitarOTP':
                result = solicitarOTP(email);
                break;
            case 'establecerContrasena':
                result = establecerContrasena(email, payload.otp, payload.nueva);
                break;
            case 'logout':
                result = _doLogout(payload.token);
                break;
            case 'getProfile':
                result = obtenerPerfilCompleto(email);
                break;
            case 'updatePerfilCliente':
                _enforceRole(email, 'cliente');
                result = updatePerfilCliente(email, payload);
                break;
            case 'updatePerfilNinera':
                _enforceRole(email, 'ninera');
                result = updatePerfilNinera(email, payload);
                break;
            case 'validarRegistroCliente':
                result = validarRegistroCliente(email);
                break;
            case 'solicitarOTPRegistro':
                result = solicitarOTPRegistro(email);
                break;
            case 'confirmarRegistroCliente':
                result = confirmarRegistroCliente(email, payload.otp, payload.password, payload.fingerprint);
                break;

            // --- SERVICIOS NIÑERA ---
            case 'getServiciosNinera':
                _enforceRole(email, 'ninera');
                result = obtenerServiciosProximosPorNombre(email, payload.dias || 14, payload.fecha_inicio);
                break;
            case 'confirmarServicioPorFila':
                _enforceRole(email, 'ninera');
                result = confirmarServicioPorFila(payload.sheet, payload.row_base, email);
                break;
            case 'registrarInicioServicio':
                _enforceRole(email, 'ninera');
                result = registrarInicioServicio(payload.sheet, payload.row_base, payload.fecha, email);
                break;
            case 'registrarFinServicio':
                _enforceRole(email, 'ninera');
                result = registrarFinServicio(payload.sheet, payload.row_base, payload.fecha, email);
                break;
            case 'getServiciosCliente':
                _enforceRole(email, 'cliente');
                result = getServiciosCliente(email, payload.fecha_inicio);
                break;

            // --- DISPONIBILIDAD ---
            case 'obtenerDisponibilidad':
                _enforceRole(email, 'ninera');
                result = obtenerDisponibilidad(email, payload.fechaISO);
                break;
            case 'guardarDisponibilidad':
                _enforceRole(email, 'ninera');
                result = guardarDisponibilidad(email, payload);
                break;
            case 'obtenerDisponiblesSemana':
                _enforceRole(email, 'ninera');
                result = obtenerDisponiblesSemana(email, payload.baseISO);
                break;

            // --- PLANEACIONES (NEURONANNY) ---
            case 'getResumenPlaneacionesSemana':
                result = obtenerResumenPlaneacionesSemana(payload.fechaBase, email, payload.tipo);
                break;
            case 'obtenerPlaneacionNeuronanny':
                result = obtenerPlaneacionNeuronanny(payload, email);
                break;
            case 'guardarPlaneacionNeuronanny':
                _enforceRole(email, 'ninera');
                result = guardarPlaneacionNeuronanny(payload, email);
                break;
            case 'editarPlaneacionNeuronanny':
                _enforceRole(email, 'ninera');
                result = editarPlaneacionNeuronanny(payload, email);
                break;
            case 'reenviarPlaneacionCorregida':
                _enforceRole(email, 'ninera');
                result = reenviarPlaneacionCorregida(payload, email);
                break;
            case 'obtenerResumenPlaneacionesNinera':
                _enforceRole(email, 'ninera');
                result = obtenerResumenPlaneacionesNinera(email);
                break;

            // --- SUPERVISIÓN ---
            case 'guardarObservacionesSupervision':
                _enforceRole(email, 'supervision');
                result = guardarObservacionesSupervision(payload, email);
                break;

            // --- ADMIN ---
            case 'obtenerResumenDisponibilidadSemanaActual':
                _enforceRole(email, 'admin');
                result = obtenerResumenDisponibilidadSemanaActual();
                break;
            case 'apiSugerirNinerasServicio':
                _enforceRole(email, 'admin');
                result = apiSugerirNinerasServicio(payload, email);
                break;
            case 'obtenerServiciosAdminRango':
                _enforceRole(email, 'admin');
                result = obtenerServiciosAdminRango(payload.desde, payload.hasta);
                break;
            case 'obtenerListaNineras':
                _enforceRole(email, 'admin');
                result = obtenerListaNineras();
                break;

            // --- PUNTOS ---
            case 'obtenerPuntajePorNombre':
                _enforceRole(email, 'ninera');
                result = obtenerPuntajePorNombre(payload.nombre || email);
                break;
            case 'registrarPuntosManual':
                _enforceRole(email, 'admin');
                result = registrarPuntosManual(payload.nombre, payload.tipo);
                break;

            // --- PRIVACIDAD ---
            case 'eliminarCuenta':
                result = eliminarCuenta(email);
                break;

            case 'getActividadesClientePlanificadas':
                _enforceRole(email, 'cliente');
                result = getActividadesClientePlanificadas(email);
                break;

            default:
                throw new Error('Acción no soportada: ' + action);
        }

        return ContentService.createTextOutput(JSON.stringify({ ok: true, data: result }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}





function doOptions(e) {
    return ContentService
        .createTextOutput('')
        .setMimeType(ContentService.MimeType.JSON);
}





/** =========================
 *  CONFIGURACIÓN Y CONSTANTES GLOBALRES
 *  Nombres de hojas, correos de admin y claves de seguridad.
 *  ========================= */

/** 
 * NOMBRES DE LAS HOJAS (DATABASE)
 * Definición de los nombres de las pestañas en Google Sheets.
 */
const NOMBRE_HOJA_USUARIOS = 'Usuarios';
const NOMBRE_HOJA_CLIENTES = 'Clientes';
const NOMBRE_HOJA_DISPONIBILIDAD = 'Disponibilidad';
// SECURITY SECRETS (Recuperados de la Bóveda de Google)
const props = PropertiesService.getScriptProperties();
const API_INTEGRITY_KEY = props.getProperty('API_INTEGRITY_KEY') || 'PENDING_SETUP';
const GLOBAL_SALT = props.getProperty('GLOBAL_SALT') || 'PENDING_SETUP';

const ADMIN_EMAILS = ['nannysypeques@gmail.com', 'gerardo.pineda.m94@gmail.com'];
const NOMBRE_HOJA_SERVICIOS = 'Servicios';
const ZONA_HORARIA = Session.getScriptTimeZone() || 'America/Mexico_City';
const MINUTOS_REENVIO_OTP = 2;

















/** =========================
 *  UTILIDADES
 *  Funciones helper para interactuar con hojas de cálculo,
 *  formatear fechas, hashear contraseñas, etc.
 *  ========================= */
function _ss() { return SpreadsheetApp.getActive(); }
function _hoja(nombre) { const sh = _ss().getSheetByName(nombre); if (!sh) throw new Error('No se encontró³ la hoja: ' + nombre); return sh; }
function _ahoraISO() { return Utilities.formatDate(new Date(), ZONA_HORARIA, "yyyy-MM-dd'T'HH:mm:ss"); }
function _nowHuman() { return Utilities.formatDate(new Date(), ZONA_HORARIA, "yyyy-MM-dd HH:mm:ss"); }
function _sha256(t) { const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, t, Utilities.Charset.UTF_8); return raw.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join(''); }
function _leerComoObjetos(hoja) { const rng = hoja.getDataRange(), vals = rng.getValues(); if (vals.length < 2) return []; const headers = vals[0].map(h => String(h).trim()); return vals.slice(1).map(r => { const o = {}; headers.forEach((h, i) => o[String(h).trim()] = r[i]); return o; }); }
function _escribirObjeto(hoja, fila1, obj) { const headers = hoja.getDataRange().getValues()[0].map(h => String(h).trim()); headers.forEach((h, i) => { if (obj.hasOwnProperty(h)) hoja.getRange(fila1, i + 1).setValue(obj[h]); }); }
function _buscarFilaPorValor(hoja, nombreCol, valor) {
    const vals = hoja.getDataRange().getValues(); if (vals.length < 2) return -1;
    const headers = vals[0].map(h => String(h).trim()); const idx = headers.indexOf(nombreCol);
    if (idx === -1) throw new Error('Columna no existe: ' + nombreCol);
    for (let i = 1; i < vals.length; i++) { if (String(vals[i][idx]).trim().toLowerCase() === String(valor).trim().toLowerCase()) return i + 1; }
    return -1;
}
function _idxCol(hoja, nombreCol) {
    const headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getDisplayValues()[0].map(h => String(h).trim().toLowerCase());
    return headers.indexOf(String(nombreCol).toLowerCase().trim()) + 1;
}
function _esVerdadero(val) { if (typeof val === 'boolean') return val === true; const s = String(val).trim().toLowerCase(); return s === 'true' || s === '1' || s === 'si' || s === 'só­' || s === 'yes' || s === 'y'; }
function _norm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function _toISODate(v) {
    if (v instanceof Date) return Utilities.formatDate(v, ZONA_HORARIA, 'yyyy-MM-dd');
    const s = String(v || '').trim(); if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
    if (m) return `${m[3]}-${('0' + m[2]).slice(-2)}-${('0' + m[1]).slice(-2)}`;
    const d = new Date(s); if (!isNaN(d.getTime())) return Utilities.formatDate(d, ZONA_HORARIA, 'yyyy-MM-dd');
    return '';
}
function _toHM(v) {
    if (v instanceof Date) return Utilities.formatDate(v, ZONA_HORARIA, 'HH:mm');
    let s = String(v || '').trim(); if (!s) return '';
    if (/^\d{1,2}$/.test(s)) return ('0' + s).slice(-2) + ':00';
    const m = s.match(/^(\d{1,2})[:.](\d{1,2})$/);
    if (m) return ('0' + m[1]).slice(-2) + ':' + ('0' + m[2]).slice(-2);
    return s;
}
function _nombrePorEmail(email) { const sh = _hoja(NOMBRE_HOJA_USUARIOS); const fila = _buscarFilaPorValor(sh, 'email', email); if (fila === -1) return ''; return String(sh.getRange(fila, 2).getValue() || '').trim(); }

/**
 * Construye notas detalladas desde los datos del cliente
 * Incluye informació³n de hasta 3 peques y mascotas
 */
function _construirNotasDesdeCliente(clienteData) {
    const partes = [];

    // Peque 1
    const nombre1 = String(clienteData.nombre_del_peque || '').trim();
    if (nombre1) {
        partes.push(`👶 ${nombre1}`);

        // Preferir edad calculada, fallback a nacimiento
        const edad1 = String(clienteData.edad_del_peque || clienteData.fecha_de_nacimiento || '').trim();
        if (edad1) partes.push(`• Edad: ${edad1}`);

        const alergias1 = String(clienteData.alergias || '').trim();
        if (alergias1) partes.push(`• Alergias: ${alergias1}`);

        const condicion1 = String(clienteData.condicion_medica_o_especificaciones_adicionales || '').trim();
        if (condicion1) partes.push(`• Condición médica: ${condicion1}`);

        const salud1 = String(clienteData.estado_de_salud_actual || '').trim();
        if (salud1) partes.push(`• Estado de salud: ${salud1}`);

        const pref1 = String(clienteData.preferencias_o_actividades_favoritas || '').trim();
        if (pref1) partes.push(`• Preferencias: ${pref1}`);

        // Mascotas al final del primer peque
        const mascotas = String(clienteData.no_de_mascotas || '').trim();
        if (mascotas && mascotas !== '0' && mascotas.toLowerCase() !== 'no') {
            partes.push(`🐾 Mascotas: ${mascotas}`);
        }
    }

    // Peque 2
    const nombre2 = String(clienteData.nombre_del_peque_2 || '').trim();
    if (nombre2) {
        partes.push(''); // Separador
        partes.push(`👶 ${nombre2}`);

        const edad2 = String(clienteData.edad_del_peque_2 || clienteData.fecha_de_nacimiento_2 || '').trim();
        if (edad2) partes.push(`• Edad: ${edad2}`);

        const alergias2 = String(clienteData.alergias_2 || '').trim();
        if (alergias2) partes.push(`• Alergias: ${alergias2}`);

        const condicion2 = String(clienteData.condicion_medica_o_especificaciones_adicionales_2 || '').trim();
        if (condicion2) partes.push(`• Condición médica: ${condicion2}`);

        const salud2 = String(clienteData.estado_de_salud_actual_2 || '').trim();
        if (salud2) partes.push(`• Estado de salud: ${salud2}`);

        const pref2 = String(clienteData.preferencias_o_actividades_favoritas_2 || '').trim();
        if (pref2) partes.push(`• Preferencias: ${pref2}`);
    }

    // Peque 3
    const nombre3 = String(clienteData.nombre_del_peque_3 || '').trim();
    if (nombre3) {
        partes.push(''); // Separador
        partes.push(`👶 ${nombre3}`);

        const edad3 = String(clienteData.edad_del_peque_3 || clienteData.fecha_de_nacimiento_3 || '').trim();
        if (edad3) partes.push(`• Edad: ${edad3}`);

        const alergias3 = String(clienteData.alergias_3 || '').trim();
        if (alergias3) partes.push(`• Alergias: ${alergias3}`);

        const condicion3 = String(clienteData.condicion_medica_o_especificaciones_adicionales_3 || '').trim();
        if (condicion3) partes.push(`• Condición médica: ${condicion3}`);

        const salud3 = String(clienteData.estado_de_salud_actual_3 || '').trim();
        if (salud3) partes.push(`• Estado de salud: ${salud3}`);

        const pref3 = String(clienteData.preferencias_o_actividades_favoritas_3 || '').trim();
        if (pref3) partes.push(`• Preferencias: ${pref3}`);
    }

    return partes.length > 0 ? partes.join('\n') : '';
}




















function _leerServiciosDesdeHojas_(nombres) {
    const out = [];
    nombres.forEach(nombreHoja => {
        try {
            const sh = _hoja(nombreHoja);
            const lista = _expandirServiciosSemanales_(sh);
            lista.forEach(s => {
                s._origen_hoja = nombreHoja; // solo informativo, no visual
                out.push(s);
            });
        } catch (e) {
            // Si la hoja no existe o Está vacó­a, NO rompemos nada
        }
    });
    return out;
}




















function _mapaColumnasPorFecha_(sh) {
    const headersFecha = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const headersSub = sh.getRange(2, 1, 1, sh.getLastColumn()).getValues()[0];




    const mapa = {};
    let fechaActualISO = null;
















    for (let col = 0; col < headersFecha.length; col++) {
        const val = headersFecha[col];








        // Si la celda tiene fecha, la guardamos como fecha activa
        if (val instanceof Date) {
            fechaActualISO = _toISODate(val);
            if (!mapa[fechaActualISO]) mapa[fechaActualISO] = {};
        }








        if (!fechaActualISO) continue;




        const sub = (headersSub[col] || '').toString().toLowerCase().trim();




        if (sub.includes('hora de inicio')) mapa[fechaActualISO].hora_inicio = col + 1;
        if (sub.includes('hora de fin')) mapa[fechaActualISO].hora_fin = col + 1;
        if (sub.includes('estado')) mapa[fechaActualISO].estado = col + 1;
        if (sub.includes('confirm')) mapa[fechaActualISO].confirmado_en = col + 1;
        if (sub.includes('inicio real')) mapa[fechaActualISO].inicio_real = col + 1;
        if (sub.includes('fin real')) mapa[fechaActualISO].fin_real = col + 1;
    }








    return mapa;
}














/** =========================
 *  SEGURIDAD (TOKENS)
 *  Generación y validación de tokens de sesión con
 *  protección contra robo de sesión (fingerprinting).
 *  ========================= */
function _generarToken(email, fingerprint) {
    if (!email) return null;
    const token = Utilities.getUuid();
    const data = JSON.stringify({ email: String(email), f: String(fingerprint || '') });
    // Guardar en caché por 6 horas (21600 seg)
    CacheService.getScriptCache().put(token, data, 21600);
    return token;
}

function _validarToken(token, currentFingerprint) {
    if (!token) return null;
    const stored = CacheService.getScriptCache().get(token);
    if (!stored) return null;

    try {
        const obj = JSON.parse(stored);
        // Validar vínculo de dispositivo (Session Binding)
        if (obj.f && currentFingerprint && obj.f !== currentFingerprint) {
            _auditLog(obj.email, 'SESSION_HIJACK_ATTEMPT', { t: token, f1: obj.f, f2: currentFingerprint });
            _enviarAlertaSeguridad('🚨 ALERTA: POSIBLE ROBO DE SESIÓN', `Se bloqueó un intento de usar una sesión activa en un dispositivo diferente.\nUsuario: ${obj.email}\nToken: ${token}`);
            return null; // Huella no coincide
        }
        return obj.email;
    } catch (e) {
        // Fallback para tokens viejos (solo email)
        return stored;
    }
}



/** =========================
 *  AUTORIZACIÓN / ROLES / OTP / LOGIN
 *  Funciones para verificar permisos, registro, login
 *  y recuperación de contraseñas.
 *  ========================= */
function _estaAutorizado(email) {
    email = String(email || '').trim().toLowerCase();

    // 1. Revisar si Está en hoja Usuarios y activo
    const shU = _hoja(NOMBRE_HOJA_USUARIOS);
    const filaU = _buscarFilaPorValor(shU, 'email', email);
    if (filaU !== -1) {
        const idxActivo = _idxCol(shU, 'activo');
        if (idxActivo > 0) {
            const val = shU.getRange(filaU, idxActivo).getValue();
            if (_esVerdadero(val)) return true;
        }
    }

    // 2. Revisar si es Cliente (existente o con servicios)
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const filaC = _buscarFilaPorValor(shC, 'email', email);
    if (filaC !== -1) return true;

    const shS = _hoja(NOMBRE_HOJA_SERVICIOS);
    const filaS = _buscarFilaPorValor(shS, 'email', email);
    if (filaS !== -1) return true;

    // 3. Permitir autorizar nuevos registros de clientes (la ló³gica de registro manejaró¡ la creació³n)
    // Para que el login no falle antes de dar clic en registrar, permitimos pasar esta fase
    // si el backend lo permite dinó¡micamente.
    return true;
}

function esCliente(email) {
    email = String(email || '').trim().toLowerCase();
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const filaC = _buscarFilaPorValor(shC, 'email', email);
    return filaC !== -1;
}
function esAdmin(email) {
    email = String(email || '').trim().toLowerCase();
    const sh = _hoja(NOMBRE_HOJA_USUARIOS); const fila = _buscarFilaPorValor(sh, 'email', email);
    if (fila === -1) return false;
    const idxRol = _idxCol(sh, 'rol');
    const idxEA = _idxCol(sh, 'es_admin');
    if (idxRol > 0) {
        const rol = String(sh.getRange(fila, idxRol).getValue() || '').toLowerCase().trim();
        if (rol === 'admin') return true;
    }
    if (idxEA > 0) {
        return _esVerdadero(sh.getRange(fila, idxEA).getValue());
    }
    return false;
}




function esSupervision(email) {
    email = String(email || '').trim().toLowerCase();
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const fila = _buscarFilaPorValor(sh, 'email', email);
    if (fila === -1) return false;




    const idxRol = _idxCol(sh, 'rol');
    if (idxRol <= 0) return false;




    const rol = String(sh.getRange(fila, idxRol).getValue() || '')
        .normalize('NFD')                 // elimina acentos
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();




    return rol === 'supervision';
}












function _enVentanaDeBloqueo(email) {
    const props = PropertiesService.getScriptProperties(); const last = Number(props.getProperty('otp_last_' + email) || '0'); const now = Date.now();
    return (!isNaN(last) && (now - last) < MINUTOS_REENVIO_OTP * 60 * 1000);
}
function _marcarEnvioOTP(email) { PropertiesService.getScriptProperties().setProperty('otp_last_' + email, String(Date.now())); }
function _verificarCuotaOTP() { const r = MailApp.getRemainingDailyQuota(); if (r <= 0) throw new Error('Se alcanzó³ el ló­mite diario de envó­os. Intente maó±ana.'); return r; }












function solicitarOTP(email) {
    email = String(email || '').trim().toLowerCase();
    if (!email) throw new Error('Email requerido');
    if (!_estaAutorizado(email)) throw new Error('Su correo no Está autorizado. Contacte a la administració³n.');
    const lock = LockService.getScriptLock(); if (!lock.tryLock(5000)) throw new Error('Sistema ocupado. Intente de nuevo en unos segundos.');
    try {
        if (_enVentanaDeBloqueo(email)) throw new Error('Ya se envió³ un có³digo hace poco. Espere unos minutos para solicitar otro.');
        _verificarCuotaOTP();
        const sh = _hoja(NOMBRE_HOJA_USUARIOS); const fila = _buscarFilaPorValor(sh, 'email', email); if (fila === -1) throw new Error('Su correo no Está autorizado. Contacte a la administració³n.');
        const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
        const expira = new Date(Date.now() + 15 * 60 * 1000);
        const expiraStr = Utilities.formatDate(expira, ZONA_HORARIA, "yyyy-MM-dd HH:mm:ss");
        const obj = { email: sh.getRange(fila, 1).getValue(), nombre: sh.getRange(fila, 2).getValue(), pass_hash: sh.getRange(fila, 3).getValue(), otp, otp_expira: expiraStr, creado: sh.getRange(fila, 6).getValue() || _ahoraISO(), actualizado: _ahoraISO(), activo: sh.getRange(fila, 8).getValue() };
        _escribirObjeto(sh, fila, obj);
        _marcarEnvioOTP(email);
        MailApp.sendEmail({ to: email, subject: 'Có³digo de verificació³n (Nannys y Peques)', htmlBody: '<p>Su có³digo de verificació³n es: <b>' + otp + '</b><br>Vence en 15 minutos.</p>' });
        return { ok: true, restante: MailApp.getRemainingDailyQuota() };
    } finally { lock.releaseLock(); }
}












function establecerContrasena(email, otp, nuevaContrasena) {
    email = String(email || '').trim().toLowerCase();
    otp = String(otp || '').trim();
    if (!email || !otp || !nuevaContrasena) throw new Error('Datos incompletos');

    // 1. Buscar en Usuarios
    const shU = _hoja(NOMBRE_HOJA_USUARIOS);
    const filaU = _buscarFilaPorValor(shU, 'email', email);
    if (filaU !== -1) {
        const otpGuard = String(shU.getRange(filaU, 4).getValue()).trim();
        const expStr = shU.getRange(filaU, 5).getValue();
        const expDate = new Date(expStr);
        if (otp !== otpGuard) throw new Error('Código incorrecto');
        if (!(expDate instanceof Date) || isNaN(expDate.getTime()) || new Date() > expDate) throw new Error('Código vencido');
        const passHash = _sha256(nuevaContrasena);
        shU.getRange(filaU, 3).setValue(passHash);
        shU.getRange(filaU, 4).setValue('');
        shU.getRange(filaU, 5).setValue('');
        shU.getRange(filaU, 7).setValue(_ahoraISO());
        return { ok: true };
    }

    // 2. Buscar en Clientes (Registro espontáneo)
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const filaC = _buscarFilaPorValor(shC, 'email', email);
    if (filaC === -1) {
        // Permitimos el registro espontáneo de cualquier usuario como cliente
        // Crear fila nueva
        const headers = shC.getRange(1, 1, 1, shC.getLastColumn()).getValues()[0];
        const newRow = new Array(headers.length).fill('');
        const idxEmail = _idxCol(shC, 'email');
        const idxPass = _idxCol(shC, 'pass_hash');
        const idxOTP = _idxCol(shC, 'otp');
        const idxCreado = _idxCol(shC, 'creado');
        const idxActivo = _idxCol(shC, 'activo');

        newRow[idxEmail - 1] = email;
        newRow[idxPass - 1] = _sha256(nuevaContrasena);
        newRow[idxCreado - 1] = _ahoraISO();
        newRow[idxActivo - 1] = true;
        shC.appendRow(newRow);
        return { ok: true };
    } else {
        // Ya existe en Clientes, validar OTP si lo pidió
        const idxOTP = _idxCol(shC, 'otp');
        const idxExp = _idxCol(shC, 'otp_expira');
        const otpGuard = String(shC.getRange(filaC, idxOTP).getValue()).trim();
        const expDate = new Date(shC.getRange(filaC, idxExp).getValue());
        if (otp !== otpGuard) throw new Error('Código incorrecto');
        if (new Date() > expDate) throw new Error('Código vencido');

        const idxPass = _idxCol(shC, 'pass_hash');
        shC.getRange(filaC, idxPass).setValue(_sha256(nuevaContrasena));
        shC.getRange(filaC, idxOTP).setValue('');
        shC.getRange(filaC, idxExp).setValue('');
        return { ok: true };
    }
}














/**
 * AUTENTICACIÓN: Valida credenciales de Staff o Clientes.
 * Compara contraseñas usando el hash guardado y genera tokens de sesión.
 */
function login(email, contrasena, rol, fingerprint) {
    email = String(email || '').trim().toLowerCase();
    contrasena = String(contrasena || '');

    if (!email || !contrasena) throw new Error('Faltan credenciales');

    const shU = _hoja(NOMBRE_HOJA_USUARIOS);
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);

    let filaU = -1;
    let filaC = -1;

    // 1. Usuarios (Staff)
    if (rol === 'staff' || !rol) {
        filaU = _buscarFilaPorValor(shU, 'email', email);
    }

    // 2. Familia (Clientes)
    if (filaU === -1 && (rol === 'cliente' || !rol)) {
        filaC = _buscarFilaPorValor(shC, 'email', email);
    }

    if (filaU === -1 && filaC === -1) {
        throw new Error('Credenciales inválidas');
    }

    // ----------------------------------------------------
    // LOGIN STAFF / ADMIN
    // ----------------------------------------------------
    if (filaU !== -1) {
        const hashGuardado = String(shU.getRange(filaU, 3).getValue()).trim();
        if (!hashGuardado) throw new Error('Usuario sin contraseña. Contacte soporte.');

        _verificarRateLimitLogin(email);

        const saltedTry = _sha256Salted(contrasena);
        let passwordOk = (saltedTry === hashGuardado);
        let migrationNeeded = false;

        if (!passwordOk) {
            const legacyTry = _sha256(contrasena);
            if (legacyTry === hashGuardado) {
                passwordOk = true;
                migrationNeeded = true;
            }
        }

        if (!passwordOk) {
            _registrarIntentoFallidoLogin(email);
            _auditLog(email, 'LOGIN_FAILED', { reason: 'Password mismatch', rol: 'staff' });
            throw new Error('Credenciales inválidas');
        }

        if (migrationNeeded) {
            shU.getRange(filaU, 3).setValue(saltedTry);
            _auditLog(email, 'SECURITY_UPGRADE', { type: 'Hash Upgrade', rol: 'staff' });
        }

        _limpiarIntentosLogin(email);
        _auditLog(email, 'LOGIN_SUCCESS', { rol: 'staff' });

        const token = _generarToken(email, fingerprint);

        return {
            ok: true,
            token: token,
            email: email,
            nombre: shU.getRange(filaU, 2).getValue() || '',
            admin: esAdmin(email),
            supervision: esSupervision(email),
            cliente: false
        };
    }

    // ----------------------------------------------------
    // LOGIN CLIENTE
    // ----------------------------------------------------
    if (filaC !== -1) {
        const passIdx = _idxCol(shC, 'pass_hash');
        const hashGuardado = String(shC.getRange(filaC, passIdx).getValue()).trim();

        _verificarRateLimitLogin(email);

        const saltedTry = _sha256Salted(contrasena);
        let passwordOk = (saltedTry === hashGuardado);
        let migrationNeeded = false;

        if (!passwordOk) {
            const legacyTry = _sha256(contrasena);
            if (legacyTry === hashGuardado) {
                passwordOk = true;
                migrationNeeded = true;
            }
        }

        if (!passwordOk) {
            _registrarIntentoFallidoLogin(email);
            _auditLog(email, 'LOGIN_FAILED', { reason: 'Password mismatch', rol: 'cliente' });
            throw new Error('Credenciales inválidas');
        }

        if (migrationNeeded) {
            shC.getRange(filaC, passIdx).setValue(saltedTry);
            _auditLog(email, 'SECURITY_UPGRADE', { type: 'Hash Upgrade', rol: 'cliente' });
        }

        _limpiarIntentosLogin(email);
        _auditLog(email, 'LOGIN_SUCCESS', { rol: 'cliente' });

        const nameIdx = _idxCol(shC, 'nombre completo');
        const token = _generarToken(email, fingerprint);

        return {
            ok: true,
            token: token,
            email: email,
            nombre: shC.getRange(filaC, nameIdx).getValue() || '',
            admin: false,
            supervision: false,
            cliente: true
        };
    }
}














/** =========================
 *  DISPONIBILIDAD POR TURNOS (Matutino/Vespertino)
 *  Lógica core para manejar los horarios de las niñeras.
 *  Permite definir turnos y asegurar la estructura de la hoja.
 *  ========================= */
const TURNOS = [
    { key: 'Matutino', ini: '07:00', fin: '15:00' },
    { key: 'Vespertino', ini: '15:00', fin: '22:00' }
];








function _asegurarEstructuraTurnos(sh) {
    // Crea encabezados: nombre de nió±era | fecha | dó­a | Matutino | Vespertino
    if (sh.getLastRow() === 0 || sh.getLastColumn() < 3) {
        sh.clear();
        sh.getRange(1, 1, 1, 5).setValues([['nombre de nió±era', 'fecha', 'dó­a', 'Matutino', 'Vespertino']]);
        return;
    }
    const hdr = sh.getRange(1, 1, 1, Math.max(5, sh.getLastColumn())).getDisplayValues()[0].map(h => String(h).trim());
    const norm = hdr.map(h => _norm(h));
    const need = ['nombre de ninera', 'fecha', 'dia'];
    need.forEach(w => {
        if (norm.indexOf(w) === -1) throw new Error('Encabezado faltante en Disponibilidad: ' + w);
    });
    if (norm.indexOf('matutino') === -1) sh.insertColumnAfter(sh.getLastColumn()), sh.getRange(1, sh.getLastColumn()).setValue('Matutino');
    if (norm.indexOf('vespertino') === -1) sh.insertColumnAfter(sh.getLastColumn()), sh.getRange(1, sh.getLastColumn()).setValue('Vespertino');
}












function _diasDeSemana(baseFechaISO) {
    // Si viene una fecha tipo "2025-12-08", le agregamos hora fija
    // para evitar que al ajustar zona horaria se recorra al dó­a anterior.
    let base;
    if (baseFechaISO) {
        // Forzamos hora media (mediodó­a) para evitar saltos por huso horario
        base = new Date(baseFechaISO + 'T12:00:00');
    } else {
        // Hoy pero €œsin hora€
        const hoy = new Date();
        base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    }












    // Calculamos el lunes de esa semana (Lunes = 1, Domingo = 0)
    let day = base.getDay();            // 0 = dom, 1 = lun, ...
    const diff = (day === 0 ? -6 : 1 - day);
    const lunes = new Date(base);
    lunes.setDate(base.getDate() + diff);
    lunes.setHours(0, 0, 0, 0);












    const out = [];
    const nombres = ['Lunes', 'Martes', 'Mió©rcoles', 'Jueves', 'Viernes', 'Só¡bado', 'Domingo'];








    for (let i = 0; i < 7; i++) {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        out.push({
            fecha: Utilities.formatDate(d, ZONA_HORARIA, 'yyyy-MM-dd'),
            dia: nombres[i]
        });
    }








    return out;
}








function _setPlaneacionesExistentesSemana_(fechasSemana) {
    const sh = _hoja('Planeaciones_Neuronanny');
    const data = sh.getDataRange().getValues();
    if (data.length < 2) return new Set();


    const headers = data[0].map(h => _norm(h));
    const idxFecha = headers.indexOf('fecha');
    const idxCliente = headers.indexOf('cliente');


    if (idxFecha === -1 || idxCliente === -1) {
        throw new Error('Planeaciones_Neuronanny debe tener columnas "fecha" y "cliente".');
    }


    const set = new Set();


    for (let i = 1; i < data.length; i++) {
        const fecha = _toISODate(data[i][idxFecha]);
        if (!fecha) continue;


        // Solo semana actual (Lun€“Dom)
        if (fechasSemana.indexOf(fecha) === -1) continue;


        const cliente = String(data[i][idxCliente] || '').trim();
        if (!cliente) continue;


        // œ… CLAVE NORMALIZADA (acentos, dobles espacios, mayóºsculas)
        set.add(fecha + '|' + _norm(cliente));
    }


    return set;
}












function obtenerDisponibilidad(email, fechaISO) {
    email = String(email || '').trim().toLowerCase(); if (!email) throw new Error('Email requerido');
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');
    const nombreNanny = _nombrePorEmail(email);
    const diasSemana = _diasDeSemana(fechaISO);
    const sh = _hoja(NOMBRE_HOJA_DISPONIBILIDAD);
    _asegurarEstructuraTurnos(sh);








    // Leer mapa: {fecha => {Matutino:true/false, Vespertino:true/false}}
    const vals = sh.getDataRange().getValues();
    const mapa = {};
    for (let i = 1; i < vals.length; i++) {
        const r = vals[i];
        const nom = String(r[0] || '').trim(); const f = _toISODate(r[1]);
        if (_norm(nom) !== _norm(nombreNanny) || !f) continue;
        const mat = _esVerdadero(r[3]); const ves = _esVerdadero(r[4]);
        mapa[f] = { Matutino: mat, Vespertino: ves };
    }








    const dias = diasSemana.map(d => {
        const row = { fecha: d.fecha, dia: d.dia, Matutino: false, Vespertino: false };
        if (mapa[d.fecha]) { row.Matutino = !!mapa[d.fecha].Matutino; row.Vespertino = !!mapa[d.fecha].Vespertino; }
        return row;
    });








    return { horas: ['Matutino', 'Vespertino'], dias };
}




















function guardarDisponibilidad(email, payload) {
    email = String(email || '').trim().toLowerCase(); if (!email) throw new Error('Email requerido');
    if (!_estaAutorizado(email)) throw new Error('No autorizado para guardar disponibilidad.');
    if (!payload || !payload.dias) throw new Error('Datos incompletos');




    const nombreNanny = _nombrePorEmail(email);
    const sh = _hoja(NOMBRE_HOJA_DISPONIBILIDAD);
    _asegurarEstructuraTurnos(sh);








    const fechasSemana = payload.dias.map(d => d.fecha);
    // Eliminar registros actuales del usuario en esa semana
    const vals = sh.getDataRange().getValues();
    const keep = [vals[0]];
    for (let i = 1; i < vals.length; i++) {
        const r = vals[i]; const nom = String(r[0] || '').trim(); const f = _toISODate(r[1]);
        if (!f) continue;
        const sameUser = _norm(nom) === _norm(nombreNanny);
        const inWeek = fechasSemana.includes(f);
        if (!(sameUser && inWeek)) { keep.push(r); }
    }
    sh.clearContents(); sh.getRange(1, 1, keep.length, keep[0].length).setValues(keep);








    // Agregar nuevos
    payload.dias.forEach(d => {
        const mat = !!d.Matutino; const ves = !!d.Vespertino;
        // si ambos false, no escribimos
        if (!mat && !ves) return;
        sh.appendRow([nombreNanny, d.fecha, d.dia, mat, ves]);
    });








    return { ok: true };
}
















function obtenerDisponiblesSemana(email, fechaISO) {
    const sh = _hoja(NOMBRE_HOJA_DISPONIBILIDAD);
    _asegurarEstructuraTurnos(sh);
    const dias = _diasDeSemana(fechaISO).map(d => d.fecha);
    const out = {};
    const vals = sh.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
        const r = vals[i]; const f = _toISODate(r[1]); if (!dias.includes(f)) continue;
        const nom = String(r[0] || '').trim(); const mat = _esVerdadero(r[3]); const ves = _esVerdadero(r[4]);
        const key = (email ? email.toLowerCase() : nom.toLowerCase());
        if (email && _norm(nom) !== _norm(_nombrePorEmail(email))) continue;
        if (!out[key]) out[key] = {};
        if (!out[key][f]) out[key][f] = [];
        if (mat) out[key][f].push('Matutino');
        if (ves) out[key][f].push('Vespertino');
    }
    return out;
}













/** =========================
 *  SERVICIOS por NOMBRE + CONFIRMACIÓN
 *  Lógica complejas para leer y transformar los servicios
 *  desde la estructura vertical/horizontal de las hojas de cálculo
 *  a un formato JSON consumible por la app.
 *  ========================= */
function _ensureColumnsServicios(sh) {
    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0];
    const norm = hdrs.map(h => _norm(h));
    let idxEstado = norm.indexOf('estado'); // 0-based
    let idxConfirm = norm.indexOf('fecha y hora de confirmacion'); // 0-based
    if (idxEstado === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        const col = sh.getLastColumn();
        sh.getRange(1, col).setValue('estado');
        idxEstado = col - 1;
    }
    if (idxConfirm === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        const col2 = sh.getLastColumn();
        sh.getRange(1, col2).setValue('fecha y hora de confirmació³n');
        idxConfirm = col2 - 1;
    }
    return { idxEstado: idxEstado + 1, idxConfirm: idxConfirm + 1 };
}
















function _telefonoPorEmail(email) {
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const fila = _buscarFilaPorValor(sh, 'email', email);
    if (fila === -1) return '';








    // IMPORTANTE: debe coincidir con el encabezado EXACTO "teló©fono"
    const idxTel = _idxCol(sh, 'teló©fono');
    if (idxTel <= 0) return '';








    return String(sh.getRange(fila, idxTel).getValue() || '').trim();
}








function obtenerPerfil(email) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');


    const p = obtenerPerfilCompleto(email); // ya la tienes implementada
    return {
        ok: true,
        email: p.email,
        nombre: p.nombre,
        telefono: p.telefono,
        admin: esAdmin(email),
        supervision: esSupervision(email)
    };
}


























// La implementación completa de obtenerPerfilCompleto está al final del archivo.



function _mapaCiudadPorNinera() {
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const data = sh.getDataRange().getValues();
    const headers = data.shift().map(h => String(h).toLowerCase().trim());


    const idxNombre = headers.indexOf('nombre');
    const idxCiudad = headers.indexOf('ciudad');


    if (idxNombre === -1 || idxCiudad === -1) {
        throw new Error('La hoja Usuarios debe tener columnas "nombre" y "ciudad"');
    }


    const mapa = {};
    data.forEach(row => {
        const nombre = String(row[idxNombre] || '').trim();
        const ciudad = String(row[idxCiudad] || '').trim();
        if (nombre) {
            mapa[nombre.toLowerCase()] = ciudad || 'Sin ciudad';
        }
    });


    return mapa;
}















/**
 * Expande los servicios de una hoja semana
 * Convierte el formato de grilla (Fechas en columnas)
 * a una lista plana de objetos servicio.
 */
function _expandirServiciosSemanales_(sh) {
    const data = sh.getDataRange().getValues();
    if (data.length < 3) return [];




    const fechas = data[0];   // fila 1
    const subhdr = data[1];   // fila 2




    // columnas fijas (cliente, direcció³n, etc.) en fila 1 (no-fechas)
    const colIdx = {};
    fechas.forEach((h, i) => {
        if (h instanceof Date) return;
        const k = _norm(h);
        if (k) colIdx[k] = i;
    });








    // œ… ya no tronar: si falta algo, mejor no devolver servicios
    const required = ['cliente', 'numero de contacto', 'direccion', 'ubicacion (link)', 'nombre de ninera'];
    for (const k of required) {
        if (colIdx[k] === undefined) return [];
    }




    const mapaCols = _mapaColumnasPorFecha_(sh);
    const servicios = [];
















    for (let r = 2; r < data.length; r++) {
        const row = data[r];




        const nombreNinera = String(row[colIdx['nombre de ninera']] || '').trim();
        if (!nombreNinera) continue;




        const cliente = String(row[colIdx['cliente']] || '').trim();
        const emailServicio = colIdx['email'] != null ? String(row[colIdx['email']] || '').trim().toLowerCase() : '';
        const contacto = String(row[colIdx['numero de contacto']] || '').trim();
        const emergencia = colIdx['numero de emergencia'] != null ? String(row[colIdx['numero de emergencia']] || '').trim() : '';
        const direccion = String(row[colIdx['direccion']] || '').trim();
        const ubicacion = String(row[colIdx['ubicacion (link)']] || '').trim();
        const cuota = colIdx['cuota nanny'] != null ? String(row[colIdx['cuota nanny']] || '').trim() : '';
        const edad = colIdx['edad del nino'] != null ? String(row[colIdx['edad del nino']] || '').trim() : '';
        const notas = colIdx['notas'] != null ? String(row[colIdx['notas']] || '').trim() : '';
        const tipoServicio = colIdx['tipo de servicio'] != null
            ? String(row[colIdx['tipo de servicio']] || '').trim().toLowerCase()
            : '';




        const cellVer = colIdx['ver'] != null ? String(row[colIdx['ver']] || '').trim() : '';
        const verServicio = (colIdx['ver'] == null || cellVer === '') ? true : _esVerdadero(cellVer);








        // ðŸ”¥ ahora iteramos por FECHA usando el mapa
        Object.keys(mapaCols).forEach(fechaISO => {
            const m = mapaCols[fechaISO];
            if (!m || !m.hora_inicio || !m.hora_fin) return;




            const hi = _toHM(row[m.hora_inicio - 1]);
            const hf = _toHM(row[m.hora_fin - 1]);
            if (!hi || !hf) return; // si ese dó­a no tiene horas, no hay servicio ese dó­a
            const estado = (m.estado ? String(row[m.estado - 1] || '').trim().toLowerCase() : 'pendiente') || 'pendiente';
            const confirmadoEn = m.confirmado_en ? String(row[m.confirmado_en - 1] || '').trim() : '';
            const inicioReal = m.inicio_real ? String(row[m.inicio_real - 1] || '').trim() : '';
            const finReal = m.fin_real ? String(row[m.fin_real - 1] || '').trim() : '';








            if (!verServicio) return;








            servicios.push({
                sheet: sh.getName(),   // œ… clave para escribir despuó©s
                row_base: r + 1,       // fila real
                fecha: fechaISO,
                hora_inicio: hi,
                hora_fin: hf,
                cliente,
                email: emailServicio,
                numero_contacto: contacto,
                numero_de_emergencia: emergencia,
                direccion,
                ubicacion_link: ubicacion,
                nombre_ninera: nombreNinera,
                cuota_nanny: cuota,
                edad_nino: edad,
                notas,
                estado,
                confirmado_en: confirmadoEn,
                inicio_real: inicioReal,
                fin_real: finReal,
                ver: verServicio,
                tipo_servicio: tipoServicio
            });
        });
    }




    return servicios;
}













/**
 * Busca servicios próximos para una niñera específica
 * Filtrando por su nombre y rango de fechas.
 */
function obtenerServiciosProximosPorNombre(email, diasAdelante, fechaInicio) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');


    const nombreNanny = _nombrePorEmail(email);
    if (!nombreNanny) return [];


    const todos = _leerServiciosDesdeHojas_([
        'Servicios',
        'Servicios_Siguiente_semana'
    ]);


    let hoyISO;
    let hoyDate; // Necesario para calcular limite

    if (fechaInicio && /^\d{4}-\d{2}-\d{2}$/.test(String(fechaInicio))) {
        // Si viene fecha válida (ej "2024-01-27"), USARLA DIRECTAMENTE como string base
        // Esto evita cualquier desplazamiento de zona horaria al convertir string->date->string
        hoyISO = String(fechaInicio);

        // Para calcular el límite (hoy + 14 días), parseamos. 
        // Usamos T12:00:00 para evitar bordes de día, aunque el límite es aproximado.
        const [y, m, d] = hoyISO.split('-').map(Number);
        hoyDate = new Date(y, m - 1, d, 12, 0, 0);
    } else {
        // Default a hoy
        hoyDate = new Date();
        hoyISO = Utilities.formatDate(hoyDate, ZONA_HORARIA, 'yyyy-MM-dd');
    }

    const limite = new Date(hoyDate);
    limite.setDate(hoyDate.getDate() + Number(diasAdelante || 14));
    const limISO = Utilities.formatDate(limite, ZONA_HORARIA, 'yyyy-MM-dd');




    const out = todos.filter(s => {
        // Asegurar comparación estricta de strings YYYY-MM-DD para evitar problemas de timezone
        const fechaServicioISO = _toISODate(s.fecha);
        return _norm(s.nombre_ninera) === _norm(nombreNanny) &&
            fechaServicioISO >= hoyISO &&
            fechaServicioISO <= limISO;
    });

    // Obtener datos de clientes para fallback completo
    const shClientes = _hoja(NOMBRE_HOJA_CLIENTES);
    const dataClientes = shClientes.getDataRange().getValues();
    const headersC = dataClientes[0].map(h =>
        _norm(h).replace(/\./g, '').replace(/\s+/g, '_')
    );

    // Crear mapa de clientes por email con todos sus datos
    const mapaClientes = {};
    for (let i = 1; i < dataClientes.length; i++) {
        const emailCliente = String(dataClientes[i][headersC.indexOf('email')] || '').trim().toLowerCase();
        if (emailCliente) {
            // Construir objeto completo con todos los datos del cliente
            const clienteData = {};
            headersC.forEach((header, idx) => {
                clienteData[header] = String(dataClientes[i][idx] || '').trim();
            });
            mapaClientes[emailCliente] = clienteData;
        }
    }

    // Enriquecer servicios con fallback completo
    out.forEach(s => {
        const emailServicio = String(s.email || '').trim().toLowerCase();

        if (emailServicio && mapaClientes[emailServicio]) {
            const clienteData = mapaClientes[emailServicio];

            // Fallback para direcció³n y ubicació³n
            if (!String(s.direccion || '').trim()) {
                s.direccion = clienteData.direccion || s.direccion;
            }
            if (!String(s.ubicacion_link || '').trim()) {
                s.ubicacion_link = clienteData.ubicacion || s.ubicacion_link;
            }

            // Fallback para contacto y emergencia
            if (!String(s.numero_contacto || '').trim()) {
                s.numero_contacto = clienteData.telefono || s.numero_contacto;
            }
            // Siempre intentar poner el de emergencia del cliente (sin condició³n, como solicitado)
            s.numero_de_emergencia = clienteData.no_de_emergencia || s.numero_de_emergencia;

            // Fallback para edad
            if (!String(s.edad_nino || '').trim()) {
                s.edad_nino = clienteData.edad_del_peque || s.edad_nino;
            }

            // Fallback para notas (construir desde datos del cliente)
            if (!String(s.notas || '').trim()) {
                s.notas = _construirNotasDesdeCliente(clienteData) || s.notas;
            }
        }
    });

    out.sort((a, b) => (a.fecha + ' ' + a.hora_inicio).localeCompare(b.fecha + ' ' + b.hora_inicio));
    // Detectar empalmes ENTRE LOS SERVICIOS DE LA NIó‘ERA
    for (let i = 0; i < out.length; i++) {
        out[i].empalmado = false;
    }
























    for (let i = 0; i < out.length; i++) {
        for (let j = i + 1; j < out.length; j++) {
            if (out[i].fecha !== out[j].fecha) continue;




            const a1 = _hmToMinutes(out[i].hora_inicio);
            const a2 = _hmToMinutes(out[i].hora_fin);
            const b1 = _hmToMinutes(out[j].hora_inicio);
            const b2 = _hmToMinutes(out[j].hora_fin);








            if ((a1 < b2) && (b1 < a2)) {
                out[i].empalmado = true;
                out[j].empalmado = true;
            }
        }
    }








    return out;




}












function confirmarServicioPorFila(sheetName, row, email) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');
    const sh = _hoja(sheetName);
    const rowNum = Number(row);
    if (rowNum < 3 || rowNum > sh.getLastRow()) {
        throw new Error('Fila invó¡lida.');
    }




    // Validar que el servicio sea de la nió±era
    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn())
        .getDisplayValues()[0]
        .map(h => _norm(h));




    const idxNombre = hdrs.indexOf('nombre de ninera') + 1;
    if (idxNombre <= 0) throw new Error('Falta columna "nombre de nió±era".');




    const nombreFila = String(sh.getRange(rowNum, idxNombre).getValue() || '').trim();
    const nombreNanny = _nombrePorEmail(email);
    if (_norm(nombreFila) !== _norm(nombreNanny)) {
        throw new Error('No puede confirmar servicios de otra nió±era.');
    }




    // ðŸ”¥ Usamos el mapa por fecha
    const mapa = _mapaColumnasPorFecha_(sh);
    const ts = _nowHuman();
    let confirmados = 0;
















    Object.keys(mapa).forEach(fechaISO => {
        const m = mapa[fechaISO];
        if (!m) return;








        // Solo confirmar dó­as que Só tengan horas
        if (!m.hora_inicio || !m.hora_fin) return;




        const hi = sh.getRange(rowNum, m.hora_inicio).getValue();
        const hf = sh.getRange(rowNum, m.hora_fin).getValue();
        if (!hi || !hf) return; // ese dó­a no hay servicio








        // Escribir estado y confirmació³n
        if (m.estado) {
            sh.getRange(rowNum, m.estado).setValue('confirmado');
        }
        if (m.confirmado_en) {
            sh.getRange(rowNum, m.confirmado_en).setValue(ts);
        }




        confirmados++;
    });








    if (confirmados === 0) {
        throw new Error('No se encontraron dó­as con servicio para confirmar.');
    }




    return {
        ok: true,
        confirmados: confirmados,
        confirmado_en: ts
    };
}












/** Check-in / Check-out **/
function registrarInicioServicio(sheetName, row, fechaISO, email) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');




    const sh = _hoja(sheetName);
    const mapa = _mapaColumnasPorFecha_(sh);
    const m = mapa[String(fechaISO || '').trim()];
    if (!m) throw new Error('Fecha no encontrada en la hoja: ' + fechaISO);
    if (!m.inicio_real || !m.estado) throw new Error('Faltan columnas "Inicio real" o "estado" debajo de esa fecha.');




    // validar que sea su servicio
    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const idxNombre = hdrs.indexOf('nombre de ninera') + 1;
    if (idxNombre <= 0) throw new Error('Falta columna "nombre de nió±era".');




    const nombreFila = String(sh.getRange(Number(row), idxNombre).getValue() || '').trim();
    const nombreNanny = _nombrePorEmail(email);
    if (_norm(nombreFila) !== _norm(nombreNanny)) throw new Error('No tiene permiso para iniciar este servicio.');




    const ts = _nowHuman();
    sh.getRange(Number(row), m.inicio_real).setValue(ts);
    sh.getRange(Number(row), m.estado).setValue('En curso');




    return { ok: true, inicio_real: ts };
}
















function registrarFinServicio(sheetName, row, fechaISO, email) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');




    const sh = _hoja(sheetName);
    const mapa = _mapaColumnasPorFecha_(sh);
    const m = mapa[String(fechaISO || '').trim()];
    if (!m) throw new Error('Fecha no encontrada en la hoja: ' + fechaISO);
    if (!m.fin_real || !m.estado) throw new Error('Faltan columnas "Fin real" o "estado" debajo de esa fecha.');








    // validar que sea su servicio
    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const idxNombre = hdrs.indexOf('nombre de ninera') + 1;
    if (idxNombre <= 0) throw new Error('Falta columna "nombre de nió±era".');




    const nombreFila = String(sh.getRange(Number(row), idxNombre).getValue() || '').trim();
    const nombreNanny = _nombrePorEmail(email);
    if (_norm(nombreFila) !== _norm(nombreNanny)) throw new Error('No tiene permiso para finalizar este servicio.');




    const ts = _nowHuman();
    sh.getRange(Number(row), m.fin_real).setValue(ts);
    sh.getRange(Number(row), m.estado).setValue('Completado');
















    return { ok: true, fin_real: ts };
}
















/** =========================
 *  SELECCIó“N €“ con TURNOS + no empalmes
 *  ========================= */
function _hmToMinutes(hm) {
    if (!hm) return NaN;
    const s = String(hm).trim();
    const m = s.match(/^(\d{1,2})(?::|\.|h)?(\d{1,2})?$/i);
    if (!m) return NaN;
    const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
    const min = m[2] ? Math.min(59, Math.max(0, parseInt(m[2], 10))) : 0;
    return h * 60 + min;
}
function _rangoDentroDeTurnos(reqIni, reqFin, tieneMat, tieneVes) {
    // Verifica si [reqIni, reqFin) Está contenido en los turnos seleccionados
    const a = _hmToMinutes(reqIni), b = _hmToMinutes(reqFin);
    if (isNaN(a) || isNaN(b) || b <= a) return false;












    const mI = _hmToMinutes('07:00'), mF = _hmToMinutes('15:00');
    const vI = _hmToMinutes('15:00'), vF = _hmToMinutes('22:00');




    // Dentro de uno solo
    if (tieneMat && a >= mI && b <= mF) return true;
    if (tieneVes && a >= vI && b <= vF) return true;
















    // Cruza 15:00 => necesita ambos y estar de 07€“22
    if (tieneMat && tieneVes && a >= mI && b <= vF) return true;












    return false;
}
function _turnosDe(nombreNinera, fechaISO) {
    const sh = _hoja(NOMBRE_HOJA_DISPONIBILIDAD);
    _asegurarEstructuraTurnos(sh);
    const vals = sh.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
        const r = vals[i];
        const nom = String(r[0] || '').trim();
        const f = _toISODate(r[1]);
        if (_norm(nom) === _norm(nombreNinera) && f === fechaISO) {
            return { M: _esVerdadero(r[3]), V: _esVerdadero(r[4]) };
        }
    }
    return { M: false, V: false };
}
















function _overlapHM(a1, a2, b1, b2) {
    const a = _hmToMinutes(a1), b = _hmToMinutes(a2);
    const c = _hmToMinutes(b1), d = _hmToMinutes(b2);
    if ([a, b, c, d].some(x => isNaN(x))) return false;
    return (a < d) && (c < b);
}
















function _conflictoServicioAsignado(nombreNinera, fechaISO, hi, hf) {
    const sh = _hoja(NOMBRE_HOJA_SERVICIOS);
    const servicios = _expandirServiciosSemanales_(sh);








    for (const s of servicios) {
        if (_norm(s.nombre_ninera) !== _norm(nombreNinera)) continue;
        if (s.fecha !== fechaISO) continue;








        if (_overlapHM(hi, hf, s.hora_inicio, s.hora_fin)) {
            return {
                fecha: s.fecha,
                hi: s.hora_inicio,
                hf: s.hora_fin,
                estado: s.estado || 'pendiente'
            };
        }
    }












    return null;
}
















function _leerNinerasActivas() {
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const vals = sh.getDataRange().getValues(); if (vals.length < 2) return [];
    const hdr = _ss().getSheetByName(NOMBRE_HOJA_USUARIOS).getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const idx = {
        nombre: hdr.indexOf('nombre') + 1,
        email: hdr.indexOf('email') + 1,
        activo: hdr.indexOf('activo') + 1,
        dir: hdr.indexOf('direccion base') + 1,
        lat: hdr.indexOf('lat') + 1,
        lng: hdr.indexOf('lng') + 1,
        minEdad: hdr.indexOf('min_edad') + 1,
        maxEdad: hdr.indexOf('max_edad') + 1
    };
    const out = [];
    for (let i = 1; i < vals.length; i++) {
        const r = vals[i];
        const activo = idx.activo > 0 ? _esVerdadero(r[idx.activo - 1]) : true;
        if (!activo) continue;
        out.push({
            row: i + 1,
            nombre: idx.nombre > 0 ? String(r[idx.nombre - 1] || '').trim() : '',
            email: idx.email > 0 ? String(r[idx.email - 1] || '').trim().toLowerCase() : '',
            direccion: idx.dir > 0 ? String(r[idx.dir - 1] || '').trim() : '',
            lat: idx.lat > 0 ? Number(r[idx.lat - 1]) : NaN,
            lng: idx.lng > 0 ? Number(r[idx.lng - 1]) : NaN,
            min_edad: idx.minEdad > 0 && r[idx.minEdad - 1] !== '' ? Number(r[idx.minEdad - 1]) : 0,
            max_edad: idx.maxEdad > 0 && r[idx.maxEdad - 1] !== '' ? Number(r[idx.maxEdad - 1]) : 99
        });
    }
    return { hdrIdx: idx, lista: out, sheet: sh };
}
function _geocodingSheet() {
    const ss = _ss(); const name = 'Geocoding';
    return ss.getSheetByName(name) || ss.insertSheet(name);
}
function _getCachedGeocode(texto) {
    const sh = _geocodingSheet();
    const vals = sh.getDataRange().getValues();
    if (vals.length < 2) return null;
    for (let i = 1; i < vals.length; i++) {
        if (String(vals[i][0] || '').trim().toLowerCase() === String(texto || '').trim().toLowerCase()) {
            const lat = Number(vals[i][1]); const lng = Number(vals[i][2]);
            if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
        }
    }
    return null;
}
function _setCachedGeocode(texto, lat, lng) {
    const sh = _geocodingSheet();
    if (sh.getLastRow() === 0) sh.getRange(1, 1, 1, 4).setValues([['texto', 'lat', 'lng', 'actualizado']]);
    sh.appendRow([texto, lat, lng, _nowHuman()]);
}
function _geocode(texto) {
    if (!texto) return null;
    const cached = _getCachedGeocode(texto);
    if (cached) return cached;
    const res = Maps.newGeocoder().geocode(texto);
    if (res && res.status === 'OK' && res.results && res.results.length) {
        const loc = res.results[0].geometry.location;
        _setCachedGeocode(texto, loc.lat, loc.lng);
        return { lat: loc.lat, lng: loc.lng };
    }
    return null;
}
function _distKM(a, b) {
    if (!a || !b || isNaN(a.lat) || isNaN(a.lng) || isNaN(b.lat) || isNaN(b.lng)) return Number.POSITIVE_INFINITY;
    const toRad = d => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}
function _asegurarLatLngNinera(n, hdrIdx, shUsuarios) {
    if (!isNaN(n.lat) && !isNaN(n.lng)) return n;
    if (!n.direccion) return n;
    const loc = _geocode(n.direccion);
    if (loc) {
        n.lat = loc.lat; n.lng = loc.lng;
        if (hdrIdx.lat > 0 && hdrIdx.lng > 0) {
            shUsuarios.getRange(n.row, hdrIdx.lat).setValue(n.lat);
            shUsuarios.getRange(n.row, hdrIdx.lng).setValue(n.lng);
        }
    }
    return n;
}












function _disponiblePorTurnos(nombre, fechaISO, hi, hf) {
    const t = _turnosDe(nombre, fechaISO);
    return _rangoDentroDeTurnos(hi, hf, t.M, t.V);
}

function _extractCoordsFromUrl(url) {
    if (!url || !url.startsWith('http')) return null;
    try {
        // 1. Resolver redirecció³n (ej: maps.app.goo.gl)
        const response = UrlFetchApp.fetch(url, { followRedirects: false, muteHttpExceptions: true });
        let longUrl = url;
        if (response.getResponseCode() >= 300 && response.getResponseCode() < 400) {
            const loc = response.getHeaders()['Location'];
            if (loc) longUrl = loc;
        }

        // 2. Buscar patró³n @lat,lng
        // Ej: https://www.google.com/maps/place/.../@19.4326,-99.1332,17z...
        // O param ?query=lat,lng
        let m = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (m) return { lat: Number(m[1]), lng: Number(m[2]) };

        // Si no Está en el @, buscar query param 'q' o 'll' (menos comóºn en maps nuevos pero posible)
        // Pero lo mó¡s fiable para "Share Location" es el @.
        return null;
    } catch (e) {
        return null;
    }
}
function sugerirNinerasServicio(fechaISO, horaInicio, horaFin, ubicacionServicio, edadNino) {
    fechaISO = _toISODate(fechaISO);
    const hi = _toHM(horaInicio), hf = _toHM(horaFin);
    if (!fechaISO || !hi || !hf) throw new Error('Fecha u horario invó¡lidos');
    const edad = Number(edadNino); if (isNaN(edad)) throw new Error('Edad del nió±o invó¡lida');












    // Intentar extraer coordenadas si es un link de Maps, sino geocodificar normal
    const ubicacionStr = String(ubicacionServicio || '').trim();
    let locServicio = _extractCoordsFromUrl(ubicacionStr);
    if (!locServicio) {
        locServicio = _geocode(ubicacionStr);
    }
    const { hdrIdx, lista, sheet } = _leerNinerasActivas();
    const candidatos = [];




    for (const n0 of lista) {
        const n = _asegurarLatLngNinera(n0, hdrIdx, sheet);




        const cumpleEdad = (edad >= (n.min_edad || 0)) && (edad <= (n.max_edad || 99));
        if (!cumpleEdad) {
            candidatos.push({ nombre: n.nombre, email: n.email, cumple_edad: false, disponible: false, distancia_km: null, motivo: `No cubre la edad (${n.min_edad || 0}-${n.max_edad || 99})` });
            continue;
        }




        // Disponibilidad por turnos
        const disponible = _disponiblePorTurnos(n.nombre, fechaISO, hi, hf);
        if (!disponible) {
            candidatos.push({ nombre: n.nombre, email: n.email, cumple_edad: true, disponible: false, distancia_km: null, motivo: 'No cubre turnos requeridos' });
            continue;
        }




        // Empalmes con servicios asignados (pendiente o confirmado)
        const emp = _conflictoServicioAsignado(n.nombre, fechaISO, hi, hf);
        if (emp) {
            candidatos.push({ nombre: n.nombre, email: n.email, cumple_edad: true, disponible: false, distancia_km: null, motivo: `Conflicto con servicio ${emp.estado} ${emp.hi}€“${emp.hf}` });
            continue;
        }




        const dist = (locServicio && !isNaN(n.lat) && !isNaN(n.lng))
            ? Math.round(_distKM({ lat: n.lat, lng: n.lng }, locServicio) * 10) / 10
            : null;

        // FILTRO DE DISTANCIA: Excluir estrictamente si > 20km
        if (dist !== null && dist > 20) {
            continue;
        }

        candidatos.push({ nombre: n.nombre, email: n.email, cumple_edad: true, disponible: true, distancia_km: dist });
    }








    candidatos.sort((a, b) => {
        if (a.disponible !== b.disponible) return a.disponible ? -1 : 1;
        const da = (a.distancia_km == null ? Number.POSITIVE_INFINITY : a.distancia_km);
        const db = (b.distancia_km == null ? Number.POSITIVE_INFINITY : b.distancia_km);
        if (da !== db) return da - db;
        return (a.nombre || '').localeCompare(b.nombre || '');
    });








    return candidatos;
}
function apiSugerirNinerasServicio(payload, emailEjecutor) {
    if (!esAdmin(emailEjecutor)) throw new Error('Acceso solo para administradores.');
    if (!payload) throw new Error('Payload vacó­o');
    return sugerirNinerasServicio(payload.fecha, payload.hora_inicio, payload.hora_fin, payload.ubicacion, payload.edad);
}












/** =========================
 *  ADMIN: LISTADOS / AGENDA
 *  ========================= */
function obtenerServiciosAdmin(diasAdelante) {
    const todos = _leerServiciosDesdeHojas_([
        'Servicios'
    ]);




    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + Number(diasAdelante || 60));




    const hoyISO = Utilities.formatDate(hoy, ZONA_HORARIA, 'yyyy-MM-dd');
    const limISO = Utilities.formatDate(limite, ZONA_HORARIA, 'yyyy-MM-dd');








    const out = todos.filter(s =>
        s.fecha >= hoyISO &&
        s.fecha <= limISO
    );




    out.sort((a, b) => (a.fecha + ' ' + a.hora_inicio).localeCompare(b.fecha + ' ' + b.hora_inicio));
    return out;
}












function obtenerListaNineras() {
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName("Usuarios");
    if (!sh) return [];




    const data = sh.getDataRange().getValues();
    if (data.length < 2) return [];




    const headers = data[0].map(h =>
        String(h || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    );




    const colNombre = headers.indexOf('nombre');
    if (colNombre === -1) {
        throw new Error('No se encontró³ la columna "nombre" en Usuarios.');
    }




    const nombres = new Set();








    for (let i = 1; i < data.length; i++) {
        const nombre = String(data[i][colNombre] || '').trim();
        if (nombre) nombres.add(nombre);
    }








    return Array.from(nombres).sort((a, b) => a.localeCompare(b, 'es'));
}












function obtenerServiciosAdminRango(desdeISO, hastaISO) {
    const todos = _leerServiciosDesdeHojas_([
        'Servicios',
        'Servicios_Siguiente_semana'
    ]);








    const d0 = _toISODate(desdeISO || '');
    const d1 = _toISODate(hastaISO || '');
    if (!d0 || !d1) throw new Error('Rango invó¡lido');








    const out = todos.filter(s =>
        s.fecha >= d0 &&
        s.fecha <= d1
    );












    out.sort((a, b) =>
        (a.fecha + ' ' + (a.hora_inicio || '00:00'))
            .localeCompare(b.fecha + ' ' + (b.hora_inicio || '00:00'))
    );








    return out;
}












/** =========================
 *  UI (WebApp)
 *  ========================= */
function doGet() {
    const t = HtmlService.createTemplateFromFile('Index'); t.ZONA_HORARIA = ZONA_HORARIA;
    return t.evaluate().setTitle('Nannys y Peques')
        .setFaviconUrl('https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x16.png')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).getContent(); }








/*******************************************************
 *   SISTEMA DE PUNTAJES DE NIó‘ERAS €“ NANNYS Y PEQUES  *
 *   (basado en nombre de nió±era y servicios eventuales)
 *******************************************************/








const HOJA_SERVICIOS = 'Servicios';
const HOJA_PUNTOS_MANUAL = 'PuntosManual';








// Definició³n de puntos para eventos manuales
const PUNTOS_DEFINICIONES = {
    // POSITIVOS
    'SERVICIO_ULTIMO_MINUTO': {
        puntos: 2,
        descripcion: 'Servicio de óºltimo minuto'
    },
    'FAMILIA_REPITE': {
        puntos: 1,
        descripcion: 'La familia pide de nuevo la misma nanny'
    },
    'CAPACITACION_NO_OBLIGATORIA': {
        puntos: 7,
        descripcion: 'Participar en capacitació³n no obligatoria'
    },
    'INICIAR_SERVICIO_FIJO': {
        puntos: 20,
        descripcion: 'Iniciar un servicio fijo'
    },
    'GANAR_INSIGNIA': {
        puntos: 10,
        descripcion: 'Ganar una insignia'
    },
    'ENTRENAMIENTO_NANNY_STAR': {
        puntos: 25,
        descripcion: 'Asistir a entrenamiento Nanny Star'
    },
    'RECOMENDAR_NANNY': {
        puntos: 20,
        descripcion: 'Recomendar a otra nanny y que tome un servicio'
    },








    // NEGATIVOS
    'NO_CONECTARSE_REUNION': {
        puntos: -10,
        descripcion: 'No conectarse a reuniones programadas'
    },
    'FALTA_SERVICIO': {
        puntos: -10,
        descripcion: 'Falta a servicio'
    },
    'REPORTE_NEGATIVO': {
        puntos: -10,
        descripcion: 'Reporte negativo de la familia'
    },
    'MALA_ACTITUD': {
        puntos: -10,
        descripcion: 'Mala actitud con la agencia'
    }
};
















/**
 * Devuelve (y crea si no existe) la hoja de puntos manuales.
 * Estructura: fecha, nombre, tipo, descripcion, puntos, semana
 */
function getHojaPuntosManual_() {
    const ss = SpreadsheetApp.getActive();
    let sh = ss.getSheetByName(HOJA_PUNTOS_MANUAL);
    if (!sh) {
        sh = ss.insertSheet(HOJA_PUNTOS_MANUAL);
        sh.appendRow(['fecha', 'nombre', 'tipo', 'descripcion', 'puntos', 'semana']);
    }
    return sh;
}












/**
 * Convierte un valor de fecha (string o Date) a Date.
 */
function parseFechaFlexible_(v) {
    if (!v) return null;
    if (Object.prototype.toString.call(v) === '[object Date]') {
        if (isNaN(v.getTime())) return null;
        return v;
    }
    const s = String(v).trim();
    if (!s) return null;
    // Si es formato ISO
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(s + 'T00:00:00');
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return d;
}












/**
 * Obtiene la "semana" como la fecha (YYYY-MM-DD) del lunes de esa semana.
 */
function weekKeyFromDate_(d) {
    if (!d) return '';
    const tz = Session.getScriptTimeZone();
    const dd = new Date(d.getTime());
    let day = dd.getDay();
    if (day === 0) day = 7;  // Domingo = 7
    dd.setDate(dd.getDate() + 1 - day); // ir a lunes
    return Utilities.formatDate(dd, tz, 'yyyy-MM-dd');
}








/**
 * Lee la hoja "Servicios" y devuelve todos los servicios EVENTUALES
 * para una nió±era por NOMBRE.
 *
 * Se asume:
 * - Columna "fecha"
 * - Columna "nombre_ninera" (o "nió±era"/"nanny")
 * - Columna "estado"
 * - Opcional: "tipo_servicio" o "tipo" (si existe y es != "eventual", se omite)
 */
function obtenerServiciosEventualesPorNombre_(nombreNinera) {
    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(HOJA_SERVICIOS);
    if (!sh) throw new Error('No existe la hoja "' + HOJA_SERVICIOS + '".');








    const data = sh.getDataRange().getValues();
    if (data.length <= 1) return [];








    const headers = data[0].map(h => String(h).trim().toLowerCase());








    function findIdx(posibles) {
        if (!Array.isArray(posibles)) posibles = [posibles];
        for (var i = 0; i < posibles.length; i++) {
            var idx = headers.indexOf(String(posibles[i]).toLowerCase());
            if (idx !== -1) return idx;
        }
        return -1;
    }




    const iFecha = findIdx('fecha');
    const iNombre = findIdx(['nombre de nió±era', 'nió±era', 'nanny']);
    const iEstado = findIdx('estado');
    const iTipo = findIdx(['tipo_servicio', 'tipo']);








    if (iFecha === -1 || iNombre === -1 || iEstado === -1) {
        throw new Error('Faltan columnas necesarias en hoja "Servicios" (fecha, nombre_ninera, estado).');
    }




    const result = [];
    for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const nom = String(row[iNombre] || '').trim();
        if (!nom || nom !== nombreNinera) continue;








        const fechaVal = parseFechaFlexible_(row[iFecha]);
        if (!fechaVal) continue;




        const estado = String(row[iEstado] || '').trim().toLowerCase();
        const tipo = iTipo >= 0 ? String(row[iTipo] || '').trim().toLowerCase() : '';




        // Filtramos solo SERVICIOS EVENTUALES
        if (iTipo >= 0 && tipo && tipo !== 'eventual') continue;




        result.push({
            fecha: fechaVal,
            estado: estado
        });
    }
    return result;
}








/**
 * Lee puntos manuales de la hoja PuntosManual para una nió±era por NOMBRE.
 * Devuelve:
 *  - totalManual: suma de todos los puntos manuales
 *  - manualByWeek: { semanaKey: [ {tipo, puntos}, ... ] }
 */
function leerPuntosManualPorNombre_(nombreNinera) {
    const sh = getHojaPuntosManual_();
    const data = sh.getDataRange().getValues();
    if (data.length <= 1) return { totalManual: 0, manualByWeek: {} };








    const headers = data[0].map(h => String(h).trim().toLowerCase());
    function findIdx(nombre) {
        return headers.indexOf(String(nombre).toLowerCase());
    }
    const iFecha = findIdx('fecha');
    const iNombre = findIdx('nombre');
    const iTipo = findIdx('tipo');
    const iPuntos = findIdx('puntos');
    const iSemana = findIdx('semana');








    const manualByWeek = {};
    let totalManual = 0;








    for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const nom = String(row[iNombre] || '').trim();
        if (!nom || nom !== nombreNinera) continue;








        const puntos = Number(row[iPuntos] || 0);
        totalManual += puntos;
        const tipo = String(row[iTipo] || '').trim();








        let semanaKey = '';
        if (iSemana >= 0 && row[iSemana]) {
            semanaKey = String(row[iSemana]);
        } else if (iFecha >= 0) {
            const f = parseFechaFlexible_(row[iFecha]);
            if (f) semanaKey = weekKeyFromDate_(f);
        }




        if (!semanaKey) semanaKey = 'N/A';












        if (!manualByWeek[semanaKey]) manualByWeek[semanaKey] = [];
        manualByWeek[semanaKey].push({ tipo: tipo, puntos: puntos });
    }




    return { totalManual: totalManual, manualByWeek: manualByWeek };
}












/**
 * Calcula puntos AUTOMóTICOS por semanas a partir de servicios eventuales
 * y restricciones por castigos manuales.
 *
 * Reglas automó¡ticas:
 *  - En una semana donde la nió±era haya cubierto >= 2 servicios COMPLETADOS:
 *       Puntualidad en los servicios: +2
 *       Evaluació³n positiva del cliente: +2
 *       Reportes puntuales y completos: +3
 *  - Si en esa misma semana cubre >= 3 servicios COMPLETADOS:
 *       Tres servicios seguidos sin cancelació³n: +2
 *
 * Reglas de castigo que afectan automó¡ticos:
 *  - Si hay un evento manual "FALTA_SERVICIO" en esa semana:
 *       -> No se suman NINGUNOS puntos automó¡ticos de esa semana.
 *  - Si hay un evento manual "REPORTE_NEGATIVO" en esa semana:
 *       -> No se suman los +2 de "Evaluació³n positiva del cliente".
 */
function calcularPuntosAutomaticos_(servicios, manualByWeek) {
    // Agrupamos servicios COMPLETADOS por semana
    const porSemana = {};
    servicios.forEach(s => {
        if (!s || !s.fecha) return;
        if (String(s.estado || '').toLowerCase() !== 'completado') return;
        const wk = weekKeyFromDate_(s.fecha);
        if (!porSemana[wk]) porSemana[wk] = { completados: 0 };
        porSemana[wk].completados++;
    });








    let totalAuto = 0;
    const detalleSemanal = [];








    Object.keys(porSemana).forEach(wk => {
        const info = porSemana[wk];
        const completados = info.completados || 0;












        let ptsPuntualidad = 0;
        let ptsEvalPositiva = 0;
        let ptsReportes = 0;
        let ptsTresSinCancel = 0;








        if (completados >= 2) {
            ptsPuntualidad = 2;
            ptsEvalPositiva = 2;
            ptsReportes = 3;
            if (completados >= 3) {
                ptsTresSinCancel = 2;
            }
        }




        const manualSemana = manualByWeek[wk] || [];
        const hasFalta = manualSemana.some(m => m.tipo === 'FALTA_SERVICIO');
        const hasReporteNegativo = manualSemana.some(m => m.tipo === 'REPORTE_NEGATIVO');








        if (hasFalta) {
            // No se suman puntos automó¡ticos de esa semana
            ptsPuntualidad = 0;
            ptsEvalPositiva = 0;
            ptsReportes = 0;
            ptsTresSinCancel = 0;
        } else if (hasReporteNegativo) {
            // No se suma la parte de evaluació³n positiva
            ptsEvalPositiva = 0;
        }








        const totalSemana = ptsPuntualidad + ptsEvalPositiva + ptsReportes + ptsTresSinCancel;
        totalAuto += totalSemana;




        detalleSemanal.push({
            semana: wk,
            completados: completados,
            puntos: {
                puntualidad: ptsPuntualidad,
                evaluacion_positiva: ptsEvalPositiva,
                reportes: ptsReportes,
                tres_servicios_sin_cancelacion: ptsTresSinCancel,
                total_semana: totalSemana
            },
            tieneFaltaServicio: hasFalta,
            tieneReporteNegativo: hasReporteNegativo
        });
    });




    return {
        totalAuto: totalAuto,
        detalleSemanal: detalleSemanal
    };
}




















/**
 * Calcula puntos por hitos de cantidad de servicios eventuales cubiertos:
 *  - Cubrir 50 servicios:  +10
 *  - Cubrir 75 servicios:  +15
 *  - Cubrir 100 servicios: +20
 *  - Cubrir 125 servicios: +25
 *
 * Los hitos son acumulativos (si llega a 100, tiene 10+15+20).
 */
function calcularPuntosPorHitos_(totalServiciosEventuales) {
    let totalMilestones = 0;
    const detalles = [];




    function addIf(umbral, puntos) {
        if (totalServiciosEventuales >= umbral) {
            totalMilestones += puntos;
            detalles.push({ umbral: umbral, puntos: puntos });
        }
    }




    addIf(50, 10);
    addIf(75, 15);
    addIf(100, 20);
    addIf(125, 25);




    return {
        totalMilestones: totalMilestones,
        detalles: detalles
    };
}
































/**
 * Funció³n principal: calcula el puntaje completo para una nió±era por NOMBRE.
 * Devuelve:
 *  {
 *    nombre,
 *    total,            // puntos totales
 *    nivel,            // Pink / Yellow / Blue / Golden Nanny
 *    servicios,        // cantidad de servicios eventuales cubiertos
 *    auto,             // detalle de puntos automó¡ticos
 *    manual,           // detalle de puntos manuales
 *    milestones        // detalle de hitos por cantidad de servicios
 *  }
 */
function obtenerPuntajePorNombre(nombreNinera) {
    nombreNinera = String(nombreNinera || '').trim();
    if (!nombreNinera) throw new Error('Nombre de nió±era vacó­o.');












    const servicios = obtenerServiciosEventualesPorNombre_(nombreNinera);
    const totalServiciosEventuales = servicios.filter(s => String(s.estado || '').toLowerCase() === 'completado').length;
    const manualInfo = leerPuntosManualPorNombre_(nombreNinera);
    const autoInfo = calcularPuntosAutomaticos_(servicios, manualInfo.manualByWeek);
    const hitosInfo = calcularPuntosPorHitos_(totalServiciosEventuales);
    const total = (autoInfo.totalAuto || 0) + (manualInfo.totalManual || 0) + (hitosInfo.totalMilestones || 0);












    let nivel = 'Pink Nanny';
    if (total >= 300) nivel = 'Golden Nanny';
    else if (total >= 200) nivel = 'Blue Nanny';
    else if (total >= 100) nivel = 'Yellow Nanny';








    return {
        nombre: nombreNinera,
        total: total,
        nivel: nivel,
        servicios: totalServiciosEventuales,
        auto: autoInfo,
        manual: manualInfo,
        milestones: hitosInfo
    };
}












/**
 * Registra un evento de puntos MANUAL para una nió±era por NOMBRE.
 * Respeta la tabla de puntos PUNTOS_DEFINICIONES.
 * Devuelve el puntaje recalculado de la nió±era.
 *
 * NOTA: las reglas especiales de:
 *  - FALTA_SERVICIO (anula automó¡ticos de la semana),
 *  - REPORTE_NEGATIVO (anula la evaluació³n positiva automó¡tica),
 * se aplican al calcular el total, NO aquí­.
 */
function registrarPuntosManual(nombreNinera, tipoId) {
    nombreNinera = String(nombreNinera || '').trim();
    if (!nombreNinera) throw new Error('Debe indicar el nombre de la nió±era.');








    const def = PUNTOS_DEFINICIONES[tipoId];
    if (!def) throw new Error('Tipo de puntos no reconocido: ' + tipoId);








    const sh = getHojaPuntosManual_();
    const tz = Session.getScriptTimeZone();
    const ahora = new Date();
    const fechaISO = Utilities.formatDate(ahora, tz, 'yyyy-MM-dd');
    const semanaKey = weekKeyFromDate_(ahora);
















    sh.appendRow([
        fechaISO,
        nombreNinera,
        tipoId,
        def.descripcion,
        def.puntos,
        semanaKey
    ]);












    // Devolvemos el puntaje actualizado
    return obtenerPuntajePorNombre(nombreNinera);
}












/** =========================
 *  ADMIN: RESUMEN DISPONIBILIDAD SEMANAL
 *  ========================= */
function obtenerResumenDisponibilidadSemanaActual() {
    // 1) Leer usuarios (nió±eras) una sola vez
    const shU = _hoja(NOMBRE_HOJA_USUARIOS);
    const valsU = shU.getDataRange().getValues();
    if (valsU.length < 2) return [];
















    const idxEmail = _idxCol(shU, 'email');
    const idxNombre = _idxCol(shU, 'nombre');
    const idxCiudad = _idxCol(shU, 'ciudad');   // columna O
    const idxActivo = _idxCol(shU, 'activo');   // opcional








    if (idxEmail < 1 || idxNombre < 1 || idxCiudad < 1) {
        throw new Error('Faltan columnas "email", "nombre" o "ciudad" en la hoja de usuarios.');
    }








    // 2) Calcular las fechas de la semana actual (Lun€“Dom)
    const hoyISO = Utilities.formatDate(new Date(), ZONA_HORARIA, 'yyyy-MM-dd');
    const fechasSemana = _diasDeSemana(hoyISO).map(d => d.fecha); // reutiliza funció³n existente




    // 3) Leer la hoja Disponibilidad UNA sola vez
    const shD = _hoja(NOMBRE_HOJA_DISPONIBILIDAD);
    _asegurarEstructuraTurnos(shD);
    const valsD = shD.getDataRange().getValues();




    // mapa: nombre normalizado -> boolean (si tiene al menos un turno en la semana actual)
    const tienePorNombreNorm = {};
    for (let i = 1; i < valsD.length; i++) {
        const r = valsD[i];
        const nom = String(r[0] || '').trim();
        const f = _toISODate(r[1]);
        if (!nom || !f) continue;
        if (fechasSemana.indexOf(f) === -1) continue; // fuera de la semana actual




        const mat = _esVerdadero(r[3]); // Matutino
        const ves = _esVerdadero(r[4]); // Vespertino
        if (mat || ves) {
            tienePorNombreNorm[_norm(nom)] = true;
        }
    }








    // 4) Construir el resumen por ciudad
    const resumenPorCiudad = {};




    for (let i = 1; i < valsU.length; i++) {
        const r = valsU[i];
        const email = String(r[idxEmail - 1] || '').trim().toLowerCase();
        const nombre = String(r[idxNombre - 1] || '').trim();
        const ciudadR = String(r[idxCiudad - 1] || '').trim();
        const ciudad = ciudadR || 'Sin ciudad';




        if (!email || !nombre) continue;




        // filtrar solo activas (si la columna existe)
        if (idxActivo > 0) {
            const activo = _esVerdadero(r[idxActivo - 1]);
            if (!activo) continue;
        }




        const tiene = !!tienePorNombreNorm[_norm(nombre)];








        if (!resumenPorCiudad[ciudad]) resumenPorCiudad[ciudad] = [];
        resumenPorCiudad[ciudad].push({
            nombre: nombre,
            email: email,
            tiene: tiene
        });
    }








    // 5) Ordenar por ciudad y por nombre
    const salida = Object.keys(resumenPorCiudad)
        .sort()
        .map(ciudad => {
            const nns = resumenPorCiudad[ciudad];
            nns.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
            return {
                ciudad: ciudad,
                nineras: nns
            };
        });




    return salida;
}




function obtenerResumenPlaneacionesSemana(fechaBaseISO, email, tipo) {

    const fechasSemana = _diasDeSemana(fechaBaseISO).map(d => d.fecha);

    // ðŸ”‘ SEGREGACIó“N POR HOJA SEGóšN TIPO
    let hojasALeer = ['Servicios', 'Servicios_Siguiente_semana'];
    if (tipo === 'actual') hojasALeer = ['Servicios'];
    else if (tipo === 'siguiente') hojasALeer = ['Servicios_Siguiente_semana'];

    const servicios = _leerServiciosDesdeHojas_(hojasALeer).filter(s =>
        ['neuronanny', 'nanny educativa', 'miss nanny']
            .includes(_norm(s.tipo_servicio)) &&
        fechasSemana.includes(s.fecha)
    );


    const shP = _hoja('Planeaciones_Neuronanny');
    const dataP = shP.getDataRange().getValues();
    const hdrP = dataP[0].map(h => _norm(h));

    const idxFechaP = hdrP.indexOf('fecha');
    const idxClienteP = hdrP.indexOf('cliente');

    // ðŸ”‘ columna estado revisió³n (robusta)
    const idxEstadoR = hdrP.findIndex(h =>
        h.includes('estado') && h.includes('revision')
    );

    const mapaCiudad = _mapaCiudadPorNinera();

    const resumen = {};
    const serviciosProcesados = new Set();

    servicios.forEach(s => {


        const cliente = String(s.cliente || '').trim();
        const ninera = String(s.nombre_ninera || '').trim();
        if (!cliente || !ninera) return;

        const tipoServicio = s.tipo_servicio || '';

        const servicioKey = [
            cliente,
            ninera,
            _norm(tipoServicio)
        ].join('|').toLowerCase();

        // ›” evitar duplicados
        if (serviciosProcesados.has(servicioKey)) return;
        serviciosProcesados.add(servicioKey);


        const ciudad = mapaCiudad[ninera.toLowerCase()] || 'Sin ciudad';

        const diasServicio = servicios
            .filter(x =>
                String(x.cliente).trim() === cliente &&
                String(x.nombre_ninera).trim() === ninera &&
                _norm(x.tipo_servicio) === _norm(tipoServicio)
            )
            .map(x => x.fecha);


        let planeacionesEncontradas = 0;
        const estados = [];

        diasServicio.forEach(fechaServicio => {
            for (let i = 1; i < dataP.length; i++) {

                const fechaP = _toISODate(dataP[i][idxFechaP]);
                const clienteP = String(dataP[i][idxClienteP] || '').trim();

                if (fechaP === fechaServicio && clienteP === cliente) {
                    planeacionesEncontradas++;

                    let estado = 'pendiente';
                    if (idxEstadoR >= 0) {
                        estado = _norm(dataP[i][idxEstadoR] || 'pendiente');
                    }

                    estados.push(estado);
                    break;
                }
            }
        });

        const tienePlaneacion =
            diasServicio.length > 0 &&
            planeacionesEncontradas === diasServicio.length;

        // ðŸ”‘ estado FINAL que só­ entiende el frontend
        let estadoRevision = 'pendiente';

        if (tienePlaneacion) {
            if (estados.includes('a correccion')) {
                estadoRevision = 'a correccion';
            }
            else if (estados.length && estados.every(e => e === 'revisada')) {
                estadoRevision = 'revisada';
            }
        }

        if (!resumen[ciudad]) resumen[ciudad] = [];


        resumen[ciudad].push({
            cliente,
            ninera,
            tipo_servicio: tipoServicio,
            dias: diasServicio,
            planeacionesEncontradas,
            totalDias: diasServicio.length,
            tienePlaneacion,
            estado_revision: estadoRevision   // ðŸ”´ ESTE ERA EL PUNTO CLAVE
        });
    });

    return resumen;
}






function guardarPlaneacionNeuronanny(payload, email) {
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');
    if (!payload) throw new Error('Datos incompletos.');

    const sh = SpreadsheetApp.getActive().getSheetByName('Planeaciones_Neuronanny');
    if (!sh) throw new Error('No existe la hoja Planeaciones_Neuronanny.');

    const data = sh.getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));

    const idxFecha = headers.indexOf('fecha');
    const idxCliente = headers.indexOf('cliente');

    const fechaPayload = _toISODate(payload.fecha);
    const clientePayload = String(payload.cliente || '').trim();

    // ðŸ”’ Validació³n existente (NO se toca)
    for (let i = 1; i < data.length; i++) {
        const rFecha = _toISODate(data[i][idxFecha]);
        const rCliente = String(data[i][idxCliente] || '').trim();

        if (rFecha === fechaPayload && rCliente === clientePayload) {
            throw new Error('Ya existe una planeació³n para este cliente en esta fecha.');
        }
    }

    // ====================================================
    // ðŸ”‘ ASEGURAR NOMBRE DE NIó‘ERA (ARREGLO REAL)
    // ====================================================
    let nombreNinera =
        payload.nombre_ninera ||
        payload.nombreNinera ||
        (typeof SESION !== 'undefined' ? SESION.nombre : '') ||
        _nombrePorEmail(email) ||
        '';

    nombreNinera = String(nombreNinera || '').trim();

    // ====================================================
    // 🟠 GESTIÓN DE IMAGEN (DRIVE)
    // ====================================================
    let imagenFinal = payload.imagen || '';

    if (payload.imagen_base64) {
        try {
            // Generar nombre único: Fecha + Cliente + Nanny
            const timestamp = Utilities.formatDate(new Date(), ZONA_HORARIA, 'yyyyMMdd_HHmmss');
            const nombreArchivo = `PLAN_${timestamp}_${_norm(payload.cliente).replace(/\s+/g, '_')}.jpg`;

            imagenFinal = _guardarImagenDrive(payload.imagen_base64, nombreArchivo);
        } catch (e) {
            console.error('Error guardando imagen en Drive:', e);
            throw new Error('No se pudo guardar la imagen: ' + e.message);
        }
    }

    // ====================================================
    // œï¸ GUARDADO (MISMO appendRow, SIN ROMPER NADA)
    // ====================================================
    sh.appendRow([
        payload.fecha || '',
        nombreNinera,                 // œ… aquí YA VA GARANTIZADO
        payload.cliente || '',
        payload.edad_nino || '',
        payload.area_desarrollo || '',
        payload.objetivo || '',
        payload.descripcion || '',
        payload.materiales || '',
        imagenFinal,                  // œ… URL de Drive o Link externo
        _nowHuman(),
        payload.ciudad || ''
    ]);

    return { ok: true };
}



function reenviarPlaneacionCorregida(payload, email) {

    email = String(email || '').trim().toLowerCase();

    if (!email || !_estaAutorizado(email)) {
        throw new Error('Usuario no autorizado.');
    }

    if (!payload || !payload.fecha || !payload.cliente) {
        throw new Error('Datos incompletos para reenviar planeació³n.');
    }

    const sh = _hoja('Planeaciones_Neuronanny');
    const data = sh.getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));

    // ðŸ”Ž óndices por encabezado
    const idxFecha = headers.indexOf('fecha');
    const idxCliente = headers.indexOf('cliente');
    const idxArea = headers.indexOf('area de desarrollo');
    const idxObjetivo = headers.indexOf('objetivo');
    const idxDescripcion = headers.indexOf('descripcion');
    const idxMateriales = headers.indexOf('materiales');
    const idxImagen = headers.indexOf('imagen');
    const idxEstadoRev = headers.indexOf('estado revision');
    const idxFechaCorr = headers.indexOf('fecha de correccion');

    if (idxFecha === -1 || idxCliente === -1) {
        throw new Error('La hoja Planeaciones_Neuronanny no tiene las columnas requeridas.');
    }

    const fechaISO = _toISODate(payload.fecha);
    const cliente = String(payload.cliente || '').trim();

    let fila = -1;

    // ðŸ” Buscar la planeació³n existente
    for (let i = 1; i < data.length; i++) {
        const f = _toISODate(data[i][idxFecha]);
        const c = String(data[i][idxCliente] || '').trim();

        if (f === fechaISO && c === cliente) {
            fila = i + 1;
            break;
        }
    }

    if (fila === -1) {
        throw new Error('No se encontró³ la planeació³n a reenviar.');
    }

    // --- IDOR PROTECTION: VALIDATE OWNERSHIP ---
    if (!esAdmin(email)) {
        const nombreNannyFila = String(sh.getRange(fila, 2).getValue() || '').trim();
        const miNombre = _nombrePorEmail(email);
        if (_norm(nombreNannyFila) !== _norm(miNombre)) {
            _auditLog(email, 'IDOR_ATTEMPT', { action: 'reenviarPlaneacion', fila: fila });
            throw new Error('No tienes permiso para reenviar esta planeación.');
        }
    }

    // œï¸ Actualizar datos de la planeació³n
    if (idxArea >= 0) sh.getRange(fila, idxArea + 1).setValue(payload.area_desarrollo || '');
    if (idxObjetivo >= 0) sh.getRange(fila, idxObjetivo + 1).setValue(payload.objetivo || '');
    if (idxDescripcion >= 0) sh.getRange(fila, idxDescripcion + 1).setValue(payload.descripcion || '');
    if (idxMateriales >= 0) sh.getRange(fila, idxMateriales + 1).setValue(payload.materiales || '');
    if (idxImagen >= 0) sh.getRange(fila, idxImagen + 1).setValue(payload.imagen || '');

    // ðŸ” Cambiar estado de revisió³n †’ pendiente
    if (idxEstadoRev >= 0) {
        sh.getRange(fila, idxEstadoRev + 1).setValue('pendiente');
    }

    // ðŸ•’ Guardar fecha y hora de correcció³n
    if (idxFechaCorr >= 0) {
        sh.getRange(fila, idxFechaCorr + 1).setValue(_nowHuman());
    }

    return { ok: true };
}







function obtenerPlaneacionNeuronanny(payload, email) {
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');

    const sh = _hoja('Planeaciones_Neuronanny');
    if (!sh) return null;

    const data = sh.getDataRange().getValues();
    if (data.length < 2) return null;

    const headers = data[0].map(h => _norm(h));

    const idxFecha = headers.indexOf('fecha');
    const idxCliente = headers.indexOf('cliente');

    const idxNinera = headers.findIndex(h =>
        h.includes('nombre') && h.includes('ninera')
    );

    const idxEstado = headers.findIndex(h =>
        h.includes('estado') && h.includes('revision')
    );

    const idxObsSup = headers.findIndex(h =>
        h.includes('observaciones') && h.includes('supervision')
    );

    // ðŸ”‘ ESTOS SON LOS ENCABEZADOS REALES
    const idxFechaCreacion = headers.indexOf('fecha de creacion');
    const idxFechaCorreccion = headers.indexOf('fecha de correccion');

    for (let i = 1; i < data.length; i++) {
        const rFecha = _toISODate(data[i][idxFecha]);
        const rCliente = String(data[i][idxCliente] || '').trim();

        if (rFecha === payload.fecha && rCliente === payload.cliente) {
            return {
                fila: i + 1,

                // ðŸ“‹ PLANEACIó“N
                area_desarrollo: data[i][headers.indexOf('area de desarrollo')] || '',
                objetivo: data[i][headers.indexOf('objetivo')] || '',
                descripcion: data[i][headers.indexOf('descripcion')] || '',
                materiales: data[i][headers.indexOf('materiales')] || '',
                imagen: data[i][headers.indexOf('imagen')] || '',

                // ðŸ§¸ NIó‘ERA
                nombre_ninera: idxNinera >= 0
                    ? String(data[i][idxNinera] || '').trim()
                    : '',

                // ðŸ” REVISIó“N
                estado_revision: idxEstado >= 0
                    ? String(data[i][idxEstado] || '').trim()
                    : '',

                observaciones_supervision: idxObsSup >= 0
                    ? String(data[i][idxObsSup] || '').trim()
                    : '',

                // ðŸ“… FECHAS (AHORA Só EXISTEN)
                fecha_revision: idxFechaCreacion >= 0
                    ? String(data[i][idxFechaCreacion] || '').trim()
                    : '',

                fecha_correccion: idxFechaCorreccion >= 0
                    ? String(data[i][idxFechaCorreccion] || '').trim()
                    : ''
            };
        }
    }

    return null;
}











function editarPlaneacionNeuronanny(payload, email) {
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');
    if (!payload || !payload.fila) throw new Error('Planeació³n no identificada.');




    const sh = SpreadsheetApp.getActive().getSheetByName('Planeaciones_Neuronanny');
    if (!sh) throw new Error('No existe la hoja Planeaciones_Neuronanny.');




    const fila = Number(payload.fila);
    if (fila < 2 || fila > sh.getLastRow()) {
        throw new Error('Fila invÃ¡lida.');
    }

    // --- IDOR PROTECTION: VALIDATE OWNERSHIP ---
    if (!esAdmin(email)) {
        const nombreNannyFila = String(sh.getRange(fila, 2).getValue() || '').trim();
        const miNombre = _nombrePorEmail(email);
        if (_norm(nombreNannyFila) !== _norm(miNombre)) {
            _auditLog(email, 'IDOR_ATTEMPT', { action: 'editarPlaneacion', fila: fila });
            throw new Error('No tienes permiso para editar esta planeación.');
        }
    }




    // ====================================================
    // ✅ GESTIÓN DE IMAGEN (DRIVE)
    // ====================================================
    let imagenFinal = payload.imagen || '';

    if (payload.imagen_base64) {
        try {
            const timestamp = Utilities.formatDate(new Date(), ZONA_HORARIA, 'yyyyMMdd_HHmmss');
            const nombreArchivo = `PLAN_EDIT_${timestamp}_${fila}.jpg`;
            imagenFinal = _guardarImagenDrive(payload.imagen_base64, nombreArchivo);
        } catch (e) {
            console.error('Error guardando imagen editada en Drive:', e);
            throw new Error('No se pudo guardar la imagen: ' + e.message);
        }
    }

    sh.getRange(fila, 5).setValue(payload.area_desarrollo || '');
    sh.getRange(fila, 6).setValue(payload.objetivo || '');
    sh.getRange(fila, 7).setValue(payload.descripcion || '');
    sh.getRange(fila, 8).setValue(payload.materiales || '');
    sh.getRange(fila, 9).setValue(imagenFinal);
    sh.getRange(fila, 10).setValue(_nowHuman()); // fecha de actualizació³n




    return { ok: true };
}

function guardarObservacionesSupervision(payload, email) {
    if (!esSupervision(email) && !esAdmin(email)) {
        throw new Error('Acceso no autorizado.');
    }

    if (!payload || !payload.fila) {
        throw new Error('Planeación no identificada.');
    }

    const sh = _hoja('Planeaciones_Neuronanny');

    // Leer encabezados normalizados
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn())
        .getDisplayValues()[0]
        .map(h => _norm(h));

    // ---- OBSERVACIONES SUPERVISIó“N ----
    let idxObs = headers.indexOf('observaciones supervision');
    if (idxObs === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('observaciones supervision');
        idxObs = sh.getLastColumn() - 1;
    }

    // ---- FECHA REVISIó“N ----
    let idxRevision = headers.indexOf('fecha revision');
    if (idxRevision === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('fecha revisión');
        idxRevision = sh.getLastColumn() - 1;
    }

    // ---- FECHA ENVóO A CORRECCIó“N ----
    let idxCorreccion = headers.indexOf('fecha de envio a correccion');
    if (idxCorreccion === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('fecha de envio a corrección');
        idxCorreccion = sh.getLastColumn() - 1;
    }

    // ---- ESTADO REVISIó“N ----
    let idxEstado = headers.indexOf('estado revision');
    if (idxEstado === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('estado revisión');
        idxEstado = sh.getLastColumn() - 1;
    }

    const fila = Number(payload.fila);
    if (fila < 2 || fila > sh.getLastRow()) {
        throw new Error('Fila invó¡lida.');
    }

    const ahora = _nowHuman();

    // 1ï¸ƒ£ Guardar observaciones
    sh.getRange(fila, idxObs + 1).setValue(payload.observaciones || '');

    // 2ï¸ƒ£ Guardar estado + fecha segóºn acció³n
    if (payload.tipo === 'revisada') {
        sh.getRange(fila, idxEstado + 1).setValue('revisada');
        sh.getRange(fila, idxRevision + 1).setValue(ahora);
    }

    if (payload.tipo === 'correccion') {
        sh.getRange(fila, idxEstado + 1).setValue('a corrección');
        sh.getRange(fila, idxCorreccion + 1).setValue(ahora);
    }

    return { ok: true };
}





function obtenerResumenPlaneacionesNinera(emailNinera) {
    if (!emailNinera) return [];

    // 1. Obtener nombre de la niñera por email
    const shUsuarios = _hoja(NOMBRE_HOJA_USUARIOS);
    const dataUsuarios = shUsuarios.getDataRange().getValues();
    const headersU = dataUsuarios.shift();
    const idxEmail = headersU.indexOf('email');
    const idxNombre = headersU.indexOf('nombre');

    let nombreNinera = null;
    dataUsuarios.forEach(r => {
        if (String(r[idxEmail]).toLowerCase() === emailNinera.toLowerCase()) {
            nombreNinera = r[idxNombre];
        }
    });
    if (!nombreNinera) return [];

    // 2. Leer servicios
    const shServicios = _hoja(NOMBRE_HOJA_SERVICIOS);
    const dataServ = shServicios.getDataRange().getValues();
    const headersS = dataServ.shift();

    const headersSNorm = headersS.map(h => _norm(h));
    const idxCliente = headersSNorm.indexOf(_norm('cliente'));
    const idxNinera = headersSNorm.indexOf(_norm('nombre de niñera'));
    const idxTipo = headersSNorm.indexOf(_norm('Tipo de servicio'));
    const idxFecha = headersSNorm.indexOf(_norm('fecha'));

    // 3. Leer planeaciones
    const shPlan = _hoja('Planeaciones_Neuronanny');
    const dataPlan = shPlan.getDataRange().getValues();
    const headersP = dataPlan.shift();

    const headersPNorm = headersP.map(h => _norm(h));
    const idxPCliente = headersPNorm.indexOf(_norm('cliente'));
    const idxPFecha = headersPNorm.indexOf(_norm('fecha'));
    let idxPNinera = headersPNorm.indexOf(_norm('nombre_ninera'));
    if (idxPNinera === -1) {
        // Fallback por si la columna se llama diferente
        const idxAlt = headersPNorm.indexOf(_norm('nombre de ninera'));
        if (idxAlt !== -1) idxPNinera = idxAlt;
    }

    // 4. Agrupar servicios por cliente
    const clientes = {};

    dataServ.forEach(r => {
        const tNorm = _norm(r[idxTipo]);
        if (
            ['neuronanny', 'nanny educativa', 'miss nanny'].includes(tNorm) &&
            _norm(r[idxNinera]) === _norm(nombreNinera)
        ) {
            const cliente = r[idxCliente];
            const fecha = _toISODate(r[idxFecha]);

            if (!clientes[cliente]) {
                clientes[cliente] = { fechas: [], tipo: r[idxTipo] };
            }
            clientes[cliente].fechas.push(fecha);
        }
    });

    // 5. Evaluar planeaciones
    const resultado = [];

    Object.keys(clientes).forEach(cliente => {
        const info = clientes[cliente];
        const fechas = info.fechas;

        let completas = true;

        fechas.forEach(f => {
            const existe = dataPlan.some(p =>
                String(p[idxPCliente] || '').trim() === String(cliente || '').trim() &&
                _toISODate(p[idxPFecha]) === _toISODate(f) &&
                String(p[idxPNinera] || '').trim() === String(nombreNinera || '').trim()
            );
            if (!existe) completas = false;
        });

        resultado.push({
            cliente,
            ninera: nombreNinera,
            tipo_servicio: info.tipo,
            tienePlaneacionesCompletas: completas,
            tienePlaneacion: completas // Frontend usa ambos indistintamente
        });
    });

    return resultado;
}



function obtenerPlaneacionesPorNinera(email) {
    const sh = _hoja('Planeaciones_Neuronanny');
    const data = sh.getDataRange().getValues();
    const headers = data.shift();

    const idxEmail = headers.indexOf('email_ninera');
    const idxCliente = headers.indexOf('cliente');
    const idxFecha = headers.indexOf('fecha');

    return data
        .filter(r => String(r[idxEmail]).toLowerCase() === email.toLowerCase())
        .map(r => ({
            cliente: r[idxCliente],
            fecha: r[idxFecha]
        }));
}

function _asegurarColumnaObservacionesSupervision_() {
    const sh = _hoja('Planeaciones_Neuronanny');
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0]
        .map(h => _norm(h));

    if (headers.indexOf('observaciones supervision') === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('observaciones supervision');
    }
}




// Secció³n de envió³ de notificació³nes cuando hay un nuevo servicio para la nió±era


function guardarPushSubscription(data) {
    const sh = SpreadsheetApp.getActive()
        .getSheetByName('PushSubscriptions');

    sh.appendRow([
        data.email,
        data.subscription.endpoint,
        data.subscription.keys.p256dh,
        data.subscription.keys.auth,
        new Date()
    ]);

    return { ok: true };
}

function onEdit(e) {
    try {
        const sh = e.range.getSheet();
        if (sh.getName() !== 'Servicios') return;

        const fila = e.range.getRow();
        const col = e.range.getColumn();

        if (fila < 3) return; // ignora encabezados

        // ðŸ”Ž detectar columna "ver"
        const headers = sh.getRange(1, 1, 1, sh.getLastColumn())
            .getDisplayValues()[0]
            .map(h => _norm(h));

        const idxVer = headers.indexOf('ver') + 1;
        if (idxVer <= 0) return;

        if (col !== idxVer) return;

        // solo cuando cambia a TRUE
        const nuevoValor = _esVerdadero(e.value);
        const valorAnterior = _esVerdadero(e.oldValue);

        if (!nuevoValor || valorAnterior) return;

        // ðŸš€ NUEVO SERVICIO ACTIVADO
        notificarNuevoServicioDesdeFila_(sh, fila);

    } catch (err) {
        console.error('Error en onEdit:', err);
    }
}


function notificarNuevoServicioDesdeFila_(sh, fila) {

    const headers = sh.getRange(1, 1, 1, sh.getLastColumn())
        .getDisplayValues()[0]
        .map(h => _norm(h));

    function val(nombre) {
        const idx = headers.indexOf(_norm(nombre));
        return idx >= 0 ? sh.getRange(fila, idx + 1).getValue() : '';
    }

    const nombreNinera = String(val('nombre de nió±era')).trim();
    if (!nombreNinera) return;

    const cliente = String(val('cliente')).trim();

    // fecha: tomamos la PRIMER fecha vó¡lida de encabezado
    const fechas = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    let fechaServicio = '';
    for (const f of fechas) {
        if (f instanceof Date) {
            fechaServicio = Utilities.formatDate(f, ZONA_HORARIA, 'yyyy-MM-dd');
            break;
        }
    }

    // obtener email de la nió±era
    const emailNinera = obtenerEmailPorNombre_(nombreNinera);
    if (!emailNinera) return;

    enviarNotificacionNuevoServicio_(emailNinera, {
        cliente,
        fecha: fechaServicio
    });
}


function obtenerEmailPorNombre_(nombreNinera) {
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const data = sh.getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));

    const idxNombre = headers.indexOf('nombre');
    const idxEmail = headers.indexOf('email');

    if (idxNombre === -1 || idxEmail === -1) return '';

    for (let i = 1; i < data.length; i++) {
        if (_norm(data[i][idxNombre]) === _norm(nombreNinera)) {
            return String(data[i][idxEmail]).trim().toLowerCase();
        }
    }
    return '';
}

function enviarNotificacionNuevoServicio_(emailNinera, info) {

    const sh = _hoja('PushSubscriptions');
    const data = sh.getDataRange().getValues();

    const headers = data.shift();
    const idxEmail = headers.indexOf('email');
    const idxEndpoint = headers.indexOf('endpoint');
    const idxP256dh = headers.indexOf('p256dh');
    const idxAuth = headers.indexOf('auth');

    data.forEach(r => {
        if (String(r[idxEmail]).toLowerCase() !== emailNinera.toLowerCase()) return;

        const payload = {
            subscription: {
                endpoint: r[idxEndpoint],
                keys: {
                    p256dh: r[idxP256dh],
                    auth: r[idxAuth]
                }
            },
            title: 'Nuevo servicio asignado ðŸ‘¶',
            body: `Nuevo servicio con ${info.cliente}`,
            url: '/nannys-peques-pwa/index.html'
        };

        UrlFetchApp.fetch('https://TU_BACKEND/api/push/send', {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
        });
    });
}


function guardarPushSubscription(email, sub) {
    if (!email || !sub || !sub.endpoint) {
        throw new Error('Datos incompletos para guardar suscripció³n');
    }

    const ss = SpreadsheetApp.getActive();
    const sh = ss.getSheetByName('PushSubscriptions');
    if (!sh) throw new Error('No existe la hoja PushSubscriptions');

    const endpoint = sub.endpoint;
    const p256dh = sub.keys?.p256dh || '';
    const auth = sub.keys?.auth || '';
    const fecha = new Date();

    // Evitar duplicados por endpoint
    const data = sh.getRange(2, 2, sh.getLastRow(), 1).getValues().flat();
    if (data.includes(endpoint)) {
        return 'Ya estaba registrada';
    }

    sh.appendRow([
        email,
        endpoint,
        p256dh,
        auth,
        fecha
    ]);

    return 'Suscripció³n guardada correctamente';
}


function guardarPushSubscription(data) {
    const sh = SpreadsheetApp
        .getActive()
        .getSheetByName('PushSubscriptions');

    if (!sh) throw new Error('Hoja PushSubscriptions no existe');

    const email = data.email;
    const sub = data.subscription;

    if (!email || !sub || !sub.endpoint) {
        throw new Error('Datos incompletos');
    }

    sh.appendRow([
        email,
        sub.endpoint,
        sub.keys.p256dh,
        sub.keys.auth,
        new Date()
    ]);

    return { ok: true };
}



function enviarPushPrueba(email) {
    const sh = SpreadsheetApp.getActive()
        .getSheetByName('PushSubscriptions');

    const rows = sh.getDataRange().getValues();
    const headers = rows.shift();

    const idxEmail = headers.indexOf('email');
    const idxEndpoint = headers.indexOf('endpoint');
    const idxP256 = headers.indexOf('p256dh');
    const idxAuth = headers.indexOf('auth');

    const row = rows.find(r => r[idxEmail] === email);
    if (!row) throw new Error('No hay suscripció³n para ese email');

    const subscription = {
        endpoint: row[idxEndpoint],
        keys: {
            p256dh: row[idxP256],
            auth: row[idxAuth]
        }
    };

    const payload = JSON.stringify({
        title: 'ðŸ¼ Nannys y Peques',
        body: 'Tienes un nuevo servicio asignado',
        url: 'https://app.nannysypeques.com.mx'
    });

    // ðŸ”‘ VAPID (USA LAS MISMAS QUE YA GENERASTE)
    const VAPID_PUBLIC = 'BAALWaRIxKUyY4J0qKwy0CV1AJKtsloQZHcPzZzHLqF3GQOf8HzLEbe6gYJsgr1BEW0OGbwjfE6QR6twPW27Ghk';
    const VAPID_PRIVATE = 'JPLuyDryD_QHus7kN78fDIMk8fbIBVotPIJGs1dKtKA';

    const options = {
        vapidDetails: {
            subject: 'mailto:nannysypeques@gmail.com',
            publicKey: VAPID_PUBLIC,
            privateKey: VAPID_PRIVATE
        }
    };

    // web-push en Apps Script
    const response = WebPush.sendNotification(subscription, payload, options);

    return response;
}

/** =========================
 *  CLIENTES SPECIFIC FUNCTIONS
 *  ========================= */

function validarRegistroCliente(email) {
    email = String(email || '').trim().toLowerCase();
    const shS = _hoja(NOMBRE_HOJA_SERVICIOS);
    const filaS = _buscarFilaPorValor(shS, 'email', email);
    if (filaS === -1) return false;
    return true;
}

function updatePerfilCliente(email, payload) {
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const filaC = _buscarFilaPorValor(shC, 'email', email);
    if (filaC === -1) throw new Error('Cliente no registrado');

    // Mapear campos de payload a columnas
    const fields = {
        'nombre completo': payload.nombre_completo,
        'Rol': payload.rol,
        'rol': payload.rol,
        'direccion': payload.direccion,
        'ubicación': payload.ubicacion,
        'teléfono': payload.telefono,
        'No. de emergencia': payload.emergencia,
        'no. de mascotas': payload.mascotas,
        'Políticas de contratación': payload.politicas_aceptadas || '',
        'Fecha de edición información de peque': _nowHuman(),

        // Peque 1
        'nombre del peque': payload.peque_nombre,
        'Fecha de nacimiento': payload.peque_nacimiento,
        'Alergias': payload.alergias,
        'Condición médica o especificaciones adicionales': payload.condicion,
        'Estado de salud actual': payload.salud,
        'Preferencias o actividades favoritas': payload.preferencias,

        // Peque 2
        'Nombre del peque 2': payload.peque_nombre_2,
        'Fecha de nacimiento 2': payload.peque_nac_2,
        'Alergias 2': payload.alergias_2,
        'Condición médica o especificaciones adicionales 2': payload.condicion_2,
        'Estado de salud actual 2': payload.salud_2,
        'Preferencias o actividades favoritas 2': payload.preferencias_2,

        // Peque 3
        'Nombre del peque 3': payload.peque_nombre_3,
        'Fecha de nacimiento 3': payload.peque_nac_3,
        'Alergias 3': payload.alergias_3,
        'Condición médica o especificaciones adicionales 3': payload.condicion_3,
        'Estado de salud actual 3': payload.salud_3,
        'Preferencias o actividades favoritas 3': payload.preferencias_3,

        'actualizado': _ahoraISO()
    };

    _escribirObjeto(shC, filaC, fields);
    return { ok: true };
}

function getPerfilCliente(email) {
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const filaC = _buscarFilaPorValor(shC, 'email', email);
    if (filaC === -1) return {};

    // Obtenemos los nombres de las columnas
    const headers = shC.getRange(1, 1, 1, shC.getLastColumn()).getValues()[0];
    const values = shC.getRange(filaC, 1, 1, shC.getLastColumn()).getValues()[0];

    const obj = {};
    headers.forEach((h, i) => {
        if (h) {
            let key = h.toLowerCase().replace(/\s+/g, '_');
            if (h === 'nombre completo') key = 'nombre'; // para compatibilidad con header-saludo
            obj[key] = values[i];
        }
    });

    return obj;
}

function getServiciosCliente(email, fechaInicio) {
    email = String(email || '').trim().toLowerCase();

    // Leer ambas hojas para cubrir servicios actuales y de la pró³xima semana
    const todos = _leerServiciosDesdeHojas_([
        'Servicios',
        'Servicios_Siguiente_semana'
    ]);

    let hoyISO;
    if (fechaInicio) {
        // Validar formato YYYY-MM-DD simple
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(fechaInicio))) {
            hoyISO = String(fechaInicio);
        } else {
            hoyISO = _toISODate(new Date());
        }
    } else {
        hoyISO = _toISODate(new Date());
    }

    // Obtener datos del cliente para fallback completo
    const shClientes = _hoja(NOMBRE_HOJA_CLIENTES);
    const dataClientes = shClientes.getDataRange().getValues();
    const headersC = dataClientes[0].map(h => _norm(h));

    // Crear objeto con datos del cliente para fallback
    let clienteData = null;

    // Buscar datos del cliente
    for (let i = 1; i < dataClientes.length; i++) {
        if (String(dataClientes[i][headersC.indexOf('email')] || '').trim().toLowerCase() === email) {
            // Construir objeto con todos los datos del cliente
            clienteData = {};
            headersC.forEach((header, idx) => {
                clienteData[header] = String(dataClientes[i][idx] || '').trim();
            });
            break;
        }
    }

    return todos.filter(s => {
        // Filtro por email
        if (String(s.email || '').toLowerCase() !== email) return false;
        // Filtro por fecha (solo hoy en adelante para el portal familia)
        return s.fecha >= hoyISO;
    }).map(s => {
        // Aplicar ló³gica de fallback para todos los campos
        const direccionServicio = String(s.direccion || '').trim();
        const ubicacionServicio = String(s.ubicacion_link || '').trim();
        const contactoServicio = String(s.numero_de_contacto || '').trim();
        const emergenciaServicio = String(s.numero_de_emergencia || '').trim();
        const edadServicio = String(s.edad_nino || '').trim();
        const notasServicio = String(s.notas || '').trim();

        // Valores finales con fallback
        const direccionFinal = direccionServicio || (clienteData ? clienteData.direccion : '') || '€”';
        const ubicacionFinal = ubicacionServicio || (clienteData ? clienteData.ubicacion : '') || '';
        const contactoFinal = contactoServicio || (clienteData ? clienteData.telefono : '') || '€”';
        const emergenciaFinal = emergenciaServicio || (clienteData ? clienteData.no_de_emergencia : '') || '€”';
        const edadFinal = edadServicio || (clienteData ? clienteData.edad_del_peque : '') || '€”';
        const notasFinal = notasServicio || (clienteData ? _construirNotasDesdeCliente(clienteData) : '') || '—';

        // Mapear al formato que espera el frontend del cliente (PascalCase y nombres específicos)
        return {
            ...s,
            'Fecha': s.fecha,
            'Horario': (s.hora_inicio && s.hora_fin) ? `${s.hora_inicio} – ${s.hora_fin}` : 'Pendiente',
            'Nombre de la niñera': s.nombre_ninera || 'Por asignar',
            'Estado': s.estado || 'Programado',
            'Direccion': direccionFinal,
            'Ubicacion': ubicacionFinal,
            'Contacto': contactoFinal,
            'Emergencia': emergenciaFinal,
            'Edad del niño': edadFinal,
            'Notas': notasFinal
        };
    }).sort((a, b) => (a.fecha + ' ' + a.hora_inicio).localeCompare(b.fecha + ' ' + b.hora_inicio));
}

// -----------------------------------------
// -----------------------------------------
function obtenerPerfilCompleto(email) {
    email = String(email || '').trim().toLowerCase();

    // 1. Intentar PRIMERO en Usuarios (Staff/Nannies)
    const shU = _hoja(NOMBRE_HOJA_USUARIOS);
    const filaU = _buscarFilaPorValor(shU, 'email', email);

    if (filaU !== -1) {
        const headersU = shU.getRange(1, 1, 1, shU.getLastColumn()).getValues()[0].map(h => _norm(h));
        const valuesU = shU.getRange(filaU, 1, 1, shU.getLastColumn()).getValues()[0];

        const getStaffVal = (aliases) => {
            if (typeof aliases === 'string') aliases = [aliases];
            for (let a of aliases) {
                const idx = headersU.indexOf(_norm(a));
                if (idx >= 0) return valuesU[idx];
            }
            return '';
        };

        return {
            isNanny: true,
            email: email,
            nombre: getStaffVal('nombre'),
            telefono: getStaffVal(['teléfono', 'telefono']),
            direccion: getStaffVal(['dirección', 'direccion', 'direccion base']),
            ubicacion: getStaffVal(['ubicación', 'ubicacion']),
            emergencia: getStaffVal(['no. de emergencia', 'no. emergencia', 'emergencia']),
            imagen: getStaffVal('imagen')
        };
    }

    // 2. Si no es staff, buscar en Clientes
    return getPerfilCliente(email);
}

function updatePerfilNinera(email, payload) {
    email = String(email || '').trim().toLowerCase();
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const fila = _buscarFilaPorValor(sh, 'email', email);

    if (fila === -1) throw new Error('Usuario no encontrado');

    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => _norm(h));

    const setVal = (colNamesArray, val) => {
        for (let colName of colNamesArray) {
            let idx = headers.indexOf(_norm(colName));
            if (idx !== -1) {
                sh.getRange(fila, idx + 1).setValue(val);
                return true;
            }
        }
        return false;
    };

    if (payload.telefono) setVal(['teléfono', 'telefono'], payload.telefono);
    if (payload.direccion) setVal(['dirección', 'direccion'], payload.direccion);
    if (payload.ubicacion) setVal(['ubicación', 'ubicacion'], payload.ubicacion);
    if (payload.emergencia) setVal(['no. de emergencia', 'no. emergencia', 'emergencia'], payload.emergencia);

    return { ok: true };
}




function startMonday(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay(); const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff); d.setHours(0, 0, 0, 0);
    return d;
}

function getActividadesClientePlanificadas(email) {
    if (!email) throw new Error('Acceso denegado: falta email');
    email = email.toLowerCase().trim();

    const shPlaneaciones = _hoja('Planeaciones_Neuronanny');
    const dataRows = shPlaneaciones.getDataRange().getValues();
    if (dataRows.length < 2) return { actual: [], siguiente: [] };

    // 1. Obtener nombres válidos para este cliente (email y nombre real desde el perfil)
    const nombresValidParaFiltrar = [email];
    try {
        const perf = obtenerPerfilCompleto(email);
        if (perf && perf.nombre) {
            const n = _norm(perf.nombre);
            if (n && !nombresValidParaFiltrar.includes(n)) nombresValidParaFiltrar.push(n);
        }
    } catch (e) { }

    // 2. Normalizar encabezados
    const headers = dataRows[0].map(h => _norm(h));

    // 3. Procesar filas
    const hoy = new Date();
    const l_actual = startMonday(hoy);
    const l_siguiente = new Date(l_actual);
    l_siguiente.setDate(l_siguiente.getDate() + 7);

    const isoStrActual = _toISODate(l_actual);
    const isoStrSiguiente = _toISODate(l_siguiente);
    const isoStrSiguienteFin = _toISODate(new Date(l_siguiente.getTime() + 6 * 24 * 60 * 60 * 1000));
    const isoStrActualFin = _toISODate(new Date(l_actual.getTime() + 6 * 24 * 60 * 60 * 1000));

    const result = { actual: [], siguiente: [] };

    for (let i = 1; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowObj = {};
        headers.forEach((h, idx) => {
            rowObj[h] = row[idx];
        });

        // Filtrar por cliente
        const pCliente = _norm(rowObj['cliente']);
        const coincide = nombresValidParaFiltrar.some(name =>
            pCliente === name || pCliente.includes(name) || name.includes(pCliente)
        );

        if (!coincide) continue;

        const f = _toISODate(rowObj['fecha']);
        if (!f) continue;

        if (f >= isoStrActual && f <= isoStrActualFin) {
            result.actual.push(rowObj);
        } else if (f >= isoStrSiguiente && f <= isoStrSiguienteFin) {
            result.siguiente.push(rowObj);
        }
    }

    return result;
}

/** =========================
 *  SECURITY SUITE: OTP, AUDIT, COMPLIANCE
 *  ========================= */

function _sha256Salted(text) {
    if (!text) return '';
    const saltedInput = GLOBAL_SALT + text;
    const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, saltedInput, Utilities.Charset.UTF_8);
    return raw.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function _auditLog(email, accion, detalles) {
    try {
        const ss = SpreadsheetApp.getActive();
        let sh = ss.getSheetByName('Logs_Seguridad');
        if (!sh) {
            sh = ss.insertSheet('Logs_Seguridad');
            sh.appendRow(['FechaISO', 'Email', 'Accion', 'Detalles']);
            sh.hideSheet();
        }
        sh.appendRow([_ahoraISO(), email, accion, JSON.stringify(detalles || {})]);
    } catch (e) { console.error('Error AuditLog:', e); }
}

function _verificarRateLimitLogin(email) {
    if (!email) return;
    const cache = CacheService.getScriptCache();
    const key = 'LOGIN_FAIL_' + email;
    const failedCount = Number(cache.get(key) || 0);
    if (failedCount >= 5) {
        _enviarAlertaSeguridad('⚠️ ALERTA: ATAQUE FUERZA BRUTA', `Se bloqueó temporalmente la cuenta: ${email} tras 5 intentos fallidos.`);
        throw new Error('Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta en 15 min.');
    }
}

function _registrarIntentoFallidoLogin(email) {
    if (!email) return;
    const cache = CacheService.getScriptCache();
    const key = 'LOGIN_FAIL_' + email;
    const failedCount = Number(cache.get(key) || 0) + 1;
    cache.put(key, String(failedCount), 900);
}

function _limpiarIntentosLogin(email) {
    CacheService.getScriptCache().remove('LOGIN_FAIL_' + email);
}

function _enforceRole(email, requiredRole) {
    if (!requiredRole) return;
    const isAdmin = esAdmin(email);
    if (requiredRole === 'admin' && !isAdmin) throw new Error('Acceso denegado: Se requiere administrador.');
    if (isAdmin) return; // Si es admin, tiene acceso a todo

    if (requiredRole === 'supervision' && !esSupervision(email)) {
        throw new Error('Acceso denegado: Rol supervisión requerido.');
    }
    if (requiredRole === 'ninera' && !_estaAutorizado(email)) {
        throw new Error('Acceso denegado: No autorizado.');
    }
    if (requiredRole === 'cliente' && !esCliente(email)) {
        throw new Error('Acceso denegado: Rol cliente requerido.');
    }
}

function solicitarOTPRegistro(email) {
    email = String(email || '').trim().toLowerCase();
    if (!email) throw new Error('Email requerido');
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    if (_buscarFilaPorValor(shC, 'email', email) !== -1) throw new Error('Este correo ya está registrado.');
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const cacheKey = 'OTP_REG_' + email;
    CacheService.getScriptCache().put(cacheKey, otp, 900);
    if (_enVentanaDeBloqueo(email)) throw new Error('Ya enviamos un código recientemente.');
    _marcarEnvioOTP(email);
    _verificarCuotaOTP();
    MailApp.sendEmail({
        to: email,
        subject: 'Código de registro – Nannys y Peques',
        htmlBody: `
            <div style="font-family: sans-serif; color: #333;">
                <h2>Bienvenida a Nannys y Peques</h2>
                <p>Tu código es:</p><h1 style="color: #e84c9a;">${otp}</h1>
            </div>`
    });
    return { ok: true, restante: MailApp.getRemainingDailyQuota() };
}

function confirmarRegistroCliente(email, otp, password, fingerprint) {
    email = String(email || '').trim().toLowerCase();
    otp = String(otp || '').trim();
    if (!email || !otp || !password) throw new Error('Faltan datos');
    const cacheKey = 'OTP_REG_' + email;
    const otpGuardado = CacheService.getScriptCache().get(cacheKey);
    if (!otpGuardado || otp !== otpGuardado) throw new Error('Código inválido o expirado.');
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const headers = shC.getRange(1, 1, 1, shC.getLastColumn()).getValues()[0];
    const newRow = new Array(headers.length).fill('');
    const idxEmail = _idxCol(shC, 'email');
    const idxPass = _idxCol(shC, 'pass_hash');
    const idxCreado = _idxCol(shC, 'creado');
    const idxActivo = _idxCol(shC, 'activo');
    if (idxEmail > 0) newRow[idxEmail - 1] = email;
    if (idxPass > 0) newRow[idxPass - 1] = _sha256Salted(password);
    if (idxCreado > 0) newRow[idxCreado - 1] = _ahoraISO();
    if (idxActivo > 0) newRow[idxActivo - 1] = true;
    shC.appendRow(newRow);
    CacheService.getScriptCache().remove(cacheKey);
    _auditLog(email, 'REGISTER_SUCCESS', { rol: 'cliente' });
    const token = _generarToken(email, fingerprint);
    return { ok: true, token: token, email: email, nombre: 'Nuevo Usuario', cliente: true };
}

function eliminarCuenta(email) {
    email = String(email || '').trim().toLowerCase();
    if (!email) throw new Error('Email requerido');
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const filaC = _buscarFilaPorValor(shC, 'email', email);
    if (filaC !== -1) {
        const h = shC.getRange(1, 1, 1, shC.getLastColumn()).getValues()[0].map(x => _norm(x));
        const idxEmail = h.indexOf('email');
        const idxPass = h.indexOf('pass_hash');
        if (idxEmail >= 0) shC.getRange(filaC, idxEmail + 1).setValue(`DELETED_${Math.floor(Math.random() * 99999)}`);
        if (idxPass >= 0) shC.getRange(filaC, idxPass + 1).setValue('DELETED');
        _auditLog(email, 'ACCOUNT_DELETED', {});
        return { ok: true };
    }
    throw new Error('Cuenta no encontrada.');
}

function _doLogout(token) {
    if (token) CacheService.getScriptCache().remove(token);
    return { ok: true };
}


/**
 * EJECUTA ESTA FUNCIÓN UNA SOLA VEZ DESDE EL EDITOR para guardar las llaves maestras en la bóveda oculta.
 * Luego de correrla, el código podrá usar las llaves sin que estén escritas aquí.
 */
function setupSecurityVault() {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('API_INTEGRITY_KEY', 'NYP_PWA_SIGN_2025_#PqZ2');
    props.setProperty('GLOBAL_SALT', 'NYP_SECURE_SALT_v1_2025_#9Xz!');

    console.log('✅ Bóveda de Seguridad configurada con éxito.');
}

/**
 * Filtro Sanitizador Global: Limpia cualquier entrada de datos para prevenir XSS o Inyección.
 */
function _sanitizePayload(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            // Eliminar etiquetas <script>, HTML y caracteres peligrosos
            obj[key] = obj[key]
                .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                .replace(/<[^>]*>?/gm, "") // Strip HTML
                .trim();
        } else if (typeof obj[key] === 'object') {
            _sanitizePayload(obj[key]); // Recursión para objetos anidados
        }
    }
    return obj;
}

/**
 * Envía una notificación crítica a los administradores.
 */
function _enviarAlertaSeguridad(asunto, cuerpo) {
    try {
        const fullCuerpo = `ALERTA DE SEGURIDAD - NANNYS Y PEQUES\n\nFecha: ${_nowHuman()}\nEvento: ${asunto}\n\nDetalles:\n${cuerpo}\n\n-- Sistema de Vigilancia Automático --`;
        MailApp.sendEmail({
            to: ADMIN_EMAILS.join(','),
            subject: '🛑 SEGURIDAD: ' + asunto,
            body: fullCuerpo
        });
    } catch (e) { console.error('Error enviando alerta:', e); }
}

/* =========================================
 *  LÓGICA RESTAURADA DE PLANEACIONES (SUPERVISIÓN)
 *  ========================= */

const NOMBRE_HOJA_PLANEACIONES = 'Planeaciones';

function _getPlaneacionesSheet() {
    let sh = _ss().getSheetByName(NOMBRE_HOJA_PLANEACIONES);
    if (!sh) {
        // Si no existe, crearla con headers por defecto
        sh = _ss().insertSheet(NOMBRE_HOJA_PLANEACIONES);
        sh.appendRow([
            'Fecha', 'Cliente', 'Nombre Ninera', 'Edad Nino', 'Ciudad',
            'Area Desarrollo', 'Objetivo', 'Descripcion', 'Materiales', 'Imagen',
            'Observaciones Supervision', 'Estado Revision', 'Fecha Revision', 'Fecha Correccion',
            'Creado', 'Actualizado', 'Tipo Servicio', 'Fila'
        ]);
    }
    return sh;
}

function obtenerResumenPlaneacionesSemana(fechaBase, email, tipo) {
    if (!fechaBase) return esSupervision(email) ? {} : [];

    // 1. Definir rango de la semana de forma segura
    const parts = fechaBase.split('-').map(Number);
    // Crear fecha local (00:00:00)
    let d = new Date(parts[0], parts[1] - 1, parts[2]);

    // Ajustar al lunes de esa semana
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6 : 1);
    const lunes = new Date(d);
    lunes.setDate(diff);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const desdeISO = Utilities.formatDate(lunes, ZONA_HORARIA, 'yyyy-MM-dd');
    const hastaISO = Utilities.formatDate(domingo, ZONA_HORARIA, 'yyyy-MM-dd');

    // 2. Obtener Servicios en ese rango
    const shS = _hoja(NOMBRE_HOJA_SERVICIOS);
    const serviciosRaw = _leerComoObjetos(shS);

    const servicios = serviciosRaw.filter(s => {
        const f = _toISODate(s.Fecha || s.fecha);
        if (!f) return false;
        if (f < desdeISO || f > hastaISO) return false;

        let v = s.ver;
        if (v === undefined || v === '') return true;
        return _esVerdadero(v);
    });

    // 3. Obtener Planeaciones existentes
    const shP = _getPlaneacionesSheet();
    const planeacionesRaw = _leerComoObjetos(shP);

    const mapaPlaneaciones = {};
    planeacionesRaw.forEach((p, idx) => {
        const f = _toISODate(p.Fecha || p.fecha);
        if (f < desdeISO || f > hastaISO) return;

        // Robustez en nombres de columnas
        const clienteNom = p.Cliente || p.cliente || '';
        const nineraNom = p['Nombre Ninera'] || p.nombre_ninera || p['Nombre de la niñera'] || p.ninera || '';

        const key = `${f}|${_norm(clienteNom)}|${_norm(nineraNom)}`;
        p.fila = idx + 2;
        mapaPlaneaciones[key] = p;
    });

    // 4. Cruzar datos
    const esSuper = esSupervision(email) || esAdmin(email);
    const grouped = {};
    const listaFinal = [];
    const miNombre = esSuper ? '' : _nombrePorEmail(email);

    servicios.forEach(s => {
        const tipoServicio = _norm(s['Tipo de servicio'] || s['Tipo Servicio'] || s.tipo_servicio || '');
        const requierePlan = ['neuronanny', 'nanny educativa', 'miss nanny'].some(t => tipoServicio.includes(t));

        if (!requierePlan) return;

        const cliente = s.Cliente || s.cliente || '';
        const ninera = s['Nombre de la niñera'] || s.nombre_ninera || '';
        const fecha = _toISODate(s.Fecha || s.fecha);
        const ciudad = s.Ciudad || s.ciudad || 'Pendiente';

        if (!esSuper && _norm(ninera) !== _norm(miNombre)) return;

        const key = `${fecha}|${_norm(cliente)}|${_norm(ninera)}`;
        const plan = mapaPlaneaciones[key];

        const getVal = (obj, keys) => {
            if (!obj) return '';
            for (const k of keys) {
                if (obj[k] !== undefined && obj[k] !== '') return obj[k];
            }
            return '';
        };

        const item = {
            cliente: cliente,
            ninera: ninera,
            fecha: fecha,
            tipo_servicio: tipoServicio,
            ciudad: ciudad,
            tienePlaneacion: !!plan,
            estado_revision: getVal(plan, ['Estado Revision', 'estado_revision', 'estado']) || 'pendiente',
            observaciones_supervision: getVal(plan, ['Observaciones Supervision', 'observaciones_supervision']),
            fecha_revision: getVal(plan, ['Fecha Revision', 'fecha_revision']),
            fecha_correccion: getVal(plan, ['Fecha Correccion', 'fecha_correccion']),
            fila: plan ? plan.fila : null,
            area_desarrollo: getVal(plan, ['Area Desarrollo', 'area_desarrollo']),
            objetivo: getVal(plan, ['Objetivo', 'objetivo']),
            descripcion: getVal(plan, ['Descripcion', 'descripcion']),
            materiales: getVal(plan, ['Materiales', 'materiales']),
            imagen: getVal(plan, ['Imagen', 'imagen'])
        };

        if (esSuper) {
            if (!grouped[ciudad]) grouped[ciudad] = [];
            grouped[ciudad].push(item);
        } else {
            listaFinal.push(item);
        }
    });

    if (esSuper) {
        const result = {};
        Object.keys(grouped).forEach(ciudad => {
            const items = grouped[ciudad];
            const mapUnique = {};
            items.forEach(it => {
                const k = `${it.cliente}|${it.ninera}`;
                if (!mapUnique[k]) {
                    mapUnique[k] = { ...it, fechas: [], dias: [] };
                    mapUnique[k].tienePlaneacion = false;
                    mapUnique[k].estado_revision = 'pendiente';
                }

                mapUnique[k].fechas.push(it.fecha);
                mapUnique[k].dias.push(it.fecha);

                if (it.tienePlaneacion) {
                    mapUnique[k].tienePlaneacion = true;
                    mapUnique[k].estado_revision = it.estado_revision;
                }
            });
            result[ciudad] = Object.values(mapUnique);
        });
        return result;
    }

    return listaFinal;
}

function obtenerPlaneacionNeuronanny(payload, email) {
    if (payload.fila) {
        const sh = _getPlaneacionesSheet();
        const data = _leerComoObjetos(sh);
        const p = data[payload.fila - 2];
        if (p) { p.fila = payload.fila; return p; }
    }

    // Por claves
    const sh = _getPlaneacionesSheet();
    const objs = _leerComoObjetos(sh);
    const targetFecha = _toISODate(payload.fecha);

    const found = objs.find(o =>
        _norm(o.Cliente || o.cliente) === _norm(payload.cliente) &&
        _norm(o['Nombre Ninera'] || o.nombre_ninera) === _norm(payload.nombre_ninera || payload.ninera) &&
        _toISODate(o.Fecha || o.fecha) === targetFecha
    );

    if (found) {
        const row = objs.indexOf(found) + 2;
        found.fila = row;
        // Normalizar para frontend
        found.area_desarrollo = found['Area Desarrollo'];
        found.objetivo = found['Objetivo'];
        found.descripcion = found['Descripcion'];
        found.materiales = found['Materiales'];
        found.imagen = found['Imagen'];
        found.observaciones_supervision = found['Observaciones Supervision'];
        found.estado_revision = found['Estado Revision'];
        found.fecha_revision = found['Fecha Revision'];
        found.fecha_correccion = found['Fecha Correccion'];
        return found;
    }
    return null;
}


