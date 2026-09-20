/* ── 20-npc：常委班子、区县、家里（S1 数据壳，S2 补底线议题逻辑）── */
var NPC_DEF = [
  { id:'boss',    n:'周维安', p:'市委书记',   f:'—',     line:'外省调来，53 岁，想在云州干出成绩再往上走' },
  { id:'mayor',   n:'陈立群', p:'市长',       f:'本土',  line:'表面配合，常委会上寸步不让', bottom:'旧改' },
  { id:'vice1',   n:'高振邦', p:'常务副市长', f:'本土',  line:'市长的钱袋子',               bottom:'财政盘子' },
  { id:'depsec',  n:'罗明川', p:'市委副书记', f:'省里',  line:'等着接市长，两边都不得罪',   bottom:'人事' },
  { id:'jiwei',   n:'宋自强', p:'纪委书记',   f:'上级直管', line:'谁也不靠，谁也不信',      bottom:'全部' },
  { id:'zuzhi',   n:'佟建民', p:'组织部长',   f:'中立',  line:'人事的闸门',                 bottom:'' },
  { id:'zhengfa', n:'韩树声', p:'政法委书记', f:'本土',  line:'管着公安，消息最灵',         bottom:'青川旧账' },
  { id:'xuanchuan',n:'方静仪',p:'宣传部长',   f:'中立',  line:'怕出舆情',                   bottom:'' },
  { id:'mishuzhang',n:'邱仲华',p:'秘书长',    f:'老书记留下的', line:'在你和书记之间，最微妙', bottom:'前任秘书' },
  { id:'tongzhan',n:'纪守望', p:'统战部长',   f:'摇摆',  line:'常委会上的计数器',           bottom:'' }
];
var QX_DEF = [
  { id:'chengguan', n:'城关区', tag:'老城 · 旧改 · 信访大户', head:'邵国栋', hl:'本土派，市长的老部下' },
  { id:'gaoxin',    n:'高新区', tag:'新城 · 招商 · 地价',     head:'吴敬之', hl:'书记带来的人，冲' },
  { id:'gangkou',   n:'港口区', tag:'物流 · 国企 · 老工业',   head:'崔延平', hl:'老书记留下的人，稳，账不干净' },
  { id:'qingchuan', n:'青川县', tag:'矿 · 化工园',           head:'马汉江', hl:'本土派，出过事压下去了' },
  { id:'baisha',    n:'白沙县', tag:'农业 · 搬迁 · 贫困退出', head:'程一鸣', hl:'年轻，省里挂职下来的' },
  { id:'meiling',   n:'梅岭县', tag:'文旅 · 生态红线',       head:'贺兰生', hl:'快退了，求个善终' }
];
var FAM_DEF = [
  { id:'wife',   n:'爱人', line:'市一院护士，三班倒，比你还忙' },
  { id:'kid',    n:'儿子', line:'四岁，幼儿园中班' },
  { id:'father', n:'父亲', line:'老家县城，退休教师，血压一直不稳' }
];

var NPC = {};   /* 运行时状态 */

function npcInit(){
  if (G.npc) return;
  G.npc = {};
  NPC_DEF.forEach(function(d){
    G.npc[d.id] = { to: 0, fav: d.id === 'boss' ? 50 : 40 + ri(20), grip: 0, known: 0 };
  });
  G.qx = {};
  QX_DEF.forEach(function(d){ G.qx[d.id] = { fav: 45 + ri(15) }; });
}
function npcFavor(id, v){
  npcInit();
  if (id === 'me' || id === 'boss' && false) return;
  if (G.npc[id]){ G.npc[id].fav = clamp(G.npc[id].fav + v, 0, 100); return; }
  if (G.qx && G.qx[id]){ G.qx[id].fav = clamp(G.qx[id].fav + v, 0, 100); return; }
  if (POOL_BY_ID[id]){ Pool.favor(id, v); Pool.reveal(id); }
}
function npcName(id){
  for (var i = 0; i < NPC_DEF.length; i++) if (NPC_DEF[i].id === id) return NPC_DEF[i].n;
  for (var j = 0; j < QX_DEF.length; j++) if (QX_DEF[j].id === id) return QX_DEF[j].head;
  return id;
}
var BOSS_NAME = { steady:'稳健型', strong:'强势型', shrewd:'精明型' };
