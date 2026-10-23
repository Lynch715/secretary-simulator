/* 部门参与的完整局与每月资源/岗位一致性，不用于真人平衡结论。 */
var fs=require('fs'),assert=require('assert');
eval(fs.readFileSync(__dirname+'/sim.js','utf8').replace(/var N = \+process[\s\S]*$/,''));
var normalNew=A.newGame,normalBot=bot,normalEnd=A.Month.end;
var operations=0,months=0;
A.newGame=function(opt){normalNew(opt);var g=A.getG();var pair=[['rb','gaoyf'],['shenji','qianwj'],['gongan','fangyu'],['xinfang','tansh']][opt.seed%4];ctx.vacate(pair[0]);ctx.placeIn(pair[0],pair[1],'boss');A.P(pair[1]).side=50;return g;};
function invariant(){
  var g=A.getG();assert(g.acts>=0 && g.acts<=3,'action budget');assert(g.money>=0 && g.money<=9,'money budget');
  ['trust','prestige','heat','feud','bossRisk'].forEach(function(k){assert(Number.isFinite(g[k]),k+' must stay finite');});
  Object.keys(g.posts).forEach(function(post){var id=g.posts[post];if(id){assert(A.P(id) && !A.P(id).gone,'active post holder '+JSON.stringify({seed:g.seed,month:g.month,post:post,id:id,gone:A.P(id)&&A.P(id).gone,ending:g.ending}));assert.equal(A.P(id).post,post,'post/person agree');}});
  var values=Object.keys(g.posts).map(function(post){return g.posts[post];}).filter(Boolean);assert.equal(new Set(values).size,values.length,'no person holds two slots');
}
bot=function(style,g){
  var options=[];ctx.Ops.depts().forEach(function(post){ctx.OPS[post].filter(function(op){return !op.ask;}).forEach(function(op){ctx.Ops.targets(op).forEach(function(t){if(ctx.Ops.can(post,op.id,t)) options.push({post:post,id:op.id,t:t});});});});
  if(options.length){var o=rndOf(options);assert(ctx.Ops.run(o.post,o.id,o.t));operations++;}
  normalBot(style,g);
};
A.Month.end=function(){invariant();months++;var result=normalEnd();invariant();return result;};
for(var i=0;i<80;i++){var g=play(i%2?'smart':'dirty',9200+i);assert(g.ending,'complete game');}
assert(operations>=80,'exercise actual department actions');
console.log('PASS 80 full games / '+months+' months / '+operations+' actual department actions; per-month resources and post ownership stayed valid.');
