/**
 * js/supervision_plantilla.js
 * Lógica para la sección de Plantilla de Actividades en Supervisión.
 */

const PLANTILLA_DATA = {
  "0 a 3 meses": {
    "Motricidad": {
      "Motricidad fina": [
        {
          titulo: "Hace succión de objetos",
          objetivo: "Estimular el desarrollo del reflejo de succión en peques de 0 a 3 meses mediante la implementación de actividades de succión nutritiva y no nutritiva, con el fin de favorecer la coordinación succión–deglución–respiración, el fortalecimiento de la musculatura orofacial y la autorregulación conductual.",
          actividades: []
        },
        {
          titulo: "Tiene el reflejo de presión palmar, es decir, reacciona cuando se le toca las palmas de las manos o pies",
          objetivo: "Estimular e integrar el reflejo de prensión palmar y plantar en el peque mediante la aplicación de estímulos táctiles en palmas de las manos y plantas de los pies, con el fin de favorecer la respuesta motora refleja, la activación neuromuscular y el desarrollo sensoriomotor temprano.",
          actividades: []
        }
      ],
      "Motricidad gruesa": [
        { titulo: "Sostiene 3 segundos la cabeza o intenta enderezarse", objetivo: "Estimular el control cefálico en peques de 0 a 3 meses mediante actividades de posicionamiento, interacción visual y fortalecimiento muscular, con el fin de favorecer el desarrollo motor temprano, la estabilidad de la cabeza y la coordinación postural.", actividades: [] },
        { titulo: "Tiene flexión de los miembros", objetivo: "Estimular la flexión de los miembros superiores e inferiores en peques de 0 a 3 meses mediante movimientos suaves y controlados, con el fin de favorecer el desarrollo motor temprano, la activación neuromuscular, la coordinación sensoriomotora y la preparación para movimientos voluntarios futuros.", actividades: [] },
        { titulo: "Puede darse la vuelta", objetivo: "Favorecer la activación de la musculatura del cuello, tronco y extremidades, con el fin de preparar al peque para los movimientos de rotación y volteo controlado, fortaleciendo la coordinación postural y la integración sensoriomotora.", actividades: [] }
      ]
    },
    "Lenguaje": {
      "Lenguaje": [
        { titulo: "Llora fuerte cuando está molesto, se tranquiliza y acurruca al cargarlo", objetivo: "Con estas actividades no se busca que el peque “deje de llorar”, sino que aprenda que puede expresar lo que siente y que hay alguien que responde, lo cual es clave para su desarrollo emocional y social. Asimismo, fortalece su apego seguro desarrollando su confianza en el entorno.", actividades: [] },
        { titulo: "Balbucea a través del llanto o como si se arrullara", objetivo: "Con estas actividades se busca favorecer que el peque utilice el balbuceo y las vocalizaciones tempranas (como sonidos suaves, arrullos o variaciones en el llanto) como primeras formas de comunicación, permitiéndole expresar necesidades, sensaciones y estados emocionales.", actividades: [] },
        { titulo: "Escucha las conversaciones atentamente", objetivo: "Se busca favorecer que el peque desarrolle la atención auditiva hacia las voces y conversaciones de su entorno, permitiéndole reconocer patrones de sonido, entonación y ritmo del lenguaje. A través de la exposición constante a interacciones verbales, se promueve el desarrollo del lenguaje temprano, la conexión socioemocional y la base para futuras habilidades comunicativas.", actividades: [] },
        { titulo: "Usa sonidos o movimientos para demostrar interés o que las cosas sucedan", objetivo: "Favorecer que el peque utilice sonidos (balbuceos, arrullos, llanto diferenciado) y movimientos corporales (brazos, piernas, gestos) como formas iniciales de comunicación intencional, permitiéndole expresar interés, necesidades o anticipación. Asimismo, a través de la respuesta de la nanny, se fortalece la comprensión de causa-efecto, el desarrollo del lenguaje temprano y el vínculo socioemocional.", actividades: [] }
      ]
    },
    "Socioemocional": {
      "Socioemocional": [
        { titulo: "Tiene dependencia hacia los padres y personas próximas", objetivo: "Favorecer el desarrollo del vínculo afectivo y el reconocimiento de sus cuidadores principales, promoviendo la seguridad emocional, la confianza y las primeras bases del apego a través de la interacción constante y significativa.", actividades: [] },
        { titulo: "Reconoce a las personas que usualmente lo cuidan", objetivo: "Con estas actividades se busca fortalecer el apego seguro, lo que le da confianza y sensación de protección. Mientras se desarrolla la memoria temprana, mejora su capacidad de atención visual y auditiva y se fomenta su interacción social.", actividades: [] }
      ]
    },
    "Cognitivo": {
      "Cognitiva": [
        { titulo: "Puede golpear algo para que continúe produciéndose una señal visual o sonido", objetivo: "Promover los movimientos intencionales para generar estímulos visuales o auditivos, así como la repeticion de estas conductas.", actividades: [] },
        { titulo: "Realiza el juego funcional (puede tirar constantemente un objeto para que produzca sonido)", objetivo: "Fomentar la participación en el juego funcional, logrando que el peque utilice un objeto de manera intencional para producir un efecto repitiendo la acción de forma constante.", actividades: [] }
      ]
    },
    "Sensorial": {
      "Visual": [
        { titulo: "Contacto visual Seguimiento visual 90°, (45°/45°)", objetivo: "Favorecer el desarrollo de la atención y enfoque visual mediante estímulos de alto contraste, promoviendo la fijación de la mirada y el seguimiento visual como base para la percepción del entorno.", actividades: [] },
        { titulo: "Reacciona mejor cuando ve los siguientes colores: negro, blanco y rojo", objetivo: "Favorecer la atención y el enfoque visual mediante estímulos de alto contraste (blanco, negro y rojo), promoviendo la fijación de la mirada y el desarrollo inicial de la percepción visual.", actividades: [] }
      ],
      "Gusto": [
        { titulo: "Se lleva las manos o un objeto a la boca para explorarlo", objetivo: "Favorecer la exploración oral, la coordinación succión–deglución–respiración y una alimentación segura, promoviendo el reconocimiento de sensaciones y el desarrollo de una relación positiva con la alimentación desde etapas tempranas.", actividades: [] },
        { titulo: "Come sin atragantarse o ponerse morado", objetivo: "Favorecer una alimentación segura mediante la adecuada coordinación de succión–deglución–respiración, promoviendo la regulación durante la toma y previniendo episodios de atragantamiento.", actividades: [] }
      ],
      "Auditiva": [
        { titulo: "Atiende a estímulos visuales y sonoros", objetivo: "Favorecer la respuesta del peque ante estímulos visuales y sonoros, promoviendo la atención y el reconocimiento sensorial.", actividades: [] },
        { titulo: "Oye el sonido de la sonaja y detiene o aumenta el movimiento de sus pies o manos", objetivo: "Incentivar la movilidad del peque por medio de estímulos auditivos, regulando el movimiento de sus extremidades (deteniéndolo o aumentándolo) según sea el caso.", actividades: [] }
      ]
    }
  },
  "3 a 6 meses": {
    "Motricidad": {
      "Motricidad fina": [
        {
          titulo: "Desarrolla el reflejo ojo-mano, es decir, puedes ofrecerle un objeto y él intentara tomarlo",
          objetivo: "Estimular la coordinación ojo-mano en peques de 3 a 6 meses a través del alcance y agarre de objetos llamativos, favoreciendo la prensión voluntaria y la exploración táctil del entorno.",
          actividades: []
        }
      ],
      "Motricidad gruesa": [
        {
          titulo: "Se recuesta al bebé boca abajo y gira la cabeza de lado",
          objetivo: "Fortalecer los músculos del cuello, espalda y hombros en peques de 3 a 6 meses en posición prono (boca abajo), promoviendo el control cefálico y la preparación para el volteo.",
          actividades: []
        },
        {
          titulo: "Rueda",
          objetivo: "Favorecer la rotación y volteo controlado desde posición supino a prono y viceversa en peques de 3 a 6 meses, promoviendo la fuerza de tronco y la conciencia corporal global.",
          actividades: []
        }
      ]
    },
    "Lenguaje": {
      "Lenguaje": [
        {
          titulo: "Reconoce frecuencias sonoras, por ejemplo una canción infantil y su lengua materna",
          objetivo: "Favorecer la discriminación auditiva y la familiaridad fonológica en peques de 3 a 6 meses mediante canciones y conversaciones, promoviendo el reconocimiento de la lengua materna.",
          actividades: []
        },
        {
          titulo: "Balbucea haciendo sonidos como “Cuu, guu o grititos”",
          objetivo: "Fomentar las vocalizaciones tempranas y el juego vocálico en peques de 3 a 6 meses, estimulando la musculatura del aparato fonador y la comunicación expresiva inicial.",
          actividades: []
        },
        {
          titulo: "Hace sonidos espontáneos cuando se le hace plática con vocales y consonantes",
          objetivo: "Promover el balbuceo social y la alternancia de turnos conversacionales en peques de 3 a 6 meses mediante pláticas responsivas cargadas de vocales y consonantes.",
          actividades: []
        },
        {
          titulo: "Hace sonidos de una sola sílaba",
          objetivo: "Estimular la producción de emisiones silábicas aisladas en peques de 3 a 6 meses, fortaleciendo la articulación y el control fonatorio voluntario.",
          actividades: []
        }
      ]
    },
    "Socioemocional": {
      "Socioemocional": [
        {
          titulo: "Experimenta las siguientes emociones: satisfacción, interés, aflicción",
          objetivo: "Apoyar la expresión emocional diferenciada y la autorregulación en peques de 3 a 6 meses mediante respuestas empáticas y atentas de la nanny ante sus estados emocionales.",
          actividades: []
        },
        {
          titulo: "Está abierto a la estimulación",
          objetivo: "Favorecer una actitud receptiva y atenta hacia los estímulos ambientales y sociales en peques de 3 a 6 meses, promoviendo la curiosidad y el procesamiento sensorial adaptativo.",
          actividades: []
        },
        {
          titulo: "Muestra interés, curiosidad y sonríe a los demás",
          objetivo: "Fomentar la interacción social y la sonrisa social responsiva en peques de 3 a 6 meses, consolidando el vínculo socioemocional y la conexión con las personas a su alrededor.",
          actividades: []
        }
      ]
    },
    "Cognitivo": {
      "Cognitiva": [
        {
          titulo: "Puede descubrir un objeto tapado",
          objetivo: "Estimular la noción de permanencia del objeto en peques de 3 a 6 meses al descubrir objetos parcialmente ocultos, fomentando la atención sostenida y la resolución de problemas sencillos.",
          actividades: []
        }
      ]
    },
    "Sensorial": {
      "Visual": [
        {
          titulo: "Puede seguir un objeto a 180°",
          objetivo: "Desarrollar el seguimiento visual horizontal completo (180 grados) de objetos en movimiento en peques de 3 a 6 meses, fortaleciendo la musculatura ocular y la atención sostenida.",
          actividades: []
        },
        {
          titulo: "Intenta tocar un objeto",
          objetivo: "Fomentar el alcance visualmente guiado hacia objetos en su campo visual en peques de 3 a 6 meses, estimulando la percepción espacial y la intención de interactuar.",
          actividades: []
        }
      ],
      "Gusto": [
        {
          titulo: "Tiene una succión enérgica ante los alimentos",
          objetivo: "Fortalecer la musculatura orofacial y la coordinación succión-deglución en peques de 3 a 6 meses, favoreciendo una alimentación eficiente y la preparación para la introducción de nuevas consistencias.",
          actividades: []
        }
      ],
      "Auditiva": [
        {
          titulo: "Al jugar platica o se ríe",
          objetivo: "Promover la respuesta vocal y risa social en peques de 3 a 6 meses durante las interacciones de juego, fortaleciendo el feedback auditivo y la base de la comunicación recíproca.",
          actividades: []
        }
      ]
    }
  },
  "6 a 9 meses": {
    "Motricidad": {
      "Motricidad fina": [
        {
          titulo: "Puede observar algo y tomarlo con mayor precisión",
          objetivo: "Favorecer la coordinación ojo-mano, la precisión en el agarre y la exploración de objetos, promoviendo el uso intencional de las manos y la relación causa–efecto.",
          actividades: []
        },
        {
          titulo: "Explora lo que hay a su alrededor buscando algo nuevo",
          objetivo: "Estimular la curiosidad y la exploración activa, fomentando que el peque busque y manipule objetos novedosos para desarrollar su motricidad fina y percepción.",
          actividades: []
        },
        {
          titulo: "Puede hacer sonar una sonaja",
          objetivo: "Desarrollar la relación causa-efecto y la motricidad fina mediante el movimiento intencional para hacer sonar objetos como una sonaja.",
          actividades: []
        }
      ],
      "Motricidad gruesa": [
        {
          titulo: "Al sostenerlo por debajo de los brazos simula caminar",
          objetivo: "Fortalecer la musculatura de las piernas y el reflejo de marcha, preparando las bases para el equilibrio y el posterior desplazamiento independiente.",
          actividades: []
        },
        {
          titulo: "Al sentarlo alinea el cuerpo, sostiene la cabeza y estira las piernas",
          objetivo: "Favorecer el control postural y el fortalecimiento del tronco, permitiendo al peque mantenerse sentado de manera más estable e independiente.",
          actividades: []
        },
        {
          titulo: "Se apoya en antebrazos y levanta la cabeza, no le molesta la posición",
          objetivo: "Fortalecer la musculatura de la espalda y el cuello, consolidando la posición de prono (boca abajo) como una postura cómoda y funcional para jugar.",
          actividades: []
        }
      ]
    },
    "Sensorial": {
      "Visual": [
        {
          titulo: "Reconoce los rostros de sus padres y familiares cercanos",
          objetivo: "Favorecer el desarrollo de la percepción visual mediante el reconocimiento de rostros, seguimiento de estímulos y atención visual, promoviendo la interacción con el entorno y el vínculo con las personas cercanas.",
          actividades: []
        }
      ],
      "Gusto": [
        {
          titulo: "Empieza la alimentación complementaria, no rechaza la papilla",
          objetivo: "Favorecer la aceptación de nuevos alimentos y el desarrollo sensorial oral, permitiendo que el bebé se familiarice con diferentes sabores, texturas y olores, promoviendo una relación positiva con la comida.",
          actividades: []
        }
      ],
      "Auditiva": [
        {
          titulo: "Encuentra un objeto escondido que tiene sonido",
          objetivo: "Favorecer el desarrollo de la percepción auditiva mediante la identificación, localización y atención a sonidos, promoviendo la discriminación auditiva y la relación sonido–objeto para estimular la exploración del entorno.",
          actividades: []
        }
      ]
    },
    "Cognitivo": {
      "Cognitiva": [
        {
          titulo: "Tiene un juguete favorito",
          objetivo: "Favorecer el desarrollo de preferencias y la memoria, permitiendo que el peque establezca un vínculo con un objeto de su agrado.",
          actividades: []
        },
        {
          titulo: "Puede identificar objetos desde varios puntos de vista",
          objetivo: "Estimular la percepción espacial y la permanencia del objeto, reconociendo cosas familiares sin importar su posición.",
          actividades: []
        },
        {
          titulo: "Mira hacia el objeto cuando se les muestra",
          objetivo: "Desarrollar la atención conjunta y el enfoque visual hacia un objeto que le es presentado por otra persona.",
          actividades: []
        }
      ]
    },
    "Lenguaje": {
      "Lenguaje": [
        {
          titulo: "Reconoce su nombre",
          objetivo: "Favorecer la identidad y la atención auditiva, promoviendo que el peque responda (girando o mirando) al escuchar su nombre.",
          actividades: []
        },
        {
          titulo: "Se comunica con gestos e imita sonidos y gestos sociales",
          objetivo: "Estimular la comunicación no verbal y la imitación, fortaleciendo la interacción social mediante gestos como sonreír o mover las manos.",
          actividades: []
        },
        {
          titulo: "Repite la misma sílaba (ba, ba, na, na)",
          objetivo: "Fomentar el balbuceo reduplicado como etapa previa a las primeras palabras, estimulando la articulación de sonidos.",
          actividades: []
        }
      ]
    },
    "Socioemocional": {
      "Socioemocional": [
        {
          titulo: "Tiene una relación más estrecha con sus cuidadores y desconfía de los desconocidos",
          objetivo: "Apoyar el desarrollo del apego seguro, validando su necesidad de cercanía con las figuras conocidas y su precaución natural ante los extraños.",
          actividades: []
        },
        {
          titulo: "Actúa con timidez en situaciones nuevas",
          objetivo: "Brindar seguridad y acompañamiento durante la exposición a entornos y personas nuevas, respetando su ritmo de adaptación.",
          actividades: []
        },
        {
          titulo: "Distingue a los extraños de los conocidos",
          objetivo: "Reforzar la discriminación social y la memoria emocional, consolidando el círculo de confianza del peque.",
          actividades: []
        }
      ]
    }
  },
  "9 a 12 meses": {
    "Motricidad": {
      "Fina": [
        {
          titulo: "Toma un objeto con la mano",
          objetivo: "Desarrollar la prensión voluntaria y la coordinación ojo-mano para manipular objetos con precisión.",
          actividades: []
        },
        {
          titulo: "Presiona objetos o juguetes con el dedo índice",
          objetivo: "Con ayuda de estas actividades el peque logrará desarrollar su motricidad fina, la coordinación ojo-mano y la comprensión de causa-efecto.",
          actividades: []
        }
      ],
      "Gruesa": [
        {
          titulo: "Levanta el tórax y se apoya en un brazo para alcanzar un objeto",
          objetivo: "Fortalecer el tono muscular del tronco y brazos, promoviendo el equilibrio y los ajustes posturales.",
          actividades: []
        },
        {
          titulo: "Se desplaza a gatas, lateral, elefante, sentado",
          objetivo: "Motivar las diversas  formas de desplazamiento para fortalecer músculos, coordinación y exploración del entorno de peque.",
          actividades: []
        },
        {
          titulo: "Puede sentarse desde cualquier posición",
          objetivo: "Incentivar  la habilidad de desarrollar diversas transiciones posturales (pasar de boca abajo, de lado o de gateo a sentado), lo cual ayudará al peque a moverse de manera natural mientras estimula su fuerza y coordinación.",
          actividades: []
        }
      ]
    },
    "Sensorial": {
      "Visual": [
        {
          titulo: "Explora con interés su casa o entorno",
          objetivo: "Estimular la curiosidad visual y la exploración activa del medio ambiente que le rodea.",
          actividades: []
        },
        {
          titulo: "Sentado agarra la pelota",
          objetivo: "Con estas actividades se busca promover la coordinación ojo-mano y equilibrio del peque.",
          actividades: []
        }
      ],
      "Gusto": [
        {
          titulo: "Come una galleta solo",
          objetivo: "Favorecer la autonomía, coordinación mano-boca y motricidad fina, siempre con alimentos seguros para su edad (fáciles de disolver o blanditos). Tip importante: siempre supervisa para evitar riesgo de atragantamiento y usa galletas especiales para bebé o alimentos que se deshagan fácilmente.",
          actividades: []
        }
      ],
      "Auditiva": [
        {
          titulo: "Hace monerías imitando con las manos, p ej.: aplaudir",
          objetivo: "Asociar estímulos auditivos con respuestas motoras e imitación social.",
          actividades: []
        },
        {
          titulo: "Ante los sonidos bruscos, podrá asustarse, reaccionar con asombro y analizar el objeto que lo ha causado",
          objetivo: "Desarrollar la percepción auditiva de alerta y la localización de la fuente sonora.",
          actividades: []
        }
      ]
    },
    "Cognitivo": {
      "Cognitiva": [
        {
          titulo: "Puede encontrar un juguete si se esconde debajo de una manta",
          objetivo: "Consolidar el concepto de permanencia del objeto, entendiendo que las cosas existen aunque no se vean.",
          actividades: []
        },
        {
          titulo: "Usa el movimiento para expresar lo que quiere",
          objetivo: "Relacionar acciones corporales con la consecución de un objetivo, fortaleciendo el pensamiento causal.",
          actividades: []
        }
      ]
    },
    "Lenguaje": {
      "Lenguaje": [
        {
          titulo: "En ocasiones realiza algunas acciones que se le piden",
          objetivo: "Favorecer la comprensión del lenguaje verbal sencillo e instrucciones de un solo paso.",
          actividades: []
        },
        {
          titulo: "Hace contacto físico cuando quiere algo",
          objetivo: "Promover el uso del lenguaje no verbal como medio de comunicación intencionada.",
          actividades: []
        }
      ]
    },
    "Socioemocional": {
      "Socioemocional": [
        {
          titulo: "Muestra más interés por los grupos",
          objetivo: "Fomentar la socialización y el interés por interactuar con diferentes personas y niños.",
          actividades: []
        },
        {
          titulo: "Muestra gusto o disgusto por algún familiar",
          objetivo: "Desarrollar la expresión de preferencias afectivas y la discriminación de figuras de apego.",
          actividades: []
        },
        {
          titulo: "Inicia un juego social simple (p ej. Se tapa la cara y dice bu)",
          objetivo: "Estimular la reciprocidad social y el disfrute compartido a través de juegos interactivos básicos.",
          actividades: []
        }
      ]
    }
  },
  "12 a 18 meses": {
    "Motricidad": {
      "Fina": [
        {
          titulo: "Alinea y apila un objeto sobre otro",
          objetivo: "Favorecer la coordinación ojo-mano, la motricidad fina y la organización espacial mediante actividades de alineación y apilamiento de objetos, promoviendo la exploración, la resolución de problemas y el juego autónomo.",
          actividades: []
        }
      ],
      "Gruesa": [
        {
          titulo: "Gatea",
          objetivo: "Estimular el control postural, el equilibrio y la coordinación de los músculos grandes, para así identificar si el peque gatea, se pone de pie solo, se para agarrándose de objetos, camina con apoyo o sostenido de una mano, puede acuclillarse y volver a pararse sin ayuda, así como sentarse en una silla pequeña. ",
          actividades: []
        },
        {
          titulo: "Se pone de pie solo",
          objetivo: "Desarrollar el control postural, el equilibrio y la fuerza de piernas para la bipedestación independiente.",
          actividades: []
        },
        {
          titulo: "Se para agarrándose de objetos",
          objetivo: "Favorecer el desarrollo de la motricidad gruesa mediante actividades que estimulen al peque a incorporarse y mantenerse de pie apoyándose en muebles u objetos seguros, fortaleciendo la fuerza muscular, el equilibrio, la coordinación y la estabilidad postural necesarias para avanzar hacia la marcha independiente.",
          actividades: []
        },
        {
          titulo: "Camina con apoyo o sostenido de una mano",
          objetivo: "Favorecer el desarrollo de la motricidad gruesa mediante actividades que estimulen al peque a caminar con apoyo o sostenido de una mano, fortaleciendo el equilibrio, la coordinación, la fuerza muscular de piernas y tronco, la estabilidad postural y la confianza para desplazarse de manera cada vez más independiente.",
          actividades: []
        },
        {
          titulo: "Puede acuclillarse y volver a pararse sin ayuda",
          objetivo: "Favorecer el desarrollo de la motricidad gruesa mediante actividades que estimulen al peque a acuclillarse y volver a ponerse de pie sin ayuda, fortaleciendo la fuerza muscular de piernas y tronco, el equilibrio, la coordinación motora, la estabilidad postural y la autonomía durante el desplazamiento y la exploración del entorno.",
          actividades: []
        },
        {
          titulo: "Se sienta en una silla pequeña",
          objetivo: "Favorecer el desarrollo de la motricidad gruesa y la autonomía mediante actividades que estimulen al peque a sentarse de manera independiente en una silla pequeña, fortaleciendo el equilibrio, la coordinación motora, el control postural, la orientación espacial y la participación en actividades cotidianas.",
          actividades: []
        }
      ]
    },
    "Sensorial": {
      "Visual": [
        {
          titulo: "De pie tira la pelota con una o dos manos",
          objetivo: " Favorecer el desarrollo de la motricidad gruesa mediante actividades que estimulen al peque a lanzar una pelota mientras permanece de pie utilizando una o ambas manos, fortaleciendo la coordinación ojo-mano, el equilibrio, la fuerza de brazos y hombros, la planificación motora y la confianza en sus movimientos durante el juego en niños.",
          actividades: []
        },
        {
          titulo: "Empieza a imitar y ejecutar gestos",
          objetivo: "Favorecer el desarrollo de la comunicación, la interacción social y la coordinación motora mediante actividades que estimulen al peque a observar, imitar y ejecutar gestos de manera intencional, fortaleciendo la atención conjunta, la comprensión del lenguaje, la expresión de necesidades y emociones, y las habilidades de aprendizaje por imitación.",
          actividades: []
        }
      ],
      "Gusto": [
        {
          titulo: "Bebe de una taza",
          objetivo: "Favorecer el desarrollo de la motricidad fina, la coordinación ojo-mano y la autonomía mediante actividades que estimulen al peque a beber de una taza de manera independiente, fortaleciendo el agarre, el control de movimientos, la coordinación bilateral y las habilidades necesarias para las actividades de la vida diaria.",
          actividades: []
        },
        {
          titulo: "Come solo con la cuchara aunque lo derrame",
          objetivo: "Favorecer el desarrollo de la motricidad fina, la coordinación ojo-mano y la autonomía durante la alimentación mediante actividades que estimulen al peque a utilizar la cuchara de manera independiente, fortaleciendo el control de movimientos, la precisión al llevar alimentos a la boca, la confianza en sus capacidades y la adquisición de hábitos de autocuidado.",
          actividades: []
        }
      ],
      "Auditiva": [
        {
          titulo: "Reconoce dos objetos o personas en una fotografía",
          objetivo: "Favorecer la atención audiovisual y la asociación entre palabras e imágenes mediante actividades de reconocimiento de objetos o personas en fotografías, estimulando la comprensión del lenguaje y la identificación de sonidos, nombres y voces familiares.",
          actividades: []
        },
        {
          titulo: "Puede buscar la fuente del sonido en cualquier dirección y con más facilidad",
          objetivo: "Consolidar la orientación auditiva en 360°, favoreciendo la localización espacial de estímulos sonoros.",
          actividades: []
        },
        {
          titulo: "Puede animarse a imitar los sonidos y a querer crearlos él solo",
          objetivo: "Estimular la producción vocal espontánea y la imitación sonora como precursor del lenguaje expresivo.",
          actividades: []
        }
      ]
    },
    "Cognitivo": {
      "Cognitiva": [
        {
          titulo: "Muestra más interés por los libros y juguetes",
          objetivo: "Favorecer el desarrollo de la atención, exploración, curiosidad e interés del niño mediante actividades lúdicas y sensoriales que estimulan la manipulación y descubrimiento del entorno.",
          actividades: []
        },
        {
          titulo: "Se mantiene acostado escuchando un cuento por tiempos breves",
          objetivo: "Favorecer el desarrollo de la atención, la comprensión del lenguaje, la escucha activa y el gusto por la lectura mediante actividades que permitan al peque mantenerse acostado y escuchar cuentos durante periodos breves, fortaleciendo su capacidad de concentración, imaginación, memoria auditiva y vínculo afectivo con el adulto.",
          actividades: []
        },
        {
          titulo: "Puede identificar 6 o más partes de su cuerpo",
          objetivo: "Favorecer el desarrollo del esquema corporal, el lenguaje y la conciencia de sí mismo mediante actividades que permitan al peque identificar y señalar al menos seis partes de su cuerpo, fortaleciendo la comprensión verbal, la atención, la coordinación motora y el reconocimiento de su propia imagen corporal.",
          actividades: []
        },
        {
          titulo: "Realiza órdenes sencillas con gestos de 'ven', 'dame', 'no hagas eso'",
          objetivo: "Favorecer el desarrollo del lenguaje receptivo y la comprensión de instrucciones mediante actividades que permitan al peque reconocer y responder a órdenes sencillas acompañadas de gestos, como “ven”, “dame” y “no hagas eso”, fortaleciendo la atención, la comunicación, la interacción social y la capacidad de seguir indicaciones.",
          actividades: []
        }
      ]
    },
    "Lenguaje": {
      "Lenguaje": [
        {
          titulo: "Señala una o más partes del cuerpo",
          objetivo: "Favorecer el desarrollo del lenguaje, el esquema corporal y la conciencia de sí mismo mediante actividades que permitan al peque reconocer y señalar una o más partes de su cuerpo cuando se le nombran, fortaleciendo la comprensión verbal, la atención, la memoria y la coordinación motora.",
          actividades: []
        },
        {
          titulo: "Sigue instrucciones simples (de un paso)",
          objetivo: "Favorecer el desarrollo del lenguaje receptivo, la atención y la comprensión verbal mediante actividades que permitan al peque seguir instrucciones simples de un paso, fortaleciendo la capacidad de escuchar, procesar información, responder adecuadamente a indicaciones cotidianas y participar de manera más autónoma en su entorno.",
          actividades: []
        },
        {
          titulo: "Responde cuando otra persona le habla",
          objetivo: "Favorecer el desarrollo del lenguaje receptivo y expresivo mediante actividades de interacción verbal que estimulen la atención, comprensión y respuesta del bebé cuando otras personas le hablan, promoviendo la comunicación, la imitación y la interacción social.",
          actividades: []
        },
        {
          titulo: "Localiza objetos o personas que están cerca",
          objetivo: "Favorecer el desarrollo del lenguaje, la atención y la percepción visual mediante actividades que permitan al peque localizar e identificar objetos o personas que se encuentran cerca de él, fortaleciendo la comprensión verbal, la orientación espacial, la memoria visual, la observación y la interacción con su entorno.",
          actividades: []
        }
      ]
    },
    "Socioemocional": {
      "Socioemocional": [
        {
          titulo: "La cercanía de su persona de confianza le da la seguridad para experimentar e interactuar",
          objetivo: "Favorecer el desarrollo socioemocional mediante actividades que fortalezcan el vínculo afectivo con su persona de confianza, brindándole seguridad emocional para explorar su entorno, interactuar con otras personas, participar en nuevas experiencias y desarrollar progresivamente su autonomía.",
          actividades: []
        },
        {
          titulo: "Realiza gesticulaciones simbólicas para mostrar algunas emociones y sentimientos",
          objetivo: "Favorecer el desarrollo socioemocional y la comunicación no verbal mediante actividades que estimulen al peque a reconocer, imitar y expresar emociones y sentimientos a través de gestos, expresiones faciales y movimientos corporales, fortaleciendo la comprensión emocional, la interacción social y las habilidades comunicativas.",
          actividades: []
        }
      ]
    }
  }
};

