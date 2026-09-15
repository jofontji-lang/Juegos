# Publicar minimal route en Google Play

## Antes de nada: decide la URL definitiva

El TWA queda atado a la URL de inicio. Cambiarla después obliga a publicar una versión nueva y rompe la instalada. Decide ahora entre `/ruta-minima/` y `/minimal-route/`, publica la web, compruébala, y solo entonces genera el paquete.

Si eliges `minimal-route`, hay que cambiar también las líneas `og:url` y `og:image` del `index.html`, que llevan la ruta absoluta escrita.

## El punto que rompe el segundo TWA de un dominio

`assetlinks.json` vive en la **raíz del dominio**, no en la carpeta del juego:

```
https://juegos.matematicasjosepfont.es/.well-known/assetlinks.json
```

Mondrian Master ya tiene el suyo ahí. Ese archivo es **un array de declaraciones**, así que hay que **añadir** la de minimal route, no sustituir la existente. Si lo sobrescribes, Mondrian deja de verificar y a sus usuarios les aparece la barra de direcciones de Chrome encima del juego.

El resultado debe quedar así, con las dos entradas:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "es.matematicasjosepfont.mondrian",
      "sha256_cert_fingerprints": ["<huella de Mondrian>"]
    }
  },
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "es.matematicasjosepfont.minimalroute",
      "sha256_cert_fingerprints": ["<huella de minimal route>"]
    }
  }
]
```

La huella SHA-256 correcta es la de la **clave de firma de la app** de Play Console (Configuración → Integridad de la app → Firma de apps), no la del keystore de subida. Si usas la del keystore, la verificación falla en las instalaciones desde Play.

Para servirlo en GitHub Pages, el archivo va en `.well-known/assetlinks.json` en la raíz del repositorio que publica el dominio. GitHub Pages sirve carpetas que empiezan por punto sin problema, pero si usas Jekyll hay que añadir `include: [".well-known"]` en `_config.yml` o poner un `.nojekyll` en la raíz.

## Pasos

1. Sube la carpeta al repositorio y comprueba la web en el móvil: que se instale, que funcione en avión y que la portada cargue offline.
2. PWABuilder → pega la URL → Package for stores → Android.
   - Package ID: `es.matematicasjosepfont.minimalroute`
   - App name: `minimal route`
   - Display mode: standalone, orientación portrait
   - Signing key: nueva, y **guarda el keystore y su contraseña** fuera del repositorio.
3. Descarga el zip: trae el `.aab`, el keystore y el `assetlinks.json` generado. De ese archivo copia solo la entrada nueva y fusiónala con la de Mondrian.
4. Play Console → crear app → subir el `.aab` a prueba interna primero. Instálala desde Play y confirma que **no aparece la barra de direcciones**: si aparece, el assetlinks no está bien.
5. Rellena ficha, clasificación de contenido, seguridad de los datos y política de privacidad.
6. Producción.

## Datos de la ficha

**Nombre:** minimal route

**Descripción breve** (máx. 80 caracteres):
> Multiplica por el camino de α a Ω y busca el producto más pequeño.

**Descripción completa:**
> minimal route es un juego de lógica y cálculo mental. Recorres un grafo desde α hasta Ω, multiplicando los números que encuentras por el camino, y tu objetivo es conseguir el producto más pequeño posible. No puedes pasar dos veces por el mismo punto.
>
> Parece sencillo y no lo es: la ruta corta no suele ser la buena, y elegir siempre el número más pequeño que tienes delante casi nunca lleva al mínimo. Hay que mirar más allá del paso siguiente.
>
> • Reto diario: un tablero nuevo cada día, el mismo para todo el mundo, con racha y resultado compartible.
> • Calendario: juega también los retos de días anteriores.
> • Niveles: pantallas infinitas en tres dificultades, de 5 a 10 puntos.
> • Dos modalidades: decimales (0,75) o fracciones (3/4).
> • Funciona sin conexión.
>
> Pensado para clase de matemáticas y para jugar por gusto. Trabaja la multiplicación de decimales y fracciones, la comparación de productos y la idea de que multiplicar por un número menor que 1 empequeñece.

**Categoría:** Educación (o Juegos → Puzles)
**Clasificación:** para todos los públicos
**Etiquetas:** matemáticas, fracciones, decimales, puzle, grafos

## Seguridad de los datos

Responde: **no se recopilan ni se comparten datos**. La app no tiene analítica, ni cuentas, ni servidor. El progreso se guarda en `localStorage` del propio dispositivo. No hay permisos de Android salvo la vibración, que el TWA hereda del navegador.

Play exige una **política de privacidad con URL pública**. Ya va incluida: `privacidad.html`, enlazada desde el pie de la portada. La URL que hay que pegar en Play Console es `https://juegos.matematicasjosepfont.es/ruta-minima/privacidad.html` (ajústala si cambias el nombre de la carpeta).

## Recursos gráficos

| Recurso | Archivo |
|---|---|
| Icono 512×512 | `icons/icon-512.png` |
| Gráfico destacado 1024×500 | `icons/feature-graphic.png` |
| Icono adaptativo | `icons/icon-maskable-512.png` |

Faltan las **capturas de pantalla**: mínimo 2, y conviene 4. Hazlas en el móvil ya publicado, con la portada, un tablero de Normal, un tablero resuelto con la animación y el calendario.

## Después de publicar

Cada cambio en la web llega solo a la app instalada, porque el TWA carga la web. No hay que resubir nada a Play salvo que cambien el icono, el nombre o la URL. Lo que sí hay que hacer siempre es subir el número de versión de `sw.js`, o los dispositivos seguirán sirviendo la versión cacheada.
