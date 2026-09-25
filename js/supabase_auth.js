/**
 * NANNYS Y PEQUES - MÓDULO SUPABASE AUTH & LOGIN CONTEMPORÁNEO
 * Maneja la selección de perfil (Nanny, Familia, Staff), la animación de transición,
 * la autenticación y la MIGRACIÓN TRANSPARENTE (Lazy Migration) hacia Supabase Auth.
 */

let supaClientInstance = null;
let currentSelectedRole = 'nanny';

// Inicializar cliente Supabase
function getSupabaseClient() {
    if (supaClientInstance) return supaClientInstance;
    
    // Priorizar configuración oficial de CONFIG, permitiendo sobreescritura válida de localStorage
    let url = (window.CONFIG?.SUPABASE_URL || localStorage.getItem('nyp_supabase_url') || '').trim();
    let key = (window.CONFIG?.SUPABASE_ANON_KEY || localStorage.getItem('nyp_supabase_key') || '').trim();

    // Fallbacks si estuvieran vacíos o con placeholders
    if (!url || url === 'https://your-project.supabase.co') {
        url = 'https://tcysqleovtfpdzlsgdqm.supabase.co';
    }
    if (!key || key === 'tu-anon-key-aqui') {
        key = 'sb_publishable_Axs3rWyxt8-RxcyIU6XBVA_LNMDypeS';
    }

    if (typeof supabase === 'undefined') {
        console.error("❌ [Supabase Auth Error] La librería supabase-js (CDN) no está cargada en window.supabase. Verifica bloqueadores de anuncios o conexión a internet.");
        return null;
    }

    try {
        supaClientInstance = supabase.createClient(url, key);
        console.log("⚡ [Supabase Auth] Cliente de frontend listo para el proyecto:", url);
        initSupabaseAuthListener(supaClientInstance);
    } catch (e) {
        console.error("❌ [Supabase Auth Error] Error al instanciar cliente Supabase:", e.message);
    }
    return supaClientInstance;
}
window.getSupabaseClient = getSupabaseClient;

let supaAuthListenerRegistered = false;
function initSupabaseAuthListener(client) {
    if (!client || supaAuthListenerRegistered) return;
    supaAuthListenerRegistered = true;
    try {
        client.auth.onAuthStateChange(async (event, session) => {
            console.log("🔔 [Supabase Auth Event]:", event);
            if (event === 'PASSWORD_RECOVERY') {
                console.log("🔑 [Supabase Auth] Modo recuperación activado mediante enlace del correo.");
                if (typeof mostrarOlvideSupabase === 'function') {
                    mostrarOlvideSupabase();
                    const fase1 = document.getElementById('supaOlvideFase1');
                    const fase2 = document.getElementById('supaOlvideFase2');
                    const tokenGroup = document.getElementById('supaOlvideTokenInput')?.closest('.supa-form-group');
                    const emailDisplay = document.getElementById('supaOlvideEmailDisplay');
                    const emailInput = document.getElementById('supaOlvideEmailInput');
                    const msgEl = document.getElementById('supaOlvideMsg');

                    if (fase1) fase1.style.display = 'none';
                    if (fase2) fase2.style.display = 'block';
                    if (tokenGroup) tokenGroup.style.display = 'none'; // El token ya fue verificado por el link

                    if (session?.user?.email) {
                        if (emailDisplay) emailDisplay.textContent = session.user.email;
                        if (emailInput) emailInput.value = session.user.email;
                    }
                    if (msgEl) {
                        msgEl.className = 'supa-msg success';
                        msgEl.textContent = '✅ Enlace verificado. Por favor escribe tu nueva contraseña.';
                    }
                    if (typeof validarSeguridadPasswordOlvide === 'function') {
                        validarSeguridadPasswordOlvide();
                    }
                }
            }
        });
    } catch (e) {
        console.warn("Aviso registrando auth listener:", e);
    }
}


/**
 * Helper para guardar rápidamente URL y ANON KEY desde la consola o interfaz
 */
function configurarSupabaseFrontend(url, anonKey) {
    if (url) localStorage.setItem('nyp_supabase_url', url.trim());
    if (anonKey) localStorage.setItem('nyp_supabase_key', anonKey.trim());
    supaClientInstance = null;
    const client = getSupabaseClient();
    if (client) {
        alert("✅ Credenciales de Supabase guardadas exitosamente en tu navegador.");
    } else {
        alert("⚠️ Verifica la URL y Anon Key proporcionadas.");
    }
}
window.configurarSupabaseFrontend = configurarSupabaseFrontend;

/**
 * Función de Diagnóstico en tiempo real accesible desde consola: diagnosticarSupabase()
 */
async function diagnosticarSupabase() {
    console.group("🔍 [DIAGNÓSTICO SUPABASE AUTH & CONEXIÓN]");
    const url = (window.CONFIG?.SUPABASE_URL || localStorage.getItem('nyp_supabase_url') || '').trim();
    const key = (window.CONFIG?.SUPABASE_ANON_KEY || localStorage.getItem('nyp_supabase_key') || '').trim();
    console.log("📍 Supabase URL:", url);
    console.log("🔑 Anon Key (primeros 15 caracteres):", key ? key.substring(0, 15) + '...' : 'VACÍA');
    console.log("📦 Librería supabase-js cargada:", typeof supabase !== 'undefined' ? 'SÍ ✅' : 'NO ❌');
    
    const client = getSupabaseClient();
    console.log("🤖 Instancia del Cliente:", client ? 'Creada con éxito ✅' : 'FALLÓ ❌');

    if (client) {
        try {
            const { data, error } = await client.auth.getSession();
            console.log("🔐 Sesión actual en Supabase Auth:", error ? `Error: ${error.message}` : (data?.session ? 'Activa ✅' : 'Ninguna'));
            
            // Probar endpoint de configuración pública
            const res = await fetch(`${url}/auth/v1/settings`, { headers: { 'apikey': key } });
            if (res.ok) {
                const settings = await res.json();
                console.log("⚙️ Configuración del Servidor Auth:", settings);
                if (settings.mailer_autoconfirm === false) {
                    console.warn("⚠️ [NOTA IMPORTANTE] 'Confirm email' está ACTIVO en Supabase. Si migras un usuario, no podrá hacer login directo nativo hasta confirmar correo, o bien debes desactivar 'Confirm email' en Authentication -> Providers -> Email en tu panel de Supabase.");
                } else {
                    console.log("✅ 'Confirm email' está desactivado. Las cuentas migradas se activan automáticamente.");
                }
            } else {
                console.error("❌ Falló la consulta al endpoint /auth/v1/settings. Status:", res.status);
            }
        } catch (diagErr) {
            console.error("❌ Error de red probando conexión con Supabase:", diagErr);
        }
    }
    console.groupEnd();
}
window.diagnosticarSupabase = diagnosticarSupabase;

/**
 * Control del modo de inicio de sesión (Supabase Auth oficial)
 * @param {'sheets' | 'supabase'} [mode='supabase'] 
 */
