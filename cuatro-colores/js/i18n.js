/* Textos del juego en español, inglés, ruso y chino */
const LANGS = ['es', 'en', 'ru', 'zh'];
const LANG_LABEL = { es: 'ES', en: 'EN', ru: 'RU', zh: '中文' };
/* índice del nombre en los datos: [local, en, es, ru, zh] */
const NAME_IDX = { es: 2, en: 1, ru: 3, zh: 4 };

const T = {
es: {
  game: 'Cuatro Colores', tagline: 'Bastan cuatro tintas para cualquier mapa',
  atlas: 'Atlas para colorear', plateNo: 'Lámina I', inks4: '4 tintas',
  lede: 'Cualquier mapa se puede pintar con solo cuatro tintas sin que dos vecinos repitan color. Se sospechó en 1852 y no se demostró hasta 1976. Compruébalo con mapas de verdad.',
  plateCap: 'Países del mundo', plateCount: '{k} de {n} pintados', plateDone: '{n} de {n} · ningún vecino repite', loading: 'Cargando mapas…',
  dailyKick: 'Reto del día · #{n}', sunday: 'domingo, 3 tintas', play: 'Jugar', seeResult: 'Ver resultado',
  dailyDone: 'Hecho: {stars} en {t} · racha {s}', dailySub: '{sub} · {n}',
  regionKick: 'Pinta tu región', regionTitle: 'Tu región y sus vecinas', regionDesc: 'Cualquier región del mundo o municipio de España.',
  regionPh: 'Ej.: Baviera, Texas, Xàtiva…', notFound: 'No encuentro ese lugar', municipality: 'municipio',
  careerKick: 'Carrera', careerTitle: '{n} mapas reales', careerDesc: 'De Sudamérica a Japón', careerStars: '{s} de {t} estrellas',
  theoryKick: 'El teorema', theoryDesc: 'La historia en dos minutos',
  sources: 'Límites: Natural Earth, IGN (municipios de España).',
  moreGames: 'Más juegos de matemáticas', privacy: 'Privacidad',
  navHome: 'Portada', navDaily: 'Diario', navCareer: 'Carrera', navTheory: 'Teorema',
  hTime: 'Tiempo', hRegions: 'Regiones', hClash: 'Choques', hPar: 'Par',
  tapRegion: 'Toca una región', zoomHint: 'pellizca o usa + para ampliar',
  neighbors: ['{n} vecina', '{n} vecinas'], noNeighbors: 'sin vecinos', outside: 'fuera del reto', shard: '{x} (trozo diminuto, no cuenta)', fragment: '{x} (fragmento)',
  missing: ['Falta {n}', 'Faltan {n}'], clashes: ['{n} choque', '{n} choques'], completed: 'Completado',
  undo: 'Deshacer', hint: 'Pista', reset: 'Reiniciar', zoomIn: 'Acercar', zoomOut: 'Alejar', zoomFit: 'Encuadrar',
  rules: 'Elige una tinta y toca una región. <b>Dos regiones con frontera común no pueden compartir color</b>; tocarse en un solo punto no cuenta. Las marcadas con ◆ vienen impresas. Las islas sin vecinos salen claras y no hace falta pintarlas. Los territorios diminutos llevan un círculo. El botón <b>Faltan</b> te lleva a cada región sin pintar y, al final, a los choques.',
  printed: '{x} viene impresa', clashMsg: 'Choque: {a} y {b}', hintMsg: 'Pista: {x}', deadEnd: 'Sin salida: corregida {x}',
  unpainted: 'Sin pintar: {x}', ofN: ' ({i} de {n})', allButClash: ['Todo pintado, pero queda {n} choque. Pulsa el botón rojo', 'Todo pintado, pero quedan {n} choques. Pulsa el botón rojo'],
  copied: 'Resultado copiado',
  seeMap: 'Ver mapa', again: 'Repetir', next: 'Siguiente: {x}', seeCareer: 'Ver carrera', share: 'Compartir resultado', shareShort: 'Compartir', another: 'Otra región',
  statsLine: '{t} · {e} choques · {h} pistas', why1: 'Mapa completo', why2: 'Sin choques ni pistas', why3: 'Por debajo del par',
  newMapIn: 'Nuevo mapa en {t}', dayTitle: 'Día #{n} · {x}', streak: 'racha {n}',
  shareAsk: '¿Puedes con cuatro tintas?', shareAskRegion: '¿Pintas tu región con cuatro tintas?',
  around: 'Alrededores de {x}', regionsInks: '{n} regiones · {k} tintas',
  careerTitleFull: 'Carrera', careerHelp: 'Puedes empezar por cualquier capítulo. Dentro de cada uno, los mapas se abren en orden: completa uno, con las estrellas que sean, y se abre el siguiente.',
  needPrev: 'Completa «{x}»',
  ch: { first: ['Primeros mapas', 'Pocas regiones y fronteras claras para coger el pulso.'], europe: ['Europa', 'Países, regiones y cantones. Aquí aparecen las regiones impresas.'],
        americas: ['América', 'Estados, provincias y departamentos de un extremo a otro.'], asia: ['Asia', 'Prefecturas, provincias y estados del continente más grande.'],
        africa: ['África y Oriente Medio', 'Países africanos, estados de Nigeria y provincias de Turquía.'], spain: ['España', 'Provincias y la Comunitat Valenciana municipio a municipio.'],
        world: ['El mundo', 'El mapa final: todos los países a la vez.'] },
  theoryHtml: `<span class="yr">1852 → 1976 → 2005</span>
<h2>El teorema que necesitó un ordenador</h2>
<p>En 1852 Francis Guthrie coloreaba un mapa de los condados de Inglaterra y se dio cuenta de que le bastaban cuatro colores para que ningún par de condados vecinos coincidiera. Preguntó si eso valía para cualquier mapa posible.</p>
<p>Durante más de un siglo nadie pudo demostrarlo. En 1879 Kempe publicó una prueba que se aceptó once años, hasta que Heawood encontró el fallo. De aquel intento salió el teorema de los cinco colores, mucho más fácil.</p>
<p>En 1976 Kenneth Appel y Wolfgang Haken lo demostraron reduciendo el problema a casi dos mil configuraciones que un ordenador comprobó una a una. Fue la primera gran demostración que ningún humano podía verificar a mano. En 2005 Georges Gonthier la verificó formalmente con el asistente Coq.</p>
<dl><dt>Regla</dt><dd>Regiones de una sola pieza en un plano. Compartir frontera obliga a distinto color; tocarse en un punto no.</dd>
<dt>Letra pequeña</dt><dd>Los mapas reales no siempre tienen regiones de una pieza: Rusia tiene Kaliningrado, Alaska está separada del resto de Estados Unidos. Si obligáramos a pintar todos los trozos de un territorio igual, a veces harían falta cinco tintas. En los límites del IGN pasa en la Ribera Alta valenciana: un trozo suelto de la Pobla Llarga deja a cinco municipios tocándose todos entre sí. Por eso aquí cada trozo separado con vecinos propios cuenta como región aparte y aparece como «fragmento».</dd>
<dt>¿Por qué no 3?</dt><dd>Una región rodeada por un anillo impar de vecinas ya obliga a usar cuatro. Los domingos el reto busca zonas donde sí bastan tres.</dd></dl>`
},
en: {
  game: 'Four Colors', tagline: 'Four inks are enough for any map',
  atlas: 'A coloring atlas', plateNo: 'Plate I', inks4: '4 inks',
  lede: 'Any map can be painted with just four inks so that no two neighbors share a color. It was suspected in 1852 and not proved until 1976. Try it on real maps.',
  plateCap: 'Countries of the world', plateCount: '{k} of {n} painted', plateDone: '{n} of {n} · no neighbors match', loading: 'Loading maps…',
  dailyKick: 'Daily challenge · #{n}', sunday: 'Sunday, 3 inks', play: 'Play', seeResult: 'See result',
  dailyDone: 'Done: {stars} in {t} · streak {s}', dailySub: '{sub} · {n}',
  regionKick: 'Paint your region', regionTitle: 'Your region and its neighbors', regionDesc: 'Any region in the world, or any town in Spain.',
  regionPh: 'e.g. Bavaria, Texas, Kyoto…', notFound: 'Can’t find that place', municipality: 'town',
  careerKick: 'Career', careerTitle: '{n} real maps', careerDesc: 'From South America to Japan', careerStars: '{s} of {t} stars',
  theoryKick: 'The theorem', theoryDesc: 'The story in two minutes',
  sources: 'Borders: Natural Earth, IGN (Spanish municipalities).',
  moreGames: 'More math games', privacy: 'Privacy',
  navHome: 'Home', navDaily: 'Daily', navCareer: 'Career', navTheory: 'Theorem',
  hTime: 'Time', hRegions: 'Regions', hClash: 'Clashes', hPar: 'Par',
  tapRegion: 'Tap a region', zoomHint: 'pinch or use + to zoom',
  neighbors: ['{n} neighbor', '{n} neighbors'], noNeighbors: 'no neighbors', outside: 'not in this puzzle', shard: '{x} (tiny piece, doesn’t count)', fragment: '{x} (fragment)',
  missing: ['{n} left', '{n} left'], clashes: ['{n} clash', '{n} clashes'], completed: 'Completed',
  undo: 'Undo', hint: 'Hint', reset: 'Reset', zoomIn: 'Zoom in', zoomOut: 'Zoom out', zoomFit: 'Fit map',
  rules: 'Pick an ink and tap a region. <b>Two regions sharing a border can’t share a color</b>; touching at a single point doesn’t count. Regions marked ◆ come pre-printed. Islands with no neighbors are shown pale and don’t need painting. Tiny territories get a circle. The <b>left</b> button takes you to each unpainted region and, at the end, to any clashes.',
  printed: '{x} is pre-printed', clashMsg: 'Clash: {a} and {b}', hintMsg: 'Hint: {x}', deadEnd: 'Dead end: fixed {x}',
  unpainted: 'Unpainted: {x}', ofN: ' ({i} of {n})', allButClash: ['All painted, but {n} clash remains. Tap the red button', 'All painted, but {n} clashes remain. Tap the red button'],
  copied: 'Result copied',
  seeMap: 'See map', again: 'Replay', next: 'Next: {x}', seeCareer: 'See career', share: 'Share result', shareShort: 'Share', another: 'Another region',
  statsLine: '{t} · {e} clashes · {h} hints', why1: 'Map complete', why2: 'No clashes or hints', why3: 'Under par',
  newMapIn: 'New map in {t}', dayTitle: 'Day #{n} · {x}', streak: 'streak {n}',
  shareAsk: 'Can you do it with four inks?', shareAskRegion: 'Can you paint your region with four inks?',
  around: 'Around {x}', regionsInks: '{n} regions · {k} inks',
  careerTitleFull: 'Career', careerHelp: 'Start with any chapter. Within each one, maps open in order: finish one, with any number of stars, and the next one opens.',
  needPrev: 'Finish “{x}”',
  ch: { first: ['First maps', 'Few regions and clear borders to get the feel.'], europe: ['Europe', 'Countries, regions and cantons. Pre-printed regions appear here.'],
        americas: ['The Americas', 'States, provinces and departments from end to end.'], asia: ['Asia', 'Prefectures, provinces and states of the largest continent.'],
        africa: ['Africa & Middle East', 'African countries, Nigerian states and Turkish provinces.'], spain: ['Spain', 'Provinces, and the Valencian Community town by town.'],
        world: ['The world', 'The final map: every country at once.'] },
  theoryHtml: `<span class="yr">1852 → 1976 → 2005</span>
<h2>The theorem that needed a computer</h2>
<p>In 1852 Francis Guthrie was coloring a map of the counties of England and noticed that four colors were enough to keep every pair of neighboring counties different. He asked whether that held for every possible map.</p>
<p>For over a century nobody could prove it. In 1879 Kempe published a proof that stood for eleven years until Heawood found the flaw. That attempt did yield the much easier five color theorem.</p>
<p>In 1976 Kenneth Appel and Wolfgang Haken proved it by reducing the problem to almost two thousand configurations that a computer checked one by one. It was the first major proof no human could verify by hand. In 2005 Georges Gonthier verified it formally with the Coq proof assistant.</p>
<dl><dt>Rule</dt><dd>Regions in one piece, on a plane. Sharing a border forces different colors; touching at a point does not.</dd>
<dt>Fine print</dt><dd>Real maps don’t always have one-piece regions: Russia has Kaliningrad, Alaska is apart from the rest of the United States. If every piece of a territory had to share one color, five inks could sometimes be needed. It happens in Spain’s official municipal borders, where a stray piece of one Valencian town leaves five towns all touching each other. So here every separate piece with neighbors of its own counts as its own region, shown as a “fragment”.</dd>
<dt>Why not 3?</dt><dd>A region surrounded by an odd ring of neighbors already needs four. On Sundays the challenge looks for areas where three are enough.</dd></dl>`
},
ru: {
  game: 'Четыре краски', tagline: 'Четырёх красок хватит для любой карты',
  atlas: 'Атлас-раскраска', plateNo: 'Лист I', inks4: '4 краски',
  lede: 'Любую карту можно раскрасить всего четырьмя красками так, чтобы соседи не совпадали по цвету. Это заподозрили в 1852 году, а доказали только в 1976-м. Проверьте на настоящих картах.',
  plateCap: 'Страны мира', plateCount: 'раскрашено {k} из {n}', plateDone: '{n} из {n} · соседи не совпадают', loading: 'Загрузка карт…',
  dailyKick: 'Задача дня · №{n}', sunday: 'воскресенье, 3 краски', play: 'Играть', seeResult: 'Результат',
  dailyDone: 'Готово: {stars} за {t} · серия {s}', dailySub: '{sub} · {n}',
  regionKick: 'Раскрась свой регион', regionTitle: 'Ваш регион и его соседи', regionDesc: 'Любой регион мира или муниципалитет Испании.',
  regionPh: 'Например: Бавария, Техас, Киото…', notFound: 'Не нашли такое место', municipality: 'муниципалитет',
  careerKick: 'Карьера', careerTitle: '{n} настоящих карт', careerDesc: 'От Южной Америки до Японии', careerStars: '{s} из {t} звёзд',
  theoryKick: 'Теорема', theoryDesc: 'История за две минуты',
  sources: 'Границы: Natural Earth, IGN (муниципалитеты Испании).',
  moreGames: 'Другие математические игры', privacy: 'Конфиденциальность',
  navHome: 'Главная', navDaily: 'День', navCareer: 'Карьера', navTheory: 'Теорема',
  hTime: 'Время', hRegions: 'Регионы', hClash: 'Конфликты', hPar: 'Норма',
  tapRegion: 'Нажмите на регион', zoomHint: 'сведите пальцы или нажмите +',
  neighbors: ['{n} сосед', '{n} соседа', '{n} соседей'], noNeighbors: 'нет соседей', outside: 'не входит в задачу', shard: '{x} (крошечный кусок, не считается)', fragment: '{x} (фрагмент)',
  missing: ['Осталось {n}', 'Осталось {n}', 'Осталось {n}'], clashes: ['{n} конфликт', '{n} конфликта', '{n} конфликтов'], completed: 'Готово',
  undo: 'Отменить', hint: 'Подсказка', reset: 'Сначала', zoomIn: 'Приблизить', zoomOut: 'Отдалить', zoomFit: 'Вся карта',
  rules: 'Выберите краску и нажмите на регион. <b>Регионы с общей границей не могут быть одного цвета</b>; касание в одной точке не считается. Регионы с ◆ уже раскрашены. Острова без соседей светлые, их красить не нужно. Крошечные территории обведены кружком. Кнопка <b>Осталось</b> покажет каждый нераскрашенный регион, а в конце — конфликты.',
  printed: '{x} уже раскрашен', clashMsg: 'Конфликт: {a} и {b}', hintMsg: 'Подсказка: {x}', deadEnd: 'Тупик: исправлен {x}',
  unpainted: 'Не раскрашен: {x}', ofN: ' ({i} из {n})', allButClash: ['Всё раскрашено, но остался {n} конфликт. Нажмите красную кнопку', 'Всё раскрашено, но осталось {n} конфликта. Нажмите красную кнопку', 'Всё раскрашено, но осталось {n} конфликтов. Нажмите красную кнопку'],
  copied: 'Результат скопирован',
  seeMap: 'Карта', again: 'Ещё раз', next: 'Дальше: {x}', seeCareer: 'К карьере', share: 'Поделиться', shareShort: 'Поделиться', another: 'Другой регион',
  statsLine: '{t} · конфликтов: {e} · подсказок: {h}', why1: 'Карта раскрашена', why2: 'Без конфликтов и подсказок', why3: 'Быстрее нормы',
  newMapIn: 'Новая карта через {t}', dayTitle: 'День №{n} · {x}', streak: 'серия {n}',
  shareAsk: 'Справитесь четырьмя красками?', shareAskRegion: 'Раскрасите свой регион четырьмя красками?',
  around: '{x} и соседи', regionsInks: 'регионов: {n} · красок: {k}',
  careerTitleFull: 'Карьера', careerHelp: 'Начинайте с любой главы. Внутри главы карты открываются по порядку: пройдите одну — с любым числом звёзд — и откроется следующая.',
  needPrev: 'Пройдите «{x}»',
  ch: { first: ['Первые карты', 'Мало регионов и ясные границы, чтобы освоиться.'], europe: ['Европа', 'Страны, области и кантоны. Здесь появляются уже раскрашенные регионы.'],
        americas: ['Америка', 'Штаты, провинции и департаменты от края до края.'], asia: ['Азия', 'Префектуры, провинции и штаты самого большого континента.'],
        africa: ['Африка и Ближний Восток', 'Страны Африки, штаты Нигерии и провинции Турции.'], spain: ['Испания', 'Провинции и Валенсия — муниципалитет за муниципалитетом.'],
        world: ['Весь мир', 'Финальная карта: все страны сразу.'] },
  theoryHtml: `<span class="yr">1852 → 1976 → 2005</span>
<h2>Теорема, которой понадобился компьютер</h2>
<p>В 1852 году Фрэнсис Гутри раскрашивал карту графств Англии и заметил, что четырёх цветов хватает, чтобы соседние графства не совпадали. Он спросил, верно ли это для любой карты.</p>
<p>Больше века никто не мог это доказать. В 1879 году Кемпе опубликовал доказательство, которое продержалось одиннадцать лет, пока Хивуд не нашёл ошибку. Из той попытки получилась гораздо более простая теорема о пяти красках.</p>
<p>В 1976 году Кеннет Аппель и Вольфганг Хакен доказали теорему, сведя задачу почти к двум тысячам конфигураций, которые компьютер проверил одну за другой. Это было первое крупное доказательство, которое человек не мог проверить вручную. В 2005 году Жорж Гонтье формально проверил его в системе Coq.</p>
<dl><dt>Правило</dt><dd>Регионы из одного куска на плоскости. Общая граница требует разных цветов; касание в точке — нет.</dd>
<dt>Мелкий шрифт</dt><dd>У настоящих карт регионы не всегда цельные: у России есть Калининград, Аляска отделена от остальных США. Если требовать один цвет для всех частей территории, иногда понадобится пять красок. Так бывает в официальных границах муниципалитетов Испании: отдельный кусочек одного валенсийского городка делает пять муниципалитетов попарно соседними. Поэтому здесь каждый отдельный кусок со своими соседями считается отдельным регионом — «фрагментом».</dd>
<dt>Почему не 3?</dt><dd>Регион, окружённый нечётным кольцом соседей, уже требует четырёх красок. По воскресеньям задача ищет места, где хватает трёх.</dd></dl>`
},
zh: {
  game: '四色', tagline: '四种颜色足以涂满任何地图',
  atlas: '涂色地图集', plateNo: '图版 一', inks4: '4 种颜色',
  lede: '任何地图都只需四种颜色，就能让相邻区域颜色各不相同。人们在 1852 年提出这个猜想，直到 1976 年才得到证明。用真实的地图来试试吧。',
  plateCap: '世界各国', plateCount: '已涂 {k} / {n}', plateDone: '{n} / {n} · 相邻无同色', loading: '正在加载地图…',
  dailyKick: '每日挑战 · 第 {n} 期', sunday: '周日，3 种颜色', play: '开始', seeResult: '查看结果',
  dailyDone: '已完成：{stars}，用时 {t} · 连续 {s} 天', dailySub: '{sub} · {n}',
  regionKick: '涂你的地区', regionTitle: '你的地区和它的邻居', regionDesc: '世界上任何一个地区，或西班牙的任何市镇。',
  regionPh: '例如：巴伐利亚、德克萨斯、京都…', notFound: '找不到这个地方', municipality: '市镇',
  careerKick: '生涯', careerTitle: '{n} 张真实地图', careerDesc: '从南美洲到日本', careerStars: '{s} / {t} 颗星',
  theoryKick: '定理', theoryDesc: '两分钟读懂它的故事',
  sources: '边界数据：Natural Earth、IGN（西班牙市镇）。',
  moreGames: '更多数学游戏', privacy: '隐私',
  navHome: '首页', navDaily: '每日', navCareer: '生涯', navTheory: '定理',
  hTime: '时间', hRegions: '区域', hClash: '冲突', hPar: '标准',
  tapRegion: '点击一个区域', zoomHint: '双指缩放或点击 +',
  neighbors: ['{n} 个邻居'], noNeighbors: '没有邻居', outside: '不在本题中', shard: '{x}（极小碎片，不计）', fragment: '{x}（飞地）',
  missing: ['还剩 {n}'], clashes: ['{n} 处冲突'], completed: '已完成',
  undo: '撤销', hint: '提示', reset: '重来', zoomIn: '放大', zoomOut: '缩小', zoomFit: '全图',
  rules: '选一种颜色，再点击区域。<b>有共同边界的两个区域不能同色</b>；只在一个点相接不算。标有 ◆ 的区域已预先涂好。没有邻居的岛屿显示为浅色，不必涂。极小的地区带有圆圈。<b>还剩</b>按钮会带你找到每个未涂区域，最后找到冲突。',
  printed: '{x} 已预先涂好', clashMsg: '冲突：{a} 和 {b}', hintMsg: '提示：{x}', deadEnd: '走进死路：已修正 {x}',
  unpainted: '未涂：{x}', ofN: '（{i}/{n}）', allButClash: ['都涂完了，但还有 {n} 处冲突。点红色按钮'],
  copied: '结果已复制',
  seeMap: '看地图', again: '再玩一次', next: '下一张：{x}', seeCareer: '返回生涯', share: '分享结果', shareShort: '分享', another: '换个地区',
  statsLine: '{t} · {e} 处冲突 · {h} 次提示', why1: '地图完成', why2: '无冲突、无提示', why3: '快于标准时间',
  newMapIn: '新地图将在 {t} 后出现', dayTitle: '第 {n} 期 · {x}', streak: '连续 {n} 天',
  shareAsk: '你能只用四种颜色吗？', shareAskRegion: '你能用四种颜色涂好你的地区吗？',
  around: '{x}周边', regionsInks: '{n} 个区域 · {k} 种颜色',
  careerTitleFull: '生涯', careerHelp: '可以从任意一章开始。每章内的地图按顺序解锁：完成一张（几颗星都行），就会开启下一张。',
  needPrev: '先完成「{x}」',
  ch: { first: ['入门地图', '区域少、边界清楚，先找找感觉。'], europe: ['欧洲', '国家、大区和州。这里开始出现预先涂好的区域。'],
        americas: ['美洲', '从北到南的州、省和大区。'], asia: ['亚洲', '最大洲的县、省和邦。'],
        africa: ['非洲与中东', '非洲各国、尼日利亚各州和土耳其各省。'], spain: ['西班牙', '各省，以及逐个市镇的巴伦西亚自治区。'],
        world: ['全世界', '最终地图：所有国家一起涂。'] },
  theoryHtml: `<span class="yr">1852 → 1976 → 2005</span>
<h2>一个需要计算机的定理</h2>
<p>1852 年，弗朗西斯·格斯里在给英格兰各郡的地图上色时发现，四种颜色就足以让相邻的郡颜色不同。他问：这对任何地图都成立吗？</p>
<p>一百多年里没有人能证明。1879 年肯普发表了一个证明，被接受了十一年，直到希伍德找出其中的漏洞。那次尝试倒是得出了简单得多的五色定理。</p>
<p>1976 年，肯尼斯·阿佩尔和沃尔夫冈·哈肯把问题化简为近两千种构形，由计算机逐一验证，完成了证明。这是第一个人类无法亲手核查的重大证明。2005 年，乔治·贡捷用 Coq 证明助手对它做了形式化验证。</p>
<dl><dt>规则</dt><dd>平面上、每块完整的区域。有共同边界就必须异色；只在一点相接则不必。</dd>
<dt>附注</dt><dd>真实地图上的区域不一定是一整块：俄罗斯有加里宁格勒，阿拉斯加与美国本土分开。如果要求同一地区的所有部分同色，有时就需要五种颜色。西班牙官方市镇边界里就有这种情况：巴伦西亚一个市镇的一小块飞地，让五个市镇两两相邻。所以本游戏中，每块拥有自己邻居的分离部分都算作独立区域，标为「飞地」。</dd>
<dt>为什么不是 3 种？</dt><dd>被奇数个邻居围成一圈的区域，就已经需要四种颜色。每逢周日，挑战会找三种颜色就够的地方。</dd></dl>`
}
};
let LANG = 'es';
function pickLang() { let l = null; try { l = localStorage.getItem('cc4:lang') } catch (e) {}
  if (!l || !LANGS.includes(l)) { const n = (navigator.language || 'es').slice(0, 2).toLowerCase(); l = LANGS.includes(n) ? n : 'en' } return l }
function tr(key, vars) { let s = T[LANG][key]; if (s == null) s = T.en[key]; if (s == null) return key;
  if (Array.isArray(s)) s = plural(s, vars && vars.n);
  return typeof s === 'string' ? s.replace(/\{(\w+)\}/g, (_, k) => vars && vars[k] != null ? vars[k] : '') : s }
function plural(forms, n) { n = +n || 0;
  if (LANG === 'ru') { const m10 = n % 10, m100 = n % 100; return forms[m10 === 1 && m100 !== 11 ? 0 : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) ? 1 : 2] || forms[forms.length - 1] }
  if (LANG === 'zh') return forms[0];
  return n === 1 ? forms[0] : forms[1] || forms[0] }
/* nombre de una geometría según idioma */
function nm(props) { const n = props.n; if (!n) return ''; const s = n[NAME_IDX[LANG]] || n[1] || n[0]; return s }
