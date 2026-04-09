/* ============================================
   VOID — Animation Engine
   Lenis + GSAP ScrollTrigger + Custom Effects
   ============================================ */

(function () {
  'use strict';

  // ─── Wait for everything ───
  let lenis;
  const state = {
    scrollVelocity: 0,
    scrollProgress: 0,
    isReady: false,
  };

  // ─── PRELOADER ───
  function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    setTimeout(() => {
      preloader.classList.add('hidden');
      setTimeout(() => {
        preloader.remove();
        state.isReady = true;
        animateHero();
      }, 800);
    }, 1200);
  }

  // ─── LENIS SMOOTH SCROLL ───
  function initLenis() {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      autoRaf: false,
    });

    // Sync with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Track velocity for marquee
    lenis.on('scroll', (e) => {
      state.scrollVelocity = e.velocity;
      state.scrollProgress = e.progress;
      updateScrollProgress(e.progress);
    });

    // Smooth anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: 0 });
        }
      });
    });

    // Back to top
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        lenis.scrollTo(0);
      });
    }
  }

  // ─── SCROLL PROGRESS BAR ───
  function updateScrollProgress(progress) {
    const bar = document.getElementById('scroll-progress-bar');
    if (bar) {
      bar.style.width = (progress * 100) + '%';
    }

    // Show/hide back-to-top
    const btn = document.getElementById('back-to-top');
    if (btn) {
      btn.classList.toggle('visible', progress > 0.1);
    }
  }

  // ─── CUSTOM CURSOR ───
  function initCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

    let mx = 0, my = 0;
    let cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function updateCursor() {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover states
    document.querySelectorAll('[data-hover]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // ─── HERO ANIMATION ───
  function animateHero() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.to('.hero__eyebrow', {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: 0.2,
    })
    .to('.hero__title-word', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.1,
    }, '-=0.7')
    .to('.hero__subtitle', {
      opacity: 1,
      y: 0,
      duration: 1,
    }, '-=0.6')
    .to('.hero__scroll-indicator', {
      opacity: 1,
      duration: 0.8,
    }, '-=0.4');
  }

  // ─── MARQUEE (Velocity-Driven) ───
  function initMarquee() {
    const track1 = document.getElementById('marquee-track-1');
    const track2 = document.getElementById('marquee-track-2');
    if (!track1 || !track2) return;

    let baseSpeed1 = -0.5;
    let baseSpeed2 = 0.5;
    let pos1 = 0;
    let pos2 = 0;

    // Get width of one content block
    const content1 = track1.querySelector('.marquee__content');
    const content2 = track2.querySelector('.marquee__content');
    const width1 = content1 ? content1.offsetWidth : 2000;
    const width2 = content2 ? content2.offsetWidth : 2000;

    function updateMarquee() {
      // Add velocity influence
      const velocityInfluence = state.scrollVelocity * 0.15;

      pos1 += baseSpeed1 - velocityInfluence;
      pos2 += baseSpeed2 + velocityInfluence;

      // Reset positions for seamless loop
      if (pos1 <= -width1) pos1 += width1;
      if (pos1 >= 0) pos1 -= width1;

      if (pos2 >= 0) pos2 -= width2;
      if (pos2 <= -width2) pos2 += width2;

      track1.style.transform = `translateX(${pos1}px)`;
      track2.style.transform = `translateX(${pos2}px)`;

      requestAnimationFrame(updateMarquee);
    }

    updateMarquee();
  }

  // ─── PROJECT CARDS (Staggered Reveal + Parallax) ───
  function initProjects() {
    // Reveal header
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Cards staggered reveal
    const cards = gsap.utils.toArray('.project-card');
    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'expo.out',
        delay: i * 0.15,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      // Parallax on each card based on data-speed
      const speed = parseFloat(card.getAttribute('data-speed')) || 1;
      gsap.to(card, {
        yPercent: (1 - speed) * 30,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });
  }

  // ─── CAPABILITIES (Sticky with Active Tracking) ───
  function initCapabilities() {
    const items = gsap.utils.toArray('.capability-item');
    const counter = document.getElementById('cap-counter');

    items.forEach((item, i) => {
      // Reveal animation
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      // Track active item
      ScrollTrigger.create({
        trigger: item,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => {
          items.forEach((el) => el.classList.remove('is-active'));
          item.classList.add('is-active');
          if (counter) counter.textContent = item.getAttribute('data-cap-index');
        },
        onEnterBack: () => {
          items.forEach((el) => el.classList.remove('is-active'));
          item.classList.add('is-active');
          if (counter) counter.textContent = item.getAttribute('data-cap-index');
        },
      });
    });
  }

  // ─── VISUAL BREAK (Multi-Layer Parallax) ───
  function initVisualBreak() {
    const layers = document.querySelectorAll('[data-parallax-speed]');

    layers.forEach((layer) => {
      const speed = parseFloat(layer.getAttribute('data-parallax-speed'));

      gsap.to(layer, {
        yPercent: speed * 40,
        ease: 'none',
        scrollTrigger: {
          trigger: '.visual-break',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    });

    // Text reveal
    const headingSpans = document.querySelectorAll('.visual-break__heading span');
    headingSpans.forEach((span, i) => {
      gsap.from(span, {
        opacity: 0,
        y: 80,
        rotateX: 20,
        duration: 1.2,
        ease: 'expo.out',
        delay: i * 0.15,
        scrollTrigger: {
          trigger: '.visual-break',
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ─── TEAM CARDS (3D Perspective Reveal) ───
  function initTeam() {
    const cards = gsap.utils.toArray('.team-card');

    cards.forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        rotateY: 0,
        rotateX: 0,
        translateZ: 0,
        duration: 1.2,
        ease: 'expo.out',
        delay: i * 0.12,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ─── CONTACT (Letter-by-Letter Reveal) ───
  function initContact() {
    const heading = document.getElementById('contact-heading');
    if (!heading) return;

    // Split text into characters
    const text = heading.textContent.trim();
    heading.innerHTML = '';

    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      heading.appendChild(span);
    });

    // Animate characters
    gsap.to('.contact__heading .char', {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      ease: 'expo.out',
      stagger: 0.03,
      scrollTrigger: {
        trigger: '.contact',
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    });

    // CTA button
    gsap.to('#contact-cta', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '#contact-cta',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }

  // ─── INITIALIZE EVERYTHING ───
  function init() {
    gsap.registerPlugin(ScrollTrigger);
    initLenis();
    initCursor();
    hidePreloader();
    initMarquee();
    initProjects();
    initCapabilities();
    initVisualBreak();
    initTeam();
    initContact();
  }

  // Fire when DOM + scripts are ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
