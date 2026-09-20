/* ── 干部池 14 人。平时不露面，只在人事、告状、谈话、排人里出现。
   露过面的才会进班子页。
   clean: 自己的底；dirty: 有没有污点；known: 你知不知道 ── */
var POOL = [
  /* 区县副职 4 */
  { id:'cg_quzhang', n:'郑大林', p:'城关区长',       grp:'本土', age:51, cap:72,
    dirty:1, known:0, near:'mayor',    want:'城关区委书记', fav:45 },
  { id:'qc_xianzhang', n:'杜怀远', p:'青川县长',     grp:'本土', age:47, cap:78,
    dirty:0, known:0, near:'jiwei',    want:'青川县委书记', fav:40 },
  { id:'bs_fuxian',  n:'秦振声', p:'白沙常务副县长', grp:'本土', age:56, cap:60,
    dirty:1, known:0, near:'vice1',    want:'白沙县委书记', fav:38 },
  { id:'gk_fuquzhang', n:'蒋明礼', p:'港口区常务副区长', grp:'老书记', age:49, cap:65,
    dirty:1, known:0, near:'gangkou',  want:'港口区长',     fav:42 },

  /* 市直部门一把手 5 */
  { id:'fagai',  n:'曹世昌', p:'发改委主任', grp:'中立', age:53, cap:80,
    dirty:0, known:0, near:'boss',    want:'副市长',   fav:50 },
  { id:'zhujian',n:'卢志高', p:'住建局长',   grp:'本土', age:50, cap:66,
    dirty:1, known:0, near:'mayor',   want:'常务副市长', fav:44 },
  { id:'caizheng',n:'阮学文',p:'财政局长',   grp:'本土', age:54, cap:74,
    dirty:0, known:0, near:'vice1',   want:'留任',     fav:46 },
  { id:'gongan', n:'童大勇', p:'公安局长',   grp:'政法', age:52, cap:76,
    dirty:0, known:0, near:'zhengfa', want:'政法委书记', fav:48 },
  { id:'guozi',  n:'尹立本', p:'国资委主任', grp:'老书记', age:57, cap:58,
    dirty:1, known:0, near:'gangkou', want:'退二线',   fav:40 },

  /* 市委办内部 3 */
  { id:'msz_mishu', n:'冯小舟', p:'秘书长的秘书', grp:'老书记', age:32, cap:64,
    dirty:0, known:0, near:'mishuzhang', want:'综合科长', fav:35 },
  { id:'keshang',   n:'葛守业', p:'综合科科长',   grp:'中立', age:44, cap:70,
    dirty:0, known:0, near:'',            want:'市委办副主任', fav:52 },
  { id:'fuzhuren',  n:'施培南', p:'市委办副主任', grp:'老书记', age:46, cap:73,
    dirty:0, known:0, near:'mishuzhang', want:'副秘书长', fav:36 },

  /* 省里下来的 2 */
  { id:'guazhi', n:'白重远', p:'挂职副市长人选', grp:'省里', age:41, cap:82,
    dirty:0, known:0, near:'depsec', want:'副市长', fav:50 },
  { id:'zuzhi_chu', n:'洪启年', p:'省委组织部处长', grp:'省里', age:48, cap:75,
    dirty:0, known:0, near:'', want:'', fav:45 }
];
var POOL_BY_ID = {};
POOL.forEach(function(x){ POOL_BY_ID[x.id] = x; });

/* ── 10 对冲突。热度 0~100，≥70 每月出一件，≥90 摊牌 ── */
var PAIRS = [
  { id:'p_mayor_boss', a:'mayor',      b:'boss',       heat:45,
    why:'旧改、财政、这个市谁说了算' },
  { id:'p_cg_gx',      a:'chengguan',  b:'gaoxin',     heat:38,
    why:'城南那块地和今年的招商指标' },
  { id:'p_qc',         a:'qingchuan',  b:'qc_xianzhang', heat:30,
    why:'县长想把化工园那笔旧账翻出来' },
  { id:'p_msz_me',     a:'mishuzhang', b:'me',         heat:20,
    why:'你的材料越过他直接进了书记办公室' },
  { id:'p_zf_jw',      a:'zhengfa',    b:'jiwei',      heat:35,
    why:'一个想压，一个想查' },
  { id:'p_exsec_msz',  a:'gangkou',    b:'mishuzhang', heat:42,
    why:'前任秘书走的时候留下的那本账' },
  { id:'p_dep_mayor',  a:'depsec',     b:'mayor',      heat:33,
    why:'都想坐市长那把椅子' },
  { id:'p_ks_me',      a:'keshang',    b:'me',         heat:15,
    why:'你比他晚进机关六年，位子在他前面' },
  { id:'p_fzr_me',     a:'fuzhuren',   b:'me',         heat:25,
    why:'下一个副秘书长只有一个名额' },
  { id:'p_bs',         a:'baisha',     b:'bs_fuxian',  heat:28,
    why:'省里下来的年轻人和守着一辈子的老人' }
];
var PAIR_BY_ID = {};
PAIRS.forEach(function(x){ PAIR_BY_ID[x.id] = x; });
