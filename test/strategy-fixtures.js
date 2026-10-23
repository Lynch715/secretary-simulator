/* 六项合并后的后半程与补证 QA 场景。只替换正式构建的启动存档。 */
const fs=require('fs'),path=require('path'),vm=require('vm');const root=path.join(__dirname,'..'),dir=path.join(__dirname,'fixtures','v27');let code='';
for(const d of ['data','js'])for(const f of fs.readdirSync(path.join(root,'src',d)).sort())if(f.endsWith('.js')&&!/^(80|95)-/.test(f))code+=fs.readFileSync(path.join(root,'src',d,f),'utf8')+'\n';
const c={console,Math,JSON,Object,Date,Number,Set};vm.createContext(c);vm.runInContext(code,c);const run=s=>vm.runInContext(s,c);fs.mkdirSync(dir,{recursive:true});
function output(name,scene=false){
 run("G.scene2=null;G.scene3=null;G.scene2Done=true;G.scene3Done=true;G.tab='war';G.acts=3;G.money=5;G.trust=80;G.prestige=80;G.report=[];G.school=0;G.topic=null;G.topicNext=null;");
 if(!scene) run('G.scene=null;G.sceneDone=true');
 const data=run('JSON.stringify(savePayload())');fs.writeFileSync(path.join(dir,name+'.json'),data);fs.writeFileSync(path.join(dir,name+'.html'),fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>','<head>\n<base href="/">').replace('if (typeof BOOT === "function") BOOT();','restoreGame('+data+');UI.render();'));
}
for(const type of ['steady','strong','shrewd']){
 run(`newGame({seed:28071,bossType:'${type}'});vacate('caizheng');P('ouym').met=true;P('ouym').known.side=0;P('ouym').known.dirt=0;var originalDecide=Props.decide;Props.decide=function(){return 'no'};Props.submit('nom','ouym','caizheng');Props.decide=originalDecide;`);output('brief-'+type);
}
run("newGame({seed:28071});G.month=18;Strategy.record('policy','t_school',true);G.month=19;Mayor.planTurn(50);G.month=20;Month.start(false)");output('budget');
run("newGame({seed:28071});G.work.push({id:'oldcity',kind:'oldcity',who:'cg_quzhang',st:'done',closed:15,pass:false,rules:2,outcome:{settled:false}});G.month=30;Month.start(false)");output('late-pending',true);
run("newGame({seed:28071});[['caizheng','ouym'],['shenji','qianwj']].forEach(function(x){vacate(x[0]);placeIn(x[0],x[1],'boss');P(x[1]).side=50;P(x[1]).dirt=0;P(x[1]).loyal=80;Delivery.verify(x[1]);});G.month=30;Month.start(false)");output('late-handover',true);
run("newGame({seed:28071});G.won=4;G.month=30;Month.start(false)");output('late-delivery',true);
run("newGame({seed:28071});G.work.push({id:'oldcity',kind:'oldcity',who:'cg_quzhang',st:'done',closed:15,pass:false,rules:2,outcome:{settled:false}});G.month=30;Month.start(false);Month.choose(0);G.month=37;Month.start(false)");output('late-follow',true);
console.log('8 supplement, opponent and late-chain QA pages generated.');
