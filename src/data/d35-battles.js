/* ── 八场仗怎么决 ──
   vote：常委会表决的月份、议题、对各人的修正；tags 是会碰到谁的底线。
   kind:'hr' 公安局长那一仗由调整会决；kind:'prov' 青川那一仗由省里决 ── */
var BATTLES = {
  b1: { n:'第一份预算', mo:4, topic:'全年预算安排', tags:[],
    mods:{ depsec:0, mishuzhang:-5, jiwei:5, zuzhi:5, tongzhan:5 },
    win:{ prestige:8, money:2, trust:3 }, lose:{ prestige:-6, money:-1, trust:-2 },
    winT:'常委会开了三个钟头。表决的时候，陈立群最后一个举手，举的是反对。\n散会后他走过来，双手握住书记的手：「周书记定了，市政府坚决落实。」\n他握得很紧。松开的时候，他看的是窗外。',
    loseT:'表决的时候，罗明川看了看左边，又看了看右边，把手放下了。预算按市政府的版本过了。\n回去的车上，书记一直看着窗外。快到大院的时候他说：「桥墩上的字，是八七年。」' },

  b2: { n:'公安局长', mo:8, kind:'hr', post:'gongan',
    win:{ prestige:6, trust:3 }, lose:{ prestige:-5 },
    winT:'任命宣布那天，韩树声在会上鼓了掌，鼓得很响。散会以后，他的司机在楼下等了四十分钟，没等到他。他从后门走的。',
    loseT:'郭振川上任的第一件事，是把局里三个中层调了岗。其中一个，上个月刚跟你吃过饭。' },

  b3: { n:'城关旧改', mo:12, topic:'城关区旧城改造实施方案', tags:['old'],
    mods:{ vice1:-10, zhengfa:-5, mishuzhang:-5, jiwei:3 },
    win:{ prestige:8, trust:3, side:{ cg_quzhang:20, chengguan:-10 } }, lose:{ prestige:-8, trust:-2, feud:4 },
    winT:'常委会从下午两点开到七点。表决的时候，陈立群第一个举手，反对。然后他看着对面，一个一个看过去。\n票数念完，他把钢笔帽拧上了。「服从多数。」\n第二天，城关区的推土机开进了老城。第一台推倒的，是那个老教师家隔壁的一堵墙。',
    loseT:'方案没过。散会的时候，邵国栋在楼下等陈立群，两个人上了同一辆车。\n那天晚上书记没回招待所，在办公室坐到十二点。你进去送文件，他桌上摊着城关的地图，一个角被烟头烫了个洞。' },

  b4: { n:'青川的旧账', mo:16, kind:'prov',
    win:{ prestige:7, trust:3, side:{ jiwei:8, zhengfa:-10 } }, lose:{ prestige:-6, feud:6, heat:5 },
    winT:'省里的调查组住了十一天。走的那天马汉江去送，在宾馆门口站着等了二十分钟，车从另一个门走了。\n一个月后通报下来，三百字。马汉江免职，吕宏泉移送司法机关，事故性质改了。\n那个上初二的孩子，你后来再没在信访局见过。',
    loseT:'调查组住了三天。通报说，原结论并无不当。\n死者的姐姐下个月初照样来了，照样坐了一天。第三十八次。\n韩树声专门到书记办公室坐了几分钟：「周书记，青川的事省里有了结论，政法口一定把后续工作做好。」\n出门的时候，他把门轻轻带上了。' },

  b5: { n:'副市长', mo:20, topic:'副市长推荐人选', tags:['hr'],
    mods:{ vice1:-10, zhengfa:-5, zuzhi:5, jiwei:3 },
    win:{ prestige:7, money:1, side:{ guazhi:20 } }, lose:{ prestige:-6 },
    winT:'白重远的任命是省里下的，比常委会晚了二十六天。他到任第一天先来市委这边拜码头，在书记办公室坐了十分钟。出来的时候跟你握了手，握得很用力。',
    loseT:'卢志高当了副市长。他来市委送材料那天，在走廊上碰见你，先伸的手：「{SUR}秘书，以后城建上的事，多沟通。」' },

  b7: { n:'港口改制', mo:30, topic:'港口区国有企业改制方案', tags:['cui'],
    mods:{ vice1:-10, mishuzhang:-10, jiwei:5, xuanchuan:5 },
    win:{ prestige:7, trust:3, grip:{ gangkou:2, vice1:1 } }, lose:{ prestige:-6, trust:-2 },
    winT:'方案退回重做。散会以后，市政府那边有人在走廊里打电话，声音很大，说的是那家外地公司的名字。\n崔延平第二天请了病假。',
    loseT:'改制方案过了。签约仪式定在下个月，书记没去，让罗明川去的。' },

  b8: { n:'换届', mo:60, topic:'关于新一届市委领导班子的推荐意见', tags:['hr'],
    mods:{ jiwei:5 },
    win:{}, lose:{},
    winT:'', loseT:'' }
};
BATTLES.b6 = { n:'高铁站选址', mo:25, topic:'关于高铁云州站选址的推荐意见', tags:['old'],
  mods:{ vice1:-10, zhengfa:-5, mishuzhang:-3, gaoxin:0, jiwei:3 },
  win:{ prestige:8, money:1, side:{ gaoxin:4 } }, lose:{ prestige:-7, trust:-2 },
  winT:'推荐意见报到了省里，站址定在高新区南边。\n立民建设停在老货场那块地上的三台挖掘机，第二个星期就开走了。',
  loseT:'推荐意见写的是城关。省里批得很快。\n老货场的围墙上，「立民建设」四个字重新刷了一遍。' };
