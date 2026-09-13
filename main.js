(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const screens = $$('.screen');
  const canvas = $('#gameCanvas');
  const ctx = canvas.getContext('2d');
  const dCanvas = $('#designerCanvas');
  const dctx = dCanvas.getContext('2d');
  const levelGrid = $('#levelGrid');
  const towerButtons = $('#towerButtons');
  const waveBtn = $('#waveBtn');
  const toast = $('#toast');

  // Keep a fixed logical game resolution and let CSS scale the arena to whatever
  // room the browser has. This keeps tower ranges/gameplay identical on every screen.
  const WORLD_W = 960, WORLD_H = 600;
  canvas.width = WORLD_W; canvas.height = WORLD_H;
  dCanvas.width = 960; dCanvas.height = 540;

  const images = {};
  const imageFiles = {
    ping:'assets/ping.png', crash:'assets/crash.png', null:'assets/null.png',
    alonewood:'assets/alonewood.png', bluescreen:'assets/bluescreen.png', enemy:'assets/enemy.png'
  };
  Object.entries(imageFiles).forEach(([key,src]) => { const im = new Image(); im.src = src; images[key] = im; });

  const TOWERS = {
    ping:       { name:'PING',       cost:55,  range:128, rate:.27, damage:14, projectile:560, desc:'fast packets' },
    crash:      { name:'CRASH',      cost:100, range:148, rate:.92, damage:30, projectile:370, splash:55, desc:'area damage' },
    null:       { name:'NULL',       cost:140, range:170, rate:1.2, damage:66, projectile:420, slow:.62, desc:'heavy + slow' },
    alonewood:  { name:'ALONEWOOD',  cost:125, range:285, rate:.18, damage:2.8, projectile:650, desc:'huge range / chip' },
    bluescreen: { name:'BLUESCREEN', cost:260, range:360, rate:7.0, damage:235, rail:true, desc:'7s piercing railgun' }
  };

  let state = null;
  let selectedTower = 'ping';
  let raf = 0;
  let last = performance.now();
  let shake = 0;
  let audioCtx = null;
  let designerPath = [[-.03,.5],[.2,.5],[.45,.28],[.68,.7],[1.03,.52]];
  let customLevels = loadCustomLevels();

  function showScreen(id) {
    screens.forEach(s => s.classList.toggle('active', s.id === id));
    if (id !== 'gameScreen') cancelAnimationFrame(raf);
    if (id === 'designerScreen') requestAnimationFrame(drawDesigner);
  }

  function ensureAudio() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (_) {}
  }

  function tone(freq=300, duration=.05, volume=.018, type='square', endFreq=null) {
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, now);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq), now+duration);
    g.gain.setValueAtTime(volume, now); g.gain.exponentialRampToValueAtTime(.0001, now+duration);
    o.connect(g); g.connect(audioCtx.destination); o.start(now); o.stop(now+duration);
  }
  function soundShoot(type) {
    if (type==='ping') tone(520,.025,.010,'square',430);
    else if (type==='crash') tone(120,.07,.017,'sawtooth',70);
    else if (type==='null') tone(210,.06,.014,'triangle',110);
    else if (type==='alonewood') tone(700,.018,.006,'sine',560);
  }
  function soundRail() { tone(900,.20,.025,'sawtooth',90); setTimeout(()=>tone(80,.14,.018,'square',45),35); }
  function soundKill(boss) { tone(boss?75:150,boss?.16:.04,boss?.02:.006,'square',boss?35:100); }

  function toastMsg(text, ms=1100) {
    toast.textContent = text; toast.classList.add('show'); clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), ms);
  }

  function allLevels() { return [...UNRENDERED_LEVELS, ...customLevels]; }
  function loadCustomLevels() {
    try { const x = JSON.parse(localStorage.getItem('unrendered_custom_levels') || '[]'); return Array.isArray(x) ? x : []; }
    catch (_) { return []; }
  }
  function saveCustomLevels() {
    try { localStorage.setItem('unrendered_custom_levels', JSON.stringify(customLevels)); } catch (_) {}
  }

  function renderLevelCards() {
    levelGrid.innerHTML = '';
    allLevels().forEach((lvl, i) => {
      const card = document.createElement('article');
      card.className = 'level-card' + (lvl.custom ? ' custom' : '');
      const pts = lvl.path.map(p => `${Math.round(5+p[0]*90)},${Math.round(8+p[1]*72)}`).join(' ');
      card.innerHTML = `
        <div class="num">${String(i+1).padStart(2,'0')}</div>
        <svg class="mini-path" viewBox="0 0 100 80" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${lvl.tint||'#0aa1e8'}" stroke-width="2.5" vector-effect="non-scaling-stroke" /></svg>
        <h3>${escapeHtml(lvl.name)}</h3><p>${escapeHtml(lvl.description||'Custom geometry detected.')}</p>
        <div class="meta">${lvl.waves.length} WAVES // ${lvl.baseHP} HP // $${lvl.startCash}${lvl.custom?' // CUSTOM':''}</div>`;
      card.onclick = () => startLevel(i);
      levelGrid.appendChild(card);
    });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function makeTowerButtons() {
    towerButtons.innerHTML = '';
    Object.entries(TOWERS).forEach(([key,t]) => {
      const b = document.createElement('button');
      b.className = 'tower-btn' + (key===selectedTower?' selected':'');
      b.innerHTML = `${t.name} — $${t.cost}<small>${t.desc}</small>`;
      b.onclick = () => { ensureAudio(); selectedTower=key; $$('.tower-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); };
      towerButtons.appendChild(b);
    });
  }

  function startLevel(index, directLevel=null) {
    const levels = allLevels();
    const lvl = directLevel || levels[index];
    if (!lvl) return;
    state = {
      levelIndex:index, lvl, cash:lvl.startCash, hp:lvl.baseHP, wave:-1, waveRunning:false,
      spawnLeft:0, spawnTimer:0, enemies:[], towers:[], bullets:[], particles:[], floaters:[], shockwaves:[], lasers:[],
      elapsed:0, ended:false, pointer:{x:-999,y:-999}, direct:!!directLevel
    };
    $('#levelNumber').textContent = directLevel ? '??' : String(index+1).padStart(2,'0');
    $('#levelName').textContent = lvl.name; $('#resultOverlay').classList.add('hidden');
    showScreen('gameScreen'); makeTowerButtons(); syncHud(); last=performance.now(); cancelAnimationFrame(raf); raf=requestAnimationFrame(loop);
    toastMsg('CLICK EMPTY SPACE TO PLACE A TOWER',1600);
  }

  function syncHud() {
    if (!state) return;
    $('#hpText').textContent=Math.max(0,Math.ceil(state.hp)); $('#cashText').textContent=Math.floor(state.cash);
    $('#waveText').textContent=`${Math.max(0,state.wave+1)}/${state.lvl.waves.length}`;
    waveBtn.disabled=state.waveRunning||state.ended||state.wave>=state.lvl.waves.length-1;
    waveBtn.classList.toggle('ready',!waveBtn.disabled);
    if(state.wave>=state.lvl.waves.length-1&&!state.waveRunning) waveBtn.textContent='NO MORE WAVES';
    else if(state.waveRunning) waveBtn.textContent='WAVE RUNNING'; else waveBtn.textContent=`START WAVE ${state.wave+2}`;
  }

  function pathPixels() { return state.lvl.path.map(([x,y])=>({x:x*WORLD_W,y:y*WORLD_H})); }
  function pathLengthData() {
    const p=pathPixels(); let total=0; const seg=[];
    for(let i=1;i<p.length;i++){const dx=p[i].x-p[i-1].x,dy=p[i].y-p[i-1].y,len=Math.hypot(dx,dy);seg.push({a:p[i-1],b:p[i],len,start:total});total+=len;}
    return {seg,total};
  }
  function posOnPath(progress) {
    const {seg,total}=pathLengthData(); const d=progress*total; const s=seg.find(x=>d<=x.start+x.len)||seg[seg.length-1];
    const t=Math.max(0,Math.min(1,(d-s.start)/Math.max(1,s.len))); return {x:s.a.x+(s.b.x-s.a.x)*t,y:s.a.y+(s.b.y-s.a.y)*t};
  }

  function startWave() {
    ensureAudio();
    if(!state||state.waveRunning||state.ended||state.wave>=state.lvl.waves.length-1)return;
    state.wave++; const w=state.lvl.waves[state.wave]; state.spawnLeft=w.count; state.spawnTimer=0; state.waveRunning=true; syncHud();
    tone(w.boss?95:260,.08,.012,'square',w.boss?55:190);
    toastMsg(w.boss?'BOSS OBJECT HAS ENTERED THE DOCUMENT':`WAVE ${state.wave+1} // probably fine`,1300);
  }

  function spawnEnemy(w) {
    const pos=posOnPath(0); state.enemies.push({x:pos.x,y:pos.y,progress:0,hp:w.hp,maxHp:w.hp,speed:w.speed,baseSpeed:w.speed,reward:w.reward,scale:w.scale||1,boss:!!w.boss,slowTimer:0,flash:0,dead:false});
    state.shockwaves.push({x:pos.x,y:pos.y,r:5,max:42,life:.25,color:'#f0222b'});
  }

  function update(dt) {
    if(!state||state.ended)return; state.elapsed+=dt;
    if(state.waveRunning){const w=state.lvl.waves[state.wave];state.spawnTimer-=dt;while(state.spawnLeft>0&&state.spawnTimer<=0){spawnEnemy(w);state.spawnLeft--;state.spawnTimer+=w.gap;}}
    const {total}=pathLengthData();
    for(const e of state.enemies){
      if(e.dead)continue;e.slowTimer=Math.max(0,e.slowTimer-dt);e.flash=Math.max(0,e.flash-dt);const sp=e.baseSpeed*(e.slowTimer>0?.57:1);e.progress+=(sp*600/Math.max(1,total))*dt;const p=posOnPath(e.progress);e.x=p.x;e.y=p.y;
      if(e.progress>=1){e.dead=true;state.hp-=e.boss?5:1;shake=Math.max(shake,8);floater(e.x-40,e.y-20,e.boss?'-5 HP':'-1 HP','#ff7379');tone(65,.08,.012,'square',40);if(state.hp<=0)finish(false);}
    }

    for(const t of state.towers){
      t.cd-=dt; const def=TOWERS[t.type]; if(t.cd>0)continue;
      let target=null,best=-1;
      for(const e of state.enemies){if(e.dead)continue;const d=Math.hypot(e.x-t.x,e.y-t.y);if(d<=def.range&&e.progress>best){best=e.progress;target=e;}}
      if(!target)continue;
      t.cd=def.rate;
      if(def.rail) fireRailgun(t,target,def);
      else {state.bullets.push({x:t.x,y:t.y,target,speed:def.projectile,damage:def.damage,type:t.type,splash:def.splash||0,slow:def.slow||0,dead:false});soundShoot(t.type);muzzle(t.x,t.y,t.type);}
    }

    for(const b of state.bullets){if(b.dead||b.target.dead){b.dead=true;continue;}const dx=b.target.x-b.x,dy=b.target.y-b.y,d=Math.hypot(dx,dy);if(d<12){hitBullet(b);continue;}const step=Math.min(d,b.speed*dt);b.x+=dx/Math.max(1,d)*step;b.y+=dy/Math.max(1,d)*step;}
    for(const p of state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=Math.pow(.18,dt);p.vy*=Math.pow(.18,dt);}
    for(const f of state.floaters){f.y-=25*dt;f.life-=dt;}
    for(const s of state.shockwaves){s.life-=dt;s.r+=(s.max-s.r)*Math.min(1,dt*12);}
    for(const l of state.lasers)l.life-=dt;
    state.enemies=state.enemies.filter(e=>!e.dead);state.bullets=state.bullets.filter(b=>!b.dead);state.particles=state.particles.filter(p=>p.life>0);state.floaters=state.floaters.filter(f=>f.life>0);state.shockwaves=state.shockwaves.filter(s=>s.life>0);state.lasers=state.lasers.filter(l=>l.life>0);
    if(state.waveRunning&&state.spawnLeft===0&&state.enemies.length===0){state.waveRunning=false;if(state.wave===state.lvl.waves.length-1)finish(true);else{state.cash+=35+state.wave*10;toastMsg('WAVE CLEARED // BONUS CASH');tone(440,.09,.009,'sine',650);syncHud();}}
    shake*=Math.pow(.025,dt);
  }

  function fireRailgun(t,target,def){
    const dx=target.x-t.x,dy=target.y-t.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;const end={x:t.x+ux*1250,y:t.y+uy*1250};
    let hits=0;
    for(const e of state.enemies){if(e.dead)continue;const rx=e.x-t.x,ry=e.y-t.y;const along=rx*ux+ry*uy;const perp=Math.abs(rx*uy-ry*ux);if(along>=-8&&along<=1250&&perp<=26){damageEnemy(e,def.damage,0);hits++;}}
    state.lasers.push({x1:t.x,y1:t.y,x2:end.x,y2:end.y,life:.22,maxLife:.22});
    state.shockwaves.push({x:t.x,y:t.y,r:8,max:90,life:.28,color:'#9de8ff'});burst(target.x,target.y,22,'rail');shake=Math.max(shake,11);soundRail();
    const fl=$('#screenFlash');fl.classList.remove('fire');void fl.offsetWidth;fl.classList.add('fire');
    floater(t.x-25,t.y-38,`${hits} HIT${hits===1?'':'S'}`,'#bfefff');
  }

  function hitBullet(b){b.dead=true;const targets=b.splash?state.enemies.filter(e=>!e.dead&&Math.hypot(e.x-b.target.x,e.y-b.target.y)<=b.splash):[b.target];targets.forEach(e=>damageEnemy(e,b.damage,b.slow));burst(b.target.x,b.target.y,b.type==='crash'?16:7,b.type);state.shockwaves.push({x:b.target.x,y:b.target.y,r:4,max:b.type==='crash'?64:26,life:.22,color:b.type==='crash'?'#ff7d75':'#94dfff'});if(b.type==='crash')shake=Math.max(shake,5);}
  function damageEnemy(e,dmg,slow){if(e.dead)return;e.hp-=dmg;e.flash=.08;if(slow)e.slowTimer=Math.max(e.slowTimer,1.2);if(e.hp<=0){e.dead=true;const reward=Math.round(e.reward*state.lvl.rewardScale);state.cash+=reward;floater(e.x-15,e.y-30,`+$${reward}`,'#75dcff');burst(e.x,e.y,e.boss?34:13,e.boss?'boss':'kill');state.shockwaves.push({x:e.x,y:e.y,r:5,max:e.boss?100:45,life:e.boss?.45:.25,color:e.boss?'#ffd37d':'#f0222b'});shake=Math.max(shake,e.boss?13:3);soundKill(e.boss);syncHud();}}
  function burst(x,y,n,kind='normal'){const cols=kind==='rail'?['#fff','#aeefff','#278cff']:kind==='boss'?['#ffca63','#f0222b','#fff']:['#f0222b','#0aa1e8','#fff'];for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=45+Math.random()*240;state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.22+Math.random()*.55,color:cols[(Math.random()*cols.length)|0],size:2+Math.random()*4});}}
  function muzzle(x,y,type){state.shockwaves.push({x,y,r:3,max:type==='alonewood'?15:27,life:.13,color:type==='null'?'#d48cff':'#9ce7ff'});}
  function floater(x,y,text,color){state.floaters.push({x,y,text,color,life:.8});}

  function distanceToPath(x,y){const p=pathPixels();let min=Infinity;for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],vx=b.x-a.x,vy=b.y-a.y;const den=vx*vx+vy*vy||1;const t=Math.max(0,Math.min(1,((x-a.x)*vx+(y-a.y)*vy)/den));min=Math.min(min,Math.hypot(x-(a.x+vx*t),y-(a.y+vy*t)));}return min;}
  function placeTower(x,y){ensureAudio();if(!state||state.ended)return;const def=TOWERS[selectedTower];if(state.cash<def.cost)return toastMsg('INSUFFICIENT RECTANGLE FUNDS');if(distanceToPath(x,y)<48)return toastMsg('TOO CLOSE TO THE RED PROBLEM');if(state.towers.some(t=>Math.hypot(t.x-x,t.y-y)<62))return toastMsg('TOWER COLLISION.EXE');if(x<32||x>WORLD_W-32||y<32||y>WORLD_H-32)return;state.cash-=def.cost;state.towers.push({x,y,type:selectedTower,cd:def.rail?def.rate:Math.random()*.12});burst(x,y,10,'place');state.shockwaves.push({x,y,r:5,max:40,life:.24,color:'#73dcff'});tone(330,.04,.008,'square',500);syncHud();}

  function draw(){
    if(!state)return;const W=WORLD_W,H=WORLD_H;ctx.save();const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;ctx.translate(sx,sy);ctx.fillStyle='#080a0f';ctx.fillRect(-20,-20,W+40,H+40);
    ctx.strokeStyle='rgba(255,255,255,.035)';ctx.lineWidth=1;for(let x=0;x<W;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    const p=pathPixels();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(240,34,43,.13)';ctx.lineWidth=58;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y);ctx.stroke();ctx.strokeStyle='#f0222b';ctx.lineWidth=4;ctx.setLineDash([18,10,4,8]);ctx.lineDashOffset=state.elapsed*-35;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#f0222b';ctx.fillRect(W-12,p[p.length-1].y-30,12,60);
    for(const t of state.towers)drawTower(t);
    for(const b of state.bullets){ctx.save();ctx.fillStyle=b.type==='crash'?'#ff8f95':b.type==='null'?'#c38cff':b.type==='alonewood'?'#cb936d':'#75dcff';ctx.shadowBlur=10;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(b.x,b.y,b.type==='crash'?6:b.type==='alonewood'?2.5:4,0,Math.PI*2);ctx.fill();ctx.restore();}
    for(const e of state.enemies)drawEnemy(e);
    for(const s of state.shockwaves){ctx.globalAlpha=Math.max(0,s.life/.45);ctx.strokeStyle=s.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
    for(const l of state.lasers){const a=Math.max(0,l.life/l.maxLife);ctx.save();ctx.globalAlpha=a;ctx.lineCap='round';ctx.shadowBlur=28;ctx.shadowColor='#bfeeff';ctx.strokeStyle='#dffaff';ctx.lineWidth=18*a+3;ctx.beginPath();ctx.moveTo(l.x1,l.y1);ctx.lineTo(l.x2,l.y2);ctx.stroke();ctx.strokeStyle='#3997ff';ctx.lineWidth=5;ctx.stroke();ctx.restore();}
    for(const q of state.particles){ctx.globalAlpha=Math.max(0,q.life/.65);ctx.fillStyle=q.color;ctx.fillRect(q.x,q.y,q.size,q.size)}ctx.globalAlpha=1;
    for(const f of state.floaters){ctx.globalAlpha=Math.min(1,f.life*2);ctx.fillStyle=f.color;ctx.font='bold 14px Arial';ctx.fillText(f.text,f.x,f.y)}ctx.globalAlpha=1;
    if(state.pointer.x>0&&!state.ended){const d=TOWERS[selectedTower];const valid=distanceToPath(state.pointer.x,state.pointer.y)>=48&&!state.towers.some(t=>Math.hypot(t.x-state.pointer.x,t.y-state.pointer.y)<62)&&state.cash>=d.cost;ctx.strokeStyle=valid?'rgba(10,161,232,.48)':'rgba(240,34,43,.48)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(state.pointer.x,state.pointer.y,d.range,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.5;drawSprite(selectedTower,state.pointer.x,state.pointer.y,50);ctx.globalAlpha=1;}
    if(Math.sin(state.elapsed*2.4)>0.992){ctx.fillStyle='rgba(255,255,255,.07)';const y=Math.random()*H;ctx.fillRect(0,y,W,2+Math.random()*8);const xx=Math.random()*W;ctx.fillStyle='rgba(20,130,255,.08)';ctx.fillRect(xx,0,2+Math.random()*5,H)}ctx.restore();
  }

  function drawSprite(type,x,y,size){const im=images[type];if(im&&im.complete&&im.naturalWidth){ctx.imageSmoothingEnabled=true;ctx.drawImage(im,x-size/2,y-size/2,size,size)}else{ctx.strokeStyle='#0aa1e8';ctx.strokeRect(x-size/2,y-size/2,size,size)}}
  function drawTower(t){const def=TOWERS[t.type];ctx.save();ctx.translate(t.x,t.y);ctx.fillStyle=t.type==='bluescreen'?'rgba(70,90,255,.14)':t.type==='alonewood'?'rgba(190,120,75,.12)':'rgba(255,255,255,.07)';ctx.beginPath();ctx.arc(0,0,31,0,Math.PI*2);ctx.fill();drawSprite(t.type,0,0,56);ctx.strokeStyle='rgba(255,255,255,.18)';ctx.strokeRect(-28,-28,56,56);ctx.fillStyle='#d7dbe6';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(def.name,0,39);if(def.rail){const charge=1-Math.max(0,t.cd)/def.rate;ctx.fillStyle='#111827';ctx.fillRect(-28,43,56,4);ctx.fillStyle='#56c9ff';ctx.fillRect(-28,43,56*Math.max(0,Math.min(1,charge)),4)}ctx.restore();}
  function drawEnemy(e){const s=54*e.scale;ctx.save();ctx.translate(e.x,e.y);if(e.flash){ctx.globalAlpha=.55;ctx.fillStyle='#fff';ctx.fillRect(-s/2,-s/2,s,s);ctx.globalAlpha=1}const im=images.enemy;if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,-s/2,-s/2,s,s);else{ctx.strokeStyle='#f0222b';ctx.strokeRect(-s/2,-s/2,s,s)}const w=Math.max(34,s*.9);ctx.fillStyle='#25090b';ctx.fillRect(-w/2,-s/2-10,w,5);ctx.fillStyle=e.boss?'#ffbd6a':'#f0222b';ctx.fillRect(-w/2,-s/2-10,w*Math.max(0,e.hp/e.maxHp),5);if(e.slowTimer>0){ctx.strokeStyle='#b37cff';ctx.beginPath();ctx.arc(0,0,s*.42,0,Math.PI*2);ctx.stroke()}ctx.restore();}

  function finish(win){if(!state||state.ended)return;state.ended=true;state.waveRunning=false;syncHud();$('#resultEyebrow').textContent=win?'RENDER COMPLETE':'FATAL PATH EXCEPTION';$('#resultTitle').textContent=win?'YOU WIN':'BASE DELETED';$('#resultText').textContent=win?'The geometry survived. Somehow.':'Too many red things reached the end of the line.';$('#resultOverlay').classList.remove('hidden');tone(win?520:70,.25,.015,win?'sine':'sawtooth',win?780:35);}
  function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();if($('#gameScreen').classList.contains('active'))raf=requestAnimationFrame(loop);}
  function canvasPoint(ev,c=canvas){const r=c.getBoundingClientRect(),p=ev.touches?ev.touches[0]:ev;return{x:(p.clientX-r.left)/r.width*c.width,y:(p.clientY-r.top)/r.height*c.height};}

  // ---- Simple level designer ----
  function makeDesignerLevel(){
    const name=$('#designName').value.trim()||'Custom Disaster',cash=clampNum($('#designCash').value,50,9999,300),hp=clampNum($('#designHP').value,1,999,20),count=clampNum($('#designWaves').value,1,12,5),tint=$('#designTint').value||'#64e4ff';
    const path=designerPath.map(p=>[+p[0].toFixed(4),+p[1].toFixed(4)]); const waves=[];
    for(let i=0;i<count;i++){const boss=i===count-1;waves.push(boss?{count:1,hp:950+count*110,speed:.052,gap:1,reward:140,scale:1.7,boss:true}:{count:8+i*3,hp:44+i*25,speed:.072+i*.008,gap:Math.max(.28,.68-i*.065),reward:12+i*2});}
    return{id:Date.now(),name,description:'Made in the built-in Level Designer.',tint,startCash:cash,baseHP:hp,rewardScale:1,path,waves,custom:true};
  }
  function clampNum(v,min,max,fallback){const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):fallback;}
  function drawDesigner(){
    if(!$('#designerScreen').classList.contains('active'))return;const W=dCanvas.width,H=dCanvas.height;dctx.fillStyle='#090b11';dctx.fillRect(0,0,W,H);dctx.strokeStyle='rgba(255,255,255,.05)';dctx.lineWidth=1;for(let x=0;x<W;x+=48){dctx.beginPath();dctx.moveTo(x,0);dctx.lineTo(x,H);dctx.stroke()}for(let y=0;y<H;y+=48){dctx.beginPath();dctx.moveTo(0,y);dctx.lineTo(W,y);dctx.stroke()}
    const tint=$('#designTint').value||'#64e4ff';if(designerPath.length){dctx.lineCap='round';dctx.lineJoin='round';dctx.strokeStyle='rgba(240,34,43,.12)';dctx.lineWidth=52;dctx.beginPath();dctx.moveTo(designerPath[0][0]*W,designerPath[0][1]*H);for(let i=1;i<designerPath.length;i++)dctx.lineTo(designerPath[i][0]*W,designerPath[i][1]*H);dctx.stroke();dctx.strokeStyle=tint;dctx.lineWidth=4;dctx.beginPath();dctx.moveTo(designerPath[0][0]*W,designerPath[0][1]*H);for(let i=1;i<designerPath.length;i++)dctx.lineTo(designerPath[i][0]*W,designerPath[i][1]*H);dctx.stroke();designerPath.forEach((p,i)=>{dctx.fillStyle=i===0?'#55ff9a':i===designerPath.length-1?'#ff5b67':'#fff';dctx.beginPath();dctx.arc(p[0]*W,p[1]*H,8,0,Math.PI*2);dctx.fill();dctx.fillStyle='#000';dctx.font='bold 9px Arial';dctx.textAlign='center';dctx.fillText(i+1,p[0]*W,p[1]*H+3)});}
    $('#designerStatus').textContent=`${designerPath.length} path point${designerPath.length===1?'':'s'}. ${designerPath.length<2?'Add at least 2 to test.':'Ready to cause problems.'}`;
  }
  dCanvas.addEventListener('pointerdown',e=>{ensureAudio();const p=canvasPoint(e,dCanvas);designerPath.push([Math.max(-.06,Math.min(1.06,p.x/dCanvas.width)),Math.max(.03,Math.min(.97,p.y/dCanvas.height))]);tone(400,.025,.006,'sine',520);drawDesigner();});
  $('#undoPointBtn').onclick=()=>{designerPath.pop();drawDesigner()};$('#clearPathBtn').onclick=()=>{designerPath=[];drawDesigner()};$('#designTint').oninput=drawDesigner;
  $('#testDesignBtn').onclick=()=>{if(designerPath.length<2)return $('#designerStatus').textContent='Need at least 2 path points first.';startLevel(-1,makeDesignerLevel())};
  $('#saveDesignBtn').onclick=()=>{if(designerPath.length<2)return $('#designerStatus').textContent='Need at least 2 path points first.';const lvl=makeDesignerLevel();customLevels.push(lvl);saveCustomLevels();renderLevelCards();$('#designerStatus').textContent=`Saved “${lvl.name}” to this browser's level selector.`;tone(620,.08,.009,'sine',820)};
  $('#copyDesignBtn').onclick=async()=>{if(designerPath.length<2)return $('#designerStatus').textContent='Need at least 2 path points first.';const lvl=makeDesignerLevel();delete lvl.custom;const txt=JSON.stringify(lvl,null,2);try{await navigator.clipboard.writeText(txt);$('#designerStatus').textContent='Copied a level object. Paste it into window.UNRENDERED_LEVELS in levels.js.';}catch(_){$('#designerStatus').textContent='Clipboard was blocked. Open DevTools and use the saved/tested version instead.';}};

  canvas.addEventListener('pointermove',e=>{if(state)state.pointer=canvasPoint(e)});canvas.addEventListener('pointerleave',()=>{if(state)state.pointer={x:-999,y:-999}});canvas.addEventListener('pointerdown',e=>{if(!state||state.ended)return;placeTower(canvasPoint(e).x,canvasPoint(e).y)});
  $('#playBtn').onclick=()=>{ensureAudio();renderLevelCards();showScreen('levelsScreen')};$('#designerBtn').onclick=()=>{ensureAudio();showScreen('designerScreen');drawDesigner()};$('#howBtn').onclick=()=>showScreen('helpScreen');$$('[data-back="home"]').forEach(b=>b.onclick=()=>showScreen('homeScreen'));$('#exitGameBtn').onclick=()=>{renderLevelCards();showScreen('levelsScreen')};$('#resultLevelsBtn').onclick=()=>{renderLevelCards();showScreen('levelsScreen')};$('#retryBtn').onclick=()=>state.direct?startLevel(-1,state.lvl):startLevel(state.levelIndex);waveBtn.onclick=startWave;

  renderLevelCards();makeTowerButtons();drawDesigner();
})();
