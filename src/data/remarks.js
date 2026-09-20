/* ── 通用批示：选项自己没写话的时候用这一档兜底。
   空字符串 = 他没批，只在右上角签了个名。 ── */
var REMARKS = {
  good: { steady:['阅。','知道了。','这样办。','可以。'],
          strong:['好。','就这么定。','抓紧。'],
          shrewd:['材料留一份。','这个事谁还知道？',''] },
  tail: { steady:['再核一下。','稳一点。','请再报一次。'],
          strong:['为什么不早报？','下不为例。','这事没完。'],
          shrewd:['先放着。','等等看。',''] },
  gray: { steady:['','',''],
          strong:['知道了。',''],
          shrewd:['以后这类事口头讲。',''] },
  none: { steady:['？','这件事呢？'],
          strong:['下月一并交。','我等着。'],
          shrewd:['',''] }
};
function remarkOf(tier){
  var t = REMARKS[tier] || REMARKS.none;
  var a = t[G.bossType] || [''];
  return pick(a);
}
var BOSS_PREF = { steady:'老人', strong:'自己人', shrewd:'有用的' };
/* 看了半年批示之后，档案页解锁的那一句 */
var BOSS_READ = {
  steady:'他不喜欢新东西。凡事先问稳不稳，再问快不快。用人也一样，愿意用跟了多年的老人。',
  strong:'他不绕弯子。你办得好他说一个好字，办砸了当面就问为什么。他身边的人都是他自己带来的。',
  shrewd:'他很少表态，批示里一半是问句。他关心的不是这件事，是这件事是谁递上来的。'
};
