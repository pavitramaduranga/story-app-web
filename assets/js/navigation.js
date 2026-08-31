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

  function getVisibleText(link) {
    return (link.textContent || link.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeStore(store) {
    if (store === 'app-store' || store === 'app_store') return 'app_store';
    if (store === 'google-play' || store === 'google_play') return 'google_play';
    return store || 'unknown';
  }

  function inferStore(link) {
    const href = link.href || '';
    if (href.includes('apps.apple.com')) return 'app_store';
    if (href.includes('play.google.com/store')) return 'google_play';
    return normalizeStore(link.getAttribute('data-store-link'));
  }

  function getPageLocation(link) {
    if (link.closest('footer')) return 'footer';
    if (link.closest('nav')) return 'navigation';

    const path = window.location.pathname.replace(/\/$/, '');
    if (!path || path === '/index.html') return 'homepage';
    if (path.endsWith('/app-links.html')) return 'app_links_page';
    if (path.endsWith('/early-bird-signup.html')) return 'early_bird_page';
    if (path === '/blogs.html' || path.startsWith('/blog') || path.includes('/blog-')) return 'blog';
    return 'site';
  }

  function getTrackedClick(link) {
    const href = link.href || '';
    const url = new URL(href, window.location.href);
    const linkText = getVisibleText(link);
    const baseParams = {
      link_location: getPageLocation(link),
      link_text: linkText,
      outbound_url: url.href
    };

    if (url.hostname === 'apps.apple.com' || url.hostname === 'play.google.com') {
      return {
        name: 'app_link_click',
        params: {
          ...baseParams,
          app_store: inferStore(link)
        }
      };
    }

    if (url.protocol === 'mailto:' && url.pathname.toLowerCase() === 'hello@baboostories.com') {
      return {
        name: 'contact_click',
        params: baseParams
      };
    }

    if (url.pathname.endsWith('/early-bird-signup.html')) {
      return {
        name: 'early_bird_signup_click',
        params: baseParams
      };
    }

    return null;
  }

  function shouldLetBrowserHandleClick(event, link) {
    return (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target.toLowerCase() === '_blank' ||
      link.hasAttribute('download')
    );
  }

  function trackClickIntent(event) {
    if (!event.target || typeof event.target.closest !== 'function') return;

    const link = event.target.closest('a[href]');
    if (!link || typeof window.gtag !== 'function') return;

    const trackedClick = getTrackedClick(link);
    if (!trackedClick) return;

    const shouldDelayNavigation = !shouldLetBrowserHandleClick(event, link);
    const params = {
      ...trackedClick.params,
      transport_type: 'beacon'
    };

    if (!shouldDelayNavigation) {
      window.gtag('event', trackedClick.name, params);
      return;
    }

    event.preventDefault();

    let navigationStarted = false;
    const continueNavigation = () => {
      if (navigationStarted) return;
      navigationStarted = true;
      window.location.href = link.href;
    };

    window.gtag('event', trackedClick.name, {
      ...params,
      event_callback: continueNavigation,
      event_timeout: 800
    });

    window.setTimeout(continueNavigation, 900);
  }

  function initializeIntentTracking() {
    document.addEventListener('click', trackClickIntent);
  }

  function initializePage() {
    document.querySelectorAll('.nav-toggle').forEach(initializeNavigation);
    ensureAnalyticsLoaded();
    initializeIntentTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }
})();
