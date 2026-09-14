// UNRENDERED LEVEL DATA
// Add worlds to UNRENDERED_WORLDS and assign each level a world number.
// Path coordinates use normalized 0..1 values.
window.UNRENDERED_WORLDS = [
  { id: 1, name: "World 1", description: "First set", levelCount: 10 }
];

window.UNRENDERED_LEVELS = [
  {
    id:1,world:1,name:"Square One",description:"A simple opening route.",tint:"#0aa1e8",startCash:330,baseHP:20,rewardScale:1,
    path:[[-.06,.28],[.18,.28],[.18,.68],[.48,.68],[.48,.24],[.76,.24],[.76,.72],[1.06,.72]],
    waves:[
      {count:8,hp:42,speed:.070,gap:.72,reward:12},{count:12,hp:58,speed:.080,gap:.55,reward:13,type:'rusher'},{count:12,hp:62,speed:.080,gap:.48,reward:15},{count:7,hp:115,speed:.068,gap:.68,reward:20,type:'tanker'},{count:1,hp:760,speed:.050,gap:.8,reward:120,scale:1.55,boss:true,type:'tanker'}
    ]
  },
  {
    id:2,world:1,name:"Bad Geometry",description:"A broken route with sharper turns.",tint:"#f0222b",startCash:360,baseHP:18,rewardScale:1.08,
    path:[[-.05,.82],[.18,.82],[.18,.20],[.52,.20],[.41,.44],[.62,.36],[.55,.66],[.86,.54],[1.05,.56]],
    waves:[
      {count:11,hp:60,speed:.082,gap:.52,reward:13},{count:15,hp:66,speed:.090,gap:.40,reward:14,type:'rusher'},{count:7,hp:130,speed:.068,gap:.64,reward:23,scale:1.08,type:'tanker'},{count:20,hp:92,speed:.100,gap:.34,reward:15,type:'rusher'},{count:2,hp:610,speed:.058,gap:2.2,reward:90,scale:1.42,boss:true,type:'tanker'}
    ]
  },
  {
    id:3,world:1,name:"Memory Leak",description:"Faster enemies and heavier waves.",tint:"#bb67ff",startCash:420,baseHP:16,rewardScale:1.15,
    path:[[-.06,.50],[.13,.50],[.13,.18],[.36,.18],[.36,.80],[.58,.80],[.58,.30],[.79,.30],[.79,.70],[1.06,.70]],
    waves:[
      {count:14,hp:70,speed:.105,gap:.39,reward:14},{count:24,hp:62,speed:.105,gap:.27,reward:12,type:'rusher'},{count:11,hp:125,speed:.080,gap:.48,reward:22,type:'tanker'},{count:30,hp:95,speed:.105,gap:.22,reward:14,type:'rusher'},{count:1,hp:1100,speed:.060,gap:1,reward:180,scale:1.75,boss:true,type:'tanker'}
    ]
  },
  {
    id:4,world:1,name:"Unused",description:"Something finally got loaded.",tint:"#25b85a",startCash:430,baseHP:17,rewardScale:1.08,
    path:[[-.06,.76],[.20,.76],[.20,.27],[.46,.27],[.46,.58],[.70,.58],[.70,.18],[1.06,.18]],
    waves:[
      {count:12,hp:86,speed:.082,gap:.48,reward:14},{count:12,hp:96,speed:.078,gap:.46,reward:12,type:'unusedunloved'},{count:18,hp:84,speed:.100,gap:.32,reward:13,type:'rusher'},{count:14,hp:118,speed:.080,gap:.40,reward:13,type:'unusedunloved'},{count:2,hp:720,speed:.052,gap:1.7,reward:100,scale:1.35,boss:true,type:'unusedunloved'}
    ]
  },
  {
    id:5,world:1,name:"Change Me",description:"Nothing keeps the same pace.",tint:"#91d7e8",startCash:455,baseHP:16,rewardScale:1.1,
    path:[[-.05,.18],[.24,.18],[.24,.78],[.44,.78],[.44,.34],[.67,.34],[.67,.68],[.84,.68],[.84,.22],[1.05,.22]],
    waves:[
      {count:14,hp:94,speed:.082,gap:.42,reward:15,type:'unusedunloved'},{count:14,hp:92,speed:.085,gap:.41,reward:16,type:'changeme00'},{count:20,hp:88,speed:.094,gap:.30,reward:15,type:'changeme00'},{count:10,hp:155,speed:.070,gap:.50,reward:24,type:'tanker'},{count:3,hp:560,speed:.070,gap:1.4,reward:85,scale:1.25,boss:true,type:'changeme00'}
    ]
  },
  {
    id:6,world:1,name:"Thinking",description:"Crystal shells make clean hits harder.",tint:"#86d3e8",startCash:480,baseHP:15,rewardScale:1.12,
    path:[[-.06,.54],[.17,.54],[.32,.20],[.49,.54],[.65,.20],[.82,.54],[1.06,.54]],
    waves:[
      {count:14,hp:102,speed:.084,gap:.40,reward:16,type:'changeme00'},{count:10,hp:120,speed:.074,gap:.52,reward:18,type:'thinkingcrystals'},{count:18,hp:110,speed:.082,gap:.34,reward:18,type:'thinkingcrystals'},{count:24,hp:98,speed:.104,gap:.27,reward:15,type:'rusher'},{count:2,hp:790,speed:.055,gap:1.8,reward:125,scale:1.4,boss:true,type:'thinkingcrystals'}
    ]
  },
  {
    id:7,world:1,name:"Sculpture",description:"The route is the easy part.",tint:"#a64cac",startCash:510,baseHP:15,rewardScale:1.14,
    path:[[-.05,.83],[.16,.67],[.28,.28],[.45,.52],[.59,.16],[.76,.48],[.88,.25],[1.05,.37]],
    waves:[
      {count:12,hp:122,speed:.078,gap:.43,reward:18,type:'thinkingcrystals'},{count:8,hp:180,speed:.065,gap:.58,reward:26,type:'sculpturedemon'},{count:14,hp:150,speed:.071,gap:.42,reward:25,type:'sculpturedemon'},{count:16,hp:132,speed:.085,gap:.34,reward:18,type:'changeme00'},{count:1,hp:1450,speed:.046,gap:1,reward:220,scale:1.7,boss:true,type:'sculpturedemon'}
    ]
  },
  {
    id:8,world:1,name:"Cross Talk",description:"Everything starts showing up together.",tint:"#e78937",startCash:540,baseHP:14,rewardScale:1.16,
    path:[[-.06,.20],[.20,.20],[.34,.46],[.20,.75],[.50,.75],[.64,.46],[.50,.20],[.82,.20],[1.06,.72]],
    waves:[
      {count:18,hp:120,speed:.096,gap:.31,reward:17,type:'rusher'},{count:11,hp:150,speed:.072,gap:.47,reward:21,type:'thinkingcrystals'},{count:10,hp:195,speed:.064,gap:.51,reward:27,type:'sculpturedemon'},{count:22,hp:132,speed:.086,gap:.29,reward:18,type:'changeme00'},{count:3,hp:780,speed:.052,gap:1.3,reward:120,scale:1.35,boss:true,type:'tanker'}
    ]
  },
  {
    id:9,world:1,name:"Noisy Signal",description:"Crowded waves with almost no breathing room.",tint:"#ff4e7a",startCash:575,baseHP:13,rewardScale:1.2,
    path:[[-.06,.48],[.15,.48],[.28,.18],[.43,.48],[.58,.78],[.73,.48],[.86,.18],[1.06,.48]],
    waves:[
      {count:24,hp:128,speed:.096,gap:.26,reward:17,type:'changeme00'},{count:16,hp:160,speed:.078,gap:.35,reward:21,type:'thinkingcrystals'},{count:13,hp:205,speed:.067,gap:.42,reward:28,type:'sculpturedemon'},{count:32,hp:112,speed:.112,gap:.19,reward:15,type:'rusher'},{count:4,hp:720,speed:.058,gap:1.05,reward:105,scale:1.28,boss:true,type:'unusedunloved'}
    ]
  },
  {
    id:10,world:1,name:"World End",description:"World 1 throws everything back at you.",tint:"#f2d24c",startCash:650,baseHP:12,rewardScale:1.25,
    path:[[-.06,.78],[.14,.78],[.14,.18],[.34,.18],[.34,.72],[.52,.72],[.52,.28],[.70,.28],[.70,.78],[.86,.78],[.86,.18],[1.06,.18]],
    waves:[
      {count:18,hp:165,speed:.082,gap:.34,reward:20,type:'thinkingcrystals'},{count:18,hp:180,speed:.078,gap:.33,reward:24,type:'sculpturedemon'},{count:28,hp:140,speed:.103,gap:.22,reward:17,type:'changeme00'},{count:38,hp:118,speed:.118,gap:.17,reward:15,type:'rusher'},{count:1,hp:2400,speed:.043,gap:1,reward:360,scale:1.95,boss:true,type:'sculpturedemon'}
    ]
  }
];
