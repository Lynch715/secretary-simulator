/* ── 25-cards：手里的牌。人情、消息 ─────────────────────
   坏的东西照旧藏着（线索、欠账、报复）。到手的好东西要看得见、用得上 */
var CARD_MAX = { favor:6, info:4 };
var FAVOR_AT = 6;      /* 一件事让他对你的好感一次涨这么多，他就记你一次 */
var INFO_GX  = 5;      /* 一件事让你的人脉一次涨这么多，你顺带听到点什么 */

var Cards = {
  init: function(){ if (!G.cards) G.cards = []; },

  all: function(){ Cards.init(); return G.cards; },
  find: function(cid){
    Cards.init();
    for (var i = 0; i < G.cards.length; i++) if (G.cards[i].id === cid) return G.cards[i];
    return null;
  },
  has: function(type, who){
    Cards.init();
    for (var i = 0; i < G.cards.length; i++)
      if (G.cards[i].type === type && G.cards[i].who === who) return G.cards[i];
    return null;
  },

  /* 牌面上那一行 */
  label: function(c){
    var s = Pool.side(c.who);
    return c.type === 'favor' ? s.n + ' 记着你一次' : (c.t.length > 15 ? c.t.slice(0, 14) + '…' : c.t);
  },

  add: function(type, who, from, text){
    Cards.init();
    if (!who || who === 'me' || who === 'boss' || who === 'jiwei' && type === 'favor') return null;
    if (type === 'favor' && Cards.has('favor', who)) return null;   /* 一个人只记你一次 */
    if (type === 'info'){
      var lines = INFO[who]; if (!lines) return null;
      var left = lines.filter(function(t){
        return !G.cards.some(function(c){ return c.type === 'info' && c.t === t; }) &&
               !(G.infoUsed && G.infoUsed[t]);
      });
      if (!left.length) return null;
      text = left[ri(left.length)];
    }
    G.cardN = (G.cardN || 0) + 1;
    var c = { id:'c' + G.cardN, type:type, who:who, from:from || '', t:text || '', m:G.month };
    G.cards.push(c);
    /* 放久了的先淡掉 */
    var same = G.cards.filter(function(x){ return x.type === type; });
    if (same.length > CARD_MAX[type]){
      var old = same[0];
      G.cards = G.cards.filter(function(x){ return x !== old; });
    }
    G.cardGot = (G.cardGot || 0) + 1;
    return c;
  },

  drop: function(cid){
    Cards.init();
    G.cards = G.cards.filter(function(c){
      if (c.id !== cid) return true;
      if (c.type === 'info'){ if (!G.infoUsed) G.infoUsed = {}; G.infoUsed[c.t] = 1; }
      return false;
    });
    G.cardUsed = (G.cardUsed || 0) + 1;
  },

  /* 办完一件事，看看到手了什么。返回新到手的牌 */
  gain: function(e, o){
    var got = [];
    if (!o || !o.fx) return got;
    var owes = o.fx.owe ? o.fx.owe.who : null;
    if (o.fx.npc){
      for (var k in o.fx.npc){
        if (o.fx.npc[k] >= FAVOR_AT && k !== owes){
          var c = Cards.add('favor', k, e.title);
          if (c) got.push(c);
        }
      }
    }
    if ((o.fx.gx || 0) >= INFO_GX || o.info){
      var who = o.info || Cards.someone();
      var ci = Cards.add('info', who, e.title);
      if (ci) got.push(ci);
    }
    return got;
  },

  someone: function(){
    var ks = []; for (var k in INFO) ks.push(k);
    return ks[ri(ks.length)];
  },

  /* 这件事能不能一个电话办掉。只有普通的便签才行：
     主线、常委会、排人、卷宗、家里的事、现生成的事都不行 */
  plain: function(e){
    if (!e || !e.opts) return false;
    if (e.arc || e.acts || e.slot || e.mats || e.fam || e.force || e.endBy) return false;
    if (e.src === '家里' || e.src === '主线' || e.src === '常委会') return false;
    if (G.gen && G.gen[e.id]) return false;
    if (/^(lead_|owe_|hurt_|her_)/.test(e.id)) return false;
    return true;
  },

  /* 手里哪张人情牌对得上这件事 */
  callFor: function(e){
    if (!Cards.plain(e)) return null;
    Cards.init();
    var who = CALL_ON[e.id]; if (!who) return null;
    for (var i = 0; i < who.length; i++){
      var c = Cards.has('favor', who[i]);
      if (c && CALL[c.who]) return c;
    }
    return null;
  },

  /* 多出来的那条路 */
  callOpt: function(e){
    var c = Cards.callFor(e); if (!c) return null;
    var def = CALL[c.who];
    return { t: def.t.replace('{N}', Pool.side(c.who).n), d: 0, n: def.n, tier:'good', card: c.id, call: 1,
             fx:{ trust:+1, rep:+1 }, resN: def.res,
             rk:{ steady:'办得快。', strong:'好。', shrewd:'这回是谁帮的忙？' } };
  },

  /* 跟书记提一句 */
  tell: function(cid){
    var c = Cards.find(cid); if (!c || c.type !== 'info') return null;
    if (G.flags.toldMo === G.month) return null;
    G.flags.toldMo = G.month;
    applyFx({ trust:+1.5 });
    Cards.drop(cid);
    meritAdd('跟书记提过一句：' + c.t);
    logAdd('跟书记提了一句');
    save();
    return pick(TELL_BOSS[G.bossType] || TELL_BOSS.steady);
  },

  /* 常委会前打一张牌 */
  play: function(uid, cid){
    var it = Desk.find(uid); if (!it || it.done) return;
    var e = EV(it.id); if (!e || !e.acts) return;
    var c = Cards.find(cid); if (!c) return;
    if (VOTERS.indexOf(c.who) < 0) return;
    if (c.type === 'info'){
      if (!it.peek) it.peek = {};
      it.peek[c.who] = 1;
      logAdd(e.title + '：摸了' + Pool.side(c.who).n + '的底');
    } else {
      if (!it.eff) it.eff = {};
      it.eff[c.who] = (it.eff[c.who] || 0) + 2.5;
      if (!it.peek) it.peek = {};
      it.peek[c.who] = 1;
      if (!it.called) it.called = {};
      it.called[c.who] = 1;
      logAdd(e.title + '：' + Pool.side(c.who).n + '还了你一次');
    }
    Cards.drop(cid);
    save(); UI.render();
  },

  /* 这场会上手里能打的牌 */
  forMeeting: function(it, e){
    Cards.init();
    return G.cards.filter(function(c){
      if (VOTERS.indexOf(c.who) < 0) return false;
      if (c.type === 'info') return !it || !Meeting.known(it, e, c.who);   /* 已经知道的人不用再摸 */
      return !(it && it.called && it.called[c.who]);
    });
  }
};
