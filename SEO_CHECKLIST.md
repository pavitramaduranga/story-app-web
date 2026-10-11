# Baboo Stories SEO Checklist

Use this checklist before publishing new pages, publishing blog articles, or
deploying website changes that affect search visibility.

For future article and SEO changes, run the changed page against this checklist
before finishing the work. If a new Google Search Console, Rich Results, or
indexing issue is found, add it to this checklist under the relevant section and
record the pattern under **Previous findings**.

## URL and indexing checklist

- [ ] Use one preferred URL for every page.
- [ ] Never add `index.html` to internal links.
- [ ] Link to the homepage as `/`.
- [ ] Link to directory-based articles with a trailing slash:
  `/blog/article-name/`
- [ ] Do not link to directory-based articles as:
  `/blog/article-name/index.html`
- [ ] Add one self-referencing canonical tag to every indexable page:

  ```html
  <link
    rel="canonical"
    href="https://baboostories.com/blog/article-name/"
  />
  ```

- [ ] Make Open Graph URLs match the canonical URL.
- [ ] Use only canonical URLs in `sitemap.xml`.
- [ ] Do not include `/index.html` URLs in the sitemap.
- [ ] Confirm important pages are not blocked by `robots.txt` or a `noindex`
  directive.
- [ ] Confirm the sitemap includes only live, indexable pages and excludes
  draft, duplicate, redirect-only, or utility pages.

## New blog article checklist

- [ ] Store a directory-based article at `blog/article-name/index.html`.
- [ ] Use `https://baboostories.com/blog/article-name/` as its public URL.
- [ ] Add the clean public URL to `sitemap.xml`.
- [ ] Link to the clean URL from the homepage, blog listing, and related
  articles.
- [ ] Check that the title, description, canonical URL, Open Graph URL, and
  structured data all describe the same page.
- [ ] Use one clear `<h1>` that matches the article topic and avoid repeating
  another full-size page title in the body.
- [ ] Write a unique `<title>` and meta description for the article. Keep the
  title specific to the search intent and the description useful as a search
  snippet.
- [ ] Make the first screen confirm the page topic quickly: title, intro,
  hero image, and visible body content should all match the target query.
- [ ] Use descriptive internal links to relevant Baboo articles and pages.
  Avoid vague anchor text such as "click here".
- [ ] Add a short related-article or next-step path near the end so Google and
  readers can discover the next useful page.
- [ ] Use descriptive image filenames and `alt` text that explain the image in
  context. Do not stuff keywords into `alt` text.
- [ ] Confirm hero and article images resolve on the deployed URL and are not
  blocked, missing, or accidentally too large for normal page loading.
- [ ] In Article structured data, use timezone-aware ISO 8601 datetime values
  for `datePublished` and `dateModified`, not date-only values. Prefer the Sri
  Lanka timezone offset:

  ```json
  "datePublished": "2026-07-11T00:00:00+05:30",
  "dateModified": "2026-07-11T00:00:00+05:30"
  ```

- [ ] In Article structured data, include an `author.url` value when the author
  is Baboo Stories:

  ```json
  "author": {
    "@type": "Organization",
    "name": "Baboo Stories",
    "url": "https://baboostories.com/"
  }
  ```

## Repeatable article refresh validation

Use this section whenever an existing article is updated, including when the
brief or suggested copy was produced by Claude, ChatGPT, another AI tool, or a
third party. Treat the supplied analysis as a draft specification: verify every
claim and requested change against the current repository before accepting it.

### 1. Establish the baseline and protected content

- [ ] Record the target file, public canonical URL, requested modification date,
  and related `sitemap.xml` entry before editing.
- [ ] Identify content that must not change, such as story text, rhyme lyrics,
  medical or pediatrician guidance, CTA blocks, canonical URLs, and existing
  in-page image sources.
- [ ] Inspect the current page instead of assuming the brief accurately
  describes its title, headings, dates, FAQ, card position, footer, or schema.
- [ ] After editing, compare protected sections with the pre-edit Git version
  and confirm that only explicitly authorized text changed.

### 2. Metadata, headings, and URL consistency

- [ ] Confirm `<title>`, `og:title`, `twitter:title`, `<h1>`, JSON-LD headline,
  and breadcrumb name follow the requested relationship. They do not need to be
  identical unless the brief requires it.
- [ ] Encode literal ampersands in HTML attributes and visible HTML as `&amp;`.
- [ ] Keep the canonical URL unchanged during a content refresh unless a URL
  migration is explicitly approved.
- [ ] Confirm `og:url`, `mainEntityOfPage`, breadcrumb URLs, internal links, and
  the sitemap use the canonical public URL format.
