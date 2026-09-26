/**
 * =========================================================================
 * MÓDULO SUPABASE: PLANEACIONES DE ACTIVIDADES (NEURONANNY Y ESTIMULACIÓN)
 * =========================================================================
 * Maneja la persistencia y consulta de planeaciones y servicios en Supabase:
 * - Panel de la Nanny (semana actual y siguiente)
 * - Pestaña Actividades del Cliente (semana actual y siguiente)
 * - Panel de Supervisión: Pestaña "Actividades" (resumen por ciudad, semáforo, revisión y observaciones)
 * - Panel de Supervisión: Pestaña "Sugeridor" (servicios de semana actual y semana anterior)
 * - Mantiene Google Drive para la subida y consulta de evidencias fotográficas.
 */

const TIPOS_SERVICIO_PLANEACION = [
    'nanny educativa',
    'miss nanny'
];

const TIPOS_SERVICIO_SUGERIDOR = [
    'neuronanny',
    'nanny educativa',
    'miss nanny',
    'estimulacion'
];

/**
 * Normaliza cadenas para comparaciones robustas
 */
function _normTextoPlaneacion(str) {
    if (!str) return '';
    return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

/**
 * Obtiene el lunes de una fecha (al mediodía local para evitar desfases de huso horario)
 */
function _startMondayPlaneacion(dateInput) {
    const d = dateInput instanceof Date ? new Date(dateInput.getTime()) : (dateInput ? new Date(dateInput + (String(dateInput).includes('T') ? '' : 'T12:00:00')) : new Date());
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff, 12, 0, 0);
    return monday;
}

/**
 * Formatea Date a YYYY-MM-DD
 */
