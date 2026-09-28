/* ── 80-ui：红头、顶栏（势、票面、三样东西）、四页签、弹窗 ── */
var TABS = [ { k:'war', n:'局势' }, { k:'post', n:'位子' }, { k:'ppl', n:'人' }, { k:'file', n:'档案' } ];
var CAMP_CLS = { '1':'c-boss', '0':'c-mid', '-1':'c-mayor' };
var TIER_CLS = { '2':'t2', '1':'t1', '0':'t0', '-1':'tm1', '-2':'tm2' };

function face(id, cls){
  var f = faceOf(id), p = P(id) || { n: ({ wife:'周雪', sister: fill('{SUR}敏'), dev_a:'赵', me: G ? G.name : '刘' })[id] || '?' };
  if (f) return '<span class="face ' + (cls || '') + '"><img src="assets/p_' + f + '.webp" alt="" onerror="this.parentNode.classList.add(\'noimg\');this.remove()"><b>' + esc(p.n.charAt(0)) + '</b></span>';
  return '<span class="face noimg ' + (cls || '') + '"><b>' + esc(p.n.charAt(0)) + '</b></span>';
}
function banner(img){ return img ? '<div class="banner"><img src="assets/' + img + '.webp" alt="" onerror="this.parentNode.remove()"></div>' : ''; }
function paras(t){ return fill(t).split('\n').map(function(s){ return '<p>' + esc(s) + '</p>'; }).join(''); }

