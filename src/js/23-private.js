/* ── 23-private：家底、欠账、报复链、写死的时间表 ───────── */
var Private = {

  init: function(){
    if (G.money == null) G.money = 8;       /* 万。两口子干了七八年，首付掏完就剩这些 */
    if (!G.owe) G.owe = [];
    if (!G.grudge) G.grudge = {};
    if (!G.hurt) G.hurt = {};
    if (!G.sched) G.sched = {};
  },

  /* 家底 */
  can: function(v){ Private.init(); return G.money >= v; },
  pay: function(v){ Private.init(); G.money = Math.round((G.money - v) * 10) / 10; },
  earn: function(v){ Private.init(); G.money = Math.round((G.money + v) * 10) / 10; },
  moneyWord: function(){
    var v = G.money;
    return v >= 30 ? '手头宽裕' : v >= 15 ? '过得去'
      : v >= 8 ? '经不起一件大事' : v >= 3 ? '这个月的水电还没交'
      : '找谁开口都张不了嘴';
  },

  /* 欠账 */
  addOwe: function(who, what, back){
    Private.init();
    G.owe.push({ who: who, what: what, back: back || '',
      m: G.month, due: G.month + 3 + ri(4), done: 0 });
  },
  oweOpen: function(){ Private.init(); return G.owe.filter(function(o){ return !o.done; }); },

  /* 仇 */
  addGrudge: function(id){
    Private.init();
    if (!id) return;
    G.grudge[id] = (G.grudge[id] || 0) + 1;
  },

  /* 每月跑一遍 */
  tick: function(){
    Private.init();
    Private.earn(0.25);                     /* 两份工资，还着房贷，一年攒三万 */
    Private.schedule();
    Private.her();
    Private.collect();
    Private.revenge();
  },

  /* 到月份就来 */
  schedule: function(){
    PRIVATE_SCHED.forEach(function(s){
      if (G.sched[s.id]) return;
      if (G.month < s.at[0]) return;
      if (G.month > s.at[1] + 6) { G.sched[s.id] = 'skip'; return; }
      if (G.month === s.at[0] || rnd() < 0.5 || G.month >= s.at[1]){
        if (EV(s.id)){ G.sched[s.id] = G.month; Desk.push(s.id, 'month'); }
      }
    });
  },

  /* 连着三个月加班，而且家里早就不问了 */
  her: function(){
    if (G.seen.her_water) return;
    if ((G.otRun || 0) < 3) return;
    if (G.hidden.fam < 10) return;
    if (!EV('her_water')) return;
    Desk.push('her_water', 'month');
  },

  /* 欠的账到期了，他来要 */
  collect: function(){
    var open = Private.oweOpen();
    for (var i = 0; i < open.length; i++){
      var o = open[i];
      if (o.due > G.month) continue;
      if (o.pushed) continue;
      var id = 'owe_' + i + '_' + G.month;
      if (G.gen[id]) continue;
      var who = Pool.side(o.who);
      function sub(s){
        return String(s || '').replace(/\{WHO\}/g, who.n + '　' + who.p)
          .replace(/\{WHAT\}/g, o.what).replace(/\{BACK\}/g, o.back || '那件事就当没办过');
      }
      var e = {
        id: id, kind:'note', src:'有人找你', due:'month',
        title: sub(OWE_TPL.title), text: sub(OWE_TPL.text), nt: sub(OWE_TPL.nt),
        neglect: { rep:-3 }, oweIdx: i,
        opts: OWE_TPL.opts.map(function(x){
          var fx = {};
          for (var k in x.fx) fx[k] = x.fx[k];
          if (x.fxWho){ fx.npc = {}; fx.npc[o.who] = x.fxWho; }
          return { t: sub(x.t), d: x.d, n: sub(x.n), tier: x.tier, rule: x.rule,
                   fx: fx, rk: x.rk, clear: x.clear, renege: x.renege, oweIdx: i,
                   grudge: x.grudge ? o.who : null };
        })
      };
      G.gen[id] = e;
      o.pushed = 1;
      Desk.push(id, 'month');
      break;      /* 一个月最多来一个人要账 */
    }
  },

  /* 你拒过谁，谁就动你家的人。不写第四句 */
  revenge: function(){
    Private.init();
    for (var id in G.grudge){
      if (G.grudge[id] < 2) continue;
      var c = CAN_HURT[id];
      if (!c || G.hurt[c.kin]) continue;
      if (!EV(c.ev)) continue;
      G.hurt[c.kin] = 1;
      G.grudge[id] = 0;
      Desk.push(c.ev, 'month');
      return;
    }
  },

  /* 欠账没还：他把给你的东西收回去 */
  renege: function(idx){
    Private.init();
    var o = G.owe[idx];
    if (!o) return;
    o.done = 'renege';
    faultAdd('欠' + Pool.side(o.who).n + '的那件事，没还', null);
  },
  settle: function(idx){
    Private.init();
    var o = G.owe[idx];
    if (o) o.done = 'paid';
  }
};
