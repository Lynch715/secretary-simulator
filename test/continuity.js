/* 跨月因果、存档确定性、暗线和人物记事回归。node test/continuity.js */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.join(__dirname,'..');
let code='';
for(const d of ['data','js']) for(const f of fs.readdirSync(path.join(root,'src',d)).sort()) if(f.endsWith('.js')&&!f.startsWith('95-')) code+=fs.readFileSync(path.join(root,'src',d,f),'utf8')+'\n';
let storage={};
const ctx={console,Math,JSON,Object,Date,Number,localStorage:{setItem:(k,v)=>storage[k]=v,getItem:k=>storage[k]||null},setTimeout};
vm.createContext(ctx);vm.runInContext(code,ctx);
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
function run(s){return vm.runInContext(s,ctx);}
function start(){run('newGame({seed:1234,bossType:"steady"})');}
function setup(kind,pass=true){start();run(`G.month=12;Work.add('case','${kind}','${kind==='appoint'?'gaoxin':kind==='qingchuan'?'lihb':'cg_quzhang'}',${kind==='appoint'?"'gx_sj'":"null"},${pass});G.month=13;Work.start();`);}
function resolve(choice){run(`G.month=14;G.acts=3;Work.run('case','${choice}');G.month=15;Work.start();`);}
test('same RNG after save/load, including the whole remaining sequence',()=>{start();run('ri(100);save()');const expected=run('Array.from({length:100},function(){return rnd()})');run('load()');assert.deepStrictEqual(Array.from(run('Array.from({length:100},function(){return rnd()})')),Array.from(expected));});
test('export payload restores same future RNG',()=>{start();const payload=JSON.parse(run('JSON.stringify(savePayload())'));const future=run('rnd()');ctx.payload=payload;run('restoreGame(payload)');assert.strictEqual(run('rnd()'),future);});
test('legacy saves acquire defaults',()=>{start();const payload=JSON.parse(run('JSON.stringify({g:G})'));delete payload.g.work;delete payload.g.workSeen;delete payload.g.memories;ctx.payload=payload;assert(run('restoreGame(payload)'));assert.strictEqual(run('G.work.length'),0);assert(Number.isFinite(run('rnd()')));});
test('expired predecessor cannot unlock sequel',()=>{start();run("G.month=14;DARK=[{id:'d1b',win:[14,20],after:'d1a'}];G.seen.d1a=-1;G.chose={d1a:0}");assert.strictEqual(run('Month.pickDark()'),null);});
test('shown but unchosen predecessor cannot unlock sequel',()=>{run('G.seen.d1a=5;G.chose={}');assert.strictEqual(run('Month.pickDark()'),null);});
test('completed predecessor unlocks sequel',()=>{run('G.chose.d1a=0');assert.strictEqual(run('Month.pickDark()'),'d1b');});
// reset content replaced for the focused dark-chain tests
vm.runInContext(fs.readFileSync(path.join(root,'src/data/d32-dark.js'),'utf8'),ctx);
test('a battle produces only one follow-up',()=>{start();run("G.month=12;Work.battle('b3',true);Work.battle('b3',true)");assert.strictEqual(run('G.work.length'),1);});
test('stage zero hidden until following month',()=>{start();run("Work.battle('b3',true)");assert.strictEqual(run('Work.active().length'),0);});
test('normal field action advances the task and consumes one action',()=>{setup('oldcity');run("Act.run('xia','area:chengguan')");assert.strictEqual(run('G.acts'),2);assert.strictEqual(run('G.work[0].stage'),1);assert.strictEqual(run('G.work[0].ready'),14);});
test('no same-month second step',()=>{assert.strictEqual(run("Work.run('case','fund')"),null);assert.strictEqual(run('G.acts'),2);});
test('funding step costs both action and money',()=>{run("G.month=14;G.acts=3;G.money=2;Work.run('case','fund')");assert.strictEqual(run('G.money'),1);assert.strictEqual(run('G.acts'),2);assert.strictEqual(run('G.work[0].st'),'waiting');});
test('result waits for next month and is applied once',()=>{const before=run('G.prestige');run('Work.start()');assert.strictEqual(run('G.work[0].st'),'waiting');run('G.month=15;Work.start()');assert.strictEqual(run('G.prestige'),before+3);run('Work.start()');assert.strictEqual(run('G.prestige'),before+3);});
test('waiting task survives save/load',()=>{setup('oldcity');run("Work.run('case','field');G.month=14;G.acts=3;Work.run('case','revise');save();load();G.month=15;Work.start()");assert.strictEqual(run('G.work[0].st'),'done');});
test('funding unavailable without budget',()=>{setup('oldcity');run("Work.run('case','field');G.month=14;G.money=0");assert.strictEqual(run("Work.run('case','fund')"),null);assert.strictEqual(run('G.acts'),2);});
test('rejected old-city plan does not grant construction approval',()=>{setup('oldcity',false);run("Work.run('case','field')");resolve('press');assert(run('G.work[0].t').includes('没有开工'));});
test('old-city methods have different consequences',()=>{setup('oldcity');run("Work.run('case','field')");const heat=run('G.heat');resolve('press');assert.strictEqual(run('G.heat'),heat+5);});
test('Qingchuan written correction requires original win',()=>{setup('qingchuan',false);run("Work.run('case','field')");resolve('family');assert(run('G.work[0].t').includes('现有结论'));assert(!run('G.work[0].t').includes('更正后的认定书'));});
test('Qingchuan evidence enables review but not instant reversal',()=>{setup('qingchuan',false);run("Work.run('case','field')");resolve('review');assert(run('G.work[0].t').includes('补做核查'));});
test('departed appointment auto archives before resolution',()=>{setup('appoint');run("P('gaoxin').gone='moved';Work.start()");assert.strictEqual(run('G.work[0].st'),'void');});
test('transferred appointment auto archives',()=>{setup('appoint');run("vacate('gx_sj');Work.start()");assert.strictEqual(run('G.work[0].st'),'void');});
test('appointment follow-up created by real placement hook',()=>{start();run("vacate('caizheng');placeIn('caizheng','ouym','boss');Meeting.afterPlace('ouym','caizheng','boss')");assert.strictEqual(run('G.work[0].kind'),'appoint');});
test('known dirty appointment exposes risk if trusted',()=>{setup('appoint');run("P('gaoxin').dirt=1;P('gaoxin').known.dirt=1;Work.run('case','visit')");const heat=run('G.heat');resolve('trust');assert.strictEqual(run('G.heat'),heat+4);});
test('overdue task penalties happen once',()=>{setup('oldcity');run('G.month=16');const before=run('G.trust');run('Work.end();Work.end()');assert.strictEqual(run('G.trust'),before-1);assert.strictEqual(run('G.work[0].st'),'overdue');});
test('school pauses open-task deadline and disables actions',()=>{setup('oldcity');const due=run('G.work[0].due');run('G.school=1;Work.start()');assert.strictEqual(run('G.work[0].due'),due+1);assert.strictEqual(run("Work.run('case','field')"),null);});
test('invalid target does not consume action',()=>{start();assert.strictEqual(run("Act.run('hui','mayor')"),null);assert.strictEqual(run('G.acts'),3);});
test('memories deduplicate and modify only relevant votes',()=>{start();run("Work.remember('tongzhan','x','记得旧改',2,'b3');Work.remember('tongzhan','x','记得旧改',2,'b3')");assert.strictEqual(run('G.memories.tongzhan.length'),1);assert.strictEqual(run("Work.voteMemory('tongzhan','b3')"),2);assert.strictEqual(run("Work.voteMemory('tongzhan','b4')"),0);});
test('revisiting recalls the actual remembered event',()=>{start();run("Work.remember('gaoxin','x','你支持过他的项目。',1)");assert(run("Act.run('hui','gaoxin').t").includes('你支持过他的项目'));});
test('loyalty maintenance restores gradually',()=>{start();run("P('gaoxin').loyal=20;Act.run('hui','gaoxin')");assert.strictEqual(run("P('gaoxin').loyal"),55);});
test('repeated self-check has diminishing returns',()=>{start();run("G.heat=50;Act.run('hu','self');Act.run('hu','self');Act.run('hu','self')");assert.strictEqual(run('G.heat'),34);});
test('opponent plan gives warning before applying pressure',()=>{start();run("G.month=3;G.mayorPlan={kind:'pull',target:'tongzhan',start:3}");const before=run("P('tongzhan').side");run('Mayor.planTurn(50)');assert.strictEqual(run("P('tongzhan').side"),before);run('G.month=4;Mayor.planTurn(50)');assert.strictEqual(run("P('tongzhan').side"),before-6);});
test('contacting opponent target reduces next plan step',()=>{start();run("G.month=4;G.mayorPlan={kind:'pull',target:'tongzhan',start:3};G.contacts={tongzhan:4}");const before=run("P('tongzhan').side");run('Mayor.planTurn(50)');assert.strictEqual(run("P('tongzhan').side"),before-3);});
test('new task UI renders both stages and archives',()=>{setup('oldcity');assert(run('UI.tab_war()').includes('案头待办'));run("Work.run('case','field');G.month=14");assert(run('UI.tab_war()').includes('补一笔钱'));resolve('revise');assert(run('UI.tab_file()').includes('督办记录'));});
test('discovered turncoat follow-up asks for independent verification',()=>{setup('appoint');run("P('gaoxin').side=-30;Work.run('case','visit')");assert(run('G.work[0].t').includes('已经换了边'));});
test('Qingchuan later letter remembers unresolved case',()=>{setup('qingchuan',false);run("Work.run('case','field')");resolve('shelve');assert(run('SCENES.d7a.textFn()').includes('还会按程序问下去'));});
test('Qingchuan later letter remembers delivered correction',()=>{setup('qingchuan',true);run("Work.run('case','field')");resolve('family');assert(run('SCENES.d7a.textFn()').includes('认定书收到了'));});
// Isolated QA fixtures: import through the game's real save UI; never embedded in production.
start();run("G.month=12;Work.battle('b3',true);G.month=16;Work.battle('b4',true);vacate('caizheng');placeIn('caizheng','ouym','boss');Meeting.afterPlace('ouym','caizheng','boss');G.month=17;G.trust=80;G.heat=10;G.money=3;G.scene=null;G.scene2=null;G.scene3=null;G.topic=null;G.topicNext=null;G.acts=3;G.done=[];G.work[0].ready=17;G.work[0].due=20;G.seen.h30=1;G.seen.h50=1;Work.start();");
fs.mkdirSync(path.join(root,'test','fixtures'),{recursive:true});
fs.writeFileSync(path.join(root,'test','fixtures','continuity.json'),run('JSON.stringify(savePayload(),null,2)'));
console.log('\n'+checks+' continuity checks passed.');
