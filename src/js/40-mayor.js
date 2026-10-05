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
    var planned = Mayor.planTurn(s);
    for (var i = planned ? 1 : 0; i < n; i++) Mayor.move(s);
    Mayor.nominate();
  },
  /* 三个月围绕一件事行动，第一月给迹象，后两月落子。占用原有行动额度。 */
  planTurn: function(s){
    if (G.month < 3) return false;
    var plan = G.mayorPlan;
    if (plan && (G.month - plan.start > 2 || (plan.target && (!P(plan.target) || P(plan.target).gone)))) plan = null;
    if (!plan){
      var swing = G.stand.filter(function(id){return !(PDEF[id] || {}).fixed && !P(id).gone && !P(id).held && P(id).side > -40 && P(id).side < 60;});
      var mine = Object.keys(G.people).filter(function(id){var p=P(id);return p.by === 'boss' && p.post && !p.gone && p.side >= 20 && p.loyal < 45 && id !== 'gaoxin';});
      var kind = mine.length ? 'turn' : swing.length && rnd() < 0.65 ? 'pull' : 'dig';
      plan = {kind:kind,target:kind === 'turn' ? pick(mine) : kind === 'pull' ? pick(swing) : null,start:G.month};
      G.mayorPlan = plan;
    }
    if (plan.last === G.month) return true;
    plan.last = G.month;
    var phase = G.month - plan.start, id=plan.target, p=id ? P(id) : null;
    if (phase === 0){
      report(plan.kind === 'pull' ? '陈市长请' + pn(id) + '看了一个项目，说下个月还要单独听他的意见。' : plan.kind === 'turn' ? pn(id) + '最近两次去市政府汇报，都没有先到市委这边来。你上次回访他的日期，已经很远了。' : '市政府办公室在调几份旧材料，连报表上的签字页也要复印。来取材料的人说，下个月还要。');
      return false;
    }
    if (plan.kind === 'pull'){
      var resisted=(G.lobby[id] || 0) > 0 || (G.contacts || {})[id] === G.month || p.held;
      addSide(id,resisted ? -3 : -6);
      report(resisted ? pn(id) + '两边都去坐过。这回他没有顺着陈市长的话表态。' : phase === 1 ? '陈市长又请' + pn(id) + '去了一次，说的是上个月那个项目。' : pn(id) + '在会上接了陈市长的话。前两个月的几次见面，现在有了下文。');
    } else if(plan.kind === 'turn'){
      if (p.by !== 'boss' || !p.post || p.side < 20){ report(pn(id) + '的去向已经变了，市政府那边没有再约他。'); G.mayorPlan=null; return true; }
      var safe=p.loyal >= 45;
      if (!safe && phase === 2 && rnd() < 0.35){ p.side=-40; p.show=Math.max(p.show,25); G.mlog.push({m:G.month,k:'turn',t:pn(id)}); report('市政府给' + pn(id) + '单独安排了一项工作。他给市委送来的月报，开始只写一句「按市里要求落实」。'); }
      else report(safe ? pn(id) + '把市政府找他谈的事告诉了你，说书记交代的事会接着办。' : pn(id) + '又去了市政府，说是协调经费。你的回访安排还没有送到他手里。');
      if (safe) return false;
    } else {
      var protectedNow=G.flags.hu === G.month || own('sw_fu') || own('xinfang') || own('gongan');
      var pressure = own('xinfang') || own('gongan') ? 2 : 4;
      if (own('sw_fu')) pressure--;
      if (G.flags.hu === G.month) pressure=Math.max(1,pressure-1);
      applyFx({heat:pressure,bossRisk:(s >= 55 ? 2.5 : 0.8) * (protectedNow ? 0.7 : 1)});
      report(protectedNow ? '旧材料查到签字页时，你这边补齐了手续。市政府送来的问题清单，少了两项。' : phase === 1 ? '上个月调走的报表，又补要了附件。办公室问你，那几笔数有没有原始凭据。' : '一份按时间排好的问题清单送到了省里。前两个月被调走的材料，都列在后面。');
    }
    return true;
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
