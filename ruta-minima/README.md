# minimal route

Pantalla de inicio con tres entradas: **Reto de hoy** (el tablero del día, común para todos, que alimenta la racha), **Niveles** (avance libre, recordando la última jugada) y **Retos anteriores** (calendario mensual).

El calendario no guarda tableros: cada reto se deriva de su fecha, así que **el archivo completo existe desde el primer día** y solo hace falta almacenar tu resultado. Los días futuros aparecen bloqueados; los pasados, en verde si los resolviste, en rosa si te rendiste. Resolver un reto antiguo no altera la racha, que solo cuenta días consecutivos hasta hoy.

Juego de un jugador: ir de α a Ω por un grafo, sin repetir puntos, multiplicando los números del camino y buscando el **producto más pequeño**. Dos modalidades intercambiables en cualquier momento: **decimales** (0,75) y **fracciones** (3/4), con tableros propios cada una. Las pantallas se generan solas, con semilla: la pantalla 47 en Normal es siempre el mismo tablero, en cualquier dispositivo.

Toda la aritmética es exacta con enteros (numerador, denominador y máximo común divisor) en **las dos modalidades**; las comparaciones se hacen por productos cruzados y el decimal se imprime a partir de la fracción. No interviene la coma flotante en ningún momento.

En modalidad decimal, el validador exige además que **ningún producto del tablero pase de cuatro cifras decimales**, para que se pueda comprobar a mano.

## Contenido de la carpeta

```
index.html               la app entera (sin dependencias externas)
manifest.webmanifest     datos de instalación
sw.js                    service worker: funciona sin conexión
icons/                   iconos 192, 512, maskable, apple-touch, favicon
```

## Publicar en el repositorio Juegos

1. Copia esta carpeta dentro del repositorio `Juegos` con el nombre `ruta-minima`.
2. `git add ruta-minima && git commit -m "Añade La ruta más pequeña" && git push`
3. Queda en `https://juegos.matematicasjosepfont.es/ruta-minima/` (y en `https://jofontji-lang.github.io/Juegos/ruta-minima/`).

Todas las rutas del código son relativas (`./`), así que la carpeta funciona en cualquier subdirectorio sin tocar nada.

## Al publicar cambios

Sube el número de versión en la primera línea de `sw.js`:

```js
const VERSION = 'ruta-minima-v2';
```

Si no lo cambias, los navegadores que ya tengan la app cacheada seguirán viendo la versión antigua. Es el fallo más habitual al actualizar una PWA.

## Cómo se generan las pantallas

Cada pantalla nace de una semilla determinista (número de pantalla + dificultad). El generador propone un tablero y un validador lo acepta solo si cumple:

- mínimo **único**;
- la ruta mínima no es la única de menos saltos;
- ser codicioso —elegir siempre el número más pequeño disponible— **no** lleva al mínimo (Normal y Difícil);
- número de rutas dentro del rango de la dificultad;
- el mínimo es siempre **menor que 1**, con denominador acotado para que sea legible;
- ningún punto con menos de dos conexiones;
- **el tablero se puede rotular sin tapar nada**: se calcula la disposición de los números y, si algún rótulo queda debajo de un punto, la pantalla se descarta.

Los rótulos no van en el punto medio de la arista: se prueban quince posiciones a lo largo de ella y nueve desplazamientos perpendiculares, se elige la de menor solape con puntos y con rótulos ya colocados, y se repasa el conjunto dos veces más. Si aún así no hay hueco holgado, ese rótulo se dibuja algo más pequeño. Medido sobre 20.000 rótulos: ninguno tapado.

Si tras 300 intentos no encuentra un tablero válido, relaja las condiciones; si aun así falla, pasa a la semilla siguiente. Por eso la pantalla siempre existe.

Cada pantalla se dibuja con una de tres **familias**, elegida por la semilla y con el mismo peso las tres:

- **anillo**: polígono con rotación libre, cuerdas, lados ausentes y hasta dos puntos interiores;
- **capas**: columnas de α a Ω, con saltos de columna y enlaces verticales;
- **rejilla**: cuadrícula con α y Ω en esquinas opuestas.

Cada tablero sortea además **uno o dos denominadores** y usa solo esos, para que el resultado se pueda comprobar a mano.

