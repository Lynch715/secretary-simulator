/* ── 书记这一届要干成的三件事，和每年年底省里的排名。
   进度看得见（班子页），每年十二月结一次账 ── */
var PROJ = [
  { k:'oldtown',   n:'城关区旧城改造' },
  { k:'invest',    n:'高新区招商' },
  { k:'qingchuan', n:'青川化工园整治' }
];
function PROJ_WORD(v){
  return v < 12 ? '还在纸上' : v < 30 ? '刚起了个头' : v < 50 ? '推着在走'
    : v < 70 ? '过了半' : v < 88 ? '看得见头了' : '成了';
}
/* 哪件事办好了会推哪一项。链条的幕写「线id.幕id」，常委会写议题 id */
var PROJ_EV = {
  oldtown:  ['petition','gift_bag','tf_shipin','ban_jizhe','gz_quzhang','qx_material','tf_laoganbu_hui',
             'old_town.a1','old_town.a2','old_town.a3','old_town.a4','old_town.a5','cw_xinfang','cw_school'],
  invest:   ['num_gap','banquet_gx','sj_jiaoren','xin_gaoxin','sj_jianbao','tf_qianxin','sj_fanju','sj_koujing',
             'cw_kuoqu','cw_kaohe','cw_budget'],
  qingchuan:['plant_smoke','qc_request','tf_anfang','gao_diaoyan','xin_jia',
             'qc_old.b1','qc_old.b2','qc_old.b3','qc_old.b4','qc_old.b5','cw_anquan','cw_huanbao']
};
/* 年底那张通报到了之后。{R} 今年第几，{D} 跟去年比 */
var YEAR_LINE = {
  top: { steady:'通报是下午到的。他看了两遍，把那页纸压在玻璃板底下，说了句：明年不好干了',
         strong:'他把通报往桌上一拍：「第{R}！」那天下午他见谁都多说两句',
         shrewd:'他看完通报问你：排我们前面的是谁？你说了。他说，明年盯着他们' },
  mid: { steady:'第{R}，{D}。他说了句还行，接着批文件',
         strong:'第{R}，{D}。他说：不上不下。明年我要前三',
         shrewd:'第{R}，{D}。他把通报翻到附表，看了很久别的市的数' },
  low: { steady:'第{R}，{D}。他看完没说话，通报在他桌上放了三天',
         strong:'第{R}，{D}。他问你：你说，问题出在哪？你还没答，他说，算了',
         shrewd:'第{R}，{D}。他让你把排在后面那几个市的书记名字抄给他' },
  bottom:{ steady:'第{R}。省里的会他坐在后排。回来的车上一句话没说，到了楼下才开口：明年这个时候，我不想再坐那个位置',
         strong:'第{R}。他在办公室关了一下午门。晚上七点叫你进去，桌上的茶一口没动',
         shrewd:'第{R}。他看完把通报对折，放进了抽屉。那个抽屉平时是锁着的' }
};
var YEAR_BONUS = { top:'年终考核奖多发了一档，办公室人人有份', mid:'年终考核奖按时发了，比去年多一点' };
