/* Cuatro Colores — lógica del juego */
'use strict';
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const store = {
  get(k, d) { try { const v = localStorage.getItem('cc4w:' + k); return v ? JSON.parse(v) : d } catch (e) { return d } },
  set(k, v) { try { localStorage.setItem('cc4w:' + k, JSON.stringify(v)) } catch (e) {} }
};
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
function hashStr(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
const popc = x => { let c = 0; while (x) { c += x & 1; x >>= 1 } return c };
const R2 = v => Math.round(v * 100) / 100;
const fmt = s => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') };
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function el(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e }

/* ---------- datos ---------- */
const DATA = {};
let worldReady = null, muniReady = null;
/* los datos se publican comprimidos (.json.gz); si no están o el navegador no sabe descomprimir, se usa el .json */
async function loadJSON(name) {
  if (typeof DecompressionStream === 'function') { try { const r = await fetch(name + '.gz'); if (r.ok) return await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json() } catch (e) {} }
  return (await fetch(name)).json() }
function loadWorld() { return worldReady || (worldReady = loadJSON('data/world.json').then(j => Object.assign(DATA, j))) }
function loadMuni() { return muniReady || (muniReady = loadJSON('data/muni.json').then(j => { DATA.muni = j })) }
const COUNTRY = {};
const SHORT = { CHN: { en: 'China', ru: 'Китай', zh: '中国' }, USA: { en: 'United States', es: 'Estados Unidos', ru: 'США' }, COD: { en: 'DR Congo', es: 'RD del Congo' }, RUS: { en: 'Russia' }, KOR: { en: 'South Korea' }, PRK: { en: 'North Korea' }, GBR: { en: 'United Kingdom' }, CZE: { en: 'Czechia' } };
function countryName(a3) { if (SHORT[a3] && SHORT[a3][LANG]) return SHORT[a3][LANG]; if (!Object.keys(COUNTRY).length && DATA.a0) DATA.a0.objects.r.geometries.forEach(g => COUNTRY[g.properties.c] = g.properties); const p = COUNTRY[a3]; return p ? nm(p) : a3 }

/* ---------- geometría ---------- */
function polys(g) { return !g ? [] : g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [] }
function sphArea(f) { const a = d3.geoArea(f); return a > 2 * Math.PI ? 4 * Math.PI - a : a }
function inRing(p, r) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c } return c }
/* punto interior del trozo mayor (en lon/lat) */
function labelLL(g) {
  let best = null, ba = -1; for (const p of polys(g)) { const a = sphArea({ type: 'Polygon', coordinates: p }); if (a > ba) { ba = a; best = p } }
  if (!best) return null; const r = best[0]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  if (x1 - x0 > 180) return d3.geoCentroid({ type: 'Polygon', coordinates: best });
  const step = Math.max(1, Math.floor(r.length / 150)), vs = r.filter((_, i) => i % step === 0); let bp = [(x0 + x1) / 2, (y0 + y1) / 2], bd = -1;
  for (let i = 1; i < 12; i++) for (let j = 1; j < 12; j++) { const p = [x0 + (x1 - x0) * i / 12, y0 + (y1 - y0) * j / 12]; if (!inRing(p, r) || best.slice(1).some(h => inRing(p, h))) continue;
    let d = 1e18; for (const v of vs) { const q = (v[0] - p[0]) ** 2 + (v[1] - p[1]) ** 2; if (q < d) d = q } if (d > bd) { bd = d; bp = p } }
  return bp }

/* ---------- mapas: trozos, vecinos y fragmentos ----------
   Un trozo separado de un territorio es región propia («fragmento») solo si toca vecinos que la parte principal no toca;
   las astillas diminutas se dibujan en gris y no cuentan. */
const CACHE = {};
function mapData(key) {
  if (CACHE[key]) return CACHE[key];
  const t = DATA[key], src = t.objects.r.geometries, parts = [], owner = [];
  src.forEach((g, o) => { if (g.type === 'MultiPolygon' && g.arcs.length > 1) g.arcs.forEach(a => { parts.push({ type: 'Polygon', arcs: a, properties: g.properties }); owner.push(o) }); else { parts.push(g); owner.push(o) } });
  const pnb = topojson.neighbors(parts), area = parts.map(p => sphArea(topojson.feature(t, p)));
  const groups = new Map(); parts.forEach((p, i) => { if (!groups.has(owner[i])) groups.set(owner[i], []); groups.get(owner[i]).push(i) });
  const rep = parts.map((_, i) => i), find = i => { while (rep[i] !== i) i = rep[i] = rep[rep[i]]; return i };
  const members = parts.map((_, i) => [i]), mainOf = new Map();
  for (const [o, ids] of groups) mainOf.set(o, ids.reduce((a, b) => area[b] > area[a] ? b : a));
  const nset = n => { const s = new Set(); for (const p of members[n]) for (const j of pnb[p]) s.add(find(j)); s.delete(n); return s };
  for (let changed = true; changed;) { changed = false;
    for (const [o, ids] of groups) { if (ids.length < 2) continue; const m = find(mainOf.get(o));
      for (const i of ids) { if (find(i) !== i || i === m) continue; const Ni = nset(i), Nm = nset(m); Ni.delete(m);
        if ([...Ni].every(x => Nm.has(x))) { rep[i] = m; members[m].push(...members[i]); members[i] = []; changed = true } } } }
  const total = area.reduce((a, b) => a + b, 0), geoms = [], shards = [];
  for (const [o, ids] of groups) { const g = src[o];
    if (ids.length === 1) { geoms.push(g); shards.push(null); continue }
    const m = find(mainOf.get(o)), sh = [], mine = [];
    for (const i of ids) { if (find(i) !== i) continue; const arcs = members[i].map(p => parts[p].arcs), a = members[i].reduce((s, p) => s + area[p], 0);
      if (i !== m && a < 0.05 * area[m] && a < 0.0002 * total) { sh.push(...arcs); continue }
      const props = i === m ? g.properties : Object.assign({}, g.properties, { ex: 1 });
      mine.push({ geom: arcs.length > 1 ? { type: 'MultiPolygon', arcs, properties: props } : { type: 'Polygon', arcs: arcs[0], properties: props }, main: i === m }) }
    for (const x of mine) { geoms.push(x.geom); shards.push(x.main && sh.length ? sh : null) } }
  const feats = geoms.map(g => topojson.feature(t, g));
  const nb = topojson.neighbors(geoms).map((a, i) => [...new Set(a)].filter(j => j !== i));
  return CACHE[key] = { key, t, geoms, feats, nb, shards }
}
function centroids(M) { if (!M.cent) M.cent = M.feats.map(f => { const c = d3.geoCentroid(f); return isFinite(c[0]) ? c : [0, 0] }); return M.cent }
function regionName(key, props) { const base = key === 'muni' ? props.n[0].replace(/\/.*/, '') : (key === 'a0' || key === 'w110') && SHORT[props.c] && SHORT[props.c][LANG] ? SHORT[props.c][LANG] : nm(props); return props.ex ? tr('fragment', { x: base }) : base }

/* ---------- solver: Kempe + DSATUR con retroceso ---------- */
function solve(adj, k, fixed, limit, rng) {
  const n = adj.length, col = new Int8Array(n).fill(-1);
  if (fixed) for (let i = 0; i < n; i++) if (fixed[i] >= 0) col[i] = fixed[i];
  for (let i = 0; i < n; i++) if (col[i] >= 0) for (const j of adj[i]) if (col[j] === col[i]) return null;
  const ord = [...Array(k).keys()]; if (rng) for (let i = k - 1; i > 0; i--) { const j = rng() * (i + 1) | 0; [ord[i], ord[j]] = [ord[j], ord[i]] }
  let steps = 0;
  const rec = () => { if (++steps > limit) return false; let r = -1, bs = -1, bd = -1;
    for (let i = 0; i < n; i++) if (col[i] < 0) { let u = 0; for (const j of adj[i]) if (col[j] >= 0) u |= 1 << col[j]; const s = popc(u);
      if (s > bs || (s === bs && adj[i].length > bd)) { bs = s; bd = adj[i].length; r = i } }
    if (r < 0) return true; let used = 0; for (const j of adj[r]) if (col[j] >= 0) used |= 1 << col[j];
    for (const c of ord) { if (used >> c & 1) continue; col[r] = c; if (rec()) return true } col[r] = -1; return false };
  return rec() ? Array.from(col) : null }
