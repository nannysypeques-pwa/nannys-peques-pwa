function obtenerResumenPlaneacionesSemana(fechaBaseISO, email, tipo) {
    const fechasSemana = _diasDeSemana(fechaBaseISO).map(d => d.fecha);
    let hojasALeer = (tipo === 'actual') ? ['Servicios'] : (tipo === 'siguiente' ? ['Servicios_Siguiente_semana'] : ['Servicios', 'Servicios_Siguiente_semana']);
    const servicios = _leerServiciosDesdeHojas_(hojasALeer).filter(s => ['neuronanny', 'nanny educativa', 'miss nanny'].includes(_norm(s.tipo_servicio)) && fechasSemana.includes(s.fecha));
    const shP = _hoja('Planeaciones_Neuronanny');
    const dataP = shP.getDataRange().getValues();
    const hdrP = dataP[0].map(h => _norm(h));
    const idxFechaP = hdrP.indexOf('fecha'), idxClienteP = hdrP.indexOf('cliente'), idxEstadoR = hdrP.findIndex(h => h.includes('estado') && h.includes('revision'));
    const mapaCiudad = _mapaCiudadPorNinera();
    const resumen = {}; const procesados = new Set();
    servicios.forEach(s => {
        const key = [s.cliente, s.nombre_ninera, _norm(s.tipo_servicio)].join('|').toLowerCase();
        if (procesados.has(key)) return; procesados.add(key);
        const diasServicio = servicios.filter(x => x.cliente === s.cliente && x.nombre_ninera === s.nombre_ninera && _norm(x.tipo_servicio) === _norm(s.tipo_servicio)).map(x => x.fecha);
        let encontrados = 0; const estados = [];
        diasServicio.forEach(f => {
            for (let i = 1; i < dataP.length; i++) {
                if (_toISODate(dataP[i][idxFechaP]) === f && String(dataP[i][idxClienteP]).trim() === s.cliente) {
                    encontrados++; if (idxEstadoR >= 0) estados.push(_norm(dataP[i][idxEstadoR]));
                    break;
                }
            }
        });
        const tiene = (diasServicio.length > 0 && encontrados === diasServicio.length);
        let estRev = 'pendiente';
        if (tiene) { if (estados.includes('a correccion')) estRev = 'a correccion'; else if (estados.every(e => e === 'revisada')) estRev = 'revisada'; }
        const ciudad = mapaCiudad[s.nombre_ninera.toLowerCase()] || 'Sin ciudad';
        if (!resumen[ciudad]) resumen[ciudad] = [];
        resumen[ciudad].push({ cliente: s.cliente, ninera: s.nombre_ninera, tipo_servicio: s.tipo_servicio, dias: diasServicio, totalDias: diasServicio.length, tienePlaneacion: tiene, estado_revision: estRev });
    });
    return resumen;
}

function guardarPlaneacionNeuronanny(payload, email) {
    if (!_estaAutorizado(email)) throw new Error('No autorizado');
    const sh = _hoja('Planeaciones_Neuronanny');
    const data = sh.getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));
    const idxFecha = headers.indexOf('fecha'), idxCliente = headers.indexOf('cliente');
    const fP = _toISODate(payload.fecha), cP = String(payload.cliente).trim();
    for (let i = 1; i < data.length; i++) {
        if (_toISODate(data[i][idxFecha]) === fP && String(data[i][idxCliente]).trim() === cP) throw new Error('Ya existe planeación');
    }
    let imagenFinal = payload.imagen || '';
    if (payload.imagen_base64) imagenFinal = _guardarImagenDrive(payload.imagen_base64, PLAN__.jpg);
    sh.appendRow([payload.fecha, payload.nombre_ninera || _nombrePorEmail(email), payload.cliente, payload.edad_nino, payload.area_desarrollo, payload.objetivo, payload.descripcion, payload.materiales, imagenFinal, _nowHuman(), payload.ciudad || '']);
    return { ok: true };
}

function reenviarPlaneacionCorregida(payload, email) {
    const sh = _hoja('Planeaciones_Neuronanny');
    const data = sh.getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));
    const idxF = headers.indexOf('fecha'), idxC = headers.indexOf('cliente'), idxArea = headers.indexOf('area de desarrollo'), idxObj = headers.indexOf('objetivo'), idxDesc = headers.indexOf('descripcion'), idxMat = headers.indexOf('materiales'), idxImg = headers.indexOf('imagen'), idxEst = headers.indexOf('estado revision'), idxCorr = headers.indexOf('fecha de correccion');
    const fISO = _toISODate(payload.fecha), c = String(payload.cliente).trim();
    let fila = -1;
    for (let i = 1; i < data.length; i++) if (_toISODate(data[i][idxF]) === fISO && String(data[i][idxC]).trim() === c) { fila = i + 1; break; }
    if (fila === -1) throw new Error('No encontrada');
    if (idxArea >= 0) sh.getRange(fila, idxArea + 1).setValue(payload.area_desarrollo);
    if (idxObj >= 0) sh.getRange(fila, idxObj + 1).setValue(payload.objetivo);
    if (idxDesc >= 0) sh.getRange(fila, idxDesc + 1).setValue(payload.descripcion);
    if (idxMat >= 0) sh.getRange(fila, idxMat + 1).setValue(payload.materiales);
    if (idxImg >= 0) sh.getRange(fila, idxImg + 1).setValue(payload.imagen);
    if (idxEst >= 0) sh.getRange(fila, idxEst + 1).setValue('pendiente');
    if (idxCorr >= 0) sh.getRange(fila, idxCorr + 1).setValue(_nowHuman());
    return { ok: true };
}

