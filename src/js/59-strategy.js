/* 批示补证、可见布局与后半程支线。旧档在本月不追补，下一月才启用。 */
function validDecisionSave(g){
  function map(x){return !!x && typeof x==='object' && !Array.isArray(x);}
  function month(x){return Number.isInteger(x) && x>=1 && x<=TERM;}
  function policy(id){return Object.prototype.hasOwnProperty.call(POLICY_OPTIONS,id);}
  var keys=['policyDrafts','reconsider','skillIntel','briefNotes','topicHistory'];
  if(keys.some(function(k){return g[k]!=null && !map(g[k]);})) return false;
  if(g.decisionV!=null && g.decisionV!==1 || g.strategyV!=null && g.strategyV!==1) return false;
  if(Object.keys(g.topicHistory || {}).some(function(id){var h=g.topicHistory[id];return !Object.prototype.hasOwnProperty.call(TOPIC_BY_ID,id) || !map(h) || !month(h.m) || typeof h.pass!=='boolean';})) return false;
  if(Object.keys(g.policyDrafts || {}).some(function(id){var d=g.policyDrafts[id];return !policy(id) || !map(d) || !month(d.born) || (d.choice!=null && !POLICY_OPTIONS[id].some(function(o){return o.id===d.choice;}));})) return false;
  if(Object.keys(g.reconsider || {}).some(function(id){var r=g.reconsider[id],h=(g.topicHistory || {})[id];return !policy(id) || !map(r) || !h || h.pass!==false || ['open','waiting','done','archived','expired'].indexOf(r.st)<0 || !month(r.born) || !month(r.ready) || !month(r.due) || (r.st==='waiting' && !month(r.mo));})) return false;
  if(Object.keys(g.skillIntel || {}).some(function(id){var k=g.skillIntel[id];return !g.people[id] || !map(k) || (k.good!=null && !month(k.good)) || (k.weak!=null && !month(k.weak));})) return false;
  if(Object.keys(g.briefNotes || {}).some(function(id){var n=g.briefNotes[id];return !map(n) || !month(n.m) || (n.poll && (!map(n.poll) || !g.people[n.poll.who] || typeof n.poll.support!=='boolean'));})) return false;
  if(g.publicMoves!=null && (!Array.isArray(g.publicMoves) || g.publicMoves.some(function(x){return !map(x) || !month(x.m) || ['seat','policy','city'].indexOf(x.k)<0 || typeof x.id!=='string' || typeof x.pass!=='boolean';}))) return false;
  var r=g.trajectory;
  if(r!=null && (!map(r) || ['handover','pending','delivery'].indexOf(r.kind)<0 || !month(r.started) || !Array.isArray(r.actors) || r.actors.some(function(id){return !g.people[id];}) || (r.kind==='pending' && (!map(r.issue) || (r.issue.id!=='oldcity' && !POLICY_OPTIONS[r.issue.id]))) || (r.method && (!month(r.followAt) || ['delegate','verify','self','list','relief','wait','paper','slow'].indexOf(r.method)<0)))) return false;
  return true;
}
var Brief = {
  key:function(kind,a,b){return [kind,a || '',b || ''].join(':');},
  valid:function(r){
    if(!r || !r.brief || r.d!=='no' || !G.strategyV || G.ending || G.month-r.m>3) return false;
    if(Brief.resubmitted(r)) return false;
    if(r.kind==='talk') return Props.talkTargets().indexOf(r.a)>=0;
    if(r.kind==='nom') return !!POST_BY_ID[r.b] && vacant(r.b) && Props.nominees(r.b).indexOf(r.a)>=0;
    return r.kind==='prov' && Props.canProv();
  },
  resubmitted:function(r){return !!(r && r.brief && (G.propLog || []).some(function(p){return p.no>r.no && p.d!=='no' && Brief.key(p.kind,p.a,p.b)===r.brief.key;}));},
  gap:function(kind,a,b){
    if(!G.strategyV) return null;
    var type=G.bossType,p=P(a),key=Brief.key(kind,a,b),note=(G.briefNotes || {})[key],fresh=note && G.month-note.m<=3;
    if(kind==='nom' && p){
      if(type==='steady' && (!p.known.side || !p.known.dirt)) return {id:'background',n:'补核人选履历与底细',t:'「履历和核查意见再对一遍。没查清的地方，别替他写清楚。」',action:'kao'};
      if(type==='strong' && p.cap<2) return {id:'ability',n:'另选能承担岗位工作的人选',t:'「这个岗位要有人扛得住。人选换一个，别只换材料封面。」'};
      if(type==='strong' && CADRE_SKILLS[a] && !Talent.notes(a)) return {id:'experience',n:'考察人选实际办事特点',t:'「他究竟能干哪一摊？给我看核实过的情况。」',action:'kao'};
      if(type==='strong' && !CADRE_SKILLS[a] && (!p.known.side || !p.known.dirt)) return {id:'background',n:'核对人选考察意见',t:'「先把这个人实际做过的事和考察意见核清。」',action:'kao'};
      if(type==='shrewd' && !(fresh && note.poll && note.poll.support && isStanding(note.poll.who) && !P(note.poll.who).gone)) return {id:'votes',n:'摸清一位常委对本次人选的态度',t:'「上会以后，谁愿意支持这个人？先问清楚，口风也不是保证票。」',action:'poll'};
    }
    if(kind==='talk'){
      var bid=Agenda.next();
      if(bid && !Agenda.knows(a,bid)) return {id:'concern',n:'先打听他对当前议题的具体顾虑',t:type==='strong' ? '「找他谈哪件具体的事？先把他卡在哪儿弄清。」' : type==='shrewd' ? '「他要的是什么，先摸准。别一见面就把底亮完。」' : '「先问清他对方案的意见，再约来谈。」',action:'modi'};
    }
    if(kind==='prov' && !(fresh && note.work)) return {id:'delivery',n:'整理一份真实办结材料再报',t:type==='strong' ? '「拿一件真办成的事来，我带着去。」' : type==='shrewd' ? '「省里问起来，哪一份原件拿得出来？」' : '「先把办结和验收材料按程序对齐。」',action:'delivery'};
    return null;
  },
  attach:function(r){
    if(!G.strategyV || ['nom','talk','prov'].indexOf(r.kind)<0) return;
    var gap=Brief.gap(r.kind,r.a,r.b);
    r.brief={key:Brief.key(r.kind,r.a,r.b),need:gap && gap.id};
    r.remark=gap ? gap.t : '「现有材料看过了。这件事仍先缓一缓。」';
  },
  bonus:function(kind,a,b){
    if(!G.strategyV || Brief.gap(kind,a,b)) return 0;
    var key=Brief.key(kind,a,b);
    return (G.propLog || []).some(function(r){return r.d==='no' && r.brief && r.brief.key===key && r.brief.need && G.month-r.m<=3;}) ? 0.12 : 0;
  },
  receipt:function(no){return (G.propLog || []).filter(function(r){return r.no===no && r.brief;})[0];},
  candidates:function(){return G.stand.filter(function(id){return id!=='boss' && id!=='mayor' && !P(id).gone;});},
  proof:function(){return (G.work || []).filter(function(w){return w.st==='done' && w.outcome && w.outcome.complete;})[0];},
  can:function(no,who){
    var r=Brief.receipt(no);if(!Brief.valid(r) || G.school || G.acts<=0 || r.brief.touched===G.month) return false;
    var gap=Brief.gap(r.kind,r.a,r.b);if(!gap || !gap.action) return false;
    if(gap.action==='poll') return who ? Brief.candidates().indexOf(who)>=0 : Brief.candidates().length>0;
    if(gap.action==='delivery') return !!Brief.proof();
    return Act.targets(gap.action).indexOf(r.a)>=0;
  },
  prepare:function(no,who){
    if(!Brief.can(no,who)) return null;
    var r=Brief.receipt(no),gap=Brief.gap(r.kind,r.a,r.b),result,key=r.brief.key;
    if(gap.action==='poll'){
      if(!who) return null;
      result=Act.run('modi',who);
      var score=Meeting.support(who,r.a,'boss',r.b,true),support=score>0;
      G.briefNotes=G.briefNotes || {};G.briefNotes[key]={m:G.month,poll:{who:who,support:support}};
      result.t+='\n说到'+pn(r.a)+'任'+POST_BY_ID[r.b].n+'，'+pn(who)+(support ? '表示愿意考虑支持，但以正式上会材料为准。' : '仍有保留，没有答应支持。');
    } else if(gap.action==='delivery'){
      var w=Brief.proof();G.acts--;
      G.briefNotes=G.briefNotes || {};G.briefNotes[key]={m:G.month,work:w.id};
      result={t:'你把'+Work.title(w)+'实际办结的验收与原始材料订在一起，未完成事项另列，没有写成已经全部解决。'};
    } else result=Act.run(gap.action,r.a);
    if(!result) return null;
    r.brief.prepared=G.month;r.brief.touched=G.month;
    G.props.forEach(function(p){if(p.no===r.no && p.brief) p.brief=JSON.parse(JSON.stringify(r.brief));});
    result.t+='\n原退件记录保留。'+(Brief.gap(r.kind,r.a,r.b) ? '仍有缺项，补齐后再呈报；书记仍可能不批。' : '相关缺项已经补齐，可重新呈报，仍占一次呈报机会，书记仍可能不批。');
    return result;
  }
};

