// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

// Theme Management
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }

  init() {
    this.setTheme(this.currentTheme);
    this.bindEvents();
  }

  setTheme(theme) {
    html.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.updateThemeToggle();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  updateThemeToggle() {
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (this.currentTheme === 'dark') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    }
  }

  bindEvents() {
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }
}

// Navigation Management
class NavigationManager {
  constructor() {
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleScroll();
  }

  bindEvents() {
    if (navToggle) {
      navToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Handle scroll for navbar
    window.addEventListener('scroll', () => this.handleScroll());
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    navMenu.classList.toggle('active', this.isMenuOpen);
    navToggle.classList.toggle('active', this.isMenuOpen);
  }

  closeMenu() {
    this.isMenuOpen = false;
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  }

  handleScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}

// Animation Manager
class AnimationManager {
  constructor() {
    this.init();
  }

  init() {
    this.initAOS();
    this.bindScrollAnimations();
    this.initParallax();
  }

  initAOS() {
    // Initialize AOS (Animate On Scroll) if available
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    }
  }

  bindScrollAnimations() {
    // Custom scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .example-card, .doc-card, .step');
    animateElements.forEach(el => observer.observe(el));
  }

  initParallax() {
    // Parallax effect for floating shapes
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      shapes.forEach((shape, index) => {
        const speed = 0.1 + (index * 0.05);
        shape.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
      });
    });
  }
}

// Code Copy Functionality
class CodeManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindCopyButtons();
  }

  bindCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code');
        const text = code.textContent;
        
        this.copyToClipboard(text);
        this.showCopyFeedback(button);
      });
    });
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  showCopyFeedback(button) {
    const originalIcon = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.style.background = 'var(--accent-success)';
    button.style.color = 'white';
    
    setTimeout(() => {
      button.innerHTML = originalIcon;
      button.style.background = '';
      button.style.color = '';
    }, 2000);
  }
}

// Smooth Scrolling
class SmoothScrollManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindSmoothScroll();
  }

  bindSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

// Typing Animation
class TypingAnimation {
  constructor() {
    this.init();
  }

  init() {
    this.animateTerminalLines();
  }

  animateTerminalLines() {
    const terminalLines = document.querySelectorAll('.terminal-line .command');
    terminalLines.forEach((line, index) => {
      const text = line.textContent;
      line.textContent = '';
      line.style.opacity = '0';
      
      setTimeout(() => {
        this.typeText(line, text, 50);
        line.style.opacity = '1';
      }, index * 2000);
    });
  }

  typeText(element, text, speed) {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  }
}

// Performance Optimizer
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.optimizeImages();
    this.debounceScroll();
  }

  optimizeImages() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  debounceScroll() {
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
      if (scrollTimer !== null) {
        clearTimeout(scrollTimer);
      }
      scrollTimer = setTimeout(() => {
        // Scroll-based optimizations
        this.handleScrollOptimizations();
      }, 10);
    });
  }

  handleScrollOptimizations() {
    // Optimize animations based on scroll position
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    
    if (scrolled > 1000) {
      shapes.forEach(shape => {
        shape.style.animationPlayState = 'paused';
      });
    } else {
      shapes.forEach(shape => {
        shape.style.animationPlayState = 'running';
      });
    }
  }
}

// Utility Functions
const utils = {
  // Throttle function for performance
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Debounce function for performance
  debounce(func, wait, immediate) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  },

  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Get random number between min and max
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// Global copy function for code blocks
function copyCode(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
      // Show feedback
      const button = element.closest('.code-block').querySelector('.copy-btn');
      if (button) {
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = 'var(--accent-success)';
        button.style.color = 'white';
        
        setTimeout(() => {
          button.innerHTML = originalIcon;
          button.style.background = '';
          button.style.color = '';
        }, 2000);
      }
    });
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all managers
  new ThemeManager();
  new NavigationManager();
  new AnimationManager();
  new CodeManager();
  new SmoothScrollManager();
  new TypingAnimation();
  new PerformanceOptimizer();

  // Add loading animation
  document.body.classList.add('loaded');

  // Initialize any additional features
  console.log('LLM2Docs website initialized successfully!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when page is not visible
    document.querySelectorAll('.shape').forEach(shape => {
      shape.style.animationPlayState = 'paused';
    });
  } else {
    // Resume animations when page becomes visible
    document.querySelectorAll('.shape').forEach(shape => {
      shape.style.animationPlayState = 'running';
    });
  }
});

// Handle window resize
window.addEventListener('resize', utils.debounce(() => {
  // Recalculate animations on resize
  if (typeof AOS !== 'undefined') {
    AOS.refresh();
  }
}, 250));

// Export for potential external use
window.LLM2Docs = {
  utils,
  copyCode
};