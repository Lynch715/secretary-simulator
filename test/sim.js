/* 无头跑局：node test/sim.js [局数] */
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..', 'src');
var code = '';
['data', 'js'].forEach(function(d){
  fs.readdirSync(path.join(root, d)).sort().forEach(function(f){
    if (!/\.js$/.test(f) || /^(80|95)-/.test(f)) return;
    code += fs.readFileSync(path.join(root, d, f), 'utf8') + '\n';
  });
});
var ctx = { console: console, Math: Math, JSON: JSON, Object: Object, Date: Date };
vm.createContext(ctx);
vm.runInContext(code + '\nthis.api={newGame:newGame,ACTS:ACTS,Month:Month,Act:Act,Props:Props,Grip:Grip,SCENES:SCENES,P:P,shi:shi,vacancies:vacancies,own:own,tierOf:tierOf,isStanding:isStanding,POST_BY_ID:POST_BY_ID,WANT_BY_ID:WANT_BY_ID,getG:function(){return G;},camp:camp,seenCamp:seenCamp,Meeting:Meeting,BATTLES:BATTLES};', ctx);
var A = ctx.api;

function rndOf(a){ return a[Math.floor(Math.random() * a.length)]; }

function play(style, seed){
  A.newGame({ seed: seed });
  var G = A.getG();
  var guard = 0;
  while (!G.ending && guard++ < 60){
    /* 场景 */
    var sc = A.SCENES[G.scene];
    if (sc && !G.sceneDone){
      var ok = sc.opts.map(function(o, i){ return (!o.req || o.req()) ? i : -1; }).filter(function(i){ return i >= 0; });
      var pickI = ok[0];
      if (style === 'random') pickI = rndOf(ok);
      if (style === 'dirty'){ var g = ok.filter(function(i){ return sc.opts[i].gray; }); pickI = g.length ? g[0] : rndOf(ok); }
      if (style === 'smart'){ pickI = ok[Math.floor(Math.random() * ok.length)]; var g2 = ok.filter(function(i){ return !sc.opts[i].gray; }); if (g2.indexOf(pickI) < 0) pickI = g2[0]; }
      A.Month.choose(pickI);
    }
    var s2 = A.SCENES[G.scene2];
    if (s2 && !G.scene2Done){
      var ok2 = s2.opts.map(function(o, i){ return (!o.req || o.req()) ? i : -1; }).filter(function(i){ return i >= 0; });
      var p2 = style === 'dirty' ? (ok2.filter(function(i){ return s2.opts[i].gray; })[0]) : null;
      if (p2 == null) p2 = style === 'smart' ? ok2.filter(function(i){ return !s2.opts[i].gray; })[Math.floor(Math.random() * ok2.filter(function(i){ return !s2.opts[i].gray; }).length)] : rndOf(ok2);
      if (p2 == null) p2 = ok2[0];
      A.Month.choose(p2, 2);
    }
    if (style !== 'idle') bot(style, G);
    A.Month.end();
  }
  return G;
}

