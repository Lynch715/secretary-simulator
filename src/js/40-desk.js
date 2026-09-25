/* ── 40-desk：待办队列、期限标签、顺延、月末安排 ─────────── */
var DUE_ORDER = { over:0, month:1, next:2, plan:3 };
var DUE_TAG   = { over:'逾期', month:'本月', next:'下月', plan:'已排期' };

var ROUTINE = [
  { t:'随书记去省里', d:[2,4] },   { t:'陪同检查', d:[2,3] },
  { t:'会议记录', d:[2,4] },       { t:'值班', d:[1,3] },
  { t:'接待上面来的人', d:[2,3] }, { t:'各种会签', d:[2,3] },
  { t:'书记的行程和电话', d:[3,4] },{ t:'两会材料', d:[2,4] }
];

var Desk = {

  /* 一个月 20 个工作日，先被例行的事占掉十到十四天 */
  budget: function(){
    var pool = shuffle(ROUTINE), used = 0, n = 0;
    for (var i = 0; i < pool.length && (used < 10 || n < 3); i++){
      if (used >= 14) break;
      var r = pool[i];
      used += r.d[0] + ri(r.d[1] - r.d[0] + 1);
      n++;
    }
    G.routine = '';
    return WORKDAYS - used + Rank.days();
  },

  push: function(id, due, plan){
    var e = EV(id);
    if (!e) return null;
    var it = {
      uid: uid(), id: id, due: due || e.due || 'month',
      plan: plan || 0, done: false, res: null, tier: null,
      title: e.title, src: e.src || '—', kind: e.kind || 'note',
      minD: Math.min.apply(null, (e.opts || [{ d:1 }]).map(function(o){ return dayOf(o); })),
      read: {},
      bumped: 0
    };
    G.queue.push(it);
    if (e.reveal) e.reveal.forEach(function(x){ Pool.reveal(x); });
    G.seen[id] = (G.seen[id] || 0) + 1;
    if (e.cd) G.cool[id] = G.month + e.cd;
    return it;
  },

  meet: function(req){
    if (!req) return true;
    for (var k in req){
      if (k === 'money'){ if (!Private.can(req[k])) return false; continue; }
      if (k === 'flag'){ if (!G.flags[req[k]]) return false; continue; }
      /* 某个人对你的好感 */
      if (k === 'fav'){
        var okf = true;
        for (var who in req.fav){
          var fv = (G.npc && G.npc[who]) ? G.npc[who].fav : (G.qx && G.qx[who]) ? G.qx[who].fav : (G.pool && G.pool[who]) ? G.pool[who].fav : 0;
          if (fv < req.fav[who]) okf = false;
        }
        if (!okf) return false;
        continue;
      }
      /* 手里有几样能拿出去的东西 */
      if (k === 'keys'){
        var ks = {};
        G.archive.mats.forEach(function(m){ if (m.k) ks[m.k] = 1; });
        var kn = 0; for (var kx in ks) kn++;
        if (kn < req[k]) return false;
        continue;
      }
      if (k === 'keep'){
        var want = req[k], got = false;
        G.archive.mats.forEach(function(m){ if (m.t.indexOf(want) >= 0) got = true; });
        if (!got) return false;
        continue;
      }
      /* 关键件。看过的材料都会进档案，但能拿出去的只有这么几样 */
      if (k === 'key'){
        var kk = req[k], has = false;
        G.archive.mats.forEach(function(m){ if (m.k && (kk === 1 || m.k === kk)) has = true; });
        if (!has) return false;
        continue;
      }
      var key = FX_MAP[k] || k;
      if ((G.stats[key] || 0) < req[k]) return false;
    }
    return true;
  },

  /* 冲突模板 → 一件真的待办 */
  pushTpl: function(tpl, pair){
    var A = Pool.side(pair.a), B = Pool.side(pair.b);
    function sub(s){
      if (s == null) return s;
      return String(s).replace(/\{A\}/g, A.n).replace(/\{B\}/g, B.n)
        .replace(/\{AP\}/g, A.p).replace(/\{BP\}/g, B.p)
        .replace(/\{WHY\}/g, pair.why);
    }
    var id = 'tpl_' + pair.id + '_' + G.month;
    if (G.gen[id]) return null;
    var e = {
      id: id, kind:'note', src: tpl.src || '有人找你', due:'month',
      title: sub(tpl.title), text: sub(tpl.text), nt: sub(tpl.nt),
      neglect: tpl.neglect || { rep:-2 }, pair: pair.id,
      opts: tpl.opts.map(function(o){
        var fx = {};
        for (var k in o.fx) fx[k] = o.fx[k];
        if (o.fxA || o.fxB){
          fx.npc = {};
          if (o.fxA) fx.npc[pair.a] = o.fxA;
          if (o.fxB) fx.npc[pair.b] = o.fxB;
        }
        if (o.heat){ fx.heat = {}; fx.heat[pair.id] = o.heat; }
        var rk = o.rk;
        if (rk && typeof rk === 'object'){
          rk = {};
          for (var s in o.rk) rk[s] = sub(o.rk[s]);
        }
        return { t: sub(o.t), d: o.d, n: sub(o.n), tier: o.tier,
                 rule: o.rule, keep: sub(o.keep), rk: rk, fx: fx,
                 grudge: o.grudgeA ? pair.a : (o.grudgeB ? pair.b : null) };
      })
    };
    G.gen[id] = e;
    Pool.reveal(pair.a); Pool.reveal(pair.b);
    var it = Desk.push(id, 'month');
    if (it) it.pair = pair.id;
    return it;
  },

  has: function(id){ return G.queue.some(function(q){ return q.id === id && !q.done; }); },
  hasFam: function(){
    return G.queue.some(function(q){ var e = EV(q.id); return e && e.fam && !q.done; });
  },
  live: function(){
    return G.queue.filter(function(q){ return !q.done && q.due !== 'plan'; }).length;
  },
  list: function(){
    return G.queue.slice().sort(function(a, b){
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (DUE_ORDER[a.due] - DUE_ORDER[b.due]) || 0;
    });
  },
  find: function(u){
    for (var i = 0; i < G.queue.length; i++) if (G.queue[i].uid === u) return G.queue[i];
    return null;
  },
  /* 期限还剩几天 */
  daysLeft: function(it){
    if (it.due === 'plan') return null;
    if (it.due === 'next') return Math.round((G.days + WORKDAYS) * 10) / 10;
    return G.days;
  },

  /* 这件事眼下有哪几条路。手里的人情对得上，就多一条 */
  optsOf: function(it, e){
    var call = Cards.callOpt(e);
    return call ? e.opts.concat([call]) : e.opts;
  },
  /* 这条路要花几天。交给小周跑的不占你的天数，见不得人的事他跑不了 */
  costFor: function(it, e, o){
    if (e.free) return 0;
    if (o.facWay === 'none') return 0;          /* 放回抽屉不花时间 */
    if (it.deleg && !o.rule) return 0;
    return costOf(dayOf(o)) + (it.held ? 1 : 0);
  },
  canDeleg: function(it, e){
    return Rank.canDeleg() && Cards.plain(e) && !it.done;
  },
  deleg: function(u){
    var it = Desk.find(u); if (!it || it.done) return;
    var e = EV(it.id);
    if (G.flags.delegMo !== G.month){ G.flags.delegMo = G.month; G.flags.delegN = 0; }
    if (it.deleg){ it.deleg = 0; G.flags.delegN = Math.max(0, (G.flags.delegN || 0) - 1); }
    else { if (!Desk.canDeleg(it, e)) return; it.deleg = 1; G.flags.delegN = (G.flags.delegN || 0) + 1; }
    save(); UI.render();
  },

  /* 选了一条拟办意见 */
  choose: function(u, idx){
    var it = Desk.find(u); if (!it || it.done) return;
    var e = EV(it.id); var o = Desk.optsOf(it, e)[idx]; if (!o) return;
    if (o.req && !Desk.meet(o.req)) return;
    if (o.reqFind && !Dossier.lit(it, e, o.reqFind)) return;
    if (e.slot && !it.slotDone){ UI.toast('先把这四个空排了'); return; }
    var cost = Desk.costFor(it, e, o);
    if (cost > G.days + 0.001 && !e.force){
      UI.toast('这个月剩下的天数不够了');
      return;
    }
    spendDays(cost);
    G._even = null;
    if (e.who) npcMet(e.who);
    /* 上了常委会，这一屋子人你都算打过交道 */
    if (e.acts && typeof VOTERS !== 'undefined') VOTERS.forEach(function(v){ npcMet(v); });
    applyFx(o.fx);
    var got = Cards.gain(e, o);
    var usedCard = null;
    if (o.card){ usedCard = Cards.find(o.card); Cards.drop(o.card); }
    if (o.rule){
      var r = ruleOf(o.rule);
      applyFx({ lead: leadOf(o.rule) });
      faultAdd(e.title + '：' + o.t, o.rule);
      if (r && r.red){ G.flags.redline = 1; applyFx({ risk:+2 }); }
    } else if (!e.free){
      meritAdd((e.own ? '' : e.title + '：') + o.t);
    }
    if (o.coop) G.archive.coop += o.coop;
    if (o.setf) for (var fk in o.setf) G.flags[fk] = o.setf[fk];
    if (o.rest) Slots.rest(it, o.rest);
    if (G._heard){ got.push(G._heard); G._heard = null; }
    if (o.grudge) Private.addGrudge(o.grudge);
    if (o.clear && o.oweIdx != null) Private.settle(o.oweIdx);
    if (o.renege && o.oweIdx != null) Private.renege(o.oweIdx);
    if (o.days) G.days = Math.round((G.days + o.days) * 10) / 10;
    if (o.keep) keepAdd(o.keep, o.keyk);
    if (o.dropk) dropKey(o.dropk);
    /* 人情是消耗品：一个电话打出去就少一个 */
    if (o.req && o.req.gx && !(o.fx && o.fx.gx < 0)) applyFx({ gx: -(2 + Math.round(o.req.gx / 12)) });
    it.done = true;
    it.tier = o.tier || (o.rule ? 'gray' : 'good');
    it.res = { t: o.t, n: (o.call ? o.resN : o.n) || '', keep: o.keep || '', rule: o.rule || null,
               got: got.map(function(c){ return c.type === 'info' ? c.t : Cards.label(c); }),
               used: usedCard ? Cards.label(usedCard) : (G._even ? Pool.side(G._even).n + ' 记着你一次' : ''),
               even: G._even ? 1 : 0, deleg: it.deleg ? 1 : 0 };
    UI._fresh = it.uid;
    G.done.push({ id: it.id, title: e.title, tier: it.tier, opt: o.t, rk: o.rk });
    logAdd(e.title + ' → ' + o.t);
    if (e.acts){
      var tl = Meeting.tally(it, e);
      it.tally = tl;
      applyFx(tl.pass ? o.passFx : o.failFx);
      /* 议题过没过，就是他在班子里说话的分量 */
      applyFx({ pres: tl.pass ? +2 : -3 });
      it.res.n = (tl.pass ? (o.passN || '') : (o.failN || '')) || it.res.n;
      it.res.t = it.res.t + '　——　' + tl.yes + ' 比 ' + tl.no + '，' + (tl.pass ? '过了' : '没过');
      logAdd(e.title + '：' + tl.yes + ' 比 ' + tl.no);
    }
    Fac.onChoose(e, o, it);
    if (!G.chose) G.chose = {};
    if (!e.own && !e.echo && !o.call) G.chose[e.arc ? e.arc + '.' + e.stage : e.id] = { i: idx, m: G.month };
    G._projUp = null;
    Proj.onChoose(e, o, it);
    if (G._projUp){ for (var pi = 0; pi < PROJ.length; pi++) if (PROJ[pi].k === G._projUp) it.res.proj = PROJ[pi].n; }
    checkLead();
    if (e.arc) Arcs.advance(e, idx, it);
    if (o.end) Endings.trigger(o.end);
    if (e.endBy === 'patrol') Endings.patrol();
    else if (e.endBy === 'boss') Endings.bossLeave();
    save();
    UI.render();
  },

  /* 月末：没办的怎么处理。真没办成的，那句话月末才说 */
  rollover: function(){
    var keep = [];
    G.missed = [];
    G.queue.forEach(function(q){
      if (q.done) return;
      var e = EV(q.id);
      if (e.noRoll){
        applyFx(e.neglect);
        if (e.nt) G.missed.push({ id: e.id, on: e.title, t: e.nt });
        if (!e.own && !e.echo) logAdd(e.title + ' → 这个月过去了');
        return;
      }
      if (q.due === 'over'){
        /* 逾期再没办 → 按不办的后果结算 */
        applyFx(e.neglect);
        Proj.onNeglect(e);
        faultAdd(e.title + '：没办', null);
        if (e.nt) G.missed.push({ id: e.id, on: e.title, t: e.nt });
        logAdd(e.title + ' → 没办，按后果结算');
        if (e.overdue_to && EV(e.overdue_to)){
          var n = Desk.push(e.overdue_to, 'month');
          if (n) n.bumped = 1;
        }
        if (e.arc && e.lateNext){
          var arc = Arcs.def(e.arc), ns = arc && Arcs.stageOf(arc, e.lateNext);
          if (ns){
            if (G.arcs && G.arcs[e.arc]) G.arcs[e.arc].stage = e.lateNext;
            var g = ns.gap == null ? 2 : ns.gap;
            Arcs.push(e.arc, e.lateNext, g > 0 ? 'plan' : 'month', g);
          }
        }
        return;   /* 移出队列 */
      }
      if (q.due === 'month'){ q.due = 'over'; q.bumped = 1; keep.push(q); return; }
      if (q.due === 'next'){ q.due = 'month'; keep.push(q); return; }
      if (q.due === 'plan'){
        q.plan = Math.max(0, (q.plan || 1) - 1);
        if (q.plan === 0) q.due = 'month';
        keep.push(q); return;
      }
      keep.push(q);
    });
    G.queue = keep;
  },

  /* 月末安排四选一 */
  NIGHT: [
    { k:'rest', n:'按点下班，周末不开机',
      d:'两天电话没响。周一早上进办公室，脑子是空的', fx:{ en:+26 } },
    { k:'fam',  n:'把周末给家里',
      d:'带孩子去了趟公园。手机响了三次，你接了一次', fx:{ en:+12, fam:-2 } },
    { k:'ot',   n:'周末在办公室',
      d:'下个月能多出四天。这四天是从身上抠的', fx:{ en:-10, fam:+1 }, bonus:4 },
    { k:'msz',  n:'去秘书长办公室坐坐',
      d:'两壶茶，他讲的全是十年前的人和事。你一句没插嘴', fx:{ rep:+1 }, heat:-10 }
  ],

  endMonth: function(choiceKey){
    var c = null;
    for (var i = 0; i < Desk.NIGHT.length; i++) if (Desk.NIGHT[i].k === choiceKey) c = Desk.NIGHT[i];
    if (!c) c = Desk.NIGHT[0];
    if (c.k === 'fam' && G.hidden.famBroken) c = Desk.NIGHT[0];

    applyFx(c.fx);
    G.otRun = (c.k === 'ot') ? (G.otRun || 0) + 1 : 0;
    if (c.heat) Pool.addHeat('p_msz_me', c.heat);
    var bonus = c.bonus || 0;

    /* 家里的事连着不办 → 破裂 */
    var famMissed = G.queue.some(function(q){
      var e = EV(q.id); return e && e.fam && !q.done && q.due === 'over';
    });
    var famDone = G.queue.some(function(q){
      var e = EV(q.id); return e && e.fam && q.done;
    });
    if (famMissed){
      G.flags.famMiss = (G.flags.famMiss || 0) + 1;
      /* 连着两回，而且家里早就不问了，才是真的散了 */
      if (G.flags.famMiss >= 2 && G.hidden.fam >= 10) G.hidden.famBroken = true;
    } else if (famDone){
      G.flags.famMiss = 0;
    }

    /* 桌上不过夜：本月和逾期的全办了，而且不是闲月 */
    var left = G.queue.filter(function(q){ var qe = EV(q.id); return !q.done && q.due !== 'plan' && !(qe && qe.own); }).length;
    var clean = null;
    if (!left && G.done.length >= 5){
      G.flags.cleanRun = (G.flags.cleanRun || 0) + 1;
      G.flags.cleanAll = (G.flags.cleanAll || 0) + 1;
      applyFx({ en:+4 });
      /* 头一回说一句整话，往后只记个数，不然月月都是那两句 */
      clean = { t: G.flags.cleanRun === 1 ? pick(CLEAN_DESK[G.bossType] || CLEAN_DESK.steady)
                  : '桌上不过夜，连着第 ' + G.flags.cleanRun + ' 个月', run: G.flags.cleanRun };
      if (G.flags.cleanRun === 3){ applyFx({ rep:+3 }); clean.word = CLEAN_RUN3; }
    } else {
      G.flags.cleanRun = 0;
    }
    /* 秘书长讲十年前的人和事，总有一两句是有用的 */
    var tea = null;
    if (c.k === 'msz'){
      var ks = VOTERS.filter(function(v){ return v !== 'mishuzhang'; });
      tea = Cards.add('info', ks[ri(ks.length)], '秘书长办公室那两壶茶');
    }

    Pool.mszRule(G.done.length, c.k === 'msz');
    Desk.rollover();
    var missed = G.missed || [];
    var remarks = Remark.build(missed);

    G.done = [];
    G.month += 1;
    G.days = Desk.budget() + bonus;
    leadFade();
    riskDrift();
    statDrift();
    G.hidden.wind = Math.floor((G.month - 1) / 24);
    Pool.drift();
    Msz.tick();
    Private.tick();
    Fac.tick();
    Proj.tick();
    var year = (G.month > 1 && (G.month - 1) % 12 === 0) ? Proj.yearEnd() : null;
    Rank.tick();
    checkLead();
    Endings.tick();

    if (G.month > TERM){
      Endings.settle();
    } else {
      Events.fill();
    }
    save();
    return { remarks: remarks, missed: missed, clean: clean, year: year,
             tea: tea ? tea.t : '' };
  }
};
