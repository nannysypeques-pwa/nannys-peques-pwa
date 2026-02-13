/* ========================================
   PRELOADER MODAL PLANEACIONES
   ======================================== */

function mostrarPreloaderModal() {
    // Buscar el modal de planeaciones
    const modalCard = document.querySelector('#planeacionBackdrop .modal-card');
    if (!modalCard) return;

    let preloader = document.getElementById('planeacion-preloader');
    if (!preloader) {
        // Crear preloader DENTRO del modal
        preloader = document.createElement('div');
        preloader.id = 'planeacion-preloader';
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
            border-radius: 16px;
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
        text.textContent = 'Cargando planeación...';
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
    }

    preloader.style.display = 'flex';

    // Ocultar wrapper de contenido (para que el preloader sea lo único visible y limpio)
    const contentWrapper = document.getElementById('planeacion-content-wrapper');
    if (contentWrapper) {
        contentWrapper.style.display = 'none';
        modalCard.style.minHeight = '300px'; // Mantener altura mínima
    }
}

function ocultarPreloaderModal() {
    const preloader = document.getElementById('planeacion-preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }

    // Mostrar wrapper de contenido nuevamente
    const contentWrapper = document.getElementById('planeacion-content-wrapper');
    const modalCard = document.querySelector('#planeacionBackdrop .modal-card');
    if (contentWrapper) {
        contentWrapper.style.display = '';
        if (modalCard) modalCard.style.minHeight = '';
    }
}
