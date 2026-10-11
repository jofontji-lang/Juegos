# Imagen de portada 1200x630 para GitHub y redes: mundo pintado con cuatro tintas
import gzip, json, math, os  # uso: FONTS=carpeta_de_fuentes python3 build/portada.py (desde la raíz del repo)
from PIL import Image, ImageDraw, ImageFont
F=os.environ.get('FONTS','fonts/')
W,H,S=1200,630,3
BG=(227,235,234); PANEL=(246,248,247); FG=(28,40,48); MUTED=(91,107,114); SEA=(203,221,223); LAND=(244,242,236)
INK=[(212,84,58),(226,177,58),(45,124,138),(123,92,158)]
d=json.load(gzip.open('data/world.json.gz'))['w110']
sx,sy=d['transform']['scale']; tx,ty=d['transform']['translate']
arcs=[]
for a in d['arcs']:
    x=y=0; pts=[]
    for dx,dy in a: x+=dx; y+=dy; pts.append((x*sx+tx,y*sy+ty))
    arcs.append(pts)
def ring(ix):
    out=[]
    for i in ix:
        pts=arcs[i] if i>=0 else arcs[~i][::-1]
        out+=pts if not out else pts[1:]
    return out
geoms=[g for g in d['objects']['r']['geometries'] if g['properties'].get('ct') not in ('Antarctica','Seven seas (open ocean)') and g.get('arcs')]
polys=[]; owner={}
for gi,g in enumerate(geoms):
    ps=[g['arcs']] if g['type']=='Polygon' else g['arcs']
    polys.append([[ring(r) for r in p] for p in ps])
    for p in ps:
        for r in p:
            for i in r: owner.setdefault(i if i>=0 else ~i,set()).add(gi)
n=len(geoms); adj=[set() for _ in range(n)]
for s in owner.values():
    for a in s:
        for b in s:
            if a!=b: adj[a].add(b)
# DSATUR con retroceso
col=[-1]*n
def solve():
    best=-1;bs=-1;bd=-1
    for i in range(n):
        if col[i]<0:
            u={col[j] for j in adj[i] if col[j]>=0}
            if len(u)>bs or (len(u)==bs and len(adj[i])>bd): best,bs,bd=i,len(u),len(adj[i])
    if best<0: return True
    used={col[j] for j in adj[best] if col[j]>=0}
    cnt=[col.count(c) for c in range(4)]
    for c in sorted(range(4),key=lambda c:cnt[c]):
        if c in used: continue
        col[best]=c
        if solve(): return True
    col[best]=-1; return False
import sys; sys.setrecursionlimit(5000); assert solve()
def ne1(lon,lat):
    l=math.radians(lon); p=math.radians(lat); p2=p*p; p4=p2*p2
    return l*(0.8707-0.131979*p2+p4*(-0.013791+p4*(0.003971*p2-0.001529*p4))), p*(1.007226+p2*(0.015085+p4*(-0.044475+0.028874*p2-0.005916*p4)))
proj=[[[ [ne1(x,y) for x,y in r] for r in p] for p in P] for P in polys]
xs=[x for P in proj for p in P for r in p for x,_ in r]; ys=[y for P in proj for p in P for r in p for _,y in r]
x0,x1,y0,y1=min(xs),max(xs),min(ys),max(ys)
img=Image.new('RGB',(W*S,H*S),BG); dr=ImageDraw.Draw(img)
# lámina a la derecha
PX,PY,PW,PH=448,92,712,446
dr.rectangle([PX*S,PY*S,(PX+PW)*S,(PY+PH)*S],fill=PANEL,outline=FG,width=S)
ix,iy,iw,ih=PX+6,PY+6,PW-12,PH-40
dr.rectangle([ix*S,iy*S,(ix+iw)*S,(iy+ih)*S],fill=SEA,outline=FG,width=S)
sc=min((iw-20)/(x1-x0),(ih-20)/(y1-y0)); ox=ix+(iw-(x1-x0)*sc)/2; oy=iy+(ih-(y1-y0)*sc)/2
def T(x,y): return ((ox+(x-x0)*sc)*S,(oy+(y1-y)*sc)*S)
for gi,P in enumerate(proj):
    for p in P:
        dr.polygon([T(*q) for q in p[0]],fill=INK[col[gi]])
        for h in p[1:]: dr.polygon([T(*q) for q in h],fill=SEA)
for gi,P in enumerate(proj):
    for p in P:
        for r in p: dr.line([T(*q) for q in r]+[T(*r[0])],fill=FG,width=max(1,int(0.9*S)),joint='curve')
mono=ImageFont.truetype(F+'mono.ttf',13*S); monob=ImageFont.truetype(F+'mono.ttf',12*S)
dr.text(((PX+8)*S,(PY+PH-27)*S),'Países del mundo · Countries of the world',font=ImageFont.truetype(F+'fellit.ttf',17*S),fill=FG)
t=f'{n} de {n} · ningún vecino repite'; w=dr.textlength(t,font=monob); dr.text(((PX+PW-8)*S-w,(PY+PH-24)*S),t,font=monob,fill=MUTED)
# columna de texto
L=44
dr.text((L*S,46*S),'ATLAS PARA COLOREAR',font=mono,fill=MUTED,spacing=0)
dr.line([(L*S,70*S),((PX+PW)*S,70*S)],fill=FG,width=S)
dr.text(((PX+PW)*S-dr.textlength('LÁMINA I',font=mono),46*S),'LÁMINA I',font=mono,fill=MUTED)
big=ImageFont.truetype(F+'fell.ttf',88*S)
dr.text((L*S-5*S,104*S),'Cuatro',font=big,fill=FG); dr.text((L*S-5*S,184*S),'Colores',font=big,fill=FG)
cw=dr.textlength('Colores',font=big)/S
for k in range(4):
    cx=L+k*24+8; cy=292; r=8
    dr.ellipse([(cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S],fill=INK[k])
it=ImageFont.truetype(F+'fellit.ttf',24*S)
dr.text((L*S,318*S),'Bastan cuatro tintas',font=it,fill=FG); dr.text((L*S,348*S),'para cualquier mapa.',font=it,fill=FG)
sub=ImageFont.truetype(F+'mono.ttf',14*S); sc_=ImageFont.truetype(F+'notosc.ttf',15*S)
y=410
dr.text((L*S,y*S),'Four Colors · ',font=ImageFont.truetype(F+'fellit.ttf',20*S),fill=MUTED); xx=L+dr.textlength('Four Colors · ',font=ImageFont.truetype(F+'fellit.ttf',20*S))/S
dr.text((xx*S,(y+1)*S),'Четыре краски · ',font=ImageFont.truetype(F+'ptit.ttf',19*S),fill=MUTED); xx+=dr.textlength('Четыре краски · ',font=ImageFont.truetype(F+'ptit.ttf',19*S))/S
dr.text((xx*S,(y-1)*S),'四色',font=ImageFont.truetype(F+'notosc.ttf',19*S),fill=MUTED)
dr.text((L*S,458*S),'Reto diario · Carrera · Pinta tu región',font=sub,fill=FG)
dr.text((L*S,480*S),'Daily · Career · Paint your region',font=sub,fill=MUTED)
# franja de cuatro tintas abajo
for k in range(4): dr.rectangle([(L+k*90)*S,512*S,(L+(k+1)*90)*S,519*S],fill=INK[k])
dr.text((L*S,536*S),'juegos.matematicasjosepfont.es/cuatro-colores',font=mono,fill=FG)
img=img.resize((W,H),Image.LANCZOS); img.save('icons/og.png',optimize=True)
print('ok',n)
