/* 持续待办：表决以后还要办事。沿用每月三次行动，不另开一套资源。 */
var Work = {
  ensure: function(){
    G.work = G.work || [];
    G.workSeen = G.workSeen || {};
    G.memories = G.memories || {};
  },
  add: function(id, kind, who, post, pass){
    Work.ensure();
    if (G.workSeen[id]) return;
    G.workSeen[id] = 1;
    G.work.push({ id:id, kind:kind, who:who, post:post || null, pass:!!pass,
      born:G.month, ready:G.month + 1, due:G.month + 4, stage:0, st:'open', method:null, t:'' });
    G.nextReport.push(kind === 'appoint' ? pn(who) + '的任命文件发下去了。书记让你过一个月去看看，不只听汇报。' :
      kind === 'oldcity' ? '城关旧改的表决结束了。书记把材料退给你：「会开完了，底下的事还得有人盯。」' :
      '青川的通报到了。书记把信访登记放在通报旁边：「这两份东西，还得对上。」');
  },
  battle: function(bid, pass){
    if (bid === 'b3') Work.add('oldcity', 'oldcity', holder('cg_qz') || 'cg_quzhang', 'cg_qz', pass);
    if (bid === 'b4') Work.add('qingchuan', 'qingchuan', 'lihb', null, pass);
  },
  appoint: function(id, post){
    Work.add('appoint_' + id + '_' + G.month, 'appoint', id, post, true);
    Work.remember(id, 'appointed_' + G.month, '这个位子，是你报的人选。', 1);
  },
  active: function(){ return (G.work || []).filter(function(w){ return w.st === 'open' && w.ready <= G.month; }); },
  title: function(w){ return w.kind === 'oldcity' ? '城关旧改·落地' : w.kind === 'qingchuan' ? '青川旧账·回访' : pn(w.who) + '·到任回访'; },
  description: function(w){
    if (w.stage === 1 || w.st === 'waiting') return w.t;
    if (w.kind === 'oldcity') return w.pass ? '方案过了。补偿表还是旧的，住建和城关各说各的。先去现场，或者先问清承办人的口风。' : '方案没过。老教师又来了一趟，问下一步怎么办。先把争议摸清，才能知道该改哪一页。';
    if (w.kind === 'qingchuan') return w.pass ? '事故性质改了，家属还没拿到更正后的认定书。李海滨说，县里仍有人压着旧卷宗。' : '原结论维持。家属又来登记了。李海滨愿意谈，但只肯谈他亲眼见到的那一段。';
    return '任命已经一个月。' + pn(w.who) + '报来的材料很好看，书记要你核实：人到了，事有没有动。';
  },
  options: function(w){
    if (w.stage === 0){
      if (w.kind === 'oldcity') return [ {id:'field',n:'去城关核对补偿表',a:'xia',t:'area:chengguan'}, {id:'talk',n:'先找承办人打听',a:'modi',t:Work.cityWho()} ];
      if (w.kind === 'qingchuan') return [ {id:'field',n:'去青川调研回访',a:'xia',t:'area:qingchuan'}, {id:'check',n:'考察李海滨，核实材料',a:'kao',t:w.who} ];
      return [ {id:'visit',n:'回访本人，核实落实情况',a:'hui',t:w.who}, {id:'check',n:'考察本人，核实履历和底细',a:'kao',t:w.who} ];
    }
    if (w.kind === 'oldcity') return [ {id:'fund',n:'补一笔钱，修正补偿（盘子 −1）',cost:1}, {id:'revise',n:'逐户复核，缩小争议范围'}, {id:'press',n:'催进度，先按现有表推进（反扑会加重）'} ];
    if (w.kind === 'qingchuan') return [ {id:'review',n:'把核实材料送纪委复核'}, {id:'family',n:'把书面答复送到家属手里'}, {id:'shelve',n:'按现有结论归档（家属仍会来）'} ];
    return [ {id:'support',n:'协调一笔启动经费（盘子 −1）',cost:1}, {id:'correct',n:'定下整改期限，下个月核验'}, {id:'trust',n:'按他的汇报结案'} ];
  },
  cityWho: function(){ return holder('cg_qz') || holder('cg_sj') || 'cg_quzhang'; },
  can: function(w, o){
    if (!w || w.st !== 'open' || w.ready > G.month || G.school || G.acts <= 0 || w.touched === G.month) return false;
    return o.a ? Act.targets(o.a).indexOf(o.t) >= 0 : G.money >= (o.cost || 0);
  },
  run: function(id, choice){
    var w = (G.work || []).filter(function(x){ return x.id === id; })[0];
    if (!w) return null;
    var o = Work.options(w).filter(function(x){ return x.id === choice; })[0];
    if (!o || !Work.can(w,o)) return null;
    if (o.a) return Act.run(o.a,o.t);
    G.acts--; G.money -= o.cost || 0; w.touched = G.month; w.method = choice; w.st = 'waiting'; w.resolve = G.month + 1;
    w.plan = o.n.replace(/（.*）/, '');
    w.t = '办理意见：' + w.plan + '。已经送出，下个月核验结果。';
    logIt(Work.title(w) + '：' + o.n.replace(/（.*）/, '') + '。');
    return {t:'你把办理意见写在材料最后一页，注明了核验的月份。',got:'下个月有结果；本月行动 −1'};
  },
  afterAction: function(a,t){
    var hit = Work.active().filter(function(w){
      if (w.stage !== 0 || w.touched === G.month) return false;
      return Work.options(w).some(function(o){ return o.a === a && o.t === t; });
    })[0];
    if (!hit) return '';
    var o = Work.options(hit).filter(function(o){ return o.a === a && o.t === t; })[0];
    hit.stage = 1; hit.method = o.id; hit.touched = G.month; hit.ready = G.month + 1; hit.due = G.month + 3;
    if (hit.kind === 'oldcity'){
      hit.evidence = o.id === 'field' || own('zhujian') || own('cg_qz');
      hit.t = hit.evidence ? '逐户核对后，有十七户的面积写错了。先复核补偿，还是先催施工，要你拿意见。' : '承办人只保证不会出事，没有拿出逐户核对表。下个月需要定下办理意见。';
    } else if (hit.kind === 'qingchuan'){
      hit.evidence = o.id === 'field' || Grip.level('qingchuan') >= 2 || G.flags.b4_pages || G.flags.b4_song;
      hit.t = hit.pass ? '家属要的不是一句「已处理」，是盖章的认定书。县里还没有送到。' : '李海滨把现场时间重新排了一遍。' + (hit.evidence ? '旧报告有一处对不上，材料可以送去复核。' : '目前只有口述，直接要求翻案还缺材料。');
    } else {
      var p = P(hit.who);
      hit.evidence = a === 'kao' || p.known.dirt;
      hit.t = p.side < 20 && p.known.side ? '回访核实后，他已经换了边。经费和结案意见都不能只凭他的汇报，需要独立核验。' : p.dirt && hit.evidence ? '核实中发现，他把一笔费用放在了往来账里。需要整改，不能只拨钱。' : p.cap >= 2 ? '有两件事确实动了，另有一件卡在经费和部门协调上。' : '材料写得很满，现场进度落后。经费之外，还缺一个肯盯落实的人。';
    }
    logIt(Work.title(hit) + '：已经核实，下个月定办理意见。');
    return '待办有了进展：' + hit.t;
  },
  start: function(){
    (G.work || []).forEach(function(w){
      if (G.school && w.st === 'open'){ w.due++; if(w.ready > G.month) w.ready++; }
      if ((w.st === 'open' || w.st === 'waiting') && w.kind === 'appoint' && (!P(w.who) || P(w.who).gone || holder(w.post) !== w.who)){
        Work.finish(w,'void','人已经离任。这份到任回访归档，原来的任命不再当作现任。',{}); return;
      }
      if (w.st === 'waiting' && w.resolve <= G.month) Work.resolve(w);
    });
  },
  resolve: function(w){
    var fx = {}, t, influence = 0;
    if (w.kind === 'oldcity'){
      var owner = Work.cityWho(); w.who = owner;
      if (w.method === 'fund') { fx = {prestige:3,trust:1}; t = '补偿表重新核了一遍。十七户补了差额，老教师在签字前又问了一遍搬迁日期。'; influence = 2; }
      if (w.method === 'revise') { var ok = w.evidence || own('zhujian') || own('cg_qz'); fx = ok ? {prestige:3,feud:-2} : {prestige:1}; t = ok ? '逐户复核表盖了章。争议缩到了三户，原定的施工日期往后推了半个月。' : '复核表只交来半份。施工没有强推，三户的争议记在督办单上，月底仍要反馈。'; influence = ok ? 2 : 0; }
      if (w.method === 'press') { fx={prestige:1,heat:5,feud:3}; t='工期赶上了。老教师家那一户没有签字，信访局的新登记本上又出现了他的名字。'; influence=-2; }
      if (!w.pass) t = '常委会没过的原方案没有开工。' + t + '修订后的补偿材料留给下一次议事，不能拿这份督办单当开工批文。';
    } else if (w.kind === 'qingchuan'){
      if (w.method === 'review') { var strong = w.evidence || own('jw_fu'); fx = strong ? {prestige:3,trust:2,heat:2} : {heat:2}; t = strong ? '宋自强收了补充材料，按程序补做核查。家属拿到了书面收件回执，旧报告的疑点列进了核查清单。' : '纪委退回一张补证清单。李海滨的口述记进了卷宗，原结论没有因此改变。'; influence = strong ? 2 : 0; }
      if (w.method === 'family') { fx = w.pass ? {trust:2,prestige:2} : {trust:1}; t = w.pass ? '更正后的认定书送到了家属手里。她逐字看完，折好，放进装旧房产证的塑料袋。' : '你把现有结论和复核途径写清，亲手交给家属。她收下了，问下个月还能不能来。你说能。'; influence=2; }
      if (w.method === 'shelve') { fx={prestige:-2}; t='卷宗按现有结论归档。下个月初，家属照样来了，登记的人换了一个，批转意见还是那一句。'; influence=-2; }
    } else {
      var p=P(w.who), bad=(p.dirt && (w.evidence || p.known.dirt)) || (p.side < 20 && p.known.side), turned=p.side < 20 && p.known.side;
      if (w.method === 'support') { fx=bad ? {heat:3,bossRisk:2} : {prestige:p.cap >= 2 ? 3 : 1}; t=bad ? pn(w.who)+(turned ? '收了经费，却把落实工作交给市政府那边协调。你签过的经费意见留在了卷宗里。' : '收了经费，往来账仍没有解释清。你的协调意见也附进了材料。') : pn(w.who)+'报来了第一件办成的事。'+(p.cap >= 2 ? '经费之外，他把另一个部门也拉到了现场。' : '进度慢了一点，总算有一件能对上。'); influence=bad ? -1 : 2; }
      if (w.method === 'correct') { fx={prestige:2,heat:bad ? -2 : 0}; t=pn(w.who)+(turned ? '交来一份落实表。你没有只听他的汇报，另请办公室核实，把未落实的两项列进整改清单。' : bad ? '补交了费用说明，往来账转给纪检核验。你没替他把问题压下去。' : '按期补交了整改表。你让办公室去现场对了一遍，才在督办单上签字。'); influence=1; }
      if (w.method === 'trust') { fx=bad ? {prestige:-3,heat:4,bossRisk:2} : p.cap >= 2 ? {prestige:2} : {prestige:-2}; t=bad ? pn(w.who)+(turned ? '按市政府那边的安排办了。你签过的结案意见和现场情况对不上，也被调出来复核。' : '的那笔费用后来被问到了。你签过的结案意见也被调了出来。') : p.cap >= 2 ? pn(w.who)+'把事办成了，汇报里的数字和现场对得上。' : '核验的人回来，说'+pn(w.who)+'报的进度，现场只做了一半。'; influence=bad ? -2 : p.cap >= 2 ? 2 : -1; }
      p.loyal=clamp(p.loyal+(influence > 0 ? 8 : -8),0,100);
    }
    Work.finish(w,'done',t,fx);
    Work.remember(w.who,'work_'+w.id,t,influence,w.kind === 'oldcity' ? 'b3' : w.kind === 'qingchuan' ? 'b4' : null);
  },
  finish: function(w,st,t,fx){
    w.st=st; w.closed=G.month; w.t=t; applyFx(fx);
    report(Work.title(w)+'：'+t); logIt(Work.title(w)+'：'+t);
  },
  end: function(){
    (G.work || []).forEach(function(w){
      if (w.st !== 'open' || G.month < w.due) return;
      var t = w.kind === 'oldcity' ? '办理期限到了，补偿争议仍没有核清。老教师又来登记，办公室把未办结情况报给了书记。' : w.kind === 'qingchuan' ? '回访期限到了，家属没有收到新的书面答复。信访登记又添了一页。' : pn(w.who)+'到任后的回访一直没有安排。书记问起落实情况，你手里只有他自己报的材料。';
      Work.finish(w,'overdue',t,{trust:-1,prestige:-1});
      Work.remember(w.who,'overdue_'+w.id,'你说过会来核实，最后没有来。',-1);
    });
  },
  remember: function(id,key,t,v,topic){
    Work.ensure(); if (!id || !P(id)) return;
    var ms=G.memories[id] || (G.memories[id]=[]);
    if (ms.some(function(x){return x.key===key;})) return;
    ms.push({key:key,m:G.month,t:t,v:v||0,topic:topic||null});
    if(ms.length > 12) ms.shift();
  },
  recall: function(id){
    var ms=(G.memories || {})[id] || [];
    var last=ms[ms.length-1]; if(!last) return '';
    return pn(id)+'还记着'+ymText(last.m)+'的事：'+last.t;
  },
  voteMemory: function(id,topic){
    return clamp(((G.memories || {})[id] || []).filter(function(x){return x.topic===topic;}).reduce(function(s,x){return s+x.v;},0),-4,4);
  },
  sceneMemory: function(sid,o){
    var sc=SCENES[sid];
    if (!sc || !o.fx || !o.fx.side) return;
    Object.keys(o.fx.side).forEach(function(id){
      if (!o.fx.side[id]) return;
      Work.remember(id,'scene_'+sid,'那次'+sc.title+'，你选的是：'+fill(o.t)+'。',o.fx.side[id]>0 ? 1 : -1,sc.battle);
    });
  }
};
