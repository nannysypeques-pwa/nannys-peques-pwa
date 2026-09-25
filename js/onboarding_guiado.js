/**
 * ============================================================================
 * MÓDULO DE ONBOARDING INTERACTIVO GUIADO - CLIENTE Y NIÑERA
 * Nannys y Peques - Modern UX/UI
 * Soporte para pestañas: Inicio, Servicios, Estimulación, Comunidad y Perfil
 * Uso exclusivo del Avatar Corporativo Oficial (2D ilustración)
 * ============================================================================
 */

(function () {
  'use strict';

  const OnboardingGuiado = {
    overlayEl: null,
    spotlightEl: null,
    cardEl: null,
    rolActual: 'cliente',
    seccionActual: 'inicio',
    pasoActual: 0,
    pasoPrevioIndex: null,
    activo: false,

    // Definición de pasos por sección y rol
    flujos: {
      // --- INICIO CLIENTE ---
      cliente: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Bienvenida',
          titulo: '¡Te damos la bienvenida a Nannys y Peques!',
          descripcion: 'Tu espacio de confianza para el cuidado profesional y amoroso de tus pequeños. Te acompañaremos con un breve recorrido interactivo.',
          btnTexto: 'Empezar recorrido'
        },
        {
          targetId: 'ciHeroCard',
          avatar: 'assets/img/avatar/avatar_hero_servicio.png',
          badge: 'Paso 1 de 5',
          titulo: 'Tu Próximo Servicio',
          descripcion: 'Aquí podrás ver de inmediato los datos del servicio programado, la niñera asignada, el horario y el estatus de confirmación.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'ciMetricsGrid',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 2 de 5',
          titulo: 'Resumen y Horas Disponibles',
          descripcion: 'Monitorea rápidamente las horas contratadas, la confirmación de la semana y el balance disponible con total claridad.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'ciActivityCarouselContainer',
          avatar: 'assets/img/avatar/avatar_actividad_dia.png',
          badge: 'Paso 3 de 5',
          titulo: 'Estimulación y Actividades',
          descripcion: 'Descubre dinámicas lúdicas y pedagógicas sugeridas para el desarrollo integral, motricidad y diversión de tus pequeños.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'ciConveniosCarouselSection',
          avatar: 'assets/img/avatar/avatar_en_camino.png',
          badge: 'Paso 4 de 5',
          titulo: 'Convenios y Beneficios',
          descripcion: 'Accede a descuentos y beneficios exclusivos con marcas y establecimientos aliados en tu ciudad pensados para ti y tu familia.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'nav-cliente',
          selectorFallback: '#nav-cliente, #nav-ninera, .bottom-nav',
          avatar: 'assets/img/avatar/avatar_bitacora_reporte.png',
          badge: 'Paso 5 de 5',
          titulo: 'Menú y Bitácora en Vivo',
          descripcion: 'En la barra inferior podrás cambiar de sección: consultar tus Servicios, ver la Comunidad y revisar la Bitácora diaria de cuidado.',
          btnTexto: 'Finalizar recorrido'
        },
        {
          targetId: null, // Modal centrado de despedida
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡Listo!',
          titulo: '¡Todo listo para comenzar!',
          descripcion: 'Estamos felices de acompañar a tu familia. Recuerda que puedes volver a ver este tutorial cuando lo desees con el botón de ayuda.',
          btnTexto: '¡Comenzar ahora!'
        }
      ],

      // --- INICIO NIÑERA ---
      ninera: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Bienvenida Staff',
          titulo: '¡Hola, Nanny! Bienvenida a tu panel',
          descripcion: 'Aquí tienes todas las herramientas para gestionar tus turnos, registrar bitácoras y aplicar estimulación de manera profesional.',
          btnTexto: 'Iniciar recorrido'
        },
        {
          targetId: 'niHeroCard',
          avatar: 'assets/img/avatar/avatar_en_camino.png',
          badge: 'Paso 1 de 4',
          titulo: 'Servicio y Familia Asignada',
          descripcion: 'Revisa de inmediato los detalles de tu próximo turno, la familia asignada, horarios y el estatus de confirmación del servicio.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'niMetricsGrid',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 2 de 4',
          titulo: 'Tus Turnos y Métricas',
          descripcion: 'Lleva el control de tus servicios realizados en la semana y mantén al día tu récord y desempeño en el equipo.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'niConveniosCarouselSection',
          avatar: 'assets/img/avatar/avatar_actividad_dia.png',
          badge: 'Paso 3 de 4',
          titulo: 'Convenios y Beneficios',
          descripcion: 'Descubre convenios y beneficios exclusivos disponibles en tu ciudad para consentirte y disfrutar en tus días libres.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'nav-ninera',
          selectorFallback: '#nav-ninera, #nav-cliente, .bottom-nav',
          avatar: 'assets/img/avatar/avatar_bitacora_reporte.png',
          badge: 'Paso 4 de 4',
          titulo: 'Menú y Llenado de Bitácoras',
          descripcion: 'Usa el menú inferior para registrar comidas, siestas, medicinas y llevar el reporte que mantendrá informados a los papás.',
          btnTexto: 'Finalizar recorrido'
        },
        {
          targetId: null, // Modal centrado de despedida
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡Mucho éxito!',
          titulo: '¡Lista para una jornada brillante!',
          descripcion: 'Recuerda portar siempre tu uniforme oficial completo, ser puntual y brindar el mejor cuidado con amor y respeto.',
          btnTexto: '¡Entendido y lista!'
        }
      ],

      // --- PESTAÑA SERVICIOS (CLIENTE) ---
      servicios: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Guía de Servicios',
          titulo: 'Agenda, Servicios y Bitácora',
          descripcion: 'Aquí puedes consultar tu calendario completo de servicios de cuidado, monitorear horas activas y revisar la bitácora diaria en tiempo real.',
          btnTexto: 'Empezar recorrido'
        },
        {
          targetId: 'csMetricsRow',
          selectorFallback: '#csMetricsRow, #svcCard',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 1 de 4',
          titulo: 'Métricas y Horas Programadas',
          descripcion: 'Revisa de inmediato la cantidad de servicios confirmados, las horas programadas para las próximas 2 semanas y las bitácoras pendientes.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'csCalendarStrip',
          selectorFallback: '#csCalendarStrip, #cal',
          avatar: 'assets/img/avatar/avatar_hero_servicio.png',
          badge: 'Paso 2 de 4',
          titulo: 'Calendario de 14 Días',
          descripcion: 'Navega por los días de la agenda para consultar los turnos asignados a cada fecha, horarios y la niñera que te acompañará.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '#csBitacoraContainer .cs-log-card, #csBitacoraContainer, #cs-sec-bitacora',
          avatar: 'assets/img/avatar/avatar_bitacora_reporte.png',
          badge: 'Paso 3 de 4',
          titulo: 'Cuadro de Bitácora Diaria',
          descripcion: 'En este recuadro revisas el resumen del turno: horas de Check-in y Check-out, estado de ánimo y salud del peque. Pulsa "Ver bitácora completa" comidas, siestas y notas de la niñera en tiempo real.',
          btnTexto: 'Siguiente',
          onEnter: function () {
            if (window.ClienteServicios && typeof window.ClienteServicios.setTab === 'function') {
              window.ClienteServicios.setTab('bitacora');
            }
          },
          onLeave: function () {
            if (window.ClienteServicios && typeof window.ClienteServicios.setTab === 'function') {
              window.ClienteServicios.setTab('programados');
            }
          }
        },
        {
          targetId: 'cs-sec-programados',
          selectorFallback: '#csServicesList, #csBitacoraContainer, #svcCard',
          avatar: 'assets/img/avatar/avatar_en_camino.png',
          badge: 'Paso 4 de 4',
          titulo: 'Tarjetas de Servicios y Estatus',
          descripcion: 'Haz clic en cualquier tarjeta para ver la información completa del turno, direcciones, observaciones especiales y estatus de confirmación.',
          btnTexto: 'Finalizar'
        },
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡Agenda Clara!',
          titulo: '¡Tu programación y bitácora al día!',
          descripcion: 'Disfruta de la tranquilidad y seguridad de tener cada detalle del cuidado organizado y respaldado.',
          btnTexto: '¡Entendido!'
        }
      ],

      // --- PESTAÑA SERVICIOS (NIÑERA) ---
      servicios_ninera: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Servicios Staff',
          titulo: 'Tus Servicios y Bitácoras',
          descripcion: 'Aquí gestionas tu calendario de turnos asignados, consultas las direcciones de las familias y registras la bitácora diaria en tiempo real.',
          btnTexto: 'Iniciar recorrido'
        },
        {
          targetId: 'csMetricsRow',
          selectorFallback: '#csMetricsRow, #svcCard',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 1 de 4',
          titulo: 'Tus Horas y Turnos Asignados',
          descripcion: 'Monitorea tus servicios confirmados para las próximas dos semanas, el total de horas acumuladas y las bitácoras que tienes pendientes por reportar.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'csCalendarStrip',
          selectorFallback: '#csCalendarStrip, #cal',
          avatar: 'assets/img/avatar/avatar_hero_servicio.png',
          badge: 'Paso 2 de 4',
          titulo: 'Calendario de 14 Días',
          descripcion: 'Explora las fechas para conocer los turnos asignados a cada día, horarios de entrada y salida, y la familia que vas a atender.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '#csBitacoraContainer .cs-log-card, #csBitacoraContainer, #cs-sec-bitacora',
          avatar: 'assets/img/avatar/avatar_bitacora_reporte.png',
          badge: 'Paso 3 de 4',
          titulo: 'Llenado de Bitácora Diaria',
          descripcion: 'Registra tu Check-in puntual al llegar a la casa y Check-out al salir. Pulsa para reportar comidas, siestas, medicamentos administrados, estado de ánimo y subir fotos del peque.',
          btnTexto: 'Siguiente',
          onEnter: function () {
            if (window.ClienteServicios && typeof window.ClienteServicios.setTab === 'function') {
              window.ClienteServicios.setTab('bitacora');
            }
          },
          onLeave: function () {
            if (window.ClienteServicios && typeof window.ClienteServicios.setTab === 'function') {
              window.ClienteServicios.setTab('programados');
            }
          }
        },
        {
          targetId: 'cs-sec-programados',
          selectorFallback: '#csServicesList, #csBitacoraContainer, #svcCard',
          avatar: 'assets/img/avatar/avatar_en_camino.png',
          badge: 'Paso 4 de 4',
          titulo: 'Ubicación y Datos de la Familia',
          descripcion: 'Toca cualquier tarjeta de servicio para abrir la dirección exacta con enlace directo a Google Maps, indicaciones de acceso y teléfonos de emergencia.',
          btnTexto: 'Finalizar'
        },
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡Servicios Claros!',
          titulo: '¡Todo listo para tus turnos!',
          descripcion: 'Ten siempre a la mano tus horarios y direcciones para llegar puntual y brindar una experiencia de cuidado excepcional.',
          btnTexto: '¡Entendido y lista!'
        }
      ],

      // --- PESTAÑA ESTIMULACIÓN (CLIENTE) ---
      estimulacion: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Guía de Estimulación',
          titulo: 'Ruta de Desarrollo Integral',
          descripcion: 'Un espacio pedagógico creado para acompañar y potenciar el crecimiento motriz, cognitivo, lingüístico y emocional de tus pequeños.',
          btnTexto: 'Empezar recorrido'
        },
        {
          targetId: 'dropdown-peque',
          selectorFallback: '#dropdown-peque, .peque-selector-card, .est-controls-group',
          avatar: 'assets/img/avatar/avatar_nanny_perfil.png',
          badge: 'Paso 1 de 5',
          titulo: 'Perfil y Etapa del Peque',
          descripcion: 'Selecciona al pequeño que deseas consultar para ver su plan pedagógico personalizado acorde a su edad y etapa de crecimiento.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'estRadarChart',
          selectorFallback: '.cell-radar, .radar-wrapper',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 2 de 5',
          titulo: 'Mapa de Competencias (Radar)',
          descripcion: 'Gráfica interactiva que muestra el nivel de avance en motricidad, lenguaje, razonamiento y socioemocional con sus evaluaciones.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'est-milestones-list',
          selectorFallback: '.cell-milestones, #est-milestones-list',
          avatar: 'assets/img/avatar/avatar_hero_servicio.png',
          badge: 'Paso 3 de 5',
          titulo: 'Hitos y Logros del Mes',
          descripcion: 'Conoce las habilidades y objetivos pedagógicos clave que tu pequeño estará ejercitando y conquistando durante este mes.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'actividades-lista-container',
          selectorFallback: '#actividades-lista-container, .est-daily-section',
          avatar: 'assets/img/avatar/avatar_actividad_dia.png',
          badge: 'Paso 4 de 5',
          titulo: 'Plan Diario de Actividades',
          descripcion: 'Explora las actividades lúdicas recomendadas para cada día con instrucciones y áreas de desarrollo a estimular durante la jornada.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '.cell-materials, #est-materials-list',
          avatar: 'assets/img/avatar/avatar_por_favor.png',
          badge: 'Paso 5 de 5',
          titulo: 'Materiales y Código de Colores',
          descripcion: 'Toca cualquier material para marcarlo listo. Su color indica quién lo aporta:\n• Blanco con borde rosa: Pendiente por conseguir.\n• Rosa fucsia: Listo por la Niñera.\n• Azul cian: Listo por la Familia.',
          btnTexto: 'Finalizar'
        },
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡Aprender Jugando!',
          titulo: '¡Impulsemos su potencial juntos!',
          descripcion: 'Acompaña a tus peques en cada logro y celebra sus descubrimientos y aprendizajes diarios.',
          btnTexto: '¡Comenzar ahora!'
        }
      ],

      // --- PESTAÑA ESTIMULACIÓN (NIÑERA) ---
      estimulacion_ninera: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Guía NeuroNanny',
          titulo: 'Plan Pedagógico y Estimulación',
          descripcion: 'Herramienta profesional para planear, implementar y dar seguimiento a las actividades de estimulación temprana de los pequeños a tu cargo.',
          btnTexto: 'Iniciar recorrido'
        },
        {
          targetId: 'dropdown-peque',
          selectorFallback: '#dropdown-peque, .peque-selector-card, .est-controls-group',
          avatar: 'assets/img/avatar/avatar_nanny_perfil.png',
          badge: 'Paso 1 de 5',
          titulo: 'Selección del Peque',
          descripcion: 'Elige al pequeño que estás atendiendo para cargar de inmediato su perfil evolutivo, edad exacta y programa pedagógico personalizado.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'estRadarChart',
          selectorFallback: '.cell-radar, .radar-wrapper',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 2 de 5',
          titulo: 'Mapa de Competencias (Radar)',
          descripcion: 'Visualiza el progreso psicomotor en motricidad gruesa, fina, lenguaje, cognición y socioemocional para enfocar tus dinámicas diarias.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'est-milestones-list',
          selectorFallback: '.cell-milestones, #est-milestones-list',
          avatar: 'assets/img/avatar/avatar_hero_servicio.png',
          badge: 'Paso 3 de 5',
          titulo: 'Hitos del Mes a Trabajar',
          descripcion: 'Revisa los hitos de desarrollo clave que debes ejercitar y observar en el pequeño durante las actividades del mes.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'actividades-lista-container',
          selectorFallback: '#actividades-lista-container, .est-daily-section',
          avatar: 'assets/img/avatar/avatar_actividad_dia.png',
          badge: 'Paso 4 de 5',
          titulo: 'Dinámicas y Actividades del Día',
          descripcion: 'Sigue las instrucciones lúdicas paso a paso con los objetivos específicos y tiempos recomendados para aplicar en la sesión.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '.cell-materials, #est-materials-list',
          avatar: 'assets/img/avatar/avatar_por_favor.png',
          badge: 'Paso 5 de 5',
          titulo: 'Materiales y Código de Colores',
          descripcion: 'Verifica los materiales necesarios para las dinámicas. Su color define responsabilidades:\n• Blanco con borde rosa: Pendiente.\n• Rosa fucsia: Material que preparas y llevas tú como Niñera.\n• Azul cian: Material que proporciona la Familia en su hogar.',
          btnTexto: 'Finalizar'
        },
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡Estimulación Lista!',
          titulo: '¡Acompaña su desarrollo!',
          descripcion: 'Aplica cada dinámica con paciencia, alegría y dedicación para potenciar el talento de cada pequeño.',
          btnTexto: '¡Entendido y lista!'
        }
      ],

      // --- PESTAÑA COMUNIDAD (CLIENTE) ---
      comunidad: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Comunidad',
          titulo: 'Comunidad Nannys y Peques',
          descripcion: 'Tu centro de aprendizaje, beneficios exclusivos y recursos formativos para toda la familia y nuestro equipo de cuidado.',
          btnTexto: 'Empezar recorrido'
        },
        {
          targetId: null,
          selectorFallback: '.cd-quick-row',
          avatar: 'assets/img/avatar/avatar_hero_servicio.png',
          badge: 'Paso 1 de 4',
          titulo: 'Accesos Directos',
          descripcion: 'Navega rápidamente a las secciones principales: Capacitaciones del mes, Convenios comerciales con especialistas y Biblioteca de artículos.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'cd-sec-capacitaciones',
          selectorFallback: '#cd-sec-capacitaciones, #cd-capacitaciones-container',
          avatar: 'assets/img/avatar/avatar_actividad_dia.png',
          badge: 'Paso 2 de 4',
          titulo: 'Capacitaciones del Mes',
          descripcion: 'Encuentra talleres virtuales y presenciales sobre crianza positiva, primeros auxilios, sueño y desarrollo infantil.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '.cd-convenios-card',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 3 de 4',
          titulo: 'Convenios y Descuentos',
          descripcion: 'Accede a tarifas preferenciales y descuentos exclusivos con pediatras, especialistas médicos, centros recreativos y tiendas aliadas.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'cd-sec-articulos',
          selectorFallback: '#cd-sec-articulos, .cd-articles-section',
          avatar: 'assets/img/avatar/avatar_bitacora_reporte.png',
          badge: 'Paso 4 de 4',
          titulo: 'Artículos y Buscador',
          descripcion: 'Utiliza el buscador en tiempo real para encontrar lecturas sobre sueño infantil, rutinas, lenguaje y pautas de crianza.',
          btnTexto: 'Finalizar'
        },
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡En Comunidad!',
          titulo: '¡Aprovecha todos los beneficios!',
          descripcion: 'Estamos aquí para brindarte conocimiento y beneficios en cada etapa del crecimiento de tu familia.',
          btnTexto: '¡Entendido!'
        }
      ],

      // --- PESTAÑA COMUNIDAD (NIÑERA) ---
      comunidad_ninera: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Comunidad Staff',
          titulo: 'Comunidad y Beneficios Nanny',
          descripcion: 'Tu centro de formación profesional continua, convenios con descuentos exclusivos para ti y biblioteca de artículos de cuidado infantil.',
          btnTexto: 'Iniciar recorrido'
        },
        {
          targetId: null,
          selectorFallback: '.cd-quick-row',
          avatar: 'assets/img/avatar/avatar_hero_servicio.png',
          badge: 'Paso 1 de 4',
          titulo: 'Accesos Directos',
          descripcion: 'Navega de forma ágil entre Capacitaciones del mes, Convenios comerciales y la Biblioteca de artículos.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'cd-sec-capacitaciones',
          selectorFallback: '#cd-sec-capacitaciones, #cd-capacitaciones-container',
          avatar: 'assets/img/avatar/avatar_actividad_dia.png',
          badge: 'Paso 2 de 4',
          titulo: 'Capacitaciones y Certificaciones',
          descripcion: 'Participa en talleres sobre primeros auxilios, estimulación sensorial, manejo de emociones y certificación continua para enriquecer tu currículum.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '.cd-convenios-card',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 3 de 4',
          titulo: 'Convenios y Beneficios Exclusivos',
          descripcion: 'Disfruta de tarifas preferenciales y descuentos en consultas médicas, salud visual, dental y comercios afiliados para el equipo Nannys y Peques.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'cd-sec-articulos',
          selectorFallback: '#cd-sec-articulos, .cd-articles-section',
          avatar: 'assets/img/avatar/avatar_bitacora_reporte.png',
          badge: 'Paso 4 de 4',
          titulo: 'Artículos y Guías Prácticas',
          descripcion: 'Consulta artículos formativos con tips pedagógicos, técnicas de sueño infantil, resolución de rabietas y actividades sensoriales.',
          btnTexto: 'Finalizar'
        },
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡En Equipo!',
          titulo: '¡Aprovecha todas las ventajas!',
          descripcion: 'Nos apasiona impulsarte en tu crecimiento profesional. ¡Disfruta de todos tus beneficios!',
          btnTexto: '¡Entendido y lista!'
        }
      ],

      // --- PESTAÑA PERFIL (CLIENTE) ---
      perfil_cliente: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Perfil Familia',
          titulo: 'Tu Perfil Familiar',
          descripcion: 'Aquí gestionas la información familiar, contactos de emergencia, credencial digital y datos de salud de tus peques.',
          btnTexto: 'Empezar recorrido'
        },
        {
          targetId: null,
          selectorFallback: '.cp-hero-card',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 1 de 4',
          titulo: 'Datos del Perfil y Estatus',
          descripcion: 'Visualiza el nombre de tu familia, cantidad de pequeños registrados y el estatus activo en la comunidad.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '.cp-card',
          avatar: 'assets/img/avatar/avatar_en_camino.png',
          badge: 'Paso 2 de 4',
          titulo: 'Contacto, Ubicación y Emergencias',
          descripcion: 'Mantén actualizados tus teléfonos, dirección con enlace al mapa, contacto de emergencia y datos de mascotas en casa.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '.cp-contact-col:last-child, .cp-card',
          avatar: 'assets/img/avatar/avatar_nanny_perfil.png',
          badge: 'Paso 3 de 4',
          titulo: 'Credencial Digital y Políticas',
          descripcion: 'Accede a tu credencial digital de identificación oficial y descarga en PDF las políticas y convenios de contratación.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: 'cp-peques-grid',
          selectorFallback: '#cp-peques-grid, .cp-peques-grid, .cp-card:last-of-type',
          avatar: 'assets/img/avatar/avatar_actividad_dia.png',
          badge: 'Paso 4 de 4',
          titulo: 'Ficha de Salud y Peques',
          descripcion: 'Detalla alergias, condiciones médicas, estado de salud actual y preferencias lúdicas para que la niñera esté 100% informada.',
          btnTexto: 'Finalizar'
        },
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡Perfil Seguro!',
          titulo: '¡Toda tu información al día!',
          descripcion: 'Tus datos están protegidos y listos para coordinar servicios seguros y de alta calidad.',
          btnTexto: '¡Comenzar ahora!'
        }
      ],

      // --- PESTAÑA PERFIL (NIÑERA) ---
      perfil_ninera: [
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_bienvenida.png',
          badge: 'Perfil Nanny',
          titulo: 'Tu Perfil Profesional',
          descripcion: 'Aquí consultas tus datos personales, verificación de perfil, credencial institucional y estado de disponibilidad.',
          btnTexto: 'Iniciar recorrido'
        },
        {
          targetId: null,
          selectorFallback: '.np-hero-card',
          avatar: 'assets/img/avatar/avatar_nanny_perfil.png',
          badge: 'Paso 1 de 3',
          titulo: 'Tu Perfil y Verificación Oficial',
          descripcion: 'Muestra tu nombre profesional, insignia de perfil verificado y el indicador de disponibilidad activa en el equipo.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '.np-card',
          avatar: 'assets/img/avatar/avatar_perfil_oficial.png',
          badge: 'Paso 2 de 3',
          titulo: 'Información de Contacto',
          descripcion: 'Tus números telefónicos, correo institucional y datos actualizados para la asignación de tus turnos.',
          btnTexto: 'Siguiente'
        },
        {
          targetId: null,
          selectorFallback: '.np-contact-col, .np-card',
          avatar: 'assets/img/avatar/avatar_hero_servicio.png',
          badge: 'Paso 3 de 3',
          titulo: 'Credencial Digital y Gafete',
          descripcion: 'Porta tu credencial digital con fotografía oficial para identificarte con total seguridad ante las familias.',
          btnTexto: 'Finalizar'
        },
        {
          targetId: null, // Modal centrado
          avatar: 'assets/img/avatar/avatar_saltando.png',
          badge: '¡Perfil Listo!',
          titulo: '¡Lista para coordinar servicios!',
          descripcion: 'Mantén tu información al día y brinda siempre un servicio profesional y lleno de vocación.',
          btnTexto: '¡Entendido y lista!'
        }
      ]
    },

    /**
     * Inicializa los elementos DOM del onboarding
     */
    crearDOM: function () {
      if (document.getElementById('nyp-onboarding-overlay')) {
        this.overlayEl = document.getElementById('nyp-onboarding-overlay');
        this.spotlightEl = document.getElementById('nyp-onboarding-spotlight');
        this.cardEl = document.getElementById('nyp-onboarding-card');
        return;
      }

      // 1. Overlay principal
      const overlay = document.createElement('div');
      overlay.id = 'nyp-onboarding-overlay';
      overlay.className = 'nyp-onboarding-overlay';

      // 2. Backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'nyp-onboarding-backdrop';
      backdrop.onclick = () => this.saltar();
      overlay.appendChild(backdrop);

      // 3. Spotlight
      const spotlight = document.createElement('div');
      spotlight.id = 'nyp-onboarding-spotlight';
      spotlight.className = 'nyp-onboarding-spotlight';
      spotlight.style.display = 'none';
      overlay.appendChild(spotlight);

      // 4. Card interactiva
      const card = document.createElement('div');
      card.id = 'nyp-onboarding-card';
      card.className = 'nyp-onboarding-card';
      card.innerHTML = `
        <div class="nyp-onboarding-arrow"></div>
        <button class="nyp-onboarding-close-btn" type="button" aria-label="Cerrar" id="onbBtnClose">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="nyp-onboarding-body">
          <div class="nyp-onboarding-avatar-wrap">
            <img id="onbAvatarImg" src="assets/img/avatar/avatar_bienvenida.png" alt="Avatar Corporativo Oficial" class="nyp-onboarding-avatar-img">
          </div>
          <div class="nyp-onboarding-text-wrap">
            <span class="nyp-onboarding-step-badge" id="onbBadge">Bienvenida</span>
            <h3 class="nyp-onboarding-title" id="onbTitle">Título</h3>
            <p class="nyp-onboarding-desc" id="onbDesc">Descripción</p>
          </div>
        </div>
        <div class="nyp-onboarding-footer">
          <div class="nyp-onboarding-dots" id="onbDots"></div>
          <div class="nyp-onboarding-actions">
            <button type="button" class="nyp-btn-onb nyp-btn-onb-ghost" id="onbBtnSkip">Saltar</button>
            <button type="button" class="nyp-btn-onb nyp-btn-onb-secondary" id="onbBtnPrev" style="display:none;">Atrás</button>
            <button type="button" class="nyp-btn-onb nyp-btn-onb-primary" id="onbBtnNext">Siguiente</button>
          </div>
        </div>
      `;
      overlay.appendChild(card);
      document.body.appendChild(overlay);

      this.overlayEl = overlay;
      this.spotlightEl = spotlight;
      this.cardEl = card;

      // Eventos
      document.getElementById('onbBtnClose').onclick = () => this.cerrar();
      document.getElementById('onbBtnSkip').onclick = () => this.saltar();
      document.getElementById('onbBtnPrev').onclick = () => this.anterior();
      document.getElementById('onbBtnNext').onclick = () => this.siguiente();

      // Teclado Escape
      window.addEventListener('keydown', (e) => {
        if (this.activo && e.key === 'Escape') {
          this.cerrar();
        }
      });

      // Reposicionar al cambiar tamaño de pantalla o scroll
      window.addEventListener('resize', () => {
        if (this.activo) this.renderizarPaso(false);
      });
      window.addEventListener('scroll', () => {
        if (this.activo) {
          const paso = this.obtenerFlujoActivo()[this.pasoActual];
          if (paso) {
            const target = this.obtenerElementoObjetivo(paso);
            if (target) this.posicionarSpotlightYCard(target);
          }
        }
      }, { passive: true, capture: true });
    },

    /**
     * Devuelve la lista de pasos para la sección y rol actual
     */
    obtenerFlujoActivo: function () {
      const isNinera = this.rolActual === 'ninera';

      if (this.seccionActual === 'servicios') {
        return isNinera ? (this.flujos.servicios_ninera || this.flujos.servicios) : this.flujos.servicios;
      }
      if (this.seccionActual === 'estimulacion') {
        return isNinera ? (this.flujos.estimulacion_ninera || this.flujos.estimulacion) : this.flujos.estimulacion;
      }
      if (this.seccionActual === 'comunidad') {
        return isNinera ? (this.flujos.comunidad_ninera || this.flujos.comunidad) : this.flujos.comunidad;
      }
      if (this.seccionActual === 'perfil') {
        return isNinera ? this.flujos.perfil_ninera : this.flujos.perfil_cliente;
      }

      if (!isNinera && this.seccionActual === 'inicio') {
        const tieneNeuronanny = window._clienteTieneNeuronannyValido !== false;
        let pasos = this.flujos.cliente.filter(p => {
          if (p.targetId === 'ciActivityCarouselContainer' && !tieneNeuronanny) return false;
          return true;
        });
        let pasoIdx = 1;
        const totalConTarget = pasos.filter(p => p.targetId !== null).length;
        return pasos.map(p => {
          if (p.targetId !== null) {
            return { ...p, badge: `Paso ${pasoIdx++} de ${totalConTarget}` };
          }
          return p;
        });
      }

      return isNinera ? this.flujos.ninera : this.flujos.cliente;
    },

    /**
     * Comprueba si un elemento está presente y visible en el DOM (compatible con position: fixed)
     */
    isElementoVisible: function (el) {
      if (!el || !(el instanceof Element)) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    },

    /**
     * Obtiene el elemento objetivo en el DOM
     */
    obtenerElementoObjetivo: function (paso) {
      if (!paso.targetId && !paso.selectorFallback) return null;
      let el = paso.targetId ? document.getElementById(paso.targetId) : null;
      if (!this.isElementoVisible(el)) {
        if (paso.selectorFallback) {
          const fallbacks = document.querySelectorAll(paso.selectorFallback);
          for (let f of fallbacks) {
            if (this.isElementoVisible(f)) {
              el = f;
              break;
            }
          }
        }
      }
      return this.isElementoVisible(el) ? el : null;
    },

    /**
     * Inicia el onboarding para la sección o rol
     */
    iniciar: function (tipoOSeccion) {
      this.crearDOM();

      const isCliente = !!(window.SESION && window.SESION.cliente);
      this.rolActual = isCliente ? 'cliente' : 'ninera';

      if (tipoOSeccion === 'ninera') {
        this.rolActual = 'ninera';
        this.seccionActual = 'inicio';
      } else if (tipoOSeccion === 'cliente') {
        this.rolActual = 'cliente';
        this.seccionActual = 'inicio';
      } else if (tipoOSeccion === 'servicios' || tipoOSeccion === 'servicios_ninera') {
        if (tipoOSeccion === 'servicios_ninera') this.rolActual = 'ninera';
        this.seccionActual = 'servicios';
      } else if (tipoOSeccion === 'estimulacion' || tipoOSeccion === 'estimulacion_ninera') {
        if (tipoOSeccion === 'estimulacion_ninera') this.rolActual = 'ninera';
        this.seccionActual = 'estimulacion';
      } else if (tipoOSeccion === 'comunidad' || tipoOSeccion === 'comunidad_ninera') {
        if (tipoOSeccion === 'comunidad_ninera') this.rolActual = 'ninera';
        this.seccionActual = 'comunidad';
      } else if (tipoOSeccion === 'perfil' || tipoOSeccion === 'perfil_ninera' || tipoOSeccion === 'perfil_cliente') {
        if (tipoOSeccion === 'perfil_ninera') this.rolActual = 'ninera';
        if (tipoOSeccion === 'perfil_cliente') this.rolActual = 'cliente';
        this.seccionActual = 'perfil';
      } else if (tipoOSeccion) {
        this.seccionActual = tipoOSeccion;
      } else {
        this.seccionActual = 'inicio';
      }

      this.pasoActual = 0;
      this.pasoPrevioIndex = null;
      this.activo = true;

      this.overlayEl.classList.add('active');
      this.renderizarPaso(true);
    },

    /**
     * Renderiza el paso actual
     */
    renderizarPaso: function (smoothScroll) {
      const pasos = this.obtenerFlujoActivo();
      if (this.pasoActual < 0) this.pasoActual = 0;
      if (this.pasoActual >= pasos.length) {
        this.cerrar();
        return;
      }

      // Ejecutar onLeave del paso anterior si existía
      if (this.pasoPrevioIndex !== null && this.pasoPrevioIndex !== this.pasoActual && pasos[this.pasoPrevioIndex]) {
        const pasoAnterior = pasos[this.pasoPrevioIndex];
        if (typeof pasoAnterior.onLeave === 'function') {
          pasoAnterior.onLeave();
        }
      }

      const paso = pasos[this.pasoActual];
      const totalPasos = pasos.length;

      // Ejecutar onEnter del paso actual si existe
      if (typeof paso.onEnter === 'function') {
        paso.onEnter();
      }
      this.pasoPrevioIndex = this.pasoActual;

      // 1. Textos e imágenes
      const imgEl = document.getElementById('onbAvatarImg');
      if (imgEl) imgEl.src = paso.avatar;

      const badgeEl = document.getElementById('onbBadge');
      if (badgeEl) badgeEl.textContent = paso.badge;

      const titleEl = document.getElementById('onbTitle');
      if (titleEl) titleEl.textContent = paso.titulo;

      const descEl = document.getElementById('onbDesc');
      if (descEl) descEl.textContent = paso.descripcion;

      const btnNext = document.getElementById('onbBtnNext');
      if (btnNext) btnNext.textContent = paso.btnTexto || (this.pasoActual === totalPasos - 1 ? '¡Listo!' : 'Siguiente');

      const btnPrev = document.getElementById('onbBtnPrev');
      if (btnPrev) {
        btnPrev.style.display = (this.pasoActual > 0 && this.pasoActual < totalPasos - 1) ? 'inline-flex' : 'none';
      }

      const btnSkip = document.getElementById('onbBtnSkip');
      if (btnSkip) {
        btnSkip.style.display = (this.pasoActual < totalPasos - 1) ? 'inline-flex' : 'none';
      }

      // 2. Indicadores de bolitas
      const dotsContainer = document.getElementById('onbDots');
      if (dotsContainer) {
        let dotsHtml = '';
        for (let i = 0; i < totalPasos; i++) {
          dotsHtml += `<div class="nyp-onboarding-dot ${i === this.pasoActual ? 'active' : ''}"></div>`;
        }
        dotsContainer.innerHTML = dotsHtml;
      }

      // 3. Posicionamiento: Con Target (Spotlight) vs Modal Centrado
      const target = this.obtenerElementoObjetivo(paso);

      if (!target) {
        // Modal Centrado (Bienvenida / Despedida)
        this.overlayEl.classList.remove('has-spotlight');
        this.overlayEl.classList.add('has-centered-modal');
        this.spotlightEl.style.display = 'none';
        this.cardEl.className = 'nyp-onboarding-card centered visible';
      } else {
        // Spotlight activo sobre el elemento (100% nítido, sin desenfoque)
        this.overlayEl.classList.remove('has-centered-modal');
        this.overlayEl.classList.add('has-spotlight');
        this.spotlightEl.style.display = 'block';

        // Scroll inteligente si el elemento no es la barra fija inferior
        const isBottomNav = target.id === 'nav-cliente' || target.id === 'nav-ninera' || target.classList.contains('bottom-nav') || target.tagName === 'NAV';

        if (!isBottomNav && smoothScroll !== false) {
          const rect = target.getBoundingClientRect();
          const targetTop = rect.top + window.scrollY;
          // Dejar 55px de margen superior para ver el encabezado y dar espacio abajo a la tarjeta
          window.scrollTo({
            top: Math.max(0, targetTop - 55),
            behavior: 'smooth'
          });
        }

        setTimeout(() => {
          this.posicionarSpotlightYCard(target);
        }, smoothScroll !== false ? 180 : 0);
      }
    },

    /**
     * Calcula y posiciona la tarjeta y el spotlight relativo al elemento target
     */
    posicionarSpotlightYCard: function (target) {
      if (!target || !this.activo) return;

      const rect = target.getBoundingClientRect();
      const isBottomNav = target.id === 'nav-cliente' || target.id === 'nav-ninera' || target.classList.contains('bottom-nav') || target.tagName === 'NAV';
      const padding = isBottomNav ? 3 : 6;
      const borderRadius = isBottomNav ? '36px' : (rect.height > 200 ? '22px' : '18px');

      // Spotlight sobre el elemento
      this.spotlightEl.style.borderRadius = borderRadius;
      this.spotlightEl.style.top = `${Math.max(0, rect.top - padding)}px`;
      this.spotlightEl.style.left = `${Math.max(0, rect.left - padding)}px`;
      this.spotlightEl.style.width = `${rect.width + padding * 2}px`;
      this.spotlightEl.style.height = `${rect.height + padding * 2}px`;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const cardHeight = this.cardEl.offsetHeight || 170;
      const cardWidth = Math.min(viewportWidth - 28, 440);

      let cardTop = 0;
      let arrowClass = 'arrow-up';

      if (isBottomNav) {
        // Para la barra de navegación inferior, la tarjeta SIEMPRE va arriba
        cardTop = Math.max(16, rect.top - cardHeight - 14);
        arrowClass = 'arrow-down';
      } else {
        const espAbajo = viewportHeight - (rect.bottom + padding);
        const espArriba = rect.top - padding;

        if (espAbajo >= cardHeight + 12) {
          // Espacio suficiente abajo -> Colocar debajo del elemento
          cardTop = rect.bottom + padding + 12;
          arrowClass = 'arrow-up';
        } else if (espArriba >= cardHeight + 12) {
          // Espacio suficiente arriba -> Colocar arriba del elemento
          cardTop = rect.top - padding - cardHeight - 12;
          arrowClass = 'arrow-down';
        } else {
          // Si el elemento ocupa casi toda la pantalla, posicionar donde haya más espacio pero sin tapar el centro
          if (espAbajo >= espArriba) {
            cardTop = Math.min(viewportHeight - cardHeight - 16, rect.bottom + 8);
            arrowClass = 'arrow-up';
          } else {
            cardTop = Math.max(12, rect.top - cardHeight - 8);
            arrowClass = 'arrow-down';
          }
        }
      }

      // Centrado horizontal
      const cardLeft = Math.max(14, (viewportWidth - cardWidth) / 2);

      this.cardEl.className = `nyp-onboarding-card visible ${arrowClass}`;
      this.cardEl.style.top = `${cardTop}px`;
      this.cardEl.style.left = `${cardLeft}px`;
      this.cardEl.style.width = `${cardWidth}px`;
    },

    /**
     * Avanza al siguiente paso
     */
    siguiente: function () {
      const pasos = this.obtenerFlujoActivo();
      if (this.pasoActual >= pasos.length - 1) {
        this.cerrar();
      } else {
        this.pasoActual++;
        this.renderizarPaso(true);
      }
    },

    /**
     * Retrocede al paso anterior
     */
    anterior: function () {
      if (this.pasoActual > 0) {
        this.pasoActual--;
        this.renderizarPaso(true);
      }
    },

    /**
     * Salta el tutorial
     */
    saltar: function () {
      this.cerrar();
    },

    /**
     * Cierra el tutorial y limpia estados
     */
    cerrar: function () {
      this.activo = false;

      // Ejecutar onLeave del paso actual si existía
      const pasos = this.obtenerFlujoActivo();
      if (this.pasoActual !== null && pasos[this.pasoActual] && typeof pasos[this.pasoActual].onLeave === 'function') {
        pasos[this.pasoActual].onLeave();
      }

      if (this.overlayEl) {
        this.overlayEl.classList.remove('active');
        if (this.cardEl) this.cardEl.classList.remove('visible');
      }
    }
  };

  window.OnboardingGuiado = OnboardingGuiado;
})();
