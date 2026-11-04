// 개념 카드: 결말마다 받는 카드 연출(날아오기→회전→쾅) + 3D 기울기·홀로 빛 + 카드함(개념 도감)
// 필요: data/story1~3.js(window.STORIES), fx.js(window.FX). 카드 id는 '편번호-키'(예: 1-e3, 2-sp). 저장: 이 노트북 localStorage (서버 사용 없음)
window.CARDS = (function () {
  const KEY = 'aiethics.cards.v1', TOTAL = 18, calm = FX.calm, MAX = 18;
  const TYPE = { shield: { label: '방패', mood: 'good' }, trap: { label: '함정', mood: 'bad' }, mid: { label: '갈림길', mood: 'mid' }, special: { label: '특별', mood: 'good' } };
  const SS = window.STORIES;
  const endsOf = i => Object.keys(SS[i].nodes).filter(k => SS[i].nodes[k].end).map(k => (i + 1) + '-' + k);
  const spOf = i => (i + 1) + '-sp', isSp = id => /-sp$/.test(id);
  const GROUPS = SS.map((s, i) => ({ title: s.series, ids: endsOf(i), special: spOf(i), hint: s.no + '편의 다른 길에 숨어 있어요' }));
  const ALL = GROUPS.reduce((a, g) => a.concat(g.ids, g.special), []);
  const $ = id => document.getElementById(id), sleep = ms => new Promise(r => setTimeout(r, ms));
  let mem = [];
  const load = () => { try { const a = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(a) ? a.filter(id => ALL.includes(id)) : mem } catch (e) { return mem } };
  const save = a => { mem = a; try { localStorage.setItem(KEY, JSON.stringify(a)) } catch (e) {} };

  function data(id) {
    const [no, key] = id.split('-'), S = SS[no - 1];
    if (key === 'sp') return Object.assign({ id, img: 'img/' + id + '.jpg' }, S.special);
    const n = S.nodes[key], c = n.card;
    return { id, img: 'img/' + id + '.jpg', type: c.type, concept: c.concept, meaning: c.meaning, story: c.story, series: S.series, name: '결말 ' + n.name + ' · ' + n.title, lesson: n.lesson };
  }

  // ---------- 화면 틀·스타일 ----------
  const css = `
#cbtn{position:fixed;top:58px;right:28px;z-index:7;background:none;border:0;color:var(--ink,#F4F0E8);font:700 17px var(--font,sans-serif);cursor:pointer;padding:4px 2px;background:linear-gradient(var(--gold,#FFC247),var(--gold,#FFC247)) 0 100%/0 2px no-repeat;transition:background-size .3s,color .3s}
#cbtn:hover{background-size:100% 2px;color:var(--gold,#FFC247)}#cbtn b{color:var(--gold,#FFC247)}
#cbtn.bump{animation:cxbump .5s}@keyframes cxbump{40%{transform:scale(1.4)}}
@media (max-width:640px){#cbtn{top:50px;right:18px;font-size:15px}}
#cx-layer,#cx-box{position:fixed;inset:0;display:none;color:#F4F0E8;font:500 18px/1.6 var(--font,'Pretendard Variable',sans-serif)}
#cx-layer{z-index:9;background:rgba(10,8,18,.88);perspective:1100px;flex-direction:column;align-items:center;justify-content:center;gap:14px}
#cx-layer.on,#cx-box.on{display:flex}
#cx-box{z-index:8;background:#15121F;flex-direction:column;overflow:auto;padding:28px clamp(18px,5vw,64px) 40px}
.cx-ring{position:absolute;width:20vmin;height:20vmin;border-radius:50%;border:4px solid #FFC247;opacity:0;pointer-events:none}
.cx-msg{min-height:28px;color:#A9A3B8;font-size:20px;text-align:center;position:relative;z-index:2}
.cx-acts{height:44px;display:flex;gap:30px;justify-content:center;align-items:center;opacity:0;pointer-events:none;transition:opacity .4s;position:relative;z-index:2}
.cx-acts.on{opacity:1;pointer-events:auto}
.cx-acts a,#cx-close{cursor:pointer;font-weight:700;color:#F4F0E8;padding:6px 0;background:linear-gradient(#FFC247,#FFC247) 0 100%/0 2px no-repeat;transition:background-size .3s,color .3s}
.cx-acts a:hover,#cx-close:hover{background-size:100% 2px;color:#FFC247}
.cx{--w:min(360px,82vw,calc((100vh - 230px) * .714));position:relative;width:var(--w);height:calc(var(--w) * 1.4);font-size:calc(var(--w) / 22.5);user-select:none}
.cx .tilt{--mx:50%;--my:50%;--bx:50%;--by:50%;--o:0;position:absolute;inset:0;transform-style:preserve-3d;will-change:transform}
.cx .flip{position:absolute;inset:0;transform-style:preserve-3d}
.cx .front,.cx .back{position:absolute;inset:0;border-radius:1.1em;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;isolation:isolate}
.cx .back{transform:rotateY(180deg);background:repeating-linear-gradient(45deg,#1b1630 0 .7em,#221b3b .7em 1.4em);box-shadow:inset 0 0 0 .18em #FFC247,0 0 3em rgba(255,194,71,.25);display:grid;place-items:center;text-align:center}
.cx .back b{font:400 2.4em/1.15 var(--head,'Black Han Sans',sans-serif);color:#FFC247;text-shadow:0 0 .6em rgba(255,194,71,.6)}
.cx .back small{display:block;font-size:.9em;color:#A9A3B8;letter-spacing:.2em;margin-top:.6em}
.cx .front{padding:1em;display:flex;flex-direction:column;gap:.6em;background:var(--face);box-shadow:inset 0 0 0 .16em var(--edge),0 0 3.4em var(--glow)}
.cx .head{display:flex;justify-content:space-between;font-size:.8em;font-weight:700;letter-spacing:.06em;color:#A9A3B8}.cx .head .tp{color:var(--edge)}
.cx .art{flex:1;min-height:4em;border-radius:.6em;background:linear-gradient(transparent 55%,rgba(21,18,31,.75)),var(--artbg),var(--artimg,url(ref-main-character.png)) center/cover,#241d36;box-shadow:inset 0 0 0 1px var(--edge)}
.cx .concept{font:400 2.6em/1.1 var(--head,'Black Han Sans',sans-serif);color:var(--edge);text-shadow:0 0 .5em var(--glow)}
.cx .meaning{font-size:1.05em;line-height:1.45;font-weight:700}
.cx .story{font-size:.95em;line-height:1.5;color:#A9A3B8;border-top:1px solid var(--edge);padding-top:.5em}.cx .story em{font-style:normal;font-weight:700;color:#F4F0E8;margin-right:.3em}
.cx .foot{font-size:.95em;line-height:1.4}.cx .foot .nm{display:block;font-size:.85em;color:#A9A3B8;letter-spacing:.05em}.cx .foot b{color:#F4F0E8}
.cx .stamp{position:absolute;right:.8em;top:36%;transform:rotate(-14deg);border:.18em solid #FF5C5C;color:#FF5C5C;font:400 1.5em var(--head,'Black Han Sans',sans-serif);padding:.1em .5em;letter-spacing:.1em;background:rgba(21,18,31,.6);z-index:3}
.cx .holo,.cx .spark,.cx .glare{position:absolute;inset:0;pointer-events:none;border-radius:inherit}
.cx .holo{mix-blend-mode:color-dodge;opacity:calc(var(--o) * .28);background:linear-gradient(115deg,transparent 18%,var(--h1) 32%,var(--h2) 40%,var(--h3) 48%,var(--h4) 56%,var(--h5) 64%,transparent 78%);background-size:260% 260%;background-position:var(--bx) var(--by);filter:saturate(1.4) brightness(.85)}
.cx .spark{mix-blend-mode:color-dodge;opacity:calc(var(--o) * .35);background-image:radial-gradient(circle at 20% 30%,#fff 0 1px,transparent 2px),radial-gradient(circle at 70% 60%,#fff 0 1.5px,transparent 3px),radial-gradient(circle at 45% 85%,#fff 0 1px,transparent 2px),radial-gradient(circle at 85% 15%,#fff 0 1px,transparent 2px);background-size:5.5em 5.5em,7em 7em,4.5em 4.5em,6em 6em;background-position:var(--bx) var(--by),calc(100% - var(--bx)) var(--by),var(--bx) calc(100% - var(--by)),var(--by) var(--bx)}
.cx .glare{mix-blend-mode:overlay;opacity:var(--o);background:radial-gradient(farthest-corner circle at var(--mx) var(--my),rgba(255,255,255,.75) 0%,rgba(255,255,255,.22) 28%,transparent 58%)}
.cx.shield{--face:linear-gradient(160deg,#2b2312,#1a1626 60%);--edge:#FFC247;--glow:rgba(255,194,71,.35);--artbg:linear-gradient(135deg,rgba(255,194,71,.35),transparent);--h1:#ffd36b;--h2:#fff3b8;--h3:#ffb347;--h4:#ffe48a;--h5:#ffc247}
.cx.trap{--face:linear-gradient(160deg,#2c1015,#17101f 60%);--edge:#FF6B6B;--glow:rgba(255,80,80,.4);--artbg:linear-gradient(135deg,rgba(255,70,70,.35),transparent);--h1:#ff5c5c;--h2:#ff9a76;--h3:#ff3d81;--h4:#ffb199;--h5:#ff6b6b}
.cx.mid{--face:linear-gradient(160deg,#1e2232,#171525 60%);--edge:#C9D3F5;--glow:rgba(180,200,255,.3);--artbg:linear-gradient(135deg,rgba(180,200,255,.3),transparent);--h1:#cfd8ff;--h2:#fff;--h3:#9fb4ff;--h4:#e5e9ff;--h5:#b9c6ff}
.cx.special{--face:linear-gradient(160deg,#241a4a,#120f26 60%);--edge:#FFFFFF;--glow:rgba(190,140,255,.55);--artbg:linear-gradient(135deg,rgba(190,140,255,.4),transparent);--h1:#ff5f6d;--h2:#ffe76a;--h3:#6aff9e;--h4:#6ad8ff;--h5:#c06aff}
.cx.special .concept{background:linear-gradient(90deg,#ff8a8a,#ffe76a,#8affb0,#8ae0ff,#d08aff);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none}
.cx.special .holo{opacity:calc(var(--o) * .38);filter:saturate(1.5) brightness(.9)}
.cx .newb{position:absolute;top:-.9em;left:-.5em;z-index:5;transform:translateZ(60px) scale(0);background:#FFC247;color:#15121F;font:400 1.5em var(--head,'Black Han Sans',sans-serif);padding:.15em .7em;letter-spacing:.05em;transition:transform .45s cubic-bezier(.2,1.6,.4,1)}
.cx .newb.on{transform:translateZ(60px) scale(1) rotate(-6deg)}.cx .newb.old{background:#A9A3B8}
/* 카드함 */
.cb-top{display:flex;justify-content:space-between;align-items:baseline;gap:20px;margin-bottom:6px}
.cb-top h2{font:400 clamp(34px,5vw,56px)/1.1 var(--head,'Black Han Sans',sans-serif);color:#FFC247}
#cx-close{font-size:18px;white-space:nowrap}
.cb-sub{color:#A9A3B8;font-size:20px;margin-bottom:26px}.cb-sub b{color:#F4F0E8}
.cb-g{margin-bottom:30px}.cb-g h3{font-size:18px;color:#FFC247;letter-spacing:.06em;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #3A3450}
.cb-row{display:flex;flex-wrap:wrap;gap:18px}
.cb-row .cx{--w:148px;cursor:pointer;transition:transform .25s}.cb-row .cx:hover{transform:translateY(-6px)}
.cb-row .cx .tilt{--o:.35}
.cb-empty{width:148px;height:207px;border:2px dashed #3A3450;border-radius:14px;display:grid;place-items:center;text-align:center;color:#6f6988;font-size:14px;line-height:1.4;padding:10px}
.cb-empty b{display:block;font:400 44px/1 var(--head,'Black Han Sans',sans-serif);color:#3A3450;margin-bottom:6px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  document.body.insertAdjacentHTML('beforeend',
    '<button id="cbtn">카드함 <b id="ccnt">0</b>/' + TOTAL + '</button>' +
    '<div id="cx-layer"><div class="cx-ring" id="cx-ring"></div><div id="cx-slot"></div><div class="cx-msg" id="cx-msg"></div><div class="cx-acts" id="cx-acts"></div></div>' +
    '<div id="cx-box"></div>');
  const layer = $('cx-layer'), slot = $('cx-slot'), acts = $('cx-acts'), msg = $('cx-msg'), boxEl = $('cx-box');

  function count() { $('ccnt').textContent = load().length }
  function bump() { const b = $('cbtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump') }

  function build(c, o) {
    o = o || {};
    const el = document.createElement('div'); el.className = 'cx ' + c.type;
    el.innerHTML = `<div class="tilt"><div class="flip"><div class="front">
      <div class="head"><span class="tp">${TYPE[c.type].label}</span><span>${c.series}</span></div><div class="art"${c.img ? ` style="--artimg:url(${c.img})"` : ''}></div>
      <div class="concept">${c.concept}</div><div class="meaning">${c.meaning}</div>
      <div class="story"><em>이야기에서는</em>${c.story}</div>
      <div class="foot"><span class="nm">${c.name}</span><b>${c.lesson}</b></div>
      ${o.stamp ? '<div class="stamp">시간 초과</div>' : ''}<div class="holo"></div><div class="spark"></div><div class="glare"></div></div>
      <div class="back"><div><b>AI 윤리</b><small>CONCEPT CARD</small></div></div></div><div class="newb"></div></div>`;
    return el;
  }

  // ---------- 기울기 + 홀로 빛: 마우스 따라 / 없으면 살랑살랑 ----------
  let act = null, hover = false, tgt, now = { rx: 0, ry: 0, mx: 50, my: 50, o: 0 }, raf = 0;
  layer.addEventListener('pointermove', e => {
    if (!act || calm) return;
    const r = act.getBoundingClientRect(), px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    hover = true; tgt = { rx: (.5 - py) * 2 * MAX, ry: (px - .5) * 2 * MAX, mx: px * 100, my: py * 100, o: 1 };
  });
  layer.addEventListener('pointerleave', () => { hover = false });
  function loop(t) {
    if (!layer.classList.contains('on')) { raf = 0; return }
    const tl = act && act.querySelector('.tilt');
    if (tl) {
      if (calm) tgt = { rx: 0, ry: 0, mx: 50, my: 50, o: .5 };
      else if (!hover) { const ry = Math.sin(t / 1100) * 8, rx = Math.cos(t / 1600) * 5; tgt = { rx, ry, mx: 50 + ry * 4, my: 50 - rx * 5, o: .55 } }
      for (const k in now) now[k] += (tgt[k] - now[k]) * .12;
      tl.style.transform = `rotateX(${now.rx}deg) rotateY(${now.ry}deg)`;
      tl.style.setProperty('--mx', now.mx + '%'); tl.style.setProperty('--my', now.my + '%');
      tl.style.setProperty('--bx', now.mx + '%'); tl.style.setProperty('--by', now.my + '%'); tl.style.setProperty('--o', now.o);
    }
    raf = requestAnimationFrame(loop);
  }
  function startLoop() { tgt = { rx: 0, ry: 0, mx: 50, my: 50, o: 0 }; hover = false; if (!raf) raf = requestAnimationFrame(loop) }

  function actsHTML(list) {
    acts.innerHTML = ''; acts.classList.remove('on');
    return list.map(([t, fn]) => { const a = document.createElement('a'); a.textContent = t; a.onclick = fn; acts.appendChild(a); return a });
  }

  // ---------- 카드 받기 연출 ----------
  // reveal(id,{auto}) → 카드를 카드함에 넣을 때까지 기다렸다가 {isNew} 반환
  async function reveal(id, opt) {
    opt = opt || {}; const c = data(id), mood = TYPE[c.type].mood;
    const have = load(), isNew = !have.includes(id);
    if (isNew) { have.push(id); save(have) }
    slot.innerHTML = ''; msg.textContent = ''; act = null;
    const el = build(c, { stamp: !!opt.auto }); slot.appendChild(el);
    const flip = el.querySelector('.flip'), nb = el.querySelector('.newb');
    nb.textContent = isNew ? '새 카드!' : '이미 모은 카드'; if (!isNew) nb.classList.add('old');
    layer.classList.add('on'); startLoop(); actsHTML([]);
    if (calm) { FX.play(mood); }
    else {
      flip.style.transform = 'rotateY(180deg)'; FX.play('show');
      await el.animate([{ transform: 'translateY(85vh) scale(.3) rotate(-30deg)', opacity: 0 }, { opacity: 1, offset: .25 }, { transform: 'none', opacity: 1 }], { duration: 850, easing: 'cubic-bezier(.2,.9,.3,1)' }).finished;
      await sleep(150);
      await flip.animate([{ transform: 'rotateY(180deg)' }, { transform: 'rotateY(720deg)' }], { duration: 1500, easing: 'cubic-bezier(.25,.8,.25,1)' }).finished;
      flip.style.transform = 'none';
      const ring = $('cx-ring'); ring.style.borderColor = getComputedStyle(el).getPropertyValue('--edge');
      ring.animate([{ transform: 'scale(.3)', opacity: .9 }, { transform: 'scale(4.5)', opacity: 0 }], { duration: 900, easing: 'ease-out' });
      FX.ending(mood, layer);
      if (c.type === 'special') { await sleep(250); FX.confetti() }
    }
    nb.classList.add('on'); act = el;
    if (!isNew) msg.textContent = '다른 길도 가 볼까요?';
    return new Promise(resolve => {
      const [a] = actsHTML([[isNew ? '카드함에 넣기' : '닫기', async () => {
        acts.classList.remove('on'); act = null;
        if (isNew && !calm) {
          const r = el.getBoundingClientRect(), b = $('cbtn').getBoundingClientRect();
          FX.play('pick');
          await el.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${b.left + b.width / 2 - (r.left + r.width / 2)}px,${b.top + b.height / 2 - (r.top + r.height / 2)}px) scale(.06) rotate(25deg)`, opacity: .2 }], { duration: 750, easing: 'cubic-bezier(.6,0,.9,.4)' }).finished;
        }
        layer.classList.remove('on'); count(); if (isNew) bump(); msg.textContent = '';
        resolve({ isNew });
      }]]);
      acts.classList.add('on');
    });
  }
  // 이 결말까지 5개를 다 모았고 특별 카드가 아직 없으면 특별 카드 id를 돌려줌
  function specialDue(i) { const h = load(), sp = spOf(i); return endsOf(i).every(k => h.includes(k)) && !h.includes(sp) ? sp : null }

  // ---------- 카드함 ----------
  function zoom(id) {
    const c = data(id), el = build(c); slot.innerHTML = ''; slot.appendChild(el); msg.textContent = '';
    act = el; layer.classList.add('on'); startLoop();
    actsHTML([['닫기', () => { layer.classList.remove('on'); act = null }]]); acts.classList.add('on');
  }
  function openBox() {
    const h = load(), concepts = new Set(h.filter(i => !isSp(i)).map(i => data(i).concept));
    let html = `<div class="cb-top"><h2>개념 카드함</h2><a id="cx-close">닫기</a></div><div class="cb-sub">카드 <b>${h.length}</b>/${TOTAL}장 · 배운 개념 <b>${concepts.size}</b>개 (모두 ${new Set(ALL.filter(i => !isSp(i)).map(i => data(i).concept)).size}개)</div>`;
    GROUPS.forEach((g, gi) => {
      const ids = g.ids || Array.from({ length: g.n }, () => null);
      html += `<div class="cb-g"><h3>${g.title}</h3><div class="cb-row">` +
        ids.map((id, i) => id && h.includes(id) ? `<div data-id="${id}" class="cbs"></div>` : `<div class="cb-empty"><div><b>?</b>${g.hint}</div></div>`).join('') +
        (g.special ? (h.includes(g.special) ? `<div data-id="${g.special}" class="cbs"></div>` : `<div class="cb-empty"><div><b>★</b>결말을 모두 모으면 열려요</div></div>`)
          : `<div class="cb-empty"><div><b>★</b>결말을 모두 모으면 열려요</div></div>`) +
        '</div></div>';
    });
    boxEl.innerHTML = html;
    boxEl.querySelectorAll('.cbs').forEach(d => { const el = build(data(d.dataset.id)); el.querySelector('.newb').remove(); el.onclick = () => zoom(d.dataset.id); d.replaceWith(el) });
    $('cx-close').onclick = () => boxEl.classList.remove('on');
    boxEl.classList.add('on'); boxEl.scrollTop = 0;
  }
  $('cbtn').onclick = openBox;
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (layer.classList.contains('on') && !acts.querySelector('a')?.textContent.includes('넣기')) { layer.classList.remove('on'); act = null } else boxEl.classList.remove('on');
  });
  count();
  return { reveal, specialDue, openBox, zoom, data, ALL, isSp, load, save: a => { save(a); count() }, found: i => endsOf(i).filter(k => load().includes(k)).length, total: i => endsOf(i).length, count: () => load().length, reset: () => { save([]); count() } };
})();
