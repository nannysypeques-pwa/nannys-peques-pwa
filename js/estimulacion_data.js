const CATALOGO_HITOS = {
    "0-3m": {
        nombre: "Peques de 0 a 3 meses",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf1", texto: "Hace succión de objetos" },
                    { id: "mf2", texto: "Tiene el reflejo de presión palmar (reacciona al tocar las palmas)" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg1", texto: "Sostiene 3 segundos la cabeza o intenta enderezarse" },
                    { id: "mg2", texto: "Tiene flexión de los miembros" },
                    { id: "mg3", texto: "Puede darse la vuelta" }
                ]
            },
            "visual": {
                nombre: "Visual",
                hitos: [
                    { id: "v1", texto: "Contacto visual y seguimiento visual 90°" },
                    { id: "v2", texto: "Reacciona mejor cuando ve los colores: negro, blanco y rojo" }
                ]
            },
            "gusto": {
                nombre: "Gusto",
                hitos: [
                    { id: "g1", texto: "Se lleva las manos o un objeto a la boca para explorarlo" },
                    { id: "g2", texto: "Come sin atragantarse o ponerse morado" }
                ]
            },
            "auditiva": {
                nombre: "Auditiva",
                hitos: [
                    { id: "a1", texto: "Atiende a estímulos visuales y sonoros" },
                    { id: "a2", texto: "Oye el sonido de la sonaja y detiene o aumenta el movimiento" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c1", texto: "Puede golpear algo para que continúe produciéndose una señal" },
                    { id: "c2", texto: "Realiza el juego funcional (tirar objetos para que produzca sonido)" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l1", texto: "Llora fuerte cuando está molesto, se tranquiliza al cargarlo" },
                    { id: "l2", texto: "Balbucea a través del llanto o como si se arrullara" },
                    { id: "l3", texto: "Escucha las conversaciones atentamente" },
                    { id: "l4", texto: "Usa sonidos o movimientos para demostrar interés" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se1", texto: "Tiene dependencia hacia los padres y personas próximas" },
                    { id: "se2", texto: "Reconoce a las personas que usualmente lo cuidan" }
                ]
            }
        }
    },
    "4-6m": {
        nombre: "Peques de 3 a 6 meses",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_36_1", texto: "Desarrolla el reflejo ojo-mano, es decir, puedes ofrecerle un objeto y él intentara tomarlo" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_36_1", texto: "Se recuesta al bebé boca abajo y gira la cabeza de lado" },
                    { id: "mg_36_2", texto: "Rueda" }
                ]
            },
            "visual": {
                nombre: "Visual",
                hitos: [
                    { id: "v_36_1", texto: "Puede seguir un objeto a 180°" },
                    { id: "v_36_2", texto: "Intenta tocar un objeto" }
                ]
            },
            "gusto": {
                nombre: "Gusto",
                hitos: [
                    { id: "g_36_1", texto: "Tiene una succión enérgica ante los alimentos" }
                ]
            },
            "auditiva": {
                nombre: "Auditiva",
                hitos: [
                    { id: "a_36_1", texto: "Al jugar platica o se ríe" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_36_1", texto: "Puede descubrir un objeto tapado" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_36_1", texto: "Reconoce frecuencias sonoras, por ejemplo una canción infantil y su lengua materna" },
                    { id: "l_36_2", texto: "Balbucea haciendo sonidos como “Cuu, guu o grititos”" },
                    { id: "l_36_3", texto: "Hace sonidos espontáneos cuando se le hace plática con vocales y consonantes" },
                    { id: "l_36_4", texto: "Hace sonidos de una sola sílaba" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_36_1", texto: "Experimenta las siguientes emociones: satisfacción, interés, aflicción" },
                    { id: "se_36_2", texto: "Está abierto a la estimulación" },
                    { id: "se_36_3", texto: "Muestra interés, curiosidad y sonríe a los demás" }
                ]
            }
        }
    },
    "7-9m": {
        nombre: "Peques de 6 a 9 meses",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_69_1", texto: "Puede observar algo y tomarlo con mayor precisión" },
                    { id: "mf_69_2", texto: "Explora lo que hay a su alrededor buscando algo nuevo" },
                    { id: "mf_69_3", texto: "Puede hacer sonar una sonaja" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_69_1", texto: "Al sostenerlo por debajo de los brazos simula caminar" },
                    { id: "mg_69_2", texto: "Al sentarlo alinea el cuerpo, sostiene la cabeza y estira las piernas" },
                    { id: "mg_69_3", texto: "Se apoya en antebrazos y levanta la cabeza, no le molesta la posición" }
                ]
            },
            "visual": {
                nombre: "Visual",
                hitos: [
                    { id: "v_69_1", texto: "Reconoce los rostros de sus padres y familiares cercanos" }
                ]
            },
            "gusto": {
                nombre: "Gusto",
                hitos: [
                    { id: "g_69_1", texto: "Empieza la alimentación complementaria, no rechaza la papilla" }
                ]
            },
            "auditiva": {
                nombre: "Auditiva",
                hitos: [
                    { id: "a_69_1", texto: "Encuentra un objeto escondido que tiene sonido" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_69_1", texto: "Tiene un juguete favorito" },
                    { id: "c_69_2", texto: "Puede identificar objetos desde varios puntos de vista" },
                    { id: "c_69_3", texto: "Mira hacia el objeto cuando se les muestra" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_69_1", texto: "Reconoce su nombre" },
                    { id: "l_69_2", texto: "Se comunica con gestos e imita sonidos y gestos sociales" },
                    { id: "l_69_3", texto: "Repite la misma sílaba (ba, ba, na, na)" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_69_1", texto: "Tiene una relación más estrecha con sus cuidadores y desconfía de los desconocidos" },
                    { id: "se_69_2", texto: "Actúa con timidez en situaciones nuevas" },
                    { id: "se_69_3", texto: "Distingue a los extraños de los conocidos" }
                ]
            }
        }
    },
    "10-12m": {
        nombre: "Peques de 9 a 12 meses",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_912_1", texto: "Toma un objeto con la mano" },
                    { id: "mf_912_2", texto: "Presiona objetos o juguetes con el dedo índice" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_912_1", texto: "Levanta el tórax y se apoya en un brazo para alcanzar un objeto" },
                    { id: "mg_912_2", texto: "Se desplaza a gatas, lateral, elefante, sentado" },
                    { id: "mg_912_3", texto: "Puede sentarse desde cualquier posición" }
                ]
            },
            "visual": {
                nombre: "Visual",
                hitos: [
                    { id: "v_912_1", texto: "Explora con interés su casa o entorno" },
                    { id: "v_912_2", texto: "Sentado agarra la pelota" }
                ]
            },
            "gusto": {
                nombre: "Gusto",
                hitos: [
                    { id: "g_912_1", texto: "Come una galleta solo" }
                ]
            },
            "auditiva": {
                nombre: "Auditiva",
                hitos: [
                    { id: "a_912_1", texto: "Hace monerías imitando con las manos, p ej.: aplaudir" },
                    { id: "a_912_2", texto: "Ante los sonidos bruscos, podrá asustarse, reaccionar con asombro y analizar el objeto que lo ha causado" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_912_1", texto: "Puede encontrar un juguete si se esconde debajo de una manta" },
                    { id: "c_912_2", texto: "Usa el movimiento para expresar lo que quiere" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_912_1", texto: "En ocasiones realiza algunas acciones que se le piden" },
                    { id: "l_912_2", texto: "Hace contacto físico cuando quiere algo" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_912_1", texto: "Muestra más interés por los grupos" },
                    { id: "se_912_2", texto: "Muestra gusto o disgusto por algún familiar" },
                    { id: "se_912_3", texto: "Inicia un juego social simple (p ej. Se tapa la cara y dice bu)" }
                ]
            }
        }
    },
    "13-18m": {
        nombre: "Peques de 12 a 18 meses",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_1218_1", texto: "Alinea y apila un objeto sobre otro" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_1218_1", texto: "Gatea" },
                    { id: "mg_1218_2", texto: "Se pone de pie solo" },
                    { id: "mg_1218_3", texto: "Se para agarrándose de objetos" },
                    { id: "mg_1218_4", texto: "Camina con apoyo o sostenido de una mano" },
                    { id: "mg_1218_5", texto: "Puede acuclillarse y volver a pararse sin ayuda" },
                    { id: "mg_1218_6", texto: "Se sienta en una silla pequeña" }
                ]
            },
            "visual": {
                nombre: "Visual",
                hitos: [
                    { id: "v_1218_1", texto: "De pie tira la pelota con una o dos manos" },
                    { id: "v_1218_2", texto: "Empieza a imitar y ejecutar gestos" }
                ]
            },
            "gusto": {
                nombre: "Gusto",
                hitos: [
                    { id: "g_1218_1", texto: "Bebe de una taza" },
                    { id: "g_1218_2", texto: "Come solo con la cuchara aunque lo derrame" }
                ]
            },
            "auditiva": {
                nombre: "Auditiva",
                hitos: [
                    { id: "a_1218_1", texto: "Reconoce dos objetos o personas en una fotografía" },
                    { id: "a_1218_2", texto: "Puede buscar la fuente del sonido en cualquier dirección y con más facilidad" },
                    { id: "a_1218_3", texto: "Puede animarse a imitar los sonidos y a querer crearlos él solo" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_1218_1", texto: "Muestra más interés por los libros y juguetes" },
                    { id: "c_1218_2", texto: "Se mantiene acostado escuchando un cuento por tiempos breves" },
                    { id: "c_1218_3", texto: "Puede identificar 6 o más partes de su cuerpo" },
                    { id: "c_1218_4", texto: "Realiza órdenes sencillas con gestos de 'ven', 'dame', 'no hagas eso'" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_1218_1", texto: "Señala una o más partes del cuerpo" },
                    { id: "l_1218_2", texto: "Sigue instrucciones simples (de un paso)" },
                    { id: "l_1218_3", texto: "Responde cuando otra persona le habla" },
                    { id: "l_1218_4", texto: "Localiza objetos o personas que están cerca" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_1218_1", texto: "La cercanía de su persona de confianza le da la seguridad para experimentar e interactuar" },
                    { id: "se_1218_2", texto: "Realiza gesticulaciones simbólicas para mostrar algunas emociones y sentimientos" }
                ]
            }
        }
    },
    "19-24m": {
        nombre: "Peques de 18 a 24 meses",
        areas: {
            "motricidad_fina": { nombre: "Motricidad Fina", hitos: [{ id: "mf_1924_1", texto: "Pasa páginas de un libro" }] },
            "motricidad_gruesa": { nombre: "Motricidad Gruesa", hitos: [{ id: "mg_1924_1", texto: "Sube escaleras con ayuda" }] },
            "visual": { nombre: "Visual", hitos: [{ id: "v_1924_1", texto: "Construye torres de 6 bloques" }] },
            "gusto": { nombre: "Gusto", hitos: [{ id: "g_1924_1", texto: "Bebe de una punta sola solo" }] },
            "auditiva": { nombre: "Auditiva", hitos: [{ id: "a_1924_1", texto: "Entiende órdenes de dos pasos" }] },
            "cognitiva": { nombre: "Cognitiva", hitos: [{ id: "c_1924_1", texto: "Juego simbólico simple" }] },
            "lenguaje": { nombre: "Lenguaje", hitos: [{ id: "l_1924_1", texto: "Frases de dos palabras" }] },
            "socioemocional": { nombre: "Socioemocional", hitos: [{ id: "se_1924_1", texto: "Juega junto a otros niños" }] }
        }
    },
    "25-36m": {
        nombre: "Peques de 2 a 3 años",
        areas: {
            "motricidad_fina": { nombre: "Motricidad Fina", hitos: [{ id: "mf_2536_1", texto: "Copia un círculo" }] },
            "motricidad_gruesa": { nombre: "Motricidad Gruesa", hitos: [{ id: "mg_2536_1", texto: "Salta con ambos pies" }] },
            "visual": { nombre: "Visual", hitos: [{ id: "v_2536_1", texto: "Identifica colores básicos" }] },
            "gusto": { nombre: "Gusto", hitos: [{ id: "g_2536_1", texto: "Come de forma independiente" }] },
            "auditiva": { nombre: "Auditiva", hitos: [{ id: "a_2536_1", texto: "Entiende conceptos espaciales" }] },
            "cognitiva": { nombre: "Cognitiva", hitos: [{ id: "c_2536_1", texto: "Ordena objetos por tamaño" }] },
            "lenguaje": { nombre: "Lenguaje", hitos: [{ id: "l_2536_1", texto: "Usa oraciones completas" }] },
            "socioemocional": { nombre: "Socioemocional", hitos: [{ id: "se_2536_1", texto: "Empieza a compartir juguetes" }] }
        }
    }
};

window.CATALOGO_HITOS = CATALOGO_HITOS;
