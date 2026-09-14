// UNRENDERED LEVEL DATA
// Path coordinates use normalized 0..1 values.
window.UNRENDERED_WORLDS = [
  { id: 1, name: "World 1", description: "First set", levelCount: 10 }
];

window.UNRENDERED_LEVELS = [
  {
    id:1,world:1,name:"Square One",description:"A simple opening route.",tint:"#0aa1e8",startCash:360,baseHP:24,rewardScale:1,
    path:[[-.06,.28],[.18,.28],[.18,.68],[.48,.68],[.48,.24],[.76,.24],[.76,.72],[1.06,.72]],
    waves:[
      {count:8,hp:34,speed:.062,gap:.78,reward:12},
      {count:10,hp:42,speed:.064,gap:.62,reward:13},
      {count:12,hp:38,speed:.070,gap:.54,reward:12,type:'rusher'},
      {count:6,hp:72,speed:.058,gap:.78,reward:20,type:'tanker'},
      {count:1,hp:430,speed:.044,gap:1,reward:110,scale:1.45,boss:true,type:'tanker'}
    ]
  },
  {
    id:2,world:1,name:"Bad Geometry",description:"Sharper turns and mixed waves.",tint:"#f0222b",startCash:390,baseHP:22,rewardScale:1.04,
    path:[[-.05,.82],[.18,.82],[.18,.20],[.52,.20],[.41,.44],[.62,.36],[.55,.66],[.86,.54],[1.05,.56]],
    waves:[
      {count:10,hp:44,speed:.066,gap:.64,reward:13},
      {count:13,hp:42,speed:.072,gap:.48,reward:12,type:'rusher'},
      {count:7,hp:76,speed:.058,gap:.72,reward:20,type:'tanker'},
      {count:16,hp:50,speed:.072,gap:.42,reward:14},
      {count:2,hp:330,speed:.047,gap:2.0,reward:82,scale:1.35,boss:true,type:'tanker'}
    ]
  },
  {
    id:3,world:1,name:"Memory Leak",description:"More enemies, still enough room to build.",tint:"#bb67ff",startCash:430,baseHP:20,rewardScale:1.08,
    path:[[-.06,.50],[.13,.50],[.13,.18],[.36,.18],[.36,.80],[.58,.80],[.58,.30],[.79,.30],[.79,.70],[1.06,.70]],
    waves:[
      {count:12,hp:50,speed:.070,gap:.54,reward:14},
      {count:16,hp:46,speed:.075,gap:.39,reward:12,type:'rusher'},
      {count:8,hp:84,speed:.060,gap:.66,reward:22,type:'tanker'},
      {count:20,hp:58,speed:.076,gap:.34,reward:14},
      {count:1,hp:620,speed:.048,gap:1,reward:150,scale:1.6,boss:true,type:'tanker'}
    ]
  },
  {
    id:4,world:1,name:"Unused",description:"Unused / Unloved appears here.",tint:"#25b85a",startCash:455,baseHP:20,rewardScale:1.08,
    path:[[-.06,.76],[.20,.76],[.20,.27],[.46,.27],[.46,.58],[.70,.58],[.70,.18],[1.06,.18]],
    waves:[
      {count:11,hp:58,speed:.068,gap:.52,reward:14},
      {count:10,hp:62,speed:.064,gap:.52,reward:13,type:'unusedunloved'},
      {count:15,hp:54,speed:.075,gap:.40,reward:13,type:'rusher'},
      {count:13,hp:70,speed:.066,gap:.44,reward:14,type:'unusedunloved'},
      {count:2,hp:390,speed:.047,gap:1.7,reward:95,scale:1.35,boss:true,type:'unusedunloved'}
    ]
  },
  {
    id:5,world:1,name:"Change Me",description:"ChangeMe00 changes pace while moving.",tint:"#91d7e8",startCash:485,baseHP:19,rewardScale:1.10,
    path:[[-.05,.18],[.24,.18],[.24,.78],[.44,.78],[.44,.34],[.67,.34],[.67,.68],[.84,.68],[.84,.22],[1.05,.22]],
    waves:[
      {count:12,hp:66,speed:.066,gap:.48,reward:14,type:'unusedunloved'},
      {count:11,hp:62,speed:.070,gap:.48,reward:16,type:'changeme00'},
      {count:16,hp:68,speed:.071,gap:.39,reward:16,type:'changeme00'},
      {count:8,hp:96,speed:.058,gap:.62,reward:22,type:'tanker'},
      {count:3,hp:310,speed:.054,gap:1.35,reward:76,scale:1.22,boss:true,type:'changeme00'}
    ]
  },
  {
    id:6,world:1,name:"Thinking",description:"Thinking Crystals bring a small shield.",tint:"#86d3e8",startCash:510,baseHP:18,rewardScale:1.12,
    path:[[-.06,.54],[.17,.54],[.32,.20],[.49,.54],[.65,.20],[.82,.54],[1.06,.54]],
    waves:[
      {count:12,hp:68,speed:.070,gap:.46,reward:16,type:'changeme00'},
      {count:9,hp:76,speed:.062,gap:.57,reward:18,type:'thinkingcrystals'},
      {count:14,hp:82,speed:.064,gap:.44,reward:18,type:'thinkingcrystals'},
      {count:18,hp:62,speed:.077,gap:.34,reward:14,type:'rusher'},
      {count:2,hp:440,speed:.047,gap:1.75,reward:110,scale:1.38,boss:true,type:'thinkingcrystals'}
    ]
  },
  {
    id:7,world:1,name:"Sculpture",description:"Sculpture Demon is slow and takes 2 HP if it gets through.",tint:"#a64cac",startCash:540,baseHP:18,rewardScale:1.14,
    path:[[-.05,.83],[.16,.67],[.28,.28],[.45,.52],[.59,.16],[.76,.48],[.88,.25],[1.05,.37]],
    waves:[
      {count:10,hp:82,speed:.062,gap:.50,reward:18,type:'thinkingcrystals'},
      {count:7,hp:100,speed:.055,gap:.68,reward:25,type:'sculpturedemon'},
      {count:10,hp:112,speed:.056,gap:.56,reward:26,type:'sculpturedemon'},
      {count:14,hp:80,speed:.069,gap:.42,reward:17,type:'changeme00'},
      {count:1,hp:760,speed:.041,gap:1,reward:190,scale:1.65,boss:true,type:'sculpturedemon'}
    ]
  },
  {
    id:8,world:1,name:"Cross Talk",description:"The enemy types start mixing together.",tint:"#e78937",startCash:570,baseHP:17,rewardScale:1.16,
    path:[[-.06,.20],[.20,.20],[.34,.46],[.20,.75],[.50,.75],[.64,.46],[.50,.20],[.82,.20],[1.06,.72]],
    waves:[
      {count:16,hp:68,speed:.075,gap:.36,reward:15,type:'rusher'},
      {count:10,hp:92,speed:.062,gap:.50,reward:20,type:'thinkingcrystals'},
      {count:8,hp:118,speed:.054,gap:.61,reward:27,type:'sculpturedemon'},
      {count:18,hp:82,speed:.068,gap:.36,reward:17,type:'changeme00'},
      {count:3,hp:430,speed:.046,gap:1.3,reward:105,scale:1.32,boss:true,type:'tanker'}
    ]
  },
  {
    id:9,world:1,name:"Noisy Signal",description:"Crowded, but not a speed wall.",tint:"#ff4e7a",startCash:610,baseHP:16,rewardScale:1.18,
    path:[[-.06,.48],[.15,.48],[.28,.18],[.43,.48],[.58,.78],[.73,.48],[.86,.18],[1.06,.48]],
    waves:[
      {count:18,hp:84,speed:.069,gap:.34,reward:17,type:'changeme00'},
      {count:12,hp:98,speed:.063,gap:.45,reward:20,type:'thinkingcrystals'},
      {count:10,hp:126,speed:.055,gap:.53,reward:27,type:'sculpturedemon'},
      {count:22,hp:70,speed:.080,gap:.28,reward:14,type:'rusher'},
      {count:4,hp:360,speed:.049,gap:1.05,reward:88,scale:1.25,boss:true,type:'unusedunloved'}
    ]
  },
  {
    id:10,world:1,name:"World End",description:"Everything from World 1 in one level.",tint:"#f2d24c",startCash:670,baseHP:15,rewardScale:1.22,
    path:[[-.06,.78],[.14,.78],[.14,.18],[.34,.18],[.34,.72],[.52,.72],[.52,.28],[.70,.28],[.70,.78],[.86,.78],[.86,.18],[1.06,.18]],
    waves:[
      {count:14,hp:100,speed:.064,gap:.40,reward:19,type:'thinkingcrystals'},
      {count:12,hp:128,speed:.057,gap:.44,reward:24,type:'sculpturedemon'},
      {count:20,hp:90,speed:.070,gap:.31,reward:17,type:'changeme00'},
      {count:26,hp:76,speed:.082,gap:.24,reward:14,type:'rusher'},
      {count:1,hp:1250,speed:.040,gap:1,reward:300,scale:1.9,boss:true,type:'sculpturedemon'}
    ]
  }
];
