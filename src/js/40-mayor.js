/* ── 40-mayor：市长也在下棋。同一套动作，他挑最划算的 ── */
var Mayor = {
  sight: function(){
    if (own('sz_ms')) return 1;
    if (own('fb_zr')) return 0.6;
    return 0.22;
  },
  seen: function(kind, t){
    G.mlog.push({ m: G.month, k: kind, t: t });
    if (rnd() < Mayor.sight() || kind === 'hit') report(t);
  },
  turn: function(){
    if (P('mayor').gone) return;
    var s = shi();
    var n = s >= 50 ? 3 : (s >= 36 ? 2 : 1);
    if (G.flags.mayorWeak && G.month - G.flags.mayorWeak < 4) n = 1;
    for (var i = 0; i < n; i++) Mayor.move(s);
    Mayor.nominate();
  },
  move: function(s){
    var opts = [];
    var swing = G.stand.filter(function(id){ var p = P(id); var d = PDEF[id] || {}; return !d.fixed && !p.gone && p.side > -40 && p.side < 60 && !p.held; });
    if (swing.length) opts.push(['pull', 5]);
    var mine = Object.keys(G.people).filter(function(id){ var p = P(id); return p.by === 'boss' && p.post && !p.gone && p.side >= 20 && p.loyal < 40 && id !== 'gaoxin'; });
    if (mine.length) opts.push(['turn', 4]);
    var dirty = Object.keys(G.people).filter(function(id){ var p = P(id); return p.by === 'boss' && p.post && !p.gone && p.dirt; });
    if (dirty.length && G.month > 6) opts.push(['hit', 2]);
    opts.push(['dig', s >= 55 ? 4 : 2]);
    var tot = opts.reduce(function(a, o){ return a + o[1]; }, 0), r = rnd() * tot, k = opts[0][0];
    for (var i = 0; i < opts.length; i++){ r -= opts[i][1]; if (r <= 0){ k = opts[i][0]; break; } }

    if (k === 'pull'){
      var t = swing.sort(function(a, b){ return Math.abs(P(a).side) - Math.abs(P(b).side); })[ri(Math.min(3, swing.length))];
      addSide(t, (G.lobby[t] ? -3 : -6));
      Mayor.seen('pull', pick(ML_TXT.pull).replace('{N}', pn(t)));
    } else if (k === 'turn'){
      var c = pick(mine);
      if (rnd() < 0.35){
        P(c).side = -40; if (!P(c).known.side || true) P(c).show = Math.max(P(c).show, 25);
        G.mlog.push({ m: G.month, k: 'turn', t: pn(c) });
        if (own('sz_ms')) report(pick(ML_TXT.turn).replace('{N}', pn(c)));
      }
    } else if (k === 'hit'){
      var h = pick(dirty);
      if (rnd() < 0.3 + (own('gongan') ? -0.15 : 0.1)){
        report(ML_TXT.hit[0].replace('{N}', pn(h)));
        var post = P(h).post; P(h).gone = 'hit'; vacate(post);
        applyFx({ prestige: -4, trust: -2 });
        logIt(pn(h) + '出事了。');
      }
    } else {
      var d = own('xinfang') || own('gongan') ? 2 : 4;
      if (own('sw_fu')) d -= 1;
      /* 市长手里有哪些部门，随机用一个来打你，副职是自己人能顶回去 */
      var mdept = ['gongan', 'jcz', 'jw_fu', 'shenji', 'xinfang', 'rb', 'gd'].filter(function(dp){ return mayors(dp); });
      if (mdept.length && rnd() < 0.6){
        var dep = pick(mdept), line = Ops.mayorHit(dep);
        var blocked = line === (MOP_BLOCK[dep] || null) && MOP_BLOCK[dep];
        applyFx({ heat: blocked ? 1 : d, bossRisk: (s >= 55 ? 2.5 : 0.8) * (blocked ? 0.4 : 1) });
        Mayor.seen('dig', line.replace(/\{N\}/g, (function(){ var m = Object.keys(G.people).filter(function(id){ return P(id).by === 'boss' && P(id).post && !P(id).gone; }); return m.length ? pn(pick(m)) : '你的人'; })()));
      } else {
        applyFx({ heat: d, bossRisk: s >= 55 ? 2.5 : 0.8 });
        Mayor.seen('dig', pick(ML_TXT.dig));
      }
    }
  },
  /* 每个空出来的位子，他都报一个人 */
  nominate: function(){
    vacancies().forEach(function(post){
      if (G.mnoms[post]) return;
      var pl = POST_BY_ID[post].lvl;
      var taken = Object.keys(G.mnoms).map(function(k){ return G.mnoms[k]; });
      var c = Object.keys(G.people).filter(function(id){ var p = P(id); return !p.gone && !p.post && !isStanding(id) && p.side <= -20 && p.lvl >= pl - 1 && p.lvl <= pl && taken.indexOf(id) < 0; });
      if (!c.length) return;
      var x = pick(c);
      G.mnoms[post] = x;
      P(x).met = true;
      if (rnd() < Math.max(Mayor.sight(), 0.5)) report(ML_TXT.nom[0].replace('{P}', POST_BY_ID[post].n).replace('{N}', pn(x)));
    });
  },
  /* 每季度一回突袭 */
  ambush: function(){
    var list = [
      function(){ if (own('xinfang')){ report('一封告书记的信到了市信访局。马春来的位子上现在是你们的人，信在他抽屉里压了三天，然后按程序转给了纪委，只转了复印件。'); applyFx({ bossRisk: 2 }); }
        else { report('一封告书记的信到了省里。信里说云州的招商数字有水分，附了高新区的三张报表。'); applyFx({ bossRisk: 6, prestige: -3 }); } },
      function(){ report('城关区一百多户拆迁户坐到了市政府门口。陈立群亲自下楼接待，站在台阶上讲了半个钟头。第二天本地报纸头版是他的照片。'); applyFx({ prestige: -3, feud: 4 }); },
      function(){ report('省报登了一篇稿子，写云州「个别领导急于求成」。没点名，配图是高新区一片推平的空地。'); applyFx({ prestige: -3 }); addSide('xuanchuan', -5); },
      function(){ var sw = G.stand.filter(function(id){ return !(PDEF[id] || {}).fixed && P(id).side > -20 && P(id).side < 40; }); if (!sw.length) return;
        var t = pick(sw); addSide(t, -8); report('常委会前一天晚上，陈立群请' + pn(t) + '吃了顿饭。第二天会上，' + pn(t) + '说话的调子变了。'); }
    ];
    pick(list)();
  }
};
