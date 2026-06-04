/* ============================================================
   FELUR CLÍNICA — MAIN JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Touch/mobile: scroll nativo (sem smooth-scroll JS) para o arrastar não
  // travar. O vídeo do hero toca 1x e é pausado fora do ecrã (ver HERO VIDEO).
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  let lenis = null;

  function createFallbackSmoothScroller() {
    const root = document.documentElement;
    let current = window.scrollY;
    let target = current;
    let stopped = false;

    const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
    const clamp = (value) => Math.max(0, Math.min(value, maxScroll()));

    root.classList.add('lenis', 'lenis-smooth', 'felur-local-smooth');

    const onWheel = (event) => {
      if (stopped) return;
      event.preventDefault();
      target = clamp(target + event.deltaY * 0.95);
    };

    const onScroll = () => {
      if (Math.abs(window.scrollY - current) > 80) {
        current = window.scrollY;
        target = current;
      }
    };

    const raf = () => {
      if (!stopped) {
        current += (target - current) * 0.11;

        if (Math.abs(target - current) < 0.4) {
          current = target;
        }

        window.scrollTo(0, current);
      }

      requestAnimationFrame(raf);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      target = clamp(target);
      current = clamp(current);
    }, { passive: true });

    requestAnimationFrame(raf);

    return {
      scrollTo(value) {
        target = clamp(typeof value === 'number' ? value : 0);
      },
      stop() {
        stopped = true;
        root.classList.add('lenis-stopped');
      },
      start() {
        current = window.scrollY;
        target = current;
        stopped = false;
        root.classList.remove('lenis-stopped');
      }
    };
  }

  if (!prefersReducedMotion && !isTouch && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.86,
      touchMultiplier: 1.1
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
    window.felurLenis = lenis;
  } else if (!prefersReducedMotion && !isTouch) {
    lenis = createFallbackSmoothScroller();
    window.felurLenis = lenis;
  }

  /* ── HEADER SCROLL ───────────────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── MOBILE MENU ─────────────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (lenis) {
        if (isOpen) lenis.stop();
        else lenis.start();
      }
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && mobileNav.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
      }
    });
  }

  /* ── ACTIVE NAV LINK ─────────────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (
      linkPath === currentPath ||
      (currentPath === '' && linkPath === 'index.html') ||
      (currentPath === 'index.html' && linkPath === 'index.html')
    ) {
      link.classList.add('active');
    }
  });

  /* ── SCROLL REVEAL (fade-up + reveal) ────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible', 'is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.fade-up').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.06}s`;
    revealObserver.observe(el);
  });

  // grouped stagger: elements with data-reveal-group share incremental delay
  const revealEls = document.querySelectorAll('.reveal');
  const groupCounters = {};
  revealEls.forEach((el) => {
    const group = el.getAttribute('data-reveal-group') || 'default';
    const step = parseFloat(el.getAttribute('data-reveal-step')) || 0.09;
    groupCounters[group] = (groupCounters[group] || 0);
    el.style.transitionDelay = `${groupCounters[group] * step}s`;
    groupCounters[group] += 1;
    revealObserver.observe(el);
  });

  // deterministic first pass: reveal anything already within the viewport on
  // load (covers cases where IntersectionObserver doesn't fire immediately)
  const initialReveal = () => {
    document.querySelectorAll('.fade-up, .reveal').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95 && r.bottom > 0) {
        el.classList.add('visible', 'is-visible');
        revealObserver.unobserve(el);
      }
    });
  };
  requestAnimationFrame(initialReveal);
  window.addEventListener('load', () => requestAnimationFrame(initialReveal));

  /* ── PARALLAX (depth on scroll) — só desktop ─────────────────
     No mobile/touch o recálculo por frame (getBoundingClientRect +
     transform/scale) trava o arrastar; desativado por isso. */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  const allowParallax = window.matchMedia('(min-width: 981px)').matches
                     && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (parallaxEls.length && !prefersReducedMotion && allowParallax) {
    let ticking = false;

    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) return;
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const offset = (r.top + r.height / 2 - vh / 2) / vh; // ~ -0.6..0.6
        const y = -(offset * speed * 100);
        const scale = (el.tagName === 'IMG' || el.tagName === 'VIDEO') ? ' scale(1.12)' : '';
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)${scale}`;
      });
      ticking = false;
    };

    const requestParallax = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax, { passive: true });
    updateParallax();
  }

  /* ── HERO VIDEO ──────────────────────────────────────────────
     Desktop: vídeo em loop. Mobile/touch: toca uma vez (sem loop).
     Para o scroll não travar em telemóveis mais fracos, o vídeo é PAUSADO
     quando o hero sai do ecrã (deixa de descodificar durante o resto do
     scroll) e retomado se voltar a aparecer. Reduced-motion: fica só o poster. */
  const heroVideo = document.querySelector('.home-hero-media .hero-video');
  if (heroVideo && !prefersReducedMotion) {
    heroVideo.loop = !isTouch;            // loop no desktop; mobile toca 1x
    heroVideo.querySelectorAll('source[data-src]').forEach((s) => {
      s.src = s.getAttribute('data-src');
    });
    heroVideo.load();

    const tryPlay = () => {
      const p = heroVideo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    tryPlay();

    // pausa quando o hero sai do ecrã → poupa CPU/GPU no resto do scroll
    const heroSection = heroVideo.closest('.home-hero') || heroVideo;
    if ('IntersectionObserver' in window) {
      const heroIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (heroVideo.paused && !heroVideo.ended) tryPlay();
          } else if (!heroVideo.paused) {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.15 });
      heroIO.observe(heroSection);
    }
  }

  /* ── PAGE TRANSITION (consistent fade in/out) ────────────── */
  document.body.classList.add('page-fade');

  if (!prefersReducedMotion) {
    const isInternal = (a) => {
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
      if (a.target === '_blank' || a.hasAttribute('download')) return false;
      if (/^https?:\/\//i.test(href)) return false; // external
      return /\.html(\?.*)?(#.*)?$/.test(href) || href === '' ;
    };

    document.querySelectorAll('a[href]').forEach((a) => {
      if (!isInternal(a)) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        const href = a.getAttribute('href');
        e.preventDefault();
        document.documentElement.classList.add('is-leaving');
        setTimeout(() => { window.location.href = href; }, 320);
      });
    });

    // restore on back/forward cache
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) document.documentElement.classList.remove('is-leaving');
    });
  }

  /* ── TESTIMONIALS CAROUSEL ───────────────────────────────── */
  document.querySelectorAll('.testi-carousel').forEach((carousel) => {
    const track = carousel.querySelector('.testi-track');
    const cards = Array.from(carousel.querySelectorAll('.testi-card'));
    const prev = carousel.querySelector('.testi-prev');
    const next = carousel.querySelector('.testi-next');
    const dotsWrap = carousel.querySelector('.testi-dots');
    if (!track || cards.length === 0) return;

    let index = 0;
    let timer = null;
    const delay = parseInt(carousel.getAttribute('data-testi-autoplay'), 10) || 0;

    // build dots
    const dots = cards.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(i) {
      index = (i + cards.length) % cards.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
      cards.forEach((c, ci) => c.setAttribute('aria-hidden', ci === index ? 'false' : 'true'));
    }

    function nextSlide() { goTo(index + 1); }
    function prevSlide() { goTo(index - 1); }

    function start() {
      if (delay > 0 && !prefersReducedMotion) {
        stop();
        timer = setInterval(nextSlide, delay);
      }
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (next) next.addEventListener('click', () => { nextSlide(); restart(); });
    if (prev) prev.addEventListener('click', () => { prevSlide(); restart(); });

    // pause on hover / focus
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    // keyboard
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { nextSlide(); restart(); }
      else if (e.key === 'ArrowLeft') { prevSlide(); restart(); }
    });

    // swipe / drag
    let startX = 0, dragging = false;
    const viewport = carousel.querySelector('.testi-viewport') || track;
    viewport.addEventListener('pointerdown', (e) => {
      dragging = true; startX = e.clientX; stop();
    });
    window.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) { dx < 0 ? nextSlide() : prevSlide(); }
      start();
    });

    goTo(0);
    start();
  });

  /* ── CONTACT FORM ────────────────────────────────────────── */
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = form.querySelector('[name="nome"]').value.trim();
      const phone   = form.querySelector('[name="telefone"]').value.trim();
      const service = form.querySelector('[name="servico"]').value;
      const message = form.querySelector('[name="mensagem"]').value.trim();

      if (!name || !phone || !service) {
        showFormError(form, 'Por favor preencha os campos obrigatórios.');
        return;
      }

      // Build WhatsApp message with form data
      const waText = encodeURIComponent(
        `Olá! Vim através do site da Félur Clínica.\n\nNome: ${name}\nTelefone: ${phone}\nServiço: ${service}${message ? '\nMensagem: ' + message : ''}`
      );
      const waUrl = `https://wa.me/351964145114?text=${waText}`;

      // Show success state
      const successEl = form.nextElementSibling;
      if (successEl && successEl.classList.contains('form-success')) {
        form.style.display = 'none';
        successEl.style.display = 'block';
      }

      // Open WhatsApp after brief delay
      setTimeout(() => window.open(waUrl, '_blank'), 600);
    });
  }

  function showFormError(form, msg) {
    let err = form.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error';
      err.style.cssText = 'color:#c0392b;font-size:.82rem;margin-top:.5rem;';
      form.prepend(err);
    }
    err.textContent = msg;
    setTimeout(() => err.remove(), 4000);
  }

  /* ── SMOOTH SCROLL for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        // Read the current header height from the CSS variable (desktop vs mobile)
        const headerH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-h')
        ) || 110;
        const offset = headerH + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        if (lenis) {
          lenis.scrollTo(top);
        } else {
          window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }
    });
  });

  /* ── GALLERY LIGHTBOX (simple) ───────────────────────────── */
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length) {
    galleryItems.forEach(item => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.addEventListener('click', () => openLightbox(item.querySelector('img')));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') openLightbox(item.querySelector('img'));
      });
    });
  }

  function openLightbox(img) {
    if (!img) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:999;background:rgba(37,32,27,.92);
      display:flex;align-items:center;justify-content:center;cursor:zoom-out;
      padding:2rem;animation:fadeIn .25s ease;
    `;

    const style = document.createElement('style');
    style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(style);

    const picture = document.createElement('img');
    picture.src = img.src;
    picture.alt = img.alt;
    picture.style.cssText = 'max-width:90vw;max-height:90vh;object-fit:contain;border-radius:3px;';

    overlay.appendChild(picture);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
      overlay.remove();
      style.remove();
      document.body.style.overflow = '';
    };

    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
  }

  /* ── WORK CAROUSEL (Casos e detalhes reais) ──────────────── */
  document.querySelectorAll('[data-work-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.work-track');
    if (!track) return;
    const prev = carousel.querySelector('.work-prev');
    const next = carousel.querySelector('.work-next');

    const step = () => {
      const first = track.querySelector('img');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first ? first.getBoundingClientRect().width + gap : track.clientWidth;
    };
    const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;

    let timer = null;
    const delay = parseInt(carousel.getAttribute('data-autoplay'), 10) || 0;
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
      if (delay > 0 && !prefersReducedMotion) { stop(); timer = setInterval(() => go(1), delay); }
    };
    const restart = () => { stop(); start(); };

    const go = (dir) => {
      if (dir > 0 && atEnd()) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (dir < 0 && track.scrollLeft <= 4) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: dir * step(), behavior: 'smooth' });
      }
    };

    if (prev) prev.addEventListener('click', () => { go(-1); restart(); });
    if (next) next.addEventListener('click', () => { go(1); restart(); });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    track.addEventListener('touchstart', stop, { passive: true });

    start();
  });

})();
