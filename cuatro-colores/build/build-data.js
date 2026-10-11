// Construye los datos del juego en lon/lat: regiones del mundo (admin-1), países 50m y 110m, agrupaciones y municipios de España
const fs=require('fs');
const topo=require('topojson-client'),srv=require('topojson-server'),simp=require('topojson-simplify');
const d3=require('d3-geo');
const NE=process.env.NE_DIR||'ne/geojson/';
const rd=f=>JSON.parse(fs.readFileSync(NE+f));

function rewind(f){const g=f.geometry;if(!g)return f;
  const fix=poly=>{const a=d3.geoArea({type:'Polygon',coordinates:poly});return a>2*Math.PI?poly.map(r=>r.slice().reverse()):poly};
  if(g.type==='Polygon')g.coordinates=fix(g.coordinates);else if(g.type==='MultiPolygon')g.coordinates=g.coordinates.map(fix);return f}
function pack(features,minW,q=1e5){
  features.forEach(rewind);
  let t=srv.topology({r:{type:'FeatureCollection',features}});
  t=simp.presimplify(t,simp.sphericalTriangleArea);t=simp.simplify(t,minW);t=topo.quantize(t,q);

  return t}
fs.mkdirSync('data',{recursive:true});
const out={};const KM2=1/(510e6)*4*Math.PI; // estereorradianes por km²