- [ ] Add or retain `<meta name="robots" content="index, follow,
  max-image-preview:large" />` on indexable articles when that is the site
  pattern.
- [ ] Check that the blog-hub card title, description, button, and destination
  are still accurate after an article title or scope changes.

### 3. Visible dates, JSON-LD, and sitemap dates

- [ ] Show the requested updated date in the visible `.meta` line.
- [ ] Set Article `dateModified` to the same calendar date using the full
  timezone-aware value, for example `2026-10-11T00:00:00+05:30`.
- [ ] Set the matching sitemap `<lastmod>` to the same date in `YYYY-MM-DD`
  format and confirm exactly one sitemap entry exists for the canonical URL.
- [ ] Update dates only when the page received a meaningful content or
  technical improvement; do not manufacture freshness signals.

### 4. Structured-data and visible-content parity

- [ ] Parse every `application/ld+json` block as JSON after editing.
- [ ] If `FAQPage` schema is present, confirm every schema question appears in
  the visible FAQ and every answer matches its visible answer word for word.
- [ ] Remove stale schema questions that are not visible and do not add schema
  solely to hide extra content from readers.
- [ ] Confirm Article image URLs exist and represent the page appropriately.
- [ ] Validate the deployed page with Google Rich Results Test after publishing;
  source inspection alone cannot confirm Google's rendered result.

### 5. Images and loading behavior

- [ ] Use `fetchpriority="high"` only for the primary above-the-fold image.
- [ ] Use `loading="lazy"` for below-the-fold article images unless there is a
  measured reason not to.
- [ ] Prefer a landscape social-sharing image that crops well for Open Graph and
  Twitter previews; confirm `og:image`, `twitter:image`, and the primary
  JSON-LD image are intentionally aligned.
- [ ] Give `og:image:alt` accurate contextual wording and verify the referenced
  local image asset exists.
- [ ] Do not silently replace in-page screenshots or illustrations when the
  brief authorizes only social-image changes.

### 6. Content quality, safety, and claims

- [ ] Check the opening paragraphs for missing context, broken transitions, or
  copy that assumes a sentence was present when it is not.
- [ ] Avoid guilt-based labels and blame. Prefer language such as “common
  struggles,” “gentle options,” and “what to try.”
- [ ] Hedge developmental, educational, sleep, health, and behavioral claims
  when evidence supports possibility rather than certainty (`can help`, `may`,
  or `is associated with`).
- [ ] Preserve medical disclaimers and advice to contact a qualified clinician
  unless an evidence-backed edit is explicitly requested.
- [ ] Add credible sources near guidance claims, keep original website content
  clearly distinguished from app content, and never imply clinical validation.
- [ ] Check physical activity instructions for practical safety wording,
  especially circling, rocking, jumping, arches, and falling-down actions.

### 7. Navigation and internal linking

- [ ] Confirm each jump-link `href="#id"` has exactly one matching unique ID.
- [ ] Add descriptive contextual links where they genuinely help the reader;
  avoid duplicating links only for keyword repetition.
- [ ] Include a useful “Read next” or related-reading path before the final CTA
  when appropriate.
- [ ] Verify all new local links resolve and use the site's canonical URL style.
- [ ] When reordering the blog hub, move complete `<article class="card">`
  blocks only, then confirm the card count and unique destination count are
  unchanged and all unselected cards retain their prior relative order.

### 8. Page-template consistency

- [ ] Compare the footer and navigation script with the current approved
  reference page when a consistency update is requested.
- [ ] Confirm the dynamic copyright year uses
  `<span id="current-year"></span>` where that is the current template.
- [ ] Preserve or add the expected `data-content-slug` and
  `data-content-topic` attributes used by page analytics and CTA tracking.
- [ ] Confirm CTA data attributes, wording, store destinations, and blocks are
  unchanged when the brief says to leave CTAs alone.

### 9. Required completion evidence

- [ ] Run `node scripts/validate-seo.mjs` and investigate every relevant error.
- [ ] Run `git diff --check`.
- [ ] Review the final diff and confirm only intended files and lines changed.
- [ ] Record counts where useful: H1s, cards, FAQ items, jump targets,
  `fetchpriority="high"` images, sitemap entries, and changed protected blocks.
- [ ] Report tests honestly. Distinguish source checks from deployed-page,
  Search Console, Rich Results, analytics, and performance validation.

### Article refresh validation record

Copy this compact record into the task notes or change log for each batch:

| Field | Result |
| --- | --- |
| Page and canonical URL |  |
| Requested update date |  |
| Protected content checked |  |
| Metadata and H1 checked |  |
| JSON-LD parsed and visible FAQ matched |  |
| Image priority and social image checked |  |
| Internal links and jump targets checked |  |
| Sitemap entry and date checked |  |
| Blog-hub card checked |  |
| CTA/footer/script consistency checked |  |
| Validation commands and result |  |
| Deployment/Search Console follow-up |  |

