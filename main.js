(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const screens = $$('.screen');
  const canvas = $('#gameCanvas');
  const ctx = canvas.getContext('2d');
  const levelGrid = $('#levelGrid');
  const towerButtons = $('#towerButtons');
  const waveBtn = $('#waveBtn');
  const toast = $('#toast');

  const unitImg = new Image(); unitImg.src = 'assets/unit.png';
  const enemyImg = new Image(); enemyImg.src = 'assets/enemy.png';

  const TOWERS = {
    ping:  { name:'PING',  cost:60,  range:128, rate:0.29, damage:15, projectile:520, desc:'fast / cheap' },
    crash: { name:'CRASH', cost:95,  range:145, rate:0.88, damage:28, projectile:360, splash:52, desc:'area damage' },
    null:  { name:'NULL',  cost:135, range:168, rate:1.18, damage:62, projectile:400, slow:0.62, desc:'heavy + slow' }
  };

  let state = null;
  let selectedTower = 'ping';
  let raf = 0;
  let last = performance.now();
  let shake = 0;

  function showScreen(id) {
    screens.forEach(s => s.classList.toggle('active', s.id === id));
    if (id !== 'gameScreen') cancelAnimationFrame(raf);
  }

  function toastMsg(text, ms=1100) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), ms);
  }

  function renderLevelCards() {
    levelGrid.innerHTML = '';
    UNRENDERED_LEVELS.forEach((lvl, i) => {
      const card = document.createElement('article');
      card.className = 'level-card';
      const pts = lvl.path.map(p => `${Math.round(5+p[0]*90)},${Math.round(8+p[1]*72)}`).join(' ');
      card.innerHTML = `
        <div class="num">0${i+1}</div>
        <svg class="mini-path" viewBox="0 0 100 80" preserveAspectRatio="none">
          <polyline points="${pts}" fill="none" stroke="${lvl.tint}" stroke-width="2.5" vector-effect="non-scaling-stroke" />
        </svg>
        <h3>${lvl.name}</h3>
        <p>${lvl.description}</p>
        <div class="meta">${lvl.waves.length} WAVES // ${lvl.baseHP} HP // $${lvl.startCash}</div>`;
      card.addEventListener('click', () => startLevel(i));
      levelGrid.appendChild(card);
    });
  }

  function makeTowerButtons() {
    towerButtons.innerHTML = '';
    Object.entries(TOWERS).forEach(([key, t]) => {
      const b = document.createElement('button');
      b.className = 'tower-btn' + (key === selectedTower ? ' selected' : '');
      b.innerHTML = `${t.name} — $${t.cost}<small>${t.desc}</small>`;
      b.onclick = () => {
        selectedTower = key;
        $$('.tower-btn').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
      };
      towerButtons.appendChild(b);
    });
  }

  function startLevel(index) {
    const lvl = UNRENDERED_LEVELS[index];
    state = {
      levelIndex:index, lvl,
      cash:lvl.startCash, hp:lvl.baseHP,
      wave:-1, waveRunning:false, spawnLeft:0, spawnTimer:0,
      enemies:[], towers:[], bullets:[], particles:[], floaters:[],
      elapsed:0, ended:false, pointer:{x:-999,y:-999}
    };
    $('#levelNumber').textContent = String(index+1).padStart(2,'0');
    $('#levelName').textContent = lvl.name;
    $('#resultOverlay').classList.add('hidden');
    showScreen('gameScreen');
    makeTowerButtons();
    syncHud();
    resizeCanvas();
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
    toastMsg('CLICK EMPTY SPACE TO PLACE A TOWER', 1800);
  }

  function syncHud() {
    if (!state) return;
    $('#hpText').textContent = Math.max(0, Math.ceil(state.hp));
    $('#cashText').textContent = Math.floor(state.cash);
    $('#waveText').textContent = `${Math.max(0,state.wave+1)}/${state.lvl.waves.length}`;
    waveBtn.disabled = state.waveRunning || state.ended || state.wave >= state.lvl.waves.length-1;
    waveBtn.classList.toggle('ready', !waveBtn.disabled);
    if (state.wave >= state.lvl.waves.length-1 && !state.waveRunning) waveBtn.textContent = 'NO MORE WAVES';
    else if (state.waveRunning) waveBtn.textContent = 'WAVE RUNNING';
    else waveBtn.textContent = `START WAVE ${state.wave+2}`;
  }

  function pathPixels() {
    return state.lvl.path.map(([x,y]) => ({x:x*canvas.width, y:y*canvas.height}));
  }

  function pathLengthData() {
    const p = pathPixels();
    let total=0; const seg=[];
    for(let i=1;i<p.length;i++){
      const dx=p[i].x-p[i-1].x, dy=p[i].y-p[i-1].y, len=Math.hypot(dx,dy);
      seg.push({a:p[i-1],b:p[i],len,start:total}); total += len;
    }
    return {seg,total};
  }

  function posOnPath(progress) {
    const {seg,total}=pathLengthData();
    const d = progress*total;
    const s = seg.find(x => d <= x.start+x.len) || seg[seg.length-1];
    const t = Math.max(0, Math.min(1, (d-s.start)/s.len));
    return {x:s.a.x+(s.b.x-s.a.x)*t, y:s.a.y+(s.b.y-s.a.y)*t};
  }

  function startWave() {
    if (!state || state.waveRunning || state.ended) return;
    if (state.wave >= state.lvl.waves.length-1) return;
    state.wave++;
    const w = state.lvl.waves[state.wave];
    state.spawnLeft = w.count;
    state.spawnTimer = 0;
    state.waveRunning = true;
    syncHud();
    toastMsg(w.boss ? 'BOSS OBJECT HAS ENTERED THE DOCUMENT' : `WAVE ${state.wave+1} // probably fine`, 1300);
  }

  function spawnEnemy(w) {
    const pos = posOnPath(0);
    state.enemies.push({
      x:pos.x,y:pos.y, progress:0, hp:w.hp, maxHp:w.hp,
      speed:w.speed, baseSpeed:w.speed, reward:w.reward,
      scale:w.scale||1, boss:!!w.boss, slowTimer:0, flash:0, dead:false
    });
  }

  function update(dt) {
    if (!state || state.ended) return;
    state.elapsed += dt;

    if (state.waveRunning) {
      const w = state.lvl.waves[state.wave];
      state.spawnTimer -= dt;
      while (state.spawnLeft > 0 && state.spawnTimer <= 0) {
        spawnEnemy(w);
        state.spawnLeft--;
        state.spawnTimer += w.gap;
      }
    }

    const {total} = pathLengthData();
    for (const e of state.enemies) {
      if (e.dead) continue;
      e.slowTimer = Math.max(0,e.slowTimer-dt);
      e.flash = Math.max(0,e.flash-dt);
      const sp = e.baseSpeed * (e.slowTimer>0 ? 0.57 : 1);
      e.progress += (sp * 600 / total) * dt;
      const p = posOnPath(e.progress); e.x=p.x; e.y=p.y;
      if (e.progress >= 1) {
        e.dead=true; state.hp -= e.boss ? 5 : 1; shake = Math.max(shake, 8);
        floater(e.x-30,e.y-20, e.boss?'-5 HP':'-1 HP', '#ff7379');
        if (state.hp <= 0) finish(false);
      }
    }

    for (const t of state.towers) {
      t.cd -= dt;
      if (t.cd <= 0) {
        const def = TOWERS[t.type];
        let target = null, best = -1;
        for (const e of state.enemies) {
          if (e.dead) continue;
          const d = Math.hypot(e.x-t.x,e.y-t.y);
          if (d <= def.range && e.progress > best) { best=e.progress; target=e; }
        }
        if (target) {
          t.cd = def.rate;
          state.bullets.push({x:t.x,y:t.y,target, speed:def.projectile, damage:def.damage, type:t.type, splash:def.splash||0, slow:def.slow||0, dead:false});
        }
      }
    }

    for (const b of state.bullets) {
      if (b.dead || b.target.dead) { b.dead=true; continue; }
      const dx=b.target.x-b.x, dy=b.target.y-b.y, d=Math.hypot(dx,dy);
      if (d < 12) { hitBullet(b); continue; }
      const step=Math.min(d,b.speed*dt); b.x += dx/d*step; b.y += dy/d*step;
    }

    for (const p of state.particles) { p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt; p.vy+=80*dt; }
    for (const f of state.floaters) { f.y-=25*dt; f.life-=dt; }
    state.enemies = state.enemies.filter(e => !e.dead);
    state.bullets = state.bullets.filter(b => !b.dead);
    state.particles = state.particles.filter(p => p.life>0);
    state.floaters = state.floaters.filter(f => f.life>0);

    if (state.waveRunning && state.spawnLeft===0 && state.enemies.length===0) {
      state.waveRunning=false;
      if (state.wave === state.lvl.waves.length-1) finish(true);
      else { state.cash += 35 + state.wave*10; toastMsg('WAVE CLEARED // BONUS CASH'); syncHud(); }
    }
    shake *= Math.pow(0.03, dt);
  }

  function hitBullet(b) {
    b.dead=true;
    const targets = b.splash ? state.enemies.filter(e=>!e.dead && Math.hypot(e.x-b.target.x,e.y-b.target.y)<=b.splash) : [b.target];
    targets.forEach(e => damageEnemy(e,b.damage,b.slow));
    burst(b.target.x,b.target.y,b.type==='crash'?14:7);
    if (b.type==='crash') shake=Math.max(shake,5);
  }

  function damageEnemy(e, dmg, slow) {
    if (e.dead) return;
    e.hp -= dmg; e.flash=.08;
    if (slow) e.slowTimer = Math.max(e.slowTimer, 1.2);
    if (e.hp <= 0) {
      e.dead=true; state.cash += Math.round(e.reward*state.lvl.rewardScale);
      floater(e.x-15,e.y-30, `+$${Math.round(e.reward*state.lvl.rewardScale)}`, '#75dcff');
      burst(e.x,e.y,e.boss?30:12);
      shake=Math.max(shake,e.boss?12:3);
      syncHud();
    }
  }

  function burst(x,y,n) {
    for(let i=0;i<n;i++) state.particles.push({x,y,vx:(Math.random()-.5)*220,vy:(Math.random()-.5)*220,life:.35+Math.random()*.45});
  }
  function floater(x,y,text,color){ state.floaters.push({x,y,text,color,life:.8}); }

  function distanceToPath(x,y) {
    const p=pathPixels(); let min=Infinity;
    for(let i=1;i<p.length;i++){
      const a=p[i-1], b=p[i], vx=b.x-a.x, vy=b.y-a.y;
      const t=Math.max(0,Math.min(1,((x-a.x)*vx+(y-a.y)*vy)/(vx*vx+vy*vy)));
      min=Math.min(min,Math.hypot(x-(a.x+vx*t),y-(a.y+vy*t)));
    }
    return min;
  }

  function placeTower(x,y) {
    if (!state || state.ended) return;
    const def=TOWERS[selectedTower];
    if (state.cash<def.cost) return toastMsg('INSUFFICIENT RECTANGLE FUNDS');
    if (distanceToPath(x,y)<48) return toastMsg('TOO CLOSE TO THE RED PROBLEM');
    if (state.towers.some(t=>Math.hypot(t.x-x,t.y-y)<62)) return toastMsg('TOWER COLLISION.EXE');
    if (x<35||x>canvas.width-35||y<35||y>canvas.height-35) return;
    state.cash-=def.cost;
    state.towers.push({x,y,type:selectedTower,cd:Math.random()*.15});
    burst(x,y,8); syncHud();
  }

  function draw() {
    if (!state) return;
    const W=canvas.width,H=canvas.height;
    ctx.save();
    const sx=(Math.random()-.5)*shake, sy=(Math.random()-.5)*shake;
    ctx.translate(sx,sy);
    ctx.fillStyle='#080a0f'; ctx.fillRect(-20,-20,W+40,H+40);

    // broken grid
    ctx.strokeStyle='rgba(255,255,255,.035)'; ctx.lineWidth=1;
    for(let x=0;x<W;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    // path shadow and path
    const p=pathPixels();
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle='rgba(240,34,43,.13)'; ctx.lineWidth=58; ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y); ctx.stroke();
    ctx.strokeStyle='#f0222b'; ctx.lineWidth=4; ctx.setLineDash([18,10,4,8]); ctx.lineDashOffset=state.elapsed*-35; ctx.beginPath(); ctx.moveTo(p[0].x,p[0].y); for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y); ctx.stroke(); ctx.setLineDash([]);

    // endpoint marks
    ctx.fillStyle='#f0222b'; ctx.fillRect(W-12,p[p.length-1].y-30,12,60);

    // towers
    for (const t of state.towers) drawTower(t);
    // bullets
    for(const b of state.bullets){ctx.fillStyle=b.type==='crash'?'#ff8f95':b.type==='null'?'#c38cff':'#75dcff';ctx.beginPath();ctx.arc(b.x,b.y,b.type==='crash'?6:4,0,Math.PI*2);ctx.fill();}
    // enemies
    for(const e of state.enemies) drawEnemy(e);
    // particles
    for(const q of state.particles){ctx.globalAlpha=Math.max(0,q.life/.8);ctx.fillStyle=Math.random()>.5?'#f0222b':'#0aa1e8';ctx.fillRect(q.x,q.y,3,3);} ctx.globalAlpha=1;
    for(const f of state.floaters){ctx.globalAlpha=Math.min(1,f.life*2);ctx.fillStyle=f.color;ctx.font='bold 14px Arial';ctx.fillText(f.text,f.x,f.y);} ctx.globalAlpha=1;

    // placement preview
    if(state.pointer.x>0 && !state.ended){
      const d=TOWERS[selectedTower]; const valid=distanceToPath(state.pointer.x,state.pointer.y)>=48 && !state.towers.some(t=>Math.hypot(t.x-state.pointer.x,t.y-state.pointer.y)<62) && state.cash>=d.cost;
      ctx.strokeStyle=valid?'rgba(10,161,232,.45)':'rgba(240,34,43,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(state.pointer.x,state.pointer.y,d.range,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.45; drawUnitSprite(state.pointer.x,state.pointer.y,44); ctx.globalAlpha=1;
    }

    // occasional visual corruption strip
    if (Math.sin(state.elapsed*2.4)>0.992) { ctx.fillStyle='rgba(255,255,255,.06)'; const y=Math.random()*H; ctx.fillRect(0,y,W,2+Math.random()*8); }
    ctx.restore();
  }

  function drawUnitSprite(x,y,size) {
    if(unitImg.complete && unitImg.naturalWidth) ctx.drawImage(unitImg,x-size/2,y-size/2,size,size);
    else {ctx.strokeStyle='#0aa1e8';ctx.strokeRect(x-size/2,y-size/2,size,size);}
  }
  function drawTower(t){
    const def=TOWERS[t.type];
    ctx.save();ctx.translate(t.x,t.y);
    ctx.fillStyle=t.type==='crash'?'rgba(240,34,43,.12)':t.type==='null'?'rgba(187,103,255,.12)':'rgba(10,161,232,.12)';ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.fill();
    drawUnitSprite(0,0,54);
    ctx.fillStyle='#d7dbe6';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText(def.name,0,37);ctx.restore();
  }
  function drawEnemy(e){
    const s=52*e.scale;
    ctx.save();ctx.translate(e.x,e.y);
    if(e.flash){ctx.globalAlpha=.55;ctx.fillStyle='#fff';ctx.fillRect(-s/2,-s/2,s,s);ctx.globalAlpha=1;}
    if(enemyImg.complete&&enemyImg.naturalWidth)ctx.drawImage(enemyImg,-s/2,-s/2,s,s); else {ctx.strokeStyle='#f0222b';ctx.strokeRect(-s/2,-s/2,s,s);}
    const w=Math.max(34,s*.9);ctx.fillStyle='#25090b';ctx.fillRect(-w/2,-s/2-10,w,5);ctx.fillStyle=e.boss?'#ffbd6a':'#f0222b';ctx.fillRect(-w/2,-s/2-10,w*Math.max(0,e.hp/e.maxHp),5);
    if(e.slowTimer>0){ctx.strokeStyle='#b37cff';ctx.beginPath();ctx.arc(0,0,s*.42,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }

  function finish(win) {
    if (!state || state.ended) return;
    state.ended=true; state.waveRunning=false; syncHud();
    $('#resultEyebrow').textContent = win ? 'RENDER COMPLETE' : 'FATAL PATH EXCEPTION';
    $('#resultTitle').textContent = win ? 'YOU WIN' : 'BASE DELETED';
    $('#resultText').textContent = win ? `Level ${state.levelIndex+1} survived. Nothing important crashed.` : 'Too many red things reached the end of the line.';
    $('#resultOverlay').classList.remove('hidden');
  }

  function loop(now) {
    const dt=Math.min(.033,(now-last)/1000); last=now;
    update(dt); draw();
    if($('#gameScreen').classList.contains('active')) raf=requestAnimationFrame(loop);
  }

  function resizeCanvas() {
    const rect=$('#gameWrap').getBoundingClientRect();
    const scale=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.max(640,Math.round(rect.width*scale));
    canvas.height=Math.round(canvas.width*10/16);
  }

  function canvasPoint(ev){
    const r=canvas.getBoundingClientRect();
    const p=ev.touches?ev.touches[0]:ev;
    return {x:(p.clientX-r.left)/r.width*canvas.width,y:(p.clientY-r.top)/r.height*canvas.height};
  }

  canvas.addEventListener('pointermove', e=>{ if(!state)return; state.pointer=canvasPoint(e); });
  canvas.addEventListener('pointerleave', ()=>{if(state)state.pointer={x:-999,y:-999};});
  canvas.addEventListener('pointerdown', e=>{ if(!state||state.ended)return; const p=canvasPoint(e); placeTower(p.x,p.y); });
  window.addEventListener('resize', ()=>{ if(state && $('#gameScreen').classList.contains('active')) resizeCanvas(); });

  $('#playBtn').onclick=()=>showScreen('levelsScreen');
  $('#howBtn').onclick=()=>showScreen('helpScreen');
  $$('[data-back="home"]').forEach(b=>b.onclick=()=>showScreen('homeScreen'));
  $('#exitGameBtn').onclick=()=>showScreen('levelsScreen');
  $('#resultLevelsBtn').onclick=()=>showScreen('levelsScreen');
  $('#retryBtn').onclick=()=>startLevel(state.levelIndex);
  waveBtn.onclick=startWave;

  renderLevelCards();
  makeTowerButtons();
})();
