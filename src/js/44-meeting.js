/* ── 44-meeting：常委会。材料是每个人的书面态度，
   没看过的人，票面上是一个问号。做工作花天数，
   底线议题上好感不管用——得有把柄或者交换 ── */
var VOTERS = ['mayor','vice1','depsec','jiwei','zuzhi','zhengfa','xuanchuan','mishuzhang','tongzhan'];

var Meeting = {

  /* 这个人现在倾向哪边 */
  lean: function(it, e, id){
    var v = (e.lean && e.lean[id] != null) ? e.lean[id] : 0;
    var d = (it.eff && it.eff[id]) || 0;
    /* 拔掉的人，坐在那个位子上的是书记提的人；换边的人，票也跟着换 */
    if (G.fac && G.fac.pulled[id]) return 1.5 + d;
    if (G.fac && G.fac.turned[id]) v += 2;
    /* 底线议题：好感不起作用，只有做工作能撬 */
    var def = null;
    for (var i = 0; i < NPC_DEF.length; i++) if (NPC_DEF[i].id === id) def = NPC_DEF[i];
    var bottom = def && def.bottom && (def.bottom === e.topic || def.bottom === '全部');
    if (!bottom){
      var fav = (G.npc && G.npc[id]) ? G.npc[id].fav : 45;
      v += (fav - 45) / 25;
    }
    return v + d;
  },

  /* 这个人的态度你看过没有 */
  known: function(it, e, id){
    if (it.peek && it.peek[id]) return true;
    if (G.fac && (G.fac.pulled[id] || G.fac.turned[id])) return true;
    if (!e.mats) return true;
    for (var i = 0; i < e.mats.length; i++)
      if (e.mats[i].who === id) return Dossier.hasRead(it, e.mats[i].id);
    return true;
  },

  tally: function(it, e){
    var yes = 0, no = 0;
    VOTERS.forEach(function(id){
      if (Meeting.lean(it, e, id) >= 0) yes++; else no++;
    });
    return { yes: yes, no: no, pass: yes >= (e.need || 5) };
  },

  word: function(v){
    return v >= 2 ? '明确赞成' : v > 0 ? '大体不反对'
      : v > -2 ? '有保留' : '明确反对';
  },

  /* 做工作：改某几个人的票 */
  work: function(uid, idx){
    var it = Desk.find(uid); if (!it || it.done) return;
    var e = EV(it.id); var a = e.acts[idx]; if (!a) return;
    if (!it.acted) it.acted = {};
    if (it.acted[idx]) return;
    var cost = costOf(a.d || 1) + (it.held ? 1 : 0);
    if (cost > G.days + 0.001){ UI.toast('这个月排不下了'); return; }
    if (a.req && !Desk.meet(a.req)) return;
    spendDays(cost);
    it.acted[idx] = 1;
    if (!it.eff) it.eff = {};
    for (var k in a.eff) it.eff[k] = (it.eff[k] || 0) + a.eff[k];
    if (a.fx) applyFx(a.fx);
    if (a.keep) keepAdd(a.keep);
    logAdd(e.title + '：' + a.t);
    save(); UI.render();
  }
};

/* ── 季度调度：每三个月一次常委会。
   那个季度主线自己有常委会，就不再另开 ── */
Meeting.gen = function(){
  if (G.month < 5) return;
  if (G.month % 3 !== 2) return;                   /* 每季度第二个月 */
  if (!G.cwCd) G.cwCd = {};
  /* 主线的常委会已经在队列或已排期里，这季度就不加了 */
  var hasArc = G.queue.some(function(q){
    var e = EV(q.id); return e && e.acts && !q.done;
  });
  if (hasArc) return;
  var pool = TOPICS.filter(function(t){
    if (G.month < t.mo[0] || G.month > t.mo[1]) return false;
    if (G.cwCd[t.id] && G.cwCd[t.id] > G.month) return false;
    return true;
  });
  if (!pool.length) return;
  var t = pool[ri(pool.length)];
  var id = 'cw_' + G.month + '_' + t.id;
  if (G.gen[id]) return;
  var e = {};
  for (var k in t) e[k] = t[k];
  e.id = id;
  e.kind = 'meeting';
  e.src = '常委会';
  e.due = 'month';
  G.gen[id] = e;
  G.cwCd[t.id] = G.month + (t.cd || 16);
  Desk.push(id, 'month');
};
