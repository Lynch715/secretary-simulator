/* 与正式 index.html 同源码、同样式；只替换 QA 初始状态，不发布这些页面。 */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),dir=path.join(__dirname,'fixtures','v26');let code='';
for(const d of ['data','js']) for(const f of fs.readdirSync(path.join(root,'src',d)).sort()) if(f.endsWith('.js')&&!/^(80|95)-/.test(f)) code+=fs.readFileSync(path.join(root,'src',d,f),'utf8')+'\n';
const c={console,Math,JSON,Object,Date,Number,Set};vm.createContext(c);vm.runInContext(code,c);const run=s=>vm.runInContext(s,c);
fs.mkdirSync(dir,{recursive:true});
function output(name,clear=true){
  if(clear) run("G.scene=null;G.scene2=null;G.scene3=null;G.sceneDone=true;G.scene2Done=true;G.scene3Done=true;G.topicNext=null;");
  run("G.tab='war';G.school=0;G.acts=3;G.money=5;G.trust=80");
  const data=run('JSON.stringify(savePayload())');fs.writeFileSync(path.join(dir,name+'.json'),data);
  fs.writeFileSync(path.join(dir,name+'.html'),fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<head>','<head>\n<base href="/">').replace('if (typeof BOOT === "function") BOOT();','restoreGame('+data+'); UI.render();'));
}
run("newGame({seed:6124});G.month=33;G.topic='t_river';G.topicDone=false;G.topicNext=null;Act.run('modi','zhengfa');Act.run('modi','jiwei');Act.run('modi','tongzhan');G.prestige=90;G.stand.forEach(function(id,i){if(id!=='boss' && id!=='mayor') P(id).side=i<=5?100:-100;})");output('meeting');
run("newGame({seed:6124});vacate('zhujian');placeIn('zhujian','tangjl','boss');P('tangjl').side=50;G.month=11;Month.start(false)");output('branch',false);
run("newGame({seed:6124});G.month=22;var slots=[['gongan','fangyu'],['jcz','zhangyn'],['jw_fu','wuxy'],['shenji','qianwj'],['xinfang','tansh'],['rb','gaoyf'],['gd','yanping']];slots.forEach(function(x){vacate(x[0]);placeIn(x[0],x[1],'boss');P(x[1]).side=50;});P('qingchuan').met=true;P('qingchuan').grip=6;P('fagai').met=true;P('fagai').side=-30;P('fagai').dirt=0;P('fagai').known.dirt=0;G.topic=null");output('departments');
run("newGame({seed:6124});G.month=60;G.ending='mayor_out';G.work=[{kind:'oldcity',pass:true,st:'done',rules:2,outcome:{settled:true,records:true}},{kind:'qingchuan',pass:true,st:'done',method:'family'}];P('gx_qz').by='boss';P('gx_qz').gone='retire';G.delivery.staff.gx_qz={post:'gx_qz',last:45};P('ouym').by='boss';P('ouym').gone='moved';G.topicHistory={t_river:{m:33,pass:true}}");output('ending');
run("newGame({seed:6124});G.month=41;P('meiling').gone='retire';Month.start(false)");output('departure',false);
run("newGame({seed:6124});G.month=22;G.topic=null;vacate('jiaoyu');G.wk.fang_media=1;G.wk.fang_hus=1;P('zhouqm').met=true;P('zhouqm').known.side=1;P('zhouqm').side=30");output('forms');
console.log('Generated 6 isolated v2.6 QA states and pages.');