// Cargar desde localStorage si existe (Persistencia temporal antes de Firebase)
// Solo restaura las URLs de media para no perder las actualizaciones en el código fuente
function cargarPlantillaLocal() {
  try {
    const local = localStorage.getItem("est_plantilla_data");
    if (local) {
      const parsed = JSON.parse(local);

      Object.keys(PLANTILLA_DATA).forEach(etapa => {
        if (!parsed[etapa]) return;
        Object.keys(PLANTILLA_DATA[etapa]).forEach(area => {
          if (!parsed[etapa][area]) return;
          Object.keys(PLANTILLA_DATA[etapa][area]).forEach(subarea => {
            if (!parsed[etapa][area][subarea]) return;

            const hitosSource = PLANTILLA_DATA[etapa][area][subarea];
            const hitosLocal = parsed[etapa][area][subarea];

            hitosSource.forEach((hito, idx) => {
              const hitoLoc = hitosLocal[idx];
              if (hitoLoc && hitoLoc.actividades && hito.actividades) {
                hito.actividades.forEach(actSource => {
                  const actLoc = hitoLoc.actividades.find(a => a.id === actSource.id);
                  if (actLoc && actLoc.mediaUrl) {
                    actSource.mediaUrl = actLoc.mediaUrl;
                    actSource.mediaId = actLoc.mediaId;
                    actSource.mediaType = actLoc.mediaType;
                  }
                });
              }
            });
          });
        });
      });
    }
  } catch (e) {
    console.error("Error leyendo localStorage de plantilla", e);
  }
}
function guardarPlantillaLocal() {
  localStorage.setItem("est_plantilla_data", JSON.stringify(PLANTILLA_DATA));
}