function kempe(adj, k, rng) {
  const n = adj.length, deg = adj.map(a => a.length), rem = new Array(n).fill(false), order = [];
  for (let t = 0; t < n; t++) { let v = -1, bd = 1e9; for (let i = 0; i < n; i++) if (!rem[i] && (deg[i] < bd || (deg[i] === bd && rng() < .5))) { bd = deg[i]; v = i } rem[v] = true; order.push(v); for (const j of adj[v]) if (!rem[j]) deg[j]-- }
  const col = new Int8Array(n).fill(-1);
  const free = v => { let u = 0; for (const j of adj[v]) if (col[j] >= 0) u |= 1 << col[j]; for (let c = 0; c < k; c++) if (!(u >> c & 1)) return c; return -1 };
  for (let t = n - 1; t >= 0; t--) { const v = order[t]; let c = free(v);
    if (c < 0) { outer: for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) { if (a === b) continue;
      for (const s of adj[v]) { if (col[s] !== a) continue; const chain = new Set([s]), st = [s];
        while (st.length) { const x = st.pop(); for (const y of adj[x]) { if (chain.has(y) || (col[y] !== a && col[y] !== b)) continue; chain.add(y); st.push(y) } }
        for (const x of chain) col[x] = col[x] === a ? b : a; c = free(v); if (c >= 0) break outer; for (const x of chain) col[x] = col[x] === a ? b : a } } }
    if (c < 0) return null; col[v] = c }
  return Array.from(col) }
const valid = (adj, c) => adj.every((a, i) => c[i] >= 0 && a.every(j => c[j] !== c[i]));
function solveRetry(adj, k, seed) {
  if (k >= 4) for (let a = 0; a < 12; a++) { const s = kempe(adj, k, mulberry(seed + a)); if (s && valid(adj, s)) return s }
  for (let a = 0; a < 6; a++) { const s = solve(adj, k, null, 60000 * (a + 1), mulberry(seed + a)); if (s) return s } return null }

/* ---------- proyección ---------- */
function gridPts(f) { const [a, b, c, d] = f, pts = []; for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) pts.push([a + (c - a) * i / 8, b + (d - b) * j / 8]); return { type: 'MultiPoint', coordinates: pts } }
function makeProjection(spec, fitFeats) {
  const fc = { type: 'FeatureCollection', features: fitFeats };
  let p;
  if (spec.type === 'albersUsa') p = d3.geoAlbersUsa();
  else if (spec.type === 'ne1') p = d3.geoNaturalEarth1();
  else if (spec.type === 'conic') p = d3.geoConicConformal().rotate(spec.rotate).parallels(spec.parallels);
  else { const c = spec.center || d3.geoCentroid(fc); p = d3.geoAzimuthalEqualArea().rotate([-c[0], -c[1]]) }
  if (spec.frame) { p.fitExtent([[0, 0], [1000, 1000]], gridPts(spec.frame)); p.clipExtent([[0, 0], [1000, 1000]]) }
  else if (spec.type === 'ne1') p.fitExtent([[0, 0], [1000, 1000]], { type: 'Sphere' });
  else p.fitExtent([[0, 0], [1000, 1000]], fc);
  return p }

/* ---------- construir un puzle ---------- */
function buildPuzzle({ key, idx, ctx = [], k = 4, locks = 0, seed = 1, proj = {}, title, sub }) {
  const M = mapData(key), pos = new Map(idx.map((g, i) => [g, i]));
  const adj = idx.map(g => M.nb[g].filter(j => pos.has(j)).map(j => pos.get(j)));
  const need = adj.map(a => a.length > 0);
  const isCan = g => { if (proj.inset !== 'can') return false; const c = centroids(M)[g]; return c[0] < -12 && c[1] < 31 };
  const fitIdx = idx.filter((g, i) => need[i] && !isCan(g)); const fitFeats = (fitIdx.length ? fitIdx : idx).map(g => M.feats[g]);
  const P0 = makeProjection(proj, fitFeats), paths = [d3.geoPath(P0)];
  if (proj.inset === 'can') {
    const canF = idx.filter(isCan).map(g => M.feats[g]);
    if (canF.length) { const b0 = paths[0].bounds({ type: 'FeatureCollection', features: fitFeats });
      const pc = d3.geoConicConformal().rotate([15.7, 0]).parallels([27, 29]).scale(P0.scale()).translate([0, 0]);
      const bc = d3.geoPath(pc).bounds({ type: 'FeatureCollection', features: canF });
      pc.translate([b0[0][0] - bc[0][0] + 10, b0[1][1] - bc[1][1] - 10]); paths.push(d3.geoPath(pc)) } }
  const pathOf = g => paths[isCan(g) && paths[1] ? 1 : 0];
  const regions = idx.map((g, i) => { const f = M.feats[g], pg = pathOf(g), b = pg.bounds(f), ll = labelLL(f.geometry);
    let lp = ll && pg.projection()(ll); if (!lp || !isFinite(lp[0])) lp = pg.centroid(f);
    return { g, props: f.properties, d: pg(f) || '', bb: [b[0][0], b[0][1], b[1][0], b[1][1]], lp, pi: pathOf(g) === paths[0] ? 0 : 1 } });
  /* regiones que no llegan a dibujarse (diminutas o fuera del marco): fuera del juego */
  regions.forEach((r, i) => { if (r.d && isFinite(r.bb[0])) return; need[i] = false; adj[i].forEach(j => { adj[j] = adj[j].filter(x => x !== i) }); adj[i] = [] });
  regions.forEach((r, i) => { if (!adj[i].length) need[i] = false });
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  regions.forEach((r, i) => { if (!need[i] && fitIdx.length) return; if (!isFinite(r.bb[0])) return; x0 = Math.min(x0, r.bb[0]); y0 = Math.min(y0, r.bb[1]); x1 = Math.max(x1, r.bb[2]); y1 = Math.max(y1, r.bb[3]) });
  if (proj.inset === 'can') regions.forEach(r => { if (r.pi === 1) { x0 = Math.min(x0, r.bb[0]); y0 = Math.min(y0, r.bb[1]); x1 = Math.max(x1, r.bb[2]); y1 = Math.max(y1, r.bb[3]) } });
  const w = x1 - x0, h = y1 - y0, s = Math.max(w, h) * 1.06, vb = [x0 + w / 2 - s / 2, y0 + h / 2 - s / 2, s, s];
  const ctxR = ctx.map(g => ({ props: M.feats[g].properties, d: pathOf(g)(M.feats[g]) || '' }));
  idx.forEach(g => { if (M.shards[g]) ctxR.push({ props: M.feats[g].properties, shard: 1, d: pathOf(g)(topojson.feature(M.t, { type: 'MultiPolygon', arcs: M.shards[g] })) || '' }) });
  const sol = solveRetry(adj, k, seed);
  const rng = mulberry(seed ^ 0x9e3779b9), locked = new Array(idx.length).fill(-1);
  const cand = [...Array(idx.length).keys()].filter(i => need[i]);
  for (let i = cand.length - 1; i > 0; i--) { const j = rng() * (i + 1) | 0; [cand[i], cand[j]] = [cand[j], cand[i]] }
  for (let i = 0; i < Math.min(locks, cand.length - 1); i++) locked[cand[i]] = sol[cand[i]];
  return { key, idx, regions, adj, need, ctx: ctxR, vb, k, sol, locked, paths, title, sub } }

