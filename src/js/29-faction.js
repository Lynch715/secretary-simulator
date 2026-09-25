/* ── 29-faction：拔钉子。市长的人是谁、认出来、拿住、动手、反扑、投靠、市长的去向、局势图 ──
   坏的藏着：反扑的数、暗桩是谁、材料硬不硬，界面上一个字不写。
   好的看得见：局势图上划掉一个名字、红头通报、有人换边坐过来 */
var Fac = {

  init: function(){
    if (G.fac) return;
    G.fac = {
      hid: shuffle(FAC_CAND).slice(0, FAC_HID_N),
      mark: {}, clr: {}, pulled: {}, turned: {},
      heat: 0, lastPull: 0, lastTell: 0, offerCd: {}, busy: null, pending: null,
      mayor: null, mayorRoute: null, mayorAt: 0, wait: 0, fb: {}, gray: 0
    };
  },

  isHidden: function(id){ Fac.init(); return G.fac.hid.indexOf(id) >= 0; },
  nails: function(){
    Fac.init();
    return FAC_OPEN.filter(function(x){ return x !== 'mayor'; }).concat(FAC_HALF, G.fac.hid);
  },
  isNail: function(id){ return Fac.nails().indexOf(id) >= 0; },
  /* 你认出来了没有 */
  known: function(id){
    Fac.init();
    if (FAC_OPEN.indexOf(id) >= 0) return true;
    if (FAC_HALF.indexOf(id) >= 0){
      if (POOL_BY_ID[id]) return Pool.seen(id);
      return npcKnown(id) >= 1;
    }
    return !!G.fac.mark[id];
  },
  alive: function(id){ Fac.init(); return !G.fac.pulled[id] && !G.fac.turned[id]; },
  pulledN: function(){ Fac.init(); var n = 0; for (var k in G.fac.pulled) n++; return n; },
  turnedN: function(){ Fac.init(); var n = 0; for (var k in G.fac.turned) n++; return n; },
  gone: function(){ return Fac.pulledN() + Fac.turnedN(); },
  remain: function(){ return Fac.nails().filter(Fac.alive).length; },

  /* 把柄在不在手里。看过的材料都进档案，能拿出去的只有标了键的 */
  gripN: function(id){
    var d = NAIL[id]; if (!d || !d.key) return 0;
    var n = 0;
    G.archive.mats.forEach(function(m){ if (m.k === d.key) n++; });
    return n;
  },
  hasGrip: function(id){ return Fac.gripN(id) > 0; },
  name: function(id){ return Pool.side(id).n; },
  succ: function(id){
    var d = NAIL[id]; if (!d) return null;
    if (id === 'chengguan' && G.fac && G.fac.pulled.cg_quzhang) return { n:'温从周', p:'城关区委书记' };
    return d.succ || null;
  },

  /* 事件能不能出：e.fac = { tell, n, after, alive, pulled, hid, turn } */
  ok: function(e){
    var f = e.fac; if (!f) return true;
    Fac.init();
    if (f.hid && !Fac.isHidden(f.hid)) return false;
    if (f.alive && !Fac.alive(f.alive)) return false;
    if (f.turn && G.fac.turned[f.turn]) return false;
    if (f.pulled != null && Fac.gone() < f.pulled) return false;
    if (f.tell){
      if (!Fac.alive(f.tell)) return false;
      if (G.fac.clr[f.tell]) return false;                     /* 查过了，是清白的 */
      if (f.n === 2 && !G.fac.mark[f.tell] && G.fac.hid.indexOf(f.tell) < 0) { /* 红鲱鱼的第二件照出 */ }
      if (f.after && !G.seen[f.after]) return false;
      if (G.month - (G.fac.lastTell || 0) < 4) return false;
      if (G.queue.some(function(q){ var x = EV(q.id); return x && x.fac && x.fac.tell && !q.done; })) return false;
    }
    return true;
  },

  /* 正文按局面换 */
  text: function(e){
    if (e.id === 'fac_mayor_gone' && G.fac && G.fac.mayorRoute){
      var m = FAC_MAYOR_END[G.fac.mayorRoute]; return m ? m.t : e.text;
    }
    if (!e.textIf) return e.text;
    for (var i = 0; i < e.textIf.length; i++){
      var c = e.textIf[i];
      if (c.hid && !Fac.isHidden(c.hid)) continue;
      if (c.nothid && Fac.isHidden(c.nothid)) continue;
      if (c.flag && !G.flags[c.flag]) continue;
      if (c.noflag && G.flags[c.noflag]) continue;
      return c.t;
    }
    return e.text;
  },
  title: function(e){
    if (e.id === 'fac_mayor_gone' && G.fac && G.fac.mayorRoute){
      var m = FAC_MAYOR_END[G.fac.mayorRoute]; return m ? m.n : e.title;
    }
    return e.title;
  },

  /* 选完一条拟办意见之后 */
  onChoose: function(e, o, it){
    Fac.init();
    if (e.fac && e.fac.tell) G.fac.lastTell = G.month;
    var id, truth, br;
    if (o.probe){
      id = o.probe; truth = Fac.isHidden(id); br = truth ? o.yes : o.no;
      if (br){
        it.res.n = br.n || '';
        applyFx(br.fx);
        if (truth){ G.fac.mark[id] = 1; if (br.keep) keepAdd(br.keep, br.keyk); it.res.keep = br.keep || ''; }
        else G.fac.clr[id] = 1;
      }
    }
    if (o.guess){
      id = o.guess; truth = Fac.isHidden(id); br = truth ? o.yes : o.no;
      if (br){ it.res.n = br.n || ''; applyFx(br.fx); if (truth) G.fac.mark[id] = 1; }
    }
    if (o.facHeat) Fac.heat(o.facHeat);
    if (o.facTell){
      var left = G.fac.hid.filter(function(h){ return !G.fac.mark[h] && Fac.alive(h); });
      if (left.length){ G.fac.mark[left[0]] = 1; it.res.n = (it.res.n || '') + '　那个名字：' + Fac.name(left[0]); }
      else it.res.n = (it.res.n || '') + '　那个名字你早就知道了';
    }
    if (o.facTurn) Fac.turn(o.facTurn);
    if (o.facWay) Fac.way(e, o, it);
    if (e.facCw && it.tally){
      if (it.tally.pass){ Fac.pull(e.facCw, 'cw'); applyFx({ pres:+4 }); Fac.heat(20); }
      else { applyFx({ pres:-2 }); Fac.heat(30); Pool.addHeat('p_mayor_boss', 25); G.fac.busy = null; G.fac.offerCd[e.facCw] = G.month + 4; }
    }
    if (o.facStrike) Fac.strike(it, o);
    if (o.facMayor) Fac.mayorWay(o.facMayor, it);
    if (o.facMayorDone) Fac.mayorDone(it);
  },

  heat: function(v){
    Fac.init();
    G.fac.heat = clamp(G.fac.heat + v, 0, 100);
  },

  /* 动手：四条路 */
  way: function(e, o, it){
    var nid = e.facNail, w = o.facWay;
    if (w === 'none'){ G.fac.offerCd[nid] = G.month + 4; G.fac.offerAll = G.month + 2; return; }
    G.fac.busy = nid;
    if (w === 'jw'){
      G.fac.pending = { id: nid, way:'jw', at: G.month + 3 + ri(4) };
      Fac.heat(18);
    } else if (w === 'hr'){
      G.fac.pending = { id: nid, way:'hr', at: G.month + 1 };
      Fac.heat(14);
    } else if (w === 'cw'){
      Fac.meeting(nid);
    } else if (w === 'gray'){
      G.fac.pending = { id: nid, way:'gray', at: G.month + 1 };
      G.fac.gray = (G.fac.gray || 0) + 1;
      Fac.heat(26 + (G.flags.seed_qianshou ? 10 : 0));
      Private.addGrudge(nid); Private.addGrudge(nid);
    }
    if (G.month - (G.fac.lastPull || -9) < 6) Fac.heat(10);
  },

  /* 把柄到手之后，下个月多一件「自己」的事 */
  offer: function(nid){
    var d = NAIL[nid]; if (!d) return null;
    var nm = Fac.name(nid), P = Pool.side(nid).p;
    var id = 'fac_offer_' + nid + '_' + G.month;
    if (G.gen[id]) return null;
    var hidLine = Fac.isHidden(nid) ? '他是市长的人，这一点现在只有你知道。' : '';
    var e = {
      id:id, kind:'note', src:'自己', due:'next', who: nid, img:'night', own:1, facNail: nid,
      title:'手里有了' + nm + '的东西',
      text:'抽屉里那份东西，你翻出来又看了一遍。' + hidLine + nm + '，' + P + '，市长那边的人。\n办法有四个。哪一个都不会当天见效，哪一个都收不回来。',
      nt:'东西在抽屉里放着。抽屉锁着',
      opts:[
        { t:'转给宋自强', d:1, tier:'good', req:{ key: d.key }, facWay:'jw', n: d.ways.jw,
          nlow:'手里的东西还不够硬',
          rk:{ steady:'交了就好。', strong:'交了？', shrewd:'他收了没有？' } },
        { t:'趁人事窗口把他调走', d:2, tier:'good', req:{ pres:55, fav:{ zuzhi:50 } }, facWay:'hr', n: d.ways.hr,
          nlow:'佟建民那一关过不去，书记在班子里的分量也还不够',
          rk:{ steady:'稳当。', strong:'好。', shrewd:'佟建民怎么说的？' } },
        { t:'让书记拿到常委会上说', d:1, tier:'good', req:{ pres:45 }, facWay:'cw', n: d.ways.cw,
          nlow:'他在班子里说话的分量还不够，上会就是输',
          rk:{ steady:'上会要有把握。', strong:'上。', shrewd:'票你数过了？' } },
        { t:'写封信寄出去', d:0.5, tier:'gray', rule:'leak', facWay:'gray', n: d.ways.gray, rk:{} },
        { t:'先放着', d:0, tier:'tail', facWay:'none', n:'东西放回抽屉。你把抽屉锁了', rk:'' }
      ],
      neglect:{}
    };
    G.gen[id] = e;
    return Desk.push(id, 'next');
  },

  /* 常委会上摊牌：生成一场真的常委会 */
  meeting: function(nid){
    var d = NAIL[nid], nm = Fac.name(nid), P = Pool.side(nid).p;
    var id = 'fac_cw_' + nid + '_' + G.month;
    var lean = { mayor:-3, vice1:-2, depsec:0, jiwei:0, zuzhi:+1, zhengfa:-1, xuanchuan:0, mishuzhang:0, tongzhan:0 };
    if (lean[nid] != null) lean[nid] = -3;           /* 他自己的票 */
    var e = {
      id:id, kind:'meeting', src:'常委会', due:'month', topic:'人事', need:5, facCw: nid, who: nid, img:'changwei',
      title:'关于调整' + nm + '同志分工的建议',
      text:'书记定的议题。材料是你写的，三页，一句没提那份东西，每一句都指着它。\n市长那边的人会怎么投，你比谁都清楚。',
      nt:'议题撤了。撤议题这件事，班子里每个人都记住了',
      lean: lean,
      mats:[
        { id:'fc_' + nid + '_1', t:'市长的书面意见', from:'市政府办', d:1, who:'mayor', text:'两页。「' + nm + '同志工作能力强，建议维持现有分工。」' },
        { id:'fc_' + nid + '_2', t:'副书记的意见', from:'市委办', d:1, who:'depsec', text:'一页。「服从组织安排。」他在人事上从不多说一个字。' },
        { id:'fc_' + nid + '_3', t:'组织部的考察情况', from:'组织部', d:1, who:'zuzhi', text:'四页。写得很客气，最后一段是「群众反映的问题建议进一步了解」。' }
      ],
      acts:[
        { t:'把那份东西给佟建民看一眼', d:1, eff:{ zuzhi:+2, depsec:+1 }, n:'他看了不会说话，但他会记住', after:'他把考察材料最后那一段改成了「存在的问题」' },
        { t:'请书记亲自找罗明川谈一次', d:1, eff:{ depsec:+2 }, fx:{ trust:-1 }, n:'人事是他的底线，只有书记能撬', after:'他说他不反对' },
        { t:'去纪守望那儿坐半小时', d:1, eff:{ tongzhan:+1 }, n:'他看大多数', after:'他说他看大家的意思' },
        { t:'让宋自强在会上说一句「有反映」', d:1, eff:{ jiwei:+2, zhengfa:-1 }, n:'纪委书记开口，谁都不好接', after:'他说他会说的' }
      ],
      opts:[
        { t:'上会', d:1, tier:'good', n:'',
          passN:'过了。' + nm + '在会上说了句服从组织安排。市长收拾材料收拾了很久',
          failN:'没过。市长散会的时候走到书记面前，说：周书记，班子还是要讲团结',
          fx:{}, passFx:{ trust:+5 }, failFx:{ trust:-3 },
          rk:{ steady:'过了就好。', strong:'谁投的反对？', shrewd:'几票？' } }
      ],
      neglect:{ pres:-3 }
    };
    G.gen[id] = e;
    G.fac.pending = { id: nid, way:'cw', at: G.month + 1, ev: id };
    var it = Desk.push(id, 'plan'); if (it) it.plan = 1;
  },

  /* 拔掉一个人 */
  pull: function(id, way, silent){
    Fac.init();
    if (G.fac.pulled[id]) return;
    var d = NAIL[id] || {}, nm = Fac.name(id), P = Pool.side(id).p;   /* 先记下他的名字，标了之后 side() 给的就是接手的人 */
    G.fac.pulled[id] = { m: G.month, way: way };
    G.fac.lastPull = G.month;
    G.fac.busy = null; G.fac.pending = null;
    var s = Fac.succ(id);
    if (d.qx){
      G.qxHead = G.qxHead || {};
      if (s) G.qxHead[id] = s.n;
      if (id === 'chengguan' && s && s.n === '郑大林'){ G.flags.hrDone = G.flags.hrDone || G.month; Pool.promote('cg_quzhang', '城关区委书记'); }
    }
    if (POOL_BY_ID[id]){ Pool.init(); G.pool[id].gone = 1; G.pool[id].post = way === 'hr' ? d.hrTo : (way === 'jw' ? '留置' : '免职'); G.pool[id].moved = G.month; }
    if (silent) return;
    meritAdd(nm + '的事，办成了');
    logAdd(nm + ' → ' + (way === 'jw' ? '立案' : way === 'hr' ? '调走' : way === 'cw' ? '分工调整' : '免职'));
    applyFx({ trust:+4, pres:+3 });
    if (way === 'jw') applyFx({ risk:+2 });
    if (way === 'gray') applyFx({ lead:+4 });
    /* 接手的人整理柜子，偶尔翻出别人的东西 */
    var extra = '';
    var h = FAC_HANDOVER[id];
    if (h && (way === 'hr' || way === 'cw') && Fac.alive(h.who) && !Fac.hasGrip(h.who)){
      keepAdd(h.t, h.key);
      extra = '\n接手的人整理柜子，翻出一样东西，送到了你这儿：' + h.t + '。';
    }
    var eid = 'fac_gone_' + id + '_' + G.month;
    G.gen[eid] = { id:eid, kind:'note', src:'主线', due:'month', free:1, who:id, img: way === 'jw' ? 'archive' : 'office',
      title: nm + (way === 'jw' ? '被带走了' : '走了'),
      text: (d.fall ? d.fall[way] : nm + '走了。') + extra +
            (s && s.n !== '——' ? '\n' + s.p + '，' + s.n + '接。' : ''),
      nt:'', opts:[ { t:'知道了', d:0, tier:'good', n:'', rk:'' } ], neglect:{} };
    Desk.push(eid, 'month');
    G.notice = { id:id, way:way, n:nm, p: P, to: d.hrTo || '' };
    if (Fac.gone() === 1) G.flags.facFirst = G.month;
  },

  /* 换边 */
  turn: function(id){
    Fac.init();
    if (G.fac.turned[id] || G.fac.pulled[id]) return;
    G.fac.turned[id] = G.month;
    G.fac.mark[id] = 1;
    meritAdd(Fac.name(id) + '过来了');
    logAdd(Fac.name(id) + ' → 换边');
    applyFx({ pres:+2 });
  },

  /* 楼下那两个人 */
  strike: function(it, o){
    /* 手里红线的事不止一件，或者风声已经起来了，这一下就扛不住 */
    var redN = G.archive.fault.filter(function(f){ return f.rule && RULES[f.rule] && RULES[f.rule].red; }).length;
    var hard = G.archive.fault.some(function(f){ return f.rule && RULES[f.rule] && RULES[f.rule].lv >= 4; });
    if (redN >= 2 || hard || G.hidden.lead >= 50){
      it.res.n = '谈话室的窗户朝北。第一个问题问的是三年前的一件事，你已经想不起来那天是星期几了';
      Endings.trigger('struck');
      return;
    }
    it.res.n = '谈了四十分钟。他们要的东西你没有，问的事你一件一件答了。第三天市长在常委会上少说了很多话。省里那边有人问他，为什么派人下来';
    G.flags.mayorWeak = 1;
    G.fac.heat = 0;
    applyFx({ trust:+5, rep:+3 });
    Pool.addHeat('p_mayor_boss', -10);
  },

  /* 市长怎么走 */
  mayorWay: function(route, it){
    if (route === 'wait'){ G.fac.wait = G.month; return; }
    if (route === 'down' && (G.fac.gray || 0) >= 2) route = 'trap';
    G.fac.mayorRoute = route;
    G.fac.mayorAt = G.month + 2;
  },
  mayorDone: function(it){
    var r = G.fac.mayorRoute; if (!r) return;
    if (r === 'trap'){
      it.res.n = '信封里有你的名字。三天后，有人在楼下等你';
      Endings.trigger('self_out');
      return;
    }
    G.fac.mayor = r;
    G.fac.pulled.mayor = { m: G.month, way: r };
    meritAdd('陈立群走了');
    logAdd('陈立群 → ' + r);
    applyFx({ trust:+8, pres:+10 });
    Pool.addHeat('p_mayor_boss', -40);
    G.fac.heat = 0;
    G.notice = { id:'mayor', way: r === 'down' ? 'jw' : 'hr', n:'陈立群', p:'市长', to: r === 'move' ? '省政协副秘书长' : '退休' };
    it.res.n = r === 'move' ? '他走的那天，书记站在窗口看了很久。' : r === 'retire' ? '他走了。书记那天什么也没说。' : '书记把那二十二本记录本锁进了柜子。';
  },

  /* 每月一次 */
  tick: function(){
    Fac.init();
    var f = G.fac;
    f.heat = Math.max(0, f.heat - 1);
    /* 手上那件事到日子了 */
    if (f.pending && G.month >= f.pending.at){
      var p = f.pending;
      if (p.way === 'cw'){
        if (!Desk.has(p.ev) && !f.pulled[p.id]){ f.busy = null; f.pending = null; Fac.heat(10); }
      } else if (p.way === 'jw'){
        var jf = (G.npc && G.npc.jiwei) ? G.npc.jiwei.fav : 45;
        if (Fac.gripN(p.id) >= 2 || jf >= 42 || (G.archive.coop || 0) >= 1){
          Fac.pull(p.id, 'jw');
        } else {
          f.busy = null; f.pending = null; f.offerCd[p.id] = G.month + 5;
          Fac.heat(10); Private.addGrudge(p.id);
          var fid = 'fac_fail_' + p.id + '_' + G.month, nm = Fac.name(p.id);
          G.gen[fid] = { id:fid, kind:'note', src:'突发', due:'month', free:1, who:p.id, img:'archive',
            title:'材料退回来了',
            text:'宋自强让人把那个牛皮纸袋送了回来，没拆封，附了一张便签：线索不具体，建议补充。\n三天后' + nm + '在走廊上跟你打了个招呼，比平时客气。',
            nt:'', opts:[ { t:'知道了', d:0, tier:'tail', n:'纸袋放回抽屉。这回你知道了，纪委那扇门，敲一次就少一次' } ], neglect:{} };
          Desk.push(fid, 'month');
        }
      } else {
        Fac.pull(p.id, p.way);
      }
    }
    /* 市长那件事到日子了 */
    if (f.mayorRoute && !f.mayor && f.mayorAt && G.month >= f.mayorAt && !Desk.has('fac_mayor_gone') && !G.seen.fac_mayor_gone){
      Desk.push('fac_mayor_gone', 'month');
    }
    /* 反扑 */
    var h = f.heat;
    [30, 50, 70, 90].forEach(function(t){
      var k = 'fb_' + t;
      if (h >= t && !f.fb[k]){
        f.fb[k] = G.month;
        if (t === 70){
          var kin = G.flags.seed_dianti ? 'hurt_law' : 'hurt_sister';
          if (!G.hurt) G.hurt = {};
          var kk = kin === 'hurt_law' ? 'law' : 'sister';
          if (!G.hurt[kk] && EV(kin)){ G.hurt[kk] = 1; Desk.push(kin, 'month'); }
          applyFx({ risk:+8 });
          if (!Desk.has(k)) Desk.push(k, 'month');
        } else if (!Desk.has(k)) Desk.push(k, 'month');
      }
      if (h < t - 25) f.fb[k] = 0;
    });
    if (h >= 40 && rnd() < 0.3){
      var sm = rnd() < 0.5 ? 'fb_small_1' : 'fb_small_2';
      if (!(G.cool[sm] && G.cool[sm] > G.month) && !Desk.has(sm)) Desk.push(sm, 'month');
    }
    /* 把柄到手、手上没别的事，给一件「自己」的事 */
    if (!f.busy && G.month - (f.lastPull || -9) >= 2 && !(f.offerAll && f.offerAll > G.month) &&
        !G.queue.some(function(q){ var x = EV(q.id); return x && x.facNail && !q.done; })){
      var cand = Fac.nails().filter(function(n){
        return Fac.alive(n) && Fac.known(n) && Fac.hasGrip(n) && !(f.offerCd[n] && f.offerCd[n] > G.month);
      });
      if (cand.length) Fac.offer(cand[ri(cand.length)]);
    }
    /* 拔够了，市长动得了 */
    if (!f.mayor && !f.mayorRoute && Fac.gone() >= FAC_MAYOR_AT && !Desk.has('fac_mayor') &&
        !(f.wait && G.month - f.wait < 3)){
      Desk.push('fac_mayor', 'next');
    }
  },

  /* 局势图 */
  board: function(){
    Fac.init(); npcInit(); Pool.init();
    var rows = [];
    function st(id){
      if (id === 'mayor') return G.fac.mayor ? 'gone' : 'mayor';
      if (G.fac.pulled[id]) return 'gone';
      if (G.fac.turned[id]) return 'turned';
      if (Fac.isNail(id)) return Fac.known(id) ? 'mayor' : 'unk';
      if (FAC_BOSS.indexOf(id) >= 0) return 'boss';
      if (id === 'jiwei') return 'none';
      return 'unk';
    }
    function put(id, n, p){
      var s = st(id);
      rows.push({ id:id, n:n, p:p, s:s });
      if (s === 'gone' && id !== 'mayor'){
        var sc = Fac.succ(id);
        if (sc && sc.n !== '——' && !POOL_BY_ID[id]) rows.push({ id:id + '_succ', n:sc.n, p:sc.p, s:'boss' });
      }
    }
    NPC_DEF.forEach(function(d){ put(d.id, d.n, d.p); });
    QX_DEF.forEach(function(d){ put(d.id, (G.qxHead && G.qxHead[d.id] && !G.fac.pulled[d.id]) ? G.qxHead[d.id] : d.head, d.n); });
    POOL.forEach(function(x){
      if (!G.met[x.id] && !G.fac.pulled[x.id]) return;
      rows.push({ id:x.id, n:x.n, p: Pool.postOf(x), s: st(x.id) });
    });
    return rows;
  },
  boardWord: function(){
    var g = Fac.gone(), r = Fac.remain();
    if (G.fac.mayor) return '这张桌子，现在是他的了';
    if (!g) return '';
    if (r === 0) return '那边的人，一个也不剩了';
    return '';
  }
};
