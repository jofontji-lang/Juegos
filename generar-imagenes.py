import cairosvg, os
os.makedirs('icons', exist_ok=True)

MURO="#FAF7F2"; TINTA="#22201F"; TINTA2="#6B655D"; HILO="#D5CFC3"; PAPEL="#FFFFFF"; BORDE="#E8E3D9"
RUTA="#008A7B"; MOND="#DC4430"; MIMI="#E9A016"; PROD="#3A62C6"
SERIF="Fraunces"
SANS="Figtree"
BANDA="#13295E"; BANDA2="#B3C6EC"; BANDA3="#8CA7DA"

# ── marca: cuatro salas ────────────────────────────────────────────────
def marca(size, maskable):
    lado = size*0.56 if maskable else size*0.68
    x0 = (size-lado)/2; y0 = (size-lado)/2
    u = lado/11.0; g = max(lado*0.035, 1.2)   # hueco entre salas
    def R(cx,cy,cw,ch,c):
        return (f'<rect x="{x0+cx*u+g/2:.2f}" y="{y0+cy*u+g/2:.2f}" '
                f'width="{cw*u-g:.2f}" height="{ch*u-g:.2f}" fill="{c}" rx="{lado*0.012:.2f}"/>')
    piezas = (R(0,0,11,2,MOND) + R(0,2,5,9,RUTA) + R(5,2,6,4,MIMI) + R(5,6,6,5,PROD))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
            f'<rect width="{size}" height="{size}" fill="{BANDA}"/>{piezas}</svg>')

for s, name, mask in [(512,'icono-512.png',False),(32,'icono-32.png',False)]:
    cairosvg.svg2png(bytestring=marca(s,mask).encode(), write_to=f'icons/{name}', output_width=s, output_height=s)

# ── obras en miniatura para la imagen de compartir ─────────────────────
def obra_ruta(w,h):
    sx, sy = w/200, h/288
    P = lambda x,y: f"{x*sx:.1f} {y*sy:.1f}"
    finas = [((36,44),(150,34)),((36,44),(96,118)),((150,34),(96,118)),((150,34),(184,120)),
             ((96,118),(184,120)),((96,118),(42,182)),((184,120),(150,196)),
             ((42,182),(150,196)),((42,182),(96,262)),((150,196),(96,262))]
    g = "".join(f'<path d="M{P(*a)} L{P(*b)}"/>' for a,b in finas)
    return (f'<g fill="none" stroke="{TINTA2}" stroke-width="1">{g}</g>'
            f'<path d="M{P(36,44)} L{P(96,118)} L{P(184,120)} L{P(150,196)} L{P(96,262)}" fill="none" stroke="{RUTA}" '
            f'stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>'
            + "".join(f'<circle cx="{x*sx:.1f}" cy="{y*sy:.1f}" r="4.5" fill="{PAPEL}" stroke="{TINTA}" stroke-width="1.2"/>'
                      for x,y in [(150,34),(184,120),(42,182),(150,196),(96,118)])
            + "".join(f'<circle cx="{x*sx:.1f}" cy="{y*sy:.1f}" r="6" fill="{RUTA}"/>' for x,y in [(36,44),(96,262)]))

def obra_mond(w,h):
    u=w/11.0; v=h/11.0
    r=lambda a,b,c,d,f: f'<rect x="{a*u:.1f}" y="{b*v:.1f}" width="{c*u:.1f}" height="{d*v:.1f}" fill="{f}"/>'
    return (r(0,0,11,2,MOND)+r(5,2,6,4,MIMI)+r(5,6,6,5,PROD)
            +f'<g stroke="{TINTA}" stroke-width="2.4" fill="none">'
             f'<path d="M0 {2*v:.1f} H{w}"/><path d="M{5*u:.1f} {2*v:.1f} V{h}"/>'
             f'<path d="M0 {7*v:.1f} H{5*u:.1f}"/><path d="M{5*u:.1f} {6*v:.1f} H{w}"/>'
             f'<rect x="1.2" y="1.2" width="{w-2.4:.1f}" height="{h-2.4:.1f}"/></g>')