function switchLoginMode(mode = 'supabase') {
    const sheetsLoginWrapper = document.getElementById('auth-sheets-wrapper');
    const supabaseLoginCard = document.getElementById('auth-supabase-card');
    const btnSheets = document.getElementById('btnSwitchSheets');
    const btnSupabase = document.getElementById('btnSwitchSupabase');

    if (sheetsLoginWrapper) sheetsLoginWrapper.style.display = 'none';
    if (supabaseLoginCard) supabaseLoginCard.style.display = 'block';

    if (btnSheets) btnSheets.classList.remove('active');
    if (btnSupabase) btnSupabase.classList.add('active');

    localStorage.setItem('nyp_login_mode', 'supabase');
}

/**
 * Transición animada de Paso 1 (Selección de Rol) a Paso 2 (Formulario de Credenciales)
 * @param {'nanny' | 'familia' | 'staff'} rol 
 */
function selectRoleAndShowForm(rol) {
    currentSelectedRole = rol;

    const roleStep = document.getElementById('supaRoleStep');
    const formStep = document.getElementById('supaFormStep');
    const roleBadge = document.getElementById('supaRoleBadge');
    const submitBtn = document.getElementById('btnSupaSubmit');
    const emailInput = document.getElementById('supaEmailInput');
    const msgEl = document.getElementById('supaMsg');

    if (!roleStep || !formStep) return;

    // Limpiar mensajes anteriores
    if (msgEl) {
        msgEl.textContent = '';
        msgEl.className = 'supa-msg';
    }

    // Configurar Badge de Rol
    if (roleBadge) {
        roleBadge.className = 'supa-selected-role-badge ' + rol;
        if (rol === 'nanny') {
            roleBadge.innerHTML = '<span>🍼</span> Acceso Nanny';
        } else if (rol === 'familia') {
            roleBadge.innerHTML = '<span>👨‍👩‍👧‍👦</span> Portal Familia';
        } else {
            roleBadge.innerHTML = '<span>🔐</span> Acceso Staff';
        }
    }

    // Configurar tema del botón
    if (submitBtn) {
        submitBtn.className = 'supa-btn-submit';
        if (rol === 'familia') submitBtn.classList.add('familia-theme');
        else if (rol === 'staff') submitBtn.classList.add('staff-theme');
    }

    // Animación de ocultación del selector y entrada del formulario
    roleStep.style.display = 'none';
    formStep.style.display = 'block';

    if (emailInput) {
        setTimeout(() => emailInput.focus(), 150);
    }
}

/**
 * Regresar del Formulario al Selector de Perfil con animación
 */
function goBackToRoleSelection() {
    const roleStep = document.getElementById('supaRoleStep');
    const formStep = document.getElementById('supaFormStep');
    const msgEl = document.getElementById('supaMsg');

    if (!roleStep || !formStep) return;

    if (msgEl) {
        msgEl.textContent = '';
        msgEl.className = 'supa-msg';
    }

    formStep.style.display = 'none';
    roleStep.style.display = 'block';
}

const _SUPA_SVG_EYE_OPEN = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const _SUPA_SVG_EYE_CLOSED = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

/**
 * Muestra u oculta la contraseña en el campo input
 */
function toggleSupabasePasswordVisibility() {
    const passInput = document.getElementById('supaPassInput');
    const icon = document.getElementById('supaPassToggleIcon');
    if (!passInput) return;

    if (passInput.type === 'password') {
        passInput.type = 'text';
        if (icon) icon.innerHTML = _SUPA_SVG_EYE_CLOSED;
    } else {
        passInput.type = 'password';
        if (icon) icon.innerHTML = _SUPA_SVG_EYE_OPEN;
    }
}
window.toggleSupabasePasswordVisibility = toggleSupabasePasswordVisibility;

/**
 * Muestra u oculta la contraseña para campos específicos (Crear / Confirmar Contraseña)
 */
function toggleCrearPasswordVisibility(inputId, iconId) {
    const passInput = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!passInput) return;

    if (passInput.type === 'password') {
        passInput.type = 'text';
        if (icon) icon.innerHTML = _SUPA_SVG_EYE_CLOSED;
    } else {
        passInput.type = 'password';
        if (icon) icon.innerHTML = _SUPA_SVG_EYE_OPEN;
    }
}
window.toggleCrearPasswordVisibility = toggleCrearPasswordVisibility;

/**
 * Abre la vista para que el cliente cree su contraseña por primera vez
 */
/**
 * Valida en tiempo real las reglas de seguridad de la contraseña
 */
