/* ── 10-stats：六格指标、暗数值、家庭压力 ───────────────── */
/* 条上只放你自己的四样东西。
   威信是书记的，挪到班子页他那张卡上；干净是你心里的数，不给看 */
var STAT_DEF = [
  { k: 'trust',  n: '信任', low: 30 },
  { k: 'rep',    n: '官声', low: 25 },
  { k: 'guanxi', n: '人脉', low: 15 },
  { k: 'energy', n: '精力', low: 25 }
];
/* fx 里的键 → 指标键 */
var FX_MAP = { trust: 'trust', pres: 'prestige', rep: 'rep', gx: 'guanxi', clean: 'clean', en: 'energy' };

/* 结局页才摊开 */
/* 四档按实跑量定：六十个月三百次选择，最干净的打法也落在七十上下 */
function CLEAN_WORD(v){
  return v >= 78 ? '一件没伸过手' : v >= 58 ? '大面上过得去，有两回打了擦边'
    : v >= 36 ? '有些事你自己记得，别人不一定知道'
    : v >= 18 ? '经手的东西太多了，你已经不数了'
    : '从哪一件开始的，你想不起来了';
}

var _pending = {};   /* 本次要在界面上飘的增减 */

/* 信任、官声、人脉、威信这四样越高越难往上走。
   不加这条，六十个月下来三格全顶到 100，所有门槛选项一律够得着，
   指标条就成了摆设。往下掉的时候不打折——掉是实打实的 */
var SOFT = { trust:58, rep:45, guanxi:45, prestige:52 };
function gainOf(key, v, cur){
  if (v <= 0 || !SOFT[key]) return v;
  if (cur < SOFT[key]) return v;                /* 这一段照常涨 */
  var f = 1 - (cur - SOFT[key]) / 52;           /* 过了线，一级比一级难 */
  return Math.round(v * Math.max(0.12, f) * 10) / 10;
}

function applyFx(fx){
  if (!fx) return;
  for (var k in fx){
    if (!fx.hasOwnProperty(k)) continue;
    var v = fx[k];
    if (FX_MAP[k]){
      var key = FX_MAP[k];
      var before = G.stats[key];
      G.stats[key] = clamp(before + gainOf(key, v, before), 0, 100);
      _pending[key] = (_pending[key] || 0) + (G.stats[key] - before);
    } else if (k === 'lead'){
      G.hidden.lead = clamp(G.hidden.lead + v, 0, 120);
    } else if (k === 'risk'){
      G.hidden.bossRisk = clamp(G.hidden.bossRisk + v, 0, 100);
    } else if (k === 'fam'){
      famPress(v);
    } else if (k === 'dark'){
      addDark(v);
    } else if (k === 'npc'){
      for (var id in v){ if (v.hasOwnProperty(id)) npcFavor(id, v[id]); }
    } else if (k === 'hr'){
      if (v) Pool.hrMove();
    } else if (k === 'money'){
      if (v < 0) Private.pay(-v); else Private.earn(v);
    } else if (k === 'grudge'){
      Private.addGrudge(v);
    } else if (k === 'owe'){
      Private.addOwe(v.who, v.what, v.back);
    } else if (k === 'heat'){
      for (var pid in v){ if (v.hasOwnProperty(pid)) Pool.addHeat(pid, v[pid]); }
    }
  }
}
function takePending(){ var p = _pending; _pending = {}; return p; }

function addDark(key){
  if (G.hidden.dark.indexOf(key) < 0) G.hidden.dark.push(key);
}
function famPress(v){
  G.hidden.fam = clamp(G.hidden.fam + v, 0, 20);
}
function spendDays(d){
  G.days = Math.max(0, Math.round((G.days - d) * 10) / 10);
}
/* 每件事的真实耗时：数据里写的那个数，再加半天。
   秘书这行没有「顺手就办了」，最短也要半天——找人、等签、走一趟 */
var D_BASE = 0.5;
function dayOf(o){ return Math.round(((o && o.d || 0) + D_BASE) * 10) / 10; }
/* 精力下来了，每件事多耗半天 */
function costOf(d){
  return G.stats.energy < 40 ? d + 0.5 : d;
}
function meritAdd(text){ G.archive.merit.push({ m: G.month, t: text }); }
function faultAdd(text, rule){ G.archive.fault.push({ m: G.month, t: text, rule: rule || null }); }
function keepAdd(text, key){
  if (!text) return;
  var old = null;
  G.archive.mats.forEach(function(x){ if (x.t === text) old = x; });
  if (old){ if (key) old.k = key; return; }
  G.archive.mats.push({ m: G.month, t: text, k: key || null });
}
/* 交出去了就不在你手里了 */
function dropKey(key){
  G.archive.mats.forEach(function(x){ if (x.k === key) x.k = null; });
}
function logAdd(text){
  G.log.push({ m: G.month, t: text });
  if (G.log.length > 400) G.log.shift();
}

/* 一个月过去，有些东西会自己往回落。
   人情放着会淡——你上次给人打电话是半年前的事了；
   名声也一样，机关里没人记得你上个月那件事办得多漂亮；
   书记对你的看法，不办事不办错事的时候，慢慢回到一个平均数上 */
function statDrift(){
  var s = G.stats;
  s.guanxi = clamp(Math.round((s.guanxi - 1.1) * 10) / 10, 0, 100);
  if (s.rep > 50) s.rep = clamp(Math.round((s.rep - 0.9) * 10) / 10, 0, 100);
  var t = s.trust > 52 ? -0.35 : (s.trust < 48 ? 0.35 : 0);
  s.trust = clamp(Math.round((s.trust + t) * 10) / 10, 0, 100);
}

/* 书记家里那摊事，不会因为你不管就停下来。
   他弟弟的公司照样开，捐款照样收，打听的人照样来。
   起了头之后每月自己往上走一点——报上去的那几次，是往回拉的唯一办法 */
function riskDrift(){
  if (!(G.arcs && G.arcs.boss_kin)) return;
  if (G.hidden.bossRisk >= 100) return;
  /* 滚雪球：捂住一件，下一件就更难捂。
     一直往上报的那种局，这个数贴着零走，他就不会出事 */
  var d = 0.2 + G.hidden.bossRisk * 0.017;
  G.hidden.bossRisk = clamp(G.hidden.bossRisk + d, 0, 100);
}

/* 时间会把风声冲淡。手里的事越多，冲得越慢 */
function leadFade(){
  var d = Math.max(0.3, 1.1 - G.hidden.dark.length * 0.12);
  G.hidden.lead = Math.max(0, Math.round((G.hidden.lead - d) * 10) / 10);
}

/* 线索阶梯：界面不给数字，只在过阈值时丢一件待办 */
var LEAD_STAGE = [
  { at: 15, id: 'lead_hint',   once: 'ls15' },
  { at: 35, id: 'lead_talk',   once: 'ls35' },
  { at: 60, id: 'lead_patrol', once: 'ls60' },
  { at: 85, id: 'lead_final',  once: 'ls85' }
];
function checkLead(){
  for (var i = 0; i < LEAD_STAGE.length; i++){
    var s = LEAD_STAGE[i];
    if (G.hidden.lead >= s.at && !G.flags[s.once]){
      G.flags[s.once] = 1;
      if (s.id === 'lead_hint' && G.stats.guanxi < 45) continue; /* 人脉不够就没人提醒你 */
      Desk.push(s.id, 'month');
    }
  }
}
