(function () {
  const GA_MEASUREMENT_ID = 'G-YS5KX79KBQ';

  function initializeNavigation(navToggle) {
    const navBar = navToggle.closest('nav');
    if (!navBar) return;
    const navLinks = navBar.querySelector('.nav-links');
    if (!navLinks) return;

    function closeNav() {
      navLinks.setAttribute('data-visible', 'false');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.getAttribute('data-visible') === 'true';
      const nextState = String(!isOpen);
      navLinks.setAttribute('data-visible', nextState);
      navToggle.setAttribute('aria-expanded', nextState);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1080) {
        closeNav();
      }
    });
  }

  function ensureAnalyticsLoaded() {
    if (!GA_MEASUREMENT_ID || window.__gaInitialized) {
      return;
    }

    window.__gaInitialized = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  function initializeStoreLinkTracking() {
    document.querySelectorAll('[data-store-link], a[href*="apps.apple.com"], a[href*="play.google.com/store"]').forEach((link) => {
      link.addEventListener('click', () => {
        if (typeof window.gtag !== 'function') return;
        const href = link.href || '';
        const inferredStore = href.includes('apps.apple.com')
          ? 'app-store'
          : href.includes('play.google.com/store')
            ? 'google-play'
            : null;

        window.gtag('event', 'app_store_click', {
          store: link.getAttribute('data-store-link') || inferredStore,
          link_url: href,
          page_path: window.location.pathname
        });
      });
    });
  }

  function initializePage() {
    document.querySelectorAll('.nav-toggle').forEach(initializeNavigation);
    ensureAnalyticsLoaded();
    initializeStoreLinkTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }
})();
