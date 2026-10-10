# Genera los PNG de /fibonacci/icons/ a partir de generar-iconos.html. NO se sube.
# Uso: python3 generar-iconos.py   (necesita playwright y Pillow)
import pathlib, sys
from playwright.sync_api import sync_playwright
from PIL import Image

aqui = pathlib.Path(__file__).resolve().parent
url = (aqui / "generar-iconos.html").as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(args=["--allow-file-access-from-files"])
    pg = b.new_page(viewport={"width": 1200, "height": 630})
    for que, sel, nombre in [("icono", ".icon", "icon-512.png"), ("maskable", ".icon", "icon-maskable-512.png"), ("og", ".og", "og.png")]:
        pg.goto(f"{url}?que={que}")
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(400)
        if not pg.evaluate("document.fonts.check('700 40px Texturina')"):
            sys.exit("No se ha cargado la fuente Texturina")
        pg.locator(sel).screenshot(path=str(aqui / nombre))
    b.close()

grande = Image.open(aqui / "icon-512.png").convert("RGB")
grande.save(aqui / "icon-512.png", optimize=True)
for lado, nombre in [(192, "icon-192.png"), (180, "apple-touch-icon.png"), (64, "favicon-64.png")]:
    grande.resize((lado, lado), Image.LANCZOS).save(aqui / nombre, optimize=True)
Image.open(aqui / "icon-maskable-512.png").convert("RGB").save(aqui / "icon-maskable-512.png", optimize=True)
Image.open(aqui / "og.png").convert("RGB").save(aqui / "og.png", optimize=True)
print("Iconos generados en", aqui)
