/* ── 00-core：状态、存档、随机、工具 ───────────────────── */
var VER = '1.5.0';
var SAVE_KEY = 'dami_save_v1';
var START_Y = 2027, TERM = 60, WORKDAYS = 20;

/* 随机：写死种子，同一局可复现 */
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var RNG = mulberry32(Date.now() & 0x7fffffff);
function rnd(){ return RNG(); }
function ri(n){ return Math.floor(RNG() * n); }
function pick(a){ return a[ri(a.length)]; }
function shuffle(a){
  a = a.slice();
  for (var i = a.length - 1; i > 0; i--){ var j = ri(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function clamp(v, lo, hi){ return v < lo ? lo : (v > hi ? hi : v); }
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function uid(){ uid._n = (uid._n || 0) + 1; return 'u' + uid._n; }
function $(sel, root){ return (root || document).querySelector(sel); }
function $$(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function on(el, ev, fn){ if (el) el.addEventListener(ev, fn); }

/* 事件查找：写死的在 EV_BY_ID，模板现生成的在 G.gen */
function EV(id){
  if (EV_BY_ID[id]) return EV_BY_ID[id];
  return (G && G.gen && G.gen[id]) || null;
}

/* 年月 */
function ymOf(month){
  var i = month - 1;
  return { y: START_Y + Math.floor(i / 12), m: i % 12 + 1 };
}
function ymText(month){
  var t = ymOf(month);
  return t.y + '年' + t.m + '月';
}

/* ── 全局状态 ───────────────────────── */
var G = null;

function newGame(opt){
  opt = opt || {};
  var seed = opt.seed != null ? opt.seed : (Date.now() & 0x7fffffff);
  RNG = mulberry32(seed);
  G = {
    ver: VER,
    seed: seed,
    month: 1,
    days: 11,
    origin: opt.origin || 'xds',
    name: opt.name || '刘峥',
    rank: 0, rankAt: { 0: 1 }, cards: [],
    bossType: opt.bossType || pick(['steady', 'strong', 'shrewd']),
    stats: { trust: 50, prestige: 45, rep: 50, guanxi: 30, clean: 100, energy: 80 },
    hidden: { lead: 0, dark: [], bossRisk: 0, wind: 0, fam: 0, famBroken: false },
    queue: [],
    gen: {},
    done: [],
    seen: {},
    cool: {},
    flags: {},
    archive: { merit: [], fault: [], mats: [], remarks: [], coop: 0 },
    log: [],
    ending: null,
    sel: null,
    tab: 'desk'
  };
  Pool.init();
  Private.init();
  Fac.init();
  G.days = Desk.budget();
  Events.fill();
  return G;
}

/* ── 存档 ───────────────────────────── */
function save(){
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: VER, g: G }));
    return true;
  } catch (e){ return false; }
}
function load(){
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    var o = JSON.parse(raw);
    if (!o || !o.g) return false;
    G = migrate(o.g, o.v);
    RNG = mulberry32((G.seed || 1) + G.month * 7919);
    return true;
  } catch (e){ return false; }
}
function hasSave(){
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e){ return false; }
}
function wipe(){
  try { localStorage.removeItem(SAVE_KEY); } catch (e){}
}
/* 每次改结构在这里补一段 */
function migrate(g, v){
  if (!g.archive) g.archive = { merit: [], fault: [], mats: [], remarks: [], coop: 0 };
  if (!g.hidden) g.hidden = { lead: 0, dark: [], bossRisk: 0, wind: 0, fam: 0, famBroken: false };
  if (g.archive.coop == null) g.archive.coop = 0;
  if (!g.cool) g.cool = {};
  if (!g.gen) g.gen = {};
  if (!g.seen) g.seen = {};
  if (!g.cards) g.cards = [];
  if (g.rank == null){ g.rank = 0; g.rankAt = { 0: 1 }; }
  if (!g.name) g.name = '刘峥';
  g.ver = VER;
  return g;
}
function exportSave(){
  var blob = new Blob([JSON.stringify({ v: VER, g: G }, null, 1)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '大秘存档_' + ymText(G.month).replace(/[年月]/g, '') + '.json';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
}
function importSave(file, cb){
  var fr = new FileReader();
  fr.onload = function(){
    try {
      var o = JSON.parse(fr.result);
      if (!o || !o.g) throw 0;
      G = migrate(o.g, o.v);
      save(); cb(true);
    } catch (e){ cb(false); }
  };
  fr.readAsText(file);
}
