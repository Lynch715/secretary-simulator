/* ── 22-people：排人（书记每月四个空）、秘书长剩下两条规则 ── */
var SLOTS = 4;

var Slots = {

  /* 月初生成本月求见名单 */
  gen: function(){
    if (G.month < 3) return;                       /* 头两个月先让人熟悉队列 */
    var id = 'slot_' + G.month;
    if (G.gen[id]) return;
    if (!G.slotCd) G.slotCd = {};
    var avail = SLOT_POOL.filter(function(c){
      var k = c.who || c.n;
      return !(G.slotCd[k] && G.slotCd[k] > G.month);
    });
    if (avail.length < 5) avail = SLOT_POOL;
    var pool = shuffle(avail).slice(0, 5 + ri(3));
    pool.forEach(function(c){ G.slotCd[c.who || c.n] = G.month + 1 + ri(3); });
    var list = pool.map(function(c, i){
      var s = c.n ? { n: c.n, p: c.p || '' } : Pool.side(c.who);
      return { k: i, who: c.who, n: s.n, p: s.p, why: c.why, tag: c.tag || '',
               inN: c.inN, out: c.out, fxIn: c.fxIn, fxOut: c.fxOut };
    });
    var e = {
      id: id, kind:'slot', src:'书记交办', due:'month', slot:1, list: list,
      title:'本月求见',
      text:'书记这个月能腾出四个半小时。桌上的条子有 ' + list.length + ' 张。\n排进去的当月能见上，剩下的你自己看着办。',
      nt:'你一个也没排。月底书记问起某件事，你说他们都还没来过',
      neglect:{ trust:-4 }, noRoll:1,
      opts:[
        { t:'剩下的让他们下月再来', d:0, tier:'tail',
          n:'条子压在玻璃板底下。有两个人这个月来过三趟',
          fx:{}, rest:'next',
          rk:{} },
        { t:'剩下的请秘书长安排', d:0, tier:'tail',
          n:'邱仲华一口答应，还说以后这种事都可以找他。他会记你一笔',
          fx:{heat:{p_msz_me:-6}}, rest:'msz',
          rk:{ shrewd:'秘书长最近很热心。' } },
        { t:'剩下的我自己见一下', d:0, tier:'good',
          n:'一人半小时，挤在中午和下班后。他们说的话你比书记先知道',
          fx:{}, rest:'me',
          rk:{ steady:'辛苦你了。' } }
      ]
    };
    G.gen[id] = e;
    var it = Desk.push(id, 'month');
    if (it) it.pick = [];
  },

  picked: function(it){ if (!it.pick) it.pick = []; return it.pick; },

  toggle: function(uid, k){
    var it = Desk.find(uid); if (!it || it.done || it.slotDone) return;
    k = +k;
    var p = Slots.picked(it);
    var i = p.indexOf(k);
    if (i >= 0) p.splice(i, 1);
    else { if (p.length >= SLOTS) return; p.push(k); }
    save(); UI.render();
  },

  /* 排定：当月见的人先结算 */
  confirm: function(uid){
    var it = Desk.find(uid); if (!it || it.slotDone) return;
    var e = EV(it.id);
    var cost = costOf(0.5);
    if (cost > G.days + 0.001){ UI.toast('这个月排不下了'); return; }
    spendDays(cost);
    var p = Slots.picked(it), blame = SLOT_BLAME[G.bossType];
    var bad = 0;
    p.forEach(function(k){
      var c = e.list[k];
      applyFx(c.fxIn);
      if (c.who && POOL_BY_ID[c.who]) Pool.reveal(c.who);
      if (blame && c.tag === blame.tag) bad++;
    });
    if (bad){
      applyFx({ trust: -2 * bad });
      G.flags.slotBad = (G.flags.slotBad || 0) + bad;
      it.slotBlame = blame.rk;
    }
    it.slotDone = 1;
    logAdd('本月排人：见了 ' + p.length + ' 个');
    save(); UI.render();
  },

  /* 剩下的怎么处理，在 Desk.choose 里调 */
  rest: function(it, how){
    var e = EV(it.id);
    var left = e.list.filter(function(c, i){ return Slots.picked(it).indexOf(i) < 0; });
    left.forEach(function(c){
      if (how === 'next'){ applyFx(c.fxOut); }
      else if (how === 'msz'){ npcFavor(c.who, -1); }
      else if (how === 'me'){ applyFx({ gx:+1 }); spendDays(0.5); }
    });
    if (how === 'msz') Pool.addHeat('p_msz_me', 4);
  }
};

