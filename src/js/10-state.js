/* ── 10-state：开局、人、位子、票面、势 ── */
var PDEF = {};
PEOPLE_DEF.forEach(function(p){ PDEF[p.id] = p; });
var POST_BY_ID = {};
POSTS.forEach(function(p){ POST_BY_ID[p.id] = p; });

function newGame(opt){
  opt = opt || {};
  var seed = opt.seed != null ? opt.seed : (Date.now() & 0x7fffffff);
  RNG = mulberry32(seed);
  G = {
    ver: VER, seed: seed, month: 1,
    name: opt.name || '刘峥',
    bossType: opt.bossType || pick(['steady', 'strong', 'shrewd']),
    trust: 55, prestige: 45, money: 3,
    heat: 0, feud: 10, bossRisk: 0,
    people: {}, posts: {}, stand: STANDING.slice(),
    wk: {}, wd: {}, promises: [], noms: {}, mnoms: {},
    acts: 3, props: [], propN: 2, lobby: {},
    bmods: {}, battles: {}, won: 0, lost: 0, streak: 0, cwWins: [],
    pending: [], removed: [], mlog: [], report: [], log: [], remarks: [],
    scene: null, sceneDone: false, sceneRes: null, seen: {}, flags: {},
    school: 0, dropped: 0, lastPull: -9, rankYear: [9],
    moles: [], ending: null, tab: 'war', provAt: -9
  };
  PEOPLE_DEF.forEach(function(d){
    G.people[d.id] = {
      id: d.id, n: d.n, p: d.p, lvl: d.lvl, side: d.side, show: d.side,
      cap: d.cap || 2, age: d.age || 50, dirt: d.dirt || 0, amb: d.amb || 1,
      known: { side: d.cw ? 1 : 0, dirt: 0, amb: 0 }, met: FACES.indexOf(d.id) >= 0 || !!d.cw,
      loyal: 0, by: null, grip: 0, held: 0, turned: 0, gone: 0, post: null,
      yrs: d.yrs != null ? d.yrs : 1 + ri(7)
    };
  });
  ['vice1', 'zhengfa', 'mishuzhang'].forEach(function(id){ G.people[id].dirt = 1; });
  /* 立场鲜明的人，谁都知道他是哪边的 */
  Object.keys(G.people).forEach(function(id){ var p = G.people[id]; if (Math.abs(p.side) >= 30 && MOLE_CAND.indexOf(id) < 0) p.known.side = 1; });
  /* 暗桩：五个候选抽两个 */
  G.moles = shuffle(MOLE_CAND).slice(0, 2);
  G.moles.forEach(function(id){ G.people[id].side = -60; });
  /* 位子 */
  POSTS.forEach(function(p){ G.posts[p.id] = p.holder; G.people[p.holder].post = p.id; });
  /* 书记带来的人念恩满 */
  ['gaoxin', 'gx_qz'].forEach(function(id){ G.people[id].loyal = 90; G.people[id].by = 'boss'; });
  Month.start(true);
  return G;
}

/* ── 人 ── */
function P(id){ return G.people[id]; }
function pn(id){ var p = G.people[id]; return p ? p.n : id; }
function isStanding(id){ return G.stand.indexOf(id) >= 0; }
function faceOf(id){ return FACES.indexOf(id) >= 0 ? id : null; }

/* 玩家眼里的倾向：常委看真值，干部看 show，查清了看真值 */
function seenSide(id){
  var p = P(id);
  if (isStanding(id) || p.known.side) return p.side;
  return p.show;
}
function tierOf(v){
  if (v >= 45) return 2;
  if (v >= 15) return 1;
  if (v > -15) return 0;
  if (v > -45) return -1;
  return -2;
}
var TIER_TXT = { '2':'紧跟书记', '1':'支持书记', '0':'态度不明', '-1':'偏向市长', '-2':'市长一派' };
var CAMP_TXT = { '1':'书记这边', '0':'中间', '-1':'市长那边' };
var LVL_TXT = ['', '正科', '副处', '正处', '副厅', '正厅'];
/* 常委看五档，干部看三档；书记、市长本人不标 */
function sideWord(id){
  if (id === 'boss' || id === 'mayor') return '';
  if (isStanding(id)) return TIER_TXT[tierOf(P(id).side)];
  if (!P(id).known.side && P(id).by !== 'boss') return '底细不清';
  return CAMP_TXT[seenCamp(id)];
}
function lvlWord(id){ var p = P(id); return (LVL_TXT[p.lvl] || '') + '级' + (p.yrs != null ? '，任现级 ' + p.yrs + ' 年' : ''); }
/* 提名这个人到这个位子，算什么 */
function moveKind(id, post){
  var d = POST_BY_ID[post].lvl - P(id).lvl;
  return d <= 0 ? '平调' : (d === 1 ? '提拔' : '破格提拔');
}
function camp(id){ var v = P(id).side; return v >= 20 ? 1 : (v <= -20 ? -1 : 0); }
function seenCamp(id){ var v = seenSide(id); return v >= 20 ? 1 : (v <= -20 ? -1 : 0); }

