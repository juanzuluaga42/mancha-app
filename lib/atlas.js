// Atlas del Arte — datos del blog de MANCHA.
// Las imágenes usan Wikimedia Special:FilePath (URL canónica estable).
// Solo se enlazan obras/retratos de dominio público.

export function wiki(filename, width = 700) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

/* ── DATOS CURIOSOS (ticker + grid) ─────────────────────── */
export const datosTicker = [
  'El arte rupestre más antiguo conocido tiene 45.500 años — un cerdo pintado en Sulawesi.',
  'Van Gogh vendió apenas 1 a 4 cuadros en vida. Hoy domina el top de subastas.',
  'El azul ultramarino llegó a valer más que el oro por gramo.',
  'La Mona Lisa no tiene cejas.',
  'El arte fue disciplina olímpica con medallas entre 1912 y 1948.',
  'Picasso creó cerca de 50.000 obras a lo largo de su vida.',
  'El "Salvator Mundi" se vendió por 450 millones y nadie sabe dónde está hoy.',
  'Yves Klein patentó su propio tono de azul: el IKB.',
  'Banksy trituró su obra en plena subasta de Sotheby\'s en 2018.',
];

export const datosCuriosos = [
  { color: 'var(--red)', dato: 'Recorrer el Louvre dedicando 30 segundos a cada obra te tomaría cerca de 100 días sin dormir.' },
  { color: 'var(--lilac-deep)', dato: 'Leonardo da Vinci escribía al revés, en escritura especular: solo legible frente a un espejo.' },
  { color: 'var(--yellow-deep)', dato: 'El "mummy brown", pigmento popular del siglo XVIII, se fabricaba con momias egipcias molidas.' },
  { color: 'var(--ink)', dato: 'Hokusai pintó "La gran ola" pasados los 70 años, y firmaba como "el viejo loco por el dibujo".' },
  { color: 'var(--red-deep)', dato: 'El "Cuadrado negro" de Malévich tiene grietas que revelan colores ocultos bajo la pintura.' },
  { color: 'var(--violet-deep)', dato: 'Rembrandt firmaba solo con su nombre de pila, como los maestros italianos que admiraba.' },
];

