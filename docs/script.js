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
      const sunIcon = themeToggle.querySelector('[data-lucide="sun"]');
      const moonIcon = themeToggle.querySelector('[data-lucide="moon"]');
      
      if (sunIcon && moonIcon) {
        if (this.currentTheme === 'dark') {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
        } else {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
        }
        
        // Re-initialize Lucide icons after theme change
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      } else {
        // Fallback: use text content
        themeToggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
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

// GitHub Star Functionality
class GitHubStarManager {
  constructor() {
    this.starCount = 0;
    this.init();
  }

  init() {
    this.fetchStarCount();
    this.bindEvents();
  }

  async fetchStarCount() {
    try {
      const response = await fetch('https://api.github.com/repos/NoManNayeem/google-docs-mcp-server');
      const data = await response.json();
      this.starCount = data.stargazers_count || 0;
      this.updateStarCount();
    } catch (error) {
      console.log('Could not fetch star count:', error);
      this.starCount = 0;
    }
  }

  updateStarCount() {
    const starCountElement = document.getElementById('star-count');
    if (starCountElement) {
      starCountElement.textContent = this.starCount;
    }
  }

  bindEvents() {
    const starButton = document.querySelector('.github-star-btn');
    if (starButton) {
      starButton.addEventListener('click', () => this.starRepository());
    }
  }

  starRepository() {
    // Open GitHub repository in new tab
    window.open('https://github.com/NoManNayeem/google-docs-mcp-server', '_blank');
    
    // Animate the star button
    const starButton = document.querySelector('.github-star-btn');
    if (starButton) {
      starButton.style.transform = 'scale(1.1)';
      setTimeout(() => {
        starButton.style.transform = 'scale(1)';
      }, 200);
    }
  }
}

// Chat Animation Manager
class ChatAnimationManager {
  constructor() {
    this.init();
  }

  init() {
    this.animateChatMessages();
  }

  animateChatMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach((message, index) => {
      // Set initial state
      message.style.opacity = '0';
      message.style.transform = 'translateY(20px)';
      
      // Animate in sequence
      setTimeout(() => {
        message.style.transition = 'all 0.5s ease-out';
        message.style.opacity = '1';
        message.style.transform = 'translateY(0)';
      }, index * 1000);
    });

    // Animate typing indicator
    setTimeout(() => {
      const typingIndicator = document.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.style.display = 'flex';
      }
    }, 2000);

    // Hide typing indicator and show final message
    setTimeout(() => {
      const typingIndicator = document.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.style.display = 'none';
      }
    }, 4000);
  }
}

// Enhanced Animation Manager
class EnhancedAnimationManager extends AnimationManager {
  init() {
    super.init();
    this.initScrollAnimations();
    this.initDiagramAnimations();
  }

  initScrollAnimations() {
    // Enhanced scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Trigger specific animations for different elements
          if (entry.target.classList.contains('flow-diagram')) {
            this.animateFlowDiagram(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const animateElements = document.querySelectorAll('.feature-card, .example-card, .doc-card, .step, .flow-diagram');
    animateElements.forEach(el => observer.observe(el));
  }

  animateFlowDiagram(diagram) {
    // Animate data flow diagrams
    const arrows = diagram.querySelectorAll('.arrow, .lifecycle-arrow, .workflow-arrow, .security-arrow, .collab-line');
    arrows.forEach((arrow, index) => {
      setTimeout(() => {
        arrow.style.animationPlayState = 'running';
      }, index * 200);
    });

    // Animate system components
    const systems = diagram.querySelectorAll('.system, .lifecycle-step, .workflow-step, .security-step, .agent');
    systems.forEach((system, index) => {
      setTimeout(() => {
        system.style.animationPlayState = 'running';
      }, index * 300);
    });
  }

  initDiagramAnimations() {
    // Initialize diagram-specific animations
    const diagrams = document.querySelectorAll('.flow-diagram');
    diagrams.forEach(diagram => {
      this.setupDiagramInteractivity(diagram);
    });
  }

  setupDiagramInteractivity(diagram) {
    // Add hover effects and interactive animations
    const interactiveElements = diagram.querySelectorAll('.system, .lifecycle-step, .workflow-step, .security-step, .agent');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'scale(1.1)';
        element.style.zIndex = '10';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1)';
        element.style.zIndex = '1';
      });
    });
  }
}

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

// Global star function
function starRepository() {
  window.open('https://github.com/NoManNayeem/google-docs-mcp-server', '_blank');
}

// Mermaid Diagrams Manager
class MermaidManager {
  constructor() {
    this.init();
  }

  init() {
    // Initialize Mermaid with theme configuration
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        themeVariables: {
          primaryColor: 'var(--accent-primary)',
          primaryTextColor: 'var(--text-primary)',
          primaryBorderColor: 'var(--border-color)',
          lineColor: 'var(--accent-primary)',
          secondaryColor: 'var(--bg-secondary)',
          tertiaryColor: 'var(--bg-tertiary)',
          background: 'var(--bg-primary)',
          mainBkg: 'var(--bg-primary)',
          secondBkg: 'var(--bg-secondary)',
          tertiaryBkg: 'var(--bg-tertiary)'
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        }
      });
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons with retry mechanism
  const initLucideIcons = () => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
      console.log('Lucide icons initialized successfully');
    } else {
      console.warn('Lucide icons not loaded, retrying...');
      setTimeout(initLucideIcons, 100);
    }
  };
  
  initLucideIcons();

  // Initialize all managers with error handling
  try {
    new ThemeManager();
    new NavigationManager();
    new EnhancedAnimationManager();
    new CodeManager();
    new SmoothScrollManager();
    new TypingAnimation();
    new PerformanceOptimizer();
    new GitHubStarManager();
    new ChatAnimationManager();
    new MermaidManager();
  } catch (error) {
    console.error('Error initializing managers:', error);
  }

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