cargarPlantillaLocal();

// Iconos asociados a las áreas generales
const ICONOS_AREAS = {
  "Motricidad": "🏃‍♂️",
  "Lenguaje": "🗣️",
  "Socioemocional": "❤️",
  "Cognitivo": "🧠",
  "Sensorial": "👁️"
};

const COLORES_AREAS = {
  "Motricidad": { bg: "linear-gradient(135deg, #E84C9A, #FF7EB3)", border: "#E84C9A" },
  "Lenguaje": { bg: "linear-gradient(135deg, #3B82F6, #60A5FA)", border: "#3B82F6" },
  "Socioemocional": { bg: "linear-gradient(135deg, #10B981, #34D399)", border: "#10B981" },
  "Cognitivo": { bg: "linear-gradient(135deg, #F59E0B, #FBBF24)", border: "#F59E0B" },
  "Sensorial": { bg: "linear-gradient(135deg, #8B5CF6, #A78BFA)", border: "#8B5CF6" }
};

function cargarPlantillaSupervision() {
  const select = document.getElementById("select-etapa-plantilla");
  if (!select) return;
  cambiarEtapaPlantilla();
}
window.cargarPlantillaSupervision = cargarPlantillaSupervision;

function cambiarEtapaPlantilla() {
  const select = document.getElementById("select-etapa-plantilla");
  if (!select) return;
  const etapa = select.value;
  renderPlantillaEtapa(etapa);
}
window.cambiarEtapaPlantilla = cambiarEtapaPlantilla;

