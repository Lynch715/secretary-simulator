/* 在第一组三项模拟上增加真实补证、公开布局应对及后半程双幕。 */
var fs=require('fs'),assert=require('assert');
var decisionSource=fs.readFileSync(__dirname+'/decisions-sim.js','utf8');
eval(decisionSource.slice(0,decisionSource.indexOf('for(var i=0;i<200;i++)')));
var decisionBot=bot,decisionNew=A.newGame,decisionEnd=A.Month.end;
var strategyCounts={games:0,briefPreps:0,budgetPlans:0,personnelPlans:0,pending:0,handover:0,delivery:0,lateCompleted:0};
var observedPlan={};
A.newGame=function(opt){
  var g=decisionNew(opt);g.bossType=['steady','strong','shrewd'][opt.seed%3];
  if(opt.seed%3!==0){ctx.vacate('shenji');ctx.placeIn('shenji','qianwj','boss');A.P('qianwj').side=50;A.P('qianwj').dirt=0;ctx.Work.appoint('qianwj','shenji');}observedPlan={};return g;
};
bot=function(style,g){
  (g.propLog || []).slice().forEach(function(r){
    if(!r.brief || !ctx.Brief.can(r.no)) return;
    var gap=ctx.Brief.gap(r.kind,r.a,r.b),who;
    if(gap.action==='poll') who=ctx.Brief.candidates().sort(function(a,b){return A.P(b).side-A.P(a).side;})[0];
    if(ctx.Brief.prepare(r.no,who)) strategyCounts.briefPreps++;
  });
  decisionBot(style,g);
};
A.Month.end=function(){
  var g=A.getG(),was=g.trajectory && {kind:g.trajectory.kind,done:g.trajectory.done};
  var result=decisionEnd(),p=g.mayorPlan;
  if(p){var key=p.start+':'+p.kind+':'+p.target;if(!observedPlan[key]){observedPlan[key]=true;if(p.kind==='budget')strategyCounts.budgetPlans++;if(p.goal==='seats')strategyCounts.personnelPlans++;}}
  if(g.trajectory && !was) strategyCounts[g.trajectory.kind]++;
  assert(ctx.validDecisionSave(g),'all newly saved fields are importable');
  return result;
};
for(var i=0;i<200;i++){var g=play(i%2?'dirty':'smart',28000+i);assert(g.ending);if(g.trajectory && g.trajectory.done) strategyCounts.lateCompleted++;strategyCounts.games++;}
for(var key of ['briefPreps','budgetPlans','personnelPlans','pending','lateCompleted'])assert(strategyCounts[key]>0,'actually exercise '+key);
console.log('PASS '+JSON.stringify(strategyCounts)+'; plus '+JSON.stringify(counts)+'; 200 full games exercised all integrated systems without invalid resources or save structures.');