/* ---------- comarcas: una región y sus vecinas más cercanas ---------- */
function clusterAround(key, gi, size) {
  const M = mapData(key), C = centroids(M), c0 = C[gi], seen = new Set([gi]), out = [gi]; let front = [...M.nb[gi]];
  front.forEach(j => seen.add(j));
  while (out.length < size && front.length) { front.sort((a, b) => d3.geoDistance(C[b], c0) - d3.geoDistance(C[a], c0)); const j = front.pop(); out.push(j);
    for (const q of M.nb[j]) if (!seen.has(q)) { seen.add(q); front.push(q) } }
  const inS = new Set(out), ctx = new Set(); for (const g of out) for (const q of M.nb[g]) if (!inS.has(q)) ctx.add(q);
  return { idx: out, ctx: [...ctx] } }
function aroundPuzzle(key, gi, { size, k, locks, seed }) {
  const M = mapData(key), c = clusterAround(key, gi, size), props = M.feats[gi].properties;
  return buildPuzzle({ key, idx: c.idx, ctx: c.ctx, k, locks, seed,
    title: () => tr('around', { x: regionName(key, props) }),
    sub: () => key === 'a1' ? countryName(props.c) : key === 'a0' ? tr2('countries') : provOf(props.i) }) }
const provOf = id => (DATA.muni && DATA.muni.provNames[String(id).slice(0, 2)] || '').replace(/^([^/]+)\/.*$/, '$1');
const EXTRA = { countries: { es: 'Países', en: 'Countries', ru: 'Страны', zh: '国家' }, world: { es: 'Mundo', en: 'World', ru: 'Мир', zh: '世界' } };
const tr2 = k => EXTRA[k][LANG];

/* ---------- reto diario ---------- */
const LAUNCH = Date.UTC(2026, 9, 6);
const keyOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function dayNumber(key) { const [y, m, d] = key.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, d) - LAUNCH) / 864e5) + 1 }
const DAILY_A1 = ['USA', 'CAN', 'MEX', 'BRA', 'ARG', 'COL', 'PER', 'CHL', 'FRA', 'DEU', 'ITA', 'ESP', 'PRT', 'POL', 'CHE', 'AUT', 'NLD', 'BEL', 'SWE', 'NOR', 'FIN', 'CZE', 'ROU', 'GRC', 'TUR', 'CHN', 'JPN', 'KOR', 'IND', 'IDN', 'AUS', 'ZAF', 'NGA', 'EGY', 'IRN', 'VNM', 'THA', 'KAZ', 'RUS', 'MAR', 'KEN', 'ETH'];
function dailyPuzzle(key) {
  const h = hashStr('cc4w-' + key), rng = mulberry(h), sunday = new Date(key + 'T12:00:00').getDay() === 0;
  const useCountries = !sunday && h % 4 === 0;
  const src = useCountries ? 'a0' : 'a1', M = mapData(src);
  const pool = M.geoms.map((g, i) => i).filter(i => !M.geoms[i].properties.ex && M.nb[i].length >= 3 && (useCountries ? true : DAILY_A1.includes(M.geoms[i].properties.c)));
  for (let a = 0; a < 80; a++) {
    const gi = pool[rng() * pool.length | 0], size = sunday ? 14 + (rng() * 4 | 0) : useCountries ? 14 + (rng() * 6 | 0) : 20 + (rng() * 7 | 0);
    const c = clusterAround(src, gi, size); if (c.idx.length < size) continue;
    if (sunday) { const pos = new Map(c.idx.map((g, i) => [g, i])); const adj = c.idx.map(g => M.nb[g].filter(j => pos.has(j)).map(j => pos.get(j))); if (!solve(adj, 3, null, 40000)) continue }
    return aroundPuzzle(src, gi, { size, k: sunday ? 3 : 4, locks: sunday ? 2 : 3 + (rng() * 2 | 0), seed: h }) }
  return aroundPuzzle('a1', pool[0], { size: 20, k: 4, locks: 3, seed: 1 }) }

/* ---------- carrera ---------- */
const NAMES = {
  sam: { es: 'Sudamérica', en: 'South America', ru: 'Южная Америка', zh: '南美洲' },
  ccaa: { es: 'Comunidades autónomas', en: 'Regions of Spain', ru: 'Автономные сообщества Испании', zh: '西班牙自治区' },
  eur: { es: 'Europa', en: 'Europe', ru: 'Европа', zh: '欧洲' },
  balk: { es: 'Balcanes', en: 'The Balkans', ru: 'Балканы', zh: '巴尔干' },
  itr: { es: 'Regiones de Italia', en: 'Regions of Italy', ru: 'Области Италии', zh: '意大利各大区' },
  fra: { es: 'Departamentos de Francia', en: 'Departments of France', ru: 'Департаменты Франции', zh: '法国各省' },
  asi: { es: 'Asia', en: 'Asia', ru: 'Азия', zh: '亚洲' },
  afr: { es: 'África', en: 'Africa', ru: 'Африка', zh: '非洲' },
  esp: { es: 'Provincias de España', en: 'Provinces of Spain', ru: 'Провинции Испании', zh: '西班牙各省' },
  m12: { es: 'Castelló, municipio a municipio', en: 'Castellón, town by town', ru: 'Кастельон по муниципалитетам', zh: '卡斯特利翁各市镇' },
  m03: { es: 'Alacant, municipio a municipio', en: 'Alicante, town by town', ru: 'Аликанте по муниципалитетам', zh: '阿利坎特各市镇' },
  m46: { es: 'València, municipio a municipio', en: 'Valencia, town by town', ru: 'Валенсия по муниципалитетам', zh: '巴伦西亚各市镇' },
  wld: { es: 'El mundo entero', en: 'The whole world', ru: 'Весь мир', zh: '全世界' }
};
const a1 = (c, extra) => ({ key: 'a1', sel: p => p.c === c && (!extra || extra(p)) });
const LV = (id, ch, src, opt = {}) => Object.assign({ id, ch, locks: 0, proj: {} }, src, opt);
const CHAPTERS = [
  { id: 'first', levels: [
    LV('sam', 'first', { key: 'a0', sel: p => p.ct === 'South America' }, { locks: 0 }),
    LV('ccaa', 'first', { key: 'grp', sel: p => p.g === 'ccaa' }, { locks: 1, proj: { inset: 'can' } }),
    LV('deu', 'first', a1('DEU'), { locks: 1, country: 'DEU' }),
    LV('aus', 'first', a1('AUS', p => !/Macquarie|Lord Howe/.test(p.n[0])), { locks: 1, country: 'AUS' })] },
  { id: 'europe', levels: [
    LV('eur', 'europe', { key: 'a0', sel: p => (p.ct === 'Europe' || ['TUR', 'CYP', 'CYN', 'GEO', 'ARM', 'AZE'].includes(p.c)) }, { locks: 3, proj: { type: 'conic', rotate: [-12, 0], parallels: [40, 62], frame: [-25, 34, 48, 71.5] } }),
    LV('itr', 'europe', { key: 'grp', sel: p => p.g === 'itr' }, { locks: 2 }),
    LV('che', 'europe', a1('CHE'), { locks: 3, country: 'CHE' }),
    LV('pol', 'europe', a1('POL'), { locks: 2, country: 'POL' }),
    LV('balk', 'europe', { key: 'a0', sel: p => ['SVN', 'HRV', 'BIH', 'SRB', 'MNE', 'KOS', 'ALB', 'MKD', 'GRC', 'BGR', 'ROU', 'MDA', 'HUN', 'AUT', 'SVK', 'UKR', 'TUR', 'ITA', 'SMR', 'VAT'].includes(p.c) }, { locks: 2, proj: { type: 'conic', rotate: [-21, 0], parallels: [38, 46], frame: [12, 36, 30.5, 48.6] } }),
    LV('fra', 'europe', a1('FRA', p => !p.o), { locks: 5 })] },
  { id: 'americas', levels: [
    LV('usa', 'americas', a1('USA'), { locks: 3, country: 'USA', proj: { type: 'albersUsa' } }),
    LV('mex', 'americas', a1('MEX'), { locks: 3, country: 'MEX' }),
    LV('can', 'americas', a1('CAN'), { locks: 2, country: 'CAN', proj: { type: 'conic', rotate: [96, 0], parallels: [49, 77] } }),
    LV('bra', 'americas', a1('BRA'), { locks: 3, country: 'BRA' }),
    LV('arg', 'americas', a1('ARG'), { locks: 3, country: 'ARG' }),
    LV('col', 'americas', a1('COL'), { locks: 3, country: 'COL' })] },
  { id: 'asia', levels: [
    LV('jpn', 'asia', a1('JPN'), { locks: 3, country: 'JPN' }),
    LV('kor', 'asia', a1('KOR'), { locks: 1, country: 'KOR' }),
    LV('chn', 'asia', a1('CHN', p => !/Paracel/.test(p.n[0])), { locks: 3, country: 'CHN' }),
    LV('ind', 'asia', a1('IND'), { locks: 3, country: 'IND' }),
    LV('asi', 'asia', { key: 'a0', sel: p => p.ct === 'Asia' || p.c === 'RUS' }, { locks: 4, proj: { type: 'conic', rotate: [-90, 0], parallels: [10, 50], frame: [25, -11, 150, 56] } }),
    LV('rus', 'asia', a1('RUS'), { locks: 4, country: 'RUS', proj: { type: 'conic', rotate: [-100, 0], parallels: [52, 68] } })] },
  { id: 'africa', levels: [
    LV('zaf', 'africa', a1('ZAF'), { locks: 1, country: 'ZAF' }),
    LV('afr', 'africa', { key: 'a0', sel: p => p.ct === 'Africa' }, { locks: 4 }),
    LV('nga', 'africa', a1('NGA'), { locks: 3, country: 'NGA' }),
    LV('tur', 'africa', a1('TUR'), { locks: 4, country: 'TUR' })] },
  { id: 'spain', levels: [
    LV('esp', 'spain', a1('ESP'), { locks: 2, proj: { inset: 'can' } }),
    LV('m12', 'spain', { key: 'muni', sel: p => String(p.i).startsWith('12') }, { locks: 5 }),
    LV('m03', 'spain', { key: 'muni', sel: p => String(p.i).startsWith('03') }, { locks: 6 }),
    LV('m46', 'spain', { key: 'muni', sel: p => String(p.i).startsWith('46') }, { locks: 8 })] },
  { id: 'world', levels: [
    LV('wld', 'world', { key: 'w110', sel: p => p.ct !== 'Antarctica' && p.ct !== 'Seven seas (open ocean)' }, { locks: 8, proj: { type: 'ne1' } })] }];
