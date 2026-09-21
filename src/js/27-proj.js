/* ── 27-proj：书记的三件事、年底排名 ── */
function cnNum(n){ var c = '零一二三四五六七八九十'; return n <= 10 ? c.charAt(n) : '十' + c.charAt(n - 10); }
function cnCount(n){ return n === 2 ? '两' : cnNum(n); }
var Proj = {
  init: function(){
    if (!G.proj) G.proj = { oldtown:4, invest:8, qingchuan:2 };
    if (G.cityRank == null) G.cityRank = 9;        /* 他来之前那一年，云州排第九 */
    if (!G.rankLog) G.rankLog = [];
  },
  add: function(k, v){
    Proj.init();
    if (G.proj[k] == null) return;
    G.proj[k] = clamp(Math.round((G.proj[k] + v) * 10) / 10, 0, 100);
    if (v > 0) G._projUp = k;
  },
  keyOf: function(e){
    var key = e.arc ? (e.arc + '.' + e.stage) : e.id;
    for (var k in PROJ_EV){
      var a = PROJ_EV[k];
      for (var i = 0; i < a.length; i++){
        if (a[i] === key) return k;
        if (e.acts && a[i].indexOf('cw_') === 0 && e.id.indexOf(a[i]) >= 0) return k;
      }
    }
    return null;
  },
  /* 一件事办完，看它推不推哪一项。灰的办法推得最快——所以才有人用 */
  onChoose: function(e, o, it){
    if (o.proj){
      if (typeof o.proj === 'object'){ for (var pk in o.proj) Proj.add(pk, o.proj[pk]); }
      return;
    }
    var k = Proj.keyOf(e); if (!k) return;
    if (e.acts){ Proj.add(k, it.tally && it.tally.pass ? 7 : -4); return; }
    var tier = it.tier;
    Proj.add(k, tier === 'gray' ? 2.5 : tier === 'good' ? 1.5 : tier === 'tail' ? 0.5 : 0);
  },
  onNeglect: function(e){
    var k = Proj.keyOf(e); if (k) Proj.add(k, -3);
  },
  tick: function(){
    Proj.init();
    PROJ.forEach(function(p){ G.proj[p.k] = clamp(G.proj[p.k] + 0.25, 0, 100); });
  },
  avg: function(){
    Proj.init();
    return (G.proj.oldtown + G.proj.invest + G.proj.qingchuan) / 3;
  },
  /* 十二月过完，省里的通报就到了 */
  yearEnd: function(){
    Proj.init();
    var yr = Math.round((G.month - 1) / 12);          /* 刚过完第几年 */
    var diff = Proj.avg() - 5 - yr * 13;
    var r = clamp(Math.round(7.5 - diff / 2.6 + (rnd() * 1.6 - 0.8)), 1, 13);
    var last = G.cityRank;
    G.cityRank = r;
    G.rankLog.push({ y: ymOf(G.month - 1).y, r: r });
    var band = r <= 3 ? 'top' : r <= 6 ? 'mid' : r <= 9 ? 'low' : 'bottom';
    if (band === 'top'){ applyFx({ trust:+4, pres:+5, money:+0.8 }); }
    else if (band === 'mid'){ applyFx({ trust:+2, pres:+2, money:+0.4 }); }
    else if (band === 'bottom'){ applyFx({ trust:-3, pres:-5 }); }
    if (r < last) applyFx({ trust:+1 });
    var d = r < last ? '比去年往前走了' + cnCount(last - r) + '位' : r > last ? '比去年掉了' + cnCount(r - last) + '位' : '跟去年一样';
    var line = (YEAR_LINE[band][G.bossType] || YEAR_LINE[band].steady)
      .replace('{R}', cnNum(r)).replace('{D}', d);
    if (band === 'top') meritAdd(ymOf(G.month - 1).y + ' 年度考核，云州全省第 ' + r);
    logAdd('年度考核：第 ' + r);
    return { y: ymOf(G.month - 1).y, r: r, last: last, band: band, line: line, d: d,
             bonus: YEAR_BONUS[band] || '' };
  }
};
