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
    gsap.fromTo('#isometric-building',
      { '--building-h': '0px' },
      {
        '--building-h': '130px',
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
    if (!section) return;

    const steps = section.querySelectorAll('.timeline-step');
    
    // Animate timeline line
    gsap.to('#timeline-line', {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        end: 'bottom 70%',
        scrub: 0.5
      }
    });

    // Step animations
    steps.forEach((step) => {
      gsap.fromTo(step, 
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            onEnter: () => {
              step.classList.add('active');
            }
          }
        }
      );
    });
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
  }
};
