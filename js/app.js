// La constante API_URL ahora se toma de CONFIG (en js/config.js)
const API_URL = CONFIG.API_URL;
const VAPID_PUBLIC_KEY = 'BFuZVf-LVmWBDS76oBlDcRPlgwuQMkUvEfh3I5EDl4XH7H3kYWzWMAvk4-8-xYZt61IjaxDgiCMmzq23qUycCg4';

/**
 * Sanitizador y codificador seguro de cadenas para prevenir Cross-Site Scripting (XSS)
 * Conforme a directrices OWASP ASVS V5
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHTML = escapeHTML;
window.sanitizeHTML = escapeHTML;


/**
 * Función genérica para interactuar con el backend GAS
 */
async function api(action, payload = {}) {
  const params = new URLSearchParams();
  params.append('action', action);


  // Inyectar Token si existe en la sesión global o localStorage
  // Google Apps Script CacheService tiene un límite de 250 caracteres por clave.
  // Nunca inyectar tokens JWT largos de Supabase (>250 chars o que inician con 'eyJ') ni en llamadas de login.
  let token = null;
  if (typeof SESION !== 'undefined' && SESION.token) token = SESION.token;
  else {
    const stored = localStorage.getItem('nyp_sesion');
    if (stored) {
      try { token = JSON.parse(stored).token; } catch (e) { }
    }
  }

  if (action !== 'login' && token && typeof token === 'string' && token.length <= 250 && !token.startsWith('eyJ')) {
    payload.token = token;
  }


  // --- INTEGRIDAD DE API ---
  payload.integrity_key = 'NYP_PWA_SIGN_2025_#PqZ2';


  // --- HUELLA DE DISPOSITIVO (Fingerprint) ---
  payload.fingerprint = _getFingerprint();


  params.append('payload', JSON.stringify(payload));


  const res = await fetch(API_URL, {
    method: 'POST',
    body: params
  });


  const text = await res.text();


  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('Respuesta no válida del servidor: ' + text.substring(0, 50));
  }


  if (!json.ok) {
    const errorMsg = json.error || 'Error desconocido';

    // 🔥 CONTROL GLOBAL DE SESIÓN EXPIRADA
    if (errorMsg.includes('Tu sesión ha expirado')) {
      console.warn('Sesión expirada detectada globalmente:', errorMsg);
      if (typeof logout === 'function') {
        logout(true); // true = es por inactividad/error de sesión
      } else {
        // Fallback si logout no está definido aún
        localStorage.removeItem('nyp_sesion');
        window.location.reload();
      }
      throw new Error(errorMsg);
    }

    throw new Error(errorMsg);
  }
  return json.data;
}


/**
 * Genera una huella digital básica del dispositivo para vincular la sesión.
 * Esto evita que un token robado funcione en un dispositivo diferente.
 */
function _getFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset()
  ];
  const str = components.join('###');


  // Hash simple (no criptográfico pero único por dispositivo)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'F_' + Math.abs(hash).toString(16);
}


// --- REGISTER SERVICE WORKER (PWA) ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('SW registrado con éxito:', registration.scope);


        // Detectar nueva actualización
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nuevo SW instalado y esperando.
              console.log('Nueva versión disponible. Recargando...');
            }
          });
        });
      })
      .catch(err => {
        console.log('SW fallo al registrar:', err);
      });
  });


  // Recargar cuando el nuevo SW tome el control (skipWaiting + clients.claim)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

/**
 * =========================================================================
 * CÁLCULO DINÁMICO Y AUTOMÁTICO DE LA EDAD DEL PEQUE
 * Se recalcula siempre contra la fecha actual (new Date()) para que se mantenga
 * actualizada con el paso del tiempo.
 * =========================================================================
 */
