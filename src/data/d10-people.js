/* ── 人：常委十一个 + 干部池。
   side：真实倾向 -100~100，正数向书记。常委的 side 就是票面。
   干部的 show：玩家以为的倾向（暗桩的 show 跟 side 不一样）。
   lvl：1 科级 2 副处 3 正处 4 副厅。cap：1 平平 2 能干 3 一把好手。
   dirt：有没有污点。amb：野心 1 给个位子就满足 2 还想往上 3 胃口大。 ── */

/* 班子排序 */
var STANDING = ['boss','mayor','depsec','vice1','jiwei','zuzhi','zhengfa','xuanchuan','tongzhan','mishuzhang','gaoxin'];

var PEOPLE_DEF = [
  /* ── 常委 ── */
  { id:'boss', n:'周维安', p:'市委书记', lvl:5, side:100, fixed:1, cw:1,
    line:'53 岁。邻省调任，此前任邻省江城市市长，在开发区工作过八年' },
  { id:'gaoxin', n:'吴敬之', p:'高新区委书记', lvl:4, side:85, cw:1, area:'gaoxin',
    line:'49 岁。此前任江城开发区管委会主任，随周维安交流到云州。市委常委、高新区委书记',
    wants:[
      { id:'wu_kq', t:'高新区要扩区，东边那两千亩地卡在自然资源局', kind:'post', post:'ziran', gain:10 },
      { id:'wu_fu', t:'他走了以后，高新区得有人接得住', kind:'post', post:'gx_qz', gain:6 }
    ] },
  { id:'depsec', n:'罗明川', p:'市委副书记', lvl:4, side:0, cw:1, bottom:'hr',
    line:'50 岁。省委办公厅出身，前年下派云州任市委副书记，分管党群和农业农村',
    wants:[
      { id:'luo_mayor', t:'他想接市长。这话他一个字也没说过', kind:'promise', gain:38, pkey:'mayor_seat' },
      { id:'luo_calm', t:'不想站队太早。谁先逼他表态，他就往另一边靠', kind:'note', gain:0 }
    ] },
  { id:'jiwei', n:'宋自强', p:'纪委书记', lvl:4, side:5, cw:1, nodeal:1,
    line:'54 岁。省纪委交流任职，此前任省纪委一个室的主任。任云州市纪委书记三年',
    wants:[
      { id:'song_case', t:'他不要位子也不要钱。他要案子', kind:'case', gain:12 },
      { id:'song_hand', t:'纪委副书记那个位子上，他要一个肯干活的人', kind:'post', post:'jw_fu', gain:10 }
    ] },
  { id:'zuzhi', n:'佟建民', p:'组织部长', lvl:4, side:0, cw:1,
    line:'58 岁。云州本地人，组工干部出身，任组织部长五年',
    wants:[
      { id:'tong_rd', t:'快到点了，想去人大，体面地退', kind:'promise', gain:15, pkey:'tong_rd' },
      { id:'tong_men', t:'两个老部下郭怀山、晏平，在组织部当处长多年，他想让他们下去当个一把手', kind:'place', ids:['guohs','yanping'], gain:9 }
    ] },
  { id:'xuanchuan', n:'方静仪', p:'宣传部长', lvl:4, side:0, cw:1,
    line:'51 岁。省报记者出身，任宣传部长四年，分管宣传、网信、文化',
    wants:[
      { id:'fang_media', t:'融媒体中心那笔钱，年年报年年砍', kind:'money', cost:1, gain:10 },
      { id:'fang_hus', t:'她爱人周启明当了九年教育局副局长。教育局长的位子一空，她会盯着', kind:'place', ids:['zhouqm'], post:'jiaoyu', gain:14 }
    ] },
  { id:'mishuzhang', n:'邱仲华', p:'秘书长', lvl:4, side:-20, cw:1, bottom:'cui',
    line:'56 岁。前任市委书记的秘书出身，在市委办工作二十年，任秘书长四年',
    wants:[
      { id:'qiu_cui', t:'前任秘书崔延平是他带出来的。谁动崔延平，他跟谁拼', kind:'promise', gain:16, pkey:'keep_cui' },
      { id:'qiu_feng', t:'他的秘书冯小舟跟了他六年，他想给冯小舟找个实职', kind:'place', ids:['msz_mishu'], gain:10 }
    ] },
  { id:'tongzhan', n:'纪守望', p:'统战部长', lvl:4, side:-5, cw:1,
    line:'57 岁。任统战部长六年，分管统战、工商联、侨务',
    wants:[
      { id:'ji_shh', t:'商会那几个老板有个物流园的项目，递了一年没人批', kind:'money', cost:1, gain:10 },
      { id:'ji_ql', t:'侨联那栋楼漏雨漏了三年', kind:'money', cost:1, gain:7 }
    ] },
  { id:'zhengfa', n:'韩树声', p:'政法委书记', lvl:4, side:-35, cw:1, bottom:'qc',
    line:'55 岁。公安出身，当过市公安局长，任政法委书记五年',
    wants:[
      { id:'han_ga', t:'公安局长要是他点头的人。他推的是郭振川', kind:'post', post:'gongan', gain:14 },
      { id:'han_qc', t:'青川那件事，谁也别翻', kind:'promise', gain:15, pkey:'no_qc' }
    ] },
  { id:'vice1', n:'高振邦', p:'常务副市长', lvl:4, side:-60, cw:1, gripOnly:1,
    line:'55 岁。云州本地人，财政局长出身，任常务副市长六年，分管财政、国资、卫健',
    wants:[
      { id:'gao_mayor', t:'他也想接市长。他会说是替云州着急', kind:'promise', gain:20, pkey:'mayor_seat' }
    ] },
  { id:'mayor', n:'陈立群', p:'市长', lvl:5, side:-100, fixed:1, cw:1,
    line:'57 岁。在云州工作十四年，历任城关区长、区委书记、常务副市长，任市长四年' },

  /* ── 区县一把手和班子 ── */
  { id:'chengguan', n:'邵国栋', p:'城关区委书记', lvl:3, side:-70, cap:2, age:55, area:'chengguan', dirt:1, amb:2,
    line:'55 岁。陈立群任城关区长时的区政府办主任，任城关区委书记四年' },
  { id:'cg_quzhang', n:'郑大林', p:'城关区长', lvl:3, side:-20, cap:2, age:51, area:'chengguan', dirt:1, amb:3,
    line:'51 岁。城关本地干部，任城关区长三年' },
  { id:'gx_qz', rel:'吴敬之带出来的', n:'陆一帆', p:'高新区长', lvl:3, side:45, cap:3, age:42, area:'gaoxin', dirt:0, amb:2,
    line:'42 岁。高新区招商局长出身，任高新区长两年' },
  { id:'gangkou', n:'崔延平', p:'港口区委书记', lvl:3, side:-5, cap:2, age:54, area:'gangkou', dirt:1, amb:1,
    line:'54 岁。前任市委书记的秘书，任港口区委书记五年' },
  { id:'gk_qz', n:'贾正', p:'港口区长', lvl:3, side:-10, cap:1, age:50, area:'gangkou', dirt:0, amb:1,
    line:'50 岁。港务局出身，任港口区长三年' },
  { id:'qingchuan', n:'马汉江', p:'青川县委书记', lvl:3, side:-60, cap:2, age:53, area:'qingchuan', dirt:1, amb:2,
    line:'53 岁。青川本地人，任青川县委书记六年。任内化工园发生过一起死亡事故' },
  { id:'qc_xianzhang', n:'杜怀远', p:'青川县长', lvl:3, side:5, cap:3, age:47, area:'qingchuan', dirt:0, amb:2,
    line:'47 岁。省里选调生出身，任青川县长两年' },
  { id:'baisha', n:'程一鸣', p:'白沙县委书记', lvl:3, side:30, cap:2, age:38, area:'baisha', dirt:0, amb:3,
    line:'38 岁。省直机关下派，任白沙县委书记一年半' },
  { id:'bs_fuxian', n:'秦振声', p:'白沙县长', lvl:3, side:-35, cap:1, age:56, area:'baisha', dirt:1, amb:1,
    line:'56 岁。白沙本地人，在白沙工作三十年，任县长四年' },
  { id:'meiling', n:'贺兰生', p:'梅岭县委书记', lvl:3, side:0, cap:1, age:59, area:'meiling', dirt:0, amb:1,
    line:'59 岁。任梅岭县委书记七年，明年到龄' },
  { id:'ml_xz', n:'袁晓岚', p:'梅岭县长', lvl:3, side:-10, cap:2, age:45, area:'meiling', dirt:0, amb:2,
    line:'45 岁。市文旅局出身，任梅岭县长两年' },

  /* ── 两办、政法、市直 ── */
  { id:'fuzhuren', n:'施培南', p:'市委办常务副主任', lvl:3, side:-10, cap:2, age:46, area:'shiwei', dirt:0, amb:2,
    line:'46 岁。在市委办工作十五年，任常务副主任三年' },
  { id:'fb_zr', n:'景国梁', p:'市府办主任', lvl:3, side:-65, cap:3, age:49, area:'shifu', dirt:1, amb:2,
    line:'49 岁。长期在市政府办工作，任市府办主任五年' },
  { id:'sz_ms', n:'苏晓东', p:'市长秘书', lvl:2, side:-75, cap:2, age:34, area:'shifu', dirt:0, amb:2,
    line:'34 岁。与你同一年考进机关，任市长秘书四年' },
  { id:'gongan', n:'童大勇', p:'公安局长', lvl:3, side:-30, cap:2, age:52, area:'zhengfa', dirt:0, amb:2,
    line:'52 岁。刑警出身，任公安局长四年' },
  { id:'jcz', n:'石磊', p:'检察长', lvl:4, side:0, cap:2, age:57, area:'zhengfa', dirt:0, amb:1,
    line:'57 岁。省检察院交流任职，任检察长五年，明年期满' },
  { id:'jw_fu', n:'林默', p:'纪委副书记', lvl:3, side:5, cap:2, age:50, area:'jiwei', dirt:0, amb:1,
    line:'50 岁。纪检干部出身，任纪委副书记三年' },
  { id:'caizheng', n:'阮学文', p:'财政局长', lvl:3, side:-40, cap:3, age:54, area:'shizhi', dirt:1, amb:1,
    line:'54 岁。财政系统干部，任财政局长六年' },
  { id:'fagai', n:'曹世昌', p:'发改委主任', lvl:3, side:5, cap:3, age:53, area:'shizhi', dirt:0, amb:2,
    line:'53 岁。经济学硕士，任发改委主任五年' },
  { id:'zhujian', n:'卢志高', p:'住建局长', lvl:3, side:-50, cap:1, age:50, area:'shizhi', dirt:1, amb:3,
    line:'50 岁。建筑公司出身，任住建局长四年' },
  { id:'shenji', n:'许海峰', p:'审计局长', lvl:3, side:-5, cap:2, age:55, area:'shizhi', dirt:0, amb:1,
    line:'55 岁。在审计系统工作三十年，任审计局长六年' },
  { id:'ziran', n:'孟广仁', p:'自然资源局长', lvl:3, side:-35, cap:2, age:51, area:'shizhi', dirt:1, amb:2,
    line:'51 岁。国土系统干部，任自然资源局长三年' },
  { id:'jiaoyu', n:'杜秉文', p:'教育局长', lvl:3, side:-10, cap:1, age:58, area:'shizhi', dirt:0, amb:1,
    line:'58 岁。中学校长出身，任教育局长七年，明年到龄' },
  { id:'weijian', n:'冷秋实', p:'卫健委主任', lvl:3, side:-25, cap:2, age:52, area:'shizhi', dirt:1, amb:1,
    line:'52 岁。医院院长出身，任卫健委主任四年' },
  { id:'xinfang', n:'马春来', p:'信访局长', lvl:3, side:-20, cap:1, age:54, area:'shizhi', dirt:0, amb:1,
    line:'54 岁。任信访局长五年' },
  { id:'guozi', n:'尹立本', p:'国资委主任', lvl:3, side:0, cap:1, age:58, area:'shizhi', dirt:1, amb:1,
    line:'58 岁。港口国企厂长出身，任国资委主任九年' },

  { id:'wanhz', n:'万海舟', p:'纪委常委', lvl:2, side:-25, cap:2, age:44, area:'zhengfa', dirt:0, amb:2,
    line:'44 岁。公安转纪检，在政法委工作过六年，任纪委常委两年' },
  { id:'yanlw', n:'严立文', p:'日报社总编辑', lvl:3, side:-35, cap:2, age:52, area:'shizhi', dirt:1, amb:1,
    line:'52 岁。跑了十五年市政府口的记者，任日报社总编辑五年' },
  { id:'zengf', n:'曾凡', p:'广电台长', lvl:3, side:0, cap:2, age:47, area:'shizhi', dirt:0, amb:2,
    line:'47 岁。播音员出身，任广电台长三年' },

  /* ── 苗子（开局不在任何要害位子上） ── */
  { id:'keshang', n:'葛守业', p:'市委办综合科科长', lvl:2, side:10, cap:2, age:44, area:'shiwei', dirt:0, amb:2, cand:1,
    line:'44 岁。市委办综合科科长，你原来的科长' },
  { id:'msz_mishu', rel:'邱仲华的秘书', n:'冯小舟', p:'秘书长的秘书', lvl:2, side:-5, cap:2, age:32, area:'shiwei', dirt:0, amb:2,
    line:'32 岁。邱仲华的秘书，跟了六年' },
  { id:'guazhi', n:'白重远', p:'省发改委处长（挂职）', lvl:3, side:15, cap:3, age:41, area:'shizhi', dirt:0, amb:3,
    line:'41 岁。省发改委处长，在云州挂职市政府副秘书长，挂职期一年' },
  { id:'gk_fuquzhang', n:'蒋明礼', p:'港口区常务副区长', lvl:2, side:-5, cap:2, age:49, area:'gangkou', dirt:1, amb:2,
    line:'49 岁。在港口区工作十二年，任常务副区长四年' },
  { id:'zhouqm', rel:'方静仪的爱人', n:'周启明', p:'教育局副局长', lvl:2, side:0, cap:2, age:50, area:'shizhi', dirt:0, amb:1,
    line:'50 岁。方静仪的爱人。任教育局副局长九年' },
  { id:'guohs', rel:'佟建民的老部下', n:'郭怀山', p:'组织部干部一处处长', lvl:2, side:0, cap:2, age:46, area:'shiwei', dirt:0, amb:1,
    line:'46 岁。组织部干部一处处长，佟建民的老部下' },
  { id:'yanping', rel:'佟建民的老部下', n:'晏平', p:'组织部干部二处处长', lvl:2, side:5, cap:2, age:43, area:'shiwei', dirt:0, amb:2,
    line:'43 岁。组织部干部二处处长，佟建民的老部下' },
  { id:'guozc', rel:'韩树声的老部下', n:'郭振川', p:'公安局常务副局长', lvl:2, side:-55, cap:2, age:48, area:'zhengfa', dirt:1, amb:3,
    line:'48 岁。公安局常务副局长，韩树声的老部下' },
  { id:'fangyu', n:'方宇', p:'白沙县副县长', lvl:2, side:20, cap:3, age:35, area:'baisha', dirt:0, amb:2,
    line:'35 岁。选调生，白沙县副县长，分管易地搬迁' },
  { id:'tangjl', n:'唐建林', p:'高新区管委会副主任', lvl:2, side:30, cap:2, age:39, area:'gaoxin', dirt:0, amb:2,
    line:'39 岁。高新区管委会副主任，分管招商' },
  { id:'wuxy', n:'武晓燕', p:'城关区纪委书记', lvl:2, side:10, cap:3, age:44, area:'chengguan', dirt:0, amb:1,
    line:'44 岁。城关区纪委书记。前年查过城关一起拆迁案，案子后来中止' },
  { id:'lihb', n:'李海滨', p:'青川县公安局长', lvl:2, side:-5, cap:2, age:46, area:'qingchuan', dirt:0, amb:1,
    line:'46 岁。青川县公安局长，三年前化工园事故的第一出警人' },
  { id:'qianwj', n:'钱文杰', p:'审计局副局长', lvl:2, side:5, cap:3, age:41, area:'shizhi', dirt:0, amb:2,
    line:'41 岁。审计局副局长，注册会计师出身' },
  { id:'zhangyn', n:'张以宁', p:'市检察院副检察长', lvl:2, side:0, cap:2, age:45, area:'zhengfa', dirt:0, amb:2,
    line:'45 岁。市检察院副检察长，从省检察院交流而来' },
  { id:'heqs', n:'何青松', p:'梅岭县委副书记', lvl:2, side:-15, cap:1, age:52, area:'meiling', dirt:1, amb:2,
    line:'52 岁。梅岭县委副书记，在梅岭工作二十年' },
  { id:'luoy', n:'罗岩', p:'港口区纪委书记', lvl:2, side:5, cap:2, age:47, area:'gangkou', dirt:0, amb:1,
    line:'47 岁。部队转业，任港口区纪委书记四年' },
  { id:'tansh', n:'谭少华', p:'市信访局副局长', lvl:2, side:10, cap:2, age:40, area:'shizhi', dirt:0, amb:2, cand:1,
    line:'40 岁。市信访局副局长' },
  { id:'weiq', n:'韦青', p:'市政府办副主任', lvl:2, side:10, cap:2, age:38, area:'shifu', dirt:0, amb:2, cand:1,
    line:'38 岁。市政府办副主任' },
  { id:'ouym', n:'欧阳明', p:'财政局预算科科长', lvl:1, side:10, cap:3, age:33, area:'shizhi', dirt:0, amb:2, cand:1,
    line:'33 岁。财政局预算科科长' },
  { id:'songjy', n:'宋佳怡', p:'高新区招商局长', lvl:2, side:25, cap:3, age:37, area:'gaoxin', dirt:0, amb:3,
    line:'37 岁。高新区招商局长' },
  { id:'panlei', n:'潘磊', p:'城关区副区长', lvl:2, side:0, cap:2, age:43, area:'chengguan', dirt:1, amb:2,
    line:'43 岁。城关区副区长，分管拆迁' },
  { id:'gaoyf', n:'高亚峰', p:'市委办秘书科科长', lvl:1, side:15, cap:2, age:31, area:'shiwei', dirt:0, amb:1,
    line:'31 岁。市委办秘书科科长，在你手下工作过' },
  { id:'shenlf', n:'沈立峰', p:'市发改委副主任', lvl:2, side:-10, cap:2, age:47, area:'shizhi', dirt:0, amb:2,
    line:'47 岁。发改委副主任' },
  { id:'lvhq', rel:'马汉江的人', n:'吕宏泉', p:'青川县常务副县长', lvl:2, side:-30, cap:1, age:51, area:'qingchuan', dirt:1, amb:1,
    line:'51 岁。青川县常务副县长，马汉江任县长时的县政府办主任' },
  { id:'kongm', n:'孔敏', p:'市卫健委副主任', lvl:2, side:5, cap:2, age:44, area:'shizhi', dirt:0, amb:1,
    line:'44 岁。卫健委副主任，心内科医生出身' }
];

