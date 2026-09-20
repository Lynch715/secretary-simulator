/* 无头跑局：node test/sim.js [局数]  —— 检查 S1 骨架能不能从第1月点到第60月 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
function readDir(sub, ext){
  const d = path.join(ROOT, 'src', sub);
  return fs.readdirSync(d).filter(n => n.endsWith(ext) && !n.startsWith('_')).sort()
    .map(n => fs.readFileSync(path.join(d, n), 'utf8'));
}
const code = readDir('data', '.js').concat(readDir('js', '.js')).join('\n');

function mkCtx(){
  const store = {};
  const ctx = {
    console,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    document: { querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style:{}, click(){}, appendChild(){}, addEventListener(){} }), body:{ appendChild(){} } },
    setTimeout: () => 0, Blob: function(){}, URL: { createObjectURL: () => '', revokeObjectURL(){} },
    FileReader: function(){}
  };
  vm.createContext(ctx);
  vm.runInContext('"use strict";\n' + code, ctx, { filename: 'bundle.js' });
  ctx.UI.render = () => {};
  ctx.UI.toast = () => {};
  return ctx;
}

/* 四种打法：clean 从不伸手 / rare 偶尔伸手（一成）/ mid 随机 / greedy 有灰的就选灰的。
   rare 最接近一个真人：五年里伸过七八回手 */
function chooseIdx(ctx, e, style, it){
  const ok = e.opts.map((o,i)=>
    (ctx.Desk.meet(o.req) && (!o.reqFind || ctx.Dossier.lit(it, e, o.reqFind))) ? i : -1
  ).filter(i=>i>=0);
  if (!ok.length) return -1;
  const gray = ok.filter(i=>e.opts[i].rule);
  const white = ok.filter(i=>!e.opts[i].rule);
  if (style === 'clean' && white.length) return white[Math.floor(Math.random()*white.length)];
  if (style === 'greedy' && gray.length) return gray[Math.floor(Math.random()*gray.length)];
  if (style === 'rare'){
    if (gray.length && Math.random() < 0.10) return gray[Math.floor(Math.random()*gray.length)];
    if (white.length) return white[Math.floor(Math.random()*white.length)];
  }
  return ok[Math.floor(Math.random()*ok.length)];
}

/* 排人：干净的打法不会把送礼的那位排进去 */
function pickSlots(ctx, it, e, style){
  const dirty = c => (c.fxIn && ((c.fxIn.clean || 0) < 0 || (c.fxIn.lead || 0) > 0));
  const order = e.list.map((c, i) => i)
    .sort((a, b) => {
      const da = dirty(e.list[a]) ? 1 : 0, db = dirty(e.list[b]) ? 1 : 0;
      return style === 'greedy' ? db - da : da - db;
    });
  for (let n = 0; n < Math.min(4, order.length); n++){
    if (style !== 'greedy' && dirty(e.list[order[n]])) break;
    ctx.Slots.toggle(it.uid, order[n]);
  }
}

function playOne(ctx, seed, style){
  ctx.newGame({ seed, origin: ['xds','bgg','xz'][seed % 3] });
  ctx.npcInit();
  const G = () => ctx.G;
  let guard = 0, overCount = 0, doneTotal = 0, months = 0;
  while (!G().ending && G().month <= 80 && guard++ < 500){
    months++;
    // 随便办：天数够就办，随机挑一条
    let inner = 0;
    while (inner++ < 30){
      const live = G().queue.filter(q => !q.done && q.due !== 'plan');
      if (!live.length) break;
      const it = live[Math.floor(Math.random() * live.length)];
      const e = ctx.EV(it.id);
      if (e.mats) e.mats.forEach(m => ctx.Dossier.read(it.uid, m.id));
      if (e.slot && !it.slotDone){
        pickSlots(ctx, it, e, style);
        ctx.Slots.confirm(it.uid);
      }
      const idx = chooseIdx(ctx, e, style, it);
      if (idx < 0) break;
      const before = G().queue.filter(q => q.done).length;
      ctx.Desk.choose(it.uid, idx);
      if (G().ending) break;
      if (G().queue.filter(q => q.done).length === before) break; // 天数不够了
    }
    if (G().ending) break;
    doneTotal += G().done.length;
    overCount += G().queue.filter(q => !q.done && q.due !== 'plan').length;
    const nights = ['rest','fam','ot','msz'];
    ctx.Desk.endMonth(nights[Math.floor(Math.random() * 4)]);
    if (G().days < 0) throw new Error('天数变负：第' + G().month + '月');
    if (G().month > 61) throw new Error('月份没停：' + G().month);
  }
  if (!G().ending) throw new Error('打到 ' + G().month + ' 月还没有结局');
  return { end: G().ending, month: G().month, over: overCount / Math.max(1, months),
           doneAvg: doneTotal / Math.max(1, months), merit: G().archive.merit.length,
           fault: G().archive.fault.length, lead: G().hidden.lead,
           dark: G().hidden.dark.length, remarks: G().archive.remarks.length };
}

