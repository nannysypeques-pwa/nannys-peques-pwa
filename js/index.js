/* =========================================
   VARIABLES GLOBALES
   ========================================= */
let SESION = {
    email: null,
    nombre: '',
    admin: false,
    supervision: false,
    rh: false,
    cliente: false,
    token: null
};

// --- PERSISTENCIA DE ÚLTIMO LOGIN ---
const LAST_LOGIN_KEY = 'nyp_last_login';

// --- CACHÉ DE LLAMADAS AL BACKEND (TTL) ---
let LAST_FETCH = {}; // { key: timestamp }
const DEFAULT_TTL = 30000; // 30 segundos

// --- CACHÉ ESPECÍFICO PARA BITÁCORAS ---
let BITACORA_CACHE = {}; // { 'fecha_idServicio': datos }

// --- ESTADO PARA RESUMEN DE SUPERVISIÓN ---
let RESUMEN_BITACORAS_SUP = {};
let BITACORAS_FECHAS = [];
let BITACORA_INDEX = 0;
let BITACORA_CLIENTE = '';
let BITACORA_FUENTE = [];
let BITACORA_SESSION_ID = 0;


// --- SEGURIDAD: AUTO-LOGOUT POR INACTIVIDAD ---
let logoutTimer;

// --- UTILIDADES ---
function _norm(s) {
    if (!s) return '';
    return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
window._norm = _norm;

function normalizarTexto(v) {
    return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
window.normalizarTexto = normalizarTexto;

/**
 * Aplica una máscara de teléfono (222 222 2222) a un input
 * de forma dinámica mientras el usuario escribe.
 */
function setupPhoneMask(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('input', function (e) {
        // Solo dejar números
        let val = e.target.value.replace(/\D/g, '');

        // Limitar a 10 dígitos
        if (val.length > 10) val = val.substring(0, 10);

        // Formatear: XXX XXX XXXX
        let formatted = '';
        if (val.length > 0) formatted += val.substring(0, 3);
        if (val.length > 3) formatted += ' ' + val.substring(3, 6);
        if (val.length > 6) formatted += ' ' + val.substring(6, 10);

        e.target.value = formatted;
    });

    // También limpiar si pegan algo con formato diferente
    el.addEventListener('blur', function (e) {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 0 && val.length < 10) {
            // Opcional: podrías mostrar un aviso aquí, 
            // pero la validación al guardar se encargará.
        }
    });
}
window.setupPhoneMask = setupPhoneMask;

/**
 * Muestra u oculta el overlay de carga global con un mensaje opcional
 */
function mostrarCargando(show, texto = 'Cargando...') {
    const overlay = document.getElementById('global-loading-overlay');
    const textEl = document.getElementById('global-loading-text');
    if (!overlay) return;

    if (show) {
        if (textEl) textEl.textContent = texto;
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}
window.mostrarCargando = mostrarCargando;

/**
 * Muestra u oculta el overlay de carga con soporte para firmas antiguas y UI de credencial
 */
function mostrarLoading(showOrMsg, msg) {
    const loadingUI = document.getElementById('cred_loading_ui');
    const uploadUI = document.getElementById('cred_upload_ui');
    const imgPrincipal = document.getElementById('cred_foto_principal');
    const loadingText = loadingUI ? loadingUI.querySelector('p') : null;

    let show = true;
    let text = 'Cargando...';

    if (typeof showOrMsg === 'boolean') {
        show = showOrMsg;
        text = msg || 'Cargando...';
    } else {
        text = showOrMsg || 'Cargando...';
    }

    if (show) {
        if (loadingUI) {
            if (loadingText) loadingText.textContent = text;
            loadingUI.style.display = 'flex';
        }
        if (uploadUI) uploadUI.style.display = 'none';
        if (imgPrincipal) imgPrincipal.style.display = 'none';
    } else {
        ocultarLoading();
    }
}

/**
 * Oculta el overlay de carga y restaura la UI de credencial si es necesario
 */
function ocultarLoading() {
    const loadingUI = document.getElementById('cred_loading_ui');
    const uploadUI = document.getElementById('cred_upload_ui');
    const imgPrincipal = document.getElementById('cred_foto_principal');

    if (loadingUI) loadingUI.style.display = 'none';

    // Restaurar visibilidad de foto en la sección de credencial si existe la caché
    if (typeof CACHE_CLIENTE !== 'undefined') {
        if (!CACHE_CLIENTE.profile?.foto && !CACHE_CLIENTE.profile?.imagen) {
            if (uploadUI) uploadUI.style.display = 'block';
        } else {
            if (imgPrincipal) imgPrincipal.style.display = 'block';
        }
    }
}

// Alias para evitar errores por mayúsculas/minúsculas
const ocultarloading = ocultarLoading;
window.ocultarLoading = ocultarLoading;
window.ocultarloading = ocultarloading;
window.mostrarLoading = mostrarLoading;

function mostrarToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}
window.mostrarToast = mostrarToast;

function reiniciarTemporizadorInactividad() {
    clearTimeout(logoutTimer);
    // 30 minutos (1,800,000 ms)
    logoutTimer = setTimeout(() => {
        if (SESION && SESION.token) {
            console.warn('Cierre de sesión automático por inactividad.');
            const eraCliente = !!SESION.cliente;
            const ultimoEmail = SESION.email;

            logout(true); // true = es por inactividad
            mostrarToast('⏱️ Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.');
        }
    }, 1800000);
}

// Inyectar listeners globales para detectar actividad
window.onload = reiniciarTemporizadorInactividad;
document.onmousemove = reiniciarTemporizadorInactividad;
document.onkeypress = reiniciarTemporizadorInactividad;
document.onclick = reiniciarTemporizadorInactividad;


//Inicializar sesión desde localStorage si existe
try {
    const s = localStorage.getItem('nyp_sesion');
    if (s) {
        SESION = JSON.parse(s);

        // 🛡️ Saneamiento: Si el token almacenado contiene un JWT de Supabase (>250 chars o prefijo eyJ),
        // limpiarlo para no interferir con llamadas al backend de Sheets
        if (SESION.token && (typeof SESION.token !== 'string' || SESION.token.length > 250 || SESION.token.startsWith('eyJ'))) {
            SESION.token = null;
        }

        // Si la sesión no cuenta ni con token de backend ni con autenticación de Supabase:
        if (!SESION.token && !SESION.supabaseUid) {
            console.warn('⚠️ Sesión sin credenciales activas detectada en almacenamiento local, cerrando sesión residual...');
            SESION = { email: null, token: null, nombre: '', admin: false, supervision: false, rh: false, cliente: false };
            localStorage.removeItem('nyp_sesion');
        }

        // Autenticar de forma silenciosa de inmediato en Firebase si la sesión está activa
        if (SESION.email) {
            (async () => {
                try {
                    const { asegurarAutenticacionFirebase } = await import('./firebase-config.js');
                    await asegurarAutenticacionFirebase(null, SESION.email);
                } catch (fbErr) {
                    console.warn("⚠️ [Inicio] Firebase Auth silencioso falló (no crítico):", fbErr.message);
                }
            })();
        }
    }
} catch (e) { console.error(e); }

// EXPOSICIÓN GLOBAL EXPLÍCITA
window.SESION = SESION;

let SEM1 = { dias: [], baseISO: null };
let SEM2 = { dias: [], baseISO: null, cargada: false };
let CAL_SERVICIOS = [];
let CAL_SERVICIOS_SIG = [];
let PLANEACIONES_FECHAS = [];
let PLANEACION_INDEX = 0;
let PLANEACION_CLIENTE = null;
let PLANEACION_FUENTE = [];
let CACHE_PLANEACIONES = {};
let SEMANA_CALENDARIO_BASE = null;
let CACHE_PLANEACION_MODAL = {};
let MODO_SOLO_LECTURA = false;
let PLANEACION_SESSION_ID = 0;
const RESUMEN_PLANEACIONES_SUP = {};
let CACHE_CLIENTE = { profile: null, servicios: null, actividades: null }; // Caché para mejorar UX del cliente
let CACHE_NINERA = { servicios: null, planeaciones: null, disponibilidad: null }; // Caché para mejorar UX del panel de niñera
let ADMIN_WEEK_START_ISO = null;

const TIPOS_CON_PLANEACION = [
    'nanny educativa',
    'miss nanny'
];

/* =========================================
   HELPERS FECHA
   ========================================= */
function addDaysISO(iso, n) {
    const base = iso ? new Date(iso + 'T00:00:00') : new Date();
    base.setDate(base.getDate() + n);
    return toISO(base);
}
function startMonday(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay(); const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff); d.setHours(0, 0, 0, 0);
    return d;
}
function toISO(d) {
    const d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return new Date(d2.getTime() - d2.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function normalizarTexto(v) {
    return String(v || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Valida que los links sean imágenes directas o links de Drive válidos.
 * Soporta múltiples links separados por comas.
 */
function validarLinksImagenes(val) {
    if (!val || !val.trim()) return { ok: true, links: [] };
    const links = val.split(',').map(l => l.trim()).filter(l => l.length > 0);
    const validos = [];
    const invalidos = [];

    // Regex para imágenes comunes
    const regDirecto = /\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i;
    // Regex para Drive Directo
    const regDrive = /drive\.google\.com\/uc\?.*id=/i;
    // Regex para otros links directos conocidos
    const regScribd = /scribdassets\.com\/img/i;
    const regBlogger = /blogger\.googleusercontent\.com\/img/i;

    links.forEach(l => {
        if (regDirecto.test(l) || regDrive.test(l) || regScribd.test(l) || regBlogger.test(l)) {
            validos.push(l);
        } else {
            invalidos.push(l);
        }
    });

    if (invalidos.length > 0) {
        return { ok: false, msg: `Link(s) no válidos: ${invalidos.join(', ')}. Recuerda usar links directos de imagen.` };
    }
    return { ok: true, links: validos };
}

/* =========================================
   AUTH
   ========================================= */
function mostrarOlvide() {
    const supaCard = document.getElementById('auth-supabase-card');
    if (supaCard && (supaCard.style.display !== 'none' || localStorage.getItem('nyp_login_mode') === 'supabase')) {
        if (typeof mostrarOlvideSupabase === 'function') {
            mostrarOlvideSupabase();
            return;
        }
    }
    const pasoLogin = document.getElementById('paso-login');
    const pasoOlvide = document.getElementById('paso-olvide');
    if (pasoLogin) pasoLogin.style.display = 'none';
    if (pasoOlvide) pasoOlvide.style.display = 'block';
}
function volverLogin() {
    const supaCard = document.getElementById('auth-supabase-card');
    if (supaCard && (supaCard.style.display !== 'none' || localStorage.getItem('nyp_login_mode') === 'supabase')) {
        if (typeof volverDeOlvide === 'function') {
            volverDeOlvide();
            return;
        }
    }
    const pasoLogin = document.getElementById('paso-login');
    const pasoOlvide = document.getElementById('paso-olvide');
    if (pasoLogin) pasoLogin.style.display = 'block';
    if (pasoOlvide) pasoOlvide.style.display = 'none';
}

async function login(rol) {
    let email, pass, msg;
    if (rol === 'cliente') {
        email = document.getElementById('email-reg').value.trim().toLowerCase();
        pass = document.getElementById('pass-reg').value;
        msg = document.getElementById('msgRegistro');
    } else {
        email = document.getElementById('email').value.trim().toLowerCase();
        pass = document.getElementById('pass').value;
        msg = document.getElementById('msgLogin');
    }

    if (!email || !pass) {
        msg.innerHTML = '<span class="err">Por favor, ingresa tus credenciales.</span>';
        return;
    }

    msg.textContent = 'Validando...';

    try {
        // 🧹 Limpiar sesión/token anterior para que api() no inyecte un token expirado
        SESION.token = null;
        localStorage.removeItem('nyp_sesion');

        const res = await api('login', { email, contrasena: pass, rol: rol });

        // 🔐 Verificar si la cuenta fue inactivada en Supabase
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client) {
            const tableToCheck = (rol === 'cliente' || res?.cliente) ? 'clientes' : (rol === 'staff' ? null : 'nannys');
            if (tableToCheck) {
                const { data: statusCheck } = await client
                    .from(tableToCheck)
                    .select('activo')
                    .eq('email', email)
                    .maybeSingle();
                if (statusCheck && statusCheck.activo === false) {
                    throw new Error("⛔ Tu cuenta se encuentra inactiva. El acceso a la aplicación ha sido bloqueado por la administración.");
                }
            }
        }

        SESION.email = email;
        SESION.token = res?.token || null;
        SESION.nombre = res?.nombre || '';
        SESION.admin = !!res?.admin;
        SESION.supervision = !!res?.supervision;
        SESION.rh = !!res?.rh;
        SESION.cliente = !!res?.cliente;
        SESION.firebaseToken = res?.firebaseToken || null; // 🔐 Guardamos el token en la sesión persistente

        document.body.classList.remove('admin', 'supervision', 'ninera', 'cliente', 'rh', 'en-control-servicios');
        document.documentElement.classList.remove('en-control-servicios');
        if (SESION.admin) {
            document.body.classList.add('admin');
        } else if (SESION.supervision) document.body.classList.add('supervision');
        else if (SESION.rh) document.body.classList.add('rh');
        else if (SESION.cliente) document.body.classList.add('cliente');
        else document.body.classList.add('ninera');

        window.SESION = SESION; // Actualizar referencia global
        localStorage.setItem('nyp_sesion', JSON.stringify(SESION));
        // Guardar persistencia para retorno por inactividad
        localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify({ email: SESION.email, cliente: SESION.cliente }));

        // 🔐 Autenticación silenciosa con Firebase (para reglas de Firestore seguras)
        if (email) {
            (async () => {
                try {
                    const { db, asegurarAutenticacionFirebase } = await import('./firebase-config.js');
                    const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
                    const auth = firebaseAuthModule.getAuth(db.app);
                    await asegurarAutenticacionFirebase(auth, email);
                } catch (fbErr) {
                    console.warn("⚠️ Firebase Auth silenciosa falló (no crítico):", fbErr.message);
                }
            })();
        }


        // --- INICIO CAMBIO PRELOADER ---
        // En vez de mostrar app directo, mostramos preloader
        document.getElementById('auth').style.display = 'none';
        const preloader = document.getElementById('login-preloader');
        if (preloader) preloader.style.display = 'flex';

        msg.textContent = '';

        // 🔥 CARGA DE DATOS REAL (Mientras el preloader está visible)
        const startTime = Date.now();
        const promesasCarga = (async () => {
            try {
                if (SESION.admin) {
                    // ...
                } else if (SESION.supervision) {
                    await Promise.all([cargarPerfil(), actualizarPlaneacionesSupervision()]);
                } else if (SESION.rh) {
                    await cargarPerfil();
                } else if (SESION.cliente) {
                    await mostrarVistaCliente(false, true);
                } else {
                    await mostrarVistaNinera();
                }
            } catch (e) { console.error('Error pre-carga', e); }
        })();

        // Race: Cargar datos vs Timeout de 10 segundos (máximo permitido)
        await Promise.race([
            promesasCarga,
            new Promise(resolve => setTimeout(resolve, 10000))
        ]);

        const tiempoTranscurrido = Date.now() - startTime;
        // Esperar al menos los 6s de la animación del logo (si la carga fue más rápida)
        // O continuar si ya pasaron los 6s (pero máximo 10s por el race anterior).
        const tiempoRestante = Math.max(0, 6000 - tiempoTranscurrido);

        setTimeout(() => {
            // 🛡️ Verificar que la sesión sigue activa (puede haber sido invalidada por logout() durante la carga)
            if (!SESION.token) {
                const preloader = document.getElementById('login-preloader');
                if (preloader) preloader.style.display = 'none';
                return; // Sesión inválida, el logout() ya manejó la UI
            }

            const preloader = document.getElementById('login-preloader');
            if (preloader) {
                preloader.style.transition = 'opacity 0.8s ease';
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    preloader.style.opacity = '1'; // Reset
                }, 800);
            }

            // 🕒 DETERMINAR VISTA ANTES DE MOSTRAR APP
            const headerAdmin = document.getElementById('header-admin');
            if (headerAdmin) headerAdmin.style.display = (SESION.admin || SESION.supervision || SESION.rh) ? 'block' : 'none';

            // Ocultar todos los navs primero
            document.querySelectorAll('.bottom-nav').forEach(n => n.style.display = 'none');

            if (SESION.admin) {
                mostrarVistaAdmin();
            } else if (SESION.supervision) {
                irVista('supervision');
            } else if (SESION.rh) {
                irVista('rh');
            } else if (SESION.cliente) {
                const navDefault = document.querySelector('.bottom-nav:not(#nav-supervision):not(#nav-ventas):not(#nav-rh)');
                if (navDefault) navDefault.style.display = 'flex';
                irVista('inicio');
            } else {
                const navDefault = document.querySelector('.bottom-nav:not(#nav-supervision):not(#nav-ventas):not(#nav-rh)');
                if (navDefault) navDefault.style.display = 'flex';
                irVista('inicio');
            }

            const appDiv = document.getElementById('app');
            appDiv.style.display = 'block';
            appDiv.style.opacity = '0';
            appDiv.style.transition = 'opacity 0.6s ease';

            appDiv.offsetHeight;
            appDiv.style.opacity = '1';

        }, tiempoRestante); // Mantenemos los 6s de marca
        // --- FIN CAMBIO PRELOADER ---

        msg.textContent = '';

    } catch (err) {
        msg.innerHTML = `<span class="err">${err.message}</span>`;
    }
}
window.login = login;

window.login = login;


async function enviarOTP() {
    const email = document.getElementById('email2').value.trim().toLowerCase();
    const msg = document.getElementById('msgOlvide');
    msg.textContent = 'Enviando código...';

    try {
        await api('solicitarOTP', { email });
        msg.innerHTML = `<span class="ok">Código enviado a ${email}</span>`;
    } catch (err) {
        msg.innerHTML = `<span class="err">${err.message}</span>`;
    }
}

async function guardarNueva() {
    const email = document.getElementById('email2').value.trim().toLowerCase();
    const otp = document.getElementById('otp').value.trim();
    const nueva = document.getElementById('npass').value;
    const msg = document.getElementById('msgOlvide');

    msg.textContent = 'Guardando...';

    try {
        await api('establecerContrasena', { email, otp, nueva });
        msg.innerHTML = `<span class="ok">Contraseña actualizada. Ya puedes iniciar sesión.</span>`;
    } catch (err) {
        msg.innerHTML = `<span class="err">${err.message}</span>`;
    }
}

/**
 * Modal de confirmación para cerrar sesión con SweetAlert2
 */
async function confirmarLogout() {
    if (typeof Swal !== 'undefined') {
        const res = await Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir de la sesión actual?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            customClass: {
                popup: 'cs-swal-popup'
            }
        });
        if (res.isConfirmed) {
            logout(false);
        }
    } else {
        if (confirm('¿Estás seguro de que deseas salir de la sesión?')) {
            logout(false);
        }
    }
}
window.confirmarLogout = confirmarLogout;

function logout(isTimeout = false) {
    // Si no es timeout, podríamos querer limpiar la persistencia, 
    // pero el requerimiento pide recordar el usuario. 
    // Así que lo mantenemos en LAST_LOGIN_KEY siempre que se loguee con éxito.

    // Revocación formal de sesión en Supabase Auth (OWASP ASVS 5.0 V3)
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client && client.auth) {
            client.auth.signOut().catch(() => { });
        }
    } catch (_) { }

    localStorage.removeItem('nyp_sesion');
    localStorage.removeItem('nyp_profile_cache');
    localStorage.removeItem('np_usuario_cliente');
    SESION = { email: null, nombre: '', admin: false, supervision: false, rh: false, cliente: false, token: null };

    // Limpiar clases de control de servicios y roles del body y html para restaurar scroll normal
    document.body.classList.remove('admin', 'supervision', 'ninera', 'cliente', 'rh', 'en-control-servicios');
    document.documentElement.classList.remove('en-control-servicios');

    const csView = document.getElementById('adminControlServiciosView');
    if (csView) csView.style.display = 'none';

    document.getElementById('app').style.display = 'none';
    document.getElementById('auth').style.display = 'flex';
    document.querySelectorAll('.bottom-nav').forEach(n => n.style.display = 'none');

    // Limpiar campos por seguridad, pero los rellenaremos si es necesario
    const emailField = document.getElementById('email');
    const passField = document.getElementById('pass');
    const emailRegField = document.getElementById('email-reg');
    const passRegField = document.getElementById('pass-reg');

    if (emailField) emailField.value = '';
    if (passField) passField.value = '';
    if (emailRegField) emailRegField.value = '';
    if (passRegField) passRegField.value = '';

    if (isTimeout) {
        // Redirigir según el último tipo de usuario
        const last = JSON.parse(localStorage.getItem(LAST_LOGIN_KEY) || '{}');
        if (last.cliente) {
            mostrarPortalFamilia();
        } else {
            mostrarLoginStaff();
        }
    } else {
        volverSeleccion();
    }
}

/**
 * Control y revocación de sesión en tiempo real para usuarios inactivados por admin
 */
let _verificandoStatus = false;
async function verificarStatusCuentaUsuario() {
    if (_verificandoStatus) return;
    if (typeof SESION === 'undefined' || !SESION || !SESION.email) return;
    // Administradores, supervisión y rh no se bloquean por este mecanismo
    if (SESION.admin || SESION.supervision || SESION.rh) return;

    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) return;

    _verificandoStatus = true;
    try {
        const isCli = SESION.cliente === true || SESION.cliente === 'true';
        const table = isCli ? 'clientes' : 'nannys';
        const cleanEmail = String(SESION.email || '').trim().toLowerCase();

        const { data, error } = await client
            .from(table)
            .select('activo')
            .ilike('email', cleanEmail)
            .maybeSingle();

        if (!error && data && data.activo === false) {
            console.warn(`🚨 [Sesión Revocada] La cuenta ${SESION.email} ha sido inactivada por el administrador.`);
            await bloquearUsuarioInactivo();
            return;
        }
    } catch (e) {
        console.warn("Error en monitor de status de cuenta:", e);
    } finally {
        _verificandoStatus = false;
    }
}
window.verificarStatusCuentaUsuario = verificarStatusCuentaUsuario;

async function bloquearUsuarioInactivo() {
    console.warn("🚨 Ejecutando bloqueo de sesión para usuario inactivo...");
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client && client.auth) await client.auth.signOut();
    } catch (e) { }

    localStorage.removeItem('nyp_sesion');
    localStorage.removeItem('last_login_data');
    if (typeof SESION !== 'undefined') {
        SESION.token = null;
        SESION.email = null;
        SESION.cliente = false;
        SESION.admin = false;
    }

    if (typeof Swal !== 'undefined') {
        await Swal.fire({
            icon: 'error',
            title: 'Acceso Revocado',
            text: 'Tu cuenta ha sido desactivada por la administración. La sesión ha sido finalizada.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#E84C9A',
            allowOutsideClick: false
        });
    } else {
        alert('Tu cuenta ha sido desactivada por la administración. La sesión ha sido finalizada.');
    }

    window.location.reload();
}
window.bloquearUsuarioInactivo = bloquearUsuarioInactivo;

// Monitor de cuenta activa en segundo plano (cada 15 segundos y al reactivar la app/pestaña)
setInterval(() => {
    if (typeof SESION !== 'undefined' && SESION && SESION.email && !SESION.admin && !SESION.supervision && !SESION.rh) {
        verificarStatusCuentaUsuario();
    }
}, 15000);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (typeof SESION !== 'undefined' && SESION && SESION.email && !SESION.admin && !SESION.supervision && !SESION.rh) {
            verificarStatusCuentaUsuario();
        }
    }
});

/* =========================================
   TABLAS DE TURNOS (DISPONIBILIDAD)
   ========================================= */
function renderTablaTurnos(targetId, data) {
    const cont = document.getElementById(targetId);
    const dias = data.dias;
    let html = '<table><thead><tr><th style="min-width:180px;">Día</th><th>Matutino<br><span class="muted">07–15</span></th><th>Vespertino<br><span class="muted">15–22</span></th></tr></thead><tbody>';
    dias.forEach((d, idx) => {
        html += `<tr><td><div><b>${d.dia}</b><br><span class="muted">${d.fecha}</span></div>
        <div class="day-actions"><button class="btn-ghost" onclick="marcarDiaCompleto('${targetId}', ${idx})">Disponible todo el día</button></div></td>`;
        html += `<td><input type="checkbox" ${d.Matutino ? 'checked' : ''} onchange="toggleTurno('${targetId}',${idx},'Matutino',this.checked)"></td>`;
        html += `<td><input type="checkbox" ${d.Vespertino ? 'checked' : ''} onchange="toggleTurno('${targetId}',${idx},'Vespertino',this.checked)"></td></tr>`;
    });
    html += '</tbody></table>';
    cont.innerHTML = html;
}
function marcarDiaCompleto(targetId, i) {
    const ctx = (targetId === 'tabla2') ? SEM2 : SEM1;
    ctx.dias[i].Matutino = true; ctx.dias[i].Vespertino = true;
    renderTablaTurnos(targetId, ctx);
}
function toggleTurno(targetId, i, key, val) {
    const ctx = (targetId === 'tabla2') ? SEM2 : SEM1;
    ctx.dias[i][key] = !!val;
}
function marcarSemana(targetId, val) {
    const ctx = (targetId === 'tabla2') ? SEM2 : SEM1;
    ctx.dias.forEach(d => { d.Matutino = !!val; d.Vespertino = !!val; });
    renderTablaTurnos(targetId, ctx);
}

/* --- DATA FETCHING (Refactored) --- */

async function cargar(force = false) {
    if (!force && LAST_FETCH['cargar'] && (Date.now() - LAST_FETCH['cargar'] < DEFAULT_TTL)) return;
    LAST_FETCH['cargar'] = Date.now();

    const msg = document.getElementById('msgApp');
    const fechaISO = document.getElementById('fecha').value || null;

    // Si no se fuerza recarga y hay caché disponible para esta fecha, usarlo
    if (!force && CACHE_NINERA.disponibilidad && CACHE_NINERA.disponibilidad.fechaISO === fechaISO) {
        SEM1.baseISO = fechaISO;
        SEM1.dias = CACHE_NINERA.disponibilidad.dias;
        renderTablaTurnos('tabla', SEM1);
        renderResumen('resumen', SEM1.baseISO);
        return;
    }

    msg.textContent = 'Cargando semana...';
    SEM1.baseISO = fechaISO;

    try {
        const res = await api('obtenerDisponibilidad', { email: SESION.email, fechaISO });
        msg.textContent = '';
        SEM1.dias = res.dias;

        // Guardar en caché
        CACHE_NINERA.disponibilidad = {
            fechaISO: fechaISO,
            dias: res.dias
        };

        renderTablaTurnos('tabla', SEM1);
        renderResumen('resumen', SEM1.baseISO);
    } catch (err) {
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

async function cargarSiguiente() {
    const msg = document.getElementById('msgApp');
    const baseISO = document.getElementById('fecha').value || null;
    const nextISO = addDaysISO(baseISO, 7);
    SEM2.baseISO = nextISO;
    msg.textContent = 'Cargando semana siguiente...';

    try {
        const res = await api('obtenerDisponibilidad', { email: SESION.email, fechaISO: nextISO });
        msg.textContent = '';
        SEM2.dias = res.dias;
        SEM2.cargada = true;
        document.getElementById('tablaSiguienteCard').style.display = 'block';
        document.getElementById('resumenCard2').style.display = 'block';
        renderTablaTurnos('tabla2', SEM2);
        renderResumen('resumen2', SEM2.baseISO);
    } catch (err) {
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

function copiarSemanaAnterior() {
    if (!SEM2.cargada) {
        //Pequeño hack para asegurar carga antes de copiar, idealmente se maneja con estado
        cargarSiguiente().then(() => { if (SEM2.cargada) _doCopiar(); });
    }
    else _doCopiar();
}

function _doCopiar() {
    SEM2.dias = SEM1.dias.map(d => ({ fecha: d.fecha, dia: d.dia, Matutino: d.Matutino, Vespertino: d.Vespertino }));
    renderTablaTurnos('tabla2', SEM2); renderResumen('resumen2', SEM2.baseISO);
}

async function guardar() {
    const msg = document.getElementById('msgApp');
    msg.textContent = 'Guardando...';
    const p1 = { dias: SEM1.dias };

    try {
        //Guardar semana 1
        await api('guardarDisponibilidad', { email: SESION.email, dias: SEM1.dias });

        let msgText = 'Disponibilidad guardada.';

        //Guardar semana 2 si cargada
        if (SEM2.cargada) {
            await api('guardarDisponibilidad', { email: SESION.email, dias: SEM2.dias });
            msgText = 'Disponibilidad de ambas semanas guardada.';
            renderResumen('resumen2', SEM2.baseISO);
        }

        // Limpiar caché de disponibilidad para forzar recarga la próxima vez
        CACHE_NINERA.disponibilidad = null;

        msg.innerHTML = `<span class="ok">${msgText}</span>`;
        renderResumen('resumen', SEM1.baseISO);

    } catch (err) {
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

async function renderResumen(targetId, baseISO) {
    const cont = document.getElementById(targetId);
    cont.innerHTML = 'Generando...';
    try {
        const map = await api('obtenerDisponiblesSemana', { email: SESION.email, baseISO });

        const e = SESION.email;
        const porDia = map[e] || {};
        let html = '';
        const fechas = Object.keys(porDia).sort();
        if (!fechas.length) { html = '<p class="muted">Sin turnos en esta semana.</p>'; }
        else {
            fechas.forEach(f => {
                const turns = (porDia[f] || []).sort();
                html += `<div style="margin-bottom:8px;"><b>${f}</b><br>`;
                if (turns.length === 0) { html += '<span class="muted">—</span>'; }
                else { turns.forEach(t => html += `<span class="pill">${t}</span>`); }
                html += '</div>';
            });
        }
        cont.innerHTML = html;

    } catch (err) {
        cont.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

/* =========================================
   SERVICIOS PRÓXIMOS
   ========================================= */

async function refreshServicios() {
    const btn = document.getElementById('btnRefreshSvc');
    const msg = document.getElementById('calMsg');

    btn.textContent = 'Actualizando...';
    msg.textContent = '';

    // Limpiar caché para forzar recarga
    CACHE_NINERA.servicios = null;

    try {
        // Calcular fecha de inicio: Lunes de la semana actual
        const hoy = new Date();
        const diaSemana = hoy.getDay(); // 0=Domingo, 1=Lunes...
        const diasDesdeLunes = (diaSemana + 6) % 7;
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - diasDesdeLunes);
        const fechaInicioISO = toISO(lunes);

        const lista = await api('getServiciosNinera', {
            email: SESION.email,
            dias: 21,
            fecha_inicio: fechaInicioISO
        });

        CAL_SERVICIOS = Array.isArray(lista) ? lista : [];

        // Guardar en caché
        CACHE_NINERA.servicios = CAL_SERVICIOS;

        if (!SEMANA_CALENDARIO_BASE) {
            SEMANA_CALENDARIO_BASE = new Date();
        }

        renderCalendario2Semanas();

        btn.textContent = '🔄 Actualizar';
        msg.textContent = 'Actualizado';
        setTimeout(() => msg.textContent = '', 1200);

    } catch (err) {
        btn.textContent = '🔄 Actualizar';
        msg.innerHTML = `<span class="err">${err.message}</span>`;
    }
}

function actualizarPlaneaciones() {
    //⛔ si hay un modal abierto, no interferir
    if (document.getElementById('planeacionBackdrop').style.display === 'flex') {
        cerrarPlaneacionNeuronanny();
    }
    //🧹 limpiar cache y sesiones
    CACHE_PLANEACIONES = {};
    PLANEACION_SESSION_ID++;
    CACHE_NINERA.planeaciones = null; // Limpiar caché de planeaciones de niñera

    const c1 = document.getElementById('listaPlaneacionesNinera');
    const c2 = document.getElementById('listaPlaneacionesNineraSiguiente');
    if (c1) c1.innerHTML = 'Actualizando planeaciones...';
    if (c2) c2.innerHTML = 'Actualizando planeaciones...';

    cargarResumenPlaneacionesNinera(true); // Forzar recarga
}

function actualizarPlaneacionesSupervision() {
    const btn = document.getElementById('btnRefreshSupervision');
    if (btn) btn.textContent = 'Actualizando...';

    // Limpiar caché del localStorage para forzar recarga real
    localStorage.removeItem('CACHE_PLANEACIONES_SUP_' + SESION.email);

    CACHE_PLANEACIONES = {};
    PLANEACION_SESSION_ID++;

    const c1 = document.getElementById('resumenPlaneacionesActual');
    const c2 = document.getElementById('resumenPlaneacionesSiguiente');
    if (c1) c1.innerHTML = '<p class="muted">Verificando planeaciones...</p>';
    if (c2) c2.innerHTML = '<p class="muted">Verificando planeaciones...</p>';

    const b1 = document.getElementById('resumenBitacorasActual');
    const b2 = document.getElementById('resumenBitacorasSiguiente');
    if (b1) b1.innerHTML = '<p class="muted">Verificando bitácoras...</p>';
    if (b2) b2.innerHTML = '<p class="muted">Verificando bitácoras...</p>';

    cargarResumenPlaneaciones(true);
    cargarResumenBitacoras(true);
}

function actualizarBitacorasSupervision(btn) {
    if (btn) btn.textContent = 'Actualizando...';

    // Limpiar caché específico de bitácoras (LocalStorage + Memoria)
    localStorage.removeItem('CACHE_BITACORAS_SUP_' + SESION.email);
    BITACORA_CACHE = {};
    RESUMEN_BITACORAS_SUP = {};
    BITACORA_SESSION_ID++;

    const c1 = document.getElementById('resumenBitacorasActual');
    const c2 = document.getElementById('resumenBitacorasSiguiente');

    if (c1) c1.innerHTML = '<p class="muted">Actualizando bitácoras...</p>';
    if (c2) c2.innerHTML = '<p class="muted">Actualizando bitácoras...</p>';

    cargarResumenBitacoras(true).then(() => {
        if (btn) btn.textContent = '🔄 Actualizar';
    }).catch(() => {
        if (btn) btn.textContent = '🔄 Actualizar';
    });
}

function cargarResumenBitacoras(force = false) {
    if (!force && LAST_FETCH['cargarResumenBitacoras'] && (Date.now() - LAST_FETCH['cargarResumenBitacoras'] < DEFAULT_TTL)) return Promise.resolve();
    LAST_FETCH['cargarResumenBitacoras'] = Date.now();

    // Asegurar que el canal en tiempo real esté conectado para recibir eventos en vivo
    if (typeof suscribirRealtimePortalServicios === 'function') {
        suscribirRealtimePortalServicios();
    }

    const c1 = document.getElementById('resumenBitacorasActual');
    const c2 = document.getElementById('resumenBitacorasSiguiente') || document.getElementById('resumenBitacorasAnterior');

    const sesEmail = (window.SESION && window.SESION.email) ? window.SESION.email : 'anon';

    if (!force) {
        const cached = localStorage.getItem('CACHE_BITACORAS_SUP_' + sesEmail);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (c1) renderResumenBitacoras(parsed.actual, c1, 'actual');
                if (c2) renderResumenBitacoras(parsed.anterior || parsed.siguiente, c2, 'anterior');
            } catch (e) { console.error("Error al leer caché bitácoras", e); }
        }
    }

    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    const fetchProm = (client && window.BitacorasSupabase?.obtenerResumenDosSemanas)
        ? window.BitacorasSupabase.obtenerResumenDosSemanas()
        : (typeof obtenerResumenBitacorasDosSemanasSupabase === 'function'
            ? obtenerResumenBitacorasDosSemanasSupabase()
            : api('getResumenBitacorasDosSemanas', { email: sesEmail }));

    return fetchProm
        .then(res => {
            if (res) {
                if (c1) renderResumenBitacoras(res.actual, c1, 'actual');
                if (c2) renderResumenBitacoras(res.anterior || res.siguiente, c2, 'anterior');
                try { localStorage.setItem('CACHE_BITACORAS_SUP_' + sesEmail, JSON.stringify(res)); } catch (eLs) { }
            }
        })
        .catch(err => {
            console.error("Error en cargarResumenBitacoras:", err);
            if (client) {
                api('getResumenBitacorasDosSemanas', { email: sesEmail })
                    .then(res => {
                        if (res) {
                            if (c1) renderResumenBitacoras(res.actual, c1, 'actual');
                            if (c2) renderResumenBitacoras(res.anterior || res.siguiente, c2, 'anterior');
                        }
                    }).catch(e => console.error(e));
            }
        });
}

function renderResumenBitacoras(data, cont, prefijo) {
    if (!cont) return;
    if (!data || Object.keys(data).length === 0) {
        cont.innerHTML = '<p class="muted">No hay bitácoras requeridas.</p>';
        return;
    }

    let html = '';
    Object.keys(data).forEach((ciudad, indexCiudad) => {
        const safeCiudad = String(ciudad).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
        const ciudadId = `bitacoras_${prefijo || 'actual'}_ciudad_${safeCiudad}`;
        // REGLA DE MEMORIA: Verificar si ya estaba abierta
        const estabaAbierta = window.CIUDADES_ABIERTAS && window.CIUDADES_ABIERTAS.has(ciudadId);
        const display = estabaAbierta ? 'block' : 'none';
        const icono = estabaAbierta ? '➖' : '➕';

        html += `
            <div class="ciudad-group" style="margin-bottom:15px;">
                <div class="ciudad-header" style="display:flex;align-items:center;gap:10px;cursor:pointer; font-weight:700; color:var(--blue-main); margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:4px;" onclick="toggleCiudad('${ciudadId}')">
                    <span id="${ciudadId}_icon" style="font-size:18px;user-select:none;">${icono}</span>
                    <h4 style="margin:0;display:flex;align-items:center;gap:8px;">
                        <span>📍 ${ciudad}</span>
                        <span style="font-size:11px;font-weight:600;color:var(--text-muted);background:rgba(59,130,246,0.08);padding:1px 8px;border-radius:10px;">${data[ciudad].length} servicios</span>
                    </h4>
                </div>
                <div id="${ciudadId}" style="display:${display}; margin-left:28px; margin-top:6px;">
                    <ul style="list-style:none; padding-left:0; margin:0;">
        `;

        data[ciudad].forEach(s => {
            const colorBitacora = s.tieneBitacora ? '#16a34a' : '#dc2626'; // Mismos que planeaciones (Verde/Rojo)
            const bgBadge = s.aceptada ? '#dcfce7' : '#fef9c3';
            const colorBadge = s.aceptada ? '#166534' : '#854d0e';
            const textoBadge = s.aceptada ? 'aceptadas' : 'pendientes';

            const key = `${prefijo || 'actual'}|${s.cliente}|${s.ninera || ''}`;
            RESUMEN_BITACORAS_SUP[key] = s.dias || [];

            const sClienteSafe = (s.cliente || '').replace(/'/g, "\\'");
            const sNineraSafe = (s.ninera || '').replace(/'/g, "\\'");
            const sTipoSafe = (s.tipo_servicio || '').replace(/'/g, "\\'");

            const handler = `abrirBitacorasClienteDesdeResumen('${sClienteSafe}', '${prefijo || 'actual'}', '${sTipoSafe}', '${sNineraSafe}')`;
            const clienteIdSafe = (s.cliente || '').replace(/[^a-z0-9]/gi, '_');
            const nineraIdSafe = (s.ninera || '').replace(/[^a-z0-9]/gi, '_');

            html += `
                <li style="display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; font-size:14px; cursor:pointer;" onclick="${handler}">
                    <span style="width:10px; height:10px; border-radius:50%; background:${colorBitacora}; flex-shrink:0; margin-top:5px;"></span>
                    <div style="display:flex; flex-direction:column;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-weight:600;">${s.cliente}</span>
                            ${s.tieneBitacora ? `
                                <div style="display:flex; align-items:center; gap:4px;">
                                    <span id="badge-bit-acepta-${prefijo || 'actual'}-${clienteIdSafe}_${nineraIdSafe}" class="badge-bit-acepta" data-cliente="${sClienteSafe}" data-ninera="${sNineraSafe}" data-prefijo="${prefijo || 'actual'}" style="font-size:9px; font-weight:700; text-transform:uppercase; padding:1px 5px; border-radius:4px; background:${bgBadge}; color:${colorBadge}; border:1px solid rgba(0,0,0,0.05); white-space:nowrap;">
                                        ${textoBadge}
                                    </span>
                                    <span id="indicador-rev-${prefijo || 'actual'}-${clienteIdSafe}_${nineraIdSafe}" style="width:8px; height:8px; border-radius:50%; background:${s.revisada ? '#16a34a' : '#3b82f6'}; flex-shrink:0;" title="${s.revisada ? 'Revisado' : 'Pendiente de revisar'}"></span>
                                </div>
                            ` : ''}
                        </div>
                        <span class="muted" style="font-size:12px;">Niñera: ${s.ninera}</span>
                    </div>
                </li>
            `;
        });

        html += `</ul></div></div>`;
    });
    cont.innerHTML = html;
}

/* =========================================================================
   VINCULACIÓN SUPABASE: CONTROL DE SERVICIOS (CLIENTES Y NIÑERAS)
   ========================================================================= */

function getMondayISO_Safe(d) {
    if (typeof getMondayISO === 'function') return getMondayISO(d);
    const date = d ? new Date(d) : new Date();
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const offset = monday.getTimezoneOffset() * 60000;
    return new Date(monday.getTime() - offset).toISOString().slice(0, 10);
}

function addWeeksToISO_Safe(isoStr, numWeeks) {
    if (typeof addWeeksToISO === 'function') return addWeeksToISO(isoStr, numWeeks);
    const parts = (isoStr || getMondayISO_Safe(new Date())).split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + (numWeeks * 7));
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function calcularFechaDiaSemana(lunesIso, diaOffset) {
    if (!lunesIso) return '';
    const parts = lunesIso.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + diaOffset);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function normalizarHoraServicio(horaStr) {
    if (!horaStr) return '';
    const h = String(horaStr).trim();
    const m = h.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (m) {
        return `${m[1].padStart(2, '0')}:${m[2]}`;
    }
    return h;
}

const DIAS_MATRIZ_SEMANAL = [
    { key: 'lun', offset: 0, nombre: 'Lunes' },
    { key: 'mar', offset: 1, nombre: 'Martes' },
    { key: 'mie', offset: 2, nombre: 'Miércoles' },
    { key: 'jue', offset: 3, nombre: 'Jueves' },
    { key: 'vie', offset: 4, nombre: 'Viernes' },
    { key: 'sab', offset: 5, nombre: 'Sábado' },
    { key: 'dom', offset: 6, nombre: 'Domingo' }
];

/**
 * Genera el texto estructurado de los peques para las notas del modal de niñera
 */
function construirNotasPeques(c) {
    if (!c) return '';
    const bloques = [];

    // Peque 1
    if (c.peque_nombre) {
        let b = `👶 ${c.peque_nombre}`;
        if (c.peque_edad && String(c.peque_edad).trim() !== '' && c.peque_edad !== '—') b += `\n• Edad: ${c.peque_edad}`;
        if (c.alergias && String(c.alergias).trim() !== '' && c.alergias !== '—') b += `\n• Alergias: ${c.alergias}`;
        if (c.condicion_medica && String(c.condicion_medica).trim() !== '' && c.condicion_medica !== '—') b += `\n• Condición médica: ${c.condicion_medica}`;
        if (c.salud_actual && String(c.salud_actual).trim() !== '' && c.salud_actual !== '—') b += `\n• Salud actual: ${c.salud_actual}`;
        if (c.preferencias && String(c.preferencias).trim() !== '' && c.preferencias !== '—') b += `\n• Preferencias: ${c.preferencias}`;
        bloques.push(b);
    }

    // Peque 2
    if (c.peque_nombre_2) {
        let b = `👶 ${c.peque_nombre_2}`;
        if (c.peque_edad_2 && String(c.peque_edad_2).trim() !== '' && c.peque_edad_2 !== '—') b += `\n• Edad: ${c.peque_edad_2}`;
        if (c.alergias_2 && String(c.alergias_2).trim() !== '' && c.alergias_2 !== '—') b += `\n• Alergias: ${c.alergias_2}`;
        if (c.condicion_medica_2 && String(c.condicion_medica_2).trim() !== '' && c.condicion_medica_2 !== '—') b += `\n• Condición médica: ${c.condicion_medica_2}`;
        if (c.salud_actual_2 && String(c.salud_actual_2).trim() !== '' && c.salud_actual_2 !== '—') b += `\n• Salud actual: ${c.salud_actual_2}`;
        if (c.preferencias_2 && String(c.preferencias_2).trim() !== '' && c.preferencias_2 !== '—') b += `\n• Preferencias: ${c.preferencias_2}`;
        bloques.push(b);
    }

    // Peque 3
    if (c.peque_nombre_3) {
        let b = `👶 ${c.peque_nombre_3}`;
        if (c.peque_edad_3 && String(c.peque_edad_3).trim() !== '' && c.peque_edad_3 !== '—') b += `\n• Edad: ${c.peque_edad_3}`;
        if (c.alergias_3 && String(c.alergias_3).trim() !== '' && c.alergias_3 !== '—') b += `\n• Alergias: ${c.alergias_3}`;
        if (c.condicion_medica_3 && String(c.condicion_medica_3).trim() !== '' && c.condicion_medica_3 !== '—') b += `\n• Condición médica: ${c.condicion_medica_3}`;
        if (c.salud_actual_3 && String(c.salud_actual_3).trim() !== '' && c.salud_actual_3 !== '—') b += `\n• Salud actual: ${c.salud_actual_3}`;
        if (c.preferencias_3 && String(c.preferencias_3).trim() !== '' && c.preferencias_3 !== '—') b += `\n• Preferencias: ${c.preferencias_3}`;
        bloques.push(b);
    }

    if (c.mascotas && c.mascotas !== '0' && c.mascotas !== 'ninguna') {
        bloques.push(`🐾 Mascotas: ${c.mascotas}`);
    }

    return bloques.join('\n\n');
}

/**
 * Convierte las filas de control_servicios de Supabase en eventos individuales para cada día
 * aplicando las reglas de visibilidad:
 * - Para cliente: solo si row.ok_cliente === true
 * - Para niñera: solo si row.ok_nanny === true
 */
function transformarFilasControlServicios(filas, tipoUsuario, sesionUsuario, mapaClientes = {}) {
    if (!Array.isArray(filas) || filas.length === 0) return [];
    const servicios = [];

    const emailUsuario = (sesionUsuario?.email || '').trim().toLowerCase();
    const nombreUsuario = (sesionUsuario?.nombre || '').trim().toLowerCase();

    filas.forEach(row => {
        if (!row || !row.semana_iso) return;

        let bId = (row.bloque || '').trim().toLowerCase();
        if (!bId && row.observaciones && typeof row.observaciones === 'string' && row.observaciones.includes('<!--bloque:')) {
            const mB = row.observaciones.match(/<!--bloque:(.*?)-->/);
            if (mB) bId = mB[1].trim().toLowerCase();
        }

        // Regla de Visibilidad: Los servicios en bloques de control interno ("Próximos servicios",
        // "Clientes en lista de espera", "Clientes Potenciales") son exclusivamente para gestión interna del admin.
        // NO son visibles para clientes ni niñeras hasta que el admin los traslade a un bloque operativo (fijos, temporales, cancelados o eventuales).
        if (tipoUsuario !== 'admin') {
            const BLOQUES_SOLO_ADMIN = ['proximos_servicios', 'clientes_espera', 'clientes_potenciales'];
            if (BLOQUES_SOLO_ADMIN.includes(bId)) {
                return;
            }
        }

        if (tipoUsuario === 'cliente') {
            // Regla de Visibilidad: solo si ok_cliente está marcado
            const isOkCli = row.ok_cliente === true || row.ok_cliente === 'true' || row.ok_cliente === 1;
            if (!isOkCli) return;

            const rowEmail = (row.cliente_email || '').trim().toLowerCase();
            const rowNombre = (row.cliente_nombre || '').trim().toLowerCase();
            const normRowNombre = typeof normalizarTexto === 'function' ? normalizarTexto(rowNombre) : rowNombre;
            const normSesionNombre = typeof normalizarTexto === 'function' ? normalizarTexto(nombreUsuario) : nombreUsuario;

            const coincideEmail = emailUsuario && rowEmail && emailUsuario === rowEmail;
            const coincideNombre = normSesionNombre && normRowNombre && (
                normRowNombre.includes(normSesionNombre) || normSesionNombre.includes(normRowNombre)
            );

            if (!coincideEmail && !coincideNombre) return;

        } else if (tipoUsuario === 'nanny') {
            // Regla de Visibilidad: solo si ok_nanny está marcado
            const isOkNan = row.ok_nanny === true || row.ok_nanny === 'true' || row.ok_nanny === 1;
            if (!isOkNan) return;

            const rowNanny = (row.nanny_nombre || '').trim().toLowerCase();
            if (!rowNanny || !nombreUsuario) return;

            const normRowNanny = typeof normalizarTexto === 'function' ? normalizarTexto(rowNanny) : rowNanny;
            const normSesionNanny = typeof normalizarTexto === 'function' ? normalizarTexto(nombreUsuario) : nombreUsuario;
            const primerNombreNanny = normSesionNanny.split(' ')[0];

            const coincideNanny = normRowNanny.includes(normSesionNanny) ||
                normSesionNanny.includes(normRowNanny) ||
                (primerNombreNanny.length >= 3 && normRowNanny.includes(primerNombreNanny));

            if (!coincideNanny) return;
        }

        const clientKey = (row.cliente_email || row.cliente_nombre || '').trim().toLowerCase();
        const clientEmailKey = (row.cliente_email || '').trim().toLowerCase();
        const clientNombreKey = (row.cliente_nombre || '').trim().toLowerCase();
        const clientNombreNorm = normalizarTexto(clientNombreKey);

        const infoCliente = mapaClientes[clientKey] ||
            mapaClientes[clientEmailKey] ||
            mapaClientes[clientNombreKey] ||
            mapaClientes[clientNombreNorm] || {};

        // Extraer detalles específicos del servicio si fueron personalizados desde la matriz (eventuales/temporales)
        let detallesSvc = null;
        if (row.observaciones && typeof row.observaciones === 'string') {
            const mDet = row.observaciones.match(/<!--detalles_servicio:(.*?)-->/);
            if (mDet && mDet[1]) {
                try {
                    detallesSvc = JSON.parse(decodeURIComponent(mDet[1]));
                } catch (e) {
                    try { detallesSvc = JSON.parse(mDet[1]); } catch (e2) { }
                }
            }
        }

        const notasPequeDef = construirNotasPeques(infoCliente);
        const notasPeque = (detallesSvc && detallesSvc.notas !== undefined && String(detallesSvc.notas).trim() !== '')
            ? detallesSvc.notas
            : (notasPequeDef || '');

        const ubicacionVal = (detallesSvc && (detallesSvc.ubicacion || detallesSvc.ubicacion_link))
            ? (detallesSvc.ubicacion || detallesSvc.ubicacion_link)
            : (infoCliente.ubicacion || infoCliente.link_ubicacion || infoCliente.link_de_la_ubicacion_del_servicio || infoCliente.ubicacion_link || '');

        const direccionVal = (detallesSvc && (detallesSvc.direccion || detallesSvc.zona))
            ? (detallesSvc.direccion || detallesSvc.zona)
            : (infoCliente.direccion || infoCliente.direccion_del_servicio || row.zona || 'Por confirmar');

        const telefonoVal = (detallesSvc && (detallesSvc.numero_contacto || detallesSvc.telefono))
            ? (detallesSvc.numero_contacto || detallesSvc.telefono)
            : (infoCliente.telefono || infoCliente.numero_contacto || '');

        const edadNinoVal = (detallesSvc && (detallesSvc.edad_peque || detallesSvc.peque_edad))
            ? (detallesSvc.edad_peque || detallesSvc.peque_edad)
            : (infoCliente.peque_edad || '—');

        const emergenciaVal = infoCliente.emergencia || infoCliente.telefonos_de_emergencia || '';
        const cuotaNannyVal = row.tarifa_nanny || infoCliente.tarifa_nanny || '';
        const cuotaClienteVal = row.tarifa_cliente || infoCliente.tarifa_cliente || '';

        let saldoCliVal = (row.saldo_cliente !== undefined && row.saldo_cliente !== null) ? String(row.saldo_cliente).trim() : '';
        if (!saldoCliVal && row.observaciones && typeof row.observaciones === 'string' && row.observaciones.includes('<!--saldo_cliente:')) {
            const mSaldo = row.observaciones.match(/<!--saldo_cliente:(.*?)-->/);
            if (mSaldo) saldoCliVal = mSaldo[1].trim();
        }

        let pagoNanVal = (row.pago_nanny !== undefined && row.pago_nanny !== null) ? String(row.pago_nanny).trim() : '';
        if (!pagoNanVal && row.observaciones && typeof row.observaciones === 'string' && row.observaciones.includes('<!--pago_nanny:')) {
            const mPago = row.observaciones.match(/<!--pago_nanny:(.*?)-->/);
            if (mPago) pagoNanVal = mPago[1].trim();
        }

        // Construir peques_lista para compatibilidad con Estimulación y Supervisión
        const pequesLista = [];
        const p1Nom = infoCliente.peque_nombre || infoCliente.nombre_del_peque;
        if (p1Nom) {
            pequesLista.push({
                nombre: p1Nom,
                nacimiento: infoCliente.peque_nacimiento || infoCliente.fecha_de_nacimiento || infoCliente.fecha_de_nacimiento_del_peque || null
            });
        }
        const p2Nom = infoCliente.peque_nombre_2 || infoCliente.nombre_del_peque_2;
        if (p2Nom) {
            pequesLista.push({
                nombre: p2Nom,
                nacimiento: infoCliente.peque_nacimiento_2 || infoCliente.fecha_de_nacimiento_2 || infoCliente.fecha_de_nacimiento_del_peque_2 || null
            });
        }
        const p3Nom = infoCliente.peque_nombre_3 || infoCliente.nombre_del_peque_3;
        if (p3Nom) {
            pequesLista.push({
                nombre: p3Nom,
                nacimiento: infoCliente.peque_nacimiento_3 || infoCliente.fecha_de_nacimiento_3 || infoCliente.fecha_de_nacimiento_del_peque_3 || null
            });
        }

        const correoClienteFinal = (row.cliente_email || infoCliente.email || '').trim();

        DIAS_MATRIZ_SEMANAL.forEach(diaInfo => {
            const hInicio = normalizarHoraServicio(row[`${diaInfo.key}_inicio`]);
            const hFin = normalizarHoraServicio(row[`${diaInfo.key}_fin`]);

            if (!hInicio && !hFin) return;

            const fechaDia = calcularFechaDiaSemana(row.semana_iso, diaInfo.offset);
            const horarioTexto = (hInicio && hFin) ? `${hInicio} - ${hFin}` : (hInicio || hFin);

            // Determinar si la niñera confirmó su asistencia para ESTE día en particular
            let asistConf = false;
            let evidenciaConf = null;

            const _toMinutes = (str) => {
                if (!str) return null;
                if (typeof horaStringAMinutos === 'function') {
                    const m = horaStringAMinutos(str);
                    if (m !== null) return m;
                }
                const clean = String(str).trim().toLowerCase();
                const isPM = clean.includes('p') || clean.includes('pm');
                const isAM = clean.includes('a') || clean.includes('am');
                const nums = clean.replace(/[^0-9:]/g, '').split(':');
                if (nums.length >= 1) {
                    let h = parseInt(nums[0], 10) || 0;
                    let min = nums.length > 1 ? (parseInt(nums[1], 10) || 0) : 0;
                    if (isPM && h < 12) h += 12;
                    if (isAM && h === 12) h = 0;
                    return (h % 24) * 60 + min;
                }
                return null;
            };

            const checkDayConfirmation = (data) => {
                // 1. Validar que la niñera sea EXACTAMENTE la misma que confirmó (nombre completo idéntico)
                let nannyData = (data.nanny_nombre || '').trim();
                if (!nannyData && data.dias_confirmados) {
                    const primerDia = Object.values(data.dias_confirmados)[0];
                    if (primerDia && primerDia.nanny_nombre) {
                        nannyData = primerDia.nanny_nombre.trim();
                    }
                }
                const nannyRow = (row.nanny_nombre || '').trim();
                if (nannyRow && nannyData) {
                    const normRow = typeof normalizarTexto === 'function' ? normalizarTexto(nannyRow) : nannyRow.toLowerCase().trim();
                    const normData = typeof normalizarTexto === 'function' ? normalizarTexto(nannyData) : nannyData.toLowerCase().trim();
                    if (normRow !== normData) return false;
                }

                // 2. Validar que el cliente sea EXACTAMENTE el mismo
                let cliData = (data.cliente_nombre || data.cliente || '').trim();
                if (!cliData && data.dias_confirmados) {
                    const primerDia = Object.values(data.dias_confirmados)[0];
                    if (primerDia && (primerDia.cliente || primerDia.cliente_nombre)) {
                        cliData = (primerDia.cliente || primerDia.cliente_nombre).trim();
                    }
                }
                const cliRow = (row.cliente_nombre || (infoCliente && infoCliente.nombre) || '').trim();
                if (cliRow && cliData) {
                    const normCliRow = typeof normalizarTexto === 'function' ? normalizarTexto(cliRow) : cliRow.toLowerCase().trim();
                    const normCliData = typeof normalizarTexto === 'function' ? normalizarTexto(cliData) : cliData.toLowerCase().trim();
                    if (normCliRow !== normCliData) return false;
                }

                // Helper para verificar que el horario confirmado coincida con el horario actual de este día
                const validarHorarioCoincide = (confObj) => {
                    if (!confObj || typeof confObj !== 'object') return true;
                    const horConf = (confObj.horario || '').trim();
                    const iniConf = (confObj.hora_inicio || confObj.inicio || '').trim();
                    const finConf = (confObj.hora_fin || confObj.fin || '').trim();

                    if (!horConf && !iniConf && !finConf) return true;

                    const curMinIni = _toMinutes(hInicio);
                    const curMinFin = _toMinutes(hFin);

                    let confMinIni = iniConf ? _toMinutes(iniConf) : null;
                    let confMinFin = finConf ? _toMinutes(finConf) : null;

                    if (horConf && (confMinIni === null || confMinFin === null)) {
                        const partes = horConf.split(/[-–—a]/i).map(x => x.trim()).filter(Boolean);
                        if (partes.length >= 1 && confMinIni === null) confMinIni = _toMinutes(partes[0]);
                        if (partes.length >= 2 && confMinFin === null) confMinFin = _toMinutes(partes[1]);
                    }

                    if (curMinIni !== null && confMinIni !== null && curMinIni !== confMinIni) {
                        return false;
                    }
                    if (curMinFin !== null && confMinFin !== null && curMinFin !== confMinFin) {
                        return false;
                    }
                    return true;
                };

                // 1. Si existe mapa específico por días (dias_confirmados)
                if (data.dias_confirmados && typeof data.dias_confirmados === 'object') {
                    const diaConf = data.dias_confirmados[diaInfo.key] || data.dias_confirmados[fechaDia];
                    if (diaConf) {
                        if (!validarHorarioCoincide(diaConf)) return false;
                        evidenciaConf = diaConf;
                        return true;
                    }
                    return false; // El mapa existe y este día específico no está confirmado aún
                }
                // 2. Si existe array de días confirmados
                if (Array.isArray(data.dias)) {
                    if (data.dias.includes(diaInfo.key) || data.dias.includes(fechaDia)) {
                        if (!validarHorarioCoincide(data)) return false;
                        evidenciaConf = data;
                        return true;
                    }
                    return false; // El array existe y este día no está incluido
                }
                // 3. Fallback legado si no hay desglose por días
                if (data.confirmada === true) {
                    if (!validarHorarioCoincide(data)) return false;
                    evidenciaConf = data;
                    return true;
                }
                return false;
            };

            if (row.asistencia_nanny) {
                let aData = row.asistencia_nanny;
                if (typeof aData === 'string') {
                    try { aData = JSON.parse(aData); } catch (e) { }
                }
                if (checkDayConfirmation(aData)) {
                    asistConf = true;
                }
            }

            if (!asistConf && row.observaciones && typeof row.observaciones === 'string') {
                const mAsist = row.observaciones.match(/<!--asistencia_nanny:(.*?)-->/);
                if (mAsist && mAsist[1]) {
                    try {
                        const p = JSON.parse(mAsist[1]);
                        if (checkDayConfirmation(p)) {
                            asistConf = true;
                        }
                    } catch (e) { }
                }
            }

            // Extraer bitácora para este día desde observaciones si existe
            let bitacoraDia = null;
            if (row.observaciones && typeof row.observaciones === 'string') {
                const regexBit = new RegExp(`<!--bitacora_(?:${diaInfo.key}|${fechaDia}):(.*?)-->`);
                const mBit = row.observaciones.match(regexBit);
                if (mBit && mBit[1]) {
                    try {
                        const parsedBit = JSON.parse(mBit[1]);
                        bitacoraDia = (window.BitacorasSupabase?.formatearRegistro)
                            ? window.BitacorasSupabase.formatearRegistro(parsedBit)
                            : parsedBit;
                        if (window.BITACORA_CACHE) {
                            const normN = typeof _norm === 'function' ? _norm(row.nanny_nombre || '') : (row.nanny_nombre || '').toLowerCase();
                            const cK = `${fechaDia}_${correoClienteFinal || row.cliente_nombre || 'Cliente'}_${normN}`;
                            window.BITACORA_CACHE[cK] = bitacoraDia;
                        }
                    } catch (eBit) { }
                }
            }

            servicios.push({
                id: `${row.id || 'srv'}_${diaInfo.key}`,
                bitacora_datos: bitacoraDia,
                bitacora_aceptada: !!(bitacoraDia && (bitacoraDia.Acepta === 'Sí' || bitacoraDia.acepta === 'Sí' || bitacoraDia.estado === 'aprobada' || bitacoraDia.fecha_acepta)),
                estado_bitacora: (bitacoraDia && (bitacoraDia.Acepta === 'Sí' || bitacoraDia.acepta === 'Sí' || bitacoraDia.estado === 'aprobada' || bitacoraDia.fecha_acepta)) ? 'aprobada' : (bitacoraDia?.estado || 'borrador'),
                row_id: row.id,
                dia_clave: diaInfo.key,
                semana_iso: row.semana_iso,
                Fecha: fechaDia,
                fecha: fechaDia,
                hora_inicio: hInicio || hFin || '',
                hora_fin: hFin || '',
                Horario: horarioTexto,
                nombre_ninera: row.nanny_nombre || 'Por asignar',
                'Nombre de la niñera': row.nanny_nombre || 'Por asignar',
                cliente: row.cliente_nombre || infoCliente.nombre || 'Cliente',
                cliente_nombre: row.cliente_nombre || infoCliente.nombre || 'Cliente',
                cliente_email: correoClienteFinal,
                email: correoClienteFinal,
                correo_cliente: correoClienteFinal,
                peques_lista: pequesLista,
                zona: direccionVal || row.zona || '',
                tipo_servicio: row.tipo_servicio || 'Servicio',
                bloque: row.bloque || bId || 'servicios_fijos',
                confirmado_en: asistConf ? (evidenciaConf?.confirmado_en || 'Confirmado') : '',
                estado: (evidenciaConf?.fin_real) ? 'completado' : ((evidenciaConf?.inicio_real) ? 'en curso' : (asistConf ? 'confirmado' : 'pendiente')),
                inicio_real: evidenciaConf?.inicio_real || '',
                fin_real: evidenciaConf?.fin_real || '',
                asistencia_confirmada: asistConf,
                asistencia_evidencia: evidenciaConf,
                ok_cliente: !!row.ok_cliente,
                ok_nanny: !!row.ok_nanny,
                ver: true,
                observaciones: row.observaciones || '',
                alerta: row.alerta || '',
                tarifa: cuotaNannyVal,
                tarifa_nanny: cuotaNannyVal,
                cuota_nanny: cuotaNannyVal,
                tarifa_cliente: cuotaClienteVal,
                cuota_cliente: cuotaClienteVal,
                saldo_cliente: saldoCliVal,
                pago_nanny: pagoNanVal,
                Direccion: direccionVal,
                direccion: direccionVal,
                Ubicacion: ubicacionVal,
                ubicacion: ubicacionVal,
                ubicacion_link: ubicacionVal,
                telefono: telefonoVal,
                numero_contacto: telefonoVal,
                emergencia: emergenciaVal,
                numero_de_emergencia: emergenciaVal,
                edad_nino: edadNinoVal,
                peque_nombre: infoCliente.peque_nombre || '',
                peque_edad: edadNinoVal,
                detalles_servicio: detallesSvc,
                notas: notasPeque || row.observaciones || ''
            });
        });
    });

    return servicios;
}

/**
 * Parsea un string que contiene una fecha en múltiples formatos en español o numéricos,
 * o detecta si es directamente una edad expresada en texto.
 * Retorna { esEdadTexto: boolean, fechaObj: Date|null, textoEdad: string|null }
 */
function interpretarFechaOEdadPeque(str) {
    if (!str || typeof str !== 'string') return null;
    let s = str.trim();
    if (!s || s === '—' || s === '-' || s.toLowerCase() === 'no especificada') return null;

    // 1. Limpieza de prefijos/sufijos
    s = s.replace(/^[•\-\*▦🎂👶\s:]+/, '').replace(/[\*]+$/g, '').trim();

    // 2. Verificar si ya es una edad expresada directamente en texto
    // Ej: "2 años", "6 años", "2 meses", "1 año y 3 meses", "3 años 6 meses", "5 meses", "1 año", "18 meses", "recién nacido"
    const esTextoEdadPuro = /^\s*(?:recién\s+nacido|\d+\s*(?:años?|anos?|mes(?:es)?|días?|dias?|semanas?)(?:\s*(?:y|,|\+)\s*\d+\s*(?:años?|anos?|mes(?:es)?|días?|dias?|semanas?))?)\s*$/i.test(s);
    if (esTextoEdadPuro) {
        return { esEdadTexto: true, fechaObj: null, textoEdad: s };
    }

    const MESES = {
        enero: 0, ene: 0,
        febrero: 1, feb: 1,
        marzo: 2, mar: 2,
        abril: 3, abr: 3,
        mayo: 4, may: 4,
        junio: 5, jun: 5,
        julio: 6, jul: 6,
        agosto: 7, ago: 7,
        septiembre: 8, setiembre: 8, sep: 8, set: 8,
        octubre: 9, oct: 9,
        noviembre: 10, nov: 10,
        diciembre: 11, dic: 11
    };

    // 3. Formato con mes en texto: "7 de enero de 2024", "15 de mayo del 2021", "20 enero 24", "8/nov/2023", "12-marzo-2022"
    const matchMesTexto = s.match(/(\d{1,2})\s*(?:de|\/|\-|\.|\s)\s*([a-záéíóú]+)\s*(?:del?|\/|\-|\.|\s)?\s*(\d{2,4})/i);
    if (matchMesTexto) {
        const dia = parseInt(matchMesTexto[1], 10);
        const mesNombre = matchMesTexto[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let anio = parseInt(matchMesTexto[3], 10);
        if (anio < 100) anio += anio <= 40 ? 2000 : 1900;
        if (MESES[mesNombre] !== undefined && dia >= 1 && dia <= 31) {
            const d = new Date(anio, MESES[mesNombre], dia);
            if (!isNaN(d.getTime())) {
                const fnCalc = typeof window.calcularEdadPeque === 'function' ? window.calcularEdadPeque : calcularEdadPeque;
                const edadCalculada = typeof fnCalc === 'function' ? fnCalc(d, 'completo') : '';
                if (edadCalculada) {
                    return { esEdadTexto: false, fechaObj: d, textoEdad: edadCalculada };
                }
            }
        }
    }

    // 4. Formatos numéricos: dd/mm/aaaa, dd/mm/aa, dd.mm.aaaa, dd.mm.aaa, dd.mm.aa, dd-mm-aaaa, yyyy-mm-dd
    const matchNum = s.match(/(\d{1,4})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/);
    if (matchNum) {
        let p1 = parseInt(matchNum[1], 10);
        let p2 = parseInt(matchNum[2], 10);
        let p3 = parseInt(matchNum[3], 10);
        let dia, mes, anio;

        if (p1 > 1000) {
            // yyyy-mm-dd
            anio = p1;
            mes = p2 - 1;
            dia = p3;
        } else {
            // dd/mm/yyyy o dd/mm/yy
            dia = p1;
            mes = p2 - 1;
            anio = p3;
            if (anio < 100) anio += anio <= 40 ? 2000 : 1900;
        }

        if (mes >= 0 && mes <= 11 && dia >= 1 && dia <= 31 && anio > 1900) {
            const d = new Date(anio, mes, dia);
            if (!isNaN(d.getTime())) {
                const fnCalc = typeof window.calcularEdadPeque === 'function' ? window.calcularEdadPeque : calcularEdadPeque;
                const edadCalculada = typeof fnCalc === 'function' ? fnCalc(d, 'completo') : '';
                if (edadCalculada) {
                    return { esEdadTexto: false, fechaObj: d, textoEdad: edadCalculada };
                }
            }
        }
    }

    // 5. Si contiene "X años" o "X meses" embebido en texto
    const matchEdadParcial = s.match(/\b(\d+\s*(?:años?|anos?|mes(?:es)?|días?|dias?)(?:\s*(?:y|,|\+)\s*\d+\s*(?:mes(?:es)?|días?|dias?))?)\b/i);
    if (matchEdadParcial) {
        return { esEdadTexto: true, fechaObj: null, textoEdad: matchEdadParcial[1].trim() };
    }

    // 6. Fallback con new Date nativo
    try {
        const d = new Date(s);
        if (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d <= new Date()) {
            const fnCalc = typeof window.calcularEdadPeque === 'function' ? window.calcularEdadPeque : calcularEdadPeque;
            const edadCalculada = typeof fnCalc === 'function' ? fnCalc(d, 'completo') : '';
            if (edadCalculada) {
                return { esEdadTexto: false, fechaObj: d, textoEdad: edadCalculada };
            }
        }
    } catch (e) { }

    // Si no es fecha válida pero es texto no vacío, devolver como está
    return { esEdadTexto: true, fechaObj: null, textoEdad: s };
}

/**
 * Renderiza las fichas de información del peque para Servicios Eventuales y Temporales
 * Secuencia estricta solicitada:
 * 1. Nombre del peque
 * 2. Edad del peque (calculada dinámicamente desde fecha o texto directo, con soporte para múltiples peques)
 * 3. Resto de la información (alergias, condición médica, estado de salud, preferencias, mascotas, indicaciones)
 */
function renderizarFichasPequesEventuales(s, container) {
    if (!container) return;
    const rawNotas = s.notas || '';
    const lines = rawNotas
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('<!--'));

    // --- A. Extraer Nombre(s) de Peque(s) ---
    let rawNombrePeque = (s.peque_nombre || s.detalles_servicio?.peque_nombre || '').trim();
    const nombresExtraidos = [];

    lines.forEach(line => {
        const lower = line.toLowerCase();
        if (/nombre(?:\s+del)?\s+peque/i.test(lower) || /^[\s•\*👶👫]*nombre\s*:/i.test(lower)) {
            const parts = line.split(':');
            if (parts.length > 1) {
                const candidate = parts.slice(1).join(':').replace(/^[•\-\*:]+\s*/, '').replace(/\*+$/g, '').trim();
                if (candidate && candidate !== '—') rawNombrePeque = candidate;
            } else {
                const m = line.match(/\*?(?:nombre(?:\s+del)?\s+peque)\*?\s*[:\-]?\s*(.+)/i);
                if (m && m[1]) {
                    const candidate = m[1].replace(/^[•\-\*:]+\s*/, '').replace(/\*+$/g, '').trim();
                    if (candidate && candidate !== '—') rawNombrePeque = candidate;
                }
            }
        }
    });

    if (rawNombrePeque && rawNombrePeque !== '—') {
        const splitNombres = rawNombrePeque.split(/\s*(?:,|y|&|\/)\s*/i).filter(n => n.trim().length > 0);
        splitNombres.forEach(n => nombresExtraidos.push(n.trim()));
    }

    // --- B. Extraer y Calcular Edades de 1 o más Peques ---
    const listaEdades = []; // { nombre: '', edad: '' }
    const segmentosEdad = [];

    // 1. Revisar peques_lista si viene poblada
    if (Array.isArray(s.peques_lista) && s.peques_lista.length > 0) {
        s.peques_lista.forEach(p => {
            const valorNacOEdad = p.nacimiento || p.edad;
            if (valorNacOEdad) {
                const res = interpretarFechaOEdadPeque(valorNacOEdad);
                if (res && res.textoEdad) {
                    listaEdades.push({
                        nombre: p.nombre || '',
                        edad: res.textoEdad
                    });
                }
            }
        });
    }

    // 2. Si no viene en peques_lista, buscar en líneas de notas
    if (listaEdades.length === 0) {
        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (/edad(?:\/fecha)?(?:\s+de)?\s+nacimiento/i.test(lower) || /^[\s•\*👶▦🎂]*edad(?:\s+del\s+peque)?\s*:/i.test(lower)) {
                const parts = line.split(':');
                if (parts.length > 1) {
                    const candidate = parts.slice(1).join(':').replace(/^[•\-\*:]+\s*/, '').replace(/\*+$/g, '').trim();
                    if (candidate && candidate !== '—') {
                        segmentosEdad.push(candidate);
                    }
                } else {
                    const m = line.match(/\*?(?:edad(?:\/fecha)?(?:\s+de)?\s+nacimiento|edad)\*?\s*[:\-]?\s*(.+)/i);
                    if (m && m[1]) {
                        const candidate = m[1].replace(/^[•\-\*:]+\s*/, '').replace(/\*+$/g, '').trim();
                        if (candidate && candidate !== '—') {
                            segmentosEdad.push(candidate);
                        }
                    }
                }
            }
        });

        // 3. Si aún no hay segmentos de edad en notas, revisar campos directos
        if (segmentosEdad.length === 0) {
            const camposDirectos = [
                s.edad_peque, s.peque_edad, s.edad_nino,
                s.detalles_servicio?.edad_peque, s.detalles_servicio?.peque_edad,
                s.peque_nacimiento, s.peque_nacimiento_2, s.peque_nacimiento_3
            ];
            camposDirectos.forEach(c => {
                if (c && typeof c === 'string' && c.trim() && c !== '—' && !segmentosEdad.includes(c.trim())) {
                    segmentosEdad.push(c.trim());
                }
            });
        }

        // 4. Procesar segmentos de edad (soporte para múltiples fechas/edades en una sola línea o separadas)
        segmentosEdad.forEach(seg => {
            // Caso A: Pares tipo "Ander: 07/01/2024, Sofía: 15/05/2021"
            if (seg.includes(':') && (seg.includes(',') || seg.includes('\n') || seg.includes(';'))) {
                const subPartes = seg.split(/[,;\n]+/).filter(Boolean);
                subPartes.forEach(sp => {
                    const spParts = sp.split(':');
                    if (spParts.length >= 2) {
                        const subNom = spParts[0].trim();
                        const subVal = spParts.slice(1).join(':').trim();
                        const res = interpretarFechaOEdadPeque(subVal);
                        if (res && res.textoEdad) {
                            listaEdades.push({ nombre: subNom, edad: res.textoEdad });
                        }
                    } else {
                        const res = interpretarFechaOEdadPeque(sp);
                        if (res && res.textoEdad) {
                            listaEdades.push({ nombre: '', edad: res.textoEdad });
                        }
                    }
                });
                return;
            }

            // Caso B: Fechas/edades separadas por comas, punto y coma, o " y " entre fechas
            const partes = seg.split(/\s*[,;]\s*|\s+y\s+(?=\d{1,2}[\/\.\-]|(?:\d+|un|una)\s*(?:año|ano|mes|día))/i).filter(Boolean);
            partes.forEach(p => {
                const res = interpretarFechaOEdadPeque(p.trim());
                if (res && res.textoEdad) {
                    listaEdades.push({ nombre: '', edad: res.textoEdad });
                }
            });
        });
    }

    // Asociar nombres extraídos si hay más de 1 edad y faltan nombres individuales
    if (listaEdades.length > 1) {
        listaEdades.forEach((item, idx) => {
            if (!item.nombre && nombresExtraidos[idx]) {
                item.nombre = nombresExtraidos[idx];
            }
        });
    }

    // --- C. Resto de la información (alergias, condición médica, salud, preferencias, mascotas, indicaciones) ---
    const restoItems = [];
    lines.forEach(line => {
        const lower = line.toLowerCase();

        // Omitir líneas ya procesadas (nombre y edad/nacimiento)
        if (/nombre(?:\s+del)?\s+peque/i.test(lower) || /^[\s•\*👶👫]*nombre\s*:/i.test(lower)) return;
        if (/edad(?:\/fecha)?(?:\s+de)?\s+nacimiento/i.test(lower) || /^[\s•\*👶▦🎂]*edad(?:\s+del\s+peque)?\s*:/i.test(lower)) return;

        let l = line.trim();
        let emoji = '';
        const emojiMatch = l.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uE000-\uF8FF]|🐾|🗣️?|🫀|🩺|🌈|🐶🐱|🐶|🐱|❤️|📝|👶|🧸|🎂|✨|•)+/u);
        if (emojiMatch) {
            emoji = emojiMatch[0].trim();
            l = l.slice(emojiMatch[0].length).trim();
        }
        l = l.replace(/^[•\-\*]\s*/, '').trim();

        let label = '';
        let val = '';

        if (l.includes(':')) {
            const colonIdx = l.indexOf(':');
            label = l.substring(0, colonIdx).replace(/\*/g, '').trim();
            val = l.substring(colonIdx + 1).replace(/\*/g, '').trim();
        } else if (l.includes('*')) {
            const m = l.match(/\*(.*?)\*(.*)/);
            if (m) {
                label = m[1].trim();
                val = m[2].trim();
            } else {
                val = l.replace(/\*/g, '').trim();
            }
        } else {
            val = l;
        }

        if (!emoji) {
            const lowerLabel = (label || val).toLowerCase();
            if (lowerLabel.includes('alergia')) emoji = '🗣️';
            else if (lowerLabel.includes('médic') || lowerLabel.includes('medic') || lowerLabel.includes('condici')) emoji = '🫀';
            else if (lowerLabel.includes('salud')) emoji = '🩺';
            else if (lowerLabel.includes('preferencia') || lowerLabel.includes('favorit') || lowerLabel.includes('jugar')) emoji = '🌈';
            else if (lowerLabel.includes('mascota') || lowerLabel.includes('perro') || lowerLabel.includes('gato')) emoji = '🐶🐱';
            else if (lowerLabel.includes('indicaci') || lowerLabel.includes('nanny') || lowerLabel.includes('cuidado') || lowerLabel.includes('nota')) emoji = '❤️';
            else emoji = '•';
        }

        if (val || label) {
            restoItems.push({ emoji, label, val });
        }
    });

    const fragment = document.createDocumentFragment();

    // --- FICHA 1: Nombre del peque (o Nombres de los peques) ---
    if (rawNombrePeque && rawNombrePeque !== '—') {
        const cardNombre = document.createElement('div');
        cardNombre.className = 'peque-profile-card cs-ficha-eventual cs-ficha-nombre';
        cardNombre.style.cssText = 'background:#FFF5F9; border:1px solid #FCE7F3; border-left:4px solid var(--pink-main, #E11D48); border-radius:12px; padding:10px 14px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.03); display:flex; align-items:center; gap:12px; box-sizing:border-box; width:100%;';

        const labelFichaNombre = nombresExtraidos.length > 1 ? 'Nombres de los peques' : 'Nombre del peque';

        cardNombre.innerHTML = `
            <div style="width:36px; height:36px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 1px 2px rgba(0,0,0,0.08); flex-shrink:0;">
                👶
            </div>
            <div style="flex:1; min-width:0;">
                <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#BE185D; margin-bottom:2px;">
                    ${escapeHtml(labelFichaNombre)}
                </div>
                <div style="font-size:15px; font-weight:700; color:#1F2937; word-break:break-word;">
                    ${escapeHtml(rawNombrePeque)}
                </div>
            </div>
        `;
        fragment.appendChild(cardNombre);
    }

    // --- FICHA 2: Edad del peque (calculada dinámicamente con soporte múltiple) ---
    if (listaEdades.length > 0) {
        const cardEdad = document.createElement('div');
        cardEdad.className = 'peque-profile-card cs-ficha-eventual cs-ficha-edad';
        cardEdad.style.cssText = 'background:#FFF5F9; border:1px solid #FCE7F3; border-left:4px solid var(--pink-main, #E11D48); border-radius:12px; padding:10px 14px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.03); display:flex; align-items:center; gap:12px; box-sizing:border-box; width:100%;';

        if (listaEdades.length === 1) {
            // Un solo peque
            cardEdad.innerHTML = `
                <div style="width:36px; height:36px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 1px 2px rgba(0,0,0,0.08); flex-shrink:0;">
                    🎂
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#BE185D; margin-bottom:2px;">
                        Edad del peque
                    </div>
                    <div style="font-size:15px; font-weight:700; color:#1F2937; word-break:break-word;">
                        ${escapeHtml(listaEdades[0].edad)}
                    </div>
                </div>
            `;
        } else {
            // Múltiples peques
            const edadesHtml = listaEdades.map((item, idx) => `
                <div style="display:flex; align-items:center; gap:8px; font-size:13.5px; line-height:1.4;">
                    <span style="font-size:14px; flex-shrink:0;">👶</span>
                    ${item.nombre ? `<strong style="color:#BE185D;">${escapeHtml(item.nombre)}:</strong>` : `<span style="color:#6B7280; font-size:12px; font-weight:600;">Peque ${idx + 1}:</span>`}
                    <span style="font-weight:700; color:#1F2937;">${escapeHtml(item.edad)}</span>
                </div>
            `).join('');

            cardEdad.innerHTML = `
                <div style="width:36px; height:36px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 1px 2px rgba(0,0,0,0.08); flex-shrink:0; align-self:flex-start; margin-top:2px;">
                    🎂
                </div>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#BE185D; margin-bottom:4px;">
                        Edades de los peques (${listaEdades.length})
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        ${edadesHtml}
                    </div>
                </div>
            `;
        }

        fragment.appendChild(cardEdad);
    }

    // --- FICHA 3: Resto de la información (Alergias, Condición médica, Estado de salud, Preferencias, Mascotas, Indicaciones) ---
    if (restoItems.length > 0) {
        const cardResto = document.createElement('div');
        cardResto.className = 'peque-profile-card cs-ficha-eventual cs-ficha-resto';
        cardResto.style.cssText = 'background:#FFF5F9; border:1px solid #FCE7F3; border-left:4px solid var(--pink-main, #E11D48); border-radius:12px; padding:12px 14px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.03); box-sizing:border-box; width:100%;';

        const itemsHtml = restoItems.map(item => `
            <div style="display:flex; align-items:flex-start; gap:8px; font-size:13px; line-height:1.4; color:#374151;">
                <span style="font-size:15px; flex-shrink:0; line-height:1.2;">${escapeHtml(item.emoji)}</span>
                <div style="flex:1;">
                    ${item.label ? `<strong style="color:#4B5563;">${escapeHtml(item.label)}:</strong> ` : ''}
                    <span style="color:#1F2937;">${escapeHtml(item.val)}</span>
                </div>
            </div>
        `).join('');

        cardResto.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #FCE7F3;">
                <div style="width:28px; height:28px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; box-shadow:0 1px 2px rgba(0,0,0,0.08); flex-shrink:0;">
                    📋
                </div>
                <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#BE185D;">
                    Información y Cuidados
                </span>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
                ${itemsHtml}
            </div>
        `;
        fragment.appendChild(cardResto);
    }

    if (fragment.children.length === 0) {
        if (rawNotas && rawNotas !== '—') {
            container.textContent = rawNotas;
        } else {
            container.innerHTML = '<span class="text-muted" style="color:#9ca3af; font-size:13px;">Sin información adicional del peque</span>';
        }
    } else {
        container.appendChild(fragment);
    }
}

/**
 * Suscribe a los usuarios (clientes y niñeras) a los cambios en tiempo real en control_servicios
 */
function suscribirRealtimePortalServicios() {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client || window._portalServiciosSubscribed) return;
    window._portalServiciosSubscribed = true;

    try {
        client.channel('realtime_portal_servicios')
            .on('broadcast', { event: 'bitacora_live' }, (payload) => {
                const data = payload?.payload;
                if (!data) return;
                console.log('⚡ [Realtime Portal] Bitácora en vivo recibida:', data);
                if (data.registro && window.BITACORA_CACHE) {
                    const normN = typeof _norm === 'function' ? _norm(data.ninera || '') : (data.ninera || '').toLowerCase();
                    const cK = `${data.fecha}_${data.cliente}_${normN}`;
                    const cKExact = `${data.fecha}_${data.email || data.cliente}_${normN}`;
                    const cKSimple = `${data.fecha}_${data.cliente}`;
                    window.BITACORA_CACHE[cK] = data.registro;
                    window.BITACORA_CACHE[cKExact] = data.registro;
                    window.BITACORA_CACHE[cKSimple] = data.registro;
                }
                if (window.BITACORA_SERVICIO_ACTUAL && (data.fecha === window.BITACORA_SERVICIO_ACTUAL.fecha || data.servicio_id === window.BITACORA_SERVICIO_ACTUAL.id)) {
                    if (typeof _llenarFormularioBitacora === 'function') {
                        _llenarFormularioBitacora(data.registro);
                    }
                    if (typeof _actualizarEstadoBtnLeido === 'function') {
                        _actualizarEstadoBtnLeido(data.registro);
                    }
                    if (typeof _actualizarEstadoBtnRevisado === 'function') {
                        _actualizarEstadoBtnRevisado(data.registro);
                    }
                }
                if (window.ClienteServicios && typeof window.ClienteServicios.renderBitacora === 'function') {
                    window.ClienteServicios.renderBitacora();
                }

                // ⚡ Si la vista de supervisión está abierta o existe en el DOM, recargar automáticamente
                if (document.getElementById('resumenBitacorasActual') || (SESION && (SESION.admin || SESION.supervision))) {
                    console.log('⚡ [Realtime Supervisión] Recargando resumen de bitácoras por evento en vivo...');
                    // Actualización visual inmediata de badges de aceptación si corresponde
                    if (data.status === 'aprobada' || data.estado === 'aprobada' || data.status === 'aceptada' || data.registro?.Acepta === 'Sí') {
                        const cliCleanNorm = typeof _norm === 'function' ? _norm(data.cliente || '') : (data.cliente || '').toLowerCase().trim();
                        const ninCleanNorm = typeof _norm === 'function' ? _norm(data.ninera || '') : (data.ninera || '').toLowerCase().trim();
                        document.querySelectorAll('.badge-bit-acepta').forEach(el => {
                            const elCli = typeof _norm === 'function' ? _norm(el.dataset.cliente || '') : (el.dataset.cliente || '').toLowerCase().trim();
                            const elNin = typeof _norm === 'function' ? _norm(el.dataset.ninera || '') : (el.dataset.ninera || '').toLowerCase().trim();
                            if (elCli && cliCleanNorm && (elCli.includes(cliCleanNorm) || cliCleanNorm.includes(elCli))) {
                                if (!elNin || !ninCleanNorm || elNin.includes(ninCleanNorm) || ninCleanNorm.includes(elNin)) {
                                    el.textContent = 'aceptadas';
                                    el.style.background = '#dcfce7';
                                    el.style.color = '#166534';
                                }
                            }
                        });
                    }

                    if (typeof cargarResumenBitacoras === 'function') {
                        cargarResumenBitacoras(true);
                    }
                }
            })
            .on('broadcast', { event: 'cambio_servicio_matriz' }, (payload) => {
                console.log("⚡ [Realtime Portal] Broadcast de cambio en matriz recibido:", payload);
                if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.servicios = null;
                if (typeof CACHE_CLIENTE !== 'undefined') CACHE_CLIENTE.servicios = null;
                clearTimeout(window._tRefreshServicios);
                window._tRefreshServicios = setTimeout(async () => {
                    if (SESION.cliente) {
                        if (typeof cargarServiciosCliente === 'function') await cargarServiciosCliente(true);
                        if (typeof cargarActividadesCliente === 'function') await cargarActividadesCliente(true);
                        if (window.ClienteInicio && typeof ClienteInicio.cargarServicios === 'function') await ClienteInicio.cargarServicios(true);
                        if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') await ClienteServicios.cargar(true);
                    } else if (!SESION.admin && !SESION.supervision) {
                        try { if (typeof cargarServicios === 'function') await cargarServicios(true); } catch (_) { }
                        try { if (window.NannyInicio && typeof NannyInicio.cargarServicios === 'function') await NannyInicio.cargarServicios(true); } catch (_) { }
                        try { if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') await ClienteServicios.cargar(true); } catch (_) { }
                        if (typeof window.actualizarClientesEstimulacion === 'function') {
                            try { await window.actualizarClientesEstimulacion(true); } catch (_) { }
                        }
                    }
                }, 100);
            })
            .on('broadcast', { event: 'control_servicios_update' }, (payload) => {
                console.log("⚡ [Realtime Portal] Broadcast de actualización de servicios recibido:", payload);
                if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.servicios = null;
                if (typeof CACHE_CLIENTE !== 'undefined') CACHE_CLIENTE.servicios = null;
                clearTimeout(window._tRefreshServicios);
                window._tRefreshServicios = setTimeout(async () => {
                    if (SESION.cliente) {
                        if (typeof cargarServiciosCliente === 'function') await cargarServiciosCliente(true);
                        if (typeof cargarActividadesCliente === 'function') await cargarActividadesCliente(true);
                        if (window.ClienteInicio && typeof ClienteInicio.cargarServicios === 'function') await ClienteInicio.cargarServicios(true);
                        if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') await ClienteServicios.cargar(true);
                    } else if (!SESION.admin && !SESION.supervision) {
                        try { if (typeof cargarServicios === 'function') await cargarServicios(true); } catch (_) { }
                        try { if (window.NannyInicio && typeof NannyInicio.cargarServicios === 'function') await NannyInicio.cargarServicios(true); } catch (_) { }
                        try { if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') await ClienteServicios.cargar(true); } catch (_) { }
                        if (typeof window.actualizarClientesEstimulacion === 'function') {
                            try { await window.actualizarClientesEstimulacion(true); } catch (_) { }
                        }
                    }
                }, 100);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'control_servicios' }, (payload) => {
                console.log("⚡ [Realtime Servicios] Actualización detectada en matriz:", payload.eventType);

                const newRow = payload.new || {};
                const oldRow = payload.old || {};

                clearTimeout(window._tRefreshServicios);
                window._tRefreshServicios = setTimeout(async () => {
                    if (SESION.cliente) {
                        const cliEmail = (SESION.email || '').trim().toLowerCase();
                        const cliNom = typeof normalizarTexto === 'function' ? normalizarTexto(SESION.nombre || '') : (SESION.nombre || '').trim().toLowerCase();
                        const rowEmail = (newRow.cliente_email || oldRow.cliente_email || '').trim().toLowerCase();
                        const rowNom = typeof normalizarTexto === 'function' ? normalizarTexto(newRow.cliente_nombre || oldRow.cliente_nombre || '') : (newRow.cliente_nombre || oldRow.cliente_nombre || '').trim().toLowerCase();

                        const esParaEsteCliente = (cliEmail && rowEmail && cliEmail === rowEmail) ||
                            (cliNom && rowNom && (rowNom.includes(cliNom) || cliNom.includes(rowNom)));

                        // Solo recargar si el cambio en la matriz afecta al cliente actual
                        if (esParaEsteCliente) {
                            if (typeof cargarServiciosCliente === 'function') await cargarServiciosCliente(true);
                            if (typeof cargarActividadesCliente === 'function') await cargarActividadesCliente(true);
                            if (window.ClienteInicio && typeof ClienteInicio.cargarServicios === 'function') await ClienteInicio.cargarServicios(true);
                            if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') await ClienteServicios.cargar(true);
                        }
                    } else if (!SESION.admin && !SESION.supervision) {
                        // Niñera
                        if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.servicios = null;

                        // ⚡ 1. Invalidar cachés locales
                        if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.servicios = null;
                        if (typeof CACHE_CLIENTE !== 'undefined') CACHE_CLIENTE.servicios = null;

                        // ⚡ 2. Recargar servicios de la niñera y cliente desde Supabase
                        try {
                            if (typeof cargarServicios === 'function') await cargarServicios(true);
                        } catch (eCs) { console.warn("Aviso cargarServicios realtime:", eCs); }

                        // ⚡ 3. Actualizar estimulación inmediatamente
                        if (typeof window.actualizarClientesEstimulacion === 'function') {
                            try { await window.actualizarClientesEstimulacion(true); } catch (eEst) { console.warn("Aviso estimulacion realtime:", eEst); }
                        }

                        try {
                            if (window.ClienteInicio && typeof ClienteInicio.cargarServicios === 'function') {
                                await ClienteInicio.cargarServicios(true);
                            }
                        } catch (eCliIni) { }

                        try {
                            if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') {
                                await ClienteServicios.cargar(true);
                            }
                        } catch (eCls) { }

                        try {
                            if (window.NannyInicio && typeof NannyInicio.cargarServicios === 'function') {
                                await NannyInicio.cargarServicios(true);
                            }
                        } catch (eNi) { }

                        // 🔥 ACTUALIZAR AUTOMÁTICAMENTE PLANEACIONES DE LA NIÑERA
                        if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.planeaciones = null;
                        if (typeof CACHE_PLANEACIONES !== 'undefined') CACHE_PLANEACIONES = {};
                        if (typeof PLANEACION_SESSION_ID !== 'undefined') PLANEACION_SESSION_ID++;
                        if (typeof cargarResumenPlaneacionesNinera === 'function') {
                            try { await cargarResumenPlaneacionesNinera(true, true); } catch (ePl) { }
                        }
                    } else if (SESION.admin || SESION.supervision || document.getElementById('resumenBitacorasActual')) {
                        if (typeof cargarResumenPlaneaciones === 'function') {
                            await cargarResumenPlaneaciones(true, true);
                        }
                        if (typeof cargarResumenBitacoras === 'function') {
                            await cargarResumenBitacoras(true);
                        }
                    }
                }, 200);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'confirmaciones_asistencia' }, (payload) => {
                console.log("⚡ [Realtime Confirmaciones] Actualización de asistencia detectada:", payload.eventType);
                clearTimeout(window._tRefreshServicios);
                window._tRefreshServicios = setTimeout(async () => {
                    if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.servicios = null;
                    if (typeof CACHE_CLIENTE !== 'undefined') CACHE_CLIENTE.servicios = null;
                    if (typeof cargarServicios === 'function') await cargarServicios(true);
                    if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') await ClienteServicios.cargar(true);
                    if (window.NannyInicio && typeof NannyInicio.cargarServicios === 'function') await NannyInicio.cargarServicios(true);
                }, 200);
            })
            .subscribe();
        console.log("📡 [Realtime] Suscripción activa a control_servicios y confirmaciones_asistencia para portal de clientes, niñeras y supervisión.");

        // ⚡ Sincronización instantánea por evento storage (fallback entre pestañas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'nyp_servicios_sync_trigger') {
                if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.servicios = null;
                if (typeof CACHE_CLIENTE !== 'undefined') CACHE_CLIENTE.servicios = null;
                if (typeof cargarServicios === 'function') cargarServicios(true);
                if (window.NannyInicio && typeof NannyInicio.cargarServicios === 'function') NannyInicio.cargarServicios(true);
                if (window.ClienteInicio && typeof ClienteInicio.cargarServicios === 'function') ClienteInicio.cargarServicios(true);
                if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') ClienteServicios.cargar(true);
            }
        });

        // ⚡ Sincronización instantánea inter-pestañas
        if (typeof BroadcastChannel !== 'undefined') {
            if (!window._bcIndexPortalSync) {
                window._bcIndexPortalSync = new BroadcastChannel('nyp_admin_sync_channel');
                window._bcIndexPortalSync.onmessage = async (e) => {
                    if (e.data && (e.data.type === 'control_servicios_update' || e.data.type === 'cambio_servicio_matriz')) {
                        console.log("⚡ [Portal Sync] Cambio de matriz detectado vía BroadcastChannel:", e.data);
                        if (typeof CACHE_NINERA !== 'undefined') CACHE_NINERA.servicios = null;
                        if (typeof CACHE_CLIENTE !== 'undefined') CACHE_CLIENTE.servicios = null;
                        if (typeof cargarServicios === 'function') await cargarServicios(true);
                        if (typeof window.actualizarClientesEstimulacion === 'function') {
                            await window.actualizarClientesEstimulacion(true);
                        }
                        if (window.ClienteInicio && typeof ClienteInicio.cargarServicios === 'function') {
                            ClienteInicio.cargarServicios(true);
                        }
                        if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') {
                            ClienteServicios.cargar(true);
                        }
                        if (window.NannyInicio && typeof NannyInicio.cargarServicios === 'function') {
                            NannyInicio.cargarServicios(true);
                        }
                        if (document.getElementById('resumenBitacorasActual') || (SESION && (SESION.admin || SESION.supervision))) {
                            if (typeof cargarResumenBitacoras === 'function') {
                                cargarResumenBitacoras(true);
                            }
                        }
                    }
                };
            }

            if (!window._bcBitacorasSync) {
                window._bcBitacorasSync = new BroadcastChannel('nyp_bitacoras_channel');
                window._bcBitacorasSync.onmessage = async (e) => {
                    console.log("⚡ [Bitacoras Sync] Evento detectado vía BroadcastChannel:", e.data);
                    if (document.getElementById('resumenBitacorasActual') || (SESION && (SESION.admin || SESION.supervision))) {
                        if (e.data && (e.data.type === 'bitacora_aceptada' || e.data.status === 'aprobada' || e.data.status === 'aceptada')) {
                            const cliCleanNorm = typeof _norm === 'function' ? _norm(e.data.cliente || '') : (e.data.cliente || '').toLowerCase().trim();
                            const ninCleanNorm = typeof _norm === 'function' ? _norm(e.data.ninera || '') : (e.data.ninera || '').toLowerCase().trim();
                            document.querySelectorAll('.badge-bit-acepta').forEach(el => {
                                const elCli = typeof _norm === 'function' ? _norm(el.dataset.cliente || '') : (el.dataset.cliente || '').toLowerCase().trim();
                                const elNin = typeof _norm === 'function' ? _norm(el.dataset.ninera || '') : (el.dataset.ninera || '').toLowerCase().trim();
                                if (elCli && cliCleanNorm && (elCli.includes(cliCleanNorm) || cliCleanNorm.includes(elCli))) {
                                    if (!elNin || !ninCleanNorm || elNin.includes(ninCleanNorm) || ninCleanNorm.includes(elNin)) {
                                        el.textContent = 'aceptadas';
                                        el.style.background = '#dcfce7';
                                        el.style.color = '#166534';
                                    }
                                }
                            });
                        }

                        if (typeof cargarResumenBitacoras === 'function') {
                            cargarResumenBitacoras(true);
                        }
                    }
                };
            }
        }
    } catch (e) {
        console.warn("No se pudo activar realtime en portal de servicios:", e);
    }
}
window.suscribirRealtimePortalServicios = suscribirRealtimePortalServicios;

/**
 * Actualiza la visibilidad de las pestañas "Estimulación" y "Actividades" en el menú de la niñera (#nav-ninera)
 * según los tipos de servicio asignados para esta semana o la siguiente en control_servicios:
 * - Mínimo 1 "Neuronanny" -> Muestra "Estimulación"
 * - Mínimo 1 "Nanny Educativa" o "Miss Nanny" -> Muestra "Actividades"
 * - Ambos tipos -> Muestra ambas pestañas
 * - En caso contrario -> Oculta ambas pestañas
 */
async function actualizarVisibilidadPestanasNinera(serviciosParam = null) {
    if (!window.SESION || window.SESION.cliente || window.SESION.admin || window.SESION.supervision || window.SESION.rh) {
        return;
    }

    const navEst = document.getElementById('nav-estimulacion');
    const navAct = document.getElementById('nav-actividades');
    if (!navEst && !navAct) return;

    const hoy = new Date();
    const lunesActualDate = (typeof startMonday === 'function') ? startMonday(hoy) : new Date();
    const lunesActualISO = (typeof toISO === 'function') ? toISO(lunesActualDate) : lunesActualDate.toISOString().slice(0, 10);

    const lunesSigDate = new Date(lunesActualDate);
    lunesSigDate.setDate(lunesSigDate.getDate() + 7);
    const lunesSigISO = (typeof toISO === 'function') ? toISO(lunesSigDate) : lunesSigDate.toISOString().slice(0, 10);

    const semanasPermitidas = [lunesActualISO, lunesSigISO];

    let filas = [];

    if (Array.isArray(serviciosParam) && serviciosParam.length > 0) {
        filas = serviciosParam;
    } else if (Array.isArray(window.CAL_SERVICIOS) && window.CAL_SERVICIOS.length > 0) {
        filas = window.CAL_SERVICIOS;
    } else if (window.CACHE_NINERA && Array.isArray(window.CACHE_NINERA.servicios) && window.CACHE_NINERA.servicios.length > 0) {
        filas = window.CACHE_NINERA.servicios;
    }

    if (filas.length === 0) {
        try {
            const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
            if (client && SESION && SESION.nombre) {
                const nannyNom = (SESION.nombre || '').trim();
                const primerNom = nannyNom.split(' ')[0];
                let q = client.from('control_servicios').select('*').in('semana_iso', semanasPermitidas);
                if (primerNom.length >= 3) {
                    q = q.or(`nanny_nombre.ilike.%${nannyNom}%,nanny_nombre.ilike.%${primerNom}%`);
                }
                const { data, error } = await q;
                if (!error && Array.isArray(data)) {
                    filas = data;
                }
            }
        } catch (eQuery) {
            console.warn("Nota consultando servicios para visibilidad de pestañas niñera:", eQuery);
        }
    }

    let tieneNeuronanny = false;
    let tieneEducativaOMiss = false;

    const nannyNombreNorm = typeof normalizarTexto === 'function' ? normalizarTexto(SESION.nombre || '') : (SESION.nombre || '').trim().toLowerCase();
    const nannyEmailNorm = (SESION.email || '').trim().toLowerCase();

    filas.forEach(s => {
        if (s.ver === false) return;

        // Validar que corresponda a la niñera si la fila contiene nanny_nombre o nanny_email
        if (s.nanny_nombre || s.nanny_email || s.nombre_ninera || s.email_ninera) {
            const sNannyNom = typeof normalizarTexto === 'function' ? normalizarTexto(s.nanny_nombre || s.nombre_ninera || '') : (s.nanny_nombre || s.nombre_ninera || '').toLowerCase();
            const sNannyEmail = (s.nanny_email || s.email_ninera || '').trim().toLowerCase();
            const coincide = (nannyEmailNorm && sNannyEmail && sNannyEmail === nannyEmailNorm) ||
                (nannyNombreNorm && sNannyNom && (sNannyNom.includes(nannyNombreNorm) || nannyNombreNorm.includes(sNannyNom)));
            if (!coincide) return;
        }

        // Validar semana (actual o siguiente)
        let semISO = s.semana_iso;
        if (!semISO && s.fecha) {
            semISO = (typeof getMondayISO_Safe === 'function') ? getMondayISO_Safe(s.fecha) : s.fecha;
        }

        const maxDateISO = (typeof addWeeksToISO_Safe === 'function') ? addWeeksToISO_Safe(lunesActualISO, 2) : '9999-12-31';
        const esSemanaValida = semanasPermitidas.includes(semISO) ||
            (s.fecha && s.fecha >= lunesActualISO && s.fecha < maxDateISO);

        if (!esSemanaValida) return;

        // Validar tipo de servicio
        const tipoRaw = s.tipo_servicio || s.servicio || s.tipo || '';
        const tipoNorm = typeof normalizarTexto === 'function' ? normalizarTexto(tipoRaw) : tipoRaw.toLowerCase();

        if (tipoNorm.includes('neuronanny') || tipoNorm.includes('estimulacion')) {
            tieneNeuronanny = true;
        }
        if (tipoNorm.includes('educativa') || tipoNorm.includes('miss nanny') || tipoNorm.includes('miss')) {
            tieneEducativaOMiss = true;
        }
    });

    // Aplicar visibilidad en la barra de navegación de la niñera (#nav-ninera)
    if (navEst) {
        navEst.style.display = tieneNeuronanny ? 'flex' : 'none';
    }
    if (navAct) {
        navAct.style.display = tieneEducativaOMiss ? 'flex' : 'none';
    }

    window._nannyTieneNeuronannyValido = tieneNeuronanny;
    window._nannyTieneEducativaValido = tieneEducativaOMiss;

    console.log(`🧭 [Nav Niñera] Visibilidad de pestañas -> Estimulación: ${tieneNeuronanny ? 'VISIBLE' : 'OCULTA'}, Actividades: ${tieneEducativaOMiss ? 'VISIBLE' : 'OCULTA'}`);

    // 🚀 Si la niñera se encuentra actualmente en una pestaña que se acaba de ocultar, redirigir de inmediato a "Inicio"
    const vistaEstActiva = document.getElementById('vista-estimulacion')?.classList.contains('activa');
    const vistaActActiva = document.getElementById('vista-actividades')?.classList.contains('activa');

    if ((!tieneNeuronanny && vistaEstActiva) || (!tieneEducativaOMiss && vistaActActiva)) {
        console.log("⚠️ [Nav Niñera] La pestaña actual ha dejado de estar asignada. Redirigiendo automáticamente a Inicio...");
        if (typeof irVista === 'function') {
            irVista('inicio');
        } else if (window.NannyInicio && typeof window.NannyInicio.mostrarVistaInicio === 'function') {
            window.NannyInicio.mostrarVistaInicio();
        }
    }
}
window.actualizarVisibilidadPestanasNinera = actualizarVisibilidadPestanasNinera;

/**
 * Actualiza la visibilidad de las pestañas "Estimulación" y "Actividades" en el menú del cliente (#nav-cliente)
 * según los tipos de servicio asignados para esta semana o la siguiente en control_servicios:
 * - Mínimo 1 "Neuronanny" -> Muestra "Estimulación"
 * - Mínimo 1 "Nanny Educativa" o "Miss Nanny" -> Muestra "Actividades"
 * - Ambos tipos -> Muestra ambas pestañas
 * - En caso contrario -> Oculta ambas pestañas
 */
async function actualizarVisibilidadPestanasCliente(serviciosParam = null) {
    if (!window.SESION || !window.SESION.cliente) {
        return;
    }

    const navEst = document.getElementById('cnav-estimulacion');
    const navAct = document.getElementById('cnav-actividades');
    if (!navEst && !navAct) return;

    const hoy = new Date();
    const lunesActualDate = (typeof startMonday === 'function') ? startMonday(hoy) : new Date();
    const lunesActualISO = (typeof toISO === 'function') ? toISO(lunesActualDate) : lunesActualDate.toISOString().slice(0, 10);

    const lunesSigDate = new Date(lunesActualDate);
    lunesSigDate.setDate(lunesSigDate.getDate() + 7);
    const lunesSigISO = (typeof toISO === 'function') ? toISO(lunesSigDate) : lunesSigDate.toISOString().slice(0, 10);

    const semanasPermitidas = [lunesActualISO, lunesSigISO];

    let filas = [];

    if (Array.isArray(serviciosParam) && serviciosParam.length > 0) {
        filas = serviciosParam;
    } else if (window.CACHE_CLIENTE && Array.isArray(window.CACHE_CLIENTE.servicios) && window.CACHE_CLIENTE.servicios.length > 0) {
        filas = window.CACHE_CLIENTE.servicios;
    } else if (window.ClienteServicios && Array.isArray(window.ClienteServicios._servicios) && window.ClienteServicios._servicios.length > 0) {
        filas = window.ClienteServicios._servicios;
    }

    if (filas.length === 0) {
        try {
            const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
            if (client && SESION && (SESION.email || SESION.nombre)) {
                const emailCli = (SESION.email || '').trim().toLowerCase();
                const nomCli = (SESION.nombre || '').trim().toLowerCase();
                let q = client.from('control_servicios').select('*').in('semana_iso', semanasPermitidas);
                if (emailCli && nomCli) {
                    q = q.or(`cliente_email.ilike.${emailCli},cliente_nombre.ilike.%${nomCli}%`);
                } else if (emailCli) {
                    q = q.ilike('cliente_email', emailCli);
                }
                const { data, error } = await q;
                if (!error && Array.isArray(data)) {
                    filas = data;
                }
            }
        } catch (eQuery) {
            console.warn("Nota consultando servicios para visibilidad de pestañas cliente:", eQuery);
        }
    }

    let tieneNeuronanny = false;
    let tieneEducativaOMiss = false;

    const cliNombreNorm = typeof normalizarTexto === 'function' ? normalizarTexto(SESION.nombre || '') : (SESION.nombre || '').trim().toLowerCase();
    const cliEmailNorm = (SESION.email || '').trim().toLowerCase();

    filas.forEach(s => {
        if (s.ver === false) return;

        // Validar que corresponda al cliente
        if (s.cliente_email || s.cliente_nombre || s.correo_cliente || s.cliente) {
            const sCliNom = typeof normalizarTexto === 'function' ? normalizarTexto(s.cliente_nombre || s.cliente || '') : (s.cliente_nombre || s.cliente || '').toLowerCase();
            const sCliEmail = (s.cliente_email || s.correo_cliente || s.email || '').trim().toLowerCase();
            const coincide = (cliEmailNorm && sCliEmail && sCliEmail === cliEmailNorm) ||
                (cliNombreNorm && sCliNom && (sCliNom.includes(cliNombreNorm) || cliNombreNorm.includes(sCliNom)));
            if (!coincide) return;
        }

        // Validar semana (actual o siguiente)
        let semISO = s.semana_iso;
        if (!semISO && s.fecha) {
            semISO = (typeof getMondayISO_Safe === 'function') ? getMondayISO_Safe(s.fecha) : s.fecha;
        }

        const maxDateISO = (typeof addWeeksToISO_Safe === 'function') ? addWeeksToISO_Safe(lunesActualISO, 2) : '9999-12-31';
        const esSemanaValida = semanasPermitidas.includes(semISO) ||
            (s.fecha && s.fecha >= lunesActualISO && s.fecha < maxDateISO);

        if (!esSemanaValida) return;

        // Validar tipo de servicio
        const tipoRaw = s.tipo_servicio || s.servicio || s.tipo || '';
        const tipoNorm = typeof normalizarTexto === 'function' ? normalizarTexto(tipoRaw) : tipoRaw.toLowerCase();

        if (tipoNorm.includes('neuronanny') || tipoNorm.includes('estimulacion')) {
            tieneNeuronanny = true;
        }
        if (tipoNorm.includes('educativa') || tipoNorm.includes('miss nanny') || tipoNorm.includes('miss')) {
            tieneEducativaOMiss = true;
        }
    });

    // Aplicar visibilidad en la barra de navegación del cliente (#nav-cliente)
    if (navEst) {
        navEst.style.display = tieneNeuronanny ? 'flex' : 'none';
    }
    if (navAct) {
        navAct.style.display = tieneEducativaOMiss ? 'flex' : 'none';
    }

    // 🌟 Aplicar visibilidad en la sección de actividades sugeridas de la pestaña Inicio (#ciActivityCarouselContainer)
    const secActividadesInicio = document.getElementById('ciActivityCarouselContainer');
    if (secActividadesInicio) {
        secActividadesInicio.style.display = tieneNeuronanny ? 'block' : 'none';
    }

    window._clienteTieneNeuronannyValido = tieneNeuronanny;
    window._clienteTieneEducativaValido = tieneEducativaOMiss;

    console.log(`🧭 [Nav Cliente] Visibilidad de pestañas -> Estimulación: ${tieneNeuronanny ? 'VISIBLE' : 'OCULTA'}, Actividades: ${tieneEducativaOMiss ? 'VISIBLE' : 'OCULTA'}`);

    // 🚀 Si el cliente se encuentra actualmente en una pestaña que se acaba de ocultar, redirigir de inmediato a "Inicio"
    const vistaEstActiva = document.getElementById('vista-estimulacion')?.classList.contains('activa');
    const vistaActCliActiva = document.getElementById('vista-actividades-cliente')?.classList.contains('activa') ||
        document.getElementById('vista-actividades')?.classList.contains('activa');

    if ((!tieneNeuronanny && vistaEstActiva) || (!tieneEducativaOMiss && vistaActCliActiva)) {
        console.log("⚠️ [Nav Cliente] La pestaña actual ha dejado de estar asignada para el cliente. Redirigiendo automáticamente a Inicio...");
        if (typeof irVista === 'function') {
            irVista('inicio');
        } else if (window.ClienteInicio && typeof window.ClienteInicio.mostrarVistaInicio === 'function') {
            window.ClienteInicio.mostrarVistaInicio();
        }
    }
}
window.actualizarVisibilidadPestanasCliente = actualizarVisibilidadPestanasCliente;

async function cargarServicios(force = false) {
    if (!force && LAST_FETCH['cargarServicios'] && (Date.now() - LAST_FETCH['cargarServicios'] < DEFAULT_TTL)) return;
    LAST_FETCH['cargarServicios'] = Date.now();

    const cont = document.getElementById('cal');
    const msg = document.getElementById('calMsg');

    // Si no se fuerza recarga y hay caché disponible, usarlo
    if (!force && CACHE_NINERA.servicios) {
        CAL_SERVICIOS = CACHE_NINERA.servicios;
        renderCalendario2Semanas();
        return;
    }

    // Activar escucha en tiempo real de Supabase si no está activa
    suscribirRealtimePortalServicios();

    if (msg && (!cont || !cont.children.length)) msg.textContent = 'Cargando servicios...';

    let serviciosCargados = false;
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

    // 🚀 PASO 1: Consultar directamente en Supabase (control_servicios)
    if (client && SESION && SESION.nombre) {
        try {
            const lunesActual = getMondayISO_Safe(new Date());
            const semanasConsultarNan = [-2, -1, 0, 1, 2, 3].map(w => addWeeksToISO_Safe(lunesActual, w));
            let qNan = client.from('control_servicios').select('*');
            const nannyNom = (SESION.nombre || '').trim();
            const primerNom = nannyNom.split(' ')[0];
            if (primerNom.length >= 3) {
                qNan = qNan.or(`nanny_nombre.ilike.%${nannyNom}%,nanny_nombre.ilike.%${primerNom}%`);
            } else {
                qNan = qNan.in('semana_iso', semanasConsultarNan);
            }

            const { data: filasMatriz, error: errMatriz } = await qNan;

            if (!errMatriz && Array.isArray(filasMatriz)) {
                // Obtener datos de todos los clientes para enriquecer direcciones y ubicaciones
                let mapaClientes = {};
                try {
                    const { data: clientesList } = await client
                        .from('clientes')
                        .select('*');

                    if (Array.isArray(clientesList)) {
                        clientesList.forEach(c => {
                            const kEmail = (c.email || '').trim().toLowerCase();
                            const kNom = (c.nombre || '').trim().toLowerCase();
                            const kNomNorm = normalizarTexto(kNom);
                            if (kEmail) mapaClientes[kEmail] = c;
                            if (kNom) mapaClientes[kNom] = c;
                            if (kNomNorm) mapaClientes[kNomNorm] = c;
                        });
                    }
                } catch (eCli) {
                    console.warn("No se pudo obtener lista de clientes para niñera:", eCli);
                }

                const svcs = transformarFilasControlServicios(filasMatriz, 'nanny', SESION, mapaClientes);
                console.log(`⚡ [Servicios Supabase] Encontrados ${svcs.length} servicios visibles para niñera ${SESION.nombre}`);

                CAL_SERVICIOS = svcs;
                CACHE_NINERA.servicios = svcs;

                // Separar para siguiente semana
                const lunesSigISO = addWeeksToISO_Safe(lunesActual, 1);
                CAL_SERVICIOS_SIG = svcs.filter(s => s.fecha >= lunesSigISO);

                if (!SEMANA_CALENDARIO_BASE) {
                    SEMANA_CALENDARIO_BASE = new Date();
                }

                renderCalendario2Semanas();
                serviciosCargados = true;
                if (typeof window.actualizarClientesEstimulacion === 'function') {
                    window.actualizarClientesEstimulacion();
                }
                actualizarVisibilidadPestanasNinera(svcs);
                if (window.ClienteServicios && typeof window.ClienteServicios.renderServiciosList === 'function') {
                    window.ClienteServicios._servicios = svcs;
                    window.ClienteServicios.renderMetricas();
                    window.ClienteServicios.renderCalendarStrip();
                    window.ClienteServicios.renderServiciosList();
                    window.ClienteServicios.renderBitacora();
                }
                if (msg) {
                    msg.textContent = `Servicios recibidos: ${svcs.length}`;
                    setTimeout(() => { if (msg && msg.textContent.startsWith('Servicios recibidos')) msg.textContent = ''; }, 1500);
                }
            }
        } catch (supaErr) {
            console.warn("Error leyendo servicios de Supabase para niñera:", supaErr);
        }
    }

    // 🔄 PASO 2: Fallback tradicional a GAS si no se cargó desde Supabase y tiene token
    if (!serviciosCargados) {
        if (!SESION.token) {
            CAL_SERVICIOS = [];
            CACHE_NINERA.servicios = [];
            renderCalendario2Semanas();
            if (msg) msg.textContent = '';
            return;
        }

        try {
            const hoy = new Date();
            const diaSemana = hoy.getDay();
            const diasDesdeLunes = (diaSemana + 6) % 7;
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() - diasDesdeLunes);
            const fechaInicioISO = toISO(lunes);

            const lista = await api('getServiciosNinera', {
                email: SESION.email,
                dias: 21,
                fecha_inicio: fechaInicioISO
            });

            CAL_SERVICIOS = Array.isArray(lista) ? lista : [];
            if (msg) msg.textContent = `Servicios recibidos: ${CAL_SERVICIOS.length}`;

            CAL_SERVICIOS = CAL_SERVICIOS.map(s => {
                let ver = s.ver;
                if (ver === undefined || ver === null || ver === '') ver = true;
                if (typeof ver === 'string') ver = ver.trim().toLowerCase();
                if (ver === 'true' || ver === '1') ver = true;
                if (ver === 'false' || ver === '0') ver = false;
                return { ...s, ver: ver === true };
            });

            CACHE_NINERA.servicios = CAL_SERVICIOS;

            if (!SEMANA_CALENDARIO_BASE) {
                SEMANA_CALENDARIO_BASE = new Date();
            }

            renderCalendario2Semanas();
            setTimeout(() => { if (msg && msg.textContent.startsWith('Servicios recibidos')) msg.textContent = ''; }, 1500);
        } catch (err) {
            console.error('Error cargarServicios GAS:', err);
            if (msg) msg.innerHTML = `<span class="err">${err.message}</span>`;
        }
    }
}

async function cargarServiciosSiguienteSemana() {
    // Si ya fueron cargados desde Supabase en cargarServicios, no repetir
    if (CAL_SERVICIOS_SIG && CAL_SERVICIOS_SIG.length > 0) return;
    if (!SESION.token) return;

    try {
        const lista = await api('getServiciosNinera', { email: SESION.email, dias: 14 });
        const todos = Array.isArray(lista) ? lista : [];

        const base = SEMANA_CALENDARIO_BASE || new Date();
        const lunesActual = startMonday(base);
        const lunesSiguiente = new Date(lunesActual);
        lunesSiguiente.setDate(lunesSiguiente.getDate() + 7);
        const lunesSigISO = toISO(lunesSiguiente);

        CAL_SERVICIOS_SIG = todos.filter(s => s.fecha >= lunesSigISO);
    } catch (err) { console.error(err); }
}

function _hmToMinutes(hm) { if (!hm) return Number.POSITIVE_INFINITY; const m = String(hm).match(/^(\d{1,2})(?::(\d{1,2}))?$/); if (!m) return Number.POSITIVE_INFINITY; const h = parseInt(m[1], 10); const mi = m[2] ? parseInt(m[2], 10) : 0; return h * 60 + mi; }
function compararServicios(a, b) { const ai = _hmToMinutes(a.hora_inicio), bi = _hmToMinutes(b.hora_inicio); if (ai !== bi) return ai - bi; const af = _hmToMinutes(a.hora_fin), bf = _hmToMinutes(b.hora_fin); if (af !== bf) return af - bf; return (a.cliente || '').localeCompare(b.cliente || ''); }
function stateClass(estado) {
    const e = (estado || '').toLowerCase();
    if (e === 'confirmado') return 'confirmed';
    if (e === 'en curso') return 'inprogress';
    if (e === 'completado') return 'completed';
    return 'pending';
}

function renderCalendario2Semanas() {
    const cont = document.getElementById('cal'); cont.innerHTML = '';
    const hoy = new Date();
    // Cambio: empezar desde el LUNES de la semana actual
    // Esto evita que los servicios desaparezcan conforme avanza la semana
    const diaSemana = hoy.getDay(); // 0=Domingo, 1=Lunes...
    // Si hoy es domingo (0), el lunes pasado fue hace 6 días.
    // Si hoy es lunes (1), el lunes es hoy (0 días atrás).
    // Fórmula para obtener días desde el lunes: (diaSemana + 6) % 7
    const diasDesdeLunes = (diaSemana + 6) % 7;

    const start = new Date(hoy);
    start.setDate(hoy.getDate() - diasDesdeLunes);
    start.setHours(0, 0, 0, 0);

    const map = {}; CAL_SERVICIOS.forEach(s => { if (!map[s.fecha]) map[s.fecha] = []; map[s.fecha].push(s); });

    for (let i = 0; i < 14; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const iso = toISO(d); const dow = d.toLocaleDateString('es-MX', { weekday: 'short' }).toUpperCase(); const dom = d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
        const servicios = (map[iso] || []).slice().sort(compararServicios);

        const serviciosVisibles = servicios.filter(s => {
            const nineraServicio = typeof normalizarTexto === 'function' ? normalizarTexto(s?.nombre_ninera || '') : (s?.nombre_ninera || '').toLowerCase();
            const nineraSesion = typeof normalizarTexto === 'function' ? normalizarTexto(SESION.nombre || '') : (SESION.nombre || '').toLowerCase();
            if (nineraSesion && nineraServicio) {
                const primerNombreSesion = nineraSesion.split(' ')[0];
                const primerNombreServicio = nineraServicio.split(' ')[0];
                const coincide = nineraServicio.includes(nineraSesion) ||
                    nineraSesion.includes(nineraServicio) ||
                    (primerNombreSesion.length >= 3 && nineraServicio.includes(primerNombreSesion)) ||
                    (primerNombreServicio.length >= 3 && nineraSesion.includes(primerNombreServicio));
                if (!coincide) return false;
            }

            const v = s?.ver;
            if (v === undefined || v === null || v === '') return true;
            if (v === true) return true;
            if (typeof v === 'string' && v.trim().toLowerCase() === 'true') return true;
            if (v === 1 || v === '1') return true;
            return false;
        });

        const day = document.createElement('div'); day.className = 'day'; if (iso === toISO(new Date())) day.classList.add('today');
        const head = document.createElement('header'); head.innerHTML = `<span>${dow}</span><span class="date">${dom}</span>`; day.appendChild(head);
        const body = document.createElement('div');

        if (serviciosVisibles.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'no-svc';
            empty.textContent = 'Sin servicios';
            body.appendChild(empty);
        } else {
            serviciosVisibles.forEach(s => {
                const label = (s.hora_inicio && s.hora_fin) ? `${s.hora_inicio}–${s.hora_fin}` : (s.hora_inicio || s.hora_fin || 'Servicio');
                const btn = document.createElement('button');
                let cls = 'svc-pill ' + stateClass(s.estado);
                if (s.empalmado) cls += ' conflict';

                btn.className = cls;

                let nombreCliente = s.cliente || 'Cliente';
                const partes = nombreCliente.split(' ');
                if (partes.length >= 2) {
                    nombreCliente = partes[0] + ' ' + partes[1];
                } else if (partes.length === 1) {
                    nombreCliente = partes[0];
                }

                //Add name to label with a separator or line break. JS textContent doesn't handle BR, 
                //but we can use innerHTML or just text. The pill is a button.
                //The pill uses flex/block layout? styles.css says .svc-pill is block usually.
                //Let's use innerHTML to style it a bit or just append text.
                //The user request said "Show client name... below the time".
                //I will use innerHTML to add a div/span.
                btn.innerHTML = `<span style="display:block; font-size:13px; font-weight:700;">${escapeHtml(label)}</span>
                                 <span style="display:block; font-size:12px; margin-top:2px; opacity:0.9;">${escapeHtml(nombreCliente)}</span>`;
                //btn.textContent = label; <-- Removing this
                btn.onclick = () => abrirModalServicio(s);
                body.appendChild(btn);
            });
        }
        day.appendChild(body); cont.appendChild(day);
    }
}

/* =========================================
   MODAL DE SERVICIO
   ========================================= */

/**
 * Formatea un timestamp a formato corto: DD/MM/YY HH:MM:SS
 * Ejemplo: "Thu Feb 12 2026 17:17:08 GMT-0600" -> "12/02/26 17:17:08"
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return timestamp; // Si no es válido, devolver original

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
        return timestamp; // En caso de error, devolver original
    }
}
function abrirModalServicio(sOrId) {
    let s = sOrId;
    if (typeof sOrId === 'string') {
        const pool = (window.CAL_SERVICIOS || []).concat(window.NannyInicio?._servicios || []).concat(window.CACHE_NINERA?.servicios || []).concat(window.CACHE_CLIENTE?.servicios || []).concat(window.ClienteServicios?._servicios || []);
        s = pool.find(item => item && (item.id === sOrId || String(item.id).startsWith(sOrId))) || { cliente: 'Detalle del servicio' };
    }
    if (!s || typeof s !== 'object') return;

    document.getElementById('mCliente').textContent = s.cliente || s.cliente_nombre || 'Detalle del servicio';

    //Formatear fecha: Lunes 19 de Enero
    let fechaTexto = s.fecha || '—';
    if (s.fecha && s.fecha.includes('-')) {
        const [yyyy, mm, dd] = s.fecha.split('-').map(Number);
        const dateObj = new Date(yyyy, mm - 1, dd);
        const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
        //Capitalizar primera letra
        const f = dateObj.toLocaleDateString('es-ES', opciones);
        fechaTexto = f.charAt(0).toUpperCase() + f.slice(1);
    }
    document.getElementById('mFecha').textContent = fechaTexto;

    document.getElementById('mHorario').textContent = [s.hora_inicio || '', s.hora_fin || ''].filter(Boolean).join(' – ') || '—';
    document.getElementById('mContacto').textContent = s.numero_contacto || '—';
    document.getElementById('mEmergencia').textContent = s.numero_de_emergencia || '—';
    document.getElementById('mDireccion').textContent = s.direccion || '—';

    const u = document.getElementById('mUbicacion');
    u.textContent = '—';
    const linkUbicacion = s.ubicacion_link || s.ubicacion || s.Ubicacion;
    if (linkUbicacion) {
        let safeLink = String(linkUbicacion).trim();
        // Solo permitir http o https
        if (/^https?:\/\//i.test(safeLink)) {
            u.innerHTML = `<a href="${escapeHtml(safeLink)}" target="_blank" rel="noopener">Abrir mapa</a>`;
        } else {
            // Si no es un link válido, mostrar texto simple escapado
            u.textContent = safeLink;
        }
    }

    document.getElementById('mEdad').textContent = s.edad_nino || s.peque_edad || '—';
    //--- LÓGICA MEJORADA PARA NOTAS DE PEQUES (PARSING) ---
    const rawNotas = s.notas || '—';
    const containerNotas = document.getElementById('mNotas');
    const containerEdad = document.getElementById('mEdad')?.parentElement; //Contenedor de la edad global
    const labelNotas = containerNotas?.previousElementSibling; //El div con 📝 Notas:

    //Resetear visibilidad y estilos por defecto
    if (containerEdad) containerEdad.style.display = 'block';
    if (labelNotas && labelNotas.textContent.includes('Notas:')) {
        labelNotas.style.display = 'block';
    }
    if (containerNotas) {
        containerNotas.style.whiteSpace = 'normal';
    }

    const esEventualOTemporal = Boolean(
        s.bloque === 'servicios_eventuales' ||
        s.bloque === 'servicios_temporales' ||
        s.bloque === 'eventuales' ||
        s.bloque === 'temporales' ||
        (s.tipo_servicio && (
            String(s.tipo_servicio).toLowerCase().includes('eventual') ||
            String(s.tipo_servicio).toLowerCase().includes('temporal')
        ))
    );

    if (esEventualOTemporal) {
        // === SERVICIOS EVENTUALES Y TEMPORALES: FICHAS DIVIDIDAS SEGÚN SECUENCIA SOLICITADA ===
        // 1. Nombre del peque
        // 2. Edad del peque
        // 3. Resto de la información (alergias, condición médica, estado de salud, preferencias, mascotas, indicaciones)
        if (containerEdad) containerEdad.style.display = 'none';
        if (labelNotas && labelNotas.textContent.includes('Notas:')) {
            labelNotas.style.display = 'none';
        }
        containerNotas.innerHTML = '';
        renderizarFichasPequesEventuales(s, containerNotas);

    } else if (s.notas && (s.notas.includes('👶') || s.notas.includes('•'))) {
        // === SERVICIOS FIJOS: NO TOCAR LA LÓGICA ORIGINAL ===
        //Modo parseo: Intentar separar por peques
        containerNotas.innerHTML = '';

        //Estrategia: Separar por el emoji de bebé o doble salto de línea
        //El backend usa: 👶 Nombre\n• Campo...
        //Split por 👶, pero ojo con el primero
        const bloques = rawNotas.split('👶').filter(b => b.trim().length > 0);

        if (bloques.length > 0) {
            //SI hay info de peques parseada, ocultamos la edad global y el label "Notas:"
            if (containerEdad) containerEdad.style.display = 'none';

            if (labelNotas && labelNotas.textContent.includes('Notas:')) {
                labelNotas.style.display = 'none';
            }

            bloques.forEach(bloque => {
                //Reconstruir el emoji que split quitó
                const texto = '👶 ' + bloque.trim();

                //Parsear líneas
                const lineas = texto.split('\n').map(l => l.trim()).filter(l => l);
                const nombreRow = lineas[0].replace('👶', '').trim(); //Nombre

                const card = document.createElement('div');
                card.classList.add('peque-profile-card');
                card.style.background = '#FFF5F9';
                card.style.borderLeft = '4px solid var(--pink-main)';
                card.style.borderRadius = '12px';
                card.style.padding = '12px 16px';
                card.style.marginBottom = '15px';
                card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';

                //Extraer datos clave para el header (Edad)
                let edad = '—';
                const infoRestante = [];

                for (let i = 1; i < lineas.length; i++) {
                    const l = lineas[i];
                    if (l.includes('Edad:')) {
                        //Formato esperado: "• Edad: XX años..."
                        const parts = l.split(':');
                        if (parts.length > 1) edad = parts[1].trim();
                        continue;
                    }
                    if (l.includes('👶') && i === 0) continue;
                    infoRestante.push(l);
                }

                let headerHtml = `
                <div class="peque-header" style="display:flex; justify-content:space-between; align-items:center; margin:0; padding:0 0 10px 0;">
                  <div style="display:flex; gap:10px; align-items:center;">
                    <span class="peque-icon" style="font-size:24px; background:white; border-radius:50%; padding:4px; box-shadow:0 1px 2px rgba(0,0,0,0.1); flex-shrink:0;">👶</span>
                    <div class="peque-meta" style="display:flex; align-items:center;">
                      <div class="peque-name" style="font-weight:700; font-size:16px; color:#1f2937; margin:0; line-height:1; display:inline-block;">${escapeHtml(nombreRow)}</div>
                    </div>
                  </div>
                  <span class="peque-age-badge" style="background:#fce7f3; color:#db2777; font-weight:700; font-size:12px; padding:4px 10px; border-radius:999px; white-space:nowrap; display:inline-flex; align-items:center; line-height:1; height:fit-content;">${escapeHtml(edad)}</span>
                </div>`;

                let detailsHtml = `<div class="peque-details">`;
                infoRestante.forEach(l => {
                    if (l.startsWith('•') || l.startsWith('🐾')) {
                        const partes = l.split(':');
                        const label = partes[0].replace(/[•🐾]/g, '').trim();
                        const val = partes.slice(1).join(':').trim();
                        if (l.startsWith('🐾')) {
                            detailsHtml += `<div style="margin-top:6px; font-weight:600; font-size:13px; color:#4b5563;">🐾 ${escapeHtml(label)}: <span style="font-weight:400;">${escapeHtml(val)}</span></div>`;
                        } else {
                            detailsHtml += `<div style="font-size:13px; color:#374151; margin-bottom:3px;"><b style="color:#4b5563;">${escapeHtml(label)}:</b> ${escapeHtml(val)}</div>`;
                        }
                    } else {
                        detailsHtml += `<div style="font-size:13px; color:#6b7280; margin-top:2px;">${escapeHtml(l)}</div>`;
                    }
                });
                detailsHtml += `</div>`;

                card.innerHTML = headerHtml + detailsHtml;
                containerNotas.appendChild(card);
            });
        } else {
            //Fallback si el split falla pero tiene formato
            containerNotas.textContent = rawNotas;
        }
    } else {
        //Texto plano normal (o fallback puro)
        containerNotas.textContent = rawNotas;
    }
    const cuotaVal = s.cuota_nanny || s.tarifa_nanny || s.tarifa || '';
    document.getElementById('mCuota').textContent = cuotaVal ? (String(cuotaVal).trim().startsWith('$') ? cuotaVal : `$${cuotaVal}`) : '—';

    const estado = (s.estado || 'pendiente').toLowerCase();
    const inicioReal = s.inicio_real ? String(s.inicio_real).trim() : '';
    const finReal = s.fin_real ? String(s.fin_real).trim() : '';
    const confirmadoEn = s.confirmado_en ? String(s.confirmado_en).trim() : '';

    const actions = document.querySelector('#modalBackdrop .actions');
    if (actions) actions.innerHTML = '';

    const mMsgEl = document.getElementById('mMsg');
    if (mMsgEl) {
        mMsgEl.innerHTML = '';
        if (!SESION.admin && s.empalmado) {
            mMsgEl.innerHTML += `<div class="pill" style="background:#fee2e2; border:1px solid #ef4444; color:#b91c1c; margin-bottom:8px; display:inline-block; font-weight:700;">⚠️ Servicio empalmado</div><br>`;
        }
        if (confirmadoEn) mMsgEl.innerHTML += `<span class="pill" style="background:#DCFCE7; color:#15803D; border:1px solid #BBF7D0; font-weight:600; margin-bottom:4px; display:inline-block;">✓ Confirmado: ${formatTimestamp(confirmadoEn)}</span><br>`;
        if (inicioReal) mMsgEl.innerHTML += `<span class="pill" style="background:#E0F2FE; color:#0284C7; border:1px solid #BAE6FD; font-weight:600; margin-bottom:4px; display:inline-block;">⏱ Inicio real: ${formatTimestamp(inicioReal)}</span><br>`;
        if (finReal) mMsgEl.innerHTML += `<span class="pill" style="background:#EDE9FE; color:#6D28D9; border:1px solid #DDD6FE; font-weight:600; margin-bottom:4px; display:inline-block;">🏁 Fin real: ${formatTimestamp(finReal)}</span><br>`;
    }

    if (SESION.admin) {
        const c = document.createElement('button');
        c.className = 'btn-ghost';
        c.textContent = 'Cerrar';
        c.onclick = () => cerrarModal();
        actions.appendChild(c);
        document.getElementById('modalBackdrop').style.display = 'flex';
        return;
    }

    if (estado === 'confirmado') {
        if (!inicioReal) {
            const b = document.createElement('button');
            b.className = 'btn-primary';
            b.innerHTML = '<span>🚀 Iniciar servicio</span>';
            b.onclick = () => accionIniciar(s);
            actions.appendChild(b);
        } else if (!finReal) {
            // Botón Bitácora - aparece después de iniciar servicio
            const btnBitacora = document.createElement('button');
            btnBitacora.className = 'btn-primary';
            btnBitacora.innerHTML = '<span>📋 Bitácora</span>';
            btnBitacora.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
            btnBitacora.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.3)';
            btnBitacora.onclick = () => abrirBitacora(s);
            actions.appendChild(btnBitacora);

            const b = document.createElement('button');
            b.className = 'btn-primary';
            b.innerHTML = '<span>🏁 Finalizar servicio</span>';
            b.onclick = () => accionFinalizar(s);
            actions.appendChild(b);
        } else {
            // Botón Bitácora - permanece visible después de finalizar
            const btnBitacora = document.createElement('button');
            btnBitacora.className = 'btn-primary';
            btnBitacora.innerHTML = '<span>📋 Bitácora</span>';
            btnBitacora.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
            btnBitacora.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.3)';
            btnBitacora.onclick = () => abrirBitacora(s);
            actions.appendChild(btnBitacora);
        }
    }
    else if (estado === 'en curso') {
        if (!finReal) {
            // Botón Bitácora - aparece en estado "en curso"
            const btnBitacora = document.createElement('button');
            btnBitacora.className = 'btn-primary';
            btnBitacora.innerHTML = '<span>📋 Bitácora</span>';
            btnBitacora.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
            btnBitacora.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.3)';
            btnBitacora.onclick = () => abrirBitacora(s);
            actions.appendChild(btnBitacora);

            const b = document.createElement('button');
            b.className = 'btn-primary';
            b.innerHTML = '<span>🏁 Finalizar servicio</span>';
            b.onclick = () => accionFinalizar(s);
            actions.appendChild(b);
        } else {
            // Botón Bitácora - permanece visible después de finalizar
            const btnBitacora = document.createElement('button');
            btnBitacora.className = 'btn-primary';
            btnBitacora.innerHTML = '<span>📋 Bitácora</span>';
            btnBitacora.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
            btnBitacora.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.3)';
            btnBitacora.onclick = () => abrirBitacora(s);
            actions.appendChild(btnBitacora);
        }
    }
    else if (estado === 'completado') {
        // Botón Bitácora - visible en servicios completados
        const btnBitacora = document.createElement('button');
        btnBitacora.className = 'btn-primary';
        btnBitacora.innerHTML = '<span>📋 Bitácora</span>';
        btnBitacora.style.background = 'linear-gradient(135deg, #0284C7, #0369A1)';
        btnBitacora.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.3)';
        btnBitacora.onclick = () => abrirBitacora(s);
        actions.appendChild(btnBitacora);
    }

    const c = document.createElement('button');
    c.className = 'btn-ghost';
    c.textContent = 'Cerrar';
    c.onclick = () => cerrarModal();
    actions.appendChild(c);

    document.getElementById('modalBackdrop').style.display = 'flex';
}

function cerrarModal() {
    const mb = document.getElementById('modalBackdrop');
    if (mb) mb.style.display = 'none';
}

/* =========================================
   BITÁCORA DE SERVICIO
   ========================================= */

// Variable global para almacenar el contexto del servicio actual
var BITACORA_SERVICIO_ACTUAL = null;
window.BITACORA_SERVICIO_ACTUAL = null;
window.BITACORA_SERVICIO_ACTUAL = null;

/**
 * Maneja la selección visual de botones de opción en la bitácora
 */
function selectBitOption(btn, inputId, value) {
    if (document.getElementById('bitacoraBackdrop')?.classList.contains('bitacora-solo-lectura')) return;

    const container = btn.closest('.bit-options-row, .bitacora-options');
    if (!container) return;

    container.querySelectorAll('.bit-option-pill, .bitacora-option-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const input = document.getElementById(inputId);
    if (input) input.value = value;

    if (inputId === 'bit_p1') {
        const p1Cuales = document.getElementById('bit_p1_cuales');
        if (p1Cuales) {
            if (value === 'No') {
                p1Cuales.style.display = 'block';
                p1Cuales.required = true;
            } else {
                p1Cuales.style.display = 'none';
                p1Cuales.required = false;
                p1Cuales.value = '';
            }
        }
    }

    if (typeof window._triggerAutoSaveDebounced === 'function') {
        window._triggerAutoSaveDebounced();
    }
}
window.selectBitOption = selectBitOption;

/**
 * Abre el modal de bitácora y guarda el contexto del servicio
 */
/**
 * Abre el modal de bitácora y pre-llena con datos existentes si los hay
 */
async function abrirBitacora(servicio, soloLectura = false) {
    window.BITACORA_SOLO_LECTURA = !!soloLectura;
    window._cargandoBitacora = true;
    if (window.BitacorasSupabase?.cancelarAutoGuardado) {
        window.BitacorasSupabase.cancelarAutoGuardado();
    }

    BITACORA_SERVICIO_ACTUAL = servicio;
    window.BITACORA_SERVICIO_ACTUAL = servicio;

    const backdrop = document.getElementById('bitacoraBackdrop');
    // Bloquear scroll general de la pantalla para evitar doble barra y desplazamiento de fondo
    document.body.classList.add('bitacora-modal-open');
    document.documentElement.classList.add('bitacora-modal-open');

    // Asignar clase de solo lectura de inmediato para evitar que cualquier evento dispare auto-guardados
    if (soloLectura) {
        backdrop.classList.add('bitacora-solo-lectura');
    } else {
        backdrop.classList.remove('bitacora-solo-lectura');
    }

    // Mostrar modal inmediatamente para que el preloader sea visible dentro
    backdrop.style.display = 'flex';

    // Reiniciar al paso 1 en la navegación
    if (typeof cambiarPasoBitacora === 'function') {
        const actual = typeof _pasoBitacoraActual !== 'undefined' ? _pasoBitacoraActual : 1;
        cambiarPasoBitacora(1 - actual);
    }

    // Poblar cabecera dinámica (ID actualizados en index.html)
    const titulo = document.getElementById('bit_titulo');
    const infoCliente = document.getElementById('bit_info_cliente');
    const infoNinera = document.getElementById('bit_info_ninera');
    const fechaDisplay = document.getElementById('bit_info_fecha_display');
    const horarioDisplay = document.getElementById('bit_info_horario_display');

    if (titulo) {
        const tipoBase = (servicio.tipo_servicio || '').toLowerCase();
        let textoTitulo = 'Bitácora del Servicio';
        if (tipoBase.includes('neuronanny')) textoTitulo = 'Bitácora Neuronanny';
        else if (tipoBase.includes('educativa')) textoTitulo = 'Bitácora Nanny Educativa';

        titulo.textContent = soloLectura ? `${textoTitulo} (Lectura)` : textoTitulo;
    }
    if (infoCliente) infoCliente.textContent = `Cliente: ${servicio.cliente || servicio.nombre_cliente || '—'}`;
    if (infoNinera) {
        const nombreNinera = servicio.nombre_ninera || servicio.ninera || servicio['Nombre de la niñera'] || (window.SESION?.nombre) || '—';
        infoNinera.textContent = `Niñera: ${nombreNinera}`;
    }

    if (fechaDisplay && servicio.fecha) {
        try {
            const [yy, mm, dd] = String(servicio.fecha).slice(0, 10).split('-');
            const dObj = new Date(yy, mm - 1, dd, 12, 0, 0);
            const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            fechaDisplay.textContent = `${dias[dObj.getDay()]} ${String(dObj.getDate()).padStart(2, '0')} ${meses[dObj.getMonth()]}`;
        } catch (e) {
            fechaDisplay.textContent = servicio.fecha;
        }
    }
    if (horarioDisplay) {
        const hIni = servicio.hora_inicio || servicio.inicio || '';
        const hFin = servicio.hora_fin || servicio.fin || '';
        horarioDisplay.textContent = (hIni && hFin) ? `${hIni} - ${hFin}` : (hIni || '08:00 AM - 02:00 PM');
    }

    const infoFechaCreacion = document.getElementById('bit_info_fecha_creacion');
    if (infoFechaCreacion) infoFechaCreacion.innerHTML = '';

    // --- NUEVO: Manejo de solo lectura ---
    const btnDraft = document.getElementById('bit_btn_draft');
    const btnFinalizar = document.getElementById('bit_btn_finalizar');
    const form = document.getElementById('formBitacora');

    // Eliminar botones dinámicos previos (para evitar duplicados)
    const btnLeidoExistente = document.getElementById('btn-leido-aceptado');
    if (btnLeidoExistente) btnLeidoExistente.remove();
    const btnRevisadaExistente = document.getElementById('btn-revisada-supervision');
    if (btnRevisadaExistente) btnRevisadaExistente.remove();

    if (soloLectura) {
        backdrop.classList.add('bitacora-solo-lectura');
        if (btnDraft) btnDraft.style.display = 'none';
        if (btnFinalizar) btnFinalizar.style.display = 'none';
        if (form) {
            form.querySelectorAll('input:not([type="hidden"]), textarea').forEach(el => {
                el.readOnly = true;
                el.disabled = true;
            });

            // Inyectar botón "Leído y aceptado" SOLO PARA CLIENTES (No supervisores/admins)
            if (SESION.rol === 'cliente' || (SESION.cliente && !SESION.supervision && !SESION.admin)) {
                const btnLeido = document.createElement('button');
                btnLeido.id = 'btn-leido-aceptado';
                btnLeido.type = 'button';
                btnLeido.innerHTML = '✅ Leído y aceptado';
                btnLeido.style.cssText = `
                width: 100%;
                margin-top: 14px;
                padding: 14px 20px;
                background: #FEF9C3;
                color: #854D0E;
                font-family: 'Nunito Sans', sans-serif;
                font-size: 15px;
                font-weight: 700;
                border: none;
                border-left: 5px solid #FBBF24;
                border-radius: 14px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
                letter-spacing: 0.3px;
                transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                text-align: center;
            `;
                btnLeido.onmouseenter = () => {
                    if (!btnLeido.dataset.aceptado) {
                        btnLeido.style.filter = 'brightness(0.97)';
                    }
                };
                btnLeido.onmouseleave = () => {
                    btnLeido.style.filter = '';
                };
                btnLeido.onclick = async () => {
                    if (btnLeido.dataset.aceptado) return; // Evitar doble click

                    // Estado de carga
                    btnLeido.disabled = true;
                    btnLeido.innerHTML = '⏳ Guardando en la base de datos...';

                    try {
                        const servicio = BITACORA_SERVICIO_ACTUAL;
                        const nomCli = servicio.cliente || servicio.nombre_cliente || SESION.nombre || '';
                        const nomNin = servicio.nombre_ninera || servicio['Nombre de la niñera'] || servicio.ninera || '';

                        let res = null;
                        if (window.BitacorasSupabase) {
                            res = await window.BitacorasSupabase.aceptar(servicio.fecha, nomCli, nomNin, servicio.row_id || servicio.id, servicio);
                        }

                        const fechaIso = (res && res.fecha_acepta) || new Date().toISOString();
                        const dObj = new Date(fechaIso);
                        const fechaFmt = !isNaN(dObj.getTime())
                            ? (dObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) + ' ' + dObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }))
                            : '';

                        // Actualizar caché local para persistencia inmediata al reabrir
                        const cacheKey = `${servicio.fecha}_${servicio.email || servicio.cliente}_${_norm(nomNin)}`;
                        const cacheKeyAlt = `${servicio.fecha}_${servicio.cliente}_${_norm(nomNin)}`;
                        const cacheKeySimple = `${servicio.fecha}_${servicio.cliente}`;

                        [cacheKey, cacheKeyAlt, cacheKeySimple].forEach(k => {
                            if (BITACORA_CACHE) {
                                if (!BITACORA_CACHE[k]) BITACORA_CACHE[k] = {};
                                BITACORA_CACHE[k].Acepta = 'Sí';
                                BITACORA_CACHE[k].acepta = 'Sí';
                                BITACORA_CACHE[k].fecha_acepta = fechaIso;
                                BITACORA_CACHE[k].estado = 'aprobada';
                            }
                            try {
                                const ls = localStorage.getItem('BITACORA_DRAFT_' + k);
                                if (ls) {
                                    const p = JSON.parse(ls);
                                    p.Acepta = 'Sí';
                                    p.acepta = 'Sí';
                                    p.fecha_acepta = fechaIso;
                                    p.estado = 'aprobada';
                                    localStorage.setItem('BITACORA_DRAFT_' + k, JSON.stringify(p));
                                }
                            } catch (eLs) { }
                        });

                        // Actualizar el objeto de servicio para persistencia en el calendario
                        servicio.bitacora_aceptada = true;
                        servicio.estado_bitacora = 'aprobada';
                        if (servicio.bitacora_datos) {
                            servicio.bitacora_datos.Acepta = 'Sí';
                            servicio.bitacora_datos.acepta = 'Sí';
                            servicio.bitacora_datos.fecha_acepta = fechaIso;
                            servicio.bitacora_datos.estado = 'aprobada';
                        }

                        if (CACHE_CLIENTE.servicios && Array.isArray(CACHE_CLIENTE.servicios)) {
                            const bitKey = `${servicio.fecha}|${_norm(nomNin)}`;
                            const sCache = CACHE_CLIENTE.servicios.find(sv =>
                                sv.fecha === servicio.fecha &&
                                _norm(sv.nombre_ninera || sv['Nombre de la niñera']) === _norm(nomNin)
                            );
                            if (sCache) {
                                sCache.bitacora_aceptada = true;
                                sCache.estado_bitacora = 'aprobada';
                                if (sCache.bitacora_datos) {
                                    sCache.bitacora_datos.Acepta = 'Sí';
                                    sCache.bitacora_datos.acepta = 'Sí';
                                    sCache.bitacora_datos.fecha_acepta = fechaIso;
                                    sCache.bitacora_datos.estado = 'aprobada';
                                }
                            }

                            const pill = document.querySelector(`.svc-pill-bitacora[data-bit-key="${bitKey}"]`);
                            if (pill) pill.classList.add('aceptada');
                        }

                        // Animar botón a verde con estado Aprobado y fecha/hora
                        btnLeido.dataset.aceptado = 'true';
                        btnLeido.innerHTML = `✅ Leído y Aprobado${fechaFmt ? ` (${fechaFmt})` : ''}`;
                        btnLeido.style.background = '#dcfce7';
                        btnLeido.style.color = '#166534';
                        btnLeido.style.borderLeftColor = '#22c55e';
                        btnLeido.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                        btnLeido.style.cursor = 'default';

                        // Actualizar vistas del cliente si están montadas
                        if (window.ClienteServicios) {
                            if (typeof window.ClienteServicios.renderBitacora === 'function') {
                                window.ClienteServicios.renderBitacora();
                            }
                            if (typeof window.ClienteServicios.renderSummary === 'function') {
                                window.ClienteServicios.renderSummary();
                            }
                        }

                        mostrarToast('✅ Bitácora aprobada y registrada en la base de datos', 'success');

                    } catch (err) {
                        btnLeido.disabled = false;
                        btnLeido.innerHTML = '✅ Leído y aceptado';
                        mostrarToast('❌ Error al guardar: ' + (err.message || 'Intenta de nuevo'));
                    }
                };

                const actionBar = document.querySelector('.bit-action-bar');
                if (actionBar) {
                    actionBar.appendChild(btnLeido);
                } else {
                    form.appendChild(btnLeido);
                }
            }

            // Inyectar botón "Revisada" PARA SUPERVISIÓN / ADMIN
            if (SESION.supervision || SESION.admin) {
                const btnRevisada = document.createElement('button');
                btnRevisada.id = 'btn-revisada-supervision';
                btnRevisada.type = 'button';
                btnRevisada.innerHTML = '🎯 Marcar como Revisada';
                btnRevisada.style.cssText = `
                    width: 100%;
                    margin-top: 14px;
                    padding: 14px 20px;
                    background: var(--blue-main, #3b82f6);
                    color: white;
                    font-family: 'Nunito Sans', sans-serif;
                    font-size: 15px;
                    font-weight: 800;
                    border: none;
                    border-radius: 16px;
                    cursor: pointer;
                    box-shadow: 0 6px 15px rgba(59, 130, 246, 0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                `;

                btnRevisada.onmouseenter = () => {
                    btnRevisada.style.transform = 'translateY(-2px)';
                    btnRevisada.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                };
                btnRevisada.onmouseleave = () => {
                    btnRevisada.style.transform = 'translateY(0)';
                    btnRevisada.style.boxShadow = '0 6px 15px rgba(59, 130, 246, 0.3)';
                };

                btnRevisada.onclick = async () => {
                    if (btnRevisada.disabled) return;
                    btnRevisada.disabled = true;
                    btnRevisada.innerHTML = '<span class="spinner-inline"></span> Guardando en Supabase...';

                    try {
                        const servicio = BITACORA_SERVICIO_ACTUAL;
                        const nomCli = servicio.cliente || servicio.nombre_cliente || '';
                        const nomNin = servicio.nombre_ninera || servicio.ninera || servicio['Nombre de la niñera'] || '';

                        if (window.BitacorasSupabase) {
                            await window.BitacorasSupabase.revisar(servicio.fecha, nomCli, nomNin, servicio.row_id || servicio.id, servicio, window.SESION);
                        }

                        mostrarToast('✅ Bitácora marcada como revisada exitosamente');
                        btnRevisada.style.opacity = '0';
                        btnRevisada.style.transform = 'scale(0.9)';
                        setTimeout(() => btnRevisada.remove(), 400);

                        const normN = typeof _norm === 'function' ? _norm(nomNin) : nomNin.toLowerCase();
                        const nowIso = new Date().toISOString();
                        const cacheKeys = [
                            `${servicio.fecha}_${servicio.email || servicio.cliente}_${normN}`,
                            `${servicio.fecha}_${servicio.cliente}_${normN}`,
                            `${servicio.fecha}_${servicio.cliente}`
                        ];

                        cacheKeys.forEach(k => {
                            if (BITACORA_CACHE) {
                                if (!BITACORA_CACHE[k]) BITACORA_CACHE[k] = {};
                                BITACORA_CACHE[k].Revisada = 'Sí';
                                BITACORA_CACHE[k].revisada = 'Sí';
                                BITACORA_CACHE[k].fecha_revisada = nowIso;
                                BITACORA_CACHE[k].estado_revision = 'revisada';
                            }
                            try {
                                const ls = localStorage.getItem('BITACORA_DRAFT_' + k);
                                if (ls) {
                                    const p = JSON.parse(ls);
                                    p.Revisada = 'Sí';
                                    p.revisada = 'Sí';
                                    p.fecha_revisada = nowIso;
                                    p.estado_revision = 'revisada';
                                    localStorage.setItem('BITACORA_DRAFT_' + k, JSON.stringify(p));
                                }
                            } catch (eLs) { }
                        });

                        const clienteId = (nomCli).replace(/[^a-z0-9]/gi, '_');
                        const nineraId = (nomNin).replace(/[^a-z0-9]/gi, '_');
                        const elPrefijo = servicio.prefijo || 'actual';
                        const indicador = document.getElementById(`indicador-rev-${elPrefijo}-${clienteId}_${nineraId}`);

                        if (indicador) {
                            indicador.style.background = '#16a34a';
                            indicador.title = 'Revisado';
                        }

                        // Recargar automáticamente el resumen de bitácoras para actualizar indicadores de la lista
                        if (typeof cargarResumenBitacoras === 'function') {
                            cargarResumenBitacoras(true);
                        }
                    } catch (e) {
                        btnRevisada.disabled = false;
                        btnRevisada.innerHTML = '🎯 Marcar como Revisada';
                        mostrarToast('❌ Error: ' + e.message);
                    }
                };

                const actionBar = document.querySelector('.bit-action-bar');
                if (actionBar) {
                    actionBar.appendChild(btnRevisada);
                } else {
                    form.appendChild(btnRevisada);
                }
            }
        }
    } else {
        backdrop.classList.remove('bitacora-solo-lectura');
        if (btnDraft) btnDraft.style.display = 'inline-flex';
        if (form) {
            form.querySelectorAll('input:not([type="hidden"]), textarea').forEach(el => {
                if (el.id !== 'bit_p23' && el.id !== 'bit_p24') {
                    el.readOnly = false;
                    el.disabled = false;
                }
            });
        }
    }

    // Mostrar preloader premium
    mostrarPreloaderModal('bitacoraBackdrop', 'bitacora-content-wrapper', 'Sincronizando con Supabase...');

    // Resetear formulario
    if (form) form.reset();

    // Limpiar clases active de botones y valores de inputs ocultos
    if (form) {
        form.querySelectorAll('.bit-option-pill, .bitacora-option-btn').forEach(btn => btn.classList.remove('active'));
        form.querySelectorAll('input[type="hidden"]').forEach(input => input.value = '');
    }

    // Ocultar campo condicional de "¿Cuáles?"
    const cuales = document.getElementById('bit_p1_cuales');
    if (cuales) {
        cuales.style.display = 'none';
        cuales.required = false;
    }

    // Pre-llenar horas siempre (desde el servicio)
    _prellenarHorasServicio(servicio);

    // Identificador único para el caché
    const sNinName = servicio.nombre_ninera || servicio.ninera || servicio['Nombre de la niñera'] || (window.SESION?.nombre) || '';
    const sCliName = servicio.cliente || servicio.nombre_cliente || '';
    const cacheKey = `${servicio.fecha}_${servicio.email || servicio.cliente}_${_norm(sNinName)}`;
    const cacheKeyAlt = `${servicio.fecha}_${servicio.cliente}_${_norm(sNinName)}`;
    const cacheKeySimple = `${servicio.fecha}_${servicio.cliente}`;

    // Asegurar que los listeners de auto-guardado estén activos en el formulario
    if (form && !form._autoSaveAttached) {
        form._autoSaveAttached = true;
        form.addEventListener('input', () => { if (typeof window._triggerAutoSaveDebounced === 'function') window._triggerAutoSaveDebounced(); });
        form.addEventListener('change', () => { if (typeof window._triggerAutoSaveDebounced === 'function') window._triggerAutoSaveDebounced(); });
    }

    // 1. Revisar Caché primero (Instantáneo en memoria o LocalStorage)
    let cachedData = (BITACORA_CACHE && (BITACORA_CACHE[cacheKey] || BITACORA_CACHE[cacheKeyAlt] || BITACORA_CACHE[cacheKeySimple])) || null;
    if (!cachedData) {
        try {
            const lsRaw = localStorage.getItem('BITACORA_DRAFT_' + cacheKey) ||
                localStorage.getItem('BITACORA_DRAFT_' + cacheKeyAlt) ||
                localStorage.getItem('BITACORA_DRAFT_' + cacheKeySimple);
            if (lsRaw) {
                cachedData = JSON.parse(lsRaw);
            }
        } catch (eLs) { }
    }

    if (cachedData) {
        console.log('Bitácora recuperada de caché local / LocalStorage:', cacheKey);
        if (BITACORA_CACHE) BITACORA_CACHE[cacheKey] = cachedData;
        _llenarFormularioBitacora(cachedData);
        _actualizarEstadoBtnLeido(cachedData);
        _actualizarEstadoBtnRevisado(cachedData);

        const yaAceptado = cachedData['Acepta'] || cachedData['acepta'];
        const yaRevisada = cachedData['Revisada'] || cachedData['revisada'];
        if ((yaAceptado || yaRevisada)) {
            _bloquearFormularioBitacora('(Lectura)');
        }

        ocultarPreloaderModal('bitacoraBackdrop', 'bitacora-content-wrapper');
    }

    // 2. Obtener directamente de Supabase
    try {
        let bitacoraExistente = null;
        if (window.BitacorasSupabase) {
            bitacoraExistente = await window.BitacorasSupabase.obtener(servicio.fecha, sCliName, sNinName, servicio.row_id || servicio.id);
        }

        if (bitacoraExistente) {
            console.log('Bitácora encontrada en Supabase:', bitacoraExistente);
            if (BITACORA_CACHE) {
                BITACORA_CACHE[cacheKey] = bitacoraExistente;
                BITACORA_CACHE[cacheKeyAlt] = bitacoraExistente;
                BITACORA_CACHE[cacheKeySimple] = bitacoraExistente;
            }
            try {
                localStorage.setItem('BITACORA_DRAFT_' + cacheKey, JSON.stringify(bitacoraExistente));
                localStorage.setItem('BITACORA_DRAFT_' + cacheKeySimple, JSON.stringify(bitacoraExistente));
            } catch (eLs2) { }

            _llenarFormularioBitacora(bitacoraExistente);
            _actualizarEstadoBtnLeido(bitacoraExistente);
            _actualizarEstadoBtnRevisado(bitacoraExistente);

            const yaAceptado = bitacoraExistente['Acepta'] || bitacoraExistente['acepta'];
            const yaRevisada = bitacoraExistente['Revisada'] || bitacoraExistente['revisada'];
            if ((yaAceptado || yaRevisada)) {
                _bloquearFormularioBitacora('(Lectura)');
            }
        }
    } catch (e) {
        console.error('Error al obtener bitácora desde Supabase:', e);
    } finally {
        ocultarPreloaderModal('bitacoraBackdrop', 'bitacora-content-wrapper');
        setTimeout(() => {
            window._cargandoBitacora = false;
        }, 200);
    }

    // 3. Suscribir a eventos Realtime para actualización en vivo (Familia / Niñera)
    if (window.BitacorasSupabase?.suscribirRealtime) {
        window.BitacorasSupabase.suscribirRealtime(
            servicio.fecha,
            sCliName,
            sNinName,
            (datosActualizados) => {
                console.log('⚡ [Realtime Bitacora] Datos recibidos en vivo:', datosActualizados);
                _llenarFormularioBitacora(datosActualizados);
                _actualizarEstadoBtnLeido(datosActualizados);
                _actualizarEstadoBtnRevisado(datosActualizados);
            }
        );
    }
}

/**
 * Actualiza el estado del botón 'Leído y aceptado' según si la bitácora ya fue aceptada.
 * Si el campo 'Acepta' o 'fecha_acepta' tiene valor, pone el botón en verde con la fecha/hora y lo deshabilita.
 */
function _actualizarEstadoBtnLeido(datos) {
    const btn = document.getElementById('btn-leido-aceptado');
    if (!btn) return;
    const valorAcepta = datos && (datos['Acepta'] || datos['acepta'] || '');
    const fechaAcepta = datos && (datos.fecha_acepta || datos.fecha_aceptacion);
    const esAprobada = datos && (datos.estado === 'aprobada' || valorAcepta === 'Sí' || valorAcepta === 'si' || String(valorAcepta).trim() !== '' || !!fechaAcepta);

    if (esAprobada) {
        btn.dataset.aceptado = 'true';
        btn.disabled = true;
        let fechaTxt = '';
        if (fechaAcepta) {
            try {
                const d = new Date(fechaAcepta);
                if (!isNaN(d.getTime())) {
                    fechaTxt = ` (${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })})`;
                }
            } catch (e) { }
        }
        btn.innerHTML = `✅ Leído y Aprobado${fechaTxt}`;
        btn.style.background = '#dcfce7';
        btn.style.color = '#166534';
        btn.style.borderLeftColor = '#22c55e';
        btn.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
        btn.style.cursor = 'default';
    }
}

function _actualizarEstadoBtnRevisado(datos) {
    const btn = document.getElementById('btn-revisada-supervision');
    if (!btn) return;
    const valorRevisada = datos && (datos['Revisada'] || datos['revisada'] || '');
    if (valorRevisada && String(valorRevisada).trim() !== '') {
        // Si ya fue revisada, quitamos el botón para no saturar
        btn.remove();
    }
}

/**
 * Bloquea el formulario de bitácora para que sea de solo lectura.
 */
function _bloquearFormularioBitacora(estatusLectura = '(Lectura)') {
    const backdrop = document.getElementById('bitacoraBackdrop');
    const btnGuardar = document.querySelector('#formBitacora button[type="submit"]');
    const titulo = document.getElementById('bit_titulo');
    const form = document.getElementById('formBitacora');

    if (backdrop) backdrop.classList.add('bitacora-solo-lectura');
    if (btnGuardar) btnGuardar.style.display = 'none';

    if (titulo && estatusLectura && !titulo.textContent.includes(estatusLectura)) {
        titulo.textContent += ` ${estatusLectura}`;
    }

    if (form) {
        form.querySelectorAll('input:not([type="hidden"]), textarea').forEach(el => {
            el.readOnly = true;
            el.disabled = true;
        });
    }
}

/**
 * Pre-llena las horas fijas del servicio (inicio_real / fin_real)
 */
function _prellenarHorasServicio(servicio) {
    if (!servicio) return;
    function parseHoraToHHMM(str) {
        if (!str) return '';
        const s = String(str).trim();
        if (/^\d{2}:\d{2}$/.test(s)) return s;
        const mTime = s.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
        if (s.includes('/') || s.includes('T') || s.includes('-')) {
            try {
                let d = null;
                if (s.includes('/')) {
                    const parts = s.split(' ');
                    const dateParts = parts[0].split('/');
                    const timeParts = parts[1] ? parts[1].split(':') : ['00', '00'];
                    const yy = dateParts[2].length === 2 ? ('20' + dateParts[2]) : dateParts[2];
                    const mm = parseInt(dateParts[1], 10) - 1;
                    const dd = parseInt(dateParts[0], 10);
                    const hh = parseInt(timeParts[0], 10);
                    const min = parseInt(timeParts[1], 10);
                    d = new Date(yy, mm, dd, hh, min);
                } else {
                    d = new Date(s.includes('T') ? s : s.replace(' ', 'T'));
                }
                if (d && !isNaN(d.getTime())) {
                    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
                }
            } catch (e) { }
        }
        if (mTime) {
            return String(parseInt(mTime[1], 10)).padStart(2, '0') + ':' + mTime[2];
        }
        return '';
    }

    const valIni = parseHoraToHHMM(servicio.inicio_real || servicio.hora_inicio_real || servicio.checkin);
    if (valIni) {
        const el = document.getElementById('bit_p23');
        if (el) el.value = valIni;
    }

    const valFin = parseHoraToHHMM(servicio.fin_real || servicio.hora_fin_real || servicio.checkout);
    if (valFin) {
        const el = document.getElementById('bit_p24');
        if (el) el.value = valFin;
    }
}

/**
 * Llena el formulario con los datos de una bitácora existente
 */
function _llenarFormularioBitacora(datos) {
    if (!datos) return;
    console.log('📋 [_llenarFormularioBitacora] Llenando formulario con:', datos);

    // --- Mostrar fecha de guardado (creación) ---
    const infoFechaCreacion = document.getElementById('bit_info_fecha_creacion');
    if (infoFechaCreacion) {
        let fechaRaw = datos['Fecha de creación'] || datos['fecha de creación'] || datos.actualizado_en || datos.creado_en || '';
        if (fechaRaw) {
            try {
                const d = new Date(fechaRaw);
                if (!isNaN(d.getTime())) {
                    const dia = String(d.getDate()).padStart(2, '0');
                    const mes = String(d.getMonth() + 1).padStart(2, '0');
                    const anio = d.getFullYear();
                    const horas = String(d.getHours()).padStart(2, '0');
                    const mins = String(d.getMinutes()).padStart(2, '0');
                    infoFechaCreacion.innerHTML = `💾 Guardado: ${dia}/${mes}/${anio} ${horas}:${mins}`;
                } else {
                    infoFechaCreacion.innerHTML = `💾 Guardado: ${fechaRaw}`;
                }
            } catch (e) {
                infoFechaCreacion.innerHTML = `💾 Guardado: ${fechaRaw}`;
            }
        } else {
            infoFechaCreacion.innerHTML = '';
        }
    }

    // Mapeo de preguntas 1 a 24
    for (let i = 1; i <= 24; i++) {
        let val = '';
        if (datos.respuestas && datos.respuestas[`p${i}`] !== undefined && String(datos.respuestas[`p${i}`]).trim() !== '') {
            val = datos.respuestas[`p${i}`];
        } else if (datos[`p${i}`] !== undefined && String(datos[`p${i}`]).trim() !== '') {
            val = datos[`p${i}`];
        } else if (datos[`Pregunta ${i}`] !== undefined && String(datos[`Pregunta ${i}`]).trim() !== '') {
            val = datos[`Pregunta ${i}`];
        } else if (datos[`pregunta_${i}`] !== undefined && String(datos[`pregunta_${i}`]).trim() !== '') {
            val = datos[`pregunta_${i}`];
        } else if (datos.respuestas && datos.respuestas[`Pregunta ${i}`] !== undefined && String(datos.respuestas[`Pregunta ${i}`]).trim() !== '') {
            val = datos.respuestas[`Pregunta ${i}`];
        } else if (i === 23 && (datos['Check-in'] || datos.checkin)) {
            val = datos['Check-in'] || datos.checkin;
        } else if (i === 24 && (datos['Check-out'] || datos.checkout)) {
            val = datos['Check-out'] || datos.checkout;
        } else if (datos.respuestas && datos.respuestas[`p${i}`] !== undefined) {
            val = datos.respuestas[`p${i}`];
        } else if (datos[`p${i}`] !== undefined) {
            val = datos[`p${i}`];
        } else if (datos[`Pregunta ${i}`] !== undefined) {
            val = datos[`Pregunta ${i}`];
        }

        const inputId = `bit_p${i}`;
        const input = document.getElementById(inputId);

        if (!input) continue;
        // Si el usuario está editando activamente este input, no sobreescribir su cursor
        if (document.activeElement === input) continue;

        if (input.type === 'hidden') {
            // Caso especial P1 con condicional de síntomas
            if (i === 1) {
                const sCuales = (datos.respuestas && datos.respuestas.p1_cuales) || datos.p1_cuales || '';
                if (String(val).includes(' / ')) {
                    const parts = String(val).split(' / ');
                    _marcarOpcionBotones(inputId, parts[0]);
                    const cualesEl = document.getElementById('bit_p1_cuales');
                    if (cualesEl) {
                        cualesEl.value = parts[1] || sCuales;
                        cualesEl.style.display = 'block';
                    }
                } else if (sCuales) {
                    _marcarOpcionBotones(inputId, val || 'No');
                    const cualesEl = document.getElementById('bit_p1_cuales');
                    if (cualesEl) {
                        cualesEl.value = sCuales;
                        cualesEl.style.display = 'block';
                    }
                } else {
                    _marcarOpcionBotones(inputId, val);
                }
            } else {
                _marcarOpcionBotones(inputId, val);
            }
        } else {
            // Inputs normales (number, text, textarea, time)
            if (input.type === 'time' && val) {
                // Formato HH:mm
                try {
                    if (val instanceof Date) {
                        input.value = String(val.getHours()).padStart(2, '0') + ':' + String(val.getMinutes()).padStart(2, '0');
                    } else if (String(val).includes(':')) {
                        const parts = String(val).split(':');
                        input.value = parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
                    } else if (/^\d{2}:\d{2}$/.test(val)) {
                        input.value = val;
                    }
                } catch (e) {
                    console.error('Error al formatear tiempo para P' + i, e);
                }
            } else {
                input.value = (val !== undefined && val !== null) ? val : '';
            }
        }
    }
}

/**
 * Marca un botón como activo basándose en su valor e input oculto
 */
function _marcarOpcionBotones(inputId, valor) {
    if (valor === undefined || valor === null || valor === '') return;
    const input = document.getElementById(inputId);
    if (!input) return;

    input.value = valor;

    // Normalizar valor buscado (soportando booleans, números y strings)
    let vNorm = typeof _norm === 'function' ? _norm(valor) : String(valor).toLowerCase().trim();
    if (valor === true || vNorm === 'true' || vNorm === '1' || vNorm === 'si' || vNorm === 'sí') vNorm = 'si';
    else if (valor === false || vNorm === 'false' || vNorm === '0' || vNorm === 'no') vNorm = 'no';
    else if (vNorm === 'n/a' || vNorm === 'na' || vNorm === 'no aplica') vNorm = 'na';
    else if (vNorm === 'mas' || vNorm === 'pidio mas' || vNorm === 'mucho') vNorm = 'pidio mas';
    else if (vNorm === 'aviso' || vNorm === 'avisó') vNorm = 'aviso';

    const form = document.getElementById('formBitacora');
    if (!form) return;

    // Buscar en el contenedor específico de la pregunta o en todo el formulario
    const container = input.closest('.bit-form-group, .bitacora-form-group') || form;
    const botones = container.querySelectorAll('.bit-option-pill, .bitacora-option-btn');

    botones.forEach(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        if (container === form && !onclick.includes(`'${inputId}'`) && !onclick.includes(`"${inputId}"`)) {
            return;
        }

        const btnText = btn.textContent.replace(/[✓✔]/g, '').trim();
        let tNorm = typeof _norm === 'function' ? _norm(btnText) : btnText.toLowerCase().trim();
        if (tNorm === 'si' || tNorm === 'sí') tNorm = 'si';
        else if (tNorm === 'no') tNorm = 'no';
        else if (tNorm === 'n/a' || tNorm === 'na') tNorm = 'na';
        else if (tNorm === 'mas' || tNorm === 'pidio mas') tNorm = 'pidio mas';
        else if (tNorm === 'aviso' || tNorm === 'avisó') tNorm = 'aviso';

        let optValNorm = '';
        const matchArg = onclick.match(/selectBitOption\s*\([^,]+,[^,]+,\s*['"]([^'"]+)['"]/);
        if (matchArg && matchArg[1]) {
            optValNorm = typeof _norm === 'function' ? _norm(matchArg[1]) : matchArg[1].toLowerCase().trim();
            if (optValNorm === 'si' || optValNorm === 'sí') optValNorm = 'si';
            else if (optValNorm === 'no') optValNorm = 'no';
            else if (optValNorm === 'n/a' || optValNorm === 'na') optValNorm = 'na';
            else if (optValNorm === 'mas' || optValNorm === 'pidio mas') optValNorm = 'pidio mas';
            else if (optValNorm === 'aviso' || optValNorm === 'avisó') optValNorm = 'aviso';
        }

        const isMatch = (vNorm === tNorm) ||
            (optValNorm && vNorm === optValNorm) ||
            (vNorm && tNorm && (vNorm.includes(tNorm) || tNorm.includes(vNorm))) ||
            (optValNorm && (vNorm.includes(optValNorm) || optValNorm.includes(vNorm)));

        if (isMatch) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Cierra el modal de bitácora y limpia el formulario
 */
function cerrarBitacora() {
    // Cancelar cualquier temporizador de auto-guardado
    if (window.BitacorasSupabase?.cancelarAutoGuardado) {
        window.BitacorasSupabase.cancelarAutoGuardado();
    }
    window.BITACORA_SOLO_LECTURA = false;
    window._cargandoBitacora = false;

    // Desuscribir canal Realtime
    if (window.BitacorasSupabase?.desuscribirRealtime) {
        window.BitacorasSupabase.desuscribirRealtime();
    }

    const backdrop = document.getElementById('bitacoraBackdrop');
    backdrop.style.display = 'none';
    backdrop.classList.remove('bitacora-solo-lectura');

    // Restaurar scroll general de la pantalla
    document.body.classList.remove('bitacora-modal-open');
    document.documentElement.classList.remove('bitacora-modal-open');

    const form = document.getElementById('formBitacora');
    if (form) form.reset();

    BITACORA_SERVICIO_ACTUAL = null;

    // Limpiar info de servicio
    const lblCliente = document.getElementById('bit_info_cliente');
    const lblNinera = document.getElementById('bit_info_ninera');
    const lblFechaCreacion = document.getElementById('bit_info_fecha_creacion');
    if (lblCliente) lblCliente.innerHTML = '';
    if (lblNinera) lblNinera.innerHTML = '';
    if (lblFechaCreacion) lblFechaCreacion.innerHTML = '';

    // Limpiar navegación
    const nav = document.getElementById('nav-bitacora-supervision-container');
    if (nav) nav.innerHTML = '';
}

/**
 * Lógica de navegación y carga para supervisión (Bitácoras)
 */
async function abrirBitacorasClienteDesdeResumen(cliente, prefijo, tipoServicioResumen, nombreNineraResumen) {
    BITACORA_SESSION_ID++;
    BITACORA_CLIENTE = cliente;
    const key = `${prefijo}|${cliente}|${nombreNineraResumen || ''}`;
    const fechas = RESUMEN_BITACORAS_SUP[key] || [];

    if (!fechas.length) {
        alert('No hay bitácoras requeridas para este cliente en esta semana.');
        return;
    }

    BITACORAS_FECHAS = fechas.slice().sort();
    BITACORA_INDEX = 0;
    BITACORA_FUENTE = BITACORAS_FECHAS.map(f => ({
        cliente,
        fecha: f,
        tipo_servicio: tipoServicioResumen || '',
        nombre_ninera: nombreNineraResumen || '',
        prefijo: prefijo || 'actual' // Contexto para saber qué indicador actualizar
    }));

    abrirBitacoraPorIndice();

    // Precargar todas las bitácoras en paralelo (silencioso en segundo plano)
    const sessionId = BITACORA_SESSION_ID;
    Promise.all(BITACORA_FUENTE.map(async (s) => {
        // Generar cacheKey igual que en abrirBitacora
        const nNorm = typeof _norm === 'function' ? _norm(s.nombre_ninera || '') : (s.nombre_ninera || '').trim();
        const cacheKey = `${s.fecha}_${s.email || s.cliente}_${nNorm}`;
        if (BITACORA_CACHE[cacheKey]) return; // Ya está en caché

        try {
            let datos = null;
            if (window.BitacorasSupabase) {
                datos = await window.BitacorasSupabase.obtener(s.fecha, s.cliente, s.nombre_ninera);
            }

            // Solo guardar si la sesión siguen siendo la misma (el usuario no cambió de cliente)
            if (BITACORA_SESSION_ID === sessionId && datos) {
                BITACORA_CACHE[cacheKey] = datos;
                console.log('Precarga background OK:', s.fecha);

                // --- ACTUALIZACIÓN VISUAL DEL INDICADOR ---
                // Verificar si TODAS las bitácoras de este grupo (Cliente+Niñera) están ya en caché y revisadas.
                const grupo = BITACORA_FUENTE.filter(f => f.cliente === s.cliente && f.nombre_ninera === s.nombre_ninera);
                const todasListas = grupo.every(gItem => {
                    const gNorm = typeof _norm === 'function' ? _norm(gItem.nombre_ninera || '') : (gItem.nombre_ninera || '').trim();
                    const gKey = `${gItem.fecha}_${gItem.email || gItem.cliente}_${gNorm}`;
                    const gData = BITACORA_CACHE[gKey];
                    if (!gData) return false; // Aún no carga
                    const rev = gData['Revisada'] || gData['revisada'] || '';
                    const strRev = String(rev || '').trim().toLowerCase();
                    return (rev === true || strRev === 'si' || strRev === 'sí' || strRev === 'yes' || strRev === 'true' || strRev === '1');
                });

                if (todasListas) {
                    const cSafe = s.cliente.replace(/[^a-z0-9]/gi, '_');
                    const nSafe = (s.nombre_ninera || '').replace(/[^a-z0-9]/gi, '_');

                    // Usar el prefijo específico del servicio para no cruzar semanas
                    const elPrefijo = s.prefijo || 'actual';
                    const indicador = document.getElementById(`indicador-rev-${elPrefijo}-${cSafe}_${nSafe}`);

                    if (indicador) {
                        indicador.style.backgroundColor = '#16a34a'; // Verde
                        indicador.title = 'Revisado';
                    }
                }
            }
        } catch (e) {
            // Fallo silencioso, se reintentará al navegar individualmente
            console.warn('Precarga background falló para', s.fecha);
        }
    }));
}

function abrirBitacoraPorIndice() {
    const fecha = BITACORAS_FECHAS[BITACORA_INDEX];
    const servicio = BITACORA_FUENTE.find(s => s.cliente === BITACORA_CLIENTE && s.fecha === fecha);

    if (!servicio) {
        alert('Servicio no encontrado');
        return;
    }

    abrirBitacora(servicio, true);
    actualizarNavegacionBitacora();
}

function bitacoraAnterior() {
    if (BITACORA_INDEX > 0) {
        BITACORA_INDEX--;
        abrirBitacoraPorIndice();
    }
}

function bitacoraSiguiente() {
    if (BITACORA_INDEX < BITACORAS_FECHAS.length - 1) {
        BITACORA_INDEX++;
        abrirBitacoraPorIndice();
    }
}

function actualizarNavegacionBitacora() {
    const total = BITACORAS_FECHAS.length;
    const actual = BITACORA_INDEX + 1;
    const fechaISO = BITACORAS_FECHAS[BITACORA_INDEX];

    // Parseo de fecha
    const [y, m, d] = fechaISO.split('-');
    const dateObj = new Date(y, m - 1, d);
    const opciones = { weekday: 'long', day: 'numeric' };
    const textoFecha = dateObj.toLocaleDateString('es-MX', opciones);
    const labelFecha = textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1);

    const navCont = document.getElementById('nav-bitacora-supervision-container');
    if (!navCont) return;

    navCont.innerHTML = `
        <div style="justify-self:start;">
            <button class="btn-ghost" onclick="bitacoraAnterior()" ${BITACORA_INDEX === 0 ? 'style="visibility:hidden;"' : ''}>⬅️ Día anterior</button>
        </div>
        <span class="muted" style="font-weight:600; justify-self:center;">
            ${labelFecha} · Día ${actual} de ${total}
        </span>
        <div style="justify-self:end;">
            <button class="btn-ghost" onclick="bitacoraSiguiente()" ${BITACORA_INDEX === total - 1 ? 'style="visibility:hidden;"' : ''}>Día siguiente ➡️</button>
        </div>
    `;
}

/**
 * Maneja el envío del formulario de bitácora
 */
async function enviarBitacora(event) {
    if (event) event.preventDefault();

    if (!BITACORA_SERVICIO_ACTUAL) {
        alert('Error: No hay servicio seleccionado');
        return;
    }

    const respuestas = typeof _recopilarRespuestasBitacora === 'function'
        ? _recopilarRespuestasBitacora()
        : {};

    // Si no se recopiló por la función de pasos, recopilar manualmente
    if (!respuestas.p1) {
        for (let i = 1; i <= 24; i++) {
            const el = document.getElementById(`bit_p${i}`);
            if (el) respuestas[`p${i}`] = el.value || '';
        }
        const p1Cuales = document.getElementById('bit_p1_cuales');
        if (p1Cuales) respuestas.p1_cuales = p1Cuales.value || '';
    }

    try {
        mostrarPreloaderModal('bitacoraBackdrop', 'bitacora-content-wrapper', 'Guardando bitácora en Supabase...');

        if (window.BitacorasSupabase) {
            const registro = await window.BitacorasSupabase.guardar(BITACORA_SERVICIO_ACTUAL, respuestas, 'completada');

            const sNinName = BITACORA_SERVICIO_ACTUAL.nombre_ninera || BITACORA_SERVICIO_ACTUAL.ninera || BITACORA_SERVICIO_ACTUAL['Nombre de la niñera'] || '';
            const cacheKey = `${BITACORA_SERVICIO_ACTUAL.fecha}_${BITACORA_SERVICIO_ACTUAL.email || BITACORA_SERVICIO_ACTUAL.cliente}_${_norm(sNinName)}`;
            BITACORA_CACHE[cacheKey] = registro;
        }

        cerrarBitacora();
        ocultarPreloaderModal('bitacoraBackdrop', 'bitacora-content-wrapper');
        mostrarToast('✅ Bitácora guardada en Supabase', 'success');

    } catch (error) {
        ocultarPreloaderModal('bitacoraBackdrop', 'bitacora-content-wrapper');
        alert('Error al guardar la bitácora: ' + error.message);
    }
}

/**
 * Mapea el payload de envío al formato que devuelve el backend (nombres de columnas)
 * para mantener consistencia en la caché.
 */
function _mapPayloadToSheetFormat(p, fechaCreacion) {
    const mapeo = {
        'Fecha': p.fecha,
        'correo niñera': p.correo_ninera,
        'nombre niñera': p.nombre_ninera,
        'correo cliente': p.correo_cliente,
        'Nombre cliente': p.nombre_cliente,
        'Acepta': p.acepta,
        'Fecha de creación': fechaCreacion || ''
    };

    // Agregar preguntas 1 a 24
    for (let i = 1; i <= 24; i++) {
        let val = p[`p${i}`];
        if (i === 1 && p.p1_cuales) val += ` / ${p.p1_cuales}`;
        mapeo[`Pregunta ${i}`] = val;
    }

    return mapeo;
}

// Event listener para mostrar/ocultar campo "¿Cuáles?" en pregunta 1
document.addEventListener('DOMContentLoaded', function () {
    // Event listener para el formulario
    const formBitacora = document.getElementById('formBitacora');
    if (formBitacora) {
        formBitacora.addEventListener('submit', enviarBitacora);
    }

    // Cerrar modal al hacer click fuera (en el backdrop)
    const bitBackdrop = document.getElementById('bitacoraBackdrop');
    if (bitBackdrop) {
        bitBackdrop.addEventListener('click', function (e) {
            // Si el click fue directamente en el backdrop (no en sus hijos/card)
            if (e.target === this) {
                cerrarBitacora();
            }
        });
    }
});

//Event listener added in init block later

async function accionConfirmar(s) {
    cerrarModal();

    if (!s) {
        alert('Error interno: datos del servicio incompletos');
        return;
    }

    // 🚀 Soporte nativo para servicios gestionados desde Supabase control_servicios
    if (s.row_id || (s.id && !s.sheet)) {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        const rId = s.row_id || (s.id ? s.id.split('_')[0] : '');
        const nannyNombre = (window.SESION?.nombre || '').trim() || 'Niñera';
        const nannyEmail = (window.SESION?.email || '').trim().toLowerCase();
        const timestampISO = new Date().toISOString();

        if (client && rId) {
            try {
                const { data: curRow } = await client.from('control_servicios').select('*').eq('id', rId).maybeSingle();
                const diaClave = s.dia_clave || 'lun';
                const diasMap = {};
                let curAsist = curRow?.asistencia_nanny;
                if (typeof curAsist === 'string') {
                    try { curAsist = JSON.parse(curAsist); } catch (e) { }
                }
                if (!curAsist && curRow?.observaciones) {
                    const m = curRow.observaciones.match(/<!--asistencia_nanny:(.*?)-->/);
                    if (m && m[1]) {
                        try { curAsist = JSON.parse(m[1]); } catch (e) { }
                    }
                }
                if (curAsist && curAsist.dias_confirmados) {
                    Object.assign(diasMap, curAsist.dias_confirmados);
                }
                const curIni = (s.hora_inicio || s.inicio || (curRow ? curRow[`${diaClave}_inicio`] : '') || '').trim();
                const curFin = (s.hora_fin || s.fin || (curRow ? curRow[`${diaClave}_fin`] : '') || '').trim();
                const horStr = s.Horario || s.horario || ((curIni && curFin) ? `${curIni} - ${curFin}` : (curIni || curFin));
                const cliStr = s.cliente || s.cliente_nombre || (curRow ? curRow.cliente_nombre : '') || '';

                const existingDia = diasMap[diaClave] || {};
                diasMap[diaClave] = {
                    ...existingDia,
                    dia_clave: diaClave,
                    nanny_nombre: nannyNombre,
                    nanny_email: nannyEmail,
                    horario: horStr,
                    hora_inicio: curIni,
                    hora_fin: curFin,
                    cliente: cliStr,
                    confirmado_en: existingDia.confirmado_en || timestampISO
                };

                const evidencePayload = {
                    confirmada: true,
                    nanny_nombre: nannyNombre,
                    nanny_email: nannyEmail,
                    cliente: cliStr,
                    cliente_nombre: cliStr,
                    dias: Object.keys(diasMap),
                    dias_confirmados: diasMap,
                    ultima_actualizacion: timestampISO
                };
                const tag = `<!--asistencia_nanny:${JSON.stringify(evidencePayload)}-->`;
                let obsBase = (curRow?.observaciones || s.observaciones || '').replace(/<!--asistencia_nanny:.*?-->/g, '').trim();
                const nuevaObs = `${tag} ${obsBase}`.trim();

                const updObj = {
                    semana_iso: curRow?.semana_iso || s.semana_iso || '',
                    observaciones: nuevaObs,
                    asistencia_nanny: evidencePayload,
                    actualizado_en: timestampISO
                };

                let { error: errUpd } = await client.from('control_servicios').update(updObj).eq('id', rId);
                if (errUpd && errUpd.message && errUpd.message.includes('asistencia_nanny')) {
                    delete updObj.asistencia_nanny;
                    await client.from('control_servicios').update(updObj).eq('id', rId);
                }

                // Notificar en vivo para actualización inmediata
                const payloadSync = {
                    row_ids: [rId],
                    nanny_nombre: nannyNombre,
                    evidence: evidencePayload,
                    timestamp: Date.now()
                };

                try {
                    if (typeof BroadcastChannel !== 'undefined') {
                        const bc = new BroadcastChannel('nyp_asistencia_channel');
                        bc.postMessage(payloadSync);
                        setTimeout(() => { bc.close(); }, 1000);
                    }
                } catch (eBc) { }

                try {
                    localStorage.setItem('nyp_evento_asistencia_confirmada', JSON.stringify(payloadSync));
                } catch (eSt) { }

                const ch = client.channel('rt_control_servicios_matriz');
                const doSend = () => {
                    ch.send({
                        type: 'broadcast',
                        event: 'asistencia_nanny_confirmada',
                        payload: payloadSync
                    }).catch(() => { });
                };
                if (ch.state === 'joined' || ch.status === 'SUBSCRIBED') {
                    doSend();
                } else {
                    ch.subscribe((st) => {
                        if (st === 'SUBSCRIBED') {
                            doSend();
                        }
                    });
                }
            } catch (eSupa) {
                console.warn("Aviso al confirmar servicio individual en Supabase:", eSupa);
            }
        }

        s.estado = 'confirmado';
        s.asistencia_confirmada = true;
        s.confirmado_en = timestampISO;

        (CAL_SERVICIOS || []).forEach(x => {
            if (x.id === s.id || (rId && x.row_id === rId && x.dia_clave === s.dia_clave)) {
                x.estado = 'confirmado';
                x.asistencia_confirmada = true;
                x.confirmado_en = timestampISO;
            }
        });

        renderCalendario2Semanas();
        if (typeof window.mostrarToast === 'function') window.mostrarToast("✅ ¡Asistencia confirmada!");
        return;
    }

    if (!s.sheet || !s.row_base) {
        alert('Error interno: datos del servicio incompletos');
        return;
    }

    try {
        const res = await api('confirmarServicioPorFila', {
            sheet: s.sheet,
            row_base: s.row_base,
            email: SESION.email
        });

        //Actualizar localmente
        CAL_SERVICIOS.forEach(x => {
            if (x.sheet === s.sheet && x.row_base === s.row_base) {
                // Solo actualizar si estaba pendiente o vacío
                // para no pisar estados "en curso" o "completado"
                if (!x.estado || x.estado === 'pendiente' || x.estado === '') {
                    x.estado = 'confirmado';
                    x.confirmado_en = res.confirmado_en;
                }
            }
        });
        renderCalendario2Semanas();

    } catch (err) {
        alert(err.message);
    }
}

async function accionIniciar(sOrSheet, row, fechaISO) {
    cerrarModal();
    let s = (sOrSheet && typeof sOrSheet === 'object') ? sOrSheet : null;
    let sheetName = typeof sOrSheet === 'string' ? sOrSheet : (s ? s.sheet : '');
    let r = row || (s ? (s.row_base || s.row_id) : '');
    let fecha = fechaISO || (s ? (s.fecha || s.Fecha) : '');

    // 🚀 1. Soporte nativo y seguro para Supabase control_servicios
    if (s && (s.row_id || (s.id && !s.sheet))) {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        const rId = s.row_id || (s.id ? s.id.split('_')[0] : '');
        const nannyNombre = (window.SESION?.nombre || '').trim() || 'Niñera';
        const nannyEmail = (window.SESION?.email || '').trim().toLowerCase();
        const timestampISO = new Date().toISOString();

        if (client && rId) {
            try {
                const { data: curRow } = await client.from('control_servicios').select('*').eq('id', rId).maybeSingle();
                const diaClave = s.dia_clave || 'lun';
                const diasMap = {};
                let curAsist = curRow?.asistencia_nanny;
                if (typeof curAsist === 'string') {
                    try { curAsist = JSON.parse(curAsist); } catch (e) { }
                }
                if (!curAsist && curRow?.observaciones) {
                    const m = curRow.observaciones.match(/<!--asistencia_nanny:(.*?)-->/);
                    if (m && m[1]) {
                        try { curAsist = JSON.parse(m[1]); } catch (e) { }
                    }
                }
                if (curAsist && curAsist.dias_confirmados) {
                    Object.assign(diasMap, curAsist.dias_confirmados);
                }
                const curDia = diasMap[diaClave] || {};
                curDia.inicio_real = timestampISO;
                curDia.estado = 'en curso';
                curDia.nanny_nombre = nannyNombre;
                curDia.nanny_email = nannyEmail;
                if (!curDia.confirmado_en) curDia.confirmado_en = timestampISO;
                if (s.horario && !curDia.horario) curDia.horario = s.horario;
                if (s.hora_inicio && !curDia.hora_inicio) curDia.hora_inicio = s.hora_inicio;
                if (s.hora_fin && !curDia.hora_fin) curDia.hora_fin = s.hora_fin;
                if (!curDia.cliente) curDia.cliente = s.cliente || s.cliente_nombre || curRow?.cliente_nombre || '';
                diasMap[diaClave] = curDia;

                const evidencePayload = {
                    confirmada: true,
                    nanny_nombre: nannyNombre,
                    nanny_email: nannyEmail,
                    cliente: s.cliente || s.cliente_nombre || curRow?.cliente_nombre || '',
                    cliente_nombre: s.cliente || s.cliente_nombre || curRow?.cliente_nombre || '',
                    dias: Object.keys(diasMap),
                    dias_confirmados: diasMap,
                    ultima_actualizacion: timestampISO
                };
                const tag = `<!--asistencia_nanny:${JSON.stringify(evidencePayload)}-->`;
                let obsBase = (curRow?.observaciones || s.observaciones || '').replace(/<!--asistencia_nanny:.*?-->/g, '').trim();
                const nuevaObs = `${tag} ${obsBase}`.trim();

                const updObj = {
                    observaciones: nuevaObs,
                    asistencia_nanny: evidencePayload,
                    actualizado_en: timestampISO
                };

                let { error: errUpd } = await client.from('control_servicios').update(updObj).eq('id', rId);
                if (errUpd && errUpd.message && errUpd.message.includes('asistencia_nanny')) {
                    delete updObj.asistencia_nanny;
                    await client.from('control_servicios').update(updObj).eq('id', rId);
                }

                // Guardar en tabla confirmaciones_asistencia
                try {
                    await client.from('confirmaciones_asistencia').insert([{
                        servicio_id: s.id || `${rId}_${diaClave}`,
                        row_id: rId,
                        semana_iso: curRow?.semana_iso || s.semana_iso || '',
                        fecha: s.fecha || new Date().toISOString().split('T')[0],
                        dia_clave: diaClave,
                        horario: s.horario || s.Horario || '',
                        nanny_nombre: nannyNombre,
                        nanny_email: nannyEmail,
                        cliente_nombre: s.cliente || s.cliente_nombre || curRow?.cliente_nombre || '',
                        tipo_servicio: s.tipo_servicio || curRow?.tipo_servicio || '',
                        detalles: { accion: 'inicio_servicio', inicio_real: timestampISO }
                    }]);
                } catch (_) { }

                // Notificar en tiempo real multi-pestaña y matriz de servicios
                const payloadSync = {
                    row_id: rId,
                    row_ids: [rId],
                    nanny_nombre: nannyNombre,
                    nanny_email: nannyEmail,
                    evidence: evidencePayload,
                    timestamp: Date.now()
                };

                try {
                    if (typeof BroadcastChannel !== 'undefined') {
                        const bc = new BroadcastChannel('nyp_asistencia_channel');
                        bc.postMessage(payloadSync);
                        setTimeout(() => { try { bc.close(); } catch (e) { } }, 1000);
                    }
                } catch (eBc) { }

                try {
                    localStorage.setItem('nyp_evento_asistencia_confirmada', JSON.stringify(payloadSync));
                } catch (eSt) { }

                try {
                    const ch = client.channel('rt_control_servicios_matriz');
                    const doSend = () => {
                        ch.send({
                            type: 'broadcast',
                            event: 'asistencia_nanny_confirmada',
                            payload: payloadSync
                        }).catch(() => { });
                    };
                    if (ch.state === 'joined' || ch.status === 'SUBSCRIBED') {
                        doSend();
                    } else {
                        ch.subscribe((st) => {
                            if (st === 'SUBSCRIBED') {
                                doSend();
                            }
                        });
                    }
                } catch (eCh) { }

                if (typeof emitirCambioMatrizRealtime === 'function') {
                    emitirCambioMatrizRealtime(client, { accion: 'inicio_servicio', servicio_id: s.id });
                }
            } catch (eSupa) {
                console.warn("Aviso registrando inicio de servicio en Supabase:", eSupa);
            }
        }

        s.inicio_real = timestampISO;
        s.estado = 'en curso';
        (CAL_SERVICIOS || []).forEach(x => {
            if (x.id === s.id || (rId && x.row_id === rId && x.dia_clave === s.dia_clave)) {
                x.inicio_real = timestampISO;
                x.estado = 'en curso';
            }
        });

        // 🚀 Sincronizar automáticamente hora de inicio en la bitácora (p23 / Check-in)
        try {
            const hIniObj = new Date(timestampISO);
            const horaIniStr = String(hIniObj.getHours()).padStart(2, '0') + ':' + String(hIniObj.getMinutes()).padStart(2, '0');
            const p23El = document.getElementById('bit_p23');
            if (p23El) p23El.value = horaIniStr;

            if (window.BitacorasSupabase) {
                let curBit = null;
                if (typeof window.BitacorasSupabase.obtener === 'function') {
                    curBit = await window.BitacorasSupabase.obtener(s.fecha, s.cliente || s.cliente_nombre, s.nombre_ninera || nannyNombre, s.id || rId);
                }
                const curResp = Object.assign({}, curBit?.respuestas || {});
                curResp.p23 = horaIniStr;
                if (typeof window.BitacorasSupabase.guardar === 'function') {
                    await window.BitacorasSupabase.guardar(s, curResp, curBit?.estado || 'borrador');
                }
            }
        } catch (eBitIni) {
            console.warn("Aviso auto-sincronizando inicio en bitácora:", eBitIni);
        }

        if (typeof renderCalendario2Semanas === 'function') renderCalendario2Semanas();
        if (window.NannyInicio && typeof window.NannyInicio.cargarServicios === 'function') {
            window.NannyInicio.cargarServicios(true);
        }
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast("🚀 ¡Servicio iniciado con éxito!");
        } else {
            alert("🚀 ¡Servicio iniciado con éxito!");
        }
        return;
    }

    // 🚀 2. Fallback legado para Google Sheets
    if (sheetName && r) {
        try {
            await api('registrarInicioServicio', {
                sheet: sheetName,
                row_base: r,
                fecha: fecha,
                email: SESION.email
            });
            if (typeof refreshServicios === 'function') refreshServicios();
        } catch (err) {
            alert(err.message);
        }
    }
}

async function accionFinalizar(sOrSheet, row, fechaISO) {
    cerrarModal();
    let s = (sOrSheet && typeof sOrSheet === 'object') ? sOrSheet : null;
    let sheetName = typeof sOrSheet === 'string' ? sOrSheet : (s ? s.sheet : '');
    let r = row || (s ? (s.row_base || s.row_id) : '');
    let fecha = fechaISO || (s ? (s.fecha || s.Fecha) : '');

    // 🚀 1. Soporte nativo y seguro para Supabase control_servicios
    if (s && (s.row_id || (s.id && !s.sheet))) {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        const rId = s.row_id || (s.id ? s.id.split('_')[0] : '');
        const nannyNombre = (window.SESION?.nombre || '').trim() || 'Niñera';
        const nannyEmail = (window.SESION?.email || '').trim().toLowerCase();
        const timestampISO = new Date().toISOString();

        if (client && rId) {
            try {
                const { data: curRow } = await client.from('control_servicios').select('*').eq('id', rId).maybeSingle();
                const diaClave = s.dia_clave || 'lun';
                const diasMap = {};
                let curAsist = curRow?.asistencia_nanny;
                if (typeof curAsist === 'string') {
                    try { curAsist = JSON.parse(curAsist); } catch (e) { }
                }
                if (!curAsist && curRow?.observaciones) {
                    const m = curRow.observaciones.match(/<!--asistencia_nanny:(.*?)-->/);
                    if (m && m[1]) {
                        try { curAsist = JSON.parse(m[1]); } catch (e) { }
                    }
                }
                if (curAsist && curAsist.dias_confirmados) {
                    Object.assign(diasMap, curAsist.dias_confirmados);
                }
                const curDia = diasMap[diaClave] || {};
                curDia.fin_real = timestampISO;
                curDia.estado = 'completado';
                curDia.nanny_nombre = nannyNombre;
                curDia.nanny_email = nannyEmail;
                if (s.inicio_real && !curDia.inicio_real) curDia.inicio_real = s.inicio_real;
                if (!curDia.confirmado_en) curDia.confirmado_en = curDia.inicio_real || timestampISO;
                if (s.horario && !curDia.horario) curDia.horario = s.horario;
                if (s.hora_inicio && !curDia.hora_inicio) curDia.hora_inicio = s.hora_inicio;
                if (s.hora_fin && !curDia.hora_fin) curDia.hora_fin = s.hora_fin;
                if (!curDia.cliente) curDia.cliente = s.cliente || s.cliente_nombre || curRow?.cliente_nombre || '';
                diasMap[diaClave] = curDia;

                const evidencePayload = {
                    confirmada: true,
                    nanny_nombre: nannyNombre,
                    nanny_email: nannyEmail,
                    cliente: s.cliente || s.cliente_nombre || curRow?.cliente_nombre || '',
                    cliente_nombre: s.cliente || s.cliente_nombre || curRow?.cliente_nombre || '',
                    dias: Object.keys(diasMap),
                    dias_confirmados: diasMap,
                    ultima_actualizacion: timestampISO
                };
                const tag = `<!--asistencia_nanny:${JSON.stringify(evidencePayload)}-->`;
                let obsBase = (curRow?.observaciones || s.observaciones || '').replace(/<!--asistencia_nanny:.*?-->/g, '').trim();
                const nuevaObs = `${tag} ${obsBase}`.trim();

                const updObj = {
                    observaciones: nuevaObs,
                    asistencia_nanny: evidencePayload,
                    actualizado_en: timestampISO
                };

                let { error: errUpd } = await client.from('control_servicios').update(updObj).eq('id', rId);
                if (errUpd && errUpd.message && errUpd.message.includes('asistencia_nanny')) {
                    delete updObj.asistencia_nanny;
                    await client.from('control_servicios').update(updObj).eq('id', rId);
                }

                // Guardar en tabla confirmaciones_asistencia
                try {
                    await client.from('confirmaciones_asistencia').insert([{
                        servicio_id: s.id || `${rId}_${diaClave}`,
                        row_id: rId,
                        semana_iso: curRow?.semana_iso || s.semana_iso || '',
                        fecha: s.fecha || new Date().toISOString().split('T')[0],
                        dia_clave: diaClave,
                        horario: s.horario || s.Horario || '',
                        nanny_nombre: nannyNombre,
                        nanny_email: nannyEmail,
                        cliente_nombre: s.cliente || s.cliente_nombre || curRow?.cliente_nombre || '',
                        tipo_servicio: s.tipo_servicio || curRow?.tipo_servicio || '',
                        detalles: { accion: 'fin_servicio', fin_real: timestampISO }
                    }]);
                } catch (_) { }

                // Notificar en tiempo real multi-pestaña y matriz de servicios
                const payloadSync = {
                    row_id: rId,
                    row_ids: [rId],
                    nanny_nombre: nannyNombre,
                    nanny_email: nannyEmail,
                    evidence: evidencePayload,
                    timestamp: Date.now()
                };

                try {
                    if (typeof BroadcastChannel !== 'undefined') {
                        const bc = new BroadcastChannel('nyp_asistencia_channel');
                        bc.postMessage(payloadSync);
                        setTimeout(() => { try { bc.close(); } catch (e) { } }, 1000);
                    }
                } catch (eBc) { }

                try {
                    localStorage.setItem('nyp_evento_asistencia_confirmada', JSON.stringify(payloadSync));
                } catch (eSt) { }

                try {
                    const ch = client.channel('rt_control_servicios_matriz');
                    const doSend = () => {
                        ch.send({
                            type: 'broadcast',
                            event: 'asistencia_nanny_confirmada',
                            payload: payloadSync
                        }).catch(() => { });
                    };
                    if (ch.state === 'joined' || ch.status === 'SUBSCRIBED') {
                        doSend();
                    } else {
                        ch.subscribe((st) => {
                            if (st === 'SUBSCRIBED') {
                                doSend();
                            }
                        });
                    }
                } catch (eCh) { }

                if (typeof emitirCambioMatrizRealtime === 'function') {
                    emitirCambioMatrizRealtime(client, { accion: 'fin_servicio', servicio_id: s.id });
                }
            } catch (eSupa) {
                console.warn("Aviso registrando fin de servicio en Supabase:", eSupa);
            }
        }

        s.fin_real = timestampISO;
        s.estado = 'completado';
        (CAL_SERVICIOS || []).forEach(x => {
            if (x.id === s.id || (rId && x.row_id === rId && x.dia_clave === s.dia_clave)) {
                x.fin_real = timestampISO;
                x.estado = 'completado';
            }
        });

        // 🚀 Sincronizar automáticamente hora de fin en la bitácora (p24 / Check-out)
        try {
            const hFinObj = new Date(timestampISO);
            const horaFinStr = String(hFinObj.getHours()).padStart(2, '0') + ':' + String(hFinObj.getMinutes()).padStart(2, '0');
            const p24El = document.getElementById('bit_p24');
            if (p24El) p24El.value = horaFinStr;

            if (window.BitacorasSupabase) {
                let curBit = null;
                if (typeof window.BitacorasSupabase.obtener === 'function') {
                    curBit = await window.BitacorasSupabase.obtener(s.fecha, s.cliente || s.cliente_nombre, s.nombre_ninera || nannyNombre, s.id || rId);
                }
                const curResp = Object.assign({}, curBit?.respuestas || {});
                curResp.p24 = horaFinStr;
                if (typeof window.BitacorasSupabase.guardar === 'function') {
                    await window.BitacorasSupabase.guardar(s, curResp, curBit?.estado || 'borrador');
                }
            }
        } catch (eBitFin) {
            console.warn("Aviso auto-sincronizando fin en bitácora:", eBitFin);
        }

        if (typeof renderCalendario2Semanas === 'function') renderCalendario2Semanas();
        if (window.NannyInicio && typeof window.NannyInicio.cargarServicios === 'function') {
            window.NannyInicio.cargarServicios(true);
        }
        if (typeof window.mostrarToast === 'function') {
            window.mostrarToast("🏁 ¡Servicio finalizado con éxito!");
        } else {
            alert("🏁 ¡Servicio finalizado con éxito!");
        }
        return;
    }

    // 🚀 2. Fallback legado para Google Sheets
    if (sheetName && r) {
        try {
            await api('registrarFinServicio', {
                sheet: sheetName,
                row_base: r,
                fecha: fecha,
                email: SESION.email
            });
            if (typeof refreshServicios === 'function') refreshServicios();
        } catch (err) {
            alert(err.message);
        }
    }
}

/* =========================================
   SUGERIDOR ADMIN
   ========================================= */
async function sugerir() {
    const msg = document.getElementById('admMsg');
    const out = document.getElementById('admResultados');
    const btn = document.getElementById('btnSugerir');

    const fecha = document.getElementById('sv_fecha').value;
    const hi = document.getElementById('sv_hi').value;
    const hf = document.getElementById('sv_hf').value;
    const ubic = document.getElementById('sv_ubic').value.trim();
    const edad = parseFloat(document.getElementById('sv_edad').value);

    if (!fecha || !hi || !hf || isNaN(edad)) {
        msg.innerHTML = '<span class="err">Completa fecha, horario y edad.</span>';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Calculando...';
    msg.textContent = '';
    out.innerHTML = '';

    const payload = { fecha, hora_inicio: hi, hora_fin: hf, ubicacion: ubic, edad };

    try {
        const res = await api('apiSugerirNinerasServicio', { ...payload, email: SESION.email });

        btn.disabled = false;
        btn.textContent = 'Sugerir niñeras';
        renderResultados(res || []);
        if (!res || res.length === 0) msg.innerHTML = '<span class="muted">Sin candidatas.</span>';

    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Sugerir niñeras';
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

function renderResultados(lista) {
    const out = document.getElementById('admResultados');
    if (!lista.length) { out.innerHTML = '<p class="muted">No hay resultados.</p>'; return; }
    let html = '<table><thead><tr><th>#</th><th>Niñera</th><th>Disponible</th><th>Cubre edad</th><th>Distancia (km)</th><th>Motivo</th></tr></thead><tbody>';
    lista.forEach((n, i) => { html += `<tr><td>${i + 1}</td><td>${n.nombre || '—'}</td><td style="color:${n.disponible ? '#059669' : '#dc2626'}">${n.disponible ? 'Sí' : 'No'}</td><td>${n.cumple_edad ? 'Sí' : 'No'}</td><td>${n.distancia_km == null ? '—' : n.distancia_km}</td><td>${n.motivo || ''}</td></tr>`; });
    html += '</tbody></table>'; out.innerHTML = html;
}

/* =========================================
   AGENDA ADMIN SEMANAL
   ========================================= */
function setWeekLabel(lunesISO) {
    const d0 = new Date(lunesISO + 'T00:00:00');
    const d6 = new Date(lunesISO + 'T00:00:00');
    d6.setDate(d6.getDate() + 6);
    document.getElementById('admWeekLabel').textContent = `Semana: ${d0.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} – ${d6.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} (Lun–Dom)`;
}

async function cargarAgendaAdminSemana(lunesISO) {
    const dL = startMonday(new Date(lunesISO + 'T00:00:00'));
    const desdeISO = toISO(dL);
    const d6 = new Date(dL); d6.setDate(dL.getDate() + 6);
    const hastaISO = toISO(d6);

    ADMIN_WEEK_START_ISO = desdeISO;
    setWeekLabel(desdeISO);

    const cont = document.getElementById('adminAgenda');
    cont.innerHTML = 'Cargando...';

    try {
        const lista = await api('obtenerServiciosAdminRango', { desde: desdeISO, hasta: hastaISO, email: SESION.email });
        renderAgendaAdminSemana(lista || [], desdeISO);
    } catch (err) {
        cont.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

function renderAgendaAdminSemana(lista, lunesISO) {
    const cont = document.getElementById('adminAgenda');
    const hoyISO = toISO(new Date());

    const porFecha = {};
    lista.forEach(s => {
        if (!porFecha[s.fecha]) porFecha[s.fecha] = [];
        porFecha[s.fecha].push(s);
    });
    Object.keys(porFecha).forEach(f => {
        porFecha[f].sort((a, b) => (a.hora_inicio || '00:00').localeCompare(b.hora_inicio || '00:00'));
    });

    function stateClass2(e) {
        e = (e || '').toLowerCase();
        if (e === 'confirmado') return 'confirmed';
        if (e === 'en curso') return 'inprogress';
        if (e === 'completado') return 'completed';
        return 'pending';
    }

    function overlap(a1, a2, b1, b2) {
        const a = _hmToMinutes(a1);
        const b = _hmToMinutes(a2);
        const c = _hmToMinutes(b1);
        const d = _hmToMinutes(b2);
        if ([a, b, c, d].some(x => !isFinite(x))) return false;
        return (a < d) && (c < b);
    }

    cont.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'week-grid';

    for (let i = 0; i < 7; i++) {
        const d = new Date(lunesISO + 'T00:00:00');
        d.setDate(d.getDate() + i);
        const iso = toISO(d);
        const dow = d.toLocaleDateString('es-MX', { weekday: 'short' }).toUpperCase();
        const dom = d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
        const items = porFecha[iso] || [];

        const col = document.createElement('div');
        col.className = 'week-col' + (iso === hoyISO ? ' is-today' : '');

        const header = document.createElement('header');
        header.innerHTML = `<span>${dow}</span><span class="date">${dom}</span>`;
        col.appendChild(header);

        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'no-data';
            empty.textContent = '—';
            col.appendChild(empty);
        } else {
            const conflictIdx = new Set();
            if (items.length > 1) {
                const porNinera = {};
                items.forEach((s, idx) => {
                    const key = (s.nombre_ninera || '').toLowerCase().trim();
                    if (!porNinera[key]) porNinera[key] = [];
                    porNinera[key].push({ s, idx });
                });

                Object.keys(porNinera).forEach(k => {
                    const arr = porNinera[k];
                    arr.sort((a, b) => (a.s.hora_inicio || '00:00').localeCompare(b.s.hora_inicio || '00:00'));
                    for (let x = 0; x < arr.length; x++) {
                        for (let y = x + 1; y < arr.length; y++) {
                            const s1 = arr[x].s;
                            const s2 = arr[y].s;
                            if (overlap(s1.hora_inicio, s1.hora_fin, s2.hora_inicio, s2.hora_fin)) {
                                conflictIdx.add(arr[x].idx);
                                conflictIdx.add(arr[y].idx);
                            }
                        }
                    }
                });
            }

            items.forEach((s, idx) => {
                let label = `${s.cliente || 'Cliente'} – ${s.nombre_ninera || 'Sin niñera'}`;
                if (conflictIdx.has(idx)) {
                    label += ' ⚠︎ niñera con servicios empalmados';
                }
                const btn = document.createElement('button');
                let cls = 'pill-svc ' + stateClass2(s.estado);
                if (conflictIdx.has(idx)) cls += ' conflict';
                if (s.ver === true) cls += ' svc-hidden-admin';

                btn.className = cls;
                btn.title = (s.hora_inicio || '') + (s.hora_fin ? ('–' + s.hora_fin) : '');
                btn.textContent = label;
                btn.onclick = () => abrirModalServicio(s);
                if (s.ver === true) {
                    btn.style.background = '#E6FBFF';
                    btn.style.borderColor = '#00BFD8';
                    btn.style.color = '#045F6B';
                    btn.style.fontWeight = '600';
                }
                col.appendChild(btn);
            });
        }
        grid.appendChild(col);
    }
    cont.appendChild(grid);
}

function semanaAnterior() { if (!ADMIN_WEEK_START_ISO) { ADMIN_WEEK_START_ISO = toISO(startMonday(new Date())); } cargarAgendaAdminSemana(addDaysISO(ADMIN_WEEK_START_ISO, -7)); }
function semanaSiguiente() { if (!ADMIN_WEEK_START_ISO) { ADMIN_WEEK_START_ISO = toISO(startMonday(new Date())); } cargarAgendaAdminSemana(addDaysISO(ADMIN_WEEK_START_ISO, 7)); }
function semanaActual() { cargarAgendaAdminSemana(toISO(startMonday(new Date()))); }

/* =========================================
   RESUMEN DISPONIBILIDAD (ADMIN)
   ========================================= */
async function cargarResumenDisponibilidadAdmin() {
    const cont = document.getElementById('adminResumenDisp');
    if (!cont) return;
    cont.innerHTML = 'Cargando...';
    try {
        const data = await api('obtenerResumenDisponibilidadSemanaActual', { email: SESION.email });
        renderResumenDisponibilidadAdmin(data || []);
    } catch (err) {
        cont.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

function cargarResumenPlaneaciones(force = false, silent = false) {
    if (!force && LAST_FETCH['cargarResumenPlaneaciones'] && (Date.now() - LAST_FETCH['cargarResumenPlaneaciones'] < DEFAULT_TTL)) return;
    LAST_FETCH['cargarResumenPlaneaciones'] = Date.now();

    const c1 = document.getElementById('resumenPlaneacionesActual');
    const c2 = document.getElementById('resumenPlaneacionesSiguiente');
    const btn = document.getElementById('btnRefreshSupervision');

    // MÁXIMA VELOCIDAD: Usar caché del localStorage si existe para mostrar de inmediato
    // Pero solo si NO es una recarga forzada
    if (!force) {
        const cached = localStorage.getItem('CACHE_PLANEACIONES_SUP_' + SESION.email);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (c1) renderResumenPlaneaciones(parsed.actual, c1);
                if (c2) renderResumenPlaneaciones(parsed.siguiente, c2, 'siguiente');
            } catch (e) { console.error("Error al leer caché planeaciones", e); }
        } else {
            if (c1) c1.innerHTML = '<p class="muted">Verificando planeaciones...</p>';
            if (c2) c2.innerHTML = '<p class="muted">Verificando planeaciones...</p>';
        }
    }

    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    const fetchProm = (client && typeof obtenerResumenPlaneacionesDosSemanasSupabase === 'function')
        ? obtenerResumenPlaneacionesDosSemanasSupabase()
        : api('getResumenPlaneacionesDosSemanas', { email: SESION.email });

    fetchProm
        .then(res => {
            if (res) {
                if (c1) renderResumenPlaneaciones(res.actual, c1);
                if (c2) renderResumenPlaneaciones(res.siguiente, c2, 'siguiente');
                localStorage.setItem('CACHE_PLANEACIONES_SUP_' + SESION.email, JSON.stringify(res));
            }
            if (btn) btn.textContent = '🔄 Actualizar';
        })
        .catch(err => {
            console.error("Error en cargarResumenPlaneaciones:", err);
            if (client) {
                api('getResumenPlaneacionesDosSemanas', { email: SESION.email })
                    .then(res => {
                        if (res) {
                            if (c1) renderResumenPlaneaciones(res.actual, c1);
                            if (c2) renderResumenPlaneaciones(res.siguiente, c2, 'siguiente');
                        }
                    }).catch(e => console.error(e));
            }
            if (btn) btn.textContent = '🔄 Actualizar';
        });
}

function renderResumenPlaneaciones(data, cont, prefijo) {
    if (!data || Object.keys(data).length === 0) {
        cont.innerHTML = '<p class="muted">No hay planeaciones registradas.</p>';
        return;
    }
    let html = '';
    const esSupervision = SESION.supervision || SESION.admin;
    const esSiguiente = (prefijo || '').includes('siguiente');

    if (!esSupervision) {
        html += `<ul style="list-style:none;margin:6px 0;padding-left:0;">`;
        Object.values(data).flat().forEach(p => {
            const nombreSesion = normalizarTexto(SESION.nombre || '');
            const nombrePlaneacion = normalizarTexto(p.ninera || '');
            if (!nombrePlaneacion || (nombreSesion && nombrePlaneacion !== nombreSesion)) return;

            const colorPlaneacion = p.tienePlaneacion ? '#16a34a' : '#dc2626';
            const textoPlaneacion = p.tienePlaneacion ? 'planeación completa' : 'planeación pendiente';

            const estadoRevision = normalizarTexto(p.estado_revision || p.estadoRevision || p.estado_revision_planeacion);
            let colorRevision = '#3b82f6';
            if (estadoRevision.includes('correccion')) colorRevision = '#facc15';
            else if (estadoRevision === 'revisada') colorRevision = '#22c55e';

            const key = `${prefijo || 'actual'}|${p.cliente}|${normalizarTexto(p.ninera || '')}`;
            let fechas = [];
            if (Array.isArray(p.fechas)) fechas = p.fechas;
            else if (Array.isArray(p.dias)) fechas = p.dias;
            else if (p.fecha) fechas = [p.fecha];

            RESUMEN_PLANEACIONES_SUP[key] = fechas;
            const handler = `abrirPlaneacionesCliente('${p.cliente}', ${esSiguiente}, '${p.tipo_servicio || ''}')`;

            html += `<li style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;" onclick="${handler}">
          <span style="width:10px;height:10px;border-radius:999px;background:${colorPlaneacion};display:inline-block;"></span>
          <span><b>${p.cliente}</b></span><span class="muted">(${textoPlaneacion})</span>
          ${p.tienePlaneacion ? `<span style="width:10px;height:10px;border-radius:999px;background:${colorRevision};display:inline-block;"></span>` : ``}
        </li>`;
        });
        html += `</ul>`;
        cont.innerHTML = html;
        return;
    }

    Object.keys(data).forEach((ciudad, indexCiudad) => {
        const safeCiudad = String(ciudad).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
        const ciudadId = `${prefijo || 'actual'}_ciudad_${safeCiudad}`;
        // REGLA DE MEMORIA: Verificar si ya estaba abierta
        const estabaAbierta = window.CIUDADES_ABIERTAS && window.CIUDADES_ABIERTAS.has(ciudadId);
        const display = estabaAbierta ? 'block' : 'none';
        const icono = estabaAbierta ? '➖' : '➕';

        html += `<div style="margin:12px 0;">
        <div style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:4px 0;" onclick="toggleCiudad('${ciudadId}')">
          <span id="${ciudadId}_icon" style="font-size:16px;user-select:none;color:var(--pink-main);font-weight:700;">${icono}</span>
          <h4 style="margin:0;font-size:15px;color:var(--pink-main);display:flex;align-items:center;gap:8px;">
            <span>📍 ${ciudad}</span>
            <span style="font-size:11px;font-weight:600;color:var(--text-muted);background:rgba(232,76,154,0.08);padding:1px 8px;border-radius:10px;">${data[ciudad].length} servicios</span>
          </h4>
        </div>
        <div id="${ciudadId}" style="display:${display}; margin-left:28px; margin-top:8px;">
          <ul style="list-style:none;margin:4px 0 12px;padding-left:0;">`;

        data[ciudad].forEach(p => {
            const colorPlaneacion = p.tienePlaneacion ? '#16a34a' : '#dc2626';
            const textoPlaneacion = p.tienePlaneacion ? 'planeación completa' : 'planeación pendiente';
            const estadoRevision = normalizarTexto(p.estado_revision || p.estadoRevision || p.estado_revision_planeacion);
            let colorRevision = '#3b82f6';
            if (estadoRevision.includes('correccion')) colorRevision = '#facc15';
            else if (estadoRevision === 'revisada') colorRevision = '#22c55e';

            const key = `${prefijo || 'actual'}|${p.cliente}|${p.ninera || ''}`;
            let fechas = [];
            if (Array.isArray(p.fechas)) fechas = p.fechas;
            else if (Array.isArray(p.dias)) fechas = p.dias;
            else if (p.fecha) fechas = [p.fecha];

            RESUMEN_PLANEACIONES_SUP[key] = fechas;
            const handler = `abrirPlaneacionesClienteDesdeResumen('${p.cliente}', '${prefijo || 'actual'}', '${p.tipo_servicio || ''}', '${p.ninera || ''}')`;

            html += `<li style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;font-size:14px;" onclick="${handler}">
          <span style="width:10px;height:10px;border-radius:999px;background:${colorPlaneacion};display:inline-block;flex-shrink:0;"></span>
          <span><b>${p.cliente}</b> – ${p.ninera}</span><span class="muted" style="font-size:13px;">(${textoPlaneacion})</span>
          ${p.tienePlaneacion ? `<span style="width:10px;height:10px;border-radius:999px;background:${colorRevision};display:inline-block;flex-shrink:0;" title="${estadoRevision}"></span>` : ``}
        </li>`;
        });
        html += `</ul></div></div>`;
    });
    cont.innerHTML = html;
}

function renderResumenDisponibilidadAdmin(lista) {
    const cont = document.getElementById('adminResumenDisp');
    if (!lista || !lista.length) { cont.innerHTML = '<p class="muted">No hay usuarias registradas.</p>'; return; }
    let html = '';
    lista.forEach((grupo, indexCiudad) => {
        const ciudadId = `ciudad_${indexCiudad}`;
        html += `<div style="margin:10px 0;"><div style="display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="toggleCiudad('${ciudadId}')">
          <span id="${ciudadId}_icon" style="font-size:18px;user-select:none;">➕</span><h4 style="margin:0;">${grupo.ciudad}</h4></div>
        <div id="${ciudadId}" style="display:none; margin-left:28px; margin-top:6px;"><ul style="list-style:none;margin:4px 0 12px;padding-left:0;">`;
        grupo.nineras.forEach(n => {
            const colorDisponibilidad = n.tiene ? '#16a34a' : '#dc2626';
            const textoDisponibilidad = n.tiene ? 'ya capturó horarios' : 'sin horarios esta semana';
            //Note: 'p' was used in HTML, but defined here? In HTML it was using 'p.estado_revision' inside the loop? 
            //Ah, lines 2795 used 'p', but loop variable is 'n'. That was a bug in original code? Or 'p' was global?
            //'p' is not defined in this scope. I will ignore 'p' logic or fix. The original code seemed copy-pasted.
            //I will omit the revision indicator if it relies on undefined 'p'.
            //Wait, line 2796 "p.estado_revision". 'p' comes from nowhere. 'n' is the nanny.
            //Assuming the loop variable is 'n', does 'n' have 'estado_revision'?
            //The loop in HTML (line 2780) iterates 'n'. Line 2796 uses 'p'. This was likely a BUG in the original HTML.
            //I will stick to 'n.tiene' and omit the broken revision part or check if 'n' has it.
            html += `<li style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="width:10px;height:10px;border-radius:999px;background:${colorDisponibilidad};display:inline-block;"></span>
          <span>${n.nombre}</span><span class="muted">(${textoDisponibilidad})</span></li>`;
        });
        html += `</ul></div></div>`;
    });
    cont.innerHTML = html;
}

// Memoria global para ciudades abiertas
window.CIUDADES_ABIERTAS = new Set();

function toggleCiudad(id) {
    const box = document.getElementById(id);
    const icon = document.getElementById(id + "_icon");
    if (box.style.display === "none") {
        box.style.display = "block";
        icon.textContent = "➖";
        window.CIUDADES_ABIERTAS.add(id);
    } else {
        box.style.display = "none";
        icon.textContent = "➕";
        window.CIUDADES_ABIERTAS.delete(id);
    }
}

/* =========================================
   PUNTAJE: VISTA NIÑERA
   ========================================= */
async function cargarPuntajeNinera(force = false) {
    const msg = document.getElementById('pt_msg');
    const nivel = document.getElementById('pt_nivel');
    const total = document.getElementById('pt_total');
    const serv = document.getElementById('pt_servicios');

    if (!force && CACHE_NINERA.puntaje) {
        const res = CACHE_NINERA.puntaje;
        if (nivel) nivel.textContent = res.nivel || 'Pink Nanny';
        if (total) total.textContent = res.total || 0;
        if (serv) serv.textContent = res.servicios || 0;
        if (msg) msg.textContent = '';
        return;
    }

    if (msg) msg.textContent = 'Calculando...';

    try {
        const res = await api('obtenerPuntajePorNombre', { nombre: SESION.nombre });

        if (res) CACHE_NINERA.puntaje = res;

        if (!res) {
            nivel.textContent = 'Pink Nanny';
            total.textContent = '0';
            serv.textContent = '0';
            msg.textContent = 'Sin puntos registrados todavía.';
            return;
        }
        nivel.textContent = res.nivel || 'Pink Nanny';
        total.textContent = res.total || 0;
        serv.textContent = res.servicios || 0;
        let texto = '';
        const pts = res.total || 0;
        if (pts < 100) texto = 'Te faltan ' + (100 - pts) + ' puntos para ser Yellow Nanny.';
        else if (pts < 200) texto = 'Te faltan ' + (200 - pts) + ' puntos para ser Blue Nanny.';
        else if (pts < 300) texto = 'Te faltan ' + (300 - pts) + ' puntos para ser Golden Nanny.';
        else texto = '¡Felicidades! Ya eres Golden Nanny.';
        msg.textContent = texto;

    } catch (err) {
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

/* =========================================
   PUNTAJE: VISTA ADMIN
   ========================================= */
async function adminVerPuntaje() {
    const nombre = document.getElementById('pt_admin_nombre').value.trim();
    const msg = document.getElementById('pt_admin_msg');
    const out = document.getElementById('pt_admin_resultado');
    if (!nombre) { msg.innerHTML = '<span class="err">Capture el nombre de la niñera.</span>'; return; }

    msg.textContent = 'Calculando...'; out.textContent = '';
    try {
        const res = await api('obtenerPuntajePorNombre', { nombre });
        msg.textContent = '';
        if (!res) {
            msg.innerHTML = '<span class="muted">Sin datos de puntos para esta niñera.</span>';
            out.textContent = '';
            return;
        }
        out.innerHTML = `<b>${res.nombre}</b><br>Puntos totales: <b>${res.total}</b> – Nivel: <b>${res.nivel}</b><br>Servicios eventuales: <b>${res.servicios}</b>`;
    } catch (err) {
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

async function adminAgregarPuntos() {
    const nombre = document.getElementById('pt_admin_nombre').value.trim();
    const tipo = document.getElementById('pt_admin_tipo').value;
    const msg = document.getElementById('pt_admin_msg');
    const out = document.getElementById('pt_admin_resultado');

    if (!nombre) { msg.innerHTML = '<span class="err">Capture el nombre de la niñera.</span>'; return; }
    if (!document.querySelector(`#lista_nineras option[value="${nombre}"]`)) {
        msg.innerHTML = '<span class="err">Seleccione una niñera válida de la lista.</span>';
        return;
    }
    if (!tipo) { msg.innerHTML = '<span class="err">Seleccione el tipo de acción de puntos.</span>'; return; }

    msg.textContent = 'Guardando...'; out.textContent = '';

    try {
        const res = await api('registrarPuntosManual', { nombre, tipo, email: SESION.email });
        msg.innerHTML = '<span class="ok">Puntos registrados.</span>';
        if (res) {
            out.innerHTML = `<b>${res.nombre}</b><br>Puntos totales: <b>${res.total}</b> – Nivel: <b>${res.nivel}</b><br>Servicios eventuales: <b>${res.servicios}</b>`;
        }
    } catch (err) {
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}

async function cargarListaNinerasAdmin() {
    const dataList = document.getElementById('lista_nineras');
    if (!dataList) return;
    dataList.innerHTML = '';

    try {
        let nombres = [];
        // 1. Cargar directamente desde Supabase
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client) {
            try {
                const { data, error } = await client
                    .from('nannys')
                    .select('nombre')
                    .order('nombre', { ascending: true });
                if (!error && Array.isArray(data) && data.length > 0) {
                    nombres = data.map(n => n.nombre).filter(Boolean);
                }
            } catch (supaErr) {
                console.warn('Supabase nannys list nota:', supaErr.message);
            }
        }

        // 2. Si no hubo datos de Supabase y existe token tradicional de Sheets, consultar Sheets
        if (nombres.length === 0 && SESION && SESION.token) {
            try {
                const lista = await api('obtenerListaNineras', { email: SESION.email });
                if (Array.isArray(lista)) nombres = lista;
            } catch (apiErr) {
                console.warn('Sheets obtenerListaNineras nota:', apiErr.message);
            }
        }

        nombres.forEach(nombre => {
            const opt = document.createElement('option');
            opt.value = nombre;
            dataList.appendChild(opt);
        });
    } catch (err) {
        console.warn('No se pudo poblar el datalist de niñeras:', err.message);
    }
}

/* =========================================
   COTIZADOR (ADMIN/VENTAS)
   ========================================= */
function initCotizador() {
    const container = document.getElementById('cot_dias_container');
    if (!container) return;

    const hoy = new Date();
    document.getElementById('prev_fecha').textContent = hoy.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

    // Solo inyectar si está vacío (evitando contar comentarios HTML)
    if (container.children.length === 0) {
        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        let html = '';
        diasSemana.forEach(dia => {
            html += `
            <div style="display: grid; grid-template-columns: 85px 1fr 1fr; gap: 8px; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.03); padding-bottom: 4px;">
                <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; cursor: pointer; color: #4b5563;">
                    <input type="checkbox" id="cot_chk_${dia}" onchange="updateCotizacion()" style="accent-color: var(--pink-main); width: 14px; height: 14px;">
                    ${dia}
                </label>
                <input type="time" id="cot_ini_${dia}" oninput="updateCotizacion()" style="font-size: 12px; padding: 4px 6px; background: white; border: 1px solid #e5e7eb; border-radius: 4px;">
                <input type="time" id="cot_fin_${dia}" oninput="updateCotizacion()" style="font-size: 12px; padding: 4px 6px; background: white; border: 1px solid #e5e7eb; border-radius: 4px;">
            </div>
            `;
        });
        container.innerHTML = html;
    }

    // Register drag events for all dynamic text overlays safely
    const draggables = document.querySelectorAll('.cot-draggable');
    draggables.forEach(elmnt => {
        if (!elmnt.dataset.dragAttached) {
            makeDraggable(elmnt);
            elmnt.dataset.dragAttached = "true";
        }
    });
}

function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Configurar listeners adecuados (passive:false en touch para evitar el scroll accidental)
    elmnt.addEventListener('mousedown', dragMouseDown);
    elmnt.addEventListener('touchstart', dragTouchStart, { passive: false });

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        const parent = elmnt.parentElement;
        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        elmnt.style.top = (newTop / parent.clientHeight * 100) + "%";
        elmnt.style.left = (newLeft / parent.clientWidth * 100) + "%";
    }

    function closeDragElement() {
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
    }

    function dragTouchStart(e) {
        if (!e.touches) return;
        let touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.addEventListener('touchend', closeDragTouch);
        document.addEventListener('touchmove', elementTouchDrag, { passive: false });
    }

    function elementTouchDrag(e) {
        if (!e.touches) return;
        e.preventDefault(); // IMPORTANTE: Previene el scroll del body mientras mueves el texto
        let touch = e.touches[0];
        pos1 = pos3 - touch.clientX;
        pos2 = pos4 - touch.clientY;
        pos3 = touch.clientX;
        pos4 = touch.clientY;

        const parent = elmnt.parentElement;
        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        elmnt.style.top = (newTop / parent.clientHeight * 100) + "%";
        elmnt.style.left = (newLeft / parent.clientWidth * 100) + "%";
    }

    function closeDragTouch() {
        document.removeEventListener('touchend', closeDragTouch);
        document.removeEventListener('touchmove', elementTouchDrag);
    }
}

function updateCotizacion() {
    document.getElementById('prev_nombre').textContent = document.getElementById('cot_nombre').value;
    document.getElementById('prev_telefono').textContent = document.getElementById('cot_telefono').value;
    document.getElementById('prev_edad').textContent = document.getElementById('cot_edad').value;
    document.getElementById('prev_zona').textContent = document.getElementById('cot_zona').value;
    document.getElementById('prev_precio').textContent = document.getElementById('cot_precio').value;

    const notas = document.getElementById('cot_notas').value;
    document.getElementById('prev_nota').innerHTML = notas.replace(/\n/g, '<br>');

    generarResumenHorariosCotizador();
}

function generarResumenHorariosCotizador() {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    let grupos = {};

    dias.forEach(dia => {
        const chk = document.getElementById(`cot_chk_${dia}`);
        if (chk && chk.checked) {
            const ini = document.getElementById(`cot_ini_${dia}`).value;
            const fin = document.getElementById(`cot_fin_${dia}`).value;
            const horarioStr = (ini || '??') + ' a ' + (fin || '??') + ' hrs';

            if (!grupos[horarioStr]) grupos[horarioStr] = [];
            grupos[horarioStr].push(dia);
        }
    });

    let resumen = [];
    Object.keys(grupos).forEach(horario => {
        const d = grupos[horario];
        let dStr = '';
        if (d.length === 1) dStr = d[0];
        else if (d.length === 2) dStr = d[0] + ' y ' + d[1];
        else if (d.length === 5 && d[0] === 'Lunes' && d[4] === 'Viernes') dStr = 'Lunes a Viernes';
        else if (d.length === 6 && d[0] === 'Lunes' && d[5] === 'Sábado') dStr = 'Lunes a Sábado';
        else if (d.length === 7) dStr = 'Toda la semana';
        else dStr = d.join(', ');

        resumen.push(`<b>${dStr}</b>: ${horario}`);
    });
    // Agregamos el texto manual al final (o si es el único)
    const textoManual = document.getElementById('cot_horario_manual') ? document.getElementById('cot_horario_manual').value.trim() : '';
    if (textoManual) {
        resumen.push(`${textoManual}`);
    }

    document.getElementById('prev_horarios').innerHTML = resumen.join('<br>') || '<em style="opacity:0.6;">(Sin horarios)</em>';
}

function aplicarMismoHorarioCotizador() {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    let primerDiaBase = null;
    for (let dia of dias) {
        if (document.getElementById(`cot_chk_${dia}`).checked) {
            primerDiaBase = dia;
            break;
        }
    }

    if (!primerDiaBase) {
        alert("Por favor selecciona primero un día y su horario para copiarlo a los demás días seleccionados (o a todos si no hay más).");
        return;
    }

    const baseIni = document.getElementById(`cot_ini_${primerDiaBase}`).value;
    const baseFin = document.getElementById(`cot_fin_${primerDiaBase}`).value;

    let copiados = 0;
    dias.forEach(dia => {
        const chk = document.getElementById(`cot_chk_${dia}`);
        if (chk.checked && dia !== primerDiaBase) {
            document.getElementById(`cot_ini_${dia}`).value = baseIni;
            document.getElementById(`cot_fin_${dia}`).value = baseFin;
            copiados++;
        }
    });

    if (copiados === 0) {
        alert("Selecciona la casilla (check) de otros días para que se les aplique este mismo horario.");
    }

    updateCotizacion();
}

function descargarCotizacion() {
    const btn = document.querySelector('.cotizador-preview-col .btn-pink');
    const originalText = btn.innerHTML;
    btn.innerHTML = '⏳ Generando imagen...';
    btn.disabled = true;

    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'js/html2canvas.min.js';
        script.onload = () => captureCotizacionElement(btn, originalText);
        script.onerror = () => {
            alert('Error al cargar la librería de captura. Intenta de nuevo.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        document.head.appendChild(script);
    } else {
        captureCotizacionElement(btn, originalText);
    }
}

function captureCotizacionElement(btn, originalText) {
    const element = document.getElementById('cotizador-canvas');
    // Scroll element into full view or temporal fixed position can sometimes help with canvas capture size
    html2canvas(element, { backgroundColor: null, scale: 2, useCORS: true, logging: false }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Cotizacion-${document.getElementById('cot_nombre').value || 'NannysPeques'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        btn.innerHTML = originalText;
        btn.disabled = false;
    }).catch(err => {
        alert('Error al generar la imagen: ' + err.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

/* =========================================
   CONTROLES EXTRAS (COTIZADOR)
   ========================================= */
function updateCotizacionCiudad() {
    const selector = document.getElementById('cot_ciudad_selector');
    const zonaInput = document.getElementById('cot_zona');
    if (selector && zonaInput && selector.value) {
        zonaInput.value = selector.value;
        updateCotizacion();
    }
}

function limpiarCotizacion() {
    const inputsText = ['cot_nombre', 'cot_telefono', 'cot_edad', 'cot_zona', 'cot_precio', 'cot_notas', 'cot_horario_manual'];
    inputsText.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    dias.forEach(dia => {
        const chk = document.getElementById(`cot_chk_${dia}`);
        const ini = document.getElementById(`cot_ini_${dia}`);
        const fin = document.getElementById(`cot_fin_${dia}`);
        if (chk) chk.checked = false;
        if (ini) ini.value = '';
        if (fin) fin.value = '';
    });

    // Mantiene las configuraciones visuales (top, left arrastrados)
    updateCotizacion();
}

// Init hook
document.addEventListener('DOMContentLoaded', () => setTimeout(initCotizador, 1000));

/* =========================================
   RUTEO /VISTAS
   ========================================= */
function ocultarTodo() {
    const ids = ['svcCard', 'puntosNineraCard', 'planeacionesNineraCard', 'planeacionesNineraCardSiguiente', 'panel', 'tablaActualCard', 'tablaSiguienteCard', 'resumenCard', 'resumenCard2', 'adminCard', 'adminAgendaCard', 'adminPuntosCard', 'adminResumenDispCard', 'adminCotizadorCard', 'adminControlServiciosView'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    document.body.classList.remove('en-control-servicios');
    document.documentElement.classList.remove('en-control-servicios');
}

function mostrarVistaAdmin() {
    ocultarTodo();

    document.body.classList.add('admin', 'en-control-servicios');
    document.documentElement.classList.add('en-control-servicios');

    // Ocultamos el header-admin anterior para dejar la pantalla 100% limpia y amplia
    const hAdmin = document.getElementById('header-admin');
    if (hAdmin) hAdmin.style.display = 'none';

    // Ocultamos todos los navs inferiores en vista de administración
    const navDefault = document.querySelector('.bottom-nav:not(#nav-supervision):not(#nav-ventas)');
    const navSuper = document.getElementById('nav-supervision');
    const navVentas = document.getElementById('nav-ventas');
    if (navDefault) navDefault.style.display = 'none';
    if (navSuper) navSuper.style.display = 'none';
    if (navVentas) navVentas.style.display = 'none';

    // 🚀 Vista principal de administración: Control de Servicios
    const csView = document.getElementById('adminControlServiciosView');
    if (csView) {
        csView.style.display = 'flex';
    }

    if (typeof initControlServiciosUI === 'function') {
        initControlServiciosUI();
    }

    const monday = startMonday(new Date());
    ADMIN_WEEK_START_ISO = toISO(monday);

    cargarAgendaAdminSemana(ADMIN_WEEK_START_ISO);
    cargarResumenDisponibilidadAdmin();
    cargarListaNinerasAdmin();
}

/**
 * Abre la sección del Cotizador desde el Control de Servicios (sin modificar nada de su lógica)
 */
function abrirCotizadorDesdeControl() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.classList.remove('en-control-servicios');
    document.documentElement.classList.remove('en-control-servicios');
    const csView = document.getElementById('adminControlServiciosView');
    if (csView) csView.style.display = 'none';

    const cotCard = document.getElementById('adminCotizadorCard');
    if (cotCard) {
        cotCard.style.display = 'block';
    }

    if (typeof initCotizador === 'function') {
        initCotizador();
    }
}
window.abrirCotizadorDesdeControl = abrirCotizadorDesdeControl;

/**
 * Cierra la sección del Cotizador y regresa limpiamente al Control de Servicios
 */
function cerrarCotizadorHaciaControl() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const cotCard = document.getElementById('adminCotizadorCard');
    if (cotCard) cotCard.style.display = 'none';

    document.body.classList.add('en-control-servicios');
    document.documentElement.classList.add('en-control-servicios');
    const csView = document.getElementById('adminControlServiciosView');
    if (csView) csView.style.display = 'flex';
}
window.cerrarCotizadorHaciaControl = cerrarCotizadorHaciaControl;

function irVistaVentas(tab) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const ids = ['adminCotizadorCard', 'adminAgendaCard', 'adminResumenDispCard', 'adminCard', 'adminPuntosCard', 'adminControlServiciosView'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

    document.querySelectorAll('#nav-ventas button').forEach(b => b.classList.remove('activo'));
    const btn = document.getElementById('vnav-' + tab);
    if (btn) btn.classList.add('activo');

    if (tab === 'cotizador') {
        abrirCotizadorDesdeControl();
    } else if (tab === 'servicios') {
        document.body.classList.add('en-control-servicios');
        document.documentElement.classList.add('en-control-servicios');
        const el = document.getElementById('adminControlServiciosView') || document.getElementById('adminAgendaCard');
        if (el) el.style.display = 'flex';
        if (typeof sincronizarAsistenciaMatrizEnVivo === 'function') {
            sincronizarAsistenciaMatrizEnVivo(true);
        }
    } else if (tab === 'disponibilidad') {
        document.body.classList.remove('en-control-servicios');
        document.documentElement.classList.remove('en-control-servicios');
        const el1 = document.getElementById('adminResumenDispCard');
        const el2 = document.getElementById('adminCard');
        if (el1) el1.style.display = 'block';
        if (el2) el2.style.display = 'block';
    } else if (tab === 'nannystar') {
        document.body.classList.remove('en-control-servicios');
        document.documentElement.classList.remove('en-control-servicios');
        const el = document.getElementById('adminPuntosCard');
        if (el) el.style.display = 'block';
    }
}

function irVistaRH(tab) {
    document.body.classList.remove('en-control-servicios');
    document.documentElement.classList.remove('en-control-servicios');
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelectorAll('#nav-rh button').forEach(b => {
        b.classList.remove('activo', 'active');
    });
    const btn = document.getElementById('rnav-' + tab);
    if (btn) btn.classList.add('activo', 'active');

    const subviewCalendario = document.getElementById('rh-subvista-calendario');
    const subviewCapacitaciones = document.getElementById('rh-subvista-capacitaciones');

    if (tab === 'calendario') {
        if (subviewCalendario) subviewCalendario.style.display = 'block';
        if (subviewCapacitaciones) subviewCapacitaciones.style.display = 'none';
        if (window.RHPanel) {
            window.RHPanel.renderCalendar();
        }
    } else if (tab === 'capacitaciones') {
        if (subviewCalendario) subviewCalendario.style.display = 'none';
        if (subviewCapacitaciones) subviewCapacitaciones.style.display = 'block';
        if (window.RHPanel) {
            window.RHPanel.renderCapacitacionesDB();
        }
    }
}
window.irVistaRH = irVistaRH;


async function mostrarVistaNinera() {
    ocultarTodo();
    irVista('servicios');
    document.getElementById('svcCard').style.display = 'block';
    document.getElementById('planeacionesNineraCard').style.display = 'block';
    document.getElementById('planeacionesNineraCardSiguiente').style.display = 'block';
    document.getElementById('puntosNineraCard').style.display = 'block';

    document.getElementById('fecha').valueAsDate = new Date();

    // ⚡ Asegurar suscripciones en tiempo real activas para cambios en la matriz y planeaciones
    if (typeof suscribirRealtimePortalServicios === 'function') suscribirRealtimePortalServicios();
    if (typeof suscribirRealtimePlaneaciones === 'function') suscribirRealtimePlaneaciones();

    // 🔥 CARGA PARALELA: Todo debe terminar antes de ocultar el preloader
    await Promise.all([
        cargarServicios(),
        cargarServiciosSiguienteSemana(),
        cargarResumenPlaneacionesNinera(),
        cargarPuntajeNinera(),
        cargarPerfil(), // 👤 Cargar Perfil
        cargar()        // 📅 Cargar Disponibilidad
    ]);

    if (typeof actualizarVisibilidadPestanasNinera === 'function') {
        actualizarVisibilidadPestanasNinera();
    }
}

function irVista(nombre, skipLogic = false) {
    // 🏠 Siempre subir al inicio al cambiar de vista y asegurar que el scroll vertical esté activo
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.classList.remove('en-control-servicios');
    document.documentElement.classList.remove('en-control-servicios');

    document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
    if (nombre !== 'estimulacion' && typeof window.resetRadarVisual === 'function') {
        window.resetRadarVisual();
    }

    let target = nombre;
    //Redirecciones por rol
    if (SESION.cliente) {
        if (nombre === 'inicio') target = 'cliente-inicio';
        if (nombre === 'servicios' || nombre === 'serv') target = 'cliente-servicios';
        if (nombre === 'perfil') target = 'cliente-perfil';
        if (nombre === 'per') target = 'perfil';
        if (nombre === 'disponibilidad' || nombre === 'actividades' || nombre === 'actividades-cliente') {
            if (window._clienteTieneEducativaValido === false) {
                target = 'cliente-inicio';
                nombre = 'inicio';
            } else {
                target = 'actividades-cliente';
            }
        }
        if (nombre === 'estimulacion') {
            if (window._clienteTieneNeuronannyValido === false) {
                target = 'cliente-inicio';
                nombre = 'inicio';
            }
        }
    } else {
        if (nombre === 'inicio') target = 'nanny-inicio';
        if (nombre === 'servicios' || nombre === 'serv') target = 'cliente-servicios';
        if (nombre === 'perfil') target = 'nanny-perfil';
        if (nombre === 'per') target = 'perfil';
        if (nombre === 'actividades' || nombre === 'planeaciones' || nombre === 'nanny-actividades') {
            if (window._nannyTieneEducativaValido === false) {
                target = 'nanny-inicio';
                nombre = 'inicio';
            } else {
                target = 'actividades';
            }
        }
        if (nombre === 'estimulacion') {
            if (window._nannyTieneNeuronannyValido === false) {
                target = 'nanny-inicio';
                nombre = 'inicio';
            }
        }
    }

    if (target === 'rh' || SESION.rh) {
        ocultarTodo();
    }

    if (target === 'cliente-servicios') {
        document.body.classList.add('en-servicios');
        document.body.style.background = '#E0F7FA';
        document.body.style.backgroundColor = '#E0F7FA';
        document.documentElement.style.background = '#E0F7FA';
        document.documentElement.style.backgroundColor = '#E0F7FA';

        if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') {
            ClienteServicios.cargar(false);
            if (typeof ClienteServicios.restaurarPosicionSemana === 'function') {
                setTimeout(() => ClienteServicios.restaurarPosicionSemana(), 50);
            }
        }
    } else if (target === 'nanny-inicio' || target === 'cliente-inicio' || target === 'inicio') {
        document.body.classList.remove('en-servicios', 'en-estimulacion');
        document.body.style.background = '#FFF9FB';
        document.body.style.backgroundColor = '#FFF9FB';
        document.documentElement.style.background = '#FFF9FB';
        document.documentElement.style.backgroundColor = '#FFF9FB';
        if (target === 'nanny-inicio') {
            document.body.classList.add('en-nanny-inicio');
        } else {
            document.body.classList.add('en-cliente-inicio');
        }
    } else if (target !== 'estimulacion') {
        document.body.classList.remove('en-servicios', 'en-nanny-inicio', 'en-cliente-inicio');
        document.body.style.background = '';
        document.body.style.backgroundColor = '';
        document.documentElement.style.background = '';
        document.documentElement.style.backgroundColor = '';
    }

    const vista = document.getElementById('vista-' + target);
    if (vista) vista.classList.add('activa');

    // Inicializar módulos dinámicos
    if (target === 'comunidad') {
        if (window.ComunidadDashboard) {
            ComunidadDashboard.init();
        }
    }

    if (target === 'com') {
        if (window.Comunidad) {
            Comunidad.init();
        }
    }

    if (target === 'rh') {
        if (window.RHPanel) {
            window.RHPanel.init();
        }
    }

    if (target === 'estimulacion') {
        const esCliente = !!(SESION && SESION.cliente);
        const esAdminOSup = !!(SESION && (SESION.admin || SESION.supervision || SESION.rh));
        if (esCliente || esAdminOSup) {
            if (typeof window.verificarBloqueoEstimulacionNinera === 'function') {
                window.verificarBloqueoEstimulacionNinera(true);
            }
        } else if (typeof window.verificarBloqueoEstimulacionNinera === 'function') {
            window.verificarBloqueoEstimulacionNinera(window._nannyTieneNeuronannyValido);
        }

        if (typeof window.initEstimulacion === 'function') {
            window.initEstimulacion(true).then(() => {
                if (typeof window.verificarBloqueoEstimulacionNinera === 'function') {
                    window.verificarBloqueoEstimulacionNinera();
                }
            }).catch(() => { });
        }
        if (typeof window.animarRadarChart === 'function') {
            window.animarRadarChart();
        }
    }

    if (target === 'convenios' && window.Convenios) {
        Convenios.init();
    }

    if (target === 'cliente-perfil' && window.ClientePerfil) {
        ClientePerfil.init();
    }

    if (target === 'nanny-perfil') {
        if (window.NannyPerfil) {
            NannyPerfil.init();
        }
    }

    if (target === 'nanny-inicio') {
        if (window.NannyInicio) {
            NannyInicio.mostrarVistaInicio();
        }
    } else {
        if (window.NannyInicio) {
            if (typeof window.NannyInicio.detenerCarrusel === 'function') {
                NannyInicio.detenerCarrusel();
            }
            if (typeof window.NannyInicio.detenerCarruselConvenios === 'function') {
                NannyInicio.detenerCarruselConvenios();
            }
        }
    }

    const navSuper = document.getElementById('nav-supervision');
    const navDefault = document.querySelector('.bottom-nav:not(#nav-supervision):not(#nav-ventas):not(#nav-rh)');
    const navVentas = document.getElementById('nav-ventas');
    const navRH = document.getElementById('nav-rh');

    if (SESION.rh) {
        if (navSuper) navSuper.style.display = 'none';
        if (navDefault) navDefault.style.display = 'none';
        if (navVentas) navVentas.style.display = 'none';
        if (navRH) navRH.style.display = 'flex';
        irVistaRH('calendario'); // Inicializar subvista por defecto en Calendario
    } else if (target === 'supervision' && SESION.supervision) {
        if (navSuper) navSuper.style.display = 'flex';
        if (navDefault) navDefault.style.display = 'none';
        if (navVentas) navVentas.style.display = 'none';
        if (navRH) navRH.style.display = 'none';
    } else {
        if (navSuper) navSuper.style.display = 'none';
        if (navDefault) navDefault.style.display = 'flex';
        if (navVentas) navVentas.style.display = 'none';
        if (navRH) navRH.style.display = 'none';
    }

    document.querySelectorAll('.bottom-nav button').forEach(b => {
        b.classList.remove('activo');
        b.classList.remove('active');
    });
    const btn = [...document.querySelectorAll('.bottom-nav button')].find(b => {
        const onClick = b.getAttribute('onclick') || '';
        return onClick.includes("'" + nombre + "'") || onClick.includes('"' + nombre + '"');
    });
    if (btn) {
        btn.classList.add('activo');
        btn.classList.add('active');
    }
    if (nombre === 'articulo' || target === 'articulo') {
        const btnComEl = document.getElementById('nav-comunidad');
        if (btnComEl) {
            btnComEl.classList.add('activo');
            btnComEl.classList.add('active');
        }
    }

    if (window.NannyInicio && !SESION.cliente && !SESION.admin && !SESION.supervision && !SESION.rh) {
        NannyInicio.actualizarBotonActivo(target);
    }

    //Lógica adicional por vista y rol
    const btnAct = document.getElementById('nav-disponibilidad');
    const btnCom = document.getElementById('nav-comunidad');
    const btnComOld = document.getElementById('nav-com');
    const lblAct = document.getElementById('label-disponibilidad');

    if (btnAct) btnAct.style.display = 'flex';
    if (btnCom) btnCom.style.display = 'flex';
    if (btnComOld) btnComOld.style.display = 'none';

    if (target === 'perfil' || target === 'cliente-perfil' || target === 'nanny-perfil') cargarPerfil();

    // Comprobación de cuenta activa para clientes y niñeras
    if (typeof verificarStatusCuentaUsuario === 'function') {
        verificarStatusCuentaUsuario();
    }

    if (SESION.cliente) {
        if (lblAct) lblAct.textContent = 'Actividades';
        if (skipLogic) return;

        // Validar perfil completo antes de permitir navegación
        if (CACHE_CLIENTE.profile) {
            const faltanDatos = verificarDatosFaltantesCliente(CACHE_CLIENTE.profile);
            if (faltanDatos) {
                // Limpiar todas las vistas activas primero
                document.querySelectorAll('.vista').forEach(v => v.classList.remove('activa'));
                // Forzar vista de cliente con onboarding
                const vistaCliente = document.getElementById('vista-cliente');
                if (vistaCliente) vistaCliente.classList.add('activa');
                mostrarVistaCliente();
                return;
            }
        }

        if (target === 'cliente-servicios' || target === 'servicios' || target === 'serv') {
            if (window.ClienteServicios && typeof ClienteServicios.cargar === 'function') {
                ClienteServicios.cargar(false);
                if (typeof ClienteServicios.restaurarPosicionSemana === 'function') {
                    setTimeout(() => ClienteServicios.restaurarPosicionSemana(), 50);
                }
            }
        }
        if (target === 'cliente-inicio' || target === 'inicio') {
            if (window.ClienteInicio && typeof ClienteInicio.cargarServicios === 'function') {
                ClienteInicio.cargarServicios(false);
            }
        }
        if (target === 'cliente') {
            // No hacemos await aquí para no bloquear irVista, pero la función es async interna
            mostrarVistaCliente();
        }
        if (target === 'actividades-cliente' || target === 'actividades') {
            cargarActividadesCliente();
        }
        return;
    }

    //Staff
    if (lblAct) lblAct.textContent = 'Disponibilidad';

    // Si es niñera (y no admin/supervision/cliente), obligar a completar perfil
    if (!SESION.cliente && !SESION.admin && !SESION.supervision) {
        const now = Date.now();
        if (!LAST_FETCH['validarPerfil'] || (now - LAST_FETCH['validarPerfil'] > 300000)) { // 5 min
            LAST_FETCH['validarPerfil'] = now;
            cargarPerfil().then(p => {
                if (p) verificarDatosFaltantesNinera(p);
            }).catch(err => console.warn("Nota validando perfil en irVista:", err?.message || err));
        }
    }

    if (nombre === 'disponibilidad') {
        ocultarTodo();
        document.getElementById('panel').style.display = 'block';
        document.getElementById('tablaActualCard').style.display = 'block';
        document.getElementById('resumenCard').style.display = 'block';
        cargar(false); // Usar caché si está disponible
    }
    if (nombre === 'servicios' || nombre === 'serv' || target === 'servicios') {
        ocultarTodo();
        const svcCard = document.getElementById('svcCard');
        if (svcCard) svcCard.style.display = 'block';
        const planCard = document.getElementById('planeacionesNineraCard');
        if (planCard) planCard.style.display = 'block';
        const planSigCard = document.getElementById('planeacionesNineraCardSiguiente');
        if (planSigCard) planSigCard.style.display = 'block';
        const puntosCard = document.getElementById('puntosNineraCard');
        if (puntosCard) puntosCard.style.display = 'block';
        cargarServicios(false); // Usar caché si está disponible
    }
    if (nombre === 'actividades' || target === 'actividades') {
        ocultarTodo();
        const planCard = document.getElementById('planeacionesNineraCard');
        if (planCard) planCard.style.display = 'block';
        const planSigCard = document.getElementById('planeacionesNineraCardSiguiente');
        if (planSigCard) planSigCard.style.display = 'block';
        if (typeof cargarResumenPlaneacionesNinera === 'function') {
            cargarResumenPlaneacionesNinera(false);
        }
    }
    if (nombre === 'supervision') {
        ocultarTodo();
        if (typeof suscribirRealtimePortalServicios === 'function') {
            suscribirRealtimePortalServicios();
        }
        cargarResumenPlaneaciones();
        cargarResumenBitacoras();
    }
}

//La implementación robusta de cargarPerfil está al final del archivo.




/**
 * Resalta un elemento con error de forma temporal (vuelve a la normalidad tras unos segundos).
 */
function resaltarErrorTemporal(el) {
    if (!el) return;
    el.classList.add('input-error', 'input-error-shake');
    setTimeout(() => {
        el.classList.remove('input-error', 'input-error-shake');
    }, 4000); // 4 segundos de resaltado
}

/**
 * Valida si un string es un link de Google Maps válido.
 */
function esGoogleMapsLink(url) {
    if (!url) return false;
    const s = String(url).trim().toLowerCase();
    return s.includes('google.com/maps') || s.includes('maps.app.goo.gl') || s.includes('goo.gl/maps') || s.startsWith('https://maps.google.com');
}

/**
 * Verifica si a la niñera le faltan datos críticos.
 * Si faltan, abre el modal obligatorio y bloquea el uso de la app.
 * @param {Object} p - El perfil
 * @param {Boolean} mostrarErroresVisuales - Si se deben aplicar clases de error (bordes rojos)
 */
function verificarDatosFaltantesNinera(p, mostrarErroresVisuales = false) {
    if (!p || SESION.cliente || SESION.admin || SESION.supervision) return;

    // Solo limpiar si vamos a mostrar errores nuevos
    if (mostrarErroresVisuales) {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error', 'input-error-shake'));
    }

    const faltantes = [];
    let primerError = null;

    const esTelValido = (v) => String(v || '').replace(/\D/g, '').length === 10;

    if (!esTelValido(p.telefono)) {
        faltantes.push('Teléfono personal (10 dígitos)');
        const el = document.getElementById('reg_staff_telefono');
        if (el && mostrarErroresVisuales) {
            resaltarErrorTemporal(el);
            if (!primerError) primerError = el;
        }
    }
    if (!p.direccion || String(p.direccion).trim().length < 8) {
        faltantes.push('Dirección completa');
        const el = document.getElementById('reg_staff_direccion');
        if (el && mostrarErroresVisuales) {
            resaltarErrorTemporal(el);
            if (!primerError) primerError = el;
        }
    }
    if (!p.emergencia || !esTelValido(p.emergencia)) {
        faltantes.push('Teléfono de emergencia (10 dígitos)');
        const el = document.getElementById('reg_staff_emergencia');
        if (el && mostrarErroresVisuales) {
            resaltarErrorTemporal(el);
            if (!primerError) primerError = el;
        }
    }
    if (!p.ubicacion || !esGoogleMapsLink(p.ubicacion)) {
        faltantes.push('Link de Ubicación (Google Maps)');
        const el = document.getElementById('reg_staff_ubicacion');
        if (el && mostrarErroresVisuales) {
            resaltarErrorTemporal(el);
            if (!primerError) primerError = el;
        }
    }

    const modal = document.getElementById('modalRegistroStaff');
    if (faltantes.length > 0) {
        if (modal) modal.style.display = 'flex';
        //Pre-llenar si hay algo
        if (document.getElementById('reg_staff_telefono')) document.getElementById('reg_staff_telefono').value = p.telefono || '';
        if (document.getElementById('reg_staff_direccion')) document.getElementById('reg_staff_direccion').value = p.direccion || '';
        if (document.getElementById('reg_staff_emergencia')) document.getElementById('reg_staff_emergencia').value = p.emergencia || '';
        if (document.getElementById('reg_staff_ubicacion')) document.getElementById('reg_staff_ubicacion').value = p.ubicacion || '';

        // Añadir efecto de shake y scroll al primer error dentro del modal
        if (primerError) {
            primerError.classList.add('input-error-shake');
            setTimeout(() => {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (primerError.focus) primerError.focus();
            }, 300);
        }
    } else {
        if (modal) modal.style.display = 'none';
    }
}

async function guardarDatosStaff() {
    const tel = document.getElementById('reg_staff_telefono').value.trim();
    const dir = document.getElementById('reg_staff_direccion').value.trim();
    const eme = document.getElementById('reg_staff_emergencia').value.trim();
    const ubi = document.getElementById('reg_staff_ubicacion').value.trim();
    const msg = document.getElementById('msgRegistroStaff');

    const p = {
        telefono: tel,
        direccion: dir,
        emergencia: eme,
        ubicacion: ubi
    };

    // Usar la función de verificación centralizada con el flag de mostrar errores en TRUE
    verificarDatosFaltantesNinera(p, true);

    if (tel.length < 8 || dir.length < 8 || eme.length < 8 || !esGoogleMapsLink(ubi)) {
        msg.innerHTML = '<span class="err">Por favor, completa todos los campos correctamente.</span>';
        return;
    }

    msg.textContent = 'Guardando en base de datos...';

    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

        if (client) {
            console.log("💾 [Perfil Nanny] Guardando datos directamente en Supabase para:", SESION.email);
            const { data, error } = await client
                .from('nannys')
                .upsert({
                    email: SESION.email,
                    telefono: tel,
                    direccion: dir,
                    emergencia: eme,
                    ubicacion: ubi,
                    actualizado_en: new Date().toISOString()
                }, { onConflict: 'email' })
                .select();

            if (error) {
                console.error("❌ Error guardando en Supabase:", error);
                throw new Error(error.message || 'Error guardando en Supabase.');
            }
            console.log("✅ [Perfil Nanny] Guardado exitosamente en tabla nannys de Supabase:", data);
        } else {
            // Fallback en caso de no tener cliente de Supabase
            const res = await api('updatePerfilNinera', {
                email: SESION.email,
                telefono: tel,
                direccion: dir,
                emergencia: eme,
                ubicacion: ubi
            });
            if (!res.ok) throw new Error(res.error || 'Error al guardar');
        }

        // Actualizar caché de perfil local de inmediato
        if (CACHE_CLIENTE.profile) {
            CACHE_CLIENTE.profile.telefono = tel;
            CACHE_CLIENTE.profile.direccion = dir;
            CACHE_CLIENTE.profile.emergencia = eme;
            CACHE_CLIENTE.profile.ubicacion = ubi;
        }

        msg.innerHTML = '<span class="ok">¡Información guardada exitosamente!</span>';
        setTimeout(() => {
            const modal = document.getElementById('modalRegistroStaff');
            if (modal) modal.style.display = 'none';
            cargarPerfil(); // Recargar para ver los cambios
        }, 1200);

    } catch (err) {
        msg.innerHTML = `<span class="err">${err.message}</span>`;
    }
}

window.guardarDatosStaff = guardarDatosStaff;


/* =========================================
   PLANEACIONES (NEURONANNY)
   ========================================= */
let SERVICIO_PLANEACION = null;
let PLANEACION_EXISTENTE = null;

function formatearFechaPlaneacion(fechaStr) {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return '';
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaNombre = dias[d.getDay()];
    const diaNum = d.getDate();
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    return `${diaNombre} ${diaNum} - ${horas}:${minutos} hrs`;
}

function abrirPlaneacionNeuronanny(servicio, planeacion) {
    SERVICIO_PLANEACION = servicio;
    PLANEACION_EXISTENTE = planeacion || null;

    const contFechas = document.getElementById('pl_fechas_revision');
    const lblRevision = document.getElementById('pl_fecha_revision');
    const lblCorreccion = document.getElementById('pl_fecha_correccion');

    if (contFechas && lblRevision && lblCorreccion) {
        let mostrar = false;
        const fechaRevision = String(planeacion?.fecha_revision || '').trim();
        const fechaCorreccion = String(planeacion?.fecha_correccion || '').trim();

        if (fechaRevision) {
            const f = formatearFechaPlaneacion(fechaRevision);
            if (f) { lblRevision.textContent = `🆕 Creación: ${f} `; mostrar = true; }
        } else lblRevision.textContent = '';

        if (fechaCorreccion) {
            const f = formatearFechaPlaneacion(fechaCorreccion);
            if (f) { lblCorreccion.textContent = `✏ Corrección enviada: ${f} `; mostrar = true; }
        } else lblCorreccion.textContent = '';

        contFechas.style.display = mostrar ? 'flex' : 'none';
    }

    const estadoRevisionActual = normalizarTexto(planeacion?.estado_revision || '');
    const titulo = document.getElementById('pl_titulo');
    const infoCliente = document.getElementById('pl_info_cliente');
    const infoNinera = document.getElementById('pl_info_ninera');

    if (titulo) {
        const tipo = normalizarTexto(servicio?.tipo_servicio || '');
        let tituloBase = 'Planeación';
        if (tipo === 'neuronanny') tituloBase = 'Planeación Neuronanny';
        else if (tipo === 'nanny educativa') tituloBase = 'Planeación Nanny Educativa';
        else if (tipo === 'miss nanny') tituloBase = 'Planeación Miss Nanny';
        titulo.textContent = MODO_SOLO_LECTURA ? `${tituloBase} (solo lectura)` : tituloBase;
    }
    if (infoCliente) infoCliente.textContent = `👶 Cliente: ${servicio.cliente || '—'} `;
    if (infoNinera) {
        let nombreNinera = '—';
        if (planeacion?.nombre_ninera) nombreNinera = planeacion.nombre_ninera;
        else if (!SESION.supervision && !SESION.admin && SESION.nombre) nombreNinera = SESION.nombre;
        else if (servicio?.nombre_ninera) nombreNinera = servicio.nombre_ninera;
        infoNinera.textContent = `🧸 Niñera: ${nombreNinera} `;
    }

    const area = document.getElementById('pl_area');
    const objetivo = document.getElementById('pl_objetivo');
    const descripcion = document.getElementById('pl_descripcion');
    const materiales = document.getElementById('pl_materiales');
    const imagen = document.getElementById('pl_imagen');
    const cont = document.getElementById('obsSupervisionContainer');
    const obsSup = document.getElementById('obsSupervision');
    const obsNin = document.getElementById('obsSupervisionNinera');

    area.value = ''; objetivo.value = ''; descripcion.value = ''; materiales.value = ''; imagen.value = '';
    // Resetear input de archivo y preview
    const fileInput = document.getElementById('pl_imagen_file');
    const previewContainer = document.getElementById('pl_imagen_preview_container');
    const previewImg = document.getElementById('pl_imagen_preview');
    if (fileInput) fileInput.value = '';
    if (previewContainer) previewContainer.style.display = 'none';
    if (previewImg) previewImg.src = '';

    if (cont) cont.style.display = 'none';
    if (obsSup) { obsSup.value = ''; obsSup.style.display = 'none'; }
    if (obsNin) { obsNin.value = ''; obsNin.style.display = 'none'; }

    if (planeacion) {
        area.value = planeacion.area_desarrollo || '';
        objetivo.value = planeacion.objetivo || '';
        descripcion.value = planeacion.descripcion || '';
        materiales.value = planeacion.materiales || '';
        imagen.value = planeacion.imagen || '';

        // Mostrar preview si existe imagen cargada
        if (planeacion.imagen && previewContainer && previewImg) {
            previewImg.src = planeacion.imagen;
            previewImg.setAttribute('referrerpolicy', 'no-referrer');
            previewImg.onclick = () => window.open(planeacion.imagen, '_blank');
            previewContainer.style.display = 'block';
        }
    }
    const cache = CACHE_PLANEACION_MODAL[servicio.fecha];
    if (cache) {
        area.value = cache.area; objetivo.value = cache.objetivo; descripcion.value = cache.descripcion; materiales.value = cache.materiales; imagen.value = cache.imagen;
        if (cache.imagen && previewContainer && previewImg) {
            previewImg.src = cache.imagen;
            previewContainer.style.display = 'block';
        }
    }

    if (SESION.supervision || SESION.admin) {
        if (cont) cont.style.display = 'block';
        if (obsSup) {
            obsSup.style.display = 'block';
            obsSup.readOnly = false;
            obsSup.disabled = false;
            obsSup.value = planeacion?.observaciones_supervision || '';
        }
        if (obsNin) obsNin.style.display = 'none';
        MODO_SOLO_LECTURA = true;
    } else {
        // Lógica de Niñera: Editable por defecto, solo lectura solo si ya está REVISADA
        MODO_SOLO_LECTURA = false;
        if (estadoRevisionActual === 'revisada') MODO_SOLO_LECTURA = true;

        if (planeacion?.observaciones_supervision) {
            if (cont) cont.style.display = 'block';
            if (obsNin) { obsNin.style.display = 'block'; obsNin.value = planeacion.observaciones_supervision; }
            if (obsSup) obsSup.style.display = 'none';
        } else {
            if (cont) cont.style.display = 'none';
        }
    }

    [area, objetivo, descripcion, materiales, imagen].forEach(el => { el.readOnly = MODO_SOLO_LECTURA; el.disabled = MODO_SOLO_LECTURA; });

    const btnGuardar = document.getElementById('btnGuardarPlaneacion');
    const btnReenviar = document.getElementById('btnReenviarPlaneacion');
    const btnCorreccion = document.getElementById('btnEnviarCorreccion');
    const btnRevisada = document.getElementById('btnMarcarRevisada');

    [btnGuardar, btnReenviar, btnCorreccion, btnRevisada].forEach(b => { if (b) b.style.display = 'none'; });

    if (SESION.supervision || SESION.admin) {
        if (estadoRevisionActual !== 'revisada') {
            if (btnCorreccion) btnCorreccion.style.display = 'inline-flex';
            if (btnRevisada) btnRevisada.style.display = 'inline-flex';
        }
    } else {
        if (!estadoRevisionActual) { if (btnGuardar) btnGuardar.style.display = 'inline-flex'; }
        else if (estadoRevisionActual === 'pendiente' || estadoRevisionActual.includes('correccion')) { if (btnReenviar) btnReenviar.style.display = 'inline-flex'; }
    }
    document.getElementById('planeacionBackdrop').style.display = 'flex';
}

async function reenviarPlaneacionCorregida() {
    if (!SERVICIO_PLANEACION) { alert('Servicio no identificado'); return; }
    const btn = document.getElementById('btnReenviarPlaneacion');
    feedbackBotonInmediato(btn, 'Enviando…');
    mostrarToast('🔄 Enviando correcciones…');

    const fileInput = document.getElementById('pl_imagen_file');
    let base64 = null;
    if (fileInput && fileInput.files.length > 0) {
        try {
            if (typeof comprimirImagen === 'function') {
                const comp = await comprimirImagen(fileInput.files[0], { maxWidth: 1280, maxHeight: 1280, quality: 0.78 });
                base64 = comp.base64;
            } else {
                base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(fileInput.files[0]);
                });
            }
        } catch (e) {
            restaurarBoton(btn);
            mostrarToast('❌ Error leyendo el archivo');
            return;
        }
    }

    const payload = {
        id: PLANEACION_EXISTENTE?.id || (typeof PLANEACION_EXISTENTE?.fila === 'string' && PLANEACION_EXISTENTE.fila.length > 15 ? PLANEACION_EXISTENTE.fila : null),
        fila: PLANEACION_EXISTENTE?.fila || null,
        fecha: SERVICIO_PLANEACION.fecha,
        cliente: SERVICIO_PLANEACION.cliente,
        nombre_ninera: SERVICIO_PLANEACION.nombre_ninera || SESION.nombre,
        area_desarrollo: document.getElementById('pl_area').value,
        objetivo: document.getElementById('pl_objetivo').value,
        descripcion: document.getElementById('pl_descripcion').value,
        materiales: document.getElementById('pl_materiales').value,
        imagen: document.getElementById('pl_imagen').value,
        imagen_base64: base64
    };

    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client && typeof reenviarPlaneacionCorregidaSupabase === 'function') {
            await reenviarPlaneacionCorregidaSupabase(payload, SESION.email);
        } else {
            await api('reenviarPlaneacionCorregida', { ...payload, email: SESION.email });
        }
        mostrarToast('✅ ¡Corrección enviada exitosamente!');

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: '¡Corrección enviada!',
                text: 'La planeación corregida ha sido enviada exitosamente.',
                timer: 2000,
                showConfirmButton: false
            });
        }

        btn.style.background = '#16a34a';
        btn.style.borderColor = '#16a34a';
        btn.style.color = '#ffffff';
        btn.textContent = '¡Enviado con éxito! ✓';
        setTimeout(() => {
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            restaurarBoton(btn);
        }, 2200);

        if (SESION.cliente) {
            // No aplica
        } else if (SESION.admin || SESION.supervision) {
            cargarResumenPlaneaciones(true, true);
        } else {
            cargarResumenPlaneacionesNinera(true, true);
        }

        // SMART CACHE: Invalida esta fecha específica para que se recargue si se abre el modal
        const keyCache = `${payload.cliente}|${payload.fecha}|${normalizarTexto(payload.nombre_ninera || '')}`;
        delete CACHE_PLANEACIONES[keyCache];
    } catch (err) {
        restaurarBoton(btn);
        mostrarToast('❌ Error al reenviar');
        console.error(err);
    }
}

async function guardarPlaneacionNeuronanny() {
    if (!SERVICIO_PLANEACION) { alert('Servicio no identificado'); return; }
    const btn = document.getElementById('btnGuardarPlaneacion');
    feedbackBotonInmediato(btn, 'Guardando…');
    mostrarToast('💾 Guardando planeación…');

    // Validar imagen: Puede ser un link en el input oculto (legacy o editado) O un archivo nuevo
    const fileInput = document.getElementById('pl_imagen_file');
    let base64 = null;

    if (fileInput && fileInput.files.length > 0) {
        // Leer archivo y comprimir
        try {
            if (typeof comprimirImagen === 'function') {
                const comp = await comprimirImagen(fileInput.files[0], { maxWidth: 1280, maxHeight: 1280, quality: 0.78 });
                base64 = comp.base64;
            } else {
                base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(fileInput.files[0]);
                });
            }
        } catch (e) {
            restaurarBoton(btn);
            mostrarToast('❌ Error leyendo el archivo');
            return;
        }
    } else {
        const valImg = validarLinksImagenes(document.getElementById('pl_imagen').value);
        if (!valImg.ok && document.getElementById('pl_imagen').value.trim()) {
            // Mantener valor previo si existe
        }
    }

    const payload = {
        fecha: SERVICIO_PLANEACION.fecha,
        nombre_ninera: SERVICIO_PLANEACION.nombre_ninera || SESION.nombre,
        cliente: SERVICIO_PLANEACION.cliente,
        cliente_email: SERVICIO_PLANEACION.cliente_email || SERVICIO_PLANEACION.email || '',
        edad_nino: SERVICIO_PLANEACION.edad_nino,
        ciudad: SERVICIO_PLANEACION.ciudad || '',
        area_desarrollo: document.getElementById('pl_area').value,
        objetivo: document.getElementById('pl_objetivo').value,
        descripcion: document.getElementById('pl_descripcion').value,
        materiales: document.getElementById('pl_materiales').value,
        imagen: document.getElementById('pl_imagen').value, // Valor actual (link o vacío)
        imagen_base64: base64, // Archivo para subir a Drive
        id: PLANEACION_EXISTENTE?.id || (typeof PLANEACION_EXISTENTE?.fila === 'string' && PLANEACION_EXISTENTE.fila.length > 15 ? PLANEACION_EXISTENTE.fila : null),
        fila: PLANEACION_EXISTENTE?.fila
    };

    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        let res = null;
        if (client && typeof guardarPlaneacionSupabase === 'function') {
            res = await guardarPlaneacionSupabase(payload, SESION.email);
        } else {
            const fn = PLANEACION_EXISTENTE ? 'editarPlaneacionNeuronanny' : 'guardarPlaneacionNeuronanny';
            res = await api(fn, { ...payload, email: SESION.email });
        }

        // Actualizar estado local para que las siguientes pulsaciones usen el ID correcto
        if (res && (res.id || res.fila || res.data?.id)) {
            const rowId = res.id || res.data?.id || res.fila;
            PLANEACION_EXISTENTE = { ...payload, id: rowId, fila: rowId };
        }

        // Actualización Reactiva: Refrescar resumen en segundo plano
        if (SESION.admin || SESION.supervision) {
            cargarResumenPlaneaciones(true, true);
        } else {
            cargarResumenPlaneacionesNinera(true, true);
        }

        // SMART CACHE: Invalida esta fecha específica para que se recargue si se abre el modal
        const keyCache = `${payload.cliente}|${payload.fecha}|${normalizarTexto(payload.nombre_ninera || '')}`;
        delete CACHE_PLANEACIONES[keyCache];

        mostrarToast('✅ ¡Planeación guardada exitosamente!');

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: '¡Planeación guardada!',
                text: 'La planeación ha sido guardada exitosamente.',
                timer: 2000,
                showConfirmButton: false
            });
        }

        btn.style.background = '#16a34a';
        btn.style.borderColor = '#16a34a';
        btn.style.color = '#ffffff';
        btn.textContent = '¡Guardado con éxito! ✓';
        setTimeout(() => {
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
            restaurarBoton(btn);
        }, 2200);
    } catch (err) {
        restaurarBoton(btn);
        mostrarToast('❌ Error al guardar');
        console.error(err);
    }
}

function feedbackBotonInmediato(btn, texto = 'Guardando…') {
    if (!btn) return;
    btn.disabled = true;
    btn.dataset.textoOriginal = btn.textContent;
    btn.textContent = texto;
    btn.style.opacity = '0.7';
}

function restaurarBoton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.textContent = btn.dataset.textoOriginal || btn.textContent;
    btn.style.opacity = '1';
}

function mostrarToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

async function cargarResumenPlaneacionesNinera(force = false, silent = false) {
    const contActual = document.getElementById('listaPlaneacionesNinera');
    const contSig = document.getElementById('listaPlaneacionesNineraSiguiente');

    const hoy = new Date();
    const lunesActual = startMonday(hoy);
    const lunesSig = new Date(lunesActual);
    lunesSig.setDate(lunesSig.getDate() + 7);

    const isoActual = toISO(lunesActual);
    const isoSig = toISO(lunesSig);

    // Si no se fuerza recarga y hay caché disponible, usarlo
    if (!force && CACHE_NINERA.planeaciones) {
        renderResumenPlaneaciones(CACHE_NINERA.planeaciones.actual, contActual, 'ninera_actual');
        renderResumenPlaneaciones(CACHE_NINERA.planeaciones.siguiente, contSig, 'ninera_siguiente');
        return;
    }

    if (!silent) {
        if (contActual) contActual.innerHTML = '<p class="muted">Verificando planeaciones...</p>';
        if (contSig) contSig.innerHTML = '<p class="muted">Verificando planeaciones...</p>';
    }

    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        let dataActual, dataSig;

        if (client && typeof obtenerResumenPlaneacionesSemanaSupabase === 'function') {
            [dataActual, dataSig] = await Promise.all([
                obtenerResumenPlaneacionesSemanaSupabase(isoActual, SESION.nombre),
                obtenerResumenPlaneacionesSemanaSupabase(isoSig, SESION.nombre)
            ]);
        } else {
            [dataActual, dataSig] = await Promise.all([
                api('getResumenPlaneacionesSemana', {
                    email: SESION.email,
                    fechaBase: isoActual,
                    tipo: 'actual'
                }),
                api('getResumenPlaneacionesSemana', {
                    email: SESION.email,
                    fechaBase: isoSig,
                    tipo: 'siguiente'
                })
            ]);
        }

        // Reutilizamos la función de renderizado que aplana los datos por ciudad
        renderResumenPlaneaciones(dataActual, contActual, 'ninera_actual');
        renderResumenPlaneaciones(dataSig, contSig, 'ninera_siguiente');

        // Guardar en caché
        CACHE_NINERA.planeaciones = {
            actual: dataActual,
            siguiente: dataSig
        };

    } catch (err) {
        if (contActual) contActual.innerHTML = `<span class="err"> ${err.message}</span> `;
        if (contSig) contSig.innerHTML = '';
        console.error(err);
    }
}

//Logic for abrirPlaneacionesCliente needs PLANEACION_FUENTE and CACHE_PLANEACIONES
//I must include that logic. It was around line 3774 in HTML.



function buscarServicio(fecha, cliente, fuente) {
    return fuente.find(s => s.cliente === cliente && s.fecha === fecha) || { fecha, cliente, nombre_ninera: SESION.nombre };
}

function actualizarNavegacionPlaneacion() {
    //Render dots and arrows for modal navigation
    //Not critical for API refactor but good for UX.
    //Skipping visual dots logic for brevity, can add if requested.
}

function cerrarPlaneacionNeuronanny() {
    document.getElementById('planeacionBackdrop').style.display = 'none';
}

async function guardarObservaciones() {
    const texto = document.getElementById('obsSupervision')?.value || '';
    const payload = {
        fila: PLANEACION_EXISTENTE?.fila,
        id: PLANEACION_EXISTENTE?.id || (typeof PLANEACION_EXISTENTE?.fila === 'string' && PLANEACION_EXISTENTE.fila.length > 15 ? PLANEACION_EXISTENTE.fila : null),
        fecha: SERVICIO_PLANEACION?.fecha,
        cliente: SERVICIO_PLANEACION?.cliente,
        nombre_ninera: SERVICIO_PLANEACION?.nombre_ninera,
        observaciones: texto,
        tipo: 'revisada',
        email: SESION.email
    };
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client && typeof guardarObservacionesSupervisionSupabase === 'function') {
            await guardarObservacionesSupervisionSupabase(payload, SESION.email);
        } else {
            await api('guardarObservacionesSupervision', payload);
        }
        mostrarToast('Observaciones guardadas');
    } catch (err) {
        console.error(err);
    }
}

/* =========================================
   INICIALIZACIÓN
   ========================================= */
window.addEventListener('load', async function () {
    const splashStartTime = Date.now();
    const MIN_SPLASH_TIME = 4000; // 4 segundos mínimo

    //Registrar SW
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('SW registrado'))
            .catch(e => console.error('Error SW:', e));
    }

    //Inicializar UI según sesión (requiere email y al menos token de backend o autenticación Supabase)
    if (SESION.email && (SESION.token || SESION.supabaseUid)) {
        document.body.classList.remove('admin', 'supervision', 'ninera', 'cliente', 'rh');
        if (SESION.admin) document.body.classList.add('admin');
        else if (SESION.supervision) document.body.classList.add('supervision');
        else if (SESION.rh) document.body.classList.add('rh');
        else if (SESION.cliente) document.body.classList.add('cliente');
        else document.body.classList.add('ninera');

        const saludo = document.getElementById('saludo');
        if (saludo) saludo.innerHTML = `<b>¡Hola!</b> `;

        const headerAdmin = document.getElementById('header-admin');
        if (headerAdmin) headerAdmin.style.display = (SESION.admin || SESION.supervision || SESION.rh) ? 'block' : 'none';

        // 🔥 DETERMINAR VISTA ANTES DE MOSTRAR APP
        const preDeterminarVista = () => {
            if (SESION.admin) {
                document.querySelector('.bottom-nav').style.display = 'none';
                mostrarVistaAdmin();
            } else if (SESION.supervision) {
                document.querySelector('.bottom-nav').style.display = 'none';
                irVista('supervision');
            } else if (SESION.rh) {
                document.querySelector('.bottom-nav').style.display = 'none';
                irVista('rh');
            } else if (SESION.cliente) {
                document.querySelector('.bottom-nav').style.display = 'flex';
                irVista('inicio');
            } else {
                document.querySelector('.bottom-nav').style.display = 'flex';
                irVista('inicio');
            }
        };

        // Verificar de inmediato si la cuenta está activa antes de precargar vistas
        if (typeof verificarStatusCuentaUsuario === 'function') {
            await verificarStatusCuentaUsuario();
            if (typeof SESION === 'undefined' || !SESION || !SESION.email) {
                return; // Bloqueado y expulsado
            }
        }

        preDeterminarVista();

        document.getElementById('auth').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        // 🔥 CARGAR DATOS EN PARALELO (Máximo 10s)
        const loadPromesas = (async () => {
            try {
                if (SESION.cliente) {
                    await mostrarVistaCliente(false, false);
                    if (window.ClienteServicios && typeof window.ClienteServicios.cargar === 'function') {
                        window.ClienteServicios.cargar(false);
                    }
                } else if (SESION.rh) {
                    await cargarPerfil();
                } else if (!SESION.admin && !SESION.supervision) {
                    if (SESION.token) {
                        await mostrarVistaNinera();
                    } else {
                        console.info('ℹ️ Panel niñera: sin token de backend tradicional.');
                    }
                }
            } catch (error) {
                console.error('Error cargando datos iniciales:', error);
            }
        })();

        await Promise.race([
            loadPromesas,
            new Promise(r => setTimeout(r, 10000))
        ]);
    } else {
        // Limpiar sesión incompleta o sin token válido
        localStorage.removeItem('nyp_sesion');
        SESION = { email: null, token: null, nombre: '', admin: false, supervision: false, rh: false, cliente: false };
        window.SESION = SESION;
        // Mostrar login y asegurar scroll vertical activo
        document.body.classList.remove('admin', 'supervision', 'ninera', 'cliente', 'rh', 'en-control-servicios');
        document.documentElement.classList.remove('en-control-servicios');
        document.getElementById('auth').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }

    // 🕐 ASEGURAR MÍNIMO 4 SEGUNDOS DE SPLASH
    const elapsedTime = Date.now() - splashStartTime;
    const remainingTime = Math.max(0, MIN_SPLASH_TIME - elapsedTime);

    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.transition = 'opacity 0.8s ease';
            splash.style.opacity = '0';

            // Sincronizar entrada de la app con el splash
            const appDiv = document.getElementById('app');
            if (appDiv) {
                appDiv.style.opacity = '0';
                appDiv.style.transition = 'opacity 0.6s ease';
                setTimeout(() => appDiv.style.opacity = '1', 50);
            }

            setTimeout(() => {
                splash.style.display = 'none';
            }, 800);
        }
    }, remainingTime);

    //Close modal when clicking outside
    const back = document.getElementById('modalBackdrop');
    if (back) {
        back.addEventListener('click', (e) => {
            if (e.target === back) {
                cerrarModal();
            }
        });
    }

    const backCliente = document.getElementById('modalServicioCliente');
    if (backCliente) {
        backCliente.addEventListener('click', (e) => {
            if (e.target === backCliente) {
                cerrarModalCliente();
            }
        });
    }

    // Inicializar máscaras de teléfono
    ['reg_staff_telefono', 'reg_staff_emergencia', 'reg_tel', 'reg_emergencia'].forEach(setupPhoneMask);
});

/* =========================================
   COMPLEMENTOS PLANEACIÓN Y NAVEGACIÓN
   ========================================= */

async function abrirPlaneacionesCliente(cliente, esSiguienteSemana, tipoServicioResumen) {
    PLANEACION_SESSION_ID++;
    MODO_SOLO_LECTURA = false;
    PLANEACION_CLIENTE = cliente;

    //🔑 USAR FECHAS DEL RESUMEN (Sin espacios extra en el key)
    const key = `${esSiguienteSemana ? 'ninera_siguiente' : 'ninera_actual'}|${cliente}|${normalizarTexto(SESION.nombre || '')}`;
    const fechas = RESUMEN_PLANEACIONES_SUP[key] || [];

    if (!fechas.length) {
        alert('No hay servicios con planeación para este cliente en esta semana.');
        return;
    }

    PLANEACIONES_FECHAS = fechas.slice().sort();
    PLANEACION_INDEX = 0;

    PLANEACION_FUENTE = PLANEACIONES_FECHAS.map(f => ({
        cliente,
        fecha: f,
        tipo_servicio: tipoServicioResumen || '',
        nombre_ninera: SESION.nombre || '' // FIX: Usar nombre de sesión para la niñera
    }));

    // Mostrar modal y preloader inmediatamente
    document.getElementById('planeacionBackdrop').style.display = 'flex';
    mostrarPreloaderModal('planeacionBackdrop', 'planeacion-content-wrapper', 'Cargando planeaciones de la semana...');

    actualizarNavegacionPlaneacion();

    // 🔥 ESPERAR CARGA MASIVA (Evita que el usuario vea un preloader por cada día que cambie)
    await precargarPlaneacionesCliente();

    abrirPlaneacionPorIndice();
}

function abrirPlaneacionPorIndice() {
    const fecha = PLANEACIONES_FECHAS[PLANEACION_INDEX];
    const servicio = PLANEACION_FUENTE.find(
        s => s.cliente === PLANEACION_CLIENTE && s.fecha === fecha
    );

    if (!servicio) {
        alert('Servicio no encontrado en esta semana');
        return;
    }

    // FIX: Clave única por cliente + fecha + niñera para evitar colisiones
    // Se mueve aquí porque necesitamos 'servicio' definido
    // 🔥 USAR NORMALIZACIÓN EN LA CLAVE PARA EVITAR MISSES POR MAYÚSCULAS/TILDES
    const key = `${PLANEACION_CLIENTE}|${fecha}|${normalizarTexto(servicio.nombre_ninera || '')}`;

    if (key in CACHE_PLANEACIONES) {
        ocultarPreloaderModal(); // Asegurar que el preloader se oculte si viene de cache
        abrirPlaneacionNeuronanny(servicio, CACHE_PLANEACIONES[key]);
        actualizarNavegacionPlaneacion();
        return;
    }


    // ---------------------------------------------------------
    // CHANGE: Clear form BEFORE showing preloader to avoid mixed content glitch
    abrirPlaneacionNeuronanny(servicio, null);
    // ---------------------------------------------------------

    // Mostrar preloader mientras carga
    mostrarPreloaderModal();

    const sessionAtRequest = PLANEACION_SESSION_ID;

    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    const fetchProm = (client && typeof obtenerPlaneacionNeuronannySupabase === 'function')
        ? obtenerPlaneacionNeuronannySupabase(fecha, PLANEACION_CLIENTE, servicio.nombre_ninera)
        : api('obtenerPlaneacionNeuronanny', {
            fecha,
            cliente: PLANEACION_CLIENTE,
            email: SESION.email,
            nombre_ninera: servicio.nombre_ninera // FIX: Enviar nombre de niñera para filtrar correctamente
        });

    fetchProm
        .then(res => {
            if (sessionAtRequest !== PLANEACION_SESSION_ID) return;

            // Ocultar preloader cuando la data está lista
            ocultarPreloaderModal();

            if (!res) {
                CACHE_PLANEACIONES[key] = null;
                abrirPlaneacionNeuronanny(servicio, null);
                actualizarNavegacionPlaneacion();
                return;
            }
            CACHE_PLANEACIONES[key] = res;
            abrirPlaneacionNeuronanny(servicio, res);
            actualizarNavegacionPlaneacion();
        })
        .catch(err => {
            if (sessionAtRequest !== PLANEACION_SESSION_ID) return;
            ocultarPreloaderModal(); // Ocultar preloader también en caso de error
            CACHE_PLANEACIONES[key] = null;
            abrirPlaneacionNeuronanny(servicio, null);
            actualizarNavegacionPlaneacion();
            console.error(err);
        });
}

function planeacionAnterior() {
    guardarPlaneacionEnCache();
    if (PLANEACION_INDEX > 0) {
        PLANEACION_INDEX--;
        abrirPlaneacionPorIndice();
    }
}

function planeacionSiguiente() {
    guardarPlaneacionEnCache();
    if (PLANEACION_INDEX < PLANEACIONES_FECHAS.length - 1) {
        PLANEACION_INDEX++;
        abrirPlaneacionPorIndice();
    }
}

function actualizarNavegacionPlaneacion() {
    const fechaISO = PLANEACIONES_FECHAS[PLANEACION_INDEX];
    const total = PLANEACIONES_FECHAS.length;
    const actual = PLANEACION_INDEX + 1;
    const d = new Date(fechaISO + 'T00:00:00');
    const textoFecha = d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' });
    const textoFinal = total > 1 ? `${textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1)} · Día ${actual} de ${total} ` : textoFecha.charAt(0).toUpperCase() + textoFecha.slice(1);

    const elFecha = document.getElementById('pl_fecha_actual');
    if (elFecha) elFecha.textContent = textoFinal;

    const btnPrev = document.querySelector('#planeacionBackdrop button[onclick="planeacionAnterior()"]');
    const btnNext = document.querySelector('#planeacionBackdrop button[onclick="planeacionSiguiente()"]');

    if (total <= 1) {
        if (btnPrev) btnPrev.style.display = 'none';
        if (btnNext) btnNext.style.display = 'none';
        return;
    }
    if (PLANEACION_INDEX === 0) {
        if (btnPrev) btnPrev.style.display = 'none';
        if (btnNext) btnNext.style.display = 'inline-flex';
        return;
    }
    if (PLANEACION_INDEX === total - 1) {
        if (btnPrev) btnPrev.style.display = 'inline-flex';
        if (btnNext) btnNext.style.display = 'none';
        return;
    }
    if (btnPrev) btnPrev.style.display = 'inline-flex';
    if (btnNext) btnNext.style.display = 'inline-flex';
}

function cerrarPlaneacionNeuronanny() {
    SERVICIO_PLANEACION = null;
    // CACHE_PLANEACIONES = {}; // SMART CACHE: We keep it for the session
    CACHE_PLANEACION_MODAL = {};
    PLANEACION_SESSION_ID++;
    document.getElementById('planeacionBackdrop').style.display = 'none';
}

async function precargarPlaneacionesCliente() {
    const localSession = PLANEACION_SESSION_ID;
    const localCliente = PLANEACION_CLIENTE;
    const localFechas = [...PLANEACIONES_FECHAS];

    // Si ya tenemos cache de todo, no insistir
    const faltaCache = localFechas.some(f => {
        const s = PLANEACION_FUENTE.find(pf => pf.fecha === f);
        const key = `${localCliente}|${f}|${normalizarTexto(s?.nombre_ninera || '')}`;
        return !(key in CACHE_PLANEACIONES);
    });

    if (!faltaCache) {
        return;
    }

    // Tomar el nombre de la niñera del primer elemento (asumimos que es la misma para este bloque)
    const primerServicio = PLANEACION_FUENTE[0];
    const nombreNinera = primerServicio?.nombre_ninera || '';

    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        let res = null;

        if (client && typeof obtenerPlaneacionesBulkSupabase === 'function') {
            res = await obtenerPlaneacionesBulkSupabase(localFechas, localCliente, nombreNinera);
        } else {
            res = await api('obtenerPlaneacionesBulk', {
                fechas: localFechas,
                cliente: localCliente,
                email: SESION.email,
                nombre_ninera: nombreNinera // FIX: Enviar filtro de niñera
            });
        }

        // Abortar si la sesión cambió mientras esperábamos al servidor
        if (localSession !== PLANEACION_SESSION_ID) return;

        // Populate cache para TODAS las fechas solicitadas
        localFechas.forEach(fecha => {
            const data = (res && res[fecha]) ? res[fecha] : null;
            // Construir key consistente con abrirPlaneacionPorIndice
            const key = `${localCliente}|${fecha}|${normalizarTexto(nombreNinera)}`;
            CACHE_PLANEACIONES[key] = data;
        });

    } catch (e) {
        console.error(`Error precargando planeaciones bulk:`, e);
    }
}

async function abrirPlaneacionesClienteDesdeResumen(cliente, prefijo, tipoServicioResumen, nombreNineraResumen) {
    PLANEACION_SESSION_ID++;
    MODO_SOLO_LECTURA = true;
    PLANEACION_CLIENTE = cliente;
    const key = `${prefijo}|${cliente}|${nombreNineraResumen || ''}`;
    const fechas = RESUMEN_PLANEACIONES_SUP[key] || [];

    if (!fechas.length) {
        alert('No hay servicios Neuronanny para este cliente en esta semana.');
        return;
    }
    PLANEACIONES_FECHAS = fechas.slice().sort();
    PLANEACION_INDEX = 0;
    PLANEACION_FUENTE = PLANEACIONES_FECHAS.map(f => ({
        cliente,
        fecha: f,
        tipo_servicio: tipoServicioResumen || '',
        nombre_ninera: nombreNineraResumen || ''
    }));

    document.getElementById('planeacionBackdrop').style.display = 'flex';
    mostrarPreloaderModal('planeacionBackdrop', 'planeacion-content-wrapper', 'Cargando planeaciones de la semana...');

    actualizarNavegacionPlaneacion();

    // 🔥 ESPERAR CARGA MASIVA
    await precargarPlaneacionesCliente();

    abrirPlaneacionPorIndice();
}

function marcarPlaneacionRevisada() {
    const texto = document.getElementById('obsSupervision')?.value || '';
    mostrarToast('💾 Guardando revisión...');
    const payload = {
        fila: PLANEACION_EXISTENTE?.fila,
        id: PLANEACION_EXISTENTE?.id || (typeof PLANEACION_EXISTENTE?.fila === 'string' && PLANEACION_EXISTENTE.fila.length > 15 ? PLANEACION_EXISTENTE.fila : null),
        fecha: SERVICIO_PLANEACION?.fecha,
        cliente: SERVICIO_PLANEACION?.cliente,
        nombre_ninera: SERVICIO_PLANEACION?.nombre_ninera,
        observaciones: texto,
        tipo: 'revisada',
        email: SESION.email
    };
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    const saveProm = (client && typeof guardarObservacionesSupervisionSupabase === 'function')
        ? guardarObservacionesSupervisionSupabase(payload, SESION.email)
        : api('guardarObservacionesSupervision', payload);

    saveProm.then(() => {
        mostrarToast('✅ Planeación marcada como revisada');
        // Actualización en segundo plano (como el panel de niñera)
        cargarResumenPlaneaciones(true, true);
    }).catch(err => {
        mostrarToast('❌ Error al guardar revisión');
        console.error(err);
    });
}

function enviarACorreccion() {
    const texto = document.getElementById('obsSupervision')?.value || '';
    mostrarToast('💾 Enviando a corrección...');
    const payload = {
        fila: PLANEACION_EXISTENTE?.fila,
        id: PLANEACION_EXISTENTE?.id || (typeof PLANEACION_EXISTENTE?.fila === 'string' && PLANEACION_EXISTENTE.fila.length > 15 ? PLANEACION_EXISTENTE.fila : null),
        fecha: SERVICIO_PLANEACION?.fecha,
        cliente: SERVICIO_PLANEACION?.cliente,
        nombre_ninera: SERVICIO_PLANEACION?.nombre_ninera,
        observaciones: texto,
        tipo: 'correccion',
        email: SESION.email
    };
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    const saveProm = (client && typeof guardarObservacionesSupervisionSupabase === 'function')
        ? guardarObservacionesSupervisionSupabase(payload, SESION.email)
        : api('guardarObservacionesSupervision', payload);

    saveProm.then(() => {
        mostrarToast('🟠 Observaciones enviadas a corrección');
        // Actualización en segundo plano (como el panel de niñera)
        cargarResumenPlaneaciones(true, true);
    }).catch(err => {
        mostrarToast('❌ Error al enviar a corrección');
        console.error(err);
    });
}

function guardarPlaneacionEnCache() {
    if (!SERVICIO_PLANEACION) return;
    const fecha = SERVICIO_PLANEACION.fecha;
    if (!fecha) return;
    CACHE_PLANEACION_MODAL[fecha] = {
        area: document.getElementById('pl_area')?.value || '',
        objetivo: document.getElementById('pl_objetivo')?.value || '',
        descripcion: document.getElementById('pl_descripcion')?.value || '',
        materiales: document.getElementById('pl_materiales')?.value || '',
        imagen: document.getElementById('pl_imagen')?.value || '',
        observaciones: document.getElementById('obsSupervision')?.value || ''
    };
}

document.addEventListener('click', function (e) {
    const backdrop = document.getElementById('planeacionBackdrop');
    if (!backdrop || backdrop.style.display !== 'flex') return;
    if (e.target === backdrop) cerrarPlaneacionNeuronanny();
});

function setAppHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh} px`);
}
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);
setAppHeight();


/* =========================================
   PUSH NOTIFICATIONS
   ========================================= */

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
}

async function activarNotificaciones() {
    try {
        console.log('🔔 Activando notificaciones...');
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) { alert('❌ Este navegador no soporta notificaciones'); return; }
        if (!navigator.serviceWorker.controller) { alert('❌ Recarga la página y vuelve a intentar'); return; }
        if (Notification.permission === 'denied') { alert('❌ Notificaciones bloqueadas en el navegador'); return; }

        if (Notification.permission === 'default') {
            const permiso = await Notification.requestPermission();
            if (permiso !== 'granted') { alert('❌ Permiso no concedido'); return; }
        }

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            //VAPID_PUBLIC_KEY must be global or defined here. 
            //It is defined in app.js or index.html logic. 
            //Assuming defined in app.js or let's redefine locally to be safe as in HTML it was const.
            const vapidKey = 'BAALWaRIxKUyY4J0qKwy0CV1AJKtsloQZHcPzZzHLqF3GQOf8HzLEbe6gYJsgr1BEW0OGbwjfE6QR6twPW27Ghk';
            const applicationServerKey = urlBase64ToUint8Array(vapidKey);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
            });
        }

        //Guardar en backend via api()
        //The original code used direct fetch. We use api().
        await api('guardarPushSubscription', {
            email: SESION.email,
            subscription: subscription.toJSON()
        });

        if (window.OneSignalDeferred) {
            OneSignalDeferred.push(async function (OneSignal) {
                await OneSignal.User.PushSubscription.optIn();
                const oneSignalId = await OneSignal.User.getId();
                console.log('🆔 OneSignal User ID:', oneSignalId);
            });
        }
        alert('✅ Notificaciones activadas correctamente');
        return subscription;

    } catch (error) {
        console.error(error);
        alert('❌ Error al activar notificaciones:\n' + error.message);
    }
}

/** =========================
 *  LÓGICA CLIENTE
 *  ========================= */

function mostrarRegistroCliente() {
    document.getElementById('paso-login').style.display = 'none';
    document.getElementById('paso-registro-cliente').style.display = 'block';
    document.getElementById('paso-olvide').style.display = 'none';
}
window.mostrarRegistroCliente = mostrarRegistroCliente;

async function iniciarRegistroCliente() {
    if (typeof mostrarCrearCuentaCliente === 'function') {
        mostrarCrearCuentaCliente();
        return;
    }
    const email = document.getElementById('email-reg')?.value.trim().toLowerCase() || '';
    const pass = document.getElementById('pass-reg')?.value || '';
    const msg = document.getElementById('msgRegistro');

    if (!email || !pass) {
        msg.innerHTML = '<span class="err">Por favor, llena todos los campos.</span>';
        return;
    }
    if (pass.length < 6) {
        msg.innerHTML = '<span class="err">La contraseña debe tener al menos 6 caracteres.</span>';
        return;
    }

    msg.textContent = 'Enviando código de verificación...';

    try {
        await api('solicitarOTPRegistro', { email });

        // Cambiar UI a paso 2
        document.getElementById('reg-paso-1').style.display = 'none';
        document.getElementById('reg-paso-2').style.display = 'block';
        msg.innerHTML = '<span class="ok">Revisa tu correo e ingresa el código.</span>';

    } catch (err) {
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}
window.iniciarRegistroCliente = iniciarRegistroCliente;

async function confirmarRegistroCliente() {
    const email = document.getElementById('email-reg').value.trim().toLowerCase();
    const pass = document.getElementById('pass-reg').value;
    const otp = document.getElementById('otp-reg').value.trim();
    const msg = document.getElementById('msgRegistro');

    if (!otp) {
        msg.innerHTML = '<span class="err">Ingresa el código de verificación.</span>';
        return;
    }

    msg.textContent = 'Verificando y creando cuenta...';

    try {
        const res = await api('confirmarRegistroCliente', { email, otp, password: pass });

        // Auto-Login exitoso
        SESION.email = res.email;
        SESION.token = res.token || null;
        SESION.nombre = res.nombre || '';
        SESION.admin = !!res.admin;
        SESION.supervision = !!res.supervision;
        SESION.cliente = !!res.cliente;

        localStorage.setItem('nyp_sesion', JSON.stringify(SESION));

        msg.innerHTML = '<span class="ok">¡Cuenta creada con éxito!</span>';

        // Inicializar app
        setTimeout(() => {
            document.getElementById('auth').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            document.querySelector('.bottom-nav').style.display = 'flex';
            irVista('servicios'); // Redirigirá a onboarding
        }, 1500);

    } catch (err) {
        msg.innerHTML = '<span class="err">' + err.message + '</span>';
    }
}
window.confirmarRegistroCliente = confirmarRegistroCliente;

function cancelarRegistro() {
    document.getElementById('reg-paso-1').style.display = 'block';
    document.getElementById('reg-paso-2').style.display = 'none';
    document.getElementById('msgRegistro').textContent = '';
    document.getElementById('otp-reg').value = '';
}
window.cancelarRegistro = cancelarRegistro;

// Deprecated wrapper kept just in case but overridden above
function registrarNuevoCliente() { iniciarRegistroCliente(); }
window.registrarNuevoCliente = registrarNuevoCliente;

function volverLogin() {
    //Para compatibilidad, si algo llama a volverLogin, lo mandamos a selección o al login de staff
    volverSeleccion();
}
window.volverLogin = volverLogin;

function mostrarRegistroCliente() {
    // Para el portal familia, usamos la vista de onboarding
    irVista('cliente');
}
window.mostrarRegistroCliente = mostrarRegistroCliente;

function aceptarPoliticas() {
    const btn = document.getElementById('btn_aceptar_politicas');
    const hidden = document.getElementById('reg_politicas_aceptadas');

    if (btn && hidden) {
        const ahora = new Date();
        // Formato: 24/1/2026 18:06:16
        const formatted = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ahora.getFullYear()} ${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;
        hidden.value = formatted;
        btn.textContent = '✓ Aceptado';
        btn.disabled = true;
        btn.style.background = '#10b981';
        btn.style.cursor = 'not-allowed';
        mostrarToast('✓ Políticas aceptadas');
    }
}
window.aceptarPoliticas = aceptarPoliticas;

function cancelarFormularioCliente() {
    // Cerrar el formulario y regresar a la vista de perfil
    const o = document.getElementById('cliente-onboarding');
    if (o) o.style.display = 'none';

    // Regresar a vista de perfil
    irVista('perfil');
}
window.cancelarFormularioCliente = cancelarFormularioCliente;

/**
 * Verifica datos faltantes del cliente.
 * @param {Object} p - El payload del perfil
 * @param {Boolean} mostrarErroresVisuales - Si se deben resaltar los errores con rojo temporal
 */
function verificarDatosFaltantesCliente(p, mostrarErroresVisuales = false) {
    if (!p) return true; // Falta todo

    // Si solo estamos verificando permisos de navegación (no al enviar el formulario),
    // determinamos si el cliente ya es un usuario existente registrado con información básica
    if (!mostrarErroresVisuales) {
        const tieneNombre = !!(p.nombre_completo || p.nombre || p.nombre_del_cliente);
        const tieneContacto = !!(p.telefono || p.teléfono || p.direccion || p.dirección || p.ubicacion || p.ubicación || p.peque_nombre || p.nombre_del_peque);
        if (tieneNombre && tieneContacto) {
            return false;
        }
    }

    // Solo limpiar errores si vamos a mostrar resaltados nuevos
    if (mostrarErroresVisuales) {
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error', 'input-error-shake'));
    }

    const req = [
        { keys: ['rol'], id: 'reg_rol', label: 'Rol (Mamá, Papá, Familiar)' },
        { keys: ['nombre_completo', 'nombre'], id: 'reg_nombre', label: 'Nombre completo' },
        { keys: ['dirección', 'direccion'], id: 'reg_direccion', label: 'Dirección' },
        { keys: ['ubicación', 'ubicacion'], id: 'reg_ubicacion', label: 'Ubicación (Google Maps)', validate: esGoogleMapsLink },
        { keys: ['teléfono', 'telefono'], id: 'reg_tel', label: 'Teléfono (10 dígitos)', validate: (v) => String(v || '').replace(/\D/g, '').length === 10 },
        { keys: ['no._de_emergencia', 'No. de emergencia', 'no. de emergencia', 'emergencia'], id: 'reg_emergencia', label: 'Contacto de emergencia (10 dígitos)', validate: (v) => String(v || '').replace(/\D/g, '').length === 10 },
        { keys: ['no._de_mascotas', 'no. de mascotas', 'mascotas'], id: 'reg_mascotas', label: 'No. de mascotas' },
        { keys: ['nombre_del_peque', 'nombre del peque', 'peque_nombre'], id: 'reg_peque_nombre', label: 'Nombre del peque' },
        { keys: ['fecha_de_nacimiento', 'fecha de nacimiento', 'peque_nacimiento'], id: 'reg_peque_nac', label: 'Fecha de nacimiento' },
        { keys: ['alergias'], id: 'reg_alergias', label: 'Alergias' },
        { keys: ['condición_médica_o_especificaciones_adicionales', 'condicion_medica', 'condicion'], id: 'reg_condicion', label: 'Condición médica' },
        { keys: ['estado_de_salud_actual', 'salud_actual', 'salud', 'estado_de_sal_actual', 'estado de salud'], id: 'reg_salud', label: 'Estado de salud' },
        { keys: ['preferencias_o_actividades_favoritas', 'preferencias'], id: 'reg_preferencias', label: 'Preferencias' },
        { keys: ['políticas_de_contratación', 'politicas_de_contratacion', 'politicas', 'politicas_aceptadas'], id: 'reg_politicas_aceptadas', label: 'Políticas de contratación' }
    ];

    // Determinar si Peque 2 está activo
    let sec2Activo = false;
    if (mostrarErroresVisuales) {
        // Al enviar el formulario: activo si la sección está visible en pantalla
        const sec2 = document.getElementById('section-peque-2');
        sec2Activo = sec2 && sec2.style.display !== 'none';
    } else {
        // Al verificar permisos para navegar: activo SOLO si el perfil ya tiene registrado Peque 2
        sec2Activo = !!(p.peque_nombre_2 || p.nombre_del_peque_2);
    }

    if (sec2Activo) {
        req.push(
            { keys: ['nombre_del_peque_2', 'peque_nombre_2'], id: 'reg_peque_nombre_2', label: 'Nombre del peque 2' },
            { keys: ['fecha_de_nacimiento_2', 'peque_nac_2', 'peque_nacimiento_2'], id: 'reg_peque_nac_2', label: 'Fecha de nacimiento 2' },
            { keys: ['alergias_2'], id: 'reg_alergias_2', label: 'Alergias 2' },
            { keys: ['condicion_medica_2', 'condicion_2', 'condición_médica_o_especificaciones_adicionales_2'], id: 'reg_condicion_2', label: 'Condición médica 2' },
            { keys: ['salud_actual_2', 'salud_2', 'estado_de_salud_actual_2'], id: 'reg_salud_2', label: 'Estado de salud actual 2' },
            { keys: ['preferencias_2', 'preferencias_o_actividades_favoritas_2'], id: 'reg_preferencias_2', label: 'Preferencias 2' }
        );
    }

    // Determinar si Peque 3 está activo
    let sec3Activo = false;
    if (mostrarErroresVisuales) {
        // Al enviar el formulario: activo si la sección está visible en pantalla
        const sec3 = document.getElementById('section-peque-3');
        sec3Activo = sec3 && sec3.style.display !== 'none';
    } else {
        // Al verificar permisos para navegar: activo SOLO si el perfil ya tiene registrado Peque 3
        sec3Activo = !!(p.peque_nombre_3 || p.nombre_del_peque_3);
    }

    if (sec3Activo) {
        req.push(
            { keys: ['nombre_del_peque_3', 'peque_nombre_3'], id: 'reg_peque_nombre_3', label: 'Nombre del peque 3' },
            { keys: ['fecha_de_nacimiento_3', 'peque_nac_3', 'peque_nacimiento_3'], id: 'reg_peque_nac_3', label: 'Fecha de nacimiento 3' },
            { keys: ['alergias_3'], id: 'reg_alergias_3', label: 'Alergias 3' },
            { keys: ['condicion_medica_3', 'condicion_3', 'condición_médica_o_especificaciones_adicionales_3'], id: 'reg_condicion_3', label: 'Condición médica 3' },
            { keys: ['salud_actual_3', 'salud_3', 'estado_de_salud_actual_3'], id: 'reg_salud_3', label: 'Estado de salud actual 3' },
            { keys: ['preferencias_3', 'preferencias_o_actividades_favoritas_3'], id: 'reg_preferencias_3', label: 'Preferencias 3' }
        );
    }

    const faltantes = [];
    let primerError = null;

    req.forEach(f => {
        let val = '';
        if (f.keys) {
            for (const k of f.keys) {
                if (p[k]) {
                    val = String(p[k]).trim();
                    break;
                }
            }
        } else if (f.key) {
            val = String(p[f.key] || '').trim();
        }

        const esInvalido = val.length < 1 || (f.validate && !f.validate(val));

        if (esInvalido) {
            faltantes.push(f.label);
            const el = document.getElementById(f.id);
            if (el) {
                let targetHighlight = el;
                // Manejo especial para campos ocultos o grupos
                if (f.id === 'reg_rol') {
                    targetHighlight = document.querySelector('.role-selection-group') || el;
                } else if (f.id === 'reg_politicas_aceptadas') {
                    targetHighlight = document.getElementById('btn_aceptar_politicas') || el;
                }

                if (mostrarErroresVisuales) {
                    resaltarErrorTemporal(targetHighlight);
                }

                if (!primerError) primerError = targetHighlight;
            }
        }
    });

    if (primerError && mostrarErroresVisuales) {
        setTimeout(() => {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (primerError.focus && primerError.tagName !== 'DIV') primerError.focus();
        }, 100);
    }

    return faltantes.length > 0;
}


function seleccionarRol(rolDisplay) {
    const input = document.getElementById('reg_rol');
    if (!input) return;

    // Mapeo exacto solicitado
    const mapValores = {
        'Mamá': 'mama',
        'Papá': 'papa',
        'Familiar': 'Familiar'
    };

    const valorInterno = mapValores[rolDisplay] || rolDisplay;
    input.value = valorInterno;

    // Lógica robusta de iluminación (con reintento para móviles)
    const iluminar = (reintentos = 3) => {
        const idMap = {
            'mama': 'role_mama',
            'papa': 'role_papa',
            'Familiar': 'role_familiar'
        };
        const targetId = idMap[valorInterno];
        const btn = document.getElementById(targetId);

        if (btn) {
            document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        } else if (reintentos > 0) {
            // Si el botón aún no está en el DOM (común en móviles al abrir vistas), reintentar brevemente
            setTimeout(() => iluminar(reintentos - 1), 50);
        }
    };

    iluminar();
}
window.seleccionarRol = seleccionarRol;

async function mostrarVistaCliente(forceOnboarding = false, forceFetch = false) {
    const d = document.getElementById('cliente-dashboard');
    const o = document.getElementById('cliente-onboarding');

    // Evitar ocultar si ya estamos en la vista correcta para no causar parpadeo
    const isShowingDashboard = d && d.style.display === 'block';
    const isShowingOnboarding = o && o.style.display === 'block';

    // No ocultamos nada todavía, dejaremos que la lógica decida qué mostrar

    let perf = CACHE_CLIENTE.profile;

    if (forceFetch || !perf) {
        try {
            // 1. Priorizar consulta directa a Supabase (clientes) para obtener los datos precargados por Admin
            const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
            if (client && SESION?.email) {
                const { data: supaCliente } = await client
                    .from('clientes')
                    .select('*')
                    .ilike('email', SESION.email)
                    .maybeSingle();

                if (supaCliente) {
                    if (supaCliente.activo === false) {
                        console.warn("🚨 [Cliente Inactivo] Sesión no permitida para cliente inactivo");
                        await bloquearUsuarioInactivo();
                        return;
                    }
                    perf = {
                        email: supaCliente.email,
                        nombre: supaCliente.nombre || SESION.email.split('@')[0],
                        nombre_completo: supaCliente.nombre,
                        rol: supaCliente.rol || 'cliente',
                        telefono: supaCliente.telefono,
                        teléfono: supaCliente.telefono,
                        direccion: supaCliente.direccion,
                        dirección: supaCliente.direccion,
                        ubicacion: supaCliente.ubicacion,
                        ubicación: supaCliente.ubicacion,
                        emergencia: supaCliente.emergencia,
                        'no._de_emergencia': supaCliente.emergencia,
                        'no. de emergencia': supaCliente.emergencia,
                        mascotas: supaCliente.mascotas,
                        'no._de_mascotas': supaCliente.mascotas,
                        'no. de mascotas': supaCliente.mascotas,
                        politicas_contratacion: supaCliente.politicas_contratacion,
                        'políticas_de_contratación': supaCliente.politicas_contratacion,
                        politicas_aceptadas: supaCliente.politicas_contratacion,
                        ciudad: supaCliente.ciudad,

                        // Peque 1
                        peque_nombre: supaCliente.peque_nombre,
                        nombre_del_peque: supaCliente.peque_nombre,
                        peque_nacimiento: supaCliente.peque_nacimiento,
                        fecha_de_nacimiento: supaCliente.peque_nacimiento,
                        edad_del_peque: supaCliente.peque_edad,
                        peque_edad: supaCliente.peque_edad,
                        alergias: supaCliente.alergias,
                        condicion: supaCliente.condicion_medica,
                        condicion_medica: supaCliente.condicion_medica,
                        'condición_médica_o_especificaciones_adicionales': supaCliente.condicion_medica,
                        salud: supaCliente.salud_actual,
                        salud_actual: supaCliente.salud_actual,
                        estado_de_sal_actual: supaCliente.salud_actual,
                        estado_de_salud_actual: supaCliente.salud_actual,
                        preferencias: supaCliente.preferencias,
                        preferencias_o_actividades_favoritas: supaCliente.preferencias,

                        // Peque 2
                        peque_nombre_2: supaCliente.peque_nombre_2,
                        nombre_del_peque_2: supaCliente.peque_nombre_2,
                        peque_nac_2: supaCliente.peque_nacimiento_2,
                        peque_nacimiento_2: supaCliente.peque_nacimiento_2,
                        fecha_de_nacimiento_2: supaCliente.peque_nacimiento_2,
                        edad_del_peque_2: supaCliente.peque_edad_2,
                        peque_edad_2: supaCliente.peque_edad_2,
                        alergias_2: supaCliente.alergias_2,
                        condicion_2: supaCliente.condicion_medica_2,
                        condicion_medica_2: supaCliente.condicion_medica_2,
                        'condición_médica_o_especificaciones_adicionales_2': supaCliente.condicion_medica_2,
                        salud_2: supaCliente.salud_actual_2,
                        salud_actual_2: supaCliente.salud_actual_2,
                        estado_de_salud_actual_2: supaCliente.salud_actual_2,
                        preferencias_2: supaCliente.preferencias_2,
                        preferencias_o_actividades_favoritas_2: supaCliente.preferencias_2,

                        // Peque 3
                        peque_nombre_3: supaCliente.peque_nombre_3,
                        nombre_del_peque_3: supaCliente.peque_nombre_3,
                        peque_nac_3: supaCliente.peque_nacimiento_3,
                        peque_nacimiento_3: supaCliente.peque_nacimiento_3,
                        fecha_de_nacimiento_3: supaCliente.peque_nacimiento_3,
                        edad_del_peque_3: supaCliente.peque_edad_3,
                        peque_edad_3: supaCliente.peque_edad_3,
                        alergias_3: supaCliente.alergias_3,
                        condicion_3: supaCliente.condicion_medica_3,
                        condicion_medica_3: supaCliente.condicion_medica_3,
                        'condición_médica_o_especificaciones_adicionales_3': supaCliente.condicion_medica_3,
                        salud_3: supaCliente.salud_actual_3,
                        salud_actual_3: supaCliente.salud_actual_3,
                        estado_de_salud_actual_3: supaCliente.salud_actual_3,
                        preferencias_3: supaCliente.preferencias_3,
                        preferencias_o_actividades_favoritas_3: supaCliente.preferencias_3
                    };
                }
            }

            // 2. Fallback tradicional a Google Sheets si no se encontró en Supabase y existe token de sesión
            if (!perf) {
                const hasToken = !!(SESION.token || localStorage.getItem('token') || localStorage.getItem('session_token'));
                if (hasToken) {
                    try {
                        perf = await api('getProfile', { email: SESION.email });
                    } catch (apiErr) {
                        console.warn("⚠️ [mostrarVistaCliente] Fallback tradicional no disponible:", apiErr.message);
                    }
                }
            }
            if (perf) {
                CACHE_CLIENTE.profile = perf;
            }
        } catch (e) {
            console.error("Error cargando perfil cliente:", e);
            if (e.message && e.message.includes('Tu sesión ha expirado')) {
                return;
            }
            // En error de carga transitorio, NO mostrar onboarding forzado si ya hay sesión activa
        }
    }

    // Verificar si faltan datos
    const faltanDatos = verificarDatosFaltantesCliente(perf);

    if (forceOnboarding || faltanDatos) {
        if (o) {
            o.style.display = 'block';
            if (d) d.style.display = 'none'; // Asegurar que el dashboard esté oculto

            // Pre-llenar campos con nombres normalizados del backend o Supabase
            if (document.getElementById('reg_nombre')) document.getElementById('reg_nombre').value = perf.nombre || perf.nombre_completo || '';
            if (document.getElementById('reg_direccion')) document.getElementById('reg_direccion').value = perf.direccion || perf.dirección || '';
            if (document.getElementById('reg_ubicacion')) document.getElementById('reg_ubicacion').value = perf.ubicacion || perf.ubicación || '';
            if (document.getElementById('reg_tel')) document.getElementById('reg_tel').value = perf.telefono || perf.teléfono || '';
            if (document.getElementById('reg_emergencia')) document.getElementById('reg_emergencia').value = perf.emergencia || perf.no_de_emergencia || perf['no._de_emergencia'] || perf['No. de emergencia'] || '';
            if (document.getElementById('reg_mascotas')) document.getElementById('reg_mascotas').value = perf.mascotas || perf.no_de_mascotas || perf['no._de_mascotas'] || perf['no. de mascotas'] || '';

            // PEQUE 1
            if (document.getElementById('reg_peque_nombre')) document.getElementById('reg_peque_nombre').value = perf.peque_nombre || perf.nombre_del_peque || '';
            if (document.getElementById('reg_peque_nac')) {
                const fNac = perf.peque_nacimiento || perf.fecha_de_nacimiento;
                if (fNac) {
                    try {
                        if (typeof fNac === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fNac.trim())) {
                            document.getElementById('reg_peque_nac').value = fNac.trim().slice(0, 10);
                        } else {
                            const f = new Date(fNac);
                            if (!isNaN(f.getTime())) document.getElementById('reg_peque_nac').value = typeof toISO === 'function' ? toISO(f) : f.toISOString().split('T')[0];
                            else document.getElementById('reg_peque_nac').value = fNac;
                        }
                    } catch (e) { }
                }
                if (typeof actualizarEdadEnFormulario === 'function') actualizarEdadEnFormulario('reg_peque_nac', 'reg_peque_edad_badge');
            }
            if (document.getElementById('reg_alergias')) document.getElementById('reg_alergias').value = perf.alergias || '';
            if (document.getElementById('reg_condicion')) document.getElementById('reg_condicion').value = perf.condicion_medica || perf.condicion || perf['condición_médica_o_especificaciones_adicionales'] || '';
            if (document.getElementById('reg_salud')) document.getElementById('reg_salud').value = perf.salud_actual || perf.salud || perf.estado_de_salud_actual || perf.estado_de_sal_actual || '';
            if (document.getElementById('reg_preferencias')) document.getElementById('reg_preferencias').value = perf.preferencias || perf.preferencias_o_actividades_favoritas || '';

            // PEQUE 2 (Pre-llenar y mostrar si tiene información precargada)
            const p2Nom = perf.peque_nombre_2 || perf.nombre_del_peque_2 || '';
            if (p2Nom) {
                const sec2 = document.getElementById('section-peque-2');
                if (sec2) sec2.style.display = 'block';
                if (document.getElementById('reg_peque_nombre_2')) document.getElementById('reg_peque_nombre_2').value = p2Nom;
                if (document.getElementById('reg_peque_nac_2')) {
                    const fNac2 = perf.peque_nac_2 || perf.peque_nacimiento_2 || perf.fecha_de_nacimiento_2;
                    if (fNac2) {
                        try {
                            if (typeof fNac2 === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fNac2.trim())) {
                                document.getElementById('reg_peque_nac_2').value = fNac2.trim().slice(0, 10);
                            } else {
                                const f2 = new Date(fNac2);
                                if (!isNaN(f2.getTime())) document.getElementById('reg_peque_nac_2').value = typeof toISO === 'function' ? toISO(f2) : f2.toISOString().split('T')[0];
                                else document.getElementById('reg_peque_nac_2').value = fNac2;
                            }
                        } catch (e) { }
                    }
                    if (typeof actualizarEdadEnFormulario === 'function') actualizarEdadEnFormulario('reg_peque_nac_2', 'reg_peque_edad_badge_2');
                }
                if (document.getElementById('reg_alergias_2')) document.getElementById('reg_alergias_2').value = perf.alergias_2 || '';
                if (document.getElementById('reg_condicion_2')) document.getElementById('reg_condicion_2').value = perf.condicion_medica_2 || perf.condicion_2 || perf['condición_médica_o_especificaciones_adicionales_2'] || '';
                if (document.getElementById('reg_salud_2')) document.getElementById('reg_salud_2').value = perf.salud_actual_2 || perf.salud_2 || perf.estado_de_salud_actual_2 || '';
                if (document.getElementById('reg_preferencias_2')) document.getElementById('reg_preferencias_2').value = perf.preferencias_2 || perf.preferencias_o_actividades_favoritas_2 || '';
            }

            // PEQUE 3 (Pre-llenar y mostrar si tiene información precargada)
            const p3Nom = perf.peque_nombre_3 || perf.nombre_del_peque_3 || '';
            if (p3Nom) {
                const sec3 = document.getElementById('section-peque-3');
                if (sec3) sec3.style.display = 'block';
                if (document.getElementById('reg_peque_nombre_3')) document.getElementById('reg_peque_nombre_3').value = p3Nom;
                if (document.getElementById('reg_peque_nac_3')) {
                    const fNac3 = perf.peque_nac_3 || perf.peque_nacimiento_3 || perf.fecha_de_nacimiento_3;
                    if (fNac3) {
                        try {
                            if (typeof fNac3 === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fNac3.trim())) {
                                document.getElementById('reg_peque_nac_3').value = fNac3.trim().slice(0, 10);
                            } else {
                                const f3 = new Date(fNac3);
                                if (!isNaN(f3.getTime())) document.getElementById('reg_peque_nac_3').value = typeof toISO === 'function' ? toISO(f3) : f3.toISOString().split('T')[0];
                                else document.getElementById('reg_peque_nac_3').value = fNac3;
                            }
                        } catch (e) { }
                    }
                    if (typeof actualizarEdadEnFormulario === 'function') actualizarEdadEnFormulario('reg_peque_nac_3', 'reg_peque_edad_badge_3');
                }
                if (document.getElementById('reg_alergias_3')) document.getElementById('reg_alergias_3').value = perf.alergias_3 || '';
                if (document.getElementById('reg_condicion_3')) document.getElementById('reg_condicion_3').value = perf.condicion_medica_3 || perf.condicion_3 || perf['condición_médica_o_especificaciones_adicionales_3'] || '';
                if (document.getElementById('reg_salud_3')) document.getElementById('reg_salud_3').value = perf.salud_actual_3 || perf.salud_3 || perf.estado_de_salud_actual_3 || '';
                if (document.getElementById('reg_preferencias_3')) document.getElementById('reg_preferencias_3').value = perf.preferencias_3 || perf.preferencias_o_actividades_favoritas_3 || '';
            }

            // Verificar si las políticas ya fueron aceptadas
            const politicasAceptadas = perf['políticas_de_contratación'] || perf.politicas_contratacion || '';
            const btnPoliticas = document.getElementById('btn_aceptar_politicas');
            const hiddenPoliticas = document.getElementById('reg_politicas_aceptadas');

            if (politicasAceptadas && politicasAceptadas !== '—') {
                // Ya están aceptadas, mostrar botón verde y deshabilitado
                if (hiddenPoliticas) hiddenPoliticas.value = politicasAceptadas;
                if (btnPoliticas) {
                    btnPoliticas.textContent = '✓ Aceptado';
                    btnPoliticas.disabled = true;
                    btnPoliticas.style.background = '#10b981';
                    btnPoliticas.style.cursor = 'not-allowed';
                }
            } else {
                // No aceptadas, resetear botón
                if (hiddenPoliticas) hiddenPoliticas.value = '';
                if (btnPoliticas) {
                    btnPoliticas.textContent = 'Aceptar';
                    btnPoliticas.disabled = false;
                    btnPoliticas.style.background = 'var(--pink-main)';
                    btnPoliticas.style.cursor = 'pointer';
                }
            }

            // Pre-seleccionar Rol
            if (perf.rol) seleccionarRol(perf.rol);
        }
    } else {
        // 🔥 CARGA PARALELA: Servicios, Actividades y Perfil al mismo tiempo
        // Cargar todo en paralelo antes de mostrar el dashboard
        await Promise.all([
            cargarServiciosCliente(forceFetch),
            cargarActividadesCliente(forceFetch),
            cargarPerfil()
        ]);

        if (o) o.style.display = 'none';
        if (d) {
            // Solo si no estaba ya visible, o si queremos forzar el efecto
            if (d.style.display !== 'block') {
                d.style.display = 'block';
                d.classList.remove('fade-in-smooth');
                void d.offsetWidth;
                d.classList.add('fade-in-smooth');
            } else {
                // Ya estaba visible (probablemente pre-cargado), solo nos aseguramos
                d.style.display = 'block';
            }
        }
    }
}
window.mostrarVistaCliente = mostrarVistaCliente;

async function guardarRegistroCompleto() {
    const btn = document.getElementById('btnGuardarCliente');
    const originalText = btn ? (btn.getAttribute('data-original-text') || 'Guardar y Continuar') : 'Guardar y Continuar';

    if (btn) {
        if (!btn.getAttribute('data-original-text')) btn.setAttribute('data-original-text', originalText);
        btn.textContent = 'Guardando...';
        btn.disabled = true;
    }

    try {
        const sec2 = document.getElementById('section-peque-2');
        const sec3 = document.getElementById('section-peque-3');
        const sec2Visible = sec2 && sec2.style.display !== 'none';
        const sec3Visible = sec3 && sec3.style.display !== 'none';

        const payload = {
            nombre_completo: document.getElementById('reg_nombre')?.value.trim() || '',
            rol: document.getElementById('reg_rol')?.value || '',
            direccion: document.getElementById('reg_direccion')?.value.trim() || '',
            ubicacion: document.getElementById('reg_ubicacion')?.value.trim() || '',
            telefono: document.getElementById('reg_tel')?.value.trim() || '',
            emergencia: document.getElementById('reg_emergencia')?.value.trim() || '',

            // Peque 1
            peque_nombre: document.getElementById('reg_peque_nombre')?.value.trim() || '',
            peque_nacimiento: document.getElementById('reg_peque_nac')?.value || '',
            alergias: document.getElementById('reg_alergias')?.value.trim() || '',
            condicion: document.getElementById('reg_condicion')?.value.trim() || '',
            salud: document.getElementById('reg_salud')?.value.trim() || '',
            preferencias: document.getElementById('reg_preferencias')?.value.trim() || '',
            mascotas: document.getElementById('reg_mascotas')?.value.trim() || '',
            politicas_aceptadas: document.getElementById('reg_politicas_aceptadas')?.value || '',

            // Peque 2 (solo si la sección está visible)
            peque_nombre_2: sec2Visible ? (document.getElementById('reg_peque_nombre_2')?.value.trim() || '') : null,
            peque_nac_2: sec2Visible ? (document.getElementById('reg_peque_nac_2')?.value || '') : null,
            alergias_2: sec2Visible ? (document.getElementById('reg_alergias_2')?.value.trim() || '') : null,
            condicion_2: sec2Visible ? (document.getElementById('reg_condicion_2')?.value.trim() || '') : null,
            salud_2: sec2Visible ? (document.getElementById('reg_salud_2')?.value.trim() || '') : null,
            preferencias_2: sec2Visible ? (document.getElementById('reg_preferencias_2')?.value.trim() || '') : null,

            // Peque 3 (solo si la sección está visible)
            peque_nombre_3: sec3Visible ? (document.getElementById('reg_peque_nombre_3')?.value.trim() || '') : null,
            peque_nac_3: sec3Visible ? (document.getElementById('reg_peque_nac_3')?.value || '') : null,
            alergias_3: sec3Visible ? (document.getElementById('reg_alergias_3')?.value.trim() || '') : null,
            condicion_3: sec3Visible ? (document.getElementById('reg_condicion_3')?.value.trim() || '') : null,
            salud_3: sec3Visible ? (document.getElementById('reg_salud_3')?.value.trim() || '') : null,
            preferencias_3: sec3Visible ? (document.getElementById('reg_preferencias_3')?.value.trim() || '') : null,

            email: SESION.email
        };

        // Validar obligatoriedad antes de enviar
        if (verificarDatosFaltantesCliente(payload, true)) {
            mostrarToast('⚠️ Complete toda la información obligatoria del formulario');
            return;
        }

        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client) {
            console.log("💾 [Perfil Cliente] Guardando directamente en Supabase para:", SESION.email);
            const supaPayload = {
                email: SESION.email,
                nombre: payload.nombre_completo,
                rol: payload.rol || 'cliente',
                direccion: payload.direccion,
                ubicacion: payload.ubicacion,
                telefono: payload.telefono,
                emergencia: payload.emergencia,
                mascotas: payload.mascotas,
                politicas_contratacion: payload.politicas_aceptadas || new Date().toISOString(),

                peque_nombre: payload.peque_nombre,
                peque_nacimiento: payload.peque_nacimiento,
                peque_edad: typeof calcularEdadPeque === 'function' ? (calcularEdadPeque(payload.peque_nacimiento) || null) : null,
                alergias: payload.alergias,
                condicion_medica: payload.condicion,
                salud_actual: payload.salud,
                preferencias: payload.preferencias,

                peque_nombre_2: payload.peque_nombre_2,
                peque_nacimiento_2: payload.peque_nac_2,
                peque_edad_2: (payload.peque_nac_2 && typeof calcularEdadPeque === 'function') ? (calcularEdadPeque(payload.peque_nac_2) || null) : null,
                alergias_2: payload.alergias_2,
                condicion_medica_2: payload.condicion_2,
                salud_actual_2: payload.salud_2,
                preferencias_2: payload.preferencias_2,

                peque_nombre_3: payload.peque_nombre_3,
                peque_nacimiento_3: payload.peque_nac_3,
                peque_edad_3: (payload.peque_nac_3 && typeof calcularEdadPeque === 'function') ? (calcularEdadPeque(payload.peque_nac_3) || null) : null,
                alergias_3: payload.alergias_3,
                condicion_medica_3: payload.condicion_3,
                salud_actual_3: payload.salud_3,
                preferencias_3: payload.preferencias_3,

                actualizado_en: new Date().toISOString()
            };

            const { error: supaErr } = await client
                .from('clientes')
                .upsert(supaPayload, { onConflict: 'email' });

            if (supaErr) {
                console.error("❌ Error guardando cliente en Supabase:", supaErr);
                throw new Error(supaErr.message);
            }
            console.log("✅ [Perfil Cliente] Guardado en tabla clientes de Supabase exitosamente.");
        } else {
            await api('updatePerfilCliente', payload);
        }

        CACHE_CLIENTE.profile = null; // Limpiar caché para forzar recarga
        mostrarToast('Perfil guardado con éxito ✨');

        // Cerrar formulario y regresar a perfil
        const o = document.getElementById('cliente-onboarding');
        if (o) o.style.display = 'none';
        irVista('perfil');
    } catch (e) {
        console.error("Error en guardarRegistroCompleto:", e);
        mostrarToast('Error: ' + e.message);
    } finally {
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}
window.guardarRegistroCompleto = guardarRegistroCompleto;

function toggleMultiPeque() {
    const s2 = document.getElementById('section-peque-2');
    const s3 = document.getElementById('section-peque-3');
    const btn = document.getElementById('btn-agregar-peque');

    const s2Visible = s2 && s2.style.display !== 'none';
    const s3Visible = s3 && s3.style.display !== 'none';

    if (!s2Visible) {
        if (s2) s2.style.display = 'block';
        if (btn) btn.style.display = 'block';
    } else if (!s3Visible) {
        if (s3) s3.style.display = 'block';
        if (btn) btn.style.display = 'none'; // Máximo 3
    }
}
window.toggleMultiPeque = toggleMultiPeque;

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

function formatearFechaElegante(fechaStr) {
    if (!fechaStr) return '—';
    try {
        let d;
        if (fechaStr instanceof Date) {
            d = fechaStr;
        } else if (typeof fechaStr === 'string') {
            const limpio = fechaStr.trim();
            if (!limpio) return '—';
            // Manejo robusto de formatos YYYY-MM-DD para evitar desfase de zona horaria (UTC-6)
            const partes = limpio.split(/[-/T ]/);
            if (partes.length >= 3) {
                if (partes[0].length === 4) {
                    d = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
                } else if (partes[2].length === 4) {
                    d = new Date(parseInt(partes[2], 10), parseInt(partes[1], 10) - 1, parseInt(partes[0], 10));
                } else {
                    d = new Date(limpio);
                }
            } else {
                d = new Date(limpio);
            }
        } else {
            d = new Date(fechaStr);
        }
        if (isNaN(d.getTime())) return fechaStr;

        const opciones = { day: '2-digit', month: 'long', year: 'numeric' };
        return d.toLocaleDateString('es-MX', opciones);
    } catch (e) {
        return fechaStr;
    }
}

async function cargarPerfil(force = false) {
    try {
        let perf = (!force && CACHE_CLIENTE.profile) ? CACHE_CLIENTE.profile : null;
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

        // 🚀 PASO 1: LEER PERFIL DIRECTAMENTE DESDE SUPABASE (Instantáneo)
        if (!perf && client && SESION.email) {
            try {
                if (!SESION.cliente && !SESION.admin && !SESION.supervision) {
                    // Consulta a la tabla 'nannys'
                    const { data: supaNanny, error: nannyErr } = await client
                        .from('nannys')
                        .select('*')
                        .eq('email', SESION.email)
                        .maybeSingle();

                    if (supaNanny) {
                        console.log("⚡ [Perfil Supabase] Perfil de Nanny cargado directamente desde Supabase.");
                        perf = {
                            email: supaNanny.email,
                            nombre: supaNanny.nombre || SESION.email.split('@')[0],
                            rol: supaNanny.rol || 'nanny',
                            isNanny: true,
                            telefono: supaNanny.telefono,
                            teléfono: supaNanny.telefono,
                            direccion: supaNanny.direccion,
                            emergencia: supaNanny.emergencia,
                            'no._de_emergencia': supaNanny.emergencia,
                            ubicacion: supaNanny.ubicacion,
                            ubicación: supaNanny.ubicacion,
                            ciudad: supaNanny.ciudad,
                            foto: supaNanny.foto,
                            imagen: supaNanny.foto,
                            lat: supaNanny.lat,
                            lng: supaNanny.lng
                        };
                    }
                } else if (SESION.cliente) {
                    // Consulta a la tabla 'clientes'
                    const { data: supaCliente, error: clientErr } = await client
                        .from('clientes')
                        .select('*')
                        .eq('email', SESION.email)
                        .maybeSingle();

                    if (supaCliente) {
                        console.log("⚡ [Perfil Supabase] Perfil de Cliente cargado directamente desde Supabase.");
                        perf = {
                            email: supaCliente.email,
                            nombre: supaCliente.nombre || SESION.email.split('@')[0],
                            nombre_del_cliente: supaCliente.nombre,
                            rol: supaCliente.rol || 'cliente',
                            isNanny: false,
                            telefono: supaCliente.telefono,
                            teléfono: supaCliente.telefono,
                            direccion: supaCliente.direccion,
                            emergencia: supaCliente.emergencia,
                            'no._de_emergencia': supaCliente.emergencia,
                            'no. de emergencia': supaCliente.emergencia,
                            ubicacion: supaCliente.ubicacion,
                            ubicación: supaCliente.ubicacion,
                            'no. de mascotas': supaCliente.mascotas,
                            'no._de_mascotas': supaCliente.mascotas,
                            'políticas_de_contratación': supaCliente.politicas_contratacion,
                            foto: supaCliente.foto,
                            imagen: supaCliente.foto,
                            lat: supaCliente.lat,
                            lng: supaCliente.lng,

                            // Peque 1
                            nombre_del_peque: supaCliente.peque_nombre,
                            peque_nombre: supaCliente.peque_nombre,
                            fecha_de_nacimiento: supaCliente.peque_nacimiento,
                            peque_nacimiento: supaCliente.peque_nacimiento,
                            edad_del_peque: supaCliente.peque_edad,
                            peque_edad: supaCliente.peque_edad,
                            alergias: supaCliente.alergias,
                            condicion_medica: supaCliente.condicion_medica,
                            condicion: supaCliente.condicion_medica,
                            'condición_médica_o_especificaciones_adicionales': supaCliente.condicion_medica,
                            salud_actual: supaCliente.salud_actual,
                            salud: supaCliente.salud_actual,
                            estado_de_sal_actual: supaCliente.salud_actual,
                            estado_de_salud_actual: supaCliente.salud_actual,
                            preferencias: supaCliente.preferencias,
                            preferencias_o_actividades_favoritas: supaCliente.preferencias,

                            // Peque 2
                            nombre_del_peque_2: supaCliente.peque_nombre_2,
                            peque_nombre_2: supaCliente.peque_nombre_2,
                            fecha_de_nacimiento_2: supaCliente.peque_nacimiento_2,
                            peque_nacimiento_2: supaCliente.peque_nacimiento_2,
                            peque_nac_2: supaCliente.peque_nacimiento_2,
                            edad_del_peque_2: supaCliente.peque_edad_2,
                            peque_edad_2: supaCliente.peque_edad_2,
                            alergias_2: supaCliente.alergias_2,
                            condicion_medica_2: supaCliente.condicion_medica_2,
                            condicion_2: supaCliente.condicion_medica_2,
                            'condición_médica_o_especificaciones_adicionales_2': supaCliente.condicion_medica_2,
                            salud_actual_2: supaCliente.salud_actual_2,
                            salud_2: supaCliente.salud_actual_2,
                            estado_de_salud_actual_2: supaCliente.salud_actual_2,
                            preferencias_2: supaCliente.preferencias_2,
                            preferencias_o_actividades_favoritas_2: supaCliente.preferencias_2,

                            // Peque 3
                            nombre_del_peque_3: supaCliente.peque_nombre_3,
                            peque_nombre_3: supaCliente.peque_nombre_3,
                            fecha_de_nacimiento_3: supaCliente.peque_nacimiento_3,
                            peque_nacimiento_3: supaCliente.peque_nacimiento_3,
                            peque_nac_3: supaCliente.peque_nacimiento_3,
                            edad_del_peque_3: supaCliente.peque_edad_3,
                            peque_edad_3: supaCliente.peque_edad_3,
                            alergias_3: supaCliente.alergias_3,
                            condicion_medica_3: supaCliente.condicion_medica_3,
                            condicion_3: supaCliente.condicion_medica_3,
                            'condición_médica_o_especificaciones_adicionales_3': supaCliente.condicion_medica_3,
                            salud_actual_3: supaCliente.salud_actual_3,
                            salud_3: supaCliente.salud_actual_3,
                            estado_de_salud_actual_3: supaCliente.salud_actual_3,
                            preferencias_3: supaCliente.preferencias_3,
                            preferencias_o_actividades_favoritas_3: supaCliente.preferencias_3
                        };
                    }
                }
            } catch (supaErr) {
                console.warn("⚠️ [Supabase Perfil] Error leyendo desde Supabase:", supaErr.message);
            }
        }

        // 🔄 PASO 2: Fallback tradicional a Google Sheets si no se encontró en Supabase y existe token de sesión
        if (!perf) {
            const hasToken = !!(SESION.token || localStorage.getItem('token') || localStorage.getItem('session_token'));
            if (hasToken) {
                try {
                    console.log("ℹ️ [Perfil Fallback] Consultando perfil en backend tradicional...");
                    perf = await api('getProfile', { email: SESION.email });
                } catch (apiErr) {
                    console.warn("⚠️ [Perfil Fallback] No se pudo obtener perfil tradicional:", apiErr.message);
                }
            }

            if (!perf) {
                perf = {
                    email: SESION.email,
                    nombre: SESION.nombre || SESION.email.split('@')[0],
                    rol: SESION.cliente ? 'cliente' : 'nanny',
                    ciudad: SESION.ciudad || ''
                };
            }
        }

        if (perf) {
            CACHE_CLIENTE.profile = perf; // Guardar en caché para evitar re-carga en el dashboard
            //Header
            if (document.getElementById('perfil_nombre_header')) {
                document.getElementById('perfil_nombre_header').textContent = perf.nombre || 'Mi perfil';
            }

            const rolHeader = document.getElementById('perfil_rol_header');
            if (rolHeader) {
                const mapLabels = {
                    'mama': 'Mamá amorosa:',
                    'papa': 'Papá amoroso:',
                    'Familiar': 'Familiar amorosa:'
                };
                const label = mapLabels[perf.rol] || '';
                if (label) {
                    rolHeader.textContent = label;
                    rolHeader.style.display = 'block';
                } else {
                    rolHeader.style.display = 'none';
                }
            }



            //Detectar rol REAL desde el backend para visibilidad
            //Detectar rol REAL desde el backend para visibilidad
            const esNanny = !!perf.isNanny;
            const seccionPeques = document.getElementById('perfil-peques-container');
            const itemMascotas = document.getElementById('perfil_mascotas_gral')?.closest('.profile-info-item');
            const itemPoliticas = document.getElementById('perfil-politicas-container');
            const avatar = document.querySelector('.profile-avatar');

            if (esNanny) {
                if (seccionPeques) seccionPeques.style.display = 'none';
                if (itemMascotas) itemMascotas.style.display = 'none';
                if (itemPoliticas) itemPoliticas.style.display = 'none';
                if (avatar) avatar.textContent = '🍼';

                const btnEditar = document.querySelector('.profile-actions .btn-primary');
                if (btnEditar) btnEditar.style.display = 'none';

                // Mostrar botón de credencial
                const containerCredencial = document.getElementById('perfil-nanny-credential-container');
                if (containerCredencial) containerCredencial.style.display = 'flex';
                const emailContainer = document.getElementById('perfil-email-container');
                if (emailContainer) emailContainer.classList.remove('full');

                // --- NUEVO: Cargar Estadísticas Nanny Star Premium (Ocultado temporalmente) ---
                const containerStar = document.getElementById('perfil-nanny-star-container');
                if (containerStar) {
                    containerStar.style.display = 'none';
                    // if (typeof initNannyStarPerfil === 'function') {
                    //     initNannyStarPerfil();
                    // }
                }
            } else {
                if (seccionPeques) seccionPeques.style.display = 'block';
                if (itemMascotas) itemMascotas.style.display = 'block';
                // Para clientes, mostrar políticas
                if (itemPoliticas) itemPoliticas.style.display = 'block';
                if (avatar) avatar.textContent = '👨‍👩‍👧‍👦';

                const btnEditar = document.querySelector('.profile-actions .btn-primary');
                if (btnEditar) btnEditar.style.display = 'block';

                // Mostrar botón de credencial para clientes (Familia Activa)
                const containerCredencial = document.getElementById('perfil-nanny-credential-container');
                if (containerCredencial) containerCredencial.style.display = 'flex';

                const emailContainer = document.getElementById('perfil-email-container');
                if (emailContainer) emailContainer.classList.remove('full');
            }

            //Contacto
            if (document.getElementById('perfil_tel')) document.getElementById('perfil_tel').textContent = perf.telefono || perf.teléfono || '—';
            if (document.getElementById('perfil_emergencia')) {
                document.getElementById('perfil_emergencia').textContent = perf.emergencia || perf['no._de_emergencia'] || '—';
            }
            if (document.getElementById('perfil_email')) {
                document.getElementById('perfil_email').textContent = perf.email || SESION.email;
            }
            if (document.getElementById('perfil_direccion')) {
                document.getElementById('perfil_direccion').textContent = perf.direccion || '—';
            }

            const linkUbic = document.getElementById('perfil_ubicacion');
            if (linkUbic) {
                const url = perf.ubicación || perf.ubicacion;
                if (url && url.startsWith('http')) {
                    linkUbic.href = url;
                    linkUbic.style.display = 'inline-block';
                } else {
                    linkUbic.style.display = 'none';
                }
            }

            // Generar y actualizar el QR de recomendación (usando qrcode.js local)
            const qrContainer = document.getElementById('perfil-qr-container');
            if (qrContainer) {
                qrContainer.innerHTML = ''; // Limpiar previo
                const nombreUsuario = (perf.nombre || '').trim();
                let msg = '';
                if (esNanny) {
                    msg = `Hola. La niñera ${nombreUsuario} me recomendó sus servicios y quisiera saber más al respecto`;
                } else {
                    msg = `Hola. La familia ${nombreUsuario} me recomendó sus servicios y quisiera saber más al respecto`;
                }
                const phone = '522224021886'; // WhatsApp de la empresa (México: +52 2224021886)
                const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

                try {
                    if (typeof QRCode !== 'undefined') {
                        new QRCode(qrContainer, {
                            text: waLink,
                            width: 150,
                            height: 150,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    } else {
                        console.warn("Librería QRCode no disponible.");
                    }
                } catch (err) {
                    console.warn("Error al generar el QR local:", err);
                }
            }

            if (esNanny && !SESION.admin && !SESION.supervision) {
                if (window.NannyPerfil && typeof window.NannyPerfil.cargarDatos === 'function') {
                    window.NannyPerfil.cargarDatos();
                    if (typeof window.NannyPerfil.generarQRRecomendacion === 'function') {
                        window.NannyPerfil.generarQRRecomendacion();
                    }
                }
                verificarDatosFaltantesNinera(perf);
                return;
            }

            //Peque 1 (Solo para clientes)
            const nombreP1 = perf.nombre_del_peque || perf.peque_nombre;
            const nacP1 = perf.fecha_de_nacimiento || perf.peque_nacimiento;
            const edad1 = typeof calcularEdadPeque === 'function' && nacP1
                ? (calcularEdadPeque(nacP1) || perf.edad_del_peque || perf.peque_edad || '—')
                : (perf.edad_del_peque || perf.peque_edad || '—');

            if (document.getElementById('perfil_peque')) document.getElementById('perfil_peque').textContent = nombreP1 || '—';
            if (document.getElementById('perfil_nac_peque')) document.getElementById('perfil_nac_peque').textContent = formatearFechaElegante(nacP1);
            if (document.getElementById('perfil_edad_peque')) document.getElementById('perfil_edad_peque').textContent = edad1;
            if (document.getElementById('perfil_alergias')) document.getElementById('perfil_alergias').textContent = perf.alergias || '—';
            if (document.getElementById('perfil_condicion')) document.getElementById('perfil_condicion').textContent = perf.condicion_medica || perf['condición_médica_o_especificaciones_adicionales'] || perf.condicion || '—';
            if (document.getElementById('perfil_salud')) document.getElementById('perfil_salud').textContent = perf.salud_actual || perf.estado_de_salud_actual || perf.estado_de_sal_actual || perf.salud || '—';
            if (document.getElementById('perfil_preferencias')) document.getElementById('perfil_preferencias').textContent = perf.preferencias || perf.preferencias_o_actividades_favoritas || '—';
            if (document.getElementById('perfil_mascotas_gral')) document.getElementById('perfil_mascotas_gral').textContent = perf['no. de mascotas'] || perf['no._de_mascotas'] || perf.mascotas || '—';

            // Formatear fecha de políticas si existe
            const politicas = perf['políticas_de_contratación'] || '';
            if (document.getElementById('perfil_politicas')) {
                if (politicas && politicas !== '—') {
                    // Si ya está en formato legible (contiene /), mostrarlo tal cual
                    if (politicas.includes('/')) {
                        document.getElementById('perfil_politicas').textContent = politicas;
                    } else {
                        // Si está en formato ISO, convertirlo
                        try {
                            const fecha = new Date(politicas);
                            if (!isNaN(fecha)) {
                                const formatted = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()} ${fecha.getHours()}:${String(fecha.getMinutes()).padStart(2, '0')}:${String(fecha.getSeconds()).padStart(2, '0')}`;
                                document.getElementById('perfil_politicas').textContent = formatted;
                            } else {
                                document.getElementById('perfil_politicas').textContent = politicas;
                            }
                        } catch (e) {
                            document.getElementById('perfil_politicas').textContent = politicas;
                        }
                    }
                } else {
                    document.getElementById('perfil_politicas').textContent = '—';
                }
            }

            //Peque 2
            const card2 = document.getElementById('perfil-peque-2');
            const tieneP2 = perf.nombre_del_peque_2 || perf.peque_nombre_2;
            if (tieneP2) {
                card2.style.display = 'block';
                const nacP2 = perf.fecha_de_nacimiento_2 || perf.peque_nacimiento_2 || perf.peque_nac_2;
                const edad2 = typeof calcularEdadPeque === 'function' && nacP2
                    ? (calcularEdadPeque(nacP2) || perf.edad_del_peque_2 || perf.peque_edad_2 || '—')
                    : (perf.edad_del_peque_2 || perf.peque_edad_2 || '—');

                if (document.getElementById('perfil_peque_2')) document.getElementById('perfil_peque_2').textContent = tieneP2;
                if (document.getElementById('perfil_nac_peque_2')) document.getElementById('perfil_nac_peque_2').textContent = formatearFechaElegante(nacP2);
                if (document.getElementById('perfil_edad_peque_2')) document.getElementById('perfil_edad_peque_2').textContent = edad2;
                if (document.getElementById('perfil_alergias_2')) document.getElementById('perfil_alergias_2').textContent = perf.alergias_2 || '—';
                if (document.getElementById('perfil_condicion_2')) document.getElementById('perfil_condicion_2').textContent = perf.condicion_medica_2 || perf['condición_médica_o_especificaciones_adicionales_2'] || perf.condicion_2 || '—';
                if (document.getElementById('perfil_salud_2')) document.getElementById('perfil_salud_2').textContent = perf.salud_actual_2 || perf.estado_de_salud_actual_2 || perf.salud_2 || '—';
                if (document.getElementById('perfil_preferencias_2')) document.getElementById('perfil_preferencias_2').textContent = perf.preferencias_2 || perf.preferencias_o_actividades_favoritas_2 || '—';
            } else {
                card2.style.display = 'none';
            }

            //Peque 3
            const card3 = document.getElementById('perfil-peque-3');
            const tieneP3 = perf.nombre_del_peque_3 || perf.peque_nombre_3;
            if (tieneP3) {
                card3.style.display = 'block';
                const nacP3 = perf.fecha_de_nacimiento_3 || perf.peque_nacimiento_3 || perf.peque_nac_3;
                const edad3 = typeof calcularEdadPeque === 'function' && nacP3
                    ? (calcularEdadPeque(nacP3) || perf.edad_del_peque_3 || perf.peque_edad_3 || '—')
                    : (perf.edad_del_peque_3 || perf.peque_edad_3 || '—');

                if (document.getElementById('perfil_peque_3')) document.getElementById('perfil_peque_3').textContent = tieneP3;
                if (document.getElementById('perfil_nac_peque_3')) document.getElementById('perfil_nac_peque_3').textContent = formatearFechaElegante(nacP3);
                if (document.getElementById('perfil_edad_peque_3')) document.getElementById('perfil_edad_peque_3').textContent = edad3;
                if (document.getElementById('perfil_alergias_3')) document.getElementById('perfil_alergias_3').textContent = perf.alergias_3 || '—';
                if (document.getElementById('perfil_condicion_3')) document.getElementById('perfil_condicion_3').textContent = perf.condicion_medica_3 || perf['condición_médica_o_especificaciones_adicionales_3'] || perf.condicion_3 || '—';
                if (document.getElementById('perfil_salud_3')) document.getElementById('perfil_salud_3').textContent = perf.salud_actual_3 || perf.estado_de_salud_actual_3 || perf.salud_3 || '—';
                if (document.getElementById('perfil_preferencias_3')) document.getElementById('perfil_preferencias_3').textContent = perf.preferencias_3 || perf.preferencias_o_actividades_favoritas_3 || '—';
            } else {
                card3.style.display = 'none';
            }

            if (window.ClientePerfil && typeof window.ClientePerfil.cargarDatos === 'function') {
                window.ClientePerfil.cargarDatos();
                if (typeof window.ClientePerfil.generarQRRecomendacion === 'function') {
                    window.ClientePerfil.generarQRRecomendacion();
                }
            }
        }
    } catch (e) {
        console.error("Error al cargar perfil:", e);
    }
}
window.cargarPerfil = cargarPerfil;

/**
 * Actualiza el acumulado de horas de la niñera en la sección "Nanny star"
 */
async function refreshNannyStar() {
    const btn = document.getElementById('btnRefreshNannyStar');
    const horasEl = document.getElementById('perfil_nanny_star_horas');
    if (!btn || !horasEl) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '🔄 Actualizando...';

    try {
        const res = await api('getNannyStarStats', { email: SESION.email });
        const horas = (res && typeof res === 'object') ? res.totalHoras : res;
        horasEl.textContent = horas || 0;
        mostrarToast('⭐ Acumulado de horas actualizado.');
    } catch (err) {
        console.error(err);
        mostrarToast('❌ Error al actualizar horas.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}
window.refreshNannyStar = refreshNannyStar;


/**
 * Cambia sub-vistas dentro del panel de supervisión
 */
function irSubVistaSupervision(subvista) {
    const vAct = document.getElementById('subvista-supervision-actividades');
    const vStar = document.getElementById('subvista-supervision-nannystar');
    const vPlan = document.getElementById('subvista-supervision-plantilla');
    const vPts = document.getElementById('subvista-supervision-puntosstar');
    const vAvanceEst = document.getElementById('subvista-supervision-avance-estimulacion');

    if (vAct) vAct.style.display = 'none';
    if (vStar) vStar.style.display = 'none';
    if (vPlan) vPlan.style.display = 'none';
    if (vPts) vPts.style.display = 'none';
    if (vAvanceEst) vAvanceEst.style.display = 'none';

    if (subvista === 'actividades') {
        if (vAct) vAct.style.display = 'block';
        if (typeof suscribirRealtimePortalServicios === 'function') suscribirRealtimePortalServicios();
        if (typeof cargarResumenPlaneaciones === 'function') cargarResumenPlaneaciones(true);
        if (typeof cargarResumenBitacoras === 'function') cargarResumenBitacoras(true);
    } else if (subvista === 'nannystar') {
        if (vStar) vStar.style.display = 'block';
    } else if (subvista === 'plantilla') {
        if (vPlan) vPlan.style.display = 'block';
        if (typeof cargarPlantillaSupervision === 'function') {
            cargarPlantillaSupervision();
        }
    } else if (subvista === 'puntosstar') {
        if (vPts) vPts.style.display = 'block';
        if (typeof inicializarPuntosStar === 'function') {
            inicializarPuntosStar();
        }
    } else if (subvista === 'avance-estimulacion') {
        if (vAvanceEst) vAvanceEst.style.display = 'block';
        if (typeof cargarAvanceEstimulacionSupervision === 'function') {
            cargarAvanceEstimulacionSupervision();
        }
    }

    // Actualizar botones nav
    document.querySelectorAll('#nav-supervision button').forEach(b => b.classList.remove('activo', 'active'));
    const btn = document.getElementById('snav-' + subvista);
    if (btn) btn.classList.add('activo', 'active');
}
window.irSubVistaSupervision = irSubVistaSupervision;

/**
 * Carga el leaderboard de Nanny Star para supervisores
 */
async function cargarLeaderboardSupervision() {
    const btn = document.getElementById('btnRefreshLeaderboard');
    const container = document.getElementById('leaderboard-container');
    if (!btn || !container) return;

    btn.disabled = true;
    btn.innerHTML = '✨ Cargando ranking...';

    const desde = document.getElementById('nannystar-desde')?.value || '';
    const hasta = document.getElementById('nannystar-hasta')?.value || '';

    try {
        const data = await api('getAllNanniesStarStats', { desde, hasta });
        renderNannyStarLeaderboard(data);
    } catch (err) {
        console.error(err);
        mostrarToast('❌ Error al cargar ranking.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '✨ Cargar información';
    }
}
window.cargarLeaderboardSupervision = cargarLeaderboardSupervision;

/**
 * Renderiza el leaderboard con un diseño premium
 */
function renderNannyStarLeaderboard(data) {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="no-data">No hay datos acumulados actualmente.</div>';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '15px';
        return;
    }

    // Limpiar comportamiento flex del contenedor padre para que las columnas manejen el layout
    container.style.display = 'block';

    // 1) Ordenar por Horas (Columna Izquierda)
    const porHoras = [...data].sort((a, b) => b.horas - a.horas);

    // 2) Ordenar por Servicios Totales (Columna Derecha)
    const porServicios = [...data].sort((a, b) => b.totalServicios - a.totalServicios);

    let htmlHoras = '';
    porHoras.forEach((item, index) => {
        const position = index + 1;
        let medal = '';
        if (position === 1) medal = '🥇';
        else if (position === 2) medal = '🥈';
        else if (position === 3) medal = '🥉';
        else medal = `<span style="color: var(--text-muted); font-weight: 800;">#${position}</span>`;

        const borderColor = position <= 3 ? 'var(--pink-main)' : 'rgba(0,0,0,0.05)';
        const shadow = position <= 3 ? '0 4px 12px rgba(232, 76, 154, 0.12)' : 'none';

        htmlHoras += `
            <div class="card" style="display: flex; align-items: center; padding: 12px 15px; border-left: 5px solid ${borderColor}; box-shadow: ${shadow}; animation: fadeInPremium 0.4s ease-out forwards; animation-delay: ${index * 0.03}s;">
                <div style="width: 30px; font-size: 16px; display: flex; justify-content: center; align-items: center; margin-right: 10px;">
                    ${medal}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 700; color: var(--text-main); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.nombre}</div>
                    <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Nanny Star</div>
                </div>
                <div style="text-align: right; margin-left: 10px;">
                    <div style="font-size: 20px; font-weight: 800; color: var(--blue-main); line-height: 1;">${item.horas.toFixed(1)}</div>
                    <div style="font-size: 9px; font-weight: 700; color: var(--text-muted);">HRS</div>
                </div>
            </div>
        `;
    });

    let htmlServicios = '';
    porServicios.forEach((item, index) => {
        const position = index + 1;
        let medal = '';
        if (position === 1) medal = '🥇';
        else if (position === 2) medal = '🥈';
        else if (position === 3) medal = '🥉';
        else medal = `<span style="color: var(--text-muted); font-weight: 800;">#${position}</span>`;

        const borderColor = position <= 3 ? 'var(--blue-main)' : 'rgba(0,0,0,0.05)';
        const shadow = position <= 3 ? '0 4px 12px rgba(29, 78, 216, 0.12)' : 'none';

        htmlServicios += `
            <div class="card" style="display: flex; align-items: center; padding: 12px 15px; border-left: 5px solid ${borderColor}; box-shadow: ${shadow}; animation: fadeInPremium 0.4s ease-out forwards; animation-delay: ${index * 0.03}s;">
                <div style="width: 30px; font-size: 16px; display: flex; justify-content: center; align-items: center; margin-right: 10px;">
                    ${medal}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 700; color: var(--text-main); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.nombre}</div>
                    <div style="font-size: 11px; color: var(--text-muted); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${item.fijos} fijos, ${item.eventuales} eventuales
                    </div>
                </div>
                <div style="text-align: right; margin-left: 10px;">
                    <div style="font-size: 20px; font-weight: 800; color: var(--pink-main); line-height: 1;">${item.totalServicios}</div>
                    <div style="font-size: 9px; font-weight: 700; color: var(--text-muted);">SERV</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="leaderboard-columns" style="display: flex; gap: 20px; flex-wrap: wrap;">
            <!-- Columna Izquierda: Horas -->
            <div class="leaderboard-column" style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 8px;">
                <h4 style="font-family: 'DM Serif Display', serif; color: var(--pink-main); font-size: 16px; margin: 0 0 10px 0; border-bottom: 2px dashed rgba(232, 76, 154, 0.15); padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>⏱️</span> Top Horas de Servicio
                </h4>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${htmlHoras}
                </div>
            </div>
            <!-- Columna Derecha: Servicios -->
            <div class="leaderboard-column" style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 8px;">
                <h4 style="font-family: 'DM Serif Display', serif; color: var(--blue-main); font-size: 16px; margin: 0 0 10px 0; border-bottom: 2px dashed rgba(29, 78, 216, 0.15); padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>💼</span> Top Servicios Tomados
                </h4>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${htmlServicios}
                </div>
            </div>
        </div>
    `;
}
window.renderNannyStarLeaderboard = renderNannyStarLeaderboard;

async function editarPerfilCliente() {
    // Primero cambiar a vista-cliente para acceder a los elementos
    const vistaCliente = document.getElementById('vista-cliente');
    const vistaPerfil = document.getElementById('vista-perfil');

    if (vistaPerfil) vistaPerfil.classList.remove('activa');
    if (vistaCliente) vistaCliente.classList.add('activa');

    // Luego mostrar el formulario de onboarding
    const d = document.getElementById('cliente-dashboard');
    const o = document.getElementById('cliente-onboarding');
    if (d) d.style.display = 'none';
    if (o) o.style.display = 'block';

    // Descongelar y habilitar inmediatamente el botón de guardar
    const btnGuardar = document.getElementById('btnGuardarCliente');
    if (btnGuardar) {
        btnGuardar.textContent = 'Guardar y Continuar';
        btnGuardar.disabled = false;
    }

    try {
        let perf = null;

        // 1. Intentar cargar directamente desde Supabase
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client && SESION && SESION.email) {
            try {
                const { data: supaCliente, error: supaErr } = await client
                    .from('clientes')
                    .select('*')
                    .eq('email', SESION.email)
                    .maybeSingle();

                if (!supaErr && supaCliente) {
                    console.log("⚡ [Editar Perfil] Perfil obtenido desde Supabase para:", SESION.email);
                    perf = {
                        nombre: supaCliente.nombre,
                        rol: supaCliente.rol,
                        direccion: supaCliente.direccion,
                        ubicacion: supaCliente.ubicacion,
                        telefono: supaCliente.telefono,
                        'no._de_emergencia': supaCliente.emergencia,
                        'no._de_mascotas': supaCliente.mascotas,
                        // Peque 1
                        nombre_del_peque: supaCliente.peque_nombre,
                        peque_nombre: supaCliente.peque_nombre,
                        fecha_de_nacimiento: supaCliente.peque_nacimiento,
                        peque_nacimiento: supaCliente.peque_nacimiento,
                        edad_del_peque: supaCliente.peque_edad,
                        peque_edad: supaCliente.peque_edad,
                        alergias: supaCliente.alergias,
                        condicion_medica: supaCliente.condicion_medica,
                        condicion: supaCliente.condicion_medica,
                        'condición_médica_o_especificaciones_adicionales': supaCliente.condicion_medica,
                        salud_actual: supaCliente.salud_actual,
                        salud: supaCliente.salud_actual,
                        estado_de_sal_actual: supaCliente.salud_actual,
                        estado_de_salud_actual: supaCliente.salud_actual,
                        preferencias: supaCliente.preferencias,
                        preferencias_o_actividades_favoritas: supaCliente.preferencias,
                        'políticas_de_contratación': supaCliente.politicas_contratacion,

                        // Peque 2
                        nombre_del_peque_2: supaCliente.peque_nombre_2,
                        peque_nombre_2: supaCliente.peque_nombre_2,
                        fecha_de_nacimiento_2: supaCliente.peque_nacimiento_2,
                        peque_nacimiento_2: supaCliente.peque_nacimiento_2,
                        peque_nac_2: supaCliente.peque_nacimiento_2,
                        edad_del_peque_2: supaCliente.peque_edad_2,
                        peque_edad_2: supaCliente.peque_edad_2,
                        alergias_2: supaCliente.alergias_2,
                        condicion_medica_2: supaCliente.condicion_medica_2,
                        condicion_2: supaCliente.condicion_medica_2,
                        'condición_médica_o_especificaciones_adicionales_2': supaCliente.condicion_medica_2,
                        salud_actual_2: supaCliente.salud_actual_2,
                        salud_2: supaCliente.salud_actual_2,
                        estado_de_salud_actual_2: supaCliente.salud_actual_2,
                        preferencias_2: supaCliente.preferencias_2,
                        preferencias_o_actividades_favoritas_2: supaCliente.preferencias_2,

                        // Peque 3
                        nombre_del_peque_3: supaCliente.peque_nombre_3,
                        peque_nombre_3: supaCliente.peque_nombre_3,
                        fecha_de_nacimiento_3: supaCliente.peque_nacimiento_3,
                        peque_nacimiento_3: supaCliente.peque_nacimiento_3,
                        peque_nac_3: supaCliente.peque_nacimiento_3,
                        edad_del_peque_3: supaCliente.peque_edad_3,
                        peque_edad_3: supaCliente.peque_edad_3,
                        alergias_3: supaCliente.alergias_3,
                        condicion_medica_3: supaCliente.condicion_medica_3,
                        condicion_3: supaCliente.condicion_medica_3,
                        'condición_médica_o_especificaciones_adicionales_3': supaCliente.condicion_medica_3,
                        salud_actual_3: supaCliente.salud_actual_3,
                        salud_3: supaCliente.salud_actual_3,
                        estado_de_salud_actual_3: supaCliente.salud_actual_3,
                        preferencias_3: supaCliente.preferencias_3,
                        preferencias_o_actividades_favoritas_3: supaCliente.preferencias_3
                    };
                }
            } catch (errSup) {
                console.warn("No se pudo leer de Supabase en editarPerfilCliente:", errSup);
            }
        }

        // 2. Si no hubo perfil en Supabase, recurrir a GAS
        if (!perf) {
            try {
                perf = await api('getProfile', { email: SESION.email });
            } catch (errApi) {
                console.warn("No se pudo obtener perfil de GAS en editarPerfilCliente:", errApi);
            }
        }

        if (perf) {
            // Datos comunes
            if (document.getElementById('reg_nombre')) {
                const inputNombre = document.getElementById('reg_nombre');
                inputNombre.value = perf.nombre || '';
                if (perf.nombre && perf.nombre.trim() !== "") {
                    inputNombre.readOnly = true;
                    inputNombre.style.background = "#f1f5f9";
                    inputNombre.title = "El nombre no puede ser modificado una vez registrado.";
                } else {
                    inputNombre.readOnly = false;
                    inputNombre.style.background = "";
                    inputNombre.title = "";
                }
            }
            if (document.getElementById('reg_direccion')) document.getElementById('reg_direccion').value = perf.direccion || '';
            if (document.getElementById('reg_ubicacion')) document.getElementById('reg_ubicacion').value = perf.ubicación || perf.ubicacion || '';
            if (document.getElementById('reg_tel')) document.getElementById('reg_tel').value = perf.telefono || perf.teléfono || '';
            if (document.getElementById('reg_emergencia')) document.getElementById('reg_emergencia').value = perf['no._de_emergencia'] || '';
            if (document.getElementById('reg_mascotas')) document.getElementById('reg_mascotas').value = perf['no._de_mascotas'] || perf.mascotas || '';

            // Helper para fechas en inputs
            const setFecha = (id, fecha) => {
                if (!fecha) return;
                try {
                    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}/.test(fecha.trim())) {
                        document.getElementById(id).value = fecha.trim().slice(0, 10);
                        return;
                    }
                    const d = new Date(fecha);
                    if (!isNaN(d)) document.getElementById(id).value = d.toISOString().split('T')[0];
                    else document.getElementById(id).value = fecha;
                } catch (e) { }
            };

            // Peque 1
            if (document.getElementById('reg_peque_nombre')) document.getElementById('reg_peque_nombre').value = perf.nombre_del_peque || perf.peque_nombre || '';
            setFecha('reg_peque_nac', perf.fecha_de_nacimiento || perf.peque_nacimiento);
            if (typeof actualizarEdadEnFormulario === 'function') actualizarEdadEnFormulario('reg_peque_nac', 'reg_peque_edad_badge');
            if (document.getElementById('reg_alergias')) document.getElementById('reg_alergias').value = perf.alergias || '';
            if (document.getElementById('reg_condicion')) document.getElementById('reg_condicion').value = perf.condicion_medica || perf['condición_médica_o_especificaciones_adicionales'] || perf.condicion || '';
            if (document.getElementById('reg_salud')) document.getElementById('reg_salud').value = perf.salud_actual || perf.estado_de_salud_actual || perf.estado_de_sal_actual || perf.salud || '';
            if (document.getElementById('reg_preferencias')) document.getElementById('reg_preferencias').value = perf.preferencias || perf.preferencias_o_actividades_favoritas || '';

            // Peque 2
            const tieneP2 = perf.nombre_del_peque_2 || perf.peque_nombre_2;
            if (tieneP2) {
                const s2 = document.getElementById('section-peque-2');
                if (s2) s2.style.display = 'block';
                if (document.getElementById('reg_peque_nombre_2')) document.getElementById('reg_peque_nombre_2').value = tieneP2;
                setFecha('reg_peque_nac_2', perf.fecha_de_nacimiento_2 || perf.peque_nacimiento_2 || perf.peque_nac_2);
                if (typeof actualizarEdadEnFormulario === 'function') actualizarEdadEnFormulario('reg_peque_nac_2', 'reg_peque_edad_badge_2');
                if (document.getElementById('reg_alergias_2')) document.getElementById('reg_alergias_2').value = perf.alergias_2 || '';
                if (document.getElementById('reg_condicion_2')) document.getElementById('reg_condicion_2').value = perf.condicion_medica_2 || perf['condición_médica_o_especificaciones_adicionales_2'] || perf.condicion_2 || '';
                if (document.getElementById('reg_salud_2')) document.getElementById('reg_salud_2').value = perf.salud_actual_2 || perf.estado_de_salud_actual_2 || perf.salud_2 || '';
                if (document.getElementById('reg_preferencias_2')) document.getElementById('reg_preferencias_2').value = perf.preferencias_2 || perf.preferencias_o_actividades_favoritas_2 || '';
            } else {
                const s2 = document.getElementById('section-peque-2');
                if (s2) s2.style.display = 'none';
            }

            // Peque 3
            const tieneP3 = perf.nombre_del_peque_3 || perf.peque_nombre_3;
            if (tieneP3) {
                const s3 = document.getElementById('section-peque-3');
                if (s3) s3.style.display = 'block';
                const btnAgregar = document.getElementById('btn-agregar-peque');
                if (btnAgregar) btnAgregar.style.display = 'none';
                if (document.getElementById('reg_peque_nombre_3')) document.getElementById('reg_peque_nombre_3').value = tieneP3;
                setFecha('reg_peque_nac_3', perf.fecha_de_nacimiento_3 || perf.peque_nacimiento_3 || perf.peque_nac_3);
                if (typeof actualizarEdadEnFormulario === 'function') actualizarEdadEnFormulario('reg_peque_nac_3', 'reg_peque_edad_badge_3');
                if (document.getElementById('reg_alergias_3')) document.getElementById('reg_alergias_3').value = perf.alergias_3 || '';
                if (document.getElementById('reg_condicion_3')) document.getElementById('reg_condicion_3').value = perf.condicion_medica_3 || perf['condición_médica_o_especificaciones_adicionales_3'] || perf.condicion_3 || '';
                if (document.getElementById('reg_salud_3')) document.getElementById('reg_salud_3').value = perf.salud_actual_3 || perf.estado_de_salud_actual_3 || perf.salud_3 || '';
                if (document.getElementById('reg_preferencias_3')) document.getElementById('reg_preferencias_3').value = perf.preferencias_3 || perf.preferencias_o_actividades_favoritas_3 || '';
            } else {
                const s3 = document.getElementById('section-peque-3');
                if (s3) s3.style.display = 'none';
                const btnAgregar = document.getElementById('btn-agregar-peque');
                if (btnAgregar && !tieneP3) btnAgregar.style.display = 'block';
            }

            // Verificar políticas
            const politicasAceptadas = perf['políticas_de_contratación'] || perf.politicas_contratacion || '';
            const btnPoliticas = document.getElementById('btn_aceptar_politicas');
            const hiddenPoliticas = document.getElementById('reg_politicas_aceptadas');

            if (politicasAceptadas && politicasAceptadas !== '—') {
                if (hiddenPoliticas) hiddenPoliticas.value = politicasAceptadas;
                if (btnPoliticas) {
                    btnPoliticas.textContent = '✓ Aceptado';
                    btnPoliticas.disabled = true;
                    btnPoliticas.style.background = '#10b981';
                    btnPoliticas.style.cursor = 'not-allowed';
                }
            } else {
                if (hiddenPoliticas) hiddenPoliticas.value = '';
                if (btnPoliticas) {
                    btnPoliticas.textContent = 'Aceptar';
                    btnPoliticas.disabled = false;
                    btnPoliticas.style.background = 'var(--pink-main)';
                    btnPoliticas.style.cursor = 'pointer';
                }
            }

            // Rol
            if (perf.rol) seleccionarRol(perf.rol);
        }
    } catch (e) {
        console.error("Error al prellenar perfil:", e);
    }
}
window.editarPerfilCliente = editarPerfilCliente;

async function cargarServiciosCliente(force = false) {
    const calActual = document.getElementById('cal-cliente-actual');
    const calSig = document.getElementById('cal-cliente-siguiente');
    const msg = document.getElementById('msg-cal-cliente');
    if (!calActual || !calSig) return;

    // Suscribir al realtime de servicios si no está suscrito
    if (typeof suscribirRealtimePortalServicios === 'function') {
        suscribirRealtimePortalServicios();
    }

    // --- FIX: Limpiar caché de bitácoras si es una recarga forzada (botón actualizar) ---
    if (force) {
        BITACORA_CACHE = {};
        console.log('Caché de bitácoras limpiado por actualización forzada');
    }

    if (!force && CACHE_CLIENTE.servicios) {
        renderServiciosCliente(CACHE_CLIENTE.servicios);
        if (msg) msg.textContent = '';
        return;
    }

    if (msg && (!calActual.children.length)) msg.textContent = 'Cargando servicios...';

    let serviciosCargados = false;
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

    if (client) {
        try {
            const hoy = new Date();
            const lunesActual = typeof getMondayISO_Safe === 'function' ? getMondayISO_Safe(hoy) : (() => {
                const d = (hoy.getDay() + 6) % 7;
                const l = new Date(hoy);
                l.setDate(hoy.getDate() - d);
                return l.toISOString().slice(0, 10);
            })();
            const lunesSiguiente = typeof addWeeksToISO_Safe === 'function' ? addWeeksToISO_Safe(lunesActual, 1) : (() => {
                const p = lunesActual.split('-').map(Number);
                const d = new Date(p[0], p[1] - 1, p[2] + 7);
                return d.toISOString().slice(0, 10);
            })();

            // Obtener información de cliente para enriquecer direcciones y contactos
            const mapaClientes = {};
            try {
                let qCli = client.from('clientes').select('*');
                const cleanEmail = (SESION?.email || '').trim().toLowerCase();
                if (cleanEmail) {
                    qCli = qCli.ilike('email', cleanEmail);
                }
                const { data: dbClientes } = await qCli;
                if (dbClientes && Array.isArray(dbClientes)) {
                    dbClientes.forEach(c => {
                        const kEmail = (c.email || '').trim().toLowerCase();
                        const kNom = (c.nombre || '').trim().toLowerCase();
                        const kNomNorm = normalizarTexto(kNom);
                        if (kEmail) mapaClientes[kEmail] = c;
                        if (kNom) mapaClientes[kNom] = c;
                        if (kNomNorm) mapaClientes[kNomNorm] = c;
                    });
                }
            } catch (errClientes) {
                console.warn("[cargarServiciosCliente] Aviso al cargar clientes para mapa:", errClientes);
            }

            // Consultar filas en control_servicios filtradas para el cliente
            let qFilas = client
                .from('control_servicios')
                .select('*');

            const emailCli = (SESION?.email || '').trim().toLowerCase();
            const nomCli = (SESION?.nombre || '').trim().toLowerCase();
            if (emailCli && nomCli) {
                qFilas = qFilas.or(`cliente_email.ilike.${emailCli},cliente_nombre.ilike.%${nomCli}%`);
            } else if (emailCli) {
                qFilas = qFilas.ilike('cliente_email', emailCli);
            } else {
                qFilas = qFilas.in('semana_iso', [lunesActual, lunesSiguiente]);
            }

            const { data: filas, error: errFilas } = await qFilas;

            if (!errFilas && filas) {
                const svcs = transformarFilasControlServicios(filas, 'cliente', SESION, mapaClientes);
                CACHE_CLIENTE.servicios = svcs;
                if (window.ClienteServicios) {
                    window.ClienteServicios._servicios = svcs;
                    if (typeof window.ClienteServicios.renderMetricas === 'function') window.ClienteServicios.renderMetricas();
                    if (typeof window.ClienteServicios.renderCalendarStrip === 'function') window.ClienteServicios.renderCalendarStrip();
                    if (typeof window.ClienteServicios.renderServiciosList === 'function') window.ClienteServicios.renderServiciosList();
                    if (typeof window.ClienteServicios.renderBitacora === 'function') window.ClienteServicios.renderBitacora();
                }
                renderServiciosCliente(svcs);
                serviciosCargados = true;
                if (typeof actualizarVisibilidadPestanasCliente === 'function') {
                    actualizarVisibilidadPestanasCliente(svcs);
                }
                if (msg) msg.textContent = '';
            }
        } catch (eSupa) {
            console.error("Error al cargar servicios de cliente desde Supabase:", eSupa);
        }
    }

    // Saldo (siempre intentar si tiene token GAS)
    if (SESION.token) {
        api('getSaldoCliente', { email: SESION.email })
            .then(resSaldo => renderSaldoCliente(resSaldo))
            .catch(e => console.error("Error al cargar saldo:", e));
    }

    // Fallback a Google Apps Script solo si no se cargaron de Supabase y tiene token
    if (!serviciosCargados && SESION.token) {
        try {
            const hoy = new Date();
            const diaSemana = hoy.getDay();
            const diasDesdeLunes = (diaSemana + 6) % 7;
            const lunes = new Date(hoy);
            lunes.setDate(hoy.getDate() - diasDesdeLunes);
            const fechaInicioISO = toISO(lunes);

            const res = await api('getServiciosCliente', {
                email: SESION.email,
                fecha_inicio: fechaInicioISO
            });

            CACHE_CLIENTE.servicios = Array.isArray(res) ? res : [];
            if (window.ClienteServicios) {
                window.ClienteServicios._servicios = CACHE_CLIENTE.servicios;
                if (typeof window.ClienteServicios.renderMetricas === 'function') window.ClienteServicios.renderMetricas();
                if (typeof window.ClienteServicios.renderCalendarStrip === 'function') window.ClienteServicios.renderCalendarStrip();
                if (typeof window.ClienteServicios.renderServiciosList === 'function') window.ClienteServicios.renderServiciosList();
                if (typeof window.ClienteServicios.renderBitacora === 'function') window.ClienteServicios.renderBitacora();
            }
            renderServiciosCliente(CACHE_CLIENTE.servicios);
            if (msg) msg.textContent = '';
        } catch (err) {
            console.error('Error fallback cargarServiciosCliente:', err);
            if (msg) msg.innerHTML = `<span class="err">${err.message}</span>`;
        }
    } else if (!serviciosCargados && !client) {
        if (msg) msg.textContent = '';
    }
}

function renderServiciosCliente(svcs) {
    const calActual = document.getElementById('cal-cliente-actual');
    const calSig = document.getElementById('cal-cliente-siguiente');
    const msg = document.getElementById('msg-cal-cliente');
    if (!calActual || !calSig) return;

    renderCalendarioCliente(svcs || []);
    if (msg) {
        if (svcs && svcs.length > 0) {
            msg.textContent = `Se encontraron ${svcs.length} servicios próximamente.`;
            setTimeout(() => { if (msg && msg.textContent.includes('servicios')) msg.textContent = ''; }, 3000);
        } else {
            msg.textContent = '';
        }
    }
}

function renderSaldoCliente(data) {
    const container = document.getElementById('saldo-cliente-container');
    const montoEl = document.getElementById('saldo-cliente-monto');
    if (!container || !montoEl) return;

    // Se muestra solo si 'ver' es explícitamente verdadero (soporta Ver/ver y strings TRUE/VERDADERO)
    const valVer = data ? ((data.ver !== undefined) ? data.ver : data.Ver) : undefined;
    const vStr = String(valVer || '').trim().toUpperCase();
    const verVerdadero = data && (valVer === true || vStr === 'TRUE' || vStr === 'VERDADERO');

    if (data && data.saldo > 0 && verVerdadero) {
        montoEl.textContent = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(data.saldo);

        // Cambiar diseño si es moroso
        if (data.esMoroso) {
            container.style.background = 'linear-gradient(135deg, #ff4251ff 0%, #ff8271ff 100%)'; // Degradado rojizo cálido
            montoEl.style.color = '#ffffff';
        } else {
            container.style.background = 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'; // Verde alineado con el calendario
            montoEl.style.color = '#ffffff';
        }

        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

function renderCalendarioCliente(svcs) {
    const contActual = document.getElementById('cal-cliente-actual');
    const contSiguiente = document.getElementById('cal-cliente-siguiente');
    if (!contActual || !contSiguiente) return;

    contActual.innerHTML = '';
    contSiguiente.innerHTML = '';

    const hoy = new Date();
    // Cambio: empezar desde el LUNES de la semana actual
    const diaSemana = hoy.getDay();
    const diasDesdeLunes = (diaSemana + 6) % 7;

    const start = new Date(hoy);
    start.setDate(hoy.getDate() - diasDesdeLunes);
    start.setHours(0, 0, 0, 0);

    //Mapear servicios por fecha para fácil acceso
    const map = {};
    svcs.forEach(s => {
        const f = s.Fecha || s.fecha;
        if (!map[f]) map[f] = [];
        map[f].push(s);
    });

    //Renderizar 14 días (desde hoy)
    console.log("Renderizando calendario cliente para", svcs.length, "servicios");
    for (let i = 0; i < 14; i++) {
        try {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const iso = toISO(d);
            const dow = d.toLocaleDateString('es-MX', { weekday: 'short' }).toUpperCase();
            const dom = d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });

            const serviciosDia = (map[iso] || []).slice().sort((a, b) => {
                const ha = a.hora_inicio || '00:00';
                const hb = b.hora_inicio || '00:00';
                return ha.localeCompare(hb);
            });

            const dayEl = document.createElement('div');
            dayEl.className = 'day';
            if (iso === toISO(hoy)) dayEl.classList.add('today');

            const head = document.createElement('header');
            head.innerHTML = `<span> ${dow}</span> <span class="date">${dom}</span>`;
            dayEl.appendChild(head);

            const body = document.createElement('div');
            if (serviciosDia.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'no-svc';
                empty.textContent = '—';
                body.appendChild(empty);
            } else {
                serviciosDia.forEach(s => {
                    const btn = document.createElement('button');

                    // LÓGICA DE COLORES DEL CLIENTE (SOLICITUD USUARIO)
                    // Verde (.confirmed) = Hay info en columna Autorizado (confirmado_en)
                    // Amarillo (.pending) = No hay info en Autorizado

                    let claseColor = 'pending'; // Amarillo por defecto
                    if (s.confirmado_en && String(s.confirmado_en).trim() !== '') {
                        claseColor = 'confirmed'; // Verde
                    }

                    btn.className = 'svc-pill svc-pill-cliente ' + claseColor;

                    //Extraer primer nombre de la niñera
                    const nombreCompleto = s['Nombre de la niñera'] || s.nombre_ninera || 'Por asignar';
                    const primerNombre = nombreCompleto.split(' ')[0];

                    //Crear estructura HTML con horario completo y nombre
                    const horario = `${s.hora_inicio || '—'} - ${s.hora_fin || '—'} `;
                    btn.innerHTML = `
            <div style = "font-weight: 700; font-size: 13px; margin-bottom: 3px;"> ${horario}</div>
                <div style="font-size: 11px; opacity: 0.9;">${primerNombre}</div>
        `;
                    btn.title = `${s.Horario || ''} - Niñera: ${nombreCompleto} `;
                    btn.onclick = () => mostrarDetalleServicioCliente(s);
                    body.appendChild(btn);

                    // --- NUEVO: PÍLDORA DE BITÁCORA (SOLO LECTURA PARA CLIENTE) ---
                    if (s.tiene_bitacora) {
                        const bitBtn = document.createElement('button');
                        const bitKey = `${s.fecha}|${_norm(s.nombre_ninera || s['Nombre de la niñera'])}`;
                        bitBtn.className = 'svc-pill-bitacora' + (s.bitacora_aceptada ? ' aceptada' : '');
                        bitBtn.dataset.bitKey = bitKey;
                        bitBtn.innerHTML = `
                            <div style="font-weight: 700; font-size: 11px;">📋 Bitácora</div>
                        `;
                        bitBtn.onclick = (e) => {
                            e.stopPropagation();
                            abrirBitacora(s, true); // Segundo parámetro: soloLectura = true
                        };
                        body.appendChild(bitBtn);
                    }
                });
            }
            dayEl.appendChild(body);

            //Decidir en qué contenedor ponerlo
            if (i < 7) contActual.appendChild(dayEl);
            else contSiguiente.appendChild(dayEl);
        } catch (err) {
            console.error("Error en render día " + i, err);
        }
    }
}
window.renderCalendarioCliente = renderCalendarioCliente;
window.cargarServiciosCliente = cargarServiciosCliente;

async function confirmarSemana(isCurrentWeek, btnElement = null) {
    const btn = btnElement || event?.currentTarget;
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Confirmando...';
    }

    try {
        const hoy = new Date();
        const lunesActual = typeof getMondayISO_Safe === 'function' ? getMondayISO_Safe(hoy) : (() => {
            const d = (hoy.getDay() + 6) % 7;
            const l = new Date(hoy);
            l.setDate(hoy.getDate() - d);
            return l.toISOString().slice(0, 10);
        })();

        const fechaInicioISO = isCurrentWeek ? lunesActual : (
            typeof addWeeksToISO_Safe === 'function' ? addWeeksToISO_Safe(lunesActual, 1) : (() => {
                const parts = lunesActual.split('-').map(Number);
                const d = new Date(parts[0], parts[1] - 1, parts[2] + 7);
                return d.toISOString().slice(0, 10);
            })()
        );

        // 1. Confirmar en Supabase si está disponible
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (client) {
            try {
                const emailCliente = (SESION?.email || '').trim().toLowerCase();
                const nombreCliente = (SESION?.nombre || '').trim().toLowerCase();

                let q = client.from('control_servicios')
                    .update({ ok_cliente: true })
                    .eq('semana_iso', fechaInicioISO);

                if (emailCliente) {
                    q = q.ilike('cliente_email', emailCliente);
                } else if (nombreCliente) {
                    q = q.ilike('cliente_nombre', `%${nombreCliente}%`);
                }

                const { error: errUpdate } = await q;
                if (errUpdate) console.warn("Aviso al actualizar ok_cliente en Supabase:", errUpdate);
            } catch (eSupaConf) {
                console.error("Error al confirmar semana en Supabase:", eSupaConf);
            }
        }

        // 2. Llamar API GAS si hay token
        if (SESION?.token) {
            await api('confirmarSemana', {
                email: SESION.email,
                fechaInicio: fechaInicioISO,
                timestamp: new Date().toISOString()
            }).catch(e => console.warn("Aviso GAS al confirmar semana:", e));
        }

        mostrarToast("✅ ¡Semana confirmada con éxito!");

        // Recargar servicios para actualizar estado visual
        await cargarServiciosCliente(true);

    } catch (e) {
        console.error(e);
        alert("Error al confirmar: " + e.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}
window.confirmarSemana = confirmarSemana;

function mostrarDetalleServicioCliente(s) {
    if (!s) return;

    // Formatear fecha con día de semana y mes en español
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const fStr = String(s.Fecha || s.fecha || '').split('T')[0];
    let fechaFormateada = '—';
    if (fStr) {
        const partes = fStr.split('-');
        if (partes.length === 3) {
            const fechaObj = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
            if (!isNaN(fechaObj.getTime())) {
                const diaSemana = diasSemana[fechaObj.getDay()] || '';
                const dia = fechaObj.getDate();
                const mes = meses[fechaObj.getMonth()] || '';
                fechaFormateada = `${diaSemana} ${dia} de ${mes}`;
            }
        }
    }

    // Llenar el modal con la información
    const elFecha = document.getElementById('mClienteFecha');
    if (elFecha) elFecha.textContent = fechaFormateada;

    const elHorario = document.getElementById('mClienteHorario');
    const horarioTxt = s.Horario || (s.hora_inicio ? `${s.hora_inicio}${s.hora_fin ? ' – ' + s.hora_fin : ''}` : '—');
    if (elHorario) elHorario.textContent = horarioTxt;

    const elDireccion = document.getElementById('mClienteDireccion');
    if (elDireccion) elDireccion.textContent = s.Direccion || s.direccion || 'Por confirmar';

    const elNinera = document.getElementById('mClienteNinera');
    if (elNinera) elNinera.textContent = s['Nombre de la niñera'] || s.nombre_ninera || 'Por asignar';

    // Manejar ubicación (link o texto vacío)
    const ubicacionLink = document.getElementById('mClienteUbicacion');
    const ubicacionVacio = document.getElementById('mClienteUbicacionVacio');
    const linkCliente = (s.Ubicacion || s.ubicacion || s.ubicacion_link || '').trim();

    if (ubicacionLink && ubicacionVacio) {
        if (linkCliente) {
            ubicacionLink.href = linkCliente;
            ubicacionLink.style.display = 'block';
            ubicacionVacio.style.display = 'none';
        } else {
            ubicacionLink.style.display = 'none';
            ubicacionVacio.style.display = 'block';
        }
    }

    // Mostrar el modal
    const modalEl = document.getElementById('modalServicioCliente');
    if (modalEl) modalEl.style.display = 'flex';
}
window.mostrarDetalleServicioCliente = mostrarDetalleServicioCliente;

function cerrarModalCliente() {
    const modalEl = document.getElementById('modalServicioCliente');
    if (modalEl) modalEl.style.display = 'none';
}
window.cerrarModalCliente = cerrarModalCliente;

function mostrarLoginStaff() {
    document.getElementById('paso-seleccion').style.display = 'none';
    document.getElementById('paso-login').style.display = 'block';
    document.getElementById('paso-registro-cliente').style.display = 'none';

    // Auto-completar email si existe persistencia
    const last = JSON.parse(localStorage.getItem(LAST_LOGIN_KEY) || '{}');
    if (last.email && !last.cliente) {
        const el = document.getElementById('email');
        if (el) el.value = last.email;
    }
}
window.mostrarLoginStaff = mostrarLoginStaff;

function mostrarPortalFamilia() {
    document.getElementById('paso-seleccion').style.display = 'none';
    document.getElementById('paso-login').style.display = 'none';
    document.getElementById('paso-registro-cliente').style.display = 'block';

    // Auto-completar email si existe persistencia
    const last = JSON.parse(localStorage.getItem(LAST_LOGIN_KEY) || '{}');
    if (last.email && last.cliente) {
        const el = document.getElementById('email-reg');
        if (el) el.value = last.email;
    }
}
window.mostrarPortalFamilia = mostrarPortalFamilia;

function volverSeleccion() {
    document.body.classList.remove('en-control-servicios');
    document.documentElement.classList.remove('en-control-servicios');
    document.getElementById('paso-seleccion').style.display = 'block';
    document.getElementById('paso-login').style.display = 'none';
    document.getElementById('paso-registro-cliente').style.display = 'none';
    document.getElementById('paso-olvide').style.display = 'none';
}
window.volverSeleccion = volverSeleccion;

async function cargarActividadesCliente(force = false) {
    const contActual = document.getElementById('lista-actividades-actual');
    const contSiguiente = document.getElementById('lista-actividades-siguiente');
    if (!contActual || !contSiguiente) return;

    if (contActual && (!CACHE_CLIENTE.actividades || force)) {
        contActual.innerHTML = '<div class="card" style="text-align:center; padding:30px; border-radius:18px;"><p class="muted">Cargando actividades y planeaciones...</p></div>';
    }

    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        let res = null;

        if (client && typeof obtenerActividadesClienteSupabase === 'function') {
            res = await obtenerActividadesClienteSupabase(SESION.email, SESION.nombre);
        } else {
            res = await api('getActividadesClientePlanificadas', { email: SESION.email });
        }

        if (!res) throw new Error('No se recibió respuesta del servidor');

        CACHE_CLIENTE.actividades = res;
        renderActividadesCliente(res);
    } catch (err) {
        contActual.innerHTML = `<div class="act-empty-state"><span class="act-empty-icon">⚠️</span><h4 class="act-empty-title">Error al consultar actividades</h4><p class="act-empty-desc">${err.message || 'No se pudieron sincronizar las actividades en este momento.'}</p><button type="button" class="act-empty-action-btn" onclick="cargarActividadesCliente(true)">Intentar de nuevo</button></div>`;
        console.error("Error al cargar actividades cliente:", err);
    }
}

function cambiarSemanaActividadesCliente(semana) {
    const secActual = document.getElementById('container-semana-actual');
    const secSiguiente = document.getElementById('container-semana-siguiente');
    const tabActual = document.getElementById('act-tab-actual');
    const tabSiguiente = document.getElementById('act-tab-siguiente');

    if (semana === 'siguiente') {
        if (secActual) secActual.style.display = 'none';
        if (secSiguiente) secSiguiente.style.display = 'block';
        if (tabActual) tabActual.classList.remove('active');
        if (tabSiguiente) tabSiguiente.classList.add('active');
    } else {
        if (secActual) secActual.style.display = 'block';
        if (secSiguiente) secSiguiente.style.display = 'none';
        if (tabActual) tabActual.classList.add('active');
        if (tabSiguiente) tabSiguiente.classList.remove('active');
    }
}
window.cambiarSemanaActividadesCliente = cambiarSemanaActividadesCliente;

function renderActividadesCliente(res) {
    const contActual = document.getElementById('lista-actividades-actual');
    const contSiguiente = document.getElementById('lista-actividades-siguiente');
    const badgeActual = document.getElementById('act-count-actual');
    const badgeSiguiente = document.getElementById('act-count-siguiente');
    if (!contActual || !contSiguiente || !res) return;

    const actualList = Array.isArray(res.actual) ? res.actual : [];
    const siguienteList = Array.isArray(res.siguiente) ? res.siguiente : [];

    if (badgeActual) badgeActual.textContent = actualList.length;
    if (badgeSiguiente) badgeSiguiente.textContent = siguienteList.length;

    contActual.innerHTML = '';
    contSiguiente.innerHTML = '';

    const renderLista = (lista, container, tipoSemana) => {
        if (!lista || lista.length === 0) {
            container.innerHTML = `
                <div class="act-empty-state">
                    <span class="act-empty-icon">🧸</span>
                    <h4 class="act-empty-title">Aún no hay planeaciones para esta semana</h4>
                    <p class="act-empty-desc">Tu niñera cargará las actividades pedagógicas y dinámicas estimulativas preparadas especialmente para tu peque.</p>
                    <button type="button" class="act-empty-action-btn" onclick="cargarActividadesCliente(true)">🔄 Actualizar</button>
                </div>
            `;
            return;
        }

        // Ordenar cronológicamente
        lista.sort((a, b) => {
            const dateA = new Date(a.fecha);
            const dateB = new Date(b.fecha);
            return dateA - dateB;
        });

        let html = '';
        lista.forEach((p, idx) => {
            const areaRaw = p['area de desarrollo'] || p.area_desarrollo || '';
            const areaNorm = typeof normalizarTexto === 'function' ? normalizarTexto(areaRaw) : areaRaw.toLowerCase();

            let emoji = '✨';
            let pillClass = 'sensorial';
            if (areaNorm.includes('motriz')) { emoji = '🏃‍♂️'; pillClass = 'motriz'; }
            else if (areaNorm.includes('cognitivo')) { emoji = '🧠'; pillClass = 'cognitivo'; }
            else if (areaNorm.includes('lenguaje')) { emoji = '🗣️'; pillClass = 'lenguaje'; }
            else if (areaNorm.includes('socio')) { emoji = '🤝'; pillClass = 'socioemocional'; }
            else if (areaNorm.includes('sensorial') || areaNorm.includes('creativ')) { emoji = '🎨'; pillClass = 'sensorial'; }

            const fechaStr = typeof toISO === 'function' ? toISO(new Date(p.fecha)) : String(p.fecha).slice(0, 10);
            let diaNombre = 'Día de actividad';
            try {
                diaNombre = new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' });
            } catch (e) { }

            const revState = (p.estado_revision || 'pendiente').toLowerCase();
            const esRevisada = revState === 'revisada';
            const statusHtml = esRevisada
                ? `<span class="act-status-badge revisada">✅ Aprobada por Supervisión</span>`
                : `<span class="act-status-badge pendiente">📋 Planificada</span>`;

            const imgUrls = (p.imagen || '').split(',').map(img => img.trim()).filter(Boolean);
            const galleryHtml = imgUrls.length > 0 ? `
                <div class="act-gallery">
                    ${imgUrls.map(src => `<img src="${src}" class="act-img" loading="lazy" referrerpolicy="no-referrer" alt="Material de actividad" onclick="window.open('${src}', '_blank')">`).join('')}
                </div>
            ` : '';

            const objTexto = p.objetivo ? p.objetivo.trim() : 'Estimulación y desarrollo continuo';
            const descTexto = p.descripcion ? p.descripcion.trim() : '';
            const matTexto = p.materiales ? p.materiales.trim() : '';
            const nannyNom = p['nombre de ninera'] || p.nombre_ninera || 'Niñera';
            const detailId = `act-detail-${tipoSemana}-${idx}`;

            html += `
                <div class="act-card">
                    <div class="act-card-top-row">
                        <span class="act-day-chip">📅 ${diaNombre.toUpperCase()}</span>
                        <span class="act-area-pill ${pillClass}">${emoji} ${areaRaw || 'Estimulación'}</span>
                    </div>

                    <h3 class="act-title">${areaRaw || 'Actividad Pedagógica'}</h3>

                    <div class="act-objective-box">
                        <b>🎯 Objetivo:</b> ${objTexto}
                    </div>

                    ${(descTexto || matTexto || galleryHtml) ? `
                        <details id="${detailId}">
                            <summary class="act-details-toggle">
                                <span>Ver detalles de la actividad y materiales</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </summary>
                            <div class="act-expanded-section">
                                ${descTexto ? `
                                    <div class="act-desc-block">
                                        <strong>📝 Dinámica y Desarrollo:</strong>
                                        <p style="margin:0;">${descTexto}</p>
                                    </div>
                                ` : ''}
                                
                                ${matTexto ? `
                                    <div class="act-materials-block">
                                        <strong>🎒 Materiales Sugeridos:</strong>
                                        <p style="margin:0;">${matTexto}</p>
                                    </div>
                                ` : ''}

                                ${galleryHtml}
                            </div>
                        </details>
                    ` : ''}

                    <div class="act-card-footer">
                        <div class="act-nanny-badge">
                            <span>👩‍👧 Niñera:</span> <strong>${nannyNom}</strong>
                        </div>
                        <div>
                            ${statusHtml}
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    };

    renderLista(actualList, contActual, 'act');
    renderLista(siguienteList, contSiguiente, 'sig');
}
window.cargarActividadesCliente = cargarActividadesCliente;
window.renderActividadesCliente = renderActividadesCliente;






// Event listener para preview de imagen
// document.addEventListener('DOMContentLoaded', ...) ya existe (window.load). Agregamos esto al final del archivo para que corra al cargar
if (document.getElementById('pl_imagen_file')) {
    document.getElementById('pl_imagen_file').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                const preview = document.getElementById('pl_imagen_preview');
                const container = document.getElementById('pl_imagen_preview_container');
                if (preview && container) {
                    preview.src = evt.target.result;
                    preview.removeAttribute('referrerpolicy'); // Local base64 doesn't need it
                    preview.onclick = null; // No abrir en nuevo tab si es base64 local
                    container.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

function limpiarImagenSeleccionada() {
    const fileInput = document.getElementById('pl_imagen_file');
    const textInput = document.getElementById('pl_imagen');
    const container = document.getElementById('pl_imagen_preview_container');
    const preview = document.getElementById('pl_imagen_preview');

    if (fileInput) fileInput.value = '';
    if (textInput) textInput.value = '';
    if (container) container.style.display = 'none';
    if (preview) preview.src = '';
}
window.limpiarImagenSeleccionada = limpiarImagenSeleccionada;



let timerCredencial;

function abrirCredencialNanny() {
    const perf = CACHE_CLIENTE.profile;
    if (!perf) return;

    const esNanny = !!perf.isNanny;
    const labelRol = document.getElementById('cred_rol_label');

    document.getElementById('cred_nombre').textContent = perf.nombre || 'Nombre no disponible';

    if (labelRol) {
        labelRol.textContent = esNanny ? 'Nanny Activa' : 'Familia Activa';
        labelRol.style.color = esNanny ? '#3BB6C4' : '#E84C9A';
    }

    // Manejar foto principal
    const imgPrincipal = document.getElementById('cred_foto_principal');
    const uploadUI = document.getElementById('cred_upload_ui');
    const fotoUrl = perf.foto || perf.imagen;

    if (fotoUrl && (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:image/'))) {
        imgPrincipal.src = fotoUrl;
        imgPrincipal.style.display = 'block';
        if (uploadUI) uploadUI.style.display = 'none';
    } else {
        imgPrincipal.style.display = 'none';
        if (uploadUI) uploadUI.style.display = 'block';
    }

    // Manejar avatar circular
    const credAvatar = document.getElementById('cred_avatar');
    if (fotoUrl && (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:image/'))) {
        credAvatar.innerHTML = `<img src="${fotoUrl}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
        credAvatar.textContent = esNanny ? '🍼' : '👨‍👩‍👧‍👦';
    }

    const updateTime = () => {
        const ahora = new Date();
        const timeStr = ahora.toLocaleTimeString('es-MX', { hour12: false });
        const el = document.getElementById('cred_tiempo_real');
        if (el) el.textContent = timeStr;
    };
    updateTime();
    clearInterval(timerCredencial);
    timerCredencial = setInterval(updateTime, 1000);

    document.getElementById('credentialBackdrop').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
window.abrirCredencialNanny = abrirCredencialNanny;

// Lógica de subida de foto de perfil (Credential)
document.addEventListener('change', async (e) => {
    if (e.target.id === 'cred_foto_input') {
        const file = e.target.files[0];
        if (!file) return;

        console.log("Archivo seleccionado para credencial:", file.name, file.size);

        if (typeof mostrarLoading === 'function') {
            mostrarLoading(true, "Optimizando y subiendo foto oficial...");
        } else {
            console.log("Optimizando y subiendo foto oficial...");
        }

        try {
            let uploadPayload;
            if (typeof comprimirImagen === 'function') {
                const comp = await comprimirImagen(file, { maxWidth: 800, maxHeight: 800, quality: 0.82 });
                uploadPayload = comp.blob || comp.base64;
            } else {
                uploadPayload = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (evt) => resolve(evt.target.result);
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(file);
                });
            }

            console.log("☁️ Subiendo foto de perfil a Supabase Storage (bucket: perfiles)...");
            if (typeof subirImagenSupabaseStorage !== 'function') {
                throw new Error("El módulo de subida a Supabase Storage no está disponible.");
            }
            const fileName = `PERFIL_${(SESION.email || 'usuario').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
            const photoUrl = await subirImagenSupabaseStorage(uploadPayload, fileName, "perfiles");
            if (!photoUrl || typeof photoUrl !== 'string' || !photoUrl.startsWith('http')) {
                throw new Error("No se pudo obtener el enlace público de Supabase Storage para la foto.");
            }
            console.log("✅ [Perfil] Foto guardada en Supabase Storage:", photoUrl);

            // 2. Actualizar caché local
            if (window.CACHE_CLIENTE && window.CACHE_CLIENTE.profile) {
                window.CACHE_CLIENTE.profile.foto = photoUrl;
                window.CACHE_CLIENTE.profile.imagen = photoUrl;
                localStorage.setItem('nyp_profile_cache', JSON.stringify(window.CACHE_CLIENTE.profile));
            }

            // 3. Sincronizar en tabla Supabase (nannys o clientes)
            const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
            if (client && SESION.email) {
                const targetTable = SESION.cliente ? 'clientes' : 'nannys';
                await client.from(targetTable).update({ foto: photoUrl, actualizado_en: new Date().toISOString() }).eq('email', SESION.email);
            }

            // 4. Refrescar vista de la credencial
            if (typeof abrirCredencialNanny === 'function') abrirCredencialNanny();
            mostrarToast("✅ ¡Foto actualizada con éxito!");
        } catch (innerErr) {
            console.error("Error procesando subida de foto de perfil:", innerErr);
            alert("Error al procesar la subida: " + innerErr.message);
        } finally {
            if (typeof mostrarLoading === 'function') mostrarLoading(false);
            e.target.value = '';
        }
    }
});

function cerrarCredencial() {
    document.getElementById('credentialBackdrop').style.display = 'none';
    document.body.style.overflow = '';
    clearInterval(timerCredencial);
}
window.cerrarCredencial = cerrarCredencial;