const LEVELS = CHAPTERS.flatMap(c => c.levels);
function levelName(L) { if (NAMES[L.id]) return NAMES[L.id][LANG]; if (L.country && DATA.a0) return countryName(L.country); return L.id }

/* ---------- estado y vista ---------- */
let game = null, sel = 0, vb = [0, 0, 1000, 1000], base = [0, 0, 1000, 1000], findPos = -1;
const svg = $('#map'), EMO = ['🟥', '🟨', '🟦', '🟪'];
const rName = i => regionName(game.key, game.regions[i].props);
const tval = v => typeof v === 'function' ? v() : v || '';

function start(P, mode, extra) {
  game = Object.assign({ mode }, extra, P, { colors: P.locked.slice(), hist: [], errors: 0, hints: 0, start: 0, elapsed: 0, done: false });
  game.needN = game.need.filter(Boolean).length;
  game.par = Math.round(20 + game.needN * 3.2 + (P.k === 3 ? 20 : 0));
  findPos = -1; sel = Math.min(sel, P.k - 1);
  renderMap(); buildPalette(); $('#win').hidden = true; updateHud(); $('#toast').classList.add('off'); renderGameTexts();
  if (mode === 'daily') { const r = store.get('daily', {})[game.dkey]; if (r) showDailyDone(r) } }
function renderGameTexts() { if (!game) return;
  const title = tval(game.title); $('#mTitle').textContent = game.mode === 'daily' ? '#' + dayNumber(game.dkey) + ' · ' + title : title;
  $('#mSub').textContent = [tval(game.sub), tr('regionsInks', { n: game.needN, k: game.k })].filter(Boolean).join(' · ');
  $('#hPar').textContent = fmt(game.par); setInfoDefault(); updateFind() }
function setInfoDefault() { $('#info').innerHTML = '<b></b><span></span>'; $('#info b').textContent = tr('tapRegion'); $('#info span').textContent = tr('zoomHint') }
function renderMap() {
  const gC = $('#gCtx'), gR = $('#gReg'); gC.innerHTML = ''; gR.innerHTML = ''; $('#gClash').innerHTML = '';
  game.ctx.forEach(c => { const p = el('path', { d: c.d, class: 'ctx' }); p._ctx = c; gC.appendChild(p) });
  game.paths_ = game.regions.map((r, i) => { const p = el('path', { d: r.d, class: 'rg' + (game.need[i] ? '' : ' iso') }); p.dataset.r = i; gR.appendChild(p); return p });
  base = game.vb.slice(); vb = base.slice(); applyVB(); paintAll() }
function missing() { return game.regions.map((_, i) => i).filter(i => game.need[i] && game.colors[i] < 0) }
function clashes() { const out = []; game.adj.forEach((a, i) => a.forEach(j => { if (j > i && game.colors[i] >= 0 && game.colors[i] === game.colors[j]) out.push([i, j]) })); return out }
function paintAll() { const miss = missing(), few = miss.length > 0 && miss.length <= 5;
  game.paths_.forEach((p, i) => { const c = game.colors[i]; if (c >= 0) p.dataset.c = c; else delete p.dataset.c; p.classList.toggle('miss', few && game.need[i] && c < 0) });
  drawClash(); drawMarkers(); buildPaletteState(); updateFind(miss) }
function updateFind(miss) { const b = $('#bFind'); if (!b || !game) return; miss = miss || missing();
  if (game.done) { b.textContent = tr('completed'); b.disabled = true; b.classList.remove('bad'); return } b.disabled = false;
  if (miss.length) { b.textContent = tr('missing', { n: miss.length }); b.classList.remove('bad') }
  else { const c = clashes().length; b.textContent = tr('clashes', { n: c }); b.classList.add('bad') } }
function findNext() { if (!game || game.done) return; const miss = missing(); let r, msg;
  if (miss.length) { findPos = (findPos + 1) % miss.length; r = miss[findPos]; msg = tr('unpainted', { x: rName(r) }) + (miss.length > 1 ? tr('ofN', { i: findPos + 1, n: miss.length }) : '') }
  else { const cl = clashes(); if (!cl.length) return; findPos = (findPos + 1) % cl.length; const [a, b] = cl[findPos]; r = a; msg = tr('clashMsg', { a: rName(a), b: rName(b) }) }
  zoomTo(r); const p = game.paths_[r]; p.classList.add('target'); setTimeout(() => p.classList.remove('target'), 1600); showInfo(r); toast(msg) }
function zoomTo(r) { const b = game.regions[r].bb, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, sz = Math.max(b[2] - b[0], b[3] - b[1]);
  const px = sz * pxPerUnit(), inView = cx > vb[0] && cx < vb[0] + vb[2] && cy > vb[1] && cy < vb[1] + vb[3];
  if (inView && px >= 24) return; const w = Math.min(base[2], Math.max(sz * 5, base[2] / 30)); vb = [cx - w / 2, cy - w / 2, w, w]; clampVB(); applyVB() }
