/* ═══════════════════════════════════════════════════════════
   💖 Romantic Universe — Main Script
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', init);

function init() {
  applyConfig();
  initCosmosCanvas();
  initStats();
  initReasonsCarousel();
  initDateCounter();
  initChat();
  initLetter();
  initCompliments();
  initConstellation();
  initGallery();
  initFromHeart();
  initHerList();
  initCareManual();
  initTimeCapsule();
  initMoodPicker();
  initBeautyButton();
  initMusic();
  initLiveThoughts();
  initNavigation();
  initEasterEggs();
  initRouteMap();
}

/* ─── Config ─── */
function applyConfig() {
  const name = CONFIG.herName;
  const b = CONFIG.branding || {};

  document.title = b.pageTitle || `${name} · for you ❤️`;
  if (b.heroBadge) document.getElementById('hero-badge').textContent = b.heroBadge;
  if (b.heroLine1) document.getElementById('hero-line1').textContent = b.heroLine1;
  document.getElementById('her-name-title').textContent = b.heroLine2 ?? name;
  if (b.heroSubtitle) document.getElementById('hero-subtitle').textContent = b.heroSubtitle;
  document.getElementById('footer-name').textContent = b.footer || 'for you';
  if (b.cosmosTitle) document.getElementById('cosmos-title').textContent = b.cosmosTitle;
  if (b.cosmosHint) document.getElementById('cosmos-hint').textContent = b.cosmosHint;
  document.getElementById('route-from').textContent = CONFIG.route.from;
  document.getElementById('route-to').textContent = CONFIG.route.to;

  const datesList = document.getElementById('dates-list');
  CONFIG.importantDates.forEach((item, i) => {
    const li = document.createElement('li');
    li.style.animationDelay = `${i * 0.1}s`;
    li.innerHTML = `<span class="date-label">${item.date}</span> — ${item.event}`;
    datesList.appendChild(li);
  });
}

/* ─── Cosmos Background Canvas ─── */
function initCosmosCanvas() {
  const canvas = document.getElementById('cosmos-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random(),
      twinkle: Math.random() * 0.02,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    stars.forEach((s) => {
      s.opacity += s.twinkle;
      if (s.opacity > 1 || s.opacity < 0.2) s.twinkle *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 164, 184, ${s.opacity * 0.35})`;
      ctx.fill();
      s.y += s.speed;
      if (s.y > h) {
        s.y = 0;
        s.x = Math.random() * w;
      }
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
}

/* ─── Stats ─── */
function initStats() {
  const grid = document.getElementById('stats-grid');
  CONFIG.stats.forEach((stat, i) => {
    const pct = Math.min((stat.value / stat.max) * 100, 100);
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.style.animationDelay = `${i * 0.15}s`;
    card.innerHTML = `
      <div class="stat-label">${stat.label}</div>
      <div class="stat-bar-wrap"><div class="stat-bar" data-pct="${pct}"></div></div>
      <div class="stat-value">${stat.value}/${stat.max}</div>
    `;
    grid.appendChild(card);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-bar').forEach((bar) => {
            bar.style.width = bar.dataset.pct + '%';
          });
        }
      });
    },
    { threshold: 0.3 }
  );
  grid.querySelectorAll('.stat-card').forEach((c) => observer.observe(c));
}

/* ─── Reasons Carousel ─── */
function initReasonsCarousel() {
  let current = 0;
  const total = LOVE_REASONS.length;
  const card = document.getElementById('reason-card');
  const textEl = document.getElementById('reason-text');
  const numEl = document.getElementById('reason-number');
  const dotsContainer = document.getElementById('reason-dots');

  // Show subset of dots (every 5th + current)
  for (let i = 0; i < total; i += 5) {
    const dot = document.createElement('button');
    dot.className = 'reason-dot' + (i === 0 ? ' active' : '');
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `Причина ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.reason-dot').forEach((dot) => {
      const idx = parseInt(dot.dataset.index, 10);
      dot.classList.toggle('active', Math.abs(idx - current) < 5 || idx === current);
    });
  }

  function showReason(index, direction = 'next') {
    card.classList.remove('slide-in');
    card.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');

    setTimeout(() => {
      current = ((index % total) + total) % total;
      textEl.textContent = LOVE_REASONS[current];
      numEl.textContent = `${current + 1} / ${total}`;
      card.classList.remove('slide-out-left', 'slide-out-right');
      card.classList.add('slide-in');
      updateDots();
    }, 300);
  }

  function goTo(index) {
    const dir = index > current ? 'next' : 'prev';
    showReason(index, dir);
  }

  document.getElementById('reason-prev').addEventListener('click', () => showReason(current - 1, 'prev'));
  document.getElementById('reason-next').addEventListener('click', () => showReason(current + 1, 'next'));

  // Swipe support
  let touchStartX = 0;
  card.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  card.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      showReason(current + (diff > 0 ? 1 : -1), diff > 0 ? 'next' : 'prev');
    }
  });

  // Auto-advance every 8s when visible
  let autoTimer;
  const section = document.getElementById('reasons');
  const autoObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        autoTimer = setInterval(() => showReason(current + 1, 'next'), 8000);
      } else {
        clearInterval(autoTimer);
      }
    },
    { threshold: 0.3 }
  );
  autoObserver.observe(section);

  showReason(0);
}

