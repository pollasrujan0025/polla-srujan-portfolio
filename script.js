/* ============================================================
   POLLA SRUJAN KUMAR — PORTFOLIO SCRIPT
   script.js — Neural Canvas, 3D Tilt, Nav, Animations
   ============================================================ */

'use strict';

// ============================================================
// 1. NEURAL NETWORK CANVAS BACKGROUND
// ============================================================
(function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const config = {
    nodeCount: 80,
    connectionDist: 160,
    nodeRadius: 1.8,
    speed: 0.28,
    color: {
      node: 'rgba(79, 163, 224, 0.8)',
      line: 'rgba(79, 163, 224, ',
      lineEnd: 'rgba(167, 139, 250, '
    }
  };

  let nodes = [];
  let W, H;
  let raf;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeNode() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      r:  config.nodeRadius * (0.6 + Math.random() * 0.8)
    };
  }

  function init() {
    nodes = Array.from({ length: config.nodeCount }, makeNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update & bounce
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    // Connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDist) {
          const alpha = (1 - dist / config.connectionDist) * 0.35;
          const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, config.color.line  + alpha + ')');
          grad.addColorStop(1, config.color.lineEnd + alpha + ')');
          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 0.8;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = config.color.node;
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();

  window.addEventListener('resize', () => {
    resize();
    init();
  });
})();


// ============================================================
// 2. CURSOR GLOW (desktop only)
// ============================================================
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) {
    if (glow) glow.style.display = 'none';
    return;
  }

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
})();


// ============================================================
// 3. HEADER SCROLL SHADOW
// ============================================================
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ============================================================
// 4. MOBILE NAVIGATION TOGGLE
// ============================================================
(function initMobileNav() {
  const btn   = document.getElementById('mobileToggle');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  // Close on link click
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();


// ============================================================
// 5. ACTIVE NAV LINK (SCROLL SPY)
// ============================================================
(function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
})();


// ============================================================
// 6. SCROLL REVEAL ANIMATIONS
// ============================================================
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-right');
  if (!els.length) return;

  // Respect reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => obs.observe(el));
})();


// ============================================================
// 7. 3D TILT EFFECT — Profile Card
// ============================================================
(function initProfileTilt() {
  const card = document.getElementById('profileCard');
  const inner = card && card.querySelector('.profile-3d-inner');
  if (!card || !inner) return;

  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const MAX_TILT = 14; // degrees

  card.addEventListener('mousemove', e => {
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    const rotX  = -dy * MAX_TILT;
    const rotY  =  dx * MAX_TILT;

    inner.style.transition = 'none';
    inner.style.transform  = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;
    inner.style.boxShadow  =
      `0 ${24 + dy * 12}px ${60 + Math.abs(dx) * 20}px rgba(0,0,0,0.55),
       0 0 40px rgba(79,163,224,${0.15 + Math.abs(dx) * 0.1})`;
  });

  card.addEventListener('mouseleave', () => {
    inner.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    inner.style.transform  = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    inner.style.boxShadow  = '';
  });
})();


// ============================================================
// 8. 3D TILT — Project Cards
// ============================================================
(function initProjectTilt() {
  const cards = document.querySelectorAll('.project-card[data-tilt]');
  if (!cards.length) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const MAX = 8;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = -(e.clientY - cy) / (rect.height / 2) * MAX;
      const ry   =  (e.clientX - cx) / (rect.width  / 2) * MAX;
      card.style.transition = 'none';
      card.style.transform  = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
      card.style.transform  = '';
    });
  });
})();


// ============================================================
// 9. CONTACT FORM — mailto fallback
// ============================================================
(function initContactForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      status.textContent = '⚠ Please fill in all fields.';
      status.className   = 'form-status error';
      return;
    }

    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailto  = `mailto:pollasrujan0025@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    status.textContent = '✓ Opening your email client...';
    status.className   = 'form-status success';
    form.reset();

    setTimeout(() => { status.textContent = ''; status.className = 'form-status'; }, 5000);
  });
})();


// ============================================================
// 10. SMOOTH ANCHOR SCROLL (for older browsers)
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
