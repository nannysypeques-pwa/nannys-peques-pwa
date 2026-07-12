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
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_1924_1", texto: "Mete y saca semillas de un frasco" },
                    { id: "mf_1924_2", texto: "Ayuda a vestirse y desvestirse" },
                    { id: "mf_1924_3", texto: "Copia una línea en cualquier dirección" },
                    { id: "mf_1924_4", texto: "Ensambla objetos y juguetes de varias piezas" },
                    { id: "mf_1924_5", texto: "Construye una torre de bloques" },
                    { id: "mf_1924_6", texto: "Desenvuelve los dulces o plátanos que va a consumir" },
                    { id: "mf_1924_7", texto: "Es capaz de agarrar objetos pequeños haciendo pinza es decir, unir el dedo índice con el gordo" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_1924_1", texto: "Da algunos pasos solo" },
                    { id: "mg_1924_2", texto: "Camina un poco hacia atrás" },
                    { id: "mg_1924_3", texto: "Aprende a montar el triciclo" },
                    { id: "mg_1924_4", texto: "Aprende a subir las escaleras" },
                    { id: "mg_1924_5", texto: "Camina bien" },
                    { id: "mg_1924_6", texto: "Se sube a una silla de adulto para obtener algo" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_1924_1", texto: "Ensaya actividades nuevas y resuelve problemas (prueba y error)" },
                    { id: "c_1924_2", texto: "Varía sus acciones para ver sus resultados, p ej. avienta una pelota de diferentes maneras" },
                    { id: "c_1924_3", texto: "Puede identificar en una imagen objetos conocidos" },
                    { id: "c_1924_4", texto: "Aún no distingue entre lo real y lo imaginario" },
                    { id: "c_1924_5", texto: "Reconoce nombres de algunas letras o números, pero no conoce realmente su significado" },
                    { id: "c_1924_6", texto: "Puede hacer rompecabezas de 5 a 10 piezas" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_1924_1", texto: "Dice mamá, papá o más de tres palabras" },
                    { id: "l_1924_2", texto: "Empieza a decir cosas con cambios de tonos y parece que está platicando con él mismo" },
                    { id: "l_1924_3", texto: "Usa verbos y adjetivos" },
                    { id: "l_1924_4", texto: "Se llama por su nombre o nene/nena" },
                    { id: "l_1924_5", texto: "Va perfeccionando su lenguaje, pero puede tener problemas con algunos fonemas e incluso tartamudear" },
                    { id: "l_1924_6", texto: "Establece un diálogo corto y sigue instrucciones de dos pasos" },
                    { id: "l_1924_7", texto: "Busca objetos o personas aunque no estén presentes" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_1924_1", texto: "Son más frecuentes las rabietas" },
                    { id: "se_1924_2", texto: "Se aleja gradualmente de su persona de confianza para realizar otras actividades" }
                ]
            }
        }
    },
    "25-36m": {
        nombre: "Peques de 2 a 3 años",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_2536_1", texto: "Dibuja círculos y líneas" },
                    { id: "mf_2536_2", texto: "Garabatea" },
                    { id: "mf_2536_3", texto: "Empieza a usar las tijeras" },
                    { id: "mf_2536_4", texto: "Copia figuras simples" },
                    { id: "mf_2536_5", texto: "Toma los cubiertos de forma correcta" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_2536_1", texto: "Corre" },
                    { id: "mg_2536_2", texto: "Patea la pelota" },
                    { id: "mg_2536_3", texto: "Aprende a montar el triciclo" },
                    { id: "mg_2536_4", texto: "Brinca con los dos pies juntos" },
                    { id: "mg_2536_5", texto: "Se mueve por debajo, encima y a través de los obstáculos" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_2536_1", texto: "Son capaces de conocer el círculo, cuadrado y triángulo" },
                    { id: "c_2536_2", texto: "Dibuja figuras con cabeza y cuerpo" },
                    { id: "c_2536_3", texto: "Puede distinguir entre tamaños" },
                    { id: "c_2536_4", texto: "Sabe su nombre, edad y sexo" },
                    { id: "c_2536_5", texto: "Tienen más conocimiento de reglas sociales" },
                    { id: "c_2536_6", texto: "Pueden recordar algunas letras" },
                    { id: "c_2536_7", texto: "Usa su imaginación al jugar" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_2536_1", texto: "Sabe el nombre de por lo menos 15 objetos" },
                    { id: "l_2536_2", texto: "Cambia constantemente de tema, pueden tener problemas para adquirir turnos en la conversación" },
                    { id: "l_2536_3", texto: "Cuenta una historia simple, aunque a veces se centra en una sola parte" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_2536_1", texto: "Se da la época del “¿por qué?”" },
                    { id: "se_2536_2", texto: "No saben cómo expresar sus emociones y se dan más los berrinches" }
                ]
            }
        }
    },
    "3-4a": {
        nombre: "Peques de 3 a 4 años",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_34_1", texto: "Escribe algunas letras" },
                    { id: "mf_34_2", texto: "Colorea sin salirse de la línea" },
                    { id: "mf_34_3", texto: "Copia su nombre con algunos errores" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_34_1", texto: "Mantiene el equilibrio en un pie" },
                    { id: "mg_34_2", texto: "Sube y baja las escaleras alternando los pies" },
                    { id: "mg_34_3", texto: "Salta en un sitio" },
                    { id: "mg_34_4", texto: "Empieza a reconocer las nociones espaciales más básicas (encima-debajo, delante-detrás, dentro-fuera, arriba-abajo, cerca-lejos, izquierda-derecha)" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_34_1", texto: "Cuenta e identifica del 1 al 10" },
                    { id: "c_34_2", texto: "Conoce el círculo, triángulo y cuadrado" },
                    { id: "c_34_3", texto: "Presta más interés por el dibujo" },
                    { id: "c_34_4", texto: "Puede utilizar una combinación de objetos con una secuencia coherente p ej., verde, amarillo, verde, amarillo" },
                    { id: "c_34_5", texto: "Clasifica y separa objetos de acuerdo con sus características" },
                    { id: "c_34_6", texto: "Usa adecuadamente objetos caseros" },
                    { id: "c_34_7", texto: "Al jugar actúa situaciones o representa roles" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_34_1", texto: "Reconoce las vocales" },
                    { id: "l_34_2", texto: "Conoce y usa entre 900 y 1000 palabras" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_34_1", texto: "Se despide y saluda con amabilidad" },
                    { id: "se_34_2", texto: "Expresa libremente sobre sí mismo, las cosas que le gustan, escuela, amigos, etc." },
                    { id: "se_34_3", texto: "Toma en cuenta a los demás" },
                    { id: "se_34_4", texto: "Empieza a respetar turnos" }
                ]
            }
        }
    },
    "4-5a": {
        nombre: "Peques de 4 a 5 años",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_45_1", texto: "Copia figuras complejas con ángulos" },
                    { id: "mf_45_2", texto: "Puede realizar juegos o actividades que requieren mayor precisión como manejar una cometa o un coche teledirigido, hacer determinadas manualidades como construcciones con plastilina, arena, cartón, figuras de origami" },
                    { id: "mf_45_3", texto: "Combina colores para obtener nuevos colores y tonalidades" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_45_1", texto: "Baila" },
                    { id: "mg_45_2", texto: "Corre evadiendo obstáculos" },
                    { id: "mg_45_3", texto: "Brinca en su lugar, hacia enfrente y en un pie" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_45_1", texto: "Cuenta e identifica del 1 al 20" },
                    { id: "c_45_2", texto: "Conoce el círculo, triángulo, cuadrado, rectángulo, óvalo y rombo" },
                    { id: "c_45_3", texto: "Perfecciona sus dibujos" },
                    { id: "c_45_4", texto: "Comienza escribir algunos números y letras" },
                    { id: "c_45_5", texto: "Puede identificar al menos 20 letras del abecedario" },
                    { id: "c_45_6", texto: "Puede comparar tamaños y pesos de algunos objetos" },
                    { id: "c_45_7", texto: "Puede asociar letras y sonidos para escribir palabras" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_45_1", texto: "Identifica vocales y más 5 consonantes" },
                    { id: "l_45_2", texto: "Es capaz de expresar algunas emociones y pensamientos" },
                    { id: "l_45_3", texto: "Usa la frase “yo puedo” cuando relata algo" },
                    { id: "l_45_4", texto: "Usa el lenguaje para resolver dudas" },
                    { id: "l_45_5", texto: "Puede escuchar cuentos más largos" },
                    { id: "l_45_6", texto: "Establece y mantienen una conversación con otra persona" },
                    { id: "l_45_7", texto: "Realiza preguntas cambiando la entonación" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_45_1", texto: "Muestra empatía hacia los demás" },
                    { id: "se_45_2", texto: "Disfruta los juegos que incluyen a varias personas" },
                    { id: "se_45_3", texto: "Tiene mayor autocontrol" },
                    { id: "se_45_4", texto: "Se involucra en actividades de grupo" },
                    { id: "se_45_5", texto: "Respeta las diferencias entre las personas" },
                    { id: "se_45_6", texto: "Empieza a aceptar cuando pierde o gana" }
                ]
            }
        }
    },
    "5-6a": {
        nombre: "Peques de 5 a 6 años",
        areas: {
            "motricidad_fina": {
                nombre: "Motricidad Fina",
                hitos: [
                    { id: "mf_56_1", texto: "Recorta figuras con líneas curvas" },
                    { id: "mf_56_2", texto: "Puede hacer dibujos de personas más definidas" },
                    { id: "mf_56_3", texto: "Puede cepillar sus dientes y cabello solo, desabrochar la ropa, lavarse cara y manos" },
                    { id: "mf_56_4", texto: "Utiliza herramientas, instrumentos y materiales en actividades que requieren de control y precisión en sus movimientos" },
                    { id: "mf_56_5", texto: "Cacha la pelota" },
                    { id: "mf_56_6", texto: "Puede vaciar líquidos de un contenedor a otro" },
                    { id: "mf_56_7", texto: "Usa recursos de las artes visuales en creaciones propias" }
                ]
            },
            "motricidad_gruesa": {
                nombre: "Motricidad Gruesa",
                hitos: [
                    { id: "mg_56_1", texto: "Puede saltar tras tomar impulso" },
                    { id: "mg_56_2", texto: "Produce sonidos al ritmo de la música con distintas partes del cuerpo, instrumentos y otros objetos" },
                    { id: "mg_56_3", texto: "Crea y reproduce secuencias de movimientos, gestos y posturas corporales con y sin música, individualmente y en coordinación con otros" },
                    { id: "mg_56_4", texto: "Corre y se detiene con mayor control" }
                ]
            },
            "cognitiva": {
                nombre: "Cognitiva",
                hitos: [
                    { id: "c_56_1", texto: "Cuenta e identifica del 1 al 100" },
                    { id: "c_56_2", texto: "Conoce todas las figuras en 2D Y 3D" },
                    { id: "c_56_3", texto: "Reproduce modelos con formas, figuras y cuerpos geométricos" },
                    { id: "c_56_4", texto: "Desea asumir más responsabilidades" },
                    { id: "c_56_5", texto: "Es capaz de resolver conflictos solo (con ayuda de las palabras)" },
                    { id: "c_56_6", texto: "Identifica algunas relaciones de equivalencia entre monedas de $1, $2, $5 y $10 en situaciones reales o ficticias de compra y venta" },
                    { id: "c_56_7", texto: "Reproduce esculturas y pinturas que haya observado" }
                ]
            },
            "lenguaje": {
                nombre: "Lenguaje",
                hitos: [
                    { id: "l_56_1", texto: "Conoce todo el abecedario" },
                    { id: "l_56_2", texto: "Cuenta con un vocabulario expresivo de 2600 palabras y entiende más de 20 000" },
                    { id: "l_56_3", texto: "Dice rimas, canciones, trabalenguas, adivinanzas y otros juegos del lenguaje" },
                    { id: "l_56_4", texto: "Tiene mayor interés por el lenguaje escrito y hablado" },
                    { id: "l_56_5", texto: "Disfruta inventar sus propias historias" },
                    { id: "l_56_6", texto: "Lee constantemente las palabras que se encuentra, muestra mucha curiosidad ante la lectura" }
                ]
            },
            "socioemocional": {
                nombre: "Socioemocional",
                hitos: [
                    { id: "se_56_1", texto: "Empieza a hacerse responsable de sus actos" },
                    { id: "se_56_2", texto: "Muestra una actitud cooperativa" },
                    { id: "se_56_3", texto: "Desempeña diferentes roles y genera vínculos con otros niños" },
                    { id: "se_56_4", texto: "Comunica emociones mediante la expresión corporal" },
                    { id: "se_56_5", texto: "Representa la imagen que tiene de sí mismo y expresa ideas mediante modelado, dibujo y pintura" },
                    { id: "se_56_6", texto: "Reconoce y nombra situaciones que le generan alegría, tristeza, miedo o enojo, y expresa lo que siente" },
                    { id: "se_56_7", texto: "Dialoga para solucionar conflictos y ponerse de acuerdo para realizar actividades en equipo" },
                    { id: "se_56_8", texto: "Realiza por sí mismo acciones de cuidado personal, se hace cargo de sus pertenencias y respeta las de los demás" },
                    { id: "se_56_9", texto: "Reconoce cuando alguien necesita ayuda y la proporciona" },
                    { id: "se_56_10", texto: "Habla de sus conductas y las de otros. Explica las consecuencias de algunas de ellas para relacionarse con otros" }
                ]
            }
        }
    }
};

window.CATALOGO_HITOS = CATALOGO_HITOS;
