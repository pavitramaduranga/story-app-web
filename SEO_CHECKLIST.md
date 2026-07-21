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

## Pre-deployment checks

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