function renderPlantillaEtapa(etapa) {
  const grid = document.getElementById("plantilla-bento-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const dataEtapa = PLANTILLA_DATA[etapa];

  if (!dataEtapa) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--est-glass-bg, rgba(255,255,255,0.8)); backdrop-filter: blur(10px); border-radius: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <div style="font-size: 40px; margin-bottom: 15px; animation: bounce 2s infinite;">🌱</div>
        <h3 style="color: var(--text-main); margin-bottom: 10px; font-family: 'DM Serif Display', serif;">Aún no hay información para esta etapa</h3>
        <p class="muted">La base de datos de hitos y actividades para la etapa "${etapa}" estará disponible próximamente.</p>
      </div>
    `;
    return;
  }

  // Contenedor principal para scroll horizontal
  const scrollContainer = document.createElement("div");
  scrollContainer.className = "plantilla-scroll-container";
  scrollContainer.style.cssText = "grid-column: 1 / -1; overflow-x: auto; padding-bottom: 20px; width: 100%; scroll-behavior: smooth;";

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "plantilla-table-wrapper";
  tableWrapper.style.cssText = "display: flex; gap: 20px; min-width: max-content; padding: 5px 10px;";

  const coloresAreas = [
    { bg: "linear-gradient(135deg, #E84C9A, #FF7EB3)", border: "#E84C9A" },
    { bg: "linear-gradient(135deg, #3B82F6, #60A5FA)", border: "#3B82F6" },
    { bg: "linear-gradient(135deg, #10B981, #34D399)", border: "#10B981" },
    { bg: "linear-gradient(135deg, #F59E0B, #FBBF24)", border: "#F59E0B" },
    { bg: "linear-gradient(135deg, #8B5CF6, #A78BFA)", border: "#8B5CF6" }
  ];

  Object.keys(dataEtapa).forEach((area, index) => {
    const subareas = dataEtapa[area];
    const icono = ICONOS_AREAS[area] || "⭐";
    const colorStyle = COLORES_AREAS[area] || coloresAreas[index % coloresAreas.length];

    const areaGroup = document.createElement("div");
    areaGroup.className = "area-group";
    areaGroup.style.cssText = `display: flex; flex-direction: column; background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.04); border: 1px solid rgba(255,255,255,0.8); animation: fadeInPremium 0.5s ease-out forwards; animation-delay: ${index * 0.1}s;`;

    const areaHeader = document.createElement("div");
    areaHeader.style.cssText = `text-align: center; padding: 12px 20px; background: ${colorStyle.bg}; color: white; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);`;
    areaHeader.innerHTML = `<span style="font-size: 18px; margin-right: 8px;">${icono}</span> ${area}`;
    areaGroup.appendChild(areaHeader);

    const subareasContainer = document.createElement("div");
    subareasContainer.style.cssText = "display: flex; gap: 2px; background: rgba(0,0,0,0.03); flex: 1;";

    Object.keys(subareas).forEach(subarea => {
      const hitos = subareas[subarea];

      const subareaCol = document.createElement("div");
      subareaCol.style.cssText = "width: 280px; background: rgba(255,255,255,0.9); display: flex; flex-direction: column;";

      const subareaHeader = document.createElement("div");
      subareaHeader.style.cssText = `padding: 15px 15px; text-align: center; font-weight: 800; color: #334155; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px dashed rgba(0,0,0,0.06);`;
      subareaHeader.textContent = subarea;
      subareaCol.appendChild(subareaHeader);

      const hitosList = document.createElement("div");
      hitosList.style.cssText = "padding: 15px; display: flex; flex-direction: column; gap: 10px; flex: 1;";

      hitos.forEach((hitoObj, hitoIndex) => {
        const titulo = typeof hitoObj === 'string' ? hitoObj : hitoObj.titulo;

        const hitoCard = document.createElement("div");
        hitoCard.style.cssText = `background: white; border-radius: 12px; padding: 14px 16px; font-size: 13px; color: var(--text-main); border-left: 4px solid ${colorStyle.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.03); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; line-height: 1.5; font-weight: 500; position: relative;`;
        hitoCard.onmouseover = function () {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        };
        hitoCard.onmouseout = function () {
          this.style.transform = 'none';
          this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
        };
        hitoCard.innerHTML = `${titulo} <span style="position: absolute; right: 10px; bottom: 10px; opacity: 0.3; font-size: 16px;">➔</span>`;

        // Agregar evento para abrir modal
        hitoCard.onclick = () => abrirModalHito(etapa, area, subarea, hitoIndex);

        hitosList.appendChild(hitoCard);
      });

      subareaCol.appendChild(hitosList);
      subareasContainer.appendChild(subareaCol);
    });

    areaGroup.appendChild(subareasContainer);
    tableWrapper.appendChild(areaGroup);
  });

  scrollContainer.appendChild(tableWrapper);
  grid.appendChild(scrollContainer);
}
window.renderPlantillaEtapa = renderPlantillaEtapa;

