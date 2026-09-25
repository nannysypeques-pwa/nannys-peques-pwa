/**
 * CONFIGURACIÓN DE FIREBASE - ESTIMULACIÓN
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7eALMmiPj7mbWexnve2QSwAQZtbro_GI",
  authDomain: "nyp-estimulacion.firebaseapp.com",
  projectId: "nyp-estimulacion",
  storageBucket: "nyp-estimulacion.firebasestorage.app",
  messagingSenderId: "908989839808",
  appId: "1:908989839808:web:30513e0e4a7c2d65c1b025"
};

let app, db;
try {
  const existingApps = getApps();
  app = existingApps.find(a => a.name === '[DEFAULT]') || initializeApp(firebaseConfig);
  db = getFirestore(app);
  if (!window.__nyp_persistence_estimulacion_init) {
    window.__nyp_persistence_estimulacion_init = true;
    try {
      enableIndexedDbPersistence(db).catch(() => { });
    } catch (_) { }
  }
} catch (e) {
  try {
    app = getApp();
    db = getFirestore(app);
  } catch (_) { }
}

// 2) Segundo Proyecto (Puntos Star)
const firebasePuntosConfig = {
  apiKey: "AIzaSyAmNSefWl31Nj7jEQWxe8W5TbZ-42jWVIU",
  authDomain: "nyp-puntos-star.firebaseapp.com",
  projectId: "nyp-puntos-star",
  storageBucket: "nyp-puntos-star.firebasestorage.app",
  messagingSenderId: "362268843800",
  appId: "1:362268843800:web:6dc1c4796a33df22c0886d"
};

let appPuntos, dbPuntos;
try {
  const existingApps = getApps();
  appPuntos = existingApps.find(a => a.name === 'puntosApp') || initializeApp(firebasePuntosConfig, "puntosApp");
  dbPuntos = getFirestore(appPuntos);
  if (!window.__nyp_persistence_puntos_init) {
    window.__nyp_persistence_puntos_init = true;
    try {
      enableIndexedDbPersistence(dbPuntos).catch(() => { });
    } catch (_) { }
  }
} catch (ePuntos) {
  try {
    appPuntos = getApp("puntosApp");
    dbPuntos = getFirestore(appPuntos);
  } catch (_) { }
}

// 3) Configuración de Autenticación para Puntos Star (Opción A)
const puntosAuthConfig = {
  email: "contacto@nannysypeques.com"
};

/**
 * Obtiene el access_token activo de Supabase desde la sesión en memoria o localStorage
 */
async function _obtenerSupabaseAccessToken() {
  try {
    if (typeof window.getSupabaseClient === 'function') {
      const client = window.getSupabaseClient();
      if (client && client.auth) {
        const { data } = await client.auth.getSession();
        if (data && data.session && data.session.access_token) {
          return data.session.access_token;
        }
      }
    }
  } catch (e) { }

  // Búsqueda en localStorage para llaves de Supabase auth
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        if (item.access_token) return item.access_token;
      }
    }
  } catch (eLs) { }

  if (window.SESION && window.SESION.token && typeof window.SESION.token === 'string' && window.SESION.token.startsWith('eyJ')) {
    return window.SESION.token;
  }

  return null;
}

/**
 * Solicita de forma segura un Firebase Custom Token al Cloudflare Worker
 * validando la sesión activa del usuario en Supabase (Cero claves secretas en cliente).
 */
export async function generarFirebaseCustomToken(userEmail = null) {
  const targetEmail = String(userEmail || (window.SESION && window.SESION.email) || '').trim().toLowerCase();
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const localWorkerUrl = 'http://127.0.0.1:8787';
  const prodWorkerUrl = 'https://nannys-push-worker.nannysypeques.workers.dev';
  
  // Priorizar endpoint local en desarrollo para evitar bloqueos CORS
  const configuredWorkerUrl = isLocal
    ? localWorkerUrl
    : ((window.CONFIG && window.CONFIG.WORKER_URL) ? window.CONFIG.WORKER_URL.replace(/\/+$/, '') : prodWorkerUrl);

  const accessToken = await _obtenerSupabaseAccessToken();

  const tryFetchToken = async (baseUrl) => {
    const endpoint = `${baseUrl}/api/auth/firebase-token`;
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        accessToken: accessToken || '',
        email: targetEmail
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok || !data.customToken) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data.customToken;
  };

  try {
    return await tryFetchToken(configuredWorkerUrl);
  } catch (errPrimary) {
    if (!isLocal && configuredWorkerUrl !== prodWorkerUrl) {
      console.warn("ℹ️ Worker principal no respondió, reintentando con worker de producción...", errPrimary.message);
      return await tryFetchToken(prodWorkerUrl);
    }
    throw errPrimary;
  }
}

/**
 * Asegura que Firebase Auth se encuentre autenticado con una sesión válida.
 * Si no está autenticado o el token anterior expiró, solicita un Custom Token fresco dinámicamente.
 */
export async function asegurarAutenticacionFirebase(authInstance = null, userEmail = null) {
  const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
  const auth = authInstance || firebaseAuthModule.getAuth(db.app);

  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
  }

  // Si ya hay un usuario autenticado y no es anónimo, retornar de inmediato
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    return auth.currentUser;
  }

  const targetEmail = (userEmail || (window.SESION && window.SESION.email) || '').trim().toLowerCase();

  // 1. Probar con el token guardado en SESION si existe
  if (window.SESION && window.SESION.firebaseToken) {
    try {
      const cred = await firebaseAuthModule.signInWithCustomToken(auth, window.SESION.firebaseToken);
      console.log("✅ [Firebase Auth] Autenticado con Custom Token en memoria/caché.");
      return cred.user;
    } catch (eToken) {
      console.warn("ℹ️ [Firebase Auth] Token previo expirado, renovando dinámicamente vía Backend...");
    }
  }

  // 2. Generar Custom Token fresco mediante Cloudflare Worker seguro
  try {
    const freshToken = await generarFirebaseCustomToken(targetEmail);
    const cred = await firebaseAuthModule.signInWithCustomToken(auth, freshToken);
    console.log("✅ [Firebase Auth] Autenticado con nuevo Custom Token seguro para:", targetEmail);

    if (window.SESION) {
      window.SESION.firebaseToken = freshToken;
      try {
        const stored = localStorage.getItem('nyp_sesion');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.firebaseToken = freshToken;
          localStorage.setItem('nyp_sesion', JSON.stringify(parsed));
        }
      } catch (eStorage) { }
    }
    return cred.user;
  } catch (genErr) {
    console.warn("ℹ️ [Firebase Auth] No se pudo obtener Custom Token (modo de lectura/reglas por defecto):", genErr?.message || genErr);
    return auth.currentUser || null;
  }
}

export { db, dbPuntos, puntosAuthConfig };