/* ── 20 ARTISTAS MÁS INFLUYENTES ────────────────────────── */
export const artistas = [
  { n: 1, nombre: 'Leonardo da Vinci', anos: '1452–1519', mov: 'Alto Renacimiento', pais: 'Italia', color: 'var(--yellow-deep)', obra: 'La Gioconda', img: wiki('Mona Lisa, by Leonardo da Vinci, from C2RMF retouched.jpg'), desc: 'El arquetipo del genio universal. Fundió ciencia y pintura como nadie; su sfumato disolvió el contorno y enseñó a pintar el aire entre las cosas.' },
  { n: 2, nombre: 'Miguel Ángel', anos: '1475–1564', mov: 'Alto Renacimiento', pais: 'Italia', color: 'var(--ink)', obra: 'La creación de Adán', img: wiki('Michelangelo - Creation of Adam (cropped).jpg'), desc: 'Escultor antes que pintor, talló cuerpos que parecen respirar. La Capilla Sixtina la pintó de pie durante cuatro años, no acostado.' },
  { n: 3, nombre: 'Caravaggio', anos: '1571–1610', mov: 'Barroco', pais: 'Italia', color: 'var(--ink)', obra: 'La vocación de San Mateo', img: wiki('The Calling of Saint Matthew-Caravaggo (1599-1600).jpg'), desc: 'Inventó el claroscuro dramático: luz cruda sobre fondo negro. Pintó santos con cara de gente de la calle y cambió el rumbo del Barroco.' },
  { n: 4, nombre: 'Rembrandt', anos: '1606–1669', mov: 'Barroco neerlandés', pais: 'Países Bajos', color: 'var(--red-deep)', obra: 'La ronda de noche', img: wiki('The Night Watch - HD.jpg'), desc: 'El mayor retratista de la intimidad humana. Sus autorretratos son una autobiografía pintada: del joven seguro al viejo arruinado y sabio.' },
  { n: 5, nombre: 'Diego Velázquez', anos: '1599–1660', mov: 'Barroco español', pais: 'España', color: 'var(--ink)', obra: 'Las Meninas', img: wiki('Las Meninas, by Diego Velázquez, from Prado in Google Earth.jpg'), desc: '"Las Meninas" es quizá el cuadro más analizado de la historia: un juego de espejos y miradas que mete al espectador dentro de la escena.' },
  { n: 6, nombre: 'Johannes Vermeer', anos: '1632–1675', mov: 'Barroco neerlandés', pais: 'Países Bajos', color: 'var(--lilac-deep)', obra: 'La joven de la perla', img: wiki('1665 Girl with a Pearl Earring.jpg'), desc: 'Pintó apenas unas 35 obras conocidas, todas de una quietud luminosa. Maestro absoluto de la luz que entra por una ventana.' },
  { n: 7, nombre: 'Francisco de Goya', anos: '1746–1828', mov: 'Romanticismo', pais: 'España', color: 'var(--ink)', obra: 'El 3 de mayo de 1808', img: wiki('El Tres de Mayo, by Francisco de Goya, from Prado thin black margin.jpg'), desc: 'El puente entre lo antiguo y lo moderno. Sus "Pinturas negras", hechas con plomo en las paredes de su casa, anticiparon el siglo XX entero.' },
  { n: 8, nombre: 'Claude Monet', anos: '1840–1926', mov: 'Impresionismo', pais: 'Francia', color: 'var(--lilac)', obra: 'Impresión, sol naciente', img: wiki('Claude Monet, Impression, soleil levant.jpg'), desc: 'Su cuadro le dio nombre a todo un movimiento. Pasó sus últimos años pintando los mismos nenúfares una y otra vez, persiguiendo la luz.' },
  { n: 9, nombre: 'Vincent van Gogh', anos: '1853–1890', mov: 'Postimpresionismo', pais: 'Países Bajos', color: 'var(--yellow)', obra: 'La noche estrellada', img: wiki('Van Gogh - Starry Night - Google Art Project.jpg'), desc: 'El símbolo del artista incomprendido. Pintó más de 2.000 obras en una década, casi sin vender nada. Hoy es leyenda mundial.' },
  { n: 10, nombre: 'Paul Cézanne', anos: '1839–1906', mov: 'Postimpresionismo', pais: 'Francia', color: 'var(--yellow-deep)', obra: 'Monte Sainte-Victoire', img: wiki('Paul Cézanne 110.jpg'), desc: '"El padre de todos nosotros", lo llamaron Picasso y Matisse. Descompuso la naturaleza en planos y abrió la puerta al cubismo.' },
  { n: 11, nombre: 'Gustav Klimt', anos: '1862–1918', mov: 'Modernismo / Secesión', pais: 'Austria', color: 'var(--yellow)', obra: 'El beso', img: wiki('The Kiss - Gustav Klimt - Google Cultural Institute.jpg'), desc: 'Oro, patrones y erotismo. Su "período dorado" produjo íconos absolutos. En 2025 un Klimt batió el récord de arte moderno en subasta.' },
  { n: 12, nombre: 'Pablo Picasso', anos: '1881–1973', mov: 'Cubismo', pais: 'España', color: 'var(--red)', obra: 'Guernica', img: wiki('Guernica.jpg'), desc: 'Reinventó la pintura más de una vez. Cofundó el cubismo y, con "Guernica", hizo del arte un grito político imposible de ignorar.' },
  { n: 13, nombre: 'Henri Matisse', anos: '1869–1954', mov: 'Fauvismo', pais: 'Francia', color: 'var(--red)', obra: 'La danza', img: wiki('La danse (II) by Henri Matisse.jpg'), desc: 'El maestro del color puro y la línea libre. En la vejez, sin poder pintar, inventó los recortes de papel: arte con tijeras.' },
  { n: 14, nombre: 'Marcel Duchamp', anos: '1887–1968', mov: 'Dadaísmo', pais: 'Francia', color: 'var(--ink)', obra: 'La fuente', img: wiki('Duchamp Fountaine.jpg'), desc: 'Puso un urinario en una galería y firmó "R. Mutt". Con ese gesto preguntó qué es el arte — y el arte conceptual no volvió a ser igual.' },
  { n: 15, nombre: 'Frida Kahlo', anos: '1907–1954', mov: 'Surrealismo / Folk', pais: 'México', color: 'var(--lilac)', obra: 'Las dos Fridas', img: wiki('Frida Kahlo, by Guillermo Kahlo.jpg'), desc: 'Convirtió el dolor físico y emocional en un lenguaje visual propio. Sus autorretratos son hoy un emblema global de identidad y resistencia.' },
  { n: 16, nombre: 'Salvador Dalí', anos: '1904–1989', mov: 'Surrealismo', pais: 'España', color: 'var(--lilac-deep)', obra: 'La persistencia de la memoria', img: wiki('Salvador Dali NYWTS.jpg'), desc: 'El showman del subconsciente. Sus relojes blandos volvieron cotidiano lo onírico, y él mismo se convirtió en obra de arte y personaje.' },
  { n: 17, nombre: 'Georgia O\'Keeffe', anos: '1887–1986', mov: 'Modernismo americano', pais: 'EE. UU.', color: 'var(--red-deep)', obra: 'Flores y desiertos', img: wiki('Alfred Stieglitz - Georgia O\'Keeffe - Google Art Project.jpg'), desc: 'La madre del modernismo estadounidense. Sus flores monumentales y los paisajes de Nuevo México redefinieron la mirada sobre la naturaleza.' },
  { n: 18, nombre: 'Jackson Pollock', anos: '1912–1956', mov: 'Expresionismo abstracto', pais: 'EE. UU.', color: 'var(--ink)', obra: 'Number 1A', img: wiki('Jackson Pollock.jpg'), desc: 'El "dripping": pintar goteando sobre el lienzo en el suelo, con todo el cuerpo. Liberó a la pintura del caballete y del control.' },
  { n: 19, nombre: 'Andy Warhol', anos: '1928–1987', mov: 'Pop Art', pais: 'EE. UU.', color: 'var(--lilac)', obra: 'Latas de sopa Campbell', img: wiki('Andy Warhol 1975.jpg'), desc: 'Borró la frontera entre arte y consumo. Sopas, billetes y celebridades repetidas en serie: el espejo perfecto del siglo del marketing.' },
  { n: 20, nombre: 'Jean-Michel Basquiat', anos: '1960–1988', mov: 'Neoexpresionismo', pais: 'EE. UU.', color: 'var(--red)', obra: 'Untitled (1982)', img: wiki('Jean-Michel Basquiat.jpg'), desc: 'Pasó del grafiti en el Lower East Side a romper récords de subasta. Murió a los 27. Primer artista negro en alcanzar el centro del mercado.' },
];