const N = parseInt(process.argv[2] || '200', 10);
const ctx = mkCtx();
['clean','rare','mid','greedy'].forEach(style => {
  const tally = {}; let leadHit = 0, sumRemark = 0, sumFault = 0, sumOver = 0, sumDone = 0;
  for (let i = 0; i < N; i++){
    const r = playOne(ctx, 1000 + i, style);
    tally[r.end] = (tally[r.end] || 0) + 1;
    if (r.lead >= 35) leadHit++;
    sumRemark += r.remarks; sumFault += r.fault; sumOver += r.over; sumDone += r.doneAvg;
  }
  const label = { clean:'从不伸手', rare:'偶尔伸手', mid:'随便点', greedy:'见灰就选' }[style];
  console.log('\n【' + label + '】' + N + ' 局，没有报错');
  Object.keys(tally).sort((a,b) => tally[b]-tally[a]).forEach(k => {
    console.log('   ' + (ctx.ENDINGS[k] ? ctx.ENDINGS[k].n : k).padEnd(11, '　') +
      String(tally[k]).padStart(4) + '  ' + (tally[k]*100/N).toFixed(0) + '%');
  });
  console.log('   线索到 35 的局 ' + (leadHit*100/N).toFixed(0) + '%　平均过 ' +
    (sumFault/N).toFixed(1) + ' 条');
  console.log('   每月办掉 ' + (sumDone/N).toFixed(1) + ' 件，月末还剩 ' +
    (sumOver/N).toFixed(1) + ' 件没办');
});

/* 十个结局都得判得出来 */
{
  const c4 = mkCtx();
  function setup(f){
    c4.newGame({ seed: 1 }); c4.npcInit(); c4.Pool.init(); c4.Private.init();
    c4.G.month = 60;
    f(c4.G);
  }
  const cases = [
    ['rise',     g => { g.flags.road='follow'; g.stats.trust=80; },            () => c4.Endings.settle()],
    ['province', g => { g.flags.road='province'; g.stats.guanxi=70; },         () => c4.Endings.settle()],
    ['outpost',  g => { g.flags.road='outpost'; g.stats.rep=60; },             () => c4.Endings.settle()],
    ['stay',     g => { g.stats.trust=50; g.stats.rep=40; g.stats.guanxi=30; },() => c4.Endings.settle()],
    ['cold',     g => { g.stats.rep=30; g.stats.trust=50; },                   () => c4.Endings.bossLeave()],
    ['replaced', g => { g.stats.trust=20; g.flags.trustLow=2; },               () => c4.Endings.tick()],
    ['clear',    g => { g.hidden.bossRisk=75; g.archive.coop=2; },             () => c4.Endings.patrol()],
    ['together', g => { g.hidden.bossRisk=75;
                        g.archive.fault.push({m:10,t:'x',rule:'gift'}); },     () => c4.Endings.patrol()],
    ['self_out', g => { g.hidden.lead=75; },                                   () => c4.Endings.patrol()],
    ['report',   g => {},                                                      () => c4.Endings.trigger('report')]
  ];
  const bad = [];
  cases.forEach(function(c){
    setup(c[1]);
    c[2]();
    if (c4.G.ending !== c[0]) bad.push(c[0] + ' → ' + (c4.G.ending || '没判出来'));
  });
  if (bad.length) throw new Error('结局判定不对：' + bad.join('；'));
  console.log('十个结局都判得出来');
}

/* 五个页签都渲染一遍：这类错 node --check 查不出来 */
{
  const c3 = mkCtx();
  c3.newGame({ seed: 11 }); c3.npcInit(); c3.Pool.init();
  for (let m = 0; m < 6; m++){
    const live = c3.G.queue.filter(q => !q.done && q.due !== 'plan');
    if (live.length) c3.Desk.choose(live[0].uid, 0);
    c3.Desk.endMonth('rest');
  }
  c3.Pool.addHeat('p_mayor_boss', 60);
  c3.Pool.reveal('keshang');
  c3.G.sel = (c3.G.queue[0] || {}).uid || null;
  ['desk','ban','qx','home','file'].forEach(function(tb){
    c3.G.tab = tb;
    const html = c3.UI.tabBody();
    if (typeof html !== 'string' || html.length < 10) throw new Error(tb + ' 页签渲染不出来');
  });
  c3.UI.stats(); c3.UI.datebar(); c3.UI.tabs(); c3.UI.docPane();
  console.log('五个页签都能渲染');
}

/* 单局细看：存档往返 */
const c2 = mkCtx();
c2.newGame({ seed: 7 }); c2.npcInit();
c2.Desk.endMonth('rest');
c2.save();
const snapshot = JSON.stringify(c2.G);
c2.G = null;
if (!c2.load()) throw new Error('存档读不回来');
if (c2.G.month !== 2) throw new Error('存档月份不对');
console.log('存档往返 ok，第', c2.G.month, '月');
