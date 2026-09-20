/* ── 纪律条目表：灰色选项写 rule:'xxx'，界面自动显示「可能的处理」── */
var RULES = {
  banquet:      { n:'该推的饭局没推',              lv:2, red:false, pun:'谈话提醒 / 批评教育' },
  gift:         { n:'收了礼品礼金',                lv:3, red:true,  pun:'责令退缴 / 党内警告' },
  leak:         { n:'把书记的话、没公开的文件透给别人', lv:3, red:true,  pun:'党内警告 / 调离岗位' },
  meddle:       { n:'打招呼干预项目、人事',        lv:4, red:true,  pun:'党内严重警告 / 免职' },
  false_report: { n:'数字、情况报得不实',          lv:3, red:false, pun:'责令检查 / 通报批评' },
  conceal:      { n:'知道书记或区县的事没报',      lv:2, red:false, pun:'谈话提醒 / 通报批评' },
  suppress:     { n:'压信访、压帖子',              lv:3, red:true,  pun:'通报批评 / 党内警告' },
  retaliate:    { n:'收拾举报的人',                lv:5, red:true,  pun:'撤销党内职务 / 移送' },
  obstruct:     { n:'毁材料、串口供',              lv:5, red:true,  pun:'开除党籍 / 移送司法' },
  lifestyle:    { n:'生活作风',                    lv:4, red:true,  pun:'党内严重警告 / 调离' }
};
function ruleOf(k){ return RULES[k] || null; }
/* 严重度 → 线索涨多少。
   原来是 lv*3+3，一次伸手 12~18，六十个月里伸六次就顶到 85——
   中间那一档（一局伸手两三回的人）根本没有活路。减半。 */
function leadOf(k){ var r = RULES[k]; return r ? r.lv * 1.5 + (r.red ? 1.5 : 0) : 0; }