/* ── CUADROS MÁS CAROS ───────────────────────────────────── */
export const cuadrosCaros = [
  { pos: 1, obra: 'Salvator Mundi', autor: 'Leonardo da Vinci (atribuido)', ano: '1500 ca.', precio: '450,3', donde: 'Christie\'s · 2017', nota: 'El cuadro más caro jamás vendido. Su comprador y su paradero actual son un misterio.' },
  { pos: 2, obra: 'Interchange', autor: 'Willem de Kooning', ano: '1955', precio: '300', donde: 'Venta privada · 2015', nota: 'Una de las ventas privadas más altas de la historia del expresionismo abstracto.' },
  { pos: 3, obra: 'Los jugadores de cartas', autor: 'Paul Cézanne', ano: '1893', precio: '250', donde: 'Venta privada · 2011', nota: 'Comprado por la familia real de Catar. Una de cinco versiones del mismo motivo.' },
  { pos: 4, obra: 'Retrato de Elisabeth Lederer', autor: 'Gustav Klimt', ano: '1916', precio: '236,4', donde: 'Sotheby\'s · 2025', nota: 'Récord absoluto para arte moderno en subasta. La obra fue confiscada por los nazis en 1938.' },
  { pos: 5, obra: 'Nafea faa ipoipo (¿Cuándo te casas?)', autor: 'Paul Gauguin', ano: '1892', precio: '210', donde: 'Venta privada · 2014', nota: 'Pintado en Tahití, durante el período más célebre del artista.' },
  { pos: 6, obra: 'Number 17A', autor: 'Jackson Pollock', ano: '1948', precio: '200', donde: 'Venta privada · 2015', nota: 'Dripping puro de la época dorada del expresionismo abstracto.' },
  { pos: 7, obra: 'Les femmes d\'Alger (Versión O)', autor: 'Pablo Picasso', ano: '1955', precio: '179,4', donde: 'Christie\'s · 2015', nota: 'Homenaje de Picasso a Delacroix; récord para el artista en su momento.' },
  { pos: 8, obra: 'Nu couché', autor: 'Amedeo Modigliani', ano: '1917', precio: '170,4', donde: 'Christie\'s · 2015', nota: 'Sus desnudos escandalizaron en 1917; hoy son de lo más cotizado del mercado.' },
];

