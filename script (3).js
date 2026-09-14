/* ============================================================
   RITAJ'S BIRTHDAY ADVENTURE — LOGIC (Arabic)

   Sections:
   1. Element references
   2. Screen navigation helper
   3. Generic "escaping element" factory (reused for YES button + number 7)
   4. Screen 1 -> 2 (start button)
   5. Screen 2: YES escapes, NO is easy, taunt messages
   6. Screen 3: number grid, 7 escapes, wrong-number messages
   7. Screen 4: gift opening animation
   8. Screen 5: big celebration + sound + surprise button
   9. Effects: confetti, floating hearts/stars, balloon release, fireworks
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Element references ---------- */

  const screenWelcome = document.getElementById('screen-welcome');
  const screenQuestion = document.getElementById('screen-question');
  const screenAge = document.getElementById('screen-age');
  const screenGift = document.getElementById('screen-gift');
  const screenFinal = document.getElementById('screen-final');

  const btnStart = document.getElementById('btn-start');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const taunt = document.getElementById('taunt');

  const ageQuestionBlock = document.getElementById('age-question');
  const ageSuccessBlock = document.getElementById('age-success');
  const numberGrid = document.getElementById('number-grid');
  const num7 = document.getElementById('num-7');
  const ageMessage = document.getElementById('age-message');

  const giftStage = document.getElementById('gift-stage');
  const giftBoxIcon = document.getElementById('gift-box-icon');
  const btnOpenGift = document.getElementById('btn-open-gift');

  const cakeFinal = document.getElementById('cake-final');
  const btnSurprise = document.getElementById('btn-surprise');
  const surpriseMessage = document.getElementById('surprise-message');

  const flashOverlay = document.getElementById('flash-overlay');
  const fxLayer = document.getElementById('fx-layer');

  const CONFETTI_COLORS = ['#FF4FA3', '#FFD23F', '#5AC8FA', '#9B5DE5', '#FF8C42', '#ffffff'];
  const BALLOON_COLORS  = ['#FF4FA3', '#5AC8FA', '#FFD23F', '#9B5DE5', '#FF8C42'];
  const FLOAT_EMOJIS    = ['💖', '⭐', '✨', '💫'];

  const YES_TAUNTS = [
    'هههه! لن تمسكيني! 😜',
    'قريبة جداً! 😂',
    'حاولي مرة أخرى يا ريتاج! 💖',
    'لن يكون الأمر بهذه السهولة! 😆'
  ];

  const WRONG_NUMBER_MESSAGES = [
    '😂 لا، هذا ليس عمركِ!',
    '😜 حاولي مرة أخرى!'
  ];

  /* ---------- 2. Screen navigation helper ---------- */

  function goToScreen(fromEl, toEl) {
    fromEl.classList.add('hidden');
    toEl.classList.remove('hidden');
  }

  /* ---------- 3. Generic "escaping element" factory ---------- */

  function createEscapee(el, options) {
    const {
      maxEscapes = 5,
      dodgeDistance = 110,
      isActive = () => true,       // only respond while this returns true (e.g. screen is visible)
      onDodge = () => {},
      onCatch = () => {}
    } = options;

    let escapeCount = 0;
    let isCatchable = false;
    let escaping = false;

    function distanceTo(clientX, clientY) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return Math.hypot(cx - clientX, cy - clientY);
    }

    function moveAwayFrom(clientX, clientY) {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const margin = 14;

      const maxX = Math.max(margin, window.innerWidth - w - margin);
      const maxY = Math.max(margin, window.innerHeight - h - margin);

      let newX, newY, tries = 0;
      do {
        newX = margin + Math.random() * (maxX - margin);
        newY = margin + Math.random() * (maxY - margin);
        tries++;
      } while (
        tries < 6 &&
        clientX !== null &&
        Math.hypot((newX + w / 2) - clientX, (newY + h / 2) - clientY) < dodgeDistance
      );

      if (!escaping) {
        escaping = true;
        el.classList.add('is-escaping');
      }

      el.style.left = newX + 'px';
      el.style.top = newY + 'px';

      el.classList.remove('is-shaking');
      void el.offsetWidth; // restart the shake animation
      el.classList.add('is-shaking');

      escapeCount++;
      onDodge(escapeCount);

      if (escapeCount >= maxEscapes) {
        isCatchable = true;
        el.classList.add('is-catchable');
      }
    }

    document.addEventListener('mousemove', (e) => {
      if (!isActive() || isCatchable) return;
      if (distanceTo(e.clientX, e.clientY) < dodgeDistance) {
        moveAwayFrom(e.clientX, e.clientY);
      }
    });

    el.addEventListener('touchstart', (e) => {
      if (!isActive() || isCatchable) return; // let the tap through once catchable
      e.preventDefault();
      const touch = e.touches[0];
      moveAwayFrom(touch.clientX, touch.clientY);
    }, { passive: false });

    el.addEventListener('mouseenter', (e) => {
      if (!isActive() || isCatchable) return;
      moveAwayFrom(e.clientX, e.clientY);
    });

    el.addEventListener('click', (e) => {
      if (!isActive()) return;
      if (isCatchable) {
        onCatch(e);
      } else {
        e.preventDefault();
        moveAwayFrom(null, null);
      }
    });

    window.addEventListener('resize', () => {
      if (isActive() && escaping && !isCatchable) moveAwayFrom(null, null);
    });

    return {
      reset() {
        escapeCount = 0;
        isCatchable = false;
        escaping = false;
        el.classList.remove('is-escaping', 'is-catchable', 'is-shaking');
        el.style.left = '';
        el.style.top = '';
      }
    };
  }

  /* ---------- 4. Screen 1 -> 2 ---------- */

  btnStart.addEventListener('click', () => {
    goToScreen(screenWelcome, screenQuestion);
  });

  /* ---------- 5. Screen 2: YES escapes, NO is easy ---------- */

  let taunterTimeout = null;
  function showTaunt() {
    const msg = YES_TAUNTS[Math.floor(Math.random() * YES_TAUNTS.length)];
    taunt.textContent = msg;
    taunt.classList.remove('hidden', 'is-showing');
    void taunt.offsetWidth;
    taunt.classList.add('is-showing');
    clearTimeout(taunterTimeout);
    taunterTimeout = setTimeout(() => taunt.classList.add('hidden'), 1800);
  }

  const yesEscapee = createEscapee(btnYes, {
    maxEscapes: 5,
    dodgeDistance: 110,
    isActive: () => !screenQuestion.classList.contains('hidden'),
    onDodge: () => showTaunt(),
    onCatch: () => {
      goToScreen(screenQuestion, screenAge);
    }
  });

  btnNo.addEventListener('click', () => {
    taunt.textContent = 'يييي، بالتأكيد جاهزة! 😄';
    taunt.classList.remove('hidden', 'is-showing');
    void taunt.offsetWidth;
    taunt.classList.add('is-showing');
    clearTimeout(taunterTimeout);
    taunterTimeout = setTimeout(() => taunt.classList.add('hidden'), 1800);
  });

  /* ---------- 6. Screen 3: number grid, 7 escapes ---------- */

  let ageMsgTimeout = null;
  function showAgeMessage(text) {
    ageMessage.textContent = text;
    ageMessage.classList.remove('hidden', 'is-showing');
    void ageMessage.offsetWidth;
    ageMessage.classList.add('is-showing');
    clearTimeout(ageMsgTimeout);
    ageMsgTimeout = setTimeout(() => ageMessage.classList.add('hidden'), 1800);
  }

  const sevenEscapee = createEscapee(num7, {
    maxEscapes: 5,
    dodgeDistance: 100,
    isActive: () => !screenAge.classList.contains('hidden') && !ageQuestionBlock.classList.contains('hidden'),
    onDodge: () => {},
    onCatch: () => {
      ageQuestionBlock.classList.add('hidden');
      ageSuccessBlock.classList.remove('hidden');
      spawnConfetti(30);
      spawnFloatingEmoji(10);
      setTimeout(() => {
        goToScreen(screenAge, screenGift);
      }, 1600);
    }
  });

  numberGrid.addEventListener('click', (e) => {
    const target = e.target.closest('.number');
    if (!target || target === num7) return; // 7 handles itself via its own escapee
    const value = target.dataset.value;
    if (value !== '7') {
      const msg = WRONG_NUMBER_MESSAGES[Math.floor(Math.random() * WRONG_NUMBER_MESSAGES.length)];
      showAgeMessage(msg);
      target.classList.remove('is-shaking');
      void target.offsetWidth;
      target.classList.add('is-shaking');
    }
  });

  /* ---------- 7. Screen 4: gift opening ---------- */

  let giftOpened = false;
  btnOpenGift.addEventListener('click', () => {
    if (giftOpened) return;
    giftOpened = true;

    giftBoxIcon.textContent = '🎉';
    giftBoxIcon.classList.add('is-open');
    giftStage.classList.add('is-open');
    btnOpenGift.classList.add('hidden');

    spawnConfetti(45);
    spawnFloatingEmoji(16);

    setTimeout(() => {
      goToScreen(screenGift, screenFinal);
      startBigCelebration();
    }, 1200);
  });

  /* ---------- 8. Screen 5: big celebration + surprise button ---------- */

  let celebrationStarted = false;
  function startBigCelebration() {
    if (celebrationStarted) return;
    celebrationStarted = true;

    cakeFinal.classList.add('is-lit', 'is-celebrating');

    flashOverlay.classList.remove('is-flashing');
    void flashOverlay.offsetWidth;
    flashOverlay.classList.add('is-flashing');

    spawnConfetti(90);
    spawnFloatingEmoji(28);
    spawnFireworks(6);
    spawnBalloonRelease(16);
    playCelebrationSound();
  }

  btnSurprise.addEventListener('click', () => {
    surpriseMessage.classList.remove('hidden', 'is-showing');
    void surpriseMessage.offsetWidth;
    surpriseMessage.classList.add('is-showing');
    spawnConfetti(30);
    spawnFloatingEmoji(12);
  });

  /* ---------- 9. Effects ---------- */

  function spawnConfetti(count = 70) {
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const left = Math.random() * 100;
      const duration = 2.4 + Math.random() * 2;
      const delay = Math.random() * 0.6;
      piece.style.left = left + 'vw';
      piece.style.background = color;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = duration + 's';
      piece.style.animationDelay = delay + 's';
      fxLayer.appendChild(piece);
      setTimeout(() => piece.remove(), (duration + delay) * 1000 + 200);
    }
  }

  function spawnBalloonRelease(count = 14) {
    for (let i = 0; i < count; i++) {
      const balloon = document.createElement('span');
      balloon.className = 'fx-balloon';
      const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
      const left = Math.random() * 96;
      const duration = 4 + Math.random() * 2.5;
      const delay = Math.random() * 1.2;
      balloon.style.left = left + 'vw';
      balloon.style.background = color;
      balloon.style.animationDuration = duration + 's';
      balloon.style.animationDelay = delay + 's';
      fxLayer.appendChild(balloon);
      setTimeout(() => balloon.remove(), (duration + delay) * 1000 + 300);
    }
  }

  function spawnFloatingEmoji(count = 20) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'fx-float';
      el.textContent = FLOAT_EMOJIS[Math.floor(Math.random() * FLOAT_EMOJIS.length)];
      const left = Math.random() * 96;
      const duration = 2.6 + Math.random() * 2.2;
      const delay = Math.random() * 1;
      const drift = (Math.random() * 80 - 40) + 'px';
      el.style.left = left + 'vw';
      el.style.setProperty('--drift', drift);
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = delay + 's';
      fxLayer.appendChild(el);
      setTimeout(() => el.remove(), (duration + delay) * 1000 + 200);
    }
  }

  function spawnFireworks(count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const fw = document.createElement('span');
        fw.className = 'fx-firework';
        const top = 10 + Math.random() * 40;
        const left = 10 + Math.random() * 80;
        const c1 = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const c2 = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const c3 = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        fw.style.top = top + '%';
        fw.style.left = left + '%';
        fw.style.background = c1;
        fw.style.boxShadow = `
          0 -36px 0 ${c2}, 0 36px 0 ${c3}, -36px 0 0 ${c1},
          36px 0 0 ${c2}, 25px -25px 0 ${c3}, -25px 25px 0 ${c1},
          25px 25px 0 ${c2}, -25px -25px 0 ${c3}
        `;
        fxLayer.appendChild(fw);
        setTimeout(() => fw.remove(), 1200);
      }, i * 260);
    }
  }

  function playCelebrationSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = now + i * 0.16;
        const end = start + 0.22;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(end + 0.02);
      });

      setTimeout(() => ctx.close().catch(() => {}), (notes.length * 0.16 + 0.4) * 1000);
    } catch (err) {
      console.log('Celebration sound skipped:', err);
    }
  }

});
