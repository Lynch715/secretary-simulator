/* ── 50-meeting：常委会。表决、调整会、硬拍板 ── */
var Meeting = {
  noise: function(){ return ri(13) - 6; },

  /* 议题表决：一个人投不投书记这边 */
  score: function(id, b){
    var p = P(id), d = PDEF[id] || {};
    if (id === 'boss') return 99;
    if (id === 'mayor') return -99;
    var v = p.side;
    var tags = b.tags || [];
    if (d.bottom && tags.indexOf(d.bottom) >= 0){
      if (d.bottom === 'hr') v = p.side * 0.3 + (Meeting.seatPromised(id) ? 30 : 0);
      else if (d.bottom === 'cui') v = Meeting.hasPromise('keep_cui') ? 20 : -30;
      else v = -30;
      if (p.held || p.turned) v += 20;
    } else if (p.held && v < 5) v = 5;
    v += Work.voteMemory(id, b.id);
    v += (b.mods || {})[id] || 0;
    v += ((G.bmods[b.id] || {})[id]) || 0;
    v += (G.lobby[id] || 0) * 6;
    v += b.noise ? b.noise[id] : 0;
    return v;
  },
  seatPromised: function(id){ return G.promises.some(function(x){ return x.who === id && x.key === 'mayor_seat' && x.st === 'open'; }); },
  hasPromise: function(k){ return G.promises.some(function(x){ return x.key === k && x.st === 'open'; }); },

  /* 票面预览：玩家看见的是每个人的档位，不是结果 */
  preview: function(){
    return G.stand.map(function(id){ return { id: id, tier: tierOf(P(id).side) }; });
  },

  vote: function(bid){
    var b = Object.assign({ id: bid }, BATTLES[bid] || TOPIC_BY_ID[bid]);
    b.noise = {};
    G.stand.forEach(function(id){ b.noise[id] = Meeting.noise(); });
    var rows = G.stand.map(function(id){ return { id: id, yes: Meeting.score(id, b) > 0 }; });
    var yes = rows.filter(function(r){ return r.yes; }).length;
    applyFx({ feud: 3 });
    return { bid: bid, topic: b.topic, rows: rows, yes: yes, pass: yes >= 6 };
  },

  /* 硬拍板：票输了，书记不认这个结果。差的票越多，代价越大 */
  hardCost: function(yes){ return 6 + 3 * (6 - yes); },
  canHard: function(yes){ return G.prestige >= Meeting.hardCost(yes) + 8; },
  hard: function(res){
    var need = 6 - res.yes, cost = Meeting.hardCost(res.yes);
    res.pass = true; res.hard = true;
    G.hard = (G.hard || 0) + 1; G.hardNow = true;
    applyFx({ prestige: -cost, feud: 6 + 2 * need, bossRisk: (G.hard >= 3 ? 8 : 2) + 2 * need });
    res.rows.forEach(function(r){ if (!r.yes && r.id !== 'mayor') addSide(r.id, -6); });
    logIt('书记在常委会上压下了 ' + (11 - res.yes) + ' 张反对票。');
    var t = G.hard === 1 ? { t:'省委办公厅来了个电话，问云州常委会最近的议事情况。电话是打给邱仲华的，邱仲华挂了电话，在办公室坐了很久，没有来找书记。', fx:{ bossRisk: 2 } }
      : (G.hard === 2 ? { t:'省委组织部的一位副部长来云州调研，行程上只有一项：跟市委常委逐个谈话。每人二十分钟。书记排在最后一个，谈了一个钟头。', fx:{ prestige: -4, bossRisk: 5 } }
      : { t:'省委书记在全省的会上讲了一段话，没点名：「有的地方，一把手说了算，常委会成了举手会。」散会的时候，好几个地市的书记往周书记这边看了一眼。', fx:{ prestige: -6, bossRisk: 8 } });
    G.echoes = G.echoes || []; G.echoes.push({ m: G.month + 1 + ri(2), t: t.t, fx: t.fx });
    return { cost: cost, no: 11 - res.yes };
  },

  /* ── 调整会 ── */
  support: function(mid, x, s, post){
    if (mid === 'boss') return s === 'boss' ? 99 : -99;
    if (mid === 'mayor') return s === 'mayor' ? 99 : -99;
    var p = P(mid);
    var v = s === 'boss' ? p.side : -p.side;
    if (mid === 'depsec') v *= 0.3;
    wantsOf(mid).forEach(function(w){
      if (w.kind === 'place' && w.ids.indexOf(x) >= 0 && (!w.post || w.post === post)) v += 45;
    });
    if (mid === 'zhengfa' && post === 'gongan') v = x === 'guozc' ? 60 : -60;
    if (mid === 'jiwei' && post === 'jw_fu' && s === 'boss' && P(x).cap >= 2) v += 12;
    if (s === 'boss' && G.flags['poge_' + post]) v -= 12;
    if (s === 'boss') v += (G.lobby[mid] || 0) * 6;
    if (p.held && s === 'boss' && v < 5) v = 5;
    return v + Meeting.noise();
  },

  hrRun: function(){
    var rows = [], tried = [];   /* 这次会上被否掉的人，组织部不会转手再安排 */
    var open0 = vacancies();      /* 会上才空出来的位子，留到下一次调整会 */
    POSTS.forEach(function(po){
      var post = po.id;
      if (vacant(post) && open0.indexOf(post) < 0) return;
      if (!vacant(post) && !G.noms[post]) return;
      if (!vacant(post)){ delete G.noms[post]; return; }
      var bN = G.noms[post], mN = G.mnoms[post];
      if (bN && (P(bN).gone || (P(bN).post && P(bN).post !== post && !vacant(P(bN).post) && false))) bN = null;
      var done = false;
      /* 两边报的是同一个人：只上一次会，谁那边都算 */
      var both = bN && bN === mN;
      var pairs = both ? [[bN, 'both']] : [[bN, 'boss'], [mN, 'mayor']];
      pairs.forEach(function(pair){
        var x = pair[0], s = pair[1];
        if (done || !x || P(x).gone || P(x).post === post) return;
        if (s !== 'both') tried.push(x);
        var votes = G.stand.map(function(id){ return { id: id, yes: s === 'both' ? (Meeting.support(id, x, 'boss', post) > 0 || Meeting.support(id, x, 'mayor', post) > 0) : Meeting.support(id, x, s, post) > 0 }; });
        var yes = votes.filter(function(v){ return v.yes; }).length;
        var pass = yes >= 6;
        rows.push({ post: post, x: x, s: s, votes: votes, yes: yes, pass: pass });
        var ss = s === 'both' ? 'boss' : s;
        if (ss === 'boss') propFin(function(r){ return r.kind === 'nom' && r.a === x && r.b === post; }, pass ? '调整会上通过，' + pn(x) + '任' + POST_BY_ID[post].n : '调整会上没过，' + yes + ' 比 ' + (11 - yes));
        if (pass){
          var from = P(x).post;
          placeIn(post, x, s === 'both' ? null : s); done = true; Meeting.afterPlace(x, post, ss);
          if (from && POST_BY_ID[from]) G.nextReport.push(pn(x) + '一走，' + POST_BY_ID[from].n + '的位子空了出来。组织部说下一次调整会上定。');
        }
        else if (s === 'both') tried.push(x);
      });
      if (!done){
        var pl = po.lvl;
        var c = Object.keys(G.people).filter(function(id){ var p = P(id); return !p.gone && !p.post && !isStanding(id) && tried.indexOf(id) < 0 && p.lvl >= pl - 1 && Math.abs(p.side) < 20 && PDEF[id]; });
        if (c.length){ var z = pick(c); placeIn(post, z, null); rows.push({ post: post, x: z, s: 'zuzhi', pass: true }); }
      }
      if (bN) propFin(function(r){ return r.kind === 'nom' && r.a === bN && r.b === post; }, '没上会');
      delete G.noms[post]; delete G.mnoms[post]; delete G.flags['poge_' + post];
    });
    applyFx({ feud: rows.some(function(r){ return r.s !== 'zuzhi'; }) ? 2 : 0 });
    return rows;
  },

  afterPlace: function(x, post, s){
    if (s !== 'boss') return;
    Work.appoint(x, post);
    logIt(pn(x) + '任' + POST_BY_ID[post].n + '。');
    G.stand.forEach(function(sid){
      wantsOf(sid).forEach(function(w){
        if (w.kind !== 'place' || w.ids.indexOf(x) < 0 || (w.post && w.post !== post) || G.wd[w.id + '_full']) return;
        var pr = G.promises.filter(function(q){ return q.w === w.id && q.st === 'open'; })[0];
        if (pr || !G.wd[w.id]){
          var g = pr ? w.gain - Math.ceil(w.gain / 2) : w.gain;
          if (pr){ pr.st = 'kept'; Work.remember(sid, 'kept_' + w.id, '答应的人选到了任，你把任命文件亲手送给了他。', 2); }
          G.wd[w.id] = 1; G.wd[w.id + '_full'] = 1; G.wk[w.id] = 1; addSide(sid, g + 2);
          report(pn(sid) + '知道了' + pn(x) + '的事。那天常委会散会，' + pn(sid) + '等书记先走了，才起身。');
        }
      });
    });
    if (post === 'gongan' && BATTLES.b2 && G.month === 8) G.flags.b2own = 1;
  }
};