// Variables para saber qué hito está abierto actualmente
let _modalEtapa = null, _modalArea = null, _modalSubarea = null, _modalHitoIndex = null;

let mediaTargetActivityId = null;
let mediaTargetEtapa = null;
let mediaTargetArea = null;
let mediaTargetSubarea = null;
let mediaTargetHitoIndex = null;
let _currentActivities = []; // Almacén temporal de actividades del hito abierto

/**
 * Renderiza las tarjetas de actividad dentro del modal.
 */
function renderizarActividades(actividades, etapa, area, subarea, indexHito) {
  const actContainer = document.getElementById("modal-actividades-container");

  if (!actividades || actividades.length === 0) {
    actContainer.innerHTML = `<div style="grid-column: 1 / -1; padding: 20px; text-align: center; color: #94a3b8; background: #f1f5f9; border-radius: 12px;">Aún no hay actividades registradas para este hito.</div>`;
    return;
  }

  actividades.forEach(act => {
    let mediaGallery = '';
    const allMedia = act.media || [];

    // Retrocompatibilidad
    if (act.mediaId && allMedia.length === 0) {
      allMedia.push({ id: act.mediaId, type: act.mediaType, url: act.mediaUrl });
    }

    if (allMedia.length > 0) {
      mediaGallery = `
        <div class="media-gallery" style="display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; scroll-snap-type: x mandatory; margin-top: 15px;">
          ${allMedia.map((m) => {
        if (m.type === 'video') {
          return `
                <div style="flex: 0 0 250px; scroll-snap-align: start; border-radius: 12px; overflow: hidden; background: #000; height: 150px; position:relative;">
                  <iframe src="https://drive.google.com/file/d/${m.id}/preview" style="width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
                  <div style="position:absolute; top:0; left:0; right:0; height:50px; background:transparent; z-index:10;"></div>
                </div>`;
        } else {
          return `
                <div style="flex: 0 0 250px; scroll-snap-align: start; border-radius: 12px; overflow: hidden; background: #f1f5f9; height: 150px; display: flex; justify-content: center; align-items: center;">
                  <img src="https://drive.google.com/thumbnail?id=${m.id}&sz=w1000" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null;this.src='https://drive.google.com/uc?export=view&id=${m.id}';"/>
                </div>`;
        }
      }).join('')}
        </div>
        <div style="text-align: center; margin-top: 8px;">
           <label for="media-upload-${act.id}" style="font-size: 11px; color: var(--blue-main); cursor: pointer; text-decoration: underline; font-weight: 700;">➕ Agregar más imágenes/vídeos</label>
           <input type="file" id="media-upload-${act.id}" accept="image/*,video/*" multiple style="display: none;" onchange="manejarSubidaMedia(this, '${etapa}', '${area}', '${subarea}', ${indexHito}, '${act.id}', '${act._fbId || ''}')">
        </div>
      `;
    } else {
      mediaGallery = `
        <div id="media-container-${act.id}" class="media-upload-container" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(0,0,0,0.1); text-align: center;">
          <input type="file" id="media-upload-${act.id}" accept="image/*,video/*" multiple style="display: none;" onchange="manejarSubidaMedia(this, '${etapa}', '${area}', '${subarea}', ${indexHito}, '${act.id}', '${act._fbId || ''}')">
          <label for="media-upload-${act.id}" style="display: inline-block; background: #f1f5f9; color: var(--blue-main); padding: 8px 15px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: background 0.2s;">
            📷 Agregar imágenes o vídeos
          </label>
        </div>
      `;
    }

    actContainer.innerHTML += `
      <div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05); display: flex; flex-direction: column; height: fit-content;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <h5 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--text-main); line-height: 1.4;">
      <span style="color: var(--pink-main);">${act.numeroActividad || act.id || '★'}.</span> ${act.titulo}
          </h5>
          <button onclick="abrirModalEditarActividad('${act._fbId || act.id}')" 
            style="background: #f1f5f9; border: none; color: var(--blue-main); padding: 5px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; white-space: nowrap; margin-left: 10px;"
            onmouseover="this.style.background='var(--blue-main)'; this.style.color='white';" 
            onmouseout="this.style.background='#f1f5f9'; this.style.color='var(--blue-main)';"
          >✏️ Editar</button>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;">
          <span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;">🧩 ${act.area || area}</span>
        </div>

        <div style="margin-bottom: 15px;">
          <strong style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Materiales:</strong>
          <p style="margin: 3px 0 0 0; font-size: 13px; color: var(--text-main);">${act.material || 'N/A'}</p>
        </div>

        <div style="margin-bottom: 15px; background: rgba(59, 130, 246, 0.05); padding: 12px; border-radius: 12px;">
          <strong style="font-size: 12px; color: var(--blue-main); text-transform: uppercase;">Instrucciones:</strong>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: var(--text-main); line-height: 1.6;">${act.descripcion}</p>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; background: #f8fafc; padding: 10px 15px; border-radius: 12px; align-items: center;">
            <div style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b; font-weight: 600;">
              ⏱️ ${act.tiempo}
            </div>
            <div style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b; font-weight: 600;">
              🔄 ${act.repeticion}
            </div>
          </div>
          
          ${mediaGallery}
        </div>
      </div>
    `;
  });
}

