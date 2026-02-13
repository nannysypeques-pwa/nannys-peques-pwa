/**
 * Módulo de Convenios - Nannys y Peques
 * Maneja la visualización de convenios por ciudad y categoría.
 */

const Convenios = {
    estado: {
        inicializado: false,
        ciudadSeleccionada: null,
        categoriaSeleccionada: null,
        datos: [
            // Muestra inicial de datos para demostración. Fácil de expandir.
            {
                id: 1,
                ciudad: "Puebla",
                categoria: "Nutrición",
                nombre: "FER LEMUS LNCA",
                cedula: "72170",
                descripcion: "Nutrióloga especializada en planes de alimentación personalizados, con consultas online, seguimiento y acompañamiento para mejorar la salud, el bienestar y el control de peso.",
                beneficio: "20% de descuento<br>Cada consulta incluye:<br>1. Determinación de la composición corporal<br>2. Plan de alimentación completamente personalizado<br>3. Lista de súper y alimentos equivalentes<br>4. Educación nutricional<br>5. Acompañamiento y asesoría vía WhatsApp",
                maps: "https://maps.app.goo.gl/6i6uu7oo5zekoCEX6",
                whatsapp: "https://wa.me/522222159472",
                telefono: "2222159472",
                imagen: "assets/img/convenios/lemus.jpg"
            },
            {
                id: 2,
                ciudad: "Puebla",
                categoria: "Nutrición",
                nombre: "ESTEFANIA MORA LNCA",
                cedula: "9531115",
                descripcion: "Acompañamiento nutricional personalizado para mejorar tu salud, hábitos y objetivos de peso",
                beneficio: "1. Historia clínica para conocer antecedentes de tratamientos, enfermedades y objetivos personales.<br>2. Estudio para conocer peso, porcentaje de grasa corporal, grasa abdominal y masa muscular.<br>3.Plan nutricional personalizado con base en los resultados obtenidos y adaptado a las necesidades individuales.<br>4. Lectura de laboratorios bioquímicos.<br>5. Acceso a aplicación de nutrición.<br><br>Precio 1era consulta: $400<br>Precio consulta de seguimiento: $450",
                maps: "https://maps.app.goo.gl/ghAb1ZRoYCVacrF99",
                whatsapp: "https://wa.me/522228374789",
                telefono: "2228374789",
                imagen: "assets/img/convenios/estefania.jpg"
            },
            {
                id: 3,
                ciudad: "Puebla",
                categoria: "Nutrición",
                nombre: "Irishina Yañez Bahena LNCA",
                cedula: "9243816",
                descripcion: "Asesoría nutricional personalizada con planes de alimentación, educación en hábitos saludables y seguimiento para mejorar la salud, el peso y la composición corporal.",
                beneficio: "- 3 mediciones de composición corporal sin costo al mes.<br>- Descuento en consultas de seguimiento.<br>- Costo preferencial $500",
                maps: "https://maps.app.goo.gl/GDJzpNKzze1P1q4WA",
                whatsapp: "https://wa.me/522221576215",
                telefono: "2221576215",
                imagen: "assets/img/convenios/irishina.jpg"
            },
            {
                id: 4,
                ciudad: "Puebla",
                categoria: "Nutrición",
                nombre: "Nutryvive - Rosalba Luna",
                cedula: "11496575",
                descripcion: "Nutryvive es un centro de nutrición clínica integral y psiconutrición en Puebla que ofrece servicios profesionales enfocados en transformar tu alimentación y bienestar.",
                beneficio: "1era Consulta: $500<br>Consulta de seguimiento: $450<br><br>Plan de 5 consultas (1era vez y seguimiento) $2,000 con cuatro seguimientos",
                maps: "https://maps.app.goo.gl/Vao9ewXMat6sXYQ88",
                whatsapp: "https://wa.me/522224376679",
                telefono: "2224376679",
                imagen: "assets/img/convenios/nutry.jpg"
            },
            {
                id: 5,
                ciudad: "Puebla",
                categoria: "Ginecología",
                nombre: "Dr. René Augusto Hernández Morales - TORRES MEDICAS ANGELOPOLIS",
                cedula: "09250592 - 6704253",
                descripcion: "Ginecólogo colposcopista, profesionalidad y discreción.<br>Atención amable en instalaciones de primer nivel.<br>Seguridad y confiabilidad diagnóstica y terapéutica.",
                beneficio: "Costo preferencial en consultas $600",
                maps: "https://maps.app.goo.gl/Evob11HYUC59PEhMA",
                whatsapp: "https://wa.me/522222385068",
                telefono: "525541647819",
                imagen: "assets/img/convenios/rene_angelopolis.jpg"
            },
            {
                id: 6,
                ciudad: "Puebla",
                categoria: "Ginecología",
                nombre: "Dr. René Augusto Hernández Morales - PLAZA DORADA",
                cedula: "09250592 - 6704253",
                descripcion: "Ginecólogo colposcopista, profesionalidad y discreción.<br>Atención amable en instalaciones de primer nivel.<br>Seguridad y confiabilidad diagnóstica y terapéutica.",
                beneficio: "Costo preferencial en consultas $600",
                maps: "https://maps.app.goo.gl/c7Zd6KhpcjoUpbMZA",
                whatsapp: "https://wa.me/522222385068",
                telefono: "525541647819",
                imagen: "assets/img/convenios/rene_angelopolis.jpg"
            }

            ,
            {
                id: 7,
                ciudad: "Puebla",
                categoria: "Dentista",
                nombre: "CLÍNICA SOY DENTAL SC",
                cedula: "12213243",
                descripcion: "Somos una clínica dental integral bilingüe, contamos con todas las especialidades. Expertos en seguros dentales para proteger a tu familia. Tu salud oral es lo más importante para nosotros.",
                beneficio: "Póliza dental para hasta 5 personas con pagos accesibles de $300 quincenales por 20 quincenas.<br><br>Incluye servicios ilimitados sin costo adicional como consultas generales y de urgencia, diagnóstico integral con cámara intraoral, limpiezas, curaciones, anestesia, radiografías periapicales, resinas para caries, aplicación de flúor, selladores infantiles, pulido dental, atención por accidentes y bono especial en ortodoncia.<br><br>Además (independiente a la póliza):<br>• 30% de descuento en tratamientos y especialidades (endodoncia, coronas, implantes, prótesis, cirugías, periodoncia, estética y blanqueamientos).<br>• 50% en ortodoncia y ortopedia maxilofacial infantil.",
                maps: "https://maps.app.goo.gl/iouvrBDXi53M58Bu8",
                whatsapp: "https://wa.me/522216532543",
                telefono: "2216532543",
                imagen: "assets/img/convenios/soydental.jpg"
            },
            {
                id: 8,
                ciudad: "Puebla",
                categoria: "Dentista",
                nombre: "LUMIDENT - Dra. Jessica Aurora Castilleros Venegas",
                cedula: "8181622",
                descripcion: "Atención dental completa para mantener y mejorar tu salud bucal y la estética de tu sonrisa.",
                beneficio: "10% de descuento en:<br>• Limpieza dental<br>• Extracciones<br>• Resinas",
                maps: "https://maps.app.goo.gl/Kmy8JxgRY3WLdQ4M7",
                whatsapp: "https://wa.me/522226800571",
                telefono: "522226800571",
                imagen: "assets/img/convenios/lumident.jpg"
            },
            {
                id: 9,
                ciudad: "Puebla",
                categoria: "Dentista",
                nombre: "DENTAL NeoDent Puebla",
                cedula: "7388333",
                descripcion: "Brindamos solución a los problemas dentales más frecuentes, en especial el dolor dental y enfermedades propias de la boca.",
                beneficio: "• 1er consulta de valoración + registro de expediente + presupuesto: sin costo.<br>• Profilaxis para niños (4 a 12 años) + aplicación de barniz protector: $200.<br>• Profilaxis + 1 resina: $400 (adultos).<br><br>Además: 50%, 25% y 10% de descuento en tratamientos seleccionados.",
                maps: "https://maps.app.goo.gl/kBhSg6Eu1gCYsXUAA",
                whatsapp: "https://wa.me/522228732992",
                telefono: "522228732992",
                imagen: "assets/img/convenios/neodent.jpg"
            }

            ,
            /* =========================
            KuniLacta – Nutrición
            ========================= */
            {
                id: 10,
                ciudad: "Puebla",
                categoria: "Nutrición",
                nombre: "KuniLacta",
                cedula: "12831614 - 11477941",
                descripcion: "KuniLacta ofrece asesoría profesional en lactancia materna, talleres y cursos sobre alimentación y cuidado del bebé, apoyo en la iniciación de alimentación complementaria y productos especializados para madres y bebés.",
                beneficio: "10% de descuento en asesoría nutricional pediátrica.<br><br>Presencial y Online",
                maps: "https://maps.app.goo.gl/CC1tucd29k24Pjhx5",
                whatsapp: "https://wa.me/522299069826",
                telefono: "2299069826",
                imagen: "assets/img/convenios/kuni.jpg"
            },
            {
                id: 11,
                ciudad: "CDMX",
                categoria: "Nutrición",
                nombre: "KuniLacta",
                cedula: "12831614 - 11477941",
                descripcion: "KuniLacta ofrece asesoría profesional en lactancia materna, talleres y cursos sobre alimentación y cuidado del bebé, apoyo en la iniciación de alimentación complementaria y productos especializados para madres y bebés.",
                beneficio: "10% de descuento en asesoría nutricional pediátrica.<br><br>Modalidad Online.",
                maps: "https://maps.app.goo.gl/CC1tucd29k24Pjhx5",
                whatsapp: "https://wa.me/522299069826",
                telefono: "2299069826",
                imagen: "assets/img/convenios/kuni.jpg"
            },
            {
                id: 12,
                ciudad: "Xalapa",
                categoria: "Nutrición",
                nombre: "KuniLacta",
                cedula: "12831614 - 11477941",
                descripcion: "KuniLacta ofrece asesoría profesional en lactancia materna, talleres y cursos sobre alimentación y cuidado del bebé, apoyo en la iniciación de alimentación complementaria y productos especializados para madres y bebés.",
                beneficio: "10% de descuento en asesoría nutricional pediátrica.<br><br>Modalidad Online.",
                maps: "https://maps.app.goo.gl/CC1tucd29k24Pjhx5",
                whatsapp: "https://wa.me/522299069826",
                telefono: "2299069826",
                imagen: "assets/img/convenios/kuni.jpg"
            },
            {
                id: 13,
                ciudad: "Querétaro",
                categoria: "Nutrición",
                nombre: "KuniLacta",
                cedula: "12831614 - 11477941",
                descripcion: "KuniLacta ofrece asesoría profesional en lactancia materna, talleres y cursos sobre alimentación y cuidado del bebé, apoyo en la iniciación de alimentación complementaria y productos especializados para madres y bebés.",
                beneficio: "10% de descuento en asesoría nutricional pediátrica.<br><br>Modalidad Online.",
                maps: "https://maps.app.goo.gl/CC1tucd29k24Pjhx5",
                whatsapp: "https://wa.me/522299069826",
                telefono: "2299069826",
                imagen: "assets/img/convenios/kuni.jpg"
            },

            /* =========================
            KuniLacta – Lactancia
            ========================= */
            {
                id: 14,
                ciudad: "Puebla",
                categoria: "Lactancia",
                nombre: "KuniLacta",
                cedula: "12831614 - 11477941",
                descripcion: "KuniLacta ofrece asesoría profesional en lactancia materna, talleres y cursos sobre alimentación y cuidado del bebé, apoyo en la iniciación de alimentación complementaria y productos especializados para madres y bebés.",
                beneficio: "• Asesoría de lactancia: 10% de descuento.<br>• Consulta pediatría: 10% de descuento.<br><br>Presencial y Online.<br><br>• Cursos en vivo: $380.<br>• Cursos presenciales: $600.<br>• Cursos grabados: $299.",
                maps: "https://maps.app.goo.gl/CC1tucd29k24Pjhx5",
                whatsapp: "https://wa.me/522299069826",
                telefono: "2299069826",
                imagen: "assets/img/convenios/kuni.jpg"
            },
            {
                id: 15,
                ciudad: "CDMX",
                categoria: "Lactancia",
                nombre: "KuniLacta",
                cedula: "12831614 - 11477941",
                descripcion: "KuniLacta ofrece asesoría profesional en lactancia materna, talleres y cursos sobre alimentación y cuidado del bebé, apoyo en la iniciación de alimentación complementaria y productos especializados para madres y bebés.",
                beneficio: "• Asesoría de lactancia: 10% de descuento.<br>• Consulta pediatría: 10% de descuento.<br><br>Modalidad Online.<br><br>• Cursos en vivo: $380.<br>• Cursos grabados: $299.",
                maps: "https://maps.app.goo.gl/CC1tucd29k24Pjhx5",
                whatsapp: "https://wa.me/522299069826",
                telefono: "2299069826",
                imagen: "assets/img/convenios/kuni.jpg"
            },
            {
                id: 16,
                ciudad: "Xalapa",
                categoria: "Lactancia",
                nombre: "KuniLacta",
                cedula: "12831614 - 11477941",
                descripcion: "KuniLacta ofrece asesoría profesional en lactancia materna, talleres y cursos sobre alimentación y cuidado del bebé, apoyo en la iniciación de alimentación complementaria y productos especializados para madres y bebés.",
                beneficio: "• Asesoría de lactancia: 10% de descuento.<br>• Consulta pediatría: 10% de descuento.<br><br>Modalidad Online.<br><br>• Cursos en vivo: $380.<br>• Cursos grabados: $299.",
                maps: "https://maps.app.goo.gl/CC1tucd29k24Pjhx5",
                whatsapp: "https://wa.me/522299069826",
                telefono: "2299069826",
                imagen: "assets/img/convenios/kuni.jpg"
            },
            {
                id: 17,
                ciudad: "Querétaro",
                categoria: "Lactancia",
                nombre: "KuniLacta",
                cedula: "12831614 - 11477941",
                descripcion: "KuniLacta ofrece asesoría profesional en lactancia materna, talleres y cursos sobre alimentación y cuidado del bebé, apoyo en la iniciación de alimentación complementaria y productos especializados para madres y bebés.",
                beneficio: "• Asesoría de lactancia: 10% de descuento.<br>• Consulta pediatría: 10% de descuento.<br><br>Modalidad Online.<br><br>• Cursos en vivo: $380.<br>• Cursos grabados: $299.",
                maps: "https://maps.app.goo.gl/CC1tucd29k24Pjhx5",
                whatsapp: "https://wa.me/522299069826",
                telefono: "2299069826",
                imagen: "assets/img/convenios/kuni.jpg"
            }

            ,
            /* =========================
            Terintalia – Puebla
            ========================= */
            {
                id: 18,
                ciudad: "Puebla",
                categoria: "Nutrición",
                nombre: "Terintalia Salud Integral - Psic. Eli Mendez",
                cedula: "8326971 - 12570528",
                descripcion: "En Terintalia creemos que cada persona merece un espacio seguro para sanar, aprender y reconectar con su bienestar. Acompañamos procesos emocionales, formativos y humanos desde la psicoterapia, la educación y el desarrollo profesional, con empatía, ciencia y compromiso real.",
                beneficio: "10% de descuento institucional en nutrición.<br><br>Acceso a programas y paquetes integrales con condiciones preferenciales según valoración profesional.<br><br>Descuentos en talleres psicoeducativos (manejo emocional infantil, desarrollo socioemocional, autocuidado y contención profesional).<br><br>Becas parciales para cursos y talleres seleccionados (según convocatoria y cupo).<br><br>Canal directo de orientación y derivación para atención prioritaria del equipo multidisciplinario.",
                maps: "https://maps.app.goo.gl/9UUAfAqpyaBsvwvJ7",
                whatsapp: "https://wa.me/522223964095",
                telefono: "2223624177",
                imagen: "assets/img/convenios/ter.jpeg"
            },
            {
                id: 19,
                ciudad: "Puebla",
                categoria: "Psicología",
                nombre: "Terintalia Salud Integral - Psic. Eli Mendez",
                cedula: "8326971 - 12570528",
                descripcion: "En Terintalia creemos que cada persona merece un espacio seguro para sanar, aprender y reconectar con su bienestar. Acompañamos procesos emocionales, formativos y humanos desde la psicoterapia, la educación y el desarrollo profesional, con empatía, ciencia y compromiso real.",
                beneficio: "10% de descuento institucional en psicología (niños, adolescentes y adultos; terapia individual, de pareja y familiar).<br><br>Acceso a programas y paquetes integrales con condiciones preferenciales según valoración profesional.<br><br>Descuentos en talleres psicoeducativos (manejo emocional infantil, desarrollo socioemocional, autocuidado y contención profesional).<br><br>Becas parciales para cursos y talleres seleccionados (según convocatoria y cupo).<br><br>Canal directo de orientación y derivación para atención prioritaria del equipo multidisciplinario.",
                maps: "https://maps.app.goo.gl/9UUAfAqpyaBsvwvJ7",
                whatsapp: "https://wa.me/522223964095",
                telefono: "2223624177",
                imagen: "assets/img/convenios/ter.jpeg"
            },
            {
                id: 20,
                ciudad: "Puebla",
                categoria: "Fisioterapia",
                nombre: "Terintalia Salud Integral - Psic. Eli Mendez",
                cedula: "8326971 - 12570528",
                descripcion: "En Terintalia creemos que cada persona merece un espacio seguro para sanar, aprender y reconectar con su bienestar. Acompañamos procesos emocionales, formativos y humanos desde la psicoterapia, la educación y el desarrollo profesional, con empatía, ciencia y compromiso real.",
                beneficio: "10% de descuento institucional en fisioterapia (niños, adolescentes y adultos).<br><br>Acceso a programas y paquetes integrales con condiciones preferenciales según valoración profesional.<br><br>Descuentos en talleres psicoeducativos (manejo emocional infantil, desarrollo socioemocional, autocuidado y contención profesional).<br><br>Becas parciales para cursos y talleres seleccionados (según convocatoria y cupo).<br><br>Canal directo de orientación y derivación para atención prioritaria del equipo multidisciplinario.",
                maps: "https://maps.app.goo.gl/9UUAfAqpyaBsvwvJ7",
                whatsapp: "https://wa.me/522223964095",
                telefono: "2223624177",
                imagen: "assets/img/convenios/ter.jpeg"
            },

            /* =========================
            Studio Belle – Puebla
            ========================= */
            {
                id: 21,
                ciudad: "Puebla",
                categoria: "Salud y belleza",
                nombre: "Studio Belle",
                cedula: "7504180",
                descripcion: "Somos un estudio especializado en el cuidado de la salud y la belleza. Nos especializamos en que te veas y sientas bien, cuidando tu salud en cada tratamiento.",
                beneficio: "20% de descuento en el tratamiento de tu preferencia.<br><br>Control de peso.<br>Aparatologías corporales.<br>Depilación láser.<br>Tratamientos faciales.<br>HIFU.<br>Y muchos más.",
                maps: "https://maps.app.goo.gl/CsNd9qX4dnhgcsL58",
                whatsapp: "https://wa.me/522214069385",
                telefono: "2214069385",
                imagen: "assets/img/convenios/studio.jpg"
            },

            {
                id: 22,
                ciudad: "Puebla",
                categoria: "Diversión",
                nombre: "Ludoteca Nannys y Peques",
                descripcion: "Un lugar diseñado con amor para nuestros peques, con juegos y juguetes a libre demanda que estimulan la creatividad y desarrollo. <br>Prekinder, tardes temáticas, consejos técnicos, cursos de invierno y verano, y muchas más sorpresas",
                beneficio: "20% de descuento en tu visita <br> Martes de 2x1 en acceso general",
                maps: "https://maps.app.goo.gl/ZrvGx1BebPjuzBPt5",
                whatsapp: "https://wa.me/522221826133",
                telefono: "2221826133",
                imagen: "assets/img/convenios/ludo.jpg"
            },



        ],
        ciudades: ["Puebla", "Xalapa", "Querétaro", "CDMX"],
        categorias: [
            "Doctor", "Pediatra", "Dentista", "Psicologia",
            "Fisioterapia", "Nutrición", "Ginecología", "Diversión", "Salud y belleza", "Ejercicio",
            "Restaurantes", "Tiendas de moda", "Lactancia"
        ]
    },

    init: function () {
        if (this.estado.inicializado) return;
        this.inyectarEstilos();
        this.estado.inicializado = true;
        this.render();
    },

    inyectarEstilos: function () {
        if (document.getElementById('convenios-styles')) return;
        const style = document.createElement('style');
        style.id = 'convenios-styles';
        style.innerHTML = `
            .convenios-wrapper { padding: 20px; padding-bottom: 100px; }
            .btn-volver {
                background: none; border: none; color: var(--pink-main);
                font-weight: 800; display: flex; align-items: center;
                gap: 5px; margin-bottom: 20px; font-size: 16px;
            }

            /* Selector de Ciudades */
            .city-grid {
                display: grid; grid-template-columns: repeat(2, 1fr);
                gap: 15px; margin-bottom: 30px;
            }
            .btn-city {
                background: white; border: 2px solid var(--pink-light);
                padding: 20px; border-radius: 20px; text-align: center;
                font-family: 'DM Serif Display', serif; font-size: 20px;
                color: var(--text-main); transition: all 0.3s;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            }
            .btn-city.active {
                background: var(--pink-main); color: white; border-color: var(--pink-main);
                transform: scale(1.05); box-shadow: 0 10px 20px rgba(232, 76, 154, 0.3);
            }

            /* Filtros de Categoría */
            .category-scroll {
                display: flex; overflow-x: auto; gap: 10px;
                padding: 10px 0; margin-bottom: 20px; scrollbar-width: none;
            }
            .category-scroll::-webkit-scrollbar { display: none; }
            .btn-category {
                white-space: nowrap; padding: 8px 16px; border-radius: 15px;
                background: #f1f5f9; color: var(--text-muted); font-size: 13px;
                font-weight: 700; border: 1px solid transparent;
            }
            .btn-category.active {
                background: var(--blue-main); color: white;
            }

            /* Tarjetas de Convenio */
            .convenio-card {
                background: white; border-radius: 20px; padding: 15px;
                display: flex; gap: 15px; align-items: center;
                margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                border: 1px solid #f1f5f9;
            }
            .convenio-img {
                width: 80px; height: 80px; border-radius: 15px; object-fit: cover;
            }
            .convenio-info { flex: 1; }
            .convenio-tag { 
                font-size: 10px; text-transform: uppercase; font-weight: 800;
                color: var(--blue-main); margin-bottom: 4px;
            }
            .convenio-nombre { 
                font-family: 'DM Serif Display', serif; font-size: 18px; 
                margin: 0 0 5px 0; color: var(--text-main);
            }
            .convenio-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4; }
            .convenio-benefit {
                background: #FFFBEB; color: #B45309; padding: 6px 10px;
                border-radius: 8px; font-size: 12px; font-weight: 800; border: 1px dashed #FCD34D;
            }
            .convenio-cedula {
                font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-style: italic; margin-top: -3px;
            }
            .convenio-actions {
                display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;
            }
            .btn-action-small {
                min-width: 80px; flex: 1; padding: 8px 5px; border-radius: 10px; font-size: 11px;
                font-weight: 700; text-align: center; border: 1px solid #e2e8f0; color: var(--text-main);
                display: flex; align-items: center; justify-content: center; gap: 3px;
            }
            .btn-action-small.maps { background: #E0F2FE; color: #0369A1; border: none; }
            .btn-action-small.whatsapp { background: #DCFCE7; color: #166534; border: none; }
        `;
        document.head.appendChild(style);
    },

    seleccionarCiudad: function (ciudad) {
        this.estado.ciudadSeleccionada = ciudad;
        this.estado.categoriaSeleccionada = null; // Reiniciar categoria al cambiar ciudad
        this.render();
    },

    seleccionarCategoria: function (cat) {
        this.estado.categoriaSeleccionada = (this.estado.categoriaSeleccionada === cat) ? null : cat;
        this.render();
    },

    render: function () {
        const container = document.getElementById('vista-convenios');
        if (!container) return;

        let html = `
            <div class="convenios-wrapper">
                <button class="btn-volver" onclick="irVista('comunidad')">❮ Volver a Comunidad</button>
                <div class="comunidad-section-header">
                    <h3 class="comunidad-section-title">Nuestros Convenios</h3>
                </div>
                
                <div class="city-grid">
                    ${this.estado.ciudades.map(c => `
                        <div class="btn-city ${this.estado.ciudadSeleccionada === c ? 'active' : ''}" 
                             onclick="Convenios.seleccionarCiudad('${c}')">${c}</div>
                    `).join('')}
                </div>
        `;

        if (this.estado.ciudadSeleccionada) {
            html += `
                <div class="category-scroll">
                    ${[...new Set(this.estado.datos
                .filter(d => d.ciudad === this.estado.ciudadSeleccionada)
                .map(d => d.categoria))]
                    .map(cat => `
                        <div class="btn-category ${this.estado.categoriaSeleccionada === cat ? 'active' : ''}" 
                             onclick="Convenios.seleccionarCategoria('${cat}')">${cat}</div>
                    `).join('')}
                </div>
                
                <div class="convenios-list">
                    ${this.renderListaConvenios()}
                </div>
            `;
        } else {
            html += `
                <div class="no-data" style="background: rgba(255,255,255,0.5); border-radius: 20px; padding: 40px;">
                    <span style="font-size: 40px;">📍</span>
                    <p style="margin-top: 10px; font-weight: 700;">Selecciona una ciudad para ver sus beneficios exclusivos</p>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    },

    renderListaConvenios: function () {
        const filtrados = this.estado.datos.filter(d =>
            d.ciudad === this.estado.ciudadSeleccionada &&
            (!this.estado.categoriaSeleccionada || d.categoria === this.estado.categoriaSeleccionada)
        );

        if (filtrados.length === 0) {
            return `<div class="no-data">Próximamente más convenios en esta sección de ${this.estado.ciudadSeleccionada}.</div>`;
        }

        return filtrados.map(c => `
            <div class="convenio-card">
                <img src="${c.imagen}" class="convenio-img">
                <div class="convenio-info">
                    <div class="convenio-tag">${c.categoria}</div>
                    <h4 class="convenio-nombre">${c.nombre}</h4>
                    ${c.cedula ? `<p class="convenio-cedula">Cédula Prof: ${c.cedula}</p>` : ''}
                    <p class="convenio-desc">${c.descripcion}</p>
                    <div class="convenio-benefit">🎁 ${c.beneficio}</div>
                    <div class="convenio-actions">
                        <a href="${c.maps}" target="_blank" class="btn-action-small maps">📍 Maps</a>
                        ${c.whatsapp ? `<a href="${c.whatsapp}" target="_blank" class="btn-action-small whatsapp">💬 WhatsApp</a>` : ''}
                        ${c.telefono ? `<a href="tel:${c.telefono}" class="btn-action-small">📞 Llamar</a>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
};

window.Convenios = Convenios;