function _toISOPlaneacion(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Suma días a un string ISO YYYY-MM-DD
 */
function _addDaysISOPlaneacion(iso, n) {
    const base = iso ? new Date(iso + 'T12:00:00') : new Date();
    base.setDate(base.getDate() + n);
    return _toISOPlaneacion(base);
}

/**
 * Calcula las 3 fechas clave (lunes anterior, actual y siguiente)
 */
function calcularLunesSemanasSupervision() {
    const lunesActual = _startMondayPlaneacion(new Date());
    const lunesAnterior = new Date(lunesActual.getFullYear(), lunesActual.getMonth(), lunesActual.getDate() - 7, 12, 0, 0);
    const lunesSiguiente = new Date(lunesActual.getFullYear(), lunesActual.getMonth(), lunesActual.getDate() + 7, 12, 0, 0);

    return {
        isoAnterior: _toISOPlaneacion(lunesAnterior),
        isoActual: _toISOPlaneacion(lunesActual),
        isoSiguiente: _toISOPlaneacion(lunesSiguiente)
    };
}

/**
 * Sube una imagen para planeaciones directamente a Supabase Storage (Bucket 'planeaciones')
 */
async function subirImagenPlaneacion(base64, nombreArchivo) {
    if (!base64) return '';
    if (typeof subirImagenSupabaseStorage !== 'function') {
        throw new Error("El módulo de subida a Supabase Storage no está disponible.");
    }
    console.log("☁️ [Planeación] Subiendo imagen a Supabase Storage (bucket: planeaciones)...");
    const url = await subirImagenSupabaseStorage(base64, nombreArchivo || `PLAN_${Date.now()}.jpg`, "planeaciones");
    if (url && typeof url === 'string' && url.startsWith('http')) {
        return url;
    }
    throw new Error("Error al obtener la URL pública de Supabase Storage para la imagen de planeación.");
}

const subirImagenDriveGAS = subirImagenPlaneacion;

/**
 * Guarda o actualiza una planeación en Supabase (Upsert por fecha + cliente + nanny)
 */
async function guardarPlaneacionSupabase(payload, emailSesion) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error('Cliente Supabase no inicializado');

    const fechaISO = String(payload.fecha || '').slice(0, 10);
    const cliente = String(payload.cliente || '').trim();
    const nombreNinera = String(payload.nombre_ninera || payload.nombreNinera || '').trim();

    if (!fechaISO || !cliente || !nombreNinera) {
        throw new Error('Datos incompletos para guardar planeación (fecha, cliente y niñera requeridos)');
    }

    // 1. Gestión de imagen en Google Drive
    let imagenFinal = String(payload.imagen || '').trim();
    if (payload.imagen_base64) {
        const nombreArchivo = `PLAN_${fechaISO}_${cliente.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        imagenFinal = await subirImagenDriveGAS(payload.imagen_base64, nombreArchivo);
    }

    // 2. Preparar registro para Supabase
    const row = {
        fecha: fechaISO,
        cliente: cliente,
        cliente_email: String(payload.cliente_email || payload.email || '').trim().toLowerCase(),
        nombre_ninera: nombreNinera,
        edad_nino: String(payload.edad_nino || '').trim(),
        area_desarrollo: String(payload.area_desarrollo || '').trim(),
        objetivo: String(payload.objetivo || '').trim(),
        descripcion: String(payload.descripcion || '').trim(),
        materiales: String(payload.materiales || '').trim(),
        imagen: imagenFinal,
        ciudad: String(payload.ciudad || '').trim(),
        actualizado_en: new Date().toISOString()
    };

    // Si es nueva creación, asegurar estado 'pendiente'
    if (!payload.estado_revision) {
        row.estado_revision = 'pendiente';
    }

    const { data, error } = await client
        .from('planeaciones_neuronanny')
        .upsert(row, { onConflict: 'fecha,cliente,nombre_ninera' })
        .select()
        .single();

    if (error) {
        console.error("❌ [Supabase Planeaciones Upsert Error]:", error);
        throw new Error('Error al guardar planeación en Supabase: ' + error.message);
    }

    return { ok: true, data: data, fila: data?.id || 1 };
}

/**
 * Reenvía una planeación con correcciones solicitadas por supervisión
 */
async function reenviarPlaneacionCorregidaSupabase(payload, emailSesion) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error('Cliente Supabase no inicializado');

    const fechaISO = String(payload.fecha || '').slice(0, 10);
    const cliente = String(payload.cliente || '').trim();
    const nombreNinera = String(payload.nombre_ninera || payload.nombreNinera || '').trim();

    let imagenFinal = String(payload.imagen || '').trim();
    if (payload.imagen_base64) {
        const nombreArchivo = `PLAN_CORR_${fechaISO}_${cliente.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        imagenFinal = await subirImagenDriveGAS(payload.imagen_base64, nombreArchivo);
    }

    const updateData = {
        area_desarrollo: String(payload.area_desarrollo || '').trim(),
        objetivo: String(payload.objetivo || '').trim(),
        descripcion: String(payload.descripcion || '').trim(),
        materiales: String(payload.materiales || '').trim(),
        imagen: imagenFinal,
        estado_revision: 'pendiente',
        fecha_correccion: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
    };

    let query = client.from('planeaciones_neuronanny').update(updateData);

    if (payload.id) {
        query = query.eq('id', payload.id);
    } else {
        query = query
            .eq('fecha', fechaISO)
            .ilike('cliente', cliente)
            .ilike('nombre_ninera', nombreNinera);
    }

    const { data, error } = await query.select();

    if (error) {
        console.error("❌ [Supabase Reenviar Error]:", error);
        throw new Error('Error al reenviar corrección en Supabase: ' + error.message);
    }

    return { ok: true, data };
}

/**
 * Guarda observaciones de supervisión y cambia estado a 'revisada' o 'a correccion'
 */
async function guardarObservacionesSupervisionSupabase(payload, emailSesion) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error('Cliente Supabase no inicializado');

    const ahora = new Date().toISOString();
    const updateData = {
        observaciones_supervision: String(payload.observaciones || '').trim(),
        actualizado_en: ahora
    };

    if (payload.tipo === 'revisada') {
        updateData.estado_revision = 'revisada';
        updateData.fecha_revision = ahora;
    } else if (payload.tipo === 'correccion') {
        updateData.estado_revision = 'a correccion';
        updateData.fecha_envio_correccion = ahora;
    }

    let query = client.from('planeaciones_neuronanny').update(updateData);

    if (payload.id) {
        query = query.eq('id', payload.id);
    } else if (payload.fecha && payload.cliente && payload.nombre_ninera) {
        query = query
            .eq('fecha', String(payload.fecha).slice(0, 10))
            .ilike('cliente', String(payload.cliente).trim())
            .ilike('nombre_ninera', String(payload.nombre_ninera).trim());
    } else if (payload.fila && typeof payload.fila === 'string' && payload.fila.length > 10) {
        query = query.eq('id', payload.fila);
    } else {
        throw new Error('Identificador de planeación no provisto.');
    }

    const { data, error } = await query.select();

    if (error) {
        console.error("❌ [Supabase Supervision Error]:", error);
        throw new Error('Error al guardar observaciones en Supabase: ' + error.message);
    }

    return { ok: true, data };
}

