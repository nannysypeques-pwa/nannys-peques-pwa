/**
 * ============================================================================
 * MÓDULO CLIENTE: PESTAÑA "INICIO" Y "ESTIMULACIÓN"
 * Nannys y Peques - Modern UX/UI
 * Fondos unificados: #FFF9FB (Inicio) y #FAFBFD (Estimulación)
 * Prevención y eliminación estricta de doble menú y contenedores rígidos
 * ============================================================================
 */

(function () {
  'use strict';

  const ClienteInicio = {
    inicializado: false,
    _realtimeActivo: false,
    _refreshTimer: null,

    /**
     * Inicializa el módulo, inyectando la vista y configurando eventos.
     */
    init: function () {
      if (this.inicializado) return;

      this.inyectarVista();
      this.inyectarBarraNavegacion();
      this.interceptarNavegacion();
      this.interceptarLogout();
      this.activarGuardianDobleMenu();
      this.activarRealtime();
      this.inicializado = true;

      // Listener para actualización reactiva de saldo cuando Admin cambia visibilidad o matriz
      const onSaldoActualizado = () => {
        if (typeof this.actualizarSaldoDirecto === 'function') {
          this.actualizarSaldoDirecto();
        }
        if (typeof this.cargarServicios === 'function') {
          this.cargarServicios(true);
        }
      };
      window.addEventListener('nyp_saldo_cliente_actualizado', onSaldoActualizado);
      window.addEventListener('nyp_matriz_servicios_cambio', onSaldoActualizado);
      window.addEventListener('storage', (e) => {
        if (e.key && (e.key.startsWith('nyp_saldos_visibles_') || e.key.startsWith('nyp_saldos_montos_') || e.key.startsWith('nyp_saldo_activo_') || e.key.startsWith('nyp_cs_matriz_'))) {
          onSaldoActualizado();
        }
      });

      // BroadcastChannel para sincronización inter-pestañas instantánea
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('nyp_admin_sync_channel');
          bc.onmessage = (e) => {
            if (e.data && (e.data.type === 'control_servicios_update' || e.data.type === 'cambio_servicio_matriz')) {
              console.log('⚡ [ClienteInicio Sync] Actualización recibida de la matriz');
              if (window.CACHE_CLIENTE) window.CACHE_CLIENTE.servicios = null;
              this.cargarServicios(true);
            }
          };
        } catch (_) {}
      }

      const isCliente = !!(window.SESION && window.SESION.cliente) || document.body.classList.contains('cliente') || document.body.classList.contains('has-nav-cliente');
      if (isCliente) {
        this.actualizarVisibilidadBarraCliente(true);
        this.cargarServicios(true);
        const vistaActiva = document.querySelector('.vista.activa');
        if (vistaActiva) {
          const nombre = vistaActiva.id.replace('vista-', '');
          this.actualizarBotonActivo(nombre);
        }
      } else {
        this.actualizarVisibilidadBarraCliente(false);
      }

      console.log('✨ [ClienteInicio] Módulo inicializado con éxito (#FFF9FB & #FAFBFD)');
    },

    /**
     * Activa suscripción en tiempo real a cambios en control_servicios
     */
    activarRealtime: function () {
      if (this._realtimeActivo) return;
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client) return;

      try {
        this._realtimeActivo = true;
        client.channel('realtime_cliente_inicio_auto_sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'control_servicios' }, (payload) => {
            console.log('⚡ [ClienteInicio Realtime] Matriz actualizada:', payload.eventType);
            clearTimeout(this._refreshTimer);
            this._refreshTimer = setTimeout(() => {
              if (window.CACHE_CLIENTE) window.CACHE_CLIENTE.servicios = null;
              this.cargarServicios(true);
            }, 300);
          })
          .subscribe();
      } catch (err) {
        console.warn('Nota activando realtime en ClienteInicio:', err);
      }
    },

    /**
     * Inyecta el contenedor HTML de la vista Inicio si no existe.
     */
    inyectarVista: function () {
      if (document.getElementById('vista-cliente-inicio')) return;

      const appContainer = document.getElementById('app') || document.body;
      const vistaCliente = document.getElementById('vista-cliente');

      const vistaDiv = document.createElement('div');
      vistaDiv.id = 'vista-cliente-inicio';
      vistaDiv.className = 'vista';

      vistaDiv.innerHTML = `
        <div class="ci-main-content">
          <!-- 1. ENCABEZADO -->
          <header class="ci-header">
            <div class="ci-greeting-col">
              <h1 class="ci-greeting-title">Hola, querida familia</h1>
              <p class="ci-greeting-sub">Todo listo para esta semana <span class="ci-heart-emoji">🩷</span></p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="ci-tutorial-btn" type="button" aria-label="Ver Tutorial" onclick="window.OnboardingGuiado && window.OnboardingGuiado.iniciar('cliente')">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>Tutorial</span>
              </button>
              <button class="ci-bell-btn" type="button" aria-label="Notificaciones" onclick="ClienteInicio.onNotificacionesClick()">
                <svg class="ci-bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="ci-bell-dot"></span>
              </button>
            </div>
          </header>

          <!-- 2. TARJETA DESTACADA HERO ("PRÓXIMO SERVICIO") -->
          <section class="ci-hero-card" id="ciHeroCard">
            <div class="ci-hero-info">
              <div>
                <span class="ci-hero-tag">PRÓXIMO SERVICIO</span>
                <h2 class="ci-hero-date">Sincronizando servicios...</h2>
                <div class="ci-hero-meta">
                  <div class="ci-meta-item">
                    <svg class="ci-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Consultando agenda...</span>
                  </div>
                  <div class="ci-meta-item">
                    <svg class="ci-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>Nanny asignada</span>
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
                <button type="button" class="ci-hero-btn" onclick="ClienteInicio.irVista('servicios')">
                  <span>Ver detalles</span>
                  <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <div class="ci-hero-illustration">
              <img src="assets/img/avatar/avatar_hero_servicio.png?v=9" alt="Avatar Nanny con confirmación" class="ci-hero-avatar-img">
            </div>
          </section>

          <!-- 3. FILA DE MÉTRICAS RÁPIDAS (3 TARJETAS) -->
          <section class="ci-metrics-grid" id="ciMetricsGrid">
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
            <div class="ci-metric-card" id="ciCardSaldo">
              <div class="ci-metric-icon-box cyan" id="ciIconBoxSaldo">
                <svg class="ci-metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                  <circle cx="16" cy="15" r="1.5"></circle>
                </svg>
              </div>
              <div class="ci-metric-text">
                <span class="ci-metric-label">Tu saldo</span>
                <span class="ci-metric-value" id="ciMetricSaldoVal">$0.00</span>
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
              <button type="button" class="ci-see-all-btn" onclick="ClienteInicio.irVista('servicios')">
                <span>Ver todos</span>
                <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div class="ci-services-list" id="ciServicesList">
              <div style="padding: 24px 16px; text-align: center; color: #94a3b8; font-size: 14px; background: #ffffff; border-radius: 18px; border: 1px solid #f1f5f9;">
                <span>Cargando servicios actualizados...</span>
              </div>
            </div>
          </section>

          <!-- 5. CARRETE DINÁMICO DE ACTIVIDADES DEL DÍA (5 FICHAS AUTOMATIZADAS) -->
          <section class="ci-activity-carousel-container" id="ciActivityCarouselContainer">
            <div class="ci-activity-carousel" id="ciActivityCarousel">
              <div class="ci-activity-track" id="ciActivityTrack">
                <div class="ci-activity-slide">
                  <div class="ci-activity-card">
                    <div class="ci-activity-info">
                      <div>
                        <div class="ci-activity-badge">
                          <svg class="ci-activity-badge-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 18h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-1z"/>
                          </svg>
                          <span class="ci-badge-area-text">Sugerencia del día</span>
                        </div>
                        <h4 class="ci-activity-title">Cargando actividades sugeridas...</h4>
                        <p class="ci-activity-desc">Sincronizando la ruta de estimulación y desarrollo del peque...</p>
                      </div>
                      <div class="ci-activity-action-row">
                        <button type="button" class="ci-activity-btn" onclick="ClienteInicio.irVista('estimulacion')">
                          <span>Ver actividad</span>
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
              </div>
            </div>

            <div class="ci-carousel-footer" id="ciCarouselFooter">
              <div class="ci-carousel-dots" id="ciCarouselDots">
                <button type="button" class="ci-carousel-dot active" aria-label="Actividad 1"></button>
              </div>
              <div class="ci-carousel-nav-controls">
                <span class="ci-carousel-counter" id="ciCarouselCounter">1 / 5</span>
                <button type="button" class="ci-carousel-arrow-btn" onclick="ClienteInicio.anteriorSlide(true)" aria-label="Actividad anterior">
                  <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button type="button" class="ci-carousel-arrow-btn" onclick="ClienteInicio.siguienteSlide(true)" aria-label="Siguiente actividad">
                  <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
          </section>

          <!-- 6. CARRETE DINÁMICO DE CONVENIOS Y BENEFICIOS EN TU CIUDAD (SWIPE) -->
          <section class="ci-convenios-carousel-section" id="ciConveniosCarouselSection">
            <div class="ci-section-header" style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="ci-subheading-dot" style="background: linear-gradient(135deg, #EC4899, #8B5CF6); box-shadow: 0 0 8px rgba(236, 72, 153, 0.4);"></span>
                <h3 class="ci-section-title" id="ciConveniosHeaderTitle">Convenios y Beneficios</h3>
              </div>
              <button type="button" class="ci-see-all-btn" onclick="ClienteInicio.irAConvenios()">
                <span>Ver todos</span>
                <svg style="width:15px;height:15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div class="ci-convenios-carousel-container" id="ciConveniosCarouselContainer">
              <div class="ci-convenios-carousel" id="ciConveniosCarousel">
                <div class="ci-convenios-track" id="ciConveniosTrack">
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
                          <button type="button" class="ci-convenio-btn" onclick="ClienteInicio.irAConvenios()">
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

              <div class="ci-convenios-carousel-footer" id="ciConveniosFooter">
                <div class="ci-convenios-footer-brand">
                  <span class="ci-convenios-sparkle-icon">✨</span>
                  <span class="ci-convenios-footer-hint">Desliza para explorar</span>
                </div>
                <div class="ci-convenios-nav-controls">
                  <button type="button" class="ci-convenios-arrow-btn" onclick="ClienteInicio.anteriorConvenioSlide(true)" aria-label="Convenio anterior">
                    <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <button type="button" class="ci-convenios-arrow-btn" onclick="ClienteInicio.siguienteConvenioSlide(true)" aria-label="Siguiente convenio">
                    <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      `;

      if (vistaCliente && vistaCliente.parentNode) {
        vistaCliente.parentNode.insertBefore(vistaDiv, vistaCliente);
      } else {
        appContainer.appendChild(vistaDiv);
      }
    },

    /**
     * Inyecta el menú flotante exclusivo para el panel de cliente con puntas redondeadas.
     * Incluye Inicio, Servicios, Estimulación, Actividades, Comunidad y Perfil.
     */
    inyectarBarraNavegacion: function () {
      if (document.getElementById('nav-cliente')) return;

      const navCliente = document.createElement('nav');
      navCliente.id = 'nav-cliente';
      navCliente.style.display = 'none'; // Se muestra solo cuando el rol es cliente

      navCliente.innerHTML = `
        <button id="cnav-inicio" type="button" class="ci-nav-item active" onclick="ClienteInicio.irVista('inicio')">
          <svg class="ci-nav-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span class="ci-nav-label">Inicio</span>
        </button>

        <button id="cnav-servicios" type="button" class="ci-nav-item" onclick="ClienteInicio.irVista('servicios')">
          <svg class="ci-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span class="ci-nav-label">Servicios</span>
        </button>

        <button id="cnav-estimulacion" type="button" class="ci-nav-item" onclick="ClienteInicio.irVista('estimulacion')">
          <svg class="ci-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2h4"></path>
            <path d="M10 5h4"></path>
            <path d="M8 8h8a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-9a2 2 0 0 1 2-2z"></path>
            <path d="M12 12v4"></path>
            <path d="M10 14h4"></path>
          </svg>
          <span class="ci-nav-label">Estimulación</span>
        </button>

        <button id="cnav-actividades" type="button" class="ci-nav-item" onclick="ClienteInicio.irVista('actividades')">
          <svg class="ci-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="ci-nav-label">Actividades</span>
        </button>

        <button id="cnav-comunidad" type="button" class="ci-nav-item" onclick="ClienteInicio.irVista('comunidad')">
          <svg class="ci-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="ci-nav-label">Comunidad</span>
        </button>

        <button id="cnav-perfil" type="button" class="ci-nav-item" onclick="ClienteInicio.irVista('perfil')">
          <svg class="ci-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="ci-nav-label">Perfil</span>
        </button>
      `;

      const appContainer = document.getElementById('app') || document.body;
      appContainer.appendChild(navCliente);

      if (typeof window.actualizarVisibilidadPestanasCliente === 'function') {
        window.actualizarVisibilidadPestanasCliente();
      }
    },

    /**
     * Guardián activo para evitar que la barra .bottom-nav estándar se muestre simultáneamente
     */
    activarGuardianDobleMenu: function () {
      const suprimirDobleMenu = () => {
        const isCliente = !!(window.SESION && window.SESION.cliente) || document.body.classList.contains('cliente') || document.body.classList.contains('has-nav-cliente');
        if (isCliente) {
          const navDefaults = document.querySelectorAll('.bottom-nav:not(#nav-cliente)');
          navDefaults.forEach(nav => {
            if (nav.style.display !== 'none') {
              nav.style.setProperty('display', 'none', 'important');
            }
          });
          const navCliente = document.getElementById('nav-cliente');
          if (navCliente && navCliente.style.display !== 'flex') {
            navCliente.style.display = 'flex';
            navCliente.classList.add('visible');
          }
        }
      };

      // Ejecutar inmediatamente
      suprimirDobleMenu();
    },

    /**
     * Intercepta limpiamente irVista global para mantener sincronizada la navegación del cliente
     * sin alterar el código base existente ni afectar a niñeras/supervisores/admin/rh.
     */
    interceptarNavegacion: function () {
      const self = this;

      if (typeof window.irVista === 'function' && !window._irVistaOriginalNyp) {
        window._irVistaOriginalNyp = window.irVista;

        window.irVista = function (nombre, skipLogic = false) {
          const isCliente = !!(window.SESION && window.SESION.cliente);

          if (isCliente) {
            // Asegurar que la barra flotante del cliente esté visible y la predeterminada oculta
            self.actualizarVisibilidadBarraCliente(true);

            // Aterrizaje inicial en 'inicio' cuando el cliente se loguea/entra al app
            if (nombre === 'servicios' && !self._haAterrizado) {
              const onboarding = document.getElementById('cliente-onboarding');
              const enOnboarding = onboarding && onboarding.style.display === 'block';

              if (!enOnboarding) {
                self._haAterrizado = true;
                self.mostrarVistaInicio();
                self.actualizarBotonActivo('inicio');
                return;
              }
            }

            if (nombre === 'inicio' || nombre === 'cliente-inicio') {
              self._haAterrizado = true;
              self.mostrarVistaInicio();
              self.actualizarBotonActivo('inicio');
              return;
            }

            if (nombre === 'estimulacion') {
              self.mostrarVistaEstimulacion();
              window._irVistaOriginalNyp('estimulacion', skipLogic);
              self.actualizarBotonActivo('estimulacion');
              if (typeof window.animarRadarChart === 'function') {
                window.animarRadarChart();
              }
              return;
            }

            if (nombre === 'servicios' || nombre === 'serv') {
              self.mostrarVistaServicios();
              if (window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
                window.ClienteServicios.cargar(false);
              }
              window._irVistaOriginalNyp(nombre, skipLogic);
              self.actualizarBotonActivo(nombre === 'serv' ? 'serv' : 'servicios');
              return;
            }

            // Si se navega a otra vista del cliente (servicios, actividades, comunidad, perfil), limpiar fondos temáticos
            self.limpiarFondosEspeciales();

            // Ejecutar la navegación existente de la app
            window._irVistaOriginalNyp(nombre, skipLogic);

            // Actualizar el estado visual del botón del cliente
            if (nombre === 'servicios' || nombre === 'serv' || nombre === 'cliente') {
              self.actualizarBotonActivo('servicios');
            } else if (nombre === 'disponibilidad' || nombre === 'actividades-cliente' || nombre === 'actividades') {
              self.actualizarBotonActivo('actividades');
            } else if (nombre === 'comunidad' || nombre === 'articulo') {
              self.actualizarBotonActivo('comunidad');
            } else if (nombre === 'com') {
              self.actualizarBotonActivo('com');
            } else if (nombre === 'perfil') {
              self.actualizarBotonActivo('perfil');
              if (window.ClientePerfil) ClientePerfil.init();
            } else if (nombre === 'per') {
              self.actualizarBotonActivo('per');
            }
          } else {
            // Si NO es cliente, ocultar barra de cliente y dejar actuar al sistema predeterminado
            self.limpiarFondosEspeciales();
            self.actualizarVisibilidadBarraCliente(false);
            window._irVistaOriginalNyp(nombre, skipLogic);
          }
        };
      }
    },

    /**
     * Intercepta logout para ocultar la barra de cliente al salir.
     */
    interceptarLogout: function () {
      const self = this;
      const origLogout = window.logout;
      if (typeof origLogout === 'function' && !window._origLogoutNyp) {
        window._origLogoutNyp = origLogout;
        window.logout = function (...args) {
          self._haAterrizado = false;
          self.limpiarFondosEspeciales();
          self.actualizarVisibilidadBarraCliente(false);
          return window._origLogoutNyp.apply(this, args);
        };
      }
    },

    /**
     * Navegación interna invocada desde la interfaz del cliente.
     */
    irVista: function (tabName) {
      if (typeof window.irVista === 'function') {
        if (tabName === 'inicio') {
          window.irVista('inicio');
        } else if (tabName === 'servicios' || tabName === 'serv') {
          window.irVista('servicios');
        } else if (tabName === 'estimulacion') {
          window.irVista('estimulacion');
        } else if (tabName === 'actividades') {
          window.irVista('actividades');
        } else if (tabName === 'comunidad') {
          window.irVista('comunidad');
        } else if (tabName === 'perfil') {
          window.irVista('perfil');
        } else if (tabName === 'per') {
          window.irVista('per');
        }
      } else {
        console.warn('irVista no está disponible globalmente');
      }
    },

    /**
     * Abre el modal de detalle del servicio del cliente sin redirigir a otra pestaña.
     */
    abrirDetalleServicio: function (servicioId) {
      const lista = this._servicios || window.CAL_SERVICIOS || (window.ClienteServicios && window.ClienteServicios._servicios) || [];
      const s = (typeof servicioId === 'object' && servicioId !== null)
        ? servicioId
        : (lista.find(item => item.id === servicioId) || lista.find(item => String(item.id).startsWith(String(servicioId))));
      
      if (s && typeof window.mostrarDetalleServicioCliente === 'function') {
        window.mostrarDetalleServicioCliente(s);
      } else if (typeof window.mostrarDetalleServicioCliente === 'function' && servicioId) {
        window.mostrarDetalleServicioCliente(servicioId);
      }
    },

    /**
     * Muestra la vista de Inicio activándola en el DOM e integrando el fondo #FFF9FB.
     */
    mostrarVistaInicio: function () {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));

      if (typeof window.resetRadarVisual === 'function') {
        window.resetRadarVisual();
      }

      // Limpiar estimulación y activar fondo #FFF9FB
      document.body.classList.remove('en-estimulacion');
      document.body.classList.add('en-cliente-inicio');
      document.body.style.backgroundColor = '#FFF9FB';
      document.documentElement.style.backgroundColor = '#FFF9FB';

      const vistaInicio = document.getElementById('vista-cliente-inicio');
      if (vistaInicio) {
        vistaInicio.classList.add('activa');
      }

      this.cargarServicios(false);
      this.cargarActividadesSugeridas(false);
      this.cargarConveniosCiudad(false);
      this.activarGuardianDobleMenu();
    },

    /**
     * Activa el modo para la vista Estimulación integrando el fondo #FAFBFD y eliminando .container
     */
    mostrarVistaEstimulacion: function () {
      this.detenerCarrusel();
      this.detenerCarruselConvenios();
      document.body.classList.remove('en-cliente-inicio');
      document.body.classList.add('en-estimulacion');
      document.body.style.backgroundColor = '#FAFBFD';
      document.documentElement.style.backgroundColor = '#FAFBFD';

      this.activarGuardianDobleMenu();
    },

    mostrarVistaServicios: function () {
      this.detenerCarrusel();
      this.detenerCarruselConvenios();
      if (typeof window.resetRadarVisual === 'function') {
        window.resetRadarVisual();
      }
      document.body.classList.remove('en-cliente-inicio');
      document.body.classList.remove('en-estimulacion');
      document.body.classList.add('en-servicios');
      document.body.style.background = '#E0F7FA';
      document.body.style.backgroundColor = '#E0F7FA';
      document.documentElement.style.background = '#E0F7FA';
      document.documentElement.style.backgroundColor = '#E0F7FA';
      this.activarGuardianDobleMenu();
      if (window.ClienteServicios && typeof window.ClienteServicios.restaurarPosicionSemana === 'function') {
        window.ClienteServicios.restaurarPosicionSemana();
      }
    },

    /**
     * Restaura los fondos originales al salir de las pestañas especiales.
     */
    limpiarFondosEspeciales: function () {
      this.detenerCarrusel();
      this.detenerCarruselConvenios();
      if (typeof window.resetRadarVisual === 'function') {
        window.resetRadarVisual();
      }
      document.body.classList.remove('en-cliente-inicio');
      document.body.classList.remove('en-estimulacion');
      document.body.classList.remove('en-servicios');
      document.body.style.background = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.background = '';
      document.documentElement.style.backgroundColor = '';
    },

    /**
     * Actualiza visualmente qué botón del menú flotante está activo.
     */
    actualizarBotonActivo: function (nombreVista) {
      const items = document.querySelectorAll('#nav-cliente .ci-nav-item');
      items.forEach(item => item.classList.remove('active'));

      let idBoton = 'cnav-inicio';
      if (nombreVista === 'servicios' || nombreVista === 'serv') idBoton = 'cnav-servicios';
      else if (nombreVista === 'estimulacion') idBoton = 'cnav-estimulacion';
      else if (nombreVista === 'actividades' || nombreVista === 'disponibilidad' || nombreVista === 'actividades-cliente') idBoton = 'cnav-actividades';
      else if (nombreVista === 'comunidad') idBoton = 'cnav-comunidad';
      else if (nombreVista === 'perfil' || nombreVista === 'per' || nombreVista === 'cliente-perfil') idBoton = 'cnav-perfil';

      const botonActivo = document.getElementById(idBoton);
      if (botonActivo) botonActivo.classList.add('active');
    },

    /**
     * Controla la visibilidad de la barra flotante del cliente vs la general.
     */
    actualizarVisibilidadBarraCliente: function (mostrarCliente) {
      const navCliente = document.getElementById('nav-cliente');
      const navDefaults = document.querySelectorAll('.bottom-nav:not(#nav-cliente)');

      if (mostrarCliente) {
        document.body.classList.add('has-nav-cliente');
        if (navCliente) {
          navCliente.style.display = 'flex';
          navCliente.classList.add('visible');
        }
        navDefaults.forEach(nav => {
          nav.style.setProperty('display', 'none', 'important');
        });
      } else {
        document.body.classList.remove('has-nav-cliente');
        if (navCliente) {
          navCliente.style.display = 'none';
          navCliente.classList.remove('visible');
        }
        navDefaults.forEach(nav => {
          if (nav.id !== 'nav-supervision' && nav.id !== 'nav-ventas' && nav.id !== 'nav-rh') {
            nav.style.removeProperty('display');
            const isStaff = !!(window.SESION && (window.SESION.admin || window.SESION.supervision || window.SESION.rh));
            if (!isStaff) {
              nav.style.display = 'flex';
            }
          }
        });
      }
    },

    /**
     * Manejador de evento al presionar la campana de notificaciones.
     */
    onNotificacionesClick: function () {
      if (typeof mostrarToast === 'function') {
        mostrarToast('Tienes 1 notificación pendiente sobre tu próximo servicio.', 'info');
      } else if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Notificaciones',
          text: 'Tienes 1 notificación pendiente sobre tu próximo servicio.',
          icon: 'info',
          confirmButtonColor: '#E84C9A',
          confirmButtonText: 'Entendido'
        });
      } else {
        alert('Tienes 1 notificación pendiente sobre tu próximo servicio.');
      }
    },

    /**
     * Navega a una vista asegurando que módulos especializados precarguen sus datos inmediatamente.
     */
    irVista: function (vista) {
      if ((vista === 'servicios' || vista === 'serv') && window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
        window.ClienteServicios.cargar(false);
      }
      if (typeof window.irVista === 'function') {
        window.irVista(vista);
      }
    },

    /**
     * Carga y renderiza los servicios reales desde Supabase (control_servicios)
     */
    cargarServicios: async function (force = false) {
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
      if (!client || !window.SESION || !window.SESION.cliente) return;

      const heroEl = document.getElementById('ciHeroCard');
      const metricsEl = document.getElementById('ciMetricsGrid');
      const listEl = document.getElementById('ciServicesList');

      try {
        let svcs = [];

        // 1. Renderizado instantáneo de caché si existe para evitar parpadeo
        if (!force && window.CACHE_CLIENTE && Array.isArray(window.CACHE_CLIENTE.servicios) && window.CACHE_CLIENTE.servicios.length > 0) {
          svcs = window.CACHE_CLIENTE.servicios;
          this._servicios = svcs;
          this.renderizarDatosEnPantalla(svcs);
        }

        // 2. Consulta a Supabase para obtener siempre datos frescos
        const hoy = new Date();
        const dOffset = (hoy.getDay() + 6) % 7;
        const lunesActualDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dOffset);

        const formatLocalISO = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        // Rango de semanas del calendario (2 atrás, actual, 3 adelante)
        const semanasConsultar = [-2, -1, 0, 1, 2, 3].map(wOffset => {
          const d = new Date(lunesActualDate.getFullYear(), lunesActualDate.getMonth(), lunesActualDate.getDate() + (wOffset * 7));
          return formatLocalISO(d);
        });

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

        let qFilas = client
          .from('control_servicios')
          .select('*');

        const emailCli = (window.SESION?.email || '').trim().toLowerCase();
        const nomCli = (window.SESION?.nombre || '').trim().toLowerCase();
        if (emailCli && nomCli) {
          qFilas = qFilas.or(`cliente_email.ilike.${emailCli},cliente_nombre.ilike.%${nomCli}%`);
        } else if (emailCli) {
          qFilas = qFilas.ilike('cliente_email', emailCli);
        } else {
          qFilas = qFilas.in('semana_iso', semanasConsultar);
        }

        const { data: filas, error: errFilas } = await qFilas;

        if (!errFilas && Array.isArray(filas)) {
          svcs = typeof transformarFilasControlServicios === 'function'
            ? transformarFilasControlServicios(filas, 'cliente', window.SESION, mapaClientes)
            : [];

          if (typeof window.CACHE_CLIENTE !== 'undefined') {
            window.CACHE_CLIENTE.servicios = svcs;
          }
          if (window.ClienteServicios) {
            window.ClienteServicios._servicios = svcs;
            if (typeof window.ClienteServicios.renderMetricas === 'function') window.ClienteServicios.renderMetricas();
            if (typeof window.ClienteServicios.renderCalendarStrip === 'function') window.ClienteServicios.renderCalendarStrip();
            if (typeof window.ClienteServicios.renderServiciosList === 'function') window.ClienteServicios.renderServiciosList();
            if (typeof window.ClienteServicios.renderBitacora === 'function') window.ClienteServicios.renderBitacora();
          }
          if (typeof window.actualizarVisibilidadPestanasCliente === 'function') {
            window.actualizarVisibilidadPestanasCliente(svcs);
          }
        }

        // Ordenar cronológicamente
        svcs.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.hora_inicio || '').localeCompare(b.hora_inicio || ''));
        this._servicios = svcs;

        this.renderizarDatosEnPantalla(svcs);
      } catch (err) {
        console.error("Error al cargar servicios en inicio del cliente:", err);
      }
    },

    /**
     * Renderiza las secciones del dashboard con los servicios recibidos
     */
    renderizarDatosEnPantalla: function (svcs) {
      const heroEl = document.getElementById('ciHeroCard');
      const metricsEl = document.getElementById('ciMetricsGrid');
      const listEl = document.getElementById('ciServicesList');

      try {
        const hoy = new Date();
      const dOffset = (hoy.getDay() + 6) % 7;
      const lunesActualDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - dOffset);

      const formatLocalISO = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const hoyISO = formatLocalISO(hoy);
      const lunesActual = formatLocalISO(lunesActualDate);
      const lunesSiguienteDate = new Date(lunesActualDate.getFullYear(), lunesActualDate.getMonth(), lunesActualDate.getDate() + 7);
      const lunesSiguiente = formatLocalISO(lunesSiguienteDate);
      const lunesDespuesSiguienteDate = new Date(lunesActualDate.getFullYear(), lunesActualDate.getMonth(), lunesActualDate.getDate() + 14);
      const lunesDespuesSiguiente = formatLocalISO(lunesDespuesSiguienteDate);

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

      const serviciosSemanaActual = serviciosEstaSemana;

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
            const nannyNom = proximo.nombre_ninera || 'Por asignar';
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
                      <span>${nannyNom}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="ci-status-pill ${heroPillClass}">
                    ${heroPillIcon}<span>${heroPillText}</span>
                  </div>
                  <br>
                  <button type="button" class="ci-hero-btn" onclick="ClienteInicio.abrirDetalleServicio('${proximo.id}')">
                    <span>Ver detalles</span>
                    <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="ci-hero-illustration">
                <img src="assets/img/avatar/avatar_hero_servicio.png?v=9" alt="Avatar Nanny con confirmación" class="ci-hero-avatar-img">
              </div>
            `;
          } else {
            heroEl.innerHTML = `
              <div class="ci-hero-info">
                <div>
                  <span class="ci-hero-tag">SERVICIOS</span>
                  <h2 class="ci-hero-date">Sin servicios programados</h2>
                  <p style="font-size:13px; color:#64748b; margin:6px 0 0 0;">No tienes servicios activos programados en la matriz.</p>
                </div>
                <div>
                  <button type="button" class="ci-hero-btn" onclick="ClienteInicio.irVista('servicios')">
                    <span>Ver servicios</span>
                    <svg style="width:16px;height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="ci-hero-illustration">
                <img src="assets/img/avatar/avatar_hero_servicio.png?v=9" alt="Avatar Nanny" class="ci-hero-avatar-img">
              </div>
            `;
          }
        }

        // 2. RENDER METRICS GRID
        if (metricsEl) {
          const numServiciosSemana = serviciosSemanaActual.length;
          let horasTotalesSemana = 0;
          serviciosSemanaActual.forEach(s => {
            horasTotalesSemana += this.calcularHoras(s.hora_inicio, s.hora_fin);
          });
          const horasRedondeadas = Math.round(horasTotalesSemana * 10) / 10;
          const estaConfirmada = numServiciosSemana > 0 && serviciosSemanaActual.every(s => !!(s.asistencia_confirmada || s.estado === 'Confirmado'));

          const infoSaldo = this.obtenerInformacionSaldoCliente(serviciosSemanaActual);
          const saldoDisplay = infoSaldo.saldoDisplay;
          const esSaldoVisible = infoSaldo.esVisible;
          const esSaldoActivo = !!(esSaldoVisible && infoSaldo.totalSaldo > 0 && saldoDisplay !== '$0.00');

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

            <div class="ci-metric-card ${esSaldoActivo ? 'ci-metric-saldo-active' : ''}" id="ciCardSaldo">
              <div class="ci-metric-icon-box ${esSaldoActivo ? 'green' : 'cyan'}" id="ciIconBoxSaldo">
                <svg class="ci-metric-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                  <circle cx="16" cy="15" r="1.5"></circle>
                </svg>
              </div>
              <div class="ci-metric-text">
                <span class="ci-metric-label">Tu saldo</span>
                <span class="ci-metric-value" id="ciMetricSaldoVal">${saldoDisplay}</span>
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

        // 3. RENDER PRÓXIMOS SERVICIOS LIST (DIVIDIDO EN 'ESTA SEMANA' Y 'PRÓXIMA SEMANA')
        if (listEl) {
          if (serviciosEstaSemana.length === 0 && serviciosProximaSemana.length === 0) {
            listEl.innerHTML = `
              <div style="background:#ffffff; border:1px solid #f1f5f9; border-radius:18px; padding:24px 16px; text-align:center; color:#64748b;">
                <p style="font-size:14px; margin:0 0 8px 0; font-weight:600;">No tienes servicios programados en las próximas 2 semanas</p>
                <span style="font-size:12px; opacity:0.8;">Tus servicios confirmados en la matriz administrativa se sincronizarán aquí automáticamente.</span>
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
              const nName = s.nombre_ninera || 'Por asignar';
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
                <div class="ci-service-item-card" onclick="ClienteInicio.abrirDetalleServicio('${s.id}')">
                  <div class="ci-date-box ${badgeColor}">
                    <span class="ci-date-day-name">${dNom}</span>
                    <span class="ci-date-day-num">${dNum}</span>
                    <span class="ci-date-month">${mNom}</span>
                  </div>
                  <div class="ci-service-content">
                    <span class="ci-service-time">${hTxt}</span>
                    <span class="ci-service-nanny">${nName}</span>
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
                    : `<div class="ci-service-empty-mini">No tienes servicios programados para esta semana</div>`
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
                    : `<div class="ci-service-empty-mini">No tienes servicios programados para la próxima semana</div>`
                  }
                </div>
              </div>
            `;

            listEl.innerHTML = html;
          }
        }
      } catch (err) {
        console.error("Error al cargar servicios en inicio del cliente:", err);
      }
    },

    calcularHoras: function (ini, fin) {
      if (!ini || !fin) return 0;
      if (typeof window.horaStringAMinutos === 'function') {
        const m1 = window.horaStringAMinutos(ini);
        const m2 = window.horaStringAMinutos(fin);
        if (m1 !== null && m2 !== null && m2 !== m1) {
          let diff = m2 - m1;
          if (diff < 0) diff += 24 * 60;
          return diff / 60;
        }
      }
      function parseMin(s) {
        if (!s) return null;
        let str = String(s).trim();
        // Soporta formatos: "08:00 P", "8:00 PM", "08:00 A", "8:00 AM"
        const regex12 = /^(\d{1,2}):(\d{2})\s*([AP])(?:M)?$/i;
        const m12 = str.match(regex12);
        if (m12) {
          let h = parseInt(m12[1], 10);
          const min = parseInt(m12[2], 10) || 0;
          const p = m12[3].toUpperCase();
          if (p === 'P' && h < 12) h += 12;
          if (p === 'A' && h === 12) h = 0;
          return (h % 24) * 60 + min;
        }
        // Soporta formato 24h: "14:00", "09:30"
        const m24 = str.match(/^(\d{1,2}):(\d{2})$/);
        if (m24) {
          let h = parseInt(m24[1], 10);
          const min = parseInt(m24[2], 10) || 0;
          return (h % 24) * 60 + min;
        }
        return null;
      }
      const m1 = parseMin(ini);
      const m2 = parseMin(fin);
      if (m1 === null || m2 === null || m1 === m2) return 0;
      let diff = m2 - m1;
      if (diff < 0) diff += 24 * 60;
      return diff / 60;
    },

    /**
     * Resuelve de forma infalible el saldo autorizado y la visibilidad para el cliente actual
     */
    obtenerInformacionSaldoCliente: function (svcsParam) {
      let ses = window.SESION || {};
      if (!ses.email && !ses.nombre) {
        try {
          ses = JSON.parse(localStorage.getItem('nyp_sesion') || localStorage.getItem('last_login_data') || '{}');
        } catch (_) {}
      }

      let perf = (typeof CACHE_CLIENTE !== 'undefined' && CACHE_CLIENTE.profile) ? CACHE_CLIENTE.profile : {};
      if (!perf.email && !perf.nombre) {
        try {
          perf = JSON.parse(localStorage.getItem('nyp_profile_cache') || '{}');
        } catch (_) {}
      }

      // Reunir servicios relevantes para obtener alias y calcular montos
      let svcs = Array.isArray(svcsParam) ? svcsParam : [];
      if (svcs.length === 0) {
        if (this._servicios && Array.isArray(this._servicios) && this._servicios.length > 0) {
          svcs = this._servicios;
        } else if (window.CACHE_CLIENTE && Array.isArray(window.CACHE_CLIENTE.servicios) && window.CACHE_CLIENTE.servicios.length > 0) {
          svcs = window.CACHE_CLIENTE.servicios;
        } else if (window.ClienteServicios && Array.isArray(window.ClienteServicios._servicios)) {
          svcs = window.ClienteServicios._servicios;
        }
      }

      // Recopilar candidatos de identificación del cliente
      const candidateKeys = new Set();
      const addCandidate = (val) => {
        if (!val || typeof val !== 'string') return;
        const clean = val.trim().toLowerCase();
        if (!clean) return;
        candidateKeys.add(clean);
        if (clean.includes('@')) {
          candidateKeys.add(clean.split('@')[0]);
        }
        if (typeof normalizarTexto === 'function') {
          candidateKeys.add(normalizarTexto(clean));
        }
      };

      addCandidate(ses.email);
      addCandidate(ses.nombre);
      if (typeof ses.cliente === 'string') addCandidate(ses.cliente);
      addCandidate(perf.email);
      addCandidate(perf.nombre);
      addCandidate(perf.nombre_completo);

      // Extraer identificadores desde los servicios activos
      svcs.forEach(s => {
        addCandidate(s.cliente_email);
        addCandidate(s.cliente_nombre);
        addCandidate(s.cliente);
        addCandidate(s.correo_cliente);
        addCandidate(s.email);
      });

      const keysList = Array.from(candidateKeys).filter(Boolean);

      let esVisible = false;
      let isExplicitlyHidden = false;
      let totalSaldoCalc = 0;
      let totalSaldoMetadata = 0;

      // 1. Determinar visibilidad autorizada por el admin desde los servicios
      svcs.forEach(s => {
        const obs = s.observaciones || s.notas || '';
        if (s.saldo_visible === true || /<!--saldo_visible:true-->/i.test(obs)) {
          esVisible = true;
        } else if (s.saldo_visible === false || /<!--saldo_visible:false-->/i.test(obs)) {
          isExplicitlyHidden = true;
        }
        if (/<!--saldo_total:(.*?)-->/i.test(obs)) {
          const mTot = obs.match(/<!--saldo_total:(.*?)-->/i);
          if (mTot && mTot[1]) {
            const pTot = parseFloat(String(mTot[1]).replace(/[^0-9.-]+/g, ''));
            if (!isNaN(pTot) && pTot > totalSaldoMetadata) totalSaldoMetadata = pTot;
          }
        }
      });

      // Si no viene en los servicios, consultar almacenamiento local
      if (!esVisible && !isExplicitlyHidden) {
        for (const k of keysList) {
          try {
            const raw = localStorage.getItem(`nyp_saldo_activo_${k}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === 'object') {
                if (parsed.visible === true) {
                  esVisible = true;
                  if (parsed.saldo && Number(parsed.saldo) > 0 && totalSaldoMetadata === 0) {
                    totalSaldoMetadata = Number(parsed.saldo);
                  }
                  break;
                } else if (parsed.visible === false) {
                  isExplicitlyHidden = true;
                  break;
                }
              }
            }
          } catch (_) {}
        }
      }

      if (!esVisible && !isExplicitlyHidden) {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith('nyp_saldos_visibles_')) {
              const mapaVis = JSON.parse(localStorage.getItem(storageKey) || '{}');
              for (const [kCli, isVis] of Object.entries(mapaVis || {})) {
                if (isVis === true) {
                  const kLow = (kCli || '').toLowerCase().trim();
                  const kNorm = typeof normalizarTexto === 'function' ? normalizarTexto(kLow) : kLow;
                  if (keysList.some(k => k === kLow || k === kNorm || kLow.includes(k) || k.includes(kLow))) {
                    esVisible = true;
                    break;
                  }
                }
              }
              if (esVisible) break;
            }
          }
        } catch (_) {}
      }

      // 2. CÁLCULO DINÁMICO EN VIVO (Siempre sincronizado con cualquier cambio de horas/tarifas en la matriz)
      // REGLA: Exclusivamente para servicios fijos, agrupando por fila semanal de la matriz
      const filasProcesadas = new Map();

      svcs.forEach(s => {
        const bloque = (s.bloque || 'servicios_fijos').toLowerCase().replace(/\s+/g, '_');
        if (bloque === 'servicios_fijos') {
          const rowKey = s.row_id || s.id || `${s.cliente_email}_${s.cliente_nombre}`;
          if (!filasProcesadas.has(rowKey)) {
            // Revisar si esta fila específica tiene un override manual en 'saldo_cliente'
            let saldoManual = null;
            const saldoManualStr = (s.saldo_cliente !== undefined && s.saldo_cliente !== null) ? String(s.saldo_cliente).trim() : '';
            if (saldoManualStr.length > 0 && !isNaN(parseFloat(saldoManualStr.replace(/[^0-9.-]+/g, '')))) {
              saldoManual = parseFloat(saldoManualStr.replace(/[^0-9.-]+/g, ''));
            } else if (s.observaciones && typeof s.observaciones === 'string' && s.observaciones.includes('<!--saldo_cliente:')) {
              const m = s.observaciones.match(/<!--saldo_cliente:(.*?)-->/);
              if (m && m[1]) {
                const pNum = parseFloat(String(m[1]).replace(/[^0-9.-]+/g, ''));
                if (!isNaN(pNum)) saldoManual = pNum;
              }
            }

            let tarifaRaw = s.tarifa_cliente || s.cuota_cliente || s.tarifa || perf.tarifa_cliente || perf.tarifa || 0;
            let tarifaNum = parseFloat(String(tarifaRaw).replace(/[^0-9.-]+/g, '')) || 0;
            if (tarifaNum === 0 && typeof _cacheClientesCS !== 'undefined' && Array.isArray(_cacheClientesCS)) {
              const cliObj = _cacheClientesCS.find(c =>
                keysList.some(k => (c.email && c.email.toLowerCase() === k) || (c.nombre && c.nombre.toLowerCase().includes(k)))
              );
              if (cliObj) {
                tarifaNum = parseFloat(String(cliObj.tarifa_cliente || cliObj.tarifa || cliObj.cuota_cliente).replace(/[^0-9.-]+/g, '')) || 0;
              }
            }

            let extraCliMonto = 0;
            if (s.observaciones && typeof s.observaciones === 'string' && s.observaciones.includes('<!--notas_celdas:')) {
              const mNotas = s.observaciones.match(/<!--notas_celdas:(.*?)-->/);
              if (mNotas && mNotas[1]) {
                try {
                  const parsedNotas = JSON.parse(decodeURIComponent(mNotas[1]));
                  if (parsedNotas && typeof parsedNotas === 'object') {
                    Object.values(parsedNotas).forEach(n => {
                      if (n && n.hora_extra_cliente && !isNaN(Number(n.hora_extra_cliente))) {
                        extraCliMonto += Number(n.hora_extra_cliente);
                      }
                    });
                  }
                } catch (_) {}
              }
            }

            filasProcesadas.set(rowKey, {
              saldoManual: saldoManual,
              tarifa: tarifaNum,
              montoExtras: extraCliMonto,
              totalHoras: 0
            });
          }

          const itemFila = filasProcesadas.get(rowKey);
          const h = this.calcularHoras(s.hora_inicio, s.hora_fin);
          itemFila.totalHoras += h;
        }
      });

      let sumaCalculada = 0;
      filasProcesadas.forEach(fila => {
        if (fila.saldoManual !== null && fila.saldoManual !== undefined && fila.saldoManual > 0) {
          sumaCalculada += fila.saldoManual;
        } else {
          sumaCalculada += (fila.totalHoras * fila.tarifa) + (fila.montoExtras || 0);
        }
      });

      if (sumaCalculada > 0) {
        totalSaldoCalc = sumaCalculada;
      }
      // Si la suma calculada fue menor o solo cubrió extras pero el metadato exacto del admin es superior, preferir el metadato
      if (totalSaldoMetadata > 0 && (totalSaldoCalc === 0 || (totalSaldoMetadata > totalSaldoCalc && sumaCalculada <= 100))) {
        totalSaldoCalc = totalSaldoMetadata;
      }

      totalSaldoCalc = Math.round(Number(totalSaldoCalc));

      const saldoFormatted = (esVisible && totalSaldoCalc > 0)
        ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(totalSaldoCalc)
        : '$0.00';

      return {
        esVisible: esVisible,
        totalSaldo: totalSaldoCalc,
        saldoDisplay: saldoFormatted
      };
    },

    /**
     * Actualiza directamente en el DOM el saldo de la ficha 'Tu saldo'
     */
    actualizarSaldoDirecto: function () {
      const elSaldo = document.getElementById('ciMetricSaldoVal') || document.querySelector('#ciMetricsGrid .ci-metric-card:nth-child(2) .ci-metric-value');
      const cardSaldo = document.getElementById('ciCardSaldo') || elSaldo?.closest('.ci-metric-card') || document.querySelector('#ciMetricsGrid .ci-metric-card:nth-child(2)');
      const iconBoxSaldo = document.getElementById('ciIconBoxSaldo') || cardSaldo?.querySelector('.ci-metric-icon-box');
      if (!elSaldo) return;

      const info = this.obtenerInformacionSaldoCliente();
      elSaldo.textContent = info.saldoDisplay;
      const esSaldoActivo = !!(info.esVisible && info.totalSaldo > 0 && info.saldoDisplay !== '$0.00');

      if (cardSaldo) {
        if (esSaldoActivo) {
          cardSaldo.classList.add('ci-metric-saldo-active');
          if (iconBoxSaldo) {
            iconBoxSaldo.classList.remove('cyan');
            iconBoxSaldo.classList.add('green');
          }
        } else {
          cardSaldo.classList.remove('ci-metric-saldo-active');
          if (iconBoxSaldo) {
            iconBoxSaldo.classList.remove('green');
            iconBoxSaldo.classList.add('cyan');
          }
        }
      }

      // Si los servicios en memoria están vacíos, cargar de inmediato
      if (!this._servicios || this._servicios.length === 0) {
        this.cargarServicios(true);
      }
    },

    /* ==========================================================================
       GESTIÓN DEL CARRETE DINÁMICO DE ACTIVIDADES (5 FICHAS AUTOMÁTICAS - 3s)
       ========================================================================== */
    _carouselIndex: 0,
    _carouselTimer: null,
    _carouselIntervalMs: 3000,
    _actividadesData: [],
    _touchStartX: 0,
    _touchEndX: 0,

    /**
     * Carga y renderiza de manera inteligente 5 actividades sugeridas del día para el peque
     */
    cargarActividadesSugeridas: async function (force = false) {
      if (!window.SESION || !window.SESION.cliente) return;

      const container = document.getElementById('ciActivityCarouselContainer');
      if (window._clienteTieneNeuronannyValido === false) {
        if (container) container.style.display = 'none';
        return;
      } else if (container && window._clienteTieneNeuronannyValido === true) {
        container.style.display = 'block';
      }

      const trackEl = document.getElementById('ciActivityTrack');
      const dotsEl = document.getElementById('ciCarouselDots');
      const counterEl = document.getElementById('ciCarouselCounter');
      if (!trackEl) return;

      try {
        // 1. Obtener perfil del peque
        let perf = (typeof CACHE_CLIENTE !== 'undefined' && CACHE_CLIENTE.profile) ? CACHE_CLIENTE.profile : {};
        if (!perf.nombre_del_peque && !perf.peque_nombre) {
          try {
            const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
            if (client && window.SESION?.email) {
              const { data: supaCli } = await client
                .from('clientes')
                .select('*')
                .ilike('email', window.SESION.email)
                .maybeSingle();
              if (supaCli) {
                perf = { ...(perf || {}), ...supaCli };
                if (typeof CACHE_CLIENTE !== 'undefined') CACHE_CLIENTE.profile = perf;
              }
            }
          } catch (eCli) {
            console.warn("Nota recuperando perfil para actividades sugeridas:", eCli);
          }
        }

        const pequeNombre = perf.peque_nombre || perf.nombre_del_peque || 'tu peque';
        const pequeNacimiento = perf.peque_nacimiento || perf.fecha_de_nacimiento || perf.fecha_de_nacimiento_del_peque || '';

        // Calcular edad en meses y etapa
        let meses = 0;
        if (pequeNacimiento) {
          const nac = new Date(pequeNacimiento + "T12:00:00");
          if (!isNaN(nac.getTime())) {
            const hoy = new Date();
            meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth());
            if (hoy.getDate() < nac.getDate()) meses--;
            if (meses < 0) meses = 0;
          }
        }

        const mapaEtapas = {
          "0-3m": { nombre: "0 a 3 meses", label: "0 a 3 meses" },
          "4-6m": { nombre: "3 a 6 meses", label: "3 a 6 meses" },
          "7-9m": { nombre: "6 a 9 meses", label: "6 a 9 meses" },
          "10-12m": { nombre: "9 a 12 meses", label: "9 a 12 meses" },
          "13-18m": { nombre: "12 a 18 meses", label: "12 a 18 meses" },
          "19-24m": { nombre: "18 a 24 meses", label: "18 a 24 meses" },
          "25-36m": { nombre: "2 a 3 años", label: "2 a 3 años" },
          "3-4a": { nombre: "3 a 4 años", label: "3 a 4 años" },
          "4-5a": { nombre: "4 a 5 años", label: "4 a 5 años" },
          "5-6a": { nombre: "5 a 6 años", label: "5 a 6 años" }
        };

        let etapaId = "25-36m";
        if (meses <= 3) etapaId = "0-3m";
        else if (meses <= 6) etapaId = "4-6m";
        else if (meses <= 9) etapaId = "7-9m";
        else if (meses <= 12) etapaId = "10-12m";
        else if (meses <= 18) etapaId = "13-18m";
        else if (meses <= 24) etapaId = "19-24m";
        else if (meses <= 36) etapaId = "25-36m";
        else if (meses <= 48) etapaId = "3-4a";
        else if (meses <= 60) etapaId = "4-5a";
        else etapaId = "5-6a";

        const etapaHumana = mapaEtapas[etapaId]?.nombre || "Estimulación Temprana";

        // 2. Cargar o recuperar catálogo de actividades y datos de estimulación
        if (typeof initEstimulacion === 'function' && (typeof isEstimulacionInitialized === 'undefined' || !isEstimulacionInitialized)) {
          try {
            await initEstimulacion(false, true);
          } catch (eInit) {}
        }

        let catalogo = (typeof CATALOGO_ACTIVIDADES !== 'undefined' && Array.isArray(CATALOGO_ACTIVIDADES) && CATALOGO_ACTIVIDADES.length > 0)
          ? CATALOGO_ACTIVIDADES
          : [];

        if (catalogo.length === 0) {
          const cached = localStorage.getItem('CACHE_CATALOGO_ACTIVIDADES_V1');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) catalogo = parsed;
            } catch (e) {}
          }
        }

        if (catalogo.length === 0 && typeof cargarCatalogoActividades === 'function') {
          try {
            const fetched = await cargarCatalogoActividades(false, etapaHumana);
            if (Array.isArray(fetched) && fetched.length > 0) catalogo = fetched;
          } catch (e) {}
        }

        // 3. Obtener las 5 actividades programadas del día según la lógica exacta de Estimulación
        let seleccionadas = [];
        const data = (typeof window._activePequeData !== 'undefined' ? window._activePequeData : null) || (typeof _dataProgresoPeque !== 'undefined' ? _dataProgresoPeque : null);
        const hoyISO = typeof _obtenerFechaLocalISO === 'function' ? _obtenerFechaLocalISO() : (typeof _fechaSeleccionadaEst !== 'undefined' ? _fechaSeleccionadaEst : new Date().toISOString().slice(0, 10));

        let respuestasHitosParaActividades = (typeof respuestasHitos !== 'undefined' && respuestasHitos) ? { ...respuestasHitos } : {};
        let etapaIdParaActividades = (typeof activeEtapaId !== 'undefined' && activeEtapaId) ? activeEtapaId : etapaId;

        if (Object.keys(respuestasHitosParaActividades).length === 0 && data) {
          if (typeof obtenerUltimaEvaluacionRealizada === 'function') {
            const currentEtapaId = typeof obtenerEtapaId === 'function' ? obtenerEtapaId(meses) : etapaId;
            const ultimaEtapaEvaluada = obtenerUltimaEvaluacionRealizada(data, currentEtapaId);
            if (ultimaEtapaEvaluada) {
              const historial = data.historial_evaluaciones || {};
              if (historial[ultimaEtapaEvaluada]) {
                respuestasHitosParaActividades = historial[ultimaEtapaEvaluada].hitos_detalle || {};
                etapaIdParaActividades = ultimaEtapaEvaluada;
              } else if (data.etapa_actual === ultimaEtapaEvaluada) {
                respuestasHitosParaActividades = data.hitos_detalle || {};
                etapaIdParaActividades = ultimaEtapaEvaluada;
              }
            }
          }
        }

        if (Object.keys(respuestasHitosParaActividades).length > 0 && typeof obtenerActividadesSugeridasParaHito === 'function') {
          const hitosRojos = [];
          const hitosAmarillos = [];
          const hitosVerdes = [];

          Object.keys(respuestasHitosParaActividades).forEach(id => {
            const score = respuestasHitosParaActividades[id];
            if (score === 1) hitosRojos.push(id);
            else if (score <= 7) hitosAmarillos.push(id);
            else hitosVerdes.push(id);
          });

          hitosRojos.sort();
          hitosAmarillos.sort();
          hitosVerdes.sort();

          let slots = [];
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

          const hitoOffsets = {};
          for (const hId of slots) {
            let offset = 0;
            if (hitoOffsets[hId] === undefined) {
              hitoOffsets[hId] = 0;
            } else {
              hitoOffsets[hId]++;
              offset = hitoOffsets[hId];
            }
            const hitoSugs = obtenerActividadesSugeridasParaHito(hId, hoyISO, offset);
            if (hitoSugs.length > 0) {
              const act = hitoSugs[0];
              seleccionadas.push({
                firebaseId: act.firebaseId || '',
                titulo: act.titulo || act.nombre || 'Actividad de estimulación',
                area: act.subareaDesarrollo || act.areaDesarrollo || act.area || 'Estimulación',
                descripcion: act.descripcion || act.objetivo || 'Actividad programada del día según su ruta de desarrollo.',
                tiempo: act.tiempo || '10 min',
                etapa: act.etapa || etapaHumana
              });
            }
          }
        }

        // Si no hay evaluación o faltan actividades, obtener del catálogo filtrado por la etapa del peque
        if (seleccionadas.length < 5 && catalogo.length > 0) {
          const actsEtapa = catalogo.filter(a => (a.etapa || '').trim().toLowerCase() === etapaHumana.toLowerCase());
          const pool = actsEtapa.length >= 5 ? actsEtapa : catalogo;

          const diaDelAnio = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
          const inicioIdx = (diaDelAnio * 5) % pool.length;

          for (let i = 0; i < 5 && seleccionadas.length < 5; i++) {
            const act = pool[(inicioIdx + i) % pool.length];
            if (act && !seleccionadas.some(s => s.titulo === (act.titulo || act.nombre))) {
              seleccionadas.push({
                firebaseId: act.firebaseId || '',
                titulo: act.titulo || act.nombre || `Actividad ${seleccionadas.length + 1}`,
                area: act.subareaDesarrollo || act.areaDesarrollo || act.area || 'Estimulación',
                descripcion: act.descripcion || act.objetivo || 'Estimulación integral y desarrollo de habilidades.',
                tiempo: act.tiempo || `${(seleccionadas.length + 1) * 5 + 5} min`,
                etapa: act.etapa || etapaHumana
              });
            }
          }
        }

        // Fallbacks por etapa
        if (seleccionadas.length < 5) {
          const fallbacksPorEtapa = {
            "0-3m": [
              { titulo: "Seguimiento visual de contrastes", area: "Visual y Enfoque", desc: "Mover suavemente tarjetas de alto contraste negro y blanco frente al peque.", tiempo: "5-10 min" },
              { titulo: "Tummy time con caricias suaves", area: "Motricidad Gruesa", desc: "Colocar al bebé boca abajo sobre un tapete suave mientras le hablas con cariño.", tiempo: "5 min" },
              { titulo: "Sonidos de sonaja rítmica", area: "Auditiva y Atención", desc: "Hacer sonar una sonaja suavemente a cada lado para estimular su orientación.", tiempo: "5 min" },
              { titulo: "Masaje de palmas y plantas", area: "Sensorial y Vínculo", desc: "Masajear con aceite natural sus palmas y plantas de los pies para relajarlo.", tiempo: "10 min" },
              { titulo: "Balbuceos y espejo de emociones", area: "Lenguaje y Vínculo", desc: "Imitar sus sonidos sonriendo para incentivar su comunicación temprana.", tiempo: "5-10 min" }
            ],
            "4-6m": [
              { titulo: "Agarre y trasvase de sonajas", area: "Motricidad Fina", desc: "Ofrecer juguetes livianos para que practique el agarre de una mano a otra.", tiempo: "10 min" },
              { titulo: "Rodamiento guiado sobre tapete", area: "Motricidad Gruesa", desc: "Animar al peque a girar usando su juguete favorito como estímulo visual.", tiempo: "10 min" },
              { titulo: "Canciones con mímica y palmas", area: "Lenguaje y Expresión", desc: "Cantar rimas sencillas haciendo palmas y sonrisas expresivas.", tiempo: "10 min" },
              { titulo: "Exploración de texturas seguras", area: "Sensorial Táctil", desc: "Permitirle tocar telas de seda, algodón y toalla para sentir contrastes.", tiempo: "10 min" },
              { titulo: "Juego del escondite con mantita", area: "Cognitiva y Causa-Efecto", desc: "Ocultar tu rostro tras una manta y decir ¡Aquí estoy! con entusiasmo.", tiempo: "5-10 min" }
            ],
            "7-9m": [
              { titulo: "Circuito de gateo con cojines", area: "Motricidad Gruesa", desc: "Crear un camino seguro con cojines bajos para que gatee y explore.", tiempo: "15 min" },
              { titulo: "Pinza con piezas suaves", area: "Motricidad Fina", desc: "Tomar trocitos de frutas o bloques pequeños con dedo índice y pulgar.", tiempo: "10 min" },
              { titulo: "Caja mágica de objetos ocultos", area: "Cognitiva y Memoria", desc: "Ocultar un juguete bajo una toalla pequeña para que lo descubra.", tiempo: "10 min" },
              { titulo: "Charla de balbuceos y nombres", area: "Lenguaje y Comunicación", desc: "Nombrar los objetos cotidianos con entonación clara y afectuosa.", tiempo: "10 min" },
              { titulo: "Baile rítmico en brazos", area: "Socioemocional y Ritmo", desc: "Moverse al compás de música instrumental suave fortaleciendo el apego.", tiempo: "10 min" }
            ],
            "10-12m": [
              { titulo: "Primeros pasos con apoyo seguro", area: "Motricidad Gruesa", desc: "Animarle a ponerse de pie y dar pasitos sosteniéndose de un mueble bajo.", tiempo: "15 min" },
              { titulo: "Torre de vasos apilables", area: "Motricidad Fina", desc: "Encajar o apilar vasos de colores estimulando la precisión motriz.", tiempo: "10 min" },
              { titulo: "Señalar y pedir objetos", area: "Lenguaje y Comunicación", desc: "Incentivar el gesto de señalar preguntándole: ¿Dónde está el osito?", tiempo: "10 min" },
              { titulo: "Causa y efecto con pelotas", area: "Cognitiva y Lógica", desc: "Lanzar una pelota suave para observar cómo rueda y reacciona.", tiempo: "10 min" },
              { titulo: "Despedida con manitas (Adiós)", area: "Socioemocional y Social", desc: "Practicar el saludo y la despedida con gestos cariñosos.", tiempo: "5 min" }
            ],
            "13-18m": [
              { titulo: "Caminata de obstáculos divertidos", area: "Motricidad Gruesa", desc: "Caminar sorteando cojines o aros en el suelo mejorando el equilibrio.", tiempo: "15 min" },
              { titulo: "Garabateo libre con crayón grueso", area: "Creatividad y Fina", desc: "Dibujar trazos libres sobre papel grande en el suelo con crayones lavables.", tiempo: "15 min" },
              { titulo: "Lectura de cuento con animales", area: "Lenguaje e Imaginación", desc: "Leer un cuento imitando sonidos de animales (vaca, perro, pato).", tiempo: "10-15 min" },
              { titulo: "Clasificación de juguetes por tipo", area: "Cognitiva y Orden", desc: "Guardar peluches en una cesta y carritos en otra caja cantando.", tiempo: "10 min" },
              { titulo: "Abrazo musical y emociones", area: "Socioemocional", desc: "Bailar y abrazarse cuando la música se detiene reforzando la empatía.", tiempo: "10 min" }
            ],
            "19-24m": [
              { titulo: "Saltos de conejito en alfombra", area: "Motricidad Gruesa", desc: "Practicar saltos con ambos pies juntos sobre una superficie suave.", tiempo: "10-15 min" },
              { titulo: "Ensartado de aros grandes", area: "Coordinación Óculo-Manual", desc: "Insertar aros en un soporte de madera estimulando la paciencia.", tiempo: "10 min" },
              { titulo: "Construcción de frases de 2 palabras", area: "Lenguaje y Diálogo", desc: "Estimular frases como 'mamá agua' o 'más juego' en situaciones diarias.", tiempo: "10 min" },
              { titulo: "Pintura dactilar sensorial", area: "Sensorial y Creativa", desc: "Pintar con deditos sobre cartulina experimentando mezclas de colores.", tiempo: "15 min" },
              { titulo: "Juego simbólico: dar de comer al muñeco", area: "Socioemocional y Cuidado", desc: "Cuidar a un muñeco o peluche con una cuchara de juguete.", tiempo: "10-15 min" }
            ],
            "25-36m": [
              { titulo: "Circuito de equilibrio y carreras suaves", area: "Motricidad Gruesa", desc: "Caminar sobre una línea de cinta en el suelo manteniendo los brazos abiertos.", tiempo: "15 min" },
              { titulo: "Modelado con plastilina casera", area: "Motricidad Fina", desc: "Hacer bolitas, serpientes y formas con masa moldeable no tóxica.", tiempo: "15-20 min" },
              { titulo: "Clasificación por colores primarios", area: "Cognitiva y Lógica", desc: "Separar bloques rojos, azules y amarillos en recipientes correspondientes.", tiempo: "10-15 min" },
              { titulo: "Rimas cantadas y trabalenguas cortos", area: "Lenguaje y Fonética", desc: "Cantar rimas cortas pronunciando con claridad cada palabra.", tiempo: "10 min" },
              { titulo: "Mural de emociones y caritas", area: "Socioemocional", desc: "Reconocer en un espejo y en dibujos caras felices, tristes y asombradas.", tiempo: "10-15 min" }
            ],
            "3-4a": [
              { titulo: "Juego de estatuas y control corporal", area: "Motricidad y Autorregulación", desc: "Bailar con ritmo y congelarse de inmediato al parar la música.", tiempo: "15 min" },
              { titulo: "Recorte guiado con tijeras de seguridad", area: "Motricidad Fina", desc: "Cortar tiras de papel de colores siguiendo líneas rectas sencillas.", tiempo: "15 min" },
              { titulo: "Rompecabezas de 6 a 12 piezas", area: "Pensamiento Espacial", desc: "Armar puzzles reconociendo formas, esquinas y colores.", tiempo: "15 min" },
              { titulo: "Cuentacuentos: inventar el final", area: "Lenguaje y Creatividad", desc: "Escuchar una historia y proponer un final divertido con su imaginación.", tiempo: "15 min" },
              { titulo: "Juego de turnos en familia", area: "Social y Cooperación", desc: "Lanzar un dado gigante y respetar los turnos de cada participante.", tiempo: "15 min" }
            ]
          };

          const listaBase = fallbacksPorEtapa[etapaId] || fallbacksPorEtapa["25-36m"];
          seleccionadas = listaBase.map(item => ({
            firebaseId: '',
            titulo: item.titulo,
            area: item.area,
            descripcion: item.desc,
            tiempo: item.tiempo,
            etapa: etapaHumana
          }));
        }

        this._actividadesData = seleccionadas.slice(0, 5);

        // 4. Renderizar las 5 fichas en el track
        trackEl.innerHTML = this._actividadesData.map((act, idx) => {
          const areaNombre = act.area || 'Estimulación';
          const tiempoTexto = act.tiempo || '10 min';
          const tituloTexto = act.titulo || `Actividad ${idx + 1}`;
          const descTexto = act.descripcion || 'Actividad recomendada para potenciar su desarrollo infantil.';
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
                      ${pequeNombre !== 'tu peque' ? `<span class="ci-badge-peque-tag">${pequeNombre}</span>` : ''}
                    </div>
                    <h4 class="ci-activity-title" title="${tituloTexto}">${tituloTexto}</h4>
                    <p class="ci-activity-desc" title="${descTexto}">${descTexto}</p>
                    <div class="ci-activity-meta-tags">
                      <span class="ci-meta-chip time">⏱️ ${tiempoTexto}</span>
                      <span class="ci-meta-chip">🎯 ${act.etapa || etapaHumana}</span>
                    </div>
                  </div>

                  <div class="ci-activity-action-row">
                    <button type="button" class="ci-activity-btn" onclick="ClienteInicio.abrirActividadEstimulacion('${fId}')">
                      <span>Ver actividad</span>
                      <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Espacio reservado para el avatar corporativo (sin imagen por ahora) -->
                <div class="ci-activity-illustration ci-avatar-reserved-space">
                  <div class="ci-avatar-reserved-decor"></div>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // 5. Renderizar los puntos (dots)
        if (dotsEl) {
          dotsEl.innerHTML = this._actividadesData.map((_, i) => `
            <button type="button" class="ci-carousel-dot ${i === 0 ? 'active' : ''}" onclick="ClienteInicio.irASlide(${i})" aria-label="Actividad ${i + 1} de 5"></button>
          `).join('');
        }

        // 6. Configurar eventos de gestos e iniciar carrusel a 3 segundos
        this._carouselIndex = 0;
        this.actualizarPosicionCarrusel();
        this.iniciarCarrusel();
        this.configurarEventosCarrusel();

      } catch (err) {
        console.error("Error al cargar actividades sugeridas en inicio:", err);
      }
    },

    _carouselResumeTimeout: null,
    _manualPauseMs: 8000, // Pausa de 8 segundos si el usuario cambia fichas manualmente
    _isHovered: false,

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

    /**
     * Navega a la pestaña de estimulación y abre directamente la ficha/modal con el detalle de la actividad
     */
    abrirActividadEstimulacion: async function (actId) {
      // 1. Navegar a estimulación
      this.irVista('estimulacion');

      if (!actId) return;

      // 2. Esperar que se inicialice y abrir la ficha de detalle correspondiente
      const self = this;
      let intentos = 0;
      const intentarAbrir = async () => {
        intentos++;
        if (typeof window.abrirDetalleActividad === 'function') {
          // Si el catálogo de actividades ya contiene la actividad o cargó
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
            await cargarCatalogoActividades(false).catch(() => {});
          }
          setTimeout(intentarAbrir, 200);
        }
      };

      setTimeout(intentarAbrir, 150);
    },

    actualizarPosicionCarrusel: function () {
      const trackEl = document.getElementById('ciActivityTrack');
      if (trackEl) {
        trackEl.style.transform = `translateX(-${this._carouselIndex * 100}%)`;
      }
      const dots = document.querySelectorAll('#ciCarouselDots .ci-carousel-dot');
      dots.forEach((dot, idx) => {
        if (idx === this._carouselIndex) dot.classList.add('active');
        else dot.classList.remove('active');
      });
      const counterEl = document.getElementById('ciCarouselCounter');
      if (counterEl && this._actividadesData.length > 0) {
        counterEl.textContent = `${this._carouselIndex + 1} / ${this._actividadesData.length}`;
      }
    },

    configurarEventosCarrusel: function () {
      const carouselContainer = document.getElementById('ciActivityCarouselContainer') || document.getElementById('ciActivityCarousel');
      if (!carouselContainer || carouselContainer._eventosConfigurados) return;
      carouselContainer._eventosConfigurados = true;

      const self = this;

      // Hover sobre el contenedor completo
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

      // Gestos touch swipe para dispositivos móviles
      const carouselTrack = document.getElementById('ciActivityCarousel');
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
    _ciudadCliente: 'Puebla',

    /**
     * Obtiene la ciudad del cliente actual desde perfil o servicios
     */
    obtenerCiudadCliente: function (servicios = []) {
      let ciudad = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile && window.CACHE_CLIENTE.profile.ciudad) ? window.CACHE_CLIENTE.profile.ciudad : null;
      if (!ciudad && window.SESION && window.SESION.ciudad) {
        ciudad = window.SESION.ciudad;
      }
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
     * Carga y renderiza los convenios de la ciudad del cliente en el carrusel
     */
    cargarConveniosCiudad: function (force = false) {
      const trackEl = document.getElementById('ciConveniosTrack');
      const dotsEl = document.getElementById('ciConveniosDots');
      const headerTitle = document.getElementById('ciConveniosHeaderTitle');
      if (!trackEl) return;

      const ciudad = this.obtenerCiudadCliente(this._servicios || []);
      this._ciudadCliente = ciudad;

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
                    <span class="ci-convenio-benefit-text">Estamos integrando nuevos aliados estratégicos en ${ciudad}.</span>
                  </div>
                </div>
                <div class="ci-convenio-action-row">
                  <button type="button" class="ci-convenio-btn" onclick="ClienteInicio.irAConvenios()">
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
      const trackEl = document.getElementById('ciConveniosTrack');
      if (trackEl) {
        trackEl.style.transform = `translateX(-${this._conveniosIndex * 100}%)`;
      }
    },

    configurarEventosCarruselConvenios: function () {
      const carouselContainer = document.getElementById('ciConveniosCarouselContainer') || document.getElementById('ciConveniosCarousel');
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

      const carouselTrack = document.getElementById('ciConveniosCarousel');
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
    },

    /**
     * Navega a la vista general de convenios
     */
    irAConvenios: function (ciudadParam) {
      const c = ciudadParam || this._ciudadCliente || 'Puebla';
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
    }
  };

  // Exponer globalmente
  window.ClienteInicio = ClienteInicio;

  // Auto-inicializar cuando el documento esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      ClienteInicio.init();
    });
  } else {
    ClienteInicio.init();
  }
})();
