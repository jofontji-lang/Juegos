# Portada — juegos.matematicasjosepfont.es

Carpeta lista para subir a la raíz del repositorio. No hay compilación ni
dependencias: se edita el HTML y se sube.

```
index.html          la portada entera (estilos y dibujos dentro)
sitemap.xml
robots.txt
fuentes/            fraunces.woff2 · figtree.woff2 · OFL-*.txt (servidas desde tu dominio)
icons/              icono-32.png · icono-512.png (favicon) · og.png (al compartir)
generar-imagenes.py genera el favicon y la imagen de compartir (NO se sube)

La portada es una página y nada más: no lleva manifest ni service worker, no se
instala y no compite con tus apps. Las cuatro apps siguen siendo independientes,
cada una con su carpeta, su manifest, su service worker y su ficha de Play.
```

## Antes de subirla, cuatro cosas

1. **El nombre.** Está puesto «Matemáticas jugables» como provisional. Si lo
   cambias, está marcado con el comentario `NOMBRE` en cuatro sitios del
   `index.html`.
2. **El correo del pie** (`hola@matematicasjosepfont.es`) y el enlace a
   `matematicasjosepfont.es`.
3. **El enlace de Play de Mondrian**: está comentado, porque no sé el id del
   paquete. Búscalo en la URL de su ficha de Play, ponlo y quita el comentario.
   Lo mismo para Mimizu cuando lo publiques: copia ese bloque en su cartela.
4. **Las frases de Ruta mínima y Mondrian**, que escribí sin conocer las reglas
   exactas. Están en `<p class="nota">` de cada tarjeta.

## Las miniaturas

No son capturas: son dibujos hechos a mano en SVG, dentro del propio HTML.
Pesan unos pocos kilobytes, se ven nítidos a cualquier tamaño, cambian de color
solos en modo oscuro y no hay que rehacerlos cuando toques un juego.

Son matemáticamente correctos, no decorativos:

- **Ruta mínima**: un grafo de 7 vértices y 10 aristas; el camino resaltado
  (3+4+3+2 = 12) es de verdad el mínimo entre los dos vértices marcados, y
  pasa por aristas que están dibujadas.
- **Mondrian**: un cuadrado 11×11 partido en 11×2, 5×5, 6×4, 5×4 y 6×5 —
  cinco rectángulos de medidas distintas dos a dos.
- **Mimizu**: los 16 números forman un camino hamiltoniano real; cada paso es
  entre consecutivos (24-25, 15-16, 20-21) o con factor común.
- **Productos cruzados**: la cuadrícula se completa con 9, 3 y 6, y entonces
  las filas dan 72, 105 y 48 y las columnas 84, 45 y 96.

Si prefieres capturas reales, cada `<figure>` es independiente: se sustituye el
`<svg>` por un `<img>` en WebP con `width` y `height` declarados.

## La paleta

Un azul de marca, dos neutros cálidos y cuatro colores de juego.

`--banda` (`#13295E`) es el único color que es de la portada y no de ningún
juego. Va en la banda de la cabecera, en el favicon, en la barra del navegador
(`theme-color`) y en la imagen que sale al compartir. Cambiarlo en `:root` los
cambia todos menos las imágenes, que se rehacen con `generar-imagenes.py`.

La banda va a sangre aunque el `body` tenga márgenes laterales: lo hace un
`::before` de 100vw centrado, no un contenedor aparte. Así la cabecera sigue
alineada con la pared de abajo.

Debajo de la banda, dos neutros cálidos y cuatro colores. Está toda en el bloque `:root` del
`index.html`, y el modo oscuro en el `@media (prefers-color-scheme: dark)` que
va justo debajo. No hay ningún color escrito a mano fuera de ahí: las cuatro
miniaturas tiran de las mismas variables, así que cambiar la paleta las cambia
a ellas también.

Cada juego tiene tres tonos, y cada uno hace un trabajo distinto:

- `--c-X` **marca**: el color de identidad. La regla de la cartela, el trazo del
  camino, los rellenos grandes.
- `--c-X-texto`: el mismo color oscurecido hasta poder llevar texto encima de
  papel blanco con 4,5:1 de contraste. Lo usan los productos de fila y columna
  de Productos cruzados. En ámbar la diferencia es grande (`#E9A016` no vale
  como texto, `#8A5D06` sí); en azul es el mismo color.
- `--c-X-tinte`: el mismo color muy claro, para rellenos que llevan texto
  oscuro encima. Es el cuerpo de la lombriz de Mimizu.