BATTLES.b9 = { n:'省委巡视', mo:37, kind:'patrol',
  win:{ prestige:8, bossRisk:-10 }, lose:{ prestige:-8, bossRisk:12, feud:6 },
  winT:'巡视反馈会开了两个钟头。丁组长念到「个别市领导亲属经商办企业问题突出」这一句的时候，没有抬头。\n台下第一排，陈市长把钢笔帽拧上了。',
  loseT:'反馈会上，丁组长念到「主要负责同志民主作风有待加强」，停了一下。\n书记坐在第一排，把这一句记在了本子上。' };
BATTLES.b10 = { n:'梅岭撤县设区', mo:43, topic:'关于梅岭撤县设区后托管体制的意见', tags:[],
  mods:{ vice1:-8, zhengfa:-5, mishuzhang:-3, tongzhan:3 },
  win:{ prestige:7, money:1, side:{ ml_xz:15 } }, lose:{ prestige:-6, side:{ chengguan:5 } },
  winT:'梅岭区挂牌那天，吴敬之去揭的牌。袁晓岚站在他旁边，手里拿着那条环线的规划图。',
  loseT:'梅岭归了城关托管。挂牌那天，邵国栋讲了二十分钟，讲的是老城和新区要一盘棋。' };
BATTLES.b11 = { n:'工地塌方', mo:48, kind:'acc',
  win:{ prestige:6, trust:3 }, lose:{ prestige:-10, bossRisk:12, trust:-3 },
  winT:'调查报告认定：施工方违规分包，住建部门监管不到位。\n书记在常委会上说了四个字：两条人命。说完，会议室里很久没人说话。',
  loseT:'调查报告里有一句：旧城改造推进过急，前期论证不充分。\n书记在报告上签了字。签完，他把那一页折了个角。' };
BATTLES.b12 = { n:'人代会补选', mo:53, kind:'npc',
  win:{ prestige:7, money:1 }, lose:{ prestige:-8, feud:5 },
  winT:'补选结果当场宣布，书记这边的人过了半数，多出来六十一票。\n城关代表团那一排，有几个人没鼓掌。',
  loseT:'另外那个人选，是代表联名提的，得票比市委推荐的多了十九票。\n宣布结果的时候，书记在主席台上带头鼓了掌。' };
var BATTLE_ORDER = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b9', 'b10', 'b11', 'b12', 'b8'];

/* 年底省里排名 */
var RANK_TXT = {
  top: '省委办公厅的通报是腊月二十三到的。全省十三个市，云州第{R}。\n书记看完，把通报递给你：「贴到你那屋墙上。」',
  mid: '省里的通报到了。云州第{R}，比去年{UD}。书记看了一眼，签了个「阅」字。',
  low: '通报上云州排第{R}。书记在常委会上念了这个数，念完停了很久，谁也没说话。\n散会以后，陈立群在走廊里跟人说笑，笑声传得很远。'
};
