/* 议题口风、条件分支和任内回响：沿用原有卡片与正文。 */
var Agenda = {
  next: function(){
    var items=[];
    for(var id in BATTLES){var b=BATTLES[id];if(!b.kind && !G.battles[id] && b.mo>=G.month && b.mo<=G.month+3) items.push({id:id,m:b.mo});}
    if(G.topic && !G.topicDone) items.push({id:G.topic,m:G.month});
    if(G.topicNext) items.push({id:G.topicNext.id,m:G.topicNext.m});
    items.sort(function(a,b){return a.m-b.m;});
    return items.length ? items[0].id : null;
  },
  knows: function(id,bid){return !!(G.agendaIntel && G.agendaIntel[bid] && G.agendaIntel[bid][id]);},
  concern: function(id,bid){
    var b=BATTLES[bid] || TOPIC_BY_ID[bid], d=PDEF[id] || {}, tags=b.tags || [], lines=[];
    if(b.why && b.why[id]) lines.push(b.why[id]);
    if(d.bottom && tags.indexOf(d.bottom)>=0) lines.push(BOTTOM_TXT[d.bottom]+'。');
    var broken=G.promises.filter(function(p){return p.who===id && p.st==='broken';})[0];
    var open=G.promises.filter(function(p){return p.who===id && p.st==='open';})[0];
    if(broken) lines.push('上次带来的承诺没有兑现，他又问起了那件事。');
    else if(open) lines.push('他提起你带来的承诺，还在等实际的安排。');
    if(!lines.length){
      var mod=(b.mods || {})[id] || 0;
      lines.push(mod<=-4 ? '他把方案里的责任和经费问了两遍，没有答应支持。' : mod>=4 ? '他问材料什么时候送，愿意就这件事替书记讲几句。' : '他听完方案，只说要看最后送上会的那一稿。');
    }
    return lines.join('');
  },
  inquire: function(id){
    var bid=Agenda.next();
    if(!bid || !isStanding(id) || id==='boss' || id==='mayor') return '';
    G.agendaIntel=G.agendaIntel || {};
    var table=G.agendaIntel[bid] || (G.agendaIntel[bid]={});
    table[id]={m:G.month,t:Agenda.concern(id,bid),used:!!(table[id] && table[id].used)};
    return '说到「'+(BATTLES[bid] || TOPIC_BY_ID[bid]).topic+'」，'+pn(id)+'另提了一句：'+table[id].t;
  },
  word: function(id,bid){
    if(!Agenda.knows(id,bid)) return TIER_TXT[tierOf(P(id).side)];
    var score=Meeting.score(id,Object.assign({id:bid},BATTLES[bid] || TOPIC_BY_ID[bid]));
    return score>6 ? '本题倾向支持' : score< -6 ? '本题仍有阻力' : '本题尚难判断';
  },
  talk: function(rec){
    var bid=Agenda.next(), id=rec.a;
    if(!bid || !Agenda.knows(id,bid)) return;
    var note=G.agendaIntel[bid][id];
    rec.act+='\n书记先问了你打听来的那件具体事情，没有只谈一般的支持。';
    if(!note.used){
      G.bmods[bid]=G.bmods[bid] || {};
      G.bmods[bid][id]=(G.bmods[bid][id] || 0)+(rec.d==='alt' ? 2 : 4);
      note.used=true;
    }
  },
  notes: function(id){
    var bid=Agenda.next();
    return bid && Agenda.knows(id,bid) ? (BATTLES[bid] || TOPIC_BY_ID[bid]).topic+'：'+G.agendaIntel[bid][id].t : '';
  }
};

