/* ── 汇总表。必须排在所有 events_*.js 之后，文件名前缀 zz_ 就是干这个的 ──
   （拼进来的顺序不影响抽取，抽取只看权重）*/
if (typeof EVENTS_DOSSIER !== 'undefined') EVENTS = EVENTS.concat(EVENTS_DOSSIER);
if (typeof EVENTS_PRIVATE !== 'undefined') EVENTS = EVENTS.concat(EVENTS_PRIVATE);
if (typeof EVENTS_JIA     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_JIA);
if (typeof EVENTS_GZ      !== 'undefined') EVENTS = EVENTS.concat(EVENTS_GZ);
if (typeof EVENTS_XIN     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_XIN);
if (typeof EVENTS_GAO     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_GAO);
if (typeof EVENTS_BAN     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_BAN);
if (typeof EVENTS_MSZ     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_MSZ);
if (typeof EVENTS_G       !== 'undefined') EVENTS = EVENTS.concat(EVENTS_G);
if (typeof EVENTS_CHU     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_CHU);
if (typeof EVENTS_HR3     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_HR3);
if (typeof EVENTS_END     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_END);
if (typeof EVENTS_CUT     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_CUT);
if (typeof EVENTS_SJ      !== 'undefined') EVENTS = EVENTS.concat(EVENTS_SJ);
if (typeof EVENTS_TF      !== 'undefined') EVENTS = EVENTS.concat(EVENTS_TF);
if (typeof EVENTS_SONG    !== 'undefined') EVENTS = EVENTS.concat(EVENTS_SONG);
if (typeof EVENTS_FAC     !== 'undefined') EVENTS = EVENTS.concat(EVENTS_FAC);

var EV_BY_ID = {};
EVENTS.forEach(function(e){ EV_BY_ID[e.id] = e; });