async function abrirModalHito(etapa, area, subarea, indexHito) {
  const data = PLANTILLA_DATA[etapa][area][subarea][indexHito];
  if (!data) return;

  _modalEtapa = etapa;
  _modalArea = area;
  _modalSubarea = subarea;
  _modalHitoIndex = indexHito;

  document.getElementById("modal-hito-titulo").textContent = data.titulo;
  document.getElementById("modal-hito-sub").textContent = `${area} - ${subarea}`;
  document.getElementById("modal-hito-objetivo").textContent = data.objetivo || "Objetivo no definido aún.";

  // Aplicar colores de área
  const colores = COLORES_AREAS[area] || { bg: "linear-gradient(135deg, var(--pink-main), var(--pink-hover))", border: "#E84C9A" };
  const header = document.getElementById("modal-hito-header");
  const objContainer = document.getElementById("modal-hito-objetivo-container");
  const objTitulo = document.getElementById("modal-hito-objetivo-titulo");

  if (header) header.style.background = colores.bg;
  if (objContainer) objContainer.style.borderLeftColor = colores.border;
  if (objTitulo) objTitulo.style.color = colores.border;

  const actContainer = document.getElementById("modal-actividades-container");
  actContainer.innerHTML = `<div style="grid-column: 1 / -1; padding: 20px; text-align: center; color: #94a3b8;"><div style="font-size: 24px; margin-bottom: 8px;">🔄</div>Cargando actividades...</div>`;

  const modal = document.getElementById("modal-actividades-hito");
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  const activBase = (data.actividades || []).map(a => ({ ...a }));

  let activFb = [];
  try {
    const { db } = await import('./firebase-config.js');
    const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const q = query(
      collection(db, 'plantilla_actividades'),
      where('etapa', '==', etapa),
      where('areaDesarrollo', '==', area),
      where('subareaDesarrollo', '==', subarea),
      where('hitoTitulo', '==', data.titulo),
      orderBy('numeroActividad', 'asc')
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      activFb.push({ ...doc.data(), _fbId: doc.id });
    });
  } catch (e) {
    console.warn('No se pudieron cargar actividades de Firebase:', e.message);
  }

  actContainer.innerHTML = '';
  _currentActivities = [...activBase, ...activFb];

  // Ordenar numéricamente por numeroActividad para evitar "1, 10, 2"
  _currentActivities.sort((a, b) => {
    const numA = parseInt(a.numeroActividad, 10) || 0;
    const numB = parseInt(b.numeroActividad, 10) || 0;
    return numA - numB;
  });

  renderizarActividades(_currentActivities, etapa, area, subarea, indexHito);
}
window.abrirModalHito = abrirModalHito;

