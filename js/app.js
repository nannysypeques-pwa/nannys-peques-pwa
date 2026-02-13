// La constante API_URL ahora se toma de CONFIG (en js/config.js)
const API_URL = CONFIG.API_URL;
const VAPID_PUBLIC_KEY = 'BFuZVf-LVmWBDS76oBlDcRPlgwuQMkUvEfh3I5EDl4XH7H3kYWzWMAvk4-8-xYZt61IjaxDgiCMmzq23qUycCg4';


/**
 * Función genérica para interactuar con el backend GAS
 */
async function api(action, payload = {}) {
  const params = new URLSearchParams();
  params.append('action', action);


  // Inyectar Token si existe en la sesión global o localStorage
  let token = null;
  if (typeof SESION !== 'undefined' && SESION.token) token = SESION.token;
  else {
    const stored = localStorage.getItem('nyp_sesion');
    if (stored) {
      try { token = JSON.parse(stored).token; } catch (e) { }
    }
  }


  if (token) {
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


  if (!json.ok) throw new Error(json.error || 'Error desconocido');
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


