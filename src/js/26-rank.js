/* ── 26-rank：职级。熬年头、攒功、书记点头，三样齐了才动 ── */
var Rank = {
  init: function(){
    if (G.rank == null) G.rank = 0;
    if (!G.rankAt) G.rankAt = { 0: 1 };
    if (!G.name) G.name = '刘峥';
  },
  cur: function(){ Rank.init(); return RANKS[G.rank] || RANKS[0]; },
  next: function(){ Rank.init(); return RANKS[G.rank + 1] || null; },
  call: function(){ return Rank.cur().call; },
  days: function(){ return Rank.cur().days || 0; },
  save: function(){ return Rank.cur().save || 0.25; },
  delegLeft: function(){
    var n = Rank.cur().deleg || 0;
    if (G.flags.delegMo !== G.month) return n;
    return Math.max(0, n - (G.flags.delegN || 0));
  },
  canDeleg: function(){ return Rank.delegLeft() > 0; },

  /* 最近一年里过栏添了几条。组织部考察的时候翻的就是这一年 */
  recentFault: function(){
    return G.archive.fault.filter(function(x){ return G.month - x.m <= 12; }).length;
  },

  /* 档案页上那一句：还差什么 */
  word: function(){
    var nx = Rank.next();
    if (!nx) return '再往上，就不是办公室能定的了';
    if (G.month < nx.at){
      var left = nx.at - G.month;
      return '报' + nx.n + '，年限还差 ' + left + ' 个月';
    }
    if (G.archive.merit.length < nx.merit) return '年限够了。拿得出手的事还不够多';
    if (G.stats.trust < nx.trust) return '年限够了，事也办了不少。报不报，要看书记那句话';
    if (G.stats.rep < nx.rep) return '书记点了头。组织部下去摸了一圈，回来说再看看';
    if (Rank.recentFault() > 4) return '材料报上去了，卡在考察那一关。这一年你名下的事有点多';
    return '材料已经报上去了';
  },

  /* 每月看一次。够了就提，提了下个月初发文件 */
  tick: function(){
    Rank.init();
    var nx = Rank.next(); if (!nx) return;
    if (G.month < nx.at) return;
    if (G.archive.merit.length < nx.merit) return;
    if (G.stats.trust < nx.trust || G.stats.rep < nx.rep) return;
    if (Rank.recentFault() > 4) return;
    G.rank = nx.k;
    G.rankAt[nx.k] = G.month;
    G.promo = nx.k;                       /* 界面看到这个就弹任命文件 */
    if (nx.k === 1) applyFx({ gx:+5 });
    if (nx.k === 2) applyFx({ gx:+6, rep:+5 });
    if (nx.k === 3) applyFx({ gx:+6, rep:+5 });
    meritAdd('晋升' + nx.n);
    logAdd('晋升' + nx.n);
  },

  /* 「市委办的小刘」这种背后的称呼跟着职级走。
     当面叫你小刘的都是领导，那个不改 */
  rename: function(s){
    if (!s || !G) return s;
    s = String(s).replace(/\{ME\}/g, G.rank >= 2 ? '刘主任' : G.rank === 1 ? '刘科长' : '刘秘书');
    if (!G.rank) return s;
    return String(s).replace(/市委办的小刘/g, '市委办的' + (G.rank >= 2 ? '刘主任' : '刘科长'));
  }
};
