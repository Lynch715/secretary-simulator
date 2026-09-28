/* ── 35-ops：能调动的部门。正职自己人 → 打对手；副职自己人 → 顶市长、架空正职 ── */
var Ops = {
  /* 手里能调动的部门（正职是自己人的） */
  depts: function(){
    return Object.keys(OPS).filter(function(post){ return own(post); });
  },
  cool: function(post){ return G.opCool && G.opCool[post] && G.month - G.opCool[post] < 2; },

  targets: function(op){
    switch (op.tg){
      case 'area': return AREAS.filter(function(a){ return ['shizhi', 'shifu', 'shiwei'].indexOf(a.id) < 0; }).map(function(a){ return 'area:' + a.id; });
      case 'foe': return Object.keys(G.people).filter(function(id){ return P(id).met && !P(id).gone && seenCamp(id) < 0 && id !== 'mayor'; });
      case 'any': return Object.keys(G.people).filter(function(id){ var p = P(id); return p.met && !p.gone && !isStanding(id) && p.dirt; });
      case 'head': return Object.keys(G.people).filter(function(id){ var p = P(id); return p.met && !p.gone && p.dirt && seenCamp(id) <= 0 && /局长|区长|县长|区委书记|县委书记|主任/.test(p.p); });
      case 'case': return Grip.list().filter(function(id){ return id !== 'mayor' && !isStanding(id) && Grip.level(id) >= 2; });
      case 'none': return ['_'];
    }
    return [];
  },

  run: function(post, opId, t){
    var op = OPS[post].filter(function(o){ return o.id === opId; })[0];
    G.opCool = G.opCool || {}; G.opCool[post] = G.month;
    var area = (t || '').indexOf('area:') === 0 ? t.replace('area:', '') : null;
    var an = area ? AREAS.filter(function(a){ return a.id === area; })[0].n : '';
    var who = (t && t !== '_' && !area) ? t : null;
    var wn = who ? pn(who) : '';
    var r = { t: '', got: '' };

    if (opId === 'zx'){
      var foes = Object.keys(G.people).filter(function(id){ var d = PDEF[id]; return d && d.area === area && seenCamp(id) < 0 && P(id).dirt && !P(id).gone; });
      if (foes.length){ var v = pick(foes); Grip.add(v, 2); applyFx({ heat: 3 }); r.t = pick(OP_TXT.zx_hit).replace(/\{A\}/g, an).replace(/\{N\}/g, pn(v)); r.got = '拿到了' + pn(v) + '的东西'; }
      else { applyFx({ heat: 4, prestige: -2, side: { xuanchuan: -3 } }); r.t = OP_TXT.zx_none[0].replace(/\{A\}/g, an); }
    } else if (opId === 'dl'){
      applyFx({ heat: 6 });
      if (P(who).dirt){ Grip.add(who, 2); r.t = pick(OP_TXT.dl).replace(/\{N\}/g, wn); r.got = wn + '的东西 +1'; }
      else { P(who).clean = 1; P(who).known.dirt = 1; addSide(who, -6); applyFx({ heat: 4, feud: 4 }); r.t = OP_TXT.dl_clean.replace(/\{N\}/g, wn); r.bad = 1; }
    } else if (opId === 'la' || opId === 'lh'){
      G.pending.push({ k: 'pull', id: who, w: 'diao', mo: G.month + (opId === 'lh' ? 1 : 2) });
      applyFx({ heat: opId === 'la' ? 6 : 5, feud: 4 });
      r.t = (opId === 'la' ? OP_TXT.la : OP_TXT.lh)[0].replace(/\{N\}/g, wn);
      r.got = '立案了，' + (opId === 'lh' ? '一个月' : '两个月') + '后有结果';
    } else if (opId === 'th'){
      P(who).known.dirt = 1;
      if (P(who).side < 20 && P(who).cap <= 2 && seenCamp(who) <= 0 && rnd() < 0.5){ addSide(who, 25); r.t = pick(OP_TXT.th) + '\n' + OP_TXT.th_turn[0]; r.got = wn + '往书记这边靠了一大步'; }
      else { addSide(who, 6); Grip.add(who, 1); r.t = pick(OP_TXT.th).replace(/\{N\}/g, wn); r.got = wn + '的底露了一层'; }
      r.t = r.t.replace(/\{N\}/g, wn);
    } else if (opId === 'sj'){
      applyFx({ heat: 3 });
      if (P(who).dirt){ Grip.add(who, 3); r.t = pick(OP_TXT.sj).replace(/\{N\}/g, wn); r.got = wn + '的账翻出来了'; }
      else { addSide(who, -5); applyFx({ feud: 3 }); r.t = OP_TXT.sj_clean.replace(/\{N\}/g, wn); r.bad = 1; }
    } else if (opId === 'zb'){
      var fs = Object.keys(G.people).filter(function(id){ var d = PDEF[id]; return d && d.area === area && seenCamp(id) < 0 && P(id).dirt && !P(id).gone; });
      if (fs.length){ var vv = pick(fs); Grip.add(vv, 1); r.t = pick(OP_TXT.zb).replace(/\{A\}/g, an).replace(/\{N\}/g, pn(vv)); r.got = '添了' + pn(vv) + '一笔'; }
      else r.t = OP_TXT.zb_none[0].replace(/\{A\}/g, an);
    } else if (opId === 'fb' || opId === 'jt'){
      applyFx({ prestige: 3, feud: 3, side: { mayor: 0 } });
      r.t = (opId === 'fb' ? pick(OP_TXT.fb) : OP_TXT.jt[0]); r.got = '书记的声势起来了';
    } else if (opId === 'nc'){
      applyFx({ prestige: 3, feud: -6, bossRisk: -4 }); G.provAt = G.month - 3;
      r.t = OP_TXT.nc[0]; r.got = '省里那边动了一动';
    }
    return r;
  },

  /* 市长动手，副职能不能顶回去 */
  mayorHit: function(dept){
    var fu = { gongan: 'ga_fu', jcz: 'jc_fu', jw_fu: 'jw_cw', shenji: 'sj_fu' }[dept];
    if (fu && own(fu)) return MOP_BLOCK[dept] || null;
    return MOP_TXT[dept] || null;
  }
};

/* 副职架空正职：坐满半年，每两个月送一次正职的东西 */
function fuFeed(){
  ['ga_fu', 'jc_fu', 'jw_cw', 'sj_fu'].forEach(function(fp){
    if (!own(fp)) return;
    var pdef = POST_BY_ID[fp], zp = pdef.fu;
    var zid = holder(zp);
    if (!zid || camp(zid) >= 0 || P(zid).gone) return;
    var fid = holder(fp);
    if (P(fid).by !== 'boss' || G.month - (P(fid).byAt || G.month) < 6) return;
    if ((G.month - (P(fid).byAt || 0)) % 2 !== 0) return;
    if (P(zid).dirt && Grip.add(zid, 2)){
      G.nextReport.push(pn(fid) + '把' + pn(zid) + '的一份东西送到了你手上。他没多说，只说了一句：这个位子，他坐得不干净。');
    }
  });
}
