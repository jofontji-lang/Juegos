#!/usr/bin/env python3
"""
Genera icons/og.png (la imagen que sale al compartir el enlace) y los favicons.

Las miniaturas NO se dibujan aquí: se extraen del propio index.html, que es la
única fuente de verdad. Por eso, cuando añadas un juego nuevo a la portada,
basta con volver a ejecutar este script y aparecerá también en la imagen de
compartir. No hay que tocar nada más.

    python3 generar-imagenes.py

Requiere: cairosvg, y las tipografías Fraunces y Figtree instaladas en el
sistema (no basta con los .woff2 de /fuentes/, que son para el navegador).
"""

import os
import re
import cairosvg

AQUI = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(AQUI, "index.html")
SALIDA = os.path.join(AQUI, "icons")

TITULAR = "Fraunces"
TEXTO = "Figtree"

# ─────────────────────────────────────────────────────────────────────────────
# 1. Leer la paleta y las obras del index.html
# ─────────────────────────────────────────────────────────────────────────────

fuente = open(HTML, encoding="utf-8").read()


def paleta():
    """Las variables del bloque :root (el modo claro)."""
    bloque = re.search(r":root\{(.*?)\n\}", fuente, re.S).group(1)
    return dict(re.findall(r"--([\w-]+)\s*:\s*([^;]+);", bloque))


PALETA = {k: v.strip() for k, v in paleta().items()}


def resolver(svg, acento):
    """Sustituye var(--x) por su color: un SVG suelto no hereda el CSS."""
    svg = svg.replace("var(--acento)", f"var(--{acento})")
    for _ in range(4):
        def cambio(m):
            return PALETA.get(m.group(1), "#000000")
        nuevo = re.sub(r"var\(\s*--([\w-]+)\s*\)", cambio, svg)
        if nuevo == svg:
            break
        svg = nuevo
    return svg


def obras():
    """Cada juego de la portada: slug, nombre y su SVG ya resuelto."""
    fuera = []
    for art in re.finditer(
        r'<article class="obra obra--([\w-]+)"[^>]*>(.*?)</article>', fuente, re.S
    ):
        slug, cuerpo = art.group(1), art.group(2)
        svg = re.search(r"<svg\b.*?</svg>", cuerpo, re.S).group(0)
        nombre = re.search(r"<h2><a [^>]*>(.*?)</a></h2>", cuerpo, re.S).group(1)
        vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
        fuera.append({
            "slug": slug,
            "nombre": nombre.strip(),
            "svg": resolver(svg, f"c-{slug}"),
            "w": float(vb.group(1)),
            "h": float(vb.group(2)),
        })
    return fuera


JUEGOS = obras()
print(f"{len(JUEGOS)} obras encontradas: " + ", ".join(j["nombre"] for j in JUEGOS))

BANDA = PALETA.get("banda", "#13295E")
BANDA2 = PALETA.get("banda-2", "#B3C6EC")
BANDA3 = PALETA.get("banda-3", "#8CA7DA")
PAPEL = PALETA.get("papel", "#FFFFFF")
HILO_BANDA = "#3B5490"      # el riel, sobre el azul

# ─────────────────────────────────────────────────────────────────────────────
# 2. La imagen de compartir
# ─────────────────────────────────────────────────────────────────────────────

W, H = 1200, 630
IZQ, DER = 548, 1140                 # franja donde van las obras
ARRIBA, ABAJO = 92, 600              # franja vertical
MARGEN = 9                           # aire dentro de cada marco

CUENTA = {1: "Un", 2: "Dos", 3: "Tres", 4: "Cuatro", 5: "Cinco", 6: "Seis",
          7: "Siete", 8: "Ocho", 9: "Nueve", 10: "Diez", 11: "Once", 12: "Doce"}
n = len(JUEGOS)
frase = (f'{CUENTA.get(n, n)} {"puzles" if n != 1 else "puzle"} '
         f'para jugar en el navegador')