/* 暗桩候选：每局抽两个，side 改成 -60，show 不变 */
var MOLE_CAND = ['keshang', 'fagai', 'tansh', 'weiq', 'ouym'];

/* 区县和口子，下基层用 */
var AREAS = [
  { id:'chengguan', n:'城关区' }, { id:'gaoxin', n:'高新区' }, { id:'gangkou', n:'港口区' },
  { id:'qingchuan', n:'青川县' }, { id:'baisha', n:'白沙县' }, { id:'meiling', n:'梅岭县' },
  { id:'shizhi', n:'市直部门' }, { id:'zhengfa', n:'政法口' }, { id:'shifu', n:'市政府办' }, { id:'shiwei', n:'市委这边' }
];

/* 开局就认识的：常委、区县一把手、市直一把手（在位子上的都认识，但不知道底） */
var FACES = ['boss','mayor','vice1','depsec','jiwei','zuzhi','zhengfa','xuanchuan','mishuzhang','tongzhan','gaoxin',
  'chengguan','gangkou','qingchuan','baisha','meiling','cg_quzhang','qc_xianzhang','bs_fuxian','gk_fuquzhang',
  'fagai','zhujian','caizheng','gongan','guazhi','keshang','msz_mishu','fuzhuren','me','wife','sister'];

/* 常委换人时从这里补。省里派下来的，底子不清楚 */
var NEW_STANDING = [
  { n:'魏长河', line:'52 岁。省直机关交流任职' },
  { n:'严书华', line:'50 岁。省委政研室出身' },
  { n:'柏正阳', line:'54 岁。从邻市调任' },
  { n:'祁志远', line:'48 岁。省委组织部出身' }
];
