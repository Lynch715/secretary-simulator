/* 有实际方案修订、再议和适岗办理的完整局；不是乐趣/平衡的真人验收。 */
var fs=require('fs'),assert=require('assert');
eval(fs.readFileSync(__dirname+'/sim.js','utf8').replace(/var N = \+process[\s\S]*$/,''));
var normalNew=A.newGame,normalBot=bot,normalEnd=A.Month.end;
var counts={games:0,months:0,amendments:0,retryPlans:0,retryVotes:0,specialty:0,partner:0};
A.newGame=function(opt){
  normalNew(opt);var g=A.getG(),post=opt.seed%2 ? 'xinfang' : 'caizheng';
  ctx.vacate(post);ctx.placeIn(post,'ouym','boss');A.P('ouym').side=50;A.P('ouym').dirt=0;
  ctx.Work.appoint('ouym',post);return g;
};
bot=function(style,g){
  Object.keys(g.reconsider || {}).forEach(function(id){
    var choice=g.seed%2 ? 'pilot' : 'materials';if(ctx.Policy.canRetry(id,choice)){ctx.Policy.retry(id,choice);counts.retryPlans++;}
  });
  Object.keys(g.policyDrafts || {}).forEach(function(id){
    if(!ctx.Policy.active(id) || g.policyDrafts[id].choice || g.topicRetry===id || g.acts<2) return;
    var options=ctx.POLICY_OPTIONS[id],o=options[g.seed%options.length];
    var who=Object.keys(o.mods).filter(function(who){return !A.P(who).gone && A.isStanding(who);})[0];
    if(who && ctx.Agenda.next()===id && !ctx.Agenda.knows(who,id)) A.Act.run('modi',who);
    if(ctx.Policy.can(id,o.id)){ctx.Policy.amend(id,o.id);counts.amendments++;}
  });
  ctx.Work.active().slice().forEach(function(w){
    var options=ctx.Work.options(w).filter(function(o){return ctx.Work.can(w,o);});if(!options.length) return;
    var id=w.stage===0 ? 'visit' : w.need==='procedure' ? 'correct' : w.need==='funding' ? 'support' : w.fit<0 ? 'partner' : w.fit>0 ? 'specialty' : w.need==='capacity' ? 'assist' : 'trust';
    var o=options.filter(function(o){return o.id===id;})[0] || options[0];
    var r=ctx.Work.run(w.id,o.id);if(r && Object.hasOwn(counts,o.id)) counts[o.id]++;
  });
  normalBot(style,g);
};
A.Month.end=function(){
  var g=A.getG(),before=g.topicRetry;
  var result=normalEnd();counts.months++;
  if(before && g.reconsider[before].st==='done') counts.retryVotes++;
  assert(g.acts>=0 && g.acts<=3);assert(g.money>=0 && g.money<=9);
  for(var k of ['trust','prestige','heat','feud','bossRisk']) assert(Number.isFinite(g[k]),k);
  var slots=[];Object.keys(g.reconsider || {}).forEach(function(id){var r=g.reconsider[id];assert(['open','waiting','done','archived','expired'].includes(r.st));if(r.st==='waiting'){assert(r.mo<60);assert(!slots.includes(r.mo));slots.push(r.mo);}assert(g.topicHistory[id].pass===false,'initial loss preserved');});
  Object.keys(g.posts).forEach(function(post){var id=g.posts[post];if(id){assert(!A.P(id).gone);assert.equal(A.P(id).post,post);}});
  return result;
};
for(var i=0;i<200;i++){var g=play(i%2?'dirty':'smart',27000+i);assert(g.ending,'must reach an ending');counts.games++;}
for(var key of ['amendments','retryPlans','retryVotes','specialty','partner']) assert(counts[key]>0,'actually exercise '+key);
console.log('PASS '+JSON.stringify(counts)+'; monthly resources, offices, retry limits and original failed votes valid.');
