/* ── 常规议题。每季度一次，有议题才开。
   大部分你不跑票也能过——你的活是把材料弄对、纪要写好。
   少数几个是硬仗，基础票就是不够 ── */
var TOPICS = [

{ id:'cw_budget', topic:'财政盘子', need:5, mo:[7,55], cd:16,
  title:'全年预算调整方案上会',
  text:'年中调整，盘子要动三个亿。高振邦报上来的版本里，旧改那一块被砍了四成。\n书记昨天问了你一句：这个数是谁定的。',
  nt:'方案原样上了会。旧改那一块砍成什么样，书记是在会上才看见的',
  lean:{ mayor:-2, vice1:-3, depsec:0, zhengfa:-1, xuanchuan:0, mishuzhang:-1 },
  mats:[
    { id:'bd1', t:'常务副市长的说明', from:'市政府办', d:1, who:'vice1',
      text:'四页，全是收支缺口。砍旧改那一段只有一行：按实际进度安排。' },
    { id:'bd2', t:'市长的意见', from:'市政府办', d:1, who:'mayor',
      text:'同意政府方案。落款日期比常务副市长那份早一天。' },
    { id:'bd3', t:'去年的执行情况', from:'市财政局', d:1,
      text:'去年调整过两次，旧改那一块两次都被挪走了。挪去了哪里，表上看不出来。' }
  ],
  acts:[
    { t:'把去年两次挪账的事跟高振邦当面对一遍', d:2, eff:{vice1:+2},
      n:'他知道你看出来了，就看你摆不摆到桌面上',
      after:'他把旧改那一块从四成改成两成' },
    { t:'请书记先跟市长通个气', d:1, eff:{mayor:+2}, fx:{trust:-2},
      n:'钱的事，两个人私下说比会上说容易',
      after:'市长在会上没说话' },
    { t:'去纪守望那儿坐半小时', d:1, eff:{tongzhan:+1},
      n:'他看大多数', after:'他说到时候看' },
    { t:'请书记跟邱仲华通个气', d:1, eff:{mishuzhang:+2},
      n:'办公室的钱也在这个盘子里', after:'他说他没意见' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。散会高振邦走在你后面，说了句小刘你账算得挺细',
      failN:'退回政府重报。这一退，旧改的钱年内到不了位',
      fx:{}, passFx:{trust:+5, prestige:+3}, failFx:{trust:-4, heat:{p_mayor_boss:+10}},
      rk:{ steady:'过了就好。', strong:'谁不同意？', shrewd:'旧改那一块最后是几成？' } }
  ],
  neglect:{ trust:-5 } },

{ id:'cw_school', topic:'教育布局', need:5, mo:[10,55], cd:20,
  title:'城区中小学布局调整方案上会',
  text:'新城两所学校要建，老城三所要撤并。撤并那三所都在城关区，家长群里已经传开了。\n方静仪怕出舆情，材料她看了三遍。',
  nt:'方案上了会。撤并的通知贴出去那天，三所学校门口都站了人',
  lean:{ mayor:-1, xuanchuan:-2, zhengfa:-1, zuzhi:+1, tongzhan:+1, depsec:+1 },
  mats:[
    { id:'sc1', t:'宣传部的风险评估', from:'宣传部', d:1, who:'xuanchuan',
      text:'两页，核心一句：撤并方案公布前必须有配套的接送安排，否则舆情压不住。' },
    { id:'sc2', t:'三所学校的在校生分布', from:'市教育局', d:1,
      text:'撤并后最远的一片要多走两公里，涉及四百多个孩子。方案里没提校车。' }
  ],
  acts:[
    { t:'让教育局补一份校车方案再上会', d:2, eff:{xuanchuan:+3},
      n:'她要的就是这一页', after:'她说这下她能说话了' },
    { t:'去跟邵国栋说一声', d:1, eff:{mayor:+1}, fx:{npc:{chengguan:+6}},
      n:'撤的三所都在他地界上', after:'他说那就按市里定的办' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。开学前校车开了三条线，没出事',
      failN:'方案挂起来。半年后重新报，还是这个盘子',
      fx:{}, passFx:{rep:+5, trust:+3}, failFx:{trust:-3},
      rk:{ steady:'孩子的事要办实。', shrewd:'校车那一页是谁加的？' } },
    { t:'建议先开一次家长座谈会再上会', d:3, tier:'good', n:'',
      passN:'座谈会开了两场，方案改了两处。上会的时候一个人没反对',
      failN:'座谈会开成了诉苦会。方案还是没过',
      fx:{rep:+4, en:-4}, passFx:{rep:+6, trust:+4}, failFx:{trust:-4, rep:-2},
      rk:{ steady:'先听听家长怎么说。', strong:'座谈会开了几场？' } }
  ],
  neglect:{ rep:-4 } },

{ id:'cw_guoqi', topic:'国企改制', need:5, mo:[14,55], cd:18,
  title:'港口区两家市属国企改制方案上会',
  text:'一家改制，一家关停。职工安置一千二百人。\n崔延平昨天来了一趟，材料放下就走，一句话没多说。',
  nt:'方案上了会。职工安置那一块没人提，三个月后有人堵了区政府的门',
  lean:{ mayor:-2, vice1:-2, zhengfa:-2, jiwei:0, zuzhi:0, mishuzhang:-1 },
  mats:[
    { id:'gq1', t:'两家企业的资产评估', from:'市国资委', d:1,
      text:'评估机构是同一家，评估日期差了十一天。关停那家的地块评估价比周边低三成。' },
    { id:'gq2', t:'职工安置方案', from:'港口区', d:1, who:'gangkou',
      text:'一千二百人，买断八百，转岗四百。买断标准按的是三年前的口径。' },
    { id:'gq3', t:'政法委的稳定风险评估', from:'政法委', d:1, who:'zhengfa',
      text:'一行字：建议暂缓。下面没有理由，落款有章。' }
  ],
  acts:[
    { t:'把两份评估日期的事标出来报书记', d:2, eff:{jiwei:+1}, fx:{trust:+4, lead:+2},
      n:'标了，这件事就压不住了', after:'书记让国资委重新评一次' },
    { t:'去问韩树声那一行字是什么意思', d:2, eff:{zhengfa:+3},
      n:'他写「暂缓」，是有人跟他打过招呼', after:'他把「暂缓」改成了「同意，建议做好安置」' },
    { t:'让港口区按现行口径重算买断标准', d:2, eff:{vice1:+2}, fx:{npc:{gangkou:+8}},
      n:'重算一次多出两千多万，但这笔钱迟早要出',
      after:'崔延平说那就按新口径' },
    { t:'把安置这一块单独拎出来先议', d:1, eff:{mayor:+2, mishuzhang:+1},
      n:'一千二百人，谁也不敢说这个不重要',
      after:'市长说那就分两步走' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。安置方案后来执行得磕磕绊绊，但没出大事',
      failN:'暂缓。这一缓就缓了一年，两家企业的账越背越重',
      fx:{}, passFx:{trust:+5, prestige:+4}, failFx:{trust:-4, prestige:-3},
      rk:{ steady:'安置要做实。', strong:'一千二百人，谁负责？', shrewd:'那两份评估是一家做的？' } }
  ],
  neglect:{ trust:-5, lead:+3 } },

{ id:'cw_kuoqu', topic:'开发区扩区', need:5, mo:[9,50], cd:20,
  title:'高新区扩区申报方案上会',
  text:'扩八平方公里，要占城关区两个村。吴敬之的材料做得很漂亮，漂亮到看不出占了谁的地。\n邵国栋这两天没找你，这不太正常。',
  nt:'方案上会前一天，城关区报了一份不同意见。会没开成',
  lean:{ mayor:-2, vice1:-1, zuzhi:0, depsec:+1, xuanchuan:+1, zhengfa:-1 },
  mats:[
    { id:'kq1', t:'扩区范围图', from:'高新区', d:1,
      text:'八平方公里里有一千九百亩是城关区的。图上这两个村画成了灰色，没写名字。' },
    { id:'kq2', t:'城关区的意见', from:'城关区', d:1, who:'chengguan',
      text:'一句话：建议充分协商。这五个字他写了三遍，都被退了回去。' }
  ],
  acts:[
    { t:'把两个村的名字标回图上再呈', d:1, eff:{mayor:+2}, fx:{rep:+3, npc:{chengguan:+8}},
      n:'图上写清楚，会上才吵得起来——吵完的事才算数',
      after:'邵国栋说这样他能上会' },
    { t:'请书记出面把两个区书记叫到一起', d:2, eff:{mayor:+2}, fx:{trust:-2, npc:{chengguan:+6, gaoxin:-4}},
      n:'两个人当面谈一次，比背后递十份材料强',
      after:'谈完两边都让了一点' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。城关区那两个村的账，后来算了三年',
      failN:'没过。吴敬之在走廊上问你那张图是谁改的',
      fx:{}, passFx:{trust:+4, heat:{p_cg_gx:+15}}, failFx:{trust:-3, npc:{gaoxin:-10}},
      rk:{ steady:'两个区要协商好。', shrewd:'那张图原来是什么样？' } }
  ],
  neglect:{ trust:-4, heat:{p_cg_gx:+8} } },

{ id:'cw_anquan', topic:'安全生产', need:6, mo:[12,55], cd:14,
  title:'全市安全生产专项整治方案上会',
  text:'省里点了名，要拿出方案。化工园是重点，青川报的整治清单上有七项，其中五项是去年的老项目。\n马汉江今天打了三个电话，你接了一个。',
  nt:'方案上了会。三个月后省里来查，七项里落实了两项',
  lean:{ mayor:+1, zhengfa:+1, vice1:-2, zuzhi:0, tongzhan:+1, depsec:+1, mishuzhang:-1 },
  mats:[
    { id:'aq1', t:'青川的整治清单', from:'青川县', d:1, who:'qingchuan',
      text:'七项。逐项对下来，五项跟去年的清单一字不差，连错别字都一样。' },
    { id:'aq2', t:'省里的督办函', from:'省应急厅', d:1,
      text:'限期三个月，要报整改台账，要签责任状。最后一句：市级领导要包保到园区。' }
  ],
  acts:[
    { t:'把两份清单摆在一起标出来', d:2, eff:{zhengfa:+1}, fx:{trust:+5, rep:+3, npc:{qingchuan:-10}},
      n:'一字不差这件事，摆出来谁都下不来台',
      after:'青川连夜重报了一份' },
    { t:'按省里要求把包保领导写进方案', d:1, eff:{mayor:+1, vice1:+1},
      n:'谁包保谁签字，签了就跑不掉',
      after:'几个副市长的名字进了方案' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。责任状签的那天，马汉江签在第一个',
      failN:'方案退回重报。省里那边的期限还剩四十天',
      fx:{}, passFx:{trust:+4, rep:+4}, failFx:{trust:-5, rep:-3},
      rk:{ steady:'这个事不能走过场。', strong:'谁包保青川？', shrewd:'那五项跟去年一样？' } }
  ],
  neglect:{ trust:-6, rep:-4 } }

];