function calcularEdadPeque(fechaNac, formato = 'completo') {
  if (!fechaNac) return '';
  try {
    let nac;
    if (fechaNac instanceof Date) {
      nac = new Date(fechaNac.getTime());
    } else if (typeof fechaNac === 'string') {
      const limpio = fechaNac.trim();
      if (!limpio) return '';
      // Normalizar formato YYYY-MM-DD
      const partes = limpio.split(/[-/T ]/);
      if (partes.length >= 3) {
        if (partes[0].length === 4) {
          nac = new Date(parseInt(partes[0]), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
        } else if (partes[2].length === 4) {
          nac = new Date(parseInt(partes[2]), parseInt(partes[1], 10) - 1, parseInt(partes[0], 10));
        } else {
          nac = new Date(limpio);
        }
      } else {
        nac = new Date(limpio);
      }
    } else {
      return '';
    }

    if (isNaN(nac.getTime())) return '';

    const hoy = new Date();
    // Quitar horas para comparación de días limpia
    hoy.setHours(0, 0, 0, 0);
    nac.setHours(0, 0, 0, 0);

    if (nac > hoy) return '';

    let anos = hoy.getFullYear() - nac.getFullYear();
    let meses = hoy.getMonth() - nac.getMonth();
    let dias = hoy.getDate() - nac.getDate();

    if (dias < 0) {
      meses--;
      const diasMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
      dias += diasMesAnterior;
    }

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    if (formato === 'numero') {
      return anos >= 1 ? anos : (meses > 0 ? parseFloat((meses / 12).toFixed(1)) : 0);
    }

    if (formato === 'corto') {
      if (anos === 0 && meses === 0) return `${dias}d`;
      if (anos === 0) return `${meses}m`;
      return `${anos}a${meses > 0 ? ` ${meses}m` : ''}`;
    }

    // Formato humano completo (predeterminado)
    if (anos === 0 && meses === 0) {
      if (dias <= 1) return 'Recién nacido';
      return `${dias} días`;
    }

    if (anos === 0) {
      const mesesTexto = meses === 1 ? '1 mes' : `${meses} meses`;
      if (dias > 0 && meses < 3) {
        const diasTexto = dias === 1 ? '1 día' : `${dias} días`;
        return `${mesesTexto} y ${diasTexto}`;
      }
      return mesesTexto;
    }

    const anosTexto = anos === 1 ? '1 año' : `${anos} años`;
    if (meses === 0) return anosTexto;
    const mesesTexto = meses === 1 ? '1 mes' : `${meses} meses`;
    return `${anosTexto} y ${mesesTexto}`;
  } catch (e) {
    console.warn("Error calculando edad:", e);
    return '';
  }
}
window.calcularEdadPeque = calcularEdadPeque;

/**
 * Actualiza el badge visual de edad en cualquier formulario (cliente o admin)
 */
function actualizarEdadEnFormulario(inputId, badgeId) {
  const input = document.getElementById(inputId);
  const badge = document.getElementById(badgeId);
  if (!input || !badge) return;

  const val = input.value;
  if (!val) {
    badge.textContent = '';
    return;
  }

  const edadStr = calcularEdadPeque(val);
  if (edadStr) {
    badge.textContent = `👶 Edad: ${edadStr}`;
  } else {
    badge.textContent = '';
  }
}
window.actualizarEdadEnFormulario = actualizarEdadEnFormulario;

/**
 * Elimina un peque del formulario de onboarding y limpia sus campos
 */
function eliminarPequeOnboarding(num) {
  const s2 = document.getElementById('section-peque-2');
  const s3 = document.getElementById('section-peque-3');
  const btn = document.getElementById('btn-agregar-peque');

  if (num === 2) {
    // Si Peque 3 está activo, pasar los datos de Peque 3 a Peque 2 y ocultar Peque 3
    if (s3 && s3.style.display !== 'none') {
      const p3Nom = document.getElementById('reg_peque_nombre_3')?.value || '';
      const p3Nac = document.getElementById('reg_peque_nac_3')?.value || '';
      const p3Ale = document.getElementById('reg_alergias_3')?.value || '';
      const p3Con = document.getElementById('reg_condicion_3')?.value || '';
      const p3Sal = document.getElementById('reg_salud_3')?.value || '';
      const p3Pre = document.getElementById('reg_preferencias_3')?.value || '';

      if (document.getElementById('reg_peque_nombre_2')) document.getElementById('reg_peque_nombre_2').value = p3Nom;
      if (document.getElementById('reg_peque_nac_2')) document.getElementById('reg_peque_nac_2').value = p3Nac;
      if (document.getElementById('reg_alergias_2')) document.getElementById('reg_alergias_2').value = p3Ale;
      if (document.getElementById('reg_condicion_2')) document.getElementById('reg_condicion_2').value = p3Con;
      if (document.getElementById('reg_salud_2')) document.getElementById('reg_salud_2').value = p3Sal;
      if (document.getElementById('reg_preferencias_2')) document.getElementById('reg_preferencias_2').value = p3Pre;

      if (typeof actualizarEdadEnFormulario === 'function') {
        actualizarEdadEnFormulario('reg_peque_nac_2', 'reg_peque_edad_badge_2');
      }
      eliminarPequeOnboarding(3);
      return;
    }

    // Limpiar campos de Peque 2
    ['reg_peque_nombre_2', 'reg_peque_nac_2', 'reg_alergias_2', 'reg_condicion_2', 'reg_salud_2', 'reg_preferencias_2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = '';
        el.classList.remove('input-error', 'input-error-shake');
      }
    });
    const badge2 = document.getElementById('reg_peque_edad_badge_2');
    if (badge2) badge2.textContent = '';

    if (s2) s2.style.display = 'none';
    if (btn) btn.style.display = 'block';
    if (typeof mostrarToast === 'function') mostrarToast('Peque 2 eliminado del formulario');
  } else if (num === 3) {
    // Limpiar campos de Peque 3
    ['reg_peque_nombre_3', 'reg_peque_nac_3', 'reg_alergias_3', 'reg_condicion_3', 'reg_salud_3', 'reg_preferencias_3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = '';
        el.classList.remove('input-error', 'input-error-shake');
      }
    });
    const badge3 = document.getElementById('reg_peque_edad_badge_3');
    if (badge3) badge3.textContent = '';

    if (s3) s3.style.display = 'none';
    if (btn) btn.style.display = 'block';
    if (typeof mostrarToast === 'function') mostrarToast('Peque 3 eliminado del formulario');
  }
}
window.eliminarPequeOnboarding = eliminarPequeOnboarding;