function applyVB() { svg.setAttribute('viewBox', vb.map(R2).join(' ')); drawMarkers() }
function pxPerUnit() { return svg.clientWidth / vb[2] || 1 }
function drawMarkers() { if (!game) return; const g = $('#gMk'); g.innerHTML = ''; const k = 1 / pxPerUnit();
  game.regions.forEach((r, i) => { if (!isFinite(r.bb[0])) return; const sz = Math.max(r.bb[2] - r.bb[0], r.bb[3] - r.bb[1]) / k, tiny = sz < 9 && game.need[i];
    if (tiny) { const c = game.colors[i]; const m = el('circle', { cx: (r.bb[0] + r.bb[2]) / 2, cy: (r.bb[1] + r.bb[3]) / 2, r: 8 * k, class: 'mk ' + (c >= 0 ? 'f' + c : 'fn') }); m.dataset.r = i; g.appendChild(m) }
    if (game.locked[i] >= 0) { const R = Math.min(5.5 * k, Math.max(2.5 * k, sz * k * 0.22)), [x, y] = tiny ? [(r.bb[0] + r.bb[2]) / 2, (r.bb[1] + r.bb[3]) / 2] : r.lp;
      g.appendChild(el('path', { class: 'lock', d: `M${x},${y - R}L${x + R},${y}L${x},${y + R}L${x - R},${y}Z` })) } });
  const miss = missing(); if (miss.length && miss.length <= 5) miss.forEach(i => { const r = game.regions[i], sz = Math.max(r.bb[2] - r.bb[0], r.bb[3] - r.bb[1]);
    g.appendChild(el('circle', { class: 'ring', cx: (r.bb[0] + r.bb[2]) / 2, cy: (r.bb[1] + r.bb[3]) / 2, r: Math.max(sz * 0.75, 16 * k) })) }) }
const clashCache = new Map();
function clashD(i, j) { const key = game.key + ':' + game.regions[i].g + '-' + game.regions[j].g; if (clashCache.has(key)) return clashCache.get(key);
  const M = mapData(game.key), a = M.geoms[game.idx[i]], b = M.geoms[game.idx[j]];
  const d = game.paths[game.regions[i].pi](topojson.mesh(M.t, { type: 'GeometryCollection', geometries: [a, b] }, (x, y) => x !== y)) || ''; clashCache.set(key, d); return d }
function drawClash() { const g = $('#gClash'); g.innerHTML = ''; clashes().forEach(([i, j]) => g.appendChild(el('path', { d: clashD(i, j), class: 'clash' }))) }
function buildPalette() { const pal = $('#palette'); pal.innerHTML = '';
  for (let c = 0; c < game.k; c++) { const b = document.createElement('button'); b.className = 'sw'; b.id = 'sw' + c; b.style.background = 'var(--c' + c + ')'; b.setAttribute('aria-label', '#' + (c + 1)); b.innerHTML = '<span>0</span>';
    b.onclick = () => { sel = c; buildPaletteState() }; pal.appendChild(b) } buildPaletteState() }
function buildPaletteState() { for (let c = 0; c < game.k; c++) { const b = $('#sw' + c); if (!b) continue; b.setAttribute('aria-pressed', c === sel); b.firstChild.textContent = game.colors.filter(x => x === c).length } }
function updateHud() { const t = game.done ? game.elapsed : (game.start ? (Date.now() - game.start) / 1000 : 0);
  $('#hTime').textContent = fmt(t); $('#hReg').textContent = game.colors.filter((c, i) => c >= 0 && game.need[i]).length + '/' + game.needN; $('#hErr').textContent = game.errors }
setInterval(() => { if (game && game.start && !game.done) updateHud() }, 250);
let toastT; function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('off'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add('off'), 1800) }
function showInfo(i) { const n = game.adj[i].length; $('#info').innerHTML = '<b></b><span></span>'; $('#info b').textContent = rName(i); $('#info span').textContent = n ? tr('neighbors', { n }) : tr('noNeighbors') }
function showCtxInfo(c) { $('#info').innerHTML = '<b></b><span></span>'; const nmx = regionName(game.key, c.props); $('#info b').textContent = c.shard ? tr('shard', { x: nmx }) : nmx; $('#info span').textContent = tr('outside') }

function paint(r) {
  if (game.done) return; showInfo(r);
  if (game.locked[r] >= 0) { toast(tr('printed', { x: rName(r) })); return }
  if (!game.start) game.start = Date.now();
  const prev = game.colors[r], nv = prev === sel ? -1 : sel; game.hist.push([r, prev]); game.colors[r] = nv;
  const bad = nv >= 0 ? game.adj[r].filter(j => game.colors[j] === nv) : [];
  if (bad.length) { game.errors++; toast(tr('clashMsg', { a: rName(r), b: rName(bad[0]) })); try { navigator.vibrate && navigator.vibrate(40) } catch (e) {} }
  paintAll(); updateHud(); checkWin() }
function checkWin() { const g = game; if (g.colors.some((c, i) => c < 0 && g.need[i])) return;
  const cl = clashes(); if (cl.length) { toast(tr('allButClash', { n: cl.length })); return }
  g.done = true; g.elapsed = (Date.now() - g.start) / 1000; updateHud(); updateFind();
  const s1 = g.errors === 0 && g.hints === 0, s2 = g.elapsed <= g.par, stars = 1 + (s1 ? 1 : 0) + (s2 ? 1 : 0);
  if (g.mode === 'career') { const st = store.get('career', {}); st[g.lid] = Math.max(st[g.lid] || 0, stars); store.set('career', st); showCareerWin(stars, s1, s2) }
  else if (g.mode === 'region') showRegionWin(stars, s1, s2);
  else { const all = store.get('daily', {}); if (!all[g.dkey]) {
      const sk = store.get('streak', { last: null, count: 0 }), y = new Date(); y.setDate(y.getDate() - 1);
      sk.count = sk.last === keyOf(y) ? sk.count + 1 : 1; sk.last = g.dkey; store.set('streak', sk);
      all[g.dkey] = { time: g.elapsed, errors: g.errors, hints: g.hints, stars, mosaic: mosaic(), streak: sk.count }; store.set('daily', all) }
    showDailyDone(all[g.dkey]) } }

function mosaic() { const N = 8, S = 64, cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d');
  const sc = S / base[2]; c.setTransform(sc, 0, 0, sc, -base[0] * sc, -base[1] * sc); const RGB = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
  game.regions.forEach((r, i) => { if (game.colors[i] < 0 || !r.d) return; c.fillStyle = RGB[game.colors[i]]; c.fill(new Path2D(r.d)) });
  const px = c.getImageData(0, 0, S, S).data, rows = [];
  for (let by = 0; by < N; by++) { let row = ''; for (let bx = 0; bx < N; bx++) { const cnt = [0, 0, 0, 0]; let any = 0;
    for (let y = by * 8; y < by * 8 + 8; y++) for (let x = bx * 8; x < bx * 8 + 8; x++) { const o = (y * S + x) * 4; if (px[o + 3] < 128) continue; any++;
      const r = px[o], g = px[o + 1]; cnt[r > 128 && g > 128 ? 3 : r > 128 ? 0 : g > 128 ? 1 : 2]++ }
    row += any < 16 ? '⬜' : EMO[cnt.indexOf(Math.max(...cnt))] } rows.push(row) }
  while (rows.length && /^(⬜)+$/.test(rows[0])) rows.shift(); while (rows.length && /^(⬜)+$/.test(rows[rows.length - 1])) rows.pop();
  return rows.join('\n') }
const starsHtml = n => '★'.repeat(n) + '<i>' + '★'.repeat(3 - n) + '</i>';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const whyList = (s1, s2) => '<ul class="why"><li>' + tr('why1') + ' ✓</li><li>' + tr('why2') + ' ' + (s1 ? '✓' : '✗') + '</li><li>' + tr('why3') + ' ' + (s2 ? '✓' : '✗') + '</li></ul>';
function card(html) { const w = $('#win'); w.hidden = false; w.innerHTML = '<div class="card">' + html + '</div>'; return w }
const stats = (t, e, h) => tr('statsLine', { t: fmt(t), e, h });
function shareLink(hash) { if (/claude|anthropic/.test(location.host) || !/^https?:/.test(location.protocol)) return ''; return '\n' + location.origin + location.pathname + (hash || '') }
function share(t) { const fb = () => { const box = $('#wFall'); box.innerHTML = '<textarea class="share-fallback" id="shTxt" readonly></textarea>'; const ta = $('#shTxt'); ta.value = t; ta.select() };
  try { navigator.clipboard.writeText(t).then(() => toast(tr('copied')), fb) } catch (e) { fb() } }
