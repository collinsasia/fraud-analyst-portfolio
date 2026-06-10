// ── SIGNAL CANVAS ANIMATION ──
// Draws animated "transaction signal" waveforms — the hero's signature visual
(function () {
  const canvas = document.getElementById('signal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, lines, animFrame;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initLines();
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function initLines() {
    lines = Array.from({ length: 6 }, (_, i) => ({
      y: H * (0.15 + i * 0.14),
      points: [],
      speed: randomBetween(0.3, 0.7),
      amplitude: randomBetween(18, 55),
      frequency: randomBetween(0.006, 0.014),
      phase: randomBetween(0, Math.PI * 2),
      color: i % 3 === 0 ? '#00C2FF' : i % 3 === 1 ? '#2A5298' : '#162848',
      alpha: randomBetween(0.3, 0.9),
      width: i % 3 === 0 ? 1.5 : 0.8,
      // occasional spike
      spike: null,
      spikeTimer: Math.floor(randomBetween(60, 200)),
    }));
  }

  let tick = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    lines.forEach(line => {
      // Update spike
      line.spikeTimer--;
      if (line.spikeTimer <= 0) {
        line.spike = {
          x: randomBetween(W * 0.1, W * 0.9),
          mag: randomBetween(40, 90) * (Math.random() > 0.5 ? 1 : -1),
          life: 0,
          maxLife: 30,
        };
        line.spikeTimer = Math.floor(randomBetween(90, 280));
      }
      if (line.spike) {
        line.spike.life++;
        if (line.spike.life >= line.spike.maxLife) line.spike = null;
      }

      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.globalAlpha = line.alpha;
      ctx.lineWidth = line.width;
      ctx.lineJoin = 'round';

      const step = 4;
      for (let x = 0; x <= W; x += step) {
        const baseY = line.y + Math.sin(x * line.frequency + tick * line.speed * 0.04 + line.phase) * line.amplitude;

        let spikeOffset = 0;
        if (line.spike) {
          const dist = Math.abs(x - line.spike.x);
          if (dist < 60) {
            const progress = line.spike.life / line.spike.maxLife;
            const bell = Math.exp(-dist * dist / 400);
            // sharp rise, slow decay
            const envelope = progress < 0.3
              ? progress / 0.3
              : 1 - ((progress - 0.3) / 0.7);
            spikeOffset = line.spike.mag * bell * envelope;
          }
        }

        const y = baseY + spikeOffset;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animFrame);
    resize();
    draw();
  });

  resize();
  draw();
})();


// ── SCROLL-TRIGGERED ANIMATIONS ──
(function () {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings in the same parent
        const siblings = [...entry.target.parentElement.querySelectorAll('[data-animate]')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();


// ── ACTIVE NAV HIGHLIGHT ON SCROLL ──
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}`
            ? 'var(--off-white)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();


// ── NAV SHADOW ON SCROLL ──
(function () {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 20
      ? 'rgba(15,31,61,0.97)'
      : 'rgba(15,31,61,0.85)';
  }, { passive: true });
})();