function cerrarModalHito() {
  document.getElementById("modal-actividades-hito").style.display = "none";
}
window.cerrarModalHito = cerrarModalHito;

async function abrirModalFormActividad() {
  document.getElementById('form-actividad').reset();
  document.getElementById('act-fb-id').value = ''; // Limpiar ID de edición
  document.getElementById('modal-form-titulo').textContent = 'Nueva Actividad';
  document.getElementById('btn-guardar-actividad').textContent = '🚀 Guardar Actividad';

  document.getElementById('form-media-preview').innerHTML = `
    <div style="font-size: 28px; margin-bottom: 6px;">📎</div>
    <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600;">Toca para seleccionar imagen o vídeo</p>
    <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">JPG, PNG, MP4 · Máx. 10MB</p>
  `;
  document.getElementById('modal-form-actividad').style.display = 'flex';

  // Calcular números automáticos
  document.getElementById('act-numero').value = '...';
  document.getElementById('act-orden').value = '';

  try {
    const hitoData = PLANTILLA_DATA[_modalEtapa][_modalArea][_modalSubarea][_modalHitoIndex];
    const { db } = await import('./firebase-config.js');
    const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    // 1. CALCULAR NO. ACTIVIDAD (Continuo por ETAPA)
    let totalEtapaBase = 0;
    const areas = PLANTILLA_DATA[_modalEtapa];
    for (const aName in areas) {
      for (const sName in areas[aName]) {
        areas[aName][sName].forEach(h => {
          totalEtapaBase += (h.actividades || []).length;
        });
      }
    }
    const snapEtapa = await getDocs(query(collection(db, 'plantilla_actividades'), where('etapa', '==', _modalEtapa)));
    const siguienteFolio = String(totalEtapaBase + snapEtapa.size + 1).padStart(3, '0');
    document.getElementById('act-numero').value = siguienteFolio;

    // 2. CALCULAR ORDEN SUGERENCIA (Por HITO)
    const totalHitoBase = (hitoData.actividades || []).length;
    const snapHito = await getDocs(query(
      collection(db, 'plantilla_actividades'),
      where('hitoTitulo', '==', hitoData.titulo),
      where('etapa', '==', _modalEtapa)
    ));
    const siguienteOrden = totalHitoBase + snapHito.size + 1;
    document.getElementById('act-orden').value = siguienteOrden;

  } catch (e) {
    console.error("Error calculando folios:", e);
    document.getElementById('act-numero').value = '???';
  }
}
window.abrirModalFormActividad = abrirModalFormActividad;

function abrirModalEditarActividad(id) {
  const act = _currentActivities.find(a => (a._fbId === id || a.id === id));
  if (!act) return;

  const fbId = act._fbId || '';
  if (!fbId) {
    alert("Esta actividad es parte de la plantilla base y no se puede editar directamente desde aquí todavía.");
    return;
  }

  document.getElementById('form-actividad').reset();
  document.getElementById('act-fb-id').value = fbId;
  document.getElementById('modal-form-titulo').textContent = 'Editar Actividad';
  document.getElementById('btn-guardar-actividad').textContent = '✅ Guardar Cambios';

  document.getElementById('act-numero').value = act.numeroActividad || '';
  document.getElementById('act-orden').value = act.ordenSecuencia || '';
  document.getElementById('act-titulo').value = act.titulo || '';
  document.getElementById('act-material').value = act.material || '';
  document.getElementById('act-instrucciones').value = act.descripcion || '';

  // Parsear tiempo y repetición si es posible
  if (act.duracionValor) document.getElementById('act-duracion-num').value = act.duracionValor;
  if (act.duracionUnidad) document.getElementById('act-duracion-unidad').value = act.duracionUnidad;
  if (act.repeticionValor) document.getElementById('act-repeticion-num').value = act.repeticionValor;
  if (act.repeticionUnidad) document.getElementById('act-repeticion-unidad').value = act.repeticionUnidad;

  const preview = document.getElementById('form-media-preview');
  preview.innerHTML = '';

  const allMedia = act.media || [];
  if (act.mediaId && allMedia.length === 0) {
    allMedia.push({ id: act.mediaId, type: act.mediaType });
  }

  if (allMedia.length > 0) {
    preview.style.display = 'grid';
    preview.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
    preview.style.gap = '10px';

    allMedia.forEach(m => {
      if (m.type === 'video') {
        preview.innerHTML += `<div style="position:relative;"><video src="https://drive.google.com/uc?export=view&id=${m.id}" style="width:100%; height:80px; object-fit:cover; border-radius:8px;"></video><span style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.5); color:white; border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center;">📹</span></div>`;
      } else {
        preview.innerHTML += `<div style="position:relative;"><img src="https://drive.google.com/uc?export=view&id=${m.id}" style="width:100%; height:80px; object-fit:cover; border-radius:8px;"><span style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.5); color:white; border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center;">📷</span></div>`;
      }
    });
  } else {
    preview.style.display = 'block';
    preview.innerHTML = `
      <div style="font-size: 28px; margin-bottom: 6px;">📎</div>
      <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600;">Toca para seleccionar imagen o vídeo</p>
    `;
  }

  document.getElementById('modal-form-actividad').style.display = 'flex';
}
window.abrirModalEditarActividad = abrirModalEditarActividad;

function cerrarModalFormActividad() {
  document.getElementById('modal-form-actividad').style.display = 'none';
}
window.cerrarModalFormActividad = cerrarModalFormActividad;

