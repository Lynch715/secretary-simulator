/* ── 20-actions：你的三件事 ── */
var ACTS = [
  { id:'modi', n:'打听', d:'探一个人的口风' },
  { id:'xia',  n:'调研', d:'去区县、部门走一趟' },
  { id:'kao',  n:'考察', d:'查一个人的底' },
  { id:'hui',  n:'回访', d:'看望自己放上去的人' },
  { id:'wa',   n:'搜集', d:'收集对方的材料' },
  { id:'hu',   n:'自查', d:'清理身边的隐患' },
  { id:'dihua', n:'传话', d:'给对方的人带句话' },
  { id:'pei',  n:'陪同', d:'跟书记下去跑一趟' }
];

var Act = {
  targets: function(a){
    var all = Object.keys(G.people).filter(function(id){ return !P(id).gone && id !== 'boss'; });
    switch (a){
      case 'modi': return all.filter(function(id){ return P(id).met && id !== 'mayor'; });
      case 'dihua': return all.filter(function(id){ return P(id).met && seenCamp(id) <= 0 && id !== 'mayor'; });
      case 'xia': return AREAS.map(function(a){ return 'area:' + a.id; });
      case 'kao': return all.filter(function(id){ var p = P(id); return p.met && !isStanding(id) && (!p.known.side || !p.known.dirt || !p.known.amb); });
      case 'hui': return all.filter(function(id){ return P(id).by === 'boss' && P(id).post; });
      case 'wa': return all.filter(function(id){ var p = P(id); return p.met && seenCamp(id) <= 0 && !p.clean && Grip.level(id) < Grip.cap(id); });
      case 'hu': return ['self'];
      case 'pei': return G.month - (G.flags.peiAt || -9) < 2 ? [] : AREAS.filter(function(a){ return ['shizhi','zhengfa','shifu','shiwei'].indexOf(a.id) < 0; }).map(function(a){ return 'area:' + a.id; });
    }
    return [];
  },

  run: function(a, t, opt){
    if (G.acts <= 0) return null;
    G.acts--;
    var r = Act['_' + a](t, opt || {});
    G.done = G.done || [];
    return r;
  },

  _modi: function(id){
    var p = P(id); p.met = true;
    if (isStanding(id)){
      var ws = wantsOf(id).filter(function(w){ return !G.wk[w.id]; });
      addSide(id, 2);
      if (ws.length){
        var w = ws[0];
        G.wk[w.id] = 1;
        var got = '知道了：' + w.t;
        if (w.kind === 'place') w.ids.forEach(function(x){ P(x).met = true; got += '。' + pn(x) + '现任' + P(x).p; });
        return { t: fill(pick(MODI_TXT[id] || MODI_TXT._)).replace('{N}', p.n), got: got };
      }
      if (PDEF[id] && PDEF[id].bottom && !G.wk['bot_' + id]){
        G.wk['bot_' + id] = 1;
        return { t: p.n + '留你吃了顿便饭。吃到最后，他自己把话题引到了一件事上，又自己把话题引开了。', got: '知道了他的底线：' + BOTTOM_TXT[PDEF[id].bottom] };
      }
      return { t: p.n + '跟你聊了半个钟头天气。该说的，上回他都说过了。' };
    }
    p.known.amb = 1;
    return { t: p.n + '请你在单位食堂吃了个便饭。他说得不多，筷子一直没怎么动。', got: '他想要的：' + AMB_TXT[p.amb] };
  },

  _dihua: function(id, opt){
    var p = P(id);
    if (opt.hot){
      addSide(id, 12); applyFx({ heat: 7, feud: 3 });
      return { t: '你把书记的意思带到了，又多加了一句：市长那边已经在省里提过他的名字，不是什么好话。' + p.n + '没接茬，送你到门口的时候，手在你肩上多停了一下。' };
    }
    if (p.side <= -45){ return { t: p.n + '听你说完，笑了一下：「小{SUR}，这话你带回去，就说我听到了。」' }; }
    addSide(id, 5);
    return { t: '话带到了。' + p.n + '说：「替我谢谢周书记。」谢什么，他没说。' };
  },

  _xia: function(t){
    var area = t.replace('area:', '');
    var an = (AREAS.filter(function(a){ return a.id === area; })[0] || {}).n;
    var pool = Object.keys(G.people).filter(function(id){ var p = P(id); var d = PDEF[id]; return d && d.area === area && !p.met && !p.gone; });
    pool = shuffle(pool).slice(0, 2);
    pool.forEach(function(id){ P(id).met = true; });
    var extra = '';
    var ms = Object.keys(G.people).filter(function(id){ var d = PDEF[id]; return d && d.area === area && camp(id) === -1 && P(id).dirt && !P(id).gone; });
    if (ms.length && rnd() < 0.35){ var v = pick(ms); Grip.add(v, 1); extra = '回来的路上，司机说了一句关于' + pn(v) + '的闲话。你记下了。'; }
    if (!pool.length) return { t: '你在' + an + '跑了一天，见的都是见过的人。' + extra };
    return { t: pick(XIA_TXT).replace('{A}', an).replace('{N}', pool.map(pn).join('、')) + extra, got: '认识了：' + pool.map(function(id){ return pn(id) + '（' + P(id).p + '）'; }).join('、') };
  },

  _kao: function(id){
    var p = P(id);
    if (!p.known.side){
      p.known.side = 1; p.show = p.side;
      if (G.moles.indexOf(id) >= 0){
        logIt(p.n + '是市长的人。');
        return { t: KAO_MOLE.replace(/\{N\}/g, p.n), got: p.n + '：市长那边的人', bad: 1 };
      }
      return { t: p.n + '的履历翻了两遍，又找他原单位两个人问了问。', got: p.n + '：' + CAMP_TXT[camp(id)] };
    }
    if (!p.known.dirt){
      p.known.dirt = 1;
      return { t: p.dirt ? '有人跟你提了一句' + p.n + '前两年的一件事，提完又说，都过去了。' : p.n + '那边查不出什么。他连单位的车都很少用。', got: p.n + '：' + (p.dirt ? '身上不干净' : '干净') };
    }
    p.known.amb = 1;
    return { t: p.n + '的老领导说：这个人啊，你给他什么，他就是什么。', got: p.n + '想要的：' + AMB_TXT[p.amb] };
  },

  _hui: function(id){
    var p = P(id);
    var wasTurned = p.side < 20;
    p.loyal = 100;
    if (wasTurned){
      p.known.side = 1; p.show = p.side;
      logIt(p.n + '已经不是这边的人了。');
      return { t: '你去' + p.n + '那儿坐了坐。他倒茶，说天气，问书记身体好不好。上回你来，他跟你讲了一个钟头他那摊子的难处。这回一句也没提。', got: p.n + '已经换了边', bad: 1 };
    }
    addSide(id, 5);
    var tg = Grip.channelTarget(p.post);
    var extra = '';
    if (tg){ Grip.add(tg, 1); extra = '临走的时候他送你到楼梯口，说了一句' + pn(tg) + '那边的事。'; }
    return { t: p.n + '留你吃了顿饭。他说这个位子坐得不容易，每一句都是冲着书记说的。' + extra };
  },

  _wa: function(id){
    var p = P(id);
    var bonus = Grip.channel(id);
    var pts = 1 + bonus;
    applyFx({ heat: bonus ? 3 : 6 });
    if (!p.dirt && id !== 'mayor'){
      p.wa = (p.wa || 0) + 1;
      if (p.wa >= 2){ p.clean = 1; p.known.dirt = 1; return { t: '查到底了。' + p.n + '的事是别人传的，他自己一分钱没沾。你白跑了两趟，他那边大概也听说有人在查他。' }; }
      return { t: '你找了两个人打听' + p.n + '的事，说法对不上。' };
    }
    var before = Grip.level(id);
    var ok = Grip.add(id, pts);
    var after = Grip.level(id);
    if (!ok) return { t: '市长那头的东西，眼下还摸不到边。' };
    var t = pick(WA_TXT[after] || WA_TXT[1]).replace(/\{N\}/g, p.n);
    if (!bonus) t += '这事你是自己去打听的，打听的人不少。';
    return { t: t, got: after > before ? pn(id) + '：' + GRIP_TXT[after] : '' };
  },

  _pei: function(t){
    var area = t.replace('area:', '');
    var an = AREAS.filter(function(a){ return a.id === area; })[0].n;
    G.flags.peiAt = G.month;
    applyFx({ trust: 2 });
    var got = '';
    var pool = Object.keys(G.people).filter(function(id){ var d = PDEF[id]; return d && d.area === area && !P(id).met && !P(id).gone; });
    if (pool.length){ var x = pick(pool); P(x).met = true; got = '认识了：' + pn(x) + '（' + P(x).p + '）'; }
    return { t: pick(PEI_TXT).replace('{A}', an), got: got };
  },

  _hu: function(){
    applyFx({ heat: -9 });
    G.flags.hu = G.month;
    return { t: pick(HU_TXT) };
  }
};

var AMB_TXT = { 1:'给个位子就满足', 2:'还想往上走', 3:'胃口大' };
var BOTTOM_TXT = { hr:'人事上他不认人情', qc:'青川那件事谁也别翻', cui:'谁动崔延平他跟谁拼' };
var GRIP_TXT = { 1:'有传言', 2:'手里有东西', 3:'坐实了' };
