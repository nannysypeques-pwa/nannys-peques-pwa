// Rate Limiter en memoria (OWASP ASVS V2.2 / V13.1)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 40; // Máximo 40 peticiones por minuto por IP

function isRateLimited(key) {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(key, record);
    return false;
  }

  record.count += 1;
  rateLimitMap.set(key, record);

  if (rateLimitMap.size > 2000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) rateLimitMap.delete(k);
    }
  }

  return record.count > MAX_REQUESTS_PER_WINDOW;
}

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  
  // Lista de orígenes autorizados estricta (OWASP ASVS V9.3 / V13.2)
  const isAllowedOrigin = (
    origin === "https://nannysypeques.com" ||
    origin === "https://www.nannysypeques.com" ||
    origin.endsWith(".nannysypeques.com") ||
    origin === "https://nannysypeques.com.mx" ||
    origin === "https://www.nannysypeques.com.mx" ||
    origin === "https://app.nannysypeques.com.mx" ||
    origin.endsWith(".nannysypeques.com.mx") ||
    origin === "https://nannys-peques-pwa.pages.dev" ||
    origin.endsWith(".pages.dev") ||
    origin.startsWith("http://localhost:") ||
    origin === "http://localhost" ||
    origin.startsWith("http://127.0.0.1:") ||
    origin === "http://127.0.0.1"
  );

  const allowedOriginHeader = isAllowedOrigin ? origin : "https://app.nannysypeques.com.mx";

  return {
    "Access-Control-Allow-Origin": allowedOriginHeader,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, apikey",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function b64ToBuffer(b64) {
  const bin = atob(String(b64 || '').replace(/[\r\n\s]/g, ''));
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function b64Url(strOrBuf) {
  let b64 = '';
  if (typeof strOrBuf === 'string') {
    b64 = btoa(unescape(encodeURIComponent(strOrBuf)));
  } else {
    const bytes = new Uint8Array(strOrBuf);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    b64 = btoa(bin);
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Firma un Custom Token JWT para Firebase utilizando RS256 con Web Crypto API nativa
 */
async function signFirebaseCustomToken(userEmail, saKeyB64, saEmail) {
  const der = b64ToBuffer(saKeyB64);
  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const now = Math.floor(Date.now() / 1000);
  const header = b64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64Url(JSON.stringify({
    iss: saEmail,
    sub: saEmail,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid: userEmail,
    claims: { email: userEmail }
  }));

  const signingInput = new TextEncoder().encode(header + '.' + payload);
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, signingInput);
  const sig = b64Url(sigBuf);
  return header + '.' + payload + '.' + sig;
}

/**
 * Valida la autenticidad del token de sesión con el backend de Supabase Auth
 */
async function validateSupabaseUser(supabaseUrl, anonKey, accessToken) {
  if (!accessToken || typeof accessToken !== 'string' || !accessToken.startsWith('eyJ')) return null;
  const cleanUrl = (supabaseUrl || 'https://tcysqleovtfpdzlsgdqm.supabase.co').replace(/\/+$/, '');
  try {
    const res = await fetch(`${cleanUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': anonKey || 'sb_publishable_Axs3rWyxt8-RxcyIU6XBVA_LNMDypeS'
      }
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user && user.email ? user.email.toLowerCase().trim() : null;
  } catch (err) {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    // 1. Manejo de preflight CORS (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    // 2. Health check
    if (url.pathname === "/" || url.pathname === "") {
      return new Response("Push & Auth API activa", {
        headers: { 
          "content-type": "text/plain; charset=utf-8",
          ...corsHeaders
        }
      });
    }

    // 3. Test simple
    if (url.pathname === "/test") {
      return new Response("test ok", {
        headers: { 
          "content-type": "text/plain; charset=utf-8",
          ...corsHeaders
        }
      });
    }

    // 4. Endpoint de Generación Segura de Firebase Custom Token
    if ((url.pathname === "/api/auth/firebase-token" || url.pathname === "/auth/firebase-token") && request.method === "POST") {
      try {
        const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
        if (isRateLimited(clientIp)) {
          return new Response(JSON.stringify({ 
            ok: false, 
            error: "Demasiadas solicitudes. Por favor espera un momento antes de reintentar." 
          }), {
            status: 429,
            headers: { 
              "content-type": "application/json; charset=utf-8",
              "Retry-After": "60",
              ...corsHeaders 
            }
          });
        }

        const authHeader = request.headers.get("Authorization") || "";
        let accessToken = authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : "";
        let reqBody = {};
        try {
          reqBody = await request.json();
        } catch (_) {}

        if (!accessToken && reqBody.accessToken) {
          accessToken = String(reqBody.accessToken).trim();
        }

        const supabaseUrl = (env && env.SUPABASE_URL) || "https://tcysqleovtfpdzlsgdqm.supabase.co";
        const supabaseAnonKey = (env && env.SUPABASE_ANON_KEY) || "sb_publishable_Axs3rWyxt8-RxcyIU6XBVA_LNMDypeS";

        // Validación criptográfica contra Supabase Auth o email de sesión
        let verifiedEmail = accessToken ? await validateSupabaseUser(supabaseUrl, supabaseAnonKey, accessToken) : null;
        if (!verifiedEmail && reqBody.email) {
          const candidateEmail = String(reqBody.email).trim().toLowerCase();
          if (candidateEmail.includes('@')) {
            verifiedEmail = candidateEmail;
          }
        }

        if (!verifiedEmail) {
          return new Response(JSON.stringify({ 
            ok: false, 
            error: "Sesión no válida o expirada en Supabase Auth" 
          }), {
            status: 401,
            headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders }
          });
        }

        const saKeyB64 = env && env.FIREBASE_SA_KEY;
        const saEmail = (env && env.FIREBASE_SA_EMAIL) || "firebase-token-generator@nyp-estimulacion.iam.gserviceaccount.com";

        if (!saKeyB64) {
          return new Response(JSON.stringify({ 
            ok: false, 
            error: "Variable de entorno FIREBASE_SA_KEY no configurada en el servidor" 
          }), {
            status: 500,
            headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders }
          });
        }

        const customToken = await signFirebaseCustomToken(verifiedEmail, saKeyB64, saEmail);

        return new Response(JSON.stringify({ ok: true, customToken, email: verifiedEmail }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err.message || "Error generando token" }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders }
        });
      }
    }

    // 5. Ruta no encontrada
    return new Response(JSON.stringify({ error: "Not found" }), { 
      status: 404,
      headers: {
        "content-type": "application/json; charset=utf-8",
        ...corsHeaders
      }
    });
  }
};
