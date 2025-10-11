(function () {
  const GA_MEASUREMENT_ID = 'G-2EPC3F3Z6X';

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
      if (window.innerWidth > 720) {
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

  function initializePage() {
    document.querySelectorAll('.nav-toggle').forEach(initializeNavigation);
    ensureAnalyticsLoaded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }
})();
