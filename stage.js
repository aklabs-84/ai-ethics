// 선생님과 함께 하는 수업: 편마다 열쇠 번호 + 학생 진행 알림 (학생 화면 index.html, 선생님 화면 class.html이 같이 써요)
// - 열쇠 번호는 입장 코드로 계산해요(서버를 쓰지 않아요). 선생님 화면과 학생 화면이 같은 계산을 해서 같은 번호가 나와요.
// - 진행 알림은 '편을 시작할 때 · 고를 때 · 결말에 닿을 때'만 보내요(무료 한도 아끼기).
window.STAGE = (function () {
  const CK = 'aiethics.code.v1';
  function code() {
    let c = '';
    try { c = (new URLSearchParams(location.search).get('entryCode') || '').trim() } catch (e) {}
    if (c) { try { localStorage.setItem(CK, c) } catch (e) {} return c }
    try { return (localStorage.getItem(CK) || '').trim() } catch (e) { return '' }
  }
  function setCode(c) { try { c ? localStorage.setItem(CK, c.trim()) : localStorage.removeItem(CK) } catch (e) {} }
  const FIXED = ['', '4827', '6139']; // 2편·3편 열쇠 번호(고정). 선생님이 적어 두고 수업 때 알려 줘요
  function locked() { try { return new URLSearchParams(location.search).get('free') !== '1' } catch (e) { return true } } // ?free=1 이면 잠금 없이 연습
  function key(entry, story) { // story: 0,1,2
    if (FIXED[story]) return FIXED[story];
    let h = 2166136261; const s = String(entry).trim().toLowerCase() + '|조심' + story;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0 }
    return String(1000 + (h % 9000));
  }
  function report(me, story, picks, ended) {
    const c = code(); if (!c || !me || !window.CONFIG || !CONFIG.apiUrl) return;
    try {
      fetch(CONFIG.apiUrl + '/progress', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryCode: c, studentName: me.name, studentId: me.group + '모둠-' + me.name, group: me.group, story: story + 1, picks: picks, ended: !!ended }) }).catch(() => {});
    } catch (e) {}
  }
  return { code, setCode, key, locked, report };
})();
