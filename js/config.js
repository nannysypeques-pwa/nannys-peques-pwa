/**
 * ARCHIVO DE CONFIGURACIÓN DE ENTORNOS
 * Este archivo detecta automáticamente si estás en LOCAL (Live Server)
 * o en PRODUCCIÓN (GitHub) para usar las llaves correctas.
 */

const CONFIG = {
    // Detectar si estamos en localhost o 127.0.0.1
    IS_DEV: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // URLs de la API de Google Apps Script
    // URL PROD: ... Hpghg4nKNO6B9Z7hfJKFUNh4xK5doLFUEc/exec
    // URL DEV (sandbox): ... 5cbOC/exec
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://script.google.com/macros/s/AKfycbzTimtRo5eq5zpBFkOnsCTqW9wEtd9YgLUMdsKBOTwwa81gYisXwtTEDkiJkJ-5cbOC/exec'
        : 'https://script.google.com/macros/s/AKfycbyaXxP9NjCLwv-zqwkpQVmVxQBX_iM15Hpghg4nKNO6B9Z7hfJKFUNh4xK5doLFUEc/exec',

    // Mostrar aviso de entorno en consola
    init() {
        if (this.IS_DEV) {
            console.warn('%c 🛠️ MODO DESARROLLO (LOCAL) ACTIVO ', 'background: #ffcc00; color: #000; font-weight: bold; padding: 4px; border-radius: 4px;');
        }
    }
};

// Inicializar configuración
CONFIG.init();