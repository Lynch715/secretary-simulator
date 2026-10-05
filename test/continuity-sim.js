/* 在原有 smart/dirty 策略前办理待办，检查完整局的资源与状态。 */
var fs=require('fs'),assert=require('assert');
var source=fs.readFileSync(__dirname+'/sim.js','utf8').replace(/var N = \+process[\s\S]*$/,'');
eval(source);
var priorBot=bot;
bot=function(style,G){
  var tasks=ctx.Work.active().slice();
  tasks.forEach(function(w){
    var options=ctx.Work.options(w).filter(function(o){return ctx.Work.can(w,o);});
    if(!options.length) return;
    var o=options[0];
    if(w.stage===1){ var preferred=w.kind==='oldcity'?'revise':w.kind==='qingchuan'?'family':'correct';o=options.filter(function(x){return x.id===preferred;})[0]||o; }
    ctx.Work.run(w.id,o.id);
  });
  priorBot(style,G);
};
var completed=0,overdue=0,total=0;
['smart','dirty'].forEach(function(style){
  for(var i=0;i<60;i++){
    var G=play(style,7000+i);
    assert(G.ending,'run must reach ending');assert(G.acts>=0,'no negative actions');assert(G.money>=0,'no negative budget');
    G.work.forEach(function(w){assert(['open','waiting','done','overdue','void'].indexOf(w.st)>=0);if(w.st==='done')completed++;if(w.st==='overdue')overdue++;total++;});
  }
});
assert(completed>0,'full simulations must actually resolve follow-ups');
console.log('PASS 120 full runs with task decisions; '+completed+' completed / '+overdue+' overdue / '+total+' tasks; no invalid resources or state.');
