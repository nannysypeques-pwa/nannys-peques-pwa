function doPost(e) {
    try {
        let action = '';
        let payload = {};

        // 1️⃣ LEER BODY
        if (e && e.postData && e.postData.contents) {
            const type = String(e.postData.type || '').toLowerCase();
            if (type.includes('application/json')) {
                const body = JSON.parse(e.postData.contents || '{}');
                action = String(body.action || '').trim();
                payload = body.payload || {};
            } else {
                action = String(e.parameter?.action || '').trim();
                // Soportar payload como string JSON o como objeto directo si viniera flat
                payload = e.parameter?.payload ? JSON.parse(e.parameter.payload) : {};
            }
        }

        if (!action) throw new Error('Falta action');

        // Email del ejecutor (generalmente viene en el payload desde la PWA)
        // En funciones admin, esto valida permisos.
        const email = String(payload.email || '').trim().toLowerCase();

        let result;

        switch (action) {
            // --- AUTH ---
            case 'login':
                result = login(email, payload.contrasena || payload.pass);
                break;
            case 'solicitarOTP':
                result = solicitarOTP(email);
                break;
            case 'establecerContrasena':
                result = establecerContrasena(email, payload.otp, payload.nueva);
                break;
            case 'getProfile':
                result = obtenerPerfilCompleto(email);
                break;

            // --- SERVICIOS NIÑERA ---
            case 'getServiciosNinera':
                result = obtenerServiciosProximosPorNombre(email, payload.dias || 14);
                break;
            case 'confirmarServicioPorFila':
                result = confirmarServicioPorFila(payload.sheet, payload.row_base, email);
                break;
            case 'registrarInicioServicio':
                result = registrarInicioServicio(payload.sheet, payload.row_base, payload.fecha, email);
                break;
            case 'registrarFinServicio':
                result = registrarFinServicio(payload.sheet, payload.row_base, payload.fecha, email);
                break;

            // --- DISPONIBILIDAD ---
            case 'obtenerDisponibilidad':
                result = obtenerDisponibilidad(email, payload.fechaISO);
                break;
            case 'guardarDisponibilidad':
                result = guardarDisponibilidad(email, payload);
                break;
            case 'obtenerDisponiblesSemana':
                result = obtenerDisponiblesSemana(email, payload.baseISO);
                break;

            // --- PLANEACIONES (NEURONANNY) ---
            case 'getResumenPlaneacionesSemana':
                result = obtenerResumenPlaneacionesSemana(payload.fechaBase, email);
                break;
            case 'obtenerPlaneacionNeuronanny':
                result = obtenerPlaneacionNeuronanny(payload, email);
                break;
            case 'guardarPlaneacionNeuronanny':
                result = guardarPlaneacionNeuronanny(payload, email);
                break;
            case 'editarPlaneacionNeuronanny':
                result = editarPlaneacionNeuronanny(payload, email);
                break;
            case 'reenviarPlaneacionCorregida':
                result = reenviarPlaneacionCorregida(payload, email);
                break;

            // --- SUPERVISIÓN ---
            case 'guardarObservacionesSupervision':
                result = guardarObservacionesSupervision(payload, email);
                break;

            // --- ADMIN ---
            case 'obtenerResumenDisponibilidadSemanaActual':
                // Admin function usually checks email internally or we check here
                if (!esAdmin(email)) throw new Error('No autorizado');
                result = obtenerResumenDisponibilidadSemanaActual();
                break;
            case 'apiSugerirNinerasServicio':
                // Validation inside function
                result = apiSugerirNinerasServicio(payload, email);
                break;
            case 'obtenerServiciosAdminRango':
                // payload: { desde, hasta }
                if (!esAdmin(email)) throw new Error('No autorizado');
                result = obtenerServiciosAdminRango(payload.desde, payload.hasta);
                break;
            case 'obtenerListaNineras':
                if (!esAdmin(email)) throw new Error('No autorizado');
                result = obtenerListaNineras();
                break;

            // --- PUNTOS ---
            case 'obtenerPuntajePorNombre':
                // Puede verlo la propia niñera o admin
                result = obtenerPuntajePorNombre(payload.nombre || SESION.nombre); // Frontend should send nombre
                break;
            case 'registrarPuntosManual':
                if (!esAdmin(email)) throw new Error('No autorizado');
                result = registrarPuntosManual(payload.nombre, payload.tipo);
                break;

            // --- PUSH ---
            case 'guardarPushSubscription':
                result = guardarPushSubscription({ email, subscription: payload.subscription });
                break;

            default:
                throw new Error('Acción no soportada: ' + action);
        }

        return ContentService.createTextOutput(JSON.stringify({ ok: true, data: result }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