var UI = {
  root: null,

  render: function(){
    UI.root = UI.root || $('#app');
    if (!G){ UI.title(); return; }
    if (G.ending){ UI.end(); return; }
    var y = window.scrollY;
    UI.root.innerHTML = UI.head() + '<div id="body">' + UI['tab_' + G.tab]() + '</div>' + UI.tabs();
    UI.bind();
    window.scrollTo(0, y);
  },

  /* ── 开局 ── */
  title: function(){
    var d = dexGet(), n = Object.keys(d).length;
    UI.root.innerHTML = '<div class="titlepage">' +
      '<div class="letterhead"><h1>云州市委办公室</h1><div class="rule"></div><div class="rule2"></div></div>' +
      '<div class="cover"><img src="assets/cover.webp" alt="" onerror="this.parentNode.remove()"></div>' +
      '<h2 class="gname">大　秘</h2>' +
      '<div class="tp-text"><p>书记是外省空降来的，班子里没有一个自己人。</p><p>市长在云州干了十四年。</p><p>你是书记的秘书。书记不能出面的事，你去。</p></div>' +
      '<div class="namerow">你叫 <input id="nm" maxlength="4" value="刘峥" autocomplete="off"></div><div class="namehint" id="nmh"></div>' +
      '<div class="tp-btns">' + (hasSave() ? '<button class="btn red" data-go="cont">接着干</button>' : '') +
      '<button class="btn ' + (hasSave() ? '' : 'red') + '" data-go="new">到任</button>' +
      '<label class="btn ghost">导入存档<input type="file" id="imp" accept=".json" hidden></label></div>' +
      (n ? '<div class="tp-dex">打出过的结局：' + n + ' / ' + Object.keys(ENDINGS).length + '</div>' : '') +
      '</div>';
    on($('[data-go="new"]'), 'click', function(){
      var nm = ($('#nm').value || '').replace(/[^\u4e00-\u9fa5]/g, '').slice(0, 4);
      if (nm.length < 2){ $('#nmh').textContent = '两到四个汉字'; return; }
      newGame({ name: nm }); save(); UI.render();
    });
    on($('[data-go="cont"]'), 'click', function(){ if (load()) UI.render(); });
    on($('#imp'), 'change', function(e){ var f = e.target.files[0]; if (f) importSave(f, function(ok){ if (ok) UI.render(); }); });
  },

  /* ── 顶栏 ── */
  head: function(){
    var s = shi();
    var votes = G.stand.map(function(id){
      var t = tierOf(P(id).side);
      return '<button class="vote ' + TIER_CLS[t] + '" data-who="' + id + '" title="' + esc(pn(id)) + '">' + face(id, 'sm') + '<i>' + esc(pn(id)) + '</i></button>';
    }).join('');
    return '<div class="letterhead"><h1>云州市委办公室</h1><div class="rule"></div><div class="rule2"></div></div>' +
      '<div class="datebar"><b>' + ymText(G.month) + '</b><span>第 ' + G.month + ' 个月</span><span>距换届 ' + (TERM - G.month) + ' 个月</span>' +
      (G.school ? '<span class="red">在党校</span>' : '') + '<span class="me">' + esc(G.name) + '</span></div>' +
      '<div class="tug"><span class="l">书记</span><div class="bar"><i style="width:' + s + '%"></i><em style="left:' + s + '%"></em></div><span class="r">市长</span></div>' +
      '<div class="res"><span>威信 <b>' + Math.round(G.prestige) + '</b></span><span>盘子 <b>' + G.money + '</b></span><span>信任 <b>' + Math.round(G.trust) + '</b></span></div>' +
      '<div class="votes">' + votes + '</div>';
  },
  tabs: function(){
    var canEnd = (G.sceneDone || !G.scene) && (G.scene2Done || !G.scene2);
    return '<div class="tabs"><div class="inner">' + TABS.map(function(t){
      return '<button class="tab' + (G.tab === t.k ? ' on' : '') + '" data-tab="' + t.k + '">' + t.n + '</button>';
    }).join('') + '<button class="endmo" data-end="1"' + (canEnd ? '' : ' disabled') + '>结束本月</button></div></div>';
  },

  /* ── 局势 ── */
  tab_war: function(){
    var h = '';
    h += '<div class="panel"><h3>这个月听到的</h3><div class="report">' +
      (G.report.length ? G.report.map(function(t){ return paras(t); }).join('<div class="sep"></div>') : '<p class="dim">—</p>') + '</div></div>';
    h += UI.sceneBox(1);
    h += UI.sceneBox(2);
    /* 呈书记 */
    h += '<div class="panel boss"><h3><span class="ttl">' + face('boss', 'sm') + '呈书记</span><span class="cnt">本月还能报 ' + Props.left() + ' 件</span></h3>' +
      '<div class="tiles t6">' + PROP_KINDS.map(function(k){
        var ok = Props.left() > 0 && UI.propOk(k.id);
        return '<button class="tile" data-prop="' + k.id + '"' + (ok ? '' : ' disabled') + '><b>' + k.n + '</b><span>' + k.d + '</span></button>';
      }).join('') + '</div>' + UI.propList() + '</div>';
    /* 你的事 */
    h += '<div class="panel mine"><h3><span class="ttl">' + face('me', 'sm') + '你的事</span><span class="cnt">本月还有 ' + G.acts + ' 件</span></h3>' +
      '<div class="tiles t8">' + ACTS.map(function(a){
        var n = Act.targets(a.id).length;
        return '<button class="tile" data-act="' + a.id + '"' + (G.acts <= 0 || !n ? ' disabled' : '') + '><b>' + a.n + '</b><span>' + a.d + '</span></button>';
      }).join('') + '</div>' + UI.doneList() + '</div>';
    /* 能调动的部门 */
    var depts = Ops.depts();
    if (depts.length){
      h += '<div class="panel dept"><h3><span class="ttl">手里的部门</span></h3><div class="deptwrap">';
      depts.forEach(function(post){
        var cool = Ops.cool(post);
        h += '<div class="deptbox"><div class="deptn">' + esc(OP_DEPT_N[post]) + (cool ? '<i>（这两个月动过了）</i>' : '') + '</div><div class="tiles">' +
          OPS[post].map(function(op){
            var ok = !cool && Ops.targets(op).length;
            return '<button class="tile op' + (op.gray ? ' gray' : '') + '" data-op="' + post + ':' + op.id + '"' + (ok ? '' : ' disabled') + '><b>' + op.n + (op.ask ? '<em>呈</em>' : '') + '</b><span>' + op.d + '</span></button>';
          }).join('') + '</div></div>';
      });
      h += '</div></div>';
    }
    var due = [];
    var vb = Month.voteDue(); if (vb) due.push('月底常委会：' + BATTLES[vb].topic);
    var tp = Month.topicDue(); if (tp) due.push('月底常委会：' + TOPIC_BY_ID[tp].topic + '<div class="tintro">' + esc(TOPIC_BY_ID[tp].intro) + '</div>');
    if (Month.hrDue()){ var v = vacancies().length; due.push('月底调整会' + (v ? '，空着 ' + v + ' 个位子' : '')); }
    if (due.length) h += '<div class="due">' + due.join('<br>') + '</div>';
    return h;
  },
  propOk: function(k){
    if (k === 'talk') return Props.talkTargets().length > 0;
    if (k === 'nom') return vacancies().length > 0;
    if (k === 'give') return Props.gives().some(function(w){ return w.kind !== 'money' || G.money >= Props.moneyCost(w); });
    if (k === 'grip') return !Grip.busy() && Grip.list().some(function(id){ return Grip.ways(id).length; });
    if (k === 'hrnow') return Props.canHr();
    if (k === 'prov') return Props.canProv();
  },
  sceneBox: function(slot){
    if (slot === 2){
      var s2 = SCENES[G.scene2]; if (!s2 || G.school) return '';
      return UI.sceneCard(s2, G.scene2Done, G.scene2Res, 2, '另一件事');
    }
    if (G.school) return '<div class="panel doc"><div class="no">省委党校 · 中青班</div><p>这个月你在省城。每天上午上课，下午讨论，晚上在宿舍里看云州的新闻。</p></div>';
    var sc = SCENES[G.scene]; if (!sc) return '';
    return UI.sceneCard(sc, G.sceneDone, G.sceneRes, 1, sc.battle ? BATTLES[sc.battle].n : '这个月');
  },
  sceneCard: function(sc, done, res, slot, label){
    var txt = sc.textFn ? sc.textFn() : sc.text;
    var h = '<div class="panel doc' + (slot === 2 ? ' side' : '') + '">' + banner(slot === 2 ? null : sc.img) + '<div class="docin">' +
      (sc.who ? face(sc.who, 'docface') : '') +
      '<div class="no">' + esc(label) + '</div><h2>' + esc(fill(sc.title)) + '</h2>' +
      '<div class="prose">' + paras(txt) + '</div>';
    var key = slot === 2 ? 'data-opt2' : 'data-opt';
    if (!done){
      h += '<div class="opts">' + sc.opts.map(function(o, i){
        var ok = !o.req || o.req();
        return '<button class="opt' + (o.gray ? ' gray' : '') + '" ' + key + '="' + i + '"' + (ok ? '' : ' disabled') + '><span class="t">' + esc(fill(o.t)) + '</span>' +
          (ok ? '' : '<span class="n">' + esc(o.no || '') + '</span>') + '</button>';
      }).join('') + '</div>';
    } else if (res){
      h += '<div class="result"><div class="stamp">已办</div><div class="chosen">' + esc(fill(sc.opts[res.i].t)) + '</div>' + paras(res.t) +
        (res.got || []).map(function(g){ return '<div class="got">' + esc(g) + '</div>'; }).join('') + '</div>';
    }
    return h + '</div></div>';
  },
  doneList: function(){
    var d = (G.actLog || []).filter(function(x){ return x.m === G.month; });
    if (!d.length) return '';
    return '<div class="dlist">' + d.map(function(x){ return '<div class="ditem"><b>' + esc(x.n) + '</b>' + paras(x.t) + (x.got ? '<div class="got' + (x.bad ? ' bad' : '') + '">' + esc(x.got) + '</div>' : '') + '</div>'; }).join('') + '</div>';
  },
  propList: function(){
    if (!G.props.length) return '';
    return '<div class="cpjs">' + G.props.map(UI.cpj).join('') + '</div>';
  },
  cpj: function(r){
    var st = r.d === 'no' ? 'no' : (r.d === 'alt' ? 'alt' : 'ok');
    var fin = r.fin || r.wait || '';
    return '<div class="cpj ' + st + '"><div class="cpj-no">呈批件 · 云委办呈〔' + (START_Y + Math.floor((r.m - 1) / 12)) + '〕' + r.no + '号</div>' +
      '<div class="cpj-row"><i>事由</i><span>' + esc(UI.propName(r)) + '</span></div>' +
      '<div class="cpj-row"><i>批示</i><span class="remark' + (r.d === 'no' ? ' no' : '') + '">' + esc(r.remark) + '</span></div>' +
      (r.act ? '<div class="cpj-row"><i>办理</i><span class="cpj-act">' + paras(r.act) + '</span></div>' : '') +
      '<div class="cpj-row"><i>结果</i><span class="cpj-fin ' + st + '">' + esc(fin) + '</span></div></div>';
  },
  propName: function(r){
    if (r.kind === 'op'){ var op = OPS[r.post].filter(function(o){ return o.id === r.opId; })[0]; return OP_DEPT_N[r.post] + '·' + op.n + (r.t && r.t !== '_' && r.t.indexOf('area:') < 0 ? '：' + pn(r.t) : (r.t && r.t.indexOf('area:') === 0 ? '：' + AREAS.filter(function(a){ return 'area:' + a.id === r.t; })[0].n : '')); }
    if (r.kind === 'talk') return '请书记找' + pn(r.a) + '谈一次';
    if (r.kind === 'nom') return '提名' + pn(r.a) + '任' + POST_BY_ID[r.b].n;
    if (r.kind === 'give'){ var w = WANT_BY_ID[r.a]; return (w.kind === 'money' ? '给' + pn(w.who) + '批钱：' : '答应' + pn(w.who) + '：') + w.t; }
    if (r.kind === 'grip') return '对' + pn(r.a) + '动手：' + ({ nie:'捏着不用', bi:'摊开，让他换边', jw:'交纪委', diao:'让组织部调走', ji:'寄出去' }[r.b] || '');
    if (r.kind === 'hrnow') return '提请这个月召开干部调整会';
    if (r.kind === 'prov') return '请书记去省委汇报工作';
  },

  /* ── 位子 ── */
  tab_post: function(){
    var grps = ['两办', '政法', '市直', '区县'];
    var mine = seenPostCount(1), his = seenPostCount(-1);
    var h = '<div class="panel"><h3>位子 <span class="cnt">这边 ' + mine + ' · 那边 ' + his + '</span></h3>';
    grps.forEach(function(g){
      h += '<div class="pgrp">' + g + '</div><div class="posts">';
      POSTS.filter(function(p){ return p.grp === g; }).forEach(function(p){
        var hid = holder(p.id);
        var cls = hid ? CAMP_CLS[seenCamp(hid)] : 'c-vac';
        h += '<button class="post ' + cls + '" data-post="' + p.id + '">' +
          (hid ? face(hid, 'sm') : '<span class="face vac"><b>空</b></span>') +
          '<span class="pn">' + esc(p.n) + '<em>' + LVL_TXT[p.lvl] + '</em></span><span class="ph">' + (hid ? esc(pn(hid)) : '空着') + '</span>' +
          (!hid && G.noms[p.id] ? '<span class="pnom">报了 ' + esc(pn(G.noms[p.id])) + '</span>' : '') + '</button>';
      });
      h += '</div>';
    });
    return h + '</div>';
  },

  /* ── 人 ── */
  tab_ppl: function(){
    var h = '<div class="panel"><h3>常委会</h3><div class="cards">';
    G.stand.forEach(function(id){ h += UI.personCard(id, true); });
    h += '</div></div>';
    var met = Object.keys(G.people).filter(function(id){ var p = P(id); return p.met && !isStanding(id) && !p.gone; });
    met.sort(function(a, b){ return (P(b).by === 'boss') - (P(a).by === 'boss') || (!!P(a).post) - (!!P(b).post); });
    h += '<div class="panel"><h3>见过的人 <span class="cnt">' + met.length + '</span></h3><div class="cards">';
    met.forEach(function(id){ h += UI.personCard(id, false); });
    h += '</div></div>';
    var gone = Object.keys(G.people).filter(function(id){ return P(id).gone && P(id).met; });
    if (gone.length){
      h += '<div class="panel"><h3>走了的人</h3><div class="cards">' + gone.map(function(id){ return '<div class="card gone">' + face(id) + '<div class="n">' + esc(pn(id)) + '</div><div class="p">' + esc(P(id).p) + '</div></div>'; }).join('') + '</div></div>';
    }
    return h;
  },
  personCard: function(id, cw){
    var p = P(id), d = PDEF[id] || {};
    var t = tierOf(seenSide(id));
    var h = '<div class="card ' + (cw ? TIER_CLS[t] : CAMP_CLS[seenCamp(id)]) + '" data-who="' + id + '">' + face(id) +
      '<div class="n">' + esc(p.n) + '</div><div class="p">' + esc(p.p) + '</div>';
    var sw = sideWord(id);
    h += '<div class="lv">' + esc(lvlWord(id)) + '</div>';
    if (sw) h += '<div class="tier' + (sw === '底细不清' ? ' dim' : '') + '">' + esc(sw) + '</div>';
    if (d.rel) h += '<div class="rel">' + esc(d.rel) + '</div>';
    if (d.line || p.line) h += '<div class="l">' + esc(d.line || p.line) + '</div>';
    if (cw){
      wantsOf(id).forEach(function(w){ if (G.wk[w.id]) h += '<div class="want' + (G.wd[w.id] ? ' done' : '') + '">' + esc(w.t) + '</div>'; });
      if (d.bottom && G.wk['bot_' + id]) h += '<div class="want bot">' + esc(BOTTOM_TXT[d.bottom]) + '</div>';
    } else {
      var tags = [];
      tags.push(['', '科级', '副处', '正处', '副厅', '正厅'][p.lvl] || '');
      tags.push(['', '平平', '能干', '一把好手'][p.cap]);
      if (p.known.dirt) tags.push(p.dirt ? '身上不干净' : '干净');
      if (p.known.amb) tags.push(AMB_TXT[p.amb]);
      h += '<div class="tags">' + tags.map(function(x){ return '<i>' + esc(x) + '</i>'; }).join('') + '</div>';
      if (p.by === 'boss' && p.post) h += '<div class="loyal"><span style="width:' + p.loyal + '%"></span></div>';
    }
    var gl = Grip.level(id);
    if (gl && id !== 'mayor') h += '<div class="grip">手里：' + GRIP_TXT[gl] + (p.held ? '（捏着）' : '') + (p.turned ? '（换了边）' : '') + '</div>';
    if (id === 'mayor'){ var ml = Grip.mayorLv(); h += '<div class="grip">' + MAYOR_PARTS.map(function(x, i){ return esc(x.t) + '：' + (x.open() ? (GRIP_TXT[ml[i]] || '还没摸到') : '—'); }).join('<br>') + '</div>'; }
    return h + '</div>';
  },

  /* ── 档案 ── */
  tab_file: function(){
    var h = '<div class="panel"><h3>手里的东西</h3><div class="flist">';
    var gl = Grip.list();
    h += gl.length ? gl.map(function(id){ return '<div>' + esc(pn(id)) + '　' + (id === 'mayor' ? Grip.mayorLv().map(function(l){ return GRIP_TXT[l] || '—'; }).join(' / ') : GRIP_TXT[Grip.level(id)]) + '</div>'; }).join('') : '<div class="dim">—</div>';
    h += '</div></div>';
    h += '<div class="panel"><h3>许过的话</h3><div class="flist">' + (G.promises.length ? G.promises.map(function(x){
      return '<div>' + esc(pn(x.who)) + '：' + esc(WANT_BY_ID[x.w].t) + '<span class="st">' + ({ open:'', kept:'　兑现了', broken:'　没兑现', void:'　人不在了' }[x.st]) + (x.self ? '　你替书记许的' : '') + '</span></div>';
    }).join('') : '<div class="dim">—</div>') + '</div></div>';
    var pl = (G.propLog || []).slice(-10).reverse();
    h += '<div class="panel"><h3>呈批件</h3>' + (pl.length ? '<div class="cpjs">' + pl.map(UI.cpj).join('') + '</div>' : '<div class="flist"><div class="dim">—</div></div>') + '</div>';
    h += '<div class="panel"><h3>批示</h3><div class="flist remarks">' + (G.remarks.length ? G.remarks.slice(-12).reverse().map(function(r){ return '<div><i>' + ymText(r.m) + '</i> ' + esc(r.t) + '</div>'; }).join('') : '<div class="dim">—</div>') + '</div></div>';
    h += '<div class="panel"><h3>大事记</h3><div class="flist">' + (G.log.length ? G.log.slice().reverse().map(function(r){ return '<div><i>' + ymText(r.m) + '</i> ' + esc(r.t) + '</div>'; }).join('') : '<div class="dim">—</div>') + '</div></div>';
    var d = dexGet();
    h += '<div class="panel"><h3>结局</h3><div class="dex">' + Object.keys(ENDINGS).map(function(k){ return '<span class="' + (d[k] ? 'on' : '') + '">' + (d[k] ? esc(ENDINGS[k].n) : '？　？') + '</span>'; }).join('') + '</div></div>';
    h += '<div class="panel"><h3>存档</h3><div class="sv"><button class="btn" data-sv="exp">导出</button><button class="btn" data-sv="title">回到封面</button><button class="btn" data-sv="inst">放到桌面</button><button class="btn ghost" data-sv="wipe">重新开局</button></div></div>';
    return h;
  },

  /* ── 弹窗 ── */
  modal: function(html, cls){
    UI.close();
    var d = document.createElement('div');
    d.className = 'mask';
    d.innerHTML = '<div class="modal ' + (cls || '') + '">' + html + '</div>';
    document.body.appendChild(d);
    d.addEventListener('click', function(e){ if (e.target === d && !d.classList.contains('lock')) UI.close(); });
    return d;
  },
  close: function(){ $$('.mask').forEach(function(m){ m.remove(); }); },

  pickList: function(title, items, cb){
    var h = '<h3>' + esc(title) + '</h3><div class="plist">' + (items.length ? items.map(function(it, i){
      return '<button class="pitem' + (it.dis ? ' dis' : '') + (it.hot ? ' hot' : '') + '" data-i="' + i + '"' + (it.dis ? ' disabled' : '') + '>' + (it.face ? face(it.face, 'sm') : '') +
        '<span class="pt"><b>' + esc(it.n) + (it.tag ? '<em class="mk ' + ({ '平调':'m0', '提拔':'m1', '破格提拔':'m2' }[it.tag]) + '">' + it.tag + '</em>' : '') + '</b>' + (it.s ? '<i>' + esc(it.s) + '</i>' : '') + '</span></button>';
    }).join('') : '<div class="dim">—</div>') + '</div><div class="mfoot"><button class="btn ghost" data-x="1">算了</button></div>';
    var m = UI.modal(h);
    $$('.pitem', m).forEach(function(b){ b.onclick = function(){ cb(items[+b.dataset.i]); }; });
    $('[data-x]', m).onclick = UI.close;
  },

  personSub: function(id){
    var p = P(id);
    var s = p.p + ' · ' + LVL_TXT[p.lvl] + (PDEF[id] && PDEF[id].rel ? ' · ' + PDEF[id].rel : '');
    var sw = sideWord(id); if (sw) s += ' · ' + sw;
    var gl = Grip.level(id); if (gl) s += ' · ' + GRIP_TXT[gl];
    return s;
  },

  doAct: function(a){
    var ts = Act.targets(a);
    var items = ts.map(function(t){
      if (t.indexOf('area:') === 0){ var ar = AREAS.filter(function(x){ return 'area:' + x.id === t; })[0];
        var left = Object.keys(G.people).filter(function(id){ return PDEF[id] && PDEF[id].area === ar.id && !P(id).met && !P(id).gone; }).length;
        return { v: t, n: ar.n, s: left ? '' : '都见过了' }; }
      if (t === 'self') return { v: t, n: '把身边的窟窿堵一堵' };
      return { v: t, n: pn(t), s: UI.personSub(t), face: t };
    });
    var name = ACTS.filter(function(x){ return x.id === a; })[0].n;
    if (a === 'hu'){ UI.runAct(a, 'self'); return; }
    UI.pickList(name, items, function(it){
      if (a === 'dihua'){
        UI.pickList('传话：' + pn(it.v), [{ v: 0, n: '原话带到' }, { v: 1, n: '加一句：市长那边在省里提过他，不是好话' }], function(o){ UI.runAct(a, it.v, { hot: o.v }); });
        return;
      }
      UI.runAct(a, it.v);
    });
  },
  runAct: function(a, t, opt){
    var r = Act.run(a, t, opt);
    UI.close();
    if (!r) return;
    G.actLog = (G.actLog || []).filter(function(x){ return G.month - x.m < 2; });
    var an = ACTS.filter(function(x){ return x.id === a; })[0].n;
    var tn = t.indexOf('area:') === 0 ? AREAS.filter(function(x){ return 'area:' + x.id === t; })[0].n : (t === 'self' ? '' : pn(t));
    G.actLog.push({ m: G.month, n: an + (tn ? ' · ' + tn : ''), t: r.t, got: r.got, bad: r.bad });
    save(); UI.render();
  },

  doOp: function(post, opId){
    var op = OPS[post].filter(function(o){ return o.id === opId; })[0];
    var ts = Ops.targets(op);
    if (op.tg === 'none'){ UI.runOp(post, opId, '_', op); return; }
    var items = ts.map(function(t){
      if (t.indexOf('area:') === 0){ var a = AREAS.filter(function(x){ return 'area:' + x.id === t; })[0]; return { v: t, n: a.n }; }
      return { v: t, n: pn(t), s: UI.personSub(t), face: t };
    });
    var title = OP_DEPT_N[post] + '·' + op.n + (op.ask ? '（要书记点头）' : '');
    UI.pickList(title, items, function(it){ UI.runOp(post, opId, it.v, op); });
  },
  runOp: function(post, opId, t, op){
    UI.close();
    if (op.ask){
      /* 走呈批件：书记批不批 */
      var ok = Props.left() > 0 && rnd() < ({ steady:0.55, strong:0.8, shrewd:0.68 }[G.bossType] + (G.trust - 55) / 90 - (op.gray ? 0.2 : 0));
      if (Props.left() <= 0){ UI.toast('这个月的拟办已经用完了'); return; }
      G.props.push({ kind:'op', post: post, opId: opId, t: t, ok: ok, m: G.month, no: (G.propNo = (G.propNo || 0) + 1) });
      var rec = G.props[G.props.length - 1];
      G.propLog = G.propLog || []; G.propLog.push(rec);
      if (!ok){ rec.remark = pick(REJ_OP[G.bossType]); G.remarks.push({ m: G.month, t: rec.remark }); save(); UI.render(); return; }
      rec.remark = pick(OK_OP[G.bossType]);
      G.remarks.push({ m: G.month, t: rec.remark });
      var r = Ops.run(post, opId, t);
      rec.act = r.t; rec.fin = r.got || '办了'; rec.opGot = r.got;
      save(); UI.render(); return;
    }
    var rr = Ops.run(post, opId, t);
    G.actLog = (G.actLog || []).filter(function(x){ return G.month - x.m < 2; });
    G.actLog.push({ m: G.month, n: OP_DEPT_N[post] + '·' + op.n, t: rr.t, got: rr.got, bad: rr.bad });
    save(); UI.render();
  },

  doProp: function(k){
    if (k === 'talk'){
      UI.pickList('请书记找谁谈', Props.talkTargets().map(function(id){ return { v: id, n: pn(id), s: UI.personSub(id), face: id }; }), function(it){ UI.runProp('talk', it.v); });
    } else if (k === 'nom'){
      UI.pickList('哪个位子', vacancies().map(function(pid){ return { v: pid, n: POST_BY_ID[pid].n + '（' + LVL_TXT[POST_BY_ID[pid].lvl] + '）', s: G.noms[pid] ? '已报 ' + pn(G.noms[pid]) : (G.mnoms[pid] && Mayor.sight() >= 0.5 ? '市长那边报了 ' + pn(G.mnoms[pid]) : '') }; }), function(it){
        var ns = Props.nominees(it.v);
        UI.pickList(POST_BY_ID[it.v].n + '：报谁', ns.map(function(id){
          var wb = Props.wantedBy(id, it.v);
          var mk = moveKind(id, it.v);
          return { v: id, n: pn(id), s: UI.personSub(id) + (wb ? ' · ' + pn(wb) + '会记着' : ''), face: id, hot: !!wb, tag: mk };
        }), function(p){ UI.runProp('nom', p.v, it.v); });
      });
    } else if (k === 'give'){
      UI.pickList('许什么', Props.gives().map(function(w){
        var c = w.kind === 'money' ? Props.moneyCost(w) : 0;
        return { v: w.id, n: pn(w.who) + '：' + w.t, s: w.kind === 'money' ? '要 ' + c + ' 份盘子' : (w.kind === 'place' ? '先许下，位子空出来就提' : '许一句话，以后要兑现'), dis: w.kind === 'money' && G.money < c, face: w.who };
      }), function(it){ UI.runProp('give', it.v); });
    } else if (k === 'grip'){
      UI.pickList('动谁', Grip.list().filter(function(id){ return Grip.ways(id).length; }).map(function(id){ return { v: id, n: pn(id), s: UI.personSub(id), face: id }; }), function(it){
        UI.pickList('怎么动：' + pn(it.v), Grip.ways(it.v).map(function(w){ return { v: w.w, n: w.n }; }), function(w){ UI.runProp('grip', it.v, w.v); });
      });
    } else UI.runProp(k);
  },
  runProp: function(k, a, b){
    var r = Props.submit(k, a, b);
    UI.close(); save(); UI.render();
  },

  showPerson: function(id){
    var h = '<div class="pcard">' + UI.personCard(id, isStanding(id)) + '</div><div class="mfoot"><button class="btn ghost" data-x="1">关上</button></div>';
    var m = UI.modal(h); $('[data-x]', m).onclick = UI.close;
  },
  showPost: function(pid){
    var p = POST_BY_ID[pid], hid = holder(pid);
    var h = '<h3>' + esc(p.n) + '<small>' + LVL_TXT[p.lvl] + '级</small></h3><p class="use">' + esc(p.use) + '</p>' + (hid ? '<div class="pcard">' + UI.personCard(hid, false) + '</div>' : '<p>空着。' + (G.noms[pid] ? '书记这边报了' + esc(pn(G.noms[pid])) + '。' : '') + '</p>') +
      '<div class="mfoot"><button class="btn ghost" data-x="1">关上</button></div>';
    var m = UI.modal(h); $('[data-x]', m).onclick = UI.close;
  },

  /* ── 月底：开会 ── */
  endMonth: function(){
    var vb = Month.voteDue();
    if (vb) return UI.meeting(vb);
    var tp = Month.topicDue();
    if (tp) return UI.meeting(tp);
    if (Month.hrDue() && !G.hrRes){ G.hrRes = Meeting.hrRun(); return UI.hrShow(); }
    UI.finishMonth();
  },
  meeting: function(bid){
    var b = BATTLES[bid] || TOPIC_BY_ID[bid];
    var pv = Meeting.preview();
    var h = '<div class="mhead">常委会</div><h3>' + esc(b.topic) + '</h3><div class="mgrid">' + pv.map(function(x){
      return '<div class="mv ' + TIER_CLS[x.tier] + '" data-v="' + x.id + '">' + face(x.id, 'sm') + '<b>' + esc(pn(x.id)) + '</b><i>' + (x.id === 'boss' ? '书记' : (x.id === 'mayor' ? '市长' : TIER_TXT[x.tier])) + '</i></div>';
    }).join('') + '</div><div class="mres"></div><div class="mfoot"><button class="btn red" data-vote="1">表决</button></div>';
    var m = UI.modal(h, 'meet');
    m.classList.add('lock');
    $('[data-vote]', m).onclick = function(){
      var r = Meeting.vote(bid);
      r.rows.forEach(function(row, i){
        setTimeout(function(){ var el = $('[data-v="' + row.id + '"]', m); if (el){ el.classList.add(row.yes ? 'yes' : 'no'); $('i', el).textContent = row.yes ? '同意' : '不同意'; } }, 120 * i);
      });
      setTimeout(function(){
        $('.mres', m).innerHTML = '<div class="vcount">' + r.yes + ' 比 ' + (11 - r.yes) + '，' + (r.pass ? '通过' : '没过') + '</div>';
        var f = $('.mfoot', m);
        f.innerHTML = (!r.pass && G.prestige >= 20 ? '<button class="btn" data-hard="1">书记集中拍板</button>' : '') + '<button class="btn red" data-ok="1">散会</button>';
        var hb = $('[data-hard]', m);
        if (hb) hb.onclick = function(){ Meeting.hard(r); $('.mres', m).innerHTML = '<div class="vcount">书记最后一个表态：「这件事，就这么定了。」</div>'; hb.remove(); };
        $('[data-ok]', m).onclick = function(){ if (BATTLES[bid]) Month.battleResult(bid, r.pass); else Month.topicResult(bid, r.pass); UI.close(); UI.endMonth(); };
      }, 120 * r.rows.length + 300);
    };
  },
  hrShow: function(){
    var rows = G.hrRes || [];
    if (!rows.length) return UI.finishMonth();
    var h = '<div class="mhead">调整会</div><div class="hrrows">' + rows.map(function(r){
      var who = r.s === 'boss' ? '书记这边报的' : (r.s === 'mayor' ? '市长那边报的' : '组织部安排的');
      return '<div class="hr ' + (r.pass ? 'ok' : 'fail') + '"><b>' + esc(POST_BY_ID[r.post].n) + '</b>' + face(r.x, 'sm') + '<span>' + esc(pn(r.x)) + '　<i>' + who + '</i></span><em>' + (r.votes ? r.yes + ':' + (11 - r.yes) + ' ' : '') + (r.pass ? '通过' : '没过') + '</em></div>';
    }).join('') + '</div><div class="mfoot"><button class="btn red" data-ok="1">散会</button></div>';
    var m = UI.modal(h, 'meet'); m.classList.add('lock');
    $('[data-ok]', m).onclick = function(){ UI.close(); UI.finishMonth(); };
  },
  finishMonth: function(){
    Month.end();
    G.tab = 'war';
    window.scrollTo(0, 0);
    UI.render();
  },

  /* ── 结局 ── */
  end: function(){
    var e = ENDINGS[G.ending];
    var coda = e.win ? (G.trust >= 70 ? CODA.hi : (G.trust >= 45 ? CODA.mid : CODA.lo)) : '';
    var removed = G.removed.filter(function(r){ return r.id !== 'mayor'; });
    UI.root.innerHTML = '<div class="endpage"><div class="letterhead"><h1>云州市委办公室</h1><div class="rule"></div><div class="rule2"></div></div>' +
      (e.img ? '<div class="endimg"><img src="assets/' + e.img + '.webp" alt="" onerror="this.parentNode.remove()"></div>' : '') +
      '<div class="docno">云委办〔' + (START_Y + Math.floor((G.month - 1) / 12)) + '〕结字</div><h2>' + esc(e.n) + '</h2>' +
      '<div class="prose">' + paras(e.t) + (coda ? '<p>' + esc(coda) + '</p>' : '') + '<p class="after">' + esc(fill(e.after)) + '</p></div>' +
      '<div class="panel"><h3>这三年</h3><div class="flist">' +
      '<div>第 ' + G.month + ' 个月　赢了 ' + G.won + ' 仗，输了 ' + G.lost + ' 仗</div>' +
      '<div>拿掉的人：' + (removed.length ? removed.map(function(r){ return esc(pn(r.id)); }).join('、') : '—') + '</div>' +
      '<div>你放上去的人：' + (Object.keys(G.people).filter(function(id){ return P(id).by === 'boss' && id !== 'gaoxin' && id !== 'gx_qz'; }).map(function(id){ var p = P(id); return esc(p.n) + (p.gone ? '（出事了）' : (p.side < 20 ? '（后来换了边）' : '')); }).join('、') || '—') + '</div>' +
      '<div>暗桩：' + G.moles.map(function(id){ return esc(pn(id)) + (P(id).known.side ? '（你认出来了）' : '（你没认出来）'); }).join('、') + '</div>' +
      '<div>伸过的手：' + ((G.flags.gray || 0) + (G.flags.took_bag ? 1 : 0)) + ' 次</div>' +
      '</div></div>' +
      '<div class="tp-btns"><button class="btn red" data-go="again">再来一局</button></div></div>';
    on($('[data-go="again"]'), 'click', function(){ wipe(); G = null; UI.render(); });
  },

  /* ── 绑定 ── */
  bind: function(){
    $$('[data-tab]').forEach(function(b){ b.onclick = function(){ G.tab = b.dataset.tab; UI.render(); window.scrollTo(0, 0); }; });
    $$('[data-opt]').forEach(function(b){ b.onclick = function(){ Month.choose(+b.dataset.opt); save(); UI.render(); }; });
    $$('[data-opt2]').forEach(function(b){ b.onclick = function(){ Month.choose(+b.dataset.opt2, 2); save(); UI.render(); }; });
    $$('[data-act]').forEach(function(b){ b.onclick = function(){ UI.doAct(b.dataset.act); }; });
    $$('[data-op]').forEach(function(b){ b.onclick = function(){ var x = b.dataset.op.split(':'); UI.doOp(x[0], x[1]); }; });
    $$('[data-prop]').forEach(function(b){ b.onclick = function(){ UI.doProp(b.dataset.prop); }; });
    $$('[data-who]').forEach(function(b){ b.onclick = function(){ UI.showPerson(b.dataset.who); }; });
    $$('[data-post]').forEach(function(b){ b.onclick = function(){ UI.showPost(b.dataset.post); }; });
    var e = $('[data-end]'); if (e) e.onclick = function(){ UI.endMonth(); };
    $$('[data-sv]').forEach(function(b){ b.onclick = function(){
      var k = b.dataset.sv;
      if (k === 'exp') exportSave();
      if (k === 'inst' && window.installOffer) window.installOffer();
      if (k === 'title'){ save(); G = null; UI.render(); }
      if (k === 'wipe'){ if (b.dataset.sure){ wipe(); G = null; UI.render(); } else { b.dataset.sure = 1; b.textContent = '再点一下，这一局就没了'; } }
    }; });
  }
};

UI.toast = function(t){ var d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2200); };

function on(el, ev, fn){ if (el) el.addEventListener(ev, fn); }

function BOOT(){
  if (load()) UI.render(); else { G = null; UI.render(); }
}
