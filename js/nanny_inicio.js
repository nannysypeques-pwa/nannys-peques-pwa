/**
 * ============================================================================
 * MÓDULO NIÑERA: PESTAÑA "INICIO"
 * Nannys y Peques - Modern UX/UI (Réplica exacta adaptada al rol de Niñera)
 * Fondo unificado: #FFF9FB
 * ============================================================================
 */

(function () {
  'use strict';

  const NannyInicio = {
    inicializado: false,
    _haAterrizado: false,

    _realtimeActivo: false,
    _refreshTimer: null,
    _eventosVisibilidadConfigurados: false,

    /**
     * Inicializa el módulo, asegurando que la vista y eventos estén listos.
     */
    init: function () {
      if (this.inicializado) return;

      this.inyectarVista();
      this.activarRealtime();
      this.configurarEventosVisibilidad();
      this.inicializado = true;

      this.cargarConveniosCiudad(false);

      const isNinera = !!(window.SESION && !window.SESION.cliente && !window.SESION.admin && !window.SESION.supervision && !window.SESION.rh);
      if (isNinera) {
        this.actualizarSaludo();
        this.cargarServicios(true);

        const vistaActiva = document.querySelector('.vista.activa');
        if (vistaActiva) {
          const nombre = vistaActiva.id.replace('vista-', '');
          this.actualizarBotonActivo(nombre);
        }
      }

      // Listener para eventos de cambio en la matriz
      window.addEventListener('nyp_matriz_servicios_cambio', () => {
        if (window.CACHE_NINERA) window.CACHE_NINERA.servicios = null;
        this.cargarServicios(true);
      });

      // BroadcastChannel para sincronización inter-pestañas instantánea
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('nyp_admin_sync_channel');
          bc.onmessage = (e) => {
            if (e.data && (e.data.type === 'control_servicios_update' || e.data.type === 'cambio_servicio_matriz')) {
              console.log('⚡ [NannyInicio Sync] Actualización recibida de la matriz');
              if (window.CACHE_NINERA) window.CACHE_NINERA.servicios = null;
              this.cargarServicios(true);
              if (window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
                window.ClienteServicios.cargar(true);
              }
            }
          };
        } catch (_) { }
      }

      console.log('✨ [NannyInicio] Módulo inicializado con éxito (#FFF9FB)');
    },

    /**
     * Activa suscripción en tiempo real a cambios en control_servicios y confirmaciones
     */
    activarRealtime: function () {
      if (this._realtimeActivo) return;
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;

      try {
        this._realtimeActivo = true;

        // Listener de evento storage inter-pestañas como fallback garantizado
        window.addEventListener('storage', (e) => {
          if (e.key === 'nyp_servicios_sync_trigger') {
            if (window.CACHE_NINERA) window.CACHE_NINERA.servicios = null;
            clearTimeout(this._refreshTimer);
            this._refreshTimer = setTimeout(() => {
              NannyInicio.cargarServicios(true);
              if (typeof window.actualizarClientesEstimulacion === 'function') {
                window.actualizarClientesEstimulacion(true);
              }
              if (window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
                window.ClienteServicios.cargar(true);
              }
            }, 100);
          }
        });

        client.channel('realtime_nanny_inicio_auto_sync')
          .on('broadcast', { event: 'cambio_servicio_matriz' }, (payload) => {
            console.log('⚡ [NannyInicio Realtime Broadcast] Matriz actualizada vía broadcast:', payload);
            if (window.CACHE_NINERA) window.CACHE_NINERA.servicios = null;
            clearTimeout(this._refreshTimer);
            this._refreshTimer = setTimeout(() => {
              NannyInicio.cargarServicios(true);
              if (typeof window.actualizarClientesEstimulacion === 'function') {
                window.actualizarClientesEstimulacion(true);
              }
              if (window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
                window.ClienteServicios.cargar(true);
              }
            }, 100);
          })
          .on('broadcast', { event: 'control_servicios_update' }, (payload) => {
            console.log('⚡ [NannyInicio Realtime Broadcast] Matriz actualizada vía broadcast:', payload);
            if (window.CACHE_NINERA) window.CACHE_NINERA.servicios = null;
            clearTimeout(this._refreshTimer);
            this._refreshTimer = setTimeout(() => {
              NannyInicio.cargarServicios(true);
              if (typeof window.actualizarClientesEstimulacion === 'function') {
                window.actualizarClientesEstimulacion(true);
              }
              if (window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
                window.ClienteServicios.cargar(true);
              }
            }, 100);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'control_servicios' }, (payload) => {
            console.log('⚡ [NannyInicio Realtime] Matriz actualizada:', payload.eventType);
            if (window.CACHE_NINERA) window.CACHE_NINERA.servicios = null;
            clearTimeout(this._refreshTimer);
            this._refreshTimer = setTimeout(() => {
              NannyInicio.cargarServicios(true);
              if (typeof window.actualizarClientesEstimulacion === 'function') {
                window.actualizarClientesEstimulacion(true);
              }
              if (window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
                window.ClienteServicios.cargar(true);
              }
            }, 100);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'confirmaciones_asistencia' }, (payload) => {
            console.log('⚡ [NannyInicio Realtime] Confirmación actualizada');
            if (window.CACHE_NINERA) window.CACHE_NINERA.servicios = null;
            clearTimeout(this._refreshTimer);
            this._refreshTimer = setTimeout(() => {
              NannyInicio.cargarServicios(true);
              if (window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
                window.ClienteServicios.cargar(true);
              }
            }, 100);
          })
          .subscribe();
      } catch (err) {
        console.warn('Nota activando realtime en NannyInicio:', err);
      }
    },

    /**
     * Sincroniza datos cuando la aplicación vuelve al primer plano o foco
     */
    configurarEventosVisibilidad: function () {
      if (this._eventosVisibilidadConfigurados) return;
      this._eventosVisibilidadConfigurados = true;

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && document.getElementById('vista-nanny-inicio')?.classList.contains('activa')) {
          NannyInicio.actualizarSaludo();
          NannyInicio.cargarServicios(true);
        }
      });

      window.addEventListener('focus', () => {
        if (document.getElementById('vista-nanny-inicio')?.classList.contains('activa')) {
          NannyInicio.actualizarSaludo();
          NannyInicio.cargarServicios(true);
        }
      });
    },

    /**
     * Inyecta el contenedor HTML de la vista Inicio de niñera solo si no existe en el DOM.
     */
    inyectarVista: function () {
      if (document.getElementById('vista-nanny-inicio')) return;

      const appContainer = document.getElementById('app') || document.body;
      const vistaServicios = document.getElementById('vista-cliente-servicios') || document.getElementById('vista-servicios');

      const vistaDiv = document.createElement('div');
      vistaDiv.id = 'vista-nanny-inicio';
      vistaDiv.className = 'vista';

      vistaDiv.innerHTML = `
        <div class="ci-main-content">
          <!-- 1. ENCABEZADO -->
          <header class="ci-header">
            <div class="ci-greeting-col">
              <h1 class="ci-greeting-title" id="niGreetingTitle">Hola, Nanny</h1>
              <p class="ci-greeting-sub">Todo listo para tus servicios <span class="ci-heart-emoji">🩷</span></p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="ci-tutorial-btn" type="button" aria-label="Ver Tutorial" onclick="window.OnboardingGuiado && window.OnboardingGuiado.iniciar('ninera')">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>Tutorial</span>
              </button>
              <button class="ci-bell-btn" type="button" aria-label="Notificaciones" onclick="NannyInicio.onNotificacionesClick()">
                <svg class="ci-bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="ci-bell-dot"></span>
              </button>
            </div>
          </header>

          <!-- 2. TARJETA DESTACADA HERO ("PRÓXIMO SERVICIO") -->
          <section class="ci-hero-card" id="niHeroCard">
            <div class="ci-hero-info">
              <div>
                <span class="ci-hero-tag">PRÓXIMO SERVICIO</span>
                <h2 class="ci-hero-date">Sincronizando agenda...</h2>
                <div class="ci-hero-meta">
                  <div class="ci-meta-item">
                    <svg class="ci-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Consultando horario...</span>
                  </div>
                  <div class="ci-meta-item">
                    <svg class="ci-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Cliente asignado</span>
                  </div>
                </div>
              </div>

              <div>
                <div class="ci-status-pill ci-status-confirmed" style="opacity: 0.7;">
                  <svg class="ci-status-icon-svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Cargando...</span>
                </div>
                <br>
                <button type="button" class="ci-hero-btn" onclick="NannyInicio.irVista('servicios')">
                  <span>Ver detalles</span>
                  <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <div class="ci-hero-illustration">
              <img src="assets/img/avatar/avatar_hero_servicio.png?v=9" alt="Avatar Nanny Oficial" class="ci-hero-avatar-img">
            </div>
          </section>

          <!-- 3. FILA DE MÉTRICAS RÁPIDAS (3 TARJETAS) -->
          <section class="ci-metrics-grid" id="niMetricsGrid">
            <!-- Métrica 1 -->
            <div class="ci-metric-card">
              <div class="ci-metric-icon-box pink">
                <svg class="ci-metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div class="ci-metric-text">
                <span class="ci-metric-label">Esta semana</span>
                <span class="ci-metric-value">--</span>
              </div>
            </div>

            <!-- Métrica 2 -->
            <div class="ci-metric-card ci-clickable" onclick="NannyInicio.irAConvenios('Puebla')">
              <div class="ci-metric-icon-box cyan">
                <svg class="ci-metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </div>
              <div class="ci-metric-text">
                <span class="ci-metric-label">Convenios en Puebla</span>
                <span class="ci-metric-value">-- disponibles</span>
              </div>
            </div>

            <!-- Métrica 3 -->
            <div class="ci-metric-card">
              <div class="ci-metric-icon-box green">
                <svg class="ci-metric-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="ci-metric-text">
                <span class="ci-metric-label">Semana confirmada</span>
                <span class="ci-metric-value">Verificando...</span>
              </div>
            </div>
          </section>

          <!-- 4. SECCIÓN: TUS PRÓXIMOS SERVICIOS -->
          <section>
            <div class="ci-section-header">
              <h3 class="ci-section-title">Tus próximos servicios</h3>
              <button type="button" class="ci-see-all-btn" onclick="NannyInicio.irVista('servicios')">
                <span>Ver todos</span>
                <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div class="ci-services-list" id="niServicesList">
              <div style="padding: 24px 16px; text-align: center; color: #94a3b8; font-size: 14px; background: #ffffff; border-radius: 18px; border: 1px solid #f1f5f9;">
                <span>Cargando servicios actualizados...</span>
              </div>
            </div>
          </section>

          <!-- 5. CARRETE DINÁMICO DE CONVENIOS Y BENEFICIOS EN TU CIUDAD (SWIPE) -->
          <section class="ci-convenios-carousel-section" id="niConveniosCarouselSection">
            <div class="ci-section-header" style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="ci-subheading-dot" style="background: linear-gradient(135deg, #EC4899, #8B5CF6); box-shadow: 0 0 8px rgba(236, 72, 153, 0.4);"></span>
                <h3 class="ci-section-title" id="niConveniosHeaderTitle">Convenios en Puebla</h3>
              </div>
              <button type="button" class="ci-see-all-btn" onclick="NannyInicio.irAConvenios()">
                <span>Ver todos</span>
                <svg style="width:15px;height:15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div class="ci-convenios-carousel-container" id="niConveniosCarouselContainer">
              <div class="ci-convenios-carousel" id="niConveniosCarousel">
                <div class="ci-convenios-track" id="niConveniosTrack">
                  <div class="ci-convenios-slide">
                    <div class="ci-convenios-card">
                      <div class="ci-convenio-info">
                        <div>
                          <div class="ci-convenio-badges-row">
                            <span class="ci-convenio-cat-badge">Beneficios</span>
                          </div>
                          <h4 class="ci-convenio-title">Cargando convenios...</h4>
                          <div class="ci-convenio-benefit-box">
                            <span class="ci-convenio-gift-icon">🎁</span>
                            <span class="ci-convenio-benefit-text">Descubre descuentos y beneficios exclusivos en tu ciudad.</span>
                          </div>
                        </div>
                        <div class="ci-convenio-action-row">
                          <button type="button" class="ci-convenio-btn" onclick="NannyInicio.irAConvenios()">
                            <span>Saber más</span>
                            <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                          </button>
                        </div>
                      </div>
                      <div class="ci-convenio-illustration">
                        <div class="ci-convenio-img-box">
                          <div class="ci-convenio-img-fallback">🎁</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ci-convenios-carousel-footer" id="niConveniosFooter">
                <div class="ci-convenios-footer-brand">
                  <span class="ci-convenios-sparkle-icon">✨</span>
                  <span class="ci-convenios-footer-hint">Desliza para explorar</span>
                </div>
                <div class="ci-convenios-nav-controls">
                  <button type="button" class="ci-convenios-arrow-btn" onclick="NannyInicio.anteriorConvenioSlide(true)" aria-label="Convenio anterior">
                    <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <button type="button" class="ci-convenios-arrow-btn" onclick="NannyInicio.siguienteConvenioSlide(true)" aria-label="Siguiente convenio">
                    <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      `;

      if (vistaServicios && vistaServicios.parentNode) {
        vistaServicios.parentNode.insertBefore(vistaDiv, vistaServicios);
      } else {
        appContainer.appendChild(vistaDiv);
      }
    },

    /**
     * Muestra la vista de Inicio de la niñera activándola en el DOM e integrando el fondo #FFF9FB.
     */
    mostrarVistaInicio: function () {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));

      if (typeof window.resetRadarVisual === 'function') {
        window.resetRadarVisual();
      }

      // Ocultar tarjetas legadas si estuvieran abiertas
      const svcCard = document.getElementById('svcCard');
      if (svcCard) svcCard.style.display = 'none';
      const planCard = document.getElementById('planeacionesNineraCard');
      if (planCard) planCard.style.display = 'none';
      const planSigCard = document.getElementById('planeacionesNineraCardSiguiente');
      if (planSigCard) planSigCard.style.display = 'none';
      const puntosCard = document.getElementById('puntosNineraCard');
      if (puntosCard) puntosCard.style.display = 'none';
      const panelDisp = document.getElementById('panel');
      if (panelDisp) panelDisp.style.display = 'none';
      const tablaActual = document.getElementById('tablaActualCard');
      if (tablaActual) tablaActual.style.display = 'none';
      const resCard = document.getElementById('resumenCard');
      if (resCard) resCard.style.display = 'none';

      // Activar fondo unificado #FFF9FB
      document.body.classList.remove('en-servicios', 'en-estimulacion');
      document.body.classList.add('en-nanny-inicio');
      document.body.style.backgroundColor = '#FFF9FB';
      document.documentElement.style.backgroundColor = '#FFF9FB';

      const vistaInicio = document.getElementById('vista-nanny-inicio');
      if (vistaInicio) {
        vistaInicio.classList.add('activa');
      }

      this.actualizarSaludo();
      this.cargarServicios(false);
      this.cargarActividadesSugeridas(false);
      this.cargarConveniosCiudad(false);
      this.actualizarBotonActivo('inicio');
    },

    /**
     * Personaliza el saludo con el nombre de la niñera.
     */
    actualizarSaludo: function () {
      const elGreeting = document.getElementById('niGreetingTitle');
      if (!elGreeting) return;

      let nombre = '';
      if (window.SESION && window.SESION.nombre) {
        nombre = window.SESION.nombre.trim();
      } else if (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile && window.CACHE_CLIENTE.profile.nombre) {
        nombre = window.CACHE_CLIENTE.profile.nombre.trim();
      }

      if (nombre) {
        const primerNombre = nombre.split(' ')[0];
        elGreeting.textContent = `Hola, Nanny ${primerNombre}`;
      } else {
        elGreeting.textContent = 'Hola, Nanny';
      }
    },

    /**
     * Actualiza el botón activo en la barra inferior #nav-ninera.
     */
    actualizarBotonActivo: function (nombreVista) {
      const items = document.querySelectorAll('#nav-ninera .ci-nav-item, #nav-ninera button');
      items.forEach(item => {
        item.classList.remove('active', 'activo');
      });

      let idBoton = 'nav-inicio';
      if (nombreVista === 'servicios' || nombreVista === 'serv' || nombreVista === 'cliente-servicios') idBoton = 'nav-servicios';
      else if (nombreVista === 'estimulacion') idBoton = 'nav-estimulacion';
      else if (nombreVista === 'actividades' || nombreVista === 'planeaciones' || nombreVista === 'nanny-actividades') idBoton = 'nav-actividades';
      else if (nombreVista === 'disponibilidad') idBoton = 'nav-disponibilidad';
      else if (nombreVista === 'comunidad' || nombreVista === 'articulo') idBoton = 'nav-comunidad';
      else if (nombreVista === 'perfil' || nombreVista === 'nanny-perfil' || nombreVista === 'per') idBoton = 'nav-perfil';

      const botonActivo = document.getElementById(idBoton);
      if (botonActivo) {
        botonActivo.classList.add('active', 'activo');
      }
    },

    /**
     * Manejador de evento al presionar la campana de notificaciones.
     */
    onNotificacionesClick: function () {
      const mensaje = '¡Hola! Revisa tus servicios asignados de esta semana y confirma tu asistencia con puntualidad.';
      if (typeof mostrarToast === 'function') {
        mostrarToast(mensaje, 'info');
      } else if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Notificaciones',
          text: mensaje,
          icon: 'info',
          confirmButtonColor: '#E84C9A',
          confirmButtonText: 'Entendido'
        });
      } else {
        alert(mensaje);
      }
    },

    /**
     * Navegación interna hacia otra pestaña.
     */
    irVista: function (vista) {
      if (typeof window.irVista === 'function') {
        window.irVista(vista);
      }
    },

    /**
     * Abre el modal de detalle del servicio sin redirigir a otra pestaña.
     */
    abrirDetalleServicio: function (servicioId) {
      const lista = this._servicios || window.CAL_SERVICIOS || (window.ClienteServicios && window.ClienteServicios._servicios) || [];
      const s = (typeof servicioId === 'object' && servicioId !== null)
        ? servicioId
        : (lista.find(item => item.id === servicioId) || lista.find(item => String(item.id).startsWith(String(servicioId))));

      if (s && typeof window.abrirModalServicio === 'function') {
        window.abrirModalServicio(s);
      } else if (typeof window.abrirModalServicio === 'function' && servicioId) {
        window.abrirModalServicio(servicioId);
      }
    },

    /**
     * Obtiene la ciudad de la niñera desde caché de perfil o servicios.
     */
    obtenerCiudadNinera: function (servicios = []) {
      let ciudad = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile && window.CACHE_CLIENTE.profile.ciudad) ? window.CACHE_CLIENTE.profile.ciudad : null;
      if (!ciudad) {
        try {
          const cached = JSON.parse(localStorage.getItem('nyp_profile_cache') || '{}');
          if (cached && cached.ciudad) ciudad = cached.ciudad;
        } catch (e) { }
      }
      if (!ciudad && Array.isArray(servicios) && servicios.length > 0) {
        const sConCiudad = servicios.find(s => s && s.ciudad && typeof s.ciudad === 'string' && s.ciudad.trim() !== '');
        if (sConCiudad) ciudad = sConCiudad.ciudad;
      }
      if (!ciudad) {
        ciudad = 'Puebla';
      }
      return ciudad.trim();
    },

    /**
     * Cuenta la cantidad de convenios disponibles para la ciudad de la niñera.
     */
    obtenerTotalConvenios: function (ciudad) {
      const cNorm = (ciudad || 'Puebla').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const lista = (window.Convenios && window.Convenios.estado && Array.isArray(window.Convenios.estado.datos))
        ? window.Convenios.estado.datos
        : [];
      if (lista.length > 0) {
        return lista.filter(c => ((c.ciudad || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) === cNorm).length;
      }
      return 0;
    },

    /**
     * Redirecciona a la sección de convenios de la pestaña comunidad con la ciudad preseleccionada.
     */
    irAConvenios: function (ciudadParam) {
      const c = ciudadParam || this._ciudadNinera || 'Puebla';
      if (window.Convenios) {
        window.Convenios.estado.ciudadSeleccionada = c;
        window.Convenios.estado.categoriaSeleccionada = null;
      }
      if (typeof window.irVista === 'function') {
        window.irVista('convenios');
      }
      if (window.Convenios && typeof window.Convenios.render === 'function') {
        window.Convenios.render();
      }
    },

    /**
     * Carga y renderiza los servicios de la niñera desde caché o Supabase.
     */
    cargarServicios: async function (force = false) {
      const heroEl = document.getElementById('niHeroCard');
      const metricsEl = document.getElementById('niMetricsGrid');
      const listEl = document.getElementById('niServicesList');

      try {
        let svcs = [];

        // 1. Renderizado instantáneo de caché si existe
        if (!force && window.CACHE_NINERA && Array.isArray(window.CACHE_NINERA.servicios) && window.CACHE_NINERA.servicios.length > 0) {
          svcs = window.CACHE_NINERA.servicios;
          this._servicios = svcs;
          this.renderizarDatosEnPantalla(svcs);
        }

        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client && window.SESION) {
          const hoy = new Date();
          const dOffset = (hoy.getDay() + 6) % 7;
          const lunesActualDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dOffset);

          const formatISO = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          };

          const semanasConsultar = [-2, -1, 0, 1, 2, 3].map(wOffset => {
            const d = new Date(lunesActualDate.getFullYear(), lunesActualDate.getMonth(), lunesActualDate.getDate() + (wOffset * 7));
            return formatISO(d);
          });

          let qNan = client.from('control_servicios').select('*');
          const nannyNom = (window.SESION.nombre || '').trim();
          if (nannyNom) {
            const primerNom = nannyNom.split(' ')[0];
            if (primerNom.length >= 3) {
              qNan = qNan.or(`nanny_nombre.ilike.%${nannyNom}%,nanny_nombre.ilike.%${primerNom}%`);
            } else {
              qNan = qNan.in('semana_iso', semanasConsultar);
            }
          } else {
            qNan = qNan.in('semana_iso', semanasConsultar);
          }

          const { data: filasMatriz, error: errMatriz } = await qNan;

          if (!errMatriz && Array.isArray(filasMatriz)) {
            let mapaClientes = {};
            try {
              const { data: clientesList } = await client.from('clientes').select('*');
              if (Array.isArray(clientesList)) {
                clientesList.forEach(c => {
                  const kEmail = (c.email || '').trim().toLowerCase();
                  const kNom = (c.nombre || '').trim().toLowerCase();
                  const kNomNorm = typeof normalizarTexto === 'function' ? normalizarTexto(kNom) : kNom;
                  if (kEmail) mapaClientes[kEmail] = c;
                  if (kNom) mapaClientes[kNom] = c;
                  if (kNomNorm) mapaClientes[kNomNorm] = c;
                });
              }
            } catch (eCli) {
              console.warn("Aviso cargando clientes en inicio nanny:", eCli);
            }

            svcs = typeof transformarFilasControlServicios === 'function'
              ? transformarFilasControlServicios(filasMatriz, 'nanny', window.SESION, mapaClientes)
              : [];

            if (window.CACHE_NINERA) {
              window.CACHE_NINERA.servicios = svcs;
            }
            if (typeof CAL_SERVICIOS !== 'undefined') {
              window.CAL_SERVICIOS = svcs;
            }
            if (typeof window.actualizarClientesEstimulacion === 'function') {
              window.actualizarClientesEstimulacion(true);
            }
            if (typeof window.actualizarVisibilidadPestanasNinera === 'function') {
              window.actualizarVisibilidadPestanasNinera(svcs);
            }
            if (window.ClienteServicios && typeof window.ClienteServicios.renderServiciosList === 'function') {
              window.ClienteServicios._servicios = svcs;
              window.ClienteServicios.renderMetricas();
              window.ClienteServicios.renderCalendarStrip();
              window.ClienteServicios.renderServiciosList();
              window.ClienteServicios.renderBitacora();
            }
          }
        }

        // Ordenar cronológicamente
        svcs.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));
        this._servicios = svcs;

        this.renderizarDatosEnPantalla(svcs);
      } catch (err) {
        console.error("Error al cargar servicios en inicio de niñera:", err);
      }
    },

    /**
     * Renderiza las secciones del dashboard con los servicios de la niñera
     */
    renderizarDatosEnPantalla: function (svcs) {
      const heroEl = document.getElementById('niHeroCard') || document.getElementById('ciHeroCard');
      const metricsEl = document.getElementById('niMetricsGrid') || document.getElementById('ciMetricsGrid');
      const listEl = document.getElementById('niServicesList') || document.getElementById('ciServicesList');

      try {
        const hoy = new Date();
        const dOffset = (hoy.getDay() + 6) % 7;
        const lunesActualDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dOffset);

        const formatISO = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const hoyISO = formatISO(hoy);
        const lunesActual = formatISO(lunesActualDate);
        const lunesSiguienteDate = new Date(lunesActualDate.getFullYear(), lunesActualDate.getMonth(), lunesActualDate.getDate() + 7);
        const lunesSiguiente = formatISO(lunesSiguienteDate);
        const lunesDespuesSiguienteDate = new Date(lunesActualDate.getFullYear(), lunesActualDate.getMonth(), lunesActualDate.getDate() + 14);
        const lunesDespuesSiguiente = formatISO(lunesDespuesSiguienteDate);

        // Servicios futuros a partir de hoy (para hero card)
        const serviciosFuturos = (svcs || []).filter(s => (s.fecha || '') >= hoyISO);
        const proximo = serviciosFuturos.length > 0 ? serviciosFuturos[0] : null;

        // Servicios de Esta Semana y Próxima Semana
        const serviciosEstaSemana = (svcs || []).filter(s => {
          if (s.semana_iso) return s.semana_iso === lunesActual;
          return (s.fecha || '') >= lunesActual && (s.fecha || '') < lunesSiguiente;
        });

        const serviciosProximaSemana = (svcs || []).filter(s => {
          if (s.semana_iso) return s.semana_iso === lunesSiguiente;
          return (s.fecha || '') >= lunesSiguiente && (s.fecha || '') < lunesDespuesSiguiente;
        });

        // 1. RENDER HERO CARD
        if (heroEl) {
          if (proximo) {
            const dateObj = new Date(proximo.fecha + 'T12:00:00');
            const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const diaNom = diasSemana[dateObj.getDay()] || '';
            const diaNum = String(dateObj.getDate()).padStart(2, '0');
            const mesNom = meses[dateObj.getMonth()] || '';
            const fechaFormateada = `${diaNom} ${diaNum} ${mesNom}`;

            const horarioTexto = proximo.hora_fin ? `${proximo.hora_inicio} – ${proximo.hora_fin}` : (proximo.hora_inicio || 'Horario por confirmar');
            const clienteNom = proximo.cliente || proximo.cliente_nombre || 'Cliente asignado';
            const pequeNom = proximo.peque_nombre || proximo.nombre_peque || '';
            const clienteConPeque = pequeNom ? `${clienteNom} · ${pequeNom}` : clienteNom;
            const hasFin = !!(proximo.fin_real || (proximo.estado && proximo.estado.toLowerCase() === 'completado'));
            const hasIni = !hasFin && !!(proximo.inicio_real || (proximo.estado && proximo.estado.toLowerCase() === 'en curso'));
            const isConf = !hasFin && !hasIni && !!(proximo.asistencia_confirmada || (proximo.estado && proximo.estado.toLowerCase() === 'confirmado'));

            let heroPillClass = 'ci-status-pending';
            let heroPillText = 'Pendiente';
            let heroPillIcon = `<svg class="ci-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

            if (hasFin) {
              heroPillClass = 'ci-status-completed';
              heroPillText = 'Finalizado';
              heroPillIcon = `<svg class="ci-status-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
            } else if (hasIni) {
              heroPillClass = 'ci-status-in-progress';
              heroPillText = 'Iniciado';
              heroPillIcon = `<svg class="ci-status-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>`;
            } else if (isConf) {
              heroPillClass = 'ci-status-confirmed';
              heroPillText = 'Confirmado';
              heroPillIcon = `<svg class="ci-status-icon-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
            }

            heroEl.innerHTML = `
              <div class="ci-hero-info">
                <div>
                  <span class="ci-hero-tag">PRÓXIMO SERVICIO</span>
                  <h2 class="ci-hero-date">${fechaFormateada}</h2>
                  <div class="ci-hero-meta">
                    <div class="ci-meta-item">
                      <svg class="ci-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>${horarioTexto}</span>
                    </div>
                    <div class="ci-meta-item">
                      <svg class="ci-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>${clienteConPeque}</span>
                    </div>
                    ${proximo.direccion ? `
                    <div class="ci-meta-item" style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      <svg class="ci-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>${proximo.direccion}</span>
                    </div>` : ''}
                  </div>
                </div>

                <div>
                  <div class="ci-status-pill ${heroPillClass}">
                    ${heroPillIcon}<span>${heroPillText}</span>
                  </div>
                  <br>
                  <button type="button" class="ci-hero-btn" onclick="NannyInicio.abrirDetalleServicio('${proximo.id}')">
                    <span>Ver detalles</span>
                    <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="ci-hero-illustration">
                <img src="assets/img/avatar/avatar_hero_servicio.png?v=9" alt="Avatar Nanny Oficial" class="ci-hero-avatar-img">
              </div>
            `;
          } else {
            heroEl.innerHTML = `
              <div class="ci-hero-info">
                <div>
                  <span class="ci-hero-tag">AGENDA</span>
                  <h2 class="ci-hero-date">Sin servicios asignados</h2>
                  <p style="font-size:13px; color:#64748b; margin:6px 0 0 0;">No tienes servicios programados en las próximas semanas.</p>
                </div>
                <div>
                  <button type="button" class="ci-hero-btn" onclick="NannyInicio.irVista('servicios')">
                    <span>Ver agenda</span>
                    <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="ci-hero-illustration">
                <img src="assets/img/avatar/avatar_hero_servicio.png?v=9" alt="Avatar Nanny Oficial" class="ci-hero-avatar-img">
              </div>
            `;
          }
        }

        // 2. RENDER METRICS GRID
        if (metricsEl) {
          const numServiciosSemana = serviciosEstaSemana.length;
          const estaConfirmada = numServiciosSemana > 0 && serviciosEstaSemana.every(s => !!(s.asistencia_confirmada || s.estado === 'Confirmado'));
          const ciudadNinera = this.obtenerCiudadNinera(svcs);
          const totalConvenios = this.obtenerTotalConvenios(ciudadNinera);

          metricsEl.innerHTML = `
            <div class="ci-metric-card">
              <div class="ci-metric-icon-box pink">
                <svg class="ci-metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div class="ci-metric-text">
                <span class="ci-metric-label">Esta semana</span>
                <span class="ci-metric-value">${numServiciosSemana} ${numServiciosSemana === 1 ? 'servicio' : 'servicios'}</span>
              </div>
            </div>

            <div class="ci-metric-card ci-clickable" onclick="NannyInicio.irAConvenios('${ciudadNinera}')">
              <div class="ci-metric-icon-box cyan">
                <svg class="ci-metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </div>
              <div class="ci-metric-text">
                <span class="ci-metric-label">Convenios en ${ciudadNinera}</span>
                <span class="ci-metric-value">${totalConvenios} ${totalConvenios === 1 ? 'disponible' : 'disponibles'}</span>
              </div>
            </div>

            <div class="ci-metric-card">
              <div class="ci-metric-icon-box ${estaConfirmada ? 'green' : 'amber'}">
                <svg class="ci-metric-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="ci-metric-text">
                <span class="ci-metric-label">Semana confirmada</span>
                <span class="ci-metric-value">${numServiciosSemana === 0 ? 'Sin servicios' : (estaConfirmada ? '¡Todo en orden!' : 'Pendiente')}</span>
              </div>
            </div>
          `;
        }

        // 3. RENDER PRÓXIMOS SERVICIOS LIST
        if (listEl) {
          if (serviciosEstaSemana.length === 0 && serviciosProximaSemana.length === 0) {
            listEl.innerHTML = `
              <div style="background:#ffffff; border:1px solid #f1f5f9; border-radius:18px; padding:24px 16px; text-align:center; color:#64748b;">
                <p style="font-size:14px; margin:0 0 8px 0; font-weight:600;">No tienes servicios programados en las próximas 2 semanas</p>
                <span style="font-size:12px; opacity:0.8;">Tus servicios asignados en la matriz se sincronizarán aquí automáticamente.</span>
              </div>
            `;
          } else {
            const diasCortos = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
            const mesesCortos = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
            const coloresBadge = ['pink', 'blue', 'cyan', 'amber', 'purple'];

            const renderCard = (s, idx) => {
              const dObj = new Date(s.fecha + 'T12:00:00');
              const dNom = diasCortos[dObj.getDay()] || 'DIA';
              const dNum = String(dObj.getDate()).padStart(2, '0');
              const mNom = mesesCortos[dObj.getMonth()] || '';
              const badgeColor = coloresBadge[idx % coloresBadge.length];
              const hTxt = s.hora_fin ? `${s.hora_inicio} – ${s.hora_fin}` : (s.hora_inicio || '');
              const cName = s.cliente || s.cliente_nombre || 'Cliente asignado';
              const pName = s.peque_nombre || s.nombre_peque || '';
              const displayNombre = pName ? `${cName} · ${pName}` : cName;
              const hasFin = !!(s.fin_real || (s.estado && s.estado.toLowerCase() === 'completado'));
              const hasIni = !hasFin && !!(s.inicio_real || (s.estado && s.estado.toLowerCase() === 'en curso'));
              const isConf = !hasFin && !hasIni && !!(s.asistencia_confirmada || (s.estado && s.estado.toLowerCase() === 'confirmado'));

              let cardPillClass = 'pending';
              let cardPillText = 'Pendiente';
              let cardPillIcon = `<svg class="ci-pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

              if (hasFin) {
                cardPillClass = 'completed';
                cardPillText = 'Finalizado';
                cardPillIcon = `<svg class="ci-pill-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
              } else if (hasIni) {
                cardPillClass = 'in-progress';
                cardPillText = 'Iniciado';
                cardPillIcon = `<svg class="ci-pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>`;
              } else if (isConf) {
                cardPillClass = 'confirmed';
                cardPillText = 'Confirmado';
                cardPillIcon = `<svg class="ci-pill-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
              }

              return `
                <div class="ci-service-item-card" onclick="NannyInicio.abrirDetalleServicio('${s.id}')">
                  <div class="ci-date-box ${badgeColor}">
                    <span class="ci-date-day-name">${dNom}</span>
                    <span class="ci-date-day-num">${dNum}</span>
                    <span class="ci-date-month">${mNom}</span>
                  </div>
                  <div class="ci-service-content">
                    <span class="ci-service-time">${hTxt}</span>
                    <span class="ci-service-nanny">${displayNombre}</span>
                    <div class="ci-service-pill ${cardPillClass}">
                      ${cardPillIcon}
                      <span>${cardPillText}</span>
                    </div>
                  </div>
                  <svg class="ci-service-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              `;
            };

            let html = '';

            // 1. Grupo: Esta semana
            html += `
              <div class="ci-services-subgroup">
                <div class="ci-services-subheading">
                  <div class="ci-subheading-left">
                    <span class="ci-subheading-dot pink"></span>
                    <span class="ci-subheading-title">Esta semana</span>
                  </div>
                  <span class="ci-subheading-count">${serviciosEstaSemana.length} ${serviciosEstaSemana.length === 1 ? 'servicio' : 'servicios'}</span>
                </div>
                <div class="ci-services-sublist">
                  ${serviciosEstaSemana.length > 0
                ? serviciosEstaSemana.map((s, idx) => renderCard(s, idx)).join('')
                : `<div class="ci-service-empty-mini">No tienes servicios asignados para esta semana</div>`
              }
                </div>
              </div>
            `;

            // 2. Grupo: Próxima semana
            html += `
              <div class="ci-services-subgroup" style="margin-top: 14px;">
                <div class="ci-services-subheading">
                  <div class="ci-subheading-left">
                    <span class="ci-subheading-dot cyan"></span>
                    <span class="ci-subheading-title">Próxima semana</span>
                  </div>
                  <span class="ci-subheading-count">${serviciosProximaSemana.length} ${serviciosProximaSemana.length === 1 ? 'servicio' : 'servicios'}</span>
                </div>
                <div class="ci-services-sublist">
                  ${serviciosProximaSemana.length > 0
                ? serviciosProximaSemana.map((s, idx) => renderCard(s, idx + serviciosEstaSemana.length)).join('')
                : `<div class="ci-service-empty-mini">No tienes servicios asignados para la próxima semana</div>`
              }
                </div>
              </div>
            `;

            listEl.innerHTML = html;
          }
        }
        this.cargarConveniosCiudad(false);
      } catch (err) {
        console.error("Error al cargar servicios en inicio de la niñera:", err);
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

    /* ==========================================================================
       GESTIÓN DEL CARRETE DINÁMICO DE ACTIVIDADES SUGERIDAS (5 FICHAS - 3s)
       ========================================================================== */
    _carouselIndex: 0,
    _carouselTimer: null,
    _carouselIntervalMs: 3000,
    _actividadesData: [],
    _touchStartX: 0,
    _touchEndX: 0,
    _carouselResumeTimeout: null,
    _manualPauseMs: 8000,
    _isHovered: false,

    /**
     * Carga y renderiza 5 actividades sugeridas del día para la niñera
     */
    cargarActividadesSugeridas: async function (force = false) {
      const trackEl = document.getElementById('niActivityTrack');
      const dotsEl = document.getElementById('niCarouselDots');
      const counterEl = document.getElementById('niCarouselCounter');
      if (!trackEl) return;

      try {
        let catalogo = (typeof CATALOGO_ACTIVIDADES !== 'undefined' && Array.isArray(CATALOGO_ACTIVIDADES) && CATALOGO_ACTIVIDADES.length > 0)
          ? CATALOGO_ACTIVIDADES
          : [];

        if (catalogo.length === 0) {
          const cached = localStorage.getItem('CACHE_CATALOGO_ACTIVIDADES_V1');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) catalogo = parsed;
            } catch (e) { }
          }
        }

        if (catalogo.length === 0 && typeof cargarCatalogoActividades === 'function') {
          try {
            const fetched = await cargarCatalogoActividades(false);
            if (Array.isArray(fetched) && fetched.length > 0) catalogo = fetched;
          } catch (e) { }
        }

        let seleccionadas = [];

        if (catalogo.length > 0) {
          const diaDelAnio = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
          const inicioIdx = (diaDelAnio * 5) % catalogo.length;

          for (let i = 0; i < 5 && seleccionadas.length < 5; i++) {
            const act = catalogo[(inicioIdx + i) % catalogo.length];
            if (act && !seleccionadas.some(s => s.titulo === (act.titulo || act.nombre))) {
              seleccionadas.push({
                firebaseId: act.firebaseId || '',
                titulo: act.titulo || act.nombre || `Actividad ${seleccionadas.length + 1}`,
                area: act.subareaDesarrollo || act.areaDesarrollo || act.area || 'Estimulación',
                descripcion: act.descripcion || act.objetivo || 'Actividad de estimulación integral para aplicar en servicio.',
                tiempo: act.tiempo || `${(seleccionadas.length + 1) * 5 + 5} min`,
                etapa: act.etapa || 'Estimulación Temprana'
              });
            }
          }
        }

        // Fallbacks pedagógicos de alta calidad
        if (seleccionadas.length < 5) {
          const fallbacks = [
            { titulo: "Circuito sensorial de texturas", area: "Sensorial y Vínculo", desc: "Permitir la exploración de telas suaves, toallas y superficies para potenciar la curiosidad sensorial.", tiempo: "15 min", etapa: "1 a 2 años" },
            { titulo: "Juegos de encaje y motricidad fina", area: "Motricidad Fina", desc: "Guiar el ensartado de aros o apilamiento de bloques reforzando la precisión de pinza y paciencia.", tiempo: "15 min", etapa: "2 a 3 años" },
            { titulo: "Lectura interactiva de rimas y sonidos", area: "Lenguaje y Expresión", desc: "Leer cuentos cortos imitando voces de animales e incentivando la repetición de fonemas clave.", tiempo: "10-15 min", etapa: "1 a 3 años" },
            { titulo: "Carrera suave de equilibrio y gateo", area: "Motricidad Gruesa", desc: "Colocar cojines y cintas en el piso para desarrollar la coordinación corporal y postura.", tiempo: "15-20 min", etapa: "0 a 3 años" },
            { titulo: "Juego de espejo y reconocimiento de emociones", area: "Socioemocional", desc: "Modelar expresiones alegres, de sorpresa y calma frente a un espejo generando risas y apego seguro.", tiempo: "10 min", etapa: "Todas las edades" }
          ];

          seleccionadas = fallbacks.map(item => ({
            firebaseId: '',
            titulo: item.titulo,
            area: item.area,
            descripcion: item.desc,
            tiempo: item.tiempo,
            etapa: item.etapa
          }));
        }

        this._actividadesData = seleccionadas.slice(0, 5);

        // Renderizar fichas
        trackEl.innerHTML = this._actividadesData.map((act, idx) => {
          const areaNombre = act.area || 'Estimulación';
          const tiempoTexto = act.tiempo || '10 min';
          const tituloTexto = act.titulo || `Actividad ${idx + 1}`;
          const descTexto = act.descripcion || 'Actividad sugerida para realizar durante tu servicio.';
          const fId = act.firebaseId || '';

          return `
            <div class="ci-activity-slide" data-index="${idx}">
              <div class="ci-activity-card">
                <div class="ci-activity-info">
                  <div>
                    <div class="ci-activity-badge">
                      <svg class="ci-activity-badge-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 18h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-1z"/>
                      </svg>
                      <span class="ci-badge-area-text">${areaNombre}</span>
                    </div>
                    <h4 class="ci-activity-title" title="${tituloTexto}">${tituloTexto}</h4>
                    <p class="ci-activity-desc" title="${descTexto}">${descTexto}</p>
                    <div class="ci-activity-meta-tags">
                      <span class="ci-meta-chip time">⏱️ ${tiempoTexto}</span>
                      <span class="ci-meta-chip">🎯 ${act.etapa}</span>
                    </div>
                  </div>

                  <div class="ci-activity-action-row">
                    <button type="button" class="ci-activity-btn" onclick="NannyInicio.abrirActividadEstimulacion('${fId}')">
                      <span>Ver estimulación</span>
                      <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="ci-activity-illustration ci-avatar-reserved-space">
                  <div class="ci-avatar-reserved-decor"></div>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Renderizar dots
        if (dotsEl) {
          dotsEl.innerHTML = this._actividadesData.map((_, i) => `
            <button type="button" class="ci-carousel-dot ${i === 0 ? 'active' : ''}" onclick="NannyInicio.irASlide(${i})" aria-label="Actividad ${i + 1} de 5"></button>
          `).join('');
        }

        this._carouselIndex = 0;
        this.actualizarPosicionCarrusel();
        this.iniciarCarrusel();
        this.configurarEventosCarrusel();

      } catch (err) {
        console.error("Error al cargar actividades en inicio niñera:", err);
      }
    },

    iniciarCarrusel: function () {
      if (this._carouselTimer) {
        clearInterval(this._carouselTimer);
        this._carouselTimer = null;
      }
      if (!this._actividadesData || this._actividadesData.length <= 1) return;
      this._carouselTimer = setInterval(() => {
        if (!this._isHovered && !this._carouselResumeTimeout) {
          this.siguienteSlide(false);
        }
      }, this._carouselIntervalMs);
    },

    detenerCarrusel: function () {
      if (this._carouselTimer) {
        clearInterval(this._carouselTimer);
        this._carouselTimer = null;
      }
    },

    pausarTemporalmentePorInteraccionManual: function () {
      this.detenerCarrusel();
      if (this._carouselResumeTimeout) {
        clearTimeout(this._carouselResumeTimeout);
        this._carouselResumeTimeout = null;
      }
      this._carouselResumeTimeout = setTimeout(() => {
        this._carouselResumeTimeout = null;
        if (!this._isHovered) {
          this.iniciarCarrusel();
        }
      }, this._manualPauseMs);
    },

    irASlide: function (index) {
      if (!this._actividadesData || this._actividadesData.length === 0) return;
      this._carouselIndex = (index + this._actividadesData.length) % this._actividadesData.length;
      this.actualizarPosicionCarrusel();
      this.pausarTemporalmentePorInteraccionManual();
    },

    siguienteSlide: function (esManual = true) {
      if (!this._actividadesData || this._actividadesData.length === 0) return;
      this._carouselIndex = (this._carouselIndex + 1) % this._actividadesData.length;
      this.actualizarPosicionCarrusel();
      if (esManual) {
        this.pausarTemporalmentePorInteraccionManual();
      }
    },

    anteriorSlide: function (esManual = true) {
      if (!this._actividadesData || this._actividadesData.length === 0) return;
      this._carouselIndex = (this._carouselIndex - 1 + this._actividadesData.length) % this._actividadesData.length;
      this.actualizarPosicionCarrusel();
      if (esManual) {
        this.pausarTemporalmentePorInteraccionManual();
      }
    },

    abrirActividadEstimulacion: async function (actId) {
      this.irVista('estimulacion');

      if (!actId) return;

      let intentos = 0;
      const intentarAbrir = async () => {
        intentos++;
        if (typeof window.abrirDetalleActividad === 'function') {
          if (typeof CATALOGO_ACTIVIDADES !== 'undefined' && Array.isArray(CATALOGO_ACTIVIDADES) && CATALOGO_ACTIVIDADES.length > 0) {
            const act = CATALOGO_ACTIVIDADES.find(a => a.firebaseId === actId);
            if (act) {
              window.abrirDetalleActividad(actId);
              return;
            }
          }
        }

        if (intentos < 12) {
          if (typeof cargarCatalogoActividades === 'function' && (typeof CATALOGO_ACTIVIDADES === 'undefined' || CATALOGO_ACTIVIDADES.length === 0)) {
            await cargarCatalogoActividades(false).catch(() => { });
          }
          setTimeout(intentarAbrir, 200);
        }
      };

      setTimeout(intentarAbrir, 150);
    },

    actualizarPosicionCarrusel: function () {
      const trackEl = document.getElementById('niActivityTrack');
      if (trackEl) {
        trackEl.style.transform = `translateX(-${this._carouselIndex * 100}%)`;
      }
      const dots = document.querySelectorAll('#niCarouselDots .ci-carousel-dot');
      dots.forEach((dot, idx) => {
        if (idx === this._carouselIndex) dot.classList.add('active');
        else dot.classList.remove('active');
      });
      const counterEl = document.getElementById('niCarouselCounter');
      if (counterEl && this._actividadesData.length > 0) {
        counterEl.textContent = `${this._carouselIndex + 1} / ${this._actividadesData.length}`;
      }
    },

    configurarEventosCarrusel: function () {
      const carouselContainer = document.getElementById('niActivityCarouselContainer') || document.getElementById('niActivityCarousel');
      if (!carouselContainer || carouselContainer._eventosConfigurados) return;
      carouselContainer._eventosConfigurados = true;

      const self = this;

      carouselContainer.addEventListener('mouseenter', () => {
        self._isHovered = true;
        self.detenerCarrusel();
      });

      carouselContainer.addEventListener('mouseleave', () => {
        self._isHovered = false;
        if (!self._carouselResumeTimeout) {
          self.iniciarCarrusel();
        }
      });

      const carouselTrack = document.getElementById('niActivityCarousel');
      if (carouselTrack) {
        carouselTrack.addEventListener('touchstart', (e) => {
          self._touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', (e) => {
          self._touchEndX = e.changedTouches[0].clientX;
          const diff = self._touchStartX - self._touchEndX;
          if (Math.abs(diff) > 35) {
            if (diff > 0) {
              self.siguienteSlide(true);
            } else {
              self.anteriorSlide(true);
            }
          }
        }, { passive: true });
      }
    },

    /* ==========================================================================
       GESTIÓN DEL CARRETE DINÁMICO DE CONVENIOS DE LA CIUDAD (SWIPE)
       ========================================================================== */
    _conveniosIndex: 0,
    _conveniosTimer: null,
    _conveniosIntervalMs: 3500,
    _conveniosData: [],
    _touchStartConveniosX: 0,
    _touchEndConveniosX: 0,
    _conveniosResumeTimeout: null,
    _manualConveniosPauseMs: 8000,
    _isConveniosHovered: false,
    _ciudadNinera: 'Puebla',

    /**
     * Carga y renderiza los convenios de la ciudad de la niñera en el carrusel
     */
    cargarConveniosCiudad: function (force = false) {
      const trackEl = document.getElementById('niConveniosTrack');
      const dotsEl = document.getElementById('niConveniosDots');
      const headerTitle = document.getElementById('niConveniosHeaderTitle');
      if (!trackEl) return;

      const ciudad = this.obtenerCiudadNinera(this._servicios || []);
      this._ciudadNinera = ciudad;

      if (headerTitle) {
        headerTitle.textContent = `Convenios en ${ciudad}`;
      }

      let lista = [];
      if (window.Convenios && typeof window.Convenios.obtenerConveniosPorCiudad === 'function') {
        lista = window.Convenios.obtenerConveniosPorCiudad(ciudad);
      } else if (window.Convenios && window.Convenios.estado && Array.isArray(window.Convenios.estado.datos)) {
        const cNorm = ciudad.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        lista = window.Convenios.estado.datos.filter(c => ((c.ciudad || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) === cNorm);
        if (lista.length === 0) lista = window.Convenios.estado.datos;
      }

      if (lista.length === 0) {
        trackEl.innerHTML = `
          <div class="ci-convenios-slide">
            <div class="ci-convenios-card">
              <div class="ci-convenio-info">
                <div>
                  <div class="ci-convenio-badges-row">
                    <span class="ci-convenio-cat-badge">Beneficios</span>
                  </div>
                  <h4 class="ci-convenio-title">Próximamente más convenios</h4>
                  <div class="ci-convenio-benefit-box">
                    <span class="ci-convenio-gift-icon">🎁</span>
                    <span class="ci-convenio-benefit-text">Estamos integrando nuevos convenios en ${ciudad}.</span>
                  </div>
                </div>
                <div class="ci-convenio-action-row">
                  <button type="button" class="ci-convenio-btn" onclick="NannyInicio.irAConvenios()">
                    <span>Ver todos</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        return;
      }

      this._conveniosData = lista;

      // Renderizar fichas
      trackEl.innerHTML = this._conveniosData.map((c, idx) => {
        const nombre = c.nombre || 'Aliado Estratégico';
        const categoria = c.categoria || 'Convenio';
        const imagen = c.imagen || 'assets/img/avatar/avatar_hero_servicio.png';
        const resumen = (window.Convenios && typeof window.Convenios.obtenerResumenBeneficio === 'function')
          ? window.Convenios.obtenerResumenBeneficio(c.beneficio || c.descripcion)
          : (c.beneficio ? c.beneficio.replace(/<[^>]+>/g, ' ').slice(0, 90) : 'Beneficio exclusivo para ti.');

        return `
          <div class="ci-convenios-slide" data-index="${idx}">
            <div class="ci-convenios-card">
              <div class="ci-convenio-info">
                <div>
                  <div class="ci-convenio-badges-row">
                    <span class="ci-convenio-cat-badge">${categoria}</span>
                  </div>
                  <h4 class="ci-convenio-title" title="${nombre}">${nombre}</h4>
                  <div class="ci-convenio-benefit-box">
                    <span class="ci-convenio-gift-icon">🎁</span>
                    <span class="ci-convenio-benefit-text" title="${resumen}">${resumen}</span>
                  </div>
                </div>

                <div class="ci-convenio-action-row">
                  <button type="button" class="ci-convenio-btn" onclick="window.Convenios && window.Convenios.mostrarDetalleModal(${c.id})">
                    <span>Saber más</span>
                    <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="ci-convenio-illustration" onclick="window.Convenios && window.Convenios.mostrarDetalleModal(${c.id})" style="cursor: pointer;">
                <div class="ci-convenio-img-box">
                  <img src="${imagen}" alt="${nombre}" class="ci-convenio-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                  <div class="ci-convenio-img-fallback" style="display: none;">🎁</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      this._conveniosIndex = 0;
      this.actualizarPosicionCarruselConvenios();
      this.iniciarCarruselConvenios();
      this.configurarEventosCarruselConvenios();
    },

    iniciarCarruselConvenios: function () {
      if (this._conveniosTimer) {
        clearInterval(this._conveniosTimer);
        this._conveniosTimer = null;
      }
      if (!this._conveniosData || this._conveniosData.length <= 1) return;
      this._conveniosTimer = setInterval(() => {
        if (!this._isConveniosHovered && !this._conveniosResumeTimeout) {
          this.siguienteConvenioSlide(false);
        }
      }, this._conveniosIntervalMs);
    },

    detenerCarruselConvenios: function () {
      if (this._conveniosTimer) {
        clearInterval(this._conveniosTimer);
        this._conveniosTimer = null;
      }
    },

    pausarTemporalmenteConveniosManual: function () {
      this.detenerCarruselConvenios();
      if (this._conveniosResumeTimeout) {
        clearTimeout(this._conveniosResumeTimeout);
        this._conveniosResumeTimeout = null;
      }
      this._conveniosResumeTimeout = setTimeout(() => {
        this._conveniosResumeTimeout = null;
        if (!this._isConveniosHovered) {
          this.iniciarCarruselConvenios();
        }
      }, this._manualConveniosPauseMs);
    },

    irAConvenioSlide: function (index) {
      if (!this._conveniosData || this._conveniosData.length === 0) return;
      this._conveniosIndex = (index + this._conveniosData.length) % this._conveniosData.length;
      this.actualizarPosicionCarruselConvenios();
      this.pausarTemporalmenteConveniosManual();
    },

    siguienteConvenioSlide: function (esManual = true) {
      if (!this._conveniosData || this._conveniosData.length === 0) return;
      this._conveniosIndex = (this._conveniosIndex + 1) % this._conveniosData.length;
      this.actualizarPosicionCarruselConvenios();
      if (esManual) {
        this.pausarTemporalmenteConveniosManual();
      }
    },

    anteriorConvenioSlide: function (esManual = true) {
      if (!this._conveniosData || this._conveniosData.length === 0) return;
      this._conveniosIndex = (this._conveniosIndex - 1 + this._conveniosData.length) % this._conveniosData.length;
      this.actualizarPosicionCarruselConvenios();
      if (esManual) {
        this.pausarTemporalmenteConveniosManual();
      }
    },

    actualizarPosicionCarruselConvenios: function () {
      const trackEl = document.getElementById('niConveniosTrack');
      if (trackEl) {
        trackEl.style.transform = `translateX(-${this._conveniosIndex * 100}%)`;
      }
    },

    configurarEventosCarruselConvenios: function () {
      const carouselContainer = document.getElementById('niConveniosCarouselContainer') || document.getElementById('niConveniosCarousel');
      if (!carouselContainer || carouselContainer._eventosConfigurados) return;
      carouselContainer._eventosConfigurados = true;

      const self = this;

      carouselContainer.addEventListener('mouseenter', () => {
        self._isConveniosHovered = true;
        self.detenerCarruselConvenios();
      });

      carouselContainer.addEventListener('mouseleave', () => {
        self._isConveniosHovered = false;
        if (!self._conveniosResumeTimeout) {
          self.iniciarCarruselConvenios();
        }
      });

      const carouselTrack = document.getElementById('niConveniosCarousel');
      if (carouselTrack) {
        carouselTrack.addEventListener('touchstart', (e) => {
          self._touchStartConveniosX = e.changedTouches[0].clientX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', (e) => {
          self._touchEndConveniosX = e.changedTouches[0].clientX;
          const diff = self._touchStartConveniosX - self._touchEndConveniosX;
          if (Math.abs(diff) > 35) {
            if (diff > 0) {
              self.siguienteConvenioSlide(true);
            } else {
              self.anteriorConvenioSlide(true);
            }
          }
        }, { passive: true });
      }
    }
  };

  // Exponer globalmente
  window.NannyInicio = NannyInicio;

  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      NannyInicio.init();
    });
  } else {
    NannyInicio.init();
  }
})();
