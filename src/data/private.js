/* ── 私事：你家里的人、写死的时间表、谁能动到你家谁 ── */

/* 家里六个人 */
var KIN = [
  { id:'wife',   n:'周雪', rel:'爱人', line:'市一院护士，三班倒，比你还忙' },
  { id:'son',    n:'刘念', rel:'儿子', line:'四岁，幼儿园中班' },
  { id:'father', n:'',     rel:'父亲', line:'老家县城，退休教师，血压一直不稳' },
  { id:'law',    n:'',     rel:'岳父', line:'本地，退休，心脏不好，话少' },
  { id:'sister', n:'刘敏', rel:'妹妹', line:'城关区文旅局展陈科，二十七' },
  { id:'cousin', n:'小伟', rel:'表弟', line:'大专毕业三年，在家。姑妈一个月来两趟' }
];

/* 时间表：到月份就来，不随机。玩家能预见，也躲不掉 */
var PRIVATE_SCHED = [
  { at:[8,10],  id:'sis_promo'   },
  { at:[14,16], id:'law_stent'   },
  { at:[22,24], id:'cousin_job'  },
  { at:[28,32], id:'son_school'  },
  { at:[38,42], id:'father_move' },
  { at:[45,50], id:'sis_later'   }
];

/* 谁能动到你家哪个人。你拒了他，账记在这儿，将来落在他们身上 */
var CAN_HURT = {
  chengguan:  { kin:'sister', ev:'hurt_sister' },   /* 文旅局归城关区管 */
  vice1:      { kin:'law',    ev:'hurt_law'    },   /* 卫健口的钱他批 */
  xuanchuan:  { kin:'son',    ev:'hurt_son'    },   /* 教育口她分管 */
  zhengfa:    { kin:'father', ev:'hurt_father' },
  mayor:      { kin:'sister', ev:'hurt_sister' },
  gaoxin:     { kin:'cousin', ev:'hurt_cousin' },
  qingchuan:  { kin:'father', ev:'hurt_father' }   /* 你爸住的那个镇归青川管 */
};

/* 求了人就欠账。到期他来要，模板在这儿 */
var OWE_TPL = {
  title:'{WHO}来了一趟',
  text:'他没提当初那件事，只说顺路。坐了十分钟，临走把一个文件夹放在你桌角：「这个你看看，不急。」\n你知道他等的是什么。当初{WHAT}，是他一句话的事。',
  nt:'文件夹在你桌角放了一个月。他再没来过，也没打过电话',
  opts:[
    { t:'办了', d:2, tier:'gray', rule:'meddle',
      n:'两天就走完了流程。他打电话说了声谢谢，两个人都没提三个月前那件事',
      fxWho:+12, fx:{clean:-7, dark:'repay_favor'}, clear:1,
      rk:{} },
    { t:'按正常程序走，不加塞', d:3, tier:'tail',
      n:'走了一个半月，最后还是批了。他后来大概觉得你这个人使不动',
      fxWho:+2, fx:{en:-4}, clear:1,
      rk:{ shrewd:'这件事怎么压了这么久？' } },
    { t:'跟他说这个我办不了', d:0, tier:'good',
      n:'他把文件夹收回去，说没事没事。三天后{BACK}',
      fxWho:-30, fx:{rep:+2}, renege:1, grudge:1,
      rk:{} }
  ]
};