| Dificultad | Puntos | Denominadores (fracciones) | Denominadores (decimales) | Impropias | Rutas |
|---|---|---|---|---|---|
| Fácil | 5–6 | 1 de {2, 3, 4, 5} | 1 de {2, 5, 10} | no | 6–30 |
| Normal | 6–8 | 2 de {2, 3, 4, 5} | 2 de {2, 4, 5, 10} | no | 12–90 |
| Difícil | 8–10 | 2 de {2, 3, 4, 5, 6, 8, 9} | 2 de {2, 4, 5, 10, 20} | sí | 24–400 |

## Legibilidad en grafos grandes

Tres mecanismos que trabajan juntos:

- **Línea guía**: cuando un rótulo tiene que apartarse de su arista para no taparse, un hilo fino lo ata al punto exacto de la arista a la que pertenece. Ocurre en el 16% de los rótulos.
- **Jerarquía por relevancia**: los números de las salidas disponibles desde donde estás se pintan en violeta y con recuadro reforzado, los ya recorridos en magenta, y el resto quedan apagados. En un grafo de diez puntos, mirar solo lo violeta reduce la decisión a tres o cuatro números.
- **Tocar para identificar**: al tocar una arista (o su número) se marca en violeta y una línea de texto declara a qué une y cuánto vale — "α–D vale 0,3 · salida disponible". Las aristas tienen una zona de toque invisible de 22 px, porque una línea de 1,6 px no se acierta con el dedo. Volver a tocarla la deselecciona; moverse la deselecciona también.
- **Zoom que sigue al jugador**: el botón recorre 1×, 1,7× y 2,4×, centrado en el punto donde estás. Ayuda menos que lo anterior; está por si la pantalla es pequeña.

## Sonido y vibración

Todo se sintetiza con Web Audio: no hay ni un archivo de audio en la carpeta. El tono de cada paso sale del producto acumulado (comprimido logarítmicamente), de modo que **cuanto más pequeño es el producto, más grave suena**: la ruta mínima es la más grave que se puede tocar en ese tablero.

La vibración usa `navigator.vibrate`, que funciona en Android y no en iOS. Ambos se conmutan con los botones ♪ y Vib, y la elección se guarda.

## Rendirse

Rendirse cierra la pantalla: se dibuja la ruta óptima en violeta, se muestra su producto y ya no se puede mover. El botón principal pasa a ser "Siguiente pantalla". La pantalla no cuenta como resuelta.

## Difusión

- **Reto de hoy**: el botón "Hoy" abre la pantalla del día, la misma para todo el mundo (se deriva de la fecha: número 10000 + días desde el 1/1/2026, dificultad Normal, modalidad alternando decimales y fracciones según el día). Resolverlo mantiene la **racha**.
- **Resultado compartible**, al estilo Wordle y sin destripar nada: un cuadro por intento (🟩 el óptimo, 🟨 entre los tres mejores, 🟧 tercio superior, 🟥 el resto, 🏳️ si te rendiste), el número de intentos y el enlace. Ni la ruta ni el valor mínimo aparecen.
- **Enlace por pantalla**: la dirección lleva siempre `?n=142&d=2&m=0` (o `?dia`), así que compartir el enlace abre exactamente el mismo tablero. Al entrar, la dirección manda sobre lo guardado.
- **Vista previa**: `icons/og.png` (1200×630) y etiquetas Open Graph, para que al pegar el enlace en WhatsApp o redes salga la tarjeta con el grafo.

Las etiquetas Open Graph llevan la URL absoluta `https://juegos.matematicasjosepfont.es/ruta-minima/`. Si lo publicas en otra dirección, hay que cambiarla en las cuatro líneas `og:` del `index.html`.

## Progreso

Se guarda en `localStorage` (clave `ruta-minima-v3`): última pantalla, dificultad, modalidad y pantallas resueltas. Es local a cada dispositivo, no hay servidor ni cuentas.

## Ideas pendientes

- Cronómetro y resultado compartible, como en Productos cruzados.
- Modo de comparación sin multiplicar: razonar qué factores encogen más, sin calcular el producto.
- Reto diario derivado de la fecha.
- Traducciones (valenciano, inglés).
- Variante de producto **máximo** en modo alterno.
