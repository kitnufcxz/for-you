/* ═══════════════════════════════════════════════════════════
   🛰️ Hand-drawn GPS Route Map
   Real route: Gdańsk → Lidzbark Warmiński (OSRM / OSM)
   ═══════════════════════════════════════════════════════════ */

function initRouteMap() {
  const canvas = document.getElementById('route-canvas');
  if (!canvas || typeof ROUTE_DATA === 'undefined') return;

  const wrap = canvas.parentElement;
  const pinA = document.getElementById('route-pin-a');
  const pinB = document.getElementById('route-pin-b');
  const traveler = document.getElementById('route-traveler');

  document.getElementById('route-distance').textContent =
    `${ROUTE_DATA.distanceKm} км`;
  document.getElementById('route-duration').textContent =
    `~${Math.floor(ROUTE_DATA.durationMin / 60)} ч ${ROUTE_DATA.durationMin % 60} мин`;

  const dpr = window.devicePixelRatio || 1;
  let projected = [];
  let animProgress = 0;
  let animating = false;
  let rafId = null;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    projected = projectRoute(canvas.width, canvas.height);
    placePins(rect);
    draw(animProgress);
  }

  function projectRoute(w, h) {
    const pad = 36 * dpr;
    const { bounds, coordinates } = ROUTE_DATA;
    const lonSpan = bounds.maxLon - bounds.minLon || 1;
    const latSpan = bounds.maxLat - bounds.minLat || 1;

    return coordinates.map(([lon, lat]) => ({
      x: pad + ((lon - bounds.minLon) / lonSpan) * (w - pad * 2),
      y: h - pad - ((lat - bounds.minLat) / latSpan) * (h - pad * 2),
    }));
  }

  function placePins(rect) {
    if (!projected.length) return;
    const start = projected[0];
    const end = projected[projected.length - 1];
    const scale = 1 / dpr;

    pinA.style.left = start.x * scale - 14 + 'px';
    pinA.style.top = start.y * scale - 28 + 'px';
    pinB.style.left = end.x * scale - 14 + 'px';
    pinB.style.top = end.y * scale - 28 + 'px';
  }

  function draw(progress) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    drawPaper(ctx, w, h);
    drawLandSketch(ctx, w, h);
    drawGrid(ctx, w, h);

    if (projected.length < 2) return;

    const visibleCount = Math.max(2, Math.floor(projected.length * progress));
    const visible = projected.slice(0, visibleCount);

    drawSketchRoute(ctx, visible, w, h);
    drawRouteGlow(ctx, visible);

    if (visible.length >= 2) {
      drawCityLabel(ctx, visible[0], 'Gdańsk', 'left');
      drawCityLabel(ctx, visible[visible.length - 1], 'Lidzbark', 'right');
    }

    if (progress >= 1) {
      updateTraveler(projected);
    }
  }

  function drawPaper(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fffdfb');
    grad.addColorStop(0.5, '#fff8f4');
    grad.addColorStop(1, '#fff5f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = '#e8c4d0';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5 * dpr, 1.5 * dpr);
    }
    ctx.globalAlpha = 1;
  }

  function drawLandSketch(ctx, w, h) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#f0e0ec';

    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.15);
    ctx.bezierCurveTo(w * 0.2, h * 0.05, w * 0.4, h * 0.1, w * 0.55, h * 0.2);
    ctx.bezierCurveTo(w * 0.7, h * 0.3, w * 0.85, h * 0.25, w * 0.95, h * 0.35);
    ctx.lineTo(w * 0.95, h * 0.95);
    ctx.lineTo(w * 0.05, h * 0.95);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#dceef8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.15, 0);
    ctx.bezierCurveTo(w * 0.1, h * 0.3, w * 0.08, h * 0.6, w * 0.05, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawGrid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(201, 184, 232, 0.15)';
    ctx.lineWidth = 1 * dpr;
    const step = 40 * dpr;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function wobblePoints(points, seed, amplitude) {
    return points.map((p, i) => {
      const angle = seed + i * 0.7;
      return {
        x: p.x + Math.sin(angle) * amplitude,
        y: p.y + Math.cos(angle * 1.3) * amplitude,
      };
    });
  }

  function drawSketchRoute(ctx, points, w, h) {
    const layers = [
      { amp: 3 * dpr, alpha: 0.2, width: 5 * dpr, color: '#d4b8e8' },
      { amp: 2 * dpr, alpha: 0.35, width: 3.5 * dpr, color: '#c9b8e8' },
      { amp: 1 * dpr, alpha: 0.6, width: 2.5 * dpr, color: '#b8a0dc' },
      { amp: 0.5 * dpr, alpha: 1, width: 2 * dpr, color: '#a894d4' },
    ];

    layers.forEach((layer, li) => {
      const wobbled = wobblePoints(points, li * 1.7, layer.amp);
      ctx.save();
      ctx.globalAlpha = layer.alpha;
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash(li === 0 ? [8 * dpr, 6 * dpr] : []);

      ctx.beginPath();
      ctx.moveTo(wobbled[0].x, wobbled[0].y);
      for (let i = 1; i < wobbled.length; i++) {
        const prev = wobbled[i - 1];
        const curr = wobbled[i];
        const cpx = (prev.x + curr.x) / 2 + Math.sin(i * 0.5) * dpr;
        const cpy = (prev.y + curr.y) / 2 + Math.cos(i * 0.5) * dpr;
        ctx.quadraticCurveTo(cpx, cpy, curr.x, curr.y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawRouteGlow(ctx, points) {
    if (points.length < 2) return;
    const last = points[points.length - 1];
    const grad = ctx.createRadialGradient(last.x, last.y, 0, last.x, last.y, 20 * dpr);
    grad.addColorStop(0, 'rgba(232, 164, 184, 0.35)');
    grad.addColorStop(1, 'rgba(232, 164, 184, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(last.x - 20 * dpr, last.y - 20 * dpr, 40 * dpr, 40 * dpr);
  }

  function drawCityLabel(ctx, point, name, align) {
    ctx.save();
    ctx.font = `${11 * dpr}px "Nunito", sans-serif`;
    ctx.fillStyle = 'rgba(92, 74, 82, 0.55)';
    ctx.textAlign = align;
    const offsetX = align === 'left' ? -12 * dpr : 12 * dpr;
    ctx.fillText(name, point.x + offsetX, point.y - 14 * dpr);
    ctx.restore();
  }

  let travelT = 0;
  function updateTraveler(points) {
    travelT += 0.001;
    if (travelT > 1) travelT = 0;

    const idx = travelT * (points.length - 1);
    const i = Math.floor(idx);
    const frac = idx - i;
    const a = points[i];
    const b = points[Math.min(i + 1, points.length - 1)];

    const x = (a.x + (b.x - a.x) * frac) / dpr;
    const y = (a.y + (b.y - a.y) * frac) / dpr;

    traveler.style.left = x + 'px';
    traveler.style.top = y + 'px';
    traveler.classList.add('visible');

    if (animating) rafId = requestAnimationFrame(() => draw(1));
  }

  function animateDraw() {
    if (animating) return;
    animating = true;
    animProgress = 0;
    traveler.classList.remove('visible');

    const start = performance.now();
    const duration = 5500;

    function step(now) {
      animProgress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - animProgress, 3);
      draw(eased);

      if (animProgress < 1) {
        requestAnimationFrame(step);
      } else {
        animating = true;
        rafId = requestAnimationFrame(() => draw(1));
      }
    }
    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateDraw();
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(document.getElementById('route'));
}