/**
 * Consulta una planeación individual en Supabase por fecha, cliente y niñera
 */
async function obtenerPlaneacionNeuronannySupabase(fecha, cliente, nombreNinera) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) return null;

    const fechaISO = String(fecha || '').slice(0, 10);
    const cliTrim = String(cliente || '').trim();
    const ninTrim = String(nombreNinera || '').trim();

    try {
        let q = client
            .from('planeaciones_neuronanny')
            .select('*')
            .eq('fecha', fechaISO);

        if (cliTrim) q = q.ilike('cliente', cliTrim);
        if (ninTrim) q = q.ilike('nombre_ninera', ninTrim);

        const { data, error } = await q.maybeSingle();

        if (error) {
            console.warn("⚠️ [Supabase Consulta Planeacion Warning]:", error.message);
            return null;
        }

        if (!data) return null;

        return {
            id: data.id,
            fila: data.id,
            fecha: data.fecha,
            cliente: data.cliente,
            nombre_ninera: data.nombre_ninera,
            area_desarrollo: data.area_desarrollo || '',
            'area de desarrollo': data.area_desarrollo || '',
            objetivo: data.objetivo || '',
            descripcion: data.descripcion || '',
            materiales: data.materiales || '',
            imagen: data.imagen || '',
            estado_revision: data.estado_revision || 'pendiente',
            'estado revision': data.estado_revision || 'pendiente',
            observaciones_supervision: data.observaciones_supervision || '',
            'observaciones supervision': data.observaciones_supervision || '',
            fecha_revision: data.fecha_revision || '',
            fecha_correccion: data.fecha_correccion || '',
            fecha_envio_correccion: data.fecha_envio_correccion || '',
            ciudad: data.ciudad || ''
        };
    } catch (e) {
        console.error("Error en obtenerPlaneacionNeuronannySupabase:", e);
        return null;
    }
}

/**
 * Carga masiva de planeaciones para navegación fluida en el modal
 */
async function obtenerPlaneacionesBulkSupabase(fechas, cliente, nombreNinera) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client || !Array.isArray(fechas) || fechas.length === 0) return {};

    const fechasISO = fechas.map(f => String(f).slice(0, 10));
    const cliTrim = String(cliente || '').trim();
    const ninTrim = String(nombreNinera || '').trim();

    try {
        let q = client
            .from('planeaciones_neuronanny')
            .select('*')
            .in('fecha', fechasISO);

        if (cliTrim) q = q.ilike('cliente', cliTrim);
        if (ninTrim) q = q.ilike('nombre_ninera', ninTrim);

        const { data, error } = await q;
        if (error || !Array.isArray(data)) return {};

        const res = {};
        data.forEach(p => {
            res[p.fecha] = {
                id: p.id,
                fila: p.id,
                fecha: p.fecha,
                cliente: p.cliente,
                nombre_ninera: p.nombre_ninera,
                area_desarrollo: p.area_desarrollo || '',
                'area de desarrollo': p.area_desarrollo || '',
                objetivo: p.objetivo || '',
                descripcion: p.descripcion || '',
                materiales: p.materiales || '',
                imagen: p.imagen || '',
                estado_revision: p.estado_revision || 'pendiente',
                'estado revision': p.estado_revision || 'pendiente',
                observaciones_supervision: p.observaciones_supervision || '',
                'observaciones supervision': p.observaciones_supervision || '',
                fecha_revision: p.fecha_revision || '',
                fecha_correccion: p.fecha_correccion || '',
                fecha_envio_correccion: p.fecha_envio_correccion || '',
                ciudad: p.ciudad || ''
            };
        });
        return res;
    } catch (e) {
        console.error("Error en obtenerPlaneacionesBulkSupabase:", e);
        return {};
    }
}

