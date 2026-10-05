/* ── 00-core：随机、工具、存档 ── */
var VER = '2.4.0';
var SAVE_KEY = 'dami_save_v21';
var DEX_KEY = 'dami_dex_v2';
var START_Y = 2027, TERM = 60;

function mulberry32(a){
  var generator = function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  generator.state = function(){ return a | 0; };
  return generator;
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
function $(sel, root){ return (root || document).querySelector(sel); }
function $$(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function ymText(month){
  var i = month - 1;
  return (START_Y + Math.floor(i / 12)) + '年' + (i % 12 + 1) + '月';
}
function calMonth(month){ return (month - 1) % 12 + 1; }

/* 姓：复姓认前两个字 */
var FUXING = ['欧阳','司马','上官','诸葛','东方','皇甫','尉迟','公孙','慕容','长孙','宇文','司徒','夏侯','令狐','独孤','端木','轩辕','南宫','西门','百里','呼延','澹台','万俟','闻人','申屠','太史','钟离','宗政','濮阳','第五'];
function surname(n){ n = n || '刘峥'; return (n.length >= 3 && FUXING.indexOf(n.slice(0, 2)) >= 0) ? n.slice(0, 2) : n.charAt(0); }
/* 正文里的占位符 */
function fill(s){
  if (!s) return '';
  return String(s)
    .replace(/\{ME\}/g, G ? G.name : '刘峥')
    .replace(/\{SUR\}/g, surname(G ? G.name : '刘峥'))
    .replace(/\{P:([a-z_0-9]+)\}/g, function(_, id){ return pn(id); });
}

var G = null;

function savePayload(){
  if (G) G.rngState = RNG.state();
  return { v: VER, g: G };
}
function restoreGame(o){
  if (!o || !o.g || !o.g.people || !Number.isInteger(o.g.month) || o.g.month < 1 || o.g.month > TERM) return false;
  G = o.g;
  RNG = mulberry32(Number.isInteger(G.rngState) ? G.rngState : (G.seed || 1) + G.month * 7919);
  Work.ensure();
  G.ver = VER;
  return true;
}
function save(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(savePayload())); return true; }
  catch (e){ return false; }
}
function load(){
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    var o = JSON.parse(raw);
    return restoreGame(o);
  } catch (e){ return false; }
}
function hasSave(){ try { return !!localStorage.getItem(SAVE_KEY); } catch (e){ return false; } }
function wipe(){ try { localStorage.removeItem(SAVE_KEY); } catch (e){} }
function dexGet(){ try { return JSON.parse(localStorage.getItem(DEX_KEY) || '{}'); } catch (e){ return {}; } }
function dexAdd(k){ try { var d = dexGet(); d[k] = 1; localStorage.setItem(DEX_KEY, JSON.stringify(d)); } catch (e){} }
function exportSave(){
  var blob = new Blob([JSON.stringify(savePayload())], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '大秘存档_' + ymText(G.month).replace(/[年月]/g, '') + '.json';
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
}
function importSave(file, cb){
  var fr = new FileReader();
  fr.onload = function(){
    try { var o = JSON.parse(fr.result); if (!restoreGame(o)) throw 0; save(); cb(true); }
    catch (e){ cb(false); }
  };
  fr.readAsText(file);
}
