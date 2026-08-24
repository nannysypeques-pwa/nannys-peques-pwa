/**
 * Módulo de Recursos Humanos (RH) - Nannys y Peques
 * Control de Capacitaciones y Novedades.
 */

const RHPanel = {
    state: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        selectedDate: new Date().toISOString().slice(0, 10),
        capacitaciones: [],
        inscripciones: {} // capacitacionId -> array of nanny enrollees
    },

    init: async function () {
        console.log("RHPanel.init(): Inicializando panel de Recursos Humanos...");
        this.inyectarEstilos();
        this.renderSkeleton();
        
        // Cargar datos de Firestore
        await this.cargarDatos();

        // Bind event handlers
        this.bindEvents();
    },

    inyectarEstilos: function () {
        if (document.getElementById('rh-styles')) return;

        const style = document.createElement('style');
        style.id = 'rh-styles';
        style.innerHTML = `
            :root {
                --blue-hover: #2fa1af;
            }
            .rh-dashboard-container {
                max-width: 1100px;
                margin: 0 auto;
                padding: 10px 20px 80px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                color: var(--text-main);
            }
            .rh-layout-grid {
                display: grid;
                grid-template-columns: 2.1fr 0.9fr;
                gap: 25px;
                margin-top: 15px;
            }
            @media (max-width: 850px) {
                .rh-layout-grid {
                    grid-template-columns: 1fr;
                }
            }
            .rh-card {
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.6);
                border-radius: 24px;
                padding: 25px;
                box-shadow: 0 15px 35px rgba(145, 69, 104, 0.05);
                transition: all 0.3s ease;
            }
            .rh-card-title {
                font-size: 20px;
                font-weight: 800;
                margin: 0 0 20px 0;
                font-family: 'DM Serif Display', serif;
                border-left: 5px solid var(--pink-main);
                padding-left: 12px;
                color: var(--text-main);
                letter-spacing: 0.2px;
            }
            
            /* Calendar Header */
            .rh-cal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                background: #f8fafc;
                padding: 8px 12px;
                border-radius: 16px;
                border: 1px solid #f1f5f9;
            }
            .rh-cal-title {
                font-weight: 800;
                font-size: 15px;
                color: var(--text-main);
                font-family: 'Plus Jakarta Sans', sans-serif;
                letter-spacing: 0.5px;
            }
            .rh-cal-btn {
                background: white;
                border: 1px solid #e2e8f0;
                font-size: 12px;
                cursor: pointer;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            }
            .rh-cal-btn:hover {
                background: #f1f5f9;
                transform: scale(1.05);
                border-color: #cbd5e1;
            }
            
            /* Calendar Grid */
            .rh-cal-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
                text-align: center;
                margin-bottom: 10px;
            }
            .rh-cal-day-header {
                font-weight: 800;
                font-size: 11px;
                color: var(--pink-main);
                padding: 5px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
                opacity: 0.8;
            }
            .rh-cal-cell {
                height: 95px;
                min-width: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 6px 4px;
                border-radius: 14px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 700;
                position: relative;
                transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                background: white;
                border: 1px solid #f1f5f9;
                box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                box-sizing: border-box;
                overflow: hidden;
            }
            .rh-cal-cell:hover {
                background: #f8fafc;
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                border-color: #cbd5e1;
            }
            .rh-cal-cell.other-month {
                color: #cbd5e1;
                background: none;
                border-color: transparent;
                cursor: default;
                box-shadow: none;
            }
            .rh-cal-cell.other-month:hover {
                background: none;
                transform: none;
                box-shadow: none;
                border-color: transparent;
            }
            .rh-cal-cell.today {
                border: 2px solid var(--pink-main) !important;
            }
            .rh-cal-cell.today .rh-cal-day-num {
                color: var(--pink-main);
            }
            .rh-cal-cell.today.selected {
                background: #fff5f8 !important;
            }
            .rh-cal-cell.today.selected .rh-cal-day-num {
                background: var(--pink-main);
                color: white;
            }
            .rh-cal-cell.selected:not(.today) {
                border-color: var(--blue-main) !important;
                background: #f8fafc !important;
                box-shadow: 0 4px 12px rgba(59, 182, 196, 0.08);
            }
            .rh-cal-cell.selected:not(.today) .rh-cal-day-num {
                background: var(--blue-main);
                color: white;
                box-shadow: 0 2px 6px rgba(59, 182, 196, 0.3);
            }
            .rh-cal-day-num {
                font-size: 13px;
                font-weight: 800;
                margin-bottom: 4px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            .rh-cal-pill {
                font-size: 9px;
                font-weight: 700;
                color: white;
                padding: 3px 5px;
                border-radius: 6px;
                width: 95%;
                text-align: center;
                line-height: 1.15;
                word-break: break-word;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-top: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.08);
                box-sizing: border-box;
            }
            .rh-cal-pill.rh-cal-pill-mini {
                font-size: 8px;
                padding: 2px 4px;
                margin-top: 2px;
                border-radius: 4px;
                -webkit-line-clamp: 1;
            }
            
            /* Day details section */
            .rh-day-details-title {
                font-size: 14px;
                font-weight: 800;
                margin: 25px 0 12px 0;
                color: var(--text-main);
                border-top: 1px dashed #e2e8f0;
                padding-top: 20px;
                display: flex;
                align-items: center;
                gap: 6px;
                text-transform: capitalize;
            }
            .rh-day-courses-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 20px;
            }
            .rh-mini-course-item {
                background: white;
                border: 1px solid rgba(232, 76, 154, 0.15);
                border-radius: 16px;
                padding: 12px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                transition: transform 0.2s;
            }
            .rh-mini-course-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(232, 76, 154, 0.05);
            }
            .rh-mini-course-info h5 {
                margin: 0 0 4px 0;
                font-size: 14px;
                font-weight: 800;
                color: var(--text-main);
            }
            .rh-mini-course-info p {
                margin: 0;
                font-size: 12px;
                color: var(--text-muted);
            }
            .rh-no-courses {
                font-size: 13px;
                color: var(--text-muted);
                text-align: center;
                padding: 20px;
                background: #f8fafc;
                border-radius: 16px;
                border: 1px dashed #cbd5e1;
            }
            
            /* Dynamic courses list container */
            .rh-course-card-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .rh-course-item {
                background: white;
                border: 1px solid rgba(0,0,0,0.04);
                border-radius: 20px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 15px;
                transition: all 0.3s ease;
                box-shadow: 0 6px 20px rgba(0,0,0,0.01);
            }
            .rh-course-item:hover {
                transform: translateY(-4px) scale(1.01);
                box-shadow: 0 15px 35px rgba(145, 69, 104, 0.06);
                border-color: rgba(232, 76, 154, 0.2);
            }
            .rh-course-item-img {
                width: 100%;
                height: 120px;
                object-fit: cover;
                border-radius: 16px;
                flex-shrink: 0;
                border: 1px solid #f1f5f9;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            }
            .rh-course-item-body {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
            .rh-course-item-title {
                font-size: 18px;
                font-weight: 800;
                margin: 0 0 6px 0;
                color: var(--text-main);
                font-family: 'DM Serif Display', serif;
            }
            .rh-course-item-desc {
                font-size: 13px;
                color: var(--text-muted);
                line-height: 1.5;
                margin: 0 0 12px 0;
            }
            .rh-course-item-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                font-size: 12px;
                color: var(--text-muted);
                margin-bottom: 12px;
                background: #f8fafc;
                padding: 8px 12px;
                border-radius: 10px;
                width: fit-content;
            }
            .rh-course-item-actions {
                margin-top: auto;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            /* Premium Buttons styling */
            .rh-btn {
                padding: 10px 18px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 13px;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.03);
            }
            .rh-btn-primary {
                background: var(--blue-main);
                color: white;
                box-shadow: 0 4px 12px rgba(59, 182, 196, 0.3);
            }
            .rh-btn-primary:hover {
                background: var(--blue-hover);
                transform: scale(1.02);
                box-shadow: 0 6px 18px rgba(59, 182, 196, 0.4);
            }
            .rh-btn-ghost {
                background: #f1f5f9;
                color: #475569;
                border: 1px solid #e2e8f0;
            }
            .rh-btn-ghost:hover {
                background: #e2e8f0;
                border-color: #cbd5e1;
            }
            .rh-btn-danger {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fee2e2;
            }
            .rh-btn-danger:hover {
                background: #fee2e2;
                border-color: #fca5a5;
            }
            .rh-btn-small {
                padding: 8px 14px;
                font-size: 12px;
                border-radius: 10px;
            }
            .rh-badge-count {
                background: var(--pink-main);
                color: white;
                padding: 2px 8px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 800;
                box-shadow: 0 2px 6px rgba(232, 76, 154, 0.4);
            }
            
            /* Modal styling */
            .rh-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
                z-index: 1100;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .rh-modal-card {
                background: white;
                border-radius: 24px;
                width: 100%;
                max-width: 500px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.15);
                overflow: hidden;
                animation: rhFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                flex-direction: column;
                max-height: 90vh;
                border: 1px solid rgba(0,0,0,0.05);
            }
            @keyframes rhFadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .rh-modal-header {
                background: linear-gradient(135deg, var(--blue-main), var(--blue-hover));
                color: white;
                padding: 18px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .rh-modal-header h3 {
                margin: 0;
                color: white !important;
                font-family: 'DM Serif Display', serif;
                font-size: 20px;
            }
            .rh-modal-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 14px;
                cursor: pointer;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            .rh-modal-close:hover {
                background: rgba(255, 255, 255, 0.4);
            }
            .rh-modal-body {
                padding: 24px;
                overflow-y: auto;
                flex-grow: 1;
            }
            .rh-modal-footer {
                padding: 15px 24px;
                border-top: 1px solid #f1f5f9;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                background: #fafafa;
            }
            .rh-form-group {
                margin-bottom: 18px;
            }
            .rh-form-group label {
                display: block;
                font-weight: 700;
                font-size: 11px;
                color: #475569;
                margin-bottom: 6px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
            }
            .rh-input {
                width: 100%;
                padding: 11px 14px;
                border-radius: 12px;
                border: 1px solid #cbd5e1;
                font-size: 13px;
                box-sizing: border-box;
                font-family: inherit;
                transition: all 0.2s;
            }
            .rh-input:focus {
                outline: none;
                border-color: var(--blue-main);
                box-shadow: 0 0 0 3px rgba(59, 182, 196, 0.15);
            }
            
            /* File Upload dropzone style */
            .rh-file-dropzone {
                border: 2px dashed #cbd5e1;
                padding: 15px;
                border-radius: 12px;
                text-align: center;
                background: #f8fafc;
                cursor: pointer;
                transition: all 0.2s;
            }
            .rh-file-dropzone:hover {
                border-color: var(--blue-main);
                background: #f0f9ff;
            }
            
            /* Table inside enrollees modal */
            .rh-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
                text-align: left;
            }
            .rh-table th {
                font-weight: 800;
                color: var(--text-muted);
                border-bottom: 2px solid #e2e8f0;
                padding: 12px 10px;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .rh-table td {
                padding: 12px 10px;
                border-bottom: 1px solid #f1f5f9;
            }
            .rh-table tr:hover td {
                background: #f8fafc;
            }
            .swal2-container {
                z-index: 1200 !important;
            }
        `;
        document.head.appendChild(style);
    },

    renderSkeleton: function () {
        const container = document.getElementById('vista-rh');
        if (!container) return;

        // Actualizar saludo del encabezado general admin
        const saludoAdmin = document.getElementById('saludo-admin');
        if (saludoAdmin && window.SESION) {
            saludoAdmin.innerHTML = `¡Hola, <b>${window.SESION.nombre || 'Administrador'}</b>! <span style="font-size:12px; font-weight:normal; opacity:0.8; margin-left:8px;">[Recursos Humanos]</span>`;
        }

        container.innerHTML = `
            <!-- Subvista 1: Calendario (Principal) -->
            <div id="rh-subvista-calendario" class="rh-subvista">
                <div class="rh-dashboard-container">
                    <div class="rh-layout-grid">
                        <!-- Left column: Calendar & Actions -->
                        <div class="rh-card">
                            <h3 class="rh-card-title">Calendario de Capacitaciones</h3>
                            <div class="rh-cal-header">
                                <button class="rh-cal-btn" id="rh-prev-month">◀</button>
                                <span class="rh-cal-title" id="rh-month-title">Agosto 2026</span>
                                <button class="rh-cal-btn" id="rh-next-month">▶</button>
                            </div>
                            <div class="rh-cal-grid" id="rh-cal-days">
                                <!-- JS will inject days -->
                            </div>
                            
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:15px;">
                                <button class="rh-btn rh-btn-primary" style="justify-content:center; border-radius:14px;" id="rh-btn-agregar-hoy">
                                    ➕ Programar
                                </button>
                                <button class="rh-btn rh-btn-ghost" style="justify-content:center; border-radius:14px; border:1px solid #cbd5e1;" onclick="RHPanel.exportarCalendarioComoImagen()">
                                    📸 Compartir Imagen
                                </button>
                            </div>
                        </div>

                        <!-- Right column: Selected day courses list -->
                        <div class="rh-card">
                            <h3 class="rh-card-title" id="rh-courses-list-title">Capacitaciones del Día</h3>
                            <div class="rh-course-card-list" id="rh-courses-list-container">
                                <div class="rh-no-courses">Selecciona un día en el calendario para ver las capacitaciones.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Subvista 2: Base de Datos de Capacitaciones -->
            <div id="rh-subvista-capacitaciones" class="rh-subvista" style="display:none;">
                <div class="rh-dashboard-container">
                    <div class="rh-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                            <h3 class="rh-card-title" style="margin:0;">Base de Datos de Capacitaciones</h3>
                            <button class="rh-btn rh-btn-primary" onclick="RHPanel.abrirTemplateModal()" style="border-radius:14px;">
                                ➕ Crear Capacitación
                            </button>
                        </div>
                        <div id="rh-templates-list" class="rh-course-card-list" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                            <div class="rh-no-courses">No hay capacitaciones dadas de alta. Haz clic en "Crear Capacitación" para empezar.</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Limpiar modales antiguos del body si existen
        const oldForm = document.getElementById('rh-modal-form');
        const oldInsc = document.getElementById('rh-modal-inscritas');
        const oldTemp = document.getElementById('rh-modal-template');
        const oldDesigner = document.getElementById('rh-modal-cert-designer');
        if (oldForm) oldForm.remove();
        if (oldInsc) oldInsc.remove();
        if (oldTemp) oldTemp.remove();
        if (oldDesigner) oldDesigner.remove();

        // 1. Crear modal formulario programar y meterlo directamente al body
        const formDiv = document.createElement('div');
        formDiv.id = 'rh-modal-form';
        formDiv.className = 'rh-modal-overlay';
        formDiv.style.display = 'none';
        formDiv.innerHTML = `
            <div class="rh-modal-card">
                <div class="rh-modal-header">
                    <h3 id="rh-modal-form-title">Programar Capacitación</h3>
                    <button class="rh-modal-close" onclick="RHPanel.cerrarFormModal()">✕</button>
                </div>
                <div class="rh-modal-body">
                    <form id="rh-course-form" onsubmit="RHPanel.guardarCapacitacion(event)">
                        <input type="hidden" id="rh-form-id">
                        
                        <div class="rh-form-group">
                            <label for="rh-form-template-select">Seleccionar Capacitación *</label>
                            <select id="rh-form-template-select" class="rh-input" required>
                                <option value="" disabled selected>Selecciona una capacitación...</option>
                            </select>
                        </div>
                        
                        <div class="rh-form-group">
                            <label for="rh-form-date">Fecha *</label>
                            <input type="date" id="rh-form-date" class="rh-input" required>
                        </div>
                        
                        <div class="rh-form-group" style="margin-bottom: 25px;">
                            <label>Horario *</label>
                            <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:10px; align-items:center;">
                                <div>
                                    <label for="rh-form-time-start" style="font-size:10px; color:#94a3b8; margin-bottom:4px; display:block;">INICIO</label>
                                    <input type="time" id="rh-form-time-start" class="rh-input" required style="text-align:center; font-size:15px; font-weight:700; letter-spacing:1px;">
                                </div>
                                <div style="text-align:center; font-weight:800; color:#94a3b8; font-size:18px; padding-top:18px;">→</div>
                                <div>
                                    <label for="rh-form-time-end" style="font-size:10px; color:#94a3b8; margin-bottom:4px; display:block;">FIN</label>
                                    <input type="time" id="rh-form-time-end" class="rh-input" required style="text-align:center; font-size:15px; font-weight:700; letter-spacing:1px;">
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Acción dentro del Scroll -->
                        <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 10px;">
                            <button type="button" class="rh-btn rh-btn-ghost" onclick="RHPanel.cerrarFormModal()">Cancelar</button>
                            <button type="submit" class="rh-btn rh-btn-primary">Programar Capacitación 🚀</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(formDiv);

        // 2. Crear modal para la Base de Datos (plantilla de capacitaciones) y meterlo directamente al body
        const templateDiv = document.createElement('div');
        templateDiv.id = 'rh-modal-template';
        templateDiv.className = 'rh-modal-overlay';
        templateDiv.style.display = 'none';
        templateDiv.innerHTML = `
            <div class="rh-modal-card">
                <div class="rh-modal-header">
                    <h3 id="rh-modal-template-title">Crear Capacitación</h3>
                    <button class="rh-modal-close" onclick="RHPanel.cerrarTemplateModal()">✕</button>
                </div>
                <div class="rh-modal-body">
                    <form id="rh-template-form" onsubmit="RHPanel.guardarTemplate(event)">
                        <input type="hidden" id="rh-template-id">
                        
                        <div class="rh-form-group">
                            <label for="rh-template-title-input">Título de la Capacitación *</label>
                            <input type="text" id="rh-template-title-input" class="rh-input" required placeholder="Ej: Primeros Auxilios Pediátricos">
                        </div>
                        
                        <div class="rh-form-group">
                            <label for="rh-template-desc-input">Descripción *</label>
                            <textarea id="rh-template-desc-input" class="rh-input" rows="3" required placeholder="Describe brevemente los temas a tratar..." style="resize:vertical;"></textarea>
                        </div>
                        
                        <div class="rh-form-group">
                            <label for="rh-template-price-input">Precio / Costo *</label>
                            <input type="text" id="rh-template-price-input" class="rh-input" required placeholder="Ej: 150 (ó Gratis)">
                        </div>
                        
                        <div class="rh-form-group" style="margin-bottom: 20px;">
                            <label style="font-weight:700; color:#334155; display:block; margin-bottom:8px;">Imagen de Portada / Referencia *</label>
                            <div class="rh-file-dropzone" id="rh-template-dropzone" onclick="document.getElementById('rh-template-image-file').click()" style="cursor:pointer; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 15px; text-align: center; background: #f8fafc;">
                                <span id="rh-template-dropzone-icon" style="font-size:24px; display:block; margin-bottom:4px;">📸</span>
                                <span id="rh-template-dropzone-label" style="font-size:12px; font-weight:700; color:#475569;">Sube la imagen de portada</span>
                                <img id="rh-template-dropzone-preview" src="" alt="" style="display:none; max-height:120px; border-radius:10px; margin-top:10px; object-fit:cover; width:100%;">
                            </div>
                            <input type="file" id="rh-template-image-file" accept="image/*" style="display:none;" onchange="RHPanel.convertirImagenTemplateBase64(this)">
                            <input type="hidden" id="rh-template-image-base64">
                        </div>

                        <div class="rh-form-group" style="margin-bottom: 25px;">
                            <label style="font-weight:700; color:#334155; display:block; margin-bottom:8px;">Formato Base de la Constancia (Imagen) *</label>
                            <div class="rh-file-dropzone" id="rh-template-cert-dropzone" onclick="document.getElementById('rh-template-cert-file').click()" style="cursor:pointer; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 15px; text-align: center; background: #f8fafc; transition: all 0.2s;">
                                <span id="rh-template-cert-icon" style="font-size:24px; display:block; margin-bottom:4px;">🎓</span>
                                <span id="rh-template-cert-label" style="font-size:12px; font-weight:700; color:#475569;">Selecciona el diseño de la constancia</span>
                                <img id="rh-template-cert-preview" src="" alt="" style="display:none; max-height:120px; border-radius:10px; margin-top:10px; object-fit:contain; width:100%;">
                            </div>
                            <input type="file" id="rh-template-cert-file" accept="image/*" style="display:none;" onchange="RHPanel.convertirConstanciaBase64(this)">
                            <input type="hidden" id="rh-template-cert-base64">
                            
                            <!-- Coordenadas guardadas -->
                            <input type="hidden" id="rh-template-cert-pos-name-x" value="50">
                            <input type="hidden" id="rh-template-cert-pos-name-y" value="45">
                            <input type="hidden" id="rh-template-cert-pos-date-x" value="50">
                            <input type="hidden" id="rh-template-cert-pos-date-y" value="70">
                            <input type="hidden" id="rh-template-cert-font-name" value="20">
                            <input type="hidden" id="rh-template-cert-font-date" value="16">
                            
                            <button type="button" id="rh-template-btn-disenar-cert" class="rh-btn" style="margin-top: 12px; width: 100%; display: none; border: 2px solid #3bb6c4; background: white; color: #3bb6c4; border-radius: 12px; padding: 8px; font-size:12px; font-weight:800; cursor: pointer; transition: all 0.2s;" onclick="RHPanel.abrirDisenadorConstancia()">
                                ⚙️ Ajustar Posición de Nombre y Fecha
                            </button>
                        </div>

                        <!-- Botones de Acción dentro del Scroll -->
                        <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 10px;">
                            <button type="button" class="rh-btn rh-btn-ghost" onclick="RHPanel.cerrarTemplateModal()">Cancelar</button>
                            <button type="submit" class="rh-btn rh-btn-primary">Guardar Capacitación 💾</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(templateDiv);

        // 3. Crear modal inscritas y meterlo directamente al body
        const inscDiv = document.createElement('div');
        inscDiv.id = 'rh-modal-inscritas';
        inscDiv.className = 'rh-modal-overlay';
        inscDiv.style.display = 'none';
        inscDiv.innerHTML = `
            <div class="rh-modal-card" style="max-width:600px;">
                <div class="rh-modal-header" style="flex-direction:column; align-items:flex-start; gap:4px;">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <h3 style="margin:0; font-family:'DM Serif Display',serif; font-size:20px; color:white;">Listado de Inscritas</h3>
                        <button class="rh-modal-close" onclick="RHPanel.cerrarInscritasModal()">✕</button>
                    </div>
                    <p id="rh-modal-inscritas-subtitle" style="margin:0; font-size:12px; opacity:0.85; font-weight:normal; color:#e0f2fe;"></p>
                </div>
                <div class="rh-modal-body" style="padding: 20px;">
                    <div id="rh-inscritas-content">
                        <!-- Table of registered nannies -->
                    </div>
                    <div style="display: flex; justify-content: flex-end; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                        <button class="rh-btn rh-btn-ghost" onclick="RHPanel.cerrarInscritasModal()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(inscDiv);

        // 4. Crear modal diseñador de constancia y meterlo directamente al body
        const designerDiv = document.createElement('div');
        designerDiv.id = 'rh-modal-cert-designer';
        designerDiv.className = 'rh-modal-overlay';
        designerDiv.style.display = 'none';
        designerDiv.style.zIndex = '1200'; // z-index superior para estar sobre el modal de creación
        designerDiv.innerHTML = `
            <div class="rh-modal-card" style="max-width: 750px; width: 95%;">
                <div class="rh-modal-header">
                    <h3>Diseñador de Constancia 🎨</h3>
                    <button class="rh-modal-close" onclick="RHPanel.cerrarDisenadorConstancia()">✕</button>
                </div>
                <div class="rh-modal-body" style="padding: 20px; display: flex; flex-direction: column; align-items: center; background: #f8fafc; overflow-y: auto; width: 100%; box-sizing: border-box;">
                    <p style="font-size: 13px; color: #475569; margin: 0 0 15px 0; text-align: center;">
                        Arrastra las etiquetas a su posición y ajusta el tamaño de la letra con los controles inferiores:
                    </p>
                    
                    <!-- Controladores de tamaño de letra -->
                    <div style="display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap; justify-content: center; width: 100%; max-width: 650px; background: white; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); box-sizing: border-box;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <label style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">Letra Nombre:</label>
                            <input type="range" id="rh-cert-slider-name" min="10" max="45" value="20" style="accent-color: #3bb6c4; width: 90px; cursor: pointer;" oninput="RHPanel.actualizarTamanoLetra('name', this.value)">
                            <span id="rh-cert-val-name" style="font-size: 11px; font-weight: 800; color: #3bb6c4; width: 32px; display: inline-block;">20px</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; border-left: 1px solid #e2e8f0; padding-left: 15px;">
                            <label style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">Letra Fecha:</label>
                            <input type="range" id="rh-cert-slider-date" min="10" max="45" value="16" style="accent-color: #f43f5e; width: 90px; cursor: pointer;" oninput="RHPanel.actualizarTamanoLetra('date', this.value)">
                            <span id="rh-cert-val-date" style="font-size: 11px; font-weight: 800; color: #f43f5e; width: 32px; display: inline-block;">16px</span>
                        </div>
                    </div>
                    
                    <!-- Designer Canvas Container -->
                    <div id="rh-cert-canvas-container" style="position: relative; width: 100%; max-width: 650px; background: #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); user-select: none; flex-shrink: 0;">
                        <img id="rh-cert-canvas-img" src="" alt="Formato Base" style="width: 100%; display: block; height: auto; pointer-events: none;">
                        
                        <!-- Drag handles -->
                        <div id="rh-cert-drag-name" style="position: absolute; left: 50%; top: 45%; transform: translate(-50%, -50%); padding: 6px 12px; background: rgba(59, 182, 196, 0.25); border: 2px dashed #3bb6c4; color: #0f766e; border-radius: 6px; font-size: 20px; font-weight: bold; cursor: move; white-space: nowrap; font-family: 'DM Serif Display', serif; text-shadow: 0 1px 0 rgba(255,255,255,0.8); transition: background-color 0.2s;">
                            María Guadalupe Pérez Hernández
                        </div>
                        
                        <div id="rh-cert-drag-date" style="position: absolute; left: 50%; top: 70%; transform: translate(-50%, -50%); padding: 6px 12px; background: rgba(244, 63, 94, 0.25); border: 2px dashed #f43f5e; color: #9f1239; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: move; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; text-shadow: 0 1px 0 rgba(255,255,255,0.8); transition: background-color 0.2s;">
                            31 de diciembre de 2026
                        </div>
                    </div>

                    <!-- Botones de Acción dentro del Scroll -->
                    <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 20px; width: 100%;">
                        <button type="button" class="rh-btn rh-btn-ghost" onclick="RHPanel.cerrarDisenadorConstancia()">Cancelar</button>
                        <button type="button" class="rh-btn rh-btn-primary" onclick="RHPanel.guardarPosicionesConstancia()">Guardar Posiciones 💾</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(designerDiv);
    },

    bindEvents: function () {
        const btnPrev = document.getElementById('rh-prev-month');
        const btnNext = document.getElementById('rh-next-month');
        const btnAgregar = document.getElementById('rh-btn-agregar-hoy');

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                this.state.currentMonth--;
                if (this.state.currentMonth < 0) {
                    this.state.currentMonth = 11;
                    this.state.currentYear--;
                }
                this.renderCalendar();
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                this.state.currentMonth++;
                if (this.state.currentMonth > 11) {
                    this.state.currentMonth = 0;
                    this.state.currentYear++;
                }
                this.renderCalendar();
            });
        }

        if (btnAgregar) {
            btnAgregar.addEventListener('click', () => {
                this.abrirFormModal(this.state.selectedDate);
            });
        }
    },

    cargarDatos: async function () {
        try {
            const { db } = await import('./firebase-config.js');
            const { collection, query, orderBy, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

            // Cancelar listeners previos si existen
            if (this.state.unsubCapacitaciones) this.state.unsubCapacitaciones();
            if (this.state.unsubInscripciones) this.state.unsubInscripciones();
            if (this.state.unsubTemplates) this.state.unsubTemplates();

            // 1. Escuchar capacitaciones en tiempo real
            const q = query(collection(db, 'capacitaciones'), orderBy('fecha', 'asc'));
            this.state.unsubCapacitaciones = onSnapshot(q, (snap) => {
                const caps = [];
                snap.forEach(doc => {
                    caps.push({ id: doc.id, ...doc.data() });
                });
                this.state.capacitaciones = caps;

                this.renderCalendar();
                this.renderSelectedDayCourses();
                
                // Si el modal está abierto en esta capacitación, actualizarlo
                const modal = document.getElementById('rh-modal-inscritas');
                if (modal && modal.style.display === 'flex' && this.state.currentInscritasCapId) {
                    this.verInscritas(this.state.currentInscritasCapId, this.state.currentInscritasTitulo);
                }
            }, (err) => {
                console.error("Error en tiempo real (capacitaciones):", err);
            });

            // 2. Escuchar inscripciones en tiempo real
            const qInsc = collection(db, 'inscripciones_capacitaciones');
            this.state.unsubInscripciones = onSnapshot(qInsc, (snap) => {
                const inscs = {};
                snap.forEach(doc => {
                    const data = doc.data();
                    if (!inscs[data.capacitacionId]) {
                        inscs[data.capacitacionId] = [];
                    }
                    inscs[data.capacitacionId].push(data);
                });
                this.state.inscripciones = inscs;

                this.renderSelectedDayCourses();

                // Si el modal está abierto en esta capacitación, actualizar la tabla en tiempo real
                const modal = document.getElementById('rh-modal-inscritas');
                if (modal && modal.style.display === 'flex' && this.state.currentInscritasCapId) {
                    this.verInscritas(this.state.currentInscritasCapId, this.state.currentInscritasTitulo);
                }
            }, (err) => {
                console.error("Error en tiempo real (inscripciones):", err);
            });

            // 3. Escuchar base de datos de plantillas de capacitación
            const qTemplates = query(collection(db, 'capacitaciones_db'));
            this.state.unsubTemplates = onSnapshot(qTemplates, (snap) => {
                const templates = [];
                snap.forEach(doc => {
                    templates.push({ id: doc.id, ...doc.data() });
                });
                // Ordenar alfabéticamente por título
                templates.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
                this.state.templates = templates;

                this.renderCapacitacionesDB();
                this.actualizarDropdownTemplates();
            }, (err) => {
                console.error("Error en tiempo real (templates):", err);
            });

        } catch (e) {
            console.error("Error al suscribirse a datos en tiempo real:", e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error configurando el tiempo real de Firestore: ' + e.message
            });
        }
    },

    renderCalendar: function () {
        const titleEl = document.getElementById('rh-month-title');
        const gridEl = document.getElementById('rh-cal-days');
        if (!titleEl || !gridEl) return;

        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        titleEl.textContent = `${meses[this.state.currentMonth]} ${this.state.currentYear}`;

        // Limpiar días
        gridEl.innerHTML = '';

        // Encabezados de días de la semana
        const headers = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        headers.forEach(h => {
            const hEl = document.createElement('div');
            hEl.className = 'rh-cal-day-header';
            hEl.textContent = h;
            gridEl.appendChild(hEl);
        });

        // Primer día del mes
        const primerDia = new Date(this.state.currentYear, this.state.currentMonth, 1);
        // Día de la semana (0 = Dom, 1 = Lun, etc.)
        let startDayIndex = primerDia.getDay();
        // Convertir a semana que inicia en Lunes: 0 = Lun, ..., 6 = Dom
        startDayIndex = (startDayIndex === 0) ? 6 : startDayIndex - 1;

        // Total de días en el mes
        const totalDias = new Date(this.state.currentYear, this.state.currentMonth + 1, 0).getDate();

        // Celdas vacías del mes anterior
        for (let i = 0; i < startDayIndex; i++) {
            const cell = document.createElement('div');
            cell.className = 'rh-cal-cell other-month';
            gridEl.appendChild(cell);
        }

        const hoyISO = new Date().toISOString().slice(0, 10);

        // Celdas de días del mes actual
        for (let day = 1; day <= totalDias; day++) {
            const cell = document.createElement('div');
            cell.className = 'rh-cal-cell';
            
            const mesStr = String(this.state.currentMonth + 1).padStart(2, '0');
            const diaStr = String(day).padStart(2, '0');
            const cellDateISO = `${this.state.currentYear}-${mesStr}-${diaStr}`;
            
            cell.dataset.date = cellDateISO;

            // Número de día
            const numSpan = document.createElement('span');
            numSpan.className = 'rh-cal-day-num';
            numSpan.textContent = day;
            cell.appendChild(numSpan);

            // Revisar si hay capacitaciones en este día
            const cursosDia = this.state.capacitaciones.filter(c => c.fecha === cellDateISO);
            if (cursosDia.length > 0) {
                cell.classList.add('has-courses');
                cursosDia.forEach(c => {
                    const pill = document.createElement('div');
                    pill.className = 'rh-cal-pill';
                    if (cursosDia.length > 1) {
                        pill.classList.add('rh-cal-pill-mini');
                    }
                    pill.textContent = c.titulo;
                    pill.title = c.titulo;
                    pill.style.background = RHPanel.getGradientForCourse(c.id);
                    cell.appendChild(pill);
                });
            }

            // Hoy
            if (cellDateISO === hoyISO) {
                cell.classList.add('today');
            }

            // Seleccionado
            if (cellDateISO === this.state.selectedDate) {
                cell.classList.add('selected');
            }

            cell.addEventListener('click', () => {
                this.state.selectedDate = cellDateISO;
                // Actualizar selección
                document.querySelectorAll('.rh-cal-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');

                this.renderSelectedDayCourses();
            });

            gridEl.appendChild(cell);
        }
    },

    renderSelectedDayCourses: function () {
        const label = document.getElementById('rh-courses-list-title');
        const cont = document.getElementById('rh-courses-list-container');
        if (!label || !cont) return;

        // Formatear fecha para el título
        const [y, m, d] = this.state.selectedDate.split('-');
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const formatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaFormateada = dateObj.toLocaleDateString('es-MX', formatOptions);
        
        label.textContent = `Capacitaciones: ${fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)}`;

        // Filtrar capacitaciones por la fecha seleccionada
        const filtered = this.state.capacitaciones.filter(c => c.fecha === this.state.selectedDate);

        if (filtered.length === 0) {
            cont.innerHTML = `
                <div class="rh-no-courses">
                    <p style="margin:0 0 10px 0; font-weight:700;">Sin capacitaciones programadas</p>
                    <span style="font-size:12px; color:var(--text-muted);">No hay eventos para esta fecha. Usa el botón de la izquierda para programar uno nuevo.</span>
                </div>`;
        } else {
            cont.innerHTML = filtered.map(c => {
                const inscritas = this.state.inscripciones[c.id] || [];
                const fallbackImg = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80';
                const imgSrc = (c.imagen && (c.imagen.startsWith('http') || c.imagen.startsWith('data:image'))) ? c.imagen : fallbackImg;
                
                return `
                    <div class="rh-course-item">
                        <img src="${imgSrc}" class="rh-course-item-img" alt="${RHPanel.escapeHtml(c.titulo)}">
                        <div class="rh-course-item-body">
                            <h4 class="rh-course-item-title">${RHPanel.escapeHtml(c.titulo)}</h4>
                            <p class="rh-course-item-desc">${RHPanel.escapeHtml(c.descripcion || 'Sin descripción.')}</p>
                            
                            <div class="rh-course-item-meta">
                                <span>📅 <b>Fecha:</b> ${RHPanel.escapeHtml(c.fecha)}</span>
                                <span>⏰ <b>Horario:</b> ${RHPanel.escapeHtml(c.horario || 'Por definir')}</span>
                                <span>💰 <b>Costo:</b> ${RHPanel.escapeHtml(c.costo ? ('$' + c.costo) : 'Gratuito')}</span>
                                <span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 8px; font-weight: 800; font-size: 11px; display: inline-flex; align-items: center; gap: 3px;">🔑 Código Pase Lista: <b>${RHPanel.escapeHtml(c.codigo_asistencia || '—')}</b></span>
                            </div>

                            <div class="rh-course-item-actions">
                                <button class="rh-btn rh-btn-primary rh-btn-small" onclick="RHPanel.verInscritas('${c.id}', '${RHPanel.escapeHtml(c.titulo)}')">
                                    👥 Inscritas <span class="rh-badge-count">${inscritas.length}</span>
                                </button>
                                <button class="rh-btn rh-btn-ghost rh-btn-small" onclick="RHPanel.abrirEditarModal('${c.id}')">
                                    ✏️ Editar
                                </button>
                                <button class="rh-btn rh-btn-danger rh-btn-small" onclick="RHPanel.eliminarCapacitacion('${c.id}')">
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    getGradientForCourse: function (courseId) {
        const gradients = [
            'linear-gradient(135deg, #E84C9A, #D63384)', // Rosa NYP
            'linear-gradient(135deg, #3BB6C4, #2ba2b0)', // Azul NYP
            'linear-gradient(135deg, #f97316, #ea580c)', // Naranja NYP
            'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Violeta premium
            'linear-gradient(135deg, #10b981, #059669)', // Esmeralda premium
            'linear-gradient(135deg, #0d9488, #0f766e)'  // Teal premium
        ];
        let hash = 0;
        const idStr = String(courseId || '');
        for (let i = 0; i < idStr.length; i++) {
            hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % gradients.length;
        return gradients[index];
    },

    _resetDropzone: function () {
        const preview = document.getElementById('rh-dropzone-preview');
        const icon = document.getElementById('rh-dropzone-icon');
        const label = document.getElementById('rh-dropzone-label');
        const dropzone = document.getElementById('rh-dropzone');
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (icon) { icon.style.display = 'block'; }
        if (label) { label.textContent = 'Selecciona una imagen'; label.style.color = '#475569'; }
        if (dropzone) { dropzone.style.borderColor = '#cbd5e1'; dropzone.style.background = '#f8fafc'; }
    },

    abrirFormModal: function (dateStr = null) {
        document.getElementById('rh-course-form').reset();
        document.getElementById('rh-form-id').value = '';
        document.getElementById('rh-modal-form-title').textContent = 'Programar Capacitación';
        
        this.actualizarDropdownTemplates();

        if (dateStr) {
            document.getElementById('rh-form-date').value = dateStr;
        } else {
            document.getElementById('rh-form-date').value = new Date().toISOString().slice(0, 10);
        }

        document.getElementById('rh-modal-form').style.display = 'flex';
    },

    abrirEditarModal: function (id) {
        const cap = this.state.capacitaciones.find(c => c.id === id);
        if (!cap) return;

        document.getElementById('rh-modal-form-title').textContent = 'Editar Programación';
        document.getElementById('rh-form-id').value = cap.id;
        document.getElementById('rh-form-date').value = cap.fecha || '';

        // Separar horario guardado en inicio y fin (formato "HH:MM - HH:MM")
        const horarioParts = (cap.horario || '').split('-').map(s => s.trim());
        document.getElementById('rh-form-time-start').value = horarioParts[0] || '';
        document.getElementById('rh-form-time-end').value = horarioParts[1] || '';

        this.actualizarDropdownTemplates();

        const select = document.getElementById('rh-form-template-select');
        if (select) {
            // Intentar seleccionar por título (coincidencia exacta o parcial)
            const templates = this.state.templates || [];
            const matchingTemp = templates.find(t => {
                const titleA = (t.titulo || '').toLowerCase().trim();
                const titleB = (cap.titulo || '').toLowerCase().trim();
                return titleA === titleB || titleA.includes(titleB) || titleB.includes(titleA);
            });
            if (matchingTemp) {
                select.value = matchingTemp.id;
            } else {
                // Si no hay un template correspondiente en la base de datos (p. ej. registro antiguo),
                // crear una opción temporal para mostrar el título y seleccionarla
                const tempOpt = document.createElement('option');
                tempOpt.value = 'legacy_temp';
                tempOpt.textContent = cap.titulo + ' (Historial)';
                select.appendChild(tempOpt);
                select.value = 'legacy_temp';
            }
        }

        document.getElementById('rh-modal-form').style.display = 'flex';
    },

    cerrarFormModal: function () {
        document.getElementById('rh-modal-form').style.display = 'none';
    },

    comprimirImagen: function (base64Str, maxWidth = 600, maxHeight = 600, quality = 0.6) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => {
                resolve(base64Str);
            };
        });
    },

    guardarCapacitacion: async function (e) {
        e.preventDefault();
        
        const id = document.getElementById('rh-form-id').value;
        const templateId = document.getElementById('rh-form-template-select').value;
        const fecha = document.getElementById('rh-form-date').value;
        const horarioInicio = document.getElementById('rh-form-time-start').value;
        const horarioFin = document.getElementById('rh-form-time-end').value;
        const horario = horarioInicio && horarioFin ? `${horarioInicio} - ${horarioFin}` : (horarioInicio || horarioFin || '');

        let titulo = '';
        let descripcion = '';
        let costo = '';
        let imagen = '';
        let constancia_base = '';
        let pos_nombre_x = '50';
        let pos_nombre_y = '45';
        let pos_date_x = '50';
        let pos_date_y = '70';
        let font_nombre = '20';
        let font_fecha = '16';

        // Buscar el template seleccionado
        const template = (this.state.templates || []).find(t => t.id === templateId);
        if (template) {
            titulo = template.titulo;
            descripcion = template.descripcion;
            costo = template.precio;
            imagen = template.imagen || '';
            constancia_base = template.constancia_base || '';
            pos_nombre_x = template.pos_nombre_x || '50';
            pos_nombre_y = template.pos_nombre_y || '45';
            pos_date_x = template.pos_date_x || '50';
            pos_date_y = template.pos_date_y || '70';
            font_nombre = template.font_nombre || '20';
            font_fecha = template.font_fecha || '16';
        } else if (id && templateId === 'legacy_temp') {
            // Si es edición heredada y no hay un template correspondiente, mantener los datos anteriores
            const capAntigua = this.state.capacitaciones.find(c => c.id === id);
            if (capAntigua) {
                titulo = capAntigua.titulo;
                descripcion = capAntigua.descripcion;
                costo = capAntigua.costo;
                imagen = capAntigua.imagen || '';
                constancia_base = capAntigua.constancia_base || '';
                pos_nombre_x = capAntigua.pos_nombre_x || '50';
                pos_nombre_y = capAntigua.pos_nombre_y || '45';
                pos_date_x = capAntigua.pos_date_x || '50';
                pos_date_y = capAntigua.pos_date_y || '70';
                font_nombre = capAntigua.font_nombre || '20';
                font_fecha = capAntigua.font_fecha || '16';
            }
        }

        if (!titulo) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor, selecciona una capacitación válida de la lista.'
            });
            return;
        }

        Swal.fire({
            title: 'Guardando capacitación...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const { db } = await import('./firebase-config.js');
            const { doc, addDoc, updateDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

            let codigoAsistencia = '';
            if (id) {
                const capAntigua = this.state.capacitaciones.find(c => c.id === id);
                codigoAsistencia = capAntigua?.codigo_asistencia || Math.floor(1000 + Math.random() * 9000).toString();
            } else {
                codigoAsistencia = Math.floor(1000 + Math.random() * 9000).toString();
            }

            const capData = {
                titulo,
                descripcion,
                fecha,
                horario,
                costo,
                imagen,
                codigo_asistencia: codigoAsistencia,
                constancia_base,
                pos_nombre_x,
                pos_nombre_y,
                pos_date_x,
                pos_date_y,
                font_nombre,
                font_fecha,
                fecha_creacion: new Date().toISOString()
            };

            if (id) {
                // Editar existente
                const docRef = doc(db, 'capacitaciones', id);
                await updateDoc(docRef, capData);
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'La capacitación se actualizó con éxito.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                // Crear nueva
                await addDoc(collection(db, 'capacitaciones'), capData);
                Swal.fire({
                    icon: 'success',
                    title: '¡Publicado!',
                    text: 'La capacitación se publicó con éxito.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }

            this.cerrarFormModal();
            await this.cargarDatos();
        } catch (error) {
            console.error("Error al guardar capacitación:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al guardar: ' + error.message
            });
        }
    },

    // --- NUEVAS FUNCIONES PARA BASE DE DATOS DE CAPACITACIONES (TEMPLATES) ---
    actualizarDropdownTemplates: function () {
        const select = document.getElementById('rh-form-template-select');
        if (!select) return;

        const templates = this.state.templates || [];
        select.innerHTML = '<option value="" disabled selected>Selecciona una capacitación...</option>';

        templates.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.titulo;
            select.appendChild(opt);
        });
    },

    renderCapacitacionesDB: function () {
        const cont = document.getElementById('rh-templates-list');
        if (!cont) return;

        const templates = this.state.templates || [];
        if (templates.length === 0) {
            cont.innerHTML = `
                <div class="rh-no-courses" style="grid-column: 1 / -1; margin: 20px 0;">
                    No hay capacitaciones creadas en la base de datos todavía. Haz clic en "Crear Capacitación" para empezar.
                </div>
            `;
            return;
        }

        cont.innerHTML = templates.map(t => {
            const imgSrc = t.imagen || 'logo-sin-fondo.png';
            return `
                <div class="rh-card" style="display:flex; flex-direction:column; gap:12px; padding:18px; border:1px solid #e2e8f0; border-radius:18px; background:white; justify-content:space-between;">
                    <div style="display:flex; gap:12px; align-items:flex-start;">
                        <img src="${imgSrc}" style="width:64px; height:64px; object-fit:cover; border-radius:12px; border:1px solid #f1f5f9; background:#f8fafc;" alt="${RHPanel.escapeHtml(t.titulo)}">
                        <div style="flex:1; min-width:0;">
                            <h4 style="margin:0 0 4px 0; font-weight:800; font-size:14px; color:var(--text-main); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${RHPanel.escapeHtml(t.titulo)}</h4>
                            <p style="margin:0 0 6px 0; font-size:12px; color:#64748b; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${RHPanel.escapeHtml(t.descripcion)}</p>
                            <div style="font-size:12px; font-weight:700; color:var(--pink-main);">Costo base: $${RHPanel.escapeHtml(t.precio)}</div>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px dashed #f1f5f9; padding-top:10px; margin-top:5px;">
                        <button class="rh-btn rh-btn-ghost" style="padding: 4px 10px; font-size:11px; border-radius:8px; border:1px solid #cbd5e1; display:inline-flex; align-items:center; gap:3px;" onclick="RHPanel.editarTemplate('${t.id}')">
                            ✏️ Editar
                        </button>
                        <button class="rh-btn rh-btn-danger rh-btn-small" style="padding: 4px 10px; font-size:11px; border-radius:8px; display:inline-flex; align-items:center; gap:3px;" onclick="RHPanel.eliminarTemplate('${t.id}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    abrirTemplateModal: function (id = null) {
        document.getElementById('rh-template-form').reset();
        document.getElementById('rh-template-id').value = '';
        document.getElementById('rh-template-image-base64').value = '';
        document.getElementById('rh-template-cert-base64').value = '';
        document.getElementById('rh-template-cert-pos-name-x').value = '50';
        document.getElementById('rh-template-cert-pos-name-y').value = '45';
        document.getElementById('rh-template-cert-pos-date-x').value = '50';
        document.getElementById('rh-template-cert-pos-date-y').value = '70';
        document.getElementById('rh-modal-template-title').textContent = 'Crear Capacitación';
        
        this._resetTemplateDropzone();
        this._resetTemplateCertDropzone();
        
        if (id) {
            const temp = this.state.templates.find(t => t.id === id);
            if (temp) {
                document.getElementById('rh-modal-template-title').textContent = 'Editar Capacitación';
                document.getElementById('rh-template-id').value = temp.id;
                document.getElementById('rh-template-title-input').value = temp.titulo || '';
                document.getElementById('rh-template-desc-input').value = temp.descripcion || '';
                document.getElementById('rh-template-price-input').value = temp.precio || '';
                
                const isBase64 = temp.imagen && temp.imagen.startsWith('data:image');
                document.getElementById('rh-template-image-base64').value = isBase64 ? temp.imagen : '';
                document.getElementById('rh-template-image-file').value = '';
                
                if (temp.imagen) {
                    const preview = document.getElementById('rh-template-dropzone-preview');
                    const icon = document.getElementById('rh-template-dropzone-icon');
                    const label = document.getElementById('rh-template-dropzone-label');
                    const dropzone = document.getElementById('rh-template-dropzone');
                    if (preview) { preview.src = temp.imagen; preview.style.display = 'block'; }
                    if (icon) icon.style.display = 'none';
                    if (label) { label.textContent = '✅ Imagen cargada'; label.style.color = '#16a34a'; }
                    if (dropzone) { dropzone.style.borderColor = '#16a34a'; dropzone.style.background = '#f0fdf4'; }
                }

                if (temp.constancia_base) {
                    const preview = document.getElementById('rh-template-cert-preview');
                    const icon = document.getElementById('rh-template-cert-icon');
                    const label = document.getElementById('rh-template-cert-label');
                    const dropzone = document.getElementById('rh-template-cert-dropzone');
                    const btnDisenar = document.getElementById('rh-template-btn-disenar-cert');
                    if (preview) { preview.src = temp.constancia_base; preview.style.display = 'block'; }
                    if (icon) icon.style.display = 'none';
                    if (label) { label.textContent = '✅ Constancia cargada'; label.style.color = '#16a34a'; }
                    if (dropzone) { dropzone.style.borderColor = '#16a34a'; dropzone.style.background = '#f0fdf4'; }
                    if (btnDisenar) { btnDisenar.style.display = 'block'; }
                    
                    document.getElementById('rh-template-cert-base64').value = temp.constancia_base;
                    document.getElementById('rh-template-cert-pos-name-x').value = temp.pos_nombre_x || '50';
                    document.getElementById('rh-template-cert-pos-name-y').value = temp.pos_nombre_y || '45';
                    document.getElementById('rh-template-cert-pos-date-x').value = temp.pos_date_x || '50';
                    document.getElementById('rh-template-cert-pos-date-y').value = temp.pos_date_y || '70';
                    document.getElementById('rh-template-cert-font-name').value = temp.font_nombre || '20';
                    document.getElementById('rh-template-cert-font-date').value = temp.font_fecha || '16';
                }
            }
        }
        document.getElementById('rh-modal-template').style.display = 'flex';
    },

    cerrarTemplateModal: function () {
        document.getElementById('rh-modal-template').style.display = 'none';
    },

    _resetTemplateDropzone: function () {
        const preview = document.getElementById('rh-template-dropzone-preview');
        const icon = document.getElementById('rh-template-dropzone-icon');
        const label = document.getElementById('rh-template-dropzone-label');
        const dropzone = document.getElementById('rh-template-dropzone');
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (icon) { icon.style.display = 'block'; }
        if (label) { label.textContent = 'Sube la imagen de portada'; label.style.color = '#475569'; }
        if (dropzone) { dropzone.style.borderColor = '#cbd5e1'; dropzone.style.background = '#f8fafc'; }
    },

    _resetTemplateCertDropzone: function () {
        const preview = document.getElementById('rh-template-cert-preview');
        const icon = document.getElementById('rh-template-cert-icon');
        const label = document.getElementById('rh-template-cert-label');
        const dropzone = document.getElementById('rh-template-cert-dropzone');
        const btnDisenar = document.getElementById('rh-template-btn-disenar-cert');
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (icon) { icon.style.display = 'block'; }
        if (label) { label.textContent = 'Selecciona el diseño de la constancia'; label.style.color = '#475569'; }
        if (dropzone) { dropzone.style.borderColor = '#cbd5e1'; dropzone.style.background = '#f8fafc'; }
        if (btnDisenar) { btnDisenar.style.display = 'none'; }
    },

    convertirImagenTemplateBase64: function (input) {
        const file = input.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                title: 'Imagen muy grande',
                text: 'La imagen excede los 5MB. Por favor, selecciona una imagen más ligera.'
            });
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawBase64 = e.target.result;
            const base64 = await this.comprimirImagen(rawBase64);
            document.getElementById('rh-template-image-base64').value = base64;
            
            const preview = document.getElementById('rh-template-dropzone-preview');
            const icon = document.getElementById('rh-template-dropzone-icon');
            const label = document.getElementById('rh-template-dropzone-label');
            const dropzone = document.getElementById('rh-template-dropzone');
            if (preview) {
                preview.src = base64;
                preview.style.display = 'block';
            }
            if (icon) icon.style.display = 'none';
            if (label) {
                label.textContent = '✅ ' + file.name + ' (Comprimida)';
                label.style.color = '#16a34a';
            }
            if (dropzone) {
                dropzone.style.borderColor = '#16a34a';
                dropzone.style.background = '#f0fdf4';
            }
        };
        reader.readAsDataURL(file);
    },

    guardarTemplate: async function (e) {
        e.preventDefault();
        const id = document.getElementById('rh-template-id').value;
        const titulo = document.getElementById('rh-template-title-input').value.trim();
        const descripcion = document.getElementById('rh-template-desc-input').value.trim();
        const precio = document.getElementById('rh-template-price-input').value.trim();
        const base64Img = document.getElementById('rh-template-image-base64').value;
        
        // Formato Base de la Constancia y Coordenadas
        const constancia_base = document.getElementById('rh-template-cert-base64').value;
        const pos_nombre_x = document.getElementById('rh-template-cert-pos-name-x').value || '50';
        const pos_nombre_y = document.getElementById('rh-template-cert-pos-name-y').value || '45';
        const pos_date_x = document.getElementById('rh-template-cert-pos-date-x').value || '50';
        const pos_date_y = document.getElementById('rh-template-cert-pos-date-y').value || '70';
        
        const imagen = base64Img || '';

        Swal.fire({
            title: 'Guardando capacitación...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const { db } = await import('./firebase-config.js');
            const { collection, doc, addDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

            const templateData = {
                titulo,
                descripcion,
                precio,
                imagen,
                constancia_base,
                pos_nombre_x,
                pos_nombre_y,
                pos_date_x,
                pos_date_y,
                font_nombre: document.getElementById('rh-template-cert-font-name').value || '20',
                font_fecha: document.getElementById('rh-template-cert-font-date').value || '16',
                fecha_creacion: new Date().toISOString()
            };

            if (id) {
                const docRef = doc(db, 'capacitaciones_db', id);
                await updateDoc(docRef, templateData);
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizada!',
                    text: 'Capacitación actualizada con éxito en la base de datos.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await addDoc(collection(db, 'capacitaciones_db'), templateData);
                Swal.fire({
                    icon: 'success',
                    title: '¡Creada!',
                    text: 'Capacitación creada con éxito en la base de datos.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            this.cerrarTemplateModal();
        } catch (error) {
            console.error("Error al guardar plantilla:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al guardar: ' + error.message
            });
        }
    },

    editarTemplate: function (id) {
        this.abrirTemplateModal(id);
    },

    eliminarTemplate: async function (id) {
        const confirm = await Swal.fire({
            title: '¿Eliminar capacitación?',
            text: "Esta acción la borrará de la base de datos de capacitaciones y no se podrá deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return;

        Swal.fire({
            title: 'Eliminando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const { db } = await import('./firebase-config.js');
            const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            
            await deleteDoc(doc(db, 'capacitaciones_db', id));
            Swal.fire({
                icon: 'success',
                title: 'Eliminada',
                text: 'Capacitación eliminada de la base de datos.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (e) {
            console.error("Error al eliminar plantilla:", e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al eliminar: ' + e.message
            });
        }
    },

    eliminarCapacitacion: async function (id) {
        const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción eliminará la capacitación y no se podrá deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e84c9a',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Sí, eliminar 🗑️',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return;

        Swal.fire({
            title: 'Eliminando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const { db } = await import('./firebase-config.js');
            const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

            await deleteDoc(doc(db, 'capacitaciones', id));

            Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'Capacitación eliminada.',
                timer: 1500,
                showConfirmButton: false
            });

            await this.cargarDatos();
        } catch (e) {
            console.error("Error al eliminar capacitación:", e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al eliminar: ' + e.message
            });
        }
    },

    verInscritas: function (capacitacionId, titulo) {
        this.state.currentInscritasCapId = capacitacionId;
        this.state.currentInscritasTitulo = titulo;
        
        const list = this.state.inscripciones[capacitacionId] || [];
        
        const subtitle = document.getElementById('rh-modal-inscritas-subtitle');
        if (subtitle) {
            subtitle.textContent = `Capacitación: ${titulo}`;
        }
        
        const cont = document.getElementById('rh-inscritas-content');
        if (!cont) return;

        if (list.length === 0) {
            cont.innerHTML = `
                <div class="rh-no-courses" style="margin: 10px 0;">
                    No hay niñeras inscritas a esta capacitación todavía.
                </div>
            `;
        } else {
            cont.innerHTML = `
                <div style="overflow: hidden auto; max-height: 400px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                    <table class="rh-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th style="padding: 10px 8px;">Nombre</th>
                                <th style="padding: 10px 8px; text-align: center;">Asistencia</th>
                                <th style="padding: 10px 8px; text-align: center;">Constancia</th>
                                <th style="padding: 10px 8px;">Ciudad</th>
                                <th style="padding: 10px 8px; white-space: nowrap;">Inscripción</th>
                                <th style="padding: 10px 16px 10px 8px; text-align: center; width: 100px;">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.map(ins => {
                                const fechaStr = ins.fecha_inscripcion ? new Date(ins.fecha_inscripcion).toLocaleDateString('es-MX', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}) : '—';
                                return `
                                    <tr data-nanny-email="${RHPanel.escapeHtml(ins.nannyEmail)}">
                                        <td style="padding: 10px 8px;"><b>${RHPanel.escapeHtml(ins.nannyNombre)}</b></td>
                                        <td style="padding: 10px 8px; text-align: center;">
                                            ${ins.asistio === true 
                                                ? `<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: bold; display: inline-block;">Presente ✅</span>`
                                                : `<span style="background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 20px; font-size: 11px; font-weight: bold; display: inline-block;">Pendiente ⏳</span>`
                                            }
                                        </td>
                                        <td style="padding: 10px 8px; text-align: center;">
                                            <input type="checkbox" style="width: 18px; height: 18px; cursor: pointer; accent-color: #166534;" 
                                                ${ins.amerita_constancia === true ? 'checked' : ''} 
                                                onchange="RHPanel.cambiarAmeritaConstancia('${ins.capacitacionId}', '${RHPanel.escapeHtml(ins.nannyEmail)}', this.checked)">
                                        </td>
                                        <td class="nanny-ciudad-cell" style="padding: 10px 8px; font-size:12px; font-weight:600; color:#475569;">${RHPanel.escapeHtml(ins.nannyCiudad || 'Cargando...')}</td>
                                        <td style="padding: 10px 8px; font-size:12px; color: var(--text-muted); white-space: nowrap;">${fechaStr}</td>
                                        <td style="padding: 10px 16px 10px 8px; text-align: center; width: 100px;">
                                            <button class="rh-btn rh-btn-danger rh-btn-small" style="padding: 5px 10px; font-size:11px; border-radius:8px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;" onclick="RHPanel.eliminarInscrita('${ins.capacitacionId}', '${RHPanel.escapeHtml(ins.nannyEmail)}')">
                                                🗑️ Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            // Cargar ciudades de forma asíncrona si no vienen en la inscripción (registros antiguos)
            list.forEach(async (ins) => {
                if (!ins.nannyCiudad) {
                    try {
                        const perf = await api('getProfile', { email: ins.nannyEmail });
                        const ciudadVal = perf.ciudad || perf.sucursal || perf.ciudad_sucursal || '—';
                        const rows = cont.querySelectorAll(`tr[data-nanny-email="${ins.nannyEmail.replace(/"/g, '\\"')}"] .nanny-ciudad-cell`);
                        rows.forEach(cell => {
                            cell.textContent = ciudadVal;
                        });
                    } catch (err) {
                        console.warn(`Error al cargar ciudad para ${ins.nannyEmail}:`, err);
                        const rows = cont.querySelectorAll(`tr[data-nanny-email="${ins.nannyEmail.replace(/"/g, '\\"')}"] .nanny-ciudad-cell`);
                        rows.forEach(cell => {
                            if (cell.textContent === 'Cargando...') {
                                cell.textContent = '—';
                            }
                        });
                    }
                }
            });
        }

        document.getElementById('rh-modal-inscritas').style.display = 'flex';
    },

    eliminarInscrita: async function (capacitacionId, nannyEmail) {
        const confirm = await Swal.fire({
            title: '¿Eliminar inscripción?',
            text: `Se cancelará el registro de ${nannyEmail} en esta capacitación.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Sí, eliminar 🗑️',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return;

        Swal.fire({
            title: 'Eliminando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const { db } = await import('./firebase-config.js');
            const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

            const docId = `${capacitacionId}_${nannyEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
            await deleteDoc(doc(db, 'inscripciones_capacitaciones', docId));

            Swal.fire({
                icon: 'success',
                title: 'Eliminada',
                text: 'La inscripción fue eliminada exitosamente.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (e) {
            console.error("Error al eliminar inscripción:", e);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al eliminar el registro: ' + e.message
            });
        }
    },

    cambiarAmeritaConstancia: async function (capacitacionId, nannyEmail, checked) {
        try {
            const { db } = await import('./firebase-config.js');
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            
            const docId = `${capacitacionId}_${nannyEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
            await updateDoc(doc(db, 'inscripciones_capacitaciones', docId), {
                amerita_constancia: checked
            });
        } catch (err) {
            console.error("Error al actualizar amerita_constancia:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la selección: ' + err.message
            });
        }
    },

    cerrarInscritasModal: function () {
        document.getElementById('rh-modal-inscritas').style.display = 'none';
    },

    exportarCalendarioComoImagen: async function () {
        Swal.fire({
            title: 'Generando imagen...',
            text: 'Preparando diseño del calendario para compartir...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // 1. Cargar html2canvas dinámicamente si no está presente
            if (!window.html2canvas) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
                    script.onload = resolve;
                    script.onerror = () => reject(new Error("No se pudo cargar la librería de captura."));
                    document.head.appendChild(script);
                });
            }

            // 2. Obtener el mes y año actual
            const meses = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ];
            const mesNombre = meses[this.state.currentMonth];
            const tituloMes = `${mesNombre} ${this.state.currentYear}`;

            // 3. Crear el contenedor temporal para la captura
            const exportContainer = document.createElement('div');
            exportContainer.style.position = 'absolute';
            exportContainer.style.left = '-9999px';
            exportContainer.style.top = '0';
            exportContainer.style.width = '850px';
            exportContainer.style.background = 'linear-gradient(135deg, #fff5f8, #f0fdfd)';
            exportContainer.style.padding = '40px';
            exportContainer.style.borderRadius = '32px';
            exportContainer.style.boxSizing = 'border-box';
            exportContainer.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
            
            // Estructura interna del diseño exportable
            exportContainer.innerHTML = `
                <!-- Cabecera de Marca -->
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px dashed rgba(232,76,154,0.2); padding-bottom:20px; margin-bottom:25px;">
                    <div>
                        <h1 style="margin:0; font-family:'DM Serif Display',serif; font-size:32px; color:#E84C9A; font-weight: 800;">Nannys y Peques</h1>
                        <p style="margin:4px 0 0 0; font-size:12px; color:#6B7280; font-weight:800; letter-spacing:1.5px; text-transform:uppercase;">Calendario de Capacitaciones Vigentes</p>
                    </div>
                    <div style="background:#E84C9A; color:white; padding:10px 24px; border-radius:18px; font-weight:800; font-size:18px; box-shadow:0 4px 12px rgba(232,76,154,0.2);">
                        ${tituloMes}
                    </div>
                </div>

                <!-- Calendario Principal Clonado -->
                <div style="background:white; border-radius:24px; padding:25px; box-shadow:0 15px 40px rgba(0,0,0,0.03); border:1px solid #f1f5f9;">
                    <!-- Cabecera de días de la semana -->
                    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:10px; text-align:center; margin-bottom:15px;">
                        ${["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(h => `
                            <div style="font-weight:800; font-size:13px; color:#E84C9A; padding:5px 0; text-transform:uppercase; letter-spacing:1px;">${h}</div>
                        `).join('')}
                    </div>

                    <!-- Días del Calendario -->
                    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:10px;">
                        ${this.generarCeldasHtmlParaExportar()}
                    </div>
                </div>

                <!-- Pie de Página Informativo -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:25px; padding-top:15px; border-top:1px solid rgba(0,0,0,0.05);">
                    <span style="font-size:13px; color:#6B7280; font-weight:700;">✨ ¡Inscríbete desde tu aplicación de Niñera!</span>
                </div>
            `;

            document.body.appendChild(exportContainer);

            // 4. Renderizar a imagen usando html2canvas
            const canvas = await html2canvas(exportContainer, {
                useCORS: true,
                scale: 2, // Doble resolución para que se vea súper nítido al enviar por WhatsApp
                backgroundColor: null,
                logging: false,
                onclone: (clonedDoc) => {
                    // Remover las hojas de estilo externas del clon para evitar que el iframe dispare advertencias de CSP
                    const styleLinks = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
                    styleLinks.forEach(link => link.remove());
                }
            });

            // Eliminar contenedor temporal
            exportContainer.remove();

            // 5. Convertir a imagen y descargar
            const imageURL = canvas.toDataURL("image/jpeg", 0.95);
            const link = document.createElement('a');
            link.download = `Calendario_Capacitaciones_${mesNombre}_${this.state.currentYear}.jpg`;
            link.href = imageURL;
            link.click();

            Swal.fire({
                icon: 'success',
                title: '¡Imagen Generada!',
                text: 'El calendario se ha descargado a tu dispositivo.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al exportar calendario como imagen:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al exportar',
                text: 'Hubo un error al generar la imagen: ' + error.message
            });
        }
    },

    generarCeldasHtmlParaExportar: function () {
        const primerDia = new Date(this.state.currentYear, this.state.currentMonth, 1);
        let startDayIndex = primerDia.getDay();
        startDayIndex = (startDayIndex === 0) ? 6 : startDayIndex - 1;

        const totalDias = new Date(this.state.currentYear, this.state.currentMonth + 1, 0).getDate();
        let cellsHtml = '';

        // Celdas vacías del mes anterior
        for (let i = 0; i < startDayIndex; i++) {
            cellsHtml += `<div style="height:95px; border-color:transparent; background:none;"></div>`;
        }

        const hoyISO = new Date().toISOString().slice(0, 10);

        // Celdas de días del mes actual
        for (let day = 1; day <= totalDias; day++) {
            const mesStr = String(this.state.currentMonth + 1).padStart(2, '0');
            const diaStr = String(day).padStart(2, '0');
            const cellDateISO = `${this.state.currentYear}-${mesStr}-${diaStr}`;
            
            const cursosDia = this.state.capacitaciones.filter(c => c.fecha === cellDateISO);
            
            let isToday = cellDateISO === hoyISO;
            let borderStyle = isToday ? 'border: 2px solid #E84C9A;' : 'border: 1px solid #e2e8f0;';
            let bgStyle = 'background: #ffffff;';

            let pillsHtml = '';
            if (cursosDia.length > 0) {
                cursosDia.forEach(c => {
                    const gradient = this.getGradientForCourse(c.id);
                    if (cursosDia.length > 1) {
                        pillsHtml += `
                            <div style="font-size:8px; font-weight:700; color:white; background:${gradient}; padding:2px 4px; border-radius:4px; width:95%; text-align:center; line-height:1.15; word-break:break-word; margin-top:2px; box-sizing:border-box; white-space:normal; overflow:hidden; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; text-overflow:ellipsis;">
                                ${RHPanel.escapeHtml(c.titulo)}
                            </div>
                        `;
                    } else {
                        pillsHtml += `
                            <div style="font-size:9px; font-weight:700; color:white; background:${gradient}; padding:3px 5px; border-radius:6px; width:95%; text-align:center; line-height:1.15; word-break:break-word; margin-top:4px; box-sizing:border-box; white-space:normal; overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; text-overflow:ellipsis;">
                                ${RHPanel.escapeHtml(c.titulo)}
                            </div>
                        `;
                    }
                });
            }

            cellsHtml += `
                <div style="height:95px; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:6px 4px; border-radius:14px; ${bgStyle} ${borderStyle} box-sizing:border-box; overflow:hidden;">
                    <span style="font-size:12px; font-weight:800; color:${isToday ? '#E84C9A' : '#1F2937'}; margin-bottom:4px;">${day}</span>
                    ${pillsHtml}
                </div>
            `;
        }

        return cellsHtml;
    },

    cerrarInscritasModal: function () {
        document.getElementById('rh-modal-inscritas').style.display = 'none';
    },

    convertirConstanciaBase64: function (input) {
        const file = input.files[0];
        if (!file) return;

        Swal.fire({
            title: 'Cargando formato...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            
            const img = new Image();
            img.src = base64;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                const maxDim = 1200;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                
                document.getElementById('rh-template-cert-base64').value = compressedBase64;
                
                const preview = document.getElementById('rh-template-cert-preview');
                const icon = document.getElementById('rh-template-cert-icon');
                const label = document.getElementById('rh-template-cert-label');
                const dropzone = document.getElementById('rh-template-cert-dropzone');
                const btnDisenar = document.getElementById('rh-template-btn-disenar-cert');
                
                if (preview) { preview.src = compressedBase64; preview.style.display = 'block'; }
                if (icon) icon.style.display = 'none';
                if (label) { label.textContent = '✅ Constancia cargada'; label.style.color = '#16a34a'; }
                if (dropzone) { dropzone.style.borderColor = '#16a34a'; dropzone.style.background = '#f0fdf4'; }
                if (btnDisenar) { btnDisenar.style.display = 'block'; }
                
                Swal.close();
                
                // Abrir el diseñador automáticamente
                setTimeout(() => {
                    this.abrirDisenadorConstancia();
                }, 500);
            };
        };
        reader.readAsDataURL(file);
    },

    abrirDisenadorConstancia: function () {
        const base64 = document.getElementById('rh-template-cert-base64').value;
        if (!base64) {
            Swal.fire({
                icon: 'warning',
                title: 'Sube una constancia',
                text: 'Primero debes seleccionar el archivo de formato base de la constancia.'
            });
            return;
        }

        const canvasImg = document.getElementById('rh-cert-canvas-img');
        canvasImg.src = base64;

        // Cargar coordenadas actuales o usar valores por defecto
        const nameX = document.getElementById('rh-template-cert-pos-name-x').value || '50';
        const nameY = document.getElementById('rh-template-cert-pos-name-y').value || '45';
        const dateX = document.getElementById('rh-template-cert-pos-date-x').value || '50';
        const dateY = document.getElementById('rh-template-cert-pos-date-y').value || '70';
        const fontName = document.getElementById('rh-template-cert-font-name').value || '20';
        const fontDate = document.getElementById('rh-template-cert-font-date').value || '16';

        const dragName = document.getElementById('rh-cert-drag-name');
        const dragDate = document.getElementById('rh-cert-drag-date');

        dragName.style.left = `${nameX}%`;
        dragName.style.top = `${nameY}%`;
        dragDate.style.left = `${dateX}%`;
        dragDate.style.top = `${dateY}%`;

        // Sincronizar sliders
        document.getElementById('rh-cert-slider-name').value = fontName;
        document.getElementById('rh-cert-slider-date').value = fontDate;
        document.getElementById('rh-cert-val-name').textContent = `${fontName}px`;
        document.getElementById('rh-cert-val-date').textContent = `${fontDate}px`;

        dragName.style.fontSize = `${fontName}px`;
        dragDate.style.fontSize = `${fontDate}px`;

        document.getElementById('rh-modal-cert-designer').style.display = 'flex';
        
        // Inicializar eventos de arrastre
        this.initDragHandles();
    },

    cerrarDisenadorConstancia: function () {
        document.getElementById('rh-modal-cert-designer').style.display = 'none';
    },

    guardarPosicionesConstancia: function () {
        const dragName = document.getElementById('rh-cert-drag-name');
        const dragDate = document.getElementById('rh-cert-drag-date');

        // Extraer valores numéricos de porcentaje
        const nameX = parseFloat(dragName.style.left);
        const nameY = parseFloat(dragName.style.top);
        const dateX = parseFloat(dragDate.style.left);
        const dateY = parseFloat(dragDate.style.top);

        const fontName = document.getElementById('rh-cert-slider-name').value;
        const fontDate = document.getElementById('rh-cert-slider-date').value;

        document.getElementById('rh-template-cert-pos-name-x').value = nameX.toFixed(2);
        document.getElementById('rh-template-cert-pos-name-y').value = nameY.toFixed(2);
        document.getElementById('rh-template-cert-pos-date-x').value = dateX.toFixed(2);
        document.getElementById('rh-template-cert-pos-date-y').value = dateY.toFixed(2);
        
        document.getElementById('rh-template-cert-font-name').value = fontName;
        document.getElementById('rh-template-cert-font-date').value = fontDate;

        Swal.fire({
            icon: 'success',
            title: '¡Posiciones Guardadas!',
            text: 'Las coordenadas y tamaños de letra se configuraron correctamente.',
            timer: 2000,
            showConfirmButton: false
        });

        this.cerrarDisenadorConstancia();
    },

    initDragHandles: function () {
        const container = document.getElementById('rh-cert-canvas-container');
        const dragName = document.getElementById('rh-cert-drag-name');
        const dragDate = document.getElementById('rh-cert-drag-date');
        
        if (!container || !dragName || !dragDate) return;

        const setupDrag = (el) => {
            let isDragging = false;
            let startX = 0, startY = 0;
            let startLeft = 0, startTop = 0;

            const onStart = (e) => {
                isDragging = true;
                el.style.backgroundColor = el.id === 'rh-cert-drag-name' ? 'rgba(59, 182, 196, 0.45)' : 'rgba(244, 63, 94, 0.45)';
                
                const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
                const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
                
                startX = clientX;
                startY = clientY;
                
                startLeft = el.offsetLeft;
                startTop = el.offsetTop;
                
                e.preventDefault();
            };

            const onMove = (e) => {
                if (!isDragging) return;
                
                const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
                const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
                
                const deltaX = clientX - startX;
                const deltaY = clientY - startY;
                
                let newLeft = startLeft + deltaX;
                let newTop = startTop + deltaY;
                
                const maxLeft = container.clientWidth;
                const maxTop = container.clientHeight;
                
                if (newLeft < 0) newLeft = 0;
                if (newLeft > maxLeft) newLeft = maxLeft;
                
                if (newTop < 0) newTop = 0;
                if (newTop > maxTop) newTop = maxTop;
                
                const pctLeft = (newLeft / maxLeft) * 100;
                const pctTop = (newTop / maxTop) * 100;
                
                el.style.left = `${pctLeft}%`;
                el.style.top = `${pctTop}%`;
            };

            const onEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                el.style.backgroundColor = el.id === 'rh-cert-drag-name' ? 'rgba(59, 182, 196, 0.25)' : 'rgba(244, 63, 94, 0.25)';
            };

            // Eventos Mouse
            el.addEventListener('mousedown', onStart);
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);

            // Eventos Touch (móviles)
            el.addEventListener('touchstart', onStart, { passive: false });
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
        };

        setupDrag(dragName);
        setupDrag(dragDate);
    },

    actualizarTamanoLetra: function (tipo, valor) {
        if (tipo === 'name') {
            const el = document.getElementById('rh-cert-drag-name');
            if (el) el.style.fontSize = `${el.style.fontSize = valor + 'px'}`;
            const valSpan = document.getElementById('rh-cert-val-name');
            if (valSpan) valSpan.textContent = `${valor}px`;
        } else if (tipo === 'date') {
            const el = document.getElementById('rh-cert-drag-date');
            if (el) el.style.fontSize = `${el.style.fontSize = valor + 'px'}`;
            const valSpan = document.getElementById('rh-cert-val-date');
            if (valSpan) valSpan.textContent = `${valor}px`;
        }
    },

    escapeHtml: function (text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

// Exponer globalmente
window.RHPanel = RHPanel;
