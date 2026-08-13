window.SectionAnimations = {
  init: function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    this.initServices();
    this.initDeliver();
    this.initTransform();
    this.initTransformInteractive();
    this.initPortfolio();
    this.initHowItWorks();
    this.initWhy();
    this.initAbout();
    this.initContact();
  },

  initServices: function() {
    const section = document.querySelector('#services');
    if (!section) return;

    const cards = section.querySelectorAll('.feature-card');
    cards.forEach((card) => {
      gsap.fromTo(card, 
        { y: 50, opacity: 0 },
        {
          y: 0, 
          opacity: 1, 
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            onEnter: () => {
              // Animate SVG line-draw elements
              const svgPaths = card.querySelectorAll('.line-draw');
              if (svgPaths.length) {
                svgPaths.forEach(path => {
                  if (path.getTotalLength) {
                    const length = path.getTotalLength();
                    path.style.strokeDasharray = length;
                    path.style.strokeDashoffset = length;
                    gsap.to(path, {
                      strokeDashoffset: 0,
                      duration: 1.5,
                      ease: 'power2.inOut'
                    });
                  }
                });
              }
            }
          }
        }
      );
    });
  },

  initDeliver: function() {
    const section = document.querySelector('#deliver');
    if (!section) return;

    gsap.fromTo('.editor-container',
      { y: 80, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%' }
      }
    );

    // Animate floor plan lines when editor scrolls in
    gsap.delayedCall(0.5, () => {
      if (window.FloorPlan) {
        window.FloorPlan.animateIn('#editor-floor-plan');
      }
    });
  },

  initTransform: function() {
    const section = document.querySelector('#transform');
    if (!section) return;

    gsap.fromTo('#transform-2d',
      { x: -60, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%' }
      }
    );

    gsap.fromTo('#transform-3d',
      { x: 60, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%' }
      }
    );

    // Progress fill animation
    gsap.to('#transform-fill', {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        end: 'bottom 40%',
        scrub: 1
      }
    });

    // 3D Building Extrusion scroll animation
    gsap.fromTo('#transform-3d-canvas img, #transform-3d-canvas svg',
      { scale: 0.85, opacity: 0.4 },
      {
        scale: 1.0, opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 55%',
          end: 'bottom 45%',
          scrub: 1
        }
      }
    );

    // Animate stage highlights based on progress
    const stages = document.querySelectorAll('#transform-progress .stage');
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 45%',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        stages.forEach((stage, idx) => {
          stage.classList.remove('active');
          if (progress >= (idx * 0.25)) {
            stage.classList.add('active');
          }
        });
      }
    });
  },

  initPortfolio: function() {
    const section = document.querySelector('#portfolio');
    if (!section) return;

    gsap.fromTo('#portfolio .project-card', 
      { y: 60, opacity: 0 },
      { 
        y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%'
        }
      }
    );
  },

  initHowItWorks: function() {
    const section = document.querySelector('#how-it-works');
    const timelineLine = document.querySelector('#timeline-line');
    if (!section || !timelineLine) return;

    const steps = section.querySelectorAll('.timeline-step');

    function updateTimelineLine() {
      const rect = section.getBoundingClientRect();
      const winH = window.innerHeight;

      // Start drawing when top of section enters 85% down screen
      // Finish drawing when section moves up past 25% from top
      const startPoint = winH * 0.85;
      const totalDist = rect.height + winH * 0.6;
      const scrolled = startPoint - rect.top;

      let progress = scrolled / totalDist;
      progress = Math.max(0, Math.min(1, progress));

      timelineLine.style.width = (progress * 100) + '%';

      // Highlight step cards as line reaches them
      steps.forEach((step, idx) => {
        const threshold = idx / (steps.length - 1);
        if (progress >= threshold - 0.08) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', updateTimelineLine, { passive: true });
    window.addEventListener('resize', updateTimelineLine, { passive: true });
    updateTimelineLine();
  },

  initWhy: function() {
    const section = document.querySelector('#why');
    if (!section) return;

    const cards = section.querySelectorAll('.feature-card');
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)',
          delay: i * 0.1,
          scrollTrigger: { trigger: section, start: 'top 70%' }
        }
      );
    });
  },

  initAbout: function() {
    const section = document.querySelector('#about');
    if (!section) return;

    gsap.fromTo('#about .tech-panel',
      { x: -60, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 65%' }
      }
    );

    // Animate skill bars
    const bars = section.querySelectorAll('[style*="width:9"], [style*="width:88"], [style*="width:90"]');
    if (bars.length) {
      gsap.fromTo(bars,
        { width: '0%' },
        {
          width: (i, el) => el.style.width,
          duration: 1.5, stagger: 0.2, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 60%' }
        }
      );
    }
  },

  initContact: function() {
    const section = document.querySelector('#contact');
    if (!section) return;

    gsap.fromTo('.final-cta-content',
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%' }
      }
    );

    // Pulsing CTA button
    gsap.to('#final-cta-whatsapp', {
      boxShadow: '0 0 25px rgba(0, 229, 255, 0.5)',
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'sine.inOut',
      delay: 1
    });
  },

  initTransformInteractive: function() {
    const container = document.getElementById('transform-3d-canvas') || document.getElementById('transform-3d');
    if (!container) return;

    let scale = 1.0;

    function applyTransform() {
      const targetEl = container.querySelector('#render-3d-img') || container.querySelector('img') || container.querySelector('svg') || container;
      targetEl.style.transform = `scale(${scale})`;
      targetEl.style.transformOrigin = 'center center';
      targetEl.style.transition = 'transform 0.2s ease-out';
      const scaleText = document.getElementById('iso-scale-text');
      if (scaleText) scaleText.textContent = Math.round(scale * 100) + '%';
    }

    function resetView() {
      scale = 1.0;
      applyTransform();
    }

    // Mouse Wheel Zoom In / Zoom Out
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        scale = Math.min(scale + 0.15, 2.5);
      } else {
        scale = Math.max(scale - 0.15, 0.6);
      }
      applyTransform();
    }, { passive: false });

    // Double Click to Toggle 1x / 1.8x Zoom
    container.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      scale = scale > 1.2 ? 1.0 : 1.8;
      applyTransform();
    });

    // Interactive 3D Cursor Tilt & Rotation Tracking
    container.addEventListener('mousemove', (e) => {
      const wrapper = container.querySelector('#render-3d-wrapper');
      if (!wrapper) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotY = (x / (rect.width / 2)) * 14;
      const rotX = -(y / (rect.height / 2)) * 12;
      wrapper.style.animation = 'none';
      wrapper.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
    });

    let isRotating = false;

    container.addEventListener('mouseleave', () => {
      const wrapper = container.querySelector('#render-3d-wrapper');
      if (wrapper && isRotating) {
        wrapper.style.transform = '';
        wrapper.classList.add('render-3d-rotating');
      } else if (wrapper) {
        wrapper.style.transform = 'none';
      }
    });

    // Toolbar Buttons
    document.getElementById('iso-rotate-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = container.querySelector('#render-3d-wrapper');
      const btn = document.getElementById('iso-rotate-btn');
      isRotating = !isRotating;
      if (isRotating) {
        if (wrapper) wrapper.classList.add('render-3d-rotating');
        if (btn) {
          btn.textContent = '🔄 Rotating ON';
          btn.style.background = 'rgba(0,229,255,0.25)';
          btn.style.borderColor = 'var(--accent-cyan)';
          btn.style.color = '#fff';
        }
      } else {
        if (wrapper) {
          wrapper.classList.remove('render-3d-rotating');
          wrapper.style.animation = 'none';
          wrapper.style.transform = 'none';
        }
        if (btn) {
          btn.textContent = '⏸ Rotation OFF';
          btn.style.background = 'rgba(255,255,255,0.1)';
          btn.style.borderColor = 'var(--line-color)';
          btn.style.color = '#aaa';
        }
      }
    });

    document.getElementById('iso-zoom-in')?.addEventListener('click', (e) => {
      e.stopPropagation();
      scale = Math.min(scale + 0.25, 2.5);
      applyTransform();
    });

    document.getElementById('iso-zoom-out')?.addEventListener('click', (e) => {
      e.stopPropagation();
      scale = Math.max(scale - 0.25, 0.6);
      applyTransform();
    });

    document.getElementById('iso-reset-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      resetView();
    });
  }
};

