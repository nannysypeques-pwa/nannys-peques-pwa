function doGet() {
    const t = HtmlService.createTemplateFromFile('Index'); t.ZONA_HORARIA = ZONA_HORARIA;
    return t.evaluate().setTitle('Nannys y Peques')
        .setFaviconUrl('https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x16.png')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).getContent(); }

const HOJA_SERVICIOS = 'Servicios';
const HOJA_PUNTOS_MANUAL = 'PuntosManual';

const PUNTOS_DEFINICIONES = {
    'SERVICIO_ULTIMO_MINUTO': { puntos: 2, descripcion: 'Servicio de último minuto' },
    'FAMILIA_REPITE': { puntos: 1, descripcion: 'La familia pide de nuevo la misma nanny' },
    'CAPACITACION_NO_OBLIGATORIA': { puntos: 7, descripcion: 'Participar en capacitación no obligatoria' },
    'INICIAR_SERVICIO_FIJO': { puntos: 20, descripcion: 'Iniciar un servicio fijo' },
    'GANAR_INSIGNIA': { puntos: 10, descripcion: 'Ganar una insignia' },
    'ENTRENAMIENTO_NANNY_STAR': { puntos: 25, descripcion: 'Asistir a entrenamiento Nanny Star' },
    'RECOMENDAR_NANNY': { puntos: 20, descripcion: 'Recomendar a otra nanny' },
    'NO_CONECTARSE_REUNION': { puntos: -10, descripcion: 'No conectarse a reuniones' },
    'FALTA_SERVICIO': { puntos: -10, descripcion: 'Falta a servicio' },
    'REPORTE_NEGATIVO': { puntos: -10, descripcion: 'Reporte negativo' },
    'MALA_ACTITUD': { puntos: -10, descripcion: 'Mala actitud' }
};

function getHojaPuntosManual_() {
    const ss = SpreadsheetApp.getActive();
    let sh = ss.getSheetByName(HOJA_PUNTOS_MANUAL);
    if (!sh) {
        sh = ss.insertSheet(HOJA_PUNTOS_MANUAL);
        sh.appendRow(['fecha', 'nombre', 'tipo', 'descripcion', 'puntos', 'semana']);
    }
    return sh;
}