def obra_mimi(w,h):
    cx=[w*p for p in (.125,.375,.625,.875)]; cy=[h*p for p in (.125,.375,.625,.875)]
    orden=[(0,0),(1,0),(1,1),(0,1),(0,2),(0,3),(1,3),(1,2),(2,2),(2,3),(3,3),(3,2),(3,1),(2,1),(2,0),(3,0)]
    d="M"+" L".join(f"{cx[c]:.1f} {cy[r]:.1f}" for r,c in orden)
    nums=[[6,18,24,25],[3,9,15,5],[4,2,16,20],[8,14,7,21]]
    t="".join(f'<text x="{cx[c]:.1f}" y="{cy[r]+w*0.026:.1f}" font-size="{w*0.085:.1f}" text-anchor="middle" fill="{TINTA}">{nums[r][c]}</text>'
              for r in range(4) for c in range(4))
    rej="".join(f'<path d="M0 {h*i/4:.1f} H{w}"/><path d="M{w*i/4:.1f} 0 V{h}"/>' for i in range(5))
    return (f'<g stroke="{HILO}" stroke-width=".8" fill="none" opacity=".55">{rej}</g>'
            f'<path d="{d}" fill="none" stroke="{MIMI}" stroke-width="{w*0.062:.1f}" opacity=".55" '
            f'stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle cx="{cx[0]:.1f}" cy="{cy[0]:.1f}" r="{w*0.04:.1f}" fill="{MIMI}" opacity=".85"/>'
            f'<g font-family="{SERIF}">{t}</g>')

def obra_prod(w,h):
    c=w*0.78/3; x0=w*0.03; y0=h*0.05
    cx=[x0+c*(i+.5) for i in range(3)]; cy=[y0+c*(i+.5) for i in range(3)]
    val=[[2,None,4],[7,5,None],[None,1,8]]
    rows=[72,105,48]; cols=[84,45,96]
    g=[f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{3*c:.1f}" height="{3*c:.1f}"/>']
    for i in (1,2):
        g.append(f'<path d="M{x0+c*i:.1f} {y0:.1f} V{y0+3*c:.1f}"/><path d="M{x0:.1f} {y0+c*i:.1f} H{x0+3*c:.1f}"/>')
    t="".join(f'<text x="{cx[j]:.1f}" y="{cy[i]+w*0.032:.1f}" font-size="{w*0.1:.1f}" text-anchor="middle" fill="{TINTA}">{val[i][j]}</text>'
              for i in range(3) for j in range(3) if val[i][j])
    tr="".join(f'<text x="{x0+3.45*c:.1f}" y="{cy[i]+w*0.028:.1f}" font-size="{w*0.082:.1f}" text-anchor="middle" fill="{PROD}">{rows[i]}</text>' for i in range(3))
    tc="".join(f'<text x="{cx[j]:.1f}" y="{y0+3.52*c:.1f}" font-size="{w*0.082:.1f}" text-anchor="middle" fill="{PROD}">{cols[j]}</text>' for j in range(3))
    return (f'<g stroke="{TINTA2}" stroke-width="1" fill="none">{"".join(g)}</g>'
            f'<g font-family="{SERIF}">{t}{tr}{tc}</g>')

# ── imagen de compartir 1200×630 ───────────────────────────────────────
W,H=1200,630
piezas=[]
defs=[("ruta",obra_ruta,126,182),("mond",obra_mond,168,168),("mimi",obra_mimi,164,164),("prod",obra_prod,146,166)]
cols=[622,884]; rieles=[96,336]; banda=208
for i,(nombre,fn,aw,ah) in enumerate(defs):
    pad=11; fw,fh=aw+2*pad, ah+2*pad
    fx=cols[i%2]; ry=rieles[i//2]
    fy=ry+(banda-fh)/2
    piezas.append(f'<path d="M{fx+fw/2:.1f} {ry} V{fy:.1f}" stroke="#3B5490" stroke-width="1"/>')
    piezas.append(f'<rect x="{fx}" y="{fy:.1f}" width="{fw}" height="{fh}" fill="{PAPEL}" stroke="{BORDE}"/>')
    piezas.append(f'<g transform="translate({fx+pad},{fy+pad:.1f})">{fn(aw,ah)}</g>')

og=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<rect width="{W}" height="{H}" fill="{BANDA}"/>
<g font-family="{SERIF}" fill="#FFFFFF">
  <text x="72" y="258" font-size="80">Matemáticas</text>
  <text x="72" y="338" font-size="80">jugables</text>
  <text x="72" y="404" font-family="{SANS}" font-size="27" fill="{BANDA3}" font-style="italic">Josep Font, profesor de matemáticas</text>
  <text x="72" y="466" font-family="{SANS}" font-size="26" fill="{BANDA2}">Cuatro puzles para jugar en el navegador</text>
  <text x="72" y="500" font-family="{SANS}" font-size="26" fill="{BANDA2}">o en el móvil. Gratuitos y sin anuncios.</text>
</g>
<path d="M600 {rieles[0]} H1136" stroke="#3B5490" stroke-width="1"/>
<path d="M600 {rieles[1]} H1136" stroke="#3B5490" stroke-width="1"/>
{"".join(piezas)}
</svg>'''
open('icons/og.svg','w').write(og)
cairosvg.svg2png(bytestring=og.encode(), write_to='icons/og.png', output_width=W, output_height=H)
print("hecho")
