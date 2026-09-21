/* ── 45-remark：月末书记批示 ──
   先看这个选项自己带的话（opt.rk），没有才落回通用档。
   空字符串是「他没批」，也是一种批示。 */
var Remark = {

  textOf: function(rk, tier){
    if (rk == null) return remarkOf(tier);
    if (typeof rk === 'string') return rk;
    if (rk[G.bossType] != null) return rk[G.bossType];
    return remarkOf(tier);
  },

  /* 家里的事不进呈阅件。书记不会对你爱人过生日批示——
     他只在这件事碰到工作的时候才开口，而那句话是写在选项上的。
     选项没写，这个月他就没提过这件事，批示栏里也不该有它 */
  isFam: function(id){
    var e = EV(id);
    return !!(e && (e.fam || e.src === '家里'));
  },
  famWord: function(rk){
    if (rk == null) return '';
    if (typeof rk === 'string') return rk;
    return rk[G.bossType] || '';
  },

  /* 办得漂亮的那几件里挑一件，他多批一句。一个月最多一句 */
  praise: function(out){
    var P = PRAISE[G.bossType]; if (!P) return;
    var good = out.filter(function(r){ return r.tier === 'good'; });
    G.flags.dry = (G.flags.dry || 0) + 1;
    if (!good.length || G.month < 3) return;
    if (G.flags.dry < P.dry && rnd() >= P.p * Math.min(3, good.length)) return;
    var r = good[ri(good.length)];
    r.praise = pick(P.t);
    G.flags.dry = 0;
    G.flags.praised = (G.flags.praised || 0) + 1;
    applyFx({ trust: P.trust });
    meritAdd('书记在「' + r.on + '」上批了：' + r.praise);
  },

  build: function(missed){
    var out = [];
    G.done.forEach(function(d){
      if (d.tier === 'none') return;
      if (Remark.isFam(d.id)){
        var w = Remark.famWord(d.rk);
        if (w) out.push({ on: d.title, t: w });
        return;
      }
      out.push({ on: d.title, t: Remark.textOf(d.rk, d.tier || 'good'), tier: d.tier || 'good' });
    });
    Remark.praise(out);
    /* 真没办成的挑一件，他问一句。家里的事不算 */
    var late = (missed || []).filter(function(m){ return !Remark.isFam(m.id); });
    if (late.length){
      out.push({ on: late[0].on, t: remarkOf('none') });
    }
    out = out.slice(0, 6);
    out.forEach(function(r){ G.archive.remarks.push({ m: G.month, on: r.on, t: r.praise ? (r.t ? r.t + '　' : '') + r.praise : r.t, p: r.praise ? 1 : 0 }); });
    return out;
  }
};
