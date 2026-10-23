/* 本地独立 QA 页，正式构建仅替换启动存档，不发布这些 HTML。 */
const fs=require('fs'),path=require('path'),vm=require('vm');const root=path.join(__dirname,'..'),dir=path.join(__dirname,'fixtures','v27');let code='';
for(const d of ['data','js']) for(const f of fs.readdirSync(path.join(root,'src',d)).sort()) if(f.endsWith('.js')&&!/^(80|95)-/.test(f)) code+=fs.readFileSync(path.join(root,'src',d,f),'utf8')+'\n';
const c={console,Math,JSON,Object,Date,Number,Set};vm.createContext(c);vm.runInContext(code,c);const run=s=>vm.runInContext(s,c);fs.mkdirSync(dir,{recursive:true});
function clean(){run("G.scene=null;G.scene2=null;G.scene3=null;G.sceneDone=true;G.scene2Done=true;G.scene3Done=true;G.tab='war';G.acts=3;G.money=5;G.trust=80;G.prestige=80;G.report=[];G.school=0;");}
function output(name){clean();const data=run('JSON.stringify(savePayload())');fs.writeFileSync(path.join(dir,name+'.json'),data);fs.writeFileSync(path.join(dir,name+'.html'),fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>','<head>\n<base href="/">').replace('if (typeof BOOT === "function") BOOT();','restoreGame('+data+'); UI.render();'));}
for(const [id,m,who] of [['t_school',18,'xuanchuan'],['t_env',15,'jiwei'],['t_river',33,'zhengfa']]){
 run(`newGame({seed:27071,bossType:'steady'});G.month=${m-1};Month.start(false);G.month=${m};Month.start(false);G.topic='${id}';G.topicNext=null;Act.run('modi','${who}')`);output(id);
}
run("newGame({seed:27071,bossType:'steady'});G.month=17;Month.start(false);G.month=18;Month.start(false);G.topic='t_school';G.topicNext=null;G.stand.forEach(function(id,i){if(id!=='boss' && id!=='mayor') P(id).side=i<4 ? 100 : -100;});Meeting.vote('t_school');Month.topicResult('t_school',false);G.month=19;Month.start(false);G.topic=null;G.topicNext=null");output('retry-open');
run("Policy.retry('t_school','materials');G.month=G.reconsider.t_school.mo;Month.start(false);G.stand.forEach(function(id,i){if(id!=='boss' && id!=='mayor') P(id).side=i<8 ? 100 : -100;});G.topicNext=null");output('retry-meeting');
for(const [name,post] of [['specialist','caizheng'],['partner','xinfang']]){
 run(`newGame({seed:27071,bossType:'steady'});vacate('${post}');placeIn('${post}','ouym','boss');P('ouym').side=50;P('ouym').dirt=0;P('ouym').loyal=80;G.month=13;Work.appoint('ouym','${post}');G.month=14;Work.run(G.work[0].id,'visit');G.month=15;G.topic=null;G.topicNext=null`);output(name);
}
c.legacy=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/legacy-v2.6.json'),'utf8'));run('restoreGame(legacy)');output('legacy');
console.log('8 isolated v2.7 QA pages created from the exact production HTML.');
