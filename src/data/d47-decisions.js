/* 三个议题的实质修订。未选择时完整沿用原方案；修订不改变一般立场。 */
var POLICY_OPTIONS = {
  t_school:[
    {id:'bus',n:'先落实校车，再分批撤并',cost:1,mods:{xuanchuan:10,depsec:3},
      note:'占一件行动、盘子一份。先保障通学，撤并分批完成，近期政绩较少。',
      win:{prestige:2,side:{xuanchuan:2}},
      text:'修订稿通过：先落实校车和接送点，再分批撤并学校。第一批的范围比原稿小，未撤的学校继续办学。',
      echo:{t:'第一批校车开通了。家长在接送点核过名单，第二批撤并仍要等线路验收，不能按全市完成报成绩。',fx:{prestige:1}}},
    {id:'retain',n:'保留低年级教学点，增加日常保障',cost:0,mods:{xuanchuan:7,mishuzhang:-5},
      note:'占一件行动。低年级就近上学；保留原有教师与校舍，腾不出保障资源，近期政绩较少，秘书长方面也有阻力。',
      win:{prestige:1,side:{xuanchuan:5,mishuzhang:-3}},
      text:'修订稿通过：低年级教学点保留，高年级按线路调整。学校名单缩短了，教师和校舍保障经费仍由市里安排。',
      echo:{t:'老城保留下来的教学点开了学。新城的校舍投入使用，老城的教师仍要排班，两头的保障都列在年度计划里。',fx:{}}}
  ],
  t_env:[
    {id:'stages',n:'先封堵排污口，整改责任分段验收',cost:1,mods:{vice1:6,zhengfa:4,jiwei:-3},
      note:'占一件行动、盘子一份。先消除眼前排污，后续整改逐段验收；纪律责任保留，督察风险下降较少。',
      win:{prestige:3,bossRisk:-1},
      text:'修订稿通过：两个排污口先封堵，其余整改逐段列出责任人和期限。原来的责任没有免掉，最后一段还要另验。',
      echo:{t:'第一段整改通过核验。余下两段仍在台账上，督察组要求逐段报原始记录，没有按全部销号计算。',fx:{bossRisk:-1}}},
    {id:'audit',n:'先核原始凭据，保留逐项问责',cost:0,mods:{jiwei:7,vice1:-5,zhengfa:-3},
      note:'占一件行动。保留完整整改与问责范围，增加纪委支持，也会加重另一侧阻力；通过后分歧增加。',
      win:{prestige:4,bossRisk:-3,feud:3},
      text:'修订稿通过：原始凭据列为验收附件，整改和责任核查分开签字。经办人要求复印会议纪要，谁也没有提前离席。',
      echo:{t:'整改材料按原件逐项复核。两个排污口封堵完成，责任核查另有卷宗，没有拿工程验收代替责任结论。',fx:{bossRisk:-2}}}
  ],
  t_river:[
    {id:'reserve',n:'市里先落实启动经费，保留搬迁期限',cost:1,mods:{zhengfa:9,depsec:4,vice1:-3},
      note:'占一件行动、盘子一份。仍按三年搬迁；市里先承担启动经费，通过后的后续拨款还需一份盘子。',
      win:{prestige:4},
      text:'修订稿通过：市里先承担启动经费，三年搬迁的期限保留。青川县在责任书上签字，后续拨款仍按验收安排。',
      echo:{t:'园区拆了第一套反应釜。启动经费已经列过，后续搬迁款按本次验收另拨，青川县把收据和验收表一起送来了。',fx:{money:-1}}},
    {id:'monitor',n:'先停超标生产线，分批搬迁并公开监测',cost:0,mods:{zhengfa:4,tongzhan:4,gaoxin:-4},
      note:'占一件行动。保留三年搬迁和问责，先停超标生产线；通过后近期威信收益较少，停产协调增加分歧。',
      win:{prestige:2,feud:2},
      text:'修订稿通过：超标生产线先停，搬迁分批进行，每月公开取水监测。三年期限和责任核查没有因此取消。',
      echo:{t:'白沙水厂收到了逐月监测表。园区先停了超标生产线，第一批搬迁开始，剩余企业仍有明确期限。',fx:{money:-1,prestige:1}}}
  ]
};

/* 能力是综合水平；擅长和短处只影响适岗与具体办理，不证明廉洁或立场。 */
var CADRE_SKILLS = {
  ouym:{good:'accounts',weak:'people',a:'擅长拆解预算、核对收支，账目能追到原始凭据。',b:'遇到群众协调，容易只解释数字，需要熟悉基层的人配合。'},
  qianwj:{good:'accounts',weak:'people',a:'查账细，能把资金流和经办签字逐项对上。',b:'解释政策不太转弯，群众工作需要有人帮着把话讲明白。'},
  tansh:{good:'people',weak:'projects',a:'熟悉来访诉求，能让争议双方先坐下来核对事实。',b:'大型工程的工序和验收把握不足，需要业务骨干协办。'},
  fangyu:{good:'people',weak:'accounts',a:'做搬迁协调有办法，愿意把困难逐户问清。',b:'复杂财务审核经验不足，签字前需要专人复核账目。'},
  tangjl:{good:'projects',weak:'accounts',a:'善于协调项目节点，能把几个部门拉到同一张进度表上。',b:'专项资金审核不是长项，财务凭据需要另一人把关。'},
  wuxy:{good:'accounts',weak:'projects',a:'善于从费用和经办记录里核出程序问题。',b:'大型工程组织经验较少，需要懂施工的人盯工序。'},
  gaoyf:{good:'office',weak:'projects',a:'熟悉两办流转和交接，能盯住文件遗漏与办理期限。',b:'独立组织大型项目经验不足，单靠催件容易卡在现场。'},
  shenlf:{good:'projects',weak:'people',a:'熟悉立项手续和跨部门衔接，能把项目堵点逐项列清。',b:'面对长期积案不够耐心，群众协调需要另配人手。'}
};
var POST_SKILLS = {
  caizheng:'accounts',shenji:'accounts',sj_fu:'accounts',jw_fu:'accounts',jw_cw:'accounts',jcz:'accounts',jc_fu:'accounts',
  xinfang:'people',jiaoyu:'people',weijian:'people',gongan:'people',ga_fu:'people',
  zhujian:'projects',ziran:'projects',fagai:'projects',guozi:'projects',gx_qz:'projects',
  sw_fu:'office',fb_zr:'office',sz_ms:'office',rb:'office',gd:'office'
};