Los cuatro colores son el rojo, el amarillo y el azul de Mondrian más un verde
azulado. Por eso la miniatura de Mondrian se pinta con tres colores de la
colección y no con unos suyos: el cuadro es, literalmente, la paleta.

## La espiral de la cabecera

Es una espiral de Ulam: los números del 1 al 3721 colocados en espiral desde el
centro, con los 519 primos marcados. Las diagonales que se ven no son un adorno,
son el patrón que hace interesante a la espiral.

Va en el hueco que deja la cabecera, no debajo del texto, con opacidad del 11 %
y disolviéndose por los bordes. En el móvil se oculta. Son 7 kB de un solo
`<path>` dentro del HTML; si algún día estorba, se borra el `<svg class="ulam">`
y su bloque de CSS.

## La tipografía

Dos familias variables, las dos servidas desde `/fuentes/`. No hay ninguna
llamada a Google Fonts ni a ningún otro servidor: son las dos únicas peticiones
que hace la página además del propio HTML.

- **Fraunces** (25 kB) en los titulares, en el nombre de cada juego, en el
  contenido matemático y en los números de los dibujos. Lleva el eje `WONK`
  fijado en 1: de ahí salen la pata de la «g» y la cola de la «y». También van
  fijados `SOFT=0` y `opsz=48`; el peso queda libre, de 400 a 700.
- **Figtree** (12 kB) en todo el texto corrido, de 300 a 800.

Las dos van recortadas al alfabeto que usa la página. Si algún día la traduces
a un idioma con caracteres nuevos, hay que volver a generarlas.

Ninguna de las dos lleva cursiva, y es a propósito. Lo que antes iba en cursiva
ahora se distingue por familia, peso y color. Si pusieras `font-style:italic`,
el navegador falsificaría la cursiva inclinando la redonda, que queda peor que
no tenerla.

Las dos con SIL Open Font License 1.1. Los `OFL-*.txt` viajan en `/fuentes/` y
tienen que quedarse ahí.

Para rehacer la imagen de compartir hace falta tener las dos instaladas en el
sistema, porque `generar-imagenes.py` las compone por nombre.

## Sin service worker, a propósito

La portada no cachea nada. Un service worker en la raíz vería pasar también las
peticiones de `/mimizu/`, `/mondrian/` y las demás, y es la forma más fácil de
romper el funcionamiento sin conexión de los juegos sin enterarte. Como la
página son 21 kB y no llama a nadie de fuera, carga igual de rápido sin él.

La contrapartida es que un cambio se ve al momento: editas, subes y ya está.
No hay versiones que subir ni móviles que se queden con lo viejo.

## Lista de comprobación para el juego número cinco

1. Carpeta propia con nombre estable en la raíz. La URL no se cambia nunca.
2. Su `manifest.webmanifest`, su `sw.js` y sus iconos **dentro de esa carpeta**,
   nunca en la raíz.
3. Privacidad: si no recoge datos, le vale `/privacidad/`; si recoge algo,
   sección propia en esa página diciendo qué, adónde va y cuánto se guarda.
4. Si se empaqueta: **añadir** una entrada a `/.well-known/assetlinks.json`,
   nunca sustituir el archivo. Y recordar que Play añade una segunda huella al
   firmar.
5. Un color propio y su tarjeta en la portada, con el bloque de abajo.
6. Añadir la URL a `sitemap.xml`.

### Plantilla de tarjeta

Se pega dentro de `<main class="pared limite">`, se elige un color en
`:root` (`--c-nombre`) y se dibuja o se enlaza la miniatura.

```html
<article class="obra obra--NOMBRE" style="--acento:var(--c-NOMBRE)">
  <div class="colgadura">
    <span class="cable" aria-hidden="true"></span>
    <figure>
      <svg viewBox="0 0 240 240" role="img" aria-label="DESCRIPCIÓN DEL DIBUJO">
        …
      </svg>
    </figure>
    <span class="lastre" aria-hidden="true"></span>
  </div>
  <div class="cartela">
    <h2><a href="/CARPETA/">NOMBRE DEL JUEGO</a></h2>
    <p class="materia">CONTENIDO MATEMÁTICO</p>
    <div class="regla"></div>
    <p class="nota">UNA FRASE CON LA REGLA DEL JUEGO.</p>
    <p class="ficha">Navegador y Android</p>
    <a class="tienda" href="URL DE PLAY">En Google Play</a>
  </div>
</article>
```

Y el ancho de su obra, junto a los otros cuatro, para que la pared no quede
uniforme:

```css
.obra--NOMBRE figure{width:min(90%, 240px)}
```
