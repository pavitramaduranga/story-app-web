(function () {
  const GA_MEASUREMENT_ID = 'G-YS5KX79KBQ';

  function canonicalizeIndexUrl() {
    const path = window.location.pathname;
    if (!path.endsWith('/index.html')) return;

    const cleanPath = path.slice(0, -'index.html'.length) || '/';
    window.location.replace(`${cleanPath}${window.location.search}${window.location.hash}`);
  }

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

    navBar.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
        navToggle.focus();
      }
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
    return (link.textContent || '').replace(/\s+/g, ' ').trim() ||
      (link.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
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

  function getTrackingAttribute(link, attribute) {
    const element = link.closest(`[${attribute}]`);
    return element?.getAttribute(attribute)?.trim() || '';
  }

  function getContentType(path) {
    if (path === '/' || path === '/index.html') return 'homepage';
    if (path === '/app-links.html') return 'download_page';
    if (path === '/blogs.html') return 'blog_hub';
    if (path.startsWith('/blog/')) {
      if (/bedtime-stories-for-[2-5]-year-olds|bedtime-stories-by-age/.test(path)) return 'age_hub';
      if (/best-bedtime-story-app/.test(path)) return 'comparison';
      return 'blog';
    }
    if (path.startsWith('/blog-')) return /3-year-olds/.test(path) ? 'age_hub' : 'blog';
    return 'page';
  }

  function getCtaLocation(link) {
    return link.getAttribute('data-cta-placement') ||
      getTrackingAttribute(link, 'data-cta-placement') ||
      (link.closest('footer') ? 'footer' : link.closest('nav') ? 'navigation' : 'content');
  }

  function getCtaId(link, platform = 'app') {
    const suppliedId = link.getAttribute('data-cta-id') || getTrackingAttribute(link, 'data-cta-id');
    if (suppliedId) return suppliedId;
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const slug = path.split('/').filter(Boolean).pop()?.replace(/\.html$/, '') || 'home';
    return `${slug}_${getCtaLocation(link)}_${platform}`.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  }

  function isPromotionalAppCta(link) {
    return link.hasAttribute('data-app-cta') ||
      link.hasAttribute('data-cta-placement') ||
      Boolean(link.closest('[data-cta-placement]')) ||
      link.classList.contains('nav-download-link');
  }

  function getCampaignParams() {
    const currentParams = new URLSearchParams(window.location.search);
    const campaignParams = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((name) => {
      const value = currentParams.get(name);
      if (value) campaignParams[name] = value;
    });

    if (!campaignParams.utm_source && /(^|\.)pinterest\./i.test(document.referrer)) {
      campaignParams.utm_source = 'pinterest';
      campaignParams.utm_medium = 'social';
      campaignParams.utm_campaign = 'pinterest_sales_funnel';
    }

    return campaignParams;
  }

  function getCampaignEventParams() {
    const campaignParams = getCampaignParams();
    return Object.fromEntries(
      Object.entries(campaignParams).map(([name, value]) => [
        name.replace(/^utm_/, 'campaign_'),
        value
      ])
    );
  }

  function withCampaignParams(href, fallbackParams = {}) {
    const url = new URL(href, window.location.href);
    const campaignParams = {
      ...fallbackParams,
      ...getCampaignParams()
    };

    Object.entries(campaignParams).forEach(([name, value]) => {
      if (value && !url.searchParams.has(name)) {
        url.searchParams.set(name, value);
      }
    });

    return url.href;
  }

  function getTrackedClick(link) {
    const href = link.href || '';
    const url = new URL(href, window.location.href);
    const sourcePage = window.location.pathname || '/';
    const ctaLocation = getCtaLocation(link);
    const baseParams = {
      link_location: getPageLocation(link),
      cta_placement: ctaLocation,
      link_text: getVisibleText(link),
      outbound_url: url.href,
      ...getCampaignEventParams()
    };

    ['content_slug', 'content_topic', 'cta_variant'].forEach((name) => {
      const value = getTrackingAttribute(link, `data-${name.replaceAll('_', '-')}`);
      if (value) baseParams[name] = value;
    });

    if (url.hostname === 'apps.apple.com' || url.hostname === 'play.google.com') {
      const platform = inferStore(link) === 'app_store' ? 'ios' : 'android';
      return {
        name: 'app_store_click',
        params: {
          platform,
          source_page: sourcePage,
          cta_id: getCtaId(link, platform),
          cta_location: ctaLocation,
          content_type: getContentType(sourcePage),
          destination: platform === 'ios' ? 'app_store' : 'google_play'
        }
      };
    }

    if (url.protocol === 'mailto:' && url.pathname.toLowerCase() === 'hello@baboostories.com') {
      return {
        name: 'contact_click',
        params: baseParams
      };
    }

    if (url.origin === window.location.origin && url.pathname.endsWith('/early-bird-signup.html')) {
      return {
        name: 'early_bird_signup_click',
        params: baseParams
      };
    }

    if (url.origin === window.location.origin && url.pathname.endsWith('/app-links.html') && isPromotionalAppCta(link)) {
      return {
        name: 'app_cta_click',
        params: {
          source_page: sourcePage,
          cta_id: getCtaId(link),
          cta_location: ctaLocation,
          destination: '/app-links.html',
          content_type: getContentType(sourcePage)
        }
      };
    }

    if (link.hasAttribute('data-engagement-link') || url.hash) {
      return {
        name: 'homepage_engagement_click',
        params: {
          ...baseParams,
          engagement_target: link.getAttribute('data-engagement-link') || url.hash.replace('#', '')
        }
      };
    }

    return null;
  }

  function trackClickIntent(event) {
    if (!event.target || typeof event.target.closest !== 'function') return;

    const link = event.target.closest('a[href]');
    if (!link || typeof window.gtag !== 'function') return;

    const trackedClick = getTrackedClick(link);
    if (!trackedClick) return;

    window.gtag('event', trackedClick.name, {
      ...trackedClick.params,
      transport_type: 'beacon'
    });
  }

  function initializeIntentTracking() {
    document.addEventListener('click', trackClickIntent);
  }

  function initializeFaqTracking() {
    document.querySelectorAll('.faq-list details').forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open || typeof window.gtag !== 'function') return;

        const summary = details.querySelector('summary');
        window.gtag('event', 'faq_opened', {
          faq_question: (summary?.textContent || '').replace(/\s+/g, ' ').trim(),
          link_location: getPageLocation(details),
          cta_placement: 'faq'
        });
      });
    });
  }

  function initializeCampaignLinkDecoration() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const url = new URL(link.href, window.location.href);

      if (url.hostname === 'apps.apple.com' || url.hostname === 'play.google.com') {
        link.href = withCampaignParams(url.href);
      }

      if (/^(.+\.)?pinterest\.com$/i.test(url.hostname)) {
        link.href = withCampaignParams(url.href, {
          utm_source: 'baboo_stories',
          utm_medium: 'website',
          utm_campaign: 'pinterest_profile'
        });
      }
    });
  }

  function initializeFooterYear() {
    document.querySelectorAll('#year, #current-year').forEach((yearElement) => {
      yearElement.textContent = new Date().getFullYear();
    });
  }

  function initializePage() {
    document.querySelectorAll('.nav-toggle').forEach(initializeNavigation);
    initializeFooterYear();
    ensureAnalyticsLoaded();
    initializeCampaignLinkDecoration();
    initializeIntentTracking();
    initializeFaqTracking();
  }

  canonicalizeIndexUrl();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
  } else {
    initializePage();
  }
})();
