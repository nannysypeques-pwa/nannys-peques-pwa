/**
 * Módulo de Comunidad - Nannys y Peques
 * Centro de recursos, descuentos y noticias para familias y nannies.
 */

const Comunidad = {
    // Estado interno del módulo
    lastScrollPos: 0,
    estado: {
        inicializado: false,
        datos: {
            articulos: [
                {
                    id: 1,
                    titulo: "Alimentación complementaria",
                    resumen: "La comida no debe sentirse como batalla. Aprende cómo iniciar la alimentación complementaria cuidando hábitos, seguridad, autorregulación y un ambiente emocional sano.",
                    imagen: "assets/img/articulos/alimentacion.jpg",
                    categoria: "Nutrición",
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
                    titulo: "Límites con amor: Guía para padres",
                    resumen: "Establecer reglas claras es vital para el crecimiento seguro. Te decimos cómo hacerlo con respeto.",
                    imagen: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&q=80&w=400",
                    categoria: "Educación"
                },

                {
                    id: 3,
                    titulo: "¿Cómo fomentar la lectura en peques?",
                    resumen: "Estrategias sencillas y prácticas para que la lectura sea un momento divertido, afectivo y constante en casa.",
                    imagen: "assets/img/articulos/lectura.jpg",
                    categoria: "Educación",
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
                    categoria: "Educación",
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
                    categoria: "Emociones",
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
                    categoria: "Apego",
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
                    categoria: "Vínculo",
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
                    categoria: "Bienestar digital",
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
                    categoria: "Actividades",
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
                    categoria: "Familia",
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
                    categoria: "Morder",
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
                    categoria: "Educación",
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
                    categoria: "Bienestar",
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
                }



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
                    titulo: "Capacitación: RCP Pediátrico",
                    content: "Actualización obligatoria para todas nuestras nannies. Reserva tu lugar.",
                    tipo: "Capacitación",
                    fecha: "Hoy"
                },
                {
                    id: 2,
                    titulo: "Taller para Nannies: Estimulación Temprana",
                    content: "Aprende nuevas dinámicas para el desarrollo psicomotriz de los pequeños.",
                    tipo: "Evento",
                    fecha: "Pronto"
                }
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
            .btn-volver {
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
        `;
        document.head.appendChild(style);
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
            <div class="comunidad-grid">
                ${this.estado.datos.articulos.map(art => `
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
