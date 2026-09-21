/* ── 28-own：每个月一件自己的事；29：回响 ── */
var Own = {
  gen: function(){
    if (G.month < 2) return;
    var id = 'own_' + G.month;
    if (G.gen[id]) return;
    var opts = [];
    function mk(x, extra){
      var o = { t:x.t, d:x.d, n:x.n, tier:'none', fx:{}, rk:'' };
      for (var k in x.fx) o.fx[k] = x.fx[k];
      if (extra) for (var e in extra) o[e] = extra[e];
      return o;
    }
    /* 铺路：还没铺、还来得及的 */
    var pv = OWN_PAVE.filter(function(p){
      return !G.flags[p.flag] && G.month >= p.mo[0] && G.month <= p.mo[1] && !G.seen[p.before];
    });
    if (pv.length){
      var p = pv[ri(pv.length)], sf = {}; sf[p.flag] = 1;
      opts.push(mk(p, { setf: sf }));
    }
    var selfs = OWN_SELF.filter(function(s){ return !s.rank || (G.rank >= s.rank && Rank.next()); });
    opts.push(mk(selfs[ri(selfs.length)]));
    /* 人 */
    var pp = OWN_PEOPLE[ri(OWN_PEOPLE.length)], who, o2;
    if (pp.kind === 'qx'){
      var q = QX_DEF[ri(QX_DEF.length)]; who = q.id;
      o2 = mk(pp, { info: who }); o2.t = pp.t.replace('{QX}', q.n);
    } else if (pp.kind === 'npc'){
      var vs = VOTERS.filter(function(v){ return v !== 'jiwei'; }); who = vs[ri(vs.length)];
      o2 = mk(pp, { info: who }); o2.t = pp.t.replace('{N}', Pool.side(who).n);
    } else {
      o2 = mk(pp, { info: Cards.someone() });
    }
    opts.push(o2);
    /* 书记的三件事里挑一件 */
    var pj = OWN_PROJ[ri(OWN_PROJ.length)], pr = {}; pr[pj.k] = pj.proj;
    opts.push(mk(pj, { proj: pr }));

    G.gen[id] = { id:id, kind:'note', src:'自己', due:'month', own:1, noRoll:1, img:'night',
      title:'这个月，自己想办的一件事',
      text:'台历上这个月还空着几格。桌上那些是别人的事，这一件是你自己的。',
      nt:'', neglect:{}, opts: opts };
    Desk.push(id, 'month');
  }
};

var Echo = {
  gen: function(){
    if (!G.chose) return;
    if (!G.echoed) G.echoed = {};
    if (G.flags.echoMo && G.month - G.flags.echoMo < 3) return;
    var ready = ECHO.filter(function(x){
      var c = G.chose[x.on];
      return c && !G.echoed[x.on] && x.opts.indexOf(c.i) >= 0 && G.month - c.m >= x.after;
    });
    if (!ready.length || rnd() > 0.4) return;
    var x = ready[ri(ready.length)];
    var id = 'echo_' + x.on;
    G.echoed[x.on] = G.month;
    G.flags.echoMo = G.month;
    G.gen[id] = { id:id, kind:'note', src:x.src || '有人找你', due:'month', free:1, echo:1, noRoll:1,
      img:x.img, title:x.title, text:x.text, nt:'', neglect:{},
      opts:[{ t:x.ok, d:0, tier:'none', n:x.n, fx:x.fx || {}, info:x.info, proj:x.proj, rk:'' }] };
    Desk.push(id, 'month');
  }
};
