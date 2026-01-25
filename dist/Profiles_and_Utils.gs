function updatePerfilCliente(email, payload) {
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const filaC = _buscarFilaPorValor(shC, 'email', email);
    if (filaC === -1) throw new Error('Cliente no registrado');
    const fields = { 'nombre completo': payload.nombre_completo, 'direccion': payload.direccion, 'ubicación': payload.ubicacion, 'teléfono': payload.telefono, 'No. de emergencia': payload.emergencia, 'no. de mascotas': payload.mascotas, 'Políticas de contratación': payload.politicas_aceptadas || '', 'Fecha de edición información de peque': _nowHuman(), 'nombre del peque': payload.peque_nombre, 'Fecha de nacimiento': payload.peque_nacimiento, 'Alergias': payload.alergias, 'Condición médica o especificaciones adicionales': payload.condicion, 'Estado de salud actual': payload.salud, 'Preferencias o actividades favoritas': payload.preferencias, 'Nombre del peque 2': payload.peque_nombre_2, 'Fecha de nacimiento 2': payload.peque_nac_2, 'Alergias 2': payload.alergias_2, 'Condición médica o especificaciones adicionales 2': payload.condicion_2, 'Estado de salud actual 2': payload.salud_2, 'Preferencias o actividades favoritas 2': payload.preferencias_2, 'Nombre del peque 3': payload.peque_nombre_3, 'Fecha de nacimiento 3': payload.peque_nac_3, 'Alergias 3': payload.alergias_3, 'Condición médica o especificaciones adicionales 3': payload.condicion_3, 'Estado de salud actual 3': payload.salud_3, 'Preferencias o actividades favoritas 3': payload.preferencias_3, 'actualizado': _ahoraISO() };
    _escribirObjeto(shC, filaC, fields);
    return { ok: true };
}

function getPerfilCliente(email) {
    const shC = _hoja(NOMBRE_HOJA_CLIENTES);
    const filaC = _buscarFilaPorValor(shC, 'email', email);
    if (filaC === -1) return {};
    const headers = shC.getRange(1, 1, 1, shC.getLastColumn()).getValues()[0], values = shC.getRange(filaC, 1, 1, shC.getLastColumn()).getValues()[0], obj = {};
    headers.forEach((h, i) => { if (h) { let key = h.toLowerCase().replace(/\s+/g, '_'); if (h === 'nombre completo') key = 'nombre'; obj[key] = values[i]; } });
    return obj;
}

function getServiciosCliente(email) {
    email = email.toLowerCase().trim();
    const todos = _leerServiciosDesdeHojas_(['Servicios', 'Servicios_Siguiente_semana']), hoyISO = _toISODate(new Date());
    const shClientes = _hoja(NOMBRE_HOJA_CLIENTES), dataClientes = shClientes.getDataRange().getValues(), headersC = dataClientes[0].map(h => _norm(h));
    let clienteData = null;
    for (let i = 1; i < dataClientes.length; i++) if (String(dataClientes[i][headersC.indexOf('email')]).trim().toLowerCase() === email) {
        clienteData = {}; headersC.forEach((header, idx) => { clienteData[header] = String(dataClientes[i][idx]).trim(); }); break;
    }
    return todos.filter(s => String(s.email).toLowerCase() === email && s.fecha >= hoyISO).map(s => {
        const d = s.direccion || clienteData?.direccion || '', u = s.ubicacion_link || clienteData?.ubicacion || '', c = s.numero_contacto || clienteData?.telefono || '', e = clienteData?.no_de_emergencia || s.numero_de_emergencia || '', ed = s.edad_nino || clienteData?.edad_del_peque || '', n = s.notas || (clienteData ? _construirNotasDesdeCliente(clienteData) : '') || '';
        return { ...s, 'Fecha': s.fecha, 'Horario': (s.hora_inicio && s.hora_fin) ? ${s.hora_inicio}   : 'Pendiente', 'Nombre de la niñera': s.nombre_ninera || 'Por asignar', 'Estado': s.estado || 'Programado', 'Direccion': d, 'Ubicacion': u, 'Contacto': c, 'Emergencia': e, 'Edad del niño': ed, 'Notas': n };
    }).sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));
}

