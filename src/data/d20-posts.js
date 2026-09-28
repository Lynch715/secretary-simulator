/* ── 位子：27 格。holder 是开局坐着的人。lvl 是这个位子的级别，
   人的级别比它低一级可以提，低两级是破格。use 是这个位子在自己人手里能干什么 ── */
var POSTS = [
  /* 两办 */
  { id:'sw_fu',  n:'市委办常务副主任', grp:'两办', lvl:3, holder:'fuzhuren',
    use:'市委这边的文件不漏。市长那边想打听你，得先过他' },
  { id:'fb_zr',  n:'市府办主任',       grp:'两办', lvl:3, holder:'fb_zr',
    use:'市长那边的文件从他手上过。市长下个月要干什么，你能早一步知道一半' },
  { id:'sz_ms',  n:'市长秘书',         grp:'两办', lvl:2, holder:'sz_ms', hard:1,
    use:'市长每个月做了什么，你都知道' },
  /* 政法 */
  { id:'gongan', n:'公安局长',         grp:'政法', lvl:3, holder:'gongan',
    use:'查案、护人。你家里的事，没人翻得动' },
  { id:'jcz',    n:'检察长',           grp:'政法', lvl:4, holder:'jcz',
    use:'手里的东西能坐实' },
  { id:'jw_fu',  n:'纪委副书记',       grp:'政法', lvl:3, holder:'jw_fu',
    use:'宋自强办案的那只手。交上去的东西结得快，也能坐实' },
  /* 政法副职：正职在谁手里，副职就是另一只眼睛 */
  { id:'ga_fu',  n:'公安局常务副局长', grp:'政法', lvl:2, holder:'guozc', fu:'gongan',
    use:'正职做什么，他都知道。正职要是对面的人，他能拖一拖，也能把正职的东西一点点攒起来' },
  { id:'jc_fu',  n:'副检察长',         grp:'政法', lvl:2, holder:'zhangyn', fu:'jcz',
    use:'检察院的案子从谁手上过，他看得见' },
  { id:'jw_cw',  n:'纪委常委',         grp:'政法', lvl:2, holder:'wanhz', fu:'jw_fu',
    use:'纪委里的另一张嘴。交上去的东西走到哪一步，他知道' },
  { id:'sj_fu',  n:'审计局副局长',     grp:'政法', lvl:2, holder:'qianwj', fu:'shenji',
    use:'审计组派谁、审谁，他说得上话' },
  /* 宣传 */
  { id:'rb',     n:'日报社总编辑',     grp:'宣传', lvl:3, holder:'yanlw',
    use:'版面给谁。还能往省里递内参' },
  { id:'gd',     n:'广电台长',         grp:'宣传', lvl:3, holder:'zengf',
    use:'晚间新闻头条是谁的镜头' },
  /* 市直 */
  { id:'caizheng', n:'财政局长',       grp:'市直', lvl:3, holder:'caizheng',
    use:'每年开春，书记手里能许出去的钱有多少，看他' },
  { id:'fagai',  n:'发改委主任',       grp:'市直', lvl:3, holder:'fagai',
    use:'项目要他点头。许给常委的项目，他在，一份钱办一件' },
  { id:'zhujian', n:'住建局长',        grp:'市直', lvl:3, holder:'zhujian',
    use:'旧改归他管。工程上的账，他翻得到' },
  { id:'shenji', n:'审计局长',         grp:'市直', lvl:3, holder:'shenji',
    use:'查账。市政府那边的人，挖起来快一倍' },
  { id:'ziran',  n:'自然资源局长',     grp:'市直', lvl:3, holder:'ziran',
    use:'土地。高新区扩区卡在他这儿' },
  { id:'jiaoyu', n:'教育局长',         grp:'市直', lvl:3, holder:'jiaoyu',
    use:'学校的事。方静仪一直盯着这个位子' },
  { id:'weijian', n:'卫健委主任',      grp:'市直', lvl:3, holder:'weijian',
    use:'卫健口的钱和账。高振邦的一半事在这儿' },
  { id:'xinfang', n:'信访局长',        grp:'市直', lvl:3, holder:'xinfang',
    use:'举报信先到他手上。冲你来的信，能压住一封' },
  { id:'guozi',  n:'国资委主任',       grp:'市直', lvl:3, holder:'guozi',
    use:'港口那几家国企。改制那一仗要他' },
  /* 区县 */
  { id:'cg_sj',  n:'城关区委书记',     grp:'区县', lvl:3, holder:'chengguan', area:'chengguan',
    use:'老城、旧改、信访。城关向着谁，旧改就向着谁' },
  { id:'cg_qz',  n:'城关区长',         grp:'区县', lvl:3, holder:'cg_quzhang', area:'chengguan', use:'城关的另一半' },
  { id:'gx_sj',  n:'高新区委书记',     grp:'区县', lvl:3, holder:'gaoxin', area:'gaoxin', locked:1,
    use:'招商。吴敬之兼着' },
  { id:'gx_qz',  n:'高新区长',         grp:'区县', lvl:3, holder:'gx_qz', area:'gaoxin', use:'高新区的日常' },
  { id:'gk_sj',  n:'港口区委书记',     grp:'区县', lvl:3, holder:'gangkou', area:'gangkou',
    use:'港口、国企。崔延平那本账在这儿' },
  { id:'gk_qz',  n:'港口区长',         grp:'区县', lvl:3, holder:'gk_qz', area:'gangkou', use:'港口的另一半' },
  { id:'qc_sj',  n:'青川县委书记',     grp:'区县', lvl:3, holder:'qingchuan', area:'qingchuan',
    use:'矿、化工园。青川那件事捂在这儿' },
  { id:'qc_xz',  n:'青川县长',         grp:'区县', lvl:3, holder:'qc_xianzhang', area:'qingchuan', use:'青川的另一半' },
  { id:'bs_sj',  n:'白沙县委书记',     grp:'区县', lvl:3, holder:'baisha', area:'baisha', use:'农业、搬迁' },
  { id:'bs_xz',  n:'白沙县长',         grp:'区县', lvl:3, holder:'bs_fuxian', area:'baisha', use:'白沙的另一半' },
  { id:'ml_sj',  n:'梅岭县委书记',     grp:'区县', lvl:3, holder:'meiling', area:'meiling', use:'文旅、生态红线' },
  { id:'ml_xz',  n:'梅岭县长',         grp:'区县', lvl:3, holder:'ml_xz', area:'meiling', use:'梅岭的另一半' }
];

