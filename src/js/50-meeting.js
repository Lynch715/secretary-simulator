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

  hard: function(res){
    res.pass = true; res.hard = true;
    G.hard = (G.hard || 0) + 1;
    applyFx({ prestige: -12, feud: 8, bossRisk: G.hard >= 3 ? 10 : 4 });
    res.rows.forEach(function(r){ if (!r.yes) addSide(r.id, -4); });
    logIt('书记在常委会上集中拍了板。');
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
    var rows = [];
    POSTS.forEach(function(po){
      var post = po.id;
      if (!vacant(post) && !G.noms[post]) return;
      if (!vacant(post)){ delete G.noms[post]; return; }
      var bN = G.noms[post], mN = G.mnoms[post];
      if (bN && (P(bN).gone || (P(bN).post && P(bN).post !== post && !vacant(P(bN).post) && false))) bN = null;
      var done = false;
      [[bN, 'boss'], [mN, 'mayor']].forEach(function(pair){
        var x = pair[0], s = pair[1];
        if (done || !x || P(x).gone || P(x).post === post) return;
        var votes = G.stand.map(function(id){ return { id: id, yes: Meeting.support(id, x, s, post) > 0 }; });
        var yes = votes.filter(function(v){ return v.yes; }).length;
        var pass = yes >= 6;
        rows.push({ post: post, x: x, s: s, votes: votes, yes: yes, pass: pass });
        if (s === 'boss') propFin(function(r){ return r.kind === 'nom' && r.a === x && r.b === post; }, pass ? '调整会上通过，' + pn(x) + '任' + POST_BY_ID[post].n : '调整会上没过，' + yes + ' 比 ' + (11 - yes));
        if (pass){ placeIn(post, x, s); done = true; Meeting.afterPlace(x, post, s); }
      });
      if (!done){
        var pl = po.lvl;
        var c = Object.keys(G.people).filter(function(id){ var p = P(id); return !p.gone && !p.post && !isStanding(id) && p.lvl >= pl - 1 && Math.abs(p.side) < 20 && PDEF[id]; });
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
    logIt(pn(x) + '任' + POST_BY_ID[post].n + '。');
    G.stand.forEach(function(sid){
      wantsOf(sid).forEach(function(w){
        if (w.kind !== 'place' || w.ids.indexOf(x) < 0 || (w.post && w.post !== post) || G.wd[w.id + '_full']) return;
        var pr = G.promises.filter(function(q){ return q.w === w.id && q.st === 'open'; })[0];
        if (pr || !G.wd[w.id]){
          var g = pr ? w.gain - Math.ceil(w.gain / 2) : w.gain;
          if (pr) pr.st = 'kept';
          G.wd[w.id] = 1; G.wd[w.id + '_full'] = 1; G.wk[w.id] = 1; addSide(sid, g + 2);
          report(pn(sid) + '知道了' + pn(x) + '的事。那天常委会散会，' + pn(sid) + '等书记先走了，才起身。');
        }
      });
    });
    if (post === 'gongan' && BATTLES.b2 && G.month === 8) G.flags.b2own = 1;
  }
};

