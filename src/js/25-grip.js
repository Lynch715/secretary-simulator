/* ── 25-grip：把柄、动手、拔掉一个人 ── */
var GOV = ['mayor', 'vice1', 'caizheng', 'zhujian', 'weijian', 'fb_zr', 'ziran', 'sz_ms', 'xinfang'];
var LOCAL = ['chengguan', 'cg_quzhang', 'qingchuan', 'bs_fuxian', 'gangkou', 'gk_fuquzhang', 'lvhq', 'panlei', 'heqs'];
/* 市长的三块：拼齐了才动得了他 */
var MAYOR_PARTS = [
  { k:'a', t:'旧改那块地的评估', open:function(){ return G.battles.b3 === 'win' || own('zhujian'); } },
  { k:'b', t:'青川那年是谁让压下去的', open:function(){ return G.battles.b4 === 'win' || P('zhengfa').gone; } },
  { k:'c', t:'他弟弟那家公司', open:function(){ return !!G.flags.d2_seen || P('vice1').gone || P('vice1').turned || Grip.level('vice1') >= 2 || own('sz_ms') || own('fb_zr') || own('shenji'); } }
];

var Grip = {
  pts: function(id){ return id === 'mayor' ? 0 : (P(id).grip || 0); },
  cap: function(id){ return (own('jcz') || own('jw_fu')) ? 3 : 2; },
  level: function(id){
    if (id === 'mayor'){ var m = Grip.mayorLv(); return Math.min.apply(null, m); }
    var g = P(id).grip || 0;
    var lv = g >= 6 ? 3 : (g >= 3 ? 2 : (g >= 1 ? 1 : 0));
    return Math.min(lv, Grip.cap(id));
  },
  mayorLv: function(){
    G.mg = G.mg || { a:0, b:0, c:0 };
    return MAYOR_PARTS.map(function(x){ var g = G.mg[x.k]; var lv = g >= 12 ? 3 : (g >= 5 ? 2 : (g >= 1 ? 1 : 0)); return Math.min(lv, Grip.cap('mayor')); });
  },
  add: function(id, n){
    if (id === 'mayor'){
      G.mg = G.mg || { a:0, b:0, c:0 };
      var part = MAYOR_PARTS.filter(function(x){ return x.open() && G.mg[x.k] < 12; })[0];
      if (!part) return false;
      G.mg[part.k] += n; return true;
    }
    var p = P(id); if (!p || !p.dirt) return false;
    p.grip = Math.min((p.grip || 0) + n, 8);
    return true;
  },
  channel: function(id){
    var b = 0;
    if (own('shenji') && GOV.indexOf(id) >= 0) b++;
    if (own('gongan')) b++;
    if (own('jcz') || own('jw_fu')) b++;
    if (own('xinfang') && LOCAL.indexOf(id) >= 0) b++;
    if ((own('fb_zr') || own('sz_ms')) && (id === 'mayor' || id === 'vice1')) b++;
    if (own('zhujian') && (id === 'zhujian' || id === 'chengguan' || id === 'mayor')) b++;
    if (own('weijian') && id === 'vice1') b++;
    return Math.min(b, 2);
  },
  /* 自己人坐在某个位子上，回访时能顺出一条消息 */
  channelTarget: function(post){
    var map = { shenji: GOV, gongan: LOCAL.concat(['zhengfa', 'guozc']), xinfang: LOCAL, zhujian: ['zhujian', 'chengguan'],
      caizheng: ['vice1', 'caizheng'], weijian: ['vice1', 'weijian'], fb_zr: ['vice1', 'fb_zr'], sz_ms: ['vice1'], guozi: ['gangkou', 'gk_fuquzhang'] };
    var c = (map[post] || []).filter(function(id){ return P(id) && !P(id).gone && P(id).dirt && camp(id) <= 0; });
    return c.length ? pick(c) : null;
  },
  /* 手里有东西的人 */
  list: function(){
    var r = Object.keys(G.people).filter(function(id){ return id !== 'mayor' && !P(id).gone && Grip.level(id) > 0; });
    if (Grip.mayorLv().some(function(x){ return x > 0; })) r.unshift('mayor');
    return r;
  },
  busy: function(){
    return G.pending.some(function(x){ return x.k === 'pull'; }) || G.month - G.lastPull < 2;
  },
  ways: function(id){
    var lv = Grip.level(id), p = P(id), r = [];
    if (id === 'mayor'){
      if (lv >= 3 && G.battles.b9) r.push({ w:'jw', n:'把三样东西一起交省纪委' });
      return r;
    }
    if (lv >= 2 && !p.held && !p.turned && camp(id) <= 0) r.push({ w:'nie', n:'捏着，不用' });
    if (lv >= 2 && !p.turned && camp(id) <= 0) r.push({ w:'bi', n:'私下摊开，让他换边' });
    if (lv >= 3) r.push({ w:'jw', n:'交宋自强' });
    if (lv >= 2) r.push({ w:'diao', n:'让组织部把他调走' });
    if (lv >= 1) r.push({ w:'ji', n:'寄出去' });
    return r;
  },

  use: function(id, w){
    var p = P(id);
    G.lastPull = G.month;
    switch (w){
      case 'nie':
        p.held = 1; if (p.side < -10) p.side = -10;
        applyFx({ heat: 4 });
        logIt('捏住了' + p.n + '。');
        return p.n + '那份东西你没交出去。书记找他谈了二十分钟，出来的时候他脸色没变，只是那天下午的会他没来。';
      case 'bi':
        p.turned = 1; p.side = 30; p.grudge = 1;
        applyFx({ heat: 10, feud: 4 });
        logIt(p.n + '换到了这边。');
        return '书记把东西摊在桌上，一页没念。' + p.n + '看了很久，抬头说：「周书记，我明白了。」出门的时候他看了你一眼。那一眼你记得很清楚。';
      case 'jw':
        if (id === 'mayor'){
          G.pending.push({ k:'mayor', mo: G.month + (own('jw_fu') ? 2 : 3) });
          applyFx({ heat: 15, feud: 10 });
          logIt('市长的材料交到了省纪委。');
          return '三样东西装进了一个档案盒。书记看了你一眼，说：「你送。」你开车去的省城，来回六个钟头，一路没开收音机。';
        }
        G.pending.push({ k:'pull', id: id, w:'jw', mo: G.month + (own('jw_fu') ? 2 : 4) });
        applyFx({ heat: 10, feud: 5, side: { jiwei: 12 } });
        return '东西装进一个牛皮纸袋。宋自强没拆，说：「放这儿吧。」你出门的时候，他还没拆。';
      case 'diao':
        G.pending.push({ k:'pull', id: id, w:'diao', mo: G.month + 1 });
        applyFx({ heat: 5, feud: 3, prestige: -6 });
        return '佟建民把' + p.n + '的名字写在本子上，问了一句：「书记的意思？」你说是。他把本子合上了。';
      case 'ji':
        G.pending.push({ k:'pull', id: id, w:'ji', mo: G.month + 1, lv: Grip.level(id) });
        G.flags.gray = (G.flags.gray || 0) + 1;
        applyFx({ heat: 18, feud: 8, bossRisk: 5 });
        return '信是在外市寄的。回来的路上，你把打印店的小票撕了。';
    }
  },

  resolve: function(x){
    var p = P(x.id);
    if (p.gone) return;
    if (x.w === 'ji' && rnd() > (x.lv >= 2 ? 0.9 : 0.55)){
      report('寄出去的那封信没有下文。' + p.n + '照常上班，只是见了你，比以前客气。');
      applyFx({ heat: 6 });
      propFin(function(r){ return r.kind === 'grip' && r.a === x.id && r.pull; }, '信寄出去了，没有下文');
      return;
    }
    Grip.remove(x.id, x.w);
  },

  remove: function(id, w){
    var p = P(id);
    var post = p.post;
    p.gone = w;
    if (post) vacate(post);
    G.removed.push({ id: id, w: w, m: G.month });
    propFin(function(r){ return r.kind === 'grip' && r.a === id && r.pull; }, { jw:'人拿下了', diao:'调走了', ji:'人出事了', prov:'调走了' }[w] || '走了');
    var t = FALL_TXT[w].replace(/\{N\}/g, p.n);
    report(t);
    logIt(p.n + '，' + { jw:'被带走', diao:'调走', ji:'出事', prov:'调走' }[w] + '。');
    applyFx({ prestige: 3, trust: 3 });
    if (w === 'jw' && id !== 'mayor') addSide('jiwei', 4);
    G.fallN = (G.fallN || 0) + 1;
    /* 常委出缺，省里派人 */
    var si = G.stand.indexOf(id);
    if (si >= 0){
      var k = G.nsN = (G.nsN || 0);
      var d = NEW_STANDING[k % NEW_STANDING.length];
      G.nsN++;
      var nid = 'ns' + k;
      G.people[nid] = { id: nid, n: d.n, p: p.p, lvl: 4, side: -5 + ri(25), show: 0, cap: 2, age: 50, dirt: 0, amb: 1,
        known: { side: 1, dirt: 0, amb: 0 }, met: true, loyal: 0, by: null, grip: 0, ns: 1, line: d.line };
      G.stand[si] = nid;
      report('省里派来了' + d.n + '，接' + p.p + '。' + d.line + '。');
    }
    /* 反扑：动得越快越狠 */
    var recent = G.removed.filter(function(r){ return G.month - r.m <= 4; }).length;
    if (recent >= 2) applyFx({ heat: 6 });
  }
};

var FALL_TXT = {
  jw: '省纪委的通报只有两行。{N}的名字后面跟着「接受审查调查」。他办公室的门开着，里面有人在装箱。',
  diao: '调令下来了，平调，去省里一个没人记得名字的单位。{N}去交钥匙那天在走廊上碰见你，点了点头，什么也没说。',
  ji: '{N}的事是先在网上出来的，比省里的人早了一天。第五天他被带走，走的时候手里拿着自己的保温杯。',
  prov: '{N}调走了。欢送会开了二十分钟，他讲了十五分钟。'
};
