/**
 * Módulo de Supervisión - Avance del Sugeridor de Actividades
 * Permite monitorear el cumplimiento de actividades diarias de estimulación de las nannies.
 */

if (!window._CACHE_FB_SUPERVISION) {
    window._CACHE_FB_SUPERVISION = {};
}
if (!window._UNSUBS_SUPERVISION_ESTIMULACION) {
    window._UNSUBS_SUPERVISION_ESTIMULACION = [];
}
if (!window._ACTIVE_LISTENERS_SUPERVISION) {
    window._ACTIVE_LISTENERS_SUPERVISION = {};
}

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

function calcularAvances(serviciosEstimulacion, diasSemanaISO) {
    const serviciosAvance = [];
    const lunesISO = diasSemanaISO[0];
    serviciosEstimulacion.forEach(s => {
        const peques = s.peques_lista || [];
        if (peques.length === 0) {
            serviciosAvance.push({
                cliente: s.cliente,
                nanny: s.nombre_ninera || s.ninera || 'Sin asignar',
                pequeNombre: 'Sin registrar',
                nacimiento: '',
                email: s.email || 'sin_email',
                evaluado: false,
                totalPlaneadas: 0,
                totalCompletadas: 0,
                porcentaje: 0,
                diasDetalle: diasSemanaISO.map(fecha => ({
                    fecha,
                    esDiaServicio: (s.dias || []).includes(fecha),
                    estado: 'sin_servicio',
                    completadas: 0,
                    planeadas: 0
                })),
                ciudad: s.ciudad || 'Otra',
                evalData: null,
                lunesISO: lunesISO,
                revisionSemana: null
            });
            return;
        }

        peques.forEach(peque => {
            const key = `${s.email || 'sin_email'}|${peque.nombre}`;
            const fbData = window._CACHE_FB_SUPERVISION[key] || { eval: null, prog: null };
            const evalData = fbData.eval;
            const progData = fbData.prog;

            let evaluado = false;
            let slotsCount = 0;
            let totalPlaneadas = 0;
            let totalCompletadas = 0;

            if (evalData && evalData.hitos_detalle && Object.keys(evalData.hitos_detalle).length > 0) {
                evaluado = true;
                const respuestasHitos = evalData.hitos_detalle || {};
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

                const slots = [];
                hitosRojos.forEach(h => { if (slots.length < 5) slots.push(h); });
                hitosAmarillos.forEach(h => { if (slots.length < 5) slots.push(h); });
                if (slots.length < 2) {
                    hitosVerdes.forEach(h => { if (slots.length < 5) slots.push(h); });
                }
                slotsCount = slots.length;
            }

            const diasDetalle = diasSemanaISO.map(fecha => {
                const esDiaServicio = (s.dias || []).includes(fecha);
                let estado = 'sin_servicio';
                let completadas = 0;
                let planeadas = 0;

                if (esDiaServicio) {
                    if (!evaluado) {
                        estado = 'sin_evaluacion';
                    } else {
                        let segHoy = (progData && progData.seguimiento_diario && progData.seguimiento_diario[fecha]) 
                            ? progData.seguimiento_diario[fecha] 
                            : {};
                        
                        const planeadasDia = obtenerActividadesPlaneadasParaDia(evalData, fecha, peque.nacimiento);
                        let completadasHoy = planeadasDia.filter(act => {
                            const val = segHoy[act.firebaseId];
                            return val === 'realizada_ninera' || val === 'realizada' || val === 'realizada_familia';
                        }).length;

                        completadas = completadasHoy;
                        planeadas = planeadasDia.length;
                        totalPlaneadas += planeadas;
                        totalCompletadas += completadas;

                        if (planeadas === 0) {
                            estado = 'sin_evaluacion';
                        } else if (completadas === 0) {
                            estado = 'rojo';
                        } else if (completadas === planeadas) {
                            estado = 'azul';
                        } else if (completadas >= 2 && completadas <= 4) {
                            estado = 'verde';
                        } else if (completadas === 1) {
                            estado = 'amarillo';
                        } else {
                            estado = 'verde';
                        }
                    }
                }

                return {
                    fecha,
                    esDiaServicio,
                    estado,
                    completadas,
                    planeadas
                };
            });

            const porcentaje = totalPlaneadas > 0 ? Math.round((totalCompletadas / totalPlaneadas) * 100) : 0;
            const revisiones = (progData && progData.revisiones_supervision) ? progData.revisiones_supervision : {};
            const revisionSemana = revisiones[lunesISO] || null;

            serviciosAvance.push({
                cliente: s.cliente,
                nanny: s.nombre_ninera || s.ninera || 'Sin asignar',
                pequeNombre: peque.nombre,
                nacimiento: peque.nacimiento || '',
                email: s.email || 'sin_email',
                evaluado,
                totalPlaneadas,
                totalCompletadas,
                porcentaje,
                diasDetalle,
                ciudad: s.ciudad || 'Otra',
                evalData: evalData,
                lunesISO: lunesISO,
                revisionSemana: revisionSemana
            });
        });
    });
    return serviciosAvance;
}