/* ─── Date Counter ─── */
function initDateCounter() {
  const meetDate = CONFIG.meetDate;

  function update() {
    const now = new Date();
    const diff = now - meetDate;
    if (diff < 0) {
      document.getElementById('days-count').textContent = '0';
      document.getElementById('hours-count').textContent = '0';
      document.getElementById('minutes-count').textContent = '0';
      document.getElementById('seconds-count').textContent = '0';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    document.getElementById('days-count').textContent = days;
    document.getElementById('hours-count').textContent = hours;
    document.getElementById('minutes-count').textContent = minutes;
    document.getElementById('seconds-count').textContent = seconds;
  }

  update();
  setInterval(update, 1000);
}

/* ─── Chat ─── */
function initChat() {
  const container = document.getElementById('chat-container');
  let index = 0;

  function addMessage() {
    if (index >= CHAT_MESSAGES.length) {
      index = 0;
      container.innerHTML = '';
    }
    const msg = CHAT_MESSAGES[index];
    const el = document.createElement('div');
    el.className = `chat-message from-${msg.from === 'me' ? 'me' : 'her'}`;
    el.style.animationDelay = '0s';
    const avatar = msg.from === 'me' ? CONFIG.avatars.me : CONFIG.avatars.her;
    const avatarHtml = avatar.includes('/') || avatar.includes('.')
      ? `<img src="${avatar}" alt="" class="chat-avatar-img">`
      : avatar;
    el.innerHTML = `
      <div class="chat-avatar">${avatarHtml}</div>
      <div class="chat-bubble">${msg.text}</div>
    `;
    container.appendChild(el);
    index++;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        addMessage();
        const interval = setInterval(addMessage, 2500);
        observer.disconnect();
        entries[0].target.dataset.interval = interval;
      }
    },
    { threshold: 0.2 }
  );
  observer.observe(container);
}