/**
 * Normaliza nombres de ciudades al estándar corporativo
 */
function normalizarCiudadPlaneacion(nombre) {
    if (!nombre) return 'Puebla';
    const n = String(nombre).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (n.includes('puebla')) return 'Puebla';
    if (n.includes('xalapa')) return 'Xalapa';
    if (n.includes('queretaro')) return 'Querétaro';
    if (n.includes('cdmx') || n.includes('mexico') || n.includes('federal') || n.includes('df')) return 'CDMX';
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/**
 * Obtiene el resumen de planeaciones para una semana específica agrupado por Ciudad
 * Consulta `control_servicios` y cruza con `planeaciones_neuronanny`, `nannys` y `clientes` en Supabase.
 */
async function obtenerResumenPlaneacionesSemanaSupabase(fechaBaseISO, filtroNanny = null, tiposPermitidos = TIPOS_SERVICIO_PLANEACION) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error('Cliente Supabase no inicializado');

    // 1. Calcular rango de fechas de la semana (Lunes a Domingo)
    const lunes = _startMondayPlaneacion(fechaBaseISO);
    const lunesISO = _toISOPlaneacion(lunes);

    const fechasSemana = [];
    for (let i = 0; i < 7; i++) {
        fechasSemana.push(_addDaysISOPlaneacion(lunesISO, i));
    }

    // 2. Consultar servicios en control_servicios para esta semana_iso
    let qServicios = client
        .from('control_servicios')
        .select('*')
        .eq('semana_iso', lunesISO);

    const { data: rowsServicios, error: errServicios } = await qServicios;
    if (errServicios) {
        console.error("Error al consultar servicios para planeaciones:", errServicios);
        throw errServicios;
    }

    // Filtrar solo tipos con planeación pedagógica y excluir bloques de control interno
    const tiposActivos = (Array.isArray(tiposPermitidos) && tiposPermitidos.length > 0) ? tiposPermitidos : TIPOS_SERVICIO_PLANEACION;
    const filasPedagogicas = (rowsServicios || []).filter(r => {
        let bId = (r.bloque || '').trim().toLowerCase();
        if (!bId && r.observaciones && typeof r.observaciones === 'string' && r.observaciones.includes('<!--bloque:')) {
            const mB = r.observaciones.match(/<!--bloque:(.*?)-->/);
            if (mB) bId = mB[1].trim().toLowerCase();
        }
        const BLOQUES_SOLO_ADMIN = ['proximos_servicios', 'clientes_espera', 'clientes_potenciales'];
        if (BLOQUES_SOLO_ADMIN.includes(bId)) return false;

        const tipo = _normTextoPlaneacion(r.tipo_servicio || '');
        const esPedagogico = tiposActivos.some(t => tipo.includes(_normTextoPlaneacion(t)));
        if (!esPedagogico) return false;

        // Si hay filtro de niñera, aplicarlo y exigir ok_nanny marcado
        if (filtroNanny) {
            if (r.ok_nanny !== true) return false;

            const rNanEmail = (r.nanny_email || '').trim().toLowerCase();
            const sesEmail = (typeof SESION !== 'undefined' && SESION?.email ? SESION.email : (window.SESION?.email || '')).trim().toLowerCase();
            if (sesEmail && rNanEmail && sesEmail === rNanEmail) {
                return true;
            }

            const nomFiltro = _normTextoPlaneacion(filtroNanny);
            const nomRow = _normTextoPlaneacion(r.nanny_nombre || '');
            const coincide = nomRow && nomFiltro && (nomRow === nomFiltro || nomRow.includes(nomFiltro) || nomFiltro.includes(nomRow));
            if (!coincide) return false;
        }
        return true;
    });

    // 3. Consultar información de clientes y niñeras para enriquecer ciudad, datos y peques
    let mapaClientes = {};
    let mapaNannys = {};
    try {
        const [resClis, resNans] = await Promise.all([
            client.from('clientes').select('*'),
            client.from('nannys').select('nombre, email, ciudad')
        ]);

        if (Array.isArray(resClis.data)) {
            resClis.data.forEach(c => {
                const em = (c.email || '').trim().toLowerCase();
                const nom = _normTextoPlaneacion(c.nombre || '');
                if (em) mapaClientes[em] = c;
                if (nom) mapaClientes[nom] = c;
            });
        }

        if (Array.isArray(resNans.data)) {
            resNans.data.forEach(n => {
                const em = (n.email || '').trim().toLowerCase();
                const nom = _normTextoPlaneacion(n.nombre || '');
                if (em) mapaNannys[em] = n;
                if (nom) mapaNannys[nom] = n;
            });
        }
    } catch (e) {
        console.warn("No se pudieron cargar clientes/nannys para enriquecer planeaciones:", e);
    }

    // 4. Transformar filas de control_servicios en asignaciones de días individuales
    const grupos = {};
    const DIAS_KEYS = [
        { key: 'lun', offset: 0 },
        { key: 'mar', offset: 1 },
        { key: 'mie', offset: 2 },
        { key: 'jue', offset: 3 },
        { key: 'vie', offset: 4 },
        { key: 'sab', offset: 5 },
        { key: 'dom', offset: 6 }
    ];

    filasPedagogicas.forEach(row => {
        const clienteNom = String(row.cliente_nombre || 'Cliente').trim();
        const nineraNom = String(row.nanny_nombre || '').trim();
        if (!clienteNom || !nineraNom) return;

        const infoCli = mapaClientes[(row.cliente_email || '').trim().toLowerCase()] ||
                         mapaClientes[_normTextoPlaneacion(clienteNom)] || {};

        const infoNanny = mapaNannys[(row.nanny_email || '').trim().toLowerCase()] ||
                          mapaNannys[_normTextoPlaneacion(nineraNom)] || {};

        const peques = [];
        const p1 = infoCli.peque_nombre || infoCli.nombre_del_peque || row.peque_nombre;
        if (p1) peques.push({ nombre: p1, nacimiento: infoCli.peque_nacimiento || infoCli.fecha_de_nacimiento || '' });
        const p2 = infoCli.peque_nombre_2 || infoCli.nombre_del_peque_2;
        if (p2) peques.push({ nombre: p2, nacimiento: infoCli.peque_nacimiento_2 || infoCli.fecha_de_nacimiento_2 || '' });
        const p3 = infoCli.peque_nombre_3 || infoCli.nombre_del_peque_3;
        if (p3) peques.push({ nombre: p3, nacimiento: infoCli.peque_nacimiento_3 || infoCli.fecha_de_nacimiento_3 || '' });

        // 🏙️ Determinación de la Ciudad Oficial (Nanny > Cliente > Zona > Default)
        let rawCiudad = infoNanny.ciudad || infoCli.ciudad || '';
        if (!rawCiudad && row.zona) {
            const zNorm = _normTextoPlaneacion(row.zona);
            if (zNorm.includes('puebla') || zNorm.includes('xalapa') || zNorm.includes('queretaro') || zNorm.includes('cdmx') || zNorm.includes('mexico')) {
                rawCiudad = row.zona;
            }
        }
        const ciudad = normalizarCiudadPlaneacion(rawCiudad);
        const tipoServicio = row.tipo_servicio || 'Neuronanny';
        const grupoKey = `${clienteNom}|${nineraNom}|${_normTextoPlaneacion(tipoServicio)}`.toLowerCase();

        if (!grupos[grupoKey]) {
            grupos[grupoKey] = {
                cliente: clienteNom,
                email: (row.cliente_email || infoCli.email || '').trim(),
                ninera: nineraNom,
                nombre_ninera: nineraNom,
                tipo_servicio: tipoServicio,
                ciudad: ciudad,
                dias: new Set(),
                peques_lista: peques
            };
        }

        DIAS_KEYS.forEach(d => {
            const hInicio = row[`${d.key}_inicio`];
            if (hInicio && String(hInicio).trim() !== '' && String(hInicio).trim() !== '-') {
                const fechaDia = _addDaysISOPlaneacion(lunesISO, d.offset);
                grupos[grupoKey].dias.add(fechaDia);
            }
        });
    });

    // 5. Consultar todas las planeaciones existentes en Supabase para estas fechas
    const { data: planeacionesExistentes, error: errPlaneaciones } = await client
        .from('planeaciones_neuronanny')
        .select('*')
        .in('fecha', fechasSemana);

    const mapaPlaneaciones = {};
    if (Array.isArray(planeacionesExistentes)) {
        planeacionesExistentes.forEach(p => {
            const fP = String(p.fecha).slice(0, 10);
            const cP = _normTextoPlaneacion(p.cliente || '');
            const nP = _normTextoPlaneacion(p.nombre_ninera || '');
            const key = `${fP}|${cP}|${nP}`;
            mapaPlaneaciones[key] = p;
        });
    }

    // 6. Construir el resumen por Ciudad y calcular estado de cumplimiento y revisión
    const ordenCiudades = ['Puebla', 'Xalapa', 'Querétaro', 'CDMX'];
    const resumen = {};

    Object.values(grupos).forEach(g => {
        const ciudad = g.ciudad;
        if (!resumen[ciudad]) resumen[ciudad] = [];

        const diasArray = Array.from(g.dias).sort();
        let planeacionesLlenas = 0;
        const estados = [];

        const detallePlaneaciones = diasArray.map(fechaDia => {
            const key = `${fechaDia}|${_normTextoPlaneacion(g.cliente)}|${_normTextoPlaneacion(g.ninera)}`;
            const plan = mapaPlaneaciones[key];
            const estadoRev = plan ? _normTextoPlaneacion(plan.estado_revision || 'pendiente') : 'pendiente';

            if (plan) {
                planeacionesLlenas++;
                estados.push(estadoRev);
            }

            return {
                fecha: fechaDia,
                estado: estadoRev,
                tiene: !!plan,
                id: plan?.id || null
            };
        });

        const tienePlaneacion = diasArray.length > 0 && planeacionesLlenas === diasArray.length;

        let estadoRevision = 'pendiente';
        if (tienePlaneacion) {
            if (estados.some(e => e.includes('correccion'))) {
                estadoRevision = 'a correccion';
            } else if (estados.length > 0 && estados.every(e => e === 'revisada')) {
                estadoRevision = 'revisada';
            }
        }

        resumen[ciudad].push({
            cliente: g.cliente,
            email: g.email,
            ninera: g.ninera,
            nombre_ninera: g.ninera,
            tipo_servicio: g.tipo_servicio,
            dias: diasArray,
            tienePlaneacion: tienePlaneacion,
            estado_revision: estadoRevision,
            planeaciones: detallePlaneaciones,
            peques_lista: g.peques_lista
        });
    });

    // Ordenar las ciudades según orden estándar y los elementos alfabéticamente
    const resumenOrdenado = {};
    const ciudadesPresentes = Object.keys(resumen).sort((a, b) => {
        const idxA = ordenCiudades.indexOf(a);
        const idxB = ordenCiudades.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    ciudadesPresentes.forEach(c => {
        resumenOrdenado[c] = resumen[c].sort((a, b) => {
            return (a.cliente || '').localeCompare(b.cliente || '', 'es', { sensitivity: 'base' });
        });
    });

    return resumenOrdenado;
}

/**
 * Obtiene el resumen de planeaciones consolidado de semanas para supervisión
 * Retorna { actual, siguiente, anterior }
 */
async function obtenerResumenPlaneacionesDosSemanasSupabase() {
    const { isoActual, isoSiguiente, isoAnterior } = calcularLunesSemanasSupervision();

    const [actual, siguiente, anterior] = await Promise.all([
        obtenerResumenPlaneacionesSemanaSupabase(isoActual, null),
        obtenerResumenPlaneacionesSemanaSupabase(isoSiguiente, null),
        obtenerResumenPlaneacionesSemanaSupabase(isoAnterior, null)
    ]);

    return { actual, siguiente, anterior };
}

/**
 * Obtiene los servicios requeridos para la pestaña "Sugeridor" (Semana actual y semana anterior)
 */
async function obtenerResumenServiciosSugeridorSupabase() {
    const { isoActual, isoAnterior } = calcularLunesSemanasSupervision();

    const [actual, anterior] = await Promise.all([
        obtenerResumenPlaneacionesSemanaSupabase(isoActual, null, TIPOS_SERVICIO_SUGERIDOR),
        obtenerResumenPlaneacionesSemanaSupabase(isoAnterior, null, TIPOS_SERVICIO_SUGERIDOR)
    ]);

    return { actual, anterior };
}

/**
 * Consulta las actividades planificadas para el panel del Cliente (semana actual y siguiente)
 */
async function obtenerActividadesClienteSupabase(clienteEmail, clienteNombre) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) throw new Error('Cliente Supabase no inicializado');

    const { isoActual, isoSiguiente } = calcularLunesSemanasSupervision();
    const isoStrActual = isoActual;
    const isoStrActualFin = _addDaysISOPlaneacion(isoStrActual, 6);
    const isoStrSiguiente = isoSiguiente;
    const isoStrSiguienteFin = _addDaysISOPlaneacion(isoStrSiguiente, 6);

    const emailNorm = String(clienteEmail || window.SESION?.email || '').trim().toLowerCase();

    // Lista de identificadores y alias para matching flexible y tolerante a tildes/espacios
    const aliases = new Set();
    if (clienteNombre) aliases.add(_normTextoPlaneacion(clienteNombre));
    if (window.SESION?.nombre) aliases.add(_normTextoPlaneacion(window.SESION.nombre));
    if (window.CACHE_CLIENTE?.profile?.nombre) aliases.add(_normTextoPlaneacion(window.CACHE_CLIENTE.profile.nombre));
    if (window.CACHE_CLIENTE?.profile?.nombre_completo) aliases.add(_normTextoPlaneacion(window.CACHE_CLIENTE.profile.nombre_completo));

    // Incluir nombres de clientes de servicios cargados previamente si existen
    if (Array.isArray(window.CACHE_CLIENTE?.servicios)) {
        window.CACHE_CLIENTE.servicios.forEach(s => {
            const nom = s.cliente_nombre || s.cliente || '';
            if (nom) aliases.add(_normTextoPlaneacion(nom));
        });
    }

    // Consultar planeaciones de las 2 semanas en Supabase
    const { data: rows, error } = await client
        .from('planeaciones_neuronanny')
        .select('*')
        .gte('fecha', isoStrActual)
        .lte('fecha', isoStrSiguienteFin)
        .order('fecha', { ascending: true });

    if (error) {
        console.error("❌ [Supabase Actividades Cliente Error]:", error);
        throw error;
    }

    const result = { actual: [], siguiente: [] };

    (rows || []).forEach(r => {
        const rEmail = String(r.cliente_email || '').trim().toLowerCase();
        const rCliNorm = _normTextoPlaneacion(r.cliente || '');

        let match = false;
        if (emailNorm && rEmail && (rEmail === emailNorm || emailNorm.includes(rEmail) || rEmail.includes(emailNorm))) {
            match = true;
        } else if (aliases.size > 0) {
            for (const alias of aliases) {
                if (!alias) continue;
                if (rCliNorm === alias || rCliNorm.includes(alias) || alias.includes(rCliNorm)) {
                    match = true;
                    break;
                }
            }
        } else if (emailNorm && rCliNorm) {
            const userPart = emailNorm.split('@')[0].replace(/[._-]/g, ' ');
            if (rCliNorm.includes(_normTextoPlaneacion(userPart))) {
                match = true;
            }
        }

        if (!match) return;

        const item = {
            id: r.id,
            fecha: r.fecha,
            cliente: r.cliente,
            'nombre de ninera': r.nombre_ninera,
            nombre_ninera: r.nombre_ninera,
            'area de desarrollo': r.area_desarrollo,
            area_desarrollo: r.area_desarrollo,
            objetivo: r.objetivo,
            descripcion: r.descripcion,
            materiales: r.materiales,
            imagen: r.imagen,
            estado_revision: r.estado_revision,
            observaciones_supervision: r.observaciones_supervision
        };

        const f = String(r.fecha).slice(0, 10);
        if (f >= isoStrActual && f <= isoStrActualFin) {
            result.actual.push(item);
        } else if (f >= isoStrSiguiente && f <= isoStrSiguienteFin) {
            result.siguiente.push(item);
        }
    });

    return result;
}

