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
    serviciosEstimulacion.forEach(s => {
        const peques = s.peques_lista || [];
        if (peques.length === 0) {
            serviciosAvance.push({
                cliente: s.cliente,
                nanny: s.nombre_ninera || s.ninera || 'Sin asignar',
                pequeNombre: 'Sin registrar',
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
                evalData: null
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
                let planeadas = esDiaServicio ? slotsCount : 0;

                if (esDiaServicio) {
                    if (!evaluado) {
                        estado = 'sin_evaluacion';
                    } else {
                        let segHoy = (progData && progData.seguimiento_diario && progData.seguimiento_diario[fecha]) 
                            ? progData.seguimiento_diario[fecha] 
                            : {};
                        
                        let completadasHoy = Object.keys(segHoy).filter(actId => {
                            const val = segHoy[actId];
                            return val === 'realizada_ninera' || val === 'realizada';
                        }).length;

                        if (completadasHoy === 0) {
                            const sigDia = new Date(fecha + 'T12:00:00');
                            sigDia.setDate(sigDia.getDate() + 1);
                            const sigFecha = `${sigDia.getFullYear()}-${String(sigDia.getMonth() + 1).padStart(2, '0')}-${String(sigDia.getDate()).padStart(2, '0')}`;
                            
                            const esDiaServicioSig = (s.dias || []).includes(sigFecha);
                            if (!esDiaServicioSig) {
                                const segSig = (progData && progData.seguimiento_diario && progData.seguimiento_diario[sigFecha]) 
                                    ? progData.seguimiento_diario[sigFecha] 
                                    : {};
                                const completadasSig = Object.keys(segSig).filter(actId => {
                                    const val = segSig[actId];
                                    return val === 'realizada_ninera' || val === 'realizada';
                                }).length;
                                if (completadasSig > 0) {
                                    completadasHoy = completadasSig;
                                    segHoy = segSig;
                                }
                            }
                        }

                        completadas = completadasHoy;
                        totalPlaneadas += planeadas;
                        totalCompletadas += completadas;

                        if (completadas === 0) {
                            estado = 'rojo';
                        } else if (completadas === planeadas && planeadas > 0) {
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

            serviciosAvance.push({
                cliente: s.cliente,
                nanny: s.nombre_ninera || s.ninera || 'Sin asignar',
                pequeNombre: peque.nombre,
                evaluado,
                totalPlaneadas,
                totalCompletadas,
                porcentaje,
                diasDetalle,
                ciudad: s.ciudad || 'Otra',
                evalData: evalData
            });
        });
    });
    return serviciosAvance;
}

async function cargarAvanceEstimulacionSupervision(force = false) {
    const container = document.getElementById("lista-avance-estimulacion");
    if (!container) return;

    // Mostrar loader estético
    container.innerHTML = `
        <div style="text-align: center; padding: 40px; animation: fadeInPremium 0.6s ease-out;">
            <div class="loader-spinner" style="margin: 0 auto 15px; width: 40px; height: 40px; border: 4px solid rgba(232, 76, 154, 0.1); border-left-color: var(--pink-main); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: var(--text-muted); font-size: 14px; font-weight: 600;">Cargando servicios y consultando avances en Firebase...</p>
        </div>
    `;

    try {
        // 1. Obtener planeaciones consolidado de las 2 semanas
        let data = null;
        if (!force) {
            const cached = localStorage.getItem('CACHE_PLANEACIONES_SUP_' + SESION.email);
            if (cached) {
                try {
                    data = JSON.parse(cached);
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

        if (!data || !data.actual || Object.keys(data.actual).length === 0) {
            container.innerHTML = `<div class="no-data">No hay servicios programados para esta semana.</div>`;
            return;
        }

        // 2. Filtrar servicios de estimulación / neuronanny / nanny educativa
        const serviciosEstimulacion = [];
        const tiposEstimulacion = ['neuronanny', 'nanny educativa', 'miss nanny', 'estimulacion'];

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

        if (serviciosEstimulacion.length === 0) {
            container.innerHTML = `
                <div class="no-data" style="text-align: center; padding: 40px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🧸</div>
                    <p style="color: var(--text-muted); font-size: 14px;">No se encontraron servicios de Neuronanny o Nanny Educativa programados para esta semana.</p>
                </div>
            `;
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

        // 4. Consultar Firebase en tiempo real para los peques de los servicios filtrados
        const promises = [];
        let debounceTimer = null;
        const debouncedRecalcularYRenderizar = () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const serviciosAvance = calcularAvances(serviciosEstimulacion, diasSemanaISO);
                renderTarjetasAvance(serviciosAvance);
            }, 100);
        };

        serviciosEstimulacion.forEach(s => {
            const peques = s.peques_lista || [];
            peques.forEach(peque => {
                const key = `${s.email || 'sin_email'}|${peque.nombre}`;
                const docId = btoa(`${s.email}_${peque.nombre}`).replace(/=/g, "");

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
        renderTarjetasAvance(serviciosAvance);

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

function renderTarjetasAvance(servicios) {
    const container = document.getElementById("lista-avance-estimulacion");
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
    const ordenCiudades = ['CDMX', 'Puebla', 'Xalapa', 'Querétaro'];
    
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
        
        html += `
            <div class="ciudad-seccion" style="margin-bottom: 20px; animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family: 'DM Serif Display', serif; font-size: 15.5px; color: var(--pink-main); margin: 18px 0 8px 0; border-left: 4px solid var(--pink-main); padding-left: 8px; display: flex; align-items: center; gap: 6px; font-weight: 700;">
                    📍 ${ciudad} <span style="font-size: 11px; font-family: 'Outfit', sans-serif; font-weight: 500; color: var(--text-muted); background: rgba(232, 76, 154, 0.06); padding: 1px 6px; border-radius: 8px;">${serviciosDeCiudad.length} peques</span>
                </h3>
                <div class="supervision-table-wrapper" style="background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(10px); border-radius: 12px; border: 1px solid rgba(232, 76, 154, 0.1); box-shadow: 0 4px 15px rgba(0,0,0,0.01); overflow-x: auto; width: 100%;">
                    <table style="width: 100%; border-collapse: collapse; min-width: 700px; font-size: 13px; text-align: left;">
                        <thead>
                            <tr style="background: rgba(232, 76, 154, 0.03); border-bottom: 1px solid rgba(232, 76, 154, 0.08); color: var(--text-main); font-weight: 700; font-family: 'Outfit', sans-serif;">
                                <th style="padding: 10px 12px; width: 26%;">Peque / Familia</th>
                                <th style="padding: 10px 12px; width: 22%;">Niñera</th>
                                <th style="padding: 10px 12px; width: 12%; text-align: center;">Estatus</th>
                                <th style="padding: 10px 12px; width: 18%;">Progreso Semanal</th>
                                <th style="padding: 10px 12px; width: 22%; text-align: center;">Avance Diario</th>
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
                    dotStyle = 'background: #e0f2fe; color: #0369a1; border: 1px solid #0ea5e9; font-weight: 800; cursor: help;';
                    titleAttr = `${diaCompleto}: Todas completadas por la niñera (${d.completadas}/${d.planeadas} actividades)`;
                } else if (d.estado === 'verde') {
                    dotStyle = 'background: #d1fae5; color: #065f46; border: 1px solid #10b981; font-weight: 800; cursor: help;';
                    titleAttr = `${diaCompleto}: Realizadas 2 a 4 por la niñera (${d.completadas}/${d.planeadas} actividades)`;
                } else if (d.estado === 'amarillo') {
                    dotStyle = 'background: #fef3c7; color: #d97706; border: 1px solid #f59e0b; font-weight: 800; cursor: help;';
                    titleAttr = `${diaCompleto}: Realizada 1 por la niñera (${d.completadas}/${d.planeadas} actividades)`;
                } else if (d.estado === 'rojo') {
                    dotStyle = 'background: #fee2e2; color: #b91c1c; border: 1px solid #ef4444; font-weight: 800; cursor: help;';
                    titleAttr = `${diaCompleto}: Pendiente por la niñera (0/${d.planeadas} actividades)`;
                }

                timelineHtml += `
                    <div title="${titleAttr}" style="width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 800; font-family: 'Outfit', sans-serif; ${dotStyle}">
                        ${diaLetter}
                    </div>
                `;
            });

            timelineHtml += `</div>`;

            html += `
                <tr style="${rowBg} ${borderStyle} transition: background-color 0.15s;" onmouseover="this.style.backgroundColor='rgba(232, 76, 154, 0.02)';" onmouseout="this.style.backgroundColor='';">
                    <td style="padding: 6px 12px; vertical-align: middle;">
                        <div style="font-weight: 700; color: var(--text-main); font-family: 'Outfit', sans-serif; display: flex; align-items: center; gap: 4px;">
                            👶 ${s.pequeNombre}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;" title="${s.cliente}">
                            Familia: ${s.cliente}
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
