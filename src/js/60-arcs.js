/* ── 60-arcs：链条。一件事分几幕，幕与幕之间隔几个月。
   上一幕你怎么办的，决定下一幕是哪一幕 ── */
var Arcs = {

  def: function(id){
    return ARCS_BY_ID[id] || (G.genArc && G.genArc[id]) || null;
  },

  stageOf: function(arc, sid){
    for (var i = 0; i < arc.stages.length; i++) if (arc.stages[i].id === sid) return arc.stages[i];
    return null;
  },

  /* 把一幕做成一件真的待办 */
  push: function(arcId, sid, due, gap){
    var arc = Arcs.def(arcId); if (!arc) return null;
    var st = Arcs.stageOf(arc, sid); if (!st) return null;
    var id = 'arc_' + arcId + '_' + sid;
    if (G.gen[id] && G.seen[id]) return null;
    var e = {};
    for (var k in st) e[k] = st[k];
    e.id = id;
    e.kind = st.mats ? 'dossier' : 'note';
    e.src = st.src || '主线';
    e.arc = arcId;
    e.stage = sid;
    G.gen[id] = e;
    if (st.reveal) st.reveal.forEach(function(x){ Pool.reveal(x); });
    var it = Desk.push(id, due || 'month');
    if (it && due === 'plan') it.plan = gap || 2;
    return it;
  },

  /* 开一条线 */
  start: function(arcId){
    var arc = Arcs.def(arcId); if (!arc) return;
    if (G.arcs && G.arcs[arcId]) return;
    if (!G.arcs) G.arcs = {};
    G.arcs[arcId] = { at: G.month, stage: arc.stages[0].id };
    Arcs.push(arcId, arc.stages[0].id, 'month');
  },

  /* 这一幕办完了，看下一幕是哪一幕 */
  advance: function(e, idx, it){
    if (!e.arc) return;
    var arc = Arcs.def(e.arc); if (!arc) return;
    var st = Arcs.stageOf(arc, e.stage); if (!st || !st.next) return;
    var nid = (e.acts && it && it.tally)
      ? st.next[it.tally.pass ? 'pass' : 'fail']
      : st.next[idx];
    if (nid == null) nid = st.next['*'];
    if (!nid) {                                  /* 这条线到头了 */
      if (G.arcs && G.arcs[e.arc]) G.arcs[e.arc].done = G.month;
      return;
    }
    var ns = Arcs.stageOf(arc, nid);
    if (!ns) return;
    if (G.arcs && G.arcs[e.arc]) G.arcs[e.arc].stage = nid;
    var gap = ns.gap == null ? 2 : ns.gap;
    Arcs.push(e.arc, nid, gap > 0 ? 'plan' : 'month', gap);
  },

  /* 月初：到点的线自己开 */
  tick: function(){
    if (!G.arcs) G.arcs = {};
    ARCS.forEach(function(a){
      if (G.arcs[a.id]) return;
      if (!a.at) return;
      if (G.month < a.at[0] || G.month > a.at[1]) return;
      if (rnd() < 0.5 || G.month === a.at[1]) Arcs.start(a.id);
    });
  }
};
