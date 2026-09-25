/**
 * ============================================================================
 * MÓDULO CLIENTE: PESTAÑA "SERVICIOS" (VINCULACIÓN REAL CON CONTROL_SERVICIOS)
 * Nannys y Peques - UI/UX Conectado en Tiempo Real con Supabase
 * ============================================================================
 */

(function () {
  'use strict';

  const ClienteServicios = {
    _servicios: [],
    _filtroFecha: null,
    _cargando: false,
    _semanaActivaIndex: 2, // 2: actual (default con 2 semanas atrás), offsets: -2, -1, 0, 1, 2, 3
    _semanasLabels: [],
    _semanasData: [],
    _isProgrammaticScroll: false,
    _scrollEndTimer: null,
    _scrollDebounce: null,
    _calendarRenderizado: false,
    _yaRenderizado: false,

    formatLocalISO: function (d) {
      if (!d || isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },

    init: function () {
      console.log('✨ [ClienteServicios] Inicializado módulo de Servicios conectado a la matriz');
      if (typeof suscribirRealtimePortalServicios === 'function') {
        suscribirRealtimePortalServicios();
      }

      // Renderizar calendario solo si no se ha renderizado aún
      if (!this._calendarRenderizado) {
        this.renderCalendarStrip();
      }

      // Listener para eventos de cambio en la matriz
      window.addEventListener('nyp_matriz_servicios_cambio', () => {
        const esCli = !!(window.SESION && window.SESION.cliente);
        const ch = esCli ? window.CACHE_CLIENTE : window.CACHE_NINERA;
        if (ch) ch.servicios = null;
        this.cargar(true);
      });

      // Sincronización instantánea por evento storage inter-pestañas
      window.addEventListener('storage', (e) => {
        if (e.key === 'nyp_servicios_sync_trigger' || e.key === 'nyp_matriz_servicios_cambio') {
          const esCli = !!(window.SESION && window.SESION.cliente);
          const ch = esCli ? window.CACHE_CLIENTE : window.CACHE_NINERA;
          if (ch) ch.servicios = null;
          this.cargar(true);
        }
      });

      // BroadcastChannel para sincronización inter-pestañas instantánea
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('nyp_admin_sync_channel');
          bc.onmessage = (e) => {
            if (e.data && (e.data.type === 'control_servicios_update' || e.data.type === 'cambio_servicio_matriz')) {
              const esCli = !!(window.SESION && window.SESION.cliente);
              const ch = esCli ? window.CACHE_CLIENTE : window.CACHE_NINERA;
              if (ch) ch.servicios = null;
              this.cargar(true);
            }
          };
        } catch (_) { }
      }

      // Suscripción Realtime dedicada en Supabase para ClienteServicios
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (client && !this._realtimeSubscribed) {
        this._realtimeSubscribed = true;
        try {
          client.channel('realtime_cliente_servicios_sync')
            .on('broadcast', { event: 'cambio_servicio_matriz' }, () => {
              const esCli = !!(window.SESION && window.SESION.cliente);
              const ch = esCli ? window.CACHE_CLIENTE : window.CACHE_NINERA;
              if (ch) ch.servicios = null;
              this.cargar(true);
            })
            .on('broadcast', { event: 'control_servicios_update' }, () => {
              const esCli = !!(window.SESION && window.SESION.cliente);
              const ch = esCli ? window.CACHE_CLIENTE : window.CACHE_NINERA;
              if (ch) ch.servicios = null;
              this.cargar(true);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'control_servicios' }, () => {
              const esCli = !!(window.SESION && window.SESION.cliente);
              const ch = esCli ? window.CACHE_CLIENTE : window.CACHE_NINERA;
              if (ch) ch.servicios = null;
              this.cargar(true);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'confirmaciones_asistencia' }, () => {
              const esCli = !!(window.SESION && window.SESION.cliente);
              const ch = esCli ? window.CACHE_CLIENTE : window.CACHE_NINERA;
              if (ch) ch.servicios = null;
              this.cargar(true);
            })
            .subscribe();
        } catch (eRt) {
          console.warn("Aviso activando realtime dedicado en ClienteServicios:", eRt);
        }
      }

      // Si ya hay servicios en caché, renderizar de inmediato síncronamente
      const esCliente = !!(window.SESION && window.SESION.cliente);
      const cacheHolder = esCliente ? window.CACHE_CLIENTE : window.CACHE_NINERA;
      if (cacheHolder && cacheHolder.servicios && cacheHolder.servicios.length > 0) {
        this._servicios = cacheHolder.servicios;
        this.renderMetricas();
        this.renderServiciosList();
        this.renderBitacora();
        this._yaRenderizado = true;
      }
      this.cargar(true);
    },

    setTab: function (tab) {
      const btnProgramados = document.getElementById('cs-btn-programados');
      const btnBitacora = document.getElementById('cs-btn-bitacora');
      const secProgramados = document.getElementById('cs-sec-programados');
      const secBitacora = document.getElementById('cs-sec-bitacora');

      if (tab === 'programados') {
        if (btnProgramados) btnProgramados.classList.add('active');
        if (btnBitacora) btnBitacora.classList.remove('active');
        if (secProgramados) secProgramados.style.display = 'block';
        if (secBitacora) secBitacora.style.display = 'block';
        this._filtroFecha = null;
        this.renderCalendarStrip();
        this.renderServiciosList();
        this.renderBitacora();
      } else {
        if (btnProgramados) btnProgramados.classList.remove('active');
        if (btnBitacora) btnBitacora.classList.add('active');
        if (secProgramados) secProgramados.style.display = 'none';
        if (secBitacora) {
          secBitacora.style.display = 'block';
          secBitacora.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },

    /**
     * Consulta Supabase (control_servicios) y carga los servicios reales del cliente / niñera
     */
    cargar: async function (force = false) {
      const esCliente = !!(window.SESION && window.SESION.cliente);
      const rol = esCliente ? 'cliente' : 'nanny';
      const cacheHolder = esCliente ? window.CACHE_CLIENTE : window.CACHE_NINERA;

      // ⚡ RENDERIZADO INMEDIATO SINCRÓNICO: Si ya hay caché y no se fuerza, renderizarlo primero para cero parpadeo
      if (!force && cacheHolder && cacheHolder.servicios && cacheHolder.servicios.length > 0) {
        this._servicios = cacheHolder.servicios;
        this.renderMetricas();
        if (!this._calendarRenderizado) this.renderCalendarStrip();
        this.renderServiciosList();
        this.renderBitacora();
        this._yaRenderizado = true;
      }

      if (force && cacheHolder) {
        cacheHolder.servicios = null;
      }

      if (this._cargando) {
        if (force) this._pendingReload = true;
        return;
      }
      this._cargando = true;

      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client || !window.SESION) {
        this._cargando = false;
        return;
      }

      try {
        let svcs = [];
        const hoy = new Date();
        const dOffset = (hoy.getDay() + 6) % 7;
        const lunesActualDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dOffset);

        // Generar los 6 lunes ISO para las 6 semanas del calendario (2 atrás, actual, 3 adelante)
        const semanasConsultar = [-2, -1, 0, 1, 2, 3].map(wOffset => {
          const d = new Date(lunesActualDate.getFullYear(), lunesActualDate.getMonth(), lunesActualDate.getDate() + (wOffset * 7));
          return this.formatLocalISO(d);
        });

        // Obtener mapa de clientes para enriquecer direcciones y notas
        let mapaClientes = {};
        try {
          const { data: dbClientes } = await client.from('clientes').select('*');
          if (Array.isArray(dbClientes)) {
            dbClientes.forEach(c => {
              const kEmail = (c.email || '').trim().toLowerCase();
              const kNom = (c.nombre || '').trim().toLowerCase();
              const kNomNorm = typeof normalizarTexto === 'function' ? normalizarTexto(kNom) : kNom;
              if (kEmail) mapaClientes[kEmail] = c;
              if (kNom) mapaClientes[kNom] = c;
              if (kNomNorm) mapaClientes[kNomNorm] = c;
            });
          }
        } catch (e) { }

        // Consultar control_servicios para cliente o niñera
        let qFilas = client.from('control_servicios').select('*');

        if (esCliente) {
          const emailCli = (window.SESION?.email || '').trim().toLowerCase();
          const nomCli = (window.SESION?.nombre || '').trim().toLowerCase();
          if (emailCli && nomCli) {
            qFilas = qFilas.or(`cliente_email.ilike.${emailCli},cliente_nombre.ilike.%${nomCli}%`);
          } else if (emailCli) {
            qFilas = qFilas.ilike('cliente_email', emailCli);
          } else {
            qFilas = qFilas.in('semana_iso', semanasConsultar);
          }
        } else {
          // Niñera: consultar por nombre o rango de semanas del calendario
          const nannyNom = (window.SESION?.nombre || '').trim();
          if (nannyNom) {
            const primerNom = nannyNom.split(' ')[0];
            if (primerNom.length >= 3) {
              qFilas = qFilas.or(`nanny_nombre.ilike.%${nannyNom}%,nanny_nombre.ilike.%${primerNom}%`);
            } else {
              qFilas = qFilas.in('semana_iso', semanasConsultar);
            }
          } else {
            qFilas = qFilas.in('semana_iso', semanasConsultar);
          }
        }

        const { data: filas, error: errFilas } = await qFilas;

        if (!errFilas && Array.isArray(filas)) {
          svcs = typeof transformarFilasControlServicios === 'function'
            ? transformarFilasControlServicios(filas, rol, window.SESION, mapaClientes)
            : [];
          if (cacheHolder) {
            cacheHolder.servicios = svcs;
          }
          if (window.CACHE_NINERA && !esCliente) {
            window.CACHE_NINERA.servicios = svcs;
          }
          if (typeof CAL_SERVICIOS !== 'undefined' && !esCliente) {
            window.CAL_SERVICIOS = svcs;
          }
        }

        // Ordenar cronológicamente
        svcs.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));
        this._servicios = svcs;

        // Renderizar vistas dinámicas
        this.renderMetricas();
        this.renderCalendarStrip();
        this.renderServiciosList();
        this.renderBitacora();
        this._yaRenderizado = true;
      } catch (err) {
        console.error("Error al cargar servicios del cliente/niñera:", err);
      } finally {
        this._cargando = false;
        if (this._pendingReload) {
          this._pendingReload = false;
          this.cargar(true);
        }
      }
    },

    /**
     * Retorna los servicios que pertenecen exclusivamente a la semana activa del calendario
     */
    _getServiciosSemanaActiva: function () {
      if (!this._semanasData || !this._semanasData[this._semanaActivaIndex]) {
        return this._servicios || [];
      }
      const sem = this._semanasData[this._semanaActivaIndex];
      return (this._servicios || []).filter(s => {
        if (!s.fecha) return false;
        const f = typeof s.fecha === 'string' ? s.fecha.slice(0, 10) : '';
        return (s.semana_iso === sem.lunISO) || (f >= sem.lunISO && f <= sem.domISO);
      });
    },

    /**
     * Retorna los servicios para la vista actual (del día seleccionado o de la semana activa)
     */
    _getServiciosActuales: function () {
      if (this._filtroFecha) {
        return (this._servicios || []).filter(s => {
          const f = typeof s.fecha === 'string' ? s.fecha.slice(0, 10) : '';
          return f === this._filtroFecha;
        });
      }
      return this._getServiciosSemanaActiva();
    },

    /**
     * Renderiza las 3 métricas superiores para la semana seleccionada
     */
    renderMetricas: function () {
      const elTotalSvc = document.getElementById('csMetricTotalServicios');
      const elTotalHoras = document.getElementById('csMetricTotalHoras');
      const elBitacoras = document.getElementById('csMetricBitacoras');

      const svcsSemana = this._getServiciosSemanaActiva();
      const totalSvc = svcsSemana.length;

      let totalHoras = 0;
      svcsSemana.forEach(s => {
        totalHoras += this.calcularHoras(s.hora_inicio, s.hora_fin);
      });
      const horasRedondeadas = Math.round(totalHoras * 10) / 10;

      const hoyISO = this.formatLocalISO(new Date());
      const esClienteM = !!(window.SESION && window.SESION.cliente);
      const bitacorasPendientes = svcsSemana.filter(s => {
        const sNin = s.nombre_ninera || s['Nombre de la niñera'] || '';
        const nNin = (typeof _norm === 'function' ? _norm(sNin) : sNin.toLowerCase().trim());
        const cKey = `${s.fecha}_${s.email || s.cliente}_${nNin}`;
        const cKeyAlt = `${s.fecha}_${s.cliente}_${nNin}`;
        const cKeySimple = `${s.fecha}_${s.cliente}`;

        let bD = (window.BITACORA_CACHE && (window.BITACORA_CACHE[cKey] || window.BITACORA_CACHE[cKeyAlt] || window.BITACORA_CACHE[cKeySimple])) || s.bitacora_datos || null;
        if (!bD && window.BITACORA_CACHE) {
          const mk = Object.keys(window.BITACORA_CACHE).find(k => k.startsWith(s.fecha) && (
            !s.cliente || k.toLowerCase().includes(String(s.cliente).toLowerCase()) || String(s.cliente).toLowerCase().includes(k.toLowerCase())
          ));
          if (mk) bD = window.BITACORA_CACHE[mk];
        }
        if (!bD) {
          try {
            const lsRaw = localStorage.getItem('BITACORA_DRAFT_' + cKey) ||
              localStorage.getItem('BITACORA_DRAFT_' + cKeyAlt) ||
              localStorage.getItem('BITACORA_DRAFT_' + cKeySimple);
            if (lsRaw) bD = JSON.parse(lsRaw);
          } catch (eLs) { }
        }

        const isAcc = !!(bD && (bD.Acepta === 'Sí' || bD.Acepta === 'si' || bD.acepta === 'Sí' || bD.acepta === 'si' || bD.Revisada === 'Sí' || bD.revisada === 'Sí' || bD.fecha_acepta || bD.estado === 'aprobada')) || !!s.bitacora_aceptada || (s.estado_bitacora === 'aprobada');
        const _a = (bD && (bD['Estado de ánimo'] || bD.animo || bD['Pregunta 13'] || bD.p13)) || '';
        const _si = (bD && (bD['Sin síntomas'] || bD.sin_sintomas || bD['Pregunta 1'] || bD.p1)) || '';
        const _ac = (bD && (bD['Accidente'] || bD.accidente || bD['Pregunta 17'] || bD.p17)) || '';
        const _en = (bD && (bD['Entrega en buen estado'] || bD.entrega_buen_estado || bD['Pregunta 19'] || bD.p19)) || '';
        const hasMin = !!(_a && _si && _ac && _en);

        if (esClienteM) {
          // Para cliente: Cuenta todas las bitácoras que no han sido aprobadas (tanto pendientes de niñera como pendientes de aprobación)
          return !isAcc;
        } else {
          // Para niñera: Cuenta las que la niñera aún no ha llenado
          return !hasMin && !isAcc;
        }
      }).length;

      if (elTotalSvc) elTotalSvc.textContent = totalSvc;
      if (elTotalHoras) elTotalHoras.textContent = `${horasRedondeadas} h`;
      if (elBitacoras) elBitacoras.textContent = bitacorasPendientes;
    },


    /**
     * Renderiza el carrusel de semanas de Lunes a Domingo con scroll horizontal y resaltado de hoy
     */
    renderCalendarStrip: function () {
      const stripContainer = document.getElementById('csCalendarStrip');
      if (!stripContainer) return;

      const hoyDate = new Date();
      const hoyISO = this.formatLocalISO(hoyDate);

      // Calcular el lunes de la semana actual
      const dOffset = (hoyDate.getDay() + 6) % 7;
      const lunesActualDate = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), hoyDate.getDate() - dOffset);

      const diasNombres = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
      const mesesCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      // Mapear qué días tienen servicios
      const serviciosPorDia = {};
      (this._servicios || []).forEach(s => {
        if (!s.fecha) return;
        let fStr = s.fecha;
        if (typeof fStr === 'string' && fStr.length >= 10) {
          fStr = fStr.slice(0, 10);
        }
        if (!serviciosPorDia[fStr]) serviciosPorDia[fStr] = [];
        serviciosPorDia[fStr].push(s);
      });

      // Configuración de semanas a renderizar: 2 semanas atrás, 1 semana atrás, actual, siguiente, en 2 semanas, en 3 semanas
      const semanasConfig = [
        { offset: -2, label: 'Hace 2 semanas' },
        { offset: -1, label: 'Semana anterior' },
        { offset: 0, label: 'Semana actual' },
        { offset: 1, label: 'Semana siguiente' },
        { offset: 2, label: 'En 2 semanas' },
        { offset: 3, label: 'En 3 semanas' }
      ];

      const weekSlidesHtml = [];
      const labelsData = [];
      const semanasData = [];

      semanasConfig.forEach((sem, sIdx) => {
        const lunSemana = new Date(lunesActualDate.getFullYear(), lunesActualDate.getMonth(), lunesActualDate.getDate() + (sem.offset * 7));
        const domSemana = new Date(lunSemana.getFullYear(), lunSemana.getMonth(), lunSemana.getDate() + 6);

        const lunISO = this.formatLocalISO(lunSemana);
        const domISO = this.formatLocalISO(domSemana);

        const lunNum = String(lunSemana.getDate()).padStart(2, '0');
        const lunMes = mesesCortos[lunSemana.getMonth()];
        const domNum = String(domSemana.getDate()).padStart(2, '0');
        const domMes = mesesCortos[domSemana.getMonth()];

        const datesText = `${lunNum} ${lunMes} – ${domNum} ${domMes}`;
        labelsData.push({ title: sem.label, dates: datesText });
        semanasData.push({ offset: sem.offset, label: sem.label, lunISO, domISO, datesText });

        const daysHtml = [];
        for (let i = 0; i < 7; i++) {
          const curDate = new Date(lunSemana.getFullYear(), lunSemana.getMonth(), lunSemana.getDate() + i);
          const isoStr = this.formatLocalISO(curDate);
          const diaNombre = diasNombres[i];
          const diaNum = String(curDate.getDate()).padStart(2, '0');

          const isToday = (isoStr === hoyISO);
          const isActive = (this._filtroFecha === isoStr);
          const svcsEnDia = serviciosPorDia[isoStr] || [];

          // Renderizar exactamente un puntito por cada servicio programado en ese día
          let dotsHtml = '';
          if (svcsEnDia.length > 0) {
            dotsHtml = svcsEnDia.map(s => {
              const isConf = !!(s.asistencia_confirmada || s.estado === 'Confirmado');
              const dotColor = isConf ? 'green' : 'amber';
              return `<span class="cs-cal-dot ${dotColor}"></span>`;
            }).join('');
          }

          daysHtml.push(`
            <div class="cs-cal-day-col ${isToday ? 'is-today' : ''} ${isActive ? 'active' : ''}" 
                 data-date="${isoStr}"
                 onclick="ClienteServicios.seleccionarDia(this, '${isoStr}')"
                 title="${isToday ? 'Hoy' : ''}">
              <span class="cs-cal-day-name">${diaNombre}</span>
              <span class="cs-cal-day-num">${diaNum}</span>
              <div class="cs-cal-dots-wrap">${dotsHtml}</div>
            </div>
          `);
        }

        weekSlidesHtml.push(`
          <div class="cs-week-slide" data-week-idx="${sIdx}">
            ${daysHtml.join('')}
          </div>
        `);
      });

      this._semanasLabels = labelsData;
      this._semanasData = semanasData;
      this._calendarRenderizado = true;

      const defaultIndex = semanasConfig.findIndex(s => s.offset === 0);
      if (this._semanaActivaIndex === undefined || this._semanaActivaIndex < 0 || this._semanaActivaIndex >= semanasConfig.length) {
        this._semanaActivaIndex = defaultIndex >= 0 ? defaultIndex : 2; // Por defecto Semana actual
      }

      const activeLabel = labelsData[this._semanaActivaIndex] || labelsData[defaultIndex] || labelsData[0];

      const fullCalendarHtml = `
        <div class="cs-week-header-row">
          <button type="button" class="cs-week-nav-btn" id="csWeekPrevBtn" onclick="ClienteServicios.navSemana(-1)" aria-label="Semana anterior">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="cs-week-title-wrap">
            <span class="cs-week-title" id="csWeekTitle">${activeLabel.title}</span>
            <span class="cs-week-dates" id="csWeekDates">${activeLabel.dates}</span>
          </div>
          <button type="button" class="cs-week-nav-btn" id="csWeekNextBtn" onclick="ClienteServicios.navSemana(1)" aria-label="Semana siguiente">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="cs-weeks-scroll" id="csWeeksScroll" onscroll="ClienteServicios.onWeeksScroll(event)">
          ${weekSlidesHtml.join('')}
        </div>

        <div class="cs-week-dots" id="csWeekDots">
          ${semanasConfig.map((_, idx) => `
            <span class="cs-week-dot ${idx === this._semanaActivaIndex ? 'active' : ''}" onclick="ClienteServicios.irASemana(${idx})"></span>
          `).join('')}
        </div>
      `;

      stripContainer.innerHTML = fullCalendarHtml;

      // Posicionar semana activa
      this._restaurarPosicionSemana();
    },

    restaurarPosicionSemana: function () {
      this._restaurarPosicionSemana();
    },

    _restaurarPosicionSemana: function () {
      const defaultIdx = (this._semanasData && this._semanasData.findIndex(s => s.offset === 0) >= 0) ? this._semanasData.findIndex(s => s.offset === 0) : 2;
      const idx = (this._semanaActivaIndex !== undefined && this._semanaActivaIndex >= 0) ? this._semanaActivaIndex : defaultIdx;
      this._semanaActivaIndex = idx;

      const scrollEl = document.getElementById('csWeeksScroll');
      if (!scrollEl) return;

      const aplicarPosicion = () => {
        if (!scrollEl || !scrollEl.children || scrollEl.children.length <= idx) return;
        const target = scrollEl.children[idx];
        const scrollWidth = scrollEl.offsetWidth;

        if (target && target.offsetLeft > 0) {
          scrollEl.scrollLeft = target.offsetLeft - scrollEl.offsetLeft;
        } else if (scrollWidth > 0) {
          scrollEl.scrollLeft = scrollWidth * idx;
        }
        this.actualizarEtiquetaSemana(idx);
      };

      aplicarPosicion();

      // Múltiples pasadas tras render y reflow para garantizar que siempre se ubique en la semana correcta
      requestAnimationFrame(() => {
        aplicarPosicion();
        setTimeout(aplicarPosicion, 50);
        setTimeout(aplicarPosicion, 150);
        setTimeout(aplicarPosicion, 350);
      });

      // Configurar ResizeObserver permanente en el contenedor de semanas
      if (window.ResizeObserver && !this._resizeObserver) {
        this._resizeObserver = new ResizeObserver(entries => {
          for (let entry of entries) {
            if (entry.contentRect.width > 50) {
              aplicarPosicion();
            }
          }
        });
        this._resizeObserver.observe(scrollEl);
      }
    },

    onWeeksScroll: function (e) {
      if (this._isProgrammaticScroll) return;

      const scrollEl = e.target || document.getElementById('csWeeksScroll');
      if (!scrollEl || !scrollEl.children || scrollEl.children.length === 0) return;

      // Si el contenedor está oculto o no tiene dimensiones medibles, ignorar eventos espurios
      if (scrollEl.offsetWidth === 0) return;

      clearTimeout(this._scrollDebounce);
      this._scrollDebounce = setTimeout(() => {
        if (this._isProgrammaticScroll) return;
        if (scrollEl.offsetWidth === 0) return;

        const firstChild = scrollEl.children[0];
        const secondChild = scrollEl.children[1];
        const step = (secondChild && firstChild && (secondChild.offsetLeft > firstChild.offsetLeft))
          ? (secondChild.offsetLeft - firstChild.offsetLeft)
          : scrollEl.offsetWidth;
        if (!step || step <= 0) return;

        const maxIdx = (this._semanasData ? this._semanasData.length - 1 : 5);
        const newIdx = Math.round(scrollEl.scrollLeft / step);
        if (newIdx !== this._semanaActivaIndex && newIdx >= 0 && newIdx <= maxIdx) {
          this._semanaActivaIndex = newIdx;
          this._filtroFecha = null;
          this.actualizarEtiquetaSemana(newIdx);

          // Limpiar selección de día en interfaz
          const todosDias = document.querySelectorAll('#csCalendarStrip .cs-cal-day-col');
          todosDias.forEach(el => el.classList.remove('active'));

          this.renderMetricas();
          this.renderServiciosList();
          this.renderBitacora();
        }
      }, 70);
    },

    navSemana: function (delta) {
      const maxIdx = (this._semanasData ? this._semanasData.length - 1 : 5);
      const defaultIdx = (this._semanasData && this._semanasData.findIndex(s => s.offset === 0) >= 0) ? this._semanasData.findIndex(s => s.offset === 0) : 2;
      let nextIdx = (this._semanaActivaIndex !== undefined ? this._semanaActivaIndex : defaultIdx) + delta;
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx > maxIdx) nextIdx = maxIdx;
      this.irASemana(nextIdx);
    },

    irASemana: function (targetIdx) {
      const maxIdx = (this._semanasData ? this._semanasData.length - 1 : 5);
      if (targetIdx < 0 || targetIdx > maxIdx) return;

      this._isProgrammaticScroll = true;
      clearTimeout(this._scrollEndTimer);
      this._scrollEndTimer = setTimeout(() => {
        this._isProgrammaticScroll = false;
      }, 450);

      this._semanaActivaIndex = targetIdx;
      this._filtroFecha = null; // Reiniciar filtro por día al cambiar de semana

      const scrollEl = document.getElementById('csWeeksScroll');
      if (scrollEl && scrollEl.children[targetIdx]) {
        const target = scrollEl.children[targetIdx];
        scrollEl.scrollTo({
          left: target.offsetLeft - scrollEl.offsetLeft,
          behavior: 'smooth'
        });
        this.actualizarEtiquetaSemana(targetIdx);
      }

      // Limpiar selección de día en interfaz
      const todosDias = document.querySelectorAll('#csCalendarStrip .cs-cal-day-col');
      todosDias.forEach(el => el.classList.remove('active'));

      this.renderMetricas();
      this.renderServiciosList();
      this.renderBitacora();
    },

    actualizarEtiquetaSemana: function (idx) {
      if (!this._semanasLabels || !this._semanasLabels[idx]) return;
      const data = this._semanasLabels[idx];
      const elTitle = document.getElementById('csWeekTitle');
      const elDates = document.getElementById('csWeekDates');
      if (elTitle) elTitle.textContent = data.title;
      if (elDates) elDates.textContent = data.dates;

      const dotsContainer = document.getElementById('csWeekDots');
      if (dotsContainer) {
        Array.from(dotsContainer.children).forEach((dot, dIdx) => {
          dot.classList.toggle('active', dIdx === idx);
        });
      }

      const maxIdx = (this._semanasLabels ? this._semanasLabels.length - 1 : 5);
      const btnPrev = document.getElementById('csWeekPrevBtn');
      const btnNext = document.getElementById('csWeekNextBtn');
      if (btnPrev) {
        btnPrev.style.opacity = idx === 0 ? '0.35' : '1';
        btnPrev.style.pointerEvents = idx === 0 ? 'none' : 'auto';
      }
      if (btnNext) {
        btnNext.style.opacity = idx === maxIdx ? '0.35' : '1';
        btnNext.style.pointerEvents = idx === maxIdx ? 'none' : 'auto';
      }
    },

    /**
     * Filtra los servicios al hacer clic en un día específico de la tira (sin saltos de scroll)
     */
    seleccionarDia: function (diaElement, fechaISO) {
      const todosDias = document.querySelectorAll('#csCalendarStrip .cs-cal-day-col');

      if (this._filtroFecha === fechaISO) {
        // Segundo clic en el mismo día: desactiva el filtro y vuelve a mostrar toda la semana
        this._filtroFecha = null;
        todosDias.forEach(el => el.classList.remove('active'));
      } else {
        this._filtroFecha = fechaISO;
        todosDias.forEach(el => {
          if (el.getAttribute('data-date') === fechaISO) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });
      }

      this.renderServiciosList();
      this.renderBitacora();
    },

    limpiarFiltro: function () {
      this._filtroFecha = null;
      const todosDias = document.querySelectorAll('#csCalendarStrip .cs-cal-day-col');
      todosDias.forEach(el => el.classList.remove('active'));
      this.renderServiciosList();
      this.renderBitacora();
    },

    /**
     * Renderiza la lista de servicios programados para la semana activa o día seleccionado
     */
    renderServiciosList: function () {
      this.renderSectionAction();
      const listContainer = document.getElementById('csServicesList');
      if (!listContainer) return;

      const lista = this._getServiciosActuales();

      if (lista.length === 0) {
        listContainer.innerHTML = `
          <div style="background:#ffffff; border:1px solid #f1f5f9; border-radius:18px; padding:28px 16px; text-align:center; color:#64748b; margin-top:6px;">
            <p style="font-size:15px; margin:0 0 8px 0; font-weight:700; color:#1e293b;">
              ${this._filtroFecha ? 'Sin servicios para este día' : 'No tienes servicios programados para esta semana'}
            </p>
            <span style="font-size:13px; opacity:0.85;">
              ${this._filtroFecha ? 'Selecciona otro día del calendario o pulsa "Ver todos".' : 'No olvides solicitar servicios por whatsapp'}
            </span>
            ${this._filtroFecha ? `<br><button type="button" class="btn-primary" onclick="ClienteServicios.limpiarFiltro()" style="margin-top:14px; padding:6px 16px; width:auto; display:inline-block; font-size:13px; border-radius:12px; background:var(--brand-pink, #e84c9a); color:#ffffff;">Ver todos los servicios</button>` : ''}
          </div>
        `;
        return;
      }

      const diasCortos = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
      const mesesCortos = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const coloresBadge = ['pink', 'cyan', 'green', 'blue', 'amber'];

      listContainer.innerHTML = lista.map((s, idx) => {
        const dObj = new Date(s.fecha + 'T12:00:00');
        const dNom = diasCortos[dObj.getDay()] || 'DÍA';
        const dNum = String(dObj.getDate()).padStart(2, '0');
        const mNom = mesesCortos[dObj.getMonth()] || '';
        const badgeColor = coloresBadge[idx % coloresBadge.length];

        const esCliente = !!(window.SESION && window.SESION.cliente);
        const hTxt = s.hora_fin ? `${s.hora_inicio} – ${s.hora_fin}` : (s.hora_inicio || 'Horario por confirmar');
        const nName = esCliente ? (s.nombre_ninera || 'Por asignar') : (s.cliente || 'Familia asignada');
        const est = String(s.estado || '').trim().toLowerCase();
        const hasFin = !!(s.fin_real || est === 'completado' || est === 'finalizado');
        const hasIni = !!(s.inicio_real || est === 'en curso' || est === 'iniciado');
        const isConf = !!(s.asistencia_confirmada || est === 'confirmado');

        let pillClass = 'pending';
        let pillLabel = 'Pendiente';
        let pillIcon = `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`;
        let pillFill = 'none';
        let pillStroke = 'currentColor';

        if (hasFin) {
          pillClass = 'finalizado';
          pillLabel = 'Finalizado';
          pillIcon = `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>`;
          pillFill = 'currentColor';
          pillStroke = 'none';
        } else if (hasIni) {
          pillClass = 'iniciado';
          pillLabel = 'Iniciado';
          pillIcon = `<circle cx="12" cy="12" r="10" opacity="0.25"></circle><path d="M10 8l6 4-6 4V8z"/>`;
          pillFill = 'currentColor';
          pillStroke = 'none';
        } else if (isConf) {
          pillClass = 'confirmed';
          pillLabel = 'Confirmado';
          pillIcon = `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />`;
          pillFill = 'currentColor';
          pillStroke = 'none';
        }

        return `
          <div class="cs-service-item" onclick="ClienteServicios.abrirModalDetalle('${s.id}')">
            <div class="cs-date-badge ${badgeColor}">
              <span class="cs-date-day">${dNom}</span>
              <span class="cs-date-num">${dNum}</span>
              <span class="cs-date-month">${mNom}</span>
            </div>
            <div class="cs-service-body">
              <span class="cs-service-time">${hTxt}</span>
              <span class="cs-service-name">${nName}</span>
              <div class="cs-status-pill ${pillClass}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="${pillFill}" stroke="${pillStroke}" stroke-width="2">
                  ${pillIcon}
                </svg>
                <span>${pillLabel}</span>
              </div>
            </div>
            <span class="cs-service-arrow">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </div>
        `;
      }).join('');
    },

    /**
     * Sincroniza las tarjetas de bitácora que coinciden con los días de servicio de la semana o día seleccionado
     */
    renderBitacora: function () {
      const container = document.getElementById('csBitacoraContainer') || document.getElementById('csLogCard')?.parentElement;
      if (!container) return;

      const lista = this._getServiciosActuales();

      if (lista.length === 0) {
        container.innerHTML = `
          <div class="cs-log-empty-card">
            <p style="font-size:15px; margin:0 0 6px 0; font-weight:700; color:#1e293b;">
              ${this._filtroFecha ? 'Sin bitácora para este día' : 'Sin bitácoras para esta semana'}
            </p>
            <span style="font-size:13px; opacity:0.85;">
              ${this._filtroFecha ? 'No hay servicios ni bitácoras registradas para esta fecha.' : 'No hay servicios programados con bitácora para la semana seleccionada.'}
            </span>
          </div>
        `;
        return;
      }

      const diasCortos = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
      const mesesCortos = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const coloresBadge = ['pink', 'cyan', 'green', 'blue', 'amber'];
      const hoyISO = this.formatLocalISO(new Date());

      container.innerHTML = lista.map((s, idx) => {
        const dObj = new Date(s.fecha + 'T12:00:00');
        const dNom = diasCortos[dObj.getDay()] || 'DÍA';
        const dNum = String(dObj.getDate()).padStart(2, '0');
        const mNom = mesesCortos[dObj.getMonth()] || '';
        const badgeColor = coloresBadge[idx % coloresBadge.length];

        const sNinera = s.nombre_ninera || s['Nombre de la niñera'] || '';
        const normNinera = (typeof _norm === 'function' ? _norm(sNinera) : sNinera.toLowerCase().trim());
        const cacheKey = `${s.fecha}_${s.email || s.cliente}_${normNinera}`;
        const cacheKeyAlt = `${s.fecha}_${s.cliente}_${normNinera}`;
        const cacheKeySimple = `${s.fecha}_${s.cliente}`;

        let bitData = (window.BITACORA_CACHE && (window.BITACORA_CACHE[cacheKey] || window.BITACORA_CACHE[cacheKeyAlt] || window.BITACORA_CACHE[cacheKeySimple])) || s.bitacora_datos || null;
        if (!bitData && window.BITACORA_CACHE) {
          const matchingKey = Object.keys(window.BITACORA_CACHE).find(k => k.startsWith(s.fecha) && (
            !s.cliente || k.toLowerCase().includes(String(s.cliente).toLowerCase()) || String(s.cliente).toLowerCase().includes(k.toLowerCase())
          ));
          if (matchingKey) bitData = window.BITACORA_CACHE[matchingKey];
        }

        if (!bitData && s.observaciones && typeof s.observaciones === 'string') {
          const diaClave = s.dia_clave || (s.id ? s.id.split('_')[1] : '');
          const regexBit = new RegExp(`<!--bitacora_(?:${diaClave}|${s.fecha}):(.*?)-->`);
          const mBit = s.observaciones.match(regexBit);
          if (mBit && mBit[1]) {
            try {
              const parsed = JSON.parse(mBit[1]);
              bitData = (window.BitacorasSupabase?.formatearRegistro) ? window.BitacorasSupabase.formatearRegistro(parsed) : parsed;
              if (bitData && window.BITACORA_CACHE) {
                window.BITACORA_CACHE[cacheKey] = bitData;
              }
            } catch (e) { }
          }
        }

        if (!bitData) {
          try {
            const lsRaw = localStorage.getItem('BITACORA_DRAFT_' + cacheKey) ||
              localStorage.getItem('BITACORA_DRAFT_' + cacheKeyAlt) ||
              localStorage.getItem('BITACORA_DRAFT_' + cacheKeySimple) ||
              (s.id ? localStorage.getItem('BITACORA_DRAFT_' + s.id) : null);
            if (lsRaw) bitData = JSON.parse(lsRaw);
          } catch (eLs) { }
        }

        if (bitData && !s.bitacora_datos) {
          s.bitacora_datos = bitData;
        }

        const formatHoraCorta = (val) => {
          if (!val) return '';
          const sVal = String(val).trim();
          if (!sVal) return '';
          const mTime = sVal.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?$/i);
          if (mTime) {
            let h = parseInt(mTime[1], 10);
            const m = mTime[2];
            const ampm = mTime[3];
            if (ampm) return `${String(h).padStart(2, '0')}:${m} ${ampm.toUpperCase()}`;
            const suff = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;
            return `${String(h).padStart(2, '0')}:${m} ${suff}`;
          }
          try {
            let d = null;
            if (sVal.includes('T') || sVal.includes('-')) {
              d = new Date(sVal);
            } else if (sVal.includes('/')) {
              const parts = sVal.split(' ');
              const dateParts = parts[0].split('/');
              const timeParts = parts[1] ? parts[1].split(':') : ['00', '00'];
              const yy = dateParts[2].length === 2 ? ('20' + dateParts[2]) : dateParts[2];
              const mm = parseInt(dateParts[1], 10) - 1;
              const dd = parseInt(dateParts[0], 10);
              const hh = parseInt(timeParts[0], 10);
              const min = parseInt(timeParts[1], 10);
              const ss = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
              d = new Date(yy, mm, dd, hh, min, ss);
            } else {
              d = new Date(sVal);
            }
            if (d && !isNaN(d.getTime())) {
              let hours = d.getHours();
              const minutes = String(d.getMinutes()).padStart(2, '0');
              const ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12;
              hours = hours ? hours : 12;
              return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
            }
          } catch (e) { }
          return sVal;
        };

        const esCliente = !!(window.SESION && window.SESION.cliente);
        const isAprobada = !!(bitData && (bitData.Acepta === 'Sí' || bitData.Acepta === 'si' || bitData.acepta === 'Sí' || bitData.acepta === 'si' || bitData.fecha_acepta || bitData.estado === 'aprobada')) || !!s.bitacora_aceptada || (s.estado_bitacora === 'aprobada');
        const isTodayOrPast = (s.fecha <= hoyISO);
        // Información mínima: estado de ánimo, sin síntomas, accidente, entrega buen estado
        const _mAnimo = (bitData && (bitData['Estado de ánimo'] || bitData.animo || bitData['Pregunta 13'] || bitData.p13)) || '';
        const _mSint = (bitData && (bitData['Sin síntomas'] || bitData.sin_sintomas || bitData['Pregunta 1'] || bitData.p1)) || '';
        const _mAcc = (bitData && (bitData['Accidente'] || bitData.accidente || bitData['Pregunta 17'] || bitData.p17)) || '';
        const _mEntrega = (bitData && (bitData['Entrega en buen estado'] || bitData.entrega_buen_estado || bitData['Pregunta 19'] || bitData.p19)) || '';
        const hasMinInfo = !!(_mAnimo && _mSint && _mAcc && _mEntrega);
        let statusClass, statusLabel, isApprovedIcon;
        if (esCliente) {
          if (isAprobada) {
            statusClass = 'approved';
            statusLabel = 'Aprobada';
            isApprovedIcon = true;
          } else if (hasMinInfo) {
            statusClass = 'pending-approval';
            statusLabel = 'Pendiente aprobación';
            isApprovedIcon = false;
          } else if (s.inicio_real && !s.fin_real) {
            statusClass = 'live';
            statusLabel = 'En curso';
            isApprovedIcon = false;
          } else {
            statusClass = 'live';
            statusLabel = 'Pendiente niñera';
            isApprovedIcon = false;
          }
        } else {
          if (isAprobada) {
            statusClass = 'approved';
            statusLabel = 'Aprobada';
            isApprovedIcon = true;
          } else if (hasMinInfo) {
            statusClass = 'completed';
            statusLabel = 'Completada';
            isApprovedIcon = true;
          } else if (s.fin_real || s.estado === 'completado' || s.estado === 'finalizado') {
            statusClass = 'pending';
            statusLabel = 'Finalizado';
            isApprovedIcon = false;
          } else if (s.inicio_real) {
            statusClass = 'live';
            statusLabel = 'En curso';
            isApprovedIcon = false;
          } else {
            statusClass = 'pending';
            statusLabel = 'Pendiente';
            isApprovedIcon = false;
          }
        }

        // Extracción robusta de Check-in y Check-out
        let _rawCheckin = (bitData && (bitData['Check-in'] || bitData.checkin || bitData['Pregunta 23'] || bitData.p23)) || '';
        if (!_rawCheckin && s.inicio_real) {
          _rawCheckin = formatHoraCorta(s.inicio_real);
        }
        if (!_rawCheckin && (s.hora_inicio_real || s.checkin)) {
          _rawCheckin = formatHoraCorta(s.hora_inicio_real || s.checkin);
        }

        let _rawCheckout = (bitData && (bitData['Check-out'] || bitData.checkout || bitData['Pregunta 24'] || bitData.p24)) || '';
        if (!_rawCheckout && s.fin_real) {
          _rawCheckout = formatHoraCorta(s.fin_real);
        }
        if (!_rawCheckout && (s.hora_fin_real || s.checkout)) {
          _rawCheckout = formatHoraCorta(s.hora_fin_real || s.checkout);
        }

        const tieneCheckin = !!_rawCheckin;
        const tieneCheckout = !!_rawCheckout;

        const valCheckin = _rawCheckin || ((isTodayOrPast || s.asistencia_confirmada || s.inicio_real) ? (s.hora_inicio || '—') : 'Por registrar');
        const valCheckout = _rawCheckout || ((isTodayOrPast || s.fin_real || s.estado === 'completado' || s.estado === 'finalizado') ? (s.hora_fin || '—') : 'Por registrar');
        // Estado de ánimo real del peque: p13 = Feliz/Triste/Enojado
        const _rawAnimo = (bitData && (bitData['Estado de ánimo'] || bitData.animo || bitData['Pregunta 13'] || bitData.p13)) || '';
        const valAnimo = _rawAnimo || (isTodayOrPast ? '—' : 'Pendiente');
        // Sin síntomas de enfermedad (p1: Sí/No) - con síntomas si aplica
        const _rawSintomas = (bitData && (bitData['Sin síntomas'] || bitData.sin_sintomas || bitData['Pregunta 1'] || bitData.p1)) || '';
        const _cualesSint = (bitData && (bitData.p1_cuales_display || bitData.p1_cuales || '')) || '';
        const valSintomas = _rawSintomas
          ? (_rawSintomas === 'Sí' ? 'Sí, sin síntomas' : (_cualesSint ? `No – ${_cualesSint}` : 'No'))
          : (isTodayOrPast ? '—' : 'Pendiente');
        // Accidente (p17: Sí/No)
        const _rawAcc = (bitData && (bitData['Accidente'] || bitData.accidente || bitData['Pregunta 17'] || bitData.p17)) || '';
        const valAccidente = _rawAcc ? _rawAcc : (isTodayOrPast ? '—' : 'Pendiente');
        // Entrega en buen estado físico (p19: Sí/No)
        const _rawEntrega = (bitData && (bitData['Entrega en buen estado'] || bitData.entrega_buen_estado || bitData['Pregunta 19'] || bitData.p19)) || '';
        const valEntregaFisico = _rawEntrega ? _rawEntrega : (isTodayOrPast ? '—' : 'Pendiente');

        const sTitle = s.tipo_servicio || s.servicio || 'Servicio de niñera';
        const sTime = s.hora_fin ? `${s.hora_inicio} – ${s.hora_fin}` : (s.hora_inicio || 'Horario por confirmar');

        return `
          <div class="cs-log-card" data-service-id="${s.id}">
            <div class="cs-log-card-header">
              <div class="cs-date-badge ${badgeColor}">
                <span class="cs-date-day">${dNom}</span>
                <span class="cs-date-num">${dNum}</span>
                <span class="cs-date-month">${mNom}</span>
              </div>
              <div class="cs-log-card-title-col">
                <h3 class="cs-log-card-title">${sTitle}</h3>
                <div class="cs-log-card-time">${sTime}</div>
              </div>
              ${statusLabel ? `<div class="cs-status-pill ${statusClass}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="${isApprovedIcon ? 'currentColor' : 'none'}" stroke="${isApprovedIcon ? 'none' : 'currentColor'}" stroke-width="2">
                  ${isApprovedIcon
              ? `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />`
              : `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`
            }
                </svg><span>${statusLabel}</span>
              </div>` : ''}
            </div>

            <div class="cs-log-grid">
              <div class="cs-log-col left">
                <div class="cs-log-item">
                  <svg class="cs-log-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span class="cs-log-item-label">Check-in</span>
                  <span class="cs-log-item-value ${_rawCheckin ? 'val-ok' : ''}">${valCheckin}</span>
                </div>
                <div class="cs-log-item">
                  <svg class="cs-log-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span class="cs-log-item-label">Check-out</span>
                  <span class="cs-log-item-value ${_rawCheckout ? 'val-ok' : ''}">${valCheckout}</span>
                </div>
                <div class="cs-log-item">
                  <svg class="cs-log-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                  <span class="cs-log-item-label">Estado de ánimo</span>
                  <span class="cs-log-item-value ${_rawAnimo ? 'val-ok' : ''}">${valAnimo}</span>
                </div>
              </div>

              <div class="cs-log-col right">
                <div class="cs-log-item">
                  <svg class="cs-log-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span class="cs-log-item-label">Sin síntomas</span>
                  <span class="cs-log-item-value ${_rawSintomas === 'Sí' ? 'val-ok' : (_rawSintomas === 'No' ? 'val-alert' : '')}">${valSintomas}</span>
                </div>
                <div class="cs-log-item">
                  <svg class="cs-log-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span class="cs-log-item-label">Accidente</span>
                  <span class="cs-log-item-value ${_rawAcc === 'No' ? 'val-ok' : (_rawAcc === 'Sí' ? 'val-alert' : '')}">${valAccidente}</span>
                </div>
                <div class="cs-log-item">
                  <svg class="cs-log-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span class="cs-log-item-label">Buen estado físico</span>
                  <span class="cs-log-item-value ${_rawEntrega === 'Sí' ? 'val-ok' : (_rawEntrega === 'No' ? 'val-alert' : '')}">${valEntregaFisico}</span>
                </div>
              </div>
            </div>

            <button type="button" class="cs-log-footer-btn" onclick="ClienteServicios.abrirBitacoraParaServicio('${s.id}')">
              <span>Ver bitácora completa</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        `;
      }).join('');
    },

    /**
     * Abre el modal de detalle del servicio (modal para la familia/cliente o staff/nanny según el rol)
     */
    abrirModalDetalle: function (servicioId) {
      const s = (this._servicios || []).find(item => item.id === servicioId);
      if (!s) {
        console.log('Detalle de servicio no encontrado:', servicioId);
        return;
      }
      const esCliente = !!(window.SESION && window.SESION.cliente);
      if (esCliente && typeof window.mostrarDetalleServicioCliente === 'function') {
        window.mostrarDetalleServicioCliente(s);
      } else if (typeof window.mostrarDetalleServicioCliente === 'function' && typeof window.abrirModalServicio !== 'function') {
        window.mostrarDetalleServicioCliente(s);
      } else if (typeof window.abrirModalServicio === 'function') {
        window.abrirModalServicio(s);
      } else if (typeof window.mostrarDetalleServicioCliente === 'function') {
        window.mostrarDetalleServicioCliente(s);
      } else {
        console.log('Detalle de servicio:', servicioId, s);
      }
    },

    /**
     * Abre la bitácora específica de un servicio concreto
     */
    abrirBitacoraParaServicio: function (servicioId) {
      const s = (this._servicios || []).find(item => item.id === servicioId);
      if (s && typeof window.abrirBitacora === 'function') {
        const esCliente = !!(window.SESION && window.SESION.cliente);
        window.abrirBitacora(s, esCliente);
      } else {
        this.abrirBitacoraCompleta();
      }
    },

    /**
     * Abre la bitácora completa del primer servicio relevante de la vista actual
     */
    abrirBitacoraCompleta: function () {
      const svcsActuales = this._getServiciosActuales();
      const s = svcsActuales.find(item => item.bitacora || item.estado === 'completado') || svcsActuales[0] || (this._servicios || [])[0];
      if (s && typeof window.abrirBitacora === 'function') {
        const esCliente = !!(window.SESION && window.SESION.cliente);
        window.abrirBitacora(s, esCliente);
      } else if (typeof window.irVista === 'function') {
        window.irVista('cliente');
      }
    },

    calcularHoras: function (ini, fin) {
      if (!ini || !fin) return 0;
      function parseMin(s) {
        if (!s) return 0;
        const clean = s.trim().toUpperCase();
        const isPM = clean.includes('PM');
        const isAM = clean.includes('AM');
        const match = clean.match(/(\d+):(\d+)/);
        if (!match) return 0;
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        return h * 60 + m;
      }
      const m1 = parseMin(ini);
      const m2 = parseMin(fin);
      if (m2 <= m1) return 0;
      return (m2 - m1) / 60;
    },

    /**
     * Renderiza la acción del encabezado de "Mis servicios"
     * Para niñera: botón "Confirmo asistencia" si hay servicios pendientes, o badge de confirmada
     * Para cliente: enlace "Ver todos" si hay filtro de día activo
     */
    renderSectionAction: function () {
      const container = document.getElementById('csSectionActionContainer');
      if (!container) return;

      const esCliente = !!(window.SESION && window.SESION.cliente) || document.body.classList.contains('cliente');
      const esAdmin = !!(window.SESION && (window.SESION.admin || window.SESION.supervision || window.SESION.rh)) ||
        document.body.classList.contains('admin') ||
        document.body.classList.contains('supervision') ||
        document.body.classList.contains('rh');

      // Si es Cliente o Admin/Supervisión, NO mostrar botón de confirmación de asistencia
      if (esCliente || esAdmin) {
        if (this._filtroFecha) {
          container.innerHTML = `
            <a class="cs-section-link" href="javascript:void(0)" onclick="ClienteServicios.limpiarFiltro()">
              <span>Ver todos</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          `;
        } else {
          container.innerHTML = '';
        }
        return;
      }

      // Perfil Niñera
      if (this._filtroFecha) {
        container.innerHTML = `
          <a class="cs-section-link" href="javascript:void(0)" onclick="ClienteServicios.limpiarFiltro()">
            <span>Ver semana completa</span>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        `;
        return;
      }

      const svcsSemana = this._getServiciosSemanaActiva();
      if (svcsSemana.length === 0) {
        container.innerHTML = '';
        return;
      }

      const pendientes = svcsSemana.filter(s => !(s.asistencia_confirmada || s.estado === 'Confirmado'));

      if (pendientes.length > 0) {
        container.innerHTML = `
          <button type="button" class="cs-btn-asistencia" onclick="ClienteServicios.abrirModalConfirmarAsistencia()" title="Confirmar asistencia a los servicios de esta semana">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Confirmo asistencia</span>
          </button>
        `;
      } else {
        container.innerHTML = `
          <div class="cs-asistencia-confirmada-badge" title="Has confirmado asistencia a los servicios de esta semana">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Asistencia confirmada</span>
          </div>
        `;
      }
    },

    /**
     * Abre el modal para confirmar asistencia a los servicios de la semana activa (exclusivo para niñera)
     */
    abrirModalConfirmarAsistencia: function () {
      const esCliente = !!(window.SESION && window.SESION.cliente) || document.body.classList.contains('cliente');
      const esAdmin = !!(window.SESION && (window.SESION.admin || window.SESION.supervision || window.SESION.rh)) ||
        document.body.classList.contains('admin') ||
        document.body.classList.contains('supervision') ||
        document.body.classList.contains('rh');
      if (esCliente || esAdmin) return; // Exclusivo para niñera

      const svcsSemana = this._getServiciosSemanaActiva();
      const pendientes = svcsSemana.filter(s => !(s.asistencia_confirmada || s.estado === 'Confirmado'));
      const cant = pendientes.length > 0 ? pendientes.length : svcsSemana.length;

      const semData = (this._semanasLabels && this._semanasLabels[this._semanaActivaIndex]) || {};
      const title = semData.title || 'Esta semana';
      const dates = semData.dates ? ` (${semData.dates})` : '';

      const elMsg = document.getElementById('csConfirmModalMsg');
      if (elMsg) {
        elMsg.innerHTML = `¿Estás segura de confirmar tu asistencia a los <strong>${cant} ${cant === 1 ? 'servicio programado' : 'servicios programados'}</strong> para esta semana?`;
      }

      const elWeekChip = document.getElementById('csConfirmModalWeekChip');
      if (elWeekChip) {
        elWeekChip.innerHTML = `<span>📅 ${title}${dates}</span>`;
      }

      const modal = document.getElementById('csModalConfirmarAsistencia');
      if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
      }
    },

    cerrarModalConfirmacion: function () {
      const modal = document.getElementById('csModalConfirmarAsistencia');
      if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
      }
      const btn = document.getElementById('csBtnEjecutarConfirmacion');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Sí, confirmo asistencia</span>`;
      }
    },

    /**
     * Ejecuta la confirmación de asistencia en Supabase y actualiza la vista localmente
     */
    ejecutarConfirmacionAsistencia: async function () {
      const btn = document.getElementById('csBtnEjecutarConfirmacion');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Confirmando asistencia...</span>`;
      }

      const svcsSemana = this._getServiciosSemanaActiva();
      if (!svcsSemana || svcsSemana.length === 0) {
        this.cerrarModalConfirmacion();
        return;
      }

      const timestampISO = new Date().toISOString();
      const nannyNombre = (window.SESION?.nombre || '').trim() || 'Niñera';
      const nannyEmail = (window.SESION?.email || '').trim().toLowerCase();
      const userAgent = (navigator && navigator.userAgent) || '';

      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

      // 1. Agrupar servicios por row_id para actualizar control_servicios
      const rowMap = {};
      const auditRecords = [];

      svcsSemana.forEach(s => {
        const rId = s.row_id || (s.id ? s.id.split('_')[0] : '');
        if (!rId) return;

        if (!rowMap[rId]) {
          rowMap[rId] = {
            row_id: rId,
            semana_iso: s.semana_iso,
            servicios: []
          };
        }

        const hTxt = s.Horario || (s.hora_fin ? `${s.hora_inicio} - ${s.hora_fin}` : s.hora_inicio || '');
        rowMap[rId].servicios.push({
          servicio_id: s.id,
          fecha: s.fecha,
          dia_clave: s.dia_clave,
          horario: hTxt,
          tipo: s.tipo_servicio,
          cliente: s.cliente
        });

        auditRecords.push({
          servicio_id: s.id,
          row_id: rId,
          semana_iso: s.semana_iso || '',
          fecha: s.fecha || timestampISO.slice(0, 10),
          dia_clave: s.dia_clave || '',
          horario: hTxt,
          nanny_nombre: nannyNombre,
          nanny_email: nannyEmail,
          cliente_nombre: s.cliente || '',
          tipo_servicio: s.tipo_servicio || '',
          confirmado_en: timestampISO,
          user_agent: userAgent,
          detalles: {
            confirmado_por: nannyNombre,
            fecha_local: new Date().toLocaleString()
          }
        });
      });

      // 2. Intentar registrar en tabla confirmaciones_asistencia (auditoría / evidencia legal)
      if (client && auditRecords.length > 0) {
        try {
          const { error: errAudit } = await client.from('confirmaciones_asistencia').insert(auditRecords);
          if (!errAudit) {
            console.log("✅ [Evidencia] Asistencia registrada exitosamente en confirmaciones_asistencia");
          } else {
            console.warn("ℹ️ confirmaciones_asistencia insert:", errAudit.message);
          }
        } catch (eAudit) {
          console.warn("ℹ️ Error al registrar en confirmaciones_asistencia:", eAudit);
        }
      }

      let latestEvidencePayload = null;

      // 3. Actualizar cada fila en control_servicios fusionando con confirmaciones previas (sin sobreescribir)
      for (const rId of Object.keys(rowMap)) {
        const infoRow = rowMap[rId];
        const sExistente = (this._servicios || []).find(x => x.row_id === rId);

        // Extraer evidencia previa si existe
        let prevEvidence = null;
        if (sExistente && sExistente.asistencia_evidencia) {
          prevEvidence = sExistente.asistencia_evidencia;
        } else if (sExistente && sExistente.observaciones) {
          const m = sExistente.observaciones.match(/<!--asistencia_nanny:(.*?)-->/);
          if (m && m[1]) {
            try { prevEvidence = JSON.parse(m[1]); } catch (e) { }
          }
        }

        // Mapa de días confirmados acumulado (preserva confirmaciones pasadas)
        const diasConfirmadosMap = {};
        const historial = [];

        if (prevEvidence) {
          const normPrev = typeof normalizarTexto === 'function' ? normalizarTexto(prevEvidence.nanny_nombre || '') : (prevEvidence.nanny_nombre || '').toLowerCase();
          const normCur = typeof normalizarTexto === 'function' ? normalizarTexto(nannyNombre || '') : (nannyNombre || '').toLowerCase();
          const esMismaNanny = !normPrev || normPrev === normCur || normPrev.includes(normCur.split(' ')[0]) || normCur.includes(normPrev.split(' ')[0]);

          if (esMismaNanny) {
            if (prevEvidence.dias_confirmados && typeof prevEvidence.dias_confirmados === 'object') {
              Object.assign(diasConfirmadosMap, prevEvidence.dias_confirmados);
            } else if (Array.isArray(prevEvidence.dias)) {
              prevEvidence.dias.forEach(d => {
                diasConfirmadosMap[d] = {
                  dia_clave: d,
                  confirmado_en: prevEvidence.confirmado_en || timestampISO,
                  nanny_nombre: prevEvidence.nanny_nombre || nannyNombre
                };
              });
            }
          }
          if (Array.isArray(prevEvidence.historial_confirmaciones)) {
            historial.push(...prevEvidence.historial_confirmaciones);
          } else if (prevEvidence.confirmado_en) {
            historial.push({
              confirmado_en: prevEvidence.confirmado_en,
              dias: Object.keys(diasConfirmadosMap),
              nanny_nombre: prevEvidence.nanny_nombre || nannyNombre
            });
          }
        }

        // Incorporar los nuevos días confirmados en esta acción
        const nuevosDiasConfirmados = [];
        infoRow.servicios.forEach(svc => {
          if (!diasConfirmadosMap[svc.dia_clave]) {
            diasConfirmadosMap[svc.dia_clave] = {
              servicio_id: svc.servicio_id,
              fecha: svc.fecha,
              dia_clave: svc.dia_clave,
              horario: svc.horario,
              tipo_servicio: svc.tipo,
              cliente: svc.cliente,
              nanny_nombre: nannyNombre,
              nanny_email: nannyEmail,
              confirmado_en: timestampISO,
              user_agent: userAgent
            };
            nuevosDiasConfirmados.push(svc.dia_clave);
          }
        });

        // Registrar entrada inmutable en historial
        historial.push({
          confirmado_en: timestampISO,
          dias_confirmados: nuevosDiasConfirmados,
          nanny_nombre: nannyNombre,
          nanny_email: nannyEmail,
          user_agent: userAgent
        });

        // Determinar si TODOS los días actualmente programados en este servicio están confirmados
        const diasSemana = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
        const diasProgramados = diasSemana.filter(d => {
          return svcsSemana.some(x => x.row_id === rId && x.dia_clave === d);
        });
        const todosConfirmados = diasProgramados.length > 0 && diasProgramados.every(d => !!diasConfirmadosMap[d]);

        const evidencePayload = {
          confirmada: todosConfirmados,
          nanny_nombre: nannyNombre,
          nanny_email: nannyEmail,
          dias: Object.keys(diasConfirmadosMap),
          dias_confirmados: diasConfirmadosMap,
          historial_confirmaciones: historial,
          ultima_actualizacion: timestampISO
        };
        latestEvidencePayload = evidencePayload;
        const tag = `<!--asistencia_nanny:${JSON.stringify(evidencePayload)}-->`;

        // Preservar observaciones previas si existen
        let obsBase = (sExistente && sExistente.observaciones) || '';
        obsBase = obsBase.replace(/<!--asistencia_nanny:.*?-->/g, '').trim();
        const nuevaObs = `${tag} ${obsBase}`.trim();

        if (client) {
          try {
            // Actualizar observaciones en control_servicios (y columna asistencia_nanny si existe)
            const updatePayload = {
              observaciones: nuevaObs,
              asistencia_nanny: evidencePayload,
              actualizado_en: timestampISO
            };
            const semIsoVal = sExistente?.semana_iso || (svcsSemana[0]?.semana_iso);
            if (semIsoVal) {
              updatePayload.semana_iso = semIsoVal;
            }

            let { error: errUpd } = await client
              .from('control_servicios')
              .update(updatePayload)
              .eq('id', rId);

            // Si la columna asistencia_nanny no existe aún en la tabla, reintentar solo con observaciones
            if (errUpd && errUpd.message && errUpd.message.includes('asistencia_nanny')) {
              delete updatePayload.asistencia_nanny;
              const { error: errRetry } = await client
                .from('control_servicios')
                .update(updatePayload)
                .eq('id', rId);
              if (errRetry) console.warn("Error en reintento update control_servicios:", errRetry.message);
            }
          } catch (eUpd) {
            console.warn("Excepción al actualizar control_servicios:", eUpd);
          }
        }
      }

      // 3.5. Emitir sincronización en vivo inmediata hacia el panel admin (sin requerir recargar página)
      try {
        const payloadSync = {
          row_ids: Object.keys(rowMap),
          nanny_nombre: nannyNombre,
          semana_iso: svcsSemana[0]?.semana_iso || '',
          evidence: latestEvidencePayload || { confirmada: true, nanny_nombre: nannyNombre },
          timestamp: Date.now()
        };

        // A. BroadcastChannel nativo de navegador (cero latencia entre pestañas/ventanas del mismo navegador)
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('nyp_asistencia_channel');
            bc.postMessage(payloadSync);
            setTimeout(() => { bc.close(); }, 1000);
          }
        } catch (eBc) { }

        // B. Sincronización multi-pestaña local via storage event
        try {
          localStorage.setItem('nyp_evento_asistencia_confirmada', JSON.stringify(payloadSync));
        } catch (eStorage) { }

        // C. Broadcast Supabase Realtime hacia el panel de administración
        if (client) {
          const ch = client.channel('rt_control_servicios_matriz');
          const doBroadcast = () => {
            ch.send({
              type: 'broadcast',
              event: 'asistencia_nanny_confirmada',
              payload: payloadSync
            }).then(() => {
              console.log("⚡ [Broadcast Asistencia] Notificación enviada con éxito a la matriz de servicios");
            }).catch((err) => {
              console.warn("ℹ️ Error enviando broadcast de asistencia:", err);
            });
          };

          if (ch.state === 'joined' || ch.status === 'SUBSCRIBED') {
            doBroadcast();
          } else {
            ch.subscribe((st) => {
              if (st === 'SUBSCRIBED') {
                doBroadcast();
              }
            });
          }
        }
      } catch (eBc) {
        console.warn("ℹ️ Error emitiendo sincronización en vivo:", eBc);
      }

      // 4. Actualizar estado en memoria local inmediatamente
      svcsSemana.forEach(s => {
        const rId = s.row_id || (s.id ? s.id.split('_')[0] : '');
        s.asistencia_confirmada = true;
        s.estado = 'Confirmado';
        s.confirmado_en = timestampISO;
      });

      if (window.CACHE_NINERA) {
        window.CACHE_NINERA.servicios = this._servicios;
      }
      if (window.CAL_SERVICIOS) {
        window.CAL_SERVICIOS = this._servicios;
      }

      // 5. Cerrar modal y re-renderizar interfaz inmediatamente
      this.cerrarModalConfirmacion();
      this.renderCalendarStrip();
      this.renderServiciosList();
      this.renderBitacora();

      if (window.NannyInicio && typeof window.NannyInicio.cargarServicios === 'function') {
        window.NannyInicio.cargarServicios(true);
      }

      // Mostrar notificación
      if (typeof window.mostrarNotificacion === 'function') {
        window.mostrarNotificacion('¡Asistencia confirmada exitosamente!', 'success');
      } else {
        console.log('✅ Asistencia confirmada exitosamente');
      }
    }
  };

  window.ClienteServicios = ClienteServicios;

  // Auto-inicializar inmediatamente si el DOM está disponible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ClienteServicios.init());
  } else {
    ClienteServicios.init();
  }
})();