/**
 * Suscribe a cambios en tiempo real en la tabla planeaciones_neuronanny
 */
function suscribirRealtimePlaneaciones() {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client || window._planeacionesSubscribed) return;
    window._planeacionesSubscribed = true;

    try {
        client.channel('realtime_planeaciones_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'planeaciones_neuronanny' }, (payload) => {
                console.log("⚡ [Realtime Planeaciones] Cambio detectado en planeaciones:", payload.eventType);
                clearTimeout(window._tRefreshPlaneaciones);
                window._tRefreshPlaneaciones = setTimeout(() => {
                    if (typeof SESION === 'undefined') return;

                    if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.planeaciones = null;
                    if (typeof CACHE_PLANEACIONES !== 'undefined') CACHE_PLANEACIONES = {};
                    if (typeof PLANEACION_SESSION_ID !== 'undefined') PLANEACION_SESSION_ID++;

                    if (SESION.admin || SESION.supervision) {
                        if (typeof cargarResumenPlaneaciones === 'function') {
                            cargarResumenPlaneaciones(true, true);
                        }
                    } else if (SESION.cliente) {
                        if (typeof cargarActividadesCliente === 'function') {
                            cargarActividadesCliente(true);
                        }
                    } else {
                        // Niñera
                        if (typeof cargarResumenPlaneacionesNinera === 'function') {
                            cargarResumenPlaneacionesNinera(true, true);
                        }
                    }
                }, 400);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'control_servicios' }, (payload) => {
                console.log("⚡ [Realtime Matriz -> Planeaciones] Modificación detectada en control_servicios:", payload.eventType);
                clearTimeout(window._tRefreshPlaneacionesMatriz);
                window._tRefreshPlaneacionesMatriz = setTimeout(() => {
                    if (typeof SESION === 'undefined') return;

                    // Limpiar caché de planeaciones para recalcular el nuevo estado de la matriz
                    if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.planeaciones = null;
                    if (typeof CACHE_PLANEACIONES !== 'undefined') CACHE_PLANEACIONES = {};
                    if (typeof PLANEACION_SESSION_ID !== 'undefined') PLANEACION_SESSION_ID++;

                    if (!SESION.admin && !SESION.supervision && !SESION.cliente) {
                        // Niñera: Actualizar automáticamente el resumen de planeaciones sin presionar botón
                        if (typeof cargarResumenPlaneacionesNinera === 'function') {
                            console.log("🔄 [Auto-sync Niñera] Recargando planeaciones de actividades por cambio en matriz de servicios...");
                            cargarResumenPlaneacionesNinera(true, true);
                        }
                    } else if (SESION.admin || SESION.supervision) {
                        if (typeof cargarResumenPlaneaciones === 'function') {
                            cargarResumenPlaneaciones(true, true);
                        }
                    } else if (SESION.cliente) {
                        if (typeof cargarActividadesCliente === 'function') {
                            cargarActividadesCliente(true);
                        }
                    }
                }, 400);
            })
            .subscribe();
    } catch (e) {
        console.warn("No se pudo suscribir a realtime de planeaciones:", e);
    }
}