/* ── MUSEOS ──────────────────────────────────────────────── */
export const museos = [
  { nombre: 'Museo del Louvre', ciudad: 'París, Francia', color: 'var(--red)', joya: 'La Gioconda · La Victoria de Samotracia', dato: 'El museo más visitado del mundo. Tendrías que caminar kilómetros para verlo entero.' },
  { nombre: 'Museo del Prado', ciudad: 'Madrid, España', color: 'var(--yellow-deep)', joya: 'Las Meninas · El jardín de las delicias', dato: 'La mejor colección de Velázquez, Goya y El Bosco del planeta.' },
  { nombre: 'MoMA', ciudad: 'Nueva York, EE. UU.', color: 'var(--ink)', joya: 'La noche estrellada · Las señoritas de Avignon', dato: 'El templo del arte moderno: define qué cuenta como "moderno" desde 1929.' },
  { nombre: 'Galería Uffizi', ciudad: 'Florencia, Italia', color: 'var(--lilac-deep)', joya: 'El nacimiento de Venus · La Primavera', dato: 'Corazón del Renacimiento. Botticelli, Leonardo y Miguel Ángel bajo un mismo techo.' },
  { nombre: 'Rijksmuseum', ciudad: 'Ámsterdam, Países Bajos', color: 'var(--red-deep)', joya: 'La ronda de noche · La lechera', dato: 'La casa de Rembrandt y Vermeer; el Siglo de Oro neerlandés en estado puro.' },
  { nombre: 'Museo Reina Sofía', ciudad: 'Madrid, España', color: 'var(--ink)', joya: 'Guernica', dato: 'Alberga el "Guernica" de Picasso, custodiado como un símbolo nacional.' },
  { nombre: 'Tate Modern', ciudad: 'Londres, Reino Unido', color: 'var(--violet-deep)', joya: 'Rothko · Warhol · Hockney', dato: 'Una antigua central eléctrica convertida en el museo de arte contemporáneo más visitado.' },
  { nombre: 'The Met', ciudad: 'Nueva York, EE. UU.', color: 'var(--yellow)', joya: '5.000 años de arte mundial', dato: 'Más de dos millones de obras: de templos egipcios a arte contemporáneo.' },
];

/* ── PREMIOS DE ARTE ─────────────────────────────────────── */
export const premios = [
  { nombre: 'León de Oro', donde: 'Bienal de Venecia · Italia', desde: '1895', desc: 'El máximo reconocimiento de la bienal de arte más antigua e influyente del mundo.' },
  { nombre: 'Turner Prize', donde: 'Tate · Reino Unido', desde: '1984', desc: 'El premio que define la conversación del arte contemporáneo británico — siempre polémico.' },
  { nombre: 'Praemium Imperiale', donde: 'Japón', desde: '1988', desc: 'Conocido como "el Nobel del arte": premia trayectorias en pintura, escultura, arquitectura y música.' },
  { nombre: 'Premio Velázquez', donde: 'España · Iberoamérica', desde: '2002', desc: 'El mayor galardón a las artes plásticas en el ámbito iberoamericano.' },
  { nombre: 'Premio Marcel Duchamp', donde: 'Francia', desde: '2000', desc: 'Distingue a artistas emergentes y de media carrera radicados en Francia.' },
  { nombre: 'Hugo Boss Prize', donde: 'Guggenheim · EE. UU.', desde: '1996', desc: 'Reconoce el trabajo más arriesgado y experimental sin importar edad ni nacionalidad.' },
];

/* ── LÍNEA DE TIEMPO (movimientos) ───────────────────────── */
export const movimientos = [
  { ano: '1400', nombre: 'Renacimiento', color: 'var(--yellow-deep)' },
  { ano: '1600', nombre: 'Barroco', color: 'var(--ink)' },
  { ano: '1770', nombre: 'Neoclásico', color: 'var(--ink-soft)' },
  { ano: '1840', nombre: 'Impresionismo', color: 'var(--lilac)' },
  { ano: '1905', nombre: 'Vanguardias', color: 'var(--red)' },
  { ano: '1945', nombre: 'Expr. Abstracto', color: 'var(--ink)' },
  { ano: '1960', nombre: 'Pop Art', color: 'var(--lilac)' },
  { ano: '1980', nombre: 'Neoexpresionismo', color: 'var(--red)' },
  { ano: 'Hoy', nombre: 'Emergente', color: 'var(--red-deep)' },
];
