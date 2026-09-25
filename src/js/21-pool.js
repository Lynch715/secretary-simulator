/* ── 21-pool：干部池、冲突对热度、露面 ───────────────────── */
var Pool = {

  init: function(){
    if (!G.heat){
      G.heat = {};
      PAIRS.forEach(function(p){ G.heat[p.id] = p.heat; });
    }
    if (!G.met) G.met = {};
    if (!G.pool){
      G.pool = {};
      POOL.forEach(function(x){ G.pool[x.id] = { fav: x.fav, known: x.known, gone: 0 }; });
    }
  },

  /* 谁在这一头。区县对子取一把手，me 是你自己 */
  side: function(k){
    if (k === 'me') return { n:'你', p:'市委办' };
    if (k === 'boss') return { n:'周维安', p:'市委书记' };
    if (G && G.fac && G.fac.pulled[k] && typeof NAIL !== 'undefined' && NAIL[k]){
      var sc = Fac.succ(k); if (sc && sc.n !== '——') return sc;
    }
    for (var i = 0; i < NPC_DEF.length; i++)
      if (NPC_DEF[i].id === k) return { n:NPC_DEF[i].n, p:NPC_DEF[i].p };
    for (var j = 0; j < QX_DEF.length; j++)
      if (QX_DEF[j].id === k)
        return { n:(G.qxHead && G.qxHead[k]) || QX_DEF[j].head, p:QX_DEF[j].n + '委书记' };
    if (POOL_BY_ID[k]) return { n:POOL_BY_ID[k].n, p:POOL_BY_ID[k].p };
    return { n:k, p:'' };
  },

  heat: function(id){ Pool.init(); return G.heat[id] || 0; },
  addHeat: function(id, v){
    Pool.init();
    if (G.heat[id] == null) return;
    G.heat[id] = clamp(G.heat[id] + v, 0, 100);
  },

  /* 这个人在你眼前出现过一次，班子页才画他 */
  reveal: function(id){
    Pool.init();
    if (POOL_BY_ID[id]) G.met[id] = (G.met[id] || 0) + 1;
  },
  seen: function(id){ Pool.init(); return !!(G.met && G.met[id]); },
  metList: function(){
    Pool.init();
    return POOL.filter(function(x){ return G.met[x.id] && !G.pool[x.id].gone; });
  },

  /* 人事调整落地：这个人真的换了位子 */
  promote: function(id, post){
    Pool.init();
    if (!G.pool[id]) return;
    G.pool[id].post = post;
    G.pool[id].moved = G.month;
    G.met[id] = (G.met[id] || 0) + 1;
  },
  postOf: function(x){
    Pool.init();
    var s = G.pool[x.id];
    return (s && s.post) ? s.post : x.p;
  },

  /* 人事调整落地：换的人真的换 */
  hrMove: function(){
    Pool.init();
    if (G.flags.hrDone) return;
    G.flags.hrDone = G.month;
    if (!G.flags.hr_block_zheng){
      Pool.promote('cg_quzhang', '城关区委书记');
      G.qxHead = G.qxHead || {};
      G.qxHead.chengguan = '郑大林';
      Fac.pull('chengguan', 'hr', true);
    }
    if (G.flags.hr_qin) Pool.promote('bs_fuxian', '白沙县委书记');
    if (G.flags.hr_self){
      G.flags.selfPromoted = G.month;
    } else {
      Pool.promote('fuzhuren', '市委办副秘书长');
    }
  },

  favor: function(id, v){
    Pool.init();
    if (G.pool[id]) G.pool[id].fav = clamp(G.pool[id].fav + v, 0, 100);
  },

  /* 每月：矛盾自己会发酵 */
  /* 热度靠事件推上去，时间只会把它磨平。
     撕破脸之后磨得慢——这才是班子里真实的样子：
     多数人相安无事，少数几对越走越远，而那几对是玩家自己选出来的。 */
  drift: function(){
    Pool.init();
    PAIRS.forEach(function(p){
      var v = G.heat[p.id], d = ri(3) - 1;
      if (rnd() < 0.5) d -= 1;
      if (v >= 70) d = Math.max(d, -1);
      if (p.b === 'me' && G.stats.rep >= 65) d -= 1;
      /* 市长和书记这一对是这局的底色，不管你做什么，一年紧一点 */
      if (p.id === 'p_mayor_boss' && G.month % 12 === 0) d += 3;
      G.heat[p.id] = clamp(v + d, 0, 100);
    });
  },

  /* 秘书长那条规则：你这个月办得越多，他越不舒服 */
  mszRule: function(doneCount, wentToHim){
    Pool.init();
    if (wentToHim) return;
    if (doneCount >= 5) Pool.addHeat('p_msz_me', 4);
    else if (doneCount >= 3) Pool.addHeat('p_msz_me', 2);
  },

  hot: function(min){
    Pool.init();
    return PAIRS.filter(function(p){ return G.heat[p.id] >= (min || 70); });
  },

  /* 热度上来的对子，每月丢一件事到你桌上 */
  pushConflicts: function(){
    if (!G.pairCd) G.pairCd = {};
    /* 到 90 的先摊牌，不再出零碎的冲突待办 */
    var top = Pool.hot(90);
    for (var i = 0; i < top.length; i++){
      var aid = 'sd_' + top[i].id;
      if (!(G.arcs && G.arcs[aid])){ Showdown.start(top[i]); return; }
    }
    var hot = Pool.hot(70).filter(function(p){
      return !(G.pairCd[p.id] && G.pairCd[p.id] > G.month) && !(G.arcs && G.arcs['sd_' + p.id]);
    });
    if (!hot.length) return;
    var p = hot[ri(hot.length)];
    if (G.queue.some(function(q){ return q.pair === p.id && !q.done; })) return;
    G.pairCd[p.id] = G.month + 3;
    var tpl = CONFLICT_TPL[ri(CONFLICT_TPL.length)];
    var it = Desk.pushTpl(tpl, p);
    if (it && G.heat[p.id] >= 90) it.showdown = 1;
  }
};