/* 到点就空出来的位子：月份、谁走、走的那一句 */
var RETIRE = [
  { mo:10, post:'ml_sj', t:'贺兰生到点了。县里给他开了个座谈会，他讲了四十分钟梅岭的山' },
  { mo:12, post:'jw_fu', t:'林默调省纪委。宋自强送他到楼下，回来的时候说了一句：「换个快的。」' },
  { mo:14, post:'jiaoyu', t:'杜秉文到龄。交接那天他把办公室的钥匙放在桌上，一串十一把' },
  { mo:16, post:'guozi', t:'尹立本退二线。他在国资委干了九年，走的时候说港口那几家厂的事，以后跟他没关系了' },
  { mo:21, post:'jcz', t:'石磊任期满，回省检察院。临走前他来市委转了一圈，跟谁都握了手' },
  { mo:29, post:'shenji', t:'许海峰到龄。他说审了三十年账，最后一本是他自己的退休金' },
  { mo:34, post:'gk_qz', t:'贾正调港务集团当董事长。港口区给他开了个欢送会，他讲了三分钟，最后一句是谢谢大家' },
  { mo:39, post:'xinfang', t:'马春来到龄。信访局的人给他办了个茶话会，来了一个老上访户，送了他一面锦旗' },
  { mo:45, post:'weijian', t:'冷秋实调省卫健委。走之前，他把卫健口这几年的账交接得清清楚楚' },
  { mo:51, post:'fagai', t:'曹世昌调省发改委。临走请发改委的人吃了顿饭，一桌十二个人，喝掉了四瓶酒' }
];

/* 调整会：每季度第二个月 */
var HR_MONTHS = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59];