function showCareerWin(stars, s1, s2) { const L = LEVELS.findIndex(l => l.id === game.lid), ch = CHAPTERS.find(c => c.id === LEVELS[L].ch), k = ch.levels.findIndex(l => l.id === game.lid), nx = ch.levels[k + 1];
  card('<h2>' + esc(levelName(LEVELS[L])) + '</h2><div class="stars">' + starsHtml(stars) + '</div><div class="stats">' + stats(game.elapsed, game.errors, game.hints) + '</div>' + whyList(s1, s2) +
    '<div class="row"><button class="btn" id="wSee">' + tr('seeMap') + '</button><button class="btn" id="wAgain">' + tr('again') + '</button>' + (nx ? '<button class="btn pri" id="wNext">' + esc(tr('next', { x: levelName(nx) })) + '</button>' : '<button class="btn pri" id="wMenu">' + tr('seeCareer') + '</button>') + '</div>');
  $('#wSee').onclick = () => $('#win').hidden = true; $('#wAgain').onclick = () => playLevel(LEVELS[L].id);
  if (nx) $('#wNext').onclick = () => playLevel(nx.id); else $('#wMenu').onclick = () => setTab('career') }
function showRegionWin(stars, s1, s2) {
  card('<h2>' + esc(tval(game.title)) + '</h2><div class="stars">' + starsHtml(stars) + '</div><div class="stats">' + stats(game.elapsed, game.errors, game.hints) + '</div>' +
    '<div class="row"><button class="btn pri" id="wShare">' + tr('shareShort') + '</button><button class="btn" id="wSee">' + tr('seeMap') + '</button><button class="btn" id="wMenu">' + tr('another') + '</button></div><div id="wFall"></div>');
  const t = tr('game') + ' · ' + tval(game.title) + ' (' + tval(game.sub) + ')\n' + mosaic() + '\n⏱ ' + fmt(game.elapsed) + ' · ❌ ' + game.errors + ' · 💡 ' + game.hints + '\n' + tr('shareAskRegion') + shareLink(game.hash);
  $('#wShare').onclick = () => share(t); $('#wSee').onclick = () => $('#win').hidden = true; $('#wMenu').onclick = () => { showCover(); setTimeout(() => $('#cTown').focus(), 50) } }
function showDailyDone(r) {
  card('<h2>' + esc(tr('dayTitle', { n: dayNumber(game.dkey), x: tval(game.title) })) + '</h2><div class="stars">' + starsHtml(r.stars) + '</div><div class="stats">' + stats(r.time, r.errors, r.hints) + ' · ' + tr('streak', { n: r.streak }) + '</div>' +
    '<div class="row"><button class="btn pri" id="wShare">' + tr('share') + '</button><button class="btn" id="wSee">' + tr('seeMap') + '</button></div><div id="wFall"></div><div class="next" id="wNextDay"></div><div class="row"><button class="btn" id="wReg">' + tr('regionKick') + '</button></div>');
  const t = tr('game') + ' · ' + tr('dayTitle', { n: dayNumber(game.dkey), x: tval(game.title) }) + ' (' + tval(game.sub) + ')\n' + r.mosaic + '\n⏱ ' + fmt(r.time) + ' · ❌ ' + r.errors + ' · 💡 ' + r.hints + '\n' + '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars) + ' · ' + tr('streak', { n: r.streak }) + '\n' + tr('shareAsk') + shareLink('');
  $('#wShare').onclick = () => share(t); $('#wSee').onclick = () => { $('#win').hidden = true; game.done = true; updateFind() };
  $('#wReg').onclick = () => { showCover(); setTimeout(() => $('#cTown').focus(), 50) }; tickNext() }
function tickNext() { const e = $('#wNextDay'); if (!e) return; const n = new Date(), t = new Date(n); t.setHours(24, 0, 0, 0); const s = (t - n) / 1000 | 0;
  e.textContent = tr('newMapIn', { t: String(s / 3600 | 0).padStart(2, '0') + ':' + String((s % 3600) / 60 | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0') }) }
setInterval(tickNext, 1000);

$('#bFind').onclick = findNext; $('#hRegBox').onclick = findNext;
$('#bUndo').onclick = () => { if (!game || game.done || !game.hist.length) return; const [r, p] = game.hist.pop(); game.colors[r] = p; paintAll(); updateHud() };
$('#bReset').onclick = () => { if (!game || game.done) return; game.colors = game.locked.slice(); game.hist = []; paintAll(); updateHud() };
$('#bHint').onclick = () => { if (!game || game.done) return; const g = game, n = g.regions.length;
  const fixed = g.colors.map((c, i) => c >= 0 && !g.adj[i].some(j => g.colors[j] === c) ? c : -1);
  let sol = solve(g.adj, g.k, fixed, 60000), r = -1, msg;
  if (sol) { const free = []; for (let i = 0; i < n; i++) if (g.need[i] && g.colors[i] < 0) free.push(i); r = free.sort((a, b) => g.adj[b].length - g.adj[a].length)[0]; if (r == null) return; msg = tr('hintMsg', { x: rName(r) }) }
  else { sol = g.sol; for (let i = 0; i < n; i++) if (g.colors[i] >= 0 && g.colors[i] !== sol[i] && g.locked[i] < 0) { r = i; break }
    if (r < 0) for (let i = 0; i < n; i++) if (g.colors[i] !== sol[i]) { r = i; break } msg = tr('deadEnd', { x: rName(r) }) }
  if (!g.start) g.start = Date.now(); g.hints++; g.hist.push([r, g.colors[r]]); g.colors[r] = sol[r];
  const p = g.paths_[r]; p.classList.add('flash', 'hl'); setTimeout(() => p.classList.remove('flash', 'hl'), 1400);
  zoomTo(r); toast(msg); paintAll(); updateHud(); checkWin() };
document.addEventListener('keydown', e => { if (!game || $('#vPlay').hidden || e.target.tagName === 'INPUT') return; const n = +e.key; if (n >= 1 && n <= game.k) { sel = n - 1; buildPaletteState() }
  if (e.key === 'z' || e.key === 'u') $('#bUndo').click() });

/* ---------- zoom, arrastre y toque ---------- */
function clampVB() { const minW = base[2] / 60; vb[2] = Math.min(base[2], Math.max(minW, vb[2])); vb[3] = vb[2];
  vb[0] = Math.min(base[0] + base[2] - vb[2] * 0.5, Math.max(base[0] - vb[2] * 0.5, vb[0])); vb[1] = Math.min(base[1] + base[3] - vb[3] * 0.5, Math.max(base[1] - vb[3] * 0.5, vb[1]));
  if (vb[2] >= base[2]) vb = base.slice() }
function zoomAt(f, cx, cy) { const nw = vb[2] / f; vb = [cx - (cx - vb[0]) * nw / vb[2], cy - (cy - vb[1]) * nw / vb[2], nw, nw]; clampVB(); applyVB() }
function toUnits(e) { const r = svg.getBoundingClientRect(); return [vb[0] + (e.clientX - r.left) / r.width * vb[2], vb[1] + (e.clientY - r.top) / r.height * vb[3]] }
$('#zIn').onclick = () => zoomAt(1.8, vb[0] + vb[2] / 2, vb[1] + vb[3] / 2);
$('#zOut').onclick = () => zoomAt(1 / 1.8, vb[0] + vb[2] / 2, vb[1] + vb[3] / 2);
$('#zFit').onclick = () => { vb = base.slice(); applyVB() };
svg.addEventListener('wheel', e => { e.preventDefault(); const [u, v] = toUnits(e); zoomAt(Math.exp(-e.deltaY * 0.0015), u, v) }, { passive: false });
const ptrs = new Map(); let drag = null;
svg.addEventListener('pointerdown', e => { svg.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) drag = { x: e.clientX, y: e.clientY, vb: vb.slice(), moved: false, target: e.target };
  else if (drag) { drag.moved = true; const [a, b] = [...ptrs.values()]; drag.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), vb: vb.slice(), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 } } });
svg.addEventListener('pointermove', e => {
  if (!drag) { if (e.pointerType === 'mouse' && game) { const t = e.target; if (t.dataset && t.dataset.r != null) showInfo(+t.dataset.r); else if (t._ctx) showCtxInfo(t._ctx) } return }
  if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); const r = svg.getBoundingClientRect(), k = drag.vb[2] / r.width;
  if (ptrs.size >= 2 && drag.pinch) { const [a, b] = [...ptrs.values()], P = drag.pinch, d = Math.hypot(a.x - b.x, a.y - b.y), f = d / P.d;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, ux = P.vb[0] + (P.mx - r.left) / r.width * P.vb[2], uy = P.vb[1] + (P.my - r.top) / r.height * P.vb[3], nw = P.vb[2] / f;
    vb = [ux - (mx - r.left) / r.width * nw, uy - (my - r.top) / r.height * nw, nw, nw]; clampVB(); applyVB(); return }
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 7) drag.moved = true;
  if (drag.moved && drag.vb[2] < base[2]) { vb = [drag.vb[0] - dx * k, drag.vb[1] - dy * k, drag.vb[2], drag.vb[3]]; clampVB(); applyVB() } });
