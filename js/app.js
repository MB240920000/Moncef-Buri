/* ═══════════════════════════════════════════════════
   NEXUS CRM — MAIN JAVASCRIPT
   Three.js 3D scenes + GSAP animations + UI logic
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── utility ────────────────────────────────────── */
  const qs  = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ════════════════════════════════════════════════
     1. THREE.JS — HERO PARTICLE FIELD
  ════════════════════════════════════════════════ */
  function initHeroCanvas() {
    const canvas = qs('#hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 2000);
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);

    /* ── particles ─────────────────────────────────── */
    const PARTICLE_COUNT = 1800;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colours   = new Float32Array(PARTICLE_COUNT * 3);
    const sizes     = new Float32Array(PARTICLE_COUNT);

    const palette = [
      new THREE.Color('#3b82f6'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#e0e7ff'),
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 400 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colours[i * 3]     = c.r;
      colours[i * 3 + 1] = c.g;
      colours[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colours, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:   { value: 0 },
        uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(uTime * 0.4 + position.x * 0.008) * 8.0;
          pos.x += cos(uTime * 0.3 + position.z * 0.008) * 6.0;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = size * uPixelRatio * (400.0 / -mv.z);
          vAlpha = smoothstep(900.0, 200.0, -mv.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float alpha = (1.0 - smoothstep(0.4, 1.0, d)) * vAlpha;
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    /* ── floating wireframe geometries ─────────────── */
    function makeWireShape(geo, color, pos, scale = 1) {
      const mat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      mesh.scale.setScalar(scale);
      scene.add(mesh);
      return mesh;
    }

    const shapes = [
      makeWireShape(new THREE.IcosahedronGeometry(80, 1), 0x3b82f6,  [-280, 100, -200], 1),
      makeWireShape(new THREE.OctahedronGeometry(60, 0),  0x8b5cf6,  [ 300,-80,  -300], 1),
      makeWireShape(new THREE.TorusGeometry(55, 18, 12, 32), 0x06b6d4, [100, 200, -250], 1),
      makeWireShape(new THREE.TetrahedronGeometry(70, 0), 0x8b5cf6,  [-200,-180, -100], 1),
      makeWireShape(new THREE.IcosahedronGeometry(50, 1), 0x3b82f6,  [ 220, 160, -150], 0.8),
    ];

    /* ── mouse parallax ────────────────────────────── */
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / innerHeight - 0.5) * 2;
    });

    /* ── resize ────────────────────────────────────── */
    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    /* ── animate ───────────────────────────────────── */
    let frame = 0;
    const rotations = shapes.map(() => ({
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.005,
      z: (Math.random() - 0.5) * 0.003,
    }));

    function tick() {
      requestAnimationFrame(tick);
      frame += 0.008;

      mat.uniforms.uTime.value = frame;

      targetX = lerp(targetX, mouseX, 0.05);
      targetY = lerp(targetY, mouseY, 0.05);

      points.rotation.y = frame * 0.04 + targetX * 0.12;
      points.rotation.x = targetY * 0.08;

      shapes.forEach((s, i) => {
        s.rotation.x += rotations[i].x;
        s.rotation.y += rotations[i].y;
        s.rotation.z += rotations[i].z;
        s.position.y += Math.sin(frame + i) * 0.3;
      });

      renderer.render(scene, camera);
    }
    tick();
  }

  /* ════════════════════════════════════════════════
     2. THREE.JS — CTA BACKGROUND
  ════════════════════════════════════════════════ */
  function initCtaCanvas() {
    const canvas = qs('#cta-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const COUNT = 500;
    const pos   = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 800;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 600;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      color: 0x8b5cf6, size: 1.5, transparent: true, opacity: 0.5,
    });
    scene.add(new THREE.Points(g, m));

    let t = 0;
    const ro = new THREE.IcosahedronGeometry(80, 1);
    const rm = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, opacity: 0.08, transparent: true });
    const rMesh = new THREE.Mesh(ro, rm);
    scene.add(rMesh);

    const resize = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);

    (function tick() {
      requestAnimationFrame(tick);
      t += 0.005;
      rMesh.rotation.x = t * 0.6;
      rMesh.rotation.y = t * 0.4;
      renderer.render(scene, camera);
    })();
  }

  /* ════════════════════════════════════════════════
     3. NAVBAR — scroll behaviour
  ════════════════════════════════════════════════ */
  function initNavbar() {
    const nav = qs('#navbar');
    const scrolled = () => {
      nav.classList.toggle('scrolled', scrollY > 20);
    };
    window.addEventListener('scroll', scrolled, { passive: true });
    scrolled();
  }

  /* ════════════════════════════════════════════════
     4. MOBILE MENU
  ════════════════════════════════════════════════ */
  function initMobileMenu() {
    const btn  = qs('#hamburger');
    const menu = qs('#mobileMenu');
    let open = false;

    btn.addEventListener('click', () => {
      open = !open;
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      const spans = btn.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });

    qsa('.mobile-link').forEach(a => {
      a.addEventListener('click', () => {
        open = false;
        menu.classList.remove('open');
        document.body.style.overflow = '';
        btn.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity = '';
        });
      });
    });
  }

  /* ════════════════════════════════════════════════
     5. GSAP SCROLL ANIMATIONS
  ════════════════════════════════════════════════ */
  function initGSAP() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* Smooth page entrance */
    gsap.from('body', { opacity: 0, duration: 0.6, ease: 'power2.out' });

    /* Hero entrance sequence */
    const heroTl = gsap.timeline({ delay: 0.3 });
    heroTl
      .from('.hero-badge', { opacity: 0, y: -20, duration: 0.7, ease: 'back.out(2)' })
      .from('.hero-title',  { opacity: 0, y:  40, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .from('.hero-sub',    { opacity: 0, y:  30, duration: 0.7, ease: 'power2.out' }, '-=0.4')
      .from('.hero-cta',    { opacity: 0, y:  20, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .from('.hero-stats',  { opacity: 0, y:  20, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .from('.scroll-hint', { opacity: 0, duration: 0.8 }, '-=0.2');

    /* Animated line on process section */
    gsap.from('.process-line', {
      scaleY: 0,
      transformOrigin: 'top',
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#process',
        start: 'top 70%',
      },
    });

    /* Platform cards stagger */
    gsap.from('.platform-card', {
      y: 50,
      opacity: 0,
      stagger: 0.08,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.platforms-grid',
        start: 'top 80%',
      },
    });

    /* Stat cards pop */
    gsap.from('.stat-card', {
      scale: 0.85,
      opacity: 0,
      stagger: 0.07,
      duration: 0.6,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: '.stats-grid',
        start: 'top 80%',
      },
    });

    /* Floating parallax on hero shapes — driven by scroll */
    gsap.to('.hero-content', {
      y: 120,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end:   'bottom top',
        scrub: true,
      },
    });
  }

  /* ════════════════════════════════════════════════
     6. AOS — Animate On Scroll (lightweight custom)
  ════════════════════════════════════════════════ */
  function initAOS() {
    const items = qsa('[data-aos]');
    if (!items.length) return;

    const delays = {};
    items.forEach(el => {
      const d = parseInt(el.dataset.aosDelay || 0, 10);
      delays[el] = d;
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.aosDelay || 0, 10);
          setTimeout(() => el.classList.add('aos-animate'), delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => observer.observe(el));
  }

  /* ════════════════════════════════════════════════
     7. COUNTER ANIMATION
  ════════════════════════════════════════════════ */
  function initCounters() {
    const counters = qsa('.counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseFloat(el.dataset.target);
        const isFloat = target % 1 !== 0;
        const duration = 1600;
        const start  = performance.now();

        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = target * eased;
          el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  /* ════════════════════════════════════════════════
     8. FAQ ACCORDION
  ════════════════════════════════════════════════ */
  function initFAQ() {
    qsa('.faq-item').forEach(item => {
      const btn = item.querySelector('.faq-question');
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // close all
        qsa('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ════════════════════════════════════════════════
     9. CONTACT FORM
  ════════════════════════════════════════════════ */
  function initContactForm() {
    const form = qs('#contactForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;

      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending…';
      btn.disabled = true;
      btn.style.opacity = '0.75';

      setTimeout(() => {
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M20 6L9 17l-5-5"/></svg> Message sent! We\'ll be in touch.';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        btn.style.boxShadow  = '0 4px 20px rgba(34,197,94,0.4)';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
          btn.style.opacity  = '';
          btn.style.background = '';
          btn.style.boxShadow  = '';
        }, 4000);
      }, 1200);
    });
  }

  /* ════════════════════════════════════════════════
     10. SMOOTH ANCHOR SCROLL
  ════════════════════════════════════════════════ */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = qs(id);
        if (!target) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h') || 72, 10);
        const top = target.getBoundingClientRect().top + scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ════════════════════════════════════════════════
     11. CURSOR GLOW EFFECT
  ════════════════════════════════════════════════ */
  function initCursorGlow() {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      width:300px; height:300px; border-radius:50%;
      background:radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
      transform:translate(-50%,-50%);
      transition:opacity 0.3s;
      opacity:0;
    `;
    document.body.appendChild(glow);

    let mx = 0, my = 0, gx = 0, gy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; glow.style.opacity = '1'; });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

    (function tick() {
      requestAnimationFrame(tick);
      gx = lerp(gx, mx, 0.1);
      gy = lerp(gy, my, 0.1);
      glow.style.left = gx + 'px';
      glow.style.top  = gy + 'px';
    })();
  }

  /* ════════════════════════════════════════════════
     12. PLATFORM CARD 3D TILT
  ════════════════════════════════════════════════ */
  function initCardTilt() {
    qsa('.platform-card, .service-card, .stat-card, .case-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
        card.style.transition = 'transform 0.1s';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
      });
    });
  }

  /* ════════════════════════════════════════════════
     13. SPIN KEYFRAME FOR LOADER
  ════════════════════════════════════════════════ */
  (function addSpinKeyframe() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  })();

  /* ════════════════════════════════════════════════
     14. PAGE LOAD — reveal
  ════════════════════════════════════════════════ */
  function initPageReveal() {
    const veil = document.createElement('div');
    veil.style.cssText = `
      position:fixed;inset:0;z-index:10000;
      background:#080c14;
      transition:opacity 0.8s ease;
    `;
    document.body.appendChild(veil);

    window.addEventListener('load', () => {
      setTimeout(() => {
        veil.style.opacity = '0';
        setTimeout(() => veil.remove(), 900);
      }, 200);
    });
  }

  /* ════════════════════════════════════════════════
     INIT ALL
  ════════════════════════════════════════════════ */
  initPageReveal();

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initAOS();
    initCounters();
    initFAQ();
    initContactForm();
    initSmoothScroll();
    initCursorGlow();
    initCardTilt();

    // Three.js scenes after DOM ready
    setTimeout(initHeroCanvas, 0);
    setTimeout(initCtaCanvas,  100);

    // GSAP after Three.js canvases created
    setTimeout(initGSAP, 50);
  });

})();