// Preview del archivo seleccionado antes de guardar
function previsualizarMediaForm(input) {
  if (!input.files || input.files.length === 0) return;
  const files = Array.from(input.files);
  const preview = document.getElementById('form-media-preview');

  preview.innerHTML = '';
  preview.style.display = 'grid';
  preview.style.gridTemplateColumns = 'repeat(auto-fill, minmax(80px, 1fr))';
  preview.style.gap = '10px';

  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      console.warn(`Archivo ${file.name} ignorado por tamaño > 10MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const div = document.createElement('div');
      div.style.position = 'relative';
      if (file.type.startsWith('video')) {
        div.innerHTML = `<video src="${e.target.result}" style="width:100%; height:80px; object-fit:cover; border-radius:8px;"></video><span style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.5); color:white; border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center;">📹</span>`;
      } else {
        div.innerHTML = `<img src="${e.target.result}" style="width:100%; height:80px; object-fit:cover; border-radius:8px;"><span style="position:absolute; top:2px; right:2px; background:rgba(0,0,0,0.5); color:white; border-radius:50%; width:16px; height:16px; font-size:10px; display:flex; align-items:center; justify-content:center;">📷</span>`;
      }
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}
window.previsualizarMediaForm = previsualizarMediaForm;


async function guardarActividadFirebase(event) {
  event.preventDefault();
  if (!_modalEtapa || _modalHitoIndex === null) {
    alert('Error: no hay un hito activo.');
    return;
  }

  const titulo = document.getElementById('act-titulo').value.trim();
  const material = document.getElementById('act-material').value.trim() || 'N/A';
  const instrucciones = document.getElementById('act-instrucciones').value.trim();
  const durNum = document.getElementById('act-duracion-num').value;
  const durUnidad = document.getElementById('act-duracion-unidad').value;
  const repNum = document.getElementById('act-repeticion-num').value;
  const repUnidad = document.getElementById('act-repeticion-unidad').value;

  const tiempoStr = `${durNum} ${durUnidad} aproximadamente`;
  const repStr = repUnidad === 'al despertar' || repUnidad === 'antes de dormir' || repUnidad === 'con cada alimento'
    ? `${repUnidad.charAt(0).toUpperCase() + repUnidad.slice(1)}`
    : `Realiza la actividad ${repNum} ${repUnidad}`;

  const hitoData = PLANTILLA_DATA[_modalEtapa][_modalArea][_modalSubarea][_modalHitoIndex];
  const fbId = document.getElementById('act-fb-id').value;

  const actividadData = {
    numeroActividad: document.getElementById('act-numero').value || '000',
    ordenSecuencia: parseInt(document.getElementById('act-orden').value) || 1,
    titulo,
    etapa: _modalEtapa,
    areaDesarrollo: _modalArea,
    subareaDesarrollo: _modalSubarea,
    hitoTitulo: hitoData.titulo,
    hitoObjetivo: hitoData.objetivo || '',
    hitoIndex: _modalHitoIndex,
    material,
    descripcion: instrucciones,
    tiempo: tiempoStr,
    repeticion: repStr,
    duracionValor: parseInt(durNum) || 0,
    duracionUnidad: durUnidad,
    repeticionValor: parseInt(repNum) || 0,
    repeticionUnidad: repUnidad,
    actualizadoEn: new Date().toISOString()
  };

  if (!fbId) {
    actividadData.creadoEn = new Date().toISOString();
    actividadData.mediaUrl = '';
    actividadData.mediaId = '';
    actividadData.mediaType = '';
  }

  const btn = document.getElementById('btn-guardar-actividad');
  const btnOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '⏳ Guardando...';

  // Si hay archivos seleccionados, subirlos
  const mediaInput = document.getElementById('act-media-input');
  const uploadedMedia = [];
  if (mediaInput.files && mediaInput.files.length > 0) {
    const files = Array.from(mediaInput.files);
    btn.innerHTML = `⬆️ Subiendo ${files.length} archivo(s)...`;

    for (const file of files) {
      try {
        const base64Data = await convertFileToBase64(file);
        const res = await api('uploadMediaPlantilla', { fileData: base64Data, fileName: file.name, mimeType: file.type });
        if (res && res.url) {
          uploadedMedia.push({
            id: res.fileId,
            url: res.url,
            type: file.type.startsWith('video') ? 'video' : 'image'
          });
        }
      } catch (mediaErr) {
        console.warn('Error subiendo uno de los archivos:', mediaErr);
      }
    }
    btn.innerHTML = '⏳ Guardando...';
  }

  try {
    const { db } = await import('./firebase-config.js');
    const { collection, addDoc, doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    if (fbId) {
      if (uploadedMedia.length > 0) {
        actividadData.media = arrayUnion(...uploadedMedia);
      }
      await updateDoc(doc(db, 'plantilla_actividades', fbId), actividadData);
    } else {
      actividadData.media = uploadedMedia;
      await addDoc(collection(db, 'plantilla_actividades'), actividadData);
    }

    cerrarModalFormActividad();
    await abrirModalHito(_modalEtapa, _modalArea, _modalSubarea, _modalHitoIndex);
  } catch (e) {
    console.error('Error guardando en Firebase:', e);
    alert('Error al guardar: ' + e.message);
    btn.disabled = false;
    btn.innerHTML = btnOriginal;
  }
}
window.guardarActividadFirebase = guardarActividadFirebase;

async function manejarSubidaMedia(input, etapa, area, subarea, indexHito, activityId, fbId = '') {
  if (!input.files || input.files.length === 0) return;
  const files = Array.from(input.files);

  // Validar tamaño aprox < 10MB por archivo
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
      return;
    }
  }

  // UI Loading State
  const containerId = `media-container-${activityId}`;
  const container = document.getElementById(containerId) || input.parentElement;
  const originalHTML = container.innerHTML;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 20px;">
      <div style="width: 30px; height: 30px; border: 3px solid #e2e8f0; border-top: 3px solid var(--pink-main); border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <span style="font-size: 13px; font-weight: 700; color: var(--pink-main);">Subiendo ${files.length} archivo(s)...</span>
    </div>
  `;

  try {
    const uploadedMedia = [];
    for (const file of files) {
      const base64Data = await convertFileToBase64(file);
      const res = await api('uploadMediaPlantilla', { fileData: base64Data, fileName: file.name, mimeType: file.type });
      if (res && res.url) {
        uploadedMedia.push({
          id: res.fileId,
          url: res.url,
          type: file.type.startsWith('video') ? 'video' : 'image'
        });
      }
    }

    if (fbId) {
      // Firebase
      const { db } = await import('./firebase-config.js');
      const { doc, getDoc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const docRef = doc(db, 'plantilla_actividades', fbId);

      await updateDoc(docRef, {
        media: arrayUnion(...uploadedMedia)
      });
    } else {
      // Local
      const hito = PLANTILLA_DATA[etapa][area][subarea][indexHito];
      const act = hito.actividades.find(a => a.id === activityId);
      if (act) {
        if (!act.media) act.media = [];
        act.media.push(...uploadedMedia);
      }
      guardarPlantillaLocal();
    }

    await abrirModalHito(etapa, area, subarea, indexHito);
  } catch (err) {
    console.error("Error subiendo media:", err);
    alert("Error al subir: " + err.message);
    container.innerHTML = originalHTML;
  } finally {
    input.value = "";
  }
}
window.manejarSubidaMedia = manejarSubidaMedia;

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
