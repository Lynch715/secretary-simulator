/* ── 50-events：事件调度（once / cd / 权重 / 月份区间）────── */
var Events = {

  /* 这个月能不能抽到它 */
  ok: function(e){
    if (e.hidden || e.fixed || e.final) return false;
    if (e.once && G.seen[e.id]) return false;
    if (G.cool[e.id] && G.cool[e.id] > G.month) return false;
    if (e.mo && (G.month < e.mo[0] || G.month > e.mo[1])) return false;
    if (e.cm && e.cm.indexOf(ymOf(G.month).m) < 0) return false;   /* 只在某几个自然月出 */
    if (Desk.has(e.id)) return false;
    if (e.fam && G.hidden.famBroken) return false;
    if (e.orig && e.orig !== G.origin) return false;
    if (e.rankMin && (G.rank || 0) < e.rankMin) return false;
    return true;
  },

  /* 月初把队列补到 4~6 件 */
  fill: function(){
    Pool.init();
    Pool.pushConflicts();
    Slots.gen();
    Arcs.tick();
    Talk.gen();
    Cut.gen();
    Meeting.gen();
    if (G.month === 1 && !G.seen.first_speech){
      G.queue.length = 0;
      Desk.push('first_speech', 'month');
      return;
    }
    /* 家庭压力满了，下月必出一件家里的事；
       就算一切都好，家里也不会连着三个月没动静 */
    var needFam = (G.hidden.fam >= 6) ||
                  (G.month >= 4 && G.month - (G.flags.famLastMo || 0) >= 3);
    if (needFam && !Desk.hasFam()){
      var fams = EVENTS.filter(function(e){ return e.fam && Events.ok(e); });
      if (fams.length) Desk.push(pick(fams).id, 'month');
    }
    var want = 4 + ri(3);
    var guard = 0;
    while (Desk.live() < want && guard++ < 60){
      var pool = EVENTS.filter(Events.ok);
      if (!pool.length) break;
      var total = 0, i;
      for (i = 0; i < pool.length; i++) total += (pool[i].w || 3);
      var r = rnd() * total, e = pool[pool.length - 1];
      for (i = 0; i < pool.length; i++){
        r -= (pool[i].w || 3);
        if (r <= 0){ e = pool[i]; break; }
      }
      Desk.push(e.id, rnd() < 0.62 ? 'month' : 'next');
    }
    if (Desk.hasFam()) G.flags.famLastMo = G.month;
    Echo.gen();
    Own.gen();
  }
};