function addSide(id, d){
  var p = P(id); if (!p || PDEF[id] && PDEF[id].fixed) return;
  if (PDEF[id] && PDEF[id].gripOnly && d > 0 && !p.held && !p.turned) d = Math.min(d, 2);
  p.side = clamp(p.side + d, -100, 100);
  if (!G.people[id].known.side && !isStanding(id)) p.show = clamp(p.show + d, -100, 100);
}

/* ── 位子 ── */
function holder(postId){ return G.posts[postId]; }
function own(postId){ var h = holder(postId); return h && camp(h) === 1; }
function mayors(postId){ var h = holder(postId); return h && camp(h) === -1; }
function vacant(postId){ return !G.posts[postId]; }
function vacancies(){ return POSTS.filter(function(p){ return !G.posts[p.id]; }).map(function(p){ return p.id; }); }
function placeIn(postId, id, by){
  var old = G.posts[postId];
  if (old && P(old)) P(old).post = null;
  var p = P(id);
  if (p.post) G.posts[p.post] = null;
  G.posts[postId] = id; p.post = postId; p.met = true;
  var pl = POST_BY_ID[postId].lvl;
  if (p.lvl < pl){ p.lvl = pl; p.yrs = 0; }
  p.p = POST_BY_ID[postId].n;
  if (by === 'boss'){ p.by = 'boss'; p.loyal = 85; addSide(id, 30); }
  if (by === 'mayor'){ p.by = 'mayor'; addSide(id, -25); }
}
function vacate(postId){
  var h = G.posts[postId];
  if (h){ P(h).post = null; }
  G.posts[postId] = null;
}
function postCount(side){
  var n = 0;
  POSTS.forEach(function(p){ var h = G.posts[p.id]; if (h && camp(h) === side) n++; });
  return n;
}
function seenPostCount(side){
  var n = 0;
  POSTS.forEach(function(p){ var h = G.posts[p.id]; if (h && seenCamp(h) === side) n++; });
  return n;
}

/* ── 票面和势 ── */
function voteScore(){
  var s = 0;
  G.stand.forEach(function(id){ s += tierOf(P(id).side); });
  return s;
}
function shi(){
  var v = 50 + 1.6 * voteScore() + 1.1 * (postCount(1) - postCount(-1)) + 4 * (G.won - G.lost) + (G.prestige - 50) * 0.25;
  return Math.round(clamp(v, 0, 100));
}

/* ── 效果 ── */
function applyFx(fx, src){
  if (!fx) return [];
  var out = [];
  if (fx.trust){ G.trust = clamp(G.trust + fx.trust, 0, 100); }
  if (fx.prestige){ G.prestige = clamp(G.prestige + fx.prestige, 0, 100); }
  if (fx.money){ G.money = clamp(G.money + fx.money, 0, 9); }
  if (fx.heat){ G.heat = clamp(G.heat + fx.heat, heatFloor(), 100); }
  if (fx.feud){ G.feud = clamp(G.feud + fx.feud, 0, 120); }
  if (fx.bossRisk){ G.bossRisk = clamp(G.bossRisk + fx.bossRisk, 0, 100); }
  if (fx.side) for (var k in fx.side) addSide(k, fx.side[k]);
  if (fx.reveal) fx.reveal.forEach(function(w){ if (!G.wk[w]){ G.wk[w] = 1; out.push('知道了：' + wantText(w)); } });
  if (fx.meet) fx.meet.forEach(function(id){ if (!P(id).met){ P(id).met = true; out.push('认识了：' + pn(id)); } });
  if (fx.grip) for (var g in fx.grip) Grip.add(g, fx.grip[g]);
  if (fx.flag) G.flags[fx.flag] = G.month;
  if (fx.bmod) for (var b in fx.bmod){ G.bmods[b] = G.bmods[b] || {}; for (var q in fx.bmod[b]) G.bmods[b][q] = (G.bmods[b][q] || 0) + fx.bmod[b][q]; }
  if (fx.log) logIt(fx.log);
  return out;
}
/* 伸过的手洗不掉：反扑有个底 */
function heatFloor(){ return Math.min(60, (G.flags.gray || 0) * 5 + (G.flags.took_bag ? 6 : 0)); }
function logIt(t){ G.log.push({ m: G.month, t: fill(t) }); }
function report(t){ (G.inEnd ? G.nextReport : G.report).push(fill(t)); }

/* 诉求 */
var WANT_BY_ID = {};
PEOPLE_DEF.forEach(function(d){ (d.wants || []).forEach(function(w){ w.who = d.id; WANT_BY_ID[w.id] = w; }); });
function wantText(w){ return WANT_BY_ID[w] ? pn(WANT_BY_ID[w].who) + '：' + WANT_BY_ID[w].t : w; }
function wantsOf(id){ return (PDEF[id] && PDEF[id].wants) || []; }