function validarSeguridadPassword() {
    const passInput = document.getElementById('supaCrearPassInput');
    const confirmPassInput = document.getElementById('supaCrearConfirmPassInput');
    const emailInput = document.getElementById('supaCrearEmailInput');
    const btnSubmit = document.getElementById('btnSupaGenerar');

    const pass = passInput ? passInput.value : '';
    const confirmPass = confirmPassInput ? confirmPassInput.value : '';
    const email = emailInput ? emailInput.value.trim() : '';

    // 1. Evaluación de cada regla
    const ruleLenOk = pass.length > 6;
    const ruleMayusOk = /[A-Z]/.test(pass);
    const ruleNumOk = /[0-9]/.test(pass);
    const ruleSymOk = /[!@#$%^&*(),.?":{}|<>_\-~+=/\\[\]`';]/.test(pass);
    const ruleMatchOk = pass.length > 0 && pass === confirmPass;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // 2. Actualizar visualmente cada item
    actualizarReglaItem('rule-len', ruleLenOk);
    actualizarReglaItem('rule-mayus', ruleMayusOk);
    actualizarReglaItem('rule-num', ruleNumOk);
    actualizarReglaItem('rule-sym', ruleSymOk);
    actualizarReglaItem('rule-match', ruleMatchOk);

    // 3. Medidor de fuerza y barra de progreso
    let score = 0;
    if (ruleLenOk) score++;
    if (ruleMayusOk) score++;
    if (ruleNumOk) score++;
    if (ruleSymOk) score++;

    const fillEl = document.getElementById('pwdStrengthFill');
    const textEl = document.getElementById('pwdStrengthText');

    if (fillEl && textEl) {
        if (pass.length === 0) {
            fillEl.style.width = '0%';
            fillEl.style.backgroundColor = '#E2E8F0';
            textEl.textContent = 'Seguridad de la contraseña';
            textEl.style.color = '#64748B';
        } else if (score <= 1) {
            fillEl.style.width = '25%';
            fillEl.style.backgroundColor = '#EF4444';
            textEl.textContent = 'Seguridad: Débil ⚠️';
            textEl.style.color = '#EF4444';
        } else if (score === 2) {
            fillEl.style.width = '50%';
            fillEl.style.backgroundColor = '#F59E0B';
            textEl.textContent = 'Seguridad: Regular';
            textEl.style.color = '#F59E0B';
        } else if (score === 3) {
            fillEl.style.width = '75%';
            fillEl.style.backgroundColor = '#3B82F6';
            textEl.textContent = 'Seguridad: Buena';
            textEl.style.color = '#3B82F6';
        } else if (score === 4) {
            fillEl.style.width = '100%';
            fillEl.style.backgroundColor = '#10B981';
            textEl.textContent = 'Seguridad: Fuerte y segura ✨';
            textEl.style.color = '#10B981';
        }
    }

    // 4. Habilitar o deshabilitar botón "Generar"
    const todasCumplidas = ruleLenOk && ruleMayusOk && ruleNumOk && ruleSymOk && ruleMatchOk && emailOk;
    if (btnSubmit) {
        if (todasCumplidas) {
            btnSubmit.removeAttribute('disabled');
            btnSubmit.style.opacity = '1';
            btnSubmit.style.cursor = 'pointer';
        } else {
            btnSubmit.setAttribute('disabled', 'true');
            btnSubmit.style.opacity = '0.5';
            btnSubmit.style.cursor = 'not-allowed';
        }
    }
}
window.validarSeguridadPassword = validarSeguridadPassword;

function actualizarReglaItem(itemId, isValid) {
    const el = document.getElementById(itemId);
    if (!el) return;
    const icon = el.querySelector('.pwd-rule-icon');

    if (isValid) {
        el.classList.add('valid');
        if (icon) icon.textContent = '✓';
    } else {
        el.classList.remove('valid');
        if (icon) icon.textContent = '✕';
    }
}

/**
 * Abre la vista para que el usuario (Cliente o Nanny) cree su contraseña por primera vez
 */
function mostrarCrearCuentaCliente() {
    // Si la app está en modo sheets, cambiar a modo supabase para la interfaz moderna
    if (typeof switchLoginMode === 'function') {
        switchLoginMode('supabase');
    }

    const roleStep = document.getElementById('supaRoleStep');
    const formStep = document.getElementById('supaFormStep');
    const crearStep = document.getElementById('supaCrearCuentaStep');
    const crearMsg = document.getElementById('supaCrearMsg');
    const crearEmailInput = document.getElementById('supaCrearEmailInput');
    const crearPassInput = document.getElementById('supaCrearPassInput');
    const crearConfirmPassInput = document.getElementById('supaCrearConfirmPassInput');
    const roleBadge = document.getElementById('supaCrearRoleBadge');
    const descText = document.getElementById('supaCrearDescText');
    const btnSubmit = document.getElementById('btnSupaGenerar');

    if (roleStep) roleStep.style.display = 'none';
    if (formStep) formStep.style.display = 'none';
    if (crearStep) crearStep.style.display = 'block';

    if (crearMsg) {
        crearMsg.textContent = '';
        crearMsg.className = 'supa-msg';
    }

    // Configurar badge y descripción según el rol seleccionado (Nanny o Familia)
    if (roleBadge) {
        if (currentSelectedRole === 'nanny') {
            roleBadge.className = 'supa-selected-role-badge nanny';
            roleBadge.innerHTML = '<span>🍼</span> Portal Nanny';
            if (descText) {
                descText.textContent = 'Ingresa el correo registrado con Nannys y Peques para generar tu contraseña y activar tu acceso a tu panel de niñera.';
            }
            if (btnSubmit) {
                btnSubmit.classList.remove('familia-theme');
            }
        } else {
            roleBadge.className = 'supa-selected-role-badge familia';
            roleBadge.innerHTML = '<span>👨‍👩‍👧‍👦</span> Portal Familia';
            if (descText) {
                descText.textContent = 'Ingresa el correo que compartiste con Nannys y Peques para generar tu contraseña y activar tu acceso.';
            }
            if (btnSubmit) {
                btnSubmit.classList.add('familia-theme');
            }
        }
    }

    if (crearPassInput) crearPassInput.value = '';
    if (crearConfirmPassInput) crearConfirmPassInput.value = '';

    // Si ya había escrito un correo en el login, precargarlo aquí
    const loginEmail = document.getElementById('supaEmailInput')?.value.trim() || document.getElementById('email-reg')?.value.trim();
    if (crearEmailInput) {
        if (loginEmail) crearEmailInput.value = loginEmail;
        setTimeout(() => crearEmailInput.focus(), 120);
    }

    // Inicializar checklist de seguridad
    validarSeguridadPassword();
}
window.mostrarCrearCuentaCliente = mostrarCrearCuentaCliente;

/**
 * Regresa de la pantalla de crear contraseña al login estándar según el rol seleccionado
 */
function volverDeCrearCuenta() {
    const crearStep = document.getElementById('supaCrearCuentaStep');
    const formStep = document.getElementById('supaFormStep');
    const roleStep = document.getElementById('supaRoleStep');
    const crearMsg = document.getElementById('supaCrearMsg');

    if (crearMsg) {
        crearMsg.textContent = '';
        crearMsg.className = 'supa-msg';
    }

    if (crearStep) crearStep.style.display = 'none';

    // Regresar a la pantalla de credenciales del rol seleccionado
    if (formStep) {
        if (typeof selectRoleAndShowForm === 'function') {
            selectRoleAndShowForm(currentSelectedRole || 'familia');
        } else {
            formStep.style.display = 'block';
        }
    } else if (roleStep) {
        roleStep.style.display = 'block';
    }
}
window.volverDeCrearCuenta = volverDeCrearCuenta;

/**
 * Valida si el usuario (Cliente o Nanny) está registrado en Supabase y genera su contraseña en Supabase Auth
 */
async function generarCuentaCliente() {
    const emailInput = document.getElementById('supaCrearEmailInput');
    const passInput = document.getElementById('supaCrearPassInput');
    const confirmPassInput = document.getElementById('supaCrearConfirmPassInput');
    const msgEl = document.getElementById('supaCrearMsg');
    const btnSubmit = document.getElementById('btnSupaGenerar');

    if (!emailInput || !passInput || !confirmPassInput || !msgEl) return;

    const email = emailInput.value.trim().toLowerCase();
    const pass = passInput.value;
    const confirmPass = confirmPassInput.value;

    if (!email || !pass || !confirmPass) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'Por favor, llena todos los campos.';
        return;
    }

    // Comprobación estricta de requisitos de seguridad
    if (pass.length <= 6) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'La contraseña debe tener más de 6 caracteres (mínimo 7).';
        return;
    }

    if (!/[A-Z]/.test(pass)) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'La contraseña debe incluir al menos una letra mayúscula (A-Z).';
        return;
    }

    if (!/[0-9]/.test(pass)) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'La contraseña debe incluir al menos un número (0-9).';
        return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-~+=/\\[\]`';]/.test(pass)) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'La contraseña debe incluir al menos un signo o símbolo especial.';
        return;
    }

    if (pass !== confirmPass) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'Las contraseñas no coinciden. Por favor, verifica.';
        return;
    }

    const esNanny = currentSelectedRole === 'nanny';
    const targetTable = esNanny ? 'nannys' : 'clientes';
    const targetRole = esNanny ? 'nanny' : 'familia';

    msgEl.className = 'supa-msg';
    msgEl.textContent = esNanny ? 'Verificando en la base de datos de niñeras...' : 'Verificando en la base de datos de clientes...';
    if (btnSubmit) {
        btnSubmit.classList.add('loading');
        btnSubmit.setAttribute('disabled', 'true');
    }

    try {
        const client = getSupabaseClient();
        if (!client) {
            throw new Error("No hay conexión con el servidor Supabase.");
        }

        // 1. Revisar si el email está registrado en la base de datos pública correspondiente
        const { data: usuarioDb, error: dbErr } = await client
            .from(targetTable)
            .select('*')
            .ilike('email', email)
            .maybeSingle();

        if (dbErr) {
            console.warn("Aviso consultando base de datos:", dbErr.message);
        }

        if (!usuarioDb) {
            const mensajeNoEncontrado = esNanny
                ? "Este correo no se encuentra registrado en nuestra base de datos de niñeras. Por favor, solicita a la administración de Nannys y Peques que registre tus datos primero."
                : "Este correo no se encuentra registrado en nuestra base de datos. Por favor, solicita a la administración de Nannys y Peques que registre tus datos primero.";
            throw new Error(mensajeNoEncontrado);
        }

        if (usuarioDb.activo === false) {
            const mensajeInactivo = esNanny
                ? "Tu cuenta de niñera se encuentra inactiva. Por favor comunícate con la administración de Nannys y Peques."
                : "Tu cuenta de cliente se encuentra inactiva. Por favor comunícate con la administración.";
            throw new Error(mensajeInactivo);
        }

        msgEl.textContent = 'Registrando tu contraseña de acceso seguro...';

        // 2. Crear credenciales en Supabase Auth
        let supaUser = null;
        const { data: signUpData, error: signUpErr } = await client.auth.signUp({
            email: usuarioDb.email,
            password: pass,
            options: {
                data: {
                    role: targetRole,
                    nombre: usuarioDb.nombre || (esNanny ? 'Nanny' : 'Familia')
                }
            }
        });

        if (signUpErr) {
            const errMsg = signUpErr.message.toLowerCase();
            if (errMsg.includes('already registered') || errMsg.includes('already exists') || errMsg.includes('user already')) {
                // Si ya existe en auth.users, probar si las credenciales coinciden
                const { data: signData, error: signErr } = await client.auth.signInWithPassword({
                    email: usuarioDb.email,
                    password: pass
                });

                if (signErr) {
                    throw new Error("Esta cuenta ya tiene una contraseña registrada. Si no la recuerdas, pulsa en '¿Olvidaste tu contraseña?' o inicia sesión directamente.");
                }
                supaUser = signData.user;
            } else {
                throw signUpErr;
            }
        } else {
            supaUser = signUpData?.user;
        }

        // 3. Vincular auth_user_id en la fila correspondiente en Supabase
        if (supaUser?.id) {
            await client
                .from(targetTable)
                .update({ 
                    auth_user_id: supaUser.id,
                    actualizado_en: new Date().toISOString()
                })
                .eq('id', usuarioDb.id);
        }

        // 4. Iniciar sesión automáticamente
        msgEl.className = 'supa-msg success';
        msgEl.textContent = '✅ ¡Contraseña generada con éxito! Iniciando sesión...';

        const mainEmail = document.getElementById('supaEmailInput');
        const mainPass = document.getElementById('supaPassInput');
        if (mainEmail) mainEmail.value = usuarioDb.email;
        if (mainPass) mainPass.value = pass;

        currentSelectedRole = targetRole;
        volverDeCrearCuenta();
        await loginSupabase();

    } catch (err) {
        console.error("❌ [Crear Cuenta Error]:", err);
        msgEl.className = 'supa-msg err';
        msgEl.textContent = err.message || 'Error al generar la cuenta.';
    } finally {
        if (btnSubmit) {
            btnSubmit.classList.remove('loading');
            btnSubmit.removeAttribute('disabled');
        }
    }
}
window.generarCuentaCliente = generarCuentaCliente;

/**
 * Abre la vista para recuperar contraseña mediante código OTP en Supabase Auth
 */
function mostrarOlvideSupabase() {
    if (typeof switchLoginMode === 'function') {
        switchLoginMode('supabase');
    }

    const roleStep = document.getElementById('supaRoleStep');
    const formStep = document.getElementById('supaFormStep');
    const crearStep = document.getElementById('supaCrearCuentaStep');
    const olvideStep = document.getElementById('supaOlvideStep');
    const olvideMsg = document.getElementById('supaOlvideMsg');
    const emailInput = document.getElementById('supaOlvideEmailInput');
    const roleBadge = document.getElementById('supaOlvideRoleBadge');
    const descText = document.getElementById('supaOlvideDescText');
    const btnSubmit = document.getElementById('btnSupaEnviarOTP');
    const fase1 = document.getElementById('supaOlvideFase1');
    const fase2 = document.getElementById('supaOlvideFase2');

    if (roleStep) roleStep.style.display = 'none';
    if (formStep) formStep.style.display = 'none';
    if (crearStep) crearStep.style.display = 'none';
    if (olvideStep) olvideStep.style.display = 'block';

    // Regresar a Fase 1 (solicitar correo)
    if (fase1) fase1.style.display = 'block';
    if (fase2) fase2.style.display = 'none';

    if (olvideMsg) {
        olvideMsg.textContent = '';
        olvideMsg.className = 'supa-msg';
    }

    // Configurar badge y textos según el rol seleccionado
    if (roleBadge) {
        if (currentSelectedRole === 'nanny') {
            roleBadge.className = 'supa-selected-role-badge nanny';
            roleBadge.innerHTML = '<span>🍼</span> Portal Nanny';
            if (descText) {
                descText.textContent = 'Te enviaremos un código de seguridad de 6 dígitos a tu correo de niñera.';
            }
            if (btnSubmit) {
                btnSubmit.classList.remove('familia-theme');
            }
        } else if (currentSelectedRole === 'staff') {
            roleBadge.className = 'supa-selected-role-badge';
            roleBadge.innerHTML = '<span>🔐</span> Portal Staff';
            if (descText) {
                descText.textContent = 'Te enviaremos un código de seguridad de 6 dígitos a tu correo de staff.';
            }
        } else {
            roleBadge.className = 'supa-selected-role-badge familia';
            roleBadge.innerHTML = '<span>👨‍👩‍👧‍👦</span> Portal Familia';
            if (descText) {
                descText.textContent = 'Te enviaremos un código de seguridad de 6 dígitos a tu correo de cliente registrado.';
            }
            if (btnSubmit) {
                btnSubmit.classList.add('familia-theme');
            }
        }
    }

    // Precargar correo si ya estaba escrito en la pantalla anterior
    const loginEmail = document.getElementById('supaEmailInput')?.value.trim() || document.getElementById('supaCrearEmailInput')?.value.trim() || '';
    if (emailInput) {
        if (loginEmail) emailInput.value = loginEmail;
        setTimeout(() => emailInput.focus(), 120);
    }
}
window.mostrarOlvideSupabase = mostrarOlvideSupabase;

/**
 * Regresa de la pantalla de recuperación de contraseña al formulario de login
 */
function volverDeOlvide() {
    const olvideStep = document.getElementById('supaOlvideStep');
    const formStep = document.getElementById('supaFormStep');
    const roleStep = document.getElementById('supaRoleStep');
    const olvideMsg = document.getElementById('supaOlvideMsg');

    if (olvideMsg) {
        olvideMsg.textContent = '';
        olvideMsg.className = 'supa-msg';
    }

    if (olvideStep) olvideStep.style.display = 'none';

    if (formStep) {
        if (typeof selectRoleAndShowForm === 'function') {
            selectRoleAndShowForm(currentSelectedRole || 'nanny');
        } else {
            formStep.style.display = 'block';
        }
    } else if (roleStep) {
        roleStep.style.display = 'block';
    }
}
window.volverDeOlvide = volverDeOlvide;

/**
 * Permite al usuario regresar a cambiar el correo en la pantalla de recuperación
 */
function cambiarEmailOlvide() {
    const fase1 = document.getElementById('supaOlvideFase1');
    const fase2 = document.getElementById('supaOlvideFase2');
    const olvideMsg = document.getElementById('supaOlvideMsg');
    const emailInput = document.getElementById('supaOlvideEmailInput');

    if (fase1) fase1.style.display = 'block';
    if (fase2) fase2.style.display = 'none';
    if (olvideMsg) {
        olvideMsg.textContent = '';
        olvideMsg.className = 'supa-msg';
    }
    if (emailInput) setTimeout(() => emailInput.focus(), 100);
}
window.cambiarEmailOlvide = cambiarEmailOlvide;

/**
 * Valida en tiempo real las reglas de seguridad de la contraseña en la vista de recuperación OTP
 */
function validarSeguridadPasswordOlvide() {
    const passInput = document.getElementById('supaOlvidePassInput');
    const confirmPassInput = document.getElementById('supaOlvideConfirmPassInput');
    const tokenInput = document.getElementById('supaOlvideTokenInput');
    const tokenGroup = tokenInput?.closest('.supa-form-group');
    const btnSubmit = document.getElementById('btnSupaGuardarPass');

    const pass = passInput ? passInput.value : '';
    const confirmPass = confirmPassInput ? confirmPassInput.value : '';
    const token = tokenInput ? tokenInput.value.trim() : '';

    const ruleLenOk = pass.length > 6;
    const ruleMayusOk = /[A-Z]/.test(pass);
    const ruleNumOk = /[0-9]/.test(pass);
    const ruleSymOk = /[!@#$%^&*(),.?":{}|<>_\-~+=/\\[\]`';]/.test(pass);
    const ruleMatchOk = pass.length > 0 && pass === confirmPass;
    const isTokenHidden = tokenGroup && tokenGroup.style.display === 'none';
    const tokenOk = isTokenHidden ? true : token.length === 6;

    actualizarReglaItem('rule-len-olvide', ruleLenOk);
    actualizarReglaItem('rule-mayus-olvide', ruleMayusOk);
    actualizarReglaItem('rule-num-olvide', ruleNumOk);
    actualizarReglaItem('rule-sym-olvide', ruleSymOk);
    actualizarReglaItem('rule-match-olvide', ruleMatchOk);

    let score = 0;
    if (ruleLenOk) score++;
    if (ruleMayusOk) score++;
    if (ruleNumOk) score++;
    if (ruleSymOk) score++;

    const fillEl = document.getElementById('pwdStrengthFillOlvide');
    const textEl = document.getElementById('pwdStrengthTextOlvide');

    if (fillEl && textEl) {
        if (pass.length === 0) {
            fillEl.style.width = '0%';
            fillEl.style.backgroundColor = '#E2E8F0';
            textEl.textContent = 'Seguridad de la contraseña';
            textEl.style.color = '#64748B';
        } else if (score <= 1) {
            fillEl.style.width = '25%';
            fillEl.style.backgroundColor = '#EF4444';
            textEl.textContent = 'Seguridad: Débil ⚠️';
            textEl.style.color = '#EF4444';
        } else if (score === 2) {
            fillEl.style.width = '50%';
            fillEl.style.backgroundColor = '#F59E0B';
            textEl.textContent = 'Seguridad: Regular';
            textEl.style.color = '#F59E0B';
        } else if (score === 3) {
            fillEl.style.width = '75%';
            fillEl.style.backgroundColor = '#3B82F6';
            textEl.textContent = 'Seguridad: Buena';
            textEl.style.color = '#3B82F6';
        } else if (score === 4) {
            fillEl.style.width = '100%';
            fillEl.style.backgroundColor = '#10B981';
            textEl.textContent = 'Seguridad: Fuerte y segura ✨';
            textEl.style.color = '#10B981';
        }
    }

    const todasCumplidas = ruleLenOk && ruleMayusOk && ruleNumOk && ruleSymOk && ruleMatchOk && tokenOk;
    if (btnSubmit) {
        if (todasCumplidas) {
            btnSubmit.removeAttribute('disabled');
            btnSubmit.style.opacity = '1';
            btnSubmit.style.cursor = 'pointer';
        } else {
            btnSubmit.setAttribute('disabled', 'true');
            btnSubmit.style.opacity = '0.5';
            btnSubmit.style.cursor = 'not-allowed';
        }
    }
}
window.validarSeguridadPasswordOlvide = validarSeguridadPasswordOlvide;

