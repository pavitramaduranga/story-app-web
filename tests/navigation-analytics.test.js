const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'navigation.js'), 'utf8');

function makeLink({ href, classes = [], attrs = {}, ancestors = {} }) {
  const ancestorBySelector = {
    '[data-cta-placement]': ancestors.ctaPlacement,
    '[data-cta-id]': ancestors.ctaId,
    '[data-content-slug]': ancestors.contentSlug,
    '[data-content-topic]': ancestors.contentTopic,
    '[data-cta-variant]': ancestors.ctaVariant,
    '.direct-path-card': ancestors.directPath,
    '.article-callout': ancestors.articleCallout,
    '.article-cta, .app-download-cta': ancestors.articleCta,
    '.article-cta, .article-app-discovery, .app-download-cta': ancestors.promoContainer,
    footer: ancestors.footer,
    nav: ancestors.nav
  };

  return {
    href,
    target: '',
    classList: { contains: (name) => classes.includes(name) },
    hasAttribute: (name) => Object.prototype.hasOwnProperty.call(attrs, name),
    getAttribute: (name) => Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null,
    closest(selector) {
      if (selector === 'a[href]') return this;
      return ancestorBySelector[selector] || null;
    }
  };
}

function runClick({ pathname, link, nestedTarget = false }) {
  const calls = [];
  const listeners = {};
  const window = {
    __gaInitialized: true,
    gtag: (...args) => calls.push(args),
    location: {
      pathname,
      search: '',
      hash: '',
      origin: 'https://baboostories.com',
      href: `https://baboostories.com${pathname}`,
      replace() {}
    },
    addEventListener() {},
    setTimeout() {},
    innerWidth: 1280
  };
  const document = {
    readyState: 'complete',
    referrer: '',
    head: { appendChild() {} },
    addEventListener(name, callback) {
      if (!listeners[name]) listeners[name] = [];
      listeners[name].push(callback);
    },
    querySelectorAll: () => []
  };

  vm.runInNewContext(source, { window, document, URL, Date, URLSearchParams });
  assert.equal(listeners.click?.length, 1, 'exactly one delegated click handler should be installed');

  let preventDefaultCalls = 0;
  const clickEvent = {
    target: nestedTarget ? {
      closest: (selector) => selector === 'a[href]' ? link : null
    } : link,
    preventDefault() { preventDefaultCalls += 1; }
  };
  listeners.click.forEach((listener) => listener(clickEvent));

  return {
    events: calls.filter(([kind]) => kind === 'event').map(([, name, params]) => ({
      name,
      params: JSON.parse(JSON.stringify(params))
    })),
    preventDefaultCalls
  };
}

test('homepage Download free CTA emits one app_cta_click with the expected fields', () => {
  const link = makeLink({
    href: 'https://baboostories.com/app-links.html',
    classes: ['btn', 'btn-primary'],
    attrs: { 'data-engagement-link': 'direct_bedtime_download' },
    ancestors: { directPath: {} }
  });
  const { events, preventDefaultCalls } = runClick({ pathname: '/', link, nestedTarget: true });

  assert.deepEqual(events, [{
    name: 'app_cta_click',
    params: {
      source_page: '/',
      cta_id: 'home_direct_path_app',
      cta_location: 'direct_path',
      destination: '/app-links.html',
      content_type: 'homepage',
      transport_type: 'beacon'
    }
  }]);
  assert.equal(preventDefaultCalls, 0, 'analytics must not block navigation');
});

test('age hub promotional button is classified separately from age-specific articles', () => {
  const hubLink = makeLink({
    href: 'https://baboostories.com/app-links.html',
    classes: ['btn', 'btn-secondary'],
    ancestors: { articleCallout: {} }
  });
  const hubResult = runClick({ pathname: '/blog/bedtime-stories-by-age/', link: hubLink });
  assert.equal(hubResult.events[0].name, 'app_cta_click');
  assert.equal(hubResult.events[0].params.content_type, 'age_hub');
  assert.equal(hubResult.events[0].params.cta_location, 'article_callout');

  const ageArticlePaths = [
    '/blog/bedtime-stories-for-2-year-olds/',
    '/blog-bedtime-stories-for-3-year-olds.html',
    '/blog/bedtime-stories-for-4-year-olds/',
    '/blog/bedtime-stories-for-5-year-olds/'
  ];
  for (const pathname of ageArticlePaths) {
    const result = runClick({ pathname, link: hubLink });
    assert.equal(result.events[0].params.content_type, 'age_article', pathname);
  }
});

test('article CTA button is tracked, while an unmarked editorial link is not', () => {
  const articleCta = makeLink({
    href: 'https://baboostories.com/app-links.html',
    classes: ['btn', 'btn-secondary'],
    ancestors: { articleCallout: {} }
  });
  const ctaResult = runClick({ pathname: '/blog/bedtime-routines/', link: articleCta });
  assert.equal(ctaResult.events.length, 1);
  assert.equal(ctaResult.events[0].name, 'app_cta_click');
  assert.equal(ctaResult.events[0].params.content_type, 'blog');

  const editorialLink = makeLink({ href: 'https://baboostories.com/app-links.html' });
  const editorialResult = runClick({ pathname: '/blog/bedtime-routines/', link: editorialLink });
  assert.deepEqual(editorialResult.events, []);
});

test('store links emit one app_store_click with platform-specific parameters', () => {
  const cases = [
    ['https://apps.apple.com/us/app/baboo-stories/id6795747764', 'ios', 'app_store'],
    ['https://play.google.com/store/apps/details?id=baboo.stories', 'android', 'google_play']
  ];

  for (const [href, platform, destination] of cases) {
    const link = makeLink({ href, classes: ['store-badge-link'], attrs: { 'data-cta-placement': 'closing' } });
    const { events, preventDefaultCalls } = runClick({ pathname: '/blog/bedtime-routines/', link });
    assert.deepEqual(events, [{
      name: 'app_store_click',
      params: {
        platform,
        source_page: '/blog/bedtime-routines/',
        cta_id: `bedtime_routines_closing_${platform}`,
        cta_location: 'closing',
        content_type: 'blog',
        destination,
        transport_type: 'beacon'
      }
    }]);
    assert.equal(preventDefaultCalls, 0);
  }
});

test('one user click produces one app event and no retired duplicate event names', () => {
  const link = makeLink({
    href: 'https://baboostories.com/app-links.html',
    classes: ['btn'],
    attrs: { 'data-app-cta': '' }
  });
  const { events } = runClick({ pathname: '/blog/bedtime-routines/', link, nestedTarget: true });
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'app_cta_click');
  assert.equal(events.some(({ name }) => ['app_download_intent', 'app_download_click', 'google_play_click'].includes(name)), false);
});
