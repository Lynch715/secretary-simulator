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

  build: function(){
    var out = [];
    G.done.forEach(function(d){
      if (d.tier === 'none') return;
      out.push({ on: d.title, t: Remark.textOf(d.rk, d.tier || 'good') });
    });
    var missed = G.queue.filter(function(q){
      return !q.done && (q.due === 'month' || q.due === 'over');
    });
    if (missed.length){
      out.push({ on: missed[0].title, t: remarkOf('none') });
    }
    out = out.slice(0, 6);
    out.forEach(function(r){ G.archive.remarks.push({ m: G.month, on: r.on, t: r.t }); });
    return out;
  }
};