/**
 * Envía el código OTP de 6 dígitos mediante Supabase Auth
 */
async function enviarOTPSupabase(isResend = false) {
    const emailInput = document.getElementById('supaOlvideEmailInput');
    const msgEl = document.getElementById('supaOlvideMsg');
    const btnSubmit = isResend ? document.getElementById('btnSupaReenviarOTP') : document.getElementById('btnSupaEnviarOTP');
    const fase1 = document.getElementById('supaOlvideFase1');
    const fase2 = document.getElementById('supaOlvideFase2');
    const emailDisplay = document.getElementById('supaOlvideEmailDisplay');
    const tokenInput = document.getElementById('supaOlvideTokenInput');
    const tokenGroup = tokenInput?.closest('.supa-form-group');

    if (!emailInput || !msgEl) return;

    const email = emailInput.value.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'Por favor, ingresa un correo electrónico válido.';
        return;
    }

    const esNanny = currentSelectedRole === 'nanny';
    const esStaff = currentSelectedRole === 'staff';
    const targetTable = esNanny ? 'nannys' : (esStaff ? 'staff' : 'clientes');

    msgEl.className = 'supa-msg';
    msgEl.textContent = 'Verificando cuenta y enviando código de seguridad...';

    if (btnSubmit) {
        btnSubmit.setAttribute('disabled', 'true');
        btnSubmit.style.opacity = '0.7';
    }

    try {
        const client = getSupabaseClient();
        if (!client) throw new Error("No hay conexión con el servidor Supabase.");

        // 1. Validar cuenta mediante RPC de seguridad o verificación Supabase Auth
        try {
            const { data: cuentaValida, error: rpcErr } = await client.rpc('verificar_cuenta_para_recuperacion', {
                email_param: email,
                rol_param: esStaff ? 'staff' : (esNanny ? 'nanny' : 'cliente')
            });
            if (!rpcErr && cuentaValida === false) {
                const mensajeNoEncontrado = esNanny
                    ? "Este correo no se encuentra registrado en nuestra base de datos de niñeras. Por favor contacta a administración."
                    : (esStaff
                        ? "Este correo no se encuentra registrado como personal Staff autorizado."
                        : "Este correo no se encuentra registrado en nuestra base de datos de clientes.");
                throw new Error(mensajeNoEncontrado);
            }
        } catch (checkErr) {
            if (checkErr.message && checkErr.message.includes('no se encuentra registrado')) {
                throw checkErr;
            }
        }

        // 2. Solicitar restablecimiento / OTP a Supabase Auth nativo
        const { data, error } = await client.auth.resetPasswordForEmail(email);
        if (error) {
            throw error;
        }

        // 3. Pasar a Fase 2 (Ingresar código + nueva contraseña)
        if (emailDisplay) emailDisplay.textContent = email;
        if (tokenGroup) tokenGroup.style.display = 'block';
        if (fase1) fase1.style.display = 'none';
        if (fase2) fase2.style.display = 'block';

        msgEl.className = 'supa-msg success';
        msgEl.textContent = isResend 
            ? '✅ ¡Código reenviado! Revisa tu bandeja de entrada (o carpeta de spam).' 
            : '✅ ¡Código enviado! Revisa tu bandeja de entrada (o carpeta de spam).';

        if (tokenInput) {
            tokenInput.value = '';
            setTimeout(() => tokenInput.focus(), 150);
        }

        validarSeguridadPasswordOlvide();

    } catch (err) {
        console.error("❌ [Error OTP Recuperación]:", err);
        msgEl.className = 'supa-msg err';
        msgEl.textContent = err.message || 'Error al enviar el código de recuperación.';
    } finally {
        if (btnSubmit) {
            btnSubmit.removeAttribute('disabled');
            btnSubmit.style.opacity = '1';
        }
    }
}
window.enviarOTPSupabase = enviarOTPSupabase;

