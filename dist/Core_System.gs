function doPost(e) {
    try {
        let action = ''; let payload = {};
        if (e && e.postData && e.postData.contents) {
            const type = String(e.postData.type || '').toLowerCase();
            if (type.includes('application/json')) {
                const body = JSON.parse(e.postData.contents || '{}');
                action = String(body.action || '').trim(); payload = body.payload || {};
            } else {
                action = String(e.parameter?.action || '').trim();
                payload = e.parameter?.payload ? JSON.parse(e.parameter.payload) : {};
            }
        }
        if (!action) throw new Error('Falta action');
        const email = String(payload.email || '').trim().toLowerCase();
        let result;
        switch (action) {
            case 'login': result = login(email, payload.contrasena || payload.pass, payload.rol); break;
            case 'solicitarOTP': result = solicitarOTP(email); break;
            case 'establecerContrasena': result = establecerContrasena(email, payload.otp, payload.nueva); break;
            case 'getProfile': result = obtenerPerfilCompleto(email); break;
            case 'updatePerfilCliente': result = updatePerfilCliente(email, payload); break;
            case 'updatePerfilNinera': result = updatePerfilNinera(email, payload); break;
            case 'validarRegistroCliente': result = validarRegistroCliente(email); break;
            case 'getServiciosNinera': result = obtenerServiciosProximosPorNombre(email, payload.dias || 14); break;
            case 'confirmarServicioPorFila': result = confirmarServicioPorFila(payload.sheet, payload.row_base, email); break;
            case 'registrarInicioServicio': result = registrarInicioServicio(payload.sheet, payload.row_base, payload.fecha, email); break;
            case 'registrarFinServicio': result = registrarFinServicio(payload.sheet, payload.row_base, payload.fecha, email); break;
            case 'getServiciosCliente': result = getServiciosCliente(email); break;
            case 'obtenerDisponibilidad': result = obtenerDisponibilidad(email, payload.fechaISO); break;
            case 'guardarDisponibilidad': result = guardarDisponibilidad(email, payload); break;
            case 'obtenerDisponiblesSemana': result = obtenerDisponiblesSemana(email, payload.baseISO); break;
            case 'getResumenPlaneacionesSemana': result = obtenerResumenPlaneacionesSemana(payload.fechaBase, email, payload.tipo); break;
            case 'obtenerPlaneacionNeuronanny': result = obtenerPlaneacionNeuronanny(payload, email); break;
            case 'guardarPlaneacionNeuronanny': result = guardarPlaneacionNeuronanny(payload, email); break;
            case 'editarPlaneacionNeuronanny': result = editarPlaneacionNeuronanny(payload, email); break;
            case 'reenviarPlaneacionCorregida': result = reenviarPlaneacionCorregida(payload, email); break;
            case 'guardarObservacionesSupervision': result = guardarObservacionesSupervision(payload, email); break;
            case 'obtenerResumenDisponibilidadSemanaActual': if (!esAdmin(email)) throw new Error('No autorizado'); result = obtenerResumenDisponibilidadSemanaActual(); break;
            case 'apiSugerirNinerasServicio': result = apiSugerirNinerasServicio(payload, email); break;
            case 'obtenerServiciosAdminRango': if (!esAdmin(email)) throw new Error('No autorizado'); result = obtenerServiciosAdminRango(payload.desde, payload.hasta); break;
            case 'obtenerListaNineras': if (!esAdmin(email)) throw new Error('No autorizado'); result = obtenerListaNineras(); break;
            case 'obtenerPuntajePorNombre': result = obtenerPuntajePorNombre(payload.nombre); break;
            case 'registrarPuntosManual': if (!esAdmin(email)) throw new Error('No autorizado'); result = registrarPuntosManual(payload.nombre, payload.tipo); break;
            case 'guardarPushSubscription': result = guardarPushSubscription({ email, subscription: payload.subscription }); break;
            case 'getActividadesClientePlanificadas': result = getActividadesClientePlanificadas(email); break;
            default: throw new Error('Acción no soportada: ' + action);
        }
        return ContentService.createTextOutput(JSON.stringify({ ok: true, data: result })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message })).setMimeType(ContentService.MimeType.JSON);
    }
}

const NOMBRE_HOJA_USUARIOS = 'Usuarios', NOMBRE_HOJA_CLIENTES = 'Clientes', NOMBRE_HOJA_DISPONIBILIDAD = 'Disponibilidad', NOMBRE_HOJA_SERVICIOS = 'Servicios', ZONA_HORARIA = Session.getScriptTimeZone() || 'America/Mexico_City', MINUTOS_REENVIO_OTP = 2;

function _hoja(nombre) { const sh = SpreadsheetApp.getActive().getSheetByName(nombre); if (!sh) throw new Error('No se encontró la hoja: ' + nombre); return sh; }
function _ahoraISO() { return Utilities.formatDate(new Date(), ZONA_HORARIA, \"yyyy-MM-dd'T'HH:mm:ss\"); }
function _nowHuman() { return Utilities.formatDate(new Date(), ZONA_HORARIA, \"yyyy-MM-dd HH:mm:ss\"); }
function _sha256(t) { const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, t, Utilities.Charset.UTF_8); return raw.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join(''); }
function _buscarFilaPorValor(hoja, nombreCol, valor) {
    const vals = hoja.getDataRange().getValues(); if (vals.length < 2) return -1;
    const headers = vals[0].map(h => String(h).trim().toLowerCase()); const idx = headers.indexOf(nombreCol.toLowerCase());
    if (idx === -1) return -1;
    for (let i = 1; i < vals.length; i++) if (String(vals[i][idx]).trim().toLowerCase() === String(valor).trim().toLowerCase()) return i + 1;
    return -1;
}
function _idxCol(hoja, nombreCol) {
    const headers = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getDisplayValues()[0].map(h => String(h).trim().toLowerCase());
    return headers.indexOf(String(nombreCol).toLowerCase().trim()) + 1;
}
function _esVerdadero(val) { if (typeof val === 'boolean') return val; const s = String(val).trim().toLowerCase(); return s === 'true' || s === '1' || s === 'si' || s === 'sí'; }
function _norm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
function _toISODate(v) { if (v instanceof Date) return Utilities.formatDate(v, ZONA_HORARIA, 'yyyy-MM-dd'); const s = String(v || '').trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; const d = new Date(s); return isNaN(d.getTime()) ? '' : Utilities.formatDate(d, ZONA_HORARIA, 'yyyy-MM-dd'); }
function _toHM(v) { if (v instanceof Date) return Utilities.formatDate(v, ZONA_HORARIA, 'HH:mm'); let s = String(v || '').trim(); const m = s.match(/^(\d{1,2})[:.](\d{1,2})$/); return m ? ('0' + m[1]).slice(-2) + ':' + ('0' + m[2]).slice(-2) : s; }
function _nombrePorEmail(email) { const sh = _hoja(NOMBRE_HOJA_USUARIOS); const fila = _buscarFilaPorValor(sh, 'email', email); return fila === -1 ? '' : String(sh.getRange(fila, 2).getValue()).trim(); }