/* ─── Letter Typing ─── */
function initLetter() {
  const textEl = document.getElementById('letter-text');
  const cursor = document.getElementById('letter-cursor');
  let charIndex = 0;
  let typingTimer;

  function typeLetter() {
    textEl.textContent = '';
    charIndex = 0;
    cursor.classList.remove('hidden');

    function type() {
      if (charIndex < LETTER_TEXT.length) {
        textEl.textContent += LETTER_TEXT[charIndex];
        charIndex++;
        typingTimer = setTimeout(type, 30 + Math.random() * 20);
      } else {
        cursor.classList.add('hidden');
      }
    }
    type();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        typeLetter();
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(document.getElementById('letter'));

  document.getElementById('letter-replay').addEventListener('click', () => {
    clearTimeout(typingTimer);
    typeLetter();
  });
}

/* ─── Compliments ─── */
function initCompliments() {
  const display = document.getElementById('compliment-display');
  let lastIndex = -1;

  document.getElementById('compliment-btn').addEventListener('click', () => {
    display.classList.add('fade');
    setTimeout(() => {
      let idx;
      do {
        idx = Math.floor(Math.random() * COMPLIMENTS.length);
      } while (idx === lastIndex && COMPLIMENTS.length > 1);
      lastIndex = idx;
      display.textContent = COMPLIMENTS[idx];
      display.classList.remove('fade');
    }, 300);
  });
}

/* ─── From Heart ─── */
function initFromHeart() {
  const block = CONFIG.fromHeart;
  if (!block) return;

  const gif = document.getElementById('from-heart-gif');
  const hint = document.getElementById('from-heart-gif-hint');
  const badge = document.getElementById('from-heart-badge');
  const text = document.getElementById('from-heart-text');

  if (block.badge) badge.textContent = block.badge;
  if (block.text) text.textContent = block.text;

  if (block.gif) {
    gif.src = block.gif;
    gif.onerror = () => {
      gif.hidden = true;
      hint.hidden = false;
    };
    gif.onload = () => {
      gif.hidden = false;
      hint.hidden = true;
    };
  }
}

/* ─── Gallery ─── */
function initGallery() {
  const grid = document.getElementById('gallery-grid');
  const rotations = [-3, 2, -1, 4, -2, 3];

  CONFIG.gallery.forEach((photo, i) => {
    const div = document.createElement('div');
    div.className = 'polaroid';
    div.style.setProperty('--rotate', `${rotations[i % rotations.length]}deg`);
    div.style.animationDelay = `${i * 0.15}s`;

    const isGif = /\.gif$/i.test(photo.src);
    if (isGif) div.classList.add('polaroid--gif');

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.caption;
    img.loading = isGif ? 'eager' : 'lazy';
    img.onerror = () => {
      img.style.background = `linear-gradient(${135 + i * 30}deg, #e8d4f0, #f5c8d8)`;
      img.alt = 'Добавь своё фото в assets/';
    };

    div.innerHTML = `<div class="polaroid-caption">${photo.caption}</div>`;
    div.insertBefore(img, div.firstChild);

    div.addEventListener('click', () => {
      showEasterEgg('📸 Каждое фото с тобой — маленькое сокровище.');
    });

    grid.appendChild(div);
  });
}

/* ─── Her List ─── */
function initHerList() {
  const data = CONFIG.herList;
  if (!data) return;

  const intro = document.getElementById('her-list-intro');
  const grid = document.getElementById('her-list-grid');
  if (intro && data.intro) intro.textContent = data.intro;

  if (data.ringSize) {
    const showcase = document.getElementById('ring-size-showcase');
    document.getElementById('ring-size-number').textContent = data.ringSize;
    const note = document.getElementById('ring-size-note');
    if (note && data.ringNote) note.textContent = data.ringNote;
    showcase?.classList.remove('hidden');
  }

  (data.groups || []).forEach((group, i) => {
    const card = document.createElement('div');
    card.className = `her-list-card her-list-card--${group.type || 'like'}`;
    card.style.animationDelay = `${i * 0.08}s`;

    const tags = (group.items || [])
      .map((item) => `<span class="her-list-tag">${item}</span>`)
      .join('');

    const note = group.note
      ? `<p class="her-list-card-note">${group.note}</p>`
      : '';

    card.innerHTML = `
      <h3 class="her-list-card-title">${group.title}</h3>
      <div class="her-list-tags">${tags}</div>
      ${note}
    `;
    grid.appendChild(card);
  });
}

/* ─── Care Manual ─── */
function initCareManual() {
  const data = CONFIG.careManual;
  if (!data) return;

  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  };

  set('care-manual-badge', data.badge);
  set('care-manual-preface', data.preface);
  set('care-manual-subtitle', data.subtitle);
  set('care-manual-question', data.question);
  set('care-manual-answer', data.answer);
  set('care-manual-sign', data.sign);

  const steps = document.getElementById('care-manual-steps');
  (data.steps || []).forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    steps.appendChild(li);
  });

  const rules = document.getElementById('care-manual-rules');
  (data.rules || []).forEach((rule) => {
    const li = document.createElement('li');
    li.textContent = rule;
    rules.appendChild(li);
  });
}