/**
 * Valida el código OTP de 6 dígitos (o sesión de recuperación) y actualiza la contraseña en Supabase Auth
 */
async function verificarYGuardarPassOTPSupabase() {
    const emailInput = document.getElementById('supaOlvideEmailInput');
    const tokenInput = document.getElementById('supaOlvideTokenInput');
    const tokenGroup = tokenInput?.closest('.supa-form-group');
    const passInput = document.getElementById('supaOlvidePassInput');
    const confirmPassInput = document.getElementById('supaOlvideConfirmPassInput');
    const msgEl = document.getElementById('supaOlvideMsg');
    const btnSubmit = document.getElementById('btnSupaGuardarPass');

    if (!emailInput || !passInput || !confirmPassInput || !msgEl) return;

    const email = emailInput.value.trim().toLowerCase();
    const token = tokenInput ? tokenInput.value.trim() : '';
    const isTokenHidden = tokenGroup && tokenGroup.style.display === 'none';
    const pass = passInput.value;
    const confirmPass = confirmPassInput.value;

    if (!isTokenHidden && (!token || token.length !== 6)) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'Por favor, ingresa el código de 6 dígitos que enviamos a tu correo.';
        return;
    }

    if (pass.length <= 6 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass) || !/[!@#$%^&*(),.?":{}|<>_\-~+=/\\[\]`';]/.test(pass)) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'La nueva contraseña debe cumplir con todos los requisitos de seguridad.';
        return;
    }

    if (pass !== confirmPass) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'Las contraseñas no coinciden. Por favor verifica.';
        return;
    }

    msgEl.className = 'supa-msg';
    msgEl.textContent = isTokenHidden ? 'Guardando tu nueva contraseña...' : 'Validando código de seguridad...';

    if (btnSubmit) {
        btnSubmit.classList.add('loading');
        btnSubmit.setAttribute('disabled', 'true');
    }

    try {
        const client = getSupabaseClient();
        if (!client) throw new Error("No hay conexión con el servidor Supabase.");

        let verifiedUser = null;

        // 1. Si no vino por link, verificar el código OTP con tipo 'recovery'
        if (!isTokenHidden) {
            const { data: verifyData, error: verifyError } = await client.auth.verifyOtp({
                email: email,
                token: token,
                type: 'recovery'
            });

            if (verifyError) {
                throw new Error("El código de seguridad es inválido o ha expirado. Por favor solicita uno nuevo.");
            }
            verifiedUser = verifyData?.user;
        }

        msgEl.textContent = 'Guardando tu nueva contraseña...';

        // 2. Actualizar la contraseña del usuario autenticado
        const { data: updateData, error: updateError } = await client.auth.updateUser({
            password: pass
        });

        if (updateError) {
            throw updateError;
        }

        // 3. Vincular auth_user_id en la tabla pública correspondiente
        const esNanny = currentSelectedRole === 'nanny';
        const esStaff = currentSelectedRole === 'staff';
        const targetTable = esNanny ? 'nannys' : (esStaff ? 'staff' : 'clientes');
        const user = updateData?.user || verifiedUser;

        if (user?.id) {
            await client
                .from(targetTable)
                .update({ 
                    auth_user_id: user.id,
                    actualizado_en: new Date().toISOString()
                })
                .eq('email', email);
        }

        msgEl.className = 'supa-msg success';
        msgEl.textContent = '✅ ¡Contraseña restablecida con éxito! Iniciando sesión...';

        // 4. Iniciar sesión automáticamente
        const mainEmail = document.getElementById('supaEmailInput');
        const mainPass = document.getElementById('supaPassInput');
        if (mainEmail) mainEmail.value = email;
        if (mainPass) mainPass.value = pass;

        setTimeout(async () => {
            volverDeOlvide();
            await loginSupabase();
        }, 1200);

    } catch (err) {
        console.error("❌ [Error Verificando OTP / Guardando Pass]:", err);
        msgEl.className = 'supa-msg err';
        msgEl.textContent = err.message || 'Error al restablecer la contraseña.';
    } finally {
        if (btnSubmit) {
            btnSubmit.classList.remove('loading');
            btnSubmit.removeAttribute('disabled');
        }
    }
}
window.verificarYGuardarPassOTPSupabase = verificarYGuardarPassOTPSupabase;



