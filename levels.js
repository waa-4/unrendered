// UNRENDERED LEVEL DATA
// Edit or add stages here. main.js reads window.UNRENDERED_LEVELS automatically.
// Path coordinates are normalized 0..1, so levels scale with the browser window.
window.UNRENDERED_LEVELS = [
  {
    id:1,name:"Square One",description:"A polite rectangle. It will stop being polite shortly.",tint:"#0aa1e8",startCash:330,baseHP:20,rewardScale:1,
    path:[[-.06,.28],[.18,.28],[.18,.68],[.48,.68],[.48,.24],[.76,.24],[.76,.72],[1.06,.72]],
    waves:[
      {count:8,hp:42,speed:.070,gap:.72,reward:12},{count:12,hp:58,speed:.080,gap:.55,reward:13,type:'rusher'},{count:12,hp:62,speed:.080,gap:.48,reward:15},{count:7,hp:115,speed:.068,gap:.68,reward:20,type:'tanker'},{count:1,hp:760,speed:.050,gap:.8,reward:120,scale:1.55,boss:true,type:'tanker'}
    ]
  },
  {
    id:2,name:"Bad Geometry",description:"The path gave up halfway through being a path.",tint:"#f0222b",startCash:360,baseHP:18,rewardScale:1.08,
    path:[[-.05,.82],[.18,.82],[.18,.20],[.52,.20],[.41,.44],[.62,.36],[.55,.66],[.86,.54],[1.05,.56]],
    waves:[
      {count:11,hp:60,speed:.082,gap:.52,reward:13},{count:15,hp:66,speed:.090,gap:.40,reward:14,type:'rusher'},{count:7,hp:130,speed:.068,gap:.64,reward:23,scale:1.08,type:'tanker'},{count:20,hp:92,speed:.100,gap:.34,reward:15,type:'rusher'},{count:2,hp:610,speed:.058,gap:2.2,reward:90,scale:1.42,boss:true,type:'tanker'}
    ]
  },
  {
    id:3,name:"Memory Leak",description:"Fast things. Too many things. The selector warned you.",tint:"#bb67ff",startCash:420,baseHP:16,rewardScale:1.15,
    path:[[-.06,.50],[.13,.50],[.13,.18],[.36,.18],[.36,.80],[.58,.80],[.58,.30],[.79,.30],[.79,.70],[1.06,.70]],
    waves:[
      {count:14,hp:70,speed:.105,gap:.39,reward:14},{count:24,hp:62,speed:.105,gap:.27,reward:12,type:'rusher'},{count:11,hp:125,speed:.080,gap:.48,reward:22,type:'tanker'},{count:30,hp:95,speed:.105,gap:.22,reward:14,type:'rusher'},{count:1,hp:1100,speed:.060,gap:1,reward:180,scale:1.75,boss:true,type:'tanker'}
    ]
  }
];