function endPtr(e) { if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId);
  if (ptrs.size === 0 && drag) { if (!drag.moved && game) { const t = drag.target; if (t.dataset && t.dataset.r != null) paint(+t.dataset.r); else if (t._ctx) showCtxInfo(t._ctx) } drag = null }
  else if (ptrs.size === 1 && drag) { const [a] = [...ptrs.values()]; drag = { x: a.x, y: a.y, vb: vb.slice(), moved: true, target: svg } } }
svg.addEventListener('pointerup', endPtr); svg.addEventListener('pointercancel', endPtr);
new ResizeObserver(() => drawMarkers()).observe($('#board'));

/* ---------- jugar ---------- */
async function playLevel(id) { const L = LEVELS.find(l => l.id === id); await loadWorld(); if (L.key === 'muni') await loadMuni();
  const M = mapData(L.key), idx = M.geoms.map((g, i) => i).filter(i => L.sel(M.geoms[i].properties));
  const P = buildPuzzle({ key: L.key, idx, k: 4, locks: L.locks, seed: hashStr(L.id), proj: L.proj, title: () => levelName(L), sub: () => tr('ch')[L.ch][0] });
  showTab('play', 'career'); start(P, 'career', { lid: id }) }
async function playDaily() { await loadWorld(); const key = keyOf(new Date()); showTab('play', 'daily'); start(dailyPuzzle(key), 'daily', { dkey: key }) }
async function playRegion(key, gi) { await loadWorld(); if (key === 'muni') await loadMuni(); const M = mapData(key), p = M.geoms[gi].properties;
  const hash = key === 'muni' ? '#m' + p.i : key === 'a0' ? '#' + p.c : '#' + p.k;
  const P = aroundPuzzle(key, gi, { size: key === 'a0' ? 16 : 24, k: 4, locks: 3, seed: hashStr('reg' + hash) });
  showTab('play', ''); start(P, 'region', { hash }); try { history.replaceState(null, '', hash) } catch (e) {} }

/* ---------- buscador de regiones ---------- */
let INDEX = null;
function buildIndex() { if (INDEX && (INDEX.muni || !DATA.muni)) return INDEX; const list = [];
  for (const key of ['a0', 'a1']) { const M = mapData(key); M.geoms.forEach((g, i) => { if (g.properties.ex) return; if (key === 'a1' && !M.nb[i].length) return;
    list.push({ key, i, keys: [...new Set(g.properties.n.map(norm))], c: g.properties.c }) }) }
  if (DATA.muni) { const M = mapData('muni'); M.geoms.forEach((g, i) => { if (!g.properties.ex) list.push({ key: 'muni', i, keys: [norm(g.properties.n[0]).replace(/\/.*/, '')], muni: 1 }) }) }
  return INDEX = { list, muni: !!DATA.muni } }
function searchPlaces(q) { const nq = norm(q.trim()); if (nq.length < 2) return []; const I = buildIndex().list, exact = [], pre = [], sub = [];
  for (const e of I) { let best = 9; for (const k of e.keys) { if (k === nq) best = Math.min(best, 0); else if (k.startsWith(nq)) best = Math.min(best, 1); else if (nq.length > 2 && k.includes(nq)) best = Math.min(best, 2) }
    if (best === 0) exact.push(e); else if (best === 1) pre.push(e); else if (best === 2) sub.push(e); if (exact.length > 8) break }
  const rank = e => e.key === 'a0' ? 0 : e.key === 'a1' ? 1 : 2;
  return [...exact.sort((a, b) => rank(a) - rank(b)), ...pre.sort((a, b) => rank(a) - rank(b)), ...sub].slice(0, 8) }
function placeLabel(e) { const M = mapData(e.key), p = M.geoms[e.i].properties;
  if (e.key === 'a0') return [nm(p), tr2('countries')]; if (e.key === 'a1') return [nm(p), countryName(p.c)]; return [p.n[0].replace(/\/.*/, ''), provOf(p.i) + ' · ' + tr('municipality')] }
let suggState = { items: [], on: 0 };
function renderSugg() { const box = $('#cSugg'), q = $('#cTown').value; if (!DATA.a1) { box.hidden = true; return }
  const items = searchPlaces(q); suggState = { items, on: 0 }; if (!items.length) { box.hidden = true; return }
  box.innerHTML = ''; items.forEach((e, k) => { const [a, b] = placeLabel(e), bt = document.createElement('button'); bt.type = 'button'; if (k === 0) bt.className = 'on';
    bt.innerHTML = '<span></span><small></small>'; bt.firstChild.textContent = a; bt.lastChild.textContent = b; bt.onmousedown = ev => ev.preventDefault(); bt.onclick = () => pickPlace(e); box.appendChild(bt) });
  box.hidden = false }
function pickPlace(e) { $('#cSugg').hidden = true; playRegion(e.key, e.i) }
function goSearch() { const it = suggState.items[suggState.on] || searchPlaces($('#cTown').value)[0]; const inp = $('#cTown');
  if (!it) { inp.setCustomValidity(tr('notFound')); inp.reportValidity(); setTimeout(() => inp.setCustomValidity(''), 1500); return } pickPlace(it) }
$('#cTown').addEventListener('focus', () => { loadWorld().then(() => loadMuni()).then(() => { INDEX = null; if ($('#cTown').value) renderSugg() }) });
$('#cTown').addEventListener('input', renderSugg);
$('#cTown').addEventListener('blur', () => setTimeout(() => $('#cSugg').hidden = true, 150));
$('#cTown').addEventListener('keydown', e => { const n = suggState.items.length;
  if (e.key === 'ArrowDown' && n) { suggState.on = (suggState.on + 1) % n; e.preventDefault() } else if (e.key === 'ArrowUp' && n) { suggState.on = (suggState.on - 1 + n) % n; e.preventDefault() }
  else if (e.key === 'Enter') { goSearch(); return } else return; [...$('#cSugg').children].forEach((b, k) => b.classList.toggle('on', k === suggState.on)) });
$('#cTownGo').onclick = goSearch;

/* ---------- carrera ---------- */
function renderCareer() { const st = store.get('career', {}), v = $('#vCareer');
  const total = Object.values(st).reduce((a, b) => a + b, 0);
  let html = '<div class="meta"><span class="t">' + tr('careerTitleFull') + '</span><span class="s">' + tr('careerStars', { s: total, t: LEVELS.length * 3 }) + '</span></div><p class="rules" style="text-align:left">' + tr('careerHelp') + '</p>';
  for (const c of CHAPTERS) { const [cn, cd] = tr('ch')[c.id]; const cs = c.levels.reduce((a, l) => a + (st[l.id] || 0), 0);
    html += '<div class="chapter"><h3>' + esc(cn) + '<small>' + cs + '/' + c.levels.length * 3 + ' ★</small></h3><p>' + esc(cd) + '</p><div class="lv">';
    c.levels.forEach((l, k) => { const s = st[l.id] || 0, prev = c.levels[k - 1], open = !prev || !!st[prev.id];
      html += '<button data-l="' + l.id + '" class="' + (s ? 'done' : '') + '"' + (open ? '' : ' disabled') + '><span>' + esc(levelName(l)) + (open ? '' : '<small class="req">' + esc(tr('needPrev', { x: levelName(prev) })) + '</small>') + '</span><small class="st">' + (s ? '★'.repeat(s) + '<i style="color:var(--line);font-style:normal">' + '★'.repeat(3 - s) + '</i>' : '') + '</small></button>' });
    html += '</div></div>' }
  v.innerHTML = html; v.querySelectorAll('.lv button').forEach(b => b.onclick = () => playLevel(b.dataset.l)) }

