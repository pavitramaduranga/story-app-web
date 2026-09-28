# Baboo Stories website

Static marketing and article site for [Baboo Stories](https://baboostories.com/),
hosted with GitHub Pages. The Baboo Stories mobile app is available on iOS and
Android. It is free to download; some stories are locked, and an optional
monthly subscription unlocks all stories.

Baboo is a parent-led reading app: an adult reads story text from a phone to a
child. The product does not provide audio stories or automatic narration.

## Site structure

- `index.html` — marketing homepage
- `app-links.html` — official App Store and Google Play links
- `blogs.html` — article hub
- `blog/<article-slug>/index.html` — preferred article layout
- `sitemap.xml` and `robots.txt` — search discovery files
- `assets/css/style.css` — shared styles
- `assets/js/navigation.js` — navigation, canonical URL cleanup, GA4 loading,
  and site-wide click tracking
- `assets/js/early-bird-form.js` — free-story/update form
- `SITE_CORE_CONCEPTS.md` — durable product and editorial truth
- `SEO_CHECKLIST.md` — technical SEO and publishing checks

Seven older articles still use root-level `blog-*.html` URLs. Preserve their
established canonicals unless a separately reviewed migration is planned. New
articles should use the folder-based layout.

## Local preview

Serve the repository through a local HTTP server instead of opening HTML files
directly. From the repository root, for example:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/`. GA4 reporting is configured to exclude
`localhost` and `127.0.0.1` in the analytics helper, but avoid treating local
traffic as production evidence.

## App downloads and premium access

Keep the official store links centralized through `app-links.html` and the
shared store URLs already used by the site. Product copy may say:

- the app is available on iOS and Android;
- the app is free to download;
- some stories are locked; and
- an optional monthly subscription unlocks all stories.

Do not invent a subscription price. Check `SITE_CORE_CONCEPTS.md` before
changing product claims.

## Website analytics

`assets/js/navigation.js` loads GA4 measurement ID `G-YS5KX79KBQ` on every HTML
page and records these click events:

- `app_store_click`
- `google_play_click`
- `contact_click`
- `early_bird_signup_click`

`assets/js/early-bird-form.js` records `early_bird_signup` after a successful
form submission. The reporting helper and GA4/Search Console instructions are
in `C:\Users\Pavitra\Documents\Lab\App\MCP`.

Code presence proves instrumentation is installed, but does not prove that GA4
is receiving data or that an event is configured as a key event. Verify those
conditions in GA4 reports and Admin before reporting conversions.

## Early-bird Firestore integration

The free-story/update form writes new documents to the `earlyBirdSignups`
Firestore collection. It sends `name`, `email`, `childrenAges`, `expectations`,
`referralSource`, `userAgent`, and `createdAt`.

Files involved:

- `assets/js/firebase-config.js` — Firebase web-app configuration
- `assets/js/firebase-config.example.js` — configuration template
- `assets/js/early-bird-form.js` — Firebase initialization and form submission

### Firebase web configuration and secrets

Firebase web configuration is shipped to visitors' browsers and is therefore
public configuration. Values such as `apiKey`, `authDomain`, `projectId`, and
`appId` do not authorize database access by themselves. Firestore Security
Rules and, where enabled, Firebase App Check protect the data.

Service-account JSON files, private keys, refresh tokens, and OAuth client
secrets are credentials. Never place them in this repository, browser code, or
Git history. Store them in a protected local credentials directory or a secret
manager used by the relevant server-side tool.

### Firebase setup

1. Select the intended Firebase project and register a web app.
2. Enable Firestore in production mode.
3. Copy the Firebase web-app values into `assets/js/firebase-config.js`.
4. Create and deploy narrowly scoped Firestore Security Rules.
5. Enable and enforce Firebase App Check for Firestore if public browser writes
   remain enabled.
6. Test one valid submission, a malformed submission, and attempts to read,
   update, and delete signup records.

The public form needs create-only access. Do not use an expiry date as the main
security control, and do not grant public read, update, or delete access. A rule
can validate the exact fields, types, lengths, and server timestamp:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /earlyBirdSignups/{signupId} {
      allow create: if
        request.resource.data.keys().hasOnly([
          'name', 'email', 'childrenAges', 'expectations',
          'referralSource', 'userAgent', 'createdAt'
        ]) &&
        request.resource.data.keys().hasAll([
          'name', 'email', 'childrenAges', 'expectations',
          'referralSource', 'userAgent', 'createdAt'
        ]) &&
        request.resource.data.name is string &&
        request.resource.data.name.size() <= 100 &&
        request.resource.data.email is string &&
        request.resource.data.email.size() >= 3 &&
        request.resource.data.email.size() <= 254 &&
        request.resource.data.childrenAges is string &&
        request.resource.data.childrenAges.size() <= 100 &&
        request.resource.data.expectations is string &&
        request.resource.data.expectations.size() <= 1000 &&
        request.resource.data.referralSource is string &&
        request.resource.data.referralSource.size() <= 100 &&
        request.resource.data.userAgent is string &&
        request.resource.data.userAgent.size() <= 1000 &&
        request.resource.data.createdAt == request.time;

      allow read, update, delete: if false;
    }
  }
}
```

This rule limits document shape and access; it is not complete bot protection.
Use App Check, monitoring, and abuse controls appropriate to the traffic level.
Test deployed rules with the Firebase Emulator Suite or Rules Playground before
relying on them.

## Article workflow

Read `C:\Users\Pavitra\Documents\Lab\App\MCP\ARTICLE_WORKFLOW.md` and use the
local `baboo-articles` skill before adding or substantially changing an
article.

For each new folder-based article:

1. Search for overlapping intent and decide whether to add, expand, or
   consolidate content.
2. Create `blog/<article-slug>/index.html`.
3. Use `https://baboostories.com/blog/<article-slug>/` as the canonical URL.
4. Add the article card to `blogs.html`.
5. Add the clean trailing-slash URL to `sitemap.xml`.
6. Add two to four natural contextual links from related articles.
7. Validate metadata, JSON-LD, and local asset paths.

Do not link to an article's `/index.html` URL.

## SEO checks before deployment

Run the full checklist in `SEO_CHECKLIST.md`. At minimum, verify:

- `node scripts/validate-seo.mjs` passes or any reported oversized image files
  are intentionally excluded from live SEO pages;
- each indexable page has one self-referencing canonical;
- canonical, `og:url`, and structured-data `mainEntityOfPage` agree;
- `blogs.html` links to every intended article;
- `sitemap.xml` contains only intended canonical URLs;
- internal links do not contain `/index.html`;
- JSON-LD parses;
- local CSS, JavaScript, and image references resolve; and
- `git diff --check` passes.

## Deployment

The repository remote is `https://github.com/pavitramaduranga/story-app-web.git`
and the site is served as static HTML through GitHub Pages. Review the exact
diff, stage only intended files, and push the approved commit to the branch used
by GitHub Pages. After deployment:

1. verify the homepage, app-download page, blog hub, changed articles, and
   navigation;
2. confirm GA4 collection and relevant events;
3. inspect changed canonical URLs in Google Search Console; and
4. resubmit the existing sitemap when URL coverage changed.