var Strategy = {
  startMonth:function(){G.strategyV=1;G.publicMoves=G.publicMoves || [];},
  record:function(k,id,pass){
    if(!G.strategyV) return;
    if(G.publicMoves.some(function(x){return x.k===k && x.id===id && x.m===G.month;})) return;
    G.publicMoves.push({m:G.month,k:k,id:id,pass:!!pass});
    if(G.publicMoves.length>16) G.publicMoves.shift();
  },
  plan:function(swing){
    if(!G.strategyV) return null;
    var moves=(G.publicMoves || []).filter(function(x){return G.month-x.m<=8;}),seats=moves.filter(function(x){return x.k==='seat';}).length;
    if(seats>=2 && swing.length) return {kind:'pull',goal:'seats',target:swing[0],start:G.month};
    if(moves.some(function(x){return (x.k==='policy' || x.k==='city') && x.pass;})) return {kind:'budget',goal:'implementation',target:null,start:G.month};
    return null;
  },
  scene:function(){
    if(!G.strategyV || G.school || G.month<30) return null;
    var r=G.trajectory;
    if(r){
      if(!r.done && r.method && G.month>=r.followAt && !G.seen['late_'+r.kind+'_follow']) return 'late_'+r.kind+'_follow';
      return null;
    }
    if(G.month>50) return null;
    var city=(G.work || []).filter(function(w){return w.kind==='oldcity';})[0];
    var outstanding=city && !(city.st==='waiting' && city.resolve<=G.month) && Strategy.issueOpen({id:'oldcity'}) ? {id:'oldcity',title:'城关旧改未结事项'} : null;
    if(!outstanding) Object.keys(G.topicHistory || {}).some(function(id){var h=G.topicHistory[id];if(POLICY_OPTIONS[id] && !h.pass && !(h.reconsider && h.reconsider.pass && h.reconsider.scope==='full')){outstanding={id:id,title:TOPIC_BY_ID[id].topic};return true;}return false;});
    var staff=Object.keys((G.delivery || {}).staff || {}).filter(Delivery.reliable);
    var wins=Object.keys(G.topicHistory || {}).filter(function(id){var h=G.topicHistory[id];return h.pass || (h.reconsider && h.reconsider.pass && h.reconsider.scope==='full');});
    var kind=outstanding ? 'pending' : staff.length>=2 ? 'handover' : wins.length>=3 || G.won>=4 ? 'delivery' : null;
    if(!kind) return null;
    G.trajectory={kind:kind,started:G.month,actors:staff.slice(0,2),issue:outstanding,done:false};
    return 'late_'+kind;
  },
  issueOpen:function(issue){
    if(!issue) return false;
    if(issue.id==='oldcity') return !(G.work || []).some(function(w){return w.kind==='oldcity' && w.pass && ((w.outcome || {}).settled || (!w.rules && w.st==='done' && w.method==='fund'));});
    var h=(G.topicHistory || {})[issue.id];
    return !!(h && !h.pass && !(h.reconsider && h.reconsider.pass && h.reconsider.scope==='full'));
  },
  choose:function(method,cost){
    var r=G.trajectory;if(!r || r.method || G.ending || G.acts<(cost || 0)) return;
    G.acts-=cost || 0;
    if(method==='relief'){if(G.money<1) return;G.money--;applyFx({trust:2});}
    r.method=method;r.followAt=G.month+3;
    logIt('任内后续：'+{delegate:'交给可靠干部按程序交接',verify:'抽查原件与现场',self:'仍集中到自己手里',list:'核清未解决事项及现任责任',relief:'只安排临时保障，原争议保留',wait:'先保留未办结说明',paper:'先按汇总报表报送',slow:'缩减下一批范围，留出验收时间'}[method]+'。');
  },
  routeText:function(follow){
    var r=G.trajectory || {},kind=r.kind,later=Math.max(0,G.month-(r.started || G.month))+'个月后，';
    if(kind==='handover'){
      var names=(r.actors || []).map(pn).join('、') || '承办干部';
      return follow ? later+'交接目录又送到桌上。'+names+'当时办过的工作仍留着经办签字。'+((r.actors || []).every(Delivery.reliable) ? '目前承办人仍在原岗，可靠的办理记录还在继续。' : '有人已离任或办理条件变了，旧签字不能代替现任的核验。') : '你提上去的干部已经有实际办结记录。'+names+'把一批日常事项办完后，来问今后的交接能不能由他们按程序承担。\n你桌上的请示少了，验收和责任却不能少。换届前，谁保管原件、谁核验最后一项，要先定下来。';
    }
    if(kind==='pending') return follow ? later+'「'+(r.issue || {}).title+'」又列进交接目录。'+(Strategy.issueOpen(r.issue) ? '临时保障、补证清单和正式批准分开装订；尚未解决的事项不能因为换了一本台账就消失。' : '后来实际补办的回执已经送到，原来未结的记录也保留着，两份材料按日期分别归档。') : '换届前的清单送到了办公室。「'+(r.issue || {}).title+'」仍没有完整办结。\n原来的决定和后来的办理都在，现任承办人问：先安排临时保障，还是先把尚未解决的部分逐项核清？这份清单不能当作原方案已经获批的证明。';
    return follow ? later+'执行与验收材料送来了。'+(r.method==='paper' ? '几份汇总表没有附完整原件，不能只凭盖过章就写成已经全部落实。' : r.method==='slow' ? '下一批范围收小了，空出的时间用于核验；上一批的决定没有被改写。' : '抽查记录、现场签收和汇总表分开装订，哪些已核、哪些待核，一页一页列明。') : '前半任几项决定已经通过。办公室准备把推进情况汇总上报，几份附件却还没有核过原件。\n会上争取到了支持，落实还要有另一套本事。接着铺下一批，还是把已经铺开的几件事先核清，要你拿意见。';
  },
  finish:function(check){
    var r=G.trajectory;if(!r || r.done || !r.method || G.ending || G.school || G.month<r.followAt || (check && G.acts<1)) return;
    if(check) G.acts--;
    r.done=true;r.closed=G.month;r.checked=!!check;
    if(r.kind==='pending'){
      var listed=r.method==='list',open=Strategy.issueOpen(r.issue);
      r.text=!open ? '后来实际补办的回执与原未结记录分开归档，办理日期照实保留。没有把后来的结果改写成当时已经办结。' : check || listed ? '交接时逐项核过原始记录，未解决事项和现任责任分别列明。临时保障没有写成争议已经解决，原批准状态照实保留。' : '按现有记录交接，未解决事项继续留档。接手的人仍需核验，台账上没有盖全部办结的章。';
      applyFx(check ? {prestige:1,heat:-2} : listed ? {prestige:2,heat:-2} : r.method==='relief' ? {prestige:1} : {trust:-1});
    } else {
      var safe=r.kind==='handover' ? r.method==='verify' || (r.method==='delegate' && r.actors.every(Delivery.reliable)) : r.method==='verify' || r.method==='slow';
      r.text=check ? '原件与交接清单重新核过。缺项另列给现任承办人，没有替未核实的事项补签。' : safe ? '原件、经办和交接目录对齐，下一批仍按实际验收安排，没有再把每一份日常请示送到你桌上。' : '汇总表留了下来，缺少的原件也照实列了出来。接任者还要核验，前半任的成绩不能替后面的缺项签字。';
      applyFx(check ? {prestige:1,heat:-2} : safe ? {prestige:2,trust:1} : {prestige:-1,heat:3});
    }
    report(r.text);logIt('任内后续：'+r.text);
  },
  epilogue:function(){var r=G.trajectory;return r && r.done ? r.text : '';}
};
