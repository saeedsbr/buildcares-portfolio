/**
 * BuildCares — Main initialization and interaction controller
 * Orchestrates cursor, navigation, scroll reveal, and module initialization
 */

// Utility Functions
const utils = {
  lerp: (start, end, factor) => start + (end - start) * factor,
  
  mapRange: (value, inMin, inMax, outMin, outMax) => {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  },
  
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  },
  
  isWebGLAvailable: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  },
  
  debounce: (fn, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },
  
  throttle: (fn, delay) => {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall < delay) return;
      lastCall = now;
      fn.apply(this, args);
    };
  }
};

// Application Controller
const App = {
  mouse: { x: 0, y: 0 },
  cursorPos: { x: 0, y: 0 },
  
  init: function() {
    this.mobile = utils.isMobile();
    
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Navigation
      this.initNavbar();
      
      // 2. Scroll reveal
      this.initScrollReveal();
      
      // 3. Mobile menu
      this.initMobileMenu();
      
      // 4. Custom cursor (desktop only) — uses existing HTML elements
      if (!this.mobile) {
        this.initCustomCursor();
      }
      
      // 5. CAD Background (desktop only)
      if (!this.mobile && window.CADBackground) {
        window.CADBackground.init();
      }
      
      // 6. Three.js Hero Scene
      if (utils.isWebGLAvailable() && window.HeroScene) {
        window.HeroScene.init('hero-canvas');
      }
      
      // 7. Floor Plans & 3D Cutaway Model
      if (window.FloorPlan) {
        window.FloorPlan.createEditorPlan('#editor-floor-plan');
        window.FloorPlan.createTransformPlan('#transform-floor-plan');
        window.FloorPlan.createTransform3DModel('#transform-3d-canvas');
      }
      
      // 8. GSAP Section Animations
      if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        if (window.SectionAnimations) {
          window.SectionAnimations.init();
        }
      }
      
      // 9. Explorer view buttons
      this.initExplorer();
      
      // 10. Editor toolbar interactions
      this.initEditorToolbar();
    
      // 11. Dynamic site config sync from admin
      this.syncAdminConfig();
    });
  },
  
  syncAdminConfig: function() {
    const rawConfig = localStorage.getItem('buildcares_config');
    if (!rawConfig) return;
    try {
      const cfg = JSON.parse(rawConfig);
      if (cfg.phone) {
        document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
          a.href = `https://wa.me/${cfg.whatsapp || '447586750755'}`;
          if (a.textContent.includes('📱')) a.textContent = `📱 ${cfg.phone}`;
        });
      }
      if (cfg.email) {
        document.querySelectorAll('a[href*="mailto:"]').forEach(a => {
          a.href = `mailto:${cfg.email}`;
          if (a.textContent.includes('✉️')) a.textContent = `✉️ ${cfg.email}`;
        });
      }
    } catch(e) {}
  },

  // ── Custom Cursor ──────────────────────────────────────────
  initCustomCursor: function() {
    this.cursor = document.getElementById('custom-cursor');
    this.cursorCoords = document.getElementById('cursor-coords');
    this.coordX = this.cursorCoords ? this.cursorCoords.querySelector('.coord-x') : null;
    this.coordY = this.cursorCoords ? this.cursorCoords.querySelector('.coord-y') : null;
    
    if (!this.cursor || !this.cursorCoords) return;
    
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Track mouse position
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    // Hover effects for interactive elements
    document.querySelectorAll('a, button, .glass-card, .project-card, .feature-card, .tool-btn, .explorer-btn').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (this.cursor) this.cursor.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        if (this.cursor) this.cursor.classList.remove('cursor-hover');
      });
    });
    
    // Start RAF loop
    this.animateCursor();
  },
  
  animateCursor: function() {
    this.cursorPos.x = utils.lerp(this.cursorPos.x, this.mouse.x, 0.15);
    this.cursorPos.y = utils.lerp(this.cursorPos.y, this.mouse.y, 0.15);
    
    if (this.cursor) {
      this.cursor.style.left = this.cursorPos.x + 'px';
      this.cursor.style.top = this.cursorPos.y + 'px';
    }
    
    if (this.cursorCoords) {
      this.cursorCoords.style.left = this.cursorPos.x + 'px';
      this.cursorCoords.style.top = this.cursorPos.y + 'px';
      
      const mx = utils.mapRange(this.mouse.x, 0, window.innerWidth, 0, 1000).toFixed(2);
      const my = utils.mapRange(this.mouse.y, 0, window.innerHeight, 0, 1000).toFixed(2);
      if (this.coordX) this.coordX.textContent = 'X: ' + mx;
      if (this.coordY) this.coordY.textContent = 'Y: ' + my;
    }
    
    requestAnimationFrame(this.animateCursor.bind(this));
  },
  
  // ── Navigation ─────────────────────────────────────────────
  initNavbar: function() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    // Scroll class toggle
    window.addEventListener('scroll', utils.throttle(() => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      // Active section highlighting
      const sections = document.querySelectorAll('section[id]');
      let currentId = 'hero';
      
      sections.forEach(section => {
        if (window.scrollY >= (section.offsetTop - 200)) {
          currentId = section.getAttribute('id');
        }
      });
      
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' + currentId) {
          link.classList.add('active');
        }
      });
    }, 100));
    // Strip hash from address bar on page load if present
    if (window.location.hash) {
      setTimeout(() => {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, null, window.location.pathname);
        }
      }, 150);
    }
    
    // Smooth scrolling for all anchor links while keeping address bar 100% clean
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href) return;
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return;
        const targetId = href.substring(hashIndex);
        if (targetId === '#' || targetId === '') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, window.location.pathname);
          }
          
          // Close mobile menu if open
          const mobileMenu = document.getElementById('mobile-menu');
          if (mobileMenu) mobileMenu.classList.remove('open');
          const menuBtn = document.getElementById('mobile-menu-btn');
          if (menuBtn) menuBtn.classList.remove('active');
        }
      });
    });
  },
  
  // ── Mobile Menu ────────────────────────────────────────────
  initMobileMenu: function() {
    const toggle = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.classList.toggle('active');
      });
    }
  },
  
  // ── Scroll Reveal ──────────────────────────────────────────
  initScrollReveal: function() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });
    
    reveals.forEach(reveal => observer.observe(reveal));
  },
  
  // ── Explorer View Buttons ──────────────────────────────────
  initExplorer: function() {
    const buttons = document.querySelectorAll('.explorer-btn');
    const building = document.getElementById('explorer-building');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const view = btn.getAttribute('data-view');
        if (building) {
          building.className = 'explorer-building view-' + view;
        }
      });
    });
  },
  
  // ── Editor Toolbar ─────────────────────────────────────────
  initEditorToolbar: function() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    
    // Animate editor status bar coordinates
    const editorCanvas = document.querySelector('.editor-canvas');
    const editorX = document.getElementById('editor-x');
    const editorY = document.getElementById('editor-y');
    
    if (editorCanvas && editorX && editorY) {
      editorCanvas.addEventListener('mousemove', (e) => {
        const rect = editorCanvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width * 1200).toFixed(2);
        const y = ((e.clientY - rect.top) / rect.height * 900).toFixed(2);
        editorX.textContent = x;
        editorY.textContent = y;
      });
    }
  }
};

// Start application
App.init();
