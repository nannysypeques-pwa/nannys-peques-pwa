function doPost(e) {
    try {
        let action = '';
        let payload = {};

        // 1️⃣ LEER BODY
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

        // Email del ejecutor (generalmente viene en el payload desde la PWA)
        // En funciones admin, esto valida permisos.
        const email = String(payload.email || '').trim().toLowerCase();

        let result;

        switch (action) {
            // --- AUTH ---
            case 'login':
                result = login(email, payload.contrasena || payload.pass);
                break;
            case 'solicitarOTP':
                result = solicitarOTP(email);
                break;
            case 'establecerContrasena':
                result = establecerContrasena(email, payload.otp, payload.nueva);
                break;
            case 'getProfile':
                result = obtenerPerfilCompleto(email);
                break;
            case 'updatePerfilCliente':
                result = updatePerfilCliente(email, payload);
                break;
            case 'validarRegistroCliente':
                result = validarRegistroCliente(email);
                break;

            // --- SERVICIOS NIÑERA ---
            case 'getServiciosNinera':
                result = obtenerServiciosProximosPorNombre(email, payload.dias || 14);
                break;
            case 'confirmarServicioPorFila':
                result = confirmarServicioPorFila(payload.sheet, payload.row_base, email);
                break;
            case 'registrarInicioServicio':
                result = registrarInicioServicio(payload.sheet, payload.row_base, payload.fecha, email);
                break;
            case 'registrarFinServicio':
                result = registrarFinServicio(payload.sheet, payload.row_base, payload.fecha, email);
                break;
            case 'getServiciosCliente':
                result = getServiciosCliente(email);
                break;

            // --- DISPONIBILIDAD ---
            case 'obtenerDisponibilidad':
                result = obtenerDisponibilidad(email, payload.fechaISO);
                break;
            case 'guardarDisponibilidad':
                result = guardarDisponibilidad(email, payload);
                break;
            case 'obtenerDisponiblesSemana':
                result = obtenerDisponiblesSemana(email, payload.baseISO);
                break;

            // --- PLANEACIONES (NEURONANNY) ---
            case 'getResumenPlaneacionesSemana':
                result = obtenerResumenPlaneacionesSemana(payload.fechaBase, email);
                break;
            case 'obtenerPlaneacionNeuronanny':
                result = obtenerPlaneacionNeuronanny(payload, email);
                break;
            case 'guardarPlaneacionNeuronanny':
                result = guardarPlaneacionNeuronanny(payload, email);
                break;
            case 'editarPlaneacionNeuronanny':
                result = editarPlaneacionNeuronanny(payload, email);
                break;
            case 'reenviarPlaneacionCorregida':
                result = reenviarPlaneacionCorregida(payload, email);
                break;

            // --- SUPERVISIÓN ---
            case 'guardarObservacionesSupervision':
                result = guardarObservacionesSupervision(payload, email);
                break;

            // --- ADMIN ---
            case 'obtenerResumenDisponibilidadSemanaActual':
                // Admin function usually checks email internally or we check here
                if (!esAdmin(email)) throw new Error('No autorizado');
                result = obtenerResumenDisponibilidadSemanaActual();
                break;
            case 'apiSugerirNinerasServicio':
                // Validation inside function
                result = apiSugerirNinerasServicio(payload, email);
                break;
            case 'obtenerServiciosAdminRango':
                // payload: { desde, hasta }
                if (!esAdmin(email)) throw new Error('No autorizado');
                result = obtenerServiciosAdminRango(payload.desde, payload.hasta);
                break;
            case 'obtenerListaNineras':
                if (!esAdmin(email)) throw new Error('No autorizado');
                result = obtenerListaNineras();
                break;

            // --- PUNTOS ---
            case 'obtenerPuntajePorNombre':
                // Puede verlo la propia niñera o admin
                result = obtenerPuntajePorNombre(payload.nombre || SESION.nombre); // Frontend should send nombre
                break;
            case 'registrarPuntosManual':
                if (!esAdmin(email)) throw new Error('No autorizado');
                result = registrarPuntosManual(payload.nombre, payload.tipo);
                break;

            // --- PUSH ---
            case 'guardarPushSubscription':
                result = guardarPushSubscription({ email, subscription: payload.subscription });
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
 *  CONFIG
 *  ========================= */
const NOMBRE_HOJA_USUARIOS = 'Usuarios';
const NOMBRE_HOJA_CLIENTES = 'Clientes';
const NOMBRE_HOJA_DISPONIBILIDAD = 'Disponibilidad';
const NOMBRE_HOJA_SERVICIOS = 'Servicios';
const ZONA_HORARIA = Session.getScriptTimeZone() || 'America/Mexico_City';
const MINUTOS_REENVIO_OTP = 2;
















/** =========================
 *  UTILIDADES
 *  ========================= */
function _ss() { return SpreadsheetApp.getActive(); }
function _hoja(nombre) { const sh = _ss().getSheetByName(nombre); if (!sh) throw new Error('No se encontró la hoja: ' + nombre); return sh; }
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
function _esVerdadero(val) { if (typeof val === 'boolean') return val === true; const s = String(val).trim().toLowerCase(); return s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'yes' || s === 'y'; }
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
            // Si la hoja no existe o está vacía, NO rompemos nada
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
            fechaActualISO = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
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
 *  AUTORIZACIÓN / ROLES / OTP / LOGIN
 *  ========================= */
function _estaAutorizado(email) {
    email = String(email || '').trim().toLowerCase();

    // 1. Revisar si está en hoja Usuarios y activo
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

    // 3. Permitir autorizar nuevos registros de clientes (la lógica de registro manejará la creación)
    // Para que el login no falle antes de dar clic en registrar, permitimos pasar esta fase
    // si el backend lo permite dinámicamente.
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
function _verificarCuotaOTP() { const r = MailApp.getRemainingDailyQuota(); if (r <= 0) throw new Error('Se alcanzó el límite diario de envíos. Intente mañana.'); return r; }












function solicitarOTP(email) {
    email = String(email || '').trim().toLowerCase();
    if (!email) throw new Error('Email requerido');
    if (!_estaAutorizado(email)) throw new Error('Su correo no está autorizado. Contacte a la administración.');
    const lock = LockService.getScriptLock(); if (!lock.tryLock(5000)) throw new Error('Sistema ocupado. Intente de nuevo en unos segundos.');
    try {
        if (_enVentanaDeBloqueo(email)) throw new Error('Ya se envió un código hace poco. Espere unos minutos para solicitar otro.');
        _verificarCuotaOTP();
        const sh = _hoja(NOMBRE_HOJA_USUARIOS); const fila = _buscarFilaPorValor(sh, 'email', email); if (fila === -1) throw new Error('Su correo no está autorizado. Contacte a la administración.');
        const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
        const expira = new Date(Date.now() + 15 * 60 * 1000);
        const expiraStr = Utilities.formatDate(expira, ZONA_HORARIA, "yyyy-MM-dd HH:mm:ss");
        const obj = { email: sh.getRange(fila, 1).getValue(), nombre: sh.getRange(fila, 2).getValue(), pass_hash: sh.getRange(fila, 3).getValue(), otp, otp_expira: expiraStr, creado: sh.getRange(fila, 6).getValue() || _ahoraISO(), actualizado: _ahoraISO(), activo: sh.getRange(fila, 8).getValue() };
        _escribirObjeto(sh, fila, obj);
        _marcarEnvioOTP(email);
        MailApp.sendEmail({ to: email, subject: 'Código de verificación (Nannys y Peques)', htmlBody: '<p>Su código de verificación es: <b>' + otp + '</b><br>Vence en 15 minutos.</p>' });
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












function login(email, contrasena) {
    email = String(email || '').trim().toLowerCase();
    if (!email || !contrasena) throw new Error('Datos incompletos');
    if (!_estaAutorizado(email)) throw new Error('Su correo no está autorizado para iniciar sesión.');
    const sh = _hoja(NOMBRE_HOJA_USUARIOS); const fila = _buscarFilaPorValor(sh, 'email', email); if (fila === -1) throw new Error('Usuario no encontrado');
    const hashGuardado = String(sh.getRange(fila, 3).getValue()).trim();
    if (!hashGuardado) throw new Error('Este usuario no tiene contraseña. Use "Olvidé mi contraseña".');
    const passHash = _sha256(contrasena);
    if (passHash !== hashGuardado) throw new Error('Credenciales inválidas');
    const nombre = sh.getRange(fila, 2).getValue() || '';

    return {
        ok: true,
        email,
        nombre,
        admin: esAdmin(email),
        supervision: esSupervision(email)
    };




}












/** =========================
 *  DISPONIBILIDAD POR TURNOS (Matutino/Vespertino)
 *  ========================= */
const TURNOS = [
    { key: 'Matutino', ini: '07:00', fin: '15:00' },
    { key: 'Vespertino', ini: '15:00', fin: '22:00' }
];








function _asegurarEstructuraTurnos(sh) {
    // Crea encabezados: nombre de niñera | fecha | día | Matutino | Vespertino
    if (sh.getLastRow() === 0 || sh.getLastColumn() < 3) {
        sh.clear();
        sh.getRange(1, 1, 1, 5).setValues([['nombre de niñera', 'fecha', 'día', 'Matutino', 'Vespertino']]);
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
    // para evitar que al ajustar zona horaria se recorra al día anterior.
    let base;
    if (baseFechaISO) {
        // Forzamos hora media (mediodía) para evitar saltos por huso horario
        base = new Date(baseFechaISO + 'T12:00:00');
    } else {
        // Hoy pero “sin hora”
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
    const nombres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];








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


        // Solo semana actual (Lun–Dom)
        if (fechasSemana.indexOf(fecha) === -1) continue;


        const cliente = String(data[i][idxCliente] || '').trim();
        if (!cliente) continue;


        // ✅ CLAVE NORMALIZADA (acentos, dobles espacios, mayúsculas)
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
 *  SERVICIOS por NOMBRE + CONFIRMACIÓN (con timestamp)
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
        sh.getRange(1, col2).setValue('fecha y hora de confirmación');
        idxConfirm = col2 - 1;
    }
    return { idxEstado: idxEstado + 1, idxConfirm: idxConfirm + 1 };
}
















function _telefonoPorEmail(email) {
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const fila = _buscarFilaPorValor(sh, 'email', email);
    if (fila === -1) return '';








    // IMPORTANTE: debe coincidir con el encabezado EXACTO "teléfono"
    const idxTel = _idxCol(sh, 'teléfono');
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


























function obtenerPerfilCompleto(email) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');








    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const fila = _buscarFilaPorValor(sh, 'email', email);
    if (fila === -1) throw new Error('Usuario no encontrado.');








    const headers = sh.getRange(1, 1, 1, sh.getLastColumn())
        .getDisplayValues()[0]
        .map(h => _norm(h));








    const idxNombre = headers.indexOf('nombre') + 1;
    const idxEmail = headers.indexOf('email') + 1;
    const idxTelefono = headers.indexOf('telefono') + 1; // teléfono → sin acento








    return {
        nombre: idxNombre > 0 ? String(sh.getRange(fila, idxNombre).getValue() || '').trim() : '',
        email: idxEmail > 0 ? String(sh.getRange(fila, idxEmail).getValue() || '').trim() : email,
        telefono: idxTelefono > 0 ? String(sh.getRange(fila, idxTelefono).getValue() || '').trim() : ''
    };
}


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














function _expandirServiciosSemanales_(sh) {
    const data = sh.getDataRange().getValues();
    if (data.length < 3) return [];




    const fechas = data[0];   // fila 1
    const subhdr = data[1];   // fila 2




    // columnas fijas (cliente, dirección, etc.) en fila 1 (no-fechas)
    const colIdx = {};
    fechas.forEach((h, i) => {
        if (h instanceof Date) return;
        const k = _norm(h);
        if (k) colIdx[k] = i;
    });








    // ✅ ya no tronar: si falta algo, mejor no devolver servicios
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
        const contacto = String(row[colIdx['numero de contacto']] || '').trim();
        const direccion = String(row[colIdx['direccion']] || '').trim();
        const ubicacion = String(row[colIdx['ubicacion (link)']] || '').trim();
        const cuota = colIdx['cuota nanny'] != null ? String(row[colIdx['cuota nanny']] || '').trim() : '';
        const edad = colIdx['edad del nino'] != null ? String(row[colIdx['edad del nino']] || '').trim() : '';
        const notas = colIdx['notas'] != null ? String(row[colIdx['notas']] || '').trim() : '';
        const tipoServicio = colIdx['tipo de servicio'] != null
            ? String(row[colIdx['tipo de servicio']] || '').trim().toLowerCase()
            : '';




        const verServicio = colIdx['ver'] != null ? _esVerdadero(row[colIdx['ver']]) : false;








        // 🔥 ahora iteramos por FECHA usando el mapa
        Object.keys(mapaCols).forEach(fechaISO => {
            const m = mapaCols[fechaISO];
            if (!m || !m.hora_inicio || !m.hora_fin) return;




            const hi = _toHM(row[m.hora_inicio - 1]);
            const hf = _toHM(row[m.hora_fin - 1]);
            if (!hi || !hf) return; // si ese día no tiene horas, no hay servicio ese día
            const estado = (m.estado ? String(row[m.estado - 1] || '').trim().toLowerCase() : 'pendiente') || 'pendiente';
            const confirmadoEn = m.confirmado_en ? String(row[m.confirmado_en - 1] || '').trim() : '';
            const inicioReal = m.inicio_real ? String(row[m.inicio_real - 1] || '').trim() : '';
            const finReal = m.fin_real ? String(row[m.fin_real - 1] || '').trim() : '';








            if (!verServicio) return;








            servicios.push({
                sheet: sh.getName(),   // ✅ clave para escribir después
                row_base: r + 1,       // fila real
                fecha: fechaISO,
                hora_inicio: hi,
                hora_fin: hf,
                cliente,
                numero_contacto: contacto,
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












function obtenerServiciosProximosPorNombre(email, diasAdelante) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');








    const nombreNanny = _nombrePorEmail(email);
    if (!nombreNanny) return [];








    const todos = _leerServiciosDesdeHojas_([
        'Servicios',
        'Servicios_Siguiente_semana'
    ]);




    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + Number(diasAdelante || 14));




    const hoyISO = Utilities.formatDate(hoy, ZONA_HORARIA, 'yyyy-MM-dd');
    const limISO = Utilities.formatDate(limite, ZONA_HORARIA, 'yyyy-MM-dd');




    const out = todos.filter(s =>
        _norm(s.nombre_ninera) === _norm(nombreNanny) &&
        s.fecha >= hoyISO &&
        s.fecha <= limISO
    );




    out.sort((a, b) => (a.fecha + ' ' + a.hora_inicio).localeCompare(b.fecha + ' ' + b.hora_inicio));
    // Detectar empalmes ENTRE LOS SERVICIOS DE LA NIÑERA
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
        throw new Error('Fila inválida.');
    }




    // Validar que el servicio sea de la niñera
    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn())
        .getDisplayValues()[0]
        .map(h => _norm(h));




    const idxNombre = hdrs.indexOf('nombre de ninera') + 1;
    if (idxNombre <= 0) throw new Error('Falta columna "nombre de niñera".');




    const nombreFila = String(sh.getRange(rowNum, idxNombre).getValue() || '').trim();
    const nombreNanny = _nombrePorEmail(email);
    if (_norm(nombreFila) !== _norm(nombreNanny)) {
        throw new Error('No puede confirmar servicios de otra niñera.');
    }




    // 🔥 Usamos el mapa por fecha
    const mapa = _mapaColumnasPorFecha_(sh);
    const ts = _nowHuman();
    let confirmados = 0;
















    Object.keys(mapa).forEach(fechaISO => {
        const m = mapa[fechaISO];
        if (!m) return;








        // Solo confirmar días que SÍ tengan horas
        if (!m.hora_inicio || !m.hora_fin) return;




        const hi = sh.getRange(rowNum, m.hora_inicio).getValue();
        const hf = sh.getRange(rowNum, m.hora_fin).getValue();
        if (!hi || !hf) return; // ese día no hay servicio








        // Escribir estado y confirmación
        if (m.estado) {
            sh.getRange(rowNum, m.estado).setValue('confirmado');
        }
        if (m.confirmado_en) {
            sh.getRange(rowNum, m.confirmado_en).setValue(ts);
        }




        confirmados++;
    });








    if (confirmados === 0) {
        throw new Error('No se encontraron días con servicio para confirmar.');
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
    if (idxNombre <= 0) throw new Error('Falta columna "nombre de niñera".');




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
    if (idxNombre <= 0) throw new Error('Falta columna "nombre de niñera".');




    const nombreFila = String(sh.getRange(Number(row), idxNombre).getValue() || '').trim();
    const nombreNanny = _nombrePorEmail(email);
    if (_norm(nombreFila) !== _norm(nombreNanny)) throw new Error('No tiene permiso para finalizar este servicio.');




    const ts = _nowHuman();
    sh.getRange(Number(row), m.fin_real).setValue(ts);
    sh.getRange(Number(row), m.estado).setValue('Completado');
















    return { ok: true, fin_real: ts };
}
















/** =========================
 *  SELECCIÓN – con TURNOS + no empalmes
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
    // Verifica si [reqIni, reqFin) está contenido en los turnos seleccionados
    const a = _hmToMinutes(reqIni), b = _hmToMinutes(reqFin);
    if (isNaN(a) || isNaN(b) || b <= a) return false;












    const mI = _hmToMinutes('07:00'), mF = _hmToMinutes('15:00');
    const vI = _hmToMinutes('15:00'), vF = _hmToMinutes('22:00');




    // Dentro de uno solo
    if (tieneMat && a >= mI && b <= mF) return true;
    if (tieneVes && a >= vI && b <= vF) return true;
















    // Cruza 15:00 => necesita ambos y estar de 07–22
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
        // 1. Resolver redirección (ej: maps.app.goo.gl)
        const response = UrlFetchApp.fetch(url, { followRedirects: false, muteHttpExceptions: true });
        let longUrl = url;
        if (response.getResponseCode() >= 300 && response.getResponseCode() < 400) {
            const loc = response.getHeaders()['Location'];
            if (loc) longUrl = loc;
        }

        // 2. Buscar patrón @lat,lng
        // Ej: https://www.google.com/maps/place/.../@19.4326,-99.1332,17z...
        // O param ?query=lat,lng
        let m = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (m) return { lat: Number(m[1]), lng: Number(m[2]) };

        // Si no está en el @, buscar query param 'q' o 'll' (menos común en maps nuevos pero posible)
        // Pero lo más fiable para "Share Location" es el @.
        return null;
    } catch (e) {
        return null;
    }
}
function sugerirNinerasServicio(fechaISO, horaInicio, horaFin, ubicacionServicio, edadNino) {
    fechaISO = _toISODate(fechaISO);
    const hi = _toHM(horaInicio), hf = _toHM(horaFin);
    if (!fechaISO || !hi || !hf) throw new Error('Fecha u horario inválidos');
    const edad = Number(edadNino); if (isNaN(edad)) throw new Error('Edad del niño inválida');












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
            candidatos.push({ nombre: n.nombre, email: n.email, cumple_edad: true, disponible: false, distancia_km: null, motivo: `Conflicto con servicio ${emp.estado} ${emp.hi}–${emp.hf}` });
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
    if (!payload) throw new Error('Payload vacío');
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
        throw new Error('No se encontró la columna "nombre" en Usuarios.');
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
    if (!d0 || !d1) throw new Error('Rango inválido');








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
 *   SISTEMA DE PUNTAJES DE NIÑERAS – NANNYS Y PEQUES  *
 *   (basado en nombre de niñera y servicios eventuales)
 *******************************************************/








const HOJA_SERVICIOS = 'Servicios';
const HOJA_PUNTOS_MANUAL = 'PuntosManual';








// Definición de puntos para eventos manuales
const PUNTOS_DEFINICIONES = {
    // POSITIVOS
    'SERVICIO_ULTIMO_MINUTO': {
        puntos: 2,
        descripcion: 'Servicio de último minuto'
    },
    'FAMILIA_REPITE': {
        puntos: 1,
        descripcion: 'La familia pide de nuevo la misma nanny'
    },
    'CAPACITACION_NO_OBLIGATORIA': {
        puntos: 7,
        descripcion: 'Participar en capacitación no obligatoria'
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
 * para una niñera por NOMBRE.
 *
 * Se asume:
 * - Columna "fecha"
 * - Columna "nombre_ninera" (o "niñera"/"nanny")
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
    const iNombre = findIdx(['nombre de niñera', 'niñera', 'nanny']);
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
 * Lee puntos manuales de la hoja PuntosManual para una niñera por NOMBRE.
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
 * Calcula puntos AUTOMÁTICOS por semanas a partir de servicios eventuales
 * y restricciones por castigos manuales.
 *
 * Reglas automáticas:
 *  - En una semana donde la niñera haya cubierto >= 2 servicios COMPLETADOS:
 *       Puntualidad en los servicios: +2
 *       Evaluación positiva del cliente: +2
 *       Reportes puntuales y completos: +3
 *  - Si en esa misma semana cubre >= 3 servicios COMPLETADOS:
 *       Tres servicios seguidos sin cancelación: +2
 *
 * Reglas de castigo que afectan automáticos:
 *  - Si hay un evento manual "FALTA_SERVICIO" en esa semana:
 *       -> No se suman NINGUNOS puntos automáticos de esa semana.
 *  - Si hay un evento manual "REPORTE_NEGATIVO" en esa semana:
 *       -> No se suman los +2 de "Evaluación positiva del cliente".
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
            // No se suman puntos automáticos de esa semana
            ptsPuntualidad = 0;
            ptsEvalPositiva = 0;
            ptsReportes = 0;
            ptsTresSinCancel = 0;
        } else if (hasReporteNegativo) {
            // No se suma la parte de evaluación positiva
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
 * Función principal: calcula el puntaje completo para una niñera por NOMBRE.
 * Devuelve:
 *  {
 *    nombre,
 *    total,            // puntos totales
 *    nivel,            // Pink / Yellow / Blue / Golden Nanny
 *    servicios,        // cantidad de servicios eventuales cubiertos
 *    auto,             // detalle de puntos automáticos
 *    manual,           // detalle de puntos manuales
 *    milestones        // detalle de hitos por cantidad de servicios
 *  }
 */
function obtenerPuntajePorNombre(nombreNinera) {
    nombreNinera = String(nombreNinera || '').trim();
    if (!nombreNinera) throw new Error('Nombre de niñera vacío.');












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
 * Registra un evento de puntos MANUAL para una niñera por NOMBRE.
 * Respeta la tabla de puntos PUNTOS_DEFINICIONES.
 * Devuelve el puntaje recalculado de la niñera.
 *
 * NOTA: las reglas especiales de:
 *  - FALTA_SERVICIO (anula automáticos de la semana),
 *  - REPORTE_NEGATIVO (anula la evaluación positiva automática),
 * se aplican al calcular el total, NO aquí.
 */
function registrarPuntosManual(nombreNinera, tipoId) {
    nombreNinera = String(nombreNinera || '').trim();
    if (!nombreNinera) throw new Error('Debe indicar el nombre de la niñera.');








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
    // 1) Leer usuarios (niñeras) una sola vez
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








    // 2) Calcular las fechas de la semana actual (Lun–Dom)
    const hoyISO = Utilities.formatDate(new Date(), ZONA_HORARIA, 'yyyy-MM-dd');
    const fechasSemana = _diasDeSemana(hoyISO).map(d => d.fecha); // reutiliza función existente




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




function obtenerResumenPlaneacionesSemana(fechaBaseISO, email) {

    const fechasSemana = _diasDeSemana(fechaBaseISO).map(d => d.fecha);

    const servicios = _leerServiciosDesdeHojas_([
        'Servicios',
        'Servicios_Siguiente_semana'
    ]).filter(s =>
        ['neuronanny', 'nanny educativa', 'miss nanny']
            .includes(_norm(s.tipo_servicio)) &&
        fechasSemana.includes(s.fecha)
    );


    const shP = _hoja('Planeaciones_Neuronanny');
    const dataP = shP.getDataRange().getValues();
    const hdrP = dataP[0].map(h => _norm(h));

    const idxFechaP = hdrP.indexOf('fecha');
    const idxClienteP = hdrP.indexOf('cliente');

    // 🔑 columna estado revisión (robusta)
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

        // ⛔ evitar duplicados
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

        // 🔑 estado FINAL que sí entiende el frontend
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
            estado_revision: estadoRevision   // 🔴 ESTE ERA EL PUNTO CLAVE
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

    // 🔒 Validación existente (NO se toca)
    for (let i = 1; i < data.length; i++) {
        const rFecha = _toISODate(data[i][idxFecha]);
        const rCliente = String(data[i][idxCliente] || '').trim();

        if (rFecha === fechaPayload && rCliente === clientePayload) {
            throw new Error('Ya existe una planeación para este cliente en esta fecha.');
        }
    }

    // ====================================================
    // 🔑 ASEGURAR NOMBRE DE NIÑERA (ARREGLO REAL)
    // ====================================================
    let nombreNinera =
        payload.nombre_ninera ||
        payload.nombreNinera ||
        (typeof SESION !== 'undefined' ? SESION.nombre : '') ||
        _nombrePorEmail(email) ||
        '';

    nombreNinera = String(nombreNinera || '').trim();

    // ====================================================
    // ✍️ GUARDADO (MISMO appendRow, SIN ROMPER NADA)
    // ====================================================
    sh.appendRow([
        payload.fecha || '',
        nombreNinera,                 // ✅ AQUÍ YA VA GARANTIZADO
        payload.cliente || '',
        payload.edad_nino || '',
        payload.area_desarrollo || '',
        payload.objetivo || '',
        payload.descripcion || '',
        payload.materiales || '',
        payload.imagen || '',
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
        throw new Error('Datos incompletos para reenviar planeación.');
    }

    const sh = _hoja('Planeaciones_Neuronanny');
    const data = sh.getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));

    // 🔎 Índices por encabezado
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

    // 🔍 Buscar la planeación existente
    for (let i = 1; i < data.length; i++) {
        const f = _toISODate(data[i][idxFecha]);
        const c = String(data[i][idxCliente] || '').trim();

        if (f === fechaISO && c === cliente) {
            fila = i + 1;
            break;
        }
    }

    if (fila === -1) {
        throw new Error('No se encontró la planeación a reenviar.');
    }

    // ✍️ Actualizar datos de la planeación
    if (idxArea >= 0) sh.getRange(fila, idxArea + 1).setValue(payload.area_desarrollo || '');
    if (idxObjetivo >= 0) sh.getRange(fila, idxObjetivo + 1).setValue(payload.objetivo || '');
    if (idxDescripcion >= 0) sh.getRange(fila, idxDescripcion + 1).setValue(payload.descripcion || '');
    if (idxMateriales >= 0) sh.getRange(fila, idxMateriales + 1).setValue(payload.materiales || '');
    if (idxImagen >= 0) sh.getRange(fila, idxImagen + 1).setValue(payload.imagen || '');

    // 🔁 Cambiar estado de revisión → pendiente
    if (idxEstadoRev >= 0) {
        sh.getRange(fila, idxEstadoRev + 1).setValue('pendiente');
    }

    // 🕒 Guardar fecha y hora de corrección
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

    // 🔑 ESTOS SON LOS ENCABEZADOS REALES
    const idxFechaCreacion = headers.indexOf('fecha de creacion');
    const idxFechaCorreccion = headers.indexOf('fecha de correccion');

    for (let i = 1; i < data.length; i++) {
        const rFecha = _toISODate(data[i][idxFecha]);
        const rCliente = String(data[i][idxCliente] || '').trim();

        if (rFecha === payload.fecha && rCliente === payload.cliente) {
            return {
                fila: i + 1,

                // 📋 PLANEACIÓN
                area_desarrollo: data[i][headers.indexOf('area de desarrollo')] || '',
                objetivo: data[i][headers.indexOf('objetivo')] || '',
                descripcion: data[i][headers.indexOf('descripcion')] || '',
                materiales: data[i][headers.indexOf('materiales')] || '',
                imagen: data[i][headers.indexOf('imagen')] || '',

                // 🧸 NIÑERA
                nombre_ninera: idxNinera >= 0
                    ? String(data[i][idxNinera] || '').trim()
                    : '',

                // 🔍 REVISIÓN
                estado_revision: idxEstado >= 0
                    ? String(data[i][idxEstado] || '').trim()
                    : '',

                observaciones_supervision: idxObsSup >= 0
                    ? String(data[i][idxObsSup] || '').trim()
                    : '',

                // 📅 FECHAS (AHORA SÍ EXISTEN)
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
    if (!payload || !payload.fila) throw new Error('Planeación no identificada.');




    const sh = SpreadsheetApp.getActive().getSheetByName('Planeaciones_Neuronanny');
    if (!sh) throw new Error('No existe la hoja Planeaciones_Neuronanny.');




    const fila = Number(payload.fila);
    if (fila < 2 || fila > sh.getLastRow()) {
        throw new Error('Fila inválida.');
    }




    sh.getRange(fila, 5).setValue(payload.area_desarrollo || '');
    sh.getRange(fila, 6).setValue(payload.objetivo || '');
    sh.getRange(fila, 7).setValue(payload.descripcion || '');
    sh.getRange(fila, 8).setValue(payload.materiales || '');
    sh.getRange(fila, 9).setValue(payload.imagen || '');
    sh.getRange(fila, 10).setValue(_nowHuman()); // fecha de actualización




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

    // ---- OBSERVACIONES SUPERVISIÓN ----
    let idxObs = headers.indexOf('observaciones supervision');
    if (idxObs === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('observaciones supervision');
        idxObs = sh.getLastColumn() - 1;
    }

    // ---- FECHA REVISIÓN ----
    let idxRevision = headers.indexOf('fecha revision');
    if (idxRevision === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('fecha revisión');
        idxRevision = sh.getLastColumn() - 1;
    }

    // ---- FECHA ENVÍO A CORRECCIÓN ----
    let idxCorreccion = headers.indexOf('fecha de envio a correccion');
    if (idxCorreccion === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('fecha de envío a corrección');
        idxCorreccion = sh.getLastColumn() - 1;
    }

    // ---- ESTADO REVISIÓN ----
    let idxEstado = headers.indexOf('estado revision');
    if (idxEstado === -1) {
        sh.insertColumnAfter(sh.getLastColumn());
        sh.getRange(1, sh.getLastColumn()).setValue('estado revisión');
        idxEstado = sh.getLastColumn() - 1;
    }

    const fila = Number(payload.fila);
    if (fila < 2 || fila > sh.getLastRow()) {
        throw new Error('Fila inválida.');
    }

    const ahora = _nowHuman();

    // 1️⃣ Guardar observaciones
    sh.getRange(fila, idxObs + 1).setValue(payload.observaciones || '');

    // 2️⃣ Guardar estado + fecha según acción
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

    const idxCliente = headersS.indexOf('cliente');
    const idxNinera = headersS.indexOf('nombre de niñera');
    const idxTipo = headersS.indexOf('Tipo de servicio');
    const idxFecha = headersS.indexOf('fecha');

    // 3. Leer planeaciones
    const shPlan = _hoja('Planeaciones_Neuronanny');
    const dataPlan = shPlan.getDataRange().getValues();
    const headersP = dataPlan.shift();

    const idxPCliente = headersP.indexOf('cliente');
    const idxPFecha = headersP.indexOf('fecha');
    const idxPNinera = headersP.indexOf('nombre_ninera');

    // 4. Agrupar servicios por cliente
    const clientes = {};

    dataServ.forEach(r => {
        if (
            r[idxTipo] === 'neuronanny' &&
            String(r[idxNinera]).trim() === String(nombreNinera).trim()
        ) {
            const cliente = r[idxCliente];
            const fecha = r[idxFecha];

            if (!clientes[cliente]) clientes[cliente] = [];
            clientes[cliente].push(fecha);
        }
    });

    // 5. Evaluar planeaciones
    const resultado = [];

    Object.keys(clientes).forEach(cliente => {
        const fechas = clientes[cliente];

        let completas = true;

        fechas.forEach(f => {
            const existe = dataPlan.some(p =>
                p[idxPCliente] === cliente &&
                p[idxPFecha] === f &&
                p[idxPNinera] === nombreNinera
            );
            if (!existe) completas = false;
        });

        resultado.push({
            cliente,
            tienePlaneacionesCompletas: completas
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




// Sección de envió de notificaciónes cuando hay un nuevo servicio para la niñera


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

        // 🔎 detectar columna "ver"
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

        // 🚀 NUEVO SERVICIO ACTIVADO
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

    const nombreNinera = String(val('nombre de niñera')).trim();
    if (!nombreNinera) return;

    const cliente = String(val('cliente')).trim();

    // fecha: tomamos la PRIMER fecha válida de encabezado
    const fechas = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    let fechaServicio = '';
    for (const f of fechas) {
        if (f instanceof Date) {
            fechaServicio = Utilities.formatDate(f, ZONA_HORARIA, 'yyyy-MM-dd');
            break;
        }
    }

    // obtener email de la niñera
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
            title: 'Nuevo servicio asignado 👶',
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
        throw new Error('Datos incompletos para guardar suscripción');
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

    return 'Suscripción guardada correctamente';
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
    if (!row) throw new Error('No hay suscripción para ese email');

    const subscription = {
        endpoint: row[idxEndpoint],
        keys: {
            p256dh: row[idxP256],
            auth: row[idxAuth]
        }
    };

    const payload = JSON.stringify({
        title: '🍼 Nannys y Peques',
        body: 'Tienes un nuevo servicio asignado',
        url: 'https://app.nannysypeques.com.mx'
    });

    // 🔑 VAPID (USA LAS MISMAS QUE YA GENERASTE)
    const VAPID_PUBLIC = 'BAALWaRIxKUyY4J0qKwy0CV1AJKtsloQZHcPzZzHLqF3GQOf8HzLEbe6gYJsgr1BEW0OGbwjfE6QR6twPW27Ghk';
    const VAPID_PRIVATE = 'JPLuyDryD_QHus7kN78fDIMk8fbIBVotPIJGs1dKtKA';

    const options = {
        vapidDetails: {
            subject: 'mailto:nannysypeques@gmail.com',
            publicKey: BAALWaRIxKUyY4J0qKwy0CV1AJKtsloQZHcPzZzHLqF3GQOf8HzLEbe6gYJsgr1BEW0OGbwjfE6QR6twPW27Ghk,
            privateKey: xxxxxxxxxx
        }
    };

    // web-push en Apps Script
    const response = WebPush.sendNotification(subscription, payload, options);

    return response;
}


