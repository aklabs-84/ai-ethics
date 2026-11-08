// 사건카드 만들기: 모둠이 AI 사건 2장을 만들고, 선생님께 낼 "모둠 코드"를 얻는다.
window.MAKE = (function () {
  const KEY = 'aiethics.make.v1', N = 2;
  const $ = (r, s) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch (e) { return {} } };
  const save = d => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch (e) {} };
  const blank = () => ({ k: '', s: '', q: '', good: '', goodWhy: '', bad: '', badWhy: '' });

  // 개념 목록(카드 그림·뜻 포함): 모은 카드가 먼저, 아직 못 모은 카드는 흐리게
  function concepts() {
    const have = new Set(CARDS.load()), map = new Map();
    CARDS.ALL.forEach(id => {
      if (CARDS.isSp(id)) return; const d = CARDS.data(id), o = map.get(d.concept);
      if (!o) map.set(d.concept, { id, name: d.concept, meaning: d.meaning, img: d.img, got: have.has(id) });
      else if (have.has(id) && !o.got) { o.got = true; o.id = id; o.img = d.img; o.meaning = d.meaning }
    });
    return [...map.values()].sort((a, b) => b.got - a.got);
  }

  // 개념별 예시: 칸에 자동으로 채우지 않고 옆에서 보고 따라 쓰게 한다
  const EX = {
    '확인하기': ['AI가 알려 준 발표 날짜를 확인하지 않고 친구들에게 그대로 알려 줬다.', '이때 어떻게 할까?', '선생님 공지로 한 번 더 확인한다', '틀린 정보를 퍼뜨리지 않아요'],
    '출처 확인': ['AI가 “이 통계는 한 연구에서 나왔다”고 했는데 연구 이름이 없다.', '이 말을 보고서에 써도 될까?', '원래 자료를 찾아서 출처를 확인한다', '출처가 있어야 믿을 수 있어요'],
    '교차 확인': ['AI는 “하루 물 5리터”라고 하는데 다른 사이트는 다르게 말한다.', '무엇을 믿어야 할까?', '믿을 만한 곳 두세 군데와 비교한다', '여러 곳이 같은 말을 하면 더 안전해요'],
    '환각': ['AI가 책 이름과 작가를 자신 있게 알려 줬는데 도서관에 그런 책이 없다.', '이 책을 독서 감상문에 써도 될까?', '실제 책이 있는지 먼저 찾아본다', 'AI도 없는 것을 지어낼 수 있어요'],
    '정보 지키기': ['AI에게 숙제 도움을 받으려고 내 이름, 학교, 전화번호를 모두 써 넣으려 한다.', '어떻게 할까?', '이름과 연락처는 빼고 질문만 쓴다', '한 번 쓴 정보는 되돌리기 어려워요'],
    '개인정보': ['친구 사진과 집 주소가 나온 화면을 AI에게 올려 설명을 부탁하려 한다.', '올려도 될까?', '개인정보가 나오지 않는 부분만 쓴다', '내 정보와 친구 정보 모두 지켜야 해요'],
    '동의 구하기': ['친구 얼굴 사진으로 AI 그림을 만들어 단체방에 올리고 싶다.', '올리기 전에 무엇을 할까?', '친구에게 먼저 물어보고 허락을 받는다', '내 얼굴이 쓰이는 일은 본인이 정해요'],
    '사람 해치지 않기': ['AI로 친구 목소리를 흉내 내 장난 전화를 하자는 말이 나왔다.', '어떻게 할까?', '장난이어도 상처가 될 수 있다며 말린다', '재미로 한 일도 사람을 아프게 할 수 있어요'],
    '밝히기': ['AI가 만든 그림을 대회에 내려고 한다.', '어떻게 낼까?', '“AI의 도움을 받았다”고 적어서 낸다', '밝히면 믿음을 지킬 수 있어요'],
    'AI 사용 밝히기': ['AI가 써 준 문장을 고쳐서 일기 숙제로 냈다.', '선생님께 무엇을 말할까?', 'AI에게 도움받은 부분을 말씀드린다', '솔직하면 신뢰가 쌓여요'],
    '솔직하게 말하기': ['AI가 쓴 독후감을 내 글이라고 냈는데 선생님이 “직접 썼니?”라고 물으셨다.', '뭐라고 답할까?', '도움을 받았다고 솔직히 말한다', '지금이라도 솔직하면 더 큰 문제를 막아요'],
    '거짓 덮기': ['AI로 만든 사진이 가짜라는 걸 알았지만 이미 친구들에게 보냈다.', '어떻게 할까?', '가짜라고 알리고 바로잡는다', '덮을수록 문제가 커져요'],
    '내 책임': ['AI가 알려 준 대로 했다가 모둠 발표에 틀린 내용이 들어갔다.', '누구 책임일까?', '내가 확인하지 않은 것도 내 책임이라고 인정한다', 'AI를 쓴 사람은 결과도 책임져야 해요'],
    '멈추고 사과하기': ['AI가 만든 글이 친구를 놀리는 내용인 걸 올린 뒤에 알았다.', '어떻게 할까?', '글을 내리고 친구에게 사과한다', '알았을 때 바로 멈추는 게 중요해요'],
    '다시 시작하기': ['AI 도움으로 낸 숙제가 잘못된 걸 알게 되었다.', '이제 어떻게 할까?', '직접 고쳐서 다시 내겠다고 말한다', '실수 뒤에 바로잡으면 다시 믿음을 얻어요'],
    '믿음': ['내가 AI를 썼다고 말하지 않아서 친구가 나를 의심하기 시작했다.', '믿음을 되찾으려면?', '사실을 말하고 앞으로는 미리 밝힌다', '믿음은 솔직함으로 쌓여요']
  };
  const exBox = k => { const e = EX[k]; return e ? `<b>「${esc(k)}」 예시</b> (그대로 쓰지 말고 우리 모둠 이야기로 바꿔요)<br>• 상황: ${esc(e[0])}<br>• 질문: ${esc(e[1])}<br>• 좋은 선택: ${esc(e[2])} — ${esc(e[3])}` : '개념을 고르면 예시가 여기에 나와요.' };
  // AI에게 붙여넣을 지침 글: 고른 개념의 이름·뜻·예시가 자동으로 들어간다
  const aiPrompt = (k, mean) => { const e = EX[k]; return `너는 중학생의 'AI 윤리 수업'을 돕는 이야기 작가야.\n우리 모둠은 아래 윤리 개념으로 짧은 "사건 카드" 1장을 만들어야 해.\n\n[윤리 개념] ${k}\n[뜻] ${mean}\n\n[사건 카드 형식] — 아이디어마다 아래 이름표 6줄을 똑같이 써 줘.\n어떤 일이 벌어졌나요? (딱 2문장, 공백 포함 80자 안쪽. 한 문장은 40자 안쪽, 문장 하나에 사건 하나만. 중학생이 학교·집에서 AI를 쓰다 겪을 만한 일)\n질문: (주인공에게 던질 질문 한 줄. 예: 이때 어떻게 할까?)\n좋은 선택: (한 문장, 30자 안쪽)\n왜 좋은가요?: (한 문장, 30자 안쪽)\n아쉬운 선택: (한 문장, 30자 안쪽)\n왜 아쉬운가요?: (한 문장, 30자 안쪽)\n\n[꼭 지킬 것]\n- 짧게 쓰는 게 가장 중요해. 1번 길이 예시: "친구가 수행평가 자료를 AI에게 물었더니 그럴듯한 통계를 알려 줬어. 친구는 출처를 확인하지 않고 보고서에 그대로 쓰려고 해." (약 70자)\n- 번호는 "아이디어 1", "아이디어 2", "아이디어 3"처럼 아이디어 제목에만 붙이고, 그 안의 6줄에는 번호를 붙이지 마. 6줄은 이름표(어떤 일이 벌어졌나요? / 질문 / 좋은 선택 / 왜 좋은가요? / 아쉬운 선택 / 왜 아쉬운가요?)로 시작하게 한 줄씩 써 줘.\n- 표·들여쓴 목록은 쓰지 마.\n- 아이디어를 서로 다른 상황으로 3개 만들어 줘.\n- 좋은 선택과 아쉬운 선택이 한눈에 구분되게, 정답이 하나로 느껴지게 써 줘.\n- 실제 이름·학교·지역·연락처는 쓰지 말고 "친구", "나"처럼 써 줘.\n- 어려운 말은 쓰지 말고 중학생이 바로 이해하는 쉬운 말로 써 줘.${e ? '\n- 아래 예시와 똑같은 상황은 피해 줘.\n  (예시) ' + e[0] + ' → 좋은 선택: ' + e[2] + '.' : ''}\n\n3개를 모두 보여 준 뒤, 마지막에 "어떤 아이디어를 더 다듬어 줄까?"라고 물어봐 줘.` };
  const aiBox = (k, mean) => k ? `<b>🤖 AI에게 아이디어 받기</b><div class="aisub">쓸 거리가 안 떠오르면 AI의 도움을 받아도 돼요. 단, 그대로 베끼지 말고 <b>우리 모둠 이야기로 바꿔 쓰세요.</b></div><div class="aist"><div><b>① 복사</b><br>아래 버튼으로 지침 글을 복사해요</div><div><b>② 붙여넣기</b><br>ChatGPT·Gemini·Claude 같은 AI 대화창에 붙여넣어요</div><div><b>③ 골라서 고쳐 쓰기</b><br>마음에 드는 아이디어 1개를 골라 아래 칸에 내 말로 써요</div></div><button type="button" class="aib-b" data-act="aicopy">📋 「${esc(k)}」 AI 지침 복사하기</button><span class="aiok"></span><details class="raw"><summary>복사가 안 될 때 · 지침 글 보기</summary><textarea readonly rows="9">${esc(aiPrompt(k, mean))}</textarea></details><div class="aiwarn">⚠ AI가 준 글을 그대로 붙여넣지 말고, 우리 모둠의 말로 고쳐 써요. AI의 도움을 받았다는 것도 기억해요!</div>` : '';
  // 내가 모은 함정 카드 = 사건의 재료
  function traps() { return CARDS.load().filter(id => !CARDS.isSp(id) && CARDS.data(id).type === 'trap').map(id => CARDS.data(id)) }

  function open(root, me, onClose) {
    const d = load(); d.cards = d.cards || Array.from({ length: N }, blank);
    const cs = concepts(), tr = traps();
    let h = `<div class="panel wide"><div class="ptop"><h2>사건카드 만들기</h2><a class="x" data-act="close">메뉴로</a></div>
      <p class="psub">우리 모둠만의 “AI 사건” <b>${N}장</b>을 만들어요. 다른 모둠이 이 카드로 게임을 해요. 정답이 하나로 느껴지게, 좋은 선택과 아쉬운 선택을 한 개씩 써 주세요.</p>`;
    if (tr.length) h += `<div class="mat"><b>재료로 쓸 수 있는 내 함정 카드</b>${tr.map(c => `<span>${esc(c.concept)} · ${esc(c.story)}</span>`).join('')}</div>`;
    else h += `<div class="mat">이야기에서 함정 결말을 만나면 여기에 “사건 재료”가 보여요. 없어도 괜찮아요.</div>`;
    d.cards.forEach((c, i) => {
      h += `<div class="mk" data-i="${i}"><h3>사건 ${i + 1}</h3>
        <div class="kp"><b>관련 개념 <small>— 사건과 가장 닮은 카드를 눌러 고르세요</small></b><input type="hidden" data-f="k" value="${esc(c.k)}">
          <div class="kl">${cs.map(x => `<button type="button" class="kc${x.got ? '' : ' off'}${x.name === c.k ? ' on' : ''}" data-k="${esc(x.name)}" data-id="${esc(x.id)}" data-m="${esc(x.meaning)}"><i style="background-image:url(${x.img})"></i><span>${esc(x.name)}</span></button>`).join('')}</div>
          <div class="km">${c.k ? '✔ 「' + esc(c.k) + '」 — ' + esc((cs.find(x => x.name === c.k) || {}).meaning || '') : '아직 고르지 않았어요'}</div><div class="ex">${exBox(c.k)}</div><div class="aibox"${c.k ? '' : ' hidden'}>${aiBox(c.k, (cs.find(x => x.name === c.k) || {}).meaning || '')}</div></div>
        <label>어떤 일이 벌어졌나요? <small>(2문장)</small><textarea data-f="s" rows="3" placeholder="예) 친구가 AI가 만든 그림을 자기 작품이라며 대회에 냈다.">${esc(c.s)}</textarea></label>
        <label>주인공에게 던질 질문<input data-f="q" value="${esc(c.q)}" placeholder="예) 이때 어떻게 할까?"></label>
        <div class="two"><div class="opt-a"><label>✓ 좋은 선택<input data-f="good" value="${esc(c.good)}" placeholder="예) AI가 도와줬다고 밝힌다"></label>
          <label>왜 좋은가요?<input data-f="goodWhy" value="${esc(c.goodWhy)}" placeholder="예) 밝히면 믿음을 지킬 수 있어요"></label></div>
        <div class="opt-b"><label>✗ 아쉬운 선택<input data-f="bad" value="${esc(c.bad)}" placeholder="예) 내가 혼자 그렸다고 한다"></label>
          <label>왜 아쉬운가요?<input data-f="badWhy" value="${esc(c.badWhy)}" placeholder="예) 거짓이 드러나면 신뢰를 잃어요"></label></div></div></div>`;
    });
    h += `<div class="acts"><button class="btn" data-act="make">모둠 코드 만들기</button></div><div class="out" hidden><div class="pv"></div><button class="btn cpb" data-act="copy">📋 사건카드 코드 복사하기</button><span class="ok"></span><p class="psub"><b>✔ 사건카드는 이 노트북에 저장됐어요. 여기서 따로 낼 필요 없어요!</b> 다음 단계 <b>「오늘 수업 제출하기」</b>를 누르면 이 코드와 내가 모은 카드가 <b>한꺼번에</b> 제출 글에 들어가요. 위 복사 버튼도 사건카드와 <b>내가 모은 카드를 함께</b> 복사해요. 조원 모두가 각자 제출해야 우리 모둠 카드가 합쳐져요.</p><details class="raw"><summary>복사가 안 될 때: 코드 직접 보기</summary><textarea readonly rows="4"></textarea></details></div></div>`;
    root.innerHTML = h;
    if (!document.getElementById('mk-css')) { const st = document.createElement('style'); st.id = 'mk-css'; st.textContent = `
.kp{margin:6px 0 14px}.kp small{color:#A9A3B8;font-weight:500}.kl{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px;margin:10px 0}
.kc{display:flex;flex-direction:column;align-items:center;gap:6px;padding:0 0 8px;border-radius:10px;border:2px solid #3A3450;background:#1f1c2b;color:#F4F0E8;font:700 15px/1.2 var(--font);cursor:pointer;overflow:hidden;transition:transform .15s,border-color .15s}
.kc i{display:block;width:100%;aspect-ratio:3/4;background:center/cover}.kc span{padding:0 4px}
.kc:hover{transform:translateY(-3px);border-color:#FFC247}.kc.off{opacity:.45;filter:grayscale(.7)}.kc.off:hover{opacity:.9}
.kc.on{border-color:#FFC247;box-shadow:0 0 0 3px rgba(255,194,71,.5);opacity:1;filter:none}
.km{color:#FFC247;font-size:17px;min-height:26px}.ex{background:rgba(255,255,255,.05);border-left:4px solid #6EE7D0;border-radius:6px;padding:10px 14px;margin-top:8px;color:#cfc9de;font-size:16px;line-height:1.6}.ex b{color:#6EE7D0}.pv{margin:12px 0}.pv .pc{background:#1f1c2b;border:1px solid #3A3450;border-radius:10px;padding:12px 16px;margin:8px 0;line-height:1.6}.pv .pc b{color:#FFC247}.pv .g{color:#6EE7D0}.pv .b{color:#FF8F8F}.cpb{font-size:22px!important;padding:16px 30px!important}details.raw{margin-top:12px;color:#A9A3B8}details.raw summary{cursor:pointer}details.raw textarea{width:100%;margin-top:8px}
.aibox{border:2px solid #6EE7D0;border-radius:14px;background:#17242a;padding:14px 18px;margin-top:12px}.aibox>b{font-size:20px;color:#6EE7D0}.aisub{font-size:16px;color:#cfc9de;margin:2px 0 10px}.aist{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px;font-size:16px}.aist div{background:#10181c;border-radius:10px;padding:10px 12px}.aist b{color:#6EE7D0}
.aib-b{background:#6EE7D0;color:#0d1a17;font:800 18px var(--font);border:0;border-radius:10px;padding:10px 18px;cursor:pointer}.aib-b:hover{filter:brightness(1.1)}.aiok{color:#6EE7D0;font-weight:700}.aiwarn{margin-top:10px;font-size:15px;color:#FFC247}`; document.head.appendChild(st) }
    const collect = () => { root.querySelectorAll('.mk').forEach(m => { const c = d.cards[+m.dataset.i]; m.querySelectorAll('[data-f]').forEach(f => c[f.dataset.f] = f.value.trim()) }); save(d) };
    root.oninput = collect; root.onchange = collect;
    root.onclick = e => {
      const kb = e.target.closest('.kc');
      if (kb) { const m = kb.closest('.mk'); m.querySelectorAll('.kc').forEach(x => x.classList.toggle('on', x === kb)); m.querySelector('input[data-f="k"]').value = kb.dataset.k; m.querySelector('.ex').innerHTML = exBox(kb.dataset.k); const ab = m.querySelector('.aibox'); ab.hidden = false; ab.innerHTML = aiBox(kb.dataset.k, kb.dataset.m); m.querySelector('.km').innerHTML = '✔ 「' + esc(kb.dataset.k) + '」 — ' + esc(kb.dataset.m); collect(); CARDS.zoom(kb.dataset.id); return }
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'close') { collect(); onClose && onClose(); return }
      if (a.dataset.act === 'aicopy') { const bx = a.closest('.aibox'), t = bx.querySelector('textarea'), ok = bx.querySelector('.aiok'); const fb = () => { bx.querySelector('details').open = true; t.select(); try { document.execCommand('copy'); ok.textContent = ' 복사했어요! ✓' } catch (x) { ok.textContent = ' 아래 글자를 직접 복사해 주세요' } }; try { navigator.clipboard.writeText(t.value).then(() => { ok.textContent = ' 복사했어요! ✓' }, fb) } catch (x) { fb() } return }
      if (a.dataset.act === 'copy') { const t = $(root, '.out textarea'), ok = $(root, '.ok'); const fb = () => { $(root, '.out details').open = true; t.select(); try { document.execCommand('copy'); ok.textContent = ' 복사했어요! ✓' } catch (x) { ok.textContent = ' 아래 글자를 직접 복사해 주세요' } }; try { navigator.clipboard.writeText(t.value).then(() => { ok.textContent = ' 복사했어요! ✓' }, fb) } catch (x) { fb() } return }
      if (a.dataset.act === 'make') {
        collect();
        const miss = d.cards.findIndex(c => !(c.k && c.s && c.q && c.good && c.bad));
        if (miss >= 0) { alert('사건 ' + (miss + 1) + '의 빈칸을 모두 채워 주세요. (이유 두 칸은 비워도 돼요)'); return }
        const pack = { g: (me && me.group) ? me.group + '모둠' : '모둠', n: me && me.name, cards: d.cards.map(c => ({ g: (me && me.group) ? me.group + '모둠' : '모둠', k: c.k, s: c.s, q: c.q, o: [{ t: c.good, ok: true, r: c.goodWhy || '' }, { t: c.bad, ok: false, r: c.badWhy || '' }] })) };
        const out = $(root, '.out'); out.hidden = false; $(out, '.pv').innerHTML = '<b>✔ 이렇게 만들었어요</b>' + pack.cards.map((c, i) => `<div class="pc"><b>사건 ${i + 1} · ${esc(c.k)}</b><br>${esc(c.s)}<br><b>${esc(c.q)}</b><br><span class="g">✓ ${esc(c.o[0].t)}</span><br><span class="b">✗ ${esc(c.o[1].t)}</span></div>`).join(''); const code = DECK.enc(pack); try { localStorage.setItem('aiethics.pack.v1', code) } catch (x) {} $(out, 'textarea').value = '[AI 사건 체험관 제출]\n이름: ' + ((me && me.name) || '') + ' / 반: ' + ((me && me.cls) || '') + ' / 모둠: ' + ((me && me.group) || '') + '\n사건카드 코드: ' + code + '\n카드 코드: AIC1@' + ((me && me.group) || '') + '.' + CARDS.load().join(',') + '\n'; out.scrollIntoView({ behavior: 'smooth' });
      }
    };
    root.scrollTop = 0;
  }
  return { open };
})();
