/* ── 70-endings：S1 只做判定壳和结局页，S6 补全文本 ───────── */
var ENDING_ORDER = ['rise','province','outpost','stay','cold','replaced',
                    'clear','report','together','self_out'];
var ENDINGS = ENDING_TEXT;

/* 图鉴：跨局存，记你打出过哪些 */
var DEX_KEY = 'dami_dex';
function dexGet(){
  try { return JSON.parse(localStorage.getItem(DEX_KEY) || '[]'); } catch (e){ return []; }
}
function dexAdd(k){
  try {
    var a = dexGet();
    if (a.indexOf(k) < 0){ a.push(k); localStorage.setItem(DEX_KEY, JSON.stringify(a)); }
  } catch (e){}
}

var Endings = {
  trigger: function(key){
    if (G.ending) return;
    G.ending = key;
    G.endAt = G.month;
    dexAdd(key);
    save();
  },
  /* 每月末检查一次 */
  tick: function(){
    if (G.ending) return;
    if (G.stats.trust < 30){
      G.flags.trustLow = (G.flags.trustLow || 0) + 1;
      if (G.flags.trustLow >= 3) Endings.trigger('replaced');
    } else {
      G.flags.trustLow = 0;
    }
    /* 干得好，他会被调走 */
    if (G.month >= 48 && !G.seen.boss_leave && !G.flags.bossGone &&
        G.stats.trust >= 58 && G.stats.prestige >= 48 && rnd() < 0.03){
      Desk.push('boss_leave', 'month');
    }
    /* 隐患太高，他自己先出事 */
    if (G.hidden.bossRisk >= 80 && !G.flags.bossOut && rnd() < 0.12){
      G.flags.bossOut = G.month;
      var red2 = G.archive.fault.some(function(f){ return f.rule && RULES[f.rule] && RULES[f.rule].red; });
      var hard2 = G.archive.fault.some(function(f){ return f.rule && RULES[f.rule] && RULES[f.rule].lv >= 4; });
      Endings.trigger((hard2 || G.flags.fought || (red2 && (G.archive.coop || 0) < 3)) ? 'together' : 'clear');
    }
  },
  /* 他要走了：你跟不跟得上 */
  bossLeave: function(){
    if (G.ending) return;
    G.flags.bossGone = G.month;
    var red = G.archive.fault.some(function(f){ return f.rule && RULES[f.rule] && RULES[f.rule].red; });
    var road = G.flags.bossRoad;
    /* 那天晚上你说了什么，基本就是后面三年 */
    if (road === 'follow') return Endings.trigger((G.stats.trust >= 62 && !red) ? 'rise' : 'cold');
    if (road === 'stay')   return Endings.trigger(G.stats.rep >= 58 ? 'stay' : 'cold');
    if (road === 'none')   return Endings.trigger(G.stats.guanxi >= 70 ? 'province' : 'cold');
    if (G.flags.followBoss && G.stats.trust >= 66 && !red) return Endings.trigger('rise');
    if (G.stats.guanxi >= 72 && G.stats.rep >= 60) return Endings.trigger('province');
    Endings.trigger(G.stats.rep >= 74 ? 'stay' : 'cold');
  },

  /* 巡视组反馈之后：前面所有的线在这里引爆或者排掉 */
  patrol: function(){
    if (G.ending) return;
    var red = G.archive.fault.some(function(f){ return f.rule && RULES[f.rule] && RULES[f.rule].red; });
    var hard = G.archive.fault.some(function(f){ return f.rule && RULES[f.rule] && RULES[f.rule].lv >= 4; });
    var coop = G.archive.coop || 0;
    var lead = G.hidden.lead, risk = G.hidden.bossRisk;
    G.flags.patrolDone = G.month;
    if (lead >= 70) return Endings.trigger('self_out');
    if (risk >= 70){
      /* 他倒了，你手上有没有红线的东西，这时候是唯一要紧的事。
         轻一点的那几条，如果这几年你次次都往上报过，还能摘得出来 */
      if (hard || G.flags.fought || (red && coop < 3)) return Endings.trigger('together');
      return Endings.trigger('clear');
    }
    if (red && coop === 0 && lead >= 45) return Endings.trigger('together');
    /* 没炸。剩下的日子接着过 */
  },

  /* 干满一届 */
  settle: function(){
    if (G.ending) return;
    var red = G.archive.fault.some(function(f){ return f.rule && RULES[f.rule] && RULES[f.rule].red; });
    if (G.flags.bossGone){
      return Endings.trigger(G.stats.rep >= 74 ? 'stay' : 'cold');
    }
    /* 你跟佟建民说过想去哪，那句话算数——前提是你真有那个本钱 */
    var road = G.flags.road;
    if (road === 'province' && G.stats.guanxi >= 52) return Endings.trigger('province');
    if (road === 'outpost' && G.stats.rep >= 55) return Endings.trigger('outpost');
    if (road === 'follow' && G.stats.trust >= 68 && !red) return Endings.trigger('rise');
    /* 什么也没说过的，就看这五年手里攒下的是什么。
       都不突出的那种人最多——机关里本来就是这样 */
    if (G.stats.trust >= 80 && !red) return Endings.trigger('rise');
    if (G.stats.guanxi >= 80 && G.stats.rep >= 60) return Endings.trigger('province');
    if (G.stats.rep >= 74) return Endings.trigger('outpost');
    Endings.trigger('stay');
  }
};
