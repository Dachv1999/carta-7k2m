(() => {
  'use strict';

  // ====== Configuración ======
  const ANSWER = { day: 11, month: 10, year: 2026 };   // primer beso
  const SONG_START = 7;                                // segundo donde empieza la canción
  const TYPE_SPEED = 24;                               // ms por letra

  const MESSAGE = `Para Pao:

Hay formas de dedicar canciones, para mí esta es una especial, tanto como tú. Podré no igualar las intensidades, pero quería tomar parte de la delantera, usé esta fecha para no olvidar, y menos como aquel petricor con el que me pusiste a prueba jaja

Esta canción es para ti. Se llama "Me gusta", y sí: me gustas tú, tu mirada, tu forma de pensar y tu manera de querer.`;
  const SIGNATURE = 'Con todo mi cariño, Diego 💜';
  const POSTDATA = 'PD: Nos vemos pronto, que tenemos cosas pendientes ck';

  // ====== Elementos ======
  const $ = (id) => document.getElementById(id);
  const gate = $('gate'), letter = $('letter');
  const form = $('gate-form'), input = $('code'), gateMsg = $('gate-msg');
  const card = $('card'), msgBox = $('msg'), tapHint = $('tap-hint');
  const musicBtn = $('music-btn'), song = $('song'), ember = $('ember');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ====== Estrellas de fondo ======
  (function makeStars() {
    const box = $('stars');
    const n = window.innerWidth < 600 ? 40 : 70;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      s.className = 'star';
      s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;` +
        `--s:${4 + Math.random() * 10}px;--d:${2 + Math.random() * 4}s;--delay:${-Math.random() * 5}s`;
      box.appendChild(s);
    }
  })();

  // ====== Validación de fecha ======
  const MONTHS = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7,
    agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };

  function parseDate(raw) {
    let t = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (const [name, num] of Object.entries(MONTHS)) {
      const re = new RegExp(`\\b${name}\\b|\\b${name.slice(0, 3)}\\b`, 'g');
      if (re.test(t)) { t = t.replace(re, ` ${num} `); break; }
    }
    const groups = t.match(/\d+/g);
    if (!groups) return null;
    let d, m, y;
    if (groups.length === 1) {
      const s = groups[0];
      if (s.length === 8) [d, m, y] = [s.slice(0, 2), s.slice(2, 4), s.slice(4)];
      else if (s.length === 6) [d, m, y] = [s.slice(0, 2), s.slice(2, 4), s.slice(4)];
      else if (s.length === 4) [d, m] = [s.slice(0, 2), s.slice(2)];
      else return null;
    } else if (groups.length === 2) {
      [d, m] = groups;
    } else if (groups.length === 3) {
      [d, m, y] = groups;
    } else return null;
    d = +d; m = +m;
    if (y !== undefined) { y = +y; if (y < 100) y += 2000; }
    return { d, m, y };
  }

  function isCorrect(raw) {
    const p = parseDate(raw);
    return !!p && p.d === ANSWER.day && p.m === ANSWER.month &&
      (p.y === undefined || p.y === ANSWER.year);
  }

  // ====== Pistas ======
  let attempts = 0;
  const HINTS = [
    'Mmm, esa no es... piensa en nuestro primer beso 💜',
    'Casi... no se me olvida ese día. Intenta de nuevo 🌺',
    'Pista: fue en octubre ✨',
    'Pista: fue en 2026 😉'
  ];

  // Campo con máscara: solo números, se agregan las "/" solas (DD/MM/AAAA)
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    let day = digits.slice(0, 2), month = digits.slice(2, 4);
    const year = digits.slice(4, 8);
    if (day.length === 2 && +day > 31) day = '31';
    if (day.length === 2 && +day < 1) day = '01';
    if (month.length === 2 && +month > 12) month = '12';
    if (month.length === 2 && +month < 1) month = '01';
    // la "/" aparece al escribir el siguiente dígito, así borrar con la tecla atrás no se traba
    const formatted = [day, month, year].filter((p) => p.length).join('/');
    if (input.value !== formatted) input.value = formatted;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    if (value.replace(/\D/g, '').length < 8) {
      gateMsg.textContent = 'Escribe la fecha completa: día, mes y año (DD/MM/AAAA) 💜';
      return;
    }
    if (isCorrect(value)) return unlock();
    gateMsg.textContent = HINTS[Math.min(attempts, HINTS.length - 1)];
    attempts++;
    input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
    input.select();
  });

  // ====== Cambio de vista ======
  function unlock() {
    song.preload = 'auto';
    song.load();                       // empieza a cargar mientras ella mira la carta
    gate.classList.add('leaving');
    setTimeout(() => {
      gate.classList.remove('active', 'leaving');
      letter.classList.add('active');
      card.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 550);
  }

  // ====== Carta ======
  let opened = false;
  function openCard() {
    if (opened) return;
    opened = true;
    card.classList.add('flipped');
    card.removeAttribute('role');
    tapHint.classList.add('hide');
    playSong();
    musicBtn.hidden = false;
    setTimeout(() => { startHearts(); typeMessage(); }, reduceMotion ? 0 : 700);
  }
  card.addEventListener('click', openCard);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
  });

  // ====== Canción ======
  function playSong() {
    const start = () => {
      try { song.currentTime = SONG_START; } catch (_) { /* se reintenta en loadedmetadata */ }
    };
    if (song.readyState >= 1) start();
    else song.addEventListener('loadedmetadata', start, { once: true });
    song.volume = 0.9;
    const p = song.play();
    if (p && p.catch) p.catch(() => { musicBtn.textContent = '▶'; musicBtn.setAttribute('aria-label', 'Reproducir música'); });
  }
  musicBtn.addEventListener('click', () => {
    if (song.paused) { song.play(); musicBtn.textContent = '⏸'; musicBtn.setAttribute('aria-label', 'Pausar música'); }
    else { song.pause(); musicBtn.textContent = '▶'; musicBtn.setAttribute('aria-label', 'Reproducir música'); }
  });
  song.addEventListener('ended', () => { musicBtn.textContent = '▶'; musicBtn.setAttribute('aria-label', 'Reproducir música'); });

  // ====== Mensaje (máquina de escribir) ======
  function typeMessage() {
    const caret = document.createElement('span');
    caret.className = 'caret';
    const text = document.createElement('span');
    msgBox.append(text, caret);

    let i = 0, timer = null;
    const finish = () => {
      clearInterval(timer);
      text.textContent = MESSAGE;
      caret.remove();
      const sign = document.createElement('span');
      sign.className = 'sign';
      sign.textContent = SIGNATURE;
      msgBox.appendChild(sign);
      msgBox.scrollTop = 0;
      setTimeout(() => { ember.hidden = false; }, reduceMotion ? 0 : 1200);   // el fueguito aparece al terminar
      msgBox.removeEventListener('click', finish);
      msgBox.title = '';
    };

    if (reduceMotion) return finish();
    msgBox.title = 'Toca para ver todo el mensaje';
    msgBox.addEventListener('click', finish);
    timer = setInterval(() => {
      i += 1;
      text.textContent = MESSAGE.slice(0, i);
      msgBox.scrollTop = msgBox.scrollHeight;
      if (i >= MESSAGE.length) finish();
    }, TYPE_SPEED);
  }

  // ====== Easter egg: el fueguito revela la PD ======
  ember.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ember.dataset.used) return;
    ember.dataset.used = '1';

    // chispas
    if (!reduceMotion) {
      const r = ember.getBoundingClientRect();
      for (let i = 0; i < 12; i++) {
        const s = document.createElement('span');
        s.className = 'spark';
        s.textContent = ['🔥', '✨', '💜'][i % 3];
        const a = (Math.PI * 2 * i) / 12, d = 50 + Math.random() * 50;
        s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;` +
          `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1000);
      }
    }

    const ps = document.createElement('span');
    ps.className = 'ps';
    ps.textContent = POSTDATA;
    msgBox.appendChild(ps);
    msgBox.scrollTo({ top: msgBox.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
    ember.classList.add('used');
    ember.setAttribute('aria-label', 'Sorpresa descubierta');
  });

  // ====== Corazones flotando ======
  function startHearts() {
    if (reduceMotion) return;
    const box = $('hearts');
    const symbols = ['♥', '💜', '✦', '♥'];
    const colors = ['#ff8cc6', '#cdb2ff', '#ffffff', '#9bd5f7'];
    setInterval(() => {
      if (document.hidden) return;
      const h = document.createElement('span');
      h.className = 'heart';
      h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      h.style.cssText = `--x:${Math.random() * 100}%;--fs:${14 + Math.random() * 20}px;` +
        `--c:${colors[Math.floor(Math.random() * colors.length)]};` +
        `--dur:${7 + Math.random() * 6}s;--dx:${(Math.random() - .5) * 80}px`;
      box.appendChild(h);
      setTimeout(() => h.remove(), 14000);
    }, 650);
  }
})();