var Story = {
  capture: function(){
    G.sceneVariants={};
    G.sceneActors={};
    if(G.scene==='b3_fight2' && own('zhujian')) G.sceneVariants.b3_fight2='ledger';
    if(G.scene==='b4_rise' && own('xinfang')) G.sceneVariants.b4_rise='register';
    if(G.scene==='b6_rise' && own('ziran')) G.sceneVariants.b6_rise='land';
    if(G.scene==='b11_fight' && Delivery.city().records) G.sceneVariants.b11_fight='archive';
    /* 人已离任，不能在新月份的戏里继续当面找他。 */
    [G.scene,G.scene2,G.scene3].forEach(function(sid){
      var sc=SCENES[sid];
      var actor=sc && (sc.who || ({b4_fight:'lihb',b10_rise:'ml_xz',b10_fight:'heqs',tr_land:'ziran',tr_petition:'xinfang',tr_hospital:'weijian'})[sid]);
      if(actor && P(actor) && P(actor).gone){G.sceneVariants[sid]='departed';G.sceneActors[sid]=actor;}
    });
  },
  scene: function(sid){
    var original=SCENES[sid], variant=(G.sceneVariants || {})[sid];
    if(!original || !variant) return original;
    var sc=Object.assign({},original); sc.opts=original.opts.map(function(o){return Object.assign({},o);});
    if(variant==='ledger'){
      sc.text=original.text+'\n住建局已经把原始补偿表送来，面积、评估单和修改日期装在同一册里。你把它放在书记手边。';
      sc.opts[2]={t:'把原始表交罗书记，请他按争议逐项协调',fx:{bmod:{b3:{depsec:14,tongzhan:4}},flag:'b3_ledger'},res:'罗明川翻到改过面积的那一页，没有再讲「通情达理」。他拿走了一份复印件，说要先找承办人。'};
    } else if(variant==='register'){
      sc.text=original.text+'\n信访局把历年的登记原件提前送来了。同一句批转意见出现了三十七次，签收日期都在。';
      sc.opts[0]={t:'按原始登记逐次核对青川的签收和答复',fx:{grip:{qingchuan:2},heat:1,meet:['lihb'],flag:'b4_register'},res:'三十七次登记和县里的答复排在一起，有三次只有签收，没有答复。你把那三页夹了出来，记下了李海滨的名字。'};
    } else if(variant==='land'){
      sc.text=original.text+'\n自然资源局送来一份原始地籍附件。老货场的土地性质变更、受让公司和经办签字都在，材料比那张规划图早到了一天。';
      sc.opts[2]={t:'核对地籍附件，再把受让公司的材料交书记',fx:{heat:1,flag:'d2_seen',bmod:{b6:{jiwei:5,zuzhi:4}}},fn:function(){Grip.add('mayor',1);},res:'你把两份批复按日期订好。受让方是立民建设，经办签字在最后一页。书记没有再问你听谁说的。'};
    } else if(variant==='archive'){
      sc.text=original.text+'\n你把当年逐户复核和配套工程移交的附件也摆上了桌。哪些要求写过、由谁签收，有原件可查；现场的监理日志仍要另调。';
      sc.opts[0]={t:'先对督办附件，再调原始监理日志',fn:function(){if(own('zhujian')) G.flags.b11_log=1;else applyFx({heat:2});Grip.add('zhujian',2);},resFn:function(){return own('zhujian') ? '督办要求、签收日期和监理日志对上了。塌方前四十天，那条基坑支护不符合设计要求的记录仍然在。' : '督办附件是齐的，监理日志却只调来一份缺页复印件。你把缺了哪几页单独列在目录上，没有拿旧附件代替现场记录。';}};
    } else if(variant==='departed'){
      var actor=(G.sceneActors || {})[sid] || original.who, who=pn(actor), post=P(actor).p;
      sc.who=null; sc.textFn=null;
      sc.text=who+'已经离任。办公室把'+post+'任内留下的材料送到了你桌上，封面还是当年的签字。\n书记翻到有折角的那一页：「人走了，事情有没有交清？」\n你把原来的处理意见、经办记录和现在承办人的说明分开放好。';
      sc.opts=[
        {t:'核对原始材料，再把疑点交现任承办人说明',fx:{trust:1,heat:1},res:'旧件和新答复按日期订在一起。你把对不上的两处另列一页，没有把前任签过的字改成现任的。'},
        {t:'请组织部、办公室按交接程序补齐记录',fx:{prestige:1},res:'缺少的交接目录补来了一份。原来的责任和现在的办理分开写，各自签了字。'},
        {t:'先按现有材料归档，保留未核实的疑点',fx:{trust:-1},res:'你在目录最后注明「尚待核实」，把卷宗放回档案柜。书记问起时，你照实报了这一项。'}
      ];
    }
    return sc;
  },
  goneWord: function(reason){return ({retire:'到龄退休',moved:'交流调任',up:'升任离岗',prov:'调离云州',diao:'调任离岗',jw:'接受审查调查',hit:'因案离任',ji:'因案离任'})[reason] || '已离任';},
  later: function(){
    var lines=[], city=(G.work || []).filter(function(w){return w.kind==='oldcity';})[0], qc=(G.work || []).filter(function(w){return w.kind==='qingchuan';})[0];
    if(city){
      if(!city.pass) lines.push('后来城关再报旧改材料，原来未通过的那一稿仍留在卷宗里。老教师问起搬迁，办公室先把核过的争议清单拿了出来。');
      else if(city.st==='done' && ((city.outcome || {}).settled || (!city.rules && city.method==='fund'))) lines.push('后来老教师收起了那张补款回执。补偿款到账那一栏，日期和签名都齐。原来每月要来登记的那一天，他没有再来。');
      else if((city.outcome || {}).records) lines.push('后来城关那份逐户复核表还在。面积核清了，未解决的差额也没有从表上删掉。接手的人先看这一页。');
      else lines.push('后来信访局换了登记本，城关旧改的未结事项又抄了一遍。老教师带来的房产证，塑封比先前更黄了。');
    }
    if(qc){
      if(qc.st==='done' && qc.method==='family' && qc.pass) lines.push('后来青川家属把更正后的认定书放进了装旧房产证的塑料袋。孩子再写到父亲的事，先把那份认定书拿出来看。');
      else if(qc.st==='done' && qc.method==='review') lines.push((qc.t || '').indexOf('收件回执')>=0 ? '后来青川卷宗里多了一份补充核查的收件回执。原结论是否变更，要看后来的正式文书；家属手里终于有了一张能问进度的凭据。' : '后来青川卷宗里留着那张补证清单。材料还没有补齐，原结论没有因此改变，家属仍按程序问进度。');
      else lines.push('后来青川家属仍按程序登记。现有结论没有因为换过几位接待人就改变，她把每一次答复都收着。');
    }
    var delivered=Object.keys((G.delivery || {}).staff || {}).filter(function(id){return G.delivery.staff[id].last && P(id);}).slice(0,2);
    delivered.forEach(function(id){var p=P(id);lines.push('后来翻任内的月报，还能找到'+p.n+'独立办结日常工作的记录。'+(p.gone ? p.n+'后来'+Story.goneWord(p.gone)+'，那几份回执仍在原来的卷宗里。' : p.side<20 ? '人后来换了边，原先实际办过的事仍照实留着。' : '表后附着验收与经办签字，没有另附一份向你催问的请示。'));});
    var river=(G.topicHistory || {}).t_river;
    if(river) lines.push(river.pass ? '后来青川河治理按通过的方案推进，园区搬迁的经费仍要逐年安排。白沙水厂把每次取水记录留了下来。' : '后来白沙水厂仍在记录停水日期。青川河治理的方案没有通过，督察意见还挂在整改台账上。');
    return lines;
  }
};