/**
 * Sincroniza automáticamente la cuenta en la tabla pública correspondiente (nannys, clientes o staff)
 * @param {object} client - Instancia de Supabase
 * @param {object} user - Objeto user retornado por Supabase Auth
 * @param {'nanny' | 'familia' | 'staff'} role - Rol seleccionado
 * @param {object} profileData - Datos provenientes de Google Sheets o metadata
 */
async function sincronizarPerfilEnTabla(client, user, role, profileData) {
    if (!client || !user?.id || !user?.email) return;

    let tableName = 'clientes';
    if (role === 'nanny') tableName = 'nannys';
    else if (role === 'staff') tableName = 'staff';

    try {
        console.log(`📋 [Segmentación DB] Vinculando en tabla pública '${tableName}' para:`, user.email);

        const updatePayload = {
            auth_user_id: user.id,
            actualizado_en: new Date().toISOString()
        };

        const nombreReal = profileData?.nombre || profileData?.nombre_del_cliente || user.user_metadata?.nombre;
        if (nombreReal) updatePayload.nombre = nombreReal;

        const telReal = profileData?.telefono || profileData?.celular || user.user_metadata?.telefono;
        if (telReal) updatePayload.telefono = telReal;

        if (tableName === 'staff') {
            const rolNorm = String(profileData?.rol || user.user_metadata?.rol || '').toLowerCase();
            updatePayload.rol = rolNorm || 'staff';
            updatePayload.es_admin = !!(profileData?.es_admin || profileData?.admin || rolNorm === 'admin');
            updatePayload.supervision = !!(profileData?.supervision || rolNorm === 'supervision');
            updatePayload.rh = !!(profileData?.rh || rolNorm === 'rh');
        }

        // 1. Intentar actualizar la fila existente por email
        const { data: updatedRow, error: updateErr } = await client
            .from(tableName)
            .update(updatePayload)
            .eq('email', user.email)
            .select()
            .maybeSingle();

        if (updatedRow) {
            console.log(`✅ [Segmentación DB] Fila existente vinculada con éxito con auth_user_id (${user.id}) en '${tableName}':`, updatedRow);
            return;
        }

        if (updateErr) {
            console.warn(`ℹ️ [Segmentación DB Nota al actualizar]:`, updateErr.message);
        }

        // 2. Si la fila no existía aún en la tabla, insertarla
        const insertPayload = {
            auth_user_id: user.id,
            email: user.email,
            nombre: nombreReal || user.email.split('@')[0],
            telefono: telReal || null,
            rol: tableName === 'nannys' ? 'nanny' : (tableName === 'staff' ? 'staff' : 'cliente')
        };

        if (tableName !== 'staff') {
            insertPayload.activo = true;
        }

        if (tableName === 'staff') {
            insertPayload.es_admin = updatePayload.es_admin;
            insertPayload.supervision = updatePayload.supervision;
            insertPayload.rh = updatePayload.rh;
        }

        const { data: insertedRow, error: insertErr } = await client
            .from(tableName)
            .insert(insertPayload)
            .select()
            .maybeSingle();

        if (insertErr) {
            console.warn(`⚠️ [Segmentación DB Error al insertar]:`, insertErr.message);
        } else {
            console.log(`✅ [Segmentación DB] Nueva fila creada y vinculada en '${tableName}':`, insertedRow);
        }
    } catch (dbErr) {
        console.warn(`⚠️ [Segmentación DB Excepción]:`, dbErr.message);
    }
}

