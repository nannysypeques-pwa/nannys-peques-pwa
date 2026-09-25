/**
 * ============================================================================
 * MÓDULO NIÑERA: PESTAÑA "PERFIL" (NUEVO DISEÑO FRONTEND)
 * Nannys y Peques - UI Mockup Replica
 * ============================================================================
 */

(function () {
  'use strict';

  const NannyPerfil = {
    init: function () {
      console.log('✨ [NannyPerfil] Inicializando pestaña de Perfil de la niñera');
      this.cargarDatos();
      this.generarQRRecomendacion();
    },

    cargarDatos: function () {
      try {
        let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : null;

        if (!perf) {
          try {
            const rawLocal = localStorage.getItem('nyp_profile_cache');
            if (rawLocal) perf = JSON.parse(rawLocal);
          } catch (e) {}
        }

        // Fallbacks inteligentes según mockup
        const defaultNanny = {
          nombre: 'Niñera',
          telefono: '—',
          emergencia: '—',
          email: 'contacto@nannysypeques.com',
          direccion: '—',
          ubicacion: ''
        };

        const nombre = (perf && perf.nombre) ? perf.nombre : ((window.SESION && window.SESION.nombre) || defaultNanny.nombre);
        const telefono = (perf && (perf.telefono || perf.teléfono)) ? (perf.telefono || perf.teléfono) : defaultNanny.telefono;
        const emergencia = (perf && (perf.emergencia || perf['no._de_emergencia'])) ? (perf.emergencia || perf['no._de_emergencia']) : defaultNanny.emergencia;
        const email = (perf && perf.email) ? perf.email : ((window.SESION && window.SESION.email) || defaultNanny.email);
        const direccion = (perf && perf.direccion) ? perf.direccion : defaultNanny.direccion;
        const ubicacion = (perf && (perf.ubicación || perf.ubicacion)) ? (perf.ubicación || perf.ubicacion) : defaultNanny.ubicacion;

        // Inyectar en elementos del DOM
        const elNombre = document.getElementById('np-hero-name');
        if (elNombre) elNombre.textContent = nombre;

        const elTel = document.getElementById('np_tel');
        if (elTel) elTel.textContent = telefono;

        const elEmergencia = document.getElementById('np_emergencia');
        if (elEmergencia) elEmergencia.textContent = emergencia;

        const elEmail = document.getElementById('np_email');
        if (elEmail) elEmail.textContent = email;

        const elDireccion = document.getElementById('np_direccion');
        if (elDireccion) elDireccion.textContent = direccion;

        const elUbic = document.getElementById('np_ubicacion');
        if (elUbic) {
          if (ubicacion && ubicacion.startsWith('http')) {
            elUbic.href = ubicacion;
          } else {
            elUbic.href = 'https://maps.google.com/?q=' + encodeURIComponent(direccion);
          }
        }
        // refrescar QR con el nombre real cargado
        this.generarQRRecomendacion();
      } catch (err) {
        console.error('Error cargando datos de NannyPerfil:', err);
      }
    },

    generarQRRecomendacion: function () {
      const container = document.getElementById('np-qr-target');
      if (!container) return;

      let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : null;
      let nombreUsuario = (perf && perf.nombre) ? perf.nombre.trim() : '';
      if (!nombreUsuario && window.SESION && window.SESION.nombre) {
        nombreUsuario = window.SESION.nombre.trim();
      }

      const msg = nombreUsuario
        ? `Hola. La niñera ${nombreUsuario} me recomendó sus servicios y quisiera saber más al respecto`
        : `Hola, una niñera me recomendó sus servicios y quisiera saber más al respecto`;
      const phone = '522224021886';
      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

      // Si la librería QRCode está disponible
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
          console.warn('No se pudo generar QR dinámico para nanny:', e);
          container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(waLink)}" alt="Código QR" style="width:170px; height:170px; border-radius:12px;">`;
        }
      } else {
        // Fallback imagen QR rápida si QRCode no cargó
        container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(waLink)}" alt="Código QR" style="width:170px; height:170px; border-radius:12px;">`;
      }
    },

    abrirCredencial: function () {
      if (typeof window.abrirCredencialNanny === 'function') {
        window.abrirCredencialNanny();
      } else {
        alert('Abriendo credencial de niñera...');
      }
    },

    abrirUbicacion: function (e) {
      if (e) e.preventDefault();
      const elUbic = document.getElementById('np_ubicacion');
      const href = elUbic ? elUbic.getAttribute('href') : 'https://maps.google.com';
      window.open(href, '_blank');
    },

    editarPerfil: function () {
      this.abrirModalEditar();
    },

    abrirModalEditar: async function () {
      const modal = document.getElementById('np-modal-editar-perfil');
      if (!modal) return;

      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }

      let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : null;

      // Intentar sincronizar datos frescos desde Supabase (tabla nannys o clientes)
      try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        const emailSesion = (window.SESION && window.SESION.email) ? window.SESION.email : (perf && perf.email);

        if (client && emailSesion) {
          let { data: supaNanny } = await client
            .from('nannys')
            .select('*')
            .eq('email', emailSesion)
            .maybeSingle();

          if (!supaNanny) {
            const { data: supaCliente } = await client
              .from('clientes')
              .select('*')
              .eq('email', emailSesion)
              .maybeSingle();
            supaNanny = supaCliente;
          }

          if (supaNanny) {
            perf = Object.assign({}, perf || {}, {
              nombre: supaNanny.nombre || (perf && perf.nombre),
              telefono: supaNanny.telefono || (perf && perf.telefono) || (perf && perf.teléfono),
              emergencia: supaNanny.emergencia || (perf && perf.emergencia) || (perf && perf['no._de_emergencia']),
              email: supaNanny.email || emailSesion,
              direccion: supaNanny.direccion || (perf && perf.direccion),
              ubicacion: supaNanny.ubicacion || (perf && perf.ubicacion) || (perf && perf.ubicación)
            });
            if (window.CACHE_CLIENTE) window.CACHE_CLIENTE.profile = perf;
          }
        }
      } catch (e) {
        console.warn('Nota obteniendo datos de niñera para modal:', e);
      }

      const emailFinal = (perf && perf.email) ? perf.email : ((window.SESION && window.SESION.email) || '');
      const nombreFinal = (perf && perf.nombre) ? perf.nombre : ((window.SESION && window.SESION.nombre) || '');
      const telefonoFinal = (perf && (perf.telefono || perf.teléfono)) ? (perf.telefono || perf.teléfono) : '';
      const emergenciaFinal = (perf && (perf.emergencia || perf['no._de_emergencia'])) ? (perf.emergencia || perf['no._de_emergencia']) : '';
      const direccionFinal = (perf && perf.direccion) ? perf.direccion : '';
      const ubicacionFinal = (perf && (perf.ubicación || perf.ubicacion)) ? (perf.ubicación || perf.ubicacion) : '';

      const inpNombre = document.getElementById('np-edit-nombre');
      if (inpNombre) inpNombre.value = nombreFinal;

      const inpTel = document.getElementById('np-edit-telefono');
      if (inpTel) inpTel.value = telefonoFinal;

      const inpEmergencia = document.getElementById('np-edit-emergencia');
      if (inpEmergencia) inpEmergencia.value = emergenciaFinal;

      const inpEmail = document.getElementById('np-edit-email');
      if (inpEmail) inpEmail.value = emailFinal;

      const inpDir = document.getElementById('np-edit-direccion');
      if (inpDir) inpDir.value = direccionFinal;

      const inpUbic = document.getElementById('np-edit-ubicacion');
      if (inpUbic) inpUbic.value = ubicacionFinal;

      modal.classList.add('activo');
      modal.classList.add('active');
      modal.style.setProperty('display', 'flex', 'important');
      document.body.style.overflow = 'hidden';
    },

    cerrarModalEditar: function () {
      const modal = document.getElementById('np-modal-editar-perfil');
      if (modal) {
        modal.classList.remove('activo');
        modal.classList.remove('active');
        modal.style.setProperty('display', 'none', 'important');
      }
      document.body.style.overflow = '';
    },

    guardarPerfil: async function () {
      const btnSave = document.getElementById('np-btn-guardar-perfil');
      const telefono = (document.getElementById('np-edit-telefono')?.value || '').trim();
      const emergencia = (document.getElementById('np-edit-emergencia')?.value || '').trim();
      const email = (document.getElementById('np-edit-email')?.value || window.SESION?.email || '').trim();
      const direccion = (document.getElementById('np-edit-direccion')?.value || '').trim();
      const ubicacion = (document.getElementById('np-edit-ubicacion')?.value || '').trim();

      if (!telefono || !direccion) {
        if (typeof Swal !== 'undefined') {
          Swal.fire('Atención', 'Por favor ingresa tu teléfono y dirección', 'warning');
        } else {
          alert('Por favor ingresa tu teléfono y dirección');
        }
        return;
      }

      if (btnSave) {
        btnSave.disabled = true;
        btnSave.innerHTML = `<span>Guardando...</span>`;
      }

      try {
        let perf = (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) ? window.CACHE_CLIENTE.profile : {};
        const nombre = perf.nombre || (window.SESION && window.SESION.nombre) || '';

        // 1. Guardar en Supabase con UPSERT en tabla 'nannys' (y 'clientes' fallback)
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client && email) {
          const supaPayload = {
            email: email,
            nombre: nombre,
            telefono: telefono,
            emergencia: emergencia,
            direccion: direccion,
            ubicacion: ubicacion,
            actualizado_en: new Date().toISOString()
          };

          const { error: supaErr } = await client
            .from('nannys')
            .upsert(supaPayload, { onConflict: 'email' });

          if (supaErr) {
            console.warn('Nota al actualizar Supabase nannys:', supaErr.message || supaErr);
          } else {
            console.log('✅ [NannyPerfil] Perfil guardado con upsert en tabla nannys de Supabase');
            try {
              if (typeof BroadcastChannel !== 'undefined') {
                const bc = new BroadcastChannel('nyp_admin_sync_channel');
                bc.postMessage({ type: 'nanny_actualizada', detail: supaPayload, email: email, timestamp: Date.now() });
                setTimeout(() => bc.close(), 500);
              }
            } catch (eBc) {}
            try {
              localStorage.setItem('nyp_admin_sync_trigger', JSON.stringify({ type: 'nanny_actualizada', detail: supaPayload, timestamp: Date.now() }));
            } catch (eSt) {}
            try {
              window.dispatchEvent(new CustomEvent('nyp_nanny_actualizada', { detail: supaPayload }));
            } catch (eEv) {}
          }

          try {
            await client
              .from('clientes')
              .upsert({
                email: email,
                nombre: nombre,
                telefono: telefono,
                emergencia: emergencia,
                direccion: direccion,
                ubicacion: ubicacion,
                actualizado_en: new Date().toISOString()
              }, { onConflict: 'email' });
          } catch (e) {}
        }

        // 2. Guardar en Google Apps Script (backend tradicional) si api está disponible
        if (typeof window.api === 'function' && email) {
          try {
            await window.api('updatePerfilNinera', {
              email: email,
              telefono: telefono,
              direccion: direccion,
              emergencia: emergencia,
              ubicacion: ubicacion
            });
            console.log('✅ [NannyPerfil] Perfil de niñera guardado en backend GAS');
          } catch (gasErr) {
            console.warn('Nota al guardar en GAS:', gasErr?.message || gasErr);
          }
        }

        // 3. Actualizar memoria local en CACHE_CLIENTE y localStorage
        if (!window.CACHE_CLIENTE) window.CACHE_CLIENTE = {};
        if (!window.CACHE_CLIENTE.profile) window.CACHE_CLIENTE.profile = {};

        Object.assign(window.CACHE_CLIENTE.profile, {
          nombre,
          telefono,
          teléfono: telefono,
          emergencia,
          'no._de_emergencia': emergencia,
          email,
          direccion,
          ubicacion,
          ubicación: ubicacion
        });

        try {
          localStorage.setItem('nyp_profile_cache', JSON.stringify(window.CACHE_CLIENTE.profile));
        } catch (e) {}

        if (window.SESION) {
          window.SESION.nombre = nombre;
        }

        // 4. Refrescar interfaz de NannyPerfil
        this.cargarDatos();
        this.cerrarModalEditar();

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: '¡Perfil Actualizado!',
            text: 'Tus datos se guardaron permanentemente.',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          alert('¡Perfil actualizado correctamente!');
        }
      } catch (err) {
        console.error('Error al guardar perfil de niñera:', err);
        if (typeof Swal !== 'undefined') {
          Swal.fire('Error', 'No se pudieron guardar los cambios. Intenta nuevamente.', 'error');
        } else {
          alert('Error al guardar los cambios.');
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

    cerrarSesion: function () {
      if (typeof window.confirmarLogout === 'function') {
        window.confirmarLogout();
      } else if (typeof window.logout === 'function') {
        window.logout();
      }
    }
  };

  window.NannyPerfil = NannyPerfil;
})();

