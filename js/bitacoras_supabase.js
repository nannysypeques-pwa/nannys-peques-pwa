/**
 * =========================================================================
 * NANNYS Y PEQUES - MÓDULO BITÁCORAS SUPABASE (TIEMPO REAL)
 * =========================================================================
 * Reemplaza completamente Google Apps Script para el reporte diario.
 * Permite almacenamiento persistente, sincronización bidireccional inmediata
 * y visualización en vivo tanto para la familia como para la niñera.
 */

(function (window) {
    'use strict';

    let _canalRealtimeBitacora = null;
    let _debounceTimerAutoSave = null;
    let _estaGuardando = false;

    /**
     * Obtiene la instancia activa de Supabase
     */
    function _getClient() {
        if (typeof window.getSupabaseClient === 'function') {
            return window.getSupabaseClient();
        }
        if (typeof supabase !== 'undefined' && window.CONFIG?.SUPABASE_URL && window.CONFIG?.SUPABASE_ANON_KEY) {
            return supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
        }
        console.error('❌ [Bitacoras Supabase] Cliente Supabase no disponible.');
        return null;
    }

    /**
     * Normaliza cadenas para comparaciones robustas
     */
    function _cleanStr(str) {
        if (!str) return '';
        return String(str).trim();
    }

    /**
     * Obtiene la clave de día estándar ('lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom')
     */
    function _obtenerDiaClave(fechaISO, diaClaveSvc) {
        if (diaClaveSvc) return String(diaClaveSvc).toLowerCase().trim();
        if (!fechaISO) return 'lun';
        const diasClaves = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
        try {
            const d = new Date(String(fechaISO).slice(0, 10) + 'T12:00:00');
            return diasClaves[d.getDay()] || 'lun';
        } catch (e) {
            return 'lun';
        }
    }

    /**
     * Mapea un registro de Supabase al formato consumido por la UI y caché de la app
     */
    function formatearRegistroBitacora(data) {
        if (!data) return null;

        const respuestas = data.respuestas || {};
        const fechaISO = String(data.fecha || data.Fecha || '').slice(0, 10);
        const cliNombre = data.cliente_nombre || data.cliente || data['Nombre cliente'] || '';
        const cliEmail = data.cliente_email || data['correo cliente'] || '';
        const ninNombre = data.ninera_nombre || data.ninera || data['nombre niñera'] || '';
        const ninEmail = data.ninera_email || data['correo niñera'] || '';

        const mapeado = {
            id: data.id,
            Fecha: fechaISO,
            fecha: fechaISO,
            'correo niñera': ninEmail,
            'nombre niñera': ninNombre,
            'correo cliente': cliEmail,
            'Nombre cliente': cliNombre,
            cliente: cliNombre,
            ninera: ninNombre,
            estado: (data.acepta === 'Sí' || data.Acepta === 'Sí' || data.fecha_acepta || data.estado === 'aprobada') ? 'aprobada' : (data.estado || 'borrador'),
            Acepta: data.acepta || data.Acepta || '',
            acepta: data.acepta || data.Acepta || '',
            fecha_acepta: data.fecha_acepta || null,
            cliente_acepta_nombre: data.cliente_acepta_nombre || '',
            cliente_acepta_email: data.cliente_acepta_email || '',
            evidencia_aceptacion: data.evidencia_aceptacion || null,
            Revisada: data.revisada || data.Revisada || '',
            revisada: data.revisada || data.Revisada || '',
            fecha_revisada: data.fecha_revisada || null,
            supervisor_reviso_nombre: data.supervisor_reviso_nombre || '',
            supervisor_reviso_email: data.supervisor_reviso_email || '',
            estado_revision: data.estado_revision || (data.revisada === 'Sí' || data.Revisada === 'Sí' || data.fecha_revisada ? 'revisada' : ''),
            evidencia_revision: data.evidencia_revision || null,
            'Fecha de creación': data.creado_en || data.actualizado_en || data['Fecha de creación'] || new Date().toISOString(),
            creado_en: data.creado_en || data['Fecha de creación'] || new Date().toISOString(),
            actualizado_en: data.actualizado_en || new Date().toISOString(),
            respuestas: respuestas
        };

        // Extraer preguntas 1 a 24 desde `respuestas` o directamente desde data
        for (let i = 1; i <= 24; i++) {
            const keyP = `p${i}`;
            let val = respuestas[keyP] !== undefined ? respuestas[keyP] : (data[`Pregunta ${i}`] || data[keyP] || '');
            if (i === 1 && (respuestas.p1_cuales || data.p1_cuales)) {
                const sCuales = respuestas.p1_cuales || data.p1_cuales;
                if (!String(val).includes(sCuales)) {
                    val += ` / ${sCuales}`;
                }
            }
            mapeado[`Pregunta ${i}`] = val;
            mapeado[keyP] = respuestas[keyP] !== undefined ? respuestas[keyP] : (data[keyP] || '');
        }
        mapeado.p1_cuales = respuestas.p1_cuales || data.p1_cuales || '';

        // Campos resumidos para tarjetas y previsualizaciones en el portal del cliente
        mapeado['Check-in'] = respuestas.p23 || mapeado['Pregunta 23'] || '';
        mapeado.checkin = mapeado['Check-in'];
        mapeado['Check-out'] = respuestas.p24 || mapeado['Pregunta 24'] || '';
        mapeado.checkout = mapeado['Check-out'];
        // Estado de ánimo real del peque (p13: Feliz/Triste/Enojado)
        mapeado['Estado de ánimo'] = respuestas.p13 || mapeado['Pregunta 13'] || respuestas.p16 || mapeado['Pregunta 16'] || '';
        mapeado.animo = mapeado['Estado de ánimo'];
        mapeado['Actividades'] = respuestas.p15 || mapeado['Pregunta 15'] || '';
        mapeado.actividades = mapeado['Actividades'];

        const comidas = [respuestas.p8, respuestas.p10, respuestas.p12].filter(Boolean);
        mapeado['Alimentos'] = comidas.length > 0 ? comidas.join(' • ') : (respuestas.p7 === 'Sí' || respuestas.p9 === 'Sí' ? 'Alimentación adecuada' : '');
        mapeado.alimentos = mapeado['Alimentos'];

        // Recepción: sin síntomas de enfermedad (p1: Sí/No)
        mapeado['Sin síntomas'] = respuestas.p1 || mapeado['Pregunta 1'] || '';
        mapeado.sin_sintomas = mapeado['Sin síntomas'];
        mapeado.p1_cuales_display = respuestas.p1_cuales || mapeado.p1_cuales || '';

        // Accidente durante el servicio (p17: Sí/No)
        mapeado['Accidente'] = respuestas.p17 || mapeado['Pregunta 17'] || '';
        mapeado.accidente = mapeado['Accidente'];

        // Entrega en buen estado físico (p19: Sí/No)
        mapeado['Entrega en buen estado'] = respuestas.p19 || mapeado['Pregunta 19'] || '';
        mapeado.entrega_buen_estado = mapeado['Entrega en buen estado'];

        mapeado['Observaciones generales'] = respuestas.p21 || respuestas.p20 || mapeado['Pregunta 21'] || '';
        mapeado.observaciones = mapeado['Observaciones generales'];
        mapeado['Notas'] = mapeado['Observaciones generales'];

        return mapeado;
    }

    /**
     * Calcula el lunes (formato YYYY-MM-DD) de forma segura y sin desfaces de zona horaria
     */
    function _calcularLunesISO(fechaStr) {
        if (!fechaStr) return '';
        try {
            const [y, m, d] = String(fechaStr).slice(0, 10).split('-').map(Number);
            const date = new Date(y, m - 1, d, 12, 0, 0);
            const day = date.getDay();
            const diff = (day === 0 ? -6 : 1 - day);
            const monday = new Date(y, m - 1, d + diff, 12, 0, 0);
            const yStr = monday.getFullYear();
            const mStr = String(monday.getMonth() + 1).padStart(2, '0');
            const dStr = String(monday.getDate()).padStart(2, '0');
            return `${yStr}-${mStr}-${dStr}`;
        } catch (e) {
            return '';
        }
    }

    /**
     * Consulta una bitácora en Supabase (control_servicios con fallback a caché local)
     */
    async function obtenerBitacoraSupabase(fecha, cliente, ninera, servicioId = null) {
        const fechaISO = String(fecha || '').slice(0, 10);
        const cliClean = _cleanStr(cliente);
        const ninClean = _cleanStr(ninera);
        const diaClave = _obtenerDiaClave(fechaISO);
        const normNin = typeof window._norm === 'function' ? window._norm(ninClean) : ninClean.toLowerCase();

        const cacheKeyExact = `${fechaISO}_${cliClean}_${normNin}`;
        const cacheKeyAlt = `${fechaISO}_${cliClean}_${normNin}`;
        const cacheKeySimple = `${fechaISO}_${cliClean}`;

        const client = _getClient();

        // 1. Consultar directamente en Supabase (control_servicios) como fuente de la verdad
        if (client) {
            try {
                let rowsCs = [];
                let rId = servicioId;
                if (rId && typeof rId === 'string' && rId.includes('_')) {
                    rId = rId.slice(0, rId.lastIndexOf('_'));
                }
                if (rId) {
                    const { data: rFound } = await client.from('control_servicios').select('*').eq('id', rId).maybeSingle();
                    if (rFound) rowsCs = [rFound];
                }

                if (rowsCs.length === 0) {
                    const lunesISO = _calcularLunesISO(fechaISO);
                    let q = client.from('control_servicios').select('*');
                    if (lunesISO) {
                        q = q.eq('semana_iso', lunesISO);
                    }
                    if (cliClean) {
                        q = q.ilike('cliente_nombre', `%${cliClean}%`);
                    }
                    const { data: rList } = await q;
                    if (rList && rList.length > 0) {
                        const cNorm = _normTexto(cliClean);
                        const nNorm = _normTexto(ninClean);
                        rowsCs = rList.filter(r => {
                            const rCli = _normTexto(r.cliente_nombre || '');
                            const rNan = _normTexto(r.nanny_nombre || '');
                            const matchCli = !cNorm || rCli.includes(cNorm) || cNorm.includes(rCli);
                            const matchNan = !nNorm || rNan === nNorm || rNan.includes(nNorm) || nNorm.includes(rNan);
                            return matchCli && matchNan;
                        });
                        if (rowsCs.length === 0) {
                            rowsCs = rList.filter(r => {
                                const rCli = _normTexto(r.cliente_nombre || '');
                                return !cNorm || rCli.includes(cNorm) || cNorm.includes(rCli);
                            });
                        }
                        if (rowsCs.length === 0) rowsCs = rList;
                    }
                }

                // Ordenar filas por más recientemente actualizadas
                rowsCs.sort((a, b) => (b.actualizado_en || '').localeCompare(a.actualizado_en || ''));

                for (const row of rowsCs) {
                    if (!row.observaciones) continue;
                    // Prioridad 1: Fecha exacta YYYY-MM-DD
                    const regexFecha = new RegExp(`<!--bitacora_${fechaISO}:(.*?)-->`);
                    let m = row.observaciones.match(regexFecha);
                    // Prioridad 2: Día clave abreviado (lun, mar, etc.)
                    if (!m) {
                        const regexDia = new RegExp(`<!--bitacora_${diaClave}:(.*?)-->`);
                        m = row.observaciones.match(regexDia);
                    }
                    if (m && m[1]) {
                        try {
                            const raw = JSON.parse(m[1]);
                            const form = formatearRegistroBitacora(raw);
                            if (form) {
                                if (window.BITACORA_CACHE) {
                                    window.BITACORA_CACHE[cacheKeyExact] = form;
                                    window.BITACORA_CACHE[cacheKeyAlt] = form;
                                    window.BITACORA_CACHE[cacheKeySimple] = form;
                                }
                                try {
                                    localStorage.setItem('BITACORA_DRAFT_' + cacheKeyExact, JSON.stringify(form));
                                    localStorage.setItem('BITACORA_DRAFT_' + cacheKeySimple, JSON.stringify(form));
                                } catch (e) { }
                                return form;
                            }
                        } catch (eParse) { }
                    }
                }
            } catch (eCs) {
                console.warn('⚠️ [Bitacoras Supabase] Error consultando control_servicios:', eCs);
            }
        }

        // 2. Fallback a caché local en memoria o LocalStorage si no hay conexión o no se encontró en Supabase
        if (window.BITACORA_CACHE) {
            if (window.BITACORA_CACHE[cacheKeyExact]) return window.BITACORA_CACHE[cacheKeyExact];
            if (window.BITACORA_CACHE[cacheKeySimple]) return window.BITACORA_CACHE[cacheKeySimple];
            const matchingKey = Object.keys(window.BITACORA_CACHE).find(k => k.startsWith(fechaISO) && (k.toLowerCase().includes(cliClean.toLowerCase()) || cliClean.toLowerCase().includes(k.toLowerCase())));
            if (matchingKey) return window.BITACORA_CACHE[matchingKey];
        }

        try {
            const lsRaw = localStorage.getItem('BITACORA_DRAFT_' + cacheKeyExact) ||
                localStorage.getItem('BITACORA_DRAFT_' + cacheKeySimple);
            if (lsRaw) {
                const parsedLs = JSON.parse(lsRaw);
                if (parsedLs) {
                    if (window.BITACORA_CACHE) window.BITACORA_CACHE[cacheKeyExact] = parsedLs;
                    return parsedLs;
                }
            }
        } catch (eLs) { }

        return null;
    }

    /**
     * Guarda o actualiza una bitácora en Supabase con persistencia automática en tiempo real
     */
    async function guardarBitacoraSupabase(servicio, respuestas, estado = 'borrador') {
        const client = _getClient();
        if (!client) throw new Error('Cliente Supabase no disponible');

        // Protección crítica: NUNCA auto-guardar si estamos en modo solo lectura o durante la carga inicial
        if (window.BITACORA_SOLO_LECTURA && estado === 'borrador') {
            console.log('🛡️ [Bitacoras Supabase] Guardado omitido: bitácora en modo solo lectura.');
            return null;
        }
        if (window._cargandoBitacora && estado === 'borrador') {
            console.log('🛡️ [Bitacoras Supabase] Guardado omitido: formulario aún cargando datos.');
            return null;
        }

        const backdrop = document.getElementById('bitacoraBackdrop');
        if (backdrop && backdrop.classList.contains('bitacora-solo-lectura') && estado === 'borrador') {
            console.log('🛡️ [Bitacoras Supabase] Guardado omitido: backdrop con clase solo lectura.');
            return null;
        }

        const fechaISO = String(servicio.fecha || servicio.Fecha || '').slice(0, 10);
        const cliente = _cleanStr(servicio.cliente || servicio.nombre_cliente || servicio['Nombre cliente'] || 'Cliente');
        const ninera = _cleanStr(servicio.nombre_ninera || servicio.ninera || servicio['Nombre de la niñera'] || (window.SESION?.nombre) || 'Niñera');
        const emailCliente = _cleanStr(servicio.email || servicio.correo_cliente);
        const emailNinera = _cleanStr(servicio.correo_ninera || (window.SESION?.email));
        const tipoServicio = _cleanStr(servicio.tipo_servicio || servicio.servicio || 'Servicio');
        const servicioId = String(servicio.id || servicio.servicio_id || '');
        const diaClave = _obtenerDiaClave(fechaISO, servicio.dia_clave);

        if (!fechaISO) {
            throw new Error('Fecha es requerida para guardar la bitácora');
        }

        // Validación anti-destrucción: si las respuestas están completamente vacías y es un guardado automático, evitar sobreescribir datos previos
        if (estado === 'borrador' && respuestas && typeof respuestas === 'object') {
            const keysConValor = Object.keys(respuestas).filter(k => respuestas[k] !== undefined && String(respuestas[k]).trim() !== '');
            if (keysConValor.length === 0) {
                console.log('🛡️ [Bitacoras Supabase] Guardado omitido: payload de respuestas completamente vacío.');
                return null;
            }
        }

        const payloadRow = {
            fecha: fechaISO,
            cliente_nombre: cliente,
            cliente_email: emailCliente,
            ninera_nombre: ninera,
            ninera_email: emailNinera,
            tipo_servicio: tipoServicio,
            servicio_id: servicioId,
            respuestas: respuestas,
            estado: estado,
            actualizado_en: new Date().toISOString()
        };

        const registroFormateado = formatearRegistroBitacora({
            ...payloadRow,
            id: servicioId || `bit_${Date.now()}`
        });

        // 💾 Persistencia inmediata en memoria y LocalStorage para nunca perder cambios
        const normNin = typeof window._norm === 'function' ? window._norm(ninera) : ninera.toLowerCase();
        const cacheKeyExact = `${fechaISO}_${emailCliente || cliente}_${normNin}`;
        const cacheKeyAlt = `${fechaISO}_${cliente}_${normNin}`;
        const cacheKeySimple = `${fechaISO}_${cliente}`;

        if (window.BITACORA_CACHE) {
            window.BITACORA_CACHE[cacheKeyExact] = registroFormateado;
            window.BITACORA_CACHE[cacheKeyAlt] = registroFormateado;
            window.BITACORA_CACHE[cacheKeySimple] = registroFormateado;
        }
        try {
            localStorage.setItem('BITACORA_DRAFT_' + cacheKeyExact, JSON.stringify(registroFormateado));
            localStorage.setItem('BITACORA_DRAFT_' + cacheKeyAlt, JSON.stringify(registroFormateado));
            localStorage.setItem('BITACORA_DRAFT_' + cacheKeySimple, JSON.stringify(registroFormateado));
        } catch (eLs) { }

        _estaGuardando = true;

        try {
            // 🚀 PERSISTENCIA 1: Guardar en control_servicios (matriz central en tiempo real)
            let rowId = servicio.row_id;
            if (!rowId && servicioId && servicioId.includes('_')) {
                rowId = servicioId.slice(0, servicioId.lastIndexOf('_'));
            }
            if (!rowId && servicioId && !servicioId.startsWith('srv_') && !servicioId.startsWith('bit_')) {
                rowId = servicioId;
            }

            let curRow = null;
            if (rowId) {
                const { data: r } = await client.from('control_servicios').select('*').eq('id', rowId).maybeSingle();
                if (r) curRow = r;
            }

            if (!curRow) {
                const lunesISO = servicio.semana_iso || _toISO(_startMonday(fechaISO));
                let q = client.from('control_servicios').select('*').eq('semana_iso', lunesISO);
                const { data: rowsFound } = await q;
                if (rowsFound && rowsFound.length > 0) {
                    const cNorm = _normTexto(cliente);
                    const nNorm = _normTexto(ninera);
                    curRow = rowsFound.find(r => {
                        const rCli = _normTexto(r.cliente_nombre || '');
                        const rNan = _normTexto(r.nanny_nombre || '');
                        return (rCli.includes(cNorm) || cNorm.includes(rCli)) && (!nNorm || rNan.includes(nNorm) || nNorm.includes(rNan));
                    }) || rowsFound.find(r => {
                        const rCli = _normTexto(r.cliente_nombre || '');
                        return rCli.includes(cNorm) || cNorm.includes(rCli);
                    }) || rowsFound[0];
                }
            }

            if (curRow) {
                const tagDia = `<!--bitacora_${diaClave}:${JSON.stringify(registroFormateado)}-->`;
                const tagFecha = `<!--bitacora_${fechaISO}:${JSON.stringify(registroFormateado)}-->`;
                const regexDia = new RegExp(`<!--bitacora_${diaClave}:.*?-->`, 'g');
                const regexFecha = new RegExp(`<!--bitacora_${fechaISO}:.*?-->`, 'g');
                let cleanObs = (curRow.observaciones || '').replace(regexDia, '').replace(regexFecha, '').trim();
                const nuevaObs = `${tagDia} ${tagFecha} ${cleanObs}`.trim();

                const { error: errUpd } = await client.from('control_servicios').update({
                    observaciones: nuevaObs,
                    actualizado_en: new Date().toISOString()
                }).eq('id', curRow.id);

                if (errUpd) {
                    console.error('❌ Error actualizando control_servicios:', errUpd);
                } else {
                    console.log(`⚡ [Bitacoras Supabase] Sincronizado en control_servicios día ${diaClave} (${fechaISO}):`, curRow.id);
                }
            } else {
                console.warn('⚠️ [Bitacoras Supabase] No se encontró fila de control_servicios para:', servicioId, cliente);
            }



            // ⚡ BROADCAST EN TIEMPO REAL: Notificar inmediatamente a clientes y niñeras con vista abierta
            const payloadBroadcast = {
                fecha: fechaISO,
                cliente: cliente,
                ninera: ninera,
                dia_clave: diaClave,
                servicio_id: servicioId,
                registro: registroFormateado,
                timestamp: Date.now()
            };

            try {
                const ch = client.channel('realtime_portal_servicios');
                ch.send({
                    type: 'broadcast',
                    event: 'bitacora_live',
                    payload: payloadBroadcast
                }).catch(() => { });
            } catch (eBc1) { }

            try {
                if (typeof BroadcastChannel !== 'undefined') {
                    const bc = new BroadcastChannel('nyp_bitacoras_channel');
                    bc.postMessage(payloadBroadcast);
                    setTimeout(() => { bc.close(); }, 500);
                }
            } catch (eBc2) { }

            // Refrescar visualización en el portal del cliente si está activo en la misma pestaña
            if (window.ClienteServicios && typeof window.ClienteServicios.renderBitacora === 'function') {
                window.ClienteServicios.renderBitacora();
            }

            return registroFormateado;

        } catch (error) {
            console.error('❌ [Bitacoras Supabase] Error guardando bitácora:', error);
            throw error;
        } finally {
            _estaGuardando = false;
        }
    }

    /**
     * Marca la bitácora como Aceptada por el cliente y cambia su estado a 'aprobada'
     * Guarda la fecha, hora exacta y datos del cliente como evidencia de conformidad.
     */
    async function aceptarBitacoraSupabase(fecha, cliente, ninera, servicioId = null, servicioObj = null) {
        const client = _getClient();
        if (!client) throw new Error('Cliente Supabase no disponible');

        const fechaISO = String(fecha || '').slice(0, 10);
        const cliClean = _cleanStr(cliente || servicioObj?.cliente || servicioObj?.nombre_cliente || window.SESION?.nombre || '');
        const ninClean = _cleanStr(ninera || servicioObj?.nombre_ninera || servicioObj?.ninera || '');
        const diaClave = _obtenerDiaClave(fechaISO, servicioObj?.dia_clave);
        const fechaHoraAcepta = new Date().toISOString();
        const emailCliente = _cleanStr(servicioObj?.email || servicioObj?.cliente_email || servicioObj?.correo_cliente || window.SESION?.email || '');

        let registroFormateado = null;

        // 1. Actualizar en control_servicios (matriz principal)
        try {
            let rowId = servicioId || servicioObj?.row_id;
            if (rowId && typeof rowId === 'string' && rowId.includes('_')) {
                rowId = rowId.slice(0, rowId.lastIndexOf('_'));
            }

            let curRow = null;
            if (rowId && !rowId.startsWith('srv_') && !rowId.startsWith('bit_')) {
                const { data: r } = await client.from('control_servicios').select('*').eq('id', rowId).maybeSingle();
                if (r) curRow = r;
            }

            if (!curRow) {
                const lunesISO = servicioObj?.semana_iso || _calcularLunesISO(fechaISO);
                let q = client.from('control_servicios').select('*');
                if (lunesISO) q = q.eq('semana_iso', lunesISO);
                if (cliClean) q = q.ilike('cliente_nombre', `%${cliClean}%`);
                const { data: rowsFound } = await q;

                if (rowsFound && rowsFound.length > 0) {
                    const cNorm = _normTexto(cliClean);
                    const nNorm = _normTexto(ninClean);
                    curRow = rowsFound.find(r => {
                        const rCli = _normTexto(r.cliente_nombre || '');
                        const rNan = _normTexto(r.nanny_nombre || '');
                        return (rCli.includes(cNorm) || cNorm.includes(rCli)) && (!nNorm || rNan.includes(nNorm) || nNorm.includes(rNan));
                    }) || rowsFound.find(r => {
                        const rCli = _normTexto(r.cliente_nombre || '');
                        return rCli.includes(cNorm) || cNorm.includes(rCli);
                    }) || rowsFound[0];
                }
            }

            if (!curRow && cliClean) {
                const { data: directRows } = await client.from('control_servicios').select('*').ilike('cliente_nombre', `%${cliClean}%`).order('actualizado_en', { ascending: false }).limit(3);
                if (directRows && directRows.length > 0) curRow = directRows[0];
            }

            if (curRow) {
                let obj = null;
                const regexFecha = new RegExp(`<!--bitacora_${fechaISO}:(.*?)-->`);
                const regexDia = new RegExp(`<!--bitacora_${diaClave}:(.*?)-->`);
                const mFecha = (curRow.observaciones || '').match(regexFecha);
                const mDia = (curRow.observaciones || '').match(regexDia);

                if (mFecha && mFecha[1]) {
                    try { obj = JSON.parse(mFecha[1]); } catch (e) { }
                } else if (mDia && mDia[1]) {
                    try { obj = JSON.parse(mDia[1]); } catch (e) { }
                }

                // Si no estaba en observaciones, intentar recuperar de caché local
                if (!obj) {
                    const normN = typeof window._norm === 'function' ? window._norm(ninClean) : ninClean.toLowerCase();
                    const cKey = `${fechaISO}_${emailCliente || cliClean}_${normN}`;
                    obj = (window.BITACORA_CACHE && (window.BITACORA_CACHE[cKey] || window.BITACORA_CACHE[`${fechaISO}_${cliClean}`])) || {
                        fecha: fechaISO,
                        cliente_nombre: cliClean,
                        ninera_nombre: ninClean,
                        respuestas: {}
                    };
                }

                // Marcar evidencia inmutable de lectura y aceptación
                obj.Acepta = 'Sí';
                obj.acepta = 'Sí';
                obj.fecha_acepta = fechaHoraAcepta;
                obj.estado = 'aprobada'; // Transición de estado a 'aprobada'
                obj.cliente_acepta_nombre = cliClean;
                obj.cliente_acepta_email = emailCliente;
                obj.evidencia_aceptacion = {
                    fecha_hora: fechaHoraAcepta,
                    cliente_nombre: cliClean,
                    cliente_email: emailCliente,
                    aprobada: true,
                    dispositivo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web'
                };

                registroFormateado = formatearRegistroBitacora({
                    ...obj,
                    id: curRow.id
                });

                const tagDia = `<!--bitacora_${diaClave}:${JSON.stringify(registroFormateado)}-->`;
                const tagFecha = `<!--bitacora_${fechaISO}:${JSON.stringify(registroFormateado)}-->`;
                const cleanObs = (curRow.observaciones || '')
                    .replace(new RegExp(`<!--bitacora_${diaClave}:.*?-->`, 'g'), '')
                    .replace(new RegExp(`<!--bitacora_${fechaISO}:.*?-->`, 'g'), '')
                    .trim();

                const nuevaObs = `${tagDia} ${tagFecha} ${cleanObs}`.trim();

                const { error: errUpd } = await client.from('control_servicios').update({
                    observaciones: nuevaObs,
                    actualizado_en: new Date().toISOString()
                }).eq('id', curRow.id);

                if (errUpd) {
                    console.error('❌ Error actualizando aceptación en control_servicios:', errUpd);
                } else {
                    console.log(`✅ [Bitacoras Supabase] Bitácora APROBADA y firmada por cliente (${fechaHoraAcepta}):`, curRow.id);
                }
            } else {
                console.warn('⚠️ No se encontró registro en control_servicios para aceptar bitácora:', fechaISO, cliClean);
            }
        } catch (e) {
            console.warn('⚠️ Error al actualizar aceptación en control_servicios:', e);
        }

        // 2. Persistir también en tabla 'bitacoras' si está disponible
        try {
            await client.from('bitacoras').upsert({
                fecha: fechaISO,
                cliente_nombre: cliClean,
                ninera_nombre: ninClean,
                cliente_email: emailCliente,
                estado: 'aprobada',
                acepta: 'Sí',
                fecha_acepta: fechaHoraAcepta,
                actualizado_en: new Date().toISOString()
            }, { onConflict: 'fecha,cliente_nombre,ninera_nombre' });
        } catch (eBit) { }

        // 3. Actualizar memoria local inmediata
        const normNin = typeof window._norm === 'function' ? window._norm(ninClean) : ninClean.toLowerCase();
        const cacheKeys = [
            `${fechaISO}_${emailCliente || cliClean}_${normNin}`,
            `${fechaISO}_${cliClean}_${normNin}`,
            `${fechaISO}_${cliClean}`
        ];

        if (!registroFormateado) {
            registroFormateado = formatearRegistroBitacora({
                fecha: fechaISO,
                cliente_nombre: cliClean,
                ninera_nombre: ninClean,
                cliente_email: emailCliente,
                estado: 'aprobada',
                acepta: 'Sí',
                Acepta: 'Sí',
                fecha_acepta: fechaHoraAcepta
            });
        }

        cacheKeys.forEach(k => {
            if (window.BITACORA_CACHE) window.BITACORA_CACHE[k] = registroFormateado;
            try { localStorage.setItem('BITACORA_DRAFT_' + k, JSON.stringify(registroFormateado)); } catch (e) { }
        });

        // 4. Broadcast Realtime
        try {
            client.channel('realtime_portal_servicios').send({
                type: 'broadcast',
                event: 'bitacora_live',
                payload: {
                    fecha: fechaISO,
                    cliente: cliClean,
                    ninera: ninClean,
                    status: 'aprobada',
                    estado: 'aprobada',
                    fecha_acepta: fechaHoraAcepta,
                    registro: registroFormateado,
                    timestamp: Date.now()
                }
            }).catch(() => { });
        } catch (eBc) { }

        try {
            if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('nyp_bitacoras_channel');
                bc.postMessage({
                    type: 'bitacora_aceptada',
                    fecha: fechaISO,
                    cliente: cliClean,
                    ninera: ninClean,
                    status: 'aprobada',
                    estado: 'aprobada',
                    fecha_acepta: fechaHoraAcepta,
                    registro: registroFormateado
                });
                setTimeout(() => { bc.close(); }, 500);
            }
        } catch (eBc2) { }

        // 5. Refrescar cliente_servicios si está en pantalla
        if (window.ClienteServicios) {
            if (typeof window.ClienteServicios.renderBitacora === 'function') window.ClienteServicios.renderBitacora();
            if (typeof window.ClienteServicios.renderSummary === 'function') window.ClienteServicios.renderSummary();
        }

        return { success: true, fecha_acepta: fechaHoraAcepta, registro: registroFormateado };
    }

    /**
     * Marca la bitácora como Revisada por supervisión / admin
     * Guarda la fecha, hora y usuario que revisó la bitácora como evidencia en la base de datos.
     */
    async function revisarBitacoraSupabase(fecha, cliente, ninera, servicioId = null, servicioObj = null, usuarioReviso = null) {
        const client = _getClient();
        if (!client) throw new Error('Cliente Supabase no disponible');

        const fechaISO = String(fecha || '').slice(0, 10);
        const cliClean = _cleanStr(cliente || servicioObj?.cliente || '');
        const ninClean = _cleanStr(ninera || servicioObj?.nombre_ninera || servicioObj?.ninera || '');
        const diaClave = _obtenerDiaClave(fechaISO, servicioObj?.dia_clave);
        const fechaHoraRev = new Date().toISOString();
        const supervisorNombre = _cleanStr(usuarioReviso?.nombre || window.SESION?.nombre || 'Supervisión');
        const supervisorEmail = _cleanStr(usuarioReviso?.email || window.SESION?.email || '');

        let registroFormateado = null;

        // 1. Actualizar en control_servicios
        try {
            let rowId = servicioId || servicioObj?.row_id;
            if (rowId && typeof rowId === 'string' && rowId.includes('_')) {
                rowId = rowId.slice(0, rowId.lastIndexOf('_'));
            }

            let curRow = null;
            if (rowId && !rowId.startsWith('srv_') && !rowId.startsWith('bit_')) {
                const { data: r } = await client.from('control_servicios').select('*').eq('id', rowId).maybeSingle();
                if (r) curRow = r;
            }

            if (!curRow) {
                const lunesISO = servicioObj?.semana_iso || _calcularLunesISO(fechaISO);
                let q = client.from('control_servicios').select('*');
                if (lunesISO) q = q.eq('semana_iso', lunesISO);
                if (cliClean) q = q.ilike('cliente_nombre', `%${cliClean}%`);
                const { data: rowsFound } = await q;

                if (rowsFound && rowsFound.length > 0) {
                    const cNorm = _normTexto(cliClean);
                    const nNorm = _normTexto(ninClean);
                    curRow = rowsFound.find(r => {
                        const rCli = _normTexto(r.cliente_nombre || '');
                        const rNan = _normTexto(r.nanny_nombre || '');
                        return (rCli.includes(cNorm) || cNorm.includes(rCli)) && (!nNorm || rNan.includes(nNorm) || nNorm.includes(rNan));
                    }) || rowsFound[0];
                }
            }

            if (curRow) {
                let obj = null;
                const regexFecha = new RegExp(`<!--bitacora_${fechaISO}:(.*?)-->`);
                const regexDia = new RegExp(`<!--bitacora_${diaClave}:(.*?)-->`);
                const mFecha = (curRow.observaciones || '').match(regexFecha);
                const mDia = (curRow.observaciones || '').match(regexDia);

                if (mFecha && mFecha[1]) {
                    try { obj = JSON.parse(mFecha[1]); } catch (e) { }
                } else if (mDia && mDia[1]) {
                    try { obj = JSON.parse(mDia[1]); } catch (e) { }
                }

                if (!obj) {
                    const normN = typeof window._norm === 'function' ? window._norm(ninClean) : ninClean.toLowerCase();
                    obj = (window.BITACORA_CACHE && window.BITACORA_CACHE[`${fechaISO}_${cliClean}_${normN}`]) || {
                        fecha: fechaISO,
                        cliente_nombre: cliClean,
                        ninera_nombre: ninClean,
                        respuestas: {}
                    };
                }

                obj.Revisada = 'Sí';
                obj.revisada = 'Sí';
                obj.fecha_revisada = fechaHoraRev;
                obj.supervisor_reviso_nombre = supervisorNombre;
                obj.supervisor_reviso_email = supervisorEmail;
                obj.estado_revision = 'revisada';
                obj.evidencia_revision = {
                    fecha_hora: fechaHoraRev,
                    supervisor_nombre: supervisorNombre,
                    supervisor_email: supervisorEmail,
                    revisado: true
                };

                registroFormateado = formatearRegistroBitacora({
                    ...obj,
                    id: curRow.id
                });

                const tagDia = `<!--bitacora_${diaClave}:${JSON.stringify(registroFormateado)}-->`;
                const tagFecha = `<!--bitacora_${fechaISO}:${JSON.stringify(registroFormateado)}-->`;
                const cleanObs = (curRow.observaciones || '')
                    .replace(new RegExp(`<!--bitacora_${diaClave}:.*?-->`, 'g'), '')
                    .replace(new RegExp(`<!--bitacora_${fechaISO}:.*?-->`, 'g'), '')
                    .trim();

                const nuevaObs = `${tagDia} ${tagFecha} ${cleanObs}`.trim();

                await client.from('control_servicios').update({
                    observaciones: nuevaObs,
                    actualizado_en: new Date().toISOString()
                }).eq('id', curRow.id);

                console.log(`✅ [Bitacoras Supabase] Bitácora REVISADA registrada por ${supervisorNombre} (${fechaHoraRev}):`, curRow.id);
            }
        } catch (e) {
            console.warn('⚠️ Error al actualizar revisión en control_servicios:', e);
        }

        // 2. Persistir en tabla 'bitacoras' si está disponible
        try {
            await client.from('bitacoras').upsert({
                fecha: fechaISO,
                cliente_nombre: cliClean,
                ninera_nombre: ninClean,
                revisada: 'Sí',
                fecha_revisada: fechaHoraRev,
                actualizado_en: new Date().toISOString()
            }, { onConflict: 'fecha,cliente_nombre,ninera_nombre' });
        } catch (eBit) { }

        // 3. Actualizar memoria local inmediata
        const normNin = typeof window._norm === 'function' ? window._norm(ninClean) : ninClean.toLowerCase();
        const cacheKeys = [
            `${fechaISO}_${cliClean}_${normNin}`,
            `${fechaISO}_${cliClean}`
        ];

        if (!registroFormateado) {
            registroFormateado = formatearRegistroBitacora({
                fecha: fechaISO,
                cliente_nombre: cliClean,
                ninera_nombre: ninClean,
                revisada: 'Sí',
                Revisada: 'Sí',
                fecha_revisada: fechaHoraRev,
                supervisor_reviso_nombre: supervisorNombre,
                supervisor_reviso_email: supervisorEmail,
                estado_revision: 'revisada'
            });
        }

        cacheKeys.forEach(k => {
            if (window.BITACORA_CACHE) window.BITACORA_CACHE[k] = registroFormateado;
            try { localStorage.setItem('BITACORA_DRAFT_' + k, JSON.stringify(registroFormateado)); } catch (e) { }
        });

        // 4. Broadcast Realtime
        try {
            client.channel('realtime_portal_servicios').send({
                type: 'broadcast',
                event: 'bitacora_live',
                payload: {
                    fecha: fechaISO,
                    cliente: cliClean,
                    ninera: ninClean,
                    status: 'revisada',
                    estado_revision: 'revisada',
                    fecha_revisada: fechaHoraRev,
                    supervisor_nombre: supervisorNombre,
                    registro: registroFormateado,
                    timestamp: Date.now()
                }
            }).catch(() => { });
        } catch (eBc) { }

        try {
            if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('nyp_bitacoras_channel');
                bc.postMessage({
                    type: 'bitacora_revisada',
                    fecha: fechaISO,
                    cliente: cliClean,
                    ninera: ninClean,
                    status: 'revisada',
                    estado_revision: 'revisada',
                    fecha_revisada: fechaHoraRev,
                    supervisor_nombre: supervisorNombre,
                    registro: registroFormateado
                });
                setTimeout(() => { bc.close(); }, 500);
            }
        } catch (eBc2) { }

        return { success: true, fecha_revisada: fechaHoraRev, supervisor: supervisorNombre, registro: registroFormateado };
    }

    /**
     * Suscripción en Tiempo Real (Realtime) para sincronización en vivo entre Familia y Niñera
     */
    function suscribirBitacoraRealtime(fecha, cliente, ninera, callback) {
        desuscribirBitacoraRealtime();

        const client = _getClient();
        if (!client) return;

        const fechaISO = String(fecha || '').slice(0, 10);
        const cliClean = _cleanStr(cliente).toLowerCase();
        const ninClean = _cleanStr(ninera).toLowerCase();
        const channelName = `realtime-bitacora-canal-${fechaISO || 'active'}-${Date.now()}`;

        try {
            _canalRealtimeBitacora = client
                .channel(channelName)
                // 1. Escuchar eventos broadcast instantáneos
                .on('broadcast', { event: 'bitacora_live' }, (payload) => {
                    const data = payload?.payload;
                    if (!data) return;

                    const recCli = String(data.cliente || '').toLowerCase();
                    const recNin = String(data.ninera || '').toLowerCase();
                    const coincideCli = !cliClean || recCli.includes(cliClean) || cliClean.includes(recCli);
                    const coincideNin = !ninClean || recNin.includes(ninClean) || ninClean.includes(recNin);
                    const coincideFecha = !fechaISO || String(data.fecha || '').slice(0, 10) === fechaISO;

                    if (coincideFecha && coincideCli && coincideNin) {
                        console.log('⚡ [Realtime Bitacora] Actualización broadcast en vivo:', data.registro);
                        const formateado = formatearRegistroBitacora(data.registro);

                        if (window.BITACORA_CACHE) {
                            const normNin = typeof window._norm === 'function' ? window._norm(data.ninera) : recNin;
                            const cacheKey = `${data.fecha}_${data.cliente}_${normNin}`;
                            window.BITACORA_CACHE[cacheKey] = formateado;
                        }

                        if (typeof callback === 'function') {
                            callback(formateado, 'broadcast');
                        }

                        if (window.ClienteServicios && typeof window.ClienteServicios.renderBitacora === 'function') {
                            window.ClienteServicios.renderBitacora();
                        }
                    }
                })
                // 2. Escuchar cambios postgres en control_servicios
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'control_servicios'
                }, (payload) => {
                    const record = payload.new || {};
                    if (!record || !record.observaciones) return;

                    const diaClave = _obtenerDiaClave(fechaISO);
                    const regex = new RegExp(`<!--bitacora_(?:${diaClave}|${fechaISO}):(.*?)-->`);
                    const m = record.observaciones.match(regex);
                    if (m && m[1]) {
                        try {
                            const parsed = JSON.parse(m[1]);
                            const recCli = String(record.cliente_nombre || parsed.cliente || '').toLowerCase();
                            const recNin = String(record.nanny_nombre || parsed.ninera || '').toLowerCase();

                            const coincideCli = !cliClean || recCli.includes(cliClean) || cliClean.includes(recCli);
                            const coincideNin = !ninClean || recNin.includes(ninClean) || ninClean.includes(recNin);

                            if (coincideCli && coincideNin) {
                                console.log('⚡ [Realtime Bitacora] Cambio detectado en control_servicios:', payload.eventType);
                                const formateado = formatearRegistroBitacora(parsed);

                                if (window.BITACORA_CACHE) {
                                    const normNin = typeof window._norm === 'function' ? window._norm(record.nanny_nombre || ninClean) : ninClean;
                                    const cacheKey = `${fechaISO}_${record.cliente_email || record.cliente_nombre || cliClean}_${normNin}`;
                                    window.BITACORA_CACHE[cacheKey] = formateado;
                                }

                                if (typeof callback === 'function') {
                                    callback(formateado, payload.eventType);
                                }

                                if (window.ClienteServicios && typeof window.ClienteServicios.renderBitacora === 'function') {
                                    window.ClienteServicios.renderBitacora();
                                }
                            }
                        } catch (e) { }
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('🟢 [Bitacoras Realtime] Suscripción activa para:', fechaISO, cliente);
                    }
                });
        } catch (err) {
            console.warn('⚠️ [Bitacoras Realtime] No se pudo establecer canal:', err.message);
        }
    }

    /**
     * Cancela la suscripción en tiempo real activa
     */
    function desuscribirBitacoraRealtime() {
        if (_canalRealtimeBitacora) {
            try {
                const client = _getClient();
                if (client) client.removeChannel(_canalRealtimeBitacora);
            } catch (e) {
                console.warn('⚠️ Error al desuscribir canal Realtime:', e);
            }
            _canalRealtimeBitacora = null;
        }
    }

    /**
     * Cancela cualquier temporizador de auto-guardado activo
     */
    function cancelarAutoGuardadoBitacora() {
        if (_debounceTimerAutoSave) {
            clearTimeout(_debounceTimerAutoSave);
            _debounceTimerAutoSave = null;
        }
    }

    /**
     * Programa un auto-guardado en segundo plano con debounce reactivo
     */
    function programarAutoGuardadoBitacora(servicio, obtenerRespuestasFn) {
        if (!servicio || typeof obtenerRespuestasFn !== 'function') return;

        // No auto-guardar si estamos en modo solo lectura o cargando datos
        if (window.BITACORA_SOLO_LECTURA || window._cargandoBitacora) {
            cancelarAutoGuardadoBitacora();
            return;
        }

        const backdrop = document.getElementById('bitacoraBackdrop');
        if (backdrop && backdrop.classList.contains('bitacora-solo-lectura')) {
            cancelarAutoGuardadoBitacora();
            return;
        }

        if (_debounceTimerAutoSave) clearTimeout(_debounceTimerAutoSave);

        _actualizarBadgeEstadoGuardado('saving');

        _debounceTimerAutoSave = setTimeout(async () => {
            // Re-verificar condiciones antes de ejecutar
            if (window.BITACORA_SOLO_LECTURA || window._cargandoBitacora) return;
            const bd = document.getElementById('bitacoraBackdrop');
            if (bd && bd.classList.contains('bitacora-solo-lectura')) return;

            try {
                const respuestas = obtenerRespuestasFn();
                if (!respuestas) return;

                // Evitar sobreescribir con respuestas vacías
                const keysConValor = Object.keys(respuestas).filter(k => respuestas[k] !== undefined && String(respuestas[k]).trim() !== '');
                if (keysConValor.length === 0) return;

                await guardarBitacoraSupabase(servicio, respuestas, 'borrador');
            } catch (err) {
                console.warn('⚠️ [Auto-save Bitacora] Error en sincronización de borrador:', err.message);
            }
        }, 400);
    }

    /**
     * Muestra visualmente el estado del auto-guardado en la interfaz
     */
    function _actualizarBadgeEstadoGuardado(estado, mensaje) {
        // Silencioso: leyendas de guardado automático removidas a petición del usuario
    }

    /**
     * Helper functions para fechas y normalización de texto
     */
    function _startMonday(d) {
        const date = d ? (typeof d === 'string' ? new Date(d + 'T12:00:00') : new Date(d)) : new Date();
        const day = date.getDay();
        const diff = (day === 0 ? -6 : 1 - day);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff, 12, 0, 0);
    }

    function _toISO(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function _addDaysISO(isoStr, numDays) {
        const parts = (isoStr || '').split('-').map(Number);
        const d = new Date(parts[0], parts[1] - 1, parts[2] + numDays, 12, 0, 0);
        return _toISO(d);
    }

    function _normTexto(str) {
        if (!str) return '';
        return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();
    }

    function _normalizarCiudad(nombre) {
        if (!nombre) return 'Puebla';
        const n = String(nombre).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (n.includes('puebla')) return 'Puebla';
        if (n.includes('xalapa')) return 'Xalapa';
        if (n.includes('queretaro')) return 'Querétaro';
        if (n.includes('cdmx') || n.includes('mexico') || n.includes('federal') || n.includes('df')) return 'CDMX';
        return nombre.charAt(0).toUpperCase() + nombre.slice(1);
    }

    /**
     * Obtiene el resumen de bitácoras para una semana específica agrupado por Ciudad
     * Consulta `control_servicios` y cruza con `bitacoras`, `nannys` y `clientes` en Supabase.
     */
    async function obtenerResumenBitacorasSemanaSupabase(fechaBaseISO, filtroNanny = null) {
        const client = _getClient();
        if (!client) throw new Error('Cliente Supabase no inicializado');

        // 1. Calcular rango de fechas de la semana (Lunes a Domingo)
        const lunes = _startMonday(fechaBaseISO);
        const lunesISO = _toISO(lunes);

        const fechasSemana = [];
        for (let i = 0; i < 7; i++) {
            fechasSemana.push(_addDaysISO(lunesISO, i));
        }

        // 2. Consultar servicios en control_servicios para esta semana_iso
        const { data: rowsServicios, error: errServicios } = await client
            .from('control_servicios')
            .select('*')
            .eq('semana_iso', lunesISO);

        if (errServicios) {
            console.error("❌ Error al consultar control_servicios para bitácoras:", errServicios);
            throw errServicios;
        }

        // Excluir bloques de control interno o staging
        const BLOQUES_SOLO_ADMIN = ['proximos_servicios', 'clientes_espera', 'clientes_potenciales'];
        const filasActivas = (rowsServicios || []).filter(r => {
            let bId = (r.bloque || '').trim().toLowerCase();
            if (!bId && r.observaciones && typeof r.observaciones === 'string' && r.observaciones.includes('<!--bloque:')) {
                const mB = r.observaciones.match(/<!--bloque:(.*?)-->/);
                if (mB) bId = mB[1].trim().toLowerCase();
            }
            if (BLOQUES_SOLO_ADMIN.includes(bId)) return false;

            if (filtroNanny) {
                const rNanEmail = (r.nanny_email || '').trim().toLowerCase();
                const sesEmail = (typeof SESION !== 'undefined' && SESION?.email ? SESION.email : (window.SESION?.email || '')).trim().toLowerCase();
                if (sesEmail && rNanEmail && sesEmail === rNanEmail) {
                    // Match por correo directo
                } else {
                    const nomFiltro = _normTexto(filtroNanny);
                    const nomRow = _normTexto(r.nanny_nombre || '');
                    const coincide = nomRow && nomFiltro && (nomRow === nomFiltro || nomRow.includes(nomFiltro) || nomFiltro.includes(nomRow));
                    if (!coincide) return false;
                }
            }
            return true;
        });

        // 3. Consultar clientes y nannys para enriquecer ciudades y correos
        let mapaClientes = {};
        let mapaNannys = {};
        try {
            const [resClis, resNans] = await Promise.all([
                client.from('clientes').select('id, nombre, email, ciudad'),
                client.from('nannys').select('id, nombre, email, ciudad')
            ]);

            if (Array.isArray(resClis.data)) {
                resClis.data.forEach(c => {
                    const em = (c.email || '').trim().toLowerCase();
                    const nom = _normTexto(c.nombre || '');
                    if (em) mapaClientes[em] = c;
                    if (nom) mapaClientes[nom] = c;
                });
            }

            if (Array.isArray(resNans.data)) {
                resNans.data.forEach(n => {
                    const em = (n.email || '').trim().toLowerCase();
                    const nom = _normTexto(n.nombre || '');
                    if (em) mapaNannys[em] = n;
                    if (nom) mapaNannys[nom] = n;
                });
            }
        } catch (e) {
            console.warn("⚠️ Error cargando clientes/nannys para bitácoras:", e);
        }

        let mapaBitacorasTabla = {};

        // 5. Agrupar asignaciones de servicio y evaluar bitácoras por día
        const DIAS_KEYS = [
            { key: 'lun', offset: 0 },
            { key: 'mar', offset: 1 },
            { key: 'mie', offset: 2 },
            { key: 'jue', offset: 3 },
            { key: 'vie', offset: 4 },
            { key: 'sab', offset: 5 },
            { key: 'dom', offset: 6 }
        ];

        const grupos = {};

        filasActivas.forEach(row => {
            const clienteNom = String(row.cliente_nombre || 'Cliente').trim();
            const nineraNom = String(row.nanny_nombre || '').trim();
            if (!clienteNom) return;

            const infoCli = mapaClientes[(row.cliente_email || '').trim().toLowerCase()] ||
                mapaClientes[_normTexto(clienteNom)] || {};
            const infoNanny = mapaNannys[(row.nanny_email || '').trim().toLowerCase()] ||
                mapaNannys[_normTexto(nineraNom)] || {};

            let rawCiudad = infoNanny.ciudad || infoCli.ciudad || row.ciudad || '';
            if (!rawCiudad && row.zona) {
                const zNorm = _normTexto(row.zona);
                if (zNorm.includes('puebla') || zNorm.includes('xalapa') || zNorm.includes('queretaro') || zNorm.includes('cdmx') || zNorm.includes('mexico')) {
                    rawCiudad = row.zona;
                }
            }
            const ciudad = _normalizarCiudad(rawCiudad);
            const tipoServicio = row.tipo_servicio || 'Servicio';
            const grupoKey = `${clienteNom}|${nineraNom}|${_normTexto(tipoServicio)}`.toLowerCase();

            if (!grupos[grupoKey]) {
                grupos[grupoKey] = {
                    cliente: clienteNom,
                    email: (row.cliente_email || infoCli.email || '').trim(),
                    ninera: nineraNom || 'Niñera',
                    tipo_servicio: tipoServicio,
                    ciudad: ciudad,
                    diasMap: {} // fechaISO -> { tiene, aceptada, revisada, data }
                };
            }

            // Revisar cada día activo de la semana
            DIAS_KEYS.forEach(d => {
                const hInicio = row[`${d.key}_inicio`];
                if (hInicio && String(hInicio).trim() !== '' && String(hInicio).trim() !== '-') {
                    const fechaDia = _addDaysISO(lunesISO, d.offset);

                    // Buscar bitácora en observaciones de control_servicios
                    let bitData = null;
                    if (row.observaciones) {
                        const regex = new RegExp(`<!--bitacora_(?:${d.key}|${fechaDia}):(.*?)-->`);
                        const m = row.observaciones.match(regex);
                        if (m && m[1]) {
                            try {
                                bitData = JSON.parse(m[1]);
                            } catch (eParse) { }
                        }
                    }

                    // Si no está en observaciones, buscar en tabla bitacoras
                    if (!bitData) {
                        const kExact = `${fechaDia}|${_normTexto(clienteNom)}|${_normTexto(nineraNom)}`;
                        const kCli = `${fechaDia}|${_normTexto(clienteNom)}`;
                        const bitRow = mapaBitacorasTabla[kExact] || mapaBitacorasTabla[kCli];
                        if (bitRow) {
                            bitData = formatearRegistroBitacora(bitRow);
                        }
                    }

                    // Si aún no está, revisar en BITACORA_CACHE en memoria si existe
                    if (window.BITACORA_CACHE) {
                        const normNin = typeof window._norm === 'function' ? window._norm(nineraNom) : nineraNom.toLowerCase();
                        const cKeyExact = `${fechaDia}_${row.cliente_email || clienteNom}_${normNin}`;
                        const cKeyAlt = `${fechaDia}_${clienteNom}_${normNin}`;
                        const cKeySimple = `${fechaDia}_${clienteNom}`;
                        const cached = window.BITACORA_CACHE[cKeyExact] || window.BITACORA_CACHE[cKeyAlt] || window.BITACORA_CACHE[cKeySimple];
                        if (cached) {
                            if (!bitData) {
                                bitData = cached;
                            } else {
                                if (cached.Acepta || cached.acepta || cached.fecha_acepta || cached.estado === 'aprobada') {
                                    bitData.Acepta = cached.Acepta || cached.acepta || 'Sí';
                                    bitData.acepta = bitData.Acepta;
                                    bitData.fecha_acepta = cached.fecha_acepta || bitData.fecha_acepta;
                                    bitData.estado = cached.estado || 'aprobada';
                                }
                                if (cached.Revisada || cached.revisada || cached.fecha_revisada || cached.estado_revision === 'revisada') {
                                    bitData.Revisada = cached.Revisada || cached.revisada || 'Sí';
                                    bitData.revisada = bitData.Revisada;
                                    bitData.fecha_revisada = cached.fecha_revisada || bitData.fecha_revisada;
                                    bitData.estado_revision = 'revisada';
                                }
                            }
                        }
                    }

                    let tiene = false;
                    let aceptada = false;
                    let revisada = false;

                    if (bitData) {
                        // Se considera que tiene bitácora si el estado es completada o aprobada o si tiene respuestas registradas
                        const st = String(bitData.estado || '').toLowerCase();
                        const tieneResp = bitData.respuestas && Object.keys(bitData.respuestas).length > 0;
                        const tienePreguntas = !!(bitData['Pregunta 1'] || bitData['Check-in'] || bitData.checkin || bitData['Estado de ánimo'] || bitData.animo || bitData['Observaciones generales'] || bitData.observaciones);
                        tiene = st === 'completada' || st === 'aprobada' || tieneResp || tienePreguntas;

                        const valAcepta = String(bitData.Acepta || bitData.acepta || '').trim().toLowerCase();
                        aceptada = valAcepta === 'si' || valAcepta === 'sí' || valAcepta === 'yes' || valAcepta === 'true' || st === 'aprobada' || !!bitData.fecha_acepta;

                        const valRev = String(bitData.Revisada || bitData.revisada || '').trim().toLowerCase();
                        revisada = valRev === 'si' || valRev === 'sí' || valRev === 'yes' || valRev === 'true' || !!bitData.fecha_revisada || String(bitData.estado_revision || '').toLowerCase() === 'revisada';
                    }

                    grupos[grupoKey].diasMap[fechaDia] = {
                        fecha: fechaDia,
                        tiene: tiene,
                        aceptada: aceptada,
                        revisada: revisada
                    };
                }
            });
        });

        // 6. Construir resumen por ciudad y calcular semáforos de cumplimiento
        const ordenCiudades = ['Puebla', 'Xalapa', 'Querétaro', 'CDMX'];
        const resumen = {};

        Object.values(grupos).forEach(g => {
            const diasArray = Object.keys(g.diasMap).sort();
            if (diasArray.length === 0) return; // Si no tenía días programados, omitir

            const ciudad = g.ciudad;
            if (!resumen[ciudad]) resumen[ciudad] = [];

            let totalTiene = 0;
            let totalAceptadas = 0;
            let totalRevisadas = 0;

            diasArray.forEach(f => {
                const infoDia = g.diasMap[f];
                if (infoDia.tiene) totalTiene++;
                if (infoDia.aceptada) totalAceptadas++;
                if (infoDia.revisada) totalRevisadas++;
            });

            // Regla de Semáforo:
            // tieneBitacora = true si todos los días programados tienen su bitácora
            const tieneBitacora = diasArray.length > 0 && totalTiene === diasArray.length;
            // aceptada = true si al menos las bitácoras requeridas están aceptadas
            const aceptada = totalTiene > 0 && totalAceptadas >= totalTiene;
            // revisada = true si al menos las bitácoras requeridas están revisadas por supervisión
            const revisada = totalTiene > 0 && totalRevisadas >= totalTiene;

            resumen[ciudad].push({
                cliente: g.cliente,
                email: g.email,
                ninera: g.ninera,
                tipo_servicio: g.tipo_servicio,
                dias: diasArray,
                tieneBitacora: tieneBitacora,
                aceptada: aceptada,
                revisada: revisada
            });
        });

        // 7. Ordenar ciudades y servicios alfabéticamente
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
     * Obtiene el resumen de bitácoras de dos semanas (Semana actual y Semana anterior)
     */
    async function obtenerResumenBitacorasDosSemanasSupabase() {
        let isoActual, isoAnterior;
        if (typeof window.calcularLunesSemanasSupervision === 'function') {
            const fechas = window.calcularLunesSemanasSupervision();
            isoActual = fechas.isoActual;
            isoAnterior = fechas.isoAnterior;
        } else {
            const lAct = _startMonday(new Date());
            const lAnt = new Date(lAct.getFullYear(), lAct.getMonth(), lAct.getDate() - 7, 12, 0, 0);
            isoActual = _toISO(lAct);
            isoAnterior = _toISO(lAnt);
        }

        const [actual, anterior] = await Promise.all([
            obtenerResumenBitacorasSemanaSupabase(isoActual, null),
            obtenerResumenBitacorasSemanaSupabase(isoAnterior, null)
        ]);

        return {
            actual: actual,
            anterior: anterior,
            siguiente: anterior // Alias de compatibilidad
        };
    }

    // Exponer API global en window
    window.BitacorasSupabase = {
        obtener: obtenerBitacoraSupabase,
        guardar: guardarBitacoraSupabase,
        aceptar: aceptarBitacoraSupabase,
        revisar: revisarBitacoraSupabase,
        suscribirRealtime: suscribirBitacoraRealtime,
        desuscribirRealtime: desuscribirBitacoraRealtime,
        programarAutoGuardado: programarAutoGuardadoBitacora,
        cancelarAutoGuardado: cancelarAutoGuardadoBitacora,
        formatearRegistro: formatearRegistroBitacora,
        obtenerResumenSemana: obtenerResumenBitacorasSemanaSupabase,
        obtenerResumenDosSemanas: obtenerResumenBitacorasDosSemanasSupabase
    };

    window.obtenerResumenBitacorasDosSemanasSupabase = obtenerResumenBitacorasDosSemanasSupabase;
    window.obtenerResumenBitacorasSemanaSupabase = obtenerResumenBitacorasSemanaSupabase;

})(window);