function obtenerPlaneacionNeuronanny(payload, email) {
    const sh = _hoja('Planeaciones_Neuronanny');
    const data = sh.getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));
    const idxF = headers.indexOf('fecha'), idxC = headers.indexOf('cliente');
    for (let i = 1; i < data.length; i++) {
        if (_toISODate(data[i][idxF]) === payload.fecha && String(data[i][idxC]).trim() === payload.cliente) {
            return { fila: i + 1, area_desarrollo: data[i][headers.indexOf('area de desarrollo')], objetivo: data[i][headers.indexOf('objetivo')], descripcion: data[i][headers.indexOf('descripcion')], materiales: data[i][headers.indexOf('materiales')], imagen: data[i][headers.indexOf('imagen')], nombre_ninera: data[i][headers.findIndex(h => h.includes('nombre') && h.includes('ninera'))], estado_revision: data[i][headers.findIndex(h => h.includes('estado') && h.includes('revision'))], observaciones_supervision: data[i][headers.findIndex(h => h.includes('observaciones') && h.includes('supervision'))] };
        }
    }
    return null;
}

function editarPlaneacionNeuronanny(payload, email) {
    const sh = _hoja('Planeaciones_Neuronanny');
    const fila = Number(payload.fila);
    let imagenFinal = payload.imagen || '';
    if (payload.imagen_base64) imagenFinal = _guardarImagenDrive(payload.imagen_base64, PLAN_EDIT__.jpg);
    sh.getRange(fila, 5).setValue(payload.area_desarrollo); sh.getRange(fila, 6).setValue(payload.objetivo); sh.getRange(fila, 7).setValue(payload.descripcion); sh.getRange(fila, 8).setValue(payload.materiales); sh.getRange(fila, 9).setValue(imagenFinal); sh.getRange(fila, 10).setValue(_nowHuman());
    return { ok: true };
}

function guardarObservacionesSupervision(payload, email) {
    const sh = _hoja('Planeaciones_Neuronanny');
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    let idxObs = headers.indexOf('observaciones supervision'), idxRev = headers.indexOf('fecha revision'), idxCorr = headers.indexOf('fecha de envio a correccion'), idxEst = headers.indexOf('estado revision');
    const fila = Number(payload.fila); const ahora = _nowHuman();
    sh.getRange(fila, idxObs + 1).setValue(payload.observaciones || '');
    if (payload.tipo === 'revisada') { sh.getRange(fila, idxEst + 1).setValue('revisada'); sh.getRange(fila, idxRev + 1).setValue(ahora); }
    if (payload.tipo === 'correccion') { sh.getRange(fila, idxEst + 1).setValue('a corrección'); sh.getRange(fila, idxCorr + 1).setValue(ahora); }
    return { ok: true };
}

function guardarPushSubscription(data) {
    const sh = _ss().getSheetByName('PushSubscriptions');
    sh.appendRow([data.email, data.subscription.endpoint, data.subscription.keys.p256dh, data.subscription.keys.auth, new Date()]);
    return { ok: true };
}

function onEdit(e) {
    const sh = e.range.getSheet(); if (sh.getName() !== 'Servicios' || e.range.getRow() < 3) return;
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const idxVer = headers.indexOf('ver') + 1;
    if (e.range.getColumn() === idxVer && _esVerdadero(e.value) && !_esVerdadero(e.oldValue)) notificarNuevoServicioDesdeFila_(sh, e.range.getRow());
}

function notificarNuevoServicioDesdeFila_(sh, fila) {
    const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const val = (n) => sh.getRange(fila, headers.indexOf(_norm(n)) + 1).getValue();
    const nombre = String(val('nombre de ninera')).trim(), cliente = String(val('cliente')).trim();
    if (!nombre) return;
    const email = obtenerEmailPorNombre_(nombre);
    if (email) enviarNotificacionNuevoServicio_(email, { cliente, fecha: '' });
}

function obtenerEmailPorNombre_(nombre) {
    const data = _hoja(NOMBRE_HOJA_USUARIOS).getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));
    const idxN = headers.indexOf('nombre'), idxE = headers.indexOf('email');
    for (let i = 1; i < data.length; i++) if (_norm(data[i][idxN]) === _norm(nombre)) return data[i][idxE].trim().toLowerCase();
    return '';
}

function enviarNotificacionNuevoServicio_(email, info) {
    const data = _hoja('PushSubscriptions').getDataRange().getValues();
    data.shift();
    data.forEach(r => {
        if (String(r[0]).toLowerCase() === email) {
            UrlFetchApp.fetch('https://TU_BACKEND/api/push/send', { method: 'post', contentType: 'application/json', payload: JSON.stringify({ subscription: { endpoint: r[1], keys: { p256dh: r[2], auth: r[3] } }, title: 'Nuevo servicio ', body: Servicio con , url: '/index.html' }), muteHttpExceptions: true });
        }
    });
}