TOPICS.push(

{ id:'cw_huanbao', topic:'环保整改', need:5, mo:[16,55], cd:18,
  title:'中央环保督察反馈整改方案上会',
  text:'反馈件十一条，云州占三条，两条在梅岭的生态红线上。\n贺兰生明年就退了，他昨天在电话里说：这个事我扛不动了。',
  nt:'方案上了会。梅岭那两条后来是省里派工作组下去办的',
  lean:{ mayor:0, xuanchuan:+1, vice1:-2, zhengfa:-1, depsec:0, tongzhan:+1, mishuzhang:-1 },
  mats:[
    { id:'hb1', t:'反馈件原文', from:'省生态环境厅', d:1,
      text:'三条里有一条写着「长期未整改」。查下来，这条从五年前就在名单上。' },
    { id:'hb2', t:'梅岭的整改方案', from:'梅岭县', d:1, who:'meiling',
      text:'写得很诚恳，措施很虚。最后一段是「恳请市里在资金上给予支持」。' }
  ],
  acts:[
    { t:'把「长期未整改」那一条的五年台账调出来', d:2, eff:{mayor:+1}, fx:{trust:+4},
      n:'五年，四任分管领导。这张表摆出去，会上就没人说轻了',
      after:'书记看完说这个要写进方案' },
    { t:'去梅岭跑一趟，把措施落到人头上', d:3, eff:{xuanchuan:+1}, fx:{rep:+4, en:-4, npc:{meiling:+12}},
      n:'贺兰生要的是有人陪他扛最后一年',
      after:'他把措施改具体了，还签了名' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。梅岭那两条第二年销了号',
      failN:'方案没过。省里的销号期限又近了一个月',
      fx:{}, passFx:{trust:+4, rep:+5}, failFx:{trust:-4, rep:-3},
      rk:{ steady:'该销号的要销掉。', shrewd:'五年没整改，之前是谁在管？' } }
  ],
  neglect:{ trust:-4, rep:-4 } },

{ id:'cw_bianzhi', topic:'机构编制', need:5, mo:[18,55], cd:22,
  title:'市直机构编制调整方案上会',
  text:'十三个部门，核减四十七个编。核减的名单里，市委办占了六个。\n邱仲华把方案放在你桌上，说了句：你先看看。',
  nt:'方案原样上了会。市委办那六个编，核减的是综合科的',
  lean:{ mayor:0, zuzhi:-1, mishuzhang:-3, vice1:+1, jiwei:0, zhengfa:-1, depsec:0 },
  mats:[
    { id:'bz1', t:'各部门核减明细', from:'编办', d:1,
      text:'市委办六个里有四个是综合科的写材料岗。综合科现在满编都忙不过来。' },
    { id:'bz2', t:'秘书长的意见', from:'市委办', d:1, who:'mishuzhang',
      text:'建议市委办的核减「统筹考虑」。这四个字他用了很多年，意思是别动我的。' }
  ],
  acts:[
    { t:'把综合科的工作量统计做出来', d:2, eff:{mishuzhang:+2, zuzhi:+1}, fx:{rep:+3},
      n:'一年出多少字、几个人写，摆数字比说话管用',
      after:'编办把四个写材料岗留下了两个' },
    { t:'跟编办私下沟通，先保住市委办', d:2, eff:{mishuzhang:+3}, fx:{clean:-5},
      n:'保住了，核减的指标就得摊到别的部门头上',
      after:'市委办那六个变成了两个' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。综合科少了两个人，活没少',
      failN:'方案挂起来。省里的编制核查组下个月就到',
      fx:{}, passFx:{trust:+3}, failFx:{trust:-4, heat:{p_msz_me:+8}},
      rk:{ steady:'按编办的来。', shrewd:'市委办最后核减了几个？' } }
  ],
  neglect:{ trust:-4 } },

{ id:'cw_xinfang', topic:'信访', need:5, mo:[13,55], cd:16,
  title:'信访积案化解攻坚方案上会',
  text:'全市挂账的积案四十一件，其中十一件超过五年。青川化工园那家人的，在名单第三行。\n韩树声的意思是集中办一批，办不了的挂到明年。',
  nt:'方案上了会，办法是老办法。年底的销号率填了百分之六十一',
  lean:{ mayor:0, zhengfa:+1, vice1:-2, xuanchuan:0, depsec:0, tongzhan:0, mishuzhang:-1 },
  mats:[
    { id:'xf1', t:'四十一件的清单', from:'信访局', d:1,
      text:'十一件超五年的里，有七件的办理意见栏都写着同一句话：已做好解释工作。' },
    { id:'xf2', t:'政法委的化解方案', from:'政法委', d:1, who:'zhengfa',
      text:'集中三个月办二十件，剩下的挂账。挂账的标准是「诉求不合理」。' }
  ],
  acts:[
    { t:'把那七件「已做好解释工作」单独列出来', d:2, eff:{zhengfa:-1}, fx:{rep:+5, trust:+3},
      n:'同一句话写七遍，就等于一件没办',
      after:'韩树声把这七件从挂账里拎了出来' },
    { t:'跟青川对一下化工园那一件的进展', d:2, eff:{zhengfa:+1}, fx:{rep:+3, npc:{qingchuan:+6}},
      n:'那家人已经来了十一次', after:'青川答应这一件年内办结' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。年底销了二十六件，比方案里多六件',
      failN:'方案要求重新梳理。梳理的活落在信访局，信访局落在你这儿催',
      fx:{}, passFx:{rep:+6, trust:+3}, failFx:{rep:-3, en:-4},
      rk:{ steady:'积案要真办。', strong:'超五年的有多少？', shrewd:'那七件怎么回事？' } }
  ],
  neglect:{ rep:-5 } },

{ id:'cw_kaohe', topic:'考核办法', need:5, mo:[11,52], cd:20,
  title:'招商引资考核办法修订上会',
  text:'新办法把「实际到位资金」的权重从三成提到六成。高新区举双手赞成，三个县一个字没说。\n吴敬之的材料里有一句：考核就该拉开差距。',
  nt:'办法上了会。第二年三个县的排名全在后面，有两个县长找过你',
  lean:{ mayor:-1, vice1:+1, zuzhi:0, depsec:0, zhengfa:-1, xuanchuan:-1 },
  mats:[
    { id:'kh1', t:'三个县的资金到位情况', from:'市招商局', d:1,
      text:'三个县加起来还不到高新区的一半。不是不努力，是县里根本没有那种体量的项目。' },
    { id:'kh2', t:'高新区的修订建议', from:'高新区', d:1, who:'gaoxin',
      text:'六页。核心一句：考核就该拉开差距。' }
  ],
  acts:[
    { t:'建议县区分类考核，分开排名', d:2, eff:{mayor:+2, zhengfa:+1},
      fx:{npc:{qingchuan:+8, baisha:+8, meiling:+8, gaoxin:-6}},
      n:'县和开发区不在一条跑道上',
      after:'办法里加了一条分类考核' },
    { t:'跟吴敬之把话说开', d:1, eff:{xuanchuan:+1}, fx:{npc:{gaoxin:+6}},
      n:'他要的是拉开差距，不是把县逼死',
      after:'他说分类也行，只要开发区那档别放水' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'good', n:'',
      passN:'过了。年底排名出来，几个县长脸色都不好看',
      failN:'办法退回去重修。这一轮考核只能按老办法算',
      fx:{}, passFx:{trust:+3}, failFx:{trust:-3},
      rk:{ steady:'要实事求是。', shrewd:'分类那一条是谁加的？' } }
  ],
  neglect:{ trust:-3 } },

{ id:'cw_yiyuan', topic:'公立医院', need:6, mo:[20,55], cd:20,
  title:'公立医院综合改革方案上会',
  text:'市一院和市二院合并，床位重排。周雪的科室在名单上。\n这件事你本该回避，但材料是你手上这一份。',
  nt:'方案上了会。市一院那边的科室调整通知，周雪是在微信群里看见的',
  lean:{ mayor:+1, vice1:-2, xuanchuan:0, zhengfa:0, zuzhi:+1, depsec:+1, tongzhan:+1 },
  mats:[
    { id:'yy1', t:'两院合并方案', from:'市卫健委', d:1,
      text:'床位从两千二压到一千八，护理岗核减一百二十人。合并后的排班表还没出。' },
    { id:'yy2', t:'常务副市长的意见', from:'市政府办', d:1, who:'vice1',
      text:'同意合并，但财政补助按现行标准不增加。这一条会让核减的人数更多。' }
  ],
  acts:[
    { t:'提出回避，把材料交给别人办', d:1, eff:{}, fx:{rep:+8, clean:+3},
      n:'交出去以后这件事你就再也插不上手了',
      after:'葛守业接了。他没问为什么' },
    { t:'把护理岗核减那一段单独提示书记', d:2, eff:{vice1:-1}, fx:{trust:+4},
      n:'一百二十个人，方案里只是一个数',
      after:'书记让卫健委先出排班方案再议' }
  ],
  opts:[
    { t:'照常上会', d:1, tier:'tail', n:'',
      passN:'过了。三个月后周雪调去了二院，通勤多了四十分钟',
      failN:'方案缓议。这一缓，两家医院的人心都散了半年',
      fx:{}, passFx:{trust:+3, fam:+3}, failFx:{trust:-3},
      rk:{ steady:'人的事要安排好。', shrewd:'你爱人是不是在市一院？' } }
  ],
  neglect:{ trust:-3, fam:+2 } }

);