# La rejilla se calcula sola: una fila hasta tres obras, dos hasta ocho, tres
# a partir de ahí. La última fila va centrada si queda corta, igual que en la
# portada. Cuantas más obras, más pequeña cada una.
filas = 1 if n <= 3 else (2 if n <= 8 else 3)
cols = -(-n // filas)                      # techo de n/filas
celda = (DER - IZQ) / cols
alto_fila = (ABAJO - ARRIBA) / filas
ancho_obra = min(148, celda - 30)

piezas = []
rieles = []
for fila in range(filas):
    tanda = JUEGOS[fila * cols:(fila + 1) * cols]
    if not tanda:
        break
    y_riel = ARRIBA + alto_fila * fila
    ancho_tanda = celda * len(tanda)
    x0 = IZQ + ((DER - IZQ) - ancho_tanda) / 2      # la fila corta, centrada
    rieles.append(f'<path d="M{x0 - 8:.1f} {y_riel:.1f} H{x0 + ancho_tanda + 8:.1f}" '
                  f'stroke="{HILO_BANDA}" stroke-width="1"/>')
    for i, j in enumerate(tanda):
        cx = x0 + celda * (i + 0.5)
        # que quepa también a lo alto: con tres filas, las obras altas se pisaban
        ancho = min(ancho_obra, (alto_fila - 40 - 2 * MARGEN) * j["w"] / j["h"])
        alto = ancho * j["h"] / j["w"]
        marco_w = ancho + 2 * MARGEN
        marco_h = alto + 2 * MARGEN
        # la obra se cuelga por su centro dentro de la fila, como en la portada
        y = y_riel + (alto_fila - 26 - marco_h) / 2
        x = cx - marco_w / 2
        piezas.append(
            f'<path d="M{cx:.1f} {y_riel:.1f} V{y:.1f}" stroke="{HILO_BANDA}" stroke-width="1"/>'
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{marco_w:.1f}" height="{marco_h:.1f}" fill="{PAPEL}"/>'
            f'<svg x="{x + MARGEN:.1f}" y="{y + MARGEN:.1f}" width="{ancho:.1f}" height="{alto:.1f}"'
            f' viewBox="0 0 {j["w"]:g} {j["h"]:g}">'
            + re.sub(r"^<svg\b[^>]*>", "", j["svg"]).rsplit("</svg>", 1)[0]
            + "</svg>"
        )

og = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<rect width="{W}" height="{H}" fill="{BANDA}"/>
<g font-family="{TITULAR}" fill="#FFFFFF" font-weight="600">
  <text x="72" y="236" font-size="66">Matemáticas</text>
  <text x="72" y="310" font-size="66">jugables</text>
</g>
<text x="72" y="368" font-family="{TEXTO}" font-size="26" fill="{BANDA3}">Josep Font, profesor de matemáticas</text>
<g font-family="{TEXTO}" font-size="25" fill="{BANDA2}">
  <text x="72" y="436">{frase}</text>
  <text x="72" y="470">o en el móvil. Gratuitos y sin anuncios.</text>
</g>
{"".join(rieles)}
{"".join(piezas)}
</svg>'''

os.makedirs(SALIDA, exist_ok=True)
open(os.path.join(SALIDA, "og.svg"), "w", encoding="utf-8").write(og)
cairosvg.svg2png(bytestring=og.encode(), write_to=os.path.join(SALIDA, "og.png"),
                 output_width=W, output_height=H)

# Los PNG se guardan con paleta reducida: son colores planos y bajan de 72 kB
# a 25 kB sin que se note.
from PIL import Image
for nombre in ("og.png",):
    ruta = os.path.join(SALIDA, nombre)
    Image.open(ruta).convert("RGB").quantize(colors=128, dither=Image.NONE)\
         .save(ruta, optimize=True)

# ─────────────────────────────────────────────────────────────────────────────
# 3. Favicon: el azul de la colección partido en cuatro colores de juego
# ─────────────────────────────────────────────────────────────────────────────

ACENTOS = [PALETA.get(f"c-{j['slug']}", "#FFFFFF") for j in JUEGOS]


def marca(lado):
    u = lado / 16
    def r(x, y, w, h, c):
        return (f'<rect x="{x*u:.2f}" y="{y*u:.2f}" width="{w*u:.2f}" '
                f'height="{h*u:.2f}" fill="{c}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{lado}" height="{lado}" '
            f'viewBox="0 0 {lado} {lado}"><rect width="{lado}" height="{lado}" fill="{BANDA}"/>'
            + r(2, 2, 9, 4, ACENTOS[0]) + r(11, 2, 3, 12, ACENTOS[1])
            + r(2, 6, 4, 8, ACENTOS[2]) + r(6, 6, 5, 8, ACENTOS[3])
            + "</svg>")


for lado, nombre in [(512, "icono-512.png"), (32, "icono-32.png")]:
    cairosvg.svg2png(bytestring=marca(512).encode(),
                     write_to=os.path.join(SALIDA, nombre),
                     output_width=lado, output_height=lado)

print("hecho: icons/og.png, icons/og.svg, icons/icono-512.png, icons/icono-32.png")