/* ---------- portada ---------- */
let plateTimer = null;
function renderCover() {
  renderCoverCards();
  if (!DATA.w110) { loadWorld().then(renderCover); return }
  $('#plateLoading').hidden = true;
  const M = mapData('w110'), idx = M.geoms.map((g, i) => i).filter(i => !/Antarctica|Seven seas/.test(M.geoms[i].properties.ct || ''));
  const pos = new Map(idx.map((g, i) => [g, i])), adj = idx.map(g => M.nb[g].filter(j => pos.has(j)).map(j => pos.get(j))), sol = solveRetry(adj, 4, 7);
  const proj = d3.geoNaturalEarth1().fitExtent([[6, 6], [1894, 994]], { type: 'FeatureCollection', features: idx.map(i => M.feats[i]) }), path = d3.geoPath(proj);
  const sp = $('#plate'); sp.innerHTML = ''; sp.setAttribute('viewBox', '0 0 1900 1000');
  const paths = idx.map(i => { const p = el('path', { d: path(M.feats[i]) || '', class: 'pr' }); const t = el('title', {}); t.textContent = nm(M.feats[i].properties); p.appendChild(t); sp.appendChild(p); return p });
  const startI = Math.max(0, idx.findIndex(i => M.geoms[i].properties.c === 'ESP')), order = [startI], seen = new Set(order);
  for (let h = 0; h < order.length; h++) for (const j of adj[order[h]]) if (!seen.has(j)) { seen.add(j); order.push(j) }
  idx.forEach((_, i) => { if (!seen.has(i)) order.push(i) });
  const total = order.length, cnt = $('#plateCount'); clearInterval(plateTimer);
  const done = () => cnt.textContent = tr('plateDone', { n: total });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { order.forEach(i => paths[i].dataset.c = sol[i]); done(); return }
  let k = Math.floor(total * 0.3); order.slice(0, k).forEach(i => paths[i].dataset.c = sol[i]); cnt.textContent = tr('plateCount', { k, n: total });
  plateTimer = setInterval(() => { if (k >= total) { clearInterval(plateTimer); done(); return } const i = order[k++]; paths[i].dataset.c = sol[i]; cnt.textContent = tr('plateCount', { k, n: total }) }, 45) }
function renderCoverCards() {
  const key = keyOf(new Date()), r = store.get('daily', {})[key];
  $('#cdKick').textContent = tr('dailyKick', { n: dayNumber(key) }) + (new Date().getDay() === 0 ? ' · ' + tr('sunday') : '');
  $('#cdCta').textContent = r ? tr('seeResult') : tr('play');
  if (DATA.a1) { let P = null; try { P = dailyPuzzle(key) } catch (e) {}
    if (P) { $('#cdTitle').textContent = tval(P.title); $('#cdSub').textContent = r ? tr('dailyDone', { stars: '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars), t: fmt(r.time), s: r.streak }) : tr('dailySub', { sub: tval(P.sub), n: tr('regionsInks', { n: P.need.filter(Boolean).length, k: P.k }) }) } }
  else { $('#cdTitle').textContent = '…'; $('#cdSub').textContent = tr('loading') }
  const st = store.get('career', {}), stars = Object.values(st).reduce((a, b) => a + b, 0);
  $('#ccTitle').textContent = tr('careerTitle', { n: LEVELS.length });
  $('#ccStars').textContent = stars ? tr('careerStars', { s: stars, t: LEVELS.length * 3 }) : tr('careerDesc') }
$('#mDaily').onclick = () => setTab('daily'); $('#mCareer').onclick = () => setTab('career'); $('#mTheory').onclick = () => setTab('theory');
function showCover() { showTab('cover', ''); renderCover(); window.scrollTo(0, 0); try { history.replaceState(null, '', location.pathname) } catch (e) {} }

/* ---------- pestañas e idioma ---------- */
function showTab(view, tab) { $('#vCover').hidden = view !== 'cover'; $('#hdr').hidden = view === 'cover'; if (view !== 'cover') clearInterval(plateTimer);
  $('#vPlay').hidden = view !== 'play'; $('#vCareer').hidden = view !== 'career'; $('#vTheory').hidden = view !== 'theory';
  for (const [id, t] of [['tDaily', 'daily'], ['tCareer', 'career'], ['tTheory', 'theory']]) $('#' + id).setAttribute('aria-pressed', tab === t);
  if (view === 'play') requestAnimationFrame(drawMarkers) }
function setTab(t) { if (t === 'daily') playDaily(); else if (t === 'career') { showTab('career', 'career'); loadWorld().then(renderCareer); renderCareer() } else { showTab('theory', 'theory') } }
$('#tHome').onclick = showCover; $('#hHome').onclick = showCover; $('#tDaily').onclick = () => setTab('daily'); $('#tCareer').onclick = () => setTab('career'); $('#tTheory').onclick = () => setTab('theory');

function applyLang(l) { LANG = l; try { localStorage.setItem('cc4:lang', l) } catch (e) {} document.documentElement.lang = l;
  document.title = tr('game');
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = tr(e.dataset.i18n));
  document.querySelectorAll('[data-i18n-html]').forEach(e => e.innerHTML = tr(e.dataset.i18nHtml));
  document.querySelectorAll('[data-i18n-ph]').forEach(e => e.placeholder = tr(e.dataset.i18nPh));
  document.querySelectorAll('[data-i18n-aria]').forEach(e => e.setAttribute('aria-label', tr(e.dataset.i18nAria)));
  $('#essay').innerHTML = tr('theoryHtml');
  document.querySelectorAll('[data-langs]').forEach(box => { box.innerHTML = ''; LANGS.forEach(x => { const b = document.createElement('button'); b.textContent = LANG_LABEL[x]; b.lang = x; b.setAttribute('aria-pressed', x === LANG); b.onclick = () => applyLang(x); box.appendChild(b) }) });
  if (!$('#vCover').hidden) { renderCoverCards(); const sp = $('#plate'); sp.querySelectorAll('title').forEach((t, i) => {}); if (DATA.w110) renderCover() }
  if (!$('#vCareer').hidden) renderCareer();
  if (game) { renderGameTexts(); if (!$('#win').hidden && game.done) { /* las tarjetas se regeneran al volver a jugar */ } } }

/* ---------- arranque ---------- */
applyLang(pickLang());
(async () => {
  const h = location.hash;
  if (/^#m\d{5}$/.test(h)) { await loadWorld(); await loadMuni(); const M = mapData('muni'), gi = M.geoms.findIndex(g => !g.properties.ex && String(g.properties.i) === h.slice(2)); if (gi >= 0) return playRegion('muni', gi) }
  else if (/^#[A-Z]{3}$/.test(h)) { await loadWorld(); const M = mapData('a0'), gi = M.geoms.findIndex(g => !g.properties.ex && g.properties.c === h.slice(1)); if (gi >= 0) return playRegion('a0', gi) }
  else if (/^#[A-Z]{2}-[A-Z0-9]{1,4}$/.test(h)) { await loadWorld(); const M = mapData('a1'), gi = M.geoms.findIndex(g => !g.properties.ex && g.properties.k === h.slice(1)); if (gi >= 0) return playRegion('a1', gi) }
  showCover() })();