/**
 * Autenticación con Supabase Auth + MIGRACIÓN TRANSPARENTE (Lazy Migration)
 */
async function loginSupabase() {
    const emailInput = document.getElementById('supaEmailInput');
    const passInput = document.getElementById('supaPassInput');
    const msgEl = document.getElementById('supaMsg');
    const btnSubmit = document.getElementById('btnSupaSubmit');

    if (!emailInput || !passInput || !msgEl) return;

    const email = emailInput.value.trim().toLowerCase();
    const pass = passInput.value;
    const selectedRole = currentSelectedRole || 'nanny';

    if (!email || !pass) {
        msgEl.className = 'supa-msg err';
        msgEl.textContent = 'Por favor, ingresa tu correo y contraseña.';
        return;
    }

    msgEl.className = 'supa-msg';
    msgEl.textContent = 'Validando credenciales...';
    if (btnSubmit) {
        btnSubmit.classList.add('loading');
        btnSubmit.setAttribute('disabled', 'true');
    }

    try {
        // 🧹 Limpiar cualquier sesión residual previa para evitar fugas de tokens inválidos
        if (typeof SESION !== 'undefined') SESION.token = null;
        localStorage.removeItem('nyp_sesion');

        const client = getSupabaseClient();
        console.log(`🔐 [Login Supabase] Validando credenciales para ${email} (Rol: ${selectedRole})`);

        // 1. INTENTAR PRIMERO LOGIN NATIVO DIRECTO EN SUPABASE AUTH
        let supaUser = null;
        let supaSession = null;
        let supaRoleData = null;

        if (client) {
            try {
                const { data: supaLoginData, error: supaLoginErr } = await client.auth.signInWithPassword({
                    email: email,
                    password: pass
                });

                if (supaLoginData?.user) {
                    supaUser = supaLoginData.user;
                    supaSession = supaLoginData.session;
                    console.log("✅ [Supabase Auth OK] Usuario autenticado nativamente:", supaUser.id);

                    // Consultar datos de perfil en su tabla pública
                    let targetTable = 'clientes';
                    if (selectedRole === 'nanny') targetTable = 'nannys';
                    else if (selectedRole === 'staff') targetTable = 'staff';

                    const { data: rowData } = await client
                        .from(targetTable)
                        .select('*')
                        .eq('email', email)
                        .maybeSingle();

                    if (rowData) supaRoleData = rowData;
                }
            } catch (nativeErr) {
                console.warn("ℹ️ [Supabase Auth Native Catch]:", nativeErr.message);
            }
        }

        // 2. VALIDAR / SINCRONIZAR CON BACKEND (Google Sheets para obtener token de operaciones si existe)
        let res = null;
        try {
            const rolBackend = selectedRole === 'familia' ? 'cliente' : (selectedRole === 'nanny' ? 'nanny' : 'staff');
            const loginPromise = api('login', { 
                email, 
                contrasena: pass, 
                rol: rolBackend 
            });

            // Timeout ágil para no frenar a usuarios que ya están validados en Supabase
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('El servidor tardó en responder.')), 6000)
            );

            res = await Promise.race([loginPromise, timeoutPromise]);
            console.log("✅ [Backend OK] Credenciales sincronizadas con backend tradicional.");
        } catch (apiErr) {
            console.warn("ℹ️ [Backend Sync Nota]:", apiErr.message);
            // Si el usuario NO existe en Supabase y el backend tradicional también falló,
            // entonces las credenciales son realmente inválidas.
            if (!supaUser) {
                throw new Error(apiErr.message || 'Correo o contraseña incorrectos.');
            }
            console.info("⚡ Usuario autenticado directamente con credenciales de Supabase Auth.");
        }

        // Si falló tanto en Supabase como en el backend tradicional:
        if (!supaUser && (!res || !res.token)) {
            throw new Error('Correo o contraseña incorrectos.');
        }

        // 3. MIGRACIÓN AUTOMÁTICA A SUPABASE SI AÚN NO ESTABA REGISTRADO EN SUPABASE
        if (!supaUser && res && client) {
            console.log("🚀 [Lazy Migration] Registrando usuario en Supabase Auth...");
            if (pass.length >= 6) {
                try {
                    const { data: signUpData, error: signUpErr } = await client.auth.signUp({
                        email: email,
                        password: pass,
                        options: {
                            data: {
                                role: selectedRole,
                                nombre: res.nombre || email.split('@')[0],
                                telefono: res.telefono || null
                            }
                        }
                    });

                    if (signUpData?.user) {
                        supaUser = signUpData.user;
                        console.log("🎉 [Supabase Auth Migrado] Usuario creado en Supabase Auth:", supaUser.id);
                    }
                } catch (e) {}
            }

            if (supaUser) {
                await sincronizarPerfilEnTabla(client, supaUser, selectedRole, res);
            }
        }

        // 4. VERIFICAR SI LA CUENTA ESTÁ ACTIVA (SEGURIDAD Y CONTROL ADMIN)
        if (client) {
            let tableToCheck = null;
            if (selectedRole === 'familia') tableToCheck = 'clientes';
            else if (selectedRole === 'nanny') tableToCheck = 'nannys';

            if (tableToCheck) {
                if (!supaRoleData || typeof supaRoleData.activo === 'undefined') {
                    const { data: checkRow } = await client
                        .from(tableToCheck)
                        .select('activo')
                        .eq('email', email)
                        .maybeSingle();
                    if (checkRow) {
                        supaRoleData = { ...(supaRoleData || {}), activo: checkRow.activo };
                    }
                }

                if (supaRoleData && supaRoleData.activo === false) {
                    console.warn(`⛔ [Acceso Bloqueado] Usuario inactivo intentó iniciar sesión: ${email}`);
                    if (client.auth) {
                        try { await client.auth.signOut(); } catch (e) {}
                    }
                    localStorage.removeItem('nyp_sesion');
                    localStorage.removeItem('last_login_data');
                    throw new Error("⛔ Tu cuenta se encuentra inactiva. El acceso a la aplicación ha sido bloqueado por la administración. Por favor comunícate con soporte.");
                }
            }
        }

        // 5. DETERMINAR ROL Y PERMISOS DE LA CUENTA
        const isCliente = selectedRole === 'familia';
        const rolNorm = String(supaRoleData?.rol || res?.rol || '').toLowerCase();
        const isAdmin = !!(supaRoleData?.es_admin || res?.es_admin || res?.admin || rolNorm === 'admin');
        const isSupervision = !!(supaRoleData?.supervision || res?.supervision || rolNorm === 'supervision');
        const isRh = !!(supaRoleData?.rh || res?.rh || rolNorm === 'rh');

        SESION.email = email;
        // Solo asignar a SESION.token el token tradicional de Apps Script (longitud <= 250 y sin prefijo JWT eyJ)
        const validTraditionalToken = (res?.token && typeof res.token === 'string' && res.token.length <= 250 && !res.token.startsWith('eyJ')) ? res.token : null;
        SESION.token = validTraditionalToken;
        if (supaSession?.access_token) {
            SESION.supabaseAccessToken = supaSession.access_token;
        }
        SESION.nombre = supaRoleData?.nombre || res?.nombre || res?.nombre_del_cliente || email.split('@')[0];
        SESION.admin = isAdmin;
        SESION.supervision = isSupervision;
        SESION.rh = isRh;
        SESION.cliente = isCliente;
        SESION.firebaseToken = res?.firebaseToken || null;
        if (supaUser?.id) SESION.supabaseUid = supaUser.id;

        document.body.classList.remove('admin', 'supervision', 'ninera', 'cliente', 'rh');
        if (SESION.admin) document.body.classList.add('admin');
        else if (SESION.supervision) document.body.classList.add('supervision');
        else if (SESION.rh) document.body.classList.add('rh');
        else if (SESION.cliente) document.body.classList.add('cliente');
        else document.body.classList.add('ninera');

        window.SESION = SESION;
        localStorage.setItem('nyp_sesion', JSON.stringify(SESION));
        localStorage.setItem('last_login_data', JSON.stringify({ email: SESION.email, cliente: SESION.cliente }));

        msgEl.className = 'supa-msg success';
        msgEl.textContent = '¡Bienvenido! Entrando al panel...';

        // 5. AUTENTICACIÓN FIREBASE (SI CORRESPONDE)
        if (email) {
            (async () => {
                try {
                    const { db, asegurarAutenticacionFirebase } = await import('./firebase-config.js');
                    const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
                    const auth = firebaseAuthModule.getAuth(db.app);
                    await asegurarAutenticacionFirebase(auth, email);
                } catch (fbErr) {
                    console.warn("⚠️ Firebase Auth silenciosa falló:", fbErr.message);
                }
            })();
        }

        // 6. OCULTAR LOGIN INMEDIATAMENTE Y MOSTRAR PRELOADER
        document.getElementById('auth').style.display = 'none';
        const preloader = document.getElementById('login-preloader');
        if (preloader) preloader.style.display = 'flex';

        // Pre-carga de vistas
        const startTime = Date.now();
        const promesasCarga = (async () => {
            try {
                if (SESION.admin) {
                    if (typeof mostrarVistaAdmin === 'function') mostrarVistaAdmin();
                } else if (SESION.supervision) {
                    await Promise.all([
                        typeof cargarPerfil === 'function' ? cargarPerfil() : Promise.resolve(),
                        typeof actualizarPlaneacionesSupervision === 'function' ? actualizarPlaneacionesSupervision() : Promise.resolve()
                    ]);
                } else if (SESION.rh) {
                    if (typeof cargarPerfil === 'function') await cargarPerfil();
                } else if (SESION.cliente) {
                    if (typeof mostrarVistaCliente === 'function') await mostrarVistaCliente(false, true);
                } else {
                    if (typeof mostrarVistaNinera === 'function') await mostrarVistaNinera();
                }
            } catch (errCarga) {
                console.error("⚠️ Error en pre-carga de datos de la app:", errCarga);
            }
        })();

        await Promise.race([
            promesasCarga,
            new Promise(resolve => setTimeout(resolve, 5000))
        ]);

        const tiempoTranscurrido = Date.now() - startTime;
        const tiempoRestante = Math.max(0, 1000 - tiempoTranscurrido);

        setTimeout(() => {
            // Ocultar preloader con desvanecimiento elegante
            if (preloader) {
                preloader.style.transition = 'opacity 0.4s ease';
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    preloader.style.opacity = '1';
                }, 400);
            }

            // Configurar barra y vista activa
            const headerAdmin = document.getElementById('header-admin');
            if (headerAdmin) {
                headerAdmin.style.display = (SESION.admin || SESION.supervision || SESION.rh) ? 'block' : 'none';
            }

            document.querySelectorAll('.bottom-nav').forEach(n => n.style.display = 'none');

            if (SESION.admin) {
                if (typeof mostrarVistaAdmin === 'function') mostrarVistaAdmin();
            } else if (SESION.supervision) {
                if (typeof irVista === 'function') irVista('supervision');
            } else if (SESION.rh) {
                if (typeof irVista === 'function') irVista('rh');
            } else if (SESION.cliente) {
                const navDefault = document.querySelector('.bottom-nav:not(#nav-supervision):not(#nav-ventas):not(#nav-rh)');
                if (navDefault) navDefault.style.display = 'flex';
                if (typeof irVista === 'function') irVista('inicio');
            } else {
                const navDefault = document.querySelector('.bottom-nav:not(#nav-supervision):not(#nav-ventas):not(#nav-rh)');
                if (navDefault) navDefault.style.display = 'flex';
                if (typeof irVista === 'function') irVista('inicio');
            }

            // Mostrar el contenedor principal de la app
            const appDiv = document.getElementById('app');
            if (appDiv) {
                appDiv.style.display = 'block';
                appDiv.style.opacity = '0';
                appDiv.style.transition = 'opacity 0.4s ease';
                appDiv.offsetHeight;
                appDiv.style.opacity = '1';
            }
        }, tiempoRestante);

    } catch (err) {
        console.error("❌ [Login Error]:", err);
        // Si falló el login, asegurar que no quede ninguna sesión guardada
        localStorage.removeItem('nyp_sesion');
        if (typeof SESION !== 'undefined') SESION.token = null;

        msgEl.className = 'supa-msg err';
        let friendlyMsg = err.message || 'Error al iniciar sesión.';
        
        if (friendlyMsg.includes('Failed to fetch') || friendlyMsg.includes('NetworkError')) {
            friendlyMsg = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
        } else if (friendlyMsg.includes('Petición no permitida') || friendlyMsg.includes('Integridad')) {
            friendlyMsg = 'Credenciales no válidas. Intenta nuevamente.';
        }
        
        msgEl.textContent = friendlyMsg;

        // Pequeño efecto visual de sacudida (shake) en el botón o formulario para indicar error
        const formStep = document.getElementById('supaFormStep');
        if (formStep) {
            formStep.style.animation = 'none';
            formStep.offsetHeight; // Forzar reflow
            formStep.style.animation = 'supaShake 0.4s ease';
        }
    } finally {
        if (btnSubmit) {
            btnSubmit.classList.remove('loading');
            btnSubmit.removeAttribute('disabled');
        }
    }
}

// Auto-inicializar preferencia al cargar la ventana (Siempre Supabase Auth oficial)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        switchLoginMode('supabase');
        getSupabaseClient();
    }, 100);
});