function bot(style, G){
  if (style === 'random'){
    for (var i = 0; i < 5 && G.acts > 0; i++){
      var a = rndOf(['modi','dihua','xia','kao','hui','wa','hu','pei']);
      var t = A.Act.targets(a); if (t.length) A.Act.run(a, rndOf(t), { hot: Math.random() < 0.3 });
    }
    var ks = ['talk','nom','give','grip','prov'];
    for (var j = 0; j < 4 && A.Props.left() > 0; j++){
      var k = rndOf(ks);
      if (k === 'talk'){ var tt = A.Props.talkTargets(); if (tt.length) A.Props.submit('talk', rndOf(tt)); }
      if (k === 'nom'){ var v = A.vacancies(); if (!v.length) continue; var post = rndOf(v); var ns = A.Props.nominees(post); if (ns.length) A.Props.submit('nom', rndOf(ns), post); }
      if (k === 'give'){ var gv = A.Props.gives().filter(function(w){ return w.kind !== 'money' || G.money >= A.Props.moneyCost(w); }); if (gv.length) A.Props.submit('give', rndOf(gv).id); }
      if (k === 'grip' && !A.Grip.busy()){ var gl = A.Grip.list().filter(function(id){ return A.Grip.ways(id).length; }); if (gl.length){ var id = rndOf(gl); A.Props.submit('grip', id, rndOf(A.Grip.ways(id)).w); } }
      if (k === 'prov' && A.Props.canProv()) A.Props.submit('prov');
    }
    return;
  }
  /* smart / dirty */
  var voteSoon = false;
  for (var b in A.BATTLES){ var mo = A.BATTLES[b].mo; if (mo === G.month || mo === G.month + 1) voteSoon = true; }
  var hr = [2,5,8,11,14,17,20,23,26,29,32,35].indexOf(G.month) >= 0;
  var guard = 0;
  while (G.acts > 0 && guard++ < 10){
    var done = false;
    if (G.heat >= 55 && A.Act.targets('hu').length){ A.Act.run('hu', 'self'); continue; }
    if (G.acts === 3 && !G.flags.peiAt || G.flags.peiAt !== G.month && G.trust < 60){ var pt = A.Act.targets('pei'); if (pt.length){ A.Act.run('pei', rndOf(pt)); continue; } }
    /* 知道诉求 */
    var unk = G.stand.filter(function(id){ return id !== 'mayor' && id !== 'boss' && !A.P(id).gone && ((ctx.api.getG().people[id] && true)) && (require_w(id)); });
    if (unk.length && Math.random() < 0.6){ A.Act.run('modi', unk[0]); continue; }
    /* 挖 */
    var wt = A.Act.targets('wa').filter(function(id){ return A.camp(id) === -1; });
    if (wt.length && Math.random() < 0.55){ A.Act.run('wa', wt.indexOf('mayor') >= 0 && Math.random() < 0.5 ? 'mayor' : rndOf(wt), {}); continue; }
    var hu = A.Act.targets('hui').filter(function(id){ return A.P(id).loyal < 45; });
    if (hu.length){ A.Act.run('hui', hu[0]); continue; }
    var kt = A.Act.targets('kao').filter(function(id){ return !A.P(id).post || A.P(id).by !== 'boss'; });
    if (kt.length && Math.random() < 0.5){ A.Act.run('kao', rndOf(kt)); continue; }
    var xt = A.Act.targets('xia');
    A.Act.run('xia', rndOf(xt));
  }
  /* 拟办 */
  var g2 = 0;
  if (voteSoon){
    var sw = G.stand.filter(function(id){ var s = A.P(id).side; return s > -30 && s < 25 && id !== 'mayor' && id !== 'boss'; });
    sw.sort(function(a, b){ return A.P(b).side - A.P(a).side; });
    for (var q = 0; q < sw.length && A.Props.left() > 0 && q < 2; q++) A.Props.submit('talk', sw[q]);
  }
  while (A.Props.left() > 0 && g2++ < 6){
    if (!A.Grip.busy()){
      var gl = A.Grip.list().filter(function(id){ return A.Grip.ways(id).length && (id === 'mayor' || A.camp(id) === -1 || A.isStanding(id)); });
      if (gl.length){
        var id = gl[0]; var ws = A.Grip.ways(id).map(function(w){ return w.w; });
        var w = ws.indexOf('jw') >= 0 ? 'jw' : (style === 'dirty' && ws.indexOf('ji') >= 0 ? 'ji' : (ws.indexOf('bi') >= 0 && A.isStanding(id) ? 'bi' : (ws.indexOf('diao') >= 0 && G.prestige >= 50 ? 'diao' : null)));
        if (w){ A.Props.submit('grip', id, w); continue; }
      }
    }
    var v = A.vacancies().filter(function(p){ return !G.noms[p]; });
    if (v.length){
      var post = v[0];
      var hotn = A.Props.nominees(post).filter(function(x){ return A.Props.wantedBy(x, post); });
      if (hotn.length && Math.random() < 0.7){ A.Props.submit('nom', hotn[0], post); continue; }
      var ns = A.Props.nominees(post).filter(function(x){ var p = A.P(x); return (p.known.side ? p.side >= 15 : p.show >= 15) && !A.Props.poGe(x, post) && p.by !== 'boss'; });
      ns.sort(function(a, b){ return A.P(b).cap - A.P(a).cap; });
      if (ns.length){ A.Props.submit('nom', ns[0], post); continue; }
    }
    var gv = A.Props.gives().filter(function(w){ return w.kind !== 'money' || G.money >= A.Props.moneyCost(w); });
    gv = gv.filter(function(w){ return !(w.pkey === 'mayor_seat' && G.promises.some(function(x){ return x.key === 'mayor_seat'; })); });
    if (gv.length){ A.Props.submit('give', gv[0].id); continue; }
    if (A.Props.canProv() && (G.feud > 50 || A.shi() >= 66)){ A.Props.submit('prov'); continue; }
    break;
  }
}
function require_w(id){
  var G = A.getG(); var ws = (ctx.PEOPLE_DEF || []).filter(function(d){ return d.id === id; })[0];
  ws = ws && ws.wants || [];
  return ws.some(function(w){ return !G.wk[w.id]; });
}
ctx.PEOPLE_DEF = vm.runInContext('PEOPLE_DEF', ctx);

var N = +process.argv[2] || 100;
['idle', 'random', 'smart', 'dirty'].forEach(function(st){
  var ends = {}, mo = 0, shiS = 0, rm = 0, err = 0, dropped = 0, won = 0;
  for (var i = 0; i < N; i++){
    try {
      var G = play(st, 1000 + i);
      ends[G.ending] = (ends[G.ending] || 0) + 1; mo += G.month; shiS += A.shi(); rm += G.removed.length; dropped += G.dropped; won += G.won;
    } catch (e){ err++; if (err < 3) console.log(st, e.stack.split('\n').slice(0, 4).join('\n')); }
  }
  var wins = ['mayor_fall','mayor_gone','mayor_moved','mayor_out'].reduce(function(a, k){ return a + (ends[k] || 0); }, 0);
  console.log('\n[' + st + '] 赢 ' + Math.round(wins / N * 100) + '%  平均月 ' + (mo / N).toFixed(1) + '  势 ' + (shiS / N).toFixed(0) + '  拿掉 ' + (rm / N).toFixed(1) + '  胜仗 ' + (won / N).toFixed(1) + '  弃子 ' + (dropped / N).toFixed(2) + '  报错 ' + err);
  console.log('  ' + Object.keys(ends).sort().map(function(k){ return k + ' ' + Math.round(ends[k] / N * 100) + '%'; }).join('  '));
});
