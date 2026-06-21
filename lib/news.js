export const articles = [
  {
    slug: 'coleccionismo-intimo',
    date: '14 jun 2026',
    title: 'Por qué el coleccionismo está dejando las ferias masivas y volviendo a lo íntimo',
    excerpt: 'Cada vez más compradores prefieren conocer la historia detrás de una pieza antes que recorrer un pabellón de 400 stands.',
    body: [
      'Durante años, la forma "normal" de comprar arte fue una feria: pabellones enormes, cientos de galerías, miles de obras compitiendo por la misma mirada distraída. Funcionó mientras el objetivo era visibilidad. Pero algo cambió en cómo la gente decide gastar en una pieza.',
      'Hoy, buena parte de los compradores nuevos llega a una obra por una historia, no por un stand. Quieren saber quién la pintó, por qué, qué pasaba en su vida en ese momento. Es la misma lógica que llevó a la gente a preferir el café de especialidad del barrio antes que la cadena: no es solo el producto, es el contexto.',
      'Las plataformas que están creciendo en este momento no son las que muestran más obras, son las que muestran menos, mejor contadas. Una curaduría chica, con pocos artistas a la vez, le da al comprador algo que una feria nunca puede: la sensación de que está viendo algo antes de que se vuelva masivo.',
      'No es nostalgia por lo artesanal. Es, simplemente, que la atención es el recurso más escaso que existe, y las ferias la piden de a 400 obras por vez. Una galería con cuatro artistas por temporada la pide de a una.',
    ],
  },
  {
    slug: 'materiales-arte-contemporaneo',
    date: '02 jun 2026',
    title: 'Cinco materiales que están reapareciendo en el arte contemporáneo',
    excerpt: 'Del pigmento mineral molido a mano al collage de archivo: una mirada a las técnicas que vuelven a ganar terreno.',
    body: [
      'Pigmento mineral molido a mano. Antes de que existiera el tubo de óleo industrial, cada color se preparaba a mano, mezclando aceite con minerales triturados. Un grupo creciente de pintores volvió a esa práctica, no por purismo, sino porque el color resultante tiene una textura que ningún tubo de fábrica reproduce.',
      'Collage de archivo. Recortes de revistas viejas, boletas, cartas: materiales que ya nadie quiere se están convirtiendo en la base de obras que hablan, justamente, de lo que se descarta. Es una técnica barata de producir y cara de imitar, porque cada recorte es irrepetible.',
      'Tinta sobre papel húmedo. La técnica más antigua de todas volvió de la mano de artistas que buscan velocidad: una sesión, una sola tarde, sin retoque posible. El resultado tiene una honestidad que el óleo, con su capacidad de corregirse infinitamente, no puede ofrecer.',
      'Madera recuperada como soporte. En vez de lienzo nuevo, tablas de demolición, cajones viejos, puertas. El soporte ya trae su propia historia antes de que el artista toque el primer pincel.',
      'Cera fría. Mezclada con pigmento, da una textura entre la pintura y la escultura: se puede tallar, raspar, construir en capas. Es lenta, es sucia, y por eso mismo está volviendo a aparecer en estudios que se cansaron de la limpieza del arte digital.',
    ],
  },
  {
    slug: 'puja-minima-artista-nuevo',
    date: '15 may 2026',
    title: 'Cómo se calcula una puja mínima cuando el artista recién empieza',
    excerpt: 'Tamaño, materiales, horas y trayectoria: una guía simple para artistas que están por subastar su primera pieza.',
    body: [
      'La pregunta que más se repite entre artistas nuevos no es "¿cómo vendo?", es "¿cuánto pido?". Y la respuesta corta es: menos de lo que creés, pero con un piso que no sea humillante.',
      'Un cálculo simple para empezar: sumá el costo real de materiales (lienzo, pigmento, marco si lo lleva), multiplicá las horas de trabajo por un valor por hora razonable para tu zona, y agregá un margen del 20-30%. Eso te da un piso técnico, no un precio de mercado.',
      'La trayectoria ajusta ese número, pero no lo define. Una primera pieza no necesita "demostrar" nada con el precio — necesita encontrar comprador. Pedir de más en la primera subasta es la forma más común de no vender nada y desanimarse.',
      'El tamaño importa menos de lo que parece. Una pieza chica con una idea fuerte puede pedir más que una grande sin concepto. Lo que de verdad mueve la puja mínima hacia arriba es la claridad: títulos, materiales y dimensiones bien descritos generan más confianza que el tamaño del lienzo.',
      'Por último: la puja mínima es solo el piso. Si la pieza genera interés real, el mercado —en este caso, quienes pujan durante la temporada— se encarga de subir el precio solo. El trabajo del artista es poner un piso justo, no adivinar el techo.',
    ],
  },
  {
    slug: 'guardar-obra-sin-vender',
    date: '28 abr 2026',
    title: 'Qué hacer con una pieza que no se vendió en su temporada',
    excerpt: 'No vender no significa que la obra esté mal — significa que esta vez no encontró a la persona correcta. Esto es lo que conviene hacer después.',
    body: [
      'Pasa en todas las galerías, no solo en las chicas: una pieza buena no encuentra comprador en su primer intento. La reacción más común es asumir que algo está mal con la obra. Casi nunca es así — más seguido es una cuestión de timing, de quién estaba mirando esa semana, o de que el precio mínimo no encontró a la persona dispuesta a pagarlo todavía.',
      'Lo primero que conviene hacer es no tocar nada por un tiempo. Repintar o "arreglar" una pieza apenas cierra la temporada suele ser una reacción emocional, no una decisión artística. Dejala descansar — literal y figuradamente — antes de decidir si necesita cambios de verdad.',
      'Después, revisá el contexto, no la obra. ¿Estaba bien fotografiada? ¿La descripción explicaba la técnica con claridad? ¿La puja mínima reflejaba el tamaño y el material, o estaba fuera de rango para el resto de la temporada? Casi siempre hay una de estas tres cosas para ajustar antes de tocar el pincel de nuevo.',
      'Si después de ese chequeo sigues convencido de que la pieza vale lo que pediste, no hay problema en volver a postularla en una temporada futura, quizás junto a piezas más nuevas que le den contexto. Una obra rechazada una vez no es una obra rechazada para siempre — es una obra que todavía no tuvo su momento.',
    ],
  },
];

export function getArticleBySlug(slug) {
  return articles.find((a) => a.slug === slug);
}
