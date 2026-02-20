/**
 * Módulo de Comunidad - Nannys y Peques
 * Centro de recursos, descuentos y noticias para familias y nannies.
 */

const Comunidad = {
    // Estado interno del módulo
    lastScrollPos: 0,
    estado: {
        inicializado: false,
        categoriaSeleccionada: null,
        datos: {
            articulos: [
                {
                    id: 1,
                    titulo: "Alimentación complementaria",
                    resumen: "La comida no debe sentirse como batalla. Aprende cómo iniciar la alimentación complementaria cuidando hábitos, seguridad, autorregulación y un ambiente emocional sano.",
                    imagen: "assets/img/articulos/alimentacion.jpg",
                    categoria: "Sensorial",
                    contenido: `
                        <p>La alimentación complementaria (AC) se considera un proceso por el cual se ofrecen al lactante alimentos sólidos o líquidos distintos de la leche materna (LM) o de una fórmula infantil como complemento y no como sustitución de esta.</p>
                        
                        <p>Asegurar una adecuada lactancia materna y alimentación complementaria, ayuda a prevenir tanto la desnutrición, las carencias de vitaminas y minerales, como la obesidad en las primeras etapas de la vida.</p>
                        
                        <p>La alimentación complementaria tiene como uno de sus objetivos el aporte de alimentos nutritivos, variados y suficientes, que respondan a las necesidades del lactante. Esta no debe seguir un esquema rígido,sino que debe tener en cuenta la variabilidad de cada niño/a, de tal forma que progresivamente vaya incorporando alimentos de todos los grupos al finalizar el primer año de vida.</p>
                        
                        <p>La principal razón para introducir la alimentación complementaria es que el régimen de lactancia materna exclusiva no cubre las necesidades de energía y nutrientes del lactante en el segundo semestre de vida. Luego del sexto mes de vida los requerimientos de energía y determinados nutrientes del bebé pasan a ser mayores a los aportados por la leche materna. La alimentación complementaria brinda los nutrientes necesarios para completar los requerimientos nutricionales, previniendo sus carencias y ayudando al adecuado desarrollo del sistema nervioso del niño o la niña.</p>

                        <h3>¿Cuánto tiempo se recomienda mantener la lactancia materna de forma exclusiva?</h3>
                        <p>Se recomienda mantener la lactancia materna (LM) de forma exclusiva durante los 6 primeros meses de edad y, a partir de ese momento, añadir de forma paulatina el resto de los alimentos, manteniendo la LM a demanda todo el tiempo que madre e hijo deseen.</p>

                        <h3>¿Por qué es importante esperar hasta alrededor de los 6 meses?</h3>
                        <p>Para poder ingerir alimentos diferentes a la leche, es conveniente que el organismo tenga la maduración necesaria a nivel neurológico, renal, gastrointestinal e inmune.</p>
                        
                        <p>Se considera que un bebé está preparado cuando adquiere las destrezas psicomotoras que permiten manejar y tragar de forma segura los alimentos. Como cualquier otro hito del desarrollo, no todos los niños lo van a adquirir al mismo tiempo, aunque en general estos cambios suelen ocurrir en torno al sexto mes.</p>
                        
                        <p>Se recomienda aumentar progresivamente la consistencia de los alimentos y comenzar con texturas grumosas y semisólidas lo antes posible, nunca más tarde de los 8-9 meses. A los 12 meses, el lactante ya puede consumir el mismo tipo de alimentos que el resto de la familia, aunque teniendo especial cuidado con los sólidos con riesgo de atragantamiento, como los frutos secos enteros, que deberán evitarse.</p>
                        
                        <div class="reading-note">
                            <strong>Se requiere:</strong>
                            <ul>
                                <li>Presentar un interés activo por la comida.</li>
                                <li>La desaparición del reflejo de extrusión (expulsión de alimentos no líquidos con la lengua).</li>
                                <li>Ser capaz de tomar comida con la mano y llevarla a la boca.</li>
                                <li>Mantener la postura de sedestación con apoyo (mantenerse sentado).</li>
                            </ul>
                        </div>

                        <h3>Riesgos de la introducción precoz (antes del cuarto mes) de la alimentación complementaria</h3>
                        <p><strong>A corto plazo:</strong></p>
                        <ul>
                            <li>Posibilidad de atragantamiento.</li>
                            <li>Aumento de gastroenteritis agudas e infecciones del tracto respiratorio superior.</li>
                            <li>Interferencia con la biodisponibilidad de hierro y zinc de la LM.</li>
                            <li>Sustitución de tomas de leche por otros alimentos menos nutritivos.</li>
                        </ul>
                        
                        <p><strong>A largo plazo:</strong></p>
                        <ul>
                            <li>Mayor riesgo de obesidad.</li>
                            <li>Mayor riesgo de eczema atópico.</li>
                            <li>Mayor riesgo de diabetes mellitus tipo 1.</li>
                            <li>Mayor tasa de destete precoz, con los riesgos añadidos que esto conlleva.</li>
                        </ul>
                        
                        <p>Por otro lado, en ocasiones puede ocurrir en niños que toman LM y que no han mostrado aún un interés activo por la comida, esta práctica es inadecuada. Se desaconseja demorar el inicio de la AC por encima de las 26 semanas de edad, ya que esto también puede aumentar el riesgo de problemas nutricionales, como el déficit de hierro.</p>

                        <h3>Riesgos de la introducción tardía de la alimentación complementaria:</h3>
                        <ul>
                            <li>Carencias nutricionales, sobre todo de hierro y zinc.</li>
                            <li>Aumento del riesgo de alergias e intolerancias alimentarias.</li>
                            <li>Peor aceptación de nuevas texturas y sabores.</li>
                            <li>Mayor posibilidad de alteración de las habilidades motoras orales.</li>
                        </ul>

                        <h3>Otros temas importantes:</h3>
                        <h4>Alergias:</h4>
                        <p>Alimentos que producen alergias con más frecuencia son:</p>
                        <ul>
                            <li>Proteína de la leche de vaca</li>
                            <li>Huevo (fundamentalmente la clara)</li>
                            <li>Melocotón, kiwi o fresa</li>
                        </ul>
                        <p>Una pauta apropiada es la de no introducir ningún alimento nuevo en la cena, ya que si se produce cualquier tipo de reacción adversa puede tomar a los padres durmiendo y, por ello, no ser conscientes.</p>
                        
                        <p>Por otro lado, como excepción y cuando su preparación sea en papilla, se evitarán verduras de hoja ancha (acelgas, espinacas, col, remolacha y nabo), porque estas verduras tienen altas concentraciones de nitratos que en los menores de 12 meses si se consumen en grandes cantidades pueden provocar una enfermedad que podría ser grave llamada metahemoglobinemia (síndrome del niño azul).</p>

                        <h3>Consumo de agua</h3>
                        <p>Se ha estimado que las necesidades de líquidos, para lactantes y peques de corta edad, oscilan de 8 a 24 onzas de agua por día. Aproximadamente hasta los seis meses de edad, esta cantidad deberá provenir de la leche materna o de fórmulas lácteas.</p>
                        
                        <h3>Fruta y verdura</h3>
                        <p>Se aconseja introducir progresivamente toda la variedad de frutas y verduras disponible, en cualquiera de las comidas diarias, e ir variando también la forma de presentación. No hay unas frutas mejores que otras para comenzar, la decisión dependerá de los gustos de la familia.</p>

                        <div class="reading-table">
                            <div class="rt-row"><span>0 a 6 meses</span> <span>Liquido/Colado</span></div>
                            <div class="rt-row"><span>a partir de 6 meses</span> <span>Pures</span></div>
                            <div class="rt-row"><span>a partir de 7 meses</span> <span>Papillas</span></div>
                            <div class="rt-row"><span>a partir de 8 meses</span> <span>Picado fino</span></div>
                            <div class="rt-row"><span>a partir de 9 meses</span> <span>Picado</span></div>
                            <div class="rt-row"><span>a partir de 12 meses</span> <span>Picado y en trocitos</span></div>
                            <div class="rt-row"><span>Edad preescolar</span> <span>Trozos</span></div>
                        </div>

                        <h3>Consumo de azúcares (Recomendaciones OMS):</h3>
                        <ul>
                            <li>Limitar el consumo de productos con elevado contenido en azúcares.</li>
                            <li>Reducir la ingesta de azúcares libres en adolescentes y niños mayores de 2 años a menos del 5% del consumo calórico total.</li>
                            <li>En menores de 2 años, se recomienda evitar los azúcares añadidos y libres.</li>
                            <li>Se recomienda no ingerir más de 25 g diarios de azúcar por persona.</li>
                        </ul>

                        <h3>Alimentación activa y perceptiva</h3>
                        <p>Respetar su ritmo de desarrollo y permitir cierta autonomía. Tolerar un cierto desorden apropiado para su edad. No interpretar como permanente un rechazo inicial a un nuevo alimento (pueden ser necesarias hasta 10-15 ocasiones para conseguir la aceptación).</p>
                        <p><strong>Los padres deciden dónde, cuándo y qué come el peque. El peque decide cuánto come.</strong></p>
                        
                        <div class="reading-note">
                            <strong>Establecer rutinas:</strong>
                            <ul>
                                <li>Lugar: tranquilo, sin distracciones (TV, móviles).</li>
                                <li>Tiempo: un horario aproximado, 4 o 5 tomas al día.</li>
                                <li>Menú: dieta variada y sana, raciones apropiadas.</li>
                            </ul>
                        </div>

                        <h3>Normas de seguridad (prevención de atragantamientos):</h3>
                        <ul>
                            <li>Para comer el bebé debe estar erguido, nunca recostado.</li>
                            <li>Nunca dejar al bebé sin supervisión.</li>
                            <li>Evitar alimentos de alto riesgo (frutos secos enteros, palomitas, uvas enteras, salchichas en rodajas, manzana/zanahoria cruda).</li>
                        </ul>
                    `
                },

                {
                    id: 2,
                    titulo: "💬 Cada conversación cuenta: lo que hoy haces puede abrirle el mundo del lenguaje a tu peque",
                    resumen: "El habla no se “enseña” con presión, se despierta con presencia. Este artículo te ayuda a entender qué impulsa el lenguaje, cuándo conviene pedir apoyo y cómo acompañar con pequeñas acciones diarias que hacen una gran diferencia, con amor y paciencia.",
                    imagen: "assets/img/articulos/2.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                        <h3>Factores que influyen en el desarrollo del habla</h3>

                        <p>El desarrollo del lenguaje en los peques comienza desde que nacen, se construye a través de la interacción y crece gracias a cada palabra, gesto y juego compartido. Cada peque tiene su propio ritmo, pero hay factores que influyen en cómo y cuándo aparecen los sonidos, las primeras palabras y las frases.</p>

                        <h3>¿Qué es el desarrollo del habla y el lenguaje?</h3>
                        <p>El habla es la producción de sonidos y palabras; el lenguaje incluye no solo hablar, sino también comprender lo que se escucha o se lee, usar palabras, estructurar frases y comunicarse con intención, ambos se apoyan en experiencias tempranas y en el entorno del peque.</p>

                        <div class="reading-note">
                        <p><strong>Factores principales que influyen en el desarrollo del habla</strong></p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>1.</strong></span><span><strong>Entorno lingüístico y variado</strong></span></div>
                        </div>
                        <p>Los peques necesitan escuchar y participar en conversaciones con adultos y otras personas importantes. Cuanto más modelado lingüístico tienen (palabras dirigidas a ellos, respuestas a sus sonidos, narración de actividades), más oportunidades tienen para desarrollar su vocabulario y comprensión del lenguaje.</p>
                        <div class="reading-note">
                        <p><strong>Tip:</strong> Recuerda mantener la comunicación con tu peque en cada momento de su rutina, ya que, esto potencia el reconocimiento de sonidos y palabras.</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>2.</strong></span><span><strong>Audición saludable</strong></span></div>
                        </div>
                        <p>Para aprender a hablar, es esencial escuchar primero, si hay infección recurrente de oído o pérdida auditiva, el peque podría no discriminar bien los sonidos del habla, lo cual retrasa la producción verbal.</p>
                        <div class="reading-note">
                        <p><strong>Tip:</strong> Si sospechas que el peque no oye bien (no reacciona a sonidos fuertes o no responde a su nombre con frecuencia), consulta con el pediatra o con un especialista en audición.</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>3.</strong></span><span><strong>Capacidades neurológicas y cognitivas</strong></span></div>
                        </div>
                        <p>El cerebro del peque está en desarrollo continuo; la memoria, atención y percepción juegan un papel importante para que pueda procesar, retener y usar nuevas palabras.</p>
                        <div class="reading-note">
                        <p><strong>Tip pedagógico:</strong> Juegos de atención (mirar, señalar, repetir) ayudan a fortalecer estas habilidades y promueven el uso del lenguaje.</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>4.</strong></span><span><strong>Interacción social</strong></span></div>
                        </div>
                        <p>Hablar no se aprende sólo escuchando, sino usándolo para relacionarse: pedir, preguntar, emocionarse y jugar.</p>
                        <div class="reading-note">
                        <p><strong>Tip:</strong> Organiza pequeñas “conversaciones” durante el día: pregunta “¿qué ves?”, espera la respuesta del peque (aunque sea un sonido), y responde tú también</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>5.</strong></span><span><strong>Estímulos lúdicos y educativos</strong></span></div>
                        </div>
                        <p>Actividades como leer cuentos, cantar canciones, jugar con sonidos-rimas, y usar gestos o señas cuando no se tiene el vocabulario completo ayudan al peque a comprender la relación entre sonidos y significados.</p>
                        <div class="reading-note">
                        <p><strong>Tip:</strong> Usa rimas simples y juegos de imitación de sonidos (como “bzz bzz” para la abeja).</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>6.</strong></span><span><strong>Apoyo emocional y paciencia</strong></span></div>
                        </div>
                        <p>Cada peque tiene su propio ritmo. Fomentar la confianza, responder con cariño y evitar presionar para “hacer hablar” puede dar al niño seguridad para expresarse cuando esté listo.</p>

                        <h3>Hitos generales del lenguaje.</h3>
                        <p>Los hitos ayudan como guía, pero recuerda, cada peque es único.</p>

                        <p>En el primer año, los peques pasan de balbucear a entender palabras simples; para los 2 años suelen decir combinaciones de palabras y para los 3 años su vocabulario y comprensión se expanden rápidamente.</p>

                        <h3>¿Cuándo podría ser útil consultar a un especialista?</h3>
                        <p>Existen algunas señales de alerta que pueden indicar que el peque necesita una evaluación profesional:</p>

                        <div class="reading-note">
                        <p><strong>Consulta con un profesional si:</strong></p>
                        <ul>
                            <li>A los 12–16 meses aún no hay balbuceo o intentos de comunicarse de forma consistente.</li>
                            <li>A los 18–24 meses, el vocabulario es muy escaso o el peque no combina dos palabras.</li>
                            <li>Entiende menos de lo esperado para su edad o parece tener dificultad con instrucciones simples.</li>
                            <li>Hay retrocesos en lo que ya había aprendido o dificultad con la interacción social.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <p><strong>Puedes consultar a un:</strong></p>
                        <ul>
                            <li>Pediatra, para descartar problemas de audición o salud general.</li>
                            <li>Fonoaudiólogo / logopeda, profesional especializado en evaluación del habla y lenguaje.</li>
                            <li>Especialista en desarrollo infantil, si hay preocupaciones más amplias.</li>
                        </ul>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Estrategias prácticas Estimulación en actividades diarias</strong></span></div>
                        </div>
                        <ul>
                        <li>Nombra lo que haces: “Vamos a poner tus zapatos”.</li>
                        <li>Usa frases completas incluso si el peque usa palabras simples.</li>
                        <li>Celebra cada intento de comunicación con entusiasmo y atención.</li>
                        </ul>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Uso de cuentos y juegos</strong></span></div>
                        </div>
                        <ul>
                        <li>Leer libros con ilustraciones.</li>
                        <li>Jugar con adivinanzas y rimas.</li>
                        <li>Repetir sonidos de animales o palabras divertidas.</li>
                        </ul>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Expansión del lenguaje</strong></span></div>
                        </div>
                        <ul>
                        <li>Si el peque dice “agua”, responde “Sí, agua fría para beber”.</li>
                        <li>Añade palabras a lo que dice: esto refuerza la estructura y vocabulario.</li>
                        <li>Juegos de roles (cocina, tienda, médico) ayudan a practicar el vocabulario en contextos familiares</li>
                        </ul>

                        <h3>Referencias</h3>
                        <p>NIDCD. (2017). Etapas del desarrollo del habla y del lenguaje (NIH). https://www.nidcd.nih.gov/es/espanol/etapas-del-desarrollo-del-habla-y￾el-lenguaje?utm_source</p>
                        <p>ChildMind.org. (s. f.). Guía para padres sobre hitos del desarrollo. https://childmind.org/es/guia/guia-para-padres-sobre-hitos-del￾desarrollo/?utm_source</p>
                        <p>Hunter Magazine. (s. f.). Cómo abordar las preocupaciones sobre el desarrollo del habla y el lenguaje. https://www.huntermagazine.es/como￾abordar-las-preocupaciones-sobre-el-desarrollo-del-habla-y-el￾lenguaje/7517/?utm_source</p>
                        <p>Linguistica.gea.lat. (s. f.). Estimulando el lenguaje infantil: consejos y técnicas eficaces.https://linguistica.gea.lat/estimulando-el-lenguaje-infantil￾consejos-y-tecnicas-eficaces/?utm_source</p>
                    `
                },


                {
                    id: 3,
                    titulo: "¿Cómo fomentar la lectura en peques?",
                    resumen: "Estrategias sencillas y prácticas para que la lectura sea un momento divertido, afectivo y constante en casa.",
                    imagen: "assets/img/articulos/lectura.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                    <p><strong>La lectura</strong> es una de las herramientas más poderosas para el desarrollo de los peques. Leer en voz alta desde temprana edad estimula el <strong>lenguaje</strong>, la <strong>memoria</strong> y la <strong>concentración</strong>, además de ser una inversión para el futuro, ayudando a que se conviertan en lectores activos.</p>

                    <div class="reading-note">
                    <strong>✨ Idea clave:</strong>
                    <p style="margin:10px 0 0 0;">La lectura compartida es como un abrazo hecho de cuentos: crea conexión, seguridad emocional y tiempo de calidad.</p>
                    </div>

                    <p>Hoy en día nos enfrentamos a un reto: a los peques no siempre les interesa leer. Prefieren pantallas, se aburren rápido con los libros o ven la lectura como tarea escolar. Esta falta de motivación puede afectar su vocabulario, comprensión y rendimiento académico en el futuro.</p>

                    <h3>¿Por qué acompañarlos durante la lectura?</h3>
                    <p>Cuando un adulto acompaña, los peques no solo aprenden palabras nuevas: también viven un momento de cariño y confianza. En nuestras manos está cambiar la percepción de “leer = obligación” por “leer = aventura”.</p>

                    <div class="reading-note">
                    <strong>🧡 Enfoque recomendado:</strong>
                    <ul>
                        <li><strong>Paciencia</strong> (sin presiones).</li>
                        <li><strong>Juego</strong> (voces, dramatización, sonidos).</li>
                        <li><strong>Interés</strong> (historias que de verdad les gusten).</li>
                    </ul>
                    </div>

                    <h3>Estrategias prácticas y sencillas para implementar la lectura</h3>

                    <div class="reading-table">
                    <div class="rt-row"><span>1) Empezar temprano y sin presiones</span> <span>Vínculo + interés</span></div>
                    <div class="rt-row"><span>2) Hacer de la lectura un juego</span> <span>Voces, canciones, escenas</span></div>
                    <div class="rt-row"><span>3) Crear un espacio acogedor</span> <span>Rincón especial</span></div>
                    <div class="rt-row"><span>4) Seguir sus intereses</span> <span>Temas favoritos</span></div>
                    <div class="rt-row"><span>5) Dar el ejemplo</span> <span>Modelaje</span></div>
                    <div class="rt-row"><span>6) Música e historias orales</span> <span>Historias en todas partes</span></div>
                    </div>

                    <h3>1) Empezar temprano y sin presiones</h3>
                    <p>Aunque un bebé no entienda las palabras, escuchar tu voz leyendo fortalece el vínculo y despierta su interés por los sonidos del lenguaje.</p>

                    <h3>2) Hacer de la lectura un juego</h3>
                    <p>Evita que se sienta como tarea escolar: usa voces divertidas, canta fragmentos, haz sonidos de animales o actúa escenas.</p>

                    <h3>3) Crear un espacio acogedor</h3>
                    <p>Un rincón con cojines, mantitas y libros a su alcance convierte la lectura en un momento especial. El ambiente importa tanto como la historia.</p>

                    <h3>4) Seguir los intereses de los peques</h3>
                    <p>Si les gustan dinosaurios, princesas o superhéroes, elige cuentos de esos temas. Cuando el contenido conecta con su mundo, el amor por los libros aumenta.</p>

                    <h3>5) Dar el ejemplo</h3>
                    <p>Los peques aprenden más de lo que ven que de lo que les decimos. Si te ven leyendo por gusto (revista, cuento, novela corta), entenderán que leer es natural y valioso.</p>

                    <h3>6) Complementar con música e historias orales</h3>
                    <p>Contar cuentos inventados, cantar canciones o usar audiocuentos fortalece memoria y comprensión. Así descubren que las historias están en todas partes, no solo en los libros.</p>

                    <h3>Otras estrategias pedagógicas para implementar</h3>
                    <ul>
                    <li><strong>Lectura dialógica:</strong> detenerse a conversar sobre lo que pasa, hacer preguntas, pedir predicciones y relacionarlo con experiencias del peque.</li>
                    <li><strong>Círculos de lectura / “hora del cuento”:</strong> involucrar a la familia; cada quien lee una parte y luego hacen una actividad artística (dibujo, dramatización, canción).</li>
                    <li><strong>Apoyos visuales:</strong> imágenes, pictogramas, tarjetas de palabras clave o marionetas que acompañen el relato.</li>
                    <li><strong>Tecnología responsable:</strong> audiocuentos, libros digitales o apps interactivas (subrayar, escuchar voces, grabar su propia lectura).</li>
                    </ul>

                    <div class="reading-note">
                    <strong>🎨 Ideas “extra” para volverlo súper divertido</strong>
                    <ul>
                        <li><strong>Escritura creativa:</strong> inventar un final alternativo o un personaje nuevo.</li>
                        <li><strong>Lectura multisensorial:</strong> leer una receta y cocinar, leer sobre naturaleza y salir a observar, leer sobre colores y luego pintar.</li>
                        <li><strong>Gamificación:</strong> ruletas de preguntas, búsqueda del tesoro con pistas en cuentos, retos de “lee y gana estrellas”.</li>
                    </ul>
                    </div>

                    <h3>Cierre</h3>
                    <p>Fomentar la lectura no es obligar, es acompañar con paciencia y creatividad. Cuando la lectura se vuelve juego, cariño y experiencia cotidiana, los peques descubren que los libros abren un mundo de posibilidades y aprendizajes.</p>
                    <p>Con estrategias sencillas podemos sembrar el gusto por leer. Lo más importante es respetar su ritmo e intereses: no todos leerán al mismo tiempo ni con el mismo entusiasmo. La clave está en acompañar, motivar y celebrar cada pequeño avance.</p>

                    <div class="reading-note">
                    <strong>📚 Bibliografía (referencias del documento)</strong>
                    <ul>
                        <li>OEI &amp; Ministerio de Educación Pública de Costa Rica (2020). Recursos digitales para la promoción de la lectura en la primera infancia.</li>
                        <li>Andújar, J. (2017). 129 estrategias de promoción y animación a la lectura.</li>
                        <li>DGB (2011). Fichero de actividades de fomento a la lectura en bibliotecas.</li>
                        <li>SEP (2013). Fomento a la lectura en educación preescolar y primaria.</li>
                        <li>Ministerio de Educación de Ecuador (2019). Guía metodológica para desarrollar el gusto por la lectura.</li>
                    </ul>
                    </div>
                `
                },

                {
                    id: 4,
                    titulo: "Impulsa la motivación de tu peque",
                    resumen: "Descubre cómo acompañar a tu peque para que encuentre su propia motivación. Estrategias sencillas para fomentar su curiosidad, autonomía y entusiasmo por aprender, respetando su ritmo y fortaleciendo su confianza.",
                    imagen: "assets/img/articulos/motivacion.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <p><strong>La motivación</strong> es la fuerza que nos mueve; nos invita a explorar, a actuar y a descubrir. En los peques la motivación es especialmente importante, porque se encuentran en sus <strong>primerasfases</strong> del aprendizaje.</p>

                        <div class="reading-note">
                        <strong>💡 Pero ¿qué tipos de motivación existen y cómo desarrollarlos en los más pequeños?</strong>
                        </div>

                        <p>Todos necesitamos motivación para hacer las cosas, tanto los peques como los adultos. Esta se define como el conjunto de fuerzas que inician y dirigen la conducta humana; son nuestras pasiones, aquello que nos mueve, nuestro motor interno, y, en definitiva, aquello que nos lleva a actuar.</p>

                        <p>El objetivo de la motivación es delimitar qué motivos tenemos las personas cuando realizamos determinadas conductas, y por qué las hacemos en determinadas situaciones y no en otras.</p>

                        <div class="reading-note">
                        <strong>✨ En los más pequeños</strong>
                        <p style="margin:10px 0 0 0;">En los más pequeños, la motivación es especialmente importante, porque les impulsa a aprender, a descubrir, a explorar. Por ello estan importante acompañarlos en este proceso de descubrimiento y de potenciación de su motivación.</p>
                        </div>

                        <p>Por lo tanto, encontramos diferentes tipos de motivación, aunque a grandes rasgos, podemos hablar de dos grandes tipos de motivación que nos llevan a actuar: la <strong>intrínseca</strong> y la <strong>extrínseca</strong>.</p>

                        <h3>Motivación intrínseca</h3>
                        <p>La motivación intrínseca se caracteriza porque la persona realiza la tarea o actividad en cuestión por el simple placer de realizarla. Así, la actividad es un fin en sí mismo, y su realización permite a la persona sentirse autónoma y competente.</p>

                        <div class="reading-note">
                        <strong>🎨 Ejemplo</strong>
                        <p style="margin:10px 0 0 0;">Un ejemplo de motivación intrínseca en los peques sería el hecho de dibujar por el mero placer de hacerlo; lo que proporciona placer o disfrute aquí es la acción de dibujar.</p>
                        </div>

                        <p>No se dibuja para conseguir algo, por ejemplo, un premio, sino porque se disfruta haciéndolo. Otro ejemplo: jugar por el mero placer de jugar.</p>

                        <h3>Motivación extrínseca</h3>
                        <p>La motivación extrínseca, o motivación por incentivos, por contra, se caracteriza porque la persona realiza una actividad en cuestión para obtener unas consecuencias que se derivan de su realización. De esta forma, la tarea es un medio para lograr un fin. Por ejemplo, hacer los deberes porque se sabe que después hay un tiempo de juego, o estudiar para sacar buenas notas</p>

                        <div class="reading-note">
                        <strong>🧩 Autoconocimiento</strong>
                        <p style="margin:10px 0 0 0;">Hablamos de ayudar a nuestro peque a conocerse mejor a sí mismo. ¿Cómo podemos hacerlo? Animándole y acompañándole en el proceso de conocer sus propios gustos, preferencias, hobbies. Estimular su autoconocimiento abrirá su abanico de posibilidades a la hora escoger las actividades que le gustan. Si consigue identificar qué actividades le gustan y cuáles no, estará un poco más cerca de estimular su propia motivación (sobre todo intrínseca).</p>
                        </div>

                        <p><strong>¿Por qué?</strong> Porque encontrará cosas con las que disfruta solo por el mero hecho de hacerlas.</p>

                        <p>Además, también podrá empezar a conocer qué cosas se le dan bien y por qué es importante esforzarse para obtener aquello que desea.</p>

                        <h3>Anímalo a explorar</h3>
                        <p>En línea con el punto anterior, sabemos que la exploración permite a los peques conocerse mejor a sí mismos y, sobre todo, conocer qué les gusta y qué no. Por ello, acompáñalo a explorar, no le límites. Anímale a probar cosas nuevas, ya sea actividades, diferentes tipos de música, nuevos alimentos. Todo ello favorecerá su autoconocimiento y también su capacidad de entusiasmarse por sí mismo.</p>

                        <div class="reading-note">
                        <strong>⭐ Si disfruta con algo, no le ofrezcas un incentivo externo</strong>
                        <p style="margin:10px 0 0 0;">Esta idea clave nos sirve para estimular la motivación intrínseca. Hay una teoría en psicología, demostrada a través de investigaciones, que dice que nuestra motivación intrínseca disminuye cuando, haciendo algo que nos gusta, nos premian por ello.</p>
                        </div>

                        <p>Por ejemplo (y esto se demostró en un estudio), si a un peque le encanta dibujar, y lo hace porque le gusta, y de repente empezamos a premiarlo (por ejemplo, con un regalo) por hacerlo, su motivación intrínseca disminuirá y aumentará su motivación extrínseca.</p>

                        <p>Es decir, empezará a dejar de dibujar si no tiene ese premio externo, porque ya lo está esperando. Por ello, es importante que si detectamos que nuestro peque disfruta haciendo algo "porque sí" (por el mero disfrute de la actividad), no interfiramos en esa motivación, premiándole "desde fuera", aunque sí podemos animarle a seguir con su hobbie.</p>

                        <h3>Promueve su diversión</h3>
                        <p>Promover la diversión en los niños, ya sea leyendo, jugando, aprendiendo... nos ayudará a que su motivación, realizando la tarea en cuestión, aumente. Y es que, el hecho de conectar con alguna actividad a través de la risa y la diversión hace que el interés por dicha actividad también aumente.</p>

                        <div class="reading-note">
                        <strong>😄 Por ello</strong>
                        <p style="margin:10px 0 0 0;">Por ello, intenta que las actividades en las que tu peque muestra interés sean divertidas para él y le aporten esa dosis de alegría que mejorará también su motivación.</p>
                        </div>

                        <h3>Capta su interés a través de la curiosidad</h3>
                        <p>La curiosidad engloba aquellas conductas instintivas que nos animan a explorar, a investigar, a saber, más y <strong>porsupuesto</strong>, a aprender.</p>

                        <p>En los niños, promover su curiosidad, despertando su interés por las cosas, nos ayuda a fomentar su motivación, ya que de esta forma estarán más dispuestos a hacer o a descubrir aquellas cosas que les llaman la atención.</p>

                        <h3>Anímalo a que encuentre su propia motivación</h3>
                        <p>No hay nada que nos motive más a las personas que el hecho de encontrar, por nosotros mismos, esa fuente de motivación.</p>

                        <p>Por ello, es importante que acompañes a tu peque, no solamente en el descubrimiento de sus intereses y pasiones, sino en lo que hay tras todo ello: su motivación más primaria, aquel motor que les invita a moverse, a buscar, a conocer.</p>

                        <h3>Diversión fuera de casa</h3>
                        <p>Busca posibilidades de mantenerse activo fuera de su casa, como atrapar la pelota, jugar con pelotas y bates de plástico, bailar y dar volteretas. Y todavía les encanta jugar al "Huevo podrido", "Víbora del mar", o "Simón dice".</p>

                        <h3>Tiempo libre</h3>
                        <p>El juego libre activo significa que el niño escoge la actividad y decide qué hacer; siempre dentro de un entorno seguro y supervisado. Esto podría incluir explorar el jardín, correr en el parque o montar en triciclo.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>Limitar el tiempo delante de una pantalla.</span> <span>⏱️</span></div>
                        <div class="rt-row"><span>Mantén la diversión.</span> <span>🎈</span></div>
                        <div class="rt-row"><span>Supervisa de cerca.</span> <span>👀</span></div>
                        </div>

                        <h3>Limitar el tiempo delante de una pantalla.</h3>

                        <h3>Mantén la diversión.</h3>
                        <p>Ayuda a tu peque a buscar actividades que le agraden y después dale la oportunidad de disfrutar de ellas. Ten a mano balones y equipos deportivos apropiados para su edad.</p>

                        <h3>Supervisa de cerca.</h3>
                        <p>En ocasiones, las habilidades físicas de los niños (como trepar hasta lo más alto de un juego del parque) suelen superar su capacidad de determinar qué es seguro y qué es peligroso. Del mismo modo, es posible que no se den cuenta de cuándo es el momento de tomarse un descanso en un día caluroso.</p>

                        <div class="reading-note">
                        <strong>✅ Seguridad primero</strong>
                        <p style="margin:10px 0 0 0;">Por lo que, una parte importante de ayudar a los niños a divertirse al aire libre es asegurarnos de que estén seguros; por lo tanto, no pierdas de vista a tu peque.</p>
                        </div>

                        <h3>Referencias:</h3>
                        <ul>
                        <li>Gavin, M. (marzo de 2022). Motivar a los niños en edad preescolar para que se mantengan activos. Kids Health. Disponible en: https://kidshealth.org/es/parents/active-preschooler.html</li>
                        <li>Ruíz, L.(2 de noviembre de 2021). Dostipos de motivación y cómo estimularla en los más pequeños. Bebés y más. Disponible en: https://www.bebesymas.com/educacioninfantil/dos tipos-motivacion-como- estimularlos-pequenos</li>
                        </ul>
                    `
                },

                {
                    id: 5,
                    titulo: "Cuando la ira aparece: acompaña a tu peque sin miedo 💛",
                    resumen: "La ira no es ‘mala’: es una emoción que necesita guía. Aprende por qué aparece, cómo se manifiesta y qué herramientas prácticas pueden ayudar a tu peque a calmarse, expresarse y sentirse seguro.",
                    imagen: "assets/img/articulos/abc.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <p>Hoy en día podemos definir a las emociones como respuestas complejas a estímulos internos o externos que implican una coordinación de sistemas psicológicos, fisiológicos y comportamentales; las emociones no solo son fenómenos internos, sino también procesos socialmente construidos y culturalmente influenciados que desempeñan un papel fundamental en la vida de los peques.</p>

                        <p>Bisquerra (2009) explica que dentro de las emociones positivas se pueden incluir: la alegría, el orgullo, el interés, la felicidad, el amor, la sorpresa, el afecto, etc.; y entre las negativas se consideran: la culpa, el miedo, la ansiedad, la ira, los celos, la vergüenza, y la tristeza, entre otras. Cabe destacar que en la actualidad también se han añadido las emociones neutras, como lo son la sorpresa o la compasión. Cabe mencionar que no porque exista esta clasificación significa que las emociones son buenas o malas, al contrario, es necesario experimentarlas todas para saber cómo actuar o reaccionar ante ciertas situaciones.</p>

                        <h3>¿Qué es la ira?</h3>
                        <p>La ira se define como una respuesta emocional intensa ante la percepción de una amenaza, injusticia o frustración y es considerada como una de las emociones básicas como mecanismo adaptativo que prepara al organismo para enfrentar y superar obstáculos en el entorno.</p>

                        <div class="reading-note">
                        <strong>🧠 Tres maneras de afrontar la ira</strong>
                        <p style="margin:10px 0 0 0;">Spielberger (1999) nombra tres maneras distintas de afrontar la ira: la ira hacia dentro, la ira hacia fuera y el control de la ira.</p>
                        </div>

                        <ol>
                        <li>La manera más común en los peques es mostrar la ira hacia fuera, es decir, expresar su frustración y rabia hacia otras personas u objetos que consideran culpables de esa situación.</li>
                        <li>La ira hacia dentro eslo contrario, el peque no expresa su emoción hacia el objeto o persona que ha causado su irritación, sino que afronta la ira enfadándose consigo mismo. Ésta es menos común en la infancia.</li>
                        <li>Por último, el control de la ira se basa en intentar que los demás no aprecien los “aspectos relativos a la expresión de la ira”.</li>
                        </ol>

                        <h3>Los ataques de ira en los peques pueden ser causados por múltiples factores:</h3>
                        <ul>
                        <li><strong>Frustración:</strong> cuando el peque no logra satisfacer sus deseos o necesidades, especialmente si no tiene habilidades suficientes para comunicar sus emociones.</li>
                        <li><strong>Fatiga o falta de sueño:</strong> la falta de descanso puede aumentar la irritabilidad. Si el peque tiene problemas para dormir, puedes consultar el artículo de “el sueño” que se encuentra en nuestra carpeta de drive.</li>
                        <li><strong>Problemas para controlar las emociones:</strong> algunos peques tienen dificultades para gestionar sussentimientos de una forma adaptativa.</li>
                        <li><strong>Ambiente familiar:</strong> un entorno familiar conflictivo o poco estable puede contribuir a la aparición de ataques de ira.</li>
                        <li><strong>Condiciones médicas o neuropsicológicas:</strong> algunos trastornos del neurodesarrollo, como el autismo, pueden estar asociados con problemas de regulación emocional. En los niños de 3 a 4 años los episodios de ira son comunes debido a la limitación en su capacidad para expresar y regular sus emociones.</li>
                        </ul>

                        <div class="reading-note">
                        <strong>💛 Acompañamiento</strong>
                        <p style="margin:10px 0 0 0;">La mayoría de los episodios de ira disminuyen con la edad y la adquisición de habilidades emocionales, pero es fundamental proporcionarles herramientas adecuadas para manejarlos, así como prevenir o anticipar la aparición de estos episodios.</p>
                        </div>

                        <h3>Para ayudar a los peques a manejar la ira de manera efectiva, se pueden aplicar técnicas como:</h3>
                        <ul>
                        <li><strong>Validar sus emociones:</strong> reconocer lo que sienten “entiendo que estés enfadado” les ayuda a sentirse comprendidos y disminuye su frustración.</li>
                        <li><strong>Enseñar habilidades de regulación emocional:</strong> actividades como la respiración profunda o la cuenta regresiva les proporcionan herramientas concretas para calmarse.</li>
                        <li><strong>Modelar conductas calmadas:</strong> los peques aprenden observando a los adultos; actuar de manera tranquila y evitar responder con ira es clave.</li>
                        <li><strong>Crear un espacio seguro para calmarse:</strong> un rincón tranquilo donde puedan relajarse y realizar actividades que les ayuden a relajarse.</li>
                        </ul>

                        <h3>Algunas actividades que se pueden implementar son:</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Actividad 1: Rueda de las emociones</strong></span> <span>🎡</span></div>
                        <div class="rt-row"><span><strong>Actividad 2: Baile de la calma</strong></span> <span>💃</span></div>
                        <div class="rt-row"><span><strong>Actividad 3: Pintura con emociones</strong></span> <span>🎨</span></div>
                        <div class="rt-row"><span><strong>Actividad 4: Caja de herramientas emocionales</strong></span> <span>🧰</span></div>
                        <div class="rt-row"><span><strong>Actividad 5: Relajación con masajes</strong></span> <span>🤲</span></div>
                        </div>

                        <p><strong>Actividad 1: Rueda de las emociones:</strong> La rueda de las emociones es una actividad diseñada para ayudar a los peques de cuatro años a comprender y expresar sus sentimientos de manera interactiva. Se lleva a cabo proporcionando un espacio seguro y colaborativo en donde se comenzará a enseñar algunas de las emociones primarias con el fin de que los peques las vayan conociendo y comiencen a identificarlas.</p>

                        <p><strong>Actividad 2: Baile de la calma:</strong> El baile de la calma es una actividad diseñada para ayudar a los peques a gestionar sus emociones de manera saludable, especialmente cuando experimentan sentimientos de enfado o frustración. Esta actividad se basa en la idea de que el movimiento corporal puede ser una herramienta efectiva para liberar la tensión emocional y promover la relajación. Al proporcionar un entorno seguro y apoyado, los peques tienen la oportunidad de expresarse libremente y encontrar su paz interior a través del baile.</p>

                        <p><strong>Actividad 3: Pintura con emociones:</strong> La presente actividad ofrece a los peques la oportunidad de expresar sus sentimientos a través del arte. Al proporcionar un espacio seguro, pueden explorar y trabajar sus emociones de manera creativa, utilizando colores y formas para representar sus propias experiencias o sentimientos. Esta actividad fomenta el autoconocimiento emocional y la expresión saludable de los sentimientos, promoviendo el desarrollo socioemocional en su entorno.</p>

                        <p><strong>Actividad 4: Caja de herramientas emocionales:</strong> La actividad de la caja de herramientas emocionales se centra en la creación de un recurso personalizado para que los peques gestionen sus emociones, especialmente la ira. Esta actividad busca proporcionar una forma tangible y práctica de acceder a herramientas efectivas para calmarse y regular sus sentimientos en los momentos que manifiestan esas emociones, algunos de los objetos que podemos introducir son: globos sensoriales, botella de la calma,almohada de los gritos,pelotitas antiestrés etc.</p>

                        <p><strong>Actividad 5: Relajación con masajes:</strong> tiene como objetivo enseñar a las peques técnicas simples de masaje para ayudarles a relajarse cuando experimentan emociones intensas. Esta actividad promueve el cuidado y la empatía, al mismo tiempo que les proporciona una herramienta práctica para manejar su ira de manera efectiva.</p>

                        <h3>Referencia</h3>
                        <p>Loureda, A. (2017). Los cuentos como recurso para trabajar la ira en educación infantil.(Tesisparaobtenerel gradodemaestro)Universidadde Cantabria. https://repositorio.unican.es/xmlui/bitstream/handle/10902/11790/MorenoLouredaAinara.pdf?sequence=1&isAllowed=y</p>
                        <p>Martín, B (2024). Estrategias de gestión y control de la ira en Educación Infantil: una propuesta educativa. Universidad de Valladolid. https://uvadoc.uva.es/bitstream/handle/10324/75438/TFG-O2848.pdf?sequence=1&isAllowed=</p>
                        <p>Zambrano, Y. Lázaro, V. (2023). El desarrollo de la inteligencia emocional para afrontar problemas psicosociales en niños preescolares. Dilanet 8 (1) 602-63. https://dialnet.unirioja.es/servlet/articulo?codigo=9263620</p>
                    `
                },

                {
                    id: 6,
                    titulo: "Vincular con tu bebé: el amor que le da seguridad 🤍",
                    resumen: "El apego seguro se construye en lo cotidiano: miradas, caricias, rutinas y presencia. Descubre cómo fortalecer ese vínculo que le dará confianza, calma y bases emocionales para toda la vida.",
                    imagen: "assets/img/articulos/vinc.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <h3>¿Cómo vincular con mi bebé?</h3>
                        <p><strong>Bebés de 0 a 1 año 6 meses</strong></p>

                        <p>El vínculo afectivo, también conocido como apego seguro, es la conexión emocional que se establece entre el bebé y sus cuidadores principales. Este vínculo proporciona al bebé una sensación de seguridad y confianza, lo que es esencial para su desarrollo emocional y social.</p>

                        <p>Bowlby desarrolla una teoría de gran relevancia para comprender las maneras en que los niños viven sus vínculos con los seres que les rodean, y la manera en que muestran sus estructuras de adaptación a los contextos, según Bowlby (1969) sugiere que el apego es un sistema comportamental innato, propio de los seres humanos, se activa en situaciones de amenaza o aflicción y tiene la finalidad de recuperar el bienestar a través de comportamientos destinados a recibir apoyo, cuidado y protección del cuidador primario.</p>

                        <div class="reading-note">
                        <strong>✨ El apego se forma a raíz de los cuidados cotidianos</strong>
                        <p style="margin:10px 0 0 0;">Para Bowlby el apego conforma un sistema de regulación guida entre el cuidador y el bebé, siendo necesaria la presencia y disponibilidad del cuidador, ya que dependiendo de las experiencias repetidas ya sean positivas o negativas, el bebé desarrollará una serie de representaciones mentales acerca de la naturaleza de la relación con su figura de apego y acerca de su propia existencia, la formación de este es todo un proceso, no es algo que se dé de forma inmediata o que solo pueda ocurrir en determinado período de tiempo, puesto que el apego surge a raíz de los cuidados cotidianos.</p>
                        </div>

                        <p>Durante los primeros meses, el bebé comienza a formar este vínculo a través de las interacciones diarias, como el contacto físico, las caricias, la alimentación, el juego y la respuesta a sus necesidades. Asimismo, la estimulación temprana juega un papel muy importante en el desarrollo de los bebés, ya que, se convierte en una herramienta poderosa para fortalecer este lazo afectivo, promoviendo la interacción positiva y cercana entre el bebé y sus cuidadores.</p>

                        <h3>Las primeras interacciones de los bebés son mediante:</h3>
                        <ol>
                        <li><strong>El tacto:</strong> es una de las primeras formas de comunicarse de los bebés, a través de él los bebés responden al contacto piel con piel favoreciendo el crecimiento y desarrollo saludable.</li>
                        <li><strong>El contacto ocular:</strong> proporciona una comunicación significativa a corta distancia.</li>
                        <li>El seguimiento de objetos en movimiento con la vista.</li>
                        <li>Imitando desde temprana edad expresiones faciales y gestos de sus padres.</li>
                        </ol>

                        <h3>John Bowlby identificó tres patrones básicos de apego en la infancia:</h3>
                        <ul>
                        <li><strong>Apego seguro:</strong> el bebé muestra confianza ya que sabe que su cuidador principal está cerca, por lo tanto, explora a su alrededor seguro de lo que hace y se relaciona sin dificultad con extraños. Cuando sean adultos, desarrollarán relaciones con las personas de forma sana y tranquila.</li>
                        <li><strong>Apego evitativo:</strong> el bebé trata a su madre o cuidador igual que a un extraño, es decir, la ignora y evita mostrar poca o ninguna ansiedad cuando se marcha o cuando regresa. Este apego se presenta en bebés que no tienen satisfechas sus necesidades básicas y tienen que valerse por sí mismos, por lo tanto, de adultos, pueden ser personas que se relacionen pensando que no necesitan ayuda de nadie para salir adelante.</li>
                        <li><strong>Apego ambivalente o resistente:</strong> el bebé manifiesta mucha ansiedad cuando su madre o cuidador no está, llegando a pensar que lo han abandonado, pero cuando regresa se muestra resentido y no hay manera de calmarlo. En realidad, lo que siente es que su madre no está para cubrir sus necesidades y por eso cuando regresa siente que ya no confía en ella mostrándose resentido y enfadado. Cuando sea adulto tendrá miedo a ser abandonado, a que sus relaciones se terminen y como consecuencia evitará vincularse muchocon los demás para no sufrir nisentir dolor.</li>
                        </ul>

                        <h3>Algunas formas para crear un vínculo con tu bebé son a través de:</h3>
                        <ul>
                        <li><strong>Disponibilidad y sensibilidad:</strong> el bebé tiene que saber que estás disponible pase lo que pase. Saber interpretar lo que necesita y responder de manera satisfactoria a sus necesidades es clave.</li>
                        <li><strong>Permanecer cerca del bebé:</strong> esto favorece el apego, por este motivo se fomenta el contacto piel con piel. El bebé necesita percibir tu cariño, sintiéndose seguro y protegido. Por lo que, se recomienda evitar las separacioneslargas durante los primeros meses de vida.</li>
                        <li><strong>Manifestar expresividad:</strong> los bebés perciben las emociones por eso intenta ser expresiva cuando abrazas, acaricias, haces reír o consuelas a tu bebé. Los gestos son muy importantes por eso sonreír o hablarles a los bebés cuando te diriges a ellos es muy importante.</li>
                        <li><strong>Tomarlo en brazos:</strong> así se va familiarizando con tu olor y caricias, ya que le transmitsamor,serenidad, bienestar y seguridad.</li>
                        <li><strong>Mirarlo:</strong> a las semanas de nacido, el bebé va viendo con más claridad a corta distancia, pero a los dos meses empezará a ver con nitidez, aunque esté más lejos y eso le encanta. A los bebés les gusta mirarte y explorar tu cara y tocarte.</li>
                        <li><strong>Evitar la sobreprotección:</strong> una cosa es fomentar el vínculo emocional y otra sobreprotegerlo, además esto afecta al desarrollo del bebé. Deja a tu bebé que explore lo que hay a su alrededor, fomenta su autonomía para que se dé cuenta de las cosas que puede hacer sin tu ayuda pero que sepa que estás cerca para apoyarlo cuando lo necesite.</li>
                        <li><strong>Háblale cariñosamente:</strong> cantar y hablar de forma dulce y cariñosa es muy bueno porque le ayuda a percibir los sentimientos y emociones que transmiten tus palabras.</li>
                        <li><strong>Aprovecha las rutinas para mostrarle tu cariño:</strong> el día está lleno de rutinas, el baño, la comida, la hora de vestirse, el paseo, etc. Demuéstrale en todos esos momentos tu cariño y cuánto lo quieres. Es fundamental que se sienta muy querido.</li>
                        <li><strong>Ten expectativas adecuadas a su nivel de desarrollo:</strong> conocer los comportamientos típicos de cada edad te ayudará a ser realista y saber qué puedes esperar de tu bebé, qué estímulos le puedes ofrecer y qué límites puedes poner.</li>
                        </ul>

                        <h3>Referencias</h3>
                        <p>Grimalt. L, Heliana, M. (2012) Estilos de apego y representaciones maternas durante el embarazo. Revista Chilena de Pediatría (3) 239-246 https://www.scielo.cl/scielo.php?script=sci_arttext&pid=S0370-41062012000300005</p>
                        <p>José, S. María, H (2003) De las ideas de las madres a las interacciones con sus bebés. Anales de la psicología (2) 279-292 https://revistas.um.es/analesps/article/view/27761/26891</p>
                        <p>Rendón Quintero E, Rodríguez Gómez R. (2015) La importancia del vínculo en la infancia: entre el psicoanálisis y la neurobiología. Rev. Ciencia Salud. (2) 261- 280 http://scielo.org.co/pdf/recis/v14n2/v14n2a11.pdf tp://scielo.org.co/pdf/recis/v14n2/v14n2a11.pdf</p>
                    `
                },

                {
                    id: 7,
                    titulo: "Conviértete en su zona segura: cómo vincular con tu peque 🌈",
                    resumen: "Conectar no es ‘controlar’: es mirar, escuchar y jugar desde el corazón. Técnicas simples para crear confianza, ser co-participante y fortalecer una relación respetuosa y afectuosa con tu peque.",
                    imagen: "assets/img/articulos/vinculo.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <h3>¿Cómo vincular con mi peque?</h3>

                        <p>Todo vínculo afectivo entre personas se basa en una conexión emocional entre esas dos personas, conseguir conectar con los peques es muy importante para establecer un clima de confianza y diálogo, las cuales sustentan una relación respetuosa y afectuosa que dan lugar a un desarrollo sano basado en el amor y respeto.</p>

                        <p>Por lo que, la unión entre peque y nanny puede llegar a ser muy fuerte si sabemos cómo implementar ciertas técnicas que nos ayuden a acercarnos a ellos y convertirnos en una de sus zonasseguras.</p>

                        <div class="reading-note">
                        <strong>💛 El vínculo se refuerza cuando:</strong>
                        <ul>
                            <li>Cuando tú y el peque comparten como iguales.</li>
                            <li>Cuando el peque te ve como un co-participante.</li>
                            <li>Cuando le dejas tener un rol de líder.</li>
                            <li>Cuando tienes conversaciones.</li>
                            <li>Cuando escuchas de manera activa y empática.</li>
                            <li>Cuando le haces sentirse útil (Por ejemplo, cuando le permites ayudar). Por lo tanto,te damos algunostips para generar este vínculo de forma óptima.</li>
                        </ul>
                        </div>

                        <ul>
                        <li><strong>Comunicación efectiva:</strong> es una de las claves para mejorar la comunicación con los peques en donde es fundamental que se sientan escuchados y atendidos y demostramos que su opinión nos importa, lo más recomendable es que esta comunicación se de a su altura, es decir, que nos situemos a la misma altura que los peques, de esta forma les hacemos saber que estamos en una misma posición y nos interesamos en aquello que nos están comunicando.</li>
                        <li><strong>Interésate por sus cosas:</strong> si queremos conectar con los peques es muy importante que prestemos atención a sus intereses para entender lo importante que son para ellos.</li>
                        <li><strong>Jugar:</strong> el juego es fundamental para que los pequeños tengan más interés y te ganes su cariño, puedes ayudarte de los papis para preguntarles cuáles son los juegos favoritos del peque o incluso a través de la observación puedes percatarte de qué personajes le gustan más y a partir de ello invitarlo a crear un juego o tú proponerle uno, también pueden salir al parque si es que hay uno cerca y los papis les dan permiso. Asimismo, le puedes preguntar cómo juega él con sus juguetes, en general, al jugar como niños pequeños hará más fácil el acercamiento. Incluso idear juntos un juego, actividad algo que les permita ser cómplices de alguna actividad juntos puede ayudar a crear este vínculo.</li>
                        <li><strong>Leer:</strong> pueden ir generando el hábito de la lectura mientras conectan, incluso la puedes hacer partícipe enseñándole directamente las imágenes e inventando una nueva historia donde él sea la protagonista.</li>
                        <li><strong>Cantar y bailar:</strong> puedes preguntar acerca de sus canciones favoritas y hacer uso de ellas para acerca un poco más.</li>
                        <li><strong>Colorear:</strong> puedes llevar algunas hojitas que contengan sus personajes favoritos y que el peque los vaya coloreando mientras tú le cuentas una historia o solo lo acompañas con otro dibujo. • Realizar sus actividades favoritas.</li>
                        <li><strong>Paciencia y amor:</strong> recuerda que al iniciar un servicio algunos pequeños se pueden sentir confundidos porque no te conocen bien, pero verás que poco a poco te irás ganando la confianza y cariño del peque, todo consiste en ser perseverantes y divertidos.</li>
                        </ul>

                        <h3>Frases cortas que nos ayudan a conectar con los peques:</h3>
                        <p>Los peques aprenden más de nuestras actitudes que de lo que les decimos, aunque las palabras tienen un poder enorme sobre la autoestima y el bienestar de ellos. Aquí listamos algunas frases breves que pueden ayudar a las Nannys a conectar de una forma sencilla y cariñosa con los peques:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>1. Yo te entiendo</strong></span> <span>🤝</span></div>
                        <div class="rt-row"><span><strong>2. Yo estoy aquí todas las veces que me necesites</strong></span> <span>🫶</span></div>
                        <div class="rt-row"><span><strong>3. Yo te escucho</strong></span> <span>👂</span></div>
                        <div class="rt-row"><span><strong>4. ¡Qué bien lo has hecho!</strong></span> <span>⭐</span></div>
                        <div class="rt-row"><span><strong>5. ¿Cómo te sientes hoy?</strong></span> <span>💬</span></div>
                        <div class="rt-row"><span><strong>6. Puedes contar conmigo</strong></span> <span>🧡</span></div>
                        <div class="rt-row"><span><strong>7. Tienes toda la razón</strong></span> <span>🌟</span></div>
                        <div class="rt-row"><span><strong>8. ¿Podrías ayudarme a hacer esto?</strong></span> <span>🧩</span></div>
                        </div>

                        <ol>
                        <li><strong>Yo te entiendo:</strong> cuando tu peque te cuente algo o exprese alguna emoción de frustración, decepción, enfado... esta sería una buena frase para decirle.</li>
                        <li><strong>Yo estoy aquí todas las veces que me necesites</strong></li>
                        <li><strong>Yo te escucho:</strong> la escucha no es solo oír a los peques, es escuchar lo que dice y manifiesta su corazón, su comportamiento, su expresión corporal.</li>
                        <li><strong>¡Qué bien lo has hecho!</strong> Valora el esfuerzo y el trabajo de tus peques y ya verás cómo ellos salen reforzados y motivados.</li>
                        <li><strong>¿Cómo te sientes hoy?:</strong> crea el hábito de siempre preguntar a los peques cómo están, cómo se sienten. Eso les hará sentir importantes en tu vida.</li>
                        <li><strong>Puedes contar conmigo:</strong> cuando tu peque tiene un desafío o algo nuevo para hacer, díselo con palabras y demuéstraselo con hechos que él puede contar contigo.</li>
                        <li><strong>Tienes toda la razón:</strong> resalta una buena decisión u opinión de los peques. Esta frase es para decir más de una vez, todas las que puedas. Alimentarás su autoestima.</li>
                        <li><strong>¿Podrías ayudarme a hacer esto?:</strong> pedir la ayuda de los peques y darles responsabilidades les hará sentir parte de un equipo.</li>
                        </ol>

                        <h3>Referencias:</h3>
                        <p>Cuentos para crecer. (2022). ¿Cómo conectar con los niños? Cuentos para crecer. Disponible en: https://cuentosparacrecer.org/blog/como-conectar-con- los-ninos/</p>
                        <p>Hacer familia. (7 de agosto de 2020). Claves para conectar con tus hijos. Hacer familia. Disponible en: https://www.hacerfamilia.com/familia/claves-conectar￾hijos-comunicacion-familia 20170522143923.html</p>
                        <p>Medina, V. (2022). 10 formas de conectar con los hijos. Guía Infantil. Disponible en: https://www.guiainfantil.com/articulos/familia/10-formas-para-conectar-con- tu-hijo/</p>
                    `
                },

                {
                    id: 8,
                    titulo: "Cuando la pantalla manda… tu peque se apaga 😔📱",
                    resumen: "Señales claras de adicción al teléfono y una guía paso a paso para recuperar rutina, juego y calma… sin gritos ni peleas.",
                    imagen: "assets/img/articulos/adiccion.jpg",
                    categoria: "Cognitivo",
                    contenido: ` 
                    <h3>Adicción al teléfono: ¿Cómo trabajarla?</h3>

                    <p>La adicción al teléfono y a las pantallas en general (pantallismo), es una preocupación creciente en las sociedades contemporáneas, pues el uso de teléfono y pantallas en general causa efectos contraproducentes en el desarrollo cognitivo de los pequeños.</p>
                    <p>Así mismo, el uso descontrolado de pantallas puede generar desde problemas de conducta, trastorno del sueño hasta depresión infantil y ansiedad.</p>

                    <div class="reading-note">
                    <strong>📌 Señal importante:</strong>
                    <p style="margin:10px 0 0 0;">No se trata de “quitar por quitar”, sino de enseñar un uso saludable y no compulsiva.</p>
                    </div>

                    <h3>¿Cómo saber si mi peque es adicto al teléfono?</h3>
                    <p>Considerando las características naturales de nuestros peques, podemos notar las siguientes características típicas de la adicción al teléfono o a las pantallas en general:</p>

                    <ul>
                    <li>Pasa mucho tiempo en la pantalla.</li>
                    <li>Se muestra irritable e iracundo cuando no está en el teléfono o frente a una pantalla y esto desaparece cuando está de nuevo con los dispositivos.</li>
                    <li>Cambios de humor muy notorios.</li>
                    <li>Cambios en la rutina de sueño y la alimentación (necesidades básicas).</li>
                    <li>El peque deja de hacer actividades que antes le parecían interesantes o entretenidas para pasar más tiempo en el teléfono.</li>
                    <li>Pérdida de relaciones sociales como son amigos y familiares, por pasar demasiado tiempo en el teléfono.</li>
                    </ul>

                    <p>Como cualquier otra adicción, tiene recuperación y requiere de atención y constancia para que los peques logren retomar sus vidas. Es importante que, si empezamos a notar estas señales desde temprana edad, se aborden lo más pronto posible, para evitar que la adicción escale más. No debemos simplemente quitarles las pantallas, sino enseñarles a darles un uso saludable y no compulsiva.</p>

                    <p>La profesora Rosario J. Marrero Quevedo expone lo siguiente acerca del pantallismo:</p>

                    <div class="reading-note">
                    <strong>🧠 Pantallismo</strong>
                    <p style="margin:10px 0 0 0;">Las áreas cerebrales afectadas incluyen el córtex cingulado anterior, la ínsula y la amígdala, fundamentales para la integración emoción-cognición y el control emocional. Estas alteraciones generan una mayor sensibilidad a las recompensas, disminuyendo la percepción de las pérdidas, lo que fomenta un uso compulsivo a pesar de las consecuencias negativas. Además, las funciones ejecutivas, asociadas a regiones como la corteza dorsolateral prefrontal y los lóbulos frontal y parietal, se ven comprometidas, dificultando el control atencional y la regulación emocional, elementos esenciales para una conducta adaptativa.</p>
                    </div>

                    <p>Así mismo, explica que el uso excesivo de dispositivos tecnológicos puede desembocar en problemas de atención y emocionales, desarrollando baja tolerancia a la frustración, déficit en la capacidad de atención, poca disciplina, deterioro en habilidades como caligrafía, ortografía y comprensión de textos.</p>

                    <p>Es importante entender que esta conducta sólo es el producto de estados emocionales más profundos, muchas veces la sensación de soledad e incomprensión llevan a las personas a buscar otra salida, por lo que es importante que cada acción que se haga al respecto sea desde el amor hacia el pequeño.</p>

                    <h3>Entonces, ¿qué debo hacer para ayudar a mi peque?</h3>
                    <p>Principalmente, tenemos que entender que cada peque vivirá la adicción de manera diferente y dependiendo del tiempo que lleve con ella. A continuación, habrá algunos tips para apoyar con el proceso:</p>

                    <ul>
                    <li>Hablar desde el principio con el peque: Habrá cambios en la rutina, ya no se usará tanto el teléfono en casa.</li>
                    <li>En medida de lo posible, hacer una lista del peque de los beneficios y daños del uso del teléfono.</li>
                    <li>Aunque sea difícil al principio, recuerda siempre mantener los límites de manera respetuosa y amorosa, recuerda siempre acompañar a tu peque en los desbordes emocionales de una manera asertiva (ver artículo “Berrinches y Frustración en Bebés”).</li>
                    <li>Mantengan una rutina cargada de actividades, para que al peque no le dé tiempo de buscar “des” aburrirse con la pantalla. Estas actividades no tienen que ser muy elaboradas, pero intenta que sean llamativas para los peques. Por ejemplo, si entre las actividades está limpiar sus habitaciones, háganlo con música que les guste a los peques, la limpieza no tiene por qué ser un castigo.</li>
                    <li>Como todas las adicciones, requiere ir de poco a poco. Si el peque está acostumbrado a estar mucho tiempo en la pantalla, empiecen reduciéndolo a 25-30 minutos, explicándole qué va a suceder antes y después de su uso. Poco a poco vayan reduciendo el tiempo hasta que se quede en 10 minutos diarios y que los peques puedan elegir en qué momento darles uso.</li>
                    <li>Eviten las pantallas en familia, por ejemplo, a la hora de la comida. Mejor aprovechen para hablar acerca de sus días, pregúntenle al peque cómo le fue, ríanse juntos y compartan un momento de felicidad. Pueden realizar algunos juegos sencillos en familia como teléfono descompuesto o veo veo,</li>
                    <li>Establezcan horario de familia, por ejemplo, si los papás llegan a las 6 de trabajar, pueden usar de 7 a 8 para platicar o jugar algún juego de mesa juntos, como un rompecabezas o juegos de cartas.</li>
                    <li>Desháganse de las pantallas en el cuarto del peque, que se queden en habitaciones comunes, para evitar alteraciones del sueño.</li>
                    <li>No castiguemos ni prohibamos el uso del celular, podrían incluso compartir con el peque esos 10 minutos de teléfono viendo algún vídeo juntos o jugando juntos, compartan incluso esos momentos juntos.</li>
                    </ul>

                    <div class="reading-note">
                    <strong>💛 Recordatorio</strong>
                    <p style="margin:10px 0 0 0;">Sabemos que podrá ser un proceso cansado y difícil para todos los miembros de la familia, sin embargo, es importante abordarlo lo antes posible para evitar mayores complicaciones en el futuro.</p>
                    </div>

                    <h3>Recomendaciones de actividades</h3>

                    <div class="reading-table">
                    <div class="rt-row"><span><strong>Actividades manuales</strong></span> <span>✋</span></div>
                    <div class="rt-row"><span><strong>Actividades cognitivas</strong></span> <span>🧠</span></div>
                    <div class="rt-row"><span><strong>Actividades socioemocionales</strong></span> <span>💛</span></div>
                    </div>

                    <h3>Actividades manuales:</h3>
                    <ul>
                    <li>Escultura con porcelana fría. - Para realizar esta mezcla necesitarán los siguientes ingredientes:</li>
                    <li>Pegamento líquido.</li>
                    <li>Harina de maíz.</li>
                    <li>Vinagre.</li>
                    <li>Aceite de bebé.</li>
                    <li>Crema para manos.</li>
                    </ul>

                    <p>Mezclar los ingredientes y armar figuras con la porcelana ayudará a los peques a tener las manos ocupadas, podrían replicar las figuras de algunos animales o inventarse otros con características mezcladas. Una vez frías las piezas, pueden pintarlas e incluso ponerles una argolla para hacer llaveros.</p>

                    <ul>
                    <li>Juegos de ensartado. - Si tu peque tiene entre 3 a 6 años los juegos de ensartado son una excelente idea para concentrarlos en una tarea, así como para fortalecer sus manitas.</li>
                    <li>Pintura dactilar. - Aunque no a todos los peques les gusta ensuciarse, la pintura dactilar puede relajarlos.</li>
                    <li>Origami. - El origami es un arte antiguo que ayuda a relajar la mente y fortalece los dedos de los peques, además de ayudarles a regular las fuerzas de las manos y refuerza el pensamiento de proporción-medida.</li>
                    </ul>

                    <h3>Actividades cognitivas:</h3>
                    <ul>
                    <li>Lectura e invención de cuentos. - Una actividad clásica para estimular el pensamiento de los peques, así como su lenguaje, podrían incluso inventar nuevos finales para las historias clásicas o crear algún cuento entre todos (proponiendo una frase), escribirlo, hacer las ilustraciones y el encuadernado. A parte de mantener ocupados a los peques, esta actividad ayudará a fortalecer la relación de la familia.</li>
                    <li>Ir al teatro o hacer uno en casa. – Pueden buscar teatros cerca de casa y, aunque no entren a una función, pueden pedir que el/la peque conozca el espacio. En caso de no tener uno cerca, pueden armar una obra sencilla que puedan presentar en casa para la diversión de todos.</li>
                    <li>Realización de rompecabezas. – Dependiendo de la edad del peque se pueden realizar diferentes tipos de rompecabezas, con piezas “extrañas”, 3D o Legos. Esta actividad a parte de concentrar a los peques, ayuda a fortalecer el área cognitiva y el pensamiento lógico-espacial.</li>
                    <li>Dibujando las nubes. – Para fomentar su creatividad, pueden salir al patio o a algún parque y ver las formas de las nubes, lleven una libreta, hojas y colores. Dibujen las figuras que vayan encontrando, aunque sean “extrañas” o no tengan sentido, al final pueden ponerles un nombre.</li>
                    </ul>

                    <h3>Actividades socioemocionales:</h3>
                    <ul>
                    <li>Cojín de los gritos. – Probablemente en el proceso de separación del peque con el teléfono existan los desbordes emocionales, para ello es importante mantener el límite y ofrecerle alternativas, en este caso darle un cojín de los gritos cuando esté gritando le ayudará a canalizar sus emociones de manera sana.</li>
                    <li>Emocionómetro. – Esta gran herramienta ayudará a los peques a ir identificando las emociones gradualmente. Recomendamos usarlo primero como adultos para ejemplificarlo a los peques, para que ellos empiecen a observar que tienen opciones antes de llegar al desborde.</li>
                    <li>Rincón de la calma. – Adapten un espacio en su hogar para los desbordes emocionales, que sea un lugar oscuro y agradable donde los peques puedan ir cuando se sientan mal y pongan reglas en conjunto del espacio (como entrar sin zapatos, no durar ahí más de 1 hora, sin entrada de papás, etc.).</li>
                    </ul>

                    <p>A parte de todas estas actividades, es importante que los peques lleven a cabo otro tipo de actividades físicas, como algún deporte. Deportes que requieren fuerza física, con ayuda de un buen entrenador, puede ayudar a canalizar las emociones y fuerzas de los peques. Recordemos que es un proceso y cada peque es diferente, no perdamos la paciencia pues, somos nosotros los que debemos regular las emociones de los peques y guiarlos para canalizarlas de la mejor manera posible con amor y comprensión.</p>

                    <h3>Referencias</h3>
                    <p>Blanco, D. (2024, noviembre 27). Cómo reconocer el pantallismo, la adicción al celular que altera la salud mental de los niños y adolescentes. infobae.</p>
                    <p>https://www.infobae.com/salud/2024/11/27/como-reconocer-el-pantallismo￾la-adiccion-al-celular-que-altera-la-salud-mental-de-los-ninos-y￾adolescentes/</p>
                    <p>Ferrer, P. (2017, febrero 27). Mi hijo es adicto al móvil. ORBIUM ADICCIONES; ORBIUM.</p>
                    <p>https://orbiumadicciones.com/adicciones-comportamentales/mi-hijo-es￾adicto-al-movil/</p>
                    <p>León Méndez, M., Padrón, I., Fumero, A., & Marrero, R. J. (2024). Effects of internet and smartphone addiction on cognitive control in adolescents and young adults: A systematic review of fMRI studies. Neuroscience and Biobehavioral Reviews, 159(105572), 105572.</p>
                    <p>https://doi.org/10.1016/j.neubiorev.2024.105572</p>
                    <p>Sandua, D. (2023). Adictos a la Pantalla: Estrategias Para Combatir El Abuso del Smartphone En Niños Y Adolescentes. Independently Published.</p>
                `
                },

                {
                    id: 9,
                    titulo: "Actividades que sí funcionan (1 año+): juego, conexión y desarrollo ✨",
                    resumen: "Un listado enorme de ideas prácticas para entretener y estimular a tu peque desde 1 año… con materiales sencillos y mucha diversión.",
                    imagen: "assets/img/articulos/actividades.jpg",
                    categoria: "Motriz",
                    contenido: `
                    <h3>Actividades para peques de 1 año en adelante</h3>

                    <div class="reading-note">
                    <strong>🧩 Tip rápido</strong>
                    <p style="margin:10px 0 0 0;">Busca un espacio seguro, materiales sencillos y acompaña con calma. La constancia es clave.</p>
                    </div>

                    <h3>“Mis primeras lecturas”</h3>
                    <p>Vamos a comenzar buscando un lugar cómodo, sin tanto ruido y también un cuento que le sea llamativo al peque. El peque y la nanny se deben sentar juntos de tal forma que el peque pueda ver con facilidad el cuento. Se va a abrir el libro y despacio se irá pasando hoja por hoja, leyendo y señalando las figuras del libro. Otra variante es pedirle al peque que señale las imágenes o que simule leer.</p>

                    <h3>“Jugando con agua”</h3>
                    <p>Se deberá buscar un espacio seguro para realizar las actividades, se buscarán objetos donde se pueda colocar agua, como tazones, tazas, platos, cucharas, o cucharones. Se les dejará explorar y jugar libremente llenando y vaciando los recipientes. Importante: no olvides tener a la mano un cambio de ropa.</p>

                    <h3>“Conociendo mi cuerpo”</h3>
                    <p>La nanny deberá ir señalando con su mano las partes de su cuerpo, de tal forma que el peque pueda ir imitando y repitiendo el nombre, una vez hecho, la nanny le irá preguntando de forma aleatoria, “¿Dónde está tu nariz?, ¿y tu pancita?, etc.</p>

                    <h3>“Abajo y arriba”</h3>
                    <p>Se deberá buscar un espacio donde el peque esté libre, vamos a colocar pelotas pequeñas, medianas y grandes. Se colocará una caja de cartón en una esquina del espacio. Se le pedirá al peque que levante una pelota y la lleve a la caja, se les dirá que continúen con las demás pelotas hasta que todas estén dentro. Una variante es pedirle al peque que intente encestar las pelotas dentro de la caja, en primer lugar, podemos intentarlo estando un poco cerca, hasta quedar un poco más lejos.</p>

                    <h3>“Dibujando ando”</h3>
                    <p>Para esta actividad, se sugiere hacerla en una mesa a la altura del peque. Se pondrán en ella colores, crayolas y hojas blancas. Se dejará que raye libremente una hoja. Después se preguntará al peque qué ha dibujado y se hará una pequeña historia de acuerdo con lo que ha hecho.</p>

                    <h3>“Aros y cuerdas”</h3>
                    <p>Con ayuda de aros y una cuerda vamos a irlos insertando como si intentaremos hacer una pulsera, después, motivaremos a nuestro peque a hacer lo mismo, lo ayudaremos las veces necesarias hasta que logre hacerlo solo.</p>

                    <h3>“Mi primer baile”</h3>
                    <p>Se buscará un lugar con suficiente espacio. Para empezar, la nanny y el peque deberán estar sentados en el piso tomados de las manos, mientras cantan una canción y realizan algunos movimientos. Después se pondrán de pie y comenzarán a bailar, dando pasos hacía los costados, atrás, etc.</p>

                    <h3>“Jalar y aventar”</h3>
                    <p>Vamos a decirle al peque que escoja algunos juguetes, de preferencia animales. La nanny amarrará los juguetes en una cuerda, una vez hecho, el peque intentará jalar los juguetes, desarrollando su motricidad fina. Importante: ten cuidado al momento de que el peque jale los animales, ya que se pueden soltar y caer.</p>

                    <h3>“Señalando”</h3>
                    <p>Vamos a buscar una mesa al alcance del peque, y vamos a colocar algunos objetos comunes de la vida diaria, el peque deberá observarlos y después la nanny le preguntará, ¿en dónde está la taza?, ¿cuál es la muñeca?, ¿para qué sirve el cepillo?, etc.</p>

                    <h3>“Pompones divertidos”</h3>
                    <p>Vamos a necesitar una botella de plástico grande y pompones de diferentes tamaños y colores. La nanny va a colocar todos los pompones en un recipiente grande, y colocará la manita del peque dentro de él, dejará que los exploré libremente. Posteriormente, la nanny y el peque insertarán los pompones en la botella, lo apoyaremos hasta que logre hacerlo solo.</p>

                    <h3>“Botellas sensoriales”</h3>

                    <h3>“Bolsas sensoriales”</h3>
                    <p>En una bolsa tipo ziploc grande, la nanny colocará gel para cabello con pintura, diamantina, o cualquier insumo que sea llamativo para el peque. Cerrará perfectamente la bolsa con cinta adhesiva cuidando que no haya fugas.</p>

                    <h3>“Flor”</h3>
                    <p>En una hoja blanca, la nanny dibujará con plumón verde los tallos de unas flores. Posteriormente, le pondrá pintura dactilar en las yemas de las manos del peque y le enseñará cómo debe ir haciendo los pétalos de flor, hasta que él lo haga solo.</p>

                    <h3>“Encuentra el objeto”</h3>
                    <p>En un recipiente lo suficientemente grande, la nanny va a colocar arena sintética y en ella va a esconder pelotas o juguetes de plástico. Le pedirá al peque que meta sus manos en el arenero y dejará que la explore, con indicaciones, poco a poco el peque sacará los objetos.</p>

                    <h3>“Pintura yogurt”</h3>
                    <p>En tres recipientes la nanny va a colocar ¼ de yogurt natural y agregará 6 gotas de colorante, hará 3 colores, rojo, azul y amarillo, mezclará perfectamente cada color. Se sugiere que el peque esté sentado para que la nanny le brinde una hoja o papel bond y pueda pintar libremente con sus manos.</p>

                    <h3>“Mi nombre”</h3>
                    <p>En una mesa a la altura del peque, la nanny pegará cinta doble cara en forma de la primera letra del nombre del peque, debe quedar un lado pegajoso, después se le dará tapas de refresco al peque que deberá ir pegando en la cinta. Pueden usar otros materiales como: brillantina, foamy, cachitos de hojas de colores, etc.</p>

                    <h3>“Pescando”</h3>
                    <p>En un recipiente suficientemente grande la nanny va a colocar suficiente agua, una vez lleno, se colocarán tapas de refresco, se sentará al pequeño frente al recipiente y se le dará un colador. Primero la nanny va a ayudar al peque a tomar las tapas con el colador hasta que poco a poco lo haga solo.</p>

                    <h3>“Ligas divertidas”</h3>
                    <p>La nanny va a realizar con cartón una base circular, y en ella pegará un tubo de servitoallas. Posteriormente, este objeto se le dará al peque con ligas para cabello que sean grandes, pequeñas, de colores y texturas, el peque deberá ponerlas y quitarlas del tubo, estimulando su motricidad fina.</p>

                    <h3>“Huellitas”</h3>
                    <p>En hojas de colores la nanny marcará las huellas de pie del peque y las recortará, en ellas les pegará distintas texturas (pompones, semillas, pastas, limpiapipas, piedras, etc.), Posteriormente las pegará en el piso, y tomará al peque para que pase caminando descalzo en ellas.</p>

                    <h3>“Buscando juguetes”</h3>
                    <p>En una caja grande, la nanny colocará distintos objetos que le gusten al peque, en la parte de arriba de la caja se deberá hacer hoyos pequeños donde entre estambre, la nanny lo colocará haciendo una telaraña con espacios grandes y pequeños. El peque se deberá colocar frente a la caja y la nanny lo ayudará a ir sacando los juguetes a través de la telaraña.</p>

                    <h3>“Pegando pelotas”</h3>
                    <p>La nanny deberá buscar un espacio donde se puedan pegar filas de cinta canela (puede formar figuras o sólo líneas y el lugar podría ser la pared o mesa lisa), el peque irá pegando las pelotas que la nanny le vaya dando y deberá motivar a que siga colocándolas en caso de que se caigan.</p>

                    <h3>“Tablero sensorial”</h3>
                    <p>En una base de cartón la nanny pegará distintos tipos de texturas (pasta, hojas, foamy, algodón, piedras, etc.), posteriormente, se le dará al peque y se dejará que lo explore.</p>

                    <h3>“Circuito”</h3>
                    <p>La nanny deberá buscar un lugar con mucho espacio, en él colocará distintos obstáculos, como lo son almohadas, cajas, aros, tubos de papel, cinta, sillas, mesas, etc. La nanny deberá hacer que el pequeño camine, brinque, pase bajo las cajas o aros y todas las posibilidades que los materiales brinden.</p>

                    <h3>“Pinta con los pies”</h3>
                    <p>Se colocará en el piso un papel bond, la nanny le colocará pintura dactilar en los piececitos al peque y deberá caminar libremente sobre él. Se pueden usar diversos colores o incluso otra cosa diferente al papel bond como lo puede ser papel burbuja.</p>

                    <h3>“Pared decorada”</h3>
                    <p>En una pared libre y al alcance del peque, la nanny pegará listones de distintas texturas, tamaños, colores e incluso le puede colocar en ellos objetos como bolitas para hacer pulseras, aros, etc. Sentará al peque y dejará que los explore libremente.</p>

                    <h3>“Botellas de descubrimiento”</h3>
                    <p>En botellas de plástico, la nanny va a colocar distintos materiales que se muevan o hagan ruido, como frijoles, pasta, cuentas de pulseras, lentejas, monedas, botones, arroz, fideos, etc. La nanny las cerrará perfectamente, y se las dará al peque como si fueran sonajas.</p>

                    <h3>“Aro sensorial”</h3>
                    <p>Para esta actividad se va a necesitar un aro, la nanny lo va a decorar alrededor con lo que esté a su alcance cintas, tul, pompones, tela, estambre, etc, y a su vez, se deberán amarrar todo tipo de juguetes a él. Se colocará el aro en el piso y al peque en el centro de él y deberá explorarlo libremente.</p>

                    <h3>“Plastilina casera”</h3>
                    <p>Se va a ocupar 1 taza de harina, medio vaso de sal, y ¼ de vaso de agua, se mezclará todo hasta que quede una masa compacta. Después se dividirá la masa en distintos montones y se agregará colorantes, una vez lista entre la nanny y el peque podrán jugarla como deseen.</p>

                    <h3>“Objetos ruidosos”</h3>
                    <p>Para esta actividad la nanny va a recopilar todos los juguetes del peque que hagan ruido, los va a prender y los va a esconder detrás de la puerta o cortinas. El peque deberá buscarlos únicamente por el sonido mientras la nanny le da pistas.</p>

                    <h3>“Despegar estampas”</h3>
                    <p>La nanny va a colocar en la mesa de la silla de comer del peque estampas, pero solo las va a pegar a la mitad, es decir, se va a quedar una pestañita para que al peque le sea fácil despegarlas.</p>

                    <h3>“Guitarra”</h3>
                    <p>Para esta actividad se va a necesitar un tupper rectangular o cuadrado que no esté muy alto y ligas, las cuales se colocarán alrededor de él, una vez puestas el peque deberá tocarlas produciendo el sonido.</p>

                    <h3>“Calcetas en batidor”</h3>
                    <p>Para esta actividad la nanny buscará un batidor globo, en el meterá calcetines del peque, y se lo dará al peque para que jueguen a sacarlas.</p>

                    <h3>“Popotes locos”</h3>
                    <p>En un tubo de papel higiénico, la nanny hará unos hoyos donde introducirá distintos popotes, después se le dará al pequeño y se va a entretener tratando de sacar los popotes y averiguando cómo funciona. Esta actividad se puede complementar pidiéndole al peque que antes de usar los popotes pinte en compañía de su nanny el tubo de cartón.</p>

                    <h3>“Cascabeleando”</h3>
                    <p>La nanny va a hacer uso de velcro y de cascabeles, los va a pegar en la ropa del peque sin que se dé cuenta, esto hará que el peque se divierta mientras intenta averiguar de dónde viene el sonido.</p>

                    <h3>“Adivinando el olor”</h3>
                    <p>En un recipiente con tapa, la nanny hará un pequeño orificio y después va a colocar comida con olor característico, puede ser de naranjas, fresas, limón, café etc.), el peque va a oler por el orificio y deberá adivinar qué hay dentro.</p>

                    <h3>“Arenero”</h3>
                    <p>En un recipiente la nanny va a colocar arena sintética, harina o azúcar. Le dará al peque un lápiz y dejará que dibuje libremente en él.</p>

                    <h3>“Activando nuestra creatividad”</h3>
                    <p>Con esta actividad tu peque podrá hacer un espacio para jugar con sus demás juguetes, pero al hacerlo estarás estimulando su imaginación, creatividad y diversión, para ella necesitarás: popotes, foamy, palitos de madera, pinturas, pinceles, cartulina, cartón, limpiapipas, plastilina, cuerda, tijeras, pegamento, arena, etc. Para esta actividad, no se necesita un patrón en concreto, los columpios pueden ser de foamy, cuerda, la resbaladilla de popotes, cartulina, etc.</p>
                `
                },

                {
                    id: 10,
                    titulo: "Emociones que se entienden: actividades socioemocionales que sí ayudan 💛",
                    resumen: "Herramientas simples para que tu peque identifique lo que siente, se calme y aprenda a expresar su mundo interno con seguridad.",
                    imagen: "assets/img/articulos/emociones.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                    <h3>Actividades socioemocionales</h3>

                    <div class="reading-note">
                    <strong>💛 Objetivo</strong>
                    <p style="margin:10px 0 0 0;">Estas actividades ayudan a los peques a reconocer, nombrar y regular sus emociones con acompañamiento amoroso.</p>
                    </div>

                    <h3>Emocionómetro</h3>
                    <p>Esta herramienta ayuda a los peques a identificar cómo se sienten. Puedes usar colores o caritas (feliz, triste, enojado, asustado) para que el peque elija cuál se parece más a lo que siente.</p>

                    <h3>Rincón de la calma</h3>
                    <p>Adapten un espacio en casa para los desbordes emocionales: cojines, peluches, libros, luz tenue. No es castigo; es un lugar seguro para regularse.</p>

                    <h3>Botella sensorial</h3>
                    <p>En una botella con agua puedes poner diamantina, colorante o cuentas. Cuando el peque esté alterado, invítalo a observarla y respirar mientras baja la brillantina.</p>

                    <h3>Cojín de los gritos</h3>
                    <p>Si el peque está muy enojado, puede gritar en un cojín para canalizar la emoción sin lastimar a nadie. Acompaña el momento con calma y después dialoguen.</p>

                    <h3>Respiraciones divertidas</h3>
                    <p>Respiración del globo: “Infla la pancita como un globo… ahora suéltalo despacito”. Soplar velitas imaginarias también ayuda a bajar la intensidad emocional.</p>

                    <div class="reading-note">
                    <strong>🗣️ Validación emocional</strong>
                    <p style="margin:10px 0 0 0;">Frases que ayudan: “Veo que estás enojado”, “Entiendo que te frustraste”, “Estoy aquí contigo”. Validar no es permitirlo todo; es acompañar para que aprenda a regularse.</p>
                    </div>
                `
                },

                {
                    id: 11,
                    titulo: "Acompañamiento seguro: cuando hay tensión en casa 🫶",
                    resumen: "Cómo cuidar la seguridad emocional de tu peque ante discusiones: señales, efectos y acciones concretas para volver a la calma.",
                    imagen: "assets/img/articulos/Familia.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                    <h3>Acompañamiento seguro</h3>

                    <p>Cuando los peques están expuestos a discusiones frecuentes o a un ambiente de tensión, su cuerpo también puede resentirlo. El estrés emocional no solo se queda en el corazón: puede manifestarse en el sueño, en el apetito y en su conducta.</p>
                    <p>Es importante recordar que los peques aprenden del ambiente. Si en casa hay gritos, amenazas o silencios prolongados, ellos pueden sentir miedo, inseguridad o confusión.</p>

                    <h3>¿Qué pueden sentir los peques?</h3>
                    <ul>
                    <li>Miedo a que algo malo ocurra.</li>
                    <li>Culpa, pensando que la discusión es por su culpa.</li>
                    <li>Ansiedad y necesidad constante de aprobación.</li>
                    <li>Tristeza o irritabilidad.</li>
                    </ul>

                    <div class="reading-note">
                    <strong>👀 Señales que pueden aparecer</strong>
                    <ul>
                        <li>Problemas de sueño o pesadillas.</li>
                        <li>Dolores de estómago o cabeza sin causa médica aparente.</li>
                        <li>Retrocesos (control de esfínteres, mayor apego, llanto).</li>
                        <li>Conductas agresivas o aislamiento.</li>
                    </ul>
                    </div>

                    <h3>¿Cómo acompañar de forma segura?</h3>
                    <ul>
                    <li>Habla con calma: explica que los adultos tienen desacuerdos, pero que el peque no es culpable.</li>
                    <li>Reafirma seguridad: “Estamos trabajando para estar bien y tú estás a salvo”.</li>
                    <li>Evita discutir frente al peque, sobre todo temas intensos.</li>
                    <li>Después de un conflicto, restablece conexión: un abrazo, un cuento, un momento juntos.</li>
                    </ul>

                    <h3>Referencias</h3>
                    <p>Babypar. (2024). Cómo las peleas o discusiones entre padres afectan a los hijos. Babypar. Recuperado de https://babypar.org/como-peleas￾discusiones-entre-padres-afectan-hijos/</p>
                    <p>Solidaridad Intergeneracional. (2019). Así afectan las peleas de los padres a los niños. Recuperado de https://solidaridadintergeneracional.es/wp/asi￾afectan-las-peleas-de-los-padres-a-los-ninos/</p>
                    <p>Clínica Alemana. (2016). ¿De qué forma afectan las discusiones a los niños? Recuperado de https://www.clinicaalemana.cl/articulos/detalle/2016/como-afectan-las￾discusiones-a-los-hijos</p>
                    <p>Hoy.com.py. (2023). ¿Cómo afectan las peleas y separaciones de los padres a los hijos? Recuperado de https://www.hoy.com.py/especiales/cuales-son-efectos-tienen-sobre-los￾hijos-las-peleas-de-sus-padres-frente-a-ellos</p>
                `
                },

                {
                    id: 12,
                    titulo: "¿Morder es malo? Lo que tu peque intenta decirte 🧡",
                    resumen: "Morder no siempre es ‘maldad’: suele ser emoción sin palabras. Aprende qué hacer, qué evitar y cómo acompañarlo con límites amorosos.",
                    imagen: "assets/img/articulos/Morder.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                    <h3>¿Morder es malo?</h3>

                    <p>Por eso, es importante el saber reaccionar de manera correcta ante la situación se recomienda evitar castigos severos o la culpa hacia el peque y en su lugar, trabajar desde la comprensión del comportamiento, la prevención, el acompañamiento emocional y el modelado de estrategias más seguras para expresarse.</p>
                    <p>Es decir, los peques pueden morder por impulsividad y no saben cómo manejarlo, como uno de sus acompañantes primarios, debemos ayudar a canalizar lo que está sintiendo o enfrentar esa situación de estrés o ansiedad.</p>

                    <div class="reading-note">
                    <strong>🛡️ Medidas y estrategias que pueden ayudar a prevenir las mordidas:</strong>
                    <ul>
                        <li>Explicarle de manera clara y verbal que no está bien morder, ya que puede causar dolor, por ejemplo: “Jorge está llorando y está triste, porque la mordida le dolió”</li>
                        <li>Cuando se trata de bebés es importante comunicarles el dolor con expresiones.</li>
                        <li>Refuerza la comunicación e incluye actividades socioemocionales, donde podrán conocer y reconocer sus emociones, así como, ayudar a canalizarlas.</li>
                        <li>Mantén una rutina que no sea muy exigente o estresante para brindarle seguridad, así como actividades que no lo lleven a frustrarse.</li>
                        <li>Mejorar las habilidades sociales de tu peque como compartir, respetar turnos, etc.</li>
                        <li>Ofrécele alternativas para calmarse, como abrazos, respiraciones profundas o actividades tranquilas.</li>
                    </ul>
                    </div>

                    <h3>Que NO debemos hacer ante mordidas:</h3>
                    <ul>
                    <li>Usar castigos físicos ni enseñarles cómo se siente “mordiéndoles”, ya que esto en lugar de ayudar, ocasionará ansiedad y miedo en el peque.</li>
                    <li>Etiquetar al peque como violento, grosero o que le encanta morder.</li>
                    <li>Ignorar el comportamiento.</li>
                    <li>Asumir que lo hacen con maldad, ya que, usualmente no lo hacen con esta intención.</li>
                    <li>Compararlo con otros niños. Cada pequeño tiene su propio ritmo de desarrollo.</li>
                    <li>Avergonzarlo frente a otros adultos o niños.</li>
                    </ul>

                    <h3>Estrategias para calmar y canalizar las mordidas</h3>
                    <ol>
                    <li>Crear un “espacio de calma”</li>
                    </ol>
                    <p>Un rincón pequeño con cojines suaves, libros, peluches, botellas sensoriales y luz tenue, puedes invitarlo a ir ahí cuando esté frustrado, enojado o muy estimulado no es castigo, es un espacio seguro para regularse.</p>

                    <ol>
                    <li>Usar respiraciones divertidas</li>
                    </ol>
                    <p>Respiración del globo: “Infla la pancita como un globo… ahora suéltalo despacito”, soplar velitas, imaginen una vela y soplen suavemente para “apagarla”, respirar como un perrito inhalaciones cortas y rápido- exhalación larga.</p>
                `
                },

                {
                    id: 13,
                    titulo: "Cuando tu peque se desborda: 14 formas de calmar su cuerpo con amor",
                    resumen: "Si tu peque llora, se frustra o explota… no es “mala conducta”: es una emoción muy grande en un cuerpo pequeño. Aquí tienes técnicas sencillas para acompañarlo y enseñarle a relajarse paso a paso.",
                    imagen: "assets/img/articulos/12.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <p><strong>Ayudando a mi peque a relajarse</strong></p>

                        <p>Durante toda la infancia los peques están aprendiendo de forma continua. Muchas veces les es complicado controlar o gestionar sus emociones. Por eso, una buena forma de calmarlos cuando llegan estos momentos es con algunas técnicas de relajación para los peques.</p>

                        <div class="reading-note">
                        <strong>💛 Imaginemos una situación…</strong>
                        <p style="margin:10px 0 0 0;">Imaginemos una situación en la que el peque quiere hacer algo y el adulto le dice que no, que en ese momento no puede hacerlo. Al no poder controlar sus sentimientos, seguramente el peque recurrirá al llanto, ira o incluso a veces golpes como vía de escape.</p>
                        </div>

                        <p>Si reflexionamos, a nosotros, los adultos, en ocasiones nos cuesta mantener esa estabilidad emocional y controlar nuestros enfados, ¿cómo vamos a pensar entonces que los peques saben hacerlo?</p>

                        <p>Son cada vez más los beneficios que aporta la relajación en los peques. No todos van a responder por igual a todas las técnicas de relajación, por eso es importante probar varias y ver cuál es la que mejor se adapta a sus necesidades y al peque en sí.</p>

                        <p>De todos modos, he de decir que ninguna es contraproducente, ya que todas hacen que, en mayor o menor medida, el peque aprenda a regular sus emociones.</p>

                        <h3>¿Por qué los peques necesitan relajarse?</h3>
                        <p>Los peques, al igual que los adultos, atraviesan periodos de su vida con más nerviosismo. Este tipo de situacionesse pueden deber a diversascircunstancias:</p>
                        <ul>
                        <li>Un exceso de deberes en la escuela o cansancio debido al gran número de actividades que realizan tanto en la escuela como fuera de ella.</li>
                        <li>Falta de sueño. Puede que no duerman lo suficiente o no tengan un sueño de calidad.</li>
                        <li>Exceso de información o de estímulos externos. Los peques actuales viven rodeados de estímulos continuos como los aparatos electrónicos. Esos estímulos, además, producen una gran cantidad de información que puede alterar a los peques.</li>
                        </ul>

                        <div class="reading-table">
                        <div class="rt-row"><span>Disminuir la tensión muscular</span><span>💆‍♂️</span></div>
                        <div class="rt-row"><span>Aumenta la confianza y autoestima del peque</span><span>🌟</span></div>
                        <div class="rt-row"><span>Mejora la circulación sanguínea</span><span>🫀</span></div>
                        <div class="rt-row"><span>Control de sus emociones (especialmente enfado)</span><span>🧠</span></div>
                        <div class="rt-row"><span>Ayuda al peque a concentrarse</span><span>🎯</span></div>
                        <div class="rt-row"><span>Mejora la calidad de aprendizaje</span><span>📚</span></div>
                        <div class="rt-row"><span>Reduce la ansiedad</span><span>🌿</span></div>
                        <div class="rt-row"><span>Logra mejorar la calidad del sueño</span><span>😴</span></div>
                        </div>

                        <h3>¿Qué beneficios aportan las técnicas de relajación?</h3>
                        <p>Las técnicas de relajación pueden aportar beneficios a los peques como los siguientes:</p>
                        <ul>
                        <li>Mejora de la calidad del sueño: los peques dormirán mejor y se levantarán con más energía para su día a día.</li>
                        <li>Reducción de tensión muscular: la relajación disminuye la tensión muscular por lo que puede evitar dolores.</li>
                        <li>Control de emociones.</li>
                        </ul>

                        <h3>Técnicas de relajación para peques</h3>
                        <p>Las técnicas de relajación las tendrás que adaptar a la edad de tu peque. Te proponemos algunas ideas:</p>

                        <div class="reading-note">
                        <strong>🫁 1. Control de la respiración</strong>
                        <p style="margin:10px 0 0 0;">Controlar la forma en la que respiramos es una de las formas más sencillas de relajarse. Se trata de que enseñes a tu peque a respirar de forma consciente. Explícale cómo deben notar de qué forma el aire entra por la nariz, llega a los pulmones y sale por la boca lentamente. Puedes comenzar con diez respiraciones lentas y profundas e ir aumentando con el paso de los días, así como combinar este con otros ejercicios de relajación.</p>
                        </div>

                        <div class="reading-note">
                        <strong>💆 2. Hazle un masaje</strong>
                        <p style="margin:10px 0 0 0;">Es una técnica adecuada que les ayudará a relajarse y dormir mejor. Elige una música suave, un ambiente tranquilo y con una temperatura agradable. Masajea suavemente con un poco de aceite para bebé los pies, las piernas, los brazos, el estómago, las manos, el pecho y la espalda.</p>
                        </div>

                        <div class="reading-note">
                        <strong>🧘 3. Enséñales yoga</strong>
                        <p style="margin:10px 0 0 0;">Los peques pueden aprender a controlar su respiración, inhalando el aire por la nariz y soltándolo por la boca. Puedes comenzar por posturas sencillas e ir complicándolas en función del aprendizaje y de la edad del peque. Para esto puedes seguir los siguientes pasos:</p>
                        <ul style="margin:10px 0 0 18px;">
                            <li>Busca un lugar sin ruidos.</li>
                            <li>Extiende una colchoneta.</li>
                            <li>Elige posturas de animales para que tus pequesse diviertan</li>
                        </ul>
                        <p style="margin:10px 0 0 0;">Sugerencias:</p>
                        <p style="margin:6px 0 0 0;">https://youtu.be/-Vfywp1qnxM</p>
                        <p style="margin:6px 0 0 0;">https://youtu.be/4lWkPI5KEW8</p>
                        </div>

                        <h3>Más ideas</h3>
                        <ul>
                        <li><strong>4. Deja que coloreen mandalas:</strong> aprenderán a concentrarse, a controlar su cuerpo, a tener paciencia y, a la vez, reducirán el estrés. Puedes dejar que dibujen ellos los mandalas o imprimir algunos dibujos y animarlosa que los coloreen.</li>
                        <li><strong>5. Ponles a cantar:</strong> cantar una nana a un peque es una de las formas más tradicionales de calmarles. Puedes elegir una canción sencilla y corta, controla el tono para que sea suave o incluso puedes invitarlos a que la canten contigo. Canciones que puedes ocupar: https://youtu.be/Ea6ykVh7Y7U https://youtu.be/- 1ihy3IH-Uo</li>
                        <li><strong>6. Bailar:</strong> es otra forma de liberar tensiones y ponerse en forma, ya que, permite expresar sentimientos y emociones por lo que puede ser una buena vía de escape para la energía que tienen los peques. Elige canciones que les gusten y baila con ellos. Además de ser una actividad divertida, seguro que crea un vínculo más fuerte con tu peque.</li>
                        <li><strong>7. Ayúdale a tensar y destensar músculos:</strong> puedes decirles que abracen fuerte a un peluche y que luego lo suelten gradualmente, acompañando el abrazo con la respiración o puedes decir que simule ser un muñeco de nieve congelado que no puede moverse durante un ratito y, pasado ese rato, dejar que se mueva.</li>
                        <li><strong>8. Practica la técnica del globo:</strong> consiste en que el peque imagen que es un globo, para ello tendrá que inhalar y exhalar aire como un globo, lentamente. Es otra forma de tensar y destensar los músculos para lograr una sensación de relajación.</li>
                        <li><strong>9. Elabora un bote de la calma:</strong> es una técnica que se ha difundido bastante en los últimos años y que es bastante efectiva para peques con rabietas. Solo vas a necesitar un bote de plástico agua, colorante y brillantina de colores. Es importante que lo cierres bien para que no se salga. Cuando el peque se enfade, dale el frasco y deja que lo agite. En el momento en que la brillantina comienza a caer lentamente hacia el fondo, tu peque se irá relajando.</li>
                        <li><strong>10. Ejercicio de la hormiga.</strong> Se trata de una técnica de respiración en la que diremos al peque que se imagine que es un animal muy pequeño como la hormiga y debe respirar como ella. Después, el lado opuesto, debe imaginarse que es un animal grande como el león. Damos la instrucción de que la hormiguita respira lenta y profundamente, mientras que el león lo hace rápido y fuerte. Seguidamente, podemos preguntarle cuál le ha gustado más y le ha dejado más tranquilo para que, de esta forma, aprenda que la manera correcta de respirar es la de la hormiga.</li>
                        <li><strong>11. Técnica de la tortuga:</strong> tenemos que explicar al peque que a partir de ahora se imagine que será una tortuga. Se colocará en el suelo boca abajo y le diremos que el sol está a punto de esconderse y la tortuga tiene que dormir. Por tanto, ha de encoger piernas y brazos poco a poco, muy despacio, hasta ponerlos bajo su espalda, que será el caparazón de la tortuga. Después le diremos que ya es de día y la tortuga ha de comenzar a levantarse porque tiene que hacer un viaje, por lo tanto, ha de sacar piernas y brazos de nuevo muy despacio.</li>
                        <li><strong>12. El robot y el muñeco de trapo.</strong> En este ejercicio damos la instrucción de que imaginen que el robot está fabricado con metal y es rígido, mientras que un muñeco de trapo es blando y flexible. Después, le decimos que debe hacer de robot de forma que sus músculos se tensen, para después imitar a un muñeco de trapo y dejar que todassus extremidadesse relajen.</li>
                        <li><strong>13. Somos marionetas:</strong> esta técnica se basa en que se les dice que son marionetas que están siendo controlados por un marionetista, teniendo un hilo o cuerda en cada extremidad, en la espalda, y la cabeza. Se les va a ir diciendo que el marionetista va tirando de las diferentes cuerdas con el fin de que vayan haciendo diferentes gestos y acciones. Sin embargo, pasado un rato se les dice que el marionetista es torpe y de vez en cuando deja caer una de las cuerdas, con lo que deben dejar totalmente muerta la parte del cuerpo correspondiente durante unos segundos. Esta segunda parte se mantiene durante varios minutos. El juego termina diciendo que al marionetista se le caen todas las cuerdas a la vez y/o deja las marionetas, teniendo que destensar todo el cuerpo.</li>
                        <li><strong>14. Relajación muscular progresiva de Jacobson:</strong> lo primero, pedimos al peque que se sienta en una posición cómoda y que extienda las manos sobre las rodillas. Al inicio, haremos un entrenamiento dándole la instrucción de cada parte del cuerpo.
                            <ul style="margin:10px 0 0 18px;">
                            <li>Debe cerrar lospuñosde las manos muy muy fuerte hasta sentir tensión. Después mantenerladurante 10 segundos, y relajar suavemente.</li>
                            <li>Hombros: se encogen hasta las orejas, se mantiene la tensión durante 10 segundos, y se va liberando poco a poco…</li>
                            <li>Cuello: se lleva al mentón del pecho y después se relaja</li>
                            <li>Boca: se abre la boca, se extiende la lengua, y relajamos</li>
                            <li>Respiración: inspirar profundamente durante unos segundos, y después expirar muy despacio.</li>
                            <li>Espalda: se inclina la espalda hacia adelante, se mantiene la posición y se recupera.</li>
                            <li>Pies: se estiran los dedos como si quisiéramos ponernos de puntillas, aguantamos y recuperamos la posición.</li>
                            </ul>
                        </li>
                        </ul>

                        <h3>Referencias:</h3>
                        <ul>
                        <li>Educo. (11 de agosto 2020). 10 ejercicios de relajación para niños y niñas. Educo Educar cura. Disponible en: https://www.educo.org/blog/10-ejercicios-de￾relajacion-para-ninos-y-ninas</li>
                        <li>Educrea. (2023). 14 ejercicios de relajación para niños. Educrea. Disponible en: https://educrea.cl/14- ejercicios-de-relajacion-para-ninos/</li>
                        <li>Red Cenit. (23 de julio 2020). Técnicas de relajación para niños por edades. Red Cenit, Centros de Desarrollo Cognitivo. Disponible en: https://www.redcenit.com/tecnicas-de-relajacion-para ninos-por-edades/</li>
                        </ul>
                    `
                },

                {
                    id: 14,
                    titulo: "Autoconcepto y autoestima: lo que tu peque cree de sí mismo lo cambia todo",
                    resumen: "Las palabras, el juego y el ambiente que rodean a tu peque construyen su identidad. Aquí encontrarás actividades claras para fortalecer su autoconcepto, autoestima y personalidad en su proceso de socialización.",
                    imagen: "assets/img/articulos/13.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <p><strong>Autoconcepto, autoestima y personalidad en los procesos de socialización</strong></p>

                        <div class="reading-note">
                        <strong>💬 Idea clave</strong>
                        <p style="margin:10px 0 0 0;">La manera en la que un peque se percibe a sí mismo, y cómo se siente con esa percepción, influye directamente en su forma de relacionarse con el mundo.</p>
                        </div>

                        <h3>Autoconcepto</h3>
                        <p>El autoconcepto es la percepción o imagen que una persona tiene sobre sí misma. Es lo que una persona cree que es, y se construye a partir de las experiencias, el ambiente y la interacción con otros.</p>

                        <h3>Autoestima</h3>
                        <p>La autoestima es la valoración que una persona hace sobre sí misma. Tiene que ver con cómo se siente respecto a lo que cree que es, y se relaciona con la seguridad personal, la confianza y el bienestar emocional.</p>

                        <h3>Personalidad</h3>
                        <p>La personalidad se entiende como el conjunto de características emocionales y conductuales que hacen única a una persona. Incluye formas de sentir, pensar y actuar, y se construye en interacción con el entorno y con los vínculos cercanos.</p>

                        <div class="reading-note">
                        <strong>✨ Actividades para trabajar la autoestima</strong>
                        <p style="margin:10px 0 0 0;">A continuación, se presentan actividades para trabajar la autoestima en los peques:</p>
                        </div>

                        <ul>
                        <li>La caja de fortalezas: en una caja, pueden ir guardando mensajes con cualidades, logros y fortalezas del peque.</li>
                        <li>El espejo: frente al espejo, invitar al peque a decir cosas positivas sobre sí mismo.</li>
                        <li>El frasco de logros: colocar papelitos con logros o avances del peque para leerlos cuando lo necesite.</li>
                        </ul>

                        <div class="reading-note">
                        <strong>🎭 Actividades para trabajar la personalidad</strong>
                        <p style="margin:10px 0 0 0;">Se pueden hacer dinámicas para que el peque se exprese y se conozca mejor:</p>
                        </div>

                        <ul>
                        <li>Hacer una ficha en la que pondremos arriba “si fuera…sería” y el peque completa: si fuera un color, sería… si fuera un animal, sería… si fuera una emoción, sería…</li>
                        <li>El juego de roles: representar situaciones sociales (saludar, pedir ayuda, compartir) para observar cómo se expresa y reforzar habilidades sociales.</li>
                        <li>El cuento personal: inventar un cuento donde el protagonista sea el peque y reconocer sus cualidades y capacidades.</li>
                        </ul>

                        <h3>Referencias</h3>
                        <ul>
                        <li>Ministerio de Educación. (2019). Autoconcepto, autoestima y personalidad en los procesos de socialización.</li>
                        </ul>
                    `
                },

                {
                    id: 15,
                    titulo: "Apps que sí aportan: aprendizaje con intención (sin reemplazar la infancia) 📱✨",
                    resumen: "La tecnología no tiene por qué ser enemiga: con límites, acompañamiento y buenas apps, tu peque puede aprender, crear y descubrir… sin perder el juego libre ni la conexión real.",
                    imagen: "assets/img/articulos/14.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                        <p><strong>Aplicaciones educativas para peques</strong></p>

                        <div class="reading-note">
                        <strong>💛 Nota importante</strong>
                        <p style="margin:10px 0 0 0;">Las aplicaciones educativas pueden convertirse en una herramienta valiosa para estimular el aprendizaje, la curiosidad y el desarrollo de habilidades, siempre que se usen con límites y acompañamiento de un adulto.</p>
                        </div>

                        <p>En la era digital, los peques crecen rodeados de tecnología, y aunque siempre es importante el juego físico, las aplicaciones educativas pueden convertirse en aliadas del aprendizaje, si se eligen bien y se usan con moderación.</p>

                        <p>Hoy en día, existen un sinfín de investigaciones que explican que algunas apps no solo entretienen a los peques, sino que también pueden ayudarles a desarrollar su mente, su forma de hablar y hasta su creatividad.</p>

                        <div class="reading-note">
                        <strong>📚 Un estudio que vale la pena conocer</strong>
                        <p style="margin:10px 0 0 0;">Un estudio llamado “Evaluando y aplicando software educativo: una experiencia de investigación y docencia” (Pedro Méndez, 2003), analizó cómo el uso de apps educativas, cuando se usan como parte de actividades bien pensadas, puede ayudar mucho al aprendizaje de niños en edad preescolar.</p>
                        </div>

                        <p>Este estudio se basó en ideas del psicólogo Vygotsky, quien hablaba sobre lo importante que es el acompañamiento de un adulto y la interacción con otros para aprender se hizo una prueba con peques de 4 años para ver si estas herramientas podían apoyar su desarrollo del lenguaje y la escritura, los resultados mostraron que, si el software está bien hecho y hay un adulto que guía el proceso, puede ser una gran herramienta para que los niños entiendan mejor ciertos conceptos y aprendan de forma más significativa.</p>

                        <h3>Aquí te compartimos algunas de las aplicaciones más recomendadas y por qué pueden ser de utilidad:</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>ScratchJr</strong> – Creatividad y pensamiento lógico</span><span>🧩</span></div>
                        </div>
                        <p>Esta app permite que peques de 5 a 7 años creen sus propias historias animadas mientras aprenden conceptos básicos de programación ayudando a los peques a resolver problemas de manera lógica, además de fomentar su creatividad y colaboración</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>ABCmouse</strong> – Aprendizaje integral en preescolar</span><span>📖</span></div>
                        </div>
                        <p>Perfecta para peques de 2 a 8 años, ABCmouse ofrece actividades de lectura, matemáticas, ciencias y arte.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>APPTK</strong> – Guía confiable de apps para peques y jóvenes</span><span>🛡️</span></div>
                        </div>
                        <p>APPTK es una plataforma que se encarga de evaluar y recomendar aplicaciones digitales para peques y adolescentes. Su objetivo principal es ayudar a padres y docentes a elegir apps seguras, educativas y adecuadas a la edad.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Duolingo</strong> – Optimización del aprendizaje del inglés en primaria</span><span>🌍</span></div>
                        </div>
                        <p>Duolingo, es una herramienta facilitadora en el aprendizaje de los idiomas.</p>

                        <p>Estas aplicaciones están respaldadas por investigaciones que demuestran mejoras en vocabulario, comprensión, pensamiento computacional, actitudes hacia el aprendizaje y más.</p>

                        <div class="reading-note">
                        <strong>✅ Consejos para usar apps de forma saludable</strong>
                        <ol style="margin:10px 0 0 18px;">
                            <li>Acompaña a tu peque mientras juega, ¡aprendan juntos!</li>
                            <li>Establece tiempos cortos de uso (20-30 min) para evitar sobreestimulación.</li>
                            <li>Alterna tecnología con actividades físicas, arte y juego libre.</li>
                        </ol>
                        </div>

                        <p>Aunque las pantallas no deben ser el eje central en la infancia, es innegable que vivimos en un mundo digital, y enseñar a los peques a usarlas con propósito es una habilidad clave para su futuro. Las aplicaciones educativas, cuando son seleccionadas cuidadosamente y usadas en la compañía de un adulto, pueden convertirse en herramientas poderosas para el desarrollo.</p>

                        <div class="reading-note">
                        <strong>🌿 Lo más importante</strong>
                        <p style="margin:10px 0 0 0;">Lo más importante es recordar que la tecnología no reemplaza el juego libre, la interacción social, el tiempo en la naturaleza ni la creatividad sin pantallas. El rol de los adultos es clave: acompañar, guiar, limitar el tiempo frente a la pantalla y reforzar lo aprendido fuera del entorno digital.</p>
                        </div>

                        <p>Al equilibrar el mundo físico y el digital, estas herramientas pueden convertirse en aliados valiosos para que los niños desarrollen curiosidad, confianza y habilidades para su futuro.</p>

                        <h3>Referencias</h3>
                        <ul>
                        <li>Christakis, D. Cheung, C. H., & Lee, W. C. (2024). Effects of ScratchJr on computational thinking in early childhood education: A randomized controlled trial. https://pdf.sciencedirectassets.com/313379/1-s2.0-S2405844023X00231</li>
                        <li>Méndez, P. (2003). Evaluando y aplicando software educativo: una experiencia de investigación y docencia. Revista de Pedagogía, 24(70), 75–94.https://ve.scielo.org/scielo.php?script=sci_arttext&pid=S0798-97922003000100003&lang=es</li>
                        <li>Cencerrado Malmierca, Luis Miguel, Pelosi, Sofia, & Yuste Tuero, Elisa. (2018). Recomendar contenidos digitales para niños y jóvenes: reflexiones, herramientas y criterios. Palabra clave, 7(2), 5-6. r/scielo.php?script=sci_arttext&pid=S1853-99122018000100005&lang=es</li>
                        <li>Strawhacker, A., & Bers, M. U. (2021). What they learn by building: Children’s learning experiences in early coding environments. Frontiers in Education, 6, 657895.https://api.pageplace.de/preview/DT0400.9781000194500_A39675062/preview-9781000194500_A39675062.pdf</li>
                        <li>Bernal Rodríguez, S., & Ramírez Valencia, A. (2020). Optimización del aprendizaje del inglés en niños de primaria con el uso de Duolingo. Boletín Redipe, 9(4), 232–249. hhttps://dialnet.unirioja.es/servlet/articulo?codigo=7528419ttps://www.scielo.org.ar/scielo.php?script=sci_arttext&pid=S1853-99122018000100005&lang=es</li>
                        </ul>
                    `
                },


                {
                    id: 16,
                    titulo: "Mamitis y apego: cuando tu peque solo quiere a mamá (y es normal)",
                    resumen: "Esta etapa puede cansar, confundir y hasta preocupar… pero también es una señal hermosa de vínculo. Aprende por qué ocurre la “mamitis” y cómo acompañarla con calma, rutinas y empatía.",
                    imagen: "assets/img/articulos/15.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <p><strong>Apego en peques</strong></p>

                        <p>Es común que, entre los 12 y 18 meses, muchos peques pasen por una etapa de apego más intenso con mamá, lo que culturalmente llamamos “mamitis”, acompañada de regresiones en el sueño, como volver a dormir en la cama de los padres o retomar tomas nocturnas que ya habían sido superadas.</p>

                        <p>Sabemos que, estos cambios pueden generar inquietud o sensación de retroceso, pero en realidad forman parte del desarrollo normal infantil.</p>

                        <h3>¿Por qué ocurre el apego?</h3>
                        <p>A los 15-16 meses, los peques experimentan un periodo fuerte de ansiedad por separación. Comienzan a entender que mamá puede alejarse, pero aún no comprenden la permanencia total, lo que incrementa su necesidad de estar cerca de ella, especialmente en las noches.</p>

                        <h3>¿Por qué ocurre esta etapa?</h3>
                        <p>El apego suele aparecer por varios motivos que están relacionados con el desarrollo emocional:</p>
                        <ul>
                        <li>Nacimiento del apego: el peque aprende quién lo cuida y quién calma sus angustias, de modo que busca esa seguridad constantemente.</li>
                        <li>Miedo a lo nuevo: explorando nuevas experiencias puede sentir miedo y, de pronto, la cercanía de mamá lo tranquiliza.</li>
                        <li>Cambios en la rutina: la entrada a guardería, viajes, ausencias o cambios de casa pueden reactivar esta necesidad de cercanía.</li>
                        </ul>

                        <p>Este comportamiento suele intensificarse entre los 8 y 15 meses, aunque puede reaparecer más adelante en momentos de desarrollo o cambios importantes.</p>

                        <div class="reading-note">
                        <strong>💛 ¿Qué significa esa señal?</strong>
                        <p style="margin:10px 0 0 0;">Es una señal de un vínculo fuerte y saludable. El apego seguro reflejado en esa necesidad de mamá es fundamental para el desarrollo de confianza y autonomía futura del peque. La clave está en acompañar al peque con calma y respeto, en lugar de tratar de “corregir” su comportamiento o ignorar sus sentimientos.</p>
                        </div>

                        <h3>Estrategias prácticas para acompañar la mamitis</h3>
                        <p>Aquí hay algunas maneras en las que nosotros juntos con sus papás podemos apoyar al peque con amor y paciencia:</p>
                        <ol>
                        <li><strong>Acompañar sin culpas</strong><br>La mamá o el cuidador principal no está haciendo nada “mal”. El llanto o la búsqueda constante no son señales de falta de cariño, sino de una necesidad emocional legítima.</li>
                        <li><strong>Mantener rutinas predecibles</strong><br>Explicar con calma lo que va a ocurrir (por ejemplo: “Mamá regresa después de que termines tu juego”) ayuda al peque a entender que las separaciones son temporales.</li>
                        <li><strong>Enseñar a otros cuidadores a participar</strong><br>Permitir que otros adultos de confianza estén presentes en momentos positivos ayuda al peque a aprender que no solo mamá lo puede consolar.</li>
                        <li><strong>Dar avisos antes de separarse</strong><br>Avisar con unos minutos de anticipación (“en un ratito voy a trabajar”) ayuda al peque a prepararse emocionalmente para la separación.</li>
                        <li><strong>Paciencia y empatía</strong><br>No hay atajos mágicos; acompañar a los peques con ternura y seguridad fortalece su confianza para explorar el mundo.</li>
                        </ol>

                        <h3>¿Cuándo pedir ayuda profesional?</h3>
                        <p>Aunque la mamitis es normal, si notas que el peque muestra miedo extremo a separarse, mantiene un malestar intenso durante mucho tiempo más allá de los 4-5 años, o que la ansiedad afecta la vida cotidiana familiar, puede ser útil consultar con un profesional de la salud emocional o un psicólogo infantil.</p>

                        <h3>Referencias</h3>
                        <ul>
                        <li>Hacer Familia. (s. f.). La mamitis entra a formar parte del diccionario de la RAE. Recuperado de https://www.hacerfamilia.com/actualidad/mamitis-entra-formar￾parte-diccionario-rae Hacer Familia</li>
                        <li>Mi Bebé y Yo. (s. f.). Mamitis en bebés y niños: por qué ocurre y cómo actuar. Recuperado de https://mibebeyyo.elmundo.es/ninos/salud-bienestar/psicologia￾infantil/mamitis-175 Mibebeyyo</li>
                        <li>Etapa Infantil. (s. f.). ¿Tu hijo tiene ‘mamitis’? No te preocupes, es normal. Recuperado de https://www.etapainfantil.com/hijo-mamitis-no-preocupes-es￾normal Etapa Infantil</li>
                        <li>Fundación Compartamos. (s. f.). Entender y acompañar en la etapa de “mamitis”.</li>
                        </ul>
                    `
                },

                {
                    id: 17,
                    titulo: "🌊 Que el agua no le asuste: acompaña a tu peque a sentirse valiente y seguro",
                    resumen: "Si tu peque siente miedo al agua, respira… es más común de lo que imaginas. Con paciencia, juego y acompañamiento amoroso, puedes ayudarle a transformar el temor en confianza y diversión.",
                    imagen: "assets/img/articulos/17.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px;">¿Cómo ayudar a mi peque a perder el miedo al agua?</h1>

                        <p>Antes de que tu peque aprenda a nadar, es necesario que venza el miedo al agua, por lo que, te presentamos cinco consejos para lograrlo:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>Proporciónale seguridad</span><span>🫶</span></div>
                        <div class="rt-row"><span>Adaptación progresiva</span><span>🌊</span></div>
                        <div class="rt-row"><span>No obligarle</span><span>🤍</span></div>
                        <div class="rt-row"><span>Prestarle ayuda instrumental</span><span>🛟</span></div>
                        <div class="rt-row"><span>El agua como juego</span><span>🎈</span></div>
                        </div>

                        <ol style="margin-top:20px; line-height:1.8;">
                        <li><strong>Proporciónale seguridad:</strong> para vencer el miedo, es necesario que el peque 
                        se sienta seguro en el entorno acuático. Por eso, sus primeros contactos 
                        deben realizarse siempre en compañía de un adulto que le proteja y evite 
                        que el niño se lleve algún susto, que incremente su miedo.</li>

                        <li><strong>Adaptación progresiva:</strong> el contacto con el agua, tanto del mar como de la 
                        piscina, debe realizarse en pequeños pasos. En vez de meter de golpe al 
                        peque en el agua, es mejor jugar con él un rato en la orilla, o sentado en el 
                        bordillo, para que note las primeras sensaciones.</li>

                        <li><strong>No obligarle:</strong> forzarle a bañarse o castigarle y reprenderle por no querer 
                        hacerlo tan solo servirá para aumentar la hostilidad del peque hacia el
                        medio acuático. Se debe tener paciencia, no acelerar la inmersión y dejar 
                        que él mismo establezca su ritmo.</li>

                        <li><strong>Prestarle ayuda instrumental:</strong> flotadores, manguitos, burbujas o chalecos 
                        son algunos de los instrumentos acuáticos que se pueden proporcionar al 
                        pequeño para incrementar su seguridad en el agua. Es preciso mostrarles 
                        poco a poco, nunca de golpe, que gracias a estos objetos pueden 
                        mantenerse a flote. Recuerda que siempre hay que comprobar que sean 
                        seguros y que estén adaptados a la edad del pequeño.</li>

                        <li><strong>El agua como juego:</strong> a través del juego se puede conseguir que los niños 
                        pierdan el temor al agua y que, en vez de percibirla como un elemento 
                        peligroso, la consideren como un medio divertido.</li>
                        </ol>

                        <div class="reading-note" style="margin-top:30px;">
                        <strong>🏊 Beneficios de la natación</strong>
                        <p style="margin-top:10px;">La natación no solo es un entrenamiento muy útil para evitar ahogamientos infantiles, sino que es muy beneficioso para aumentar la capacidad respiratoria y pulmonar de los niños, y estimular su desarrollo psicomotor.</p>
                        <p>Aquí te presentamos algunos trucos para ayudar a tu peque a perder miedo al agua y sentirse seguro.</p>
                        </div>

                        <h3>1. Enséñale a hacer burbujas para controlar la respiración</h3>
                        <p>Para enseñarle a respirar de forma correcta, lo mejor es ensayar antes en la bañera, para él será un juego, pero estará practicando una respiración fundamental para aprender a nadar. Pídele a tu peque que coja aire o inspire por la nariz, después que contenga la respiración por unos segundos, y luego sumerja la boca al agua y expulse el aire por la boca haciendo burbujas en el agua. No hace falta que meta toda la cabeza bajo el agua. Puede hacerlo primero tú, para que tu peque vea y aprenda.</p>
                        <p>Repite este ejercicio varias veces hasta que tu peque se sienta a gusto haciéndolo.</p>

                        <h3>2. Enséñale a meter la cabeza en el agua</h3>
                        <p>Una vez que el niño ya se divirtió con el juego de las burbujas, es hora de dar un paso más. Pídele que al hacer las burbujas meta la cara en el agua, al principio bastará que lo haga por uno segundos, es decir, el tiempo que el peque se sienta seguro. La primera vez le sorprenderá, pero al ver que las burbujas siguen saliendo y que no ocurre nada, perderá el miedo, una vez que haya perdido el miedo dile que intente meter toda la cabeza en el agua utilizando el mismo juego. Si se asusta por el ascenso de las burbujas por la nariz, pídele que lo intente con la cabeza mirando hacia un lado.</p>

                        <h3>3. Enséñale a mover las piernas y los brazos</h3>
                        <p>Para que tu peque aprenda a mover las piernas dentro del agua, sujétale con la mano por la barriga y ayúdale a mantenerse horizontal, perpendicular al suelo de la piscina.</p>

                        <p>Los niños tienden a hundir las piernas y el cuerpo al principio, pero antes de que eso ocurra pídele que mueva sus piernas hacia arriba y abajo, sin flexionar las rodillas.</p>

                        <p>Una vez que aprenda a mover las piernas, tu peque debe aprender a mover los brazos, para ello será necesario dar brazadas con los brazos estirados hacia delante, moviéndolos arriba y abajo, mientras lo sujetas por el abdomen.</p>

                        <p>Pídele que practique estos ejercicios con las piernas y los brazos, varias veces.</p>

                        <h3>4. Coordinación de los movimientos de brazos y piernas</h3>
                        <p>Ahora debe coordinar los dos ejercicios anteriores, el de las burbujas y el movimiento de piernas, para esto será necesario que lo sujetes por las axilas y le pidas que haga burbujas mientras mueve las piernas. Una vez aprendido esto deja que lo practique él solo.</p>

                        <p>Cuando ya tenga confianza en sí mismo y esté practicando burbujas y movimiento de piernas, suéltale unos segundos para que se dé cuenta de que puede hacerlo solo. Así aprenderá a mantenerse a flote en el agua.</p>

                        <h3>5. Estando en la piscina, empiecen en donde no cubre el agua</h3>
                        <p>Cuando tu peque ya pierda el miedo al agua, puede empezar a aprender a moverse en un sitio en el que pueda tocar el fondo con sus pies. Esto le ofrecerá seguridad y confianza para seguir aprendiendo a nadar, ya que, uno de los principales problemas de los niños al aprender a nadar es el miedo a hundirse. Si sabe que puede apoyar los pies, el miedo desaparecerá y eso le dará una dosis extra de confianza.</p>

                        <div class="reading-note">
                        <strong>Nota importante:</strong>
                        <p style="margin-top:10px;">recuerda que tu peque no aprenderá en un minuto, ni en un día, por eso hay que tener paciencia y respetar su proceso, pero con ayuda de estos ejercicios y de la práctica diaria, el niño aprenderá a nadar.</p>
                        <p>La motivación que le ofrezcas es esencial para que tu peque aprenda a nadar bien.</p>
                        </div>

                        <h3>Referencias:</h3>
                        <ul>
                        <li>Esteban, E. (9 de junio de 2021). 7 pasos para enseñar a nadar a un niño. Guíainfantil.com. Disponible en: https://www.guiainfantil.com/articulos/educacion/aprendizaje/7-pasos￾para- ensenar-a-nadar-a-un-nino/</li>
                        <li>Vázquez-Reina, M. (18 de abril de 2012). Niños con miedo al agua: cinco consejos para superarlo. Consumer. Disponible en: https://www.consumer.es/bebe/ninos-con-miedo-al-agua-cinco-consejos￾para-superarlo.html</li>
                        </ul>

                    </div>
                    `
                },

                {
                    id: 18,
                    titulo: "🤍 Cólicos en tu peque: cuando el llanto duele… y tú solo quieres ayudar",
                    resumen: "Hay noches en las que sientes que ya lo intentaste todo y el llanto no para. Respira: no estás sola. Este artículo te guía con claridad, calma y estrategias amorosas para acompañar a tu peque durante los cólicos.",
                    imagen: "assets/img/articulos/18.jpg",
                    categoria: "Extras",
                    contenido: `
                    <div class="reading-view">

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232, 76, 154, 0.10), rgba(59, 182, 196, 0.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">🤍 Acompañamiento con calma</strong>
                        <p style="margin:10px 0 0 0;">Mi peque tiene cólicos ¿Qué puedo hacer?</p>
                        </div>

                        <h1 style="font-size:32px; line-height:1.2; margin-top:18px;">Mi peque tiene cólicos ¿Qué puedo hacer?</h1>

                        <p>Si alguna vez has cuidado o tenido un recién nacido, seguro te has encontrado 
                        con esos momentos en los que el peque llora desconsoladamente sin razón 
                        aparente, y por más que lo cargues, arrulles o cantes el llanto parece no parar. 
                        ¡Tranquila, no estás sola!, probablemente ese llanto tenga nombre: cólico del 
                        lactante.</p>

                        <p>Los cólicos son muy comunes durante los primeros meses de vida y, aunque suelen 
                        ser desesperantes, no representan una enfermedad grave. Entender qué los causa, 
                        cómo reconocerlos y qué estrategias ayudan a calmarlos puede marcar una gran 
                        diferencia tanto para el bienestar del peque como para la tranquilidad de quienes 
                        lo cuidan.</p>

                        <p>Aquí te contamos qué son los cólicos, por qué ocurren, cómo reconocerlos, qué 
                        puede ayudar y algunas actividades que puedes realizar para relajar a tu peque.</p>

                        <div class="comunidad-section-header" style="margin-top:22px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">¿Qué son los cólicos en peques?</h3>
                        </div>

                        <p>Los cólicos del lactante son episodios de llanto intenso y prolongado en peques 
                        sanos, sin que haya una causa médica aparente. Se consideran cólicos cuando el 
                        llanto dura más de 3 horas al día, al menos 3 días por semana y durante 3 semanas 
                        seguidas (criterios de Wessel).</p>

                        <p>Estos episodios suelen comenzar entre la segunda y tercera semana de vida, 
                        alcanzar su punto máximo hacia las seis semanas y disminuir hacia los tres o cuatro 
                        meses (Cavada & Perelló, 2013).</p>

                        <div class="reading-note">
                        <strong>✨ Tranquilidad</strong>
                        <p style="margin:10px 0 0 0;">Aunque los cólicos pueden generar mucha angustia, no son peligrosos ni afectan 
                        el desarrollo del peque y con el tiempo desaparecen de manera natural.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:22px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">¿Por qué ocurren los cólicos?</h3>
                        </div>

                        <p>La ciencia todavía no tiene una respuesta definitiva, pero sí varias teorías que 
                        podrían explicarlos. Algunas de las más aceptadas incluyen:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>Inmadurez digestiva</span><span>🫄</span></div>
                        <div class="rt-row"><span>Microbiota intestinal</span><span>🦠</span></div>
                        <div class="rt-row"><span>Sensibilidad alimentaria</span><span>🥛</span></div>
                        <div class="rt-row"><span>Factores emocionales o ambientales</span><span>🌙</span></div>
                        </div>

                        <ul>
                        <li>• Inmadurez digestiva: el intestino del peque aún está aprendiendo a trabajar, 
                        por lo que puede acumular aire o tener movimientos intestinales irregulares.</li>
                        <li>• Microbiota intestinal: algunos peques tienen un desequilibrio en las bacterias 
                        “buenas” del intestino.</li>
                        <li>• Sensibilidad alimentaria: ciertos componentes de la leche (como la proteína de 
                        la leche de vaca) pueden causar molestias en algunos peques.</li>
                        <li>• Factores emocionales o ambientales: el estrés, los ruidos fuertes o cambios en la 
                        rutina pueden influir en la sensibilidad del peque.</li>
                        </ul>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>🛡️ En resumen</strong>
                        <p style="margin:10px 0 0 0;">En resumen, los cólicos no se deben a “mala crianza” ni a que el peque esté 
                        enfermo; son una etapa pasajera en su desarrollo.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:22px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">¿Cómo saber si son cólicos?</h3>
                        </div>

                        <p>Algunas señales típicas que pueden ayudarte a reconocerlos son:</p>
                        <ul>
                        <li>• Llanto intenso, repentino y prolongado, que suele aparecer por las tardes o 
                        noches.</li>
                        <li>• El peque aprieta los puños, enrojece la cara o encoge las piernas hacia el 
                        abdomen.</li>
                        <li>• No se calma fácilmente con la alimentación o el cambio de pañal.</li>
                        <li>• Entre episodios, el peque come y duerme con normalidad.</li>
                        </ul>

                        <div class="reading-note" style="border-left-color: var(--error); background:#FEF2F2;">
                        <strong>⚠️ Atención</strong>
                        <p style="margin:10px 0 0 0;">Si el peque tiene fiebre, vómito, diarrea, sangrado o se muestra muy decaído, no 
                        debe asumirse que son cólicos y es importante consultar con un pediatra.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:22px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Qué puedes hacer para aliviar los cólicos:</h3>
                        </div>

                        <p>Aunque no existe un remedio “mágico”, hay varias estrategias que pueden aliviar 
                        al peque y reducir los episodios:</p>

                        <ul>
                        <li>• Masajitos abdominales suaves con movimientos circulares en sentido de las 
                        manecillas del reloj.</li>
                        <li>• Colocar al peque boca abajo sobre tu antebrazo mientras lo sostienes y lo 
                        meces suavemente (posición del “tigre sobre el árbol”).</li>
                        <li>• Baños tibios que ayuden a relajar su pancita y músculos.</li>
                        <li>• Ruido blanco o música suave, como el sonido del secador, la lluvia o el latido 
                        del corazón.</li>
                        <li>• Pasear al peque cargado o en portabebés (el movimiento rítmico puede 
                        calmarlo).</li>
                        <li>• Eructar después de cada toma, especialmente si usa biberón.</li>
                        <li>• Ambiente tranquilo: luces tenues, evitar ruidos fuertes y mantener rutinas 
                        predecibles.</li>
                        </ul>

                        <div class="comunidad-section-header" style="margin-top:22px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Actividades o estrategias para relajar al peque</h3>
                        </div>

                        <p>Estas actividades, además de ayudar con los cólicos fortalecen el vínculo afectivo 
                        y promueven la sensación de seguridad:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>Masaje con contacto visual</span><span>👀</span></div>
                        <div class="rt-row"><span>“Paseo del globo”</span><span>🚲</span></div>
                        <div class="rt-row"><span>Baño relajante con música suave</span><span>🛁</span></div>
                        <div class="rt-row"><span>Porteo con calma</span><span>🤱</span></div>
                        <div class="rt-row"><span>Rutina de calma antes de dormir</span><span>🌙</span></div>
                        </div>

                        <ul>
                        <li>• Masaje con contacto visual: Coloca al peque boca arriba, míralo a los ojos y 
                        háblale suavemente mientras realizas movimientos circulares en su abdomen y 
                        piernas.</li>
                        <li>• “Paseo del globo”: Mueve sus piernitas suavemente como si pedaleara una 
                        bicicleta. Esto ayuda a liberar gases y aliviar la presión abdominal.</li>
                        <li>• Baño relajante con música suave: Prepara un baño tibio con una luz tenue, 
                        música relajante o sonidos de la naturaleza.</li>
                        <li>• Porteo con calma: Usa un rebozo o fular y camina despacio. El contacto piel 
                        con piel, el movimiento y tu voz pueden reconfortar al peque.</li>
                        <li>• Rutina de calma antes de dormir: Establece un pequeño ritual: apagar luces, 
                        cantar una canción suave o hacer respiraciones lentas con el peque recostado 
                        sobre tu pecho.</li>
                        </ul>

                        <div class="reading-note" style="margin-top:24px;">
                        <strong>🤍 Cierre</strong>
                        <p style="margin:10px 0 0 0;">Los cólicos son una etapa compleja, pero temporal. Lo más importante es 
                        mantener la calma, cuidar tu bienestar emocional y de tu peque.</p>
                        <p style="margin:10px 0 0 0;">Con paciencia, cariño y apoyo, esta etapa pasará antes de lo que imaginas.</p>
                        </div>

                        <h3>Bibliografía</h3>
                        <p>Cavada, G., & Perelló, J. (2013). Cólicos del lactante: una revisión actualizada. 
                        Revista Pediatría de Atención Primaria, 15(59), 191–200.<br>
                        https://scielo.isciii.es/scielo.php?script=sci_arttext&pid</p>

                        <p>Benninga, M. A., Faure, C., Hyman, P. E., St James Roberts, I., Schechter, N. L., & 
                        Nurko, S. (2016). Childhood functional gastrointestinal disorders: 
                        Neonate/toddler. Gastroenterology, 150(6), 1443–1455.<br>
                        https://www.ncbi.nlm.nih.gov/books/NBK568787/</p>

                        <p>Sung, V., & Collett, S. (2018). Infantile colic: Management and evidence review. 
                        American Family Physician, 98(10), 577–582. <br>
                        https://www.aafp.org/pubs/afp/issues/2015/1001/p577.pdf</p>

                        <p>Zeevenhooven, J., Browne, P. D., L’Hoir, M. P., Benninga, M. A., & de Weerth, C. 
                        (2018). Infant colic: mechanisms and management. Nature Reviews 
                        Gastroenterology & Hepatology, 15(8), 479–496. <br>
                        https://f1000research.com/articles/7-1426/v1</p>

                    </div>
                    `
                },
                {
                    id: 19,
                    titulo: "🥑 BLW con amor y confianza: cuando tu bebé aprende a comer… a su ritmo",
                    resumen: "Ver a tu bebé descubrir la comida con sus propias manos es emocionante. Este artículo te guía paso a paso para aplicar BLW de forma respetuosa, segura y tranquila, cuidando señales, tiempos y desarrollo.",
                    imagen: "assets/img/articulos/19.jpg",
                    categoria: "Sensorial",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Baby Led Weaning</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(250, 204, 21, 0.18), rgba(59, 182, 196, 0.12)); border-left-color: var(--yellow-main);">
                        <strong style="display:block; font-size:16px;">🥄 Alimentación respetuosa</strong>
                        <p style="margin:10px 0 0 0;">¿Qué es?</p>
                        </div>

                        <p>EL BLW también conocido como alimentación autorregulada por el bebé o a 
                        demanda es el inicio de la alimentación complementaria en forma de alimentos 
                        enteros, en lugar de triturados, de esta manera, es una forma de ofrecer la 
                        alimentación en la que al bebé se le permite “dirigir” el proceso desde
                        el principio. Los padres deciden qué ofrecen (y es su responsabilidad ofrecer 
                        comida sana, segura y variada), pero el bebé coge por sí mismo la comida que se 
                        pone a su alcance; decidiendo qué elige comer y cuánta cantidad.</p>

                        <h3>¿Cuál es su origen?</h3>
                        <p>A raíz de las recomendaciones de la OMS en el año 2002 de iniciar la AC a los 6 
                        meses, padres y profesionales comienzan a cuestionar la necesidad de los 
                        triturados30-31. Pese a tener un origen empírico, hay cada vez más trabajos 
                        metodológicamente serios que han estudiado su aplicabilidad, riesgos y resultados a 
                        medio y largo plazo.</p>

                        <h3>¿Cómo se pone en práctica?</h3>
                        <ul>
                        <li>• Elbebé se sienta a la mesa con la familia en las comidas.</li>
                        <li>• Se le ofrece la misma comida (sana) que, al resto, en trozos de alimentos de 
                        consistencia blanda y apropiados a su desarrollo psicomotor (grandes al 
                        principio, posteriormente pequeños).</li>
                        <li>• El bebé se alimenta por sí solo desde el principio; al comienzo con las manos y 
                        posteriormente con cubiertos.</li>
                        <li>• A partir del momento en que se inicia el BLW el aporte de leche (materna o 
                        artificial) continúa siendo a demanda, sin relación con los momentos familiares de la 
                        comida.</li>
                        </ul>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>¿Cuándo empezar?</strong>
                        </div>

                        <ul>
                        <li>• Tener alrededor 6m: se considera preparación a nivel de maduración renal, 
                        inmunológica, gastrointestinal, neurológica y psicomotriz</li>
                        <li>• Tono axial y sostén cefálico</li>
                        <li>• Sedestación estable sin apoyo</li>
                        <li>• Abrir la boca cuando se le ofrece algo</li>
                        <li>• Interés por manipular alimentoscon las manos</li>
                        <li>• Coordinación motora ojos-mano-boca</li>
                        <li>• Desaparición de reflejo de extrusión</li>
                        <li>• Capacidad de realizar movimientos masticatorios y de la lengua</li>
                        <li>• Ventana de oportunidad: 6-10 meses</li>
                        </ul>

                        <h3>¿Es válido para todos los bebés?</h3>
                        <p>El BLW se ha estudiado en niños nacidos a término, sanos y con un desarrollo 
                        psicomotor normal, tanto alimentados al pecho como con lactancia artificial. Con 
                        la información y precaución adecuadas, la mayoría de las familias pueden
                        practicar BLW de forma segura y eficaz. En niños prematuros se podría valorar 
                        individualmente, pero siempre atendiendo a la edad corregida de 6 meses. No se 
                        recomienda en niños con fallo de medro, dificultades neurológicas o motoras.</p>

                        <h3>¿Se pueden dar triturados si se aplica el BLW?</h3>
                        <p>A pesar de que no hay consenso claro sobre la definición de BLW, la definición más 
                        clásica asume que es el bebé el único que coge los alimentos, sin que el adulto “le 
                        dé de comer”. Sin embargo, muchos padres optan por un BLW mixto, en el que 
                        combinan dejar que el bebé experimente por sí mismo con la comida a la vez que 
                        le ofrecen algún puré o papilla en alguna de las comidas.</p>

                        <h3>¿Cómo se debe ofrecer la comida si se realiza BLW?</h3>
                        <p>Al principio se debe ofrecer la comida tipo finger food o en palitos. Así, el bebé 
                        puede agarrar la comida con su puño y comer lo que sobresale. Cuando la 
                        habilidad motora mejora, se pueden ofrecer comidas seguras cortadas en 
                        pequeños trozos.</p>

                        <div class="reading-note" style="background:#F1F5F9; border-left-color: var(--pink-main);">
                        <strong>Beneficios del BLW</strong>
                        </div>

                        <ul>
                        <li>• Es un método natural y respetuoso con el desarrollo del bebé y con su 
                        necesidad de explorar y experimentar como parte de su aprendizaje.</li>

                        <li>• Fomenta la seguridad en sí mismo, aprenden a gestionar los trozos de comida 
                        mejor que si se les da de comer en la boca. Cuando se introduce un alimento en la
                        boca de un bebé, se deposita al fondo del paladar, cuando lo hace él mismo lo
                        deposita en la parte anterior de la boca, esto hace que tenga muchas más 
                        posibilidades de manejarlo.</li>

                        <li>• Favorece que el bebé desarrolle una actitud positiva hacia la comida. Es el niño 
                        el que decide qué comer y qué dejar en el plato. Permitir que rechacen un 
                        alimento que no les atrae o sienten que no necesitan, o les parece poco seguro en 
                        ese momento, favorece que confíen en la comida y que sean más favorables a 
                        probar nuevos sabores y texturas, porque saben que pueden decidir dejarlo.</li>

                        <li>• Además, utilizando este enfoque habrá un único proceso de transición: de la 
                        lactancia exclusiva a la alimentación de la familia. Así se elude introducir un hábito 
                        de alimentación que sólo se podrá mantener unos meses y que por lo tanto habrá 
                        que cambiar en un periodo corto de tiempo. De esta manera, se evita que el bebé 
                        sufra y tener que afrontar otro destete más.</li>

                        <li>• Participa en la comida familiar, mientras disfruta de un momento agradable de 
                        socialización y le permite imitar conductas (como aprender a manejar la comida y
                        los cubiertos o elegir las comidas más saludables). El bebé disfruta porque es como 
                        un juego del que participa toda la familia.</li>

                        <li>• Como no se recurre a persuadir, engañar u obligar al bebé a comer, sino que 
                        se respeta su ritmo, no se generan batallas ni ratos estresantes para el niño y la 
                        familia.</li>

                        <li>• Contribuye al desarrollo de la musculatura orofacial que favorece una
                        correcta masticación, del mismo modo mejora la coordinación óculo-manual, y
                        promueve y estimula el desarrollo psicomotor del niño favoreciendo la prensión 
                        manual al agarrar los trozos de comida, la realización de la pinza es en torno a los
                        9 meses.</li>

                        <li>• Aprenden a comer despacio, a mantener más rato la comida en la boca y a 
                        masticarla bien.</li>
                        </ul>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>BLW y lactancia artificial:</strong>
                        </div>

                        <p>No es totalmente incompatible, pero será mucho más difícil porque:</p>
                        <ul>
                        <li>• Cuando los niños se alimentan mediante biberón, obtienen la leche con menos 
                        esfuerzo en comparación a los que maman. Así que los niños alimentados con 
                        leche de fórmula son más pasivos en el proceso de alimentación, suelen comer 
                        más de lo que necesitan realmente.</li>
                        <li>• No ofrece las mismas variaciones de sabor que la leche materna.</li>
                        </ul>

                        <p>En definitiva, el BLW se desarrolla en el marco de la crianza respetuosa. En concreto, se
                        respetan las señales de hambre y saciedad del bebé (elige lo que quiere llevarse a la
                        boca, cuándo y a qué ritmo) y no se obliga ni coacciona nunca al niño para que 
                        coma.</p>

                        <div class="reading-note" style="background:#F8FAFC; border-left-color: var(--pink-main);">
                        <strong>Otros datos importantes:</strong>
                        </div>

                        <p>Evolución de las habilidades psicomotoras del lactante, se clasifica en:</p>
                        <ul>
                        <li>• Perceptivo-manipulativa: es aquella que permitirá que el bebé mantenga firme la 
                        cabeza, permanezca sentado y pueda hacer giros con todo su cuerpo.</li>
                        <li>• Cognitiva: se relaciona con la motricidad fina, importante para poder comer y 
                        manipular los alimentos con las manos o los cubiertos, así como para poder coger 
                        varios alimentos a la vez o dejar uno para tomar otro.</li>
                        <li>• Lenguaje: permitirá al bebé comunicarse mejor con sus cuidadores para 
                        transmitir sus necesidades o preferencias alimentarias.</li>
                        <li>• Social: hace referencia a su capacidad de expresar sentimientos de agrado o 
                        disgusto durante el acto de comer o de experimentar con la comida y de 
                        entender las órdenes de sus padres.</li>
                        </ul>

                        <h3>Referencias:</h3>
                        <p>Brunner, O., Fuentes, M., Ortigosa, B., López, A., Grupo de Especialización de 
                        Nutrición Pediátrica de la Academia Española de Nutrición y Dietética. (21 de 
                        junio de 2019). Texturas evolutivas en la introducción de nuevos alimentos: un 
                        acercamiento teórico. Revista Española de Nutrición Humana y Dietética, 23(2), 
                        104-122. https://scielo.isciii.es/pdf/renhyd/v23n2/2174-5145-renhyd-23-02- 104.pdf</p>

                        <p>Fernández-Vegue, M. (9 de noviembre de 2018). Recomendaciones de la 
                        asociación española de pediatría sobre la alimentación complementaria. 
                        [Archivo PDF]. Disponible
                        en: https://www.aeped.es/sites/default/files/documentos/recomendaciones_aep
                        _sobre_alimentacio_n_c omplementaria_nov2018_v3_final.pdf</p>

                        <p>Jiménez, S. (s/f). La alimentación complementaria adecuada del bebé. [Archivo 
                        PDF]. Disponible en: https://www.unicef.org/cuba/media/876/file/alimentacion￾adecuada-bebe-guia-unicef.pdf</p>

                        <p>Lasa, A. (09 de marzo de 2021). Baby led weaning o alimentación dirigida por el 
                        bebé. Servicio de Pediatría. Disponible en: https://serviciopediatria.com/wp￾content/uploads/2021/06/2021.-Baby Led-Weaning-o-alimentaci%C3%B3n- dirigida￾por-el-beb%C3%A9-1.pdf</p>

                        <p>Orensanz, A. y Tolosana, T. (25 de febrero de 2019). Manual sobre como ofrecer una
                        alimentación complementaria saludable. Disponible en: 
                        https://www.ocez.net/archivos/revista/703-libro alimentacion-blw.pdf</p>

                    </div>
                    `
                },

                {
                    id: 20,
                    titulo: "💗 Berrinches y frustración en bebés: cuando tu peque explota… y tú necesitas calma",
                    resumen: "Los berrinches pueden sentirse intensos y agotadores, pero también son una puerta para enseñar seguridad emocional. Aquí tienes una guía clara, amorosa y práctica para acompañar a tu peque con paciencia, límites y estrategias que sí funcionan.",
                    imagen: "assets/img/articulos/20.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Berrinches y frustración en bebés</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232, 76, 154, 0.10), rgba(59, 182, 196, 0.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">💗 Acompañar con amor</strong>
                        <p style="margin:10px 0 0 0;">Dependiendo de cómo se lleguen a manejar podemos favorecer la independencia, autoestima y manejo de emociones.</p>
                        </div>

                        <p>Los berrinches son manifestaciones habituales de impaciencia y enfado característico de los 
                        peques cuando sienten frustración, miedo, enojo o tristeza, son un poco más frecuentes entre 
                        los 18 meses a 3 años, pero pueden durar hasta los 5 o 6 años desapareciendo poco a poco. Se 
                        caracterizan por gritar, llorar, patear o incluso tirarse al suelo. En los más peques es imposible 
                        evitar los berrinches totalmente, pero podemos intentar prevenirlos, sin embargo, es 
                        complicado saber qué situaciones van a desencadenarlos. Como nannies nos puede llegar a ser 
                        complicado el saber cómo reaccionar ante ciertas conductas, sin embargo, dependiendo de 
                        cómo se lleguen a manejar podemos favorecer la independencia, autoestima y manejo de 
                        emociones.</p>

                        <p>Los peques por lo general reaccionan llorando, gritando o haciendo berrinches cuando 
                        enfrentan situaciones donde se puedan llegar a sentir frustrados, enojados, con miedo, angustia 
                        o como respuesta a querer ser más independientes.</p>

                        <h3>Algunas situaciones que puedan llegar a ocasionar un berrinche de los peques son:</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Fatiga, hambre, incomodidad o sobre estimulación.</span> <span>😴</span></div>
                        <div class="rt-row"><span>Cambios en su rutina</span> <span>🔁</span></div>
                        <div class="rt-row"><span>Falta de atención de padres o cuidadores</span> <span>👀</span></div>
                        <div class="rt-row"><span>Falta de comprensión sobre lo que quiere expresar.</span> <span>🗣️</span></div>
                        <div class="rt-row"><span>La frustración de no poder obtener o lograr algo por sus propios medios o resolver un problema por sí solo</span> <span>🧩</span></div>
                        <div class="rt-row"><span>Deseo de querer hacer una actividad con alguna persona, pero la persona en cuestión está ocupada</span> <span>⏳</span></div>
                        </div>

                        <p>Es importante entender que, cuando un peque hace berrinches en ocasiones no lo hace para
                        conseguir lo que quiere o desobedecer, por ello, no se debe de aislar, ignorar, amenazar, o 
                        aplicar un castigo ya que estás respuestas aumentan los sentimientos de ansiedad en los peques, 
                        haciendo una dinámica negativa que probablemente incremente las rabietas.</p>

                        <h3>Puntos para considerar:</h3>
                        <div class="reading-note">
                        <ul style="margin:0; padding-left:18px;">
                            <li>Para poder controlar los berrinches de nuestros peques vamos a necesitar mucho amor, 
                            paciencia, y apoyo.</li>
                            <li>Es importante establecer una rutina diaria, y promover hábitos saludables de sueño y 
                            alimentación para que nuestro peque comprenda que debe de esperar, así se iremos 
                            formando un hábito, además, el tener una rutina es muy beneficioso para los peques, ya 
                            que, en ocasiones es muy complicado para ellos tener control en momentos de estrés y 
                            cambio, lo cual puede disminuir con la rutina.</li>
                            <li>Debemos de establecer límites razonables, no se le debe de pedir a nuestro peque más 
                            de lo que puede dar y no esperar a que se comporte a la perfección.</li>
                            <li>Hay que darle alternativas, si el peque no quiere seguir una instrucción como dejar su 
                            libro podemos sugerirle: “al terminar de cenar, podemos leer un cuento y después ir a 
                            dormir”, de esta manera escucharemos sus necesidades y llevaremos a cabo las acciones 
                            que necesitamos cubrir.</li>
                            <li>Como nannies debemos de proponer actividades para pasar el tiempo y evitar que el 
                            peque permanezca estático por un largo periodo, ya que, eso hará que se aburra más 
                            rápido.</li>
                            <li>Intentemos evitar juegos o actividades muy complicadas para su edad, porque esto 
                            puede predisponer a la frustración.</li>
                        </ul>
                        </div>

                        <ul>
                        <li>Como nannies pasamos mucho tiempo con nuestros peques así que conocemos sus 
                        ritmos naturales y gustos, así que podemos darle diversas opciones y hacerlo sentir que 
                        tiene control, por ejemplo, “¿prefieres jugar con el oso o con el dinosaurio?</li>
                        <li>Las nannies deberán de alentar, y estimular al peque para que practique sus habilidades, 
                        para que él mismo se sienta orgulloso, “veo que ya sabes tomar tu cuchara, ¿jugamos a 
                        la comidita y le damos a los peluches?”</li>
                        <li>Lo más importante, como nanny debes de ser un ejemplo, debemos ser personas con 
                        maneras adecuadas para solucionar conflictos.</li>
                        </ul>

                        <h3>Algunas recomendaciones para hacer cuando tu peque haga berrinche:</h3>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <ul style="margin:0; padding-left:18px;">
                            <li>Es muy importante ser paciente y mantener la calma, si tú como nanny te llegas a enojar 
                            las reacciones del peque pueden empeorar.</li>
                            <li>Cuando apenas veas que empezará el berrinche, enfoca su atención en otras actividades, 
                            juegos o juguetes.</li>
                            <li>Permitir que el peque se exprese, es su forma de desahogarse, cuando el berrinche pase, 
                            preguntarle qué fue lo que le molestó, le dio tristeza, y dejar que en la medida de lo 
                            posible nos explique la situación.</li>
                            <li>Tomar al peque y moverlo a un lugar seguro donde no pueda lastimarse o lastimar a 
                            alguien más.</li>
                            <li>Quedarnos cerca del peque hasta que el berrinche pase, es importante que sepa que no 
                            está solo.</li>
                            <li>Como nannies podemos ayudar al peque a reconocer sus sentimientos, identificar cómo 
                            se siente y describir lo que está sucediendo, con ello podremos darle un significado a 
                            lo que siente, mientras le enseñamos un correcto control de emociones y le hacemos 
                            ver que estás a su lado en todo momento.</li>
                            <li>No debemos de acceder a dar premios para detener los berrinches, ya que el peque 
                            puede llegar a pensar erróneamente que esa es la manera para conseguir algo.</li>
                            <li>Siempre que digamos que no a una acción debemos explicarle al peque el por qué e 
                            incluso podemos darle alguna alternativa, por ejemplo, si el peque está pintando en la 
                            pared se le explicará el por qué no y se le dará otra alternativa donde sí pueda hacerlo.</li>
                            <li>Como nannies, podemos ir desarrollando el hábito de recompensa con pequeños elogios 
                            a los comportamientos positivos que deseamos ver con frecuencia, por ejemplo: 
                            “gracias por esperar tu leche”.</li>
                        </ul>
                        </div>

                        <h3>Tolerancia a la frustración en bebés:</h3>

                        <p>La tolerancia a la frustración es el manejo emocional que desarrollamos los humanos para tener 
                        en calma el enojo por no cumplir nuestras expectativas o deseos, y aunque suene increíble, la 
                        frustración en los peques es real y puede llegar a ser un poco más complicado ya que ellos aún 
                        no saben cómo lidiar con sus emociones.</p>

                        <p>Por ello es importante que desde pequeños se les enseñe a regular su frustración para que 
                        aprendan a sobrellevar la tristeza o rabia ante las diversas situaciones que se presenten y, ¨pasen 
                        la página¨ cuando las cosas no salen como ellos quieren abriendo la puerta a la inteligencia 
                        emocional.</p>

                        <h3>Algunos comportamientos que suelen ser más comunes en peques con baja tolerancia a la 
                        frustración son:</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Poca adaptación a los cambios</span><span>🔄</span></div>
                        <div class="rt-row"><span>Piden cosas desde la exigencia</span><span>📣</span></div>
                        <div class="rt-row"><span>Actúan constantemente con rabietas o de manera agresiva</span><span>😡</span></div>
                        <div class="rt-row"><span>Abandonan sus objetivos cuando se les dificultan</span><span>🏳️</span></div>
                        <div class="rt-row"><span>Son impacientes e impulsivos</span><span>⚡</span></div>
                        <div class="rt-row"><span>No saben llevar sus fracasos</span><span>💔</span></div>
                        </div>

                        <h3>Ejercicios para trabajar la tolerancia a la frustración:</h3>
                        <div class="reading-note">
                        <ul style="margin:0; padding-left:18px;">
                            <li>Ayuda a los peques a reconocer las razones por las cuales se sienten molestos y que las 
                            puedan decir, por ejemplo: “tengo sueño, estoy cansado, extraño a mamá o papá, estoy 
                            molesto, etc.”.</li>
                            <li>Como nannies debemos de enseñarles que no siempre se obtiene lo que se quiere y ese 
                            no es un problema, además, de esta manera aprenderán a lidiar con el fracaso y los 
                            errores, mientras practican debemos también de enseñarles paciencia para conseguir lo 
                            que desean.</li>
                            <li>Como nannies debemos de poner el ejemplo, ya que la tolerancia a la frustración 
                            comienza por los adultos que rodean al peque, debido a que es muy normal que copien 
                            nuestras acciones, por este motivo, debemos pensar en si nosotras como nannies 
                            sabemos actuar de forma correcta para poder así ofrecer al peque alternativas viables y 
                            eficaces.</li>
                            <li>Debemos de evitar la sobreprotección, esto es importante para que poco a poco el peque 
                            vaya ganando independencia en ciertas tareas, como bañarse, escoger ropa, ayudar a las 
                            labores de casa, etc.</li>
                            <li>Debemos de mostrar límites, pero también debemos de ser flexibles, es decir, un peque 
                            necesita que se le guíe y que se le marquen las pautas para saber qué puede hacer y que 
                            no, pero siempre desde la postura del cambio positivo.</li>
                            <li>Debemos dejar que los peques encuentren una solución, así irán formando la noción de 
                            que ellos solos pueden encontrar la respuesta a una situación frustrante. Además, de 
                            esta manera se estimulará su imaginación e ingenio resolviendo ciertas tareas acordes 
                            a su edad.</li>
                            <li>Debemos de enseñarle a los peques que está bien fracasar, que es algo normal y que lo 
                            valioso es el aprendizaje que se obtiene de ello.</li>
                        </ul>
                        </div>

                        <h3>Estrategias para ayudar a mi peque en momentos de frustración:</h3>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <ul style="margin:0; padding-left:18px;">
                            <li>Botellas de la calma: Para ellas, vamos a ocupar botellas recicladas o algún tarro que 
                            esté en casa, se llenará de agua y se colocará diamantina, cuentas, o cualquier material 
                            que esté en casa. Esta manualidad es práctica e incluso puede ser usada para 
                            adolescentes y adultos.</li>
                            <li>Rehiletes: Estos, ayudarán a los peques a calmar la ansiedad, debido a que respirar 
                            consciente y profundamente funciona para tranquilizar a los niños cuando se enojan, o 
                            pierden el control.</li>
                        </ul>
                        </div>

                        <p>● Caja de la calma: Para esta técnica solo se va a necesitar una caja de cartón que se 
                        deberá de llenar con arena fina, esta ayuda a los peques a relajarse debido a la 
                        manipulación de elementos naturales, se le debe de ofrecer al peque para que la 
                        manipule.</p>

                        <p>Bolas antiestrés: Así como se pueden comprar, también se pueden hacer, podemos fabricarlas 
                        con arroz, harina, o azúcar que deberán de ir dentro de globos, se cerrarán y dejaremos que el 
                        peque las manipule libremente cuando este nervioso, enojado o ansioso.</p>

                        <h3>Ejemplos de actividades para trabajar la tolerancia a la frustración de tu peque</h3>
                        <p>En cada una de estas actividades podemos observar que el peque al principio puede 
                        experimentar frustración al no poder realizarla, pero con motivación, paciencia y práctica 
                        termina lográndolo y lidia durante la actividad con ese sentimiento de malestar.</p>

                        <h3>Estrategias de distracción para bebés:</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Moverse: el ejercicio es una buena forma para canalizar la energía, para ello podemos ayudar a nuestro peque a brincar, correr unos minutos o realizar cualquier movimiento.</span><span>🏃</span></div>
                        <div class="rt-row"><span>Escuchar música: puede ayudarle al peque a aliviar la tensión a través del baile o la simple escucha.</span><span>🎵</span></div>
                        <div class="rt-row"><span>Preguntas: como nannies podemos ofrecer pequeñas opciones para que el peque pueda enfocar su atención en responder con un sí, no o con señales.</span><span>❓</span></div>
                        <div class="rt-row"><span>Otra habitación: la nanny puede llevar al peque a otra habitación, pero siempre con su compañía, nunca dejándolo solo, puede ofrecer otro juguete o cantar otra canción.</span><span>🚪</span></div>
                        <div class="rt-row"><span>Soplar burbujas: la nanny debe soplar burbujas cuando el peque se encuentre llorando, la atención cambiará a las burbujas e incluso reventarlas, a su vez la nanny puede invitar al peque a soplar, ayudando también a regular su respiración.</span><span>🫧</span></div>
                        <div class="rt-row"><span>La nanny se puede acercar al peque e iniciar un juego con bloques armando una torre, jugando con animales, peluches, etc.</span><span>🧸</span></div>
                        <div class="rt-row"><span>Abrazo: abrazar al peque por más de 20 segundos, puede hacer que se sienta consolado.</span><span>🤗</span></div>
                        <div class="rt-row"><span>Los juegos con agua pueden ayudar al peque a manejar la irritabilidad, esto, debido a que el agua relaja los músculos y provoca sensación de bienestar.</span><span>💧</span></div>
                        <div class="rt-row"><span>Ofrecer a tu peque pintar con sus dedos, el sentir la pintura hará que perciba nuevas texturas, colores y olores enfocando su atención en ellos.</span><span>🎨</span></div>
                        <div class="rt-row"><span>Se le puede ofrecer a los peques picar frutas de distintas formas, esto anudado a los sabores, colores, texturas y olores diferentes hará que se enfoquen en estas cualidades y no en por qué estaban molestos o llorando.</span><span>🍓</span></div>
                        <div class="rt-row"><span>Comenzar a contar un cuento mientras los peques están en pleno berrinche ayuda a que su atención se vea localizada en lo que la nanny está contando.</span><span>📖</span></div>
                        </div>

                        <h3>Referencias</h3>
                        <p>Buckloh, L. (2023). “Impartir disciplina a su hijo durante la primera infancia”.<br>
                        KidsHealth. Impartir disciplina a su hijo durante la primera infancia (para Padres) - Nemours 
                        KidsHealth</p>

                        <p>Capdevila, N. (7 de marzo, 2023). “10 técnicas efectivas para calmar los berrinches 
                        infantiles”. Etapa Infantil. 10 técnicas efectivas para calmar los berrinches infantiles - Etapa 
                        Infantil</p>

                        <p> Diaz, S. (18 de febrero, 2021). “15 manualidades para que los peques aprendan a manejar 
                        sus emociones. Bebesymas. 15 manualidades para que los niños aprendan a manejar sus 
                        emociones (bebesymas.com)</p>

                        <p>Flores, E. (s/f). “Desarrollar la tolerancia a la frustración en los niños con 13 técnicas 
                        exitosas”. ieie. La Tolerancia a la frustración en los niños: 13 técnicas 🎈 (ieie.eu)</p>

                        <p>Educación Inicial. (s/f). “¿Qué hay detrás de un berrinche?”. Educación Inicial, 
                        Fundación Carlos Slim. ¿Qué hay detrás de un berrinche? - Educacion Inicial</p>

                        <p>NARANXADUL. (17 de septiembre, 2018). “¿Qué hago si mi hijo es muy berrinchudo 
                        y enojón?”. EXCELSIOR. Qué hago si mi hijo es muy berrinchudo y enojón | [site:name] 
                        (excels1717ior.com.mx)</p>

                        <p>Schilling, E. (2022). “Rabietas”. KidsHealth. Rabietas (para Padres) - Nemours 
                        KidsHealth</p>

                    </div>
                    `
                },

                {
                    id: 21,
                    titulo: "🍼 Dejar el biberón con amor: una transición tranquila, sin luchas y con pequeños logros",
                    resumen: "Soltar el biberón puede sentirse como soltar una parte de su seguridad… y la tuya también. Este artículo te acompaña con pasos claros y cariñosos para lograrlo con calma, respeto y mucha paciencia.",
                    imagen: "assets/img/articulos/21.jpg",
                    categoria: "Sensorial",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Ayudar a mi peque a dejar el biberón</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">🍼 Transición con calma y respeto</strong>
                        <p style="margin:10px 0 0 0;">Sabemos que a los peques les puede costar un poco dejar el biberón, ya que éste puede 
                        representar comodidad y seguridad, sin embargo, a partir de los 12 meses se sugiere 
                        empezar con el proceso para que lo deje, ya que de lo contrario podría traer las 
                        siguientes consecuencias:</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px;">
                        <div class="rt-row"><span><strong>Caries.</strong> - Esto puede ocurrir porque la leche contiene lactosa, un azúcar natural en la leche que, si se deja en los dientes de los peques puede ocasionar caries.</span><span>🦷</span></div>
                        <div class="rt-row"><span><strong>Problemas en el habla y malformaciones dentales.</strong> - Los peques que toman en biberón después de los dos años pueden tener problemas en la desalineación de los dientes y retraso en el habla porque no se fortalecen de manera correcta los músculos de la boca.</span><span>🗣️</span></div>
                        <div class="rt-row"><span><strong>Mala alimentación.</strong> - El biberón proporciona una gran cantidad de leche sin mayor esfuerzo, lo que acostumbra a los peques al alto consumo de alimentos sin control y puede resultar en sobrepeso o hasta obesidad.</span><span>🍽️</span></div>
                        <div class="rt-row"><span><strong>Mayor resistencia al cambio.</strong> – Los peques que se aferran más a sus biberones pueden generar una lucha al momento de dejar el biberón, mientras más crecen, más se niegan a dejarlo. Por ello, es recomendable empezar lo antes posible.</span><span>🔁</span></div>
                        </div>

                        <p style="margin-top:18px;">Por estos motivos, es muy importante empezar este proceso desde el inicio de la 
                        alimentación complementaria (a los 6 meses aproximadamente), ya que en esta etapa 
                        es cuando empiezan a desarrollar más curiosidad por los utensilios de cocina.</p>

                        <div class="comunidad-section-header" style="margin-top:22px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Algunos consejos para ayudar al peque a dejar el biberón</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>1. Preséntale la taza:</strong>
                        <p style="margin:10px 0 0 0;">Cuando tu peque empiece con la alimentación 
                        complementaria, préstale una tacita de plástico, ligera, con colores llamativos y 
                        deja que la conozca. Haz uso también tú de alguna taza para que tu peque vea 
                        el ejemplo y quiera hacer lo mismo. Ponle un chorrito de agua y listo, deja que 
                        peque explore cómo llevársela a la boca.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main);">
                        <strong>2. El reemplazo:</strong>
                        <p style="margin:10px 0 0 0;">Una vez que observes que tu peque ya se haya acostumbrado a 
                        tener una taza en su mesa, puedes reemplazar una toma de biberón por una taza 
                        de leche al día. Hazlo de manera progresiva, para que tu peque se adapte poco 
                        a poco.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--yellow-main);">
                        <strong>3. Reduce las cantidades:</strong>
                        <p style="margin:10px 0 0 0;">Cuando empieces con el proceso de reemplazo, ofrece 
                        menos líquido en el biberón y más en la taza, con el fin de que tu peque se vaya 
                        acostumbrando a los pesos en la taza y asocie la idea de tomar leche con otro 
                        recipiente.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>4. Desecha biberones:</strong>
                        <p style="margin:10px 0 0 0;">Pídele a la familia que se deshaga de todos los biberones que 
                        haya en casa, no permitan que tu peque se acuerde de ellos y así podrán evitar 
                        que caiga en tentaciones o berrinches.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <strong>5. Celebra sus pequeños logros:</strong>
                        <p style="margin:10px 0 0 0;">Cada vez que tu peque tome en una taza puedes
                        decirle “¡Qué bien que ya tomas en taza!” o “¿Verdad que es genial tomar en 
                        taza?”, con el objetivo de reforzar la acción.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--yellow-main);">
                        <strong>6. Que el trabajo continúe:</strong>
                        <p style="margin:10px 0 0 0;">Si se presenta la oportunidad de que tu peque esté con 
                        otros familiares que no sepan del proceso, es importante comunicarles la 
                        situación. También, intenta llevar su taza favorita a todas partes para que el 
                        aprendizaje no se coarte y no caiga en regresiones.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>7. Ofrece otros estímulos:</strong>
                        <p style="margin:10px 0 0 0;">Dejar el biberón puede ser un momento difícil 
                        emocionalmente para tu peque por el cariño que pueda tomarle, por ello, te 
                        recomendamos brindarle apoyo a través de abrazos o quizás algún juguete de 
                        apego, para que no se sienta solo durante el proceso.</p>
                        </div>

                        <div class="reading-note" style="margin-top:24px;">
                        <strong>🤍</strong>
                        <p style="margin:10px 0 0 0;">Recordemos que algunos aprendizajes con los peques son complejos, pues, todos tienen 
                        ritmos diferentes, por ello es importante que este al igual que todos los procesos se den 
                        desde el amor y respeto, procurando el acompañamiento correcto de nuestros peques
                        a lo largo de su crecimiento.</p>
                        </div>

                        <h3>Referencias</h3>
                        <ul>
                        <li>HealthyChildren.org. (2025). Del biberón a la taza: cómo ayudar a su hijo a hacer una transición saludable. (s. f.). HealthyChildren.org. https://www.healthychildren.org/Spanish/ages￾stages/baby/feeding-nutrition/Paginas/Discontinuing-the-Bottle.aspx</li>
                        <li>Minnesota WIC. (2018, 9 octubre). Dejar el biberón. Health State. https://www.health.state.mn.us/docs/people/wic/nutrition/spanish/infw eaning.pdf</li>
                        <li>Regan Olsson (2023, 25 julio). Consejos para la transición del bebé del biberón al vaso. Banner Health. Recuperado 14 de abril de 2025, de https://www.bannerhealth.com/es/healthcareblog/advise-me/bye-bye￾bottle-transitioning-from-bottle-to-cup</li>
                        </ul>

                    </div>
                    `
                },

                {
                    id: 22,
                    titulo: "🧩 Jugar juntos con amor: cómo ayudar a tu peque con TEA a sentirse incluido y feliz",
                    resumen: "Cuando tu peque quiere acercarse pero el mundo social se siente demasiado… duele. Este artículo te acompaña con ideas claras y amables para incluirlo en el juego con otros peques sin forzar, respetando su ritmo y celebrando cada pequeño avance.",
                    imagen: "assets/img/articulos/22.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Jugar juntos: Cómo Incluir a mi peque con autismo en el juego con otros peques</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232, 76, 154, 0.10), rgba(59, 182, 196, 0.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">🧩 Juego e inclusión</strong>
                        <p style="margin:10px 0 0 0;">El juego es la manera natural en que los peques aprenden a conocer el mundo, resolver problemas, expresar emociones y desarrollar habilidades sociales.</p>
                        </div>

                        <p>El juego es la manera natural en que los peques aprenden a conocer el mundo, 
                        resolver problemas, expresar emociones y desarrollar habilidades sociales. Para los 
                        peques con TEA, el juego puede presentar ciertos desafíos, como el ruido, los 
                        estímulos, seguir turnos o entender las señales sociales de otros niños.</p>

                        <p>Muchas veces, como cuidadores, nos preguntamos si es mejor protegerlos 
                        de situaciones sociales que podrían frustrarlos o si deberíamos insistir en que estén 
                        con otros peques. La respuesta está en encontrar un punto medio: no forzar, pero 
                        sí ofrecer oportunidades cuidadosamente pensadas.</p>

                        <p>Los estudios muestran que cuando los peques con autismo participan en 
                        juegos compartidos, especialmente en entornos que los entienden y los apoyan, se 
                        observan mejoras en la comunicación, empatía, flexibilidad y autorregulación 
                        emocional (Gengoux et al., 2019).</p>

                        <p>Sabemos que muchos peques con autismo (TEA) puede convertirse en un 
                        reto el jugar y relacionarse con otros peques. La guía “¡Yo también juego! 
                        ¿TEApuntas?” nos recuerda que con algunos apoyos sencillos para que todos los 
                        peques pueden disfrutar de jugar en grupo y sentirse incluidos. Dicha guía te la 
                        compartimos en las referencias de este artículo.</p>

                        <p>Algunos peques con TEA pueden tener dificultades para seguir las reglas 
                        sociales del juego, compartir materiales o incluso iniciar la interacción con otros. Por 
                        eso, se recomienda empezar con juegos estructurados y claros, donde haya pasos 
                        fáciles de seguir. Con el tiempo, poco a poco, se pueden incorporar juegos más 
                        libres y creativos.</p>

                        <p>Los apoyos visuales como imágenes o pictogramas, son una gran 
                        herramienta para anticipar lo que va a suceder y dar seguridad a tu peque. 
                        Además, al inicio, es muy valioso que un adulto acompañe el juego para guiar y 
                        modelar las interacciones, retirándose gradualmente para que los pequeños 
                        ganen autonomía.</p>

                        <div class="reading-note" style="border-left-color: var(--blue-main); margin-top:26px;">
                        <strong>Algunos ejemplos de apoyos visuales son:</strong>
                        <ul style="margin:10px 0 0 0; padding-left:18px;">
                            <li>Carteles de secuencias de actividades</li>
                            <li>Semáforo de comportamiento</li>
                            <li>Reloj de arena o temporizador</li>
                            <li>Mini cuentos sociales ilustrados</li>
                        </ul>
                        </div>

                        <p>Otro punto clave es enseñar de manera práctica cómo respetar turnos, pedir 
                        ayuda o manejar frustraciones. Estas habilidades sociales se pueden reforzar 
                        durante el juego y no solo ayudan al peque en ese momento, sino también en su 
                        vida diaria. Cuando los demás peques aprenden a respetar los tiempos y las formas 
                        de comunicación de su compañero, se crea un ambiente más empático, divertido 
                        y enriquecedor para todos.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">A continuación, te mencionaremos algunas dinámicas inclusivas o juegos que puedes realizar en grupo con los peques:</h3>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span>1. Juego de roles compartidos</span><span>🍽️</span></div>
                        <div class="rt-row"><span>2. Círculo de turnos</span><span>🔁</span></div>
                        <div class="rt-row"><span>3. Construcción colectiva</span><span>🧱</span></div>
                        <div class="rt-row"><span>4. Historias colaborativas</span><span>📖</span></div>
                        <div class="rt-row"><span>5. Juegos sensoriales guiados</span><span>🎵</span></div>
                        <div class="rt-row"><span>6. Bingo o loterías inclusivas</span><span>🎲</span></div>
                        <div class="rt-row"><span>7. Actividades de imitación en grupo</span><span>🕺</span></div>
                        </div>

                        <ol style="margin-top:18px; line-height:1.8;">
                        <li><strong>Juego de roles compartidos:</strong> Cada peque tiene un papel dentro del juego 
                        (por ejemplo, en un “restaurante” algunos son chefs, otros camareros, otros 
                        clientes). Las tareas están adaptadas según habilidades, los peques con TEA 
                        pueden empezar con roles guiados o más predecibles. Esta actividad 
                        favorece la cooperación, la comunicación y participación activa de todos.</li>

                        <li><strong>Círculo de turnos:</strong> Juegos sencillos donde los peques pasan un objeto 
                        (pelota, muñeco, tarjeta) siguiendo un orden visual o marcado. Esta 
                        actividad enseña a esperar turnos, compartir y anticipar acciones, mientras 
                        todos participan.</li>

                        <li><strong>Construcción colectiva:</strong> Actividades tipo “torre de bloques” o mural grupal, 
                        así todos contribuyen con una parte según su capacidad y esto refuerza la 
                        idea de logro grupal y permite que cada niño vea que su aporte es 
                        importante.</li>

                        <li><strong>Historias colaborativas:</strong> Cada peque dice una frase o elige una imagen para 
                        armar una historia en conjunto. Se pueden usar pictogramas o tarjetas para 
                        apoyar la comunicación de niños con dificultades verbales.</li>

                        <li><strong>Juegos sensoriales guiados:</strong> Actividades con plastilina, agua, arena o música 
                        donde todos exploran y experimentan juntos. Esta actividad permite la 
                        interacción sin la presión social directa, ideal para peques con TEA que se 
                        sienten inseguros en juegos más estructurados.</li>

                        <li><strong>Bingo o loterías inclusivas:</strong> Juegos de mesa adaptados con imágenes o 
                        símbolos claros para todos. Se pueden asignar roles de ayudante o 
                        anunciador para incluir a quienes tienen más dificultades en la 
                        comunicación.</li>

                        <li><strong>Actividades de imitación en grupo:</strong> Juegos tipo “Simón dice” o “copiar 
                        movimientos” donde los peques imitan acciones de sus compañeros. Esta 
                        actividad ayuda a desarrollar atención conjunta y habilidades sociales de 
                        forma lúdica.</li>
                        </ol>

                        <div class="reading-note" style="border-left-color: var(--blue-main); margin-top:26px;">
                        <strong>Algunos tips para poner en práctica estos juegos son:</strong>
                        <ul style="margin:10px 0 0 0; padding-left:18px;">
                            <li>Crear espacios tranquilos para socializar: Los lugares con mucho ruido, luces 
                            o gente pueden ser abrumadores. Busca espacios más calmados para que 
                            tu peque pueda concentrarse en conocer a otros peques sin sentirse sobre
                            estimulados.</li>

                            <li>Prepararlo antes de nuevas experiencias: Cuéntale con dibujos, fotos o 
                            palabras sencillas qué pasará antes de ir a una fiesta o al parque. Así se 
                            sentirá más seguro.</li>

                            <li>Celebra cada logro: Cada paso cuenta, si tu peque se animó a mirar a otro 
                            peque, a prestar un juguete o a decir “hola”, celébralo con mucho cariño. 
                            Reconocer sus avances refuerza su confianza.</li>

                            <li>Pide apoyo si lo necesitas: Hablar con terapeutas, educadores o grupos de 
                            apoyo puede darte nuevas ideas para acompañar mejor a tu peque. No 
                            estás sola en este camino.</li>
                        </ul>
                        </div>

                        <p>Apoyar a un peque con TEA en la socialización y en el juego, es un proceso lleno 
                        de paciencia, cariño y estrategias. No existe una sola receta; lo importante es 
                        combinar varios enfoques adaptados a su ritmo y gustos. Además, los peques 
                        neurotípicos también aprenden en el proceso: se vuelven más pacientes, 
                        comprensivos y abiertos a la diversidad.</p>

                        <p>Tu paciencia, amor y constancia son la base sobre la que tu peque aprende a 
                        interactuar y jugar con otros. Cada sonrisa, intento y pequeño paso es un triunfo 
                        compartido. Recuerda celebrar siempre los avances y confiar en el proceso: tu 
                        cariño y apoyo hacen toda la diferencia en el mundo y desarrollo de tu peque.</p>

                        <h3>Bibliografía</h3>
                        <p>Autismo España. (s. f.). ¡Yo también juego! ¿TEApuntas? [Guía en PDF]. Autismo 
                        España.https://www.autismo.org.es/sites/default/files/blog/adjuntos/yo_ta
                        mbien_juego_teapuntas_optimizado.pdf</p>

                        <p>Autismo Sevilla. (s. f.). Aprendo en el recreo [Guía en PDF]. Autismo Sevilla. 
                        https://www.autismosevilla.org/descargas/Aprendo-en-el-Recreo.pdf</p>

                        <p>María Concepción Claude (2017). Juego para fomentar inclusión social dentro de 
                        clase [Memoria académica]. Universidad Católica de Chile. 
                        https://diseno.uc.cl/memorias/pdf/memoria_dno_uc_2017_2_CLAUDE_GAR
                        CIAHUIDOBRO_M.pdf</p>

                        <p>Rodríguez-Medina J, Martín-Antón LJ, Carbonero MA and Ovejero A (2016).
                        Intervención mediada por pares para el desarrollo de habilidades de 
                        interacción social en el trastorno del espectro autista de alto 
                        funcionamiento: un estudio piloto. De. Psychol. 7:1986.
                        https://www.frontiersin.org/journals/psychology/articles/</p>

                        <p>Gengoux, G. W., Solomon, M., & Schuck, R. K. (2019). Play-based interventions for 
                        autism spectrum disorder and other developmental disorders. The Guilford 
                        Press. https://clinicaltrials.gov/study/</p>

                    </div>
                    `
                },

                {
                    id: 23,
                    titulo: "✨ Que tu peque se enamore de la actividad: cómo despertar su interés sin forzarlo",
                    resumen: "A veces planeas algo con toda la ilusión… y tu peque simplemente no conecta. Respira: no es fracaso. Aquí tienes ideas claras y amorosas para entender qué pasa y lograr que participe con más ganas, a su ritmo.",
                    imagen: "assets/img/articulos/23.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Fomentar el interés de los peques en las actividades</h1>

                        <p>A todas nos puede suceder que, emocionadas y emocionados, planeamos 
                        actividades para trabajar con nuestros peques, pero a la hora de ponerlas en práctica
                        los y las peques se muestran desinteresados y prefieren realizar otras actividades a 
                        cambio. Entonces, ¿qué podemos hacer en estos casos?</p>

                        <p>Para responder esta pregunta es importante considerar varios puntos antes de realizar 
                        un juicio acerca de la actitud del peque, por ejemplo:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>Estado emocional del peque</span><span>💛</span></div>
                        <div class="rt-row"><span>Gustos e intereses del peque</span><span>🎯</span></div>
                        <div class="rt-row"><span>Espacio de trabajo</span><span>🧺</span></div>
                        <div class="rt-row"><span>Edad del peque</span><span>🧠</span></div>
                        </div>

                        <ol style="margin-top:18px; line-height:1.8;">
                        <li><strong>Estado emocional del peque:</strong> Recuerda que tu peque es una persona con 
                        sentimientos y emociones como los adultos, todos tenemos malos días y de vez en 
                        cuando está bien darse un descanso.</li>

                        <li><strong>Gustos e intereses del peque:</strong> Si ya llevas tiempo conociendo a tu peque y ya 
                        sabes lo que le gusta y disgusta, es más fácil planear actividades que puedan ser 
                        interesantes para él/ella. Los peques son muy obvios con sus intereses, úsalo a tu 
                        favor y planea actividades que vayan de la mano con sus gustos.</li>

                        <li><strong>Espacio de trabajo:</strong> Siempre procura que el espacio donde vayas a trabajar 
                        esté limpio y recogido, puessi está lleno de estímulos el/la peque se va a distraer con 
                        mayor facilidad y probablemente deje de lado la actividad.</li>

                        <li><strong>Edad del peque:</strong> Es posible que hayas conocido a tu peque en un momento de 
                        su desarrollo, hayan avanzado poco a poco y en el momento en el que aplicas la 
                        actividad ya se encuentre en una etapa más avanzada, por ello a veces los 
                        peques pierden el interés en las actividades, pues ya no les parece un reto 
                        realizarlas. Así mismo, es posible que los objetivos de la planeación sean muy 
                        avanzados para su edad y el/la peque le resulte muy difícil realizarla, por ello 
                        prefieren dejar de lado la planeación y volver a actividades que le resulten más 
                        sencillas.</li>
                        </ol>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Otros puntos importantes a considerar</h3>
                        </div>

                        <p>El estilo de aprendizaje del peque: Gardner (1983), propone la teoría de
                        Inteligencias Múltiples en su obra “Estructura de la Mente”, en la cualse exponen
                        8 tipos de inteligencias que suelen mostrar los seres humanos, lascualesson:</p>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>8 tipos de inteligencias que suelen mostrar los seres humanos</strong>
                        </div>

                        <ol style="line-height:1.8; margin-top:12px;">
                        <li><strong>Inteligencia Lingüística:</strong> Habilidad de pensar palabras y utilizar el lenguaje para 
                        expresar y percibirsignificados complejos.</li>

                        <li><strong>Inteligencia lógico-matemática:</strong> Habilidad de calcular, cuantificar, utilizar el 
                        razonamiento lógico, considerar premisas, hipótesis, pautas y relaciones y llevar a 
                        cabo operaciones matemáticas complejas.</li>

                        <li><strong>Inteligencia espacial:</strong> Capacidad de pensar de forma tridimensional y de 
                        percibir imágenes internas y externas, recrearlas, transformarlas y hacer que los 
                        objetos y uno mismo muevan a través del espacio.</li>

                        <li><strong>Inteligencia corporal-kinestésica:</strong> Habilidad para manipular objetos y utilizar los 
                        músculos de forma coordinada, se incluye el equilibrio físico, rapidez, flexibilidad y 
                        sensibilidad en el tacto.</li>

                        <li><strong>Inteligencia musical:</strong> Sensibilidad para percibir tono, melodía, ritmo y 
                        entonación.</li>

                        <li><strong>Inteligencia interpersonal:</strong> Capacidad de entender a las personas e 
                        interrelacionarse con ellas, también se incluye las habilidades de liderar, organizar, 
                        comunicar, resolver conflictos y vender.</li>

                        <li><strong>Inteligencia intrapersonal:</strong> Capacidad de entenderse a uno mismo, 
                        reconociendo los puntos fuertes y debilidades propios y estableciendo objetivos 
                        personales.</li>

                        <li><strong>Inteligencia naturalista:</strong> Capacidad de observar la naturaleza y entender sus 
                        leyes y procesos, haciendo distinciones e identificando la flora y la fauna (Prieto y 
                        Ayuso, 2014).</li>
                        </ol>

                        <p>Es importante mencionar que Gardner no asume que cada ser humano tenía una 
                        sola inteligencia, sino que podíamos contar con varias, pero siempre habrá una que 
                        destaque más que las demás.</p>

                        <p>Una vez conociendo a tu peque, podrías darte cuenta a través de sus intereses cuál
                        de este tipo de inteligencias es más predominante en su aprendizaje y, con base en 
                        esa información, planear actividades más adecuadas para él/ella.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Estrategias para fomentar el interés de los peques.</h3>
                        </div>

                        <p>Tomando en consideración los puntos anteriores, podrás notar que hay muchos 
                        aspectos que influyen directamente en el interés del peque, por lo que te 
                        presentamos las siguientes estrategias para abordar su interés de una manera 
                        asertiva:</p>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <ul style="margin:0; padding-left:18px; line-height:1.8;">
                            <li>En caso de que observes que del peque pierda el interés rápidamente en las 
                            actividades propuestas, lleva alguna actividad de repuesto que trabaje la 
                            misma área con el fin de no quedarte a la mitad del aprendizaje.</li>

                            <li>Conoce a tu peque, analiza sus habilidades y capacidades, con base en eso, 
                            desarrolla planeaciones y actividades que puedan resultar atractivas.</li>

                            <li>¡Únete a las modas! Si notas que el/la peque tiene interés en alguna 
                            caricatura, cantante o grupo musical, elabora actividades que contengan 
                            estos personajes con el fin de que el peque disfrute los contenidos.</li>

                            <li>Haz las actividades con el peque. Dentro de lo posible, primero haz tú las 
                            actividades y diviértete con ellas, recuerda que los peques se interesan mucho 
                            en lo que les gusta a los adultos.</li>

                            <li>Dentro de las posibilidades, invita a algún familiar a realizar la actividad. Esto 
                            con el objetivo de hacer más dinámico el aprendizaje y mostrarle al peque 
                            que todos pueden jugar.</li>
                        </ul>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <ul style="margin:0; padding-left:18px; line-height:1.8;">
                            <li>Planea días con temas lúdicos, por ejemplo: Día de los colores, día de las flores,
                            etc. Esto ayuda mucho a organizar el día y los motiva a seguir con el tema, aún
                            más si tú participas en este aprendizaje, como decorando un poco el espacio 
                            de trabajo</li>

                            <li>Aprende a distinguir el estado anímico de tu peque y úsalo a tu favor. Si ves 
                            que el peque está teniendo un mal día, modifica un poco la actividad para 
                            enfocar hacia el área socioemocional, con la intención de que el peque 
                            empiece a identificar sus emociones.</li>

                            <li>Por último, pero no menos importante, no pasa nada si un día el peque está de 
                            mal humor, no te castigues. Próximamente podrán retomar las actividades, no 
                            pasa nada si no pueden hacer la actividad ese día, siempre y cuando la 
                            realicen en el futuro. Los peques también tienen malos días, sólo hay que 
                            procurar que estas pausas no sean constantes.</li>
                        </ul>
                        </div>

                        <p>Recuerda siempre tomar en cuenta el contexto de tu peque antes de aplicar 
                        alguna actividad, al conocer sus gustos y necesidades podrás abordarlo de una
                        manera más asertiva. Así mismo, siempre ten presente que estamos para apoyarte, 
                        comunícate con nosotros si tienes alguna duda con respecto a alguna 
                        actividad o etapa de desarrollo de tu peque.</p>

                        <h3>Referencias</h3>

                        <p>Anaya-Durand, Alejandro; Anaya-Huertas, Celina ¿Motivar para aprobar o para 
                        aprender? Estrategias de motivación del aprendizaje para los estudiantes.
                        Tecnología, Ciencia, Educación, 25, (1), 5-14.</p>

                        <p>Ferrándiz, C. (2005). Evaluación y desarrollo de la competencia cognitiva. Un 
                        estudio desde el modelo de las inteligencias múltiples. Ministerio de Educación y 
                        Ciencia (Coord.). Madrid: Secretaría General Técnica.</p>

                        <p>Gardner, H. (1983). Frames of mind. London: Fontana (Trad. Cast., Inteligencias múltiples.
                        Barcelona: Paidós, 1995).</p>

                        <p>Kleinginna, P.R., Kleinginna, A.M. 1981. A categorized list of emotion definitions, with
                        suggestions for a consensual definition. Motivat. Emot, 5, 345–379.</p>

                        <p>Pekrun, R. 1992. The impact of emotions on learning and achievement: Towards a 
                        theory of cognitive/motivational mediators. Applied Psychology: An International 
                        Review. 41(4), 359-376.</p>

                        <p>Prieto, M. D. M. M., & Ayuso, J. M. (2014). Inteligencias múltiples, ¿ocho maneras diferentes
                        de aprender? EA, Escuela abierta: revista de Investigación Educativa, (17), 103-116.</p>

                    </div>
                    `
                },

                {
                    id: 24,
                    titulo: "⏱️ Tareas sin lágrimas: cómo ayudar a tu peque a concentrarse sin estrés (método Pomodoro)",
                    resumen: "Cuando las tareas se vuelven pelea, el corazón se cansa. Esta guía te muestra una forma sencilla de estudiar por bloques con descansos, para bajar la tensión, mejorar la concentración y que tu peque se sienta capaz… sin saturarse.",
                    imagen: "assets/img/articulos/24.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Método de estudio Pomodoro</h1>
                        <h3 style="margin-top:8px;">¿Cómo evitar el estrés y la fatiga en mi peque mientras hace sus tareas?</h3>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">⏱️ Una forma amable de estudiar</strong>
                        <p style="margin:10px 0 0 0;">El método Pomodoro es una herramienta de gestión y organización del tiempo que 
                        dedicamos a cada tarea, propone fraccionar el tiempo de estudio en espacios
                        de tiempo cortos, pero de alta intensidad, seguidos de pequeños descansos que 
                        harán que la tarea sea mucho más llevadera. Gracias a esto, conseguimos que
                        nuestro cerebro permanezca relajado y se facilita la concentración durante los
                        bloques de estudio.</p>
                        </div>

                        <p>El tiempo limitado de los intervalos de estudio propone el reto de cumplir con una
                        serie de objetivos antes de que el plazo termine. De tal forma, será necesario
                        mantenerse enfocado y eliminar las distracciones para lograrlo. Este método
                        consiste en dividir el tiempo en pequeños intervalos de trabajo de 25 minutos
                        (Pomodoros) y pausas de 5 minutos; tras cuatro intervalos de trabajo se hace un 
                        descanso más largo.</p>

                        <p>El objetivo es lograr que no te satures con lo que estás haciendo, por lo que estos
                        descansos prolongados son clave para poder volver al máximo rendimiento
                        cuando retomes la tarea.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Ventajas y desventajas del sistema de estudio pomodoro</h3>
                        </div>

                        <p>El método del Pomodoro estudio, como cualquier rutina de estudio, tiene beneficios 
                        y desventajas.</p>

                        <p style="margin-bottom:10px;"><strong>Entre las principales ventajas de este método podemos encontrar:</strong></p>
                        <div class="reading-table">
                        <div class="rt-row"><span>Logra que estés enfocado en tu tarea al 100%</span><span>🎯</span></div>
                        <div class="rt-row"><span>Mejora notablemente tu rendimiento.</span><span>📈</span></div>
                        <div class="rt-row"><span>Método excelente para organizarte y aprender a priorizar tareas.</span><span>🧠</span></div>
                        <div class="rt-row"><span>Es compatible con otros métodos de estudio.</span><span>🧩</span></div>
                        <div class="rt-row"><span>Evita cansancio y provoca motivación por logro de objetivos.</span><span>✨</span></div>
                        </div>

                        <p style="margin:22px 0 10px 0;"><strong>Algunos de los puntos negativos de esta técnica son:</strong></p>
                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <ul style="margin:0; padding-left:18px; line-height:1.8;">
                            <li>Se trata de una técnica que requiere de alta concentración.</li>
                            <li>Es una técnica que se aplica de forma totalmente individual.</li>
                            <li>Es un método poco productivo para tareas creativas.</li>
                        </ul>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Consejos para aplicar el método de estudio Pomodoro</h3>
                        </div>

                        <h3 style="margin-top:10px;">Sin distracciones</h3>
                        <p>Es esencial para el éxito del método de estudio pomodoro la desconexión total 
                        con tu entorno. Durante el tiempo que dediques a estudiar con este método no
                        puedes tener ninguna distracción.</p>

                        <p>No utilices la técnica pomodoro en un café o similar, será contraproducente. Es
                        necesario un ambiente relajado y tranquilo. Organiza una lista de tareas</p>

                        <h3>Realiza previamente una lista de tareas</h3>
                        <p>Realiza previamente una lista de tareas que quieras hacer durante la sesión de 
                        estudio: repasar un tema, realizar esquemas, etc. Tiene que tener un orden
                        de importancia y prioridad.</p>

                        <h3>Respeta el cronómetro</h3>
                        <p>Es necesario respetar los plazos para que se conviertan en un hábito. Detener una 
                        actividad a la mitad del trabajo se convierte en un incentivo para volver de
                        nuevo al estudio con la energía adecuada.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Apps para aplicar la técnica Pomodoro</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <p style="margin:0;"><strong>Tomatoro:</strong> Es una aplicación web simple y atractiva, se trata de un temporizador
                        online que te permite ajustar la duración del Pomodoro, el tiempo de descanso.</p>
                        <p style="margin:12px 0 0 0;"><strong>Forest:</strong> Esta aplicación comienza plantando una semilla y contando el tiempo.
                        Mientras estés centrado en la tarea el árbol irá creciendo, por el contrario, si te
                        sales de la aplicación durante el tiempo de estudio, tu árbol se marchitará. Cada
                        día que pasa crecerá un bosque que representa tus esfuerzos.</p>
                        <p style="margin:12px 0 0 0;"><strong>Focus Timer Reborn:</strong> Es una aplicación muy completa, sencilla e intuitiva cuenta
                        con un temporizador ininterrumpido donde podrás extraer datos estadísticos de
                        rendimiento, tareas, etc.</p>
                        </div>

                        <p>Durante los 5 minutos de descanso de tu peque puedes aplicar pausas activas, 
                        como las siguientes:</p>

                        <h3>Pausas activas:</h3>
                        <p>Las pausas activas consisten en realizar pequeños descansos con actividades en 
                        movimiento durante la jornada escolar que sirven para recuperar energía y mejorar 
                        el desempeño en las clases, acompañadas de recomendaciones 
                        sobre alimentación e hidratación saludables. Que ofrecen las pausas:</p>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <ul style="margin:0; padding-left:18px; line-height:1.8;">
                            <li>Las pausas están diseñadas por día, y son 3 pausas de 3 a 5 minutos, con opciones
                            a elegir, así como actividades que puedes compartir con tus familiares.</li>
                            <li>Los ejercicios propuestos son cotidianos, actividades sencillas y graduadas,
                            movimientos pasivos, movimientos activos de acuerdo con la edad.</li>
                            <li>En caso de que no le agrade alguna pausa pueden elegir otra o bien, repetir la
                            que les haya gustado.</li>
                        </ul>
                        </div>

                        <h3>Recomendaciones:</h3>
                        <div class="reading-note" style="border-left-color: var(--yellow-main);">
                        <ul style="margin:0; padding-left:18px; line-height:1.8;">
                            <li>Se recomienda que el peque realice estas pausas, ya que su práctica reduce
                            la fatiga, el estrés, favorece la concentración y mejora el desempeño en las
                            clases.</li>
                            <li>Es primordial que la respiración sea lo más profunda y rítmica posible, mantener
                            una postura de relajación, sentir los ejercicios de estiramientos y realizar los
                            ejercicios de manera suave y pausada.</li>
                            <li>Puedes adaptar cada pausa activa de acuerdo con los gustos de tu peque.</li>
                        </ul>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 1. Camina, marcha, salta, jala y estira en su lugar.</h3>
                        </div>

                        <p><strong>Desde la posición de pie:</strong></p>
                        <ol style="line-height:1.8;">
                        <li>El niño o niña marcha en su lugar a diferentes velocidades (lento, normal y
                        rápido), cuenta 8 tiempos (2 veces continuas).</li>
                        <li>En su lugar realizar pequeños saltos sobre ambos pies, 8 veces al ritmo lento (2
                        veces seguidas).</li>
                        <li>En su lugar realizar pequeñossaltossobre un pie, 5 veces al ritmo lento; al terminar
                        cambia de pie (2 veces seguidas).</li>
                        <li>En su lugar realizar pequeños saltos alternando los pies, al ritmo lento (2 veces
                        seguidas).</li>
                        </ol>

                        <p><strong>Desde la posición sentado:</strong></p>
                        <p>5.- Sentados en la silla: a) girar hacia el lado derecho o izquierdo. b) ponerse de
                        pie. c) mantener el equilibrio sobre la punta de los pies, brazos laterales. d)
                        sostenerse durante 2 tiempos y regresar a la posición inicial en el tiempo 4 (2 veces
                        seguidas). 6.- Sentados en la silla: a) girar hacia el lado derecho o izquierdo y
                        ponerse de pie. b) Apoyar ambos pies en el piso. c) Inclinar el tronco ligeramente
                        al frente y brincar dando una palmada por encima de la cabeza, contando
                        del 1 al 4 (2 veces seguidas).</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 2. Baile</h3>
                        </div>
                        <p>Busca el siguiente enlace, ábrelo, observa y escucha con tu peque los
                        movimientos que hacen los protagonistas del video. Repite el video, pero ahora
                        imiten y sigan los pasos al ritmo de la música. Bailen al ritmo del Hokey Pokey (puede
                        reproducir el video 2 veces) https://www.youtube.com/watch?v=riG5HItG67o</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 3. Saltar en diferentes formas el juego tradicional “Mar y tierra”.</h3>
                        </div>
                        <p>Realizar movimientos en su lugar basándose en el juego “Mar y tierra”: 1.- A partir de la
                        posición inicial de pie, en un lugar libre de objetos dentro de casa, realizarán los
                        siguientes movimientos: Cuando la nanny diga “mar” se dará un paso al frente;
                        cuando diga “tierra” se dará un paso hacia atrás.</p>

                        <p>Se podrá repetir de 2 a 3 veces la misma palabra según se desee. Por ejemplo: mar,
                        mar, mar, tierra,tierra, mar, tierra.</p>

                        <p>2.- Ahora se sustituirá el paso por un salto al frente cuando digan mar y saltar atrás
                        cuando digan tierra.</p>

                        <p>3.- Saltar de manera lateral, saltará a la derecha pies juntos cuando la nanny digan
                        mar y saltaran a la izquierda cuando diga tierra.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 4. Baile (el juego del calentamiento)</h3>
                        </div>
                        <p>Busca el siguiente enlace, ábrelo y sigan las instrucciones del sargento, seguro se
                        divertirán demasiado: https://www.youtube.com/watch?v=aSha5 SgHk</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 5. Canta, aplaude o tararea el juego tradicional “Las estatuas de marfil”</h3>
                        </div>

                        <ol style="line-height:1.8;">
                        <li>Al ritmo de la canción: “A las estatuas de marfil, uno, dos y tres así. El que se mueva
                        baila el twist con su hermana la lombriz, que le apesta el calcetín. Yo mejor me
                        quedo así”. Realizar movimientos libres y al término de la canción con la nanny se
                        quedará quieto. Tratará de mantenerse inmóvil compitiendo hasta que la otra
                        persona se mueva, las posiciones se deben ir cambiando con cada canto de la
                        canción y puede ser de diferentes formas: sentado, hincado, acostado, pueden
                        utilizar la creatividad del pequeño.</li>
                        <li>Inhalar y exhalar al final de la actividad (5 tiempos).</li>
                        <li>Volver a cantar: “A las estatuas de marfil, uno, dos y tres así. El que se mueva
                        baila el twist con su hermana la lombriz, que le apesta el calcetín. Yo mejor
                        me quedo así”. En esta ocasión se colocarán en la posición de algún animal, por
                        ejemplo: gato, perro, jirafa, elefante, etc.</li>
                        </ol>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 6: Movimientos del cuerpo (el conteo será del 1 al 8 y del 8 al 1 en todos los ejercicios)</h3>
                        </div>

                        <ol style="line-height:1.8;">
                        <li>Giren la cabeza hacia su lado derecho hasta que su mentón quede casi en
                        la misma dirección que su hombro. Luego háganlo al lado contrario.</li>
                        <li>Movimientos de cabeza hacia atrás y hacia el frente.</li>
                        <li>Movimientode hombros arribay abajo.</li>
                        <li>Movimiento de brazos al frente estirados alternados.</li>
                        <li>Flexión del tronco al frente.</li>
                        <li>Estando de pie, suban la rodilla derecha e izquierda alternadamente al hacia
                        el pecho.</li>
                        <li>Estandodepie, flexionen ligeramente susrodillas al mismo tiempo.</li>
                        <li>Estando de pie, realicen movimientos de punta y talón.</li>
                        </ol>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 7. Marchando en su lugar</h3>
                        </div>

                        <ol style="line-height:1.8;">
                        <li>De pie en algún lugar cómodo en casa, elevar la rodilla izquierda al frente junto
                        con el brazo derecho (10 veces).</li>
                        <li>A la voz de: “cambio”, realizar el mismo ejercicio con el pie derecho y el brazo
                        izquierdo (10 veces).</li>
                        <li>Con las manos pegadas a los costados y el cuerpo erguido como pingüinito,
                        elevar la pierna izquierda y luego la derecha en 10 tiempos.</li>
                        <li>Realizar “saltos de canguro”, piesjuntos con las manos en la cintura, realiza 10
                        saltosde canguro.</li>
                        <li>A la voz de cambio, “saltos de tijera”, saltar abriendo y cerrando el compás de
                        las piernas, realiza 10 salto de tijera.</li>
                        <li>A la voz de cambio, “patadas de karate”, elevar la pierna izquierda al frente
                        tocando la punta del pie con la mano derecha y viceversa.</li>
                        <li>Realizar respiraciones profundas contrayendo el abdomen y sacando el
                        pecho. Soltar el aire después de 5 segundos relajando el cuerpo.</li>
                        </ol>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 8. Expresión del cuerpo (todos los ejercicios se harán 8 veces)</h3>
                        </div>
                        <p>Movimientos corporales, imitando animales, la nanny le mencionará al peque 
                        algún animal y le explicará cómo realizar el movimiento para poderlo imitar. Por
                        ejemplo: mariposa: con las manos se simula el movimiento de las alas. Conejo:
                        Manos arriba simulando orejas de conejo y brincando en su lugar. Águila: Brazos
                        extendidos hacia arriba simulando el vuelo del águila.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 9. Activar al cuerpo (el conteo será del 1 al 8 y del 8 al 1 en todos los ejercicios)</h3>
                        </div>

                        <ol style="line-height:1.8;">
                        <li>Movimiento de cabeza al frente y atrás.</li>
                        <li>Movimiento de cabeza con medio giro al frente.</li>
                        <li>Girode hombros al frente y atrás.</li>
                        <li>Movimientode brazos arriba al arriba y abajo.</li>
                        <li>Estire los brazos y haga movimientos circulares de las muñecas de forma lenta.</li>
                        <li>Entrelazar las manos y llevarlas hacia arriba de la cabeza con los brazos
                        estirados durante 15 segundos.</li>
                        <li>Coloque las manos en su cintura y haga movimientos circulares a ambos
                        lados.</li>
                        <li>Realice movimientos circulares de tobillo hacia ambos lados con cada
                        pie.</li>
                        </ol>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 10. Movimiento de brazos y piernas</h3>
                        </div>

                        <p>La nanny se colocará frente al peque y ambos realizarán las acciones de
                        acuerdo a lossiguientes movimientos.</p>

                        <ol style="line-height:1.8;">
                        <li>Cuando la nanny pronuncie el número 1 chocarán ambos su mano
                        derecha.</li>
                        <li>Cuando pronuncie 2 chocarán la mano izquierda.</li>
                        <li>Cuando diga 3 chocarán ambas manos de frente.</li>
                        <li>Cuando diga 4 chocarán ambos su pie derecho.</li>
                        <li>Cuando diga 5 chocarán ambos su pie izquierdo.</li>
                        <li>Cuando mencione el número 6 se abrazarán.</li>
                        </ol>

                        <p>Practicarán 2 veces la secuencia para que posteriormente la nanny mencione los
                        números en forma desordenada, por ejemplo: 3, 1, 4, 6, 5, 5, 2, 2. Una alternativa de 
                        cambio puede ser que el peque mencione los números.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Pausa activa 11. Director de la orquesta</h3>
                        </div>

                        <p>La nanny y el pequeño deberán colocarse de frente, uno de ellos realizará
                        diferentes movimientos (mano en la cabeza, saltar, reír, hacer muecas, etc.) y el
                        otro deberá imitarlos, pueden repetir el juego de 2 a 4 veces e ir intercalando entre
                        ellos.</p>

                        <h3 style="margin-top:26px;">Referencias:</h3>

                        <p>Ferrández, M. (2022). ¿Por qué utilizar la técnica de estudio Pomodoro y cómo? 
                        U4IMPACT. Disponible en: https://www.u4impact.org/por-que-utilizar-la tecnica- de￾estudio-pomodoro-y-como￾hacerlocorrectamente/#:~:text=El%20m%C3%A9todo%20Pomodoro%20es%20sim
                        plemente,tarea%20sea%20mucho%20m%C3%A1s%20llevadera.</p>

                        <p>Gobierno de Baja California. (2022). Estrategias de educación a
                        distancia/preescolar. Secretaria de educación. Dirección de educación física y 
                        deporte escolar. Disponible 
                        en: https://www.educacionbc.edu.mx/materialdeapoyo/public/site/pdf/educaci
                        onbasica/educacionfisica/preescolar/pausasactivas.pdf</p>

                    </div>
                    `
                },

                {
                    id: 25,
                    titulo: "Cuando tu peque solo quiere brazos: calma, apego y pasos suaves para soltar",
                    resumen: "Si siente que no puede separarse de usted, no es “maña”: es desarrollo, seguridad y amor. Lea esta guía para entender qué pasa y cómo acompañarlo con paciencia, sin culpas.",
                    imagen: "assets/img/articulos/25.jpeg",
                    categoria: "Crianza",
                    contenido: `
                        <div class="reading-note" style="margin-top: 0;">
                        <strong>¿Cómo desacostumbrar a mi peque a los brazos?</strong>
                        </div>

                        <p><strong>¿Por qué el bebé de repente solo quiere estar en brazos?</strong> Durante el desarrollo físico y mental de los bebés tienen lugar distintas etapas. Una de ellas es la angustia de la separación, que consiste precisamente en eso: el bebé siente ansiedad cuando deja de ver a sus padres o cuidadores primarios porque no tiene noción del tiempo ni del espacio. Si no te ve, no estás, y es ahí donde el peque reacciona por pura cuestión de instinto y de la única forma que conoce: llorando.</p>

                        <p>Los bebés, como parte de su desarrollo natural, pasan una fase en la que su lugar favorito son los brazos de su madre, ya que, nacen en un mundo nuevo, no conocen nada, se tienen que habituar a un ritmo, y para eso necesitan a mamá. Para los bebés los brazos son una necesidad afectiva, son un abrazo, amor, cariño y caricias, son la seguridad en momentos de crisis, en definitiva, son el descanso.</p>

                        <p>Para su desarrollo intelectual y físico, como para los aspectos afectivos, el mantener esta fase lo más auténticamente posible, tiene enormes beneficios, pues, cargados sienten confianza y protección. En términos evolutivos, la cercanía física facilita la alimentación, regula la temperatura, y el bebé escucha, conoce y ve mejor a sus cuidadores.</p>

                        <p>A la mayoría de los bebés les gusta estar en brazos, especialmente a los bebés de pocos meses. No obstante, hay bebés que reclaman más contacto físico que otros, esto depende del temperamento propio de cada uno. Así pues, algunos bebés no toleran que se les deje en la cuna o hamaca y piden estar en brazos la mayor parte del tiempo, sin embargo, el bebé que reclama constantemente que lo cojan en brazos está expresando una necesidad de afecto y protección.</p>

                        <p>Necesita que sus padres respondan a esta necesidad para poder construir su confianza en el mundo que le rodea. Por lo tanto, es importante que los cuidadores ofrezcan al bebé el afecto que éste necesita. Tomarlo en brazos, acunarlo, acariciarlo, etc. son expresiones de afecto necesarias para el desarrollo adecuado del área emocional del bebé, de su autoestima y de la seguridad en sí mismo y en su entorno.</p>

                        <div class="reading-note">
                        <strong>¿Por qué en brazos está más tranquilo/a?</strong>
                        <p style="margin: 12px 0 0 0;">Básicamente porque sabe que está a salvo, además, sabe que alguien va a estar ahí para alimentarlo, consolarlo y calmarlo cuando lo necesite e intuye que no habrá ningún peligro si alguien lo tiene en brazos.</p>
                        </div>

                        <p><strong>¿Pero una vez dormido/a cómo sigue sabiendo que está en brazos?</strong> Porque todo su cuerpo, igual que el nuestro, envía señales al cerebro sobre nuestra postura y nuestro movimiento. Es decir, su cerebro es capaz de detectar el movimiento y la altura, de forma que recibe la señal de que si se mueve y encima hay altura alguien debe de estar cuidándolo. Por eso todos los bebés se calman en el coche o se duermen paseando o cuando los tenemos en brazos.</p>

                        <p><strong>¿Por qué nada más acostarlo en la cuna o en el cochecito se despierta?</strong> Porque el peque no sabe que alguien lo está cuidando, esto provoca que: tenga ciclos de sueño más cortos y más micro despertares al acabar cada ciclo, además la mayor parte de su sueño es ligero.</p>

                        <div class="reading-note" style="border-left-color: var(--pink-main);">
                        <strong>¿Qué no se recomienda hacer?</strong>
                        <p style="margin: 12px 0 0 0;">Algunas personas recomiendan dejar al bebé llorar hasta que se acostumbre a estar en la cuna, pero ésta es una forma muy poco beneficiosa para el desarrollo afectivo del bebé, ya que, se le está enseñando a resignarse a que no respondan a sus necesidades, pero todavía no puede entender por qué, también, puede ser el primer paso para que empiecen a no hacer caso a sus sensaciones y emociones o en su defecto, a anularlas.</p>
                        </div>

                        <h3 style="margin-top: 28px;">Consecuencias de no tomar a tu bebé en brazos lo necesario</h3>
                        <p>Si dejas al bebé llorar cada vez que pide brazos, estarás contribuyendo a generar en tu peque:</p>

                        <div class="reading-table" style="padding: 18px;">
                        <div class="rt-row"><span>• Estrés</span><span></span></div>
                        <div class="rt-row"><span>• Ansiedad</span><span></span></div>
                        <div class="rt-row"><span>• Inseguridad</span><span></span></div>
                        <div class="rt-row"><span>• Desconfianza</span><span></span></div>
                        <div class="rt-row"><span>• Falta de autoestima, confianza y apego</span><span></span></div>
                        <div class="rt-row"><span>• Individualismo</span><span></span></div>
                        <div class="rt-row"><span>• Soledad</span><span></span></div>
                        </div>

                        <h3>¿Cómo desacostumbrar a un bebé a los brazos?</h3>

                        <div class="reading-note">
                        <strong>No atiendas a las primeras llamadas:</strong>
                        <p style="margin: 12px 0 0 0;">Es normal que, al principio, cuando dejas a tu bebé en la hamaca solito, empiece a quejarse y llorar para llamar tu atención. Sé paciente, y espera un poco antes de cogerlo en brazos por el más mínimo llanto. Eso no quiere decir que esperes a que tu peque acabe con un berrinche tremendo, pero sí que lo dejes un poco para que se vaya acostumbrando a la nueva situación.</p>
                        </div>

                        <div class="reading-note">
                        <strong>Ofréceles entretenimiento:</strong>
                        <p style="margin: 12px 0 0 0;">Ofrécele a tu peque algo con lo que esté entretenido para que no llore a la primera de cambio cuando no está en tus brazos, por ejemplo, un juguete divertido, una mantita o incluso puedes animarle con música y bailando frente a él mientras haces otras actividades.</p>
                        </div>

                        <div class="reading-note">
                        <strong>Déjalo explorar:</strong>
                        <p style="margin: 12px 0 0 0;">A medida que los peques se van haciendo mayores, hay que dejarlos explorar su medio. Necesitan más espacio, y puede ser el momento ideal de dejarlos que gateen por casa o construirles un espacio en el que estén seguros para moverse y jugar con sus juguetes favoritos. Si el peque solo quiere brazos, tiene que acostumbrarse a otros ambientes que le motiven más, por lo tanto, cámbialo a diferentes escenarios, es decir: un rato en la sala, otro en la cama, tapete, carriola, etc. y aunque lo tengamos en un lugar es importante estar a un lado de ellos y que sientan nuestra compañía</p>
                        </div>

                        <p>Poco a poco, el peque va aprendiendo que hay otras cosas más interesantes que estar siempre en brazos de los adultos, con esto, pasará de ser un niño de brazos a un peque de lo más independiente y aventurero.</p>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>Recuerda:</strong>
                        <p style="margin: 12px 0 0 0;">desacostumbrar al bebé a los brazos es un aprendizaje progresivo, y no ocurre de un día para otro.</p>
                        </div>

                        <h3>Referencias:</h3>

                        <div class="reading-table" style="padding: 18px;">
                        <div class="rt-row" style="gap:10px;align-items:flex-start;">
                            <span>Castro, M. (10 de agosto de 2020). Por qué los bebés necesitan estar en brazos. Eres mamá. Disponible en:</span>
                            <span style="text-align:right;word-break:break-word;">
                            https://eresmama.com/por-que-los-bebes-necesitan￾estar-en-brazos/
                            </span>
                        </div>
                        <div class="rt-row" style="gap:10px;align-items:flex-start;">
                            <span>El bebé. (12 de febrero de 2023). Claves para responder al bebé que sólo quiere estar en brazos. El bebé. Disponible en:</span>
                            <span style="text-align:right;word-break:break-word;">
                            https://www.elbebe.com/bebes/claves￾para-responder-al-bebe-que solo-quiere-estar-en-brazos
                            </span>
                        </div>
                        <div class="rt-row" style="gap:10px;align-items:flex-start;">
                            <span>El blog de tu bebé. (22 de abril 2019). Mi bebé sólo quiere brazos para dormir, ¿qué debo hacer? El blog de tu bebé. Disponible en:</span>
                            <span style="text-align:right;word-break:break-word;">
                            https://www.elblogdetubebe.com/mi-bebe-solo-quiere brazos-para-dormir-que￾debo-hacer/
                            </span>
                        </div>
                        <div class="rt-row" style="gap:10px;align-items:flex-start;">
                            <span>Guerra, L. (19 de diciembre de 2021). Mi bebé sólo quiere estar en brazos. Bebés y más. Disponible en:</span>
                            <span style="text-align:right;word-break:break-word;">
                            https://www.bebesymas.com/consejos/mi-bebe-solo-quiere￾estar-brazos
                            </span>
                        </div>
                        <div class="rt-row" style="gap:10px;align-items:flex-start;border-bottom:none;">
                            <span>Irene. (17 de marzo de 2017). Mi bebé solo se duerme en brazos y cuando lo acuesto de despierta ¿Es normal? Cuidados y caricias. Disponible en:</span>
                            <span style="text-align:right;word-break:break-word;">
                            https://www.cuidadosycaricias.es/bebe-solo-se duerme-en-brazos
                            </span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 26,
                    titulo: "🤍 Hermanos sin guerra: cómo cuidar el vínculo, el amor… y la calma en casa",
                    resumen: "Cuando hay peleas entre hermanos, a veces duele más por dentro que por fuera. Esta guía te ayuda a saber cuándo intervenir, cómo acompañar sin favoritismos y qué hacer para fortalecer la armonía familiar con respeto y empatía.",
                    imagen: "assets/img/articulos/26.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">¿Cómo equilibrar las relaciones entre hermanos?</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">🤍 Armonía en casa</strong>
                        <p style="margin:10px 0 0 0;">Aunque sabemos que no hay preferencias en los hogares por un peque en particular, a 
                        veces puede resultar complejo compaginar las diferentes personalidades entre los 
                        peques, sobre todo cuando las edades oscilan entre los 2 a 3 años de diferencia.</p>
                        </div>

                        <p>Aunque sabemos que no hay preferencias en los hogares por un peque en particular, a 
                        veces puede resultar complejo compaginar las diferentes personalidades entre los 
                        peques, sobre todo cuando las edades oscilan entre los 2 a 3 años de diferencia.</p>

                        <p>Es común notar que los peques peleen con sus hermanos, unas de las causas suelen ser 
                        por tener la atención de los progenitores (o de las figuras de cuidado principales) o por 
                        situaciones materiales. Por lo que, ¿cuándo debemos actuar?</p>

                        <p>Primero es importante entender que estas peleas son normales, no hay familia 
                        donde los hermanos no hayan tenido al menos una situación similar en la infancia, no 
                        siempre es necesario que haya una intervención adulta en los encuentros. Cuando estas 
                        situaciones sean por una situación “menor” (que no afecte la integridad de ninguna de 
                        las partes) lo mejor es dejar que los peques desarrollen sus capacidades de resolución 
                        de conflictos, así como la habilidad de comunicar claramente sus gustos y deseos. Sin 
                        embargo, si notamos que estas peleas son constantes y resultan en golpes u otras 
                        acciones que lastimen físicamente, es importante abordarlo desde el inicio para evitar 
                        que la situación escale; también es imperante intervenir cuando veamos alguna 
                        desventaja mayor entre ambos, cuando se lastimen emocionalmente o perjudiquen su 
                        autoestima.</p>

                        <p>Ahora bien, ¿qué hacemos si las situaciones no llegan a un conflicto en particular,
                        pero notamos diferencias o cambios de actitud entre los hermanos o con sus cuidadores 
                        principales?</p>

                        <p>Esto suele suceder más con los hermanos mayores, cuando empiezan a crecer y 
                        pueden notar algunas disparidades entre las relaciones familiares y aún más cuando van 
                        a entrar a la pubertad o a la adolescencia, ya que es una época compleja 
                        emocionalmente. Para estos casos hacemos las siguientes recomendaciones:</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Recomendaciones para hermanos mayores</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <ol style="margin:0; padding-left:18px; line-height:1.9;">
                            <li><strong>Pasa tiempo de calidad con cada peque:</strong> Date el tiempo de compartir con cada 
                            uno de los peques de manera individual, realicen alguna actividad que les guste 
                            a ambos y bríndale la oportunidad de que se abra contigo en esos momentos. 
                            Inclusive, si no quiere platicar, tampoco pasa nada, pero procura que se sienta 
                            acompañado.</li>

                            <li><strong>Explícale detalladamente la situación:</strong> en ocasiones llegan comparaciones 
                            típicas como “¿Por qué él sí y yo no?” y en esos momentos es necesario explicar 
                            con calma la situación e intentar a través del diálogo que empatice con la otra 
                            parte, haciendo preguntas como “¿Por qué crees tú que es así?”</li>

                            <li><strong>Fortalece sus habilidades de liderazgo:</strong> Los hermanos mayores suelen ser guías y 
                            buscan cuidar a sus hermanos menores, fortalece esas conductas felicitándole y 
                            agradeciéndole por su esfuerzo. En medida de lo posible, permite que explore 
                            esas habilidades de liderazgo en deportes o actividades donde pueda 
                            explotarlas.</li>

                            <li><strong>Mantén constantes los límites:</strong> Es importante que en un hogar siempre haya reglas 
                            y se mantengan. Estas reglas y límites podrían ser incluso propuestos entre todos 
                            los miembros de la familia, en la medida de lo posible, todos trabajen en conjunto 
                            para mantener la armonía del hogar.</li>

                            <li><strong>Recuerden que los hermanos siempre se cuidan:</strong> Intenta fomentar en tus peques la 
                            idea de que, si algún hermano alguna vez llega a tener alguna dificultad, siempre 
                            podrá contar con el otro (o los otros).</li>
                        </ol>
                        </div>

                        <p>Ahora bien, para los hermanos menores el vínculo con sus hermanos podría percibirse 
                        de una forma muy diferente, puede suceder que el pequeño vea con admiración a su 
                        hermano o puede suceder que prefiera alejarse para “no molestarlo”. Para estos casos, 
                        hacemos las siguientes recomendaciones:</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Recomendaciones para hermanos menores</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <ol style="margin:0; padding-left:18px; line-height:1.9;">
                            <li><strong>Valora sus propias habilidades:</strong> Eviten comparaciones con el hermano mayor, ya 
                            sean positivas o negativas. En caso de que quiera enseñarse una lección en 
                            particular, hablen de las acciones y de las consecuencias, no de las 
                            personalidades.</li>

                            <li><strong>Permite el desarrollo de su propia personalidad:</strong> En algunas ocasiones a los más 
                            peques les suele costar enfocarse en una sola actividad y puede probar varias, 
                            esto puede suceder porque ha observado las actividades de sus hermanos o de 
                            otras personas mayores y están en búsqueda de una actividad que les llene como 
                            a los demás.</li>

                            <li><strong>Dales tiempo para desarrollarse en todos los aspectos:</strong> Está bien que los peques 
                            sean independientes y conscientes, pero cuida su inocencia e imaginación, no 
                            juzgues sus comentarios o pensamientos de acuerdo con lo que “deberían saber” 
                            sino a su edad y etapa de vida.</li>

                            <li><strong>Enséñale a respetar y cuidar las cosas de los demás:</strong> Cuando son peques es 
                            normal que quieran curiosear o tomar las cosas de sus hermanos, enséñales a 
                            pedir prestado diciendo “por favor”, “gracias” y devolviendo las cosas a su lugar. 
                            Así mismo, si el hermano mayor no quiere compartir, también es válido y no 
                            podemos simplemente ceder, enseñémosles a los más peques que hay que 
                            respetar el límite y continuar con sus propias cosas.</li>

                            <li><strong>Hazlo sentir lo más acompañado posible:</strong> A medida que los peques crecen, es 
                            normal empezar a notar que los hermanos mayores se alejan para hacer su vida 
                            y vivir nuevas experiencias, lo que muchas veces causa en los hermanos menores 
                            que se sientan desplazados y abandonados por quienes solían jugar con ellos, por 
                            eso es importante que siempre sepan y sientan que eso no es su culpa y que 
                            siempre van a ser amados, así como fomentar el desarrollar amistades sanas con 
                            otros peques que puedan acompañarlos.</li>
                        </ol>
                        </div>

                        <p>Así como mencionamos previamente, cada peque y cada familia es diferente, por ello 
                        los consejos aquí presentes deben considerarse según las necesidades de cada hogar.</p>

                        <p>Finalmente, mencionaremos algunos aspectos generales a considerar:</p>

                        <div class="reading-table" style="margin-top:14px;">
                        <div class="rt-row"><span>Fomenta el trabajo en equipo dentro del hogar.</span><span>🤝</span></div>
                        <div class="rt-row"><span>Dales espacio de desarrollar sus habilidades de resolución de conflictos.</span><span>🧠</span></div>
                        <div class="rt-row"><span>Fomenta la escucha activa a través de la ejemplificación.</span><span>👂</span></div>
                        <div class="rt-row"><span>Acepta que es normal enfadarse y aprendan a canalizar el enojo de manera positiva y proactiva.</span><span>🌈</span></div>
                        </div>

                        <h3 style="margin-top:26px;">Referencias</h3>

                        <p>Educo, O. N. G. (2021). Consejos para crear buenas relaciones entre hermanos y 
                        hermanas. El Blog de Educo. https://www.educo.org/blog/consejos-buenas￾relaciones-entre-hermanos</p>

                        <p>Jorquera, L. (2024). 8 Tips para mejorar la relación entre hermanos. brightkids; 
                        Brightkids.es. https://brightkids.es/8-tips-para-mejorar-la-relacion-entre￾hermanos/</p>

                        <p>Rey, A. G. (2024). Tips para mejorar la relación entre hermanos. Consulta de Psicología 
                        Ana García Rey. 
                        https://psicologiaanagarciarey.com/index.php/2024/06/18/tips-para-mejorar￾la-relacion-entre-hermanos/</p>

                        <p>Rommel. (2024). Cómo gestionar las peleas entre hermanos. Psicóloga Adolescente. 
                        https://www.psicologa-adolescentes.com/como-gestionar-peleas-hermanos/</p>

                    </div>
                    `
                },

                {
                    id: 27,
                    titulo: "🌙 Las rutinas son la calma que tu peque necesita para sentirse seguro y florecer",
                    resumen: "Las rutinas no son rigidez… son amor convertido en seguridad. Cuando tu peque sabe qué viene después, su mente descansa, su corazón se tranquiliza y todo el día se vuelve más fácil. Aquí encontrarás estrategias sencillas para crear rutinas efectivas y herramientas visuales que fortalecen su autonomía.",
                    imagen: "assets/img/articulos/27.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">El poder de las rutinas: estrategias pedagógicas para el día a día</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">✨ Estructura que da seguridad</strong>
                        <p style="margin:10px 0 0 0;">Las rutinas diarias ofrecen estructura, anticipación y consistencia que contribuyen 
                        a un desarrollo saludable; las rutinas son mucho más que una forma de “organizar 
                        el día” representan un pilar fundamental en el desarrollo del peque, algunas 
                        investigaciones demuestran sus beneficios en múltiples áreas como el 
                        establecimiento de horarios, alimentación, diversión, estudio y descanso, brinda a 
                        los peques una sensación de seguridad y estabilidad emocional, además, estas 
                        prácticas refuerzan la autorregulación emocional y conductual.</p>
                        </div>

                        <h3>Algunos beneficios de establecer rutinas son</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Promover la autorregulación y la atención, pues los peques saben qué es esperar y se distraen menos.</span><span>🧠</span></div>
                        <div class="rt-row"><span>Favorecer la comprensión temporal, el aprendizaje de secuencias y las relaciones causa-efecto.</span><span>⏳</span></div>
                        <div class="rt-row"><span>Apoyar el desarrollo cerebral, especialmente en áreas vinculadas al lenguaje, percepción sensorial y procesamiento emocional, por medio de un sueño más estable.</span><span>🌙</span></div>
                        <div class="rt-row"><span>Respaldar el bienestar emocional, ya que reducen el estrés y fortalecen el sentido de seguridad.</span><span>🤍</span></div>
                        <div class="rt-row"><span>En el caso de las rutinas nocturnas (como el baño, lectura o canto), promueven mejores hábitos de higiene, lenguaje, regulación emocional, vínculo etc.</span><span>🛁</span></div>
                        <div class="rt-row"><span>Contribuir a una mejor preparación escolar, rendimiento académico y habilidades cognitivas.</span><span>📚</span></div>
                        <div class="rt-row"><span>A lo largo del tiempo, los peques que mantienen rutinas consistentes tienen menos problemas de atención, conducta o emociones.</span><span>✨</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Estrategias pedagógicas para crear rutinas efectivas</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <ol style="margin:0; padding-left:18px; line-height:1.9;">
                            <li><strong>Define “anclas” diarias:</strong> identifica momentos clave como despertarse, las 
                            comidas, la tarea y la hora de dormir; estas anclas brindan estabilidad.</li>
                            <li><strong>Ve paso a paso:</strong> comienza con una rutina sencilla (ej. solo la mañana) y ve 
                            incorporando gradualmente más actividades.</li>
                            <li><strong>Equilibra estructura con flexibilidad:</strong> mantén lo importante (como la hora de 
                            dormir) y permite elecciones pequeñas (como elegir pantalones antes de 
                            vestirse).</li>
                            <li><strong>Incluye mini-rutinas para transiciones:</strong> señales como “5 minutos para 
                            recoger” o canciones ayudan a pasar de una actividad a otra sin 
                            complicaciones.</li>
                            <li><strong>Implica al peque en su rutina:</strong> si el peque participa en armar la rutina visual, 
                            aumenta su compromiso.</li>
                            <li><strong>Fomenta la independencia:</strong> asigna pequeñas tareas apropiadas según su 
                            edad, como ponerse zapatos o guardar juguetes.</li>
                            <li><strong>Usa herramientas visuales:</strong> las ayudas visuales reducen la carga mental del 
                            peque y clarifican lo que sigue, favoreciendo el enfoque.</li>
                            <li><strong>Crea rituales calmantes nocturnos:</strong> actividades como lectura, baño 
                            tranquilo o canciones ayudan a preparar el cuerpo y la mente para un 
                            sueño reparador.</li>
                            <li><strong>Sé constante y pacientes:</strong> las rutinas tardan en asentarse ajústalas según 
                            cambien las necesidades del peque o tu día a día.</li>
                        </ol>
                        </div>

                        <p>Los apoyos visuales son herramientas que ayudan a los peques a comprender y 
                        seguir las rutinas de forma independiente, favorecen el desarrollo de la autonomía, 
                        el lenguaje y la organización, a continuación, te compartimos algunas opciones:</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Apoyos visuales para rutinas</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <p style="margin:0;"><strong> Carteles secuenciales de actividades</strong></p>
                        <p style="margin:10px 0 0 0;">Son láminas verticales u horizontales donde cada paso de la rutina se representa 
                        con un dibujo o ilustración sencilla, por ejemplo: una cama para “despertar”, un 
                        cepillo para “lavarse los dientes”. Se colocan en orden cronológico en un lugar 
                        visible (puerta, baño, cocina) y ayudan a peques no lectores a anticipar lo que 
                        sigue.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;"><strong> Tarjetas individuales con pictogramas</strong></p>
                        <p style="margin:10px 0 0 0;">Pequeñas tarjetas con imágenes, símbolos o palabras que representan actividades 
                        (desayunar, leer, bañarse) se pueden usar en un tablero de velcro o imanes, 
                        permitiendo que el peque mueva cada tarjeta cuando completa la acción
                        favorecen la participación y la sensación de logro.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--yellow-main);">
                        <p style="margin:0;"><strong> Tableros de “Primero-Luego”</strong></p>
                        <p style="margin:10px 0 0 0;">Son tablas simples que dividen dos actividades una que debe hacerse primero 
                        (recoger juguetes) y otra que se hará después (realizar la tarea), este formato 
                        ayuda a peques con dificultades de atención a comprender prioridades y a 
                        mantener la motivación, listas de control “checklists”.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;"><strong> Relojes o cronogramas visuales</strong></p>
                        <p style="margin:10px 0 0 0;">Se representan bloques de tiempo con colores o dibujos que permiten a los peques
                        entender la duración de las actividades y el concepto de tiempo (azul = hora de 
                        dormir, amarillo = juego), fomentan la gestión del tiempo desde edades tempranas.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <p style="margin:0;"><strong> Calendarios semanales de actividades:</strong></p>
                        <p style="margin:10px 0 0 0;">Una hoja grande con los días de la semana y dibujos representativos (escuela, 
                        clases de natación, visita a abuelos), favorece la noción de días y rutinas a largo 
                        plazo muy útil para peques que experimentan ansiedad ante cambios.</p>
                        </div>

                        <p>Estas herramientas promueven la independencia, reducen conflictos y fortalecen 
                        el vínculo entre cuidadores y peques, al hacer visible y comprensible lo que se 
                        espera de cada uno.</p>

                        <h3>Bibliografía</h3>
                        <p>Biddle, S. J. H., Garcia Bengoechea, E., & Wiesner, G. (2018). Sedentary 
                        behaviour and adiposity in youth: A systematic review of reviews and analysis 
                        of causality. BMC Public Health, 18(1), 1–10. 
                        file:///C:/Users/nannysypeques/Downloads/s12889-018-5290-3.pdf</p>

                        <p>CSEFEL. (2006). Practical strategies for supporting young children’s social￾emotional development: Routines and schedules. Vanderbilt University.
                        https://csefel.vanderbilt.edu/resources/wwb/wwb3.html</p>

                        <p>Candella Morell. (2024). La importancia de las rutinas en el desarrollo infantil.
                        Candella Morell psicología https://candelamorellpsicologia.es/las-rutinas￾en-el-desarrollo-infantil/</p>

                        <p>Spagnola, M., & Fiese, B. H. (2007). Family routines and rituals: A context for 
                        development in the lives of young children. Infants & Young Children, 20(4), 
                        284–299. 
                        file:///C:/Users/nannysypeques/Downloads/family_routines_and_rituals__a_
                        context_for.2.pdf</p>

                        <p>Kids Mental Health Foundation. (2023). Kids routines: Mental wellness 
                        resources for families.https://www.kidsmentalhealthfoundation.org/mentalhealth-resources/mental-wellness/kids-routines</p>

                    </div>
                    `
                },

                {
                    id: 28,
                    titulo: "🌿 Disciplina positiva: firmeza con amor (sin gritos, sin culpa, con resultados reales)",
                    resumen: "Educar no debería sentirse como una batalla diaria. Este artículo le guía con principios y técnicas claras para poner límites con respeto, conectar con su peque y corregir conductas sin castigos que lastimen el vínculo.",
                    imagen: "assets/img/articulos/28.jpg",
                    categoria: "Educación",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/28.jpg')"></div>

                        <div class="reading-view" style="padding-top: 0;">
                        <div class="reading-note" style="margin-top: 0;">
                            <strong>DISCIPLINA POSITIVA</strong>
                        </div>

                        <p style="text-align:center; font-style: italic; margin-top: 6px;">“La Disciplina Positiva es educar desde la amabilidad y la firmeza”</p>

                        <p>La disciplina positiva es una metodología educativa diseñada para ayudar a las personas a convertirnos en adultos responsables, respetuosos y llenos de recursos para afrontar cualquier obstáculo.</p>

                        <p>La disciplina positiva enseña a los adultos a utilizar amabilidad y firmeza, hoy te compartimos 5 principios para que puedas ponerlos en práctica dentro de tu hogar, notarás cambios pronto:</p>

                        <div class="reading-table" style="padding: 18px;">
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800; color: var(--pink-main);">1)Respeto mutuo.</span>
                            <span style="flex:1; text-align:right;">Siempre y ante todo el respeto. El niño tiene que respetar a sus padres, así como los padres al niño. Aunque acabe de hacer un berrinche en medio de la calle, la disciplina positiva se basa en un respeto absoluto, no golpes, no gritos desmedidos.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800; color: var(--pink-main);">2)Aprende de los errores.</span>
                            <span style="flex:1; text-align:right;">Los errores son una oportunidad para educar. Con los errores puedes enseñar las consecuencias de los actos (buenas y malas) y reflexionar sobre la situación, no sólo intentar cambiar el comportamiento sin dar razón alguna.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800; color: var(--pink-main);">3) Consecuencias y no castigos.</span>
                            <span style="flex:1; text-align:right;">La disciplina positiva anima a enfocarse en soluciones en lugar de castigos. El castigo es efectivo a corto plazo, sin embargo, las consecuencias pueden ir acompañadas de aprendizaje.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800; color: var(--pink-main);">4) Comunicación efectiva.</span>
                            <span style="flex:1; text-align:right;">Para la disciplina positiva es importante conectar con tu hijo para que, con atención plena pueda entender la situación, la consecuencia e incluso llegar el solo a la reflexión de su comportamiento.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:800; color: var(--pink-main);">5)Alentar (en lugar de alabar).</span>
                            <span style="flex:1; text-align:right;">Cuando alentamos, ponemos atención al esfuerzo y la mejoría, no simplemente al éxito. Esto fortalece la autoestima y estimula la superación. Recuerda que la práctica hace al maestro.</span>
                            </div>
                        </div>

                        <h3 style="margin-top: 28px;">8 técnicas para educar a los hijos con disciplina positiva</h3>

                        <p>Para educar desde este modelo hay que recordar que se debe evitar la utilización de castigos físicos y verbales y alejarnos de la imposición de normas y pautas. Ya que el niño debe aprender y no obedecer. Algunas técnicas de disciplina positiva son lassiguientes:</p>

                        <div class="reading-note">
                            <strong>1 - Elogia lo que te gusta</strong>
                            <p style="margin: 12px 0 0 0;">Pondera, cuenta y revive aquellos momentos en los que el niño se porta bien. Son una forma de reforzar las conductas que se quieren repetir.</p>
                        </div>

                        <div class="reading-note">
                            <strong>2 - Dar rutinas</strong>
                            <p style="margin: 12px 0 0 0;">Establecer normas habituales evitará conductas no deseadas. Si, por ejemplo, el niño sabe que después de jugar debe recoger, le hace entender que si un día no guarda los juguetes estará actuando mal y esto tendrá consecuencias que no le gustan y que deberá asumir. Por lo que, tratará de hacerlo bien.</p>
                        </div>

                        <div class="reading-note">
                            <strong>3 - Control del adulto</strong>
                            <p style="margin: 12px 0 0 0;">El mal comportamiento se puede describir como una llamada de atención 'mal realizada'. El niño entiende que le dedicas más tiempo cuando adopta posturas de este tipo. No prestes atención cuando el pequeño se comporte de una manera inaceptable, en lugar de discutir con él. Así aprenderá que hay mejores maneras de comunicarse.</p>
                            <p style="margin: 12px 0 0 0;">Hay veces que se da una situación tensa y sabes que lo que ha hecho está muy mal. Es difícil mantenerte tranquilo, pero hay que pensar que no se debe hacer delante del niño aquello que no queremos que ellos hagan después. Prueba a dejar el lugar donde está tu pequeño o intenta hacer ejercicios de relajación. Espera a haberte calmado y vuelve a entrar.</p>
                        </div>

                        <div class="reading-note">
                            <strong>4 - Preguntar en vez de ordenar</strong>
                            <p style="margin: 12px 0 0 0;">Así nos aseguramos de que el niño conoce la respuesta y le damos la libertad de hacer las cosas o no sabiendo las consecuencias de sus actos.</p>
                            <p style="margin: 12px 0 0 0;">De este modo el niño aprende a comportarse y no a obedecer ciegamente. Por ejemplo, ¿Qué toca hacer ahora? Y dejar que el niño responda.</p>
                        </div>

                        <div class="reading-note">
                            <strong>5 - Avisar con antelación</strong>
                            <p style="margin: 12px 0 0 0;">Antes de que acabe la actividad que está realizando ir diciéndole y recordándole que es loque viene para que no le pille de sopetón.</p>
                        </div>

                        <div class="reading-note">
                            <strong>6 - Dar opciones de comportamiento</strong>
                            <p style="margin: 12px 0 0 0;">Dar a elegir el orden en el que quieren hacer las tareas que deben realizar. Por ejemplo, ¿Prefieres ducharte antes o después de cenar?</p>
                        </div>

                        <div class="reading-note">
                            <strong>7 - Tabla de recompensas</strong>
                            <p style="margin: 12px 0 0 0;">Establecer límites y reglas claros de manera escrita puede hacer que el niño vea de manera clara que se refuerzan una cantidad de acciones bien realizadas</p>
                        </div>

                        <div class="reading-note">
                            <strong>8 - El ejemplo de los padres</strong>
                            <p style="margin: 12px 0 0 0;">Es la mejor técnica de disciplina positiva. Los niños imitan todas las conductas que les llaman la atención si no existen otras alternativas por lo que los padres han de actuar con coherencia para servir de modelo a los pequeños.</p>
                        </div>

                        <h3 style="margin-top: 28px;">Sistema de Consecuencias Según la Disciplina Positiva</h3>

                        <p>El sistema de consecuencias es un método de crianza que busca inculcar la disciplina en los peques, pero dejando a un lado la idea del castigo autoritario y sustituyéndolo por el conocimiento de que todo lo que hacemos tiene consecuencias positivas y negativas.</p>

                        <div class="reading-note" style="border-left-color: var(--pink-main);">
                            <strong>Interesante, ¿no?</strong>
                            <p style="margin: 12px 0 0 0;">La mayoría de nosotras fuimos educadas a través del premio y el castigo. Sin embargo, muchas veces quedaban a criterio de los tutores y podían ser injustos.</p>
                        </div>

                        <h3 style="margin-top: 28px;">¿Qué es el método de consecuencias?</h3>

                        <p>El método de consecuencias pretende que el niño asuma las consecuencias naturales que derivan de su conducta o consecuencias diseñadas por los tutores.</p>

                        <p>Las consecuencias lógicas permiten que el niño aprenda a tomar decisiones responsables y que sea consciente que deberá afrontar lo bueno y lo malo que conlleve esa elección. Diferencia entre consecuencias naturales vs consecuencias lógicas Las consecuencias naturales son las que surgen de forma espontánea luego de ciertas conductas.</p>

                        <div class="reading-table" style="padding: 18px;">
                            <div class="rt-row" style="font-weight:800; color: var(--pink-main);">
                            <span>Ejemplos de consecuencias naturales:</span><span></span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800;">Conducta-</span>
                            <span style="flex:1; text-align:right;">Si el niño no quiere comer...</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800;">Consecuencia-</span>
                            <span style="flex:1; text-align:right;">Tendrá hambre y deberá esperar a la siguiente comida</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800;">Conducta-</span>
                            <span style="flex:1; text-align:right;">El niño no pone la ropa sucia en la lavadora...</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800;">Consecuencia-</span>
                            <span style="flex:1; text-align:right;">No tendrá que ponerse en una semana.</span>
                            </div>

                            <div class="rt-row" style="border-bottom:none;">
                            <span style="font-weight:800; color: var(--pink-main);"> </span>
                            <span></span>
                            </div>
                        </div>

                        <p>Muchas veces por no dejar que los niños "sufran", los rescatamos de las consecuencias naturales, pero los regañamos y gritamos. Mide la gravedad de la consecuencia y ve hasta dónde sí puedes dejar que la experimenten.</p>

                        <p>Ejemplos de consecuencias lógicas, (Se proponen no como castigo sino como consecuencia a una acción, es decir la consecuencia debe estar vinculada al mal comportamiento para lograr una asociación y reflexión).</p>

                        <div class="reading-table" style="padding: 18px;">
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800;">Conducta-</span>
                            <span style="flex:1; text-align:right;">Si no levantastus juguetes...</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800;">Consecuencia-</span>
                            <span style="flex:1; text-align:right;">Cuando barra mamá tendrá que ponerlos a resguardo durante un tiempo.</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800;">Conducta-</span>
                            <span style="flex:1; text-align:right;">Si lastimaste a tu hermano.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:800;">Consecuencia-</span>
                            <span style="flex:1; text-align:right;">Tendrás que disculparte y reflexionar un momento a solas para pensar en tus acciones.</span>
                            </div>
                        </div>

                        <div class="reading-note" style="margin-top: 26px;">
                            <strong>Sistema de Consecuencias Según la Disciplina Positiva Conducta</strong>
                            <p style="margin: 12px 0 0 0;">Si rayaste el cuaderno a un compañero....</p>
                            <p style="margin: 12px 0 0 0;"><strong>Consecuencia-</strong> Asumirás la responsabilidad de borrarlo y, en caso de ser necesario reescribirle, esa parte del cuaderno para reparar el daño realizado.</p>
                        </div>

                        <div class="reading-table" style="padding: 18px;">
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:800; color: var(--pink-main);">Ventajas del sistema de recompensas-</span>
                            <span style="flex:1; text-align:right;">El responsable de su propia conducta es el niño, no los padres. Hace que los niños se hagan responsables de sus decisiones.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span></span>
                            <span style="flex:1; text-align:right;">Permite que el niño comprenda sus acciones. El castigo es poder y autoridad, las consecuencias reconocen los derechos y respetos mutuos.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span></span>
                            <span style="flex:1; text-align:right;">El castigo es arbitrario, las consecuencias se relacionan con el comportamiento inadecuado. El castigo supone amenaza y humillación. Las consecuencias denotan buena voluntad de los padres.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span></span>
                            <span style="flex:1; text-align:right;">El castigo exige obediencia, las consecuencias son alternativas y decisiones personales.</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:800; color: var(--pink-main);">¿Como aplicar las consecuencias para corregir malas conductas?</span>
                            <span style="flex:1; text-align:right;">Identifica la mala conducta y sé precisa en lo que quieres. Nada de decirle “juega bonito” o “juega bien”. Dile, “no avientes tus juguetes porque te vas a lastimar”.</span>
                            </div>
                        </div>

                        <div class="reading-note">
                            <strong>Haz una advertencia.</strong>
                            <p style="margin: 12px 0 0 0;">Muy importante, no lances la advertencia si no piensas aplicar la consecuencia. Por ejemplo, “si avientastusjugueteste los voy a quitar”.</p>
                        </div>

                        <div class="reading-note">
                            <strong>Aplica la consecuencia.</strong>
                            <p style="margin: 12px 0 0 0;">Si el niño atiende la advertencia, aplica una consecuencia positiva y hazle saber que te agradó su elección. Si no hace caso, aplica la consecuencia negativa. Puede ser restringirle privilegios. Sea cual fuere la consecuencia, es necesario cumplirla ya, que en ese momento es donde se cumple la firmeza.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                            <strong>Explica por qué se aplicó la consecuencia.</strong>
                            <p style="margin: 12px 0 0 0;">Es fundamental que tenga lugar inmediatamente después de la mala conducta porque si se hace después carece desentido.</p>
                        </div>

                        <h3 style="margin-top: 28px;">Referencias:</h3>

                        <div class="reading-table" style="padding: 18px;">
                            <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Compartamos Banco,(2022). Los cinco principios de la disciplina positiva. Disponible en:</span>
                            <span style="text-align:right; word-break:break-word;">https://www.compartamos.com.mx/compartamospiensaenti/familia/ 5-principios-de-la disciplina-positiva</span>
                            </div>
                            <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Imagen Digital (2022). Cómo utilizar el sistema de consecuencias en los niños. Melodijolola. Disponible en:</span>
                            <span style="text-align:right; word-break:break-word;">https://www.melodijolola.com/super￾mama/como-utilizar-el-sistema-de consecuencias-en-los-ninos</span>
                            </div>
                            <div class="rt-row" style="gap:10px; align-items:flex-start; border-bottom:none;">
                            <span>Quicios, B.(2022). Técnicas dedisciplina positivapara niños. Guíainfantil. Disponible en:</span>
                            <span style="text-align:right; word-break:break-word;">https://www.guiainfantil.com/articulos/educacion/limites/tecnicas-de￾disciplina-positiva para-ninos/</span>
                            </div>
                        </div>
                        </div>
                    `
                },

                {
                    id: 29,
                    titulo: "💛 El divorcio y los peques: cómo acompañarlos sin romper su calma por dentro",
                    resumen: "Cuando una separación sucede, el mundo de un peque puede moverse en silencio. Este artículo te ayuda a entender lo que sienten, lo que pueden mostrar con su conducta y cómo acompañarlos con palabras claras, rutinas y herramientas emocionales.",
                    imagen: "assets/img/articulos/29.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <p><b>El divorcio y los peques</b></p>

                        <p>Un divorcio es la disolución legal o religiosa de un matrimonio por acuerdo de ambas partes por la vía legal. Un matrimonio es la unión de dos personas con un reconocimiento jurídico, social y cultural, cuyo objetivo es brindar protección a ambas partes, en ocasiones, muchas de las parejas que se divorcian tienen hijos, y a menudo se llegan a preocupar acerca del efecto que tendrá en los peques.</p>

                        <p>Los padres pueden experimentar tristeza o felicidad por su divorcio, sin embargo, los peques pueden sentirse heridos, amenazados con miedo o confusión, ya que, en ocasiones la situación se puede malinterpretar y más si los papás no les dicen qué ocurre.</p>

                        <h3>Los más peques por lo general pueden presentar diversas conductas como:</h3>
                        <ul>
                        <li>Reaccionar con agresividad</li>
                        <li>Falta de cooperación</li>
                        <li>Carácter regresivo (pueden retomar hábitos como chuparse el dedo, conductas repetitivas como tics, o tartamudeo, e incluso retrayéndose a sí mismos).</li>
                        </ul>

                        <h3>Por el contrario, los peques mayores pueden experimentar:</h3>
                        <ul>
                        <li>Tristeza o sentimientos de pérdida</li>
                        <li>Problemas de comportamiento afectando su entorno escolar (con problemas de concentración y atención bajando su rendimiento escolar), familiar social y personal, ya que incluso se puede afectar su autoestima.</li>
                        </ul>

                        <h3>Sin embargo, hay rasgos que coinciden en ambos peques como:</h3>
                        <ul>
                        <li>Sentimientos de culpa, pueden pensar que ellos son los culpables de la separación</li>
                        <li>Sentimientos de abandono, pueden temer que la persona que está a su cargo los abandone</li>
                        <li>Sentimientos de impotencia, esto porque su rutina cambia totalmente</li>
                        <li>Sentimientos de rechazo que por lo general los experimentan al compartir poco tiempo con alguno de sus padres.</li>
                        </ul>

                        <div class="reading-note">
                        <strong>Consejos para que los más peques entiendan un poco la situación:</strong>
                        <ul>
                            <li>No mantener la decisión en secreto o no esperar hasta el último momento para informarles</li>
                            <li>Los dos padres deberán hablar con el peque de la situación</li>
                            <li>Hablar de la situación de forma simple y directa, no con rodeos</li>
                            <li>Explicarle al peque que no es su culpa, que es una decisión de los padres</li>
                            <li>Hablar con los peques que ambos padres lo seguirán queriendo, que la separación no impedirá que sean sus padres.</li>
                        </ul>
                        </div>

                        <p>Todos los padres tienen el bienestar de sus hijos como prioridad, así que como nannies, al ser tan cercanas a ellos, tenemos la posibilidad de ayudar a los peques en un momento tan difícil de su vida, pasamos la mayoría de tiempo con ellos, los conocemos, sienten confianza al estar con nosotras y como se ha visto, pueden a llegar a sentir miedo y no comprender lo qué pasa, por lo que ante una situación así podemos ayudarlos de distintas maneras:</p>

                        <h3>1. Escucha a través del comportamiento:</h3>
                        <p>como se sabe, nuestros peques pasan tanto tiempo con nosotras que nos volvemos expertas en leer su lenguaje corporal, ellos tienden a comunicar y manifestar sus sentimientos a través de la conducta, por lo tanto, cuando notemos que el peque comience a actuar de manera distinta a la habitual es porque quizás quiera comunicar algo. Como nannies, debemos estar aún más al pendiente para que él/ella sepa que estás ahí para escucharlo/a y apoyarlo/a.</p>

                        <h3>2. Normaliza las experiencias:</h3>
                        <p>podemos implementar cuentos o historias qué hablen acerca de la temática, haciendo reflexión de la historia. Esta estrategia es ideal para ir transmitiendo el conocimiento de familias diferentes y que los niños se sientan identificados, aceptados y comprometidos.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>Cuentos sugeridos</span><span></span></div>
                        <div class="rt-row"><span>El divorcio de mamá y papá oso</span><span></span></div>
                        <div class="rt-row"><span>Los fines de semana veo a papá, Martina Baumbach</span><span></span></div>
                        <div class="rt-row"><span>¡Vaya lío de familia!, Pascale Francotte</span><span></span></div>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span>Cuentos para enseñar a tus hijos a entender el divorcio</span><span></span></div>
                        <div class="rt-row"><span>Simón días sin cole, Juliet Pomés</span><span></span></div>
                        <div class="rt-row"><span>La novia de papá también me quiere, Nuria Gonzáles</span><span></span></div>
                        <div class="rt-row"><span>Cuando mis padres se olvidaron de ser amigos, Jennifer Moone</span><span></span></div>
                        <div class="rt-row"><span>Carlota es feliz, Guillermo Caballero</span><span></span></div>
                        <div class="rt-row"><span>Cuando papá y mamá se separan, Emily Menéndez</span><span></span></div>
                        </div>

                        <h3>3. Validar las emociones de los peques:</h3>
                        <p>como nannies es importante hablar con ellos sobre la normalidad de que sientan toda clase de emociones “negativas”, si notas que tu peque comienza a tener cambios de humor, puedes preguntarle “pareces algo enojado, ¿todo bien?”, “parece que te preocupa algo, ¿quieres hablar?”, también puedes mostrarle tu apoyo con palabras de aliento como “cuando necesites ayuda dímelo, yo estaré orgullosa de ti y te ayudaré”.</p>

                        <h3>4. Manejo de emociones con técnicas:</h3>
                        <p>como parte de nuestras actividades podemos implementar ejercicios de respiración y relajación, practicándolas, acabando actividades físicas, terminando tareas o para finalizar algún juego. Algunos ejemplos son:</p>

                        <ul>
                        <li>La técnica de la tortuga, que es la analogía al caparazón, se le pedirá al peque que cierre los ojos, pegue sus brazos al cuerpo, baje su cabeza metiéndola entre los hombros y se encoja con las piernas, esta técnica es similar a cuando la tortuga se refugia en su caparazón como respuesta a los momentos en que un estímulo externo haga que el peque se sienta amenazado o que experimente alguna otra emoción que aún no sabe controlar. De este modo ayudamos a que las emociones se intensifiquen.</li>
                        <li>Técnica del semáforo, ayudaremos a que los peques sean conscientes de la emoción que están experimentando y su por qué, por eso, debemos ayudar a los peques a identificar señales que aparecen. Después se sugiere hacer un semáforo de cartón y ponerlo en un rincón de casa, explicarles que hay emociones negativas y se pueden controlar. Podemos aplicar esta estrategia como un juego, para asegurarnos que el peque lo entiende y podamos recurrir a él fácilmente, cuando veamos que el peque está ante una situación de enojo que pueda terminar en un ataque de ira, podemos prevenir y recurrir al semáforo para ayudar a gestionar la situación.</li>
                        <li>Otras opciones de técnicas son el uso de mándalas, ejercicios de respiración, y la relajación progresiva para los peques.</li>
                        </ul>

                        <p>Sí bien los peques pueden sufrir durante mucho tiempo, el impacto real suele durar de 2 a 3 años, en este periodo algunos pueden expresar sus sentimientos, Sin embargo, como nannies podemos hablar con los peques, generando una conversación continua para que los peques puedan ir comprendiendo y madurando en el proceso.</p>

                        <p>Recuerda, aunque parezca que ya se habló del tema, a los peques les pueden surgir nuevas dudas y preguntas, por eso siempre hay que mantener un diálogo abierto.</p>

                        <div class="reading-note">
                        <strong>También, como nannies podemos:</strong>
                        <ul>
                            <li>Ayudar a que se establezca una rutina que incluya buenos hábitos de alimentación y de sueño</li>
                            <li>Revisar tareas, deberes y proyectos del peque</li>
                            <li>Hablar todos los días que veamos al peque sobre sus actividades diarias</li>
                            <li>Aprovechar los recursos que hay en casa para poder leer libros, hacer actividades recreativas, salir al parque, hacer obras de teatro, etc.</li>
                            <li>Contar con un adecuado equipo de padres de familia, nanny, escuela y comunidad, así el peque no se sentirá desprotegido.</li>
                        </ul>
                        </div>

                        <h3>Referencias:</h3>
                        <p>Pérez, J, (21 de noviembre, 2013). “Definición de divorcio”. Definición.DE. Disponible en: Divorcio - Qué es, definición y concepto (definicion.de)</p>
                        <p>Arias, J. (31 de enero, 2017). “Y tú maestro, ¿cómo vives el divorcio en el aula?”. Academia. Disponible en: Y tú, maestro, ¿cómo vives el divorcio en el aula? - Revista Voces</p>
                        <p>Aacap. (s/f). “Los niños y el divorcio”. American Academy of Child &amp; Adolescent Psychiatry”. Disponible en: Los Niños y el Divorcio (aacap.org)</p>
                        <p>Lozano, C. (12 de junio, 2021). “La técnica del semáforo”. Carolina Lozano Psicología. Disponible en: La Técnica del semáforo en psicología | Carolina Lozano (carolinalozanopsicologia.es)</p>
                        <p>Puntoreactivo. (11 de noviembre, 2021). “¿Cómo apoyar a mis alumnos frente al divorcio de sus padres?”. Paideia. ¿Cómo apoyar a mis alumnos frente al divorcio de sus padres? – Centro Paideia</p>
                    `
                },

                {
                    id: 30,
                    titulo: "🌈 Cuando tu peque dice “no”: lo que en realidad te está queriendo comunicar",
                    resumen: "Si últimamente sientes que tu peque te reta, te contesta o ignora límites, no estás sola. Este artículo te ayuda a leer lo que hay detrás de la “desobediencia” y te da estrategias claras para acompañarlo con respeto, empatía y amor… sin perder la calma en el intento.",
                    imagen: "assets/img/articulos/30.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <p><strong>Desobediencia en peques: interpretando las conductas desafiantes.</strong></p>

                        <p>¿Has notado cambios en el comportamiento del peque? Pueden parecer “rebeldes”, en la forma de contestar, desafiar límites, ignorar órdenes o incluso llegan a reírse cuando se les pide algo; esto puede hacerte sentir frustrada, insegura o sin herramientas claras para responder. Sin embargo, lo que hay detrás de estas conductas tiene que ver más, con el desarrollo emocional y social que con mala intención o falta de respeto.</p>

                        <p>Cuando un peque contesta o desafía, no siempre está actuando por “capricho”, el comportamiento desafiante puede ser una forma de comunicación, una expresión de emociones intensas, o una estrategia para explorar límites y autonomía. Todo comportamiento tiene un significado y detrás hay necesidades o procesos en desarrollo.</p>

                        <p>Es importante mencionar que, no está limitado solo a una edad específica, sino que puede ocurrir en varias etapas del desarrollo, dependiendo de la personalidad del peque, su entorno, su temperamento y su nivel de desarrollo socioemocional, aunque este comportamiento es más frecuente en peques de edad preescolar (3-5 años) y edad escolar temprana (6-8 años).</p>

                        <div class="reading-note">
                        <strong>Algunos indicadores de este comportamiento pueden ser:</strong>
                        </div>

                        <h3>Autonomía en crecimiento</h3>
                        <p>Cuando los peques empiezan a querer tomar decisiones propias sobre su cuerpo, su tiempo y sus actividades y un adulto le da una orden directa, muchas veces sienten que pierden control, y responder con un “no” es su forma de afirmar independencia.</p>

                        <h3>Dificultades para expresar emociones</h3>
                        <p>Muchos peques no tienen aún las palabras o las habilidades para expresar cómo se sienten, esto puede resultar en comportamientos desafiantes cuando están frustrados, cansados o con necesidades no satisfechas.</p>

                        <h3>Búsqueda de atención y prueba de límites</h3>
                        <p>Algunos peques aprenden que cierto tipo de respuestas (incluso negativas) captan la atención de los adultos, también puede tomarlos como una “prueba” para ver qué tan firme y coherente es quien los acompaña.</p>

                        <div class="reading-note">
                        <p>¿Te ha pasado que el peque te mira a los ojos, se ríe o dice “no quiero” de forma desafiante justo cuando estás cansada o apurada? Es algo muy común y no significa que no te respete o que “te está haciendo mala jugada” sino que está aprendiendo a expresar su mundo interior.</p>
                        </div>

                        <p>A continuación, te compartimos herramientas y estrategias para manejar estos momentos y acompañarlos con respeto, empatía y amor:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>1.</span><span><strong>Establecer límites claros y coherentes</strong></span></div>
                        </div>
                        <p>Los peques necesitan saber exactamente qué se espera de ellos, usar frases simples y consistentes, como: “Cuando terminemos de recoger, iremos al parque.” Les ayudará a seguir más rápido la indicación, si el límite cambia de un día a otro, el peque se confunde y es más probable que lo pruebe repetidamente.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>2.</span><span><strong>Ofrecer elecciones dentro de límites</strong></span></div>
                        </div>
                        <p>En lugar de dar órdenes directas, da opciones que sean todas aceptables para ti. Por ejemplo: “¿Quieres ponerte los zapatos azules o los rojos?” Esto les da sensación de control, reduce la resistencia y enseña toma de decisiones responsables.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>3.</span><span><strong>Validar emociones antes de corregir</strong></span></div>
                        </div>
                        <p>Antes de insistir en la regla, reconoce lo que siente: “Veo que estás molesto porque tienes que dejar el juego” Esto reduce la energía defensiva y ayuda al peque a sentirse escuchado.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>4.</span><span><strong>Refuerzo positivo y atención a lo que sí hace bien</strong></span></div>
                        </div>
                        <p>Elogiar cuando siguen instrucciones o cooperan, es importante enseñar que la atención y el cariño llegan también con comportamientos positivos, no solo cuando se desafía. “Me encantó cómo guardaste tus juguetes sin que te lo pidieran dos veces.”</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>5.</span><span><strong>Evitar entrar en luchas de poder</strong></span></div>
                        </div>
                        <p>Cuando hay una confrontación directa “¡hazlo ahora!” suele surgir una lucha por quién “gana”, en esos casos, es importante dar las instrucciones de manera breve y calmada, sin alzar la voz.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>6.</span><span><strong>Consecuencias lógicas y naturales</strong></span></div>
                        </div>
                        <p>Más que castigos arbitrarios, usa consecuencias relacionadas con el comportamiento: si no guardas tus juguetes, no hay tiempo extra para jugar después.</p>

                        <h3>Actividades prácticas que ayudan al autocontrol</h3>
                        <ul>
                        <li>Juegos cooperativos sin ganador, ayudan a practicar turnos y respeto.</li>
                        <li>Role-playing de emociones. dramatizar situaciones ayuda a identificar sentimientos.</li>
                        <li>Tiempo de juego dirigido por el peque, permite liderazgo dentro de límites seguros.</li>
                        </ul>

                        <p>Estas prácticas fortalecen habilidades sociales y ayudan a los peques a sentirse escuchados en su mundo interior.</p>

                        <h3>¿Cuándo podría ser necesario consultar a un especialista?</h3>
                        <p>No todos los desafíos implican un problema clínico, pero es útil considerar apoyo profesional si:</p>

                        <ul>
                        <li>El desafío es muy frecuente, frustrante o persistente pese a estrategias claras.</li>
                        <li>Aparece agresividad repetida, daño a otros o a sí mismo.</li>
                        <li>Hay retrocesos importantes en habilidades ya aprendidas o se observa impacto en relaciones sociales o rendimiento escolar.</li>
                        </ul>

                        <div class="reading-note">
                        <p>Es importante saber que si un peque “contesta” o te desafía no es un problema, recuerda que es un ser en proceso de aprender a expresarse, negociar y comprender el mundo social que lo rodea, con límites consistentes, comunicación afectiva y herramientas claras, puedes acompañar este proceso con seguridad y cariño.</p>
                        <p>Recuerda que cada desafío es una oportunidad de aprendizaje, tanto para ti, como para el peque.</p>
                        </div>

                        <h3>Referencias</h3>
                        <p>CDC. (2025). Problemas del comportamiento o la conducta en los niños. Centros para el Control y la Prevención de Enfermedades. https://www.cdc.gov/children-mental-health/es/about/problemas-del￾comportamiento-o-la-conducta-en-los-ninos.html?utm_source</p>

                        <p>Prácticas de crianza asociadas al comportamiento negativista desafiante y de agresión infantil. (s. f.). Revista APL. https://revistas.urosario.edu.co/xml/799/79933768005/index.html</p>

                        <p>Revista de Pediatría de Atención Primaria. (2021). Papel del pediatra en el manejo de las conductas disruptivas de la infancia. https://pap.es/articulo/13446/?utm_source</p>
                    `
                },

                {
                    id: 31,
                    titulo: "🌙✨ Control de esfínteres: el camino suave hacia la autonomía (sin prisas y con mucho amor)",
                    resumen: "Dejar el pañal no es una carrera: es un proceso con avances y retrocesos que se logra con paciencia, cariño y refuerzo positivo. Esta guía le ayudará a identificar las señales, acompañar con calma y construir confianza paso a paso, de día… y también de noche.",
                    imagen: "assets/img/articulos/31.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                        <p><strong>Control de esfínteres</strong></p>

                        <p>Es importante tener presente que, si bien la mayoría de los niños comienza a dejar los pañales entre los 2 y 3 años, no todos tienen los mismos tiempos para lograrlo. Asimismo, como todo proceso, suele tener avances y retrocesos. Se debe tener paciencia y tranquilidad, ya que no ocurre de un día para otro; para lograrlo se requiere cariño y reforzamiento positivo.</p>

                        <p>Es importante saber que la mayoría de los niños controla primero la orina y después logra el control de deposiciones. Además, este control suele ocurrir primero de día y luego en la noche.</p>

                        <h3>¿Cuándo retirar el pañal?</h3>

                        <p>Tu peque debe mostrar diversos signos para que este proceso empiece, estos signos son:</p>

                        <div class="reading-note">
                        <ul>
                            <li>Sigue instrucciones simples.</li>
                            <li>Logra saltar en dos pies.</li>
                            <li>Le incomoda el pañal sucio o mojado y pide cambio.</li>
                            <li>Pasa más de 2 horas con el pañal seco.</li>
                            <li>No moja pañal muy frecuentemente en el día y, si lo hace, el pañal se llena mucho.</li>
                            <li>Tiene horario de defecación más regular, predecible y constante.</li>
                            <li>Es capaz de verbalizar su necesidad de orinar o defecar.</li>
                            <li>Puede bajarse pantalones y sentarse en WC.</li>
                            <li>Logra permanecer sentado en el WC, tranquilo y sin llorar, al menos un par de minutos.</li>
                        </ul>
                        </div>

                        <h3>Anticiparnos al proceso:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Intenta reconocer alguna señal que realice cuando quiere ir al baño (tocarse el pañal, quedarse quieto de forma brusca, cruzar sus piernas) y aprovéchalas para explicarle el proceso.</li>
                            <li>Intenta identificar sus horarios habituales y cuánto tiempo pasa entre micción y micción (puedes realizar una pauta de micción/defecación durante un par de días).</li>
                            <li>Adquirir ropa interior de algodón en cantidad suficiente, ojalá con algún detalle que lo motive</li>
                            <li>Disponer de zapatos de goma lavables (tipo hawaianas), ropa holgada y fácil de cambiar y lavar en caso de mojarse (vestidos o trajes de baño). Esto, más que una necesidad, es una comodidad, ya que será bastante más fácil cambiar a un niño que se hace pipí en traje de baño y sandalias, versus aquel que se moja en jeans y tenis.</li>
                            <li>Contar con un adaptador de WC y unas escaleras pequeñas que ayuden al pequeño a sentarse y donde pueda apoyar sus pies mientras hace sus necesidades, sintiéndose más seguro.</li>
                            <li>Algunos pequeños se esconden cuando tienen ganas, por lo que es importante darles el espacio y privacidad adecuada para que el niño no se incomode.</li>
                        </ul>
                        </div>

                        <h3>Acompáñalo en el proceso:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Antes de sacarle los pañales, explica a tu peque el proceso que iniciará, reforzándole que como ya es grande podrá dejar los pañales y sentarse en el baño.</li>
                            <li>Llévalo periódicamente al baño, al inicio puedes llevarlo cada 15 minutos aproximadamente, una vez que ya hayas visto un mayor control el tiempo puede ir aumentando hasta llegar a un máximo de 2 horas. En este punto, puedes hacer uso de una alarma para que le pequeño pueda ir asociando el sonido con la ida al baño. Además, es importante que en este punto lo motives a permanecer sentado algunos minutos, aunque diga que no quiere orinar.</li>
                            <li>Intenta asociar las idas al baño con alguna actividad de su rutina diaria, por ejemplo: al despertar, después de alimentarse, antes de salir de casa, al volver del colegio y antes de acostarse. De esta forma, siendo consistente y sistemático, todo será más fácil.</li>
                            <li>Cada vez que orine en el WC y, en la medida que se haga más frecuente y tenga menos accidentes (que se moje), dale refuerzos positivos.</li>
                            <li>Al comienzo, puede ser un refuerzo social (halagos, abrazos, besos, aplausos) acompañado de algún premio material (stickers, lápices, pequeños juguetes) para aumentar su motivación por lograr su control de esfínteres. Ayuda mucho acompañar estos refuerzos con un calendario de logros ubicado en un lugar estratégico, fácilmente visible, donde se registre (junto con el niño/a) sus logros. Así, cada vez que vea su calendario, recordará su objetivo y se motivará a perseverar.</li>
                            <li>En la medida que se avanza en el proceso se puede ir distanciando el refuerzo material hasta desaparecer, manteniendo siempre la recompensa social hasta ya tener consolidado su control de esfínteres.</li>
                        </ul>
                        </div>

                        <h3>Recomendaciones al decidir el entrenamiento:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Retira el pañal de día mientras el niño está despierto (al inicio mantener pañal de noche y durante su siesta).</li>
                            <li>Intenta hacer vida al aire libre, ropa fácil de desabrochar para favorecer su autonomía, y que sea fácil de cambiar en caso de “accidentes”.</li>
                            <li>Evita salir con el niño ratos prolongados fuera de casa, a lugares donde sea difícil conseguir un baño.</li>
                            <li>El control nocturno de esfínteres suele ocurrir un mes después de logrado el control diurno.</li>
                            <li>Considera que es un proceso progresivo (al comienzo se hará pipí más de alguna vez, por lo que se debe evitar castigos y retos).</li>
                            <li>Ofrece al niño una bacinica o un adaptador de WC y un pisito para que apoye sus pies y se sienta cómodo y seguro sentado.</li>
                            <li>Fomenta al niño a imitar a sus hermanos o padres.</li>
                            <li>Lleva al niño al baño cada vez que lo pida, aunque muchas veces no haga pipí.</li>
                            <li>Si no pide ir al baño llévalo cada 2 a 3 horas y siéntalo, aunque diga no tener ganas.</li>
                            <li>Fomenta la ingesta de agua durante el día (mínimo 6 a 8 vasos al día), evitando consumo de bebidas o jugos con colorante.</li>
                        </ul>
                        </div>

                        <h3>Algunos tips:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Evitar retos, castigos o burlas frente a accidentes, solo generará rechazo y mayor dificultad. Debemos recordar que, si se moja, no es intencional, sino parte de un proceso que requiere tiempo.</li>
                            <li>Evitar juntar este proceso con otros cambios: escolarización, cambio de casa, viajes, nacimiento de un hermano, etc.</li>
                            <li>Una vez que el niño está preparado, ser consistente con la decisión de retirar pañales. Evitar confundirlo motivándolo un día sí y un día no, o a ratos sin pañal y a ratos con pañal.</li>
                            <li>Evitar forzarlo si aún no está preparado: si se moja muy frecuente, es mejor volver a los pañales e intentarlo nuevamente más adelante.</li>
                            <li>Existen muchos libros infantiles que ayudan en este proceso de dejar los pañales, con ilustraciones amigables e información simple y sencilla para los niños. Se puede intentar contarle una historia en relación con esto; los niños son muy imaginativos y muchas veces entienden fácilmente a través de formas didácticas de aprendizaje.</li>
                            <li>Llevar juguetes que lo acompañen al baño, cantar o usar una canción podrán ayudar a que el momento de ir al baño sea más amigable.</li>
                            <li>La constancia será la clave para el control exitoso del esfínter, el quitar el pañal a un niño es brindarle autonomía y autoconfianza, al retroceder y ponerle el pañal nuevamente es enviarle un mensaje confuso que terminará por confundirlo entre un discurso de “Ser un niño grande o todavía un bebé”</li>
                        </ul>
                        </div>

                        <h3>Sugerencias para facilitar el control de esfínteres nocturno:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Momento más adecuado: Una vez que el niño amanece con su pañal seco, después de logrado el control de esfínteres diurno.</li>
                            <li>Procura que tu hijo haga pipí en el baño justo antes de irse a dormir.</li>
                            <li>Evita bebidas o jugos con colorantes, ya que podrían irritar la vejiga, aguantando menos pipí.</li>
                            <li>Asegúrate de que tenga deposiciones todos los días, ya que la constipación aumenta el riesgo de enuresis.</li>
                            <li>Si el baño está lejos de la cama, acerca un recipiente o baño móvil para dejar a un lado de la cama.</li>
                            <li>Estimúlalo con un calendario de refuerzo positivo, marcando con estrellita o sol los días que amanece seco.</li>
                        </ul>
                        </div>

                        <h3>Referencias:</h3>

                        <p>Díaz, M. (9 de diciembre de 2020). ¿Cómo enseñar a controlar esfínter a los niños? Clínica los Condes. Disponible en: https://www.clinicalascondes.cl/BLOG/Listado/Pediatria/como ensenar￾control-esfinter-ninos</p>

                        <p>Garza-Helizondo, R. (2020). Control de esfínteres. Acta Pediátrica Mexicana, 41(1), pp. 40-42. Disponible en: https://www.medigraphic.com/pdfs/actpedmex/apm-2020/apm201e.pdf</p>

                        <p>Hospital de Manises. (18 de agosto de 2020). Control de esfínteres. Guía completa para padres. Hospital de Manises. Disponible en:https://www.hospitalmanises.es/blog/control-de esf</p>
                    `
                },

                {
                    id: 32,
                    titulo: "💗 Enseñar a compartir sin peleas: estrategias reales para formar empatía y cooperación",
                    resumen: "Compartir no se obliga: se aprende con paciencia, ejemplo y acompañamiento. Estas estrategias le ayudan a guiar a su peque (4 a 7 años) para que comparta con más seguridad, menos frustración y más conexión con los demás.",
                    imagen: "assets/img/articulos/32.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/29.jpg')"></div>

                        <div class="reading-note" style="margin-top:0;">
                        <strong>Estrategias para enseñar a compartir</strong>
                        <p style="margin:10px 0 0 0; font-weight:700; color: var(--text-muted);">Peques de 4 a 7 años</p>
                        </div>

                        <p>El proceso de aprender a compartir puede resultar complejo para los peques, esto sucede porque para ellos puede representarse como un desprendimiento de sus objetos de cariño que los dotan de autoconcepto. Según Celada “El autoconcepto es la suma de creencias de un individuo sobre sus cualidades personales lo que la persona sabe de sí misma y lo que cree que saber, es la interpretación de nuestras emociones, nuestra conducta y la comparación de esta con el otro.</p>

                        <p>Por ello, es importante mencionar que este aprendizaje es algo que requiere tiempo y constancia entre el peque y sus cuidadores principales, con el fin de que el peque vaya desarrollando en sí mismo formas sanas de relacionarse con el mundo y consigo mismo.</p>

                        <p>A continuación, se darán algunas estrategias, para seguir fortaleciendo</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">1.</span>
                            <span style="flex:1;"><strong>Enseñar, no obligar:</strong> Evita comentarios de chantaje al peque y nunca lo obligues, pues recordemos que es un proceso, que requiere de paciencia y constancia de ambas partes.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">2.</span>
                            <span style="flex:1;"><strong>Juegos de mesa por turnos:</strong> Cualquier juego de mesa que requiera esperar, fomenta en los peques el respeto a los demás y les enseña a trabajar en conjunto. Es importante mencionar que se debe cuidar el enfoque del juego, pues no debe ser de competitividad, sino de trabajo en conjunto por un mismo bien.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">3.</span>
                            <span style="flex:1;"><strong>No castigar:</strong> Evita comentarios y etiquetas que puedan lastimar al peque, siempre dialoga con él y valida lo que está sintiendo en el momento de la frustración.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">4.</span>
                            <span style="flex:1;"><strong>Prever la situación:</strong> Si sabes que saldrán y el peque va a convivir con más niños y en caso de llevar juguetes, habla con él antes de salir o durante el camino; dile que lo que lleva lo va a compartir con otros niños. Frases que puedes utilizar (adecuarlas a la situación): “Vamos a ver más niños y podrás compartirles tus juguetes para que puedan divertirse juntos.” “Traje este material, pero antes de usarlo vamos a acordar compartirlo, ¿sí?” “Vamos a jugar este juego, pero recordamos que todos tenemos que jugar, ¿está bien?”</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">5.</span>
                            <span style="flex:1;"><strong>Fomenta la empatía del peque:</strong> En medida de lo posible, dialoga con él acerca de los sentimientos de las demás personas e intenta posicionarlo en sus zapatos, con el fin de que entienda por qué reaccionan de esa manera. Algunas frases que puedes utilizar son (adecúalas a la situación):</span>
                        </div>
                        </div>

                        <div class="reading-note">
                        <p style="margin:0;">¿Qué sentirías si eso te sucediera a ti?</p>
                        <p style="margin:10px 0 0 0;">¿Cómo crees que se esté sintiendo?</p>
                        <p style="margin:10px 0 0 0;"> ¿Qué piensas que podemos hacer para hacerlo/a sentir mejor?</p>
                        <p style="margin:10px 0 0 0;"> ¿Te gustaría ayudarlo a sentirse mejor?</p>
                        </div>

                        <p>Recuerda siempre usar un tono amigable y cariñoso con el peque e intenta ponerte a su nivel físico para generar este diálogo, con el fin de que no se sienta atacado o juzgado.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">6.</span>
                            <span style="flex:1;"><strong>Da el ejemplo:</strong> Comparte con él lo que tú utilices, recuerda que los peques aprenden a través de la imitación, por ello, cuando tengas la oportunidad y veas su interés en algo que estés utilizando, pregúntale cariñosamente “¿Quieres que te lo preste? Toma, te lo presto”. Evita acompañar esta frase con comentarios negativos (nada más no lo vayas a romper/perder), tienes que estar consciente de que puede ocurrir accidentes como caerse, romperse o mancharse.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">7.</span>
                            <span style="flex:1;"><strong>Fomenta la participación social:</strong> Para este punto es importante que el peque tenga un trabajo previo del aprendizaje a compartir, para que no interfiera con las actividades. En medida de lo posible, enséñale a donar sus juguetes, ropa y demás objetos que ya no utilice. Intenta un diálogo en el que él llegue a la conclusión solito.</span>
                        </div>
                        </div>

                        <p>Así mismo, enséñale a realizar tareas simples, por ejemplo, limpiar la mesa después de comer, recoger la basura, ayudar a alguien con alguna tarea, etc. En el momento de hacer esto, te recomendamos que lo hagas de la manera más natural posible, sin necesidad de regañarlo ni de hacerlo más grande de lo que es, con frases como: Vamos a recoger la mesa juntos, ¿vale?, mira, ahí hay una basura, ¿la puedes poner en su lugar, por favor? ¿Me pasas el juguete que está ahí, por favor?</p>

                        <p>Este punto es importante que también le enseñes con el ejemplo, ya que, si él ve que tú eres capaz de ayudar, se sentirá con la confianza de hacer lo mismo.</p>

                        <h3 style="margin-top:28px;">Bibliografía</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Alonso, M. S. L. (2017). Análisis del orden en el que el autoconcepto, la autoestima y la autoimagen deberían aparecer en el proceso de maduración personal para alcanzar el bienestar emocional. Revista INFAD de Psicología. International Journal of Developmental and Educational Psychology., 1(2), 257-264.</span>
                        </div>
                        <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Celada, F. J. (2013). ¿El suicidio es consecuencia de un bajo autoconcepto y de una autoestima dis-minuida?Researchgate. DOI: 10.13140/RG.2.1.4736.3608</span>
                        </div>
                        <div class="rt-row" style="gap:10px; align-items:flex-start; border-bottom:none;">
                            <span>Hill, N. L. (2013). Theory of Self-Esteem. Consultado en http://practicewisdom.blogspot.com.es/2013/06/self-concept-self-image-ideal￾self-and.html</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 33,
                    titulo: "🌟 Estimulación temprana (0 a 6 meses): pequeñas acciones que construyen un gran futuro",
                    resumen: "En los primeros meses, cada mirada, caricia y juego deja huella. Esta guía reúne actividades sencillas y amorosas para potenciar el desarrollo físico, mental y emocional de tu peque, respetando su ritmo y convirtiendo cada momento en una oportunidad de conexión.",
                    imagen: "assets/img/articulos/33.jpg",
                    categoria: "Motriz",
                    contenido: `
                        <h1>Estimulación temprana en peques de 0 a 6 meses</h1>

                        <p>La estimulación o atención temprana es un conjunto de actividades que, <br>
                        aplicadas de forma sistemática, fomentan y aprovechan al máximo las <br>
                        capacidades físicas y mentales de los peques.</p>

                        <p>También, es una forma de activar en los recién nacidos una serie de funciones <br>
                        cerebrales que les permitan mejorar su desarrollo y contribuye a potenciar sus <br>
                        habilidades psicomotoras mediante actividades adaptadas a su edad.</p>

                        <h3>Beneficios de la estimulación temprana:</h3>
                        <p>Los ejercicios de estimulación temprana suponen un acelerador en los procesos <br>
                        de aprendizaje de los peques gracias a sus grandes beneficios.</p>

                        <ul>
                        <li>Aumenta la capacidad de concentración y de memoria. También se mejora<br>
                        la creatividad de los más pequeños.</li>
                        <li>Los ejercicios benefician sus habilidades psicomotoras.</li>
                        <li>Favorece la curiosidad del peque mediante la observación. Esto le permite ser <br>
                        capaz de interpretar contextos y reacciones de las personas.</li>
                        <li>Facilita la adquisición del lenguaje, gracias a ejercicios de articulación, <br>
                        comprensión y expresión oral de los peques. También ayuda a retener más <br>
                        palabras nuevas y enriquecen su vocabulario.</li>
                        <li>Refuerza sus habilidades sociales y relacionales. Se trabaja la empatía o <br>
                        la convivencia para mejorar su adaptación al entorno. También se potencia <br>
                        su autoestima y la toma autónoma de decisiones.</li>
                        </ul>

                        <h3>¿Cómo estimular a tu peque?</h3>
                        <p>El crecimiento del cerebro de tu peque depende de los estímulos que reciba. Si <br>
                        esos estímulos son los adecuados respecto a la cantidad y calidad, fomentarán un <br>
                        ritmo adecuado en la adquisición de las diferentes funciones cerebrales.</p>

                        <p>La repetición de los ejercicios refuerza las áreas neuronales de tu peque, lo que le <br>
                        permite ir adquiriendo nuevos conocimientos.</p>

                        <p>Además, los ejercicios le ayudarán a desarrollar su psicomotricidad, sus <br>
                        habilidades cognitivas y del lenguaje, su independencia y autonomía, así como <br>
                        aspectos emocionales y sociales.</p>

                        <h3>¿Cuándo se realiza?</h3>
                        <p>Desde el nacimiento de tu peque hasta los seis años de vida, porque en este <br>
                        periodo es cuando más conexiones neuronales se establecen en su cerebro y <br>
                        cuando tu peque desarrolla la estructura de su pensamiento. Por eso se <br>
                        recomienda realizar las actividades a partir de los 45 días de vida.</p>

                        <h3>¿Cómo se realiza?</h3>
                        <ul>
                        <li>Las actividades se realizan como un juego, un rato divertido junto con tu <br>
                        peque.</li>
                        <li>Debes respetar las horas de sueño o hambre.</li>
                        <li>No debes forzar a tu peque a que realice los ejercicios ya que debe ser algo<br>
                        divertido para él.</li>
                        <li>No es aconsejable sobreestimularle. Comienza por sesiones de 5 minutos y poco<br>
                        a poco ve ampliándolas hasta 10 minutos.</li>
                        <li>Felicítale después de cada ejercicio independientemente de si lo ha logrado o <br>
                        no.</li>
                        <li>Intenta realizar las actividades un mínimo de tres veces por semana, aunque lo <br>
                        ideal sería realizarlas a diario.</li>
                        </ul>

                        <div class="reading-note">
                        <strong>RECUERDA:</strong> Es importante hacer todas las actividades con cariño y cuidado, <br>
                        respetando las horas de sueño y alimentación del peque.
                        </div>

                        <h3>¿Qué ejercicios puedo realizar los primeros tres meses?</h3>
                        <ul>
                        <li>Acuéstale boca abajo, extiende sus brazos y motívalo para que levante la <br>
                        cabeza y el tronco acariciándole la espalda.</li>
                        <li>Boca arriba, háblale y ponle juguetes de colores o con sonido en los lados <br>
                        para estimularlo a girar la cabeza hacia los lados. También puedes acariciarle <br>
                        suavemente la mejilla.</li>
                        <li>Boca arriba, levántale suavemente hasta sentarle, sujetándolo firmemente de <br>
                        sus muñecas.</li>
                        <li>Acostado boca arriba, extiende y encoge sus piernas suavemente</li>
                        <li>Masajea suavemente todo su cuerpo desde la cabeza a los pies con un aceite <br>
                        adecuado.</li>
                        <li>Cuelga en su cuna juguetes de colores o con sonido para que cuando este <br>
                        despierto capten su atención y fije la mirada en ellos.</li>
                        <li>Abrázale, sonríele, háblale mucho y con cariño.</li>
                        <li>No se trata de una obligación, sino de integrar estas actividades a su juego diario.</li>
                        </ul>

                        <p>Recuerda que cada peque es diferente, único y tiene su propio ritmo de <br>
                        desarrollo. Pero todos nacen con un gran potencial que puedes aprovechar <br>
                        para estimularle a la vez que disfrutan de un buen rato juntos.</p>

                        <h3>En relación a la estimulación de los sentidos del peque, las acciones más <br>
                        destacadas son las siguientes:</h3>

                        <ul>
                        <li><b>Estimulación del olfato:</b> antes de darle su biberón, ponle un poco de leche debajo <br>
                        de la nariz con tu dedo. También puedes pasarle una esponjita impregnada <br>
                        con aromas agradables por todo su cuerpo.</li>
                        <li><b>Estimulación de la audición:</b> mira a tu peque y háblale mientras come para <br>
                        llamar su atención. También puedes sacudirle un sonajero delante de él y <br>
                        dejarle que lo tome.</li>
                        <li><b>Estimulación de la vista:</b> colocar objetos colgantes y móviles sobre su cuna para <br>
                        que los siga con la mirada. También puedes mover objetos brillantes y llamativos <br>
                        de un lado a otro y para arriba y abajo delante de él.</li>
                        <li><b>Estimulación táctil:</b> acaricia al peque con objetos de diferentes texturas, frótale <br>
                        los pies y hazle cosquillas. También puedes pasar por su piel una toalla mojada <br>
                        fría y una caliente para que perciba los cambios de temperatura (recuerda que <br>
                        ambas temperaturas deben ser tolerables y no muy intensas).</li>
                        </ul>

                        <h3>Fortalecer la motricidad:</h3>
                        <p>Estos ejercicios son muy importantes con el objetivo de <br>
                        facilitar el gateo del peque próximamente. Los comentamos a continuación:</p>

                        <ul>
                        <li><b>Fortalecer el cuello:</b> acuesta al peque boca abajo y acaríciale la espalda desde <br>
                        la nuca hasta la zona lumbar para que enderece la cabeza y el tronco. <br>
                        También es importante empezar a tomarlo en posición vertical para que pueda <br>
                        sostener su propia cabeza.</li>

                        <li><b>Fortalecer las manos:</b> acuesta al peque boca arriba, acaríciale las manos para <br>
                        que intente abrirlas y tomar uno de tus dedos. Cuando logre agarrarse a tu <br>
                        dedo pulgar, tira suavemente para levantarle un poco y que se agarre con más <br>
                        fuerza.</li>

                        <li><b>Fortalecer los brazos:</b> acuesta al peque boca arriba, toma sus manitas y extiende <br>
                        los brazos hacia arriba, hacia abajo, hacia los lados y luego crúzalos sobre su <br>
                        pecho, todo esto con movimiento muy suaves.</li>

                        <li><b>Fortalecer las piernas:</b> puedes hacer los mismos movimientos suaves que con <br>
                        los brazos. También puedes doblar sus rodillas, llevar las piernas hacia el <br>
                        abdomen y extenderlas de nuevo. Este ejercicio, además, favorecerá el tránsito <br>
                        intestinal del peque en caso de ir estreñido.</li>

                        <li><b>Pedaleando:</b> este juego consistirá en colocar el peque boca arriba; sus pies <br>
                        estarán en las manos del papá o la mamá, que jugarán a hacerle movimientos <br>
                        circulares con las piernas.</li>
                        </ul>

                        <h3>¿Qué ejercicios puedo realizar de los 3 a los 6 meses?</h3>
                        <p>Los peques a los 3 meses, ya mueven los brazos y las piernas vigorosamente, <br>
                        murmuran, ríen en respuesta a estímulos y pueden seguir objetos con la mirada.</p>

                        <p>Los ejercicios que se muestran a continuación servirán para seguir estimulando su <br>
                        sistema nervioso y motor, ya que pronto será capaz de gatear y levantarse.</p>

                        <ul>
                        <li>Pon algún juguete encima de la cara de tu peque para que intente tomarlo por <br>
                        sí solo. También puedes poner al peque boca abajo y dejar el juguete un poco <br>
                        retirado para que intente alcanzarlo.</li>

                        <li>Juega al escondite con el peque: esconde tu cara detrás de un libro y <br>
                        sorpréndele asomándote por arriba, tu peque se reirá y estará calculando <br>
                        mentalmente cuando vas a volver a asomarte.</li>

                        <li>Si el peque ya se mantiene sentando, ponte delante de él y muévelo ligeramente<br>
                        de un lado a otro tocándole los hombros. Ante este desequilibrio, el peque se <br>
                        apoyará con las manos para no caer y esto estimulará sus reflejos.</li>

                        <li>Pon al peque delante de un espejo y muévelo para que se vea reflejado en él.</li>

                        <li>Mueve el sonajero o algún juguete musical en su oreja derecha y, después, en su <br>
                        oreja izquierda.</li>

                        <li>Deja que el peque huela varios aromas cada día como, por ejemplo, frutas, <br>
                        flores, agua de rosas, etc.</li>

                        <li>Realiza una trompetilla sobre el vientre del peque para que lo tense y destense.</li>

                        <li>Canta una canción al peque mientras le tomas las manos para que haga palmas.</li>

                        <li>Acuesta al peque boca arriba, cógelo de los antebrazos y lentamente siéntalo <br>
                        mientras dices "arriba". Vigila que su cabeza no se vaya hacia atrás.</li>

                        <li>Acuesta al peque boca abajo, pon tu mano en su estómago y súbelo y <br>
                        bájalo suavemente, aumenta poco a poco la altura.</li>

                        <li>Es importante celebrar cada logro del peque después de cada actividad. Para <br>
                        ello, puedes levantarlo tomándolo por las axilas hasta la altura de la cara, <br>
                        sonríele y dile "muy bien".</li>
                        </ul>

                        <h3>Referencias:</h3>
                        <p>Clementine y Bastién. (25 de abril de 2023). Ejercicios de estimulación temprana <br>
                        para bebés de 0 a 6 meses. Clementine y Bastién. Disponible <br>
                        en: https://www.clebastien.com/blog/ejercicios-estimulacion-temprana-bebes/</p>

                        <p>Medina, A. (2022). La estimulación temprana. Revista Mexicana de Medicina <br>
                        Física y Rehabilitación, 24(14), 63-64.</p>

                        <p>Mustela. (2023). Estimulación temprana en bebés de 0 a 3 meses. Mustela. <br>
                        Disponible en: https://www.mustela.es/blogs/mustela-mag/estimulacion￾temprana-en-bebes-de-0-3-<br>
                        meses#:~:text=Masajea%20suavemente%20todo%20su%20cuerpo,h%C3%A1blale <br>
                        %20mucho%20y%20con%20cari%C3%B1o.</p>

                        <p>Ruiz, M. (28 de febrero de 2022). Juegos y actividades para estimular el desarrollo <br>
                        de bebés de 0 a 6 meses. Bebés y más. https://www.bebesymas.com/ser￾<br>
                        padres/juegos actividades-para-estimular-desarrollo-bebes-0-a-6-meses</p>

                        <p>Salvador, Z. (12 de febrero de 2018). Ejercicios de estimulación temprana para <br>
                        bebés de 0 a 6 meses. Reproducción Asistida ORG. Disponible <br>
                        en: https://www.reproduccionasistida.org/ejercicios-de-estimulacion-temprana￾<br>
                        para bebes-de-0-a-6-meses/</p>
                    `
                },

                {
                    id: 34,
                    titulo: "🌙 Sueño tranquilo, hogar en calma: la guía que tu peque necesita para descansar mejor",
                    resumen: "Dormir bien no es un lujo: es crecimiento, aprendizaje y estabilidad emocional. Este artículo te explica cómo funciona el sueño infantil, cuántas horas necesita tu peque según su edad y qué hacer para ayudarle a dormir solo, mejor y con seguridad… sin cambiar su esencia, solo entendiendo su ritmo.",
                    imagen: "assets/img/articulos/34.jpeg",
                    categoria: "Extras",
                    contenido: `
                        <h3>El sueño en los peques</h3>

                        <div class="reading-note">
                        <p><strong>¿Qué es el sueño?</strong> Es un estado activo en el que tienen lugar cambios de funciones corporales, además de actividades de gran trascendencia para el equilibrio psíquico y físico, durante el cual se producen modificaciones hormonales, bioquímicas, metabólicas imprescindibles para el buen funcionamiento durante el día.</p>
                        </div>

                        <p>Este a su vez se dividide en 2: El sueño REM, tiene que ver con el sueño de movimientos oculares rápidos, es la fase activa y más corta del sueño, en la que el cerebro permanece activo. El sueño NO REM, es la fase tranquila y profunda del sueño y también la más larga.</p>

                        <p>El sueño infantil está dividido en cuatro etapas que se van profundizando progresivamente. Cada una dura cerca de 90 minutos y siempre obedecen a un mismo orden: sueño REM (más liviano y corto) y el sueño NO REM (más profundo y largo).</p>

                        <p>Todos los bebés transitan por ciclos de sueño superficial y profundo durante una misma noche. Conforme el bebé va creciendo, lo normal es que los sueños REM vayan disminuyendo y que los NO REM vayan aumentando. A la edad de 4 meses, por ejemplo, el bebé consigue dormir 3 o 4 horas seguidas. Durante los 90 minutos de sueño profundo acompañado en los extremos por el sueño liviano, el bebé experimenta un estado de semialerta. En estos momentos es cuando el bebé está propenso a despertarse. Pero, minutos después, entrará en la fase más profunda completando su descanso nocturno de casi 8 horas.</p>

                        <p>En la primera etapa del desarrollo, la normalidad en cuanto al patrón de sueño está en función de la seguridad que se proporcione al niño respecto a sus necesidades básicas de cuidados físicos (alimento, aseo, etc.) y afectivos (calor, olor materno, movimiento de balanceo, etc.). Es importante que el niño pueda percibir tranquilidad en su entorno ya que como se ha mencionado, los bebés son especialmente sensibles a los estados emocionales de sus cuidadores.</p>

                        <p>Durante el primer mes de vida pese a que usualmente el niño tienda a dormirse en brazos de sus padres, es conveniente que en ocasiones se le deje en su cuna para que empiece a aprender a dormir solo tranquilamente, lo que debería ser capaz de hacer fuera del dormitorio de los padres alrededor del sexto mes.</p>

                        <div class="reading-note">
                        <p><strong>Funciones del sueño:</strong> crecimiento, desarrollo, aprendizaje, memoria, eficiencia sináptica, regulación del comportamiento, emoción, fortalecimiento inmunológico y tiempo de limpieza de sustancias neurotóxicas. Durante los primeros años de vida hay una serie de cambios importantes en el desarrollo que conducen al patrón esperado de sueño y vigilia en los adultos. El sueño ocupa un tercio de la vida del adulto. Sin embargo, dormir durante los primeros meses de vida ocupa más del 50% del tiempo.</p>
                        </div>

                        <h3>Horas de sueño recomendadas de acuerdo con la edad:</h3>

                        <p>Esta tabla de tiempo de sueño infantil puede servirte como referencia para valorar si tu peque duerme las horas necesarias. Es necesario aclarar que se trata de una tabla orientativa y que no tiene por qué cumplirse con todos los peques.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>EDAD</strong></span><span><strong>HORAS TOTALES</strong></span></div>
                        <div class="rt-row"><span>0 - 2 meses</span><span>16 - 20 horas</span></div>
                        <div class="rt-row"><span>3 - 6 meses</span><span>14 - 16 horas</span></div>
                        <div class="rt-row"><span>6 - 12 meses</span><span>13 - 15 horas</span></div>
                        <div class="rt-row"><span>12 - 18 meses</span><span>13 horas</span></div>
                        <div class="rt-row"><span>15 - 24 meses</span><span>13 horas</span></div>
                        <div class="rt-row"><span>2 - 3 años</span><span>10 - 12 horas</span></div>
                        <div class="rt-row"><span>3 - 5 años</span><span>10 - 12 horas</span></div>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>HORAS DE NOCHE</strong></span><span><strong>N° SIESTAS</strong></span></div>
                        <div class="rt-row"><span>6 - 8</span><span>4 - 8</span></div>
                        <div class="rt-row"><span>8 - 10</span><span>3 - 2</span></div>
                        <div class="rt-row"><span>12 horas</span><span>2 - 1</span></div>
                        <div class="rt-row"><span>11,5 horas</span><span>2 - 1</span></div>
                        <div class="rt-row"><span>11 horas</span><span>2 - 1</span></div>
                        <div class="rt-row"><span>10 - 11 horas</span><span>1 - 0</span></div>
                        <div class="rt-row"><span>10 - 12 horas</span><span>0</span></div>
                        </div>

                        <h3>¿Cuánto duermen los peques en un día?</h3>

                        <ul>
                        <li><strong>Peques hasta los seis meses de edad:</strong> El reloj interno de un bebé recién nacido todavía no está desarrollado. Como puedes comprobar en la tabla del tiempo del sueño infantil, entre el día y la noche, suelen dormir mucho, de 16 a 20 horas al día. En las primeras semanas, su sueño diurno suele interrumpirse a intervalos de 2 o 3 horas para sus tomas de leche.</li>
                        </ul>

                        <p>A partir de del segundo mes, podrá dormir durante períodos más largos de tiempo.</p>

                        <p>A partir del tercer mes, los peques suelen dormir un poco más por las noches, de 6 a 8 horas sin interrupciones, y unas cinco horas durante el día.</p>

                        <p>A los cuatro meses, la mayoría de los peques suelen dormir en su propia habitación. Es muy importante, en esta etapa, que los niños aprendan a dormir por sí solos, y que distingan entre el día y la noche para que ésta última esté relacionada con el sueño prolongado. La rutina de horarios y de actividades es la mejor forma para educar a los peques y que concilien mejor el sueño. Les dará más seguridad y tranquilidad.</p>

                        <ul>
                        <li><strong>Peques de seis a doce meses:</strong> A los seis meses, el peque ya dormirá siestas de tres horas durante el día y dormirá unas 11 horas durante la noche. En esta etapa, ya deben dormir por sí solos. Cuando están enfermos necesitarán más atención y cariño, porque eso les hará sentirse mejor. Cuando el peque se despierta muchas veces durante una noche, puede que se sienta molesto por algo, lo mejor es atenderlo y asegurarse de que todo está bien, es decir, que no tiene el pañal sucio o que no tiene calor o frío.</li>
                        </ul>

                        <ul>
                        <li><strong>Niños de uno hasta los tres años:</strong> En esta etapa los bebés suelen echar siestas más cortas, de una o dos horas, por lo que aumentará su sueño durante la noche, en una media de 10 a 13 horas. Se debe mantener una rutina de actividades antes del sueño: el baño, cena, contarles un cuento, ponerles música relajante y ¡a dormir!</li>
                        </ul>

                        <p>Es un ritual que ayudará mucho a que los peques entiendan que el acto de dormir es una actividad y una necesidad más. A los dos años, el niño ya podrá elegir el pijama que quiere usar, el peluche o el juguete con el que quiere dormir y el cuento que quiere que le cuente, eso le hará partícipe de la rutina.</p>

                        <ul>
                        <li><strong>Niños de tres a los seis años:</strong> A los 3 años, los niños suelen dormir una siesta de una hora, y por la noche necesitan de 10 a 12 horas de sueño para sentirse descansados. A partir de los cuatro años, muchos ya dejan de dormir la siesta. Depende mucho del carácter y de las necesidades de cada niño.</li>
                        <li><strong>Niños de seis a los nueve años:</strong> Durante estos años, los niños necesitan aproximadamente 10 horas de sueño durante la noche. Es importante que antes de que los niños se vayan a la cama, disfruten de un momento en privado con sus figuras de apego para conversar, compartir secretos, cuentos o música. Es una buena forma de prepararlos para el sueño.</li>
                        <li><strong>Niños de 10 a los 12 años:</strong> A estas edades, los niños sólo necesitan alrededor de 9 horas de sueño durante la noche. Todo dependerá de cómo esté de relajado o cansado</li>
                        </ul>

                        <h3>Consecuencias del mal dormir para el niño:</h3>

                        <p>Se encontrarán efectos negativos en funciones cognitivas, emocionales conductuales. Cambios subjetivos:</p>

                        <ul>
                        <li>Cambios de humor, irritabilidad, fatiga, impulsividad e inquietud.</li>
                        <li>Dificultades de concentración y desorientación.</li>
                        <li>Desánimo y decaimiento.</li>
                        <li>Cansancio y agotamiento.</li>
                        <li>Baja tolerancia a la frustración.</li>
                        <li>Déficit de memoria.</li>
                        <li>Falta de autocontrol y de atención.</li>
                        <li>Bajo rendimiento motor.</li>
                        <li>Apatía y oposición.</li>
                        <li>Disminución del rendimiento escolar.</li>
                        <li>Cefaleas.</li>
                        <li>Accidentes, en menor y mayor medida.</li>
                        <li>Disminución de los reflejos.</li>
                        <li>Son más propensos a enfermarse.</li>
                        </ul>

                        <h3>Impacto en las actividades cotidianas:</h3>

                        <ul>
                        <li>Micro sueños diurnos que lo harán pasible de cometer errores y omisiones.</li>
                        <li>Hiperactividad.</li>
                        <li>Enlentecimiento cognitivo, declinación de la velocidad de cálculo.</li>
                        <li>Dificultades en la memoria y el aprendizaje: menor logro académico. Hasta un 20 % de los niños pueden perder un año escolar.</li>
                        </ul>

                        <h3>¿Cómo ayudar a nuestro peque a dormir bien, sólo y en un horario establecido?</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>1.</span><span>Establece una rutina de sueño que incluya un período de tranquilidad antes de la hora de dormir.</span></div>
                        <div class="rt-row"><span>2.</span><span>Evita o reduce al mínimo el acceso a la televisión o a los videojuegos antes de dormir.</span></div>
                        <div class="rt-row"><span>3.</span><span>Establece un horario para dormir todos los días, que ayudará al peque a mantener una rutina. Los rituales para dormir son maneras efectivas para empezar a formar los buenos hábitos (por ejemplo: tomar un vaso de leche, cepillarse los dientes, ir al baño, ponerse el pijama, etc.)</span></div>
                        <div class="rt-row"><span>4.</span><span>Permite que el pequeño duerma con un peluche, cobija o juguete de apego.</span></div>
                        <div class="rt-row"><span>5.</span><span>Controla que la temperatura en la habitación sea agradable y que la ropa sea cómoda.</span></div>
                        <div class="rt-row"><span>6.</span><span>Deja una luz encendida, la puerta entreabierta o un vaso de agua al lado de la cama, si el peque te lo pide.</span></div>
                        <div class="rt-row"><span>7.</span><span>Supervisa en todo momento al peque y asístelo cuando sea necesario, por ejemplo: ante alguna pesadilla, sonambulismo, etc.</span></div>
                        </div>

                        <h3>Referencias:</h3>

                        <p>Caraballo, A. (23 de diciembre de 2021). Tabla de tiempo de sueño infantil. Guía Infantil. Disponible en: https://www.guiainfantil.com/1243/tabla-de-tiempo-del￾sueno-infantil.html</p>

                        <p>Convertini, G. (2006). El sueño en la infancia: su implicancia en el desarrollo. Sueño en la infancia. Disponible en: https://www.sap.org.ar/docs/organizacion/comitesnacionales/ped_amb/Sue￾nio.pdf</p>

                        <p>Esteban, E. (9 de marzo de 2020). Efectos de la falta del sueño en los niños. Guía Infantil. Disponible en: https://www.guiainfantil.com/1068/efectos-de-la-falta-del￾sueno-en-los-ninos.html</p>

                        <p>Guía Infantil. (10 de marzo 2020). El sueño infantil. Fases y etapas del sueño. Guiainfantil.com Disponible en: https://www.guiainfantil.com/articulos/salud/sueno/el-sueno-infantil-fases-y etapas-del-sueno/</p>

                        <p>Guía Infantil. (29 de enero de 2021). Cómo ayudar al niño a dormir bien. Guía Infantil. Disponible en: https://www.guiainfantil.com/sueno/comoayudar.htm</p>
                    `
                },

                {
                    id: 35,
                    titulo: "👣💗 Aprendiendo a caminar: acompañe sus primeros pasos con calma, juego y confianza",
                    resumen: "Cada pasito es una conquista. Esta guía le ayuda a respetar el ritmo del peque, fomentar el gateo, preparar un entorno seguro y aplicar estrategias sencillas para que caminar sea un proceso más fácil, enriquecedor y lleno de motivación.",
                    imagen: "assets/img/articulos/35.jpg",
                    categoria: "Motriz",
                    contenido: `
                        <h1 style="font-size:32px;line-height:1.15;margin:10px 0 14px 0;">Aprendiendo a caminar</h1>

                        <p>Los peques comienzan a dar sus primeros pasos entre un período de 10 y 18 meses, algunos comienzan a inicios de periodo, otros a mediado y otros incluso al final, esto debido a que a los 12 meses la mayoría de peques ya están preparados para caminar, sin embargo, es importante que tanto padres como nannies no caigan en un estado de desesperación, ni tampoco hagan comparaciones, todos los peques se desarrollan a su propio ritmo, algunos lo hacen más rápido, se ponen de pie, comienzan a sujetarse de los muebles y tratan de dar pasitos, y a otros, les cuesta mucho dar sus primeros pasitos, puede ser por inseguridad o porque necesitan ser incentivados.</p>

                        <p>Los peques aprenden de forma lúdica, es decir que deben de aprender jugando, con paciencia y repetición constante hasta que consigan lo esperado, es muy importante respetar su ritmo para evitar agobios. Por otro lado, los peques necesitan moverse libremente, es decir, entre menor tiempo estén sentados o acostados mejor.</p>

                        <p>Todos los peques llevan un proceso madurativo físico donde los peques desarrollan una serie de habilidad o destrezas físicas, cognitivas y socio afectivas antes de poder caminar, este mismo proceso lo podemos usar para saber si el peque está listo para caminar, algunos indicios de esto son:</p>

                        <div class="reading-note">
                        <ol style="margin:0;padding-left:18px;">
                            <li>Logra sostener su cabeza y dar vueltas por sí mismo</li>
                            <li>Se sienta solo</li>
                            <li>Se impulsa hacia adelante hasta que logra gatear</li>
                            <li>Logra ponerse de pie solo manteniendo el equilibrio</li>
                            <li>Da sus primeros pasos con apoyo</li>
                        </ol>
                        </div>

                        <p>Sin, embargo, gatear es muy importante para el desarrollo psicomotor del peque, ya que es el paso antes de caminar, además que impactará positivamente debido a que ayudará a un movimiento más estable y firme, adquiriendo también la conciencia corporal y del mundo, aprenderá a ver los cambios de altura, nivel y profundidad).</p>

                        <p>El gateo, es del acto de desplazarse utilizando cuatro puntos de apoyo, el cuerpo del peque se sostiene sobre las rodillas, manos y el tronco permanece elevado, los peques suelen gatear de forma natural entre los 8 y 11 meses, permite adquirir fuerza en brazos, piernas, cuello y espalda, permite mayor autonomía debido a que descubre su propio cuerpo y explora un entorno más grande.</p>

                        <h3>¿Cómo invitar a mi peque a gatear?</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Toalla: podemos colocar una toalla enrollada en forma de rodillo, y colocaremos al peque sobre ella, cuando esté apoyado en sus manitas, muévelo hacía adelante y hacía atrás simulando el movimiento del gateo.</li>
                            <li>Rodillo: para esta técnica, se colocará un cojín con forma cilíndrica debajo del estómago del peque, debe de estar en posición de gateo, por delante del peque colocaremos un juguete para que intente alcanzarlo.</li>
                            <li>Juguetes: se va a colocar al peque boca abajo en una manta o alfombra, colocaremos sus juguetes favoritos a unos 20 o 30 cm delante de él e invitaremos a que los alcance.</li>
                            <li>Espejo: como nannies, podemos gatear al lado del peque ayudando así a desplazarse, a él le encantará que recorran juntos toda la casa.</li>
                            <li>Espacio: busca en piso un espacio limpio y seguro donde el peque pueda pasar mucho tiempo ahí, se verá motivado a comenzar a gatear.</li>
                            <li>Pelota: la nanny puede hacer uso de una pelota, se sugiere poner al peque en el piso y hacer que rebote ya que el movimiento resulta beneficioso para desarrollar la convergencia de los ojos.</li>
                            <li>Siempre es importante que los peques te vean a ti como ejemplo y como apoyo, así que es recomendable tomar de las manos a los peques y caminar un poco para que tus pasos sean imitados, es cuando los peques harán el movimiento de los pies para avanzar y sentir el contacto con el suelo.</li>
                        </ul>
                        </div>

                        <h3>¿Cómo podemos hacer el proceso de caminata más fácil y enriquecedor?</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Permite que el peque ande descalzo por casa, así conocerá nuevas texturas por medio de la planta del pie, además, esto hará que mejore su equilibrio y su agarre al suelo.</li>
                            <li>Sugiérele a la familia adaptar la casa para que el peque aprenda a caminar, ya que, antes de alentarlo debemos hacer un entorno seguro para que explore, por ejemplo, los muebles pesados sin bordes lo ayudarán a sostenerse, pero, los muebles livianos pueden provocar accidentes. Por otra parte, si hay escaleras debemos tener mucha precaución, ya que, en un inicio el peque no tiene las habilidades necesarias para bajarlas, por lo que se podrían generar accidentes. También, debemos de tener cuidado con los manteles o telas que puedan jalar, pues si hay algún objeto encima de ellos, los peques podrían lastimarse.</li>
                            <li>Muéstrale seguridad, entusiasmo y confianza cuando intente caminar, ya que, si él llega a observar miedo o pánico en nosotros asociará la situación con algo peligroso o negativo, esto puede hacer que se detenga y no quiera arriesgarse.</li>
                            <li>Es importante que los peques sigan con masajes de estimulación temprana todos para seguir ejercitando sus brazos, espalda, y piernas todos los días para ganar movilidad, coordinación y mejor tono muscular.</li>
                            <li>Durante el cambio de pañal se puede aprovechar para realizar algunos movimientos con las piernas debido a que el bebé está boca arriba, se recomienda hacer movimientos que permitan estirar las piernas, ejercitando un poco los músculos de sus muslos y pantorrillas subiendo y bajando sus piernas poco a poco.</li>
                        </ul>
                        </div>

                        <h3>Estrategias para enseñar y ayudar a los peques a caminar:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Ayuda a tu peque a ponerse de pie usando sillas pequeñas, sitúate detrás de la silla y enséñale su juguete favorito, esto motivará al peque a desplazarse hasta donde esté la silla ya sea que se agarre de algunos objetos cercanos como sillones o gateando, ya que esté en la silla lo motivaremos para que se ponga de pie y pueda tomar su juguete.</li>
                            <li>Haz uso de caminadores, carritos del super de juguete o carriolas de juguete para que pueda dar algunos pasos agarrándose de ellos, esto puede ser muy favorecedor ya que, a los peques les encanta empujar objetos y sirve cómo entrenamiento para cuando llegue el momento de soltarse.</li>
                            <li>Otra estrategia es situarte detrás del peque, pidiéndole que tome tus manos, después, elevarás sus manos para que sea más fácil motivarlo a caminar, poco a poco se irá cambiando el agarre de las manos hasta que el peque se sostenga de un solo dedo y lo pueda lograr por sí mismo.</li>
                            <li>Enséñale a tu peque a frenar, deja que tu peque de unos pasos solo y páralo ofreciéndole un dedo de cada mano, déjalo que se quede quieto y suéltalo poco a poco, realiza este ejercicio en diversas ocasiones hasta que el peque logre quedarse de pie solo por un largo periodo.</li>
                            <li>Llámalo, es decir, sitúate en un punto cercano a él, di su nombre e invita al peque a que vaya contigo, ve aumentando la distancia poco a poco haciéndolo sentir más estimulado y seguro.</li>
                            <li>Pedaleo: toma ambas piernas del peque, flexiónalas y llévalas a su abdomen simulando el movimiento del pedaleo de una bicicleta.</li>
                            <li>Anímalo a gatear poniendo una manta en el suelo y sobre ella al peque boca abajo, después, llama su atención con ayuda de su juguete favorito. Puedes colocar las palmas de tus manos en las plantas de sus pies, así sentirá impulso y gateará.</li>
                            <li>Durante la hora del baño usa la tina con agua para que el peque chapoteé en el agua, esto fortalecerá sus piernas.</li>
                        </ul>
                        </div>

                        <h3>Ejercicios para fortalecer las piernas de los peques:</h3>

                        <div class="reading-note">
                        <ol style="margin:0;padding-left:18px;">
                            <li>Se va a comenzar parando al peque delante de la nanny y lo sujetará de las manos, posteriormente comenzará un conteo: uno dos, uno dos, a la vez que con la punta de los pies de la nanny empujará suavemente hacía adelante cada uno de los piecitos.</li>
                            <li>El número 1 coincide con el pie derecho y el número 2 con el pie izquierdo.</li>
                            <li>Sí en casa se tiene un parque infantil, la nanny puede hacer uso de él, colocará su juguete favorito en un extremo alejado y deberá invitar al peque a que vaya por él, comenzará a caminar por el parque infantil mientras se agarra de los barrotes, conforme lo vaya dominando, la nanny puede enseñar un camino más corto a él incitando a soltarse.</li>
                        </ol>
                        </div>

                        <p>4. Para el siguiente ejercicio se necesitará un espejo, al verlo, el peque sentirá el impulso de acercarse, apoyarse y buscar levantarse, por ende, estimulará sus piernas, además de que lo ayudará a reconocer sus partes del cuerpo, y a la formación del autoconcepto.</p>

                        <h3>Cosas que no se recomiendan:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Sentar al peque antes de que los huesos de la espalda estén realmente preparados.</li>
                            <li>Tomar al peque de los brazos y jugar al “helicóptero”, ya que podemos lastimar sus extremidades, por lo tanto, se recomienda levantarlos desde las axilas.</li>
                            <li>El uso de andaderas no se recomienda ya que incrementa el riesgo de accidentes, lesiones y retardar su desarrollo para caminar.</li>
                        </ul>
                        </div>

                        <h3>Referencias</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Admin. (s/f).</span> <span>“¿Está tu bebé tardando más de la cuenta en gatear? ¿Cuándo empieza a gatear un bebé?”. Fisioterapia. La importancia de empezar a gatear. El gateo y el desarrollo del bebé. (barrenacraus.com)</span></div>
                        <div class="rt-row"><span>Esteban, E.</span> <span>(25 de septiembre de 2018). “6 consejos para ayudar a andar a los bebés”. Guía Infantil. 6 consejos para ayudar a andar a los bebés (guiainfantil.com)</span></div>
                        <div class="rt-row"><span>Kinedu.</span> <span>(21 de junio de 2021). “¡5 consejos prácticos para animar a tu bebé a caminar”. Kinedu. ¡5 consejos prácticos para animar a tu bebé a caminar! - Kinedu Blog</span></div>
                        <div class="rt-row"><span>López, M.</span> <span>(24 de octubre de 2021). “Enseñar a un bebé a andar: trucos y consejos para que sea más fácil”. Tu Educadora. Enseñar a un Bebé a Andar: Trucos y Consejos - Tu Educadora Losada, T. (s/f). “¡No ayudes a tu peque a caminar! Los primeros pasos, mejor solos. CSC. ¿Cómo ayudar al bebé a dar sus primeropasos? - CSC (criarconsentidocomun.com)</span></div>
                        <div class="rt-row"><span>Moreno, M.</span> <span>(25 de septiembre de 2019). “primeros pasos de un bebé: cómo enseñar a caminar a mi bebé”. MEGA baby. Primeros pasos de un bebé: Cómo enseñar a caminar a mi bebé [Trucos] (megababy.pe)</span></div>
                        <div class="rt-row"><span>Navarro, A,</span> <span>(09 de diciembre de 2022). “7 ejercicios para bebés que les ayudan a aprender a caminar”. Eres mamá. 7 ejercicios para bebés que les ayudan a aprender a caminar - Eres Mamá (eresmama.com)</span></div>
                        <div class="rt-row"><span>Pereda, T.</span> <span>(s/f). “5 consejos para fomentar el gateo del bebé”. Hacer Familia. 5 consejos para fomentar el gateo del bebé (hacerfamilia.com)</span></div>
                        <div class="rt-row"><span>Rovati, L.</span> <span>(24 de mayo de 2019). “Cómo estimular el gateo del bebé: siete ejercicios y juegos para ayudarle en esta etapa”. Bebés y más. Cómo estimular el gateo del bebé: siete ejercicios y juegos para ayudarle en esta etapa (bebesymas.com)</span></div>
                        </div>
                    `
                },

                {
                    id: 36,
                    titulo: "🤍 Estreñimiento en peques: señales, causas y cómo ayudarle sin sufrir (ni pelear)",
                    resumen: "Ver a tu peque incómodo duele… y más cuando no sabes qué hacer. Aquí encontrarás señales claras para identificar el estreñimiento, por qué sucede y estrategias prácticas (alimentación, agua, fibra, postura y movimiento) para ayudarlo con calma y cuidado.",
                    imagen: "assets/img/articulos/36.jpg",
                    categoria: "Extras",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Estreñimiento en peques</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">💛 Un problema común (y muy molesto)</strong>
                        <p style="margin:10px 0 0 0;">El estreñimiento se define como la retención o dificultad para evacuar las heces 
                        por un periodo de tiempo prolongado y, aunque sabemos lo molesto que puede 
                        ser para los peques, en realidad es un problema más común de lo que creemos.</p>
                        </div>

                        <p>En ocasiones, cuando los peques tienen este problema, las heces suelen ser duras 
                        y de gran tamaño, lo que ocasiona mucho malestar e incomodidad en los peques</p>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>Hay dos tipos de estreñimiento:</strong>
                        <ul style="margin:10px 0 0 0; padding-left:18px; line-height:1.8;">
                            <li> Orgánico: Aquel que es resultado de una enfermedad, suele ser poco 
                            frecuente.</li>
                            <li> Funcional: Retención voluntaria por parte de los peques y también puede 
                            ocurrir después de una infección gastrointestinal</li>
                        </ul>
                        </div>

                        <p>Existen tres escenarios más comunes en los que llega a suceder el estreñimiento:</p>
                        <ol style="line-height:1.9;">
                        <li>Cuando se introducen cereales y alimentos sólidos a la dieta del peque.</li>
                        <li>Durante el entrenamiento para ir al baño.</li>
                        <li>Alrededor del inicio de clases o situaciones que resulten estresantes para 
                        los peques</li>
                        </ol>

                        <p>Así mismo, existen algunas señales principales para identificar el estreñimiento en 
                        peques lactantes y peques más grandes:</p>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <ul style="margin:0; padding-left:18px; line-height:1.8;">
                            <li>No hay deposiciones durante un periodo largo de tiempo (2 a 3 días).</li>
                            <li>Deposiciones duras o dolorosas.</li>
                            <li>Heces de gran tamaño que pueden obstruir el inodoro.</li>
                            <li>Gotas de sangre en el exterior de las heces.</li>
                            <li>Pérdida de peso o retraso del crecimiento.</li>
                            <li>Disminución del apetito.</li>
                            <li>Vómitos.</li>
                            <li>Dolor abdominal.</li>
                            <li>En lactantes: pérdida de energía y tono muscular (parecen débiles).</li>
                            <li>En peques más grandes: emisión involuntaria de orina (incontinencia), 
                            dolor de espalda, debilidad en las piernas o problemas para caminar.</li>
                            <li>Diarrea por desbordamiento del intestino.</li>
                        </ul>
                        </div>

                        <h3 style="margin-top:26px;">Retención fecal:</h3>
                        <p>Cuando los peques empiezan a ser conscientes de lo que sucede con sus cuerpos 
                        y no les “agrada”, es posible que empiecen a retener las heces (de manera 
                        consciente o inconsciente). Así mismo, también existe la inconsciencia acerca de 
                        las señales que el cuerpo manda para expresar la necesidad de ir al baño. Esto 
                        puede suceder en diferentes situaciones, por lo que es importante que 
                        observemos qué es lo que pasa en el cuerpo del peque, por ejemplo:</p>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <ul style="margin:0; padding-left:18px; line-height:1.8;">
                            <li>● Es posible que el peque evite evacuar por el dolor que le llegan a causar 
                            las heces duras, por lo que retiene para evitar que llegue el momento, lo 
                            que provoca que después le cueste más, como un ciclo de retención (las 
                            rozadoras en el ano por el pañal pueden empeorar la situación).</li>

                            <li>● Los peques de 2 a 5 años empiezan a desarrollar independencia y el gusto 
                            por decidir por sí mismos, por lo que retener las evacuaciones pueden ser 
                            un efecto de su intención de tomar el control sobre su vida y su cuerpo. Por 
                            ello, es importante que cuando se inicie el proceso de control de esfínteres 
                            NO se presione al peque para ir al baño.</li>

                            <li>● Retienen para no detener una actividad. Esto sucede porque lo están 
                            pasando bien y saben que si se detienen probablemente no puedan 
                            retomar el juego, por lo que se recomienda que desde que inicie el 
                            proceso de control de esfínteres se les deje en claro que hay tiempo para 
                            todas las actividades y que no pasa nada si se toma 10 minutos para ir al 
                            baño, siempre se puede regresar al juego. Así mismo, en el inicio del control 
                            de esfínteres se recomienda usar “alarmas” o recordatorios cada 10-15 
                            minutos para que el peque vaya al baño, aunque no tenga ganas, con el 
                            fin de crearle el hábito.</li>

                            <li>● A los peques más grandes, ya con control de esfínteres, es posible que les 
                            desagrade ir al baño en espacios públicos y retienen para evitar la 
                            situación (como en escuelas, centros comerciales, restaurantes, etc.</li>
                        </ul>
                        </div>

                        <h3 style="margin-top:22px;">Encopresis:</h3>
                        <p>Cuando el peque no evacúa cuando llega el impulso fisiológico, el recto con 
                        el tiempo empieza a distenderse para acomodar las heces. Cuando el recto 
                        se ha distendido, el impulso de evacuar disminuye y se acomoda más y más 
                        material fecal, al punto de que se endurece, lo que puede resultar en un 
                        bloqueo del paso del contenido fecal, esto se llama impactación fecal. Es 
                        entonces cuando las heces más líquidas situadas por arriba de este “tapón” 
                        se filtren y manchen la ropa interior del peque, derivando en una incontinencia 
                        fecal (encopresis). Es entonces cuando los cuidadores principales del peque 
                        pueden llegar a creer que tiene diarrea, cuando el problema en realidad es 
                        el estreñimiento.</p>

                        <div class="comunidad-section-header" style="margin-top:26px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">¿Cómo solucionar el estreñimiento en los peques?</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <ol style="margin:0; padding-left:18px; line-height:1.9;">
                            <li><strong>Dieta:</strong> Se recomienda evitar el consumo de alimentos ultra procesados o con 
                            demasiada azúcar, ya que estos alimentos no son procesados por los intestinos 
                            de los peques de la misma forma que a las personas adultas y les costará más 
                            digerirlos.</li>

                            <li><strong>Hidratación:</strong> Asegúrate de que los peques hagan un buen consumo de agua es 
                            crucial no sólo para el estreñimiento, sino para todas las funciones corporales y 
                            mentales. Cuando el peque no toma agua, el cuerpo se deshidrata y toma los 
                            líquidos del intestino y la envía a otros lugares del cuerpo (como corazón y 
                            cerebro).</li>

                            <li><strong>Fibra:</strong> El consumo de fibra puede ser a través de alimentos o suplementos, se 
                            recomienda que este consumo sea lo más natural posible, a través de frutas y 
                            verduras. Muchas frutas que los peques disfrutan son altas en fibra, por lo que son 
                            una excelente oportunidad para que se incluya en la dieta del peque. *Ver tabla: 
                            Ejemplos de alimentos con alto contenido de fibra:</li>
                        </ol>
                        </div>

                        <div class="reading-table" style="margin-top:16px;">
                        <div class="rt-row"><span><strong>Ejemplos de alimentos con alto contenido de fibra:</strong></span><span>🥝</span></div>
                        <div class="rt-row"><span>Frutas</span><span>🍎</span></div>
                        <div class="rt-row"><span>Verduras cocidas</span><span>🥦</span></div>
                        <div class="rt-row"><span>Frijoles cocidos</span><span>🫘</span></div>
                        <div class="rt-row"><span>Granos integrales cocidos</span><span>🌾</span></div>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main); margin-top:18px;">
                        <ul style="margin:0; padding-left:18px; line-height:1.8;">
                            <li> Cambiar la postura en el baño: Sabemos que, por enseñanza, estamos 
                            acostumbrados a defecar con una postura recta y rígida, sin embargo, 
                            esta no es la mejor opción si el peque tiene dificultad para evacuar, se 
                            recomienda que el/la peque use un banquito que le ayude a sostener sus 
                            rodillas por encima de su cadera y que la espalda esté inclinada a 35° 
                            aproximadamente.</li>

                            <li>● Actividad física y masajes: Es bien sabido que mantener una rutina de 
                            ejercicio y brindarles a los peques la oportunidad de caminar ayuda no 
                            sólo para la evacuación, sino para todo el cuerpo en general, ya que 
                            activa la circulación ayudando a los intestinos al proceso digestivo. Se 
                            recomienda que estos ejercicios sean de manera lúdica (jugar a las 
                            atrapadas, escondidas o a la pelota) o bien que los peques tengan alguna 
                            actividad extraescolar que les llame la atención y que requiera de este 
                            esfuerzo físico (danza, fútbol, básquetbol, voleibol, etc.)</li>
                        </ul>
                        </div>

                        <p>Así mismo, para los peques más chicos recomendamos los siguientes 
                        ejercicios en su estómago para ayudar a fluir los desechos:</p>

                        <h3 style="margin-top:26px;">Bibliografía</h3>
                        <p>Consolini, D. M. (2022, 3 noviembre). Estreñimiento en los niños. Manual MSD 
                        Versión Para Público General. 
                        https://www.msdmanuals.com/es/professional/pediatr%C3%ADa/s%C3%ADntom
                        as-en-lactantes-y-ni%C3%B1os/estre%C3%B1imiento-en-ni%C3%B1os</p>

                        <p>Estreñimiento en bebés y niños pequeños (s.f.) MedlinePlus enciclopedia médica.
                        https://medlineplus.gov/spanish/ency/article/003125.htm</p>

                        <p>El estreñimiento en los niños: causas y tratamiento. (s. f.). HealthyChildren.org
                        https://www.healthychildren.org/Spanish/healthissues/conditions/abdominal/Pa
                        ginas/constipation.aspx</p>

                        <p>Síntomas y causas del estreñimiento en los niños - NIDDK. (s. f.). National Institute 
                        Of Diabetes And Digestive And Kidney Diseases.
                        https://www.niddk.nih.gov/health-information/informacion-de-la￾salud/enfermedades-digestivas/estrenimiento-ninos/sintomas-causas</p>

                    </div>
                    `
                },

                {
                    id: 37,
                    titulo: "🌱 Independencia en los peques: cómo ayudar sin estorbar (y verlos crecer con seguridad)",
                    resumen: "A veces, por amor, hacemos de más… y sin querer frenamos su autonomía. Esta guía le da ideas claras y prácticas para acompañar a su peque con presencia, confianza y rutinas que lo ayudan a sentirse capaz todos los días.",
                    imagen: "assets/img/articulos/37.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/30.jpg')"></div>

                        <div class="reading-note" style="margin-top:0;">
                        <strong>Independencia en los peques</strong>
                        </div>

                        <p>Es posible que como Nannys queramos ayudar a nuestros peques lo más que se pueda, sin embargo, al paso del tiempo, ellos van creciendo y van requiriendo nuestra ayuda en menor cantidad, esto no significa que debamos desatenderlos, más bien, debemos estar presentes en todo momento y guiarlos si necesitan ayuda especial, etc., pero intentando siempre desarrollar su autonomía, ya que, los niños están en la búsqueda de la independencia desde el momento en que nacen. Podemos ver esto cuando los bebés intentan alimentarse con una cuchara o insisten en quitarse sus propios pañales, y cuando los niños entre 1 y 4 años exigen vestirse solos o abrir la llave del lavamanos.</p>

                        <p>A medida que los peques experimentan estas rutinas una y otra vez, aprenden a anticipar lo que viene después y comienzan a asumir más responsabilidad con menos ayuda. Si permites que tu peque haga algunos de los trabajos de preparación, como poner la pasta de dientes en el cepillo de dientes o encontrar su suéter y zapatos, cada vez hará más pasos por su cuenta, mientras le comunicas que tienes confianza en su capacidad para realizar estos pasos sin tu ayuda, pero a la vez que estás allí para ayudarlo si lo necesita.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Establece rutinas predecibles:</strong> Puede parecer sorprendente, pero establecer una rutina constante es importante para fomentar la independencia. Al igual que los adultos, cuando los peques pueden anticipar su día, están mejor equipados para asumir responsabilidades. Una rutina no debe confundirse con un horario, ya que, la primera es cualquier secuencia de eventos que ocurre durante el día. Incluso el acto de cepillarse los dientes es una rutina, ya que tiene múltiples pasos que siempre van en el mismo orden: abrir la llave del agua, enjuagar el cepillo de dientes, ponerle pasta de dientes, cepillarse, enjuagarse, secarse las manos y la boca.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Permite que el peque elija:</strong> Otra forma de apoyar la independencia de los peques es darle opciones. Inclúyelo en la decisión de qué ropa ponerse, qué jugar o a quién llamar. Esto no significa que tenga rienda suelta. ¡Proporcione dos o tres opciones y luego elogia su gran habilidad para tomar una decisión!</span>
                        </div>
                        </div>

                        <p>Dar opciones es especialmente valioso cuando un peque en edad preescolar insiste en hacer algo a su manera. Por ejemplo, es posible que quiera cruzar la calle solo, lo que tal vez sea algo que no puede hacer todavía. Al ofrecer una opción, sostener su mano o que usted lo cargue, puede sentirse empoderado al tiempo que lo mantienes seguro, ¿En qué otro tipo de situaciones puedes darle opciones a tu peque? Por ejemplo; ¿Quieres guardar los juguetes saltando, o cantando?, ¿Prefieres tomar tu leche en vaso o en tasa?, ¿El día de hoy prefieres short o pantalón?, etc.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Permite que el peque te ayude:</strong> ¡A los peques les encanta ayudar! Además de desarrollar independencia, esta es una gran herramienta para calmar los berrinches o redirigir el comportamiento al darles una sensación de control. Cuando permites que tu peque ayude, fomentas su confianza y le das la oportunidad de aprender algo nuevo. Si bien esto puede implicar agregar un paso adicional o dos, también es una excelente manera de involucrar al peque en las rutinas y actividades diarias. Finalmente, recuerda que permitir que un niño ayude es experimentar el sentimiento de sentirse útil y valioso para alguien más.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Asigna tareas a tu peque:</strong> Tareas simples como recoger juguetes o poner la ropa en el cesto permiten a tu peque tener una responsabilidad razonable y lo ayuda a mantener la estructura durante todo el día. De hecho, estas tareas pueden integrarse en sus rutinas diarias. Por ejemplo, parte de la rutina de las comidas de tu peque puede incluir llevar su plato al fregadero.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Permita que tu peque resuelva problemas:</strong> Asegúrate de dejar que tu peque intente cosas difíciles y que resuelva problemas (pequeños) por su cuenta. Cuando los peques están aprendiendo a ponerse los zapatos, debemos permitirles que se los pongan en los pies equivocados. Espera hasta que tu peque pida ayuda o dé alguna señal.</span>
                        </div>
                        </div>

                        <p>Presentar a tu peque tareas que son un poco desafiantes, pero que aún están dentro del ámbito de lo que pueden hacer con algo de apoyo, los ayuda a aprender a lidiar con la frustración, resolver problemas y superar situaciones desafiantes. Tú puedes reconocer cuando algo está difícil y hacerle saber que estás orgulloso de él felicitándolo por probar cosas nuevas o difíciles. Sin embargo, asegúrate de celebrar el esfuerzo en lugar del resultado o la habilidad: “Estoy muy orgullosa de ti por seguir con eso, aunque se haya sido difícil”, en lugar de “¡eres tan bueno para ponerte los zapatos!”.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Fomente que se involucren en proyectos:</strong> Los proyectos, que pueden incluir cualquier cosa, desde colorear hasta construir, desde rompecabezas hasta manualidades, brindan oportunidades para que los peques pongan toda su atención en una actividad específica durante un período de tiempo. Comentar y elogiar el trabajo de tu peque le dará una sensación de logro y autoestima, y celebrar el esfuerzo ayuda con el desarrollo de la determinación.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Cultivar el juego libre:</strong> El juego independiente y no estructurado es muy importante para fomentar la creatividad, la solución de problemas y la autonomía.</span>
                        </div>
                        </div>

                        <p>Ofrece a tu peque una variedad de materiales de arte (crayones, marcadores, tizas, pinturas para los dedos), materiales de construcción (bloques, Magna Tiles, Legos) o accesorios de juego imaginarios, y permítele construir su propia manualidad o juego. También puede incluir materiales que no sean juguetes.</p>

                        <p>Los materiales reutilizables y los reciclables, como los rollos de toallas de papel, las latas de café y las cajas de cereales se pueden usar de maneras infinitas. Un rollo de toallas de papel puede ser un telescopio, un tubo, un automóvil, un avión, una varita mágica. Una caja de cereal puede ser un granero para animales, un bloque de construcción o un peldaño.</p>

                        <div class="reading-note">
                        <strong>Qué decir mientras trabajan y juegan:</strong>
                        <p style="margin:12px 0 0 0;">Además de crear oportunidades para que tu peque desarrolle su independencia, es importante que les hagas saber lo que ves: sus esfuerzos, su persistencia, su valentía, su crecimiento.</p>
                        </div>

                        <p>Lo que llamamos las habilidades “P–R–I–D–E” (por sus siglas en inglés: Praise (Elogiar): Reflect (actuar como Reflejo), Imítate (Imitar), Describe (Describir), be Enthusiastic (ser Entusiasta) son estrategias que han demostrado ayudar a aumentar los comportamientos positivos en niños pequeños:</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">ELOGIAR:</span>
                            <span style="flex:1; text-align:right;">Elogia el comportamiento apropiado de tu peque. Esto ayuda a aumentar el comportamiento específico que está abordando y contribuye a una interacción cálida con tu peque. Por ejemplo, “¡Qué buen trabajo hiciste alineando esos bloques!”, o “¡estoy orgulloso de ti por seguir con ese rompecabezas!”.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">Actuar como REFLEJO:</span>
                            <span style="flex:1; text-align:right;">Sé un espejo del discurso adecuado. Esto ayuda a demostrar a tu peque que está escuchando y comprendiendo. Por ejemplo, tu peque dice: “Hice una torre”. Y luego tú dices: “¡Hiciste una torre!”.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">IMITAR:</span>
                            <span style="flex:1; text-align:right;">Es bueno que imite los comportamientos y juegos apropiados. Esto brinda atención positiva (la recompensa más poderosa) al buen comportamiento y promueve la cooperación. Por ejemplo, cuando tu peque construye una torre, tú también comienza a apilar bloques.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">DESCRIBIR:</span>
                            <span style="flex:1; text-align:right;">Describe el comportamiento apropiado de tu peque. Esto refuerza el juego positivo y atrae tu atención hacia él. Podrías decirle: “¡Veo que dibujaste un arco iris!”, o “estamos construyendo una torre juntos”.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">¡Sé ENTUSIASTA!</span>
                            <span style="flex:1; text-align:right;">Esto hace que sus interacciones se sientan más cálidas y mantiene a tu peque interesado. Por ejemplo, puedes usar una voz juguetona, exagerar tus emociones cuando habla y sonreír a menudo.</span>
                        </div>
                        </div>

                        <p>Finalmente, recuerda que el que un niño sea autónomo quiere decir que está en busca de su independencia, habla de un niño que se sabe lo suficientemente seguro para intentar las cosas por su propia cuenta, por lo que requerirá de alguien que le guie, celebre o este ahí si se equivoca para volver a tomar impulso.</p>

                        <h3 style="margin-top:28px;">Referencias:</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Baby Sparks. (4 de enero 2022). Cómo fomentar la independencia de tu niño en edad preescolar. Baby Sparks. Disponible en:</span>
                            <span style="text-align:right; word-break:break-word;">https://babysparks.com/es/2022/01/04/how-to-boost-independence in-your￾preschooler/</span>
                        </div>
                        <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Colegio Chimalistac. (25 de julio de 2019). 5 estrategias para fomentar autonomía e independencia en los niños. Colegio Chimalistac. Disponible en: https://blog.ecagrupoeducativo.mx/chimalistac/5-estrategias-para-fomentar￾autonomia-e independencia-en-los-ninos</span>
                        </div>
                        <div class="rt-row" style="gap:10px; align-items:flex-start; border-bottom:none;">
                            <span>Levine, A. y Philips, L. (21 de septiembre de 2022). Cómo desarrollar la independencia en niños de preescolar. Child Mind Institute. Disponible en: https://childmind.org/es/articulo/como desarrollar-la-independencia-en-los-ninos￾de-preescolar/</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 38,
                    titulo: "🧡 Guía para el cambio de pañal: 15 pasos para cuidar con amor, seguridad y calma",
                    resumen: "Cada cambio de pañal puede ser un momento de conexión, confianza y cuidado. Esta guía práctica te acompaña paso a paso para que el proceso sea seguro, cómodo y siempre respetuoso con la integridad física y emocional de tu peque.",
                    imagen: "assets/img/articulos/38.jpg",
                    categoria: "Extras",
                    contenido: `
                        <h1>Guía para el cambio de pañal</h1>

                        <p>Elaboramos esta guía práctica con los 15 pasos esenciales para el cambio de <br>
                        pañal, nuestro objetivo es acompañarte y ayudarte a que cada cambio sea seguro <br>
                        cómodo y propiciando siempre el cuidado de los peques.</p>

                        <h3>Puntos importantes que considerar:</h3>
                        <div class="reading-note">
                        <ul>
                            <li>Pregúntale a la familia en donde puedes llevar a cabo este cambio y si este <br>
                            lo realizarás con la puerta abierta o cerrada.</li>
                            <li>Manten el vínculo con él peque, explícale lo que realizarás y siempre mantén <br>
                            la comunicación con el/ella.</li>
                        </ul>
                        </div>

                        <h3>Antes</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>1. Asegúrate que el área esté libre de corrientes de aire o cambios bruscos de <br>temperatura.</span><span></span></div>
                        </div>
                        <p>Con la finalidad de que no haya ráfagas de viento como el aire acondicionado, <br>
                        ventanas abiertas o el ventilador, que puedan afectar en la temperatura del <br>
                        peque.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>2. Área limpia, seca y libre de objetos que pongan en riesgo la seguridad del <br>peque:</span><span></span></div>
                        </div>
                        <p>Despeja el área y quita objetos que no sean funcionales durante el cambio.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>3. Coloca campos limpios</span><span></span></div>
                        </div>
                        <p>Esta será la barrera entre la superficie y nuestro peque.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>4. Coloca los implementos de limpieza, pañal y ropa, en orden y al alcance</span><span></span></div>
                        </div>
                        <p>Piensa qué necesitarás durante el cambió, en este momento es donde pondrás a <br>
                        la mano las toallitas húmedas (saca las toallitas suficientes y extiende las), el pañal <br>
                        (revisa si esté está en buenas condiciones), cambios de ropa, un bote de basura, <br>
                        pomada o crema.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>5. Realiza higiene de manos antes y después con agua y jabón.</span><span></span></div>
                        </div>
                        <p>Es importante lavar tus manos y las de tu peque antes y después de haber realizado <br>
                        el cambio de pañal, con la finalidad de quitar cualquier residuo que se haya <br>
                        quedado.</p>

                        <h3>Durante</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>6. Sitúa al peque en el área de cambio con un campo limpio.</span><span></span></div>
                        </div>
                        <p>Recuerda mantener el vínculo en todo momento y explicarle lo que está <br>
                        sucediendo, en este momento, las canciones pueden ser grandes herramientas.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>7. Descubre únicamente el área del pañal.</span><span></span></div>
                        </div>
                        <p>No es necesario quitarle toda la ropa, únicamente la parte de abajo lo que hará <br>
                        que la limpieza sea mucho más fácil.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>8. Limpia región genital, perianal y glúteos, de adelante hacia atrás.</span><span></span></div>
                        </div>
                        <p>Primero revisa si tiene pipí o popó, en caso de que tenga popo, puedes hacer un <br>
                        primer barrido de adelante hacia atrás para quitarle el exceso, para evitar que se <br>
                        expanda la popó.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>9. Limpieza en una peque</span><span></span></div>
                        </div>
                        <p>En el caso de las pequeñitas, al momento de limpiar la zona genital, NUNCA <br>
                        debemos generar fricción o introducir algún objeto, te puedes apoyar con una <br>
                        toallita y colocarla sobre su pelvis, de esta manera, podrás colocar tus dedos sobre <br>
                        la toallita y empujar hacia atrás de manera cuidadosa, para que se abran <br>
                        automáticamente los labios.</p>

                        <p>Para los peques, al momento de limpiar el pene, es como si limpiáramos el dedito <br>
                        de un lactante, de abajo hacia arriba, no te olvides de limpiar las bolsas escrotales, <br>
                        de adelante hacia atrás. Por último, en la limpieza de los glúteos, vamos a girar a <br>
                        nuestro peque y colocarlo de costado, para limpiar todo hacía atrás incluyendo la <br>
                        espalda si es que se ensució.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>10. En caso de requerir limpiar nuevamente, utiliza material de aseo nuevo y <br>limpio.</span><span></span></div>
                        </div>
                        <p>Para aseguramos de haber limpiado correctamente.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>11. Revisa que no queden residuos.</span><span></span></div>
                        </div>
                        <p>Es importante verificar siempre que la limpieza, haya sido la adecuada, esto <br>
                        ayudará a evitar infecciones u enfermedades.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>12. Coloca pañal limpio.</span><span></span></div>
                        </div>
                        <p>Recuerda no alzar sus piernitas al momento de colocarle el pañal, ya que <br>
                        recargaríamos todo su peso en la cabecita, en lugar de ello, vamos a girar al peque <br>
                        como si durmiéramos a un maternal, colocamos el pañal y lo abrochamos de <br>
                        manera diagonal como si fuera una “V”. Verifica que esté bien colocado, que no <br>
                        le apriete, pero tampoco esté flojito. Si en este punto queda como una bolsita, es <br>
                        necesario colocarlo correctamente.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>13. Viste al peque prenda por prenda.</span><span></span></div>
                        </div>
                        <p>Asegurándote que toda quede colocada de manera correcta.</p>

                        <h3>Después</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>14. Integra al peque nuevamente a las actividades al finalizar el cambio de <br>pañal.</span><span></span></div>
                        </div>
                        <p>En este momento, generamos la limpieza del espacio, guardando los elementos <br>
                        que ocupamos, etc. También hacemos el lavado de manos.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>15. Cuida la integridad física y emocional del peque en todo momento.</span><span></span></div>
                        </div>
                        <p>Esta integridad se cuida cuando no somos bruscas, no hacemos expresiones <br>
                        inadecuadas y los tratamos con amor y respeto. Así como validando sus emociones <br>
                        en todo momento, si el peque llora durante algún paso del cambio de pañal es <br>
                        porque algo lo hizo sentir incómodo y no generamos correctamente el vínculo, si <br>
                        esto pasa, debemos pausar, calmarlo y empezar a conectar nuevamente para <br>
                        retomar el cambio.</p>

                        <p>Con estos 15 pasos reafirmamos la importancia de realizar cada cambio de pañal <br>
                        con atención, respeto, cuidado y amor. Sabemos que nuestra labor implica <br>
                        múltiples responsabilidades y ritmos distintos cada día, por lo que contar con una <br>
                        guía clara puede facilitar nuestro trabajo y asegurar el bienestar de los pequeños.</p>

                        <h3>Referencias</h3>
                        <p>Formato estándar de competencia (s.f) Prestación de servicios para la atención, <br>
                        cuidado y desarrollo integral de las niñas y los niños en Centros de Atención Infantil <br>
                        pp- 1-18 http://excela.com.mx/pdf/ec0435.pdf</p>
                    `
                },

                {
                    id: 39,
                    titulo: "🗣️ Cada palabra es un puente: lo que impulsa (y frena) el desarrollo del habla en tu peque",
                    resumen: "El lenguaje no aparece “de golpe”: se construye día a día con miradas, juegos, conversaciones y seguridad emocional. Esta guía te ayuda a entender los factores que influyen en el habla, reconocer señales de alerta a tiempo y aplicar estrategias simples en la rutina para acompañar el proceso con paciencia y amor.",
                    imagen: "assets/img/articulos/39.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                        <h3>Factores que influyen en el desarrollo del habla</h3>

                        <p>El desarrollo del lenguaje en los peques comienza desde que nacen, se construye a través de la interacción y crece gracias a cada palabra, gesto y juego compartido. Cada peque tiene su propio ritmo, pero hay factores que influyen en cómo y cuándo aparecen los sonidos, las primeras palabras y las frases.</p>

                        <h3>¿Qué es el desarrollo del habla y el lenguaje?</h3>
                        <p>El habla es la producción de sonidos y palabras; el lenguaje incluye no solo hablar, sino también comprender lo que se escucha o se lee, usar palabras, estructurar frases y comunicarse con intención, ambos se apoyan en experiencias tempranas y en el entorno del peque.</p>

                        <div class="reading-note">
                        <p><strong>Factores principales que influyen en el desarrollo del habla</strong></p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>1.</strong></span><span><strong>Entorno lingüístico y variado</strong></span></div>
                        </div>
                        <p>Los peques necesitan escuchar y participar en conversaciones con adultos y otras personas importantes. Cuanto más modelado lingüístico tienen (palabras dirigidas a ellos, respuestas a sus sonidos, narración de actividades), más oportunidades tienen para desarrollar su vocabulario y comprensión del lenguaje.</p>
                        <div class="reading-note">
                        <p><strong>Tip:</strong> Recuerda mantener la comunicación con tu peque en cada momento de su rutina, ya que, esto potencia el reconocimiento de sonidos y palabras.</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>2.</strong></span><span><strong>Audición saludable</strong></span></div>
                        </div>
                        <p>Para aprender a hablar, es esencial escuchar primero, si hay infección recurrente de oído o pérdida auditiva, el peque podría no discriminar bien los sonidos del habla, lo cual retrasa la producción verbal.</p>
                        <div class="reading-note">
                        <p><strong>Tip:</strong> Si sospechas que el peque no oye bien (no reacciona a sonidos fuertes o no responde a su nombre con frecuencia), consulta con el pediatra o con un especialista en audición.</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>3.</strong></span><span><strong>Capacidades neurológicas y cognitivas</strong></span></div>
                        </div>
                        <p>El cerebro del peque está en desarrollo continuo; la memoria, atención y percepción juegan un papel importante para que pueda procesar, retener y usar nuevas palabras.</p>
                        <div class="reading-note">
                        <p><strong>Tip pedagógico:</strong> Juegos de atención (mirar, señalar, repetir) ayudan a fortalecer estas habilidades y promueven el uso del lenguaje.</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>4.</strong></span><span><strong>Interacción social</strong></span></div>
                        </div>
                        <p>Hablar no se aprende sólo escuchando, sino usándolo para relacionarse: pedir, preguntar, emocionarse y jugar.</p>
                        <div class="reading-note">
                        <p><strong>Tip:</strong> Organiza pequeñas “conversaciones” durante el día: pregunta “¿qué ves?”, espera la respuesta del peque (aunque sea un sonido), y responde tú también</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>5.</strong></span><span><strong>Estímulos lúdicos y educativos</strong></span></div>
                        </div>
                        <p>Actividades como leer cuentos, cantar canciones, jugar con sonidos-rimas, y usar gestos o señas cuando no se tiene el vocabulario completo ayudan al peque a comprender la relación entre sonidos y significados.</p>
                        <div class="reading-note">
                        <p><strong>Tip:</strong> Usa rimas simples y juegos de imitación de sonidos (como “bzz bzz” para la abeja).</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>6.</strong></span><span><strong>Apoyo emocional y paciencia</strong></span></div>
                        </div>
                        <p>Cada peque tiene su propio ritmo. Fomentar la confianza, responder con cariño y evitar presionar para “hacer hablar” puede dar al niño seguridad para expresarse cuando esté listo.</p>

                        <h3>Hitos generales del lenguaje.</h3>
                        <p>Los hitos ayudan como guía, pero recuerda, cada peque es único.</p>

                        <div class="reading-note">
                        <p>En el primer año, los peques pasan de balbucear a entender palabras simples; para los 2 años suelen decir combinaciones de palabras y para los 3 años su vocabulario y comprensión se expanden rápidamente.</p>
                        </div>

                        <h3>¿Cuándo podría ser útil consultar a un especialista?</h3>
                        <p>Existen algunas señales de alerta que pueden indicar que el peque necesita una evaluación profesional:</p>

                        <div class="reading-note">
                        <p><strong>Consulta con un profesional si:</strong></p>
                        <ul>
                            <li>A los 12–16 meses aún no hay balbuceo o intentos de comunicarse de forma consistente.</li>
                            <li>A los 18–24 meses, el vocabulario es muy escaso o el peque no combina dos palabras.</li>
                            <li>Entiende menos de lo esperado para su edad o parece tener dificultad con instrucciones simples.</li>
                            <li>Hay retrocesos en lo que ya había aprendido o dificultad con la interacción social.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <p><strong>Puedes consultar a un:</strong></p>
                        <ul>
                            <li>Pediatra, para descartar problemas de audición o salud general.</li>
                            <li>Fonoaudiólogo / logopeda, profesional especializado en evaluación del habla y lenguaje.</li>
                            <li>Especialista en desarrollo infantil, si hay preocupaciones más amplias.</li>
                        </ul>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Estrategias prácticas Estimulación en actividades diarias</strong></span></div>
                        </div>
                        <ul>
                        <li>Nombra lo que haces: “Vamos a poner tus zapatos”.</li>
                        <li>Usa frases completas incluso si el peque usa palabras simples.</li>
                        <li>Celebra cada intento de comunicación con entusiasmo y atención.</li>
                        </ul>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Uso de cuentos y juegos</strong></span></div>
                        </div>
                        <ul>
                        <li>Leer libros con ilustraciones.</li>
                        <li>Jugar con adivinanzas y rimas.</li>
                        <li>Repetir sonidos de animales o palabras divertidas.</li>
                        </ul>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Expansión del lenguaje</strong></span></div>
                        </div>
                        <ul>
                        <li>Si el peque dice “agua”, responde “Sí, agua fría para beber”.</li>
                        <li>Añade palabras a lo que dice: esto refuerza la estructura y vocabulario.</li>
                        <li>Juegos de roles (cocina, tienda, médico) ayudan a practicar el vocabulario en contextos familiares</li>
                        </ul>

                        <h3>Referencias</h3>
                        <p>NIDCD. (2017). Etapas del desarrollo del habla y del lenguaje (NIH). https://www.nidcd.nih.gov/es/espanol/etapas-del-desarrollo-del-habla-y￾el-lenguaje?utm_source</p>
                        <p>ChildMind.org. (s. f.). Guía para padres sobre hitos del desarrollo. https://childmind.org/es/guia/guia-para-padres-sobre-hitos-del￾desarrollo/?utm_source</p>
                        <p>Hunter Magazine. (s. f.). Cómo abordar las preocupaciones sobre el desarrollo del habla y el lenguaje. https://www.huntermagazine.es/como￾abordar-las-preocupaciones-sobre-el-desarrollo-del-habla-y-el￾lenguaje/7517/?utm_source</p>
                        <p>Linguistica.gea.lat. (s. f.). Estimulando el lenguaje infantil: consejos y técnicas eficaces.https://linguistica.gea.lat/estimulando-el-lenguaje-infantil￾consejos-y-tecnicas-eficaces/?utm_source</p>
                    `
                },

                {
                    id: 40,
                    titulo: "💞 Cuando no logramos conectar: claves para cuidar el vínculo con su peque (sin culpas y con paciencia)",
                    resumen: "A veces, aunque haya amor, la conexión no se siente inmediata… y eso puede doler. Este texto le acompaña a entender por qué pasa, cómo entrar con respeto a su mundo emocional y qué hacer para construir un vínculo seguro, genuino y amoroso paso a paso.",
                    imagen: "assets/img/articulos/28.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <h1 style="font-size:32px;line-height:1.15;margin:10px 0 14px 0;">Factores que interfieren el vínculo con mi peque</h1>

                        <p>A veces, aunque pongamos todo nuestro cariño, sentimos que no logramos 
                        conectar con nuestro peque, puede que no quiera jugar con nosotros, que se 
                        muestre distante, serio, enojado o simplemente indiferente. Esto puede generar 
                        frustración, culpa o dudas, especialmente en nosotras deseamos crear un vínculo 
                        cercano y amoroso.</p>

                        <p>Sin embargo, es importante recordar que la conexión emocional se construye, no 
                        aparece de inmediato, cada peque tiene su propio ritmo, su personalidad y su 
                        historia emocional.</p>

                        <h3>¿Por qué a veces no logramos conectar con un peque?</h3>

                        <p>Existen muchas razones por las que un peque puede mostrarse distante o poco 
                        dispuesto a vincularse como:</p>

                        <div class="reading-note">
                        <p><strong>1. Cambios emocionales o familiares</strong><br>
                        Los peques son muy sensibles a los cambios como mudanzas, separaciones, 
                        llegada de un nuevo hermano, cambios de cuidador o conflictos familiares pueden 
                        hacer que se cierren emocionalmente.</p>

                        <p><strong>2. No sentirse en confianza contigo</strong><br>
                        La confianza no se construye en un día, para muchos peques, especialmente los 
                        más sensibles, conocer a una persona nueva puede generar ansiedad, es 
                        importante señalar que antes de abrirse a un vínculo emocional se debe generar 
                        seguridad emocional, generado desde la confianza, el respeto y afecto genuino.</p>

                        <p><strong>3. No sabe expresar lo que siente</strong><br>
                        Muchos peques no saben poner en palabras lo que les pasa. A veces se sienten 
                        tristes, enojados o confundidos, pero no saben explicarlo, así que lo expresan con 
                        conducta: rechazo, berrinches, silencio o evitación.</p>

                        <p><strong>4. Tener un temperamento más reservado</strong><br>
                        No todos los peques son extrovertidos, algunos son más observadores, tranquilos y 
                        necesitan más tiempo para confiar, esto no significa que no quieran cariño, solo 
                        que lo expresan de otra manera.</p>
                        </div>

                        <h3>¿Cómo empezar a conectar desde su mundo?</h3>

                        <p>Conectar con un peque no es forzarlo a querernos, sino entrar con respeto a su 
                        mundo emocional.</p>

                        <div class="reading-note">
                        <ul>
                            <li><strong>Conócelo antes de intentar jugar</strong><br>
                            Obsérvalo, mira qué le gusta, cómo se mueve, qué lo tranquiliza, qué le molesta, el 
                            interés genuino es el primer puente hacia la conexión. “veo que te gustan mucho 
                            los carritos.”, “te gusta mucho dibujar, ¿verdad?”. Con ello demostramos que los
                            conocemos y nos interesan sus gustos.</li>

                            <li><strong>Respeta su ritmo</strong><br>
                            No todos los peques quieren abrazos, juegos intensos o mucha conversación al 
                            principio, a veces solo quieren compañía silenciosa. Sentarte cerca, acompañarlo 
                            sin invadir su espacio, ya es una forma de conexión.</li>

                            <li><strong>Valida sus emociones</strong><br>
                            Cuando un peque se siente comprendido, comienza a abrir su corazón. Frases 
                            como: “veo que estás serio hoy.” “parece que te sientes cansado.” Ayudan a 
                            sentirse escuchados.</li>

                            <li><strong>Conecta a través del juego</strong><br>
                            El juego es el lenguaje natural de los peques, el jugar fortalece el vínculo emocional, 
                            la seguridad y la autoestima de los peques. No se trata de dirigir el juego, sino de 
                            compartirlo: Imitarlo, seguir sus reglas y disfrutar con él.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <p><strong> Sé constante</strong><br>
                        La conexión se construye con presencia, no con prisa, la constancia genera 
                        seguridad emocional, un peque necesita saber que puede contar contigo hoy, 
                        mañana y pasado mañana.</p>

                        <p>A veces los peques no rechazan a la persona, sino la situación que están viviendo, 
                        tu paciencia, respeto y cariño pueden marcar una gran diferencia en su vida 
                        emocional. No te desanimes si no conecta contigo de inmediato, estás sembrando
                        el vínculo emocional que será la base de su amistad, cuando un peque se siente 
                        visto, escuchado y amado, florece recuerda que cada peque necesita su propio 
                        tiempo para confiar.</p>
                        </div>

                        <h3>Referencias</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>UNICEF. (s. f.).</span> <span>Por qué el juego refuerza la salud mental de tus hijos e hijas. UNICEF. Recuperado de: https://www.unicef.org/parenting/es/desarrollo-infantil/por-que￾juego-refuerza-salud-mental-de-tu-hijo</span></div>
                        <div class="rt-row"><span>Santos, María. (2025).</span> <span>El juego como mediador del vínculo afectivo en padres e hijos en movilidad humana. Revista INFAD de Psicología. Vol 1 (1) Recuperado de https://revista.infad.eu/index.php/IJODAEP/article/view/2824</span></div>
                        <div class="rt-row"><span>Formación Activa en Pediatría de Atención primaria. (2019).</span> <span>Desarrollo infantil y apego. Vol 12 (3). Recuperado de https://fapap.es/articulo/527/desarrollo-infantil￾y-apego</span></div>
                        </div>
                    `
                },

                {
                    id: 41,
                    titulo: "📚 Aprender a leer jugando: 23 ideas para que tu peque se enamore de las letras",
                    resumen: "A veces lo que tu peque necesita no es presión… es juego. Aquí tienes actividades simples, divertidas y súper efectivas para que reconozca letras, sílabas y palabras con emoción, confianza y mucha risa en casa.",
                    imagen: "assets/img/articulos/41.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Juegos para aprender a leer:</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">🎈 Letras con alegría</strong>
                        <p style="margin:10px 0 0 0;">Jugar es una de las formas más bonitas de aprender. Estos juegos ayudan a los peques a reconocer letras, sílabas y palabras de manera dinámica, sin tensión y con mucha motivación.</p>
                        </div>

                        <div class="reading-table" style="padding:18px; border-radius:20px;">
                        <div class="rt-row"><span><strong>1. Veo, veo</strong></span><span>👀</span></div>
                        <p style="margin:12px 0 18px 0;">Un clásico entre los clásicos, el veo, veo, es perfecto para que los peques 
                        identifiquen la letra y los sonidos. Una de sus ventajas es que se puede practicar en 
                        cualquier lugar, sin necesidad de nada más que ganas e imaginación.</p>

                        <div class="rt-row"><span><strong>2. Sopas de letras</strong></span><span>🧩</span></div>
                        <p style="margin:12px 0 18px 0;">Este pasatiempo tradicional es un juego fantástico para que los niños aprendan a 
                        leer. Las palabras suelen estar en mayúsculas, algo más fácil si son primeros 
                        lectores, y las pueden tener escritas para reconocerlas. Puedes preparar las sopas 
                        de letras en casa o buscar recursos online. Además, las palabras te darán pie a 
                        explicar significados y mejorar su vocabulario.</p>

                        <div class="rt-row"><span><strong>3. Crucigramas</strong></span><span>✍️</span></div>
                        <p style="margin:12px 0 18px 0;">Los crucigramas, al igual que ocurre con las sopas de letras, ayudan a niños a 
                        ampliar su vocabulario. Como para adivinar las palabras han de leer las 
                        definiciones, les resultará más fácil entender su significado. Para empezar, busca 
                        crucigramas fáciles, con pocas palabras, y ve adaptándolos a las capacidades de 
                        tu peque.</p>

                        <div class="rt-row"><span><strong>4. Tarjetas con sílabas</strong></span><span>🟣</span></div>
                        <p style="margin:12px 0 18px 0;">Con cartulina, prepara tarjetas con diferentes sílabas. Para hacerlas más atractivas 
                        para los peques, decóralas: emplea diferentes colores, purpurina y todo aquello 
                        que creas que puede gustarles. Después, jueguen con las tarjetas a formar 
                        palabras. Lo bueno que tiene este juego es que pueden llevarlo a cualquier parte.</p>

                        <div class="rt-row"><span><strong>5. Tarjetas con letras</strong></span><span>🔤</span></div>
                        <p style="margin:12px 0 18px 0;">El mismo juego anterior se puede componer con letras en vez de con sílabas. Tienes 
                        dos opciones para hacerlo: puedes comprar el alfabeto ya hecho (en madera, 
                        fichas, o incluso para la bañera) o preparar las tarjetas. Esta última es un dos por 
                        uno, porque, además, pasarán un rato muy divertido haciendo manualidades.</p>

                        <div class="rt-row"><span><strong>6. Cadena de palabras</strong></span><span>🔁</span></div>
                        <p style="margin:12px 0 18px 0;">Es otro de esos juegos de toda la vida. Quien empieza debe decir una palabra y el 
                        que continúa ha de decir otra que comience por la última sílaba de la anterior. Así 
                        hasta que alguien falle o repita palabra.</p>

                        <div class="rt-row"><span><strong>7. El ahorcado</strong></span><span>🎯</span></div>
                        <p style="margin:12px 0 8px 0;">¿Quién no ha jugado al ahorcado en su infancia? Ya sabes cómo va: una raya por 
                        cada letra de la palabra y un ahorcado que se va componiendo con cada fallo. 
                        Comienza con palabras sencillas, con pocas letras, y aumenta la dificultad 
                        conforme el peque avance.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Más juegos para reforzar lectura y conciencia fonológica</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p><strong>8. Identifica partes de la palabra</strong><br>
                        En un papel, escribe diferentes palabras y pide al niño o niña que marque las que 
                        contengan una letra o sílabas concretas. Es un juego estupendo para que vaya 
                        reconociendo las grafías.</p>

                        <p><strong>9. Moldea la letra con plastilina</strong><br>
                        La plastilina es un material muy versátil que suele gustar mucho a los peques. En 
                        este caso la van a emplear para dar forma a las letras. Puedes ser tú quien le 
                        proponga la letra o puede elegir una al azar.</p>

                        <p><strong>10. El coleccionista de palabras</strong><br>
                        Solo necesitarás papel, lápiz y un reloj de arena. Elige una letra al azar y propón a 
                        los peques que escriban todas las palabras que se les ocurra con esa letra.</p>

                        <p><strong>11. Scattergories</strong><br>
                        En este famoso juego hay que escribir palabras que empiecen con una letra 
                        elegida al azar, dentro de unas categorías propuestas. Para los peques que están 
                        aprendiendo a leer, prueba la versión casera adaptada. Haz unas categorías más 
                        sencillas (dibujo animado, deporte, juego, familiar, etc.) y dale un poco más de 
                        tiempo.</p>

                        <p><strong>12. Una sílaba, una palmada</strong><br>
                        Este tipo de juego ayuda a los peques a diferenciar las partes de la palabra. Con 
                        una letanía se va cantando una canción, que se acompaña de una palmada 
                        por cada sílaba.</p>

                        <p><strong>13. Listas de palabras que rimen</strong><br>
                        Hacer estas listas ayudará a los peques a tomar conciencia fonológica. Proponles 
                        la primera y ¡a rimar!</p>

                        <p><strong>14. Formar letras con el cuerpo</strong><br>
                        Este juego da la posibilidad de jugar por equipos si hay varios niños, de forma que 
                        también desarrollarán el trabajo en equipo y la resolución de conflictos. Un adulto 
                        u otro niño o niña que ejerza de juez propone una letra y cada equipo ha de 
                        cooperar para formarla, con los cuerpos de todos, lo antes posible.</p>

                        <p><strong>15. Canta y rellena los huecos</strong><br>
                        Escribe un fragmento de una canción infantil, pero deja algunas palabras sin 
                        rellenar. Después de escuchar la canción, serán los niños quienes tengan que 
                        escribir las palabras que van en los huecos.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Juegos dinámicos con sílabas, palabras y letras</h3>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>16. Reloj silábico</strong></span><span>🕒</span></div>
                        <p style="margin:12px 0 18px 0;">Junto con tu peque hagan un reloj donde en lugar de números vayan sílabas, 
                        pídele que una vez hecho gire la manecilla del reloj y vaya formando palabras 
                        con las sílabas que le salgan.</p>

                        <div class="rt-row"><span><strong>17. Fichas silábicas</strong></span><span>🎲</span></div>
                        <p style="margin:12px 0 18px 0;">Con ayuda de un dado, y una tarjeta con sílabas e imágenes, el pequeño lanzará 
                        el dado y dependiendo el número que le salga tendrá que decir que sílaba le tocó 
                        al igual que las imágenes que corresponden a dicha sílaba.</p>

                        <div class="rt-row"><span><strong>18. Avión silábico</strong></span><span>🛫</span></div>
                        <p style="margin:12px 0 18px 0;">Se colocarán hojas con sílabas formando el juego del "avión", el peque deberá 
                        lanzar un dado y dependiendo la sílaba que le salga brincará hacia ella.</p>

                        <div class="rt-row"><span><strong>19. Armando palabras</strong></span><span>🥤</span></div>
                        <p style="margin:12px 0 18px 0;">Se le darán al peque unos vasos móviles con diferentes sílabas, la nanny le 
                        mostrará algunas palabras, las cuales el tendrá que formar con los vasos.</p>

                        <div class="rt-row"><span><strong>20. Código de colores</strong></span><span>🎨</span></div>
                        <p style="margin:12px 0 18px 0;">Se le dará al pequeño una hoja, la cual tendrá escritas letras simbolizadas con un 
                        color, el pequeño tendrá que formar la palabra dependiendo el código de colores 
                        que la nanny le enseñe.</p>

                        <div class="rt-row"><span><strong>21. Dominó de sílabas</strong></span><span>🀄</span></div>
                        <p style="margin:12px 0 18px 0;">El dominó puedes hacerlo junto con tu peque con ayuda de hojas, plumones, 
                        stickers, etc., de esta manera aprovechan para reforzar su motricidad fina y 
                        creatividad mientras repasan las sílabas que necesitan reforzar.</p>

                        <div class="rt-row"><span><strong>22. El cazador de letras</strong></span><span>🕵️</span></div>
                        <p style="margin:12px 0 18px 0;">Escribe varias palabras en una hoja, con colores llamativos. Luego, nombras a tu 
                        peque 'cazador de letras'. Él tendrá que reconocer y rodear con un rotulador la 
                        letra que pidas. Por ejemplo, si le pides que cace la letra 'R', tendrá que buscar 
                        entre todas las palabras que escribiste en la hoja y rodear solo las 'R' que 
                        encuentre. Luego, cambien de color y pídele que busque otra letra.</p>

                        <div class="rt-row"><span><strong>23. Círculo o cuadrado</strong></span><span>⭕⬜</span></div>
                        <p style="margin:12px 0 18px 0;">Para enseñar a tu peque que algunas palabras se escriben con minúscula y otras 
                        empiezan con mayúscula, puedes usar el juego del círculo y el cuadrado. Sobre 
                        un texto corto y sencillo, pídele que rodee con un círculo las palabras que 
                        comienzan con minúscula y que encierre en un cuadrado aquellas que empiezan 
                        con mayúscula. Puedes usar diferentes colores para círculos y cuadrados.</p>

                        <p style="margin-top:10px;">Página con juegos dinámicos y divertidos que ayudan a los peques a 
                        aprender: https://arbolabc.com/lectores-emergentes/silibas-encantadas</p>
                        </div>

                        <h3 style="margin-top:26px;">Referencias:</h3>
                        <p>Esteban, E. (27 de mayo de 2022). 14 juegos para enseñar a leer a los niños. Guía 
                        Infantil. Disponible en: https://www.guiainfantil.com/educacion/lectura/14-
                        juegos-para ensenar-a-leer-a-los-ninos/</p>

                        <p>Superpoderes Arnidol. (26 de febrero de 2020). 15 juegos para aprender a leer y 
                        disfrutar en familia. Los superpoderes de Arnidol Disponible 
                        en: https://www.arnidol.com/es/juegos-aprender-leer/</p>

                    </div>
                    `
                },

                {
                    id: 42,
                    titulo: "🌟 Independencia en los peques: acompañar con amor para que se sientan capaces",
                    resumen: "La autonomía no nace de la presión, sino de la confianza. Este artículo le muestra cómo guiar a su peque con rutinas, opciones y acompañamiento respetuoso para que crezca seguro, valiente y cada vez más independiente.",
                    imagen: "assets/img/articulos/42.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/31.jpg')"></div>

                        <div class="reading-note" style="margin-top:0;">
                        <strong>Independencia en los peques</strong>
                        </div>

                        <p>Es posible que como Nannys queramos ayudar a nuestros peques lo más que se pueda, sin embargo, al paso del tiempo, ellos van creciendo y van requiriendo nuestra ayuda en menor cantidad, esto no significa que debamos desatenderlos, más bien, debemos estar presentes en todo momento y guiarlos si necesitan ayuda especial, etc., pero intentando siempre desarrollar su autonomía, ya que, los niños están en la búsqueda de la independencia desde el momento en que nacen. Podemos ver esto cuando los bebés intentan alimentarse con una cuchara o insisten en quitarse sus propios pañales, y cuando los niños entre 1 y 4 años exigen vestirse solos o abrir la llave del lavamanos.</p>

                        <p>A medida que los peques experimentan estas rutinas una y otra vez, aprenden a anticipar lo que viene después y comienzan a asumir más responsabilidad con menos ayuda. Si permites que tu peque haga algunos de los trabajos de preparación, como poner la pasta de dientes en el cepillo de dientes o encontrar su suéter y zapatos, cada vez hará más pasos por su cuenta, mientras le comunicas que tienes confianza en su capacidad para realizar estos pasos sin tu ayuda, pero a la vez que estás allí para ayudarlo si lo necesita.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Establece rutinas predecibles:</strong> Puede parecer sorprendente, pero establecer una rutina constante es importante para fomentar la independencia. Al igual que los adultos, cuando los peques pueden anticipar su día, están mejor equipados para asumir responsabilidades. Una rutina no debe confundirse con un horario, ya que, la primera es cualquier secuencia de eventos que ocurre durante el día. Incluso el acto de cepillarse los dientes es una rutina, ya que tiene múltiples pasos que siempre van en el mismo orden: abrir la llave del agua, enjuagar el cepillo de dientes, ponerle pasta de dientes, cepillarse, enjuagarse, secarse las manos y la boca.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Permite que el peque elija:</strong> Otra forma de apoyar la independencia de los peques es darle opciones. Inclúyelo en la decisión de qué ropa ponerse, qué jugar o a quién llamar. Esto no significa que tenga rienda suelta. ¡Proporcione dos o tres opciones y luego elogia su gran habilidad para tomar una decisión!</span>
                        </div>
                        </div>

                        <p>Dar opciones es especialmente valioso cuando un peque en edad preescolar insiste en hacer algo a su manera. Por ejemplo, es posible que quiera cruzar la calle solo, lo que tal vez sea algo que no puede hacer todavía. Al ofrecer una opción, sostener su mano o que usted lo cargue, puede sentirse empoderado al tiempo que lo mantienes seguro, ¿En qué otro tipo de situaciones puedes darle opciones a tu peque? Por ejemplo; ¿Quieres guardar los juguetes saltando, o cantando?, ¿Prefieres tomar tu leche en vaso o en tasa?, ¿El día de hoy prefieres short o pantalón?, etc.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Permite que el peque te ayude:</strong> ¡A los peques les encanta ayudar! Además de desarrollar independencia, esta es una gran herramienta para calmar los berrinches o redirigir el comportamiento al darles una sensación de control. Cuando permites que tu peque ayude, fomentas su confianza y le das la oportunidad de aprender algo nuevo. Si bien esto puede implicar agregar un paso adicional o dos, también es una excelente manera de involucrar al peque en las rutinas y actividades diarias. Finalmente, recuerda que permitir que un niño ayude es experimentar el sentimiento de sentirse útil y valioso para alguien más.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Asigna tareas a tu peque:</strong> Tareas simples como recoger juguetes o poner la ropa en el cesto permiten a tu peque tener una responsabilidad razonable y lo ayuda a mantener la estructura durante todo el día. De hecho, estas tareas pueden integrarse en sus rutinas diarias. Por ejemplo, parte de la rutina de las comidas de tu peque puede incluir llevar su plato al fregadero.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Permita que tu peque resuelva problemas:</strong> Asegúrate de dejar que tu peque intente cosas difíciles y que resuelva problemas (pequeños) por su cuenta. Cuando los peques están aprendiendo a ponerse los zapatos, debemos permitirles que se los pongan en los pies equivocados. Espera hasta que tu peque pida ayuda o dé alguna señal.</span>
                        </div>
                        </div>

                        <p>Presentar a tu peque tareas que son un poco desafiantes, pero que aún están dentro del ámbito de lo que pueden hacer con algo de apoyo, los ayuda a aprender a lidiar con la frustración, resolver problemas y superar situaciones desafiantes. Tú puedes reconocer cuando algo está difícil y hacerle saber que estás orgulloso de él felicitándolo por probar cosas nuevas o difíciles. Sin embargo, asegúrate de celebrar el esfuerzo en lugar del resultado o la habilidad: “Estoy muy orgullosa de ti por seguir con eso, aunque se haya sido difícil”, en lugar de “¡eres tan bueno para ponerte los zapatos!”.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Fomente que se involucren en proyectos:</strong> Los proyectos, que pueden incluir cualquier cosa, desde colorear hasta construir, desde rompecabezas hasta manualidades, brindan oportunidades para que los peques pongan toda su atención en una actividad específica durante un período de tiempo. Comentar y elogiar el trabajo de tu peque le dará una sensación de logro y autoestima, y celebrar el esfuerzo ayuda con el desarrollo de la determinación.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1;"><strong>Cultivar el juego libre:</strong> El juego independiente y no estructurado es muy importante para fomentar la creatividad, la solución de problemas y la autonomía.</span>
                        </div>
                        </div>

                        <p>Ofrece a tu peque una variedad de materiales de arte (crayones, marcadores, tizas, pinturas para los dedos), materiales de construcción (bloques, Magna Tiles, Legos) o accesorios de juego imaginarios, y permítele construir su propia manualidad o juego. También puede incluir materiales que no sean juguetes.</p>

                        <p>Los materiales reutilizables y los reciclables, como los rollos de toallas de papel, las latas de café y las cajas de cereales se pueden usar de maneras infinitas. Un rollo de toallas de papel puede ser un telescopio, un tubo, un automóvil, un avión, una varita mágica. Una caja de cereal puede ser un granero para animales, un bloque de construcción o un peldaño.</p>

                        <div class="reading-note">
                        <strong>Qué decir mientras trabajan y juegan:</strong>
                        <p style="margin:12px 0 0 0;">Además de crear oportunidades para que tu peque desarrolle su independencia, es importante que les hagas saber lo que ves: sus esfuerzos, su persistencia, su valentía, su crecimiento.</p>
                        </div>

                        <p>Lo que llamamos las habilidades “P–R–I–D–E” (por sus siglas en inglés: Praise (Elogiar): Reflect (actuar como Reflejo), Imítate (Imitar), Describe (Describir), be Enthusiastic (ser Entusiasta) son estrategias que han demostrado ayudar a aumentar los comportamientos positivos en niños pequeños:</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">ELOGIAR:</span>
                            <span style="flex:1; text-align:right;">Elogia el comportamiento apropiado de tu peque. Esto ayuda a aumentar el comportamiento específico que está abordando y contribuye a una interacción cálida con tu peque. Por ejemplo, “¡Qué buen trabajo hiciste alineando esos bloques!”, o “¡estoy orgulloso de ti por seguir con ese rompecabezas!”.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">Actuar como REFLEJO:</span>
                            <span style="flex:1; text-align:right;">Sé un espejo del discurso adecuado. Esto ayuda a demostrar a tu peque que está escuchando y comprendiendo. Por ejemplo, tu peque dice: “Hice una torre”. Y luego tú dices: “¡Hiciste una torre!”.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">IMITAR:</span>
                            <span style="flex:1; text-align:right;">Es bueno que imite los comportamientos y juegos apropiados. Esto brinda atención positiva (la recompensa más poderosa) al buen comportamiento y promueve la cooperación. Por ejemplo, cuando tu peque construye una torre, tú también comienza a apilar bloques.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">DESCRIBIR:</span>
                            <span style="flex:1; text-align:right;">Describe el comportamiento apropiado de tu peque. Esto refuerza el juego positivo y atrae tu atención hacia él. Podrías decirle: “¡Veo que dibujaste un arco iris!”, o “estamos construyendo una torre juntos”.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">¡Sé ENTUSIASTA!</span>
                            <span style="flex:1; text-align:right;">Esto hace que sus interacciones se sientan más cálidas y mantiene a tu peque interesado. Por ejemplo, puedes usar una voz juguetona, exagerar tus emociones cuando habla y sonreír a menudo.</span>
                        </div>
                        </div>

                        <p>Finalmente, recuerda que el que un niño sea autónomo quiere decir que está en busca de su independencia, habla de un niño que se sabe lo suficientemente seguro para intentar las cosas por su propia cuenta, por lo que requerirá de alguien que le guie, celebre o este ahí si se equivoca para volver a tomar impulso.</p>

                        <h3 style="margin-top:28px;">Referencias:</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Baby Sparks. (4 de enero 2022). Cómo fomentar la independencia de tu niño en edad preescolar. Baby Sparks. Disponible en:</span>
                            <span style="text-align:right; word-break:break-word;">https://babysparks.com/es/2022/01/04/how-to-boost-independence in-your￾preschooler/</span>
                        </div>
                        <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Colegio Chimalistac. (25 de julio de 2019). 5 estrategias para fomentar autonomía e independencia en los niños. Colegio Chimalistac. Disponible en: https://blog.ecagrupoeducativo.mx/chimalistac/5-estrategias-para-fomentar￾autonomia-e independencia-en-los-ninos</span>
                        </div>
                        <div class="rt-row" style="gap:10px; align-items:flex-start; border-bottom:none;">
                            <span>Levine, A. y Philips, L. (21 de septiembre de 2022). Cómo desarrollar la independencia en niños de preescolar. Child Mind Institute. Disponible en: https://childmind.org/es/articulo/como desarrollar-la-independencia-en-los-ninos￾de-preescolar/</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 43,
                    titulo: "🫶 Cambio de pañal con amor: una guía clara para cuidar, conectar y proteger en cada paso",
                    resumen: "Un cambio de pañal no es solo higiene: es vínculo, respeto y seguridad. Esta guía práctica reúne 15 pasos esenciales para que cada cambio sea cómodo, ordenado y siempre cuidando la integridad física y emocional del peque.",
                    imagen: "assets/img/articulos/43.jpg",
                    categoria: "Extras",
                    contenido: `
                        <h1>Guía para el cambio de pañal</h1>

                        <p>Elaboramos esta guía práctica con los 15 pasos esenciales para el cambio de <br>
                        pañal, nuestro objetivo es acompañarte y ayudarte a que cada cambio sea seguro <br>
                        cómodo y propiciando siempre el cuidado de los peques.</p>

                        <div class="reading-note">
                        <strong>Puntos importantes que considerar:</strong>
                        <ul>
                            <li>Pregúntale a la familia en donde puedes llevar a cabo este cambio y si este <br>
                            lo realizarás con la puerta abierta o cerrada.</li>
                            <li>Manten el vínculo con él peque, explícale lo que realizarás y siempre mantén <br>
                            la comunicación con el/ella.</li>
                        </ul>
                        </div>

                        <h3>Antes</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>1. Asegúrate que el área esté libre de corrientes de aire o cambios bruscos de <br>temperatura.</b></span><span></span></div>
                        </div>
                        <p>Con la finalidad de que no haya ráfagas de viento como el aire acondicionado, <br>
                        ventanas abiertas o el ventilador, que puedan afectar en la temperatura del <br>
                        peque.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>2. Área limpia, seca y libre de objetos que pongan en riesgo la seguridad del <br>peque:</b></span><span></span></div>
                        </div>
                        <p>Despeja el área y quita objetos que no sean funcionales durante el cambio.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>3. Coloca campos limpios</b></span><span></span></div>
                        </div>
                        <p>Esta será la barrera entre la superficie y nuestro peque.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>4. Coloca los implementos de limpieza, pañal y ropa, en orden y al alcance</b></span><span></span></div>
                        </div>
                        <p>Piensa qué necesitarás durante el cambió, en este momento es donde pondrás a <br>
                        la mano las toallitas húmedas (saca las toallitas suficientes y extiende las), el pañal <br>
                        (revisa si esté está en buenas condiciones), cambios de ropa, un bote de basura, <br>
                        pomada o crema.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>5. Realiza higiene de manos antes y después con agua y jabón.</b></span><span></span></div>
                        </div>
                        <p>Es importante lavar tus manos y las de tu peque antes y después de haber realizado <br>
                        el cambio de pañal, con la finalidad de quitar cualquier residuo que se haya <br>
                        quedado.</p>

                        <h3>Durante</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>6. Sitúa al peque en el área de cambio con un campo limpio.</b></span><span></span></div>
                        </div>
                        <p>Recuerda mantener el vínculo en todo momento y explicarle lo que está <br>
                        sucediendo, en este momento, las canciones pueden ser grandes herramientas.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>7. Descubre únicamente el área del pañal.</b></span><span></span></div>
                        </div>
                        <p>No es necesario quitarle toda la ropa, únicamente la parte de abajo lo que hará <br>
                        que la limpieza sea mucho más fácil.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>8. Limpia región genital, perianal y glúteos, de adelante hacia atrás.</b></span><span></span></div>
                        </div>
                        <p>Primero revisa si tiene pipí o popó, en caso de que tenga popo, puedes hacer un <br>
                        primer barrido de adelante hacia atrás para quitarle el exceso, para evitar que se <br>
                        expanda la popó.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>9. Limpieza en una peque</b></span><span></span></div>
                        </div>
                        <p>En el caso de las pequeñitas, al momento de limpiar la zona genital, NUNCA <br>
                        debemos generar fricción o introducir algún objeto, te puedes apoyar con una <br>
                        toallita y colocarla sobre su pelvis, de esta manera, podrás colocar tus dedos sobre <br>
                        la toallita y empujar hacia atrás de manera cuidadosa, para que se abran <br>
                        automáticamente los labios.</p>

                        <p>Para los peques, al momento de limpiar el pene, es como si limpiáramos el dedito <br>
                        de un lactante, de abajo hacia arriba, no te olvides de limpiar las bolsas escrotales, <br>
                        de adelante hacia atrás. Por último, en la limpieza de los glúteos, vamos a girar a <br>
                        nuestro peque y colocarlo de costado, para limpiar todo hacía atrás incluyendo la <br>
                        espalda si es que se ensució.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>10. En caso de requerir limpiar nuevamente, utiliza material de aseo nuevo y <br>limpio.</b></span><span></span></div>
                        </div>
                        <p>Para aseguramos de haber limpiado correctamente.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>11. Revisa que no queden residuos.</b></span><span></span></div>
                        </div>
                        <p>Es importante verificar siempre que la limpieza, haya sido la adecuada, esto <br>
                        ayudará a evitar infecciones u enfermedades.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>12. Coloca pañal limpio.</b></span><span></span></div>
                        </div>
                        <p>Recuerda no alzar sus piernitas al momento de colocarle el pañal, ya que <br>
                        recargaríamos todo su peso en la cabecita, en lugar de ello, vamos a girar al peque <br>
                        como si durmiéramos a un maternal, colocamos el pañal y lo abrochamos de <br>
                        manera diagonal como si fuera una “V”. Verifica que esté bien colocado, que no <br>
                        le apriete, pero tampoco esté flojito. Si en este punto queda como una bolsita, es <br>
                        necesario colocarlo correctamente.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>13. Viste al peque prenda por prenda.</b></span><span></span></div>
                        </div>
                        <p>Asegurándote que toda quede colocada de manera correcta.</p>

                        <h3>Después</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>14. Integra al peque nuevamente a las actividades al finalizar el cambio de <br>pañal.</b></span><span></span></div>
                        </div>
                        <p>En este momento, generamos la limpieza del espacio, guardando los elementos <br>
                        que ocupamos, etc. También hacemos el lavado de manos.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>15. Cuida la integridad física y emocional del peque en todo momento.</b></span><span></span></div>
                        </div>
                        <p>Esta integridad se cuida cuando no somos bruscas, no hacemos expresiones <br>
                        inadecuadas y los tratamos con amor y respeto. Así como validando sus emociones <br>
                        en todo momento, si el peque llora durante algún paso del cambio de pañal es <br>
                        porque algo lo hizo sentir incómodo y no generamos correctamente el vínculo, si <br>
                        esto pasa, debemos pausar, calmarlo y empezar a conectar nuevamente para <br>
                        retomar el cambio.</p>

                        <p>Con estos 15 pasos reafirmamos la importancia de realizar cada cambio de pañal <br>
                        con atención, respeto, cuidado y amor. Sabemos que nuestra labor implica <br>
                        múltiples responsabilidades y ritmos distintos cada día, por lo que contar con una <br>
                        guía clara puede facilitar nuestro trabajo y asegurar el bienestar de los pequeños.</p>

                        <h3>Referencias</h3>
                        <p>Formato estándar de competencia (s.f) Prestación de servicios para la atención, <br>
                        cuidado y desarrollo integral de las niñas y los niños en Centros de Atención Infantil <br>
                        pp- 1-18 http://excela.com.mx/pdf/ec0435.pdf</p>
                    `
                },

                {
                    id: 44,
                    titulo: "💗 Cuando no se siente la conexión: cómo volver al vínculo con su peque, paso a paso",
                    resumen: "A veces el amor está… pero la cercanía no se logra de inmediato. Este texto le acompaña a entender por qué puede pasar, cómo entrar con respeto a su mundo emocional y qué acciones simples ayudan a construir una conexión segura, auténtica y amorosa.",
                    imagen: "assets/img/articulos/44.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <h1 style="font-size:32px;line-height:1.15;margin:10px 0 14px 0;">Factores que interfieren el vínculo con mi peque</h1>

                        <p>A veces, aunque pongamos todo nuestro cariño, sentimos que no logramos 
                        conectar con nuestro peque, puede que no quiera jugar con nosotros, que se 
                        muestre distante, serio, enojado o simplemente indiferente. Esto puede generar 
                        frustración, culpa o dudas, especialmente en nosotras deseamos crear un vínculo 
                        cercano y amoroso.</p>

                        <p>Sin embargo, es importante recordar que la conexión emocional se construye, no 
                        aparece de inmediato, cada peque tiene su propio ritmo, su personalidad y su 
                        historia emocional.</p>

                        <h3>¿Por qué a veces no logramos conectar con un peque?</h3>

                        <p>Existen muchas razones por las que un peque puede mostrarse distante o poco 
                        dispuesto a vincularse como:</p>

                        <div class="reading-note">
                        <p><strong>1. Cambios emocionales o familiares</strong><br>
                        Los peques son muy sensibles a los cambios como mudanzas, separaciones, 
                        llegada de un nuevo hermano, cambios de cuidador o conflictos familiares pueden 
                        hacer que se cierren emocionalmente.</p>

                        <p><strong>2. No sentirse en confianza contigo</strong><br>
                        La confianza no se construye en un día, para muchos peques, especialmente los 
                        más sensibles, conocer a una persona nueva puede generar ansiedad, es 
                        importante señalar que antes de abrirse a un vínculo emocional se debe generar 
                        seguridad emocional, generado desde la confianza, el respeto y afecto genuino.</p>

                        <p><strong>3. No sabe expresar lo que siente</strong><br>
                        Muchos peques no saben poner en palabras lo que les pasa. A veces se sienten 
                        tristes, enojados o confundidos, pero no saben explicarlo, así que lo expresan con 
                        conducta: rechazo, berrinches, silencio o evitación.</p>

                        <p><strong>4. Tener un temperamento más reservado</strong><br>
                        No todos los peques son extrovertidos, algunos son más observadores, tranquilos y 
                        necesitan más tiempo para confiar, esto no significa que no quieran cariño, solo 
                        que lo expresan de otra manera.</p>
                        </div>

                        <h3>¿Cómo empezar a conectar desde su mundo?</h3>

                        <p>Conectar con un peque no es forzarlo a querernos, sino entrar con respeto a su 
                        mundo emocional.</p>

                        <div class="reading-note">
                        <ul>
                            <li><strong>Conócelo antes de intentar jugar</strong><br>
                            Obsérvalo, mira qué le gusta, cómo se mueve, qué lo tranquiliza, qué le molesta, el 
                            interés genuino es el primer puente hacia la conexión. “veo que te gustan mucho 
                            los carritos.”, “te gusta mucho dibujar, ¿verdad?”. Con ello demostramos que los
                            conocemos y nos interesan sus gustos.</li>

                            <li><strong>Respeta su ritmo</strong><br>
                            No todos los peques quieren abrazos, juegos intensos o mucha conversación al 
                            principio, a veces solo quieren compañía silenciosa. Sentarte cerca, acompañarlo 
                            sin invadir su espacio, ya es una forma de conexión.</li>

                            <li><strong>Valida sus emociones</strong><br>
                            Cuando un peque se siente comprendido, comienza a abrir su corazón. Frases 
                            como: “veo que estás serio hoy.” “parece que te sientes cansado.” Ayudan a 
                            sentirse escuchados.</li>

                            <li><strong>Conecta a través del juego</strong><br>
                            El juego es el lenguaje natural de los peques, el jugar fortalece el vínculo emocional, 
                            la seguridad y la autoestima de los peques. No se trata de dirigir el juego, sino de 
                            compartirlo: Imitarlo, seguir sus reglas y disfrutar con él.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <p><strong> Sé constante</strong><br>
                        La conexión se construye con presencia, no con prisa, la constancia genera 
                        seguridad emocional, un peque necesita saber que puede contar contigo hoy, 
                        mañana y pasado mañana.</p>

                        <p>A veces los peques no rechazan a la persona, sino la situación que están viviendo, 
                        tu paciencia, respeto y cariño pueden marcar una gran diferencia en su vida 
                        emocional. No te desanimes si no conecta contigo de inmediato, estás sembrando
                        el vínculo emocional que será la base de su amistad, cuando un peque se siente 
                        visto, escuchado y amado, florece recuerda que cada peque necesita su propio 
                        tiempo para confiar.</p>
                        </div>

                        <h3>Referencias</h3>

                        <div class="reading-table">
                        <div class="rt-row">
                            <span>UNICEF. (s. f.).</span>
                            <span>Por qué el juego refuerza la salud mental de tus hijos e hijas. UNICEF.
                            Recuperado de: https://www.unicef.org/parenting/es/desarrollo-infantil/por-que￾juego-refuerza-salud-mental-de-tu-hijo</span>
                        </div>

                        <div class="rt-row">
                            <span>Santos, María. (2025).</span>
                            <span>El juego como mediador del vínculo afectivo en padres e hijos 
                            en movilidad humana. Revista INFAD de Psicología. Vol 1 (1) Recuperado de 
                            https://revista.infad.eu/index.php/IJODAEP/article/view/2824</span>
                        </div>

                        <div class="rt-row">
                            <span>Formación Activa en Pediatría de Atención primaria. (2019).</span>
                            <span>Desarrollo infantil y 
                            apego. Vol 12 (3). Recuperado de https://fapap.es/articulo/527/desarrollo-infantil￾y-apego</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 45,
                    titulo: "💖 Letras con risas: juegos que convierten la lectura en un momento mágico con tu peque",
                    resumen: "Tu peque no necesita presión para aprender… necesita emoción. Aquí tienes juegos simples y divertidos para que identifique letras, sílabas y palabras con confianza, curiosidad y alegría. Ideal para crear el hábito sin peleas y con mucha conexión.",
                    imagen: "assets/img/articulos/45.jpg",
                    categoria: "cognitivo",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Juegos para aprender a leer:</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">📚 Aprender leyendo… jugando</strong>
                        <p style="margin:10px 0 0 0;">Cuando el aprendizaje se siente como juego, el corazón se abre y la mente se enfoca. Estas ideas pueden ayudar a tu peque a reconocer letras y sonidos con entusiasmo.</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>1. Veo, veo</strong></span><span>👀</span></div>
                        <p style="margin:12px 0 18px 0;">Un clásico entre los clásicos, el veo, veo, es perfecto para que los peques 
                        identifiquen la letra y los sonidos. Una de sus ventajas es que se puede practicar en 
                        cualquier lugar, sin necesidad de nada más que ganas e imaginación.</p>

                        <div class="rt-row"><span><strong>2. Sopas de letras</strong></span><span>🧩</span></div>
                        <p style="margin:12px 0 18px 0;">Este pasatiempo tradicional es un juego fantástico para que los niños aprendan a 
                        leer. Las palabras suelen estar en mayúsculas, algo más fácil si son primeros 
                        lectores, y las pueden tener escritas para reconocerlas. Puedes preparar las sopas 
                        de letras en casa o buscar recursos online. Además, las palabras te darán pie a 
                        explicar significados y mejorar su vocabulario.</p>

                        <div class="rt-row"><span><strong>3. Crucigramas</strong></span><span>✍️</span></div>
                        <p style="margin:12px 0 18px 0;">Los crucigramas, al igual que ocurre con las sopas de letras, ayudan a niños a 
                        ampliar su vocabulario. Como para adivinar las palabras han de leer las 
                        definiciones, les resultará más fácil entender su significado. Para empezar, busca 
                        crucigramas fáciles, con pocas palabras, y ve adaptándolos a las capacidades de 
                        tu peque.</p>

                        <div class="rt-row"><span><strong>4. Tarjetas con sílabas</strong></span><span>🟣</span></div>
                        <p style="margin:12px 0 18px 0;">Con cartulina, prepara tarjetas con diferentes sílabas. Para hacerlas más atractivas 
                        para los peques, decóralas: emplea diferentes colores, purpurina y todo aquello 
                        que creas que puede gustarles. Después, jueguen con las tarjetas a formar 
                        palabras. Lo bueno que tiene este juego es que pueden llevarlo a cualquier parte.</p>

                        <div class="rt-row"><span><strong>5. Tarjetas con letras</strong></span><span>🔤</span></div>
                        <p style="margin:12px 0 18px 0;">El mismo juego anterior se puede componer con letras en vez de con sílabas. Tienes 
                        dos opciones para hacerlo: puedes comprar el alfabeto ya hecho (en madera, 
                        fichas, o incluso para la bañera) o preparar las tarjetas. Esta última es un dos por 
                        uno, porque, además, pasarán un rato muy divertido haciendo manualidades.</p>

                        <div class="rt-row"><span><strong>6. Cadena de palabras</strong></span><span>🔁</span></div>
                        <p style="margin:12px 0 18px 0;">Es otro de esos juegos de toda la vida. Quien empieza debe decir una palabra y el 
                        que continúa ha de decir otra que comience por la última sílaba de la anterior. Así 
                        hasta que alguien falle o repita palabra.</p>

                        <div class="rt-row"><span><strong>7. El ahorcado</strong></span><span>🎯</span></div>
                        <p style="margin:12px 0 0 0;">¿Quién no ha jugado al ahorcado en su infancia? Ya sabes cómo va: una raya por 
                        cada letra de la palabra y un ahorcado que se va componiendo con cada fallo. 
                        Comienza con palabras sencillas, con pocas letras, y aumenta la dificultad 
                        conforme el peque avance.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Más ideas para reforzar lectura</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p><strong>8. Identifica partes de la palabra</strong><br>
                        En un papel, escribe diferentes palabras y pide al niño o niña que marque las que 
                        contengan una letra o sílabas concretas. Es un juego estupendo para que vaya 
                        reconociendo las grafías.</p>

                        <p><strong>9. Moldea la letra con plastilina</strong><br>
                        La plastilina es un material muy versátil que suele gustar mucho a los peques. En 
                        este caso la van a emplear para dar forma a las letras. Puedes ser tú quien le 
                        proponga la letra o puede elegir una al azar.</p>

                        <p><strong>10. El coleccionista de palabras</strong><br>
                        Solo necesitarás papel, lápiz y un reloj de arena. Elige una letra al azar y propón a 
                        los peques que escriban todas las palabras que se les ocurra con esa letra.</p>

                        <p><strong>11. Scattergories</strong><br>
                        En este famoso juego hay que escribir palabras que empiecen con una letra 
                        elegida al azar, dentro de unas categorías propuestas. Para los peques que están 
                        aprendiendo a leer, prueba la versión casera adaptada. Haz unas categorías más 
                        sencillas (dibujo animado, deporte, juego, familiar, etc.) y dale un poco más de 
                        tiempo.</p>

                        <p><strong>12. Una sílaba, una palmada</strong><br>
                        Este tipo de juego ayuda a los peques a diferenciar las partes de la palabra. Con 
                        una letanía se va cantando una canción, que se acompaña de una palmada 
                        por cada sílaba.</p>

                        <p><strong>13. Listas de palabras que rimen</strong><br>
                        Hacer estas listas ayudará a los peques a tomar conciencia fonológica. Proponles 
                        la primera y ¡a rimar!</p>

                        <p><strong>14. Formar letras con el cuerpo</strong><br>
                        Este juego da la posibilidad de jugar por equipos si hay varios niños, de forma que 
                        también desarrollarán el trabajo en equipo y la resolución de conflictos. Un adulto 
                        u otro niño o niña que ejerza de juez propone una letra y cada equipo ha de 
                        cooperar para formarla, con los cuerpos de todos, lo antes posible.</p>

                        <p><strong>15. Canta y rellena los huecos</strong><br>
                        Escribe un fragmento de una canción infantil, pero deja algunas palabras sin 
                        rellenar. Después de escuchar la canción, serán los niños quienes tengan que 
                        escribir las palabras que van en los huecos.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Juegos con sílabas y palabras</h3>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>16. Reloj silábico</strong></span><span>🕒</span></div>
                        <p style="margin:12px 0 18px 0;">Junto con tu peque hagan un reloj donde en lugar de números vayan sílabas, 
                        pídele que una vez hecho gire la manecilla del reloj y vaya formando palabras 
                        con las sílabas que le salgan.</p>

                        <div class="rt-row"><span><strong>17. Fichas silábicas</strong></span><span>🎲</span></div>
                        <p style="margin:12px 0 18px 0;">Con ayuda de un dado, y una tarjeta con sílabas e imágenes, el pequeño lanzará 
                        el dado y dependiendo el número que le salga tendrá que decir que sílaba le tocó 
                        al igual que las imágenes que corresponden a dicha sílaba.</p>

                        <div class="rt-row"><span><strong>18. Avión silábico</strong></span><span>🛫</span></div>
                        <p style="margin:12px 0 18px 0;">Se colocarán hojas con sílabas formando el juego del "avión", el peque deberá 
                        lanzar un dado y dependiendo la sílaba que le salga brincará hacia ella.</p>

                        <div class="rt-row"><span><strong>19. Armando palabras</strong></span><span>🥤</span></div>
                        <p style="margin:12px 0 18px 0;">Se le darán al peque unos vasos móviles con diferentes sílabas, la nanny le 
                        mostrará algunas palabras, las cuales el tendrá que formar con los vasos.</p>

                        <div class="rt-row"><span><strong>20. Código de colores</strong></span><span>🎨</span></div>
                        <p style="margin:12px 0 18px 0;">Se le dará al pequeño una hoja, la cual tendrá escritas letras simbolizadas con un 
                        color, el pequeño tendrá que formar la palabra dependiendo el código de colores 
                        que la nanny le enseñe.</p>

                        <div class="rt-row"><span><strong>21. Dominó de sílabas</strong></span><span>🀄</span></div>
                        <p style="margin:12px 0 18px 0;">El dominó puedes hacerlo junto con tu peque con ayuda de hojas, plumones, 
                        stickers, etc., de esta manera aprovechan para reforzar su motricidad fina y 
                        creatividad mientras repasan las sílabas que necesitan reforzar.</p>

                        <div class="rt-row"><span><strong>22. El cazador de letras</strong></span><span>🕵️</span></div>
                        <p style="margin:12px 0 18px 0;">Escribe varias palabras en una hoja, con colores llamativos. Luego, nombras a tu 
                        peque 'cazador de letras'. Él tendrá que reconocer y rodear con un rotulador la 
                        letra que pidas. Por ejemplo, si le pides que cace la letra 'R', tendrá que buscar 
                        entre todas las palabras que escribiste en la hoja y rodear solo las 'R' que 
                        encuentre. Luego, cambien de color y pídele que busque otra letra.</p>

                        <div class="rt-row"><span><strong>23. Círculo o cuadrado</strong></span><span>⭕⬜</span></div>
                        <p style="margin:12px 0 18px 0;">Para enseñar a tu peque que algunas palabras se escriben con minúscula y otras 
                        empiezan con mayúscula, puedes usar el juego del círculo y el cuadrado. Sobre 
                        un texto corto y sencillo, pídele que rodee con un círculo las palabras que 
                        comienzan con minúscula y que encierre en un cuadrado aquellas que empiezan 
                        con mayúscula. Puedes usar diferentes colores para círculos y cuadrados.</p>

                        <p style="margin-top:10px;">Página con juegos dinámicos y divertidos que ayudan a los peques a 
                        aprender: https://arbolabc.com/lectores-emergentes/silibas-encantadas</p>
                        </div>

                        <h3 style="margin-top:26px;">Referencias:</h3>
                        <p>Esteban, E. (27 de mayo de 2022). 14 juegos para enseñar a leer a los niños. Guía 
                        Infantil. Disponible en: https://www.guiainfantil.com/educacion/lectura/14-
                        juegos-para ensenar-a-los-ninos/</p>

                        <p>Superpoderes Arnidol. (26 de febrero de 2020). 15 juegos para aprender a leer y 
                        disfrutar en familia. Los superpoderes de Arnidol Disponible 
                        en: https://www.arnidol.com/es/juegos-aprender-leer/</p>

                    </div>
                    `
                },

                {
                    id: 46,
                    titulo: "🗣️ Sus primeras palabras, su mundo entero: ideas hermosas para estimular el lenguaje desde el año",
                    resumen: "Cada mirada, gesto y sonido es un paso hacia el lenguaje. Esta guía le comparte formas sencillas y muy poderosas para fortalecer la comprensión y la expresión de su peque, con actividades prácticas para hacerlo en casa con amor y constancia.",
                    imagen: "assets/img/articulos/46.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/32.jpg')"></div>

                        <div class="reading-note" style="margin-top:0;">
                        <strong>Lenguaje en pequeños a partir de un año</strong>
                        </div>

                        <p>Hablar de lenguaje sería similar a hablar de un gran almacén de conceptos, ideas y significados que desde el momento del nacimiento los niños van almacenando y organizando como si de una biblioteca se tratara. A partir de esta biblioteca, encontramos la habilidad de escuchar, ordenar y añadir nuevas ideas (lenguaje comprensivo) o la habilidad de expresar y comunicarlas(lenguaje expresivo).</p>

                        <p>Antes de la comprensión de cuentos o historias, hay muchas otras muestras de lenguaje comprensivo que podemos llegar a trabajar con los más pequeños de la casa, como la denominación de palabras o, incluso, las onomatopeyas.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">- Onomatopeyas:</span>
                            <span style="flex:1; text-align:right;">Cuando aún recordar palabras sea un acto complejo, siempre podremos hacer uso de palabras simples que hacen referencia a sonidos como guau-guau, miau-miau, ñam-ñam, etc.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">- Señalando:</span>
                            <span style="flex:1; text-align:right;">Con ayuda de láminas, cuentos o cualquier tipo de imagen podemos ir preguntándoles y pidiéndoles que nos señalen determinados objetos, colores o animales. Es un excelente modo de saber que vocabulario tiene ya adquirido.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">- Escogiendo:</span>
                            <span style="flex:1; text-align:right;">Ante palabras nuevas, siempre podemos proponerles que escojan entre dos opciones, una conocida y una desconocida. Por ejemplo, '¿Dónde está la moto?', dando a elegir entre una moto y un coche, siendo el coche conocido y la moto un posible vocabulario nuevo.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">- Asociando:</span>
                            <span style="flex:1; text-align:right;">Con ayuda de imágenes o álbumes podemos pedirles que nos indiquen determinados conceptos, por ejemplo, '¿Dónde están los animales?' o '¿Qué se puede comer?' o ‘¿Qué es más grande? ' .</span>
                        </div>
                        </div>

                        <p>Antes de la aparición de las palabras y las frases, hay muchas otras muestras de lenguaje expresivo que podemos llegar a trabajar, como la mirada, los gestos o los sonidos. Aquí van unas ideas para que los papás y las mamáslos trabajen en casa.</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">- Mirándolos:</span>
                            <span style="flex:1; text-align:right;">Siempre que nos estemos comunicando o jugando con ellos, es importante mirarlos, incluso, sería recomendable agacharnos hasta conseguir estar a su misma altura. El contacto ocular es una primera tarea imprescindible para una buena comunicación.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">- Gesticulando:</span>
                            <span style="flex:1; text-align:right;">Siempre que tengamos que explicarles algo, es recomendable que nos ayudemos de gestos con los brazos o con la expresión facial, que ellos también luego imitaran para expresarse.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">- Llamando por teléfono:</span>
                            <span style="flex:1; text-align:right;">A menudo sus primeras producciones serán incomprensibles, pero es importante animarlos y seguirles la conversación, por ejemplo, simulando una llamada de teléfono o cualquier conversación.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">- Imitando sonido:</span>
                            <span style="flex:1; text-align:right;">Si la imitación y repetición de palabras aún es algo complejo para ellos, también es posible jugar a imitar sonidos aislados, tanto que inicien ellos como que iniciemos nosotros. Desde una pedorreta a un balbuceo (ba-ba- ba) puede serles de gran utilidad.</span>
                        </div>
                        </div>

                        <div class="reading-note">
                        <strong>Habilidades básicas para que los niños hablen, “las 4 L´s”:</strong>
                        </div>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">1.</span>
                            <span style="flex:1; text-align:right;">Intención comunicativa: aquí se evalúa que tu pequeño tenga la necesidad de comunicarse, aunque no sea con palabras, sino a través de gestos, pero importante que esta necesidad esté presente.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">2.</span>
                            <span style="flex:1; text-align:right;">Interacción social: que el pequeño volteé cuando le hables, intente saber de qué lugar se provienen los sonidos, tenga contacto visual cuando le hables.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">3.</span>
                            <span style="flex:1; text-align:right;">Imitación: hay tres tipos de imitación de palabras, imitación gestual e imitación de acciones.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">4.</span>
                            <span style="flex:1; text-align:right;">Input lingüístico: dentro de esta I se evalúa si los pequeños son capaces de seguir instrucciones, por ejemplo, si es que entiende cuando le dices“no, bájate de ahí” o “pásame el vaso”.</span>
                        </div>
                        </div>

                        <h3 style="margin-top:28px;">Actividades para estimular el lenguaje</h3>

                        <div class="reading-note">
                        <strong>El instrumento:</strong>
                        <p style="margin:12px 0 0 0;">Con ayuda de una botella de plástico y arroz o alguna legumbre, harán una sonaja, la cual deberán sellar bien para que no se caiga el material.</p>
                        <p style="margin:12px 0 0 0;">Una vez que tengamos listo nuestro instrumento la nanny le dirá lo siguiente al pequeño “1, 2, 3… alto, shhh” cuando la nanny diga “alto shhh”, el pequeño deberá dejar de reproducir el sonido con el instrumento, en dado caso de que no pare podemos tomar suavemente su mano y decirle “shhh”.</p>
                        <p style="margin:12px 0 0 0;">Con este ejercicio, el pequeño irá asociando la acción de detenerse con el sonido y el lenguaje, fomentando así su comprensión y aprendizaje de nuevas expresiones o palabras.</p>
                        </div>

                        <p>Al año, los pequeños tienen que ir aprendiendo las vocales, aquí algunos ejercicios para irlas trabajando</p>

                        <div class="reading-note">
                        <strong>Túneles de letras:</strong>
                        <p style="margin:12px 0 0 0;">Unas cartulinas de colores, rotuladores y los coches que tengas en casa pueden convertirse en elementos para crear este divertido juego de túneles. Corta tiras de cartulina del mismo tamaño y crea unos arcos. Fija alsuelo con un poco de cinta.</p>
                        <p style="margin:12px 0 0 0;">Escribe en cada uno de ellos un carácter, tanto en mayúscula como en minúscula.</p>
                        <p style="margin:12px 0 0 0;">El juego consiste en seguir un orden determinado a partir de una letra del alfabeto o en este caso, en seguir y pronunciar las vocales.</p>
                        </div>

                        <div class="reading-note">
                        <strong>Pescar letras:</strong>
                        <p style="margin:12px 0 0 0;">Coge un recipiente grande de plástico para crear tu piscina de letras. Con unas pequeñas pelotas de ping pong haz las vocales. Coloca dentro, junto a las bolas, algunos peces o tiburones. Da a los niños unos pequeños coladores para que puedan pescar las letras según las nombras, pero con cuidado de no coger alguno de los peces o al tiburón porque, en ese caso, habrán perdido juego.</p>
                        </div>

                        <div class="reading-note">
                        <strong>Siguiendo las pistas:</strong>
                        <p style="margin:12px 0 0 0;">Se colocarán unas hojas con las vocales, se pegarán en la pared y los pequeños tendrán que llegar a ellas para terminar de decorarlas, pero para llegar a las letras tendrán que pasar por un tipo circuito del color de la letra.</p>
                        </div>

                        <p>Cuadernillo de actividades con vocales:</p>

                        <h3 style="margin-top:28px;">Referencias:</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="gap:10px; align-items:flex-start;">
                            <span>Cerillo, L. (22 de febrero de 2022). Ejercicios para la estimulación del lenguaje en niños de 1 a 2 años. Guiainfantil.com. Disponible en: https://www.guiainfantil.com/bebes/primeras-palabras/ejercicios-para-la estimulacion-del-lenguaje-en-ninos-de-1-a-2-anos/</span>
                        </div>
                        <div class="rt-row" style="gap:10px; align-items:flex-start; border-bottom:none;">
                            <span>Carreto, X. [Mi terapia con Ximena] (19 de octubre de 2021). 4 habilidades básica. s para que tu peque comience a hablar l las 4 I's del lenguaje [Video]. YouTube. Disponible en: https://www.youtube.com/watch?v=xFHitgp1m2I</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 47,
                    titulo: "🌿 Menos pantalla, más calma: cómo proteger a tu peque de la sobreestimulación en YouTube",
                    resumen: "A veces, lo que parece “solo un video” puede dejar a un peque inquieto, irritable o con dificultad para concentrarse. Este artículo te ayuda a entender qué es la sobreestimulación, qué señales observar y cómo equilibrar pantallas con experiencias reales que nutren su desarrollo.",
                    imagen: "assets/img/articulos/47.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                        <h1>La sobreestimulación en los peques a través <br>de programas y videos de YouTube</h1>

                        <p>En la actualidad, los peques tienen acceso a una gran variedad de contenidos <br>
                        digitales, desde programas de televisión hasta videos en plataformas como <br>
                        YouTube, aunque estos recursos pueden ser herramientas de entretenimiento e <br>
                        incluso de aprendizaje, también representan un riesgo cuando los estímulos son <br>
                        excesivos o inadecuados para su etapa de desarrollo.</p>

                        <h3>¿Qué es la sobreestimulación?</h3>
                        <p>La sobreestimulación ocurre cuando el cerebro del peque recibe demasiada <br>
                        información visual, auditiva o emocional en poco tiempo, superando su capacidad <br>
                        de procesarla. En el caso de los programas infantiles y los videos digitales, esto se <br>
                        traduce en cambios rápidos de escena, colores intensos, sonidos fuertes o <br>
                        narrativas aceleradas que capturan la atención, pero pueden generar efectos <br>
                        negativos.</p>

                        <div class="reading-note">
                        <strong>Algunas consecuencias que se pueden presentar en el desarrollo</strong>
                        <div style="margin-top:12px;"></div>
                        <div class="reading-table" style="margin:0;">
                            <div class="rt-row"><span><b>1. Dificultades de atención:</b> La exposición frecuente a estímulos rápidos puede <br>dificultar que los peques se concentren en actividades cotidianas más <br>lentas, como leer, dibujar o escuchar una historia.</span><span></span></div>
                            <div class="rt-row"><span><b>2. Problemas en la autorregulación:</b> Los contenidos sobrecargados de <br>estímulos pueden alterar los ciclos de sueño y aumentar la irritabilidad.</span><span></span></div>
                            <div class="rt-row"><span><b>3. Impacto en el lenguaje:</b> Reemplazar el juego simbólico y la interacción <br>verbal con consumo excesivo de pantallas puede limitar el desarrollo del <br>vocabulario y la comunicación.</span><span></span></div>
                            <div class="rt-row"><span><b>4. Conductas imitativas inadecuadas:</b> Algunos videos populares muestran <br>actitudes poco educativas que los peques tienden a reproducir.</span><span></span></div>
                        </div>
                        </div>

                        <h3>El papel de YouTube y la televisión</h3>
                        <p>Plataformas como YouTube utilizan algoritmos que recomiendan videos de manera <br>
                        continua, lo que fomenta el consumo prolongado sin pausas, muchos de estos <br>
                        videos, diseñados con colores brillantes, canciones pegajosas y repeticiones <br>
                        rápidas, captan la atención de los niños, pero no siempre ofrecen un contenido <br>
                        educativo de calidad.</p>

                        <p>De forma similar, algunos programas de televisión infantil recurren a estímulos <br>
                        intensos para mantener la atención, priorizando el entretenimiento sobre la <br>
                        formación. Esto puede ser contraproducente si se consume sin supervisión o en <br>
                        exceso. Algunos ejemplos de estos programas son:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>La granja de Zenón</span><span></span></div>
                        <div class="rt-row"><span>Plim Plim</span><span></span></div>
                        <div class="rt-row"><span>CoComelón</span><span></span></div>
                        <div class="rt-row"><span>BebeFinn</span><span></span></div>
                        <div class="rt-row"><span>Little Baby Bum</span><span></span></div>
                        </div>

                        <p>Ya que durante estos capítulos hay transiciones muy rápidas entre escenas de <br>
                        aproximadamente 2 a 3 segundos, además de los colores muy brillantes y saturados <br>
                        lo que provoca la hiperestimulación y haya un exceso de dopamina, lo que puede <br>
                        generar ansiedad. Se sugiere solo poner las canciones de dichos programas, sin <br>
                        que vea la tele directamente la pantalla.</p>

                        <p>Algunas caricaturas que puedes colocarle a tu peque que contienen animaciones <br>
                        más suaves son:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>Hey Bear Sensory</span><span></span></div>
                        <div class="rt-row"><span>Baby Einstein</span><span></span></div>
                        <div class="rt-row"><span>Daniel el tigre</span><span></span></div>
                        <div class="rt-row"><span>Super Simple</span><span></span></div>
                        <div class="rt-row"><span>Bluey</span><span></span></div>
                        <div class="rt-row"><span>NumberBlocks</span><span></span></div>
                        </div>

                        <p>Estas series contienen transiciones más suaves, tonos más opacos sin mucha luz, así <br>
                        como, enseñan valores, números y cantidades y amplían el vocabulario.</p>

                        <p>Si bien los programas de televisión y los videos de YouTube pueden formar parte del <br>
                        entorno infantil actual, es fundamental reconocer los riesgos de la <br>
                        sobreestimulación, la clave está en el equilibrio: limitar el tiempo frente a pantallas, <br>
                        elegir materiales adecuados y priorizar experiencias reales que nutran el desarrollo <br>
                        integral de los pequeños, así mismo, se recomienda promover el juego libre: Las <br>
                        actividades manuales, la lectura y el juego al aire libre ayudan a equilibrar el <br>
                        impacto de los medios digitales.</p>

                        <p>A continuación, te dejamos algunas de las actividades que puedes realizar con tus <br>
                        peques:</p>

                        <h3>Actividades para peques de 2-4 años:</h3>
                        <ul>
                        <li>Botellas sensoriales temáticas</li>
                        <li>Mini experimento: volcán de bicarbonato</li>
                        <li>Circuitos de motricidad</li>
                        <li>Mini huerto en macetas</li>
                        <li>Teatro de sombra</li>
                        </ul>

                        <h3>Actividades para peques de 4-8 años</h3>
                        <ul>
                        <li>Laboratorio de burbujas gigantes</li>
                        <li>Experimento: crecimiento de cristales</li>
                        <li>Masa sensorial (slime o plastilina)</li>
                        <li>Recetas fáciles de cocina</li>
                        <li>Búsqueda del tesoro</li>
                        </ul>

                        <h3>Referencias</h3>
                        <p>Christakis et al. (2007). Effect of fast-paced cartoons on preschoolers' <br>
                        attention and executive function. Pediatrics, 128(4), 644–649. <br>
                        hhttps://doi.org/10.1542/peds.2011-2071ttps://doi.org/10.1542/peds.2011- <br>
                        2071</p>

                        <p>Zhang et al. (2024). The immediate effects of fantastical television on <br>
                        executive function in children: A systematic review and meta-analysis. BMC <br>
                        Psychology, 12, 312. <br>
                        https://bmcpsychology.biomedcentral.com/articles/10.1186/s40359-024- <br>
                        01738-1</p>

                        <p>Caviedes et al. (2000). La televisión y los niños: ¿es responsable la televisión <br>
                        de todos los males que se le atribuyen <br>
                        file:///C:/Users/nanny/AppData/Local/Temp/2a3bc291-6a3b-48ae-89a3- <br>
                        78c140205c11_ScienceDirect_articles_29Aug2025_19-26-48.883.zip.c11/La￾televisi-n-y-los-ni-os---es-responsable-la-televisi-n-de-_2000_Atenci-n-P.pdf</p>

                        <p>Azcona, S. (2025). Sobreestimulación: qué es y por qué es un riesgo. <br>
                        mailto:https://etic.fundaciondn.org/sobreestimulacion-ninos-adolescentes</p>
                    `
                },

                {
                    id: 48,
                    titulo: "🦷✨ Dentición sin miedo: acompaña a tu bebé con calma, amor y alivio real",
                    resumen: "La salida de los primeros dientitos puede sentirse intensa: más babita, noches movidas, mordidas por todos lados… y un corazón de mamá/papá queriendo ayudar. Esta guía te explica señales, tips prácticos y focos rojos para atravesar la dentición con seguridad, cariño y mucha paciencia.",
                    imagen: "assets/img/articulos/48.jpg",
                    categoria: "Extras",
                    contenido: `
                        <h3>La dentición en bebés: todo lo que necesitas saber</h3>

                        <p>La dentición es una de las etapas más importantes en el desarrollo de los bebés, generalmente comienza entre los 4 y 7 meses de edad, aunque en algunos casos puede iniciar un poco antes o después según sea el caso. En este proceso se inicia la aparición gradual de los primeros dientes, conocidos como dientes de leche o temporales, por lo general, los primeros en salir son los dos dientes frontales inferiores (incisivos centrales), seguidos por los dos superiores y finalmente aparecen los dientes laterales, molares y colmillos. De los 2-3 años, un peque suele tener sus 20 dientes de leche.</p>

                        <div class="reading-note">
                        <p>Acompañar al bebé con cariño, paciencia y atención durante esta etapa, no solo ayuda a calmar sus molestias, sino que también fortalece el vínculo afectivo la dentición es un pequeño gran paso en su camino hacia el crecimiento.</p>
                        </div>

                        <h3>Señales y/o síntomas de la dentición</h3>
                        <ul>
                        <li><strong>Encías inflamadas o enrojecidas:</strong> puedes notar que están más abultadas o sensibles al tacto, especialmente donde pronto saldrá un diente.</li>
                        <li><strong>Babeo excesivo:</strong> es muy típico que durante esta etapa el bebé babee más de lo normal. Incluso puede causarle salpullido alrededor de la boca o en el cuello.</li>
                        <li><strong>Irritabilidad o llanto sin causa aparente:</strong> el dolor en las encías puede hacer que el bebé esté más inquieto o sensible de lo habitual.</li>
                        <li><strong>Deseo constante de morder:</strong> los bebés buscan alivio mordiendo sus manos, juguetes, ropa o cualquier objeto cercano.</li>
                        <li><strong>Alteraciones en el sueño:</strong> Puede despertarse con más frecuencia o tener dificultad para dormir por el malestar.</li>
                        <li><strong>Perdida temporal del apetito:</strong> a veces rechazan el biberón o los solidos por la incomodidad al succionar o masticar.</li>
                        <li><strong>Frotarse las mejillas o jalarse las orejas:</strong> esto ocurre porque el dolor de las encías puede irradiarse hacia la cara o los oídos.</li>
                        </ul>

                        <h3>TIPS para aliviar las molestias en dentición</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>•</strong></span><span><strong>Ofrecer mordederas (pero no congeladas):</strong> las mordederas refrigeradas ayudan a desinflamar las encías y proporcionan alivio inmediato, solo debemos asegurarnos de que sean de materiales seguros y fáciles de lavar.</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span><strong>Masajes en las encías:</strong> con un dedal de silicón o tu dedo limpio, puedes frotar suavemente las encías del bebé, esto ayuda a disminuir la presión y calmar el malestar.</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span><strong>Frutas frías (si ya come sólidos):</strong> para bebés que ya iniciaron la alimentación complementaria, puedes ofrecer un pedacito de plátano, manzana o zanahoria fríos en una malla o porta alimentos seguro.</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span><strong>Evitar objetos duros o inseguros:</strong> aunque quieran morderlo todo, evita objetos pequeños o puntiagudos, mejor elige juguetes de dentición certificados y fáciles de agarrar, explorar y trabajar sus emociones de manera creativa, utilizando colores y formas para representar sus propias experiencias o sentimientos.</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span><strong>Usar baberos absorbentes:</strong> como hay mucha saliva durante esta etapa, un babero ayudará a mantener seca su ropita y evitar irritaciones en la barbilla o cuello.</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span><strong>Dale contención emocional:</strong> a veces solo necesitan más apapachos, brazos y tranquilidad, estar cerca de sus cuidadores principales les dará mucha seguridad.</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span><strong>Ofrecer actividades sensoriales suaves:</strong> juegos tranquilos, canciones suaves o ruido blanco pueden distraerlo de la molestia y ayudarlo a relajarse especialmente a la hora del sueño, así como masajes con aceites relajantes o un baño reconfortante.</span></div>
                        </div>

                        <div class="reading-note">
                        <p><strong>Algunas señales de alerta pueden ser:</strong></p>
                        <ul>
                            <li><strong>Fiebre mayor a 38 °C:</strong> la dentición puede causar un leve aumento de temperatura, pero nunca fiebre alta, si la hay, puede deberse a una infección u otra causa.</li>
                            <li><strong>Diarrea abundante o persistente:</strong> aunque algunos bebés tienen heces un poco más blandas por el babeo, la diarrea no es un síntoma normal que puede causar deshidratación.</li>
                            <li><strong>Vómito</strong> no es común ni esperable en la dentición, pero si el bebé vomita, hay que buscar otra causa médica.</li>
                            <li><strong>Llanto inconsolable o irritabilidad extrema</strong> si el llanto es muy intenso, prolongado o nada parece calmarlo, puede haber algo más que solo molestias en las encías.</li>
                            <li><strong>Rechazo completo de alimentos o líquidos:</strong> una ligera pérdida de apetito es normal, pero si no quiere comer ni tomar líquidos por varias horas, es un foco rojo. reconocer lo que sienten (entiendo que estés enfadado) les ayuda a sentirse comprendidos y disminuye su frustración.</li>
                            <li><strong>Sarpullido generalizado (más allá de la boca o cuello)</strong> el salpullido por babita es común, pero si aparecen ronchas o irritaciones en otras partes del cuerpo, puede ser una reacción o enfermedad.</li>
                            <li><strong>Convulsiones, letargo o somnolencia excesiva,</strong> no tienen relación con la dentición, son señales de urgencia médica.</li>
                            <li><strong>Dificultad para respirar o tragar</strong> si al morder algún objeto el bebé se atraganta, se debe actuar de inmediato, también puede ser un signo de inflamación o infección.</li>
                        </ul>
                        </div>

                        <p>Llevar un registro de los síntomas, su duración y cualquier otro comportamiento inusual. Esa información será muy útil para el pediatra. Si presenta síntomas fuera de lo común o más intensos, es importante consultar al pediatra, ya que podrían no estar relacionados directamente con la dentición.</p>

                        <p>La primera consulta con odontopediatría debe ser alrededor del primer año de vida, con la salida del primer diente, y como máximo a los 12 meses esta primera visita odontológica debe incluir una evaluación individual de riesgo de caries y consejos sobre higiene bucal, hábitos alimentarios, frecuencia de la ingesta de azúcares, medicamentos y el uso de flúor tópico.</p>

                        <h3>Bibliografía</h3>
                        <p>Healthychildren (2025) Dentición en bebé: cómo aliviar el dolor de los primeros dientes.dienteshttps://www.healthychildren.org/Spanish/agesstages/baby/teethi ng-tooth-care/Paginas/Teething-Pain.aspx.</p>
                        <p>Marcillo Zambrano (2016). Prevalencia de síntomas asociados a la erupción primaria en lactantes de 6 a 12 meses en el centro de salud (Tesis de pregrado). Universidad de las Américas Quito. https://dspace.udla.edu.ec/handle/33000/6091.</p>
                        <p>María, N. (2021) Salud voval y enfoque de l atención odonlogica en bebés. Repositorio institucional de la Universidad San Gregorio de Portoviejo. http://repositorio.sangregorio.edu.ec/handle/123456789/2320.</p>
                    `
                },

                {
                    id: 49,
                    titulo: "🌈🫶 La crisis de los dos años: entendiendo sus emociones para acompañar con firmeza y amor",
                    resumen: "No es “mala conducta”, es crecimiento. Este texto le ayuda a comprender qué hay detrás de los “terribles dos”, qué comportamientos pueden aparecer y qué hacer, con rutinas, límites y apoyo emocional, para que su peque se sienta seguro y acompañado.",
                    imagen: "assets/img/articulos/49.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <h1 style="font-size:32px;line-height:1.15;margin:10px 0 14px 0;">La Crisis de los Dos Años</h1>

                        <p>Probablemente hayas escuchado en conversaciones el concepto de los “Terribles dos”, 
                        refiriéndose a la época previa y a los dos años de los peques. Este concepto puede 
                        resultar peyorativo, pues en muchas ocasiones los peques son etiquetados sin conocer 
                        profundamente lo que ocasiona la crisis. Se debe considerar que cada peque tiene 
                        reacciones diferentes ante esta etapa de su vida, por ello la importancia de brindar 
                        seguridad emocional desde antes para evitar que se sienta solo.</p>

                        <p>Como cuidadores podemos notar que el peque tiene cambios y 
                        transformaciones en sus comportamientos, causando incertidumbre acerca de cómo 
                        debemos reaccionar como adultos ante estas crisis, sin embargo, es importante que 
                        conozcamos también el origen de estos desbordes emocionales.</p>

                        <h3>¿Qué ocasiona estos comportamientos?</h3>

                        <p>Los peques se desarrollan de una manera muy rápida desde su nacimiento, sin embargo, 
                        aproximadamente a los dos años este ritmo de desarrollo empieza a reducirse. Es posible 
                        que el peque deje de comer igual que lo hacía antes o no siga con los mismos patrones 
                        de sueño, porque su corporalidad ya no lo requiere.</p>

                        <p>Así mismo, a esta edad empiezan a explorar sus capacidades sociales y su propia 
                        voz, sus capacidades corporales -idealmente- han crecido bastante y empiezan a 
                        explorar el mundo a través de su motricidad para conocer sus propias habilidades, 
                        buscando adquirir independencia y autonomía.</p>

                        <p>Así también, es importante que se trabajen las emociones de los peques desde su 
                        nacimiento y que el tipo de apego que tenga con sus principales figuras de cuidado sea 
                        seguro.</p>

                        <h3>Comportamientos generales que pueden tener los peques en esta etapa</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Quieren más independencia de lo normal, es posible que eviten a sus figuras de 
                            cuidado o huyan de ellos para explorar en solitario.</li>
                            <li>Aparecen desbordes emocionales en cualquier momento, inclusive cuando no 
                            encontramos una razón aparente.</li>
                            <li>Hacen un mayor uso de la palabra “no”, parece que se vuelve su favorita y que 
                            ni siquiera la piensan mucho, sólo la dicen en cualquier interacción social.</li>
                            <li>Protestan por casi todo, incluso cuando obtendrán algún beneficio de las 
                            indicaciones que se les da.</li>
                        </ul>
                        </div>

                        <p>Estas características no suceden en la misma intensidad en todos los peques, es probable 
                        que en algunos sean más agudas las reacciones y en otros pasen desapercibidas. Por 
                        ello, la importancia de darle seguridad emocional desde temprana edad para hacerles 
                        más llevadero el proceso interno que están llevando.</p>

                        <p>Por último, consideramos prudente mencionar que puede llegar a suceder que 
                        los peques se comporten muy tranquilos con algunos familiares, pero con los papás o 
                        principales figuras de cuidado sean un poco más “obstinados”, esto sucede porque en 
                        ellos encuentran un lugar seguro donde pueden expresarse y saben que no los 
                        abandonarán, cosa que no lo sienten de cualquiera y con mayor razón en esta edad 
                        ponderan las capacidades no sólo suyas, sino también de los demás.</p>

                        <h3>Ahora bien, ¿qué podemos hacer nosotras para apoyar en el proceso?</h3>

                        <div class="reading-note">
                        <p><strong>1. Establece rutinas:</strong> Al establecer rutinas y hábitos, le damos seguridad a los peques 
                        y adquieren responsabilidad ante su propio cuidado. Si es necesario y útil, se 
                        recomienda establecerlas con imágenes y apoyos visuales que permitan que los 
                        niños sean partícipes en su construcción.</p>

                        <p><strong>2. Apoyo emocional y comunicación asertiva:</strong> Aunque sabemos que puede ser 
                        complejo abordar a los peques en sus desbordes emocionales, es importante 
                        hacerlos sentir que no están solos y que pueden contar con alguien.</p>

                        <p>Por ello, se recomienda seguir los siguientes pasos ante un desborde emocional:</p>

                        <ul>
                            <li>Agáchate para ponerte a su nivel físico.</li>
                            <li>Escucha lo que te quiera decir (en caso de que verbalice sus pensamientos).</li>
                            <li>Permite que llore y ofrece un abrazo o tu compañía.</li>
                            <li>Evita a toda costa que lastime a alguien más o a sí mismo, mantén los límites,
                            aunque sea difícil, pues sus desbordes no deben llevar a un daño físico para 
                            ninguna parte.</li>
                            <li>Una vez que el peque haya pasado por ese momento, explica lo sucedido y 
                            bríndale opciones, busquen soluciones al problema en conjunto, siempre con 
                            el objetivo y los límites claros. Por ejemplo, si el peque lloró porque quería un 
                            dulce y no puede consumirlo, mantén el “no” y ofrécele otras opciones como 
                            fruta o algún otro alimento saludable de su elección.</li>
                        </ul>

                        <p><strong>3. Enséñale acerca de la educación emocional:</strong> Dentro de su rutina hagan uso de 
                        cuentos y demás materiales para permitirle que él identifique sus propias 
                        emociones, pueden empezar desde los demás y poco a poco llevarlo hacia él 
                        mismo, con el fin de generar empatía y conciencia personal del peque (leer 
                        artículo Actividades Socioemocionales en Carpeta de Nannys y Peques).</p>

                        <p><strong>4. Ten mucha paciencia y empatía a su proceso:</strong> Es importante identificar que tú (su
                        cuidadora) eres el adulto responsable; mostrándole paciencia y empatía, esto les 
                        ayudará a ejemplificarles y así tener las mismas actitudes hacia sí mismos y los 
                        demás.</p>
                        </div>

                        <h3>Referencias</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Folgado, A. C. (2025).</span> <span>Guía para manejar los terribles dos años del bebé con firmeza y amor. Guiainfantil.com. https://www.guiainfantil.com/articulos/bebes/los￾terribles-dos-anos-del-nino/</span></div>
                        <div class="rt-row"><span>Lillydoo. (s/f).</span> <span>La crisis de los dos años. https://magazine.lillydoo.com/es￾ES/revista/crisis-de-los-dos-a%C3%B1os</span></div>
                        <div class="rt-row"><span>KiddyLove. (2023).</span> <span>La crisis de los dos años. https://kiddylove.es/la-crisis-de-los-dos￾anos/</span></div>
                        <div class="rt-row"><span>Hiwell, (2024).</span> <span>¿Qué Son Los “Terribles Dos Años”? ¿Cuáles Son Los Síntomas Y Cómo 
                        Deberías Tratar Con Tu Hijo De 2 Años? https://www.hiwellapp.com/es￾ES/blog/terribles-dos-anos</span></div>
                        <div class="rt-row"><span>Tarrés, S. (2020).</span> <span>Guía de supervivencia a la terrible crisis de los 2 años de los niños. 
                        Guiainfantil.com. https://www.guiainfantil.com/educacion/conducta/guia￾de-supervivencia-a-la-terrible-crisis-de-los-2-anos-de-los-ninos/</span></div>
                        <div class="rt-row"><span>Valencia, M. C. (2021).</span> <span>¿En qué consiste la crisis de los 2 años? Mi Cole; Centro de 
                        Educación Infantil Mi Cole. https://micolevalencia.org/en-que-consiste-la￾crisis-de-los-2-anos/</span></div>
                        </div>
                    `
                },

                {
                    id: 50,
                    titulo: "🗣️ Cuando tu peque habla, su mundo se abre: guía amorosa para estimular el lenguaje a los 2 años",
                    resumen: "Cada palabra que tu peque intenta decir es un paso enorme hacia su confianza y su conexión contigo. Aquí encontrarás orientaciones claras y juegos sencillos (0 a 3 años) para acompañar su lenguaje con paciencia, cariño y constancia, respetando su ritmo.",
                    imagen: "assets/img/articulos/50.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Lenguaje en peques de 2 años</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">💛 El lenguaje como puente</strong>
                        <p style="margin:10px 0 0 0;">El lenguaje es instrumento y medio fundamental en el proceso de socialización, 
                        permitiendo la adaptación al medio y su integración, así como la adquisición de 
                        valores, creencias, opiniones, costumbres, correspondientes al contexto social de 
                        pertenencia, al tiempo que aprende a saber lo que se espera de él, qué tiene que
                        esperar de los demás y a comportarse en cada situación. Estas
                        pautas culturales se transmiten a través del lenguaje hablado.</p>
                        </div>

                        <p>El lenguaje oral es una función y una destreza que se aprende de forma natural, a 
                        través de una serie de intercambios con el entorno social. La adquisición del 
                        lenguaje es un proceso evolutivo que sigue su propio curso y ritmo, siendo éste 
                        diferente en cada niño. Que nuestros peques pronuncien y articulen bien los 
                        sonidos, depende, en gran medida, como cuidadores ofrezcamos unos
                        modelos correctos de pronunciación. En el control de la articulación intervienen: el
                        oído, la respiración, el soplo, y la capacidad de movilidad de los órganos 
                        bucofonatorios como: lengua, labios, dientes, paladar, maxilar, etc.</p>

                        <p>La estimulación del lenguaje a través del diálogo y el juego debe ser constante, 
                        sistemática y adecuada a las características del niño y de su familia desde las 
                        etapas más tempranas del desarrollo.</p>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong style="display:block;">Nuestro objetivo primordial, es que el niño se comunique a través de: miradas, 
                        sonrisas, palabras, signos, siempre apostando por la existencia de intención 
                        comunicativa.</strong>
                        </div>

                        <p>A continuación, les compartimos una serie de orientaciones para la estimulación del 
                        lenguaje de los peques:</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row"><span>No juntar ni suprimir los finales de las palabras.</span><span>✅</span></div>
                        <div class="rt-row"><span>Convertir en juego la imitación provocada. Ejemplo: repite lo que 
                        yo diga.</span><span>🎭</span></div>
                        <div class="rt-row"><span>Evitar interrumpir el discurso para corregir la articulación.</span><span>🤍</span></div>
                        <div class="rt-row"><span>Corregir mediante la conversación normal.</span><span>🗣️</span></div>
                        <div class="rt-row"><span>Evitar el uso del lenguaje infantilizado con diminutivos, o repetir las palabras 
                        incorrectas, aunque suenen graciosas.</span><span>⚠️</span></div>
                        <div class="rt-row"><span>Respetar el progreso y ritmo comunicativo de cada niño.</span><span>⏳</span></div>
                        <div class="rt-row"><span>Ser flexibles y naturales.</span><span>🌿</span></div>
                        <div class="rt-row"><span>Permitir al niño que lleve la iniciativa comunicativa respetando sus 
                        intereses y gustos.</span><span>⭐</span></div>
                        <div class="rt-row"><span>Seguir la iniciativa del niño interpretando lo que nos quiere decir.</span><span>👂</span></div>
                        <div class="rt-row"><span>Dedicar exclusivamente al niño un tiempo diario para realizar conjuntamente 
                        juegos, lectura de cuentos, canciones, dibujos etc.</span><span>📖</span></div>
                        <div class="rt-row"><span>Observar y escuchar cómo se comunica el niño. Reforzarsus éxitos.</span><span>👏</span></div>
                        <div class="rt-row"><span>Noanticiparse a sus vocalizaciones, ni terminar lasfrasespor él.</span><span>🧩</span></div>
                        <div class="rt-row"><span>Respetar losturnos de “palabra” así como el silencio.</span><span>🤫</span></div>
                        <div class="rt-row"><span>Ponerse cara a cara, frente al niño, a su altura. Utilizar un tono agradable y 
                        dulce.</span><span>😊</span></div>
                        <div class="rt-row"><span>Hacer preguntas abiertas, no cerradas de si o no. Amplía sus 
                        mensajes.</span><span>💬</span></div>
                        <div class="rt-row"><span>Da “la vuelta” a sus preguntas animándole a pensar y a manifestar sus 
                        opiniones. Por ejemplo: ¿por qué...? ¿A ti que te parece?</span><span>🧠</span></div>
                        <div class="rt-row"><span>Después de hacer una actividad interesante para el niño, como viajes, 
                        cumpleaños, excursiones... comenta con él todo lo ocurrido, háblale de ese 
                        acontecimiento, que te cuente lo que ha pasado.</span><span>🗺️</span></div>
                        <div class="rt-row"><span>Permitir que su peque exprese sus necesidades o lo que desea y no reaccionar o 
                        proporcionar lo solicitado sin permitir que haya un esfuerzo por parte de su peque 
                        para hablar.</span><span>🫶</span></div>
                        <div class="rt-row"><span>Hablar de forma clara, correcta, pausada tan a menudo como sea posible.</span><span>🕊️</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Juegos y actividades para el desarrollo del lenguaje de 0 a 3 años</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <p><strong>Caras raras.</strong> El desarrollo del lenguaje en los niñossurge a través de la imitación. Al poner
                        caras raras para hacer reír a los bebés, les enseñamos las diferencias entre cara 
                        triste, alegre y miedo, entre otras. Aunque aún no saben hablar, así aprenderán 
                        rápidamente a asociar las emociones.</p>

                        <p><strong>Busco el sonido.</strong> Juega a esconderte por algún sitio de la casa y haz un sonido 
                        fuerte (una palmada, un tamborazo o simplemente llámalo por su nombre). Te 
                        tiene que encontrar por toda la casa y cuando lo haga…. ¡Risas y alegría! Prémialo 
                        con tu cariño.</p>

                        <p><strong>Golpes y Ritmos.</strong> En este juego se trata de que imite el número de palmas que oiga.
                        Cambiaremos el ritmo y cada vez lo iremos haciendo más y más difícil.</p>

                        <p><strong>¿Qué veo?</strong> En cualquier lugar puedes hacer esta actividad, dale primero pistas 
                        semánticas como «veo una especie de planta muy grande con hojas y un tronco 
                        que se llama…»</p>

                        <p><strong>Quiero quiero…</strong> pon a prueba a tu peque y siempre que quiera algo dale a elegir 
                        entre dos cosas. ¿Quieres un yogur o leche? De esta manera le obligamos a 
                        comunicar y señalar aquello que desea.</p>

                        <p><strong>Equivócate.</strong> Juega a equivocarte con las palabras, si quiere leche dile que se 
                        llama pan…hazte el loco y divertido equivocándote para que el peque tenga 
                        que decirlo bien.</p>

                        <p><strong>Canta canciones.</strong> Busca y canta canciones con tu peque. El juego consiste en 
                        escenificarlas con gestos divertidos, para que te observe, mantenga su atención e 
                        intente imitarte.</p>

                        <p><strong>Onomatopeyas:</strong> Juega con tu peque a hacer el sonido de una onomatopeya, que es
                        el ruido que hacen las cosas y los animales. Todo suena en casa: Una puerta
                        (pum), el microondas (pin), la vaca (muuu)… Por lo que será un buen
                        acercamiento hacia la fonología de nuestro idioma.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p><strong>Imitar.</strong> La imitación de roles simbólicos ayudará a tu peque a ganar destrezas 
                        manipulativas y continuar aprendiendo sobre el funcionamiento del mundo a 
                        través del juego entre lo real e imaginario. Este tipo de juego permite a tu peque 
                        imitar situaciones reales, como hacer como si se peinase, hablar por teléfono o 
                        comer. Todo esto realizado con objetos que pueden o no ser exactamente los 
                        propios de esa acción.</p>

                        <p><strong>Oigo o no oigo.</strong> Usa cualquier juguete de insertar, tu peque debe colocar una ficha en 
                        su oído y cuando oiga un sonido hecho por ti (sin que te vea) debe echar la ficha
                        en el juguete. Se pueden usar instrumentos musicales o la voz, entre otros.</p>

                        <p><strong>Hacer collages con recortes de revistas e inventarse historias o cuentos.</strong></p>
                        <p>-Presentarle unas fotos o álbum y que él identifique a las personas que ve en ellas. 
                        También que cuente lo que ve.</p>
                        <p>-Al ducharlo o realizar cualquier actividad nombrar todo lo que utilizamos, por
                        ejemplo: champú, gel, esponja, agua, bañera, toalla.</p>
                        <p>-Hacerlos partícipes en las tareas cotidianas, como: poner la mesa, hacer la comida, ir
                        a la compra, ayudar a papá y mamá en sus labores.</p>
                        <p>-Mirar con él cuentos y revistas, que diga los nombres de los objetos que aparecen en
                        las imágenes. Contarle cuentos haciéndolo partícipe, pídele ayuda en algún 
                        momento y hazle preguntas.</p>
                        </div>

                        <h3 style="margin-top:26px;">Referencias:</h3>
                        <p>Blaclinic. (2022). Juegos para estimular el desarrollo del lenguaje. Blaclinic. Disponible
                        en: https://www.blaclinic.com/juegos-para-estimular-el-lenguaje- desarrollo-del-tus￾hijos/</p>

                        <p>Temas para la educación. (enero 2010). Estimulación del lenguaje oral en niños de 2 a
                        3 años. Revista digital para profesionales de la enseñanza, (6), pp. 1-6.
                        Disponible en: https://www.feandalucia.ccoo.es/docu/p5sd67</p>

                    </div>
                    `
                },

                {
                    id: 51,
                    titulo: "🗣️✨ Lenguaje en peques de 2 años: cómo acompañar su voz, su mente… y su mundo",
                    resumen: "El lenguaje no solo son palabras: es emoción, pensamiento y conexión. Este material le guía por teorías clave y estrategias prácticas para estimular el lenguaje de forma respetuosa, natural y significativa en la rutina diaria.",
                    imagen: "assets/img/articulos/51.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                        <div class="reading-note" style="background:linear-gradient(135deg, rgba(232,76,154,.08), rgba(59,182,196,.10));border-left:5px solid var(--pink-main);">
                        <h1 style="font-size:32px;line-height:1.15;margin:4px 0 10px 0;">Lenguaje en peques de 2 años</h1>
                        <p style="margin:0;opacity:.9;">El desarrollo del lenguaje para el ser humano es un parte esencial de 
                    adaptación al mundo que lo rodea, siendo éste la base de la comunicación 
                    humana. Para ello, a continuación, hablaremos de las 6 principales teorías 
                    del lenguaje, en conjunto con estrategias para abordarlas dentro del 
                    trabajo educativo.</p>
                        </div>

                        <p>Es importante mencionar que siempre es relevante considerar las 
                    características contextuales de los peques a los que vamos a abordar desde 
                    las siguientes áreas:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>o Social:</span><span>Conjunto de relaciones y hechos interpersonales en las que el 
                    peque se desarrolla.</span></div>
                        <div class="rt-row"><span>o Psicológica:</span><span>Mecanismos mentales con los que el peque interpreta al 
                    mundo que le rodea.</span></div>
                        <div class="rt-row"><span>o Fisiológica:</span><span>Características físicas que se encargan de las necesidades 
                    básicas del peque.</span></div>
                        <div class="rt-row"><span>o Emocional:</span><span>Conductas que se producen en el peque a través de 
                    diferentes estímulos.</span></div>
                        </div>

                        <p>El fin de observar las anteriores áreas es principalmente para abordar de
                    manera adecuada las necesidades del peque, sin perder de vista que todo 
                    tiene su raíz en aspectos mucho más profundos que la desidia o el descuido.</p>

                        <p>Para tomar en cuenta algunos de los diferentes aspectos del desarrollo 
                    infantil, retomaremos en este documento cuatro teorías importantes y nos 
                    enfocaremos en el proceso de desarrollo del lenguaje de cada una de ellas, 
                    las cuales son: Teoría del Desarrollo Cognitivo de Jean Piaget, Teoría 
                    Sociocultural de Lev Vygotsky, Mecanismo para la Adquisición del Lenguaje 
                    de Noam Chomsky y Teoría del Lenguaje de Jerome Bruner.</p>

                        <p>Para entender cada teoría, en la primera parte de este documento se 
                    encuentran unas breves explicaciones acerca de cada teoría y en la 
                    segunda parte del documento se encuentra una tabla vinculando cada 
                    teoría con estrategias para aplicarse y con apoyos visuales para entender 
                    su práctica en la vida diaria con los peques.</p>

                        <h3>Teoría del Desarrollo Cognitivo – Jean Piaget</h3>

                        <p>El psicólogo suizo Jean Piaget (1896-1980) clasifica el desarrollo infantil en 
                    cuatro grandes periodos: sensoriomotor (0 a 2 años), preoperacional (2 a 7 
                    años), operaciones concretas (7 a 11 años) y operaciones formales (a partir 
                    de los 11 años).</p>

                        <p>Con fines de interés, nos enfocaremos en la etapa preoperacional, la cual, 
                    según Jean Piaget, comienza en el momento en el que el peque comienza 
                    con el aprendizaje del habla. Piaget considera que el lenguaje, más allá de 
                    ser un medio para conseguir la comunicación social, es regulador entre los 
                    modos de conocer y modos de comportarse. Explicado de otra manera, 
                    Piaget opina que el lenguaje que se conoce primero define y después 
                    comunica.</p>

                        <p>Por ello, el trabajo del lenguaje en esta etapa es importante iniciarlo incluso 
                    antes de esta edad. Por ejemplo, antes de que el peque sepa decir 
                    “calcetín”, debe saber a través de su propia exploración que ese objeto le 
                    calienta y va en su pie.</p>

                        <h3>Teoría Sociocultural – Lev Vygotsky</h3>

                        <p>La siguiente teoría producida por el psicólogo Lev Vygotsky (1896-1934) 
                    hace un gran énfasis en la producción de conocimiento a través de las 
                    relaciones sociales del ser humano. De esta manera, Vygotsky plantea que 
                    el conocimiento del ser humano se construye de manera gradual y que el 
                    entorno en el que el peque se desarrolla es el mayor influyente en su forma 
                    de pensar.</p>

                        <p>A comparación de Piaget, Vygotsky plantea que primero se adquiere el 
                    lenguaje y por consiguiente se empieza a dar el significado al objeto. El 
                    lenguaje, asimismo, se adquiere a través de las relaciones sociales y lo que 
                    ocurre a través de ellas.</p>

                        <h3>Mecanismo de Adquisición del Lenguaje – Noam Chomsky</h3>

                        <p>El teórico Noam Chomsky (1928-Actualidad) plantea que la adquisición del 
                    lenguaje es un dispositivo innato en el cerebro humano, es decir, considera 
                    que de manera implícita y natural el pequeño aprende las normas del 
                    lenguaje básicas, de la misma forma que cuentan con las capacidades 
                    necesarias para entender la lengua materna y, por ello, el peque logra 
                    producir muchas oraciones nuevas, aunque no las haya escuchado 
                    anteriormente.</p>

                        <p>La teoría de Chomsky tiene un enfoque biolingüístico, posibilitando que el 
                    proceso de adquisición y dominio de la lengua se desarrolle de manera 
                    natural en el ser humano. De esta manera, el sistema mente/cerebro es el 
                    que crea las expresiones meramente abstractas denominadas como 
                    lenguaje.</p>

                        <h3>Teoría del Lenguaje – Jerome Bruner</h3>

                        <p>Jerome Bruner (1915-2016), propone que el lenguaje es la respuesta a la 
                    asociación de diferentes estímulos y respuestas, siendo de esta forma un 
                    aprendizaje gradual. De esta manera, él/la peque aprende a través de la 
                    constante interacción con el adulto y va asociando las ideas con ayuda de 
                    un refuerzo constante.</p>

                        <p>De la misma manera, Bruner propone el concepto de Dispositivo de Apoyo 
                    de Adquisición del Lenguaje, el cual funge como regulador entre las 
                    interacciones sociales y los formatos culturales donde se dan las expresiones. 
                    Por ello, él/la peque no sólo aprende qué decir sino también cómo decirlo 
                    en una cultura en particular.</p>

                        <div class="reading-note" style="border-left:5px solid var(--blue-main);">
                        <h3 style="margin-top:0;">Teoría  Teórico  Estrategias  Imágenes Ilustrativas</h3>
                        <p style="margin:0;color:var(--text-muted);">A continuación se presentan las estrategias tal como vienen en el documento.</p>
                        </div>

                        <div class="reading-table" style="padding:0;overflow:hidden;">
                        <div class="rt-row" style="background:#F1F5F9;font-weight:800;">
                            <span style="flex:1;">Teoría</span>
                            <span style="flex:1;">Teórico</span>
                            <span style="flex:2;">Estrategias</span>
                            <span style="flex:1;">Imágenes Ilustrativas</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start;">
                            <span style="flex:1;font-weight:800;color:var(--pink-main);">Teoría del Desarrollo 
                    Cognitivo</span>
                            <span style="flex:1;">Jean Piaget 
                    (1896-1980)</span>
                            <span style="flex:2;">
                            <div style="margin-bottom:10px;">
                                <strong>1.Exploración de objetos:</strong> Elije el objeto que se 
                    vaya a utilizar en la sesión (tu material de 
                    trabajo, por ejemplo) y no le digas nada al 
                    pequeño durante unos minutos. Permite que lo 
                    explore como lo prefiera, una vez que observes 
                    que ya lo reconoció lo suficiente, empieza a 
                    decirle su nombre y muéstrale cómo funciona, 
                    con frases descriptivas, por ejemplo: “Esto es un 
                    calcetín, va en el pie y te calienta. Es rojo y tiene 
                    manchitas blancas.”.
                            </div>
                            <div>
                                <strong>2.Paseen:</strong> Se puede pasear dentro del domicilio 
                    o fuera de él, el objetivo es que la persona 
                    adulta guíe el recorrido y se mantenga en 
                    silencio, no hace falta que se explique mucho 
                    acerca de lo que se hace, se tiene que dejar 
                    que él/la peque observe y analice. En caso de 
                    que él/la peque empiece a señalar, balbucear 
                    y/o hacer sonidos, refuerza lo que se señala 
                    diciendo su nombre. Por ejemplo, él/la peque 
                    empieza a señalar a la gente pasar, sólo se 
                    reforzaría: “Sí, mira, la gente está pasando. Mira, 
                    un coche.”
                            </div>
                            </span>
                            <span style="flex:1;color:var(--text-muted);"> </span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start;">
                            <span style="flex:1;font-weight:800;color:var(--pink-main);">Teoría Sociocultural</span>
                            <span style="flex:1;">Lev Vygotsky 
                    (1896.1934)</span>
                            <span style="flex:2;">
                            <div style="margin-bottom:10px;"><strong>1.Charla con otros peques:</strong> Dentro de las 
                    posibilidades, permite que explore el lenguaje 
                    con otros peques, llévalo al parque, observa 
                    cómo interactúa y cómo busca comunicarse.</div>

                            <div style="margin-bottom:10px;"><strong>2.Teatrito:</strong> En medida de lo posible, arma un 
                    pequeño escenario y con juguetes o peluches, 
                    representa acciones de la vida diaria que los 
                    pequeños conozcan o hayan vivido. Si los 
                    pequeños se muestran interesados, permite que 
                    ellos también representen esas escenas y 
                    diálogos.</div>

                            <div style="margin-bottom:10px;"><strong>3.Adivinanzas, trabalenguas, rimas:</strong> Durante su 
                    rutina de actividades, puedes irle diciendo 
                    algunas rimas, no es necesario que te sientes 
                    con él/ella sólo a decirle estas creaciones 
                    literarias, inclusive si lo haces durante una 
                    acción es más fácil que el pequeño la recuerde 
                    e intente decirle.</div>

                            <div><strong>4.¿Dónde están?:</strong> Hazle preguntas básicas 
                    acerca de sus familiares y objetos que conozca, 
                    por ejemplo: “¿Dónde está mamá? ¿Dónde 
                    está papá? ¿Dónde está _____?” Inclusive 
                    puedes preguntarle dónde está él/ella. Permite 
                    que te responda, no te adelantes a decirle, deja 
                    que él/ella busque la respuesta.</div>
                            </span>
                            <span style="flex:1;color:var(--text-muted);"> </span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start;">
                            <span style="flex:1;font-weight:800;color:var(--pink-main);">Mecanismo para la 
                    Adquisición del 
                    Lneguaje</span>
                            <span style="flex:1;">Noam Chomsky 
                    (1928-Act.)</span>
                            <span style="flex:2;">
                            <div style="margin-bottom:10px;"><strong>1.Permite que él/ella “hablen”:</strong> Durante su rutina 
                    diaria y cuando a él/ella le parezca pertinente, 
                    permite que haga los balbuceos que quiera. A 
                    la edad de 18 meses a los 24, empiezan a 
                    balbucear con entonación, entonces, continúa 
                    la plática observando si están señalando un 
                    objeto o una situación.</div>

                            <div style="margin-bottom:10px;"><strong>2.No lo fuerces:</strong> En vez de obligarle a decir una 
                    palabra en específico, sólo continúa 
                    hablándole como si fuera una gran 
                    conversación, imagínate los diálogos e 
                    interactúa con sus expresiones.</div>

                            <div><strong>3.Pídele “favores”:</strong> Durante su rutina, pídele que 
                    te “ayude” con tareas sencillas, como llevar 
                    algo a su lugar, que te pase algo, etc. Motívalo 
                    a través del diálogo con peticiones, por 
                    ejemplo: “¿Te acuerdas de dónde está el 
                    zapato? ¿Me lo pasas por favor?” o “Tú sabes 
                    dónde está el zapato, ¿me lo puedes pasar?”
                    Todo de manera natural, para que el pequeño 
                    sienta que están siendo valoradas sus 
                    capacidades mentales.</div>
                            </span>
                            <span style="flex:1;color:var(--text-muted);"> </span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start;border-bottom:none;">
                            <span style="flex:1;font-weight:800;color:var(--pink-main);">Teoría del Lenguaje</span>
                            <span style="flex:1;">Jerome Bruner 
                    (1915-2016)</span>
                            <span style="flex:2;">
                            <div style="margin-bottom:10px;"><strong>1.Acción-Reacción:</strong> Hagan juegos simples y 
                    básicos que contengan una reacción a los 
                    resultados. Por ejemplo, el juego de 
                    “Congelados”, una vez que alguien esté 
                    congelado y otra persona tenga que pasar por 
                    debajo de sus piernas, sé clara con las 
                    instrucciones y represéntalas para que él/la 
                    peque comprenda que sólo pasando por 
                    debajo de las piernas se podrá mover. También 
                    se puede hacer uso de canciones con el 
                    concepto de “congelados”.</div>

                            <div style="margin-bottom:10px;"><strong>2.Palabras mágicas:</strong>Dentro de su rutina, siempre 
                    que él/ella te ayude o “haga un favor” 
                    agradécele. Así mismo, cuando alguien haga 
                    algo por él/la peque, haz énfasis en dar las 
                    gracias, aunque él/la peque todavía no las 
                    pronuncie bien, es importante que empiece a 
                    darle connotación de agradecimiento a sus 
                    balbuceos.</div>

                            <div><strong>3.Juegos mexicanos:</strong> Dentro de la gran 
                    variedad de juegos, existen los típicos de México 
                    que cuentan con rimas y canciones muy útiles 
                    para el desarrollo cultural y social de él/la 
                    peque. Entre ellos: “Dale, dale (piñata)”, “El 
                    Lobo”, “La Rueda de San Miguel”, “La Víbora de 
                    la Mar”, “La Lotería”, etc.</div>
                            </span>
                            <span style="flex:1;color:var(--text-muted);"> </span>
                        </div>
                        </div>

                        <h3>REFERENCIAS</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Cárdenas, A. (2011, 30 junio).</span><span>Piaget: Lenguaje conocimiento y educación. Scielo. 
                    Recuperado 29 de enero del 2025, de Scielo - Piaget: Conocimiento, 
                    lenguaje y Educación</span></div>

                        <div class="rt-row"><span>Mota, C., & Villalobos, J. (2007, 16 marzo).</span><span>El aspecto socio-cultural del 
                    pensamiento y del lenguaje: visión vygostkyana. Scielo. Recuperado 29 de 
                    enero del 2025, de El aspecto socio-cultural del pensamiento y del 
                    lenguaje: visión vygotskyana</span></div>

                        <div class="rt-row"><span>Barón, L., & Müller, O. (2014).</span><span>La teoría lingüística de Noam Chomsky: del inicio a
                    la actualidad. Scielo. Recuperado 29 de enero de 2025, de La teoría 
                    lingüística de Noam Chomsky: del inicio a la actualidad</span></div>

                        <div class="rt-row"><span>Aramburu Oyarbide, M. (2004).</span><span>Jerome Seymour Bruner: de la percepción al 
                    lenguaje. Revista Iberoamericana De Educación, 34(1), 1–19. La teoría 
                    lingüística de Noam Chomsky: del inicio a la actualidad</span></div>
                        </div>
                    `
                },

                {
                    id: 52,
                    titulo: "✍️ Manuscrita: el arte de escribir bonito (y cómo ayuda al cerebro de su peque)",
                    resumen: "La letra cursiva no es solo “caligrafía”: es coordinación, memoria muscular y desarrollo cognitivo. Aquí encontrará características clave y ejercicios prácticos para acompañar a su peque paso a paso, con actividades claras y visuales.",
                    imagen: "assets/img/articulos/52.jpeg",
                    categoria: "Cognitivo",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/33.jpg')"></div>

                        <div class="reading-note" style="margin-top:0;">
                        <strong>Manuscrita</strong>
                        </div>

                        <p>La escritura cursiva, también conocida como letra manuscrita, se define como el arte de escribir. De acuerdo con los expertos es una técnica muy antigua en la que existe un cuidado minucioso de los trazos y formas de las letras para lograr un escrito hermoso.</p>

                        <div class="reading-note">
                        <strong>• Características de la letra</strong>
                        </div>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">1.</span>
                            <span style="flex:1;">La letra cursiva se caracteriza por la inclinación de sus letras y por unir o enlazar unas letras con otras, permitiendo una mayor agilidad en la escritura y un movimiento natural y continuo de la mano.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">2.</span>
                            <span style="flex:1;">Solo requiere tres movimientos: el bastón, el lazo y el túnel y arriba –abajo, los movimientos para su realización son más naturales para los peques.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">3.</span>
                            <span style="flex:1;">Mejorar la ortografía, gracias a que fomenta la memoria muscular, ayuda a desarrollar las habilidades motrices finas, cuando se va ejercitando la coordinación y la consciencia visual y espacial.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">4.</span>
                            <span style="flex:1;">Facilita la escritura para los zurdos debido a que escriben hacia arriba y a la derecha, lo cual evita que tapen su escrito con el brazo.</span>
                        </div>
                        </div>

                        <p>Se ha descubierto que el aprendizaje de la letra cursiva es una herramienta crucial para el desarrollo cognitivo, para entrenar el cerebro desde del rendimiento óptimo de los dos hemisferios del cerebro.</p>

                        <div class="reading-note">
                        <strong>• Estrategias para la manuscrita:</strong>
                        </div>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">1.</span>
                            <span style="flex:1;">Calentamientos de manos (ejercicios de calentamiento, movimientos de muñecas, movimientos de dedos, flexión y distensión de los dedos)</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">2.</span>
                            <span style="flex:1;">Realizar algunos trazos a mano alzada:</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">3.</span>
                            <span style="flex:1;">Repaso y conocimiento de patrones: este punto consiste en realizar una similitud de cada una de las letras y reconocer las letras que comienzan con el mismo patrón o grupo como lo muestra el ejemplo:</span>
                        </div>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>Ejercicio 1</strong>
                        <p style="margin:12px 0 0 0;">Ejercicio 1</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>Ejercicio 2</strong>
                        <p style="margin:12px 0 0 0;">Ejercicio 2</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>Ejercicio 3</strong>
                        <p style="margin:12px 0 0 0;">Ejercicio 3</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>Ejercicio 4</strong>
                        <p style="margin:12px 0 0 0;">Ejercicio 4</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <strong>Ejercicio 5</strong>
                        <p style="margin:12px 0 0 0;">Ejercicio 5</p>
                        </div>

                        <h3 style="margin-top:28px;">REFERENCIAS</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>• Gómez, J. y Gutiérrez, M. ¿Por qué enseñar la letra cursiva? Recuperado en enero de 2014 de: http://www.yosoymuyinteligente.com/index.php/cartilla-en-letra￾cursiva</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span>• Azahara (Letras Caligrafía y Lettering), (junio 2021), 5 Pasos para Mejorar la Cursiva Manuscrita, https://www.youtube.com/watch?v=Cj2vqGu2Lq0</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 53,
                    titulo: "🌈 Manejo de berrinches: calma, amor y herramientas para acompañar sin romper el vínculo",
                    resumen: "Un berrinche no es “mala conducta”: es un peque desbordado que todavía está aprendiendo a sentir y regularse. Esta guía te da alternativas claras para antes, durante y después, con frases y acciones que sostienen, enseñan y cuidan la confianza.",
                    imagen: "assets/img/articulos/53.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <h1>Manejo de berrinches</h1>

                        <div class="reading-note">
                        <strong>¿Qué es un berrinche?</strong>
                        <p>Es la reacción de los pequeños ante situaciones que les causan <br>
                        frustración, enojo, angustia o miedo y, al no saber cómo expresar o regular sus <br>
                        emociones actúan de forma incontrolable.</p>
                        </div>

                        <h3>Alternativas para manejar un berrinche de forma asertiva:</h3>
                        <p>Para el manejo de <br>
                        berrinches se necesita amor y paciencia para que los pequeños se <br>
                        sientan apoyados.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>Antes:</b></span><span></span></div>
                        </div>

                        <p><b>Evita una situación:</b> si sabes que una situación frustra demasiado a tu pequeño y <br>
                        lo desborda, lo mejor será evitarla hasta que logren enfrentarla de otra manera.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>Durante:</b></span><span></span></div>
                        </div>

                        <p><b>Distráelo o cambia el foco de atención:</b> es decir, en la medida de lo posible, <br>
                        intenta distraer al pequeño con algún objeto u otra actividad, para cambiar el <br>
                        foco de atención de algo que «no se puede», por otra cosa que «sí se puede». Por <br>
                        ejemplo: puedes preguntarle acerca de las características de un juguete, eso hará <br>
                        que el infante centre su atención en otra cosa y también se esfuerce mentalmente <br>
                        en responder. Asimismo, no es recomendable que lo distraigamos con un juguete y <br>
                        seamos muy persistentes al mostrárselo, ya que, esto puede generar más estrés o <br>
                        frustración en el pequeño.</p>

                        <p><b>Dale opciones para elegir, de esta manera el niño sentirá que tiene cierto control:</b> si <br>
                        es adecuado, se le puede dar la opción al pequeño de elegir lo que desea hacer, <br>
                        por ejemplo: ¿Quieres bañarte antes o después de comer? ¿Prefieres llevarte tu <br>
                        carrito o este muñeco para jugar mientras te bañas?</p>

                        <ul>
                        <li><b>Mantén la calma:</b> nunca hay que reaccionar a una rabieta con otra rabieta, ya <br>
                        que, la forma de actuar del adulto será un ejemplo fundamental para que el <br>
                        pequeño aprenda a cómo manejar una situación.</li>

                        <li><b>Permite que llore o se exprese a su manera:</b> hay que dejar que el pequeño exprese <br>
                        sus emociones hasta que el berrinche pase.</li>

                        <li><b>Dale contención:</b> si percibimos que a nuestro pequeño le está costando mucho <br>
                        trabajo controlar sus emociones y el berrinche no pasa, podemos hacerle saber <br>
                        que estamos para él con frases como “Te voy a ayudar a que salgas de esto”, “No <br>
                        estás solo”, de igual manera, podemos cantarle, mecerlo, abrazarlo o hamacarlo, <br>
                        siempre y cuando él nos lo permita.</li>
                        </ul>

                        <div class="reading-note">
                        <p><b>No cedas ni lo premies para detener el berrinche:</b> es importante que no cedamos a <br>
                        darle o hacer lo que el pequeño quiere, ya que, debemos ayudarle a entender que <br>
                        un berrinche no lo acercará a ninguna solución, ni es la manera para obtener algo.</p>
                        </div>

                        <p><b>Asegúrate de que el lugar donde se encuentre sea un lugar seguro:</b> si ves que cerca <br>
                        del pequeño hay algo que lo pone en riesgo o él puede dañar a alguien más, <br>
                        cámbialo de lugar y quédate cerca hasta que el berrinche pase, en dado caso de <br>
                        que percibas que el niño está a punto de perder el control dile que lo dejarás por un <br>
                        momento y regresarás pronto para saber cómo sigue.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>Después:</b></span><span></span></div>
                        </div>

                        <p><b>Evita mandarlo a otro espacio, invalidar sus emociones o minimizarlas:</b> <br>
                        recuerda que los pequeños no pueden regular sus emociones, por lo tanto, los <br>
                        berrinches son el resultado de una situación que les causa frustración, de esta <br>
                        manera el que tú reacciones con una actitud que no favorece la expresión de las <br>
                        emociones de una forma adecuada, hará que el pequeño se sienta más molesto a <br>
                        largo plazo o que reprima su sentir.</p>

                        <p><b>Ayúdalo a reconocer sus sentimientos:</b> una vez que el berrinche haya pasado, puedes <br>
                        ayudar al pequeño a identificar cómo se sentía, puedes hacer uso de las <br>
                        descripciones de las emociones, de esta manera el niño le irá dando un nombre a <br>
                        cada una, haciendo que su identificación sea cada vez mejor con el paso del <br>
                        tiempo. Además, con ayuda de este ejercicio, él podrá darles un significado a sus <br>
                        emociones y sabrá de qué manera puede expresarlas, pero lo más importante es que <br>
                        con tu compañía, le hagas saber que tú lo aceptas y acompañas en cada <br>
                        momento. Puedes usar frases como: “Noto que te sientes…”, “¿Te molestó que te <br>
                        dijera que no?”, “Veo que estás un poco cansado, ¿quieres ir a descansar?”, etc.</p>

                        <ul>
                        <li><b>Ofrécele una actividad placentera que lo ayude a relajarse:</b> “Vamos a jugar <br>
                        con la pelota”, “Vamos a leer un cuento”, “¿Quieres cantar?”</li>

                        <li><b>Como niñera identifica la causa del berrinche:</b> este punto es fundamental para futuros <br>
                        berrinches, ya que, podrás conocer y evitar las posibles situaciones que le causen <br>
                        frustración a tu pequeño.</li>
                        </ul>

                        <h3>Referencias:</h3>
                        <p>Fayne, M., García, B., Montero, M. y Valencia, A. (2013). Regulación materna y <br>
                        esfuerzo de control emocional en niños pequeños. International Journal of <br>
                        Psychological 6(1), 30-40. https://www.redalyc.org/pdf/2990/299028095005.pdf</p>

                        <p>Fundación Carlos Slim (s/f). ¿Qué hay detrás de un berrinche? Educación inicial. <br>
                        Recuperado el día 22 de marzo de 2022 de <br>
                        https://educacioninicial.mx/infografias/que-hay-detras-de-un berrinche/ UNICEF</p>

                        <p>(11 de junio de 2020). ¿Cómo manejar las rabietas o berrinches? UNICEF Para cada <br>
                        infancia. Recuperado el día 22 de marzo de 2022 de <br>
                        https://www.unicef.org/uruguay/historias/como-manejar-las-rabietas-o-berrinch</p>
                    `
                },

                {
                    id: 54,
                    titulo: "🧡 Límites con amor: la guía que te ayuda a criar con calma, firmeza y conexión",
                    resumen: "Poner límites no es “ser duro”, es cuidar. Este material te acompaña paso a paso para establecer reglas claras sin gritos, ayudar a tu peque a autorregularse y convertir los momentos difíciles en oportunidades de aprendizaje y vínculo.",
                    imagen: "assets/img/articulos/54.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <h3>Manejo de límites</h3>

                        <h3>¿Qué son los límites?</h3>
                        <p>Los límites son la forma de demostrarle a nuestro pequeño que estamos al pendiente de sus necesidades y desarrollo a través de acciones claras y constantes. De igual manera, es brindarle apoyo, confianza, orientación y seguridad a lo largo de cada una de sus etapas, sin limitarlo.</p>
                        <p>Recuerda que tu pequeño siempre debe sentirse apreciado, guiado, escuchado y apoyado y nunca juzgado o rechazado.</p>
                        <p>El establecimiento de límites ayudará a nuestro pequeño a autorregularse, es decir, aprenderán a controlar su comportamiento, emociones e impulsos ante una situación que les es difícil controlar, para ello, al momento de establecer algún límite debemos ser claros con explicaciones breves y entendibles para el pequeño.</p>

                        <div class="reading-note">
                        <p><strong>Dentro del manejo de límites es necesario que hagamos ciertas acciones en conjunto, por ejemplo:</strong></p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>• Manejo de la frustración:</strong></span></div>
                        </div>
                        <p>para ello puedes ofrecerle a tu pequeño la oportunidad de elegir y decidir por sí mismo, respetando su decisión y aclarando que no todas las cosas o situaciones pueden ser una opción viable o negociable. Por ejemplo; “Debemos guardar los juguetes, ¿Quieres hacer con una competencia o bailando? El guardar los juguetes es una obligación y es algo no negociable, sin embargo, habrá situaciones que sean negociables.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>• Control del comportamiento agresivo:</strong></span></div>
                        </div>
                        <p>procura que en cada actividad que hagas con tu pequeño, le anticipes las transiciones por las cuales pasará, por ejemplo, avisarles que su hora de juego está próxima a terminarse o que faltan unos minutos para irse a la cama, etc., de igual manera, si tu pequeño realiza un comportamiento que quieres que persista puedes recompensarlo o elogiar la acción, de esta manera irá aprendiendo acerca de lo que se espera de ellos. Por ejemplo, “Pablo, en 10 minutos nos vamos del parque”, y cuando resten 5 minutos avisar nuevamente “En 5 minutos nos vamos del parque, en 2 minutos, 1 minutos se acabó el tiempo”. O “Cuando se acabe el tiempo del cronómetro es hora de cambiar de actividad/irse a bañar, etc.”</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Establecimiento de reglas:</strong></span></div>
                        </div>
                        <p>intenta establecer pocas reglas y vigila que se cumplan, pues con ayuda de la repetición lograremos que se produzca el aprendizaje en nuestros pequeños. Puedes incluso hacer una lámina con tu pequeño con imágenes o dibujos para que las reglas se vean de manera gráfica, de acuerdo con la edad de tu peque establece un número de reglas, por ejemplo 3 años = 3 reglas, 5 años = 6 reglas, etc.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>• Ofrecer tiempo de descanso:</strong></span></div>
                        </div>
                        <p>si observas que a tu pequeño le está costando calmarse, puedes ofrecer un tiempo breve de descanso, en este punto es muy importante que acompañes al infante en todo momento, incluso solo puedes hacerle saber que estás para él, pero tomarás tu distancia para que él pueda tranquilizarse, de esta manera tu peque no se sentirá rechazado.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Ofréceles un tiempo para canalizar su energía:</strong></span></div>
                        </div>
                        <p>al realizar actividades recreativas o juegos activos logras que el pequeño expulse gran parte de su agresividad y tensión, además, recuerda que el tener actividades bien distribuidas ayudan a que el pequeño no se aburra ya que fomentan su creatividad y bajan sus niveles de energía. Por ejemplo; poner música variada y hacer un dibujo que proyecto lo que le hace sentir la música, y a propósito incluir al inicio música más fuerte y finalizar con algo más relajado, la idea es que está actividad le permita expresar sus emociones y a la vez termine más tranquilo tu peque. Otra opción es gritar, salir al patio y gritar ya no quiero estar enojado es una actividad que le permite a los niños expresar su emoción sin lastimar a nadie.</p>

                        <div class="reading-note">
                        <p><strong>Errores por evitar durante el establecimiento de límites</strong></p>
                        </div>
                        <ul>
                        <li><strong>• Ceder después de decir “no”:</strong> recuerda que la primera regla a respetar esla del “no”, no es recomendable que una vez que se ha decidido decirle “no” al pequeño nosotros nos arrepintamos y cedamos ante lo que nos está pidiendo.</li>
                        <li><strong>• Gritar y perder el control:</strong> recordemos que nuestra forma de actuar puede convertirse en algo normal para el niño, por lo que, el uso de gritos o insultos no debe ser parte de tu interacción con el pequeño, de esta manera evitarás la normalización de estas conductas y por ende su práctica, recuerda que debemos tratar siempre a nuestros peques con amor y respeto.</li>
                        <li><strong>• No establecer maneras para negociar:</strong> el no negociar con el pequeño implica rigidez e inflexibilidad en nuestra interacción, por lo tanto, es recomendable que, siempre que tengamos la posibilidad y sea viable le demos a nuestro pequeño la opción de decidir.</li>
                        <li><strong>• No escuchar a los pequeños:</strong> recuerda que la comunicación con tu infante es de total importancia, de esta manera sabrás por qué razones tu pequeño se encuentra irritado, triste, etc., y así poder llegar a una solución en conjunto.</li>
                        </ul>

                        <div class="reading-note">
                        <p><strong>Recomendaciones para el establecimiento y cumplimiento de límites</strong></p>
                        </div>
                        <ul>
                        <li><strong>• Sé objetiva, clara y específica:</strong> cuando vayas a establecer un límite con tu pequeño, procura que estos sean claros, específicos, sencillos, positivos y vayan de acuerdo con la edad y madurez del niño, por ejemplo, “al terminar de jugar, recoge todos tus juguetes y guárdalos en la caja azul”.</li>
                        </ul>
                        <p>Recuerda que las reglas deben ser concisas, razonables, comunicadas claramente y se deben reforzar periódicamente.</p>
                        <ul>
                        <li><strong>• Permite que tu pequeño aprenda:</strong> recuerda que debemos darles a nuestros pequeños un espacio para que puedan aprender y adaptarse a lo que les solicitamos, en este punto es de vital importancia que los apoyemos y acompañemos durante este nuevo aprendizaje, pues son formas nuevas de actuar para él y requieren tiempo y práctica.</li>
                        <li><strong>• Valora sus intentos y esfuerzos por mejorar:</strong> recuerda que, el adquirir un nuevo aprendizaje requiere de paciencia y práctica, por lo tanto, debemos ser perseverantes con nuestro pequeño para conseguir lo que esperamos de él, en este caso, que aprenda una nueva regla o límite y se autocontrole; al igual que los adultos, a los pequeños les gusta ser reconocidos por sus logros.</li>
                        <li><strong>• Sé firme:</strong> recuerda que siempre debes basarte en respeto y amor al estar con nuestros pequeños, pero eso no significa que no podemos ser firmes al solicitarles o establecer límites, de igual manera, debes solicitarlos con una voz segura, hablándoles desde su altura, sin gritos y con seriedad en nuestro rostro, de esta manera verán que aquello de lo que les estamos hablando es algo importante.</li>
                        <li><strong>• Permite que tus pequeños formen parte del establecimiento de límites:</strong> de esta manera lograrás que ellos se sientan parte fundamental de toma decisiones, recuerda que en la medida de lo posible debes hablar con tus pequeños y comentarles todo aquello se necesita mejorar.</li>
                        <li><strong>• Fomenta en tu pequeño la escucha activa:</strong> de esta manera generamos más confianza en ellos y una mejoría para manejar y controlar sus problemas y sentimientos.</li>
                        </ul>

                        <div class="reading-note">
                        <p><strong>Juegos que puedes implementar con tus pequeños para el manejo de límites</strong></p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Rompecabezas:</strong></span></div>
                        </div>
                        <p>permite que los niños trabajen con orden, pues, deben acomodar de manera lógica un conjunto de piezas en desorden. Además, desde el inicio podemos marcarle un límite, por ejemplo, podemos pedirle que inicien poniendo todaslas piezas del contorno y después acomoden las del centro, de esta manera, los niños pueden observar como el manejo de límites dan un orden a las cosas. Con ayuda de los rompecabezas los niños aprenden que una forma funcional de acabar con el caos es ordenarlo y establecer límites para lograrlo.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>El semáforo:</strong></span></div>
                        </div>
                        <p>la nanny deberá decir los colores del semáforo y el pequeño deberá realizar la acción que corresponda según el color mencionado, en el color verde los niños deberán correr, en el amarrillo caminarán y en el rojo deberá permanecer en alto. Este juego permite que los niños realicen actividades físicas y desarrollen su autocontrol mientras llevan a cabo las reglas determinadas con anterioridad.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Corral de animalitos:</strong></span></div>
                        </div>
                        <p>permite que los niños identifiquen de manera visual los límites y cómo es que estos funcionan, aprende que hay un dentro y fuera dentro de esos límites y que, mientras esté dentro del corral tendrá cierta contención, seguridad y protección donde puede cumplir con ciertas actividades en libertad, pero sin salirse de los límites establecidos, sin embargo, también es posible salir siempre y cuando cumpla ciertas normas.</p>

                        <p>Finalmente, recuerda que establecer límites requiere de mucha firmeza y tolerancia, trabajar con niños todos los días puede ser como girar una ruleta, no te frustres si un día las cosas no salen como lo deseas, siempre puedes volver a intentarlo, el manejo de grupo y establecimiento de límites es algo que se adquiere con la experiencia y es parte de encontrar una postura con la que te sientas cómoda.</p>

                        <h3>Referencias:</h3>
                        <p>Cortés, R. (2012). Educar con límites a niños de 3 a 6 años. Una forma de amar. [Tesina de licenciatura, Universidad Pedagógica Nacional]. Disponible en: https://normas apa.org/referencias/citar-tesis-disertaciones/</p>
                        <p>Escuela Mexicana Americana, (2022). La importancia de los límites en la infancia. Disponible en: https://mexicanaamericana.edu.mx/la-importancia￾de-los-limites-en-la-infancia/</p>
                        <p>Murow, E. y Verduzco, M., (2001). Cómo poner límites a tus niños sin dañarlos. Pax. México. Disponible en: https://dolorsmaspsicologa.com/wp￾content/uploads/2017/11/172227138- COMO-PONER-LIMITES-A-TUS-NINOS.pdf</p>
                    `
                },

                {
                    id: 55,
                    titulo: "🧠✨ Matemáticas sin lágrimas: juegos para que tu peque aprenda con emoción y confianza",
                    resumen: "Si a tu peque le cuestan las matemáticas, no está solo. Con actividades simples y sensoriales, puede entender números, patrones y operaciones de forma concreta… y disfrutarlo. Aquí tienes ideas prácticas para convertir el “me cuesta” en “¡yo puedo!”",
                    imagen: "assets/img/articulos/55.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Matemáticas divertidas</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">💛 Aprender con juego cambia todo</strong>
                        <p style="margin:10px 0 0 0;">Es posible que las matemáticas sea una de las asignaturas que más les cuesta a los
                        peques hoy en día. Para poder realizar cálculos matemáticos los peques 
                        necesitan concentrarse y prestar atención a lo que están haciendo, algo que en 
                        ocasiones no resulta del todo fácil para los peques (y no tan peques).</p>
                        </div>

                        <p>Pero es necesario que aprendan desde una edad temprana que las matemáticas 
                        además de necesarias son divertidas, por lo que es ideal que sientan que no son 
                        una imposición escolar si no algo que les servirá cada día de su vida.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Actividades para promover el aprendizaje de las matemáticas 
                        en los pequeños:</h3>
                        </div>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row"><span><strong>La casita de sumar:</strong></span><span>🏠➕</span></div>
                        <p style="margin:12px 0 0 0;">Solo es necesario una caja, dos tubos de papel de baño, plumones o colores, los 
                        números en una etiqueta y canicas o algún material que ayude a los pequeños a 
                        contar y meter por el tubo.</p>
                        <p style="margin:12px 0 0 0;">La nanny deberá decir dos números y el pequeño deberá buscarlos y colocarlos en
                        la chimenea. Seguidamente introducirá el número de canicas correspondiente.</p>
                        <p style="margin:12px 0 0 0;">Antes de abrir la casa le preguntaremos cuántas canicas piensa que saldrán. Luego
                        abrirá la puerta de la casa y comprobará su hipótesis.</p>
                        <p style="margin:12px 0 0 0;">Una vez comprobado el resultado, deberá coger la tarjeta de dicho número.</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px; padding:18px;">
                        <div class="rt-row"><span><strong>Visualizar con cuentas o cereal:</strong></span><span>🥣</span></div>
                        <p style="margin:12px 0 0 0;">Usar cuentas, granos o cereal como materiales es una manera excelente de que
                        los niños representen operaciones matemáticas. Por ejemplo, podrían resolver una
                        suma añadiendo cuentas o restar quitándolas. También pueden multiplicar o dividir 
                        agrupando diferentes cantidades de objetos.</p>
                        <p style="margin:12px 0 0 0;">Al mover esos objetos y ver cómo cambian las cantidades, los niños entienden de
                        forma concreta cómo funcionan esas operaciones matemáticas.</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px; padding:18px;">
                        <div class="rt-row"><span><strong>Construir con cubos o fichas de colores:</strong></span><span>🧱</span></div>
                        <p style="margin:12px 0 0 0;">Los niños pueden usar estos objetos para
                        construir formas geométricas, y de esa manera
                        tener una idea concreta de las dimensiones y
                        propiedades de las figuras que crean.</p>
                        <p style="margin:12px 0 0 0;">Usar fichas o cubos también es útil para enseñar
                        patrones numéricos y operaciones. Por ejemplo,
                        puedes apilar esos objetos en grupos de 2, 4, 6 y
                        8, y después pedir a los pequeños que
                        construyan los siguientes grupos siguiendo el
                        mismo patrón de añadir dos objetos cada vez
                        (10, 12 y así sucesivamente). Al finalizar, ayúdalos a relacionar los grupos de objetos
                        con los números que representan.</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px; padding:18px;">
                        <div class="rt-row"><span><strong>Dibujar los problemas de matemáticas:</strong></span><span>🖍️</span></div>
                        <p style="margin:12px 0 0 0;">Dibujar los problemas
                        de matemáticas es el
                        siguiente paso después de
                        trabajar con manipulables
                        como cuentas o fichas de
                        colores. Es una manera de
                        que los niños muestren su
                        capacidad de razonar, y
                        los ayudará a escribir oraciones numéricas con números y símbolos.</p>
                        <p style="margin:12px 0 0 0;">Por ejemplo, puedes pedirles que resuelvan la multiplicación 4 x 6 dibujando 6
                        grupos de 4 manzanas. O los niños pueden colorear 4 filas de 6 cuadrados en
                        un papel cuadriculado. Al terminar verán 4 grupos de 6, o 24 cuadrados
                        coloreados.</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px; padding:18px;">
                        <div class="rt-row"><span><strong>Percutir los sonidos:</strong></span><span>👏</span></div>
                        <p style="margin:12px 0 0 0;">El acto de percutir los números
                        puede ayudar a los pequeños a
                        relacionar símbolos con las
                        cantidades correspondientes y
                        “sentir” el valor. Esto es 
                        especialmente útil cuando se
                        trabaja con múltiplos.</p>

                        <p style="margin:12px 0 0 0;">Por ejemplo, pídeles que enumeren los múltiplos de 4. Los pequeños empezarán a
                        golpetear grupos de 4 a medida que los cuentan. El cuarto número se percute más
                        fuerte y se anota (1, 2, 3, ¡4! 5, 6, 7, ¡8! 9, 10, 11 ¡12!). Al final, tendrán una lista que pueden
                        usar para resolver problemas de multiplicación y división.</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px; padding:18px;">
                        <div class="rt-row"><span><strong>Incluir el movimiento:</strong></span><span>🏃‍♂️</span></div>
                        <p style="margin:12px 0 0 0;">Usar movimiento al practicar matemáticas
                        es una manera entretenida de ayudar a
                        los niños a retener lo que han aprendido.
                        Por ejemplo, pueden escribir números en
                        una pelota grande (pueden ser números
                        enteros, fracciones o decimales). Una vez 
                        lista la pelota, puede jugar diversos
                        juegos con ella como la papa caliente, y,
                        en estos juegos cada vez que alguien la atrape tiene que realizar una operación
                        matemática con los dos números escritos en el lugar donde sus manos hayan
                        agarrado la pelota.</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px; padding:18px;">
                        <div class="rt-row"><span><strong>Construir con material base 10:</strong></span><span>🔟</span></div>
                        <p style="margin:12px 0 0 0;">Son bloques de diferentes tamaños que
                        representan 1000 (un “cubo”), 100 (una 
                        “lámina”), 10 (una “barra”) y 1 (una “unidad”).</p>
                        <p style="margin:12px 0 0 0;">Los niños pueden formar números con ellos
                        para identificar el valor posicional (también
                        pueden usarlos para resolver operaciones,
                        mostrar el reagrupamiento y encontrar
                        patrones). Por ejemplo, diles que “construyan” con bloques el número 145. Los 
                        pequeños tendrán que seleccionar un bloque de 100, 4 bloques de 10 y 5 bloques de
                        1. Luego pregúntales “¿qué dígito tiene mayor valor: 1, 4 o 5?”.</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px; padding:18px;">
                        <div class="rt-row"><span><strong>Hacer una tabla de 
                        centenas:</strong></span><span>📊</span></div>
                        <p style="margin:12px 0 0 0;">Una tabla de una
                        centena puede ayudar a
                        los niños a entender las
                        relaciones entre los 
                        números. Por ejemplo, 
                        dales a los pequeños 
                        una cuadrícula de 100 
                        (un cuadrado grande dividido en 100 cuadrados más pequeños). Pídeles que 
                        sombreen 1/4 de toda la cuadrícula, una vez que lo hayan hecho deberán decirte 
                        cuántos cuadrados están sombreados. Una vez hecho esto, puedes explicarles que 
                        1/4 significa lo mismo que 25 de 100 y que 25%.</p>
                        </div>

                        <div class="reading-table" style="margin-top:18px; padding:18px;">
                        <div class="rt-row"><span><strong>Usar trozos de pizza:</strong></span><span>🍕</span></div>
                        <p style="margin:12px 0 0 0;">Cortar una pizza en trozos es una
                        manera excelente de enseñar
                        fracciones. Puedes hacer varias
                        pizzas con cartulina y cortarlas en
                        trozos de diferentes tamaños. De
                        esa manera los niños pueden
                        “ver” fracciones como 1/8 o 1/4 al
                        seleccionar porciones de pizza.</p>
                        <p style="margin:12px 0 0 0;">Usar diferentes colores para los distintos tamaños de porciones les permite además 
                        relacionar fracciones equivalentes como 2/8 y 1/4. También pueden combinar los
                        pedazos para formar ¡una pizza “completa”!</p>
                        </div>

                        <h3 style="margin-top:26px;">Referencias:</h3>
                        <p>Hodnett, B. (2022). 10 técnicas multisensoriales para enseñar matemáticas. 
                        Understood. Disponible en: https://www.understood.org/es-mx/articles/10-
                        multisensory-techniques-for-teaching-math</p>

                        <p>Martín, M. (2022). Las 3 claves para que los niños aprendan matemáticas. 
                        Aprendiendo matemáticas. Disponible en: 
                        https://aprendiendomatematicas.com/las-3-claves-para-que-los-ninos-aprendan
                        matematicas/</p>

                        <p>Martín, M. (2022). Cálculo mental: la casita de sumar. Aprendiendo matemáticas. 
                        Disponible en: https://aprendiendomatematicas.com/la-casita-de 
                        sumar/#:~:text=Forma%20de%20usar%20la%20casa&text=Antes%20de%20abrir%20l
                        a%20casa,p ermite%20hacer%20muchas%20propuestas%20interesantes.</p>

                    </div>
                    `
                },

                {
                    id: 56,
                    titulo: "🎶 Canta, baila y conecta: canciones para acompañar a tu peque en cada emoción del día",
                    resumen: "A veces una canción calma, otras despierta la alegría… pero siempre deja huella. Esta selección te ayuda a usar la música para mover el cuerpo, expresar emociones, aprender y crear recuerdos que tu peque llevará en el corazón.",
                    imagen: "assets/img/articulos/56.jpg",
                    categoria: "Sensorial",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Música para peques: <br>canta, baila y aprende con ellos</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">💛 La música también es vínculo</strong>
                        <p style="margin:10px 0 0 0;">La música es un lenguaje universal, que acompaña a los peques en cada etapa 
                        de su desarrollo. A través de las canciones, los peque no solo se divierten, sino que 
                        también aprenden, expresan sus emociones y fortalecen su creatividad. Es una 
                        herramienta poderosa desde los primeros años de vida, capaz de estimular tanto 
                        la relajación como la activación física de los niños. Diversos estudios y revisiones 
                        sistemáticas muestran que su incorporación en la primera infancia promueve su 
                        desarrollo integral: cognitivo, emocional, social y físico.</p>

                        <p style="margin:12px 0 0 0;">Además, desde la pedagogía, se afirma que la música favorece el desarrollo 
                        motor —como coordinación y equilibrio— y también fortalece el lenguaje, la 
                        creatividad y la memoria, al activar ambos hemisferios cerebrales. En esta 
                        selección encontrarás melodías ideales para cada momento del día: desde 
                        aquellas que invitan a moverse y jugar, hasta las que ayudan a relajarse y soñar,
                        porque cantar juntos es más que un juego, es crear recuerdos que durarán para 
                        siempre.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones relajantes:</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “Brahms lullaby” Brahms' Lullaby (Extra-Relaxing vs) ♫ Classical Music to 
                        Sleep or Study</span><span>🌙</span></div>
                        <div class="rt-row"><span> “Disney Piano Collection” Disney Piano Collection - Relaxing Music For 
                        Relax, Study, Work - YouTube</span><span>🎹</span></div>
                        <div class="rt-row"><span> “Sube y baja la marea” Canción de la calma para niños 🐳</span><span>🐳</span></div>
                        <div class="rt-row"><span> “White Noise Puro” White Noise Puro (Ruido Blanco) 12 horas continuas</span><span>🤍</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones de movimiento:</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “El baile del sapito” El Baile del Sapito - Las Canciones Dela Granja -
                        Canciones infantiles dela granja</span><span>🐸</span></div>
                        <div class="rt-row"><span> “El baile del gorila” Melody - El Baile del Gorila (Videoclip)</span><span>🦍</span></div>
                        <div class="rt-row"><span> “Baila a lo loco” Los Meñiques De La Casa - Baila A Lo Loco</span><span>🎈</span></div>
                        <div class="rt-row"><span> “Dubidubidu” Christell - Dubidubidu (Canal Oficial)</span><span>✨</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para aprender las partes del cuerpo:</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “El baile del cuerpo” COREOKIDS - el baile del cuerpo -DIVERPLAY- Yo tengo 
                        un cuerpo y lo voy a mover</span><span>🧍</span></div>
                        <div class="rt-row"><span> “Frente hombros piernas pies” Luli y Topa - 😌🦵🏼🦵FRENTE HOMBROS 
                        PIERNAS PIES (Official Video)</span><span>🦶</span></div>
                        <div class="rt-row"><span> “La mané” CantaJuego - La Mané (Version Mexico)</span><span>🫶</span></div>
                        <div class="rt-row"><span> “Cuando la iguana baila” Pica-Pica - Cuando La Iguana Baila (Videoclip 
                        Oficial)</span><span>🦎</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones de activación física:</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “Lento muy lento” "Lento muy lento" flashmob versión #coordinacionmotriz</span><span>🏃</span></div>
                        <div class="rt-row"><span> “Los superhéroes” RUTINA DE ACTIVACIÓN FÍSICA "Los Superheroes" -
                        YouTube</span><span>🦸</span></div>
                        <div class="rt-row"><span> "El Juego de Do Pingüe" RUTINA DE ACTIVACIÓN: "El Juego de Do Pingüe" –
                        YouTube</span><span>🎮</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para saludo y despedida</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> Hola hola ¿Cómo estas? Hola hola ¿Cómo estás? La canción infantil para 
                        saludar (Preescolar) Saludar las manos</span><span>👋</span></div>
                        <div class="rt-row"><span> Hola ¿Cómo están? Luli Pampín - HOLA ¿CÓMO ESTÁN? 
                        👊🏻🙌🏻👋🏼🖐🏾✋🏿 - Official Video</span><span>🙌</span></div>
                        <div class="rt-row"><span> Hola, hola con las manos 👋 Hola, hola con las manos - Canción de 
                        SALUDO🎈</span><span>🎈</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para expresar emociones</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “El monstruo de los colores” EL MONSTRUO DE LOS COLORES EN LSE</span><span>🎨</span></div>
                        <div class="rt-row"><span> “Si estás feliz” Si Estás Feliz | Canciones Infantiles | Super Simple Español</span><span>😊</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para aprender números (del 1 al 5)</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “Twist de los ratoncitos” El Twist de los Ratoncitos - Michi-guau | El Reino 
                        Infantil - YouTube</span><span>🐭</span></div>
                        <div class="rt-row"><span> “Cinco monitos” Luli Pampín - CINCO MONITOS - Official Video</span><span>🙊</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para aprender números (del 1 al 10)</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “Los números del 1 al 10” LOS NÚMEROS DEL 1 AL 10 / CANCIÓN INFANTIL / 
                        AglaE</span><span>🔟</span></div>
                        <div class="rt-row"><span> “Diez en la cama” DIEZ EN LA CAMA - APRENDEMOS los números con Luli 
                        Pampín 🔢 Official Video</span><span>🛏️</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para aprender las vocales</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “Ronda de las vocales” Ronda De Las Vocales, Canticuentos, Canciones 
                        Infantiles - MundoCanticuentos</span><span>🅰️</span></div>
                        <div class="rt-row"><span> “El tren de las vocales” Luli Pampín & Diego Topa - El tren de las vocales A 
                        E I O U 💜</span><span>🚂</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para que los peques ordenen</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “A guardar a guardar” Canciones del Jardin - A guardar a guardar cada 
                        cosa en su lugar | Aprender a guardar</span><span>🧺</span></div>
                        <div class="rt-row"><span> “Limpia limpia” Barney Limpia</span><span>🧽</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para jugar</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “Congelados” Luli Pampín "CONGELADOS" Vamos a CANTAR, BAILAR, 
                        JUGAR! 💜 Música Infantil - Official Video</span><span>🧊</span></div>
                        <div class="rt-row"><span> “Juguemos en el bosque” Juguemos en el Bosque 🌳 Canciones Infantiles 
                        🎶 30 Años | Dúo Tiempo de Sol</span><span>🌳</span></div>
                        <div class="rt-row"><span> “A la víbora de la mar” A la Víbora de la Mar - Canción Infantil</span><span>🌊</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones para aprender los animales</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “El baile de los animales” El Baile de los Animales - Las Canciones del Zoo 
                        3 | El Reino Infantil</span><span>🦁</span></div>
                        <div class="rt-row"><span> “El baile de los animales” Los Meñiques De La Casa - El Baile De Los 
                        Animales</span><span>🐾</span></div>
                        <div class="rt-row"><span> “Bartolito” Bartolito - La Granja de Zenón 3</span><span>🐔</span></div>
                        <div class="rt-row"><span> “Con los animales” TOPA - CON LOS ANIMALES (Video Oficial)</span><span>🐶</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones de autoestima y motivacionales</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “Somos únicos” Somos Únicos, canción para amarse y aceptarse ❤️</span><span>❤️</span></div>
                        <div class="rt-row"><span> “Ya llegaré” Llegaré | La Princesa y el Sapo</span><span>🐸</span></div>
                        <div class="rt-row"><span> “En marcha estoy” Tierra De Osos - En Marcha Estoy (Español Latino) HD 
                        feat. Phil Collins</span><span>🚶</span></div>
                        <div class="rt-row"><span> “Hijo de hombre” Tarzán - Hijo De Hombre (By: Phil Collins) (Letra)</span><span>🌿</span></div>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Canciones de amistad:</h3>
                        </div>
                        <div class="reading-table">
                        <div class="rt-row"><span> “Cuenta conmigo” ✨Río Roma | Cuenta Conmigo [Letra] (Alberto - Luca)</span><span>🤝</span></div>
                        <div class="rt-row"><span> “Yo soy tu amigo fiel” Yo Soy Tu Amigo Fiel | Toy Story - Español Latino (HD)</span><span>🧸</span></div>
                        <div class="rt-row"><span> “Amigos del corazón” Laura Esquivel & Brenda Asnicar - Amigos Del 
                        Corazón (Official Video)</span><span>💞</span></div>
                        <div class="rt-row"><span> “Amigos por siempre” Belinda Amigos x Siempre</span><span>✨</span></div>
                        </div>

                        <h3 style="margin-top:26px;">Bibliografía</h3>
                        <p>Delgado. X. (2019). Efectos de la música en el cerebro en la etapa infantil: 
                        revisión desde las neurociencias. Revista Investigium IRE Ciencias Sociales y 
                        Humanas, (2) pp 65- 77
                        https://investigiumire.unicesmag.edu.co/index.php/ire/article/view/301/341</p>

                        <p>Jiménez. C, (2019). Estimulación temprana con canciones infantiles para centros 
                        educativos. Cuadernos de Investigación UNED. (2) pp 15-27 
                        https://revistas.uned.ac.cr/index.php/cuadernos/article/view/2194/3014</p>

                    </div>
                    `
                },

                {
                    id: 57,
                    titulo: "🍽️ Cuando su peque “no come”: calma, guía y pasos que sí funcionan (sin presionar)",
                    resumen: "Ver que su peque come poquito puede angustiar… pero muchas veces es una etapa normal. Aquí encontrará qué tomar en cuenta, cuándo preocuparse y 15 consejos prácticos para mejorar la relación con la comida con amor, paciencia y sin batallas.",
                    imagen: "assets/img/articulos/57.jpg",
                    categoria: "Sensorial",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/34.jpg')"></div>

                        <div class="reading-note" style="margin-top:0;">
                        <strong>Mi peque no come, ¿qué debo hacer?</strong>
                        </div>

                        <p>La alimentación de los peques suele ser una de las preocupaciones de los padres, pues en ocasiones se dan cuenta que no come o no lo suficiente, pero ¿cómo saber si lo que comen no es suficiente?, ¿realmente no comen absolutamente nada? En la mayoría de los casos, el niño come, aunque sea poco, pero lo hace. Por ello, es necesario saber que, en ocasiones, es común que los peques y la comida no se lleven siempre bien y que al igual que nos ocurre a los adultos, ellos también atraviesan temporadas en las que comen mejor que otras.</p>

                        <p>Ahora bien, para poder dar respuesta a la interrogante ¿qué puedo hacer si mi peque no come?”, es necesario tomar en cuenta algunas cuestiones relacionadas con el crecimiento y la alimentación de los peques. Partiendo de ahí, se pueden llevar a cabo una serie de pautas a seguir para lograr que los peques coman mejor.</p>

                        <h3 style="margin-top:28px;">¿Qué debes tomar en cuenta con respecto a la alimentación de tu peque?</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">1.</span>
                            <span style="flex:1;">Si tu hijo tiene más de 1 año, es normal que coma menos, esto es debido a que durante el primer año de vida atraviesan la etapa de crecimiento más rápida de toda su vida, ya que únicamente durante ese año suelen crecer aproximadamente unos 25 centímetros y el peso aumenta considerablemente. Después del año, necesitan menos hierro y energía para crecer, es por esto que les da menos hambre.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">2.</span>
                            <span style="flex:1;">Si tu peque come poco, pero no está perdiendo peso y continúa creciendo, no tienes nada de qué preocuparte.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">3.</span>
                            <span style="flex:1;">No es necesario que el peque se acabe todo el plato de comida o la cantidad que consideres necesaria para él. En realidad, él come lo que necesita y puede ser que requiera menos en algunas ocasiones.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">4.</span>
                            <span style="flex:1;">Si tu peque es muy delgado y no come casi nada, pueden ofrecerle comida que contenga mayor cantidad energética (calorías y proteínas) para que no pierda más peso.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">5.</span>
                            <span style="flex:1;">Si notas que tu peque está perdiendo peso y tiene problemas en su crecimiento, es necesario que se acuda con un pediatra para recibir orientación de acuerdo a su caso.</span>
                        </div>
                        </div>

                        <h3 style="margin-top:28px;">Consejos para cuando tu peque no coma:</h3>

                        <div class="reading-note">
                        <strong>1. Evita las distracciones durante la comida:</strong>
                        <p style="margin:12px 0 0 0;">Es necesario evitar utilizar el celular, encender el televisor, la radio, etc., hay que eliminar todo tipo de distracciones para propiciar que centre más su atención en la comida. Esto también permitirá que el peque se encuentre en un ambiente más relajado para comer, lo que facilitará que tenga mayor apetito. Una vez que haya comido, se puede realizar una actividad tranquila, como leer un cuento, hacer una manualidad, jugar con un juego de mesa, etc., ya que así se fomentará mejor el hábito de la comida e irá aprendiendo a tener un orden.</p>
                        </div>

                        <div class="reading-note">
                        <strong>2. Despierta su interés por la comida:</strong>
                        <p style="margin:12px 0 0 0;">Para lograr despertar el interés en el peque por la comida, hay que utilizar un poco la creatividad. Por ejemplo, una de las formas de que el peque preste más atención a la comida y le parezca más interesante, es elaborando comidas que tengan un toque divertido (alimentos en forma de sus personajes favoritos, cóctel de frutas con figuras, etc.), utilizar platos, vasos y cubiertos llamativos (con imágenes de sus personajes favoritos, de colores que le gusten, etc.).</p>
                        <p style="margin:12px 0 0 0;">Otra opción que es muy interesante es darle de comer por medio de juegos lo que provocará que centre su atención en la comida y la perciba de una manera más positiva (por ejemplo, el juego del avión con la cuchara).</p>
                        </div>

                        <div class="reading-note">
                        <strong>3. Muchos colores:</strong>
                        <p style="margin:12px 0 0 0;">Cuanto más color tiene el plato, más atractivo les resulta, los peques prefieren platos que reúnan hasta seis colores diferentes, a diferencia de los adultos, que prefieren hasta tres colores.</p>
                        </div>

                        <div class="reading-note">
                        <strong>4. En la medida de lo posible, hazlo parte de la preparación de su comida:</strong>
                        <p style="margin:12px 0 0 0;">Tu peque puede estar más abierto a probar nuevos sabores si tiene experiencias divertidas en relación con la comida. Una forma de que sea así es hacerlo parte del proceso en la elaboración de sus alimentos.</p>
                        </div>

                        <p>Cocinar con tu peque no sólo puede introducirlo a nuevos sabores, sino también a un gran número de aprendizajes, desde lecciones de seguridad, conceptos matemáticos o científicos con las medidas que se necesitan para hacer una receta o con la transformación que experimenta algún alimento cuando está en contacto con el calor.</p>

                        <div class="reading-note" style="border-left-color: var(--pink-main);">
                        <strong>5. No fuerces a tu peque a comer:</strong>
                        <p style="margin:12px 0 0 0;">Recuerda que el peque sabe cuándo necesita realmente el alimento y cuándo no. En algunas ocasiones, puede acabarse todo el plato, pero en otras puede bastar con comer sólo unos bocados. Lo peor que se puede hacer es obligarlo a comer cuando verdaderamente no tiene hambre, ya que se le va a alterar esa sensación natural de saciedad y podemos propiciar a que en un futuro presente problemas de obesidad.</p>
                        <p style="margin:12px 0 0 0;">Otra cuestión importante es que el peque se puede llegar a estresar demasiado y que en futuras ocasiones puede generar incluso miedo y aversión a la hora de la comida si se le obliga a comer.</p>
                        </div>

                        <div class="reading-note">
                        <strong>6. Comer en familia:</strong>
                        <p style="margin:12px 0 0 0;">Otro aspecto que influye mucho a la hora de aumentar el apetito en los peques es el que coma toda la familia al mismo tiempo. El peque al ver a sus cuidadores principales comiendo se ve motivado a imitar su conducta.</p>
                        </div>

                        <div class="reading-note">
                        <strong>7. Evita servirle demasiada comida:</strong>
                        <p style="margin:12px 0 0 0;">Se debe evitar llenar el plato de manera excesiva e incluso se le pueden servir raciones pequeñas. El peque es el que tiene que decidir si necesita más comida o no, ya que al ver que no se le impone que coma una determinada cantidad, se sentirá menos presionado y se evitarán batallas innecesarias a la hora de la comida.</p>
                        <p style="margin:12px 0 0 0;">Es importante no entrar en conflicto, ya que ambos la pasarán mal y no se logrará nada de esta manera.</p>
                        </div>

                        <div class="reading-note">
                        <strong>8. Establecer horarios para la comida:</strong>
                        <p style="margin:12px 0 0 0;">Se deben establecer horarios fijos para la comida y llevarlos a cabo lo más que se pueda. Si tu peque no ha querido desayunar bien y una hora antes de la comida te pide un postre o dulce, explícale que tiene que esperar hasta la hora de la comida e intenta distraerlo hasta que se sienten a comer. De esta manera, llegará con más hambre a la hora de la comida y poco a poco se irá adaptando a los horarios que se hayan establecido para hacerlo.</p>
                        </div>

                        <div class="reading-note">
                        <strong>9. Encuentra maneras de darle alimentos que no le gustan:</strong>
                        <p style="margin:12px 0 0 0;">Algo que puedes hacer y que es muy común para darle alimentos nutritivos a los peques que no son de su agrado, es camuflarlos con otros que le gusten. Por ejemplo, en caso de que no le gusten las verduras, se las puedes licuar para que no note que están y mezclar con otros alimentos para disimular su sabor. Lo importante es que el peque se vaya familiarizando y acostumbrando al sabor de estos alimentos, por lo que cada vez podrás ir reduciendo la cantidad del alimento que le gusta para que se quede al final únicamente en este caso con las verduras.</p>
                        </div>

                        <div class="reading-note">
                        <strong>10. Ojo con los snacks:</strong>
                        <p style="margin:12px 0 0 0;">A partir de los dos años, los peques deben comer tres comidas saludables al día y uno o dos snacks. La clave con estos refrigerios es no hacerlos muy pesados. Fruta y verdura picada, algunas nueces y frutos secos, yogurt, queso cottage, sándwich de crema de cacahuate pueden ser buenas opciones siempre y cuando no sean en porciones grandes que llenen a tu peque a tal punto que no tenga apetito en su siguiente comida.</p>
                        </div>

                        <div class="reading-note">
                        <strong>11. Interés por la relación del niño con la comida:</strong>
                        <p style="margin:12px 0 0 0;">Hemos de intentar que el peque no vea el momento de la comida como algo obligatorio, relacionado con la insistencia, la presión o la coacción. No hay que amenazarlos con castigos sino seguir procurando la comunicación: "¿Por qué no comes?", "¿No está bueno?", "A mí me parece bueno...", "Otras veces te ha gustado", "Estarás más fuerte", etc.</p>
                        </div>

                        <div class="reading-note">
                        <strong>12. Anímale, no le presiones para comer:</strong>
                        <p style="margin:12px 0 0 0;">Esos ánimos de los que acabamos de hablar no han de convertirse en presiones. Hay que alentar a los peques para que coman, decirle que estaba haciéndolo bien, que ya queda poco, pero sin regañarlos ni enfadarnos, hay que evitar tensiones, mal ambiente o miedos.</p>
                        </div>

                        <div class="reading-note">
                        <strong>13. El postre es parte del menú y no solo un premio o recompensa (ni una amenaza: "Si no comes, no hay postre"):</strong>
                        <p style="margin:12px 0 0 0;">El postre que les gusta forma parte del menú, les ayuda a descubrir sabores, texturas, además pueden ser alimentos importantes y necesarios como las frutas.</p>
                        </div>

                        <div class="reading-note">
                        <strong>14. Termina la comida en positivo, incluso cuando al niño no le ha gustado algo.</strong>
                        <p style="margin:12px 0 0 0;">Intentemos plantear una negociación (unas cucharadas más, un cambio de alimento, etc.) en positivo. Acabar la comida enfadados favorecerá que no nos apetezca volver a sentarnos para la próxima comida.</p>
                        </div>

                        <div class="reading-note">
                        <strong>15. Un poco de paciencia:</strong>
                        <p style="margin:12px 0 0 0;">La paciencia puede ser lo que más nos falta cuando nos urge que nuestro peque se aventure a probar un nuevo sabor. Sin embargo, en ocasiones, los peques de entre 1 a 3 años necesitan probar un nuevo alimento por lo menos 10 veces para aceptarlo.</p>
                        <p style="margin:12px 0 0 0;">Así que, en lugar de desmotivarte porque tu peque le hace el fuchi a algo, mejor piensa que tal vez no lo ha probado suficientes veces.</p>
                        </div>

                        <h3 style="margin-top:28px;">Referencias:</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>Glover, M. (17 de enero de 2018). Mi hijo no come nada: ¿qué puedo hacer? Psicología- Online. https://www.psicologia-online.com/mi-hijo-no-come￾nada-que-puedo-hacer- 3238.html</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>Ortíz, R. (30 de junio de 2021). ¿Tu hijo hace berrinche antes de comer? 6 tips para no batallar a la hora de la comida. Univision. https://www.univision.com/estilo￾de-vida/madres/tu- hijo-hace-berrinche-antes-de-comer-6-tips-para-no￾batallar-a-la-hora-de-la-comida</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>París, O. (14 de marzo de 2015). ¿Te preocupa la hora de la comida con los niños? Consejos para lograr un ambiente positivo. Bebés y más. https://www.bebesymas.com/alimentacion-para-bebes-y￾ninos/te-preocupa-la-hora- de-la-comida-con-los-ninos-consejos-para-lograr￾un-ambiente-positivo</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span>Rovati, L. (2 de febrero de 2012). La presentación de los platos, clave para que los niños aceptenmejor los alimentos. Bebés y más. https://www.bebesymas.com/alimentacion-para-bebes-y￾ninos/la-presentacion-de- los-platos-clave-para-que-los-ninos-acepten-mejor￾los-alimentos</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 58,
                    titulo: "✨ Métodos de lectoescritura: caminos amorosos para que tu peque lea y escriba con confianza",
                    resumen: "Leer y escribir no es una carrera: es un proceso que se construye paso a paso, con paciencia, juego y mucho acompañamiento. Aquí encontrarás los principales métodos de lectoescritura, sus fases, ventajas y desventajas, para elegir el camino más adecuado para tu peque.",
                    imagen: "assets/img/articulos/58.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                        <h1>Métodos de lectoescritura</h1>

                        <p>La lectoescritura, es la capacidad que los seres humanos tenemos para poder leer <br>
                        y escribir, es decir, nos permite interpretar textos usando un alfabeto y plasmar el <br>
                        lenguaje, lo cual nos permite comprender el entorno. Ésta, nace como la unión de <br>
                        dos procesos relacionados, que son la lectura y la escritura, convirtiéndose en uno <br>
                        de los procesos más importantes de la vida del ser humano, ya que es la base <br>
                        para aprender cosas nuevas, a través del pensamiento, lenguaje e inteligencia.</p>

                        <p>La lectoescritura implica distintos procesos como la codificación, decodificación, <br>
                        comprensión, interpretación, composición y redacción, por ende, es un proceso <br>
                        que se dará paulatinamente y los resultados serán visibles con la práctica.</p>

                        <p>Los métodos de lectoescritura se clasifican en dos tipos, “el método analítico y el <br>
                        método sintético”.</p>

                        <h3>1. El método analítico es una estrategia para la enseñanza de la lectura y escritura <br>
                        en los peques, se comienza por estructuras complejas para después <br>
                        comprender los elementos más sencillos, es decir, este método va de lo general <br>
                        a lo particular, primero se enseña el significado de la palabra o frases, para <br>
                        después conocer las sílabas, y luego, cada letra una por una.</h3>

                        <p>En este método podemos encontrar el método global y léxico:</p>

                        <h3>Método global</h3>

                        <p>Este método es caracterizado por el uso de la memoria visual, trabajada por <br>
                        medio de las palabras buscando que los niños reconozcan lo que ya está escrito. <br>
                        Resalta el hecho que parte desde lo que está junto, las palabras o frases hasta lo <br>
                        concreto que son las letras y sílabas ayudando también a que los peques tengan <br>
                        una buena ortografía.</p>

                        <div class="reading-note">
                        <strong>Este método tiene 4 fases:</strong>
                        <ul>
                            <li><b>Fase de compresión:</b> se busca fomentar el interés de los peques por conocer <br>
                            el significado de las palabras, siendo lo más conveniente que como nannies <br>
                            escojamos las palabras con la que más contacto pueden llegar a tener los peques. <br>
                            Los carteles de palabras se pueden colocar en lugares u objetos de la casa donde <br>
                            los peques los pueden alcanzar a ver y puedan ir asociando el objeto con su <br>
                            nombre. Al paso de un tiempo, los carteles se quitarán y se les darán a los peques <br>
                            para que desarrollen su memoria visual.</li>

                            <li><b>Fase de imitación:</b> esta fase comienza cuando los peques ya saben algunas <br>
                            palabras y las copian mediante la escritura. Aquí se pueden hacer juegos en los <br>
                            que ellos completen frases de forma oral, para que puedan relacionar el principio <br>
                            de una oración con la palabra que encaje en el contexto. Para reforzar esta fase, <br>
                            las nannies pueden utilizar un cartón para que los peques plasmen alguna letra o <br>
                            palabra que ya hayan trabajado.</li>

                            <li><b>Fase de elaboración:</b> esta fase ayuda a poder afianzar los conocimientos previos <br>
                            del peque, además de trabajar sílabas o sonidos que sean iguales en las palabras. <br>
                            Se puede hacer uso de tarjetas donde están escritas las palabras con sílabas <br>
                            iniciales iguales.</li>

                            <li><b>Fase de producción:</b> para esta fase, los peques ya deben conocer mejor las <br>
                            palabras y las nannies deben ayudarlos a comprender mejor los textos. Se tomará <br>
                            en cuenta el contexto, así como las frases de una historia o lectura ayudando al <br>
                            desarrollo de la comprensión lectora. En esta fase se puede hacer uso de <br>
                            canciones y poemas infantiles para aprender de memoria, así como usar cuentas <br>
                            y hacer preguntas en las que se pueda valorar el proceso de análisis de lectura.</li>
                        </ul>
                        </div>

                        <h3>Ventajas del método global:</h3>
                        <ul>
                        <li>Estimula la lectura, escritura y expresión verbal</li>
                        <li>Los peques mantienen un rol activo</li>
                        <li>La lectura se enseña de manera práctica y se ven resultados con rapidez una <br>
                        vez que se empieza con este método.</li>
                        </ul>

                        <h3>Desventajas del método global:</h3>
                        <ul>
                        <li>Para lograr el aprendizaje de la lectura mediante esté método, se requiere <br>
                        llevar un proceso largo y extenso</li>
                        <li>Se necesita un gran compromiso y esfuerzo por medio de nannies y padres, ya <br>
                        que se deben emplear diferentes estímulos</li>
                        <li>Se debe hacer uso de diferentes materiales didácticos.</li>
                        </ul>

                        <h3>Método léxico</h3>
                        <p>Este método se caracteriza por usar primero el estudio y comprensión de palabras, <br>
                        estás deben ser significativas para los peques y lo más recomendado es que las <br>
                        palabras vayan acompañadas de imágenes.</p>

                        <ul>
                        <li>Primero se presenta una palabra completa que sea significativa <br>
                        para el peque</li>
                        <li>Después se esconde la palabra entre otras para que el peque la <br>
                        descubra</li>
                        <li>Posteriormente, el peque deberá copiar y leer la palabra completa</li>
                        <li>Cuando la palabra esté copiada, se descompondrá en sílabas, con todo <br>
                        y letras y sonidos</li>
                        <li>Estás sílabas se deberán usar para formar nuevas palabras</li>
                        <li>Finalmente, se agrupan estás nuevas palabras en frases y oraciones.</li>
                        </ul>

                        <h3>Ventajas del método léxico:</h3>
                        <ul>
                        <li>Toma en consideración las características de interés de los peques</li>
                        <li>Favorece la motivación e interés</li>
                        <li>Se fomenta la comprensión</li>
                        <li>Se favorece la autonomía.</li>
                        </ul>

                        <h3>Desventajas del método léxico:</h3>
                        <ul>
                        <li>El proceso de aprendizaje es más lento</li>
                        <li>Requiere de un trabajo paciente y constante de la nannie y los padres.</li>
                        </ul>

                        <h3>2. Método sintético es otra estrategia para la enseñanza de la lectura y escritura en <br>
                        los peques, los métodos que lo conforman suelen ser los más tradicionales y <br>
                        actualmente se usan en muchas escuelas. Se refieren a los métodos que parten <br>
                        de los elementos más simples para llegar a las unidades más complejas, es decir, <br>
                        inician por el estudio de las letras, después se combinan para formar sílabas, y <br>
                        posteriormente para componer palabras, frases y por último enunciados.</h3>

                        <p>En este método podemos encontrar: método alfabético, método fonético y <br>
                        silábico.</p>

                        <h3>Método alfabético:</h3>
                        <p>este método es caracterizado debido a que funciona <br>
                        enseñando a los niños a identificar las letras, sus sonidos y las combinaciones de <br>
                        letras para poder decodificar y comprender el lenguaje escrito, este método <br>
                        consta de 4 pasos:</p>

                        <div class="reading-note">
                        <ul>
                            <li><b>Paso 1, identificación de letras y sus sonidos:</b> se debe comenzar enseñando a los <br>
                            niños a identificar letras y sonidos correspondientes, es decir, se le enseña la letra <br>
                            “M” que suena como “mmmmmmmmm”, y se enseña la letra “S” que suena <br>
                            como “ssssssssss”. Esta identificación es esencial para la decodificación.</li>

                            <li><b>Paso 2, identificación de las combinaciones de letras:</b> una vez que los peques <br>
                            aprendieron a identificar las letras y sus sonidos se les enseña las combinaciones <br>
                            de letras más comunes “ba, be, bi, bo, bu, ma, me, mi, mo, mu”, que <br>
                            posteriormente le permitirán formar y leer palabras.</li>

                            <li><b>Paso 3, decodificación de palabras:</b> conforme los peques van aumentado su <br>
                            aprendizaje, se les enseñará a decodificar palabras más complejas, por <br>
                            ejemplo, “lluvia” tiene como letras “l”, “l”, “u”, “v”, “i” y “a” que juntas forman <br>
                            la palabra “lluvia”</li>

                            <li><b>Paso 4, comprensión de la lectura:</b> al ser el último paso, se enfocará en la <br>
                            comprensión de la lectura ya que los peques aprendieron a decodificar las <br>
                            palabras y se les enseña a comprender el significado de palabras y textos.</li>
                        </ul>
                        </div>

                        <h3>Ventajas del método alfabético:</h3>
                        <ul>
                        <li>Permite la ordenación alfabética</li>
                        <li>Se puede comenzar organizando las palabras desde la más simple hasta <br>
                        la más compleja</li>
                        <li>Facilita organizar errores ortográficos de la palabra.</li>
                        </ul>

                        <h3>Desventajas del método alfabético:</h3>
                        <ul>
                        <li>Rompe el proceso de aprendizaje de la mentalidad infantil</li>
                        <li>Primero memoriza las letras y después las combinaciones</li>
                        <li>Se descuida la comprensión del significado de las palabras</li>
                        <li>Se acostumbra a deletrear.</li>
                        </ul>

                        <h3>Método fonético:</h3>
                        <p>este método se basa en aprender en primer lugar, los sonidos <br>
                        sencillos para después combinar varios y lograr de manera progresiva la <br>
                        adquisición de lectura y escritura. Empieza con los sonidos más sencillos para <br>
                        después crear estructuras más complejas.</p>

                        <ul>
                        <li>Se comienza por enseñar los sonidos de las vocales, aquí se puede hacer uso de <br>
                        láminas que comiencen por una vocal. Una vez que se conocen bien las <br>
                        vocales se puede comenzar a mostrar palabras que tengan la vocal en el <br>
                        centro o al final.</li>

                        <li>Posteriormente, se comienza con los diptongos, dos vocales unidas, se puede <br>
                        repetir la técnica y se le puede mostrar a los peques láminas con distintos objetos, <br>
                        “agua, hierro, fuego”.</li>

                        <li>Una vez que se haya trabajado con vocales y diptongos, se introducirán las <br>
                        consonantes que se deberán presentar junto con las vocales, no por separado, <br>
                        por ejemplo: “fa, fe, fi, fo y fu, “familia, feria, fiesta o foca”.</li>

                        <li>Por último, cuando conozcan el sonido de las consonantes junto con las <br>
                        vocales empezaremos con la lectura de la palabra completa.</li>
                        </ul>

                        <h3>Ventajas del método fonético:</h3>
                        <ul>
                        <li>El aprendizaje es más intuitivo que en otros métodos.</li>
                        <li>Favorece el aprendizaje de la lectura.</li>
                        <li>Se adapta a la perfección a la comprensión del niño y une el lenguaje hablado <br>
                        con el lenguaje escrito naturalmente.</li>
                        </ul>

                        <h3>Desventajas del método fonético:</h3>
                        <ul>
                        <li>Puede llegar a resultar algo aburrido y monótono provocando <br>
                        desmotivación.</li>
                        <li>Puede llegar a descuidar la comprensión de las palabras.</li>
                        </ul>

                        <h3>Método silábico:</h3>
                        <p>el método silábico es uno de los que más se siguen empleando <br>
                        en la actualidad para iniciar el aprendizaje de la lectura y, debido a que es muy <br>
                        fácil implementarlo, puede ser uno de los más viables.</p>

                        <ul>
                        <li>Se comienza enseñando las 5 vocales, enfatizando en la forma en la que se leen <br>
                        y escriben cada una de sus grafías, se recomienda el uso de una caja de arena <br>
                        en la que los peques puedan repasar las vocales con sus dedos.</li>

                        <li>Una vez que los peques dominen las vocales, se enseñarán las consonantes, en <br>
                        este paso, es importante respetar la manera en la que se pronuncia cada <br>
                        grafía.</li>

                        <li>Posteriormente, se hacen mezclas de cada consonante con las 5 vocales, <br>
                        iniciando con las consonantes más comunes e incrementando la complejidad <br>
                        conforme los peques aprenden.</li>

                        <li>Cuando los peques conozcan varias sílabas, es un excelente momento para <br>
                        que la nannie comience a introducirlos en el aprendizaje de palabras y oraciones <br>
                        cortas.</li>

                        <li>Cuando los peques comprendan el significado de algunas oraciones, se les <br>
                        puede comenzar a mostrar sílabas inversas en las que se combinen vocales y <br>
                        consonantes como an, en, in, on, un.</li>

                        <li>En este paso, las actividades deben orientarse al aprendizaje de diptongos, <br>
                        triptongos y sílabas de 4 letras que se conocen como complejas.</li>

                        <li>Finalmente, se pueden usar ejercicios en los que los niños puedan leer oraciones <br>
                        más largas y comenzar a practicar con párrafos y textos.</li>
                        </ul>

                        <h3>Ventajas del método silábico:</h3>
                        <ul>
                        <li>Es muy sencillo de enseñar en casa.</li>
                        <li>Permite aprender de una manera rápida.</li>
                        <li>Se comienza a leer y escribir en aproximadamente 6 meses.</li>
                        </ul>

                        <h3>Desventajas del método silábico:</h3>
                        <ul>
                        <li>Se suele aprender las grafías sin saber el verdadero significado de las palabras</li>
                        <li>Puede llegar a desmotivar a los peques si no se emplean dinámicas o juegos</li>
                        <li>Los peques que desarrollan el aprendizaje de la lectura en este método pueden <br>
                        leer de manera lenta.</li>
                        </ul>

                        <p>Finalmente, tenemos el método mixto o ecléctico que es un método analítico y <br>
                        sintético, es decir que integra lo mejor de ambos, su objetivo es tomar ventaja en <br>
                        los sistemas de enseñanza y aprendizaje tradicional, usando elementos que ya <br>
                        existen para crear uno nuevo, pero agregando un concepto para la enseñanza y <br>
                        al tener muchas características facilitará el aprendizaje de la escritura y lectura <br>
                        para los peques.</p>

                        <h3>Método mixto o ecléctico:</h3>
                        <ul>
                        <li>Usar cartas con imágenes que los niños puedan asociar con letras que están <br>
                        estudiando, éstas se pueden hacer en casa para ayudar a los peques a seguir <br>
                        aprendiendo, por ejemplo, la letra “E” con el dibujo de un elefante.</li>

                        <li>Se dividirán las ilustraciones en la cantidad de sílabas que contiene la palabra, <br>
                        por ejemplo, elefante tiene 4 sílabas, el cuadro se dividirá en 4 partes para que <br>
                        el peque vea la imagen de este animal con la palabra dividida en cada una <br>
                        de sus sílabas.</li>

                        <li>Mostrarles a los peques los sonidos de diferentes objetos o animales, por ejemplo, <br>
                        el de la oveja que es “beeeee”, indicando como se representa su voz, lo que <br>
                        permitirá que la asocien con la letra B.</li>
                        </ul>

                        <h3>Ventajas del método ecléctico:</h3>
                        <ul>
                        <li>Es ideal para enseñar al ritmo del aprendizaje del peque</li>
                        <li>Motiva a los niños al aprendizaje</li>
                        <li>Integra rutas de aprendizajes léxicas y fonológicas</li>
                        <li>Contribuye a que el peque pueda leer y escribir al mismo tiempo.</li>
                        </ul>

                        <h3>Desventajas del método ecléctico:</h3>
                        <ul>
                        <li>Al tener un poco de todas las metodologías, puede llegar a causar confusiones <br>
                        en algunos peques</li>
                        <li>Se debe de contar con la capacidad de improvisación en casa, ya que se <br>
                        necesitan varias alternativas para enseñarlo.</li>
                        </ul>

                        <h3>Referencias</h3>
                        <p>Al, A. (s/f). “¿Qué es la lectoescritura?”. Twinkl. Disponible en: ¿Qué es la <br>
                        Lectoescritura?- Answered - Twinkl Teaching Wiki</p>

                        <p>Alvarado, M. (18 de febrero 2022). “Cómo enseñar a leer en casa con el método <br>
                        global”. Luca. Disponible en: Cómo enseñar a leer en casa con el método <br>
                        global(lucaedu.com)</p>

                        <p>Alvarado, M. (21 de febrero 2022). “Guía para enseñar a leer a los niños en casa <br>
                        con el método ecléctico”. Luca. Disponible en: Enseñar a leer a los niños en casa <br>
                        con el método ecléctico - Luca (lucaedu.com)</p>

                        <p>Alvarado, M. (23 de febrero 2022). “Guía para enseñar a leer en casa con el <br>
                        método silábico”. Luca. Disponible en: Enseñar a leer con el método silábico - <br>
                        Luca (lucaedu.com)</p>

                        <p>Aprende, E. (17 de febrero). “El método alfabético: la clave para enseñar a leer <br>
                        de forma efectiva y duradera”. EducaAprende. Método Alfabético: Ventajas, <br>
                        Fases de Aprendizaje y Actividades (educayaprende.com)</p>

                        <p>Fernández, J. (9 de marzo de 2020). “¿Qué es el método fonético: actividades, <br>
                        ejemplos y significado?”. GEU editorial. Disponible en: ¿Qué es el método fonético: <br>
                        actividades, ejemplos y significado? – Blog Editorial GEU</p>

                        <p>Guerrero, J. (10 de agosto de 2020). “Métodos de enseñanza de la lectoescritura: <br>
                        sintéticos, analíticos y mixtos”. Docentes al día. Disponible en: Métodos de <br>
                        enseñanza de la lectoescritura: sintéticos, analíticos y mixtos (docentesaldia.com)</p>
                    `
                },

                {
                    id: 59,
                    titulo: "🌿 Montessori en casa: cuando el entorno se vuelve tu mejor aliado para criar con calma y autonomía",
                    resumen: "A veces no hace falta “más”, sino mejor: un espacio que respete a tu peque, lo invite a descubrir y le dé libertad con orden. Este artículo te muestra cómo aplicar Montessori más allá del aula, con ideas sencillas y reales para transformar tu casa en un lugar que acompaña su independencia y confianza.",
                    imagen: "assets/img/articulos/59.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                        <h3>Método Montessori más allá del aula</h3>

                        <div class="reading-note">
                        <p>Has escuchado la frase “un peque aprende mejor cuando el entorno se lo permite” actualmente, la educación es rica en métodos, intenciones y finalidades sociales, pero no se puede decir que tome en consideración la vida en sí misma.</p>
                        </div>

                        <p>La finalidad del método Montessori, es crear un ambiente, que le permita al peque explorar el mundo de una forma segura y adaptada a sus necesidades.</p>

                        <h3>¿Qué es un ambiente preparado?</h3>
                        <p>Es un lugar donde el peque tiene libertad para moverse, elegir y participar, pero dentro de un entorno ordenado, seguro y adaptado a su tamaño y necesidades.</p>

                        <p>María Montessori creía que el ambiente debía ser como “un maestro silencioso”, es decir, que todo lo que rodea al peque le invite a actuar por sí mismo y a descubrir el mundo a su ritmo.</p>

                        <div class="reading-note">
                        <p><strong>Elementos esenciales de un ambiente Montessori</strong></p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>1.</strong></span><span><strong>Orden y sencillez:</strong></span></div>
                        </div>
                        <p>el orden externo ayuda al orden interno, no se trata de tener muchos juguetes o materiales, sino los necesarios, cada cosa debe tener su lugar para que el peque aprenda a cuidar su entorno y a concentrarse mejor.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>2.</strong></span><span><strong>Accesibilidad:</strong></span></div>
                        </div>
                        <p>todo debe estar al alcance del peque como estantes bajos, cestas con materiales, ganchos para su mochila, etc. Esto le permitirá decidir y actuar fomentando su autonomía.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>3.</strong></span><span><strong>Belleza y armonía:</strong></span></div>
                        </div>
                        <p>Montessori decía que el ambiente debía ser bonito, luminoso y limpio, porque eso genera calma y ganas de aprender, pueden colocar plantas, cuadros pequeños o elementos naturales.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>4.</strong></span><span><strong>Materiales naturales y reales:</strong></span></div>
                        </div>
                        <p>se recomienda evitar los juguetes de plástico con luces o sonidos es mejor ofrecerle cucharas, pinzas, frascos, cepillos, cubeta, etc. Todo lo que permita experimentar con texturas y movimientos reales.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>5.</strong></span><span><strong>Espacio para el movimiento:</strong></span></div>
                        </div>
                        <p>los peques necesitan moverse para aprender, un tapete, una alfombra suave o un área libre de obstáculos les da la oportunidad de explorar con seguridad.</p>

                        <h3>¿Cuáles son los beneficios de un ambiente preparado?</h3>
                        <p>Cuando un peque tiene un entorno así, no solo se divierte más, sino que también:</p>

                        <div class="reading-note">
                        <ul>
                            <li>Desarrolla independencia y confianza.</li>
                            <li>Mejora su concentración y coordinación.</li>
                            <li>Aprende a cuidar sus cosas y su entorno.</li>
                            <li>Se vuelve más tranquilo y responsable.</li>
                        </ul>
                        </div>

                        <p>Además, un ambiente preparado facilita mucho el desarrollo de nuevas habilidades ya que los peques se sienten seguros, saben qué esperar y logran hacer más cosas por sí mismos.</p>

                        <h3>Ejemplos sencillos para aplicar Montessori en casa:</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>•</span><span>Tener una bandeja con materiales (como bloques, cucharas o pinzas) en lugar de una caja llena de juguetes.</span></div>
                        <div class="rt-row"><span>•</span><span>Colocar una jarra pequeña con agua y vasos para que el peque pueda servirse solo.</span></div>
                        <div class="rt-row"><span>•</span><span>Usar ganchos bajitos para que cuelgue su mochila o abrigo.</span></div>
                        <div class="rt-row"><span>•</span><span>Crear una canasta de lectura con pocos libros, rotándolos cada semana.</span></div>
                        <div class="rt-row"><span>•</span><span>Dedicar un espacio para actividades de vida práctica limpiar una mesa, regar plantas o doblar servilletas.</span></div>
                        </div>

                        <div class="reading-note">
                        <p>El ambiente preparado no es solo un espacio bonito o que se requiera material costoso, sino es una forma de mostrar respeto hacia el peque creando un acompañamiento más consciente.</p>
                        </div>

                        <h3>Bibliografía</h3>
                        <p>Asociación Montessori Internacional. (s.f.). Principios del método Montessori. Montessori-AMI https://montessori-ami.org/about-montessori</p>

                        <p>Montessori, M. (2003). La mente absorbente del niño. Editorial Diana. https://fundaciontorresyprada.org/wp-content/uploads/2022/01/LA-MENTE￾ABSORBENTE-DEL-NINO.pdf</p>

                        <p>Montessori, M. (2017). El método Montessori. Ediciones Paidós. https://20Montessori%20Maria%20-%20El%20Metodo%20Montessori.pdf</p>
                    `
                },

                {
                    id: 60,
                    titulo: "📚✨ Método silábico: el camino paso a paso para que su peque lea y escriba con confianza",
                    resumen: "Leer y escribir no es magia: es un proceso precioso que se construye con paciencia, juego y constancia. Este material le guía por los pasos del método silábico, desde las vocales hasta las consonantes menos frecuentes, para acompañar la lectoescritura con estructura y motivación.",
                    imagen: "assets/img/articulos/60.jpg",
                    categoria: "Lenguaje",
                    contenido: `
                        <div class="reading-note" style="background:linear-gradient(135deg, rgba(232,76,154,.08), rgba(59,182,196,.10));border-left:5px solid var(--pink-main);">
                        <h1 style="font-size:32px;line-height:1.15;margin:4px 0 10px 0;">Método silábico</h1>
                        <p style="margin:0;opacity:.95;">La lectoescritura es conocida como el proceso de aprendizaje para leer y escribir, 
                    ocurre alrededor de los 4 a 6 años y es cuando se le debe asignar pequeñas 
                    tareas para reforzarlo. En ocasiones puede llegar a ser complicado ya que son 
                    procesos conectados, pero fundamentales.</p>
                        </div>

                        <p>En el desarrollo de la lectoescritura intervienen diversos procesos como la 
                    percepción, memoria, cognición, metacognición, capacidad y conciencia. Este 
                    proceso cuenta con algunos pasos, el primero implica pasar de la no conciencia 
                    entre la escritura y el lenguaje hablado, a asociar lo escrito con el lenguaje oral y a 
                    poder dominar los signos escritos. El segundo paso es pasar del proceso de 
                    las operaciones conscientes como identificar cada sonido de las letras y después 
                    hacerlo de manera inmediata, con el dominio del lenguaje y texto escrito.</p>

                        <p>Actualmente, el método silábico es una de las metodologías más frecuentes para 
                    empezar el proceso de lectoescritura en niños, ya que es el proceso de enseñar a 
                    leer y escribir a los niños. Consta en enseñar la lectura combinando vocales y 
                    consonantes para formar silabas y conforme avanza el proceso, se va 
                    incorporando más dificultad para que los niños puedan alcanzar los últimos niveles 
                    de la formación de palabras y frases.</p>

                        <h3>Para empezar este método se deben seguir pasos:</h3>

                        <div class="reading-note">
                        <p style="margin:0;"><strong>1.</strong> Primero se deben enseñar las vocales “A E I O U”, se sugiere trabajar con 
                    imágenes, palabras, tarjeteros, areneros y distintas actividades para que el niño las 
                    conozca, identifique su grafía y finalmente, pueda hacer uso de ella.</p>
                        <p style="margin:12px 0 0 0;"><strong>Actividades para promover el aprendizaje de las vocales:</strong></p>
                        </div>

                        <div class="reading-note">
                        <p style="margin:0;"><strong>2.</strong> Una vez que el peque domine las vocales, 
                    empezaremos a incluir las primeras consonantes, en primer lugar, irán las que 
                    no tienen mucha dificultad para los niños y pueden pronunciar fácilmente. 
                    Estás son “M, P, L, S, D, y N”. Con ellas se deben combinar las 5 vocales 
                    en sílabas directas “MA, ME, MI, MO, MU”. Aquí se pueden incluir actividades 
                    en hojas de trabajo, tapas con cada letra para formar silabas, etc.</p>
                        <p style="margin:12px 0 0 0;"><strong>Actividades para promover el aprendizaje de las consonantes “M, P, L, S, D, y 
                    N”:</strong></p>
                        </div>

                        <div class="reading-note">
                        <p style="margin:0;"><strong>3.</strong> De igual manera, una vez que el niño haya dominado las consonantes 
                    anteriores, se enseñarán las consonantes con variantes, es decir, aquellas que 
                    tienen sonidos similares, pero se escribe de diferente forma, estas son: “R, RR, B, V, 
                    G, J, C, Q, Z, y LL”, aquí es muy importante hacer énfasis en las letras por sí solas, 
                    esto para que aprendan a identificar cada una y poder usarlas juntas.</p>
                        <p style="margin:12px 0 0 0;"><strong>Actividades para promover el aprendizaje de las consonantes “R, RR, B, V, G, J, C, 
                    Q, Z y LL”:</strong></p>
                        </div>

                        <div class="reading-note">
                        <p style="margin:0;"><strong>4.</strong> Por último, enseñaremos las consonantes menos frecuentes como “H, CH, K, 
                    Ñ, X y W”: <strong>Actividades para promover el aprendizaje de las consonantes “H, CH, 
                    K, Ñ, X y W”</strong></p>
                        </div>

                        <h3>Referencias:</h3>

                        <div class="reading-table">
                        <div class="rt-row">
                            <span style="font-weight:800;color:var(--pink-main);">Educativos, M. (2022).</span>
                            <span>“¿Cuál es el orden adecuado para enseñar las letras? 
                    Silabas simples y trabadas” Los materiales educativos. Disponible en: 
                    https://losmaterialeseducativos.com/en que-orden-ensenar-las-letras/</span>
                        </div>

                        <div class="rt-row">
                            <span style="font-weight:800;color:var(--pink-main);">Más, L. (16 de agosto de 2016).</span>
                            <span>“¿Qué es la lectoescritura?”. Logopedia y más. 
                    Disponible en: https://www.logopediaymas.es/blog/lectoescritura/</span>
                        </div>

                        <div class="rt-row">
                            <span style="font-weight:800;color:var(--pink-main);">Mente, P. (16 de julio de 2019).</span>
                            <span>“Método silábico: Características de esta técnica 
                    de lectoescritura”. Psicología y Mente. Disponible en: 
                    https://psicologiaymente.com/desarrollo/metodo-silabico</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 61,
                    titulo: "🌙 Pesadillas en los peques: cómo sostenerlos con amor cuando el miedo aparece en la noche",
                    resumen: "Escuchar su llanto en la madrugada parte el corazón… pero también puede ser una oportunidad hermosa de acompañar, calmar y fortalecer su seguridad. Esta guía le explica por qué pasan las pesadillas, qué hacer en el momento y cómo distinguirlas de los terrores nocturnos.",
                    imagen: "assets/img/articulos/61.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/35.jpg')"></div>

                        <div class="reading-note" style="margin-top:0;">
                        <strong>Pesadillas en los peques: un acompañamiento con amor</strong>
                        </div>

                        <p>Las pesadillas son más comunes de lo que imaginamos, aunque pueden causar mucho miedo en los peques, sin embargo, estas, forman parte normal de su desarrollo emocional y cerebral, entender por qué ocurren y cómo apoyarlos puede hacer una gran diferencia en su descanso.</p>

                        <h3>¿Qué son las pesadillas y por qué aparecen?</h3>

                        <p>Las pesadillas son sueños muy intensos y desagradables, normalmente llenos de miedo; suelen ocurrir durante la fase de sueño MOR (o REM), cuando el cerebro está muy activo procesando emociones, experiencias y aprendizajes del día.</p>

                        <p>En la infancia, las pesadillas pueden aparecer porque:</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row"><span>1.</span><span style="text-align:right;">Están madurando la imaginación y el pensamiento simbólico, lo que hace sus sueños más vívidos.</span></div>
                        <div class="rt-row"><span>2.</span><span style="text-align:right;">Experimentan cambios importantes como empezar la escuela, separación de los padres, cambio de casa, llegada de un hermanito, etc.</span></div>
                        <div class="rt-row"><span>3.</span><span style="text-align:right;">Tuvieron un día muy cargado de emociones (alegría, miedo, estrés, cansancio).</span></div>
                        <div class="rt-row"><span>4.</span><span style="text-align:right;">Vieron imágenes o escucharon historias que no lograron procesar.</span></div>
                        <div class="rt-row" style="border-bottom:none;"><span>5.</span><span style="text-align:right;">Tienen rutinas de sueño irregulares o se duermen muy cansados.</span></div>
                        </div>

                        <div class="reading-note">
                        <strong>Lo más importante es recordar que las pesadillas no indican un problema grave sino, una forma natural del cerebro de organizar emociones y vivencias.</strong>
                        </div>

                        <h3>¿Qué hacer cuando un peque tiene una pesadilla?</h3>

                        <p>La manera en que respondemos puede darle tranquilidad inmediata y también enseñarle a gestionar sus emociones a largo plazo.</p>

                        <p>Algunas estrategias que se pueden implementar son las siguientes:</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;"><strong>Acompañar con calma:</strong> el miedo se contagia, la calma también, hablar suave, abrazar si lo desea y validar lo que siente ayuda a que su cuerpo se regule.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;"><strong>Evitar frases como “no pasó nada”:</strong> para el peque sí pasó algo, sintió miedo real, es mejor cambiarlo por frases como, “fue un sueño feo, pero ya pasó, estás a salvo aquí estoy contigo”.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;"><strong>Permitir que hable de lo que soñó:</strong> nombrar lo que les asustó les ayuda a entenderlo y disminuir su intensidad.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;"><strong>Ofrecer un objeto de seguridad:</strong> un peluche, manta o luz tenue puede ofrecer contención emocional.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;"><strong>Mantener rutinas de sueño predecibles;</strong> los horarios, el ambiente tranquilo y un ritual relajante (cuento, música suave, respiraciones) disminuyen la aparición de pesadillas.</span>
                        </div>

                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;"><strong>Evitar pantallas antes de dormir:</strong> las pantallas estimulan demasiado el cerebro y pueden aumentar sueños intensos.</span>
                        </div>
                        </div>

                        <h3>¿Cuándo consultar a un profesional?</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row"><span>1.</span><span style="text-align:right;">Aunque las pesadillas son normales, conviene pedir orientación si, son muy frecuentes (casi todas las noches).</span></div>
                        <div class="rt-row"><span>2.</span><span style="text-align:right;">Interfieren con su vida diaria o le causan gran angustia.</span></div>
                        <div class="rt-row"><span>3.</span><span style="text-align:right;">Aparecen después de un evento traumático.</span></div>
                        <div class="rt-row" style="border-bottom:none;"><span>4.</span><span style="text-align:right;">Hay signos de terrores nocturnos (gritos intensos sin despertar, confusión, no recuerdan el episodio)</span></div>
                        </div>

                        <h3>¿Qué pasa cuando un peque no puede despertar o calmarse?</h3>

                        <p>Si el peque está gritando, llorando, sudando, agitado, pero no despierta, o despierta desorientado y no reconoce a quien lo acompaña, probablemente está viviendo un terror nocturno y no una pesadilla. Aunque puede causarles mucho miedo a los adultos, no es peligroso y el peque no sufre daño emocional, de hecho, no lo recordará al siguiente día.</p>

                        <h3>Diferencias rápidas entre pesadilla y terror nocturno:</h3>

                        <div class="reading-table" style="padding:0; overflow:hidden;">
                        <div class="rt-row" style="background:#F1F5F9; padding:12px 15px; border-bottom:1px solid #E2E8F0;">
                            <span style="font-weight:900; color: var(--text-main);">PESADILLA</span>
                            <span style="font-weight:900; color: var(--text-main); text-align:right;">TERROR NOCTURNO</span>
                        </div>
                        <div class="rt-row" style="padding:12px 15px;">
                            <span>Sí despiertan y piden ayuda.</span>
                            <span style="text-align:right;">No pueden despertar.</span>
                        </div>
                        <div class="rt-row" style="padding:12px 15px;">
                            <span>Recuerdan lo que soñaron.</span>
                            <span style="text-align:right;">No recuerdan nada.</span>
                        </div>
                        <div class="rt-row" style="padding:12px 15px;">
                            <span>Quieren consuelo.</span>
                            <span style="text-align:right;">Rechazan el contacto, aunque estén dormidos.</span>
                        </div>
                        <div class="rt-row" style="padding:12px 15px; border-bottom:none;">
                            <span>Son menos intensas.</span>
                            <span style="text-align:right;">Episodio fuerte: gritos, sudor, agitación.</span>
                        </div>
                        </div>

                        <h3 style="margin-top:28px;">¿Por qué pasa esto?</h3>

                        <p>Los terrores nocturnos ocurren cuando el cerebro está pasando de un sueño profundo a otro nivel de sueño y queda como “atrapado” entre fases, no puede despertarse del todo ni seguir durmiendo de manera normal.</p>

                        <h3>Factores que los desencadenan:</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;">Mucho cansancio o falta de sueño.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;">Enfermedad o fiebre.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;">Cambios importantes (emocionales o de rutina).</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;">Dormirse demasiado rápido por agotamiento.</span>
                        </div>
                        </div>

                        <h3>¿Qué hacer en ese momento?</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row"><span>1.</span><span style="text-align:right;">Mantener la calma, el episodio suele durar entre 5 y 15 minutos.</span></div>
                        <div class="rt-row"><span>2.</span><span style="text-align:right;">No intentar despertarlo a la fuerza, despertarlo puede confundirlo más y prolongar el episodio.</span></div>
                        <div class="rt-row"><span>3.</span><span style="text-align:right;">Proteger su seguridad física, asegura que no golpee muebles, no caiga de la cama y que su espacio esté despejado.</span></div>
                        <div class="rt-row"><span>4.</span><span style="text-align:right;">Acompañar en silencio, puedes decir con voz suave, “estoy contigo, estás seguro/a”, aunque no parezca que escucha.</span></div>
                        <div class="rt-row" style="border-bottom:none;"><span>5.</span><span style="text-align:right;">Mantener rutinas de sueño consistentes, es la mejor prevención.</span></div>
                        </div>

                        <h3 style="margin-top:28px;">¿Cuándo hay que consultar a un profesional?</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;">Si ocurre varias veces por semana.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;">Si el peque se lastima durante los episodios.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;">Si duran más de 20–30 minutos.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">•</span>
                            <span style="flex:1; text-align:right;">Si empezaron después de un evento traumático</span>
                        </div>
                        </div>

                        <p>Las pesadillas son parte de crecer, es importante hacerlos sentir acompañados, escuchados y protegidos, cada abrazo después de un mal sueño es una oportunidad de fortalecer su seguridad.</p>

                        <h3 style="margin-top:28px;">Referencias</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>López, S. A. (2014). Trastornos del sueño en la infancia. Clasificación, diagnóstico y tratamiento. Anales de Pediatría Continuada, 51. Recuperado de https://www.elsevier.es/es-revista-anales-pediatria-continuada-51-articulo￾trastornos-del-sueno-infancia-clasificacion-S169628181470188X</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>Asociación Española de Pediatría de Atención Primaria. (2022). Alteraciones del sueño infantil. Recuperado de https://www.aepap.org/sites/default/files/265-278_alteraciones_sueno_libro_18_congreso_aepap_2022.pdf</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>Mayo Clinic. (s. f.). Miedos del sueño (terrores nocturnos) – Síntomas y causas. Recuperado de https://www.mayoclinic.org/es/diseases-conditions/sleep￾terrors/symptoms-causes/syc-20353524</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>MedlinePlus. (s. f.). Terror nocturno en niños. Recuperado de https://medlineplus.gov/spanish/ency/article/000809.htm</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span>https://www.aepap.org/sites/default/files/265278_alteraciones_sueno_libro_18_congreso_aepap_2022.pdf</span>
                        </div>
                        </div>
                    `
                },

                {
                    id: 62,
                    titulo: "💛 Deberes sin lágrimas: cómo acompañar a tu peque con calma, rutina y motivación real",
                    resumen: "A veces la tarea se siente como una batalla… pero puede convertirse en un momento de conexión y logro. Aquí tienes tips prácticos para ayudar a tus peques a hacer sus deberes con descansos, refuerzo positivo y dinámicas divertidas que sí funcionan.",
                    imagen: "assets/img/articulos/62.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                        <h1>¿Cómo logro que mis peques hagan sus deberes?</h1>

                        <p>El hacer la tarea, puede ser todo un desafío, ya que, nuestros peques pueden llegar cansados de la escuela y lo que menos quieren ese sentarse y seguir estudiando. Por ese motivo, te hemos dejado algunos tips que te pueden ayudar a la hora de hacer la tarea con tus peques:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>1. Deja que descanse antes de hacer los deberes:</b></span><span></span></div>
                        </div>
                        <p>Salir de la clase para meterse en la habitación y sentarse el escritorio es algo que no le apetece a ningún niño, tampoco le gustaría a un adulto. Por lo tanto, deja que tenga un tiempo de esparcimiento y diversión antes de comenzar con las materias. De esta manera, podrá refrescar su mente, algo que le ayudará a afrontar la tarea escolar con mayor capacidad de concentración. Basta con media hora o una hora, según el tiempo del que dispongan, para que el niño pueda comer tranquilamente en casa o jugar un rato con sus juguetes antes de comenzar los deberes.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>2. Sé un ejemplo para tu peque</b></span><span></span></div>
                        </div>
                        <p>Si, cada vez que sale del colegio le preguntas si tiene deberes y la respuesta te disgusta y lo expresas ante él, será difícil motivarle. Evita comentarios del tipo "¡tantos deberes!", "¡por favor, ¿otra tarde castigados con los deberes?!" Intenta realizar comentarios positivos y guarda para ti lo que realmente piensas sobre los deberes escolares.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>3. Pequeños descansos mientras hacen los deberes</b></span><span></span></div>
                        </div>
                        <p>Si tu peque tiene una gran cantidad de deberes, será complicado que los haga todos desde principio a fin sin levantar la cabeza, por lo tanto, lo ideal es programar el rato de estudio para que trabaje alrededor de 20 minutos y descanse 5min, así sucesivamente hasta que termine los deberes. Esos cinco minutos, serán un breve descanso para ir a comer algo a la cocina, beber agua, hablar con él, etc.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>4. Refuerzo positivo</b></span><span></span></div>
                        </div>
                        <p>Emplea un lenguaje positivo cuando tu pequeño esté haciendo los deberes y evita las frases del tipo "no entiendes nada", "lo has hecho mal". Utiliza la empatía y haz todo lo contrario, refuerza aquello que haga bien, por ejemplo: "está genial, buen trabajo", "te has esforzado mucho, muy bien". Y, si los ejercicios no están correctos, de nuevo usa el lenguaje en positivo "esto puede mejorar", "el resultado no es correcto, si lo repasas, seguro que te sale bien". Hay que felicitar a tu pequeño cuando lo hace bien y animarle cuando no lo ha hecho bien tiene excelentes resultados. De esta manera, los niños se enfrentarán a la tarde de deberes con más motivación.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>5. Un merecido descanso tras los deberes</b></span><span></span></div>
                        </div>
                        <p>No se trata de premiar a nuestros pequeños cada vez que hace deberes, pero sí puedes reservar actividades divertidas, juegos que les gusten para cuando acaben su tarea. Incluso puedes usar frases como: "cuando termines los deberes, jugamos a algo", "no te preocupes, vamos a jugar tu juego favorito, pero primero hay que terminar los deberes", o incluso puedes solicitar la ayuda de los papás para cumplir con este objetivo, por ejemplo, los puedes hacer parte pidiéndoles que sean ellos quienes les den la recompensa con una tarde de picnic, viendo una película al finalizar tu servicio, comiendo algo especial, etc.</p>

                        <h3>Haciendo las tareas de forma divertida:</h3>
                        <p>En primer lugar, es importante el generar una rutina, ya que, éstas son un mecanismo que ayuda a los niños a ganar destrezas. Si todos los días recogen sus juguetes, asimilarán el hábito de la organización; si todos los días cepillan sus dientes, adquirirán el hábito de la higiene, y así sucesivamente.</p>

                        <ul>
                        <li>Los hábitos y rutinas ayudan a los niños a ganar en constancia.</li>
                        <li>Son buenas para ayudar al niño a hacerse más responsable.</li>
                        <li>Son necesarias para que los niños vayan adquiriendo hábitos de autonomía.</li>
                        </ul>

                        <p>Por lo tanto, aquí te dejamos algunas actividades para ir organizando junto con tu peque sus actividades diarias:</p>

                        <div class="reading-note">
                        <strong>El truco del reloj:</strong>
                        <p>sirve para que los niños hagan sus tareas a tiempo. Y lo mejor es que no hace falta que conozcan las horas, los minutos y los segundos.</p>
                        <p>Para hacerlo, pueden utilizar un reloj, pueden hacerlo o solicitarle a la familia que les preste uno, una vez que lo tengan deberán dividirlo la base del reloj por colores, cada división estará asignada a una tarea distinta y llevará un tiempo determinado. Esto de acuerdo con el tiempo que esté asignado por la familia o el servicio, incluso, la familia se puede hacer parte de este truco, entre todos pueden asignar el tiempo y la rutina que seguirán para que cuando la nanny no vaya al servicio, la familia siga con la misma rutina.</p>
                        <p>Recuerda que el reloj debe estar colocado en un lugar visible, donde los pequeños, puedan ir viendo el tiempo que tienen para cenar, ducharse o hacer sus tareas.</p>
                        </div>

                        <div class="reading-note">
                        <strong>Calendario de fichas:</strong>
                        <p>este calendario lo pueden implementar junto con el reloj, es decir, una vez que tengan asignadas las tareas diarias, pueden agregarlas en el reloj estableciendo el horario que tendrán para realizar cada una, después, harán un calendario semanal, donde irán poniendo una estrellita (o figura que prefieran los niños) por tarea realizada y un tache por aquellas que no se hicieron.</p>
                        <p>Con base en los resultados, la familia puede definir si les da a los pequeños una recompensa, por ejemplo, si toda la semana cumplieron con sus deberes el fin de semana los pequeños pueden elegir la actividad a realizar en familia, por ejemplo: ir por un helado, jugar a su juego favorito, ver la película que ellos prefieran, salir a jugar al parque, etc. Y, en dado caso de no cumplir, las recompensas serán postergadas.</p>
                        </div>

                        <h3>Otra forma de realizar el calendario es la siguiente:</h3>
                        <p>En primer lugar, prepararemos el indicador visual, en una cartulina pondremos un calendario, donde cada día tenga un cuadradito. Y preparemos los stickers y la tabla de recompensas.</p>

                        <div class="reading-note">
                        <p>Le explicamos a los pequeños el funcionamiento del juego: “Este calendario nos va a servir para comprobar cuando hacemos los deberes. Cada día usaremos las stickers correspondientes. El sticker verde indica que ese día hicieron bien los deberes, sin quejas y con tiempo. El rojo indicará lo contrario que no hicieron los deberes. Y el azul nos indica que nos ha costado ponernos a hacer los deberes, pero que al final los hemos hecho.</p>
                        <p>Cada día pegaremos en el cuadradito correspondiente el sticker que nos indique como hemos hecho los deberes. Nuestro objetivo es conseguir todas las pegatinas verdes que podamos.</p>
                        <p>Cuando tengamos pegatinas verdes podremos cambiarlas por las recompensas de la tabla.</p>
                        <p>La tabla de recompensas estará siempre visible, al igual que el calendario de tareas. Podrán obtener diferentes recompensas en función del número de pegatinas verdes que tengan. De esta forma les enseñamos también a esforzarse por obtener una recompensa y a esperar para obtenerla.</p>
                        <p>Ejemplo de tabla de recompensas:</p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><b>¿Cuántas pegatinas verdes?</b></span><span><b>¿Qué puedo obtener?</b></span></div>
                        <div class="rt-row"><span>5 gomet verdes</span><span>Helado de postre</span></div>
                        <div class="rt-row"><span>8 gomet verdes</span><span>Jugar al juego que elijas</span></div>
                        <div class="rt-row"><span>10 gomet verdes</span><span>Ir al cine a ver la pelicula que escojas</span></div>
                        <div class="rt-row"><span>15 gomet verdes</span><span>Elegir una actividad para todos.</span></div>
                        </div>

                        <p>La tabla de recompensas la elaboraremos con los pequeños e incluiremos dibujos, colores, etc.</p>

                        <h3>Referencias:</h3>
                        <p>Caraballo, A. (7 de noviembre de 2021). Un truco infalible para que los niños hagan sus tareas a tiempo. Guía Infantil. Disponible en: https://www.guiainfantil.com/blog/educacion/aprendizaje/el-truco-infalible-para-que-los ninos-hagan-sus-tareas-a-tiempo/</p>
                        <p>Con mis hijos. (2022). 3 trucos para ayudarle con sus deberes. Conmishijos. Disponible en: https://www.conmishijos.com/ahorradoras/trucos-de-super-mama/3-trucos-para-ayudarle con-los-deberes/</p>
                        <p>Educa y aprende. (2022). Juego de recompensa ¿Y si hago los deberes? Educa y aprende. Disponible en: https://educayaprende.com/juego-de-recompensa-y-si-hago-los-deberes</p>
                    `
                },

                {
                    id: 63,
                    titulo: "💗 Celos, berrinches y emociones intensas: una guía para acompañar sin gritos y con amor firme",
                    resumen: "A veces tu peque no “se porta mal”… está desbordado por dentro. Este material te ayuda a entender qué son las emociones, qué hacer cuando hay agresión, cómo acompañar con conexión antes que corrección y cómo manejar los celos entre hermanos para fortalecer el apego y la calma en casa.",
                    imagen: "assets/img/articulos/63.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <h3>Pautas para una correcta gestión de emociones y celos</h3>

                        <p>Los niños experimentan la misma gama de emociones que los adultos, y es importante que aprendan la función que cumple cada una de ellas, para que así no se sientan abrumados y sean capaces de manejarlas correctamente.</p>

                        <p>¿Qué son las emociones? Son reacciones de nuestro cuerpo ante algún estímulo del entorno o de nuestro propio organismo.</p>

                        <p>Es tal la fuerza de esa reacción que lo mejor sería definirlas como experiencias o estados emocionales, pues engloban toda una serie de respuestas que pueden prolongarse en el tiempo e incluso pueden marcar la vivencia de futuras experiencias, aprendiendo de ellas.</p>

                        <p>Aunado a lo anterior, nuestros pequeños al estar en edades muy tempranas del desarrollo tienen una mayor dificultad al expresar o reconocer sus emociones, por tal motivo, el desborde emocional suele ser más común y se presenta a través de los berrinches o conductas agresivas, como cuando los niños pegan porque carecen de la capacidad para poder expresarse y comunicarse, así como de las habilidades necesarias para canalizar su frustración. Un bebé domina antes las manos que el lenguaje.</p>

                        <div class="reading-note">
                        <p><strong>Cuando los niños agraden a otro niño… ¿Qué no debemos hacer?:</strong></p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>•</strong></span><span>Gritar para que los niños hagan caso. Es difícil que los niños nos escuchen mientras les gritamos. Los gritos provocan miedo y con miedo no hay posibilidad de aprendizaje. Si tratamos de que un niño entienda los motivos por los que no debe pegar es necesario que esté abierto a la escucha, los gritos nos alejan de ellos. Si nosotros gritamos, por qué no van a gritar ellos a los demás…</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span>Golpear o zarandear. Quizá eres de los que piensa que un cachete a tiempo es necesario, pero la realidad es que resulta contradictorio y contraproducente usar la violencia cuando tratamos de enseñar los niños a no ser violentos. Si queremos un mundo más amable, hagamos que los niños aprendan desde el cariño y el respeto.</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span>Castigar.</span></div>
                        </div>

                        <div class="reading-note">
                        <p><strong>¿Qué sí debemos hacer?:</strong></p>
                        </div>

                        <ul>
                        <li>Atender al niño que ha sido agredido.</li>
                        <li>Apartar al niño que ha agredido y si queremos, hablar con él y corregir en privado en lugar de humillarle o hacerle sentir culpa o vergüenza.</li>
                        <li>Tiempo fuera positivo: enseña a los niños a comprender que su cerebro no funciona bien cuando está alterado. Aprenden el valor de tomarse un tiempo fuera para calmarse hasta que sus cerebros funcionen de forma ventajosa para ellos, en lugar de perjudicial. La analogía del deporte: el propósito es detener el reloj, recuperar el aliento, reagruparse, echar un vistazo a lo que no está funcionando y elaborar un nuevo plan. El tiempo fuera positivo puede hacer lo mismo tanto para los niños como para los adultos. Puede detener el reloj del comportamiento negativo y dar tiempo para calmarse antes de que sea posible un nuevo comportamiento. Como los niños se comportan mejor cuando se sienten mejor, podrán reagruparse y elaborar un nuevo plan que les sirva a ellos y a los demás.</li>
                        <li>Mostrar al niño lo que debe hacer en vez de no hacer. Cuando son muy pequeños puedes coger su mano y enseñarle a hacerlo de otra manera: “mejor así, caricias”, cuando ya disponen de lenguaje para comunicarse ayudarle a desarrollar habilidades; “puedes decir a tu amigo que no te ha gustado que te quite el juguete”.</li>
                        <li>Otra medida que recomiendan algunos psicólogos es retirarle temporalmente de alguna actividad o de algún objeto. Por ejemplo, una tarde sin dibujos animados. La retirada temporal, no puede superar los 2 días, aunque el tiempo ideal es una tarde o una jornada.</li>
                        <li>Anticiparnos, entrenar habilidades y darles la oportunidad de que resuelvan problemas ellos mismos antes de que se produzca el conflicto. Mediante preguntas abiertas podemos enfocarnos en soluciones:</li>
                        </ul>

                        <ul>
                        <li>¿Qué podemos hacer la próxima vez que te enfades?, “¿Qué se te ocurre para que tú y tu hermano estén conforme con la elección del canal de TV que quieres ver? “.</li>
                        <li>En dado caso de que el pequeño te pegue o insulte, normalmente guiado por una frustración, no te dejes llevar por tu ira y por el ego adulto, y reflexiona. Piensa qué le pasa, por qué le pasa y reflexiona sobre si realmente el motivo por el que está pasando por eso está justificado y sopesado. En el caso de que fuera así, entonces sólo queda acompañar. Rebajarse a su altura, mirarle a los ojos, utilizar un buen tono y gesto y decirle que comprendemos su enfado, que en su caso estaríamos igual, pero que no nos haga daño ni nos insulte, que nos pone tristes y que nos causa dolor. Poco a poco, con una buena reacción por nuestra parte, irán integrando una manera de “estallar” más pausada".</li>
                        <li>Conexión antes que corrección, “Sé que estás enfadado”, "Entiendo que a ti no te gustó que te hicieran eso”,” Sé cómo te sientes”. “Sé que tú eres capaz de pedirlo sin pegar”.</li>
                        <li>Cuando el niño tiene interés social y capacidad para expresar sus sentimientos y reconocer los de los demás podemos trabajar con ellos la empatía con preguntas abiertas:” ¿A ti te gusta que te peguen?”, “¿Cómo te sientes cuando te hacen daño?”.</li>
                        <li>Es importante elogiar todas las situaciones que el niño resuelva sin morder o pegar. Al principio hay que felicitarlo por losintentos de mejora.</li>
                        <li>Enseñarle a repetir en su interior: “se muerden los alimentos, a las personas no”; “A los niños no se le pega”.</li>
                        <li>Ayudar poco a poco a controlar e identificar sus emociones. Intentando validarlas y no anularlas con frases como “no es para tanto”,” no llores”.</li>
                        </ul>

                        <div class="reading-note">
                        <p><strong>Actividades para que tus peques se relajen:</strong></p>
                        </div>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>•</strong></span><span>Colorear mándalas:</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span>Juegos silenciosos, (rompecabezas, pintura con acuarelas…):</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span>Yoga kids:</span></div>
                        <div class="rt-row"><span><strong>•</strong></span><span>Links con ejemplos:</span></div>
                        </div>

                        <p>https://www.parabebes.com/posturas-de-yoga-para-ninos-4827.html</p>
                        <p>https://www.youtube.com/watch?v=5XCQfYsFa3Q</p>
                        <p>https://www.youtube.com/watch?v=on_9AhPQigE</p>

                        <div class="reading-note">
                        <p><strong>Laberintos de relajación:</strong></p>
                        </div>

                        <p>Imprime unos laberintos que sean atractivos para el pequeño, puedes hacer uso de sus personajesfavoritos, animales, figuras, etc.</p>

                        <p>Cuando el pequeño necesite relajarse le proporcionarás una hoja con el laberinto y le pedirás que respire pausada y lentamente, mientras que, con el dedo índice deberá seguir el laberinto desde el inicio hasta el final y de regreso.</p>

                        <p>Puedes hacer uso de música relajante para acompañar la actividad.</p>

                        <p><strong>Materiales:</strong> hojas con laberintos impresos, música (opcional).</p>

                        <p><strong>Nos convertimos en tortugas:</strong> Con ayuda de tu peque, lean el cuento de la tortuga, lo puedes encontrar aquí: https://www.educapeques.com/escuela-de-padres/autocontrol emocional.html</p>

                        <p>Menciónale que cada vez que él este irritado, cansado y a punto de actuar de forma impulsiva, puede pensar en la tortuga y actuar como ella, resguardándose en un caparazón imaginario, para relajarse y pararse a pensar antes de actuar. Así le será más fácil encontrar soluciones a sus problemas sin dañar a los demás ni a él mismo.</p>

                        <p><strong>Materiales:</strong> cuento de la tortuga, para que sea más real pueden hacer uso o crear un disfraz de tortuga.</p>

                        <div class="reading-note">
                        <p><strong>Actividades para que tus peques controlen y reconozcan sus emociones:</strong></p>
                        </div>

                        <h3>Diccionario de emociones:</h3>

                        <p>Con ayuda de tu pequeño busquen algunas imágenes de personas con diferentes emociones, recórtenlas. Vayan identificando las emociones que se parezcan y clasifíquenlas. Si tu pequeño no sabe cuál es la emoción puedes hablarle sobre ella, cuáles son sus características, cómo se presenta, cómo podemos manejarla, etc.</p>

                        <p>Una vez clasificadas e identificadas procederemos a pegarlas en una libreta y les agregaremos el nombre de la emoción. De esta manera irá creando su propio diccionario de emociones.</p>

                        <p><strong>Materiales:</strong> Imágenes de personas con diferentes emociones, tijeras y pegamento, libreta, plumones.</p>

                        <h3>¿Se pueden dibujar las emociones?</h3>

                        <p>Con antelación, menciónale a tu peque que cuando se presente una emoción fuerte (enojo, berrinche, tristeza), puede tomar una hoja y dibujar su emoción.</p>

                        <p>Ten a la mano todoslos materiales para que haga uso de ellos cuando lo necesite.</p>

                        <p>Al terminar de dibujar, tu pequeño puede hacer lo que guste con su dibujo, rasgarlo,cortarlo, arrugarlo, tirarloosimplemente guardarlo.</p>

                        <p><strong>Materiales:</strong> hojas, colores o plumones.</p>

                        <h3>Gestión de los celos en niños pequeños</h3>

                        <p>Cuando surgen los celos los niños se sienten enfadados, rabiosos y empiezan los agotadores rifirrafes entre los hermanos que rivalizan para no perder el amor y la atención de los papás. También pueden mostrar síntomas psicosomáticos como los "¡me duele la tripa!", dejar de comer, vomitar, tener miedos nocturnos o repetir conductas ya olvidadas como perder el control del esfínter.</p>

                        <p>Algunas situaciones comunes donde surgen los celos entre hermanos son: el "síndrome del príncipe destronado", cuando el nuevo hermanito aparta del foco de atención exclusiva a su hermano mayor, hasta ese momento hijo único, y éste reacciona con hostilidad hacia los padres y el propio hermano.</p>

                        <div class="reading-note">
                        <p>Si lo que tiene es celos no hay negociación posible, sólo hacerle sentir que pase lo que pase nos tiene a su lado. La clave para que nuestro hijo vuelva a ser ese niño alegre y cariñoso es establecer una buena relación basada en el apego seguro. Esto se traduce en ser pacientes, dar a cada niño su espacio y su tiempo en exclusiva y aplicar algunas pautas para ayudarles a manejar su desbordante emoción.</p>
                        </div>

                        <p>Para que los pequeños se sientan pertenecientes y no desplazados por su hermano, puedes involucrarlo en todas las actividades posibles, por ejemplo: para cambiar la ropita del bebé cuando se le haya manchado, para preparar el baño, para ir juntos a la escuela, para ayudarle a hacer los deberes en casa... Da igual la edad en la que se encuentren los hermanos, siempre se puede contar con uno para ayudar al otro y la inversa. ¡No hay nada mejor para afianzar la relación entre ellos!</p>

                        <h3>¿Cómo afrontarlos?</h3>
                        <ul>
                        <li>Anticiparse. Favorecer el vínculo desde la infancia.</li>
                        <li>Implicar al hermano mayor.</li>
                        <li>Dedica tiempo y atención exclusiva.</li>
                        <li>Mantener una actitud amable pero firme.</li>
                        <li>Buscar juntos alternativas.</li>
                        <li>Dar explicaciones. Hacerles entender la razón del trato diferente. Así les ayudamos a comprender su individualidad.</li>
                        <li>Favorecer actitudes de cooperación. Enseñar a compartir dando ejemplo como adultos.</li>
                        <li>No ofrecer más atención al pequeño que siente celos.</li>
                        <li>Evitar las comparaciones. Los pequeños no tienen por qué ser iguales.</li>
                        <li>Ser pacientes.</li>
                        </ul>

                        <h3>Referencias:</h3>
                        <p>Arias, R., (8 de abril de 2019). Niños que pegan: por qué agreden y cómo enseñarles a no hacerlo. El país. Disponible en: https://elpais.com/elpais/2019/04/08/mamas_papas/1554707475_8946 74.ht ml#:~:text=Ense%C3%B1ar%20a%20los%20ni%C3%B1os%20a,%E2%80 %9D%2C%E2%80%9D%20no%20llores%E2%80%9D.</p>
                        <p>Martínez, B. (2022). Las 6 claves del método Montessori para tratar los celos entre hermanos. Guiainfantil. Disponible en: https://www.guiainfantil.com/educacion/celos/las-6-claves-del- metodo montessori-para-tratar-los-celos-entre-hermanos/</p>
                        <p>Nelsen, J. (25 de mayo de 2021). Tiempo fuera positivo. Positive Discipline Association. Disponible en: https://positivediscipline.org/Blog-en espanol/10551767</p>
                        <p>Palicio, A. (7 de abril de 2021). ¡No se pega! Cómo enseñar a mi hijo a no pegar. Ser padres. Disponible en: https://www.serpadres.es/1-2- anos/educacion estimulacion/articulo/no-se-pega-como-ensenarle-a-no￾pegar-491516202698</p>
                        <p>Serrano, I., y León, A. (2 de febrero de 2017). Los celos entre hermanos tienen solución. El mundo. Disponible en: https://www.elmundo.es/vida sana/mente/2017/02/02/588b1430e2704e2c348b45e5.html</p>
                        <p>Webmaster Psicología. (2022). La importancia de las emociones en los niños. Elportaldelhombre.com. Disponible en: http://www.elportaldelhombre.com/con-hijos/item/556-importancia emociones</p>
                    `
                },

                {
                    id: 64,
                    titulo: "🧩💙 Nannys y Autismo: acompañar con respeto, calma y seguridad en cada momento",
                    resumen: "Cuando una nanny entiende, acompaña mejor. Este material reúne conceptos clave sobre TEA y guía práctica para observar con objetividad, comunicarse con la familia y actuar con calma antes, durante y después de una crisis, siempre priorizando la seguridad y el cuidado emocional.",
                    imagen: "assets/img/articulos/64.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                        <div class="reading-note" style="background:linear-gradient(135deg, rgba(232,76,154,.08), rgba(59,182,196,.10));border-left:5px solid var(--pink-main);">
                        <h1 style="font-size:32px;line-height:1.15;margin:4px 0 10px 0;">Nannys y Autismo</h1>
                        </div>

                        <h3>¿Qué es el autismo?</h3>

                        <p>El autismo es una condición neurobiológica que afecta la forma en la que una 
                        persona percibe y se relaciona con el mundo. Afecta a tres áreas
                        importantes del desarrollo: social, comunicativa y de pensamiento.</p>

                        <h3>Características del DSM-5</h3>

                        <p>El escrito bajo el cual se suele emitir un diagnóstico de Autismo se llama Manual
                        Diagnóstico y Estadístico de los Trastornos Mentales Quinta Edición (DSM- 5),
                        publicado en el año 2013. En el manual se hace un especial énfasis en la
                        importancia de una identificación temprana del trastorno con el fin de brindarle
                        una mejor calidad de vida a las personas desde su infancia.</p>

                        <p>El DSM-5 propone 5 características principales de afectación del Trastorno del
                        Espectro Autista, las cualesson:</p>

                        <div class="reading-note">
                        <ol style="margin:0;padding-left:18px;">
                            <li>Patrones restrictivos y repetitivos de comportamiento.</li>
                            <li>Síntomas presentes en las primeras fases de desarrollo.</li>
                            <li>Deterioro clínicamente significativo en lo social, laboral u otras áreas.</li>
                            <li>No se explica mejor por la discapacidad intelectual o retraso global.</li>
                        </ol>
                        </div>

                        <h3>Diccionario del Espectro</h3>

                        <p>Con el fin de conocer algunos conceptos básicos actuales de las
                        neurodivergencias, proporcionamos el siguiente listado de conceptos acerca de
                        actitudes o herramientas de los que hacen uso las personas con TEA:</p>

                        <div class="reading-note">
                        <ol start="5" style="margin:0;padding-left:18px;">
                            <li><strong>Ecolalia:</strong> Repetición de una palabra o sonido de manera involuntaria, que 
                            parece simular un eco de este sonido.</li>
                            <li><strong>Stimming:</strong> Conducta que ayuda a gestionar y regular las emociones a una 
                            persona autista,suelen ser algunos movimientos oruidosrepetitivos.</li>
                            <li><strong>Scripting:</strong> Comportamiento repetitivo en el que la persona planea diálogos 
                            previos a la interacción social.</li>
                            <li><strong>Masking:</strong> Estrategia social que utilizan las personas con autismo para adaptarse y/o 
                            encajar en un ambiente en particular.</li>
                        </ol>
                        </div>

                        <h3>¿Qué hacer cómo nanny?</h3>

                        <p><strong>Observar y analizar:</strong> Se requiere ser observadora y objetiva con la información recabada
                        en un largo periodo de tiempo, siempre entendiendo que nosotras
                        como NANNIES NO ESTAMOS CAPACITADAS PARA DIAGNOSTICAR A LOS PEQUES
                        CON AUTISMO.</p>

                        <p><strong>Diálogo con los papás:</strong> Antes de que platiques con ellos piensa (a través de la
                        observación): “¿Los papás están dispuestos a escuchar la información?” Si no lo
                        están, por triste que pueda llegar a parecer, mejor evítalo y enfócate en realizar tu
                        trabajo de la mejor manera, tenemos que entender que es un duelo que no todos los
                        papás están dispuestos a pasar.</p>

                        <p><strong>Ser paciente y consciente:</strong> El trabajo con un peque con autismo requiere tiempo y 
                        esfuerzo. Ten en consideración que con las niñas es un poco más complejo realizar 
                        una evaluación por la alta carga social que se les da desde bebés y por lo que 
                        tienden a hacer masking con más facilidad. Así mismo, es necesario entender que 
                        todos somos diferentes, considera gustos, intereses y características en general de los
                        peques antes de realizar un juicio.</p>

                        <h3>¿Qué hacer en caso de crisis?</h3>

                        <div class="reading-note">
                        <p><strong>Antes</strong></p>
                        <ul>
                            <li>Prever las señales a través de conocer a nuestro peque, sabiendo qué estímulos 
                            le gustan y cuáles le disgustan. Intenta evitar situaciones estresantes que puedan 
                            llevarlo a una crisis. Siempre porta su identificación de discapacidad (CRENAPED)</li>
                            <li>Busca maneras de que se comunique antes de que suceda una crisis</li>
                            <li>Cambiar constantemente de actividad, el aburrimiento es motivo para una crisis</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <p><strong>Durante</strong></p>
                        <ul>
                            <li>Mantener la calma nosotras mismas, si nosotros estamos tranquilos se lo
                            transmitiremos a los peques</li>
                            <li>Busca concentrarlo en un solo estímulo que tú consideres que le guste o que se 
                            seguro para él/ella.</li>
                            <li><strong>BAJO NINGUN CONCEPTO, NI A NIÑOS NEUROTIPICOS NI NEURODIVERGENTES 
                            NUNCA SE LES PEGA O EJERCE ALGUNA FORMA DE MALTRARO PARA
                            “CALMARLOS”.</strong></li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <p><strong>Después</strong></p>
                        <ul>
                            <li>Conforta a tu peque, no solo con palabras, sino también con estímulos que al 
                            peque sabes que le gusta.</li>
                            <li>Si te lastimo o a ellos mismos se lastimaron, es hora de curar heridas.</li>
                            <li>No se 
                            recomienda hablar con hablar a profundidad de lo sucedido, ya que lo 
                            peques no lo ven como producto de un berrinche, sino resultado de algún tipo 
                            de sobreestimulación que no fue su culpa. Simplemente, no entenderán lo que 
                            quieres decirles, sí hablen de lo sucedido, pero no ahonden en ello.</li>
                            <li>Permite que mantenga sus objetos de seguridad hasta que él/ella lo 
                            requiera.</li>
                        </ul>
                        </div>

                        <h3>Referencias</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Artigas. Pallarés, J. (2012).</span><span>Historia del autismo. Revista de Neurología, 55 (Suppl. 2), 
                    S3-S10.
                    https://www.researchgate.net/publication/362169790_Historia_del_autismo_Pers 
                    pectiva_historica_del_trastorno_del_espectro_del_autismo</span></div>

                        <div class="rt-row"><span>Jaramillo P. Sampedro M. (2012).</span><span>Perspectiva histórica del trastorno del espectro
                    del autismo. Acta neurológica colombiana (2), 91-97. Vista de Perspectiva
                    histórica del trastorno del espectro del autismo | Acta Neurológica Colombiana.</span></div>

                        <div class="rt-row"><span>Landringan, P.J. (2010).</span><span>What causes autism? Exploring the enviromental
                    contribution. Current Opinion in Pediatric, 22(2), 219-
                    225. https://journals.lww.com/copediatrics/abstract/2010/04000/what_causes_a
                    utism exploring_the_environmental.17.aspx</span></div>

                        <div class="rt-row"><span>Rotheram-Fuller, E., & MacMuller, L. (2011).</span><span>Cognitive-behavioral therapy
                    for children with autism spectrum disorders. Psychology In The Schools, 48 (3), 263-
                    271. https://www.researchgate.net/publication/230004043_Cognitivebehavioral_t her 
                    apy_for_children_with_autism_spectrum_disorders</span></div>

                        <div class="rt-row"><span>Virués J. Julio, F. Pastor-Barriuso, R. (2013)</span><span>Efficacy of TEACCH-based interventions for
                    children with autism spectrum disorder: A meta-analysis. Journal of Austism and
                    Developmental Disorders. Clinical Psychology Review (9) 940- 953 
                    https://www.sciencedirect.com/science/article/pii/S0272735813000937?via%3Dih ub</span></div>
                        </div>
                    `
                },

                {
                    id: 65,
                    titulo: "🩹✨ Primeros auxilios con calma: lo básico para actuar rápido y cuidar a tu peque con seguridad",
                    resumen: "Cuando pasa algo, tu calma puede salvar el momento. Esta guía te ayuda a actuar con claridad: qué hacer, qué NO hacer y cómo responder ante urgencias comunes en peques. Ideal para nannies y familias que quieren estar preparadas sin pánico.",
                    imagen: "assets/img/articulos/65.jpg",
                    categoria: "Extras",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Primeros Auxilios (básicos)</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">🩷 ¿Qué son los primeros auxilios?</strong>
                        <p style="margin:10px 0 0 0;">Son un conjunto de actuaciones y técnicas que permiten la atención inmediata 
                        de un accidentado, hasta que llegue la asistencia médica profesional, con el fin 
                        de que las lesiones que ha sufrido no empeoren.</p>
                        <p style="margin:12px 0 0 0;">El objetivo de los primeros auxilios es la conservación de la vida evitando
                        complicaciones físicas y psicológicas; ayudando a la recuperación, así como 
                        dando prioridad a los tratamientos.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Los principios básicos de los primeros auxilios son:</h3>
                        </div>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row"><span>1. Mantener la calma para actuar con rapidez</span><span>🧘</span></div>
                        <div class="rt-row"><span>2. Asegurarse de que no existe más peligro</span><span>🛡️</span></div>
                        <div class="rt-row"><span>3. Realizar una evaluación primaria</span><span>🔎</span></div>
                        <div class="rt-row"><span>4. No dar de beber, comer, ni medicar</span><span>🚫</span></div>
                        <div class="rt-row"><span>5. Jamás abandones a la victima</span><span>🤝</span></div>
                        <div class="rt-row"><span>6. No hacer nada de lo que no estés 100% segura</span><span>✅</span></div>
                        <div class="rt-row"><span>7. Dar prioridad a la activación del SMU</span><span>📞</span></div>
                        <div class="rt-row"><span>8. Solicitar consentimiento</span><span>📝</span></div>
                        <div class="rt-row"><span>9. No realizar movimientos innecesarios</span><span>🧊</span></div>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;">Asimismo, es importante considerar que para actuar ante situaciones de 
                        emergencia es necesario seguir la premisa P.A.S. (Proteger, Avisar y Socorrer).</p>
                        </div>

                        <div class="reading-table" style="margin-top:16px;">
                        <div class="rt-row"><span>• Examinar si la situación es segura.</span><span>👀</span></div>
                        <div class="rt-row"><span>• Planificar las acciones de primeros auxilios de acuerdo con la evaluación
                        anterior.</span><span>🧠</span></div>
                        <div class="rt-row"><span>• Actuar prestando los primeros auxilios.</span><span>🩹</span></div>
                        </div>

                        <div class="reading-note" style="background:#F1F5F9; border-left-color: var(--pink-main);">
                        <strong style="display:block;">¿Sabes cuál es la diferencia entre una emergencia y una urgencia?</strong>
                        <p style="margin:12px 0 0 0;">• Una emergencia implica que deben tomarse acciones y decisiones 
                        médicas de manera inmediata, ya que son situaciones en las que está 
                        puesta en juego la vida de la víctima.</p>
                        <p style="margin:12px 0 0 0;">• Una urgencia implica un caso que requiere asistencia médica en el corto 
                        plazo, pero no está en riesgo la vida o de que la situación empeore.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:26px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">Durante nuestros servicios las urgencias más comunes a las que nos podemos 
                        enfrentar son las siguientes:</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;"><strong>• Heridas y lesiones</strong><br>
                        Son la pérdida del tejido, presentando inestabilidad hemodinámica y se dividen 
                        en dos: penetrantes y no penetrantes.</p>

                        <p style="margin:12px 0 0 0;">El tratamiento inicial en una herida no penetrante es realizar asepsia y antisepsia 
                        en la herida (agua a temperatura ambiente y jabón neutro) y limpiar con un 
                        apósito o gasa estéril de arriba hacia abajo, de abajo hacia arriba o bien del 
                        centro hacia afuera en forma circular.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <p style="margin:0;"><strong>• Hemorragias nasales</strong><br>
                        Las hemorragias nasales, conocidas como epistaxis, son comunes y ocurren
                        cuando los pequeños vasos sanguíneos de la nariz se rompen, lo que provoca 
                        sangrado.</p>

                        <p style="margin:12px 0 0 0;"><strong>¿Qué se debe hacer?</strong></p>
                        <ul style="margin:10px 0 0 18px;">
                            <li>Apretar las fosas nasales</li>
                            <li>Colocar una gasa debajo de la nariz</li>
                            <li>Inclinar la cabeza hacía adelante</li>
                            <li>Esperar y volver a revisar</li>
                        </ul>

                        <p style="margin:12px 0 0 0;">Si la hemorragia continua después de 20 min. es necesario acudir con un 
                        profesional.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;"><strong>• Fracturas</strong><br>
                        Son la perdida de la continuidad del tejido óseo, que puede presentar 
                        inestabilidad hemodinámica o no y se caracterizan por:</p>

                        <ul style="margin:10px 0 0 18px;">
                            <li>Dolor intenso y localizado</li>
                            <li>Deformidad</li>
                            <li>Crepitación (crujido, sonido por el roce de los fragmentos de hueso 
                            roto)</li>
                            <li>Edema</li>
                            <li>Rubor</li>
                            <li>Aumento de la temperatura</li>
                        </ul>

                        <p style="margin:12px 0 0 0;">Existen dos tipos de fracturas la cerrada y abierta, la primera se caracteriza por 
                        que la piel no pierde su continuidad y la segunda es donde el hueso está expuesto 
                        funcionalmente o de manera macroscópica. Y el tratamiento de estos se lleva a 
                        cabo a través de la inmovilización, lo cual puede disminuir el dolor.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FFF7ED;">
                        <p style="margin:0;"><strong>• Deshidratación</strong><br>
                        La deshidratación se origina por la excesiva pérdida de agua y electrólitos, al 
                        presentarse debemos dejar al peque en reposo en un ambiente tranquilo, 
                        administrando electrolitos, es importante revisar constantemente los signos vitales, 
                        y, en caso de que el malestar continúe será necesario llevar al peque al médico.</p>

                        <p style="margin:12px 0 0 0;"><strong>¿Cómo podemos detectar cuando una persona está deshidratada?</strong></p>
                        <ul style="margin:10px 0 0 18px;">
                            <li>Labios secos</li>
                            <li>Adormecimiento</li>
                            <li>Calambres</li>
                            <li>Sed</li>
                            <li>Piel seca y arrugada</li>
                        </ul>

                        <p style="margin:12px 0 0 0;">Para prevenir la deshidratación es importante beber abundantes líquidos al estar 
                        realizando actividades intensas o al pasar tiempos prolongados expuestos al sol.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;"><strong>• Quemaduras</strong><br>
                        Las quemaduras son lesión de la piel o de otros tejidos corporales, causada por el 
                        calor o debido a la radiación, radioactividad, electricidad, fricción o contacto 
                        con químicos.</p>

                        <p style="margin:12px 0 0 0;">Existen tres tipos de quemaduras: superficiales (primer grado), de espesor parcial
                        (segundo grado) y de espesor completo (tercer grado). El tratamiento que se les 
                        debe dar a cualquier tipo de quemaduras es las siguiente:</p>

                        <ul style="margin:10px 0 0 18px;">
                            <li>El tratamiento inicial para una quemadura de primer grado es irrigar 
                            durante 10 minutos agua a temperatura ambiente.</li>
                            <li>En cuanto a las quemaduras de segundo grado, hay que cubrir con 
                            apósitos húmedo la quemadura, para prevenir la contaminación y el flujo 
                            constante de aire, lo que ayudará a aliviar el dolor.</li>
                            <li>Y, una quemadura de tercer grado se tiene que cubrir con una sábana 
                            seca y limpia.</li>
                        </ul>

                        <p style="margin:12px 0 0 0;">Por otro lado, es importante mencionar que se debe retirar ropa y joyería, ya que 
                        estos guardan calor, asimismo, no hay que colocar ungüentos ni pomadas, ni
                        reventar de forma intencional las ampollas.</p>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <p style="margin:0;"><strong>• Alergias</strong><br>
                        Según la OMS (2015), la alergia es una reacción exagerada del organismo al 
                        tomar contacto con sustancias que provienen del exterior. Dependiendo de la 
                        fuente serán la reacción o síntomas presentes</p>

                        <p style="margin:12px 0 0 0;"><strong>¿Qué origina a las alergias?</strong><br>
                        Las alergias pueden ser de tipo leve, pasajera o crónica y se pueden originar por 
                        respirar, ingerir o estar en contacto con: polvo, polen, mariscos, huevo, pelaje de 
                        animales etc.</p>

                        <p style="margin:12px 0 0 0;"><strong>¿Qué se debe hacer?</strong></p>
                        <ul style="margin:10px 0 0 18px;">
                            <li>Verificar signos vitales</li>
                            <li>No administrar medicamentos sin la indicación previa</li>
                            <li>Identificar la fuente de alergia y alejar a la persona de la misma.</li>
                            <li>Si la reacción alérgica es severa se observará: piel fría y húmeda, color 
                            pálido, latidos de corazón débiles o rápidos, dificultad para respirar y 
                            pérdida de conocimiento, por ello es importante notificar a la familia y 
                            antes de que ocurran estos síntomas acudir al hospital.</li>
                        </ul>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;"><strong>• Fiebre</strong><br>
                        La fiebre es un síntoma, más no una enfermedad. Asimismo, la temperatura se 
                        puede clasificar de la siguiente manera: normal de 36.5 - 37.5 °C, febrícula (fiebre 
                        moderada) cuando la temperatura sube de 37.5 °C a 37.9 °C, si la temperatura 
                        es de 38°C a 39.5°C es fiebre y fiebre alta cuando la temperatura va de los 39.5°C
                        en adelante.</p>

                        <p style="margin:12px 0 0 0;"><strong>¿Como tomar la temperatura?</strong></p>
                        <ul style="margin:10px 0 0 18px;">
                            <li>Con un termómetro de mercurio, esperar por 5 minutos</li>
                            <li>El termómetro se debe colocar en las partes internas de las axilas o ingles</li>
                        </ul>

                        <p style="margin:12px 0 0 0;"><strong>¿Qué se debe hacer?</strong></p>
                        <ul style="margin:10px 0 0 18px;">
                            <li>Quitar ropa (dejarlo en pañalero) o colocar ropa ligera</li>
                            <li>Dar un baño con agua tibia</li>
                            <li>Mantener la hidratación</li>
                            <li>Jamás automedicar</li>
                        </ul>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FFF7ED;">
                        <p style="margin:0;"><strong>• Picadura de abeja o avispa</strong><br>
                        Ante una picadura de abeja o avispa se debe revisar signos vitales y alejar a las 
                        personas que también puedan verse afectadas. Lo siguiente que se debe hacer 
                        es:</p>

                        <ul style="margin:10px 0 0 18px;">
                            <li>Identificar el área afectada.</li>
                            <li>No presionar el saco venoso que está pegado al aguijón.</li>
                            <li>Retirar el aguijón con mucho cuidado y en sentido contrario de como 
                            entró. Una vez extraído el aguijón es importante evitar exprimir la zona de 
                            la lesión, ya que se puede inocular más veneno.</li>
                            <li>Lavar el área con agua y jabón.</li>
                            <li>Aplicar comprensas de agua fría en caso de hinchazón.</li>
                            <li>Evitar que la persona se rasque la lesión.</li>
                        </ul>

                        <p style="margin:12px 0 0 0;"><strong>¿Cómo puedo detectar una reacción alérgica?</strong><br>
                        Labios morados, dificultad para respirar y perdida del conocimiento, en caso de
                        detectar algunas de las reacciones es necesario llevarlo a atención médica.</p>

                        <p style="margin:12px 0 0 0;">Estas son algunas situaciones a las que te puedes enfrentar en tus servicios, sin 
                        embargo, es importante que complementes esta información con la 
                        capacitación de primeros auxilios.</p>
                        </div>

                        <h3 style="margin-top:26px;">Bibliografía</h3>
                        <p>Estrada, L. (2017). Manual básico de primeros auxilios UIPC CUCS. Unidad Interna 
                        de Protección Civil y Centro Universitario de Ciencias de la Salud (1) 8-55 
                        https://dspace.itsjapon.edu.ec/jspui/bitstream/123456789/361/1/manual_
                        primeros_auxilios_2017.pdf</p>

                        <p>Pardo, G. (2015). Manejo y evaluación de la epistaxis en pediatría. Acta de 
                        Otorrinolaringología & Cirugía de Cabeza y Cuello. (1) 58-63 
                        https://www.revista.acorl.org.co/index.php/acorl/article/view/17/8</p>

                    </div>
                    `
                },

                {
                    id: 66,
                    titulo: "🫧 Respirar para calmar: juegos sencillos que transforman un berrinche en un abrazo de paz",
                    resumen: "Cuando la emoción se desborda, el cuerpo necesita una salida segura. Estas técnicas divertidas de respiración ayudan a los peques a relajarse, concentrarse y sentirse protegidos, mientras usted crea un momento de conexión y calma que se queda para toda la vida.",
                    imagen: "assets/img/articulos/66.jpg",
                    categoria: "Socioemocional",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/36.jpg')"></div>

                        <div class="reading-view" style="padding-top: 0;">
                        <div class="reading-note" style="margin-top:0;">
                            <strong>Respirar para calmar:<br>técnicas divertidas paras los peques</strong>
                        </div>

                        <p>En el día a día, los peques experimentan muchas emociones: alegría, frustración, enojo, miedo o cansancio. A veces, esas emociones son tan intensas que no saben cómo expresarlas o regularlas, aquí es donde las técnicas de respiración se vuelven grandes aliadas para nosotras, ya que ayudan a los peques a relajarse, concentrarse y sentirse seguros.</p>

                        <h3>¿Por qué es importante enseñarles a respirar conscientemente?</h3>

                        <p>La respiración está directamente relacionada con el sistema nervioso, cuando los peques aprenden a respirar despacio y profundo, su cuerpo recibe el mensaje de que puede calmarse, esto reduce el ritmo cardíaco, mejora la concentración y facilita la autorregulación emocional.</p>

                        <p>Algunos de estos beneficios son que, nos ayudan a manejar la ansiedad o el enojo, promueven la calma antes de dormir o de una actividad nueva, favorecen la atención y el enfoque en el juego o el aprendizaje y fomentan la conexión entre adulto y peque, creando momentos tranquilos y afectivos.</p>

                        <div class="reading-note">
                            <strong>Ejemplos de ejercicios de respiración:</strong>
                        </div>

                        <div class="reading-table" style="padding:18px;">
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">1.</span>
                            <span style="flex:1;">Respiración de la flor y la vela: imagina que tiene una flor en una mano y una vela en la otra, inhalen por la nariz “oliendo la flor” y exhalen por la boca “soplando la vela”.</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">2.</span>
                            <span style="flex:1;">Respiración del dragón: esta actividad es ideal para liberar tensión o enojo, tomen aire profundo por la nariz y luego exhalen fuerte por la boca “echando fuego como un dragón”. Pueden hacerlo frente a un espejo para que observen cómo se infla su pancita al respirar y que el espejo se empaña por el fuego.</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">3.</span>
                            <span style="flex:1;">Respiración de la mariposa: coloquen sus manos en los hombros, cruzando los brazos como si fueran alas, mientras respiran, puede mover lentamente los brazos arriba y abajo, imaginando que la mariposa vuela con calma.</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">4.</span>
                            <span style="flex:1;">Respiración del globo: coloquen una mano en la panza y otra en el pecho, inhalen por la nariz inflando el “globo” del estómago, y exhalen por la boca desinflándolo, esto favorecerá la respiración diafragmática y la conciencia corporal.</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">5.</span>
                            <span style="flex:1;">Respiración con burbujas: soplen burbujas para que salgan grandes y bonitas, tendrán que exhalar suave y largo, es una manera muy visual y divertida de enseñar la respiración controlada.</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">6.</span>
                            <span style="flex:1;">Respiración del diente de león: imaginen que sostienen un diente de león, inhalen profundamente por la nariz y soplen despacio para “volar las semillas”.</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">7.</span>
                            <span style="flex:1;">Respiración con peluche: recuéstense boca arriba y coloquen un peluche en su pancita y observen cómo el peluche sube y baja con cada respiración.</span>
                            </div>

                            <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">8.</span>
                            <span style="flex:1;">Respiración del Arcoíris: esta técnica combina la respiración consciente con la imaginación y el movimiento, muestren una imagen de un arcoíris o imagínenlo, comenzarán trazando con el dedo, la primera franja del arcoíris (por ejemplo, la roja) mientras inhalen profundo por la nariz, al bajar o pasar a la siguiente franja, exhalen suavemente por la boca, repitan el proceso con cada color (rojo, naranja, amarillo, verde, azul, morado). Puedes decirle que imagine que cada color le trae algo bonito: calma, alegría, amor o energía.</span>
                            </div>
                        </div>

                        <div class="reading-note">
                            <strong>Consejos para aplicar estas técnicas:</strong>
                            <ul style="margin:12px 0 0 18px;">
                            <li>Practiquen en momentos tranquilos, no solo cuando el peque esté alterado.</li>
                            <li>Usa un tono de voz suave y acompáñalo en el proceso con calma.</li>
                            <li>No obligues, mejor invita al peque a jugar y experimentar.</li>
                            </ul>
                        </div>

                        <p>Enseñar a los peques a respirar conscientemente es mucho más que una técnica: es una herramienta de vida, a través del juego y la conexión emocional, los peques aprenden a identificar lo que sienten y encontrar calma por sí mismos. Sabemos que, con constancia, ellos mismos aprenderán a usar la respiración cuando lo necesiten.</p>

                        <h3 style="margin-top:28px;">Bibliografía</h3>

                        <div class="reading-table" style="padding:18px;">
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>Fundación CADAH. (2021). Técnicas de respiración para niños. Recuperado de https://www.fundacioncadah.org//web/articulo/tdah-juegos-de-respiracion￾para-el-control-de-la-ansiedad-en-ninos.html</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>UNICEF. (2020). Ejercicios para promover la calma y la regulación emocional en la infancia. Manual de manejo de emociones. Recuperado de https://www.unicef.org/mexico/media/8591/file/UNICEF_Manual-manejo-de￾emociones.pdf.pdf</span>
                            </div>
                            <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span>López, C. (2022). Mindfulness y respiración en la infancia: beneficios para la autorregulación emocional. Revista Española de Psicopedagogía, 29(2), 45–58. https://www.npunto.es/content/src/pdf-articulo/61f11ca62c5ccart4.pdf</span>
                            </div>
                        </div>
                        </div>
                    `
                },

                {
                    id: 67,
                    titulo: "💗 Noviazgo en la adolescencia: cómo abrir conversaciones que protegen, guían y fortalecen su corazón",
                    resumen: "Hablar de amor con adolescentes no es incómodo: es una oportunidad para sembrar respeto, límites y autoestima. Este recurso te ayuda a comprender sus etapas, detectar señales de una relación sana o tóxica y acompañarlos con diálogo, empatía y seguridad.",
                    imagen: "assets/img/articulos/67.jpg",
                    categoria: "Extras",
                    contenido: `
                        <h1>Relaciones de noviazgo en adolescentes</h1>

                        <p>Las relaciones de noviazgo forman parte importante del desarrollo de los individuos <br>
                        ya que, es fundamental para ellos socializar con sus pares, establecer vínculos y <br>
                        generar una especie de aceptación por parte de los mismos. Incluso pueden preferir <br>
                        pasar más tiempo con sus amigos que con sus familiares, pues están experimentando  <br>
                        cambios físicos, emocionales y hormonales y pueden pensar que sólo las personas <br>
                        de su edad los comprenden.</p>

                        <p>Como se mencionó en un inicio, las relaciones de pareja empiezan a adquirir  <br>
                        mayor importancia,pero… ¿Qué es una relación de noviazgo o enamoramiento?</p>

                        <p>Es una relación afectiva que se da entre dos personas que se gustan y atraen  <br>
                        mutuamente, representa una oportunidad para conocerse y es también una etapa <br>
                        de experimentación en la cualse comparten formas de pensar, afinidades e intereses  <br>
                        en común.</p>

                        <p>El noviazgo en la adolescencia se divide en cinco etapas:</p>
                        <ul>
                        <li><b>Atracción:</b> En esta fase, los adolescentes comienzan a notar el interés en  <br>
                        alguien y pueden experimentar sensaciones intensas como "mariposas en <br>
                        el estómago" o nerviosismo.</li>

                        <li><b>Incertidumbre:</b> Esta etapa se caracteriza por la exploración y el "flechazo", <br>
                        donde los adolescentes buscan confirmarsussentimientos y el interés mutuo.</li>

                        <li><b>Exclusividad:</b> Una vez que se confirman los sentimientos y el interés mutuo, <br>
                        los adolescentes pueden experimentar la necesidad de estar juntos y <br>
                        compartir tiempo, lo que puede llevar a una mayor exclusividad en la relación.</li>

                        <li><b>Intimidad:</b> En esta fase, se profundiza la relación y se comparten  <br>
                        pensamientos, sentimientos y sueños, creando un vínculo emocional más  <br>
                        fuerte.</li>

                        <li><b>Compromiso:</b> Si la relación se consolida, los adolescentes pueden  <br>
                        desarrollar un compromiso mutuo, que puede ser la base para relaciones <br>
                        más duraderas en el futuro.</li>
                        </ul>

                        <h3>¿Por qué es importante hablar de noviazgo con los adolescentes?</h3>
                        <p>Durante la adolescencia, los adolescentes comienzan a explorar su identidad, sus  <br>
                        emociones y sus relaciones de pareja. Estas primeras experiencias amorosas  <br>
                        pueden marcar su manera de relacionarse en el futuro. Por ello, es necesario  <br>
                        brindarles información clara, apoyo emocional y un espacio seguro para hablar de <br>
                        sus dudas, miedos y expectativas.</p>

                        <p>Al abordar este tema, podemos ayudar a:</p>
                        <ul>
                        <li>Desarrollar relaciones basadas en el respeto y la confianza.</li>
                        <li>Reconocer lo que significa una relación sana (y una tóxica).</li>
                        <li>Aprender a establecer límites personales.</li>
                        <li>Fortalecer su autoestima y capacidad para tomar decisiones conscientes.</li>
                        </ul>

                        <h3>¿Cuándo es el momento adecuado?</h3>
                        <p>No existe una edad exacta para iniciar esta conversación, pero es importante no  <br>
                        esperar a que ya estén en una relación para hablar del tema. Se puede  <br>
                        empezar desde la preadolescencia (alrededor de los 10-12 años) con  <br>
                        conceptos básicos sobre el amor, el respeto y la amistad. A medida que  <br>
                        crecen, se puede profundizar en temas como la intimidad, el consentimiento  <br>
                        y la sexualidad.</p>

                        <p>Algunas claves que puedes incluir para tener una conversación efectiva son:</p>

                        <div class="reading-note">
                        <strong>1. Escoge un buen momento</strong>
                        <ul>
                            <li>Busca un momento tranquilo, sin prisas ni interrupciones. Aprovecha  <br>
                            situaciones cotidianas, como una película, una serie o una conversación sobre <br>
                            amistades, para introducir el tema de forma natural.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <strong>2. Escucha antes de opinar</strong>
                        <ul>
                            <li>Haz preguntas abiertas que inviten al diálogo:</li>
                            <li>“¿Qué piensas del noviazgo a tu edad?”</li>
                            <li>“¿Has sentido algo especial por alguien?”</li>
                            <li>“¿Qué ves en lasrelaciones de tus amigos o en lasredes sociales?”</li>
                            <li>Evita interrumpir o juzgar sus respuestas. El objetivo es que se sientan  <br>
                            escuchados y comprendidos.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <strong>3. Habla de relaciones sanas</strong>
                        <ul>
                            <li>Explícale cómo debe ser una relación basada en el respeto, la confianza, la <br>
                            libertad y la comunicación. También es importante hablar de los signos de <br>
                            relaciones tóxicas: celos excesivos, control, manipulación o violencia  <br>
                            emocional.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <strong>4. No minimices sus emociones</strong>
                        <ul>
                            <li>Evita frases como “eso no es amor” o “eres muy chico para esas cosas”. Para <br>
                            ellos, lo que sienten es real y profundo. Validar sus emociones hará que su  <br>
                            confianza se fortalezca y les permitirá aprender desde su experiencia.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <strong>5. Educa sobre sexualidad y consentimiento</strong>
                        <ul>
                            <li>Brinda información clara y adecuada a su edad sobre los cambios físicos, el  <br>
                            consentimiento, la presión social, el cuidado del cuerpo.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <strong>6. Comparte tus valores sin imponer</strong>
                        <ul>
                            <li>Está bien compartir lo que tú crees sobre el amor, las relaciones y el  <br>
                            compromiso, pero evita imponer tus ideas como únicas o absolutas. Fomenta <br>
                            el pensamiento crítico y el diálogo respetuoso.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <strong>7. Sé un modelo positivo</strong>
                        <ul>
                            <li>Los adolescentes aprenden más de lo que ven que de lo que escuchan. Sé un <br>
                            ejemplo en tus propias relaciones, mostrando cómo se construye una relación  <br>
                            basada en el respeto, la empatía y la comunicación.</li>
                        </ul>
                        </div>

                        <div class="reading-note">
                        <strong>8. No olvides mantenerte en constante comunicación con los papás:</strong>
                        <ul>
                            <li>Recuerda que antes de hablar de cualquier tema delicado con los  <br>
                            adolescentes, necesitas conocer la perspectiva de los papás y con ello  <br>
                            adquirir su consentimiento para poder hablar de algunos temas, por lo que, es  <br>
                            importante que te den su consentimiento, de esa manera podrán trabajar en  <br>
                            conjunto y bajo la misma línea de comunicación.</li>
                        </ul>
                        </div>

                        <h3>Referencias</h3>
                        <p>Martínez, E. (2018). Manual del taller: Noviazgo entre adolescentes. Instituto  <br>
                        Aguascalentense de las mujeres. (1) 2-56 <br>
                        http://cedoc.inmujeres.gob.mx/insp/taller_noviazgo.pdf</p>

                        <p>Brache, Y. (2023). Noviazgo en la adolescencia y juventud. Centro de Investigación <br>
                        para la Acción Femenina, Asamblea de Cooperación Por la Paz. (1) 1-36 <br>
                        https://resi.org.do/guia-de-noviazgo-en-la-adolescencia-y- juventud-para￾padres-madres-tutores/</p>

                        <p>Gutiérrez, X. (2023) El noviazgo. Fondo de Población de las Naciones Unidas  <br>
                        Nicaragua (1) 2-16 https://nicaragua.unfpa.org/sites/default/files/pub￾pdf/El%20Noviazgo_1.pdf</p>
                    `
                },

                {
                    id: 68,
                    titulo: "🌟 La “R” llega con juego y paciencia: una guía amorosa para ayudarle a tu peque a pronunciarla",
                    resumen: "Si a tu peque le cuesta decir la “r” o la “rr”, no significa atraso: significa proceso. Aquí encontrarás por qué pasa, cuándo conviene intervenir y actividades divertidas (respiración, lengua, juegos y trabalenguas) para acompañarlo con calma y constancia, sin presionarlo.",
                    imagen: "assets/img/articulos/68.jpg",
                    categoria: "Cognitivo",
                    contenido: `
                        <h3>Pronunciación de la letra R</h3>

                        <p>El proceso de aprendizaje del habla ocurre de manera natural en los primeros 5 años de la infancia, gracias a la habilidad innata para imitar los sonidos del entorno. Sin embargo, para algunos peques, ciertos fonemas resultan complicados a la hora de pronunciarlos, siendo la “r” y la “rr” los más difíciles de aprender. A la dificultad para pronunciar dichos fonemas se le conoce como rotacismo.</p>

                        <p>Que pronunciar correctamente la letra R lleve más tiempo no significa que tengamos que dejar pasar un periodo prolongado de tiempo hasta la integración de este fonema en la pronunciación.</p>

                        <p><strong>¿Qué significa eso?</strong> Según el Instituto Superior de Estudios Psicológicos (ISEAP), la R es una de las letras más difíciles de adquirir y, por ello, una de las últimas en aprender a pronunciarla. En este sentido, el ISEAP señala que no pronunciarla correctamente no se considera algo preocupante hasta que el peque tiene los 5- 6 años.</p>

                        <p>Cuando ocurre, se debe corregir lo antes posible, ya que cuanto más tarde se empiece la rehabilitación, más tiempo se necesitará para la misma.</p>

                        <h3>¿Qué provoca el rotacismo?</h3>
                        <p>Lo primero que debes saber es que, si tu peque presenta rotacismo, no se debe a ningún tipo de retraso o algún problema psicológico. El rotacismo puede ser provocado por:</p>

                        <ul>
                        <li>Porque el peque imita el sonido de la “r” y “rr”, tal y como lo escucha de los adultos a su alrededor.</li>
                        <li>El hábito de introducir el dedo en su boca</li>
                        <li>Una mala colocación de su lengua al momento de pronunciar el fonema</li>
                        <li>El uso del chupón podría ser una de las causas de este retraso en el aprendizaje de la pronunciación de la R, ya que mantiene la lengua dentro de la boca y el peque se acostumbra a no sacarla nunca.</li>
                        </ul>

                        <ul>
                        <li>Sin embargo, una serie de ejercicios de respiración y movimientos de la lengua pueden hacer que el peque aprenda a pronunciar correctamente esta letra, así como las demás.</li>
                        <li>Otra posible causa es la alimentación. Si acostumbramos a nuestro peque a alimentos muy blandos, como papillas, purés y líquidos, no habrá buen movimiento y ejercitación de la lengua, mejillas y respiración, por lo que, producirlo, le costará un poco más y, en algunos casos, le cansará pronunciarla.</li>
                        <li>Sin embargo, el rotacismo es un hecho bastante común en los peques y no debes preocuparte, porque este hecho puede ser pasajero. Con el tiempo y la práctica, los peques van adquiriendo destreza y corrigen este defecto y afinan su oído.</li>
                        <li>Impedimentos anatómicos, como acortamiento del frenillo sublingual o paladar hendido.</li>
                        </ul>

                        <div class="reading-note">
                        <p>Lo importante es identificar el origen del problema y corregir la situación antes de que se vuelva un hábito difícil de erradicar.</p>
                        </div>

                        <h3>Ejercicios para mejorar la pronunciación de la “r” o “rr”:</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Respiración profunda</strong></span></div>
                        </div>
                        <p>Los ejercicios de respiración profunda ayudarán al peque a tener conciencia de los músculos faciales y a relajarlos. Además, también concentrará su atención en la lengua y podrá relajarla y tomar conciencia de su función.</p>

                        <p>Una opción es hacer carreras de bolitas de papel o gusanitos de papel, utilizando un popote para soplarlos dentro de la pista que se haya organizado.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Entrenar la lengua</strong></span></div>
                        </div>
                        <p>Es necesario que entre la lengua cada día. Para ello puede hacer varios ejercicios, por ejemplo, cuando come deberá mover la lengua para masticar los alimentos, puede mover la lengua hacia adelante y hacia atrás para tocar todos los dientes y las muelas, puede tocar con la lengua todas las partes de dentro de la boca…</p>

                        <p>estos ejercicios son necesario que los haga todos los días para que la lengua vaya adquiriendo fuerza.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Trabalenguas</strong></span></div>
                        </div>
                        <p>Existen muchos trabalenguas enfocados en trabajar con los sonidos de la “r” y “rr”. El más conocido es: “Erre con erre guitarra, erre con erre barril, ruedan que ruedan las ruedas, lasruedas del ferrocarril”.</p>

                        <p>Puedes enunciar este trabalenguas frente a tu peque, exagerando la pronunciación, para que vea cómo mueves tu lengua contra el paladar. Puedes decir el trabalenguas al ritmo de rap o una canción de rock; incluso pueden poner juntos una coreografía que ilustre los objetos a los que hace referencia.</p>

                        <p>El movimiento esimportante porque de esa manera tu peque olvidará que están “trabajando” sobre la pronunciación.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Las carreritas</strong></span></div>
                        </div>
                        <p>Un juego que le encantará es el de las “carreritas” con diferentes vehículos de motor de juguete, como coches de carreras, motocicletas, trailers, etc.</p>

                        <p>Durante el juego, tú y tu peque pueden imitar lossonidos de cada vehículo (“rrrrrruuuummmm”) haciendo variaciones según el tamaño y tipo de cada uno.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>A colorear se ha dicho</strong></span></div>
                        </div>
                        <p>Deja que tu peque se divierta con planillas de dibujos con objetos y profesiones cuyos nombres contengan las letras “r” o “rr”. Cuando termine de dar color a la planilla, pregúntale cómo se llama cada elemento recién coloreado.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Jugar "Basta"</strong></span></div>
                        </div>
                        <p>Aunque es muy probable que a los 5 o 6 años, tu peque aún no sepa escribir, puedes jugar “Basta” con él: pídele que te diga palabras que contengan la “r” o la “rr” en alguna de sus sílabas, mientrastú las escribes.</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Ejercicios de soplo</strong></span></div>
                        </div>
                        <p>Soplar ayuda a fortalecer el paladar blando. Entre los ejercicios que se pueden hacer (y pueden ser divertidos para los peques) están lossiguientes:</p>

                        <ul>
                        <li>Soplar por un popote. Podemos poner pintura en un papel y hacer que el peque sople y forme una figura</li>
                        <li>Inflar un globo, soplar velas, etc.</li>
                        <li>Hacer burbujas</li>
                        </ul>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Movimientos bucofaciales</strong></span></div>
                        </div>
                        <p>Estos movimientos ayudan a ejercitar y a trabajar todas las partes que intervienen en la articulación de los fonemas (boca, labios, lengua, etc.). El objetivo es desarrollar la motricidad fina que afecta a los órganos de la articulación, de forma que los peques puedan adquirir la agilidad y coordinación necesarias para pronunciar correctamente.</p>

                        <p>El siguiente video podría ayudarte a saber qué tipos de ejercicios puedes hacer para trabajar este punto: https://youtu.be/Ak8FI_i6cQQ</p>

                        <div class="reading-table">
                        <div class="rt-row"><span><strong>Observarse en el espejo</strong></span></div>
                        </div>
                        <p>Algo bastante útil es observarse a sí mismo y los órganos de la articulación mientras realizan los ejercicios. Así verán todos los movimientos, relajarán los músculos de la cara y se sentirás más en control de lo que ven.</p>

                        <h3>Referencias:</h3>
                        <p>Hogarmania. (18 de noviembre de 2021). Mi hijo no pronuncia la R, ¿cuándo debo llevarle al logopeda? Hogarmania. Disponible en: https://www.hogarmania.com/salud/maternidad/ninos/mi-hijo-no-pronuncia- la-r￾cuando llevarle-al-logopeda.html</p>

                        <p>Rogers Hall. (s/f). Cómo ayudar a tu hijo a pronunciar la "r" y la "rr" a través del juego. Rogers Hall. Disponible en: https://blog.rogers.edu.mx/c%C3%B3mo- ayudar-a-tu￾hijo-a-pronunciar-la-r y-la-rr-a-trav%C3%A9s￾del juego#:~:text=El%20m%C3%A1s%20conocido%20es%3A,tu%20lengua%20contr a%20el %20paladar.</p>

                        <p>Roldán, J.(octubre 2020). Consejos para ayudar a los peques a pronunciar la R y la S. Etapa Infantil. Disponible en: https://www.etapainfantil.com/consejos- ayudar￾ninos-pronunciar-r-s</p>

                        <p>Romo, E. (20 de junio de 2022). Cómo enseñar a decir la R. Mi bebé y yo. Disponible en: https://mibebeyyo.mx/bebes/salud-bienestar/estimulacion/como- ensenar-a￾decir-r</p>

                        <p>Tomatis Ecuador. (21 de octubre de 2021). 6 ejercicios para pronunciar l letra R. Tomatis.edu. Disponible en: https://tomatisecuador.com/pronunciar-letra-r/ Yo me cuido. (2021). ¿Problemas para pronunciar la "r"? Ejercicios para corregir el rotacismo. Yo me cuido, porque prevenir es mejor. Disponible en: https://yomecuido.com.pe/salud-y nutricion/problemas-para-pronunciar-la-r￾ejercicios-para-corregir-el-rotacismo</p>
                    `
                },

                {
                    id: 69,
                    titulo: "🧡🤱 Tummy Time: pequeños minutos, grandes fortalezas (y un vínculo que crece contigo)",
                    resumen: "El tiempo boca abajo no es solo un ejercicio: es un momento para fortalecer su cuerpecito, estimular su desarrollo y crear conexión afectiva. Con estas estrategias y actividades, el tummy time puede volverse más fácil, más divertido y lleno de avances que se sienten en cada semana.",
                    imagen: "assets/img/articulos/69.jpg",
                    categoria: "Motriz",
                    contenido: `
                        <div class="reading-note" style="background:linear-gradient(135deg, rgba(232,76,154,.08), rgba(59,182,196,.10));border-left:5px solid var(--pink-main);">
                        <h1 style="font-size:32px;line-height:1.15;margin:4px 0 10px 0;">Tummy Time:</h1>
                        <h3 style="margin:0 0 6px 0;">Fortaleciendo a los peques desde sus primeros meses</h3>
                        </div>

                        <p>El tummy time o tiempo boca abajo, es uno de los ejercicios más importantes 
                        durante los primeros meses de vida, más que una postura, es un momento lleno de 
                        oportunidades para fortalecer su cuerpo, estimular su desarrollo y crear conexión 
                        afectiva con quien lo acompaña; al inicio puede ser complejo, pero con 
                        estrategias adecuadas y actividades divertidas, los peques aprenden a disfrutarlo 
                        y aprovechar todos sus beneficios.</p>

                        <h3>¿En qué consiste el tummy time?</h3>

                        <p>El tummy time consiste en colocar al peque boca abajo mientras está despierto y 
                        bajo supervisión, los especialistas recomiendan comenzar desde los primeros días 
                        de vida, empezando con segundos y aumentando gradualmente.</p>

                        <p>Algunos de los beneficios del tummy time son:</p>

                        <div class="reading-note">
                        <ul>
                            <li>Fortalecer cuello, hombros, espalda y brazos.</li>
                            <li>Prevenir la plagiocefalia (aplanamiento de la cabecita).</li>
                            <li>Favorecer los hitos motores: girar, sentarse, gatear.</li>
                            <li>Estimular sentidos, equilibrio y coordinación.</li>
                            <li>Promover interacción y vínculo afectivo con el cuidador.</li>
                        </ul>
                        </div>

                        <h3>¿Cuánto tiempo debe hacer tummy time?</h3>

                        <p>El tiempo recomendable para realizar tummy time es:</p>

                        <div class="reading-table">
                        <div class="rt-row"><span>Recién nacidos (0–2 meses):</span> <span>1–3 minutos por vez, varias veces al día.</span></div>
                        <div class="rt-row"><span>3–4 meses:</span> <span>10–20 minutos al día, divididos en sesiones.</span></div>
                        <div class="rt-row"><span>5–6 meses:</span> <span>hasta 30 minutos o más, siempre dividido en momentos cortos.</span></div>
                        </div>

                        <h3>Estrategias para comenzar con el tummy time:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Empezar suave y progresivo</li>
                            <li>Si al peque no le gusta estar boca abajo, iniciar sobre el pecho del cuidador o 
                            sobre las piernas puede ser más cómodo.</li>
                            <li>Acompañar con la voz y el rostro</li>
                            <li>Tu cara es el mejor estímulo, hablarle, cantarle o sonreírle lo motiva a levantar 
                            cabecita.</li>
                            <li>Colocar una toalla bajo su pecho y axilas le da mayor soporte y lo ayuda a 
                            sentirse seguro.</li>
                            <li>Hacerlo tras una siesta, no después de comer (con el peque descansado y 
                            activo será más fácil, y se evitan molestias).</li>
                            <li>Mantenerlo siempre supervisado, nunca debe hacerse si el peque está 
                            somnoliento o sin vigilancia.</li>
                        </ul>
                        </div>

                        <h3>Ejercicios para realizar tummy time:</h3>

                        <div class="reading-note">
                        <ol style="margin:0;padding-left:18px;">
                            <li><strong>Caritas y sonidos graciosos</strong><br>
                            Colócate frente a él y haz expresiones, ruidos o canciones cortitas. esto lo 
                            motivara a levantar cabeza.</li>

                            <li><strong>Alcanzar objetos</strong><br>
                            Pon juguetes coloridos, pelotas sensoriales o un espejo frente a él para fomentar 
                            curiosidad y movimiento.</li>

                            <li><strong>“Paseo” sobre tus piernas</strong><br>
                            Acuesta al peque boca abajo sobre tus muslos, con la cabeza hacia tus rodillas
                            puedes mover suavemente tus piernas para activar su equilibrio.</li>

                            <li><strong>Sobre una manta mágica</strong><br>
                            Usa una manta con texturas, colores o dibujos llamativos, esto estimula la visión y 
                            el tacto.</li>

                            <li><strong>Cuentos boca abajo</strong><br>
                            Muestra libros de contrastes altos (blanco, negro, rojo) mientras él está recargado 
                            sobre los antebrazos.</li>

                            <li><strong>“Atrapar el peluche”</strong><br>
                            Coloca el peluche favorito un poco fuera de su alcance para que lo mire, intente
                            empujar o extender el brazo.</li>
                        </ol>
                        </div>

                        <h3>Señales de que el tummy time va bien:</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Levanta la cabecita por segundos.</li>
                            <li>Apoya los antebrazos.</li>
                            <li>Se mantiene boca bajo por más tiempo cada semana.</li>
                            <li>Muestra curiosidad y busca objetos con la mirada.</li>
                        </ul>
                        </div>

                        <p>Si llora inmediatamente, es normal, su cuerpo apenas está fortaleciendo termina la 
                        sesión, carga al peque un momento y vuelve a intentarlo más suave y corto.</p>

                        <h3>¿Cuándo consultar a un profesional?</h3>

                        <div class="reading-note">
                        <ul>
                            <li>Cuando no tolera nada de tummy time después de varias semanas.</li>
                            <li>Tiene movimientos rígidos o muy flojos.</li>
                            <li>No levanta la cabeza después de los 3 meses.</li>
                            <li>Siempre gira hacia un solo lado.</li>
                        </ul>
                        </div>

                        <p>Un pediatra o fisioterapeuta infantil puede evaluar y orientar ejercicios específicos.</p>

                        <h3>REFERENCIAS</h3>

                        <div class="reading-table">
                        <div class="rt-row"><span>Valle y Rodríguez, (s. f.).</span> <span>Guía práctica para la estimulación temprana de 0 a 6 años. Scribd. https://es.scribd.com/document/464216082/Estimulacio-n-temprana-0-a-6-an-os-pdf</span></div>
                        <div class="rt-row"><span>Domingo López, et al. (2025).</span> <span>Beneficios del tummy time en el desarrollo infantil temprano: revisión de la literatura científica. Revista Electrónica de PortalesMédicos.com, Vol.10 (01), 21. Recuperado de https://www.revista￾portalesmedicos.com/revista-medica/beneficios-del-tummy-time-en-el-desarrollo￾infantil-temprano-revision-de-la-literatura-cientifica/#google_vignette</span></div>
                        <div class="rt-row"><span>Panolini. (2023,).</span> <span>Tummy Time: Todo lo que necesitas saber. Recuperado dehttps://www.panolini.com/blog/primer-anio/cuidados-desarrollo estimulacion/tummy-time-todo-lo-que-necesitas-saber/</span></div>
                        <div class="rt-row"><span>Nemours. (2019).</span> <span>Posición boca abajo (Tummy Time). KidsHealth. Recuperado de https://kidshealth.org/es/parents/tummy-time.html</span></div>
                        </div>
                    `
                },

                {
                    id: 70,
                    titulo: "🌸 Hablarlo con calma y sin miedo: guía para acompañar la sexualidad en tu peque con respeto",
                    resumen: "Cuando un peque explora su cuerpo, no está ‘haciendo algo malo’: está aprendiendo. Esta guía te enseña cómo reaccionar con naturalidad, poner límites sin vergüenza y crear un espacio seguro para que tu peque crezca con autoestima, confianza y tranquilidad.",
                    imagen: "assets/img/articulos/70.jpg",
                    categoria: "Extras",
                    contenido: `
                    <div class="reading-view">

                        <h1 style="font-size:32px; line-height:1.2;">Sexualidad en mi peque, ¿cómo lo manejo?</h1>

                        <div class="reading-note" style="background: linear-gradient(135deg, rgba(232,76,154,.10), rgba(59,182,196,.10)); border-left-color: var(--pink-main);">
                        <strong style="display:block; font-size:16px;">💛 Natural, gradual y sin tabú</strong>
                        <p style="margin:10px 0 0 0;">Es natural que a medida que el niño o niña comience a explorar y a descubrir su
                        cuerpo, desarrolle cierta preferencia por estimularse aquellas zonas que le
                        resultan más agradables. Este tipo de comportamientos comienza desde los 
                        primeros meses de vida y se acentúa con la retirada del pañal, momento en que 
                        los genitales (que son las zonas del cuerpo más sensibles a esta estimulación) 
                        quedan más accesibles. Esto es algo perfectamente normal y habitual.</p>

                        <p style="margin:12px 0 0 0;">Además, debemos entender que, en este momento, el niño pequeño no tiene 
                        ninguna conciencia de lo que está haciendo, no le dota del mismo contenido o 
                        significado que un adulto y no sabe valorar cuándo es una conducta socialmente 
                        apropiada y cuándo no: esto es lo que debe ir aprendiendo de manera gradual y 
                        adaptada a su edad</p>
                        </div>

                        <p>Podríamospensar que la tendencia de los niñosa tocarse oestimularse noes más que
                        un “accidente”: descubren que algo les gusta y lo repiten, sin que ello tenga
                        mayor utilidad ni importancia. Sin embargo, estos primeros contactos de los niños
                        con su propio cuerpo son importantes y la manera en que lleven a cabo este
                        aprendizaje puede influir en su salud sexual y en su autoestima
                        en la edad adulta.</p>

                        <p>Por lo tanto, permitir que los niños y adolescentes tengan espacios y tiempos 
                        apropiados para conocerse puede ser algo muy saludable para su desarrollo. Igual o
                        más importante será que los adultos, muestren una actitud natural y disponible
                        hacia estos temas, respondiendo con claridad y sencillez a las preguntas que les
                        planteen sus hijos. Mostrarnos cómodos y relajados (aunque firmes en nuestras 
                        pautas) facilitará que los niños confíen en nosotros y que nos consulten cuando
                        tengan problemas o necesiten información.</p>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">¿Cómo podemos reaccionar cuando los vemos tocarse?</h3>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;">Debemos actuar como con otros comportamientos normales del desarrollo infantil. 
                        Igual que les enseñamos a permanecer despiertos durante las clases, a comer en
                        cantidades moderadas y evitar alimentos poco sanos, a vaciar sus esfínteres en el
                        sanitario, a esperar su turno de palabra antes de hablar… nuestro objetivo será que 
                        aprendan a conocer y a explorarsu cuerpo en los momentos y lugares apropiados, de
                        forma sana y segura y sin que interfiera con otras actividadesimportantes de su
                        vida.</p>

                        <p style="margin:12px 0 0 0;">Por ello, cuando observamos que se están estimulando en situaciones o
                        momentos inadecuados, podemos seguir estas recomendaciones:</p>
                        </div>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row"><span><strong>Mantén la calma:</strong> Recuerda que se trata de un comportamiento infantil normal y 
                        que el niño está aprendiendo. Reacciona con la misma normalidad que si
                        estuvieras explicándole que debe dormir en su cama o hacer la tarea en la mesa.
                        Verte reaccionar de manera tranquila y natural evitará que elsexo se convierta en un
                        tema tabú y facilitará que en el futuro acuda a ti con dudas o problemas, en
                        lugar de a otrasfuentes menosfiables.</span><span>🧘</span></div>

                        <div class="rt-row"><span><strong>No regañes ni castigues:</strong> Es más eficaz buscar otras alternativas como, por ejemplo, 
                        distraer a los niños más pequeños con otra actividad o explicarles que, aunque su 
                        comportamiento es normal, no son las circunstancias adecuadas. Regañar a los 
                        niños contribuye a que asocien su cuerpo y su sexualidad con emociones 
                        negativas, como la culpa y la vergüenza, lo cual puede tener efectos indeseados 
                        en su vida.</span><span>🚫</span></div>

                        <div class="rt-row"><span><strong>No prestes mucha atención:</strong> A los niños les gusta que les hagan caso y que se rían 
                        de lo que hacen. Y la forma de conseguir esto a veces consiste en escandalizar o 
                        enfadar a los adultos. Si tu peque observa que tocándose consigue más atención, 
                        es posible que lo haga cada vez con más frecuencia, que es justo lo contrario de 
                        lo que pretendías.</span><span>🫶</span></div>

                        <div class="rt-row"><span><strong>Distrae su atención con una actividad que implique el uso de las manos:</strong> El cerebro 
                        tiene una serie de recursos atencionales, y si presentamos una actividad atractiva 
                        que capte su atención se centrarán en ella y dejarán lo otro. Y si esa actividad 
                        implica el uso de las manos, mejor, porque no podrán hacer dos cosas al mismo 
                        tiempo, un ejemplo de actividades con las manos puede ser: creación de figuras 
                        con plastilina, uso de pelotitas antiestrés (puedes hacer uso con ayuda de globos 
                        y semillas o bolitas de gel), sentir diversas texturas (usar un tapete de texturas), 
                        dibujar, jugar con la pelota, bailar, etc.</span><span>✋</span></div>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--pink-main); background:#FDF2F8;">
                        <p style="margin:0;"><strong>Un truco:</strong> seguro que has visto cómo cuando dos hermanos o amigos están jugando 
                        por separado, pero en una misma sala y de pronto uno toma algo, rápidamente el 
                        otro quiere lo mismo y se convierte en el objeto más fascinante y valioso del mundo. 
                        Pues esto lo podemos "usar" para distraerle: si nos ponemos con algo que parezca 
                        que nos fascina, vendrá a curiosear.</p>
                        </div>

                        <div class="reading-table" style="margin-top:16px; padding:18px;">
                        <div class="rt-row"><span><strong>No te refieras a su cuerpo o al sexo como algo sucio:</strong> Cuando le expliques por qué 
                        su comportamiento no es adecuado, evita referirte sus genitales como algo sucio. 
                        Explica por qué ese comportamiento no es adecuado aquí y ahora, pero evita 
                        referirte a él como algo malo en general o hacerle sentir vergüenza o culpa por lo 
                        que está haciendo.</span><span>🧼</span></div>

                        <div class="rt-row"><span><strong>Habla sobre sexo con ellos desdetemprano:</strong> Evidentemente de manera progresiva 
                        y adaptada a su edad y el nivel de comprensión, dando solo aquella información 
                        que te vaya pidiendo o que vaya siendo oportuna en cada momento.</span><span>💬</span></div>

                        <div class="rt-row"><span><strong>No esperes a que sea mayor para hablar de sexo:</strong> Comienza nombrando sus 
                        genitales igual que le enseñas a nombrar otras partes de su cuerpo, responde sus 
                        dudas acerca de las cosas que ve u oye en el colegio, etc. Enséñale a tu peque 
                        los nombres correctos de todas las partes del cuerpo, como genitales, pene, 
                        vagina, pechos, nalgas y partes íntimas. Ponerles sobrenombres a las partes del 
                        cuerpo puededar la ideadeque hayalgomalo conelnombrecorrecto. Averigüe
                        por qué tupeque usa un nombre especialpara la parte del cuerpo,pero enséñele
                        también el nombre correcto. Además, explíquele a tu peque qué partes son íntimas
                        (las partes cubiertas por un traje de baño).</span><span>🧠</span></div>

                        <div class="rt-row"><span><strong>Comunícate con sus papás o cuidadores principales:</strong> Cuando estos
                        comportamientos se den en público o en situaciones en que tú no estás presente,
                        otras personas intentarán participar y reaccionar de la forma que creen mejor, 
                        aunque no siempre sea la más adecuada. Por lo tanto, es importante que te 
                        comuniques con sus demás cuidadores para que puedan estar al pendiente de
                        esta conducta y todos actúen de la misma manera.</span><span>🤝</span></div>
                        </div>

                        <div class="reading-note" style="border-left-color: var(--blue-main);">
                        <p style="margin:0;">Asimismo, essúper importante que antes de tomar cualquier medida lo platiques con
                        sus papás con la finalidad de que estén enterados, pero sobre todo que te den la 
                        autorización para hacerlo.</p>
                        </div>

                        <div class="comunidad-section-header" style="margin-top:24px;">
                        <h3 class="comunidad-section-title" style="font-size:22px;">¿Cuándo se convierte en un problema?</h3>
                        </div>

                        <p>Todos los comportamientos (p. ej., comer, dormir, hablar…), por normales y 
                        habituales que sean, pueden acabar convirtiéndose en un problema en ciertas 
                        circunstancias. La clave para saber si un comportamiento es un problema es
                        analizar las consecuencias que está teniendo o las que podría tener si se mantiene.
                        Aquí tienes algunas claves:</p>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row"><span><strong>Irritación o dolor en la zona:</strong> En ocasiones, debido a la frecuencia con la que el 
                        peque se estimula o al material con el que lo hace (p. ej., se frota contra algún 
                        material duro o áspero) puede generarse irritación o hacerse daño. Cuando esto
                        suceda, es bueno explicarle lo que está pasando y cómo se está lastimando y
                        evitar que lo siga haciendo de la misma manera o con tanta frecuencia. No está 
                        de más una visita al pediatra para comprobar que no se ha hecho ningún daño
                        importante.</span><span>🩹</span></div>

                        <div class="rt-row"><span><strong>Infección de orina:</strong> Debido a la proximidad física entre elsistema urinario femenino y
                        sus genitales, cuando se produce una infección de orina en las niñas a veces esto
                        provoca que se toquen o estimulen con más frecuencia. Si sospechas que este
                        puede ser el caso, menciónaselo a la familia y si es posible, acudan con el
                        pediatra.</span><span>🚑</span></div>

                        <div class="rt-row"><span><strong>Busca llamar la atención:</strong> Si el niño observa que estimulándose en público consigue la
                        atención de los adultos (aunque sea en modo de enfado), es posible que recurra a
                        ella siempre que desee llamar la atención. En estos casos, seguir las pautas que se
                        comentaban anteriormente puede ser lo más indicado. Por otro lado, asegúrate de
                        prestarle atención cuando esté haciendo otras cosas que sí son adecuadas (p. ej., 
                        jugando, leyendo, etc.)</span><span>👀</span></div>

                        <div class="rt-row"><span><strong>La masturbación es constante:</strong> Si tu peque se masturba o estimula varias veces al día 
                        cada día, dedicándole un tiempo o una atención excesivos, puede ser 
                        aconsejable tomar medidas para reducir los tiempos que dedica a tocarse. En 
                        algunos casos esto puede deberse a que el niño está excesivamente tenso y utiliza la
                        masturbación como un medio para relajarse, por lo que puede ser útil enseñarle otras
                        vías para conseguir este fin (p. ej., masajes corporales, respiración abdominal, deporte, 
                        hablar con él sobre aquello que le preocupa). Otras veces puede deberse a que el
                        niño se aburre y tiene pocas fuentes de estimulación, por lo que recurre a lo más 
                        accesible y conocido. Si crees que este es el caso, intenta proponerle y favorecer
                        otras actividades atractivas para él y prémiale por animarse a hacer cosas nuevas.
                        Otra de las causas por las cuales tu peque se toca pueden ser lassiguientes: picor en
                        sus genitales (quizá lo más recomendable es asistir con un doctor) o porque se está 
                        haciendo del baño.</span><span>🧩</span></div>

                        <div class="rt-row"><span><strong>Deja de lado otras actividades importantes:</strong> Siobservamosquelamasturbación está
                        empezando a jugar un papel demasiado central en la vida de nuestro peque y que
                        se aísla de otros niños, no juega, no dedica suficiente tiempoalosdeberes escolares,
                        no se relaciona con otros miembros de la familia, etc. también se trata de un
                        problema que podremos abordar siguiendo las pautas anteriores.</span><span>⏳</span></div>
                        </div>

                        <h3 style="margin-top:26px;">Referencias:</h3>
                        <p>American Academy of Pediatrics. (2022). El comportamiento sexual en los niños 
                        pequeños: ¿qué es normal y qué no lo es? Healthy children.org. Disponible
                        en: https://www.healthychildren.org/Spanish/ages￾stages/preschool/Paginas/sexual-behaviors young-children.aspx</p>

                        <p>Fernández, I. (2022). Mi hijo/a se toca los genitales, ¿cómo debo reaccionar? 
                        Libertia Psicología. Disponible en: 
                        https://www.libertiapsicologia.com/blog/2017/8/15/mi-hijo-se-toca-los genitales</p>

                        <p>Jiménez, M. (28 de octubre de 2019). Mi hijo pequeño se toca los genitales en 
                        público y en casa: claves para gestionarlo. Bebés y más. Disponible
                        en: https://www.bebesymas.com/desarrollo/mi-hijo-pequeno-se-toca-genitales￾publico-casa claves-para-gestionarlo</p>

                    </div>
                    `
                },

                {
                    id: 71,
                    titulo: "🎮 Diversión con cuidado: cómo proteger a los peques en videojuegos en línea (sin quitarles su mundo)",
                    resumen: "Los videojuegos pueden ser creatividad, amistad y juego… pero también esconden riesgos que muchos adultos no ven. Esta guía le ayuda a identificar peligros reales y a poner límites y hábitos que cuidan a su peque sin romper la diversión.",
                    imagen: "assets/img/articulos/71.jpg",
                    categoria: "Extras",
                    contenido: `
                        <div class="reading-hero" style="background-image:url('assets/img/articulos/37.jpg')"></div>

                        <div class="reading-note" style="margin-top:0;">
                        <strong>Videojuegos en línea y peques: <br>diversión con riesgos ocultos</strong>
                        </div>

                        <p>En la actualidad, muchos peques pasan gran parte de su tiempo libre en videojuegos en línea. Plataformas como Roblox, Minecraft, Fortnite, Among Us o Free Fire se han convertido en parte de su mundo de diversión, creatividad y socialización. Sin embargo, detrás de estos entornos virtuales también existen riesgos significativos que los padres y cuidadores pasan desapercibidos y que sin duda son de gran importancia para proteger a los peques. Por ello es fundamental que reconozcan estos peligros y aprendan a cómo prevenirlos para garantizar el bienestar de estos.</p>

                        <h3 style="margin-top:28px;">Principales peligros en los juegos en línea</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">1.</span>
                            <span style="flex:1;">Contacto con desconocidos: Muchos juegos permiten la interacción con otros jugadores a través de chats o modos multijugador, lo que puede exponer a los peques a adultos con intenciones inapropiadas.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">2.</span>
                            <span style="flex:1;">Contenido inapropiado: Algunos juegos creados por usuarios pueden contener violencia, lenguaje ofensivo, temas sexuales o temáticas no aptas para menores, como videojuegos que contienen una temática de terror fuerte o que incitan al uso de armas.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">3.</span>
                            <span style="flex:1;">Explotación sexual y grooming: Casos documentados han mostrado cómo adultos pueden manipular a los peques ganándose su confianza para obtener imágenes íntimas o incluso llevarlos a situaciones de abuso.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">4.</span>
                            <span style="flex:1;">Compras dentro del juego: El uso de monedas virtuales puede llevar a gastos excesivos si no se supervisa adecuadamente.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">5.</span>
                            <span style="flex:1;">Adicción y sobreuso: Al ser juegos diseñados para ser llamativos y atractivos, pueden jugar durante horas sin parar y al pasar tiempo excesivo frente a la pantalla puede afectar el sueño, el rendimiento escolar y las relaciones sociales.</span>
                        </div>
                        </div>

                        <h3 style="margin-top:28px;">Recomendaciones para padres y/o cuidadores</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">1.</span>
                            <span style="flex:1;">Establecer reglas claras: Definir horarios y establecer límites para el tiempo de juego, así como no permitir pantallas a la hora de dormir.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">2.</span>
                            <span style="flex:1;">Supervisar la actividad: Revisar regularmente con quién están jugando y qué están haciendo en línea, así como la lista de amigos y conversaciones.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">3.</span>
                            <span style="flex:1;">Utilizar controles parentales: Aprovecha las herramientas que ofrecen las plataformas para restringir contenido y comunicaciones, como activar las restricciones de chat y usar contraseñas para comprar dentro del juego.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">4.</span>
                            <span style="flex:1;">Fomentar la comunicación abierta: Animar al peque a hablar sobre sus experiencias en línea y recordarle que nunca deben dar datos personales. Así como, crear confianza para que te cuenten si hay alguna situación incómoda que puedan encontrar.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span style="font-weight:900; color: var(--pink-main);">5.</span>
                            <span style="flex:1;">Educar sobre la seguridad digital: Enseñarles sobre los riesgos en línea y la importancia de proteger su información personal y su integridad.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span style="font-weight:900; color: var(--pink-main);">6.</span>
                            <span style="flex:1;">Ubicación de las pantallas: Si juegan en consola o computadora, es mejor situarla en un espacio común, como la sala. Evitar que jueguen completamente solos.</span>
                        </div>
                        </div>

                        <p>La implementación de actividades fuera de la pantalla hará que la integración y comunicación con los peques mejore, lo que reducirá el tiempo en línea y con ello fortalecerá el vínculo afectivo y su aprendizaje.</p>

                        <h3 style="margin-top:28px;">Actividades alternativas para reducir el tiempo en pantallas</h3>

                        <div class="reading-note">
                        <ul style="margin:0 0 0 18px;">
                            <li><strong>Juegos de mesa en familia:</strong> estimulan la paciencia, el pensamiento lógico y la convivencia.</li>
                            <li><strong>Manualidades o arte:</strong> pintar, hacer collage, arcilla o experimentos caseros sencillos.</li>
                            <li><strong>Actividades al aire libre:</strong> caminatas, andar en bici, juegos tradicionales como la cuerda o el avioncito.</li>
                            <li><strong>Lectura compartida:</strong> leer juntos cuentos o novelas cortas, incluso dramatizar personajes.</li>
                            <li><strong>Cocinar en familia:</strong> preparar galletas, pizzas o recetas sencillas para que los peques participen.</li>
                            <li><strong>Rincón de música y baile:</strong> inventar coreografías o explorar instrumentos musicales básicos.</li>
                            <li><strong>Proyectos temáticos:</strong> armar una maqueta del mar, crear un minihuerto o cuidar una planta juntos.</li>
                        </ul>
                        </div>

                        <p>Los videojuegos en línea pueden ser una herramienta para que los peques, se diviertan y compartan con amigos, siempre y cuando exista supervisión y acompañamiento por parte de los padres. Estar informados sobre los riesgos y mantener una comunicación abierta con los peques, es la mejor herramienta para protegerlos.</p>

                        <p>Con límites claros, controles adecuados y mucho diálogo, los videojuegos pueden convertirse en un espacio seguro donde la creatividad florezca sin poner en riesgo su bienestar. Sin embargo, es importante recordar que el exceso de tiempo frente a la pantalla puede afectar su desarrollo físico, emocional y social.</p>

                        <h3 style="margin-top:28px;">Bibliografía</h3>

                        <div class="reading-table" style="padding:18px;">
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>Christakis, A (2016) 2016). Media and Young Minds. Pediatrics. American Academy of Pediatrics (5) 239-246</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>https://watermark02.silverchair.com/peds_20162591.pdf</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>Murray, C (2025) Louisiana sues Roblox as controversy over child safety and banning vigilante users grows. Forbes.</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px;">
                            <span>https://www.forbes.com/sites/conormurray/2025/08/15/louisiana-sues￾roblox-as-controversy-over-child-safety-and-banning-vigilante-users-grows/</span>
                        </div>
                        <div class="rt-row" style="align-items:flex-start; gap:12px; border-bottom:none;">
                            <span>Morales, R. (2021) Estudio exploratorio para el desarrollo de un videojuego que coadyuve a la prevención del grooming. REVISTA PARAGUAYA DE EDUCACIÓN A DISTANCIA (REPED), 2(2), 20– 35.https://revistascientificas.una.py/index.php/REPED/article/view/2247/2108</span>
                        </div>
                        </div>
                    `
                },


            ],

            noticiasCliente: [
                {
                    id: 1,
                    titulo: "¡Regreso a Clases con Descuentos!",
                    content: "Aprovecha nuestras promociones en servicios educativos durante todo el mes de agosto.",
                    tipo: "Promo",
                    fecha: "Hoy"
                },
                {
                    id: 2,
                    titulo: "Taller para Padres: Lactancia Materna",
                    content: "Próximo sábado 22 de marzo. Charla informativa gratuita.",
                    tipo: "Evento",
                    fecha: "Pronto"
                }
            ],
            noticiasNinera: [
                {
                    id: 1,
                    titulo: "Capacitación: Control de esfínteres",
                    content: "Acompaña a tu peque en este importante paso en su desarrollo",
                    tipo: "Capacitación",
                    fecha: "17 de Febrero 2026"
                },

            ]
        }
    },

    /**
     * Inicializa el módulo la primera vez que se accede a la vista de Comunidad.
     */
    init: async function () {
        if (this.estado.inicializado) return;

        console.log("Comunidad.init(): Inicializando módulo de comunidad premium...");
        this.inyectarEstilos();
        this.estado.inicializado = true;
        this.render();
    },

    /**
     * Inyecta estilos específicos para la pestaña de Comunidad
     * siguiendo la estética premium de Nannys y Peques.
     */
    inyectarEstilos: function () {
        if (document.getElementById('comunidad-styles')) return;

        const style = document.createElement('style');
        style.id = 'comunidad-styles';
        style.innerHTML = `
            .comunidad-header {
                text-align: center;
                padding: 40px 20px;
                background: linear-gradient(135deg, rgba(232, 76, 154, 0.1), rgba(59, 182, 196, 0.1));
                border-radius: var(--radius-xl);
                margin-bottom: 30px;
            }
            .comunidad-title {
                font-size: 32px;
                margin-bottom: 10px;
            }
            .comunidad-subtitle {
                color: var(--text-muted);
                font-size: 16px;
                max-width: 600px;
                margin: 0 auto;
            }

            .comunidad-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }

            .comunidad-card {
                background: var(--glass-bg);
                backdrop-filter: var(--glass-blur);
                border: var(--glass-border);
                border-radius: var(--radius-lg);
                overflow: hidden;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                display: flex;
                flex-direction: column;
            }

            .comunidad-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 15px 35px rgba(232, 76, 154, 0.15);
            }

            .comunidad-card-img {
                width: 100%;
                height: 180px;
                object-fit: cover;
            }

            .comunidad-card-content {
                padding: 20px;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }

            .comunidad-card-tag {
                display: inline-block;
                padding: 4px 12px;
                background: var(--pink-light);
                color: var(--pink-main);
                border-radius: var(--radius-full);
                font-size: 12px;
                font-weight: 800;
                margin-bottom: 12px;
                width: fit-content;
            }

            .comunidad-card-title {
                font-size: 18px;
                color: var(--text-main);
                margin-bottom: 10px;
                font-family: 'DM Serif Display', serif;
            }

            .comunidad-card-excerpt {
                font-size: 14px;
                color: var(--text-muted);
                line-height: 1.6;
                margin-bottom: 20px;
            }

            .comunidad-card-btn {
                margin-top: auto;
                color: var(--pink-main);
                font-weight: 700;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .comunidad-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-left: 5px solid var(--blue-main);
                padding-left: 15px;
            }

            .comunidad-section-title {
                margin: 0;
                font-size: 24px;
                color: var(--text-main);
            }

            .comunidad-news-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 40px;
            }

            .news-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: white;
                border-radius: var(--radius-lg);
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }

            .news-badge {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                flex-shrink: 0;
            }

            .news-badge.promo { background: #FEF3C7; color: #D97706; }
            .news-badge.evento { background: #DBEAFE; color: #2563EB; }
            .news-badge.capacitación, .news-badge.capacitacion { background: #DCFCE7; color: #166534; }

            /* Estilos de Lectura Premium */
            .reading-view {
                background: white; min-height: 100vh; padding: 20px;
                color: #334155; line-height: 1.8; font-family: 'Nunito Sans', sans-serif;
                padding-bottom: 100px;
                position: relative;
            }
            .reading-view .btn-volver {
                position: absolute;
                top: 20px;
                left: 20px;
                z-index: 100;
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(232, 76, 154, 0.3);
                color: var(--pink-main);
                padding: 10px 20px;
                border-radius: var(--radius-full);
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .btn-volver:hover {
                background: white;
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(232, 76, 154, 0.2);
            }
            .reading-view h1, .reading-view h3 {
                font-family: 'DM Serif Display', serif; color: var(--text-main);
                margin-top: 30px; margin-bottom: 15px;
            }
            .reading-view p { margin-bottom: 20px; font-size: 16px; }
            .reading-hero {
                margin: -20px -20px 30px -20px; height: 250px;
                background-size: cover; background-position: center;
                position: relative; overflow: hidden;
            }
            .reading-hero::after {
                content: ''; position: absolute; bottom: 0; left: 0; right: 0;
                height: 100px; background: linear-gradient(transparent, white);
            }
            .reading-note {
                background: #F1F5F9; border-left: 5px solid var(--blue-main);
                padding: 20px; border-radius: 0 15px 15px 0; margin: 30px 0;
            }
            .reading-table {
                background: #F8FAFC; border-radius: 20px; padding: 15px;
                margin: 20px 0; border: 1px solid #E2E8F0;
            }
            .rt-row {
                display: flex; justify-content: space-between;
                padding: 10px 0; border-bottom: 1px solid #E2E8F0;
            }
            .rt-row:last-child { border: none; }
            .rt-row span:first-child { font-weight: 800; color: var(--pink-main); }

            .news-info h4 {
                margin: 0 0 4px 0;
                font-size: 16px;
                color: var(--text-main);
            }

            .news-info p {
                margin: 0;
                font-size: 13px;
                color: var(--text-muted);
            }

            .discounts-banner {
                background: linear-gradient(135deg, var(--pink-main), var(--blue-main));
                border-radius: var(--radius-xl);
                padding: 30px;
                color: white;
                text-align: center;
                margin-bottom: 40px;
                position: relative;
                overflow: hidden;
            }

            .discounts-content { position: relative; z-index: 1; }
            .discounts-banner h3 { color: white; margin-bottom: 10px; }
            .discounts-banner p { opacity: 0.9; margin-bottom: 20px; }

            .btn-white {
                background: white;
                color: var(--pink-main);
                padding: 10px 25px;
                border-radius: var(--radius-full);
                font-weight: 700;
                display: inline-block;
            }

            @media (max-width: 600px) {
                .comunidad-title { font-size: 26px; }
                .comunidad-grid { grid-template-columns: 1fr; }
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
                cursor: pointer;
            }
            .btn-category.active {
                background: var(--blue-main); color: white;
            }
        `;
        document.head.appendChild(style);
    },

    seleccionarCategoria: function (cat) {
        // Si se hace clic en la misma categoría, quitamos el filtro
        this.estado.categoriaSeleccionada = (this.estado.categoriaSeleccionada === cat) ? null : cat;
        this.render();
        // Si hay scroll, lo llevamos arriba para ver los resultados
        window.scrollTo({ top: 300, behavior: 'smooth' });
    },

    /**
     * Actualiza o renderiza la vista de comunidad.
     */
    render: function () {
        const container = document.getElementById('vista-comunidad');
        if (!container) return;

        // Determinar qué noticias mostrar según el rol
        // 🛡️ Robustez: Intentar leer de window.SESION, sino de localStorage
        let esCliente = false;
        if (window.SESION) {
            esCliente = !!window.SESION.cliente;
        } else {
            try {
                const s = localStorage.getItem('nyp_sesion');
                if (s) {
                    const parsed = JSON.parse(s);
                    esCliente = !!parsed.cliente;
                }
            } catch (e) {
                console.error("Error leyendo sesión en Comunidad:", e);
            }
        }

        const noticiasMostradas = esCliente ? this.estado.datos.noticiasCliente : this.estado.datos.noticiasNinera;
        const etiquetaNoticias = esCliente ? "Novedades y Promociones" : "Capacitaciones y Novedades";

        // --- LÓGICA DE FILTRADO DE ARTÍCULOS ---
        const todosLosArticulos = this.estado.datos.articulos;

        // Categorías fijas solicitadas por el usuario
        const categorias = ["Cognitivo", "Lenguaje", "Motriz", "Sensorial", "Socioemocional", "Extras"];

        // Filtrar artículos por categoría seleccionada
        const articulosFiltrados = this.estado.categoriaSeleccionada
            ? todosLosArticulos.filter(a => a.categoria === this.estado.categoriaSeleccionada)
            : todosLosArticulos;

        container.innerHTML = `
            <div class="comunidad-header">
                <h2 class="comunidad-title">Nannys y Peques Comunidad</h2>
                <p class="comunidad-subtitle">Un espacio dedicado al aprendizaje, beneficios y las últimas novedades para nuestra gran familia.</p>
            </div>

            <div class="comunidad-section-header">
                <h3 class="comunidad-section-title">${etiquetaNoticias}</h3>
            </div>
            <div class="comunidad-news-list">
                ${noticiasMostradas.map(news => `
                    <div class="news-item">
                        <div class="news-badge ${news.tipo.toLowerCase().replace(/á/g, 'a')}">
                            ${news.tipo === 'Promo' ? '🏷️' : (news.tipo === 'Capacitación' ? '🎓' : '📅')}
                        </div>
                        <div class="news-info">
                            <h4>${news.titulo}</h4>
                            <p>${news.content} • <b>${news.fecha}</b></p>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="discounts-banner">
                <div class="discounts-content">
                    <h3>🎁 Convenios y Descuentos</h3>
                    <p>Accede a beneficios exclusivos con especialistas médicos, tiendas y mucho más al ser parte de Nannys y Peques.</p>
                    <button onclick="irVista('convenios')" class="btn-white">Ver todos los convenios</button>
                </div>
            </div>

            <div class="comunidad-section-header">
                <h3 class="comunidad-section-title">Artículos de Interés</h3>
            </div>

            <!-- BARRA DE CATEGORÍAS -->
            <div class="category-scroll">
                <div class="btn-category ${!this.estado.categoriaSeleccionada ? 'active' : ''}" 
                     onclick="Comunidad.seleccionarCategoria(null)">Todas</div>
                ${categorias.map(cat => `
                    <div class="btn-category ${this.estado.categoriaSeleccionada === cat ? 'active' : ''}" 
                         onclick="Comunidad.seleccionarCategoria('${cat}')">${cat}</div>
                `).join('')}
            </div>

            <div class="comunidad-grid">
                ${articulosFiltrados.map(art => `
                    <div class="comunidad-card">
                        <img src="${art.imagen}" alt="${art.titulo}" class="comunidad-card-img">
                        <div class="comunidad-card-content">
                            <span class="comunidad-card-tag">${art.categoria}</span>
                            <h4 class="comunidad-card-title">${art.titulo}</h4>
                            <p class="comunidad-card-excerpt">${art.resumen}</p>
                            <a href="javascript:void(0)" onclick="Comunidad.abrirArticulo(${art.id})" class="comunidad-card-btn">Leer más ➔</a>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${articulosFiltrados.length === 0 ? `
                <div class="no-data" style="padding: 40px; text-align: center; color: var(--text-muted);">
                    <p>No se encontraron artículos en esta categoría.</p>
                </div>
            ` : ''}
        `;
    },

    abrirArticulo: function (id) {
        const art = this.estado.datos.articulos.find(a => a.id === id);
        if (!art || !art.contenido) {
            alert('Próximamente estaremos preparando este contenido para ti.');
            return;
        }

        // 💾 Guardar posición actual antes de abrir
        this.lastScrollPos = window.scrollY;

        this.renderArticuloCompleto(art);
        irVista('articulo');

        // ✨ Asegurar que el artículo se abra desde arriba
        window.scrollTo({ top: 0, behavior: 'instant' });
    },

    volverALista: function () {
        irVista('comunidad');

        // ⏳ Pequeño delay para asegurar que el DOM de la vista comunidad esté activo
        setTimeout(() => {
            window.scrollTo({
                top: this.lastScrollPos,
                behavior: 'instant'
            });
        }, 50);
    },

    renderArticuloCompleto: function (art) {
        const container = document.getElementById('vista-articulo');
        if (!container) return;

        container.innerHTML = `
            <div class="reading-view">
                <button class="btn-volver" onclick="Comunidad.volverALista()">❮ Volver</button>
                
                <div class="reading-hero" style="background-image: url('${art.imagen}')"></div>
                
                <span class="comunidad-card-tag">${art.categoria}</span>
                <h1 style="font-size: 32px; line-height: 1.2;">${art.titulo}</h1>
                
                <div class="reading-content">
                    ${art.contenido}
                </div>

                <div style="border-top: 1px solid #EEE; margin-top: 40px; padding-top: 20px; text-align: center;">
                    <p style="font-size: 14px; color: var(--text-muted);">
                        Fuente: Recomendaciones AEP / UNICEF / BLW Libro.<br>
                        <b>Nannys y Peques Comunidad</b>
                    </p>
                    <button class="btn-pink" onclick="Comunidad.volverALista()" style="margin-top: 20px;">He terminado de leer</button>
                </div>
            </div>
        `;
    }
};

// Exponer globalmente si es necesario
window.Comunidad = Comunidad;
