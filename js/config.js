/**
 * ARCHIVO DE CONFIGURACIÓN DE ENTORNOS
 * Este archivo detecta automáticamente si estás en LOCAL (Live Server)
 * o en PRODUCCIÓN (GitHub) para usar las llaves correctas.
 */

const CONFIG = {
    // Detectar si estamos en localhost o 127.0.0.1
    IS_DEV: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // URLs de la API de Google Apps Script
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://script.google.com/macros/s/AKfycbzTimtRo5eq5zpBFkOnsCTqW9wEtd9YgLUMdsKBOTwwa81gYisXwtTEDkiJkJ-5cbOC/exec'
        : 'https://script.google.com/macros/s/AKfycbyaXxP9NjCLwv-zqwkpQVmVxQBX_iM15Hpghg4nKNO6B9Z7hfJKFUNh4xK5doLFUEc/exec',

    // Configuración Supabase
    SUPABASE_URL: (window.localStorage.getItem('nyp_supabase_url') || '').trim() || 'https://tcysqleovtfpdzlsgdqm.supabase.co',
    SUPABASE_ANON_KEY: (window.localStorage.getItem('nyp_supabase_key') || '').trim() || 'sb_publishable_Axs3rWyxt8-RxcyIU6XBVA_LNMDypeS',

    // Endpoint del Cloudflare Push & Auth Worker
    WORKER_URL: (() => {
        const stored = (window.localStorage.getItem('nyp_worker_url') || '').trim();
        if (stored && !stored.includes('pinedagerardo1')) return stored;
        if (stored && stored.includes('pinedagerardo1')) {
            window.localStorage.removeItem('nyp_worker_url');
        }
        return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://127.0.0.1:8787'
            : 'https://nannys-push-worker.nannysypeques.workers.dev';
    })(),

    // Mostrar aviso de entorno en consola
    init() {
        if (this.IS_DEV) {
            console.warn('%c 🛠️ MODO DESARROLLO (LOCAL) ACTIVO ', 'background: #ffcc00; color: #000; font-weight: bold; padding: 4px; border-radius: 4px;');
        }
    }
};

// Helper global de escape y sanitización XSS (OWASP ASVS 5.0 V5)
window.escapeHTML = function (val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'string') {
        const trimmed = val.trim().toLowerCase();
        if (trimmed === 'undefined' || trimmed === 'null') return '';
        return val
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    if (typeof val === 'object') {
        try {
            val = JSON.stringify(val);
        } catch (_) {
            val = String(val);
        }
    }
    const str = String(val);
    if (str.trim().toLowerCase() === 'undefined' || str.trim().toLowerCase() === 'null') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};
window.sanitizeHTML = window.escapeHTML;

// Inicializar configuración
CONFIG.init();