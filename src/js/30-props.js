/* ── 30-props：呈书记（每月两件）。都是书记出面的事 ── */
var PROP_KINDS = [
  { id:'talk',  n:'谈话', d:'请书记找常委谈' },
  { id:'nom',   n:'提名', d:'为空缺报人选' },
  { id:'give',  n:'许诺', d:'答应常委的诉求' },
  { id:'grip',  n:'动手', d:'用手里的材料' },
  { id:'hrnow', n:'急会', d:'提前开调整会' },
  { id:'prov',  n:'汇报', d:'书记去省里汇报' }
];

var Props = {
  left: function(){ return G.school ? 0 : G.propN - G.props.length; },

  talkTargets: function(){ return G.stand.filter(function(id){ return id !== 'boss' && id !== 'mayor' && !P(id).gone; }); },

  /* 能提的人：见过的、不是常委、没走、级别够（低两级是破格） */
  nominees: function(post){
    var pl = POST_BY_ID[post].lvl;
    var r = Object.keys(G.people).filter(function(id){
      var p = P(id);
      if (!p.met || p.gone || isStanding(id) || p.post === post) return false;
      if (p.post && POST_BY_ID[p.post].locked) return false;
      return p.lvl >= pl - 2 && p.lvl <= pl;
    });
    r.sort(function(a, b){ return (Props.wantedBy(b, post) ? 1 : 0) - (Props.wantedBy(a, post) ? 1 : 0) || seenSide(b) - seenSide(a) || P(b).cap - P(a).cap; });
    return r;
  },
  /* 这个人是不是哪个常委想放的人 */
  wantedBy: function(id, post){
    var hit = null;
    G.stand.forEach(function(sid){
      wantsOf(sid).forEach(function(w){
        if (w.kind === 'place' && G.wk[w.id] && w.ids.indexOf(id) >= 0 && (!post || !w.post || w.post === post) && !G.wd[w.id + '_full']) hit = sid;
      });
    });
    return hit;
  },
  poGe: function(id, post){ return P(id).lvl < POST_BY_ID[post].lvl - 1; },

  gives: function(){
    var r = [];
    G.stand.forEach(function(sid){
      if (P(sid).gone) return;
      wantsOf(sid).forEach(function(w){
        if (!G.wk[w.id] || G.wd[w.id]) return;
        if (w.kind === 'money' || w.kind === 'promise' || w.kind === 'place') r.push(w);
      });
    });
    return r;
  },
  moneyCost: function(w){ return (w.cost || 1) + (mayors('fagai') ? 1 : 0); },
  canHr: function(){ return HR_MONTHS.indexOf(G.month) < 0 && G.prestige >= 10 && Object.keys(G.noms).length > 0; },
  canProv: function(){ return G.month - G.provAt >= 6; },

  /* 书记批不批：ok / alt / no */
  decide: function(kind, extra){
    var t = G.bossType;
    var base = { steady:0.62, strong:0.82, shrewd:0.7 }[t] + (G.trust - 55) / 90;
    if (kind === 'talk') base += 0.18;
    if (kind === 'give') base += 0.1;
    if (kind === 'prov') base += 0.2;
    if (kind === 'grip' && extra === 'ji') base -= { steady:0.4, strong:0.2, shrewd:0.25 }[t];
    if (kind === 'grip' && extra === 'bi' && t === 'steady') base -= 0.15;
    if (kind === 'nom' && extra === 'poge') base -= t === 'steady' ? 0.25 : 0.1;
    if (kind === 'nom' && extra === 'unknown' && t === 'shrewd') base -= 0.25;
    if (rnd() < clamp(base, 0.12, 0.96)) return 'ok';
    var altable = kind === 'talk' || (kind === 'give' && extra === 'promise') || (kind === 'grip' && (extra === 'ji' || extra === 'bi'));
    return altable && rnd() < 0.5 ? 'alt' : 'no';
  },

  line: function(kind, key, n){
    var tb = PR[kind][key];
    var arr = tb[G.bossType] || tb.steady || tb;
    return fill(pick(arr)).replace(/\{N\}/g, n || '');
  },

  submit: function(kind, a, b){
    if (Props.left() <= 0) return null;
    var extra = null;
    if (kind === 'nom') extra = Props.poGe(a, b) ? 'poge' : (!P(a).known.side ? 'unknown' : null);
    if (kind === 'grip') extra = b;
    if (kind === 'give'){ var w0 = WANT_BY_ID[a]; extra = w0.kind === 'money' ? 'money' : 'promise'; }
    var d = Props.decide(kind, extra);
    /* 寄信改办法：够两档就改成调走，够不上就只能不批 */
    if (d === 'alt' && kind === 'grip' && extra === 'ji' && Grip.level(a) < 2) d = 'no';
    var rec = { kind: kind, a: a, b: b, d: d, m: G.month, no: (G.propNo = (G.propNo || 0) + 1) };
    var who = kind === 'give' ? pn(WANT_BY_ID[a].who) : (a && P(a) ? pn(a) : '');
    if (d === 'no' && kind === 'grip' && b === 'ji') rec.remark = Props.line('grip', 'ji_no');
    else rec.remark = Props.line(kind, (kind === 'give' && extra === 'promise' && d === 'ok') ? 'okp' : d, who);
    G.remarks.push({ m: G.month, t: rec.remark });

    if (d === 'no'){
      rec.act = fill(pick((PR[kind].act || {}).no || ['呈批件退了回来。'])).replace(/\{N\}/g, who);
      rec.fin = { talk:'没谈', nom:'没报', give:'没许', grip:'没动手', hrnow:'按时开', prov:'没去' }[kind];
    } else {
      Props['_' + kind](rec, who);
      applyFx({ trust: 1 });
    }
    G.props.push(rec);
    G.propLog = G.propLog || [];
    G.propLog.push(rec);
    return rec;
  },

  _talk: function(rec, who){
    var id = rec.a, p = P(id), d = PDEF[id] || {};
    var n = (G.talkN = G.talkN || {})[id] = ((G.talkN[id] || 0) + 1);
    var gain = n <= 1 ? 8 : (n <= 3 ? 5 : 3);
    if (rec.d === 'alt') gain = Math.ceil(gain / 2);
    G.lobby[id] = (G.lobby[id] || 0) + (rec.d === 'alt' ? 0.5 : 1);
    if (d.nodeal){
      addSide(id, 2);
      rec.act = '宋自强来了，坐了十五分钟。书记说的他都听着，最后只问了一句：「周书记，还有别的事吗？」';
      rec.fin = '谈了。他只听，不表态';
      return;
    }
    if (d.gripOnly && !p.held && !p.turned){
      addSide(id, 1);
      rec.act = '高振邦来得很准时，跟书记汇报了四十分钟财政收支，一个数没错。书记要谈的那件事，他一句也没接。';
      rec.fin = '谈了。没松口';
      return;
    }
    addSide(id, gain);
    rec.act = fill(pick(PR.talk.act[rec.d === 'alt' ? 'alt' : 'ok'])).replace(/\{N\}/g, who);
    rec.fin = rec.d === 'alt' ? '别人去谈的，效果打了折扣' : '谈了。' + who + '那一票往这边挪了';
  },

  _nom: function(rec, who){
    var id = rec.a, post = rec.b;
    G.noms[post] = id;
    if (moveKind(id, post) === '提拔' && P(id).yrs < 2){ applyFx({ prestige: -2 }); rec.note = '任现级不满两年'; }
    if (Props.poGe(id, post)) G.flags['poge_' + post] = 1;
    var when = HR_MONTHS.filter(function(m){ return m >= G.month; })[0];
    rec.act = fill(pick(PR.nom.act.ok)).replace(/\{N\}/g, who);
    rec.fin = null;
    rec.wait = (when === G.month || G.flags.hrnow === G.month) ? '这个月底上调整会' : '等第 ' + when + ' 个月的调整会';
  },

  _give: function(rec, who){
    var w = WANT_BY_ID[rec.a];
    if (w.kind === 'money'){
      G.money -= Props.moneyCost(w);
      G.wd[w.id] = 1; addSide(w.who, w.gain);
      logIt('给' + who + '批了一笔钱。');
      rec.act = fill(pick(PR.give.act.money)).replace(/\{N\}/g, who);
      rec.fin = '钱批了';
      return;
    }
    if (rec.d === 'alt'){
      G.wk[w.id] = 1; addSide(w.who, Math.ceil(w.gain / 3));
      rec.act = fill(pick(PR.give.act.alt)).replace(/\{N\}/g, who);
      rec.fin = '话说了一半，没说死';
      return;
    }
    Props.promise(rec.a, false);
    rec.act = fill(pick(PR.give.act.ok)).replace(/\{N\}/g, who);
    rec.fin = w.kind === 'place' ? '许了。位子空出来就提' + w.ids.map(pn).join('、') : '话许出去了，以后要兑现';
  },

  /* 许诺进账本。self：是你替书记许的 */
  promise: function(wid, self){
    var w = WANT_BY_ID[wid];
    if (!w || G.wd[wid]) return;
    G.wk[wid] = 1; G.wd[wid] = 1;
    var g = w.kind === 'place' ? Math.ceil(w.gain / 2) : w.gain;
    addSide(w.who, g);
    G.promises.push({ w: wid, who: w.who, key: w.kind === 'place' ? 'place' : w.pkey, m: G.month, self: !!self, st: 'open' });
    logIt((self ? '你替书记' : '书记') + '许了' + pn(w.who) + '一句话。');
  },

  _grip: function(rec, who){
    var way = rec.b;
    if (rec.d === 'alt'){
      way = way === 'ji' ? (G.prestige >= 20 ? 'diao' : 'nie') : 'nie';
      rec.b2 = way;
    }
    rec.act = (rec.d === 'alt' ? fill(pick(PR.grip.act.alt)) + '\n' : '') + Grip.use(rec.a, way);
    rec.fin = PR.grip.fin[way];
    rec.way = way;
    if (way === 'jw' || way === 'diao' || way === 'ji') rec.pull = 1;
  },

  _hrnow: function(rec){
    applyFx({ prestige: -4 });
    G.flags.hrnow = G.month;
    rec.act = pick(PR.hrnow.act.ok);
    rec.fin = '这个月底开';
  },

  _prov: function(rec){
    G.provAt = G.month;
    applyFx({ prestige: 3, feud: -12, bossRisk: -5 });
    var r = '书记去了一趟省城，当天来回。';
    if (shi() >= 76 && G.streak >= 3 && G.month >= 38 && !P('mayor').gone && !G.pending.some(function(x){ return x.k === 'mayor' || x.k === 'move'; })){
      G.pending.push({ k:'move', mo: G.month + 2 });
      r += '回来的路上他说：「省里知道了。」知道什么，他没往下说。';
      rec.fin = '省里有了态度';
    } else {
      r += '回来的路上他一直在打盹，快到云州的时候醒了，问你几点了。';
      rec.fin = '去了。班子里消停了一些';
    }
    rec.act = r;
  }
};