function parseFechaFlexible_(v) {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    const s = String(v).trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(s + 'T00:00:00');
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

function weekKeyFromDate_(d) {
    if (!d) return '';
    const dd = new Date(d.getTime());
    let day = dd.getDay();
    if (day === 0) day = 7;
    dd.setDate(dd.getDate() + 1 - day);
    return Utilities.formatDate(dd, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function obtenerServiciosEventualesPorNombre_(nombreNinera) {
    const sh = SpreadsheetApp.getActive().getSheetByName(HOJA_SERVICIOS);
    if (!sh) throw new Error('No existe hoja Servicios');
    const data = sh.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const iFecha = headers.indexOf('fecha'), iNombre = headers.indexOf('nombre de ninera'), iEstado = headers.indexOf('estado');
    const result = [];
    for (let r = 1; r < data.length; r++) {
        if (String(data[r][iNombre]).trim() === nombreNinera) {
            result.push({ fecha: parseFechaFlexible_(data[r][iFecha]), estado: String(data[r][iEstado]).trim().toLowerCase() });
        }
    }
    return result;
}

function leerPuntosManualPorNombre_(nombreNinera) {
    const data = getHojaPuntosManual_().getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const iNombre = headers.indexOf('nombre'), iPuntos = headers.indexOf('puntos'), iSemana = headers.indexOf('semana'), iTipo = headers.indexOf('tipo');
    const manualByWeek = {};
    let totalManual = 0;
    for (let r = 1; r < data.length; r++) {
        if (String(data[r][iNombre]).trim() === nombreNinera) {
            const pts = Number(data[r][iPuntos] || 0); totalManual += pts;
            const key = data[r][iSemana] || 'N/A';
            if (!manualByWeek[key]) manualByWeek[key] = [];
            manualByWeek[key].push({ tipo: data[r][iTipo], puntos: pts });
        }
    }
    return { totalManual, manualByWeek };
}

function calcularPuntosAutomaticos_(servicios, manualByWeek) {
    const porSemana = {};
    servicios.forEach(s => {
        if (s.estado === 'completado') {
            const wk = weekKeyFromDate_(s.fecha);
            porSemana[wk] = (porSemana[wk] || 0) + 1;
        }
    });
    let totalAuto = 0;
    const detalleSemanal = [];
    Object.keys(porSemana).forEach(wk => {
        const completados = porSemana[wk];
        let pPunt = 0, pEval = 0, pRep = 0, pTres = 0;
        if (completados >= 2) { pPunt = 2; pEval = 2; pRep = 3; if (completados >= 3) pTres = 2; }
        const manual = manualByWeek[wk] || [];
        if (manual.some(m => m.tipo === 'FALTA_SERVICIO')) { pPunt = 0; pEval = 0; pRep = 0; pTres = 0; }
        else if (manual.some(m => m.tipo === 'REPORTE_NEGATIVO')) pEval = 0;
        const total = pPunt + pEval + pRep + pTres;
        totalAuto += total;
        detalleSemanal.push({ semana: wk, completados, puntos: { puntualidad: pPunt, evaluacion_positiva: pEval, reportes: pRep, tres_servicios: pTres, total } });
    });
    return { totalAuto, detalleSemanal };
}

function calcularPuntosPorHitos_(total) {
    let pts = 0; const ds = [];
    if (total >= 50) { pts += 10; ds.push({ umbral: 50, puntos: 10 }); }
    if (total >= 75) { pts += 15; ds.push({ umbral: 75, puntos: 15 }); }
    if (total >= 100) { pts += 20; ds.push({ umbral: 100, puntos: 20 }); }
    if (total >= 125) { pts += 25; ds.push({ umbral: 125, puntos: 25 }); }
    return { totalMilestones: pts, detalles: ds };
}

function obtenerPuntajePorNombre(nombre) {
    const servicios = obtenerServiciosEventualesPorNombre_(nombre);
    const totalEventuales = servicios.filter(s => s.estado === 'completado').length;
    const manual = leerPuntosManualPorNombre_(nombre);
    const auto = calcularPuntosAutomaticos_(servicios, manual.manualByWeek);
    const hitos = calcularPuntosPorHitos_(totalEventuales);
    const total = auto.totalAuto + manual.totalManual + hitos.totalMilestones;
    let nivel = 'Pink Nanny';
    if (total >= 300) nivel = 'Golden Nanny'; else if (total >= 200) nivel = 'Blue Nanny'; else if (total >= 100) nivel = 'Yellow Nanny';
    return { nombre, total, nivel, servicios: totalEventuales, auto, manual, milestones: hitos };
}

function registrarPuntosManual(nombre, tipoId) {
    const def = PUNTOS_DEFINICIONES[tipoId];
    if (!def) throw new Error('Tipo desconocido');
    const sh = getHojaPuntosManual_();
    const ahora = new Date();
    sh.appendRow([Utilities.formatDate(ahora, ZONA_HORARIA, 'yyyy-MM-dd'), nombre, tipoId, def.descripcion, def.puntos, weekKeyFromDate_(ahora)]);
    return obtenerPuntajePorNombre(nombre);
}

function obtenerResumenDisponibilidadSemanaActual() {
    const valsU = _hoja(NOMBRE_HOJA_USUARIOS).getDataRange().getValues();
    const idxEmail = _idxCol(_hoja(NOMBRE_HOJA_USUARIOS), 'email'), idxNombre = _idxCol(_hoja(NOMBRE_HOJA_USUARIOS), 'nombre'), idxCiudad = _idxCol(_hoja(NOMBRE_HOJA_USUARIOS), 'ciudad');
    const hoyISO = Utilities.formatDate(new Date(), ZONA_HORARIA, 'yyyy-MM-dd');
    const fechas = _diasDeSemana(hoyISO).map(d => d.fecha);
    const valsD = _hoja(NOMBRE_HOJA_DISPONIBILIDAD).getDataRange().getValues();
    const tiene = {};
    for (let i = 1; i < valsD.length; i++) {
        if (fechas.includes(_toISODate(valsD[i][1])) && (_esVerdadero(valsD[i][3]) || _esVerdadero(valsD[i][4]))) tiene[_norm(valsD[i][0])] = true;
    }
    const resumen = {};
    for (let i = 1; i < valsU.length; i++) {
        const ciudad = valsU[i][idxCiudad - 1] || 'Sin ciudad';
        if (!resumen[ciudad]) resumen[ciudad] = [];
        resumen[ciudad].push({ nombre: valsU[i][idxNombre - 1], email: valsU[i][idxEmail - 1], tiene: !!tiene[_norm(valsU[i][idxNombre - 1])] });
    }
    return Object.keys(resumen).sort().map(c => ({ ciudad: c, nineras: resumen[c].sort((a, b) => a.nombre.localeCompare(b.nombre)) }));
}
