/* 新机制仅在新月份、新议题和新任命上启用；读档不补造历史或修改在途办理。 */
var Policy = {
  start:function(){
    G.decisionV=1;
    G.policyDrafts=G.policyDrafts || {};
    G.reconsider=G.reconsider || {};
    G.topicRetry=null;
    [G.topic,G.topicNext && G.topicNext.id].forEach(function(id){
      if(id && POLICY_OPTIONS[id] && !G.policyDrafts[id] && !(G.topicHistory || {})[id]) G.policyDrafts[id]={born:G.month};
    });
    Object.keys(G.reconsider).forEach(function(id){
      var r=G.reconsider[id];
      if(G.school && (r.st==='open' || r.st==='waiting')){
        r.due=Math.min(TERM-1,r.due+1);if(r.mo) r.mo++;
        if(r.mo>=TERM){r.st='expired';report(TOPIC_BY_ID[id].topic+'：再议会期已超出任期，原记录保留。');}
      }
      if(r.st==='open' && G.month>r.due){r.st='expired';report(TOPIC_BY_ID[id].topic+'：再议期限已过，原表决与损失保留。');}
      if(r.st==='waiting' && r.mo<=G.month && !G.school){
        if(G.topic || Month.voteDue()) r.mo=Policy.slot(G.month+1,id);
        else {G.topic=id;G.topicDone=false;G.topicRetry=id;}
        if(!r.mo){r.st='expired';report(TOPIC_BY_ID[id].topic+'：任期内已无合适会期，原记录保留。');}
      }
    });
  },
  slot:function(from,except){
    for(var m=from;m<TERM;m++){
      if(TOPIC_SCHEDULE[m]) continue;
      if(Object.keys(BATTLES).some(function(id){var b=BATTLES[id];return !b.kind && b.mo===m;})) continue;
      if(Object.keys(G.reconsider || {}).some(function(id){var r=G.reconsider[id];return id!==except && r.st==='waiting' && r.mo===m;})) continue;
      return m;
    }
    return null;
  },
  active:function(id){return (G.topic===id && !G.topicDone) || !!(G.topicNext && G.topicNext.id===id);},
  option:function(id){
    var d=(G.policyDrafts || {})[id];
    return d && (POLICY_OPTIONS[id] || []).filter(function(o){return o.id===d.choice;})[0];
  },
  can:function(id,choice){
    var d=(G.policyDrafts || {})[id],o=(POLICY_OPTIONS[id] || []).filter(function(x){return x.id===choice;})[0];
    return !!(d && o && !d.choice && !G.ending && !G.school && G.acts>0 && G.money>=o.cost && Policy.active(id) && G.topicRetry!==id && Object.keys(o.mods).some(function(who){return Agenda.knows(who,id);}) && !(G.meet && G.meet.bid===id) && !(G.topicHistory || {})[id]);
  },
  amend:function(id,choice){
    if(!Policy.can(id,choice)) return null;
    var o=POLICY_OPTIONS[id].filter(function(x){return x.id===choice;})[0];
    G.acts--;G.money-=o.cost;
    G.policyDrafts[id].choice=choice;G.policyDrafts[id].m=G.month;
    var t=TOPIC_BY_ID[id].topic+'：'+o.n+'。'+o.note+'修订稿已送出，本议题不再叠加修改；仍须表决。';
    logIt(t);return {t:t};
  },
  score:function(id,who){
    var o=Policy.option(id),n=o ? o.mods[who] || 0 : 0;
    var r=(G.reconsider || {})[id];
    if(G.topicRetry===id && r) n+=r.choice==='pilot' ? ({depsec:6,tongzhan:4,vice1:4}[who] || 0) : ({jiwei:5,depsec:4}[who] || 0);
    return n;
  },
  result:function(id,pass){
    var o=Policy.option(id),t=TOPIC_BY_ID[id];
    return {fx:pass && o ? o.win : pass ? t.win : t.lose,text:pass && o ? o.text : pass ? t.winT : t.loseT,echo:pass && o ? o.echo : t.echo && (pass ? t.echo.win : t.echo.lose)};
  },
  failed:function(id){
    if(!(G.policyDrafts || {})[id] || (G.reconsider || {})[id] || !Policy.slot(G.month+2,id)) return;
    G.reconsider=G.reconsider || {};
    G.reconsider[id]={st:'open',born:G.month,ready:G.month+1,due:Math.min(TERM-1,G.month+4)};
    G.nextReport.push(TOPIC_BY_ID[id].topic+'没过。可从'+ymText(G.month+1)+'起在案头整理补证或缩小范围，限一次再议；原表决和本次损失照实保留。');
  },
  retryOptions:function(){return [
    {id:'materials',n:'补齐材料，保留完整方案范围',cost:0,note:'占一件行动。补证后再争取，原损失保留，仍可能不通过。'},
    {id:'pilot',n:'缩小范围，先报一处试点',cost:1,note:'占一件行动、盘子一份。支持较易争取，但只办理试点，不算全市方案通过。'},
    {id:'archive',n:'保留失利记录，暂不再报',cost:0,note:'占一件行动。关闭本次再议机会，未解决事项留档。'}
  ];},
  canRetry:function(id,choice){
    var r=(G.reconsider || {})[id],o=Policy.retryOptions().filter(function(x){return x.id===choice;})[0];
    return !!(r && o && r.st==='open' && r.ready<=G.month && G.month<=r.due && !G.ending && !G.school && G.acts>0 && G.money>=o.cost && (choice==='archive' || Policy.slot(G.month+1,id)));
  },
  retry:function(id,choice){
    if(!Policy.canRetry(id,choice)) return null;
    var r=G.reconsider[id],o=Policy.retryOptions().filter(function(x){return x.id===choice;})[0];
    G.acts--;G.money-=o.cost;r.choice=choice;r.prepared=G.month;
    if(choice==='archive') r.st='archived';
    else {r.st='waiting';r.mo=Policy.slot(G.month+1,id);}
    var t=TOPIC_BY_ID[id].topic+'：'+o.n+'。'+(r.st==='waiting' ? '安排在'+ymText(r.mo)+'再议；这次仍须重新表决，不能按已获批准执行。' : '原记录和未解决事项保留。');
    logIt(t);return {t:t};
  },
  retryResult:function(id,pass,hard){
    var r=(G.reconsider || {})[id];
    if(!r || r.st!=='waiting' || r.mo>G.month || G.topicRetry!==id) return;
    r.st='done';r.pass=!!pass;r.closed=G.month;r.hard=!!hard;
    var original=Policy.result(id,pass),pilot=r.choice==='pilot';
    var fx=pass ? pilot ? {prestige:1} : original.fx : {prestige:-1};
    applyFx(hard ? halfGain(fx) : fx);
    var area={t_school:'一处学区的通学与教学点安排',t_env:'一个排污口的整改验收',t_river:'一条超标生产线的停产治理'}[id];
    var text=pass ? pilot ? '再议通过的是'+area+'试点。其余范围尚未获批，不能写成全市方案完成。' : original.text : '再议仍未通过。新材料连同两次表决分别归档，原方案不能执行。';
    if(hard && pass) text+='本次由书记拍板，落实收益打折，原有代价保留。';
    r.text=text;
    G.topicHistory[id].reconsider={m:G.month,pass:!!pass,scope:pilot ? 'pilot' : 'full',choice:r.choice,hard:!!hard};
    if(G.meet && G.meet.bid===id) G.topicHistory[id].reconsider.vote={yes:G.meet.yes,rows:JSON.parse(JSON.stringify(G.meet.rows)),hard:!!G.meet.hard};
    if(pass && !pilot) Strategy.record('policy',id,true);
    if(pass && !pilot && original.echo) G.echoes.push({m:G.month+2,t:original.echo.t,fx:original.echo.fx});
    G.nextReport.push(text);logIt(TOPIC_BY_ID[id].topic+'·再议：'+text);
  },
  note:function(id){
    var o=Policy.option(id),r=(G.reconsider || {})[id],ls=[];
    if(o) ls.push('本次修订：'+o.n+'。'+o.note);
    if(G.topicRetry===id && r) ls.push('本次为唯一一次再议：'+(r.choice==='pilot' ? '仅报试点，原全市方案未获批准。' : '补齐材料，重新争取完整方案。')+'首轮失利和损失仍保留。');
    return ls.join('\n');
  }
};

