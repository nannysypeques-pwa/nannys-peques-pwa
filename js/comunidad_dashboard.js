/**
 * ============================================================================
 * MÓDULO COMUNIDAD (DASHBOARD DE APRENDIZAJE, CAPACITACIONES Y BENEFICIOS)
 * Nannys y Peques - Conexión Integral con Artículos y Capacitaciones Reales
 * ============================================================================
 */

(function () {
  'use strict';

  const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const MESES_CAP = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const ComunidadDashboard = {
    categoriaActiva: 'Todas',
    busqueda: '',
    articulosPorPagina: 12,
    paginaActual: 1,
    lastScrollPos: 0,

    // Estado de capacitaciones
    capacitaciones: [],
    inscripciones: [],
    tabCatalogoActivo: 'todas',
    currentCapacitacionId: null,
    unsubscribeCaps: null,
    unsubscribeInsc: null,

    init: function () {
      console.log('✨ [ComunidadDashboard] Inicializando dashboard de Comunidad con artículos y capacitaciones reales');

      // Personalizar subtítulo según el rol (Familia vs Niñera)
      this.actualizarEncabezadoRol();

      // Garantizar que los estilos del visor estén inyectados
      if (window.Comunidad && typeof window.Comunidad.inyectarEstilos === 'function') {
        try {
          window.Comunidad.inyectarEstilos();
        } catch (e) {
          console.warn('Inyección de estilos de lectura:', e);
        }
      }

      this.renderCategorias();
      this.renderArticulos();

      // Inicializar conexión en tiempo real con Capacitaciones
      this.iniciarListenersCapacitaciones();
    },

    /**
     * Obtiene los datos del usuario actual
     */
    getUsuarioActual: function () {
      const sesion = window.SESION || {};
      const email = (sesion.email || sesion.correo || '').trim().toLowerCase();
      const esCliente = !!sesion.cliente;
      let nombre = sesion.nombre || sesion.nombre_completo || sesion.name || '';

      const esCiudadValida = (v) => {
        if (!v || typeof v !== 'string') return false;
        const t = v.trim();
        if (!t || t === '—' || t === '-' || t === 'null' || t === 'undefined') return false;
        if (t.startsWith('http://') || t.startsWith('https://') || t.includes('maps') || t.includes('.gl/') || t.includes('/')) return false;
        return true;
      };

      let ciudad = '';
      if (esCiudadValida(sesion.ciudad)) {
        ciudad = sesion.ciudad;
      }

      if (!ciudad || !nombre) {
        if (esCliente && window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) {
          const cp = window.CACHE_CLIENTE.profile;
          if (!nombre) nombre = cp.nombre || cp.nombre_completo || '';
          if (!ciudad && esCiudadValida(cp.ciudad)) ciudad = cp.ciudad;
        } else if (!esCliente && window.CACHE_NANNY && window.CACHE_NANNY.profile) {
          const np = window.CACHE_NANNY.profile;
          if (!nombre) nombre = np.nombre || np.nombre_completo || '';
          if (!ciudad && esCiudadValida(np.ciudad)) ciudad = np.ciudad;
        }
      }

      // Buscar en caches de control de servicios si aún no hay ciudad
      if (!ciudad) {
        if (esCliente) {
          const cacheC = window._cacheClientesCS || (typeof _cacheClientesCS !== 'undefined' ? _cacheClientesCS : []);
          if (Array.isArray(cacheC) && cacheC.length > 0) {
            const foundC = cacheC.find(c => (c.email && c.email.toLowerCase().trim() === email) || (nombre && c.nombre && c.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()));
            if (foundC && esCiudadValida(foundC.ciudad)) ciudad = foundC.ciudad;
          }
        } else {
          const cacheN = window._cacheNannysCS || (typeof _cacheNannysCS !== 'undefined' ? _cacheNannysCS : []);
          if (Array.isArray(cacheN) && cacheN.length > 0) {
            const foundN = cacheN.find(n => (n.email && n.email.toLowerCase().trim() === email) || (nombre && n.nombre && n.nombre.toLowerCase().trim() === nombre.toLowerCase().trim()));
            if (foundN && esCiudadValida(foundN.ciudad)) ciudad = foundN.ciudad;
          }
        }
      }

      if (!nombre) {
        nombre = esCliente ? 'Familia Cliente' : 'Niñera';
      }

      return {
        email,
        nombre,
        esCliente,
        rol: esCliente ? 'Cliente' : 'Niñera',
        ciudad: esCiudadValida(ciudad) ? ciudad : '—'
      };
    },

    /**
     * Inicia los listeners en tiempo real de Firestore para capacitaciones e inscripciones
     */
    iniciarListenersCapacitaciones: async function () {
      try {
        const { db, asegurarAutenticacionFirebase } = await import('./firebase-config.js');
        if (typeof asegurarAutenticacionFirebase === 'function') {
          await asegurarAutenticacionFirebase(null, window.SESION?.email);
        }
        const { collection, query, orderBy, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        if (this.unsubscribeCaps) this.unsubscribeCaps();
        if (this.unsubscribeInsc) this.unsubscribeInsc();

        // 1. Escuchar capacitaciones
        const qCaps = query(collection(db, 'capacitaciones'), orderBy('fecha', 'asc'));
        this.unsubscribeCaps = onSnapshot(qCaps, (snapshot) => {
          const caps = [];
          snapshot.forEach(doc => {
            caps.push({ id: doc.id, ...doc.data() });
          });
          this.capacitaciones = caps;
          this.renderCapacitacionesHero();
          if (this.currentCapacitacionId) {
            this.renderDetalleCapacitacionModal(this.currentCapacitacionId);
          }
          this.renderListaCatalogo();
        }, (err) => {
          console.warn('Error al escuchar capacitaciones en tiempo real:', err);
        });

        // 2. Escuchar inscripciones
        const qInsc = collection(db, 'inscripciones_capacitaciones');
        this.unsubscribeInsc = onSnapshot(qInsc, (snapshot) => {
          const insc = [];
          snapshot.forEach(doc => {
            insc.push({ id: doc.id, ...doc.data() });
          });
          this.inscripciones = insc;
          this.renderCapacitacionesHero();
          if (this.currentCapacitacionId) {
            this.renderDetalleCapacitacionModal(this.currentCapacitacionId);
          }
          this.renderListaCatalogo();
        }, (err) => {
          console.warn('Error al escuchar inscripciones:', err);
        });
      } catch (err) {
        console.warn('No se pudo conectar a Firebase Firestore para capacitaciones:', err);
      }
    },

    /**
     * Formatea fecha YYYY-MM-DD a texto amigable "12 de septiembre" o "12 de septiembre de 2026"
     */
    formatearFecha: function (fechaISO, incluirAnio = false) {
      if (!fechaISO) return 'Fecha por confirmar';
      const partes = fechaISO.split('-');
      if (partes.length < 3) return fechaISO;
      const dia = parseInt(partes[2], 10);
      const mesIndex = parseInt(partes[1], 10) - 1;
      const anio = partes[0];
      const mesNombre = MESES[mesIndex] || '';

      if (incluirAnio) {
        return `${dia} de ${mesNombre} de ${anio}`;
      }
      return `${dia} de ${mesNombre}`;
    },

    /**
     * Obtiene la inscripción del usuario actual para una capacitación dada
     */
    getInscripcionUsuario: function (capacitacionId) {
      const user = this.getUsuarioActual();
      if (!user.email) return null;
      return this.inscripciones.find(ins =>
        ins.capacitacionId === capacitacionId &&
        (ins.nannyEmail || '').toLowerCase() === user.email
      );
    },

    /**
     * Renderiza el Hero y tarjetas de capacitaciones del mes actual
     */
    renderCapacitacionesHero: function () {
      const titleEl = document.getElementById('cd-hero-capacitaciones-title');
      const container = document.getElementById('cd-capacitaciones-container');
      if (!container) return;

      const hoy = new Date();
      const mesActual = hoy.getMonth(); // 0 - 11
      const anioActual = hoy.getFullYear();
      const mesNombre = MESES[mesActual];
      const prefijoMes = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}`;

      if (titleEl) {
        titleEl.innerHTML = `Capacitaciones<br>de ${mesNombre}`;
      }

      // Filtrar capacitaciones del mes actual
      const capsDelMes = this.capacitaciones.filter(c => (c.fecha || '').startsWith(prefijoMes));

      if (capsDelMes.length === 0) {
        // Si no hay del mes actual, buscar las próximas disponibles
        const hoyISO = hoy.toISOString().split('T')[0];
        const proximas = this.capacitaciones.filter(c => (c.fecha || '') >= hoyISO);

        if (proximas.length > 0) {
          container.innerHTML = proximas.slice(0, 2).map(c => this.crearCardCapacitacionHTML(c)).join('');
        } else if (this.capacitaciones.length > 0) {
          container.innerHTML = this.capacitaciones.slice(0, 2).map(c => this.crearCardCapacitacionHTML(c)).join('');
        } else {
          container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; background: #FFFFFF; border-radius: 20px; border: 1px dashed #CBD5E1; color: #64748B;">
              <span style="font-size: 28px; display: block; margin-bottom: 6px;">📅</span>
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #0F172A; font-size: 14px;">Próximas capacitaciones en preparación</p>
              <p style="margin: 0; font-size: 12.5px;">Consulta periódicamente para descubrir los nuevos talleres y certificaciones disponibles.</p>
            </div>
          `;
        }
        return;
      }

      // Renderizar tarjetas del mes (hasta 4 en grid)
      container.innerHTML = capsDelMes.slice(0, 4).map(c => this.crearCardCapacitacionHTML(c)).join('');
    },

    /**
     * Retorna la información visual y texto de la pastilla de modalidad
     */
    getModalidadBadgeInfo: function (cap) {
      const mod = (cap.modalidad || 'En línea').trim();
      const ciudad = (cap.ciudad || '').trim();

      if (mod.toLowerCase().includes('presencial')) {
        return {
          texto: ciudad ? `Presencial &bull; ${ciudad}` : 'Presencial',
          textoCorto: ciudad ? `Presencial (${ciudad})` : 'Presencial',
          clase: 'presencial',
          icono: '📍'
        };
      }
      if (mod.toLowerCase().includes('hibrida') || mod.toLowerCase().includes('híbrida')) {
        return {
          texto: ciudad ? `Híbrida &bull; ${ciudad}` : 'Híbrida',
          textoCorto: ciudad ? `Híbrida (${ciudad})` : 'Híbrida',
          clase: 'hibrida',
          icono: '🔄'
        };
      }
      if (mod.toLowerCase().includes('grabada')) {
        return {
          texto: 'Grabada',
          textoCorto: 'Grabada',
          clase: 'recorded',
          icono: '▶️'
        };
      }
      return {
        texto: 'En línea',
        textoCorto: 'En línea',
        clase: 'live',
        icono: '💻'
      };
    },

    /**
     * Genera el HTML de una tarjeta de capacitación
     */
    crearCardCapacitacionHTML: function (cap) {
      const insc = this.getInscripcionUsuario(cap.id);
      const estaInscrita = !!insc;
      const asistio = insc && insc.asistio === true;
      const ameritaConstancia = insc && insc.amerita_constancia === true && !!cap.constancia_base;
      const imgUrl = cap.imagen || 'assets/img/comunidad/curso_primeros_auxilios.jpg';
      const fechaTexto = this.formatearFecha(cap.fecha);
      const horarioTexto = cap.horario || 'Horario por confirmar';
      const badgeInfo = this.getModalidadBadgeInfo(cap);

      // Botón de acción directo según el estado de la usuaria
      let actionBtnHTML = '';
      if (!estaInscrita) {
        actionBtnHTML = `
          <button type="button" class="cd-session-btn-action enroll" onclick="event.stopPropagation(); ComunidadDashboard.inscribirseCapacitacion('${cap.id}')">
            <span>Inscribirme</span>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        `;
      } else if (ameritaConstancia) {
        actionBtnHTML = `
          <button type="button" class="cd-session-btn-action diploma" onclick="event.stopPropagation(); ComunidadDashboard.descargarDiploma('${cap.id}')">
            <span>🎓 Descargar Diploma</span>
          </button>
        `;
      } else if (!asistio) {
        actionBtnHTML = `
          <button type="button" class="cd-session-btn-action checkin" onclick="event.stopPropagation(); ComunidadDashboard.hacerCheckIn('${cap.id}')">
            <span>Pase de lista ✅</span>
          </button>
        `;
      } else {
        actionBtnHTML = `
          <button type="button" class="cd-session-btn-action checkin" style="background: #10B981;" onclick="event.stopPropagation(); ComunidadDashboard.abrirDetalleCapacitacion('${cap.id}')">
            <span>✓ Asistencia Registrada</span>
          </button>
        `;
      }

      return `
        <div class="cd-session-card" onclick="ComunidadDashboard.abrirDetalleCapacitacion('${cap.id}')" style="cursor: pointer;">
          <div class="cd-session-thumb-box">
            <img src="${imgUrl}" alt="${this.escapeHtml(cap.titulo)}" class="cd-session-thumb" onerror="this.src='assets/img/comunidad/curso_primeros_auxilios.jpg'">
            <span class="cd-session-tag ${badgeInfo.clase}">${badgeInfo.textoCorto}</span>
            ${estaInscrita ? `
              <span style="position: absolute; bottom: 8px; left: 8px; background: #10B981; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                ✓ Inscrita
              </span>
            ` : ''}
          </div>
          <div class="cd-session-body" style="display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
            <div>
              <h4 class="cd-session-title">${this.escapeHtml(cap.titulo)}</h4>
              <div class="cd-session-meta-row">
                <div class="cd-session-meta-item">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>${fechaTexto}</span>
                </div>
                <div class="cd-session-meta-item">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>${horarioTexto}</span>
                </div>
              </div>
              ${cap.ciudad ? `
                <div style="margin-top: 5px; font-size: 11px; font-weight: 700; color: #059669; display: flex; align-items: center; gap: 4px;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>Sede ${this.escapeHtml(cap.ciudad)}</span>
                </div>
              ` : ''}
            </div>

            <div class="cd-session-actions-wrap">
              ${actionBtnHTML}
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Abre el modal de detalle para una capacitación
     */
    abrirDetalleCapacitacion: function (id) {
      this.currentCapacitacionId = id;
      this.renderDetalleCapacitacionModal(id);
      const modal = document.getElementById('cd-modal-capacitacion-detalle');
      if (modal) {
        modal.style.display = 'flex';
      }
    },

    /**
     * Compatibilidad con llamadas antiguas que pasan el nombre
     */
    abrirCapacitacion: function (nombreOId) {
      // Buscar primero por ID exacto
      const capPorId = this.capacitaciones.find(c => c.id === nombreOId);
      if (capPorId) {
        this.abrirDetalleCapacitacion(capPorId.id);
        return;
      }
      // Buscar por coincidencia en título
      const capPorNombre = this.capacitaciones.find(c => (c.titulo || '').toLowerCase().includes((nombreOId || '').toLowerCase()));
      if (capPorNombre) {
        this.abrirDetalleCapacitacion(capPorNombre.id);
        return;
      }

      // Si no existe como capacitación programada, buscar si hay artículo relacionado
      let artId = null;
      if (typeof nombreOId === 'string') {
        if (nombreOId.includes('auxilios')) artId = 65;
        if (nombreOId.includes('Límites') || nombreOId.includes('limites')) artId = 54;
      }
      if (artId) {
        this.abrirArticulo(artId);
      } else {
        this.verCatalogo();
      }
    },

    cerrarModalDetalle: function () {
      const modal = document.getElementById('cd-modal-capacitacion-detalle');
      if (modal) {
        modal.style.display = 'none';
      }
      this.currentCapacitacionId = null;
    },

    /**
     * Renderiza el contenido interno del modal de detalle de capacitación
     */
    renderDetalleCapacitacionModal: function (id) {
      const bodyEl = document.getElementById('cd-detalle-capacitacion-body');
      if (!bodyEl) return;

      const cap = this.capacitaciones.find(c => c.id === id);
      if (!cap) {
        bodyEl.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <p>Capacitación no encontrada.</p>
            <button class="cd-btn-pill" onclick="ComunidadDashboard.cerrarModalDetalle()">Cerrar</button>
          </div>
        `;
        return;
      }

      const insc = this.getInscripcionUsuario(id);
      const estaInscrita = !!insc;
      const asistio = insc && insc.asistio === true;
      const ameritaConstancia = insc && insc.amerita_constancia === true && !!cap.constancia_base;
      const imgUrl = cap.imagen || 'assets/img/comunidad/hero_capacitaciones.jpg';
      const fechaTexto = this.formatearFecha(cap.fecha, true);
      const horarioTexto = cap.horario || 'Horario flexible';
      const badgeInfo = this.getModalidadBadgeInfo(cap);

      bodyEl.innerHTML = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
          <!-- Imagen de Cabecera -->
          <div style="position: relative; border-radius: 18px; overflow: hidden; height: 170px; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
            <img src="${imgUrl}" alt="${this.escapeHtml(cap.titulo)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/img/comunidad/hero_capacitaciones.jpg'">
            <span class="cd-session-tag ${badgeInfo.clase}" style="position: absolute; top: 12px; left: 12px;">${badgeInfo.texto}</span>
          </div>

          <!-- Título y Estado -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
            <h2 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 22px; color: #0F172A; margin: 0; line-height: 1.25;">
              ${this.escapeHtml(cap.titulo)}
            </h2>
            ${estaInscrita ? `
              <span class="cd-status-badge ${ameritaConstancia ? 'diploma' : asistio ? 'attended' : 'enrolled'}" style="flex-shrink: 0;">
                ${ameritaConstancia ? '🎓 Certificada' : asistio ? '✅ Asistencia' : '✓ Inscrita'}
              </span>
            ` : ''}
          </div>

          <!-- Metadatos (Píldoras) -->
          <div class="cd-info-pill-row">
            <div class="cd-info-pill">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${fechaTexto}</span>
            </div>
            <div class="cd-info-pill">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${horarioTexto}</span>
            </div>
            ${cap.ciudad ? `
              <div class="cd-info-pill" style="color: #059669; background: #ECFDF5; border-color: #A7F3D0;">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Sede ${this.escapeHtml(cap.ciudad)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Descripción -->
          <div style="margin: 14px 0; font-size: 13.5px; line-height: 1.6; color: #475569; background: #F8FAFC; padding: 14px 16px; border-radius: 14px; border: 1px solid #E2E8F0;">
            <p style="margin: 0;">${this.escapeHtml(cap.descripcion || 'Sesión integral enfocada en mejores prácticas pedagógicas, de cuidado infantil y estimulación temprana.')}</p>
          </div>

          <!-- Enlace de sesión si existe -->
          ${cap.enlace_sesion || cap.enlace ? `
            <div style="margin: 12px 0;">
              <a href="${cap.enlace_sesion || cap.enlace}" target="_blank" rel="noopener noreferrer" 
                style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px 16px; background: #E0F2FE; color: #0284C7; border: 1px solid #BAE6FD; border-radius: 12px; font-weight: 700; font-size: 13.5px; text-decoration: none; box-sizing: border-box;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>Acceder a la sala en vivo (Zoom / Meet)</span>
              </a>
            </div>
          ` : ''}

          <!-- SECCIÓN: CONSTANCIA / DIPLOMA SI ESTÁ APROBADO -->
          ${ameritaConstancia ? `
            <div class="cd-diploma-card-box">
              <div style="font-size: 24px; margin-bottom: 4px;">🎓</div>
              <h4 style="margin: 0 0 4px 0; font-size: 16px; color: #92400E; font-weight: 800;">¡Tu Diploma de Participación está listo!</h4>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #B45309;">Has completado exitosamente esta capacitación de Nannys &amp; Peques.</p>
              
              <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                <button type="button" class="cd-btn-diploma" onclick="ComunidadDashboard.descargarDiploma('${cap.id}')">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Descargar Diploma</span>
                </button>
                <button type="button" class="cd-btn-pill" style="padding: 10px 18px; font-size: 13px; background: #FFFFFF; color: #92400E; border: 1.5px solid #F59E0B; margin-top: 10px;" onclick="ComunidadDashboard.imprimirDiploma('${cap.id}')">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  <span>Imprimir</span>
                </button>
              </div>
            </div>
          ` : ''}

          <!-- SECCIÓN: ASISTENCIA (CHECK-IN / CHECK-OUT) -->
          ${estaInscrita ? `
            <div style="margin-top: 16px; padding: 14px; background: #F1F5F9; border-radius: 16px; border: 1px solid #E2E8F0;">
              <h5 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #1E293B; display: flex; align-items: center; gap: 6px;">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00A3B4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Pase de Asistencia
              </h5>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${!asistio ? `
                  <button type="button" class="cd-btn-checkin" onclick="ComunidadDashboard.hacerCheckIn('${cap.id}')">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    <span>Pase de lista</span>
                  </button>
                ` : `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: #DCFCE7; padding: 8px 12px; border-radius: 10px; font-size: 12px; color: #15803D; font-weight: 700;">
                    <span>✅ Asistencia confirmada ${insc.checkin_hora ? `(${new Date(insc.checkin_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}</span>
                    <span>Presente</span>
                  </div>
                `}
              </div>
            </div>
          ` : ''}

          <!-- BOTONES DE ACCIÓN (INSCRIBIRSE / CANCELAR) -->
          <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
            ${!estaInscrita ? `
              <button type="button" class="cd-btn-pill" style="width: 100%; justify-content: center; padding: 12px 20px; font-size: 14px;" onclick="ComunidadDashboard.inscribirseCapacitacion('${cap.id}')">
                <span>Inscribirme a esta capacitación</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            ` : `
              <button type="button" style="background: none; border: none; color: #94A3B8; font-size: 12px; font-weight: 600; cursor: pointer; padding: 6px; text-decoration: underline;" onclick="ComunidadDashboard.cancelarInscripcion('${cap.id}')">
                Cancelar mi inscripción
              </button>
            `}
          </div>
        </div>
      `;
    },

    /**
     * Inscribe al usuario actual a una capacitación en Firestore
     */
    inscribirseCapacitacion: async function (capacitacionId) {
      const user = this.getUsuarioActual();
      if (!user.email) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'warning',
            title: 'Sesión requerida',
            text: 'Debes tener una sesión activa para inscribirte.',
            confirmButtonColor: '#E84C9A'
          });
        } else {
          alert('Debes tener una sesión activa para inscribirte.');
        }
        return;
      }

      const cap = this.capacitaciones.find(c => c.id === capacitacionId);
      if (!cap) return;

      const fechaTexto = this.formatearFecha(cap.fecha, true);
      const horarioTexto = cap.horario || 'Horario por confirmar';
      const badgeInfo = this.getModalidadBadgeInfo(cap);
      const costoTexto = cap.costo ? `$${cap.costo} MXN` : 'Acceso Gratuito';
      const rolTexto = user.esCliente ? 'Familia Cliente 👨‍👩‍👧' : 'Niñera 👩‍⚕️';
      const imgSrc = (cap.imagen && (cap.imagen.startsWith('http') || cap.imagen.startsWith('data:image')))
        ? cap.imagen
        : 'assets/img/comunidad/curso_primeros_auxilios.jpg';

      // Modal de confirmación estilizado
      if (typeof Swal !== 'undefined') {
        const confirmResult = await Swal.fire({
          title: '<span style="font-family:\'DM Serif Display\',serif; font-size:22px; color:#0F172A;">¿Confirmas tu inscripción?</span>',
          html: `
            <div style="text-align: left; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 14px; margin-top: 8px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; gap: 12px; align-items: center;">
                <img src="${imgSrc}" style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover; border: 1px solid #E2E8F0; flex-shrink: 0;" alt="Portada">
                <div style="flex: 1; min-width: 0;">
                  <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 800; color: #0F172A; line-height: 1.3;">${this.escapeHtml(cap.titulo)}</h4>
                  <div style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; background: ${badgeInfo.clase === 'presencial' ? '#DCFCE7' : badgeInfo.clase === 'hibrida' ? '#F3E8FF' : '#FFE4E6'}; color: ${badgeInfo.clase === 'presencial' ? '#166534' : badgeInfo.clase === 'hibrida' ? '#6B21A8' : '#BE123C'};">
                    ${badgeInfo.icono} ${this.escapeHtml(badgeInfo.textoCorto)}
                  </div>
                </div>
              </div>

              <div style="background: white; border-radius: 12px; padding: 10px 12px; border: 1px solid #F1F5F9; font-size: 12.5px; display: flex; flex-direction: column; gap: 6px; color: #334155;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748B;">📅 <b>Fecha:</b></span>
                  <span style="font-weight: 700; color: #0F172A;">${fechaTexto}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748B;">⏰ <b>Horario:</b></span>
                  <span style="font-weight: 700; color: #0F172A;">${horarioTexto}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748B;">💰 <b>Costo:</b></span>
                  <span style="font-weight: 800; color: #E84C9A;">${costoTexto}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px dashed #E2E8F0; padding-top: 6px; margin-top: 2px;">
                  <span style="color: #64748B;">👤 <b>Participante:</b></span>
                  <span style="font-weight: 700; color: #0284C7;">${this.escapeHtml(user.nombre)} (${rolTexto})</span>
                </div>
              </div>

              <p style="margin: 0; font-size: 11.5px; color: #64748B; text-align: center; line-height: 1.4;">
                ✨ Al inscribirte apartas tu lugar. Podrás registrar tu asistencia el día del evento y descargar tu constancia.
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#E84C9A',
          cancelButtonColor: '#94A3B8',
          confirmButtonText: 'Sí, ¡Inscribirme! 🎟️',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
        });

        if (!confirmResult.isConfirmed) return;

        Swal.fire({
          title: 'Guardando inscripción...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
      }

      try {
        const { db } = await import('./firebase-config.js');
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const esCiudadValida = (v) => {
          if (!v || typeof v !== 'string') return false;
          const t = v.trim();
          if (!t || t === '—' || t === '-' || t === 'null' || t === 'undefined') return false;
          if (t.startsWith('http://') || t.startsWith('https://') || t.includes('maps') || t.includes('.gl/') || t.includes('/')) return false;
          return true;
        };

        // Consultar estrictamente la columna 'ciudad' de la tabla correspondiente en Supabase
        try {
          const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : (typeof window.getSupabaseClient === 'function' ? window.getSupabaseClient() : null);
          if (client && user.email) {
            const table = user.esCliente ? 'clientes' : 'nannys';
            const { data } = await client.from(table).select('ciudad, nombre').ilike('email', user.email).maybeSingle();
            if (data && esCiudadValida(data.ciudad)) {
              user.ciudad = data.ciudad;
            } else if (!esCiudadValida(user.ciudad)) {
              user.ciudad = '—';
            }
          }
        } catch (e) { }

        const docId = `${capacitacionId}_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const docRef = doc(db, 'inscripciones_capacitaciones', docId);

        await setDoc(docRef, {
          capacitacionId: capacitacionId,
          capacitacionTitulo: cap.titulo || '',
          nannyEmail: user.email,
          nannyNombre: user.nombre,
          nannyCiudad: user.ciudad || '—',
          rol: user.rol || (user.esCliente ? 'Cliente' : 'Niñera'),
          esCliente: !!user.esCliente,
          fecha_inscripcion: new Date().toISOString(),
          asistio: false,
          amerita_constancia: false
        });

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: '¡Inscripción Exitosa! 🎉',
            text: `Te has inscrito a "${cap.titulo}". Te esperamos el ${this.formatearFecha(cap.fecha)}.`,
            confirmButtonColor: '#E84C9A',
            confirmButtonText: 'Genial'
          });
        }
      } catch (err) {
        console.error('Error al inscribirse:', err);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo completar la inscripción: ' + err.message,
            confirmButtonColor: '#E84C9A'
          });
        }
      }
    },

    /**
     * Cancela la inscripción del usuario
     */
    cancelarInscripcion: async function (capacitacionId) {
      const user = this.getUsuarioActual();
      if (!user.email) return;

      const confirmacion = typeof Swal !== 'undefined'
        ? await Swal.fire({
          title: '¿Cancelar inscripción?',
          text: 'Podrás volver a inscribirte si hay lugares disponibles.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#E84C9A',
          cancelButtonColor: '#94A3B8',
          confirmButtonText: 'Sí, cancelar',
          cancelButtonText: 'Volver'
        })
        : { isConfirmed: confirm('¿Deseas cancelar tu inscripción?') };

      if (!confirmacion.isConfirmed) return;

      try {
        const { db } = await import('./firebase-config.js');
        const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const docId = `${capacitacionId}_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await deleteDoc(doc(db, 'inscripciones_capacitaciones', docId));

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'info',
            title: 'Inscripción cancelada',
            text: 'Se ha liberado tu lugar para esta sesión.',
            confirmButtonColor: '#E84C9A',
            timer: 1800,
            showConfirmButton: false
          });
        }
      } catch (err) {
        console.error('Error al cancelar inscripción:', err);
      }
    },

    /**
     * Procesa el Check-in (Entrada) solicitando el código de asistencia
     */
    hacerCheckIn: async function (capacitacionId) {
      const user = this.getUsuarioActual();
      if (!user.email) return;

      const cap = this.capacitaciones.find(c => c.id === capacitacionId);
      if (!cap) return;

      let codigoIngresado = '';

      if (typeof Swal !== 'undefined') {
        const { value: codigo } = await Swal.fire({
          width: '320px',
          customClass: {
            popup: 'cd-swal-compact-popup'
          },
          html: `
            <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding: 4px 0 0 0;">
              <div style="width:46px; height:46px; border-radius:50%; background:#F0FDFA; border:1.5px solid #99F6E4; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:6px; box-shadow:0 2px 8px rgba(0, 163, 180, 0.12);">
                🔑
              </div>
              <h3 style="margin:0 0 4px 0; font-family:'DM Serif Display',serif; font-size:20px; color:#0F172A;">Pase de Lista</h3>
              
              <p style="margin:0 0 12px 0; font-size:12.5px; color:#64748B; line-height:1.35; max-width:260px;">
                Ingresa el código de 4 dígitos proporcionado durante la sesión:
              </p>
              
              <div style="display:flex; justify-content:center; width:100%; margin-bottom:8px;">
                <input type="text" id="cd-input-pase-lista" maxlength="4" placeholder="XXXX"
                  autocomplete="off" spellcheck="false"
                  style="width: 150px; text-align: center; font-size: 24px; font-weight: 800; letter-spacing: 6px; font-family: monospace, 'Plus Jakarta Sans', sans-serif; padding: 7px 10px; border-radius: 12px; border: 2px solid #00A3B4; background: #F0FDFA; color: #0F766E; box-shadow: 0 2px 8px rgba(0, 163, 180, 0.12); outline: none; text-transform: uppercase;"
                  oninput="this.value = this.value.toUpperCase().slice(0,4)"
                />
              </div>

              <span id="cd-error-pase-lista" style="display:none; color:#EF4444; font-size:11.5px; font-weight:700; margin-bottom:4px;"></span>
            </div>
          `,
          showCancelButton: true,
          confirmButtonColor: '#10B981',
          cancelButtonColor: '#94A3B8',
          confirmButtonText: 'Validar Pase de lista ✅',
          cancelButtonText: 'Cancelar',
          reverseButtons: true,
          didOpen: () => {
            const input = document.getElementById('cd-input-pase-lista');
            if (input) {
              input.focus();
              input.addEventListener('focus', () => {
                input.style.borderColor = '#008394';
                input.style.boxShadow = '0 0 0 4px rgba(0, 163, 180, 0.2)';
              });
              input.addEventListener('blur', () => {
                input.style.borderColor = '#00A3B4';
                input.style.boxShadow = '0 4px 14px rgba(0, 163, 180, 0.12)';
              });
              input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                  Swal.clickConfirm();
                }
              });
            }
          },
          preConfirm: () => {
            const input = document.getElementById('cd-input-pase-lista');
            const errEl = document.getElementById('cd-error-pase-lista');
            const val = input ? input.value.trim() : '';
            if (!val) {
              if (errEl) {
                errEl.textContent = 'Por favor ingresa el código de 4 dígitos.';
                errEl.style.display = 'block';
              }
              if (input) input.focus();
              return false;
            }
            return val;
          }
        });

        if (!codigo) return;
        codigoIngresado = codigo.trim();
      } else {
        codigoIngresado = prompt('Ingresa el código de asistencia (XXXX):');
        if (!codigoIngresado) return;
      }

      // Validar código si está definido en la capacitación
      if (cap.codigo_asistencia && cap.codigo_asistencia.trim() !== '') {
        if (codigoIngresado.toLowerCase() !== cap.codigo_asistencia.trim().toLowerCase()) {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'error',
              title: 'Código incorrecto',
              text: 'El código ingresado no coincide con el de esta capacitación. Verifica con tu instructora.',
              confirmButtonColor: '#E84C9A'
            });
          } else {
            alert('Código incorrecto.');
          }
          return;
        }
      }

      // Registrar asistencia en Firestore
      try {
        const { db } = await import('./firebase-config.js');
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const docId = `${capacitacionId}_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await updateDoc(doc(db, 'inscripciones_capacitaciones', docId), {
          asistio: true,
          checkin_hora: new Date().toISOString()
        });

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: '¡Pase de Lista Registrado! 🎉',
            text: 'Tu asistencia ha quedado registrada correctamente. ¡Que disfrutes la sesión!',
            confirmButtonColor: '#10B981'
          });
        }
      } catch (err) {
        console.error('Error al registrar check-in:', err);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo registrar la asistencia: ' + err.message,
            confirmButtonColor: '#E84C9A'
          });
        }
      }
    },

    /**
     * Procesa el Check-out (Salida)
     */
    hacerCheckOut: async function (capacitacionId) {
      const user = this.getUsuarioActual();
      if (!user.email) return;

      try {
        const { db } = await import('./firebase-config.js');
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const docId = `${capacitacionId}_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await updateDoc(doc(db, 'inscripciones_capacitaciones', docId), {
          checkout_hora: new Date().toISOString()
        });

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: '¡Salida Registrada! 🏁',
            text: 'Gracias por participar en esta sesión formativa de Nannys y Peques.',
            confirmButtonColor: '#0EA5E9'
          });
        }
      } catch (err) {
        console.error('Error al registrar checkout:', err);
      }
    },

    /**
     * Genera el Canvas para la constancia/diploma con los nombres y coordenadas
     */
    generarCanvasDiploma: async function (capacitacionId) {
      const cap = this.capacitaciones.find(c => c.id === capacitacionId);
      if (!cap || !cap.constancia_base) {
        throw new Error('La plantilla de constancia no está disponible para esta capacitación.');
      }

      const user = this.getUsuarioActual();
      const insc = this.getInscripcionUsuario(capacitacionId);
      const nombreCompleto = (insc && insc.nannyNombre ? insc.nannyNombre : user.nombre).toUpperCase();
      const fechaTexto = this.formatearFecha(cap.fecha, true);

      // Cargar imagen base
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('No se pudo cargar la imagen del formato de constancia.'));
        img.src = cap.constancia_base;
      });

      // Crear Canvas offscreen
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1200;
      canvas.height = img.naturalHeight || 850;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Factor de escala basado en el ancho base del diseñador (650px)
      const scale = canvas.width / 650;

      // Parámetros de coordenadas y fuentes
      const posNameX = (parseFloat(cap.pos_nombre_x) || 50) / 100 * canvas.width;
      const posNameY = (parseFloat(cap.pos_nombre_y) || 45) / 100 * canvas.height;
      const fontNameSize = (parseFloat(cap.font_nombre) || 28) * scale;

      const posDateX = (parseFloat(cap.pos_date_x) || 50) / 100 * canvas.width;
      const posDateY = (parseFloat(cap.pos_date_y) || 85) / 100 * canvas.height;
      const fontDateSize = (parseFloat(cap.font_fecha) || 16) * scale;

      // 1. Dibujar Nombre
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0F172A';
      ctx.font = `bold ${fontNameSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
      ctx.fillText(nombreCompleto, posNameX, posNameY);
      ctx.restore();

      // 2. Dibujar Fecha
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#475569';
      ctx.font = `600 ${fontDateSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
      ctx.fillText(fechaTexto, posDateX, posDateY);
      ctx.restore();

      return { canvas, nombreCompleto, tituloCap: cap.titulo };
    },

    /**
     * Descarga el diploma generado en formato PNG
     */
    descargarDiploma: async function (capacitacionId) {
      const insc = this.getInscripcionUsuario(capacitacionId);
      if (!insc || insc.amerita_constancia !== true) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'info',
            title: 'Constancia en validación',
            text: 'Tu constancia aún no ha sido aprobada por el área de Recursos Humanos. Se habilitará una vez que sea validada.',
            confirmButtonColor: '#E84C9A'
          });
        } else {
          alert('Tu constancia aún no ha sido aprobada por Recursos Humanos.');
        }
        return;
      }

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Generando diploma...',
          text: 'Preparando tu constancia personalizada en alta resolución...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
      }

      try {
        const { canvas, nombreCompleto, tituloCap } = await this.generarCanvasDiploma(capacitacionId);
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        const filename = `Diploma_${(tituloCap || 'Capacitacion').replace(/[^a-zA-Z0-9]/g, '_')}_${nombreCompleto.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: '¡Diploma Descargado! 🎓',
            text: 'Tu constancia ha sido guardada en tus descargas.',
            confirmButtonColor: '#E84C9A',
            timer: 2200,
            showConfirmButton: false
          });
        }
      } catch (err) {
        console.error('Error al descargar diploma:', err);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo generar',
            text: err.message || 'Ocurrió un error al preparar el diploma.',
            confirmButtonColor: '#E84C9A'
          });
        }
      }
    },

    /**
     * Abre ventana de impresión para el diploma
     */
    imprimirDiploma: async function (capacitacionId) {
      const insc = this.getInscripcionUsuario(capacitacionId);
      if (!insc || insc.amerita_constancia !== true) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'info',
            title: 'Constancia en validación',
            text: 'Tu constancia aún no ha sido aprobada por el área de Recursos Humanos.',
            confirmButtonColor: '#E84C9A'
          });
        } else {
          alert('Tu constancia aún no ha sido aprobada por Recursos Humanos.');
        }
        return;
      }

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Preparando impresión...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
      }

      try {
        const { canvas, tituloCap } = await this.generarCanvasDiploma(capacitacionId);
        const dataUrl = canvas.toDataURL('image/png', 1.0);

        if (typeof Swal !== 'undefined') Swal.close();

        const printWin = window.open('', '_blank');
        if (!printWin) {
          alert('Por favor habilita las ventanas emergentes en tu navegador para imprimir.');
          return;
        }

        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Diploma - ${this.escapeHtml(tituloCap)}</title>
              <style>
                @page { size: landscape; margin: 0; }
                body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #FFFFFF; }
                img { width: 100vw; height: 100vh; object-fit: contain; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.print();" />
            </body>
          </html>
        `);
        printWin.document.close();
      } catch (err) {
        console.error('Error al imprimir:', err);
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message,
            confirmButtonColor: '#E84C9A'
          });
        }
      }
    },

    /**
     * Abre el catálogo completo de capacitaciones
     */
    verCatalogo: function () {
      this.tabCatalogoActivo = 'todas';
      this.renderListaCatalogo();
      const modal = document.getElementById('cd-modal-capacitaciones-catalogo');
      if (modal) {
        modal.style.display = 'flex';
      }
    },

    cerrarModalCatalogo: function () {
      const modal = document.getElementById('cd-modal-capacitaciones-catalogo');
      if (modal) {
        modal.style.display = 'none';
      }
    },

    cambiarTabCatalogo: function (tab) {
      this.tabCatalogoActivo = tab;

      const btnTodas = document.getElementById('cd-tab-cat-todas');
      const btnInsc = document.getElementById('cd-tab-cat-inscritas');
      const btnDip = document.getElementById('cd-tab-cat-diplomas');

      if (btnTodas) btnTodas.classList.toggle('active', tab === 'todas');
      if (btnInsc) btnInsc.classList.toggle('active', tab === 'inscritas');
      if (btnDip) btnDip.classList.toggle('active', tab === 'diplomas');

      this.renderListaCatalogo();
    },

    /**
     * Renderiza la lista dentro del modal catálogo según la pestaña activa
     */
    renderListaCatalogo: function () {
      const container = document.getElementById('cd-catalogo-lista-container');
      if (!container) return;

      const tab = this.tabCatalogoActivo;
      const user = this.getUsuarioActual();

      let lista = [...this.capacitaciones];

      if (tab === 'inscritas') {
        const idsInscritas = this.inscripciones
          .filter(ins => (ins.nannyEmail || '').toLowerCase() === user.email)
          .map(ins => ins.capacitacionId);
        lista = lista.filter(c => idsInscritas.includes(c.id));
      } else if (tab === 'diplomas') {
        const idsDiplomas = this.inscripciones
          .filter(ins => (ins.nannyEmail || '').toLowerCase() === user.email && ins.amerita_constancia === true)
          .map(ins => ins.capacitacionId);
        lista = lista.filter(c => idsDiplomas.includes(c.id) && !!c.constancia_base);
      }

      if (lista.length === 0) {
        let msg = 'No hay capacitaciones programadas en este momento.';
        if (tab === 'inscritas') msg = 'Aún no te has inscrito a ninguna capacitación.';
        if (tab === 'diplomas') msg = 'Aún no tienes diplomas disponibles. Inscríbete a tus sesiones y participa para obtener tus certificaciones.';

        container.innerHTML = `
          <div style="text-align: center; padding: 40px 16px; color: #64748B; font-size: 13.5px; background: #F8FAFC; border-radius: 16px; border: 1px dashed #CBD5E1;">
            <div style="font-size: 32px; margin-bottom: 8px;">📚</div>
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #0F172A;">${msg}</p>
            ${tab !== 'todas' ? `
              <button type="button" class="cd-btn-pill" style="margin-top: 10px; font-size: 12px; padding: 7px 16px;" onclick="ComunidadDashboard.cambiarTabCatalogo('todas')">
                Ver todas las capacitaciones
              </button>
            ` : ''}
          </div>
        `;
        return;
      }

      let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';

      lista.forEach(cap => {
        const insc = this.getInscripcionUsuario(cap.id);
        const estaInscrita = !!insc;
        const ameritaConstancia = insc && insc.amerita_constancia === true && !!cap.constancia_base;
        const imgUrl = cap.imagen || 'assets/img/comunidad/curso_primeros_auxilios.jpg';
        const fechaTexto = this.formatearFecha(cap.fecha, true);
        const badgeInfo = this.getModalidadBadgeInfo(cap);

        html += `
          <div style="display: flex; gap: 14px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 12px; align-items: center; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.03);"
            onclick="ComunidadDashboard.cerrarModalCatalogo(); ComunidadDashboard.abrirDetalleCapacitacion('${cap.id}')">
            <img src="${imgUrl}" alt="${this.escapeHtml(cap.titulo)}" style="width: 76px; height: 76px; border-radius: 12px; object-fit: cover; flex-shrink: 0;" onerror="this.src='assets/img/comunidad/curso_primeros_auxilios.jpg'">
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px; flex-wrap: wrap;">
                <span class="cd-session-tag ${badgeInfo.clase}" style="position: static; font-size: 9.5px; padding: 2px 7px;">
                  ${badgeInfo.textoCorto}
                </span>
                ${estaInscrita ? `
                  <span style="background: #DCFCE7; color: #15803D; font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 999px;">
                    ✓ Inscrita
                  </span>
                ` : ''}
                ${ameritaConstancia ? `
                  <span style="background: #FEF3C7; color: #B45309; font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 999px;">
                    🎓 Diploma Listo
                  </span>
                ` : ''}
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${this.escapeHtml(cap.titulo)}
              </h4>
              <p style="margin: 0; font-size: 12px; color: #64748B;">
                📅 ${fechaTexto} &bull; ⏰ ${cap.horario || 'Horario por confirmar'}${cap.ciudad ? ` &bull; 📍 ${this.escapeHtml(cap.ciudad)}` : ''}
              </p>
            </div>
            <div style="color: #E84C9A; font-weight: 800; font-size: 18px; padding-right: 4px;">&rsaquo;</div>
          </div>
        `;
      });

      html += '</div>';
      container.innerHTML = html;
    },

    /**
     * Obtiene los artículos reales de la fuente centralizada en Comunidad.estado.datos.articulos
     */
    getArticulos: function () {
      if (
        window.Comunidad &&
        window.Comunidad.estado &&
        window.Comunidad.estado.datos &&
        Array.isArray(window.Comunidad.estado.datos.articulos)
      ) {
        return window.Comunidad.estado.datos.articulos;
      }
      return [];
    },

    /**
     * Ajusta el encabezado según si es panel de Cliente o Niñera
     */
    actualizarEncabezadoRol: function () {
      const subEl = document.getElementById('cd-header-subtitle');
      if (!subEl) return;

      const esCliente = (window.SESION && !!window.SESION.cliente) || false;
      if (esCliente) {
        subEl.textContent = 'Aprendizaje, beneficios y recursos para su familia.';
      } else {
        subEl.textContent = 'Aprendizaje, beneficios y recursos para tu desarrollo profesional.';
      }
    },

    /**
     * Retorna la clase CSS de color según la categoría
     */
    getTagClass: function (cat) {
      if (!cat) return 'general';
      const norm = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (norm.includes('sensorial')) return 'sensorial';
      if (norm.includes('lenguaje')) return 'lenguaje';
      if (norm.includes('motriz')) return 'motriz';
      if (norm.includes('cognitivo')) return 'cognitivo';
      if (norm.includes('socioemocional')) return 'socioemocional';
      if (norm.includes('crianza')) return 'crianza';
      if (norm.includes('educacion')) return 'educacion';
      if (norm.includes('extra')) return 'extras';
      return 'general';
    },

    /**
     * Calcula el tiempo estimado de lectura en minutos
     */
    calcularTiempoLectura: function (contenido) {
      if (!contenido) return '3 min';
      const texto = contenido.replace(/<[^>]*>/g, ' ');
      const palabras = texto.trim().split(/\s+/).length;
      const minutos = Math.max(2, Math.round(palabras / 180));
      return minutos + ' min';
    },

    /**
     * Genera dinámicamente las píldoras de categorías a partir de los artículos reales
     */
    renderCategorias: function () {
      const row = document.getElementById('cd-filter-pills-row');
      if (!row) return;

      const articulos = this.getArticulos();
      const catCount = {};

      articulos.forEach(art => {
        let cat = art.categoria ? art.categoria.trim() : 'General';
        if (cat.toLowerCase() === 'cognitivo') cat = 'Cognitivo';
        catCount[cat] = (catCount[cat] || 0) + 1;
      });

      const orden = ['Todas', 'Socioemocional', 'Cognitivo', 'Lenguaje', 'Sensorial', 'Motriz', 'Extras', 'Crianza', 'Educación'];
      const existentes = Object.keys(catCount);
      const ordenadas = [];

      orden.forEach(c => {
        if (c === 'Todas' || existentes.includes(c)) {
          ordenadas.push(c);
        }
      });

      existentes.forEach(c => {
        if (!ordenadas.includes(c)) ordenadas.push(c);
      });

      let html = '';
      ordenadas.forEach(c => {
        const isActive = (this.categoriaActiva.toLowerCase() === c.toLowerCase()) ? ' active' : '';
        const count = (c === 'Todas') ? articulos.length : (catCount[c] || 0);
        html += `
          <button class="cd-filter-pill${isActive}" type="button"
            onclick="ComunidadDashboard.filtrarCategoria('${c}', this)">
            ${c} <span style="opacity:0.75; font-size:10.5px;">(${count})</span>
          </button>
        `;
      });

      row.innerHTML = html;
    },

    filtrarCategoria: function (cat, btnEl) {
      this.categoriaActiva = cat;
      this.paginaActual = 1;

      const pills = document.querySelectorAll('.cd-filter-pill');
      pills.forEach(p => p.classList.remove('active'));
      if (btnEl) {
        btnEl.classList.add('active');
      } else {
        const targetBtn = Array.from(pills).find(p => p.textContent.toLowerCase().includes(cat.toLowerCase()));
        if (targetBtn) targetBtn.classList.add('active');
      }

      this.renderArticulos();
    },

    onSearchInput: function (val) {
      this.busqueda = (val || '').trim().toLowerCase();
      this.paginaActual = 1;

      const clearBtn = document.getElementById('cd-search-clear');
      if (clearBtn) {
        if (this.busqueda.length > 0) clearBtn.classList.add('visible');
        else clearBtn.classList.remove('visible');
      }

      this.renderArticulos();
    },

    limpiarBusqueda: function () {
      const input = document.getElementById('cd-search-input');
      if (input) input.value = '';
      this.busqueda = '';

      const clearBtn = document.getElementById('cd-search-clear');
      if (clearBtn) clearBtn.classList.remove('visible');

      this.paginaActual = 1;
      this.renderArticulos();
    },

    renderArticulos: function () {
      const container = document.getElementById('cd-articles-container');
      const loadMoreContainer = document.getElementById('cd-load-more-container');
      const resultsInfo = document.getElementById('cd-results-info');
      if (!container) return;

      const articulos = this.getArticulos();
      const cat = this.categoriaActiva;
      const query = this.busqueda;

      let filtrados = articulos.filter(a => {
        if (cat === 'Todas') return true;
        const artCat = (a.categoria || '').trim().toLowerCase();
        const selCat = cat.toLowerCase();
        return artCat === selCat;
      });

      if (query.length > 0) {
        filtrados = filtrados.filter(a => {
          const t = (a.titulo || '').toLowerCase();
          const r = (a.resumen || '').toLowerCase();
          const c = (a.categoria || '').toLowerCase();
          const b = (a.contenido || '').toLowerCase();
          return t.includes(query) || r.includes(query) || c.includes(query) || b.includes(query);
        });
      }

      if (resultsInfo) {
        if (query.length > 0 || cat !== 'Todas') {
          resultsInfo.style.display = 'flex';
          resultsInfo.innerHTML = `
            <span>${filtrados.length} artículo${filtrados.length === 1 ? '' : 's'} encontrado${filtrados.length === 1 ? '' : 's'}</span>
            ${query.length > 0 ? `<span style="color:#00A3B4; cursor:pointer;" onclick="ComunidadDashboard.limpiarBusqueda()">Quitar búsqueda &times;</span>` : ''}
          `;
        } else {
          resultsInfo.style.display = 'none';
        }
      }

      if (filtrados.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding: 40px 16px; color: #64748B; font-size: 13.5px; background: #FFFFFF; border-radius: 20px; border: 1px dashed #E2E8F0; margin: 10px 0;">
            <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #0F172A;">No encontramos artículos con estos criterios</p>
            <p style="margin: 0 0 16px 0; font-size: 12.5px;">Prueba seleccionando otra categoría o limpiando la búsqueda.</p>
            <button type="button" class="cd-btn-pill" style="padding: 7px 18px; font-size: 12px;" onclick="ComunidadDashboard.limpiarBusqueda(); ComunidadDashboard.filtrarCategoria('Todas');">
              Ver todos los artículos
            </button>
          </div>
        `;
        if (loadMoreContainer) loadMoreContainer.innerHTML = '';
        return;
      }

      const limite = this.paginaActual * this.articulosPorPagina;
      const visibles = filtrados.slice(0, limite);

      let html = '';
      visibles.forEach(art => {
        const tagClass = this.getTagClass(art.categoria);
        const tiempo = this.calcularTiempoLectura(art.contenido);
        const imgUrl = art.imagen || 'assets/img/articulos/alimentacion.jpg';

        html += `
          <article class="cd-article-card" onclick="ComunidadDashboard.abrirArticulo(${art.id})">
            <div class="cd-article-thumb-box">
              <img src="${imgUrl}" alt="${art.titulo}" class="cd-article-thumb" loading="lazy" onerror="this.src='assets/img/articulos/alimentacion.jpg'">
            </div>
            <div class="cd-article-info">
              <span class="cd-article-tag ${tagClass}">${art.categoria}</span>
              <h4 class="cd-article-title">${art.titulo}</h4>
              <p class="cd-article-summary">${art.resumen}</p>
              <div class="cd-article-footer-row">
                <span class="cd-article-link">Leer más &rarr;</span>
                <span class="cd-article-read-time">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  ${tiempo}
                </span>
              </div>
            </div>
          </article>
        `;
      });

      container.innerHTML = html;

      if (loadMoreContainer) {
        if (filtrados.length > limite) {
          const restantes = filtrados.length - limite;
          loadMoreContainer.innerHTML = `
            <button type="button" class="cd-btn-load-more" onclick="ComunidadDashboard.cargarMas()">
              <span>Mostrar más artículos (${restantes} restantes)</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          `;
        } else {
          loadMoreContainer.innerHTML = '';
        }
      }
    },

    cargarMas: function () {
      this.paginaActual++;
      this.renderArticulos();
    },

    abrirArticulo: function (id) {
      const articulos = this.getArticulos();
      const art = articulos.find(a => a.id === id);

      if (!art || !art.contenido) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Contenido en preparación',
            text: 'Próximamente estaremos preparando este contenido para ti.',
            icon: 'info',
            confirmButtonColor: '#E84C9A'
          });
        } else {
          alert('Próximamente estaremos preparando este contenido para ti.');
        }
        return;
      }

      this.lastScrollPos = window.scrollY || window.pageYOffset || 0;
      this.renderArticuloCompleto(art);

      if (typeof window.irVista === 'function') {
        window.irVista('articulo');
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
    },

    renderArticuloCompleto: function (art) {
      const container = document.getElementById('vista-articulo');
      if (!container) return;

      const tagClass = this.getTagClass(art.categoria);
      const tiempo = this.calcularTiempoLectura(art.contenido);
      const imgUrl = art.imagen || 'assets/img/articulos/alimentacion.jpg';

      container.innerHTML = `
        <div class="reading-view">
          <button type="button" class="cd-read-back-btn" onclick="ComunidadDashboard.volverDeArticulo()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Volver a Comunidad</span>
          </button>

          <div class="reading-hero" style="background-image: url('${imgUrl}')"></div>

          <div class="reading-meta-bar">
            <span class="cd-article-tag ${tagClass}">${art.categoria}</span>
            <span style="font-size: 12px; color: #64748B; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${tiempo} de lectura
            </span>
          </div>

          <h1>${art.titulo}</h1>

          <div class="reading-content">
            ${art.contenido}
          </div>

          <div class="reading-footer-card">
            <p>
              Fuente: Guías y literatura pedagógica Nannys &amp; Peques.<br>
              <strong>Nannys y Peques Comunidad</strong>
            </p>
            <button type="button" class="cd-btn-finish-reading" onclick="ComunidadDashboard.volverDeArticulo()">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>He terminado de leer</span>
            </button>
          </div>
        </div>
      `;
    },

    volverDeArticulo: function () {
      if (typeof window.irVista === 'function') {
        window.irVista('comunidad');
      }

      setTimeout(() => {
        window.scrollTo({
          top: this.lastScrollPos || 0,
          behavior: 'instant'
        });
      }, 50);
    },

    verConvenios: function () {
      if (typeof window.irVista === 'function') {
        window.irVista('convenios');
      }
    },

    scrollSeccion: function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    escapeHtml: function (text) {
      if (!text) return '';
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  };

  window.ComunidadDashboard = ComunidadDashboard;

  if (window.Comunidad) {
    window.Comunidad.volverALista = function () {
      ComunidadDashboard.volverDeArticulo();
    };
  }
})();
