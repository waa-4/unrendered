// UNRENDERED LEVEL DATA
// Edit or add stages here. main.js reads window.UNRENDERED_LEVELS automatically.
// Path coordinates are normalized 0..1, so levels scale with the browser window.
window.UNRENDERED_LEVELS = [
  {
    id:1,name:"Square One",description:"A polite rectangle. It will stop being polite shortly.",tint:"#0aa1e8",startCash:330,baseHP:20,rewardScale:1,
    path:[[-.06,.28],[.18,.28],[.18,.68],[.48,.68],[.48,.24],[.76,.24],[.76,.72],[1.06,.72]],
    waves:[
      {count:8,hp:42,speed:.070,gap:.72,reward:12},{count:12,hp:58,speed:.080,gap:.55,reward:13},{count:16,hp:78,speed:.090,gap:.43,reward:14},{count:10,hp:135,speed:.072,gap:.52,reward:18},{count:1,hp:900,speed:.050,gap:.8,reward:120,scale:1.65,boss:true}
    ]
  },
  {
    id:2,name:"Bad Geometry",description:"The path gave up halfway through being a path.",tint:"#f0222b",startCash:360,baseHP:18,rewardScale:1.08,
    path:[[-.05,.82],[.18,.82],[.18,.20],[.52,.20],[.41,.44],[.62,.36],[.55,.66],[.86,.54],[1.05,.56]],
    waves:[
      {count:11,hp:60,speed:.082,gap:.52,reward:13},{count:15,hp:72,speed:.105,gap:.40,reward:14},{count:7,hp:190,speed:.068,gap:.64,reward:23,scale:1.18},{count:20,hp:92,speed:.115,gap:.34,reward:15},{count:2,hp:720,speed:.058,gap:2.2,reward:90,scale:1.5,boss:true}
    ]
  },
  {
    id:3,name:"Memory Leak",description:"Fast things. Too many things. The selector warned you.",tint:"#bb67ff",startCash:420,baseHP:16,rewardScale:1.15,
    path:[[-.06,.50],[.13,.50],[.13,.18],[.36,.18],[.36,.80],[.58,.80],[.58,.30],[.79,.30],[.79,.70],[1.06,.70]],
    waves:[
      {count:14,hp:70,speed:.105,gap:.39,reward:14},{count:24,hp:68,speed:.135,gap:.27,reward:12},{count:13,hp:170,speed:.086,gap:.45,reward:21},{count:30,hp:105,speed:.140,gap:.22,reward:14},{count:1,hp:1450,speed:.063,gap:1,reward:180,scale:1.85,boss:true}
    ]
  }
];
