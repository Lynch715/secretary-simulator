/* 后半程互斥支线：只占原有空闲月份，两幕，关键主线和既有选择编号不动。 */
Object.assign(SCENES,{
  late_handover:{title:'不是你的签字',img:'s_office',who:'boss',textFn:function(){return Strategy.routeText(false);},opts:[
    {t:'交给已经验证可靠的干部，保留原件和责任目录',fn:function(){Strategy.choose('delegate',0);},res:'承办人收走交接目录，各自补上签字。你没有再替每个人签最后一页。之后，目录还要送回来核对。'},
    {t:'先抽查关键原件与交接，再放手（行动 −1）',req:function(){return G.acts>0;},no:'本月行动已用完',fn:function(){Strategy.choose('verify',1);},res:'你抽出一件已办结事项对原件，未核到的部分单列。先把交接程序定下来，不把一次抽查写成全部工作验收。'},
    {t:'所有日常请示仍先送到自己桌上',fn:function(){Strategy.choose('self',0);},res:'办公室把流转单改了回来。下个月的文件仍先送给你，承办人的签字栏没有因此取消。'}
  ]},
  late_pending:{title:'清单最后一页',img:'s_office',who:'boss',textFn:function(){return Strategy.routeText(false);},opts:[
    {t:'核清未解决事项及现任责任（行动 −1）',req:function(){return G.acts>0;},no:'本月行动已用完',fn:function(){Strategy.choose('list',1);},res:'哪些已核、哪些缺材料、谁现在承办，分成三栏。原来没有通过的方案仍没有通过，清单不能替代批准。'},
    {t:'先安排一份临时保障，保留原争议（盘子 −1）',req:function(){return G.money>0;},no:'盘子不足',fn:function(){Strategy.choose('relief',0);},res:'临时保障单独安排，没有用来执行未经批准的完整方案。办公室把支出和原争议分成两个卷宗，后面再核交接。'},
    {t:'先处理急件，保留未办结说明',fn:function(){Strategy.choose('wait',0);},res:'目录上注明了未办结，没有划掉。办公室提醒你，交接时这一页还会送回来。'}
  ]},
  late_delivery:{title:'盖章之后',img:'s_office',who:'boss',textFn:function(){return Strategy.routeText(false);},opts:[
    {t:'抽查一处现场，核对原件（行动 −1）',req:function(){return G.acts>0;},no:'本月行动已用完',fn:function(){Strategy.choose('verify',1);},res:'抽查范围写在记录第一页。现场签收、汇总报表和原件分别归档，其余事项仍按原定程序验收。'},
    {t:'先按完成报表汇总，附件以后补',fn:function(){Strategy.choose('paper',0);},res:'报表送出去了。办公室把缺附件的几项用铅笔圈出，之后仍要核对原件。'},
    {t:'缩减下一批范围，给验收留时间',fx:{prestige:-1},fn:function(){Strategy.choose('slow',0);},res:'下一批清单缩短了。已经通过的决定没有撤回，腾出的时间用于核验执行，眼前的推进数字少了一些。'}
  ]},
  late_handover_follow:{title:'交接目录',img:'s_office',who:'boss',textFn:function(){return Strategy.routeText(true);},opts:[
    {t:'再核关键原件，缺项另列（行动 −1）',req:function(){return G.acts>0;},no:'本月行动已用完',fn:function(){Strategy.finish(true);},res:'核过的与尚未核实的分别注明，原件随卷交接。'},
    {t:'按现有经办和交接记录移交',fn:function(){Strategy.finish(false);},resFn:function(){return (G.trajectory || {}).text || '按实际记录交接，未核实的事项没有补签。';}}
  ]},
  late_pending_follow:{title:'没有划掉',img:'s_office',who:'boss',textFn:function(){return Strategy.routeText(true);},opts:[
    {t:'逐项核对原件与现任责任（行动 −1）',req:function(){return G.acts>0;},no:'本月行动已用完',fn:function(){Strategy.finish(true);},res:'未解决事项随卷移交。临时保障没有变成办结证明，原表决和办理结果均保留。'},
    {t:'保留未解决说明，按现有材料交接',fn:function(){Strategy.finish(false);},resFn:function(){return (G.trajectory || {}).text || '未解决事项继续留档。';}}
  ]},
  late_delivery_follow:{title:'附件',img:'s_office',who:'boss',textFn:function(){return Strategy.routeText(true);},opts:[
    {t:'补核缺项，原件随卷交接（行动 −1）',req:function(){return G.acts>0;},no:'本月行动已用完',fn:function(){Strategy.finish(true);},res:'补核范围与原有材料分别记录，未核实部分交现任承办，不替它补签。'},
    {t:'按现有验收记录交接',fn:function(){Strategy.finish(false);},resFn:function(){return (G.trajectory || {}).text || '按实际验收记录交接。';}}
  ]}
});
