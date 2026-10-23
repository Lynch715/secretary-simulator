/* 只生成浏览器 QA 页面，不进入正式构建。 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),dir=path.join(__dirname,'fixtures','v25');
let code='';
for(const d of ['data','js']) for(const f of fs.readdirSync(path.join(root,'src',d)).sort()) if(f.endsWith('.js')&&!/^(80|95)-/.test(f)) code+=fs.readFileSync(path.join(root,'src',d,f),'utf8')+'\n';
const c={console,Math,JSON,Object,Date,Number};vm.createContext(c);vm.runInContext(code,c);
const run=s=>vm.runInContext(s,c);
fs.mkdirSync(dir,{recursive:true});
function output(name){
  run("G.tab='war';G.scene=null;G.scene2=null;G.scene3=null;G.topic=null;G.topicNext=null;G.sceneDone=true;G.scene2Done=true;G.scene3Done=true;G.school=0;G.trust=80;G.heat=10;G.money=3;G.props=[];G.done=[];G.acts=3;G.report=[]");
  const payload=run('JSON.stringify(savePayload())');
  fs.writeFileSync(path.join(dir,name+'.json'),payload);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>','<head>\n<base href="/">').replace('if (typeof BOOT === "function") BOOT();','restoreGame('+payload+'); UI.render();');
  fs.writeFileSync(path.join(dir,name+'.html'),html);
}
run("newGame({seed:2048,bossType:'steady'});G.month=12;Work.battle('b3',true);G.month=13;Work.run('oldcity','field');G.month=14");output('oldcity');
run("newGame({seed:2048,bossType:'steady'});P('gk_qz').by='boss';P('gk_qz').side=50;P('gk_qz').loyal=80;G.month=12;Work.appoint('gk_qz','gk_qz');G.month=13;Work.run(G.work[0].id,'visit');G.month=14");output('capacity');
run("newGame({seed:2048,bossType:'steady'});vacate('caizheng');placeIn('caizheng','ouym','boss');P('ouym').cap=3;P('ouym').dirt=0;P('ouym').side=50;G.month=12;Work.appoint('ouym','caizheng');G.month=13;Work.run(G.work[0].id,'visit');G.month=14");output('funding');
run("newGame({seed:2048,bossType:'steady'});P('gx_qz').known.dirt=1;G.month=15;Act.run('hui','gx_qz');G.month=17");output('staff');
console.log('Generated 4 isolated browser QA fixtures; not included in build.py.');