var Talent = {
  unknown:function(id){var k=(G.skillIntel || {})[id];return !!(G.decisionV && CADRE_SKILLS[id] && (!k || !k.good || !k.weak));},
  domain:function(post){return POST_SKILLS[post] || (/^(cg_|qc_|bs_|ml_|gk_)/.test(post || '') ? 'people' : null);},
  fit:function(id,post){var s=CADRE_SKILLS[id],d=Talent.domain(post);return s && d ? s.good===d ? 1 : s.weak===d ? -1 : 0 : 0;},
  observe:function(id,both){
    var s=CADRE_SKILLS[id];if(!s || !G.decisionV || !P(id) || !P(id).met || P(id).gone) return '';
    G.skillIntel=G.skillIntel || {};
    var k=G.skillIntel[id] || (G.skillIntel[id]={}),lines=[];
    if(!k.good){k.good=G.month;lines.push(s.a);}else if(!k.weak){k.weak=G.month;lines.push(s.b);}
    if(both && !k.weak){k.weak=G.month;lines.push(s.b);}
    return lines.length ? pn(id)+'的办事特点：'+lines.join('') : '';
  },
  notes:function(id){var s=CADRE_SKILLS[id],k=(G.skillIntel || {})[id];return s && k ? (k.good ? s.a : '')+(k.weak ? s.b : '') : '';},
  afterAction:function(a,t){
    if(a==='kao' || a==='hui') return Talent.observe(t,false);
    if(a!=='xia') return '';
    var area=t.replace('area:','');
    var id=Object.keys(CADRE_SKILLS).filter(function(id){var p=P(id),k=(G.skillIntel || {})[id] || {};return p && p.met && !p.gone && (PDEF[id] || {}).area===area && (!k.good || !k.weak);})[0];
    return id ? Talent.observe(id,false) : '';
  },
  appointment:function(w){
    if(G.decisionV && CADRE_SKILLS[w.who]){w.talentV=1;w.fit=Talent.fit(w.who,w.post);}
  },
  inspect:function(w){
    if(!w.talentV) return;
    var note=Talent.observe(w.who,true);
    if(w.fit<0 && w.need==='ready') w.t='经费和手续已核清，但有一项关键工作超出了他熟悉的范围，现场还缺一道独立核验。';
    w.t+='\n'+(note || Talent.notes(w.who));
    if(w.fit>0) w.t+='这份岗位的主要工作与他的长项相合；经费和程序问题仍须单独解决。';
    if(w.fit<0) w.t+='岗位的主要工作碰上了他的短处。即使账面条件齐，也需要互补骨干带着核验，不能只按汇报结案。';
  },
  options:function(w){
    if(!w.talentV || w.stage!==1) return [];
    if(w.fit>0 && (w.need==='ready' || w.need==='capacity')) return [{id:'specialty',n:'按他的专长分工，逐项验收（行动 −1）'}];
    if(w.fit<0 && (w.need==='ready' || w.need==='capacity')) return [{id:'partner',n:'配互补骨干协办并验收（行动 −2）',acts:2}];
    return [];
  },
  result:function(w){
    var special=w.method==='specialty' || w.method==='partner';if(!special) return null;
    var p=P(w.who),ok=!p.dirt && p.side>=20 && (w.need==='ready' || w.need==='capacity');
    w.outcome={complete:ok,handled:ok,need:ok ? 'ready' : p.dirt || p.side<20 ? 'procedure' : w.need};
    if(ok){p.known.dirt=1;p.loyal=clamp(p.loyal+8,0,100);Delivery.verify(w.who);G.delivery.staff[w.who].fit=w.fit;}
    return {fx:ok ? {prestige:w.method==='specialty' ? 3 : 2} : {prestige:-1,heat:2},influence:ok ? 2 : -1,
      t:pn(w.who)+(ok ? w.method==='specialty' ? '按擅长的环节重新分工，把原始记录和验收逐项对齐。岗位合适，后续适岗工作可以更早交回办结记录。' : '与互补骨干一同核过现场。原来答不上来的那一项有了验收签字；后续同类事项仍需配合，不能把协办当作他已没有短处。' : '的办理条件发生了变化。原计划没有直接结案，问题留在待办，须先核清经费、立场或程序情况。')};
  }
};
