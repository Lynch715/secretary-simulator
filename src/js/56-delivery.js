/* 办理结果与任职实绩。只使用原有待办、月报和档案，不增加界面。 */
var Delivery = {
  ensure: function(){
    if (!G.delivery) G.delivery = { staff:{}, lastReport:G.month, cityEcho:false };
    if (!G.delivery.staff) G.delivery.staff = {};
  },
  need: function(w){
    var p = P(w.who);
    if (p.side < 20 || p.dirt) return 'procedure';
    if (p.cap < 2) return 'capacity';
    /* 同一份任命的困难固定，读档和反复查看都不会重抽。核实后明示。 */
    var key = w.born;
    for (var i=0;i<w.who.length;i++) key += w.who.charCodeAt(i);
    return key % 3 === 0 ? 'ready' : 'funding';
  },
  inspect: function(w){
    if (w.kind === 'oldcity'){
      w.need = G.flags.b3_soft ? 'records' : 'funding';
      w.t = w.evidence ? '逐户核对后，有十七户的面积写错了。' : '承办人没有拿出逐户核对表。';
      w.t += w.need === 'funding' ? '更正后的补偿还缺一笔钱。只改表，差额仍发不下去；催进度能赶上报送日期，未签字的住户还在。' : '原来协调的补偿款还在，卡住的是面积和签字。再拨钱不能代替复核。';
      w.t += '逐户复核可一并要求住建补齐配套工程的检查、交接记录，工期要往后让。';
    } else if (w.kind === 'appoint'){
      w.need = Delivery.need(w);
      if (w.need === 'procedure'){
        w.evidence = true;
        P(w.who).known.side = 1; P(w.who).show = P(w.who).side;
        P(w.who).known.dirt = 1;
        w.t = P(w.who).side < 20 ? '核实后，他已经换了边。经费和结案意见都不能只凭他的汇报，需要独立核验。' : '核实中发现，他把一笔费用放在了往来账里。钱去了哪里，需要独立核验。再拨经费，旧账也不会自己清楚。';
      } else if (w.need === 'capacity') w.t = '经费已经到位，报表和现场却对不上。问到具体做法，他把办公室主任叫了进来。光催期限不够，需要有人带着办；安排业务骨干协办，要再占一件本月行动。';
      else if (w.need === 'funding') w.t = '现场和账目都核过了，没有发现费用问题。两项前期工作已经完成，最后一项等启动经费。只下整改通知，钱仍没有着落。';
      else w.t = '账目和现场对得上，事情已经办到最后一步。经费不缺，他也拿得出具体办法。可以按核实过的进度结案；另加一轮整改，会把时间拖长。';
    }
  },
  appointmentResult: function(w){
    var special=Talent.result(w);if(special) return special;
    var p=P(w.who), need=w.need, method=w.method, fx={}, quality=false, influence=0, t='';
    if(w.talentV && w.fit<0 && method==='trust' && need==='ready') need='capacity';
    /* 送出意见后换边或出现费用问题，核验仍按真实现状处理。 */
    if (p.side < 20 || p.dirt) need='procedure';
    if (method === 'support'){
      if (need === 'procedure'){ fx={heat:3,bossRisk:2}; influence=-1; t='经费到了，原来那笔费用仍没有解释清。你的协调意见也附在卷宗里。'; }
      else if (need === 'funding'){ fx={prestige:3}; influence=2; quality=true; t='把启动经费的每一项支出列清，补上了最后一道工序。现场验收表与报账单对得上。'; }
      else { fx={prestige:1}; influence=0; t=need === 'capacity' ? '收到了经费，仍答不上现场的问题。办公室又来问，能不能派个懂业务的人。' : '把新拨的经费列作后续维护，原有事项按原进度交来了验收表。这笔钱原本可以留给别的事。'; quality=need === 'ready'; }
    } else if (method === 'correct'){
      if (need === 'procedure'){ fx={prestige:2,heat:-2}; influence=1; t=p.side < 20 ? '交来一份落实表。你没有只听他的汇报，另请办公室核实，把未落实的两项和移交手续留在卷宗里。' : '补交了费用说明，往来账转给纪检核验。你没有替他签下结案意见。'; }
      else if (need === 'funding'){ influence=-1; t='按期限送来了整改表，最后一栏写着「经费待协调」。手续齐了，现场那道工序仍没有动。'; }
      else if (need === 'capacity'){ fx={prestige:-1}; influence=-1; t='把整改通知转给了下面，现场照旧。经费没有少，缺的是能把事情带起来的人。'; }
      else { fx={prestige:1}; influence=1; quality=true; t='重新走了一遍整改手续，交来的仍是上次核过的那份进度。事情办成了，比原定日期晚了一些。'; }
    } else if (method === 'assist'){
      fx={prestige:2}; influence=2; quality=need !== 'procedure';
      t=need === 'procedure' ? '和协办人员核对了移交表，费用疑点另行送去核验。这份手续不能替他证明清白。' : '跟着协办的业务骨干把现场走了一遍。这回报来的不是进度估计，是逐项签过字的验收表。';
    } else {
      if (need === 'procedure'){ fx={prestige:-3,heat:4,bossRisk:2}; influence=-2; t='的汇报后来被现场记录对了出来。你签过的结案意见，也一并被调走复核。'; }
      else if (need === 'ready'){ fx={prestige:2}; influence=3; quality=true; t='按核实过的进度办完了事情，没有再来问你要钱。验收表送到时，他只附了一张便笺：「请周书记放心。」'; }
      else { fx={prestige:-1}; influence=-1; t=need === 'funding' ? '交了结案报告，现场却还在等那笔钱。报告里的「完成」，比实际早了一步。' : '交了结案报告。现场核验的人回来，说只做了一半。'; }
    }
    p.loyal=clamp(p.loyal+(influence > 0 ? (influence === 3 ? 10 : 8) : influence < 0 ? -8 : 0),0,100);
    if(quality && w.talentV && w.fit<0 && method!=='assist'){
      quality=false;need='capacity';influence=0;fx.prestige=1;
      t='的经费和手续已经落实，但岗位所需的现场工作仍碰上他的短处。这一步只记进展，尚不能结案，须配互补骨干协办核验。';
    }
    w.outcome={complete:quality,handled:quality || (method === 'correct' && need === 'procedure'),need:need};
    if (quality && !p.dirt && p.side >= 20){
      p.known.dirt=1; Delivery.verify(w.who);
      if(w.talentV) G.delivery.staff[w.who].fit=w.fit;
      if (p.cap >= 2) t+='往后的日常落实，先由他自己盯，另有困难再报。';
    }
    return {fx:fx,t:pn(w.who)+t,influence:influence};
  },
  verify: function(id){
    Delivery.ensure();
    var p=P(id), s=G.delivery.staff[id];
    if (!s || s.post !== p.post) s=G.delivery.staff[id]={post:p.post,since:G.month,next:G.month+3};
    s.verified=true;
    s.checked=G.month;
  },
  reliable: function(id){
    Delivery.ensure();
    var p=P(id), s=G.delivery.staff[id];
    return !!(p && s && s.verified && s.post === p.post && p.post && holder(p.post) === id && p.by === 'boss' && !p.gone && !p.dirt && p.side >= 20 && p.loyal >= 45 && p.cap >= 2);
  },
  contact: function(id){
    var p=P(id);
    if (p && p.by === 'boss' && p.post && !p.dirt && p.known.dirt && p.side >= 20 && !(G.work || []).some(function(w){return w.kind === 'appoint' && w.who === id && w.post === p.post && (w.st === 'open' || w.st === 'waiting');})){
      Delivery.verify(id);
      return '你把他办过的两件事与原始材料对了一遍，往后的日常落实，先让他自己盯。遇到缺钱、缺人或手续不清的事，仍要另报。';
    }
    return '';
  },
  city: function(){
    var w=(G.work || []).filter(function(x){return x.kind === 'oldcity';})[0];
    if (!w || !w.outcome) return {score:0,settled:false,records:false,rushed:false};
    return w.outcome;
  },
  cityResult: function(w){
    w.outcome={score:0,settled:false,records:false,rushed:false};
    if (w.method === 'fund'){ w.outcome.settled=w.pass; w.outcome.records=!!w.evidence; w.outcome.score=w.recorded ? 2 : w.evidence ? 1 : 0; }
    if (w.method === 'revise' && w.evidence){ w.recorded=true; w.outcome.records=true; w.outcome.settled=w.pass && w.need === 'records'; w.outcome.score=w.pass ? 2 : 1; }
    if (w.method === 'press'){ w.outcome.rushed=true; w.outcome.score=-2; }
    /* 没通过的方案仍不能开工，留下的程序材料可供后来的问责核对。 */
    w.outcome.approved=w.pass;
  },
  accidentText: function(){
    var c=Delivery.city();
    if (c.records) return '你把当年督办留下的逐户表和移交记录调了出来。材料能对上当时交代过什么，现场后来怎么做的，还要查。\n';
    if (c.rushed) return '当年那张催进度的督办意见还在。施工方送来的材料里，把它复印了两份。\n';
    return '';
  },
  cityAmbush: function(){
    var c=Delivery.city();
    if (c.settled){ report('陈市长让城关再核一遍补偿。老教师带着当年的补款收据来，把盖过章的那一面放在桌上。这回没凑成原来那一队人。'); applyFx({feud:1}); }
    else if (c.records){ report('城关的拆迁户又来反映差额。办公室把当年逐户复核的表拿出来，哪些没签、哪些缺钱，一户户对。陈市长在楼下接待，仍有人留下登记。'); applyFx({prestige:-1,feud:2}); }
    else { report('城关区一百多户拆迁户坐到了市政府门口。陈立群亲自下楼接待，站在台阶上讲了半个钟头。第二天本地报纸头版是他的照片。'); applyFx({prestige:-3,feud:4}); }
  },
  turn: function(){
    Delivery.ensure();
    var d=G.delivery, c=Delivery.city(), city=(G.work || []).filter(function(w){return w.kind === 'oldcity' && w.st === 'done' && w.outcome;})[0];
    if (city && !d.cityEcho && G.month >= city.closed+6){
      d.cityEcho=true;
      report(!c.approved ? '城关把修订材料又送来了一次。原方案没有开工，补偿争议和配套手续分开列着，仍要按程序重新议事。' : c.settled ? '城关寄来一份回执。老教师的搬迁日期写在最后，补偿款已经到账，签名是他自己写的。' : c.records ? '当年旧改复核留下的争议表又送来了一次。已签的和未签的分开装订，补偿缺口仍列在最后一页。' : '旧改工期报表上盖了章。信访局另送来一张登记表，上面还是当年没签字的那几户。');
    }
    if (G.school || G.month-d.lastReport < 2) return;
    var candidates=Object.keys(d.staff).filter(function(id){return Delivery.reliable(id) && d.staff[id].next <= G.month;});
    candidates.sort(function(a,b){return d.staff[a].next-d.staff[b].next || a.localeCompare(b);});
    if (!candidates.length) return;
    var id=candidates[0], p=P(id), s=d.staff[id];
    s.next=G.month+(s.fit>0 ? 4 : s.fit<0 ? 8 : 6); s.last=G.month; d.lastReport=G.month;
    var target=Grip.channelTarget(p.post), t;
    if (target && Grip.pts(target) < 8){
      Grip.add(target,1);
      t=pn(id)+'送来一份核过原件的材料，涉及'+pn(target)+'。日期和经办人的签字都夹在后面，你不用再为这张复印件跑一趟。';
    } else if (['sw_fu','xinfang','gongan','jw_fu','shenji'].indexOf(p.post)>=0){
      applyFx({heat:-1});
      t=pn(id)+'把一份缺签字的日常报表退回去补齐。下次送来时，原始凭据也订上了。这回没有再转到你桌上。';
    } else {
      applyFx({prestige:1});
      t=pn(id)+'报来一件已经办完的小事。经费、验收、回执按顺序订好，没有另附请示。书记翻到最后，写了一个「阅」。';
    }
    report(t); logIt(t);
    Work.remember(id,'delivery_'+G.month,'这件日常工作，你交给他，他自己盯到了办结。',1);
  }
};