/* ── 秘书长：压你的件、去书记那说你 ── */
var Msz = {
  tick: function(){
    var h = Pool.heat('p_msz_me');
    if (h >= 80){
      applyFx({ trust:-8 });
      Pool.addHeat('p_msz_me', -(h - 50));
      logAdd('秘书长去书记那坐了一会儿');
      G.flags.mszTold = (G.flags.mszTold || 0) + 1;
      return;
    }
    if (h >= 50){
      var live = G.queue.filter(function(q){ return !q.done && q.due !== 'plan' && !q.held; });
      if (live.length){
        var q = live[ri(live.length)];
        q.held = 1;
      }
    }
  }
};

/* ── 传话：每月有一件，两头从班子和区县里抽 ── */
var TALK_SIDES = ['mayor','vice1','depsec','zuzhi','zhengfa','xuanchuan','tongzhan',
                  'chengguan','gaoxin','gangkou','qingchuan','baisha','meiling'];

var Talk = {
  gen: function(){
    if (G.month < 4) return;
    if (rnd() > 0.4) return;
    var id = 'talk_' + G.month;
    if (G.gen[id]) return;
    var tpl = TALK_TPL[ri(TALK_TPL.length)];
    var a, b = null;
    /* 热度高的对子优先——有矛盾才有话要带 */
    var hot = Pool.hot(45).filter(function(p){ return p.a !== 'me' && p.b !== 'me' && p.b !== 'boss'; });
    if (tpl.kind === 'between' && hot.length){
      var pr = hot[ri(hot.length)];
      a = pr.a; b = pr.b;
    } else {
      a = TALK_SIDES[ri(TALK_SIDES.length)];
      if (tpl.kind === 'between'){
        do { b = TALK_SIDES[ri(TALK_SIDES.length)]; } while (b === a);
      }
    }
    var A = Pool.side(a), B = b ? Pool.side(b) : { n:'', p:'' };
    var pairId = null, why = '两个人之间早就有话';
    PAIRS.forEach(function(p){
      if ((p.a === a && p.b === b) || (p.a === b && p.b === a)){ pairId = p.id; why = p.why; }
      if (!pairId && tpl.kind !== 'between' && ((p.a === a && p.b === 'boss') || (p.b === a && p.a === 'boss'))){ pairId = p.id; why = p.why; }
    });
    function sub(s){
      return String(s == null ? '' : s).replace(/\{A\}/g, A.n).replace(/\{B\}/g, B.n)
        .replace(/\{AP\}/g, A.p).replace(/\{BP\}/g, B.p)
        .replace(/\{WHY\}/g, why);
    }
    var e = {
      id: id, kind:'note', src:'有人找你', due:'month',
      title: sub(tpl.title), text: sub(tpl.text), nt: sub(tpl.nt),
      neglect: { rep:-2 },
      opts: tpl.opts.map(function(o){
        var fx = {};
        for (var k in o.fx) fx[k] = o.fx[k];
        if (o.fxA || o.fxB){
          fx.npc = {};
          if (o.fxA) fx.npc[a] = o.fxA;
          if (o.fxB && b) fx.npc[b] = o.fxB;
        }
        if (o.heat && pairId){ fx.heat = {}; fx.heat[pairId] = o.heat; }
        return { t: sub(o.t), d: o.d, n: sub(o.n), tier: o.tier, rule: o.rule, fx: fx, rk: o.rk };
      })
    };
    G.gen[id] = e;
    Desk.push(id, 'month');
  }
};
