// 시안 공용 효과 모음: 효과음(파일 없이 브라우저가 직접 만든 소리) + 선택 타이머 + 색종이
window.FX = (function () {
  let ctx = null, muted = false;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // 음 하나: 높이(Hz), 시작(초), 길이(초), 파형, 크기
  function tone(f, at, dur, type, vol, slideTo) {
    if (muted) return; const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  const sfx = {
    show:  () => { tone(520, 0, .12, 'triangle', .09); tone(780, .09, .16, 'triangle', .09); },   // 선택지 등장
    pick:  () => { tone(660, 0, .08, 'square', .07); tone(990, .06, .14, 'square', .07); },       // 고름
    tick:  () => tone(900, 0, .05, 'square', .04),                                               // 째깍
    alarm: () => { tone(1200, 0, .09, 'sawtooth', .06); tone(1200, .13, .09, 'sawtooth', .06); }, // 10초 이하
    auto:  () => { tone(300, 0, .25, 'sawtooth', .08, 150); },                                   // 시간 끝, 자동 선택
    good:  () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .11, .35, 'triangle', .13)); tone(1318, .5, .6, 'sine', .1); },
    mid:   () => { tone(440, 0, .3, 'triangle', .11); tone(392, .22, .4, 'triangle', .11); tone(349, .46, .6, 'sine', .1); },
    bad:   () => { tone(220, 0, .4, 'sawtooth', .1, 80); tone(165, .25, .6, 'square', .08, 60); },
    fan:   () => { for (let i = 0; i < 18; i++) tone(1100 + (i % 3) * 180, i * .055, .045, 'square', .035); tone(1568, 1.05, .25, 'triangle', .08); tone(2093, 1.15, .4, 'sine', .06); }, // 카드 펼침 차르르
    hov:   () => tone(760, 0, .05, 'sine', .05),                                                 // 카드 위에 마우스
    flip:  () => { tone(880, 0, .08, 'triangle', .1); tone(1320, .07, .2, 'triangle', .1); },    // 카드 한 장 고름
    back:  () => { tone(1100, 0, .22, 'triangle', .08, 500); }                                   // 덱으로 돌아가기
  };
  function play(name) { try { sfx[name] && sfx[name](); } catch (e) {} }

  // 선택 타이머: 선택지가 나올 때 start(), 고르면 stop()
  // opts: {sec, onTick(left, sec), onEnd()}
  function timer(opts) {
    const sec = opts.sec || 60, t0 = Date.now(); let done = false, lastShown = -1;
    const id = setInterval(() => {
      if (done) return;
      const left = Math.max(0, sec - (Date.now() - t0) / 1000), whole = Math.ceil(left);
      opts.onTick && opts.onTick(left, sec);
      if (whole !== lastShown) { lastShown = whole; if (whole <= 10 && whole > 0) play('alarm'); else if (whole % 10 === 0 && whole > 0) play('tick'); }
      if (left <= 0) { done = true; clearInterval(id); opts.onEnd && opts.onEnd(); }
    }, 100);
    return { stop() { done = true; clearInterval(id); } };
  }

  // 색종이(좋은 결말)
  function confetti(root) {
    if (calm) return;
    const cols = ['#FFC247', '#6EE7D0', '#FF6A3D', '#2F6BFF', '#fff'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i'), s = 6 + Math.random() * 8;
      p.style.cssText = `position:fixed;top:-20px;left:${Math.random() * 100}vw;width:${s}px;height:${s * 1.6}px;background:${cols[i % cols.length]};z-index:99;pointer-events:none;border-radius:2px`;
      (root || document.body).appendChild(p);
      p.animate([{ transform: 'translateY(0) rotate(0)', opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 240}px,${innerHeight + 40}px) rotate(${Math.random() * 900}deg)`, opacity: .9 }],
        { duration: 1800 + Math.random() * 1600, delay: Math.random() * 500, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }).onfinish = () => p.remove();
    }
  }
  // 화면 흔들기 / 번쩍임
  function shake(el) { if (!calm) el.animate([{ transform: 'translate(0)' }, { transform: 'translate(-12px,4px)' }, { transform: 'translate(10px,-5px)' }, { transform: 'translate(-8px,3px)' }, { transform: 'translate(6px,-2px)' }, { transform: 'translate(0)' }], { duration: 520 }); }
  function flash(color, ms) {
    if (calm) return; const d = document.createElement('div');
    d.style.cssText = `position:fixed;inset:0;background:${color};z-index:98;pointer-events:none`;
    document.body.appendChild(d);
    d.animate([{ opacity: .75 }, { opacity: 0 }], { duration: ms || 700 }).onfinish = () => d.remove();
  }
  // 결말 연출 한 번에: mood = good | mid | bad
  function ending(mood, shakeEl) {
    play(mood);
    if (mood === 'good') { confetti(); flash('rgba(255,224,130,.55)', 900); }
    else if (mood === 'bad') { shake(shakeEl || document.body); flash('rgba(255,40,40,.5)', 800); }
    else { flash('rgba(160,170,200,.35)', 700); }
  }
  function setMuted(v) { muted = v; if (!v) ac(); }
  return { play, timer, ending, confetti, shake, flash, setMuted, isMuted: () => muted, calm };
})();
