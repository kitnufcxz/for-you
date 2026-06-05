/* ═══════════════════════════════════════════════════════════
   🌌 Созвездие «Вика» — Marck Script, контур по штрихам
   ═══════════════════════════════════════════════════════════ */

const FONT_URL = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/marckscript/MarckScript-Regular.ttf';
const TOTAL_STARS = 30;

const STAR_COMPLIMENTS = [
  'Твоё имя — самое красивое, что я знаю',
  'Ты сияешь ярче любой звезды на небе',
  'Каждая точка — повод сказать «я тебя люблю»',
  'Ты — моя вселенная',
  'Ты делаешь мир мягче',
  'С тобой даже ночное небо тёплое',
  'Ты — начало моего лучшего дня',
  'Ты — мой самый тёплый свет',
  'Ты настоящая — и это бесконечно ценно',
  'Ты умеешь быть нежной — и это прекрасно',
  'Ты зажигаешь меня одним сообщением',
  'Твоя красота — без слов',
  'Ты — причина, по которой я улыбаюсь',
  'Капля нежности от тебя — и день другой',
  'Ты делаешь каждый день особенным',
  'Ты словно чудо, посланное мне',
  'Ты — моя любимая история',
  'Ты — самая яркая звезда неба',
  'Навсегда твоя — без исключений',
  'Ты — мой самый красивый путь',
  'Твоё имя — Вика. И этого уже достаточно',
  'Я бы выбрал тебя в любой вселенной',
  'Ты — мой самый тёплый вечер',
  'С тобой хочется строить что-то настоящее',
  'Ты заслуживаешь всего самого нежного',
  'Ты — причина моей улыбки утром',
  'Ты уникальна — и я не устану это говорить',
  'Ты — моя любимая мысль',
  'Рядом с тобой всё имеет смысл',
  'Ты — моя самая яркая созвездие',
];