## Pre-deployment checks

Run the repo validation script first. It checks title and description lengths,
canonical/sitemap alignment, duplicate canonicals, one-H1 structure, JSON-LD
parseability, local internal links, accidental `/index.html` links, and image
files larger than 300 KB that should be optimized before use on SEO pages:

```powershell
node scripts/validate-seo.mjs
```

Run this PowerShell check from the repository root. The result should be `0`:

```powershell
$matches = Get-ChildItem -Recurse -Filter *.html |
  Select-String -Pattern 'href="[^"]*index\.html[^"]*"'
$matches.Count
```

Check that every HTML page contains a canonical tag:

```powershell
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
  $html = Get-Content -Raw -LiteralPath $_.FullName
  if ($html -notmatch 'rel="canonical"') {
    Write-Output "Missing canonical: $($_.FullName)"
  }
}
```

Check Article structured data for Google Search/Rich Results warnings:

```powershell
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
  $html = Get-Content -Raw -LiteralPath $_.FullName
  if ($html -match '"@type"\s*:\s*"(Article|BlogPosting)"') {
    if ($html -match '"date(Published|Modified)"\s*:\s*"\d{4}-\d{2}-\d{2}"') {
      Write-Output "Date missing timezone: $($_.FullName)"
    }
    if ($html -match '"author"\s*:\s*\{[^}]*"@type"\s*:\s*"Organization"' -and
        $html -notmatch '"author"\s*:\s*\{[^}]*"url"\s*:') {
      Write-Output "Author missing url: $($_.FullName)"
    }
  }
}
```

- [ ] Confirm the `index.html` link check returns `0`.
- [ ] Confirm the canonical check reports no missing tags.
- [ ] Confirm the Article structured data check reports no missing timezones or
  author URLs.
- [ ] Inspect `sitemap.xml` for duplicate or non-canonical URLs.
- [ ] Test homepage, navigation, blog cards, and related-article links.
- [ ] Run `git diff --check`.

## Search Console follow-up

- [ ] Deploy the changes before starting validation.
- [ ] Inspect the clean canonical URL in Google Search Console.
- [ ] If the Performance > Pages report shows both a clean URL and an
  `/index.html` URL for the same query, treat it as a canonical duplicate
  signal first, not as two separate articles competing with each other.
- [ ] Inspect the `/index.html` URL in Search Console and confirm Google sees
  the clean trailing-slash URL as the canonical.
- [ ] Confirm the user-declared canonical matches Google's selected canonical.
- [ ] Test the deployed article with Google's Rich Results Test or Search
  Console URL inspection and fix structured-data warnings that are practical to
  fix.
- [ ] Resubmit the existing sitemap when its URLs are already correct.
- [ ] Click **Validate Fix** after deployment.
- [ ] Allow time for Google to recrawl the affected URLs.

## Previous finding: explicit `index.html` links

Google Search Console reported these URLs as **Alternate page with proper
canonical tag**:

- `https://baboostories.com/index.html`
- `https://baboostories.com/blog/best-bedtime-story-app-for-toddlers/index.html`
- `https://baboostories.com/blog/toddler-wont-sleep-bedtime-story-routine/index.html`
- `https://baboostories.com/blog/are-scary-stories-good-for-toddlers/index.html`

The canonical tags and sitemap used clean URLs, but internal links still
contained `index.html`. That allowed Google to discover duplicate URL versions.
The internal links were changed to `/` and clean trailing-slash article URLs.

Because this repository is served as a static GitHub Pages site, repository
files cannot define normal server-side `301` redirects. Preventing discovery of
the duplicate URLs through internal links, canonical tags, and the sitemap is
therefore especially important.

When Search Console Performance shows both the clean URL and the `/index.html`
URL under the same query, those two rows are usually the same page being reported
under two URL variants. They are not two separate articles with different search
intent. The practical fix is still the canonical hygiene checklist: clean
internal links, a self-referencing canonical on the clean URL, matching Open
Graph and structured-data URLs, and only clean URLs in `sitemap.xml`.

## Previous finding: Article structured data warnings

Google Search/Rich Results can report optional warnings when Article structured
data uses date-only values such as `"2026-07-11"` for `datePublished` or
`dateModified`. Use a full datetime with timezone, such as
`"2026-07-11T00:00:00+05:30"`, to avoid invalid datetime and missing timezone
warnings.

Google can also report **Missing field "url"** for the Article `author`.
When the author is Baboo Stories, include the organization URL:
`"url": "https://baboostories.com/"`.
