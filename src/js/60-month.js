/* ── 60-month：一个月怎么走 ── */
/* 戏里要用的人，组织部不挪 */
var ROT_KEEP = ['gangkou', 'chengguan', 'qingchuan', 'zhujian', 'sz_ms', 'fb_zr', 'cg_quzhang', 'qc_xianzhang', 'ml_xz', 'gx_qz'];
var Month = {
  start: function(first){
    G.acts = G.school ? 0 : 3;
    G.props = []; G.lobby = {};
    G.sceneDone = false; G.sceneRes = null;
    G.meet = null; G.hrRes = null;
    if (!first) G.report = G.nextReport || [];
    G.nextReport = [];
    G.scene = Month.pickScene();
    var sc = SCENES[G.scene];
    if (sc && sc.fn) sc.fn();
    G.scene2 = Month.pickDark(); G.scene2Done = false; G.scene2Res = null;
    var sc2 = SCENES[G.scene2];
    if (sc2 && sc2.fn) sc2.fn();
    G.topic = Month.pickTopic(); G.topicDone = false;
    if (G.school){ G.sceneDone = true; G.scene2Done = true; }
  },

  pickScene: function(){
    if (G.school) return null;
    if (G.flags.dropNow){ delete G.flags.dropNow; return 'drop'; }
    if (G.flags.forceH90){ delete G.flags.forceH90; G.seen.h90 = G.month; return 'h90'; }
    var hs = [90, 70, 50, 30].filter(function(t){ return G.heat >= t && !G.seen['h' + t]; });
    if (hs.length && !SCHEDULE[G.month]){ var h = 'h' + hs[0]; G.seen[h] = G.month; return h; }
    if (hs.length && hs[0] >= 70){ var h2 = 'h' + hs[0]; G.seen[h2] = G.month; return h2; }
    if (SCHEDULE[G.month]){ G.seen[SCHEDULE[G.month]] = G.month; return SCHEDULE[G.month]; }
    var c = FILLERS.filter(function(f){
      if (f.once && G.seen[f.id]) return false;
      if (f.cd && G.seen[f.id] && G.month - G.seen[f.id] < f.cd) return false;
      return f.c();
    });
    if (!c.length) return null;
    var tot = c.reduce(function(a, f){ return a + f.w; }, 0), r = rnd() * tot;
    for (var i = 0; i < c.length; i++){ r -= c[i].w; if (r <= 0){ G.seen[c[i].id] = G.month; return c[i].id; } }
    G.seen[c[0].id] = G.month; return c[0].id;
  },

  /* 暗线：一个月最多一幕 */
  pickDark: function(){
    if (G.school || G.month < 3) return null;
    var best = null;
    DARK.forEach(function(d){
      if (G.seen[d.id]) return;
      if (G.month > d.win[1]){ G.seen[d.id] = -1; return; }
      if (G.month < d.win[0]) return;
      if (d.after && !G.seen[d.after]) return;
      if (d.after && G.seen[d.after] > 0 && G.month - G.seen[d.after] < 3) return;
      if (d.c && !d.c()) return;
      if (!best || d.win[1] < best.win[1]) best = d;
    });
    if (!best) return null;
    if (G.month - (G.lastDark || -9) < 2 && G.month < best.win[1] - 1) return null;
    G.seen[best.id] = G.month; G.lastDark = G.month;
    return best.id;
  },

  /* 常规常委会：每季度一次，交锋开会那个月不另开 */
  pickTopic: function(){
    if (G.month % 3 !== 0 || G.month >= TERM || Month.voteDue()) return null;
    G.tUsed = G.tUsed || {};
    var c = TOPICS.filter(function(t){ return !G.tUsed[t.id] || G.month - G.tUsed[t.id] > 20; });
    if (!c.length) return null;
    var t = pick(c); G.tUsed[t.id] = G.month;
    return t.id;
  },
  topicDue: function(){ return G.topic && !G.topicDone ? G.topic : null; },
  topicResult: function(tid, pass){
    var t = TOPIC_BY_ID[tid];
    G.topicDone = true;
    applyFx(pass ? t.win : t.lose);
    if (pass) G.tWin = (G.tWin || 0) + 1; else G.tLose = (G.tLose || 0) + 1;
    logIt('常委会·' + t.topic + '：' + (pass ? '过了' : '没过') + '。');
    G.nextReport.push(pass ? t.winT : t.loseT);
  },

  choose: function(i, slot){
    if (slot === 2){
      var s2 = SCENES[G.scene2]; if (!s2 || G.scene2Done) return null;
      var o2 = s2.opts[i];
      if (o2.req && !o2.req()) return null;
      var got2 = applyFx(o2.fx || {});
      if (o2.fn) o2.fn();
      G.scene2Done = true;
      G.scene2Res = { i: i, t: fill(o2.resFn ? o2.resFn() : o2.res), got: got2 };
      G.chose = G.chose || {}; G.chose[G.scene2] = i;
      return G.scene2Res;
    }
    var sc = SCENES[G.scene]; if (!sc || G.sceneDone) return null;
    var o = sc.opts[i];
    if (o.req && !o.req()) return null;
    var got = applyFx(o.fx || {});
    if (o.fn) o.fn();
    G.sceneDone = true;
    var res = o.resFn ? o.resFn() : o.res;
    G.sceneRes = { i: i, t: fill(res), got: got };
    G.chose = G.chose || {}; G.chose[G.scene] = i;
    return G.sceneRes;
  },

  /* 这个月要开的会 */
  voteDue: function(){
    for (var k in BATTLES){ var b = BATTLES[k]; if (b.mo === G.month && !b.kind && !G.battles[k]) return k; }
    return null;
  },
  hrDue: function(){ return HR_MONTHS.indexOf(G.month) >= 0 || G.flags.hrnow === G.month; },

  battleResult: function(bid, pass){
    var b = BATTLES[bid];
    G.battles[bid] = pass ? 'win' : 'lose';
    if (bid === 'b8') return;
    var fx = pass ? b.win : b.lose;
    if (bid === 'b1' && G.flags.b1_soft) fx = { prestige: 4, money: 1, trust: 2 };
    if (bid === 'b3' && G.flags.b3_soft && pass) fx = { prestige: 5, trust: 2, side: { cg_quzhang: 10 } };
    if (bid === 'b3' && G.flags.b3_force && pass) fx = Object.assign({}, fx, { prestige: 11 });
    applyFx(fx);
    if (pass){ G.won++; G.streak++; } else { G.lost++; G.streak = 0; }
    G.cwWins.push(pass ? 1 : 0);
    logIt(b.n + '：' + (pass ? '赢了' : '输了') + '。');
    G.nextReport.push(fill(pass ? b.winT : b.loseT));
    if (bid === 'b3' && pass){ Grip.add('chengguan', 2); }
    if (!pass && G.heat >= 55) Month.maybeDrop(0.5);
  },

  end: function(){
    G.inEnd = true;
    /* 本月的会（界面上没开的，这里补上） */
    var vb = Month.voteDue();
    if (vb){ var r = Meeting.vote(vb); Month.battleResult(vb, r.pass); }
    var tp = Month.topicDue();
    if (tp){ var rt = Meeting.vote(tp); Month.topicResult(tp, rt.pass); }
    Month.decide();
    if (Month.hrDue() && !G.hrRes){ G.hrRes = Meeting.hrRun(); }
    if (HR_MONTHS.indexOf(G.month) >= 0) Month.rotate();
    Month.afterHr();

    /* 省里决的那一仗 */
    if (G.month === BATTLES.b4.mo && !G.battles.b4){
      var sc = Grip.level('qingchuan') * 2 + (P('jiwei').side >= 15 ? 2 : 0) + (G.flags.b4_song ? 1 : 0) + (G.flags.b4_open ? 1 : 0) + (G.flags.b4_pages ? 2 : 0) - (G.flags.b4_shut ? 2 : 0);
      var win = sc >= 5;
      Month.battleResult('b4', win);
      if (win){ if (!P('qingchuan').gone) Grip.remove('qingchuan', 'jw'); if (!P('lvhq').gone) P('lvhq').gone = 'jw'; Grip.add('zhengfa', 2); }
    }
    /* 副市长：放卢志高上去那一手 */
    if (G.month === 20 && G.flags.b5_lu && !G.battles.b5){
      G.battles.b5 = 'lu';
      if (!P('zhujian').gone){ var zp = P('zhujian'); vacate('zhujian'); zp.gone = 'up'; zp.p = '副市长'; }
      G.nextReport.push('卢志高当了副市长。住建局长的位子空了出来。陈立群那边报人报得很快，比你想的还快。');
      logIt('卢志高升了副市长，住建局空了出来。');
    }

    Mayor.turn();
    if (G.month % 4 === 2 && G.month > 4) Mayor.ambush();

    /* 挂着的事 */
    G.pending = G.pending.filter(function(x){
      if (x.mo > G.month) return true;
      if (x.k === 'pull') Grip.resolve(x);
      if (x.k === 'mayor') Month.mayorFall();
      if (x.k === 'move' && !G.ending){ Grip.remove('mayor', 'prov'); Month.finish('mayor_moved'); }
      return false;
    });
    if (G.ending) return Month.close();

    Month.drift();
    checkPromises();
    RETIRE.forEach(function(r){ if (r.mo === G.month + 1){ var h = holder(r.post); if (h && h === POST_BY_ID[r.post].holder){ P(h).gone = 'retire'; vacate(r.post); G.nextReport.push(r.t); } } });

    if (calMonth(G.month) === 12) Month.yearRank();
    if (calMonth(G.month) === 12 && G.month < TERM) Month.budget();

    Month.check();
    return Month.close();
  },

  /* 每次调整会后，组织部再挪一个人：到龄的、交流的。下一回就空出一个位子 */
  rotate: function(){
    var c = POSTS.filter(function(p){ var h = holder(p.id); return h && !p.locked && P(h).by !== 'boss' && camp(h) !== 1 && !isStanding(h) && ROT_KEEP.indexOf(h) < 0 && !RETIRE.some(function(r){ return r.post === p.id && POST_BY_ID[r.post].holder === h; }); }).map(function(p){ return p.id; });
    if (!c.length) return;
    c.sort(function(a, b){ return P(holder(b)).age - P(holder(a)).age; });
    var post = rnd() < 0.6 ? c[0] : pick(c);
    var h = holder(post), p = P(h);
    var old = p.age >= 56;
    p.gone = old ? 'retire' : 'moved';
    vacate(post);
    G.nextReport.push(old ? p.n + '到龄，' + POST_BY_ID[post].n + '的位子空了出来。他说退下来也好，可以回老家种菜。' : p.n + '交流去了邻市。' + POST_BY_ID[post].n + '的位子空着，组织部说下一次调整会上定。');
  },

  /* 不靠投票决的几仗 */
  decide: function(){
    var f = G.flags, s;
    if (G.month === BATTLES.b9.mo && !G.battles.b9){
      s = Grip.mayorLv().reduce(function(a, b){ return a + b; }, 0) + (f.b9_give ? 3 : 0) + Math.min(G.removed.length, 3) - Math.floor(G.bossRisk / 20) - (f.b9_full && G.bossRisk > 40 ? 2 : 0) + (f.d3_clean ? 1 : 0);
      var w9 = s >= 4;
      Month.battleResult('b9', w9);
      if (w9){ Grip.add('mayor', 3); G.flags.mayorWeak = G.month; }
    }
    if (G.month === BATTLES.b11.mo && !G.battles.b11){
      s = (G.battles.b3 === 'win' ? -2 : 2) + (f.b11_open ? 2 : 0) - (f.b11_shut ? 2 : 0) + (own('zhujian') ? 2 : 0) + (own('gongan') ? 1 : 0) + (f.b11_self ? 2 : 0) + (f.b11_log ? 2 : 0) + (Grip.level('zhujian') >= 2 ? 1 : 0) + ri(2);
      var w11 = s >= 4;
      Month.battleResult('b11', w11);
      if (w11){
        var hz = holder('zhujian'), hc = holder('cg_sj');
        if (hz && camp(hz) === -1) Grip.remove(hz, 'diao');
        else if (hc && camp(hc) === -1) Grip.remove(hc, 'diao');
      }
    }
    if (G.month === BATTLES.b12.mo && !G.battles.b12){
      var cty = ['cg_sj', 'gx_sj', 'gk_sj', 'qc_sj', 'bs_sj', 'ml_sj'].filter(own).length;
      s = cty + (shi() - 50) / 8 + (f.b12_heads ? 1 : 0) + (f.b12_check ? 2 : 0) + (f.b12_song ? 1 : 0) + (f.b12_visit ? 1 : 0) + (f.b12_word ? 1 : 0) + (f.b12_du ? 1 : 0) + ri(3) - 1;
      Month.battleResult('b12', s >= 4);
    }
  },

  afterHr: function(){
    if (G.month === 8 && !G.battles.b2){
      var w = own('gongan');
      Month.battleResult('b2', w);
    }
  },

  drift: function(){
    G.school = Math.max(0, G.school - (G.school ? 1 : 0));
    Object.keys(G.people).forEach(function(id){
      var p = P(id);
      if (p.by === 'boss' && p.post && !p.gone && id !== 'gaoxin'){ p.loyal = Math.max(0, p.loyal - (G.school ? 8 : 4)); }
      if (p.grudge && p.turned && shi() < 50 && rnd() < 0.06){
        p.turned = 0; p.side = -40; applyFx({ heat: 10 });
        G.nextReport.push(pn(id) + '在一次会上，把书记私下跟他说的一句话讲了出来。一字不差。');
      }
    });
    applyFx({ heat: -(own('sw_fu') ? 4 : 3), feud: -2 });
    if (G.bossRisk > 0 && G.bossRisk < 70) G.bossRisk = Math.max(0, G.bossRisk - 1);
    /* 省里嫌吵 */
    if (G.feud >= 100 && !G.ending){ Month.finish('both_out'); }
    /* 弃子：书记这边吃了亏，你身上又太热 */
    if (!G.school && G.heat >= 60 && (shi() < 35 || G.feud >= 80)) Month.maybeDrop(0.35);
  },

  maybeDrop: function(p){
    if (G.school || G.flags.dropNow) return;
    var t = { steady:1, strong:0.45, shrewd:1.4 }[G.bossType];
    var q = p * t - (G.trust - 55) / 100 - (hasGrip(2) ? 0.15 : 0);
    if (rnd() < q) G.flags.dropNow = 1;
  },

  yearRank: function(){
    var y = Math.ceil(G.month / 12);
    var wins = G.cwWins.slice(-4).reduce(function(a, b){ return a + b; }, 0);
    var r = clamp(Math.round(10 - (shi() - 35) / 5 - wins * 0.6 + (ri(3) - 1)), 1, 13);
    var last = G.rankYear[G.rankYear.length - 1];
    G.rankYear.push(r);
    var t = r <= 3 ? RANK_TXT.top : (r <= 9 ? RANK_TXT.mid : RANK_TXT.low);
    G.nextReport.push(t.replace('{R}', r).replace('{UD}', r < last ? '前进了' + (last - r) + '位' : (r > last ? '退了' + (r - last) + '位' : '一样')));
    if (r <= 3) applyFx({ prestige: 5, trust: 4 });
    else if (r <= 6) applyFx({ prestige: 2, trust: 2 });
    else if (r >= 10) applyFx({ prestige: -5, trust: -3, feud: 5 });
    logIt(y + ' 年，全省第 ' + r + '。');
  },

  budget: function(){
    var m = own('caizheng') ? 5 : (mayors('caizheng') ? 2 : 3);
    G.money = clamp(G.money + m, 0, 9);
    Object.keys(G.people).forEach(function(id){ if (G.people[id].yrs != null) G.people[id].yrs++; });
    G.nextReport.push('新一年的盘子排下来了。' + (own('caizheng') ? '财政局这回是先把表送到市委这边的。' : (mayors('caizheng') ? '财政局报上来的表，书记能动的那几格，又比去年少了。' : '财政局报上来的表，能动的就那么几格。')));
  },

  mayorFall: function(){
    if (G.ending) return;
    var press = G.removed.filter(function(r){ return G.month - r.m <= 12; }).length;
    var p = clamp(0.06 * press - (G.flags.b8_noodle ? 0.1 : 0) - (G.flags.mayor_tea ? 0.05 : 0), 0, 0.45);
    Grip.remove('mayor', 'jw');
    Month.finish(rnd() < p ? 'mayor_gone' : 'mayor_fall');
  },

  h90: function(){
    if ((G.flags.gray || 0) >= 2 || G.flags.took_bag){ Month.finish('you_fall'); return; }
    G.heat = 20; G.flags.mayorWeak = G.month;
    Grip.add('mayor', 3);
    logIt('他们动了手，没动成。');
  },

  check: function(){
    if (G.ending) return;
    if (G.bossRisk >= 100) return Month.finish('boss_fall');
    if (G.trust <= 12) return Month.finish('replaced');
    if (G.dropped >= 2 && G.school === 0) return Month.finish('you_dropped');
    if (shi() <= 12 && G.month >= 15) return Month.finish('boss_out');
    if (G.heat >= 100) return Month.finish('you_fall');
    if (G.heat >= 60 && (G.flags.gray || 0) >= 3 && rnd() < 0.07 && !G.seen.h90){ G.flags.forceH90 = 1; }
    if (G.month >= TERM){
      var s = shi();
      var pass = G.battles.b8 === 'win';
      if ((s >= 48 && pass) || s >= 60) return Month.finish('mayor_out');
      if (s < 40) return Month.finish('boss_out');
      return Month.finish('deadlock');
    }
  },

  finish: function(k){
    if (G.ending) return;
    G.ending = k;
    dexAdd(k);
  },

  close: function(){
    G.inEnd = false;
    if (!G.ending){ G.month++; Month.start(false); }
    save();
    return G.ending;
  }
};
