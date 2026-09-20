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

  build: function(missed){
    var out = [];
    G.done.forEach(function(d){
      if (d.tier === 'none') return;
      if (Remark.isFam(d.id)){
        var w = Remark.famWord(d.rk);
        if (w) out.push({ on: d.title, t: w });
        return;
      }
      out.push({ on: d.title, t: Remark.textOf(d.rk, d.tier || 'good') });
    });
    /* 真没办成的挑一件，他问一句。家里的事不算 */
    var late = (missed || []).filter(function(m){ return !Remark.isFam(m.id); });
    if (late.length){
      out.push({ on: late[0].on, t: remarkOf('none') });
    }
    out = out.slice(0, 6);
    out.forEach(function(r){ G.archive.remarks.push({ m: G.month, on: r.on, t: r.t }); });
    return out;
  }
};