function commandsToD(cmds) {
  return cmds.map((c) => {
    switch (c.type) {
      case 'M': return `M${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
      case 'L': return `L${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
      case 'Q': return `Q${c.x1.toFixed(2)} ${c.y1.toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
      case 'C': return `C${c.x1.toFixed(2)} ${c.y1.toFixed(2)} ${c.x2.toFixed(2)} ${c.y2.toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
      case 'Z': return 'Z';
      default: return '';
    }
  }).join(' ');
}

function splitSubpaths(commands) {
  const result = [];
  let current = [];
  commands.forEach((cmd) => {
    if (cmd.type === 'M' && current.length) {
      result.push(current);
      current = [];
    }
    current.push(cmd);
  });
  if (current.length) result.push(current);
  return result;
}

function samplePath(d, count, toSvg) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', d);
  const svg = document.createElementNS(svgNS, 'svg');
  svg.style.cssText = 'position:absolute;visibility:hidden;width:0;height:0';
  svg.appendChild(path);
  document.body.appendChild(svg);

  const total = path.getTotalLength();
  const stars = [];
  const n = Math.max(2, count);
  for (let i = 0; i < n; i++) {
    const pt = path.getPointAtLength((total * i) / (n - 1));
    stars.push(toSvg(pt));
  }
  document.body.removeChild(svg);
  return stars;
}

function buildScriptConstellation(font, text, viewW, viewH) {
  const fontSize = 172;
  const path = font.getPath(text, 0, 0, fontSize);
  const bbox = path.getBoundingBox();
  const pad = 32;
  const textW = bbox.x2 - bbox.x1;
  const textH = bbox.y2 - bbox.y1;
  const scale = Math.min((viewW - pad * 2) / textW, (viewH - pad * 2) / textH);
  const offsetX = (viewW - textW * scale) / 2 - bbox.x1 * scale;
  const offsetY = pad + (viewH - pad * 2 - textH * scale) / 2 - bbox.y1 * scale;
  const transform = `translate(${offsetX.toFixed(2)},${offsetY.toFixed(2)}) scale(${scale.toFixed(4)},${scale.toFixed(4)})`;

  const toSvg = (pt) => ({
    x: pt.x * scale + offsetX,
    y: pt.y * scale + offsetY,
  });

  const subpaths = splitSubpaths(path.commands);
  const subData = subpaths.map((cmds) => {
    const d = commandsToD(cmds);
    const svgNS = 'http://www.w3.org/2000/svg';
    const el = document.createElementNS(svgNS, 'path');
    el.setAttribute('d', d);
    const svg = document.createElementNS(svgNS, 'svg');
    svg.style.cssText = 'position:absolute;visibility:hidden;width:0;height:0';
    svg.appendChild(el);
    document.body.appendChild(svg);
    const len = el.getTotalLength();
    document.body.removeChild(svg);
    return { d, len };
  });

  const totalLen = subData.reduce((s, sp) => s + sp.len, 0);
  let starBudget = TOTAL_STARS;
  const strokes = [];
  const stars = [];

  subData.forEach((sp, idx) => {
    const share = idx === subData.length - 1
      ? starBudget
      : Math.max(3, Math.round(TOTAL_STARS * (sp.len / totalLen)));
    starBudget -= share;

    const pts = samplePath(sp.d, share, toSvg);
    stars.push(...pts);
    strokes.push({ d: sp.d, transform, starOffset: stars.length - pts.length });
  });

  return { stars, strokes, viewW, viewH };
}

function initConstellation() {
  const svg = document.getElementById('constellation-svg');
  const card = document.querySelector('.constellation-card');
  const loadingEl = document.getElementById('constellation-loading');
  const linesGroup = document.getElementById('constellation-lines');
  const starsGroup = document.getElementById('constellation-stars');
  const bgGroup = document.getElementById('constellation-bg-stars');
  const complimentEl = document.getElementById('star-compliment');
  if (!svg || !linesGroup || !starsGroup) return;

  const text = (typeof CONFIG !== 'undefined' && CONFIG.herName) ? CONFIG.herName : 'Вика';
  const viewW = 400;
  const viewH = 200;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  for (let i = 0; i < 65; i++) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', Math.random() * viewW);
    c.setAttribute('cy', Math.random() * viewH);
    c.setAttribute('r', (Math.random() * 0.85 + 0.2).toFixed(2));
    c.setAttribute('class', 'bg-star');
    c.setAttribute('opacity', (Math.random() * 0.4 + 0.06).toFixed(2));
    bgGroup.appendChild(c);
  }

  function render(data) {
    if (loadingEl) loadingEl.remove();

    data.strokes.forEach((stroke, i) => {
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      glow.setAttribute('d', stroke.d);
      glow.setAttribute('transform', stroke.transform);
      glow.setAttribute('class', 'constellation-line-glow');
      glow.setAttribute('fill', 'none');
      glow.style.animationDelay = `${i * 0.18}s`;
      linesGroup.appendChild(glow);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', stroke.d);
      line.setAttribute('transform', stroke.transform);
      line.setAttribute('class', 'constellation-line');
      line.setAttribute('fill', 'none');
      line.setAttribute('filter', 'url(#line-glow)');
      line.style.animationDelay = `${i * 0.18}s`;
      linesGroup.appendChild(line);
    });

    data.stars.forEach((star, i) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'constellation-star-group');
      g.style.animationDelay = `${0.4 + i * 0.035}s`;

      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', star.x);
      ring.setAttribute('cy', star.y);
      ring.setAttribute('r', 6.5);
      ring.setAttribute('class', 'star-glow-ring');

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', star.x);
      dot.setAttribute('cy', star.y);
      dot.setAttribute('r', 3);
      dot.setAttribute('class', 'constellation-star');
      dot.setAttribute('filter', 'url(#star-glow)');
      dot.setAttribute('fill', 'url(#star-gradient)');

      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hit.setAttribute('cx', star.x);
      hit.setAttribute('cy', star.y);
      hit.setAttribute('r', 13);
      hit.setAttribute('class', 'star-hit');
      hit.setAttribute('tabindex', '0');
      hit.setAttribute('role', 'button');
      hit.setAttribute('aria-label', `Звезда ${i + 1}`);

      const showCompliment = () => {
        complimentEl.classList.remove('visible');
        void complimentEl.offsetWidth;
        complimentEl.textContent = STAR_COMPLIMENTS[i % STAR_COMPLIMENTS.length];
        complimentEl.classList.add('visible');
        g.classList.add('star-active');
        setTimeout(() => g.classList.remove('star-active'), 550);
        if (typeof spawnHeartBurst === 'function') {
          const rect = svg.getBoundingClientRect();
          spawnHeartBurst({
            left: rect.left + star.x * (rect.width / viewW),
            top: rect.top + star.y * (rect.height / viewH),
            width: 0, height: 0,
          });
        }
      };

      hit.addEventListener('click', showCompliment);
      hit.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showCompliment(); }
      });

      g.appendChild(ring);
      g.appendChild(dot);
      g.appendChild(hit);
      starsGroup.appendChild(g);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        svg.classList.add('constellation-visible');
        if (card) card.classList.add('is-visible');
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(document.getElementById('cosmos'));
  }

  if (typeof opentype === 'undefined') {
    if (loadingEl) loadingEl.textContent = 'не удалось загрузить шрифт';
    return;
  }

  opentype.load(FONT_URL, (err, font) => {
    if (err || !font) {
      if (loadingEl) loadingEl.textContent = 'не удалось построить созвездие';
      return;
    }
    render(buildScriptConstellation(font, text, viewW, viewH));
  });
}
