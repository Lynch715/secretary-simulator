/* ── 30-ui：红头、指标条、五页签、送阅件、弹窗、手机 ─────── */
var TABS = [
  { k:'desk',  n:'办公桌' }, { k:'ban', n:'班子' }, { k:'qx', n:'区县' },
  { k:'home',  n:'家里' },   { k:'file', n:'档案' }
];

/* 图都在 assets/ 里，按文件名找。没有就当没有，界面照常 */
var SCENE_BY_SRC = { '自己':'night', '书记交办':'office', '办文':'mishu', '突发':'petition',
                     '有人找你':'door', '家里':'home', '常委会':'changwei' };
function art(file, cls){
  return '<img class="art ' + (cls || '') + '" src="assets/' + file + '" alt="">';
}
function artWrap(file, cls){
  return '<div class="artwrap">' + art(file, cls) + '</div>';
}

var UI = {
  root: null,
  modal: null,

  render: function(){
    if (!UI.root) UI.root = $('#app');
    if (G.ending){ UI.renderEnd(); return; }
    UI.root.innerHTML = UI.head() + UI.datebar() + UI.stats() +
      '<div id="body">' + UI.tabBody() + '</div>' + UI.tabs();
    UI.bind();
    UI.flash();
    if (G.notice && !UI.modal) UI.notice();
  },

  head: function(){
    return '<div class="letterhead"><h1>云州市委办公室</h1>' +
           '<div class="rule"></div><div class="rule2"></div></div>';
  },

  datebar: function(){
    var boss = G.archive.remarks.length >= 6 ? '（' + BOSS_NAME[G.bossType] + '）' : '';
    return '<div class="datebar"><b>' + ymText(G.month) + '</b>' +
      '<span>第 ' + G.month + ' / ' + TERM + ' 个月</span>' +
      '<span class="days">本月剩余 ' + G.days + ' 天</span>' +
      '<span>待办 ' + Desk.live() + '</span>' +
      '<span class="me">' + esc(G.name || '') + ' · ' + Rank.cur().n + '</span>' +
      '<span style="color:var(--ink3)">周维安 书记' + boss + '</span></div>';
  },

  stats: function(){
    var p = takePending();
    var h = '<div class="stats">';
    STAT_DEF.forEach(function(s){
      var v = Math.round(G.stats[s.k]), low = v < s.low ? ' low' : '', d = Math.round(p[s.k] || 0);
      var dh = d ? '<span class="delta ' + (d > 0 ? 'up">+' : 'dn">') + d + '</span>' : '';
      h += '<div class="stat' + low + '">' + dh + '<div class="k">' + s.n + '</div>' +
           '<div class="v">' + v + '</div><div class="bar"><i style="width:' + v + '%"></i></div></div>';
    });
    return h + '</div>';
  },

  tabs: function(){
    var h = '<div class="tabs"><div class="inner">';
    TABS.forEach(function(t){
      var on = G.tab === t.k ? ' on' : '';
      var dot = (t.k === 'desk' && G.queue.some(function(q){ return !q.done && q.due === 'over'; }))
        ? '<span class="dot"></span>' : '';
      h += '<button class="tab' + on + '" data-tab="' + t.k + '">' + t.n + dot + '</button>';
    });
    return h + '<button class="endmo" id="endmo">结束本月</button></div></div>';
  },

  tabBody: function(){
    if (G.tab === 'ban') return UI.ban();
    if (G.tab === 'qx') return UI.qx();
    if (G.tab === 'home') return UI.home();
    if (G.tab === 'file') return UI.file();
    return UI.desk();
  },

  desk: function(){
    var h = '';
    h += '<div class="main"><div class="panel"><h3>待办</h3><ul class="queue">';
    var list = Desk.list(), sepDone = false;
    if (!list.length) h += '<li class="empty">—</li>';
    list.forEach(function(q){
      if (q.done && !sepDone){ h += '<li class="sep">本月已办</li>'; sepDone = true; }
      var when = q.due === 'plan' ? '约 ' + (q.plan || 1) + ' 个月后' : '剩 ' + Desk.daysLeft(q) + ' 天';
      h += '<li><button class="q due-' + q.due + (q.done ? ' done' : '') +
        (G.sel === q.uid ? ' sel' : '') + '" data-q="' + q.uid + '">' +
        '<span class="tag">' + DUE_TAG[q.due] + '</span><span class="t">' + esc(q.title) + '</span>' +
        '<div class="meta">' + esc(q.src) + ' · ' + when +
        (q.done ? ' · 已办' : '') + '</div></button></li>';
    });
    h += '</ul>' + UI.hand() + '</div>';
    return h + '<div class="panel">' + UI.docPane() + '</div></div>';
  },

  /* 手里的牌 */
  hand: function(){
    var cs = Cards.all();
    if (!cs.length) return '';
    var h = '<h3 class="hand-h">手 里</h3><div class="hand">';
    cs.forEach(function(c){
      h += '<button class="cardb ' + c.type + '" data-card="' + c.id + '">' +
        '<span class="ct">' + (c.type === 'favor' ? '人情' : '消息') + '</span>' +
        '<span class="cn">' + esc(Cards.label(c)) + '</span></button>';
    });
    return h + '</div>';
  },

  cardModal: function(cid){
    var c = Cards.find(cid); if (!c) return;
    var s = Pool.side(c.who);
    var b = '<div class="kv"><i>' + esc(s.p) + '</i><span>' + ymText(c.m) + '</span></div>';
    if (c.type === 'info'){
      b += '<p style="font-family:var(--song);font-size:17px;margin:12px 0">' + esc(c.t) + '</p>';
      b += '<div class="bar-note" style="padding:0">' + esc(c.from) + '</div>';
    } else {
      b += '<p style="font-family:var(--song);font-size:17px;margin:12px 0">' +
        esc((CALL[c.who] && CALL[c.who].n) || '他记着你一次') + '</p>';
      b += '<div class="bar-note" style="padding:0">' + esc(c.from) + '</div>';
    }
    var told = G.flags.toldMo === G.month;
    var foot = '<button class="btn" data-x>放着</button>';
    if (c.type === 'info')
      foot += '<button class="btn pri" data-tell' + (told ? ' disabled' : '') + '>' +
        (told ? '这个月已经提过一回了' : '找个没人的时候跟书记提一句') + '</button>';
    var d = UI.open(esc(c.type === 'info' ? '关于' + s.n : Cards.label(c)), b, foot);
    on($('[data-x]', d), 'click', UI.close);
    on($('[data-tell]', d), 'click', function(){
      var w = Cards.tell(cid); if (!w) return;
      UI.close(); UI.render();
      var d2 = UI.open('', '<p style="font-family:var(--song);text-indent:2em">' + esc(w) + '</p>',
        '<button class="btn pri" data-x>嗯</button>');
      on($('[data-x]', d2), 'click', UI.close);
    });
  },

  docPane: function(){
    var q = G.sel ? Desk.find(G.sel) : null;
    if (!q) return '<h3>送阅件</h3><div class="empty" style="padding:70px 0">—</div>';
    var e = EV(q.id);
    if (q.due === 'plan'){
      return '<h3>送阅件</h3><div class="doc"><h2>' + esc(e.title) + '</h2>' +
        '<div class="sub">已排期 · 约 ' + (q.plan || 1) + ' 个月后</div></div>';
    }
    var n = (q.uid.replace(/\D/g, '') | 0);
    var scene = e.img || SCENE_BY_SRC[q.src] || '';
    var h = '<h3>送阅件</h3>' +
      (scene ? artWrap('s_' + scene + '.webp', 'art-banner') : '') +
      '<div class="doc">' +
      '<div class="no">云委办〔' + ymOf(G.month).y + '〕' + (100 + n * 7 % 800) + '号</div>' +
      (e.who ? artWrap('p_' + e.who + '.webp', 'art-face doc-face') : '') +
      '<h2>' + esc(Rank.rename(Fac.title(e))) + '</h2>' +
      '<div class="sub">' + esc(q.src) + ' · ' + DUE_TAG[q.due] + ' · 剩 ' + Desk.daysLeft(q) +
      ' 天' + (q.bumped ? ' · 上月拖过来的' : '') +
      (q.held ? ' · 这件在秘书长那儿转了一圈' : '') + '</div>' +
      '<p>' + esc(Rank.rename(Fac.text(e))) + '</p>';
    if (q.done){
      var fresh = UI._fresh === q.uid; if (fresh) UI._fresh = null;
      var r = q.res, extra = '';
      if (r.proj) extra += '<div class="got">推了一把：' + esc(r.proj) + '</div>';
      if (r.deleg) extra += '<div class="keep">小周跑的，没占你的天数</div>';
      if (r.used) extra += '<div class="keep">用掉了：' + esc(r.used) + (r.even ? '。这回开口，两清，不欠他的' : '') + '</div>';
      (r.got || []).forEach(function(g){ extra += '<div class="got">到手：' + esc(g) + '</div>'; });
      return h + '<div class="result' + (fresh ? ' fresh' : '') + '"><span class="stamp">已办</span>' +
        '<div class="r">你的处理：' + esc(r.t) + '</div>' +
        (r.n ? '<div class="r" style="color:var(--ink2);font-size:14px">' + esc(Rank.rename(r.n)) + '</div>' : '') +
        (r.keep ? '<div class="keep">留痕：' + esc(r.keep) + '</div>' : '') + extra + '</div></div>';
    }
    if (e.slot){
      var pk = Slots.picked(q);
      h += '<div class="hr"></div><div class="lab">书 记 这 个 月 的 四 个 空</div>';
      h += '<div class="slots">';
      e.list.forEach(function(c, i){
        var on = pk.indexOf(i) >= 0;
        h += '<button class="slot' + (on ? ' on' : '') + '" data-k="' + i + '"' +
          (q.slotDone ? ' disabled' : '') + '>' +
          '<span class="box">' + (on ? '✓' : '') + '</span>' +
          '<span class="sn">' + esc(c.n) + '<i>' + esc(c.p) + '</i></span>' +
          '<span class="sw">' + esc(c.why) + '</span></button>';
      });
      h += '</div>';
      if (!q.slotDone){
        h += '<div style="margin-top:10px;display:flex;align-items:center;gap:12px">' +
          '<button class="btn pri" id="slotok"' + (pk.length ? '' : ' disabled') + '>就这么排</button>' +
          '<span style="font-size:13px;color:var(--ink3)">' +
          (pk.length >= 4 ? '四个空满了' : '还空着 ' + (4 - pk.length) + ' 个') + '</span></div>';
        return h + '</div>';
      }
      h += '<div class="result" style="margin-top:12px"><div class="r">';
      pk.forEach(function(k){ h += esc(e.list[k].n) + '　' + esc(e.list[k].inN) + '<br>'; });
      h += '</div>' + (q.slotBlame ? '<div class="keep">书记后来说了一句：' + esc(q.slotBlame) + '</div>' : '') +
        '</div>';
      h += '<div class="hr"></div><div class="lab">剩 下 的</div><div style="font-size:13px;color:var(--ink3);margin-bottom:8px">';
      e.list.forEach(function(c, i){ if (pk.indexOf(i) < 0) h += esc(c.n) + '　'; });
      h += '</div>';
    }
    if (e.mats && e.mats.length){
      h += '<div class="hr"></div><div class="lab">材 料</div><div class="mats">';
      e.mats.forEach(function(m){
        var got = Dossier.hasRead(q, m.id);
        if (got){
          h += '<div class="mat on"><div class="mt">' + esc(m.t) +
            '<span class="mf">' + esc(m.from) + '</span></div>' +
            '<div class="mx">' + esc(m.text) + '</div></div>';
        } else {
          var c = Dossier.seenBefore(m.id) ? '看过了' : (m.d || 0.5) + ' 天';
          h += '<button class="mat" data-m="' + m.id + '"><div class="mt">' + esc(m.t) +
            '<span class="mf">' + esc(m.from) + ' · ' + c + '</span></div></button>';
        }
      });
      h += '</div>';
    }
    if (e.finds && e.finds.length){
      h += '<div class="lab" style="margin-top:12px">这 件 事 到 底 是 怎 么 回 事</div><div class="finds">';
      e.finds.forEach(function(f){
        var st = Dossier.findState(q, e, f);
        h += '<div class="find' + (st.on ? ' on' : '') + '">' +
          (st.on ? '●' : '○') + '　' + esc(f.t) + '</div>';
      });
      h += '</div>';
    }
    if (e.acts){
      var tl = Meeting.tally(q, e);
      h += '<div class="hr"></div><div class="lab">票 面</div><div class="votes">';
      VOTERS.forEach(function(id){
        var s = Pool.side(id), kn = Meeting.known(q, e, id);
        var v = Meeting.lean(q, e, id);
        h += '<div class="vote"><span class="vn">' + esc(s.n) + '<i>' + esc(s.p) + '</i></span>' +
          '<span class="vv' + (kn ? (v > 0 ? ' y' : ' n') : '') + '">' +
          (kn ? Meeting.word(v) : '？') + '</span></div>';
      });
      h += '</div>';
      var unknown = VOTERS.filter(function(id){ return !Meeting.known(q, e, id); }).length;
      h += '<div class="bar-note" style="padding:6px 0 0">' +
        (unknown ? '还有 ' + unknown + ' 个人的态度你不知道' :
          '数下来 ' + tl.yes + ' 比 ' + tl.no) + '</div>';
      if (!q.done){
        h += '<div class="lab" style="margin-top:12px">做 工 作</div><div class="opts">';
        e.acts.forEach(function(a, i){
          var used = q.acted && q.acted[i];
          var lackA = a.req && !Desk.meet(a.req);
          var cA = costOf(a.d || 1) + (q.held ? 1 : 0);
          var noA = used || lackA || cA > G.days + 0.001;
          h += '<button class="opt" data-a="' + i + '"' + (noA ? ' disabled' : '') + '>' +
            '<span class="d">' + (used ? '已经去过了' : (lackA ? '' : cA + ' 天')) + '</span>' +
            '<span class="t">' + esc(a.t) + '</span>' +
            '<div class="n">' + esc(used ? (a.after || a.n) : (lackA ? (a.nlow || '') : a.n)) + '</div>' +
            '</button>';
        });
        h += '</div>';
      }
    }
    if (e.acts){
      var mc = Cards.forMeeting(q, e);
      if (mc.length){
        h += '<div class="lab" style="margin-top:12px">手 里 能 打 的</div><div class="opts">';
        mc.forEach(function(c){
          var nm = Pool.side(c.who).n;
          h += '<button class="opt cardopt" data-mc="' + c.id + '"><span class="d">当场</span>' +
            '<span class="t">' + (c.type === 'favor' ? '让' + esc(nm) + '把上回那个人情还了'
              : '你知道' + esc(nm) + '的一件事，先摸摸他的底') + '</span>' +
            '<div class="n">' + (c.type === 'favor' ? '他这一票会往书记这边挪一大步。用掉就没了'
              : esc(c.t) + '。不用看材料，他这一票你心里就有数了') + '</div></button>';
        });
        h += '</div>';
      }
    }
    if (Desk.canDeleg(q, e) || q.deleg){
      h += '<button class="deleg' + (q.deleg ? ' on' : '') + '" id="deleg"><span class="box">' +
        (q.deleg ? '✓' : '') + '</span>这件交给小周去跑<i>不占你的天数。见不得人的事他跑不了</i></button>';
    }
    h += '<div class="hr"></div><div class="lab">' +
      (e.acts ? '开 会 那 天' : '拟 办 意 见') + '</div><div class="opts">';
    Desk.optsOf(q, e).forEach(function(o, i){
      var lackF = o.reqFind && !Dossier.lit(q, e, o.reqFind);
      var lack = lackF || (o.req && !Desk.meet(o.req));
      var cost = Desk.costFor(q, e, o);
      var noRoom = cost > G.days + 0.001 && !e.force;
      var nod = lack || noRoom;
      /* 选之前不剧透结果：o.n 只在办完后的「已办」里出现 */
      var note = lackF ? Dossier.lackWord(q, e, o.reqFind)
        : (lack ? (o.nlow || '') : '');
      note = Rank.rename(note);
      var even = (!lack && o.fx && o.fx.owe && Cards.has('favor', o.fx.owe.who))
        ? '<div class="n even">' + esc(Pool.side(o.fx.owe.who).n) + '还记着你一次。这回开口，两清</div>' : '';
      h += '<button class="opt' + (o.rule ? ' gray' : '') + (o.call ? ' cardopt' : '') + '" data-o="' + i + '"' +
        (nod ? ' disabled' : '') + '><span class="d">' +
        (lack ? '' : (noRoom ? '排不下' : (cost ? cost + ' 天' : '当场'))) + '</span>' +
        '<span class="t">' + esc(o.t) + '</span>' +
        (note ? '<div class="n">' + esc(note) + '</div>' : '') + even + '</button>';
    });
    h += '</div>';
    return h + '</div>';
  },

  /* 局势图：这张桌子上，谁坐谁那边 */
  board: function(){
    var rows = Fac.board();
    var h = '<div class="panel"><h3>这张桌子上，谁坐谁那边</h3><div class="board">';
    rows.forEach(function(r){
      h += '<span class="bd bd-' + r.s + '">' + esc(r.n) + '<i>' + esc(r.p) + '</i></span>';
    });
    var w = Fac.boardWord();
    h += '</div>' + (w ? '<div class="bar-note" style="padding:0 14px 12px">' + esc(w) + '</div>' : '') + '</div>';
    return h;
  },

  ban: function(){
    npcInit(); Pool.init(); Fac.init();
    var h = UI.board();
    h += '<div class="panel" style="margin-top:12px"><h3>市委常委会</h3><div class="cards">';
    NPC_DEF.forEach(function(d){
      var s = G.npc[d.id] || { fav:40 };
      var pulled = G.fac.pulled[d.id], sc = pulled ? Fac.succ(d.id) : null;
      var nm = sc ? sc.n : d.n;
      var line = sc ? '<div class="l">新来的，还在摸情况</div>'
        : (npcKnown(d.id) >= 1 ? '<div class="l">' + d.line + '</div>' : '<div class="l dim">还没打过交道</div>');
      if (G.fac.turned[d.id]) line += '<div class="l" style="color:var(--red)">已经不在那边了</div>';
      h += '<div class="card">' + artWrap('p_' + (sc ? 'none' : d.id) + '.webp', 'art-face') +
        '<div class="n">' + nm + '</div>' +
        '<div class="p">' + d.p + ' · ' + (sc ? '书记提的' : d.f) + '</div>' + line +
        (d.id === 'boss' ?
          '<div class="kv"><i>说话的分量</i><span>' + UI.presWord(G.stats.prestige) + '</span></div>' +
          '<div class="mini"><i style="width:' + G.stats.prestige + '%"></i></div>' :
          '<div class="kv"><i>对你</i><span>' + UI.favWord(s.fav) + '</span></div>' +
          '<div class="mini"><i style="width:' + s.fav + '%"></i></div>' +
          (d.bottom && npcKnown(d.id) >= 4
            ? '<div class="l" style="margin-top:6px">' + bottomLine(d.bottom) + '</div>' : '')) +
        '</div>';
    });
    h += '</div></div>';

    var met = Pool.metList();
    Proj.init();
    h += '<div class="panel" style="margin-top:12px"><h3>他这一届要干成的三件事</h3><div style="padding:10px 14px">';
    PROJ.forEach(function(p){
      var v = Math.round(G.proj[p.k]);
      h += '<div class="kv" style="font-size:14px"><i style="color:var(--ink)">' + p.n + '</i><span>' + PROJ_WORD(v) + '</span></div>' +
        '<div class="mini red" style="margin-bottom:10px"><i style="width:' + v + '%"></i></div>';
    });
    h += '<div class="bar-note" style="padding:4px 0 0">去年全省十三个市，云州排第 ' + G.cityRank + '。' +
      (G.rankLog.length ? '' : '那是他来之前的事') + '</div></div></div>';
    h += '<div class="panel" style="margin-top:12px"><h3>见过面的</h3>';
    if (!met.length){
      h += '<div class="empty">—</div>';
    } else {
      h += '<div class="cards">';
      met.forEach(function(x){
        var s = G.pool[x.id];
        h += '<div class="card">' + artWrap('p_' + x.id + '.webp', 'art-face') +
          '<div class="n">' + x.n + '</div>' +
          '<div class="p">' + Pool.postOf(x) + ' · ' + x.grp + ' · ' + x.age + ' 岁' +
          (G.pool[x.id].moved ? '　（' + ymText(G.pool[x.id].moved) + '调整）' : '') + '</div>' +
          '<div class="kv"><i>对你</i><span>' + UI.favWord(s.fav) + '</span></div>' +
          '<div class="mini"><i style="width:' + s.fav + '%"></i></div>' +
          (x.want ? '<div class="kv"><i>想去</i><span>' + x.want + '</span></div>' : '') +
          (s.known && x.dirty ? '<div class="kv"><i>你知道</i><span>他手不干净</span></div>' : '') +
          '</div>';
      });
      h += '</div>';
    }
    h += '</div>';

    h += '<div class="panel" style="margin-top:12px"><h3>这些人之间</h3><div style="padding:10px 14px">';
    PAIRS.slice().sort(function(a, b){ return Pool.heat(b.id) - Pool.heat(a.id); })
      .forEach(function(pr){
        var v = Pool.heat(pr.id), A = Pool.side(pr.a), B = Pool.side(pr.b);
        var col = v >= 70 ? 'var(--red)' : v >= 55 ? '#B5705F'
          : v >= 40 ? '#A2957F' : 'var(--line)';
        var th = v >= 70 ? 3 : v >= 55 ? 2 : 1;
        var st = v >= 55 ? 'solid' : 'dashed';
        h += '<div class="pair' + (v >= 70 ? ' hot' : '') + '">' +
          '<span class="pn">' + esc(A.n) + '<i>' + esc(A.p) + '</i></span>' +
          '<span class="pline" style="border-top:' + th + 'px ' + st + ' ' + col + '"></span>' +
          '<span class="pn r">' + esc(B.n) + '<i>' + esc(B.p) + '</i></span></div>' +
          '<div class="pwhy' + (v >= 70 ? ' hot' : '') + '">' + esc(pr.why) +
          (v >= 90 ? '　这两个人已经不在一张桌子上说话了'
           : v >= 70 ? '　这个月该出事了' : '') + '</div>';
      });
    h += '</div></div>';
    return h;
  },

  presWord: function(v){
    return v >= 75 ? '一句话就定了' : v >= 60 ? '大体听他的'
      : v >= 45 ? '要看是什么事' : v >= 30 ? '常委会上得数票' : '说了也不算';
  },
  favWord: function(v){
    return v >= 75 ? '很受用' : v >= 60 ? '还行' : v >= 45 ? '一般' : v >= 30 ? '有意见' : '不待见你';
  },

  qx: function(){
    npcInit();
    var h = '<div class="panel"><h3>云州市 三区三县</h3>' +
      artWrap('s_city.webp', 'art-banner') + '<div class="cards">';
    QX_DEF.forEach(function(d){
      var s = G.qx[d.id] || { fav:45 };
      h += '<div class="card">' + artWrap('p_' + d.id + '.webp', 'art-face') +
        '<div class="n">' + d.n + '</div><div class="p">' + d.tag + '</div>' +
        '<div class="l' + (npcKnown(d.id) >= 1 || (G.qxHead && G.qxHead[d.id]) ? '' : ' dim') + '">' +
        ((G.qxHead && G.qxHead[d.id]) || d.head) + '：' +
        ((G.qxHead && G.qxHead[d.id]) ? '新上任，还在摸情况'
          : (npcKnown(d.id) >= 1 ? d.hl : '还没打过交道')) + '</div>' +
        '<div class="kv"><i>对你</i><span>' + UI.favWord(s.fav) + '</span></div>' +
        '<div class="mini"><i style="width:' + s.fav + '%"></i></div></div>';
    });
    return h + '</div></div>';
  },

  home: function(){
    var f = G.hidden.fam;
    var word = G.hidden.famBroken ? '她不问你几点回来了。上个月开始分房睡'
      : f >= 10 ? '上一次一家三口一起吃饭是什么时候，你想不起来'
      : f >= 6 ? '幼儿园的接送表上，这个月你的名字一次没出现'
      : f >= 3 ? '她值夜班，你加班，一周能碰上两顿早饭'
      : '周末带孩子去了趟公园，你手机响了三次';
    Private.init();
    var h = '<div class="panel"><h3>家里</h3>' + artWrap('s_home.webp', 'art-banner') +
      '<div class="cards">';
    KIN.forEach(function(d){
      h += '<div class="card">' + artWrap('p_' + d.id + '.webp', 'art-face') +
        '<div class="n">' + d.rel + (d.n ? '　' + d.n : '') + '</div>' +
        '<div class="l">' + d.line + '</div></div>';
    });
    h += '</div><div class="bar-note" style="padding:0 12px 16px">' + word + '</div></div>';
    h += '<div class="panel" style="margin-top:12px"><h3>家底</h3><div style="padding:12px 14px">' +
      '<div class="kv"><i>' + Private.moneyWord() + '</i><span>' +
      G.money.toFixed(1) + ' 万</span></div></div></div>';
    return h;
  },

  file: function(){
    var a = G.archive;
    function lines(arr, empty){
      if (!arr.length) return '<div class="empty">—</div>';
      return '<div style="padding:8px 12px">' + arr.slice(-40).map(function(x){
        return '<div class="kv"><i>' + ymText(x.m) + '</i>' +
          '<span style="text-align:right;max-width:78%">' + esc(x.t) + '</span></div>';
      }).join('') + '</div>';
    }
    var rk = Rank.cur();
    var h = '<div class="panel"><h3>干部履历</h3><div class="card" style="border:0;position:relative;padding:10px 14px">' +
      artWrap('p_me.webp', 'art-face') +
      '<div class="kv"><i>姓名</i><span>' + esc(G.name) + '</span></div>' +
      '<div class="kv"><i>现任</i><span>' + esc(rk.post) + '</span></div>' +
      '<div class="kv"><i>职级</i><span>' + rk.n + '（' + ymText(G.rankAt[G.rank] || 1) + '起）</span></div>' +
      '<div class="kv"><i>批示里被夸过</i><span>' + (G.flags.praised || 0) + ' 回</span></div>' +
      '<div class="bar-note" style="padding:8px 0 0">' + esc(Rank.word()) + '</div></div></div>';
    h += '<div class="panel" style="margin-top:12px"><h3>履历 · 功</h3>' + lines(a.merit) + '</div>';
    h += '<div class="panel" style="margin-top:12px"><h3>履历 · 过</h3>' +
         lines(a.fault) + '</div>';
    h += '<div class="panel" style="margin-top:12px"><h3>留存材料</h3>' +
         lines(a.mats) + '</div>';
    h += '<div class="panel" style="margin-top:12px"><h3>书记</h3>';
    if (!a.remarks.length){ h += '<div class="empty">—</div>'; }
    else {
      h += '<div style="padding:10px 14px">';
      a.remarks.slice(-20).forEach(function(r){
        h += UI.remarkHTML(r.t, ymText(r.m) + ' · ' + r.on);
      });
      if (a.remarks.length >= 6)
        h += '<div class="bar-note" style="padding-top:8px">' + BOSS_READ[G.bossType] + '</div>';
      h += '</div>';
    }
    h += '</div><div class="panel" style="margin-top:12px"><h3>纪律条目</h3><div style="padding:8px 12px">';
    for (var rk in RULES){
      var rr = RULES[rk];
      h += '<div class="kv"><i>' + (rr.red ? '● ' : '') + rr.n + '</i><span>' + rr.pun + '</span></div>';
    }
    h += '</div></div>';
    h += '<div class="panel" style="margin-top:12px"><h3>存档</h3>' +
      '<div style="padding:12px;display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn" id="exp">导出存档</button>' +
      '<label class="btn" style="display:inline-block">导入存档' +
      '<input type="file" id="imp" accept="application/json" style="display:none"></label>' +
      '<button class="btn" id="newg">重开一局</button></div></div>';
    return h;
  },

  bind: function(){
    UI.artFallback();
    $$('.tab').forEach(function(b){
      on(b, 'click', function(){ G.tab = b.dataset.tab; UI.render(); });
    });
    on($('#endmo'), 'click', UI.askNight);
    $$('.q').forEach(function(b){
      on(b, 'click', function(){ G.sel = b.dataset.q; UI.render(); });
    });
    $$('.opt[data-a]').forEach(function(b){
      on(b, 'click', function(){ if (!b.disabled) Meeting.work(G.sel, +b.dataset.a); });
    });
    $$('.slot[data-k]').forEach(function(b){
      on(b, 'click', function(){ if (!b.disabled) Slots.toggle(G.sel, b.dataset.k); });
    });
    on($('#slotok'), 'click', function(){ Slots.confirm(G.sel); });
    $$('[data-card]').forEach(function(b){
      on(b, 'click', function(){ UI.cardModal(b.dataset.card); });
    });
    $$('[data-mc]').forEach(function(b){
      on(b, 'click', function(){ Cards.play(G.sel, b.dataset.mc); });
    });
    on($('#deleg'), 'click', function(){ Desk.deleg(G.sel); });
    $$('.mat[data-m]').forEach(function(b){
      on(b, 'click', function(){ Dossier.read(G.sel, b.dataset.m); });
    });
    $$('.opt[data-o]').forEach(function(b){
      on(b, 'click', function(){ if (!b.disabled) Desk.choose(G.sel, +b.dataset.o); });
    });
    on($('#exp'), 'click', exportSave);
    on($('#newg'), 'click', function(){
      UI.confirm('重开一局？现在这局就没了。', function(){ wipe(); UI.start(); });
    });
    var imp = $('#imp');
    if (imp) on(imp, 'change', function(){
      if (imp.files[0]) importSave(imp.files[0], function(ok){
        if (ok) UI.render(); else UI.toast('这个文件读不出来');
      });
    });
  },

  /* 没有这张图就把它那一块整个去掉，不留空洞 */
  artFallback: function(root){
    $$('img.art', root).forEach(function(im){
      im.onerror = function(){
        var w = im.parentNode;
        if (w && w.className === 'artwrap') w.parentNode.removeChild(w);
        else if (im.parentNode) im.parentNode.removeChild(im);
      };
      im.onload = function(){
        var c = im.parentNode && im.parentNode.parentNode;
        if (c && c.className.indexOf('card') >= 0) c.className += ' has-face';
      };
      if (im.complete){ im.naturalWidth === 0 ? im.onerror() : im.onload(); }
    });
  },

  flash: function(){
    setTimeout(function(){ $$('.delta').forEach(function(d){ d.classList.add('on'); }); }, 30);
    setTimeout(function(){ $$('.delta').forEach(function(d){ d.classList.remove('on'); }); }, 2200);
  },

  open: function(title, body, foot){
    UI.close();
    var d = document.createElement('div');
    d.className = 'mask';
    d.innerHTML = '<div class="modal">' + (title ? '<h3>' + title + '</h3>' : '') +
      '<div class="body">' + body + '</div><div class="foot">' + (foot || '') + '</div></div>';
    document.body.appendChild(d);
    UI.modal = d;
    UI.artFallback(d);
    return d;
  },
  close: function(){ if (UI.modal){ UI.modal.remove(); UI.modal = null; } },
  toast: function(msg){
    var d = UI.open('', '<div style="text-align:center">' + esc(msg) + '</div>',
      '<button class="btn pri" data-x>知道了</button>');
    on($('[data-x]', d), 'click', UI.close);
  },
  confirm: function(msg, cb){
    var d = UI.open('确认', '<div>' + esc(msg) + '</div>',
      '<button class="btn" data-n>算了</button><button class="btn pri" data-y>就这么办</button>');
    on($('[data-n]', d), 'click', UI.close);
    on($('[data-y]', d), 'click', function(){ UI.close(); cb(); });
  },

  askNight: function(){
    var undone = G.queue.filter(function(q){ return !q.done && q.due !== 'plan'; });
    var b = '';
    if (undone.length){
      b += '<div class="lab">这 个 月 没 办 完 的</div><div style="margin-bottom:14px">';
      undone.forEach(function(q){
        b += '<div class="kv"><i>' + DUE_TAG[q.due] + '</i><span>' + esc(q.title) + '</span></div>';
      });
      b += '</div>';
    }
    b += '<div class="lab">这 个 月 末</div><div class="opts">';
    Desk.NIGHT.forEach(function(n){
      var dis = (n.k === 'fam' && G.hidden.famBroken);
      b += '<button class="opt" data-n="' + n.k + '"' + (dis ? ' disabled' : '') + '>' +
        '<span class="t">' + n.n + '</span><div class="n">' +
        (dis ? '她已经不等你了' : n.d) + '</div></button>';
    });
    b += '</div>';
    var d = UI.open('结束本月', b, '<button class="btn" data-x>再看看</button>');
    on($('[data-x]', d), 'click', UI.close);
    $$('.opt', d).forEach(function(btn){
      on(btn, 'click', function(){
        if (btn.disabled) return;
        UI.close();
        UI.showRemarks(Desk.endMonth(btn.dataset.n));
      });
    });
  },

  showRemarks: function(res){
    var rs = (res && res.remarks) || [], ms = (res && res.missed) || [];
    if (G.ending){ G.sel = null; UI.render(); return; }
    UI._year = res && res.year;
    if (!rs.length && !ms.length && !(res && (res.clean || res.tea))){ G.sel = null; UI.render(); UI.yearEnd(); return; }
    var b = '';
    if (res.clean){
      b += '<div class="cleandesk"><span class="seal">清</span><div>' + esc(res.clean.t) +
        (res.clean.word ? '<div class="cw">' + esc(res.clean.word) + '</div>' : '') + '</div></div>';
    }
    if (ms.length){
      b += '<div class="lab">没 办 的 那 几 件</div>';
      ms.forEach(function(m){
        b += '<div class="kv"><i>' + esc(m.on) + '</i><span>' + esc(m.t) + '</span></div>';
      });
      b += '<div style="height:14px"></div>';
    }
    if (rs.length) b += '<div class="lab">书 记 批 示</div>';
    rs.forEach(function(r){ b += UI.remarkHTML(r.t, r.on, r.praise); });
    if (res.tea) b += '<div class="got" style="margin-top:12px">到手：' + esc(res.tea) + '</div>';
    var d = UI.open(ymText(G.month - 1) + ' 呈阅件', b,
      '<button class="btn pri" data-x>进入 ' + ymText(G.month) + '</button>');
    on($('[data-x]', d), 'click', function(){ UI.close(); G.sel = null; UI.render(); UI.yearEnd(); });
  },

  /* 年底省里的通报。十三个市排一排 */
  yearEnd: function(){
    var y = UI._year; UI._year = null;
    if (!y || G.ending){ UI.promo(); return; }
    Proj.init();
    var row = '';
    for (var i = 1; i <= 13; i++)
      row += '<span class="rk' + (i === y.r ? ' on' : '') + (i === y.last ? ' last' : '') + '">' + (i === y.r ? '云州' : i) + '</span>';
    var pj = '';
    PROJ.forEach(function(p){
      var v = Math.round(G.proj[p.k]);
      pj += '<div class="kv"><i>' + p.n + '</i><span>' + PROJ_WORD(v) + '</span></div>' +
        '<div class="mini red"><i style="width:' + v + '%"></i></div>';
    });
    var b = '<div class="appoint yearp"><div class="ah">江东省委办公厅通报</div>' +
      '<div class="ano">' + y.y + ' 年度全省地市综合考核结果</div><div class="aline"></div>' +
      '<div class="bigr">第 <b>' + y.r + '</b> 名</div><div class="rks">' + row + '</div>' +
      '<div class="ano" style="margin-top:8px">' + esc(y.d) + '</div></div>' +
      '<p style="font-family:var(--song);text-indent:2em;margin-top:16px">' + esc(y.line) + '</p>' +
      (y.bonus ? '<div class="got">' + esc(y.bonus) + '</div>' : '') +
      '<div style="margin-top:14px">' + pj + '</div>';
    var d = UI.open('', b, '<button class="btn pri" data-x>进入 ' + ymOf(G.month).y + ' 年</button>');
    d.className += ' big';
    on($('[data-x]', d), 'click', function(){ UI.close(); UI.render(); UI.promo(); });
  },

  /* 任命文件。整张纸，红头，盖章 */
  promo: function(){
    if (G.promo == null || G.ending) return;
    var r = RANKS[G.promo]; G.promo = null; save();
    if (!r) return;
    var ym = ymOf(G.month);
    var b = '<div class="appoint"><div class="ah">云州市委办公室文件</div>' +
      '<div class="ano">云委办干〔' + ym.y + '〕' + (3 + r.k * 4) + '号</div><div class="aline"></div>' +
      '<div class="at">关于' + esc(G.name) + '同志职级晋升的通知</div>' +
      '<p>各科室：</p><p>经市委组织部批复同意，' + esc(G.name) + '同志晋升为' + r.n +
      (r.k === 2 ? '，任市委办公室副主任，不再挂职' : '') + '。</p><p>特此通知。</p>' +
      '<div class="asign">云州市委办公室<br>' + ym.y + '年' + ym.m + '月' +
      '<span class="aseal"><i>★</i>云州市委办公室</span></div></div>' +
      '<p style="font-family:var(--song);text-indent:2em;margin-top:16px">' + esc(r.story) + '</p>';
    (r.got || []).forEach(function(g){ b += '<div class="got">' + esc(g) + '</div>'; });
    var d = UI.open('', b, '<button class="btn pri" data-x>收好</button>');
    d.className += ' big';
    on($('[data-x]', d), 'click', function(){ UI.close(); UI.render(); });
  },

  /* 拔掉一个人之后的那张纸：红头、文号、落款、章 */
  notice: function(){
    var n = G.notice; if (!n || G.ending) return;
    G.notice = null; save();
    var t = FAC_NOTICE[n.way] || FAC_NOTICE.hr;
    function sub(s){ return String(s).replace(/\{N\}/g, n.n).replace(/\{P\}/g, n.p).replace(/\{TO\}/g, n.to || ''); }
    var ym = ymOf(G.month);
    var b = '<div class="appoint"><div class="ah">' + esc(t.h) + (n.way === 'jw' ? '通报' : '文件') + '</div>' +
      '<div class="ano">' + (n.way === 'jw' ? '省纪监' : '云委') + '〔' + ym.y + '〕' + (20 + (G.month * 3) % 60) + '号</div><div class="aline"></div>' +
      '<div class="at">' + esc(sub(t.t)) + '</div>' +
      '<p>' + esc(sub(t.body)) + '</p>' +
      '<div class="asign">' + esc(t.h) + '<br>' + ym.y + '年' + ym.m + '月' +
      '<span class="aseal"><i>★</i>' + esc(t.h) + '</span></div></div>';
    var d = UI.open('', b, '<button class="btn pri" data-x>收好</button>');
    d.className += ' big';
    on($('[data-x]', d), 'click', function(){ UI.close(); });
  },

  remarkHTML: function(txt, on, praise){
    if (praise) return '<div class="remark praise"><span class="ring">阅</span>' +
      (txt ? esc(txt) + '　' : '') + '<b>' + esc(praise) + '</b>' +
      '<span class="on">' + esc(on) + '</span></div>';
    if (!txt) return '<div class="remark none">（没批，右上角签了个名）' +
      '<span class="on">' + esc(on) + '</span></div>';
    return '<div class="remark">' + esc(txt) + '<span class="on">' + esc(on) + '</span></div>';
  },

  renderEnd: function(){
    UI.close();
    Private.init(); npcInit(); Pool.init();
    var e = ENDINGS[G.ending] || { n:'结束', p:[], end:'' };
    var a = G.archive, mo = G.endAt || Math.min(G.month, TERM);
    var h = UI.head();
    h += '<div class="panel" style="margin-top:14px">' +
      artWrap('e_' + G.ending + '.webp', 'art-end') + '<div class="doc">';
    h += '<div class="no">云委办〔' + ymOf(mo).y + '〕结 字</div>';
    h += '<h2 style="font-size:24px">' + esc(e.n) + '</h2>';
    h += '<div class="sub">' + ymText(mo) + ' · 第 ' + mo + ' 个月</div>';
    (e.p || []).forEach(function(s){ h += '<p>' + esc(s) + '</p>'; });
    if (e.end) h += '<div class="result"><div class="r">' + esc(e.end) + '</div></div>';
    h += '</div></div>';

    function block(title, rows, empty){
      var s = '<div class="panel" style="margin-top:12px"><h3>' + title + '</h3>';
      if (!rows.length) return s + '<div class="empty">' + (empty || '—') + '</div></div>';
      s += '<div style="padding:8px 14px">';
      rows.forEach(function(r){
        s += '<div class="kv"><i>' + r[0] + '</i><span style="text-align:right;max-width:74%">' +
          r[1] + '</span></div>';
      });
      return s + '</div></div>';
    }

    h += block('履历 · 功', a.merit.slice(-8).map(function(x){
      return [ymText(x.m), esc(x.t)]; }), '这五年你什么也没留下');
    h += block('履历 · 过', a.fault.map(function(x){
      var r = x.rule && RULES[x.rule];
      return [ymText(x.m), esc(x.t) + (r ? '　<b style="color:' +
        (r.red ? 'var(--red)' : 'var(--ink3)') + '">' + r.n + '</b>' : '')]; }), '干净');
    h += block('手里留下的', a.mats.slice(-12).map(function(x){
      return [ymText(x.m), esc(x.t)]; }), '什么也没剩下');
    h += block('欠过的人情', (G.owe || []).map(function(o){
      return [ymText(o.m) + ' · ' + esc(Pool.side(o.who).n),
        esc(o.what) + '　' + (o.done === 'paid' ? '还了' :
          o.done === 'renege' ? '<b style="color:var(--red)">没还</b>' : '还欠着')]; }), '没欠过谁');

    /* 你自己的账和家里 */
    h += '<div class="panel" style="margin-top:12px"><h3>你自己</h3><div style="padding:10px 14px">' +
      '<div class="kv"><i>走的时候</i><span>' + Rank.cur().n + '</span></div>' +
      '<div class="kv"><i>这五年</i><span>' + CLEAN_WORD(G.stats.clean) + '</span></div>' +
      '<div class="kv"><i>家里</i><span>' + (G.hidden.famBroken ? '她不问你几点回来了' :
        G.hidden.fam >= 8 ? '接送表上你的名字很少出现' : '还过得去') + '</span></div>' +
      '<div class="kv"><i>家底</i><span>' + G.money.toFixed(1) + ' 万</span></div>' +
      '</div></div>';

    /* 这些人后来 */
    var after = [];
    for (var id in AFTER_LINE){
      var s = G.npc[id]; if (!s) continue;
      after.push({ id:id, d: Math.abs(s.fav - 50), up: s.fav >= 55 });
    }
    after.sort(function(x, y){ return y.d - x.d; });
    h += '<div class="panel" style="margin-top:12px"><h3>这些人后来</h3><div class="doc" style="padding:12px 16px">';
    after.slice(0, 5).forEach(function(x){
      var line = AFTER_LINE[x.id][x.up ? 1 : 0];
      if (x.id === 'mayor' && G.fac && G.fac.mayor && FAC_MAYOR_END[G.fac.mayor]) line = FAC_MAYOR_END[G.fac.mayor].n + '。';
      else if (G.fac && G.fac.pulled[x.id]) line = npcName(x.id) + '走了。这件事是你办的。';
      h += '<p style="text-indent:0;margin-bottom:8px;font-size:15px">' + esc(line) + '</p>';
    });
    if (G.fac && (Fac.gone() || G.fac.mayor)){
      h += '<p style="text-indent:0;margin-bottom:8px;font-size:15px">' +
        '那边的人，这五年走了 ' + Fac.pulledN() + ' 个，过来了 ' + Fac.turnedN() + ' 个。' + '</p>';
    }
    h += '</div></div>';

    /* 图鉴 */
    var dex = dexGet();
    h += '<div class="panel" style="margin-top:12px"><h3>图鉴 ' + dex.length + ' / ' +
      ENDING_ORDER.length + '</h3><div class="dex">';
    ENDING_ORDER.forEach(function(k){
      var got = dex.indexOf(k) >= 0;
      h += '<div class="dexi' + (got ? ' on' : '') + '">' +
        (got ? esc(ENDINGS[k].n) : '？　？　？') + '</div>';
    });
    h += '</div></div>';

    h += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn pri" id="again">再来一局</button>' +
      '<button class="btn" id="exp2">导出这局</button></div>';
    UI.root.innerHTML = h;
    UI.artFallback();
    on($('#again'), 'click', function(){ wipe(); UI.start(); });
    on($('#exp2'), 'click', exportSave);
  },

  start: function(){
    var b = artWrap('cover.webp', 'art-cover') +
      '<p style="font-family:var(--song);text-indent:2em">' +
      '周维安是上个月到的云州。到任第三天，他在办公室叫住你，问了你三个问题，' +
      '最后一个是你爱人做什么的。第二天办公室的分工表上，你名字后面添了四个字：书记秘书。</p>' +
      '<p style="font-family:var(--song);text-indent:2em">你二十九，副科，挂的市委办副主任。' +
      '他这一届，五年。</p>' +
      '<div class="lab">你 叫</div><div class="namerow"><span>刘</span>' +
      '<input id="gname" maxlength="2" value="峥" autocomplete="off"></div>' +
      '<div class="lab">在 这 之 前</div><div class="opts">' +
      '<button class="opt" data-o="xds"><span class="t">选调生</span>' +
      '<div class="n">乡镇挂过两年，市委办三年。谁跟谁什么关系，你心里有本账</div></button>' +
      '<button class="opt" data-o="bgg"><span class="t">从市直机关写材料上来的</span>' +
      '<div class="n">一年写三十万字。开会坐最后一排，散场没人跟你打招呼</div></button>' +
      '<button class="opt" data-o="xz"><span class="t">乡镇干上来的</span>' +
      '<div class="n">在青川管过五年信访。机关里的那些讲究，你还没摸透</div></button></div>';
    var d = UI.open('大 秘', b, hasSave() ? '<button class="btn" data-c>接着上一局</button>' : '');
    var c = $('[data-c]', d);
    if (c) on(c, 'click', function(){ UI.close(); if (load()) UI.render(); });
    $$('.opt', d).forEach(function(btn){
      on(btn, 'click', function(){
        var gn = $('#gname', d), nm = gn ? gn.value.replace(/[^\u4e00-\u9fa5]/g, '') : '';
        UI.close();
        newGame({ origin: btn.dataset.o, name: '刘' + (nm || '峥') });
        npcInit();
        var o = btn.dataset.o;
        if (o === 'xds') applyFx({ gx:+10, rep:+3 });
        if (o === 'bgg') applyFx({ trust:+6, gx:-6 });
        if (o === 'xz')  applyFx({ en:+10, rep:+5, gx:-4 });
        save(); UI.render();
      });
    });
  }
};

function BOOT(){
  UI.root = $('#app');
  if (hasSave() && load()) UI.render();
  else { newGame({}); npcInit(); UI.root.innerHTML = UI.head(); UI.start(); }
}