// Auto-iniciar suscripción en tiempo real cuando la ventana esté lista
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            suscribirRealtimePlaneaciones();
        }, 1500);
    });
}

// Exportación al ámbito global para uso en la PWA
window.calcularLunesSemanasSupervision = calcularLunesSemanasSupervision;
window.subirImagenDriveGAS = subirImagenDriveGAS;
window.guardarPlaneacionSupabase = guardarPlaneacionSupabase;
window.reenviarPlaneacionCorregidaSupabase = reenviarPlaneacionCorregidaSupabase;
window.guardarObservacionesSupervisionSupabase = guardarObservacionesSupervisionSupabase;
window.obtenerPlaneacionNeuronannySupabase = obtenerPlaneacionNeuronannySupabase;
window.obtenerPlaneacionesBulkSupabase = obtenerPlaneacionesBulkSupabase;
window.obtenerResumenPlaneacionesSemanaSupabase = obtenerResumenPlaneacionesSemanaSupabase;
window.obtenerResumenPlaneacionesDosSemanasSupabase = obtenerResumenPlaneacionesDosSemanasSupabase;
window.obtenerResumenServiciosSugeridorSupabase = obtenerResumenServiciosSugeridorSupabase;
window.obtenerActividadesClienteSupabase = obtenerActividadesClienteSupabase;
window.suscribirRealtimePlaneaciones = suscribirRealtimePlaneaciones;