async function cargarAvanceEstimulacionSupervision(force = false) {
    const container = document.getElementById("lista-avance-estimulacion");
    const containerAnterior = document.getElementById("lista-avance-estimulacion-anterior");
    if (!container) return;

    const loaderHtml = `
        <div style="text-align: center; padding: 40px; animation: fadeInPremium 0.6s ease-out;">
            <div class="loader-spinner" style="margin: 0 auto 15px; width: 40px; height: 40px; border: 4px solid rgba(232, 76, 154, 0.1); border-left-color: var(--pink-main); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: var(--text-muted); font-size: 14px; font-weight: 600;">Cargando servicios y consultando avances en Firebase...</p>
        </div>
    `;

    // Mostrar loader estético en ambos
    container.innerHTML = loaderHtml;
    if (containerAnterior) {
        containerAnterior.innerHTML = loaderHtml;
    }

    try {
        // 1. Obtener planeaciones consolidado de las semanas
        let data = null;
        if (!force) {
            const cached = localStorage.getItem('CACHE_PLANEACIONES_SUP_' + SESION.email);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.anterior) {
                        data = parsed;
                    }
                } catch (e) {
                    console.error("Error al parsear caché de planeaciones en avance", e);
                }
            }
        }

        if (!data) {
            data = await api('getResumenPlaneacionesDosSemanas', { email: SESION.email });
            if (data) {
                localStorage.setItem('CACHE_PLANEACIONES_SUP_' + SESION.email, JSON.stringify(data));
            }
        }

        if (!data || ((!data.actual || Object.keys(data.actual).length === 0) && (!data.anterior || Object.keys(data.anterior).length === 0))) {
            container.innerHTML = `<div class="no-data">No hay servicios programados para esta semana ni para la anterior.</div>`;
            if (containerAnterior) {
                containerAnterior.innerHTML = `<div class="no-data">No hay servicios programados para la semana anterior.</div>`;
            }
            return;
        }

        // 2. Filtrar servicios de estimulación / neuronanny / nanny educativa
        const serviciosEstimulacion = [];
        const serviciosEstimulacionAnterior = [];
        const tiposEstimulacion = ['neuronanny', 'nanny educativa', 'miss nanny', 'estimulacion'];

        if (data.actual) {
            Object.keys(data.actual).forEach(ciudad => {
                data.actual[ciudad].forEach(s => {
                    const tipoNorm = (s.tipo_servicio || '').toLowerCase();
                    const esEstimulacion = tiposEstimulacion.some(t => tipoNorm.includes(t));
                    if (esEstimulacion) {
                        s.ciudad = ciudad;
                        serviciosEstimulacion.push(s);
                    }
                });
            });
        }

        if (data.anterior) {
            Object.keys(data.anterior).forEach(ciudad => {
                data.anterior[ciudad].forEach(s => {
                    const tipoNorm = (s.tipo_servicio || '').toLowerCase();
                    const esEstimulacion = tiposEstimulacion.some(t => tipoNorm.includes(t));
                    if (esEstimulacion) {
                        s.ciudad = ciudad;
                        serviciosEstimulacionAnterior.push(s);
                    }
                });
            });
        }

        if (serviciosEstimulacion.length === 0 && serviciosEstimulacionAnterior.length === 0) {
            container.innerHTML = `
                <div class="no-data" style="text-align: center; padding: 40px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🧸</div>
                    <p style="color: var(--text-muted); font-size: 14px;">No se encontraron servicios de Neuronanny o Nanny Educativa programados.</p>
                </div>
            `;
            if (containerAnterior) {
                containerAnterior.innerHTML = `<div class="no-data">No hay datos de avance para mostrar.</div>`;
            }
            return;
        }

        // 3. Inicializar Firebase Firestore y Catálogo si es necesario
        await cargarFirebaseEstimulacion();
        if (CATALOGO_ACTIVIDADES.length === 0) {
            await cargarCatalogoActividades();
        }

        // Obtener el lunes de la semana actual en base a la fecha local
        const hoy = new Date();
        const dayOfWeek = hoy.getDay(); // 0 = dom, 1 = lun, ...
        const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
        const lunesActual = new Date(hoy);
        lunesActual.setDate(hoy.getDate() + diffToMonday);
        lunesActual.setHours(12, 0, 0, 0); // Establecer al mediodía local para evitar saltos por huso horario

        // Generar las 7 fechas ISO de la semana actual (Lunes a Domingo)
        const diasSemanaISO = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(lunesActual);
            d.setDate(lunesActual.getDate() + i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            diasSemanaISO.push(`${yyyy}-${mm}-${dd}`);
        }

        // Generar las 7 fechas ISO de la semana anterior (Lunes a Domingo)
        const lunesAnterior = new Date(lunesActual);
        lunesAnterior.setDate(lunesActual.getDate() - 7);
        const diasSemanaAnteriorISO = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(lunesAnterior);
            d.setDate(lunesAnterior.getDate() + i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            diasSemanaAnteriorISO.push(`${yyyy}-${mm}-${dd}`);
        }

        // Limpiar listeners si force es true
        if (force) {
            if (window._UNSUBS_SUPERVISION_ESTIMULACION) {
                window._UNSUBS_SUPERVISION_ESTIMULACION.forEach(unsub => {
                    try { unsub(); } catch (e) { console.error("Error al desuscribir listener:", e); }
                });
                window._UNSUBS_SUPERVISION_ESTIMULACION = [];
            }
            window._ACTIVE_LISTENERS_SUPERVISION = {};
        }

        // 4. Consultar Firebase en tiempo real para los peques de los servicios filtrados de ambas semanas
        const promises = [];
        let debounceTimer = null;
        const debouncedRecalcularYRenderizar = () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const serviciosAvance = calcularAvances(serviciosEstimulacion, diasSemanaISO);
                renderTarjetasAvance(serviciosAvance, "lista-avance-estimulacion", "actual");

                const serviciosAvanceAnterior = calcularAvances(serviciosEstimulacionAnterior, diasSemanaAnteriorISO);
                renderTarjetasAvance(serviciosAvanceAnterior, "lista-avance-estimulacion-anterior", "anterior");
            }, 100);
        };

        const todosServicios = [...serviciosEstimulacion, ...serviciosEstimulacionAnterior];
        const pequesSuscritos = new Set();

        todosServicios.forEach(s => {
            const peques = s.peques_lista || [];
            peques.forEach(peque => {
                const key = `${s.email || 'sin_email'}|${peque.nombre}`;
                if (pequesSuscritos.has(key)) return;
                pequesSuscritos.add(key);

                const docId = btoa(`${s.email}_${peque.nombre}`).replace(/=/g, "").replace(/\//g, "_").replace(/\+/g, "-");

                // Inicializar caché si no existe
                if (!window._CACHE_FB_SUPERVISION[key]) {
                    window._CACHE_FB_SUPERVISION[key] = { eval: null, prog: null };
                }

                // Suscripción en tiempo real para la evaluación
                const listenerKeyEval = `${key}|eval`;
                if (!window._ACTIVE_LISTENERS_SUPERVISION[listenerKeyEval]) {
                    const pEval = new Promise((resolve) => {
                        let isFirst = true;
                        const unsub = fb_onSnapshot(fb_doc(_db, "estimulacion_peques", docId), (docSnap) => {
                            const data = docSnap.exists() ? docSnap.data() : null;
                            window._CACHE_FB_SUPERVISION[key].eval = data;
                            if (isFirst) {
                                isFirst = false;
                                resolve();
                            } else {
                                debouncedRecalcularYRenderizar();
                            }
                        }, (err) => {
                            console.error(`Error en tiempo real para eval de ${peque.nombre}`, err);
                            if (isFirst) {
                                isFirst = false;
                                resolve();
                            }
                        });
                        window._UNSUBS_SUPERVISION_ESTIMULACION.push(unsub);
                    });
                    promises.push(pEval);
                    window._ACTIVE_LISTENERS_SUPERVISION[listenerKeyEval] = true;
                }

                // Suscripción en tiempo real para el progreso
                const listenerKeyProg = `${key}|prog`;
                if (!window._ACTIVE_LISTENERS_SUPERVISION[listenerKeyProg]) {
                    const pProg = new Promise((resolve) => {
                        let isFirst = true;
                        const unsub = fb_onSnapshot(fb_doc(_db, "progreso_peque", docId), (docSnap) => {
                            const data = docSnap.exists() ? docSnap.data() : null;
                            window._CACHE_FB_SUPERVISION[key].prog = data;
                            if (isFirst) {
                                isFirst = false;
                                resolve();
                            } else {
                                debouncedRecalcularYRenderizar();
                            }
                        }, (err) => {
                            console.error(`Error en tiempo real para progreso de ${peque.nombre}`, err);
                            if (isFirst) {
                                isFirst = false;
                                resolve();
                            }
                        });
                        window._UNSUBS_SUPERVISION_ESTIMULACION.push(unsub);
                    });
                    promises.push(pProg);
                    window._ACTIVE_LISTENERS_SUPERVISION[listenerKeyProg] = true;
                }
            });
        });

        // Esperar a que se resuelva la primera lectura de los nuevos listeners
        if (promises.length > 0) {
            await Promise.all(promises);
        }

        const serviciosAvance = calcularAvances(serviciosEstimulacion, diasSemanaISO);
        renderTarjetasAvance(serviciosAvance, "lista-avance-estimulacion", "actual");

        const serviciosAvanceAnterior = calcularAvances(serviciosEstimulacionAnterior, diasSemanaAnteriorISO);
        renderTarjetasAvance(serviciosAvanceAnterior, "lista-avance-estimulacion-anterior", "anterior");

    } catch (error) {
        console.error("Error al cargar control de avance de estimulación:", error);
        container.innerHTML = `
            <div class="no-data" style="color: var(--error-text); text-align: center; padding: 40px;">
                <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
                <p style="font-weight: 700;">Error de Conexión</p>
                <p style="font-size: 13px; margin-top: 5px;">No se pudo conectar a la base de datos de Firebase. Por favor, intenta de nuevo.</p>
                <button class="btn-pink" onclick="cargarAvanceEstimulacionSupervision(true)" style="width: auto; margin-top: 15px; padding: 10px 20px;">Reintentar</button>
            </div>
        `;
    }
}

