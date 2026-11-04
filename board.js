// 보드게임 공용 부품 「조심조심 AI」: 구불구불 길 지도 + 말 + 주사위 + 방패 카드 손패 + 사건 질문
// 연습 모드(혼자)와 교실 대결(선생님 화면, 모둠 여러 개 차례제)에서 같이 쓴다. 필요: cards.js(CARDS), deck.js(DECK), fx.js(FX)
window.BOARD = (function () {
  const SHIELD_MAX = 3, GOOD = 2;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const COLORS = ['#FFC247', '#6EE7D0', '#FF8FB1', '#8FB4FF', '#C9A0FF', '#FF9A5C'];

  const css = `
.bd{--tk:64px;--cw:92px;position:relative;display:flex;flex-direction:column;height:calc(100vh - 36px);min-height:620px;color:#F4F0E8;font:500 18px/1.5 var(--font,Pretendard,sans-serif);text-align:left;user-select:none}
.bd.cls{--tk:70px;--cw:128px;font-size:21px}
.bd-top{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 4px 8px}
.bd-top h2{font:400 clamp(26px,3vw,36px) var(--head,sans-serif);color:#FFC247}
.bd-top .st{color:#A9A3B8;font-size:16px}.bd-top .st b{color:#FFC247}.bd-top a{cursor:pointer;font-weight:700;color:#F4F0E8;white-space:nowrap;border-bottom:2px solid transparent}.bd-top a:hover{border-color:#FFC247;color:#FFC247}
.bd-map{flex:1;position:relative;min-height:0;border-radius:16px;background:radial-gradient(ellipse at 50% 30%,#241d3a,#15121F 75%);border:1px solid #3A3450;overflow:hidden}
.bd-map svg{position:absolute;inset:0;width:100%;height:100%}
.bd-t{position:absolute;width:var(--tt,50px);height:var(--tt,50px);margin:calc(var(--tt,50px)/-2) 0 0 calc(var(--tt,50px)/-2);border-radius:50%;display:grid;place-items:center;font:400 17px var(--head,sans-serif);background:#241d36;border:3px solid #4a4361;color:#8d86a8;box-shadow:0 0 0 4px rgba(0,0,0,.25)}
.bd.cls .bd-t{--tt:58px;font-size:20px}
.bd-t.rest{background:#1d3a38;border-color:#6EE7D0;color:#6EE7D0;box-shadow:0 0 18px rgba(110,231,208,.45)}
.bd-t.st{border-color:#FFC247;color:#FFC247}
.bd-t.fin{--tt:84px;background:linear-gradient(135deg,#ffd36b,#ff9a3c);border-color:#fff3b8;color:#3a2400;font-size:34px;box-shadow:0 0 36px rgba(255,194,71,.8);animation:bdp 1.6s infinite}
@keyframes bdp{50%{box-shadow:0 0 62px rgba(255,194,71,1)}}
.bd-tk{position:absolute;width:var(--tk);height:var(--tk);margin:calc(var(--tk) * -1.35) 0 0 calc(var(--tk) / -2);z-index:5;transition:left .45s cubic-bezier(.3,1.4,.5,1),top .45s cubic-bezier(.3,1.4,.5,1);filter:drop-shadow(0 8px 6px rgba(0,0,0,.55))}
.bd-tk i{display:block;width:100%;height:100%;border-radius:50%;background:url(ref-main-character.png) center 18%/cover,#241d36;border:4px solid var(--c);box-shadow:0 0 22px var(--c);animation:bdb 1s infinite}
@keyframes bdb{50%{transform:translateY(-6px)}}
.bd-tk::after{content:'';position:absolute;left:50%;bottom:-7px;width:13px;height:13px;margin-left:-7px;background:var(--c);transform:rotate(45deg);z-index:-1}
.bd-tk em{position:absolute;left:50%;top:-24px;transform:translateX(-50%);white-space:nowrap;font:800 14px var(--font,sans-serif);font-style:normal;background:var(--c);color:#15121F;padding:2px 9px;border-radius:6px}
.bd-tk.on{z-index:6}.bd-tk.on i{transform-origin:50% 100%}
.bd-dice{position:absolute;right:22px;top:18px;z-index:9;display:flex;flex-direction:column;align-items:center;gap:8px;max-width:170px;text-align:center}
.bd-dice button{width:84px;height:84px;border:0;border-radius:16px;background:#fff;color:#15121F;font:400 48px var(--head,sans-serif);box-shadow:0 8px 0 #bdb7cc,0 14px 24px rgba(0,0,0,.5);cursor:pointer;transition:transform .1s}
.bd-dice button:hover:not(:disabled){transform:translateY(-3px)}.bd-dice button:disabled{opacity:.55;cursor:default}
.bd-dice button.r{animation:bdr .12s infinite}@keyframes bdr{25%{transform:rotate(18deg) translateY(-6px)}75%{transform:rotate(-18deg)}}
.bd-dice span{font-size:15px;font-weight:700;color:#FFC247;line-height:1.3}
.bd-q{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(680px,90%);max-height:94%;overflow:auto;background:rgba(21,18,31,.95);border:2px solid #FFC247;border-radius:16px;padding:22px 28px;box-shadow:0 20px 60px rgba(0,0,0,.7);z-index:8;animation:bdq .3s}
@keyframes bdq{from{opacity:0;transform:translate(-50%,-46%)}}
.bd.cls .bd-q{width:min(860px,90%);padding:28px 34px}
.bd-q small{color:#FFC247;font-weight:800;letter-spacing:.05em}.bd-q .s{margin:6px 0 8px;color:#e6e0f2;line-height:1.6}.bd-q .qq{font:400 clamp(22px,2.6vw,30px)/1.4 var(--head,sans-serif);margin:6px 0 12px;color:#fff}
.bd-q .o{display:block;width:100%;text-align:left;font:600 1em/1.4 var(--font,sans-serif);color:#fff;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.28);border-radius:10px;padding:13px 18px;margin-top:10px;cursor:pointer;transition:border-color .2s,background .2s}
.bd-q .o:hover{border-color:#FFC247;background:rgba(255,194,71,.16)}
.bd-q.g{border-color:#6EE7D0}.bd-q.b{border-color:#FF6B6B}.bd-q .go{margin-top:14px;font:700 1em var(--font,sans-serif);background:#FFC247;color:#15121F;border:0;border-radius:10px;padding:12px 28px;cursor:pointer;margin-right:10px}.bd-q .go.gh{background:none;color:#F4F0E8;border:1.5px solid #3A3450}
.bd-q .good{color:#6EE7D0}
.bd-tm{height:6px;background:#3A3450;border-radius:3px;margin:8px 0 2px;overflow:hidden}.bd-tm i{display:block;height:100%;background:#FFC247;transform-origin:left}
.bd-hand{display:flex;align-items:flex-end;justify-content:center;gap:10px;min-height:calc(var(--cw) * 1.4 + 38px);padding:30px 6px 8px;position:relative;flex-wrap:wrap}
.bd-hand .lb{position:absolute;left:6px;top:4px;color:#A9A3B8;font-size:15px}.bd-hand .lb b{color:#FFC247}
.bd-hand .none{color:#6f6988;font-size:16px;padding-bottom:24px}
.bd-c{width:var(--cw);height:calc(var(--cw) * 1.4);border-radius:10px;background:linear-gradient(160deg,#2b2312,#1a1626 60%);border:2px solid #FFC247;position:relative;overflow:hidden;cursor:pointer;transition:transform .25s,box-shadow .25s,filter .3s;box-shadow:0 0 14px rgba(255,194,71,.25)}
.bd-c .im{position:absolute;inset:0 0 34%;background:var(--i) center/cover}
.bd-c .nm{position:absolute;left:0;right:0;bottom:0;height:34%;display:grid;place-items:center;text-align:center;padding:0 4px;font:400 calc(var(--cw) * .15)/1.15 var(--head,sans-serif);color:#FFC247;background:#1a1626}
.bd-c::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 25%,rgba(255,255,255,.35) 45%,rgba(255,200,255,.25) 55%,transparent 75%);mix-blend-mode:color-dodge;opacity:.3;animation:bdh 3.5s infinite;pointer-events:none}
@keyframes bdh{50%{transform:translateX(40%)}}
.bd-c:hover{transform:translateY(-12px) scale(1.07);z-index:3}
.bd-c.glow{animation:bdg 1s infinite;border-color:#fff;transform:translateY(-14px);z-index:4}@keyframes bdg{50%{box-shadow:0 0 38px 8px rgba(255,194,71,1)}}
.bd-c.dim{filter:grayscale(.85) brightness(.5);border-color:#4a4361}.bd-c.dim::after{display:none}
.bd-c.used{filter:grayscale(1) brightness(.32);border-color:#4a4361;transform:translateY(10px);cursor:default}.bd-c.used::after{display:none}
.bd-c.fly{animation:bdf .9s forwards;z-index:30}@keyframes bdf{40%{transform:translateY(-260px) scale(1.8);opacity:1}100%{transform:translateY(-340px) scale(2.3);opacity:0}}
.bd-c.sh{animation:bds .4s}@keyframes bds{25%{transform:translateX(-9px)}75%{transform:translateX(9px)}}
.bd-fx{position:absolute;pointer-events:none;z-index:20;font:400 clamp(30px,4vw,48px) var(--head,sans-serif);color:#FFC247;text-shadow:0 0 22px rgba(255,194,71,.95);animation:bdfx 1.3s forwards;white-space:nowrap}
.bd-fx.bad{color:#FF6B6B;text-shadow:0 0 22px rgba(255,80,80,.9)}@keyframes bdfx{to{transform:translateY(-80px);opacity:0}}
.bd-big{position:absolute;left:50%;top:42%;z-index:25;pointer-events:none;font:400 min(11vw,96px) var(--head,sans-serif);color:#FFC247;text-shadow:0 0 40px rgba(255,194,71,1);animation:bdbg 1.2s forwards;white-space:nowrap}
@keyframes bdbg{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}30%{transform:translate(-50%,-50%) scale(1.1);opacity:1}100%{transform:translate(-50%,-62%) scale(1);opacity:0}}
.bd-map.shk{animation:bdsk .5s}@keyframes bdsk{20%{transform:translate(-10px,4px)}40%{transform:translate(9px,-4px)}60%{transform:translate(-6px,3px)}80%{transform:translate(4px,0)}}
.bd-res{width:min(860px,100%);margin:0 auto;padding:8px 4px}.bd-res h2{font:400 clamp(34px,5vw,54px) var(--head,sans-serif);color:#FFC247;margin-bottom:10px}
.bd-res table{width:100%;border-collapse:collapse;font-size:19px}.bd-res th{color:#A9A3B8;font-weight:600;text-align:left;padding:8px 10px;border-bottom:1px solid #3A3450}.bd-res td{padding:12px 10px;border-bottom:1px solid #3A3450}.bd-res tr.w td{color:#FFC247;font-weight:800}
.bd-res .rv{margin:16px 0;padding:14px 18px;background:rgba(255,194,71,.1);border-left:5px solid #FFC247;color:#e6e0f2}.bd-res .rv b{color:#FFC247}
.bd-res .btn{font:700 20px var(--font,sans-serif);background:#FFC247;color:#15121F;border:0;border-radius:10px;padding:14px 34px;cursor:pointer;margin:6px 10px 0 0}
@media (max-width:640px){.bd{--tk:50px;--cw:70px;font-size:16px}.bd-t{--tt:36px;font-size:13px;border-width:2px}.bd-t.fin{--tt:54px;font-size:22px}.bd-dice button{width:60px;height:60px;font-size:34px}.bd-dice{right:8px;top:8px;max-width:110px}.bd-dice span{font-size:12px}.bd-q{padding:14px 16px}}
body.bd-on #cbtn{display:none!important}
@media (prefers-reduced-motion:reduce){.bd *{animation:none!important}}`;

  // 길 좌표(0~1000 x 0~600): 3줄 뱀 모양
  function layout(len) {
    const per = Math.ceil((len + 1) / 3), P = [];
    for (let i = 0; i <= len; i++) {
      const r = Math.floor(i / per), c = i % per, x = r % 2 ? per - 1 - c : c;
      P.push({ x: 90 + 820 * x / Math.max(1, per - 1), y: 170 + 130 * r + Math.sin(i * 1.3) * 16 });
    }
    return P;
  }

  function handOf(ids) {
    const seen = new Set();
    return (ids || []).filter(id => CARDS.ALL.includes(id) && !CARDS.isSp(id) && !seen.has(id) && seen.add(id))
      .map(id => { const d = CARDS.data(id); return { id, concept: d.concept, meaning: d.meaning, img: d.img, type: d.type, used: false } })
      .sort((a, b) => (b.type === 'shield') - (a.type === 'shield'));
  }

  // o: {teams:[{name,ids,color?}], len, deck:[사건카드], refill():[사건카드], timer(초), mode:'practice'|'class', title, onExit}
  function play(root, o) {
    if (!document.getElementById('bd-css')) { const s = document.createElement('style'); s.id = 'bd-css'; s.textContent = css; document.head.appendChild(s) }
    document.body.classList.add('bd-on');
    const len = o.len || 12, cls = o.mode === 'class', P = layout(len), isRest = i => i > 0 && i < len && i % 5 === 0;
    const T = o.teams.map((t, i) => ({ name: t.name, color: t.color || COLORS[i % COLORS.length], pos: 0, ok: 0, bad: 0, blocks: 0, turns: 0, used: 0, wrong: [], hand: handOf(t.ids) }));
    let deck = shuffle(o.deck), cur = 0, q = null, busy = false, over = false, tmr = 0;

    const pct = p => `left:${p.x / 10}%;top:${p.y / 6}%`;
    let tiles = '';
    P.forEach((p, i) => { tiles += `<div class="bd-t${isRest(i) ? ' rest' : ''}${i === len ? ' fin' : ''}${i === 0 ? ' st' : ''}" style="${pct(p)}">${i === 0 ? '출발' : i === len ? '🏆' : isRest(i) ? '쉼' : i}</div>` });
    const d = 'M' + P.map(p => p.x + ',' + p.y).join(' L');
    root.innerHTML = `<div class="bd${cls ? ' cls' : ''}"><div class="bd-top"><h2>${esc(o.title || '조심조심 AI')}</h2><span class="st" id="bd-st"></span><a id="bd-x">${cls ? '그만하고 결과 보기' : '그만하기'}</a></div>
      <div class="bd-map" id="bd-map"><svg viewBox="0 0 1000 600" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="#2c2542" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path d="${d}" fill="none" stroke="#4a4361" stroke-width="3" stroke-dasharray="3 12" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>
      ${tiles}${T.map((t, i) => `<div class="bd-tk" id="bd-tk${i}" style="--c:${t.color}"><i></i>${T.length > 1 ? `<em>${esc(t.name)}</em>` : ''}</div>`).join('')}
      <div class="bd-dice"><button id="bd-dc">🎲</button><span id="bd-dl"></span></div></div>
      <div class="bd-hand" id="bd-hand"></div></div>`;
    const $ = s => root.querySelector(s), map = $('#bd-map');
    const placeAll = () => T.forEach((t, i) => {
      const e = $('#bd-tk' + i), p = P[t.pos], n = T.length, k = i - (n - 1) / 2;
      e.style.left = (p.x / 10 + k * 1.6) + '%'; e.style.top = (p.y / 6 + k * 1.2) + '%'; e.classList.toggle('on', i === cur);
    });
    const fx = (txt, pos, bad) => { const e = document.createElement('div'); e.className = 'bd-fx' + (bad ? ' bad' : ''); e.textContent = txt; e.style.left = Math.max(2, P[pos].x / 10 - 6) + '%'; e.style.top = Math.max(2, P[pos].y / 6 - 22) + '%'; map.appendChild(e); setTimeout(() => e.remove(), 1400) };
    const big = txt => { const e = document.createElement('div'); e.className = 'bd-big'; e.textContent = txt; map.appendChild(e); setTimeout(() => e.remove(), 1300) };
    const shake = () => { map.classList.remove('shk'); void map.offsetWidth; map.classList.add('shk') };
    const clearQ = () => { const e = $('.bd-q'); if (e) e.remove(); clearInterval(tmr) };
    const showQ = h => { clearQ(); const e = document.createElement('div'); e.className = 'bd-q'; e.innerHTML = h; map.appendChild(e); return e };

    function status() {
      const t = T[cur], left = Math.max(0, Math.min(SHIELD_MAX, t.hand.filter(c => c.type === 'shield').length) - t.used);
      $('#bd-st').innerHTML = (cls ? `<b>${esc(t.name)}</b> 차례 · ` : '') + `방패 <b>${left}</b>/${SHIELD_MAX} · 굴린 횟수 <b>${t.turns}</b>`;
    }
    const shieldLeft = t => Math.max(0, Math.min(SHIELD_MAX, t.hand.filter(c => c.type === 'shield').length) - t.used);
    function drawHand(glowConcept) {
      const t = T[cur], h = $('#bd-hand'), can = shieldLeft(t) > 0;
      h.innerHTML = `<div class="lb">${cls ? '<b>' + esc(t.name) + '</b>의 ' : '내 '}방패 카드 — 사건의 개념과 같은 카드가 <b>반짝</b>여요</div>` + (t.hand.length ? t.hand.map((c, i) => {
        const cl = c.used ? ' used' : c.type !== 'shield' ? ' dim' : (glowConcept && can && c.concept === glowConcept ? ' glow' : '');
        return `<div class="bd-c${cl}" data-i="${i}" title="${esc(c.concept + ' — ' + c.meaning + (c.type !== 'shield' ? ' (방패가 아니라서 쓸 수 없어요)' : ''))}"><div class="im" style="--i:url(${c.img})"></div><div class="nm">${esc(c.concept)}</div></div>`;
      }).join('') : '<div class="none">모은 카드가 아직 없어요. (이야기를 체험하면 방패 카드를 얻어요)</div>');
      status();
    }
    const handCard = (concept) => { const t = T[cur]; return t.hand.findIndex(c => c.type === 'shield' && !c.used && c.concept === concept) };

    function turn() {
      if (over) return; busy = false; clearQ(); const t = T[cur];
      drawHand(); placeAll();
      const b = $('#bd-dc'); b.disabled = false; b.textContent = '🎲'; $('#bd-dl').textContent = cls ? t.name + ' 차례!\n눌러서 굴려요' : '눌러서 굴려요';
      $('#bd-dl').style.whiteSpace = 'pre-line';
      if (cls) big(t.name + ' 차례');
    }
    $('#bd-dc').onclick = async () => {
      if (busy || over) return; busy = true; const b = $('#bd-dc'), t = T[cur]; b.disabled = true; b.classList.add('r'); let n = 1;
      for (let i = 0; i < 8; i++) { n = 1 + Math.floor(Math.random() * 3); b.textContent = n; FX.play('tick'); await sleep(90) }
      b.classList.remove('r'); t.turns++;
      for (let s = 0; s < n && t.pos < len; s++) { t.pos++; placeAll(); FX.play('tick'); await sleep(430) }
      status();
      if (t.pos >= len) return finish();
      if (isRest(t.pos)) { fx('☕ 쉼 칸', t.pos); FX.play('mid'); await sleep(1300); return next() }
      ask();
    };
    function take(t) {
      if (!deck.length) deck = shuffle(o.refill ? o.refill() : o.deck);
      let i = deck.findIndex(c => c.g !== t.name); if (i < 0) i = 0; return deck.splice(i, 1)[0];
    }
    function ask() {
      const t = T[cur], c = take(t), os = shuffle(c.o); q = { c, os };
      const el = showQ(`<small>${esc(c.g)} · 개념 「${esc(c.k)}」${cls ? ' · ' + esc(t.name) + ' 차례' : ''}</small><p class="s">${esc(c.s)}</p><p class="qq">${esc(c.q)}</p>${os.map((x, i) => `<button class="o" data-i="${i}">${esc(x.t)}</button>`).join('')}${o.timer ? '<div class="bd-tm"><i id="bd-tmi"></i></div>' : ''}`);
      FX.play('show'); drawHand(c.k);
      el.onclick = e => { const b = e.target.closest('.o'); if (b) answer(os[+b.dataset.i]) };
      if (o.timer) {
        const t0 = Date.now(), bar = $('#bd-tmi');
        tmr = setInterval(() => { const f = 1 - (Date.now() - t0) / 1000 / o.timer; if (bar) bar.style.transform = `scaleX(${Math.max(0, f)})`; if (f <= 0) { clearInterval(tmr); answer(null) } }, 100);
      }
    }
    function result(good, msg, o2, c, extra) {
      const t = T[cur], okOpt = c.o.find(x => x.ok);
      showQ(`<small>${esc(t.name)} · 개념 「${esc(c.k)}」</small><p class="qq">${esc(msg)}</p>${o2 && o2.r ? `<p class="s">${esc(o2.r)}</p>` : ''}${good ? '' : `<p class="s good">좋은 선택: ${esc(okOpt.t)}<br>${esc(okOpt.r || '')}</p>`}${extra || ''}<button class="go" id="bd-nx">${t.pos >= len ? '결과 보기' : cls ? '다음 모둠 차례' : '다음 차례'}</button>`).classList.add(good ? 'g' : 'b');
      $('#bd-nx').onclick = () => t.pos >= len ? finish() : next();
    }
    function answer(opt) {
      if (!q) return; clearInterval(tmr); const t = T[cur], c = q.c; q = null;
      if (opt && opt.ok) {
        t.ok++; t.pos = Math.min(len, t.pos + GOOD); FX.play('good'); fx('✨ +' + GOOD + '칸', t.pos); placeAll(); drawHand(); status();
        return result(true, '좋은 선택! ' + GOOD + '칸 앞으로 ▶', opt, c);
      }
      t.wrong.push(c.k);
      const hi = handCard(c.k), can = hi >= 0 && shieldLeft(t) > 0, why = opt ? '' : '시간이 다 됐어요. ';
      if (can) {
        drawHand(c.k); FX.play('mid');
        const el = showQ(`<small>${esc(t.name)} · 개념 「${esc(c.k)}」</small><p class="qq">${why}아쉬운 선택이에요. 맞는 방패 카드(「${esc(c.k)}」)가 반짝여요!</p>${opt && opt.r ? `<p class="s">${esc(opt.r)}</p>` : ''}<button class="go" id="bd-use">🛡 방패 사용!</button><button class="go gh" id="bd-no">그냥 받기</button>`);
        el.classList.add('b');
        const use = () => { useShield(hi, c, opt); }, no = () => { penalty(c, opt, why) };
        $('#bd-use').onclick = use; $('#bd-no').onclick = no; $('#bd-hand').onclick = e => { const x = e.target.closest('.bd-c'); if (x && +x.dataset.i === hi) use() };
        return;
      }
      penalty(c, opt, why, t.hand.some(x => x.type === 'shield' && !x.used) ? '맞는 방패가 없어요 (사건의 개념과 같은 방패 카드가 있어야 해요)' : '');
    }
    function useShield(hi, c, opt) {
      const t = T[cur], e = $('#bd-hand').children[hi + 1]; $('#bd-hand').onclick = null;
      t.hand[hi].used = true; t.used++; t.blocks++; FX.play('mid'); try { FX.confetti() } catch (x) {}
      if (e) e.classList.add('fly'); big('🛡 방패 사용!'); clearQ(); busy = true;
      setTimeout(() => { drawHand(); result(true, '방패로 막았어요! 뒤로 가지 않아요 🛡', opt, c) }, 950);
    }
    function penalty(c, opt, why, note) {
      const t = T[cur]; $('#bd-hand').onclick = null; t.bad++; t.pos = Math.max(0, t.pos - GOOD); FX.play('bad'); shake(); fx('💥 −' + GOOD + '칸', t.pos, true); placeAll();
      if (note) { const h = $('#bd-hand').querySelector('.bd-c:not(.dim):not(.used)'); if (h) { h.classList.add('sh') } }
      drawHand();
      result(false, why + '아쉬운 선택… ' + GOOD + '칸 뒤로 ◀', opt, c, note ? `<p class="s">${esc(note)}</p>` : '');
    }
    $('#bd-hand').onclick = null;
    root.addEventListener('click', e => { // 질문 중 방패가 아닌 카드를 누르면 흔들림 + 안내
      const x = e.target.closest('.bd-c'); if (!x || !q || e.target.closest('.bd-q')) return;
      if (x.classList.contains('glow')) { x.classList.add('sh'); setTimeout(() => x.classList.remove('sh'), 400); fx('틀렸을 때 쓸 수 있어요', T[cur].pos); return }
      x.classList.add('sh'); setTimeout(() => x.classList.remove('sh'), 400); fx('이 사건엔 맞는 방패가 아니에요', T[cur].pos, true);
    });
    function next() { cur = (cur + 1) % T.length; turn() }
    function finish() {
      if (over) return; over = true; clearQ(); FX.play('good'); try { FX.confetti() } catch (e) {}
      const R = T.slice().sort((a, b) => b.pos - a.pos || b.ok - a.ok || a.turns - b.turns), words = [...new Set([].concat(...T.map(t => t.wrong)))];
      root.innerHTML = `<div class="bd-res"><h2>${T.length > 1 ? '🏆 ' + esc(R[0].name) + ' 우승!' : '도착! 🎉'}</h2>
        <table><tr><th>순위</th><th>${T.length > 1 ? '모둠' : '나'}</th><th>간 곳</th><th>굴린 횟수</th><th>좋은 선택</th><th>아쉬운 선택</th><th>방패로 막음</th></tr>
        ${R.map((t, i) => `<tr class="${i === 0 ? 'w' : ''}"><td>${i + 1}</td><td>${esc(t.name)}</td><td>${t.pos >= len ? '도착' : t.pos + '칸'}</td><td>${t.turns}</td><td>${t.ok}</td><td>${t.bad}</td><td>${t.blocks}</td></tr>`).join('')}</table>
        ${words.length ? `<div class="rv"><b>다시 생각해 볼 말:</b> ${words.map(esc).join(' · ')}</div>` : ''}
        <div class="rv"><b>오늘 배운 말:</b> 확인하기 · 정보 지키기 · 사람을 해치지 않기 · 밝히기와 내 책임</div>
        <button class="btn" id="bd-ex">${o.mode === 'class' ? '처음 화면으로' : '메뉴로'}</button></div>`;
      $('#bd-ex').onclick = () => o.onExit && o.onExit();
    }
    $('#bd-x').onclick = () => { if (cls) { if (confirm('지금까지의 위치로 결과를 볼까요?')) finish() } else { clearQ(); o.onExit && o.onExit() } };
    turn();
    return { finish };
  }
  return { play, COLORS };
})();