/* 挂着的呈批件落地了：补结果 */
function propFin(match, text){
  (G.propLog || []).forEach(function(r){ if (!r.done2 && match(r)){ r.fin = text; r.done2 = 1; } });
}

/* 许诺到期怎么算：在月末检查 */
function checkPromises(){
  G.stand.forEach(function(sid){
    wantsOf(sid).forEach(function(w){
      if (w.kind !== 'post' || G.wd[w.id]) return;
      var hit = w.id === 'han_ga' ? holder('gongan') === 'guozc' : own(w.post);
      if (hit){ G.wd[w.id] = 1; G.wk[w.id] = 1; addSide(sid, w.gain); }
    });
  });
  G.promises.forEach(function(pr){
    if (pr.st !== 'open') return;
    var who = P(pr.who);
    if (!who || who.gone){ pr.st = 'void'; return; }
    if (pr.key === 'keep_cui' && P('gangkou').gone){ pr.st = 'broken'; addSide(pr.who, -40); applyFx({ prestige: -5 }); report(pn(pr.who) + '知道崔延平的事了。他在常委会上一句话没说，散会的时候，从你身边走过去，没看你。'); }
    if (pr.key === 'no_qc' && G.battles.b4 === 'win'){ pr.st = 'broken'; addSide(pr.who, -40); applyFx({ prestige: -5 }); report('韩树声在走廊里叫住你：「小{SUR}，青川的事，周书记那边是怎么考虑的？我前面听到的，好像不是这个意思。」他没等你回答，笑了笑，走了。'); }
    if (pr.key === 'place' && G.month - pr.m > 15){ pr.st = 'broken'; addSide(pr.who, -Math.ceil(WANT_BY_ID[pr.w].gain * 1.5)); applyFx({ prestige: -3 }); report(pn(pr.who) + '在走廊上碰见你，笑着问了一句：「小{SUR}，最近忙吧？」别的什么也没问。'); }
    if (pr.key === 'tong_rd' && G.month >= 30){ pr.st = shi() >= 45 ? 'kept' : 'broken'; if (pr.st === 'broken'){ addSide(pr.who, -30); } else report('佟建民去人大的事定了。他来办公室跟书记道别，带了一包他老家的茶。'); }
  });
  /* 两个人都许了市长的位子 */
  var ms = G.promises.filter(function(x){ return x.key === 'mayor_seat' && x.st === 'open'; });
  if (ms.length >= 2 && !G.flags.double_seat){
    G.flags.double_seat = G.month;
    ms.forEach(function(x){ addSide(x.who, -25); });
    applyFx({ prestige: -6, trust: -5 });
    report('罗明川和高振邦在省委党校的一个会上坐了同一桌。散会的时候，两个人一起走出来，谁也没说话。第二天，他们见了书记，都很客气。');
  }
}
