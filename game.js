// 연습 모드 「조심조심 AI」: 혼자 하는 보드게임. 실제 모둠 대결은 선생님 화면(class.html)에서 한다. 보드 부품은 board.js
window.GAME = (function () {
  const LEN = 12;
  const $ = (r, s) => r.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PRE = 'AIC1.';

  function pool(me) {
    const mine = me && me.group ? me.group + '모둠' : null;
    let all = DECK.store.get().filter(DECK.valid).filter(c => c.g !== mine);
    if (all.length < 8) all = all.concat(DECK.RESERVE);
    return all;
  }

  function open(root, me, onClose) {
    document.body.classList.remove('bd-on');
    const code = 'AIC1' + (me && me.group ? '@' + me.group : '') + '.' + CARDS.load().join(',');
    root.innerHTML = `<div class="panel"><div class="ptop"><h2>조심조심 AI · 연습</h2><a class="x" data-act="close">메뉴로</a></div>
      <p class="psub">혼자 해 보는 연습 판이에요. 주사위를 굴려 결승선(${LEN}칸)까지 가요. 칸마다 <b>AI 사건</b>이 나와요. 좋은 선택은 <b>2칸 앞으로</b>, 아쉬운 선택은 <b>2칸 뒤로</b>! 틀렸는데 사건과 같은 개념의 <b>방패 카드</b>가 있으면 반짝이는 카드를 눌러 막을 수 있어요(최대 3번). 수업 시간의 모둠 대결은 선생님 화면에서 해요.</p>
      <div class="gset">
        <div><b>사건카드 덱 <small>(없어도 연습용 카드로 해요)</small></b><span id="dk"></span><textarea id="dkc" rows="2" placeholder="선생님이 알려 준 덱 코드(AIE1.…)가 있으면 붙여넣고 ‘불러오기’"></textarea><button class="btn ghost" data-act="deck">덱 불러오기</button></div>
        <div><b>내 카드 코드 <small>(선생님 화면에서 모둠 대결할 때 필요해요)</small></b><textarea readonly rows="2" id="myc">${esc(code)}</textarea><button class="btn ghost" data-act="cp">복사하기</button> <span id="cpm"></span></div>
      </div>
      <div class="acts"><button class="btn big" data-act="start">연습 시작</button></div></div>`;
    const info = () => { $(root, '#dk').textContent = ' 지금 ' + pool(me).length + '장'; };
    info();
    root.onclick = e => {
      const a = e.target.closest('[data-act]'); if (!a) return;
      const v = a.dataset.act;
      if (v === 'close') return onClose && onClose();
      if (v === 'cp') { const t = $(root, '#myc'); t.select(); try { navigator.clipboard.writeText(t.value) } catch (x) { document.execCommand('copy') } $(root, '#cpm').textContent = '복사했어요!'; return }
      if (v === 'deck') {
        try { const d = DECK.dec($(root, '#dkc').value), cards = (d.cards || []).filter(DECK.valid); if (!cards.length) throw new Error('카드가 없어요'); DECK.store.set(cards); info(); alert(cards.length + '장을 불러왔어요!') }
        catch (x) { alert('덱 코드를 읽을 수 없어요: ' + x.message) }
        return;
      }
      if (v === 'start') {
        root.onclick = null;
        BOARD.play(root, { mode: 'practice', title: '조심조심 AI', len: LEN, teams: [{ name: (me && me.name) || '나', ids: CARDS.load() }], deck: pool(me), refill: () => pool(me), onExit: () => open(root, me, onClose) });
      }
    };
  }
  return { open };
})();
