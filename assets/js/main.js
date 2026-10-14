/* ==========================================================
   Gomes Guindastes — interações
   ========================================================== */

// Número do WhatsApp no formato internacional, só dígitos (55 + DDD + número).
const WHATSAPP_NUMBER = '554332754288';

(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- links do WhatsApp (único destino externo do site) ---------- */
  $$('[data-wa]').forEach((a) => {
    const msg = a.dataset.wa;
    a.href = `https://wa.me/${WHATSAPP_NUMBER}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
  });

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const nav = $('[data-nav]');
  const hero = $('[data-hero]');
  const cta = $('.cta');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // No celular as fotos do topo ficam sem zoom (já estão no limite da resolução).
  const small = window.matchMedia('(max-width: 820px)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- nav + botão flutuante ---------- */
  let lastY = 0;
  const onScroll = (y) => {
    nav.classList.toggle('is-solid', y > 40);
    const goingDown = y > lastY;
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    nav.classList.toggle('is-hidden', goingDown && y > heroBottom);
    lastY = y;
  };

  if (!hasGsap || reduce) {
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
    onScroll(window.scrollY);
    return;
  }

  /* ==========================================================
     Movimento
     ========================================================== */
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('motion');

  // Rolagem suave
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ lerp: 0.15, smoothWheel: true });
    lenis.on('scroll', (e) => { ScrollTrigger.update(); onScroll(e.scroll); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  }

  // Âncoras internas
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#topo' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else window.scrollTo({ top: target === 0 ? 0 : target.offsetTop, behavior: 'smooth' });
    });
  });

  /* ---------- HERO: entrada ---------- */
  const titleSpans = $$('[data-hero-title] .line > span');
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('[data-hero-bg]', small ? { opacity: 0, duration: 1.6, ease: 'power2.out' } : { scale: 1.4, duration: 2.2, ease: 'power3.out' }, 0)
    .from(titleSpans, { yPercent: 115, duration: 1.4, stagger: 0.09 }, 0.15)
    .from('[data-hero-eyebrow] span', { opacity: 0, y: 12, duration: 1, stagger: 0.08 }, 0.5)
    .from('.hero__hud', { opacity: 0, y: 20, duration: 1.2 }, 0.7)
    .from('[data-hero-hint]', { opacity: 0, duration: 1 }, 1.1);

  /* ---------- HERO: sequência de rolagem ---------- */
  const hud = {
    alt: $('[data-hud="alt"]'),
    raio: $('[data-hud="raio"]'),
    carga: $('[data-hud="carga"]'),
    status: $('[data-hud="status"]'),
    bar: $('[data-hud-bar]'),
  };
  const fmt = (n) => n.toFixed(1).replace('.', ',').padStart(4, '0');
  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  let lastStatus = '';

  const updateHud = (p) => {
    hud.alt.textContent = fmt(38 * p);
    hud.raio.textContent = fmt(18 - 9 * p);
    hud.carga.textContent = fmt(12.4 * clamp01((p - 0.22) / 0.38));
    hud.bar.style.transform = `scaleX(${p})`;
    const status = p < 0.06 ? 'Aguardando' : p < 0.92 ? 'Içando' : 'Posicionado';
    if (status !== lastStatus) { hud.status.textContent = status; lastStatus = status; }
  };

  const truck = $('[data-hero-truck]');
  const truckImg = $('img', truck);

  gsap.set('[data-hero-spec] > *', { opacity: 0, y: 40 });
  gsap.set(truck, { clipPath: 'inset(100% 0% 0% 0%)' });

  const seq = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => updateHud(self.progress),
    },
  });

  seq
    .to('[data-hero-bg]', small ? { yPercent: 4, duration: 10 } : { scale: 1.12, yPercent: 6, duration: 10 }, 0)
    .to('[data-hero-hint]', { opacity: 0, duration: 0.8 }, 0)
    .to(titleSpans, {
      y: (i, el) => -el.offsetHeight * 1.15,
      duration: 2.2, stagger: 0.35, ease: 'power2.in',
    }, 0.3)
    .to('[data-hero-eyebrow]', { opacity: 0, y: -20, duration: 1.5 }, 0.6)
    .fromTo('[data-hero-bg]', { filter: 'brightness(1) saturate(1)' }, { filter: 'brightness(.55) saturate(.85)', duration: 3 }, 2.2)
    .to(truck, { clipPath: 'inset(0% 0% 0% 0%)', duration: 3, ease: 'power2.inOut' }, 2.6)
    .fromTo(truckImg, { scale: small ? 1 : 1.35 }, { scale: 1, duration: 4, ease: 'power2.out' }, 2.6)
    .to('[data-hero-spec] > *', { opacity: 1, y: 0, duration: 1.4, stagger: 0.3, ease: 'power2.out' }, 4.3)
    .to({}, { duration: 2.2 }); // respiro antes de soltar a seção

  /* ---------- manifesto: palavras acendem com a rolagem ---------- */
  const words = $('[data-words]');
  if (words) {
    const text = words.textContent.trim().replace(/\s+/g, ' ');
    words.innerHTML = text.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
    gsap.fromTo($$('.w', words), { opacity: 0.14 }, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: words, start: 'top 78%', end: 'bottom 42%', scrub: true },
    });
  }

  /* ---------- revelações ---------- */
  gsap.set('[data-reveal]', { opacity: 0, y: 44 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', overwrite: true,
    }),
  });

  // Parallax da foto da frota
  $$('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -2.5 }, {
      yPercent: 2.5, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Cabo do "como funciona"
  const cable = $('[data-cable]');
  if (cable) {
    ScrollTrigger.matchMedia({
      '(max-width: 820px)': () => gsap.fromTo(cable, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 60%', scrub: true },
      }),
      '(min-width: 821px)': () => gsap.fromTo(cable, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'top 35%', scrub: true },
      }),
    });
  }

  // Título do CTA
  gsap.from('.cta__title .line > span', {
    yPercent: 110, duration: 1.3, stagger: 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.cta', start: 'top 70%' },
  });

  // Faixa de serviços acompanha a direção da rolagem
  const track = $('.marquee__track');
  if (track && lenis) {
    lenis.on('scroll', (e) => {
      track.style.animationDirection = e.direction < 0 ? 'reverse' : 'normal';
    });
  }

  /* ---------- botão magnético ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-magnet]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
  onScroll(window.scrollY);
})();
