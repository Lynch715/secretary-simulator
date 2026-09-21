/* ── 图挂到事件上。必须排在 zz_index.js 之后。
   事件自己写了 img / who 的以事件为准；这里只补没写的。
   没列出来的照旧按来源兜底（SCENE_BY_SRC）。链条的幕写成「线id.幕id」 ── */
var ART_IMG = {
  archive: ['ex_sec.c1','ex_sec.c3','qc_old.b2','patrol.f2','sj_pishi','ban_loumi','gz_laoganbu','sj_zhaopian'],
  car:     ['cut_trip','cut_trip_fam','sj_laolingdao','sj_koujing','ban_che','sj_jiaoren'],
  chemical:['plant_smoke','qc_request','tf_anfang','gao_diaoyan','qc_old.b4','qc_old.b5'],
  county:  ['tf_baoyu','xin_baisha','chu_xds_laoshu','chu_xz_xiangli','ban_tuiwen','tf_gongche','jia_xiulu'],
  dinner:  ['banquet_gx','sj_fanju','ex_sec.c2','classmate','msz_zhizi','ban_jiedai','chu_xz_guiju'],
  hospital:['law_stent','hurt_law','father_move','sj_laoganbu','jia_biaojiu','jia_zhicheng','tf_shitang','father_bp'],
  hotel:   ['lead_talk','lead_patrol','patrol.f3','talk_prep','talk_shao','talk_young','talk_lu','talk_ge','gz_wo','xin_me'],
  night:   ['her_water','ban_zhiban','first_speech','gao_shengli','gao_shuming','gao_shuzhi','gao_hexin',
            'sj_gaoshou','chu_bgg_yuan','ks_draft','msz_lalong','cut_call'],
  oldtown: ['old_town.a1','old_town.a2','old_town.a4','tf_shipin','tf_laoganbu_hui','gz_quzhang','gift_bag'],
  petition:['qc_old.b1','gz_jiashu','tf_qianxin','tf_jinqi','petition','gz_keyuan'],
  changwei:['old_town.a3','gao_zhuchi','ban_huiyi'],
  office:  ['boss_kin.e6','boss_leave','sj_jianbao','patrol.f1','patrol.f4']
};
var ART_WHO = {
  her_water:'her',
  sis_promo:'sister', sis_later:'sister', hurt_sister:'sister',
  fam_birthday:'wife', wife_shift:'wife', wife_dinner:'wife', jia_paiban:'wife', jia_zhicheng:'wife',
  msz_xiankan:'mishuzhang', msz_zhizi:'mishuzhang', msz_tishuo:'mishuzhang', msz_lalong:'mishuzhang',
  msz_tea:'msz_mishu', ks_draft:'keshang', talk_ge:'keshang', fzr_trip:'fuzhuren',
  gz_quzhang:'cg_quzhang', qx_material:'cg_quzhang', qx_material_late:'cg_quzhang',
  talk_prep:'qc_xianzhang', talk_shao:'chengguan', g_road:'zuzhi', sj_zhaopian:'xuanchuan',
  lead_hint:'zhengfa', sj_jiaoren:'gaoxin', ban_tuiwen:'meiling', xin_baisha:'baisha',
  'ex_sec.c2':'gangkou', 'vice_seat.d3':'mayor', 'old_town.a3':'mayor', 'old_town.a4':'dev_a',
  'boss_kin.e6':'boss', first_speech:'boss'
};
(function(){
  function find(key){
    var p = key.split('.');
    if (p.length === 1) return EV_BY_ID[key] || null;
    var a = ARCS_BY_ID[p[0]]; if (!a) return null;
    for (var i = 0; i < a.stages.length; i++) if (a.stages[i].id === p[1]) return a.stages[i];
    return null;
  }
  for (var s in ART_IMG) ART_IMG[s].forEach(function(k){ var e = find(k); if (e && !e.img) e.img = s; });
  for (var k in ART_WHO){ var e = find(k); if (e && !e.who) e.who = ART_WHO[k]; }
})();