function renderTarjetasAvance(servicios, containerId, prefix) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (servicios.length === 0) {
        container.innerHTML = `<div class="no-data">No hay datos de avance para mostrar.</div>`;
        return;
    }

    // Función para normalizar nombres de ciudades
    function normalizarCiudad(nombre) {
        if (!nombre) return 'Otra';
        const n = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (n.includes('puebla')) return 'Puebla';
        if (n.includes('xalapa')) return 'Xalapa';
        if (n.includes('queretaro')) return 'Querétaro';
        if (n.includes('cdmx') || n.includes('mexico') || n.includes('federal')) return 'CDMX';
        return nombre.charAt(0).toUpperCase() + nombre.slice(1);
    }

    // Agrupar servicios por ciudad normalizada
    const gruposPorCiudad = {};
    servicios.forEach(s => {
        const ciudadNorm = normalizarCiudad(s.ciudad);
        if (!gruposPorCiudad[ciudadNorm]) {
            gruposPorCiudad[ciudadNorm] = [];
        }
        gruposPorCiudad[ciudadNorm].push(s);
    });

    // Orden predefinido de ciudades
    const ordenCiudades = ['Puebla', 'Xalapa', 'Querétaro', 'CDMX'];
    
    // Obtener todas las ciudades agrupadas y ordenarlas
    const ciudadesOrdenadas = Object.keys(gruposPorCiudad).sort((a, b) => {
        const idxA = ordenCiudades.indexOf(a);
        const idxB = ordenCiudades.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    let html = '';
    const nombresDiasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const nombresDiasCompletos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    ciudadesOrdenadas.forEach(ciudad => {
        const serviciosDeCiudad = gruposPorCiudad[ciudad];
        
        // Ordenar servicios por nombre de cliente de la A a la Z (y por peque si coinciden)
        serviciosDeCiudad.sort((a, b) => {
            const clienteA = (a.cliente || '').trim().toLowerCase();
            const clienteB = (b.cliente || '').trim().toLowerCase();
            const comp = clienteA.localeCompare(clienteB, 'es', { sensitivity: 'base' });
            if (comp !== 0) return comp;
            const pequeA = (a.pequeNombre || '').trim().toLowerCase();
            const pequeB = (b.pequeNombre || '').trim().toLowerCase();
            return pequeA.localeCompare(pequeB, 'es', { sensitivity: 'base' });
        });

        const ciudadId = ciudad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
        const fullCiudadId = `${prefix}-${ciudadId}`;
        
        if (!window._EXPANDED_SECCIONES_SUPERVISION) {
            window._EXPANDED_SECCIONES_SUPERVISION = new Set();
        }
        const estaExpandido = window._EXPANDED_SECCIONES_SUPERVISION.has(fullCiudadId);
        const displayStyle = estaExpandido ? 'display: block;' : 'display: none;';
        const arrowChar = estaExpandido ? '▼' : '▶';

        html += `
            <div class="ciudad-seccion" style="margin-bottom: 8px; animation: fadeIn 0.4s ease-out;">
                <h3 onclick="toggleSeccionCiudad('${fullCiudadId}')" style="cursor: pointer; user-select: none; font-family: 'DM Serif Display', serif; font-size: 15.5px; color: var(--pink-main); margin: 8px 0 4px 0; border-left: 4px solid var(--pink-main); padding-left: 8px; display: flex; align-items: center; gap: 8px; font-weight: 700;">
                    <span>📍 ${ciudad}</span>
                    <span style="font-size: 11px; font-family: 'Outfit', sans-serif; font-weight: 500; color: var(--text-muted); background: rgba(232, 76, 154, 0.06); padding: 1px 6px; border-radius: 8px;">${serviciosDeCiudad.length} peques</span>
                    <span id="arrow-${fullCiudadId}" style="font-size: 12px; color: var(--text-muted); transition: transform 0.2s ease; margin-left: 4px;">${arrowChar}</span>
                </h3>
                <div id="table-wrapper-${fullCiudadId}" class="supervision-table-wrapper" style="${displayStyle} background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid rgba(232, 76, 154, 0.1); box-shadow: 0 4px 15px rgba(0,0,0,0.01); overflow-x: auto; width: 100%;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 700px; font-size: 13px; text-align: left;">
                        <thead>
                            <tr style="background: rgba(232, 76, 154, 0.03); border-bottom: 1px solid rgba(232, 76, 154, 0.08); color: var(--text-main); font-weight: 700; font-family: 'Outfit', sans-serif;">
                                <th style="padding: 10px 12px; width: 22%;">Familia / Peque</th>
                                <th style="padding: 10px 12px; width: 18%;">Niñera</th>
                                <th style="padding: 10px 12px; width: 12%; text-align: center;">Estatus</th>
                                <th style="padding: 10px 12px; width: 16%;">Progreso Semanal</th>
                                <th style="padding: 10px 12px; width: 20%; text-align: center;">Avance Diario</th>
                                <th style="padding: 10px 12px; width: 12%; text-align: center;">Supervisión</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        serviciosDeCiudad.forEach((s, sIdx) => {
            const isLastRow = sIdx === serviciosDeCiudad.length - 1;
            const borderStyle = isLastRow ? '' : 'border-bottom: 1px solid rgba(232, 76, 154, 0.05);';
            const rowBg = sIdx % 2 === 1 ? 'background: rgba(255, 255, 255, 0.25);' : '';

            // Estatus Badge
            let statusBadge = '';
            if (s.evaluado) {
                const etapaActual = s.evalData ? s.evalData.etapa_actual : '';
                const nombreEtapa = obtenerNombreEtapaHumano(etapaActual);
                statusBadge = `
                    <span style="background: var(--success-bg); color: var(--success-text); padding: 2px 6px; border-radius: 6px; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2px; display: inline-block;">Evaluado</span>
                    <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 4px; font-weight: 600; line-height: 1.2;">${nombreEtapa}</div>
                `;
            } else {
                statusBadge = `<span style="background: var(--warning-bg); color: var(--warning-text); padding: 2px 6px; border-radius: 6px; font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2px; display: inline-block;">Sin Evaluar</span>`;
            }

            // Progreso Semanal
            let progresoCol = '';
            if (!s.evaluado) {
                progresoCol = `<span style="color: var(--text-muted); font-size: 11.5px; font-style: italic; font-weight: 500;">Pendiente</span>`;
            } else {
                let barColor = 'linear-gradient(90deg, #ff9a9e 0%, #ec008c 100%)';
                if (s.porcentaje >= 80) {
                    barColor = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
                } else if (s.porcentaje >= 50) {
                    barColor = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
                } else if (s.porcentaje > 0) {
                    barColor = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
                }

                progresoCol = `
                    <div style="padding-right: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; margin-bottom: 3px; font-family: 'Outfit', sans-serif;">
                            <span style="color: var(--pink-main);">${s.totalCompletadas} / ${s.totalPlaneadas}</span>
                            <span style="color: var(--text-muted);">${s.porcentaje}%</span>
                        </div>
                        <div style="width: 100%; height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${s.porcentaje}%; height: 100%; background: ${barColor}; border-radius: 3px; transition: width 0.6s ease;"></div>
                        </div>
                    </div>
                `;
            }

            // Timeline de los 7 días (Avance Diario)
            let timelineHtml = `<div style="display: flex; gap: 4px; justify-content: center; align-items: center;">`;

            s.diasDetalle.forEach((d, index) => {
                const diaLetter = nombresDiasSemana[index].substring(0, 1);
                const diaCompleto = nombresDiasCompletos[index];
                let dotStyle = '';
                let titleAttr = '';

                if (d.estado === 'sin_servicio') {
                    dotStyle = 'background: #f1f5f9; color: #94a3b8; border: 1px dashed #cbd5e1;';
                    titleAttr = `${diaCompleto}: Sin servicio programado`;
                } else if (d.estado === 'sin_evaluacion') {
                    dotStyle = 'background: #cbd5e1; color: #475569; border: 1px solid #94a3b8; font-weight: 800; cursor: help;';
                    titleAttr = `${diaCompleto}: Día de servicio (Evaluación inicial pendiente)`;
                } else if (d.estado === 'azul') {
                    dotStyle = 'background: #e0f2fe; color: #0369a1; border: 1px solid #0ea5e9; font-weight: 800; cursor: pointer;';
                    titleAttr = `${diaCompleto}: Todas completadas por la niñera (${d.completadas}/${d.planeadas} actividades). Haz clic para ver detalles.`;
                } else if (d.estado === 'verde') {
                    dotStyle = 'background: #d1fae5; color: #065f46; border: 1px solid #10b981; font-weight: 800; cursor: pointer;';
                    titleAttr = `${diaCompleto}: Realizadas 2 a 4 por la niñera (${d.completadas}/${d.planeadas} actividades). Haz clic para ver detalles.`;
                } else if (d.estado === 'amarillo') {
                    dotStyle = 'background: #fef3c7; color: #d97706; border: 1px solid #f59e0b; font-weight: 800; cursor: pointer;';
                    titleAttr = `${diaCompleto}: Realizada 1 por la niñera (${d.completadas}/${d.planeadas} actividades). Haz clic para ver detalles.`;
                } else if (d.estado === 'rojo') {
                    dotStyle = 'background: #fee2e2; color: #b91c1c; border: 1px solid #ef4444; font-weight: 800; cursor: pointer;';
                    titleAttr = `${diaCompleto}: Pendiente por la niñera (0/${d.planeadas} actividades). Haz clic para ver detalles.`;
                }

                let onclickAttr = '';
                if (d.esDiaServicio && s.evaluado) {
                    const nameEsc = (s.pequeNombre || '').replace(/'/g, "\\'");
                    const emailEsc = (s.email || '').replace(/'/g, "\\'");
                    const nacimientoEsc = (s.nacimiento || '').replace(/'/g, "\\'");
                    onclickAttr = `onclick="abrirModalDetalleDiaAvance('${nameEsc}', '${emailEsc}', '${d.fecha}', '${nacimientoEsc}')"`;
                }

                timelineHtml += `
                    <div ${onclickAttr} title="${titleAttr}" style="width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 800; font-family: 'Outfit', sans-serif; ${dotStyle}">
                        ${diaLetter}
                    </div>
                `;
            });

            timelineHtml += `</div>`;

            const rev = s.revisionSemana || {};
            const isChecked = !!rev.revisado;
            
            let tooltipText = "Sin revisar";
            if (isChecked) {
                let fechaFormateada = "";
                if (rev.fecha_revision) {
                    try {
                        const dRev = new Date(rev.fecha_revision);
                        fechaFormateada = dRev.toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' hs';
                    } catch(e) {
                        fechaFormateada = rev.fecha_revision;
                    }
                }
                tooltipText = `Revisado por: ${rev.usuario || 'Supervisor'}\nFecha: ${fechaFormateada}`;
            }

            const nameEsc = (s.pequeNombre || '').replace(/'/g, "\\'");
            const emailEsc = (s.email || '').replace(/'/g, "\\'");
            const lunesEsc = (s.lunesISO || '').replace(/'/g, "\\'");

            const checkboxHtml = `
                <td style="padding: 6px 12px; vertical-align: middle; text-align: center;">
                    <label class="custom-checkbox-container" title="${tooltipText}" style="display: inline-block; position: relative; cursor: pointer; user-select: none; width: 20px; height: 20px; vertical-align: middle;">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleSupervisionRevision('${nameEsc}', '${emailEsc}', '${lunesEsc}', this.checked)" style="position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0;">
                        <span class="custom-checkmark" style="position: absolute; top: 0; left: 0; height: 20px; width: 20px; background-color: #f1f5f9; border: 2px solid #cbd5e1; border-radius: 6px; transition: all 0.2s ease;"></span>
                    </label>
                </td>
            `;

            html += `
                <tr style="${rowBg} ${borderStyle} transition: background-color 0.15s;" onmouseover="this.style.backgroundColor='rgba(232, 76, 154, 0.02)';" onmouseout="this.style.backgroundColor='';">
                    <td style="padding: 6px 12px; vertical-align: middle;">
                        <div style="font-weight: 700; color: var(--text-main); font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;" title="${s.cliente}">
                            Familia: ${s.cliente || 'Sin registrar'}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;" title="${s.pequeNombre}">
                            👶 Peque: ${s.pequeNombre || 'Sin registrar'}
                        </div>
                    </td>
                    <td style="padding: 6px 12px; vertical-align: middle; font-weight: 600; color: var(--text-main); font-family: 'Outfit', sans-serif;">
                        👩‍🏫 ${s.nanny}
                    </td>
                    <td style="padding: 6px 12px; vertical-align: middle; text-align: center;">
                        ${statusBadge}
                    </td>
                    <td style="padding: 6px 12px; vertical-align: middle;">
                        ${progresoCol}
                    </td>
                    <td style="padding: 6px 12px; vertical-align: middle; text-align: center;">
                        ${timelineHtml}
                    </td>
                    ${checkboxHtml}
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Asegurar animación giratoria para el loader
if (!document.getElementById("style-avance-estimulacion")) {
    const style = document.createElement("style");
    style.id = "style-avance-estimulacion";
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Función global para colapsar/ocultar secciones de ciudades
window.toggleSeccionCiudad = function(ciudadId) {
    const wrapper = document.getElementById(`table-wrapper-${ciudadId}`);
    const arrow = document.getElementById(`arrow-${ciudadId}`);
    if (!wrapper || !arrow) return;

    if (!window._EXPANDED_SECCIONES_SUPERVISION) {
        window._EXPANDED_SECCIONES_SUPERVISION = new Set();
    }

    if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
        arrow.textContent = '▼';
        window._EXPANDED_SECCIONES_SUPERVISION.add(ciudadId);
    } else {
        wrapper.style.display = 'none';
        arrow.textContent = '▶';
        window._EXPANDED_SECCIONES_SUPERVISION.delete(ciudadId);
    }
};

function obtenerActividadesPlaneadasParaDia(evalData, dateStr, nacimiento) {
    if (!evalData || !evalData.hitos_detalle || Object.keys(evalData.hitos_detalle).length === 0) {
        return [];
    }

    const etapaId = evalData.etapa_actual;
    const etapaFirebase = obtenerNombreEtapaHumano(etapaId);

    const respuestasHitos = evalData.hitos_detalle || {};
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

    // 2. Selección de Hitos (Exactamente 5)
    const slots = [];
    hitosRojos.forEach(h => { if (slots.length < 5 && !slots.includes(h)) slots.push(h); });
    hitosAmarillos.forEach(h => { if (slots.length < 5 && !slots.includes(h)) slots.push(h); });

    if (slots.length < 5 && (hitosRojos.length > 0 || hitosAmarillos.length > 0)) {
        const prioritarios = [...hitosRojos, ...hitosAmarillos];
        let repeticiones = 0;
        while (slots.length < 5 && repeticiones < prioritarios.length) {
            slots.push(prioritarios[repeticiones % prioritarios.length]);
            repeticiones++;
        }
        if (slots.length < 5) {
            hitosVerdes.forEach(h => { if (slots.length < 5 && !slots.includes(h)) slots.push(h); });
        }
    } else if (slots.length < 5) {
        hitosVerdes.forEach(h => { if (slots.length < 5 && !slots.includes(h)) slots.push(h); });
        let idx = 0;
        while (slots.length < 5 && hitosVerdes.length > 0) {
            slots.push(hitosVerdes[idx % hitosVerdes.length]);
            idx++;
        }
    }

    let dBase = null;
    const historial = evalData.historial_evaluaciones || {};
    const fechaEval = historial[etapaId]?.fecha_evaluacion || evalData.fecha_evaluacion;
    if (fechaEval) {
        dBase = (typeof fechaEval.toDate === 'function') ? fechaEval.toDate() : new Date(fechaEval);
    }
    if (!dBase || isNaN(dBase.getTime())) {
        if (nacimiento) {
            dBase = new Date(nacimiento + "T12:00:00");
        }
    }
    if (!dBase || isNaN(dBase.getTime())) {
        dBase = new Date();
        dBase.setDate(dBase.getDate() - 7);
    }
    dBase.setHours(0, 0, 0, 0);

    const dSel = new Date(dateStr + "T12:00:00");
    dSel.setHours(0, 0, 0, 0);

    const diffMs = dSel.getTime() - dBase.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const dayIndex = Math.max(0, diffDays);

    const list = [];
    const hitoOffsets = {};

    slots.forEach(hId => {
        let offset = 0;
        if (hitoOffsets[hId] === undefined) {
            hitoOffsets[hId] = 0;
        } else {
            hitoOffsets[hId]++;
            offset = hitoOffsets[hId];
        }

        let hitoTexto = "";
        if (typeof CATALOGO_HITOS !== 'undefined') {
            Object.keys(CATALOGO_HITOS).forEach(e => {
                if (CATALOGO_HITOS[e].areas) {
                    Object.keys(CATALOGO_HITOS[e].areas).forEach(a => {
                        const found = CATALOGO_HITOS[e].areas[a].hitos.find(h => h.id === hId);
                        if (found) hitoTexto = found.texto;
                    });
                }
            });
        }

        let actsHito = CATALOGO_ACTIVIDADES.filter(a =>
            (a.etapa || "").trim().toLowerCase() === etapaFirebase.toLowerCase() &&
            (a.hitoTitulo || "").trim().toLowerCase() === hitoTexto.toLowerCase()
        );

        if (actsHito.length > 0) {
            actsHito.sort((a, b) => (a.ordenSecuencia || 0) - (b.ordenSecuencia || 0));
            const act = actsHito[(dayIndex + offset) % actsHito.length];
            if (act) {
                list.push({
                    firebaseId: act.firebaseId,
                    titulo: act.titulo || act.actividad || "Sin título",
                    hitoId: hId,
                    hitoTexto: hitoTexto
                });
            }
        }
    });

    return list;
}

window.abrirModalDetalleDiaAvance = function(pequeNombre, email, dateStr, nacimiento) {
    const key = `${email}|${pequeNombre}`;
    const fbData = window._CACHE_FB_SUPERVISION[key] || { eval: null, prog: null };
    const evalData = fbData.eval;
    const progData = fbData.prog;

    if (!evalData) {
        alert("No se encontró la información de evaluación para este peque.");
        return;
    }

    const actividadesPlaneadas = obtenerActividadesPlaneadasParaDia(evalData, dateStr, nacimiento);
    const segHoy = (progData && progData.seguimiento_diario && progData.seguimiento_diario[dateStr]) 
        ? progData.seguimiento_diario[dateStr] 
        : {};

    const parts = dateStr.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaHumana = dateObj.toLocaleDateString('es-ES', opciones);

    // Asegurar animación scaleUp para el modal
    if (!document.getElementById("style-modal-scaleup")) {
        const style = document.createElement("style");
        style.id = "style-modal-scaleup";
        style.textContent = `
            @keyframes scaleUp {
                0% { transform: scale(0.95); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    const modalId = "modal-detalle-dia-avance";
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement("div");
        modal.id = modalId;
        modal.className = "modal-backdrop";
        modal.style.background = "rgba(0,0,0,0.7)";
        modal.style.backdropFilter = "blur(8px)";
        modal.style.zIndex = "99999";
        document.body.appendChild(modal);
    }

    let listHtml = "";
    if (actividadesPlaneadas.length === 0) {
        listHtml = `<div class="no-data" style="padding: 20px; text-align: center; color: var(--text-muted);">No hay actividades planeadas para este día.</div>`;
    } else {
        listHtml = `<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">`;
        actividadesPlaneadas.forEach(act => {
            const status = segHoy[act.firebaseId];
            const realizada = status && status.startsWith("realizada");
            
            let statusText = "Pendiente";
            let statusColor = "var(--error-text)";
            let statusBg = "var(--error-bg)";
            let semaforoColor = "#ef4444";
            
            if (realizada) {
                statusText = "Realizada";
                statusColor = "var(--success-text)";
                statusBg = "var(--success-bg)";
                semaforoColor = "#10b981";
            }

            const meta = (progData && progData.seguimiento_diario_metadata && progData.seguimiento_diario_metadata[dateStr] && progData.seguimiento_diario_metadata[dateStr][act.firebaseId])
                ? progData.seguimiento_diario_metadata[dateStr][act.firebaseId]
                : null;
            
            let fechaRegistroText = fechaHumana;
            if (realizada && meta && meta.fecha_registro) {
                try {
                    const regDate = new Date(meta.fecha_registro);
                    const opcionesLoc = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
                    fechaRegistroText = regDate.toLocaleString('es-ES', opcionesLoc) + ' hs';
                } catch(e) {
                    fechaRegistroText = fechaHumana;
                }
            }

            listHtml += `
                <div style="background: rgba(232, 76, 154, 0.02); border: 1px solid rgba(232, 76, 154, 0.08); border-radius: 12px; padding: 14px; display: flex; align-items: flex-start; gap: 12px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${semaforoColor}; flex-shrink: 0; margin-top: 5px; box-shadow: 0 0 8px ${semaforoColor}4d;"></div>
                    <div style="flex-grow: 1;">
                        <h4 style="margin: 0 0 6px 0; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: var(--text-main); line-height: 1.4;">
                            ${act.titulo}
                        </h4>
                        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 500; margin-bottom: 6px;">
                            Área: ${act.hitoTexto}
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span style="background: ${statusBg}; color: ${statusColor}; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
                                ${statusText}
                            </span>
                            ${realizada ? `
                                <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">
                                    📅 Registrado el: ${fechaRegistroText}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        listHtml += `</div>`;
    }

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 480px; padding: 25px; border-radius: 24px; animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 20px 50px rgba(232, 76, 154, 0.15); border: 1px solid rgba(232, 76, 154, 0.15);">
            <button onclick="cerrarModalDetalleDiaAvance()" style="position: absolute; top: 18px; right: 18px; background: #f1f5f9; border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); font-weight: 700; font-size: 14px; transition: background 0.2s;">
                ✕
            </button>
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 32px; margin-bottom: 6px;">👶</div>
                <h3 style="font-family: 'DM Serif Display', serif; color: var(--pink-main); font-size: 20px; margin: 0 0 4px 0;">
                    Actividades de ${pequeNombre}
                </h3>
                <p style="color: var(--text-muted); font-size: 13px; margin: 0; font-weight: 500; text-transform: capitalize;">
                    ${fechaHumana}
                </p>
            </div>
            
            <div style="max-height: 50vh; overflow-y: auto; padding-right: 4px;">
                ${listHtml}
            </div>
            
            <div style="margin-top: 25px; text-align: center;">
                <button class="btn-pink" onclick="cerrarModalDetalleDiaAvance()" style="width: 100%; padding: 12px 20px; font-weight: 700; border-radius: 12px; font-size: 14px; margin: 0;">
                    Entendido
                </button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
};

window.cerrarModalDetalleDiaAvance = function() {
    const modal = document.getElementById("modal-detalle-dia-avance");
    if (modal) {
        modal.style.display = "none";
    }
};

window.toggleSupervisionRevision = async function(pequeNombre, email, lunesISO, checked) {
    const docId = btoa(`${email}_${pequeNombre}`).replace(/=/g, "").replace(/\//g, "_").replace(/\+/g, "-");
    
    try {
        const docRef = fb_doc(_db, "progreso_peque", docId);
        const snap = await fb_getDoc(docRef);
        let data = snap.exists() ? snap.data() : { hitos: {}, seguimiento_diario: {} };
        
        if (!data.revisiones_supervision) {
            data.revisiones_supervision = {};
        }
        
        if (checked) {
            data.revisiones_supervision[lunesISO] = {
                revisado: true,
                usuario: window.SESION?.nombre || window.SESION?.email || "Supervisor",
                fecha_revision: new Date().toISOString()
            };
        } else {
            delete data.revisiones_supervision[lunesISO];
        }
        
        await fb_setDoc(docRef, data);
        mostrarToast(checked ? "Avance marcado como revisado ✓" : "Revisión cancelada");
    } catch(e) {
        console.error("Error al guardar revisión de supervisión:", e);
        mostrarToast("Error al guardar la revisión.");
    }
};

// Asegurar estilos del checkbox personalizado de supervisión
if (!document.getElementById("style-supervision-checkbox")) {
    const style = document.createElement("style");
    style.id = "style-supervision-checkbox";
    style.textContent = `
        .custom-checkbox-container input:checked ~ .custom-checkmark {
            background-color: var(--pink-main) !important;
            border-color: var(--pink-main) !important;
        }
        .custom-checkbox-container input:checked ~ .custom-checkmark:after {
            display: block;
        }
        .custom-checkbox-container .custom-checkmark:after {
            content: "";
            position: absolute;
            display: none;
            left: 6px;
            top: 2px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
        .custom-checkbox-container:hover .custom-checkmark {
            border-color: var(--pink-main);
            box-shadow: 0 0 5px rgba(232, 76, 154, 0.25);
        }
    `;
    document.head.appendChild(style);
}
