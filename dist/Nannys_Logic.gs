function _mapaCiudadPorNinera() {
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const data = sh.getDataRange().getValues();
    const headers = data.shift().map(h => String(h).toLowerCase().trim());
    const idxNombre = headers.indexOf('nombre');
    const idxCiudad = headers.indexOf('ciudad');
    if (idxNombre === -1 || idxCiudad === -1) {
        throw new Error('La hoja Usuarios debe tener columnas \"nombre\" y \"ciudad\"');
    }
    const mapa = {};
    data.forEach(row => {
        const nombre = String(row[idxNombre] || '').trim();
        const ciudad = String(row[idxCiudad] || '').trim();
        if (nombre) mapa[nombre.toLowerCase()] = ciudad || 'Sin ciudad';
    });
    return mapa;
}

function _expandirServiciosSemanales_(sh) {
    const data = sh.getDataRange().getValues();
    if (data.length < 3) return [];
    const fechas = data[0]; 
    const colIdx = {};
    fechas.forEach((h, i) => {
        if (h instanceof Date) return;
        const k = _norm(h);
        if (k) colIdx[k] = i;
    });
    const required = ['cliente', 'numero de contacto', 'direccion', 'ubicacion (link)', 'nombre de ninera'];
    for (const k of required) if (colIdx[k] === undefined) return [];
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
        const tipoServicio = colIdx['tipo de servicio'] != null ? String(row[colIdx['tipo de servicio']] || '').trim().toLowerCase() : '';
        const verServicio = colIdx['ver'] != null ? _esVerdadero(row[colIdx['ver']]) : false;
        Object.keys(mapaCols).forEach(fechaISO => {
            const m = mapaCols[fechaISO];
            if (!m || !m.hora_inicio || !m.hora_fin) return;
            const hi = _toHM(row[m.hora_inicio - 1]);
            const hf = _toHM(row[m.hora_fin - 1]);
            if (!hi || !hf) return;
            if (!verServicio) return;
            servicios.push({
                sheet: sh.getName(), row_base: r + 1, fecha: fechaISO, hora_inicio: hi, hora_fin: hf,
                cliente, email: emailServicio, numero_contacto: contacto, numero_de_emergencia: emergencia,
                direccion, ubicacion_link: ubicacion, nombre_ninera: nombreNinera, cuota_nanny: cuota,
                edad_nino: edad, notas, estado: (m.estado ? String(row[m.estado - 1] || '').trim().toLowerCase() : 'pendiente') || 'pendiente',
                confirmado_en: m.confirmado_en ? String(row[m.confirmado_en - 1] || '').trim() : '',
                inicio_real: m.inicio_real ? String(row[m.inicio_real - 1] || '').trim() : '',
                fin_real: m.fin_real ? String(row[m.fin_real - 1] || '').trim() : '', ver: verServicio, tipo_servicio: tipoServicio
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
    const todos = _leerServiciosDesdeHojas_(['Servicios', 'Servicios_Siguiente_semana']);
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + Number(diasAdelante || 14));
    const hoyISO = Utilities.formatDate(hoy, ZONA_HORARIA, 'yyyy-MM-dd');
    const limISO = Utilities.formatDate(limite, ZONA_HORARIA, 'yyyy-MM-dd');
    const out = todos.filter(s => _norm(s.nombre_ninera) === _norm(nombreNanny) && s.fecha >= hoyISO && s.fecha <= limISO);
    const shClientes = _hoja(NOMBRE_HOJA_CLIENTES);
    const dataClientes = shClientes.getDataRange().getValues();
    const headersC = dataClientes[0].map(h => _norm(h).replace(/\./g, '').replace(/\s+/g, '_'));
    const mapaClientes = {};
    for (let i = 1; i < dataClientes.length; i++) {
        const emailCliente = String(dataClientes[i][headersC.indexOf('email')] || '').trim().toLowerCase();
        if (emailCliente) {
            const clienteData = {};
            headersC.forEach((header, idx) => { clienteData[header] = String(dataClientes[i][idx] || '').trim(); });
            mapaClientes[emailCliente] = clienteData;
        }
    }
    out.forEach(s => {
        const emailServicio = String(s.email || '').trim().toLowerCase();
        if (emailServicio && mapaClientes[emailServicio]) {
            const clienteData = mapaClientes[emailServicio];
            if (!String(s.direccion || '').trim()) s.direccion = clienteData.direccion || s.direccion;
            if (!String(s.ubicacion_link || '').trim()) s.ubicacion_link = clienteData.ubicacion || s.ubicacion_link;
            if (!String(s.numero_contacto || '').trim()) s.numero_contacto = clienteData.telefono || s.numero_contacto;
            s.numero_de_emergencia = clienteData.no_de_emergencia || s.numero_de_emergencia;
            if (!String(s.edad_nino || '').trim()) s.edad_nino = clienteData.edad_del_peque || s.edad_nino;
            if (!String(s.notes || '').trim()) s.notas = _construirNotasDesdeCliente(clienteData) || s.notas;
        }
    });
    out.sort((a, b) => (a.fecha + ' ' + a.hora_inicio).localeCompare(b.fecha + ' ' + b.hora_inicio));
    for (let i = 0; i < out.length; i++) {
        out[i].empalmado = false;
        for (let j = i + 1; j < out.length; j++) {
            if (out[i].fecha !== out[j].fecha) continue;
            if (_overlapHM(out[i].hora_inicio, out[i].hora_fin, out[j].hora_inicio, out[j].hora_fin)) {
                out[i].empalmado = true; out[j].empalmado = true;
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
    if (rowNum < 3 || rowNum > sh.getLastRow()) throw new Error('Fila inválida.');
    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const idxNombre = hdrs.indexOf('nombre de ninera') + 1;
    if (idxNombre <= 0) throw new Error('Falta columna \"nombre de niñera\".');
    const nombreFila = String(sh.getRange(rowNum, idxNombre).getValue() || '').trim();
    if (_norm(nombreFila) !== _norm(_nombrePorEmail(email))) throw new Error('No puede confirmar servicios de otra niñera.');
    const mapa = _mapaColumnasPorFecha_(sh);
    const ts = _nowHuman();
    let confirmados = 0;
    Object.keys(mapa).forEach(fechaISO => {
        const m = mapa[fechaISO];
        if (!m || !m.hora_inicio || !m.hora_fin) return;
        const hi = sh.getRange(rowNum, m.hora_inicio).getValue();
        const hf = sh.getRange(rowNum, m.hora_fin).getValue();
        if (!hi || !hf) return;
        if (m.estado) sh.getRange(rowNum, m.estado).setValue('confirmado');
        if (m.confirmado_en) sh.getRange(rowNum, m.confirmado_en).setValue(ts);
        confirmados++;
    });
    if (confirmados === 0) throw new Error('No se encontraron días con servicio para confirmar.');
    return { ok: true, confirmados, confirmado_en: ts };
}

function registrarInicioServicio(sheetName, row, fechaISO, email) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');
    const sh = _hoja(sheetName);
    const m = _mapaColumnasPorFecha_(sh)[String(fechaISO || '').trim()];
    if (!m || !m.inicio_real || !m.estado) throw new Error('Fecha o columnas no encontradas.');
    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const idxNombre = hdrs.indexOf('nombre de ninera') + 1;
    const nombreFila = String(sh.getRange(Number(row), idxNombre).getValue() || '').trim();
    if (_norm(nombreFila) !== _norm(_nombrePorEmail(email))) throw new Error('No tiene permiso.');
    const ts = _nowHuman();
    sh.getRange(Number(row), m.inicio_real).setValue(ts);
    sh.getRange(Number(row), m.estado).setValue('En curso');
    return { ok: true, inicio_real: ts };
}

function registrarFinServicio(sheetName, row, fechaISO, email) {
    email = String(email || '').trim().toLowerCase();
    if (!_estaAutorizado(email)) throw new Error('No autorizado.');
    const sh = _hoja(sheetName);
    const m = _mapaColumnasPorFecha_(sh)[String(fechaISO || '').trim()];
    if (!m || !m.fin_real || !m.estado) throw new Error('Fecha o columnas no encontradas.');
    const hdrs = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const idxNombre = hdrs.indexOf('nombre de ninera') + 1;
    const nombreFila = String(sh.getRange(Number(row), idxNombre).getValue() || '').trim();
    if (_norm(nombreFila) !== _norm(_nombrePorEmail(email))) throw new Error('No tiene permiso.');
    const ts = _nowHuman();
    sh.getRange(Number(row), m.fin_real).setValue(ts);
    sh.getRange(Number(row), m.estado).setValue('Completado');
    return { ok: true, fin_real: ts };
}

function _overlapHM(a1, a2, b1, b2) {
    const a = _hmToMinutes(a1), b = _hmToMinutes(a2), c = _hmToMinutes(b1), d = _hmToMinutes(b2);
    if ([a, b, c, d].some(x => isNaN(x))) return false;
    return (a < d) && (c < b);
}

function _conflictoServicioAsignado(nombreNinera, fechaISO, hi, hf) {
    const servicios = _expandirServiciosSemanales_(_hoja(NOMBRE_HOJA_SERVICIOS));
    for (const s of servicios) {
        if (_norm(s.nombre_ninera) === _norm(nombreNinera) && s.fecha === fechaISO && _overlapHM(hi, hf, s.hora_inicio, s.hora_fin)) {
            return { fecha: s.fecha, hi: s.hora_inicio, hf: s.hora_fin, estado: s.estado || 'pendiente' };
        }
    }
    return null;
}

function _leerNinerasActivas() {
    const sh = _hoja(NOMBRE_HOJA_USUARIOS);
    const vals = sh.getDataRange().getValues();
    const hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getDisplayValues()[0].map(h => _norm(h));
    const idx = { nombre: hdr.indexOf('nombre') + 1, email: hdr.indexOf('email') + 1, activo: hdr.indexOf('activo') + 1, dir: hdr.indexOf('direccion base') + 1, lat: hdr.indexOf('lat') + 1, lng: hdr.indexOf('lng') + 1, minEdad: hdr.indexOf('min_edad') + 1, maxEdad: hdr.indexOf('max_edad') + 1 };
    const out = [];
    for (let i = 1; i < vals.length; i++) {
        if (idx.activo > 0 && !_esVerdadero(vals[i][idx.activo - 1])) continue;
        out.push({ row: i + 1, nombre: String(vals[i][idx.nombre - 1] || '').trim(), email: String(vals[i][idx.email - 1] || '').trim().toLowerCase(), direccion: String(vals[i][idx.dir - 1] || '').trim(), lat: Number(vals[i][idx.lat - 1]), lng: Number(vals[i][idx.lng - 1]), min_edad: Number(vals[i][idx.minEdad - 1] || 0), max_edad: Number(vals[i][idx.maxEdad - 1] || 99) });
    }
    return { hdrIdx: idx, lista: out, sheet: sh };
}

function sugerirNinerasServicio(fechaISO, horaInicio, horaFin, ubicacionServicio, edadNino) {
    fechaISO = _toISODate(fechaISO);
    const hi = _toHM(horaInicio), hf = _toHM(horaFin);
    const edad = Number(edadNino);
    const locServicio = _extractCoordsFromUrl(ubicacionServicio) || _geocode(ubicacionServicio);
    const { hdrIdx, lista, sheet } = _leerNinerasActivas();
    const candidatos = [];
    for (const n of lista) {
        const cumpleEdad = (edad >= n.min_edad && edad <= n.max_edad);
        if (!cumpleEdad) continue;
        if (!_rangoDentroDeTurnos(hi, hf, _turnosDe(n.nombre, fechaISO).M, _turnosDe(n.nombre, fechaISO).V)) continue;
        if (_conflictoServicioAsignado(n.nombre, fechaISO, hi, hf)) continue;
        const dist = locServicio ? Math.round(_distKM({ lat: n.lat, lng: n.lng }, locServicio) * 10) / 10 : null;
        if (dist !== null && dist > 20) continue;
        candidatos.push({ nombre: n.nombre, email: n.email, cumple_edad: true, disponible: true, distancia_km: dist });
    }
    return candidatos.sort((a, b) => (a.distancia_km || 999) - (b.distancia_km || 999));
}

function apiSugerirNinerasServicio(payload, email) {
    if (!esAdmin(email)) throw new Error('No autorizado.');
    return sugerirNinerasServicio(payload.fecha, payload.hora_inicio, payload.hora_fin, payload.ubicacion, payload.edad);
}

function obtenerServiciosAdminRango(desdeISO, hastaISO) {
    const todos = _leerServiciosDesdeHojas_(['Servicios', 'Servicios_Siguiente_semana']);
    const d0 = _toISODate(desdeISO), d1 = _toISODate(hastaISO);
    return todos.filter(s => s.fecha >= d0 && s.fecha <= d1).sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));
}

function obtenerListaNineras() {
    const data = _hoja(NOMBRE_HOJA_USUARIOS).getDataRange().getValues();
    const headers = data[0].map(h => _norm(h));
    const colNombre = headers.indexOf('nombre');
    const nombres = new Set();
    for (let i = 1; i < data.length; i++) if (data[i][colNombre]) nombres.add(data[i][colNombre]);
    return Array.from(nombres).sort((a, b) => a.localeCompare(b, 'es'));
}