/* ─── Time Capsule ─── */
function initTimeCapsule() {
  const cfg = CONFIG.timeCapsule;
  if (!cfg) return;

  const scene = document.getElementById('capsule-scene');
  const countdownEl = document.getElementById('capsule-countdown');
  const sealedHint = document.getElementById('capsule-sealed-hint');
  const letter = document.getElementById('capsule-letter');
  const messageText = document.getElementById('capsule-message-text');
  const openDate = new Date(cfg.openDate);

  sealedHint.textContent = cfg.sealedHint || '';
  messageText.textContent = cfg.message || '';

  function plural(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  }

  function update() {
    const diff = openDate - Date.now();

    if (cfg.previewOpen || diff <= 0) {
      scene.classList.add('is-open');
      countdownEl.textContent = cfg.openedLabel || 'Капсула открыта!';
      sealedHint.classList.add('hidden');
      letter.classList.remove('hidden');
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days} ${plural(days, 'день', 'дня', 'дней')}`);
    parts.push(`${hours} ${plural(hours, 'час', 'часа', 'часов')}`);
    parts.push(`${minutes} ${plural(minutes, 'минута', 'минуты', 'минут')}`);
    parts.push(`${seconds} ${plural(seconds, 'секунда', 'секунды', 'секунд')}`);

    countdownEl.textContent = `До открытия: ${parts.join(' · ')}`;
  }

  update();
  setInterval(update, 1000);
}

/* ─── Mood Picker ─── */
function initMoodPicker() {
  const responseEl = document.getElementById('mood-response');
  const buttons = document.querySelectorAll('.mood-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mood = btn.dataset.mood;
      document.body.dataset.mood = mood;
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const resp = MOOD_RESPONSES[mood];
      responseEl.style.opacity = '0';
      setTimeout(() => {
        responseEl.textContent = resp.text;
        responseEl.style.opacity = '1';
      }, 200);

      document.querySelector('.hero-glow').style.animation = 'none';
      void document.querySelector('.hero-glow').offsetWidth;
      document.querySelector('.hero-glow').style.animation = 'glow-pulse 4s ease-in-out infinite';
    });
  });

  // Default mood
  document.querySelector('[data-mood="love"]').classList.add('active');
  responseEl.textContent = MOOD_RESPONSES.love.text;
}

/* ─── Beauty Button ─── */
function initBeautyButton() {
  const btn = document.getElementById('beauty-btn');
  const response = document.getElementById('beauty-response');

  btn.addEventListener('click', () => {
    response.classList.remove('hidden');
    spawnHeartBurst(btn.getBoundingClientRect());
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        spawnHeartBurst({
          left: Math.random() * window.innerWidth,
          top: Math.random() * window.innerHeight,
          width: 0,
          height: 0,
        });
      }, i * 100);
    }
  });
}

function spawnHeartBurst(rect) {
  const hearts = ['❤️', '💖', '💕', '✨', '💗'];
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('span');
    el.className = 'heart-burst';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    el.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 80) + 'px';
    el.style.top = (rect.top + rect.height / 2) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
}

/* ─── Music (Spotify) ─── */
function formatTime(sec) {
  if (!sec || !isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getPlaylist() {
  if (Array.isArray(CONFIG.playlist) && CONFIG.playlist.length) return CONFIG.playlist;
  if (CONFIG.music) return [CONFIG.music];
  return [{ src: CONFIG.musicSrc || 'assets/song1.mp3', title: 'for you', artist: 'Плейлист' }];
}

function initMusic() {
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  const prevBtn = document.getElementById('music-prev');
  const nextBtn = document.getElementById('music-next');
  const canvas = document.getElementById('audio-visualizer');
  const progress = document.getElementById('music-progress');
  const timeCurrent = document.getElementById('music-time-current');
  const timeTotal = document.getElementById('music-time-total');
  const titleEl = document.getElementById('music-title');
  const artistEl = document.getElementById('music-artist');
  const coverImg = document.getElementById('music-cover-img');
  const coverFallback = document.getElementById('music-cover-fallback');
  const ctx = canvas.getContext('2d');

  const playlist = getPlaylist();
  const rootStyle = getComputedStyle(document.documentElement);
  const progressFill = rootStyle.getPropertyValue('--player-accent').trim() || '#a894d4';
  const progressTrack = rootStyle.getPropertyValue('--player-progress-track').trim() || 'rgba(201, 184, 232, 0.35)';
  const vizColors = [
    rootStyle.getPropertyValue('--player-accent').trim() || '#a894d4',
    rootStyle.getPropertyValue('--player-accent-light').trim() || '#c9b8e8',
  ];
  let audioCtx, analyser, dataArray, animId;
  let isPlaying = false;
  let isSeeking = false;
  let trackIndex = 0;

  audio.volume = 0.5;

  function setProgressBar(pct) {
    const p = Math.min(100, Math.max(0, pct));
    progress.style.setProperty('--progress', `${p}%`);
    progress.style.background = `linear-gradient(to right, ${progressFill} ${p}%, ${progressTrack} ${p}%)`;
  }

  function resetProgressUI() {
    progress.value = 0;
    setProgressBar(0);
    timeCurrent.textContent = '0:00';
    timeTotal.textContent = '0:00';
  }

  function updateProgressUI() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progress.value = (audio.currentTime / audio.duration) * 1000;
    setProgressBar(pct);
    timeCurrent.textContent = formatTime(audio.currentTime);
  }

  function updateCover(track) {
    if (track.cover) {
      coverImg.src = track.cover;
      coverImg.hidden = false;
      coverFallback.hidden = true;
      coverImg.onerror = () => {
        coverImg.hidden = true;
        coverFallback.hidden = false;
      };
    } else {
      coverImg.hidden = true;
      coverFallback.hidden = false;
    }
  }

  function loadTrack(index, autoplay = false) {
    trackIndex = (index + playlist.length) % playlist.length;
    const track = playlist[trackIndex];

    audio.src = track.src;
    titleEl.textContent = track.title || 'Без названия';
    artistEl.textContent = track.artist || '';
    updateCover(track);
    resetProgressUI();
    audio.load();

    if (autoplay) {
      const tryPlay = () => playAudio();
      if (audio.readyState >= 2) tryPlay();
      else audio.addEventListener('canplay', tryPlay, { once: true });
    }
  }

  async function playAudio() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      }
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      await audio.play();
      isPlaying = true;
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Пауза');
      drawVisualizer();
    } catch {
      showEasterEgg('🎵 Положи mp3-файлы в папку assets/');
    }
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    btn.classList.remove('playing');
    btn.setAttribute('aria-label', 'Воспроизвести');
    cancelAnimationFrame(animId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function togglePlay() {
    if (!isPlaying) await playAudio();
    else pauseAudio();
  }

  function changeTrack(delta) {
    const shouldPlay = isPlaying;
    pauseAudio();
    loadTrack(trackIndex + delta, shouldPlay);
  }

  loadTrack(0);

  audio.addEventListener('loadedmetadata', () => {
    timeTotal.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (!isSeeking) updateProgressUI();
  });

  audio.addEventListener('ended', () => {
    if (playlist.length > 1) changeTrack(1);
    else {
      audio.currentTime = 0;
      playAudio();
    }
  });

  progress.addEventListener('input', () => {
    isSeeking = true;
    const pct = (progress.value / 1000) * 100;
    if (audio.duration) {
      timeCurrent.textContent = formatTime((progress.value / 1000) * audio.duration);
    }
    setProgressBar(pct);
  });

  progress.addEventListener('change', () => {
    if (audio.duration) {
      audio.currentTime = (progress.value / 1000) * audio.duration;
    }
    isSeeking = false;
  });

  btn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', () => changeTrack(-1));
  nextBtn.addEventListener('click', () => changeTrack(1));

  function drawVisualizer() {
    if (!isPlaying || !analyser) return;
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
      const h = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = vizColors[i % 2];
      ctx.fillRect(i * barWidth, canvas.height - h, Math.max(barWidth - 1, 1), h);
    }
    animId = requestAnimationFrame(drawVisualizer);
  }
}

/* ─── Live Thoughts ─── */
function initLiveThoughts() {
  const el = document.getElementById('live-thoughts');
  let thoughtIndex = 0;

  function showThought() {
    el.textContent = LIVE_THOUGHTS[thoughtIndex % LIVE_THOUGHTS.length];
    thoughtIndex++;
    el.classList.add('visible');
    el.classList.remove('fade-out');

    setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => el.classList.remove('visible', 'fade-out'), 600);
    }, 4000);
  }

  setTimeout(showThought, 3000);
  setInterval(showThought, 12000);
}

/* ─── Navigation ─── */
function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  const SCROLL_DURATION = 1800;
  const NAV_OFFSET = 88;

  toggle.addEventListener('click', () => links.classList.toggle('open'));

  links.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id && id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;

      e.preventDefault();
      links.classList.remove('open');

      const startY = window.scrollY;
      const endY = target.getBoundingClientRect().top + startY - NAV_OFFSET;
      const distance = endY - startY;
      const startTime = performance.now();

      function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(now) {
        const progress = Math.min((now - startTime) / SCROLL_DURATION, 1);
        window.scrollTo(0, startY + distance * ease(progress));
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  });
}

/* ─── Easter Eggs ─── */
function initEasterEggs() {
  // Triple-click footer heart
  let clickCount = 0;
  let clickTimer;
  document.getElementById('footer-secret').addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 600);
    if (clickCount >= 3) {
      clickCount = 0;
      showEasterEgg(EASTER_EGG_MESSAGES[3]);
    }
  });

  // Konami code
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === konami[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konami.length) {
        konamiIndex = 0;
        showEasterEgg(EASTER_EGG_MESSAGES[4]);
        spawnHeartBurst({ left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 });
      }
    } else {
      konamiIndex = 0;
    }
  });

  // Secret: type "love"
  let typed = '';
  document.addEventListener('keypress', (e) => {
    typed += e.key.toLowerCase();
    if (typed.includes('love')) {
      typed = '';
      showEasterEgg(EASTER_EGG_MESSAGES[1]);
    }
    if (typed.length > 10) typed = typed.slice(-10);
  });

  // 5 clicks on title
  let titleClicks = 0;
  document.getElementById('her-name-title').addEventListener('click', () => {
    titleClicks++;
    if (titleClicks >= 5) {
      titleClicks = 0;
      showEasterEgg(EASTER_EGG_MESSAGES[0]);
    }
  });
}

function showEasterEgg(message) {
  const modal = document.getElementById('easter-modal');
  document.getElementById('easter-message').textContent = message;
  modal.classList.remove('hidden');

  document.getElementById('easter-close').onclick = () => modal.classList.add('hidden');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}
