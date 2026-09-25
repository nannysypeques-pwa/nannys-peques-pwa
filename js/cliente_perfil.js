/**
 * ============================================================================
 * MÓDULO CLIENTE: PESTAÑA "PERFIL" (NUEVO DISEÑO FRONTEND FAMILIA)
 * Nannys y Peques - UI Client Profile & Edit Modal
 * ============================================================================
 */

(function () {
  'use strict';

  const ClientePerfil = {
    init: function () {
      console.log('✨ [ClientePerfil] Inicializado módulo frontend de Perfil de la familia');
      this.cargarDatos();
      this.generarQRRecomendacion();
    },

    // Cargar datos dinámicos en la vista principal vista-cliente-perfil
    cargarDatos: async function () {
      let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : null;

      let backupLS = null;
      try {
        const rawLS = localStorage.getItem('nyp_profile_cache') || localStorage.getItem('np_usuario_cliente') || localStorage.getItem('nyp_sesion');
        if (rawLS) {
          backupLS = JSON.parse(rawLS);
          if (!perf) perf = backupLS;
        }
      } catch (e) {}

      const emailSesion = (window.SESION && window.SESION.email) ? window.SESION.email : (perf && perf.email);
      const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

      if (client && emailSesion) {
        try {
          const { data: supaCliente, error: errSup } = await client
            .from('clientes')
            .select('*')
            .eq('email', emailSesion)
            .maybeSingle();

          if (!errSup && supaCliente) {
            const dirSupa = supaCliente.direccion || supaCliente.dirección;
            const ubiSupa = supaCliente.ubicacion || supaCliente.ubicación;
            const polSupa = supaCliente.politicas_contratacion || supaCliente['políticas_de_contratación'];
            const mascSupa = (supaCliente.mascotas !== undefined && supaCliente.mascotas !== null) ? supaCliente.mascotas : (supaCliente['no._de_mascotas'] || supaCliente['no. de mascotas']);
            const emergSupa = (supaCliente.emergencia !== undefined && supaCliente.emergencia !== null) ? supaCliente.emergencia : (supaCliente['no._de_emergencia'] || supaCliente['no. de emergencia']);
            const telSupa = supaCliente.telefono || supaCliente.teléfono;

            const dirFinal = dirSupa || (perf && (perf.direccion || perf.dirección)) || (backupLS && (backupLS.direccion || backupLS.dirección)) || '';
            const ubiFinal = ubiSupa || (perf && (perf.ubicacion || perf.ubicación)) || (backupLS && (backupLS.ubicacion || backupLS.ubicación)) || '';
            const polFinal = polSupa || (perf && (perf.politicas_contratacion || perf['políticas_de_contratación'] || perf.politicas || perf.politicas_aceptadas)) || (backupLS && (backupLS.politicas_contratacion || backupLS['políticas_de_contratación'] || backupLS.politicas || backupLS.politicas_aceptadas)) || '';

            perf = Object.assign({}, perf || {}, {
              email: supaCliente.email || emailSesion,
              nombre: supaCliente.nombre || (perf && perf.nombre),
              nombre_del_cliente: supaCliente.nombre || (perf && perf.nombre),
              rol: supaCliente.rol || (perf && perf.rol) || 'cliente',
              telefono: telSupa || (perf && perf.telefono),
              teléfono: telSupa || (perf && perf.telefono),
              emergencia: emergSupa || (perf && perf.emergencia),
              'no._de_emergencia': emergSupa || (perf && perf.emergencia),
              'no. de emergencia': emergSupa || (perf && perf.emergencia),
              mascotas: (mascSupa !== undefined && mascSupa !== null) ? mascSupa : (perf && perf.mascotas),
              'no._de_mascotas': (mascSupa !== undefined && mascSupa !== null) ? mascSupa : (perf && perf.mascotas),
              'no. de mascotas': (mascSupa !== undefined && mascSupa !== null) ? mascSupa : (perf && perf.mascotas),

              direccion: dirFinal,
              dirección: dirFinal,
              ubicacion: ubiFinal,
              ubicación: ubiFinal,
              politicas_contratacion: polFinal,
              'políticas_de_contratación': polFinal,
              politicas_aceptadas: polFinal,

              // Peque 1
              peque_nombre: supaCliente.peque_nombre || (perf && perf.peque_nombre),
              nombre_del_peque: supaCliente.peque_nombre || (perf && perf.peque_nombre),
              peque_nacimiento: supaCliente.peque_nacimiento || (perf && perf.peque_nacimiento),
              fecha_de_nacimiento: supaCliente.peque_nacimiento || (perf && perf.peque_nacimiento),
              peque_edad: supaCliente.peque_edad || (perf && perf.peque_edad),
              edad_del_peque: supaCliente.peque_edad || (perf && perf.peque_edad),
              alergias: supaCliente.alergias || (perf && perf.alergias),
              condicion_medica: supaCliente.condicion_medica || (perf && perf.condicion_medica),
              salud_actual: supaCliente.salud_actual || (perf && perf.salud_actual),
              preferencias: supaCliente.preferencias || (perf && perf.preferencias),

              // Peque 2
              peque_nombre_2: supaCliente.peque_nombre_2 || (perf && perf.peque_nombre_2),
              nombre_del_peque_2: supaCliente.peque_nombre_2 || (perf && perf.peque_nombre_2),
              peque_nacimiento_2: supaCliente.peque_nacimiento_2 || (perf && perf.peque_nacimiento_2),
              fecha_de_nacimiento_2: supaCliente.peque_nacimiento_2 || (perf && perf.peque_nacimiento_2),
              peque_edad_2: supaCliente.peque_edad_2 || (perf && perf.peque_edad_2),
              edad_del_peque_2: supaCliente.peque_edad_2 || (perf && perf.peque_edad_2),
              alergias_2: supaCliente.alergias_2 || (perf && perf.alergias_2),
              condicion_medica_2: supaCliente.condicion_medica_2 || (perf && perf.condicion_medica_2),
              salud_actual_2: supaCliente.salud_actual_2 || (perf && perf.salud_actual_2),
              preferencias_2: supaCliente.preferencias_2 || (perf && perf.preferencias_2),

              // Peque 3
              peque_nombre_3: supaCliente.peque_nombre_3 || (perf && perf.peque_nombre_3),
              nombre_del_peque_3: supaCliente.peque_nombre_3 || (perf && perf.peque_nombre_3),
              peque_nacimiento_3: supaCliente.peque_nacimiento_3 || (perf && perf.peque_nacimiento_3),
              fecha_de_nacimiento_3: supaCliente.peque_nacimiento_3 || (perf && perf.peque_nacimiento_3),
              peque_edad_3: supaCliente.peque_edad_3 || (perf && perf.peque_edad_3),
              edad_del_peque_3: supaCliente.peque_edad_3 || (perf && perf.peque_edad_3),
              alergias_3: supaCliente.alergias_3 || (perf && perf.alergias_3),
              condicion_medica_3: supaCliente.condicion_medica_3 || (perf && perf.condicion_medica_3),
              salud_actual_3: supaCliente.salud_actual_3 || (perf && perf.salud_actual_3),
              preferencias_3: supaCliente.preferencias_3 || (perf && perf.preferencias_3)
            });

            // Si Supabase tenía vacíos pero recuperamos de respaldo local, autoreparar en Supabase
            if ((!dirSupa && dirFinal) || (!ubiSupa && ubiFinal) || (!polSupa && polFinal)) {
              console.log('⚡ Autoreparando datos de dirección/ubicación/políticas en Supabase...');
              client.from('clientes').upsert({
                email: emailSesion,
                direccion: dirFinal,
                ubicacion: ubiFinal,
                politicas_contratacion: polFinal
              }, { onConflict: 'email' }).then(({ error: eFix }) => {
                if (eFix) console.warn('Nota autoreparando Supabase:', eFix);
                else console.log('✅ Supabase autoreparado exitosamente.');
              });
            }
          }
        } catch (eSupa) {
          console.warn('Nota consultando cliente en Supabase:', eSupa);
        }
      }

      if (!perf) perf = window.SESION || {};

      if (!window.CACHE_CLIENTE) window.CACHE_CLIENTE = {};
      window.CACHE_CLIENTE.profile = perf;
      try {
        localStorage.setItem('nyp_profile_cache', JSON.stringify(perf));
      } catch (e) {}

      this.actualizarUI(perf);
    },

    actualizarUI: function (perf) {
      if (!perf) return;

      // Nombre y Rol
      const elNombre = document.getElementById('cp-val-nombre');
      if (elNombre) elNombre.textContent = perf.nombre || perf.nombre_del_cliente || (window.SESION && window.SESION.nombre) || '—';

      const elRol = document.getElementById('cp-val-rol');
      if (elRol) {
        const mapLabels = {
          'mama': 'MAMÁ AMOROSA',
          'papa': 'PAPÁ AMOROSO',
          'Familiar': 'FAMILIAR AMOROSA'
        };
        elRol.textContent = mapLabels[perf.rol] || 'FAMILIA';
      }

      // Teléfono, Email, Dirección, Mascotas, Emergencia, Políticas
      const elTel = document.getElementById('cp-val-telefono');
      if (elTel) elTel.textContent = perf.telefono || perf.teléfono || '—';

      const elEmail = document.getElementById('cp-val-email');
      if (elEmail) elEmail.textContent = perf.email || (window.SESION && window.SESION.email) || '—';

      const elDir = document.getElementById('cp-val-direccion');
      if (elDir) {
        const dirVal = perf.direccion || perf.dirección || perf['dirección'] || '';
        elDir.textContent = dirVal || '—';
      }

      const elMasc = document.getElementById('cp-val-mascotas');
      if (elMasc) elMasc.textContent = perf.mascotas || perf['no. de mascotas'] || perf['no._de_mascotas'] || '—';

      const elEmerg = document.getElementById('cp-val-emergencia');
      if (elEmerg) elEmerg.textContent = perf.emergencia || perf['no._de_emergencia'] || perf['no. de emergencia'] || '—';

      const elPol = document.getElementById('cp-val-politicas');
      if (elPol) {
        const politicas = perf.politicas_contratacion || perf['políticas_de_contratación'] || perf.politicas || perf.politicas_aceptadas || '';
        if (politicas && politicas !== '—') {
          if (politicas.includes('/') || politicas.includes('-')) {
            try {
              const d = new Date(politicas);
              if (!isNaN(d.getTime()) && politicas.length > 10) {
                elPol.innerHTML = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}<br>${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
              } else {
                elPol.textContent = politicas;
              }
            } catch (e) {
              elPol.textContent = politicas;
            }
          } else {
            elPol.textContent = politicas;
          }
        } else {
          elPol.textContent = '—';
        }
      }

      // Ubicación link
      const elUbiLink = document.getElementById('cp-val-ubicacion-link');
      if (elUbiLink) {
        const url = perf.ubicacion || perf.ubicación || perf['ubicación'];
        if (url && (url.startsWith('http') || url.includes('.'))) {
          elUbiLink.style.display = 'inline-flex';
        } else {
          elUbiLink.style.display = 'inline-flex';
        }
      }

      // Peques rendering in cp-peques-grid
      this.renderPequesCards(perf);
    },

    abrirUbicacion: function () {
      let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : null;
      let url = perf?.ubicacion || perf?.ubicación || perf?.['ubicación'] || '';
      
      if (!url) {
        try {
          const rawLS = localStorage.getItem('nyp_profile_cache') || localStorage.getItem('nyp_sesion') || localStorage.getItem('np_usuario_cliente');
          if (rawLS) {
            const b = JSON.parse(rawLS);
            url = b.ubicacion || b.ubicación || b['ubicación'] || '';
          }
        } catch (e) {}
      }

      if (url && url.trim().startsWith('http')) {
        window.open(url.trim(), '_blank');
      } else if (url && url.trim()) {
        window.open('https://' + url.trim(), '_blank');
      } else {
        if (typeof Swal !== 'undefined') {
          Swal.fire('Ubicación', 'No se ha registrado un enlace de ubicación en Google Maps para este perfil.', 'info');
        } else {
          alert('No hay enlace de ubicación registrado.');
        }
      }
    },

    abrirCredencial: function () {
      if (typeof window.abrirCredencialCliente === 'function') {
        window.abrirCredencialCliente();
      } else if (typeof window.mostrarCredencialCliente === 'function') {
        window.mostrarCredencialCliente();
      } else {
        const modalCred = document.getElementById('modal-credencial-cliente') || document.getElementById('modalCredencial');
        if (modalCred) {
          modalCred.classList.add('activo', 'active');
          modalCred.style.display = 'flex';
        } else if (typeof Swal !== 'undefined') {
          Swal.fire('Mi Credencial', 'Visualizando credencial digital de cliente.', 'info');
        } else {
          alert('Visualizando credencial digital de cliente.');
        }
      }
    },

    renderPequesCards: function (perf) {
      const container = document.getElementById('cp-peques-grid');
      const badgeCount = document.getElementById('cp-val-peques-count');
      if (!container) return;

      const listPeques = [];

      // Peque 1
      const p1Nombre = perf.peque_nombre || perf.nombre_del_peque;
      if (p1Nombre) {
        const nac = perf.peque_nacimiento || perf.fecha_de_nacimiento;
        const edadStr = typeof window.calcularEdadPeque === 'function' && nac
          ? (window.calcularEdadPeque(nac) || perf.peque_edad || perf.edad_del_peque || '—')
          : (perf.peque_edad || perf.edad_del_peque || '—');

        listPeques.push({
          num: 1,
          nombre: p1Nombre,
          nacimiento: nac ? this.formatearFechaElegante(nac) : '—',
          edad: edadStr,
          alergias: perf.alergias || 'Ninguna',
          condicion: perf.condicion_medica || perf['condición_médica_o_especificaciones_adicionales'] || perf.condicion || 'Ninguna',
          salud: perf.salud_actual || perf.estado_de_salud_actual || perf.estado_de_sal_actual || perf.salud || 'Excelente',
          preferencias: perf.preferencias || perf.preferencias_o_actividades_favoritas || '—',
          avatarClass: 'boy'
        });
      }

      // Peque 2
      const p2Nombre = perf.peque_nombre_2 || perf.nombre_del_peque_2;
      if (p2Nombre) {
        const nac = perf.peque_nacimiento_2 || perf.fecha_de_nacimiento_2 || perf.peque_nac_2;
        const edadStr = typeof window.calcularEdadPeque === 'function' && nac
          ? (window.calcularEdadPeque(nac) || perf.peque_edad_2 || perf.edad_del_peque_2 || '—')
          : (perf.peque_edad_2 || perf.edad_del_peque_2 || '—');

        listPeques.push({
          num: 2,
          nombre: p2Nombre,
          nacimiento: nac ? this.formatearFechaElegante(nac) : '—',
          edad: edadStr,
          alergias: perf.alergias_2 || 'Ninguna',
          condicion: perf.condicion_medica_2 || perf['condición_médica_o_especificaciones_adicionales_2'] || perf.condicion_2 || 'Ninguna',
          salud: perf.salud_actual_2 || perf.estado_de_salud_actual_2 || perf.salud_2 || 'Excelente',
          preferencias: perf.preferencias_2 || perf.preferencias_o_actividades_favoritas_2 || '—',
          avatarClass: 'girl'
        });
      }

      // Peque 3
      const p3Nombre = perf.peque_nombre_3 || perf.nombre_del_peque_3;
      if (p3Nombre) {
        const nac = perf.peque_nacimiento_3 || perf.fecha_de_nacimiento_3 || perf.peque_nac_3;
        const edadStr = typeof window.calcularEdadPeque === 'function' && nac
          ? (window.calcularEdadPeque(nac) || perf.peque_edad_3 || perf.edad_del_peque_3 || '—')
          : (perf.peque_edad_3 || perf.edad_del_peque_3 || '—');

        listPeques.push({
          num: 3,
          nombre: p3Nombre,
          nacimiento: nac ? this.formatearFechaElegante(nac) : '—',
          edad: edadStr,
          alergias: perf.alergias_3 || 'Ninguna',
          condicion: perf.condicion_medica_3 || perf['condición_médica_o_especificaciones_adicionales_3'] || perf.condicion_3 || 'Ninguna',
          salud: perf.salud_actual_3 || perf.estado_de_salud_actual_3 || perf.salud_3 || 'Excelente',
          preferencias: perf.preferencias_3 || perf.preferencias_o_actividades_favoritas_3 || '—',
          avatarClass: 'boy'
        });
      }

      // Actualizar contador en badge header
      if (badgeCount) {
        const count = listPeques.length;
        badgeCount.textContent = count === 1 ? '1 peque' : `${count} peques`;
      }

      if (listPeques.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #64748B; font-size: 13px; grid-column: 1 / -1;">
            No hay información de peques registrada. Haz clic en "Editar perfil" para agregar a tus peques.
          </div>
        `;
        return;
      }

      container.innerHTML = listPeques.map(p => `
        <div class="cp-peque-card">
          <div class="cp-peque-header">
            <div class="cp-peque-avatar ${p.avatarClass}">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <circle cx="12" cy="7.8" r="3.8" />
                <path d="M12 3c-2.3 0-3.9 1.4-4.3 3.3 1-.3 2.1-.5 3.2-.5 2 0 3.7.6 4.7 1.6.2-.5.4-1.1.4-1.7 0-1.8-1.8-3.3-4-3.3z" />
                <path d="M17.2 19v-1.2c0-2.2-2.3-3.6-5.2-3.6s-5.2 1.4-5.2 3.6V19c1.5.7 3.2 1 5.2 1s3.7-.3 5.2-1z" />
              </svg>
            </div>
            <div class="cp-peque-info">
              <div class="cp-peque-name">${this.escapeHTML(p.nombre)}</div>
              <div class="cp-peque-date">${this.escapeHTML(p.nacimiento)}</div>
            </div>
            <span class="cp-peque-age-badge">${this.escapeHTML(p.edad)}</span>
          </div>
          <div class="cp-peque-rows">
            <div class="cp-peque-row">
              <span class="cp-peque-label">Alergias:</span>
              <span class="cp-peque-val">${this.escapeHTML(p.alergias)}</span>
            </div>
            <div class="cp-peque-row">
              <span class="cp-peque-label">Condición:</span>
              <span class="cp-peque-val">${this.escapeHTML(p.condicion)}</span>
            </div>
            <div class="cp-peque-row">
              <span class="cp-peque-label">Salud actual:</span>
              <span class="cp-peque-val">${this.escapeHTML(p.salud)}</span>
            </div>
            <div class="cp-peque-row">
              <span class="cp-peque-label">Preferencias:</span>
              <span class="cp-peque-val">${this.escapeHTML(p.preferencias)}</span>
            </div>
          </div>
        </div>
      `).join('');
    },

    formatearFechaElegante: function (fechaStr) {
      if (!fechaStr) return '—';
      try {
        const partes = fechaStr.split('-');
        if (partes.length === 3) {
          const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          const dia = parseInt(partes[2], 10);
          const mes = meses[parseInt(partes[1], 10) - 1];
          const anio = partes[0];
          return `${dia} de ${mes} de ${anio}`;
        }
        return fechaStr;
      } catch (e) {
        return fechaStr;
      }
    },

    escapeHTML: function (str) {
      if (typeof str !== 'string') return str || '—';
      return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    },

    generarQRRecomendacion: function () {
      const container = document.getElementById('cp-qr-target');
      if (!container) return;

      let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : null;
      let nombreUsuario = (perf && (perf.nombre || perf.nombre_del_cliente)) ? (perf.nombre || perf.nombre_del_cliente).trim() : '';
      if (!nombreUsuario && window.SESION && window.SESION.nombre) {
        nombreUsuario = window.SESION.nombre.trim();
      }

      const msg = nombreUsuario
        ? `Hola, ${nombreUsuario} me recomendó sus servicios y me gustaría saber más al respecto`
        : `Hola, me recomendaron sus servicios y me gustaría saber más al respecto`;
      const phone = '522224021886';
      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

      if (typeof QRCode !== 'undefined') {
        try {
          container.innerHTML = '';
          new QRCode(container, {
            text: waLink,
            width: 170,
            height: 170,
            colorDark: '#0F172A',
            colorLight: '#FFFFFF',
            correctLevel: QRCode.CorrectLevel.M
          });
        } catch (e) {
          console.warn('No se pudo generar QR dinámico:', e);
          container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(waLink)}" alt="Código QR" style="width:170px; height:170px; border-radius:12px;">`;
        }
      } else {
        container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(waLink)}" alt="Código QR" style="width:170px; height:170px; border-radius:12px;">`;
      }
    },

    editarPerfil: function () {
      this.abrirModalEditar();
    },

    abrirModalEditar: async function () {
      const modal = document.getElementById('cp-modal-editar-perfil');
      if (!modal) return;

      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }

      let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : null;

      // Sincronizar datos frescos desde Supabase 'clientes'
      try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        const emailSesion = (window.SESION && window.SESION.email) ? window.SESION.email : (perf && perf.email);

        if (client && emailSesion) {
          const { data: supaCliente } = await client
            .from('clientes')
            .select('*')
            .eq('email', emailSesion)
            .maybeSingle();

          if (supaCliente) {
            perf = Object.assign({}, perf || {}, {
              nombre: supaCliente.nombre || (perf && perf.nombre),
              nombre_del_cliente: supaCliente.nombre || (perf && perf.nombre),
              email: supaCliente.email || emailSesion,
              telefono: supaCliente.telefono || (perf && perf.telefono),
              emergencia: supaCliente.emergencia || (perf && perf.emergencia),
              mascotas: supaCliente.mascotas || (perf && perf.mascotas),
              direccion: supaCliente.direccion || (perf && perf.direccion),
              ubicacion: supaCliente.ubicacion || (perf && perf.ubicacion),
              politicas_contratacion: supaCliente.politicas_contratacion || (perf && perf.politicas_contratacion),

              // Peque 1
              peque_nombre: supaCliente.peque_nombre || (perf && perf.peque_nombre),
              peque_nacimiento: supaCliente.peque_nacimiento || (perf && perf.peque_nacimiento),
              alergias: supaCliente.alergias || (perf && perf.alergias),
              condicion_medica: supaCliente.condicion_medica || (perf && perf.condicion_medica),
              salud_actual: supaCliente.salud_actual || (perf && perf.salud_actual),
              preferencias: supaCliente.preferencias || (perf && perf.preferencias),

              // Peque 2
              peque_nombre_2: supaCliente.peque_nombre_2 || (perf && perf.peque_nombre_2),
              peque_nacimiento_2: supaCliente.peque_nacimiento_2 || (perf && perf.peque_nacimiento_2),
              alergias_2: supaCliente.alergias_2 || (perf && perf.alergias_2),
              condicion_medica_2: supaCliente.condicion_medica_2 || (perf && perf.condicion_medica_2),
              salud_actual_2: supaCliente.salud_actual_2 || (perf && perf.salud_actual_2),
              preferencias_2: supaCliente.preferencias_2 || (perf && perf.preferencias_2),

              // Peque 3
              peque_nombre_3: supaCliente.peque_nombre_3 || (perf && perf.peque_nombre_3),
              peque_nacimiento_3: supaCliente.peque_nacimiento_3 || (perf && perf.peque_nacimiento_3),
              alergias_3: supaCliente.alergias_3 || (perf && perf.alergias_3),
              condicion_medica_3: supaCliente.condicion_medica_3 || (perf && perf.condicion_medica_3),
              salud_actual_3: supaCliente.salud_actual_3 || (perf && perf.salud_actual_3),
              preferencias_3: supaCliente.preferencias_3 || (perf && perf.preferencias_3)
            });
            if (window.CACHE_CLIENTE) window.CACHE_CLIENTE.profile = perf;
          }
        }
      } catch (e) {
        console.warn('Nota obteniendo datos de cliente para modal:', e);
      }

      // Popular Campos Readonly (No editables)
      let rawBackup = null;
      try {
        const raw = localStorage.getItem('nyp_profile_cache') || localStorage.getItem('nyp_sesion') || localStorage.getItem('np_usuario_cliente');
        if (raw) rawBackup = JSON.parse(raw);
      } catch (e) {}

      const nombreFinal = (perf && (perf.nombre || perf.nombre_del_cliente)) ? (perf.nombre || perf.nombre_del_cliente) : (rawBackup && (rawBackup.nombre || rawBackup.nombre_del_cliente)) || ((window.SESION && window.SESION.nombre) || '');
      const emailFinal = (perf && perf.email) ? perf.email : (rawBackup && rawBackup.email) || ((window.SESION && window.SESION.email) || '');
      const direccionFinal = (perf && (perf.direccion || perf.dirección || perf['dirección'])) ? (perf.direccion || perf.dirección || perf['dirección']) : (rawBackup && (rawBackup.direccion || rawBackup.dirección)) || '';
      const ubicacionFinal = (perf && (perf.ubicacion || perf.ubicación || perf['ubicación'])) ? (perf.ubicacion || perf.ubicación || perf['ubicación']) : (rawBackup && (rawBackup.ubicacion || rawBackup.ubicación)) || '';
      const politicasFinal = (perf && (perf.politicas_contratacion || perf['políticas_de_contratación'] || perf.politicas || perf.politicas_aceptadas)) ? (perf.politicas_contratacion || perf['políticas_de_contratación'] || perf.politicas || perf.politicas_aceptadas) : (rawBackup && (rawBackup.politicas_contratacion || rawBackup['políticas_de_contratación'] || rawBackup.politicas || rawBackup.politicas_aceptadas)) || '';

      const inpNombre = document.getElementById('cp-edit-nombre');
      if (inpNombre) inpNombre.value = nombreFinal;

      const inpEmail = document.getElementById('cp-edit-email');
      if (inpEmail) inpEmail.value = emailFinal;

      const inpDir = document.getElementById('cp-edit-direccion');
      if (inpDir) inpDir.value = direccionFinal;

      const inpUbic = document.getElementById('cp-edit-ubicacion');
      if (inpUbic) inpUbic.value = ubicacionFinal;

      const inpPol = document.getElementById('cp-edit-politicas');
      if (inpPol) inpPol.value = politicasFinal;

      // Popular Campos Editables Familia
      const telefonoFinal = (perf && (perf.telefono || perf.teléfono)) ? (perf.telefono || perf.teléfono) : '';
      const emergenciaFinal = (perf && (perf.emergencia || perf['no._de_emergencia'] || perf['no. de emergencia'])) ? (perf.emergencia || perf['no._de_emergencia'] || perf['no. de emergencia']) : '';
      const mascotasFinal = (perf && (perf.mascotas || perf['no._de_mascotas'] || perf['no. de mascotas'])) ? (perf.mascotas || perf['no._de_mascotas'] || perf['no. de mascotas']) : '';

      const inpTel = document.getElementById('cp-edit-telefono');
      if (inpTel) inpTel.value = telefonoFinal;

      const inpEmerg = document.getElementById('cp-edit-emergencia');
      if (inpEmerg) inpEmerg.value = emergenciaFinal;

      const inpMasc = document.getElementById('cp-edit-mascotas');
      if (inpMasc) inpMasc.value = mascotasFinal;

      // Popular Peque 1
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
      };

      setVal('cp-edit-peque-nombre-1', perf?.peque_nombre || perf?.nombre_del_peque);
      setVal('cp-edit-peque-nac-1', perf?.peque_nacimiento || perf?.fecha_de_nacimiento);
      setVal('cp-edit-alergias-1', perf?.alergias);
      setVal('cp-edit-condicion-1', perf?.condicion_medica || perf?.condicion);
      setVal('cp-edit-salud-1', perf?.salud_actual || perf?.salud || perf?.estado_de_salud_actual);
      setVal('cp-edit-preferencias-1', perf?.preferencias);

      // Popular Peque 2
      const hasP2 = !!(perf?.peque_nombre_2 || perf?.nombre_del_peque_2);
      setVal('cp-edit-peque-nombre-2', perf?.peque_nombre_2 || perf?.nombre_del_peque_2);
      setVal('cp-edit-peque-nac-2', perf?.peque_nacimiento_2 || perf?.fecha_de_nacimiento_2 || perf?.peque_nac_2);
      setVal('cp-edit-alergias-2', perf?.alergias_2);
      setVal('cp-edit-condicion-2', perf?.condicion_medica_2 || perf?.condicion_2);
      setVal('cp-edit-salud-2', perf?.salud_actual_2 || perf?.salud_2 || perf?.estado_de_salud_actual_2);
      setVal('cp-edit-preferencias-2', perf?.preferencias_2);

      const blockP2 = document.getElementById('cp-block-peque-2');
      if (blockP2) blockP2.style.display = hasP2 ? 'block' : 'none';

      // Popular Peque 3
      const hasP3 = !!(perf?.peque_nombre_3 || perf?.nombre_del_peque_3);
      setVal('cp-edit-peque-nombre-3', perf?.peque_nombre_3 || perf?.nombre_del_peque_3);
      setVal('cp-edit-peque-nac-3', perf?.peque_nacimiento_3 || perf?.fecha_de_nacimiento_3 || perf?.peque_nac_3);
      setVal('cp-edit-alergias-3', perf?.alergias_3);
      setVal('cp-edit-condicion-3', perf?.condicion_medica_3 || perf?.condicion_3);
      setVal('cp-edit-salud-3', perf?.salud_actual_3 || perf?.salud_3 || perf?.estado_de_salud_actual_3);
      setVal('cp-edit-preferencias-3', perf?.preferencias_3);

      const blockP3 = document.getElementById('cp-block-peque-3');
      if (blockP3) blockP3.style.display = hasP3 ? 'block' : 'none';

      this.actualizarBotonAgregarPeque();

      // Inicializar calendario personalizado de la marca en los campos de fecha
      ['cp-edit-peque-nac-1', 'cp-edit-peque-nac-2', 'cp-edit-peque-nac-3'].forEach(id => {
        const el = document.getElementById(id);
        if (el && window.NPDatePicker) {
          window.NPDatePicker.initInput(el);
        }
      });

      modal.classList.add('activo');
      modal.classList.add('active');
      modal.style.setProperty('display', 'flex', 'important');
      document.body.style.overflow = 'hidden';
    },

    cerrarModalEditar: function () {
      if (window.NPDatePicker) window.NPDatePicker.close();
      const modal = document.getElementById('cp-modal-editar-perfil');
      if (modal) {
        modal.classList.remove('activo');
        modal.classList.remove('active');
        modal.style.setProperty('display', 'none', 'important');
      }
      document.body.style.overflow = '';
    },

    agregarPeque: function () {
      const blockP2 = document.getElementById('cp-block-peque-2');
      const blockP3 = document.getElementById('cp-block-peque-3');

      if (blockP2 && blockP2.style.display === 'none') {
        blockP2.style.display = 'block';
        blockP2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else if (blockP3 && blockP3.style.display === 'none') {
        blockP3.style.display = 'block';
        blockP3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      this.actualizarBotonAgregarPeque();
    },

    eliminarPeque: function (num) {
      const clearVal = id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      };

      if (num === 2) {
        clearVal('cp-edit-peque-nombre-2');
        clearVal('cp-edit-peque-nac-2');
        clearVal('cp-edit-alergias-2');
        clearVal('cp-edit-condicion-2');
        clearVal('cp-edit-salud-2');
        clearVal('cp-edit-preferencias-2');
        const block = document.getElementById('cp-block-peque-2');
        if (block) block.style.display = 'none';
      } else if (num === 3) {
        clearVal('cp-edit-peque-nombre-3');
        clearVal('cp-edit-peque-nac-3');
        clearVal('cp-edit-alergias-3');
        clearVal('cp-edit-condicion-3');
        clearVal('cp-edit-salud-3');
        clearVal('cp-edit-preferencias-3');
        const block = document.getElementById('cp-block-peque-3');
        if (block) block.style.display = 'none';
      }

      this.actualizarBotonAgregarPeque();
    },

    actualizarBotonAgregarPeque: function () {
      const blockP2 = document.getElementById('cp-block-peque-2');
      const blockP3 = document.getElementById('cp-block-peque-3');
      const btnAdd = document.getElementById('cp-add-peque-wrap');

      const isP2Vis = blockP2 && blockP2.style.display !== 'none';
      const isP3Vis = blockP3 && blockP3.style.display !== 'none';

      if (btnAdd) {
        if (isP2Vis && isP3Vis) {
          btnAdd.style.display = 'none';
        } else {
          btnAdd.style.display = 'block';
        }
      }
    },

    guardarPerfil: async function () {
      const btnSave = document.getElementById('cp-btn-guardar-perfil');
      const email = (document.getElementById('cp-edit-email')?.value || window.SESION?.email || '').trim();
      const telefono = (document.getElementById('cp-edit-telefono')?.value || '').trim();
      const emergencia = (document.getElementById('cp-edit-emergencia')?.value || '').trim();
      const mascotas = (document.getElementById('cp-edit-mascotas')?.value || '').trim();

      // Read Peque 1
      const p1Nombre = (document.getElementById('cp-edit-peque-nombre-1')?.value || '').trim();
      const p1Nac = document.getElementById('cp-edit-peque-nac-1')?.value || '';
      const p1Alergias = (document.getElementById('cp-edit-alergias-1')?.value || '').trim();
      const p1Condicion = (document.getElementById('cp-edit-condicion-1')?.value || '').trim();
      const p1Salud = (document.getElementById('cp-edit-salud-1')?.value || '').trim();
      const p1Preferencias = (document.getElementById('cp-edit-preferencias-1')?.value || '').trim();

      if (!telefono || !p1Nombre) {
        if (typeof Swal !== 'undefined') {
          Swal.fire('Atención', 'Por favor ingresa tu teléfono y el nombre del Peque 1', 'warning');
        } else {
          alert('Por favor ingresa tu teléfono y el nombre del Peque 1');
        }
        return;
      }

      // Read Peque 2 if visible
      const blockP2 = document.getElementById('cp-block-peque-2');
      const hasP2 = blockP2 && blockP2.style.display !== 'none';
      const p2Nombre = hasP2 ? (document.getElementById('cp-edit-peque-nombre-2')?.value || '').trim() : null;
      const p2Nac = hasP2 ? document.getElementById('cp-edit-peque-nac-2')?.value || null : null;
      const p2Alergias = hasP2 ? (document.getElementById('cp-edit-alergias-2')?.value || '').trim() : null;
      const p2Condicion = hasP2 ? (document.getElementById('cp-edit-condicion-2')?.value || '').trim() : null;
      const p2Salud = hasP2 ? (document.getElementById('cp-edit-salud-2')?.value || '').trim() : null;
      const p2Preferencias = hasP2 ? (document.getElementById('cp-edit-preferencias-2')?.value || '').trim() : null;

      // Read Peque 3 if visible
      const blockP3 = document.getElementById('cp-block-peque-3');
      const hasP3 = blockP3 && blockP3.style.display !== 'none';
      const p3Nombre = hasP3 ? (document.getElementById('cp-edit-peque-nombre-3')?.value || '').trim() : null;
      const p3Nac = hasP3 ? document.getElementById('cp-edit-peque-nac-3')?.value || null : null;
      const p3Alergias = hasP3 ? (document.getElementById('cp-edit-alergias-3')?.value || '').trim() : null;
      const p3Condicion = hasP3 ? (document.getElementById('cp-edit-condicion-3')?.value || '').trim() : null;
      const p3Salud = hasP3 ? (document.getElementById('cp-edit-salud-3')?.value || '').trim() : null;
      const p3Preferencias = hasP3 ? (document.getElementById('cp-edit-preferencias-3')?.value || '').trim() : null;

      if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = `<span>Guardando...</span>`;
      }

      try {
        let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : {};
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

        // Fetch current record directly from Supabase so we NEVER lose existing non-editable fields!
        let supaExisting = null;
        if (client && email) {
          try {
            const { data } = await client.from('clientes').select('*').eq('email', email).maybeSingle();
            if (data) supaExisting = data;
          } catch (eDb) {
            console.warn('Nota obteniendo registro existente:', eDb);
          }
        }

        let backupCache = null;
        try {
          const rawCache = localStorage.getItem('nyp_profile_cache') || localStorage.getItem('nyp_sesion');
          if (rawCache) backupCache = JSON.parse(rawCache);
        } catch (eB) {}

        const nombre = (
          document.getElementById('cp-edit-nombre')?.value ||
          supaExisting?.nombre ||
          perf?.nombre ||
          perf?.nombre_del_cliente ||
          window.SESION?.nombre || ''
        ).trim();

        const direccion = (
          document.getElementById('cp-edit-direccion')?.value ||
          supaExisting?.direccion ||
          perf?.direccion ||
          perf?.dirección ||
          backupCache?.direccion ||
          backupCache?.dirección || ''
        ).trim();

        const ubicacion = (
          document.getElementById('cp-edit-ubicacion')?.value ||
          supaExisting?.ubicacion ||
          perf?.ubicacion ||
          perf?.ubicación ||
          backupCache?.ubicacion ||
          backupCache?.ubicación || ''
        ).trim();

        const politicas = (
          document.getElementById('cp-edit-politicas')?.value ||
          supaExisting?.politicas_contratacion ||
          perf?.politicas_contratacion ||
          perf?.['políticas_de_contratación'] ||
          backupCache?.politicas_contratacion ||
          backupCache?.['políticas_de_contratación'] || ''
        ).trim();

        const calcEdad = nac => (nac && typeof window.calcularEdadPeque === 'function') ? (window.calcularEdadPeque(nac) || null) : null;
        const nowIso = new Date().toISOString();

        // 1. Guardar en Supabase con UPSERT en tabla 'clientes' (preservando todos los campos válidos de la BD)
        const payloadSupa = Object.assign({}, supaExisting || {}, {
          email: email,
          nombre: nombre || supaExisting?.nombre || '',
          telefono: telefono,
          emergencia: emergencia,
          mascotas: mascotas,
          direccion: direccion || supaExisting?.direccion || '',
          ubicacion: ubicacion || supaExisting?.ubicacion || '',
          politicas_contratacion: politicas || supaExisting?.politicas_contratacion || '',
          fecha_edicion_peque: nowIso,

          // Peque 1
          peque_nombre: p1Nombre,
          peque_nacimiento: p1Nac || null,
          peque_edad: calcEdad(p1Nac),
          alergias: p1Alergias,
          condicion_medica: p1Condicion,
          salud_actual: p1Salud,
          preferencias: p1Preferencias,

          // Peque 2
          peque_nombre_2: p2Nombre,
          peque_nacimiento_2: p2Nac,
          peque_edad_2: calcEdad(p2Nac),
          alergias_2: p2Alergias,
          condicion_medica_2: p2Condicion,
          salud_actual_2: p2Salud,
          preferencias_2: p2Preferencias,

          // Peque 3
          peque_nombre_3: p3Nombre,
          peque_nacimiento_3: p3Nac,
          peque_edad_3: calcEdad(p3Nac),
          alergias_3: p3Alergias,
          condicion_medica_3: p3Condicion,
          salud_actual_3: p3Salud,
          preferencias_3: p3Preferencias
        });

        // Eliminar del payload SQL cualquier propiedad con alias o caracteres especiales que no sean columnas de la BD
        delete payloadSupa['no._de_mascotas'];
        delete payloadSupa['no. de mascotas'];
        delete payloadSupa['no._de_emergencia'];
        delete payloadSupa['no. de emergencia'];
        delete payloadSupa['dirección'];
        delete payloadSupa['ubicación'];
        delete payloadSupa['políticas_de_contratación'];

        if (client && email) {
          const { error: errUpsert } = await client
            .from('clientes')
            .upsert(payloadSupa, { onConflict: 'email' });

          if (errUpsert) {
            console.error('❌ Error al hacer upsert en Supabase clientes:', errUpsert);
            throw new Error(errUpsert.message || 'Error guardando en la base de datos');
          }
          console.log('✅ Perfil de cliente actualizado en Supabase exitosamente.');
        }

        // 2. Actualizar memoria local en CACHE_CLIENTE y localStorage de forma inmediata
        if (!window.CACHE_CLIENTE) window.CACHE_CLIENTE = {};
        if (!window.CACHE_CLIENTE.profile) window.CACHE_CLIENTE.profile = {};

        Object.assign(window.CACHE_CLIENTE.profile, {
          email,
          nombre, nombre_del_cliente: nombre,
          telefono, teléfono: telefono,
          emergencia, 'no._de_emergencia': emergencia, 'no. de emergencia': emergencia,
          mascotas, 'no._de_mascotas': mascotas, 'no. de mascotas': mascotas,
          direccion, dirección: direccion,
          ubicacion, ubicación: ubicacion,
          politicas_contratacion: politicas, 'políticas_de_contratación': politicas, politicas_aceptadas: politicas,

          // Peque 1
          peque_nombre: p1Nombre, nombre_del_peque: p1Nombre,
          peque_nacimiento: p1Nac, fecha_de_nacimiento: p1Nac,
          peque_edad: calcEdad(p1Nac), edad_del_peque: calcEdad(p1Nac),
          alergias: p1Alergias,
          condicion_medica: p1Condicion, condicion: p1Condicion,
          salud_actual: p1Salud, salud: p1Salud, estado_de_salud_actual: p1Salud,
          preferencias: p1Preferencias, preferencias_o_actividades_favoritas: p1Preferencias,

          // Peque 2
          peque_nombre_2: p2Nombre, nombre_del_peque_2: p2Nombre,
          peque_nacimiento_2: p2Nac, fecha_de_nacimiento_2: p2Nac, peque_nac_2: p2Nac,
          peque_edad_2: calcEdad(p2Nac), edad_del_peque_2: calcEdad(p2Nac),
          alergias_2: p2Alergias,
          condicion_medica_2: p2Condicion, condicion_2: p2Condicion,
          salud_actual_2: p2Salud, salud_2: p2Salud, estado_de_salud_actual_2: p2Salud,
          preferencias_2: p2Preferencias, preferencias_o_actividades_favoritas_2: p2Preferencias,

          // Peque 3
          peque_nombre_3: p3Nombre, nombre_del_peque_3: p3Nombre,
          peque_nacimiento_3: p3Nac, fecha_de_nacimiento_3: p3Nac, peque_nac_3: p3Nac,
          peque_edad_3: calcEdad(p3Nac), edad_del_peque_3: calcEdad(p3Nac),
          alergias_3: p3Alergias,
          condicion_medica_3: p3Condicion, condicion_3: p3Condicion,
          salud_actual_3: p3Salud, salud_3: p3Salud, estado_de_salud_actual_3: p3Salud,
          preferencias_3: p3Preferencias, preferencias_o_actividades_favoritas_3: p3Preferencias
        });

        try {
          localStorage.setItem('nyp_profile_cache', JSON.stringify(window.CACHE_CLIENTE.profile));
          localStorage.setItem('np_usuario_cliente', JSON.stringify(window.CACHE_CLIENTE.profile));
        } catch (eLS) {
          console.warn('Error guardando en localStorage:', eLS);
        }

        // 3. Emitir eventos de sincronización inmediata con el panel de administración
        try {
          if (typeof BroadcastChannel !== 'undefined') {
            const bc = new BroadcastChannel('nyp_admin_sync_channel');
            bc.postMessage({ type: 'cliente_actualizado', detail: payloadSupa, email: email, timestamp: Date.now() });
            setTimeout(() => bc.close(), 500);
          }
        } catch (eBc) {}
        try {
          localStorage.setItem('nyp_admin_sync_trigger', JSON.stringify({ type: 'cliente_actualizado', detail: payloadSupa, timestamp: Date.now() }));
        } catch (eSt) {}
        try {
          window.dispatchEvent(new CustomEvent('nyp_cliente_actualizado', { detail: payloadSupa }));
        } catch (eEv) {}

        // 4. Intentar actualizar en GAS en segundo plano sin bloquear la UI
        if (typeof window.api === 'function') {
          window.api('updatePerfilCliente', {
            email, telefono, emergencia, mascotas,
            peque_nombre: p1Nombre, peque_nacimiento: p1Nac, alergias: p1Alergias, condicion_medica: p1Condicion, salud_actual: p1Salud, preferencias: p1Preferencias,
            peque_nombre_2: p2Nombre, peque_nacimiento_2: p2Nac, alergias_2: p2Alergias, condicion_medica_2: p2Condicion, salud_actual_2: p2Salud, preferencias_2: p2Preferencias,
            peque_nombre_3: p3Nombre, peque_nacimiento_3: p3Nac, alergias_3: p3Alergias, condicion_medica_3: p3Condicion, salud_actual_3: p3Salud, preferencias_3: p3Preferencias
          }).catch(eGas => console.warn('Nota: backend GAS updatePerfilCliente:', eGas));
        }

        // 5. Refrescar la pantalla cliente dinámicamente de forma instantánea
        await this.cargarDatos();

        if (typeof window.cargarPerfil === 'function') {
          try { window.cargarPerfil(true); } catch (eP) {}
        }

        if (typeof window.cargarServiciosCliente === 'function') {
          try { window.cargarServiciosCliente(true); } catch (eSvc) {}
        }

        this.cerrarModalEditar();

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: '¡Perfil actualizado!',
            text: 'Tus datos y la información de tus peques se han guardado correctamente.',
            icon: 'success',
            confirmButtonColor: '#E84C9A',
            timer: 2000
          });
        } else {
          alert('¡Perfil actualizado correctamente!');
        }

      } catch (err) {
        console.error('Error al guardar el perfil del cliente:', err);
        if (typeof Swal !== 'undefined') {
          Swal.fire('Error', 'Ocurrió un error al guardar los cambios: ' + (err.message || err), 'error');
        } else {
          alert('Ocurrió un error al guardar los cambios: ' + (err.message || err));
        }
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.innerHTML = `
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Guardar cambios</span>
          `;
        }
      }
    },

    abrirCredencial: function () {
      if (typeof window.abrirCredencialNanny === 'function') {
        window.abrirCredencialNanny();
      } else {
        alert('Abriendo credencial...');
      }
    },

    abrirUbicacion: function () {
      let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : null;
      const url = perf ? (perf.ubicacion || perf.ubicación) : null;
      if (url && url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        window.open('https://maps.google.com', '_blank');
      }
    },

    cerrarSesion: function () {
      if (typeof window.confirmarLogout === 'function') {
        window.confirmarLogout();
      } else if (typeof window.logout === 'function') {
        window.logout();
      }
    }
  };

  // ==========================================================================
  // NP CUSTOM DATE PICKER (CALENDARIO PERSONALIZADO MARCA NANNYS Y PEQUES)
  // ==========================================================================
  window.NPDatePicker = {
    activeInput: null,
    popoverEl: null,
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    selectedDateStr: '',

    initInput: function (inputEl) {
      if (!inputEl || inputEl.dataset.npDpInit) return;
      inputEl.dataset.npDpInit = 'true';
      inputEl.style.cursor = 'pointer';

      inputEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.open(inputEl, e);
      });
    },

    open: function (inputEl, e) {
      if (e) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
      }

      const now = Date.now();
      if (this._lastOpenInput === inputEl && (now - (this._lastOpenTime || 0)) < 250) {
        return;
      }
      if (this.activeInput === inputEl && this.popoverEl) {
        this.close();
        return;
      }

      this._lastOpenInput = inputEl;
      this._lastOpenTime = now;
      this.activeInput = inputEl;

      let initialVal = inputEl.value ? inputEl.value.trim() : '';

      if (initialVal && /^\d{4}-\d{2}-\d{2}$/.test(initialVal)) {
        const parts = initialVal.split('-');
        this.currentYear = parseInt(parts[0], 10);
        this.currentMonth = parseInt(parts[1], 10) - 1;
        this.selectedDateStr = initialVal;
      } else {
        const d = new Date();
        this.currentYear = d.getFullYear() - 2;
        this.currentMonth = d.getMonth();
        this.selectedDateStr = initialVal || '';
      }

      this.renderPopover();
    },

    close: function () {
      if (this.popoverEl && this.popoverEl.parentNode) {
        this.popoverEl.parentNode.removeChild(this.popoverEl);
      }
      this.popoverEl = null;
      this.activeInput = null;
      document.removeEventListener('click', this._onOutsideClick);
    },

    _onOutsideClick: function (e) {
      if (window.NPDatePicker.popoverEl &&
        !window.NPDatePicker.popoverEl.contains(e.target) &&
        window.NPDatePicker.activeInput !== e.target) {
        window.NPDatePicker.close();
      }
    },

    renderPopover: function () {
      if (!this.activeInput) return;
      if (this.popoverEl && this.popoverEl.parentNode) {
        this.popoverEl.parentNode.removeChild(this.popoverEl);
      }

      const popover = document.createElement('div');
      popover.className = 'np-datepicker-popover';
      this.popoverEl = popover;

      const rect = this.activeInput.getBoundingClientRect();
      let top = rect.bottom + 6;
      let left = rect.left;

      const popoverWidth = 310;
      const popoverHeight = 330;

      if (left + popoverWidth > window.innerWidth - 10) {
        left = Math.max(10, window.innerWidth - popoverWidth - 10);
      }
      if (top + popoverHeight > window.innerHeight - 10) {
        top = Math.max(10, rect.top - popoverHeight - 6);
      }

      popover.style.top = top + 'px';
      popover.style.left = left + 'px';

      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

      const nowY = new Date().getFullYear();
      let yearOptionsHTML = '';
      for (let y = nowY; y >= 2005; y--) {
        yearOptionsHTML += `<option value="${y}" ${y === this.currentYear ? 'selected' : ''}>${y}</option>`;
      }

      let monthOptionsHTML = '';
      meses.forEach((m, idx) => {
        monthOptionsHTML += `<option value="${idx}" ${idx === this.currentMonth ? 'selected' : ''}>${m}</option>`;
      });

      popover.innerHTML = `
        <div class="np-dp-header">
          <button type="button" class="np-dp-nav-btn" onclick="NPDatePicker.changeMonth(-1)" title="Mes anterior">‹</button>
          <div class="np-dp-selects">
            <select class="np-dp-select" onchange="NPDatePicker.onMonthSelect(this.value)">
              ${monthOptionsHTML}
            </select>
            <select class="np-dp-select" onchange="NPDatePicker.onYearSelect(this.value)">
              ${yearOptionsHTML}
            </select>
          </div>
          <button type="button" class="np-dp-nav-btn" onclick="NPDatePicker.changeMonth(1)" title="Mes siguiente">›</button>
        </div>

        <div class="np-dp-weekdays">
          <span class="weekend">Dom</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span class="weekend">Sáb</span>
        </div>

        <div class="np-dp-days-grid">
          ${this.buildDaysHTML()}
        </div>

        <div class="np-dp-footer">
          <button type="button" class="np-dp-btn-action" onclick="NPDatePicker.clearDate()">Limpiar</button>
          <button type="button" class="np-dp-btn-action" onclick="NPDatePicker.selectToday()">Hoy</button>
          <button type="button" class="np-dp-btn-action primary" onclick="NPDatePicker.close()">Aceptar</button>
        </div>
      `;

      document.body.appendChild(popover);

      setTimeout(() => {
        document.addEventListener('click', this._onOutsideClick);
      }, 50);
    },

    buildDaysHTML: function () {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      const todayObj = new Date();
      const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

      let html = '';

      for (let i = 0; i < firstDay; i++) {
        html += `<div class="np-dp-day-cell empty"></div>`;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const monthStr = String(this.currentMonth + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateVal = `${this.currentYear}-${monthStr}-${dayStr}`;

        let classes = ['np-dp-day-cell'];
        if (dateVal === this.selectedDateStr) classes.push('selected');
        if (dateVal === todayStr) classes.push('today');

        html += `<div class="${classes.join(' ')}" onclick="NPDatePicker.selectDay('${dateVal}')">${day}</div>`;
      }

      return html;
    },

    changeMonth: function (delta) {
      this.currentMonth += delta;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.renderPopover();
    },

    onMonthSelect: function (val) {
      this.currentMonth = parseInt(val, 10);
      this.renderPopover();
    },

    onYearSelect: function (val) {
      this.currentYear = parseInt(val, 10);
      this.renderPopover();
    },

    selectDay: function (dateVal) {
      this.selectedDateStr = dateVal;
      if (this.activeInput) {
        this.activeInput.value = dateVal;
        this.activeInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      this.close();
    },

    clearDate: function () {
      this.selectedDateStr = '';
      if (this.activeInput) {
        this.activeInput.value = '';
        this.activeInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      this.close();
    },

    selectToday: function () {
      const todayObj = new Date();
      const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
      this.selectDay(todayStr);
    }
  };

  // Inicializar al cargar el DOM o si ya se cargó
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ClientePerfil.init());
  } else {
    ClientePerfil.init();
  }

  window.ClientePerfil = ClientePerfil;
})();
