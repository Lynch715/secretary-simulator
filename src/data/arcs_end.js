/* ── 第四年那一轮调整，和书记要走的那件事 ── */
defArc(
{ id:'hr_y4', n:'第四年干部调整', at:[47,49], stages:[

  { id:'q1', src:'办文', gap:0,
    title:'换届前最后一轮调整',
    text:'名单送来的时候佟建民多说了一句：今年动得多。\n翻到市委办那一页，副秘书长那一栏有两个人，第一个是你。',
    nt:'名单原样上了会。副秘书长那一栏定的是另外一个人',
    mats:[
      { id:'q1_m1', t:'市委办那一页', from:'组织部', d:1,
        text:'两个人。你和市府办一位副主任，他比你大六岁，在那个位子上待了四年。',
        for:['你有戏'] },
      { id:'q1_m2', t:'今年的考察情况', from:'组织部', d:1,
        text:'你的测评优秀率八成七。评语里有一条：原则性强，但在个别事项上处理偏硬。',
        for:['你有戏','有人不服'] },
      { id:'q1_m3', t:'这几年关于你的反映', from:'机关纪委', d:2,
        text:'三件。一件查无实据，一件已经说明，还有一件写着「正在核实」。',
        for:['有人不服'], against:['你有戏'] }
    ],
    finds:[
      { id:'你有戏', t:'这一栏你排在前面', need:2 },
      { id:'有人不服', t:'有人不会让你顺利过去', need:2 }
    ],
    opts:[
      { t:'原样呈，自己的那一页不多说一个字', d:1, tier:'good',
        n:'书记翻到那一页停了两秒，抬头看了你一眼，什么也没说',
        fx:{rep:+5},
        rk:{ steady:'知道了。', strong:'这个名单我看过了。', shrewd:'这一页你自己看过吧？' } },
      { t:'主动提出回避，让别人办这份文', d:2, tier:'good',
        n:'你把夹子交给了葛守业。他接的时候说了句：应该的',
        fx:{rep:+10, clean:+3, npc:{keshang:+8}},
        rk:{ steady:'该回避。', shrewd:'你自己提的回避？' } },
      { t:'把那条「正在核实」的说明附上去', d:2, tier:'tail', reqFind:'有人不服',
        n:'书记看完问了一句这件事查到哪一步了。你说三个月前就结了',
        fx:{trust:+4, rep:+3, lead:+3},
        rk:{ shrewd:'既然结了，为什么还写着正在核实？' } }
    ],
    next:{ '*':'q2' }, lateNext:'q2',
    neglect:{ rep:-4 } },

  { id:'q2', src:'主线', gap:1, topic:'人事', need:5,
    title:'最后一轮上会',
    text:'议题里有你自己那一栏。按规矩，议到那一栏的时候你要退出会议室。\n在外面站的那十几分钟，是这五年最长的十几分钟。',
    nt:'会开完了。副秘书长那一栏挂起来，留给了下一届',
    lean:{ mayor:-2, vice1:-1, depsec:-1, jiwei:0, zuzhi:+1,
           zhengfa:-1, xuanchuan:+1, mishuzhang:-2, tongzhan:0 },
    mats:[
      { id:'q2_m1', t:'秘书长的意见', from:'市委办', d:1, who:'mishuzhang',
        text:'写了很长，讲办公室的梯队建设。通篇没提你的名字。' },
      { id:'q2_m2', t:'组织部长的说明', from:'组织部', d:1, who:'zuzhi',
        text:'按程序列了两个人的情况，排序是你在前。' }
    ],
    acts:[
      { t:'请书记出面跟罗明川谈', d:1, eff:{depsec:+3}, fx:{trust:-2},
        n:'人事上他只认书记', after:'他的意见改成了「同意」' },
      { t:'去秘书长办公室坐一个下午', d:2, eff:{mishuzhang:+3},
        n:'能坐下来谈的机会，往后不会再有了', after:'他说梯队建设不耽误个人进步' },
      { t:'跟高振邦打个招呼', d:1, eff:{vice1:+2},
        n:'他跟这事没关系，所以最好说话', after:'他说他投赞成' },
      { t:'去纪守望那儿坐半小时', d:1, eff:{tongzhan:+1},
        n:'他看大多数', after:'他说到时候看' }
    ],
    opts:[
      { t:'退出会议室，在走廊上等', d:1, tier:'good', n:'',
        passN:'门开的时候佟建民第一个出来，对你点了下头。那一下你记了很多年',
        failN:'门开的时候没有人看你。这一栏挂起来了，留给下一届',
        fx:{}, passFx:{rep:+8, trust:+4, hr:1}, failFx:{rep:-4},
        rk:{ steady:'结果你知道了。', strong:'我投了你。', shrewd:'你在外面站了多久？' } }
    ],
    next:{},
    neglect:{ rep:-5 } }

]});

/* ── 书记要走了 ── */
var EVENTS_END = [
{ id:'boss_leave', kind:'note', src:'突发', hidden:1, due:'month', once:true, endBy:'boss',
  title:'书记可能要动一动',
  text:'省里的考察组上周来过，在招待所谈了两天，谈的是周维安。\n昨天晚上快十一点，他站在窗边说了一句：可能要动一动。说完就没再说话。\n新书记什么时候来，来的是谁，现在谁也不知道。',
  nt:'',
  opts:[
    { t:'说想跟着走', d:0, tier:'good',
      n:'他回过头看了你一会儿，说：那边的规矩跟这儿不一样。你说我学',
      fx:{trust:+5}, setf:{followBoss:1, bossRoad:'follow'},
      rk:{} },
    { t:'说想留在云州', d:0, tier:'good',
      n:'他点点头说，云州也挺好，你在这儿根扎得深',
      fx:{rep:+3}, setf:{bossRoad:'stay'},
      rk:{} },
    { t:'什么也没说', d:0, tier:'tail',
      n:'你给他续了杯茶就出来了。这是你最后一次给他倒水',
      fx:{}, setf:{bossRoad:'none'},
      rk:{} }
  ],
  neglect:{} }
];
