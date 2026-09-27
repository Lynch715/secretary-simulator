var src = require('fs').readFileSync(__dirname + '/sim.js', 'utf8').replace(/var N = \+process[\s\S]*$/, '');
eval(src);
var st = process.argv[2] || 'smart', seed = +process.argv[3] || 1001;
A.newGame({ seed: seed }); var G = A.getG();
var orig = A.Month.end;
while (!G.ending && G.month < 40){
  var sc = A.SCENES[G.scene];
  if (sc && !G.sceneDone){ var ok = sc.opts.map(function(o,i){return (!o.req||o.req())?i:-1;}).filter(function(i){return i>=0;}); A.Month.choose(ok[0]); }
  if (st !== 'idle') bot(st, G);
  var m = G.month;
  var line = m + ' 势' + A.shi() + ' 票' + G.stand.map(function(id){ return A.tierOf(A.P(id).side); }).join(',') + ' 位' + countP(1) + '/' + countP(-1) + ' 威' + Math.round(G.prestige) + ' 信' + Math.round(G.trust) + ' 热' + Math.round(G.heat) + ' 吵' + Math.round(G.feud) + ' 钱' + G.money + ' 险' + Math.round(G.bossRisk) + ' 赢' + G.won + '输' + G.lost;
  A.Month.end();
  console.log(line + (G.nextReport && 0 ? '' : ''));
}
console.log('END', G.ending, G.month);
function countP(s){ var n=0; for (var k in G.posts){ var h=G.posts[k]; if (h && A.camp(h)===s) n++; } return n; }
