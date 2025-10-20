// ==========================================
// Modern Minimalist JavaScript
// ==========================================

// Theme Management
class ThemeManager {
  constructor() {
    // Default to dark theme unless user has explicitly set a preference
    const savedTheme = localStorage.getItem('theme');
    this.theme = savedTheme !== null ? savedTheme : 'dark';
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.bindEvents();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.theme = theme;
    localStorage.setItem('theme', theme);

    // Reinitialize Mermaid with new theme
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: theme === 'dark' ? '#f8fafc' : '#1e293b',
          primaryBorderColor: '#3b82f6',
          lineColor: '#8b5cf6',
          secondaryColor: '#8b5cf6',
          tertiaryColor: '#10b981',
          background: theme === 'dark' ? '#1e293b' : '#f8fafc',
          mainBkg: theme === 'dark' ? '#1e293b' : '#f8fafc',
          secondBkg: theme === 'dark' ? '#334155' : '#f1f5f9',
          tertiaryBkg: theme === 'dark' ? '#0f172a' : '#ffffff'
        }
      });

      // Reload mermaid diagrams
      const mermaidDivs = document.querySelectorAll('.mermaid');
      mermaidDivs.forEach((div) => {
        const code = div.textContent;
        div.innerHTML = code;
        div.removeAttribute('data-processed');
      });
      mermaid.run().catch((e) => console.error('Mermaid run error (theme apply):', e));
    }
  }

  toggleTheme() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }

  bindEvents() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
}

// Navigation Management
class NavigationManager {
  constructor() {
    this.nav = document.querySelector('.nav');
    this.navToggle = document.getElementById('navToggle');
    this.navMenu = document.getElementById('navMenu');
    this.isOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleScroll();
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen &&
          !this.navMenu.contains(e.target) &&
          !this.navToggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Handle scroll
    window.addEventListener('scroll', () => this.handleScroll());
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.navMenu.classList.toggle('active', this.isOpen);
    this.navToggle.classList.toggle('active', this.isOpen);
  }

  closeMenu() {
    this.isOpen = false;
    this.navMenu.classList.remove('active');
    this.navToggle.classList.remove('active');
  }

  handleScroll() {
    if (window.scrollY > 50) {
      this.nav.classList.add('scrolled');
    } else {
      this.nav.classList.remove('scrolled');
    }
  }
}

// Smooth Scrolling
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const offset = 80; // Nav height
          const targetPosition = target.offsetTop - offset;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// Code Copy Functionality
class CodeCopyManager {
  constructor() {
    this.init();
  }

  init() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
      button.addEventListener('click', () => this.copyCode(button));
    });
  }

  async copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code');
    const text = code.textContent;

    try {
      await navigator.clipboard.writeText(text);
      this.showFeedback(button, true);
    } catch (err) {
      this.showFeedback(button, false);
    }
  }

  showFeedback(button, success) {
    const originalHTML = button.innerHTML;

    if (success) {
      button.innerHTML = '<i data-lucide="check"></i>';
      button.style.backgroundColor = 'var(--color-success)';
      button.style.borderColor = 'var(--color-success)';
    } else {
      button.innerHTML = '<i data-lucide="x"></i>';
      button.style.backgroundColor = 'var(--color-error)';
      button.style.borderColor = 'var(--color-error)';
    }

    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.backgroundColor = '';
      button.style.borderColor = '';

      // Re-initialize icons again
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 2000);
  }
}

// Intersection Observer for Animations
class AnimationObserver {
  constructor() {
    this.init();
  }

  init() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    }, options);

    // Observe elements
    const elements = document.querySelectorAll('.feature-card, .doc-card, .step, .stat-item');
    elements.forEach(el => observer.observe(el));
  }
}

// Utility Functions
const utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Live Demo Animation Manager
class LiveDemoManager {
  constructor() {
    this.demoSection = document.getElementById('demo');
    this.init();
  }

  init() {
    if (!this.demoSection) return;

    // Set up intersection observer for demo section
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.startAnimation();
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });

    observer.observe(this.demoSection);
  }

  startAnimation() {
    // Animation is handled by CSS keyframes
    // This method can be extended for more complex interactions
    console.log('Live demo animation started');
  }

  // Optional: Add method to restart animation on user interaction
  restartAnimation() {
    const chatMessages = document.querySelectorAll('.chat-message');
    const docElements = document.querySelectorAll('.doc-title, .doc-heading, .doc-list');

    // Remove animation classes
    chatMessages.forEach(msg => {
      msg.style.animation = 'none';
    });

    docElements.forEach(el => {
      el.style.animation = 'none';
    });

    // Trigger reflow
    void document.body.offsetWidth;

    // Re-add animations
    chatMessages.forEach((msg, index) => {
      msg.style.animation = '';
    });

    docElements.forEach(el => {
      el.style.animation = '';
    });
  }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Initialize Mermaid diagrams
  if (typeof mermaid !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme !== null ? savedTheme : 'dark';
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: theme === 'dark' ? '#f8fafc' : '#1e293b',
        primaryBorderColor: '#3b82f6',
        lineColor: '#8b5cf6',
        secondaryColor: '#8b5cf6',
        tertiaryColor: '#10b981',
        background: theme === 'dark' ? '#1e293b' : '#f8fafc',
        mainBkg: theme === 'dark' ? '#1e293b' : '#f8fafc',
        secondBkg: theme === 'dark' ? '#334155' : '#f1f5f9',
        tertiaryBkg: theme === 'dark' ? '#0f172a' : '#ffffff'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10
      }
    });
    // Ensure diagrams render after DOM ready and init
    requestAnimationFrame(() => {
      const mermaidDivs = document.querySelectorAll('.mermaid');
      mermaidDivs.forEach((div) => {
        const code = div.textContent;
        div.innerHTML = code;
        div.removeAttribute('data-processed');
      });
      mermaid.run().catch((e) => console.error('Mermaid run error (initial):', e));
    });
  }

  // Initialize all managers
  try {
    new ThemeManager();
    new NavigationManager();
    new SmoothScroll();
    new CodeCopyManager();
    new AnimationObserver();
    new LiveDemoManager();
  } catch (error) {
    console.error('Error initializing:', error);
  }

  // Add loaded class to body for any CSS transitions
  document.body.classList.add('loaded');
});

// Handle window resize
window.addEventListener('resize', utils.debounce(() => {
  // Handle any resize-specific logic here
  console.log('Window resized');
}, 250));

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Page hidden');
  } else {
    console.log('Page visible');
  }
});

// Export for potential external use
window.LLM2Docs = {
  utils
};
