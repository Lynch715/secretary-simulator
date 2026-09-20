/* ── 24-cut：插队。三种事从队列外面进来，抢的是你的天数 ──
   随行、书记临时叫你、出差撞上家里。它们不参与随机抽取，
   也不顺延——这个月的时间过去了就是过去了 */
var Cut = {
  gen: function(){
    if (G.ending || G.month < 3) return;

    /* 随行：一年三四回。家里正紧的时候，来的是另一件 */
    if (!Desk.has('cut_trip') && !Desk.has('cut_trip_fam') &&
        !(G.cool.cut_trip > G.month) && !(G.cool.cut_trip_fam > G.month) &&
        rnd() < 0.24){
      var famHot = G.hidden.fam >= 8 && !G.hidden.famBroken;
      Desk.push(famHot ? 'cut_trip_fam' : 'cut_trip', 'month');
    }

    /* 书记临时叫你：一个月最多一次 */
    if (G.month >= 4 && !Desk.has('cut_call') && rnd() < 0.3){
      Desk.push('cut_call', 'month');
    }
  }
};
