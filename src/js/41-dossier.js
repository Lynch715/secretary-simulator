/* ── 41-dossier：卷宗。先看材料，再办。
   没看的材料只有标题；看完才知道它支持哪条认定；
   认定够了，某些拟办意见才点得动 ── */
var Dossier = {

  /* 这件事已经看过哪些材料 */
  readOf: function(it){ if (!it.read) it.read = {}; return it.read; },

  hasRead: function(it, mid){ return !!Dossier.readOf(it)[mid]; },

  /* 同一份材料在别的卷宗里看过，就不用再花天数 */
  seenBefore: function(mid){
    return !!(G.mats && G.mats[mid]);
  },

  read: function(uid, mid){
    var it = Desk.find(uid); if (!it || it.done) return;
    var e = EV(it.id); if (!e || !e.mats) return;
    var m = null;
    for (var i = 0; i < e.mats.length; i++) if (e.mats[i].id === mid) m = e.mats[i];
    if (!m || Dossier.hasRead(it, mid)) return;
    var cost = Dossier.seenBefore(mid) ? 0 : costOf(m.d || 0.5);
    if (cost > G.days + 0.001){ UI.toast('这个月排不下了'); return; }
    spendDays(cost);
    Dossier.readOf(it)[mid] = 1;
    if (!G.mats) G.mats = {};
    G.mats[mid] = 1;
    keepAdd(m.t, m.key);
    save();
    UI.render();
  },

  /* 这条认定够不够 */
  findState: function(it, e, f){
    var n = 0;
    (e.mats || []).forEach(function(m){
      if (!Dossier.hasRead(it, m.id)) return;
      if ((m.for || []).indexOf(f.id) >= 0) n++;
      if ((m.against || []).indexOf(f.id) >= 0) n--;
    });
    return { n: n, on: n >= (f.need || 1) };
  },

  lit: function(it, e, fid){
    if (!e.finds) return false;
    for (var i = 0; i < e.finds.length; i++)
      if (e.finds[i].id === fid) return Dossier.findState(it, e, e.finds[i]).on;
    return false;
  },

  /* 门槛选项还差什么——说人话，不说「还需 1 份」 */
  lackWord: function(it, e, fid){
    var f = null;
    for (var i = 0; i < (e.finds || []).length; i++) if (e.finds[i].id === fid) f = e.finds[i];
    if (!f) return '';
    var un = (e.mats || []).filter(function(m){
      return !Dossier.hasRead(it, m.id) && (m.for || []).indexOf(fid) >= 0;
    });
    if (un.length) return '这话现在说不出口，' + un[0].t + '你还没看';
    return '手上这些材料撑不住这个说法';
  }
};