function obtenerPerfilCompleto(email) {
    const shU = _hoja(NOMBRE_HOJA_USUARIOS), filaU = _buscarFilaPorValor(shU, 'email', email);
    if (filaU !== -1) {
        const headersU = shU.getRange(1, 1, 1, shU.getLastColumn()).getValues()[0].map(h => _norm(h)), valuesU = shU.getRange(filaU, 1, 1, shU.getLastColumn()).getValues()[0];
        const val = (als) => { if (typeof als === 'string') als = [als]; for (let a of als) { let idx = headersU.indexOf(_norm(a)); if (idx >= 0) return valuesU[idx]; } return ''; };
        return { isNanny: true, email, nombre: val('nombre'), telefono: val(['teléfono', 'telefono']), direccion: val(['dirección', 'direccion', 'direccion base']), ubicacion: val(['ubicación', 'ubicacion']), emergencia: val(['no. de emergencia', 'no. emergencia', 'emergencia']), imagen: val('imagen') };
    }
    return getPerfilCliente(email);
}

function updatePerfilNinera(email, payload) {
    const sh = _hoja(NOMBRE_HOJA_USUARIOS), fila = _buscarFilaPorValor(sh, 'email', email);
    if (fila === -1) throw new Error('No encontrado');
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => _norm(h));
    const set = (als, v) => { for (let a of als) { let i = headers.indexOf(_norm(a)); if (i !== -1) { sh.getRange(fila, i + 1).setValue(v); return true; } } return false; };
    if (payload.telefono) set(['teléfono', 'telefono'], payload.telefono);
    if (payload.direccion) set(['dirección', 'direccion', 'direccion base'], payload.direccion);
    if (payload.ubicacion) set(['ubicación', 'ubicacion'], payload.ubicacion);
    if (payload.emergencia) set(['no. de emergencia', 'no. emergencia', 'emergencia'], payload.emergencia);
    return { ok: true };
}

function getActividadesClientePlanificadas(email) {
    if (!email) throw new Error('Denegado'); email = email.toLowerCase().trim();
    const rows = _hoja('Planeaciones_Neuronanny').getDataRange().getValues();
    if (rows.length < 2) return { actual: [], siguiente: [] };
    let validNoms = [email]; try { let p = obtenerPerfilCompleto(email); if (p?.nombre) validNoms.push(_norm(p.nombre)); } catch (e) {}
    const headers = rows[0].map(h => _norm(h));
    const d = new Date(), l0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()); l0.setDate(l0.getDate() + (d.getDay() === 0 ? -6 : 1 - d.getDay()));
    const l1 = new Date(l0); l1.setDate(l1.getDate() + 7);
    const s0 = _toISODate(l0), s1 = _toISODate(l1), e0 = _toISODate(new Date(l0.getTime() + 6 * 24 * 3600000)), e1 = _toISODate(new Date(l1.getTime() + 6 * 24 * 3600000));
    const res = { actual: [], siguiente: [] };
    for (let i = 1; i < rows.length; i++) {
        const o = {}; headers.forEach((h, j) => o[h] = rows[i][j]);
        if (validNoms.some(n => _norm(o.cliente).includes(n))) {
            const f = _toISODate(o.fecha);
            if (f >= s0 && f <= e0) res.actual.push(o); else if (f >= s1 && f <= e1) res.siguiente.push(o);
        }
    }
    return res;
}

function _guardarImagenDrive(base64Data, nombreArchivo) {
    const parentFolderId = '10o_u5v3f_v2x5f-V29Y9N4Dvz5V6Xy8C'; // Reemplázalo con tu ID real
    const folder = DriveApp.getFolderById(parentFolderId);
    const contentType = base64Data.substring(5, base64Data.indexOf(';'));
    const bytes = Utilities.base64Decode(base64Data.substring(base64Data.indexOf(',') + 1));
    const blob = Utilities.newBlob(bytes, contentType, nombreArchivo);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
}
