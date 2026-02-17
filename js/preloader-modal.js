/* ========================================
   PRELOADER MODAL GENÉRICO
   ======================================== */

/**
 * Muestra un preloader premium dentro de un modal específico
 * @param {string} backdropId ID del backdrop del modal (ej: 'planeacionBackdrop')
 * @param {string} wrapperId ID del contenedor de contenido a ocultar (ej: 'planeacion-content-wrapper')
 * @param {string} loadingText Texto a mostrar (ej: 'Cargando planeación...')
 */
function mostrarPreloaderModal(backdropId = 'planeacionBackdrop', wrapperId = 'planeacion-content-wrapper', loadingText = 'Cargando...') {
    // Buscar el modal-card dentro del backdrop
    const backdrop = document.getElementById(backdropId);
    if (!backdrop) return;

    const modalCard = backdrop.querySelector('.modal-card');
    if (!modalCard) return;

    // El ID del preloader será dinámico para evitar colisiones si se usan múltiples
    const preloaderId = `${backdropId}-preloader`;
    let preloader = document.getElementById(preloaderId);

    if (!preloader) {
        // Crear preloader DENTRO del modal
        preloader = document.createElement('div');
        preloader.id = preloaderId;
        preloader.className = 'modal-preloader-premium'; // Clase para estilos si se prefiere, o usar cssText
        preloader.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.98);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
            border-radius: 28px;
        `;

        const logoContainer = document.createElement('div');
        logoContainer.style.cssText = `
            width: 100px;
            height: 100px;
            position: relative;
        `;

        const logo = document.createElement('img');
        logo.src = 'logo-sin-fondo.png';
        logo.alt = 'Cargando...';
        logo.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(0 0 15px rgba(232, 76, 154, 0.3));
            animation: breathingGlow 3s ease-in-out infinite;
        `;

        const text = document.createElement('p');
        text.className = 'preloader-text';
        text.textContent = loadingText;
        text.style.cssText = `
            color: #e84c9a;
            font-size: 15px;
            font-weight: 600;
            margin-top: 16px;
            font-family: 'Quicksand', sans-serif;
        `;

        logoContainer.appendChild(logo);
        preloader.appendChild(logoContainer);
        preloader.appendChild(text);

        // Asegurar que el modal-card tenga position relative
        modalCard.style.position = 'relative';
        modalCard.appendChild(preloader);
    } else {
        // Actualizar texto si ya existe
        const textEl = preloader.querySelector('.preloader-text');
        if (textEl) textEl.textContent = loadingText;
    }

    preloader.style.display = 'flex';

    // Ocultar wrapper de contenido
    const contentWrapper = document.getElementById(wrapperId);
    if (contentWrapper) {
        contentWrapper.style.display = 'none';
        modalCard.style.minHeight = '300px';
    }
}

/**
 * Oculta el preloader de un modal específico
 */
function ocultarPreloaderModal(backdropId = 'planeacionBackdrop', wrapperId = 'planeacion-content-wrapper') {
    const preloaderId = `${backdropId}-preloader`;
    const preloader = document.getElementById(preloaderId);
    if (preloader) {
        preloader.style.display = 'none';
    }

    // Mostrar wrapper de contenido nuevamente
    const contentWrapper = document.getElementById(wrapperId);
    const backdrop = document.getElementById(backdropId);
    const modalCard = backdrop ? backdrop.querySelector('.modal-card') : null;

    if (contentWrapper) {
        contentWrapper.style.display = '';
        if (modalCard) modalCard.style.minHeight = '';
    }
}