/* ---------- regiones del mundo (admin-1) ---------- */
{
  const a=rd('ne_10m_admin_1_states_provinces.geojson');
  const feats=a.features.filter(f=>f.geometry).map(f=>{const p=f.properties;
    return{type:'Feature',geometry:f.geometry,properties:{n:[p.name||p.name_en,p.name_en||p.name,p.name_es||p.name_en||p.name,p.name_ru||p.name_en||p.name,p.name_zh||p.name_en||p.name],
      c:p.adm0_a3,r:p.region||'',o:/Overseas/.test(p.type_en||'')?1:0,k:p.iso_3166_2||''}}});
  out.a1=pack(feats,4*KM2);
}
/* ---------- países ---------- */
for(const[key,file,w]of[['a0','ne_50m_admin_0_countries.geojson',8*KM2],['w110','ne_110m_admin_0_countries.geojson',20*KM2]]){
  const a=rd(file);
  const feats=a.features.filter(f=>f.geometry).map(f=>{const p=f.properties;
    return{type:'Feature',geometry:f.geometry,properties:{n:[p.NAME,p.NAME_EN||p.NAME,p.NAME_ES||p.NAME,p.NAME_RU||p.NAME,p.NAME_ZH||p.NAME],c:p.ADM0_A3,ct:p.CONTINENT,sr:p.SUBREGION}}});
  out[key]=pack(feats,w);
}
/* ---------- agrupaciones: regiones de Italia y comunidades autónomas ---------- */
{
  const IT={"Valle d'Aosta":["Aosta Valley","Valle de Aosta","Валле-д’Аоста","瓦莱达奥斯塔"],"Piemonte":["Piedmont","Piamonte","Пьемонт","皮埃蒙特"],"Lombardia":["Lombardy","Lombardía","Ломбардия","伦巴第"],
  "Trentino-Alto Adige":["Trentino-South Tyrol","Trentino-Alto Adigio","Трентино — Альто-Адидже","特伦蒂诺-上阿迪杰"],"Liguria":["Liguria","Liguria","Лигурия","利古里亚"],"Emilia-Romagna":["Emilia-Romagna","Emilia-Romaña","Эмилия-Романья","艾米利亚-罗马涅"],
  "Marche":["Marche","Marcas","Марке","马尔凯"],"Veneto":["Veneto","Véneto","Венеция","威尼托"],"Friuli-Venezia Giulia":["Friuli-Venezia Giulia","Friuli-Venecia Julia","Фриули — Венеция-Джулия","弗留利-威尼斯朱利亚"],
  "Abruzzo":["Abruzzo","Abruzos","Абруццо","阿布鲁佐"],"Molise":["Molise","Molise","Молизе","莫利塞"],"Apulia":["Apulia","Apulia","Апулия","普利亚"],"Basilicata":["Basilicata","Basilicata","Базиликата","巴西利卡塔"],
  "Calabria":["Calabria","Calabria","Калабрия","卡拉布里亚"],"Campania":["Campania","Campania","Кампания","坎帕尼亚"],"Lazio":["Lazio","Lacio","Лацио","拉齐奥"],"Toscana":["Tuscany","Toscana","Тоскана","托斯卡纳"],
  "Sicily":["Sicily","Sicilia","Сицилия","西西里"],"Sardegna":["Sardinia","Cerdeña","Сардиния","撒丁"],"Umbria":["Umbria","Umbría","Умбрия","翁布里亚"]};
  const ES={"Ceuta":["Ceuta","Ceuta","Сеута","休达"],"Melilla":["Melilla","Melilla","Мелилья","梅利利亚"],"Foral de Navarra":["Navarre","Navarra","Наварра","纳瓦拉"],"País Vasco":["Basque Country","País Vasco","Страна Басков","巴斯克"],
  "Aragón":["Aragon","Aragón","Арагон","阿拉贡"],"Cataluña":["Catalonia","Cataluña","Каталония","加泰罗尼亚"],"Extremadura":["Extremadura","Extremadura","Эстремадура","埃斯特雷马杜拉"],"Andalucía":["Andalusia","Andalucía","Андалусия","安达卢西亚"],
  "Galicia":["Galicia","Galicia","Галисия","加利西亚"],"Castilla y León":["Castile and León","Castilla y León","Кастилия и Леон","卡斯蒂利亚-莱昂"],"Valenciana":["Valencian Community","Comunitat Valenciana","Валенсия","巴伦西亚"],
  "Murcia":["Murcia","Región de Murcia","Мурсия","穆尔西亚"],"Asturias":["Asturias","Asturias","Астурия","阿斯图里亚斯"],"Cantabria":["Cantabria","Cantabria","Кантабрия","坎塔布里亚"],"Canary Is.":["Canary Islands","Canarias","Канарские острова","加那利群岛"],
  "Islas Baleares":["Balearic Islands","Illes Balears","Балеарские острова","巴利阿里群岛"],"La Rioja":["La Rioja","La Rioja","Риоха","拉里奥哈"],"Castilla-La Mancha":["Castilla–La Mancha","Castilla-La Mancha","Кастилия — Ла-Манча","卡斯蒂利亚-拉曼恰"],"Madrid":["Madrid","Comunidad de Madrid","Мадрид","马德里"]};
  const LOCAL_ES={"Foral de Navarra":"Navarra","Valenciana":"Comunitat Valenciana","Murcia":"Región de Murcia","Canary Is.":"Canarias","Islas Baleares":"Illes Balears","Madrid":"Comunidad de Madrid"};
  const t=out.a1,geoms=t.objects.r.geometries,feats=[];
  for(const[c3,dict,local]of[['ITA',IT,null],['ESP',ES,LOCAL_ES]]){
    for(const reg in dict){const gs=geoms.filter(g=>g.properties.c===c3&&g.properties.r===reg);if(!gs.length){console.log('falta',reg);continue}
      const m=topo.merge(t,gs);const tr=dict[reg];
      feats.push({type:'Feature',geometry:m,properties:{n:[(local&&local[reg])||(c3==='ITA'?reg.replace('Sicily','Sicilia').replace('Apulia','Puglia'):reg),tr[0],tr[1],tr[2],tr[3]],c:c3,g:c3==='ITA'?'itr':'ccaa'}})}}
  feats.forEach(rewind);
  let g=srv.topology({r:{type:'FeatureCollection',features:feats}},1e5);
  out.grp=g;
}
/* ---------- municipios de España (es-atlas, IGN) ---------- */
{
  const ES=require('es-atlas/es/municipalities.json');
  const fc=topo.feature(ES,ES.objects.municipalities);
  const feats=fc.features.map(f=>({type:'Feature',geometry:f.geometry,properties:{n:[f.properties.name],i:f.id}}));
  const provNames={};ES.objects.provinces.geometries.forEach(g=>provNames[g.id]=g.properties.name);
  const t=pack(feats,0.002*KM2,2e5);t.provNames=provNames;
  fs.writeFileSync('data/muni.json',JSON.stringify(t));
}
fs.mkdirSync('data',{recursive:true});
fs.writeFileSync('data/world.json',JSON.stringify(out));
for(const k in out)console.log(k,out[k].objects.r.geometries.length,(JSON.stringify(out[k]).length/1024|0)+'kB');
console.log('muni',(fs.statSync('data/muni.json').size/1024|0)+'kB');