/* ── 摊牌：热度到 90 的那一对，三幕走完 ── */
var Showdown = {
  start: function(pair){
    if (!G.genArc) G.genArc = {};
    var aid = 'sd_' + pair.id;
    if (G.genArc[aid] || (G.arcs && G.arcs[aid])) return;
    var A = Pool.side(pair.a), B = Pool.side(pair.b);
    function sub(s){
      return String(s == null ? '' : s).replace(/\{A\}/g, A.n).replace(/\{B\}/g, B.n)
        .replace(/\{WHY\}/g, pair.why);
    }
    var stages = SHOWDOWN_TPL.map(function(st, i){
      var next = {};
      if (i < SHOWDOWN_TPL.length - 1) next['*'] = SHOWDOWN_TPL[i + 1].id;
      return {
        id: st.id, src: st.src, gap: st.gap,
        title: sub(st.title), text: sub(st.text), nt: sub(st.nt),
        next: next, lateNext: next['*'] || null,
        neglect: { rep:-3 },
        opts: st.opts.map(function(o){
          var fx = {};
          for (var k in o.fx) fx[k] = o.fx[k];
          if (o.fxA || o.fxB){
            fx.npc = {};
            if (o.fxA) fx.npc[pair.a] = o.fxA;
            if (o.fxB) fx.npc[pair.b] = o.fxB;
          }
          if (o.heat){ fx.heat = {}; fx.heat[pair.id] = o.heat; }
          return { t: sub(o.t), d: o.d, n: sub(o.n), tier: o.tier, rule: o.rule,
                   fx: fx, rk: o.rk };
        })
      };
    });
    G.genArc[aid] = { id: aid, n: A.n + ' 和 ' + B.n, stages: stages };
    Pool.reveal(pair.a); Pool.reveal(pair.b);
    Arcs.start(aid);
  }
};
